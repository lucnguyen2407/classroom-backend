const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const twilio = require('twilio');
const authMiddleware = require('../middleware/middleware');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE;

function generateCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
}

//POST /createAccessCode

router.post('/createAccessCode', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is missing' });
        }
        const code = generateCode();
        await db.collection('codes').doc(phoneNumber).set({
            code,
            createdAt: new Date()
        });
        await twilioClient.messages.create({
            body: `Your access code is: ${code}`,
            from: twilioPhone,
            to: phoneNumber
        });
        res.status(200).json({ message: 'Access code sent successfully' });
    } catch (error) {
        console.log('Error sending access code:', error);
        res.status(500).json({ error: 'Failed to send access code' });
    }
});

//POST /verifyAccessCode
router.post('/verifyAccessCode', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        if (!phoneNumber || !code) {
            return res.status(400).json({ error: 'Phone number and code are missing' });
        }

        const doc = await db.collection('codes').doc(phoneNumber).get();
        if (!doc.exists || doc.data().code !== code) {
            return res.status(401).json({ error: 'Invalid code' });
        }

        await db.collection('codes').doc(phoneNumber).set({
            code: '',
            createdAt: new Date()
        });

        const userDoc = await db.collection('users').doc(phoneNumber).get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        const { role } = userDoc.data();

        res.status(200).json({ message: 'Code verified successfully', role });
    } catch (error) {
        console.log('Error verifying access code:', error);
        res.status(500).json({ error: 'Failed to verify access code' });
    }
});

// POST /register
router.post('/register', async (req, res) => {
    const { phoneNumber, name, email } = req.body;

    if (!phoneNumber || !name || !email) {
        return res.status(400).json({ error: 'Missing data. All fields are required' });
    }

    const userExists = await db.collection('users').doc(phoneNumber).get();
    if (userExists.exists) {
        return res.status(400).json({ error: 'User already exists' });
    }

    try {
        await db.collection('users').doc(phoneNumber).set({
            role: "student",
            name,
            email
        });

        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error, could not register user' });
    }
});

module.exports = router;
