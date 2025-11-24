// Complete app.js with all functions
const API_BASE = 'api';

// =========================
// AUTH FUNCTIONS
// =========================

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth.php?action=check`);
        const data = await response.json();
        return data.loggedIn ? data.user : null;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth.php?action=logout`, { method: 'POST' });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

async function requireAuth() {
    const user = await checkAuth();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

async function requireAdmin() {
    const user = await requireAuth();
    if (!user || user.role !== 'admin') {
        window.location.href = 'navody.html';
        return null;
    }
    return user;
}

// =========================
// UTILITY FUNCTIONS
// =========================

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('sk-SK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleString('sk-SK');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =========================
// SIDEBAR NAVIGATION
// =========================

function createSidebar(user, currentPage = '') {
    const navItems = [
        { href: 'navody.html', icon: '📚', label: 'Návody', page: 'navody' },
    ];

    if (user.role === 'admin') {
        navItems.push(
            { href: 'admin/index.html', icon: '📊', label: 'Dashboard', page: 'admin' },
            { href: 'admin/users.html', icon: '👥', label: 'Používatelia', page: 'users' },
            { href: 'admin/feedback.html', icon: '💬', label: 'Pripomienky', page: 'feedback' }
        );
    }

    return `
        <div class="w-80 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-40">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="font-orbitron text-2xl text-chicho-red font-bold">CHICHO</h1>
                        <p class="text-sm text-gray-600 mt-1 font-inter">Výrobný a školiaci portál</p>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="px-4 py-4 space-y-2">
                ${navItems.map(item => `
                    <a href="${item.href}" class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${currentPage === item.page
            ? 'bg-red-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }">
                        <span class="text-xl">${item.icon}</span>
                        <span class="font-inter font-medium">${item.label}</span>
                    </a>
                `).join('')}
            </nav>

            <!-- Spacer -->
            <div class="flex-1"></div>

            <!-- User Info -->
            <div class="px-4 py-4 border-t border-gray-200">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-lg">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 font-inter truncate">${escapeHtml(user.name)}</p>
                            <p class="text-xs text-gray-500 font-inter">
                                ${user.role === 'admin' ? 'Administrátor' : 'Pracovník'}
                            </p>
                        </div>
                    </div>
                    <button onclick="logout()" class="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Odhlásiť sa">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
                <p class="text-xs text-gray-500 font-inter text-center">
                    © 2025 <span class="chicho-text">CHICHO</span> s.r.o.
                </p>
            </div>
        </div>
    `;
}

// =========================
// MOBILE HEADER & MENU
// =========================

function createMobileHeader(user) {
    return `
        <div class="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div class="flex items-center justify-between">
                <h1 class="font-orbitron text-xl text-chicho-red font-bold">CHICHO</h1>
                <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-gray-900 truncate max-w-[120px]">${escapeHtml(user.name)}</span>
                    <button onclick="toggleMobileMenu()" class="text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu Overlay -->
        <div id="mobileMenuOverlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50" onclick="toggleMobileMenu()"></div>
        
        <!-- Mobile Menu -->
        <div id="mobileMenuSidebar" class="hidden lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300">
            <div class="flex flex-col h-full">
                <div class="flex items-center justify-between p-6 border-b">
                    <h1 class="font-orbitron text-2xl text-chicho-red font-bold">CHICHO</h1>
                    <button onclick="toggleMobileMenu()" class="text-gray-600 p-2 hover:bg-gray-100 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                ${createSidebar(user, window.layoutPage || '').replace('fixed left-0 top-0 z-40', '').replace('w-80 bg-white border-r border-gray-200 h-screen flex flex-col', 'flex-1')}
            </div>
        </div>
    `;
}

function toggleMobile Menu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const sidebar = document.getElementById('mobileMenuSidebar');

    if (overlay && sidebar) {
        overlay.classList.toggle('hidden');
        sidebar.classList.toggle('hidden');
    }
}

// =========================
// LOADING & ERROR STATES
// =========================

function showLoading(elementId, message = 'Načítavam...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
    }
}

function showError(elementId, message = 'Chyba pri načítavaní dát') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <svg class="w-16 h-16 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-gray-600 font-medium">${message}</p>
            </div>
        `;
    }
}

function showEmpty(elementId, message = 'Žiadne záznamy') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="text-gray-500">${message}</p>
            </div>
        `;
    }
}

// =========================
// TOAST NOTIFICATIONS
// =========================

function showToast(message, type = 'success') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-[slideInRight_0.3s_ease-out]`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================
// SEARCH & FILTER
// =========================

function filterTable(searchValue, tableBodyId, columnIndex = 0) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;

    const rows = tbody.getElementsByTagName('tr');
    const searchLower = searchValue.toLowerCase();

    for (let row of rows) {
        const cell = row.getElementsByTagName('td')[columnIndex];
        if (cell) {
            const text = cell.textContent || cell.innerText;
            row.style.display = text.toLowerCase().includes(searchLower) ? '' : 'none';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add slide animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
