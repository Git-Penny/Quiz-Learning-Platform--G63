<?php
// ==========================================================
// QUIZR - Get User Statistics API (For Dashboard)
// ==========================================================

require_once __DIR__ . '/../../config/db.php';
header('Content-Type: application/json');

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    exit;
}

// Get user basic info
$user_query = $conn->prepare("SELECT id, username, full_name, email, role FROM users WHERE id = ?");
$user_query->bind_param("i", $user_id);
$user_query->execute();
$user_result = $user_query->get_result();
$user = $user_result->fetch_assoc();

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

// Calculate quiz stats
$stats_sql = "
    SELECT 
        COUNT(id) AS quizzes_taken,
        SUM(score) AS total_score,
        SUM(total) AS total_questions,
        ROUND(SUM(score) / NULLIF(SUM(total), 0) * 100, 1) AS avg_accuracy,
        MAX(completed_at) AS last_quiz_date
    FROM user_attempts
    WHERE user_id = ?
";
$stats_stmt = $conn->prepare($stats_sql);
$stats_stmt->bind_param("i", $user_id);
$stats_stmt->execute();
$stats = $stats_stmt->get_result()->fetch_assoc();

// Add default 0s if null
foreach ($stats as $key => $val) {
    if ($val === null) $stats[$key] = 0;
}

// Get rank
$rank_sql = "
    SELECT COUNT(*) + 1 AS rank
    FROM (
        SELECT user_id, SUM(score) AS total_score
        FROM user_attempts
        GROUP BY user_id
        HAVING total_score > (
            SELECT SUM(score)
            FROM user_attempts
            WHERE user_id = ?
        )
    ) AS higher_scores
";
$rank_stmt = $conn->prepare($rank_sql);
$rank_stmt->bind_param("i", $user_id);
$rank_stmt->execute();
$rank_result = $rank_stmt->get_result()->fetch_assoc();
$rank = $rank_result['rank'] ?? 1;

echo json_encode([
    "success" => true,
    "user" => $user,
    "stats" => $stats,
    "rank" => $rank
]);

$conn->close();
?>
