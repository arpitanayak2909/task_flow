# TaskFlow ⚡

A modern, high-performance, and responsive task workflow management web application built with vanilla **HTML5**, **CSS3**, and **JavaScript**.

---

## ✨ Features

- **🚀 Add & Edit Tasks**: Create tasks with titles, rich notes/descriptions, priority levels (Urgent, High, Medium, Low), tags/categories, and due dates.
- **📊 Kanban & List Views**: Seamlessly switch between a visual Kanban workflow board (To Do, In Progress, Completed) and a structured table List View.
- **🎯 Drag & Drop Stages**: Drag task cards directly across stages or use one-click stage shift buttons.
- **🔍 Real-Time Search & Filtering**: Instant keyword search combined with priority and category dropdown filters.
- **📈 Dynamic Progress Tracking**: Real-time progress bar indicator and quick stats summarizing completed vs pending tasks.
- **🌓 Dark & Light Modes**: Sleek glassmorphism theme with smooth ambient glow and instant theme toggle.
- **💾 LocalStorage Persistence**: All your tasks and theme preferences remain safely saved in the browser.
- **⌨️ Keyboard Shortcuts**: Press <kbd>N</kbd> anywhere to quickly open the task creation dialog, and <kbd>Esc</kbd> to close.

---

## 📁 Project Structure

```
task_flow/
├── index.html     # Semantic markup and accessible modal dialogs
├── style.css      # Vanilla CSS design system, glassmorphism, responsive grid
├── app.js         # State management, LocalStorage, drag-and-drop, UI controllers
└── README.md      # Documentation and overview
```

---

## 🚀 How to Run

No complicated build steps or node dependencies needed!

1. Open `index.html` directly in any modern web browser (e.g., Chrome, Edge, Firefox, Safari).
2. Alternatively, serve using any lightweight static server:
   ```bash
   # Using Python 3
   python -m http.server 3000
   
   # Or using npx serve
   npx serve .
   ```
3. Open `http://localhost:3000` in your browser.
