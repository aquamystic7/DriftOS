export default {
  id: 'cal',
  name: 'Calendar',
  icon: '📅',
  singleton: true,
  width: 380,
  height: 420,
  mount(root, ctx) {
    root.classList.add('calapp');

    const selected = new Date();
    let view = new Date(selected.getFullYear(), selected.getMonth(), 1);

    const head = document.createElement('div');
    head.className = 'cal-head';
    const prev = document.createElement('button');
    prev.className = 'cal-nav';
    prev.textContent = '‹';
    const label = document.createElement('span');
    label.className = 'cal-label';
    const next = document.createElement('button');
    next.className = 'cal-nav';
    next.textContent = '›';
    head.appendChild(prev);
    head.appendChild(label);
    head.appendChild(next);

    const grid = document.createElement('div');
    grid.className = 'cal-grid';
    root.appendChild(head);
    root.appendChild(grid);

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const render = () => {
      label.textContent = MONTHS[view.getMonth()] + ' ' + view.getFullYear();
      grid.innerHTML = '';

      DAYS.forEach((d, i) => {
        const c = document.createElement('div');
        c.className = 'cal-dow' + (i === 0 || i === 6 ? ' weekend' : '');
        c.textContent = d;
        grid.appendChild(c);
      });

      const first = new Date(view.getFullYear(), view.getMonth(), 1);
      const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      let col = first.getDay();

      for (let i = 0; i < col; i++) {
        grid.appendChild(Object.assign(document.createElement('div'), { className: 'cal-day empty' }));
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(view.getFullYear(), view.getMonth(), d);
        const cell = document.createElement('div');
        cell.className = 'cal-day' + (isSameDay(date, new Date()) ? ' today' : '') + (isSameDay(date, selected) ? ' sel' : '');
        cell.textContent = String(d);
        cell.addEventListener('click', () => {
          selected.setTime(date.getTime());
          ctx.bus.emit('notify', 'Picked ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
          render();
        });
        grid.appendChild(cell);
      }
    };

    prev.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    });
    next.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render();
    });

    render();
  }
};
