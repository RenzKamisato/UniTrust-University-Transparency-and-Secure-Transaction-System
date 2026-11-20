
/* =================================
   UNITRUST - AUDITOR VERIFICATION
   CONNECTED TO LOCAL STORAGE
================================= */

const STORAGE_KEY = "unitrust_requests";

let selectedRequestId = null;


// =================================
// GET AND SAVE REQUESTS
// =================================

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


// =================================
// DISPLAY VERIFICATION QUEUE
// =================================

function displayRequests() {

    const requests = getRequests();

    const queue = document.getElementById("verification-queue");

    if (!queue) {
        console.error("Verification queue element not found.");
        return;
    }

    // Only show requests awaiting auditor review
    const pendingRequests = requests.filter(function(request) {
        return request.auditorStatus === "Pending";
    });


    // Update counters
    document.getElementById("pending-verification-count").textContent =
        pendingRequests.length;

    document.getElementById("queue-count").textContent =
        pendingRequests.length + " Requests";


    // Clear previous table contents
    queue.innerHTML = "";


    // Display message if there are no pending requests
    if (pendingRequests.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent =
            "No requests are currently waiting for verification.";

        cell.style.textAlign = "center";
        cell.style.padding = "25px";

        row.appendChild(cell);
        queue.appendChild(row);

        return;

    }


    // Create a table row for each request
    pendingRequests.forEach(function(request) {

        const row = document.createElement("tr");


        // Reference ID
        const referenceCell = document.createElement("td");

        referenceCell.className = "reference-id";
        referenceCell.textContent = request.id;


        // Department
        const departmentCell = document.createElement("td");

        departmentCell.textContent = request.department;


        // Project
        const projectCell = document.createElement("td");

        projectCell.textContent = request.project;


        // Amount
        const amountCell = document.createElement("td");

        amountCell.textContent =
            "₱" + Number(request.amount).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });


        // Status
        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className = "status-pending";
        status.textContent = request.auditorStatus;

        statusCell.appendChild(status);


        // Review button
        const actionCell = document.createElement("td");

        const reviewButton = document.createElement("button");

        reviewButton.className = "review-btn";
        reviewButton.textContent = "Review";

        reviewButton.addEventListener("click", function() {
            reviewRequest(request.id);
        });

        actionCell.appendChild(reviewButton);


        // Add cells to row
        row.appendChild(referenceCell);
        row.appendChild(departmentCell);
        row.appendChild(projectCell);
        row.appendChild(amountCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        queue.appendChild(row);

    });

}


// =================================
// SELECT A REQUEST TO REVIEW
// =================================

function reviewRequest(reference) {

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
    document.getElementById("review-reference").textContent =
        request.id;

    document.getElementById("review-department").textContent =
        request.department;

    document.getElementById("review-project").textContent =
        request.project;

    document.getElementById("review-amount").textContent =
        "₱" + Number(request.amount).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });


    // Reset checklist
    document.querySelectorAll(".verify-check").forEach(function(check) {
        check.checked = false;
    });


    // Display submitted document names
    const documentNames = request.documents || [];

    document.getElementById("review-message").textContent =
        documentNames.length > 0
            ? "Submitted files: " + documentNames.join(", ")
            : "No document filenames were recorded.";


    // Scroll to review section
    document.getElementById("review-panel").scrollIntoView({
        behavior: "smooth"
    });

}


// =================================
// MARK REQUEST AS VERIFIED
// =================================

function verifyRequest() {

    if (!selectedRequestId) {
        alert("Please select a request first.");
        return;
    }


    const checks = document.querySelectorAll(".verify-check");

    const allChecked = Array.from(checks).every(function(check) {
        return check.checked;
    });


    if (!allChecked) {
        alert("Please complete all verification checklist items.");
        return;
    }


    const requests = getRequests();

    const request = requests.find(function(item) {
        return item.id === selectedRequestId;
    });


    if (!request || request.auditorStatus !== "Pending") {
        alert("This request is no longer awaiting verification.");
        return;
    }


    // Update request status
    request.auditorStatus = "Verified";
    request.adminStatus = "Pending";

    saveRequests(requests);


    document.getElementById("review-message").textContent =
        request.id + " has been verified and forwarded for admin approval.";


    alert(
        "Verification successful!\n\n" +
        "Reference: " + request.id +
        "\n\nThe request is now waiting for admin approval."
    );


    // Refresh queue
    selectedRequestId = null;

    displayRequests();

}


// =================================
// RETURN REQUEST FOR REVISION
// =================================

function requestRevision() {

    if (!selectedRequestId) {
        alert("Please select a request first.");
        return;
    }


    const requests = getRequests();

    const request = requests.find(function(item) {
        return item.id === selectedRequestId;
    });


    if (!request || request.auditorStatus !== "Pending") {
        alert("This request is no longer awaiting verification.");
        return;
    }


    const reason = prompt(
        "Enter the reason for returning this request:"
    );


    if (reason === null) {
        return;
    }

    if (reason.trim() === "") {
        alert("Please provide a reason for revision.");
        return;
    }


    // Update request status
    request.auditorStatus = "Revision Required";
    request.adminStatus = "Returned for Revision";
    request.adminRemarks = reason.trim();

    saveRequests(requests);


    document.getElementById("review-message").textContent =
        request.id + " has been returned for revision.";


    alert(
        "Request returned for revision.\n\n" +
        "Reference: " + request.id +
        "\nReason: " + reason
    );


    // Refresh queue
    selectedRequestId = null;

    displayRequests();

}


// =================================
// BUTTON EVENTS
// =================================

document.querySelector(".verify-btn").addEventListener(
    "click",
    verifyRequest
);

document.querySelector(".revision-btn").addEventListener(
    "click",
    requestRevision
);


// =================================
// INITIALIZE PAGE
// =================================

displayRequests();
