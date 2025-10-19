// ==========================================================
// QUIZR - Dashboard JavaScript (FINAL FIXED VERSION)
// ==========================================================

console.log("📊 Dashboard.js loaded");

// ==========================================================
// AUTHENTICATION CHECK
// ==========================================================

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error("Error parsing currentUser:", e);
        return null;
    }
}

// Check if user is logged in
const currentUser = getCurrentUser();
if (!currentUser) {
    console.warn("❌ No user logged in, redirecting to login...");
    window.location.href = "../login.html";
} else {
    console.log("✅ User authenticated:", currentUser);
}

// ==========================================================
// USER STATS API
// ==========================================================

// Fetch user stats from API (corrected path)
async function loadUserStats() {
    if (!currentUser || !currentUser.id) {
        console.warn("❌ No user ID available");
        return;
    }

    console.log("📊 Loading user stats for ID:", currentUser.id);

    try {
        // ✅ FIXED PATH (admin → root)
        const response = await fetch(`../api/get_user_stats.php?user_id=${currentUser.id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ User stats loaded:", data);

        if (data.success && data.stats) {
            updateDashboardStats(data.stats);
        } else {
            console.error("❌ Failed to load stats:", data.error || "Unknown error");
            updateDashboardStats({ quizzes_taken: 0, total_score: 0, avg_accuracy: 0 });
        }
    } catch (error) {
        console.error("💥 Error loading user stats:", error);
        updateDashboardStats({ quizzes_taken: 0, total_score: 0, avg_accuracy: 0 });
    }
}

// ==========================================================
// UPDATE DASHBOARD STATS IN UI
// ==========================================================

function updateDashboardStats(stats) {
    console.log("📊 Updating dashboard stats:", stats);

    // Total quizzes (or questions completed)
    const completedEl = document.querySelector('.stat-completed h3');
    if (completedEl) {
        completedEl.textContent = stats.quizzes_taken || 0;
        console.log("✅ Quizzes updated:", stats.quizzes_taken);
    } else {
        console.warn("⚠️ Element '.stat-completed h3' not found");
    }

    // Average accuracy
    const avgEl = document.querySelector('.stat-average h3');
    if (avgEl) {
        avgEl.textContent = `${stats.avg_accuracy || 0}%`;
        console.log("✅ Average updated:", stats.avg_accuracy);
    } else {
        console.warn("⚠️ Element '.stat-average h3' not found");
    }

    // Streak (placeholder)
    const streakEl = document.querySelector('.stat-streak h3');
    if (streakEl) {
        streakEl.textContent = stats.streak || 0;
        console.log("✅ Streak updated:", stats.streak || 0);
    } else {
        console.warn("⚠️ Element '.stat-streak h3' not found");
    }

    console.log("✅ Dashboard stats updated successfully");
}

// ==========================================================
// SIDEBAR FUNCTIONALITY
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🎯 Dashboard initializing...");

    // Load stats after DOM ready
    loadUserStats();

    // Sidebar links
    const sidebarItems = document.querySelectorAll('.dashboard-sidebar-item');
    if (sidebarItems.length > 0) {
        console.log(`✅ Found ${sidebarItems.length} sidebar items`);
        sidebarItems.forEach(item => {
            item.addEventListener('click', function () {
                sidebarItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    } else {
        console.warn("⚠️ No sidebar items found");
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutSidebarLink');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            console.log("👋 User logged out");
            window.location.href = "../index.html";
        });
    }

    console.log("✅ Dashboard loaded successfully");
});

// ==========================================================
// WELCOME MESSAGE
// ==========================================================

if (currentUser && currentUser.name) {
    document.addEventListener('DOMContentLoaded', () => {
        const welcomeEl = document.querySelector('.dashboard-user-name');
        if (welcomeEl) {
            welcomeEl.textContent = `Welcome, ${currentUser.name}!`;
        }
    });
}
