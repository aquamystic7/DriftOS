const BLOCKED = [
  'google.com', 'youtube.com', 'github.com', 'x.com', 'twitter.com',
  'facebook.com', 'instagram.com', 'reddit.com', 'amazon.com',
  'netflix.com', 'linkedin.com', 'gmail.com', 'apple.com',
  'microsoft.com', 'openai.com', 'chatgpt.com', 'codepen.io',
  'discord.com', 'spotify.com', 'bing.com', 'duckduckgo.com'
];

const LINKS = [
  { icon: '📚', name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Web_browser' },
  { icon: '🌍', name: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.2,51.46,-0.01,51.52&layer=mapnik' },
  { icon: '🌐', name: 'example.com', url: 'https://example.com' },
  { icon: '📖', name: 'Operating systems', url: 'https://en.wikipedia.org/wiki/Operating_system' },
  { icon: '🗺️', name: 'World map', url: 'https://www.openstreetmap.org/export/embed.html?bbox=-10,35,30,60&layer=mapnik' },
  { icon: '📰', name: 'Hacker News', url: 'https://news.ycombinator.com' }
];

const HUES = [
  'hsl(206, 90%, 60%)', 'hsl(285, 62%, 62%)', 'hsl(342, 85%, 62%)',
  'hsl(35, 90%, 55%)', 'hsl(152, 68%, 45%)', 'hsl(262, 75%, 62%)',
  'hsl(16, 92%, 56%)', 'hsl(190, 85%, 48%)'
];

const WIKI_SEARCH = 'https://en.wikipedia.org/wiki/Special:Search?search=';

export default {
  id: 'browser',
  name: 'Drift Browser',
  icon: '🧭',
  singleton: false,
  width: 1000,
  height: 640,
  mount(root, ctx) {
    root.classList.add('browser');

    const mk = (tag, cls) => {
      const el = document.createElement(tag);
      if (cls) el.className = cls;
      return el;
    };
    const pageUrl = u => u.replace(/^https?:\/\//, '');
    const hostOf = u => {
      try { return new URL(u).hostname.replace(/^www\./, ''); }
      catch (e) { return u || ''; }
    };

    /* ---------- chrome ---------- */

    const tabsBar = mk('div', 'drift-tabs');
    const newTabBtn = mk('button', 'drift-newtab');
    newTabBtn.textContent = '\u{2795}';
    newTabBtn.title = 'New tab';
    tabsBar.appendChild(newTabBtn);
    newTabBtn.addEventListener('click', () => newTab());

    const toolbar = mk('div', 'browser-bar');
    const btn = (glyph, title) => {
      const b = mk('button', 'browser-btn');
      b.textContent = glyph;
      b.title = title;
      return b;
    };

    const backBtn = btn('\u2039', 'Back');
    const fwdBtn = btn('\u203A', 'Forward');
    const reloadBtn = btn('\u21BB', 'Reload');
    const homeBtn = btn('\u2302', 'Home');
    const shieldBtn = btn('🛡', 'Shields: known embed-blockers are filtered');
    const extBtn = btn('\u2197', 'Open in a real browser tab');
    const omniPill = mk('div', 'omni-pill');
    const omniLock = mk('span', 'omni-ico');
    omniLock.textContent = '\u{1F512}';
    const omni = mk('input', 'browser-omni');
    omni.placeholder = 'Search the web without being tracked';
    omni.spellcheck = false;

    omniPill.appendChild(omniLock);
    omniPill.appendChild(omni);
    toolbar.appendChild(backBtn);
    toolbar.appendChild(fwdBtn);
    toolbar.appendChild(reloadBtn);
    toolbar.appendChild(homeBtn);
    toolbar.appendChild(shieldBtn);
    toolbar.appendChild(omniPill);
    toolbar.appendChild(extBtn);

    const view = mk('div', 'browser-view');
    const status = mk('div', 'browser-status');

    root.appendChild(tabsBar);
    root.appendChild(toolbar);
    root.appendChild(view);
    root.appendChild(status);

    /* ---------- tabs (each tab keeps a live iframe) ---------- */

    const tabs = new Map();
    let activeId = null;
    let nextId = 1;

    const setActive = (tab) => {
      const label = tab.mode === 'home' ? 'New Tab' : (tab.mode === 'blocked' ? 'Blocked — ' + hostOf(tab.url) : hostOf(tab.url));
      tab.el.querySelector('.tab-title').textContent = label;
      tab.el.title = tab.url ? tab.url : 'New Tab';
      return label;
    };

    function genFav(tab) {
      const fav = tab.el.querySelector('.tab-fav');
      if (tab.mode === 'home') {
        fav.textContent = '';
        fav.style.background = 'rgba(255,255,255,.22)';
        fav.style.color = 'rgba(255,255,255,.75)';
      } else {
        const h = hostOf(tab.url) || 'x';
        fav.textContent = h.charAt(0).toUpperCase();
        let sum = 0;
        for (let i = 0; i < h.length; i++) sum += h.charCodeAt(i) * (i + 3);
        fav.style.background = HUES[sum % HUES.length];
        fav.style.color = '#12121a';
        fav.style.fontWeight = '800';
      }
    }

    function syncChrome() {
      const tab = tabs.get(activeId);
      if (!tab) return;
      omni.value = tab.mode === 'home' ? '' : (tab.url || '');
      omniLock.textContent = tab.mode === 'home' ? '' : (tab.url && tab.url.startsWith('https://') ? '\u{1F512}' : '\u{26A0}');
      const hasBack = tab.back.length > 0;
      const hasFwd = tab.fwd.length > 0;
      backBtn.classList.toggle('disabled', !hasBack);
      fwdBtn.classList.toggle('disabled', !hasFwd);
      setStatus(tab);
    }

    function setStatus(tab) {
      if (tab.id !== activeId) return;
      status.textContent = tab.loading ? 'Loading ' + pageUrl(tab.url) + '...'
        : (tab.statusNote || (tab.mode === 'home' ? 'New tab — search or type a URL above' : '---------- ' + pageUrl(tab.url) + ' ----------'));
    }

    function switchTab(id) {
      if (activeId === id) return;
      const prev = tabs.get(activeId);
      if (prev) { prev.el.classList.remove('active'); prev.viewEl.hidden = true; }
      const tab = tabs.get(id);
      if (!tab) return;
      activeId = id;
      tab.el.classList.add('active');
      tab.viewEl.hidden = false;
      syncChrome();
      setActive(tab);
    }

    function newTab(activate) {
      const id = nextId;
      nextId++;

      const el = mk('div', 'drift-tab');
      const fav = mk('span', 'tab-fav');
      fav.textContent = '';
      const title = mk('span', 'tab-title');
      title.textContent = 'New Tab';
      const x = mk('button', 'tab-x');
      x.textContent = '\u00D7';
      x.title = 'Close tab';
      el.appendChild(fav);
      el.appendChild(title);
      el.appendChild(x);
      el.addEventListener('click', () => switchTab(id));
      x.addEventListener('click', e => {
        e.stopPropagation();
        closeTab(id);
      });
      tabsBar.insertBefore(el, newTabBtn);

      const viewEl = mk('div', 'tab-view');
      viewEl.hidden = true;
      view.appendChild(viewEl);

      const tab = { id, el, viewEl, url: null, mode: 'home', back: [], fwd: [], loading: false, statusNote: '' };
      tabs.set(id, tab);
      genFav(tab);

      if (activate !== false) switchTab(id);
      tab.el.classList.add('active');
      return tab;
    }

    function closeTab(id) {
      const tab = tabs.get(id);
      if (!tab) return;
      const order = [...tabs.keys()];
      const idx = order.indexOf(id);
      tabs.delete(id);
      tab.el.remove();
      tab.viewEl.remove();
      if (activeId === id) {
        const rest = [...tabs.keys()];
        const pick = rest[Math.min(idx, rest.length - 1)];
        if (pick !== undefined) switchTab(pick);
        else newTab();
      }
    }

    /* ---------- rendering + navigation ---------- */

    function loadPage(tab, url) {
      tab.viewEl.innerHTML = '';
      tab.loading = true;
      const frame = mk('iframe', 'browser-frame');
      frame.src = url;
      frame.setAttribute('allow', 'fullscreen');
      frame.addEventListener('load', () => {
        tab.loading = false;
        tab.statusNote = '--------- ' + hostOf(url) + ' ---------';
        setStatus(tab);
      });
      tab.viewEl.appendChild(frame);
      setStatus(tab);
    }

    function loadHome(tab) {
      tab.viewEl.innerHTML = '';
      tab.loading = false;
      tab.statusNote = '';

      const home = mk('div', 'browser-home');

      const logo = mk('div', 'ntp-logo');
      logo.textContent = '🧭';
      const title = mk('div', 'ntp-title');
      title.textContent = 'Drift Browser';
      const sub = mk('div', 'ntp-sub');
      sub.textContent = 'Fast, private, and it lives inside your OS.';
      home.appendChild(logo);
      home.appendChild(title);
      home.appendChild(sub);

      const search = mk('div', 'ntp-search');
      const sIco = mk('span', 'ntp-sico');
      sIco.textContent = '🔍';
      const sIn = mk('input', 'ntp-input');
      sIn.placeholder = 'Search Wikipedia or type a URL';
      sIn.spellcheck = false;
      search.appendChild(sIco);
      search.appendChild(sIn);
      home.appendChild(search);
      sIn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          navigate(tab, sIn.value);
          sIn.blur();
        }
      });

      const links = mk('div', 'ntp-links');
      LINKS.forEach(l => {
        const card = mk('div', 'ntp-card');
        const ico = mk('div', 'ntp-cico');
        ico.textContent = l.icon;
        const nm = mk('div', 'ntp-cname');
        nm.textContent = l.name;
        card.appendChild(ico);
        card.appendChild(nm);
        card.title = pageUrl(l.url);
        card.addEventListener('click', () => navigate(tab, l.url));
        links.appendChild(card);
      });
      home.appendChild(links);

      const tip = mk('div', 'ntp-tip');
      tip.textContent = 'Ctrl+T new tab · Ctrl+W close tab · Big sites block embedding (Google, YouTube, GitHub...) and open in a real tab instead.';
      home.appendChild(tip);

      tab.viewEl.appendChild(home);
    }

    function loadBlocked(tab, url) {
      tab.viewEl.innerHTML = '';
      tab.loading = false;
      const wrap = mk('div', 'browser-blocked');
      const inner = mk('div', 'blocked-inner');
      const ico = mk('div', 'blocked-ico');
      ico.textContent = '🛡';
      const title = mk('div', 'blocked-title');
      title.textContent = 'This site can\u2019t be embedded';
      const host = mk('div', 'blocked-host');
      host.textContent = hostOf(url);
      const msg = mk('div', 'blocked-msg');
      msg.textContent = 'Its X-Frame-Options policy blocks iframe embedding. Shields caught it ahead of the load.';
      const actions = mk('div', 'blocked-actions');
      const open = mk('button', 'blocked-btn primary');
      open.textContent = 'Open in real tab';
      open.addEventListener('click', () => {
        window.open(url, '_blank');
        ctx.bus.emit('notify', 'Opened "' + hostOf(url) + '" outside Drift OS');
      });
      const tryBtn = mk('button', 'blocked-btn');
      tryBtn.textContent = 'Try anyway';
      tryBtn.addEventListener('click', () => {
        tab.mode = 'web';
        genFav(tab);
        loadPage(tab, url);
      });
      actions.appendChild(open);
      actions.appendChild(tryBtn);
      inner.appendChild(ico);
      inner.appendChild(title);
      inner.appendChild(host);
      inner.appendChild(msg);
      inner.appendChild(actions);
      wrap.appendChild(inner);
      tab.viewEl.appendChild(wrap);
      setStatus(tab);
    }

    function looksLikeUrl(s) {
      if (/\s/.test(s)) return false;
      if (/^https?:\/\//i.test(s)) return true;
      if (/^localhost(:|$)/i.test(s)) return true;
      return /^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(s);
    }

    function navigate(tab, raw) {
      const value = (raw || '').trim();
      if (!value) return;
      let url;
      if (/^https?:\/\//i.test(value)) url = value;
      else if (looksLikeUrl(value)) url = 'https://' + value;
      else url = WIKI_SEARCH + encodeURIComponent(value) + '&fulltext=1';

      let host = url;
      try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { host = url; }
      const blocked = BLOCKED.some(d => host === d || host.endsWith('.' + d));

      if (tab.url) tab.back.push(tab.url);
      tab.fwd = [];
      tab.url = url;
      tab.mode = blocked ? 'blocked' : 'web';
      genFav(tab);
      setActive(tab);
      syncChrome();
      blocked ? loadBlocked(tab, url) : loadPage(tab, url);
    }

    /* toolbar actions on the CURRENT tab */

    const active = () => tabs.get(activeId);

    const goBack = () => {
      const t = active();
      if (!t || !t.back.length) return;
      if (t.url) t.fwd.push(t.url);
      const prev = t.back.pop();
      t.url = prev;
      t.mode = 'web';
      genFav(t);
      setActive(t);
      loadPage(t, prev);
      syncChrome();
    };

    const goFwd = () => {
      const t = active();
      if (!t || !t.fwd.length) return;
      if (t.url) t.back.push(t.url);
      const next = t.fwd.pop();
      t.url = next;
      t.mode = 'web';
      genFav(t);
      setActive(t);
      loadPage(t, next);
      syncChrome();
    };

    const goHome = () => {
      const t = active();
      if (!t) return;
      if (t.url) t.back.push(t.url);
      t.fwd = [];
      t.url = null;
      t.loading = false;
      t.statusNote = '';
      t.mode = 'home';
      genFav(t);
      setActive(t);
      loadHome(t);
      syncChrome();
    };

    const cur = () => {
      const t = active();
      if (!t) {
        ctx.bus.emit('notify', 'Drift Browser: no active tab');
        return;
      }
      return t;
    };

    backBtn.addEventListener('click', goBack);
    fwdBtn.addEventListener('click', goFwd);
    reloadBtn.addEventListener('click', () => {
      const t = cur();
      if (!t) return;
      if (t.mode === 'web' && t.url) loadPage(t, t.url);
      else if (t.mode === 'home') loadHome(t);
      else if (t.mode === 'blocked' && t.url) loadBlocked(t, t.url);
    });
    homeBtn.addEventListener('click', goHome);
    shieldBtn.addEventListener('click', () => {
      ctx.bus.emit('notify', 'Shields up — ' + BLOCKED.length + ' known embed-blockers filtered. Your tabs stay private.');
    });
    extBtn.addEventListener('click', () => {
      const t = cur();
      if (!t) return;
      if (!t.url) {
        ctx.bus.emit('notify', 'Open a site first, then send it to a real tab');
        return;
      }
      window.open(t.url, '_blank');
      ctx.bus.emit('notify', 'Opened "' + hostOf(t.url) + '" in a real browser tab');
    });

    omni.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      navigate(active(), omni.value);
      omni.blur();
    });

    root.addEventListener('keydown', e => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      const k = e.key.toLowerCase();
      if (k === 't') {
        e.preventDefault();
        newTab();
        omni.focus();
      } else if (k === 'w') {
        e.preventDefault();
        if (activeId !== null) closeTab(activeId);
      }
    });

    newTab();
  }
};
