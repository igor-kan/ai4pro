const express = require('express');
const Call = require('../models/Call');
const SMS = require('../models/SMS');
const Contact = require('../models/Contact');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
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

    // Parallel queries for better performance
    const [callStats, smsStats, contactStats, appointmentStats] = await Promise.all([
      // Call statistics
      Call.aggregate([
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
            totalDuration: { $sum: '$duration' },
            avgDuration: { $avg: '$duration' }
          }
        }
      ]),

      // SMS statistics
      SMS.aggregate([
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
            }
          }
        }
      ]),

      // Contact statistics
      Contact.aggregate([
        {
          $match: {
            userId: req.user.id,
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $group: {
            _id: null,
            newContacts: { $sum: 1 },
            avgLeadScore: { $avg: '$aiInsights.leadScore' },
            highValueLeads: {
              $sum: { $cond: [{ $gte: ['$aiInsights.leadScore', 80] }, 1, 0] }
            }
          }
        }
      ]),

      // Appointment statistics
      Appointment.aggregate([
        {
          $match: {
            userId: req.user.id,
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            completedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            upcomingAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const dashboard = {
      calls: callStats[0] || {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        inboundCalls: 0,
        totalDuration: 0,
        avgDuration: 0
      },
      sms: smsStats[0] || {
        totalMessages: 0,
        inboundMessages: 0,
        outboundMessages: 0
      },
      contacts: contactStats[0] || {
        newContacts: 0,
        avgLeadScore: 0,
        highValueLeads: 0
      },
      appointments: appointmentStats[0] || {
        totalAppointments: 0,
        completedAppointments: 0,
        upcomingAppointments: 0
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get trend data over time
// @access  Private
router.get('/trends', auth, async (req, res) => {
  try {
    const { timeframe = '30d', metric = 'calls' } = req.query;
    
    let dateFilter = new Date();
    let groupBy = '$dayOfYear';
    
    switch (timeframe) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24);
        groupBy = '$hour';
        break;
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        groupBy = '$dayOfYear';
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        groupBy = '$dayOfYear';
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        groupBy = '$week';
        break;
    }

    let collection;
    switch (metric) {
      case 'calls':
        collection = Call;
        break;
      case 'sms':
        collection = SMS;
        break;
      case 'contacts':
        collection = Contact;
        break;
      case 'appointments':
        collection = Appointment;
        break;
      default:
        collection = Call;
    }

    const trends = await collection.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            period: { [groupBy]: '$createdAt' },
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json(trends);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', auth, async (req, res) => {
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

    const [responseMetrics, conversionMetrics] = await Promise.all([
      // Response time metrics
      Call.aggregate([
        {
          $match: {
            userId: req.user.id,
            createdAt: { $gte: dateFilter },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            totalResponseTime: { $sum: '$responseTime' },
            callCount: { $sum: 1 }
          }
        }
      ]),

      // Conversion metrics (contacts to appointments)
      Contact.aggregate([
        {
          $match: {
            userId: req.user.id,
            createdAt: { $gte: dateFilter }
          }
        },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'contactId',
            as: 'appointments'
          }
        },
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            contactsWithAppointments: {
              $sum: { $cond: [{ $gt: [{ $size: '$appointments' }, 0] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const performance = {
      responseTime: responseMetrics[0] || {
        avgResponseTime: 0,
        totalResponseTime: 0,
        callCount: 0
      },
      conversion: conversionMetrics[0] || {
        totalContacts: 0,
        contactsWithAppointments: 0
      }
    };

    // Calculate conversion rate
    if (performance.conversion.totalContacts > 0) {
      performance.conversion.conversionRate = 
        (performance.conversion.contactsWithAppointments / performance.conversion.totalContacts) * 100;
    } else {
      performance.conversion.conversionRate = 0;
    }

    res.json(performance);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/sentiment
// @desc    Get sentiment analysis over time
// @access  Private
router.get('/sentiment', auth, async (req, res) => {
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

    const sentimentData = await Call.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: dateFilter },
          sentiment: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 }
        }
      }
    ]);

    const sentimentTrends = await Call.aggregate([
      {
        $match: {
          userId: req.user.id,
          createdAt: { $gte: dateFilter },
          sentiment: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfYear: '$createdAt' },
            year: { $year: '$createdAt' },
            sentiment: '$sentiment'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      overall: sentimentData,
      trends: sentimentTrends
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue and business insights
// @access  Private
router.get('/revenue', auth, async (req, res) => {
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

    // This would integrate with your billing/payment system
    // For now, return mock data
    const revenueData = {
      totalRevenue: 15750,
      avgDealSize: 1250,
      conversionRate: 23.5,
      pipelineValue: 45000,
      closedDeals: 12,
      activeOpportunities: 8,
      trends: [
        { period: 'Week 1', revenue: 3200 },
        { period: 'Week 2', revenue: 4100 },
        { period: 'Week 3', revenue: 3800 },
        { period: 'Week 4', revenue: 4650 }
      ]
    };

    res.json(revenueData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { type = 'calls', format = 'csv', timeframe = '30d' } = req.query;
    
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

    let data;
    let filename;
    
    switch (type) {
      case 'calls':
        data = await Call.find({
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        }).populate('contactId', 'name email');
        filename = 'calls-analytics.csv';
        break;
      case 'sms':
        data = await SMS.find({
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        }).populate('contactId', 'name email');
        filename = 'sms-analytics.csv';
        break;
      case 'contacts':
        data = await Contact.find({
          userId: req.user.id,
          createdAt: { $gte: dateFilter }
        });
        filename = 'contacts-analytics.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    if (format === 'csv') {
      // Simple CSV export - customize based on data type
      const csvHeader = Object.keys(data[0] || {}).join(',') + '\n';
      const csvData = data.map(item => 
        Object.values(item.toObject()).map(val => 
          `"${String(val).replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(csvHeader + csvData);
    } else {
      // JSON export
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename.replace('.csv', '.json')}`);
      res.json(data);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;