document.addEventListener('DOMContentLoaded', () => {
    initializeAdminPanel();
    setupEventListeners();
    loadQuestions();
    updateStats();
});

let questions = JSON.parse(localStorage.getItem('quizQuestions')) || [];
let editingQuestionId = null;

function initializeAdminPanel() {
    // Initialize with sample questions if empty
    if (questions.length === 0) {
        questions = [
            {
                id: 1,
                category: 'independence',
                question: 'When did Namibia gain independence?',
                options: {
                    A: '1980',
                    B: '1990',
                    C: '2000',
                    D: '2010'
                },
                correctAnswer: 'B',
                explanation: 'Namibia gained independence on March 21, 1990.'
            },
            {
                id: 2,
                category: 'colonial',
                question: 'Which European country colonized Namibia first?',
                options: {
                    A: 'Britain',
                    B: 'Portugal',
                    C: 'Germany',
                    D: 'France'
                },
                correctAnswer: 'C',
                explanation: 'Germany colonized Namibia as German South-West Africa in 1884.'
            }
        ];
        saveQuestions();
    }
}

function setupEventListeners() {
    // Form submission
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
    
    // Reset form
    document.getElementById('resetForm').addEventListener('click', resetForm);
    
    // Update question
    document.getElementById('updateQuestion').addEventListener('click', handleQuestionUpdate);
    
    // Search and filter
    document.getElementById('searchQuestions').addEventListener('input', filterQuestions);
    document.getElementById('filterCategory').addEventListener('change', filterQuestions);
}

function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData();
    if (!formData) return;
    
    if (editingQuestionId) {
        updateExistingQuestion(formData);
    } else {
        addNewQuestion(formData);
    }
}

function getFormData() {
    const category = document.getElementById('questionCategory').value;
    const questionText = document.getElementById('questionText').value.trim();
    const optionA = document.getElementById('optionA').value.trim();
    const optionB = document.getElementById('optionB').value.trim();
    const optionC = document.getElementById('optionC').value.trim();
    const optionD = document.getElementById('optionD').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;
    const explanation = document.getElementById('questionExplanation').value.trim();
    
    // Validation
    if (!category || !questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        alert('Please fill in all required fields.');
        return null;
    }
    
    return {
        category,
        question: questionText,
        options: { A: optionA, B: optionB, C: optionC, D: optionD },
        correctAnswer,
        explanation
    };
}

function addNewQuestion(formData) {
    const newQuestion = {
        id: Date.now(), // Simple ID generation
        ...formData
    };
    
    questions.push(newQuestion);
    saveQuestions();
    resetForm();
    loadQuestions();
    updateStats();
    
    showNotification('Question added successfully!', 'success');
}

function updateExistingQuestion(formData) {
    const questionIndex = questions.findIndex(q => q.id === editingQuestionId);
    if (questionIndex !== -1) {
        questions[questionIndex] = {
            ...questions[questionIndex],
            ...formData
        };
        
        saveQuestions();
        resetForm();
        loadQuestions();
        updateStats();
        
        showNotification('Question updated successfully!', 'success');
    }
}

function handleQuestionUpdate() {
    const formData = getFormData();
    if (!formData) return;
    updateExistingQuestion(formData);
}

function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Fill form with question data
    document.getElementById('questionCategory').value = question.category;
    document.getElementById('questionText').value = question.question;
    document.getElementById('optionA').value = question.options.A;
    document.getElementById('optionB').value = question.options.B;
    document.getElementById('optionC').value = question.options.C;
    document.getElementById('optionD').value = question.options.D;
    document.getElementById('correctAnswer').value = question.correctAnswer;
    document.getElementById('questionExplanation').value = question.explanation || '';
    
    // Switch to edit mode
    editingQuestionId = questionId;
    document.getElementById('submitQuestion').style.display = 'none';
    document.getElementById('updateQuestion').style.display = 'inline-flex';
    
    // Scroll to form
    document.getElementById('questionForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
        saveQuestions();
        loadQuestions();
        updateStats();
        
        showNotification('Question deleted successfully!', 'success');
    }
}

function resetForm() {
    document.getElementById('questionForm').reset();
    editingQuestionId = null;
    document.getElementById('submitQuestion').style.display = 'inline-flex';
    document.getElementById('updateQuestion').style.display = 'none';
}

function loadQuestions() {
    const tableBody = document.getElementById('questionsTableBody');
    const emptyState = document.getElementById('emptyQuestionsState');
    
    const filteredQuestions = getFilteredQuestions();
    
    if (filteredQuestions.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tableBody.innerHTML = filteredQuestions.map(question => `
        <tr>
            <td class="question-text" title="${question.question}">${question.question}</td>
            <td><span class="category-badge">${getCategoryName(question.category)}</span></td>
            <td class="correct-answer">${question.correctAnswer}</td>
            <td class="actions-cell">
                <button class="btn btn-warning" onclick="editQuestion(${question.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteQuestion(${question.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function getFilteredQuestions() {
    const searchTerm = document.getElementById('searchQuestions').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    
    return questions.filter(question => {
        const matchesSearch = question.question.toLowerCase().includes(searchTerm) ||
                            Object.values(question.options).some(opt => 
                                opt.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || question.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
}

function filterQuestions() {
    loadQuestions();
}

function getCategoryName(categoryKey) {
    const categories = {
        'independence': 'Independence Era',
        'colonial': 'Colonial History',
        'precolonial': 'Pre-Colonial Era',
        'liberation': 'Liberation Struggles',
        'culture': 'Culture & Heritage',
        'genocide': 'Genocide & Resistance'
    };
    return categories[categoryKey] || categoryKey;
}

function updateStats() {
    document.getElementById('totalQuestionsCount').textContent = questions.length;
    document.getElementById('totalCategoriesCount').textContent = 
        new Set(questions.map(q => q.category)).size;
    
    // For demo purposes - you might want to get this from your user system
    const users = JSON.parse(localStorage.getItem('quizUsers')) || [];
    document.getElementById('totalUsersCount').textContent = users.length;
}

function saveQuestions() {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export questions for use in other parts of the application
window.getQuizQuestions = (category = null) => {
    if (category) {
        return questions.filter(q => q.category === category);
    }
    return questions;
};