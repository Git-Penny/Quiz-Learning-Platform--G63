<?php
require __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

// Check if connection works
if (!$conn) {
    echo json_encode(["error" => "Database connection failed", "details" => mysqli_connect_error()]);
    exit;
}

// Query your categories table
$sql = "SELECT id, name, description FROM categories";
$result = mysqli_query($conn, $sql);

if ($result) {
    $data = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode(["error" => "Query failed", "details" => mysqli_error($conn)]);
}

// Close connection
mysqli_close($conn);
?>
