const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema(
  {
    donationRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'donationRequest', required: true },
    donator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gender: { type: String, enum: ['boys', 'girls', 'men', 'women'], required: true },
    age: { type: Number, required: true },
    type: { type: String, enum: ['dresses', 'pants', 'shirts', 'jackets', 'shoes'], required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    classification: { type: String, enum: ['summer', 'winter', 'autumn', 'spring'], required: true },
    note: { type: String, default: '' },
    photos: [{
      data: Buffer,
      contentType: String,
    }],
    status: { type: String, enum: ['available', 'donated'], default: 'available' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Storage', storageSchema);
