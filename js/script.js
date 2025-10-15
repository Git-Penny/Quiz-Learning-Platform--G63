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


const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const navRight = document.querySelector('.nav-right');

if (currentUser && navRight) {
  navRight.innerHTML = `
    <span class="welcome-text">👋 Welcome, ${currentUser.name}</span>
    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
  `;

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    alert('👋 You have been logged out.');
    location.reload();
  });
}
