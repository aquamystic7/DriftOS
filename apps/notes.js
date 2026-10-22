export default {
  id: 'notes',
  name: 'Notes',
  icon: '📝',
  singleton: true,
  width: 520,
  height: 420,
  mount(root, ctx) {
    root.style.padding = '0';
    const ta = document.createElement('textarea');
    ta.placeholder = 'Start a note...';
    ta.spellcheck = false;
    ta.value = localStorage.getItem('drift:notes') || '';
    ta.addEventListener('input', () => {
      localStorage.setItem('drift:notes', ta.value);
    });
    root.appendChild(ta);
  }
};
