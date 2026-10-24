document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const messageElement = document.getElementById('message');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Extract the UUID from the end of the URL path
    const id = window.location.pathname.split('/').pop();

    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    try {
        const response = await axios.post(`/password/updatepassword/${id}`, { newPassword });
        
        messageElement.style.color = "green";
        messageElement.textContent = response.data.message;
        
        setTimeout(() => { window.location.href = '/login.html' }, 3000);
    } catch(error) {
        console.error("Error updating password:", error);
        messageElement.style.color = "red";
        messageElement.textContent = error.response?.data?.message || "Failed to update password.";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Password";
    }
});