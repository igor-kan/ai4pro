const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/calendar/appointments
// @desc    Get all appointments for user
// @access  Private
router.get('/appointments', auth, async (req, res) => {
  try {
    const { start, end, status } = req.query;
    
    let query = { userId: req.user.id };
    
    // Filter by date range
    if (start && end) {
      query.startTime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('contactId', 'name email phone')
      .sort({ startTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/calendar/appointments/:id
// @desc    Get specific appointment
// @access  Private
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('contactId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/calendar/appointments
// @desc    Create new appointment
// @access  Private
router.post('/appointments', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      contactId,
      location,
      type,
      reminderMinutes,
      isRecurring,
      recurringPattern
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Title, start time, and end time are required' });
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await Appointment.findOne({
      userId: req.user.id,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot conflicts with existing appointment' });
    }

    const appointment = new Appointment({
      userId: req.user.id,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      contactId,
      location,
      type: type || 'meeting',
      reminderMinutes: reminderMinutes || 15,
      isRecurring: isRecurring || false,
      recurringPattern,
      status: 'scheduled'
    });

    await appointment.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('new-appointment', appointment);

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/calendar/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/appointments/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      type,
      reminderMinutes,
      status,
      notes
    } = req.body;

    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update fields
    if (title) appointment.title = title;
    if (description) appointment.description = description;
    if (startTime) appointment.startTime = new Date(startTime);
    if (endTime) appointment.endTime = new Date(endTime);
    if (location) appointment.location = location;
    if (type) appointment.type = type;
    if (reminderMinutes !== undefined) appointment.reminderMinutes = reminderMinutes;
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;

    appointment.updatedAt = new Date();
    await appointment.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('appointment-updated', appointment);

    res.json(appointment);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/calendar/appointments/:id
// @desc    Cancel/Delete appointment
// @access  Private
router.delete('/appointments/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Mark as cancelled instead of deleting
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.user.id).emit('appointment-cancelled', appointment);

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/calendar/availability
// @desc    Get available time slots
// @access  Private
router.get('/availability', auth, async (req, res) => {
  try {
    const { date, duration = 60 } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM
    
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    // Get existing appointments for the day
    const existingAppointments = await Appointment.find({
      userId: req.user.id,
      status: { $ne: 'cancelled' },
      startTime: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ startTime: 1 });

    // Generate available slots
    const availableSlots = [];
    let currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      // Check if this slot conflicts with any existing appointment
      const hasConflict = existingAppointments.some(appointment => {
        return currentTime < appointment.endTime && slotEnd > appointment.startTime;
      });
      
      if (!hasConflict && slotEnd <= endOfDay) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd)
        });
      }
      
      currentTime = new Date(currentTime.getTime() + 30 * 60000); // 30-minute intervals
    }

    res.json(availableSlots);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/calendar/stats
// @desc    Get calendar statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
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

    const stats = await Appointment.aggregate([
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
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          upcomingAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          avgDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                60000 // Convert to minutes
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      upcomingAppointments: 0,
      avgDuration: 0
    };

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;