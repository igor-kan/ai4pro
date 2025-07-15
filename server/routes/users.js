const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      businessName,
      phoneNumber,
      avatar,
      timezone
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (businessName) user.businessName = businessName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (avatar) user.avatar = avatar;
    if (timezone) user.timezone = timezone;

    user.updatedAt = new Date();
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/business-settings
// @desc    Get business settings
// @access  Private
router.get('/business-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('businessSettings');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.businessSettings || {});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/business-settings
// @desc    Update business settings
// @access  Private
router.put('/business-settings', auth, async (req, res) => {
  try {
    const {
      businessHours,
      phoneNumber,
      businessAddress,
      website,
      industry,
      services,
      autoResponse,
      callForwarding,
      voicemailGreeting
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update business settings
    const businessSettings = user.businessSettings || {};
    
    if (businessHours) businessSettings.businessHours = businessHours;
    if (phoneNumber) businessSettings.phoneNumber = phoneNumber;
    if (businessAddress) businessSettings.businessAddress = businessAddress;
    if (website) businessSettings.website = website;
    if (industry) businessSettings.industry = industry;
    if (services) businessSettings.services = services;
    if (autoResponse) businessSettings.autoResponse = autoResponse;
    if (callForwarding) businessSettings.callForwarding = callForwarding;
    if (voicemailGreeting) businessSettings.voicemailGreeting = voicemailGreeting;

    user.businessSettings = businessSettings;
    user.updatedAt = new Date();
    await user.save();

    res.json(user.businessSettings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/notification-settings
// @desc    Get notification settings
// @access  Private
router.get('/notification-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationSettings');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.notificationSettings || {});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/notification-settings
// @desc    Update notification settings
// @access  Private
router.put('/notification-settings', auth, async (req, res) => {
  try {
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      callNotifications,
      appointmentReminders,
      marketingEmails
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update notification settings
    const notificationSettings = user.notificationSettings || {};
    
    if (emailNotifications !== undefined) notificationSettings.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) notificationSettings.smsNotifications = smsNotifications;
    if (pushNotifications !== undefined) notificationSettings.pushNotifications = pushNotifications;
    if (callNotifications !== undefined) notificationSettings.callNotifications = callNotifications;
    if (appointmentReminders !== undefined) notificationSettings.appointmentReminders = appointmentReminders;
    if (marketingEmails !== undefined) notificationSettings.marketingEmails = marketingEmails;

    user.notificationSettings = notificationSettings;
    user.updatedAt = new Date();
    await user.save();

    res.json(user.notificationSettings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    const { avatarData } = req.body;

    if (!avatarData) {
      return res.status(400).json({ error: 'Avatar data is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In a real implementation, you would upload to a file storage service
    // For now, just store the base64 data
    user.avatar = avatarData;
    user.updatedAt = new Date();
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(confirmPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // In a real implementation, you would:
    // 1. Cancel subscriptions
    // 2. Delete associated data (calls, SMS, contacts, etc.)
    // 3. Send confirmation email
    // 4. Log the deletion for audit purposes

    await user.deleteOne();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // In a real implementation, you would have an Activity model
    // For now, return mock activity data
    const activities = [
      {
        id: '1',
        type: 'login',
        description: 'User logged in',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: '2',
        type: 'settings_update',
        description: 'Updated business settings',
        timestamp: new Date(Date.now() - 60000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      }
    ];

    res.json({
      activities,
      totalPages: 1,
      currentPage: page,
      total: activities.length
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let dateFilter = new Date();
    switch (timeframe) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
    }

    // Get usage statistics from various models
    const Call = require('../models/Call');
    const SMS = require('../models/SMS');
    const Contact = require('../models/Contact');

    const [callsUsage, smsUsage, contactsUsage] = await Promise.all([
      Call.countDocuments({
        userId: req.user.id,
        createdAt: { $gte: dateFilter }
      }),
      SMS.countDocuments({
        userId: req.user.id,
        createdAt: { $gte: dateFilter }
      }),
      Contact.countDocuments({
        userId: req.user.id,
        createdAt: { $gte: dateFilter }
      })
    ]);

    const usage = {
      calls: callsUsage,
      sms: smsUsage,
      contacts: contactsUsage,
      period: timeframe,
      // Add limits based on subscription plan
      limits: {
        calls: 1000,  // Example limits
        sms: 2000,
        contacts: 5000
      }
    };

    res.json(usage);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/users/export-data
// @desc    Export all user data
// @access  Private
router.post('/export-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In a real implementation, you would:
    // 1. Queue a background job to compile all user data
    // 2. Send an email when the export is ready
    // 3. Provide a secure download link

    res.json({ 
      message: 'Data export requested. You will receive an email when your export is ready.',
      exportId: Date.now().toString()
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;