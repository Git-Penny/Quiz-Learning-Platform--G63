// Grab the form element
const form = document.querySelector('form');
const submitBtn = form.querySelector('.submit-btn');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Grab form values
    const fullName = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;
    const termsAccepted = form.querySelector('input[type="checkbox"]').checked;

    // Basic validations
    if (!fullName || !email || !password || !confirmPassword) {
        alert('❌ Please fill in all fields.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address.');
        return;
    }

    // Password match
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match.');
        return;
    }

    // Terms acceptance
    if (!termsAccepted) {
        alert('❌ You must accept the terms and conditions.');
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {

        localStorage.setItem('currentUser', JSON.stringify({
            id: Date.now(), // or generate a real ID
            name: fullName,
            email: email
        }));

        alert('✅ Account created successfully!');
        window.location.href = 'dashboard.html';
    }, 1500);
});
