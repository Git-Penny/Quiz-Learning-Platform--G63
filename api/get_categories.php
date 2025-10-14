<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$stmt = $pdo->query("SELECT id, name, description, icon FROM categories ORDER BY id ASC");
$categories = $stmt->fetchAll();

echo json_encode($categories);
?>
