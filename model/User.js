const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: "ID is required!"
  },
  email: {
    type: String,
    required: "email is required!"
  },
  password: {
    type: String,
    required: "Password is required!"
  },
  twoWayKey: {
    type: String
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);