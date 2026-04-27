(function() {
  'use strict';

  // ===== Header scroll state =====
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ===== Reveal on scroll =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ===== Animated KPI count-up =====
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (Number.isInteger(target) ? Math.round(val).toLocaleString() : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => countIo.observe(el));

  // ===== Built-for rotator =====
  const bfWords = document.querySelectorAll('.bf-word');
  if (bfWords.length > 1) {
    let bfIdx = 0;
    setInterval(() => {
      bfWords[bfIdx].classList.remove('is-active');
      bfWords[bfIdx].classList.add('is-out');
      bfIdx = (bfIdx + 1) % bfWords.length;
      setTimeout(() => {
        bfWords.forEach(w => w.classList.remove('is-out'));
        bfWords[bfIdx].classList.add('is-active');
      }, 50);
    }, 2200);
  }

  // ===== Cursor spotlight =====
  let mouseRaf = null, mx = 50, my = 30;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth) * 100;
    my = (e.clientY / window.innerHeight) * 100;
    if (mouseRaf) return;
    mouseRaf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', mx + '%');
      document.documentElement.style.setProperty('--my', my + '%');
      mouseRaf = null;
    });
  }, { passive: true });

  // ===== Page-wide market ticker — revealed near cursor =====
  const tboard = document.querySelector('#page-ticker');
  if (tboard) {
    const TICKERS = [
      ['NIFTY',   26842.15],  ['SENSEX',  87104.32], ['BANKNIFTY', 58120.8],
      ['RELIANCE',1432.5], ['TCS', 4108.9], ['HDFCBANK', 1742.1], ['INFY', 1876.4],
      ['ICICIBANK',1305.7], ['SBIN', 842.3], ['LT', 3604.2], ['ITC', 478.55],
      ['AXISBANK',1186.9], ['KOTAKBANK',1894.2], ['BHARTIARTL', 1604.8],
      ['USDINR', 84.12],   ['EURINR', 91.47],  ['GBPINR', 107.23], ['JPYINR', 0.56],
      ['GOLD', 78420], ['SILVER', 92840], ['CRUDE', 6512], ['BRENT', 82.4],
      ['SPX', 5874.6], ['DOW', 42112.8], ['NDQ', 18542.1], ['FTSE', 8214.3],
      ['NIKKEI', 39580.2], ['HSI', 19860.4], ['DAX', 19340.5],
      ['BTCUSD', 97412], ['ETHUSD', 3524.8], ['BTCINR', 8192340],
      ['10YGSEC', 6.78], ['10YUST', 4.32], ['INDVIX', 13.64],
      ['TATAMOTORS', 762.4], ['M&M', 2984.5], ['SUNPHARMA', 1824.1],
      ['WIPRO', 576.9], ['HCLTECH', 1892.3], ['ASIANPAINT', 2412.8],
      ['BAJFINANCE', 7104.5], ['MARUTI', 12480.2], ['TITAN', 3412.6],
      ['ADANIENT', 2380.9], ['POWERGRID', 314.5], ['NTPC', 368.2],
      ['ONGC', 264.4], ['COALINDIA', 412.7], ['HINDUNILVR', 2614.8],
      ['ULTRACEMCO', 11240.5], ['DRREDDY', 1342.8], ['TECHM', 1712.3],
      ['DMART', 4508.2], ['NESTLEIND', 2410.7], ['PIDILITIND', 3184.9],
    ];

    // build one row's worth of cells from a shuffled ticker slice
    function buildRow() {
      const pool = TICKERS.slice().sort(() => Math.random() - 0.5);
      const row = document.createElement('div');
      row.className = 'tk-row';
      const makeSet = () => pool.map(([sym, base]) => {
        const up = Math.random() > 0.48;
        const chgPct = (Math.random() * 2.4 + 0.02) * (up ? 1 : -1);
        const chgAbs = base * chgPct / 100;
        const fmt = (n) => {
          const d = Math.abs(n) >= 1000 ? 0 : Math.abs(n) >= 100 ? 1 : 2;
          return n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
        };
        const arrow = up ? '▲' : '▼';
        return `<span class="tk-cell">
          <span class="tk-sym">${sym}</span>
          <span class="tk-px">${fmt(base + chgAbs)}</span>
          <span class="tk-chg ${up ? 'up' : 'down'}">${arrow} ${Math.abs(chgPct).toFixed(2)}%</span>
        </span>`;
      }).join('');
      // duplicate content so the horizontal loop is seamless at -50%
      row.innerHTML = makeSet() + makeSet();
      return row;
    }

    // fill enough rows to cover the viewport height
    const ROW_COUNT = 32;
    for (let i = 0; i < ROW_COUNT; i++) tboard.appendChild(buildRow());

    // periodically flash a random cell and rewrite its value (market flicker)
    setInterval(() => {
      const cells = tboard.querySelectorAll('.tk-cell');
      if (!cells.length) return;
      // flash 4-8 cells at once
      const n = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        const cell = cells[Math.floor(Math.random() * cells.length)];
        const chg = cell.querySelector('.tk-chg');
        const px  = cell.querySelector('.tk-px');
        if (!chg || !px) continue;

        const newUp = Math.random() > 0.5;
        const newPct = (Math.random() * 2.6 + 0.02) * (newUp ? 1 : -1);
        const curPx = parseFloat(px.textContent.replace(/,/g, '')) || 100;
        const delta = curPx * (newPct / 100) * 0.12; // small nudge
        const nextPx = Math.max(0.01, curPx + delta);
        const d = nextPx >= 1000 ? 0 : nextPx >= 100 ? 1 : 2;
        px.textContent = nextPx.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

        chg.classList.remove('up', 'down');
        chg.classList.add(newUp ? 'up' : 'down');
        chg.textContent = `${newUp ? '▲' : '▼'} ${Math.abs(newPct).toFixed(2)}%`;

        const flash = newUp ? 'flash-up' : 'flash-down';
        chg.classList.add(flash);
        setTimeout(() => chg.classList.remove(flash), 280);
      }
    }, 420);
  }

  // ===== Page transitions =====
  (function() {
    let overlay = document.getElementById('ptOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition';
      overlay.id = 'ptOverlay';
      overlay.innerHTML = `<div class="pt-logo"><img src="assets/logo-full.png" alt="Vestima"></div>`;
      document.body.appendChild(overlay);
    }

    // === Incoming: html.pt-incoming was set by the inline head script BEFORE first paint ===
    if (document.documentElement.classList.contains('pt-incoming')) {
      sessionStorage.removeItem('pt-incoming');
      // Start reveal immediately, no hold
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('pt-incoming');
        overlay.classList.add('anim-down');
        setTimeout(() => overlay.classList.remove('anim-down'), 300);
      });
    }

    // === Outgoing: click internal link, slide overlay up, then navigate ===
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank') return;
      if (!href.startsWith('/')) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        document.body.classList.add('pt-squeezing');
        overlay.classList.add('anim-up');
        sessionStorage.setItem('pt-incoming', '1');
        setTimeout(() => { window.location.href = href; }, 220);
      });
    });

    // Safety: bfcache restore
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.documentElement.classList.remove('pt-incoming');
        document.body.classList.remove('pt-squeezing', 'pt-hidden');
        overlay.classList.remove('anim-up', 'anim-down', 'covering');
      }
    });
  })();

  // ===== Tweaks =====
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#204764"
  }/*EDITMODE-END*/;

  let panel = null;
  function applyTweak(k, v) {
    if (k === 'accent') {
      document.documentElement.style.setProperty('--primary-600', v);
    }
  }
  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'tweaks-panel';
    panel.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#fff;border:1px solid rgba(19,43,60,0.12);border-radius:16px;padding:20px;box-shadow:0 20px 50px -18px rgba(19,43,60,0.25);z-index:200;width:260px;font-family:var(--font-body);';
    panel.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.16em;color:var(--primary-600);text-transform:uppercase;margin-bottom:12px;font-weight:500;">Tweaks</div>
      <div style="font-size:13px;color:var(--text-heading);font-weight:500;margin-bottom:10px;">Accent</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['#204764','#132B3C','#4D6C83','#009951','#C00F0C','#E5A000'].map(c =>
          `<button data-accent="${c}" style="width:28px;height:28px;border-radius:50%;background:${c};border:2px solid #fff;outline:1px solid rgba(19,43,60,0.15);cursor:pointer"></button>`
        ).join('')}
      </div>
    `;
    panel.querySelectorAll('[data-accent]').forEach(b => {
      b.addEventListener('click', () => {
        const c = b.dataset.accent;
        applyTweak('accent', c);
        window.parent.postMessage({type:'__edit_mode_set_keys', edits:{accent: c}}, '*');
      });
    });
    document.body.appendChild(panel);
  }
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === '__activate_edit_mode') {
      if (!panel) buildPanel();
      panel.style.display = 'block';
    } else if (e.data.type === '__deactivate_edit_mode') {
      if (panel) panel.style.display = 'none';
    }
  });
  Object.entries(TWEAK_DEFAULTS).forEach(([k,v]) => applyTweak(k,v));
  setTimeout(() => window.parent.postMessage({type:'__edit_mode_available'}, '*'), 100);
})();
