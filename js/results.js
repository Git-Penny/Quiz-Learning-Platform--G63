// Sidebar Active State & Navigation
const sidebarItems = document.querySelectorAll('.dashboard-sidebar-item');
sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
        // Highlight active item
        sidebarItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        // Navigate to page
        const href = this.getAttribute('href');
        if (href) {
            window.location.href = href;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// User Dropdown Navigation
const userMenu = document.querySelector('.dashboard-user-menu');
const userDropdown = document.querySelector('.dashboard-user-dropdown');

if (userMenu) {
    userMenu.addEventListener('click', e => {
        e.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    if (userDropdown) userDropdown.style.display = 'none';
});
