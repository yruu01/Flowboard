
export function shortcuts(store) {
  addEventListener('keydown', (event) => {
    const activeTag = document.activeElement?.tagName;

    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
      return;
    }

    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (modifier && key === 'z') {
      event.preventDefault();

      if (event.shiftKey) {
        store.redo();
      } else {
        store.undo();
      }

      return;
    }

    if (modifier && key === 'y') {
      event.preventDefault();
      store.redo();
      return;
    }

    if (event.key === '/') {
      event.preventDefault();
      document.querySelector('#search').focus();
    }
  });
}
