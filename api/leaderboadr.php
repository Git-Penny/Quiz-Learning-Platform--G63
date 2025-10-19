<?php
// ==========================================================
// QUIZR - Leaderboard API
// ==========================================================

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db.php';

// Check database connection
if (!$conn) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// Get filter parameter (all-time, monthly, weekly)
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all-time';

// Build query based on filter
$dateCondition = '';
switch ($filter) {
    case 'weekly':
        $dateCondition = "AND ua.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
    case 'monthly':
        $dateCondition = "AND ua.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
    case 'all-time':
    default:
        $dateCondition = '';
        break;
}

// Main leaderboard query
$query = "
    SELECT 
        u.id,
        u.username,
        u.full_name,
        u.profile_image,
        COUNT(ua.id) as quizzes_taken,
        SUM(ua.score) as total_score,
        SUM(ua.total_questions) as total_questions_attempted,
        ROUND(AVG(ua.score / ua.total_questions * 100), 1) as avg_accuracy,
        MAX(ua.completed_at) as last_quiz_date
    FROM users u
    INNER JOIN user_attempts ua ON u.id = ua.user_id
    WHERE 1=1 $dateCondition
    GROUP BY u.id, u.username, u.full_name, u.profile_image
    HAVING quizzes_taken > 0
    ORDER BY total_score DESC, avg_accuracy DESC
    LIMIT 100
";

$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode([
        "success" => false,
        "error" => "Query failed", 
        "details" => mysqli_error($conn)
    ]);
    exit;
}

$leaderboard = [];
$rank = 1;

while ($row = mysqli_fetch_assoc($result)) {
    // Calculate badges based on performance
    $badges = [];
    
    if ($row['quizzes_taken'] >= 10) $badges[] = '🎓';
    if ($row['quizzes_taken'] >= 50) $badges[] = '📚';
    if ($row['avg_accuracy'] >= 90) $badges[] = '🌟';
    if ($row['avg_accuracy'] >= 95) $badges[] = '💎';
    if ($row['total_score'] >= 100) $badges[] = '🏆';
    if ($rank <= 3) $badges[] = '👑';
    
    $leaderboard[] = [
        'rank' => $rank,
        'id' => (int)$row['id'],
        'username' => $row['username'],
        'full_name' => $row['full_name'],
        'profile_image' => $row['profile_image'] ?? null,
        'quizzes_taken' => (int)$row['quizzes_taken'],
        'total_score' => (int)$row['total_score'],
        'total_questions' => (int)$row['total_questions_attempted'],
        'avg_accuracy' => (float)$row['avg_accuracy'],
        'badges' => $badges,
        'last_quiz_date' => $row['last_quiz_date']
    ];
    
    $rank++;
}

// Get current user's position if user_id is provided
$response = [
    'success' => true,
    'filter' => $filter,
    'total_players' => count($leaderboard),
    'leaderboard' => $leaderboard,
    'user_position' => null
];

// If user_id is provided, find their position
if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
    $user_id = (int)$_GET['user_id'];
    
    foreach ($leaderboard as $entry) {
        if ($entry['id'] === $user_id) {
            $response['user_position'] = $entry;
            break;
        }
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>