const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = 3000;

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
});

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("materials")); // Serve uploaded files
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore, // ✅ add this
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // Optional: 1 day session lifespan
        },
    })
);

// Ensure 'materials' folder exists
const uploadDir = path.join(__dirname, "materials");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.get("/get_courses_student", (req, res) => {
    const sql = `
        SELECT c.cid, c.cname
        FROM course c`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Fetch courses from the database
app.get("/get_courses", (req, res) => {
    const sql = `
        SELECT c.cid, c.cname
        FROM course c
        LEFT JOIN teacher t ON c.cid = t.cid
        WHERE t.cid IS NULL`; // Only select courses that are not assigned

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Student Registration Route
app.post("/student_register", async (req, res) => {
    const { name, email, rollNumber, password, course1, course2, course3 } =
        req.body;

    if (
        !name ||
        !email ||
        !rollNumber ||
        !password ||
        !course1 ||
        !course2 ||
        !course3
    ) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql =
            "INSERT INTO student (roll_no, name, email, password, cid1, cid2, cid3) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(
            sql,
            [
                rollNumber,
                name,
                email,
                hashedPassword,
                course1,
                course2,
                course3,
            ],
            (err, result) => {
                if (err) {
                    console.error("Error inserting student:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json({
                    success: true,
                    message: "Student registered successfully",
                });
            }
        );
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

        // Store session with name and 3 courses
        req.session.user = {
            role: "student",
            sender_id: user.roll_no,
            roll_no: user.roll_no,
            name: user.name,
            cid1: user.cid1,
            cid2: user.cid2,
            cid3: user.cid3,
        };

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

    if (req.session.user.role !== "student") {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to logout" });
            }
            return res
                .status(403)
                .json({ error: "Access denied. Logged out." });
        });
    } else {
        const { roll_no } = req.session.user;

        const sql = `
            SELECT s.roll_no, s.name, s.cid1, c1.cname AS cname1, 
                   s.cid2, c2.cname AS cname2, 
                   s.cid3, c3.cname AS cname3
            FROM student s
            LEFT JOIN course c1 ON s.cid1 = c1.cid
            LEFT JOIN course c2 ON s.cid2 = c2.cid
            LEFT JOIN course c3 ON s.cid3 = c3.cid
            WHERE s.roll_no = ?
        `;

        db.query(sql, [roll_no], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Student not found" });
            }

            res.json(results[0]);
        });
    }
});

app.post("/submit_quiz", (req, res) => {
    console.log(req.body); // Debug log

    const { quizId, rollNumber, marks, cid } = req.body;

    // Check if the cid is available in the session
    console.log(cid);
    if (!cid) {
        return res
            .status(401)
            .json({ error: "Unauthorized. cid not found in session." });
    }

    // Validate if all required fields are provided
    if (!quizId || !rollNumber || marks == null || !cid) {
        return res.status(400).json({
            error: "Missing required data (quizId, rollNumber, marks)",
        });
    }

    // Ensure marks are a valid number (for sanity checks)
    if (typeof marks !== "number" || marks < 0) {
        return res.status(400).json({ error: "Invalid marks value" });
    }

    const insertSql = `
        INSERT INTO quiz_marks (quiz_id, roll_no, marks, cid, submitted_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            marks = VALUES(marks),
            submitted_at = NOW()
    `;

    // Insert quiz mark into the database including the cid from session
    db.query(insertSql, [quizId, rollNumber, marks, cid], (err) => {
        if (err) {
            console.error("Error updating marks:", err);
            return res
                .status(500)
                .json({ error: "Error updating marks in the database" });
        }

        // Log successful submission
        console.log(
            `Quiz submitted: quizId=${quizId}, rollNumber=${rollNumber}, marks=${marks}, cid=${cid}`
        );

        res.json({ success: true });
    });
});

