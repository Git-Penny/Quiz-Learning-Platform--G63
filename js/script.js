document.querySelectorAll('.smooth-scroll').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');

if (dropdownToggle) {
  dropdownToggle.addEventListener('click', e => {
    e.preventDefault();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', e => {
    if (!dropdownToggle.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  });
}

const feedbackForm = document.querySelector('.feedback-form');

if (feedbackForm) {
  feedbackForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = feedbackForm.querySelector('input[type="text"]').value.trim();
    const email = feedbackForm.querySelector('input[type="email"]').value.trim();
    const type = feedbackForm.querySelector('select').value;
    const message = feedbackForm.querySelector('textarea').value.trim();
    const rating = feedbackForm.querySelector('input[name="rating"]:checked')?.value || "Not Rated";

    if (!name || !email || !type || !message) {
      alert('❌ Please fill out all fields before submitting.');
      return;
    }

    
    const feedbackData = JSON.parse(localStorage.getItem('feedbacks')) || [];
    feedbackData.push({
      name,
      email,
      type,
      message,
      rating,
      date: new Date().toLocaleString()
    });
    localStorage.setItem('feedbacks', JSON.stringify(feedbackData));

    alert('✅ Thank you for your feedback!');
    feedbackForm.reset();
  });
}

// Updated auth functionality for the new HTML structure
function updateAuthUI() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const authButtons = document.getElementById('authButtons');
  
  if (currentUser && authButtons) {
    const loginBtn = authButtons.querySelector('.login-btn');
    const signupBtn = authButtons.querySelector('.signup-btn');
    const userAuthSection = authButtons.querySelector('.user-auth-section');
    const userName = document.getElementById('userName');
    
    if (loginBtn && signupBtn && userAuthSection && userName) {
      // Hide login/signup buttons
      loginBtn.style.display = 'none';
      signupBtn.style.display = 'none';
      
      // Show user section
      userAuthSection.style.display = 'flex';
      userName.textContent = currentUser.name || 'User';
      
      // Update CTA buttons for logged-in users
      const ctaButtons = document.querySelector('.cta-buttons');
      if (ctaButtons) {
        const startLearningBtn = ctaButtons.querySelector('.btn-primary');
        if (startLearningBtn) {
          startLearningBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Continue Learning';
          startLearningBtn.href = 'dashboard.html';
        }
        
        const practiceQuizBtn = ctaButtons.querySelector('.btn-secondary');
        if (practiceQuizBtn) {
          practiceQuizBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Go to Dashboard';
          practiceQuizBtn.href = 'dashboard.html';
        }
      }
    }
  }
}

// Setup logout functionality
function setupLogoutHandlers() {
  const logoutBtn = document.getElementById('headerLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userProgress');
        window.location.href = 'index.html';
      }
    });
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  setupLogoutHandlers();
});