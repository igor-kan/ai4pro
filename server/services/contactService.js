const Contact = require('../models/Contact');
const User = require('../models/User');

// Find or create contact by phone number
async function findOrCreateContact(userId, phoneNumber) {
  try {
    // Clean phone number (remove +1, spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Try to find existing contact
    let contact = await Contact.findOne({
      userId,
      phone: { $regex: cleanPhone.slice(-10) } // Match last 10 digits
    });
    
    if (!contact) {
      // Create new contact
      contact = new Contact({
        userId,
        phone: phoneNumber,
        firstName: 'Unknown',
        lastName: 'Caller',
        category: 'lead',
        relationshipStatus: 'cold',
        isActive: true,
        leadSource: 'cold-call'
      });
      
      await contact.save();
      
      // Emit event for real-time update
      // This would be handled by the calling route
    }
    
    return contact;
    
  } catch (error) {
    console.error('Error finding/creating contact:', error);
    throw error;
  }
}

// Update contact with AI insights
async function updateContactInsights(contactId, insights) {
  try {
    await Contact.findByIdAndUpdate(contactId, {
      'aiInsights.sentiment': insights.sentiment,
      'aiInsights.interests': insights.interests || [],
      'aiInsights.painPoints': insights.painPoints || [],
      'aiInsights.preferences': insights.preferences || [],
      'aiInsights.lastUpdated': new Date()
    });
    
  } catch (error) {
    console.error('Error updating contact insights:', error);
  }
}

// Get contact analytics
async function getContactAnalytics(userId) {
  try {
    const analytics = await Contact.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgLifetimeValue: { $avg: '$lifetimeValue' },
          totalCalls: { $sum: '$totalCalls' },
          totalSms: { $sum: '$totalSms' }
        }
      }
    ]);
    
    const sentimentAnalysis = await Contact.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$aiInsights.sentiment',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const relationshipStatus = await Contact.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$relationshipStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return {
      byCategory: analytics,
      bySentiment: sentimentAnalysis,
      byRelationshipStatus: relationshipStatus
    };
    
  } catch (error) {
    console.error('Error getting contact analytics:', error);
    return null;
  }
}

// Search contacts
async function searchContacts(userId, query, filters = {}) {
  try {
    const searchQuery = {
      userId,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { phone: { $regex: query.replace(/\D/g, '') } },
        { email: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Apply filters
    if (filters.category) {
      searchQuery.category = filters.category;
    }
    
    if (filters.relationshipStatus) {
      searchQuery.relationshipStatus = filters.relationshipStatus;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      searchQuery.tags = { $in: filters.tags };
    }
    
    const contacts = await Contact.find(searchQuery)
      .sort({ lastCallDate: -1, createdAt: -1 })
      .limit(50);
    
    return contacts;
    
  } catch (error) {
    console.error('Error searching contacts:', error);
    return [];
  }
}

// Get contact activity timeline
async function getContactActivity(contactId) {
  try {
    const Call = require('../models/Call');
    const SMS = require('../models/SMS');
    const Appointment = require('../models/Appointment');
    
    const [calls, sms, appointments] = await Promise.all([
      Call.find({ contact: contactId }).sort({ createdAt: -1 }).limit(10),
      SMS.find({ contact: contactId }).sort({ createdAt: -1 }).limit(10),
      Appointment.find({ contact: contactId }).sort({ createdAt: -1 }).limit(10)
    ]);
    
    // Combine and sort by date
    const activities = [
      ...calls.map(call => ({
        type: 'call',
        date: call.createdAt,
        data: call,
        summary: `${call.direction} call - ${call.duration ? `${call.duration}s` : 'No answer'}`
      })),
      ...sms.map(msg => ({
        type: 'sms',
        date: msg.createdAt,
        data: msg,
        summary: `${msg.direction} SMS - ${msg.body.substring(0, 50)}...`
      })),
      ...appointments.map(apt => ({
        type: 'appointment',
        date: apt.createdAt,
        data: apt,
        summary: `Appointment - ${apt.title}`
      }))
    ];
    
    return activities.sort((a, b) => b.date - a.date);
    
  } catch (error) {
    console.error('Error getting contact activity:', error);
    return [];
  }
}

// Bulk import contacts
async function importContacts(userId, contactsData) {
  try {
    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };
    
    for (const contactData of contactsData) {
      try {
        const cleanPhone = contactData.phone ? contactData.phone.replace(/\D/g, '') : null;
        
        if (!cleanPhone) {
          results.errors.push(`Missing phone number for ${contactData.firstName} ${contactData.lastName}`);
          continue;
        }
        
        // Check if contact exists
        const existingContact = await Contact.findOne({
          userId,
          phone: { $regex: cleanPhone.slice(-10) }
        });
        
        if (existingContact) {
          // Update existing contact
          await Contact.findByIdAndUpdate(existingContact._id, {
            ...contactData,
            phone: contactData.phone // Keep original format
          });
          results.updated++;
        } else {
          // Create new contact
          const newContact = new Contact({
            userId,
            ...contactData,
            phone: contactData.phone,
            category: contactData.category || 'lead',
            relationshipStatus: contactData.relationshipStatus || 'cold',
            isActive: true,
            leadSource: contactData.leadSource || 'import'
          });
          
          await newContact.save();
          results.imported++;
        }
        
      } catch (error) {
        results.errors.push(`Error processing ${contactData.firstName} ${contactData.lastName}: ${error.message}`);
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Error importing contacts:', error);
    throw error;
  }
}

// Get contact suggestions based on AI analysis
async function getContactSuggestions(userId) {
  try {
    const suggestions = {
      followUp: [],
      upgrade: [],
      reEngage: []
    };
    
    // Contacts that need follow-up
    const followUpContacts = await Contact.find({
      userId,
      relationshipStatus: 'warm',
      lastCallDate: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days ago
    }).limit(10);
    
    suggestions.followUp = followUpContacts;
    
    // Contacts ready for upgrade
    const upgradeContacts = await Contact.find({
      userId,
      category: 'lead',
      totalCalls: { $gte: 3 },
      'aiInsights.sentiment': 'positive'
    }).limit(10);
    
    suggestions.upgrade = upgradeContacts;
    
    // Inactive contacts to re-engage
    const reEngageContacts = await Contact.find({
      userId,
      relationshipStatus: 'inactive',
      lastCallDate: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
    }).limit(10);
    
    suggestions.reEngage = reEngageContacts;
    
    return suggestions;
    
  } catch (error) {
    console.error('Error getting contact suggestions:', error);
    return {
      followUp: [],
      upgrade: [],
      reEngage: []
    };
  }
}

module.exports = {
  findOrCreateContact,
  updateContactInsights,
  getContactAnalytics,
  searchContacts,
  getContactActivity,
  importContacts,
  getContactSuggestions
};