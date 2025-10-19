document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("questionForm");
  const resetBtn = document.getElementById("resetForm");
  const submitBtn = document.getElementById("submitQuestion");
  const updateBtn = document.getElementById("updateQuestion");
  const tableBody = document.getElementById("questionsTableBody");
  const emptyState = document.getElementById("emptyQuestionsState");
  const totalQuestionsCount = document.getElementById("totalQuestionsCount");
  const totalFeedbackCount = document.getElementById("totalFeedbackCount");

  const feedbackTable = document.getElementById("feedbackTableBody");
  const emptyFeedbackState = document.getElementById("emptyFeedbackState");
  const feedbackTypeFilter = document.getElementById("feedbackTypeFilter");
  const refreshFeedback = document.getElementById("refreshFeedback");

  const modal = document.getElementById("feedbackModal");
  const modalClose = document.querySelector(".modal-close");
  const modalCloseBtn = document.getElementById("closeModal");

  const feedbackBox = document.createElement("div");
  feedbackBox.id = "feedbackBox";
  document.body.appendChild(feedbackBox);

  function showFeedback(message, type = "info") {
    feedbackBox.textContent = message;
    feedbackBox.className = `feedback ${type}`;
    feedbackBox.style.opacity = "1";
    feedbackBox.style.transform = "translateY(0)";
    setTimeout(() => {
      feedbackBox.style.opacity = "0";
      feedbackBox.style.transform = "translateY(-20px)";
    }, 3000);
  }

  let questions = JSON.parse(localStorage.getItem("quizrQuestions")) || [];
  let editIndex = null;

  function renderQuestions() {
    tableBody.innerHTML = "";
    if (questions.length === 0) {
      emptyState.style.display = "block";
      totalQuestionsCount.textContent = "0";
      return;
    }

    emptyState.style.display = "none";
    totalQuestionsCount.textContent = questions.length;

    questions.forEach((q, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${q.text}</td>
        <td>${q.category}</td>
        <td>${q.correct}</td>
        <td class="actions">
          <button class="btn btn-small btn-edit" data-index="${index}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-small btn-delete" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  function resetForm() {
    form.reset();
    updateBtn.style.display = "none";
    submitBtn.style.display = "inline-flex";
    editIndex = null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const question = {
      category: document.getElementById("questionCategory").value,
      text: document.getElementById("questionText").value,
      options: {
        A: document.getElementById("optionA").value,
        B: document.getElementById("optionB").value,
        C: document.getElementById("optionC").value,
        D: document.getElementById("optionD").value,
      },
      correct: document.getElementById("correctAnswer").value,
      explanation: document.getElementById("questionExplanation").value,
    };

    if (editIndex === null) {
      questions.push(question);
      showFeedback("✅ Question added successfully!", "success");
    } else {
      questions[editIndex] = question;
      showFeedback("✏️ Question updated successfully!", "success");
      editIndex = null;
    }

    localStorage.setItem("quizrQuestions", JSON.stringify(questions));
    renderQuestions();
    resetForm();
  });

  resetBtn.addEventListener("click", resetForm);

  tableBody.addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit")) {
      const index = e.target.closest(".btn-edit").dataset.index;
      const q = questions[index];

      document.getElementById("questionCategory").value = q.category;
      document.getElementById("questionText").value = q.text;
      document.getElementById("optionA").value = q.options.A;
      document.getElementById("optionB").value = q.options.B;
      document.getElementById("optionC").value = q.options.C;
      document.getElementById("optionD").value = q.options.D;
      document.getElementById("correctAnswer").value = q.correct;
      document.getElementById("questionExplanation").value = q.explanation;

      editIndex = index;
      submitBtn.style.display = "none";
      updateBtn.style.display = "inline-flex";
    }

    if (e.target.closest(".btn-delete")) {
      const index = e.target.closest(".btn-delete").dataset.index;
      if (confirm("Are you sure you want to delete this question?")) {
        questions.splice(index, 1);
        localStorage.setItem("quizrQuestions", JSON.stringify(questions));
        renderQuestions();
        showFeedback("🗑️ Question deleted.", "error");
      }
    }
  });

  renderQuestions();

  let feedbackList = [
    {
      name: "Peter Pan",
      email: "peter@gmail.com",
      type: "suggestion",
      rating: "5/5",
      date: "2025-10-15",
    },
    {
      name: "Piet Pompies",
      email: "piet@gmail.com",
      type: "praise",
      rating: "4/5",
      date: "2025-10-16",
    },
     {
      name: "Sarah Ndapandula",
      email: "Sarah@gmail.com",
      type: "praise",
      rating: "5/5",
      date: "2025-10-14",
    },
    {
      name: "John Kahumba",
      email: "John@gmail.com",
      type: "request",
      rating: "3/5",
      date: "2025-10-17",
    },
  ];

  function renderFeedback(filter = "") {
    feedbackTable.innerHTML = "";
    let data = feedbackList;

    if (filter) data = data.filter((f) => f.type === filter);

    if (data.length === 0) {
      emptyFeedbackState.style.display = "block";
      totalFeedbackCount.textContent = "0";
      return;
    }

    emptyFeedbackState.style.display = "none";
    totalFeedbackCount.textContent = data.length;

    data.forEach((f) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.name}</td>
        <td>${f.email}</td>
        <td>${f.type}</td>
        <td>${f.rating}</td>
        <td>${f.date}</td>`;
      tr.addEventListener("click", () => openFeedbackModal(f));
      feedbackTable.appendChild(tr);
    });
  }

  feedbackTypeFilter.addEventListener("change", () => {
    renderFeedback(feedbackTypeFilter.value);
  });

  refreshFeedback.addEventListener("click", () => {
    showFeedback("🔄 Feedback refreshed!", "info");
    renderFeedback(feedbackTypeFilter.value);
  });

  function openFeedbackModal(feedback) {
    modal.classList.add("show");
    document.getElementById("modalUserName").textContent = feedback.name;
    document.getElementById("modalUserEmail").textContent = feedback.email;
    document.getElementById("modalFeedbackType").textContent = feedback.type;
    document.getElementById("modalRating").textContent = feedback.rating;
    document.getElementById("modalDate").textContent = feedback.date;
    document.getElementById("modalMessage").textContent = feedback.message;
  }

  function closeModal() {
    modal.classList.remove("show");
  }

  modalClose.addEventListener("click", closeModal);
  modalCloseBtn.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  renderFeedback();
});
