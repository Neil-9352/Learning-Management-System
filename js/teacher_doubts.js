document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/teacher/students');
        const data = await response.json();

        if (data.success) {
            const list = document.getElementById('students-list');

            data.students.forEach(student => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `/pages/teacher_chat.html?student_id=${encodeURIComponent(student.roll_no)}`;
                link.textContent = `${student.name} (${student.roll_no})`;
                link.classList.add("text-blue-600", "hover:underline", "font-semibold");
                li.appendChild(link);
                list.appendChild(li);
            });
        } else {
            alert("Failed to load students.");
        }
    } catch (error) {
        console.error('Error fetching student list:', error);
        alert("An error occurred.");
    }
});
