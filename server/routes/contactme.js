const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post('/contact-me-form', async (req, res) => {
    const { name, email, message } = req.body; 

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
        from: process.env.OWNER_EMAIL,  
        to: process.env.OWNER_EMAIL,  
        subject: "New Contact Form Submission",  
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions); 
        return res.status(200).json({ message: "Verification email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending message." });
    }
});


module.exports = router;