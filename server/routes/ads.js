const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/ads/campaigns
// @desc    Get user's ad campaigns
// @access  Private
router.get('/campaigns', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const campaigns = user.adCampaigns || [];
    res.json(campaigns);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ads/campaigns
// @desc    Create new ad campaign
// @access  Private
router.post('/campaigns', auth, async (req, res) => {
  try {
    const {
      name,
      platform,
      budget,
      targetAudience,
      adContent,
      startDate,
      endDate,
      status = 'draft'
    } = req.body;

    if (!name || !platform || !budget || !adContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCampaign = {
      id: Date.now().toString(),
      name,
      platform,
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      targetAudience,
      adContent,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!user.adCampaigns) user.adCampaigns = [];
    user.adCampaigns.push(newCampaign);
    await user.save();

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ads/campaigns/:id
// @desc    Update ad campaign
// @access  Private
router.put('/campaigns/:id', auth, async (req, res) => {
  try {
    const {
      name,
      platform,
      budget,
      targetAudience,
      adContent,
      startDate,
      endDate,
      status
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.adCampaigns) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignIndex = user.adCampaigns.findIndex(
      campaign => campaign.id === req.params.id
    );

    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = user.adCampaigns[campaignIndex];
    
    if (name) campaign.name = name;
    if (platform) campaign.platform = platform;
    if (budget) campaign.budget = budget;
    if (targetAudience) campaign.targetAudience = targetAudience;
    if (adContent) campaign.adContent = { ...campaign.adContent, ...adContent };
    if (startDate) campaign.startDate = startDate;
    if (endDate) campaign.endDate = endDate;
    if (status) campaign.status = status;
    
    campaign.updatedAt = new Date();

    await user.save();

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/ads/campaigns/:id
// @desc    Delete ad campaign
// @access  Private
router.delete('/campaigns/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.adCampaigns) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignIndex = user.adCampaigns.findIndex(
      campaign => campaign.id === req.params.id
    );

    if (campaignIndex === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    user.adCampaigns.splice(campaignIndex, 1);
    await user.save();

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/ads/analytics
// @desc    Get advertising analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate, platform } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let campaigns = user.adCampaigns || [];

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      campaigns = campaigns.filter(campaign => {
        const campaignStart = new Date(campaign.startDate);
        return campaignStart >= start && campaignStart <= end;
      });
    }

    // Filter by platform if provided
    if (platform) {
      campaigns = campaigns.filter(campaign => campaign.platform === platform);
    }

    // Calculate analytics
    const analytics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
      totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
      totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
      totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
      platformBreakdown: {},
      performanceByDate: [],
      topPerformingCampaigns: []
    };

    // Calculate derived metrics
    analytics.ctr = analytics.totalImpressions > 0 
      ? (analytics.totalClicks / analytics.totalImpressions) * 100 
      : 0;
    
    analytics.cpc = analytics.totalClicks > 0 
      ? analytics.totalSpent / analytics.totalClicks 
      : 0;
    
    analytics.conversionRate = analytics.totalClicks > 0 
      ? (analytics.totalConversions / analytics.totalClicks) * 100 
      : 0;

    analytics.roas = analytics.totalSpent > 0 
      ? (analytics.totalConversions * 150) / analytics.totalSpent // Assuming $150 avg conversion value
      : 0;

    // Platform breakdown
    campaigns.forEach(campaign => {
      if (!analytics.platformBreakdown[campaign.platform]) {
        analytics.platformBreakdown[campaign.platform] = {
          campaigns: 0,
          budget: 0,
          spent: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        };
      }
      
      const platform = analytics.platformBreakdown[campaign.platform];
      platform.campaigns++;
      platform.budget += campaign.budget;
      platform.spent += campaign.spent;
      platform.impressions += campaign.impressions;
      platform.clicks += campaign.clicks;
      platform.conversions += campaign.conversions;
    });

    // Top performing campaigns
    analytics.topPerformingCampaigns = campaigns
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 5)
      .map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        conversions: campaign.conversions,
        roas: campaign.spent > 0 ? (campaign.conversions * 150) / campaign.spent : 0
      }));

    res.json(analytics);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ads/campaigns/:id/optimize
// @desc    Get AI optimization suggestions for a campaign
// @access  Private
router.post('/campaigns/:id/optimize', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const campaign = user.adCampaigns?.find(c => c.id === req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Generate AI-powered optimization suggestions
    const suggestions = generateOptimizationSuggestions(campaign);

    res.json({
      campaignId: campaign.id,
      campaignName: campaign.name,
      suggestions,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/ads/generate-ad
// @desc    Generate AI-powered ad content
// @access  Private
router.post('/generate-ad', auth, async (req, res) => {
  try {
    const { businessType, targetAudience, platform, goals } = req.body;

    if (!businessType || !targetAudience || !platform) {
      return res.status(400).json({ error: 'Business type, target audience, and platform are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate AI-powered ad content
    const adContent = generateAdContent(businessType, targetAudience, platform, goals);

    res.json({
      adContent,
      platform,
      targetAudience,
      generatedAt: new Date(),
      variations: generateAdVariations(adContent, platform)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate optimization suggestions
function generateOptimizationSuggestions(campaign) {
  const suggestions = [];
  
  const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
  const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0;
  const cpc = campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0;

  if (ctr < 2) {
    suggestions.push({
      type: 'headline',
      priority: 'high',
      suggestion: 'Improve your headline to increase click-through rate',
      details: 'Your CTR is below average. Try using more compelling, action-oriented headlines.',
      expectedImpact: '+15-25% CTR increase'
    });
  }

  if (conversionRate < 5) {
    suggestions.push({
      type: 'landing_page',
      priority: 'high',
      suggestion: 'Optimize your landing page for better conversions',
      details: 'Low conversion rate suggests landing page issues. Ensure clear value proposition and easy contact methods.',
      expectedImpact: '+20-40% conversion increase'
    });
  }

  if (cpc > 5) {
    suggestions.push({
      type: 'targeting',
      priority: 'medium',
      suggestion: 'Refine your target audience to reduce cost per click',
      details: 'Your CPC is higher than average. Consider narrowing your audience or using negative keywords.',
      expectedImpact: '10-20% cost reduction'
    });
  }

  suggestions.push({
    type: 'budget',
    priority: 'low',
    suggestion: 'Consider increasing budget for high-performing campaigns',
    details: 'This campaign shows good performance. Scaling budget could increase overall conversions.',
    expectedImpact: 'Proportional conversion increase'
  });

  return suggestions;
}

// Helper function to generate ad content
function generateAdContent(businessType, targetAudience, platform, goals) {
  const templates = {
    google: {
      headline: `Professional ${businessType} Services | Call Today!`,
      description: `Get reliable ${businessType} services from trusted professionals. Serving ${targetAudience} with 24/7 availability and guaranteed satisfaction.`,
      callToAction: 'Call Now'
    },
    facebook: {
      headline: `Transform Your Space with Expert ${businessType}`,
      description: `Join hundreds of satisfied customers who chose our ${businessType} services. Professional, reliable, and affordable solutions for ${targetAudience}.`,
      callToAction: 'Learn More'
    },
    instagram: {
      headline: `✨ Premium ${businessType} Services ✨`,
      description: `Beautiful results, every time! Check out our latest ${businessType} projects and see why ${targetAudience} trust us with their homes.`,
      callToAction: 'Book Now'
    }
  };

  return templates[platform] || templates.google;
}

// Helper function to generate ad variations
function generateAdVariations(baseContent, platform) {
  return [
    {
      variation: 'A',
      headline: baseContent.headline,
      description: baseContent.description,
      callToAction: baseContent.callToAction
    },
    {
      variation: 'B',
      headline: `${baseContent.headline.split('|')[0]} - Free Quotes!`,
      description: baseContent.description.replace('Call Today', 'Get your free quote today'),
      callToAction: 'Get Quote'
    },
    {
      variation: 'C',
      headline: `${baseContent.headline.split('|')[0]} - Same Day Service`,
      description: baseContent.description.replace('24/7 availability', 'same-day service'),
      callToAction: 'Book Today'
    }
  ];
}

module.exports = router;