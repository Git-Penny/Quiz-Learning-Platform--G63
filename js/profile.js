// profile.js - Basic profile page functionality
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupProfileEvents();
});

function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    
    if (currentUser) {
        // Update personal info
        document.getElementById('profileFullName').textContent = currentUser.fullName || 'Not set';
        document.getElementById('profileEmail').textContent = currentUser.email || 'Not set';
        document.getElementById('profileJoinDate').textContent = currentUser.joinDate || 'Recently';
        
        // Update dashboard welcome
        const dashboardUserName = document.getElementById('dashboardUserName');
        if (dashboardUserName) {
            dashboardUserName.textContent = currentUser.name || 'Student';
        }
    }
    
    // Update learning stats
    updateLearningStats(userProgress);
}

function updateLearningStats(progress) {
    const totalQuizzes = progress.overall?.totalQuizzes || 0;
    const averageScore = progress.overall?.averageScore || 0;
    const streak = progress.overall?.learningStreak || 0;
    
    document.getElementById('profileQuizzesCompleted').textContent = totalQuizzes;
    document.getElementById('profileAverageScore').textContent = `${averageScore}%`;
    document.getElementById('profileStreak').textContent = streak;
}

function setupProfileEvents() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            alert('Profile editing feature coming soon!');
        });
    }
    
    // Setup logout
    const logoutLink = document.getElementById('logoutSidebarLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userProgress');
                window.location.href = 'index.html';
            }
        });
    }
}