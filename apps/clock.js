export default {
  id: 'clock',
  name: 'Clock',
  icon: '🕰️',
  singleton: true,
  width: 320,
  height: 380,
  mount(root, ctx) {
    root.classList.add('clockapp');
    root.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const digital = document.createElement('div');
    digital.className = 'clock-digital';

    root.appendChild(canvas);
    root.appendChild(digital);

    const size = 240;
    const ctx2d = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;

    function draw() {
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      ctx2d.clearRect(0, 0, size, size);

      ctx2d.beginPath();
      ctx2d.arc(cx, cy, r, 0, Math.PI * 2);
      ctx2d.fillStyle = 'rgba(28,28,34,0.9)';
      ctx2d.fill();
      ctx2d.lineWidth = 3;
      ctx2d.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx2d.stroke();

      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        const x1 = cx + Math.sin(a) * (r - 8);
        const y1 = cy - Math.cos(a) * (r - 8);
        const x2 = cx + Math.sin(a) * (r - 18);
        const y2 = cy - Math.cos(a) * (r - 18);
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.lineWidth = 2.5;
        ctx2d.strokeStyle = 'rgba(245,245,247,0.8)';
        ctx2d.stroke();
      }

      const hands = [
        { a: ((h + m / 60) * Math.PI) / 6, len: r * 0.5, w: 5, col: 'rgba(245,245,247,0.95)' },
        { a: ((m + s / 60) * Math.PI) / 30, len: r * 0.72, w: 3.5, col: 'rgba(245,245,247,0.9)' },
        { a: ((s + ms / 1000) * Math.PI) / 30, len: r * 0.8, w: 1.8, col: '#ff9f0a' }
      ];

      hands.forEach(hh => {
        const hx = cx + Math.sin(hh.a) * hh.len;
        const hy = cy - Math.cos(hh.a) * hh.len;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(hx, hy);
        ctx2d.lineWidth = hh.w;
        ctx2d.strokeStyle = hh.col;
        ctx2d.lineCap = 'round';
        ctx2d.stroke();
      });

      ctx2d.beginPath();
      ctx2d.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx2d.fillStyle = '#f5f5f7';
      ctx2d.fill();

      digital.textContent = now.toLocaleTimeString();
    }

    const loop = () => { draw(); requestAnimationFrame(loop); };
    loop();
    root.addEventListener('mousedown', () => canvas.focus && canvas.focus());
  }
};
