const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Group = require("../models/GroupSchema");
const User = require("../models/User");
const nodemailer = require('nodemailer');
const { admin } = require("googleapis/build/src/apis/admin");

router.post("/create-new", async (req, res) => {
  try {
    const { name, rules, members, adminId } = req.body;

    if (!name || !rules || !members || !adminId || members.length === 0) {
      return res.status(400).json({
        message: "All fields are required, including at least one member and adminId.",
      });
    }

    const newGroup = new Group({
      name,
      admin: adminId,
      rules,
      members: [],
      durationMonths: members.length,
    });

    await newGroup.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const processedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await User.findOne({ email: member.email });

        if (user) {

          user.groups.push({
            name: name,
            groupId: newGroup._id,
          });

          console.log(adminId)
          console.log(user._id, 'userId')

          const message =
            adminId === user._id.toString()
              ? `You created this group "${name}".`
              : `You were added to this group "${name}".`;
          user.notifications.push({
            message: message,
            timestamp: new Date(),
          });

          await user.save();

          const mailOptions = {
            from: "LendLink Groups" + process.env.OWNER_EMAIL,
            to: member.email,
            subject: message,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #4CAF50;">Welcome to the group <b>${name}</b>!</h2>
              <p>Dear <b>${member.name}</b>,</p>
              <p>We are excited to inform ${message} <b>${name}</b>. Below are the details of the group:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f4f4f4;">
                  <th style="padding: 10px; text-align: left;">Group Name</th>
                  <td style="padding: 10px;">${name}</td>
                </tr>
                <tr>
                  <th style="padding: 10px; text-align: left;">Group ID</th>
                  <td style="padding: 10px;">${newGroup._id}</td>
                </tr>
                     <tr>
                  <th style="padding: 10px; text-align: left;">Admin ID</th>
                  <td style="padding: 10px;">${adminId}</td>
                </tr>
                <tr>
                  <th style="padding: 10px; text-align: left;">Contribution Amount</th>
                  <td style="padding: 10px;">${rules.monthlyContribution}</td>
                </tr>
              </table>
              <p>Please log in to your dashboard to view more details and and do the first contrubution today only .</p> 
              <p style="margin-top: 20px;">Best regards,<br><b>The lendLINk - YashDev</b></p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #ddd;"> 
            </div>
          `,

          };

          try {
            await transporter.sendMail(mailOptions);
          } catch (error) {
            console.error(`Failed to send email to ${member.email}:`, error.message);
          }
        }

        return {
          userId: user ? user._id : null,
          name: member.name,
          email: member.email,
          status: user ? "active" : "not found",
          contributionsPaid: 0,
        };
      })
    );

    newGroup.members = processedMembers;
    await newGroup.save();

    res.status(201).json({
      message: "Group created successfully!",
      groupId: newGroup._id,
      groupDetails: newGroup,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error creating group. Please try again later.",
      error: err.message,
    });
  }
});

router.get("/group/:groupId", async (req, res) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findById(groupId).populate("members");
      
      if (!group) {
        return res.status(404).json({ message: "Group not found",success:false });
      }
      res.json(group);
    } catch (err) {
      res.status(500).json({ message: "Error fetching group details", error: err.message });
    }
  });
  router.post("/group/:groupId/select-winner/:totalSum", async (req, res) => {
    try {
      const { groupId, totalSum } = req.params; 

      console.log(totalSum)

      const group = await Group.findById(groupId);

      if (!group || group.members.length === 0) {
        return res.status(404).json({ message: "Group or members not found" });
      }

      const winnersDetails = group.winners || [];

      let winner;

      if (winnersDetails.length === 0) { 

        const randomIndex = Math.floor(Math.random() * group.members.length);
        winner = group.members[randomIndex];
      } else {

        const previousWinners = winnersDetails.map(winner => winner.userId.toString());
        const nonWinners = group.members.filter(member => !previousWinners.includes(member.userId.toString()));

        if (nonWinners.length === 0) {
          return res.status(400).json({ message: "All members are already won." });
        }

        const randomIndex = Math.floor(Math.random() * nonWinners.length);
        winner = nonWinners[randomIndex];
      }

      winnersDetails.push({
        userId: winner.userId,
        name: winner.name,
        ammountReceived: totalSum, 
      });

      group.winners = winnersDetails;

      await group.save();

      res.json({ winnerName: winner.name,winnerId:winner.userId });

    } catch (err) {
      res.status(500).json({ message: "Error selecting winner", error: err.message });
    }
  });

  router.get('/dashUserDetails/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(404).json({ message: "User ID is required." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const noOfGroups = user.groups.length;

      const groupIds = user.groups.map((group) => group.groupId);

      const notifications = user.notifications;

      const groupDetails = await Promise.all(
        groupIds.map(async (groupId) => {
          const group = await Group.findById(groupId);       
          if (group) { 
            let totalContributions = 0;
            group.members.map((member) => {

              if(member.userId.toString() === userId) {
                totalContributions +=member.contributionsPaid;
              }

            })

            console.log(totalContributions)

            return {
              groupId: groupId,
              groupName: group.name,
              totalContributions,
            };
          }
          return null;
        })
      );

      res.status(200).json({
        totalGroups: noOfGroups,
        groupDetails: groupDetails,
        notifications:notifications
      });
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "An error occurred.", error: error.message });
    }
  });

router.post('/group/:groupId/:userId', async (req,res) => {
  const {groupId,userId} = req.params;

  if(!groupId) {
    res.status(404).json( {message: "User ID is required."})
  }

  const group = await Group.findById(groupId)

  if(!group) {
    res.status(404).json( {message: "Group not exist."})
  } 

  if(group.admin.toString() === userId) {
    res.status(202).json({message:"you are the admin",admin:true})
  }

});

router.post('/delete-group-permanent', async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: 'groupId is required', success: false });
    }
    if (!userId) {
      return res.status(400).json({ message: 'userId is required', success: false });
    } 
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found', success: false });
    }
 
    const grpMembers = group.members;
    await Promise.all(
      grpMembers.map(async (member) => {
        const user = await User.findById(member.userId);
        if (user) {
          user.groups = user.groups.filter((group) => group.groupId.toString() !== groupId);
          await user.save();
        }
      })
    );

    return res.status(200).json({
      groupName: `${group.name}`,
      message: 'Group successfully deleted. See you soon!',
      success: true,
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

router.post('/get-latest-winner-date/:groupId',async (req,res) => {
  try {
    const {groupId} = req.params;

    if(!groupId) {
      res.status(404).json({success:false});
    }
    const group = await Group.findById(groupId);

    if(!group) {
      res.status(404).json({success:false});
    }

    const winners = group.winners;

    if(winners.length == 0) {
      res.json({success:true});  
    }
    else {
      const latestWinner = winners[winners.length-1];
      res.json({latestWinner,success:true});  

    }

  } catch (error) {
    return res.status(500).json({success: false });
  }
} )

module.exports = router;