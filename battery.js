export function initBattery() {
  const pctEl = document.getElementById("battery-pct");
  const iconEl = document.getElementById("battery-icon");

  if (!pctEl || !navigator.getBattery) {
    if (pctEl) pctEl.textContent = "N/A";
    return;
  }

  navigator.getBattery().then((b) => {
    const update = () => {
      const pct = Math.round(b.level * 100);
      pctEl.textContent = `${pct}%`;
      iconEl.textContent = b.charging ? "⚡" : pct <= 20 ? "🪫" : "🔋";
    };

    update();
    b.addEventListener("levelchange", update);
    b.addEventListener("chargingchange", update);
  });
}