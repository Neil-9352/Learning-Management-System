document.addEventListener("DOMContentLoaded", () => {
    const sendMessageButton = document.getElementById("send-message");
    const messageInput = document.getElementById("message");
    const imageInput = document.getElementById("image-upload");
    const messagesArea = document.getElementById("messages-area");

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("student_id");

    if (!studentId) {
        alert("Student ID not found in URL.");
        return;
    }

    const apiUrl = "/teacher/chat/send";
    const fetchMessagesUrl = `/teacher/chat/messages?student_id=${encodeURIComponent(
        studentId
    )}`;

    // Fetch the existing messages when the page loads
    fetchMessages(); // Fetch messages when the page loads
    setInterval(fetchMessages, 2000); // Fetch messages every 2 seconds

    sendMessageButton.addEventListener("click", () => {
        const message = messageInput.value.trim();
        const image = imageInput.files[0];

        if (!message && !image) {
            alert("Please enter a message or upload an image.");
            return;
        }

        const formData = new FormData();
        formData.append("receiver_id", studentId);
        formData.append("message", message);
        if (image) {
            formData.append("image", image);
        }

        fetch(apiUrl, {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    messageInput.value = "";
                    imageInput.value = "";
                    fetchMessages();
                } else {
                    alert("Error sending message");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Error sending message");
            });
    });

    function fetchMessages() {
        fetch(fetchMessagesUrl)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    displayMessages(data.messages);
                }
            })
            .catch((err) => {
                console.error("Error fetching messages:", err);
            });
    }

    function displayMessages(messages) {
        messagesArea.innerHTML = ""; // Clear previous messages
        messages.forEach((msg) => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add(
                "message",
                "p-3",
                "rounded",
                "max-w-xl",
                "w-fit",
                "break-words",
                "my-2",
            );

            // Add classes to style based on the sender role
            if (msg.sender_role === "teacher") {
                messageDiv.classList.add("bg-blue-100", "self-end", "ml-auto"); // Teacher's messages
            } else if (msg.sender_role === "student") {
                messageDiv.classList.add("bg-gray-200"); // Student's messages
            }

            // Label to indicate who sent it
            const senderLabel = document.createElement("strong");
            senderLabel.textContent =
                msg.sender_role === "student" ? "Student:" : "Me:";
            messageDiv.appendChild(senderLabel);

            // Add the message text if it exists
            if (msg.message) {
                const text = document.createElement("p");
                text.textContent = msg.message;
                messageDiv.appendChild(text);
            }

            // Add image if it exists
            if (msg.image_path) {
                const img = document.createElement("img");
                img.src = `/message_uploads/${msg.image_path}`; // Image source path
                img.alt = "Attached image";
                img.classList.add("mt-2", "max-w-xs", "rounded");
                messageDiv.appendChild(img);
            }

            messagesArea.appendChild(messageDiv); // Add the message div to the messages area
        });

        setTimeout(() => {
            const lastMessage = messagesArea.lastElementChild;
            if (lastMessage) {
                const offset = 32; // 2rem in pixels
                const scrollTarget = lastMessage.offsetTop - messagesArea.offsetTop - offset;
        
                messagesArea.scrollTo({
                    top: scrollTarget,
                    behavior: "smooth"
                });
            }
        }, 1000);
        
    }
});
