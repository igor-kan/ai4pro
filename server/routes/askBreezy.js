const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/ask-breezy/message
// @desc    Send message to Breezy AI across channels
// @access  Private
router.post('/message', auth, async (req, res) => {
  try {
    const { message, channel, context } = req.body;

    if (!message || !channel) {
      return res.status(400).json({ error: 'Message and channel are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process message based on channel
    const response = await processChannelMessage(message, channel, user, context);

    // Log the interaction
    await logBreezyInteraction(user._id, message, response, channel);

    res.json({
      response: response.content,
      channel,
      suggestions: response.suggestions || [],
      followUpActions: response.followUpActions || [],
      timestamp: new Date()
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/ask-breezy/channels
// @desc    Get available channels and their status
// @access  Private
router.get('/channels', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const channels = [
      {
        id: 'chat',
        name: 'Chat',
        description: 'Real-time text conversation',
        active: true,
        capabilities: ['text', 'suggestions', 'context_aware']
      },
      {
        id: 'sms',
        name: 'SMS',
        description: 'Text messaging integration',
        active: true,
        capabilities: ['text', 'quick_responses', 'scheduling']
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Email communication',
        active: true,
        capabilities: ['text', 'formatting', 'attachments', 'templates']
      },
      {
        id: 'voice',
        name: 'Voice',
        description: 'Voice calls and commands',
        active: user.subscription?.plan === 'premium',
        capabilities: ['speech_to_text', 'text_to_speech', 'voice_commands']
      },
      {
        id: 'video',
        name: 'Video',
        description: 'Video conferencing',
        active: user.subscription?.plan === 'premium',
        capabilities: ['video_calls', 'screen_sharing', 'visual_assistance']
      }
    ];

    res.json(channels);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/ask-breezy/history
// @desc    Get conversation history across channels
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { channel, limit = 50, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get interaction history from database
    const history = await getBreezyHistory(user._id, channel, parseInt(limit), parseInt(offset));

    res.json({
      history,
      totalCount: history.length,
      hasMore: history.length === parseInt(limit)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ask-breezy/feedback
// @desc    Provide feedback on Breezy response
// @access  Private
router.post('/feedback', auth, async (req, res) => {
  try {
    const { interactionId, rating, feedback, channel } = req.body;

    if (!interactionId || !rating) {
      return res.status(400).json({ error: 'Interaction ID and rating are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store feedback for improving AI responses
    await storeBreezyFeedback(user._id, interactionId, rating, feedback, channel);

    res.json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ask-breezy/settings
// @desc    Update Ask Breezy channel preferences
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { channelPreferences, responseStyle, autoResponses } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update Ask Breezy settings
    if (!user.aiSettings) user.aiSettings = {};
    if (!user.aiSettings.askBreezy) user.aiSettings.askBreezy = {};

    if (channelPreferences) {
      user.aiSettings.askBreezy.channelPreferences = channelPreferences;
    }
    if (responseStyle) {
      user.aiSettings.askBreezy.responseStyle = responseStyle;
    }
    if (autoResponses) {
      user.aiSettings.askBreezy.autoResponses = autoResponses;
    }

    await user.save();

    res.json(user.aiSettings.askBreezy);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to process messages based on channel
async function processChannelMessage(message, channel, user, context) {
  const aiSettings = user.aiSettings || {};
  const askBreezySettings = aiSettings.askBreezy || {};

  const channelHandlers = {
    chat: async (msg, usr, ctx) => ({
      content: `I understand your message: "${msg}". How can I help you with your business today?`,
      suggestions: ['Schedule appointment', 'Check availability', 'Get pricing info'],
      followUpActions: ['save_conversation', 'suggest_next_steps']
    }),
    
    sms: async (msg, usr, ctx) => ({
      content: `Thanks for your text! I'll help you with: "${msg}". Would you like me to schedule a callback?`,
      suggestions: ['Yes, schedule callback', 'No, just information', 'Call now'],
      followUpActions: ['log_sms_inquiry', 'check_availability']
    }),
    
    email: async (msg, usr, ctx) => ({
      content: `Thank you for your email regarding: "${msg}". I'll prepare a detailed response for you.`,
      suggestions: ['Draft formal response', 'Send quick reply', 'Schedule meeting'],
      followUpActions: ['draft_email', 'set_reminder']
    }),
    
    voice: async (msg, usr, ctx) => ({
      content: `I heard you say: "${msg}". I can help you with voice commands and hands-free assistance.`,
      suggestions: ['Continue voice session', 'Switch to text', 'Schedule voice call'],
      followUpActions: ['start_voice_session', 'log_voice_command']
    }),
    
    video: async (msg, usr, ctx) => ({
      content: `In our video session about: "${msg}", I can provide visual assistance and demonstrations.`,
      suggestions: ['Start screen share', 'Schedule video meeting', 'Record session'],
      followUpActions: ['prepare_visual_aids', 'setup_recording']
    })
  };

  const handler = channelHandlers[channel] || channelHandlers.chat;
  return await handler(message, user, context);
}

// Helper function to log Breezy interactions
async function logBreezyInteraction(userId, message, response, channel) {
  // This would integrate with your logging system
  console.log(`Breezy Interaction - User: ${userId}, Channel: ${channel}, Message: ${message}`);
  
  // In a real implementation, you'd save this to a database
  // const interaction = new BreezyInteraction({
  //   userId,
  //   message,
  //   response: response.content,
  //   channel,
  //   timestamp: new Date(),
  //   suggestions: response.suggestions,
  //   followUpActions: response.followUpActions
  // });
  // await interaction.save();
}

// Helper function to get Breezy conversation history
async function getBreezyHistory(userId, channel, limit, offset) {
  // Mock history data - replace with actual database query
  const mockHistory = [
    {
      id: '1',
      message: 'What are your business hours?',
      response: 'Our business hours are Monday-Friday 9AM-6PM, Saturday 10AM-4PM.',
      channel: channel || 'chat',
      timestamp: new Date(Date.now() - 86400000),
      rating: 5
    },
    {
      id: '2',
      message: 'Can you schedule an appointment?',
      response: 'I\'d be happy to help schedule an appointment. What service do you need?',
      channel: channel || 'chat',
      timestamp: new Date(Date.now() - 3600000),
      rating: 4
    }
  ];

  return mockHistory.slice(offset, offset + limit);
}

// Helper function to store feedback
async function storeBreezyFeedback(userId, interactionId, rating, feedback, channel) {
  // This would integrate with your feedback storage system
  console.log(`Breezy Feedback - User: ${userId}, Interaction: ${interactionId}, Rating: ${rating}`);
  
  // In a real implementation:
  // const feedbackEntry = new BreezyFeedback({
  //   userId,
  //   interactionId,
  //   rating,
  //   feedback,
  //   channel,
  //   timestamp: new Date()
  // });
  // await feedbackEntry.save();
}

module.exports = router;