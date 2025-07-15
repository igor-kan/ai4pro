const express = require('express');
const SMS = require('../models/SMS');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sms
// @desc    Get all SMS messages for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, direction, search } = req.query;
    
    let query = { userId: req.user.id };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by direction
    if (direction && direction !== 'all') {
      query.direction = direction;
    }
    
    // Search in phone number, content, or contact name
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { from: searchRegex },
        { to: searchRegex },
        { body: searchRegex },
        { contactName: searchRegex }
      ];
    }

    const messages = await SMS.find(query)
      .populate('contactId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SMS.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/sms/conversations
// @desc    Get SMS conversations grouped by contact
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await SMS.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: {
            phoneNumber: {
              $cond: [
                { $eq: ['$direction', 'inbound'] },
                '$from',
                '$to'
              ]
            }
          },
          lastMessage: { $last: '$body' },
          lastMessageDate: { $max: '$createdAt' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$direction', 'inbound'] },
                  { $eq: ['$status', 'delivered'] },
                  { $ne: ['$readAt', null] }
                ]},
                0,
                1
              ]
            }
          },
          contactId: { $first: '$contactId' },
          contactName: { $first: '$contactName' }
        }
      },
      { $sort: { lastMessageDate: -1 } }
    ]);

    // Populate contact details
    await SMS.populate(conversations, {
      path: 'contactId',
      select: 'name email'
    });

    res.json(conversations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/sms/conversation/:phoneNumber
// @desc    Get SMS conversation with specific phone number
// @access  Private
router.get('/conversation/:phoneNumber', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await SMS.find({
      userId: req.user.id,
      $or: [
        { from: phoneNumber },
        { to: phoneNumber }
      ]
    })
    .populate('contactId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await SMS.countDocuments({
      userId: req.user.id,
      $or: [
        { from: phoneNumber },
        { to: phoneNumber }
      ]
    });

    // Mark inbound messages as read
    await SMS.updateMany(
      {
        userId: req.user.id,
        from: phoneNumber,
        direction: 'inbound',
        readAt: null
      },
      {
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/sms
// @desc    Send SMS message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { to, body, twilioMessageSid } = req.body;

    // Validation
    if (!to || !body) {
      return res.status(400).json({ error: 'To and body are required' });
    }

    // Try to find existing contact
    let contactId = null;
    let contactName = null;
    const contact = await Contact.findOne({ 
      userId: req.user.id, 
      phone: to 
    });
    
    if (contact) {
      contactId = contact._id;
      contactName = contact.name;
    }

    const sms = new SMS({
      userId: req.user.id,
      twilioMessageSid,
      direction: 'outbound',
      from: req.user.phoneNumber || 'Unknown', // Should come from user settings
      to,
      body,
      status: 'queued',
      contactId,
      contactName
    });

    await sms.save();

    // Here you would integrate with Twilio to actually send the SMS
    // For now, we'll just mark it as sent
    sms.status = 'delivered';
    sms.sentAt = new Date();
    await sms.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('new-sms', sms);

    res.status(201).json(sms);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/sms/webhook
// @desc    Handle incoming SMS from Twilio (public endpoint)
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const {
      MessageSid,
      From,
      To,
      Body,
      MessageStatus
    } = req.body;

    // Find user by phone number (To field)
    const user = await User.findOne({ 'businessSettings.phoneNumber': To });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Try to find existing contact
    let contactId = null;
    let contactName = null;
    const contact = await Contact.findOne({ 
      userId: user._id, 
      phone: From 
    });
    
    if (contact) {
      contactId = contact._id;
      contactName = contact.name;
    } else {
      // Create new contact for unknown number
      const newContact = new Contact({
        userId: user._id,
        phone: From,
        name: `Unknown (${From})`,
        source: 'sms',
        createdAt: new Date()
      });
      await newContact.save();
      contactId = newContact._id;
      contactName = newContact.name;
    }

    const sms = new SMS({
      userId: user._id,
      twilioMessageSid: MessageSid,
      direction: 'inbound',
      from: From,
      to: To,
      body: Body,
      status: MessageStatus || 'delivered',
      contactId,
      contactName,
      receivedAt: new Date()
    });

    await sms.save();

    // Check for auto-response rules
    if (user.aiSettings?.smsAutoResponse?.enabled) {
      // Here you would implement AI auto-response logic
      // For now, just mark that auto-response should be considered
      sms.needsAutoResponse = true;
      await sms.save();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('new-sms', sms);

    res.status(200).send('OK');
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/sms/:id
// @desc    Update SMS message
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, readAt, tags, notes } = req.body;

    const sms = await SMS.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!sms) {
      return res.status(404).json({ error: 'SMS not found' });
    }

    // Update fields
    if (status) sms.status = status;
    if (readAt) sms.readAt = new Date(readAt);
    if (tags) sms.tags = tags;
    if (notes) sms.notes = notes;

    await sms.save();

    res.json(sms);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'SMS not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/sms/:id
// @desc    Delete SMS message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const sms = await SMS.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!sms) {
      return res.status(404).json({ error: 'SMS not found' });
    }

    await sms.deleteOne();

    res.json({ message: 'SMS deleted' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'SMS not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/sms/stats/summary
// @desc    Get SMS statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    let dateFilter = new Date();
    switch (timeframe) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24);
        break;
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

    const stats = await SMS.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          inboundMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] }
          },
          outboundMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] }
          },
          unreadMessages: {
            $sum: { $cond: [{ $eq: ['$readAt', null] }, 1, 0] }
          },
          autoResponses: {
            $sum: { $cond: ['$isAutoResponse', 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMessages: 0,
      inboundMessages: 0,
      outboundMessages: 0,
      unreadMessages: 0,
      autoResponses: 0
    };

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;