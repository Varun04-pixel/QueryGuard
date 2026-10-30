const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configure MySQL connection (Update password/user to match your Workbench setup)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,          // Replace with your MySQL username
    password: process.env.DB_PASSWORD, // Replace with your MySQL password
    database: process.env.DB_NAME,
    multipleStatements: true // Allows multi-statement payload testing if needed
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Workbench database: queryguard_lab');
});

// LOGIN ENDPOINT WITH QUERYGUARD TOGGLE
app.post('/api/login', (req, res) => {
    const { username, password, queryGuardEnabled } = req.body;

    if (queryGuardEnabled) {
        // ==========================================
        // QUERYGUARD ENABLED (SECURE MODE)
        // ==========================================
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        console.log(`[SECURE - QUERYGUARD ACTIVE]: Parameterized query executed.`);

        db.query(query, [username, password], (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error occurred.' }); // Safe error handling (T05)
            }

            if (results.length > 0) {
                res.json({ 
                    success: true, 
                    message: 'QueryGuard Active: Authenticated securely!', 
                    user: results[0],
                    mode: 'Secure (Parameterized)' 
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials. Access Denied.' });
            }
        });

    } else {
        // ==========================================
        // QUERYGUARD DISABLED (VULNERABLE BASELINE)
        // ==========================================
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        console.log(`[INSECURE - QUERYGUARD DISABLED]: ${query}`);

        db.query(query, (err, results) => {
            if (err) {
                // Exposes raw error stack for baseline lab testing (T05)
                return res.status(500).json({ error: err.message, executedQuery: query });
            }

            if (results.length > 0) {
                res.json({ 
                    success: true, 
                    message: 'Vulnerable Mode: Access Granted via SQL Injection!', 
                    user: results[0],
                    executedQuery: query,
                    mode: 'Vulnerable (String Concatenation)' 
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: 'Invalid credentials. Access Denied.', 
                    executedQuery: query 
                });
            }
        });
    }
});

app.listen(5000, () => {
    console.log('QueryGuard backend server running on http://localhost:5000');
});