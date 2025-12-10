// Admin Authentication System
class AdminAuth {
    constructor() {
        // Password hash stored here - users can't reverse this to get the actual password
        // Default password: "VoidWalker2025"
        // To change password, use: generatePasswordHash("your-new-password") in console
        this.passwordHash = '39c2e8cfe5881f77bb87dc3ef675ab06b0a916450749f5f55ebc6a8a0ee6cede'; // SHA-256 hash
        this.sessionKey = 'adminAuthenticated';
        this.sessionTimeout = 3600000; // 1 hour in milliseconds
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async authenticate(password) {
        const hash = await this.hashPassword(password);
        if (hash === this.passwordHash) {
            // Store authentication with timestamp
            const authData = {
                authenticated: true,
                timestamp: Date.now()
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(authData));
            return true;
        }
        return false;
    }

    isAuthenticated() {
        const authData = sessionStorage.getItem(this.sessionKey);
        if (!authData) return false;

        try {
            const parsed = JSON.parse(authData);
            const now = Date.now();
            
            // Check if session expired (1 hour)
            if (now - parsed.timestamp > this.sessionTimeout) {
                this.logout();
                return false;
            }
            
            return parsed.authenticated === true;
        } catch (e) {
            return false;
        }
    }

    logout() {
        sessionStorage.removeItem(this.sessionKey);
    }

    // Utility function for generating new password hash (use in browser console)
    async generatePasswordHash(password) {
        const hash = await this.hashPassword(password);
        console.log('Password Hash:', hash);
        console.log('Replace the passwordHash in admin-auth.js with this value');
        return hash;
    }
}

// Initialize admin auth
const adminAuth = new AdminAuth();

// Protect admin page
function protectAdminPage() {
    // Check if on admin page
    if (window.location.pathname.includes('admin.html')) {
        if (!adminAuth.isAuthenticated()) {
            showLoginModal();
        }
    }
}

function showLoginModal() {
    // Hide main content
    const mainContent = document.querySelector('.admin-container');
    if (mainContent) {
        mainContent.style.display = 'none';
    }

    // Create login modal
    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.innerHTML = `
        <div class="login-overlay"></div>
        <div class="login-modal">
            <div class="login-content">
                <h2 class="login-title">Admin Access Required</h2>
                <p class="login-subtitle">Enter your password to access the admin panel</p>
                <form id="adminLoginForm" class="login-form">
                    <div class="form-group">
                        <input type="password" id="adminPassword" placeholder="Enter password" required autofocus>
                    </div>
                    <button type="submit" class="admin-btn primary">Login</button>
                    <div id="loginError" class="login-error" style="display: none;"></div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Handle login form
    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        const errorDiv = document.getElementById('loginError');

        const success = await adminAuth.authenticate(password);
        
        if (success) {
            // Remove modal and show content
            modal.remove();
            if (mainContent) {
                mainContent.style.display = 'block';
            }
        } else {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
            document.getElementById('adminPassword').value = '';
        }
    });
}

// Add logout button to admin nav
function addLogoutButton() {
    if (window.location.pathname.includes('admin.html') && adminAuth.isAuthenticated()) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.className = 'nav-link';
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.cssText = 'background: none; border: none; cursor: pointer; color: var(--fire-orange);';
            logoutBtn.onclick = () => {
                adminAuth.logout();
                location.reload();
            };
            navLinks.appendChild(logoutBtn);
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    protectAdminPage();
    addLogoutButton();
});
