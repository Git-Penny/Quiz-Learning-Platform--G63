<?php
// ==========================================================
// QUIZR - Get Quiz Questions by Category
// ==========================================================

// ✅ Disable error display in JSON responses
error_reporting(0);
ini_set('display_errors', 0);

// ✅ Include the correct database config file
require_once __DIR__ . '/../config/db.php';

// ✅ Return JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ✅ Check database connection
if (!$conn) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// ✅ Get the category ID or name from the query string
$category = isset($_GET['category']) ? $_GET['category'] : null;

if (!$category) {
    echo json_encode(["error" => "No category specified"]);
    exit;
}

// ✅ If category is a string like 'independence', map it to an ID
$categoryMap = [
    'independence' => 1,
    'colonial' => 2,
    'precolonial' => 3,
    'genocide' => 4,
    'culture' => 5,
    'liberation' => 6
];

$category_id = is_numeric($category) ? intval($category) : ($categoryMap[strtolower($category)] ?? null);

if (!$category_id) {
    echo json_encode(["error" => "Invalid category: " . $category]);
    exit;
}

// ✅ Fetch questions for the category (using prepared statement for security)
$query = "SELECT id, question_text, difficulty, explanation 
          FROM questions 
          WHERE category_id = ? 
          ORDER BY id ASC 
          LIMIT 10";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "i", $category_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result) {
    echo json_encode(["error" => "Database query failed", "details" => mysqli_error($conn)]);
    exit;
}

// ✅ Build structured JSON with choices
$questions = [];
while ($row = mysqli_fetch_assoc($result)) {
    $q_id = $row['id'];
    
    // Fetch choices for this question
    $choice_query = "SELECT id, choice_text, is_correct FROM choices WHERE question_id = ?";
    $choice_stmt = mysqli_prepare($conn, $choice_query);
    mysqli_stmt_bind_param($choice_stmt, "i", $q_id);
    mysqli_stmt_execute($choice_stmt);
    $choice_result = mysqli_stmt_get_result($choice_stmt);
    
    $choices = [];
    if ($choice_result) {
        while ($c = mysqli_fetch_assoc($choice_result)) {
            $choices[] = [
                "id" => (int)$c['id'],
                "text" => $c['choice_text'],
                "is_correct" => (int)$c['is_correct'] === 1
            ];
        }
    }
    
    $questions[] = [
        "id" => (int)$row['id'],
        "question_text" => $row['question_text'],
        "difficulty" => $row['difficulty'],
        "explanation" => $row['explanation'] ?? '',
        "choices" => $choices
    ];
}

// ✅ Check if questions were found
if (empty($questions)) {
    echo json_encode(["error" => "No questions found for category ID: " . $category_id]);
    exit;
}

// ✅ Return questions as JSON
echo json_encode($questions, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>