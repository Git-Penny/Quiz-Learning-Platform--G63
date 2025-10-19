// Admin Panel Functionality
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

// Stats
const totalQuestionsCount = document.getElementById('totalQuestionsCount');
const totalUsersCount = document.getElementById('totalUsersCount');

// Load from localStorage
let questions = JSON.parse(localStorage.getItem('quizr_questions')) || [];
let editIndex = null;

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


// Load Users Count (Fake Data)
function loadUsersCount() {
    // Simulate fetching user data (can replace with real DB)
    const users = JSON.parse(localStorage.getItem('quizr_users')) || [];
    totalUsersCount.textContent = users.length;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    renderQuestions();
    loadUsersCount();
});
