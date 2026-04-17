/**
 * Controller Layer
 * Handles Routing and UI Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ROUTING LOGIC ---
    // If the user has already set up their account, we don't want them on the index.html page.
    const currentPage = window.location.pathname;
    
    // Simple check: if they are set up and on index.html, send them to dashboard.
    // (We'll refine this "monthly reset" logic in Stage 3, for now we just check if they have a profile).
    if (StorageCore.isSetupComplete() && (currentPage.endsWith('index.html') || currentPage.endsWith('/'))) {
        window.location.href = 'allocation.html'; // We will build allocation.html next!
        return; // Stop executing further script on this page
    }


    // --- 2. SETUP PAGE LOGIC (index.html) ---
    const setupForm = document.getElementById('setup-form');
    
    if (setupForm) {
        setupForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page refresh
            
            const amountInput = document.getElementById('pocket-money');
            const amount = parseFloat(amountInput.value);

            if (amount && amount > 0) {
                // Save it to our LocalStorage "database"
                StorageCore.saveSetup(amount);
                
                // Add a small visual feedback before redirecting
                const btn = setupForm.querySelector('button');
                btn.innerHTML = 'Saved! <span class="emoji-icon">🚀</span>';
                
                // Redirect to the Budget Division page after a brief pause
                setTimeout(() => {
                    // This will fail right now because we haven't built allocation.html, but that's our next step!
                    window.location.href = 'allocation.html'; 
                }, 800);
            }
        });
    }
});
