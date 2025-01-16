const express = require('express'); 
require('dotenv').config(); 
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Group = require('../models/GroupSchema');

router.post('/correct-text', async (req, res) => {

    const key = process.env.GOOGLE_SECRET_KEY_GEMINI

    const { text } = req.body;

    console.log(text)
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    try {

    const genAI = new GoogleGenerativeAI(`${key}`);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `give me same sized corrected text with spelling correction and gramatically correct for this text: "${text}" `;

    const result = await model.generateContent(prompt);

        const correctedText = result.response.text();

        console.log(correctedText)

        res.json({ correctedText });
    } catch (error) {
        console.error('Error correcting text:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error correcting text' });
    }

});

router.post('/getmemberdetails', async (req,res) => {
     const {groupId} = req.body;

     if(!groupId) {
        res.status(404).json({message:'groupId not available', success:false})
     }
     const group = await Group.findById(groupId);

     const members = group.members;
     console.log(members);

     if(!members) {
        res.status(404).json({message:'members not available', success:false})
     }
     res.status(202).json({members})

} )

module.exports = router;