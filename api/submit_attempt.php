<?php
// ==========================================================
// QUIZR - Submit Quiz Attempt API
// ==========================================================

// include database connection
require __DIR__ . '/../config/db.php';

// tell browser this is JSON
header('Content-Type: application/json');

// read the JSON sent from JavaScript or Postman
$data = json_decode(file_get_contents("php://input"), true);

// basic validation
if (!$data || !isset($data['quiz_id']) || !isset($data['answers'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing quiz_id or answers in request"
    ]);
    exit;
}

// get values from JSON
$userId = isset($data['user_id']) ? intval($data['user_id']) : 1; // default 1 for now
$quizId = intval($data['quiz_id']);
$answers = $data['answers'];
$totalQuestions = count($answers);
$score = 0;

// start timestamps
$startTime = date('Y-m-d H:i:s');
$completedAt = date('Y-m-d H:i:s');

// ----------------------------------------------------------
// 1. create new attempt
// ----------------------------------------------------------
$attemptSql = "INSERT INTO attempts (user_id, quiz_id, score, total, started_at, completed_at, status)
               VALUES (?, ?, 0, ?, ?, ?, 'completed')";
$stmt = mysqli_prepare($conn, $attemptSql);
mysqli_stmt_bind_param($stmt, "iiiss", $userId, $quizId, $totalQuestions, $startTime, $completedAt);
mysqli_stmt_execute($stmt);
$attemptId = mysqli_insert_id($conn);

// ----------------------------------------------------------
// 2. check each answer and record it
// ----------------------------------------------------------
foreach ($answers as $ans) {
    $questionId = intval($ans['question_id']);
    $selectedChoice = intval($ans['selected_choice']);

    // verify if selected choice is correct
    $check = mysqli_query($conn, "
        SELECT is_correct FROM choices 
        WHERE id = $selectedChoice AND question_id = $questionId
    ");
    $isCorrect = 0;
    if ($check && $row = mysqli_fetch_assoc($check)) {
        $isCorrect = intval($row['is_correct']);
        if ($isCorrect === 1) $score++;
    }

    // insert into attempt_answers table
    $insertAns = "
        INSERT INTO attempt_answers (attempt_id, question_id, selected_choice, is_correct)
        VALUES ($attemptId, $questionId, $selectedChoice, $isCorrect)
    ";
    mysqli_query($conn, $insertAns);
}

// ----------------------------------------------------------
// 3. update attempt score
// ----------------------------------------------------------
mysqli_query($conn, "UPDATE attempts SET score = $score WHERE id = $attemptId");

// ----------------------------------------------------------
// 4. send response
// ----------------------------------------------------------
echo json_encode([
    "status" => "success",
    "message" => "Attempt saved successfully",
    "attempt_id" => $attemptId,
    "score" => $score,
    "total" => $totalQuestions
]);

mysqli_close($conn);
?>
