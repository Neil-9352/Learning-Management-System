const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Fetch courses from the database
app.get("/get_courses", (req, res) => {
    const sql = "SELECT cid, cname FROM course";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results); // Send courses as JSON
    });
});


// Student Registration Route
app.post("/student_register", async (req, res) => {
    const { name, email, rollNumber, password, course } = req.body;

    if (!name || !email || !rollNumber || !password || !course) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO student (roll_no, name, email, password, cid) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [rollNumber, name, email, hashedPassword, course], (err, result) => {
            if (err) {
                console.error("Error inserting student:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ success: true, message: "Student registered successfully" });
        });
    } catch (error) {
        console.error("Hashing error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Student Login Route
app.post("/student_login", (req, res) => {
    const { rollNumber, password } = req.body;

    const sql = "SELECT * FROM student WHERE roll_no = ?";
    db.query(sql, [rollNumber], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = results[0];

        // Compare password with hashed password in DB
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Store session
        req.session.user = { rollNumber: user.roll_no, name: user.name };
        res.json({ success: true, message: "Login successful" });
    });
});

// Protected Route for Student Dashboard
app.get("/student_dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/pages/student_login.html"); // Redirect if not logged in
    }
    res.sendFile(path.join(__dirname, "pages", "student_dashboard.html"));
});

app.get("/check_session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/get_student_info", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    res.json({ name: req.session.user.name });
});



// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }

        res.clearCookie("connect.sid"); // Clear session cookie
        res.redirect("/pages/student_login.html"); // Redirect to login page
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
