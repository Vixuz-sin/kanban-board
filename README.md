# 📋 Kanban Board

A simple task board with three columns: To do, In progress and Done.

**Live demo:** https://kanban-board-eta-teal.vercel.app

## Features

- Add, edit (double-click) and delete tasks
- Drag and drop cards between columns and reorder them
- Arrow buttons to move cards, which also work with the keyboard and on phones
- Task counter for each column
- Saved automatically in your browser (localStorage)
- Light and dark mode, responsive layout

## Tech

Vanilla HTML, CSS and JavaScript (ES modules), no build step and no dependencies.
Board logic is kept in pure functions in `logic.js`, separate from the DOM code in `app.js`. Deployed on Vercel.

## Run locally

```bash
npx serve .
```

## Tests

```bash
node logic.test.mjs
```
