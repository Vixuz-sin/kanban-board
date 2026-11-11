import assert from 'node:assert/strict';
import { addTask, editTask, removeTask, moveTask, shiftTask, isTask } from './logic.js';

let t = [];
t = addTask(t, 'todo', '  Write README  ', 'a');
t = addTask(t, 'todo', 'Fix bug', 'b');
t = addTask(t, 'doing', 'Deploy', 'c');
assert.deepEqual(t.map((x) => x.id), ['a', 'b', 'c']);
assert.equal(t[0].text, 'Write README');
assert.equal(addTask(t, 'todo', '   ', 'x'), t, 'empty text is ignored');
assert.equal(addTask(t, 'nope', 'x', 'x'), t, 'unknown column is ignored');
assert.equal(addTask([], 'todo', 'y'.repeat(500), 'z')[0].text.length, 200);

assert.equal(editTask(t, 'b', 'Fix login bug').find((x) => x.id === 'b').text, 'Fix login bug');
assert.equal(editTask(t, 'b', ''), t, 'empty edit is ignored');
assert.deepEqual(removeTask(t, 'a').map((x) => x.id), ['b', 'c']);

const moved = moveTask(t, 'b', 'doing', 'c');
assert.deepEqual(moved.map((x) => `${x.id}:${x.column}`), ['a:todo', 'b:doing', 'c:doing']);
assert.deepEqual(moveTask(t, 'a', 'done').map((x) => x.id), ['b', 'c', 'a']);
assert.equal(moveTask(t, 'a', 'todo', 'a'), t, 'drop on itself is a no-op');

assert.equal(shiftTask(t, 'a', 1).find((x) => x.id === 'a').column, 'doing');
assert.equal(shiftTask(t, 'a', -1), t, 'cannot move left of the first column');
assert.equal(shiftTask(t, 'missing', 1), t);
assert.equal(t.length, 3, 'original array is never mutated');

assert.ok(isTask({ id: '1', text: 'x', column: 'done' }));
assert.ok(!isTask({ id: 1, text: 'x', column: 'done' }));
assert.ok(!isTask(null));
console.log('kanban logic: all tests passed');
