import express from 'express';
import { AIReceptionistService } from '../services/aiReceptionistService';
import { CallContext, ReceptionistConfig } from '../types/AIReceptionist';
import { logger } from '../utils/logger';

const router = express.Router();

const receptionistConfig: ReceptionistConfig = {
  businessName: process.env.BUSINESS_NAME || 'Default Business',
  businessHours: {
    start: '09:00',
    end: '17:00',
    timezone: 'America/New_York'
  },
  greeting: 'Thank you for calling. How may I assist you today?',
  transferNumbers: {
    default: process.env.DEFAULT_TRANSFER_NUMBER || '',
    emergency: process.env.EMERGENCY_TRANSFER_NUMBER || ''
  },
  voicemailEnabled: true
};

const aiReceptionist = new AIReceptionistService(receptionistConfig);

router.post('/incoming-call', async (req, res) => {
  try {
    const callContext: CallContext = {
      callSid: req.body.CallSid,
      from: req.body.From,
      to: req.body.To,
      direction: 'inbound',
      status: req.body.CallStatus
    };

    const response = await aiReceptionist.handleIncomingCall(callContext);

    res.type('text/xml');
    res.send(`
      <Response>
        <Say>${response.message}</Say>
      </Response>
    `);
  } catch (error) {
    logger.error('Error handling incoming call route:', error);
    res.type('text/xml');
    res.send(`
      <Response>
        <Say>We're sorry, but we're experiencing technical difficulties. Please try again later.</Say>
      </Response>
    `);
  }
});

router.post('/call-status', (req, res) => {
  try {
    logger.info('Call status update:', {
      callSid: req.body.CallSid,
      status: req.body.CallStatus,
      duration: req.body.CallDuration
    });
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling call status update:', error);
    res.sendStatus(500);
  }
});

router.post('/recording', (req, res) => {
  try {
    logger.info('Recording received:', {
      callSid: req.body.CallSid,
      recordingUrl: req.body.RecordingUrl,
      duration: req.body.RecordingDuration
    });
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling recording webhook:', error);
    res.sendStatus(500);
  }
});

export default router;
