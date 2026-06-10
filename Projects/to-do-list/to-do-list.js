// ─────────────────────────────────────────────
// VARIABLES & STRINGS
// ─────────────────────────────────────────────

let currentFilter = "all";
let nextId = 1;

// ─────────────────────────────────────────────
// ARRAYS & OBJECTS
// ─────────────────────────────────────────────

let tasks = []; // Initialized as empty as requested

// ─────────────────────────────────────────────
// FUNCTIONS
// ─────────────────────────────────────────────

function addTask() {
    const input = document.getElementById("task-input");
    const text = input.value.trim();

    if (!text) return;

    const newTask = {
        id: nextId,
        text: text,
        done: false
    };

    tasks.push(newTask);
    nextId = nextId + 1;
    input.value = "";
    render();
}

function toggleDone(id) {
    const task = tasks.find(function (t) {
        return t.id === id;
    });

    if (task) {
        task.done = !task.done;
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(function (t) {
        return t.id !== id;
    });
    render();
}

function clearDone() {
    tasks = tasks.filter(function (t) {
        return t.done === false;
    });
    render();
}

function getFilteredTasks() {
    if (currentFilter === "pending") {
        return tasks.filter(function (t) { return !t.done; });
    }
    if (currentFilter === "done") {
        return tasks.filter(function (t) { return t.done; });
    }
    return tasks;
}

// ─────────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────────

function render() {
    const list = document.getElementById("todo-list");
    const filtered = getFilteredTasks();

    const totalCount = tasks.length;
    const doneCount = tasks.filter(function (t) { return t.done; }).length;
    const pendingCount = totalCount - doneCount;

    document.getElementById("stat-total").textContent = totalCount;
    document.getElementById("stat-done").textContent = doneCount;
    document.getElementById("stat-pending").textContent = pendingCount;

    const clearBtn = document.getElementById("clear-done-btn");
    clearBtn.disabled = (doneCount === 0);

    if (filtered.length === 0) {
        const messages = {
            all: "Nothing here yet — add your first task!",
            pending: "No pending tasks. You're all caught up!",
            done: "No completed tasks yet."
        };
        list.innerHTML = `
<li class="empty">
  <span>✓</span>
  ${messages[currentFilter]}
</li>`;
        return;
    }

    let html = "";

    for (let i = 0; i < filtered.length; i++) {
        const task = filtered[i];
        const doneClass = task.done ? "done" : "";
        const checkMark = task.done ? "✓" : "";

        html += `
<li class="todo-item ${doneClass}" data-id="${task.id}">
  <button class="check-btn" onclick="toggleDone(${task.id})">${checkMark}</button>
  <span class="todo-text">${task.text}</span>
  <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">×</button>
</li>
`;
    }

    list.innerHTML = html;
}

// ─────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────

document.getElementById("add-btn").addEventListener("click", addTask);

document.getElementById("task-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") addTask();
});

document.getElementById("clear-done-btn").addEventListener("click", clearDone);

const filterButtons = document.querySelectorAll(".filter-btn");
for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
        for (let j = 0; j < filterButtons.length; j++) {
            filterButtons[j].classList.remove("active");
        }
        this.classList.add("active");
        currentFilter = this.getAttribute("data-filter");
        render();
    });
}

// Initial render
render();
