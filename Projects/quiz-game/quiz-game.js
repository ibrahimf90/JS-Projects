const questionBanks = {
    javascript: {
        label: "JavaScript",
        icon: "⚡",
        questions: [
            { question: "Which keyword declares a variable that cannot be reassigned?",
              options: ["var", "let", "const", "static"], answer: 2 },
            { question: "What does the .length property return on an array?",
              options: ["The last item", "The number of items", "The first item", "The sum of items"], answer: 1 },
            { question: "What value does a function return if it has no return statement?",
              options: ["null", "0", "undefined", "false"], answer: 2 },
            { question: "Which method adds an item to the END of an array?",
              options: [".shift()", ".unshift()", ".pop()", ".push()"], answer: 3 },
            { question: "What does === check for compared to ==?",
              options: ["Nothing different", "Value only", "Type only", "Both value AND type"], answer: 3 },
        ]
    },
    html: {
        label: "HTML",
        icon: "🏗️",
        questions: [
            { question: "What does HTML stand for?",
              options: ["Hyper Transfer Markup Language", "HyperText Markup Language", "High-Text Making Language", "Home Tool Markup Language"], answer: 1 },
            { question: "Which tag is used to link a CSS stylesheet?",
              options: ["<style>", "<css>", "<link>", "<script>"], answer: 2 },
            { question: "What is the correct HTML element for the largest heading?",
              options: ["<heading>", "<h6>", "<head>", "<h1>"], answer: 3 },
            { question: "Which attribute specifies where a hyperlink goes?",
              options: ["src", "href", "link", "to"], answer: 1 },
            { question: "Which element is used to define a list item?",
              options: ["<li>", "<list>", "<item>", "<ul>"], answer: 0 },
        ]
    },
    css: {
        label: "CSS",
        icon: "🎨",
        questions: [
            { question: "Which CSS property controls the text size?",
              options: ["text-size", "font-weight", "font-size", "text-scale"], answer: 2 },
            { question: "What does the 'C' in CSS stand for?",
              options: ["Creative", "Cascading", "Coded", "Central"], answer: 1 },
            { question: "How do you select an element with id='header' in CSS?",
              options: [".header", "*header", "#header", "header"], answer: 2 },
            { question: "Which property is used to add space inside an element's border?",
              options: ["margin", "spacing", "padding", "border-space"], answer: 2 },
            { question: "Which value makes a flex container wrap its items?",
              options: ["flex-wrap: wrap", "flex: wrap", "flex-flow: row", "display: wrap"], answer: 0 },
        ]
    },
    science: {
        label: "Science",
        icon: "🔬",
        questions: [
            { question: "What is the chemical symbol for water?",
              options: ["WA", "H2O", "HO2", "OHH"], answer: 1 },
            { question: "How many bones are in the adult human body?",
              options: ["196", "206", "216", "226"], answer: 1 },
            { question: "What planet is closest to the Sun?",
              options: ["Venus", "Earth", "Mars", "Mercury"], answer: 3 },
            { question: "What gas do plants absorb from the atmosphere?",
              options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
            { question: "What is the speed of light (approximately) in km/s?",
              options: ["100,000", "300,000", "500,000", "1,000,000"], answer: 1 },
        ]
    }
};

let selectedTopic = "javascript";
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let answers = [];

function showScreen(id) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function startQuiz() {
    const bank = questionBanks[selectedTopic];
    currentQuestions = shuffle(bank.questions).slice(0, 5);
    currentIndex = 0;
    score = 0;
    answered = false;
    answers = [];
    showScreen("question-screen");
    renderQuestion();
}

function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
        showResults();
        return;
    }

    answered = false;
    const q = currentQuestions[currentIndex];
    const pct = (currentIndex / currentQuestions.length) * 100;
    document.getElementById("progress-bar").style.width = pct + "%";

    document.getElementById("q-counter").textContent = `Question ${currentIndex + 1} / ${currentQuestions.length}`;
    document.getElementById("q-score-live").textContent = `Score: ${score}`;
    document.getElementById("question-text").textContent = q.question;

    const feedback = document.getElementById("feedback");
    feedback.className = "";
    feedback.style.display = "none";
    document.getElementById("next-btn").style.display = "none";

    const grid = document.getElementById("options-grid");
    grid.innerHTML = "";
    const labels = ["A", "B", "C", "D"];

    q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        
        // Create the label span
        const span = document.createElement("span");
        span.className = "opt-label";
        span.textContent = labels[i];
        
        // Build the button content safely
        btn.appendChild(span);
        btn.appendChild(document.createTextNode(` ${opt}`));
        
        btn.addEventListener("click", () => selectAnswer(i));
        grid.appendChild(btn);
    });
}

