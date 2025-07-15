const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/campaigns
// @desc    Get user's marketing campaigns
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let campaigns = user.marketingCampaigns || [];

    // Filter by status if provided
    if (status) {
      campaigns = campaigns.filter(campaign => campaign.status === status);
    }

    // Filter by type if provided
    if (type) {
      campaigns = campaigns.filter(campaign => campaign.type === type);
    }

    // Apply pagination
    const paginatedCampaigns = campaigns.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      campaigns: paginatedCampaigns,
      total: campaigns.length,
      hasMore: campaigns.length > parseInt(offset) + parseInt(limit)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new marketing campaign
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      type,
      targetSegment,
      content,
      schedule,
      automation,
      budget,
      startDate,
      endDate
    } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({ error: 'Name, type, and content are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get target contacts count based on segment
    const totalContacts = await getTargetContactsCount(user._id, targetSegment);

    const newCampaign = {
      id: Date.now().toString(),
      name,
      type,
      status: 'draft',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetSegment,
      totalContacts,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      budget: budget || 100,
      spent: 0,
      content,
      schedule: schedule || { frequency: 'immediate' },
      automation: automation || { enabled: false, triggers: [], followUpActions: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        sends: [],
        opens: [],
        clicks: [],
        conversions: []
      }
    };

    if (!user.marketingCampaigns) user.marketingCampaigns = [];
    user.marketingCampaigns.push(newCampaign);
    await user.save();

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update marketing campaign
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.marketingCampaigns) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignIndex = user.marketingCampaigns.findIndex(
      campaign => campaign.id === req.params.id
    );

    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = user.marketingCampaigns[campaignIndex];
    
    // Update campaign fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        campaign[key] = updates[key];
      }
    });
    
    campaign.updatedAt = new Date();

    await user.save();

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete marketing campaign
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.marketingCampaigns) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignIndex = user.marketingCampaigns.findIndex(
      campaign => campaign.id === req.params.id
    );

    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    user.marketingCampaigns.splice(campaignIndex, 1);
    await user.save();

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns/:id/launch
// @desc    Launch a marketing campaign
// @access  Private
router.post('/:id/launch', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const campaign = user.marketingCampaigns?.find(c => c.id === req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'active') {
      return res.status(400).json({ error: 'Campaign is already active' });
    }

    // Update campaign status to active
    campaign.status = 'active';
    campaign.startDate = new Date();
    campaign.updatedAt = new Date();

    // Start campaign execution
    const launchResult = await executeCampaign(campaign, user);

    await user.save();

    res.json({
      message: 'Campaign launched successfully',
      campaign,
      launchResult
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns/:id/pause
// @desc    Pause a marketing campaign
// @access  Private
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const campaign = user.marketingCampaigns?.find(c => c.id === req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    campaign.updatedAt = new Date();

    await user.save();

    res.json({
      message: `Campaign ${campaign.status === 'paused' ? 'paused' : 'resumed'} successfully`,
      campaign
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/campaigns/analytics
// @desc    Get campaign analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate, campaignId } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let campaigns = user.marketingCampaigns || [];

    // Filter by specific campaign if provided
    if (campaignId) {
      campaigns = campaigns.filter(c => c.id === campaignId);
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      campaigns = campaigns.filter(campaign => {
        const campaignStart = new Date(campaign.startDate);
        return campaignStart >= start && campaignStart <= end;
      });
    }

    // Calculate analytics
    const analytics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalContacts: campaigns.reduce((sum, c) => sum + c.totalContacts, 0),
      totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
      totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
      avgOpenRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length : 0,
      avgClickRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length : 0,
      avgConversionRate: campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length : 0,
      typeBreakdown: {},
      performanceByDate: [],
      topPerformingCampaigns: []
    };

    // Type breakdown
    campaigns.forEach(campaign => {
      if (!analytics.typeBreakdown[campaign.type]) {
        analytics.typeBreakdown[campaign.type] = {
          count: 0,
          sent: 0,
          openRate: 0,
          clickRate: 0,
          budget: 0,
          spent: 0
        };
      }
      
      const type = analytics.typeBreakdown[campaign.type];
      type.count++;
      type.sent += campaign.sentCount;
      type.openRate += campaign.openRate;
      type.clickRate += campaign.clickRate;
      type.budget += campaign.budget;
      type.spent += campaign.spent;
    });

    // Calculate averages for type breakdown
    Object.keys(analytics.typeBreakdown).forEach(type => {
      const typeData = analytics.typeBreakdown[type];
      typeData.openRate = typeData.openRate / typeData.count;
      typeData.clickRate = typeData.clickRate / typeData.count;
    });

    // Top performing campaigns
    analytics.topPerformingCampaigns = campaigns
      .sort((a, b) => (b.conversionRate * b.sentCount) - (a.conversionRate * a.sentCount))
      .slice(0, 5)
      .map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        sentCount: campaign.sentCount,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        conversionRate: campaign.conversionRate,
        totalConversions: Math.round((campaign.conversionRate / 100) * campaign.sentCount)
      }));

    res.json(analytics);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/campaigns/templates
// @desc    Get campaign templates
// @access  Private
router.get('/templates', auth, async (req, res) => {
  try {
    const { type, category } = req.query;
    
    const templates = [
      {
        id: '1',
        name: 'Welcome New Customer',
        type: 'email',
        category: 'onboarding',
        subject: 'Welcome to [Business Name] - Your Trusted Service Partner',
        content: 'Welcome! We\'re excited to serve you. Here\'s what you can expect from our team and how to get the most from our services.',
        variables: ['business_name', 'customer_name', 'service_type']
      },
      {
        id: '2',
        name: 'Service Reminder',
        type: 'sms',
        category: 'maintenance',
        content: 'Hi [Name]! Just a friendly reminder that your [Service] is due. Reply YES to schedule or call us at [Phone].',
        variables: ['customer_name', 'service_type', 'phone_number']
      },
      {
        id: '3',
        name: 'Seasonal Promotion',
        type: 'email',
        category: 'promotion',
        subject: '[Season] Special - Limited Time Offer!',
        content: 'Take advantage of our [Season] special! Get [Discount]% off on [Services]. Book before [Date] to secure your savings.',
        variables: ['season', 'discount_percentage', 'services', 'expiry_date']
      },
      {
        id: '4',
        name: 'Thank You Follow-up',
        type: 'email',
        category: 'follow-up',
        subject: 'Thank you for choosing [Business Name]!',
        content: 'Thank you for trusting us with your [Service]. We hope you\'re completely satisfied. Please let us know if you need anything else!',
        variables: ['business_name', 'service_type', 'customer_name']
      },
      {
        id: '5',
        name: 'Review Request',
        type: 'sms',
        category: 'feedback',
        content: 'Hi [Name]! How was your experience with our [Service]? We\'d love a quick review: [Review Link]. Thanks!',
        variables: ['customer_name', 'service_type', 'review_link']
      }
    ];

    let filteredTemplates = templates;

    // Filter by type if provided
    if (type) {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }

    // Filter by category if provided
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    res.json(filteredTemplates);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns/test-send
// @desc    Send test campaign message
// @access  Private
router.post('/test-send', auth, async (req, res) => {
  try {
    const { campaignId, testContacts } = req.body;

    if (!campaignId || !testContacts || testContacts.length === 0) {
      return res.status(400).json({ error: 'Campaign ID and test contacts are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const campaign = user.marketingCampaigns?.find(c => c.id === campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Send test messages
    const testResults = await sendTestCampaign(campaign, testContacts);

    res.json({
      message: 'Test campaign sent successfully',
      results: testResults,
      sentTo: testContacts
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to get target contacts count
async function getTargetContactsCount(userId, targetSegment) {
  // Mock implementation - in a real app, this would query your contacts database
  const segmentCounts = {
    'all_customers': 1500,
    'new_customers': 150,
    'previous_customers': 1200,
    'high_value': 300,
    'inactive': 200
  };
  
  return segmentCounts[targetSegment] || 0;
}

// Helper function to execute campaign
async function executeCampaign(campaign, user) {
  // Mock implementation - in a real app, this would:
  // 1. Get target contacts based on segment
  // 2. Send messages via email/SMS service
  // 3. Track delivery and engagement
  // 4. Handle automation triggers
  
  console.log(`Executing campaign: ${campaign.name} for user: ${user._id}`);
  
  // Simulate some initial sends
  const initialSends = Math.min(50, campaign.totalContacts);
  campaign.sentCount = initialSends;
  
  // Simulate some engagement (this would be real-time in production)
  campaign.openRate = 15 + Math.random() * 25; // 15-40%
  campaign.clickRate = 2 + Math.random() * 8; // 2-10%
  campaign.conversionRate = 1 + Math.random() * 4; // 1-5%
  campaign.spent = Math.round(campaign.budget * 0.1); // Spend 10% initially
  
  return {
    messagesSent: initialSends,
    estimatedReach: campaign.totalContacts,
    nextSendTime: campaign.schedule.frequency === 'immediate' ? null : getNextSendTime(campaign.schedule)
  };
}

// Helper function to send test campaign
async function sendTestCampaign(campaign, testContacts) {
  // Mock implementation - in a real app, this would send actual test messages
  console.log(`Sending test campaign: ${campaign.name} to ${testContacts.length} contacts`);
  
  return testContacts.map(contact => ({
    contact,
    status: 'sent',
    timestamp: new Date(),
    messageId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }));
}

// Helper function to calculate next send time
function getNextSendTime(schedule) {
  const now = new Date();
  
  switch (schedule.frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

module.exports = router;