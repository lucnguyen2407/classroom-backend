const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const authMiddleware = require('../middleware/middleware');

// GET /students
router.get('/students', authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const students = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.role === "student") {
                students.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        res.status(200).json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /addStudent
router.post('/addStudent', async (req, res) => {
    const { studentName, phoneNumber, emailAddress, address, dateOfBirth } = req.body;

    if (!studentName || !phoneNumber || !emailAddress || !dateOfBirth) {
        return res.status(400).json({ error: 'Missing data. All fields are required except address' });
    }

    try {
        const studentRef = db.collection('users').doc(phoneNumber);
        const studentDoc = await studentRef.get();

        if (studentDoc.exists) {
            return res.status(400).json({ error: 'Student already exists' });
        }

        await studentRef.set({
            role: "student",
            studentName,
            emailAddress,
            dateOfBirth,
            ...(address && { address }) // chỉ thêm nếu có
        });

        res.status(200).json({ message: 'Student added successfully' });
    } catch (err) {
        console.error('Error adding student:', err);
        res.status(500).json({ error: 'Server error, could not add student' });
    }
});

module.exports = router;