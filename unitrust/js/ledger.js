
const STORAGE_KEY = "unitrust_requests";

// Retrieve all requests
function getRequests() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Unable to retrieve ledger records:", error);
        return [];
    }
}

// Format amounts into Philippine pesos
function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

// Format dates
function formatDate(date) {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Get only administrator-approved requests
function getApprovedRequests() {
    return getRequests()
        .filter(request => request.adminStatus === "Approved")
        .sort((a, b) => {
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
}

// Display the ledger table
function displayLedger() {

    const approvedRequests = getApprovedRequests();

    const tableBody = document.getElementById("ledger-table-body");

    tableBody.innerHTML = "";

    // Update total transactions
    document.getElementById("total-transactions").textContent =
        approvedRequests.length;

    // Calculate total approved funds
    const totalFunds = approvedRequests.reduce((total, request) => {
        return total + Number(request.amount || 0);
    }, 0);

    document.getElementById("total-funds").textContent =
        formatAmount(totalFunds);

    // Update latest block
    document.getElementById("latest-block").textContent =
        approvedRequests.length > 0
            ? `#${approvedRequests.length}`
            : "None";

    // Show an empty message if there are no approved requests
    if (approvedRequests.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-ledger">
                    No approved transactions have been recorded yet.
                    <br>
                    Approved requests will automatically appear here.
                </td>
            </tr>
        `;

        return;
    }

    // Generate a row for every approved request
    approvedRequests.forEach((request, index) => {

        const row = document.createElement("tr");

        const values = [
            {
                value: `#${index + 1}`,
                className: "block-number"
            },
            {
                value: request.id || "N/A",
                className: "transaction-reference"
            },
            {
                value: request.department || "Not provided"
            },
            {
                value: request.project || "Not provided"
            },
            {
                value: formatAmount(request.amount)
            },
            {
                value: formatDate(request.createdAt)
            }
        ];

        values.forEach(item => {

            const cell = document.createElement("td");

            cell.textContent = item.value;

            if (item.className) {
                cell.className = item.className;
            }

            row.appendChild(cell);
        });

        // Approved status
        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className = "transaction-status";
        status.textContent = "Approved";

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

// Initialize the ledger
displayLedger();
