require('dotenv').config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const accountSid = process.env.ACCOUNT_SID; 
const authToken = process.env.AUTH_TOKEN;  
const client = new twilio(accountSid, authToken);

let otpHolder = {}; 

router.post("/send-otp-email", async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpHolder[email] = otp;

    console.log(otp)

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
      from: "LendLink OTP" + process.env.OWNER_EMAIL,
      to: email,
      subject: "OTP for Registration",
      html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (parseInt(otp) === otpHolder[email]) {
    delete otpHolder[email]; 
    res.status(200).json({ success: true, message: 'OTP verified successfully!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, address, age, password } = req.body; 

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      address,
      age,
      password: hashedPassword,
    });

    client.messages.create({
      body: 'Hello from LendLink! you have successfully registered and created your account on lindLink',
      to: phone,
      from: '+12186338436' 
  })
  .then((message) => console.log(`Message SID: ${message.sid}`))
  .catch((error) => console.error(error));

    await newUser.save();
    res.status(200).json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed!", error: err.message });
  }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(409).json({ message: "User doesn't exist!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });

        res.status(200).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;