
const STORAGE_KEY = "unitrust_requests";

// Retrieve saved requests
function getRequests() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Unable to retrieve requests:", error);
        return [];
    }
}

// Format Philippine peso amount
function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

// Determine the current request status
function getCurrentStatus(request) {

    if (request.auditorStatus === "Revision Required") {
        return "Returned for Revision";
    }

    if (request.auditorStatus !== "Verified") {
        return "Pending Auditor Verification";
    }

    if (request.adminStatus === "Approved") {
        return "Approved";
    }

    if (request.adminStatus === "Rejected") {
        return "Rejected";
    }

    return "Pending Admin Approval";
}

// Update the appearance of a progress step
function setStep(stepId, state) {

    const step = document.getElementById(stepId);

    step.classList.remove("completed", "current", "issue");

    if (state) {
        step.classList.add(state);
    }
}

// Display request information
function displayTrackingResult(request) {

    document.getElementById("tracking-result").hidden = false;

    // Request details
    document.getElementById("result-reference").textContent = request.id;
    document.getElementById("result-project").textContent =
        request.project || "No project name";

    document.getElementById("result-department").textContent =
        request.department || "Not provided";

    document.getElementById("result-project-detail").textContent =
        request.project || "Not provided";

    document.getElementById("result-category").textContent =
        request.category || "Not provided";

    document.getElementById("result-amount").textContent =
        formatAmount(request.amount);

    document.getElementById("result-date").textContent =
        request.createdAt
            ? new Date(request.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })
            : "Not available";

    // Overall status
    const currentStatus = getCurrentStatus(request);

    const statusElement = document.getElementById("current-status");

    statusElement.textContent = currentStatus;
    statusElement.className = "";

    if (currentStatus === "Approved") {
        statusElement.classList.add("status-approved");
    } else if (currentStatus === "Rejected") {
        statusElement.classList.add("status-rejected");
    } else if (currentStatus === "Returned for Revision") {
        statusElement.classList.add("status-revision");
    }

    // STEP 1: Submission
    setStep("step-submitted", "completed");

    // STEP 2: Auditor verification
    const auditorStatus = request.auditorStatus || "Pending";

    document.getElementById("auditor-status").textContent = auditorStatus;

    const auditorDescription =
        document.getElementById("auditor-description");

    if (auditorStatus === "Verified") {

        setStep("step-auditor", "completed");

        auditorDescription.textContent =
            "The auditor has successfully verified your request.";

    } else if (auditorStatus === "Revision Required") {

        setStep("step-auditor", "issue");

        auditorDescription.textContent =
            "The auditor has requested revisions to your submission.";

    } else {

        setStep("step-auditor", "current");

        auditorDescription.textContent =
            "Your request is waiting for auditor verification.";
    }

    // STEP 3: Administrator approval
    const adminStatus = request.adminStatus || "Waiting for Verification";

    document.getElementById("admin-status").textContent = adminStatus;

    const adminDescription =
        document.getElementById("admin-description");

    if (adminStatus === "Approved") {

        setStep("step-admin", "completed");

        adminDescription.textContent =
            "The administrator has approved your request.";

    } else if (adminStatus === "Rejected") {

        setStep("step-admin", "issue");

        adminDescription.textContent =
            "The administrator has rejected your request.";

    } else if (adminStatus === "Returned for Revision") {

        setStep("step-admin", "issue");

        adminDescription.textContent =
            "Your request was returned for revision.";

    } else if (adminStatus === "Pending") {

        setStep("step-admin", "current");

        adminDescription.textContent =
            "Your request is waiting for the administrator's decision.";

    } else {

        setStep("step-admin", "");

        adminDescription.textContent =
            "Waiting for the auditor's verification before admin review.";
    }

    // STEP 4: Final result
    const finalStatus = document.getElementById("final-status");

    const finalDescription =
        document.getElementById("final-description");

    finalStatus.textContent = currentStatus;

    if (currentStatus === "Approved") {

        setStep("step-completed", "completed");

        finalDescription.textContent =
            "Your request has been successfully approved.";

    } else if (currentStatus === "Rejected") {

        setStep("step-completed", "issue");

        finalDescription.textContent =
            "Your request has been rejected by the administrator.";

    } else if (currentStatus === "Returned for Revision") {

        setStep("step-completed", "issue");

        finalDescription.textContent =
            "Please review the remarks and make the necessary revisions.";

    } else {

        setStep("step-completed", "");

        finalDescription.textContent =
            "Your request is still being processed.";
    }

    // Review remarks
    document.getElementById("result-remarks").textContent =
        request.adminRemarks || "No remarks have been provided.";
}

// Search for a request
function trackRequest() {

    const referenceInput =
        document.getElementById("reference-input");

    const errorMessage =
        document.getElementById("search-error");

    const result =
        document.getElementById("tracking-result");

    const reference = referenceInput.value.trim().toUpperCase();

    errorMessage.textContent = "";
    result.hidden = true;

    if (!reference) {
        errorMessage.textContent =
            "Please enter your request reference number.";
        return;
    }

    const requests = getRequests();

    const request = requests.find(item =>
        String(item.id).toUpperCase() === reference
    );

    if (!request) {
        errorMessage.textContent =
            "Request not found. Please check your reference number.";
        return;
    }

    displayTrackingResult(request);
}

// Search button
document.getElementById("search-btn").addEventListener("click", trackRequest);

// Press Enter to search
document.getElementById("reference-input").addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        trackRequest();
    }

});
