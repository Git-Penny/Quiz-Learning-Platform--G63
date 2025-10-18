

console.log("📊 Loading dashboard stats...");

// Check authentication
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Update welcome message
document.addEventListener('DOMContentLoaded', async () => {
    // Update user name in header
    const userNameEl = document.querySelector('.dashboard-user-name');
    if (userNameEl) {
        userNameEl.textContent = `Welcome, ${currentUser.name || currentUser.username}!`;
    }
    
    // Fetch user statistics
    try {
        const response = await fetch(`api/get_user_stats.php?user_id=${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.stats);
        }
    } catch (err) {
        console.error("Error loading user stats:", err);
    }
});

// Update dashboard stats
function updateDashboardStats(stats) {
    // Update total quizzes
    const quizzesEl = document.getElementById('totalQuizzes');
    if (quizzesEl) quizzesEl.textContent = stats.quizzes_taken || 0;
    
    // Update total score
    const scoreEl = document.getElementById('totalScore');
    if (scoreEl) scoreEl.textContent = stats.total_score || 0;
    
    // Update average accuracy
    const accuracyEl = document.getElementById('avgAccuracy');
    if (accuracyEl) accuracyEl.textContent = `${stats.avg_accuracy || 0}%`;
    
    // Update rank
    const rankEl = document.getElementById('userRank');
    if (rankEl) rankEl.textContent = `#${stats.rank || 'N/A'}`;
    
    console.log("✅ Dashboard stats updated:", stats);
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const nameDisplay = document.querySelector('.dashboard-user-name');
  const logoutLink = document.querySelector('.dashboard-user-dropdown a[href="index.html"]');

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Display the user's name
  nameDisplay.textContent = `Welcome, ${user.name || 'Student'}!`;

  // Logout functionality
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    alert('👋 You have been logged out.');
    window.location.href = 'login.html';
  });

  // Sidebar and menu logic
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
      mobileHamburgerIcon.className = sidebar.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    } else {
      sidebar.classList.toggle('collapsed');
      desktopHamburgerIcon.className = sidebar.classList.contains('collapsed') ? 'fas fa-bars' : 'fas fa-times';
    }
  }

  mobileHamburger.addEventListener('click', toggleSidebar);
  desktopHamburger.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', () => { if (window.innerWidth <= 1024) toggleSidebar(); });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      mobileHamburgerIcon.className = 'fas fa-bars';
    } else {
      sidebar.classList.remove('collapsed');
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      mobileHamburgerIcon.className = 'fas fa-bars';
      desktopHamburgerIcon.className = 'fas fa-bars';
    }
  });

  const userMenu = document.querySelector('.dashboard-user-menu');
  const userDropdown = document.querySelector('.dashboard-user-dropdown');

  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', () => { userDropdown.style.display = 'none'; });

  const sidebarItems = document.querySelectorAll('.dashboard-sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', function () {
      sidebarItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      if (window.innerWidth <= 1024) toggleSidebar();
    });
  });
});
// Map sidebar items to their target pages
const pageMap = {
    'Dashboard': 'dashboard.html',
    'Progress': 'progress.html',
    'Leaderboard': 'leaderboard.html',
    'Settings': 'settings.html',
    'Profile': 'profile.html'
};

// Set click handlers for all sidebar items
sidebarItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Remove active class from all
        sidebarItems.forEach(i => i.classList.remove('active'));
        // Set this item as active
        this.classList.add('active');

        // Get the page name from the text
        const pageName = this.querySelector('span').innerText;
        const targetPage = pageMap[pageName];

        if (targetPage) {
            // Navigate to the page
            window.location.href = targetPage;
        }

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 1024) toggleSidebar();
    });
});

