const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ai/settings
// @desc    Get AI settings for user
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('aiSettings');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.aiSettings || {});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ai/settings
// @desc    Update AI settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const {
      personalityType,
      responseStyle,
      callHandling,
      smsAutoResponse,
      voiceSettings,
      businessContext,
      customInstructions,
      knowledgeBase
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update AI settings
    const aiSettings = user.aiSettings || {};
    
    if (personalityType) aiSettings.personalityType = personalityType;
    if (responseStyle) aiSettings.responseStyle = responseStyle;
    if (callHandling) aiSettings.callHandling = { ...aiSettings.callHandling, ...callHandling };
    if (smsAutoResponse) aiSettings.smsAutoResponse = { ...aiSettings.smsAutoResponse, ...smsAutoResponse };
    if (voiceSettings) aiSettings.voiceSettings = { ...aiSettings.voiceSettings, ...voiceSettings };
    if (businessContext) aiSettings.businessContext = businessContext;
    if (customInstructions) aiSettings.customInstructions = customInstructions;
    if (knowledgeBase) aiSettings.knowledgeBase = knowledgeBase;

    user.aiSettings = aiSettings;
    await user.save();

    res.json(user.aiSettings);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/test-response
// @desc    Test AI response with current settings
// @access  Private
router.post('/test-response', auth, async (req, res) => {
  try {
    const { scenario, message } = req.body;

    if (!scenario || !message) {
      return res.status(400).json({ error: 'Scenario and message are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Here you would integrate with your AI service to generate a test response
    // For now, return a mock response
    const mockResponse = {
      response: `Based on your ${user.aiSettings?.personalityType || 'professional'} personality and ${user.aiSettings?.responseStyle || 'friendly'} response style, here's how I would respond: "${message}"`,
      confidence: 0.95,
      sentiment: 'neutral',
      suggestedActions: ['Schedule follow-up', 'Send information']
    };

    res.json(mockResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/ai/knowledge-base
// @desc    Get knowledge base entries
// @access  Private
router.get('/knowledge-base', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const knowledgeBase = user.aiSettings?.knowledgeBase || [];
    res.json(knowledgeBase);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/knowledge-base
// @desc    Add knowledge base entry
// @access  Private
router.post('/knowledge-base', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newEntry = {
      id: Date.now().toString(),
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!user.aiSettings) user.aiSettings = {};
    if (!user.aiSettings.knowledgeBase) user.aiSettings.knowledgeBase = [];
    
    user.aiSettings.knowledgeBase.push(newEntry);
    await user.save();

    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ai/knowledge-base/:id
// @desc    Update knowledge base entry
// @access  Private
router.put('/knowledge-base/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.aiSettings?.knowledgeBase) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    const entryIndex = user.aiSettings.knowledgeBase.findIndex(
      entry => entry.id === req.params.id
    );

    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    const entry = user.aiSettings.knowledgeBase[entryIndex];
    
    if (title) entry.title = title;
    if (content) entry.content = content;
    if (category) entry.category = category;
    if (tags) entry.tags = tags;
    entry.updatedAt = new Date();

    await user.save();

    res.json(entry);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/ai/knowledge-base/:id
// @desc    Delete knowledge base entry
// @access  Private
router.delete('/knowledge-base/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.aiSettings?.knowledgeBase) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    const entryIndex = user.aiSettings.knowledgeBase.findIndex(
      entry => entry.id === req.params.id
    );

    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Knowledge base entry not found' });
    }

    user.aiSettings.knowledgeBase.splice(entryIndex, 1);
    await user.save();

    res.json({ message: 'Knowledge base entry deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/analyze-call
// @desc    Analyze call transcription with AI
// @access  Private
router.post('/analyze-call', auth, async (req, res) => {
  try {
    const { transcription, callId } = req.body;

    if (!transcription) {
      return res.status(400).json({ error: 'Transcription is required' });
    }

    // Here you would integrate with your AI service for analysis
    // For now, return mock analysis
    const analysis = {
      summary: 'Customer inquiry about service pricing and availability.',
      sentiment: 'positive',
      keyTopics: ['pricing', 'service availability', 'scheduling'],
      followUpRequired: true,
      suggestedActions: [
        'Send pricing information',
        'Schedule follow-up call',
        'Add to high-priority leads'
      ],
      leadScore: 85,
      confidence: 0.92
    };

    res.json(analysis);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ai/generate-response
// @desc    Generate AI response for SMS or email
// @access  Private
router.post('/generate-response', auth, async (req, res) => {
  try {
    const { message, context, type } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Here you would integrate with your AI service
    // For now, return mock response
    const suggestions = [
      {
        response: "Thank you for your message! I'll get back to you shortly with the information you requested.",
        tone: 'professional',
        confidence: 0.9
      },
      {
        response: "Hi! Thanks for reaching out. Let me check on that for you and I'll respond within the hour.",
        tone: 'friendly',
        confidence: 0.85
      },
      {
        response: "I appreciate your inquiry. I'll review your request and provide a detailed response by end of business today.",
        tone: 'formal',
        confidence: 0.8
      }
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;