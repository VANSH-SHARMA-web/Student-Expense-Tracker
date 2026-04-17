/**
 * Data Layer (Model)
 */
const StorageCore = {
    DB_KEY: 'studentExpenseData',

    saveSetup: function(amount) {
        const data = {
            monthlyAllowance: parseFloat(amount),
            setupDate: new Date().toISOString(),
            allocations: null, 
            expenses: [], 
            subscriptions: [], // { id, name, amount }
            savingsGoal: null  // { name, target }
        };
        localStorage.setItem(this.DB_KEY, JSON.stringify(data));
    },

    getData: function() {
        const stored = localStorage.getItem(this.DB_KEY);
        // Backwards compatibility for accounts made before Stage 3 feature
        let data = stored ? JSON.parse(stored) : null;
        if (data) {
            if (!data.subscriptions) data.subscriptions = [];
            if (!data.savingsGoal) data.savingsGoal = null;
        }
        return data;
    },

    isSetupComplete: function() { return this.getData() !== null; },

    saveAllocations: function(allocMapping) {
        const data = this.getData();
        if (data) {
            data.allocations = allocMapping;
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        }
    },
    hasAllocations: function() { return this.getData()?.allocations != null; },

    addExpense: function(amount, category, note) {
        const data = this.getData();
        if (data) {
            data.expenses.push({ id: Date.now().toString(), amount: parseFloat(amount), category: category, note: note, date: new Date().toISOString() });
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        }
    },

    addSubscription: function(name, amount) {
        const data = this.getData();
        if (data) {
            data.subscriptions.push({ id: Date.now().toString(), name: name, amount: parseFloat(amount) });
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        }
    },
    
    deleteSubscription: function(id) {
        const data = this.getData();
        if (data) {
            data.subscriptions = data.subscriptions.filter(s => s.id !== id);
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        }
    },

    setSavingsGoal: function(name, target) {
        const data = this.getData();
        if (data) {
            data.savingsGoal = { name: name, target: parseFloat(target) };
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        }
    },

    resetData: function() { localStorage.removeItem(this.DB_KEY); },

    getSummary: function() {
        const data = this.getData();
        if (!data) return null;

        // 1. Calculate Subscriptions (Ghost Tax)
        let totalSubs = 0;
        data.subscriptions.forEach(s => totalSubs += s.amount);

        // Net Allowance is what we base limits on, after subscriptions.
        let netAllowance = data.monthlyAllowance - totalSubs;
        if (netAllowance < 0) netAllowance = 0; // Edge case protection

        let totalSpent = 0;
        let categoryTotals = { Needs: 0, Wants: 0, Savings: 0, Investments: 0 };

        data.expenses.forEach(exp => {
            totalSpent += exp.amount;
            if(categoryTotals[exp.category] !== undefined) categoryTotals[exp.category] += exp.amount;
        });

        let categoryLimits = { Needs: 0, Wants: 0, Savings: 0, Investments: 0 };
        if (data.allocations) {
            for (let cat in data.allocations) {
                categoryLimits[cat] = (data.allocations[cat] / 100) * netAllowance;
            }
        }

        return {
            rawAllowance: data.monthlyAllowance,
            netAllowance: netAllowance,
            totalSubs: totalSubs,
            totalSpent: totalSpent,
            remainingBalance: netAllowance - totalSpent,
            categoryTotals: categoryTotals,
            categoryLimits: categoryLimits,
            expenses: data.expenses,
            subscriptions: data.subscriptions,
            savingsGoal: data.savingsGoal
        };
    }
};
