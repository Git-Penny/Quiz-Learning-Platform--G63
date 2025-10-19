<?php
// ==========================================================
// QUIZR - Submit Feedback API (FINAL WORKING VERSION)
// ==========================================================

// Show errors for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database
require_once __DIR__ . '/../config/db.php';

// Check connection
if (!$conn) {
    echo json_encode([
        "success" => false, 
        "error" => "Database connection failed: " . mysqli_connect_error()
    ]);
    exit;
}

// Get raw POST data
$rawInput = file_get_contents("php://input");

// Log what we received (for debugging)
error_log("Received input: " . $rawInput);

// Parse JSON
$data = json_decode($rawInput, true);

// Check if JSON parsing worked
if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false,
        "error" => "Invalid JSON: " . json_last_error_msg(),
        "received" => $rawInput
    ]);
    exit;
}

// Extract and validate data
$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$type = isset($data['type']) ? trim($data['type']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';
$rating = isset($data['rating']) ? (int)$data['rating'] : null;

// Debug: Show what we extracted
error_log("Extracted - Name: $name, Email: $email, Type: $type, Message length: " . strlen($message));

// Validate required fields
if (empty($name) || empty($email) || empty($type) || empty($message)) {
    echo json_encode([
        "success" => false,
        "error" => "All fields are required",
        "debug" => [
            "name" => !empty($name),
            "email" => !empty($email),
            "type" => !empty($type),
            "message" => !empty($message)
        ]
    ]);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "error" => "Invalid email address"
    ]);
    exit;
}

// Validate type
$validTypes = ['suggestion', 'issue', 'topic', 'praise', 'other'];
if (!in_array($type, $validTypes)) {
    echo json_encode([
        "success" => false,
        "error" => "Invalid feedback type"
    ]);
    exit;
}

// Validate rating
if ($rating !== null && ($rating < 1 || $rating > 5)) {
    echo json_encode([
        "success" => false,
        "error" => "Rating must be between 1 and 5"
    ]);
    exit;
}

// Escape strings for SQL
$name = mysqli_real_escape_string($conn, $name);
$email = mysqli_real_escape_string($conn, $email);
$type = mysqli_real_escape_string($conn, $type);
$message = mysqli_real_escape_string($conn, $message);

// Insert into database using prepared statement
$sql = "INSERT INTO feedback (name, email, type, message, rating, submitted_at) 
        VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = mysqli_prepare($conn, $sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to prepare statement: " . mysqli_error($conn)
    ]);
    exit;
}

mysqli_stmt_bind_param($stmt, "ssssi", $name, $email, $type, $message, $rating);

if (mysqli_stmt_execute($stmt)) {
    $feedback_id = mysqli_insert_id($conn);
    
    echo json_encode([
        "success" => true,
        "message" => "Thank you for your feedback!",
        "feedback_id" => $feedback_id
    ]);
    
    error_log("Feedback saved successfully with ID: $feedback_id");
} else {
    echo json_encode([
        "success" => false,
        "error" => "Failed to save feedback: " . mysqli_stmt_error($stmt)
    ]);
    
    error_log("Failed to save feedback: " . mysqli_stmt_error($stmt));
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>