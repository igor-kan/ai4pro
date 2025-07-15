import { CallStatus } from 'twilio/lib/rest/api/v2010/account/call';

export interface CallContext {
  callSid: string;
  from: string;
  to: string;
  direction: 'inbound' | 'outbound';
  status: CallStatus;
  duration?: number;
  recordingUrl?: string;
  transcription?: string;
}

export interface AIResponse {
  message: string;
  intent: string;
  confidence: number;
  actions: AIAction[];
  context: Record<string, any>;
}

export interface AIAction {
  type: 'schedule' | 'transfer' | 'message' | 'voicemail' | 'end';
  payload: Record<string, any>;
}

export interface ReceptionistConfig {
  businessName: string;
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  greeting: string;
  transferNumbers: Record<string, string>;
  voicemailEnabled: boolean;
}
