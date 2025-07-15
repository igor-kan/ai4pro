const express = require('express');
const Call = require('../models/Call');
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/calls
// @desc    Get all calls for user
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
    
    // Search in phone number or contact name
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { from: searchRegex },
        { to: searchRegex },
        { contactName: searchRegex }
      ];
    }

    const calls = await Call.find(query)
      .populate('contactId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Call.countDocuments(query);

    res.json({
      calls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/calls/:id
// @desc    Get specific call
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const call = await Call.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('contactId', 'name email phone');

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/calls
// @desc    Create new call record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      twilioCallSid,
      direction,
      from,
      to,
      status,
      duration,
      recordingUrl,
      transcription,
      aiSummary,
      sentiment,
      followUpRequired,
      tags
    } = req.body;

    // Validation
    if (!from || !to || !direction) {
      return res.status(400).json({ error: 'From, to, and direction are required' });
    }

    // Try to find existing contact
    let contactId = null;
    const phoneNumber = direction === 'inbound' ? from : to;
    const contact = await Contact.findOne({ 
      userId: req.user.id, 
      phone: phoneNumber 
    });
    
    if (contact) {
      contactId = contact._id;
    }

    const call = new Call({
      userId: req.user.id,
      twilioCallSid,
      direction,
      from,
      to,
      status: status || 'in-progress',
      duration,
      recordingUrl,
      transcription,
      aiSummary,
      sentiment,
      followUpRequired: followUpRequired || false,
      tags: tags || [],
      contactId
    });

    await call.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('new-call', call);

    res.status(201).json(call);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/calls/:id
// @desc    Update call
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      status,
      duration,
      recordingUrl,
      transcription,
      aiSummary,
      sentiment,
      followUpRequired,
      tags,
      notes
    } = req.body;

    const call = await Call.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Update fields
    if (status) call.status = status;
    if (duration) call.duration = duration;
    if (recordingUrl) call.recordingUrl = recordingUrl;
    if (transcription) call.transcription = transcription;
    if (aiSummary) call.aiSummary = aiSummary;
    if (sentiment) call.sentiment = sentiment;
    if (followUpRequired !== undefined) call.followUpRequired = followUpRequired;
    if (tags) call.tags = tags;
    if (notes) call.notes = notes;

    call.updatedAt = new Date();
    await call.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('call-updated', call);

    res.json(call);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/calls/:id
// @desc    Delete call
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const call = await Call.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    await call.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('call-deleted', req.params.id);

    res.json({ message: 'Call deleted' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Call not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/calls/stats/summary
// @desc    Get call statistics
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

    const stats = await Call.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          answeredCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          missedCalls: {
            $sum: { $cond: [{ $eq: ['$status', 'no-answer'] }, 1, 0] }
          },
          inboundCalls: {
            $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] }
          },
          outboundCalls: {
            $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] }
          },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          followUpRequired: {
            $sum: { $cond: ['$followUpRequired', 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
      inboundCalls: 0,
      outboundCalls: 0,
      totalDuration: 0,
      avgDuration: 0,
      followUpRequired: 0
    };

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/calls/:id/follow-up
// @desc    Mark call for follow-up
// @access  Private
router.post('/:id/follow-up', auth, async (req, res) => {
  try {
    const { followUpDate, notes } = req.body;

    const call = await Call.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    call.followUpRequired = true;
    call.followUpDate = followUpDate ? new Date(followUpDate) : new Date();
    if (notes) call.notes = notes;

    await call.save();

    res.json(call);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;