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

            const courseData = [
                { cid: data.cid1, cname: data.cname1 },
                { cid: data.cid2, cname: data.cname2 },
                { cid: data.cid3, cname: data.cname3 }
            ];

            courseData.forEach(({ cid, cname }) => {
                if (cid && cname) {
                    const li = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = `/pages/course.html?cid=${encodeURIComponent(cid)}`;
                    link.textContent = `${cid}: ${cname}`;
                    link.className = "course-link text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200";

                    li.appendChild(link);
                    coursesList.appendChild(li);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching student info:", error);
    }
};
