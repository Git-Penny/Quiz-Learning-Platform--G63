console.log("🔧 Admin.js loaded");

// Select elements
const form = document.getElementById('questionForm');
const resetFormBtn = document.getElementById('resetForm');
const submitBtn = document.getElementById('submitQuestion');
const updateBtn = document.getElementById('updateQuestion');
const questionCategory = document.getElementById('questionCategory');
const questionText = document.getElementById('questionText');
const optionA = document.getElementById('optionA');
const optionB = document.getElementById('optionB');
const optionC = document.getElementById('optionC');
const optionD = document.getElementById('optionD');
const correctAnswer = document.getElementById('correctAnswer');
const questionExplanation = document.getElementById('questionExplanation');
const questionsTableBody = document.getElementById('questionsTableBody');
const emptyQuestionsState = document.getElementById('emptyQuestionsState');
const searchQuestions = document.getElementById('searchQuestions');
const filterCategory = document.getElementById('filterCategory');

// Feedback elements
const feedbackTableBody = document.getElementById('feedbackTableBody');
const emptyFeedbackState = document.getElementById('emptyFeedbackState');
const feedbackTypeFilter = document.getElementById('feedbackTypeFilter');
const refreshFeedbackBtn = document.getElementById('refreshFeedback');
const feedbackModal = document.getElementById('feedbackModal');
const modalClose = document.querySelector('.modal-close');
const closeModalBtn = document.getElementById('closeModal');

// Stats
const totalQuestionsCount = document.getElementById('totalQuestionsCount');
const totalUsersCount = document.getElementById('totalUsersCount');
const totalFeedbackCount = document.getElementById('totalFeedbackCount');

// Load from localStorage
let questions = JSON.parse(localStorage.getItem('quizr_questions')) || [];
let editIndex = null;
let allFeedback = [];

// ==========================================================
// QUESTIONS MANAGEMENT
// ==========================================================

// Render Questions Table
function renderQuestions(filter = '', search = '') {
    questionsTableBody.innerHTML = '';

    let filtered = questions.filter(q => {
        const matchesCategory = filter ? q.category === filter : true;
        const matchesSearch = search
            ? q.text.toLowerCase().includes(search.toLowerCase())
            : true;
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        emptyQuestionsState.style.display = 'block';
    } else {
        emptyQuestionsState.style.display = 'none';
    }

    filtered.forEach((q, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${q.text}</td>
            <td>${q.category}</td>
            <td>${q.correctAnswer}</td>
            <td>
                <button class="btn btn-small btn-success" onclick="editQuestion(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-small btn-danger" onclick="deleteQuestion(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        questionsTableBody.appendChild(row);
    });

    totalQuestionsCount.textContent = questions.length;
}

// Add Question
form.addEventListener('submit', e => {
    e.preventDefault();

    const newQuestion = {
        category: questionCategory.value.trim(),
        text: questionText.value.trim(),
        options: {
            A: optionA.value.trim(),
            B: optionB.value.trim(),
            C: optionC.value.trim(),
            D: optionD.value.trim(),
        },
        correctAnswer: correctAnswer.value,
        explanation: questionExplanation.value.trim(),
    };

    if (editIndex === null) {
        questions.push(newQuestion);
        alert('✅ Question added successfully!');
    } else {
        questions[editIndex] = newQuestion;
        editIndex = null;
        updateBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        alert('✅ Question updated successfully!');
    }

    localStorage.setItem('quizr_questions', JSON.stringify(questions));
    renderQuestions();
    form.reset();
});

// Edit Question
window.editQuestion = function (index) {
    const q = questions[index];
    questionCategory.value = q.category;
    questionText.value = q.text;
    optionA.value = q.options.A;
    optionB.value = q.options.B;
    optionC.value = q.options.C;
    optionD.value = q.options.D;
    correctAnswer.value = q.correctAnswer;
    questionExplanation.value = q.explanation;

    editIndex = index;
    updateBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete Question
window.deleteQuestion = function (index) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions.splice(index, 1);
        localStorage.setItem('quizr_questions', JSON.stringify(questions));
        renderQuestions();
    }
};

// Reset Form
resetFormBtn.addEventListener('click', () => {
    form.reset();
    editIndex = null;
    updateBtn.style.display = 'none';
    submitBtn.style.display = 'inline-block';
});

