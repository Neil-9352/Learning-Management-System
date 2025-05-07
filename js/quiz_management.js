const questionsContainer = document.getElementById("questions-container");
const addQuestionBtn = document.getElementById("add-question");
const quizForm = document.getElementById("quiz-form");

let questionCount = 1;

function renumberQuestions() {
    const questionBlocks =
        questionsContainer.querySelectorAll(".question-block");
    questionBlocks.forEach((block, index) => {
        const questionLabel = block.querySelector("label");
        if (questionLabel) {
            questionLabel.textContent = `Question ${index + 1}:`;
        }
    });
}

addQuestionBtn.addEventListener("click", function () {
    questionCount++;
    const questionDiv = document.createElement("div");
    questionDiv.classList.add(
        "question-block",
        "bg-white",
        "p-6",
        "rounded-lg",
        "shadow-md"
    );
    questionDiv.innerHTML = `
                <label class="block font-medium">Question ${questionCount}:</label>
                <input type="text" class="question w-full p-2 mt-2 border border-gray-300 rounded" required>

                <label class="block mt-4 font-medium">Options:</label>
                <div class="options-container space-y-4">
                    <input type="text" class="option w-full p-2 border border-gray-300 rounded" placeholder="Option A" required />
                    <input type="text" class="option w-full p-2 border border-gray-300 rounded" placeholder="Option B" required />
                    <input type="text" class="option w-full p-2 border border-gray-300 rounded" placeholder="Option C" required />
                    <input type="text" class="option w-full p-2 border border-gray-300 rounded" placeholder="Option D" required />
                </div>

                <label class="block mt-4 font-medium">Correct Answer:</label>
                <select class="correct-answer w-full p-2 mt-2 border border-gray-300 rounded" required>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>

                <button type="button" class="remove-question mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Remove
                </button>
            `;

    questionsContainer.appendChild(questionDiv);

    questionDiv
        .querySelector(".remove-question")
        .addEventListener("click", function () {
            questionsContainer.removeChild(questionDiv);
            renumberQuestions();
            questionCount =
                questionsContainer.querySelectorAll(".question-block").length;
        });
});

quizForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const questions = [];
    questionsContainer
        .querySelectorAll(".question-block")
        .forEach((block, index) => {
            const questionText = block.querySelector(".question").value.trim();
            const options = Array.from(block.querySelectorAll(".option")).map(
                (opt) => opt.value.trim()
            );
            const correctAnswer = block.querySelector(".correct-answer").value;

            if (questionText && options.every((opt) => opt)) {
                questions.push({
                    qid: index + 1,
                    question: questionText,
                    options: {
                        A: options[0],
                        B: options[1],
                        C: options[2],
                        D: options[3],
                    },
                    correct: correctAnswer,
                });
            }
        });

    if (questions.length === 0) {
        alert("Please add at least one question.");
        return;
    }

    try {
        const response = await fetch("/upload_quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions }),
        });
        const result = await response.json();
        alert(result.message);

        // Clear form after submission
        quizForm.reset(); // Resets the form to its default state

        fetchQuizzes(); // Refresh the quiz list after submission
    } catch (error) {
        console.error("Error submitting quiz:", error);
        alert("Failed to submit quiz. Please try again.");
    }
});

// show quizzes
const quizListContainer = document.getElementById("quiz-list");

async function fetchQuizzes() {
    try {
        const response = await fetch("/get_quizzes", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server returned error:", errorText);
            alert("You are not authorized. Please log in.");
            window.location.href = "/pages/teacher_login.html";
            return;
        }

        const data = await response.json();
        quizListContainer.innerHTML = "";

        data.quizzes.forEach((quiz, serialIndex) => {
            const quizItem = document.createElement("div");
            quizItem.classList.add("quiz-item");

            let questionsHTML = "";
            const questions = quiz.questions;

            const parsedQuestions =
                typeof questions === "string"
                    ? JSON.parse(questions)
                    : questions;

            parsedQuestions.forEach((q, index) => {
                questionsHTML += `
                    <div class="question-block">
                        <strong>Q${index + 1}:</strong> ${q.question}<br>
                        A: ${q.options.A}<br>
                        B: ${q.options.B}<br>
                        C: ${q.options.C}<br>
                        D: ${q.options.D}<br>
                        <em>Correct: ${q.correct}</em>
                        <hr>
                    </div>
                `;
            });

            quizItem.innerHTML = `
                <p><strong>Quiz #${serialIndex + 1}</strong></p>
                ${questionsHTML}
                <button class="delete-quiz" data-id="${
                    quiz.quiz_id
                }">Delete</button>
            `;

            quizItem
                .querySelector(".delete-quiz")
                .addEventListener("click", async function () {
                    await deleteQuiz(quiz.quiz_id);
                    fetchQuizzes(); // Refresh list
                });

            quizListContainer.appendChild(quizItem);
        });
    } catch (error) {
        console.error("Error fetching quizzes:", error);
    }
}

async function deleteQuiz(quizId) {
    try {
        const response = await fetch(`/delete_quiz/${quizId}`, {
            method: "DELETE",
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error deleting quiz:", error);
    }
}

// Logout Handling
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

fetchQuizzes();