app.get("/quiz_report", (req, res) => {
    const teacherCid = req.session.user ? req.session.user.cid : null;

    if (!teacherCid) {
        return res
            .status(401)
            .json({ error: "Unauthorized. Teacher not logged in." });
    }

    const timeframe = req.query.timeframe;
    let sql = `
        SELECT qm.quiz_id, qm.roll_no, s.name, qm.cid, qm.marks, qm.submitted_at
        FROM quiz_marks qm
        JOIN student s ON qm.roll_no = s.roll_no
        WHERE qm.cid = ?`; // Directly filter based on cid in quiz_marks

    const values = [teacherCid];

    if (timeframe === "weekly") {
        sql += ` AND qm.submitted_at >= NOW() - INTERVAL 7 DAY`;
    } else if (timeframe === "monthly") {
        sql += ` AND qm.submitted_at >= NOW() - INTERVAL 1 MONTH`;
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error("Error fetching quiz report:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json({
            teacherCid: teacherCid,
            reportData: results,
        });
    });
});

// Route to fetch materials and quizzes for a specific course
app.get("/course/:cid", (req, res) => {
    const courseId = req.params.cid;

    // Query materials for the given course ID
    const materialsSql = "SELECT * FROM materials WHERE cid = ?";
    db.query(materialsSql, [courseId], (err, materialsResults) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // Query quizzes for the given course ID
        const quizzesSql = "SELECT * FROM quizzes WHERE cid = ?";
        db.query(quizzesSql, [courseId], (err, quizzesResults) => {
            if (err) return res.status(500).json({ error: "Database error" });

            // Send both materials and quizzes data as a JSON response
            res.json({
                materials: materialsResults,
                quizzes: quizzesResults,
            });
        });
    });
});

// Get Quiz by quiz_id
app.get("/get_quiz/:quiz_id", (req, res) => {
    const quizId = req.params.quiz_id;

    const query = "SELECT questions FROM quizzes WHERE quiz_id = ?";
    db.query(query, [quizId], (err, results) => {
        if (err) {
            console.error("Error fetching quiz:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        // If questions are already a JSON object, just send it
        res.json({ questions: results[0].questions });
    });
});

// Teacher Registration Route
app.post("/teacher_register", async (req, res) => {
    const { name, email, username, password, course } = req.body;

    if (!name || !email || !username || !password || !course) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql =
            "INSERT INTO teacher (uname, name, email, password, cid) VALUES (?, ?, ?, ?, ?)";
        db.query(
            sql,
            [username, name, email, hashedPassword, course],
            (err, result) => {
                if (err) {
                    console.error("Error inserting teacher:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                res.json({
                    success: true,
                    message: "Teacher registered successfully",
                });
            }
        );
    } catch (error) {
        console.error("Hashing error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/teacher_login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM teacher WHERE uname = ?";
    db.query(sql, [username], async (err, results) => {
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
        req.session.user = {
            role: "teacher",
            sender_id: user.uname,
            username: user.uname,
            name: user.name,
            cid: user.cid,
        };
        res.json({ success: true, message: "Login successful" });
    });
});

// Protected Route for Teacher Dashboard
app.get("/teacher_dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/pages/teacher_login.html"); // Redirect if not logged in
    }
    res.sendFile(path.join(__dirname, "pages", "teacher_dashboard.html"));
});

// Get Teacher Info
app.get("/get_teacher_info", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    if (req.session.user.role !== "teacher") {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to logout" });
            }
            return res.status(403).json({ error: "Access denied. Logged out." });
        });
    } else {
        const { name, role, cid } = req.session.user;

        const sql = "SELECT cname FROM course WHERE cid = ?";
        db.query(sql, [cid], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: "Course not found" });
            }

            const cname = result[0].cname;
            res.json({ name, role, cid, cname });
        });
    }
});


// Multer Config for File Uploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({ storage });

// Upload Material
app.post("/upload_material", upload.single("file"), (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const filePath = `/materials/${req.file.filename}`;
    const username = req.session.user.username;

    // Get the teacher's course
    const getCourseId = "SELECT cid FROM teacher WHERE uname = ?";
    db.query(getCourseId, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Course not found" });
        }

        const courseId = results[0].cid;
        const materialId = `MAT${Date.now()}`;

        // Insert material into the database
        const materialInsertQuery =
            "INSERT INTO materials (mid, cid, document) VALUES (?, ?, ?)";
        db.query(
            materialInsertQuery,
            [materialId, courseId, filePath],
            (err) => {
                if (err) {
                    console.error("Database error:", err);
                    return res
                        .status(500)
                        .json({ error: "Failed to save material" });
                }

                res.json({
                    success: true,
                    message: "File uploaded successfully",
                    path: filePath,
                });
            }
        );
    });
});

