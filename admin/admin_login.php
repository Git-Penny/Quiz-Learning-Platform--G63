<?php
// ==========================================================
// QUIZR - Admin Login API
// ==========================================================

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

// Find admin user by email
$query = "SELECT id, username, full_name, email, password_hash, role 
          FROM users 
          WHERE email = ? AND role = 'admin'
          LIMIT 1";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid admin credentials"
    ]);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

$admin = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Verify password
if (!password_verify($password, $admin['password_hash'])) {
    echo json_encode([
        "success" => false, 
        "message" => "Invalid admin credentials"
    ]);
    mysqli_close($conn);
    exit;
}

// Update last login time
$updateQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
$updateStmt = mysqli_prepare($conn, $updateQuery);
mysqli_stmt_bind_param($updateStmt, "i", $admin['id']);
mysqli_stmt_execute($updateStmt);
mysqli_stmt_close($updateStmt);

// Login successful - return admin data
echo json_encode([
    "success" => true, 
    "message" => "Admin login successful",
    "admin" => [
        "id" => (int)$admin['id'],
        "username" => $admin['username'],
        "full_name" => $admin['full_name'],
        "email" => $admin['email'],
        "role" => $admin['role']
    ]
]);

mysqli_close($conn);
?>