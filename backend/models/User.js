const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    unique: true, // Prevents two users from signing up with the same email
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a secure password'],
    minlength: 6 // Basic structural validation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);