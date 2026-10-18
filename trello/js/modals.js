
import { uid } from './utils.js';

export function setupModals(store) {
  const dialog = document.querySelector('#taskDialog');
  const form = document.querySelector('#taskForm');
  const deleteButton = document.querySelector('#deleteTaskBtn');

  const taskId = document.querySelector('#taskId');
  const taskColumn = document.querySelector('#taskColumn');
  const title = document.querySelector('#title');
  const description = document.querySelector('#description');
  const priority = document.querySelector('#priority');
  const due = document.querySelector('#due');
  const tags = document.querySelector('#tags');
  const subtasks = document.querySelector('#subtasks');

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.onclick = () => button.closest('dialog').close();
  });

  function open(columnId, id = '') {
    const task = id
      ? store.get().tasks.find((item) => item.id === id)
      : null;

    taskId.value = task?.id || '';
    taskColumn.value = task?.columnId || columnId;
    title.value = task?.title || '';
    description.value = task?.description || '';
    priority.value = task?.priority || 'medium';
    due.value = task?.due || '';
    tags.value = (task?.tags || []).join(', ');
    subtasks.value = (task?.subtasks || [])
      .map((item) => item.text)
      .join('\n');

    deleteButton.style.visibility = task ? 'visible' : 'hidden';

    dialog.showModal();
    title.focus();
  }

  form.addEventListener('submit', (event) => {
    if (event.submitter?.value !== 'save') return;

    event.preventDefault();

    const id = taskId.value;

    store.mutate((state) => {
      const existingTask = state.tasks.find(
        (task) => task.id === id
      );

      const data = {
        title: title.value.trim(),
        description: description.value.trim(),
        priority: priority.value,
        due: due.value,
        tags: tags.value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        subtasks: subtasks.value
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean)
          .map((text, index) => ({
            text,
            done:
              existingTask?.subtasks?.[index]?.text === text
                ? existingTask.subtasks[index].done
                : false
          }))
      };

      if (existingTask) {
        Object.assign(existingTask, data);
      } else {
        state.tasks.push({
          id: uid(),
          columnId: taskColumn.value,
          ...data
        });
      }
    });

    dialog.close();
  });

  deleteButton.onclick = () => {
    const id = taskId.value;

    if (!id || !confirm('Delete this task?')) return;

    store.mutate((state) => {
      state.tasks = state.tasks.filter(
        (task) => task.id !== id
      );
    });

    dialog.close();
  };

  return { open };
}
