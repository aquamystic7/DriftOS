import { bus } from './events.js';
import { launch, getApps } from './kernel.js';
import { WM } from './wm.js';

let spotlightOpen = false;
let selIndex = 0;
let filtered = [];

export const shell = {
  init() {
    this.startClock();
    this.wireDock();
    this.renderDock();
    this.wireSpotlight();
    this.wireMenubar();
    bus.on('wm:changed', () => this.renderDock());
    bus.on('notify', msg => this.toast(String(msg)));
  },

  startClock() {
    const time = document.getElementById('mb-time');
    const date = document.getElementById('mb-date');
    const tick = () => {
      const d = new Date();
      time.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      date.textContent = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };
    tick();
    setInterval(tick, 10000);
  },

  wireMenubar() {
    const apple = document.getElementById('mb-apple');
    const about = document.getElementById('about');

    apple.textContent = '\u{1F34E}';

    const closeAbout = () => { about.hidden = true; };
    apple.addEventListener('mousedown', e => {
      e.stopPropagation();
      e.preventDefault();
      about.hidden = !about.hidden;
      if (!about.hidden) {
        document.getElementById('about-windows').textContent = String(WM.all().length);
      }
    });
    about.addEventListener('mousedown', e => e.stopPropagation());
    document.addEventListener('mousedown', closeAbout);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAbout();
    });

    bus.on('wm:changed', () => {
      const active = WM.all().find(w => w.classList.contains('active'));
      document.getElementById('mb-active').textContent = active ? active.dataset.title : 'Drift';
    });
  },

  wireDock() {
    const dock = document.getElementById('dock');
    const icons = () => [...dock.querySelectorAll('.dock-icon')];

    dock.addEventListener('mousemove', e => {
      const dr = dock.getBoundingClientRect();
      const lx = e.clientX - dr.left;
      icons().forEach(el => {
        const center = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(lx - center);
        const s = d >= 80 ? 1 : 1 + 0.35 * Math.pow(1 - d / 80, 2);
        el.style.transform = 'scale(' + s.toFixed(3) + ')';
      });
    });

    dock.addEventListener('mouseleave', () => {
      icons().forEach(el => { el.style.transform = ''; });
    });
  },

  renderDock() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    dock.innerHTML = '';
    getApps().forEach(app => {
      const item = document.createElement('div');
      item.className = 'dock-item';
      item.dataset.app = app.id;
      item.innerHTML =
        '<div class="dock-icon" data-app="' + app.id + '"><span>' + app.icon + '</span></div>' +
        '<div class="dock-dot"></div>' +
        '<div class="dock-label">' + app.name + '</div>';
      if (WM.all().some(w => w.dataset.app === app.id)) item.classList.add('running');
      item.addEventListener('click', () => this.dockClick(app.id, item));
      dock.appendChild(item);
    });
  },

  dockClick(appId, item) {
    const wins = WM.all().filter(w => w.dataset.app === appId);
    if (!wins.length) {
      const icon = item.querySelector('.dock-icon');
      icon.classList.add('bounce');
      setTimeout(() => icon.classList.remove('bounce'), 700);
      launch(appId);
      return;
    }
    const focused = wins.find(w => w.classList.contains('active') && !w.classList.contains('minimized'));
    if (focused) {
      WM.minimize(focused);
    } else {
      WM.focus(wins[wins.length - 1]);
    }
  },

  wireSpotlight() {
    const input = document.getElementById('spotlight-input');
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSpotlight();
      if (e.key === 'ArrowDown') { e.preventDefault(); selIndex = Math.min(selIndex + 1, filtered.length - 1); highlight(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); selIndex = Math.max(selIndex - 1, 0); highlight(); }
      if (e.key === 'Enter') {
        const app = filtered[selIndex];
        if (app) { closeSpotlight(); launch(app.id); }
      }
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === ' ') {
        e.preventDefault();
        toggleSpotlight();
      }
    });

    document.getElementById('spotlight').addEventListener('mousedown', e => {
      if (e.target.id === 'spotlight') closeSpotlight();
    });
  },

  toast(msg) {
    const holder = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    el.addEventListener('click', () => el.remove());
    holder.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    setTimeout(() => {
      el.classList.remove('in');
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }
};

function toggleSpotlight() {
  spotlightOpen ? closeSpotlight() : openSpotlight();
}

function openSpotlight() {
  spotlightOpen = true;
  const box = document.getElementById('spotlight');
  box.hidden = false;
  const input = document.getElementById('spotlight-input');
  input.value = '';
  renderResults('');
  setTimeout(() => input.focus(), 10);
}

function closeSpotlight() {
  spotlightOpen = false;
  document.getElementById('spotlight').hidden = true;
}

function renderResults(query) {
  const q = query.trim().toLowerCase();
  filtered = getApps().filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q));
  selIndex = 0;
  const box = document.getElementById('spotlight-results');
  box.innerHTML = '';
  filtered.forEach((app, i) => {
    const row = document.createElement('div');
    row.className = 'spotlight-item' + (i === 0 ? ' sel' : '');
    row.innerHTML =
      '<span class="spotlight-icon" data-app="' + app.id + '">' + app.icon + '</span>' +
      '<span class="spotlight-name">' + app.name + '</span>' +
      '<span class="spotlight-hint">Application</span>';
    row.onclick = () => { closeSpotlight(); launch(app.id); };
    box.appendChild(row);
  });
}

function highlight() {
  const rows = document.querySelectorAll('.spotlight-item');
  rows.forEach((r, i) => r.classList.toggle('sel', i === selIndex));
  rows[selIndex]?.scrollIntoView({ block: 'nearest' });
}
