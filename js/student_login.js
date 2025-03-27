document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/check_session", { credentials: "include" });
        const result = await response.json();

        if (result.loggedIn) {
            window.location.href = "/pages/student_dashboard.html"; // Redirect if already logged in
        }
    } catch (error) {
        console.error("Session check failed:", error);
    }
});

const form = document.querySelector("#login-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const rollNumber = document.getElementById("roll-number").value.trim();
    const password = document.getElementById("password").value;

    if (!rollNumber || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch("/student_login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rollNumber, password }),
            credentials: "include" // Ensures session cookies are sent
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = "/pages/student_dashboard.html"; // Redirect after successful login
        } else {
            alert(result.error); // Show error message if login fails
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
    }
});
