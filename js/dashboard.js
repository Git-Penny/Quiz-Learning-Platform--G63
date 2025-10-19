// ==========================================================
// QUIZR - Dashboard JavaScript (COMPLETE FIXED VERSION)
// ==========================================================

console.log("📊 Dashboard.js loaded");

// ==========================================================
// Helper Functions
// ==========================================================

function getCurrentUser() {
    try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    } catch (err) {
        console.error("Error parsing currentUser:", err);
        return null;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
}

// ==========================================================
// Authentication Check
// ==========================================================

const currentUser = getCurrentUser();
if (!currentUser) {
    console.log("❌ No user logged in, redirecting to login");
    window.location.href = 'login.html';
}

console.log("✅ User authenticated:", currentUser);

// ==========================================================
// Initialize Dashboard
// ==========================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 DOM loaded, initializing dashboard");
    
    // Update user name in header
    const userNameEl = document.querySelector('.dashboard-user-name');
    if (userNameEl) {
        userNameEl.textContent = `Welcome, ${currentUser.name || currentUser.username}!`;
        console.log("✅ User name updated");
    }
    
    // Fetch user statistics
    console.log("📊 Fetching user stats...");
    try {
        const response = await fetch(`api/get_user_stats.php?user_id=${currentUser.id}`);
        console.log("📨 Stats response status:", response.status);
        
        const data = await response.json();
        console.log("✅ Stats data received:", data);
        
        if (data.success) {
            updateDashboardStats(data.stats);
        } else {
            console.error("❌ Stats fetch failed:", data.error);
            // Set default values
            updateDashboardStats({
                quizzes_taken: 0,
                total_score: 0,
                avg_accuracy: 0,
                rank: 'N/A'
            });
        }
    } catch (err) {
        console.error("❌ Error loading user stats:", err);
        // Set default values
        updateDashboardStats({
            quizzes_taken: 0,
            total_score: 0,
            avg_accuracy: 0,
            rank: 'N/A'
        });
    }

    // Initialize sidebar and menu
    initializeSidebar();
    initializeUserMenu();
});

// ==========================================================
// Update Dashboard Stats
// ==========================================================

function updateDashboardStats(stats) {
    console.log("📊 Updating dashboard stats:", stats);
    
    // Update quizzes completed (using class selector from your HTML)
    const quizzesEl = document.querySelector('.stat-completed');
    if (quizzesEl) {
        quizzesEl.textContent = stats.quizzes_taken || 0;
        console.log("✅ Quizzes updated:", stats.quizzes_taken);
    } else {
        console.warn("❌ .stat-completed element not found");
    }
    
    // Update average score (using class selector from your HTML)
    const averageEl = document.querySelector('.stat-average');
    if (averageEl) {
        averageEl.textContent = `${stats.avg_accuracy || 0}%`;
        console.log("✅ Average score updated:", stats.avg_accuracy);
    } else {
        console.warn("❌ .stat-average element not found");
    }
    
    // Update day streak (using class selector from your HTML)
    const streakEl = document.querySelector('.stat-streak');
    if (streakEl) {
        streakEl.textContent = 0; // You don't have streak tracking yet
        console.log("✅ Streak updated");
    } else {
        console.warn("❌ .stat-streak element not found");
    }
    
    // Also update progress view metrics
    const progressMetrics = document.querySelectorAll('.progress-metric .metric-value');
    if (progressMetrics.length >= 3) {
        progressMetrics[0].textContent = `${stats.avg_accuracy || 0}%`; // Mastery Level
        progressMetrics[1].textContent = stats.quizzes_taken || 0; // Quizzes Taken
        progressMetrics[2].textContent = 0; // Day Streak
        console.log("✅ Progress metrics updated");
    }
    
    console.log("✅ Dashboard stats updated successfully");
}

// ==========================================================
// Sidebar Functionality
// ==========================================================

function initializeSidebar() {
    const mobileHamburger = document.getElementById('mobileHamburger');
    const mobileHamburgerIcon = document.getElementById('mobileHamburgerIcon');
    const desktopHamburger = document.getElementById('desktopHamburger');
    const desktopHamburgerIcon = document.getElementById('desktopHamburgerIcon');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    function toggleSidebar() {
        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
            if (mobileHamburgerIcon) {
                mobileHamburgerIcon.className = sidebar.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
            }
        } else {
            sidebar.classList.toggle('collapsed');
            if (desktopHamburgerIcon) {
                desktopHamburgerIcon.className = sidebar.classList.contains('collapsed') ? 'fas fa-bars' : 'fas fa-times';
            }
        }
    }

    if (mobileHamburger) mobileHamburger.addEventListener('click', toggleSidebar);
    if (desktopHamburger) desktopHamburger.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', () => {
        if (window.innerWidth <= 1024) toggleSidebar();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileHamburgerIcon) mobileHamburgerIcon.className = 'fas fa-bars';
        } else {
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (mobileHamburgerIcon) mobileHamburgerIcon.className = 'fas fa-bars';
            if (desktopHamburgerIcon) desktopHamburgerIcon.className = 'fas fa-bars';
        }
    });

    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.dashboard-sidebar-item');
    const pageMap = {
        'Dashboard': 'dashboard.html',
        'Progress': 'progress.html',
        'Leaderboard': 'leaderboard.html',
        'Settings': 'settings.html',
        'Profile': 'profile.html'
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const pageName = this.querySelector('span').innerText;
            const targetPage = pageMap[pageName];

            if (targetPage) {
                window.location.href = targetPage;
            }

            if (window.innerWidth <= 1024) toggleSidebar();
        });
    });

    console.log("✅ Sidebar initialized");
}

// ==========================================================
// User Menu Functionality
// ==========================================================

function initializeUserMenu() {
    const userMenu = document.querySelector('.dashboard-user-menu');
    const userDropdown = document.querySelector('.dashboard-user-dropdown');
    const logoutLink = document.querySelector('.dashboard-user-dropdown a[href="index.html"]');

    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            userDropdown.style.display = 'none';
        });
    }

    // Logout functionality
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            alert('👋 You have been logged out.');
            window.location.href = 'login.html';
        });
    }

    console.log("✅ User menu initialized");
}