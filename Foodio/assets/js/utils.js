'use strict';


/* =========================
   VALIDATION UTILITIES
========================= */
const Utils = {

    // Validate email format
    isValidEmail: (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

    // Validate phone number (supports +, spaces, - and parentheses)
    isValidPhone: (phone) =>
        /^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-()]/g, '')),

    // Check strong password rules
    isStrongPassword: (pw) => {
        return pw.length >= 8 &&
            /[A-Z]/.test(pw) &&
            /[a-z]/.test(pw) &&
            /[0-9]/.test(pw) &&
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
    },

    // Show error state for input field
    showFieldError: (inputId, errId, msg) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errId);

        if (input) {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');

            // Restart shake animation
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }

        if (errorSpan) {
            errorSpan.textContent = msg;
        }
    },

    // Clear error state for input field
    clearFieldError: (inputId, errId) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errId);

        if (input) {
            input.classList.remove('is-invalid');

            if (input.value.trim() !== '') {
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
            }
        }

        if (errorSpan) {
            errorSpan.textContent = '';
        }
    }
};


/* =========================
   AUTH CONFIGURATION
========================= */
window.AUTH_CONFIG = {
    STATIC_PASSWORDS: {
        ADMIN: "ADMIN_PASSWORD",
        RESTAURANT: "RESTAURANT_PASSWORD",
        DELIVERY: "DELIVERY_PASSWORD"
    }
};


/* =========================
   SESSION MANAGEMENT
========================= */

// Clear all user session data
function clearSession() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserEmail');
}


/* =========================
   AUTH GUARDS
========================= */

// Check if user is authenticated
function checkAuth() {
    if (
        localStorage.getItem('isLoggedIn') !== 'true' ||
        !localStorage.getItem('currentUser')
    ) {
        clearSession();
        window.location.href = 'login.html';
    }
}

// Role-based access control
function requireRole(requiredRole) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    if (localStorage.getItem('userRole') !== requiredRole) {
        alert('Access denied');
        redirectByRole(localStorage.getItem('userRole'));
    }
}


/* =========================
   ROUTING SYSTEM
========================= */

// Redirect user based on role
function redirectByRole(role) {
    const routes = {
        'admin': 'admin-dashboard.html',
        'restaurant': 'restaurant-dashboard.html',
        'delivery': 'delivery-dashboard.html',
        'customer': 'user-dashboard.html'
    };

    window.location.href = routes[role] || 'user-dashboard.html';
}


/* =========================
   AUTH ACTIONS
========================= */

// Logout user and clear session
function logout() {
    clearSession();
    window.location.href = 'login.html';
}