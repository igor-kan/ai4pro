const express = require('express');
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const MessagingResponse = twilio.twiml.MessagingResponse;
const Call = require('../models/Call');
const SMS = require('../models/SMS');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { processWithAI } = require('../services/aiService');
const { findOrCreateContact } = require('../services/contactService');

const router = express.Router();

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Webhook for incoming calls
router.post('/voice', async (req, res) => {
  const twiml = new VoiceResponse();
  
  try {
    const { From, To, CallSid, Direction } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ 'twilioConfig.phoneNumber': To });
    
    if (!user) {
      twiml.say('Sorry, this number is not configured.');
      return res.type('text/xml').send(twiml.toString());
    }
    
    // Create call record
    const callRecord = new Call({
      userId: user._id,
      twilioCallSid: CallSid,
      from: From,
      to: To,
      direction: Direction.toLowerCase(),
      status: 'answered',
      startTime: new Date(),
      handledBy: 'ai'
    });
    
    await callRecord.save();
    
    // Find or create contact
    const contact = await findOrCreateContact(user._id, From);
    callRecord.contact = contact._id;
    await callRecord.save();
    
    // Check business hours
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const businessHours = user.businessHours[dayOfWeek];
    const isBusinessHours = businessHours && businessHours.isOpen && 
                           currentTime >= businessHours.open && 
                           currentTime <= businessHours.close;
    
    if (isBusinessHours) {
      // Business hours greeting
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, user.aiSettings.greeting);
      
      // Gather user input
      const gather = twiml.gather({
        input: 'speech',
        action: '/api/twilio/process-speech',
        method: 'POST',
        speechTimeout: 5,
        speechModel: 'phone_call'
      });
      
      gather.say('Please tell me how I can help you today.');
      
      // If no input, redirect to voicemail
      twiml.redirect('/api/twilio/voicemail');
    } else {
      // After hours - go to voicemail
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, `Thank you for calling. We're currently closed. ${user.aiSettings.voicemail}`);
      
      twiml.record({
        action: '/api/twilio/recording',
        method: 'POST',
        maxLength: 300,
        playBeep: true
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('incoming-call', {
      callId: callRecord._id,
      from: From,
      contact: contact
    });
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('Twilio voice webhook error:', error);
    twiml.say('Sorry, there was an error processing your call.');
    res.type('text/xml').send(twiml.toString());
  }
});

// Process speech input
router.post('/process-speech', async (req, res) => {
  const twiml = new VoiceResponse();
  
  try {
    const { SpeechResult, CallSid } = req.body;
    
    // Find call record
    const callRecord = await Call.findOne({ twilioCallSid: CallSid });
    if (!callRecord) {
      twiml.say('Sorry, I cannot process your request right now.');
      return res.type('text/xml').send(twiml.toString());
    }
    
    // Update transcript
    callRecord.transcript = (callRecord.transcript || '') + ' ' + SpeechResult;
    await callRecord.save();
    
    // Process with AI
    const user = await User.findById(callRecord.userId);
    const aiResponse = await processWithAI(SpeechResult, user, callRecord);
    
    // Handle AI response
    if (aiResponse.action === 'transfer') {
      twiml.say('Let me transfer you to someone who can help.');
      
      if (user.twilioConfig.forwardingNumber) {
        twiml.dial(user.twilioConfig.forwardingNumber);
      } else {
        twiml.say('Sorry, no one is available to take your call right now.');
        twiml.redirect('/api/twilio/voicemail');
      }
    } else if (aiResponse.action === 'appointment') {
      twiml.say(aiResponse.message);
      
      // Redirect to appointment booking flow
      twiml.redirect('/api/twilio/appointment-booking');
    } else if (aiResponse.action === 'information') {
      twiml.say(aiResponse.message);
      
      // Continue conversation
      const gather = twiml.gather({
        input: 'speech',
        action: '/api/twilio/process-speech',
        method: 'POST',
        speechTimeout: 5
      });
      
      gather.say('Is there anything else I can help you with?');
      
      // If no response, end call
      twiml.say('Thank you for calling. Have a great day!');
      twiml.hangup();
    } else {
      twiml.say(aiResponse.message);
      twiml.hangup();
    }
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('Speech processing error:', error);
    twiml.say('Sorry, I had trouble understanding you. Please try again.');
    twiml.redirect('/api/twilio/voicemail');
    res.type('text/xml').send(twiml.toString());
  }
});

// Appointment booking flow
router.post('/appointment-booking', async (req, res) => {
  const twiml = new VoiceResponse();
  
  try {
    const { CallSid, SpeechResult, Digits } = req.body;
    
    // Find call record
    const callRecord = await Call.findOne({ twilioCallSid: CallSid });
    const user = await User.findById(callRecord.userId);
    
    if (!SpeechResult && !Digits) {
      // First time in appointment booking
      twiml.say('I can help you schedule an appointment. What day would work best for you?');
      
      const gather = twiml.gather({
        input: 'speech',
        action: '/api/twilio/appointment-booking',
        method: 'POST',
        speechTimeout: 5
      });
      
      gather.say('Please tell me your preferred day and time.');
    } else {
      // Process appointment request
      const appointmentRequest = SpeechResult || Digits;
      
      // Use AI to parse appointment details
      const aiResponse = await processWithAI(
        `Schedule appointment: ${appointmentRequest}`,
        user,
        callRecord
      );
      
      if (aiResponse.action === 'appointment_confirmed') {
        twiml.say(`Perfect! I've scheduled your appointment for ${aiResponse.appointmentTime}. You'll receive a confirmation text message shortly.`);
        
        // TODO: Create appointment record and send confirmation
        
      } else {
        twiml.say('I\'m sorry, I couldn\'t understand the appointment details. Let me transfer you to someone who can help.');
        
        if (user.twilioConfig.forwardingNumber) {
          twiml.dial(user.twilioConfig.forwardingNumber);
        } else {
          twiml.redirect('/api/twilio/voicemail');
        }
      }
    }
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('Appointment booking error:', error);
    twiml.say('Sorry, there was an error with the appointment booking. Please try again later.');
    twiml.redirect('/api/twilio/voicemail');
    res.type('text/xml').send(twiml.toString());
  }
});

