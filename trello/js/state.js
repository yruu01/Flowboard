
import { uid, clone, unique } from './utils.js';
import { load, save } from './storage.js';

const createInitialState = () => ({
  columns: [
    { id: uid(), name: 'To do' },
    { id: uid(), name: 'Doing' },
    { id: uid(), name: 'Done' }
  ],
  tasks: [],
  theme: 'dark'
});

let state = load() || createInitialState();

const undoStack = [];
const redoStack = [];
const listeners = [];

function sanitize(data) {
  const safeState = data && typeof data === 'object' ? data : {};
  const columns = Array.isArray(safeState.columns)
    ? safeState.columns.filter(
        (column) =>
          column &&
          typeof column.id === 'string' &&
          typeof column.name === 'string'
      )
    : [];

  const columnIds = new Set(columns.map((column) => column.id));

  const tasks = Array.isArray(safeState.tasks)
    ? safeState.tasks
        .filter(
          (task) =>
            task &&
            typeof task.id === 'string' &&
            columnIds.has(task.columnId)
        )
        .map((task) => ({
          ...task,
          tags: unique(Array.isArray(task.tags) ? task.tags : []),
          subtasks: Array.isArray(task.subtasks)
            ? task.subtasks
            : [],
          priority: ['low', 'medium', 'high'].includes(task.priority)
            ? task.priority
            : 'medium'
        }))
    : [];

  return {
    ...safeState,
    columns,
    tasks,
    theme: safeState.theme === 'light' ? 'light' : 'dark'
  };
}

state = sanitize(state);

function emit() {
  save(state);

  listeners.forEach((listener) => {
    listener(state);
  });
}

function checkpoint() {
  undoStack.push(clone(state));

  if (undoStack.length > 80) {
    undoStack.shift();
  }

  redoStack.length = 0;
}

export const store = {
  get() {
    return state;
  },

  subscribe(listener) {
    listeners.push(listener);
    listener(state);

    return () => {
      const index = listeners.indexOf(listener);

      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  },

  mutate(update) {
    checkpoint();
    update(state);
    state = sanitize(state);
    emit();
  },

  undo() {
    if (!undoStack.length) return;

    redoStack.push(clone(state));
    state = sanitize(undoStack.pop());
    emit();
  },

  redo() {
    if (!redoStack.length) return;

    undoStack.push(clone(state));
    state = sanitize(redoStack.pop());
    emit();
  },

  canUndo() {
    return undoStack.length > 0;
  },

  canRedo() {
    return redoStack.length > 0;
  }
};
