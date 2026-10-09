const express = require('express');
const Ticket = require('../models/Ticket');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all tickets for logged in user (or all if admin/support)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'employee') {
      tickets = await Ticket.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new ticket manually
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    const newTicket = new Ticket({
      userId: req.user.userId,
      title,
      description,
      priority,
      category
    });
    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update ticket status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
