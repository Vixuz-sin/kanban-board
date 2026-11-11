// Pure board logic: every function returns a new tasks array, never mutates.
export const COLUMNS = ['todo', 'doing', 'done'];
export const MAX_LENGTH = 200;

const clean = (text) => String(text ?? '').trim().slice(0, MAX_LENGTH);

export const isTask = (t) =>
  t && typeof t.id === 'string' && typeof t.text === 'string' && COLUMNS.includes(t.column);

export function addTask(tasks, column, text, id = crypto.randomUUID()) {
  const value = clean(text);
  if (!value || !COLUMNS.includes(column)) return tasks;
  return [...tasks, { id, text: value, column }];
}

export function editTask(tasks, id, text) {
  const value = clean(text);
  if (!value) return tasks;
  return tasks.map((t) => (t.id === id ? { ...t, text: value } : t));
}

export const removeTask = (tasks, id) => tasks.filter((t) => t.id !== id);

// Move a task to `column`, placed before `beforeId` (or at the end of the column).
export function moveTask(tasks, id, column, beforeId = null) {
  const task = tasks.find((t) => t.id === id);
  if (!task || !COLUMNS.includes(column) || id === beforeId) return tasks;
  const rest = tasks.filter((t) => t.id !== id);
  const moved = { ...task, column };
  const i = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
  return i === -1 ? [...rest, moved] : [...rest.slice(0, i), moved, ...rest.slice(i)];
}

// Move one column left (-1) or right (+1).
export function shiftTask(tasks, id, dir) {
  const task = tasks.find((t) => t.id === id);
  const column = task && COLUMNS[COLUMNS.indexOf(task.column) + dir];
  return column ? moveTask(tasks, id, column) : tasks;
}
