document.addEventListener("DOMContentLoaded", async function () {
    const courseSelect = document.getElementById("course");

    try {
        const response = await fetch("/get_courses");
        const courses = await response.json();

        courseSelect.innerHTML = '<option value="">Select a course</option>';
        if (courses.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No courses available";
            option.disabled = true;
            courseSelect.appendChild(option);
        } else {
            courses.forEach((course) => {
                const option = document.createElement("option");
                option.value = course.cid;
                option.textContent = course.cname;
                courseSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error loading courses:", error);
    }
});


const form = document.getElementById("register-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const course = document.getElementById("course").value;

    // Validate inputs
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    if (!course) {
        alert("Please select a course.");
        return;
    }

    // Create teacher data object
    const teacherData = {
        name,
        email,
        username,
        password,
        course,
    };

    try {
        // Send POST request to the server
        const response = await fetch("/teacher_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(teacherData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            form.reset();
            window.location.href = "/pages/teacher_login.html"; // Redirect to login page
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred. Please try again.");
    }
});
