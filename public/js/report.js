const downloadReportBtn = document.getElementById("downloadReportBtn");
const reportMessage = document.getElementById("reportMessage");
const downloadHistoryList = document.getElementById("downloadHistoryList");
const token = localStorage.getItem("token"); 

// Redirect if not logged in
if (!token) {
    window.location.href = "/login.html";
}

downloadReportBtn.addEventListener("click", async () => {
    downloadReportBtn.disabled = true;
    downloadReportBtn.textContent = "Generating to S3...";
    reportMessage.textContent = "";

    try {
        const response = await axios.get("/premium/download", {
            headers: { "Authorization": token }
        });

        if (response.status === 200) {
            window.open(response.data.fileURL, "_blank");
            reportMessage.style.color = "green";
            reportMessage.textContent = "Report generated and downloaded successfully!";
            
            loadDownloadHistory();
        }
    } catch (error) {
        console.error("Download error:", error);
        reportMessage.style.color = "red";
        
        if (error.response && error.response.status === 401) {
            reportMessage.textContent = "Unauthorized: You must be a Premium User to download reports.";
            downloadReportBtn.style.display = "none"; 
        } else {
            reportMessage.textContent = "Failed to generate report. Please try again.";
        }
    } finally {
        downloadReportBtn.disabled = false;
        downloadReportBtn.textContent = "Download Latest Report";
    }
});

async function loadDownloadHistory() {
    try {
        const response = await axios.get("/premium/download-history", {
            headers: { "Authorization": token }
        });

        downloadHistoryList.innerHTML = ""; 

        if (response.data.history.length === 0) {
            downloadHistoryList.innerHTML = "<li>No previous downloads found.</li>";
            return;
        }

        response.data.history.forEach(file => {
            const li = document.createElement("li");
            const dateStr = new Date(file.downloadDate).toLocaleString();
            
            li.innerHTML = `
                <span>${dateStr}</span>
                <a href="${file.fileUrl}" target="_blank" style="margin-left: 15px; color: blue; font-weight: bold;">Re-Download</a>
            `;
            
            downloadHistoryList.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to load history", error);
        if (error.response && error.response.status === 401) {
            downloadHistoryList.innerHTML = "<li>Premium feature locked.</li>";
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadDownloadHistory();
});