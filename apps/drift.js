const WORLDS = {
  sick: 'SICK ENTRY',
  good: 'GOOD SLIDE',
  late: 'UNDERSTEER',
  early: 'SPUN OUT'
};

export default {
  id: 'drift',
  name: 'Drift Score',
  icon: '🏁',
  singleton: true,
  width: 560,
  height: 430,
  mount(root, ctx) {
    root.classList.add('driftapp');

    const mk = (tag, cls) => {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      return el;
    };

    const head = mk('div', 'drift-head');
    const title = mk('div', 'drift-title');
    title.textContent = '🏁 Drift Score';
    const sub = mk('div', 'drift-sub');
    sub.textContent = 'Hold REV, release inside the green power band to score';
    head.appendChild(title);
    head.appendChild(sub);

    const meter = mk('div', 'drift-meter');
    const band = mk('div', 'drift-band');
    const fill = mk('div', 'drift-fill');
    meter.appendChild(band);
    meter.appendChild(fill);

    const combo = mk('div', 'drift-combo');
    combo.textContent = 'x1';
    meter.appendChild(combo);

    const readout = mk('div', 'drift-readout');
    const scoreEl = mk('div', 'drift-score');
    scoreEl.textContent = '0';
    const hiEl = mk('div', 'drift-hi');
    hiEl.textContent = 'best 0';
    readout.appendChild(scoreEl);
    readout.appendChild(hiEl);

    const verdict = mk('div', 'drift-verdict');
    verdict.textContent = 'Ready.';

    const launch = mk('button', 'drift-launch');
    launch.textContent = 'HOLD TO REV';

    const help = mk('div', 'drift-help');
    help.textContent = 'Hold the button (or Space) to build revs. Release in the amber-green band = drift points; chain them for a combo. Miss the band and you understeer.';

    root.appendChild(head);
    root.appendChild(meter);
    root.appendChild(readout);
    root.appendChild(verdict);
    root.appendChild(launch);
    root.appendChild(help);

    let rev = 0;
    let holding = false;
    let raf = null;
    let score = 0;
    let comboCount = 0;
    let hiscore = Number(localStorage.getItem('drift:hiscore') || '0');

    hiEl.textContent = 'best ' + hiscore;

    const bandStart = 58;
    const bandEnd = 86;

    const flashVerdict = (kind, extra) => {
      verdict.textContent = WORLDS[kind] + (extra ? '  ' + extra : '');
      verdict.classList.remove('sick', 'good', 'miss');
      if (kind === 'sick' || kind === 'good') verdict.classList.add(kind === 'sick' ? 'sick' : 'good');
      else verdict.classList.add('miss');
    };

    const bumpComboUi = () => {
      combo.textContent = 'x' + Math.max(comboCount, 1);
      combo.classList.toggle('on', comboCount > 1);
    };

    const tick = () => {
      if (holding) {
        rev = Math.min(100, rev + (rev < 55 ? 2.6 : 3.4));
      } else {
        rev = Math.max(0, rev - 5);
      }
      fill.style.width = rev.toFixed(1) + '%';
      raf = requestAnimationFrame(tick);
      if (!holding && rev <= 0) raf = null;
    };

    const release = (viaKey) => {
      if (!holding) return;
      holding = false;
      const inBand = rev >= bandStart && rev <= bandEnd;
      if (inBand) {
        comboCount++;
        const base = Math.round(rev * 14 * (1 + (comboCount - 1) * 0.25));
        score += base;
        flashVerdict(rev >= 70 ? 'sick' : 'good', '+' + base);
        if (comboCount > 2) {
          ctx.bus.emit('notify', 'Drift combo x' + comboCount + ' — ' + base + ' pts');
        }
      } else {
        comboCount = 0;
        score = Math.max(0, score - Math.round(rev * 2));
        flashVerdict(rev < bandStart ? 'early' : 'late', '-combo');
      }
      scoreEl.textContent = String(score);
      if (score > hiscore) {
        hiscore = score;
        localStorage.setItem('drift:hiscore', String(hiscore));
        hiEl.textContent = 'best ' + hiscore;
      }
      bumpComboUi();
    };

    const press = () => {
      if (holding) return;
      holding = true;
      if (!raf) tick();
    };

    launch.addEventListener('mousedown', press);
    document.addEventListener('mouseup', release);
    launch.addEventListener('touchstart', e => { e.preventDefault(); press(); });
    launch.addEventListener('touchend', e => { e.preventDefault(); release(); });

    document.addEventListener('keydown', e => {
      if (e.code !== 'Space') {
        return;
      }
      if (!root.closest('drift-window') || !root.closest('drift-window').classList.contains('active')) {
        return;
      }
      e.preventDefault();
      press();
    });

    const onKeyUpGlobal = (e) => {
      if (e.code !== 'Space') { return; }
      release();
    };
    document.addEventListener('keyup', (e) => onKeyUpGlobal(e));

    bumpComboUi();
  }
};
