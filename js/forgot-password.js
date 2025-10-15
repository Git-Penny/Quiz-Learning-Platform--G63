// Attach to your existing form
document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  const emailInput = document.querySelector('#user_email');
  const email = emailInput.value.trim().toLowerCase();
  const button = this.querySelector('.submit-btn');

  if (!email) {
    alert('❌ Please enter your email address.');
    return;
  }

  // Get users from localStorage (simulating a small backend)
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email.toLowerCase() === email);

  // Show loading animation
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  button.disabled = true;

  setTimeout(() => {
    if (user) {
      alert(`✅ A password reset link has been sent to ${email}.\n(For demo: this would open a secure reset form.)`);
    } else {
      alert(`❌ No account found for ${email}. Please sign up first.`);
    }

    // Restore button
    button.innerHTML = originalText;
    button.disabled = false;
    emailInput.value = '';
  }, 1200);
});
