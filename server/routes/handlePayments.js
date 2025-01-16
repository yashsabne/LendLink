require("dotenv").config();
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Group = require('../models/GroupSchema');
const Transaction = require('../models/TansactionSchma')
const mongoose = require('mongoose');
const User = require("../models/User");
const nodemailer = require('nodemailer');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get('/check-eligible-forPayment/:userId/:groupId', async (req, res) => {
  const { userId, groupId } = req.params;

  if (!userId) {
    return res.status(404).json({ error: 'User ID not found' });
  }

  try { 
    const transaction = await Transaction.findOne({ userId, groupId }).sort({ paymentDate: -1 });

    if (!transaction) { 
      return res.status(200).json({ eligible: true, message: 'First-time payment allowed' });
    }

    return res.status(200).json({ 
      date: transaction.paymentDate
    });

  } catch (error) {
    console.error('Error checking payment eligibility:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/create-order-contribution/:userId/:groupId', async (req, res) => {
  const { userId, groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const contributionAmount = group.rules.monthlyContribution; 
    const order = await razorpayInstance.orders.create({
      amount: contributionAmount * 100, 
      currency: 'INR',
      receipt: `${userId}`,
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/payment-success', async (req, res) => {
  const { userId, groupId, razorpayPaymentId,razorpayOrderId } = req.body;

  try { 

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const contributionAmount = group.rules.monthlyContribution; 

    const newTransaction = new Transaction({
      userId: userId,
      groupId: groupId,
      amount: contributionAmount, 
      paymentId: razorpayPaymentId,
      razorpayOrderId:razorpayOrderId,
      paymentStatus: 'Completed',
    });

    const user = await User.findById(userId)
    user.notifications.push({
        message:`you have done the payment in group ${group.name} of Rs.${contributionAmount} `,
        timestamp: new Date()
    })

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
        from: "LendLink Payments" + process.env.OWNER_EMAIL,
        to: user.email,
        subject: "LendLink Payments Confirmation Details",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="font-size: 16px; color: #555;">Dear ${user.name || "User"},</p>

          <p style="font-size: 16px; color: #555;">
            Thank you for your contribution! We have successfully received your payment.
          </p>

          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background-color: #f9f9f9; margin-top: 15px;">
            <p style="font-size: 16px; color: #333; margin: 0; padding-bottom: 8px;"><strong>Transaction Details:</strong></p>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 15px;">
              <li style="margin-bottom: 8px;"><strong>Contribution Amount:</strong> ${contributionAmount}</li>
              <li style="margin-bottom: 8px;"><strong>Group Name:</strong> ${group.name}</li>
              <li style="margin-bottom: 8px;"><strong>Payment Status:</strong> Completed</li>
              <li style="margin-bottom: 8px;"><strong>Payment ID:</strong> ${razorpayPaymentId}</li>
              <li style="margin-bottom: 8px;"><strong>Order ID:</strong> ${razorpayOrderId}</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #555;">Thank you once again for being a valued part of our community!</p>

          <p style="font-size: 16px; color: #555;">Best regards,</p>
          <p style="font-size: 16px; color: #333; font-weight: bold;">The LendLink - Yash Dev</p>
        </div>

        `,
      };

      await transporter.sendMail(mailOptions);

    await user.save();
    await newTransaction.save();

    const memberIndex = group.members.findIndex((member) => member.userId.toString() === userId);
    if (memberIndex !== -1) {
      group.members[memberIndex].contributionsPaid += contributionAmount; 
    }

    group.transactions.push(newTransaction._id);
    group.updatedAt = new Date();

    await group.save();

    res.status(200).json({ message: 'Payment successful and contribution updated.' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;