<?php
// ==========================================================
// QUIZR - User Registration Endpoint
// ==========================================================

// Disable error display for clean JSON responses
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

// Check database connection
if (!$conn) {
    echo json_encode([
        "success" => false, 
        "error" => "Database connection failed"
    ]);
    exit;
}

// Read incoming JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!$data || empty($data['full_name']) || empty($data['email']) || empty($data['password'])) {
    echo json_encode([
        "success" => false, 
        "error" => "Missing required fields"
    ]);
    exit;
}

// Sanitize inputs
$full_name = trim($data['full_name']);
$email = trim($data['email']);
$username = isset($data['username']) ? trim($data['username']) : explode('@', $email)[0];
$password = $data['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid email format"
    ]);
    exit;
}

// Validate password strength
if (strlen($password) < 6) {
    echo json_encode([
        "success" => false, 
        "error" => "Password must be at least 6 characters"
    ]);
    exit;
}

// Check if email already exists
$checkQuery = "SELECT id FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $checkQuery);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) > 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Email already registered"
    ]);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}
mysqli_stmt_close($stmt);

// Check if username already exists
$checkUsernameQuery = "SELECT id FROM users WHERE username = ?";
$stmt2 = mysqli_prepare($conn, $checkUsernameQuery);
mysqli_stmt_bind_param($stmt2, "s", $username);
mysqli_stmt_execute($stmt2);
$result2 = mysqli_stmt_get_result($stmt2);

if (mysqli_num_rows($result2) > 0) {
    // Generate unique username by appending random number
    $username = $username . rand(100, 999);
}
mysqli_stmt_close($stmt2);

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert new user using prepared statement
$query = "INSERT INTO users (username, full_name, email, password_hash, created_at) 
          VALUES (?, ?, ?, ?, NOW())";

$stmt3 = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt3, "ssss", $username, $full_name, $email, $password_hash);

if (mysqli_stmt_execute($stmt3)) {
    $user_id = mysqli_insert_id($conn);
    
    echo json_encode([
        "success" => true, 
        "message" => "Account created successfully",
        "user" => [
            "id" => $user_id,
            "username" => $username,
            "full_name" => $full_name,
            "email" => $email
        ]
    ]);
} else {
    echo json_encode([
        "success" => false, 
        "error" => "Registration failed. Please try again."
    ]);
}

mysqli_stmt_close($stmt3);
mysqli_close($conn);
?>