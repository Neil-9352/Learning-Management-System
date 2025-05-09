window.onload = async function () {
    try {
        const response = await fetch("/get_teacher_info");
        const data = await response.json();

        if (data.error) {
            window.location.href = "/pages/teacher_login.html"; // Redirect if not logged in
        } else {
            document.getElementById("teacher-name").textContent = data.name;
            document.getElementById("teacher-course").textContent = `${data.cid}: ${data.cname}`;
            loadMaterials(); // Load uploaded materials
        }
    } catch (error) {
        console.error("Error fetching teacher info:", error);
    }
};

// File Upload Handling
document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/upload_material", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("Upload successful!");
            fileInput.value = ""; // Reset input field
            loadMaterials(); // Reload uploaded materials list
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred. Please try again.");
    }
});

// Load Uploaded Materials
async function loadMaterials() {
    try {
        const response = await fetch("/get_materials");
        const materials = await response.json();

        const materialsList = document.getElementById("materials-list");
        materialsList.innerHTML = "";

        materials.forEach(material => {
            const listItem = document.createElement("li");
            listItem.classList.add("mb-2")
            const link = document.createElement("a");
            link.href = material.document;
            link.textContent = material.document.split("/").pop();
            link.target = "_blank";

            link.classList.add(
                "text-blue-600",
                "hover:underline",
                "hover:text-blue-800",
                "transition",
                "duration-150",
                "ease-in-out",
                "font-semibold",
            );

            listItem.appendChild(link);
            materialsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading materials:", error);
    }
}
