const message = document.getElementById("message");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const showForgotPwdBtn = document.getElementById("showForgotPwdBtn");

document.getElementById("loginForm").addEventListener("submit", async(e) => {
    e.preventDefault();

    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
        const response = await axios.post("/user/login", { email, password });
        message.textContent = response.data.message;

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isPremiumUser', response.data.isPremiumUser);

        setTimeout(() => { window.location.href = "/dashboard.html" }, 2000);
    } catch (error) {
        console.error(error);
        message.textContent = error.response?.data?.message || "Login failed.";
    }
});

// Toggle visibility of the forgot password form
showForgotPwdBtn.addEventListener("click", () => {
    if (forgotPasswordForm.style.display === "none") {
        forgotPasswordForm.style.display = "block";
        showForgotPwdBtn.textContent = "Hide Forgot Password";
    } else {
        forgotPasswordForm.style.display = "none";
        showForgotPwdBtn.textContent = "Forgot Password?";
    }
});

// Handle forgot password submission
forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = e.target.elements.forgotEmail.value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    message.textContent = "";

    try {
        const response = await axios.post("/password/forgotpassword", { email });
        message.textContent = response.data.message;
        e.target.reset();
        
        setTimeout(() => {
            forgotPasswordForm.style.display = "none";
            showForgotPwdBtn.textContent = "Forgot Password?";
            message.textContent = "";
        }, 3000);
    } catch (error) {
        console.error("Forgot password request failed:", error);
        message.textContent = error.response?.data?.message || "Failed to send reset email.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Reset Mail";
    }
});