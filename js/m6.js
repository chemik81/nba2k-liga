/*@v:739204317b*/
// ═══ 🪪 KARTA ZAWODNIKA ══════════════════════════════════════════
async function _shareCardCanvas(name) {
  const ed = _currentEdition();
  const ms = _editionMatches(ed);
  let gp = 0, team = {}, t = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fgm: 0, fga: 0, tpm: 0 }, best = null;
  ms.forEach(m => [m.team1, m.team2].forEach(tm => (tm.players || []).forEach(p => {
    if(p.name !== name) return;
    gp++; team[tm.name] = (team[tm.name] || 0) + 1;
    Object.keys(t).forEach(k => t[k] += p[k] || 0);
    if(!best || (p.pts || 0) > best.pts) best = { pts: p.pts || 0, reb: p.reb || 0, ast: p.ast || 0, opp: tm === m.team1 ? m.team2.name : m.team1.name, date: m.date };
  })));
  if(!gp) return null;
  const mainTeam = Object.entries(team).sort((a, b) => b[1] - a[1])[0][0];
  // miejsce w lidze (PPG, min. 2 mecze)
  const agg = {};
  ms.forEach(m => [m.team1, m.team2].forEach(tm => (tm.players || []).forEach(p => { const a = agg[p.name] = agg[p.name] || { pts: 0, gp: 0 }; a.pts += p.pts || 0; a.gp++; })));
  const ranked = Object.entries(agg).filter(([, a]) => a.gp >= 2).sort((a, b) => b[1].pts / b[1].gp - a[1].pts / a[1].gp);
  const rank = ranked.findIndex(([n]) => n === name) + 1;
  const ach = _achievements(ed).filter(e => e.player === name);
  const achGroups = {}; ach.forEach(e => { achGroups[e.name] = achGroups[e.name] || { icon: e.icon, n: 0 }; achGroups[e.name].n++; });
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), font = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0d0f14'); bg.addColorStop(1, '#1d1230');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#8b0000'; g.fillRect(0, 0, W, 12); g.fillStyle = '#f5c518'; g.fillRect(0, 12, W, 4);
  g.textAlign = 'center';
  g.fillStyle = '#f5c518'; g.font = `900 34px ${font}`; g.fillText('2K PRO-AM EKSTRAKLASA · KARTA ZAWODNIKA', W / 2, 80);
  g.fillStyle = '#8b90a0'; g.font = `700 28px ${font}`; g.fillText((ed || '').toUpperCase(), W / 2, 120);
  // logo drużyny
  const R = 120, cy = 300;
  g.save(); g.beginPath(); g.arc(W / 2, cy, R, 0, Math.PI * 2); g.closePath(); g.fillStyle = typeof teamColor === 'function' ? teamColor(mainTeam) : '#333'; g.fill();
  const img = await _ssLoadImg(_ssLogoSrc(mainTeam));
  try { if(img) { g.clip(); const sc = Math.max(R * 2 / img.width, R * 2 / img.height); g.drawImage(img, W / 2 - img.width * sc / 2, cy - img.height * sc / 2, img.width * sc, img.height * sc); }
        else { g.fillStyle = '#fff'; g.font = `900 90px ${font}`; g.textBaseline = 'middle'; g.fillText(typeof teamInitials === 'function' ? teamInitials(mainTeam) : mainTeam.slice(0, 2), W / 2, cy + 4); } } catch(e) {}
  g.restore(); g.textBaseline = 'alphabetic';
  g.lineWidth = 7; g.strokeStyle = '#f5c518'; g.beginPath(); g.arc(W / 2, cy, R, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#fff'; g.font = `900 92px ${font}`;
  let nm = name; while(g.measureText(nm).width > 940 && nm.length > 3) nm = nm.slice(0, -2) + '…';
  g.fillText(nm, W / 2, 530);
  g.fillStyle = '#c9cdd8'; g.font = `700 36px ${font}`; g.fillText(mainTeam + (rank ? `  ·  #${rank} w lidze (PPG)` : ''), W / 2, 585);
  // statystyki
  const cells = [['PTS', t.pts / gp], ['REB', t.reb / gp], ['AST', t.ast / gp], ['STL', t.stl / gp], ['BLK', t.blk / gp], ['FG%', t.fga ? t.fgm / t.fga * 100 : 0]];
  cells.forEach(([lab, v], i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 210 + col * 330, y = 700 + row * 190;
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x - 145, y - 95, 290, 165);
    g.fillStyle = '#f5c518'; g.font = `900 84px ${font}`; g.fillText(lab === 'FG%' ? Math.round(v) + '%' : v.toFixed(1), x, y + 10);
    g.fillStyle = '#8b90a0'; g.font = `800 28px ${font}`; g.fillText(lab, x, y + 52);
  });
  g.fillStyle = '#c9cdd8'; g.font = `700 30px ${font}`; g.fillText(`${gp} ${_plPL(gp, 'mecz', 'mecze', 'meczów')}${t.tpm ? ` · ${t.tpm} ${_plPL(t.tpm, 'trójka', 'trójki', 'trójek')}` : ''}`, W / 2, 1035);
  if(best) { g.fillStyle = '#8b90a0'; g.font = `700 28px ${font}`; g.fillText(`Najlepszy mecz: ${best.pts} PTS · ${best.reb} REB · ${best.ast} AST vs ${best.opp}`, W / 2, 1085); }
  const chips = Object.entries(achGroups).slice(0, 4).map(([n, x]) => `${x.icon} ${n.split(' (')[0]}${x.n > 1 ? ' ×' + x.n : ''}`);
  if(chips.length) { g.fillStyle = '#a78bfa'; g.font = `800 30px ${font}`; g.fillText(chips.slice(0, 2).join('    '), W / 2, 1170); if(chips.length > 2) g.fillText(chips.slice(2).join('    '), W / 2, 1215); }
  g.fillStyle = '#5a6070'; g.font = `600 24px ${font}`; g.fillText((location.host || 'chemik81.github.io') + location.pathname.replace(/index\.html$/, ''), W / 2, H - 30);
  try { return c.toDataURL('image/png'); } catch(e) { return null; }
}
async function openShareCard(name) {
  const m = _fxModal('sharecard-modal', 560);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('sharecard-modal', '🪪 Karta zawodnika') + '<div style="color:var(--muted)">⏳ Rysuję…</div>';
  m.classList.add('open');
  try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
  const url = await _shareCardCanvas(name);
  if(!url) { box.innerHTML = _fxHead('sharecard-modal', '🪪 Karta zawodnika') + `<div style="color:var(--muted)">Brak meczów gracza ${_h(name)} w tej edycji.</div>`; return; }
  window._posterData = { url, m: null };
  box.innerHTML = _fxHead('sharecard-modal', '🪪 Karta zawodnika') + `
    <img src="${url}" alt="" style="width:100%;border-radius:10px;border:1px solid var(--border);margin-bottom:.8rem">
    <div style="display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">
      <a href="${url}" download="karta-${String(name).replace(/[^\w.-]+/g, '_')}.png" class="btn btn-primary" style="text-decoration:none">⬇ Pobierz PNG</a>
      ${navigator.clipboard && window.ClipboardItem ? `<button class="btn btn-ghost" onclick="_copyPoster()">📋 Kopiuj</button>` : ''}
    </div>`;
}
function openEuTeamEdit(id) {
  const r = teamRegistrations.find(x => x.id === id); if(!r || !_ensureSession()) return;
  _euEd = { id, xHandle: r.xHandle || '', rows: (r.players || []).map(p => ({ orig: p.gamertag, gamertag: p.gamertag, platform: p.platform || 'psn', x: p.x || '', experience: p.experience || '' })) };
  _euEdDraw();
}
function _euEdDraw() {
  const r = teamRegistrations.find(x => x.id === _euEd.id), m = _fxModal('euedit-modal', 700); m.classList.add('open');
  const sel = 'padding:.35rem .4rem;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:inherit;font-size:.8rem';
  m.querySelector('.modal').innerHTML = _fxHead('euedit-modal', `✏️ Edit team — ${_h(r.teamName)}`) + `<div data-notr>
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.9rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .7rem">
      <div style="width:56px;height:56px;border-radius:10px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--surface)">${teamLogo(r.teamName, 56, '1rem')}</div>
      <div style="flex:1"><div style="font-weight:700;font-size:.85rem">Team logo</div><div style="font-size:.72rem;color:var(--muted)">PNG, JPG, WEBP or GIF — square works best.</div></div>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="changeTeamLogo('${r.id}')">🖼 ${r.logo ? 'Change logo' : 'Add logo'}</button></div>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">You can edit your roster until registration closes: fix gamertags, change platforms, swap or add players (min. 5, max. 15). Fixed gamertags keep the player’s linked account.</div>
    <div class="eued-row eued-head"><span>Gamertag</span><span>Platform</span><span>X profile (optional)</span><span></span></div>
    ${_euEd.rows.map((p, i) => `<div class="eued-row${_euEd.bad?.includes(i) ? ' bad' : ''}">
      <input class="gt" id="eued-gt-${i}" value="${_h(p.gamertag)}" maxlength="32" oninput="_euEd.rows[${i}].gamertag=this.value;this.closest('.eued-row').classList.remove('bad')" placeholder="Player ${i + 1} — gamertag" style="${_MODAL_INP};margin:0;padding:.45rem .6rem;font-size:.9rem">
      <select class="pf" onchange="_euEd.rows[${i}].platform=this.value" style="${sel}"><option value="psn" ${p.platform !== 'xbox' ? 'selected' : ''}>PlayStation</option><option value="xbox" ${p.platform === 'xbox' ? 'selected' : ''}>Xbox</option></select>
      <input class="xh" value="${_h(p.x)}" maxlength="40" oninput="_euEd.rows[${i}].x=this.value" placeholder="X @handle (optional)" style="${_MODAL_INP};margin:0;padding:.35rem .55rem">
      <button class="btn btn-ghost rm" title="Remove player" style="padding:0;color:var(--loss)" onclick="_euEd.rows.splice(${i},1);_euEd.bad=null;_euEdDraw()">✕</button></div>`).join('')}
    <div style="font-size:.72rem;color:var(--muted);margin:.15rem 0 .2rem">${_euEd.rows.filter(p => String(p.gamertag || '').trim()).length} / 15 players</div>
    ${_euEd.rows.length < 15 ? `<button class="btn btn-ghost" style="font-size:.78rem;margin:.2rem 0 .7rem" onclick="_euEd.rows.push({gamertag:'',platform:'psn',x:''});_euEd.bad=null;_euEdDraw();setTimeout(()=>document.getElementById('eued-gt-'+(_euEd.rows.length-1))?.focus(),30)">➕ Add player</button>` : `<div style="font-size:.74rem;color:var(--muted);margin:.2rem 0 .7rem">Maximum 15 players reached.</div>`}
    <label style="${_MODAL_LBL}">Team X profile (optional)</label>
    <input value="${_h(_euEd.xHandle)}" maxlength="40" oninput="_euEd.xHandle=this.value" placeholder="@yourteam" style="${_MODAL_INP};margin-bottom:.9rem">
    <div id="euedit-status" style="font-size:.78rem;min-height:1.1em;margin-bottom:.4rem"></div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('euedit-modal')">Cancel</button><button class="btn btn-primary" onclick="saveEuTeamEdit()">💾 Save team</button></div></div>`;
}
async function saveEuTeamEdit() {
  const empty = _euEd.rows.map((p, i) => String(p.gamertag || '').trim() ? -1 : i).filter(i => i >= 0), st = document.getElementById('euedit-status');
  if(empty.length) { _euEd.bad = empty; _euEdDraw(); const s2 = document.getElementById('euedit-status'); s2.style.color = 'var(--loss)'; s2.textContent = `❌ Enter a gamertag for player ${empty.map(i => i + 1).join(', ')} — or remove the empty row (✕)`; document.getElementById('eued-gt-' + empty[0])?.focus(); return; }
  const rows = _euEd.rows.map(p => ({ ...p, gamertag: String(p.gamertag || '').trim() })).filter(p => p.gamertag);
  if(rows.length < 5) { st.style.color = 'var(--loss)'; st.textContent = 'Minimum 5 players'; return; }
  const renames = rows.filter(p => p.orig && p.orig !== p.gamertag).map(p => ({ from: p.orig, to: p.gamertag }));
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Saving…';
  const r = await _api('/team-registration/edit', 'POST', { id: _euEd.id, players: rows.map(({ orig, ...p }) => p), renames, xHandle: _euEd.xHandle }, { session: true });
  if(!r.ok) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + (r.error || 'Error'); return; }
  const i = teamRegistrations.findIndex(x => x.id === _euEd.id); if(i >= 0) teamRegistrations[i] = { ...teamRegistrations[i], ...r.registration };
  _fxClose('euedit-modal'); showToast('✅ Team saved', 'success'); try { renderDashboard(); } catch(e) {} try { renderTeamRegistrations(); } catch(e) {}
}
function openRosterChange(regId) {
  const r = teamRegistrations.find(x => x.id === regId);
  if(!r || !_ensureSession()) return;
  if(EU_MODE && !registrationsClosed && String(r.captain?.id) === String(discordUser?.id)) return openEuTeamEdit(regId); // EU, zapisy otwarte: kapitan edytuje bezpośrednio
  const m = _fxModal('roster-modal', 560);
  m.querySelector('.modal').innerHTML = _fxHead('roster-modal', `✏️ ${_g('Zmiana składu', 'Roster change')} — ${_h(r.teamName)}`) + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">${_g('Popraw literówki w nickach, zaznacz graczy do usunięcia i dopisz nowych. Zmiany zatwierdza admin. Poprawki nicków nie tworzą transferów — połączone konta graczy przepną się na poprawiony nick.', 'Fix typos in gamertags, tick players to remove and add new ones. An admin approves the changes. Gamertag fixes are not transfers — linked player accounts follow the corrected gamertag.')}${rosterLockDate ? _g(` Okno transferowe (dopisywanie / usuwanie) do <b>${_ssFmt(rosterLockDate)}</b>.`, ` Transfer window (adding / removing) until <b>${_ssFmt(rosterLockDate)}</b>.`) : ''}</div>
    <label style="${_MODAL_LBL}">${_g('Obecny skład', 'Current roster')}</label>
    <div style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:.8rem">
      ${(r.players || []).map(p => `<div style="display:grid;grid-template-columns:1fr auto;gap:.4rem;align-items:center">
        <input class="ro-nick" data-orig="${_h(p.gamertag)}" value="${_h(p.gamertag)}" maxlength="32" style="${_MODAL_INP};padding:.35rem .55rem">
        <label style="font-size:.74rem;white-space:nowrap;cursor:pointer;color:var(--loss)"><input type="checkbox" class="ro-rm" value="${_h(p.gamertag)}" style="accent-color:var(--loss)"> ${_g('usuń', 'remove')}</label>
      </div>`).join('')}
    </div>
    <label style="${_MODAL_LBL}">${_g('Nowi gracze (jeden nick w linii)', 'New players (one gamertag per line)')}</label>
    <textarea id="ro-add" rows="3" placeholder="Nick1&#10;Nick2" style="${_MODAL_INP};margin-bottom:.6rem"></textarea>
    <input id="ro-note" maxlength="200" placeholder="${_g('Notka dla admina (opcjonalnie)', 'Note for the admin (optional)')}" style="${_MODAL_INP};margin-bottom:.9rem">
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('roster-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" onclick="sendRosterChange('${regId}')">📤 ${_g('Wyślij do admina', 'Send to the admin')}</button></div>`;
  m.classList.add('open');
}
async function sendRosterChange(regId) {
  const remove = [...document.querySelectorAll('#roster-modal .ro-rm:checked')].map(x => x.value);
  const rename = [...document.querySelectorAll('#roster-modal .ro-nick')].map(x => ({ from: x.dataset.orig, to: x.value.trim() }))
    .filter(x => x.to && x.to !== x.from && !remove.includes(x.from));
  if([...document.querySelectorAll('#roster-modal .ro-nick')].some(x => !x.value.trim() && !remove.includes(x.dataset.orig))) { showToast(_g('Nick nie może być pusty — zaznacz „usuń”, jeśli gracz odchodzi', 'A gamertag can’t be empty — tick “remove” if the player is leaving'), 'info'); return; }
  const add = document.getElementById('ro-add').value.split('\n').map(x => x.trim()).filter(Boolean).map(g => ({ gamertag: g }));
  const res = await _api('/roster-change', 'POST', { regId, add, remove, rename, note: document.getElementById('ro-note').value.trim() }, { session: true });
  if(!res.ok) { showToast('❌ ' + _tr(res.error || ''), 'error'); return; }
  const i = teamRegistrations.findIndex(x => x.id === regId); if(i >= 0) teamRegistrations[i] = res.registration;
  _fxClose('roster-modal'); renderTeamRegistrations();
  showToast(_g('📤 Wysłano — czeka na admina', '📤 Sent — waiting for an admin'), 'success');
}
// ── admin: bezpośrednia edycja składu ──
function openRosterEditor(regId) {
  const r = teamRegistrations.find(x => x.id === regId);
  if(!r) return;
  window._rosterEd = { regId, rows: (r.players || []).map(p => ({ orig: p.gamertag, gamertag: p.gamertag, platform: p.platform || 'psn', experience: p.experience || '' })) };
  _renderRosterEditor();
  _fxModal('roster-ed-modal', 640).classList.add('open');
}
function _renderRosterEditor() {
  const ed = window._rosterEd, r = teamRegistrations.find(x => x.id === ed.regId);
  const box = _fxModal('roster-ed-modal', 640).querySelector('.modal');
  const sel = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem;font-family:inherit;font-size:.78rem';
  box.innerHTML = _fxHead('roster-ed-modal', `✏️ Edycja składu — ${_h(r.teamName)}`) + `
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.7rem">Edycja admina zapisuje się od razu (bez prośby i bez wpisów w Transferach). Zmiana nicku przepina połączone konto gracza na nowy nick. Każda zmiana trafia do 📝 Dziennika zmian.</div>
    <div style="display:flex;flex-direction:column;gap:.35rem;margin-bottom:.7rem">
      ${ed.rows.map((p, i) => `<div style="display:grid;grid-template-columns:1fr 80px 150px 32px;gap:.35rem;align-items:center">
        <input value="${_h(p.gamertag)}" maxlength="32" oninput="_rosterEd.rows[${i}].gamertag=this.value" style="${_MODAL_INP};padding:.35rem .55rem;${p.orig && p.orig !== p.gamertag ? 'border-color:var(--accent)' : ''}" placeholder="nick">
        <select onchange="_rosterEd.rows[${i}].platform=this.value" style="${sel}"><option value="psn" ${p.platform !== 'xbox' ? 'selected' : ''}>PSN</option><option value="xbox" ${p.platform === 'xbox' ? 'selected' : ''}>Xbox</option></select>
        <select onchange="_rosterEd.rows[${i}].experience=this.value" style="${sel}"><option value="">— poziom —</option>${Object.entries(_expLabels).map(([k, v]) => `<option value="${k}" ${p.experience === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn btn-ghost" title="Usuń z składu" style="padding:.2rem" onclick="_rosterEd.rows.splice(${i},1);_renderRosterEditor()">🗑</button>
      </div>${p.orig && p.orig !== p.gamertag.trim() && p.gamertag.trim() ? `<div style="font-size:.66rem;color:var(--accent);margin:-.15rem 0 .1rem">✏️ ${_h(p.orig)} → ${_h(p.gamertag.trim())}</div>` : ''}`).join('')}
    </div>
    <button class="btn btn-ghost" style="font-size:.76rem;margin-bottom:1rem" onclick="_rosterEd.rows.push({orig:'',gamertag:'',platform:'psn',experience:''});_renderRosterEditor()">➕ Dodaj gracza</button>
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('roster-ed-modal')">Anuluj</button><button class="btn btn-primary" onclick="saveRosterEditor()">💾 Zapisz skład</button></div>`;
}
async function saveRosterEditor() {
  const ed = window._rosterEd;
  const rows = ed.rows.map(p => ({ ...p, gamertag: p.gamertag.trim() })).filter(p => p.gamertag);
  if(!rows.length) { showToast('Skład nie może być pusty', 'info'); return; }
  const low = rows.map(p => p.gamertag.toLowerCase());
  if(new Set(low).size !== low.length) { showToast('Nicki w składzie się powtarzają', 'info'); return; }
  const renames = rows.filter(p => p.orig && p.orig !== p.gamertag).map(p => ({ from: p.orig, to: p.gamertag }));
  const res = await _api('/team-registration', 'PATCH', { id: ed.regId, players: rows.map(({ gamertag, platform, experience }) => ({ gamertag, platform, experience })), renames }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const i = teamRegistrations.findIndex(x => x.id === ed.regId); if(i >= 0) teamRegistrations[i] = res.registration;
  // przepnij lokalnie połączone konta
  playersList.forEach(p => { const x = renames.find(y => y.from.toLowerCase() === String(p.gamertag || '').toLowerCase() && String(p.team).toLowerCase() === res.registration.teamName.toLowerCase()); if(x) p.gamertag = x.to; });
  _fxClose('roster-ed-modal'); renderTeamRegistrations();
  showToast('✅ Skład zapisany', 'success');
}
async function decideRoster(regId, reqId, approve) {
  if(!confirm(approve ? 'Zatwierdzić zmianę składu? Utworzy wpisy w Transferach.' : 'Odrzucić zmianę składu?')) return;
  const res = await _api('/roster-change', 'PATCH', { regId, reqId, approve }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const i = teamRegistrations.findIndex(x => x.id === regId); if(i >= 0) teamRegistrations[i] = res.registration;
  if(approve) { await loadData(); renderDashboard(); } else renderTeamRegistrations();
  showToast(approve ? '✅ Skład zaktualizowany' : 'Odrzucono', 'success');
}
async function saveRosterLock() {
  const v = document.getElementById('roster-lock')?.value || null;
  const prev = rosterLockDate; rosterLockDate = v;
  if(!(await saveData())) { rosterLockDate = prev; return; }
  _audit('Okno transferowe', v ? 'do ' + v : 'bez limitu');
  showToast('✅ Zapisano okno transferowe', 'success'); renderTeamRegistrations();
}
async function setPlayoffSpots(n) {
  const season = seasons.find(x => x.id === currentSeasonId);
  if(!season?.fixture) return;
  const prev = season.fixture.playoffSpots;
  season.fixture.playoffSpots = n;
  if(!(await saveData())) { season.fixture.playoffSpots = prev; return; }
  _audit('Miejsca w playoff', String(n));
  renderScenarios();
  try { renderClassics(); } catch(e) {}
}
function openGalaCreate() {
  const { cats, team5, ed } = _galaCandidates();
  window._awardDraft = { seasonId: currentSeasonId || null, week: null, cats, type: 'season', title: `Gala sezonu — ${_seasonName(currentSeasonId) || ed || ''}`.trim() };
  const m = _fxModal('awards-create-modal', 640);
  m.querySelector('.modal').innerHTML = _fxHead('awards-create-modal', '🏆 Gala sezonu') + (cats.length ? `
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.8rem">Kandydaci ze statystyk całego sezonu (min. ${Math.max(2, Math.round(Math.max(0, ..._galaStats(ed).map(x => x.gp)) * 0.4))} meczów). Głosują wszyscy zalogowani, <b>głos kapitana liczy się podwójnie</b>.</div>
    ${cats.map((c, i) => `<label style="display:block;border:1px solid var(--border);border-radius:10px;padding:.6rem .8rem;margin-bottom:.5rem;cursor:pointer">
      <div style="display:flex;align-items:center;gap:.5rem;font-weight:800;margin-bottom:.3rem"><input type="checkbox" data-cat="${i}" checked style="accent-color:var(--accent)"> ${c.emoji} ${_h(c.title)}</div>
      ${c.candidates.map(x => `<div style="font-size:.78rem;margin-left:1.5rem"><b>${_h(x.label)}</b> <span style="color:var(--muted)">${_h(x.sub)}</span></div>`).join('')}
    </label>`).join('')}
    ${team5.length ? `<div style="font-size:.78rem;margin:.6rem 0;padding:.5rem .7rem;background:var(--surface2);border-radius:8px">🏀 <b>Drużyna sezonu</b> (wybierana automatycznie, ogłoszona na gali): ${team5.map(x => _h(x.name)).join(', ')}</div>` : ''}
    <label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;margin:.8rem 0 1rem;cursor:pointer"><input type="checkbox" id="aw-announce" checked style="accent-color:var(--accent)"> Ogłoś start głosowania na Discordzie</label>
    <div style="display:flex;gap:.5rem;justify-content:flex-end"><button class="btn btn-ghost" onclick="_fxClose('awards-create-modal')">Anuluj</button><button class="btn btn-primary" onclick="createAwards()">🗳 Otwórz głosowanie</button></div>`
    : '<div style="color:var(--muted);text-align:center;padding:1.5rem">Za mało rozegranych meczów, żeby wybrać kandydatów.</div>');
  m.classList.add('open');
}
// ═══ ⚡ PAKIET TYGODNIA ══════════════════════════════════════════
async function runWeekPack() {
  const ctx = _ssCtx(), week = _ssWeek, sid = ctx.seasonId;
  if(!confirm(`Wykonać pakiet Week ${week}?\n\n• przypomnienia dla kapitanów\n• podsumowanie tygodnia → Discord\n• Power Ranking → Dashboard + Discord\n• głosowanie na nagrody tygodnia → Dashboard + Discord`)) return;
  const m = _fxModal('pack-modal', 480);
  const steps = [];
  const draw = () => { m.querySelector('.modal').innerHTML = _fxHead('pack-modal', `⚡ Pakiet Week ${week}`) + steps.map(s => `<div style="font-size:.86rem;padding:.3rem 0">${s}</div>`).join(''); };
  m.classList.add('open');
  const step = async (label, fn) => { steps.push('⏳ ' + label); draw(); try { const r = await fn(); steps[steps.length - 1] = (r === false ? '⚠️ ' : '✅ ') + label + (typeof r === 'string' ? ' — ' + r : ''); } catch(e) { steps[steps.length - 1] = '❌ ' + label + ' — ' + e.message; } draw(); };
  await step('Przypomnienia dla kapitanów', async () => { const r = await _api('/captain-remind', 'POST', { seasonId: sid, week }, { admin: true }); if(!r.ok) throw new Error(r.error); return r.captains ? `wysłano ${r.sent}` : 'wszyscy wybrali terminy'; });
  await step('Podsumowanie tygodnia', async () => { await openWeekSummary(); _fxClose('summary-modal'); if(!window._summaryEmbed) return false; return (await _scheduleDiscordSendR('weekSummary', { embeds: [JSON.parse(JSON.stringify(window._summaryEmbed))] })) ? 'wysłane' : false; });
  await step('Power Ranking', async () => { await openPowerRankingCreate(); if(!window._powerDraft) return false; const pr = document.getElementById('pr-send'); if(pr) pr.checked = true; await savePowerRanking(); return 'opublikowany'; });
  await step('Nagrody tygodnia', async () => { const cats = _awardCandidates(sid, week); if(!cats.length) return 'za mało meczów — pominięte'; window._awardDraft = { seasonId: sid, week, cats }; const m2 = _fxModal('awards-create-modal', 620); m2.querySelector('.modal').innerHTML = cats.map((c, i) => `<input type="checkbox" data-cat="${i}" checked><input type="checkbox" id="aw-announce" checked>`).join(''); await createAwards(); _fxClose('awards-create-modal'); return 'głosowanie otwarte'; });
  _audit('Pakiet tygodnia', 'Week ' + week);
  steps.push('<div style="margin-top:.6rem;color:var(--muted);font-size:.78rem">Gotowe. Możesz zamknąć to okno.</div>'); draw();
}
async function linkCaptainNick(team, captainId) {
  const nick = document.getElementById('cap-nick-sel')?.value;
  if(!nick) { showToast('Wybierz nick z listy', 'info'); return; }
  const reg = teamRegistrations.find(r => r.teamName === team);
  let res;
  if(discordUser && discordUser.id === captainId) {
    if(!_ensureSession()) return;
    const me = playersList.find(p => p.id === captainId) || myProfile || {};
    res = await _api('/me', 'POST', { team, gamertag: nick, days: me.days || [], weeks: me.weeks || {}, hours: me.hours || {}, seasonId: currentSeasonId || null }, { session: true });
    if(res.ok) myProfile = res.me;
  } else if(_isLoggedInSync()) {
    res = await _api('/me/admin-link', 'POST', { userId: captainId, team, gamertag: nick, name: reg?.captain?.name, avatar: reg?.captain?.avatar }, { admin: true });
  } else return;
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const pl = res.me || res.player;
  const i = playersList.findIndex(p => p.id === pl.id); if(i >= 0) playersList[i] = pl; else playersList.push(pl);
  showToast(`✅ ${nick} połączony z kontem kapitana`, 'success');
  openTeamRoster(); updateMyPanelBadge();
}
function openTeamRoster(team, week) {
  if(team) _rosterView.team = team;
  if(week !== undefined) _rosterView.week = week;
  team = _rosterView.team;
  const reg = teamRegistrations.find(r => r.status === 'approved' && r.teamName === team);
  if(!reg) return;
  const isAdmin = _isLoggedInSync();
  const isCap = !!(discordUser && reg.captain?.id === discordUser.id);
  const sid = reg.seasonId || currentSeasonId || null;
  const accounts = playersList.filter(p => p.team && String(p.team).toLowerCase() === team.toLowerCase());
  const byNick = {};
  accounts.forEach(a => { const k = String(a.gamertag || '').toLowerCase(); if(k && (!byNick[k] || a.status === 'confirmed')) byNick[k] = a; });
  const weeks = [...new Set(schedule.filter(x => x.generated && (x.seasonId || null) === (sid || null)).map(x => x.week))].sort((a, b) => a - b);
  const curWeek = schedule.find(x => x.generated && x.seasonId === sid && x.weekStart && x.weekStart <= _today() && _today() < _ssAddDays(x.weekStart, 7))?.week;
  const wk = _rosterView.week;
  const daysFor = a => wk === 'g' ? (a.days || []) : ((a.weeks && a.weeks[wk]) || a.days || []);
  const cell = (a, i) => {
    if(!a || a.status !== 'confirmed') return '<td style="text-align:center;color:rgba(127,127,127,.4)">·</td>';
    const on = !!daysFor(a)[i], h = a.hours?.[i];
    return on ? `<td style="text-align:center;background:rgba(22,163,74,.15)"><b style="color:var(--win)">✔</b>${h ? `<div style="font-size:.6rem;color:var(--muted)">${h[0].slice(0, 5)}–${h[1].slice(0, 5)}</div>` : ''}</td>`
              : '<td style="text-align:center;color:var(--muted)">—</td>';
  };
  const decide = (a) => (isAdmin || isCap) && a.status === 'pending'
    ? ` <button class="btn btn-primary" style="font-size:.62rem;padding:.08rem .35rem" onclick="decideMember('${a.id}',true,'roster')">✅</button><button class="btn btn-ghost" style="font-size:.62rem;padding:.08rem .35rem" onclick="decideMember('${a.id}',false,'roster')">❌</button>` : '';
  const who = a => !a ? '<span style="color:var(--muted);font-size:.72rem">niepołączony</span>'
    : `<span style="display:inline-flex;align-items:center;gap:.3rem">${_avatarHtml(a.avatar, 18)}<span style="font-size:.78rem">${a.id === reg.captain?.id ? '🧢 ' : ''}${_h(a.name)}</span>${a.status === 'confirmed' ? '<span title="potwierdzony" style="color:var(--win)">✅</span>' : '<span title="czeka na potwierdzenie" style="color:var(--accent)">⏳</span>'}${decide(a)}</span>`;
  const rows = (reg.players || []).map(p => { const a = byNick[String(p.gamertag).toLowerCase()];
    return `<tr><td style="font-weight:700;white-space:nowrap;text-align:left">${_h(p.gamertag)}</td><td style="text-align:left">${who(a)}</td>${DOW.map((_, i) => cell(a, i)).join('')}</tr>`; });
  // kapitan bez nicku w składzie + konta z nickami spoza składu (np. po zmianie składu)
  // kapitan jest połączony przez zgłoszenie drużyny — nawet bez profilu
  const capAcc = accounts.find(a => a.id === reg.captain?.id) || (reg.captain?.id ? { id: reg.captain.id, name: reg.captain.name, avatar: reg.captain.avatar, status: 'confirmed', days: [], captainOnly: true } : null);
  if(capAcc && !(reg.players || []).some(p => String(p.gamertag).toLowerCase() === String(capAcc.gamertag || '').toLowerCase())) {
    // kapitan bez nicku: wybór „który nick to ja” (kapitan sam albo admin)
    const free = (reg.players || []).map(p => p.gamertag).filter(g => !byNick[String(g).toLowerCase()]);
    const canLink = (isCap || isAdmin) && free.length;
    const linkSel = canLink ? `<div style="margin-top:.3rem;display:flex;gap:.3rem;align-items:center;flex-wrap:wrap">
        <select id="cap-nick-sel" style="width:auto;background:var(--bg);border:1px solid var(--accent);color:var(--text);border-radius:5px;padding:.15rem .3rem;font-size:.72rem">
          <option value="">${isCap ? 'Który nick to Ty?' : 'Nick kapitana…'}</option>${free.map(g => `<option>${_h(g)}</option>`).join('')}</select>
        <button class="btn btn-primary" style="font-size:.64rem;padding:.12rem .45rem" onclick="linkCaptainNick(this.dataset.t, this.dataset.u)" data-t="${_h(team)}" data-u="${_h(reg.captain.id)}">🔗 Połącz</button>
      </div>` : '';
    rows.push(`<tr><td style="font-weight:700;text-align:left">🧢 kapitan</td><td style="text-align:left">${who(capAcc)}${capAcc.captainOnly ? ' <span style="font-size:.66rem;color:var(--muted)">(nie ustawił jeszcze dostępności)</span>' : ''}${linkSel}</td>${DOW.map((_, i) => cell(capAcc, i)).join('')}</tr>`);
  }
  const confirmed = accounts.filter(a => a.status === 'confirmed');
  const counts = DOW.map((_, i) => confirmed.filter(a => daysFor(a)[i]).length);
  const linked = (reg.players || []).filter(p => byNick[String(p.gamertag).toLowerCase()]?.status === 'confirmed').length;
  const pendingN = accounts.filter(a => a.status === 'pending').length;
  const thS = 'font-size:.66rem;font-weight:800;letter-spacing:.5px;color:var(--muted);padding:.35rem .45rem;';
  const th = `style="${thS}text-align:center"`, thL = `style="${thS}text-align:left"`;
  const invite = `Połącz konto z drużyną ${team} na stronie ligi: zaloguj się przez Discord → kliknij swoją nazwę (Mój panel) → wybierz drużynę i swój nick → Zapisz. ${location.origin + location.pathname}`;
  const m = _fxModal('team-roster-modal', 860);
  m.querySelector('.modal').innerHTML = _fxHead('team-roster-modal', `👥 ${_h(team)} — skład i dostępność`) + `
    <div style="display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;margin-bottom:.7rem;font-size:.78rem">
      <span>🔗 Połączonych: <b style="color:${linked === (reg.players || []).length ? 'var(--win)' : 'var(--text)'}">${linked} / ${(reg.players || []).length}</b></span>
      ${pendingN ? `<span style="color:var(--accent)">⏳ do potwierdzenia: <b>${pendingN}</b></span>` : ''}
      <span style="flex:1"></span>
      <label style="color:var(--muted)">Pokaż:
        <select onchange="openTeamRoster(null, this.value === 'g' ? 'g' : +this.value)" style="width:auto;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.15rem .3rem;font-size:.76rem">
          <option value="g" ${wk === 'g' ? 'selected' : ''}>zwykła dostępność</option>
          ${weeks.map(w => `<option value="${w}" ${wk === w ? 'selected' : ''}>Week ${w}${w === curWeek ? ' (ten tydzień)' : ''}</option>`).join('')}
        </select></label>
    </div>
    <div style="overflow-x:auto;border:1px solid var(--border);border-radius:10px">
      <table style="width:100%;border-collapse:collapse;font-size:.8rem;min-width:620px">
        <thead><tr style="background:var(--surface2)"><th ${thL}>NICK W GRZE</th><th ${thL}>KONTO NA STRONIE</th>${DOW.map(d => `<th ${th}>${d}</th>`).join('')}</tr></thead>
        <tbody>${rows.join('').replace(/<tr>/g, '<tr style="border-top:1px solid var(--border)">').replace(/<td/g, '<td style="padding:.4rem .45rem"').replace(/style="padding:.4rem .45rem" style="/g, 'style="padding:.4rem .45rem;')}</tbody>
        <tfoot><tr style="border-top:2px solid var(--border);background:var(--surface2)"><td colspan="2" style="padding:.4rem .45rem;font-size:.72rem;color:var(--muted);font-weight:800">MOŻE GRAĆ (potwierdzeni)</td>
          ${counts.map(n => `<td style="text-align:center;padding:.4rem;font-weight:900;color:${n >= 5 ? 'var(--win)' : n >= 3 ? 'var(--accent)' : 'var(--loss)'}">${n}</td>`).join('')}</tr></tfoot>
      </table>
    </div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.5rem">✔ = może grać (pod spodem godziny, jeśli gracz je podał) · ⏳ = konto czeka na Twoje potwierdzenie · liczą się tylko potwierdzeni gracze.</div>
    ${isCap || isAdmin ? `<div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.8rem">
      <button class="btn btn-ghost" style="font-size:.76rem" onclick="navigator.clipboard?.writeText(${JSON.stringify(invite).replace(/"/g, '&quot;')}).then(()=>showToast('📋 Skopiowano zaproszenie — wklej je graczom na Discordzie','success'))">📋 Kopiuj zaproszenie dla graczy</button>
    </div>` : ''}`;
  m.classList.add('open');
}
async function openUsersOverview(tab) {
  if(tab) _uo.tab = tab;
  const m = _fxModal('users-modal', 980);
  const box = m.querySelector('.modal');
  m.classList.add('open');
  if(!_uo.users) {
    box.innerHTML = _fxHead('users-modal', '👥 Użytkownicy i składy') + '<div style="color:var(--muted)">⏳ Wczytuję…</div>';
    const res = await _api('/users', 'GET', null, { admin: true });
    _uo.users = res.ok ? res.users : [];
  }
  _renderUsersOverview();
}
function _renderUsersOverview() {
  const box = document.querySelector('#users-modal .modal');
  if(!box) return;
  const sid = currentSeasonId || null;
  const regs = teamRegistrations.filter(r => r.status === 'approved' && (!sid || !r.seasonId || r.seasonId === sid));
  const tabBtn = (id, label) => `<button onclick="_uo.tab='${id}';_renderUsersOverview()" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:1px;text-transform:uppercase;padding:.35rem .8rem;border-radius:7px;border:none;cursor:pointer;background:${_uo.tab === id ? 'var(--accent)' : 'transparent'};color:${_uo.tab === id ? 'rgba(0,0,0,.88)' : 'var(--muted)'}">${label}</button>`;
  const th = s => `<th style="font-size:.66rem;font-weight:800;letter-spacing:.5px;color:var(--muted);padding:.4rem .5rem;text-align:${s || 'left'};white-space:nowrap">`;
  const td = 'style="padding:.42rem .5rem;border-top:1px solid var(--border);font-size:.8rem;text-align:left"';
  let body = '';
  if(_uo.tab === 'teams') {
    const rows = regs.map(r => {
      const acc = playersList.filter(p => p.team && String(p.team).toLowerCase() === r.teamName.toLowerCase());
      const conf = acc.filter(p => p.status === 'confirmed'), pend = acc.filter(p => p.status === 'pending');
      const rosterN = (r.players || []).length;
      const linkedNicks = new Set(conf.map(p => String(p.gamertag || '').toLowerCase()).filter(Boolean));
      const linked = (r.players || []).filter(p => linkedNicks.has(String(p.gamertag).toLowerCase())).length;
      const cnt = i => conf.filter(p => (p.days || [])[i]).length;
      const col = n => `<b style="color:${n >= 5 ? 'var(--win)' : n >= 3 ? 'var(--accent)' : n ? 'var(--loss)' : 'var(--muted)'}">${n}</b>`;
      return `<tr style="cursor:pointer" onclick="openTeamRoster(this.dataset.t,'g')" data-t="${_h(r.teamName)}">
        <td ${td}><span style="display:inline-flex;align-items:center;gap:.4rem">${teamLogo(r.teamName, 22, '.5rem')}<b>${_h(r.teamName)}</b></span></td>
        <td ${td}>${_h(r.captain?.name || '?')} <span title="kapitan połączony przez zgłoszenie drużyny">✅</span>${conf.some(p => p.id === r.captain?.id && (p.days || []).some(Boolean)) ? '' : ' <span title="kapitan nie ustawił jeszcze swojej dostępności" style="font-size:.66rem;color:var(--muted)">(bez dostępności)</span>'}</td>
        <td ${td} style="text-align:center">${rosterN}</td>
        <td ${td} style="text-align:center"><b style="color:${linked === rosterN && rosterN ? 'var(--win)' : 'var(--text)'}">${linked}</b> / ${rosterN}</td>
        <td ${td} style="text-align:center">${pend.length ? `<b style="color:var(--accent)">⏳ ${pend.length}</b>` : '—'}</td>
        <td ${td} style="text-align:center">${col(cnt(0))} · ${col(cnt(2))} · ${col(cnt(6))}</td>
        <td ${td} style="text-align:right;color:var(--muted)">›</td>
      </tr>`.replace(/<td style="padding:.42rem .5rem;border-top:1px solid var\(--border\);font-size:.8rem;text-align:left" style="/g, '<td style="padding:.42rem .5rem;border-top:1px solid var(--border);font-size:.8rem;');
    }).join('');
    const totRoster = regs.reduce((a, r) => a + (r.players || []).length, 0);
    const totConf = playersList.filter(p => p.status === 'confirmed' && regs.some(r => r.teamName.toLowerCase() === String(p.team).toLowerCase())).length;
    body = `<div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">${regs.length} drużyn · ${totRoster} graczy w składach · <b style="color:var(--text)">${totConf}</b> potwierdzonych kont · kliknij drużynę, aby zobaczyć skład i dostępność</div>
      <div style="overflow-x:auto;border:1px solid var(--border);border-radius:10px"><table style="width:100%;border-collapse:collapse;min-width:720px">
        <thead><tr style="background:var(--surface2)">${th()}DRUŻYNA</th>${th()}KAPITAN</th>${th('center')}SKŁAD</th>${th('center')}POŁĄCZENI</th>${th('center')}DO POTWIERDZENIA</th>${th('center')}MOŻE GRAĆ Pn · Śr · Nd</th>${th()}</th></tr></thead>
        <tbody>${rows || `<tr><td ${td} colspan="7" style="text-align:center;color:var(--muted)">Brak zatwierdzonych drużyn</td></tr>`}</tbody></table></div>`;
  } else {
    // wszyscy znani użytkownicy: aktywność + profil + rola
    const map = new Map();
    (_uo.users || []).forEach(u => map.set(u.id, { ...u }));
    playersList.forEach(p => { const u = map.get(p.id) || { id: p.id, name: p.name, avatar: p.avatar }; u.profile = p; map.set(p.id, u); });
    teamRegistrations.filter(r => r.captain?.id).forEach(r => { const u = map.get(r.captain.id) || { id: r.captain.id, name: r.captain.name, avatar: r.captain.avatar }; (u.captainOf = u.captainOf || []).push(r.teamName); map.set(r.captain.id, u); });
    freeAgents.filter(f => f.status === 'active').forEach(f => { const u = map.get(f.discordId) || { id: f.discordId, name: f.name, avatar: f.avatar }; u.fa = f; map.set(f.discordId, u); });
    const ago = iso => { if(!iso) return '—'; const d = Math.floor((Date.now() - new Date(iso)) / 864e5); return d <= 0 ? 'dziś' : d === 1 ? 'wczoraj' : `${d} dni temu`; };
    let list = [...map.values()];
    const q = _uo.q.toLowerCase();
    if(q) list = list.filter(u => [u.name, u.tag, u.profile?.team, u.profile?.gamertag, ...(u.captainOf || [])].join(' ').toLowerCase().includes(q));
    if(_uo.filter === 'noteam') list = list.filter(u => !u.profile?.team && !u.captainOf);
    if(_uo.filter === 'pending') list = list.filter(u => u.profile?.status === 'pending');
    if(_uo.filter === 'active7') list = list.filter(u => u.lastSeen && Date.now() - new Date(u.lastSeen) < 7 * 864e5);
    list.sort((a, b) => String(b.lastSeen || '').localeCompare(String(a.lastSeen || '')) || String(a.name).localeCompare(String(b.name), 'pl'));
    const active7 = [...map.values()].filter(u => u.lastSeen && Date.now() - new Date(u.lastSeen) < 7 * 864e5).length;
    const chip = (id, label) => `<button onclick="_uo.filter='${id}';_renderUsersOverview()" style="font-size:.72rem;padding:.25rem .6rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${_uo.filter === id ? 'var(--accent)' : 'var(--border)'};background:${_uo.filter === id ? 'rgba(245,197,24,.15)' : 'transparent'};color:${_uo.filter === id ? 'var(--accent)' : 'var(--text)'}">${label}</button>`;
    const role = u => [
      ...(u.captainOf || []).map(t => `<span style="color:var(--accent)">🧢 kapitan ${_h(t)}</span> <span title="połączony przez zgłoszenie drużyny">✅</span>`),
      u.profile?.team && !(u.captainOf || []).includes(u.profile.team) ? `${u.profile.status === 'confirmed' ? '✅' : '⏳'} ${_h(u.profile.team)} <span style="color:var(--muted)">(${_h(u.profile.gamertag || '—')})</span>` : '',
      u.fa ? `🆓 wolny agent (${_h(u.fa.pos1)})` : ''
    ].filter(Boolean).join('<br>') || '<span style="color:var(--muted)">kibic</span>';
    body = `<div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem">
        <input value="${_h(_uo.q)}" oninput="_uo.q=this.value;clearTimeout(window._uoT);window._uoT=setTimeout(_renderUsersOverview,250)" placeholder="Szukaj: nick, drużyna…" style="${_MODAL_INP};max-width:240px">
        ${chip('all', 'Wszyscy')}${chip('active7', `Aktywni 7 dni (${active7})`)}${chip('pending', 'Czekają na kapitana')}${chip('noteam', 'Bez drużyny')}
        <span style="flex:1"></span><span style="font-size:.74rem;color:var(--muted)">${list.length} os.</span>
      </div>
      <div style="overflow-x:auto;border:1px solid var(--border);border-radius:10px;max-height:58vh;overflow-y:auto"><table style="width:100%;border-collapse:collapse;min-width:720px">
        <thead><tr style="background:var(--surface2);position:sticky;top:0">${th()}UŻYTKOWNIK</th>${th()}DRUŻYNA / ROLA</th>${th('center')}OSTATNIO</th>${th('center')}DNI NA STRONIE</th>${th()}</th></tr></thead>
        <tbody>${list.map(u => `<tr>
          <td ${td}><span style="display:inline-flex;align-items:center;gap:.45rem">${_avatarHtml(u.avatar, 26)}<span><b>${_h(u.name || '?')}</b>${u.tag ? `<br><span style="font-size:.68rem;color:var(--muted)">@${_h(u.tag)}</span>` : ''}</span></span></td>
          <td ${td}>${role(u)}</td>
          <td ${td} style="text-align:center">${ago(u.lastSeen)}</td>
          <td ${td} style="text-align:center">${u.days || '—'}</td>
          <td ${td} style="text-align:right;white-space:nowrap">${u.profile?.status === 'pending' ? `<button class="btn btn-primary" style="font-size:.64rem;padding:.1rem .35rem" onclick="decideMember('${u.id}',true,'users')">✅</button> <button class="btn btn-ghost" style="font-size:.64rem;padding:.1rem .35rem" onclick="decideMember('${u.id}',false,'users')">❌</button>` : u.profile?.status === 'confirmed' && !(u.captainOf || []).includes(u.profile.team) ? `<button class="btn btn-ghost" title="Odłącz od drużyny" style="font-size:.64rem;padding:.1rem .35rem" onclick="decideMember('${u.id}',false,'users')">✕</button>` : ''}</td>
        </tr>`.replace(/<td style="padding:.42rem .5rem;border-top:1px solid var\(--border\);font-size:.8rem;text-align:left" style="/g, '<td style="padding:.42rem .5rem;border-top:1px solid var(--border);font-size:.8rem;')).join('') || `<tr><td ${td} colspan="5" style="text-align:center;color:var(--muted)">Brak użytkowników</td></tr>`}</tbody></table></div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:.45rem">„Ostatnio” = ostatnie wejście na stronę zalogowanym kontem (zapisywane od tej aktualizacji). Osoby sprzed aktualizacji widać, jeśli głosowały, zgłaszały się albo są kapitanami.</div>`;
  }
  box.innerHTML = _fxHead('users-modal', '👥 Użytkownicy i składy') + `
    <div style="display:flex;gap:.2rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.2rem;margin-bottom:.8rem;width:fit-content">
      ${tabBtn('teams', '🏀 Drużyny')}${tabBtn('users', '👤 Użytkownicy')}
    </div>${body}`;
}
async function installApp() {
  if(_installPrompt) {
    _installPrompt.prompt();
    const r = await _installPrompt.userChoice.catch(() => null);
    if(r?.outcome === 'accepted') _installPrompt = null;
    return;
  }
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /Discord|FBAN|FBAV|Instagram|Line\//i.test(ua);
  const step = (n, t) => `<div style="display:flex;gap:.6rem;align-items:flex-start;margin-bottom:.6rem"><b style="background:var(--accent);color:rgba(0,0,0,.88);border-radius:50%;min-width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.8rem">${n}</b><div style="font-size:.86rem;line-height:1.45">${t}</div></div>`;
  const m = _fxModal('install-modal', 460);
  m.querySelector('.modal').innerHTML = _fxHead('install-modal', '📲 Aplikacja na telefon') + `
    <div style="display:flex;align-items:center;gap:.8rem;margin-bottom:1rem">
      <img src="icons/icon-192.png" alt="" style="width:56px;height:56px;border-radius:14px">
      <div style="font-size:.84rem;color:var(--muted)">Ikona ligi na ekranie telefonu — jedno dotknięcie i jesteś w terminarzu, Moim panelu i wynikach. Bez sklepu z aplikacjami.</div>
    </div>
    ${inApp ? step('!', 'Otwierasz stronę w przeglądarce wbudowanej w Discorda. Najpierw otwórz ją w <b>' + (ios ? 'Safari' : 'Chrome') + '</b> (⋯ → Otwórz w przeglądarce).') : ''}
    ${ios ? step(1, 'W <b>Safari</b> stuknij przycisk <b>Udostępnij</b> <span style="font-size:1.05rem">⎋</span> (kwadrat ze strzałką w górę).') + step(2, 'Przewiń w dół i wybierz <b>Do ekranu początkowego</b>.') + step(3, 'Stuknij <b>Dodaj</b> — gotowe!')
          : step(1, 'Otwórz menu przeglądarki <b>⋮</b> (prawy górny róg w Chrome).') + step(2, 'Wybierz <b>Zainstaluj aplikację</b> albo <b>Dodaj do ekranu głównego</b>.') + step(3, 'Potwierdź — ikona pojawi się na ekranie telefonu.')}
    <div style="font-size:.74rem;color:var(--muted);margin-top:.4rem">Po instalacji zaloguj się raz przez Discord w aplikacji.</div>`;
  m.classList.add('open');
}
// { guilds, roles, bot }
async function _loadRoleOptions(guildId) {
  const res = await _api('/discord-roles/options', 'POST', { guildId: guildId || null }, { admin: true });
  if(!res.ok) { _rolesOpts = { error: res.error }; return; }
  _rolesOpts = { guilds: res.guilds || [], roles: res.roles || null, bot: res.bot || null, guildId: guildId || null };
}
async function rolesPickGuild(gid) {
  const f = _rolesForm(); f.guildId = gid; discordRoleCfgDraft = f;
  await _loadRoleOptions(gid); openRolesSettings(true);
}
async function openRolesSettings(keepDraft) {
  if(!keepDraft) { discordRoleCfgDraft = null; _rolesOpts = null; }
  if(!_rolesOpts) {
    const m0 = _fxModal('roles-modal', 600); m0.classList.add('open');
    m0.querySelector('.modal').innerHTML = _fxHead('roles-modal', '🎭 Role Discord') + '<div style="color:var(--muted)">⏳ Pobieram serwery i role od bota…</div>';
    await _loadRoleOptions(discordRoleCfg.guildId || null);
    if(_rolesOpts.guilds?.length === 1 && !discordRoleCfg.guildId) await _loadRoleOptions(_rolesOpts.guilds[0].id);
  }
  const c = discordRoleCfgDraft || { ...discordRoleCfg, guildId: discordRoleCfg.guildId || _rolesOpts.guildId || '' };
  const o = _rolesOpts || {};
  const roleSel = (id, val, placeholder) => o.roles ? `<select id="${id}" style="${_MODAL_INP}">
      <option value="">${placeholder}</option>
      ${o.roles.map(r => `<option value="${r.id}" ${r.id === val ? 'selected' : ''} ${r.assignable ? '' : 'style="color:#888"'}>${_h(r.name)}${r.assignable ? '' : '  ⚠ wyżej niż bot'}</option>`).join('')}
    </select>` : `<input id="${id}" value="${_h(val)}" inputmode="numeric" placeholder="ID roli" style="${_MODAL_INP}">`;
  const m = _fxModal('roles-modal', 600);
  const step = (n, t) => `<div style="display:flex;gap:.55rem;margin-bottom:.45rem;font-size:.8rem;line-height:1.45"><b style="background:var(--accent);color:rgba(0,0,0,.88);border-radius:50%;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:.7rem">${n}</b><span>${t}</span></div>`;
  m.querySelector('.modal').innerHTML = _fxHead('roles-modal', '🎭 Role Discord') + `
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.8rem">Bot sam nadaje rolę, gdy kapitan (albo admin) <b>potwierdzi gracza w drużynie</b>, i zabiera ją po odłączeniu. Kapitanowie dostają role po zatwierdzeniu drużyny. Gracz musi być na serwerze Discord ligi.</div>
    <details style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .8rem;margin-bottom:.9rem">
      <summary style="cursor:pointer;font-size:.8rem;font-weight:700">Jak przygotować serwer (jednorazowo)</summary>
      <div style="margin-top:.6rem">
        ${step(1, 'Utwórz role na serwerze (np. „League Member” i opcjonalnie „Kapitan”).')}
        ${step(2, 'Ustawienia serwera → Role: przeciągnij <b>rolę bota</b> NAD te role i daj jej uprawnienie <b>Zarządzanie rolami</b>.')}
        ${step(3, 'Tutaj wybierz serwer i role z listy, kliknij <b>Sprawdź</b> i <b>Zapisz</b>.')}
      </div>
    </details>
    ${o.error ? `<div style="font-size:.8rem;color:var(--loss);margin-bottom:.6rem">❌ ${_h(o.error)} — możesz wpisać ID ręcznie.</div>` : ''}
    <label style="${_MODAL_LBL}">Serwer</label>
    ${o.guilds?.length ? `<select id="rl-guild" onchange="rolesPickGuild(this.value)" style="${_MODAL_INP};margin-bottom:.6rem">
        <option value="">— wybierz serwer —</option>${o.guilds.map(g => `<option value="${g.id}" ${g.id === c.guildId ? 'selected' : ''}>${_h(g.name)}</option>`).join('')}</select>`
      : `<input id="rl-guild" value="${_h(c.guildId)}" inputmode="numeric" placeholder="ID serwera" style="${_MODAL_INP};margin-bottom:.6rem">`}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.4rem">
      <div><label style="${_MODAL_LBL}">Rola gracza ligi</label>${roleSel('rl-member', c.member, '— wybierz rolę —')}</div>
      <div><label style="${_MODAL_LBL}">Rola kapitana (opcjonalnie)</label>${roleSel('rl-captain', c.captain, '— bez roli kapitana —')}</div>
    </div>
    ${o.roles ? `<div style="font-size:.7rem;color:var(--muted);margin-bottom:.7rem">Role oznaczone „⚠ wyżej niż bot” bot nie może nadać — przeciągnij rolę bota${o.bot ? ' (' + _h(o.bot) + ')' : ''} wyżej w Ustawieniach serwera → Role.</div>` : ''}
    <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;background:var(--surface2);border:1px dashed var(--border);border-radius:10px;padding:.5rem .6rem;margin-bottom:.7rem">
      <span style="font-size:.76rem;flex:1;min-width:180px">🤖 Bot może sam założyć role (albo użyć istniejących o tych nazwach):</span>
      <input id="rl-new-cap" value="${EU_MODE ? 'GM' : 'Kapitan'}" placeholder="Rola kapitana" style="${_MODAL_INP};width:110px;margin:0">
      <input id="rl-new-mem" value="${EU_MODE ? 'CL Player' : 'League Member'}" placeholder="Rola gracza" style="${_MODAL_INP};width:130px;margin:0">
      <button class="btn btn-ghost" onclick="rolesCreate()">🤖 Utwórz role</button></div>
    <div id="rl-status" style="font-size:.8rem;min-height:1.2em;margin-bottom:.7rem;line-height:1.5"></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">
      <button class="btn btn-ghost" onclick="testRoles()">🧪 Sprawdź</button>
      <button class="btn btn-primary" onclick="saveRoles()">💾 Zapisz</button>
      <button class="btn btn-ghost" onclick="syncRoles()" ${c.guildId ? '' : 'disabled title="Najpierw zapisz ustawienia"'}>🔄 Nadaj role wszystkim połączonym</button>
    </div>`;
  m.classList.add('open');
}
function _rolesForm() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  return { guildId: v('rl-guild'), member: v('rl-member'), captain: v('rl-captain') };
}
async function rolesCreate() {
  const gid = document.getElementById('rl-guild')?.value, st = document.getElementById('rl-status'); if(!gid) { st.innerHTML = '❌ Najpierw wybierz serwer'; return; }
  const cap = document.getElementById('rl-new-cap').value.trim(), mem = document.getElementById('rl-new-mem').value.trim();
  st.innerHTML = '⏳ Bot zakłada role…';
  const r = await _api('/roles/create', 'POST', { guildId: gid, roles: [...(cap ? [{ key: 'captain', name: cap, color: 0xf5c518, hoist: true }] : []), ...(mem ? [{ key: 'member', name: mem, color: 0x3b82f6, hoist: true }] : [])] }, { admin: true });
  if(!r.ok) { st.innerHTML = '❌ ' + _h(r.error || ''); return; }
  discordRoleCfgDraft = { ...(discordRoleCfgDraft || discordRoleCfg), guildId: gid, member: r.roles.member || (discordRoleCfgDraft || discordRoleCfg).member || '', captain: r.roles.captain || (discordRoleCfgDraft || discordRoleCfg).captain || '' };
  await _loadRoleOptions(gid); await openRolesSettings(true);
  const st2 = document.getElementById('rl-status'); if(st2) st2.innerHTML = '✅ ' + (r.created.length ? _g('Utworzono', 'Created') + ': <b>' + r.created.map(_h).join(', ') + '</b>' : _g('Role już istniały', 'Roles already existed')) + ' — ' + _g('są wybrane powyżej. Kliknij <b>Sprawdź</b>, potem <b>Zapisz</b>.', 'selected above. Click <b>Check</b>, then <b>Save</b>.');
}
async function testRoles() {
  const f = _rolesForm(), st = document.getElementById('rl-status');
  if(!/^\d{15,21}$/.test(f.guildId) || !/^\d{15,21}$/.test(f.member)) { st.style.color = 'var(--loss)'; st.textContent = '❌ Wpisz poprawne ID serwera i roli gracza (same cyfry)'; return; }
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Sprawdzam…';
  const res = await _api('/discord-roles/test', 'POST', f, { admin: true });
  if(!res.ok) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + res.error; return; }
  const line = (label, r) => !r ? '' : r.name === null ? `<div>❌ ${label}: nie ma takiej roli na serwerze</div>` : r.ok ? `<div>✅ ${label}: <b>${_h(r.name || 'OK')}</b></div>` : `<div>⚠️ ${label}: <b>${_h(r.name || '')}</b> jest wyżej niż rola bota — przeciągnij rolę bota nad nią</div>`;
  st.style.color = 'var(--text)';
  st.innerHTML = `<div>${res.canManage ? '✅' : '❌'} Bot <b>${_h(res.bot)}</b> ${res.canManage ? 'ma uprawnienie Zarządzanie rolami' : 'NIE ma uprawnienia Zarządzanie rolami'}</div>` + line('Rola gracza', res.member) + line('Rola kapitana', res.captain);
}
async function saveRoles() {
  const f = _rolesForm(), st = document.getElementById('rl-status');
  if(f.guildId && !/^\d{15,21}$/.test(f.guildId) || f.member && !/^\d{15,21}$/.test(f.member) || f.captain && !/^\d{15,21}$/.test(f.captain)) { st.style.color = 'var(--loss)'; st.textContent = '❌ ID to same cyfry (15–21 znaków)'; return; }
  const prev = discordRoleCfg; discordRoleCfg = f; discordRoleCfgDraft = f;
  if(!(await saveData())) { discordRoleCfg = prev; return; }
  _audit('Ustawienia ról Discord', `serwer ${f.guildId || '—'}, gracz ${f.member || '—'}, kapitan ${f.captain || '—'}`);
  showToast('✅ Zapisano — od teraz role nadają się automatycznie', 'success');
  openRolesSettings(true);
}
async function syncRoles() {
  if(!confirm('Nadać role wszystkim potwierdzonym graczom i kapitanom?')) return;
  const st = document.getElementById('rl-status');
  let offset = 0, success = 0, notOn = 0, failed = 0, total = 0;
  for(let i = 0; i < 30; i++) {
    st.style.color = 'var(--muted)'; st.textContent = `⏳ Nadaję role… ${offset}${total ? ' / ' + total : ''}`;
    const res = await _api('/discord-roles/sync', 'POST', { offset }, { admin: true });
    if(!res.ok) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + res.error; return; }
    success += res.success; notOn += res.notOnServer; failed += res.failed; total = res.total; offset = res.done;
    if(!res.more) break;
  }
  st.style.color = 'var(--text)';
  st.innerHTML = `✅ Gotowe: ${success} / ${total}${notOn ? ` · <span style="color:var(--accent)">${notOn} nie ma na serwerze</span>` : ''}${failed ? ` · <span style="color:var(--loss)">${failed} błędów (sprawdź uprawnienia bota)</span>` : ''}`;
}
// ═══ 📱 DOLNE MENU ═══════════════════════════════════════════════
function bnGo(v) {
  showView(v);
  window.scrollTo({ top: 0 });
}
function openMoreSheet() {
  const sheet = document.getElementById('more-sheet');
  const items = [];
  const icon = t => (String(t).match(/^\s*([^\w\s+]{1,3})/u) || [])[1] || '•';
  const label = t => String(t).replace(/^\s*[^\w\s+]{1,3}\s*/u, '').trim();
  // widoki z górnego menu, których nie ma na dole
  document.querySelectorAll('header nav button').forEach((b, i) => {
    const m = (b.getAttribute('onclick') || '').match(/showView\('([\w-]+)'\)/);
    if(!m || ['dashboard', 'schedule', 'mypanel', 'matches'].includes(m[1]) || b.style.display === 'none') return;
    const txt = b.textContent.trim();
    const ico = { stats: '📊', 'add-match': '➕', aliases: '⚙️', events: '🏆', fantasy: '🏀', teams: '👥' }[m[1]] || icon(txt);
    items.push({ ico, text: (label(txt) || txt).replace(/^\+\s*/, ''), act: `document.getElementById('more-sheet').classList.remove('open');bnGo('${m[1]}')` });
  });
  // narzędzia z prawej strony nagłówka (admin, logowanie, język)
  document.querySelectorAll('#hdr-tools > button').forEach((b, i) => {
    if(b.id === 'theme-btn' || b.style.display === 'none' || !b.id) return;
    const txt = b.textContent.trim();
    items.push({ ico: icon(txt), text: label(txt) || txt, act: `document.getElementById('more-sheet').classList.remove('open');document.getElementById('${b.id}').click()` });
  });
  // skróty kapitana
  const capReg = discordUser ? teamRegistrations.find(r => r.status === 'approved' && r.captain?.id === discordUser.id) : null;
  if(capReg) {
    const tn = String(capReg.teamName).replace(/'/g, "\\'");
    items.unshift(
      { ico: '👥', text: 'Skład i dostępność', act: `document.getElementById('more-sheet').classList.remove('open');openTeamRoster('${tn}','g')` },
      { ico: '✏️', text: 'Zmień skład', act: `document.getElementById('more-sheet').classList.remove('open');openRosterChange('${capReg.id}')` },
      { ico: '📺', text: 'Kanał transmisji', act: `document.getElementById('more-sheet').classList.remove('open');openTeamStreamModal('${capReg.id}')` },
      { ico: '🐦', text: currentLang === 'en' ? 'Team X profile' : 'Profil X drużyny', act: `document.getElementById('more-sheet').classList.remove('open');openTeamXModal('${capReg.id}')` },
      { ico: '🖼', text: 'Logo drużyny', act: `document.getElementById('more-sheet').classList.remove('open');changeTeamLogo('${capReg.id}')` },
      { ico: '📋', text: 'Kopiuj zaproszenie', act: `navigator.clipboard?.writeText('Połącz konto z drużyną ${tn} na stronie ligi: zaloguj się przez Discord → Mój panel → wybierz drużynę i swój nick → Zapisz. ' + location.origin + '/panel').then(()=>showToast('📋 Skopiowano zaproszenie','success'));document.getElementById('more-sheet').classList.remove('open')` }
    );
  }
  if(_gmVisible()) items.push({ ico: '🏆', text: currentLang === 'en' ? 'GM League' : 'Liga GM', act: `document.getElementById('more-sheet').classList.remove('open');showView('gm')` });
  [['kort', '🃏', 'Kort — gra karciana', 'Kort — card game'], ['standings', '📋', 'Tabela', 'Standings'], ['join', '🤝', 'Dołącz do ligi', 'Join the league'], ['totw', '🏆', 'Piątka tygodnia', 'Team of the Week'], ['awards', '🗳️', 'Głosowanie tygodnia', 'Weekly vote'], ['fplus', '⭐', 'Fantasy+', 'Fantasy+']].forEach(([v, ico, pl, en]) => items.push({ ico, text: currentLang === 'en' ? en : pl, act: `document.getElementById('more-sheet').classList.remove('open');showView('${v}')` }));
  if(_isLoggedInSync()) items.push({ ico: '🛠', text: currentLang === 'en' ? 'Admin panel' : 'Panel admina', act: `document.getElementById('more-sheet').classList.remove('open');openAdminHub()` });
  items.push({ ico: '💡', text: currentLang === 'en' ? 'Send a suggestion' : 'Zgłoś sugestię', act: `document.getElementById('more-sheet').classList.remove('open');openSuggest()` });
  items.push({ ico: '🃏', text: currentLang === 'en' ? 'Card collection' : 'Kolekcja kart', act: `document.getElementById('more-sheet').classList.remove('open');showView('cards')` });
  items.push({ ico: '🏅', text: 'Liga kibiców', act: `document.getElementById('more-sheet').classList.remove('open');showView('fans')` });
  items.push({ ico: '🔁', text: 'Okno transferowe', act: `document.getElementById('more-sheet').classList.remove('open');openTrades()` });
  items.push({ ico: '🧩', text: '2Kordle', act: `document.getElementById('more-sheet').classList.remove('open');showView('kordle')` });
  items.push({ ico: '🎧', text: 'Podcast', act: `document.getElementById('more-sheet').classList.remove('open');showView('podcast')` });
  items.push({ ico: '📺', text: 'Multistream', act: `document.getElementById('more-sheet').classList.remove('open');_ms.sel=null;openMultistream()` });
  if(discordUser) items.push({ ico: '🎁', text: 'Mój Wrapped', act: `document.getElementById('more-sheet').classList.remove('open');_wr.tab=null;openWrapped()` });
  items.push({ ico: '📜', text: 'Kronika ligi', act: `document.getElementById('more-sheet').classList.remove('open');openChronicle()` });
  items.push({ ico: '🏛', text: 'Rekordy', act: `document.getElementById('more-sheet').classList.remove('open');_recordsEdition=undefined;openLeagueRecordsModal()` });
  if(!_isStandalone()) items.push({ ico: '📲', text: 'Zainstaluj aplikację', act: `document.getElementById('more-sheet').classList.remove('open');installApp()` });
  items.push({ ico: '💬', text: 'Discord ligi', href: _discordInvite() });
  items.push({ ico: document.documentElement.getAttribute('data-theme') === 'light' ? '🌙' : '☀️', text: 'Motyw', act: `toggleTheme();openMoreSheet()` });
  const langs = ['pl', 'en'];
  // bez dubli: ta sama zakładka może trafić z górnego menu i z listy skrótów — zostaje pierwsza pozycja
  { const seen = new Set(); for(let n = items.length - 1; n >= 0; n--) {} const out = [];
    items.forEach(it => { const v = (String(it.act || '').match(/(?:bnGo|showView)\('([\w-]+)'\)/) || [])[1], key = v ? 'v:' + v : 't:' + String(it.text).toLowerCase();
      if(seen.has(key) || seen.has('t:' + String(it.text).toLowerCase())) return; seen.add(key); seen.add('t:' + String(it.text).toLowerCase()); out.push(it); });
    items.length = 0; items.push(...out); }
  sheet.querySelector('.ms-panel').innerHTML = `
    <div style="width:40px;height:4px;border-radius:2px;background:var(--border);margin:0 auto .8rem"></div>
    ${capReg ? `<div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin:0 0 .45rem .2rem">🧢 KAPITAN · ${_h(capReg.teamName).toUpperCase()}</div>` : ''}
    <div class="ms-grid">
      ${items.map(it => it.href
        ? `<a class="ms-item" href="${it.href}" target="_blank" rel="noopener"><span class="ico">${it.ico}</span>${_h(it.text)}</a>`
        : `<button class="ms-item" onclick="${it.act}"><span class="ico">${it.ico}</span>${_h(it.text)}</button>`).join('')}
    </div>
    <div style="display:flex;gap:.4rem;justify-content:center;margin-top:.8rem">${langs.map(l => `<button class="btn ${currentLang === l ? 'btn-primary' : 'btn-ghost'}" style="font-size:.74rem;padding:.25rem .8rem" onclick="setLang('${l}')">${l === 'pl' ? '🇵🇱 Polski' : '🇬🇧 English'}</button>`).join('')}</div>`;
  sheet.classList.add('open');
}
function _guessTeamByRoster(players, exclude) {
  const { counts, who } = _rosterHits(players, _rosterIdx());
  const sorted = Object.entries(counts).filter(([t]) => t !== exclude).sort((a, b) => b[1] - a[1]);
  if(!sorted.length) return null;
  const [team, hits] = sorted[0], second = sorted[1]?.[1] || 0;
  return hits >= 2 && hits >= second * 2 ? { team, hits, total: (players || []).length, who: who[team] } : null;
}
function openTeamNameFixer() {
  const known = new Set(_approvedTeamNames().map(n => n.toLowerCase()));
  const all = _withAllMatches(() => matches.slice());
  const groups = {};
  all.forEach(m => ['team1', 'team2'].forEach(sd => {
    const t = m[sd]; if(!t?.name || known.has(String(t.name).toLowerCase())) return;
    const g = groups[t.name] = groups[t.name] || { name: t.name, matches: [], players: [] };
    g.matches.push(m); (t.players || []).forEach(p => g.players.push(p));
  }));
  const list = Object.values(groups).map(g => ({ ...g, guess: _guessTeamByRoster(g.players.filter((p, i, a) => a.findIndex(x => _normNick(x.name || x.n) === _normNick(p.name || p.n)) === i)) }))
    .sort((a, b) => (!!b.guess - !!a.guess) || b.matches.length - a.matches.length);
  window._tnf = list;
  // mecze z nazwami z ligi, w których skład wskazuje inną drużynę (np. AI źle odczytało nazwę ze screena)
  const suspicious = all.filter(m => known.has(String(m.team1?.name).toLowerCase()) && known.has(String(m.team2?.name).toLowerCase()))
    .map(m => ({ m, fixes: _fixMatchTeams(m, true) })).filter(x => x.fixes.length)
    .sort((a, b) => String(b.m.date).localeCompare(String(a.m.date)));
  window._tnfSus = suspicious;
  const teams = _approvedTeamNames().sort((a, b) => a.localeCompare(b, 'pl'));
  const m = _fxModal('tnf-modal', 760);
  m.querySelector('.modal').innerHTML = _fxHead('tnf-modal', '🔄 Nazwy drużyn wg składów') + `
    <div style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:.8rem">Mecze, w których drużyna ma nazwę spoza ligi (np. nazwa z Pro-Am). Strona rozpoznaje drużynę po <b>graczach ze składów</b>.
      „Zamień” poprawia mecze i zapamiętuje nazwę — kolejne mecze (bot, kapitanowie, admin) dopasują się już same.</div>
    ${suspicious.length ? `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--loss);margin-bottom:.4rem">⚠️ SKŁAD NIE PASUJE DO NAZWY (${suspicious.length})</div>
      <div style="display:flex;flex-direction:column;gap:.45rem;margin-bottom:1rem">
        ${suspicious.map((x, i) => `<div style="border:1px solid rgba(220,38,38,.45);border-radius:10px;padding:.55rem .8rem;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
          <span style="font-size:.72rem;color:var(--muted)">${_ssFmt(x.m.date)}</span>
          <b style="font-size:.85rem">${_h(x.m.team1.name)} ${x.m.team1.score}:${x.m.team2.score} ${_h(x.m.team2.name)}</b>
          <span style="flex:1;font-size:.76rem;color:var(--muted)">${x.fixes.map(f => `${_h(f.from)} → <b style="color:var(--win)">${_h(f.to)}</b> (${f.hits} graczy ze składu)`).join(' · ')}</span>
          <button class="btn btn-primary" style="font-size:.72rem;padding:.25rem .6rem" onclick="applySuspiciousFix(${i})">Popraw</button>
        </div>`).join('')}
        ${suspicious.length > 1 ? `<div style="text-align:right"><button class="btn btn-ghost" style="font-size:.74rem" onclick="applySuspiciousFix('all')">Popraw wszystkie (${suspicious.length})</button></div>` : ''}
      </div>` : ''}
    ${list.length ? `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">NAZWY SPOZA LIGI</div><div style="display:flex;flex-direction:column;gap:.5rem;max-height:60vh;overflow-y:auto">
      ${list.map((g, i) => `<div style="border:1px solid ${g.guess ? 'rgba(22,163,74,.5)' : 'var(--border)'};border-radius:10px;padding:.6rem .8rem">
        <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
          <b style="font-size:.95rem">${_h(g.name)}</b><span style="font-size:.72rem;color:var(--muted)">${g.matches.length} ${_plPL(g.matches.length, 'mecz', 'mecze', 'meczów')}</span>
          <span style="flex:1"></span>
          <span style="font-size:.78rem">→</span>
          <select id="tnf-sel-${i}" style="width:auto;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.25rem .4rem;font-size:.8rem">
            <option value="">— wybierz drużynę —</option>${teams.map(t => `<option ${g.guess?.team === t ? 'selected' : ''}>${_h(t)}</option>`).join('')}</select>
          <button class="btn btn-primary" style="font-size:.72rem;padding:.25rem .6rem" onclick="applyTeamNameFix(${i})">Zamień</button>
        </div>
        <div style="font-size:.7rem;color:var(--muted);margin-top:.3rem">${g.guess ? `✅ Rozpoznano po składzie: <b style="color:var(--win)">${_h(g.guess.team)}</b> (${g.guess.hits} graczy: ${g.guess.who.slice(0, 5).map(_h).join(', ')})` : 'Nie rozpoznano automatycznie — wybierz drużynę ręcznie albo zostaw (np. drużyna spoza ligi).'}</div>
      </div>`).join('')}</div>` : (suspicious.length ? '' : '<div style="text-align:center;color:var(--muted);padding:1.5rem">✅ Wszystkie mecze mają poprawne nazwy drużyn.</div>')}
    ${Object.keys(teamAliasMap).length ? `<div style="font-size:.72rem;color:var(--muted);margin-top:.9rem">Zapamiętane nazwy: ${Object.entries(teamAliasMap).map(([k, v]) => `<span style="margin-right:.5rem">${_h(k)} → <b>${_h(v)}</b> <a href="#" onclick="delete teamAliasMap['${k.replace(/'/g, "\\'")}'];saveData().then(openTeamNameFixer);return false" style="color:var(--loss)">✕</a></span>`).join('')}</div>` : ''}`;
  m.classList.add('open');
}
async function applySuspiciousFix(i) {
  const items = i === 'all' ? (window._tnfSus || []) : [window._tnfSus?.[i]].filter(Boolean);
  if(!items.length) return;
  if(!confirm(`Poprawić nazwy drużyn w ${items.length} ${_plPL(items.length, 'meczu', 'meczach', 'meczach')} według składów?`)) return;
  const log = [];
  items.forEach(x => { const f = _fixMatchTeams(x.m); f.forEach(z => log.push(`${z.from} → ${z.to}`)); });
  if(!(await saveData())) return;
  _audit('Nazwy drużyn wg składów', `${items.length} meczów: ${log.join(', ')}`.slice(0, 190));
  showToast(`✅ Poprawiono ${items.length} ${_plPL(items.length, 'mecz', 'mecze', 'meczów')}`, 'success');
  renderDashboard(); openTeamNameFixer();
}
async function applyTeamNameFix(i) {
  const g = window._tnf?.[i];
  const target = document.getElementById('tnf-sel-' + i)?.value;
  if(!g || !target) { showToast('Wybierz drużynę', 'info'); return; }
  if(!confirm(`Zamienić „${g.name}” na „${target}” w ${g.matches.length} ${_plPL(g.matches.length, 'meczu', 'meczach', 'meczach')} i zapamiętać na przyszłość?`)) return;
  let n = 0;
  _withAllMatches(() => matches.forEach(m => ['team1', 'team2'].forEach(sd => { if(m[sd]?.name === g.name && m[sd === 'team1' ? 'team2' : 'team1']?.name !== target) { m[sd].name = target; n++; } })));
  teamAliasMap[String(g.name).toLowerCase()] = target;
  if(!(await saveData())) return;
  _audit('Nazwa drużyny z Pro-Am', `${g.name} → ${target} (${n} meczów)`);
  showToast(`✅ ${g.name} → ${target} (${n})`, 'success');
  renderDashboard(); openTeamNameFixer();
}
function _fxPosTxt(p) { return p?.pos?.length ? p.pos.join('/') : 'każda'; }
function _fxDraft() {
  if(!_fx.draft) {
    const st = mySquad ? [...mySquad.starters] : [];
    _fx.draft = { starters: [0, 1, 2, 3, 4].map(i => st[i] || null), bench: mySquad ? [...mySquad.bench] : [], captain: mySquad?.captain || null };
  }
  return _fx.draft;
}
function _fxFilled(d) { return d.starters.filter(Boolean); }
// ułóż zawodników piątki na pasujących pozycjach (jeśli się da)
function fxAutoArrange() {
  const d = _fxDraft(), ps = _fxFilled(d), best = [null, null, null, null, null];
  const go = (i, left) => {
    if(i === 5) return true;
    for(const k of left) { if(_fxElig(_fxP(k), FX_SLOTS[i])) { best[i] = k; if(go(i + 1, left.filter(x => x !== k))) return true; } }
    if(left.length < 5 - i) { best[i] = null; return go(i + 1, left); }
    return false;
  };
  if(go(0, ps)) { d.starters = best; renderFantasy(); showToast('🔀 Ułożono zawodników na pozycjach', 'success'); }
  else showToast('Nie da się ułożyć tej piątki na pozycjach PG/SG/SF/PF/C — wymień kogoś', 'error');
}
function _fxCost(d) { return Math.round([..._fxFilled(d), ...d.bench].reduce((s, k) => s + (_fxP(k)?.price || 0), 0) * 10) / 10; }
function _fxTeamCount(d) { const c = {}; [..._fxFilled(d), ...d.bench].forEach(k => { const t = _fxP(k)?.team; if(t) c[t] = (c[t] || 0) + 1; }); return c; }
function _fxNeedsRedo() { return !!(mySquad && !mySquad.posRule); }
// skład sprzed zmiany zasad (pozycje) — trzeba zapisać na nowo
function _fxDirty() { const d = _fxDraft(); return !mySquad || _fxNeedsRedo() || JSON.stringify([d.starters, d.bench, d.captain]) !== JSON.stringify([mySquad.starters, mySquad.bench, mySquad.captain]); }
function _fxLockText() {
  const nx = fantasyData?.weeks?.find(w => w.week === fantasyData.nextWeek);
  if(!nx) return 'Sezon fantasy zakończony';
  const ms = new Date(nx.lock) - Date.now();
  const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
  return `Skład na <b>Week ${nx.week}</b> zamyka się ${new Date(nx.lock).toLocaleString('pl-PL', { weekday: 'long', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })} · za ${d ? d + ' d ' : ''}${h} h ${d ? '' : m + ' min'}`;
}
function renderFantasy() {
  const el = document.getElementById('fantasy-view');
  if(!el) return;
  const R = fantasyData?.rules || { budget: 60, maxPerTeam: 2 };
  if(!fantasyData?.players?.length) {
    el.innerHTML = `<div class="section-title">🏀 Fantasy Ekstraklasa</div><div class="card" style="padding:2rem;text-align:center;color:var(--muted)">Fantasy ruszy, gdy terminarz sezonu będzie gotowy.</div>`;
    return;
  }
  const tab = (id, label) => `<button onclick="_fx.tab='${id}';renderFantasy()" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:1px;text-transform:uppercase;padding:.4rem .9rem;border-radius:8px;border:none;cursor:pointer;background:${_fx.tab === id ? 'var(--accent)' : 'transparent'};color:${_fx.tab === id ? 'rgba(0,0,0,.88)' : 'var(--muted)'}">${label}</button>`;
  const cw = fantasyData.currentWeek;
  el.innerHTML = `
    <div class="section-title">🏀 Fantasy Ekstraklasa</div>
    <div style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;margin-bottom:.9rem">
      <div style="font-size:.82rem;color:var(--muted)">${cw ? `Trwa <b style="color:var(--text)">Week ${cw}</b> · ` : ''}${_fxLockText()}</div>
      ${_isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .55rem" onclick="showToast('⏳ Przeliczam…','info');_pushDerived().then(()=>showToast('✅ Fantasy przeliczone: ' + (fantasyData?.players?.filter(p=>p.pos?.length).length||0) + ' zawodników z pozycją','success'))">🔄 Przelicz</button>
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .55rem" onclick="fxNotifyPositions()">📨 Przypomnij o pozycjach</button>` : ''}
      <details style="font-size:.78rem"><summary style="cursor:pointer;color:var(--accent);font-weight:700">📖 Zasady</summary>
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .9rem;margin-top:.4rem;line-height:1.55;max-width:560px">
          <b>Skład:</b> piątka po pozycjach — <b>PG, SG, SF, PF, C</b> — + 2 rezerwowych (dowolne pozycje) · <b>budżet ${R.budget} mln</b> · max <b>${R.maxPerTeam}</b> z jednej drużyny · <b>kapitan</b> (z piątki) ×2.<br>
          <b>Kolejka</b> = tydzień terminarza. Skład zamyka się w poniedziałek o 00:00 — kto nic nie zmieni, gra poprzednim. Zmiany po zamknięciu obowiązują od następnej kolejki.<br>
          <b>Rezerwowy</b> wchodzi sam, gdy ktoś z piątki nie zagrał w danym tygodniu (najpierw pierwszy, potem drugi).<br>
          <b>Punkty za mecz:</b> punkt 1 · zbiórka 1,2 · asysta 1,5 · przechwyt 3 · blok 3 · strata −1 · wygrana drużyny +2 · double-double +3 / triple-double +5 · ocena 2K od +3 (A+) do −2 (F). Punkty z wszystkich meczów tygodnia się sumują.<br>
          <b>Pozycja</b> zawodnika = pozycje, na których grał w min. 25% ostatnich 20 meczów (np. SG/SF). Debiutant bez danych pasuje wszędzie.<br>
          <b>Ceny</b> 4–15 mln z formy (ostatnie 10 meczów, świeższe ważą więcej), aktualizowane w poniedziałek. Debiutant bez meczów: 5 mln.
        </div></details>
    </div>
    <div style="display:flex;gap:.2rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.2rem;margin-bottom:1rem;width:fit-content">
      ${tab('squad', '🧩 Mój skład')}${tab('market', '💰 Rynek')}${tab('board', '🏆 Ranking')}
    </div>
    <div id="fx-body"></div>`;
  const body = document.getElementById('fx-body');
  if(_fx.tab === 'squad') body.innerHTML = _fxSquadHtml();
  else if(_fx.tab === 'market') body.innerHTML = _fxMarketHtml();
  else body.innerHTML = _fxBoardHtml();
}
function _fxCard(k, where, idx) {
  const d = _fxDraft();
  const slot = where === 'starters' ? FX_SLOTS[idx] : null;
  if(!k) return `<button onclick="_fx.slot={where:'${where}',idx:${idx}};_fx.pos='${slot || ''}';_fx.tab='market';renderFantasy()" style="min-height:118px;border:2px dashed var(--border);border-radius:12px;background:transparent;color:var(--muted);cursor:pointer;font-family:inherit;font-size:.8rem">${slot ? `<b style="font-size:1.2rem;color:var(--accent)">${slot}</b><br>➕ Dodaj` : '➕<br>Dodaj rezerwowego'}</button>`;
  const p = _fxP(k);
  if(!p) return `<div style="min-height:118px;border:1px solid var(--loss);border-radius:12px;padding:.5rem;font-size:.75rem;color:var(--loss)">Zawodnik spoza ligi<br><button class="btn btn-ghost" style="font-size:.7rem" onclick="fxRemove('${k}')">Usuń</button></div>`;
  const cap = d.captain === k;
  const delta = p.price - p.prevPrice;
  const bad = slot && !_fxElig(p, slot);
  return `<div style="position:relative;min-height:118px;border:1px solid ${bad ? 'var(--loss)' : cap ? 'var(--accent)' : 'var(--border)'};background:${cap ? 'rgba(245,197,24,.08)' : 'var(--surface)'};border-radius:12px;padding:.55rem .5rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.2rem">
    <button onclick="fxRemove('${k}')" title="Usuń" style="position:absolute;top:4px;right:6px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:.85rem">✕</button>
    ${slot ? `<span style="position:absolute;top:5px;left:7px;font-size:.66rem;font-weight:900;color:${bad ? 'var(--loss)' : 'var(--accent)'}">${slot}</span>` : ''}
    ${teamLogo(p.team, 30, '.6rem')}
    <div style="font-weight:800;font-size:.82rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(p.name)}</div>
    <div style="font-size:.66rem;color:var(--muted);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(p.team)} · ${_fxPosTxt(p)}</div>
    ${bad ? `<div style="font-size:.62rem;color:var(--loss);font-weight:700">nie gra na ${slot}</div>` : ''}
    <div style="font-size:.72rem"><b style="color:var(--accent)">${p.price} mln</b>${delta ? ` <span style="color:${delta > 0 ? 'var(--win)' : 'var(--loss)'}">${delta > 0 ? '▲' : '▼'}${Math.abs(delta)}</span>` : ''} · ⌀ ${p.avg}</div>
    ${where === 'starters' ? `<button onclick="fxCaptain('${k}')" style="margin-top:.15rem;font-size:.66rem;font-weight:800;border-radius:999px;padding:.08rem .5rem;cursor:pointer;font-family:inherit;border:1px solid ${cap ? 'var(--accent)' : 'var(--border)'};background:${cap ? 'var(--accent)' : 'transparent'};color:${cap ? 'rgba(0,0,0,.88)' : 'var(--muted)'}">${cap ? 'Ⓒ KAPITAN ×2' : 'Ⓒ zrób kapitanem'}</button>`
      : `<div style="display:flex;gap:.2rem;margin-top:.15rem"><button onclick="fxBenchMove(${idx},-1)" ${idx === 0 ? 'disabled' : ''} class="btn btn-ghost" style="font-size:.6rem;padding:.05rem .35rem">▲</button><span style="font-size:.62rem;color:var(--muted)">${idx + 1}. zmiennik</span><button onclick="fxBenchMove(${idx},1)" ${idx === 1 ? 'disabled' : ''} class="btn btn-ghost" style="font-size:.6rem;padding:.05rem .35rem">▼</button></div>`}
  </div>`;
}
// 📊 TRACKER FANTASY — statystyki i boxscore zawodników z Twojego składu w wybranej kolejce
function _fxTrackerHtml() {
  if(!discordUser || !fantasyData?.weekBoards) return '';
  const weeks = Object.keys(fantasyData.weekBoards).map(Number).filter(w => fantasyData.weekBoards[w]?.some(x => x.id === discordUser.id)).sort((a, b) => b - a);
  if(!weeks.length) return '';
  const w = weeks.includes(+_fx.trackWeek) ? +_fx.trackWeek : weeks[0];
  const me = fantasyData.weekBoards[w].find(x => x.id === discordUser.id);
  const sid = currentSeasonId || null, ws = (schedule || []).filter(s => s.generated && (s.seasonId || null) === sid && +s.week === w && s.weekStart).map(s => s.weekStart).sort()[0];
  const we = ws ? _ssAddDays(ws, 7) : null;
  const games = ws ? _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid && String(m.date) >= ws && String(m.date) < we)) : [];
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const rows = me.lineup.map(l => {
    const name = _fxP(l.key)?.name || l.key;
    const perf = games.flatMap(m => [[m.team1, m.team2], [m.team2, m.team1]].map(([t, o]) => { const p = (t.players || []).find(x => _mpSame(x.name, name)); return p ? { m, t, o, p, won: +t.score > +o.score } : null; }).filter(Boolean));
    const S = k => perf.reduce((n, g) => n + (+g.p[k] || 0), 0);
    return { l, name, perf, tot: { pts: S('pts'), reb: S('reb'), ast: S('ast'), stl: S('stl'), blk: S('blk'), to: S('to'), fgm: S('fgm'), fga: S('fga') } };
  });
  const th = 'padding:.35rem .4rem;font-size:.66rem;font-weight:800;letter-spacing:.5px;color:var(--muted);text-align:right', td = 'padding:.35rem .4rem;text-align:right';
  return `<div class="card" style="padding:.7rem .9rem;margin-bottom:1rem" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.4rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">📊 ${_g('TRACKER STATYSTYK', 'STATS TRACKER')}</div>
      <select onchange="_fx.trackWeek=this.value;renderFantasy()" style="font-size:.76rem;padding:.2rem .4rem;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text)">${weeks.map(x => `<option value="${x}" ${x === w ? 'selected' : ''}>Week ${x}</option>`).join('')}</select></div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.8rem;min-width:560px">
      <thead><tr><th style="${th};text-align:left">${_g('ZAWODNIK', 'PLAYER')}</th><th style="${th}">${_g('M', 'G')}</th><th style="${th}">PTS</th><th style="${th}">REB</th><th style="${th}">AST</th><th style="${th}">STL</th><th style="${th}">BLK</th><th style="${th}">TO</th><th style="${th}">FG</th><th style="${th};color:var(--accent)">FANTASY</th></tr></thead>
      <tbody>${rows.map((r, i) => `
        <tr style="border-top:1px solid var(--border);cursor:${r.perf.length ? 'pointer' : 'default'}" onclick="const x=document.getElementById('fxtr-${i}'); if(x) x.style.display = x.style.display === 'none' ? '' : 'none'">
          <td style="padding:.4rem;font-weight:700;text-align:left">${r.l.cap ? '<span title="Kapitan ×2" style="color:var(--accent)">Ⓒ</span> ' : ''}${r.l.sub ? '<span title="Wszedł z ławki">🔄</span> ' : ''}${_h(r.name)}${r.perf.length ? ' <span style="color:var(--muted);font-size:.7rem">▾</span>' : ''}</td>
          <td style="${td}">${r.perf.length}</td><td style="${td}">${r.tot.pts}</td><td style="${td}">${r.tot.reb}</td><td style="${td}">${r.tot.ast}</td><td style="${td}">${r.tot.stl}</td><td style="${td}">${r.tot.blk}</td><td style="${td}">${r.tot.to}</td>
          <td style="${td}">${r.tot.fga ? r.tot.fgm + '/' + r.tot.fga : '—'}</td><td style="${td};font-weight:900;color:var(--accent)">${f1(r.l.pts)}</td></tr>
        ${r.perf.length ? `<tr id="fxtr-${i}" style="display:none"><td colspan="10" style="padding:0 .4rem .5rem 1.2rem">${r.perf.map(g => `<div style="display:flex;flex-wrap:wrap;gap:.25rem .8rem;font-size:.74rem;padding:.3rem 0;border-bottom:1px dashed var(--border)">
            <span style="color:var(--muted)">${_ssFmt(g.m.date)}</span><span>vs <b>${_h(g.o.name)}</b> ${g.t.score}:${g.o.score} ${g.won ? '<span style="color:var(--win)">W</span>' : '<span style="color:var(--loss)">P</span>'}</span>
            <span>${+g.p.pts || 0} PTS · ${+g.p.reb || 0} REB · ${+g.p.ast || 0} AST · ${+g.p.stl || 0} STL · ${+g.p.blk || 0} BLK · ${+g.p.to || 0} TO${g.p.fga ? ` · ${+g.p.fgm || 0}/${g.p.fga} FG` : ''}${g.p.grade ? ` · ${_g('ocena', 'grade')} ${_h(g.p.grade)}` : ''}</span>
            <b style="color:var(--accent);margin-left:auto">${f1(_fxPoints({ pts: +g.p.pts || 0, reb: +g.p.reb || 0, ast: +g.p.ast || 0, stl: +g.p.stl || 0, blk: +g.p.blk || 0, to: +g.p.to || 0, grade: g.p.grade }, g.won))} ${_g('pkt', 'pts')}</b></div>`).join('')}</td></tr>` : ''}`).join('')}
      </tbody>
      <tfoot><tr style="border-top:2px solid var(--border)"><td style="padding:.45rem .4rem;font-weight:800;text-align:left" colspan="9">${_g('Razem', 'Total')} Week ${w}</td><td style="${td};font-weight:900;color:var(--accent)">${f1(me.pts)}</td></tr></tfoot>
    </table></div>
    <div style="font-size:.66rem;color:var(--muted);margin-top:.35rem">${_g('Kliknij zawodnika, żeby zobaczyć boxscore każdego meczu. Ⓒ kapitan (punkty ×2) · 🔄 wszedł z ławki. Punkty fantasy w kolumnie po prawej uwzględniają kapitana.', 'Click a player to see the box score of each game. Ⓒ captain (points ×2) · 🔄 came off the bench. Fantasy points on the right include the captain bonus.')}</div>
  </div>`;
}
function _fxSquadHtml() {
  if(!discordUser) return `<div class="card" style="padding:1.6rem;text-align:center"><div style="font-size:.88rem;color:var(--muted);margin-bottom:.8rem">Zaloguj się przez Discord, żeby zbudować swój skład.</div><button class="btn btn-primary" onclick="loginWithDiscord()">Zaloguj przez Discord</button></div>`;
  const R = fantasyData.rules, d = _fxDraft();
  const cost = _fxCost(d), left = Math.round((R.budget - cost) * 10) / 10;
  const tc = _fxTeamCount(d);
  const errs = [];
  if(cost > R.budget) errs.push(`Przekroczony budżet o ${Math.round((cost - R.budget) * 10) / 10} mln`);
  Object.entries(tc).filter(([, n]) => n > R.maxPerTeam).forEach(([t]) => errs.push(`Za dużo zawodników z ${t} (max ${R.maxPerTeam})`));
  if(_fxFilled(d).length === 5 && !d.starters.includes(d.captain)) errs.push('Wybierz kapitana z piątki (Ⓒ)');
  const wrongPos = d.starters.map((k, i) => k && !_fxElig(_fxP(k), FX_SLOTS[i]) ? FX_SLOTS[i] : null).filter(Boolean);
  if(wrongPos.length) errs.push(`Zawodnicy nie pasują do pozycji: ${wrongPos.join(', ')} — użyj „🔀 Ułóż na pozycjach”`);
  const complete = _fxFilled(d).length === 5 && d.bench.length === 2;
  const canSave = complete && !errs.length && _fxDirty();
  const me = fantasyData.season?.find(x => x.id === discordUser.id);
  const rank = fantasyData.season ? fantasyData.season.findIndex(x => x.id === discordUser.id) + 1 : 0;
  const cw = fantasyData.currentWeek;
  const myWeek = cw ? fantasyData.weekBoards?.[cw]?.find(x => x.id === discordUser.id) : null;
  const pct = Math.min(100, cost / R.budget * 100);
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;margin-bottom:1rem">
      <div class="card" style="padding:.7rem .9rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted)">SEZON</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;color:var(--accent)">${me ? me.pts : 0} pkt</div><div style="font-size:.72rem;color:var(--muted)">${rank ? rank + '. miejsce z ' + fantasyData.season.length : 'jeszcze bez punktów'}</div></div>
      <div class="card" style="padding:.7rem .9rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted)">${cw ? 'WEEK ' + cw + ' (NA ŻYWO)' : 'TEN TYDZIEŃ'}</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900">${myWeek ? myWeek.pts : '—'} ${myWeek ? 'pkt' : ''}</div><div style="font-size:.72rem;color:var(--muted)">${myWeek ? 'skład zamknięty w poniedziałek' : 'skład zacznie punktować od kolejnej kolejki'}</div></div>
      <div class="card" style="padding:.7rem .9rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted)">BUDŻET</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;color:${cost > R.budget ? 'var(--loss)' : 'var(--text)'}">${cost} / ${R.budget} mln</div>
        <div style="height:6px;border-radius:3px;background:var(--surface2);overflow:hidden;margin-top:.25rem"><div style="height:100%;width:${pct}%;background:${cost > R.budget ? 'var(--loss)' : 'var(--accent)'}"></div></div><div style="font-size:.72rem;color:var(--muted);margin-top:.2rem">zostało ${left} mln</div></div>
    </div>
    ${myWeek ? `<div class="card" style="padding:.6rem .9rem;margin-bottom:1rem"><div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">TWOJA PIĄTKA W WEEK ${cw}</div>
      <div style="display:flex;flex-wrap:wrap;gap:.4rem">${myWeek.lineup.map(l => `<span style="font-size:.76rem;border:1px solid ${l.cap ? 'var(--accent)' : 'var(--border)'};border-radius:999px;padding:.12rem .55rem">${l.cap ? 'Ⓒ ' : ''}${l.sub ? '🔄 ' : ''}${_h(_fxP(l.key)?.name || l.key)} <b>${l.pts}</b></span>`).join('')}</div></div>` : ''}
    ${_fxTrackerHtml()}
    ${_fxNeedsRedo() ? `<div style="background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.55);border-radius:10px;padding:.6rem .8rem;margin-bottom:.8rem;font-size:.82rem;line-height:1.5">
      ⚠️ <b>Zmiana zasad — ułóż skład na nowo.</b> Pierwsza piątka jest teraz po pozycjach (PG, SG, SF, PF, C), a pozycje zawodników liczą się z meczów w NBA 2K27.
      W Week 2 Twój skład punktuje jeszcze normalnie, ale <b>od Week ${fantasyData?.rules?.posFromWeek || 3} skład sprzed zmiany nie zdobywa punktów</b> — ułóż piątkę (możesz użyć „🔀 Ułóż na pozycjach”) i kliknij <b>💾 Zapisz skład</b> przed poniedziałkiem 00:00.</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">PIERWSZA PIĄTKA · PG · SG · SF · PF · C</div>
      ${_fxFilled(d).length ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .5rem" onclick="fxAutoArrange()">🔀 Ułóż na pozycjach</button>` : ''}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.5rem;margin-bottom:.8rem">
      ${[0, 1, 2, 3, 4].map(i => _fxCard(d.starters[i], 'starters', i)).join('')}
    </div>
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">REZERWOWI</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.5rem;margin-bottom:.8rem;max-width:280px">
      ${[0, 1].map(i => _fxCard(d.bench[i], 'bench', i)).join('')}
    </div>
    ${errs.length ? `<div style="font-size:.78rem;color:var(--loss);margin-bottom:.5rem">⚠️ ${errs.map(_h).join(' · ')}</div>` : ''}
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
      <button class="btn btn-primary" ${canSave ? '' : 'disabled style="opacity:.45"'} onclick="fxSave()">💾 Zapisz skład</button>
      ${mySquad && _fxDirty() && !_fxNeedsRedo() ? `<button class="btn btn-ghost" onclick="_fx.draft=null;renderFantasy()">↩ Cofnij zmiany</button>` : ''}
      <span style="font-size:.74rem;color:var(--muted)">${mySquad && !_fxDirty() ? `✓ Zapisany ${new Date(mySquad.at).toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : complete ? '' : 'Uzupełnij piątkę (PG, SG, SF, PF, C) + 2 rezerwowych'} ${fantasyData.nextWeek ? `· zapis obowiązuje od Week ${fantasyData.nextWeek}` : ''}</span>
    </div>`;
}
function _fxMarketHtml() {
  const R = fantasyData.rules, d = _fxDraft();
  const inSquad = new Set([...d.starters, ...d.bench]);
  const tc = _fxTeamCount(d), cost = _fxCost(d);
  const teamsL = [...new Set(fantasyData.players.map(p => p.team))].sort((a, b) => a.localeCompare(b, 'pl'));
  let list = fantasyData.players.filter(p => (!_fx.team || p.team === _fx.team) && (!_fx.pos || _fxElig(p, _fx.pos)) && (!_fx.q || p.name.toLowerCase().includes(_fx.q.toLowerCase())));
  const sorters = { price: (a, b) => b.price - a.price, cheap: (a, b) => a.price - b.price, avg: (a, b) => b.avg - a.avg, value: (a, b) => (b.avg / b.price) - (a.avg / a.price), last: (a, b) => (b.last ?? -99) - (a.last ?? -99) };
  list.sort(sorters[_fx.sort] || sorters.price);
  const slot = _fx.slot;
  const target = slot?.where || (_fxFilled(d).length < 5 ? 'starters' : 'bench');
  const slotPos = slot?.where === 'starters' ? FX_SLOTS[slot.idx] : null;
  const posChip = (v, l) => `<button onclick="_fx.pos='${v}';renderFantasy()" style="font-size:.72rem;padding:.2rem .55rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${_fx.pos === v ? 'var(--accent)' : 'var(--border)'};background:${_fx.pos === v ? 'rgba(245,197,24,.15)' : 'transparent'};color:${_fx.pos === v ? 'var(--accent)' : 'var(--text)'};font-weight:700">${l}</button>`;
  const sel = 'width:auto;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .4rem;font-size:.78rem';
  return `
    ${discordUser ? `<div style="font-size:.78rem;margin-bottom:.6rem">Dodajesz do: <b>${slotPos ? 'piątki na pozycję ' + slotPos : target === 'starters' ? 'pierwszej piątki' : 'rezerwowych'}</b> · budżet: <b style="color:${cost > R.budget ? 'var(--loss)' : 'var(--accent)'}">${cost}/${R.budget} mln</b> · skład ${_fxFilled(d).length + d.bench.length}/7
      <button class="btn btn-ghost" style="font-size:.7rem;padding:.15rem .5rem;margin-left:.3rem" onclick="_fx.tab='squad';_fx.slot=null;renderFantasy()">← Mój skład</button></div>` : ''}
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.5rem">${posChip('', 'Wszystkie')}${FX_SLOTS.map(x => posChip(x, x)).join('')}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.6rem">
      <input value="${_h(_fx.q)}" oninput="_fx.q=this.value;clearTimeout(window._fxT);window._fxT=setTimeout(renderFantasy,250)" placeholder="Szukaj zawodnika…" style="${_MODAL_INP};max-width:200px">
      <select onchange="_fx.team=this.value;renderFantasy()" style="${sel}"><option value="">Wszystkie drużyny</option>${teamsL.map(t => `<option ${t === _fx.team ? 'selected' : ''}>${_h(t)}</option>`).join('')}</select>
      <select onchange="_fx.sort=this.value;renderFantasy()" style="${sel}">
        ${[['price', 'Najdrożsi'], ['cheap', 'Najtańsi'], ['avg', 'Najlepsza średnia'], ['value', 'Punkty za mln'], ['last', 'Ostatni mecz']].map(([v, l]) => `<option value="${v}" ${_fx.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    </div>
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      ${list.slice(0, 200).map(p => {
        const delta = p.price - p.prevPrice;
        let why = '';
        if(inSquad.has(p.key)) why = 'w składzie';
        else if(slotPos && !_fxElig(p, slotPos)) why = 'nie gra na ' + slotPos;
        else if(_fxFilled(d).length + d.bench.length >= 7 && !slot) why = 'skład pełny';
        else if((tc[p.team] || 0) >= R.maxPerTeam) why = `już ${R.maxPerTeam} z ${p.team}`;
        else if(cost + p.price > R.budget + 1e-9) why = 'za drogi';
        return `<div style="display:grid;grid-template-columns:26px 1fr auto auto;gap:.55rem;align-items:center;padding:.45rem .7rem;border-bottom:1px solid var(--border)">
          ${teamLogo(p.team, 24, '.5rem')}
          <div style="min-width:0"><div style="font-weight:700;font-size:.84rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(p.name)}</div>
            <div style="font-size:.68rem;color:var(--muted)"><b style="color:var(--accent)">${_fxPosTxt(p)}</b> · ${_h(p.team)} · ⌀ ${p.avg} pkt · ${p.gp} ${_plPL(p.gp, 'mecz', 'mecze', 'meczów')} w sezonie${p.last != null ? ' · ostatni ' + p.last : ''}${p.gp === 0 && !p.avg ? ' · 🐴 debiutant' : ''}</div></div>
          <div style="text-align:right;font-size:.82rem"><b style="color:var(--accent)">${p.price} mln</b>${delta ? `<div style="font-size:.66rem;color:${delta > 0 ? 'var(--win)' : 'var(--loss)'}">${delta > 0 ? '▲' : '▼'} ${Math.abs(delta)}</div>` : ''}</div>
          ${discordUser ? (why ? `<span style="font-size:.66rem;color:var(--muted);min-width:70px;text-align:right">${why}</span>`
            : `<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .55rem;min-width:70px" onclick="fxAdd('${p.key}')">+ Dodaj</button>`) : ''}
        </div>`;
      }).join('') || '<div style="padding:1rem;text-align:center;color:var(--muted)">Brak zawodników</div>'}
    </div>`;
}
function _fxBoardHtml() {
  const weeksStarted = (fantasyData.weeks || []).filter(w => new Date(w.lock) <= Date.now()).map(w => w.week);
  const sel = _fx.board;
  const list = sel === 'season' ? (fantasyData.season || []) : (fantasyData.weekBoards?.[sel] || []);
  const me = discordUser?.id;
  const chip = (v, l) => `<button onclick="_fx.board=${v === 'season' ? "'season'" : v};_fx.open=null;renderFantasy()" style="font-size:.74rem;padding:.25rem .65rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${sel === v ? 'var(--accent)' : 'var(--border)'};background:${sel === v ? 'rgba(245,197,24,.15)' : 'transparent'};color:${sel === v ? 'var(--accent)' : 'var(--text)'}">${l}</button>`;
  return `<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.7rem">${chip('season', '🏆 Sezon')}${weeksStarted.map(w => chip(w, 'Week ' + w + (w === fantasyData.currentWeek ? ' 🔴' : ''))).join('')}</div>
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      ${list.map((x, i) => {
        const open = _fx.open === x.id && x.lineup;
        return `<div onclick="${x.lineup ? `_fx.open=_fx.open==='${x.id}'?null:'${x.id}';renderFantasy()` : ''}" style="cursor:${x.lineup ? 'pointer' : 'default'};padding:.45rem .8rem;border-bottom:1px solid var(--border);${x.id === me ? 'background:rgba(245,197,24,.08)' : ''}">
          <div style="display:grid;grid-template-columns:30px 26px 1fr auto;gap:.55rem;align-items:center">
            <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(x.avatar, 24)}
            <span style="font-weight:${x.id === me ? 800 : 600};font-size:.86rem">${_h(x.name)}${x.id === me ? ' (Ty)' : ''}</span>
            <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.15rem;color:${x.invalid ? 'var(--loss)' : 'var(--accent)'}" ${x.invalid ? 'title="Skład sprzed zmiany zasad — nie punktuje"' : ''}>${x.invalid ? '⚠ 0' : x.pts}</b>
          </div>
          ${open ? `<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin:.45rem 0 .1rem 3.5rem">${x.lineup.map(l => `<span style="font-size:.72rem;border:1px solid ${l.cap ? 'var(--accent)' : 'var(--border)'};border-radius:999px;padding:.1rem .5rem">${l.cap ? 'Ⓒ ' : ''}${l.sub ? '🔄 ' : ''}${_h(_fxP(l.key)?.name || l.key)} <b>${l.pts}</b></span>`).join('')}</div>` : ''}
        </div>`;
      }).join('') || `<div style="padding:1.2rem;text-align:center;color:var(--muted)">${sel === 'season' ? 'Jeszcze nikt nie zbudował składu — bądź pierwszy!' : 'Brak wyników w tej kolejce'}</div>`}
    </div>
    ${sel !== 'season' ? '<div style="font-size:.68rem;color:var(--muted);margin-top:.4rem">Kliknij gracza, żeby zobaczyć jego piątkę (Ⓒ kapitan ×2, 🔄 zmiennik).</div>' : ''}`;
}
function fxAdd(key) {
  if(!_ensureSession()) return;
  const d = _fxDraft(), slot = _fx.slot, p = _fxP(key);
  let placed = false;
  if(slot?.where === 'starters') {
    if(!_fxElig(p, FX_SLOTS[slot.idx])) { showToast(`${p.name} nie gra na ${FX_SLOTS[slot.idx]} (gra: ${_fxPosTxt(p)})`, 'error'); return; }
    d.starters[slot.idx] = key; placed = true;
  } else if(slot?.where === 'bench') {
    if(d.bench[slot.idx]) d.bench[slot.idx] = key; else d.bench.push(key);
    placed = true;
  } else {
    // pierwsze wolne miejsce w piątce, na które zawodnik pasuje; potem ławka
    const i = FX_SLOTS.findIndex((x, n) => !d.starters[n] && _fxElig(p, x));
    if(i >= 0) { d.starters[i] = key; placed = true; }
    else if(d.bench.length < 2) { d.bench.push(key); placed = true; }
  }
  if(!placed) { showToast('Brak wolnego miejsca na tej pozycji — kliknij puste miejsce albo usuń kogoś', 'info'); return; }
  if(d.starters.includes(key) && !d.captain) d.captain = key;
  _fx.slot = null;
  const full = _fxFilled(d).length === 5 && d.bench.length === 2;
  if(full || slot) { _fx.tab = 'squad'; _fx.pos = ''; }
  renderFantasy();
  showToast(`➕ ${p.name} — ${full ? 'skład kompletny, zapisz go' : 'dodany'}`, 'success');
}
function fxRemove(key) {
  const d = _fxDraft();
  d.starters = d.starters.map(k => k === key ? null : k); d.bench = d.bench.filter(k => k !== key);
  if(d.captain === key) d.captain = _fxFilled(d)[0] || null;
  renderFantasy();
}
function fxCaptain(key) { _fxDraft().captain = key; renderFantasy(); }
function fxBenchMove(i, dir) { const b = _fxDraft().bench; const j = i + dir; if(j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; renderFantasy(); }
// Admin: prywatne przypomnienia dla osób, których zapisany skład nie pasuje do pozycji
async function fxNotifyPositions() {
  const pre = await _api('/fantasy-notify', 'POST', { dryRun: true }, { admin: true });
  if(!pre.ok) { showToast('❌ ' + pre.error, 'error'); return; }
  if(!pre.total) { showToast('✅ Wszystkie zapisane składy pasują do pozycji', 'success'); return; }
  if(!confirm(`Składy niepasujące do pozycji: ${pre.total}\n${pre.names.slice(0, 15).join(', ')}${pre.total > 15 ? '…' : ''}\n\nWysłać im prywatną wiadomość na Discordzie?`)) return;
  let offset = 0, sent = 0, failed = 0;
  for(let i = 0; i < 20; i++) {
    showToast(`⏳ Wysyłam… ${offset}/${pre.total}`, 'info');
    const r = await _api('/fantasy-notify', 'POST', { offset }, { admin: true });
    if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
    sent += r.sent; failed += r.failed; offset = r.done;
    if(!r.more) break;
  }
  showToast(`📨 Wysłano: ${sent}${failed ? ` · nie doszło: ${failed} (zamknięte DM)` : ''}`, failed ? 'info' : 'success');
}
async function fxSave() {
  if(!_ensureSession()) return;
  const d = _fxDraft();
  const res = await _api('/fantasy-squad', 'POST', { starters: d.starters, bench: d.bench, captain: d.captain }, { session: true });
  if(!res.ok && /pozycji/.test(res.error || '')) { showToast('❌ ' + res.error + ' — spróbuj „🔀 Ułóż na pozycjach”', 'error'); return; }
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  mySquad = res.squad; _fx.draft = null;
  if(fantasyData && !fantasyData.season.some(x => x.id === discordUser.id)) fantasyData.season.push({ id: discordUser.id, name: discordUser.name, avatar: discordUser.avatar, pts: 0, perWeek: {} });
  renderFantasy();
  showToast(`✅ Skład zapisany — obowiązuje od Week ${res.appliesFrom}`, 'success');
}
function _rxRefresh(key) { document.querySelectorAll(`[data-rx="${key}"]`).forEach(el => { el.outerHTML = _reactBar(key); }); }
async function rxToggle(key, emoji) {
  if(!_ensureSession()) return;
  const e = reactionsData[key] = reactionsData[key] || { r: {}, c: [] };
  const list = e.r[emoji] = e.r[emoji] || [];
  const i = list.indexOf(discordUser.id); i >= 0 ? list.splice(i, 1) : list.push(discordUser.id);
  _rxRefresh(key);
  const res = await _api('/react', 'POST', { key, emoji }, { session: true });
  if(res.ok) reactionsData[key] = res.entry; else showToast('❌ ' + res.error, 'error');
  _rxRefresh(key);
}
function rxToggleComments(key) { _rxOpen.has(key) ? _rxOpen.delete(key) : _rxOpen.add(key); _rxRefresh(key); }
async function rxPost(key) {
  if(!_ensureSession()) return;
  const el = document.getElementById('rx-in-' + key), text = (el?.value || '').trim();
  if(text.length < 2) return;
  const res = await _api('/comment', 'POST', { key, text }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  reactionsData[key] = res.entry; _rxRefresh(key);
}
async function rxDelete(key, id) {
  if(!confirm('Usunąć komentarz?')) return;
  const res = await _api('/comment', 'DELETE', { key, id }, _isLoggedInSync() ? { admin: true, session: true } : { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  reactionsData[key] = res.entry; _rxRefresh(key);
}
function openRivalry(a, b) {
  const games = _h2hGames(a, b);
  const side = (m, t) => String(m.team1.name).toLowerCase() === String(t).toLowerCase() ? [m.team1, m.team2] : [m.team2, m.team1];
  let wA = 0, wB = 0, pA = 0, pB = 0, bigA = null, bigB = null;
  const perEd = {};
  const top = {};
  games.forEach(m => {
    const [x, y] = side(m, a);
    const ed = _editionOf(m.seasonId); const e = perEd[ed] = perEd[ed] || { a: 0, b: 0 };
    if((+x.score || 0) > (+y.score || 0)) { wA++; e.a++; if(!bigA || x.score - y.score > bigA.d) bigA = { d: x.score - y.score, m }; }
    else { wB++; e.b++; if(!bigB || y.score - x.score > bigB.d) bigB = { d: y.score - x.score, m }; }
    pA += +x.score || 0; pB += +y.score || 0;
    [[x, a], [y, b]].forEach(([t, tn]) => (t.players || []).forEach(p => {
      const k = _normNick(p.name); const o = top[k] = top[k] || { name: p.name, team: tn, gp: 0, pts: 0, best: 0 };
      o.gp++; o.pts += p.pts || 0; o.best = Math.max(o.best, p.pts || 0);
    }));
  });
  let streak = 0, streakT = null;
  for(const m of games) { const [x, y] = side(m, a); const w = (+x.score || 0) > (+y.score || 0) ? a : b; if(!streakT) streakT = w; if(w !== streakT) break; streak++; }
  const n = games.length, f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const leaders = Object.values(top).filter(p => p.gp >= Math.max(1, Math.ceil(n * 0.3))).sort((x, y) => y.pts / y.gp - x.pts / x.gp).slice(0, 5);
  const big = (o, t) => o ? `${_h(t)} ${o.m.team1.name === t ? o.m.team1.score + ':' + o.m.team2.score : o.m.team2.score + ':' + o.m.team1.score} (${_ssFmt(o.m.date)})` : '—';
  const md = _fxModal('rivalry-modal', 640);
  md.querySelector('.modal').innerHTML = _fxHead('rivalry-modal', `⚔️ ${_rivName(a, b) ? _h(_rivName(a, b)) : 'Rywalizacja'}${_isClassic(a, b) ? ' · 🔥 Klasyk' : ''}`) + (n ? _rivalryExtras(a, b) + `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.8rem;margin-bottom:.9rem">
      <div style="text-align:center;cursor:pointer" onclick="openTeamModal(this.dataset.t)" data-t="${_h(a)}">${teamLogo(a, 54, '1rem')}<div style="font-weight:800;margin-top:.3rem">${_h(a)}</div></div>
      <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.4rem;line-height:1">${wA} : ${wB}</div>
        <div style="font-size:.7rem;color:var(--muted)">${n} ${_plPL(n, 'mecz', 'mecze', 'meczów')} · śr. ${f1(pA / n)}:${f1(pB / n)}</div></div>
      <div style="text-align:center;cursor:pointer" onclick="openTeamModal(this.dataset.t)" data-t="${_h(b)}">${teamLogo(b, 54, '1rem')}<div style="font-weight:800;margin-top:.3rem">${_h(b)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.5rem;margin-bottom:.8rem;font-size:.78rem">
      <div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem">🔥 <b>Seria:</b> ${streakT ? `${_h(streakT)} — ${streak} ${_plPL(streak, 'wygrana', 'wygrane', 'wygranych')} z rzędu` : '—'}</div>
      <div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem">💥 <b>Najwyższa wygrana:</b><br>${big(bigA, a)}<br>${big(bigB, b)}</div>
      <div style="background:var(--surface2);border-radius:8px;padding:.5rem .65rem">📅 <b>Wg edycji:</b><br>${Object.entries(perEd).map(([ed, e]) => `${_h(ed)}: <b>${e.a}:${e.b}</b>`).join('<br>')}</div>
    </div>
    ${leaders.length ? `<div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">⭐ NAJLEPSI W TYCH STARCIACH (PTS/MECZ)</div>
      <div style="display:flex;flex-direction:column;gap:.2rem;margin-bottom:.8rem">${leaders.map(p => `<div onclick="openPlayerModal(this.dataset.p,this.dataset.t)" data-p="${_h(p.name)}" data-t="${_h(p.team)}" style="cursor:pointer;display:grid;grid-template-columns:1fr auto auto;gap:.6rem;font-size:.8rem;padding:.25rem .45rem;background:var(--surface2);border-radius:6px">
        <span><b>${_h(p.name)}</b> <span style="color:var(--muted);font-size:.7rem">${_h(p.team)}</span></span><span style="color:var(--muted)">${p.gp} GP · rekord ${p.best}</span><b style="color:var(--accent)">${f1(p.pts / p.gp)}</b></div>`).join('')}</div>` : ''}
    <div style="font-size:.66rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">OSTATNIE STARCIA</div>
    <div style="display:flex;flex-direction:column;gap:.2rem">${games.slice(0, 10).map(m => { const [x, y] = side(m, a); const wa = (+x.score || 0) > (+y.score || 0);
      return `<div onclick="_fxClose('rivalry-modal');openMatch(${JSON.stringify(m.id)})" style="cursor:pointer;display:grid;grid-template-columns:60px 1fr auto 1fr;gap:.5rem;align-items:center;font-size:.8rem;padding:.3rem .45rem;background:var(--surface2);border-radius:6px">
        <span style="color:var(--muted)">${_ssFmt(m.date)}</span><span style="text-align:right;font-weight:${wa ? 800 : 400}">${_h(a)}</span>
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1rem">${x.score}:${y.score}</b><span style="font-weight:${wa ? 400 : 800}">${_h(b)}</span></div>`; }).join('')}</div>`
    : `<div style="text-align:center;color:var(--muted);padding:1.5rem">${_h(a)} i ${_h(b)} jeszcze się nie spotkali. To będzie pierwsze starcie! ⚔️</div>`);
  md.classList.add('open');
}
async function predSave(sid) {
  if(!_ensureSession()) return;
  const body = { seasonId: sid };
  _predDefs().forEach(d => { body[d.k] = document.getElementById('pred-' + d.k)?.value || ''; });
  const res = await _api('/prediction', 'POST', body, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  myPredictions[sid] = res.pick; predictionsData[sid] = res.predictions;
  renderSeasonSchedule(); updateMyPanelBadge();
  showToast('🔮 Typy zapisane — powodzenia!', 'success');
}
async function predAdmin(sid, what) {
  const body = { seasonId: sid };
  if(what === 'lock') { const v = document.getElementById('pred-lock')?.value; body.lockAt = v ? new Date(v).toISOString() : null; }
  if(what === 'results') { body.results = {}; _predDefs().forEach(d => { body.results[d.k] = document.getElementById('pres-' + d.k)?.value || ''; }); if(!confirm('Rozliczyć typy przedsezonowe tymi wynikami?')) return; }
  if(what === 'clear') body.results = null;
  const res = await _api('/prediction/settings', 'POST', body, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  predictionsData[sid] = res.predictions; renderSeasonSchedule();
  showToast('✅ Zapisano', 'success');
}
