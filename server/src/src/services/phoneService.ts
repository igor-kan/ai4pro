import { Twilio } from 'twilio';
import { CallInstance, MessageInstance } from 'twilio/lib/rest/api/v2010/account/call';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Call, Message, CallStatus, CallDirection } from '../types/Phone';

class PhoneService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async makeCall(to: string, from: string, url: string): Promise<Call> {
    try {
      const call = await this.client.calls.create({
        to,
        from,
        url,
        statusCallback: `${config.baseUrl}/api/phone/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });

      return this.formatCall(call);
    } catch (error) {
      logger.error('Error making call:', error);
      throw new Error('Failed to initiate call');
    }
  }

  async sendSMS(to: string, from: string, body: string): Promise<Message> {
    try {
      const message = await this.client.messages.create({
        to,
        from,
        body,
        statusCallback: `${config.baseUrl}/api/phone/message-status`
      });

      return this.formatMessage(message);
    } catch (error) {
      logger.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async getCall(callSid: string): Promise<Call> {
    try {
      const call = await this.client.calls(callSid).fetch();
      return this.formatCall(call);
    } catch (error) {
      logger.error('Error fetching call:', error);
      throw new Error('Failed to fetch call details');
    }
  }

  async endCall(callSid: string): Promise<void> {
    try {
      await this.client.calls(callSid)
        .update({ status: 'completed' });
    } catch (error) {
      logger.error('Error ending call:', error);
      throw new Error('Failed to end call');
    }
  }

  private formatCall(call: CallInstance): Call {
    return {
      sid: call.sid,
      status: call.status as CallStatus,
      from: call.from,
      to: call.to,
      direction: call.direction as CallDirection,
      duration: call.duration,
      price: call.price,
      createdAt: new Date(call.dateCreated),
      updatedAt: new Date(call.dateUpdated)
    };
  }

  private formatMessage(message: MessageInstance): Message {
    return {
      sid: message.sid,
      status: message.status,
      from: message.from,
      to: message.to,
      body: message.body,
      price: message.price,
      createdAt: new Date(message.dateCreated),
      updatedAt: new Date(message.dateUpdated)
    };
  }
}

export const phoneService = new PhoneService();