require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');
const Video = require('../models/VideoSchema');  
const User  = require('../models/User')
const Group = require("../models/GroupSchema");
const nodemailer = require('nodemailer'); 

const router = express.Router();
 
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET,  
});
 
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'videos', 
    resource_type: 'video',  
    format: async () => 'mp4',  
  },
});

const upload = multer({ storage });

 
router.post('/upload-video/:userId/:groupId', upload.single('video'), async (req, res) => {
  try {
    const { userId, groupId } = req.params;

    console.log('userId:', userId);
    console.log('groupId:', groupId);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const getMembers = group.members;

    console.log('Group Members:', getMembers);

    let videoDocument = await Video.findOne({ groupId: groupId.toString() });

    const winners = group.winners;

    const getWinnerName = winners[winners.length-1];

    if (videoDocument) {
      videoDocument.filePaths.push(req.file.path);
      await videoDocument.save();
    } else {
      videoDocument = new Video({
        groupId: groupId.toString(),
        adminId: userId.toString(),
        filePaths: [req.file.path],
        timestamp: new Date(),
      });
      await videoDocument.save();
    }

    const videoUrl = req.file.path;
 
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailPromises = getMembers.map((member) => {
      const mailOptions = {
        from: "LendLink Winner" + process.env.OWNER_EMAIL,
        to: member.email,
        subject: 'Winner has been declared and Video for the winner as proof Group',
        text: `Hello <b> ${member.name} </b>,\n\nA new winner has been declared and the name of winner is <b> ${getWinnerName.name} </b> and the winner proof as
         recording of the selecting video. You can view it at the link below:\n\n${videoUrl}\n\nBest regards,\nlendLINk-yashDev`,
      };

      return transporter.sendMail(mailOptions);
    });
 
    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: 'Video uploaded and email notifications sent successfully',
      videoUrl,
      videoId: videoDocument._id,
    });
  } catch (err) {
    console.error('Error during upload:', err);
    res.status(500).json({
      success: false,
      message: 'Error uploading video or sending emails',
      error: err.message,
    });
  }
});



module.exports = router;
