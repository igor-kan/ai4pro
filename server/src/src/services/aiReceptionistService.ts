import { Anthropic } from '@anthropic-ai/sdk';
import twilio from 'twilio';
import { CallContext, AIResponse, ReceptionistConfig } from '../types/AIReceptionist';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class AIReceptionistService {
  private config: ReceptionistConfig;

  constructor(config: ReceptionistConfig) {
    this.config = config;
  }

  async handleIncomingCall(callContext: CallContext): Promise<AIResponse> {
    try {
      logger.info(`Processing incoming call ${callContext.callSid}`);

      const prompt = this.buildPrompt(callContext);
      
      const completion = await anthropic.messages.create({
        model: 'claude-2',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = this.parseAIResponse(completion.content);
      await this.executeActions(response, callContext);

      return response;
    } catch (error) {
      logger.error('Error handling incoming call:', error);
      throw error;
    }
  }

  private buildPrompt(callContext: CallContext): string {
    return `You are an AI receptionist for ${this.config.businessName}.
    Current call details:
    - From: ${callContext.from}
    - To: ${callContext.to}
    - Status: ${callContext.status}
    
    Business hours: ${this.config.businessHours.start}-${this.config.businessHours.end} ${this.config.businessHours.timezone}
    
    Please handle this call professionally and determine the caller's intent.
    Provide a natural response and appropriate actions.`;
  }

  private parseAIResponse(content: string): AIResponse {
    // Parse Claude's response into structured format
    const response: AIResponse = {
      message: content,
      intent: this.detectIntent(content),
      confidence: 0.9,
      actions: this.determineActions(content),
      context: {}
    };
    return response;
  }

  private detectIntent(content: string): string {
    // Implement intent detection logic
    if (content.toLowerCase().includes('schedule')) return 'schedule_appointment';
    if (content.toLowerCase().includes('emergency')) return 'urgent_transfer';
    return 'general_inquiry';
  }

  private determineActions(content: string): AIAction[] {
    const actions = [];
    // Implement action determination logic
    if (content.toLowerCase().includes('transfer')) {
      actions.push({
        type: 'transfer',
        payload: { number: this.config.transferNumbers.default }
      });
    }
    return actions;
  }

  private async executeActions(response: AIResponse, callContext: CallContext) {
    for (const action of response.actions) {
      try {
        switch (action.type) {
          case 'transfer':
            await this.transferCall(callContext, action.payload.number);
            break;
          case 'voicemail':
            await this.handleVoicemail(callContext);
            break;
          // Implement other action handlers
        }
      } catch (error) {
        logger.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  private async transferCall(callContext: CallContext, number: string) {
    try {
      await twilioClient.calls(callContext.callSid)
        .update({
          twiml: `<Response><Dial>${number}</Dial></Response>`
        });
    } catch (error) {
      logger.error('Error transferring call:', error);
      throw error;
    }
  }

  private async handleVoicemail(callContext: CallContext) {
    try {
      await twilioClient.calls(callContext.callSid)
        .update({
          twiml: `<Response>
            <Say>Please leave a message after the tone.</Say>
            <Record maxLength="120" />
          </Response>`
        });
    } catch (error) {
      logger.error('Error handling voicemail:', error);
      throw error;
    }
  }
}
