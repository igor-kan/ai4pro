const mongoose = require('mongoose');
const User = require('../models/User');
const Call = require('../models/Call');
const SMS = require('../models/SMS');
const Contact = require('../models/Contact');

class DatabaseService {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/breezy-clone';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Database disconnected');
    }
  }

  // User operations
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      return await User.findByIdAndUpdate(userId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserSubscription(userId, subscriptionData) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            subscription: subscriptionData,
            features: subscriptionData.features || {}
          }
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  // Call operations
  async createCall(callData) {
    try {
      const call = new Call(callData);
      await call.save();
      return call;
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  async getCallById(callId) {
    try {
      return await Call.findById(callId).populate('contact');
    } catch (error) {
      console.error('Error getting call:', error);
      throw error;
    }
  }

  async getCallsByUser(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        direction,
        dateFrom,
        dateTo,
        sortBy = 'startTime',
        sortOrder = 'desc'
      } = options;

      let query = { userId };

      if (status) query.status = status;
      if (direction) query.direction = direction;
      if (dateFrom || dateTo) {
        query.startTime = {};
        if (dateFrom) query.startTime.$gte = new Date(dateFrom);
        if (dateTo) query.startTime.$lte = new Date(dateTo);
      }

      const calls = await Call.find(query)
        .populate('contact', 'firstName lastName phone')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(offset)
        .limit(limit);

      const total = await Call.countDocuments(query);

      return {
        calls,
        total,
        hasMore: total > offset + limit
      };
    } catch (error) {
      console.error('Error getting calls:', error);
      throw error;
    }
  }

  async updateCall(callId, updateData) {
    try {
      return await Call.findByIdAndUpdate(callId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating call:', error);
      throw error;
    }
  }

  async updateCallTranscription(callId, transcription, aiSummary) {
    try {
      return await Call.findByIdAndUpdate(
        callId,
        {
          transcription,
          aiSummary: {
            summary: aiSummary.summary,
            intent: aiSummary.intent,
            sentiment: aiSummary.sentiment,
            keywords: aiSummary.keywords || [],
            actionItems: aiSummary.actionItems || [],
            followUpRequired: aiSummary.followUpRequired || false
          }
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating call transcription:', error);
      throw error;
    }
  }

  // SMS operations
  async createSMS(smsData) {
    try {
      const sms = new SMS(smsData);
      await sms.save();
      return sms;
    } catch (error) {
      console.error('Error creating SMS:', error);
      throw error;
    }
  }

  async getSMSById(smsId) {
    try {
      return await SMS.findById(smsId).populate('contact');
    } catch (error) {
      console.error('Error getting SMS:', error);
      throw error;
    }
  }

  async getSMSByUser(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        direction,
        threadId,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let query = { userId };

      if (direction) query.direction = direction;
      if (threadId) query.threadId = threadId;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const messages = await SMS.find(query)
        .populate('contact', 'firstName lastName phone')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(offset)
        .limit(limit);

      const total = await SMS.countDocuments(query);

      return {
        messages,
        total,
        hasMore: total > offset + limit
      };
    } catch (error) {
      console.error('Error getting SMS:', error);
      throw error;
    }
  }

  async updateSMS(smsId, updateData) {
    try {
      return await SMS.findByIdAndUpdate(smsId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating SMS:', error);
      throw error;
    }
  }

  async markSMSAsRead(smsId) {
    try {
      return await SMS.findByIdAndUpdate(
        smsId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking SMS as read:', error);
      throw error;
    }
  }

  async getSMSThreads(userId, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      // Aggregate to get latest message per thread
      const threads = await SMS.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$threadId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
            },
            messageCount: { $sum: 1 }
          }
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
        { $skip: offset },
        { $limit: limit }
      ]);

      // Populate contact information
      await SMS.populate(threads, {
        path: 'lastMessage.contact',
        select: 'firstName lastName phone'
      });

      return threads;
    } catch (error) {
      console.error('Error getting SMS threads:', error);
      throw error;
    }
  }

  // Contact operations
  async createContact(contactData) {
    try {
      const contact = new Contact(contactData);
      await contact.save();
      return contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContactByPhone(userId, phone) {
    try {
      return await Contact.findOne({ userId, phone });
    } catch (error) {
      console.error('Error getting contact by phone:', error);
      throw error;
    }
  }

  async getContactsByUser(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, search } = options;

      let query = { userId };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const contacts = await Contact.find(query)
        .sort({ lastContacted: -1 })
        .skip(offset)
        .limit(limit);

      const total = await Contact.countDocuments(query);

      return {
        contacts,
        total,
        hasMore: total > offset + limit
      };
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  async updateContact(contactId, updateData) {
    try {
      return await Contact.findByIdAndUpdate(contactId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Analytics operations
  async getCallAnalytics(userId, options = {}) {
    try {
      const { dateFrom, dateTo } = options;

      let matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      if (dateFrom || dateTo) {
        matchStage.startTime = {};
        if (dateFrom) matchStage.startTime.$gte = new Date(dateFrom);
        if (dateTo) matchStage.startTime.$lte = new Date(dateTo);
      }

      const analytics = await Call.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            avgDuration: { $avg: '$duration' },
            inboundCalls: {
              $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] }
            },
            outboundCalls: {
              $sum: { $cond: [{ $eq: ['$direction', 'outbound'] }, 1, 0] }
            },
            answeredCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] }
            },
            missedCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'no-answer'] }, 1, 0] }
            }
          }
        }
      ]);

      return analytics[0] || {
        totalCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        inboundCalls: 0,
        outboundCalls: 0,
        answeredCalls: 0,
        missedCalls: 0
      };
    } catch (error) {
      console.error('Error getting call analytics:', error);
      throw error;
    }
  }

  async getSMSAnalytics(userId, options = {}) {
    try {
      const { dateFrom, dateTo } = options;

      let matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
        if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
      }

      const analytics = await SMS.aggregate([
        { $match: matchStage },
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
            autoResponsesCount: {
              $sum: { $cond: [{ $eq: ['$isAutoResponse', true] }, 1, 0] }
            },
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ]);

      return analytics[0] || {
        totalMessages: 0,
        inboundMessages: 0,
        outboundMessages: 0,
        autoResponsesCount: 0,
        avgResponseTime: 0
      };
    } catch (error) {
      console.error('Error getting SMS analytics:', error);
      throw error;
    }
  }

  // Search operations
  async searchCommunications(userId, searchTerm, options = {}) {
    try {
      const { limit = 20, type } = options;

      const searchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        $or: [
          { transcription: { $regex: searchTerm, $options: 'i' } },
          { 'aiSummary.summary': { $regex: searchTerm, $options: 'i' } }
        ]
      };

      const smsSearchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        body: { $regex: searchTerm, $options: 'i' }
      };

      const results = {};

      if (!type || type === 'calls') {
        results.calls = await Call.find(searchQuery)
          .populate('contact', 'firstName lastName phone')
          .sort({ startTime: -1 })
          .limit(limit);
      }

      if (!type || type === 'sms') {
        results.sms = await SMS.find(smsSearchQuery)
          .populate('contact', 'firstName lastName phone')
          .sort({ createdAt: -1 })
          .limit(limit);
      }

      return results;
    } catch (error) {
      console.error('Error searching communications:', error);
      throw error;
    }
  }

  // Cleanup operations
  async cleanupOldData(userId, options = {}) {
    try {
      const { daysToKeep = 90 } = options;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const callsDeleted = await Call.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $lt: cutoffDate }
      });

      const smsDeleted = await SMS.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $lt: cutoffDate }
      });

      return {
        callsDeleted: callsDeleted.deletedCount,
        smsDeleted: smsDeleted.deletedCount
      };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();