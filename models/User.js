const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    role:       { type: String, enum: ['worker', 'donator', 'recipient'], required: true },
    phonenumber:{ type: String, required: true },
    age:        { type: Number, min: 0, required: true },
    kids:       { type: Number, min: 0, required: true },
    email:      { type: String, required: true },
    photo: {
      data:        Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
