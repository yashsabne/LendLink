const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  adminId: { type: String, required: true },
  filePaths: { type: [String], default: [] },  
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', VideoSchema);
