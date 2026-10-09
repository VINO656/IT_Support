const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Should be hashed
  role: { type: String, enum: ['employee', 'admin', 'it_support'], default: 'employee' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
