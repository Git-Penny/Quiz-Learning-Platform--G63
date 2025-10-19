<?php
// ==========================================================
// QUIZR - Get User Statistics API
// ==========================================================

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if (!$user_id) {
    echo json_encode([
        "success" => false, 
        "error" => "User ID is required"
    ]);
    exit;
}

// Check if user exists
$userCheck = "SELECT id, username, full_name, email FROM users WHERE id = ?";
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

// Get user statistics from user_attempts table
$statsQuery = "
    SELECT 
        COUNT(ua.id) as quizzes_taken,
        SUM(ua.score) as total_score,
        SUM(ua.total_questions) as total_questions,
        ROUND(AVG(ua.score / ua.total_questions * 100), 1) as avg_accuracy,
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

// Calculate user's rank among all users
$rankQuery = "
    SELECT COUNT(DISTINCT u2.id) + 1 as user_rank
    FROM users u2
    LEFT JOIN user_attempts ua2 ON u2.id = ua2.user_id
    WHERE u2.id != ?
    GROUP BY u2.id
    HAVING SUM(ua2.score) > (
        SELECT SUM(score) FROM user_attempts WHERE user_id = ?
    )
";

$stmt3 = mysqli_prepare($conn, $rankQuery);
mysqli_stmt_bind_param($stmt3, "ii", $user_id, $user_id);
mysqli_stmt_execute($stmt3);
$rankResult = mysqli_stmt_get_result($stmt3);
$rankData = mysqli_fetch_assoc($rankResult);
$user_rank = $rankData ? (int)$rankData['user_rank'] : 1;
mysqli_stmt_close($stmt3);

// Get category breakdown
$categoryQuery = "
    SELECT 
        c.name as category_name,
        COUNT(ua.id) as attempts,
        SUM(ua.score) as score,
        SUM(ua.total_questions) as total_questions,
        ROUND(AVG(ua.score / ua.total_questions * 100), 1) as accuracy
    FROM user_attempts ua
    JOIN categories c ON ua.category_id = c.id
    WHERE ua.user_id = ?
    GROUP BY c.id, c.name
    ORDER BY score DESC
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
        'score' => (int)$row['score'],
        'total_questions' => (int)$row['total_questions'],
        'accuracy' => (float)$row['accuracy']
    ];
}
mysqli_stmt_close($stmt4);

// Return complete user statistics
echo json_encode([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'full_name' => $user['full_name'],
        'email' => $user['email']
    ],
    'stats' => [
        'quizzes_taken' => (int)$stats['quizzes_taken'],
        'total_score' => (int)$stats['total_score'],
        'total_questions' => (int)$stats['total_questions'],
        'avg_accuracy' => (float)$stats['avg_accuracy'],
        'last_quiz_date' => $stats['last_quiz_date'],
        'rank' => $user_rank
    ],
    'categories' => $categories,
    'total_users' => getTotalUsers($conn)
], JSON_PRETTY_PRINT);

mysqli_close($conn);

// Helper function to get total users count
function getTotalUsers($conn) {
    $result = mysqli_query($conn, "SELECT COUNT(*) as total FROM users");
    $row = mysqli_fetch_assoc($result);
    return (int)$row['total'];
}
?>