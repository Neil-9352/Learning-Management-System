document.addEventListener("DOMContentLoaded", async function () {
    const courseSelects = [document.getElementById("course1"), document.getElementById("course2"), document.getElementById("course3")];

    try {
        const response = await fetch("/get_courses_student");
        const courses = await response.json();

        console.log(courses); // Log the courses to check the data

        courseSelects.forEach(select => {
            select.innerHTML = '<option value="">Select a course</option>';
            courses.forEach((course) => {
                const option = document.createElement("option");
                option.value = course.cid;
                option.textContent = course.cname;
                select.appendChild(option);
            });
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
    
    const course1 = document.getElementById("course1").value;
    const course2 = document.getElementById("course2").value;
    const course3 = document.getElementById("course3").value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Check if all three courses are selected and unique
    if (!course1 || !course2 || !course3) {
        alert("Please select all 3 courses.");
        return;
    }
    if (new Set([course1, course2, course3]).size !== 3) {
        alert("Please select 3 different courses.");
        return;
    }

    // Create data object
    const studentData = {
        name,
        email,
        rollNumber,
        password,
        course1,
        course2,
        course3,
    };

    try {
        // Send POST request to the server
        const response = await fetch("/student_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
