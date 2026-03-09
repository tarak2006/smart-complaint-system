const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { connectAndQuery } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'astracare-secret-key';

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        const userRole = role || 'User';
        const targetTable = userRole === 'Technician' ? 'Technicians' : 'Users';

        // Check if user already exists in either table
        const checkUserQuery = 'SELECT id FROM Users WHERE email = ?';
        const checkTechQuery = 'SELECT id FROM Technicians WHERE email = ?';
        const existingUser = await connectAndQuery(checkUserQuery, [email]);
        const existingTech = await connectAndQuery(checkTechQuery, [email]);

        if (existingUser.rows.length > 0 || existingTech.rows.length > 0) {
            return res.status(400).json({ error: 'Account with this email already exists' });
        }

        // Insert into the appropriate table
        const phoneColumn = userRole === 'Technician' ? 'phone_number' : 'phone';
        const insertQuery = `
            INSERT INTO ${targetTable} (name, email, password, ${phoneColumn}, role)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?)
        `;
        const insertParams = [name, email, password, phone || '', userRole];

        const result = await connectAndQuery(insertQuery, insertParams);
        const userId = result.insertId;

        const token = jwt.sign({ id: userId, email, role: userRole }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: userId, name, email, role: userRole } });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Try Users table first
        let query = 'SELECT id, name, email, role FROM Users WHERE email = ? AND password = ?';
        let result = await connectAndQuery(query, [email, password]);
        let userRole = 'User';

        if (result.rows.length === 0) {
            // Try Technicians table
            query = 'SELECT id, name, email, role FROM Technicians WHERE email = ? AND password = ?';
            result = await connectAndQuery(query, [email, password]);
            userRole = 'Technician';
        }

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

module.exports = router;
