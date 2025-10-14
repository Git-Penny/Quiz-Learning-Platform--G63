<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$sql = "SELECT u.username, AVG(a.score) AS avg_score, COUNT(a.id) AS quizzes_taken
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        GROUP BY a.user_id
        ORDER BY avg_score DESC
        LIMIT 10";

$stmt = $pdo->query($sql);
$leaderboard = $stmt->fetchAll();

echo json_encode($leaderboard);
?>
