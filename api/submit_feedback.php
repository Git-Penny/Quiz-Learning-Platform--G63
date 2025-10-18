<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

// ✅ Collect POST data safely
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$type = trim($_POST['type'] ?? 'other');
$message = trim($_POST['message'] ?? '');
$rating = isset($_POST['rating']) ? intval($_POST['rating']) : null;

// ✅ Basic validation
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit;
}

// ✅ Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email address."]);
    exit;
}

// ✅ Insert into DB using prepared statements
$sql = "INSERT INTO feedback (name, email, type, message, rating) VALUES (?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "ssssi", $name, $email, $type, $message, $rating);
    $success = mysqli_stmt_execute($stmt);

    if ($success) {
        echo json_encode(["status" => "success", "message" => "✅ Feedback submitted successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . mysqli_error($conn)]);
    }

    mysqli_stmt_close($stmt);
} else {
    echo json_encode(["status" => "error", "message" => "Statement preparation failed."]);
}

mysqli_close($conn);
?>
