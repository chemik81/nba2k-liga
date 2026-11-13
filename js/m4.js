/*@v:af4a9d7b1a*/
// ═══ ZMIANA KAPITANA (admin) ═══════════════════════════════════
function _knownDiscordUsers() {
  const map = new Map();
  const add = (id, name) => { if(id && /^\d{15,21}$/.test(String(id)) && !map.has(String(id))) map.set(String(id), name || ''); };
  if(discordUser) add(discordUser.id, discordUser.name);
  freeAgents.forEach(f => add(f.discordId, f.name));
  teamRegistrations.forEach(r => add(r.captain?.id, r.captain?.name));
  (events || []).forEach(ev => (ev.players || []).forEach(p => add(p.id, p.name)));
  return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}
function openCaptainChange(regId) {
  const reg = teamRegistrations.find(r => r.id === regId);
  if(!reg) return;
  let m = document.getElementById('captain-modal');
  if(!m) {
    m = document.createElement('div');
    m.id = 'captain-modal';
    m.className = 'modal-overlay';
    m.style.zIndex = '1250';
    m.onclick = e => { if(e.target === m) m.classList.remove('open'); };
    m.innerHTML = '<div class="modal" style="max-width:520px"></div>';
    document.body.appendChild(m);
  }
  const inp = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.85rem;width:100%;box-sizing:border-box';
  const known = _knownDiscordUsers().filter(u => u.id !== reg.captain?.id);
  m.querySelector('.modal').innerHTML = `
    <button class="modal-close" onclick="document.getElementById('captain-modal').classList.remove('open')">&#x2715;</button>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:1px;margin-bottom:.3rem">👤 Zmień kapitana</div>
    <div style="font-size:.82rem;color:var(--muted);margin-bottom:1rem">${_h(reg.teamName)} · obecnie: <b style="color:var(--text)">${_h(reg.captain?.name || '?')}</b></div>

    ${known.length ? `
      <label style="display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">Wybierz z listy</label>
      <select onchange="if(this.value){document.getElementById('cap-id').value=this.value;document.getElementById('cap-name').value=this.options[this.selectedIndex].dataset.name||'';}" style="${inp};margin-bottom:.9rem">
        <option value="">— osoby znane stronie (agenci, kapitanowie, eventy) —</option>
        ${known.map(u => `<option value="${u.id}" data-name="${_h(u.name)}">${_h(u.name || u.id)}</option>`).join('')}
      </select>` : ''}

    <label style="display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">Discord ID nowego kapitana</label>
    <input id="cap-id" type="text" inputmode="numeric" placeholder="np. 712345678901234567" style="${inp};margin-bottom:.4rem">
    <div style="font-size:.72rem;color:var(--muted);line-height:1.45;margin-bottom:.9rem">
      Jak zdobyć ID: Discord → Ustawienia → Zaawansowane → włącz <b>Tryb dewelopera</b>. Potem prawy klik (na telefonie przytrzymaj) na nicku osoby → <b>Kopiuj ID użytkownika</b>.
    </div>
    <label style="display:block;font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">Nazwa (opcjonalnie)</label>
    <input id="cap-name" type="text" maxlength="40" placeholder="uzupełni się sama z Discorda" style="${inp};margin-bottom:1.1rem">

    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="document.getElementById('captain-modal').classList.remove('open')">Anuluj</button>
      <button class="btn btn-primary" onclick="saveCaptainChange('${reg.id}')">💾 Zapisz</button>
    </div>`;
  m.classList.add('open');
}
async function saveCaptainChange(regId) {
  const id = document.getElementById('cap-id').value.trim();
  const name = document.getElementById('cap-name').value.trim();
  if(!/^\d{15,21}$/.test(id)) { showToast('❌ Discord ID to 15–21 cyfr', 'error'); return; }
  const res = await _api('/team-registration', 'PATCH', { id: regId, captainId: id, captainName: name }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const reg = teamRegistrations.find(r => r.id === regId);
  if(reg) { Object.keys(reg).forEach(k => delete reg[k]); Object.assign(reg, res.registration); }
  document.getElementById('captain-modal').classList.remove('open');
  renderTeamRegistrations();
  renderSchedule();
  showToast('✅ Nowy kapitan: ' + (res.registration.captain?.name || id), 'success');
}
function _fxClose(id) { document.getElementById(id)?.classList.remove('open'); }
function _trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
async function ssRemindCaptains() {
  const ctx = _ssCtx();
  if(!confirm(`Wysłać prywatne przypomnienia do kapitanów, którzy nie wybrali terminu w Week ${_ssWeek}?`)) return;
  const res = await _api('/captain-remind', 'POST', { seasonId: ctx.seasonId, week: _ssWeek }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  if(!res.captains) { showToast('✅ Wszyscy kapitanowie wybrali już terminy', 'success'); return; }
  showToast(`🔔 Wysłano: ${res.sent}${res.failed ? ` · nieudane: ${res.failed} (zamknięte wiadomości prywatne)` : ''}`, res.failed ? 'info' : 'success');
}
function _reportAsAdmin(k) {
  // admin bez własnej drużyny w tym meczu → wynik zapisuje się od razu
  const ctx = _ssCtx(), s = _ssItem(k);
  const mine = ctx.myTeam && s && [s.team1, s.team2].some(t => String(t).toLowerCase() === ctx.myTeam.toLowerCase());
  return _isLoggedInSync() && !mine;
}
function openReportResult(k) {
  const s = _ssItem(k);
  if(!s) return;
  const asAdmin = _reportAsAdmin(k);
  if(!asAdmin && !_ensureSession()) return;
  const m = _fxModal('report-modal', 520);
  m.querySelector('.modal').innerHTML = _fxHead('report-modal', '📸 Zgłoś wynik meczu') + `
    <div style="font-size:.84rem;margin-bottom:.9rem">${_h(s.team1)} vs ${_h(s.team2)} · Week ${s.week}${(s.bestOf || 1) > 1 ? ' · Bo' + s.bestOf : ''}</div>
    <div style="font-size:.78rem;color:var(--muted);line-height:1.5;margin-bottom:.9rem">
      Wrzuć zrzut ekranu <b>Game Stats</b> po meczu (jeden mecz = jeden screen). AI odczyta wynik i statystyki.
      ${asAdmin ? '<b>Jako admin</b> — wynik zapisze się od razu (bez potwierdzania przez kapitanów).' : 'Kapitan rywala dostanie prośbę o potwierdzenie — wynik trafi do ligi po jego akceptacji.'}
    </div>
    <label style="display:block;border:2px dashed var(--border);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;margin-bottom:.9rem">
      <input type="file" id="report-file" accept="image/*" style="display:none" onchange="_reportPreview(this)">
      <div id="report-preview" style="font-size:.82rem;color:var(--muted)">🖼 Kliknij, aby wybrać screen</div>
    </label>
    ${(() => { const ids = (s.matchIds || (s.matchId ? [s.matchId] : [])), last = ids.length ? matches.find(x => String(x.id) === String(ids[ids.length - 1])) : null; if(!last) return '';
      return `<label style="display:flex;gap:.5rem;align-items:flex-start;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.35);border-radius:10px;padding:.55rem .7rem;margin-bottom:.8rem;cursor:pointer;font-size:.8rem;text-transform:none;letter-spacing:0;color:var(--text)">
        <input type="checkbox" id="report-merge" value="${last.id}" style="width:auto;margin:.15rem 0 0">
        <span>🔌 <b>${_g('To dogrywka po rozłączeniu', 'This is the rest of a disconnected game')}</b> — ${_g('dolicz wynik i statystyki do meczu', 'add the score and stats to the game')} <b>${_h(last.team1.name)} ${last.team1.score}:${last.team2.score} ${_h(last.team2.name)}</b>${_g(' (zamiast nowego meczu w serii). Kapitan rywala to potwierdza.', ' (instead of a new game in the series). The opposing captain confirms it.')}</span></label>`; })()}
    <div id="report-two-wrap" style="margin-bottom:.8rem">
      <button class="btn btn-ghost" style="font-size:.76rem" onclick="document.getElementById('report-two').style.display='block';this.style.display='none';document.getElementById('report-merge')?.closest('label')?.remove()">➕ ${_g('Dodaj drugi zrzut (mecz przerwany przez rozłączenie)', 'Add a second screenshot (game interrupted by a disconnect)')}</button>
      <label id="report-two" style="display:none;border:2px dashed rgba(245,197,24,.5);border-radius:10px;padding:.8rem;text-align:center;cursor:pointer">
        <input type="file" accept="image/*" style="display:none" onchange="_reportPreview2(this)">
        <div id="report-preview2" style="font-size:.8rem;color:var(--muted)">🔌 ${_g('Drugi zrzut — dogrywka po rozłączeniu. Wynik i statystyki obu części zostaną zsumowane w jeden mecz.', 'Second screenshot — the rest of the game after the disconnect. Both parts will be added up into one game.')}</div></label></div>
    <div id="report-status" style="font-size:.8rem;min-height:1.1em;margin-bottom:.6rem"></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="_fxClose('report-modal')">Anuluj</button>
      <button class="btn btn-primary" id="report-send" disabled style="opacity:.45" onclick="sendReportResult('${k}')">📤 Wyślij</button>
    </div>`;
  m.classList.add('open');
}
function _reportPreview2(input) { // drugi zrzut (mecz przerwany) — zmniejszony jak pierwszy
  const f = input.files?.[0]; if(!f) return; const reader = new FileReader();
  reader.onload = () => { const img = new Image(); img.onload = () => { const sc = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    _reportImage2 = c.toDataURL('image/jpeg', 0.9); document.getElementById('report-preview2').innerHTML = `<img src="${_reportImage2}" style="max-width:100%;max-height:180px;border-radius:6px"><div style="font-size:.74rem;margin-top:.3rem">🔌 ${_g('część 2', 'part 2')}</div>`; }; img.src = reader.result; };
  reader.readAsDataURL(f);
}
function _reportPreview(input) {
  const f = input.files?.[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Zmniejsz do 1600 px szerokości — szybciej i w limicie
      const sc = Math.min(1, 1600 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      _reportImage = c.toDataURL('image/jpeg', 0.9);
      document.getElementById('report-preview').innerHTML = `<img src="${_reportImage}" style="max-width:100%;max-height:220px;border-radius:6px">`;
      const btn = document.getElementById('report-send');
      btn.disabled = false; btn.style.opacity = '';
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
}
async function sendReportResult(k) {
  if(!_reportImage) return;
  const btn = document.getElementById('report-send'), st = document.getElementById('report-status');
  btn.disabled = true; btn.style.opacity = '.45';
  st.style.color = 'var(--muted)'; st.textContent = '⏳ AI odczytuje screen… (do 30 s)';
  const asAdmin = _reportAsAdmin(k);
  const mergeWith = !_reportImage2 && document.getElementById('report-merge')?.checked ? document.getElementById('report-merge').value : undefined;
  if(_reportImage2) st.textContent = '⏳ ' + _g('AI odczytuje oba zrzuty… (do 60 s)', 'AI is reading both screenshots… (up to 60 s)');
  const res = await _api('/captain-result', 'POST', { scheduleId: k, imageBase64: _reportImage.split(',')[1], mimeType: 'image/jpeg', ...(mergeWith ? { mergeWith } : {}), ...(_reportImage2 ? { imageBase64b: _reportImage2.split(',')[1] } : {}) }, asAdmin ? { admin: true } : { session: true });
  _reportImage2 = null;
  if(res.ok && res.accepted) {
    _reportImage = null;
    _fxClose('report-modal');
    const md = res.match;
    showToast(`✅ Zapisano: ${md.team1.name} ${md.team1.score}:${md.team2.score} ${md.team2.name}`, 'success');
    await loadData(); renderDashboard(); renderSchedule();
    _announceResult(md.id, res.schedule?.id || k);
    return;
  }
  if(!res.ok || !res.pending) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + (res.error || 'Błąd'); btn.disabled = false; btn.style.opacity = ''; return; }
  pendingResults.push(res.pending);
  _reportImage = null;
  _fxClose('report-modal');
  renderSeasonSchedule();
  const md = res.pending.matchData;
  showToast(`✅ Odczytano: ${md.team1.name} ${md.team1.score}:${md.team2.score} ${md.team2.name} — czeka na potwierdzenie rywala`, 'success');
}
// 🏀 Ogłoszenie wyniku na kanale wyników: plakat meczu + stan serii + MVP + fragment recapu
async function _announceResult(matchId, scheduleId, force) {
  // rezerwacja u Workera: brak dubli, a gdy przeglądarka nie zdąży (np. zamknięta karta) — po 10 min ogłosi Worker
  const auth = _isLoggedInSync() ? { admin: true } : { session: true };
  const claim = await _api('/result-announce', 'POST', { matchId, action: 'claim' }, auth).catch(() => null);
  if(claim?.skip && !force) return true;
  window._trOff = true;
  let ok = false;
  try { ok = await _announceResultInner(matchId, scheduleId); } finally { window._trOff = false; }
  _api('/result-announce', 'POST', { matchId, action: ok ? 'done' : 'release' }, auth).catch(() => {});
  return ok;
}
async function _announceResultInner(matchId, scheduleId) {
  try {
    const m = _withAllMatches(() => matches.find(x => String(x.id) === String(matchId)));
    if(!m) return false;
    const s = scheduleId ? _ssItem(String(scheduleId)) : null;
    const w1 = (m.team1.score || 0) > (m.team2.score || 0);
    const winner = w1 ? m.team1.name : m.team2.name;
    const res = s ? _ssResult({ demo: false }, s) : null;
    const mvp = _gameMvp(m);
    let series = '';
    if(s && (s.bestOf || 1) > 1 && res) {
      series = res.done ? `Spotkanie zakończone: ${_emo(s.team1)}**${s.team1} ${res.w1}:${res.w2} ${s.team2}** ${_emo(s.team2).trim()}` : `Stan spotkania (Bo${s.bestOf}): ${_emo(s.team1)}**${s.team1} ${res.w1}:${res.w2} ${s.team2}** ${_emo(s.team2).trim()}`;
    }
    const recap = m.recap ? String(m.recap).replace(/\s+/g, ' ').slice(0, 260) + (String(m.recap).length > 260 ? '…' : '') : '';
    try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
    const poster = await _matchPoster(m);
    const embed = {
      title: `🏀 ${m.team1.name} ${m.team1.score} : ${m.team2.score} ${m.team2.name}`,
      description: [
        s ? `Week ${s.week}${s.round ? ' · Kolejka ' + s.round : ''}` : '',
        `🏆 Wygrywa **${winner}**`,
        series,
        mvp ? `⭐ MVP: **${mvp.name}** (${mvp.team}) — ${mvp.pts || 0} PTS · ${mvp.reb || 0} REB · ${mvp.ast || 0} AST` : '',
        recap ? `\n📝 ${recap}` : ''
      ].filter(Boolean).join('\n'),
      url: location.origin + location.pathname + (s ? '#terminarz-week-' + s.week : ''),
      color: 0x16a34a, footer: { text: 'NBA 2K Pro-Am Ekstraklasa · Wyniki' }, timestamp: new Date().toISOString()
    };
    if(poster) embed.image = { url: 'attachment://wynik.png' };
    return await _discordPost('results', { embeds: [embed] }, poster, 'wynik.png');
  } catch(e) { console.warn('announceResult', e); return false; }
}
// ═══ 📸 OCZEKUJĄCE WYNIKI — widok admina: kto wrzucił, na kogo czeka, od kiedy · ponaglanie ═══
function _capOf(team) {
  const r = teamRegistrations.find(x => x.status === 'approved' && String(x.teamName).toLowerCase() === String(team).toLowerCase() && (!x.seasonId || x.seasonId === (currentSeasonId || x.seasonId)));
  return r?.captain || null;
}
function openPendingResults() {
  const m = _fxModal('pend-modal', 760), box = m.querySelector('.modal');
  const list = [...pendingResults].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  box.innerHTML = _fxHead('pend-modal', `📸 Wyniki czekające na potwierdzenie (${list.length})`) + (list.length ? `
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.6rem">Kapitan rywali dostaje DM od razu po zgłoszeniu, a potem automatyczne przypomnienia po 12 h i po 36 h. Możesz go ponaglić ręcznie albo zdecydować sam.</div>
    <div style="display:flex;flex-direction:column;gap:.5rem">${list.map(p => {
      const s = schedule.find(x => String(x.id) === String(p.scheduleId)) || {}, md = p.matchData || {};
      const other = p.side === 'team1' ? 'team2' : 'team1', waitTeam = s[other], cap = _capOf(waitTeam);
      const h = (Date.now() - Date.parse(p.createdAt)) / 36e5, late = h >= 24;
      const reminders = (p.autoReminded || 0) + (p.nudges || []).length;
      return `<div style="background:var(--surface2);border:1px solid ${late ? 'rgba(220,38,38,.5)' : 'var(--border)'};border-radius:10px;padding:.65rem .8rem">
        <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:baseline">
          <div style="font-weight:800">${s.week ? `W${s.week} · ` : ''}${_h(md.team1?.name || s.team1)} <span style="color:var(--accent)">${md.team1?.score ?? '?'}:${md.team2?.score ?? '?'}</span> ${_h(md.team2?.name || s.team2)}</div>
          <div style="font-size:.74rem;color:${late ? 'var(--loss)' : 'var(--muted)'};font-weight:${late ? 800 : 500}">⏱ czeka ${_agoPL(p.createdAt)}</div>
        </div>
        <div style="font-size:.78rem;margin-top:.35rem;line-height:1.6">
          📤 Wrzucił: <b>${_h(p.by?.name || '?')}</b> <span style="color:var(--muted)">(${_h(s[p.side] || '')})</span><br>
          ⏳ Czeka na: <b>${cap ? _h(cap.name || cap.id) : '<span style="color:var(--loss)">brak kapitana z Discordem</span>'}</b> <span style="color:var(--muted)">(${_h(waitTeam || '?')})</span>
          ${cap?.id ? `<a href="https://discord.com/users/${_h(cap.id)}" target="_blank" rel="noopener" style="margin-left:.3rem;font-size:.72rem;color:var(--accent)">profil Discord ↗</a>` : ''}<br>
          <span style="color:var(--muted);font-size:.72rem">🔔 Przypomnienia: ${reminders}${(p.nudges || []).length ? ` (ostatnie ręczne ${_agoPL(p.nudges[p.nudges.length - 1])} temu)` : ''}${(p.qualityFlags || md.qualityFlags || []).length ? ` · ⚠️ ${_h((p.qualityFlags || md.qualityFlags).join('; '))}` : ''}</span>
        </div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.5rem">
          <button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="pendingNudge('${p.id}')" ${cap ? '' : 'disabled'}>🔔 Ponagl</button>
          <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="ssDecideResult('${p.id}',true).then(()=>openPendingResults())">✅ Zatwierdź sam</button>
          <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem;color:var(--loss)" onclick="ssDecideResult('${p.id}',false).then(()=>openPendingResults())">❌ Odrzuć</button>
          ${s.id ? `<button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="_fxClose('pend-modal');showView('seasonschedule');setTimeout(()=>document.querySelector('[data-sched-id=\\'${s.id}\\']')?.scrollIntoView({behavior:'smooth',block:'center'}),400)">👁 Pokaż w terminarzu</button>` : ''}
        </div>
      </div>`; }).join('')}</div>`
    : '<div style="color:var(--muted);padding:1rem 0;text-align:center">✅ Nic nie czeka — wszystkie zgłoszone wyniki są rozpatrzone.</div>');
  m.classList.add('open');
}
async function pendingNudge(id) {
  const r = await _api('/captain-result/nudge', 'POST', { id }, { admin: true });
  if(!r.ok) { showToast('❌ ' + (r.error || 'Nie udało się'), 'error'); return; }
  const p = pendingResults.find(x => x.id === id); if(p) p.nudges = [...(p.nudges || []), new Date().toISOString()];
  showToast(`🔔 Wysłano przypomnienie do ${r.captain} (${r.team})`, 'success');
  openPendingResults();
}
async function ssDecideResult(id, accept) {
  const p = pendingResults.find(x => x.id === id);
  if(!p) return;
  const md = p.matchData;
  if(!confirm(`${accept ? 'Potwierdzić' : 'Odrzucić'} wynik: ${md.team1.name} ${md.team1.score}:${md.team2.score} ${md.team2.name}?${p.mergeWith != null ? '\n\n🔌 To druga część meczu przerwanego przez rozłączenie — po potwierdzeniu wynik i statystyki zostaną doliczone do pierwszej części.' : ''}`)) return;
  const isAdmin = _isLoggedInSync();
  if(!isAdmin && !_ensureSession()) return;
  if(window._ssDeciding) return; window._ssDeciding = true; // bez podwójnego kliknięcia
  showToast(accept ? '⏳ Zapisuję wynik…' : '⏳ Odrzucam zgłoszenie…', 'info');
  document.querySelectorAll(`[onclick*="ssDecideResult('${id}'"]`).forEach(b => { b.disabled = true; b.style.opacity = '.5'; });
  let res; try { res = await _api('/captain-result/decide', 'POST', { id, accept }, isAdmin ? { admin: true } : { session: true }); } finally { window._ssDeciding = false; }
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); document.querySelectorAll(`[onclick*="ssDecideResult('${id}'"]`).forEach(b => { b.disabled = false; b.style.opacity = ''; }); return; }
  pendingResults = pendingResults.filter(x => x.id !== id);
  if(accept) {
    showToast(res.merged ? `🔌 Doliczono drugą część: ${res.match.team1.name} ${res.match.team1.score}:${res.match.team2.score} ${res.match.team2.name}` : '✅ Wynik zapisany', 'success');
    await loadData();
    renderDashboard();
    renderSchedule();
    if(res.match) _announceResult(res.match.id, res.schedule?.id || p.scheduleId);
  } else {
    renderSeasonSchedule();
    showToast('↩ Zgłoszenie usunięte', 'info');
  }
}
// ═══ 📆 KALENDARZ ════════════════════════════════════════════════
function _calTeamUrl(team) {
  const base = (workerUrl || '').replace(/\/+$/, '') + '/calendar.ics';
  return team ? base + '?team=' + encodeURIComponent(team) : base;
}
function openCalendarModal() {
  const ctx = _ssCtx();
  const teamsList = [...new Set(ctx.items.flatMap(s => [s.team1, s.team2]))].sort((a, b) => a.localeCompare(b, 'pl'));
  const myTeam = ctx.myTeam;
  const row = (label, team) => {
    const https = _calTeamUrl(team), webcal = https.replace(/^https?:/, 'webcal:');
    const google = 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(webcal);
    return `<div style="display:flex;align-items:center;gap:.5rem;padding:.45rem .6rem;border-bottom:1px solid var(--border);${team && team === myTeam ? 'background:rgba(245,197,24,.08)' : ''}">
      ${team ? teamLogo(team, 22, '.55rem') : '🏀'}
      <span style="flex:1;font-size:.84rem;font-weight:600">${_h(label)}${team && team === myTeam ? ' (Twoja drużyna)' : ''}</span>
      <a href="${google}" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .5rem;text-decoration:none">Google</a>
      <a href="${webcal}" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .5rem;text-decoration:none">Apple / Outlook</a>
      <button onclick="navigator.clipboard?.writeText('${https}').then(()=>showToast('🔗 Skopiowano link kalendarza','success'))" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .5rem">🔗</button>
    </div>`;
  };
  const m = _fxModal('calendar-modal', 600);
  m.querySelector('.modal').innerHTML = _fxHead('calendar-modal', '📆 Mecze w Twoim kalendarzu') + `
    <div style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:.9rem">
      Subskrybuj kalendarz drużyny — każdy zatwierdzony termin pojawi się w nim sam (z przypomnieniem godzinę przed meczem).
      Google odświeża subskrypcje co kilka godzin, Apple i Outlook częściej.
    </div>
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;max-height:380px;overflow-y:auto">
      ${row('Cała liga', '')}
      ${teamsList.map(t => row(t, t)).join('')}
    </div>`;
  m.classList.add('open');
}
function ssCalendarSingle(k) {
  const s = _ssItem(k);
  if(!s?.date) return;
  const [hh, mm] = (s.time || '20:00').split(':').map(Number);
  const start = s.date.replace(/-/g, '') + 'T' + String(hh).padStart(2, '0') + String(mm).padStart(2, '0') + '00';
  const endD = new Date(Date.UTC(+s.date.slice(0, 4), +s.date.slice(5, 7) - 1, +s.date.slice(8, 10), hh, mm + 45 * (s.bestOf || 1) + 15));
  const end = endD.toISOString().slice(0, 10).replace(/-/g, '') + 'T' + endD.toISOString().slice(11, 16).replace(':', '') + '00';
  const title = `🏀 ${s.team1} vs ${s.team2}${(s.bestOf || 1) > 1 ? ' (Bo' + s.bestOf + ')' : ''}`;
  const link = location.origin + '/terminarz-week-' + s.week;
  const g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
    '&dates=' + start + '/' + end + '&ctz=Europe/Warsaw&details=' + encodeURIComponent('Week ' + s.week + ' · 2K Pro-Am Ekstraklasa\n' + link);
  const m = _fxModal('cal1-modal', 420);
  m.querySelector('.modal').innerHTML = _fxHead('cal1-modal', '📆 Dodaj do kalendarza') + `
    <div style="font-size:.85rem;margin-bottom:1rem">${_h(s.team1)} vs ${_h(s.team2)}<br><span style="color:var(--muted)">${_ssFmt(s.date)} · ${s.time || '20:00'}</span></div>
    <div style="display:flex;flex-direction:column;gap:.5rem">
      <a href="${g}" target="_blank" rel="noopener" class="btn btn-primary" style="text-align:center;text-decoration:none">Google Calendar</a>
      <button class="btn btn-ghost" onclick="_downloadIcs('${k}')">Apple / Outlook (.ics)</button>
    </div>`;
  m.classList.add('open');
}
function _downloadIcs(k) {
  const s = _ssItem(k);
  const [hh, mm] = (s.time || '20:00').split(':').map(Number);
  const loc = (d, h, mi) => d.replace(/-/g, '') + 'T' + String(h).padStart(2, '0') + String(mi).padStart(2, '0') + '00';
  const endM = hh * 60 + mm + 45 * (s.bestOf || 1) + 15;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//2K Pro-Am Ekstraklasa//PL', 'BEGIN:VEVENT',
    `UID:nba2k-${s.id}@ekstraklasa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}`,
    `DTSTART;TZID=Europe/Warsaw:${loc(s.date, hh, mm)}`,
    `DTEND;TZID=Europe/Warsaw:${endM < 1440 ? loc(s.date, Math.floor(endM / 60), endM % 60) : loc(s.date, 23, 59)}`,
    `SUMMARY:${s.team1} vs ${s.team2}`.replace(/[,;]/g, ' '),
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Mecz za godzinę', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `${s.team1}-vs-${s.team2}.ics`.replace(/[^\w.-]+/g, '_');
  document.body.appendChild(a); a.click(); a.remove();
}
async function openWeekSummary() {
  const ctx = _ssCtx(), week = _ssWeek, sid = ctx.seasonId;
  const wd = _weekData(sid, week);
  const table = _seasonTable(sid);
  const top = [...wd.players].sort((a, b) => b.pts - a.pts)[0];
  const typ = typerData[_seasonKey(sid)]?.weeks?.[week]?.[0];
  const next = schedule.filter(s => s.generated && (s.seasonId || null) === (sid || null) && s.week === week + 1);
  const resLines = wd.results.map(({ s, res }) => `${res.done ? '' : '▶ '}**${s.team1}** ${res.w1}:${res.w2} **${s.team2}**${res.games.length > 1 ? ` (${res.games.map(g => g.s1 + ':' + g.s2).join(', ')})` : ''}`);
  const nextLines = next.map(s => `${s.date ? _ssFmt(s.date) + ' ' + (s.time || '') : 'termin do ustalenia'} — ${s.team1} vs ${s.team2}`);
  const data = {
    week, seasonName: _seasonName(sid),
    results: wd.results.map(({ s, res }) => `${s.team1} ${res.w1}:${res.w2} ${s.team2}`).join('; '),
    leader: table[0] ? `${table[0].team} (${table[0].w}-${table[0].l})` : '',
    topScorer: top ? `${top.name} (${top.team}) — ${top.pts} pkt w ${top.gp} meczach` : '',
    typer: typ ? `${typ.name} (${typ.pts}/${typ.picks})` : '',
    names: [...new Set([...wd.items.flatMap(s => [s.team1, s.team2]), top?.name, typ?.name].filter(Boolean))]
  };
  const m = _fxModal('summary-modal', 640);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('summary-modal', `📰 Podsumowanie Week ${week}`) + '<div style="color:var(--muted);font-size:.85rem">⏳ AI pisze wstęp…</div>';
  m.classList.add('open');
  const fl = await Promise.race([_api('/fun-line', 'POST', { kind: 'summary', data }, { admin: true }), new Promise(r => setTimeout(() => r({}), 12000))]);
  const embed = {
    title: `📰 Podsumowanie Week ${week}${data.seasonName ? ' — ' + data.seasonName : ''}`,
    description: fl?.line ? `🎙️ *${fl.line}*` : '',
    fields: [
      { name: '🏀 Wyniki', value: _trunc(resLines.join('\n') || 'Brak rozegranych meczów', 1020) },
      { name: '📊 Czołówka tabeli', value: _trunc(table.slice(0, 3).map((t, i) => `${['🥇', '🥈', '🥉'][i]} ${t.team} — ${t.w}-${t.l}`).join('\n') || '—', 1020), inline: true },
      { name: '🔥 Najlepszy strzelec', value: top ? `${top.name} (${top.team})\n${top.pts} pkt · ${top.gp} ${top.gp === 1 ? 'mecz' : 'mecze'}` : '—', inline: true },
      { name: '🎯 Typer tygodnia', value: typ ? `${typ.name} — ${typ.pts}/${typ.picks}` : '—', inline: true },
      { name: `📅 Week ${week + 1}`, value: _trunc(nextLines.join('\n') || 'Koniec sezonu zasadniczego 🏁', 1020) }
    ],
    url: location.origin + '/terminarz-week-' + (next.length ? week + 1 : week),
    color: 0xf5c518, footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
  };
  window._summaryEmbed = embed;
  box.innerHTML = _fxHead('summary-modal', `📰 Podsumowanie Week ${week}`) + `
    <div style="background:var(--surface2);border-left:4px solid var(--accent);border-radius:8px;padding:.8rem 1rem;font-size:.82rem;line-height:1.55">
      ${embed.description ? `<div style="margin-bottom:.6rem">${_h(embed.description).replace(/\*/g, '')}</div>` : ''}
      ${embed.fields.map(f => `<div style="margin-bottom:.55rem"><b>${_h(f.name)}</b><div style="white-space:pre-wrap;color:var(--muted)">${_h(f.value).replace(/\*\*/g, '')}</div></div>`).join('')}
    </div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem">
      <button class="btn btn-ghost" onclick="openWeekSummary()">🔄 Nowy wstęp</button>
      <button class="btn btn-primary" onclick="sendWeekSummary()">📣 Wyślij na Discord</button>
    </div>`;
}
async function sendWeekSummary() {
  if(!window._summaryEmbed) return;
  const ok = await _scheduleDiscordSendR('weekSummary', { embeds: [JSON.parse(JSON.stringify(window._summaryEmbed))] });
  showToast(ok ? '📣 Podsumowanie wysłane' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
  if(ok) _fxClose('summary-modal');
}
function openAwardsCreate() {
  const ctx = _ssCtx(), week = _ssWeek;
  const cats = _awardCandidates(ctx.seasonId, week);
  const m = _fxModal('awards-create-modal', 620);
  window._awardDraft = { seasonId: ctx.seasonId, week, cats };
  m.querySelector('.modal').innerHTML = _fxHead('awards-create-modal', `🏅 Nagrody tygodnia — Week ${week}`) + (cats.length ? `
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.9rem">Kandydaci wyliczeni automatycznie ze statystyk i typów kibiców z tego tygodnia. Odznacz kategorie, których nie chcesz.</div>
    ${cats.map((c, i) => `<label style="display:block;border:1px solid var(--border);border-radius:10px;padding:.6rem .8rem;margin-bottom:.5rem;cursor:pointer">
      <div style="display:flex;align-items:center;gap:.5rem;font-weight:800;margin-bottom:.3rem"><input type="checkbox" data-cat="${i}" checked style="accent-color:var(--accent)"> ${c.emoji} ${_h(c.title)}</div>
      ${c.candidates.map(x => `<div style="font-size:.78rem;margin-left:1.5rem"><b>${_h(x.label)}</b> <span style="color:var(--muted)">${_h(x.sub)}</span></div>`).join('')}
    </label>`).join('')}
    <label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;margin:.8rem 0 1rem;cursor:pointer"><input type="checkbox" id="aw-announce" checked style="accent-color:var(--accent)"> Ogłoś start głosowania na Discordzie</label>
    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="_fxClose('awards-create-modal')">Anuluj</button>
      <button class="btn btn-primary" onclick="createAwards()">🗳 Otwórz głosowanie</button>
    </div>` : `<div style="color:var(--muted);text-align:center;padding:1.5rem;font-size:.85rem">Za mało rozegranych meczów w Week ${week}, żeby wybrać kandydatów (potrzeba min. 2 meczów ze statystykami).</div>`);
  m.classList.add('open');
}
async function createAwards() {
  const d = window._awardDraft;
  const chosen = [...document.querySelectorAll('#awards-create-modal input[data-cat]:checked')].map(x => d.cats[+x.dataset.cat]);
  if(!chosen.length) { showToast('Zaznacz co najmniej jedną kategorię', 'info'); return; }
  const res = await _api('/awards', 'POST', { seasonId: d.seasonId, week: d.week, type: d.type || 'week', title: d.title || `Nagrody Week ${d.week}`, categories: chosen }, { admin: true });
  if(!res.ok || !res.award) { showToast('❌ ' + (res.error || 'Błąd'), 'error'); return; }
  awardsList.push(res.award);
  _fxClose('awards-create-modal');
  renderAwardsDashboard();
  showToast('🗳 Głosowanie otwarte — jest na Dashboardzie', 'success');
  if(document.getElementById('aw-announce')?.checked) {
    await _scheduleDiscordSendR('awardsVote', { embeds: [{
      title: `🗳 Głosowanie: ${d.title || 'Nagrody Week ' + d.week}`,
      description: chosen.map(c => `**${c.emoji} ${c.title}**\n` + c.candidates.map(x => `• ${x.label}`).join('\n')).join('\n\n') + '\n\nGłosujcie na stronie (Dashboard)! 👇'
        + (res.award.endsAt ? (() => { const u = Math.floor(Date.parse(res.award.endsAt) / 1000); return `\n\n⏳ **Głosowanie trwa do <t:${u}:f>** (koniec <t:${u}:R>) — zwycięzców ogłosimy tutaj automatycznie.`; })() : ''),
      url: location.origin + location.pathname, color: 0xf5c518, footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
    }] });
  }
}
async function voteAward(id, cat, idx) {
  if(!_ensureSession()) return;
  const candId = awardsList.find(a => a.id === id)?.categories.find(c => c.key === cat)?.candidates[idx]?.id;
  if(!candId) return;
  const res = await _api('/awards/vote', 'POST', { id, cat, candidateId: candId }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const i = awardsList.findIndex(a => a.id === id);
  if(i >= 0 && res.award) awardsList[i] = res.award;
  (myAwardVotes[id] = myAwardVotes[id] || {})[cat] = res.myVote || candId;
  renderAwardsDashboard();
}
async function removeAwards(id) {
  if(!confirm('Usunąć to głosowanie?')) return;
  const res = await _api('/awards', 'PATCH', { id, remove: true }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  awardsList = awardsList.filter(a => a.id !== id);
  renderAwardsDashboard();
}
async function closeAwards(id) {
  if(!confirm('Zakończyć głosowanie i ogłosić zwycięzców na Discordzie?')) return;
  showToast('⏳ Zamykam głosowanie…', 'info');
  const res = await _api('/awards', 'PATCH', { id, status: 'closed' }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const a = res.award;
  if(!a) { showToast('❌ Brak danych głosowania', 'error'); return; }
  const i = awardsList.findIndex(x => x.id === id);
  if(i >= 0) awardsList[i] = a;
  renderAwardsDashboard();
  // ogłoszenie zwycięzców (i zwycięski klip) wysyła Worker w tle; tu tylko plansza Gali (obrazek) przy nagrodach sezonu
  if(a.type === 'season') { try { await _scheduleDiscordSendR('awardsWinners', { content: `🎖 **${a.title}** — plansza zwycięzców` }, await _galaImage(a)); } catch(e) { console.warn('gala board', e); } }
  showToast('🏅 Głosowanie zamknięte — zwycięzcy idą na Discord (kanał „Zwycięzcy nagród tygodnia”)', 'success');
}
async function announceAwards(id) {
  const r = await _api('/awards', 'PATCH', { id, announce: true }, { admin: true });
  showToast(r.ok ? '🏅 Zwycięzcy ogłoszeni na Discordzie' : '❌ ' + (r.error || 'Nie udało się'), r.ok ? 'success' : 'error');
}
async function openPowerRankingCreate() {
  const sid = (_ssCtx().seasonId) || currentSeasonId || null;
  const table = _seasonTable(sid);
  if(table.length < 2) { showToast('Za mało drużyn w sezonie', 'info'); return; }
  const prev = _latestPower(sid);
  const doneWeeks = schedule.filter(s => s.generated && s.seasonId === sid && _ssResult({ demo: false }, s)?.done).map(s => s.week);
  const week = doneWeeks.length ? Math.max(...doneWeeks) : 1;
  const score = t => (t.gp ? t.w / t.gp : 0) * 100 + (t.gp ? t.diff / t.gp : 0) * 1.5 + (t.form.slice(-3).filter(x => x === 'W').length) * 3;
  const ordered = [...table].sort((a, b) => score(b) - score(a) || a.team.localeCompare(b.team));
  const entries = ordered.map((t, i) => ({
    team: t.team, rank: i + 1, prev: prev?.entries.find(e => e.team === t.team)?.rank || null,
    w: t.w, l: t.l, diff: t.diff, form: t.form5
  }));
  const m = _fxModal('power-modal', 620);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('power-modal', `📊 Power Ranking — Week ${week}`) + '<div style="color:var(--muted);font-size:.85rem">⏳ AI pisze komentarze…</div>';
  m.classList.add('open');
  const res = await Promise.race([_api('/ai-power', 'POST', { week, entries }, { admin: true }), new Promise(r => setTimeout(() => r({}), 20000))]);
  entries.forEach(e => { e.line = res?.lines?.[e.team] || ''; });
  window._powerDraft = { id: 'pr_' + Date.now(), seasonId: sid, week, createdAt: new Date().toISOString(), entries };
  box.innerHTML = _fxHead('power-modal', `📊 Power Ranking — Week ${week}`) + `
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.6rem">Kolejność: procent zwycięstw, bilans punktów i forma z 3 ostatnich meczów. Możesz poprawić komentarze.</div>
    <div style="max-height:420px;overflow-y:auto">
      ${entries.map((e, i) => `<div style="display:grid;grid-template-columns:28px 26px 1fr;gap:.5rem;align-items:center;margin-bottom:.45rem">
        <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.15rem">${e.rank}</b>${teamLogo(e.team, 24, '.55rem')}
        <div><div style="font-size:.82rem;font-weight:800">${_h(e.team)} <span style="color:var(--muted);font-weight:600">${e.w}-${e.l}</span></div>
          <input data-pr="${i}" value="${_h(e.line)}" maxlength="160" style="${_MODAL_INP};font-size:.76rem;padding:.3rem .5rem"></div>
      </div>`).join('')}
    </div>
    <label style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;margin:.8rem 0 1rem;cursor:pointer"><input type="checkbox" id="pr-send" checked style="accent-color:var(--accent)"> Wyślij na Discord</label>
    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="_fxClose('power-modal')">Anuluj</button>
      <button class="btn btn-primary" onclick="savePowerRanking()">💾 Opublikuj</button>
    </div>`;
}
async function savePowerRanking() {
  const d = window._powerDraft;
  document.querySelectorAll('#power-modal input[data-pr]').forEach(inp => { d.entries[+inp.dataset.pr].line = inp.value.trim(); });
  powerRankings = [...(powerRankings || []), d].slice(-40);
  const ok = await saveData();
  if(!ok) { powerRankings = powerRankings.filter(x => x !== d); return; }
  _fxClose('power-modal');
  renderPowerRanking();
  showToast('📊 Power Ranking opublikowany', 'success');
  if(document.getElementById('pr-send')?.checked) await sendPowerRanking(true);
}
async function sendPowerRanking(silent) {
  const pr = _latestPower(currentSeasonId || null) || _latestPower(window._powerDraft?.seasonId);
  if(!pr) return;
  const arrow = e => !e.prev ? '🆕' : e.prev > e.rank ? `🔼${e.prev - e.rank}` : e.prev < e.rank ? `🔽${e.rank - e.prev}` : '➖';
  const desc = pr.entries.map(e => `**${e.rank}. ${e.team}** ${arrow(e)} · ${e.w}-${e.l}\n*${e.line || ''}*`).join('\n');
  const ok = await _scheduleDiscordSendR('powerRanking', { embeds: [{
    title: `📊 Power Ranking — Week ${pr.week}`, description: _trunc(desc, 4000),
    url: location.origin + location.pathname, color: 0xf5c518, footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
  }] });
  if(!silent || !ok) showToast(ok ? '📣 Power Ranking wysłany' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
// ═══ 🔁 TRANSFERY ════════════════════════════════════════════════
function renderTransfers(wrap) {
  const isAdmin = _isLoggedInSync();
  const list = transfersList || [];
  wrap.innerHTML = _regTabsHtml(isAdmin ? `<span style="font-size:.72rem;color:var(--muted);display:inline-flex;align-items:center;gap:.3rem">🔒 Okno transferowe do: <input type="date" id="roster-lock" value="${rosterLockDate || ''}" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.15rem .3rem;font-size:.72rem"><button onclick="saveRosterLock()" class="btn btn-ghost" style="font-size:.68rem;padding:.2rem .45rem">💾</button></span>
      <button onclick="openTransferAdd()" class="btn btn-primary" style="font-size:.82rem;padding:.35rem .85rem">+ Dodaj transfer</button>` : (rosterLockDate ? `<span style="font-size:.74rem;color:var(--muted)">🔒 Okno transferowe do ${_ssFmt(rosterLockDate)}</span>` : '')) +
    (list.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.6rem">
      ${list.map(t => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.8rem 1rem">
        <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem">🔁 ${_h(t.player)}</div>
          <span style="font-size:.68rem;color:var(--muted)">${new Date(t.at).toLocaleDateString('pl-PL')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:.45rem;margin:.4rem 0;font-size:.82rem;flex-wrap:wrap">
          ${t.from && t.from !== 'Wolny agent' ? teamLogo(t.from, 22, '.55rem') : '🆓'}<span style="color:var(--muted)">${_h(t.from || 'Wolny agent')}</span>
          <b style="color:var(--accent)">➜</b>${teamLogo(t.to, 22, '.55rem')}<b>${_h(t.to)}</b>
        </div>
        ${t.line ? `<div style="font-size:.78rem;font-style:italic;color:var(--muted)">${_h(t.line)}</div>` : ''}
        ${t.note ? `<div style="font-size:.78rem;margin-top:.3rem">${_h(t.note)}</div>` : ''}
        ${isAdmin ? `<div style="text-align:right;margin-top:.4rem"><button onclick="deleteTransfer('${t.id}')" class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .45rem">🗑</button></div>` : ''}
      </div>`).join('')}
    </div>` : `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:2rem;text-align:center;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:.4rem">🔁</div><div style="font-size:.88rem">Okno transferowe jeszcze ciche</div>
      <div style="font-size:.78rem;margin-top:.25rem">Gdy wolny agent podpisze kontrakt albo gracz zmieni drużynę, zobaczysz to tutaj i na Discordzie.</div></div>`);
}
function _knownPlayers() {
  const set = new Set();
  _withAllMatches(() => matches.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => p.name && set.add(p.name)))));
  freeAgents.forEach(f => set.add(f.name));
  teamRegistrations.forEach(r => (r.players || []).forEach(p => p.gamertag && set.add(p.gamertag)));
  return [...set].sort((a, b) => a.localeCompare(b, 'pl'));
}
function _knownTeams() {
  const set = new Set(teamRegistrations.filter(r => r.status === 'approved').map(r => r.teamName));
  _withAllMatches(() => matches.forEach(m => { set.add(m.team1.name); set.add(m.team2.name); }));
  return [...set].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pl'));
}
function openTransferAdd() {
  const m = _fxModal('transfer-modal', 500);
  const teamsOpts = _knownTeams().map(t => `<option value="${_h(t)}">`).join('');
  m.querySelector('.modal').innerHTML = _fxHead('transfer-modal', '🔁 Nowy transfer') + `
    <datalist id="tr-players">${_knownPlayers().map(p => `<option value="${_h(p)}">`).join('')}</datalist>
    <datalist id="tr-teams"><option value="Wolny agent">${teamsOpts}</datalist>
    <label style="${_MODAL_LBL}">Zawodnik</label><input id="tr-player" list="tr-players" maxlength="40" style="${_MODAL_INP};margin-bottom:.7rem">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.7rem">
      <div><label style="${_MODAL_LBL}">Z drużyny</label><input id="tr-from" list="tr-teams" value="Wolny agent" maxlength="40" style="${_MODAL_INP}"></div>
      <div><label style="${_MODAL_LBL}">Do drużyny</label><input id="tr-to" list="tr-teams" maxlength="40" style="${_MODAL_INP}"></div>
    </div>
    <label style="${_MODAL_LBL}">Notka (opcjonalnie)</label><input id="tr-note" maxlength="200" placeholder="np. wymiana za…" style="${_MODAL_INP};margin-bottom:1rem">
    <div style="font-size:.74rem;color:var(--muted);margin-bottom:1rem">Transfer pojawi się w zakładce 🔁 Transfery i na Discordzie z komentarzem AI.</div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button class="btn btn-ghost" onclick="_fxClose('transfer-modal')">Anuluj</button>
      <button class="btn btn-primary" onclick="saveTransfer()">💾 Ogłoś transfer</button>
    </div>`;
  m.classList.add('open');
}
async function saveTransfer() {
  const player = document.getElementById('tr-player').value.trim(), from = document.getElementById('tr-from').value.trim(),
        to = document.getElementById('tr-to').value.trim(), note = document.getElementById('tr-note').value.trim();
  if(!player || !to) { showToast('Podaj zawodnika i nową drużynę', 'info'); return; }
  if(from && from.toLowerCase() === to.toLowerCase()) { showToast('Drużyny muszą być różne', 'info'); return; }
  const res = await _api('/transfers', 'POST', { player, from, to, note, seasonId: currentSeasonId || null }, { admin: true });
  if(!res.ok || !res.transfer) { showToast('❌ ' + (res.error || 'Błąd'), 'error'); return; }
  transfersList.unshift(res.transfer);
  _fxClose('transfer-modal');
  renderTeamRegistrations();
  showToast('🔁 Transfer ogłoszony', 'success');
}
async function deleteTransfer(id) {
  if(!confirm('Usunąć wpis o transferze? (post na Discordzie zostanie)')) return;
  const res = await _api('/transfers', 'DELETE', { id }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  transfersList = transfersList.filter(t => t.id !== id);
  renderTeamRegistrations();
}
async function announceRecord(i, fromAll) {
  const e = (fromAll ? window._allRecordEvents : window._recentRecords)?.[i];
  if(!e || !confirm(`Ogłosić na Discordzie rekord: ${e.label} — ${e.holder} (${e.value})?`)) return;
  const fl = await Promise.race([_api('/fun-line', 'POST', { kind: 'record', data: { label: e.label, holder: e.holder, value: e.value + ' ' + e.unit, prevHolder: e.prevHolder, prevValue: e.prevValue, opp: e.opp, names: [e.holder, e.team, e.prevHolder, e.opp] } }, { admin: true }), new Promise(r => setTimeout(() => r({}), 15000))]);
  const ok = await _scheduleDiscordSendR('leagueRecord', { embeds: [{
    title: `${e.emoji} Nowy rekord ligi!`,
    description: `**${e.label}**\n${e.holder}${e.team && e.team !== e.holder ? ' (' + e.team + ')' : ''} — **${e.value} ${e.unit}** vs ${e.opp}\nPoprzedni rekord: ${e.prevHolder} (${e.prevValue})${fl?.line ? `\n\n🎙️ *${fl.line}*` : ''}`,
    color: 0xdc2626, footer: { text: 'NBA 2K Pro-Am Ekstraklasa · Rekordy' }, timestamp: new Date().toISOString()
  }] });
  showToast(ok ? '📣 Rekord ogłoszony' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
function openEloChart() {
  const e = _elo();
  const teams = Object.keys(e.hist).sort((a, b) => e.R[b] - e.R[a]);
  const all = teams.flatMap(t => e.hist[t]);
  if(all.length < 2) { showToast('Za mało meczów do wykresu', 'info'); return; }
  const dates = [...new Set(all.map(p => p.date))].sort();
  const W = 760, H = 340, P = 36;
  const ys = all.map(p => p.r), min = Math.min(1500, ...ys) - 10, max = Math.max(1500, ...ys) + 10;
  const x = d => P + dates.indexOf(d) / Math.max(1, dates.length - 1) * (W - P * 2);
  const y = r => H - P - (r - min) / (max - min) * (H - P * 2);
  const color = t => typeof teamColor === 'function' ? teamColor(t) : '#a78bfa';
  const lines = teams.map(t => {
    const pts = [{ date: dates[0], r: 1500 }, ...e.hist[t]];
    const byDate = {}; pts.forEach(p => { byDate[p.date] = p.r; });
    const d = Object.entries(byDate).map(([dt, r]) => `${x(dt).toFixed(1)},${y(r).toFixed(1)}`).join(' ');
    return `<polyline points="${d}" fill="none" stroke="${color(t)}" stroke-width="2.5" stroke-linejoin="round"><title>${_h(t)}</title></polyline>`;
  }).join('');
  const m = _fxModal('elo-modal', 860);
  m.querySelector('.modal').innerHTML = _fxHead('elo-modal', `📈 Ranking siły${e.edition ? ' — ' + _h(e.edition) : ''}`) + `
    <div style="overflow-x:auto"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto">
      <line x1="${P}" x2="${W - P}" y1="${y(1500)}" y2="${y(1500)}" stroke="rgba(127,127,127,.35)" stroke-dasharray="4 4"/>
      <text x="${P - 4}" y="${y(1500) + 4}" text-anchor="end" font-size="10" fill="#8b90a0">1500</text>
      <text x="${P}" y="${H - 10}" font-size="10" fill="#8b90a0">${_ssFmt(dates[0])}</text>
      <text x="${W - P}" y="${H - 10}" text-anchor="end" font-size="10" fill="#8b90a0">${_ssFmt(dates[dates.length - 1])}</text>
      ${lines}
    </svg></div>
    <div style="display:flex;flex-wrap:wrap;gap:.4rem .9rem;margin-top:.6rem">
      ${teams.map(t => `<span style="display:inline-flex;align-items:center;gap:.35rem;font-size:.76rem"><span style="width:12px;height:3px;border-radius:2px;background:${color(t)}"></span>${_h(t)} <b>${Math.round(e.R[t])}</b></span>`).join('')}
    </div>`;
  m.classList.add('open');
}
function _poThird(po) { return (po.rounds || []).find(r => /3/.test(r.name || '')) || null; }
function _bracketSlots(po, picks) {
  const main = _poMain(po), slots = [];
  main.forEach((r, ri) => {
    const n = ri === 0 ? r.pairs.length : Math.ceil(slots[ri - 1].length / 2);
    slots[ri] = [];
    for(let pi = 0; pi < n; pi++) {
      const teams = ri === 0 ? [r.pairs[pi]?.team1, r.pairs[pi]?.team2] : [picks?.[`r${ri - 1}p${pi * 2}`], picks?.[`r${ri - 1}p${pi * 2 + 1}`]];
      slots[ri].push(teams.filter(Boolean));
    }
  });
  let third = null;
  if(_poThird(po) && main.length >= 2) {
    const semi = main.length - 2;
    third = slots[semi].map((teams, pi) => teams.length === 2 ? teams.find(t => t !== picks?.[`r${semi}p${pi}`]) : null).filter(Boolean);
    if(third.length < 2 || slots[semi].some((_, pi) => !picks?.[`r${semi}p${pi}`])) third = third.length === 2 ? third : [];
  }
  return { main, slots, third };
}
async function bracketAnnounce(kind) {
  const { po, bd } = window._bracketAnn || {}; if(!po) return;
  const link = location.origin + '/dashboard';
  let payload;
  if(kind === 'start') {
    if(!confirm('Ogłosić na Discordzie start typowania drabinki play-off?')) return;
    payload = { content: `🏆 **Typowanie drabinki play-off ruszyło!**\nWytypuj zwycięzców wszystkich serii i mistrza — punkty za każdą trafioną serię, ranking na żywo na stronie.${bd.locked ? '' : '\n⏰ Typy można zmieniać do startu play-offów.'}\n👉 ${link}` };
  } else {
    const top = (bd.leaders || []).slice(0, 3);
    if(!top.length) { showToast('Brak typujących', 'info'); return; }
    if(!confirm('Ogłosić zwycięzców typowania drabinki?')) return;
    payload = { embeds: [{ title: '🏆 Pick\'em play-off — zwycięzcy typowania', color: 0xf5c518,
      description: top.map((x, i) => `${['🥇', '🥈', '🥉'][i]} **${x.name}** — ${x.pts} pkt${x.champion ? ` · typ na mistrza: ${_emo(x.champion)}${x.champion}` : ''}`).join('\n') + `\n\nWszystkich typujących: ${bd.count || (bd.leaders || []).length}`,
      footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString() }] };
  }
  const ok = await _scheduleDiscordSendR('awardsWinners', payload);
  showToast(ok ? '📣 Ogłoszono na Discordzie' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
function openBracketPicker() {
  const po = getActivePlayoff();
  if(!po || !_bracketReady(po)) return;
  if(!_ensureSession()) return;
  _bracketDraft = { poId: String(po.id), picks: { ...(myBracket[String(po.id)] || {}) } };
  const m = _fxModal('bracket-modal', 900);
  m.classList.add('open');
  _renderBracketPicker();
}
function _bracketPick(key, team) {
  const po = getActivePlayoff();
  _bracketDraft.picks[key] = team;
  // Usuń typy, które przestały pasować (zmiana wcześniejszej rundy)
  for(let pass = 0; pass < 6; pass++) {
    const { slots, third } = _bracketSlots(po, _bracketDraft.picks);
    slots.forEach((round, ri) => round.forEach((teams, pi) => {
      const k = `r${ri}p${pi}`;
      if(_bracketDraft.picks[k] && !teams.includes(_bracketDraft.picks[k])) delete _bracketDraft.picks[k];
    }));
    if(_bracketDraft.picks.third && !(third || []).includes(_bracketDraft.picks.third)) delete _bracketDraft.picks.third;
  }
  _renderBracketPicker();
}
function _renderBracketPicker() {
  const po = getActivePlayoff();
  const box = document.querySelector('#bracket-modal .modal');
  if(!po || !box) return;
  const { main, slots, third } = _bracketSlots(po, _bracketDraft.picks);
  const total = slots.reduce((s, r) => s + r.length, 0) + (_poThird(po) ? 1 : 0);
  const done = Object.keys(_bracketDraft.picks).length;
  const btn = (key, team) => {
    const on = _bracketDraft.picks[key] === team;
    return `<button onclick="_bracketPick('${key}', this.dataset.t)" data-t="${_h(team)}" style="display:flex;align-items:center;gap:.4rem;width:100%;padding:.35rem .5rem;border-radius:7px;cursor:pointer;font-family:inherit;font-size:.78rem;margin-bottom:.2rem;
      border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'var(--bg)'};color:var(--text);font-weight:${on ? 800 : 500}">
      ${teamLogo(team, 18, '.45rem')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(team)}</span>${on ? '<span style="margin-left:auto">✅</span>' : ''}</button>`;
  };
  const slotHtml = (key, teams) => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:.4rem;margin-bottom:.5rem;min-height:72px">
      ${teams.length === 2 ? teams.map(t => btn(key, t)).join('') : `<div style="font-size:.72rem;color:var(--muted);padding:.5rem;text-align:center">najpierw wytypuj poprzednią rundę</div>`}
    </div>`;
  box.innerHTML = _fxHead('bracket-modal', '🏆 Typer playoffów') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.8rem">Kliknij zwycięzcę każdej pary — kolejne rundy wypełniają się z Twoich typów. Punkty za trafienie: ${main.map((r, ri) => `<b>${2 ** ri}</b> (${_h(r.name || 'runda ' + (ri + 1))})`).join(', ')}${_poThird(po) ? ', <b>2</b> (mecz o 3. miejsce)' : ''}. Typy możesz zmieniać do startu playoffów.</div>
    <div style="display:flex;gap:.8rem;overflow-x:auto;padding-bottom:.4rem">
      ${main.map((r, ri) => `<div style="min-width:190px;flex:1">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">${_h(r.name || 'Runda ' + (ri + 1))} · ${2 ** ri} pkt</div>
        ${slots[ri].map((teams, pi) => slotHtml(`r${ri}p${pi}`, teams)).join('')}
      </div>`).join('')}
      ${_poThird(po) ? `<div style="min-width:190px;flex:1">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">Mecz o 3. miejsce · 2 pkt</div>
        ${slotHtml('third', third || [])}
      </div>` : ''}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-top:.8rem;flex-wrap:wrap">
      <span style="font-size:.78rem;color:var(--muted)">Wytypowano ${done}/${total}</span>
      <div style="display:flex;gap:.5rem">
        <button class="btn btn-ghost" onclick="_fxClose('bracket-modal')">Anuluj</button>
        <button class="btn btn-primary" ${done < total ? 'disabled style="opacity:.45"' : ''} onclick="saveBracket()">💾 Zapisz typy</button>
      </div>
    </div>`;
}
async function saveBracket() {
  if(!_bracketDraft) return;
  if(!_ensureSession()) return;
  const res = await _api('/bracket-pick', 'POST', { poId: _bracketDraft.poId, picks: _bracketDraft.picks }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const first = !myBracket[_bracketDraft.poId];
  myBracket[_bracketDraft.poId] = res.picks;
  const bd = bracketData[_bracketDraft.poId] = bracketData[_bracketDraft.poId] || { count: 0, locked: false, leaders: [], championPicks: {} };
  if(first) bd.count++;
  _fxClose('bracket-modal');
  renderBracketDashboard();
  showToast('🏆 Typy zapisane — powodzenia!', 'success');
}
async function announceAchievement(i) {
  const e = window._recentAch?.[i];
  if(!e || !confirm(`Ogłosić na Discordzie: ${e.player} — ${e.name}?`)) return;
  const fl = await Promise.race([_api('/fun-line', 'POST', { kind: 'achievement', data: { label: e.name, holder: e.player, team: e.team, opp: e.opp, value: e.value, names: [e.player, e.team, e.opp] } }, { admin: true }), new Promise(r => setTimeout(() => r({}), 15000))]);
  const ok = await _scheduleDiscordSendR('achievement', { embeds: [{
    title: `${e.icon} Osiągnięcie: ${e.name}`,
    description: `**${e.player}** (${e.team})${e.career ? '' : ' vs ' + e.opp}${e.value ? '\n' + e.value : ''}${fl?.line ? `\n\n🎙️ *${fl.line}*` : ''}`,
    color: 0xa78bfa, footer: { text: 'NBA 2K Pro-Am Ekstraklasa · Osiągnięcia' }, timestamp: new Date().toISOString()
  }] });
  showToast(ok ? '📣 Ogłoszone' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
// ═══ 🖼 PLAKAT MECZU ═════════════════════════════════════════════
function _gameMvp(m) { // ocena występu (game score) + przewaga zwycięzców; MVP z przegranych tylko przy wyraźnie lepszym występie (o 25%+)
  const gs = p => (+p.pts || 0) + 0.4 * (+p.fgm || 0) - 0.7 * (+p.fga || 0) + 0.4 * (+p.reb || 0) + 0.7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0);
  const w1 = (+m.team1.score || 0) > (+m.team2.score || 0), W = w1 ? m.team1 : m.team2, L = w1 ? m.team2 : m.team1;
  const best = t => (t.players || []).map(p => ({ ...p, team: t.name, _gs: gs(p) })).sort((a, b) => b._gs - a._gs)[0] || null;
  const bw = best(W), bl = best(L); if(!bw) return bl; if(!bl) return bw;
  return bl._gs > bw._gs * 1.25 && bl._gs - bw._gs >= 4 ? bl : bw;
}
async function _matchPoster(m) {
  const S = 1080;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  const font = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  const bg = g.createLinearGradient(0, 0, S, S); bg.addColorStop(0, '#0d0f14'); bg.addColorStop(1, '#22121a');
  g.fillStyle = bg; g.fillRect(0, 0, S, S);
  g.fillStyle = '#8b0000'; g.fillRect(0, 0, S, 12); g.fillStyle = '#f5c518'; g.fillRect(0, 12, S, 4);
  const sItem = schedule.find(s => (s.matchIds || []).map(Number).includes(Number(m.id)) || Number(s.matchId) === Number(m.id));
  const ed = _editionOf(m.seasonId);
  g.textAlign = 'center';
  g.fillStyle = '#f5c518'; g.font = `900 34px ${font}`; g.fillText('2K PRO-AM EKSTRAKLASA', S / 2, 82);
  g.fillStyle = '#8b90a0'; g.font = `700 26px ${font}`;
  g.fillText([ed, sItem ? 'WEEK ' + sItem.week : '', formatDate(m.date).toUpperCase()].filter(Boolean).join('  ·  '), S / 2, 122);
  const t1Win = (m.team1.score || 0) > (m.team2.score || 0);
  const R = 135, cy = 350, xs = [230, S - 230];
  for(const [i, t] of [m.team1, m.team2].entries()) {
    const x = xs[i], win = i === 0 ? t1Win : !t1Win;
    g.save(); g.beginPath(); g.arc(x, cy, R, 0, Math.PI * 2); g.closePath();
    g.fillStyle = typeof teamColor === 'function' ? teamColor(t.name) : '#333'; g.fill();
    const img = await _ssLoadImg(_ssLogoSrc(t.name));
    try {
      if(img) { g.clip(); const sc = Math.max(R * 2 / img.width, R * 2 / img.height); g.drawImage(img, x - img.width * sc / 2, cy - img.height * sc / 2, img.width * sc, img.height * sc); }
      else { g.fillStyle = '#fff'; g.font = `900 96px ${font}`; g.textBaseline = 'middle'; g.fillText(typeof teamInitials === 'function' ? teamInitials(t.name) : t.name.slice(0, 2), x, cy + 4); }
    } catch(e) {}
    g.restore();
    g.lineWidth = 7; g.strokeStyle = win ? '#f5c518' : '#3a3f4f'; g.beginPath(); g.arc(x, cy, R, 0, Math.PI * 2); g.stroke();
    g.textBaseline = 'alphabetic'; g.fillStyle = win ? '#ffffff' : '#9aa0b0'; g.font = `800 40px ${font}`;
    let label = t.name; while(g.measureText(label).width > 380 && label.length > 3) label = label.slice(0, -2) + '…';
    g.fillText(label, x, cy + R + 62);
    g.font = `900 120px ${font}`; g.fillStyle = win ? '#f5c518' : '#ffffff';
    g.fillText(String(t.score ?? '?'), x, cy + R + 190);
  }
  g.fillStyle = '#8b90a0'; g.font = `900 64px ${font}`; g.textBaseline = 'middle'; g.fillText('VS', S / 2, cy); g.textBaseline = 'alphabetic';
  const mvp = _gameMvp(m);
  if(mvp) {
    const ach = _ACH.filter(a => a.test(mvp)).map(a => a.icon + ' ' + a.name.split(' (')[0]).slice(0, 3).join('    ');
    const boxH = ach ? 205 : 165;
    g.fillStyle = 'rgba(245,197,24,.10)'; g.fillRect(80, 815, S - 160, boxH);
    g.fillStyle = '#f5c518'; g.fillRect(80, 815, 8, boxH);
    g.textAlign = 'left';
    g.fillStyle = '#f5c518'; g.font = `800 26px ${font}`; g.fillText('MVP MECZU', 120, 860);
    g.fillStyle = '#ffffff'; g.font = `900 52px ${font}`;
    let nm = `${mvp.name}`; while(g.measureText(nm).width > 620 && nm.length > 3) nm = nm.slice(0, -2) + '…';
    g.fillText(nm, 120, 918);
    g.fillStyle = '#c9cdd8'; g.font = `700 30px ${font}`;
    g.fillText(`${mvp.pts || 0} PTS · ${mvp.reb || 0} REB · ${mvp.ast || 0} AST${mvp.tpm ? ' · ' + mvp.tpm + ' 3PM' : ''}`, 120, 960);
    if(ach) { g.fillStyle = '#a78bfa'; g.font = `800 26px ${font}`; g.fillText(ach, 120, 1000); }
    g.textAlign = 'right'; g.fillStyle = '#8b90a0'; g.font = `700 26px ${font}`;
    let tn = mvp.team; while(g.measureText(tn).width > 300 && tn.length > 3) tn = tn.slice(0, -2) + '…';
    g.fillText(tn, S - 120, 860);
    g.textAlign = 'center';
  }
  g.fillStyle = '#5a6070'; g.font = `600 22px ${font}`; g.fillText((location.host || 'chemik81.github.io') + location.pathname.replace(/index\.html$/, ''), S / 2, S - 22);
  try { return c.toDataURL('image/png'); } catch(e) { return null; }
}
async function openMatchPoster(id) {
  const m = _withAllMatches(() => matches.find(x => Number(x.id) === Number(id)));
  if(!m) return;
  const modal = _fxModal('poster-modal', 640);
  const box = modal.querySelector('.modal');
  box.innerHTML = _fxHead('poster-modal', '🖼 Plakat meczu') + '<div style="color:var(--muted);font-size:.85rem">⏳ Rysuję…</div>';
  modal.classList.add('open');
  try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
  const url = await _matchPoster(m);
  if(!url) { box.innerHTML = _fxHead('poster-modal', '🖼 Plakat meczu') + '<div style="color:var(--loss)">Nie udało się narysować plakatu (logo z obcego serwera blokuje eksport).</div>'; return; }
  window._posterData = { url, m };
  const file = `${m.team1.name}-${m.team2.name}-${m.date}.png`.replace(/[^\w.-]+/g, '_');
  box.innerHTML = _fxHead('poster-modal', '🖼 Plakat meczu') + `
    <img src="${url}" alt="" style="width:100%;border-radius:10px;border:1px solid var(--border);margin-bottom:.8rem">
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end">
      <a href="${url}" download="${file}" class="btn btn-primary" style="text-decoration:none">⬇ Pobierz PNG</a>
      ${navigator.clipboard && window.ClipboardItem ? `<button class="btn btn-ghost" onclick="_copyPoster()">📋 Kopiuj</button>` : ''}
      ${_isLoggedInSync() ? `<button class="btn btn-ghost" onclick="_sendPoster()">📣 Wyślij na Discord</button>` : ''}
    </div>`;
}
async function _copyPoster() {
  try {
    const blob = _dataUrlToBlob(window._posterData.url);
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    showToast('📋 Skopiowano — wklej na Discordzie (Ctrl+V)', 'success');
  } catch(e) { showToast('Przeglądarka nie pozwala kopiować obrazów — użyj Pobierz', 'info'); }
}
async function _sendPoster() {
  const { url, m } = window._posterData || {};
  if(!url) return;
  const ok = await _scheduleDiscordSendR('matchPoster', { embeds: [{
    title: `🏀 ${m.team1.name} ${m.team1.score} : ${m.team2.score} ${m.team2.name}`,
    color: 0xf5c518, footer: { text: 'NBA 2K Pro-Am Ekstraklasa' }, timestamp: new Date().toISOString()
  }] }, url);
  showToast(ok ? '📣 Plakat wysłany' : '❌ Discord nie przyjął wiadomości', ok ? 'success' : 'error');
}
function _audit(action, details) {
  if(!_isLoggedInSync()) return;
  _api('/audit', 'POST', { actor: discordUser?.name ? 'Admin (' + discordUser.name + ')' : 'Admin', action, details: String(details || '').slice(0, 200) }, { admin: true }).catch(() => {});
}
// ═══ 💾 KOPIE ZAPASOWE ═══════════════════════════════════════════
async function openBackups() {
  const m = _fxModal('backup-modal', 600);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('backup-modal', '💾 Kopie zapasowe') + '<div style="color:var(--muted)">⏳ Wczytuję…</div>';
  m.classList.add('open');
  const res = await _api('/backups', 'GET', null, { admin: true });
  if(!res.ok) { box.innerHTML = _fxHead('backup-modal', '💾 Kopie zapasowe') + `<div style="color:var(--loss)">❌ ${_h(res.error)}</div>`; return; }
  const list = res.backups || [];
  box.innerHTML = _fxHead('backup-modal', '💾 Kopie zapasowe') + `
    <div style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-bottom:.8rem">
      Worker robi kopię całej ligi codziennie nad ranem (ok. 4:00–5:00) i trzyma 14 ostatnich. Przywrócenie zastępuje obecne dane — wcześniej robimy automatycznie kopię obecnego stanu.
      ${list.length ? '' : '<br><b style="color:var(--accent)">Brak kopii — sprawdź, czy w Cloudflare jest ustawiony harmonogram (Cron) Workera.</b>'}
    </div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:.6rem"><button class="btn btn-primary" onclick="backupNow()" style="font-size:.78rem">💾 Zrób kopię teraz</button></div>
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;max-height:380px;overflow-y:auto">
      ${list.map(b => `<div style="display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;border-bottom:1px solid var(--border);font-size:.82rem">
        <b style="flex:1">${_h(b.date)}</b>
        <span style="color:var(--muted);font-size:.72rem">${b.size ? (b.size / 1e6).toFixed(2) + ' MB' : ''}</span>
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem" onclick="downloadBackup('${_h(b.date)}')">⬇ Pobierz</button>
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem;color:var(--loss)" onclick="restoreBackup('${_h(b.date)}', ${b.ext ? 'true' : 'false'})">↩ Przywróć</button>
      </div>`).join('') || '<div style="padding:1rem;text-align:center;color:var(--muted)">Brak kopii</div>'}
    </div>`;
}
async function backupNow() {
  const res = await _api('/backup/now', 'POST', {}, { admin: true });
  showToast(res.ok ? '💾 Kopia zrobiona' : '❌ ' + res.error, res.ok ? 'success' : 'error');
  if(res.ok) openBackups();
}
async function downloadBackup(date) {
  try {
    const r = await fetch(workerUrl.replace(/\/+$/, '') + '/backup?date=' + encodeURIComponent(date), { headers: { 'X-Admin-Token': _adminToken() } });
    if(!r.ok) throw new Error('HTTP ' + r.status);
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `liga-kopia-${date}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  } catch(e) { showToast('❌ ' + e.message, 'error'); }
}
async function restoreBackup(date, ext) { // wybór, co przywrócić — domyślnie tylko mecze i dane ligi (karty, Kort i gry osobno)
  const m = _fxModal('restore-modal', 520); m.classList.add('open');
  const opt = (id, l, sub, on, dis) => `<label style="display:flex;gap:.55rem;align-items:flex-start;padding:.45rem .55rem;border:1px solid var(--border);border-radius:9px;margin-bottom:.35rem;cursor:${dis ? 'not-allowed' : 'pointer'};opacity:${dis ? .45 : 1};font-size:.84rem;text-transform:none;letter-spacing:0;color:var(--text)"><input type="checkbox" class="rs-part" value="${id}" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''} style="width:auto;margin:.15rem 0 0"><span><b>${l}</b><br><span style="font-size:.72rem;color:var(--muted)">${sub}</span></span></label>`;
  m.querySelector('.modal').innerHTML = _fxHead('restore-modal', `♻️ Przywróć kopię z ${_h(date)}`) + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">Zaznacz, co przywrócić. Zaznaczone dane zostaną zastąpione stanem z kopii, a niezaznaczone zostaną bez zmian. Przed przywróceniem zapisuje się kopia obecnego stanu.</div>
    ${opt('league', '🏀 Mecze i dane ligi', 'wyniki, terminarz, sezony, drużyny, wolni agenci, transfery, typy, nagrody, eventy, akcje', true, false)}
    ${opt('cards', '🃏 Kolekcja kart', 'karty i paczki kibiców, wymiany, karty limitowane, wyzwania, Moja piątka, Karnet', false, !ext)}
    ${opt('kort', '🎮 Kort', 'ELO, historia meczów, wyzwania Kortu, statystyki', false, !ext)}
    ${opt('games', '🏆 Liga GM, Fantasy, Liga kibiców, 2Kordle', 'składy GM, punkty fantasy, drużyny kibiców, wyniki 2Kordle, ankiety', false, !ext)}
    ${opt('settings', '⚙️ Ustawienia', 'kanały powiadomień, zapisy i wpisowe, regulamin, odcinki podcastu, rekordy', false, !ext)}
    ${ext ? '' : '<div style="font-size:.72rem;color:var(--muted);margin:.2rem 0 .5rem">Ta kopia powstała przed rozszerzeniem — zawiera tylko mecze i dane ligi.</div>'}
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.5rem"><button class="btn btn-ghost" onclick="_fxClose('restore-modal')">Anuluj</button><button class="btn btn-primary" style="background:var(--loss);border-color:var(--loss)" onclick="_restoreGo('${_h(date)}')">♻️ Przywróć zaznaczone</button></div></div>`;
}
async function _restoreGo(date) {
  const parts = [...document.querySelectorAll('.rs-part:checked')].map(x => x.value); if(!parts.length) { showToast('Zaznacz, co przywrócić', 'info'); return; }
  if(prompt(`Przywrócić (${parts.join(', ')}) z kopii ${date}? Wpisz PRZYWRÓĆ, aby potwierdzić.`) !== 'PRZYWRÓĆ') return;
  const res = await _api('/backup/restore', 'POST', { date, parts }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  showToast(res.missing?.length ? `✅ Przywrócono — brak w kopii: ${res.missing.join(', ')}` : '✅ Przywrócono — wczytuję dane…', 'success');
  _fxClose('restore-modal'); _fxClose('backup-modal'); _cards = null;
  await loadData(); renderDashboard(); renderSchedule();
  setTimeout(() => _pushDerived(), 1500);
}
// ═══ 📝 DZIENNIK ZMIAN ═══════════════════════════════════════════
async function openAudit() {
  const m = _fxModal('audit-modal', 760);
  const box = m.querySelector('.modal');
  box.innerHTML = _fxHead('audit-modal', '📝 Dziennik zmian') + '<div style="color:var(--muted)">⏳ Wczytuję…</div>';
  m.classList.add('open');
  const res = await _api('/audit', 'GET', null, { admin: true });
  if(!res.ok) { box.innerHTML = _fxHead('audit-modal', '📝 Dziennik zmian') + `<div style="color:var(--loss)">❌ ${_h(res.error)}</div>`; return; }
  window._auditEntries = res.entries || [];
  box.innerHTML = _fxHead('audit-modal', '📝 Dziennik zmian') + `
    <input oninput="_renderAudit(this.value)" placeholder="Szukaj (drużyna, osoba, akcja)…" style="${_MODAL_INP};margin-bottom:.6rem">
    <div id="audit-list" style="max-height:60vh;overflow-y:auto;border:1px solid var(--border);border-radius:10px"></div>`;
  _renderAudit('');
}
function _renderAudit(q) {
  const el = document.getElementById('audit-list');
  if(!el) return;
  const s = String(q || '').toLowerCase();
  const rows = (window._auditEntries || []).filter(e => !s || [e.actor, e.action, e.details].join(' ').toLowerCase().includes(s)).slice(0, 300);
  el.innerHTML = rows.map(e => `<div style="display:grid;grid-template-columns:120px 150px 1fr;gap:.6rem;padding:.4rem .7rem;border-bottom:1px solid var(--border);font-size:.78rem">
    <span style="color:var(--muted)">${new Date(e.at).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
    <b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(e.actor)}</b>
    <span><b>${_h(e.action)}</b> <span style="color:var(--muted)">${_h(e.details)}</span></span>
  </div>`).join('') || '<div style="padding:1rem;text-align:center;color:var(--muted)">Brak wpisów</div>';
}
function openPenalties() {
  const sid = currentSeasonId || null;
  const teams = _knownTeams();
  const list = _penaltiesFor(sid);
  const m = _fxModal('pen-modal', 560);
  m.querySelector('.modal').innerHTML = _fxHead('pen-modal', '⚖️ Kary') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.8rem">Kara odejmuje punkty w tabeli bieżącego sezonu. Walkower ustawisz przyciskiem <b>🏳 Walkower</b> przy meczu w terminarzu.</div>
    ${list.map(p => `<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem .6rem;border:1px solid var(--border);border-radius:8px;margin-bottom:.35rem;font-size:.82rem">
      <b style="color:var(--loss)">−${p.points}</b><b>${_h(p.team)}</b><span style="flex:1;color:var(--muted)">${_h(p.reason)} · ${_ssFmt(p.date)}</span>
      <button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .4rem" onclick="removePenalty('${p.id}')">🗑</button></div>`).join('') || '<div style="color:var(--muted);font-size:.82rem;margin-bottom:.6rem">Brak kar w tym sezonie.</div>'}
    <div style="display:grid;grid-template-columns:1fr 80px;gap:.5rem;margin-top:.8rem">
      <select id="pen-team" style="${_MODAL_INP}">${teams.map(t => `<option>${_h(t)}</option>`).join('')}</select>
      <input id="pen-pts" type="number" min="1" max="20" value="1" style="${_MODAL_INP}" title="Punkty karne">
    </div>
    <input id="pen-reason" maxlength="120" placeholder="Powód (np. niestawienie się na mecz)" style="${_MODAL_INP};margin:.5rem 0 .8rem">
    <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" onclick="addPenalty()">➕ Dodaj karę</button></div>`;
  m.classList.add('open');
}
async function addPenalty() {
  const team = document.getElementById('pen-team').value, points = Math.max(1, Math.min(20, +document.getElementById('pen-pts').value || 1));
  const reason = document.getElementById('pen-reason').value.trim();
  if(!reason) { showToast('Podaj powód kary', 'info'); return; }
  const p = { id: 'pen_' + Date.now(), seasonId: currentSeasonId || null, team, points, reason, date: _today() };
  penalties = [...(penalties || []), p];
  if(!(await saveData())) { penalties = penalties.filter(x => x !== p); return; }
  _audit('Kara', `${team}: −${points} (${reason})`);
  openPenalties(); renderDashboard();
}
async function removePenalty(id) {
  const p = penalties.find(x => x.id === id);
  if(!p || !confirm(`Usunąć karę dla ${p.team} (−${p.points})?`)) return;
  penalties = penalties.filter(x => x.id !== id);
  if(!(await saveData())) { penalties.push(p); return; }
  _audit('Usunięto karę', `${p.team}: −${p.points}`);
  openPenalties(); renderDashboard();
}
// ═══ 🏳 WALKOWER SPOTKANIA ════════════════════════════════════════
function ssWalkover(k) {
  const s = _ssItem(k);
  if(!s) return;
  const m = _fxModal('wo-modal', 420);
  m.querySelector('.modal').innerHTML = _fxHead('wo-modal', '🏳 Walkower') + `
    <div style="font-size:.82rem;margin-bottom:.8rem">${_h(s.team1)} vs ${_h(s.team2)} · Week ${s.week}${(s.bestOf || 1) > 1 ? ' · Bo' + s.bestOf : ''}</div>
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.8rem">Każdy nierozegrany mecz spotkania zostanie zapisany jako 20:0 (walkower: zwycięzca 2 pkt, przegrany 0 pkt).</div>
    <div style="display:flex;flex-direction:column;gap:.45rem">
      <button class="btn btn-primary" onclick="confirmWalkover('${k}','team1')">Wygrywa ${_h(s.team1)}</button>
      <button class="btn btn-primary" onclick="confirmWalkover('${k}','team2')">Wygrywa ${_h(s.team2)}</button>
    </div>`;
  m.classList.add('open');
}
async function confirmWalkover(k, side) {
  const s = _ssItem(k);
  const winner = s[side], loser = s[side === 'team1' ? 'team2' : 'team1'];
  const linked = _ssMatchIds(s).length, need = Math.max(1, (s.bestOf || 1) - linked);
  if(!confirm(`Zapisać walkower ${winner} 20:0 ${loser} (${need} ${need === 1 ? 'mecz' : 'mecze'})?`)) return;
  const prev = { matchIds: s.matchIds, matchId: s.matchId, played: s.played, date: s.date };
  let maxId = Math.max(0, ..._withAllMatches(() => matches.map(m => Number(m.id) || 0)));
  const date = s.date || _today();
  const added = [];
  for(let i = 0; i < need; i++) {
    const nm = { id: ++maxId, date, note: 'Walkower (W/O)', walkover: true, seasonId: s.seasonId || currentSeasonId || null,
      team1: { name: winner, score: 20, players: [], quarters: [] }, team2: { name: loser, score: 0, players: [], quarters: [] } };
    added.push(nm);
  }
  _withAllMatches(() => added.forEach(nm => matches.push(nm)));
  s.matchIds = [..._ssMatchIds(s), ...added.map(x => x.id)];
  s.matchId = s.matchIds[0]; s.played = true; s.date = date;
  if(!(await saveData())) { _withAllMatches(() => { added.forEach(nm => { const i = matches.indexOf(nm); if(i >= 0) matches.splice(i, 1); }); }); Object.assign(s, prev); return; }
  _audit('Walkower', `${winner} vs ${loser} (Week ${s.week})`);
  _fxClose('wo-modal');
  renderDashboard(); renderSchedule();
  showToast('🏳 Walkower zapisany', 'success');
}
function openStreamModal(k) {
  const s = _ssItem(k);
  if(!s) return;
  const ctx = _ssCtx();
  const isAdmin = ctx.isAdmin;
  const mySide = ctx.myTeam ? ['team1', 'team2'].find(sd => String(s[sd]).toLowerCase() === ctx.myTeam.toLowerCase()) : null;
  if(!isAdmin && !mySide) return;
  if(!isAdmin && !_ensureSession()) return;
  const st = streamsData[k] || {};
  const sides = isAdmin ? ['team1', 'team2'] : [mySide];
  const block = sd => {
    const reg = _teamRegByName(s[sd]);
    const v = st[sd];
    const mode = v === '-' ? 'none' : v ? 'custom' : 'default';
    const r = (val, label) => `<label style="display:flex;align-items:center;justify-content:flex-start;gap:.5rem;font-size:.82rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:.3rem 0;cursor:pointer"><input type="radio" name="sm-${sd}" value="${val}" ${mode === val ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> <span>${label}</span></label>`;
    return `<div style="border:1px solid var(--border);border-radius:10px;padding:.65rem .8rem;margin-bottom:.7rem">
      <div style="display:flex;align-items:center;gap:.45rem;font-weight:800;margin-bottom:.5rem">${teamLogo(s[sd], 22, '.5rem')}<span>${_h(s[sd])}</span></div>
      <label style="${_MODAL_LBL}">📺 Stały kanał drużyny <span style="font-weight:400;text-transform:none;letter-spacing:0">(pokazuje się przy każdym meczu)</span></label>
      <input id="team-stream-${sd}" value="${_h(reg?.streamUrl || '')}" ${reg ? '' : 'disabled'} placeholder="https://twitch.tv/nazwa_kanalu" style="${_MODAL_INP};margin-bottom:.5rem">
      ${r('default', 'Ten mecz na stałym kanale')}
      ${r('custom', 'Inny link tylko dla tego meczu:')}
      <input id="stream-${sd}" value="${_h(mode === 'custom' ? v : '')}" placeholder="https://…" oninput="document.querySelector('input[name=sm-${sd}][value=custom]').checked=true" style="${_MODAL_INP};margin:.15rem 0 .3rem">
      ${r('none', '🚫 Tego meczu nie transmitujemy')}
    </div>`;
  };
  const m = _fxModal('stream-modal', 500);
  m.querySelector('.modal').innerHTML = _fxHead('stream-modal', '📺 Transmisja meczu') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.8rem">${_h(s.team1)} vs ${_h(s.team2)}. Wystarczy raz podać stały kanał drużyny — będzie automatycznie przy każdym meczu, w ogłoszeniu „Za godzinę” i w 🔴 NA ŻYWO. Twitch, YouTube, Kick, Facebook lub TikTok.</div>
    ${sides.map(block).join('')}
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('stream-modal')">Anuluj</button>
      <button class="btn btn-primary" onclick="saveStreamLinks('${k}', ${JSON.stringify(sides).replace(/"/g, '&quot;')})">💾 Zapisz</button></div>`;
  m.classList.add('open');
}
// ═══ 🖼 LOGO DRUŻYNY (kapitan swojej drużyny, admin każdej) ═══
function _resizeLogo(file) { // logo drużyny: do 512 px, skalowanie wieloetapowe; małe pliki bez obróbki; przezroczystość zachowana
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result, img = new Image();
      img.onload = () => {
        const MAX = 512;
        if(img.width <= MAX && img.height <= MAX && file.size <= 300 * 1024 && /^data:image\/(png|jpe?g|webp|gif);/.test(src)) { resolve(src); return; } // oryginał
        const sc = Math.min(MAX / img.width, MAX / img.height, 1), W = Math.round(img.width * sc), H = Math.round(img.height * sc);
        let cur = img, cw = img.width, ch = img.height;
        while(cw / 2 >= W && ch / 2 >= H) { const t = document.createElement('canvas'); t.width = Math.round(cw / 2); t.height = Math.round(ch / 2); const g = t.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, t.width, t.height); cur = t; cw = t.width; ch = t.height; }
        const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(cur, 0, 0, W, H);
        let out = c.toDataURL('image/png');
        if(out.length > 1300000) { const wp = c.toDataURL('image/webp', 0.92); if(wp.startsWith('data:image/webp')) out = wp; } // PNG za duży → WebP (z przezroczystością)
        if(out.length > 1300000) out = c.toDataURL('image/jpeg', 0.9);
        resolve(out);
      };
      img.onerror = () => reject(new Error(_g('To nie jest obrazek', 'That is not an image')));
      img.src = src;
    };
    reader.onerror = () => reject(new Error(_g('Nie udało się odczytać pliku', 'Could not read the file')));
    reader.readAsDataURL(file);
  });
}
function changeTeamLogo(regId) {
  const reg = teamRegistrations.find(r => r.id === regId);
  if(!reg) return;
  const isAdmin = _isLoggedInSync();
  if(!isAdmin && !_ensureSession()) return;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp,image/gif';
  inp.onchange = async () => {
    const f = inp.files?.[0];
    if(!f) return;
    try {
      showToast(_g('⏳ Wgrywam logo…', '⏳ Uploading the logo…'), 'info');
      const dataUrl = await _resizeLogo(f);
      const res = await _api('/team-logo', 'POST', { regId, dataUrl }, isAdmin ? { admin: true } : { session: true });
      if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
      Object.assign(reg, res.registration);
      renderTeamRegistrations(); renderDashboard(); renderSchedule(); if(document.querySelector('#euedit-modal.open')) _euEdDraw();
      showToast(_g(`🖼 Nowe logo: ${reg.teamName}`, `🖼 New logo: ${reg.teamName}`), 'success');
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
  };
  inp.click();
}
// 🐦 profil X (Twitter) drużyny — wzmianki @drużyna we wpisach ligi na X
function openTeamXModal(regId) {
  const reg = teamRegistrations.find(r => r.id === regId); if(!reg) return;
  const m = _fxModal('team-x-modal', 480);
  m.querySelector('.modal').innerHTML = _fxHead('team-x-modal', `🐦 ${_g('Profil X drużyny', 'Team X profile')} — ${_h(reg.teamName)}`) + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">${_g('Gdy liga publikuje podsumowanie kolejki na X, drużyna zostanie oznaczona (@nazwa) — dostaniecie powiadomienie i możecie podać wpis dalej.', 'When the league posts a round summary on X, your team gets tagged (@name) — you get notified and can repost it.')}</div>
    <div style="display:flex;align-items:center;gap:.3rem;margin-bottom:.9rem"><span style="font-size:1.1rem;font-weight:800">@</span><input id="txm-h" value="${_h(reg.xHandle && reg.xHandle !== '-' ? reg.xHandle : '')}" placeholder="nazwa_druzyny" maxlength="60" style="${_MODAL_INP}"></div>
    <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap">
      <button class="btn btn-ghost" style="font-size:.76rem" onclick="saveTeamX('${regId}', true)">${_g('Nie mamy profilu na X', 'We don\u2019t have an X profile')}</button>
      <span style="display:flex;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('team-x-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" onclick="saveTeamX('${regId}')">💾 ${_g('Zapisz', 'Save')}</button></span></div></div>`;
  m.classList.add('open');
}
async function saveTeamX(regId, none) {
  const reg = teamRegistrations.find(r => r.id === regId), handle = none ? '' : document.getElementById('txm-h').value.trim();
  const res = await _api('/team-x', 'POST', { regId, handle, none: !!none }, _isLoggedInSync() ? { admin: true } : { session: true });
  if(!res.ok) { showToast('❌ ' + _tr(res.error), 'error'); return; }
  Object.assign(reg, res.registration); if(!res.registration.xHandle) delete reg.xHandle;
  _fxClose('team-x-modal'); document.getElementById('cap-x-nudge')?.remove();
  showToast(none ? _g('Zapisano — nie będziemy przypominać', 'Saved — no more reminders') : reg.xHandle ? `🐦 @${reg.xHandle} ${_g('zapisany', 'saved')}` : _g('Profil usunięty', 'Profile removed'), 'success');
}
function openTeamStreamModal(regId) {
  const reg = teamRegistrations.find(r => r.id === regId);
  if(!reg) return;
  const m = _fxModal('team-stream-modal', 460);
  m.querySelector('.modal').innerHTML = _fxHead('team-stream-modal', `📺 Kanał transmisji — ${_h(reg.teamName)}`) + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">Link pokaże się automatycznie przy każdym meczu drużyny, w ogłoszeniu „Za godzinę” i w 🔴 NA ŻYWO. Inny link albo „bez transmisji” ustawisz przy konkretnym meczu w terminarzu.</div>
    <input id="tsm-url" value="${_h(reg.streamUrl || '')}" placeholder="https://twitch.tv/nazwa_kanalu" style="${_MODAL_INP};margin-bottom:.9rem">
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('team-stream-modal')">Anuluj</button>
      <button class="btn btn-primary" onclick="saveTeamStream('${regId}')">💾 Zapisz</button></div>`;
  m.classList.add('open');
}
async function saveTeamStream(regId) {
  const reg = teamRegistrations.find(r => r.id === regId);
  const url = document.getElementById('tsm-url').value.trim();
  const res = await _api('/team-stream', 'POST', { regId, url }, _isLoggedInSync() ? { admin: true } : { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  Object.assign(reg, res.registration); if(!res.registration.streamUrl) delete reg.streamUrl;
  _fxClose('team-stream-modal'); renderScheduleDashboard(); renderSeasonSchedule(); renderLiveBanner();
  showToast(url ? '📺 Kanał drużyny zapisany' : 'Kanał usunięty', 'success');
}
async function saveStreamLinks(k, sides) {
  const s = _ssItem(k);
  const isAdmin = _isLoggedInSync();
  const auth = isAdmin ? { admin: true } : { session: true };
  for(const sd of sides) {
    const reg = _teamRegByName(s[sd]);
    // stały kanał drużyny
    const teamUrl = (document.getElementById('team-stream-' + sd)?.value || '').trim();
    if(reg && teamUrl !== (reg.streamUrl || '')) {
      const res = await _api('/team-stream', 'POST', { regId: reg.id, url: teamUrl }, auth);
      if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
      Object.assign(reg, res.registration); if(!res.registration.streamUrl) delete reg.streamUrl;
    }
    // ten mecz
    const mode = document.querySelector(`input[name="sm-${sd}"]:checked`)?.value || 'default';
    const custom = (document.getElementById('stream-' + sd)?.value || '').trim();
    const want = mode === 'none' ? '-' : mode === 'custom' ? custom : '';
    if(mode === 'custom' && !custom) { showToast('Wpisz link dla tego meczu albo wybierz stały kanał', 'info'); return; }
    if((streamsData[k]?.[sd] || '') !== want) {
      const res = await _api('/stream-link', 'POST', { scheduleId: k, url: want, side: sd }, auth);
      if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
      streamsData[k] = res.streams;
    }
  }
  _fxClose('stream-modal');
  renderSeasonSchedule(); renderLiveBanner(); renderScheduleDashboard();
  showToast('📺 Zapisano', 'success');
}
