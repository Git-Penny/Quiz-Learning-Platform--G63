<?php
header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';
$full_name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');

if (!$username || !$password || !$email) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Hash the password
$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, full_name, email, role)
                           VALUES (:u, :p, :f, :e, 'student')");
    $stmt->execute([
        ':u' => $username,
        ':p' => $hash,
        ':f' => $full_name,
        ':e' => $email
    ]);

    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} catch (PDOException $e) {
    if (str_contains($e->getMessage(), 'Duplicate')) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    }
}
?>
