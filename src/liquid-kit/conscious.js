/* ============================================================================
   conscious.js — the "living site" engine. Drives the early-2000s metrics that
   make the page feel awake: a persistent hit counter, a PHPCurrently status
   block, an uptime clock, "last updated", and a streaming commit log. All of it
   is SIMULATED but persisted in localStorage so the numbers remember you.

   → To wire REAL data, replace pushCommit()'s source with the GitHub API:
       const r = await fetch(`https://api.github.com/users/${USER}/events/public`);
       const events = await r.json();  // PushEvents carry commits + repo + timestamp
     and seed commitCount / projects from the REST API (or a build-time JSON).

   Framework-agnostic: it binds to [data-cx="…"] hooks in the DOM. Call
   initConscious() after render; it returns a stop() for cleanup (React effects).
   ============================================================================ */

export function initConscious(opts = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s) => document.querySelector(s);
  const ids = [];
  const every = (ms, fn) => { fn(); ids.push(setInterval(fn, reduce ? ms * 2.4 : ms)); };
  const after = (ms, fn) => { ids.push(setTimeout(fn, ms)); };
  const LS = {
    get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  const LAUNCH = Date.parse(opts.launch || '2003-08-01T00:00:00');
  let lastCommitTs = Date.now() - 1000 * 60 * (2 + Math.floor(Math.random() * 8));

  const ago = (ts) => {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + 's ago';
    const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  };
  const odometer = (el, num, pad = 6) =>
    el.innerHTML = String(num).padStart(pad, '0').split('').map((d) => `<span class="lq-digit">${d}</span>`).join('');
  const flick = (el) => { el.classList.remove('lq-flick'); void el.offsetWidth; el.classList.add('lq-flick'); };

  /* ---- hit counter: +1 per visit, persisted, only ever climbs ---- */
  const hitEl = $('[data-cx="hits"]');
  let hits = parseInt(LS.get('lq-hits', String(13800 + Math.floor(Math.random() * 240))), 10);
  hits += 1; LS.set('lq-hits', String(hits));
  if (hitEl) odometer(hitEl, hits);

  /* ---- visitors online: gentle flicker ---- */
  const onlineEl = $('[data-cx="online"]');
  if (onlineEl) every(reduce ? 9000 : 4200, () => { onlineEl.textContent = 2 + Math.floor(Math.random() * 8); });

  /* ---- uptime since launch ---- */
  const upEl = $('[data-cx="uptime"]');
  if (upEl) every(1000, () => {
    const d = Date.now() - LAUNCH, days = Math.floor(d / 86400000);
    const h = Math.floor(d / 3600000) % 24, m = Math.floor(d / 60000) % 60, s = Math.floor(d / 1000) % 60;
    upEl.textContent = `${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  /* ---- last updated (since the most recent commit) ---- */
  const updEl = $('[data-cx="updated"]');
  if (updEl) every(1000, () => { updEl.textContent = ago(lastCommitTs); });

  /* ---- PHPCurrently: rotating status fields ---- */
  const pools = {
    building: ['warmcore', 'the wgpu explorer', 'a CRDT bug fix', 'delta-mip v2', 'this very site', "SAM's power budget"],
    listening: ['boards of canada', 'aphex twin', 'a rainstorm.wav', 'lo-fi & a fan', 'massive attack', 'just the sea'],
    feeling: ['caffeinated', 'in the zone', 'slightly underwater', 'optimistic', 'nocturnal', 'like shipping'],
    coffee: ['cup #3', 'cold brew', 'a flat white', 'too much', '#4 incoming', 'black, no sugar'],
  };
  Object.keys(pools).forEach((k) => {
    const el = $(`[data-cx="cur-${k}"]`); if (!el) return;
    let i = Math.floor(Math.random() * pools[k].length); el.textContent = pools[k][i];
    every(reduce ? 15000 : 6500 + Math.random() * 3500, () => { i = (i + 1) % pools[k].length; el.textContent = pools[k][i]; flick(el); });
  });

  /* ---- commit log + counters ---- */
  const logEl = $('[data-cx="commit-log"]');
  const ccEl = $('[data-cx="commit-count"]');
  const projEl = $('[data-cx="projects"]');
  let commitCount = parseInt(LS.get('lq-commits', String(1247 + Math.floor(Math.random() * 40))), 10);
  let projects = parseInt(LS.get('lq-projects', '14'), 10);
  if (ccEl) ccEl.textContent = commitCount.toLocaleString();
  if (projEl) projEl.textContent = projects;

  const repos = ['warmcore', 'tideline', 'coral', 'mariner', 'liquid-kit', 'crow', 'sam', 'vulkan-renderer'];
  const msgs = ['fix: clamp velocity in vorticity pass', 'feat: add LCD readout', 'refactor: split fluid engine',
    'perf: cap DPR on hi-dpi', 'docs: update the README', 'wip: blow-to-ripple', 'chore: bump deps',
    'fix: muddy water in light mode', 'feat: salvage skin', 'test: cover splat math', 'style: engrave the labels'];
  const rowFor = (ts) => {
    const repo = repos[Math.floor(Math.random() * repos.length)];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    const sha = Math.random().toString(16).slice(2, 9);
    const li = document.createElement('li');
    li.className = 'lq-commit';
    li.innerHTML = `<code>${sha}</code> <b>${repo}</b> ${msg} <span class="lq-commit-ago" data-ts="${ts}">${ago(ts)}</span>`;
    return li;
  };
  if (logEl) {
    for (let i = 5; i >= 1; i--) logEl.appendChild(rowFor(Date.now() - i * 1000 * 60 * (3 + Math.floor(Math.random() * 14))));
    every(1000, () => logEl.querySelectorAll('.lq-commit-ago').forEach((s) => { s.textContent = ago(parseInt(s.dataset.ts, 10)); }));
    const tick = () => after((reduce ? 30000 : 11000) + Math.random() * (reduce ? 30000 : 20000), () => {
      lastCommitTs = Date.now(); commitCount++; LS.set('lq-commits', String(commitCount));
      if (ccEl) { ccEl.textContent = commitCount.toLocaleString(); flick(ccEl); }
      const li = rowFor(lastCommitTs); logEl.prepend(li); flick(li);
      while (logEl.children.length > 6) logEl.lastChild.remove();
      tick();
    });
    tick();
  }

  /* ---- a new project, very occasionally ---- */
  if (projEl) {
    const grow = () => after(90000 + Math.random() * 150000, () => {
      projects++; LS.set('lq-projects', String(projects)); projEl.textContent = projects; flick(projEl); grow();
    });
    grow();
  }

  return () => ids.forEach((id) => { clearInterval(id); clearTimeout(id); });
}

if (typeof window !== 'undefined') window.initConscious = initConscious;
