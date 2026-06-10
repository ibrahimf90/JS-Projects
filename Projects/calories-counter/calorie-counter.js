"use strict";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const form = document.getElementById("calorie-counter");
const budgetInput = document.getElementById("budget");
const addBtn = document.getElementById("add-entry");
const clearBtn = document.getElementById("clear");
const entryList = document.getElementById("entry-list");
const emptyState = document.getElementById("empty-state");
const catTabs = document.querySelectorAll(".cat-tab");

// Output panel
const outputCard = document.getElementById("output-card");
const idleState = document.getElementById("idle-state");
const resultsInner = document.getElementById("results-inner");
const ringArc = document.getElementById("ring-arc");
const ringNumber = document.getElementById("ring-number");
const ringSub = document.getElementById("ring-sub");
const ringBadge = document.getElementById("ring-badge");
const statBudget = document.getElementById("stat-budget");
const statConsumed = document.getElementById("stat-consumed");
const statBurned = document.getElementById("stat-burned");
const mealBars = document.getElementById("meal-bars");
const legacyOutput = document.getElementById("output");

// ── Constants ─────────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 72; // r=72 matches SVG
const CATEGORIES = ["breakfast", "lunch", "dinner", "snacks", "exercise"];

const CAT_COLOR = {
  breakfast: "#e8a838",
  lunch: "#e07a2a",
  dinner: "#d45c2a",
  snacks: "#e8c438",
  exercise: "#4dc3f7",
};

const TIPS = [
  "A typical adult needs 2,000–2,500 kcal per day depending on activity level.",
  "Protein keeps you fuller longer — aim for 0.8 g per kg of body weight.",
  "Eating slowly helps your brain register fullness before you overeat.",
  "Exercise calories are an estimate — heart rate monitors give better accuracy.",
  "Vegetables are low-calorie and high-volume — great for filling your plate.",
];

// ── State ─────────────────────────────────────────────────────────────────────
const entries = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  exercise: [],
};

let activeTab = "breakfast";
let calculated = false;

// ── Helpers ───────────────────────────────────────────────────────────────────
function cleanValue(str) {
  return String(str).replace(/[+\-\s]/g, "");
}

function isScientific(str) {
  return /\d+e\d+/i.test(str);
}

function getTotal(cat) {
  return entries[cat].reduce((s, e) => s + (e.calories || 0), 0);
}

// ── Render tabs ───────────────────────────────────────────────────────────────
function renderTabs() {
  catTabs.forEach((tab) => {
    const cat = tab.dataset.cat;
    const count = entries[cat].length;
    const isActive = cat === activeTab;

    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");

    let badge = tab.querySelector(".tab-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "tab-count";
      tab.appendChild(badge);
    }
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  });
}