function selectAnswer(chosenIndex) {
    if (answered) return;
    answered = true;

    const q = currentQuestions[currentIndex];
    const isCorrect = (chosenIndex === q.answer);

    if (isCorrect) score++;

    answers.push({
        question: q.question,
        chosen: chosenIndex,
        correct: q.answer,
        isCorrect: isCorrect
    });

    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.answer) btn.classList.add("correct");
        if (i === chosenIndex && !isCorrect) btn.classList.add("wrong");
    });

    const feedback = document.getElementById("feedback");
    if (isCorrect) {
        feedback.className = "correct";
        feedback.textContent = "✓ Correct!";
    } else {
        feedback.className = "wrong";
        feedback.textContent = `✗ The answer was: ${q.options[q.answer]}`;
    }
    feedback.style.display = "flex";

    document.getElementById("q-score-live").textContent = `Score: ${score}`;

    const nextBtn = document.getElementById("next-btn");
    nextBtn.style.display = "block";
    nextBtn.textContent = (currentIndex === currentQuestions.length - 1) ? "See results →" : "Next question →";
}

function showResults() {
    const total = currentQuestions.length;
    const pct = Math.round((score / total) * 100);

    document.getElementById("final-score").textContent = score;
    document.getElementById("final-out-of").textContent = `/ ${total}`;
    document.getElementById("progress-bar").style.width = "100%";

    let heading, message;
    if (score === total) {
        heading = "Perfect score! 🎉";
        message = "You nailed every question. Impressive!";
    } else if (score >= total * 0.6) {
        heading = "Nice work! 💪";
        message = `You got ${pct}% correct. Keep practising!`;
    } else {
        heading = "Keep at it 📚";
        message = `You got ${pct}% — review the topic and try again.`;
    }
    document.getElementById("result-heading").textContent = heading;
    document.getElementById("result-message").textContent = message;

    const breakdown = document.getElementById("result-breakdown");
    breakdown.innerHTML = answers.map(a => {
        const mark = a.isCorrect ? "✅" : "❌";
        const qShort = a.question.length > 55 ? a.question.slice(0, 55) + "…" : a.question;
        return `
            <div class="breakdown-row">
                <span class="q-text">${qShort}</span>
                <span class="mark">${mark}</span>
            </div>
        `;
    }).join("");

    showScreen("results-screen");
}

function buildTopicGrid() {
    const grid = document.getElementById("topic-grid");
    grid.innerHTML = "";
    Object.keys(questionBanks).forEach(key => {
        const topic = questionBanks[key];
        const card = document.createElement("div");
        card.className = "topic-card" + (key === selectedTopic ? " selected" : "");
        card.innerHTML = `<div class="icon">${topic.icon}</div><div class="label">${topic.label}</div>`;
        card.addEventListener("click", () => {
            selectedTopic = key;
            document.querySelectorAll(".topic-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
        });
        grid.appendChild(card);
    });
}

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("next-btn").addEventListener("click", () => { currentIndex++; renderQuestion(); });
document.getElementById("retry-btn").addEventListener("click", startQuiz);
document.getElementById("change-topic-btn").addEventListener("click", () => { showScreen("start-screen"); buildTopicGrid(); });

buildTopicGrid();
