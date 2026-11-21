// ==========================================
// UNITRUST SHARED AUTHENTICATION + SIDEBAR
// ==========================================

const SESSION_KEY = "unitrust_session";

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
        return null;
    }
}

const pagePermissions = {
    "dashboard.html": ["public", "department", "auditor", "admin"],
    "ledger.html": ["public", "department", "auditor", "admin"],
    "tracking.html": ["public", "department", "auditor", "admin"],
    "request.html": ["public", "department", "admin"],
    "auditor.html": ["auditor", "admin"],
    "approval.html": ["admin"]
};

const sidebarPages = [
    { page: "dashboard.html", label: "▦  Overview" },
    { page: "ledger.html", label: "◉  Blockchain Ledger" },
    { page: "request.html", label: "+  Department Request" },
    { page: "auditor.html", label: "✓  Auditor Verification" },
    { page: "approval.html", label: "▣  Admin Approval" }
];

function getDashboardForRole(role) {
    const destinations = {
        department: "request.html",
        auditor: "auditor.html",
        admin: "approval.html"
    };
    return destinations[role] || "dashboard.html";
}

function formatRole(role) {
    const roles = {
        public: "Public Viewer",
        department: "Department Officer",
        auditor: "Auditor",
        admin: "Administrator"
    };
    return roles[role] || "Public Viewer";
}

function buildSharedSidebar(user, currentPage) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    let nav = sidebar.querySelector("nav.nav");
    if (!nav) {
        nav = document.createElement("nav");
        nav.className = "nav";
        const brand = sidebar.querySelector(".brand");
        if (brand) brand.insertAdjacentElement("afterend", nav);
        else sidebar.prepend(nav);
    }

    nav.innerHTML = "";

    sidebarPages.forEach(function(item) {
        const allowedRoles = pagePermissions[item.page] || [];
        if (!allowedRoles.includes(user.role)) return;

        const link = document.createElement("a");
        link.href = item.page;
        link.textContent = item.label;
        if (item.page === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
        nav.appendChild(link);

        // Show Track Request only as a nested item while viewing Blockchain Ledger.
        if (item.page === "ledger.html" && currentPage === "ledger.html") {
            const trackingAllowed = (pagePermissions["tracking.html"] || []).includes(user.role);
            if (trackingAllowed) {
                const trackingLink = document.createElement("a");
                trackingLink.href = "tracking.html";
                trackingLink.textContent = "⌕  Track Request";
                trackingLink.className = "nav-subitem";
                nav.appendChild(trackingLink);
            }
        }
    });

    const navLabel = sidebar.querySelector(".nav-label");
    if (navLabel) {
        navLabel.textContent = user.role === "admin"
            ? "Administrator Portal"
            : user.role === "auditor"
                ? "Auditor Portal"
                : user.role === "department"
                    ? "Department Portal"
                    : "Public Portal";
    }

    const oldAccount = document.getElementById("sidebar-account");
    if (oldAccount) oldAccount.remove();

    const displayName = user.name || user.username || "User";
    const account = document.createElement("div");
    account.id = "sidebar-account";
    account.className = "sidebar-account";

    const info = document.createElement("div");
    info.className = "account-information";

    const avatar = document.createElement("div");
    avatar.className = "account-avatar";
    avatar.textContent = displayName.charAt(0).toUpperCase();

    const details = document.createElement("div");
    details.className = "account-details";

    const name = document.createElement("strong");
    name.textContent = displayName;

    const role = document.createElement("span");
    role.textContent = formatRole(user.role);

    details.append(name, role);
    info.append(avatar, details);

    const signout = document.createElement("button");
    signout.type = "button";
    signout.className = "sidebar-signout";
    signout.textContent = "↪  Sign Out";
    signout.addEventListener("click", signOut);

    account.append(info, signout);
    sidebar.appendChild(account);
}

function updateRoleLabel(user) {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    let roleBadge = topbar.querySelector(".pill");
    if (!roleBadge) {
        roleBadge = document.createElement("span");
        roleBadge.className = "pill";
        topbar.appendChild(roleBadge);
    }
    roleBadge.textContent = formatRole(user.role);
}

function protectPage() {
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    const user = getCurrentUser();

    const publicPages = ["index.html", "dashboard.html", "tracking.html", "ledger.html", "request.html"];

    if (publicPages.includes(currentPage) && !user) return;

    if (!user || !user.role) {
        window.location.href = "login.html";
        return;
    }

    const allowedRoles = pagePermissions[currentPage];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        alert("Access Denied! You are not authorized to access this page.");
        window.location.href = getDashboardForRole(user.role);
        return;
    }

    buildSharedSidebar(user, currentPage);
    updateRoleLabel(user);
}

function signOut() {
    if (!confirm("Are you sure you want to sign out?")) return;
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
}

const authStyles = document.createElement("style");
authStyles.textContent = `
    .sidebar { display: flex; flex-direction: column; }
    .sidebar .nav { display: flex; flex-direction: column; }
    .sidebar .nav .nav-subitem {
        margin: 2px 0 8px 25px;
        padding: 9px 12px;
        width: calc(100% - 25px);
        box-sizing: border-box;
        font-size: 12px;
        opacity: .9;
        border-left: 2px solid rgba(255,255,255,.28);
    }
    .sidebar-account {
        margin-top: auto; padding: 18px 15px 12px;
        border-top: 1px solid rgba(255,255,255,.15);
    }
    .account-information {
        display: flex; align-items: center; gap: 10px; margin-bottom: 15px;
    }
    .account-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: #d4eee2; color: #123e33; display: flex;
        align-items: center; justify-content: center;
        font-weight: 800; flex-shrink: 0;
    }
    .account-details { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .account-details strong {
        color: white; font-size: 12px; overflow-wrap: anywhere;
    }
    .account-details span { color: #b8d4c8; font-size: 10px; }
    .sidebar-signout {
        width: 100%; padding: 11px 12px;
        border: 1px solid rgba(255,255,255,.2); border-radius: 7px;
        background: transparent; color: white; text-align: left;
        font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .sidebar-signout:hover { background: rgba(255,255,255,.12); }
`;
document.head.appendChild(authStyles);

document.addEventListener("DOMContentLoaded", protectPage);
