const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Group = require("../models/GroupSchema");
const User = require("../models/User");
const BankDetails = require("../models/BankDetails");
 
router.post('/add-bank-details/:userId', async (req,res) => {
    const {accountHolderName,accountNumber,ifsc,userId} = req.body;

    try {

        if(!userId) {
            res.status(404).json({message:'userId does not exist'});
        }

        const user = await User.findById(userId);

        if(!user) {
            res.status(404).json({message:'user does not exist'});
        }

        const existingDetails = await BankDetails.findOne({ userId });

        if (existingDetails) {
          return res.status(400).json({ 
            success: false, 
            message: "Account number is already set and cannot be changed." 
          });
        }

        const newDetails = new BankDetails({
          userId: userId,  
          accountHolderName: accountHolderName,
          accountNumber: accountNumber,
          ifsc: ifsc,
        });
        await newDetails.save();

        res.status(202).json({message:'saved the account details', savedAccount:true})

      } catch (error) {
        console.error('Error adding bank details:', error.message);
      }
})

router.get('/isUserSetAC/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required', permit: false });
        }

        const isAcSaved = await BankDetails.findOne({ userId });

        if (isAcSaved) {
            return res.status(400).json({
                message: 'Account details already saved. To change, visit the dashboard section.',
                permit: false,
            });
        }

        return res.status(200).json({
            message: 'User can save the details.',
            permit: true,
        });
    } catch (error) {
        console.error('Error checking account status:', error);
        return res.status(500).json({ message: 'Internal server error', permit: false });
    }
});

module.exports = router;