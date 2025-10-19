<?php
// ==========================================================
// QUIZR - Get User Statistics API
// ==========================================================

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

// Check database connection
if (!$conn) {
    echo json_encode([
        "success" => false, 
        "error" => "Database connection failed"
    ]);
    exit;
}

// Get user_id from query parameter
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id <= 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid user ID"
    ]);
    exit;
}

// Verify user exists
$userCheck = "SELECT id, username, full_name FROM users WHERE id = ?";
$stmt = mysqli_prepare($conn, $userCheck);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false, 
        "error" => "User not found"
    ]);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}

$user = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Get user statistics
$statsQuery = "
    SELECT 
        COUNT(ua.id) as quizzes_taken,
        COALESCE(SUM(ua.score), 0) as total_score,
        COALESCE(SUM(ua.total_questions), 0) as total_questions,
        COALESCE(ROUND(AVG(ua.score / ua.total_questions * 100), 1), 0) as avg_accuracy,
        MAX(ua.completed_at) as last_quiz_date
    FROM user_attempts ua
    WHERE ua.user_id = ?
";

$stmt2 = mysqli_prepare($conn, $statsQuery);
mysqli_stmt_bind_param($stmt2, "i", $user_id);
mysqli_stmt_execute($stmt2);
$statsResult = mysqli_stmt_get_result($stmt2);
$stats = mysqli_fetch_assoc($statsResult);
mysqli_stmt_close($stmt2);

// Get user's rank
$rankQuery = "
    SELECT COUNT(*) + 1 as rank
    FROM (
        SELECT 
            u.id,
            COALESCE(SUM(ua.score), 0) as total_score
        FROM users u
        LEFT JOIN user_attempts ua ON u.id = ua.user_id
        GROUP BY u.id
        HAVING total_score > ?
    ) as ranked_users
";

$stmt3 = mysqli_prepare($conn, $rankQuery);
mysqli_stmt_bind_param($stmt3, "i", $stats['total_score']);
mysqli_stmt_execute($stmt3);
$rankResult = mysqli_stmt_get_result($stmt3);
$rankData = mysqli_fetch_assoc($rankResult);
$rank = (int)$rankData['rank'];
mysqli_stmt_close($stmt3);

// Get category breakdown
$categoryQuery = "
    SELECT 
        c.name as category_name,
        COUNT(ua.id) as attempts,
        COALESCE(SUM(ua.score), 0) as category_score,
        COALESCE(ROUND(AVG(ua.score / ua.total_questions * 100), 1), 0) as category_accuracy
    FROM user_attempts ua
    JOIN categories c ON ua.category_id = c.id
    WHERE ua.user_id = ?
    GROUP BY c.id, c.name
    ORDER BY category_score DESC
";

$stmt4 = mysqli_prepare($conn, $categoryQuery);
mysqli_stmt_bind_param($stmt4, "i", $user_id);
mysqli_stmt_execute($stmt4);
$categoryResult = mysqli_stmt_get_result($stmt4);

$categories = [];
while ($row = mysqli_fetch_assoc($categoryResult)) {
    $categories[] = [
        'category' => $row['category_name'],
        'attempts' => (int)$row['attempts'],
        'score' => (int)$row['category_score'],
        'accuracy' => (float)$row['category_accuracy']
    ];
}
mysqli_stmt_close($stmt4);

// Return complete statistics
echo json_encode([
    "success" => true,
    "stats" => [
        "user_id" => (int)$user['id'],
        "username" => $user['username'],
        "full_name" => $user['full_name'],
        "quizzes_taken" => (int)$stats['quizzes_taken'],
        "total_score" => (int)$stats['total_score'],
        "total_questions" => (int)$stats['total_questions'],
        "avg_accuracy" => (float)$stats['avg_accuracy'],
        "rank" => $rank,
        "last_quiz_date" => $stats['last_quiz_date'],
        "category_breakdown" => $categories
    ]
], JSON_PRETTY_PRINT);

mysqli_close($conn);
?>