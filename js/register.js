// Grab the form element
const form = document.querySelector('form');
const submitBtn = form.querySelector('.submit-btn');

form.addEventListener('submit', function (e) {
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

    // === Real backend registration ===
    const userData = {
        username: email.split('@')[0],
        full_name: fullName,
        email: email,
        password: password
    };

   fetch('http://localhost/Quiz-Learning-Platform--G63/api/register.php', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ Account created successfully!');
            window.location.href = 'login.html';
        } else {
            alert(`❌ ${data.error || 'Registration failed.'}`);
        }
    })
    .catch(err => {
        console.error(err);
        alert('⚠️ Network or server error.');
    })
    .finally(() => {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
});
