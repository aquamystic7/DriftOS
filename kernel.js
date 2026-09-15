const BOOT_MS = 1800;

async function boot() {
  const bootEl = document.getElementById("boot-screen");
  const desktop = document.getElementById("desktop");

  // Simulate boot delay
  await new Promise((resolve) => setTimeout(resolve, BOOT_MS));

  // Fade out boot screen, show desktop
  bootEl.classList.add("fade-out");
  desktop.hidden = false;

  // Remove boot screen from DOM after fade completes
  setTimeout(() => bootEl.remove(), 900);

  // Start the desktop shell (lazy-loaded)
  const { startDesktop } = await import("./shell/desktop.js");
  startDesktop();
}

boot();

// Process manager — will track windows in Day 3
export const Kernel = {
  processes: new Map(),
  pid: 0,

  spawn(app, args = {}) {
    const id = ++this.pid;
    const proc = { id, app, args, state: "running" };
    this.processes.set(id, proc);
    return proc;
  },

  kill(id) {
    this.processes.delete(id);
  },

  list() {
    return [...this.processes.values()];
  },  
};       