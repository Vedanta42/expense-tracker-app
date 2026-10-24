document.addEventListener("DOMContentLoaded", () => {
    const isPremiumUser = localStorage.getItem("isPremiumUser") === "true";
    const token = localStorage.getItem("token");
    
    const reportContainer = document.getElementById("reportContainer");
    const premiumGateMessage = document.getElementById("premiumGateMessage");
    const downloadBtn = document.getElementById("downloadBtn");
    const downloadMessage = document.getElementById("downloadMessage");
    const expenseTableBody = document.querySelector("#expenseTable tbody");
    const timeframeFilter = document.getElementById("timeframeFilter");

    if (!isPremiumUser) {
        premiumGateMessage.style.display = "block";
        return; 
    }

    reportContainer.style.display = "block";

    const fetchAndRenderReports = async (timeframe = "all") => {
        try {
            const response = await axios.get(`/premium/reports?timeframe=${timeframe}`, {
                headers: { "Authorization": token }
            });
            
            const expenses = response.data.expenses;
            expenseTableBody.innerHTML = ""; // Clear existing rows

            if (expenses.length === 0) {
                const emptyRow = document.createElement("tr");
                const emptyCell = document.createElement("td");
                emptyCell.colSpan = 4;
                emptyCell.textContent = "No expenses found for this period.";
                emptyRow.appendChild(emptyCell);
                expenseTableBody.appendChild(emptyRow);
                return;
            }

            expenses.forEach(expense => {
                const row = document.createElement("tr");

                const dateCell = document.createElement("td");
                dateCell.textContent = new Date(expense.createdAt).toLocaleDateString();

                const descCell = document.createElement("td");
                descCell.textContent = expense.description;

                const catCell = document.createElement("td");
                catCell.textContent = expense.category;

                const amtCell = document.createElement("td");
                amtCell.textContent = expense.amount;

                row.appendChild(dateCell);
                row.appendChild(descCell);
                row.appendChild(catCell);
                row.appendChild(amtCell);

                expenseTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching reports:", error);
            alert("Failed to load reports.");
        }
    };

    // Initial load
    fetchAndRenderReports(timeframeFilter.value);

    // Listen for dropdown changes
    timeframeFilter.addEventListener("change", (e) => {
        fetchAndRenderReports(e.target.value);
    });

    // Handle .txt Download
    downloadBtn.addEventListener("click", async () => {
        try {
            downloadBtn.disabled = true;
            downloadMessage.textContent = "Generating file...";
            downloadMessage.style.color = "black";

            const response = await axios.get('/premium/download', {
                headers: { "Authorization": token },
                responseType: 'blob' // Important for file downloads
            });

            // Create a temporary link to trigger the browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Expense_Report.txt');
            document.body.appendChild(link);
            link.click();
            link.remove();

            downloadMessage.textContent = "Download complete!";
            downloadMessage.style.color = "green";
        } catch (error) {
            console.error("Download failed:", error);
            downloadMessage.textContent = "Failed to download report.";
            downloadMessage.style.color = "red";
        } finally {
            downloadBtn.disabled = false;
        }
    });
});