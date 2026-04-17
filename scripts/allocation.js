document.addEventListener('DOMContentLoaded', () => {
    
    // --- ROUTING LOGIC ---
    if (!StorageCore.isSetupComplete()) {
        window.location.href = 'index.html';
        return;
    }
    if (StorageCore.hasAllocations() && window.location.pathname.endsWith('allocation.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // --- ALLOCATION LOGIC ---
    const inputs = document.querySelectorAll('.alloc-val');
    const totalDiv = document.getElementById('total-check');
    const submitBtn = document.getElementById('submit-btn');
    const form = document.getElementById('allocation-form');

    function calculateTotal() {
        let total = 0;
        inputs.forEach(input => {
            total += parseInt(input.value) || 0;
        });

        totalDiv.innerText = `Total: ${total}%`;

        if (total === 100) {
            totalDiv.className = 'valid-total';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        } else {
            totalDiv.className = 'invalid-total';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    }

    // Attach listeners to update total in real time
    inputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    // Handle form submission
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const alloc = {
                Needs: parseInt(document.getElementById('needs').value) || 0,
                Wants: parseInt(document.getElementById('wants').value) || 0,
                Savings: parseInt(document.getElementById('savings').value) || 0,
                Investments: parseInt(document.getElementById('investments').value) || 0
            };

            StorageCore.saveAllocations(alloc);
            
            submitBtn.innerHTML = 'Saved! <span class="emoji-icon">🎯</span>';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }

    // Initial check
    calculateTotal();
});
