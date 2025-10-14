<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$type = $data['type'] ?? 'other';
$message = trim($data['message'] ?? '');
$rating = intval($data['rating'] ?? 0);

if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO feedback (name,email,type,message,rating)
                       VALUES (:n,:e,:t,:m,:r)");
$stmt->execute([':n'=>$name, ':e'=>$email, ':t'=>$type, ':m'=>$message, ':r'=>$rating]);

echo json_encode(['success'=>true,'message'=>'Feedback submitted successfully']);
?>
