const KEY = "driftos.theme";

export function initTheme() {
    const html = document.documentElement;

    // Load saved preferences
    html.dataset.theme = localStorage.getItem(KEY) || "dark";
     html.dataset.warzone = localStorage.getItem(KEY + ".warzone") ?? "on";

  const themeBtn = document.getElementById("theme-toggle");
  const warBtn = document.getElementById("warzone-toggle");

  const paint = () => {
    themeBtn.textContent = html.dataset.theme === "dark" ? "🌙" : "☀️";
    warBtn.style.opacity = html.dataset.warzone === "on" ? "1" : "0.4";
  };

  themeBtn.addEventListener("click", () => {
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem(KEY, next);
    paint();
  });

  warBtn.addEventListener("click", () => {
    const on = html.dataset.warzone !== "on";
    html.dataset.warzone = on ? "on" : "off";
    localStorage.setItem(KEY + ".warzone", on ? "on" : "off");
    paint();
  });

  paint();
}