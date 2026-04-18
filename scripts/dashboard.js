document.addEventListener('DOMContentLoaded', () => {

    if (!StorageCore.isSetupComplete()) { window.location.href = 'index.html'; return; }
    if (!StorageCore.hasAllocations()) { window.location.href = 'allocation.html'; return; }

    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('scc_theme') === 'dark' && themeToggle) {
        themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('scc_theme', theme);
            if(spendingChart) {
                spendingChart.options.plugins.legend.labels.color = theme === 'dark' ? '#F8FAFC' : '#0F172A';
                spendingChart.update();
            }
        });
    }

    // --- SPA ROUTER SYSTEM ---
    const navItems = document.querySelectorAll('.nav-item, .nav-fab');
    const views = document.querySelectorAll('.spa-view');

    function navigateTo(targetId) {
        // Reset nav states
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const targetBtn = document.querySelector(`[data-target="${targetId}"]`);
        if (targetBtn && targetBtn.classList.contains('nav-item')) {
            targetBtn.classList.add('active');
        }
        // Force view switch immediately
        views.forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none'; // Force hide to kill any bugs
        });
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.style.display = 'block';
            // Allow frame reflow before adding animation class
            setTimeout(() => targetView.classList.add('active'), 10);
        }
        window.scrollTo(0,0);
    }

    navItems.forEach(btn => {
        btn.addEventListener('click', () => { navigateTo(btn.getAttribute('data-target')); });
    });

    const formatMoney = (amt) => '₹' + parseFloat(amt).toFixed(2);
    function showToast(msg, isError = false) {
        const toast = document.getElementById('app-toast');
        // Reset animation by cloning
        const newToast = toast.cloneNode(true);
        toast.parentNode.replaceChild(newToast, toast);
        
        newToast.className = 'toast' + (isError ? ' error' : '') + ' show';
        newToast.querySelector('#toast-msg').innerText = msg;
        newToast.querySelector('#toast-icon').innerText = isError ? '🚨' : '✅';
        
        setTimeout(() => newToast.classList.remove('show'), 3000);
    }

    let spendingChart = null;

    // --- THE SNARK AI DICTIONARY ---
    const snarkDictionary = {
        A: ["You're literally Warren Buffett.", "Flawless execution. Elon is taking notes.", "Ice cold financial discipline."],
        B: ["Looking good, but that coffee habit is risky.", "Solid. Just don't celebrate by buying useless stuff.", "On track. Stay focused."],
        C: ["You are approaching the Danger Zone.", "I hope you enjoy Cup Noodles.", "That math ain't mathing great."],
        D: ["Pack it up. We're broke.", "Your wallet is currently crying.", "Financial disaster detected. Lock your card."]
    };

    function renderApp() {
        const summary = StorageCore.getSummary();
        if (!summary) return;

        // Calculations & Dates
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysLeft = lastDay.getDate() - today.getDate() + 1;
        const todayStr = today.toISOString().split('T')[0];
        
        let spentToday = 0;
        summary.expenses.forEach(exp => {
            if (exp.date.startsWith(todayStr)) spentToday += exp.amount;
        });
        
        // Use netAllowance which has subscriptions pre-subtracted
        const safeDaily = summary.remainingBalance / Math.max(1, daysLeft);

        // Score Engine
        let score = 100;
        if (spentToday > safeDaily) score -= 15;
        const categories = ['Needs', 'Wants', 'Savings', 'Investments'];
        categories.forEach(cat => {
            if (summary.categoryTotals[cat] > summary.categoryLimits[cat]) score -= 20;
        });
        if (score < 30) score = 30;

        let grade = "A", gradeClass = "grade-A";
        if (score < 90) { grade = "B"; gradeClass = "grade-B"; }
        if (score < 75) { grade = "C"; gradeClass = "grade-C"; }
        if (score < 60) { grade = "D"; gradeClass = "grade-D"; }
        
        let snarkOptions = snarkDictionary[grade];
        let snarkTxt = snarkOptions[Math.floor(Math.random() * snarkOptions.length)];

        // 1. Home View Injection
        document.getElementById('home-balance').innerText = formatMoney(summary.remainingBalance);

        // Budget Overview Strip
        const spendPercent = summary.netAllowance > 0 ? Math.min((summary.totalSpent / summary.netAllowance) * 100, 100) : 0;
        document.getElementById('bo-allowance').innerText = formatMoney(summary.netAllowance);
        document.getElementById('bo-spent').innerText = formatMoney(summary.totalSpent);
        document.getElementById('bo-left').innerText = formatMoney(Math.max(summary.remainingBalance, 0));
        document.getElementById('bo-percent').innerText = Math.round(spendPercent) + '%';
        const progressBar = document.getElementById('bo-progress-bar');
        progressBar.style.width = spendPercent + '%';
        progressBar.style.background = spendPercent > 100 ? 'var(--danger)' : spendPercent > 80 ? 'var(--warning)' : 'var(--accent-primary)';

        const dailyPill = document.getElementById('home-daily-limit');
        if (spentToday > safeDaily && safeDaily > 0) {
            dailyPill.classList.add('danger');
            dailyPill.innerHTML = `<span>🚨 Today:</span><strong>${formatMoney(spentToday)}</strong>`;
            snarkTxt = "You blew the daily limit. No dessert."; // Specific override
        } else {
            dailyPill.classList.remove('danger');
            dailyPill.innerHTML = `<span>Daily Limit:</span><strong>${formatMoney(safeDaily)}</strong>`;
        }

        const hGrade = document.getElementById('health-grade');
        hGrade.className = `health-grade ${gradeClass}`;
        hGrade.innerText = grade;
        document.getElementById('health-title').innerText = `Score: ${score}/100`;
        document.getElementById('health-snark').innerText = `"${snarkTxt}"`;

        // 2. Savings Goal
        const goalWidget = document.getElementById('savings-widget');
        if (summary.savingsGoal) {
            const currentSavings = summary.categoryTotals['Savings'];
            const target = summary.savingsGoal.target;
            const perc = Math.min((currentSavings / target) * 100, 100);
            goalWidget.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.3rem;">
                    <div><span style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Goal</span><br><span style="font-weight: 700; font-size: 1.1rem;">${summary.savingsGoal.name}</span></div>
                    <div style="font-weight: 700;">${formatMoney(currentSavings)} <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-secondary);">/ ${formatMoney(target)}</span></div>
                </div>
                <div class="goal-bar-bg"><div class="goal-bar-fill" style="width: ${perc}%"></div></div>
                <button id="del-goal-btn" style="background:none; border:none; color:var(--danger); font-size: 0.8rem; cursor:pointer;">Clear Goal</button>
            `;
            document.getElementById('del-goal-btn').addEventListener('click', () => { StorageCore.setSavingsGoal(null, null); renderApp(); });
        } else {
            goalWidget.innerHTML = `
                <div style="text-align: center; padding: 1rem 0;">
                    <div style="margin-bottom: 0.5rem; color: var(--text-secondary);">Saving for something special?</div>
                    <form id="goal-form" style="display: flex; gap: 0.5rem;">
                        <input type="text" id="goal-name" class="input-flat" placeholder="MacBook" required style="padding: 0.5rem;">
                        <input type="number" id="goal-target" class="input-flat" placeholder="₹Target" required min="1" style="padding: 0.5rem; width: 40%;">
                        <button type="submit" class="btn-primary" style="padding: 0.5rem; width: auto;">Set</button>
                    </form>
                </div>
            `;
            document.getElementById('goal-form').addEventListener('submit', (e) => {
                e.preventDefault();
                StorageCore.setSavingsGoal(document.getElementById('goal-name').value, document.getElementById('goal-target').value);
                renderApp();
            });
        }

        // 3. Analytics & History Lists
        const sortedHistory = [...summary.expenses].sort((a,b) => new Date(b.date) - new Date(a.date));
        const buildHistoryHTML = (list, showDelete = false) => {
            if (list.length === 0) return `<div style="text-align:center; padding: 2rem 0; color: var(--text-secondary);">No transactions.</div>`;
            return list.map(exp => `
                <div class="history-item" id="exp-row-${exp.id}">
                    <div>
                        <div class="h-note">${exp.note}</div>
                        <div class="h-cat">${exp.category} • ${new Date(exp.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                    </div>
                    <div class="h-right">
                        <div class="h-amt" style="color: ${exp.category === 'Savings' || exp.category === 'Investments' ? 'var(--success)' : 'inherit'}">- ${formatMoney(exp.amount)}</div>
                        ${showDelete ? `<button class="del-exp-btn" onclick="deleteExpense('${exp.id}')" title="Delete">🗑</button>` : ''}
                    </div>
                </div>
            `).join('');
        };

        document.getElementById('mini-history').innerHTML = buildHistoryHTML(sortedHistory.slice(0, 3), false);
        const histCount = document.getElementById('history-count');
        if (histCount) histCount.innerText = sortedHistory.length + ' transaction' + (sortedHistory.length !== 1 ? 's' : '');
        document.getElementById('full-history-list').innerHTML = buildHistoryHTML(sortedHistory, true);

        // 4. Budget Limits Logic 
        const animGrid = document.getElementById('analytics-categories');
        animGrid.innerHTML = '';
        categories.forEach(cat => {
            const spent = summary.categoryTotals[cat];
            const limit = summary.categoryLimits[cat];
            let percent = (limit > 0) ? (spent / limit) * 100 : 0;
            let displayPerc = percent > 100 ? 100 : percent;
            
            let bgClass = 'background: var(--accent-primary)';
            if (percent > 85) bgClass = 'background: var(--warning)';
            if (percent > 100) bgClass = 'background: var(--danger)';

            animGrid.innerHTML += `
                <div class="card" style="padding: 1rem; border: none; background: rgba(0,0,0,0.02);">
                    <div class="stat-row">
                        <span style="font-weight:600;">${cat}</span>
                        <span style="color:var(--text-secondary); font-size:0.9rem;">${Math.round(percent)}%</span>
                    </div>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" style="width: ${displayPerc}%; ${bgClass}"></div>
                    </div>
                    <div class="stat-row" style="margin-top: 0.5rem; font-size: 0.85rem;">
                        <span style="color:var(--text-secondary);">Spent: ${formatMoney(spent)}</span>
                        <span>Bound: ${formatMoney(limit)}</span>
                    </div>
                </div>
            `;
        });

        // 5. Subscriptions Render
        document.getElementById('total-subs-text').innerText = formatMoney(summary.totalSubs) + " /mo deductions";
        const subsList = document.getElementById('subs-list');
        subsList.innerHTML = summary.subscriptions.length === 0 ? `<div style="font-size:0.85rem; color:var(--text-secondary); text-align:center;">No ghost taxes tracking.</div>` : '';
        summary.subscriptions.forEach(sub => {
            subsList.innerHTML += `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 0.5rem 0;">
                    <div style="font-weight: 500;">${sub.name}</div>
                    <div style="display:flex; gap: 1rem; align-items:center;">
                        <span style="font-weight: 700;">${formatMoney(sub.amount)}</span>
                        <button onclick="deleteSub('${sub.id}')" style="background:none; border:none; color:var(--danger); font-size:1.2rem; cursor:pointer;">×</button>
                    </div>
                </div>
            `;
        });

        updateChart(summary.categoryTotals);
    }
    
    // Global sub delete hook
    window.deleteSub = function(id) {
        StorageCore.deleteSubscription(id);
        renderApp();
    };

    // Global expense delete hook
    window.deleteExpense = function(id) {
        const row = document.getElementById('exp-row-' + id);
        if (row) row.style.opacity = '0';
        setTimeout(() => {
            StorageCore.deleteExpense(id);
            renderApp();
            showToast('Expense removed.');
        }, 300);
    };

    // CSV Export helper
    function exportCSV() {
        const data = StorageCore.getData();
        if (!data || data.expenses.length === 0) { showToast('No expenses to export.', true); return; }
        const rows = [['Date', 'Category', 'Note', 'Amount (₹)']];
        data.expenses.forEach(exp => {
            rows.push([new Date(exp.date).toLocaleString(), exp.category, `"${exp.note.replace(/"/g,'""')}"`, exp.amount.toFixed(2)]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV downloaded! 📊');
    }

    // Wire up CSV export buttons
    document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
    document.getElementById('export-csv-btn-settings')?.addEventListener('click', exportCSV);

    // Monthly Reset
    document.getElementById('reset-month-btn')?.addEventListener('click', () => {
        if (confirm('Reset all expenses for a new month? Your allocations and settings will stay.')) {
            StorageCore.resetMonthlyExpenses();
            showToast('New month started! 🎉');
            renderApp();
        }
    });

    function updateChart(totals) {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        const data = [totals.Needs, totals.Wants, totals.Savings, totals.Investments];
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const txtColor = isDark ? '#F8FAFC' : '#0F172A';

        if (spendingChart) {
            spendingChart.data.datasets[0].data = data;
            spendingChart.options.plugins.legend.labels.color = txtColor;
            spendingChart.update();
        } else {
            Chart.defaults.font.family = "'Outfit', sans-serif";
            spendingChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Needs', 'Wants', 'Savings', 'Investments'],
                    datasets: [{
                        data: data,
                        backgroundColor: ['#64748B', '#10B981', '#F59E0B', '#8B5CF6'], 
                        borderWidth: 0, hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: txtColor, padding: 20 } } },
                    cutout: '70%'
                }
            });
        }
    }

    // --- FORM EVENTS ---
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const amt = parseFloat(document.getElementById('exp-amount').value);
            const cat = document.getElementById('exp-category').value;
            const note = document.getElementById('exp-note').value;

            StorageCore.addExpense(amt, cat, note);
            expenseForm.reset();
            
            // Re-calc everything silently
            renderApp();

            // Flash toast and instantly route
            showToast("Logged successfully! ✅");
            navigateTo('view-home');
        });
    }

    const subsForm = document.getElementById('subs-form');
    if (subsForm) {
        subsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            StorageCore.addSubscription(document.getElementById('sub-name').value, document.getElementById('sub-amt').value);
            subsForm.reset();
            renderApp();
        });
    }

    document.getElementById('reset-btn')?.addEventListener('click', () => {
        if(confirm("Factory reset app? This will wipe everything!")) {
            StorageCore.resetData();
            window.location.href = 'index.html';
        }
    });

    renderApp();
});
