<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$quiz_id = $data['quiz_id'] ?? null;
$answers = $data['answers'] ?? [];

if (!$user_id || !$quiz_id || empty($answers)) {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
    exit;
}

$total = count($answers);
$score = 0;

$pdo->beginTransaction();

try {
    // Insert attempt
    $stmt = $pdo->prepare("INSERT INTO attempts (user_id, quiz_id, total, started_at, completed_at)
                           VALUES (:u, :q, :t, NOW(), NOW())");
    $stmt->execute([':u' => $user_id, ':q' => $quiz_id, ':t' => $total]);
    $attempt_id = $pdo->lastInsertId();

    // Grade and insert answers
    foreach ($answers as $a) {
        $q_id = $a['question_id'];
        $selected = $a['selected_choice'];

        $chk = $pdo->prepare("SELECT is_correct FROM choices WHERE id = :cid AND question_id = :qid");
        $chk->execute([':cid' => $selected, ':qid' => $q_id]);
        $res = $chk->fetch();

        $correct = $res && $res['is_correct'] ? 1 : 0;
        if ($correct) $score++;

        $pdo->prepare("INSERT INTO attempt_answers (attempt_id, question_id, selected_choice, is_correct)
                       VALUES (:a, :q, :s, :c)")
            ->execute([':a' => $attempt_id, ':q' => $q_id, ':s' => $selected, ':c' => $correct]);
    }

    // Update score
    $pdo->prepare("UPDATE attempts SET score = :s WHERE id = :id")
        ->execute([':s' => $score, ':id' => $attempt_id]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Attempt saved',
        'score' => $score,
        'total' => $total
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
