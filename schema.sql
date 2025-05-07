-- Create and use database
CREATE DATABASE IF NOT EXISTS lmshci;
USE lmshci;

-- Course table
DROP TABLE IF EXISTS course;
CREATE TABLE course (
  cid VARCHAR(50) PRIMARY KEY,
  cname VARCHAR(100) NOT NULL
);

-- Insert course data
INSERT INTO course (cid, cname) VALUES
  ('IT311','Database Management Systems'),
  ('IT312','Design and Analysis of Algorithms'),
  ('IT313','Operating Systems'),
  ('IT314','Software Engineering'),
  ('IT315','Advanced Programming (Java)'),
  ('IT321','Formal Language and Automata Theory'),
  ('IT322','Artificial Intelligence & Machine Learning'),
  ('IT920','Human Computer Interfacing'),
  ('IT930','Data Mining and Warehousing');

-- Materials table
DROP TABLE IF EXISTS materials;
CREATE TABLE materials (
  mid VARCHAR(50) PRIMARY KEY,
  cid VARCHAR(50),
  document VARCHAR(255) NOT NULL,
  FOREIGN KEY (cid) REFERENCES course(cid)
);

-- Quiz table
DROP TABLE IF EXISTS quiz;
CREATE TABLE quiz (
  qid VARCHAR(50) PRIMARY KEY,
  cid VARCHAR(50),
  quiz_name VARCHAR(255) NOT NULL,
  FOREIGN KEY (cid) REFERENCES course(cid)
);

-- Quizzes (JSON) table
DROP TABLE IF EXISTS quizzes;
CREATE TABLE quizzes (
  quiz_id INT PRIMARY KEY AUTO_INCREMENT,
  cid VARCHAR(50) NOT NULL,
  questions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cid) REFERENCES course(cid)
);

-- Student table
DROP TABLE IF EXISTS student;
CREATE TABLE student (
  roll_no VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  cid1 VARCHAR(50),
  cid2 VARCHAR(50),
  cid3 VARCHAR(50),
  FOREIGN KEY (cid1) REFERENCES course(cid),
  FOREIGN KEY (cid2) REFERENCES course(cid),
  FOREIGN KEY (cid3) REFERENCES course(cid)
);

-- Teacher table
DROP TABLE IF EXISTS teacher;
CREATE TABLE teacher (
  uname VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  cid VARCHAR(50) UNIQUE,
  FOREIGN KEY (cid) REFERENCES course(cid)
);

CREATE TABLE quiz_marks (
    quiz_id INT,
    roll_no VARCHAR(20),
    marks INT,
    PRIMARY KEY (quiz_id, roll_no)
);
