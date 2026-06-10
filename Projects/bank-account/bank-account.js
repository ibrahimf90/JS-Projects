class BankAccount {
    constructor() {
        this.balance = 0;
        this.transactions = [];
    }

    deposit(amount, description = "") {
        if (amount > 0) {
            this.transactions.push({ 
                type: 'deposit', 
                amount: amount, 
                description: description || "Deposit",
                date: new Date() 
            });
            this.balance += amount;
            return {
                success: true,
                message: `Successfully deposited $${amount.toFixed(2)}. New balance: $${this.balance.toFixed(2)}`
            };
        } else {
            return {
                success: false,
                message: "Deposit amount must be greater than zero."
            };
        }
    }

    withdraw(amount, description = "") {
        if (amount > 0 && amount <= this.balance) {
            this.transactions.push({ 
                type: 'withdraw', 
                amount: amount, 
                description: description || "Withdrawal",
                date: new Date() 
            });
            this.balance -= amount;
            return {
                success: true,
                message: `Successfully withdrew $${amount.toFixed(2)}. New balance: $${this.balance.toFixed(2)}`
            };
        } else {
            return {
                success: false,
                message: "Insufficient balance or invalid amount."
            };
        }
    }

    checkBalance() {
        return `Current balance: $${this.balance.toFixed(2)}`;
    }

    listAllDeposits() {
        const deposits = this.transactions
            .filter(t => t.type === 'deposit')
            .map(t => t.amount);
        return `Deposits: ${deposits.join(',')}`;
    }

    listAllWithdrawals() {
        const withdrawals = this.transactions
            .filter(t => t.type === 'withdraw')
            .map(t => t.amount);
        return `Withdrawals: ${withdrawals.join(',')}`;
    }
}

// UI Controller
const myAccount = new BankAccount();

// DOM Elements
const balanceDisplay = document.getElementById('balanceDisplay');
const amountInput = document.getElementById('amountInput');
const descInput = document.getElementById('descInput');
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const statusMsg = document.getElementById('statusMsg');
const historyList = document.getElementById('historyList');
const transactionCount = document.getElementById('transactionCount');

function updateUI(result = null) {
    // Update Balance
    balanceDisplay.textContent = `$${myAccount.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Update Transaction List
    historyList.innerHTML = '';
    if (myAccount.transactions.length === 0) {
        historyList.innerHTML = `
            <li class="transaction-item" style="justify-content: center; opacity: 0.5;">
                <span>No recent activity</span>
            </li>
        `;
    } else {
        myAccount.transactions.slice().reverse().forEach(t => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            
            const dateStr = t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            li.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <div>
                        <span class="type-tag type-${t.type}">${t.type}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">${dateStr}</span>
                    </div>
                    <span style="font-size: 0.875rem; color: var(--text-main);">${t.description}</span>
                </div>
                <span class="amount">${t.type === 'withdraw' ? '-' : '+'}$${t.amount.toFixed(2)}</span>
            `;
            historyList.appendChild(li);
        });
    }

    // Update Count
    transactionCount.textContent = `${myAccount.transactions.length} Transactions`;

    // Handle Status Message
    if (result) {
        statusMsg.textContent = result.message;
        statusMsg.className = result.success ? 'success' : 'error';
        
        // Hide message after 4 seconds
        setTimeout(() => {
            statusMsg.className = '';
            statusMsg.textContent = '';
        }, 4000);
    }
}

// Event Listeners
depositBtn.addEventListener('click', () => {
    const val = parseFloat(amountInput.value);
    const desc = descInput.value.trim();
    
    if (!val || val <= 0 || !desc) {
        updateUI({ success: false, message: "Both amount and description are required." });
        return;
    }

    const result = myAccount.deposit(val, desc);
    if (result.success) {
        amountInput.value = '';
        descInput.value = '';
    }
    updateUI(result);
});

withdrawBtn.addEventListener('click', () => {
    const val = parseFloat(amountInput.value);
    const desc = descInput.value.trim();
    
    if (!val || val <= 0 || !desc) {
        updateUI({ success: false, message: "Both amount and description are required." });
        return;
    }

    const result = myAccount.withdraw(val, desc);
    if (result.success) {
        amountInput.value = '';
        descInput.value = '';
    }
    updateUI(result);
});

// Initialize UI
updateUI();
