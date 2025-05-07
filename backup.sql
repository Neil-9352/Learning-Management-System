-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: lmshci
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `cid` varchar(50) NOT NULL,
  `cname` varchar(100) NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES ('IT311','Database Management Systems'),('IT312','Design and Analysis of Algorithms'),('IT313','Operating Systems'),('IT314','Software Engineering'),('IT315','Advanced Programming (Java)'),('IT321','Formal Language and Automata Theory'),('IT322','Artificial Intelligence & Machine Learning'),('IT920','Human Computer Interfacing'),('IT930','Data Mining and Warehousing');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materials`
--

DROP TABLE IF EXISTS `materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materials` (
  `mid` varchar(50) NOT NULL,
  `cid` varchar(50) DEFAULT NULL,
  `document` varchar(255) NOT NULL,
  PRIMARY KEY (`mid`),
  KEY `fk_materials_course` (`cid`),
  CONSTRAINT `fk_materials_course` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materials`
--

LOCK TABLES `materials` WRITE;
/*!40000 ALTER TABLE `materials` DISABLE KEYS */;
INSERT INTO `materials` VALUES ('MAT1743155130112','IT920','/materials/1743155130108_python assignment.pdf');
/*!40000 ALTER TABLE `materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `qid` varchar(50) NOT NULL,
  `cid` varchar(50) DEFAULT NULL,
  `quiz_name` varchar(255) NOT NULL,
  PRIMARY KEY (`qid`),
  KEY `fk_quiz_course` (`cid`),
  CONSTRAINT `fk_quiz_course` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz`
--

LOCK TABLES `quiz` WRITE;
/*!40000 ALTER TABLE `quiz` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `cid` varchar(50) NOT NULL,
  `questions` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`quiz_id`),
  KEY `cid` (`cid`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (7,'IT311','[{\"qid\": 1, \"correct\": \"B\", \"options\": {\"A\": \"5\", \"B\": \"4\", \"C\": \"9\", \"D\": \"6\"}, \"question\": \"2+2\"}, {\"qid\": 2, \"correct\": \"B\", \"options\": {\"A\": \"4\", \"B\": \"6\", \"C\": \"5\", \"D\": \"9\"}, \"question\": \"3+3\"}, {\"qid\": 3, \"correct\": \"C\", \"options\": {\"A\": \"5\", \"B\": \"2\", \"C\": \"10\", \"D\": \"6\"}, \"question\": \"5+5\"}]','2025-04-10 08:26:42'),(8,'IT311','[{\"qid\": 1, \"correct\": \"B\", \"options\": {\"A\": \"4\", \"B\": \"6\", \"C\": \"5\", \"D\": \"9\"}, \"question\": \"3+3\"}, {\"qid\": 2, \"correct\": \"C\", \"options\": {\"A\": \"5\", \"B\": \"2\", \"C\": \"10\", \"D\": \"6\"}, \"question\": \"5+5\"}]','2025-04-10 08:27:59');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('220103013','Neelim Sikhar Borah','something@example.com','$2b$10$u1XlB2/mEtx3VCwpLffy6eIKtm2qhkNCq6r/O1N/c7g9OWBxDwCCi','IT312','IT313','IT930');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `uname` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `cid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`uname`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cid` (`cid`),
  CONSTRAINT `fk_teacher_course` FOREIGN KEY (`cid`) REFERENCES `course` (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES ('test123','test user','abc@gmail.com','$2b$10$gXhVbf98VPODcu.Jlp7KR.bJ60ALy2BtOJG3kS0eQ2T5kj.1gPxXO','IT311'),('test456','test user 2','test456@gmail.com','$2b$10$Jl3RQNePMHFZTYq7xKg8lufcfSJx91DW.Yv8EvM7v8j7klqRqKee6','IT920'),('test789','test user 3','testuser3@gmail.com','$2b$10$YhMU4tOlQ91hN8fyiQeSiuA3i5DnHs1HKRt3NUEyOuzzdt1DQwspy','IT315');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-17 17:16:56
