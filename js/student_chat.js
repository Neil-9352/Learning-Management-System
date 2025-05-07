document.addEventListener("DOMContentLoaded", function () {
    const sendMessageButton = document.getElementById("send-message");
    const messageInput = document.getElementById("message");
    const imageInput = document.getElementById("image-upload");
    const messagesArea = document.getElementById("messages-area");

    const courseId = new URLSearchParams(window.location.search).get("cid"); // Get the course ID from URL
    const apiUrl = "/student/chat/send"; // Backend API URL for sending messages
    const fetchMessagesUrl = `/student/chat/messages?cid=${courseId}`; // Fetch messages specific to the course

    // Fetch the existing messages when the page loads
    fetchMessages();

    // Send a message when the "Send" button is clicked
    sendMessageButton.addEventListener("click", function () {
        const message = messageInput.value.trim();
        const image = imageInput.files[0];

        if (message || image) {
            const formData = new FormData();
            formData.append("course_id", courseId); // Send the course ID (which is used to fetch the receiver ID on the backend)
            formData.append("message", message);

            if (image) {
                formData.append("image", image);
            }

            fetch(apiUrl, {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        messageInput.value = ""; // Clear the message input field
                        imageInput.value = ""; // Clear the image input
                        fetchMessages(); // Fetch the updated list of messages
                    } else {
                        alert("Error sending message");
                    }
                })
                .catch((err) => {
                    console.error("Error:", err);
                    alert("Error sending message");
                });
        } else {
            alert("Please enter a message or upload an image.");
        }
    });

    // Function to fetch and display messages
    function fetchMessages() {
        fetch(fetchMessagesUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    displayMessages(data.messages);
                }
            })
            .catch((err) => {
                console.error("Error fetching messages:", err);
            });
    }

    // Function to display messages
    function displayMessages(messages) {
        messagesArea.innerHTML = ""; // Clear existing messages

        messages.forEach((msg) => {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add(
                "message",
                "p-3",
                "rounded",
                "max-w-xl",
                "w-fit",
                "break-words",
                "my-2"
            );

            // Add classes to style based on the sender role
            if (msg.sender_role === "teacher") {
                messageDiv.classList.add("bg-gray-200"); // Student's messages
            } else if (msg.sender_role === "student") {
                messageDiv.classList.add("bg-blue-100", "self-end", "ml-auto"); // Teacher's messages
            }

            // Label to indicate who sent it
            const senderLabel = document.createElement("strong");
            senderLabel.textContent =
                msg.sender_role === "student" ? "Me:" : "Teacher:";
            messageDiv.appendChild(senderLabel);

            // Add the message text if it exists
            if (msg.message && msg.message.trim() !== "") {
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

        // Delay the scroll to the last message using setTimeout (1 second)
        setTimeout(() => {
            const lastMessage = messagesArea.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        }, 1000); // 1 second delay
    }
});
