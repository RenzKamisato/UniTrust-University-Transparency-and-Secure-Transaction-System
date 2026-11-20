
/* =================================
   UNITRUST - DEPARTMENT REQUEST
   SAVE REQUESTS USING LOCAL STORAGE
================================= */

const STORAGE_KEY = "unitrust_requests";

const form = document.getElementById("fundRequestForm");


// GET SAVED REQUESTS
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


// SAVE REQUESTS
function saveRequests(requests) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(requests)
    );

}


// GENERATE REQUEST REFERENCE
function generateReference() {

    const year = new Date().getFullYear();

    const lastNumber = Number(
        localStorage.getItem("unitrust_request_counter") || 0
    );

    const nextNumber = lastNumber + 1;

    localStorage.setItem(
        "unitrust_request_counter",
        nextNumber
    );

    return "UT-" + year + "-" +
        String(nextNumber).padStart(3, "0");

}


// SUBMIT REQUEST
form.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get form values
    const department = document.getElementById("department").value;
    const officer = document.getElementById("officer").value.trim();
    const project = document.getElementById("project").value.trim();
    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const supplier = document.getElementById("supplier").value.trim();
    const description = document.getElementById("description").value.trim();

    const documentInput = document.getElementById("documents");

    // Get selected file names
    const documentNames = Array.from(documentInput.files).map(
        file => file.name
    );

    // Basic validation
    if (
        !department ||
        !officer ||
        !project ||
        !category ||
        !amount ||
        amount <= 0 ||
        !supplier ||
        !description ||
        documentNames.length === 0
    ) {

        alert("Please complete all required fields.");
        return;

    }

    // Generate reference number
    const reference = generateReference();

    // Create request record
    const newRequest = {

        id: reference,

        department: department,
        officer: officer,
        project: project,
        category: category,
        amount: amount,
        supplier: supplier,
        description: description,

        documents: documentNames,

        auditorStatus: "Pending",
        adminStatus: "Waiting for Verification",
        adminRemarks: "",

        createdAt: new Date().toISOString()

    };


    // Get existing requests
    const requests = getRequests();

    // Add new request
    requests.push(newRequest);

    // Save updated requests
    saveRequests(requests);


    // Display generated reference
    document.getElementById("reference").value = reference;

    alert(
        "Your fund request has been submitted successfully!\n\n" +
        "Reference ID: " + reference +
        "\n\nYour request is now waiting for auditor verification."
    );


    // Reset form fields
    form.reset();

    // Keep the generated reference visible
    document.getElementById("reference").value = reference;

});
