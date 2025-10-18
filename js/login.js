// ==========================================================
// QUIZR - Login Form Handler (Standalone - No Imports)
// ==========================================================

console.log("🚀 Login.js loaded");

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        console.log("✅ User already logged in, redirecting...");
        window.location.href = 'dashboard.html';
        return;
    }

    initLoginForm();
});

function initLoginForm() {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitBtn = form.querySelector('.submit-btn');
    const forgotLink = document.querySelector('.forgot-password');

    // Auto-fill email if came from registration
    const registeredEmail = sessionStorage.getItem('registeredEmail');
    if (registeredEmail) {
        emailInput.value = registeredEmail;
        sessionStorage.removeItem('registeredEmail');
        showMessage('✅ Registration successful! Please login.', 'success');
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("📝 Login form submitted");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        if (!email || !password) {
            showMessage('❌ Please fill in all fields.', 'error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('❌ Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        setLoading(true, submitBtn);

        try {
            console.log("📤 Sending login request...");
            
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            console.log("📨 Response received:", response);

            const data = await response.json();
            console.log("✅ Response data:", data);

            if (data.success) {
                // Extract first name from full name
                const firstName = getFirstName(data.user.full_name);

                // Store user data in localStorage
                const userData = {
                    id: data.user.id,
                    username: data.user.username,
                    name: firstName,
                    fullName: data.user.full_name,
                    email: data.user.email,
                    loginTime: new Date().toISOString()
                };

                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log("✅ User data stored:", userData);

                showMessage(`✅ Welcome back, ${firstName}!`, 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);

            } else {
                showMessage(`❌ ${data.message}`, 'error');
                console.error("Login failed:", data.message);
            }

        } catch (err) {
            console.error("💥 Error during login:", err);
            showMessage('❌ Network error. Please check your connection.', 'error');
        } finally {
            setLoading(false, submitBtn);
        }
    });

    // Handle forgot password
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            const userEmail = prompt('Enter your email to reset password:');
            
            if (userEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(userEmail)) {
                    showMessage(`📧 Password reset instructions sent to: ${userEmail}`, 'success');
                    // TODO: Implement actual password reset API call
                    console.log("Password reset requested for:", userEmail);
                } else {
                    showMessage('❌ Please enter a valid email address.', 'error');
                }
            }
        });
    }

    // Handle social login buttons (placeholder)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
            showMessage(`🚧 ${provider} login coming soon!`, 'info');
        });
    });

    // Add Enter key handler for password field
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

// Helper: Extract first name from full name
function getFirstName(fullName) {
    if (!fullName) return 'User';
    const names = fullName.trim().split(/\s+/);
    return names[0] || 'User';
}

// Helper: Show visual messages
function showMessage(message, type) {
    console.log(`Message (${type}):`, message);
    
    let msgBox = document.querySelector('.message-box');
    
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.className = 'message-box';
        document.body.appendChild(msgBox);
    }

    msgBox.textContent = message;
    msgBox.className = `message-box ${type}`;
    msgBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        transition: opacity 0.3s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // Set colors based on type
    if (type === 'success') {
        msgBox.style.background = '#4CAF50';
        msgBox.style.color = 'white';
    } else if (type === 'error') {
        msgBox.style.background = '#f44336';
        msgBox.style.color = 'white';
    } else if (type === 'info') {
        msgBox.style.background = '#2196F3';
        msgBox.style.color = 'white';
    }

    msgBox.style.opacity = '1';

    setTimeout(() => {
        msgBox.style.opacity = '0';
        setTimeout(() => msgBox.remove(), 300);
    }, 3000);
}

// Helper: Show/hide loading state
function setLoading(isLoading, button) {
    if (isLoading) {
        button.dataset.originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        button.disabled = true;
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
    } else {
        button.innerHTML = button.dataset.originalHtml || '<i class="fas fa-sign-in-alt"></i> Login';
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}