// Make token global for cross-file accessibility
window.token = localStorage.getItem("token");

// Redirect if not logged in
if (!window.token) {
    window.location.href = "/login.html"; 
}

// Helper to check and apply UI changes on load
const checkPremiumStatus = () => {
    const isPremium = localStorage.getItem("isPremiumUser") === "true";
    
    if (isPremium) {
        // FIX: Updated ID from "premiumBtn" to "rzp-button1" to match your HTML
        const buyPremiumBtn = document.getElementById("rzp-button1");
        if (buyPremiumBtn) buyPremiumBtn.style.display = "none";
        
        const premiumMessage = document.getElementById("premiumMessage");
        if (premiumMessage) premiumMessage.style.display = "block";
        
        const leaderboardBtn = document.getElementById("leaderboardBtn");
        if (leaderboardBtn) leaderboardBtn.style.display = "block";
        
        // Also show the premium features container if it was hidden
        const premiumFeatures = document.getElementById("premiumFeatures");
        if (premiumFeatures) premiumFeatures.style.display = "block";
    }
};

window.addEventListener("DOMContentLoaded", () => {
    checkPremiumStatus();
    // Now this will execute safely
    if (typeof window.loadExpenses === 'function') {
        window.loadExpenses();
    }
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("isPremiumUser"); 
    window.location.href = "/login.html"; 
});