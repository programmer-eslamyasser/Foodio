/* ========================================================================== */
/* FILE: assets/js/auth.js                                                    */
/* DESC: Secure Auth + Form Validation + Integrated Forgot Password           */
/* ========================================================================== */

'use strict';

/* --- SECURE HASHING --- */
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt = null) {
    if (!salt) salt = generateSalt();
    const data = new TextEncoder().encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${salt}:${hashHex}`;
}

async function verifyPassword(password, storedHash) {
    try {
        const [salt, originalHash] = storedHash.split(':');
        if (!salt || !originalHash) return false;
        const hashedPassword = await hashPassword(password, salt);
        return constantTimeCompare(originalHash, hashedPassword.split(':')[1]);
    } catch { return false; }
}

function constantTimeCompare(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
}

/* --- UI HELPERS --- */
function togglePasswordField(inputId) {
    const input = document.getElementById(inputId);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function showGlobalAlert(message, isError = true) {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = isError ? 'alert alert-error' : 'alert alert-success';
        alertBox.classList.remove('hidden');
    }
}

function hideGlobalAlert() {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) alertBox.classList.add('hidden');
}

function saveSessionAndRedirect(name, email, role) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', name);
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('userRole', role);
    showGlobalAlert('Success! Redirecting...', false);
    setTimeout(() => redirectByRole(role), 1000);
}

/* ========================================================================== */
/* DOM READY - FORM LOGIC                                                     */
/* ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    /* --- LOGIN PAGE & INTEGRATED FORGOT PASSWORD --- */
    const loginForm = document.getElementById('loginForm');
    const verifyEmailForm = document.getElementById('verifyEmailForm');
    const newPasswordForm = document.getElementById('newPasswordForm');

    if (loginForm) {
        // --- 1. View Toggling Logic ---
        const pageTitle = document.getElementById('page-title');
        const pageDesc = document.getElementById('page-desc');
        const showForgotBtn = document.getElementById('showForgotBtn');
        const backToLoginBtns = document.querySelectorAll('.back-to-login');

        if (showForgotBtn) {
            showForgotBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hideGlobalAlert();
                loginForm.classList.add('hidden');
                verifyEmailForm.classList.remove('hidden');
                pageTitle.textContent = "Reset Password";
                pageDesc.textContent = "Enter your email to verify account";
            });
        }

        backToLoginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                hideGlobalAlert();
                verifyEmailForm.classList.add('hidden');
                newPasswordForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                pageTitle.textContent = "Welcome back";
                pageDesc.textContent = "Sign in to your account";
            });
        });

        // --- 2. Login Logic ---
        ['email', 'password'].forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => Utils.clearFieldError(id, id+'-err'));
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            hideGlobalAlert();
            let isValid = true;
            if (!email) { Utils.showFieldError('email', 'email-err', 'Email is required'); isValid = false; }
            if (!password) { Utils.showFieldError('password', 'password-err', 'Password is required'); isValid = false; }
            if (!isValid) return;

            const submitBtn = document.getElementById('loginBtn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            try {
                const statics = window.AUTH_CONFIG?.STATIC_PASSWORDS || {};
                if (email === "admin@foodio.com" && password === statics.ADMIN) { saveSessionAndRedirect('Admin', email, 'admin'); return; }
                if (email === "resto@foodio.com" && password === statics.RESTAURANT) { saveSessionAndRedirect('Restaurant', email, 'restaurant'); return; }
                if (email === "delivery@foodio.com" && password === statics.DELIVERY) { saveSessionAndRedirect('Delivery', email, 'delivery'); return; }

                const users = JSON.parse(localStorage.getItem('foodio_users') || '[]');
                const user = users.find(u => u.email === email);
                if (!user || !(await verifyPassword(password, user.password))) {
                    showGlobalAlert('Invalid email or password', true);
                } else {
                    saveSessionAndRedirect(user.name, user.email, user.role);
                }
            } catch (error) {
                showGlobalAlert('An error occurred. Please try again.', true);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // --- 3. Forgot Password Logic ---
        let verifiedEmail = "";
        
        ['resetEmail', 'newPassword', 'confirmNewPassword'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => Utils.clearFieldError(id, id+'-err'));
        });

        if (verifyEmailForm) {
            verifyEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('resetEmail').value.trim();
                hideGlobalAlert();
                if (!email || !Utils.isValidEmail(email)) { Utils.showFieldError('resetEmail', 'resetEmail-err', 'Invalid email'); return; }
                
                const users = JSON.parse(localStorage.getItem('foodio_users') || '[]');
                if (!users.some(u => u.email === email)) { 
                    Utils.showFieldError('resetEmail', 'resetEmail-err', 'Account not found'); 
                    return; 
                }
                
                verifiedEmail = email;
                verifyEmailForm.classList.add('hidden');
                newPasswordForm.classList.remove('hidden');
                pageDesc.textContent = "Create a new strong password";
                showGlobalAlert('Account found!', false);
            });
        }

        if (newPasswordForm) {
            newPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const password = document.getElementById('newPassword').value;
                const confirm = document.getElementById('confirmNewPassword').value;
                hideGlobalAlert();
                
                let isValid = true;
                if (!password || !Utils.isStrongPassword(password)) { Utils.showFieldError('newPassword', 'newPass-err', 'Min 8 chars, 1 uppercase, 1 number, 1 symbol'); isValid = false; }
                if (!confirm || password !== confirm) { Utils.showFieldError('confirmNewPassword', 'confirmNewPass-err', 'Passwords do not match'); isValid = false; }
                if (!isValid) return;

                const submitBtn = document.getElementById('resetBtn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Updating...';
                submitBtn.disabled = true;

                try {
                    let users = JSON.parse(localStorage.getItem('foodio_users') || '[]');
                    const idx = users.findIndex(u => u.email === verifiedEmail);
                    if (idx !== -1) {
                        users[idx].password = await hashPassword(password);
                        localStorage.setItem('foodio_users', JSON.stringify(users));
                        showGlobalAlert('Password updated! Redirecting...', false);
                        setTimeout(() => window.location.reload(), 2000); // Reload resets back to login view
                    }
                } catch (error) { 
                    showGlobalAlert('Error.', true); 
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    /* --- REGISTER PAGE --- */
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const fields = ['username', 'regEmail', 'phone', 'regPassword', 'confirmPassword'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => Utils.clearFieldError(id, id === 'username' ? 'name-err' : id === 'regEmail' ? 'email-err' : id === 'phone' ? 'phone-err' : id === 'regPassword' ? 'pass-err' : 'confirm-err'));
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('confirmPassword').value;

            hideGlobalAlert();
            let isFormValid = true;

            if (!username) { Utils.showFieldError('username', 'name-err', 'Full Name is required'); isFormValid = false; }
            if (!email) { Utils.showFieldError('regEmail', 'email-err', 'Email is required'); isFormValid = false; } 
            else if (!Utils.isValidEmail(email)) { Utils.showFieldError('regEmail', 'email-err', 'Invalid format'); isFormValid = false; }
            if (!phone) { Utils.showFieldError('phone', 'phone-err', 'Phone is required'); isFormValid = false; } 
            else if (!Utils.isValidPhone(phone)) { Utils.showFieldError('phone', 'phone-err', 'Invalid phone'); isFormValid = false; }
            if (!password) { Utils.showFieldError('regPassword', 'pass-err', 'Password is required'); isFormValid = false; } 
            else if (!Utils.isStrongPassword(password)) { Utils.showFieldError('regPassword', 'pass-err', 'Weak password'); isFormValid = false; }
            if (!confirm) { Utils.showFieldError('confirmPassword', 'confirm-err', 'Confirm password'); isFormValid = false; } 
            else if (password !== confirm) { Utils.showFieldError('confirmPassword', 'confirm-err', 'No match'); isFormValid = false; }

            if (!isFormValid) return;

            const users = JSON.parse(localStorage.getItem('foodio_users') || '[]');
            if (users.find(u => u.email === email)) {
                Utils.showFieldError('regEmail', 'email-err', 'Email already registered');
                return;
            }

            const submitBtn = document.getElementById('registerBtn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating...';
            submitBtn.disabled = true;

            try {
                const hashedPassword = await hashPassword(password);
                users.push({ name: username, email: email, phone: phone, password: hashedPassword, role: 'customer', createdAt: new Date().toISOString() });
                localStorage.setItem('foodio_users', JSON.stringify(users));
                showGlobalAlert('Account created! Redirecting...', false);
                registerForm.reset();
                setTimeout(() => window.location.href = 'login.html', 2000);
            } catch (error) {
                showGlobalAlert('An error occurred.', true);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});