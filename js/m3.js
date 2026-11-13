/*@v:8c0d81398d*/
// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
function setStatus(type, msg) {
  const box = document.getElementById('status-box');
  box.className = 'status-box' + (type ? ' show ' + type : '');
  box.textContent = msg;
}
// ═══════════════════════════════════════════════════════════════
// AUTH - only for protected views (add-match, aliases)
// ═══════════════════════════════════════════════════════════════
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function checkEventsLogin() {
  const input = document.getElementById('events-login-input');
  const errorEl = document.getElementById('events-login-error');
  const val = input?.value?.trim();
  if (!val) { if(errorEl) errorEl.textContent = '❌ Podaj hasło'; return; }
  if (errorEl) errorEl.textContent = '';

  // Send plain password to Worker (Worker compares directly with ADMIN_TOKEN_EVENTS secret)
  const hash = val;

  const doLogin = () => {
    localStorage.setItem('nba2k_events_auth', 'ok');
    localStorage.setItem('nba2k_events_token_hash', val);
    document.getElementById('events-auth-modal').classList.remove('open');
    updateEventsAuthUI();
    renderEvents();
    showToast('✅ Zalogowano jako manager eventów', 'success');
  };

  const doFail = () => {
    if (errorEl) errorEl.textContent = '❌ Nieprawidłowe hasło';
    input.value = '';
  };

  // Try Worker first (site='events') — works for everyone regardless of browser
  if (workerUrl) {
    try {
      const res = await fetch(workerUrl.replace(/\/$/, '') + '/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: hash, site: 'events' })
      });
      const data = await res.json();
      if (data.ok) { doLogin(); return; }
      else { doFail(); return; }
    } catch(e) {
      if (errorEl) errorEl.textContent = '❌ Błąd połączenia z Workerem: ' + e.message;
      return;
    }
  }

  // Fallback: local hash (only works if admin set it on same browser — not recommended)
  if (storedHash && hash === storedHash) {
    doLogin();
  } else {
    doFail();
  }
}
async function checkLogin() {
  const val = document.getElementById('login-input').value.trim();
  if(!val) return;

  const loginError = document.getElementById('login-error');
  const loginInput = document.getElementById('login-input');
  const box = document.querySelector('#auth-modal .login-box');

  const fail = () => {
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 400);
    loginError.textContent = '❌ Nieprawidłowe hasło';
    loginInput.value = '';
    loginInput.focus();
  };

  if(workerUrl) {
    // ── Verify via Cloudflare Worker (hash never stored in HTML) ──
    try {
      loginError.textContent = '⏳ Sprawdzanie...';
      const hash = await sha256('nba2k26liga2025' + val);
      const res = await fetch(workerUrl.replace(/\/$/, '') + '/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: hash, site: 'nba' })
      });
      const data = await res.json();
      if(data.ok) {
        localStorage.setItem('nba2k_auth', 'ok');
        localStorage.setItem('nba2k_admin_token_hash', hash);
        document.getElementById('auth-modal').classList.remove('open');
        if(pendingAuthView) { const v = pendingAuthView; pendingAuthView = null; showView(v); }
        updateAuthUI();
      } else {
        fail();
      }
    } catch(e) {
      console.error('Worker auth error:', e);
      loginError.textContent = '❌ Błąd: ' + e.message + ' (sprawdź konsolę F12)';
    }
  } else {
    // ── Fallback: local hash check (no Worker configured) ──
    const _PW_SALT = 'nba2k26liga2025';
    const STORED_HASH = localStorage.getItem('nba2k_pw_hash') || '';
    const hash = await sha256(_PW_SALT + val);
    if(STORED_HASH && hash === STORED_HASH) {
      localStorage.setItem('nba2k_auth', 'ok');
      localStorage.setItem('nba2k_admin_token_hash', hash);
      document.getElementById('auth-modal').classList.remove('open');
      if(pendingAuthView) { const v = pendingAuthView; pendingAuthView = null; showView(v); }
      updateAuthUI();
    } else {
      fail();
    }
  }
}
function logout() {
  localStorage.removeItem('nba2k_auth');
  localStorage.removeItem('nba2k_admin_token_hash');
  showView('dashboard');
  updateAuthUI();
}
// ═══════════════════════════════════════════════════════════════
// SETUP & INIT
// ═══════════════════════════════════════════════════════════════
function openSetupModal() {
  // Pre-fill existing values (masked)
  if(jbBin) document.getElementById('setup-bin').value = jbBin;
  if(workerUrl) { const w = document.getElementById('setup-worker'); if(w) w.value = workerUrl; }
  // Set correct radio
  const savedModel = localStorage.getItem('nba2k_ai_model') || 'claude-sonnet-4-20250514';
  document.querySelectorAll('input[name="ai-model"]').forEach(r => {
    r.checked = r.value === savedModel;
    const lbl = r.closest('label');
    lbl.style.borderColor = r.checked ? 'var(--accent)' : 'var(--border)';
    lbl.style.background = r.checked ? 'rgba(245,197,24,.06)' : '';
  });
  document.querySelectorAll('input[name="ai-model"]').forEach(r => {
    r.addEventListener('change', () => {
      document.querySelectorAll('input[name="ai-model"]').forEach(x => {
        const lbl = x.closest('label');
        lbl.style.borderColor = x.checked ? 'var(--accent)' : 'var(--border)';
        lbl.style.background = x.checked ? 'rgba(245,197,24,.06)' : '';
      });
    });
  });
  document.getElementById('setup-error').textContent = '';
  const _wh = document.getElementById('setup-webhook');
  if(_wh) _wh.value = discordWebhookUrl || '';
  const _whn = document.getElementById('setup-webhook-note');
  if(_whn) _whn.style.display = workerUrl ? 'block' : 'none';
  document.getElementById('setup-modal').classList.add('open');
}
async function saveSetup() {
  const key = document.getElementById('setup-key').value.trim();
  const bin = document.getElementById('setup-bin').value.trim();
  const errEl = document.getElementById('setup-error');
  const btnText = document.getElementById('setup-btn-text');
  if(!key || !bin) { errEl.textContent = '❌ Uzupełnij oba pola'; return; }

  btnText.innerHTML = '<div class="spinner" style="border-color:rgba(0,0,0,0.3);border-top-color:#000"></div> Łączenie...';

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${bin}/latest`, {
      headers: { 'X-Master-Key': key }
    });
    if(!res.ok) throw new Error('Błędny klucz lub Bin ID (HTTP ' + res.status + ')');
    const data = await res.json();

    const aKey = document.getElementById('setup-anthropic').value.trim();
    // Anthropic key optional — Worker handles it if workerUrl is set

    jbKey = key;
    jbBin = bin;
    anthropicKey = aKey;
    const wUrl = document.getElementById('setup-worker')?.value?.trim() || '';
    workerUrl = wUrl;
    const selectedModel = document.querySelector('input[name="ai-model"]:checked')?.value || 'claude-sonnet-4-20250514';
    aiModel = selectedModel;
    localStorage.setItem('nba2k_jb_key', key);
    localStorage.setItem('nba2k_jb_bin', bin);
    localStorage.setItem('nba2k_anthropic_key', aKey);
    localStorage.setItem('nba2k_worker_url', wUrl);
    localStorage.setItem('nba2k_ai_model', selectedModel);
    const wHook = document.getElementById('setup-webhook')?.value?.trim() || '';
    discordWebhookUrl = wHook;
    localStorage.setItem('nba2k_discord_webhook', wHook);
    // Save webhook to Worker KV so it persists across devices/browsers
    if(wUrl && wHook) {
      const adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
      fetch(wUrl.replace(/\/$/, '') + '/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify({ discordWebhookUrl: wHook })
      }).catch(() => {}); // fire and forget
    }

    matches = data.record?.matches || [];
    aliases = data.record?.aliases || {};
    seasons = data.record?.seasons || [];
    currentSeasonId = data.record?.currentSeasonId || null;
    schedule = data.record?.schedule || [];
    teams = data.record?.teams || {};
    rounds = data.record?.rounds || [];
    pendingScreenshots = data.record?.pendingScreenshots || [];
    window.teams = teams;
    localStorage.setItem('nba2k_aliases', JSON.stringify(aliases));

    document.getElementById('setup-modal').classList.remove('open');
    // Update URL hash with bin ID so visitors can read data too
    window.location.hash = 'bin=' + bin;
    // Save events password hash if provided
    const eventsPw = document.getElementById('setup-events-pw')?.value?.trim();
    if (eventsPw) {
      const _EVENTS_SALT = 'nba2k26liga2025events';
      sha256(_EVENTS_SALT + eventsPw).then(hash => {
        localStorage.setItem('nba2k_events_pw_hash', hash);
        showToast('🏆 Hasło managera eventów zapisane', 'success');
      });
      document.getElementById('setup-events-pw').value = '';
    }
    renderDashboard();
    updateAuthUI();
    showToast('✅ Połączono! Udostępnij link z paska adresu innym.', 'success');
  } catch(e) {
    errEl.textContent = '❌ ' + e.message;
  }
  btnText.textContent = '✅ Zapisz i połącz';
}
function showCaptainNotification(ev) {
  document.getElementById('captain-notif')?.remove();

  const div = document.createElement('div');
  div.id = 'captain-notif';
  div.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,.75);backdrop-filter:blur(4px);
    animation:fadeIn .25s ease;
  `;

  // Find team name for this captain
  const team = (ev.teams||[]).find(t => discordUser && t.captain?.id === discordUser.id);
  const teamName = team?.name || '';

  div.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:2px solid var(--accent);border-radius:20px;
      padding:2.5rem 2rem;max-width:440px;width:90%;
      text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.8);
      font-family:'Barlow Condensed',sans-serif;
      animation:slideUp .35s ease;
    ">
      <div style="font-size:3.5rem;margin-bottom:.5rem">🎮</div>
      <div style="font-weight:900;font-size:2rem;letter-spacing:2px;color:var(--accent);margin-bottom:.5rem">JESTEŚ KAPITANEM!</div>
      <div style="font-size:1.1rem;color:var(--text);margin-bottom:.25rem">
        Event: <b>${ev.title}</b>
      </div>
      ${teamName ? `<div style="font-size:1.3rem;font-weight:900;color:#fff;margin:.5rem 0 1.25rem;padding:.5rem 1rem;background:rgba(245,197,24,.15);border:1px solid rgba(245,197,24,.3);border-radius:8px">
        🏀 Twoja drużyna: <span style="color:var(--accent)">${teamName}</span>
      </div>` : '<div style="margin-bottom:1.25rem"></div>'}
      <div style="color:var(--muted);font-size:.9rem;margin-bottom:1.5rem">
        Jako kapitan wybierasz graczy podczas draftu.<br>Przejdź do Panelu GM aby zarządzać drużyną.
      </div>
      <div style="display:flex;gap:.75rem;justify-content:center">
        <button onclick="openGMPanel('${ev.id}');document.getElementById('captain-notif')?.remove()"
          style="flex:1;max-width:220px;background:var(--accent);border:none;color:#000;border-radius:10px;padding:.85rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;cursor:pointer;box-shadow:0 4px 16px rgba(245,197,24,.4)">
          🎮 Panel GM →
        </button>
        <button onclick="document.getElementById('captain-notif')?.remove()"
          style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:10px;padding:.85rem 1rem;font-family:inherit;cursor:pointer;font-size:.9rem">
          Zamknij
        </button>
      </div>
    </div>
  `;

  // Close on backdrop click
  div.addEventListener('click', e => { if(e.target === div) div.remove(); });
  document.body.appendChild(div);
}
function setRcMode(mode) {
  _rcMode = mode;
  document.querySelectorAll('.rc-toggle-btn').forEach(function(b) {
    var active = b.dataset.mode === mode;
    var isCs = b.dataset.mode === 'cs';
    b.style.background = active ? (isCs ? 'var(--accent)' : '#3498db') : 'transparent';
    b.style.color = active ? (isCs ? '#000' : '#fff') : 'var(--muted)';
    b.style.border = 'none';
  });
  renderRoundComparisonRows();
}
function renderRoundComparisonRows() {
  const wrap = document.getElementById('rc-rows-wrap');
  if(!wrap || !_rcData) return;
  const { r1, r2, both, agg1, agg2, m2 } = _rcData;
  const mode = _rcMode;

  const deltas = both.map(name => {
    const p1 = agg1[name], p2 = agg2[name];
    const cs1 = calcCompositeScore(p1), cs2 = calcCompositeScore(p2);
    const per1 = p1.gp > 0 ? p1.pts / p1.gp : 0;
    const per2 = p2.gp > 0 ? p2.pts / p2.gp : 0;
    const gr1 = p1.gp>0 ? numToGrade(p1.gradeSum/p1.gp) : 'B';
    const gr2 = p2.gp>0 ? numToGrade(p2.gradeSum/p2.gp) : 'B';
    const val1 = mode === 'cs' ? cs1 : per1;
    const val2 = mode === 'cs' ? cs2 : per2;
    return { name, team: p2.team, cs1, cs2, per1, per2, val1, val2, delta: val2-val1, gr1, gr2, p1, p2 };
  }).sort((a,b) => b.delta - a.delta);

  const qualified = deltas.filter(d => d.p1.gp >= 3 && d.p2.gp >= 3);
  const improved = qualified.filter(d => d.delta > 0).slice(0,3);
  const declined = qualified.filter(d => d.delta < 0).sort((a,b)=>a.delta-b.delta).slice(0,3);
  const unit = mode === 'cs' ? 'CS' : 'PER';
  const hasR2 = m2.length > 0;

  function playerRow(d) {
    const arrow = d.delta > 0 ? '▲' : '▼';
    const color = d.delta > 0 ? 'var(--win)' : 'var(--loss)';
    const sign  = d.delta > 0 ? '+' : '';
    const sub1  = mode === 'cs' ? d.cs1.toFixed(1) : d.per1.toFixed(1);
    const sub2  = mode === 'cs' ? d.cs2.toFixed(1) : d.per2.toFixed(1);
    return `<div style="display:flex;align-items:center;gap:.6rem;padding:.5rem 0;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:.9rem;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openPlayerModal('${d.name}','${d.team}')" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color=''">${d.name}</div>
        <div style="font-size:.72rem;color:var(--muted)">${d.team}</div>
      </div>
      <div style="text-align:center;min-width:50px">
        <div style="font-size:.7rem;color:var(--muted)">${r1.label}</div>
        <span class="grade grade-${d.gr1.replace('+','p').replace('-','m')}">${d.gr1}</span>
        <div style="font-size:.72rem;color:var(--muted)">${sub1} ${unit}</div>
      </div>
      <div style="font-size:1.2rem;color:var(--muted)">→</div>
      <div style="text-align:center;min-width:50px">
        <div style="font-size:.7rem;color:var(--muted)">${r2.label}</div>
        <span class="grade grade-${d.gr2.replace('+','p').replace('-','m')}">${d.gr2}</span>
        <div style="font-size:.72rem;color:var(--muted)">${sub2} ${unit}</div>
      </div>
      <div style="min-width:52px;text-align:right;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;color:${color}">${arrow} ${sign}${d.delta.toFixed(1)}<div style="font-size:.65rem;font-weight:400;color:var(--muted)">${unit}</div></div>
    </div>`;
  }

  wrap.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="card" style="padding:1rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:1px;color:var(--win);margin-bottom:.75rem">📈 NAJWIĘKSZY PROGRES<div style="font-size:.72rem;font-weight:400;color:var(--muted)">${r1.label} → ${r2.label}</div></div>
        ${improved.length ? improved.map(playerRow).join('') : '<div style="color:var(--muted);font-size:.85rem;padding:.5rem 0">'+( hasR2 ? 'Brak danych' : r2.label+' jeszcze nie rozegrana')+'</div>'}
      </div>
      <div class="card" style="padding:1rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:1px;color:var(--loss);margin-bottom:.75rem">📉 NAJWIĘKSZY SPADEK<div style="font-size:.72rem;font-weight:400;color:var(--muted)">${r1.label} → ${r2.label}</div></div>
        ${declined.length ? declined.map(playerRow).join('') : '<div style="color:var(--muted);font-size:.85rem;padding:.5rem 0">'+( hasR2 ? 'Brak danych' : r2.label+' jeszcze nie rozegrana')+'</div>'}
      </div>
    </div>`;
}
async function shareEventRatings() {
  // Find the active event for title/date/match count
  const ev = events.filter(e => (e.matches||[]).length > 0)
    .sort((a,b) => new Date(b.date||0) - new Date(a.date||0))[0];
  if(!ev) { showToast('Brak danych do eksportu', 'error'); return; }

  const matchCount = (ev.matches||[]).length;
  const playerCount = (() => {
    const names = new Set();
    (ev.matches||[]).forEach(m => {
      [...(m.team1?.players||[]), ...(m.team2?.players||[])].forEach(p => { if(p.name) names.add(p.name); });
    });
    return names.size;
  })();

  // Build a self-contained canvas-friendly div
  const wrap = document.getElementById('event-ratings-wrap');
  if(!wrap) return;

  const table = wrap.querySelector('table');
  if(!table) { showToast('Brak tabeli do eksportu', 'error'); return; }

  const ACCENT = '#f5c518';
  const BG     = '#0f1117';
  const SURF   = '#1a1d27';
  const BORDER = '#2a2d3a';
  const TEXT   = '#e8eaf0';
  const MUTED  = '#6b7280';

  // Collect rows from the rendered table
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  // Build export div
  const exp = document.createElement('div');
  exp.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:780px;background:${BG};font-family:'Barlow Condensed',sans-serif;padding:0;border-radius:12px;overflow:hidden`;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `background:${SURF};border-bottom:2px solid ${ACCENT};padding:16px 20px;display:flex;align-items:center;justify-content:space-between`;
  header.innerHTML = `
    <div>
      <div style="font-size:1.3rem;font-weight:900;letter-spacing:2px;color:${TEXT}">🎯 RANKINGI GRACZY</div>
      <div style="font-size:.85rem;color:${ACCENT};font-weight:700;margin-top:2px">${ev.title}</div>
    </div>
    <div style="text-align:right;font-size:.78rem;color:${MUTED}">
      <div>${matchCount} mecz${matchCount===1?'':'e'} · ${playerCount} graczy</div>
    </div>`;
  exp.appendChild(header);

  // Table
  const tbl = document.createElement('table');
  tbl.style.cssText = `width:100%;border-collapse:collapse`;

  // Header row
  const thead = document.createElement('thead');
  const thRow = document.createElement('tr');
  thRow.style.cssText = `background:${SURF};border-bottom:1px solid ${BORDER}`;
  ['#','GRACZ','OVR','PPG','RPG','APG','SPG','BPG','FG%','W-L'].forEach((h,i) => {
    const th = document.createElement('th');
    th.textContent = h;
    th.style.cssText = `padding:8px ${i===1?'8px':'10px'};font-size:.7rem;color:${MUTED};font-weight:700;letter-spacing:.05em;text-align:${i<=1?'left':'center'}`;
    thRow.appendChild(th);
  });
  thead.appendChild(thRow);
  tbl.appendChild(thead);

  // Data rows — scrape from rendered DOM
  const tbody = document.createElement('tbody');
  rows.forEach((tr, ri) => {
    const tds = tr.querySelectorAll('td');
    if(!tds.length) return;
    const newTr = document.createElement('tr');
    newTr.style.cssText = `border-bottom:1px solid ${BORDER};background:${ri%2===0?BG:SURF}`;

    // Scrape cells: rank, name+pos, ovr, ppg, rpg, apg, spg, bpg, fg%, wl
    const rank = tds[0]?.textContent?.trim() || (ri+1);
    const nameTd = tds[1];
    const nameText = nameTd?.querySelector('span')?.textContent?.trim() || nameTd?.textContent?.trim() || '';
    const posEl = nameTd?.querySelector('[style*="font-size:.7rem"]') || nameTd?.querySelectorAll('span')[1];
    const posText = posEl?.textContent?.trim() || '';

    // OVR badge — get number and color
    const ovrBadge = tds[2]?.querySelector('span[style*="background"]');
    const ovrNum = ovrBadge?.textContent?.trim() || tds[2]?.textContent?.trim() || '';
    const ovrBg = ovrBadge?.style?.background || ACCENT;
    const deltaEl = tds[2]?.querySelector('span:last-child');
    const deltaText = deltaEl && deltaEl !== ovrBadge ? deltaEl?.textContent?.trim() : '';
    const deltaColor = deltaEl?.style?.color || TEXT;

    // Stats
    const statCells = Array.from(tds).slice(3);
    const statVals = statCells.map(td => {
      const hi = td.querySelector('span[style*="var(--accent)"]') || td.querySelector('span');
      return { val: hi?.textContent?.trim() || td?.textContent?.trim() || '—', hi: !!td.querySelector('span[style*="var(--accent)"]') };
    });

    // Build cells
    const mkTd = (html, align='center', bold=false) => {
      const td = document.createElement('td');
      td.innerHTML = html;
      td.style.cssText = `padding:9px 10px;font-size:.85rem;color:${TEXT};text-align:${align};font-weight:${bold?'700':'500'}`;
      return td;
    };

    // Rank
    newTr.appendChild(mkTd(`<span style="color:${MUTED};font-size:.78rem">${rank}</span>`));
    // Name
    const nameTdNew = document.createElement('td');
    nameTdNew.style.cssText = `padding:9px 8px;text-align:left`;
    nameTdNew.innerHTML = `<span style="font-weight:700;font-size:.9rem;color:${TEXT}">${nameText}</span>${posText?`<span style="font-size:.68rem;color:${MUTED};margin-left:6px">${posText}</span>`:''}`;
    newTr.appendChild(nameTdNew);
    // OVR
    newTr.appendChild(mkTd(`<span style="background:${ovrBg};color:rgba(0,0,0,.85);border-radius:4px;padding:2px 7px;font-weight:900;font-size:.9rem">${ovrNum}</span>${deltaText?`<span style="font-size:.7rem;color:${deltaColor};margin-left:3px">${deltaText}</span>`:''}`));
    // Stats
    statVals.forEach(({val, hi}) => {
      newTr.appendChild(mkTd(`<span style="color:${hi?ACCENT:TEXT};font-weight:${hi?'800':'500'}">${val}</span>`));
    });

    tbody.appendChild(newTr);
  });
  tbl.appendChild(tbody);
  exp.appendChild(tbl);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `background:${SURF};border-top:1px solid ${BORDER};padding:10px 20px;display:flex;justify-content:space-between;align-items:center`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('pl-PL', {day:'2-digit',month:'2-digit',year:'numeric'});
  footer.innerHTML = `
    <span style="font-size:.72rem;color:${MUTED}">2K Pro-Am Ekstraklasa</span>
    <span style="font-size:.72rem;color:${MUTED}">${dateStr}</span>`;
  exp.appendChild(footer);

  document.body.appendChild(exp);

  try {
    showToast('📋 Generuję obrazek...', 'info');
    const canvas = await html2canvas(exp, {
      backgroundColor: BG,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    document.body.removeChild(exp);

    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('✅ Skopiowano do schowka! Wklej na Discordzie (Ctrl+V)', 'success');
      } catch(e) {
        // Fallback — download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ranking-${ev.title.replace(/\s+/g,'-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📥 Pobrano jako PNG (schowek niedostępny)', 'info');
      }
    }, 'image/png');
  } catch(e) {
    if(document.body.contains(exp)) document.body.removeChild(exp);
    showToast('❌ Błąd eksportu: ' + e.message, 'error');
    console.error(e);
  }
}
// Wysyłka na kanał Discord przez Workera — linki webhooków są tylko w Workerze (niewidoczne publicznie)
async function _discordPost(channel, payload, fileDataUrl, fileName) {
  if(!workerUrl) return false;
  const body = { ...payload, channel };
  if(fileDataUrl) body.__file = { name: fileName || 'obraz.png', dataUrl: fileDataUrl };
  const headers = { 'Content-Type': 'application/json', 'X-Admin-Token': _adminToken() };
  if(discordUser?.session) headers['X-Discord-Session'] = discordUser.session;
  try {
    const r = await fetch(workerUrl.replace(/\/+$/, '') + '/discord-notify', { method: 'POST', headers, body: JSON.stringify(body) });
    if(r.ok) return true;
    console.warn('discord-notify', channel, r.status, await r.text().catch(() => ''));
  } catch(e) { console.warn('discord-notify error', e); }
  return false;
}
// Zgłoszenia drużyn (logo jako miniatura)
async function _teamRegDiscordSend(payload, logo, channel) {
  const embed = payload.embeds?.[0];
  let file = null, fname = null;
  if(embed && logo) {
    if(/^data:image\//.test(logo)) {
      const ext = ((logo.match(/data:image\/([\w+]+)/) || [])[1] || 'png').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
      fname = 'logo.' + ext; file = logo;
      embed.thumbnail = { url: 'attachment://' + fname };
    } else if(/^https?:/.test(logo)) embed.thumbnail = { url: logo };
  }
  return _discordPost(channel || 'teams', payload, file, fname);
}
function openTeamRegWebhookModal() { openWebhookModal('teams'); }
function openStreamsChannel() { openWebhookModal('streams'); }
async function openWebhookModal(kind) {
  _webhookKind = kind;
  const cfg = _WEBHOOK_KINDS[kind];
  const m = _fxModal('wh-modal', 520);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('wh-modal', cfg.title) + '<div style="color:var(--muted)">⏳ Wczytuję…</div>';
  m.classList.add('open');
  await _loadWebhookStatus();
  const st = _whStatus?.[kind] || {};
  box.innerHTML = _fxHead('wh-modal', cfg.title) + `
    <div style="font-size:.8rem;margin-bottom:.6rem">Status: ${st.set ? `<b style="color:var(--win)">✅ ustawiony</b> <span style="color:var(--muted);font-size:.72rem">${_h(st.masked)}</span>` : '<b style="color:var(--loss)">● nieustawiony</b>'}</div>
    <div style="font-size:.76rem;color:var(--muted);line-height:1.45;margin-bottom:.7rem">${_h(cfg.hint)}<br>🔒 Link webhooka jest zapisywany <b>tylko w Workerze</b> — nie trafia na publiczną stronę.</div>
    ${kind === 'achievements' ? `<label style="${_MODAL_LBL}">Automatyczne ogłoszenia</label>
      <select onchange="_api('/settings','POST',{achAuto:this.value},{admin:true}).then(r=>{if(r.ok){_whStatus=r;showToast('✅ Zapisano','success');}else showToast('❌ '+r.error,'error');})" style="${_MODAL_INP};margin-bottom:.8rem">
        ${[['rare', '⭐ Tylko rzadkie (triple-double, 40+ pkt, 8+ trójek, 100% z gry, kamienie milowe)'], ['all', '🎖 Wszystkie osiągnięcia'], ['off', '⏸ Wyłączone (ogłaszam ręcznie 📣)']].map(([v, l]) => `<option value="${v}" ${(_whStatus?.achAuto || 'rare') === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>` : ''}
    <label style="${_MODAL_LBL}">${st.set ? 'Nowy link webhooka (zastąpi obecny)' : 'Link webhooka'}</label>
    <input id="wh-input" placeholder="https://discord.com/api/webhooks/…" style="${_MODAL_INP};margin-bottom:.35rem">
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:.8rem">Discord → Ustawienia kanału → Integracje → Webhooki → Nowy webhook → Kopiuj URL webhooka.</div>
    <div id="wh-status" style="font-size:.8rem;min-height:1.1em;margin-bottom:.6rem"></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">
      ${st.set ? `<button class="btn btn-ghost" style="color:var(--loss)" onclick="saveWebhookSetting('')">🗑 Usuń</button>` : ''}
      ${st.set ? `<button class="btn btn-ghost" onclick="testWebhookSetting()">🧪 Wyślij test</button>` : ''}
      <button class="btn btn-primary" onclick="saveWebhookSetting()">💾 Zapisz</button>
    </div>`;
}
async function saveWebhookSetting(force) {
  const el = document.getElementById('wh-status');
  const url = force !== undefined ? force : (document.getElementById('wh-input')?.value || '').trim();
  if(force === undefined && !url) { el.style.color = 'var(--loss)'; el.textContent = 'Wklej link webhooka'; return; }
  if(force === '' && !confirm('Usunąć ten webhook? Powiadomienia wrócą na kanał domyślny.')) return;
  const res = await _api('/settings', 'POST', { [_WH_FIELD[_webhookKind]]: url, ...(url ? { test: _webhookKind } : {}) }, { admin: true });
  if(!res.ok) { el.style.color = 'var(--loss)'; el.textContent = '❌ ' + res.error; return; }
  _whStatus = res;
  showToast(url ? '✅ Zapisano — na kanał poszła wiadomość testowa' : 'Usunięto', 'success');
  openWebhookModal(_webhookKind);
  try { renderSeasonSchedule(); renderTeamRegistrations(); } catch(e) {}
}
async function testWebhookSetting() {
  const res = await _api('/settings', 'POST', { test: _webhookKind }, { admin: true });
  const el = document.getElementById('wh-status');
  el.style.color = res.ok ? 'var(--win)' : 'var(--loss)';
  el.textContent = res.ok ? '✅ Wysłano — sprawdź kanał' : '❌ ' + res.error;
}
// ═══════════════════════════════════════════════════════════════
// ZAKŁADKI: Zapisy drużyn | Wolni agenci
// ═══════════════════════════════════════════════════════════════
async function toggleRegistrations() {
  const closing = !registrationsClosed;
  if(!confirm(closing
    ? 'Zamknąć zapisy drużyn? Formularz zniknie, a nowe zgłoszenia nie będą przyjmowane. Wolni agenci nadal mogą się zgłaszać.'
    : 'Otworzyć ponownie zapisy drużyn?')) return;
  registrationsClosed = closing;
  const ok = await saveData();
  if(!ok) { registrationsClosed = !closing; return; }
  renderTeamRegistrations();
  showToast(closing ? '🔒 Zapisy zamknięte' : '🔓 Zapisy otwarte', 'success');
}
function setRegTab(tab) { _regTab = tab; renderTeamRegistrations(); try { if(document.querySelector('.view.active')?.id === 'view-join') _sideSync('join'); } catch(e) {} }
function setFaPosFilter(p) { _faPosFilter = _faPosFilter === p ? '' : p; renderTeamRegistrations(); }
function faPickPos(group, p) {
  if(group === 1) { _faPos1 = p; if(_faPos2 === p) _faPos2 = ''; }
  else _faPos2 = p;
  document.getElementById('fa-pos1').innerHTML = _faPosButtons(1);
  document.getElementById('fa-pos2').innerHTML = _faPosButtons(2);
}
async function submitFreeAgent() {
  if(!_faPos1) { showToast('❌ ' + _g('Wybierz pozycję preferowaną', 'Pick your preferred position'), 'error'); return; }
  const gamertag = document.getElementById('fa-gamertag').value.trim();
  if(!gamertag) { showToast('❌ ' + _g('Podaj gamertag', 'Enter your gamertag'), 'error'); return; }
  const experience = document.getElementById('fa-experience').value;
  if(!experience) { showToast('❌ ' + _g('Wybierz poziom', 'Pick your level'), 'error'); return; }
  if(!document.getElementById('fa-rules').checked) {
    document.getElementById('fa-rules-wrap').style.borderColor = 'var(--loss)';
    showToast('❌ ' + _g('Zaakceptuj regulamin', 'Accept the rules'), 'error');
    return;
  }
  if(!_ensureSession()) return;

  const btn = document.getElementById('fa-submit-btn');
  btn.disabled = true;
  const payload = {
    pos1: _faPos1, pos2: _faPos2 || '', gamertag,
    platform: document.getElementById('fa-platform').value,
    experience,
    seasonId: document.getElementById('fa-season').value || null,
    description: document.getElementById('fa-desc').value.trim(),
    rulesAccepted: true
  };
  let res = await _api('/free-agent', 'POST', payload, { session: true });
  // gracz ze składu drużyny: zapis do FA = odejście z drużyny
  if(!res.ok && res.needLeave) {
    if(!confirm(currentLang === 'en' ? `You are on the ${res.needLeave} roster. Joining the free agents means LEAVING the team — the captain and the transfers channel will be notified. Continue?` : `Jesteś w składzie drużyny ${res.needLeave}. Zapis do wolnych agentów oznacza ODEJŚCIE z drużyny — kapitan i kanał transferów dostaną informację. Kontynuować?`)) { btn.disabled = false; return; }
    res = await _api('/free-agent', 'POST', { ...payload, leaveTeam: true }, { session: true });
  }
  btn.disabled = false;
  if(!res.ok) { showToast('❌ ' + _tr(res.error), 'error'); return; }
  if(res.leftTeam) { showToast(currentLang === 'en' ? `👋 You left ${res.leftTeam} and joined the free agents` : `👋 Opuściłeś drużynę ${res.leftTeam} i jesteś wolnym agentem`, 'success'); loadData().catch(() => {}); }

  const i = freeAgents.findIndex(f => f.id === res.freeAgent.id);
  if(i >= 0) freeAgents[i] = res.freeAgent; else freeAgents.push(res.freeAgent);
  document.getElementById('fa-modal').classList.remove('open');
  _regTab = 'fa';
  renderTeamRegistrations();
  showToast(i >= 0 ? '✅ ' + _g('Zgłoszenie zaktualizowane', 'Listing updated') : '✅ ' + _g('Opublikowano', 'Published') + (res.posted ? _g(' · post na Discordzie', ' · posted on Discord') : ''), 'success');
}
async function withdrawFreeAgent(id) {
  if(!confirm('Wycofać zgłoszenie wolnego agenta?')) return;
  if(!_ensureSession()) return;
  const res = await _api('/free-agent', 'DELETE', { id }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const i = freeAgents.findIndex(f => f.id === id);
  if(i >= 0) freeAgents[i] = res.freeAgent;
  renderTeamRegistrations();
  showToast('🚫 Zgłoszenie wycofane', 'info');
}
async function faAdminSet(id, status) {
  let signedTeam = '';
  if(status === 'signed') {
    const names = teamRegistrations.filter(r => r.status === 'approved').map(r => r.teamName);
    signedTeam = prompt('Do jakiej drużyny? (opcjonalnie)' + (names.length ? '\n' + names.join(', ') : ''), '');
    if(signedTeam === null) return;
  } else if(status === 'withdrawn' && !confirm('Wycofać to zgłoszenie?')) return;
  const res = await _api('/free-agent', 'PATCH', { id, status, signedTeam: signedTeam.trim() }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  if(res.transfer) { transfersList.unshift(res.transfer); showToast('🔁 Transfer ogłoszony na Discordzie', 'success'); }
  const i = freeAgents.findIndex(f => f.id === id);
  if(i >= 0) freeAgents[i] = res.freeAgent;
  renderTeamRegistrations();
}
async function voteSchedule(k, side) {
  if(!_ensureSession()) return;
  if(myVotes[k] === side) return;
  const prev = myVotes[k];
  const c = scheduleVoteCounts[k] = scheduleVoteCounts[k] || { team1: 0, team2: 0, draw: 0 };
  if(prev) c[prev] = Math.max(0, c[prev] - 1);
  c[side] = (c[side] || 0) + 1;
  myVotes[k] = side;
  renderSchedule();

  const res = await _api('/schedule-vote', 'POST', { scheduleId: k, pick: side }, { session: true });
  if(!res.ok) {
    c[side] = Math.max(0, c[side] - 1);
    if(prev) { c[prev]++; myVotes[k] = prev; } else delete myVotes[k];
    renderSchedule();
    showToast('❌ ' + res.error, 'error');
    return;
  }
  scheduleVoteCounts[k] = res.counts;
  myVotes[k] = res.myPick;
  renderSchedule();
}
function _ssMondayOf(iso) { const d = new Date(iso + 'T12:00:00'); const wd = (d.getDay() + 6) % 7; return _ssAddDays(iso, -wd); }
function _ssNextMonday() { const d = new Date(); d.setHours(12, 0, 0, 0); const add = ((8 - d.getDay()) % 7) || 7; d.setDate(d.getDate() + add); return d.toISOString().slice(0, 10); }
// ── algorytm ──
function _ssShuffle(a) { a = [...a]; for(let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function _ssRoundRobin(teams) {
  const t = [...teams];
  if(t.length % 2) t.push(null);
  const n = t.length, rounds = [];
  for(let r = 0; r < n - 1; r++) {
    const pairs = [], byes = [];
    for(let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      if(a && b) pairs.push(((i === 0 ? r : r + i) % 2) ? [b, a] : [a, b]);
      else byes.push(a || b);
    }
    rounds.push({ pairs, byes });
    t.splice(1, 0, t.pop());
  }
  return rounds;
}
function _ssDrawGroups(teams, count) {
  const gs = Array.from({ length: count }, (_, i) => ({ id: 'g' + (i + 1), name: 'Grupa ' + String.fromCharCode(65 + i), teams: [] }));
  _ssShuffle(teams).forEach((t, i) => gs[i % count].teams.push(t));
  return gs;
}
function _ssBuildFixture({ teams, format, groups, startDate, time, seasonId, bestOf = 1, roundsPerWeek = 1 }) {
  const gs = format === 'groups' ? groups : [{ id: 'all', name: '', teams }];
  const items = [], byes = {};
  let id = Date.now();
  gs.forEach(g => {
    _ssRoundRobin(g.teams).forEach((rd, r) => {
      const round = r + 1, week = Math.floor(r / roundsPerWeek) + 1, weekStart = _ssAddDays(startDate, (week - 1) * 7);
      rd.pairs.forEach(([a, b]) => items.push({
        id: id++, generated: true, seasonId, week, round, weekStart, groupId: g.id, bestOf,
        team1: a, team2: b, date: '', time: '', defaultTime: time, streamUrl: '',
        played: false, prediction: null, matchId: null, matchIds: []
      }));
      rd.byes.forEach(x => (byes[week] = byes[week] || []).push({ team: x, groupId: g.id, round }));
    });
  });
  return { items, byes };
}
// ── Discord: terminarz ──
// Wysyłka z opcjonalnym obrazkiem (baner meczu) — kanał terminarza albo główny kanał przez Workera
async function _scheduleDiscordSendR(route, payload, imageDataUrl) { payload.route = route; return _scheduleDiscordSend(payload, imageDataUrl); }
async function _scheduleDiscordSend(payload, imageDataUrl) {
  const embed = payload.embeds?.[0];
  if(imageDataUrl && embed) embed.image = { url: 'attachment://mecz.png' };
  const ok = await _discordPost('schedule', payload, imageDataUrl || null, 'mecz.png');
  if(ok || !imageDataUrl) return ok;
  if(embed) delete embed.image; // ostatnia próba bez obrazka
  return _discordPost('schedule', payload);
}
// Baner meczu: logo — VS — logo (PNG do wiadomości na Discordzie)
function _ssLoadImg(src) {
  return new Promise(res => {
    if(!src) return res(null);
    const img = new Image();
    if(/^https?:/.test(src)) img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}
async function _ssMatchBanner(s) {
  const W = 900, H = 340;
  const draw = async withImages => {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d0f14'); bg.addColorStop(1, '#1c1f2b');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f5c518'; g.fillRect(0, 0, W, 6);
    const font = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    const R = 82, cy = 150, xs = [210, W - 210];
    for(const [i, name] of [s.team1, s.team2].entries()) {
      const x = xs[i];
      g.save();
      g.beginPath(); g.arc(x, cy, R, 0, Math.PI * 2); g.closePath();
      g.fillStyle = typeof teamColor === 'function' ? teamColor(name) : '#333'; g.fill();
      const img = withImages ? await _ssLoadImg(_ssLogoSrc(name)) : null;
      if(img) {
        g.clip();
        const sc = Math.max((R * 2) / img.width, (R * 2) / img.height);
        g.drawImage(img, x - img.width * sc / 2, cy - img.height * sc / 2, img.width * sc, img.height * sc);
      } else {
        g.fillStyle = '#fff'; g.font = `900 64px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(typeof teamInitials === 'function' ? teamInitials(name) : String(name).slice(0, 2).toUpperCase(), x, cy + 2);
      }
      g.restore();
      g.lineWidth = 4; g.strokeStyle = '#f5c518';
      g.beginPath(); g.arc(x, cy, R, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#ffffff'; g.font = `800 30px ${font}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      let label = String(name);
      while(g.measureText(label).width > 320 && label.length > 3) label = label.slice(0, -2) + '…';
      g.fillText(label, x, cy + R + 46);
    }
    g.fillStyle = '#f5c518'; g.font = `900 72px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('VS', W / 2, cy);
    g.fillStyle = '#8b90a0'; g.font = `700 22px ${font}`;
    g.fillText(`WEEK ${s.week}${(s.bestOf || 1) > 1 ? ' · BO' + s.bestOf : ''}`, W / 2, cy + 62);
    return c.toDataURL('image/png');
  };
  try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
  try { return await draw(true); }
  catch(e) { try { return await draw(false); } catch(e2) { return null; } } // obce logo bez CORS → inicjały
}
// Dane dla AI: statystyki drużyn w tym sezonie
function _ssTeamSeasonStats(name, seasonId) {
  return _withAllMatches(() => {
    const ms = matches
      .filter(m => (!seasonId || m.seasonId === seasonId) && (m.team1?.name === name || m.team2?.name === name))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
    if(!ms.length) return { games: 0 };
    let w = 0, l = 0, pf = 0, pa = 0;
    const form = [], players = {};
    ms.forEach(m => {
      const me = m.team1.name === name ? m.team1 : m.team2, op = me === m.team1 ? m.team2 : m.team1;
      const win = me.score > op.score;
      win ? w++ : l++;
      pf += me.score || 0; pa += op.score || 0;
      form.push(win ? 'W' : 'L');
      (me.players || []).forEach(p => { const x = players[p.name] = players[p.name] || { pts: 0, gp: 0 }; x.pts += p.pts || 0; x.gp++; });
    });
    const top = Object.entries(players).map(([n, x]) => ({ name: n, ppg: +(x.pts / x.gp).toFixed(1) })).sort((a, b) => b.ppg - a.ppg)[0] || null;
    return { games: ms.length, w, l, ppg: +(pf / ms.length).toFixed(1), oppg: +(pa / ms.length).toFixed(1), form: form.slice(-5).join(''), top };
  });
}
function _ssMatchAiData(s) {
  const st1 = _ssTeamSeasonStats(s.team1, s.seasonId), st2 = _ssTeamSeasonStats(s.team2, s.seasonId);
  const roster = name => (teamRegistrations.find(r => String(r.teamName).toLowerCase() === String(name).toLowerCase())?.players || [])
    .slice(0, 8).map(p => p.gamertag + (p.experience && _expLabels[p.experience] ? ' (' + _expLabels[p.experience].replace(/^\S+\s/, '') + ')' : '')).join(', ');
  const h2h = _withAllMatches(() => matches.filter(m => m.seasonId === s.seasonId &&
      [m.team1.name, m.team2.name].includes(s.team1) && [m.team1.name, m.team2.name].includes(s.team2))
    .map(m => `${m.team1.name} ${m.team1.score}:${m.team2.score} ${m.team2.name}`).join('; '));
  const c = scheduleVoteCounts[String(s.id)];
  const tot = c ? (c.team1 || 0) + (c.team2 || 0) : 0;
  return {
    team1: s.team1, team2: s.team2, week: s.week, bestOf: s.bestOf || 1,
    odds: (() => { try { if(!_elo().games) return ''; const p = Math.round(_eloProb(s.team1, s.team2) * 100); return `${s.team1} ${p}% · ${s.team2} ${100 - p}% (ranking ${Math.round(_elo().R[s.team1] ?? 1500)} vs ${Math.round(_elo().R[s.team2] ?? 1500)})`; } catch(e) { return ''; } })(),
    when: s.date ? _ssPickFull(s.finalDay || s.date, s.weekStart) + (s.time ? ' ' + s.time : '') : '',
    stats1: st1, stats2: st2,
    roster1: st1.games ? '' : roster(s.team1), roster2: st2.games ? '' : roster(s.team2),
    h2h, votes: tot ? `${Math.round(c.team1 / tot * 100)}% na ${s.team1}, ${100 - Math.round(c.team1 / tot * 100)}% na ${s.team2} (${tot} głosów)` : ''
  };
}
function _ssMatchEmbed(s, title) {
  const full = s.finalDay ? _ssPickFull(s.finalDay, s.weekStart) : (() => {
    const wd = new Date(s.date + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'long' });
    return wd.charAt(0).toUpperCase() + wd.slice(1) + ', ' + _ssFmt(s.date);
  })();
  const fx = seasons.find(x => x.id === s.seasonId)?.fixture;
  const grp = fx?.groups?.find(g => g.id === s.groupId)?.name;
  return {
    title: title || `📅 Termin meczu — Week ${s.week}`,
    description: `**${s.team1}** vs **${s.team2}**${(s.bestOf || 1) > 1 ? ' (Bo' + s.bestOf + ')' : ''}\n${full} · ${s.time || ''}` +
      `${grp ? '\n' + grp : ''}${s.round ? ' · Kolejka ' + s.round : ''}`,
    url: location.origin + '/terminarz-week-' + s.week,
    color: 0xf5c518, footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
  };
}
// Pełne ogłoszenie meczu: embed + zapowiedź AI + baner z logotypami
async function _ssAnnounceMatch(s, title, extraLine) {
  window._trOff = true;
  try { return await _ssAnnounceMatchInner(s, title, extraLine); } finally { window._trOff = false; }
}
async function _ssAnnounceMatchInner(s, title, extraLine) {
  const embed = _ssMatchEmbed(s, title);
  if(_emo(s.team1) || _emo(s.team2)) embed.description = `${_emo(s.team1)}**${s.team1}** vs **${s.team2}** ${_emo(s.team2).trim()}\n` + (embed.description || '');
  if(extraLine) embed.description += '\n' + extraLine;
  const [fl, banner] = await Promise.all([
    Promise.race([
      _api('/fun-line', 'POST', { kind: 'match', data: _ssMatchAiData(s) }, _isLoggedInSync() ? { admin: true } : { session: true }),
      new Promise(r => setTimeout(() => r({}), 12000))
    ]).catch(() => ({})),
    _ssMatchBanner(s)
  ]);
  if(fl?.line) embed.description += `\n\n🎙️ *${fl.line}*`;
  const st1 = _ssTeamSeasonStats(s.team1, s.seasonId), st2 = _ssTeamSeasonStats(s.team2, s.seasonId);
  if(st1.games || st2.games) {
    const f = st => st.games ? `${st.w}-${st.l} · ${st.ppg} pkt/mecz${st.form ? ' · ' + st.form : ''}` : 'bez meczów';
    embed.fields = [
      { name: s.team1, value: _emo(s.team1) + f(st1), inline: true },
      { name: s.team2, value: _emo(s.team2) + f(st2), inline: true }
    ];
  }
  return _scheduleDiscordSend({ embeds: [embed] }, banner);
}
async function ssResendMatch(k) {
  const s = _ssItem(k);
  if(!s || !s.date) return;
  if(!confirm(`Wysłać ponownie na Discord termin: ${s.team1} vs ${s.team2}?`)) return;
  showToast('⏳ Przygotowuję zapowiedź…', 'info');
  let ok = false;
  try { ok = await _ssAnnounceMatch(s); } catch(e) { console.warn(e); }
  showToast(ok ? '📣 Wysłano na Discord' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
// ── akcje ──
function ssLinkGames(k) {
  const s = _ssItem(k);
  if(!s) return;
  const bo = s.bestOf || 1;
  const linked = _ssMatchIds(s).map(Number);
  const usedElsewhere = new Set(schedule.filter(x => x !== s).flatMap(x => _ssMatchIds(x).map(Number)));
  const pairKey = [s.team1, s.team2].map(x => String(x).toLowerCase()).sort().join('|');
  const isPair = m => [m.team1.name, m.team2.name].map(x => String(x).toLowerCase()).sort().join('|') === pairKey;
  const list = matches
    .filter(m => !usedElsewhere.has(Number(m.id)))
    .sort((a, b) => (isPair(b) - isPair(a)) || (new Date(b.date) - new Date(a.date)))
    .slice(0, 60);
  if(!list.length) { showToast('Brak meczów do połączenia', 'info'); return; }
  const modal = document.getElementById('schedule-modal');
  document.getElementById('schedule-modal-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:1px;margin-bottom:.3rem">🔗 Wyniki spotkania</div>
    <div style="font-size:.82rem;color:var(--muted);margin-bottom:.9rem">${_h(s.team1)} vs ${_h(s.team2)} · Bo${bo} — zaznacz ${bo === 1 ? 'mecz' : 'do ' + bo + ' meczów'}</div>
    <div id="ss-link-list" style="max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:.3rem;margin-bottom:1rem">
      ${list.map(m => `
        <label style="display:flex;align-items:center;gap:.6rem;padding:.45rem .6rem;border:1px solid ${isPair(m) ? 'var(--accent)' : 'var(--border)'};border-radius:7px;cursor:pointer;font-size:.82rem">
          <input type="checkbox" value="${m.id}" ${linked.includes(Number(m.id)) ? 'checked' : ''} onchange="ssLinkLimit(${bo})" style="accent-color:var(--accent)">
          <span style="color:var(--muted);min-width:70px">${formatDate(m.date)}</span>
          <span>${_h(m.team1.name)} <b>${m.team1.score}:${m.team2.score}</b> ${_h(m.team2.name)}</span>
        </label>`).join('')}
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="ssConfirmLinkGames('${k}')">✅ Zapisz</button>`;
  modal.classList.add('open');
  ssLinkLimit(bo);
}
function ssLinkLimit(bo) {
  const boxes = [...document.querySelectorAll('#ss-link-list input[type=checkbox]')];
  const n = boxes.filter(b => b.checked).length;
  boxes.forEach(b => { if(!b.checked) b.disabled = n >= bo; });
}
async function ssConfirmLinkGames(k) {
  const s = _ssItem(k);
  if(!s) return;
  const ids = [...document.querySelectorAll('#ss-link-list input:checked')].map(b => Number(b.value))
    .sort((a, b) => new Date(matches.find(m => Number(m.id) === a)?.date) - new Date(matches.find(m => Number(m.id) === b)?.date));
  const prev = { matchIds: s.matchIds, matchId: s.matchId, played: s.played };
  s.matchIds = ids;
  s.matchId = ids[0] || null;
  s.played = ids.length >= (s.bestOf || 1);
  const ok = await saveData();
  if(!ok) { Object.assign(s, prev); return; }
  document.getElementById('schedule-modal').classList.remove('open');
  renderSchedule();
  showToast('✅ Zapisano wyniki', 'success');
}
function ssPickDraft(k, kind, val) {
  const ctx = _ssCtx();
  const s = _ssItem(k);
  const side = ctx.myTeam && (String(s.team1).toLowerCase() === ctx.myTeam.toLowerCase() ? 'team1' : 'team2');
  const saved = ctx.picks[k]?.[side] || {};
  const d = _ssDraft[k] = _ssDraft[k] || { primary: saved.primary || '', backup: saved.backup || '', primaryFrom: saved.primaryFrom || '', primaryTo: saved.primaryTo || '', backupFrom: saved.backupFrom || '', backupTo: saved.backupTo || '', open: {} };
  d.open = d.open || {};
  if(val === 'custom') {
    d.open[kind] = true;
    if(!_ssIsCustom(d[kind])) d[kind] = '';
  } else {
    d.open[kind] = false;
    d[kind] = val;
  }
  if(kind === 'primary' && d.backup && d.backup === d.primary) d.backup = '';
  renderSeasonSchedule();
}
async function acceptTerm(k, which) {
  const s = _ssItem(k);
  if(!s || !_ensureSession()) return;
  const side = _ssMySide(k);
  const op = scheduleDayPicks[k]?.[side === 'team1' ? 'team2' : 'team1'];
  if(!op?.[which]) return;
  if(!confirm(`Akceptujesz termin: ${s.team1} vs ${s.team2}
${_ssPickFull(op[which], s.weekStart)}${op[which + 'From'] ? ', ' + op[which + 'From'] : ''}

Termin zostanie od razu ustalony.`)) return;
  const res = await _api('/schedule-accept', 'POST', { scheduleId: k, which }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  Object.assign(s, { date: res.schedule.date, time: res.schedule.time, finalDay: res.schedule.finalDay });
  scheduleDayPicks[k] = res.picks;
  delete _ssDraft[k];
  renderSchedule(); renderScheduleDashboard();
  showToast('✅ Termin ustalony — wysyłam zapowiedź na Discord…', 'success');
  // pełna zapowiedź: baner z logotypami, tekst AI, bilans — tak jak przy zatwierdzeniu przez admina
  let ok = false;
  try { ok = await _ssAnnounceMatch(s, null, '🤝 Uzgodnione przez kapitanów'); } catch(e) { console.warn(e); }
  showToast(ok ? '📣 Zapowiedź meczu wysłana na Discord' : '⚠ Termin ustalony, ale zapowiedź nie wyszła — admin może ją wysłać przyciskiem 📣', ok ? 'success' : 'info');
}
function ssPickTime(k, kind, which, val) {
  if(!_ssDraft[k]) ssPickDraft(k, kind, _ssCtx().picks[k]?.[_ssMySide(k)]?.[kind] || '');
  const d = _ssDraft[k];
  d[kind + which] = val;
  // wygodnie: po wybraniu „od” podpowiedz „do” = +2 h
  if(which === 'From' && val && !d[kind + 'To']) { const m = Math.min(_twMin(val) + 120, 24 * 60); d[kind + 'To'] = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  renderSeasonSchedule();
}
function _ssMySide(k) {
  const ctx = _ssCtx(), s = _ssItem(k);
  return ctx.myTeam && s && (String(s.team1).toLowerCase() === ctx.myTeam.toLowerCase() ? 'team1' : 'team2');
}
// Podczas wpisywania daty z klawiatury (telefon) nie przerysowuj karty i nie sprawdzaj roku przy każdym znaku —
// dopiero gdy data jest kompletna i sensowna (albo po wyjściu z pola).
function ssPickCustomInput(k, kind, el) {
  const d = _ssDraft[k]; if(!d) return;
  const v = el.value || '';
  const y = +v.slice(0, 4), nowY = new Date().getFullYear();
  if(/^\d{4}-\d{2}-\d{2}$/.test(v) && y >= nowY - 1 && y <= nowY + 1) {
    if(d[kind] !== v) { d[kind] = v; renderSeasonSchedule(); }
  }
}
function ssPickCustom(k, kind) {
  const d = _ssDraft[k];
  if(!d) return;
  const el = document.getElementById(`ss-c-${k}-${kind}-d`);
  const date = el?.value || '';
  if(date === (d[kind] || '')) return; // nic się nie zmieniło — nie przerysowuj (nie gub kliknięcia w inne pole)
  const y = +date.slice(0, 4), nowY = new Date().getFullYear();
  if(date && (y < nowY - 1 || y > nowY + 1)) {
    showToast(`Sprawdź rok w dacie (${date.slice(0, 4)}) — wybierz datę z kalendarza`, 'error');
    if(el) el.value = '';
    d[kind] = '';
    renderSeasonSchedule();
    return;
  }
  d[kind] = date || '';
  if(kind === 'primary' && d.backup && d.backup === d.primary) d.backup = '';
  renderSeasonSchedule();
}
async function ssSavePick(k) {
  const d = _ssDraft[k];
  if(!d?.primary || !d?.backup) return;
  if(_demo) {
    const s = _ssItem(k);
    const side = String(s.team1).toLowerCase() === _demo.captainTeam.toLowerCase() ? 'team1' : 'team2';
    _demo.picks[k] = _demo.picks[k] || {};
    _demo.picks[k][side] = { primary: d.primary, backup: d.backup, primaryFrom: d.primaryFrom, primaryTo: d.primaryTo, backupFrom: d.backupFrom, backupTo: d.backupTo, by: 'Demo' };
    delete _ssDraft[k];
    renderSeasonSchedule();
    showToast('✅ (demo) Zapisano wybór terminu', 'success');
    return;
  }
  if(!_ensureSession()) return;
  const res = await _api('/schedule-day-pick', 'POST', { scheduleId: k, primary: d.primary, backup: d.backup, primaryFrom: d.primaryFrom, primaryTo: d.primaryTo, backupFrom: d.backupFrom, backupTo: d.backupTo }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  scheduleDayPicks[k] = res.picks;
  delete _ssDraft[k];
  renderSeasonSchedule();
  showToast('✅ Zapisano wybór terminu', 'success');
}
async function ssFinalize(k, day, pickedTime) {
  const s = _ssItem(k);
  if(!s) return;
  const date = _ssPickDate(s.weekStart, day);
  const time = _ssPickTime(day) || pickedTime || s.defaultTime || (_demo ? _demo.fixture?.time : seasons.find(x => x.id === s.seasonId)?.fixture?.time) || '20:00';
  const full = _ssPickFull(day, s.weekStart);
  if(!_demo && !confirm(`Zatwierdzić termin ${s.team1} vs ${s.team2}: ${full}, ${time}?`)) return;
  Object.assign(s, { date, time, finalDay: day });
  if(_demo) { renderSeasonSchedule(); showToast('✅ (demo) Termin zatwierdzony', 'success'); return; }
  const ok = await saveData();
  if(!ok) { Object.assign(s, { date: '', time: '', finalDay: null }); renderSeasonSchedule(); return; }
  renderSchedule();
  renderScheduleDashboard();
  showToast('✅ Termin zatwierdzony', 'success');
  try { await _ssAnnounceMatch(s); } catch(e) { console.warn(e); }
  _api('/captain-notify-final', 'POST', { scheduleId: s.id, when: _ssPickFull(day, s.weekStart) + ' · ' + time }, { admin: true }).catch(() => {});
}
async function ssUnfinalize(k) {
  const s = _ssItem(k);
  if(!s) return;
  const prev = { date: s.date, time: s.time, finalDay: s.finalDay };
  Object.assign(s, { date: '', time: '', finalDay: null });
  if(_demo) { renderSeasonSchedule(); return; }
  const ok = await saveData();
  if(!ok) Object.assign(s, prev);
  renderSchedule();
  renderScheduleDashboard();
}
// ── generator ──
function openFixtureGenerator() {
  const demo = !!_demo;
  const seasonId = demo ? 'demo' : (_ssSeasonId || currentSeasonId || seasons[0]?.id || null);
  const teams = demo ? [..._demo.teams] : _ssApprovedTeams(seasonId);
  const _dvD = !demo && window._dvDraft; // 🧩 zapisany podział na dywizje
  _ssGen = {
    demo, seasonId, teams: _dvD?.groups?.length ? [...new Set(_dvD.groups.flatMap(g => g.teams))] : teams,
    format: _dvD?.groups?.length ? 'groups' : teams.length >= 10 ? 'groups' : 'single',
    groupCount: _dvD?.groups?.length || 2, groups: _dvD?.groups?.length ? _dvD.groups.map((g, i) => ({ id: 'g' + (i + 1), name: g.name, teams: [...g.teams] })) : null, drawing: false,
    bestOf: (demo ? _demo.fixture?.bestOf : null) || 2,
    roundsPerWeek: (demo ? _demo.fixture?.roundsPerWeek : null) || 1,
    startDate: _ssNextMonday(), time: '20:00', announce: true
  };
  let m = document.getElementById('fixture-gen-modal');
  if(!m) {
    m = document.createElement('div');
    m.id = 'fixture-gen-modal';
    m.className = 'modal-overlay';
    m.style.zIndex = '1200';
    m.onclick = e => { if(e.target === m && !_ssGen?.drawing) m.classList.remove('open'); };
    m.innerHTML = '<div class="modal" style="max-width:640px"></div>';
    document.body.appendChild(m);
  }
  _ssGenRender();
  m.classList.add('open');
}
function _ssGenSet(key, val) {
  _ssGen[key] = val;
  if(key === 'seasonId') _ssGen.teams = _ssApprovedTeams(val);
  if(key === 'demoCount') { _demo.teams = SS_DEMO_TEAMS.slice(0, val); _ssGen.teams = [..._demo.teams]; }
  if(['seasonId', 'demoCount', 'format', 'groupCount'].includes(key)) _ssGen.groups = null;
  _ssGenRender();
}
function _ssGenRender() {
  const g = _ssGen;
  const box = document.querySelector('#fixture-gen-modal .modal');
  if(!box || !g) return;
  const inp = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.45rem .6rem;font-family:inherit;font-size:.85rem;width:100%;box-sizing:border-box';
  const lbl = 'display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem';
  const n = g.teams.length;
  const maxGroups = Math.max(2, Math.min(4, Math.floor(n / 3)));
  if(g.groupCount > maxGroups) g.groupCount = maxGroups;
  const canGroups = n >= 6;
  if(!canGroups && g.format === 'groups') g.format = 'single';

  const fmtCard = (val, title, desc, disabled) => {
    const on = g.format === val;
    return `<div onclick="${disabled ? '' : `_ssGenSet('format','${val}')`}" style="flex:1;min-width:200px;cursor:${disabled ? 'not-allowed' : 'pointer'};opacity:${disabled ? .45 : 1};
      border:2px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.07)' : 'var(--surface2)'};border-radius:10px;padding:.7rem .85rem">
      <div style="font-weight:800;font-size:.9rem;margin-bottom:.2rem">${title}</div>
      <div style="font-size:.75rem;color:var(--muted);line-height:1.35">${desc}</div></div>`;
  };

  // podsumowanie
  const sizes = g.format === 'groups'
    ? Array.from({ length: g.groupCount }, (_, i) => Math.floor(n / g.groupCount) + (i < n % g.groupCount ? 1 : 0))
    : [n];
  const rounds = Math.max(0, ...sizes.map(x => x % 2 ? x : x - 1));
  const weeks = Math.ceil(rounds / g.roundsPerWeek);
  const total = sizes.reduce((a, x) => a + x * (x - 1) / 2, 0);
  const start = g.startDate ? _ssMondayOf(g.startDate) : null;
  const end = start && weeks ? _ssAddDays(start, (weeks - 1) * 7 + 6) : null;

  const groupsPreview = g.format === 'groups' ? `
    <div style="margin:.9rem 0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
        <label style="${lbl};margin:0">Losowanie grup</label>
        <button onclick="ssDrawGroups()" class="btn ${g.groups ? 'btn-ghost' : 'btn-primary'}" ${g.drawing || n < 2 ? 'disabled' : ''} style="font-size:.78rem;padding:.3rem .7rem">${g.drawing ? '⏳ Losowanie…' : g.groups ? '🎲 Losuj ponownie' : '🎲 Losuj grupy'}</button>
      </div>
      <div id="ss-gen-groups" style="display:grid;grid-template-columns:repeat(${g.groupCount},1fr);gap:.5rem">
        ${Array.from({ length: g.groupCount }, (_, i) => {
          const grp = g.groups?.[i];
          return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem .6rem;min-height:80px">
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;color:var(--accent);margin-bottom:.25rem">Grupa ${String.fromCharCode(65 + i)}</div>
            ${(grp?.shown || grp?.teams || []).map(t => `<div style="font-size:.78rem;padding:.08rem 0;animation:ssPop .25s ease">${_h(t)}</div>`).join('') || '<div style="font-size:.72rem;color:var(--muted)">—</div>'}
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  const ready = n >= 3 && g.startDate && (g.format === 'single' || (g.groups && !g.drawing));

  box.innerHTML = `
    <style>@keyframes ssPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}</style>
    <button class="modal-close" onclick="if(!_ssGen.drawing)document.getElementById('fixture-gen-modal').classList.remove('open')">&#x2715;</button>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:1px;margin-bottom:1rem">🗓 Generator terminarza${g.demo ? ' <span style="font-size:.8rem;color:var(--accent)">DEMO</span>' : ''}</div>

    ${g.demo
      ? `<div style="margin-bottom:.9rem"><label style="${lbl}">Liczba drużyn (demo)</label>
          <select onchange="_ssGenSet('demoCount',+this.value)" style="${inp}">${[4,5,6,7,8,9,10,11,12].map(x => `<option ${x === n ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`
      : `<div style="margin-bottom:.9rem"><label style="${lbl}">Sezon</label>
          <select onchange="_ssGenSet('seasonId',this.value)" style="${inp}">${seasons.map(x => `<option value="${_h(x.id)}" ${x.id === g.seasonId ? 'selected' : ''}>${_h(x.name)}</option>`).join('')}</select></div>`}

    <div style="margin-bottom:.9rem">
      <label style="${lbl}">Drużyny${g.demo ? '' : ' (zatwierdzone)'} — ${n}</label>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem">${g.teams.map(t => `<span style="font-size:.75rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:.12rem .45rem">${_h(t)}</span>`).join('') || '<span style="font-size:.8rem;color:var(--loss)">Brak zatwierdzonych drużyn w tym sezonie</span>'}</div>
      ${n > 0 && n < 3 ? '<div style="font-size:.75rem;color:var(--loss);margin-top:.35rem">Potrzebne minimum 3 drużyny.</div>' : ''}
    </div>

    <label style="${lbl}">Format sezonu</label>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
      ${fmtCard('single', '🏟 Jedna grupa', 'Każdy z każdym w całej lidze.', false)}
      ${fmtCard('groups', '👥 Grupy', `Losowanie do grup, w każdej grupie każdy z każdym.${n >= 10 ? ' <b style="color:var(--accent)">Zalecane przy ' + n + ' drużynach.</b>' : ''}`, !canGroups)}
    </div>
    ${g.format === 'groups' ? `
      <div style="display:flex;align-items:center;gap:.5rem;margin-top:.6rem;font-size:.82rem">
        Liczba grup:
        <select onchange="_ssGenSet('groupCount',+this.value)" style="${inp};width:auto">${Array.from({ length: maxGroups - 1 }, (_, i) => i + 2).map(x => `<option ${x === g.groupCount ? 'selected' : ''}>${x}</option>`).join('')}</select>
        <span style="color:var(--muted)">(${sizes.join(' / ')} drużyn)</span>
      </div>` : ''}

    ${groupsPreview}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:.9rem 0 0">
      <div><label style="${lbl}">Format spotkania</label>
        <select onchange="_ssGenSet('bestOf',+this.value)" style="${inp}">${[1, 2, 3].map(x => `<option value="${x}" ${x === g.bestOf ? 'selected' : ''}>Bo${x} — ${x === 1 ? '1 mecz' : x + ' mecze'}</option>`).join('')}</select></div>
      <div><label style="${lbl}">Spotkań w tygodniu</label>
        <select onchange="_ssGenSet('roundsPerWeek',+this.value)" style="${inp}">${[1, 2, 3].map(x => `<option value="${x}" ${x === g.roundsPerWeek ? 'selected' : ''}>${x} na drużynę (${x * g.bestOf} ${x * g.bestOf === 1 ? 'mecz' : x * g.bestOf < 5 ? 'mecze' : 'meczów'})</option>`).join('')}</select></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:.9rem 0">
      <div><label style="${lbl}">Start (tydzień 1)</label>
        <input type="date" value="${g.startDate}" onchange="_ssGenSet('startDate',this.value)" style="${inp}"></div>
      <div><label style="${lbl}">Domyślna godzina</label>
        <input type="time" value="${g.time}" onchange="_ssGen.time=this.value" style="${inp}"></div>
    </div>

    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.6rem .8rem;font-size:.8rem;line-height:1.5;margin-bottom:1rem">
      📊 <b>${rounds}</b> kolejek w <b>${weeks}</b> ${weeks === 1 ? 'tygodniu' : 'tygodniach'}<br>
      Cała liga: <b>${total}</b> spotkań Bo${g.bestOf} = <b>${total * g.bestOf}</b> meczów<br>
      Na drużynę: <b>${Math.max(0, ...sizes) - 1}</b> spotkań = <b>${(Math.max(0, ...sizes) - 1) * g.bestOf}</b> meczów w sezonie<br>
      Każda drużyna gra do <b>${g.roundsPerWeek}</b> ${g.roundsPerWeek === 1 ? 'spotkania' : 'spotkań'} (${g.roundsPerWeek * g.bestOf} ${g.roundsPerWeek * g.bestOf === 1 ? 'meczu' : 'meczów'}) w tygodniu
      ${start ? ` · od <b>${_ssFmt(start)}</b>${end ? ' do <b>' + _ssFmt(end) + '</b>' : ''}` : ''}<br>
      <span style="color:var(--muted)">Kapitanowie wybierają dla każdego spotkania dzień priorytetowy i zapasowy: Pn / Śr / Nd albo własny termin uzgodniony z rywalem. Admin zatwierdza termin.</span>
    </div>

    ${(() => {
      if(g.demo) return '';
      const old = matches.filter(m => m.seasonId === g.seasonId).length;
      const sn = seasons.find(x => x.id === g.seasonId)?.name || '';
      return old ? `<div style="background:rgba(220,38,38,.08);border:1px solid var(--loss);border-radius:8px;padding:.5rem .7rem;font-size:.78rem;margin-bottom:.6rem;line-height:1.45">⚠ W sezonie „${_h(sn)}” jest już <b>${old}</b> ${old === 1 ? 'mecz' : 'meczów'} — pewnie z poprzednich rozgrywek. Dla nowego sezonu utwórz go w <b>🏆 Sezony</b>, ustaw jako aktywny i dopiero wtedy generuj terminarz. Inaczej stare wyniki trafią do nowej tabeli.</div>` : '';
    })()}
    ${g.demo || registrationsClosed ? '' : `<div style="background:rgba(245,197,24,.08);border:1px solid var(--accent);border-radius:8px;padding:.5rem .7rem;font-size:.78rem;margin-bottom:.6rem">⚠ Zapisy są nadal otwarte — zostaną zamknięte automatycznie po wygenerowaniu terminarza.</div>`}
    ${g.demo ? '' : `<label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;margin-bottom:1rem;cursor:pointer">
      <input type="checkbox" ${g.announce ? 'checked' : ''} onchange="_ssGen.announce=this.checked" style="accent-color:var(--accent)"> Ogłoś terminarz${g.format === 'groups' ? ' i skład grup' : ''} na Discordzie</label>`}

    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" ${g.drawing ? 'disabled' : ''} onclick="document.getElementById('fixture-gen-modal').classList.remove('open')">Anuluj</button>
      <button class="btn btn-primary" ${ready ? '' : 'disabled style="opacity:.45"'} onclick="ssConfirmFixture()">✅ Generuj terminarz</button>
    </div>`;
}
function ssDrawGroups() {
  const g = _ssGen;
  const final = _ssDrawGroups(g.teams, g.groupCount);
  g.groups = final.map(x => ({ ...x, shown: [] }));
  g.drawing = true;
  const order = [];
  const maxLen = Math.max(...final.map(x => x.teams.length));
  for(let i = 0; i < maxLen; i++) final.forEach((grp, gi) => { if(grp.teams[i]) order.push([gi, grp.teams[i]]); });
  let i = 0;
  const step = () => {
    if(!_ssGen || _ssGen !== g) return;
    if(i >= order.length) { g.drawing = false; g.groups.forEach(x => delete x.shown); _ssGenRender(); return; }
    const [gi, t] = order[i++];
    g.groups[gi].shown.push(t);
    _ssGenRender();
    setTimeout(step, 320);
  };
  _ssGenRender();
  setTimeout(step, 250);
}
async function ssConfirmFixture() {
  const g = _ssGen;
  if(!g || g.drawing) return;
  const startDate = _ssMondayOf(g.startDate);
  const groups = g.format === 'groups' ? g.groups.map(x => ({ id: x.id, name: x.name, teams: [...x.teams] })) : null;
  const { items, byes } = _ssBuildFixture({ teams: g.teams, format: g.format, groups, startDate, time: g.time || '20:00', seasonId: g.seasonId, bestOf: g.bestOf, roundsPerWeek: g.roundsPerWeek });
  const fixture = { format: g.format, groups: groups || [], startDate, time: g.time || '20:00', byes, bestOf: g.bestOf, roundsPerWeek: g.roundsPerWeek, generatedAt: new Date().toISOString() };

  if(g.demo) {
    _demo.fixture = fixture;
    _demo.items = items;
    _demoSeed();
    _ssWeek = null;
    document.getElementById('fixture-gen-modal').classList.remove('open');
    renderSeasonSchedule();
    showToast('✅ (demo) Wygenerowano terminarz', 'success');
    return;
  }

  const existing = schedule.filter(s => s.generated && (s.seasonId || null) === (g.seasonId || null));
  if(existing.some(s => s.played || s.matchId)) { showToast('❌ Ten terminarz ma już rozegrane mecze — nie można go wygenerować ponownie', 'error'); return; }
  if(existing.length && !confirm(`Sezon ma już terminarz (${existing.length} meczów). Zastąpić go nowym? Propozycje terminów i głosy zostaną wyzerowane.`)) return;

  const season = seasons.find(x => x.id === g.seasonId);
  const prevSchedule = schedule, prevFixture = season?.fixture, prevClosed = registrationsClosed;
  schedule = schedule.filter(s => !existing.includes(s)).concat(items);
  if(season) season.fixture = fixture;
  registrationsClosed = true;
  const ok = await saveData();
  if(!ok) { schedule = prevSchedule; if(season) season.fixture = prevFixture; registrationsClosed = prevClosed; return; }
  renderTeamRegistrations();

  _ssSeasonId = g.seasonId;
  _ssWeek = null;
  document.getElementById('fixture-gen-modal').classList.remove('open');
  renderSchedule();
  showToast('✅ Terminarz wygenerowany', 'success');

  if(g.announce) {
    const fields = groups
      ? groups.map(x => ({ name: x.name, value: x.teams.map(t => '• ' + t).join('\n'), inline: true }))
      : [{ name: 'Drużyny', value: g.teams.map(t => '• ' + t).join('\n'), inline: false }];
    const weeksCount = Math.max(...items.map(s => s.week));
    try {
      await _scheduleDiscordSend({ embeds: [{
        title: `🗓 Terminarz ${season?.name || 'sezonu'} gotowy!`,
        description: `${groups ? '👥 ' + groups.length + ' grupy' : '🏟 Jedna grupa — każdy z każdym'} · ${Math.max(...items.map(s => s.round))} kolejek w ${weeksCount} tygodniach · ${items.length} spotkań Bo${g.bestOf}\n` +
          `Start: **${_ssFmt(startDate)}**. Każda drużyna gra do ${g.roundsPerWeek} ${g.roundsPerWeek === 1 ? 'spotkania' : 'spotkań'} w tygodniu. Kapitanowie — wybierzcie na stronie dzień priorytetowy i zapasowy (Pn / Śr / Nd) dla swoich spotkań.`,
        fields, color: 0xf5c518,
        url: (typeof APP_URL !== 'undefined' ? APP_URL : location.href.split('?')[0].split('#')[0]),
        footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
      }] });
    } catch(e) {}
  }
}
// ── DEMO ──
function startDemo() {
  _demo = { teams: SS_DEMO_TEAMS.slice(0, 9), role: _isLoggedInSync() ? 'admin' : 'captain', captainTeam: SS_DEMO_TEAMS[0],
    fixture: null, items: [], picks: {}, counts: {}, myVotes: {}, results: {} };
  const startDate = _ssMondayOf(new Date().toISOString().slice(0, 10)); // Week 1 = ten tydzień (rozegrany), Week 2 = następny
  const { items, byes } = _ssBuildFixture({ teams: _demo.teams, format: 'single', groups: null, startDate, time: '20:00', seasonId: 'demo', bestOf: 2, roundsPerWeek: 2 });
  _demo.fixture = { format: 'single', groups: [], startDate, time: '20:00', byes, bestOf: 2, roundsPerWeek: 2 };
  _demo.items = items;
  _demoSeed();
  _ssDraft = {};
  _ssWeek = 2;
  showView('schedule');
  renderSeasonSchedule();
  document.getElementById('season-schedule-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function _demoGame() {
  let s1 = 55 + Math.floor(Math.random() * 40), s2 = 55 + Math.floor(Math.random() * 40);
  if(s1 === s2) s1++;
  return { s1, s2 };
}
function _demoSeed() {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const days = Object.keys(SS_DAYS);
  _demo.picks = {}; _demo.counts = {}; _demo.myVotes = {}; _demo.results = {};
  _demo.items.forEach(s => {
    const k = String(s.id);
    _demo.counts[k] = { team1: rnd(0, 14), team2: rnd(0, 14) };
    if(s.week === 1) {
      _demo.results[k] = { games: Array.from({ length: s.bestOf || 1 }, _demoGame) };
      Object.assign(s, { date: _ssDayDate(s.weekStart, days[rnd(0, 2)]), time: '20:00' });
    }
  });
  // tydzień 2 — różne przypadki wyboru terminu
  const w2 = _demo.items.filter(s => s.week === 2);
  const W = (x, f1, t1, f2, t2) => ({ primary: x[0], backup: x[1], primaryFrom: f1, primaryTo: t1, backupFrom: f2, backupTo: t2 });
  const set = (s, a, b) => { _demo.picks[String(s.id)] = { ...(a ? { team1: W(a, '20:00', '22:00', '19:00', '21:00') } : {}), ...(b ? { team2: W(b, '20:30', '22:30', '18:00', '20:00') } : {}) }; };
  if(w2[0]) set(w2[0], ['wed', 'sun'], ['wed', 'mon']);   // zgodne priorytety
  if(w2[1]) set(w2[1], ['mon', 'sun'], ['sun', 'wed']);   // priorytet = zapas drugiej
  if(w2[2]) set(w2[2], ['mon', 'wed'], ['sun', 'wed']);   // zgodny tylko zapas
  if(w2[3]) set(w2[3], ['mon', 'wed'], null);             // czeka na drugą drużynę
  if(w2[4]) { set(w2[4], ['sun', 'mon'], ['sun', 'wed']); Object.assign(w2[4], { date: _ssDayDate(w2[4].weekStart, 'sun'), time: '20:00', finalDay: 'sun' }); }
  if(w2[5]) set(w2[5], ['mon', 'sun'], ['wed', 'sun']);
  // kapitan demo = drużyna z meczu tygodnia 2 bez wyboru terminu
  const free = w2.find(s => !_demo.picks[String(s.id)]) || w2[3] || w2[0];
  if(free) _demo.captainTeam = _demo.picks[String(free.id)]?.team1 ? free.team2 : free.team1;
}
function demoSetRole(r) { _demo.role = r; _ssDraft = {}; renderSeasonSchedule(); }
function demoSetCaptain(t) { _demo.captainTeam = t; _ssDraft = {}; renderSeasonSchedule(); }
function demoVote(k, side) {
  const prev = _demo.myVotes[k];
  if(prev === side) return;
  const c = _demo.counts[k] = _demo.counts[k] || { team1: 0, team2: 0 };
  if(prev) c[prev] = Math.max(0, c[prev] - 1);
  c[side]++;
  _demo.myVotes[k] = side;
  renderSeasonSchedule();
}
function demoSimResult(k, undo) {
  const s = _ssItem(k);
  if(undo) { delete _demo.results[k]; renderSeasonSchedule(); return; }
  const r = _demo.results[k] = _demo.results[k] || { games: [] };
  if(r.games.length < (s.bestOf || 1)) r.games.push(_demoGame());
  if(!s.date) Object.assign(s, { date: _ssDayDate(s.weekStart, 'wed'), time: '20:00' });
  renderSeasonSchedule();
}
function endDemo() { _demo = null; _ssDraft = {}; _ssWeek = null; renderSeasonSchedule(); }
function copyDeepLink(hash) {
  const url = location.origin + '/' + hash;
  const done = () => showToast('🔗 Skopiowano link: ' + url, 'success');
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => prompt('Skopiuj link:', url));
  else prompt('Skopiuj link:', url);
}
// ═══ HISTORIA MISTRZÓW — wszystkie playoffy, najnowsze na górze ═══
function _poHistoryHtml(po) {
  const wn = getWinsNeeded(po.format);
  const fmt = { bo1: 'Bo1', bo3: 'Bo3', bo5: 'Bo5', bo7: 'Bo7' }[po.format] || po.format || '';
  const sn = seasons.find(x => x.id === po.seasonId)?.name || (po.startDate ? po.startDate.slice(0, 4) : 'Sezon');
  const series = pr => po.startDate ? getSeriesResults(po, pr.team1, pr.team2) : { w1: pr.w1 || 0, w2: pr.w2 || 0, games: [] };
  const rounds = (po.rounds || []).map(r => ({ ...r, pairs: r.pairs.map(pr => ({ ...pr, s: series(pr) })) }));
  const finalRound = [...rounds].reverse().find(r => /fina/i.test(r.name) && !/3/.test(r.name)) || rounds[rounds.length - 1];
  const finalPair = finalRound?.pairs?.[0];
  const runnerUp = finalPair && po.champion ? (finalPair.team1 === po.champion ? finalPair.team2 : finalPair.team1) : null;
  const finalScore = finalPair ? (finalPair.team1 === po.champion ? `${finalPair.s.w1}:${finalPair.s.w2}` : `${finalPair.s.w2}:${finalPair.s.w1}`) : '';
  const third = rounds.find(r => /3/.test(r.name))?.pairs?.[0];
  const thirdWinner = third ? (third.s.w1 >= wn ? third.team1 : third.s.w2 >= wn ? third.team2 : null) : null;

  // MVP: najlepszy gracz mistrza w meczach tego playoffu
  let mvp = null;
  if(po.champion) {
    const pStats = {};
    getPlayoffMatches(po).filter(m => m.team1.name === po.champion || m.team2.name === po.champion).forEach(m => {
      const side = m.team1.name === po.champion ? m.team1 : m.team2;
      (side.players || []).forEach(p => {
        const x = pStats[p.name] = pStats[p.name] || { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0, gp: 0 };
        x.pts += p.pts || 0; x.reb += p.reb || 0; x.ast += p.ast || 0; x.stl += p.stl || 0; x.blk += p.blk || 0; x.tov += p.tov || p.to || 0; x.gp++;
      });
    });
    const per = x => { const g = x.gp || 1; return x.pts / g + x.reb / g * 1.2 + x.ast / g * 1.5 + x.stl / g * 2 + x.blk / g * 2 - x.tov / g * 1.5; };
    const best = Object.entries(pStats).sort((a, b) => per(b[1]) - per(a[1]))[0];
    if(best) mvp = { name: best[0], pts: (best[1].pts / best[1].gp).toFixed(1), reb: (best[1].reb / best[1].gp).toFixed(1), ast: (best[1].ast / best[1].gp).toFixed(1) };
  }

  const pairHtml = pr => {
    const w = pr.s.w1 >= wn ? pr.team1 : pr.s.w2 >= wn ? pr.team2 : null;
    const row = (t, sc) => `<div style="display:flex;justify-content:space-between;gap:.5rem;padding:.25rem .5rem;${w === t ? 'color:var(--accent);font-weight:800' : ''}"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(t)}</span><b>${sc}</b></div>`;
    return `<div style="background:var(--bg);border:1px solid var(--border);border-radius:6px;font-size:.78rem;margin-bottom:.35rem">${row(pr.team1, pr.s.w1)}${row(pr.team2, pr.s.w2)}</div>`;
  };

  return `
    <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:1rem">
      <div style="background:linear-gradient(135deg,#8b6914,#c9962a);color:#000;padding:.8rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap">
        <div>
          <div style="font-size:.68rem;font-weight:800;letter-spacing:2px;text-transform:uppercase;opacity:.65">${_h(sn)} · Playoff ${fmt}</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;line-height:1.1">🏆 ${po.champion ? _h(po.champion) : 'W trakcie'}</div>
        </div>
        <div style="font-size:.78rem;text-align:right;line-height:1.5">
          ${runnerUp ? `🥈 ${_h(runnerUp)}${finalScore ? ' · finał ' + finalScore : ''}<br>` : ''}
          ${thirdWinner ? `🥉 ${_h(thirdWinner)}<br>` : ''}
          ${mvp ? `⭐ MVP: <b>${_h(mvp.name)}</b> · ${mvp.pts} PTS / ${mvp.reb} REB / ${mvp.ast} AST` : ''}
        </div>
      </div>
      <details style="background:var(--surface2)">
        <summary style="cursor:pointer;padding:.55rem 1rem;font-size:.78rem;color:var(--muted)">Drabinka</summary>
        <div style="display:flex;gap:1rem;overflow-x:auto;padding:.25rem 1rem 1rem">
          ${rounds.map(r => `<div style="min-width:190px"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">${_h(r.name)}</div>${r.pairs.map(pairHtml).join('')}</div>`).join('')}
        </div>
      </details>
    </div>`;
}
function openChampionsHistory() {
  let m = document.getElementById('champions-modal');
  if(!m) {
    m = document.createElement('div');
    m.id = 'champions-modal';
    m.className = 'modal-overlay';
    m.style.zIndex = '1200';
    m.onclick = e => { if(e.target === m) m.classList.remove('open'); };
    m.innerHTML = '<div class="modal" style="max-width:720px"></div>';
    document.body.appendChild(m);
  }
  _withAllMatches(_migratePlayoffSeasons);
  const list = [...playoffs].sort((a, b) => String(b.startDate || b.createdAt || '').localeCompare(String(a.startDate || a.createdAt || '')));
  m.querySelector('.modal').innerHTML = `
    <button class="modal-close" onclick="document.getElementById('champions-modal').classList.remove('open')">&#x2715;</button>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:1px;margin-bottom:1rem">📜 Historia mistrzów</div>
    ${list.length ? _withAllMatches(() => list.map(_poHistoryHtml).join('')) : '<div style="color:var(--muted);text-align:center;padding:2rem">Brak rozegranych playoffów</div>'}`;
  m.classList.add('open');
}
