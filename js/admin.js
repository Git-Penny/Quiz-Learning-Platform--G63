// ==========================================================
// QUIZR - Admin Panel JavaScript
// ==========================================================

console.log("🔧 Admin.js loaded");

// API Base URL
const API_URL = '../api/admin/admin_api.php';

// State
let questions = [];
let editingQuestionId = null;

// Category ID mapping
const categoryMap = {
    'Independence Era': 1,
    'Colonial History': 2,
    'Pre-Colonial Era': 3,
    'Genocide & Resistance': 4,
    'Culture & Heritage': 5,
    'Liberation Struggles': 6
};

// DOM Elements
const questionForm = document.getElementById('questionForm');
const submitBtn = document.getElementById('submitQuestion');
const updateBtn = document.getElementById('updateQuestion');
const resetBtn = document.getElementById('resetForm');
const questionsTableBody = document.getElementById('questionsTableBody');
const searchInput = document.getElementById('searchQuestions');
const filterSelect = document.getElementById('filterCategory');
const emptyState = document.getElementById('emptyQuestionsState');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadQuestions();
    
    // Event listeners
    questionForm.addEventListener('submit', handleSubmit);
    resetBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', () => loadQuestions());
    filterSelect.addEventListener('change', () => loadQuestions());
});

// ==========================================================
// Load Dashboard Stats
// ==========================================================
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}?action=get_stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalQuestionsCount').textContent = data.stats.total_questions;
            document.getElementById('totalCategoriesCount').textContent = data.stats.total_categories;
            document.getElementById('totalUsersCount').textContent = data.stats.total_users;
        }
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

// ==========================================================
// Load Questions
// ==========================================================
async function loadQuestions() {
    try {
        const category = filterSelect.value;
        const search = searchInput.value;
        
        let url = `${API_URL}?action=get_questions`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            questions = data.questions;
            renderQuestions();
        } else {
            showMessage(data.error || 'Failed to load questions', 'error');
        }
    } catch (err) {
        console.error("Error loading questions:", err);
        showMessage('Network error loading questions', 'error');
    }
}

// ==========================================================
// Render Questions Table
// ==========================================================
function renderQuestions() {
    if (questions.length === 0) {
        questionsTableBody.innerHTML = '';
        emptyState.style.display = 'block';
        document.querySelector('.questions-table').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    document.querySelector('.questions-table').style.display = 'table';
    
    questionsTableBody.innerHTML = questions.map(q => `
        <tr>
            <td class="question-text">${q.question_text}</td>
            <td><span class="category-badge">${q.category_name}</span></td>
            <td><span class="correct-badge">Option ${q.correct_answer}</span></td>
            <td class="action-buttons">
                <button onclick="editQuestion(${q.id})" class="btn-edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteQuestion(${q.id})" class="btn-delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================================
// Handle Form Submit
// ==========================================================
async function handleSubmit(e) {
    e.preventDefault();
    
    const category = document.getElementById('questionCategory').value;
    const questionText = document.getElementById('questionText').value.trim();
    const optionA = document.getElementById('optionA').value.trim();
    const optionB = document.getElementById('optionB').value.trim();
    const optionC = document.getElementById('optionC').value.trim();
    const optionD = document.getElementById('optionD').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;
    const explanation = document.getElementById('questionExplanation').value.trim();
    
    if (!category || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const choices = [
        { text: optionA, is_correct: correctAnswer === 'A' },
        { text: optionB, is_correct: correctAnswer === 'B' },
        { text: optionC, is_correct: correctAnswer === 'C' },
        { text: optionD, is_correct: correctAnswer === 'D' }
    ];
    
    const questionData = {
        question_text: questionText,
        category_id: getCategoryId(category),
        explanation: explanation,
        choices: choices
    };
    
    if (editingQuestionId) {
        questionData.id = editingQuestionId;
        await updateQuestion(questionData);
    } else {
        await addQuestion(questionData);
    }
}

// ==========================================================
// Add Question
// ==========================================================
async function addQuestion(data) {
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        const response = await fetch(`${API_URL}?action=add_question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Question added successfully!', 'success');
            resetForm();
            loadQuestions();
            loadStats();
        } else {
            showMessage(result.error || 'Failed to add question', 'error');
        }
    } catch (err) {
        console.error("Error adding question:", err);
        showMessage('Network error', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Question';
    }
}

// ==========================================================
// Update Question
// ==========================================================
async function updateQuestion(data) {
    try {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        const response = await fetch(`${API_URL}?action=update_question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Question updated successfully!', 'success');
            resetForm();
            loadQuestions();
        } else {
            showMessage(result.error || 'Failed to update question', 'error');
        }
    } catch (err) {
        console.error("Error updating question:", err);
        showMessage('Network error', 'error');
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-edit"></i> Update Question';
    }
}

// ==========================================================
// Edit Question
// ==========================================================
window.editQuestion = function(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    editingQuestionId = questionId;
    
    // Populate form
    document.getElementById('questionCategory').value = getCategorySlug(question.category_name);
    document.getElementById('questionText').value = question.question_text;
    document.getElementById('questionExplanation').value = question.explanation || '';
    
    // Populate options
    question.choices.forEach((choice, index) => {
        const optionId = ['optionA', 'optionB', 'optionC', 'optionD'][index];
        document.getElementById(optionId).value = choice.text;
    });
    
    // Set correct answer
    document.getElementById('correctAnswer').value = question.correct_answer;
    
    // Show update button, hide submit button
    submitBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    
    // Scroll to form
    questionForm.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================
// Delete Question
// ==========================================================
window.deleteQuestion = async function(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
        const response = await fetch(`${API_URL}?action=delete_question&id=${questionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Question deleted successfully!', 'success');
            loadQuestions();
            loadStats();
        } else {
            showMessage(result.error || 'Failed to delete question', 'error');
        }
    } catch (err) {
        console.error("Error deleting question:", err);
        showMessage('Network error', 'error');
    }
}

// ==========================================================
// Reset Form
// ==========================================================
function resetForm() {
    questionForm.reset();
    editingQuestionId = null;
    submitBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
}

// ==========================================================
// Helper Functions
// ==========================================================
function getCategoryId(categoryName) {
    const map = {
        'independence': 1,
        'colonial': 2,
        'precolonial': 3,
        'genocide': 4,
        'culture': 5,
        'liberation': 6
    };
    return map[categoryName] || 1;
}

function getCategorySlug(categoryName) {
    const map = {
        'Independence Era': 'independence',
        'Colonial History': 'colonial',
        'Pre-Colonial Era': 'precolonial',
        'Genocide & Resistance': 'genocide',
        'Culture & Heritage': 'culture',
        'Liberation Struggles': 'liberation'
    };
    return map[categoryName] || '';
}

function showMessage(message, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass}`;
    alert.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        font-weight: 500;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}