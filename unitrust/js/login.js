
// ==========================================
// UNITRUST STAFF ACCOUNTS
// ==========================================

const staffAccounts = [

    {
        username: "department",
        password: "dept123",
        name: "Department Officer",
        role: "department"
    },

    {
        username: "auditor",
        password: "audit123",
        name: "Auditor",
        role: "auditor"
    },

    {
        username: "admin",
        password: "admin123",
        name: "System Administrator",
        role: "admin"
    }

];


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;


    // Find matching account
    const account = staffAccounts.find(function(user) {

        return user.username === username &&
               user.password === password;

    });


    // Check if account exists
    if (!account) {

        loginError.textContent = "Invalid username or password.";

        return;

    }


    // Create user session
    const session = {

        username: account.username,
        name: account.name,
        role: account.role,
        loginTime: new Date().toISOString()

    };


    // Save session in browser
    localStorage.setItem(
        "unitrust_session",
        JSON.stringify(session)
    );


    // Redirect based on assigned role
    const destinations = {

        department: "request.html",
        auditor: "auditor.html",
        admin: "approval.html"

    };


    window.location.href = destinations[account.role];

});


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const eyeIcon = document.getElementById("eye-icon");

togglePassword.addEventListener("click", function() {

    if (passwordInput.type === "password") {

        // Show password
        passwordInput.type = "text";

        togglePassword.setAttribute("aria-label", "Hide password");

        eyeIcon.innerHTML = `
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M3 3l18 18"/>
        `;

    } else {

        // Hide password
        passwordInput.type = "password";

        togglePassword.setAttribute("aria-label", "Show password");

        eyeIcon.innerHTML = `
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
        `;

    }

});
