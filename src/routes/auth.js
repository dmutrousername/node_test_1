const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register endpoint
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    User.registerUser(username, password, (err, userId) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to register user' });
        }
        res.status(201).json({ userId });
    });
});

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findUserByUsername(username, (err, user) => {
        if (err || !user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        res.status(200).json({ message: 'Login successful' });
    });
});

module.exports = router;