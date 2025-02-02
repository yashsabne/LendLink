const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    groupCode: {type:String, required:true,  unique: true, }, //grpCode
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminName:{type:String},
    paymentFrequency: { type: String, default: "monthly" },  
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String, required: true },
        email: { type: String, required: true },
        status: { type: String, default: "active" },
        contributionsPaid: { type: Number, default: 0 }
      },
    ],
    winners : [
      {
        userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        name:{type:String,required:true},
        ammountReceived:{type:Number, default:0},
        createdAt:{type:Date,default:Date.now}
      }
    ],
    rules: {
      monthlyContribution: { type: Number, required: true },
      maxMembers: { type: Number, required: true },
      penalty: { type: Number, required: true },
    },
    durationMonths: { type: Number, required: true }, 
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
