// login.js
import { login, getCurrentUser } from './auth.js';


// Handles login form submission and feedback.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const button = form.querySelector('.submit-btn');
  const forgotLink = document.querySelector('.forgot-password');

  // Redirect if already logged in
  const user = getCurrentUser();
  if (user) {
    window.location.href = 'dashboard.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showMessage('❌ Please fill in all fields.', 'error');
      return;
    }

    // Show loading spinner
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user) {

        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          name: user.name || user.username,
          email: user.email
        }));

        showMessage(`✅ Welcome back, ${user.name || 'user'}!`, 'success');
        setTimeout(() => (window.location.href = 'dashboard.html'), 1000);
      } else {
        showMessage('❌ Invalid email or password.', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('❌ Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  });

  // Forgot password
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    const userEmail = prompt('Enter your email to reset password:');
    if (userEmail) {
      showMessage(`📧 Password reset link sent to: ${userEmail}`, 'info');
    }
  });

  // Helper: show visual messages
  function showMessage(message, type) {
    let msgBox = document.querySelector('.message-box');
    if (!msgBox) {
      msgBox = document.createElement('div');
      msgBox.className = 'message-box';
      document.body.appendChild(msgBox);
    }
    msgBox.textContent = message;
    msgBox.className = `message-box ${type}`;
    msgBox.style.opacity = '1';
    setTimeout(() => (msgBox.style.opacity = '0'), 3000);
  }

  // Helper: show spinner & disable button
  function setLoading(isLoading) {
    if (isLoading) {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      button.disabled = true;
    } else {
      button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      button.disabled = false;
    }
  }
});
