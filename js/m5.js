/*@v:739204317b*/
// 🎬 film z Discorda: świeży adres od Workera (adresy plików Discorda wygasają) → odtwarzacz na stronie
async function playDcClip(id) {
  const box = document.getElementById('clip-' + id); if(!box) return;
  box.innerHTML = '<div style="font-size:.78rem;color:var(--muted)">⏳</div>';
  const r = await _api('/clip-media?id=' + encodeURIComponent(id), 'GET', null, {});
  if(!r.ok || !r.url) { box.innerHTML = `<div style="font-size:.78rem;color:var(--loss)">❌ ${_h(_tr(r.error || ''))}</div>`; return; }
  box.innerHTML = `<video src="${_h(r.url)}" controls autoplay playsinline style="width:100%;max-height:70vh;border-radius:8px;background:#000"></video>`;
}
function _clipEmbed(url) {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
  if(yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const tc = url.match(/clips\.twitch\.tv\/([\w-]+)/) || url.match(/twitch\.tv\/\w+\/clip\/([\w-]+)/);
  if(tc) return `https://clips.twitch.tv/embed?clip=${tc[1]}&parent=${location.hostname || 'localhost'}`;
  const st = url.match(/streamable\.com\/(\w+)/);
  if(st) return `https://streamable.com/e/${st[1]}`;
  return null;
}
// 🎬 wgrywanie pliku z akcją (kapitanowie obu drużyn meczu, admin) → kanał „Akcje meczów” na Discordzie → odtwarzanie na stronie
function _canUploadClip(s) { // kapitanowie i gracze obu drużyn meczu (konto połączone z nickiem w składzie); admin
  if(_isLoggedInSync()) return true; if(!discordUser?.id || !s) return false; const me = _normNick((typeof _myGamertag === 'function' && _myGamertag()) || '');
  return (teamRegistrations || []).some(r => r.status === 'approved' && [s.team1, s.team2].includes(r.teamName) && (String(r.captain?.id) === String(discordUser.id) || (r.players || []).some(p => String(p.discordId || '') === String(discordUser.id) || (me && _normNick(p.gamertag) === me)))); }
function uploadClip(k) {
  if(!_ensureSession()) return;
  const f = document.getElementById('clip-file')?.files?.[0], title = document.getElementById('clip-title').value.trim(), st = document.getElementById('clip-up-status'), bar = document.getElementById('clip-up-bar');
  if(!f) { showToast(_g('Wybierz plik wideo', 'Choose a video file'), 'info'); return; }
  if(!/^video\//.test(f.type)) { showToast(_g('To nie jest plik wideo', 'That is not a video file'), 'info'); return; }
  if(f.size > 100 * 1048576) { showToast(_g(`Plik ma ${(f.size / 1048576).toFixed(0)} MB — maks. 100 MB`, `The file is ${(f.size / 1048576).toFixed(0)} MB — max. 100 MB`), 'info'); return; }
  const x = new XMLHttpRequest(); x.open('POST', workerUrl.replace(/\/+$/, '') + '/clips/upload');
  x.setRequestHeader('Content-Type', f.type); x.setRequestHeader('X-Discord-Session', discordUser.session);
  if(_isLoggedInSync()) x.setRequestHeader('X-Admin-Token', _adminToken());
  x.setRequestHeader('X-Meta', encodeURIComponent(JSON.stringify({ scheduleId: k, title, filename: f.name })));
  bar.parentElement.style.display = 'block'; st.style.color = 'var(--muted)';
  x.upload.onprogress = e => { if(e.lengthComputable) { const p = Math.round(e.loaded / e.total * 100); bar.style.width = p + '%'; st.textContent = p < 100 ? `⏳ ${_g('Wysyłam', 'Uploading')} ${p}%…` : '⏳ ' + _g('Bot wrzuca film na Discord…', 'The bot is posting the video to Discord…'); } };
  x.onload = () => { let r = {}; try { r = JSON.parse(x.responseText); } catch(e) {}
    if(x.status === 200 && r.ok) { clipsList.unshift(r.clip); showToast(_g('🎬 Akcja dodana', '🎬 Highlight added'), 'success'); openClips(k); }
    else { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + _tr(r.error || _g('Wysyłka nie powiodła się', 'Upload failed')); bar.parentElement.style.display = 'none'; } };
  x.onerror = () => { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + _g('Błąd sieci', 'Network error'); };
  x.send(f);
}
// 🔍 RAPORT RYWALA — forma, H2H, średnie drużyny, kluczowi gracze (z kartami), mocne/słabe strony, wskazówki
function _scoutTeam(team, sid) {
  const N = x => _normNick(x), ms = _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === (sid || null) && [m.team1.name, m.team2.name].some(t => N(t) === N(team)))).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const games = ms.map(m => { const me = N(m.team1.name) === N(team) ? m.team1 : m.team2, op = me === m.team1 ? m.team2 : m.team1; return { m, me, op, won: (+me.score || 0) > (+op.score || 0), date: m.date }; });
  const sum = (arr, f) => arr.reduce((s, x) => s + (+f(x) || 0), 0), tot = (g, k) => sum(g.me.players || [], p => p[k]);
  const n = games.length || 1, T = { gp: games.length, w: games.filter(g => g.won).length, pf: sum(games, g => g.me.score) / n, pa: sum(games, g => g.op.score) / n,
    fg: sum(games, g => tot(g, 'fgm')) / Math.max(1, sum(games, g => tot(g, 'fga'))), tp: sum(games, g => tot(g, 'tpm')) / Math.max(1, sum(games, g => tot(g, 'tpa'))),
    reb: sum(games, g => tot(g, 'reb')) / n, ast: sum(games, g => tot(g, 'ast')) / n, to: sum(games, g => tot(g, 'to')) / n, stl: sum(games, g => tot(g, 'stl')) / n, tpa: sum(games, g => tot(g, 'tpa')) / n };
  const by = {}; games.forEach(g => (g.me.players || []).forEach(p => { const k = N(p.name); const a = by[k] = by[k] || { name: p.name, gp: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tpm: 0, pos: p.pos || '' }; a.gp++; ['pts', 'reb', 'ast', 'stl', 'blk', 'tpm'].forEach(f => a[f] += +p[f] || 0); }));
  const players = Object.values(by).map(a => ({ ...a, ppg: a.pts / a.gp, rpg: a.reb / a.gp, apg: a.ast / a.gp, share: a.pts / Math.max(1, sum(games, g => tot(g, 'pts'))) })).sort((a, b) => b.ppg - a.ppg);
  return { games, T, players };
}
function openMediaDay(regId) {
  const r = (teamRegistrations || []).find(x => x.id === regId); if(!r) return; const md = r.media || {}, en = currentLang === 'en', m = _fxModal('md-modal', 560); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('md-modal', `🎬 Media day — ${_h(r.teamName)}`) + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">${_g('Przedstaw drużynę przed sezonem — prezentacja trafi do galerii „Poznaj drużyny”, na Discorda i X.', 'Introduce your team before the season — it goes to the “Meet the teams” gallery, Discord and X.')}</div>
    <label style="${_MODAL_LBL}">🎯 ${_g('Cel na sezon', 'Goal for the season')}</label><input id="md-goal" maxlength="140" value="${_h(md.goal || '')}" placeholder="${_g('np. awans do playoffów', 'e.g. make the playoffs')}" style="${_MODAL_INP};margin-bottom:.5rem">
    <label style="${_MODAL_LBL}">👀 ${_g('Gracz do obserwowania', 'Player to watch')}</label><select id="md-watch" style="${_MODAL_INP};margin-bottom:.5rem"><option value="">—</option>${(r.players || []).map(p => `<option ${md.watch === p.gamertag ? 'selected' : ''}>${_h(p.gamertag)}</option>`).join('')}</select>
    <label style="${_MODAL_LBL}">🏀 ${_g('Styl gry', 'Style of play')}</label><select id="md-style" style="${_MODAL_INP};margin-bottom:.5rem"><option value="">—</option>${_MD_STYLES.map(([k, pl, e]) => `<option value="${k}" ${md.style === k ? 'selected' : ''}>${en ? e : pl}</option>`).join('')}</select>
    <label style="${_MODAL_LBL}">💬 ${_g('Słowo od kapitana', 'A word from the captain')}</label><textarea id="md-quote" maxlength="220" rows="3" placeholder="${_g('np. Jesteśmy głodni wygrywania. Do zobaczenia na parkiecie!', 'e.g. We’re hungry to win. See you on the court!')}" style="${_MODAL_INP};margin-bottom:.7rem">${_h(md.quote || '')}</textarea>
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('md-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" onclick="mediaDaySave('${regId}')">💾 ${_g('Zapisz', 'Save')}</button></div></div>`;
}
async function mediaDaySave(regId) {
  const v = id => document.getElementById(id).value; const r = await _api('/team-registration/media', 'POST', { regId, goal: v('md-goal'), watch: v('md-watch'), style: v('md-style'), quote: v('md-quote') }, { session: !!discordUser, admin: _isLoggedInSync() });
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; } const i = teamRegistrations.findIndex(x => x.id === regId); if(i >= 0) teamRegistrations[i] = r.registration;
  _fxClose('md-modal'); showToast('🎬 ' + _g('Prezentacja zapisana!', 'Team intro saved!'), 'success'); try { renderStories(); } catch(e) {}
}
function openMediaGallery() {
  const T = _mdTeams(), en = currentLang === 'en', my = String(discordUser?.id || ''), st = k => (_MD_STYLES.find(x => x[0] === k) || [])[en ? 2 : 1] || '', m = _fxModal('mdg-modal', 820); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('mdg-modal', `🎬 ${_g('Poznaj drużyny', 'Meet the teams')}`) + `<div data-notr><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.6rem">${T.map(r => { const md = r.media || {}, mine = String(r.captain?.id) === my || _isLoggedInSync();
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:.7rem">
      <div style="display:flex;gap:.55rem;align-items:center;margin-bottom:.45rem">${teamLogo(r.teamName, 44, '1rem')}<div><b>${_h(r.teamName)}</b><div style="font-size:.7rem;color:var(--muted)">${(r.players || []).length} ${_g('graczy', 'players')} · ${_g('kapitan', 'captain')} ${_h(r.captain?.name || '')}</div></div></div>
      ${md.at ? `${md.goal ? `<div style="font-size:.8rem">🎯 ${_h(md.goal)}</div>` : ''}${md.watch ? `<div style="font-size:.8rem">👀 ${_g('Do obserwowania', 'Watch')}: <b>${_h(md.watch)}</b></div>` : ''}${md.style ? `<div style="font-size:.8rem">${st(md.style)}</div>` : ''}${md.quote ? `<div style="font-size:.8rem;font-style:italic;color:var(--muted);margin-top:.3rem">„${_h(md.quote)}”</div>` : ''}`
        : `<div style="font-size:.76rem;color:var(--muted)">${_g('Drużyna jeszcze się nie przedstawiła.', 'This team hasn’t introduced itself yet.')}</div>`}
      <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.5rem">${mine ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.15rem .45rem" onclick="_fxClose('mdg-modal');openMediaDay('${r.id}')">✏️ ${md.at ? _g('Edytuj', 'Edit') : _g('Wypełnij', 'Fill in')}</button>` : ''}${md.at ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.15rem .45rem" onclick="mediaDayImage('${r.id}')">🖼 ${_g('Grafika', 'Graphic')}</button>` : ''}${md.at && _isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.15rem .45rem" onclick="mediaDayPost('${r.id}')">📣 Discord</button>` : ''}</div></div>`; }).join('') || `<div style="color:var(--muted)">${_g('Brak drużyn.', 'No teams yet.')}</div>`}</div></div>`;
}
async function mediaDayImage(regId) {
  const r = (teamRegistrations || []).find(x => x.id === regId); if(!r) return; const md = r.media || {}, en = currentLang === 'en', c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1080, 1350); bg.addColorStop(0, '#1a1205'); bg.addColorStop(1, '#0b0d12'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1350);
  const txt = (t, x, y, f, col, al = 'left') => { g.font = f; g.fillStyle = col; g.textAlign = al; g.fillText(t, x, y); };
  const wrap = (t, x, y, maxW, lh, f, col) => { g.font = f; g.fillStyle = col; g.textAlign = 'left'; let line = '', yy = y; for(const w of String(t).split(' ')) { const tt = line ? line + ' ' + w : w; if(g.measureText(tt).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = tt; } if(line) g.fillText(line, x, yy); return yy; };
  txt('🎬 MEDIA DAY', 80, 130, '900 56px "Barlow Condensed", Arial', '#f5c518'); txt((EU_MODE ? 'EU CHEMIK LEAGUE' : 'NBA 2K PRO-AM EKSTRAKLASA'), 80, 185, '700 32px Arial', '#9ca3af');
  try { if(r.logo) { const im = new Image(); im.crossOrigin = 'anonymous'; await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = r.logo; setTimeout(no, 5000); }); g.drawImage(im, 80, 240, 260, 260); } else throw 0; } catch(e) { g.fillStyle = '#f5c518'; g.beginPath(); g.arc(210, 370, 130, 0, Math.PI * 2); g.fill(); txt(r.teamName.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase(), 210, 400, '900 90px Arial', '#111', 'center'); }
  wrap(r.teamName.toUpperCase(), 380, 330, 640, 86, '900 84px "Barlow Condensed", Arial', '#fff'); txt(`${(r.players || []).length} ${en ? 'PLAYERS' : 'GRACZY'} · ${en ? 'CAPTAIN' : 'KAPITAN'} ${String(r.captain?.name || '').toUpperCase()}`, 380, 470, '700 30px Arial', '#9ca3af');
  let y = 600; const block = (ico, lab, val) => { if(!val) return; txt(ico + ' ' + lab, 80, y, '800 34px Arial', '#f5c518'); y = wrap(val, 80, y + 52, 920, 50, '600 42px Arial', '#fff') + 80; };
  block('🎯', en ? 'GOAL FOR THE SEASON' : 'CEL NA SEZON', md.goal); block('👀', en ? 'PLAYER TO WATCH' : 'GRACZ DO OBSERWOWANIA', md.watch); block('🏀', en ? 'STYLE' : 'STYL GRY', (_MD_STYLES.find(x => x[0] === md.style) || [])[en ? 2 : 1]);
  if(md.quote) { txt('💬 ' + (en ? 'FROM THE CAPTAIN' : 'SŁOWO OD KAPITANA'), 80, y, '800 34px Arial', '#f5c518'); wrap('„' + md.quote + '”', 80, y + 52, 920, 50, 'italic 600 40px Arial', '#e5e7eb'); }
  txt(location.host || 'chemikleagues.com', 80, 1300, '700 30px Arial', '#6b7280');
  let blob; try { blob = await new Promise(rs => c.toBlob(rs, 'image/png')); } catch(e) { showToast('❌ ' + _g('Nie udało się utworzyć grafiki', 'Could not create the graphic'), 'error'); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `media-day-${_normNick(r.teamName)}.png`; a.click();
}
async function mediaDayPost(regId) {
  const r = (teamRegistrations || []).find(x => x.id === regId); if(!r?.media) return; if(!confirm(`Opublikować prezentację ${r.teamName} na Discordzie (kanał drużyn)?`)) return; const md = r.media, en = EU_MODE;
  const ok = await _teamRegDiscordSend({ route: 'teamApproved', embeds: [{ title: `🎬 Media day: ${r.teamName}`, color: 0xf5c518, description: [md.goal && `🎯 **${en ? 'Goal' : 'Cel'}:** ${md.goal}`, md.watch && `👀 **${en ? 'Player to watch' : 'Do obserwowania'}:** ${md.watch}`, md.style && `🏀 **${en ? 'Style' : 'Styl'}:** ${(_MD_STYLES.find(x => x[0] === md.style) || [])[en ? 2 : 1]}`, md.quote && `💬 *„${md.quote}”* — ${r.captain?.name || ''}`, `\n👥 ${(r.players || []).map(p => p.gamertag).join(' · ')}`].filter(Boolean).join('\n'),
    footer: { text: en ? 'EU Chemik League · Media day' : 'NBA 2K Pro-Am Ekstraklasa · Media day' }, timestamp: new Date().toISOString() }] }, r.logo);
  showToast(ok ? '📣 Opublikowano' : '⚠ Discord nie odpowiedział', ok ? 'success' : 'info');
}
// 🎙️ WYWIAD POMECZOWY — formularz dla MVP i podgląd odpowiedzi
async function openInterview(id) {
  const r = await _api('/interview?m=' + encodeURIComponent(id), 'GET', null, discordUser?.session ? { session: true } : {}); const m = _fxModal('iv-modal', 560); m.classList.add('open');
  if(!r.ok) { m.querySelector('.modal').innerHTML = _fxHead('iv-modal', '🎙️') + `<div style="color:var(--muted)">${_h(_tr(r.error || ''))}</div>`; return; }
  m.querySelector('.modal').innerHTML = _fxHead('iv-modal', `🎙️ ${_g('Wywiad pomeczowy', 'Post-game interview')}`) + `<div data-notr>
    <div style="font-size:.86rem;margin-bottom:.6rem"><b>${_h(r.name)}</b> (${_h(r.team)}) · ${_h(r.team)} <b>${_h(r.score)}</b> ${_h(r.opp)}<div style="font-size:.74rem;color:var(--muted)">MVP: ${_h(r.line || '')}</div></div>
    ${r.q.map((q, i) => `<label style="${_MODAL_LBL}">${_h(q)}</label>${r.canAnswer ? `<textarea id="iv-a${i}" maxlength="280" rows="2" style="${_MODAL_INP};margin-bottom:.5rem"></textarea>` : `<div style="font-size:.86rem;font-style:italic;margin-bottom:.6rem">${r.answers?.[i] ? '„' + _h(r.answers[i]) + '”' : '—'}</div>`}`).join('')}
    ${r.canAnswer ? `<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" onclick="interviewSend('${id}')">🎙️ ${_g('Wyślij wywiad', 'Send the interview')}</button></div>` : !r.answers ? `<div style="font-size:.78rem;color:var(--muted)">${_g('MVP jeszcze nie udzielił wywiadu.', 'The MVP hasn’t answered yet.')}</div>` : ''}</div>`;
}
async function interviewSend(id) { const answers = [0, 1, 2].map(i => document.getElementById('iv-a' + i)?.value || ''); const r = await _api('/interview', 'POST', { m: id, answers }, { session: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; } (window._interviews = window._interviews || {})[id] = { answers: r.answers }; showToast('🎙️ ' + _g('Dzięki! Wywiad trafi na stronę i Discorda.', 'Thanks! The interview goes on the website and Discord.'), 'success'); openInterview(id); }
async function _linksFetch(lg) {
  const mine = (EU_MODE ? 'EU' : 'PL') === lg; if(mine) return _api('/admin/links', 'GET', null, { admin: true });
  try { const r = await fetch(_LINK_SRC[lg].url.replace(/\/+$/, '') + '/admin/links', { headers: { 'X-Admin-Token': _adminToken() } }); return await r.json(); } catch(e) { return { error: e.message }; }
}
async function openLinkedAccounts() {
  if(!_isLoggedInSync()) return; const m = _fxModal('links-modal', 980); m.classList.add('open'); m.querySelector('.modal').innerHTML = _fxHead('links-modal', '🔗 Połączone konta') + '⏳';
  const [pl, eu] = await Promise.all([_linksFetch('PL'), _linksFetch('EU')]); window._links = { PL: pl, EU: eu, q: '' }; _linksDraw();
}
function _linksCand(to) { // konta połączone w drugiej lidze, których nick jest niepołączony w składzie tej ligi
  const L = window._links, from = to === 'EU' ? 'PL' : 'EU', S = L[from], T = L[to]; if(!S?.ok || !T?.ok) return [];
  const cf = x => _normNick(x).replace(/[i1]/g, 'l').replace(/0/g, 'o'), want = new Set(T.teams.flatMap(t => t.players.filter(p => !p.linked).map(p => cf(p.gamertag)))); // I/l/1 i O/0 — ten sam znak
  const src = [...S.teams.flatMap(t => t.players.filter(p => p.linked && p.uid && !p.pending).map(p => ({ uid: p.uid, name: p.discord, gamertag: p.gamertag }))), ...S.loose.map(x => ({ uid: x.uid, name: x.discord, gamertag: x.gamertag }))];
  const seen = new Set(); return src.filter(x => want.has(cf(x.gamertag)) && !seen.has(x.uid) && seen.add(x.uid));
}
async function linksImport(to) {
  const C = _linksCand(to); if(!C.length) return; if(!confirm(`Połączyć w lidze ${to} ${C.length} kont(a) z ligi ${to === 'EU' ? 'PL' : 'EU'}?\n${C.map(c => c.gamertag + ' → @' + (c.name || c.uid)).join('\n')}`)) return;
  let r; if((EU_MODE ? 'EU' : 'PL') === to) r = await _api('/admin/links/import', 'POST', { links: C }, { admin: true });
  else { try { r = await (await fetch(_LINK_SRC[to].url.replace(/\/+$/, '') + '/admin/links/import', { method: 'POST', headers: { 'X-Admin-Token': _adminToken(), 'Content-Type': 'application/json' }, body: JSON.stringify({ links: C }) })).json(); } catch(e) { r = { error: e.message }; } }
  if(!r?.ok) { showToast('❌ ' + (r?.error || 'Błąd'), 'error'); return; }
  showToast(`🔗 Połączono ${r.linked.length}${r.skipped.length ? ` · pominięto ${r.skipped.length}` : ''}`, 'success'); openLinkedAccounts();
}
function _linksDraw() {
  const L = window._links, q = _normNick(L.q || ''), m = document.getElementById('links-modal');
  const col = lg => { const d = L[lg]; if(!d?.ok) return `<div style="font-size:.82rem;color:var(--muted)">${lg === 'EU' ? '🇪🇺' : '🇵🇱'} <b>Liga ${lg}</b><br>Nie udało się pobrać danych${d?.error === 'Unauthorized' ? ' (ten serwer nie przyjął sesji admina)' : ''}.<br><a href="${_LINK_SRC[lg].site}/#polaczone-konta" target="_blank" style="color:var(--accent)">Otwórz listę na stronie ligi ${lg} ›</a></div>`;
    const hit = s => !q || _normNick(s || '').includes(q), pct = d.stats.players ? Math.round(d.stats.linked / d.stats.players * 100) : 0;
    const cand = _linksCand(lg), RL = { admin: ['👑', 'admin'], captain: ['🧢', 'kapitan'], player: ['🏀', 'gracz'], fan: ['👀', 'kibic'] }, rf = L['rf' + lg] || 'all', A = (d.accounts || []).filter(a => (rf === 'all' || a.role === rf) && (hit(a.name) || hit(a.gamertag) || hit(a.team)));
    const accHtml = `<details style="margin-top:.6rem" ${L['open' + lg] ? 'open' : ''} ontoggle="window._links['open${lg}']=this.open"><summary style="cursor:pointer;font-size:.8rem;font-weight:700">👥 Konta zalogowane przez Discord (${(d.accounts || []).length})</summary>
      <div style="display:flex;gap:.25rem;flex-wrap:wrap;margin:.4rem 0">${[['all', 'wszyscy'], ...Object.entries(RL).map(([k, [i, l]]) => [k, i + ' ' + l])].map(([k, l]) => `<button class="btn ${rf === k ? 'btn-primary' : 'btn-ghost'}" style="font-size:.64rem;padding:.1rem .4rem" onclick="window._links['rf${lg}']='${k}';window._links['open${lg}']=true;_linksDraw()">${l} ${k === 'all' ? '' : '(' + (d.accounts || []).filter(a => a.role === k).length + ')'}</button>`).join('')}</div>
      ${A.slice(0, 200).map(a => `<div style="display:flex;gap:.4rem;align-items:center;font-size:.74rem;padding:.12rem 0;border-top:1px solid var(--border)"><span title="${RL[a.role][1]}">${RL[a.role][0]}</span><span style="flex:1"><b>${_h(a.name || a.uid)}</b>${a.gamertag ? ` <span style="color:var(--muted)">· ${_h(a.gamertag)}</span>` : ''}${a.team ? ` <span style="color:var(--muted)">· ${_h(a.team)}</span>` : ''}</span><span style="color:var(--muted);font-size:.66rem">${a.lastSeen ? new Date(a.lastSeen).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) : ''}${a.days ? ' · ' + a.days + ' dni' : ''}</span></div>`).join('') || '<div style="font-size:.74rem;color:var(--muted)">Brak</div>'}</details>`;
    return `<div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.4rem"><b>${lg === 'EU' ? '🇪🇺' : '🇵🇱'} Liga ${lg}</b><span style="font-size:.78rem">połączone: <b>${d.stats.linked}/${d.stats.players}</b> (${pct}%)</span></div>
      ${cand.length ? `<button class="btn btn-primary" style="font-size:.72rem;width:100%;margin-bottom:.5rem" onclick="linksImport('${lg}')">⇄ Przenieś połączenia z ${lg === 'EU' ? 'PL' : 'EU'}: ${cand.length} ${_plPL(cand.length, 'gracz', 'graczy', 'graczy')} gra w obu ligach</button>` : ''}
      <div style="height:6px;background:var(--surface);border-radius:3px;overflow:hidden;margin-bottom:.6rem"><div style="height:100%;width:${pct}%;background:var(--win)"></div></div>
      ${d.teams.map(t => { const P = t.players.filter(p => hit(p.gamertag) || hit(p.discord) || hit(t.team)); if(!P.length) return ''; const n = t.players.filter(p => p.linked).length;
        return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.45rem .6rem;margin-bottom:.4rem"><div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.25rem"><b>${_h(t.team)}${t.status === 'pending' ? ' <span style="color:var(--muted);font-weight:400">(oczekuje)</span>' : ''}</b><span style="color:${n === t.players.length ? 'var(--win)' : 'var(--accent)'}">${n}/${t.players.length}</span></div>
          ${P.map(p => `<div style="display:flex;gap:.4rem;font-size:.76rem;padding:.08rem 0"><span>${p.linked ? (p.pending ? '⏳' : '✅') : '⬜'}</span><span style="flex:1">${_h(p.gamertag)}</span><span style="color:var(--muted)">${p.linked ? '@' + _h(p.discord || p.uid) : 'niepołączony'}</span></div>`).join('')}</div>`; }).join('')}
      ${d.loose.filter(x => hit(x.gamertag) || hit(x.discord)).length ? `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.5rem 0 .25rem">KONTA POZA SKŁADAMI</div>${d.loose.filter(x => hit(x.gamertag) || hit(x.discord)).map(x => `<div style="display:flex;gap:.4rem;font-size:.76rem;padding:.08rem 0"><span>🔗</span><span style="flex:1">${_h(x.gamertag)}</span><span style="color:var(--muted)">@${_h(x.discord || x.uid)}${x.team ? ' · ' + _h(x.team) : ''}</span></div>`).join('')}` : ''}${accHtml}</div>`; };
  m.querySelector('.modal').innerHTML = _fxHead('links-modal', '🔗 Połączone konta') + `<div data-notr>
    <input value="${_h(L.q || '')}" placeholder="Szukaj nicku, konta Discord albo drużyny…" oninput="window._links.q=this.value;_linksDraw();const i=document.querySelector('#links-modal input');i.focus();i.setSelectionRange(i.value.length,i.value.length)" style="${_MODAL_INP};margin-bottom:.6rem">
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:.6rem">✅ połączone · ⏳ czeka na potwierdzenie kapitana · ⬜ gracz ze składu bez połączonego konta</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1rem;max-height:65vh;overflow:auto">${col('PL')}${col('EU')}</div></div>`;
}
function openMatchCenter(id) {
  const s = _ssItem(id); if(!s) return; _modalUrl('/mecz/' + encodeURIComponent(id)); const ctx = _ssCtx(), en = currentLang === 'en', res = _ssResult(ctx, s), N = x => _normNick(x);
  const ids = [...(s.matchIds || []), ...(s.matchId != null ? [s.matchId] : [])].map(String), games = matches.filter(m => ids.includes(String(m.id))).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const when = s.date ? new Date(s.date + 'T' + (s.time || '20:00') + ':00') : null, upcoming = !res?.done && when && when > new Date();
  const gs = p => (+p.pts || 0) + .4 * (+p.fgm || 0) - .7 * (+p.fga || 0) + .4 * (+p.reb || 0) + .7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0);
  const mvp = games.flatMap(m => [m.team1, m.team2].flatMap(t => (t.players || []).map(p => ({ ...p, team: t.name })))).reduce((acc, p) => { const k = N(p.name); const x = acc[k] = acc[k] || { name: p.name, team: p.team, gs: 0, pts: 0, reb: 0, ast: 0, n: 0 }; x.gs += gs(p); x.pts += +p.pts || 0; x.reb += +p.reb || 0; x.ast += +p.ast || 0; x.n++; return acc; }, {});
  const best = Object.values(mvp).sort((a, b) => b.gs - a.gs)[0];
  const h2h = _withAllMatches(() => matches.filter(m => !ids.includes(String(m.id)) && !m.walkover && [m.team1.name, m.team2.name].map(N).sort().join('|') === [s.team1, s.team2].map(N).sort().join('|'))).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const h1 = h2h.filter(m => (N(m.team1.name) === N(s.team1) ? +m.team1.score > +m.team2.score : +m.team2.score > +m.team1.score)).length;
  const H = t => `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.9rem 0 .35rem">${t}</div>`;
  const status = res?.done ? `<span style="color:var(--win)">✅ ${_g('Zakończony', 'Final')}</span>` : games.length ? `<span style="color:#ef4444">● ${_g('W trakcie', 'In progress')}</span>` : upcoming ? `⏳ <span id="mc-cd"></span>` : `<span style="color:var(--muted)">${_g('Czeka na wynik', 'Awaiting result')}</span>`;
  const m = _fxModal('mc-modal', 760); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('mc-modal', `🏟️ ${_g('Centrum meczu', 'Match center')}`) + `<div data-notr>
    <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.6rem;text-align:center;background:var(--surface2);border-radius:14px;padding:.8rem">
      <div>${teamLogo(s.team1, 54, '1.1rem')}<div style="font-weight:800;margin-top:.3rem">${_h(s.team1)}</div></div>
      <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.2rem;line-height:1">${res ? `${res.w1} : ${res.w2}` : 'VS'}</div><div style="font-size:.72rem;color:var(--muted)">Week ${s.week || '—'}${when ? ' · ' + when.toLocaleString(en ? 'en-GB' : 'pl-PL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div><div style="font-size:.76rem;margin-top:.2rem">${status}</div></div>
      <div>${teamLogo(s.team2, 54, '1.1rem')}<div style="font-weight:800;margin-top:.3rem">${_h(s.team2)}</div></div></div>
    ${!res?.done ? `${H('🔮 ' + _g('TYPY KIBICÓW', 'FAN PICKS'))}<div>${(() => { try { return _ssVoteBar(ctx, s) || ''; } catch(e) { return ''; } })()}</div>` : ''}
    ${(() => { try { const l = _streamLinks(s); return l ? H('📺 ' + _g('TRANSMISJE', 'STREAMS')) + `<div>${l}</div>` : ''; } catch(e) { return ''; } })()}
    ${games.length ? H('🏀 ' + _g('MECZE', 'GAMES')) + games.map((g, i) => { const t1 = N(g.team1.name) === N(s.team1), a = t1 ? g.team1 : g.team2, b = t1 ? g.team2 : g.team1;
      return `<div onclick="_fxClose('mc-modal');openMatch(${g.id})" style="display:flex;justify-content:space-between;align-items:center;padding:.4rem .5rem;border:1px solid var(--border);border-radius:9px;margin-bottom:.3rem;cursor:pointer;font-size:.84rem"><span>${_g('Mecz', 'Game')} ${i + 1}</span><b>${a.score} : ${b.score}</b><span style="font-size:.72rem;color:var(--accent)">📊 ${_g('statystyki', 'box score')}</span></div>`; }).join('') : ''}
    ${best && games.length ? H('⭐ MVP ' + _g('MECZU', 'OF THE MATCH')) + `<div style="display:flex;align-items:center;gap:.6rem;cursor:pointer" onclick="openPlayerCardImg('${_h(best.name).replace(/'/g, "\\'")}')"><b style="font-size:1rem">${_h(best.name)}</b><span style="font-size:.8rem;color:var(--muted)">${_h(best.team)} · ${best.pts} PTS · ${best.reb} REB · ${best.ast} AST${best.n > 1 ? ` (${best.n} ${_g('mecze', 'games')})` : ''}</span><span style="font-size:.7rem;color:var(--accent)">🃏</span></div>` : ''}
    ${games.map(g => window._interviews?.[String(g.id)] ? { g, iv: window._interviews[String(g.id)] } : null).filter(Boolean).map(({ g, iv }) => H('🎙️ ' + _g('WYWIAD Z MVP', 'MVP INTERVIEW')) + `<div style="font-size:.84rem;cursor:pointer" onclick="openInterview('${g.id}')"><b>${_h(iv.name || '')}</b>: „${_h((iv.answers || []).find(Boolean) || '')}” <span style="color:var(--accent);font-size:.74rem">${_g('cały wywiad ›', 'full interview ›')}</span></div>`).join('')}
    ${games.find(g => g.recap) ? H('📝 ' + _g('OPIS MECZU', 'RECAP')) + `<div style="font-size:.84rem;line-height:1.55">${_h(games.filter(g => g.recap).pop().recap)}</div>` : ''}
    ${H('⚔️ ' + _g('WCZEŚNIEJSZE MECZE', 'PREVIOUS MEETINGS'))}${h2h.length ? `<div style="font-size:.82rem;margin-bottom:.25rem"><b>${_h(s.team1)}</b> ${h1}–${h2h.length - h1} <b>${_h(s.team2)}</b></div>${h2h.slice(0, 5).map(g => `<div style="font-size:.76rem;display:flex;justify-content:space-between;padding:.15rem 0;border-top:1px solid var(--border)"><span>${new Date(g.date).toLocaleDateString(en ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'short', year: '2-digit' })}</span><span>${_h(g.team1.name)} <b>${g.team1.score}:${g.team2.score}</b> ${_h(g.team2.name)}</span></div>`).join('')}` : `<div style="font-size:.78rem;color:var(--muted)">${_g('Pierwsze spotkanie tych drużyn', 'First meeting of these teams')}</div>`}
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;margin-top:1rem">
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="_fxClose('mc-modal');openScoutReport('${s.id}')">🔍 ${_g('Raport rywala', 'Scouting')}</button>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="_fxClose('mc-modal');openClips('${s.id}')">🎬 ${_g('Akcje', 'Highlights')}${(clipsList || []).filter(c => String(c.scheduleId) === String(s.id)).length ? ' (' + (clipsList || []).filter(c => String(c.scheduleId) === String(s.id)).length + ')' : ''}</button>
      ${games.length || upcoming ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="_fxClose('mc-modal');openMatchPoster('${s.id}')">🖼 ${_g('Plakat', 'Poster')}</button>` : ''}
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="navigator.clipboard?.writeText(location.origin + '/mecz/${s.id}').then(()=>showToast('🔗 ' + _g('Skopiowano link do meczu', 'Match link copied'),'success'))">🔗 Link</button></div></div>`;
  if(upcoming) { clearInterval(window._mcT); const tick = () => { const el = document.getElementById('mc-cd'); if(!el) return clearInterval(window._mcT); const d = when - Date.now(); if(d <= 0) { el.textContent = _g('Zaczyna się!', 'Starting!'); return; } const h = Math.floor(d / 3600e3), mi = Math.floor(d % 3600e3 / 60e3); el.textContent = (h >= 24 ? Math.floor(h / 24) + _g(' d ', 'd ') + (h % 24) + ' h' : h + ' h ' + mi + ' min'); }; tick(); window._mcT = setInterval(tick, 30000); }
}
function openScoutReport(id) {
  const s = _ssItem(id); if(!s) return; const sid = s.seasonId || currentSeasonId || null, en = currentLang === 'en';
  const myTeam = discordUser ? (teamRegistrations || []).find(r => r.status === 'approved' && [s.team1, s.team2].includes(r.teamName) && (String(r.captain?.id) === String(discordUser.id) || (r.players || []).some(p => String(p.discordId || '') === String(discordUser.id))))?.teamName : null;
  window._scout = { id, team: myTeam ? (myTeam === s.team1 ? s.team2 : s.team1) : s.team2, other: null }; window._scout.other = window._scout.team === s.team1 ? s.team2 : s.team1; _scoutDraw();
}
function _scoutDraw() {
  const S = window._scout, s = _ssItem(S.id), sid = s.seasonId || currentSeasonId || null, en = currentLang === 'en', team = S.team, R = _scoutTeam(team, sid), O = _scoutTeam(S.other, sid), T = R.T;
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1), pct = v => Math.round(v * 100) + '%';
  const h2h = R.games.filter(g => _normNick(g.op.name) === _normNick(S.other));
  const form = R.games.slice(-5).map(g => `<span title="${_h(g.op.name)} ${g.me.score}:${g.op.score}" style="display:inline-flex;width:24px;height:24px;border-radius:6px;align-items:center;justify-content:center;font-weight:800;font-size:.72rem;background:${g.won ? 'var(--win)' : 'var(--loss)'};color:#fff">${g.won ? (en ? 'W' : 'W') : (en ? 'L' : 'P')}</span>`).join(' ');
  const attrsOf = name => _pcData(name, 'season')?.sk?.attrs || {}, top = R.players.slice(0, 5);
  // mocne / słabe strony: średnie percentyle atrybutów 6 najważniejszych graczy
  const AT = [['shoot', _g('rzut z gry', 'shooting')], ['three', _g('rzut za 3', '3-point shooting')], ['inside', _g('gra pod koszem', 'inside scoring')], ['play', _g('rozegranie', 'playmaking')], ['def', _g('obrona', 'defense')], ['reb', _g('zbiórki', 'rebounding')], ['ball', _g('kontrola piłki', 'ball control')]];
  const core = R.players.slice(0, 6), avgA = AT.map(([k, l]) => { const v = core.map(p => attrsOf(p.name)[k]?.p).filter(x => x != null); return { k, l, v: v.length ? v.reduce((a, b) => a + b, 0) / v.length : .5 }; }).sort((a, b) => b.v - a.v);
  const strong = avgA.slice(0, 2).filter(x => x.v >= .55), weak = avgA.slice(-2).reverse().filter(x => x.v <= .45);
  const tips = [];
  if(top[0] && top[0].share >= .28) tips.push(_g(`🎯 Pilnujcie <b>${_h(top[0].name)}</b> — zdobywa <b>${pct(top[0].share)}</b> punktów drużyny (${f1(top[0].ppg)} na mecz).`, `🎯 Lock down <b>${_h(top[0].name)}</b> — <b>${pct(top[0].share)}</b> of the team’s points (${f1(top[0].ppg)} per game).`));
  if(T.to >= 14) tips.push(_g(`🧤 Rywal traci dużo piłek (<b>${f1(T.to)}</b> na mecz) — presja na rozgrywającego się opłaci.`, `🧤 They turn it over a lot (<b>${f1(T.to)}</b> per game) — pressure the ball handler.`));
  if(T.tpa >= 20 && T.tp >= .35) tips.push(_g(`🏹 Dużo i celnie rzucają za 3 (<b>${pct(T.tp)}</b>, ${f1(T.tpa)} prób) — wychodźcie do strzelców.`, `🏹 They shoot a lot of threes and make them (<b>${pct(T.tp)}</b>, ${f1(T.tpa)} attempts) — close out on shooters.`));
  else if(T.tpa >= 15 && T.tp < .28) tips.push(_g(`🧱 Słabo rzucają za 3 (<b>${pct(T.tp)}</b>) — można zagęścić pole trzech sekund.`, `🧱 Poor from three (<b>${pct(T.tp)}</b>) — pack the paint.`));
  if(O.T.gp && T.reb && O.T.reb > T.reb + 3) tips.push(_g(`💪 Na zbiórkach macie przewagę (${f1(O.T.reb)} vs ${f1(T.reb)}) — walczcie o drugą szansę.`, `💪 You out-rebound them (${f1(O.T.reb)} vs ${f1(T.reb)}) — crash the glass.`));
  if(T.pa >= T.pf + 5) tips.push(_g(`🛡️ Tracą średnio <b>${f1(T.pa)}</b> pkt — szybkie tempo może Wam pomóc.`, `🛡️ They allow <b>${f1(T.pa)}</b> points per game — push the pace.`));
  const stat = (v, l) => `<div style="background:var(--surface2);border-radius:10px;padding:.45rem;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.35rem">${v}</div><div style="font-size:.62rem;color:var(--muted);letter-spacing:.5px">${l}</div></div>`;
  const grade = a => a ? `<b style="color:${_gmdGradeCol(a.g)}">${a.g}</b>` : '—';
  const m = _fxModal('scout-modal', 760); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('scout-modal', `🔍 ${_g('Raport rywala', 'Scouting report')}: ${_h(team)}`) + `<div data-notr>
    <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;margin-bottom:.7rem">${teamLogo(team, 40, '.9rem')}<div style="flex:1"><b>${_h(team)}</b> <span style="color:var(--muted);font-size:.8rem">· ${T.w}-${T.gp - T.w} ${_g('w sezonie', 'this season')}</span><div style="margin-top:.25rem">${form || `<span style="font-size:.76rem;color:var(--muted)">${_g('Brak meczów w sezonie', 'No games this season')}</span>`}</div></div>
      <button class="btn btn-ghost" style="font-size:.7rem" onclick="[_scout.team,_scout.other]=[_scout.other,_scout.team];_scoutDraw()">⇄ ${_g('Raport', 'Report')}: ${_h(S.other)}</button></div>
    ${T.gp ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:.4rem;margin-bottom:.8rem">${stat(f1(T.pf), _g('PKT ZDOBYTE', 'PTS FOR'))}${stat(f1(T.pa), _g('PKT STRACONE', 'PTS AGAINST'))}${stat(pct(T.fg), 'FG%')}${stat(pct(T.tp), '3P%')}${stat(f1(T.reb), _g('ZBIÓRKI', 'REB'))}${stat(f1(T.ast), _g('ASYSTY', 'AST'))}${stat(f1(T.to), _g('STRATY', 'TOV'))}</div>` : ''}
    ${h2h.length ? `<div style="font-size:.8rem;margin-bottom:.7rem">⚔️ ${_g('Bezpośrednie mecze', 'Head to head')} vs ${_h(S.other)}: ${h2h.map(g => `<b style="color:${g.won ? 'var(--win)' : 'var(--loss)'}">${g.me.score}:${g.op.score}</b>`).join(' · ')}</div>` : ''}
    ${top.length ? `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">⭐ ${_g('KLUCZOWI GRACZE', 'KEY PLAYERS')}</div>
      <div style="overflow-x:auto"><div style="min-width:560px"><div style="display:grid;grid-template-columns:1.4fr repeat(4,48px) repeat(5,36px);gap:.25rem;font-size:.64rem;color:var(--muted);text-align:center;padding-bottom:.2rem"><span style="text-align:left">${_g('Gracz', 'Player')}</span><span>PTS</span><span>${_g('ZB', 'REB')}</span><span>${_g('AS', 'AST')}</span><span>3PM</span>${['RZT', '3PT', 'POD', 'ROZ', 'OBR'].map((l, i) => `<span>${en ? ['SHT', '3PT', 'INS', 'PLY', 'DEF'][i] : l}</span>`).join('')}</div>
      ${top.map(p => { const A = attrsOf(p.name); return `<div style="display:grid;grid-template-columns:1.4fr repeat(4,48px) repeat(5,36px);gap:.25rem;align-items:center;font-size:.8rem;text-align:center;padding:.28rem 0;border-top:1px solid var(--border)"><span style="text-align:left;cursor:pointer" onclick="openPlayerCardImg('${_h(p.name).replace(/'/g, "\\'")}')"><b style="text-decoration:underline dotted">${_h(p.name)}</b> <span style="color:var(--muted);font-size:.68rem">${_h(p.pos || '')} · ${p.gp} ${_g('m.', 'g.')}</span></span><b>${f1(p.ppg)}</b><span>${f1(p.rpg)}</span><span>${f1(p.apg)}</span><span>${f1(p.tpm / p.gp)}</span>${['shoot', 'three', 'inside', 'play', 'def'].map(k => `<span>${grade(A[k])}</span>`).join('')}</div>`; }).join('')}</div></div>` : ''}
    ${strong.length || weak.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.8rem;font-size:.8rem"><div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.35);border-radius:10px;padding:.5rem .6rem">💪 <b>${_g('Mocne strony', 'Strengths')}</b><br>${strong.map(x => _h(x.l)).join(', ') || '—'}</div><div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.35);border-radius:10px;padding:.5rem .6rem">🎯 <b>${_g('Słabe strony', 'Weaknesses')}</b><br>${weak.map(x => _h(x.l)).join(', ') || '—'}</div></div>` : ''}
    ${tips.length ? `<div style="margin-top:.8rem;font-size:.82rem;line-height:1.5"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.2rem">🧠 ${_g('WSKAZÓWKI', 'GAME PLAN')}</div>${tips.map(t => `<div style="padding:.2rem 0">${t}</div>`).join('')}</div>` : ''}
    <div style="font-size:.66rem;color:var(--muted);margin-top:.7rem">${_g('Na podstawie meczów tego sezonu. Oceny atrybutów jak na kartach graczy.', 'Based on this season’s games. Attribute grades as on the player cards.')}</div></div>`;
}
function openClips(k) {
  const s = _ssItem(k);
  const list = _clipsFor(k).sort((a, b) => b.likes - a.likes);
  const isAdmin = _isLoggedInSync();
  const m = _fxModal('clips-modal', 720);
  m.querySelector('.modal').innerHTML = _fxHead('clips-modal', `🎬 Akcje — ${_h(s ? s.team1 + ' vs ' + s.team2 : 'mecz')}`) + `
    <div style="display:flex;flex-direction:column;gap:.7rem;max-height:55vh;overflow-y:auto;margin-bottom:1rem">
      ${list.map(c => {
        const emb = _clipEmbed(c.url), dc = _isDcClip(c.url);
        return `<div style="border:1px solid var(--border);border-radius:10px;padding:.6rem .75rem">
          <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
            <b style="flex:1">${_h(c.title || 'Akcja')}</b>
            <span style="font-size:.7rem;color:var(--muted)">dodał ${_h(c.by?.name || '?')}</span>
            <button class="btn btn-ghost" style="font-size:.72rem;padding:.15rem .5rem" onclick="likeClip('${c.id}','${k}')">${myClipLikes.has(c.id) ? '❤️' : '🤍'} ${c.likes}</button>
            ${isAdmin || c.by?.id === discordUser?.id ? `<button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .4rem" onclick="deleteClip('${c.id}','${k}')">🗑</button>` : ''}
          </div>
          <div id="clip-${c.id}" style="margin-top:.45rem">
            ${dc ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="playDcClip('${c.id}')">▶ ${_g('Odtwórz', 'Play')}</button>` : emb ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="document.getElementById('clip-${c.id}').innerHTML='<iframe src=&quot;${emb}&quot; style=&quot;width:100%;aspect-ratio:16/9;border:0;border-radius:8px&quot; allowfullscreen></iframe>'">▶ ${_g('Odtwórz', 'Play')}</button>` : ''}
            <a href="${_h(c.url)}" target="_blank" rel="noopener" style="font-size:.74rem;color:var(--accent);margin-left:.4rem">otwórz ↗</a>
          </div>
        </div>`;
      }).join('') || '<div style="color:var(--muted);text-align:center;padding:1rem">Jeszcze nikt nie dodał akcji z tego meczu</div>'}
    </div>
    <div style="border-top:1px solid var(--border);padding-top:.8rem">
      ${_canUploadClip(s) ? `<div style="background:var(--surface2);border:1px dashed var(--accent);border-radius:10px;padding:.65rem .75rem;margin-bottom:.8rem">
        <label style="${_MODAL_LBL}">📁 ${_g('Wgraj plik z akcją (do 100 MB)', 'Upload a highlight file (up to 100 MB)')}</label>
        <input id="clip-file" type="file" accept="video/*" style="${_MODAL_INP};margin-bottom:.4rem;padding:.35rem">
        <div style="font-size:.7rem;color:var(--muted);margin-bottom:.4rem">${_g('Film trafi na kanał akcji na Discordzie i odtworzy się tutaj. Opis wpisz w polu „Opis” niżej. Limity: 5 akcji na drużynę w meczu (w tym 3 pliki), 10 dziennie na osobę (w tym 5 plików).', 'The video goes to the highlights channel on Discord and plays here. Write the description in the field below. Limits: 5 highlights per team per match (up to 3 files), 10 a day per person (up to 5 files).')}</div>
        <div style="display:none;height:6px;background:var(--surface);border-radius:3px;overflow:hidden;margin-bottom:.3rem"><div id="clip-up-bar" style="height:100%;width:0;background:var(--accent);transition:width .2s"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem"><span id="clip-up-status" style="font-size:.74rem"></span><button class="btn btn-primary" onclick="uploadClip('${k}')">📤 ${_g('Wgraj plik', 'Upload file')}</button></div></div>` : ''}
${_canUploadClip(s) ? `      <label style="${_MODAL_LBL}">${_g('Dodaj akcję (Discord, YouTube, Twitch, Medal, Streamable, X, TikTok)', 'Add a highlight (Discord, YouTube, Twitch, Medal, Streamable, X, TikTok)')}</label>
      <div style="font-size:.72rem;color:var(--muted);margin:-.15rem 0 .35rem">💬 ${_g('Film na Discordzie? Prawy klik na wiadomość z filmem → <b>Kopiuj link do wiadomości</b> i wklej tutaj.', 'Video on Discord? Right-click the message with the video → <b>Copy Message Link</b> and paste it here.')}</div>
      <input id="clip-url" placeholder="https://discord.com/channels/… / https://youtu.be/…" style="${_MODAL_INP};margin-bottom:.45rem">
      <input id="clip-title" maxlength="80" placeholder="Opis, np. Wsad nad dwoma obrońcami" style="${_MODAL_INP};margin-bottom:.6rem">
      <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" onclick="addClip('${k}')">➕ Dodaj</button></div>` : `<div style="font-size:.78rem;color:var(--muted);text-align:center">🎬 ${_g('Akcje tego meczu mogą dodawać kapitanowie i gracze obu drużyn.', 'Highlights for this game can be added by the captains and players of both teams.')}</div>`}
    </div>`;
  m.classList.add('open');
}
async function addClip(k) {
  if(!_ensureSession()) return;
  const url = document.getElementById('clip-url').value.trim(), title = document.getElementById('clip-title').value.trim();
  if(!url) return;
  const res = await _api('/clips', 'POST', { scheduleId: k, url, title }, { session: true, admin: _isLoggedInSync() });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  clipsList.unshift(res.clip);
  openClips(k); renderSeasonSchedule();
}
async function likeClip(id, k) {
  if(!_ensureSession()) return;
  const res = await _api('/clips/like', 'POST', { id }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const c = clipsList.find(x => x.id === id); if(c) c.likes = res.likes;
  res.liked ? myClipLikes.add(id) : myClipLikes.delete(id);
  openClips(k);
}
async function deleteClip(id, k) {
  if(!confirm('Usunąć tę akcję?')) return;
  const isAdmin = _isLoggedInSync();
  const res = await _api('/clips', 'DELETE', { id }, isAdmin ? { admin: true } : { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  clipsList = clipsList.filter(c => c.id !== id);
  openClips(k); renderSeasonSchedule();
}
async function decideMember(playerId, approve, from) {
  const p = playersList.find(x => x.id === playerId);
  if(!p) return;
  if(!confirm(approve ? `Potwierdzić ${p.name} jako ${p.gamertag} w ${p.team}?` : `Usunąć ${p.name} z ${p.team}?`)) return;
  const isAdmin = _isLoggedInSync();
  if(!isAdmin && !_ensureSession()) return;
  const res = await _api('/me/member', 'POST', { playerId, approve }, isAdmin ? { admin: true } : { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  Object.assign(p, res.player);
  showToast(approve ? '✅ Potwierdzono' : 'Usunięto z drużyny', 'success');
  if(from === 'panel') renderMyPanelView(); else if(from === 'roster') openTeamRoster(); else if(from === 'users') _renderUsersOverview(); else renderTeamRegistrations();
  updateMyPanelBadge();
  renderSeasonSchedule();
}
function openMyPanel() { showView('mypanel'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function _mpStatsHtml(team, me) {
  const scopeChip = (v, l) => `<button onclick="_mpScope='${v}';renderMyPanelView()" style="font-size:.68rem;padding:.15rem .55rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${_mpScope === v ? 'var(--accent)' : 'var(--border)'};background:${_mpScope === v ? 'rgba(245,197,24,.14)' : 'transparent'};color:${_mpScope === v ? 'var(--accent)' : 'var(--muted)'}">${l}</button>`;
  // drużyna: wszyscy, którzy grali w jej barwach (w wybranym zakresie) + nicki ze składu bez meczów
  const teamRows = _mpAgg(t => String(t.name).toLowerCase() === String(team).toLowerCase());
  const roster = (teamRegistrations.find(r => r.teamName === team)?.players || []).map(p => p.gamertag);
  roster.forEach(g => { if(!teamRows.some(r => _mpSame(r.name, g))) teamRows.push({ key: _normNick(g), name: g, team, games: [], gp: 0 }); });
  teamRows.sort((a, b) => (b.gp ? b.ppg : -1) - (a.gp ? a.ppg : -1));
  // ja: mecze w każdej drużynie (gracz mógł grać wcześniej gdzie indziej) — liczone po nicku
  const mine = me ? _mpAgg(() => true).filter(r => _mpSame(r.name, me)) : [];
  const meAgg = mine.length ? (() => {
    const games = mine.flatMap(r => r.games).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const n = games.length, sum = f => games.reduce((s, x) => s + x[f], 0), pct = (a, b) => sum(b) ? Math.round(sum(a) / sum(b) * 100) : null;
    const grades = games.filter(x => x.grade);
    return { name: mine.sort((a, b) => b.gp - a.gp)[0].name, team: mine[0].team, games, gp: n, w: games.filter(x => x.won).length,
      ppg: sum('pts') / n, rpg: sum('reb') / n, apg: sum('ast') / n, spg: sum('stl') / n, bpg: sum('blk') / n, tpg: sum('to') / n,
      fg: pct('fgm', 'fga'), tp: pct('tpm', 'tpa'), ft: pct('ftm', 'fta'),
      grade: grades.length ? numToGrade(grades.reduce((s, x) => s + gradeToNum(x.grade), 0) / grades.length) : '—', best: [...games].sort((a, b) => b.pts - a.pts)[0] };
  })() : null;
  const rankPts = meAgg ? teamRows.filter(r => r.gp).findIndex(r => _mpSame(r.name, me)) + 1 : 0;
  const box = (v, l) => `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.4rem .3rem;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;line-height:1.1">${v}</div><div style="font-size:.6rem;font-weight:800;letter-spacing:1px;color:var(--muted)">${l}</div></div>`;
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
  const gradeTag = g => g && g !== '—' ? `<span class="grade grade-${g.replace('+', 'p').replace('-', 'm')}" style="font-size:.66rem">${g}</span>` : '—';
  const meHtml = meAgg ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));gap:.35rem;margin-bottom:.55rem">
      ${box(meAgg.gp, 'MECZE')}${box(`${meAgg.w}-${meAgg.gp - meAgg.w}`, 'W-L')}${box(f1(meAgg.ppg), 'PTS')}${box(f1(meAgg.rpg), 'REB')}${box(f1(meAgg.apg), 'AST')}
      ${box(f1(meAgg.spg), 'STL')}${box(f1(meAgg.bpg), 'BLK')}${box(meAgg.fg != null ? meAgg.fg + '%' : '—', 'FG')}${box(meAgg.tp != null ? meAgg.tp + '%' : '—', '3P')}${box(gradeTag(meAgg.grade), 'OCENA')}
    </div>
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.5rem">🔥 Najlepszy mecz: <b style="color:var(--text)">${meAgg.best.pts} PTS</b> · ${meAgg.best.reb} REB · ${meAgg.best.ast} AST vs ${_h(meAgg.best.opp)} (${_ssFmt(meAgg.best.date)})${rankPts ? ` · <b style="color:var(--accent)">${rankPts}. strzelec drużyny</b>` : ''}</div>
    <div style="font-size:.64rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.25rem">OSTATNIE MECZE</div>
    <div style="display:flex;flex-direction:column;gap:.2rem;margin-bottom:.55rem">
      ${meAgg.games.slice(0, 5).map(g => `<div onclick="openMatch(${JSON.stringify(g.id)})" style="cursor:pointer;display:grid;grid-template-columns:52px 18px 1fr auto auto;gap:.45rem;align-items:center;font-size:.76rem;padding:.2rem .3rem;border-radius:6px;background:var(--surface)">
        <span style="color:var(--muted)">${_ssFmt(g.date)}</span><b style="color:${g.won ? 'var(--win)' : 'var(--loss)'}">${g.won ? 'W' : 'L'}</b>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">vs ${_h(g.opp)}</span><span><b>${g.pts}</b> / ${g.reb} / ${g.ast}</span>${gradeTag(g.grade)}</div>`).join('')}
    </div>
    ${_playerAchievementsHtml(meAgg.name)}
    <div style="display:flex;gap:.35rem;margin-top:.5rem;flex-wrap:wrap">
      <button class="btn btn-ghost" style="font-size:.72rem" onclick="openPlayerModal(this.dataset.p, this.dataset.t)" data-p="${_h(meAgg.name)}" data-t="${_h(meAgg.team)}">📋 Pełny profil</button>
      <button class="btn btn-ghost" style="font-size:.72rem" onclick="openShareCard(this.dataset.p)" data-p="${_h(meAgg.name)}">🪪 Moja karta</button>
      <button class="btn btn-primary" style="font-size:.72rem" onclick="_wr.tab=null;openWrapped()">🎁 Mój Wrapped</button>
    </div>`
    : `<div style="font-size:.8rem;color:var(--muted)">${me ? `Brak meczów jako <b>${_h(me)}</b> w tym zakresie.` : 'Wybierz swój nick ze składu (niżej), żeby zobaczyć swoje statystyki.'}</div>`;
  const teamHtml = `
    <div style="overflow-x:auto;border:1px solid var(--border);border-radius:8px">
      <table style="width:100%;border-collapse:collapse;font-size:.76rem;min-width:520px">
        <thead><tr style="background:var(--surface);color:var(--muted);font-size:.62rem;letter-spacing:1px">
          <th style="text-align:left;padding:.35rem .5rem">ZAWODNIK</th><th>GP</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>FG%</th><th>3P%</th><th>OCENA</th></tr></thead>
        <tbody>${teamRows.map(r => {
          const isMe = me && _mpSame(r.name, me);
          return `<tr ${r.gp ? `onclick="openPlayerModal(this.dataset.p, this.dataset.t)" data-p="${_h(r.name)}" data-t="${_h(r.team)}" style="cursor:pointer;${isMe ? 'background:rgba(245,197,24,.09)' : ''}"` : `style="opacity:.55"`}>
            <td style="text-align:left;padding:.35rem .5rem;font-weight:${isMe ? 900 : 600};border-top:1px solid var(--border)">${_h(r.name)}${isMe ? ' <span style="color:var(--accent);font-size:.66rem">(Ty)</span>' : ''}</td>
            ${r.gp ? [r.gp, f1(r.ppg), f1(r.rpg), f1(r.apg), f1(r.spg), f1(r.bpg), r.fg != null ? r.fg + '%' : '—', r.tp != null ? r.tp + '%' : '—'].map(v => `<td style="text-align:center;border-top:1px solid var(--border)">${v}</td>`).join('') + `<td style="text-align:center;border-top:1px solid var(--border)">${gradeTag(r.grade)}</td>`
              : `<td colspan="9" style="text-align:center;color:var(--muted);border-top:1px solid var(--border)">bez meczów</td>`}
          </tr>`; }).join('')}</tbody>
      </table>
    </div>
    <div style="font-size:.66rem;color:var(--muted);margin-top:.3rem">Średnie na mecz · kliknij zawodnika, żeby zobaczyć jego profil.</div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:.8rem;margin-top:.8rem">
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted)">📊 MOJE STATYSTYKI${meAgg ? ' — ' + _h(meAgg.name).toUpperCase() : ''}</div>
        <div style="display:flex;gap:.25rem">${scopeChip('season', 'Sezon')}${scopeChip('edition', _editionOf(currentSeasonId) || 'Edycja')}${scopeChip('career', 'Kariera')}</div>
      </div>
      ${meHtml}
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem">
      <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.5rem">👥 MOJA DRUŻYNA — ${_h(team).toUpperCase()}</div>
      ${teamHtml}
    </div>
  </div>`;
}
function renderTeamsView() {
  const el = document.getElementById('teams-view');
  if(!el) return;
  const sid = currentSeasonId || null;
  const regs = teamRegistrations.filter(r => r.status === 'approved' && (!sid || !r.seasonId || r.seasonId === sid));
  const season = seasons.find(x => x.id === sid);
  const elo = (() => { try { return _elo().R || {}; } catch(e) { return {}; } })();
  const eloRank = Object.entries(elo).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const ms = _mpMatches(_tv.scope);
  const q = _tv.q.trim().toLowerCase();
  const cards = regs.map(r => {
    const tn = r.teamName, low = String(tn).toLowerCase();
    let w = 0, l = 0, pf = 0, pa = 0;
    ms.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => {
      if(String(t?.name).toLowerCase() !== low) return;
      (+t.score || 0) > (+o.score || 0) ? w++ : l++; pf += +t.score || 0; pa += +o.score || 0;
    }));
    const played = _mpAgg(t => String(t.name).toLowerCase() === low, _tv.scope);
    const roster = (r.players || []).map(p => p.gamertag);
    const rows = roster.map(g => { const a = played.find(x => _mpSame(x.name, g)); return a ? { ...a, rosterName: g } : { name: g, rosterName: g, gp: 0 }; });
    played.filter(a => !roster.some(g => _mpSame(a.name, g))).forEach(a => rows.push({ ...a, rosterName: a.name, sub: true }));
    rows.sort((a, b) => (b.gp ? b.ppg : -1) - (a.gp ? a.ppg : -1));
    const capProfile = playersList.find(p => p.id === r.captain?.id && p.gamertag);
    return { r, tn, w, l, pf, pa, rows, capNick: capProfile?.gamertag || null, elo: elo[tn] ? Math.round(elo[tn]) : null, eloPos: eloRank.indexOf(tn) + 1,
      match: !q || low.includes(q) || rows.some(x => String(x.rosterName).toLowerCase().includes(q) || String(x.name).toLowerCase().includes(q)) };
  }).filter(c => c.match);
  const sorters = {
    table: (a, b) => (b.w / Math.max(1, b.w + b.l)) - (a.w / Math.max(1, a.w + a.l)) || (b.pf - b.pa) - (a.pf - a.pa) || a.tn.localeCompare(b.tn, 'pl'),
    elo: (a, b) => (b.elo || 0) - (a.elo || 0),
    az: (a, b) => a.tn.localeCompare(b.tn, 'pl')
  };
  cards.sort(sorters[_tv.sort] || sorters.table);
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
  const hl = t => q && String(t).toLowerCase().includes(q) ? `<mark style="background:rgba(245,197,24,.35);color:inherit;border-radius:3px">${_h(t)}</mark>` : _h(t);
  const sel = 'width:auto;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .45rem;font-size:.78rem';
  el.innerHTML = `
    <div class="section-title">🏀 Drużyny i składy</div>
    <div style="display:flex;gap:.45rem;flex-wrap:wrap;align-items:center;margin-bottom:.9rem">
      <input id="tv-q" value="${_h(_tv.q)}" oninput="_tv.q=this.value;clearTimeout(window._tvT);window._tvT=setTimeout(()=>{renderTeamsView();const i=document.getElementById('tv-q');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)" placeholder="Szukaj drużyny albo zawodnika…" style="${_MODAL_INP};max-width:260px">
      <select onchange="_tv.sort=this.value;renderTeamsView()" style="${sel}">
        ${[['table', 'Wg bilansu'], ['elo', 'Wg rankingu siły'], ['az', 'Alfabetycznie']].map(([v, l]) => `<option value="${v}" ${_tv.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <select onchange="_tv.scope=this.value;renderTeamsView()" style="${sel}">
        ${[['season', 'Statystyki: ten sezon'], ['edition', 'Statystyki: ' + (_editionOf(sid) || 'edycja')], ['career', 'Statystyki: cała historia']].map(([v, l]) => `<option value="${v}" ${_tv.scope === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <span style="font-size:.74rem;color:var(--muted)">${regs.length} ${_plPL(regs.length, 'drużyna', 'drużyny', 'drużyn')}${season ? ' · ' + _h(season.name) : ''}</span>
    </div>
    ${cards.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:.8rem">
      ${cards.map(c => `<div class="card" style="padding:.75rem .85rem;margin:0">
        <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.55rem">
          <div onclick="openTeamModal(this.dataset.t)" data-t="${_h(c.tn)}" style="cursor:pointer">${teamLogo(c.tn, 46, '.8rem')}</div>
          <div style="flex:1;min-width:0">
            <div onclick="openTeamModal(this.dataset.t)" data-t="${_h(c.tn)}" style="cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hl(c.tn)}</div>
            <div style="font-size:.72rem;color:var(--muted)">🧢 ${_h(c.r.captain?.name || '—')}${c.r.streamUrl ? ` · <a href="${_h(c.r.streamUrl)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">📺 kanał</a>` : ''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.15rem">${c.w}-${c.l}</div>
            <div style="font-size:.64rem;color:var(--muted)">${c.elo ? `⚡ ${c.elo} · #${c.eloPos}` : 'bez meczów'}</div>
          </div>
        </div>
        <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden">
          <div style="display:grid;grid-template-columns:1fr 34px 30px 42px 42px 42px;gap:.3rem;padding:.25rem .5rem;background:var(--surface2);font-size:.6rem;font-weight:800;letter-spacing:1px;color:var(--muted)">
            <span>ZAWODNIK</span><span style="text-align:center">POZ</span><span style="text-align:center">GP</span><span style="text-align:right">PTS</span><span style="text-align:right">REB</span><span style="text-align:right">AST</span></div>
          ${c.rows.map(p => {
            const cap = c.capNick && _mpSame(c.capNick, p.rosterName);
            return `<div ${p.gp ? `onclick="openPlayerModal(this.dataset.p, this.dataset.t)" data-p="${_h(p.name)}" data-t="${_h(p.team || c.tn)}"` : ''} style="display:grid;grid-template-columns:1fr 34px 30px 42px 42px 42px;gap:.3rem;padding:.3rem .5rem;border-top:1px solid var(--border);font-size:.78rem;align-items:center;${p.gp ? 'cursor:pointer' : 'opacity:.55'}" ${p.gp ? `onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''"` : ''}>
              <span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hl(p.rosterName)}${cap ? ' <span title="Kapitan">🧢</span>' : ''}${p.sub ? ' <span style="font-size:.62rem;color:var(--muted)">spoza składu</span>' : ''}</span>
              <span style="text-align:center;font-size:.68rem;color:var(--accent);font-weight:800">${p.pos || ''}</span>
              ${p.gp ? `<span style="text-align:center;color:var(--muted)">${p.gp}</span><span style="text-align:right;font-weight:800">${f1(p.ppg)}</span><span style="text-align:right">${f1(p.rpg)}</span><span style="text-align:right">${f1(p.apg)}</span>`
                : `<span style="grid-column:3 / span 4;text-align:right;font-size:.68rem;color:var(--muted)">bez meczów</span>`}
            </div>`;
          }).join('') || '<div style="padding:.6rem;text-align:center;font-size:.76rem;color:var(--muted)">Brak zawodników</div>'}
        </div>
        <div style="display:flex;gap:.35rem;margin-top:.55rem;flex-wrap:wrap">
          <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .55rem" onclick="openTeamModal(this.dataset.t)" data-t="${_h(c.tn)}">📊 Statystyki drużyny</button>
          ${c.w + c.l ? `<span style="font-size:.68rem;color:var(--muted);align-self:center">pkt ${c.pf}:${c.pa} · śr. ${f1(c.pf / (c.w + c.l))}:${f1(c.pa / (c.w + c.l))}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>` : `<div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">${q ? 'Nic nie znaleziono.' : 'Brak zatwierdzonych drużyn w tym sezonie.'}</div>`}
    <div style="font-size:.7rem;color:var(--muted);margin-top:.6rem">Średnie na mecz · kliknij drużynę albo zawodnika, żeby zobaczyć pełne statystyki.</div>`;
}
// 🧢 KAPITAN: drużyna zalogowanego kapitana w bieżącym sezonie (także niezatwierdzona) + sekcja w Moim panelu
function _myCaptainReg() { if(!discordUser) return null; const sid = currentSeasonId || null, my = String(discordUser.id);
  return (teamRegistrations || []).find(r => String(r.captain?.id) === my && r.status !== 'rejected' && (!sid || !r.seasonId || r.seasonId === sid)) || null; }
function captainBoxHtml() {
  const r = _myCaptainReg(); if(!r) return ''; const s = _signup(), ps = r.payment?.status || 'unpaid', fee = s.fee || '25€', paid = ps === 'paid', needFee = _needFee();
  const late = s.payDeadline && s.payDeadline < new Date().toISOString().slice(0, 10), dl = s.payDeadline ? payRemindDeadlineTxt(s.payDeadline, currentLang === 'en') : '';
  const stLbl = r.status === 'approved' ? `<span style="background:#16a34a;color:#fff;border-radius:4px;padding:.05rem .4rem;font-size:.62rem;font-weight:700">${_g('ZATWIERDZONA', 'APPROVED')}</span>` : `<span style="background:var(--accent);color:#111;border-radius:4px;padding:.05rem .4rem;font-size:.62rem;font-weight:700">${_g('OCZEKUJE', 'PENDING')}</span>`;
  const payBlock = !needFee || paid ? (needFee ? `<div style="margin-top:.6rem;font-size:.86rem;color:var(--win)">✅ ${_g('Wpisowe opłacone — dzięki!', 'Entry fee paid — thank you!')}</div>` : '')
    : ps === 'sent' ? `<div style="margin-top:.7rem;background:rgba(245,197,24,.1);border:1px solid var(--accent);border-radius:10px;padding:.6rem .8rem;font-size:.86rem">🧾 ${_g('Potwierdzenie płatności wysłane — admin je sprawdza.', 'Payment proof sent — we\u2019re checking it.')} <a href="#" style="color:var(--accent)" onclick="openTeamPayment('${r.id}');return false">${_g('Zobacz', 'View')} ›</a></div>`
    : `<button onclick="openTeamPayment('${r.id}')" style="margin-top:.8rem;width:100%;border:none;border-radius:12px;padding:1rem 1.2rem;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.45rem;letter-spacing:1px;color:#111;background:linear-gradient(135deg,#f5c518,#ffdd55);box-shadow:0 6px 22px rgba(245,197,24,.35)">💶 ${_g('ZAPŁAĆ WPISOWE', 'PAY ENTRY FEE')} — ${_h(fee)}</button>
       ${dl ? `<div style="text-align:center;margin-top:.4rem;font-size:.82rem;color:${late ? '#ef4444' : 'var(--muted)'}">⏰ ${_g('Termin płatności', 'Payment deadline')}: <b>${_h(dl)}</b>${late ? ' — ' + _g('minął!', 'passed!') : ''}</div>` : ''}
       <div style="text-align:center;margin-top:.25rem;font-size:.74rem;color:var(--muted)">${_g('Po zapłacie wgraj potwierdzenie w tym samym oknie.', 'After paying, upload your payment proof in the same window.')}</div>`;
  return `<div class="card" id="captain-box" style="padding:1rem 1.1rem;margin-bottom:1rem;border:1px solid ${needFee && !paid && ps !== 'sent' ? 'var(--accent)' : 'var(--border)'}" data-notr>
    <div style="display:flex;align-items:center;gap:.7rem">${r.logo ? `<img src="${r.logo}" style="width:48px;height:48px;border-radius:10px;object-fit:cover">` : `<div style="width:48px;height:48px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:1.4rem">🏀</div>`}
      <div style="flex:1;min-width:0"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🧢 ${_g('TWOJA DRUŻYNA', 'YOUR TEAM')}</div><div style="font-weight:900;font-size:1.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(r.teamName)}</div>
        <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.15rem">${stLbl} ${needFee ? (_payBadge(r) || _payBadge({ payment: { status: 'unpaid' } })) : ''} <span style="font-size:.72rem;color:var(--muted)">${(r.players || []).length} ${_g('graczy', 'players')}</span></div></div></div>
    ${payBlock}
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.8rem">${_teamEditBtn(r)}<button class="btn btn-ghost" style="font-size:.78rem" onclick="changeTeamLogo('${r.id}')">🖼 ${r.logo ? _g('Zmień logo', 'Change logo') : _g('Dodaj logo', 'Add logo')}</button><button class="btn btn-ghost" style="font-size:.78rem" onclick="openMediaDay('${r.id}')">🎬 Media day</button></div></div>`;
}
function _dtLocal(iso) { if(!iso) return ''; const d = new Date(iso), z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`; }
function openLaunch() {
  if(!_isLoggedInSync()) return; const L = window._launch || {}, c = L.countdown || {}, sid = currentSeasonId || null, pd = (typeof predictionsData !== 'undefined' && predictionsData[sid]) || {};
  _ln = { c: { on: !!c.on, mode: c.mode || 'season', signupsEnd: c.signupsEnd || null, seasonStart: c.seasonStart || null, customAt: c.customAt || null, customLabel: c.customLabel || '', announce: c.announce !== false, autoClose: !!c.autoClose }, picksOn: !!L.picks?.on, lockAt: pd.lockAt || null, preOn: L.pre?.on !== false, items: (L.pre?.items || []).map(x => ({ ...x })), published: !!L.pre?.at };
  _lnDraw();
}
function _lnDraw() {
  const m = _fxModal('ln-modal', 760); m.classList.add('open'); const c = _ln.c, H = t => `<div style="font-size:.74rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin:1rem 0 .45rem">${t}</div>`, tog = (on, fn, lbl) => `<label style="display:flex;gap:.45rem;align-items:center;cursor:pointer;text-transform:none;letter-spacing:0;font-size:.84rem"><input type="checkbox" style="width:auto" ${on ? 'checked' : ''} onchange="${fn}"> ${lbl}</label>`;
  const modeBtn = (k, l) => `<button class="btn ${c.mode === k ? 'btn-primary' : 'btn-ghost'}" style="font-size:.72rem" onclick="_ln.c.mode='${k}';_lnDraw()">${l}</button>`;
  const dtIn = (k, l) => `<div><label style="${_MODAL_LBL}">${l}${c.mode === ({ signupsEnd: 'signups', seasonStart: 'season', customAt: 'custom' })[k] ? ' ⏳' : ''}</label><input type="datetime-local" value="${_dtLocal(c[k])}" onchange="_ln.c.${k}=this.value?new Date(this.value).toISOString():null;_lnDraw()" style="${_MODAL_INP};margin-bottom:.4rem"></div>`;
  m.querySelector('.modal').innerHTML = _fxHead('ln-modal', '🚀 ' + _g('Start ligi', 'League launch')) + `<div data-notr>
    ${H('⏳ ' + _g('ODLICZANIE NA DASHBOARDZIE', 'DASHBOARD COUNTDOWN'))}
    ${tog(c.on, '_ln.c.on=this.checked;_lnDraw()', _g('Pokaż odliczanie', 'Show the countdown'))}
    <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin:.5rem 0">${modeBtn('signups', '🧢 ' + _g('do końca zapisów', 'until registrations close'))}${modeBtn('season', '🏀 ' + _g('do startu ligi', 'until the season starts'))}${modeBtn('custom', '✏️ ' + _g('własne', 'custom'))}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0 .7rem">${dtIn('signupsEnd', _g('Koniec zapisów', 'Registrations close'))}${dtIn('seasonStart', _g('Start sezonu', 'Season start'))}${c.mode === 'custom' ? dtIn('customAt', _g('Data (własne)', 'Date (custom)')) + `<div><label style="${_MODAL_LBL}">${_g('Napis', 'Label')}</label><input value="${_h(c.customLabel)}" maxlength="60" placeholder="${_g('np. Draft drużyn za', 'e.g. Team draft in')}" oninput="_ln.c.customLabel=this.value" style="${_MODAL_INP}"></div>` : ''}</div>
    <div style="font-size:.72rem;color:var(--muted);margin:.2rem 0 .5rem">${_g('Odliczanie pokazuje datę wybranego trybu. Pozostałe daty możesz wpisać od razu i później tylko przełączyć tryb.', 'The countdown uses the date of the selected mode. You can fill in all dates now and just switch the mode later.')}</div>
    ${tog(c.announce, '_ln.c.announce=this.checked', _g('Ogłoś na Discordzie, gdy odliczanie dobiegnie końca (kanał terminarza)', 'Announce on Discord when the countdown ends (schedule channel)'))}
    <div style="margin-top:.35rem">${tog(c.autoClose, '_ln.c.autoClose=this.checked', '🔒 ' + _g('Zamknij zapisy drużyn automatycznie o godzinie „Koniec zapisów”', 'Close team registrations automatically at “Registrations close”'))}</div>
    <div style="margin-top:.35rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="_fxClose('ln-modal');openDivisions()">🧩 ${_g('Podział na dywizje', 'Divisions')} ›</button></div>
    ${H('🔮 ' + _g('TYPY PRZEDSEZONOWE', 'PRE-SEASON PICKS'))}
    ${tog(_ln.picksOn, '_ln.picksOn=this.checked', _g('Pokaż typy na dashboardzie (mistrz, MVP, debiutant roku, ostatnie miejsce, najlepszy strzelec)', 'Show picks on the dashboard (champion, MVP, rookie of the year, last place, top scorer)'))}
    <label style="${_MODAL_LBL};margin-top:.4rem">${_g('Typy zamykają się', 'Picks lock at')}</label><div style="display:flex;gap:.4rem;flex-wrap:wrap"><input type="datetime-local" id="ln-lock" value="${_dtLocal(_ln.lockAt)}" style="${_MODAL_INP};max-width:240px"><button class="btn btn-ghost" style="font-size:.7rem" onclick="document.getElementById('ln-lock').value=_dtLocal(_ln.c.seasonStart)">= ${_g('start sezonu', 'season start')}</button></div>
    <div style="font-size:.72rem;color:var(--muted);margin-top:.25rem">${_g('Puste = typy zamykają się z pierwszą kolejką.', 'Empty = picks lock with the first week.')}</div>
    ${H('📊 ' + _g('PRZEDSEZONOWY POWER RANKING', 'PRE-SEASON POWER RANKING'))}
    ${tog(_ln.preOn, '_ln.preOn=this.checked', _g('Pokaż ranking na dashboardzie (do pierwszego meczu)', 'Show the ranking on the dashboard (until the first game)'))}
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin:.5rem 0"><button class="btn btn-ghost" style="font-size:.74rem" onclick="lnRankAi()">🤖 ${_ln.items.length ? _g('Wygeneruj ponownie z AI', 'Regenerate with AI') : _g('Wygeneruj propozycję z AI', 'Generate a draft with AI')}</button>${_ln.published ? `<span style="font-size:.72rem;color:var(--win);align-self:center">✅ ${_g('opublikowany', 'published')}</span>` : ''}</div>
    <div id="ln-items">${_ln.items.map((x, i) => `<div style="display:flex;gap:.4rem;align-items:flex-start;padding:.35rem 0;border-top:1px solid var(--border)"><b style="min-width:26px;padding-top:.3rem">#${i + 1}</b>
      <div style="display:flex;flex-direction:column;gap:.15rem"><button class="btn btn-ghost" style="font-size:.6rem;padding:0 .35rem" ${i ? '' : 'disabled'} onclick="lnMove(${i},-1)">▲</button><button class="btn btn-ghost" style="font-size:.6rem;padding:0 .35rem" ${i < _ln.items.length - 1 ? '' : 'disabled'} onclick="lnMove(${i},1)">▼</button></div>
      <div style="flex:1"><b style="font-size:.86rem">${_h(x.team)}</b><textarea rows="2" maxlength="240" oninput="_ln.items[${i}].comment=this.value" style="${_MODAL_INP};font-size:.78rem;margin-top:.2rem">${_h(x.comment || '')}</textarea></div></div>`).join('') || `<div style="font-size:.78rem;color:var(--muted)">${_g('Brak rankingu — wygeneruj propozycję z AI, potem możesz zmienić kolejność i komentarze.', 'No ranking yet — generate a draft with AI, then reorder and edit the comments.')}</div>`}</div>
    ${_ln.items.length ? `<label style="display:flex;gap:.45rem;align-items:center;margin-top:.6rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:.82rem"><input type="checkbox" id="ln-dc" style="width:auto" checked> ${_g('Opublikuj też na Discordzie (kanał Power Rankingu)', 'Also post it on Discord (Power Ranking channel)')}</label>` : ''}
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem;flex-wrap:wrap"><button class="btn btn-ghost" onclick="_fxClose('ln-modal')">${_g('Zamknij', 'Close')}</button>${_ln.items.length ? `<button class="btn btn-ghost" onclick="lnPublish()">📣 ${_g('Opublikuj ranking', 'Publish ranking')}</button>` : ''}<button class="btn btn-primary" onclick="lnSave()">💾 ${_g('Zapisz ustawienia', 'Save settings')}</button></div></div>`;
}
function lnMove(i, d) { const a = _ln.items, j = i + d; if(j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; _lnDraw(); }
async function lnRankAi() { if(_ln.items.length && !confirm(_g('Zastąpić obecny ranking nową propozycją AI?', 'Replace the current ranking with a new AI draft?'))) return; showToast('🤖 ' + _g('AI układa ranking…', 'AI is building the ranking…'), 'info');
  const r = await _api('/launch/ranking-ai', 'POST', {}, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; } _ln.items = r.items; _lnDraw(); if(!r.ai) showToast('⚠ ' + _g('AI nie odpowiedziało — wpisz komentarze ręcznie', 'AI did not answer — write the comments yourself'), 'info'); }
async function lnSave(quiet) {
  const r = await _api('/launch', 'POST', { countdown: _ln.c, picks: { on: _ln.picksOn }, pre: { on: _ln.preOn, items: _ln.items } }, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return false; }
  const lv = document.getElementById('ln-lock')?.value, lock = lv ? new Date(lv).toISOString() : null, sid = currentSeasonId || null;
  if(sid && lock !== (_ln.lockAt || null)) { const p = await _api('/prediction/settings', 'POST', { seasonId: sid, lockAt: lock }, { admin: true }); if(p.ok && typeof predictionsData !== 'undefined') { predictionsData[sid] = p.predictions; _ln.lockAt = lock; } }
  window._launch = { countdown: r.launch.countdown, picks: r.launch.picks, pre: r.launch.pre?.at ? { items: r.launch.pre.items, at: r.launch.pre.at, on: r.launch.pre.on !== false } : (window._launch?.pre || null) };
  if(window._launch.pre) window._launch.pre.on = _ln.preOn; try { renderStories(); } catch(e) {} if(!quiet) showToast('✅ ' + _g('Zapisano', 'Saved'), 'success'); return true;
}
async function lnPublish() { if(!_ln.items.length) return; const dc = !!document.getElementById('ln-dc')?.checked; if(!confirm(_g(`Opublikować ranking (${_ln.items.length} drużyn)${dc ? ' i wysłać na Discorda' : ''}?`, `Publish the ranking (${_ln.items.length} teams)${dc ? ' and post it on Discord' : ''}?`))) return;
  if(!(await lnSave(true))) return; const r = await _api('/launch/ranking-publish', 'POST', { items: _ln.items, discord: dc }, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; }
  window._launch = { ...(window._launch || {}), pre: { items: r.launch.pre.items, at: r.launch.pre.at, on: true } }; _ln.published = true; _lnDraw(); try { renderStories(); } catch(e) {} showToast('📣 ' + _g('Ranking opublikowany', 'Ranking published') + (r.posted ? ' + Discord' : ''), 'success'); }
// 🔒 PRIVACY i 📖 HOW IT WORKS — strony informacyjne (PL/EN), stopka z linkami, „Delete my data”
function _pg(title, body) { return `<div class="section-title">${title}</div><div class="card" data-notr style="padding:1.2rem 1.4rem;max-width:860px;line-height:1.65;font-size:.92rem">${body}</div>`; }
function _pgH(t) { return `<h3 style="font-family:'Barlow Condensed',sans-serif;font-size:1.25rem;letter-spacing:.5px;margin:1.2rem 0 .4rem;color:var(--accent)">${t}</h3>`; }
function renderPrivacy() {
  const el = document.getElementById('privacy-view'); if(!el) return; const en = currentLang === 'en', league = EU_MODE ? 'EU Chemik League' : 'NBA 2K Pro-Am Ekstraklasa', site = EU_MODE ? 'eu.chemikleagues.com' : 'chemikleagues.com';
  el.innerHTML = _pg('🔒 ' + _g('Prywatność', 'Privacy'), en ? `
    <p><b>${league}</b> is a community NBA 2K Pro-Am league run by volunteers. This page explains what data the website <b>${site}</b> keeps, why, and how you can remove it.</p>
    ${_pgH('What we store')}
    <ul style="padding-left:1.2rem">
      <li><b>Discord account</b> (ID, username, avatar) — when you log in with Discord. Used to recognise you, your team and your permissions.</li>
      <li><b>Gamertag, platform, team and X (Twitter) handle</b> — when you register a team, join as a free agent or link your account.</li>
      <li><b>Game statistics</b> — box scores from league games (points, rebounds, etc.), shown publicly as league results and records.</li>
      <li><b>Payment proof screenshots</b> — when a captain uploads proof of the entry fee. Visible only to league admins and <b>deleted automatically 30 days</b> after the payment is confirmed.</li>
      <li><b>Fan activity</b> — votes, picks, card collection, Kort games, fantasy teams, notification settings.</li>
    </ul>
    ${_pgH('Why')}
    <p>Only to run the league: teams, schedule, results, statistics, awards, announcements on our Discord server and social media, and the fan features of the website. We do not sell data and we do not use advertising trackers.</p>
    ${_pgH('Services we use')}
    <p>The website runs on <b>Cloudflare</b> (hosting and storage). Announcements are posted to <b>Discord</b> and sometimes <b>X</b>. Game screenshots and some texts are processed by <b>Google Gemini</b> (reading box scores, writing short descriptions). Login uses <b>Discord OAuth</b> — we never see your Discord password.</p>
    ${_pgH('Your browser')}
    <p>The site keeps your login session and settings (language, theme) in your browser's local storage. No advertising cookies.</p>
    ${_pgH('Your rights')}
    <p>You can delete your account data at any time: <b>My panel → 🗑 Delete my data</b>. This removes your linked profile, fan activity, cards and settings. League history (results and statistics of played games) stays as part of the league record; if you want your gamertag removed from it, or if you are a team captain and want your team registration removed, contact a league admin on Discord.</p>
    <div style="margin-top:1rem"><button class="btn btn-ghost" onclick="showView('mypanel')">👤 My panel</button> <button class="btn btn-ghost" onclick="showView('howto')">📖 How it works</button></div>`
  : `
    <p><b>${league}</b> to społecznościowa liga NBA 2K Pro-Am prowadzona przez wolontariuszy. Ta strona wyjaśnia, jakie dane przechowuje <b>${site}</b>, po co i jak możesz je usunąć.</p>
    ${_pgH('Co przechowujemy')}
    <ul style="padding-left:1.2rem">
      <li><b>Konto Discord</b> (ID, nazwa, avatar) — gdy logujesz się przez Discord. Służy do rozpoznania Ciebie, Twojej drużyny i uprawnień.</li>
      <li><b>Nick w grze, platforma, drużyna i konto X</b> — przy zapisie drużyny, zgłoszeniu jako wolny agent albo połączeniu konta.</li>
      <li><b>Statystyki meczów</b> — tabele statystyk z meczów ligi (punkty, zbiórki itd.), publiczne jako wyniki i rekordy ligi.</li>
      <li><b>Zrzuty potwierdzeń płatności</b> — gdy kapitan wgrywa potwierdzenie wpisowego. Widzą je tylko admini, a <b>usuwamy je automatycznie 30 dni</b> po potwierdzeniu wpłaty.</li>
      <li><b>Aktywność kibica</b> — głosy, typy, kolekcja kart, gry w Kort, Fantasy, ustawienia powiadomień.</li>
    </ul>
    ${_pgH('Po co')}
    <p>Wyłącznie do prowadzenia ligi: drużyny, terminarz, wyniki, statystyki, nagrody, ogłoszenia na Discordzie i w mediach społecznościowych oraz funkcje dla kibiców. Nie sprzedajemy danych i nie używamy reklamowych narzędzi śledzących.</p>
    ${_pgH('Z jakich usług korzystamy')}
    <p>Strona działa na <b>Cloudflare</b> (hosting i przechowywanie danych). Ogłoszenia trafiają na <b>Discorda</b> i czasem na <b>X</b>. Zrzuty wyników i niektóre teksty przetwarza <b>Google Gemini</b> (odczyt statystyk, krótkie opisy). Logowanie odbywa się przez <b>Discord OAuth</b> — nie znamy Twojego hasła do Discorda.</p>
    ${_pgH('Twoja przeglądarka')}
    <p>Strona zapisuje sesję logowania i ustawienia (język, motyw) w pamięci przeglądarki. Bez reklamowych plików cookie.</p>
    ${_pgH('Twoje prawa')}
    <p>Dane konta możesz usunąć w każdej chwili: <b>Mój panel → 🗑 Usuń moje dane</b>. Usuwa to połączony profil, aktywność kibica, karty i ustawienia. Historia ligi (wyniki i statystyki rozegranych meczów) zostaje jako część archiwum ligi; jeśli chcesz usunąć z niej swój nick albo jesteś kapitanem i chcesz usunąć zgłoszenie drużyny, napisz do admina ligi na Discordzie.</p>
    <div style="margin-top:1rem"><button class="btn btn-ghost" onclick="showView('mypanel')">👤 Mój panel</button> <button class="btn btn-ghost" onclick="showView('howto')">📖 Jak to działa</button></div>`);
}
function renderHowto() {
  const el = document.getElementById('howto-view'); if(!el) return; const en = currentLang === 'en', fee = _signup().fee || '25€';
  const step = (n, t, d, btn) => `<div style="display:flex;gap:.8rem;padding:.65rem 0;border-top:1px solid var(--border)"><div style="min-width:30px;height:30px;border-radius:50%;background:var(--accent);color:#111;display:flex;align-items:center;justify-content:center;font-weight:900">${n}</div><div style="flex:1"><b>${t}</b><div style="font-size:.86rem;color:var(--muted)">${d}</div>${btn ? `<div style="margin-top:.35rem">${btn}</div>` : ''}</div></div>`;
  const B = (l, on) => `<button class="btn btn-ghost" style="font-size:.72rem" onclick="${on}">${l}</button>`;
  el.innerHTML = _pg('📖 ' + _g('Jak to działa', 'How it works'), en ? `
    <p>Everything you need to play in ${EU_MODE ? 'EU Chemik League' : 'the league'} — in a few minutes. 🏀</p>
    ${_pgH('🧢 For captains')}
    ${step(1, 'Register your team', 'Team name, roster (at least 5 players with gamertags and platforms), level and optional logo.', B('🧢 Register', 'goToTeamRegistrations()'))}
    ${step(2, `Pay the entry fee (${fee})`, 'Use the payment details in the payment window (My panel → PAY ENTRY FEE), then upload a screenshot of the payment there. An admin confirms it and your team moves to <b>Confirmed teams</b>.', B('👤 My panel', "showView('mypanel')"))}
    ${step(3, 'Get your players linked', 'Every player logs in with Discord and links their gamertag in My panel — you confirm it. Linked players get stats, player cards and the player role on Discord.', '')}
    ${step(4, 'Introduce your team (Media day)', 'Goal for the season, player to watch, style of play and a word from the captain — shown in “Meet the teams” and on our socials.', B('🎬 Meet the teams', 'openMediaGallery()'))}
    ${step(5, 'Schedule your games', 'In the Schedule, propose a few dates and times for each game — the other captain picks one. Both teams get reminders before tip-off.', B('📅 Schedule', "showView('schedule')"))}
    ${step(6, 'Report the result', 'After the game, upload the box score screenshot. The site reads the stats automatically; the other captain confirms.', '')}
    ${_pgH('🏀 For players')}
    <p>Log in with Discord → <b>My panel</b> → link your gamertag. Set the days you can play, follow your team's games and stats, and check your player card. Were you the MVP? The bot will DM you for a short post-game interview. 🎙️</p>
    ${_pgH('👀 For fans')}
    <p>Daily card packs and team sets, the Kort card game, fantasy, pre-season picks, weekly awards voting and live streams — all on the website, no team needed.</p>
    ${_pgH('❓ FAQ')}
    <p><b>Disconnect or lag?</b> Follow the rules (Rules tab) and tell the admins on Discord right away.<br><b>Need to reschedule?</b> Agree with the other captain and propose new times in the Schedule.<br><b>Roster change?</b> My panel → Edit team (while registrations are open) or Roster change.<br><b>Something wrong?</b> Ask in our Discord — admins are there to help.</p>
    <div style="margin-top:1rem">${B('📜 Rules', "showView('rules')")} ${B('🔒 Privacy', "showView('privacy')")}</div>`
  : `
    <p>Wszystko, co trzeba wiedzieć, żeby grać w lidze — w kilka minut. 🏀</p>
    ${_pgH('🧢 Dla kapitanów')}
    ${step(1, 'Zapisz drużynę', 'Nazwa, skład (co najmniej 5 graczy z nickami i platformami), poziom i opcjonalnie logo.', B('🧢 Zapisz', 'goToTeamRegistrations()'))}
    ${_signup().fee || _signup().skrillEmail || _signup().revolutUrl ? step(2, `Opłać wpisowe (${fee})`, 'Dane do płatności są w oknie płatności (Mój panel → ZAPŁAĆ WPISOWE); tam też wgrywasz zrzut potwierdzenia. Admin je zatwierdza.', B('👤 Mój panel', "showView('mypanel')")) : ''}
    ${step(3, 'Połącz konta graczy', 'Każdy gracz loguje się przez Discord i łączy swój nick w Moim panelu — Ty to potwierdzasz. Połączeni gracze mają statystyki, karty i rolę gracza na Discordzie.', '')}
    ${step(4, 'Przedstaw drużynę (Media day)', 'Cel na sezon, gracz do obserwowania, styl gry i słowo od kapitana — w galerii „Poznaj drużyny” i w naszych mediach.', B('🎬 Poznaj drużyny', 'openMediaGallery()'))}
    ${step(5, 'Umawiaj mecze', 'W Terminarzu zaproponuj kilka terminów każdego meczu — drugi kapitan wybiera jeden. Obie drużyny dostają przypomnienia.', B('📅 Terminarz', "showView('schedule')"))}
    ${step(6, 'Zgłoś wynik', 'Po meczu wgraj zrzut statystyk. Strona sama je odczyta, a drugi kapitan potwierdza.', '')}
    ${_pgH('🏀 Dla graczy')}
    <p>Zaloguj się przez Discord → <b>Mój panel</b> → połącz nick. Ustaw dni, w które możesz grać, śledź mecze i statystyki, sprawdzaj swoją kartę. Byłeś MVP? Bot napisze do Ciebie z krótkim wywiadem. 🎙️</p>
    ${_pgH('👀 Dla kibiców')}
    <p>Codzienne paczki kart i komplety drużyn, gra Kort, Fantasy, typy przedsezonowe, głosowania na nagrody tygodnia i transmisje — wszystko na stronie, bez drużyny.</p>
    ${_pgH('❓ Najczęstsze pytania')}
    <p><b>Rozłączenie albo lag?</b> Postępuj zgodnie z regulaminem i od razu napisz do adminów na Discordzie.<br><b>Trzeba przełożyć mecz?</b> Ustal z drugim kapitanem i zaproponuj nowe terminy w Terminarzu.<br><b>Zmiana składu?</b> Mój panel → Edytuj drużynę (gdy zapisy są otwarte) albo Zmiana składu.<br><b>Coś nie działa?</b> Napisz na naszym Discordzie — admini pomogą.</p>
    <div style="margin-top:1rem">${B('📜 Regulamin', "showView('rules')")} ${B('🔒 Prywatność', "showView('privacy')")}</div>`);
}
async function deleteMyData() {
  const v = prompt(_g('To usunie Twój profil, aktywność kibica, karty i ustawienia z tej ligi. Historia rozegranych meczów zostaje.\n\nWpisz DELETE, aby potwierdzić:', 'This removes your profile, fan activity, cards and settings from this league. History of played games stays.\n\nType DELETE to confirm:'));
  if(v !== 'DELETE') { if(v !== null) showToast(_g('Nie usunięto — wpisz DELETE wielkimi literami', 'Not deleted — type DELETE in capital letters'), 'info'); return; }
  const r = await _api('/me/delete', 'POST', { confirm: 'DELETE' }, { session: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; }
  alert(_g(`✅ Twoje dane zostały usunięte.${r.captainOf?.length ? `\n\nJesteś kapitanem: ${r.captainOf.join(', ')} — zgłoszenie drużyny zostaje. Aby je usunąć, napisz do admina.` : ''}`, `✅ Your data has been deleted.${r.captainOf?.length ? `\n\nYou are the captain of: ${r.captainOf.join(', ')} — the team registration stays. Contact an admin to remove it.` : ''}`));
  try { localStorage.removeItem('nba2k_discord_user'); } catch(e) {} location.href = '/';
}
function _teamStrength(r) { const lv = TEAM_LEVELS.indexOf(r.level), pre = (window._launch?.pre?.items || []).findIndex(x => x.team === r.teamName); return (lv < 0 ? TEAM_LEVELS.length : lv) * 100 + (pre < 0 ? 50 : pre); }
// mniej = silniejsza
function _dvTeams() { const sid = currentSeasonId || null; return (teamRegistrations || []).filter(r => r.status !== 'rejected' && (!sid || !r.seasonId || r.seasonId === sid)); }
async function openDivisions() {
  if(!_isLoggedInSync()) return; const r = await _api('/divisions', 'POST', { load: true }, { admin: true }).catch(() => ({})), d = r.divisions; window._dvSaved = d || null;
  const en = EU_MODE, names = d?.groups?.map(g => g.name) || [1, 2].map(i => en ? `Division ${i}` : `Dywizja ${i}`), at = {};
  (d?.groups || []).forEach((g, gi) => g.teams.forEach(t => { at[t] = gi; }));
  _dv = { names, at, onlyPaid: true, published: !!d?.published, discord: true, sid: d?.seasonId || currentSeasonId || null }; _dvDraw();
}
function _dvAuto(mode) {
  const T = _dvTeams().filter(r => !_dv.onlyPaid || _dvPaid(r)).sort((a, b) => _teamStrength(a) - _teamStrength(b)), k = _dv.names.length; _dv.at = {};
  if(mode === 'top') { const per = Math.ceil(T.length / k); T.forEach((r, i) => { _dv.at[r.teamName] = Math.min(k - 1, Math.floor(i / per)); }); }
  else T.forEach((r, i) => { const row = Math.floor(i / k), pos = i % k; _dv.at[r.teamName] = row % 2 ? k - 1 - pos : pos; });
  _dvDraw();
}
function _dvDraw() {
  const m = _fxModal('dv-modal', 1000); m.classList.add('open'); const T = _dvTeams(), k = _dv.names.length, en = EU_MODE;
  const byS = (a, b) => _teamStrength(a) - _teamStrength(b), cols = [...Array(k).keys()].map(gi => T.filter(r => _dv.at[r.teamName] === gi).sort(byS)), free = T.filter(r => _dv.at[r.teamName] == null).sort(byS);
  const chip = r => `<div style="display:flex;align-items:center;gap:.4rem;padding:.35rem .45rem;border:1px solid ${_dvPaid(r) ? 'var(--border)' : 'rgba(239,68,68,.5)'};border-radius:8px;margin-bottom:.3rem;background:var(--surface2);font-size:.78rem">
      ${teamLogo(r.teamName, 24, '.6rem')}<div style="flex:1;min-width:0"><div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(r.teamName)}</div><div style="font-size:.64rem;color:var(--muted)">${_h(r.level || '—')}${_dvPaid(r) ? '' : ' · <span style="color:#ef4444">' + _g('nieopłacona', 'unpaid') + '</span>'}</div></div>
      <select onchange="_dv.at['${_h(r.teamName).replace(/'/g, "\\'")}']=this.value===''?null:+this.value;_dvDraw()" style="font-size:.7rem;padding:.1rem;max-width:92px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:5px"><option value="">—</option>${_dv.names.map((n, i) => `<option value="${i}" ${_dv.at[r.teamName] === i ? 'selected' : ''}>${_h(n)}</option>`).join('')}</select></div>`;
  const col = (title, L, gi) => `<div style="flex:1;min-width:210px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:.5rem">
      ${gi == null ? `<div style="font-weight:800;font-size:.82rem;margin-bottom:.4rem">${title} (${L.length})</div>` : `<input value="${_h(title)}" maxlength="40" oninput="_dv.names[${gi}]=this.value" style="${_MODAL_INP};font-weight:800;font-size:.85rem;margin-bottom:.4rem"><div style="font-size:.66rem;color:var(--muted);margin:-.2rem 0 .35rem">${L.length} ${_g('drużyn', 'teams')}</div>`}
      ${L.map(chip).join('') || `<div style="font-size:.72rem;color:var(--muted);padding:.4rem">—</div>`}</div>`;
  m.querySelector('.modal').innerHTML = _fxHead('dv-modal', '🧩 ' + _g('Podział na dywizje', 'Divisions')) + `<div data-notr>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem">
      <span style="font-size:.78rem">${_g('Liczba dywizji', 'Divisions')}:</span>${[2, 3, 4].map(n => `<button class="btn ${k === n ? 'btn-primary' : 'btn-ghost'}" style="font-size:.7rem;padding:.15rem .5rem" onclick="_dvCount(${n})">${n}</button>`).join('')}
      <span style="width:1px;height:20px;background:var(--border);margin:0 .3rem"></span>
      <button class="btn btn-ghost" style="font-size:.72rem" onclick="_dvAuto('top')">🏆 ${_g('Auto: najsilniejsze do D1', 'Auto: strongest in D1')}</button><button class="btn btn-ghost" style="font-size:.72rem" onclick="_dvAuto('snake')">⚖️ ${_g('Auto: wyrównane', 'Auto: balanced')}</button>
      <label style="display:flex;gap:.3rem;align-items:center;font-size:.74rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" style="width:auto" ${_dv.onlyPaid ? 'checked' : ''} onchange="_dv.onlyPaid=this.checked"> ${_g('auto: tylko opłacone', 'auto: paid teams only')}</label></div>
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:.6rem">${_g('Siła drużyny: poziom ze zgłoszenia (Tryhard D1 → New Teams), a przy równym poziomie — przedsezonowy Power Ranking. Drużynę przenosisz listą przy jej nazwie.', 'Team strength: level from registration (Tryhard D1 → New Teams), ties broken by the pre-season Power Ranking. Move a team with the list next to its name.')}</div>
    <div style="display:flex;gap:.6rem;overflow-x:auto;padding-bottom:.3rem">${[...Array(k).keys()].map(gi => col(_dv.names[gi], cols[gi], gi)).join('')}${col('⏳ ' + _g('Bez dywizji', 'Unassigned'), free, null)}</div>
    ${free.some(_dvPaid) ? `<div style="font-size:.74rem;color:var(--accent);margin-top:.4rem">⚠ ${_g('Opłacone drużyny bez dywizji', 'Paid teams without a division')}: ${free.filter(_dvPaid).map(r => _h(r.teamName)).join(', ')}</div>` : ''}
    ${cols.some(L => L.some(r => !_dvPaid(r))) ? `<div style="font-size:.74rem;color:#ef4444;margin-top:.25rem">⚠ ${_g('W dywizjach są nieopłacone drużyny', 'Unpaid teams are in divisions')}</div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:1rem;padding-top:.7rem;border-top:1px solid var(--border)">
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">${_dv.published ? `<span style="font-size:.74rem;color:var(--win)">✅ ${_g('opublikowane', 'published')}</span><button class="btn btn-ghost" style="font-size:.7rem" onclick="dvPublish(false)">${_g('Ukryj', 'Unpublish')}</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="dvImage()">🖼 ${_g('Grafika (Discord/X)', 'Graphic (Discord/X)')}</button><button class="btn btn-ghost" style="font-size:.72rem" onclick="dvToFixture()">📅 ${_g('Do generatora terminarza', 'Open in schedule generator')}</button></div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center"><label style="display:flex;gap:.3rem;align-items:center;font-size:.74rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" style="width:auto" ${_dv.discord ? 'checked' : ''} onchange="_dv.discord=this.checked"> ${_g('ogłoś na Discordzie', 'announce on Discord')}</label>
        <button class="btn btn-ghost" onclick="dvSave()">💾 ${_g('Zapisz szkic', 'Save draft')}</button><button class="btn btn-primary" onclick="dvPublish(true)">📣 ${_g('Opublikuj podział', 'Publish divisions')}</button></div></div>
    ${window._dvSaved?.groups?.length ? _dvCfgHtml(window._dvSaved) : `<div style="font-size:.72rem;color:var(--muted);margin-top:.8rem">⚙️ ${_g('Role, kanały Discord i strefy tabeli ustawisz po zapisaniu szkicu.', 'Discord roles, channels and table zones are available after saving the draft.')}</div>`}</div>`;
}
function _dvCount(n) { const en = EU_MODE; while(_dv.names.length < n) _dv.names.push(en ? `Division ${_dv.names.length + 1}` : `Dywizja ${_dv.names.length + 1}`); _dv.names = _dv.names.slice(0, n); Object.keys(_dv.at).forEach(t => { if(_dv.at[t] >= n) _dv.at[t] = null; }); _dvDraw(); }
function _dvGroups() { return _dv.names.map((name, gi) => ({ name, teams: _dvTeams().filter(r => _dv.at[r.teamName] === gi).sort((a, b) => _teamStrength(a) - _teamStrength(b)).map(r => r.teamName) })); }
async function dvSave(quiet) { const r = await _api('/divisions', 'POST', { seasonId: _dv.sid, groups: _dvGroups() }, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return null; } window._dvSaved = r.divisions; if(!quiet) { showToast('💾 ' + _g('Szkic zapisany', 'Draft saved'), 'success'); _dvDraw(); } return r.divisions; }
async function dvPublish(on) {
  const G = _dvGroups(); if(on && G.some(g => !g.teams.length)) { showToast('⚠ ' + _g('Każda dywizja musi mieć drużyny', 'Every division needs teams'), 'error'); return; }
  if(on && !confirm(_g(`Opublikować podział (${G.map(g => `${g.name}: ${g.teams.length}`).join(', ')})${_dv.discord ? ' i ogłosić na Discordzie' : ''}?\n\nPo publikacji typy przedsezonowe dostaną „mistrza dywizji” dla każdej dywizji.`, `Publish the divisions (${G.map(g => `${g.name}: ${g.teams.length}`).join(', ')})${_dv.discord ? ' and announce on Discord' : ''}?\n\nAfter publishing, pre-season picks get a "division champion" for each division.`))) return;
  if(!(await dvSave(true))) return; const r = await _api('/divisions', 'POST', { publish: !!on, discord: on && _dv.discord }, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; }
  _dv.published = !!r.divisions.published; window._dvSaved = r.divisions; window._launch = { ...(window._launch || {}), divisions: r.divisions.published ? { seasonId: r.divisions.seasonId, groups: r.divisions.groups, at: r.divisions.publishedAt, zones: r.divisions.zones || {} } : null };
  _dvDraw(); try { renderStories(); } catch(e) {} showToast(on ? '📣 ' + _g('Podział opublikowany', 'Divisions published') + (r.posted ? ' + Discord' : '') : _g('Podział ukryty', 'Divisions unpublished'), 'success');
}
async function dvToFixture() { const d = await dvSave(true); if(!d) return; window._dvDraft = d; _fxClose('dv-modal'); openFixtureGenerator(); window._dvDraft = null; }
async function dvImage() {
  const G = _dvGroups().filter(g => g.teams.length), en = EU_MODE; if(!G.length) return; const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 1080, 1350); bg.addColorStop(0, '#1a1205'); bg.addColorStop(1, '#0b0d12'); x.fillStyle = bg; x.fillRect(0, 0, 1080, 1350);
  const T = (t, X, Y, f, col, al = 'left') => { x.font = f; x.fillStyle = col; x.textAlign = al; x.fillText(t, X, Y); };
  T(en ? 'EU CHEMIK LEAGUE' : 'NBA 2K PRO-AM EKSTRAKLASA', 540, 110, '700 34px Arial', '#9ca3af', 'center'); T(en ? 'THE DIVISIONS' : 'DYWIZJE SEZONU', 540, 190, '900 84px "Barlow Condensed", Arial', '#f5c518', 'center');
  const W = (1080 - 80 - (G.length - 1) * 30) / G.length, maxN = Math.max(...G.map(g => g.teams.length)), rowH = Math.min(78, (1350 - 360) / Math.max(1, maxN));
  const logos = {}; await Promise.all(G.flatMap(g => g.teams).map(t => new Promise(ok => { const reg = (teamRegistrations || []).find(r => r.teamName === t); if(!reg?.logo) return ok(); const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { logos[t] = im; ok(); }; im.onerror = () => ok(); im.src = reg.logo; setTimeout(ok, 4000); })));
  G.forEach((g, gi) => { const X0 = 40 + gi * (W + 30); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(X0, 250, W, 1350 - 310); x.fillStyle = '#f5c518'; x.fillRect(X0, 250, W, 8);
    T(g.name.toUpperCase(), X0 + W / 2, 320, '900 46px "Barlow Condensed", Arial', '#fff', 'center');
    g.teams.forEach((t, i) => { const Y = 370 + i * rowH, s = Math.min(54, rowH - 14);
      if(logos[t]) { try { x.drawImage(logos[t], X0 + 24, Y, s, s); } catch(e) {} } else { x.fillStyle = '#f5c518'; x.beginPath(); x.arc(X0 + 24 + s / 2, Y + s / 2, s / 2, 0, Math.PI * 2); x.fill(); T(t.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(), X0 + 24 + s / 2, Y + s / 2 + 8, '900 22px Arial', '#111', 'center'); }
      x.font = `800 ${Math.min(34, Math.max(22, rowH * .42))}px Arial`; let n = t; while(x.measureText(n).width > W - s - 60 && n.length > 3) n = n.slice(0, -2); if(n !== t) n += '…'; T(n, X0 + 24 + s + 18, Y + s / 2 + 11, x.font, '#fff'); }); });
  T(location.host || (en ? 'eu.chemikleagues.com' : 'chemikleagues.com'), 540, 1325, '700 28px Arial', '#6b7280', 'center');
  let blob; try { blob = await new Promise(r => c.toBlob(r, 'image/png')); } catch(e) { showToast('❌ ' + _g('Nie udało się utworzyć grafiki', 'Could not create the graphic'), 'error'); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'divisions.png'; a.click();
}
// 🧩 DYWIZJE: Discord (role, kanały) i strefy tabeli (playoffy, awans, spadek)
function _dvCfgHtml(d) {
  const G = d?.groups || [], R = d?.roles || {}, C = d?.channels || {}, Z = d?.zones || {}; if(!G.length) return '';
  const inp = (id, v, ph, w) => `<input id="${id}" value="${_h(v || '')}" placeholder="${ph}" style="${_MODAL_INP};font-size:.74rem;padding:.25rem .4rem;${w ? 'width:' + w : ''}">`;
  const RT = [['results', _g('Wyniki', 'Results')], ['scheduleMain', _g('Terminarz i przypomnienia', 'Schedule & reminders')], ['live', _g('Na żywo', 'Live')], ['versus', _g('Zapowiedzi VERSUS', 'VERSUS previews')]];
  return `<details style="margin-top:1rem;border:1px solid var(--border);border-radius:10px;padding:.5rem .7rem" ${window._dvCfgOpen ? 'open' : ''} ontoggle="window._dvCfgOpen=this.open"><summary style="cursor:pointer;font-weight:800;font-size:.84rem">⚙️ ${_g('Discord i strefy tabeli', 'Discord & table zones')}</summary>
    <div style="font-size:.72rem;color:var(--muted);margin:.4rem 0 .6rem">${_g('Role: gracze i kapitanowie dostają rolę swojej dywizji (przy publikacji i przy łączeniu kont). Kanały: wiadomości o meczach drużyn z jednej dywizji trafiają na jej kanał (puste = kanał ogólny). Strefy: oznaczenia w tabeli.', 'Roles: players and captains get their division role (on publishing and when linking accounts). Channels: messages about games inside one division go to its channel (empty = general channel). Zones: markers in the standings.')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.8rem">${G.map(g => `<div style="background:var(--surface2);border-radius:9px;padding:.55rem">
      <b style="font-size:.84rem">${_h(g.name)}</b>
      <label style="${_MODAL_LBL};margin-top:.35rem">🎭 ${_g('ID roli Discord', 'Discord role ID')}</label>${inp('dvr-' + g.id, R[g.id], _g('puste = utworzę automatycznie', 'empty = create automatically'))}
      ${RT.map(([k, l]) => `<label style="${_MODAL_LBL};margin-top:.3rem">💬 ${l}</label>${inp(`dvc-${g.id}-${k}`, C[g.id]?.[k], _g('ID kanału (opcjonalnie)', 'channel ID (optional)'))}`).join('')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem;margin-top:.45rem">${[['po', '🟡 ' + _g('playoffy', 'playoffs')], ['up', '▲ ' + _g('awans', 'promotion')], ['down', '▼ ' + _g('spadek', 'relegation')]].map(([k, l]) => `<div><label style="${_MODAL_LBL};font-size:.62rem">${l}</label><input id="dvz-${g.id}-${k}" type="number" min="0" max="16" value="${+Z[g.id]?.[k] || 0}" style="${_MODAL_INP};font-size:.74rem;padding:.25rem .4rem"></div>`).join('')}</div></div>`).join('')}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:flex-end;margin-top:.7rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="dvCfgSave(false)">💾 ${_g('Zapisz ustawienia', 'Save settings')}</button><button class="btn btn-primary" style="font-size:.72rem" onclick="dvCfgSave(true)">🎭 ${_g('Zapisz i nadaj role teraz', 'Save & assign roles now')}</button></div></details>`;
}
async function dvCfgSave(sync) {
  const G = window._dvSaved?.groups || [], cfg = { roles: {}, channels: {}, zones: {} }, v = id => document.getElementById(id)?.value.trim() || '';
  G.forEach(g => { cfg.roles[g.id] = v('dvr-' + g.id); cfg.channels[g.id] = Object.fromEntries(['results', 'scheduleMain', 'live', 'versus'].map(k => [k, v(`dvc-${g.id}-${k}`)])); cfg.zones[g.id] = Object.fromEntries(['po', 'up', 'down'].map(k => [k, +v(`dvz-${g.id}-${k}`) || 0])); });
  if(sync && !confirm(_g('Nadać role dywizji wszystkim graczom i kapitanom? Brakujące role zostaną utworzone na serwerze Discord.', 'Assign division roles to all players and captains? Missing roles will be created on the Discord server.'))) return;
  showToast(sync ? '🎭 ' + _g('Nadawanie ról…', 'Assigning roles…') : '💾', 'info');
  const r = await _api('/divisions', 'POST', { cfg, syncRoles: !!sync, createMissing: !!sync }, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; }
  window._dvSaved = r.divisions; if(window._launch?.divisions) window._launch.divisions.zones = r.divisions.zones || {};
  showToast(sync ? `🎭 ${_g('Role', 'Roles')}: +${r.assigned || 0} / −${r.removed || 0}${r.failed ? ` · ⚠ ${r.failed} ${_g('błędów (gracz poza serwerem?)', 'failed (player not on the server?)')}` : ''}` : '✅ ' + _g('Zapisano', 'Saved'), r.failed ? 'info' : 'success'); _dvDraw();
}
function renderMyPanelView() {
  setTimeout(() => { try { karnetMount(); } catch(e) {} }, 50);
  const target = document.getElementById('mypanel-view');
  if(!target) return;
  if(!discordUser) {
    target.innerHTML = `<div class="section-title">👤 Mój panel</div>
      <div class="card" style="padding:2rem;text-align:center;max-width:620px;margin:0 auto">
        <div style="font-size:2.4rem;margin-bottom:.5rem">🏀</div>
        <div style="font-weight:900;font-size:1.15rem;margin-bottom:.5rem">Twoje miejsce w lidze</div>
        <div style="font-size:.86rem;color:var(--muted);line-height:1.6;margin-bottom:1.2rem">Po zalogowaniu przez Discord zobaczysz tu mecze swojej drużyny, swoje statystyki, rzeczy do zrobienia (terminy, wyniki, głosowania) i ustawisz, w które dni możesz grać.</div>
        <button class="btn btn-primary" onclick="loginWithDiscord()">Zaloguj przez Discord</button>
        ${!_isStandalone() ? '<div style="margin-top:.8rem"><button class="btn btn-ghost" style="font-size:.76rem" onclick="installApp()">📲 Zainstaluj aplikację na telefonie</button></div>' : ''}
      </div>`;
    return;
  }
  const sid = currentSeasonId || null;
  const team = _myTeamName(), me = _myPlayerName();
  const isCaptain = !!(discordUser && teamRegistrations.some(r => r.status === 'approved' && r.captain?.id === discordUser.id));
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === sid);
  const ctx = { demo: false };
  const todo = _myTodo();
  updateMyPanelBadge();
  // Najbliższe mecze drużyny
  const next = team ? items.filter(s => [s.team1, s.team2].includes(team) && !_ssResult(ctx, s)?.done)
    .sort((a, b) => (a.date || '9999') .localeCompare(b.date || '9999') || a.week - b.week).slice(0, 4) : [];
  // Statystyki
  let stats = null;
  if(me) {
    const ms = _seasonMatchesOf(sid);
    let gp = 0, pts = 0, reb = 0, ast = 0;
    ms.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { if(p.name === me) { gp++; pts += p.pts || 0; reb += p.reb || 0; ast += p.ast || 0; } })));
    if(gp) stats = { gp, ppg: (pts / gp).toFixed(1), rpg: (reb / gp).toFixed(1), apg: (ast / gp).toFixed(1) };
  }
  const myTyper = (typerData[_seasonKey(sid)]?.overall || []).findIndex(x => x.id === discordUser.id);
  const teamsOpts = teamRegistrations.filter(r => r.status === 'approved' && (!sid || !r.seasonId || r.seasonId === sid)).map(r => r.teamName);
  const roster = team ? (teamRegistrations.find(r => r.teamName === team)?.players || []).map(p => p.gamertag) : [];
  const days = myProfile?.days?.length ? myProfile.days : [false, false, false, false, false, false, false];
  const curWeek = items.find(s => s.weekStart && s.weekStart <= _today() && _today() < _ssAddDays(s.weekStart, 7))?.week || null;
  const nextWeek = curWeek ? curWeek + 1 : (items.length ? Math.min(...items.map(s => s.week)) : null);
  const wkDays = w => (myProfile?.weeks?.[w]) || null;
  const dayRow = (arr, key) => DOW.map((d, i) => `<button type="button" data-k="${key}" data-i="${i}" onclick="this.classList.toggle('on');this.style.background=this.classList.contains('on')?'var(--accent)':'var(--bg)';this.style.color=this.classList.contains('on')?'rgba(0,0,0,.88)':'var(--text)'"
    class="${arr[i] ? 'on' : ''}" style="flex:1;min-width:38px;padding:.35rem 0;border-radius:6px;border:1px solid var(--border);cursor:pointer;font-family:inherit;font-weight:800;font-size:.76rem;background:${arr[i] ? 'var(--accent)' : 'var(--bg)'};color:${arr[i] ? 'rgba(0,0,0,.88)' : 'var(--text)'}">${d}</button>`).join('');
  target.innerHTML = `<div class="section-title">👤 ${_g('Mój panel', 'My panel')}</div>
    <div style="max-width:980px">${captainBoxHtml()}`;
  setTimeout(() => { const t = document.getElementById('mypanel-view'); if(t && !document.getElementById('del-my-data')) t.insertAdjacentHTML('beforeend', `<div id="del-my-data" style="max-width:980px;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap;font-size:.78rem;color:var(--muted)"><span>🔒 <a href="#" style="color:inherit" onclick="showView('privacy');return false">${_g('Prywatność — jakie dane przechowujemy', 'Privacy — what data we keep')}</a></span><button class="btn btn-ghost" style="font-size:.7rem;color:#ef4444;border-color:rgba(239,68,68,.4)" onclick="deleteMyData()">🗑 ${_g('Usuń moje dane', 'Delete my data')}</button></div>`); }, 0);
  target.innerHTML += `
    <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:1rem">
      ${_avatarHtml(discordUser.avatar, 44)}
      <div><div style="font-weight:900;font-size:1.05rem">${_h(discordUser.name)}${isCaptain ? ' <span style="font-size:.7rem;color:var(--accent)">🧢 KAPITAN</span>' : ''}</div>
        <div style="font-size:.78rem;color:var(--muted)">${team ? '🏀 ' + _h(team) : myProfile?.status === 'pending' ? `⏳ Czekasz na potwierdzenie kapitana <b>${_h(myProfile.team)}</b>` : 'Bez drużyny'}${me ? ' · 🎮 ' + _h(me) : ''}${myTyper >= 0 ? ` · 🎯 typer: ${myTyper + 1}. miejsce` : ''}</div></div>
    </div>
    ${_firstStepsHtml()}
    <div style="font-size:.7rem;color:var(--muted);margin:-.3rem 0 .7rem;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
      🆔 Twoje ID Discord: <code style="font-size:.7rem;background:var(--surface2);padding:.05rem .35rem;border-radius:4px">${_h(discordUser.id)}</code>
      <a href="#" onclick="navigator.clipboard?.writeText('${_h(discordUser.id)}').then(()=>showToast('Skopiowano ID','success'));return false" style="color:var(--accent)">kopiuj</a>
      · rola: <b>${_isLoggedInSync() ? '👑 admin' : _isEventsAdminSync() ? '🎪 event manager' : '🏀 gracz'}</b>
      ${window._evLoginErr ? `<span style="color:var(--loss)">· ${_h(window._evLoginErr)}</span>` : ''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.8rem">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem">
        ${todo.some(t => t.daily) ? `<div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin-bottom:.3rem">☀️ ${currentLang === 'en' ? 'TODAY' : 'NA DZIŚ'}</div>
        ${todo.filter(t => t.daily).map(t => `<div onclick="${t.go || ''}" style="font-size:.82rem;padding:.35rem .3rem;border-bottom:1px dashed rgba(127,127,127,.2);cursor:pointer;display:flex;gap:.4rem;align-items:center"><span style="width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0"></span><span style="flex:1">${t.html}</span><span style="color:var(--muted)">›</span></div>`).join('')}<div style="height:.6rem"></div>` : ''}
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">✅ DO ZROBIENIA</div>
        ${todo.filter(t => !t.daily).map(t => `<div onclick="${t.go || ''}" style="font-size:.82rem;padding:.35rem .3rem;border-bottom:1px dashed rgba(127,127,127,.2);cursor:pointer;display:flex;gap:.4rem;align-items:center">
          ${t.urgent ? '<span style="width:7px;height:7px;border-radius:50%;background:#dc2626;flex-shrink:0"></span>' : '<span style="width:7px;flex-shrink:0"></span>'}<span style="flex:1">${t.html}</span><span style="color:var(--muted)">›</span></div>`).join('') || '<div style="font-size:.8rem;color:var(--win)">Wszystko zrobione 👌</div>'}
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem">
        <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📅 NAJBLIŻSZE MECZE${team ? ' — ' + _h(team).toUpperCase() : ''}</div>
        ${next.map(s => `<div style="font-size:.8rem;padding:.25rem 0;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
          <b style="min-width:72px">${s.date ? _ssFmt(s.date) + ' ' + (s.time || '') : 'Week ' + s.week}</b>
          vs <b>${_h(s.team1 === team ? s.team2 : s.team1)}</b> ${_isLive(s) ? '<span style="color:#dc2626;font-weight:900">🔴</span>' : ''} ${_streamLinks(s, true)}</div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${team ? 'Brak zaplanowanych meczów' : 'Wybierz swoją drużynę niżej'}</div>`}
        ${team && !isCaptain ? `<button class="btn btn-ghost" style="font-size:.72rem;margin-top:.45rem" onclick="openTeamRoster(this.dataset.t, 'g')" data-t="${_h(team)}">👥 Dostępność drużyny</button>` : ''}
        
      </div>
    </div>
    ${team ? _mpStatsHtml(team, me) : ''}
    ${_myCapReg() ? `<button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:.8rem" onclick="openTrades()">🔁 Okno transferowe — wymiany graczy</button>` : ''}
    ${discordUser && (window._xEditors || []).includes(discordUser.id) ? `<button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:.8rem" onclick="openXQueue()">🐦 ${currentLang === 'en' ? 'X queue — posts to review' : 'Kolejka X — wpisy do sprawdzenia'}</button>` : ''}
    <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:.8rem" onclick="openSuggest()">💡 ${currentLang === 'en' ? 'Send a suggestion to the admins' : 'Zgłoś sugestię do adminów'}</button>
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.8rem"><span class="streak-slot">${streakChip()}</span><button class="btn btn-ghost" style="font-size:.72rem" onclick="openFanProfile('${discordUser?.id || ''}')">👤 ${currentLang === 'en' ? 'My fan profile' : 'Mój profil kibica'}</button></div>
    <div class="karnet-slot" style="margin-top:.8rem">${_karnet ? karnetHtml(_karnet) : ''}</div>
    <div id="mp-fans"></div>
    ${_challengesHtml()}
    ${_pushCardHtml()}
    <div id="me-profile-box" style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.7rem .85rem;margin-top:.8rem">
      <div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.5rem">🎮 MÓJ PROFIL GRACZA I DOSTĘPNOŚĆ</div>
      ${isCaptain ? `<div style="font-size:.76rem;color:var(--muted);margin-bottom:.6rem">🧢 Jako kapitan jesteś połączony z <b>${_h(team)}</b> automatycznie (przez zgłoszenie drużyny). Jeśli sam grasz, wybierz swój nick ze składu — wtedy pojawisz się przy nim w tabeli dostępności.</div>`
        : `<div style="font-size:.74rem;color:var(--muted);margin-bottom:.6rem">Wybierz drużynę i swój nick ze składu — przypisanie potwierdza kapitan drużyny. Nie ma Cię w składzie? Poproś kapitana o dopisanie.
          ${myProfile?.team ? `<br>Status: ${myProfile.status === 'confirmed' ? '<b style="color:var(--win)">✅ potwierdzony</b>' : '<b style="color:var(--accent)">⏳ czeka na kapitana</b>'}` : ''}</div>`}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.7rem">
        <div><label style="${_MODAL_LBL}">Drużyna</label><select id="me-team" ${isCaptain ? 'disabled' : ''} style="${_MODAL_INP}" onchange="_meFillRoster(this.value)">
          <option value="">— bez drużyny —</option>${teamsOpts.map(t => `<option ${t === (isCaptain ? team : myProfile?.team) ? 'selected' : ''}>${_h(t)}</option>`).join('')}</select></div>
        <div><label style="${_MODAL_LBL}">Mój nick ze składu</label><select id="me-gt" style="${_MODAL_INP}"></select></div>
      </div>
      ${isCaptain ? `<div style="margin-bottom:.7rem">${_membersHtml(team, true, 'panel') || '<div style="font-size:.74rem;color:var(--muted)">Nikt z drużyny nie połączył jeszcze konta.</div>'}
        <button class="btn btn-primary" style="font-size:.74rem;margin-top:.45rem" onclick="openTeamRoster(this.dataset.t, 'g')" data-t="${_h(team)}">👥 Skład i dostępność drużyny</button></div>` : ''}
      <label style="${_MODAL_LBL}">W które dni zwykle mogę grać</label>
      <div style="display:flex;gap:.3rem;margin-bottom:.45rem">${dayRow(days, 'g')}</div>
      ${(() => { const h = Object.values(myProfile?.hours || {})[0] || ['', ''];
        const opt = v => '<option value="">—</option>' + TW_OPTS.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('');
        return `<div style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:var(--muted);margin-bottom:.7rem">🕐 zwykle w godzinach od
          <select id="me-h-f" style="width:auto;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.2rem">${opt(h[0])}</select> do
          <select id="me-h-t" style="width:auto;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.2rem">${opt(h[1])}</select>
          <span style="font-size:.68rem">(puste = cały wieczór)</span></div>`; })()}
      ${nextWeek ? `<label style="${_MODAL_LBL}">Wyjątek na Week ${curWeek || nextWeek} <span style="font-weight:400;text-transform:none;letter-spacing:0">(zostaw puste = jak zwykle)</span></label>
        <div style="display:flex;gap:.3rem;margin-bottom:.8rem">${dayRow(wkDays(curWeek || nextWeek) || [false, false, false, false, false, false, false], 'w')}</div>` : ''}
      <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" onclick="saveMyProfile(${curWeek || nextWeek || 'null'})">💾 Zapisz</button></div>
    </div>`;
  target.innerHTML += '</div>';
  _meFillRoster(isCaptain ? team : (myProfile?.team || ''), myProfile?.gamertag || me || '');
}
function _meFillRoster(teamName, sel) {
  const el = document.getElementById('me-gt');
  if(!el) return;
  const roster = (teamRegistrations.find(r => r.teamName === teamName)?.players || []).map(p => p.gamertag);
  const cur = sel !== undefined ? sel : el.value;
  const capHere = discordUser && teamRegistrations.some(r => r.teamName === teamName && r.captain?.id === discordUser.id);
  // tylko nicki, których nikt inny nie ma już potwierdzonych (zgłoszone przez kogoś — z dopiskiem)
  const others = playersList.filter(p => p.id !== discordUser?.id && p.team && String(p.team).toLowerCase() === String(teamName).toLowerCase());
  const owner = g => others.find(p => String(p.gamertag || '').toLowerCase() === String(g).toLowerCase());
  const free = roster.filter(g => g === cur || owner(g)?.status !== 'confirmed');
  el.innerHTML = teamName
    ? `<option value="">${capHere ? '— nie gram / bez nicku —' : free.length ? '— wybierz swój nick —' : '— wszystkie nicki są już połączone —'}</option>` +
      free.map(g => `<option value="${_h(g)}" ${g === cur ? 'selected' : ''}>${_h(g)}${owner(g)?.status === 'pending' ? ' (ktoś już zgłosił — zdecyduje kapitan)' : ''}</option>`).join('')
    : '<option value="">—</option>';
  el.disabled = !teamName;
}
async function saveMyProfile(week) {
  if(!_ensureSession()) return;
  const read = key => DOW.map((_, i) => !!document.querySelector(`#mypanel-view button[data-k="${key}"][data-i="${i}"]`)?.classList.contains('on'));
  const days = read('g'), wk = read('w');
  const hf = document.getElementById('me-h-f')?.value || '', ht = document.getElementById('me-h-t')?.value || '';
  if((hf || ht) && !(hf && ht && _twMin(ht) > _twMin(hf))) { showToast('Podaj godziny „od” i „do” (koniec po początku)', 'info'); return; }
  const hours = {};
  if(hf && ht) DOW.forEach((_, i) => { if(days[i] || wk[i]) hours[i] = [hf, ht]; });
  const weeks = { ...(myProfile?.weeks || {}) };
  if(week) { if(wk.some(Boolean)) weeks[week] = wk; else delete weeks[week]; }
  const isCaptainNow = discordUser && teamRegistrations.some(r => r.status === 'approved' && r.captain?.id === discordUser.id);
  const capTeam = isCaptainNow ? _myTeamName() : null;
  const res = await _api('/me', 'POST', { team: capTeam || document.getElementById('me-team').value, gamertag: (document.getElementById('me-gt')?.value || '').trim(), days, weeks, hours, seasonId: currentSeasonId || null }, { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  myProfile = res.me;
  const i = playersList.findIndex(p => p.id === res.me.id);
  if(i >= 0) playersList[i] = res.me; else playersList.push(res.me);
  showToast(myProfile.status === 'pending' ? '✅ Zapisano — kapitan dostał prośbę o potwierdzenie' : '✅ Zapisano', 'success');
  renderMyPanelView(); renderSeasonSchedule();
}
