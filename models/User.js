const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['worker', 'donator', 'recipient'] },
  phonenumber: String,
  age: Number,
  kids: Number,
  email: String,
  photo: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('User', userSchema);
