<?php
// ==========================================================
// QUIZR - Get Categories API
// ==========================================================
require __DIR__ . '/../config/db.php';
header('Content-Type: application/json');

$sql = "SELECT id, name, description, icon FROM categories ORDER BY id ASC";
$result = mysqli_query($conn, $sql);

$categories = [];
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $categories[] = [
            "id" => $row["id"],
            "name" => $row["name"],
            "description" => $row["description"],
            "icon" => $row["icon"]
        ];
    }
    echo json_encode($categories);
} else {
    echo json_encode(["message" => "No categories found"]);
}

mysqli_close($conn);
?>
