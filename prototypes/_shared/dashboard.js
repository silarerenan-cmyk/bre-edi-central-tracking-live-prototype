/**
 * dashboard.js — renders a live analytics dashboard for a prototype.
 *
 * Reads from the same localStorage key the tracker writes to.
 * Pass ?id=prototype-id in the URL to inspect a specific prototype.
 */
(function () {
  const params = new URLSearchParams(location.search);
  const prototypeId = params.get('id');

  if (!prototypeId) {
    document.body.innerHTML = renderPicker();
    return;
  }

  const STORAGE_KEY = 'HT_EVENTS_' + prototypeId;

  function loadEvents() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function fmtSec(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return s + 's';
    if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
  }

  function summarize(events) {
    const counts = {}, byTrack = {}, byPath = {}, byField = {}, scroll = { 25: 0, 50: 0, 75: 0, 100: 0 };
    const participants = new Set(), sessions = new Set();
    let totalActiveMs = 0, totalMs = 0, lastTs = 0, firstTs = Infinity;
    events.forEach((e) => {
      counts[e.type] = (counts[e.type] || 0) + 1;
      if (e.track) byTrack[e.track] = (byTrack[e.track] || 0) + 1;
      if (e.path) byPath[e.path] = (byPath[e.path] || 0) + 1;
      if (e.field) byField[e.field] = (byField[e.field] || 0) + 1;
      if (e.type === 'scroll_depth' && scroll[e.depth] != null) scroll[e.depth]++;
      if (e.participantId) participants.add(e.participantId);
      if (e.sessionId) sessions.add(e.sessionId);
      if (e.type === 'page_exit' || e.type === 'screen_change') {
        totalActiveMs += e.activeMs || 0;
        totalMs += e.totalMs || 0;
      }
      if (e.ts) {
        lastTs = Math.max(lastTs, e.ts);
        firstTs = Math.min(firstTs, e.ts);
      }
    });
    return {
      counts, byTrack, byPath, byField, scroll,
      participants: participants.size,
      sessions: sessions.size,
      totalActiveMs, totalMs,
      firstTs: isFinite(firstTs) ? firstTs : null,
      lastTs: lastTs || null,
      total: events.length,
    };
  }

  function topRows(obj, max = 10) {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, max);
    const peak = entries[0]?.[1] || 1;
    return entries.map(([k, v]) => `
      <tr>
        <td>${escapeHtml(k)}</td>
        <td class="num">${v}<div class="bar"><span style="width:${(v / peak) * 100}%"></span></div></td>
      </tr>`).join('') || '<tr><td colspan="2" style="color:var(--muted)">no data yet</td></tr>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderPicker() {
    const ids = Object.keys(localStorage)
      .filter((k) => k.startsWith('HT_EVENTS_'))
      .map((k) => k.replace('HT_EVENTS_', ''));
    const list = ids.length
      ? ids.map((id) => `<li><a href="?id=${encodeURIComponent(id)}">${escapeHtml(id)}</a></li>`).join('')
      : '<li style="color:var(--muted)">No tracked prototypes found in this browser yet. Open a prototype first, click around, then come back.</li>';
    return `<div class="dash">
      <h1>Hypothesis Dashboard</h1>
      <p class="sub">Pick a prototype to inspect:</p>
      <ul>${list}</ul>
    </div>`;
  }

  function render() {
    const events = loadEvents();
    const s = summarize(events);
    const meta = events[events.length - 1] || {};
    const cfg = { hypothesis: meta.hypothesis || '', variant: meta.variant || '' };

    document.body.innerHTML = `
      <div class="dash">
        <h1>${escapeHtml(prototypeId)} <span class="pill">variant ${escapeHtml(meta.variant || 'A')}</span></h1>
        <p class="sub">${s.firstTs ? `${new Date(s.firstTs).toLocaleString()} → ${new Date(s.lastTs).toLocaleString()}` : 'No events yet.'}</p>

        <div class="toolbar">
          <button id="refresh">Refresh</button>
          <button id="dl-json">Download JSON</button>
          <button id="dl-csv">Download CSV</button>
          <button id="copy">Copy summary</button>
          <button id="clear" class="danger">Clear data</button>
          <a href="./" style="margin-left:auto;color:var(--muted);align-self:center">← all prototypes</a>
        </div>

        <div class="grid">
          <div class="card"><h3>Total events</h3><div class="kpi">${s.total}<small>${Object.keys(s.counts).length} event types</small></div></div>
          <div class="card"><h3>Participants</h3><div class="kpi">${s.participants}<small>${s.sessions} sessions</small></div></div>
          <div class="card"><h3>Active time</h3><div class="kpi">${fmtSec(s.totalActiveMs)}<small>of ${fmtSec(s.totalMs)} elapsed</small></div></div>
          <div class="card"><h3>Avg session</h3><div class="kpi">${s.sessions ? fmtSec(s.totalActiveMs / s.sessions) : '—'}<small>active per session</small></div></div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Top tracked clicks (data-track)</h3>
            <table><thead><tr><th>track id</th><th class="num">clicks</th></tr></thead><tbody>${topRows(s.byTrack)}</tbody></table>
          </div>
          <div class="card">
            <h3>Most viewed paths</h3>
            <table><thead><tr><th>path</th><th class="num">views</th></tr></thead><tbody>${topRows(s.byPath)}</tbody></table>
          </div>
          <div class="card">
            <h3>Form field engagement</h3>
            <table><thead><tr><th>field</th><th class="num">interactions</th></tr></thead><tbody>${topRows(s.byField)}</tbody></table>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3>Scroll depth funnel</h3>
            <table><tbody>
              ${[25, 50, 75, 100].map((d) => `
                <tr><td>${d}%</td><td class="num">${s.scroll[d]}<div class="bar"><span style="width:${s.scroll[100] ? (s.scroll[d] / Math.max(s.scroll[25], 1)) * 100 : 0}%"></span></div></td></tr>
              `).join('')}
            </tbody></table>
          </div>
          <div class="card">
            <h3>Event types</h3>
            <table><thead><tr><th>type</th><th class="num">count</th></tr></thead><tbody>${topRows(s.counts)}</tbody></table>
          </div>
          <div class="card">
            <h3>Hypothesis</h3>
            <p style="color:var(--muted);font-size:13px">${escapeHtml(cfg.hypothesis || 'No hypothesis recorded. Set data-hypothesis on the tracker script tag.')}</p>
          </div>
        </div>

        <div class="card">
          <h3>Recent events (last 100)</h3>
          <div class="events">
            ${events.slice(-100).reverse().map((e) => `
              <div class="row"><span class="t">${new Date(e.ts).toLocaleTimeString()}</span>
                <b>${escapeHtml(e.type)}</b>
                ${e.track ? ' · track=' + escapeHtml(e.track) : ''}
                ${e.text ? ' · "' + escapeHtml(e.text) + '"' : ''}
                ${e.path ? ' · ' + escapeHtml(e.path) : ''}
                ${e.depth != null ? ' · ' + e.depth + '%' : ''}
                ${e.field ? ' · field=' + escapeHtml(e.field) : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>`;

    document.getElementById('refresh').onclick = render;
    document.getElementById('clear').onclick = () => {
      if (confirm('Delete all tracked events for "' + prototypeId + '"?')) {
        localStorage.removeItem(STORAGE_KEY);
        render();
      }
    };
    document.getElementById('dl-json').onclick = () => download('json', { prototypeId, exportedAt: new Date().toISOString(), events });
    document.getElementById('dl-csv').onclick = () => downloadCsv(events);
    document.getElementById('copy').onclick = () => {
      navigator.clipboard.writeText(JSON.stringify({ prototypeId, summary: s }, null, 2));
    };
  }

  function download(ext, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${prototypeId}_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`;
    a.click();
  }

  function downloadCsv(events) {
    const cols = ['ts', 'iso', 'type', 'variant', 'participantId', 'sessionId', 'path', 'track', 'selector', 'text', 'depth', 'field', 'formId', 'activeMs', 'totalMs', 'href'];
    const rows = [cols.join(',')];
    events.forEach((e) => {
      rows.push(cols.map((c) => {
        let v = e[c];
        if (v == null) return '';
        if (typeof v === 'object') v = JSON.stringify(v);
        v = String(v).replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      }).join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${prototypeId}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    a.click();
  }

  render();
  setInterval(() => { if (!document.hidden) render(); }, 5000);
})();
