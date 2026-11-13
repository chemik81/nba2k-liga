/*@v:739204317b*/
// ═══════════════════════════════════════════════════════════════
// CAPTAIN NOTIFICATION MODAL
// ═══════════════════════════════════════════════════════════════
function openCaptainNotifModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !(ev.teams||[]).length) { showToast('❌ Brak przypisanych kapitanów', 'error'); return; }

  // Worker sends via DISCORD_WEBHOOK_NBA secret — no need for discordWebhookUrl in localStorage
  const hasWebhook = !!(discordWebhookUrl || workerUrl);

  const _notifWu = localStorage.getItem('nba2k_worker_url') || '';
  const _notifBase = `${location.origin}${location.pathname}`;
  // Token is in event data — no ev_tok needed in the link
  const _notifGmUrl = _notifWu ? `${_notifBase}?w=${encodeURIComponent(_notifWu)}&event=${ev.id}#gm` : '';
  const defaultMsg = `📣 **${ev.title}** — przydzielono kapitanów!\n\n` +
    ev.teams.map(team => {
      const c = team.captain;
      if(!c) return '';
      const mention = c.id ? `<@${c.id}>` : c.name;
      return `🏀 **${team.name}** → kapitan: ${mention}`;
    }).filter(Boolean).join('\n') +
    `\n\nKapitanowie — otwórzcie swój Panel GM i dokonajcie picków! 🎮${_notifGmUrl ? '\n🔗 ' + _notifGmUrl : ''}`;

  document.getElementById('captain-notif-modal-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:.25rem">📣 POWIADOM KAPITANÓW</div>
    <div style="color:var(--muted);font-size:.85rem;margin-bottom:1.25rem">Wyślij powiadomienie do kapitanów przez Discord Webhook.</div>

    <div style="margin-bottom:1rem">
      <div style="font-size:.75rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.5rem">Kapitanowie</div>
      <div style="display:flex;flex-direction:column;gap:.4rem">
        ${ev.teams.map(team => {
          const c = team.captain;
          if(!c) return '';
          const discordTag = c.discordTag && c.discordTag !== c.name ? c.discordTag : null;
          const gmOnline = ev.gmOnline || [];
          const isOnline = gmOnline.includes(c.id);
          return `<div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem .75rem">
            <div style="display:flex;align-items:center;gap:.5rem">
              <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${isOnline?'#4ade80':'#374151'};border:1.5px solid ${isOnline?'#4ade80':'#6b7280'};box-shadow:${isOnline?'0 0 6px #4ade80':'none'}"></span>
              <span style="font-weight:700">${c.name}</span>
              ${discordTag ? `<span style="color:var(--muted);font-size:.8rem">${discordTag}</span>` : ''}
            </div>
            <div style="font-size:.8rem;color:var(--muted)">${team.name}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
        <div style="font-size:.75rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase">Treść wiadomości</div>
        <button onclick="document.getElementById('cn-msg').value=${JSON.stringify(defaultMsg)}" style="font-size:.75rem;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:5px;padding:.2rem .6rem;cursor:pointer;font-family:inherit">↺ Reset</button>
      </div>
      <textarea id="cn-msg" rows="8" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:.7rem;font-family:monospace;font-size:.82rem;resize:vertical;box-sizing:border-box;line-height:1.5">${defaultMsg}</textarea>
      <div style="font-size:.75rem;color:var(--muted);margin-top:.3rem">💡 Mentiony <code>&lt;@ID&gt;</code> automatycznie pingują graczy na Discordzie.</div>
    </div>

    ${!hasWebhook ? `<div style="background:rgba(255,165,0,.1);border:1px solid rgba(255,165,0,.3);border-radius:8px;padding:.75rem;margin-bottom:1rem;font-size:.85rem;color:#f39c12">
      ⚠️ Brak Worker URL ani Discord Webhook URL. Skonfiguruj Worker URL w ustawieniach.
    </div>` : (workerUrl && !discordWebhookUrl ? `<div style="background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:8px;padding:.5rem .75rem;margin-bottom:1rem;font-size:.8rem;color:#4ade80">
      ✅ Webhook przez Worker (sekret DISCORD_WEBHOOK_NBA)
    </div>` : '')}

    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <button id="cn-send-btn" class="btn btn-primary" style="background:#7289da;border-color:#7289da;flex:1;justify-content:center;${!hasWebhook?'opacity:.5;pointer-events:none':''}"
        onclick="sendCaptainNotifWebhook('${eventId}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:.4rem"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
        Wyślij na Discord
      </button>
      <button class="btn btn-ghost" onclick="copyCaptainNotifText()">📋 Kopiuj tekst</button>
      <button class="btn btn-ghost" onclick="document.getElementById('captain-notif-modal').classList.remove('open')">Anuluj</button>
    </div>`;

  document.getElementById('captain-notif-modal').classList.add('open');
}
async function sendCaptainNotifWebhook(eventId) {
  const msg = document.getElementById('cn-msg')?.value?.trim();
  if(!msg) { showToast('❌ Wiadomość jest pusta', 'error'); return; }
  if(!workerUrl && !discordWebhookUrl) { showToast('❌ Brak Discord Webhook URL w konfiguracji', 'error'); return; }
  const btn = document.getElementById('cn-send-btn');
  if(btn) { btn.disabled = true; btn.textContent = '⏳ Wysyłanie...'; }
  try {
    const ok = await _discordNotify({ route: 'eventCaptains', content: msg });
    // prywatna wiadomość do każdego kapitana eventu
    const ev = events.find(e => e.id === eventId);
    const caps = [...new Set((ev?.teams || []).map(t => t.captain?.id).filter(id => /^\d{15,21}$/.test(String(id || ''))))];
    let dm = 0;
    for(const id of caps) { const r = await _api('/draft-notify', 'POST', { discordUserId: id, message: `📣 **${ev?.title || 'Event'}** — wiadomość dla kapitanów:\n${msg}` }, { admin: true }); if(r.ok) dm++; }
    if(!ok && !dm) throw new Error('no webhook');
    document.getElementById('captain-notif-modal').classList.remove('open');
    showToast(`✅ Wysłano${ok ? ' na Discord' : ''}${caps.length ? ` · DM: ${dm}/${caps.length} kapitanów` : ''}`, 'success');
  } catch(e) {
    showToast('❌ Błąd wysyłania: ' + e.message, 'error');
    if(btn) { btn.disabled = false; btn.textContent = '🎮 Wyślij na Discord'; }
  }
}
function copyCaptainNotifText() {
  const msg = document.getElementById('cn-msg')?.value || '';
  if(!msg) return;
  navigator.clipboard.writeText(msg)
    .then(() => showToast('📋 Skopiowano do schowka!', 'success'))
    .catch(() => showToast('❌ Błąd kopiowania', 'error'));
}
// H2H MIĘDZY GRACZAMI
// ═══════════════════════════════════════════════════════════════
function openPlayerH2H(playerName, teamName) {
  // Get all opponents this player has faced
  const opponents = new Set();
  matches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      if(team.name !== teamName) return;
      const opp = team === m.team1 ? m.team2 : m.team1;
      (opp.players||[]).forEach(p => opponents.add(p.name + '|||' + opp.name));
    });
  });

  const oppList = [...opponents].sort().map(key => {
    const [name, team] = key.split('|||');
    return `<div onclick="renderPlayerH2H('${playerName.replace(/'/g,"\\'")}','${teamName.replace(/'/g,"\\'")}','${name.replace(/'/g,"\\'")}','${team.replace(/'/g,"\\'")}');event.stopPropagation()"
      style="padding:.5rem .75rem;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border);margin-bottom:.4rem;background:var(--surface2);transition:border-color .2s"
      onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <span style="font-weight:600">${name}</span>
      <span style="color:var(--muted);font-size:.8rem">${team}</span>
    </div>`;
  }).join('');

  document.getElementById('player-modal-content').innerHTML = `
    <div style="margin-bottom:1.25rem">
      <button onclick="openPlayerModal('${playerName.replace(/'/g,"\\'")}','${teamName.replace(/'/g,"\\'")}');event.stopPropagation()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.85rem;padding:0;font-family:inherit">← Wróć</button>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-top:.5rem">⚔️ H2H — ${playerName}</div>
      <div style="color:var(--muted);font-size:.85rem">Wybierz przeciwnika do porównania</div>
    </div>
    <div id="h2h-opp-list">${oppList || '<div style="color:var(--muted)">Brak danych H2H</div>'}</div>
    <div id="h2h-result" style="margin-top:1rem"></div>`;
  document.getElementById('player-modal').classList.add('open');
}
function renderPlayerH2H(p1name, p1team, p2name, p2team) {
  const p1games = [], p2games = [];
  matches.forEach(m => {
    let p1data = null, p2data = null, sameMatch = false;
    [m.team1, m.team2].forEach(team => {
      const p1 = team.name === p1team ? (team.players||[]).find(p => p.name === p1name) : null;
      const p2 = team.name === p2team ? (team.players||[]).find(p => p.name === p2name) : null;
      if(p1) p1data = { ...p1, date: m.date };
      if(p2) p2data = { ...p2, date: m.date };
    });
    // Only count games where both played (same match)
    const p1inMatch = [...(m.team1.players||[]),...(m.team2.players||[])].some(p => p.name === p1name);
    const p2inMatch = [...(m.team1.players||[]),...(m.team2.players||[])].some(p => p.name === p2name);
    if(p1inMatch && p2inMatch) {
      if(p1data) p1games.push(p1data);
      if(p2data) p2games.push(p2data);
    }
  });

  if(!p1games.length) {
    document.getElementById('h2h-result').innerHTML = '<div style="color:var(--muted);font-size:.85rem">Brak wspólnych meczów</div>';
    return;
  }

  const avg = (games, key) => games.length ? (games.reduce((s,g)=>s+(g[key]||0),0)/games.length).toFixed(1) : '0.0';
  const stats = [
    ['PTS', avg(p1games,'pts'), avg(p2games,'pts')],
    ['REB', avg(p1games,'reb'), avg(p2games,'reb')],
    ['AST', avg(p1games,'ast'), avg(p2games,'ast')],
    ['STL', avg(p1games,'stl'), avg(p2games,'stl')],
    ['BLK', avg(p1games,'blk'), avg(p2games,'blk')],
    ['TO',  avg(p1games,'to'),  avg(p2games,'to')],
  ];

  const p1cs = calcCompositeScore({ gp:p1games.length, pts:p1games.reduce((s,g)=>s+(g.pts||0),0), reb:p1games.reduce((s,g)=>s+(g.reb||0),0), ast:p1games.reduce((s,g)=>s+(g.ast||0),0), stl:p1games.reduce((s,g)=>s+(g.stl||0),0), blk:p1games.reduce((s,g)=>s+(g.blk||0),0), to:p1games.reduce((s,g)=>s+(g.to||0),0), fgm:p1games.reduce((s,g)=>s+(g.fgm||0),0), fga:p1games.reduce((s,g)=>s+(g.fga||0),0), gradeSum:p1games.reduce((s,g)=>s+gradeToNum(g.grade||'B'),0) });
  const p2cs = calcCompositeScore({ gp:p2games.length, pts:p2games.reduce((s,g)=>s+(g.pts||0),0), reb:p2games.reduce((s,g)=>s+(g.reb||0),0), ast:p2games.reduce((s,g)=>s+(g.ast||0),0), stl:p2games.reduce((s,g)=>s+(g.stl||0),0), blk:p2games.reduce((s,g)=>s+(g.blk||0),0), to:p2games.reduce((s,g)=>s+(g.to||0),0), fgm:p2games.reduce((s,g)=>s+(g.fgm||0),0), fga:p2games.reduce((s,g)=>s+(g.fga||0),0), gradeSum:p2games.reduce((s,g)=>s+gradeToNum(g.grade||'B'),0) });

  const statRows = stats.map(([label, v1, v2]) => {
    const n1 = parseFloat(v1), n2 = parseFloat(v2);
    const toKey = label === 'TO';
    const p1wins = toKey ? n1 < n2 : n1 > n2;
    const p2wins = toKey ? n2 < n1 : n2 > n1;
    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:.5rem .75rem;text-align:right;font-weight:700;color:${p1wins?'var(--accent)':'var(--text)'};font-size:1rem">${v1}</td>
      <td style="padding:.5rem .5rem;text-align:center;color:var(--muted);font-size:.75rem;font-weight:700;letter-spacing:1px">${label}</td>
      <td style="padding:.5rem .75rem;text-align:left;font-weight:700;color:${p2wins?'var(--accent)':'var(--text)'};font-size:1rem">${v2}</td>
    </tr>`;
  }).join('');

  document.getElementById('h2h-result').innerHTML = `
    <div style="background:var(--surface2);border-radius:10px;padding:1rem;border:1px solid var(--border)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:1px solid var(--border)">
        <div style="text-align:right">
          <div style="font-weight:700">${p1name}</div>
          <div style="font-size:.75rem;color:var(--muted)">${p1team}</div>
        </div>
        <div style="text-align:center;font-size:.8rem;color:var(--muted);font-weight:700">${p1games.length} wspólnych<br>meczów</div>
        <div>
          <div style="font-weight:700">${p2name}</div>
          <div style="font-size:.75rem;color:var(--muted)">${p2team}</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">${statRows}</table>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--border)">
        <div style="text-align:right;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:${p1cs>p2cs?'var(--accent)':'var(--muted)'}">${p1cs.toFixed(1)}</div>
        <div style="text-align:center;font-size:.7rem;color:var(--muted);font-weight:700;letter-spacing:1px">CS</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:${p2cs>p1cs?'var(--accent)':'var(--muted)'}">${p2cs.toFixed(1)}</div>
      </div>
    </div>`;
}
// ═══════════════════════════════════════════════════════════════
// KALKULATOR SKŁADU
// ═══════════════════════════════════════════════════════════════
function openRosterCalculator() {
  const metric = window._rcMetric || 'per';

  // Build player list — key by name|||team so each team stint is separate
  const playerMap = {};
  matches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players||[]).forEach(p => {
        const key = p.name + '|||' + team.name;
        if(!playerMap[key]) playerMap[key] = {name:p.name, team:team.name, pos:p.pos||'', posCounts:{}, gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0};
        const s = playerMap[key];
        if(p.pos) s.pos = p.pos;
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.tpm+=p.tpm||0; s.tpa+=p.tpa||0;
        s.ftm+=p.ftm||0; s.fta+=p.fta||0; s.gradeSum+=gradeToNum(p.grade||'B');
      });
    });
  });

  const scoreOf = p => metric === 'per' ? calcPER(p) : calcRawScore(p);
  const players = Object.values(playerMap)
    .filter(p => p.gp > 0)
    .map(p => ({ ...p, score: scoreOf(p) }))
    .sort((a,b) => b.score - a.score);

  const byPos = {};
  ['PG','SG','SF','PF','C'].forEach(pos => { byPos[pos] = players.filter(p => p.pos === pos); });
  const noPos = players.filter(p => !p.pos);
  // SF i PF mogą grać wymiennie
  const sfpf = players.filter(p => p.pos === 'SF' || p.pos === 'PF');

  const scoreLabel = metric === 'per' ? 'PER' : 'CS';

  const slots = ['PG','SG','SF','PF','C'].map((pos, i) => {
    const basePlayers = (pos === 'SF' || pos === 'PF') ? sfpf : byPos[pos];
    const posPlayers = [...new Map([...basePlayers, ...noPos].map(p => [p.name+'|||'+p.team, p])).values()].sort((a,b) => b.score - a.score);
    const list = posPlayers.length ? posPlayers : players;
    const opts = list.map(p =>
      `<option value="${p.name}|||${p.team}">${p.name} (${p.team}) — ${scoreLabel}: ${p.score.toFixed(1)} · ${p.gp}GP</option>`
    ).join('');
    const count = list.length;
    return `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
      <div style="flex-shrink:0;text-align:center">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;color:var(--accent);font-size:.9rem">${pos}</div>
        <div style="font-size:.65rem;color:var(--muted)">${count}${t('rc_players')}</div>
      </div>
      <select id="rc-slot-${i}" onchange="rcValidateDupes(${i})" style="flex:1;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.4rem .6rem;font-family:inherit;font-size:.85rem">
        <option value="">— ${t('rc_pick')} ${pos} —</option>
        ${opts}
      </select>
    </div>`;
  }).join('');

  // Team list for load button
  const teamNames = [...new Set(matches.flatMap(m => [m.team1.name, m.team2.name]))].filter(Boolean).sort();
  const teamOpts = teamNames.map(tn => `<option value="${tn}">${tn}</option>`).join('');

  document.getElementById('player-modal-content').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;margin-bottom:.25rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px">${t('rc_title')}</div>
      <div style="display:flex;gap:.25rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.2rem">
        <button id="rc-metric-cs" onclick="setRosterMetric('cs')"
          style="padding:.3rem .8rem;border:none;border-radius:6px;background:${metric==='cs'?'var(--accent)':'transparent'};color:${metric==='cs'?'#000':'var(--muted)'};font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;transition:all .2s">CS</button>
        <button id="rc-metric-per" onclick="setRosterMetric('per')"
          style="padding:.3rem .8rem;border:none;border-radius:6px;background:${metric==='per'?'#3498db':'transparent'};color:${metric==='per'?'#fff':'var(--muted)'};font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;transition:all .2s">PER</button>
      </div>
    </div>
    <div style="color:var(--muted);font-size:.85rem;margin-bottom:1rem">${t('rc_subtitle')}</div>
    <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:1rem;flex-wrap:wrap">
      <select id="rc-team-select" style="flex:1;min-width:160px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.35rem .6rem;font-family:inherit;font-size:.85rem">
        <option value="">— wybierz drużynę —</option>
        ${teamOpts}
      </select>
      <button onclick="rcLoadTeam()" style="background:var(--accent);color:#000;border:none;border-radius:6px;padding:.35rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;white-space:nowrap;transition:opacity .2s" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">⬇ Załaduj skład</button>
      <button onclick="rcClearAll()" style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.35rem .8rem;font-family:inherit;font-size:.8rem;cursor:pointer" title="Wyczyść wszystkie sloty">✕ Wyczyść</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.25rem">${slots}</div>
    <div id="rc-result"></div>`;
  document.getElementById('player-modal').classList.add('open');
}
function rcLoadTeam() {
  const teamName = document.getElementById('rc-team-select')?.value;
  if (!teamName) { showToast('Wybierz drużynę', 'info'); return; }

  const metric = window._rcMetric || 'per';

  // Build player map for this team
  const playerMap = {};
  matches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      if (team.name !== teamName) return;
      (team.players||[]).forEach(p => {
        const key = p.name + '|||' + team.name;
        if (!playerMap[key]) playerMap[key] = {name:p.name, team:team.name, pos:p.pos||'', posCounts:{}, gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0};
        const s = playerMap[key];
        if (p.pos) s.pos = p.pos;
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.tpm+=p.tpm||0; s.tpa+=p.tpa||0;
        s.ftm+=p.ftm||0; s.fta+=p.fta||0; s.gradeSum+=gradeToNum(p.grade||'B');
      });
    });
  });

  const scoreOf = p => metric === 'per' ? calcPER(p) : calcRawScore(p);
  const players = Object.values(playerMap).filter(p => p.gp > 0)
    .map(p => ({...p, score: scoreOf(p)}))
    .sort((a,b) => b.score - a.score);

  if (!players.length) { showToast('Brak graczy dla tej drużyny', 'info'); return; }

  const positions = ['PG','SG','SF','PF','C'];
  const sfpf = players.filter(p => p.pos === 'SF' || p.pos === 'PF');
  const used = new Set();

  positions.forEach((pos, i) => {
    const sel = document.getElementById('rc-slot-' + i);
    if (!sel) return;

    // Get candidates for this position
    const candidates = (pos === 'SF' || pos === 'PF') ? sfpf : players.filter(p => p.pos === pos);
    const fallback = players; // use any player if no position match

    const pool = candidates.length ? candidates : fallback;
    // Pick best unused player
    const pick = pool.find(p => !used.has(p.name + '|||' + p.team));
    if (pick) {
      const val = pick.name + '|||' + pick.team;
      // Find option in select
      const opt = Array.from(sel.options).find(o => o.value === val);
      if (opt) { sel.value = val; used.add(val); }
    }
  });

  rcUpdateResult();
  showToast('✅ Skład drużyny ' + teamName + ' załadowany!', 'success');
}
function rcClearAll() {
  ['PG','SG','SF','PF','C'].forEach((_,i) => {
    const sel = document.getElementById('rc-slot-' + i);
    if (sel) sel.value = '';
  });
  const res = document.getElementById('rc-result');
  if (res) res.innerHTML = '';
}
function setRosterMetric(metric) {
  // Save current selections before rebuilding
  const saved = ['PG','SG','SF','PF','C'].map((_,i) => document.getElementById('rc-slot-'+i)?.value || '');
  window._rcMetric = metric;
  // Rebuild dropdowns with new metric sorting + restore selections
  openRosterCalculator();
  saved.forEach((val, i) => {
    const sel = document.getElementById('rc-slot-'+i);
    if(sel && val) sel.value = val;
  });
  calcRoster();
}
function calcRoster() {
  const metric = window._rcMetric || 'per';
  const playerMap = {};
  const teamDefMap = {};
  matches.forEach(m => {
    [m.team1, m.team2].forEach((team, ti) => {
      const opp = ti===0?m.team2:m.team1;
      if(!teamDefMap[team.name]) teamDefMap[team.name] = [];
      teamDefMap[team.name].push(opp.score||0);
      (team.players||[]).forEach(p => {
        // Key by name|||team — same as dropdown values
        const key = p.name + '|||' + team.name;
        if(!playerMap[key]) playerMap[key] = {name:p.name, team:team.name, pos:p.pos||'', posCounts:{}, gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0};
        const s = playerMap[key]; s.gp++;
        if(p.pos) s.pos = p.pos;
        s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.tpm+=p.tpm||0; s.tpa+=p.tpa||0;
        s.ftm+=p.ftm||0; s.fta+=p.fta||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
      });
    });
  });

  const POSITIONS = ['PG','SG','SF','PF','C'];
  const selected = POSITIONS.map((pos, i) => {
    const val = document.getElementById('rc-slot-' + i)?.value;
    if(!val) return null;
    return playerMap[val] || null;
  }).filter(Boolean);

  if(!selected.length) { document.getElementById('rc-result').innerHTML = ''; return; }

  // ── Potencjał ofensywny (suma PPG wszystkich 5 graczy = szacowane punkty drużyny)
  const teamPPG = selected.reduce((s,p) => s + p.pts/p.gp, 0);
  const teamRPG = selected.reduce((s,p) => s + p.reb/p.gp, 0);
  const teamAPG = selected.reduce((s,p) => s + p.ast/p.gp, 0);
  const teamSPG = selected.reduce((s,p) => s + p.stl/p.gp, 0);
  const teamBPG = selected.reduce((s,p) => s + p.blk/p.gp, 0);
  const teamTO  = selected.reduce((s,p) => s + p.to/p.gp, 0);
  const totalFGM = selected.reduce((s,p) => s+p.fgm, 0);
  const totalFGA = selected.reduce((s,p) => s+p.fga, 0);
  const totalTPM = selected.reduce((s,p) => s+p.tpm, 0);
  const totalTPA = selected.reduce((s,p) => s+p.tpa, 0);
  const fgPct  = totalFGA > 0 ? Math.round(totalFGM/totalFGA*100) : 0;
  const tpPct  = totalTPA > 0 ? Math.round(totalTPM/totalTPA*100) : 0;

  // ── Defensywa: średnia punktów traconych przez drużyny graczy
  const defScores = selected.flatMap(p => teamDefMap[p.team] || []);
  const avgDefPts = defScores.length ? (defScores.reduce((s,v)=>s+v,0)/defScores.length) : null;

  // ── CS i ocena
  const scoreLabel = metric === 'per' ? 'PER' : 'CS';
  const scoreColor = metric === 'per' ? '#3498db' : 'var(--accent)';
  const csValues = selected.map(p => metric === 'per' ? calcPER(p) : calcRawScore(p));
  const avgCS = csValues.reduce((s,v)=>s+v,0) / selected.length;
  const minCS = Math.min(...csValues);

  // Skala 7 poziomów oparta o avgCS i minCS (słabe ogniwo obniża ocenę)
  const effectiveCS = avgCS * 0.75 + minCS * 0.25;
  // Compute all player scores for percentile-based rating
  const allScores = Object.values(playerMap).filter(p=>p.gp>0).map(p => metric==='per' ? calcPER(p) : calcRawScore(p)).sort((a,b)=>a-b);
  const pct = (q) => allScores.length ? allScores[Math.floor(allScores.length*q/100)] : 0;
  const RATING_THRESHOLDS = [pct(95), pct(80), pct(65), pct(45), pct(30), pct(15), 0];
  const RATINGS = [
    { min:RATING_THRESHOLDS[0], label:t('rc_god'),       color:'#f5c518', desc:t('rc_god_desc') },
    { min:RATING_THRESHOLDS[1], label:t('rc_elite'),     color:'#e8b800', desc:t('rc_elite_desc') },
    { min:RATING_THRESHOLDS[2], label:t('rc_strong'),    color:'#2ecc71', desc:t('rc_strong_desc') },
    { min:RATING_THRESHOLDS[3], label:t('rc_solid'),     color:'#3498db', desc:t('rc_solid_desc') },
    { min:RATING_THRESHOLDS[4], label:t('rc_average'),   color:'#95a5a6', desc:t('rc_average_desc') },
    { min:RATING_THRESHOLDS[5], label:t('rc_weak'),      color:'#e67e22', desc:t('rc_weak_desc') },
    { min:0,                    label:t('rc_rebuilding'),color:'#e74c3c', desc:t('rc_rebuilding_desc') },
  ];
  const rating = RATINGS.find(r => effectiveCS >= r.min) || RATINGS[RATINGS.length-1];

  // ── CS bar per player
  const maxPossibleCS = 25;
  const playerCards = selected.map((p, i) => {
    const cs = csValues[i];
    const gr = numToGrade(p.gradeSum/p.gp);
    const barW = Math.min(Math.round(cs/maxPossibleCS*100), 100);
    const isWeak = cs === minCS && selected.length > 1 && (avgCS - cs) > avgCS * 0.30;
    return `<div style="background:var(--surface2);border:1px solid ${isWeak?'rgba(231,76,60,.4)':'var(--border)'};border-radius:8px;padding:.6rem;text-align:center;flex:1;min-width:80px">
      <div style="font-size:.7rem;font-weight:700;color:var(--accent);margin-bottom:.15rem">${p.pos||POSITIONS[i]||'?'}</div>
      <div style="font-weight:700;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.1rem" title="${p.name} (${p.team})">${p.name}</div>
      <div style="font-size:.62rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:.1rem">${p.team||''}</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem;color:${isWeak?'#e74c3c':scoreColor}">${cs.toFixed(1)}</div>
      <span class="grade grade-${gr.replace('+','p').replace('-','m')}" style="font-size:.68rem">${gr}</span>
      ${isWeak && selected.length===5?'<div style="font-size:.62rem;color:#e74c3c;margin-top:.15rem">'+t('rc_weak_link')+'</div>':''}
    </div>`;
  }).join('');

  // ── Legenda
  const legendRows = RATINGS.map(r => `
    <div style="display:flex;align-items:center;gap:.5rem;padding:.2rem 0">
      <div style="width:8px;height:8px;border-radius:50%;background:${r.color};flex-shrink:0"></div>
      <span style="font-weight:700;font-size:.75rem;color:${r.color};width:110px">${r.label}</span>
      <span style="font-size:.72rem;color:var(--muted)">${r.desc}</span>
    </div>`).join('');

  // ── Statystyki zespołowe
  const teamStats = [
    { label:t('rc_pts'), value: teamPPG.toFixed(1), sub:t('rc_pts_sub'), color:'var(--accent)' },
    { label:t('rc_def'), value: avgDefPts !== null ? avgDefPts.toFixed(1) : '—', sub:t('rc_def_sub'), color:'#e74c3c' },
    { label:t('rc_reb'), value: teamRPG.toFixed(1), sub:t('rc_reb_sub'), color:'#4fc3f7' },
    { label:t('rc_ast'), value: teamAPG.toFixed(1), sub:t('rc_ast_sub'), color:'#2ecc71' },
    { label:t('rc_stl'), value: teamSPG.toFixed(1), sub:t('rc_stl_sub'), color:'#9b59b6' },
    { label:t('rc_blk'), value: teamBPG.toFixed(1), sub:t('rc_blk_sub'), color:'#1abc9c' },
    { label:t('rc_to'),  value: teamTO.toFixed(1),  sub:t('rc_to_sub'),  color:'#e67e22' },
    { label:t('rc_fg'),  value: fgPct+'%', sub:t('rc_fg_sub'), color:'var(--text)' },
    { label:t('rc_3p'),  value: tpPct+'%', sub:t('rc_3p_sub'), color:'var(--text)' },
  ].map(s => `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.6rem .75rem">
      <div style="font-size:.7rem;color:var(--muted);margin-bottom:.15rem">${s.label}</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:${s.color}">${s.value}</div>
      <div style="font-size:.65rem;color:var(--muted);margin-top:.1rem">${s.sub}</div>
    </div>`).join('');

  document.getElementById('rc-result').innerHTML = `
    <div style="border:2px solid ${rating.color}33;border-radius:12px;overflow:hidden;margin-bottom:0">
      <!-- Rating header -->
      <div style="background:linear-gradient(135deg,${rating.color}18,${rating.color}08);padding:1rem;text-align:center;border-bottom:1px solid ${rating.color}33">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.2rem;color:${rating.color};letter-spacing:2px">${rating.label}</div>
        <div style="font-size:.75rem;color:var(--muted);margin-top:.15rem">${rating.desc}</div>
        <div style="font-size:.7rem;color:var(--muted);margin-top:.1rem">Effective ${scoreLabel}: <span style="color:${rating.color};font-weight:700">${effectiveCS.toFixed(1)}</span> · AVG ${scoreLabel}: <span style="font-weight:700">${avgCS.toFixed(1)}</span></div>
      </div>

      <!-- Player cards -->
      <div style="padding:.75rem;border-bottom:1px solid var(--border)">
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">${playerCards}</div>
      </div>

      <!-- Team stats -->
      <div style="padding:.75rem;border-bottom:1px solid var(--border)">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.6rem">${t('rc_potential')}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem">${teamStats}</div>
      </div>

      <!-- Legend -->
      <div style="padding:.75rem;background:var(--surface2)">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.5rem">${t('rc_scale')}</div>
        ${legendRows}
      </div>
    </div>`;
}
// ═══════════════════════════════════════════════════════════════
// REKORDY LIGI
// ═══════════════════════════════════════════════════════════════
function openLeagueRecordsModal() {
  if(!matches.length) { showToast('Brak meczów do analizy', 'info'); return; }

  // Best single game performances
  const allGames = [];
  matches.forEach(m => {
    [m.team1, m.team2].forEach((team, ti) => {
      const opp = ti === 0 ? m.team2 : m.team1;
      (team.players||[]).forEach(p => {
        const fga = p.fga||0, fgm = p.fgm||0, tpa = p.tpa||0, tpm = p.tpm||0, fta = p.fta||0, ftm = p.ftm||0;
        allGames.push({
          player: p.name, team: team.name, opp: opp.name, date: m.date,
          pts: p.pts||0, reb: p.reb||0, ast: p.ast||0, stl: p.stl||0, blk: p.blk||0,
          to: p.to||0, grade: p.grade||'B', fgm, fga, tpm, tpa, ftm, fta,
          fgPct: fga>0?Math.round(fgm/fga*100):0,
          matchId: m.id
        });
      });
    });
  });

  const best = (key, desc=true) => {
    const sorted = [...allGames].sort((a,b) => desc ? b[key]-a[key] : a[key]-b[key]);
    return sorted[0];
  };

  // Team records
  const teamStats = {};
  matches.forEach(m => {
    [m.team1, m.team2].forEach((team, ti) => {
      const opp = ti===0?m.team2:m.team1;
      if(!teamStats[team.name]) teamStats[team.name] = { wins:0, losses:0, streak:0, maxStreak:0, lastResult:'', scores:[] };
      const t = teamStats[team.name];
      t.scores.push(team.score||0);
      const won = (team.score||0) > (opp.score||0);
      if(won) { t.wins++; if(t.lastResult==='w') t.streak++; else t.streak=1; t.lastResult='w'; }
      else { t.losses++; t.streak=0; t.lastResult='l'; }
      if(t.streak > t.maxStreak) t.maxStreak = t.streak;
    });
  });

  // Highest score in single game
  let maxScore = 0, maxScoreMatch = null;
  matches.forEach(m => {
    if((m.team1.score||0) > maxScore) { maxScore = m.team1.score; maxScoreMatch = { score: m.team1.score, team: m.team1.name, opp: m.team2.name, date: m.date, matchId: m.id }; }
    if((m.team2.score||0) > maxScore) { maxScore = m.team2.score; maxScoreMatch = { score: m.team2.score, team: m.team2.name, opp: m.team1.name, date: m.date, matchId: m.id }; }
  });

  // Longest winning streak
  const streakTeam = Object.entries(teamStats).sort((a,b) => b[1].maxStreak - a[1].maxStreak)[0];

  // Most wins
  const mostWins = Object.entries(teamStats).sort((a,b) => b[1].wins - a[1].wins)[0];

  const records = [
    { emoji:'🔥', label:'Najwięcej PTS w meczu', player: best('pts').player, team: best('pts').team, value: best('pts').pts + ' PTS', sub: 'vs ' + best('pts').opp + ' · ' + formatDate(best('pts').date) },
    { emoji:'💪', label:'Najwięcej REB w meczu', player: best('reb').player, team: best('reb').team, value: best('reb').reb + ' REB', sub: 'vs ' + best('reb').opp + ' · ' + formatDate(best('reb').date) },
    { emoji:'🎯', label:'Najwięcej AST w meczu', player: best('ast').player, team: best('ast').team, value: best('ast').ast + ' AST', sub: 'vs ' + best('ast').opp + ' · ' + formatDate(best('ast').date) },
    { emoji:'🦅', label:'Najwięcej STL w meczu', player: best('stl').player, team: best('stl').team, value: best('stl').stl + ' STL', sub: 'vs ' + best('stl').opp + ' · ' + formatDate(best('stl').date) },
    { emoji:'🛡️', label:'Najwięcej BLK w meczu', player: best('blk').player, team: best('blk').team, value: best('blk').blk + ' BLK', sub: 'vs ' + best('blk').opp + ' · ' + formatDate(best('blk').date) },
    { emoji:'🏀', label:'Najwyższy wynik drużyny', player: maxScoreMatch ? maxScoreMatch.team : '—', team: '', value: maxScoreMatch ? maxScoreMatch.score + ' PKT' : '—', sub: maxScoreMatch ? 'vs ' + maxScoreMatch.opp + ' · ' + formatDate(maxScoreMatch.date) : '' },
    { emoji:'🏆', label:'Najdłuższa seria zwycięstw', player: streakTeam ? streakTeam[0] : '—', team: '', value: streakTeam ? streakTeam[1].maxStreak + ' meczów' : '—', sub: '' },
    { emoji:'👑', label:'Najwięcej zwycięstw', player: mostWins ? mostWins[0] : '—', team: '', value: mostWins ? mostWins[1].wins + ' W' : '—', sub: mostWins ? mostWins[1].losses + ' porażek' : '' },
  ];

  // Top 5 single game performances by CS
  const top5 = allGames.map(g => ({
    ...g,
    cs: calcCompositeScore({ gp:1, pts:g.pts, reb:g.reb, ast:g.ast, stl:g.stl, blk:g.blk, to:g.to, fgm:g.fgm, fga:g.fga, gradeSum:gradeToNum(g.grade) })
  })).sort((a,b) => b.cs-a.cs).slice(0,10);

  const recordCards = records.map(r => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.9rem 1rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem">
      <div style="display:flex;align-items:center;gap:.75rem;min-width:0">
        <div style="font-size:1.5rem;flex-shrink:0">${r.emoji}</div>
        <div style="min-width:0">
          <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:.15rem">${r.label}</div>
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.player}${r.team?'<span style="color:var(--muted);font-size:.8rem;margin-left:.4rem">'+r.team+'</span>':''}</div>
          ${r.sub ? `<div style="font-size:.75rem;color:var(--muted)">${r.sub}</div>` : ''}
        </div>
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:var(--accent);flex-shrink:0">${r.value}</div>
    </div>`).join('');

  const top5Rows = top5.map((g,i) => `
    <tr style="border-bottom:1px solid var(--border);cursor:pointer" onclick="openMatch(${g.matchId})">
      <td style="padding:.5rem .6rem;font-weight:700;color:var(--muted)">${i+1}</td>
      <td style="padding:.5rem .6rem;font-weight:600">${g.player}</td>
      <td style="padding:.5rem .4rem;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;color:var(--accent)">${g.cs.toFixed(1)}</td>
      <td style="padding:.5rem .4rem;text-align:center"><span class="grade grade-${(g.grade||'B').replace('+','p').replace('-','m')}">${g.grade||'B'}</span></td>
      <td style="padding:.5rem .4rem;text-align:center;font-weight:700">${g.pts}</td>
      <td style="padding:.5rem .4rem;text-align:center">${g.reb}</td>
      <td style="padding:.5rem .4rem;text-align:center">${g.ast}</td>
      <td style="padding:.5rem .4rem;text-align:center">${g.stl}</td>
      <td style="padding:.5rem .4rem;text-align:center">${g.blk}</td>
      <td style="padding:.5rem .6rem;color:var(--muted);font-size:.78rem">${formatDate(g.date)} vs ${g.opp}</td>
    </tr>`).join('');

  document.getElementById('league-records-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px;margin-bottom:1.25rem">🏆 REKORDY LIGI</div>
    <div style="display:flex;gap:.35rem;border-bottom:1px solid var(--border);margin-bottom:1.25rem">
      <button onclick="document.getElementById('lr-tab-records').style.display='block';document.getElementById('lr-tab-top5').style.display='none';this.style.borderBottomColor='var(--accent)';this.style.color='var(--accent)';document.getElementById('lr-btn-top5').style.borderBottomColor='transparent';document.getElementById('lr-btn-top5').style.color='var(--muted)'" id="lr-btn-records" style="padding:.5rem 1rem;border:none;border-bottom:2px solid var(--accent);background:none;color:var(--accent);font-weight:700;cursor:pointer;font-family:inherit;font-size:.85rem">🏆 Rekordy</button>
      <button onclick="document.getElementById('lr-tab-top5').style.display='block';document.getElementById('lr-tab-records').style.display='none';this.style.borderBottomColor='var(--accent)';this.style.color='var(--accent)';document.getElementById('lr-btn-records').style.borderBottomColor='transparent';document.getElementById('lr-btn-records').style.color='var(--muted)'" id="lr-btn-top5" style="padding:.5rem 1rem;border:none;border-bottom:2px solid transparent;background:none;color:var(--muted);font-weight:400;cursor:pointer;font-family:inherit;font-size:.85rem">⭐ Top 10 występów</button>
    </div>
    <div id="lr-tab-records">
      <div style="display:flex;flex-direction:column;gap:.6rem">${recordCards}</div>
    </div>
    <div id="lr-tab-top5" style="display:none">
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.83rem;min-width:500px">
          <thead><tr style="background:var(--surface2)">
            <th style="padding:.5rem .6rem;text-align:left;color:var(--muted);font-size:.72rem">#</th>
            <th style="padding:.5rem .6rem;text-align:left;color:var(--muted);font-size:.72rem">GRACZ</th>
            <th style="padding:.5rem .4rem;color:var(--accent);font-size:.72rem;font-weight:800">CS</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">GRD</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">PTS</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">REB</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">AST</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">STL</th>
            <th style="padding:.5rem .4rem;color:var(--muted);font-size:.72rem">BLK</th>
            <th style="padding:.5rem .6rem;text-align:left;color:var(--muted);font-size:.72rem">MECZ</th>
          </tr></thead>
          <tbody>${top5Rows}</tbody>
        </table>
      </div>
    </div>`;
  document.getElementById('league-records-modal').classList.add('open');
}
// ═══════════════════════════════════════════════════════════════
// NAJLEPSZE MECZE GRACZA (top 5 CS)
// ═══════════════════════════════════════════════════════════════
function renderTopGamesSection(games, playerName, teamName, containerId) {
  const withCS = games.map(g => ({
    ...g,
    cs: calcCompositeScore({ gp:1, pts:g.pts, reb:g.reb, ast:g.ast, stl:g.stl, blk:g.blk, to:g.to, fgm:g.fgm||0, fga:g.fga||0, gradeSum:gradeToNum(g.grade||'B') })
  })).sort((a,b) => b.cs - a.cs).slice(0,5);

  const el = document.getElementById(containerId);
  if(!el) return;
  if(!withCS.length) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem">⭐ TOP 5 WYSTĘPÓW</div>
    ${withCS.map((g,i) => `
      <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem .6rem;background:var(--surface2);border-radius:8px;margin-bottom:.35rem;border:1px solid ${i===0?'rgba(245,197,24,.35)':'var(--border)'}">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;color:var(--muted);width:1.2rem">${i+1}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent);width:3rem">${g.cs.toFixed(1)}</div>
        <span class="grade grade-${(g.grade||'B').replace('+','p').replace('-','m')}" style="flex-shrink:0">${g.grade||'B'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.88rem">${g.pts} PTS · ${g.reb} REB · ${g.ast} AST · ${g.stl} STL</div>
          <div style="font-size:.75rem;color:var(--muted)">vs ${g.opp} · ${formatDate(g.date)}</div>
        </div>
      </div>`).join('')}`;
}
// ═══════════════════════════════════════════════════════════════
// PORÓWNANIE SEZONÓW GRACZA
// ═══════════════════════════════════════════════════════════════
function renderSeasonComparisonSection(playerName, teamName, containerId) {
  const el = document.getElementById(containerId);
  if(!el) return;
  if(seasons.length < 2) { el.innerHTML = ''; return; }

  const seasonStats = seasons.map(s => {
    const sm = matches.filter(m => m.seasonId === s.id);
    const playerMap = {};
    sm.forEach(m => {
      [m.team1, m.team2].forEach(team => {
        if(team.name !== teamName) return;
        const p = (team.players||[]).find(x => x.name === playerName);
        if(!p) return;
        if(!playerMap['p']) playerMap['p'] = {gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,gradeSum:0};
        const s2 = playerMap['p'];
        s2.gp++; s2.pts+=p.pts||0; s2.reb+=p.reb||0; s2.ast+=p.ast||0;
        s2.stl+=p.stl||0; s2.blk+=p.blk||0; s2.to+=p.to||0;
        s2.fgm+=p.fgm||0; s2.fga+=p.fga||0; s2.gradeSum+=gradeToNum(p.grade||'B');
      });
    });
    const stats = playerMap['p'];
    if(!stats || stats.gp === 0) return null;
    const cs = calcCompositeScore(stats);
    const gr = numToGrade(stats.gradeSum/stats.gp);
    return { season: s.name, ...stats, cs, gr,
      ppg: (stats.pts/stats.gp).toFixed(1), rpg: (stats.reb/stats.gp).toFixed(1),
      apg: (stats.ast/stats.gp).toFixed(1), spg: (stats.stl/stats.gp).toFixed(1),
      fgPct: stats.fga>0?Math.round(stats.fgm/stats.fga*100):0 };
  }).filter(Boolean);

  if(seasonStats.length < 2) { el.innerHTML = ''; return; }

  const rows = seasonStats.map(s => {
    const trend = seasonStats.indexOf(s) > 0 ? (s.cs > seasonStats[seasonStats.indexOf(s)-1].cs ? '↑' : s.cs < seasonStats[seasonStats.indexOf(s)-1].cs ? '↓' : '→') : '';
    const trendColor = trend==='↑'?'var(--win)':trend==='↓'?'var(--loss)':'var(--muted)';
    return `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:.5rem .6rem;font-weight:600">${s.season}</td>
      <td style="padding:.5rem .4rem;text-align:center">${s.gp}</td>
      <td style="padding:.5rem .4rem;text-align:center"><span class="grade grade-${s.gr.replace('+','p').replace('-','m')}">${s.gr}</span></td>
      <td style="padding:.5rem .4rem;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;color:var(--accent)">${s.cs.toFixed(1)} <span style="font-size:.8rem;color:${trendColor}">${trend}</span></td>
      <td style="padding:.5rem .4rem;text-align:center;font-weight:700">${s.ppg}</td>
      <td style="padding:.5rem .4rem;text-align:center">${s.rpg}</td>
      <td style="padding:.5rem .4rem;text-align:center">${s.apg}</td>
      <td style="padding:.5rem .4rem;text-align:center">${s.spg}</td>
      <td style="padding:.5rem .4rem;text-align:center">${s.fgPct}%</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem">📈 PORÓWNANIE SEZONÓW</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:.82rem;min-width:420px">
        <thead><tr style="background:var(--surface2)">
          <th style="text-align:left;padding:.4rem .6rem;color:var(--muted);font-size:.72rem">SEZON</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">GP</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">GRD</th>
          <th style="padding:.4rem .4rem;color:var(--accent);font-size:.72rem;font-weight:800">CS</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">PTS</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">REB</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">AST</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">STL</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">FG%</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
// ═══════════════════════════════════════════════════════════════
// HISTORIA EVENTÓW / ARCHIWUM
// ═══════════════════════════════════════════════════════════════
function openEventArchiveModal() {
  const finished = (events||[]).filter(e => e.status === 'finished' || e.status === 'active');
  const content = document.getElementById('event-archive-content');

  if(!finished.length) {
    content.innerHTML = `
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px;margin-bottom:1.25rem">📚 ARCHIWUM EVENTÓW</div>
      <div class="empty"><div class="icon">📚</div><p>Brak zakończonych eventów</p></div>`;
    document.getElementById('event-archive-modal').classList.add('open');
    return;
  }

  const cards = finished.sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0)).map(ev => {
    const type = EVENT_TYPES[ev.type]||{label:ev.type};
    const status = EVENT_STATUS[ev.status]||{label:ev.status,color:'var(--muted)'};
    const matchCount = (ev.matches||[]).length;
    const mvp = getEventMVP(ev);
    return `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.75rem;cursor:pointer;transition:border-color .2s"
        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'"
        onclick="document.getElementById('event-archive-modal').classList.remove('open');setTimeout(()=>openEventDetail('${ev.id}'),200)">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap">
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem;letter-spacing:1px">${ev.title}</div>
            <div style="font-size:.82rem;color:var(--muted);margin-top:.2rem">${type.label} · ${ev.date||'Data TBD'} · ${matchCount} meczów</div>
            ${mvp ? `<div style="font-size:.8rem;margin-top:.35rem">🏆 MVP: <strong>${mvp.name}</strong> <span style="color:var(--muted)">${mvp.cs.toFixed(1)} CS</span></div>` : ''}
          </div>
          <span style="font-weight:700;font-size:.82rem;color:${status.color};flex-shrink:0">${status.label}</span>
        </div>
        ${(ev.teams||[]).length ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem">${(ev.teams||[]).map(t=>`<span style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:.1rem .5rem;font-size:.75rem">${t.name}</span>`).join('')}</div>` : ''}
      </div>`;
  }).join('');

  content.innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px;margin-bottom:1.25rem">📚 ARCHIWUM EVENTÓW <span style="font-size:1rem;font-weight:400;color:var(--muted)">${finished.length} eventów</span></div>
    ${cards}`;
  document.getElementById('event-archive-modal').classList.add('open');
}
// ═══════════════════════════════════════════════════════════════
// BRACKET / DRABINKA TURNIEJOWA
// ═══════════════════════════════════════════════════════════════
function initEventBracket(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const teams = ev.teams || [];
  if(teams.length < 2) { showToast('Potrzeba min. 2 drużyn do drabinki', 'info'); return; }

  // Build bracket: find next power of 2
  const n = teams.length;
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const slots = [...teams.map(t => t.name)];
  while(slots.length < size) slots.push(null); // byes

  // Shuffle slots for seeding
  const seeded = [...slots].sort(() => Math.random() - 0.5);

  // Build rounds structure
  const rounds = [];
  let current = seeded;
  while(current.length > 1) {
    const round = [];
    for(let i = 0; i < current.length; i += 2) {
      round.push({ team1: current[i], team2: current[i+1]||null, score1: null, score2: null, winner: null });
    }
    rounds.push(round);
    current = round.map(m => m.winner || null);
  }

  ev.bracket = { rounds, champion: null };
  saveData().then(() => {
    openEventDetail(eventId, 'bracket');
    showToast('✅ Drabinka utworzona!', 'success');
  });
}
async function saveBracketMatch(eventId, roundIdx, matchIdx) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !ev.bracket) return;
  const match = ev.bracket.rounds[roundIdx][matchIdx];
  const s1 = parseInt(document.getElementById('bs1-' + roundIdx + '-' + matchIdx)?.value);
  const s2 = parseInt(document.getElementById('bs2-' + roundIdx + '-' + matchIdx)?.value);
  if(isNaN(s1) || isNaN(s2)) { showToast('❌ Wpisz oba wyniki', 'error'); return; }
  if(s1 === s2) { showToast('❌ Remis niedozwolony w drabince', 'error'); return; }

  match.score1 = s1; match.score2 = s2;
  match.winner = s1 > s2 ? match.team1 : match.team2;

  // Propagate winner to next round
  const nextRound = ev.bracket.rounds[roundIdx + 1];
  if(nextRound) {
    const nextMatchIdx = Math.floor(matchIdx / 2);
    const isFirst = matchIdx % 2 === 0;
    if(!nextRound[nextMatchIdx]) nextRound[nextMatchIdx] = { team1: null, team2: null, score1: null, score2: null, winner: null };
    if(isFirst) nextRound[nextMatchIdx].team1 = match.winner;
    else nextRound[nextMatchIdx].team2 = match.winner;
  } else {
    // Final round — set champion
    ev.bracket.champion = match.winner;
    ev.status = 'finished';
    sendEventWebhook('🏆 Turniej zakończony!', '**' + ev.title + '**\nMistrz: **' + match.winner + '**', 0xf5c518);
  }

  await saveData();
  renderEventDetailTab(eventId, 'bracket');
  showToast('✅ Wynik zapisany!', 'success');
}
async function addEventPhase(eventId, name) {
  if(!name || !name.trim()) { showToast('❌ Wpisz nazwę fazy', 'error'); return; }
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  if(!ev.phases) ev.phases = [];
  ev.phases.push({ name: name.trim() });
  if(ev.currentPhase === undefined) ev.currentPhase = 0;
  await saveData();
  renderEventDetailTab(eventId, 'phases');
  showToast('✅ Faza dodana', 'success');
}
async function setCurrentPhase(eventId, phaseIdx) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  ev.currentPhase = phaseIdx;
  await saveData();
  renderEventDetailTab(eventId, 'phases');
}
async function callGemini(model, max_tokens, messages) {
  if(!workerUrl) throw new Error('Brak Worker URL — skonfiguruj w ⚙ Baza');
  const adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
  const res = await fetch(workerUrl.replace(/\/$/, '') + '/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
    body: JSON.stringify({ model, max_tokens, messages })
  });
  if(!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error('Gemini error ' + res.status + ': ' + (err.error || 'Unknown'));
  }
  return await res.json();
}
async function callAI(model, max_tokens, messages) {
  if(model && model.includes('gemini')) {
    return callGemini(model, max_tokens, messages);
  }
  return callAnthropic(model, max_tokens, messages);
}
function robustJsonParse(str) {
  try { return JSON.parse(str); } catch(e) {}
  let s = str.replace(/,(\s*[}\]])/g, '$1');
  try { return JSON.parse(s); } catch(e) {}
  s = s.replace(/}(\s*{)/g, '},$1').replace(/](\s*\[)/g, '],$1');
  try { return JSON.parse(s); } catch(e) {}
  for(let i = s.length - 1; i >= 0; i--) {
    if(s[i] === '}') {
      try { return JSON.parse(s.slice(0, i + 1)); } catch(e) { continue; }
    }
  }
  throw new SyntaxError('Cannot parse JSON from AI response');
}
async function renameTeam(oldName, newName) {
  newName = newName.trim();
  if(!newName || newName === oldName) return;
  if(teams[oldName]) { teams[newName] = teams[oldName]; delete teams[oldName]; }
  matches.forEach(m => {
    if(m.team1.name === oldName) m.team1.name = newName;
    if(m.team2.name === oldName) m.team2.name = newName;
  });
  schedule.forEach(s => {
    if(s.team1 === oldName) s.team1 = newName;
    if(s.team2 === oldName) s.team2 = newName;
  });
  Object.keys(aliases).forEach(k => { if(aliases[k] === oldName) aliases[k] = newName; });
  window.teams = teams;
  await saveData();
  renderTeamsList();
  renderMatches();
  renderStats();
  showToast('✅ Zmieniono nazwę: ' + oldName + ' → ' + newName, 'success');
}
function updateModelRadioStyles() {
  const m = document.querySelector('input[name="ai-model"]:checked')?.value || aiModel;
  ['gemini','sonnet','haiku'].forEach(function(id) {
    const lbl = document.getElementById('model-'+id+'-lbl');
    const isActive = (id==='gemini' && m.includes('gemini')) ||
                     (id==='sonnet' && m.includes('sonnet')) ||
                     (id==='haiku' && m.includes('haiku'));
    if(lbl) {
      lbl.style.border = isActive ? '2px solid var(--accent)' : '1px solid var(--border)';
      lbl.style.background = isActive ? 'rgba(245,197,24,.06)' : 'transparent';
    }
  });
}
