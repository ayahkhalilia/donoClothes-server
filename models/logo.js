const mongoose = require('mongoose');
const logoSchema = new mongoose.Schema({
  photo: {
    data: Buffer,
    contentType: String
  }
});

module.exports = mongoose.model('Logo', logoSchema);
