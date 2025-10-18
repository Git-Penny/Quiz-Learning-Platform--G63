<?php
// ==========================================================
// QUIZR - Submit Quiz Results API
// ==========================================================

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Read incoming JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!$data || 
    !isset($data['user_id']) || 
    !isset($data['category_id']) || 
    !isset($data['score']) || 
    !isset($data['total_questions'])) {
    
    echo json_encode([
        "success" => false, 
        "error" => "Missing required fields"
    ]);
    exit;
}

$user_id = (int)$data['user_id'];
$category_id = (int)$data['category_id'];
$score = (int)$data['score'];
$total_questions = (int)$data['total_questions'];
$time_taken = isset($data['time_taken']) ? (int)$data['time_taken'] : null;

// Validate user exists
$userCheck = "SELECT id FROM users WHERE id = ?";
$stmt = mysqli_prepare($conn, $userCheck);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid user"
    ]);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
    exit;
}
mysqli_stmt_close($stmt);

// Validate category exists
$categoryCheck = "SELECT id FROM categories WHERE id = ?";
$stmt2 = mysqli_prepare($conn, $categoryCheck);
mysqli_stmt_bind_param($stmt2, "i", $category_id);
mysqli_stmt_execute($stmt2);
$result2 = mysqli_stmt_get_result($stmt2);

if (mysqli_num_rows($result2) === 0) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid category"
    ]);
    mysqli_stmt_close($stmt2);
    mysqli_close($conn);
    exit;
}
mysqli_stmt_close($stmt2);

// Insert quiz attempt
$insertQuery = "INSERT INTO user_attempts 
                (user_id, category_id, score, total_questions, time_taken, completed_at) 
                VALUES (?, ?, ?, ?, ?, NOW())";

$stmt3 = mysqli_prepare($conn, $insertQuery);
mysqli_stmt_bind_param($stmt3, "iiiii", $user_id, $category_id, $score, $total_questions, $time_taken);

if (mysqli_stmt_execute($stmt3)) {
    $attempt_id = mysqli_insert_id($conn);
    
    // Calculate percentage
    $percentage = round(($score / $total_questions) * 100, 1);
    
    // Check if total_score and quizzes_taken columns exist
    $checkColumnsQuery = "SHOW COLUMNS FROM users LIKE 'total_score'";
    $columnResult = mysqli_query($conn, $checkColumnsQuery);
    $hasScoreColumns = mysqli_num_rows($columnResult) > 0;
    
    // Update user stats if columns exist
    if ($hasScoreColumns) {
        $updateUserQuery = "UPDATE users 
                            SET total_score = total_score + ?,
                                quizzes_taken = quizzes_taken + 1
                            WHERE id = ?";
        
        $stmt4 = mysqli_prepare($conn, $updateUserQuery);
        mysqli_stmt_bind_param($stmt4, "ii", $score, $user_id);
        mysqli_stmt_execute($stmt4);
        mysqli_stmt_close($stmt4);
        
        // Get user's updated ranking
        $rankQuery = "SELECT COUNT(*) + 1 as rank
                      FROM users u1
                      WHERE u1.total_score > (
                          SELECT total_score FROM users WHERE id = ?
                      )";
        
        $stmt5 = mysqli_prepare($conn, $rankQuery);
        mysqli_stmt_bind_param($stmt5, "i", $user_id);
        mysqli_stmt_execute($stmt5);
        $rankResult = mysqli_stmt_get_result($stmt5);
        $rankData = mysqli_fetch_assoc($rankResult);
        $userRank = (int)$rankData['rank'];
        mysqli_stmt_close($stmt5);
    } else {
        $userRank = null;
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Quiz submitted successfully",
        "attempt_id" => $attempt_id,
        "score" => $score,
        "total_questions" => $total_questions,
        "percentage" => $percentage,
        "rank" => $userRank
    ]);
    
} else {
    echo json_encode([
        "success" => false, 
        "error" => "Failed to submit quiz results"
    ]);
}

mysqli_stmt_close($stmt3);
mysqli_close($conn);
?>