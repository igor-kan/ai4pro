const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Information
  firstName: String,
  lastName: String,
  email: String,
  phone: {
    type: String,
    required: true
  },
  
  // Company Information
  company: String,
  jobTitle: String,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Contact Preferences
  preferredContact: {
    type: String,
    enum: ['phone', 'sms', 'email'],
    default: 'phone'
  },
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: ['lead', 'customer', 'vendor', 'partner', 'other'],
    default: 'lead'
  },
  
  // Communication History
  lastCallDate: Date,
  lastSmsDate: Date,
  lastEmailDate: Date,
  
  totalCalls: {
    type: Number,
    default: 0
  },
  
  totalSms: {
    type: Number,
    default: 0
  },
  
  // Customer Value
  lifetimeValue: {
    type: Number,
    default: 0
  },
  
  // AI Insights
  aiInsights: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    interests: [String],
    painPoints: [String],
    preferences: [String],
    lastUpdated: Date
  },
  
  // Relationship Status
  relationshipStatus: {
    type: String,
    enum: ['cold', 'warm', 'hot', 'customer', 'inactive'],
    default: 'cold'
  },
  
  // Custom Fields
  customFields: [{
    name: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean'],
      default: 'text'
    }
  }],
  
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
  
  // Appointments
  upcomingAppointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  
  // Social Media
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  
  // Lead Source
  leadSource: {
    type: String,
    enum: ['website', 'referral', 'social', 'advertising', 'cold-call', 'other'],
    default: 'other'
  },
  
  // Contact Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Do Not Contact preferences
  doNotCall: {
    type: Boolean,
    default: false
  },
  
  doNotSms: {
    type: Boolean,
    default: false
  },
  
  doNotEmail: {
    type: Boolean,
    default: false
  },
  
  // Birthday and Important Dates
  birthday: Date,
  anniversary: Date,
  
  // Time Zone
  timeZone: String,
  
  // Photo
  avatar: String
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ userId: 1, phone: 1 });
contactSchema.index({ userId: 1, email: 1 });
contactSchema.index({ userId: 1, lastName: 1, firstName: 1 });
contactSchema.index({ userId: 1, category: 1 });
contactSchema.index({ userId: 1, tags: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || 'Unknown';
});

// Virtual for display name (with company if available)
contactSchema.virtual('displayName').get(function() {
  const fullName = this.fullName;
  return this.company ? `${fullName} (${this.company})` : fullName;
});

// Method to update AI insights
contactSchema.methods.updateAIInsights = function(insights) {
  this.aiInsights = {
    ...this.aiInsights,
    ...insights,
    lastUpdated: new Date()
  };
};

module.exports = mongoose.model('Contact', contactSchema);