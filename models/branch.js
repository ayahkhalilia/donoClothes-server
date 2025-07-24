const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, unique: true },
    phonenumber:{ type: String, required: true },
    address:    { type: String, require: true },
    email:      { type: String, required: true },
    photo: {
      data:        Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('branch', branchSchema);
