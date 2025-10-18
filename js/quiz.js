// ===========================
// DEBUG MODE - Check if script is loading
// ===========================
console.log("🚀 Quiz.js is loading...");

// ===========================
// Fetch Quiz Data from Backend
// ===========================
const quizCategory = new URLSearchParams(window.location.search).get('category') || 'independence';
const apiUrl = `api/get_quiz.php?category=${quizCategory}`;
console.log("📡 Fetching from:", apiUrl);
console.log("📂 Category:", quizCategory);

let quizData = {
  title: quizCategory.replace(/\b\w/g, l => l.toUpperCase()),
  description: "Answer the questions carefully.",
  questions: [],
};

// State Variables
let currentQuestionIndex = 0;
const userAnswers = [];
const flaggedQuestions = new Set();

// DOM Elements - Check if they exist
console.log("🔍 Checking DOM elements...");
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

// Verify critical elements exist
if (!questionText || !optionsContainer) {
  console.error("❌ Critical DOM elements missing!");
  console.log("questionText:", questionText);
  console.log("optionsContainer:", optionsContainer);
}

console.log("✅ DOM elements found");


// ===========================
// Initialize Quiz
// ===========================
async function initQuiz() {
  try {
    console.log("🎯 Starting initQuiz...");
    
    // Show loading state
    if (questionText) {
      questionText.textContent = "Loading questions...";
    }
    
    console.log("📞 Making API call to:", apiUrl);
    const res = await fetch(apiUrl);
    
    console.log("📨 Response received. Status:", res.status);
    
    // Check if response is OK
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("✅ Data parsed successfully:");
    console.log("📊 Questions received:", data);

    // Check for errors in response
    if (data.error) {
      questionText.textContent = `⚠️ Error: ${data.error}`;
      console.error("❌ API Error:", data);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      questionText.textContent = "No questions found for this category.";
      console.warn("⚠️ No questions in data");
      return;
    }

    console.log(`✅ Found ${data.length} questions`);

    // Map backend format to frontend format
    quizData.questions = data.map((q, index) => {
      console.log(`Mapping question ${index + 1}:`, q);
      
      const correctChoice = q.choices.find(c => c.is_correct === true || c.is_correct === 1);
      console.log(`  Correct choice for Q${index + 1}:`, correctChoice);
      
      return {
        id: q.id,
        text: q.question_text,
        explanation: q.explanation || '',
        options: q.choices.map(c => c.text),
        correctChoice: correctChoice?.text || ''
      };
    });

    console.log("✅ Mapped questions:", quizData.questions);

    // Initialize user answers array
    quizData.questions.forEach(() => userAnswers.push(null));
    console.log("✅ User answers initialized:", userAnswers);

    quizTitle.textContent = quizData.title;
    quizDescription.textContent = quizData.description;
    totalQuestions.textContent = quizData.questions.length;

    console.log("✅ UI updated with quiz info");

    // Populate question palette
    questionGrid.innerHTML = '';
    quizData.questions.forEach((q, i) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question-number';
      qDiv.textContent = i + 1;
      qDiv.addEventListener('click', () => {
        console.log(`Jumping to question ${i + 1}`);
        currentQuestionIndex = i;
        renderQuestion();
      });
      questionGrid.appendChild(qDiv);
    });

    console.log("✅ Question palette created");

    renderQuestion();
    console.log("🎉 Quiz initialized successfully!");
    
  } catch (err) {
    console.error("💥 Error loading quiz:", err);
    console.error("Error details:", err.message);
    console.error("Stack trace:", err.stack);
    
    if (questionText) {
      questionText.textContent = `⚠️ Error loading quiz: ${err.message}`;
    }
  }
}


// ===========================
// Render Question
// ===========================
function renderQuestion() {
  console.log(`🎨 Rendering question ${currentQuestionIndex + 1}`);
  
  const q = quizData.questions[currentQuestionIndex];
  if (!q) {
    console.error("❌ No question at index:", currentQuestionIndex);
    return;
  }

  console.log("Question data:", q);

  questionText.textContent = q.text;
  optionsContainer.innerHTML = '';

  q.options.forEach((optText, i) => {
    const option = document.createElement('div');
    option.className = 'option';
    option.dataset.value = optText;
    option.innerHTML = `<span class="option-label">${String.fromCharCode(65 + i)}.</span> <span class="option-text">${optText}</span>`;

    option.addEventListener('click', () => {
      console.log(`Option ${String.fromCharCode(65 + i)} clicked:`, optText);
      handleOptionSelect(option, optText);
    });

    // Highlight previously selected answer
    if (userAnswers[currentQuestionIndex] === optText) {
      option.classList.add('selected');
      console.log(`Previously selected option highlighted: ${optText}`);
    }

    optionsContainer.appendChild(option);
  });

  console.log(`✅ ${q.options.length} options rendered`);

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
  console.log("✅ Question rendered successfully");
}


