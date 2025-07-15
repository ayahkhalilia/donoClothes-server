module.exports = {

  async getAllUsers() {
    const User = require('../models/User');
    return User.find({}, '-photo.data').lean();
  },

};
