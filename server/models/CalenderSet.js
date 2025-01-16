const mongoose = require('mongoose');

const CalenderSet = new mongoose.Schema(
  {
    groupName: { type: String },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentDates: { type: [String], default: [] },  
  },
  { timestamps: true }
);

const Calender = mongoose.model("Calender", CalenderSet);

module.exports = Calender;
