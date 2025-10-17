// Sidebar & Hamburger Controls
const mobileHamburger = document.getElementById('mobileHamburger');
const desktopHamburger = document.getElementById('desktopHamburger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function toggleSidebar() {
    const isMobile = window.innerWidth <= 1024;

    if (isMobile) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

if (mobileHamburger) mobileHamburger.addEventListener('click', toggleSidebar);
if (desktopHamburger) desktopHamburger.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', () => {
    if (window.innerWidth <= 1024) toggleSidebar();
});

// User Dropdown
const userMenu = document.querySelector('.dashboard-user-menu');
const userDropdown = document.querySelector('.dashboard-user-dropdown');

if (userMenu) {
    userMenu.addEventListener('click', e => {
        e.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });
}

document.addEventListener('click', () => {
    if (userDropdown) userDropdown.style.display = 'none';
});

// Sidebar Active State
const sidebarItems = document.querySelectorAll('.dashboard-sidebar-item');
sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
        sidebarItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        if (window.innerWidth <= 1024) toggleSidebar();
    });
});

// Page Navigation Logic
function navigateTo(page) {
    window.location.href = page;
}

// Attach navigation to all sidebar & dropdown links
document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('dashboard.html');
    });
});

document.querySelectorAll('a[href="progress.html"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('progress.html');
    });
});

document.querySelectorAll('a[href="settings.html"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('settings.html');
    });
});

document.querySelectorAll('a[href="profile.html"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('profile.html');
    });
});

document.querySelectorAll('a[href="leaderboard.html"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('leaderboard.html');
    });
});
