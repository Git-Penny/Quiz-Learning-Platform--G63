<?php
// ==========================================================
// QUIZR - Get Feedback API (for Admin Panel)
// ==========================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db.php';

if (!$conn) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// Optional filter by feedback type (suggestion, issue, topic, praise, other)
$typeFilter = isset($_GET['type']) && $_GET['type'] !== '' ? $_GET['type'] : null;

$sql = "SELECT id, name, email, type, message, rating, submitted_at 
        FROM feedback";

if ($typeFilter) {
    $sql .= " WHERE type = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $typeFilter);
} else {
    $stmt = mysqli_prepare($conn, $sql);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$feedback = [];
while ($row = mysqli_fetch_assoc($result)) {
    $feedback[] = [
        "id" => (int)$row['id'],
        "name" => $row['name'],
        "email" => $row['email'],
        "type" => ucfirst($row['type']),
        "message" => $row['message'],
        "rating" => (int)$row['rating'],
        "submitted_at" => date("Y-m-d H:i", strtotime($row['submitted_at']))
    ];
}

echo json_encode([
    "success" => true,
    "count" => count($feedback),
    "feedback" => $feedback
], JSON_PRETTY_PRINT);

mysqli_close($conn);
?>
