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

// ==========================================================
// FEEDBACK FORM HANDLER - FIXED VERSION
// ==========================================================

console.log("🔄 Loading feedback handler...");

document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.querySelector('.feedback-form');
    
    if (!feedbackForm) {
        console.log("ℹ️ No feedback form on this page");
        return;
    }
    
    console.log("✅ Feedback form found, attaching handler");
    
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("📤 Feedback form submitted");
        
        // Get all form fields
        const nameInput = feedbackForm.querySelector('input[type="text"]');
        const emailInput = feedbackForm.querySelector('input[type="email"]');
        const typeSelect = feedbackForm.querySelector('select');
        const messageTextarea = feedbackForm.querySelector('textarea');
        const ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const type = typeSelect ? typeSelect.value : '';
        const message = messageTextarea ? messageTextarea.value.trim() : '';
        const rating = ratingInput ? parseInt(ratingInput.value) : null;
        
        console.log("📋 Form data:", { name, email, type, message, rating });
        
        // Validate
        if (!name || !email || !type || !message) {
            alert('❌ Please fill out all required fields.');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Please enter a valid email address.');
            return;
        }
        
        // Get submit button
        const submitBtn = feedbackForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            console.log("📡 Sending to API: api/submit_feedback.php");
            
            const response = await fetch('api/submit_feedback.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    type: type,
                    message: message,
                    rating: rating
                })
            });
            
            console.log("📨 Response status:", response.status);
            console.log("📨 Response headers:", response.headers.get('content-type'));
            
            const responseText = await response.text();
            console.log("📨 Raw response:", responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("❌ JSON parse error:", parseError);
                console.error("Response was:", responseText);
                throw new Error("Server returned invalid JSON");
            }
            
            console.log("✅ Parsed response:", data);
            
            if (data.success) {
                alert('✅ Thank you for your feedback! Your message has been received.');
                
                // Reset form
                feedbackForm.reset();
                
                // Uncheck all star ratings
                feedbackForm.querySelectorAll('input[name="rating"]').forEach(function(radio) {
                    radio.checked = false;
                });
                
                console.log("✅ Feedback submitted successfully, ID:", data.feedback_id);
            } else {
                alert('❌ Error: ' + (data.error || 'Failed to submit feedback'));
                console.error("Server error:", data.error);
            }
            
        } catch (err) {
            console.error("💥 Error submitting feedback:", err);
            alert('❌ Network error. Please check your internet connection and try again.');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

console.log("✅ Feedback handler loaded");