
// ==========================================
// UNITRUST AUTHENTICATION
// ==========================================

const SESSION_KEY = "unitrust_session";


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    try {

        return JSON.parse(localStorage.getItem(SESSION_KEY));

    } catch (error) {

        return null;

    }

}


// ==========================================
// PAGE ACCESS PERMISSIONS
// ==========================================

const pagePermissions = {

    "dashboard.html": ["public", "department", "auditor", "admin"],

    "request.html": ["department", "admin"],

    "auditor.html": ["auditor", "admin"],

    "approval.html": ["admin"],

    "tracking.html": ["public", "department", "auditor", "admin"],

    "ledger.html": ["public", "department", "auditor", "admin"]

};


// ==========================================
// ROLE-BASED DASHBOARD
// ==========================================

function getDashboardForRole(role) {

    const destinations = {

        department: "request.html",

        auditor: "auditor.html",

        admin: "approval.html"

    };

    return destinations[role] || "index.html";

}


// ==========================================
// CHECK PAGE AUTHORIZATION
// ==========================================

function protectPage() {

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    const user = getCurrentUser();


    // Public pages that do not require login
    const publicPages = [

        "index.html",
        "dashboard.html",
        "tracking.html",
        "ledger.html"

    ];


    // Allow public access to public pages
    if (publicPages.includes(currentPage) && !user) {

        return;

    }


    // Require login for staff-only pages
    if (!user || !user.role) {

        window.location.href = "login.html";

        return;

    }


    // Check if the user's role is authorized
    const allowedRoles = pagePermissions[currentPage];


    if (allowedRoles && !allowedRoles.includes(user.role)) {

        alert("Access Denied! You are not authorized to access this page.");

        window.location.href = getDashboardForRole(user.role);

        return;

    }


    // Update sidebar after authorization
    hideUnauthorizedLinks(user);

    addSidebarAccount(user);

    updateRoleLabel(user);

}


// ==========================================
// UPDATE ROLE LABELS FOR SIGNED-IN USERS
// ==========================================

function updateRoleLabel(user) {

    const roleBadge = document.querySelector(".topbar .pill");

    if (roleBadge && roleBadge.textContent.toLowerCase().includes("public")) {
        roleBadge.textContent = formatRole(user.role);
    }

    const navLabel = document.querySelector(".sidebar .nav-label");

    if (navLabel && user.role === "admin") {
        navLabel.textContent = "Administrator Portal";
    }

}


// ==========================================
// HIDE UNAUTHORIZED SIDEBAR LINKS
// ==========================================

function hideUnauthorizedLinks(user) {

    document.querySelectorAll(".sidebar a[href]").forEach(function(link) {

        const page = link.getAttribute("href")
            .split("/")
            .pop()
            .toLowerCase();

        const allowedRoles = pagePermissions[page];

        if (allowedRoles && !allowedRoles.includes(user.role)) {

            link.style.display = "none";

        }

    });

}


// ==========================================
// ADD USER INFORMATION TO SIDEBAR
// ==========================================

function addSidebarAccount(user) {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {

        return;

    }


    // Prevent duplicate account sections
    if (document.getElementById("sidebar-account")) {

        return;

    }


    const accountSection = document.createElement("div");

    accountSection.id = "sidebar-account";

    accountSection.className = "sidebar-account";


    accountSection.innerHTML = `

        <div class="account-information">

            <div class="account-avatar">
                ${user.name.charAt(0).toUpperCase()}
            </div>

            <div class="account-details">

                <strong>${user.name}</strong>

                <span>${formatRole(user.role)}</span>

            </div>

        </div>


        <button type="button" class="sidebar-signout" id="signout-button">

            <span>↪</span>

            Sign Out

        </button>

    `;


    sidebar.appendChild(accountSection);


    document.getElementById("signout-button")
        .addEventListener("click", signOut);

}


// ==========================================
// FORMAT USER ROLE
// ==========================================

function formatRole(role) {

    const roles = {

        department: "Department Officer",

        auditor: "Auditor",

        admin: "Administrator"

    };

    return roles[role] || "User";

}


// ==========================================
// SIGN OUT
// ==========================================

function signOut() {

    const confirmation = confirm("Are you sure you want to sign out?");

    if (!confirmation) {

        return;

    }

    localStorage.removeItem(SESSION_KEY);

    window.location.href = "index.html";

}


// ==========================================
// SIDEBAR ACCOUNT STYLING
// ==========================================

const authStyles = document.createElement("style");

authStyles.textContent = `

    .sidebar {
        display: flex;
        flex-direction: column;
    }

    .sidebar-account {
        margin-top: auto;
        padding: 18px 15px 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
    }

    .account-information {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }

    .account-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #d4eee2;
        color: #123e33;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        flex-shrink: 0;
    }

    .account-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .account-details strong {
        color: white;
        font-size: 12px;
        overflow-wrap: anywhere;
    }

    .account-details span {
        color: #b8d4c8;
        font-size: 10px;
    }

    .sidebar-signout {
        width: 100%;
        padding: 11px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 7px;
        background: transparent;
        color: white;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: 0.2s;
    }

    .sidebar-signout:hover {
        background: rgba(255, 255, 255, 0.12);
    }

    .sidebar-signout span {
        font-size: 17px;
    }

`;

document.head.appendChild(authStyles);


// ==========================================
// RUN AUTHORIZATION CHECK
// ==========================================

document.addEventListener("DOMContentLoaded", protectPage);
