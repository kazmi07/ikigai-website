// ================================
// IKIGAI QUIZ – Bar chart only (no Venn diagram)
// ================================

let questions = [];
let currentQuestionIndex = 0;
let scores = {};

const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const progressElement = document.getElementById("progress");

const resultContainer = document.getElementById("result");
const chartCanvas = document.getElementById("ikigaiChart");

// ================================
// LOAD QUESTIONS
// ================================
async function loadQuestions() {
    try {
        showLoading(true);

        const response = await fetch("questions.json");
        if (!response.ok) throw new Error("Could not load questions.json");

        const data = await response.json();
        if (!data.questions || data.questions.length === 0)
            throw new Error("Questions file is empty");

        questions = data.questions;
        initializeScores();
        showLoading(false);
        showQuestion();
    } catch (error) {
        console.error(error);
        quizContainer.innerHTML = "<p style='color:red'>Failed to load quiz. Check console.</p>";
    }
}

// ================================
// SHOW/HIDE LOADING INDICATOR
// ================================
function showLoading(isLoading) {
    if (isLoading) {
        questionElement.style.display = "none";
        progressElement.style.display = "none";
        optionsElement.innerHTML = '<div class="spinner"></div><p>Loading questions...</p>';
    } else {
        questionElement.style.display = "block";
        progressElement.style.display = "block";
    }
}

// ================================
// INITIALIZE SCORES
// ================================
function initializeScores() {
    scores = {};
    questions.forEach(question => {
        question.options.forEach(option => {
            if (option.weights) {
                Object.keys(option.weights).forEach(category => {
                    if (!scores[category]) scores[category] = 0;
                });
            }
        });
    });
}

// ================================
// SHOW QUESTION
// ================================
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentQuestionIndex];

    progressElement.innerText = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
    questionElement.innerText = q.text;
    optionsElement.innerHTML = "";

    q.options.forEach((option, index) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "option";
        optionDiv.innerText = option.text;
        optionDiv.addEventListener("click", () => selectOption(index));
        optionsElement.appendChild(optionDiv);
    });
}

// ================================
// HANDLE OPTION CLICK
// ================================
function selectOption(index) {
    const q = questions[currentQuestionIndex];
    const options = document.querySelectorAll(".option");
    options.forEach(opt => opt.classList.remove("selected"));
    options[index].classList.add("selected");

    const selectedOption = q.options[index];
    if (selectedOption.weights) updateScores(selectedOption.weights);

    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 400);
}

// ================================
// UPDATE SCORES
// ================================
function updateScores(weights) {
    Object.entries(weights).forEach(([category, value]) => {
        if (!scores[category]) scores[category] = 0;
        scores[category] += value;
    });
}

// ================================
// GET TOP RESULTS
// ================================
function getTopResults(limit = 8) {
    return Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

// ================================
// SHOW RESULTS
// ================================
function showResults() {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";
    createChart();
}

// ================================
// CREATE CHART
// ================================
function createChart() {
    const results = getTopResults();
    const labels = results.map(item => formatName(item[0]));
    const values = results.map(item => item[1]);

    new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Your Ikigai Match Score",
                data: values,
                backgroundColor: "rgba(255,99,132,0.6)",
                borderColor: "rgba(255,99,132,1)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

// ================================
// FORMAT CATEGORY NAME
// ================================
function formatName(name) {
    return name
        .replace(/_/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

// ================================
// RESTART QUIZ
// ================================
document.getElementById("restartBtn").addEventListener("click", () => {
    location.reload();
});

// ================================
// START QUIZ
// ================================
document.addEventListener("DOMContentLoaded", loadQuestions);