require("dotenv").config()
const express = require("express");
const session = require("express-session");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth.js");
const createGroup = require("./routes/createGroup.js")
const handlePayments = require('./routes/handlePayments.js')
const bankAcc = require('./routes/bankAcc.js')
const personalInfo = require('./routes/personalInfo.js');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Group = require("./models/GroupSchema.js");
const GroupChat = require("./models/MessageSchema.js")
const { Server } = require("socket.io");
const checkSpell = require("./routes/checkSpell.js");
const Calender = require("./models/CalenderSet.js"); 
const savingVideo = require("./routes/savingVideo.js")
const contactMe = require('./routes/contactme.js')
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://lend-link-six.vercel.app'],    
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  credentials: true,
}));

app.use(express.json());
app.use(express.static("public"));

 
const { google } = require('googleapis');
const User = require("./models/User.js"); 

const oauth2Client = new google.auth.OAuth2(
   `${process.env.GOOGLE_CLIENT_ID}`,  
   `${process.env.GOOGLE_CLIENT_SECRET_AUTH}`, 
    `${process.env.GOOGLE_CALLBACK}`   
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],  
  });
  res.redirect(authUrl);
});
 
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;  

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try { 

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens) {
      return res.status(400).send('Failed to retrieve tokens');
    }

    oauth2Client.setCredentials(tokens); 
 
    res.send('Google Calendar authentication successful! go and again click that button for setting event');
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
});
 
app.post('/calender/add-payment-dates', async (req, res) => {
  try {
    const { dates, userId, groupId } = req.body;
 
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty dates array' });
    }
 
    const user = await User.findById(userId);
    const group = await Group.findById(groupId);

    if (!user || !group) {
      return res.status(404).json({ error: 'User or Group not found' });
    }
 
    const formattedDates = dates.map(date => convertDateFormat(date));  
    const existingCalendar = await Calender.findOne({ groupId, userId });

    if (!existingCalendar) { 
      await Calender.create({
        groupName: group.name,
        groupId,
        userId,
        paymentDates: formattedDates, 
      });
    } else { 
      const existingDates = new Set(existingCalendar.paymentDates);
      const newDates = formattedDates.filter(date => !existingDates.has(date));

      if (newDates.length === 0) {
        return res.status(400).json({ error: 'You Already added reminder to calender.' });
      }

      existingCalendar.paymentDates.push(...newDates);
      await existingCalendar.save();
    }
 
    for (const date of formattedDates) {
      const event = {
        summary: 'Payment Due',
        description: 'Monthly payment reminder for your group.',
        start: { date, timeZone: 'UTC' },
        end: { date, timeZone: 'UTC' },
      };

      await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
    }

    res.status(200).json({ message: 'Events successfully added to Google Calendar' });
  } catch (error) {
    console.error('Error adding events to calendar:', error);
    res.status(500).json({ error: 'Failed to add events to calendar' });
  }
});

 
function convertDateFormat(dateStr) {
  const [day, month, year] = dateStr.split('/');  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;  
}


