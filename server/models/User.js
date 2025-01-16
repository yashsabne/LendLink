const mongoose = require('mongoose');
const Group = require('./GroupSchema');

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

  
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true
    },
    address: { type: String, required: true },
    age: { type: Number, required: true, min: 18 }, // Ensure user is of legal age
    password: { type: String, required: true },
    groups: [
      {
        name:{ type: String, required: true },
        groupId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
        }
      },
    ],
    notifications: [NotificationSchema],
    // transactions: [{
    //   transactionId:{type:String, required:true},
    //   groupId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Group",
    //   },
    //   createdAt: { type: Date, default: Date.now },
    // }]
  },
  {
    timestamps: true,
  }
);
 
const User = mongoose.model('User', UserSchema);

module.exports = User;
