
import { store } from './state.js';
import { render } from './ui.js';
import { setupModals } from './modals.js';
import { bindDrag } from './dragdrop.js';
import { shortcuts } from './shortcuts.js';
import { uid } from './utils.js';

const board = document.querySelector('#board');
const search = document.querySelector('#search');
const filter = document.querySelector('#filterPriority');
const colDialog = document.querySelector('#columnDialog');

const taskModal = setupModals(store);

const paint = (state) => {
  document.documentElement.dataset.theme = state.theme || 'dark';

  render(board, state, search.value, filter.value);

  undoBtn.disabled = !store.canUndo();
  redoBtn.disabled = !store.canRedo();
};

store.subscribe(paint);

search.oninput = () => paint(store.get());
filter.onchange = () => paint(store.get());

undoBtn.onclick = () => store.undo();
redoBtn.onclick = () => store.redo();

themeBtn.onclick = () => {
  store.mutate((state) => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
  });
};

addColumnBtn.onclick = () => {
  columnName.value = '';
  colDialog.showModal();
  columnName.focus();
};

columnForm.onsubmit = (event) => {
  event.preventDefault();

  if (event.submitter?.value !== 'save') return;

  const name = columnName.value.trim();

  if (!name) return;

  store.mutate((state) => {
    state.columns.push({
      id: uid(),
      name
    });
  });

  colDialog.close();
};

board.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-task');

  if (addButton) {
    taskModal.open(addButton.dataset.column);
    return;
  }

  const card = event.target.closest('.card');

  if (card && !event.target.matches('input')) {
    taskModal.open('', card.dataset.id);
    return;
  }

  const deleteButton = event.target.closest('.delete-column');

  if (!deleteButton) return;

  const column = deleteButton.closest('.column');
  const columnId = column.dataset.id;

  if (!confirm('Delete this column and all its tasks?')) return;

  store.mutate((state) => {
    state.columns = state.columns.filter(
      (item) => item.id !== columnId
    );

    state.tasks = state.tasks.filter(
      (task) => task.columnId !== columnId
    );
  });
});

board.addEventListener('change', (event) => {
  if (!event.target.matches('[data-subtask]')) return;

  const card = event.target.closest('.card');
  const index = Number(event.target.dataset.subtask);

  store.mutate((state) => {
    const task = state.tasks.find(
      (item) => item.id === card.dataset.id
    );

    if (task?.subtasks[index]) {
      task.subtasks[index].done = event.target.checked;
    }
  });
});

bindDrag(board, (taskId, columnId) => {
  store.mutate((state) => {
    const task = state.tasks.find(
      (item) => item.id === taskId
    );

    if (task) {
      task.columnId = columnId;
    }
  });
});

shortcuts(store);
