
const STORAGE_KEY = 'flowboard-v1';

export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return isValid(data) ? data : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function isValid(state) {
  if (
    !state ||
    !Array.isArray(state.columns) ||
    !Array.isArray(state.tasks)
  ) {
    return false;
  }

  const validColumns = state.columns.every(
    (column) =>
      column &&
      typeof column.id === 'string' &&
      typeof column.name === 'string'
  );

  const validTasks = state.tasks.every(
    (task) =>
      task &&
      typeof task.id === 'string' &&
      typeof task.columnId === 'string' &&
      typeof task.title === 'string'
  );

  if (!validColumns || !validTasks) return false;

  const ids = [
    ...state.columns.map((column) => column.id),
    ...state.tasks.map((task) => task.id)
  ];

  return new Set(ids).size === ids.length;
}
