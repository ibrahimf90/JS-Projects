// ─── Validation Rules & Logic ────────────────────────────────────────────────

function validateForm() {
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const orderNo = document.getElementById('order-no').value.trim();
    const productCode = document.getElementById('product-code').value.trim();
    const quantity = document.getElementById('quantity').value;

    const complaints = document.querySelectorAll('#complaints-group input[type="checkbox"]');
    const otherComplaintChecked = document.getElementById('other-complaint').checked;
    const complaintDescription = document.getElementById('complaint-description').value.trim();

    const solutions = document.querySelectorAll('#solutions-group input[type="radio"]');
    const otherSolutionSelected = document.getElementById('other-solution').checked;
    const solutionDescription = document.getElementById('solution-description').value.trim();

    // Full name: not empty
    const fullNameValid = fullName.length > 0;

    // Email: basic valid email format
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Order number: exactly 10 digits starting with 2024
    const orderNoValid = /^2024\d{6}$/.test(orderNo);

    // Product code: XX##-X###-XX# (X = letter, # = digit)
    const productCodeValid = /^[A-Za-z]{2}\d{2}-[A-Za-z]\d{3}-[A-Za-z]{2}\d$/.test(productCode);

    // Quantity: positive integer
    const quantityValid = quantity !== '' && Number.isInteger(Number(quantity)) && Number(quantity) > 0;

    // At least one checkbox checked
    const anyChecked = Array.from(complaints).some(cb => cb.checked);

    // Complaint description: required only when "Other" is checked
    const complaintDescriptionValid = otherComplaintChecked
        ? complaintDescription.length >= 20
        : true;

    // At least one radio selected
    const anySolutionSelected = Array.from(solutions).some(r => r.checked);

    // Solution description: required only when "Other" radio is selected
    const solutionDescriptionValid = otherSolutionSelected
        ? solutionDescription.length >= 20
        : true;

    return {
        'full-name': fullNameValid,
        'email': emailValid,
        'order-no': orderNoValid,
        'product-code': productCodeValid,
        'quantity': quantityValid,
        'complaints-group': anyChecked,
        'complaint-description': complaintDescriptionValid,
        'solutions-group': anySolutionSelected,
        'solution-description': solutionDescriptionValid,
    };
}

function isValid(validationObj) {
    return Object.values(validationObj).every(v => v === true);
}

// ─── Visual State Appliers ───────────────────────────────────────────────────

const groupMap = {
    'full-name': () => document.getElementById('group-full-name'),
    'email': () => document.getElementById('group-email'),
    'order-no': () => document.getElementById('group-order-no'),
    'product-code': () => document.getElementById('group-product-code'),
    'quantity': () => document.getElementById('group-quantity'),
    'complaints-group': () => document.getElementById('complaints-group'),
    'complaint-description': () => document.getElementById('complaint-description-container'),
    'solutions-group': () => document.getElementById('solutions-group'),
    'solution-description': () => document.getElementById('solution-description-container'),
};

function setGroupStyle(key, valid) {
    const el = groupMap[key]();
    if (!el) return;
    if (valid) {
        el.classList.add('valid');
        el.classList.remove('invalid');
    } else {
        el.classList.add('invalid');
        el.classList.remove('valid');
    }
}

function applyValidationStyles(validationObj) {
    for (const [key, valid] of Object.entries(validationObj)) {
        setGroupStyle(key, valid);
    }
}

// ─── Change & Input Listeners (Instant Feedback) ─────────────────────────────

// Text, email, and number inputs (updates as user types)
['full-name', 'email', 'order-no', 'product-code', 'quantity'].forEach(id => {
    const el = document.getElementById(id);
    const triggerValidation = () => {
        const result = validateForm();
        setGroupStyle(id, result[id]);
    };
    el.addEventListener('input', triggerValidation);
    el.addEventListener('change', triggerValidation);
});

// Textareas (updates as user types)
document.getElementById('complaint-description').addEventListener('input', () => {
    const result = validateForm();
    setGroupStyle('complaint-description', result['complaint-description']);
});
document.getElementById('solution-description').addEventListener('input', () => {
    const result = validateForm();
    setGroupStyle('solution-description', result['solution-description']);
});

// Checkboxes — validate whole category card on toggle
document.querySelectorAll('#complaints-group input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const result = validateForm();
        setGroupStyle('complaints-group', result['complaints-group']);
        // Also re-validate description in case "Other" was toggled
        setGroupStyle('complaint-description', result['complaint-description']);
    });
});

// Radios — validate whole resolution card on toggle
document.querySelectorAll('#solutions-group input[type="radio"]').forEach(r => {
    r.addEventListener('change', () => {
        const result = validateForm();
        setGroupStyle('solutions-group', result['solutions-group']);
        // Also re-validate description in case "Other" was toggled
        setGroupStyle('solution-description', result['solution-description']);
    });
});

// ─── Controls & Forms Action handlers ───────────────────────────────────────

// Reset Form function
const clearBtn = document.getElementById('clear-btn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        // Reset HTML form
        document.getElementById('form').reset();
        
        // Remove all styling classes
        Object.keys(groupMap).forEach(key => {
            const container = groupMap[key]();
            if (container) {
                container.classList.remove('valid', 'invalid');
            }
        });

        // Hide support alert box
        const messageBox = document.getElementById('message-box');
        messageBox.className = '';
        messageBox.classList.remove('show');
        messageBox.innerHTML = '';
    });
}

// Form Submit Ticket Handler
document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const result = validateForm();
    applyValidationStyles(result);

    const messageBox = document.getElementById('message-box');

    if (isValid(result)) {
        messageBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Ticket submitted successfully. Support will contact you shortly.';
        messageBox.className = 'success show';
    } else {
        messageBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error. Please correct the highlighted sections.';
        messageBox.className = 'error show';
        
        // Find first invalid group and scroll to it smoothly
        const firstErrorKey = Object.keys(result).find(key => !result[key]);
        if (firstErrorKey) {
            const errEl = groupMap[firstErrorKey]();
            if (errEl) {
                errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
});