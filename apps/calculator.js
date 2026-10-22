export default {
  id: 'calc',
  name: 'Calculator',
  icon: '🔢',
  singleton: true,
  width: 320,
  height: 480,
  mount(root, ctx) {
    root.classList.add('calcapp');
    root.innerHTML = '';

    const display = document.createElement('div');
    display.className = 'calc-display';
    display.textContent = '0';

    const keysGrid = document.createElement('div');
    keysGrid.className = 'calc-keys';

    const KEYS = [
      ['AC', 'op gray'], ['±', 'op gray'], ['%', 'op gray'], ['÷', 'op accent'],
      ['7', 'digit'], ['8', 'digit'], ['9', 'digit'], ['×', 'op accent'],
      ['4', 'digit'], ['5', 'digit'], ['6', 'digit'], ['−', 'op accent'],
      ['1', 'digit'], ['2', 'digit'], ['3', 'digit'], ['+', 'op accent'],
      ['0', 'digit wide'], ['.', 'digit'], ['=', 'op accent']
    ];

    let acc = null;
    let pending = null;
    let current = '0';
    let typing = false;

    const show = v => {
      let s = String(v);
      if (Math.abs(Number(s)) >= 1e12 || (/e/i.test(s))) s = Number(v).toExponential(6);
      display.textContent = s;
      display.style.fontSize = s.length > 11 ? '24px' : s.length > 8 ? '30px' : '36px';
    };

    const compute = (a, b, op) => {
      const x = Number(a);
      const y = Number(b);
      switch (op) {
        case '×': return x * y;
        case '÷': return y === 0 ? NaN : x / y;
        case '−': return x - y;
        case '+': return x + y;
        default: return y;
      }
    };

    const input = key => {
      if (/^[0-9]$/.test(key)) {
        current = typing ? (current === '0' ? key : current + key) : key;
        typing = true;
      } else if (key === '.') {
        if (!typing) { current = '0.'; typing = true; }
        else if (!current.includes('.')) current += '.';
      } else if (key === 'AC') {
        acc = null; pending = null; current = '0'; typing = false;
      } else if (key === '±') {
        current = String(-Number(current));
      } else if (key === '%') {
        current = String(Number(current) / 100);
      } else if (['×', '÷', '−', '+'].includes(key)) {
        if (pending && typing) {
          acc = compute(acc, current, pending);
          current = String(acc);
        } else if (acc === null || !typing) {
          acc = Number(current);
        }
        pending = key;
        typing = false;
      } else if (key === '=') {
        if (pending) {
          current = String(compute(acc, current, pending));
          acc = null;
          pending = null;
          typing = false;
        }
      }
      show(current);
    };

    KEYS.forEach(([k, cls]) => {
      const keyEl = document.createElement('button');
      keyEl.className = 'calc-key ' + cls;
      keyEl.textContent = k;
      keyEl.addEventListener('click', () => input(k));
      keysGrid.appendChild(keyEl);
    });

    root.appendChild(display);
    root.appendChild(keysGrid);

    document.addEventListener('keydown', e => {
      const win = root.closest('drift-window');
      if (!win || !win.classList.contains('active')) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) input(k);
      else if (k === '.') input('.');
      else if (k === '+') input('+');
      else if (k === '-') input('−');
      else if (k === '*') input('×');
      else if (k === '/') { e.preventDefault(); input('÷'); }
      else if (k === '=' || k === 'Enter') { e.preventDefault(); input('='); }
      else if (k === 'Escape') input('AC');
      else if (k === 'Backspace') {
        current = current.length > 1 ? current.slice(0, -1) : '0';
        show(current);
      }
    });

    show('0');
  }
};
