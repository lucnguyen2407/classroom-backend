const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

//check server is running

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

//TODO: connect to firebase

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});