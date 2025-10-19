<?php
// ==========================================================
// QUIZR - Leaderboard API (WORKING VERSION)
// ==========================================================

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../config/db.php'; // adjust path if needed

if (!$conn) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// ==========================================================
// FILTER (all-time, monthly, weekly)
// ==========================================================
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all-time';
$dateCondition = '';

switch ($filter) {
    case 'weekly':
        $dateCondition = "AND a.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        break;
    case 'monthly':
        $dateCondition = "AND a.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        break;
    default:
        $dateCondition = '';
        break;
}

// ==========================================================
// MAIN QUERY (pulls data from users + attempts tables)
// ==========================================================
//
// Your existing DB schema includes:
// - users(id, username, full_name)
// - attempts(user_id, score, total, completed_at)
//
// Adjust table/column names if needed.
//
$query = "
    SELECT 
        u.id,
        u.username,
        u.full_name,
        COUNT(a.id) AS quizzes_taken,
        COALESCE(SUM(a.score), 0) AS total_score,
        COALESCE(SUM(a.total), 0) AS total_questions,
        ROUND(AVG((a.score / NULLIF(a.total,0)) * 100), 1) AS avg_accuracy,
        MAX(a.completed_at) AS last_quiz_date
    FROM users u
    LEFT JOIN attempts a ON u.id = a.user_id
    WHERE 1=1 $dateCondition
    GROUP BY u.id, u.username, u.full_name
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

// ==========================================================
// BUILD RESPONSE DATA
// ==========================================================
$leaderboard = [];
$rank = 1;

while ($row = mysqli_fetch_assoc($result)) {
    $badges = [];

    // Award badges based on milestones
    if ($row['quizzes_taken'] >= 10) $badges[] = '🎓';
    if ($row['avg_accuracy'] >= 90) $badges[] = '🌟';
    if ($row['total_score'] >= 100) $badges[] = '🏆';
    if ($rank <= 3) $badges[] = '👑';

    $leaderboard[] = [
        "rank" => $rank,
        "id" => (int)$row['id'],
        "username" => $row['username'],
        "full_name" => $row['full_name'],
        "quizzes_taken" => (int)$row['quizzes_taken'],
        "total_score" => (int)$row['total_score'],
        "total_questions" => (int)$row['total_questions'],
        "avg_accuracy" => (float)$row['avg_accuracy'],
        "badges" => $badges,
        "last_quiz_date" => $row['last_quiz_date']
    ];

    $rank++;
}

// ==========================================================
// ADD USER POSITION (if user_id is provided)
// ==========================================================
$response = [
    "success" => true,
    "filter" => $filter,
    "total_players" => count($leaderboard),
    "leaderboard" => $leaderboard,
    "user_position" => null
];

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
