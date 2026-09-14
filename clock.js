export function initClock() {
    const el = document.getElementById("clock");
    if (!el) return;
    
    const tick = () => {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        el.textContent = `${hh}:${mm}`;
    };

    tick();
    setInterval(tick, 1000);
}