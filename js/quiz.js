// Quiz Data (replace with fetch from backend)

const quizCategory = new URLSearchParams(window.location.search).get('category') || 'default';
const quizData = {
  title: quizCategory.replace(/\b\w/g, l => l.toUpperCase()),
  description: "Answer the questions carefully.",
  questions: [
    {
      text: "Namibia gained independence in which year?",
      options: ["1980", "1990", "2000", "1970"],
      answer: "B",
      explanation: "Namibia gained independence from South Africa on 21 March 1990."
    },
    {
      text: "Who was the first President of independent Namibia?",
      options: ["Hifikepunye Pohamba", "Sam Nujoma", "Peter Katjavivi", "Theo-Ben Gurirab"],
      answer: "B",
      explanation: "Sam Nujoma served as Namibia's first President from 1990 to 2005."
    },
    // Add more questions or fetch via AJAX
  ]
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


// Initialize Quiz

function initQuiz() {
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
}


// Render Question

function renderQuestion() {
  const q = quizData.questions[currentQuestionIndex];
  questionText.textContent = q.text;
  const options = optionsContainer.querySelectorAll('.option');

  options.forEach((opt, i) => {
    opt.querySelector('.option-text').textContent = q.options[i];
    opt.classList.remove('correct', 'incorrect', 'selected');

    // Restore previous selection
    if (userAnswers[currentQuestionIndex] === opt.dataset.value) {
      opt.classList.add('selected');
    }
  });

  // Update buttons
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.style.display = currentQuestionIndex === quizData.questions.length - 1 ? 'none' : 'inline-block';
  submitBtn.style.display = currentQuestionIndex === quizData.questions.length - 1 ? 'inline-block' : 'none';

  // Update question number and progress
  currentQuestionNumber.textContent = currentQuestionIndex + 1;
  const progressPercent = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  progressFill.style.width = `${progressPercent}%`;

  updatePalette();
  updateStats();
}


// Option Click Handler

optionsContainer.querySelectorAll('.option').forEach(option => {
  option.addEventListener('click', function () {
    const selectedValue = this.dataset.value;

    // Save answer
    userAnswers[currentQuestionIndex] = selectedValue;

    // Immediate feedback
    const correctAnswer = quizData.questions[currentQuestionIndex].answer;
    optionsContainer.querySelectorAll('.option').forEach(opt => {
      opt.classList.remove('correct', 'incorrect');
      if (opt.dataset.value === correctAnswer) opt.classList.add('correct');
    });

    if (selectedValue !== correctAnswer) this.classList.add('incorrect');

    renderQuestion();
  });
});


// Navigation Buttons

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


// Flag Question

flagBtn.addEventListener('click', () => {
  if (flaggedQuestions.has(currentQuestionIndex)) {
    flaggedQuestions.delete(currentQuestionIndex);
  } else {
    flaggedQuestions.add(currentQuestionIndex);
  }
  updateStats();
});


// Update Sidebar Stats

function updateStats() {
  const answeredCount = userAnswers.filter(a => a).length;
  const notAnsweredCount = quizData.questions.length - answeredCount;
  const flaggedCount = flaggedQuestions.size;

  answeredCountEl.textContent = answeredCount;
  notAnsweredCountEl.textContent = notAnsweredCount;
  flaggedCountEl.textContent = flaggedCount;

  // Update palette colors
  questionGrid.querySelectorAll('.question-number').forEach((qDiv, i) => {
    qDiv.classList.remove('answered', 'not-answered', 'flagged');
    if (flaggedQuestions.has(i)) {
      qDiv.classList.add('flagged');
    } else if (userAnswers[i]) {
      qDiv.classList.add('answered');
    } else {
      qDiv.classList.add('not-answered');
    }
  });
}

function updatePalette() {
  // Highlight current question
  questionGrid.querySelectorAll('.question-number').forEach((qDiv, i) => {
    qDiv.classList.toggle('active', i === currentQuestionIndex);
  });
}

// Submit Quiz

submitBtn.addEventListener('click', () => {
  let score = 0;
  quizData.questions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) score++;
  });

  alert(`🏆 Quiz Completed!\nYour score: ${score} / ${quizData.questions.length}`);
  // You can send results to backend here via fetch
});

// Initialize

initQuiz();