// ===========================
// Handle Option Selection
// ===========================
function handleOptionSelect(option, selectedText) {
  console.log("🎯 Selecting answer:", selectedText);
  
  // Store the user's answer
  userAnswers[currentQuestionIndex] = selectedText;
  console.log("Updated userAnswers:", userAnswers);

  // Remove previous selection highlighting
  const options = document.querySelectorAll('.option');
  options.forEach(opt => {
    opt.classList.remove('selected');
  });

  // Highlight the selected option
  option.classList.add('selected');
  
  updateStats();
  console.log("✅ Answer saved");
}


// ===========================
// Navigation & Controls
// ===========================
prevBtn.addEventListener('click', () => {
  console.log("⬅️ Previous button clicked");
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  console.log("➡️ Next button clicked");
  if (currentQuestionIndex < quizData.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
});

flagBtn.addEventListener('click', () => {
  console.log("🚩 Flag button clicked");
  if (flaggedQuestions.has(currentQuestionIndex)) {
    flaggedQuestions.delete(currentQuestionIndex);
    console.log("Question unflagged");
  } else {
    flaggedQuestions.add(currentQuestionIndex);
    console.log("Question flagged");
  }
  renderQuestion();
});

submitBtn.addEventListener('click', async () => {
  console.log("📤 Submit button clicked");
  
  // Check if all questions are answered
  const unansweredCount = userAnswers.filter(a => !a).length;
  
  if (unansweredCount > 0) {
    const confirmSubmit = confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`);
    if (!confirmSubmit) {
      console.log("Submission cancelled");
      return;
    }
  }

  // Calculate score
  let score = 0;
  quizData.questions.forEach((q, i) => {
    if (userAnswers[i] === q.correctChoice) {
      score++;
      console.log(`Q${i + 1}: Correct ✅`);
    } else {
      console.log(`Q${i + 1}: Incorrect ❌ (Selected: ${userAnswers[i]}, Correct: ${q.correctChoice})`);
    }
  });

  const percentage = ((score / quizData.questions.length) * 100).toFixed(1);
  
  console.log(`🏆 Final Score: ${score}/${quizData.questions.length} (${percentage}%)`);
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Save to backend if user is logged in
  if (currentUser && currentUser.id) {
    try {
      console.log("💾 Saving quiz results to backend...");
      
      // Get category ID from URL parameter
      const categoryMap = {
        'independence': 1,
        'colonial': 2,
        'precolonial': 3,
        'genocide': 4,
        'culture': 5,
        'liberation': 6
      };
      
      const categoryId = categoryMap[quizCategory] || 1;
      
      const response = await fetch('api/submit_quiz.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          category_id: categoryId,
          score: score,
          total_questions: quizData.questions.length,
          time_taken: null // You can track time if needed
        })
      });
      
      const data = await response.json();
      console.log("✅ Backend response:", data);
      
      if (data.success) {
        alert(`🏆 Quiz Completed!\n\nYour score: ${score} / ${quizData.questions.length}\nPercentage: ${percentage}%\nYour Rank: #${data.rank}\n\nCheck the leaderboard to see your position!`);
        
        // Redirect to leaderboard after 2 seconds
        setTimeout(() => {
          window.location.href = 'leaderboard.html';
        }, 2000);
      } else {
        alert(`🏆 Quiz Completed!\n\nYour score: ${score} / ${quizData.questions.length}\nPercentage: ${percentage}%\n\n(Note: Score not saved to leaderboard)`);
      }
      
    } catch (err) {
      console.error("Error saving quiz:", err);
      alert(`🏆 Quiz Completed!\n\nYour score: ${score} / ${quizData.questions.length}\nPercentage: ${percentage}%\n\n(Note: Score not saved to leaderboard)`);
    }
  } else {
    alert(`🏆 Quiz Completed!\n\nYour score: ${score} / ${quizData.questions.length}\nPercentage: ${percentage}%\n\nLogin to save your score on the leaderboard!`);
  }
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
console.log("🚀 Starting quiz initialization...");
initQuiz();