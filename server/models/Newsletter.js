const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['footer', 'blog', 'other'],
    default: 'other'
  },
  unsubscribedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Newsletter', NewsletterSchema); 