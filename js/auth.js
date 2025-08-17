// Initialize users array with fallback to empty array
let users = [];
try {
    users = JSON.parse(localStorage.getItem('users')) || [];
} catch (e) {
    console.error("Error reading from localStorage:", e);
    users = [];
}

// DOM elements
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

// Regular expressions for validation
const nameRegex = /^[a-zA-Z\s]{2,50}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Safe localStorage functions with error handling
function getLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error("LocalStorage access denied:", e);
        return null;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error("LocalStorage access denied:", e);
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error("LocalStorage access denied:", e);
    }
}

// Authentication check with file protocol support
function checkAuth() {
    const token = getLocalStorage('authToken');
    const isFileProtocol = window.location.protocol === 'file:';
    const authPages = ['login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (!token && !authPages.includes(currentPage)) {
        redirect(isFileProtocol ? 'login.html' : '/login.html');
    } else if (token && authPages.includes(currentPage)) {
        redirect(isFileProtocol ? 'index.html' : '/index.html');
    }
}

// Safe redirect function
function redirect(path) {
    try {
        window.location.href = path;
    } catch (e) {
        console.error("Redirect failed:", e);
    }
}

// Registration form handling
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('register-name').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        // Clear previous errors
        document.getElementById('name-error').textContent = '';
        document.getElementById('username-error').textContent = '';
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';
        document.getElementById('confirm-error').textContent = '';
        document.getElementById('register-error').textContent = '';
        
        // Validation
        let isValid = true;
        
        if (!nameRegex.test(name)) {
            document.getElementById('name-error').textContent = 'Please enter a valid name (2-50 characters, letters only)';
            isValid = false;
        }
        
        if (!usernameRegex.test(username)) {
            document.getElementById('username-error').textContent = 'Username must be 3-20 characters (letters, numbers, underscores)';
            isValid = false;
        } else if (users.some(user => user.username === username)) {
            document.getElementById('username-error').textContent = 'Username already taken';
            isValid = false;
        }
        
        if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        } else if (users.some(user => user.email === email)) {
            document.getElementById('email-error').textContent = 'Email already registered';
            isValid = false;
        }
        
        if (!passwordRegex.test(password)) {
            document.getElementById('password-error').textContent = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character';
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirm-error').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        // If validation passes
        if (isValid) {
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
                name,
                username,
                email,
                password,
                address: {
                    street: '',
                    suite: '',
                    city: '',
                    zipcode: '',
                    geo: {
                        lat: '',
                        lng: ''
                    }
                }
            };
            
            users.push(newUser);
            setLocalStorage('users', JSON.stringify(users));
            setLocalStorage('authToken', JSON.stringify({ userId: newUser.id }));
            setLocalStorage('currentUser', JSON.stringify(newUser));
            
            redirect('index.html');
        } else {
            document.getElementById('register-error').textContent = 'Please fix the errors above';
        }
    });
}

// Login form handling
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Clear errors
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';
        
        // Validation
        let isValid = true;
        
        if (!emailRegex.test(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            isValid = false;
        }
        
        if (password.length < 8) {
            document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
            isValid = false;
        }
        
        // If validation passes
        if (isValid) {
            const user = users.find(user => user.email === email);
            
            if (!user) {
                document.getElementById('email-error').textContent = 'Email not registered';
                return;
            }
            
            if (user.password !== password) {
                document.getElementById('password-error').textContent = 'Incorrect password';
                return;
            }
            
            setLocalStorage('authToken', JSON.stringify({ userId: user.id }));
            setLocalStorage('currentUser', JSON.stringify(user));
            
            redirect('index.html');
        }
    });
}

// Logout function
function logout() {
    removeLocalStorage('authToken');
    removeLocalStorage('currentUser');
    redirect('login.html');
}

// Logout button handlers
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
        mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Initialize auth check when DOM is loaded
document.addEventListener('DOMContentLoaded', checkAuth);