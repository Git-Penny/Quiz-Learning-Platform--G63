<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$quiz_id = $_GET['quiz_id'] ?? null;
$category_id = $_GET['category_id'] ?? null;
$limit = intval($_GET['limit'] ?? 5);

if ($quiz_id) {
    $stmt = $pdo->prepare("SELECT q.id, q.question_text
                           FROM quizzes z
                           JOIN questions q ON q.category_id = z.category_id
                           WHERE z.id = :qid
                           ORDER BY RAND() LIMIT :l");
    $stmt->bindValue(':qid', $quiz_id, PDO::PARAM_INT);
} else {
    $stmt = $pdo->prepare("SELECT id, question_text FROM questions 
                           WHERE category_id = :cid ORDER BY RAND() LIMIT :l");
    $stmt->bindValue(':cid', $category_id, PDO::PARAM_INT);
}
$stmt->bindValue(':l', $limit, PDO::PARAM_INT);
$stmt->execute();

$questions = $stmt->fetchAll();

// Attach choices
foreach ($questions as &$q) {
    $c = $pdo->prepare("SELECT id, choice_text FROM choices WHERE question_id = :id ORDER BY id");
    $c->execute([':id' => $q['id']]);
    $q['choices'] = $c->fetchAll();
}

echo json_encode($questions);
?>
