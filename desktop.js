import { initTheme }   from "./theme.js";
import { initClock }   from "./clock.js";
import { initBattery } from "./battery.js";
import { initDock }    from "./dock.js";

export function startDesktop() {
    initTheme();
    initClock();
    initBattery();
    initDock();
}
