import { bus } from './events.js';
import { WM } from './wm.js';
import { shell } from './shell.js';

const apps = new Map();

export function registerApp(manifest) {
  apps.set(manifest.id, manifest);
}

export function getApps() {
  return [...apps.values()];
}

export function launch(id) {
  const app = apps.get(id);
  if (!app) return;
  const existing = WM.all().filter(w => w.dataset.app === id);
  if (app.singleton && existing.length) {
    WM.focus(existing[0]);
    return;
  }
  const win = WM.create({
    title: app.name,
    appId: app.id,
    icon: app.icon,
    width: app.width || 600,
    height: app.height || 400
  });
  app.mount(win.content, {
    bus,
    fs: window.driftFs,
    launch,
    win
  });
}

export async function boot() {
  const splash = document.getElementById('boot');
  const fill = splash.querySelector('.boot-fill');

  fill.style.width = '30%';
  await new Promise(r => setTimeout(r, 150));

  const modules = await Promise.all([
    import('./apps/notes.js'),
    import('./apps/terminal.js'),
    import('./apps/files.js')
  ]);
  modules.forEach(m => registerApp(m.default));

  fill.style.width = '70%';
  await new Promise(r => setTimeout(r, 150));

  WM.init(document.getElementById('windows'));
  shell.init();

  fill.style.width = '100%';
  await new Promise(r => setTimeout(r, 200));

  splash.classList.add('hide');
  document.getElementById('desktop').hidden = false;
  document.getElementById('menubar').hidden = false;
  document.getElementById('dock').hidden = false;

  setTimeout(() => splash.remove(), 500);
  bus.emit('system:ready');
}
