const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Twilio SMS Details
  twilioMessageSid: {
    type: String,
    required: true,
    unique: true
  },
  
  // Message Information
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  
  body: {
    type: String,
    required: true
  },
  
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true
  },
  
  status: {
    type: String,
    enum: ['queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received'],
    default: 'queued'
  },
  
  // Threading
  threadId: String, // For grouping related messages
  
  // Contact Reference
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  // AI Processing
  aiProcessed: {
    type: Boolean,
    default: false
  },
  
  aiAnalysis: {
    intent: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    keywords: [String],
    requiresResponse: Boolean,
    suggestedResponse: String,
    confidence: Number // 0-1 scale
  },
  
  // Auto Response
  isAutoResponse: {
    type: Boolean,
    default: false
  },
  
  autoResponseTrigger: String,
  
  // Message Type
  messageType: {
    type: String,
    enum: ['text', 'media', 'appointment', 'invoice', 'follow-up'],
    default: 'text'
  },
  
  // Media Attachments
  media: [{
    url: String,
    type: String, // image, video, audio, document
    filename: String,
    size: Number
  }],
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  
  // Cost Information
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Error Information
  errorCode: String,
  errorMessage: String,
  
  // Metadata
  metadata: {
    carrier: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  
  // Flags
  isImportant: {
    type: Boolean,
    default: false
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Campaign Information (for bulk SMS)
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Related Call
  relatedCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },
  
  // Related Appointment
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Notes
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
smsSchema.index({ userId: 1, createdAt: -1 });
smsSchema.index({ twilioMessageSid: 1 });
smsSchema.index({ from: 1 });
smsSchema.index({ to: 1 });
smsSchema.index({ threadId: 1 });
smsSchema.index({ direction: 1 });
smsSchema.index({ status: 1 });

// Virtual for message preview
smsSchema.virtual('preview').get(function() {
  return this.body.length > 50 ? `${this.body.substring(0, 50)}...` : this.body;
});

// Method to mark as read
smsSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to get thread messages
smsSchema.statics.getThreadMessages = function(threadId) {
  return this.find({ threadId })
    .sort({ createdAt: 1 })
    .populate('contact', 'firstName lastName phone');
};

module.exports = mongoose.model('SMS', smsSchema);