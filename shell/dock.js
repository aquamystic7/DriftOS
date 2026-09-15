export function initDock() {
    const dock = document.getElementById("dock");
    if (!dock) return;

    dock.querySelectorAll(".dock-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            const app = btn.dataset.app;
            console.log("[dock] launch →", app);
            // Day 3: wwindow manager will handle this
        });
    });
}