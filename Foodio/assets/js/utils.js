'use strict';

const Utils = {
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidPhone: (phone) => /^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-()]/g, '')),
    isStrongPassword: (pw) => {
        return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
    },
    showFieldError: (inputId, errId, msg) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errId);
        if (input) {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            input.classList.remove('shake');
            void input.offsetWidth;
            input.classList.add('shake');
        }
        if (errorSpan) errorSpan.textContent = msg;
    },
    clearFieldError: (inputId, errId) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(errId);
        if (input) {
            input.classList.remove('is-invalid');
            if (input.value.trim() !== '') input.classList.add('is-valid');
            else input.classList.remove('is-valid');
        }
        if (errorSpan) errorSpan.textContent = '';
    }
};

/* --- AUTH GUARDS --- */
window.AUTH_CONFIG = {
    STATIC_PASSWORDS: {
        ADMIN: "ADMIN_PASSWORD",
        RESTAURANT: "RESTAURANT_PASSWORD",
        DELIVERY: "DELIVERY_PASSWORD"
    }
};

function clearSession() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserEmail');
}

function checkAuth() {
    if (localStorage.getItem('isLoggedIn') !== 'true' || !localStorage.getItem('currentUser')) {
        clearSession();
        window.location.href = 'login.html'; 
    }
}

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

function redirectByRole(role) {
    const routes = {
        'admin': 'admin-dashboard.html',
        'restaurant': 'restaurant-dashboard.html',
        'delivery': 'delivery-dashboard.html',
        'customer': 'user-dashboard.html' 
    };
    window.location.href = routes[role] || 'user-dashboard.html';
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}