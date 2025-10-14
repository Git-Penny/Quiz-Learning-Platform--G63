-- ==========================================================
-- QUIZR LEARNING PLATFORM DATABASE SCHEMA (aligned with UI)
-- ==========================================================

DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS attempt_answers;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS choices;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ==========================================================
-- 1. USERS
-- ==========================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(150),
    email           VARCHAR(150) UNIQUE,
    role            ENUM('student','admin') DEFAULT 'student',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. CATEGORIES  (Independence, Colonial, etc.)
-- ==========================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- seed categories to match dashboard.html
INSERT INTO categories (name, description, icon) VALUES
('Independence Era', '1990 - Present Day', 'fa-flag'),
('Colonial History', '1884 - 1990', 'fa-landmark'),
('Pre-Colonial Era', 'Before 1884', 'fa-history'),
('Genocide & Resistance', '1904 - 1908 & Beyond', 'fa-monument');

-- ==========================================================
-- 3. QUESTIONS
-- ==========================================================
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    question_text TEXT NOT NULL,
    difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
    explanation TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- 4. CHOICES
-- ==========================================================
CREATE TABLE choices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    choice_text VARCHAR(500) NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ==========================================================
-- 5. QUIZZES  (each quiz belongs to one category)
-- ==========================================================
CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    num_questions INT DEFAULT 10,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- 6. ATTEMPTS  (records student progress)
-- ==========================================================
CREATE TABLE attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id INT,
    score INT DEFAULT 0,
    total INT DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    status ENUM('in_progress','completed') DEFAULT 'completed',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
);

-- ==========================================================
-- 7. ATTEMPT_ANSWERS
-- ==========================================================
CREATE TABLE attempt_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_choice INT,
    is_correct TINYINT(1),
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_choice) REFERENCES choices(id) ON DELETE SET NULL
);

-- ==========================================================
-- 8. FEEDBACK  (for the feedback form on index.html)
-- ==========================================================
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    type ENUM('suggestion','issue','topic','praise','other') DEFAULT 'other',
    message TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- SAMPLE DATA
-- ==========================================================
-- Admin user
INSERT INTO users (username,password_hash,full_name,email,role)
VALUES ('admin','$2y$10$0G8dYbpwAcPYu3Q2AfSm3u1RLh1Wdp9mQqgXe9.Fs/Tb8j5Ttu7Mi',
        'Administrator','admin@example.com','admin');
-- password: Admin@123

-- Sample questions (Independence Era)
INSERT INTO questions (category_id,question_text,difficulty,explanation,created_by) VALUES
(1,'In which year did Namibia gain independence?','easy','Namibia gained independence in 1990.',1),
(1,'Who was Namibia’s first president?','easy','Sam Nujoma served as first president (1990–2005).',1),
(2,'Which country colonized Namibia from 1884 to 1915?','medium','Germany colonized Namibia during this period.',1),
(4,'During 1904–1908, which two groups led major uprisings?','medium','Herero and Nama resisted German rule.',1),
(3,'Name one pre-colonial Namibian ethnic kingdom.','hard','Examples include Ovambo, Herero, and Nama.',1);

INSERT INTO choices (question_id,choice_text,is_correct) VALUES
-- Q1
(1,'1989',0),(1,'1990',1),(1,'1992',0),(1,'1994',0),
-- Q2
(2,'Sam Nujoma',1),(2,'Hage Geingob',0),(2,'Theo-Ben Gurirab',0),(2,'John Mutorwa',0),
-- Q3
(3,'South Africa',0),(3,'Germany',1),(3,'Portugal',0),(3,'Britain',0),
-- Q4
(4,'Herero and Nama',1),(4,'Zulu and Xhosa',0),(4,'Khoisan and Damara',0),(4,'San and Kavango',0),
-- Q5
(5,'Ovambo',1),(5,'Zulu',0),(5,'Tswana',0),(5,'Shona',0);

-- One quiz per category for demo
INSERT INTO quizzes (category_id,title,description,num_questions,created_by) VALUES
(1,'Independence Era Basics','Questions on Namibia’s path since 1990',5,1),
(2,'Colonial Period','Quiz on events from 1884-1990',5,1),
(3,'Pre-Colonial Namibia','Traditional kingdoms and cultures',5,1),
(4,'Resistance & Genocide','Uprisings 1904–1908',5,1);
