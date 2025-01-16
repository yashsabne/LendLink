const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const groupChatSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  messages: [messageSchema], // An array of messages within each group
});

const GroupChat = mongoose.model('GroupChat', groupChatSchema);

module.exports = GroupChat;
