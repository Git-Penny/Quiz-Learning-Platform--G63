<?php
// ==========================================================
// QUIZR - Admin API (CRUD for Questions)
// ==========================================================

error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

// Check database connection
if (!$conn) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route requests
switch ($action) {
    case 'get_stats':
        getStats($conn);
        break;
    case 'get_questions':
        getQuestions($conn);
        break;
    case 'add_question':
        addQuestion($conn);
        break;
    case 'update_question':
        updateQuestion($conn);
        break;
    case 'delete_question':
        deleteQuestion($conn);
        break;
    default:
        echo json_encode(["success" => false, "error" => "Invalid action"]);
        break;
}

// ==========================================================
// Get Dashboard Stats
// ==========================================================
function getStats($conn) {
    $stats = [];
    
    // Total questions
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM questions");
    $row = mysqli_fetch_assoc($result);
    $stats['total_questions'] = (int)$row['count'];
    
    // Total categories
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM categories");
    $row = mysqli_fetch_assoc($result);
    $stats['total_categories'] = (int)$row['count'];
    
    // Total users (all users, or only students)
    $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM users WHERE role = 'student' OR role IS NULL");
    $row = mysqli_fetch_assoc($result);
    $stats['total_users'] = (int)$row['count'];
    
    // Total quiz attempts (if table exists)
    $tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'user_attempts'");
    if (mysqli_num_rows($tableCheck) > 0) {
        $result = mysqli_query($conn, "SELECT COUNT(*) as count FROM user_attempts");
        $row = mysqli_fetch_assoc($result);
        $stats['total_attempts'] = (int)$row['count'];
    } else {
        $stats['total_attempts'] = 0;
    }
    
    echo json_encode([
        "success" => true,
        "stats" => $stats
    ]);
}

// ==========================================================
// Get All Questions
// ==========================================================
function getQuestions($conn) {
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    $query = "SELECT q.id, q.question_text, q.explanation, c.id as category_id, c.name as category_name
              FROM questions q
              JOIN categories c ON q.category_id = c.id
              WHERE 1=1";
    
    if ($category) {
        $category = mysqli_real_escape_string($conn, $category);
        $query .= " AND c.name LIKE '%$category%'";
    }
    
    if ($search) {
        $search = mysqli_real_escape_string($conn, $search);
        $query .= " AND q.question_text LIKE '%$search%'";
    }
    
    $query .= " ORDER BY q.id DESC";
    
    $result = mysqli_query($conn, $query);
    
    if (!$result) {
        echo json_encode([
            "success" => false,
            "error" => mysqli_error($conn)
        ]);
        return;
    }
    
    $questions = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $q_id = $row['id'];
        
        // Get choices for this question
        $choicesQuery = "SELECT id, choice_text, is_correct FROM choices WHERE question_id = $q_id ORDER BY id";
        $choicesResult = mysqli_query($conn, $choicesQuery);
        
        $choices = [];
        $correctAnswer = '';
        $optionLabels = ['A', 'B', 'C', 'D'];
        $index = 0;
        
        while ($choice = mysqli_fetch_assoc($choicesResult)) {
            $label = $optionLabels[$index];
            $choices[] = [
                'id' => $choice['id'],
                'label' => $label,
                'text' => $choice['choice_text'],
                'is_correct' => (int)$choice['is_correct']
            ];
            if ($choice['is_correct'] == 1) {
                $correctAnswer = $label;
            }
            $index++;
        }
        
        $questions[] = [
            'id' => $row['id'],
            'question_text' => $row['question_text'],
            'explanation' => $row['explanation'],
            'category_id' => $row['category_id'],
            'category_name' => $row['category_name'],
            'choices' => $choices,
            'correct_answer' => $correctAnswer
        ];
    }
    
    echo json_encode([
        "success" => true,
        "questions" => $questions
    ]);
}

// ==========================================================
// Add New Question
// ==========================================================
function addQuestion($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || empty($data['question_text']) || empty($data['category_id']) || empty($data['choices'])) {
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        return;
    }
    
    $question_text = mysqli_real_escape_string($conn, $data['question_text']);
    $category_id = (int)$data['category_id'];
    $explanation = isset($data['explanation']) ? mysqli_real_escape_string($conn, $data['explanation']) : '';
    
    // Insert question
    $query = "INSERT INTO questions (category_id, question_text, explanation, created_at) 
              VALUES ($category_id, '$question_text', '$explanation', NOW())";
    
    if (mysqli_query($conn, $query)) {
        $question_id = mysqli_insert_id($conn);
        
        // Insert choices
        foreach ($data['choices'] as $choice) {
            $choice_text = mysqli_real_escape_string($conn, $choice['text']);
            $is_correct = $choice['is_correct'] ? 1 : 0;
            
            $choiceQuery = "INSERT INTO choices (question_id, choice_text, is_correct) 
                           VALUES ($question_id, '$choice_text', $is_correct)";
            mysqli_query($conn, $choiceQuery);
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Question added successfully",
            "question_id" => $question_id
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => mysqli_error($conn)
        ]);
    }
}

// ==========================================================
// Update Question
// ==========================================================
function updateQuestion($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || empty($data['id']) || empty($data['question_text'])) {
        echo json_encode(["success" => false, "error" => "Missing required fields"]);
        return;
    }
    
    $question_id = (int)$data['id'];
    $question_text = mysqli_real_escape_string($conn, $data['question_text']);
    $category_id = (int)$data['category_id'];
    $explanation = isset($data['explanation']) ? mysqli_real_escape_string($conn, $data['explanation']) : '';
    
    // Update question
    $query = "UPDATE questions 
              SET question_text = '$question_text', 
                  category_id = $category_id, 
                  explanation = '$explanation' 
              WHERE id = $question_id";
    
    if (mysqli_query($conn, $query)) {
        // Delete old choices
        mysqli_query($conn, "DELETE FROM choices WHERE question_id = $question_id");
        
        // Insert new choices
        foreach ($data['choices'] as $choice) {
            $choice_text = mysqli_real_escape_string($conn, $choice['text']);
            $is_correct = $choice['is_correct'] ? 1 : 0;
            
            $choiceQuery = "INSERT INTO choices (question_id, choice_text, is_correct) 
                           VALUES ($question_id, '$choice_text', $is_correct)";
            mysqli_query($conn, $choiceQuery);
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Question updated successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => mysqli_error($conn)
        ]);
    }
}

// ==========================================================
// Delete Question
// ==========================================================
function deleteQuestion($conn) {
    $question_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($question_id === 0) {
        echo json_encode(["success" => false, "error" => "Invalid question ID"]);
        return;
    }
    
    // Delete question (choices will be deleted automatically due to CASCADE)
    $query = "DELETE FROM questions WHERE id = $question_id";
    
    if (mysqli_query($conn, $query)) {
        echo json_encode([
            "success" => true,
            "message" => "Question deleted successfully"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "error" => mysqli_error($conn)
        ]);
    }
}

mysqli_close($conn);
?>