<?php
// ==========================================================
// QUIZR - User Login Endpoint (Safe Version)
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
        "message" => "Database connection failed"
    ]);
    exit;
}

// Read incoming JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!$data || empty($data['email']) || empty($data['password'])) {
    echo json_encode([
        "success" => false, 
        "message" => "Missing credentials"
    ]);
    exit;
}

// Sanitize inputs
$email = trim($data['email']);
$password = $data['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid email format"
    ]);
    exit;
}

// Check if is_active column exists
$checkColumnQuery = "SHOW COLUMNS FROM users LIKE 'is_active'";
$columnResult = mysqli_query($conn, $checkColumnQuery);
$hasIsActive = mysqli_num_rows($columnResult) > 0;

// Build query based on whether is_active exists
if ($hasIsActive) {
    $query = "SELECT id, username, full_name, email, password_hash, is_active 
              FROM users 
              WHERE email = ? 
              LIMIT 1";
} else {
    $query = "SELECT id, username, full_name, email, password_hash 
              FROM users 
              WHERE email = ? 
              LIMIT 1";
}

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid email or password"
    ]);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Check if account is active (only if column exists)
if ($hasIsActive && isset($user['is_active']) && $user['is_active'] != 1) {
    echo json_encode([
        "success" => false, 
        "message" => "Account is deactivated. Please contact support."
    ]);
    mysqli_close($conn);
    exit;
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid email or password"
    ]);
    mysqli_close($conn);
    exit;
}

// Update last login time (if column exists)
$checkLastLoginQuery = "SHOW COLUMNS FROM users LIKE 'last_login'";
$lastLoginResult = mysqli_query($conn, $checkLastLoginQuery);
$hasLastLogin = mysqli_num_rows($lastLoginResult) > 0;

if ($hasLastLogin) {
    $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
    $updateStmt = mysqli_prepare($conn, $updateQuery);
    mysqli_stmt_bind_param($updateStmt, "i", $user['id']);
    mysqli_stmt_execute($updateStmt);
    mysqli_stmt_close($updateStmt);
}

// Login successful - return user data
echo json_encode([
    "success" => true, 
    "message" => "Login successful",
    "user" => [
        "id" => (int)$user['id'],
        "username" => $user['username'],
        "full_name" => $user['full_name'],
        "email" => $user['email']
    ]
]);

mysqli_close($conn);
?>