
import { esc } from './utils.js';

export function render(board, state, query = '', priority = '') {
  const searchTerm = query.trim().toLowerCase();

  board.innerHTML = state.columns.map((column) => {
    const tasks = state.tasks.filter((task) => {
      const matchesColumn = task.columnId === column.id;
      const matchesPriority = !priority || task.priority === priority;
      const searchableText = [
        task.title,
        task.description || '',
        ...(Array.isArray(task.tags) ? task.tags : [])
      ].join(' ').toLowerCase();
      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

      return matchesColumn && matchesPriority && matchesSearch;
    });

    return `
      <section class="column" data-id="${esc(column.id)}">
        <div class="column-head">
          <span class="column-title">${esc(column.name)}</span>
          <span class="count">${tasks.length}</span>
          <button class="icon delete-column" title="Delete column">⋯</button>
        </div>
        <div class="cards" data-column="${esc(column.id)}">
          ${tasks.map(card).join('')}
        </div>
        <button class="add-task" data-column="${esc(column.id)}">+ Add task</button>
      </section>
    `;
  }).join('');
}

function card(task) {
  const tags = Array.isArray(task.tags) ? task.tags : [];
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const completed = subtasks.filter((item) => item.done).length;
  const dueDate = task.due ? new Date(`${task.due}T23:59:59`) : null;
  const overdue = dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
  const priority = ['low', 'medium', 'high'].includes(task.priority)
    ? task.priority
    : 'medium';

  return `
    <article class="card" data-id="${esc(task.id)}">
      <div class="card-title">${esc(task.title)}</div>
      ${task.description ? `
        <div class="card-desc">${esc(task.description)}</div>
      ` : ''}
      <div class="meta">
        <span class="pill priority-${priority}">${esc(priority)}</span>
        ${task.due ? `
          <span class="pill due ${overdue ? 'overdue' : ''}">📅 ${esc(task.due)}</span>
        ` : ''}
        ${subtasks.length ? `
          <span class="pill">☑ ${completed}/${subtasks.length}</span>
        ` : ''}
      </div>
      ${tags.length ? `
        <div class="tags">
          ${tags.map((tag) => `<span class="pill">#${esc(tag)}</span>`).join('')}
        </div>
      ` : ''}
      ${subtasks.length ? `
        <ul class="subtasks">
          ${subtasks.map((item, index) => `
            <li>
              <label>
                <input type="checkbox" data-subtask="${index}" ${item.done ? 'checked' : ''}>
                <span>${esc(item.text)}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </article>
  `;
}
