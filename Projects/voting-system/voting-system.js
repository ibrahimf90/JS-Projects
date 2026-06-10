// Initialize the poll variable to a new Map object
const poll = new Map();

// UI Elements
const optionInput = document.getElementById('option-input');
const addOptionBtn = document.getElementById('add-option-btn');
const optionSelect = document.getElementById('option-select');
const voterIdInput = document.getElementById('voter-id-input');
const voteBtn = document.getElementById('vote-btn');
const rawResultsDisplay = document.getElementById('raw-results');
const refreshResultsBtn = document.getElementById('refresh-results-btn');
const statusMessage = document.getElementById('status-message');

/**
 * Updates the dropdown and results display
 */
function updateUI() {
    // Update Select Options
    const currentValue = optionSelect.value;
    optionSelect.innerHTML = '<option value="" disabled selected>Select an option</option>';
    poll.forEach((_, option) => {
        const optEl = document.createElement('option');
        optEl.value = option;
        optEl.textContent = option;
        optionSelect.appendChild(optEl);
    });
    optionSelect.value = currentValue;

    // Update Results Display
    rawResultsDisplay.textContent = displayResults();
}

function showStatus(msg, isError = false) {
    statusMessage.textContent = msg;
    statusMessage.style.color = isError ? '#ff4b2b' : '#00d2ff';
    setTimeout(() => {
        statusMessage.textContent = "System Online";
        statusMessage.style.color = "#666";
    }, 3000);
}

/**
 * Adds an option to the poll.
 */
function addOption(option) {
    if (!option || option.trim() === "") {
        return "Option cannot be empty.";
    }

    if (poll.has(option)) {
        return `Option "${option}" already exists.`;
    }

    poll.set(option, new Set());
    updateUI();
    return `Option "${option}" added to the poll.`;
}

/**
 * Registers a vote for a specific option.
 */
function vote(option, voterId) {
    if (!poll.has(option)) {
        return `Option "${option}" does not exist.`;
    }

    if (!voterId || voterId.trim() === "") {
        return "Voter ID cannot be empty.";
    }

    const voters = poll.get(option);

    if (voters.has(voterId)) {
        return `Voter ${voterId} has already voted for "${option}".`;
    }

    voters.add(voterId);
    updateUI();
    return `Voter ${voterId} voted for "${option}".`;
}

/**
 * Returns the poll results in a formatted string.
 */
function displayResults() {
    if (poll.size === 0) return "No options added yet.";
    let results = "Poll Results:\n";
    poll.forEach((voters, option) => {
        results += `${option}: ${voters.size} votes\n`;
    });
    return results.trim();
}

// Event Listeners
addOptionBtn.addEventListener('click', () => {
    const option = optionInput.value;
    const msg = addOption(option);
    showStatus(msg, msg.includes("already") || msg.includes("empty"));
    optionInput.value = "";
});

voteBtn.addEventListener('click', () => {
    const option = optionSelect.value;
    const voterId = voterIdInput.value;
    const msg = vote(option, voterId);
    showStatus(msg, msg.includes("does not") || msg.includes("already") || msg.includes("empty"));
    voterIdInput.value = "";
});

refreshResultsBtn.addEventListener('click', () => {
    updateUI();
    showStatus("Results refreshed");
});

// Initializing the poll with at least three options
addOption("Turkey");
addOption("Morocco");
addOption("Germany");
addOption("Lebanon");

// Initial UI Update
updateUI();

// Export for potential testing
if (typeof module !== 'undefined') {
    module.exports = { poll, addOption, vote, displayResults };
}
