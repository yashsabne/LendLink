 
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Group = require("../models/GroupSchema");
const User = require("../models/User");
const BankDetails = require("../models/BankDetails");
const nodemailer = require('nodemailer');
const crypto = require("crypto"); 
const Token = require("../models/TokenSchema");

router.get('/info/:userId', async (req,res) => {
    const {userId} = req.params;
    if(!userId) {
        res.status(404).json({message:'userId does not exist',success:false});
    }

    const user = await User.findById(userId);
    if(!user) {
        res.status(404).json({message:'user does not exist',success:false});
    }

    const personalInfo = ({
        name:user.name,
        email:user.email,
        phone:user.phone,
        address:user.address,
        age:user.age,
        constumerId:user._id,
    })

    const bankDetails  = await BankDetails.findOne({userId});

    console.log(bankDetails)

    if(bankDetails == null) {
      res.status(202).json({personalInfo});
    }

    if(bankDetails) {
      const bankInfo = ({
        accountHolderName:bankDetails.accountHolderName,
        accountNumber:bankDetails.accountNumber,
        ifsc:bankDetails.ifsc,
        lastUpdatedAt:bankDetails.updatedAt
    })
    res.status(202).json({personalInfo,bankInfo});
  
    }

} )

router.put('/update-bank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {bankInfo} = req.body;
 

    if (!userId) {
      return res.status(400).json({ message: "User ID not found", success: false });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const emailUser = user.email;
 
    const tokenValue = crypto.randomBytes(32).toString("hex");
 
    await Token.create({
      userId: userId,
      token: tokenValue,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), 
      tempBankDetails: bankInfo
    });

    const link = `http://localhost:3001/personal-info/verify-bank-update?token=${tokenValue}&userId=${user._id}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: "LendLink Account Update" + process.env.OWNER_EMAIL,
      to: emailUser,
      subject: "Bank Details Update Request",
      html: `
        <p>Dear ${user.name || "User"},</p>
        <p>We received a request to update your bank details. If this was you, please confirm the update by clicking the link below:</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Confirm Bank Details Update</a>
        <p>If you did not make this request, please ignore this email. This link will expire in 15 minutes.</p>
        <p>Regards,<br>LendLink Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
 

    return res.status(200).json({ message: "Verification email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});
 
router.get('/verify-bank-update', async (req, res) => {
    try {
      const { token, userId } = req.query;
   
      if (!token || !userId) {
        return res.status(400).json({ message: "Invalid request. Missing token or userId", success: false });
      }
   
      const storedToken = await Token.findOne({ token, userId });
   
      if (!storedToken || storedToken.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Token is invalid or expired", success: false });
      }
   
      const newBankDetails = storedToken.tempBankDetails; 
 
 
      let updatingBankDetails = await BankDetails.findOne({ userId });
 
   
      if (updatingBankDetails) {
        updatingBankDetails.accountHolderName = newBankDetails.accountHolderName;
        updatingBankDetails.accountNumber = newBankDetails.accountNumber;
        updatingBankDetails.ifsc = newBankDetails.ifsc;
   
        await updatingBankDetails.save();

      } else { 
        const newBankInfo = new BankDetails({
          userId,
          accountHolderName: newBankDetails.accountHolderName,
          accountNumber: newBankDetails.accountNumber,
          ifsc: newBankDetails.ifsc
        });
   
        await newBankInfo.save();
      }
 
      return res.status(200).json({ message: "Bank details updated successfully!", success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred while updating bank details", success: false });
    }
  });
  
 

module.exports = router;