// Voicemail recording
router.post('/voicemail', async (req, res) => {
  const twiml = new VoiceResponse();
  
  try {
    const { CallSid } = req.body;
    
    // Find call record
    const callRecord = await Call.findOne({ twilioCallSid: CallSid });
    const user = await User.findById(callRecord.userId);
    
    twiml.say({
      voice: 'alice'
    }, user.aiSettings.voicemail);
    
    twiml.record({
      action: '/api/twilio/recording',
      method: 'POST',
      maxLength: 300,
      playBeep: true,
      recordingStatusCallback: '/api/twilio/recording-status'
    });
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('Voicemail error:', error);
    twiml.say('Sorry, there was an error. Please try calling again.');
    res.type('text/xml').send(twiml.toString());
  }
});

// Handle recording
router.post('/recording', async (req, res) => {
  const twiml = new VoiceResponse();
  
  try {
    const { CallSid, RecordingUrl, RecordingDuration } = req.body;
    
    // Update call record with recording
    const callRecord = await Call.findOne({ twilioCallSid: CallSid });
    if (callRecord) {
      callRecord.recordingUrl = RecordingUrl;
      callRecord.recordingDuration = parseInt(RecordingDuration);
      callRecord.handledBy = 'voicemail';
      await callRecord.save();
      
      // Emit real-time update
      const io = req.app.get('io');
      io.to(callRecord.userId.toString()).emit('voicemail-received', {
        callId: callRecord._id,
        recordingUrl: RecordingUrl,
        duration: RecordingDuration
      });
    }
    
    twiml.say('Thank you for your message. We\'ll get back to you soon. Goodbye!');
    twiml.hangup();
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('Recording error:', error);
    twiml.say('Thank you for calling. Goodbye!');
    twiml.hangup();
    res.type('text/xml').send(twiml.toString());
  }
});

// Call status updates
router.post('/call-status', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    // Update call record
    const callRecord = await Call.findOne({ twilioCallSid: CallSid });
    if (callRecord) {
      callRecord.status = CallStatus;
      
      if (CallStatus === 'completed') {
        callRecord.endTime = new Date();
        callRecord.duration = parseInt(CallDuration) || 0;
      }
      
      await callRecord.save();
      
      // Update contact last call date
      if (callRecord.contact) {
        await Contact.findByIdAndUpdate(callRecord.contact, {
          lastCallDate: new Date(),
          $inc: { totalCalls: 1 }
        });
      }
      
      // Emit real-time update
      const io = req.app.get('io');
      io.to(callRecord.userId.toString()).emit('call-status-update', {
        callId: callRecord._id,
        status: CallStatus,
        duration: CallDuration
      });
    }
    
    res.sendStatus(200);
    
  } catch (error) {
    console.error('Call status update error:', error);
    res.sendStatus(500);
  }
});

// SMS webhook
router.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();
  
  try {
    const { From, To, Body, MessageSid } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ 'twilioConfig.phoneNumber': To });
    
    if (!user) {
      return res.sendStatus(404);
    }
    
    // Create SMS record
    const smsRecord = new SMS({
      userId: user._id,
      twilioMessageSid: MessageSid,
      from: From,
      to: To,
      body: Body,
      direction: 'inbound',
      status: 'received'
    });
    
    // Find or create contact
    const contact = await findOrCreateContact(user._id, From);
    smsRecord.contact = contact._id;
    
    await smsRecord.save();
    
    // Process with AI for auto-response
    if (user.aiSettings.smsAutoResponse) {
      const aiResponse = await processWithAI(Body, user, null, smsRecord);
      
      if (aiResponse.shouldRespond) {
        twiml.message(aiResponse.message);
        
        // Save auto-response
        const autoResponse = new SMS({
          userId: user._id,
          twilioMessageSid: `auto-${Date.now()}`,
          from: To,
          to: From,
          body: aiResponse.message,
          direction: 'outbound',
          status: 'sent',
          isAutoResponse: true,
          contact: contact._id
        });
        
        await autoResponse.save();
      }
    }
    
    // Update contact last SMS date
    await Contact.findByIdAndUpdate(contact._id, {
      lastSmsDate: new Date(),
      $inc: { totalSms: 1 }
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('sms-received', {
      smsId: smsRecord._id,
      from: From,
      body: Body,
      contact: contact
    });
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.sendStatus(500);
  }
});

// SMS status updates
router.post('/sms-status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;
    
    // Update SMS record
    await SMS.findOneAndUpdate(
      { twilioMessageSid: MessageSid },
      { status: MessageStatus }
    );
    
    res.sendStatus(200);
    
  } catch (error) {
    console.error('SMS status update error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;