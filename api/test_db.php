<?php
require __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, name, description FROM categories");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} catch (PDOException $e) {
    echo json_encode([
        "error" => "Database connection failed",
        "details" => $e->getMessage()
    ]);
}
?>