// Get Materials (teacher)
app.get("/get_materials", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const sql =
        "SELECT mid, document FROM materials WHERE cid = (SELECT cid FROM teacher WHERE uname = ?)";
    db.query(sql, [req.session.user.username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});

// upload quiz
app.post("/upload_quiz", (req, res) => {
    const cid = req.session.user.cid;
    const { questions } = req.body;
    const quizData = JSON.stringify(questions);

    const query = "INSERT INTO quizzes (cid, questions) VALUES (?, ?)";
    db.query(query, [cid, quizData], (err, result) => {
        if (err) {
            console.error("Error inserting quiz:", err);
            return res.status(500).json({ message: "Failed to upload quiz" });
        }
        res.json({
            message: "Quiz uploaded successfully!",
            quizId: result.insertId,
        });
    });
});

// view quizzes (teacher)
app.get("/get_quizzes", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const cid = req.session.user.cid;
    const query = "SELECT quiz_id, questions FROM quizzes WHERE cid = ?";

    db.query(query, [cid], (err, results) => {
        if (err) {
            console.error("Error fetching quizzes:", err);
            return res.status(500).json({ message: "Failed to fetch quizzes" });
        }
        res.json({ quizzes: results });
    });
});

// delete quiz
app.delete("/delete_quiz/:quiz_id", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const quizId = req.params.quiz_id;
    const cid = req.session.user.cid;

    const query = "DELETE FROM quizzes WHERE quiz_id = ? AND cid = ?";

    db.query(query, [quizId, cid], (err, result) => {
        if (err) {
            console.error("Error deleting quiz:", err);
            return res.status(500).json({ message: "Failed to delete quiz" });
        }
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "Quiz not found or unauthorized" });
        }
        res.json({ message: "Quiz deleted successfully" });
    });
});

const studentUploadDir = path.join(__dirname, "message_uploads");
if (!fs.existsSync(studentUploadDir)) {
    fs.mkdirSync(studentUploadDir);
} // Directory for saving uploaded images

