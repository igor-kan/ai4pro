import { Router } from 'express';
import { phoneService } from '../services/phoneService';
import { authenticateJWT } from '../middleware/auth';
import { validatePhoneNumber } from '../middleware/validation';
import { logger } from '../utils/logger';
import { CallStatusCallback, MessageStatusCallback } from '../types/Phone';

const router = Router();

// Initiate a new call
router.post('/call', 
  authenticateJWT,
  validatePhoneNumber('to'),
  async (req, res) => {
    try {
      const { to, url } = req.body;
      const from = process.env.TWILIO_PHONE_NUMBER!;

      const call = await phoneService.makeCall(to, from, url);
      res.json(call);
    } catch (error) {
      logger.error('Error initiating call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
});

// Send SMS
router.post('/sms',
  authenticateJWT,
  validatePhoneNumber('to'),
  async (req, res) => {
    try {
      const { to, body } = req.body;
      const from = process.env.TWILIO_PHONE_NUMBER!;

      const message = await phoneService.sendSMS(to, from, body);
      res.json(message);
    } catch (error) {
      logger.error('Error sending SMS:', error);
      res.status(500).json({ error: 'Failed to send SMS' });
    }
});

// Get call details
router.get('/call/:callSid',
  authenticateJWT,
  async (req, res) => {
    try {
      const { callSid } = req.params;
      const call = await phoneService.getCall(callSid);
      res.json(call);
    } catch (error) {
      logger.error('Error fetching call:', error);
      res.status(500).json({ error: 'Failed to fetch call details' });
    }
});

// End active call
router.post('/call/:callSid/end',
  authenticateJWT,
  async (req, res) => {
    try {
      const { callSid } = req.params;
      await phoneService.endCall(callSid);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error ending call:', error);
      res.status(500).json({ error: 'Failed to end call' });
    }
});

// Call status webhook
router.post('/call-status', (req, res) => {
  try {
    const statusCallback: CallStatusCallback = req.body;
    logger.info('Call status update:', statusCallback);
    // Emit status update via WebSocket if needed
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error processing call status:', error);
    res.sendStatus(500);
  }
});

// Message status webhook
router.post('/message-status', (req, res) => {
  try {
    const statusCallback: MessageStatusCallback = req.body;
    logger.info('Message status update:', statusCallback);
    // Emit status update via WebSocket if needed
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error processing message status:', error);
    res.sendStatus(500);
  }
});

export default router;