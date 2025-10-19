// ==========================================================
// QUIZR - Leaderboard JavaScript
// ==========================================================

console.log("🏆 Leaderboard.js loaded");

// Get current user
function getCurrentUser() {
    try {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    } catch (err) {
        console.error("Error parsing currentUser:", err);
        return null;
    }
}

const currentUser = getCurrentUser();
let currentFilter = 'all-time';

// ==========================================================
// Initialize Leaderboard
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Initializing leaderboard");
    
    // Load leaderboard data
    loadLeaderboard();
    
    // Setup filter buttons
    setupFilters();
});

// ==========================================================
// Load Leaderboard Data
// ==========================================================

async function loadLeaderboard() {
    console.log(`📊 Loading leaderboard (filter: ${currentFilter})`);
    
    const podium = document.querySelector('.podium');
    const leaderboardTable = document.querySelector('.leaderboard-table tbody');
    const userPosition = document.querySelector('.user-position');
    
    // Show loading state
    if (leaderboardTable) {
        leaderboardTable.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading leaderboard...</td></tr>';
    }
    
    try {
        const url = currentUser 
            ? `api/get_leaderboard.php?filter=${currentFilter}&user_id=${currentUser.id}`
            : `api/get_leaderboard.php?filter=${currentFilter}`;
        
        console.log("📡 Fetching from:", url);
        
        const response = await fetch(url);
        console.log("📨 Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ Leaderboard data:", data);
        
        if (data.success) {
            displayPodium(data.leaderboard);
            displayLeaderboard(data.leaderboard);
            
            if (currentUser && data.user_position) {
                displayUserPosition(data.user_position);
            }
            
            updateStats(data.total_players);
        } else {
            throw new Error(data.error || 'Failed to load leaderboard');
        }
        
    } catch (err) {
        console.error("❌ Error loading leaderboard:", err);
        
        if (leaderboardTable) {
            leaderboardTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Error loading leaderboard: ${err.message}<br>
                        <small>Please check console for details</small>
                    </td>
                </tr>
            `;
        }
    }
}

// ==========================================================
// Display Podium (Top 3)
// ==========================================================

function displayPodium(leaderboard) {
    const podium = document.querySelector('.podium');
    if (!podium || leaderboard.length === 0) return;
    
    console.log("🏆 Displaying podium");
    
    // Get top 3
    const top3 = leaderboard.slice(0, 3);
    
    // Order: 2nd, 1st, 3rd
    const positions = [
        top3[1] || null, // 2nd place (left)
        top3[0] || null, // 1st place (center)
        top3[2] || null  // 3rd place (right)
    ];
    
    const rankLabels = ['🥈 2nd', '🥇 1st', '🥉 3rd'];
    const rankClasses = ['second', 'first', 'third'];
    
    podium.innerHTML = positions.map((player, index) => {
        if (!player) return '<div class="podium-item empty"></div>';
        
        return `
            <div class="podium-item ${rankClasses[index]}">
                <div class="podium-rank">${rankLabels[index]}</div>
                <div class="podium-avatar">
                    ${player.profile_image 
                        ? `<img src="${player.profile_image}" alt="${player.full_name}">` 
                        : `<i class="fas fa-user-circle"></i>`
                    }
                </div>
                <h3>${player.full_name || player.username}</h3>
                <p class="podium-score">${player.total_score} points</p>
                <p class="podium-stats">${player.quizzes_taken} quizzes • ${player.avg_accuracy}%</p>
                <div class="podium-badges">${player.badges.join(' ')}</div>
            </div>
        `;
    }).join('');
}

// ==========================================================
// Display Leaderboard Table
// ==========================================================

function displayLeaderboard(leaderboard) {
    const tbody = document.querySelector('.leaderboard-table tbody');
    if (!tbody) return;
    
    console.log("📊 Displaying leaderboard table");
    
    if (leaderboard.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #bdc3c7; margin-bottom: 10px;"></i><br>
                    <strong>No data yet</strong><br>
                    <small>Complete quizzes to appear on the leaderboard!</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = leaderboard.map(player => `
        <tr class="${currentUser && player.id === currentUser.id ? 'current-user' : ''}">
            <td><strong>#${player.rank}</strong></td>
            <td>
                <div class="player-info">
                    ${player.profile_image 
                        ? `<img src="${player.profile_image}" alt="${player.full_name}" class="player-avatar">` 
                        : `<i class="fas fa-user-circle player-avatar-icon"></i>`
                    }
                    <div>
                        <strong>${player.full_name || player.username}</strong>
                        ${player.badges.length > 0 ? `<div class="badges">${player.badges.join(' ')}</div>` : ''}
                    </div>
                </div>
            </td>
            <td><strong>${player.total_score}</strong></td>
            <td>${player.quizzes_taken}</td>
            <td><span class="accuracy">${player.avg_accuracy}%</span></td>
        </tr>
    `).join('');
}

// ==========================================================
// Display User Position
// ==========================================================

function displayUserPosition(position) {
    const userPositionDiv = document.querySelector('.user-position');
    if (!userPositionDiv) return;
    
    console.log("👤 Displaying user position:", position);
    
    userPositionDiv.innerHTML = `
        <div class="user-position-card">
            <h3>Your Position</h3>
            <div class="position-details">
                <div class="position-rank">
                    <span class="rank-number">#${position.rank}</span>
                    <span class="rank-label">Rank</span>
                </div>
                <div class="position-stats">
                    <div class="stat">
                        <strong>${position.total_score}</strong>
                        <span>Points</span>
                    </div>
                    <div class="stat">
                        <strong>${position.quizzes_taken}</strong>
                        <span>Quizzes</span>
                    </div>
                    <div class="stat">
                        <strong>${position.avg_accuracy}%</strong>
                        <span>Accuracy</span>
                    </div>
                </div>
            </div>
            ${position.badges.length > 0 ? `<div class="user-badges">${position.badges.join(' ')}</div>` : ''}
        </div>
    `;
    
    userPositionDiv.style.display = 'block';
}

// ==========================================================
// Update Stats
// ==========================================================

function updateStats(totalPlayers) {
    const statsEl = document.querySelector('.leaderboard-stats');
    if (statsEl) {
        statsEl.textContent = `${totalPlayers} players on the leaderboard`;
    }
}

// ==========================================================
// Setup Filter Buttons
// ==========================================================

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked button
            btn.classList.add('active');
            
            // Update filter
            currentFilter = btn.dataset.filter;
            console.log("🔄 Filter changed to:", currentFilter);
            
            // Reload leaderboard
            loadLeaderboard();
        });
    });
}

console.log("✅ Leaderboard.js ready");