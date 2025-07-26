const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'donationRequest', required: true},
  message: { type: String, required: true},
  status: { type: String, enum: ['unread', 'read'], default: 'unread'},
  createdAt: { type: Date, default: Date.now},
});

module.exports = mongoose.model('Alert', alertSchema);