const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  aiResolved: { type: Boolean, default: false },
  category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
