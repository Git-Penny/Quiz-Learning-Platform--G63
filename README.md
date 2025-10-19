# Quiz-Learning-Platform--G63

# Quizr - Namibian History Learning Platform

## 📚 Overview
Interactive web platform for learning Namibian history through engaging quizzes. Features user authentication, progress tracking, and competitive leaderboards.

## ✨ Features
- **6 Quiz Categories**: Comprehensive historical coverage
- **User Authentication**: Secure registration and login system
- **Progress Tracking**: Coming soon...
- **Leaderboard**: Competitive rankings and user comparisons
- **Feedback System**: User suggestions and platform improvements
- **Responsive Design**: Works on all devices

## 🎮 Quiz Categories
1. **Independence Era** (1990 - Present Day)
2. **Colonial History** (1884-1990)
3. **Pre-Colonial Era** (Before 1884)
4. **Liberation Struggles** (1960s-1990)
5. **Culture & Heritage** (Traditions & Customs)
6. **Genocide & Resistance** (1904-1908 & Beyond)

## 🛠️ Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP with MySQL database
- **Security**: Password hashing, prepared statements, input validation
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Poppins, Pacifico)

## 🚀 Installation & Setup

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4+
- MySQL 5.7+
- Modern web browser

### Quick Setup
1. **Create Database**:
   ```sql
   CREATE DATABASE quizr_platform;
   ```

2. **Import Schema**:
   ```bash
   mysql -u username -p quizr_platform < schema.sql
   ```

3. **Configure Database**:
   Edit `config/db.php` with your credentials:
   ```php
   <?php
   $servername = "localhost";
   $username = "your_username";
   $password = "your_password"; 
   $dbname = "quizr_platform";
   ?>
   ```

4. **Upload Files** to web server directory
5. **Test Connection** by visiting `/api/test_db.php`

## 📁 Project Structure
```
Quiz-Learning-Platform/
├── index.html          # Landing page
├── login.html          # User authentication
├── register.html       # User registration  
├── dashboard.html      # User dashboard
├── quiz.html          # Quiz interface
├── results.html       # Results display
├── leaderboard.html   # Rankings
├── css/              # Stylesheets
├── js/               # Frontend logic
├── api/              # Backend endpoints
│   ├── login.php              # User authentication
│   ├── register.php           # User registration  
│   ├── submit_quiz.php        # Quiz scoring
│   ├── submit_feedback.php    # Feedback handling
│   └── test_db.php           # Database test
├── config/
│   └── db.php         # Database configuration
└── schema.sql         # Database structure
```

## 🔧 API Endpoints

### User Management
- `POST /api/login.php` - Authenticate users
- `POST /api/register.php` - Create new accounts

### Quiz System  
- `POST /api/submit_quiz.php` - Submit quiz results
- `GET /api/get_quiz.php` - Retrieve questions (to implement)

### Feedback
- `POST /api/submit_feedback.php` - Submit user feedback

## 🔒 Security Features
- Password hashing with `password_hash()`
- SQL injection protection via prepared statements
- Input validation and sanitization
- CORS headers for API security
- Secure error handling

## 📊 Database Schema
Core tables: `users`, `categories`, `questions`, `choices`, `user_attempts`, `feedback`

## 👥 Development Team
**Group 6 - WAD621S Web Application Development**
- Ravi Ngongo
- Penny Kashidulika  
- Wayne Xavier Feris

## 📄 License
Educational project developed for WAD621S course at NUST.

---

*Making Namibian history learning interactive and accessible*