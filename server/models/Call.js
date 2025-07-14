const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Twilio Call Details
  twilioCallSid: {
    type: String,
    required: true,
    unique: true
  },
  
  // Call Information
  from: {
    type: String,
    required: true
  },
  to: {
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
    enum: ['queued', 'initiated', 'ringing', 'answered', 'completed', 'busy', 'failed', 'no-answer', 'canceled'],
    default: 'queued'
  },
  
  // Call Duration and Timing
  startTime: Date,
  endTime: Date,
  duration: Number, // in seconds
  
  // AI Processing
  transcript: String,
  
  aiSummary: {
    summary: String,
    intent: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    keywords: [String],
    actionItems: [String],
    followUpRequired: Boolean
  },
  
  // Call Handling
  handledBy: {
    type: String,
    enum: ['ai', 'human', 'voicemail'],
    default: 'ai'
  },
  
  transferredTo: String,
  transferReason: String,
  
  // Recordings
  recordingUrl: String,
  recordingDuration: Number,
  
  // Customer Information
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  isNewCustomer: {
    type: Boolean,
    default: false
  },
  
  // Call Quality
  quality: {
    rating: Number, // 1-5 scale
    feedback: String
  },
  
  // Cost Information
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    callerId: String
  },
  
  // Flags
  isImportant: {
    type: Boolean,
    default: false
  },
  
  isArchived: {
    type: Boolean,
    default: false
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
  }],
  
  // Follow-up
  followUp: {
    scheduled: Boolean,
    scheduledFor: Date,
    completed: Boolean,
    completedAt: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
callSchema.index({ userId: 1, createdAt: -1 });
callSchema.index({ twilioCallSid: 1 });
callSchema.index({ from: 1 });
callSchema.index({ status: 1 });
callSchema.index({ direction: 1 });

// Virtual for call duration formatting
callSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Call', callSchema);