const cashfree = Cashfree({
    mode: "sandbox",
});

// FIX 1: Target the correct button ID from your HTML
document.getElementById("rzp-button1").addEventListener("click", async () => {
    try {
        const response = await axios.get("/purchase/premiummembership", {
            // FIX 2: Use the global window.token
            headers: { "Authorization": window.token } 
        });
        
        const { payment_session_id, order_id } = response.data;

        let checkoutOptions = {
            paymentSessionId: payment_session_id,
            redirectTarget: "_modal",
        };

        const result = await cashfree.checkout(checkoutOptions);
        
        if (result.error) {
            console.log("User has closed the popup or there is some payment error, Check for Payment Status");
            console.log(result.error);
            await verifyPaymentStatus(order_id);
        }
        
        if (result.redirect) {
            console.log("Payment will be redirected");
        }
        
        if (result.paymentDetails) {
            console.log("Payment has been completed, Check for Payment Status");
            console.log(result.paymentDetails.paymentMessage);
            await verifyPaymentStatus(order_id);
        }

    } catch (error) {
        console.error("Error initiating payment:", error);
        alert("Could not initiate payment.");
    }
});

async function verifyPaymentStatus(orderId) {
    try {
        const verifyResponse = await axios.post("/purchase/updatetransactionstatus", 
            { order_id: orderId }, 
            // FIX 3: Use the global window.token
            { headers: { "Authorization": window.token } } 
        );
        
        alert(verifyResponse.data.message);
        
        if (verifyResponse.data.message === "Transaction successful") {
            // Overwrite old storage data with new premium token and flag
            localStorage.setItem("token", verifyResponse.data.token);
            localStorage.setItem("isPremiumUser", verifyResponse.data.isPremiumUser);
            
            // FIX 4: Update UI dynamically using the correct IDs
            document.getElementById("rzp-button1").style.display = "none";
            document.getElementById("premiumMessage").style.display = "block";
            document.getElementById("leaderboardBtn").style.display = "block";
            document.getElementById("premiumFeatures").style.display = "block";
            
            // Optionally update the global token variable for future axios calls before refresh
            window.token = verifyResponse.data.token;
        }
        
    } catch (verifyError) {
        alert(verifyError.response?.data?.message || "TRANSACTION FAILED");
    }
}