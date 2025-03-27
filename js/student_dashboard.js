window.onload = async function () {
    try {
        const response = await fetch("/get_student_info");
        const data = await response.json();
        if (data.error) {
            window.location.href = "/pages/student_login.html"; // Redirect if not logged in
        } else {
            document.getElementById("student-name").textContent = data.name;
        }
    } catch (error) {
        console.error("Error fetching student info:", error);
    }
};

document.getElementById("logout-link").addEventListener("click", async () => {
    try {
        const response = await fetch("/logout");
        if (response.redirected) {
            window.location.href = response.url; // Redirect after logout
        } else {
            alert("Logout failed");
        }
    } catch (error) {
        console.error("Logout error:", error);
    }
});
