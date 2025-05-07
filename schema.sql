CREATE DATABASE IF NOT EXISTS `lmshci`;
USE `lmshci`;

CREATE TABLE `course` (
  `cid` varchar(50) NOT NULL,
  `cname` varchar(100) NOT NULL,
  PRIMARY KEY (`cid`)
);

INSERT INTO `course` VALUES
('IT311','Database Management Systems'),
('IT312','Design and Analysis of Algorithms'),
('IT313','Operating Systems'),
('IT314','Software Engineering'),
('IT315','Advanced Programming (Java)'),
('IT321','Formal Language and Automata Theory'),
('IT322','Artificial Intelligence & Machine Learning'),
('IT920','Human Computer Interfacing'),
('IT930','Data Mining and Warehousing');

CREATE TABLE `materials` (
  `mid` varchar(50) NOT NULL,
  `cid` varchar(50) DEFAULT NULL,
  `document` varchar(255) NOT NULL,
  PRIMARY KEY (`mid`),
  KEY `fk_materials_course` (`cid`),
  CONSTRAINT `fk_materials_course` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`)
);

CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `sender_role` enum('student','teacher') NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `receiver_id` varchar(50) NOT NULL,
  `message` text,
  `image_path` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
);

CREATE TABLE `quiz_marks` (
  `quiz_id` int NOT NULL,
  `roll_no` varchar(20) NOT NULL,
  `marks` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `cid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`quiz_id`,`roll_no`)
);

CREATE TABLE `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `cid` varchar(50) NOT NULL,
  `questions` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`quiz_id`),
  KEY `cid` (`cid`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`) ON DELETE CASCADE
);

CREATE TABLE `student` (
  `roll_no` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `cid1` varchar(50) DEFAULT NULL,
  `cid2` varchar(50) DEFAULT NULL,
  `cid3` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`roll_no`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_student_course1` (`cid1`),
  KEY `fk_student_course2` (`cid2`),
  KEY `fk_student_course3` (`cid3`),
  CONSTRAINT `fk_student_course1` FOREIGN KEY (`cid1`) REFERENCES `course` (`cid`),
  CONSTRAINT `fk_student_course2` FOREIGN KEY (`cid2`) REFERENCES `course` (`cid`),
  CONSTRAINT `fk_student_course3` FOREIGN KEY (`cid3`) REFERENCES `course` (`cid`)
);

CREATE TABLE `teacher` (
  `uname` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`uname`),
  UNIQUE KEY `email` (`email`)
);