// Search and Filter
searchQuestions.addEventListener('input', e => {
    renderQuestions(filterCategory.value, e.target.value);
});

filterCategory.addEventListener('change', e => {
    renderQuestions(e.target.value, searchQuestions.value);
});

// ==========================================================
// FEEDBACK MANAGEMENT
// ==========================================================

// Fetch feedback from database
async function loadFeedback(type = '') {
    console.log("📥 Loading feedback from database...");
    
    try {
        const url = type 
            ? `../api/get_feedback.php?type=${type}` 
            : '../api/get_feedback.php';
        
        console.log("📡 Fetching from:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Feedback data:", data);
        
        if (data.success) {
            allFeedback = data.feedback;
            renderFeedback(data.feedback);
            totalFeedbackCount.textContent = data.total;
        } else {
            console.error("❌ Failed to load feedback:", data.error);
            showEmptyFeedback();
        }
    } catch (error) {
        console.error("💥 Error loading feedback:", error);
        showEmptyFeedback();
    }
}

// Render feedback table
function renderFeedback(feedbackList) {
    feedbackTableBody.innerHTML = '';
    
    if (feedbackList.length === 0) {
        showEmptyFeedback();
        return;
    }
    
    emptyFeedbackState.style.display = 'none';
    
    feedbackList.forEach(feedback => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => showFeedbackDetails(feedback);
        
        // Format date
        const date = new Date(feedback.submitted_at);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Format rating
        const stars = feedback.rating 
            ? '⭐'.repeat(feedback.rating) 
            : 'No rating';
        
        // Type badge color
        const typeColors = {
            'suggestion': '#4CAF50',
            'issue': '#f44336',
            'topic': '#2196F3',
            'praise': '#FF9800',
            'other': '#9E9E9E'
        };
        
        const typeColor = typeColors[feedback.type] || '#9E9E9E';
        
        row.innerHTML = `
            <td>${feedback.name}</td>
            <td>${feedback.email}</td>
            <td>
                <span class="type-badge" style="background-color: ${typeColor};">
                    ${feedback.type}
                </span>
            </td>
            <td>${stars}</td>
            <td>${formattedDate}</td>
        `;
        
        feedbackTableBody.appendChild(row);
    });
}

// Show empty state
function showEmptyFeedback() {
    feedbackTableBody.innerHTML = '';
    emptyFeedbackState.style.display = 'block';
    totalFeedbackCount.textContent = '0';
}

// Show feedback details in modal
function showFeedbackDetails(feedback) {
    document.getElementById('modalUserName').textContent = feedback.name;
    document.getElementById('modalUserEmail').textContent = feedback.email;
    document.getElementById('modalFeedbackType').textContent = feedback.type;
    document.getElementById('modalRating').textContent = feedback.rating 
        ? '⭐'.repeat(feedback.rating) 
        : 'No rating';
    
    const date = new Date(feedback.submitted_at);
    document.getElementById('modalDate').textContent = date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
    
    document.getElementById('modalMessage').textContent = feedback.message;
    
    feedbackModal.style.display = 'flex';
}

// Close modal
function closeModal() {
    feedbackModal.style.display = 'none';
}

modalClose.addEventListener('click', closeModal);
closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === feedbackModal) {
        closeModal();
    }
});

// Refresh feedback button
refreshFeedbackBtn.addEventListener('click', () => {
    loadFeedback(feedbackTypeFilter.value);
});

// Filter feedback by type
feedbackTypeFilter.addEventListener('change', (e) => {
    loadFeedback(e.target.value);
});

// ==========================================================
// USER STATS
// ==========================================================

// Load Users Count from database
async function loadUsersCount() {
    try {
        const response = await fetch('../api/get_user_stats.php');
        const data = await response.json();
        
        if (data.success) {
            totalUsersCount.textContent = data.total_users || 0;
        } else {
            console.error("❌ Failed to load users:", data.error);
            totalUsersCount.textContent = '0';
        }
    } catch (error) {
        console.error("💥 Error loading users:", error);
        totalUsersCount.textContent = '0';
    }
}


// ==========================================================
// INITIAL LOAD
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🎯 Admin panel initializing...");
    
    renderQuestions();
    loadFeedback();
    loadUsersCount();
    
    console.log("✅ Admin panel loaded successfully");
});