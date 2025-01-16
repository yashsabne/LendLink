const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to the User model
  token: { type: String, required: true }, 
  expiresAt: { type: Date, required: true }, 
  tempBankDetails: { }
});

module.exports = mongoose.model('Token', tokenSchema);
