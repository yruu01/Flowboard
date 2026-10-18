
export function bindDrag(board, onMove) {
  let drag = null;
  let ghost = null;

  const clearDropTargets = () => {
    document.querySelectorAll('.cards').forEach((zone) => {
      zone.classList.remove('drop-target');
    });
  };

  board.addEventListener('pointerdown', (event) => {
    const card = event.target.closest('.card');

    if (!card || event.target.closest('input, button, label')) {
      return;
    }

    drag = {
      id: card.dataset.id,
      startX: event.clientX,
      startY: event.clientY,
      active: false
    };

    board.setPointerCapture?.(event.pointerId);
  });

  board.addEventListener('pointermove', (event) => {
    if (!drag) return;

    const distance = Math.hypot(
      event.clientX - drag.startX,
      event.clientY - drag.startY
    );

    if (!drag.active && distance < 7) return;

    if (!drag.active) {
      drag.active = true;

      ghost = board.querySelector(
        `.card[data-id="${CSS.escape(drag.id)}"]`
      );

      ghost?.classList.add('dragging');
    }

    clearDropTargets();

    document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('.cards')
      ?.classList.add('drop-target');
  });

  const end = (event) => {
    if (!drag) return;

    if (drag.active) {
      const zone = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest('.cards');

      if (zone) {
        onMove(drag.id, zone.dataset.column);
      }
    }

    clearDropTargets();
    ghost?.classList.remove('dragging');

    drag = null;
    ghost = null;
  };

  board.addEventListener('pointerup', end);
  board.addEventListener('pointercancel', end);
}