// ── Render entry rows ─────────────────────────────────────────────────────────
function renderEntries() {
  // Remove old rows only (keep empty-state node)
  entryList.querySelectorAll(".entry-row").forEach((r) => r.remove());

  const list = entries[activeTab];

  if (list.length === 0) {
    emptyState.style.display = "flex";
    return;
  }
  emptyState.style.display = "none";

  const isEx = activeTab === "exercise";

  list.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "entry-row" + (isEx ? " exercise-row" : "");
    row.dataset.index = idx;

    row.innerHTML = `
      <input type="text"   value="${escapeHtml(item.name)}"  placeholder="${isEx ? "Exercise" : "Food name"}" aria-label="Name" />
      <input type="number" value="${item.calories || ""}"     placeholder="kcal" min="0" aria-label="Calories" />
      <button type="button" class="btn-delete" aria-label="Remove entry">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>`;

    const nameInput = row.querySelector('input[type="text"]');
    const calInput = row.querySelector('input[type="number"]');
    const delBtn = row.querySelector(".btn-delete");

    nameInput.addEventListener("input", (e) => {
      entries[activeTab][idx].name = e.target.value;
    });

    calInput.addEventListener("input", (e) => {
      const raw = cleanValue(e.target.value);
      if (isScientific(raw)) {
        alert(`Invalid input: ${raw}`);
        e.target.value = "";
        entries[activeTab][idx].calories = 0;
        return;
      }
      entries[activeTab][idx].calories = parseFloat(raw) || 0;
      renderTabs();
      if (calculated) updateOutput();
    });

    delBtn.addEventListener("click", () => {
      entries[activeTab].splice(idx, 1);
      renderEntries();
      renderTabs();
      if (calculated) updateOutput();
    });

    entryList.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Add entry ─────────────────────────────────────────────────────────────────
function addEntry() {
  entries[activeTab].push({ name: "", calories: 0 });
  renderEntries();
  renderTabs();
  // Focus the last name input
  const rows = entryList.querySelectorAll(".entry-row");
  if (rows.length)
    rows[rows.length - 1].querySelector('input[type="text"]').focus();
}

// ── Calculate ─────────────────────────────────────────────────────────────────
function calculateCalories(e) {
  if (e) e.preventDefault();

  const budget = parseFloat(cleanValue(budgetInput.value)) || 0;
  if (!budget) {
    budgetInput.focus();
    budgetInput.parentElement.style.borderColor = "var(--danger)";
    budgetInput.parentElement.style.boxShadow =
      "0 0 0 3px rgba(240,96,96,0.12)";
    setTimeout(() => {
      budgetInput.parentElement.style.borderColor = "";
      budgetInput.parentElement.style.boxShadow = "";
    }, 1600);
    return;
  }

  const breakfast = getTotal("breakfast");
  const lunch = getTotal("lunch");
  const dinner = getTotal("dinner");
  const snacks = getTotal("snacks");
  const exercise = getTotal("exercise");
  const consumed = breakfast + lunch + dinner + snacks;
  const remaining = budget - consumed + exercise;

  calculated = true;
  updateOutput({
    budget,
    consumed,
    exercise,
    remaining,
    breakfast,
    lunch,
    dinner,
    snacks,
  });
}

// ── Update output panel ───────────────────────────────────────────────────────
function updateOutput(data) {
  if (!data) {
    const budget = parseFloat(cleanValue(budgetInput.value)) || 0;
    const breakfast = getTotal("breakfast");
    const lunch = getTotal("lunch");
    const dinner = getTotal("dinner");
    const snacks = getTotal("snacks");
    const exercise = getTotal("exercise");
    const consumed = breakfast + lunch + dinner + snacks;
    const remaining = budget - consumed + exercise;
    data = {
      budget,
      consumed,
      exercise,
      remaining,
      breakfast,
      lunch,
      dinner,
      snacks,
    };
  }

  const {
    budget,
    consumed,
    exercise,
    remaining,
    breakfast,
    lunch,
    dinner,
    snacks,
  } = data;
  const isSurplus = remaining < 0;

  // Show results
  idleState.style.display = "none";
  resultsInner.style.display = "block";
  resultsInner.classList.remove("results-hidden");

  // Ring arc
  const pct = budget > 0 ? Math.min(Math.max(consumed / budget, 0), 1) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  ringArc.style.strokeDashoffset = offset;
  ringArc.style.stroke = isSurplus ? "var(--danger)" : "url(#ringGrad)";

  // Ring center text
  ringNumber.textContent = Math.abs(Math.round(remaining)).toLocaleString();
  ringSub.textContent = isSurplus ? "over budget" : "remaining";

  // Badge
  const absDiff = Math.abs(Math.round(remaining));
  ringBadge.textContent = isSurplus
    ? `🔴  ${absDiff.toLocaleString()} kcal Over`
    : `🟢  ${absDiff.toLocaleString()} kcal Left`;
  ringBadge.className = "ring-badge " + (isSurplus ? "surplus" : "deficit");

  // Output card border state
  outputCard.className =
    "output-card " + (isSurplus ? "surplus-state" : "deficit-state");

  // Stats
  statBudget.textContent = Math.round(budget).toLocaleString();
  statConsumed.textContent = Math.round(consumed).toLocaleString();
  statBurned.textContent = Math.round(exercise).toLocaleString();

  // Bars
  const meals = [
    { label: "Breakfast", val: breakfast, cat: "breakfast" },
    { label: "Lunch", val: lunch, cat: "lunch" },
    { label: "Dinner", val: dinner, cat: "dinner" },
    { label: "Snacks", val: snacks, cat: "snacks" },
    { label: "Exercise", val: exercise, cat: "exercise" },
  ];
  const maxVal = Math.max(...meals.map((m) => m.val), 1);

  mealBars.innerHTML =
    meals
      .filter((m) => m.val > 0)
      .map(
        (m) => `
      <div class="bar-item">
        <div class="bar-header">
          <span class="bar-name">${m.label}</span>
          <span class="bar-kcal">${Math.round(m.val).toLocaleString()} kcal</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${((m.val / maxVal) * 100).toFixed(1)}%;background:${CAT_COLOR[m.cat]};"></div>
        </div>
      </div>`,
      )
      .join("") ||
    `<p style="font-size:12px;color:var(--text-faint);text-align:center;padding:8px 0">No calories logged yet.</p>`;

  // Tip
  const tipEl = document.getElementById("tip-text");
  if (tipEl) tipEl.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];

  // Legacy output
  if (legacyOutput) {
    legacyOutput.innerHTML = `
      <span class="${isSurplus ? "surplus" : "deficit"}">
        ${Math.abs(Math.round(remaining))} Calorie ${isSurplus ? "Surplus" : "Deficit"}
      </span>
      <hr>
      <p>${Math.round(budget)} Calories Budgeted</p>
      <p>${Math.round(consumed)} Calories Consumed</p>
      <p>${Math.round(exercise)} Calories Burned</p>`;
  }
}

// ── Clear / Reset ─────────────────────────────────────────────────────────────
function clearForm() {
  CATEGORIES.forEach((cat) => {
    entries[cat] = [];
  });
  budgetInput.value = "";
  calculated = false;

  renderEntries();
  renderTabs();

  idleState.style.display = "flex";
  resultsInner.style.display = "none";
  resultsInner.classList.add("results-hidden");
  outputCard.className = "output-card";

  if (legacyOutput) {
    legacyOutput.innerHTML = "";
    legacyOutput.classList.add("hide");
  }
}

// ── Tab switching ─────────────────────────────────────────────────────────────
catTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.cat;
    renderTabs();
    renderEntries();
  });
});

// ── Event listeners ───────────────────────────────────────────────────────────
addBtn.addEventListener("click", addEntry);
form.addEventListener("submit", calculateCalories);
clearBtn.addEventListener("click", clearForm);

// ── Init ──────────────────────────────────────────────────────────────────────
renderTabs();
renderEntries();
