document.addEventListener("DOMContentLoaded", async function () {
    const courseSelect = document.getElementById("course");

    try {
        const response = await fetch("/get_courses");
        const courses = await response.json();

        // Clear existing options and add a default one
        courseSelect.innerHTML = '<option value="">Select a course</option>';

        courses.forEach((course) => {
            const option = document.createElement("option");
            option.value = course.cid; // Course ID as value
            option.textContent = course.cname; // Course Name as display text
            courseSelect.appendChild(option);
        });
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
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const course = document.getElementById("course").value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return; // Stop form submission
    }

    // Create data object
    const studentData = {
        name,
        email,
        rollNumber,
        password,
        course,
    };

    try {
        // Send POST request to the server
        const response = await fetch("/student_register", {
            // <-- Updated Route
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(studentData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            form.reset();
            window.location.href = "/pages/student_login.html"; // Redirect to login page
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred. Please try again.");
    }
});
