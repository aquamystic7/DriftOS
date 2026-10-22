export default {
  id: 'files',
  name: 'Finder',
  icon: '📁',
  singleton: true,
  width: 520,
  height: 380,
  mount(root, ctx) {
    root.innerHTML = '';
    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
    root.appendChild(list);

    const entries = [
      { name: 'Projects', type: 'folder' },
      { name: 'Desktop', type: 'folder' },
      { name: 'notes.md', type: 'file' },
      { name: 'todo.txt', type: 'file' },
      { name: 'welcome.md', type: 'file' }
    ];

    entries.forEach(f => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.innerHTML =
        '<span>' + (f.type === 'folder' ? '📁' : '📄') + '</span>' +
        '<span>' + f.name + '</span>' +
        '<span class="chev">›</span>';
      row.addEventListener('click', () => {
        ctx.bus.emit('notify', 'Opening "' + f.name + '"...');
      });
      list.appendChild(row);
    });
  }
};
