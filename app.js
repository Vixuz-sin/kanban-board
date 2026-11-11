import { COLUMNS, MAX_LENGTH, isTask, addTask, editTask, removeTask, moveTask, shiftTask } from './logic.js';

const KEY = 'kanban-board-v1';
const TITLES = { todo: 'To do', doing: 'In progress', done: 'Done' };
const SAMPLE = [
  { id: 's1', text: 'Drag me to “In progress”', column: 'todo' },
  { id: 's2', text: 'Double-click a card to edit it', column: 'todo' },
  { id: 's3', text: 'Build a kanban board', column: 'doing' },
  { id: 's4', text: 'Open the app', column: 'done' },
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved.filter(isTask);
  } catch {}
  return SAMPLE;
}

let tasks = load();
const board = document.getElementById('board');

function commit(next, focus) {
  tasks = next;
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {}
  render();
  if (focus) board.querySelector(focus)?.focus();
}

// Columns are built once; only their lists re-render.
board.innerHTML = COLUMNS.map((col) => `
  <section class="column" data-column="${col}" aria-labelledby="h-${col}">
    <div class="column-head"><h2 id="h-${col}">${TITLES[col]}</h2><span class="count" aria-label="tasks"></span></div>
    <ul class="list"></ul>
    <form class="add">
      <label class="sr-only" for="add-${col}">New task in ${TITLES[col]}</label>
      <input id="add-${col}" placeholder="Add a task…" maxlength="${MAX_LENGTH}" autocomplete="off">
      <button type="submit" aria-label="Add task to ${TITLES[col]}">+</button>
    </form>
  </section>`).join('');

function cardEl(task, colIndex) {
  const li = document.createElement('li');
  li.className = 'card';
  li.draggable = true;
  li.dataset.id = task.id;
  li.innerHTML = `
    <p class="text"></p>
    <div class="actions">
      <button type="button" data-act="left" aria-label="Move to previous column" ${colIndex === 0 ? 'disabled' : ''}>←</button>
      <button type="button" data-act="right" aria-label="Move to next column" ${colIndex === COLUMNS.length - 1 ? 'disabled' : ''}>→</button>
      <span class="spacer"></span>
      <button type="button" data-act="edit" aria-label="Edit task">✎</button>
      <button type="button" data-act="delete" aria-label="Delete task">✕</button>
    </div>`;
  li.querySelector('.text').textContent = task.text;
  return li;
}

function render() {
  COLUMNS.forEach((col, i) => {
    const section = board.querySelector(`[data-column="${col}"]`);
    const items = tasks.filter((t) => t.column === col);
    section.querySelector('.list').replaceChildren(...items.map((t) => cardEl(t, i)));
    section.querySelector('.count').textContent = items.length;
  });
}

function startEdit(card) {
  const text = card.querySelector('.text');
  const original = text.textContent;
  text.contentEditable = 'true';
  card.draggable = false;
  text.focus();
  getSelection().selectAllChildren(text);
  const finish = (save) => {
    text.removeEventListener('keydown', onKey);
    text.contentEditable = 'false';
    card.draggable = true;
    if (save && text.textContent.trim() !== original) commit(editTask(tasks, card.dataset.id, text.textContent));
    else text.textContent = original;
  };
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); text.blur(); }
    if (e.key === 'Escape') { finish(false); text.blur(); }
  };
  text.addEventListener('keydown', onKey);
  text.addEventListener('blur', () => { if (text.isContentEditable) finish(true); }, { once: true });
}

board.addEventListener('submit', (e) => {
  e.preventDefault();
  const col = e.target.closest('.column').dataset.column;
  const input = e.target.querySelector('input');
  commit(addTask(tasks, col, input.value), `#add-${col}`);
  input.value = '';
});

board.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const card = btn.closest('.card');
  const id = card.dataset.id;
  const sel = (act) => `[data-id="${id}"] [data-act="${act}"]`;
  switch (btn.dataset.act) {
    case 'left': return commit(shiftTask(tasks, id, -1), `${sel('left')}:not(:disabled), ${sel('right')}`);
    case 'right': return commit(shiftTask(tasks, id, 1), `${sel('right')}:not(:disabled), ${sel('left')}`);
    case 'edit': return startEdit(card);
    case 'delete': return commit(removeTask(tasks, id), `#add-${card.closest('.column').dataset.column}`);
  }
});

board.addEventListener('dblclick', (e) => {
  const card = e.target.closest('.card');
  if (card && !e.target.closest('button')) startEdit(card);
});

// Drag and drop
board.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  e.dataTransfer.setData('text/plain', card.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  card.classList.add('dragging');
});
board.addEventListener('dragend', (e) => e.target.closest?.('.card')?.classList.remove('dragging'));
board.addEventListener('dragover', (e) => {
  const column = e.target.closest('.column');
  if (!column) return;
  e.preventDefault();
  board.querySelectorAll('.column.over').forEach((c) => c !== column && c.classList.remove('over'));
  column.classList.add('over');
});
board.addEventListener('dragleave', (e) => {
  const column = e.target.closest('.column');
  if (column && !column.contains(e.relatedTarget)) column.classList.remove('over');
});
board.addEventListener('drop', (e) => {
  const column = e.target.closest('.column');
  if (!column) return;
  e.preventDefault();
  column.classList.remove('over');
  const id = e.dataTransfer.getData('text/plain');
  const before = [...column.querySelectorAll('.card:not(.dragging)')].find((c) => {
    const r = c.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  });
  commit(moveTask(tasks, id, column.dataset.column, before?.dataset.id ?? null));
});

render();
