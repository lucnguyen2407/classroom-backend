const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/instructor', instructorRoutes);


//check server is running

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});