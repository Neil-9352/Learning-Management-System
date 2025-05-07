window.onload = async function () {
    try {
        const response = await fetch("/get_student_info");
        const data = await response.json();
        if (data.error) {
            window.location.href = "/pages/student_login.html"; // Redirect if not logged in
        } else {
            document.getElementById("student-name").textContent = data.name;

            const coursesList = document.getElementById("courses-list");
            coursesList.innerHTML = ""; // Clear any existing courses

            const courseIds = [data.cid1, data.cid2, data.cid3];

            courseIds.forEach(cid => {
                if (cid) {
                    const li = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = `/pages/course.html?cid=${encodeURIComponent(cid)}`;
                    link.textContent = cid;
                    link.className = "course-link"; // Optional: for styling

                    li.appendChild(link);
                    coursesList.appendChild(li);
                }
            });
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
