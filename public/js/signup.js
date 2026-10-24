const message = document.getElementById("message");

document.getElementById("signupForm").addEventListener("submit",async(e)=>{
    e.preventDefault();

    const name = e.target.elements.name.value;
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;

    try {
        const response = await axios.post("/user/signup", {name, email, password});
        message.textContent = response.data.message;

        setTimeout(() => {window.location.href = "/login.html"},2000);
    } catch (error) {
        console.log(error);
    }
});