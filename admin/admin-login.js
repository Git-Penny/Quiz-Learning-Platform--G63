document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Simple validation
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Temporary static login for now
    const ADMIN_EMAIL = "admin@quizr.com";
    const ADMIN_PASSWORD = "admin123";

    // Simulated backend check
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store login flag
      localStorage.setItem("quizrAdminLoggedIn", "true");

      alert("Login successful!");
      window.location.href = "admin.html"; // redirect to admin panel
    } else {
      alert("Invalid credentials. Please try again.");
    }
  });
});
