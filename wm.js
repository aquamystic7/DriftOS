import { bus } from './events.js';

let root = null;
let zTop = 10;
let seq = 0;

class DriftWindow extends HTMLElement {
  connectedCallback() {
    if (this._built) return;
    this._built = true;
    this.innerHTML = `
      <div class="win-titlebar">
        <div class="traffic">
          <button class="tl-btn close" aria-label="Close" tabindex="-1"></button>
          <button class="tl-btn min" aria-label="Minimize" tabindex="-1"></button>
          <button class="tl-btn max" aria-label="Zoom" tabindex="-1"></button>
        </div>
        <span class="win-title"></span>
      </div>
      <div class="win-content"></div>
      <div class="win-resize t"></div>
      <div class="win-resize r"></div>
      <div class="win-resize b"></div>
      <div class="win-resize l"></div>
      <div class="win-resize tl"></div>
      <div class="win-resize tr"></div>
      <div class="win-resize bl"></div>
      <div class="win-resize br"></div>
    `;
    this.content = this.querySelector('.win-content');
    this._wire();
  }

  _wire() {
    const bar = this.querySelector('.win-titlebar');
    const close = this.querySelector('.tl-btn.close');
    const min = this.querySelector('.tl-btn.min');
    const max = this.querySelector('.tl-btn.max');

    min.addEventListener('click', e => {
      e.stopPropagation();
      WM.minimize(this);
    });

    max.addEventListener('click', e => {
      e.stopPropagation();
      if (this.dataset.maxed === '1') {
        Object.assign(this.style, this._prev);
        this.dataset.maxed = '0';
      } else {
        this._prev = {
          left: this.style.left,
          top: this.style.top,
          width: this.style.width,
          height: this.style.height
        };
        const p = this.parentElement.getBoundingClientRect();
        this.style.left = '0px';
        this.style.top = '0px';
        this.style.width = p.width + 'px';
        this.style.height = p.height + 'px';
        this.dataset.maxed = '1';
      }
    });

    close.addEventListener('click', e => {
      e.stopPropagation();
      WM.close(this);
    });

    bar.addEventListener('dblclick', e => {
      if (e.target.closest('button')) return;
      max.click();
    });

    let drag = null;
    bar.addEventListener('mousedown', e => {
      if (e.target.closest('button')) return;
      WM.focus(this);
      bar.classList.add('grabbing');
      const r = this.getBoundingClientRect();
      drag = { ox: e.clientX - r.left, oy: e.clientY - r.top, win: this };
    });

    const onMove = e => {
      if (drag && drag.win !== this) return;
      if (!drag) return;
      const p = this.parentElement.getBoundingClientRect();
      let x = e.clientX - p.left - drag.ox;
      let y = e.clientY - p.top - drag.oy;
      x = Math.max(0, Math.min(x, p.width - 60));
      y = Math.max(0, Math.min(y, p.height - 40));
      this.style.left = x + 'px';
      this.style.top = y + 'px';
    };

    let resize = null;

    const onUp = () => {
      if (drag) bar.classList.remove('grabbing');
      drag = null;
      resize = null;
    };
    // tag which window a drag belongs to so parallel handlers don't fight
    document.addEventListener('mousemove', e => {
      if (drag && drag.win === this) { onMove(e); return; }
      if (resize && resize.win === this) { onResizeMove(e); }
    });
    document.addEventListener('mouseup', onUp);

    function onResizeMove(e) {
      const dx = e.clientX - resize.sx;
      const dy = e.clientY - resize.sy;
      let { left, top, w, h, win } = resize;
      const dir = resize.dir;
      if (dir.includes('r')) w = Math.max(240, resize.w + dx);
      if (dir.includes('l')) { w = Math.max(240, resize.w - dx); left = resize.left + dx; }
      if (dir.includes('b')) h = Math.max(160, resize.h + dy);
      if (dir.includes('t')) { h = Math.max(160, resize.h - dy); top = resize.top + dy; }
      const p = win.parentElement.getBoundingClientRect();
      win.style.left = (left - p.left) + 'px';
      win.style.top = (top - p.top) + 'px';
      win.style.width = w + 'px';
      win.style.height = h + 'px';
    }

    this.querySelectorAll('.win-resize').forEach(h => {
      h.addEventListener('mousedown', e => {
        e.stopPropagation();
        WM.focus(this);
        const r = this.getBoundingClientRect();
        resize = {
          dir: h.className.replace('win-resize', '').trim(),
          sx: e.clientX,
          sy: e.clientY,
          left: r.left,
          top: r.top,
          w: r.width,
          h: r.height,
          win: this
        };
      });
    });

    this.addEventListener('mousedown', () => WM.focus(this));
  }
}

if (!customElements.get('drift-window')) {
  customElements.define('drift-window', DriftWindow);
}

export const WM = {
  init(el) {
    root = el;
  },

  create({ title, appId, icon, width, height }) {
    const win = document.createElement('drift-window');
    win.id = 'win-' + (++seq);
    win.dataset.app = appId;
    win.dataset.title = title;
    win.dataset.icon = icon || '';

    const p = root.getBoundingClientRect();
    const offset = (seq % 8) * 24;
    const w = Math.min(width || 600, p.width - 80);
    const h = Math.min(height || 400, p.height - 80);
    win.style.width = w + 'px';
    win.style.height = h + 'px';
    win.style.left = Math.max(12, Math.round((p.width - w) / 2) + offset - 36) + 'px';
    win.style.top = Math.max(12, Math.round((p.height - h) / 2) + offset - 42) + 'px';

    root.appendChild(win);
    win.querySelector('.win-title').textContent = title || '';
    this.focus(win);
    return win;
  },

  minimize(win) {
    if (!win) return;
    win.classList.add('minimized');
    win.classList.remove('active');
    win.style.display = 'none';
    bus.emit('wm:changed');
  },

  focus(win) {
    if (!win) return;
    if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
      win.style.display = '';
    }
    win.style.zIndex = ++zTop;
    root.querySelectorAll('drift-window').forEach(w => w.classList.toggle('active', w === win));
    bus.emit('wm:changed');
  },

  close(win) {
    if (!win) return;
    win.remove();
    bus.emit('wm:changed');
    bus.emit('wm:closed', { appId: win.dataset.app });
  },

  findByApp(appId) {
    return root ? root.querySelector('drift-window[data-app="' + appId + '"]') : null;
  },

  all() {
    return root ? [...root.querySelectorAll('drift-window')] : [];
  }
};
