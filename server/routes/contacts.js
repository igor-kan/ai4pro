const express = require('express');
const Contact = require('../models/Contact');
const Call = require('../models/Call');
const SMS = require('../models/SMS');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/contacts
// @desc    Get all contacts for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, tags, leadScore } = req.query;
    
    let query = { userId: req.user.id };
    
    // Search in name, email, phone, or company
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex }
      ];
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Filter by lead score
    if (leadScore) {
      const [min, max] = leadScore.split('-').map(Number);
      query['aiInsights.leadScore'] = { $gte: min, $lte: max };
    }

    const contacts = await Contact.find(query)
      .sort({ lastContact: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get specific contact with activity history
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Get recent calls and SMS for this contact
    const [calls, messages] = await Promise.all([
      Call.find({ 
        userId: req.user.id, 
        contactId: contact._id 
      })
      .sort({ createdAt: -1 })
      .limit(10),
      
      SMS.find({ 
        userId: req.user.id, 
        contactId: contact._id 
      })
      .sort({ createdAt: -1 })
      .limit(10)
    ]);

    res.json({
      contact,
      recentCalls: calls,
      recentMessages: messages
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/contacts
// @desc    Create new contact
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      title,
      address,
      notes,
      tags,
      customFields
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if contact with same phone or email already exists
    const existingContact = await Contact.findOne({
      userId: req.user.id,
      $or: [
        { email: email },
        { phone: phone }
      ]
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Contact with this email or phone already exists' });
    }

    const contact = new Contact({
      userId: req.user.id,
      name,
      email,
      phone,
      company,
      title,
      address,
      notes,
      tags: tags || [],
      customFields: customFields || {},
      source: 'manual'
    });

    await contact.save();

    res.status(201).json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      title,
      address,
      notes,
      tags,
      customFields
    } = req.body;

    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Update fields
    if (name) contact.name = name;
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (company) contact.company = company;
    if (title) contact.title = title;
    if (address) contact.address = address;
    if (notes) contact.notes = notes;
    if (tags) contact.tags = tags;
    if (customFields) contact.customFields = { ...contact.customFields, ...customFields };

    contact.updatedAt = new Date();
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.deleteOne();

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/contacts/stats/summary
// @desc    Get contact statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $match: { userId: req.user.id }
      },
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          averageLeadScore: { $avg: '$aiInsights.leadScore' },
          highValueLeads: {
            $sum: { $cond: [{ $gte: ['$aiInsights.leadScore', 80] }, 1, 0] }
          },
          contactsWithEmail: {
            $sum: { $cond: [{ $ne: ['$email', null] }, 1, 0] }
          },
          contactsWithPhone: {
            $sum: { $cond: [{ $ne: ['$phone', null] }, 1, 0] }
          },
          recentContacts: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalContacts: 0,
      averageLeadScore: 0,
      highValueLeads: 0,
      contactsWithEmail: 0,
      contactsWithPhone: 0,
      recentContacts: 0
    };

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/contacts/:id/tag
// @desc    Add tag to contact
// @access  Private
router.post('/:id/tag', auth, async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (!contact.tags.includes(tag)) {
      contact.tags.push(tag);
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/contacts/:id/tag/:tag
// @desc    Remove tag from contact
// @access  Private
router.delete('/:id/tag/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;

    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    contact.tags = contact.tags.filter(t => t !== tag);
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/contacts/:id/note
// @desc    Add note to contact
// @access  Private
router.post('/:id/note', auth, async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const newNote = {
      content: note,
      createdAt: new Date(),
      createdBy: req.user.id
    };

    if (!contact.notes) {
      contact.notes = [];
    }
    contact.notes.push(newNote);
    await contact.save();

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/contacts/export
// @desc    Export contacts as CSV
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id });

    // Simple CSV export
    const csvHeader = 'Name,Email,Phone,Company,Title,Tags,Lead Score,Created At\n';
    const csvData = contacts.map(contact => {
      return [
        contact.name || '',
        contact.email || '',
        contact.phone || '',
        contact.company || '',
        contact.title || '',
        (contact.tags || []).join(';'),
        contact.aiInsights?.leadScore || '',
        contact.createdAt?.toISOString() || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/contacts/import
// @desc    Import contacts from CSV
// @access  Private
router.post('/import', auth, async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts array is required' });
    }

    const importedContacts = [];
    const errors = [];

    for (let i = 0; i < contacts.length; i++) {
      try {
        const contactData = contacts[i];
        
        // Skip if contact already exists
        const existingContact = await Contact.findOne({
          userId: req.user.id,
          $or: [
            { email: contactData.email },
            { phone: contactData.phone }
          ]
        });

        if (existingContact) {
          errors.push({ row: i + 1, error: 'Contact already exists' });
          continue;
        }

        const contact = new Contact({
          userId: req.user.id,
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          company: contactData.company,
          title: contactData.title,
          tags: contactData.tags || [],
          source: 'import'
        });

        await contact.save();
        importedContacts.push(contact);
      } catch (error) {
        errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      imported: importedContacts.length,
      errors: errors,
      contacts: importedContacts
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;