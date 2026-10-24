const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardList = document.getElementById("leaderboardList");

// Initialize the list as hidden
leaderboardList.style.display = "none";

leaderboardBtn.addEventListener("click", async () => {
    // 1. Check current state
    if (leaderboardBtn.textContent === "Show Leaderboard") {
        try {
            // Fetch fresh data when showing
            const response = await axios.get("/premium/leaderboard", {
                headers: { "Authorization": window.token }
            });

            leaderboardList.innerHTML = "<h4>Leaderboard Rankings</h4>"; 

            response.data.forEach(user => {
                const listItem = document.createElement("li");
                listItem.textContent = `Name: ${user.name} | Total Expenses: $${user.total_expenses}`;
                leaderboardList.appendChild(listItem);
            });

            // Reveal the list and update button text
            leaderboardList.style.display = "block";
            leaderboardBtn.textContent = "Hide Leaderboard";

        } catch (error) {
            console.error("Error fetching leaderboard", error);
            alert("Failed to load leaderboard data.");
        }
    } else {
        // 2. Hide the list and revert button text
        leaderboardList.style.display = "none";
        leaderboardBtn.textContent = "Show Leaderboard";
    }
});