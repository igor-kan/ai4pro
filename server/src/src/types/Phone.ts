export type CallStatus = 
  | 'queued'
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no-answer'
  | 'canceled';

export type CallDirection = 'inbound' | 'outbound-api' | 'outbound-dial';

export type MessageStatus =
  | 'accepted'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'delivered'
  | 'undelivered';

export interface Call {
  sid: string;
  status: CallStatus;
  from: string;
  to: string;
  direction: CallDirection;
  duration: string;
  price: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  sid: string;
  status: MessageStatus;
  from: string;
  to: string;
  body: string;
  price: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallStatusCallback {
  CallSid: string;
  CallStatus: CallStatus;
  From: string;
  To: string;
  Direction: CallDirection;
  Duration?: string;
  Timestamp: string;
}

export interface MessageStatusCallback {
  MessageSid: string;
  MessageStatus: MessageStatus;
  From: string;
  To: string;
  Body: string;
  Timestamp: string;
}