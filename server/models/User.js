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
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid'],
      default: 'active'
    },
    currentPeriodEnd: Date
  },
  
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