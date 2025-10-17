<?php
require __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

// Collect POST data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$type = $_POST['type'] ?? 'other';
$message = $_POST['message'] ?? '';
$rating = $_POST['rating'] ?? null;

// Basic validation
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

// Insert into DB
$sql = "INSERT INTO feedback (name, email, type, message, rating) VALUES (?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ssssi", $name, $email, $type, $message, $rating);
$success = mysqli_stmt_execute($stmt);

if ($success) {
    echo json_encode(["status" => "success", "message" => "Feedback submitted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database error", "details" => mysqli_error($conn)]);
}

mysqli_close($conn);
?>
