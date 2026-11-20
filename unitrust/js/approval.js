
/* =====================================
   UNITRUST - ADMIN APPROVAL SYSTEM
   CONNECTED TO LOCAL STORAGE
===================================== */

const STORAGE_KEY = "unitrust_requests";

let selectedRequestId = null;


// =====================================
// GET AND SAVE REQUESTS
// =====================================

function getRequests() {

    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
        return [];
    }

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error("Unable to load requests:", error);
        return [];
    }

}


function saveRequests(requests) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(requests)
    );

}


// =====================================
// FORMAT AMOUNT
// =====================================

function formatAmount(amount) {

    return "₱" + Number(amount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// =====================================
// GET VERIFIED REQUESTS
// =====================================

function getVerifiedRequests() {

    const requests = getRequests();

    return requests.filter(function(request) {

        return request.auditorStatus === "Verified";

    });

}


// =====================================
// DISPLAY VERIFIED REQUESTS
// =====================================

function displayRequests() {

    const requests = getVerifiedRequests();

    const queue = document.getElementById("admin-request-queue");

    queue.innerHTML = "";


    // Display message if no verified requests exist
    if (requests.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "No verified requests are currently awaiting or receiving an admin decision.";

        cell.style.textAlign = "center";
        cell.style.padding = "25px";

        row.appendChild(cell);
        queue.appendChild(row);

        return;

    }


    // Create a table row for every verified request
    requests.forEach(function(request) {

        const row = document.createElement("tr");

        row.className = "request-row";

        if (request.id === selectedRequestId) {
            row.classList.add("selected");
        }


        // Request ID
        const idCell = document.createElement("td");

        idCell.textContent = request.id;


        // Department
        const departmentCell = document.createElement("td");

        departmentCell.textContent = request.department || "Not provided";


        // Purpose
        const purposeCell = document.createElement("td");

        purposeCell.textContent = request.project || "Not provided";


        // Amount
        const amountCell = document.createElement("td");

        amountCell.textContent = formatAmount(request.amount);


        // Auditor Status
        const auditorCell = document.createElement("td");

        const auditorStatus = document.createElement("span");

        auditorStatus.className = "status verified";
        auditorStatus.textContent = request.auditorStatus;

        auditorCell.appendChild(auditorStatus);


        // Admin Status
        const adminCell = document.createElement("td");

        const adminStatus = document.createElement("span");

        const currentStatus = request.adminStatus || "Pending";

        adminStatus.className =
            "status admin-status " + currentStatus.toLowerCase();

        adminStatus.textContent = currentStatus;

        adminCell.appendChild(adminStatus);


        // Add cells to row
        row.appendChild(idCell);
        row.appendChild(departmentCell);
        row.appendChild(purposeCell);
        row.appendChild(amountCell);
        row.appendChild(auditorCell);
        row.appendChild(adminCell);


        // Select request when row is clicked
        row.addEventListener("click", function() {

            displayRequest(request.id);

        });


        queue.appendChild(row);

    });

}


// =====================================
// DISPLAY REQUEST DETAILS
// =====================================

function displayRequest(reference) {

    const requests = getRequests();

    const request = requests.find(function(item) {

        return item.id === reference;

    });


    if (!request) {

        alert("Request could not be found.");
        return;

    }


    selectedRequestId = reference;


    // Display request information
    document.getElementById("detail-id").textContent =
        request.id;

    document.getElementById("detail-department").textContent =
        request.department || "Not provided";

    document.getElementById("detail-amount").textContent =
        formatAmount(request.amount);

    document.getElementById("detail-purpose").textContent =
        request.description || request.project || "No description provided.";

    document.getElementById("detail-auditor-status").textContent =
        request.auditorStatus;


    // Display admin status
    const statusElement = document.getElementById("selected-status");

    const status = request.adminStatus || "Pending";

    statusElement.textContent = status;

    statusElement.className =
        "status " + status.toLowerCase().replace(/\s+/g, "-");


    // Display submitted document filenames
    const documentNames = request.documents || [];

    const documentElement = document.getElementById("admin-documents");

    documentElement.textContent =
        documentNames.length > 0
            ? documentNames.join(", ")
            : "No document filenames were recorded.";


    // Restore saved administrator remarks
    document.getElementById("admin-remarks").value =
        request.adminRemarks || "";


    // Enable or disable action buttons
    updateButtonState();


    // Refresh table highlight
    displayRequests();

}


// =====================================
// UPDATE SUMMARY COUNTERS
// =====================================

function updateCounts() {

    const requests = getVerifiedRequests();

    let pending = 0;
    let approved = 0;
    let rejected = 0;


    requests.forEach(function(request) {

        const status = request.adminStatus || "Pending";

        if (status === "Pending") {
            pending++;
        }
        else if (status === "Approved") {
            approved++;
        }
        else if (status === "Rejected") {
            rejected++;
        }

    });


    document.getElementById("pending-count").textContent =
        pending;

    document.getElementById("approved-count").textContent =
        approved;

    document.getElementById("rejected-count").textContent =
        rejected;

}


// =====================================
// ENABLE OR DISABLE BUTTONS
// =====================================

function updateButtonState() {

    const requests = getRequests();

    const request = requests.find(function(item) {

        return item.id === selectedRequestId;

    });


    const isPending =
        request &&
        request.auditorStatus === "Verified" &&
        (request.adminStatus || "Pending") === "Pending";


    document.getElementById("approve-btn").disabled = !isPending;

    document.getElementById("reject-btn").disabled = !isPending;

    document.getElementById("admin-remarks").disabled = !isPending;

}


// =====================================
// SAVE ADMIN REMARKS
// =====================================

document.getElementById("admin-remarks").addEventListener(
    "input",
    function() {

        if (!selectedRequestId) {
            return;
        }

        const requests = getRequests();

        const request = requests.find(function(item) {

            return item.id === selectedRequestId;

        });


        if (!request) {
            return;
        }


        request.adminRemarks = this.value;

        saveRequests(requests);

    }
);


// =====================================
// UPDATE REQUEST STATUS
// =====================================

function updateStatus(newStatus) {

    if (!selectedRequestId) {

        alert("Please select a request first.");
        return;

    }


    const requests = getRequests();

    const request = requests.find(function(item) {

        return item.id === selectedRequestId;

    });


    if (
        !request ||
        request.auditorStatus !== "Verified" ||
        (request.adminStatus || "Pending") !== "Pending"
    ) {

        alert("This request is no longer awaiting admin approval.");
        return;

    }


    // Require remarks when rejecting
    const remarks = document.getElementById("admin-remarks").value.trim();

    if (newStatus === "Rejected" && remarks === "") {

        alert("Please enter a reason for rejecting this request.");

        document.getElementById("admin-remarks").focus();

        return;

    }


    // Update request data
    request.adminStatus = newStatus;
    request.adminRemarks = remarks;

    saveRequests(requests);


    alert(
        "Request " + newStatus.toLowerCase() + " successfully!\n\n" +
        "Reference ID: " + request.id
    );


    // Refresh the page
    displayRequests();
    updateCounts();
    displayRequest(request.id);

}


// =====================================
// APPROVE REQUEST
// =====================================

document.getElementById("approve-btn").addEventListener(
    "click",
    function() {

        if (!selectedRequestId) {
            alert("Please select a request first.");
            return;
        }


        const confirmation = confirm(
            "Are you sure you want to approve " +
            selectedRequestId + "?"
        );


        if (confirmation) {

            updateStatus("Approved");

        }

    }
);


// =====================================
// REJECT REQUEST
// =====================================

document.getElementById("reject-btn").addEventListener(
    "click",
    function() {

        if (!selectedRequestId) {
            alert("Please select a request first.");
            return;
        }


        const confirmation = confirm(
            "Are you sure you want to reject " +
            selectedRequestId + "?"
        );


        if (confirmation) {

            updateStatus("Rejected");

        }

    }
);


// =====================================
// INITIALIZE ADMIN APPROVAL PAGE
// =====================================

function initializeApprovalPage() {

    displayRequests();

    updateCounts();

    document.getElementById("admin-remarks").disabled = true;

}


initializeApprovalPage();
