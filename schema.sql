CREATE DATABASE IF NOT EXISTS lmshci;
USE lmshci;

-- Table: teacher
CREATE TABLE IF NOT EXISTS teacher (
    uname VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Table: course (uname is nullable)
CREATE TABLE IF NOT EXISTS course (
    cid VARCHAR(50) PRIMARY KEY,
    cname VARCHAR(100) NOT NULL,
    uname VARCHAR(50) DEFAULT NULL -- Allows NULL
);

-- Table: student
CREATE TABLE IF NOT EXISTS student (
    roll_no VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    cid VARCHAR(50) DEFAULT NULL -- No foreign key
);

-- Table: materials
CREATE TABLE IF NOT EXISTS materials (
    cid VARCHAR(50) PRIMARY KEY,
    document VARCHAR(255) NOT NULL
);

-- Table: quiz
CREATE TABLE IF NOT EXISTS quiz (
    cid VARCHAR(50) PRIMARY KEY,
    quiz_name VARCHAR(255) NOT NULL
);

-- Insert sample courses (uname remains NULL)
INSERT INTO course (cid, cname) VALUES
('CS101', 'Introduction to Programming'),
('CS102', 'Data Structures & Algorithms'),
('CS103', 'Database Management Systems'),
('CS104', 'Operating Systems'),
('CS105', 'Computer Networks'),
('CS106', 'Artificial Intelligence');
