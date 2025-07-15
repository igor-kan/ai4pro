const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contact Information
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  // Appointment Details
  title: {
    type: String,
    required: true
  },
  
  description: String,
  
  // Date and Time
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    required: true
  },
  
  timeZone: {
    type: String,
    default: 'UTC'
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['in-person', 'phone', 'video', 'other'],
      default: 'phone'
    },
    address: String,
    phone: String,
    videoLink: String,
    notes: String
  },
  
  // Booking Information
  bookedBy: {
    type: String,
    enum: ['ai', 'customer', 'admin'],
    default: 'ai'
  },
  
  bookingSource: {
    type: String,
    enum: ['phone-call', 'sms', 'website', 'manual'],
    default: 'phone-call'
  },
  
  // Related Records
  relatedCall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },
  
  relatedSms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SMS'
  },
  
  // Google Calendar Integration
  googleCalendar: {
    eventId: String,
    calendarId: String,
    meetLink: String,
    synced: {
      type: Boolean,
      default: false
    }
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call'],
      required: true
    },
    time: {
      type: Number, // minutes before appointment
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  
  // Service Details
  service: {
    name: String,
    duration: Number, // in minutes
    price: Number,
    description: String
  },
  
  // Customer Information
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    notes: String
  },
  
  // AI Generated Information
  aiGenerated: {
    summary: String,
    suggestedActions: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // Cancellation/Rescheduling
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'business', 'system']
    },
    cancelledAt: Date,
    refundIssued: Boolean
  },
  
  rescheduling: {
    previousTime: Date,
    reason: String,
    rescheduledBy: {
      type: String,
      enum: ['customer', 'business', 'system']
    },
    rescheduledAt: Date
  },
  
  // Follow-up
  followUp: {
    required: Boolean,
    scheduled: Boolean,
    scheduledFor: Date,
    completed: Boolean,
    completedAt: Date,
    notes: String
  },
  
  // Payment
  payment: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    stripePaymentIntentId: String
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
  
  // Metadata
  metadata: {
    source: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ userId: 1, startTime: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ contact: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });
appointmentSchema.index({ 'googleCalendar.eventId': 1 });

// Virtual for duration
appointmentSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return 0;
  return Math.round((this.endTime - this.startTime) / (1000 * 60)); // duration in minutes
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  if (!this.startTime) return '';
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };
  
  return this.startTime.toLocaleString('en-US', options);
});

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function() {
  return this.startTime > new Date() && this.status === 'scheduled';
};

// Method to check if appointment is overdue
appointmentSchema.methods.isOverdue = function() {
  return this.endTime < new Date() && this.status === 'scheduled';
};

// Method to send reminder
appointmentSchema.methods.sendReminder = function(reminderType) {
  // This would integrate with your SMS/Email service
  console.log(`Sending ${reminderType} reminder for appointment ${this._id}`);
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function(userId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    userId,
    startTime: { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'confirmed'] }
  }).sort({ startTime: 1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);