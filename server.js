const express = require("express");
const path = require("path");
const db = require("./db"); // Import MySQL database connection

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON data

// Route to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Route to handle student registration
app.post("/student_register", (req, res) => {
    const { name, email, rollNumber, password, course } = req.body;

    if (!name || !email || !rollNumber || !password || !course) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Insert into MySQL database
    const sql = "INSERT INTO student (roll_no, name, email, password, cid) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [rollNumber, name, email, password, course], (err, result) => {
        if (err) {
            console.error("Error inserting student:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Student registered successfully" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
