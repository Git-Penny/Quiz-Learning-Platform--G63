<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['success' => false, 'message' => 'Missing credentials']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :u LIMIT 1");
$stmt->execute([':u' => $username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
}
?>