const studentStorage = multer.diskStorage({
    destination: studentUploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const studentUpload = multer({ storage: studentStorage });

// Student Sends a Message with Image Upload (does not interfere with teacher uploads)
app.post("/student/chat/send", studentUpload.single("image"), (req, res) => {
    try {
        const { message, course_id } = req.body;
        const student_id = req.session.user.sender_id;
        const sender_role = "student";
        const image_path = req.file ? req.file.filename : null; // Adjust if you're saving full path

        const sql = `SELECT uname FROM teacher WHERE cid = ?`;

        db.query(sql, [course_id], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    error: "Error querying the teacher",
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: "No teacher found for this course",
                });
            }

            const receiver_id = result[0].uname;

            const insertMessageSql = `
                INSERT INTO messages (sender_role, sender_id, receiver_id, message, image_path, timestamp)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            db.query(
                insertMessageSql,
                [
                    sender_role,
                    student_id,
                    receiver_id,
                    message || null,
                    image_path,
                ],
                (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({
                            success: false,
                            error: "Database error while sending message",
                        });
                    }
                    res.json({ success: true });
                }
            );
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// Fetch Messages Between Student and Assigned Teacher by Course ID
app.get("/student/chat/messages", (req, res) => {
    const student_id = req.session.user.sender_id;
    const course_id = req.query.cid;

    if (!course_id) {
        return res.status(400).json({ error: "Missing course ID" });
    }

    // Step 1: Get the teacher's uname from the course ID
    const getTeacherSql = `SELECT uname FROM teacher WHERE cid = ?`;
    db.query(getTeacherSql, [course_id], (err, teacherResult) => {
        if (err) {
            return res
                .status(500)
                .json({ error: "Database error fetching teacher" });
        }

        if (teacherResult.length === 0) {
            return res
                .status(404)
                .json({ error: "No teacher found for this course" });
        }

        const teacher_id = teacherResult[0].uname;

        // Step 2: Fetch messages between the student and the matched teacher
        const messageSql = `
            SELECT * FROM messages
            WHERE 
                ((sender_id = ? AND receiver_id = ?) OR 
                 (sender_id = ? AND receiver_id = ?))
            ORDER BY timestamp ASC
        `;

        db.query(
            messageSql,
            [student_id, teacher_id, teacher_id, student_id],
            (err, messages) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ error: "Database error fetching messages" });
                }

                // Add full image URL path for frontend
                const formattedMessages = messages.map((msg) => {
                    if (msg.image_path) {
                        msg.image_url = `/message_uploads/${msg.image_path}`;
                    }
                    return msg;
                });

                res.json({ success: true, messages: formattedMessages });
            }
        );
    });
});

// Route: Get students enrolled in the teacher's course
app.get("/teacher/students", (req, res) => {
    const teacherCid = req.session.user.cid; // assuming session has cid

    const sql = `
        SELECT roll_no, name 
        FROM student 
        WHERE cid1 = ? OR cid2 = ? OR cid3 = ?
    `;

    db.query(sql, [teacherCid, teacherCid, teacherCid], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, students: results });
    });
});

app.get("/teacher/chat/messages", (req, res) => {
    const teacher_cid = req.session.user.cid;
    const student_id = req.query.student_id;

    if (!teacher_cid || !student_id) {
        return res.status(400).json({
            success: false,
            error: "Missing teacher cid or student id",
        });
    }

    // First get teacher's uname (ID) using the session
    const getTeacherIdQuery = "SELECT uname FROM teacher WHERE cid = ?";
    db.query(getTeacherIdQuery, [teacher_cid], (err, teacherResults) => {
        if (err || teacherResults.length === 0) {
            return res
                .status(500)
                .json({ success: false, error: "Teacher not found" });
        }

        const teacher_id = teacherResults[0].uname;

        const sql = `
            SELECT * FROM messages
            WHERE 
                (sender_id = ? AND receiver_id = ?) OR 
                (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `;

        db.query(
            sql,
            [teacher_id, student_id, student_id, teacher_id],
            (err, results) => {
                if (err) {
                    return res
                        .status(500)
                        .json({ success: false, error: "Database error" });
                }
                res.json({ success: true, messages: results });
            }
        );
    });
});

// New Multer Config for Teacher Chat Image Uploads
const teacherUploadDir = path.join(__dirname, "message_uploads");
if (!fs.existsSync(teacherUploadDir)) {
    fs.mkdirSync(teacherUploadDir);
} // Directory for saving uploaded images

const teacherStorage = multer.diskStorage({
    destination: teacherUploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const teacherUpload = multer({ storage: teacherStorage });

app.post("/teacher/chat/send", teacherUpload.single("image"), (req, res) => {
    try {
        const teacher_cid = req.session.user.cid;
        const { receiver_id, message } = req.body;
        const image_path = req.file ? req.file.filename : null; // The image path is stored here

        if (!teacher_cid || !receiver_id || (!message && !image_path)) {
            return res
                .status(400)
                .json({ success: false, error: "Missing required fields" });
        }

        // Get the teacher's username using the teacher's cid
        const getTeacherIdQuery = "SELECT uname FROM teacher WHERE cid = ?";
        db.query(getTeacherIdQuery, [teacher_cid], (err, teacherResults) => {
            if (err || teacherResults.length === 0) {
                return res
                    .status(500)
                    .json({ success: false, error: "Teacher not found" });
            }

            const teacher_id = teacherResults[0].uname;

            // Insert the message into the database
            const insertMessageQuery = `
                INSERT INTO messages (sender_role, sender_id, receiver_id, message, image_path, timestamp)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            db.query(
                insertMessageQuery,
                [
                    "teacher",
                    teacher_id,
                    receiver_id,
                    message || null,
                    image_path,
                ],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: "Failed to send message",
                        });
                    }
                    res.json({ success: true });
                }
            );
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }

        res.clearCookie("connect.sid"); // Clear session cookie
        res.redirect("/"); // Redirect to login page
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
