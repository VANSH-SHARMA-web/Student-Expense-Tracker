# Student Cash Coach 💸

A professional, mobile-first, serverless fintech web application built to help college students manage their funds intelligently.

Built as a lightweight **Single Page Application (SPA)** utilizing rigorous Vanilla JavaScript and `LocalStorage`—proving that you don't need heavy frameworks to build a "Stripe-like", professional UX.

---

## 🚀 Features (Stage 3 Pro MVP)

* **Intelligent Subscriptions (Ghost Tax)**: Safely map recurring expenses like Netflix or Spotify. The system actively extracts these hidden costs from your gross allowance to show you your true, net daily spending limits.
* **Smart Budget Pacing**: Enter a monthly pocket money limit, dynamically divide it by percentages (Needs, Wants, Savings, Investments), and track exact utilization against an automatic "Safe Daily Limit".
* **Sassy AI Financial Coach**: Uses an automatic algorithmic grading engine (Score 1-100) to give you a dynamic grade of your financial health. Includes sarcastic/fun coaching tips if you overspend!
* **Automated Savings Goals**: Saving up for a MacBook? Put the amount in, and every rupee you log under the "Savings" category auto-fills a dynamic progress bar for your specific item.
* **Built in Light/Dark Mode**: Integrated iOS-style toggle. The entire application instantly swaps themes while keeping the underlying contrast ratios and Chart.js coloring flawlessly consistent. 

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: Semantic HTML5 & Vanilla Javascript (ES6+).
- **Styling**: Pure CSS (No Tailwind/Bootstrap dependencies) utilizing CSS Custom Properties (variables) for theme management.
- **State Management**: Zero-dependency `StorageCore` engine caching a persistent NoSQL-style JSON object to the browser's native `LocalStorage`.
- **Analytics Visualization**: `Chart.js` via CDN for performant doughnut rendering.
- **Layout Approach**: CSS Grid & Flexbox simulating a native mobile app view on desktop sizes using a constrained `.app-wrapper`.

## 📂 File Structure

```text
student-expense-tracker/
│
├── index.html            # Startup Setup Router
├── allocation.html       # 100% Budget Division UI
├── dashboard.html        # The SPA Core Hub
│
├── styles/               
│   ├── base.css          # CSS Variables (Light/Dark mode palettes)
│   ├── layout.css        # Symmetrical App Wrappers & Bottom Nav Grid
│   └── components.css    # Flat inputs, toggles, health badges, toasts
│
└── scripts/              
    ├── app.js            # Initial flow logic
    ├── allocation.js     # Form validation engine (must = 100%)
    ├── dashboard.js      # SPA Router, Math engine, and DOM painters
    └── storage.js        # Relational-style 'DB' handling wrapper
```

## 🏃‍♂️ How to Run Locally

You do not need a server to run this MVP! It is entirely client-side.
1. Clone the repository.
2. Open `index.html` in any browser or run it via VS Code's "Live Server" extension.
3. Start planning your runway!

*(Note: If testing on a desktop, the application locks into a strict 400px mobile-aspect window frame simulating a real mobile App).*
