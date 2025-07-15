const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: String,
  avatar: String,
  
  // Business Settings
  businessHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  
  // AI Settings
  aiSettings: {
    greeting: {
      type: String,
      default: "Hello! Thank you for calling. How can I help you today?"
    },
    voicemail: {
      type: String,
      default: "I'm sorry, but I'm not available right now. Please leave a message and I'll get back to you as soon as possible."
    },
    personality: {
      type: String,
      enum: ['professional', 'friendly', 'casual', 'formal'],
      default: 'professional'
    },
    language: {
      type: String,
      default: 'en'
    },
    transferKeyword: {
      type: String,
      default: 'transfer'
    },
    appointmentBooking: {
      type: Boolean,
      default: true
    },
    smsAutoResponse: {
      type: Boolean,
      default: true
    }
  },
  
  // Twilio Configuration
  twilioConfig: {
    phoneNumber: String,
    sipDomain: String,
    forwardingNumber: String
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'essentials', 'premium'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing', 'cancel_at_period_end'],
      default: 'free'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialStart: Date,
    trialEnd: Date,
    cancelAtPeriodEnd: Boolean,
    lastPayment: Date,
    lastPaymentFailed: Date,
    canceledAt: Date
  },
  
  // Stripe
  stripeCustomerId: String,
  
  // Phone Number
  phoneNumber: String,
  
  // Features
  features: {
    aiReceptionist: { type: Boolean, default: false },
    unlimitedSMS: { type: Boolean, default: false },
    callTranscription: { type: Boolean, default: false },
    crmIntegration: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    customGreetings: { type: Boolean, default: false }
  },
  
  // Marketing Campaigns
  marketingCampaigns: [{
    id: String,
    name: String,
    type: { type: String, enum: ['email', 'sms', 'mixed', 'social'] },
    status: { type: String, enum: ['draft', 'active', 'paused', 'completed'] },
    startDate: Date,
    endDate: Date,
    targetSegment: String,
    totalContacts: Number,
    sentCount: Number,
    openRate: Number,
    clickRate: Number,
    conversionRate: Number,
    budget: Number,
    spent: Number,
    content: {
      subject: String,
      message: String,
      callToAction: String,
      templates: [String]
    },
    schedule: {
      frequency: { type: String, enum: ['immediate', 'daily', 'weekly', 'monthly'] },
      time: String,
      daysOfWeek: [String]
    },
    automation: {
      enabled: Boolean,
      triggers: [String],
      followUpActions: [String]
    },
    analytics: {
      sends: [{ date: Date, count: Number }],
      opens: [{ date: Date, count: Number }],
      clicks: [{ date: Date, count: Number }],
      conversions: [{ date: Date, count: Number }]
    },
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Ad Campaigns
  adCampaigns: [{
    id: String,
    name: String,
    platform: { type: String, enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter'] },
    status: { type: String, enum: ['active', 'paused', 'draft', 'completed'] },
    budget: Number,
    spent: Number,
    impressions: Number,
    clicks: Number,
    conversions: Number,
    startDate: Date,
    endDate: Date,
    targetAudience: String,
    adContent: {
      headline: String,
      description: String,
      imageUrl: String,
      callToAction: String
    },
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Integrations
  integrations: {
    googleCalendar: {
      accessToken: String,
      refreshToken: String,
      calendarId: String
    },
    stripe: {
      accountId: String,
      connected: Boolean
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);