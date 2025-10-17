// ===========================
// Fetch Quiz Data from Backend
// ===========================
const quizCategory = new URLSearchParams(window.location.search).get('category') || 'independence';
const apiUrl = `api/get_quiz.php?category=${quizCategory}`;
console.log("Fetching from:", apiUrl);

let quizData = {
  title: quizCategory.replace(/\b\w/g, l => l.toUpperCase()),
  description: "Answer the questions carefully.",
  questions: [],
};

// State Variables
let currentQuestionIndex = 0;
const userAnswers = [];
const flaggedQuestions = new Set();

// DOM Elements
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const currentQuestionNumber = document.getElementById('currentQuestionNumber');
const totalQuestions = document.getElementById('totalQuestions');
const progressFill = document.querySelector('.progress-fill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const flagBtn = document.getElementById('flagBtn');
const answeredCountEl = document.getElementById('answeredCount');
const notAnsweredCountEl = document.getElementById('notAnsweredCount');
const flaggedCountEl = document.getElementById('flaggedCount');
const questionGrid = document.getElementById('questionGrid');
const quizTitle = document.getElementById('quizTitle');
const quizDescription = document.getElementById('quizDescription');


// ===========================
// Initialize Quiz
// ===========================
async function initQuiz() {
  try {
    console.log("Starting fetch...");
    const res = await fetch(apiUrl);
    
    // Check if response is OK
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Fetched data:", data);

    // Check for errors in response
    if (data.error) {
      questionText.textContent = `⚠️ Error: ${data.error}`;
      console.error("API Error:", data);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      questionText.textContent = "No questions found for this category.";
      return;
    }

    // Map backend format to frontend format
    quizData.questions = data.map(q => ({
      id: q.id,
      text: q.question_text,
      explanation: q.explanation || '',
      options: q.choices.map(c => c.text),
      correctChoice: q.choices.find(c => c.is_correct === true || c.is_correct === 1)?.text || ''
    }));

    console.log("Mapped questions:", quizData.questions);

    // Initialize user answers array
    quizData.questions.forEach(() => userAnswers.push(null));

    quizTitle.textContent = quizData.title;
    quizDescription.textContent = quizData.description;
    totalQuestions.textContent = quizData.questions.length;

    // Populate question palette
    questionGrid.innerHTML = '';
    quizData.questions.forEach((q, i) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question-number';
      qDiv.textContent = i + 1;
      qDiv.addEventListener('click', () => {
        currentQuestionIndex = i;
        renderQuestion();
      });
      questionGrid.appendChild(qDiv);
    });

    renderQuestion();
  } catch (err) {
    console.error("Error loading quiz:", err);
    questionText.textContent = `⚠️ Error loading quiz data: ${err.message}`;
  }
}


// ===========================
// Render Question
// ===========================
function renderQuestion() {
  const q = quizData.questions[currentQuestionIndex];
  if (!q) {
    console.error("No question at index:", currentQuestionIndex);
    return;
  }

  questionText.textContent = q.text;
  optionsContainer.innerHTML = '';

  q.options.forEach((optText, i) => {
    const option = document.createElement('div');
    option.className = 'option';
    option.dataset.value = optText;
    option.innerHTML = `<span class="option-label">${String.fromCharCode(65 + i)}.</span> <span class="option-text">${optText}</span>`;

    option.addEventListener('click', () => handleOptionSelect(option, optText));

    // Highlight previously selected answer
    if (userAnswers[currentQuestionIndex] === optText) {
      option.classList.add('selected');
    }

    optionsContainer.appendChild(option);
  });

  // Update buttons
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.style.display = currentQuestionIndex === quizData.questions.length - 1 ? 'none' : 'inline-block';
  submitBtn.style.display = currentQuestionIndex === quizData.questions.length - 1 ? 'inline-block' : 'none';

  // Update flag button
  if (flaggedQuestions.has(currentQuestionIndex)) {
    flagBtn.innerHTML = '<i class="fas fa-flag"></i> Unflag Question';
  } else {
    flagBtn.innerHTML = '<i class="far fa-flag"></i> Flag Question';
  }

  currentQuestionNumber.textContent = currentQuestionIndex + 1;
  const progressPercent = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  progressFill.style.width = `${progressPercent}%`;

  updateStats();
}


// ===========================
// Handle Option Selection
// ===========================
function handleOptionSelect(option, selectedText) {
  // Store the user's answer
  userAnswers[currentQuestionIndex] = selectedText;

  // Remove previous selection highlighting
  const options = document.querySelectorAll('.option');
  options.forEach(opt => {
    opt.classList.remove('selected');
  });

  // Highlight the selected option
  option.classList.add('selected');
  
  updateStats();
}


// ===========================
// Navigation & Controls
// ===========================
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex < quizData.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
});

flagBtn.addEventListener('click', () => {
  if (flaggedQuestions.has(currentQuestionIndex)) {
    flaggedQuestions.delete(currentQuestionIndex);
  } else {
    flaggedQuestions.add(currentQuestionIndex);
  }
  renderQuestion(); // Re-render to update flag button text
});

submitBtn.addEventListener('click', () => {
  // Check if all questions are answered
  const unansweredCount = userAnswers.filter(a => !a).length;
  
  if (unansweredCount > 0) {
    const confirmSubmit = confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`);
    if (!confirmSubmit) return;
  }

  // Calculate score
  let score = 0;
  quizData.questions.forEach((q, i) => {
    if (userAnswers[i] === q.correctChoice) {
      score++;
    }
  });

  const percentage = ((score / quizData.questions.length) * 100).toFixed(1);
  
  alert(`🏆 Quiz Completed!\n\nYour score: ${score} / ${quizData.questions.length}\nPercentage: ${percentage}%`);
  
  // Optionally redirect to results page or dashboard
  // window.location.href = `results.html?score=${score}&total=${quizData.questions.length}`;
});


// ===========================
// Stats & Highlight
// ===========================
function updateStats() {
  const answeredCount = userAnswers.filter(a => a).length;
  const notAnsweredCount = quizData.questions.length - answeredCount;
  const flaggedCount = flaggedQuestions.size;

  answeredCountEl.textContent = answeredCount;
  notAnsweredCountEl.textContent = notAnsweredCount;
  flaggedCountEl.textContent = flaggedCount;

  questionGrid.querySelectorAll('.question-number').forEach((qDiv, i) => {
    qDiv.classList.remove('answered', 'not-answered', 'flagged', 'active');
    
    if (flaggedQuestions.has(i)) {
      qDiv.classList.add('flagged');
    } else if (userAnswers[i]) {
      qDiv.classList.add('answered');
    } else {
      qDiv.classList.add('not-answered');
    }
    
    if (i === currentQuestionIndex) {
      qDiv.classList.add('active');
    }
  });
}


// ===========================
// Start Quiz
// ===========================
initQuiz();