const sendPaymentReminder = async (user, group) => {
  try {
    console.log(`Sending payment reminder to User ${user._id} for Group ${group._id} (${group.name}).`);

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
      from: `"Group Reminder" <${process.env.OWNER_EMAIL}>`,
      to: user.email,  
      subject: `Payment Reminder for Group: ${group.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">Payment Reminder</h2>
          <p>Dear ${user.name},</p>
          <p>This is a gentle reminder to make your monthly payment for the group <strong>${group.name}</strong>.</p>
          <p><strong>Group Details:</strong></p>
          <ul>
            <li><strong>Monthly Contribution:</strong> ₹${group.rules.monthlyContribution}</li>
            <li><strong>Payment Due Date:</strong> ${new Date().toDateString()}, 11:59:59 </li>
            <li><strong>Group Admin Id:</strong> ${group.admin || "adminId"}</li>
          </ul>
          <p>Please visit your dashboard to complete the payment as soon as possible.</p>
          <p>if you fail to do so you will be charged or you may be removed by the admin</p>
          <p>If you have already paid, please ignore this email.</p>
          <p>Thank you.</p>
          <p><strong>Team LendLink - YashDev</strong></p>
          <br>
          <p style="font-size: 12px; color: #888;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
    console.log(`Payment reminder email sent successfully to ${user.email}.`);
  } catch (error) {
    console.error(`Failed to send payment reminder to ${user.email}:`, error);
  }
};

cron.schedule('0 8 * * *', async () => { 
  const today = new Date();

  try {
    const groups = await Group.find();

    for (const group of groups) {
      const groupStart = new Date(group.createdAt);

      const monthsSinceStart = calculateMonthsSinceStart(groupStart, today);
  
      if (monthsSinceStart < group.durationMonths) {
        let nextPaymentDate = new Date(groupStart);

        console.log(nextPaymentDate+ "today" + today.toDateString())

      
        while (nextPaymentDate <= today  ) { 
          if (today.getDate() === nextPaymentDate.getDate()) {
            for (const member of group.members) {
              await sendPaymentReminder(member, group);
              console.log(`Reminder sent to ${member.name} for group ${group.name}`);
            }
          }
 
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
      }

    }
  } catch (err) {
    console.error('Error checking payment reminders:', err);
  }
});

function calculateMonthsSinceStart(createdAt, today) {
  const start = new Date(createdAt);
  const current = new Date(today);

  const yearsDifference = current.getFullYear() - start.getFullYear();
  const monthsDifference = current.getMonth() - start.getMonth();

  return yearsDifference * 12 + monthsDifference;
}

app.use(session({
  secret: 'hsfbgshdfbsdfbshdhfsdhbfhfbsdsfbsdfbdsadfgeshfbejbfdsfbdsfbdsjfbdfbdfbdjfbdjfbdbf',
  resave: false,
  saveUninitialized: true,
}));


app.use("/auth", authRoutes);
app.use("/new-grp", createGroup);
app.use("/make-payment", handlePayments);
app.use("/bank-acc", bankAcc)
app.use("/personal-info", personalInfo);
app.use("/checkSpell", checkSpell);
app.use('/saving-video',savingVideo);
app.use('/contact-me',contactMe)
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_FRONTEND_URL || 'http://localhost:5173', 
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {

  socket.on('joinGroup', async (groupId) => {
    try {
      socket.join(groupId);
    } catch (error) {
      console.error('Error handling joinGroup:', error);
    }
  });

  app.post('/check-for-eligible', async (req, res) => {

    const { userId, groupId } = req.body; 

    if(!userId) {
      res.status(404).json({ message: 'userId not found', success: false })
    }
    if (!groupId) {
      res.status(404).json({ message: 'groupId not found', success: false })
    }

    const group = await Group.findById(groupId);

    if (!group) {
      res.status(404).json({ message: 'group not found', success: false })
    }

    const members = group.members
    let isPermitted = false;

    for(let i=0;i<members.length;i++) {
      if(members[i].userId.toString() === userId) {
        isPermitted= true;
        break;
      }
      else {
        isPermitted= false;
      }
    }

    if(isPermitted) {
      res.status(202).json({success:true})
    }
    else {
      res.status(400).json({success:false}) 
    }


  })

  app.get('/get-messages/:groupId', async (req, res) => {
    const { groupId } = req.params;

    try {
      const groupChat = await GroupChat.findOne({ groupId });

      if (groupChat) {
        res.json(groupChat.messages);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  });

  socket.on('sendMessage', async ({ groupId, message, username }) => {
    try {
      let groupChat = await GroupChat.findOne({ groupId });

      if (groupChat) {
        // Add the new message to the existing group
        const newMessage = { username, message, timestamp: new Date() };
        groupChat.messages.push(newMessage);
        await groupChat.save();

        io.to(groupId).emit('receiveMessage', newMessage);
      } else {
        // Create a new group chat document if it doesn't exist
        const newGroupChat = new GroupChat({
          groupId,
          messages: [{ username, message, timestamp: new Date() }],
        });
        await newGroupChat.save();

        // Emit the message to the group
        io.to(groupId).emit('receiveMessage', {
          username,
          message,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error handling sendMessage:', error);
    }
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


app.post('/handel-delete/:msgId', async (req, res) => {
  const { msgId, groupId } = req.body;

  try {
    let groupChat = await GroupChat.findOne({ groupId });

    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found." });
    }

    groupChat.messages = groupChat.messages.filter((msg) => msg._id.toString() !== msgId);

    await groupChat.save();

    io.to(groupId).emit('messageDeleted', { msgId });

    res.json({ message: "Message deleted successfully", msgId, groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting message", error: error.message });
  }
});

const PORT = process.env.PORT || 3001;


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017', {
  dbName: "lendLink"
})
  .then(() => {

    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((err) => console.log(`Database connection error: ${err.message}`));



