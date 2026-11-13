/*@v:af4a9d7b1a*/
function openCreateEventModal(editId) {
  const ev = editId ? events.find(e => e.id === editId) : null;
  document.getElementById('event-modal-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:2px;margin-bottom:1.25rem">
      ${ev ? '✏️ EDYTUJ EVENT' : '🏆 NOWY EVENT'}
    </div>
    <label>Nazwa eventu</label>
    <input id="ev-title" type="text" value="${ev?.title||''}" placeholder="np. NBA 2K Liga Draft #1"
      style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit;box-sizing:border-box">

    <label style="margin-top:.75rem">Typ eventu</label>
    <select id="ev-type" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit">
      ${Object.entries(EVENT_TYPES).map(([k,v]) => `<option value="${k}"${(ev?.type||'draft')===k?' selected':''}>${v.label}</option>`).join('')}
    </select>
      ${!EU_MODE ? `<label style="display:flex;gap:.5rem;align-items:center;margin-top:.6rem;cursor:pointer;text-transform:none;letter-spacing:0;font-size:.86rem"><input type="checkbox" id="ev-shared" ${ev?.shared ? 'checked' : ''} style="width:auto"> 🌍 Wspólny draft dla PL i EU <span style="font-size:.72rem;color:var(--muted)">(widoczny też na eu.chemikleagues.com, jedna lista zapisów)</span></label>` : ''}

    <label style="margin-top:.75rem">Data i godzina eventu</label>
    <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem">
      <input id="ev-date" type="date" value="${ev?.date||''}"
        style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit;width:100%;box-sizing:border-box">
      <input id="ev-time" type="time" value="${ev?.time||''}"
        style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit;width:120px">
    </div>

    <label style="margin-top:.75rem">Maks. graczy (opcjonalne)</label>
    <input id="ev-max" type="number" min="2" max="100" value="${ev?.maxPlayers||''}" placeholder="bez limitu"
      style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit">

    <label style="margin-top:.75rem">Opis (opcjonalne)</label>
    <textarea id="ev-desc" rows="3" placeholder="Zasady, nagrody, informacje..."
      style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem;font-family:inherit;resize:vertical;box-sizing:border-box">${ev?.description||''}</textarea>

    <div style="display:flex;gap:.75rem;margin-top:1.25rem">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="saveEvent('${editId||''}')">
        ${ev ? '💾 Zapisz zmiany' : '✅ Utwórz event'}
      </button>
      <button class="btn btn-ghost" onclick="document.getElementById('event-modal').classList.remove('open')">Anuluj</button>
    </div>`;
  document.getElementById('event-modal').classList.add('open');
}
function openEditEventModal(id) { openCreateEventModal(id); }
async function saveEvent(editId) {
  const title = document.getElementById('ev-title').value.trim();
  const type  = document.getElementById('ev-type').value;
  const date  = document.getElementById('ev-date').value;
  const time  = document.getElementById('ev-time')?.value || '';
  const max      = +document.getElementById('ev-max').value || null;
  const desc = document.getElementById('ev-desc').value.trim();
  if(!title) { showToast('❌ Wpisz nazwę eventu', 'error'); return; }

  if(editId) {
    const idx = events.findIndex(e => e.id === editId);
    const shared = !EU_MODE && type === 'draft' && !!document.getElementById('ev-shared')?.checked;
    if(idx !== -1) events[idx] = { ...events[idx], title, type, date, time, maxPlayers: max, description: desc, shared };
  } else {
    events.push({ id: 'ev_' + Date.now(), title, type, date, time, maxPlayers: max, shared: !EU_MODE && type === 'draft' && !!document.getElementById('ev-shared')?.checked,
      description: desc, status: 'open', players: [], teams: [],
      createdAt: new Date().toISOString() });
  }
  await saveData();
  document.getElementById('event-modal').classList.remove('open');
  renderEvents();
  showToast(editId ? '✅ Event zaktualizowany' : '✅ Event utworzony', 'success');
}
async function deleteEvent(id) {
  if(!_isLoggedInSync()) { showToast('❌ Tylko główny admin może usuwać eventy', 'error'); return; }
  if(!confirm('Usunąć event?')) return;
  events = events.filter(e => e.id !== id);
  await saveData();
  renderEvents();
  showToast('🗑 Event usunięty', 'info');
}
async function finishEvent(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  if(!confirm('Zakończyć event "' + ev.title + '"? Status zmieni się na Zakończony.')) return;
  ev.status = 'finished';
  await saveData();
  renderEvents();
  showToast('🏆 Event zakończony!', 'success');
}
// ═══ 🧪 testowe eventy: usuwanie · ♻️ przywracanie eventów z kopii zapasowej ═══
async function removeTestEvents() {
  const n = (events || []).filter(e => String(e.id).startsWith('test_ev_')).length;
  if(!n) { showToast('Brak testowych eventów', 'info'); return; }
  if(!confirm(`Usunąć ${n} testowych eventów? Prawdziwe eventy zostaną nietknięte.`)) return;
  events = events.filter(e => !String(e.id).startsWith('test_ev_'));
  window._evAllowShrink = true;
  if(await saveData()) { renderEvents(); try { renderEventsDashboard(); } catch(e) {} showToast(`🗑 Usunięto ${n} testowych eventów`, 'success'); }
}
async function openEventsRestore() {
  const m = _fxModal('evrestore-modal', 640), box = m.querySelector('.modal');
  box.innerHTML = _fxHead('evrestore-modal', '♻️ Przywróć eventy z kopii zapasowej') + '<div style="color:var(--muted)">⏳ Wczytuję listę kopii…</div>';
  m.classList.add('open');
  const r = await _api('/backups', 'GET', null, { admin: true });
  if(!r.ok) { box.innerHTML = _fxHead('evrestore-modal', '♻️ Przywróć eventy') + `<div style="color:var(--loss)">❌ ${_h(r.error)} — przywracanie wymaga konta admina ligi.</div>`; return; }
  const list = (r.backups || []).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  box.innerHTML = _fxHead('evrestore-modal', '♻️ Przywróć eventy z kopii zapasowej') + `
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.6rem">Wybierz kopię z dnia, w którym eventy jeszcze były. Pokażę eventy, których dziś brakuje — przywrócisz tylko zaznaczone, a obecne eventy zostaną.</div>
    <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.7rem">
      <select id="evr-date" style="${_MODAL_INP};width:auto">${list.map(b => `<option value="${_h(b.date)}">${_h(b.date)}</option>`).join('') || '<option value="">brak kopii</option>'}</select>
      <button class="btn btn-ghost" onclick="evRestoreLoad()">🔍 Pokaż eventy z tej kopii</button>
    </div>
    <div id="evr-list"></div>`;
}
async function evRestoreLoad() {
  const date = document.getElementById('evr-date')?.value, out = document.getElementById('evr-list');
  if(!date) return;
  out.innerHTML = '<div style="color:var(--muted)">⏳ Wczytuję kopię…</div>';
  const r = await _api('/backup?date=' + encodeURIComponent(date), 'GET', null, { admin: true });
  if(!r.main && !r.extra) { out.innerHTML = `<div style="color:var(--loss)">❌ ${_h(r.error || 'Nie udało się wczytać kopii')}</div>`; return; }
  let found = [];
  try { found = (r.main?.record?.events || r.main?.events || []); } catch(e) {}
  try { const ev2 = r.extra?.nba2k_events ? JSON.parse(r.extra.nba2k_events) : []; ev2.forEach(e => { if(!found.some(x => x.id === e.id)) found.push(e); }); } catch(e) {}
  const have = new Set((events || []).map(e => e.id));
  const missing = found.filter(e => !have.has(e.id) && !String(e.id).startsWith('test_ev_'));
  window._evRestoreCand = missing;
  out.innerHTML = missing.length ? `<div style="font-size:.78rem;margin-bottom:.4rem">W kopii z <b>${_h(date)}</b> jest <b>${missing.length}</b> ${_plPL(missing.length, 'event', 'eventy', 'eventów')}, których dziś brakuje:</div>
    <div style="display:flex;flex-direction:column;gap:.3rem;max-height:45vh;overflow-y:auto">${missing.map((e, i) => `<label style="display:flex;gap:.5rem;align-items:center;font-size:.82rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);background:var(--surface2);border-radius:8px;padding:.4rem .6rem;cursor:pointer;margin:0">
      <input type="checkbox" data-evr="${i}" checked style="width:auto;margin:0;accent-color:var(--accent)"> <b>${_h(e.title || e.id)}</b> <span style="color:var(--muted);font-size:.72rem">${_h(e.date || '')} · ${_h(e.status || '')} · ${(e.players || []).length} graczy${(e.matches || []).length ? ' · ' + e.matches.length + ' meczów' : ''}</span></label>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;margin-top:.7rem"><button class="btn btn-primary" onclick="evRestoreApply()">♻️ Przywróć zaznaczone</button></div>`
    : `<div style="color:var(--muted);font-size:.82rem">W tej kopii nie ma eventów, których dziś brakuje. Spróbuj kopii z wcześniejszego dnia.</div>`;
}
async function evRestoreApply() {
  const pick = [...document.querySelectorAll('#evr-list [data-evr]')].filter(x => x.checked).map(x => window._evRestoreCand[+x.dataset.evr]).filter(Boolean);
  if(!pick.length) return;
  events = [...(events || []), ...pick.filter(e => !(events || []).some(x => x.id === e.id))];
  if(await saveData()) { _fxClose('evrestore-modal'); renderEvents(); try { renderEventsDashboard(); } catch(e) {} showToast(`♻️ Przywrócono ${pick.length} ${_plPL(pick.length, 'event', 'eventy', 'eventów')}`, 'success'); }
}
async function loadTestEvents() {
  if(!_isEventsAdminSync()) return;
  const players20 = [
    {id:'tp_01',name:'SwatSZTP',discordTag:'swat123',avatar:'',positions:['PG']},
    {id:'tp_02',name:'MosthatedTrojan',discordTag:'trojan',avatar:'',positions:['SG','SF']},
    {id:'tp_03',name:'kaczelinho',discordTag:'kacz',avatar:'',positions:['PG','SG']},
    {id:'tp_04',name:'Kolaczuk',discordTag:'kolacz',avatar:'',positions:['SF']},
    {id:'tp_05',name:'ICantShoot4Real',discordTag:'icant',avatar:'',positions:['C']},
    {id:'tp_06',name:'DancerAce',discordTag:'dancer',avatar:'',positions:['SG']},
    {id:'tp_07',name:'Rudi Gay',discordTag:'rudi',avatar:'',positions:['PF','C']},
    {id:'tp_08',name:'Pszczolo',discordTag:'pszcz',avatar:'',positions:['PG']},
    {id:'tp_09',name:'KubbasOG',discordTag:'kubbas',avatar:'',positions:['SF','PF']},
    {id:'tp_10',name:'IlzPower2k',discordTag:'ilz',avatar:'',positions:['PG','SG']},
    {id:'tp_11',name:'Turio3d',discordTag:'turio',avatar:'',positions:['C']},
    {id:'tp_12',name:'Chemik81',discordTag:'chemik',avatar:'',positions:['SF']},
    {id:'tp_13',name:'BrickWall',discordTag:'brick',avatar:'',positions:['PF','C']},
    {id:'tp_14',name:'NightCrawler',discordTag:'night',avatar:'',positions:['SG','SF']},
    {id:'tp_15',name:'SmoothOp',discordTag:'smooth',avatar:'',positions:['PG']},
    {id:'tp_16',name:'IronFist',discordTag:'iron',avatar:'',positions:['PF']},
    {id:'tp_17',name:'Fadeaway',discordTag:'fade',avatar:'',positions:['SG']},
    {id:'tp_18',name:'PostUp',discordTag:'post',avatar:'',positions:['C','PF']},
    {id:'tp_19',name:'QuickDraw',discordTag:'quick',avatar:'',positions:['PG','SG']},
    {id:'tp_20',name:'GlassEater',discordTag:'glass',avatar:'',positions:['C']},
  ];

  const today = new Date().toISOString().slice(0,10);
  const nextWeek = new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const nextMonth = new Date(Date.now()+30*86400000).toISOString().slice(0,10);

  const testEvs = [
    {
      id:'test_ev_1',
      title:'Demo Draft — otwarte zapisy (test powiadomień)',
      type:'draft', date: today,
      description:'Event testowy — otwarte zapisy. Dołącz jako gracz, zamknij zapisy, wylosuj kapitanów, wyślij powiadomienia.',
      status:'open',
      maxPlayers:20, numTeams:4,
      players: players20.slice(0, 12),
      teams:[], draftPool:[], draftTurn:0, draftOrder:[],
      createdAt: new Date().toISOString(),
    },
    {
      id:'test_ev_2',
      title:'Draft w trakcie — Snake 4 drużyny',
      type:'draft', date: today,
      description:'Symulacja trwającego draftu — 3 picki już wykonane.',
      status:'draft',
      maxPlayers:20, numTeams:4,
      players: players20,
      teams:[
        {name:'Drużyna A', captain:players20[0], players:[players20[0], players20[7], players20[14]]},
        {name:'Drużyna B', captain:players20[1], players:[players20[1], players20[6]]},
        {name:'Drużyna C', captain:players20[2], players:[players20[2], players20[5]]},
        {name:'Drużyna D', captain:players20[3], players:[players20[3], players20[4]]},
      ],
      draftPool: players20.filter((_,i) => ![0,1,2,3,4,5,6,7,14].includes(i)),
      draftTurn:7,
      draftOrder:[0,1,2,3,3,2,1,0,0,1,2,3,3,2,1,0],
      draftMethod:'snake',
      createdAt: new Date().toISOString(),
    },
    {
      id:'test_ev_3',
      title:'Zapisy otwarte — Pickup Game',
      type:'pickup', date: nextWeek,
      description:'Weekendowy pickup game, max 10 graczy. Zapisz się!',
      status:'open',
      maxPlayers:10, numTeams:2,
      players: players20.slice(0,6),
      teams:[], draftPool:[],
      createdAt: new Date().toISOString(),
    },
    {
      id:'test_ev_4',
      title:'Turniej 1v1 — eliminacje',
      type:'1v1', date: nextWeek,
      description:'Turniej 1v1. Top 16 graczy — zapisy wkrótce.',
      status:'open',
      maxPlayers:16, numTeams:0,
      players: players20.slice(0,3),
      teams:[], draftPool:[],
      createdAt: new Date().toISOString(),
    },
    {
      id:'test_ev_5',
      title:'Turniej drużynowy — sezon 3',
      type:'tournament', date: nextMonth,
      description:'Oficjalny turniej drużynowy. Zapisy otwarte do końca miesiąca.',
      status:'open',
      maxPlayers:null, numTeams:8,
      players: players20.slice(0,12),
      teams:[], draftPool:[],
      createdAt: new Date().toISOString(),
    },
  ];

  // Aktualne eventy z ich własnego zapisu (prawdziwe eventy zostają nietknięte)
  if(workerUrl && _eventsStore) {
    try { const r = await _api('/events', 'GET', null, {}); if(r.ok && Array.isArray(r.events)) events = r.events; } catch(e) {}
  }
  // Remove old test events and add fresh ones
  events = events.filter(e => !e.id.startsWith('test_ev_'));
  events.push(...testEvs);
  await saveData();
  renderEvents();
  showToast('✅ Załadowano 5 eventów testowych!', 'success');
}
async function closeEventSignups(id) {
  const ev = events.find(e => e.id === id);
  if(!ev) return;
  ev.status = 'closed';
  await saveData();
  renderEvents();
  renderEventsDashboard();
  // Refresh event detail modal if it's open
  const detailModal = document.getElementById('event-detail-modal');
  if(detailModal?.classList.contains('open')) openEventDetail(id);
  showToast(currentLang === 'en' ? '🔒 Sign-ups closed' : '🔒 Zapisy zamknięte', 'info');
}
async function randomizeTeams(id) {
  const ev = events.find(e => e.id === id);
  if(!ev || !ev.players?.length) { showToast('❌ Brak graczy', 'error'); return; }
  const shuffled = [...ev.players].sort(() => Math.random() - 0.5);
  const half = Math.ceil(shuffled.length / 2);
  ev.teams = [
    { name: 'Drużyna A', players: shuffled.slice(0, half) },
    { name: 'Drużyna B', players: shuffled.slice(half) },
  ];
  ev.status = 'active';
  await saveData();
  renderEvents();
  openEventDetail(id);
  showToast('🎲 Drużyny wylosowane!', 'success');
}
function openEventDetail(id, tab) {
  const ev = events.find(e => e.id === id);
  if(!ev) return; _modalUrl('/event/' + encodeURIComponent(id));
  window._currentEventId = id;
  renderEventDetailTab(id, tab || 'info');
  document.getElementById('event-detail-modal').classList.add('open');
}
function renderEventDetailTab(id, tab, sortCol, sortDir) {
  _renderEventDetailTabInner(id, tab, sortCol, sortDir);
  const md = document.querySelector('#event-detail-modal .modal');
  if(md && !md.querySelector('.ev-link-btn')) md.insertAdjacentHTML('afterbegin', `<button class="btn btn-ghost ev-link-btn" onclick="copyEventLink('${String(id).replace(/'/g, '')}')" title="${_g('Link prosto do tego draftu — do wklejenia na Discordzie', 'Direct link to this draft — paste it on Discord')}" style="position:absolute;top:.9rem;right:3.4rem;font-size:.7rem;padding:.2rem .55rem;z-index:2">🔗 ${_g('Link', 'Link')}</button>`);
}
function _renderEventDetailTabInner(id, tab, sortCol, sortDir) {
  const ev = events.find(e => e.id === id);
  if(!ev) return;
  const type = EVENT_TYPES[ev.type] || { label: ev.type };
  const status = EVENT_STATUS[ev.status] || { label: ev.status, color: 'var(--muted)' };
  const isAdmin = _isEventsAdminSync() && !ev._peer; // 🌍 wspólnym draftem zarządza liga PL
  const evMatches = ev.matches || [];

  const tabs = [
    { id: 'info',  label: 'ℹ️ Szczegóły' },
    { id: 'matches', label: `🏀 Mecze (${evMatches.length})` },
    { id: 'stats', label: '📊 Statystyki' },
    { id: 'bracket', label: _g('🎯 Drabinka', '🎯 Bracket') },
    { id: 'phases', label: _g('📋 Fazy', '📋 Phases') },
  ];

  const tabBar = tabs.map(t =>
    `<button onclick="renderEventDetailTab('${id}','${t.id}')"
      style="padding:.5rem 1rem;border:none;border-bottom:2px solid ${tab===t.id?'var(--accent)':'transparent'};
      background:none;color:${tab===t.id?'var(--accent)':'var(--muted)'};font-weight:${tab===t.id?'700':'400'};
      cursor:pointer;font-family:inherit;font-size:.85rem;transition:all .2s;white-space:nowrap">${t.label}</button>`
  ).join('');

  let tabContent = '';

  if(tab === 'info') {
    const _ovrOn = !!_evOvr[id];
    const _enriched = _ovrOn ? _dsComputeOvr(ev.players||[], _evOvr._nameMap||{}) : null;
    const playersList = (ev.players||[]).map(p => {
      const ep = _enriched ? _enriched.find(x=>x.id===p.id)||p : p;
      const pri = p.primaryPos || (p.positions?.[0]);
      const sec = (p.positions||[]).filter(x=>x!==pri);
      const posBadges = (pri ? `<span style="font-size:.7rem;color:var(--accent);background:rgba(245,197,24,.12);border-radius:4px;padding:.1rem .35rem;font-weight:700">${pri}</span>` : '')
        + (sec.length ? `<span style="font-size:.7rem;color:var(--muted);background:var(--surface2);border-radius:4px;padding:.1rem .3rem">${sec.join('·')}</span>` : '');
      const mIcon = ep.matchMethod==='exact'||ep.matchMethod==='alias'||ep.matchMethod==='manual' ? '🟢'
        : ep.matchMethod==='fuzzy' ? '🟡' : '';
      const psnLabel = _ovrOn && ep.ingameName && ep.ingameName!==p.name
        ? `<span style="font-size:.68rem;color:var(--muted);margin-left:.25rem">${mIcon}PSN: ${ep.ingameName}</span>` : '';
      // Use OVR frozen at signup time if available, fallback to current
      const displayOvr = p.signupOvr ?? ep.ovr;
      const ovrBadge = _ovrOn ? `<span style="background:${_dsOvrColor(displayOvr)};color:rgba(0,0,0,.75);border-radius:4px;padding:.08rem .4rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;margin-left:.25rem" title="OVR przy zapisie${p.signupOvr ? '' : ' (brak historii — aktualny)'}">${displayOvr}</span>` : '';
      const miniStats = _ovrOn && ep.gp
        ? `<span style="font-size:.7rem;color:var(--muted);margin-left:.35rem">${ep.ppg}pts ${ep.rpg}reb ${ep.apg}ast ${ep.spg}stl ${ep.bpg}blk</span>`
        : (_ovrOn ? `<span style="font-size:.7rem;color:var(--muted);margin-left:.35rem">brak danych</span>` : '');
      return `<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
        ${p.avatar ? `<img src="${p.avatar}" style="width:28px;height:28px;border-radius:50%;flex-shrink:0">` : '<div style="width:28px;height:28px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0">👤</div>'}
        <span style="font-weight:600;font-size:.9rem">${p.name}${(ev.shared || ev._peer) && p.league ? (p.league === 'EU' ? ' 🇪🇺' : ' 🇵🇱') : ''}</span>
        ${p.speaksEnglish ? '<span title="Speaks English" style="display:inline-flex;align-items:center;vertical-align:middle;margin-left:2px"><svg width="20" height="13" viewBox="0 0 60 30" style="border-radius:2px;border:1px solid rgba(0,0,0,.2);flex-shrink:0" xmlns="http://www.w3.org/2000/svg"><clipPath id="uf"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#uf)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg></span>' : ''}
        ${p.discordTag && p.discordTag !== p.name ? `<span style="color:var(--muted);font-size:.75rem">(${p.discordTag})</span>` : ''}
        ${posBadges}${psnLabel}${ovrBadge}${miniStats}
        ${isAdmin ? `<button onclick="removePlayerFromEvent('${id}','${p.id}')" style="margin-left:auto;background:transparent;border:none;color:var(--loss);cursor:pointer;font-size:.9rem">✕</button>` : ''}
      </div>`;
    }).join('');

    const teamsHtml = (ev.teams||[]).map(t => `
      <div style="background:var(--surface2);border-radius:8px;padding:.75rem;margin-bottom:.5rem">
        <div style="font-weight:700;margin-bottom:.4rem">${t.name} <span style="font-size:.75rem;color:var(--muted)">(kpt: ${t.captain?.name||'—'})</span></div>
        ${(t.players||[]).map(p => `<div style="font-size:.85rem;padding:.15rem 0;color:${p.id===t.captain?.id?'var(--accent)':'var(--text)'}">
          ${p.id===t.captain?.id?'★ ':''}${p.name}</div>`).join('')}
      </div>`).join('');

    tabContent = `
      <div style="margin-bottom:1.25rem">
        <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem">
          ${ev.date ? '<span style="font-size:.9rem;color:var(--muted)">📅 ' + ev.date + (ev.time ? ' <b style="color:var(--text)">' + ev.time + '</b>' : '') + '</span>' : ''}
          <span style="font-size:.85rem;color:${status.color};font-weight:700">${status.label}</span>
          ${ev.maxPlayers ? '<span style="font-size:.8rem;color:var(--muted)">👥 ' + _g('maks.', 'max.') + ' ' + ev.maxPlayers + ' ' + _g('graczy', 'players') + '</span>' : ''}
        </div>
        ${ev.description ? `<div style="background:var(--surface2);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:.85rem 1rem;font-size:.9rem;line-height:1.6;white-space:pre-wrap;margin-bottom:.25rem">${ev.description}</div>` : ''}
      </div>
      ${ev.teams?.length ? `<div style="margin-bottom:1.25rem"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;margin-bottom:.5rem">🏀 DRUŻYNY</div>${teamsHtml}${_draftGradesHtml(ev)}</div>` : ''}
      <div style="margin-bottom:1.25rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px">
            👥 ${_g('ZAPISANI GRACZE', 'SIGNED-UP PLAYERS')} (${(ev.players||[]).length}${ev.maxPlayers?'/'+ev.maxPlayers:''})
          </div>
          ${(ev.players||[]).length?`<button onclick="_evToggleOvr('${id}')" id="ev-ovr-btn-${id}" style="background:${_evOvr[id]?'var(--accent)':'var(--surface2)'};border:1px solid ${_evOvr[id]?'var(--accent)':'var(--border)'};color:${_evOvr[id]?'#000':'var(--text)'};border-radius:6px;padding:.25rem .7rem;font-size:.75rem;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:700">📊 Overall</button>`:''}
        </div>
        ${playersList || '<div style="color:var(--muted);font-size:.85rem;padding:.5rem 0">Brak zapisanych graczy</div>'}
      </div>

      ${(ev.waitlist||[]).length ? `<div style="margin-top:1rem;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.35);border-radius:10px;padding:.6rem .8rem">
        <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:#f59e0b;margin-bottom:.35rem">⏳ LISTA REZERWOWA (${ev.waitlist.length})</div>
        <div style="display:flex;flex-wrap:wrap;gap:.35rem">${ev.waitlist.map((p, i) => `<span style="font-size:.78rem;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:.15rem .55rem">${i + 1}. ${_h(p.name)}${(ev.shared || ev._peer) && p.league ? (p.league === "EU" ? " 🇪🇺" : " 🇵🇱") : ""}${p.primaryPos ? ` <b style="color:var(--accent);font-size:.68rem">${p.primaryPos}</b>` : ''}</span>`).join('')}</div>
        <div style="font-size:.66rem;color:var(--muted);margin-top:.35rem">Gdy ktoś się wypisze, pierwsza osoba z rezerwy wchodzi automatycznie i dostaje wiadomość na Discordzie.</div>
      </div>` : ''}
      ${['open','closed','draft'].includes(ev.status) ? `
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
          ${discordUser ? `
            ${['closed','draft'].includes(ev.status) && (ev.teams||[]).some(t => t.captain?.id === discordUser?.id) ? `
              <button onclick="openGMPanel('${ev.id}')" class="btn btn-primary" style="width:100%;justify-content:center;background:var(--accent);color:#000;font-size:1rem;padding:.8rem">🎮 Panel GM — Jesteś kapitanem</button>
            ` : ev.status === 'open' && (ev.waitlist||[]).find(p => p.id === discordUser.id) ? `
              <div style="color:#f59e0b;font-weight:700;text-align:center;padding:.75rem">⏳ Jesteś na liście rezerwowej (#${(ev.waitlist||[]).findIndex(p => p.id === discordUser.id) + 1}) — wejdziesz, gdy zwolni się miejsce</div>
              <button onclick="cancelSignup('${ev.id}')" class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:.5rem">Wypisz się z rezerwy</button>
            ` : ev.status === 'open' && (ev.players||[]).find(p => p.id === discordUser.id) ? `
              <div style="color:var(--win);font-weight:700;text-align:center;padding:.75rem">✅ Jesteś zapisany na ten event!</div>
              <button onclick="cancelSignup('${ev.id}')" class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:.5rem">Wypisz się</button>
            ` : ev.status === 'open' ? `
              <button onclick="signupToEvent('${ev.id}')" class="btn btn-primary" style="width:100%;justify-content:center">${ev.maxPlayers && (ev.players||[]).length >= ev.maxPlayers ? '📝 Zapisz się na listę rezerwową' : (currentLang==='en'?'🎮 Sign up':'🎮 Zapisz się')}</button>
            ` : ''}
          ` : `
            <button onclick="loginWithDiscord('${ev.id}')" style="width:100%;background:#5865F2;color:#fff;border:none;border-radius:8px;padding:.8rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem">
              <svg width="20" height="20" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.6 37.6 0 0 0 25.4.5a.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.5 4.9a.2.2 0 0 0-.1.1C1.5 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 9 .2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.7-9 .2.2 0 0 0 .1-.2C73 29.2 69.4 16.4 60.2 5a.2.2 0 0 0-.1-.1zM23.7 36c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" fill="#fff"/></svg>
              Zaloguj się przez Discord
            </button>
          `}
        </div>` : ''}
      ${isAdmin && ev.status === 'open' ? `
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;margin-bottom:.75rem">➕ DODAJ GRACZA RĘCZNIE</div>
          <input id="manual-player-name" type="text" placeholder="Nick gracza"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem;font-family:inherit;margin-bottom:.6rem;box-sizing:border-box"
            onkeydown="if(event.key==='Enter')addPlayerManually('${id}')">
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.35rem">Główna pozycja</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin-bottom:.5rem">
            ${['PG','SG','SF','PF','C'].map(p => `<div id="manual-pos-${p}" onclick="selectManualPos('${p}')"
              style="display:flex;flex-direction:column;align-items:center;padding:.45rem .3rem;background:var(--surface2);border:2px solid var(--border);border-radius:6px;cursor:pointer;text-align:center;user-select:none;transition:all .15s">
              <div style="font-weight:900;font-size:.85rem">${p}</div>
            </div>`).join('')}
          </div>
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.35rem">Dodatkowe pozycje (opcjonalnie)</div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:.3rem;margin-bottom:.5rem">
            ${['PG','SG','SF','PF','C'].map(p => `<div id="manual-secpos-${p}" onclick="toggleManualSecPos('${p}')"
              style="display:flex;flex-direction:column;align-items:center;padding:.45rem .3rem;background:var(--surface2);border:2px solid var(--border);border-radius:6px;cursor:pointer;text-align:center;user-select:none;transition:all .15s">
              <div style="font-weight:700;font-size:.85rem">${p}</div>
            </div>`).join('')}
          </div>
          <div id="manual-eng-toggle" onclick="toggleManualEnglish()"
            style="display:flex;align-items:center;gap:.6rem;padding:.5rem .75rem;background:var(--surface2);border:2px solid var(--border);border-radius:6px;cursor:pointer;margin-bottom:.6rem;user-select:none;transition:all .15s">
            <svg width="24" height="16" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" style="border-radius:2px;flex-shrink:0"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="12"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="7"/></svg>
            <span style="font-size:.82rem;font-weight:700;flex:1">Komunikuje się po angielsku</span>
            <div id="manual-eng-check" style="width:18px;height:18px;border-radius:3px;border:2px solid var(--border);background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0"></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="addPlayerManually('${id}')">➕ Dodaj gracza</button>
        </div>` : ''}

      ${isAdmin && ev.type === 'draft' && (ev.status === 'closed' || ev.status === 'draft') ? `
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;margin-bottom:.75rem">👑 AKCJE ADMINA</div>
          <div style="display:flex;gap:.75rem;flex-wrap:wrap">
            ${ev.status === 'draft' ? `
              <button onclick="document.getElementById('event-detail-modal').classList.remove('open');openDraftView('${id}')" class="btn btn-primary" style="font-size:1rem;padding:.8rem 1.75rem">🎯 Wróć do Draft</button>
              <button onclick="finishDraft('${id}')" class="btn btn-ghost">✅ Zakończ draft</button>
            ` : `
              <button onclick="document.getElementById('event-detail-modal').classList.remove('open');openDraftSetup('${id}')" class="btn btn-primary" style="font-size:1rem;padding:.8rem 1.75rem">⚙️ Setup Draftu</button>
            `}
          </div>
        </div>` : ''}

      ${isAdmin ? `
        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;margin-bottom:.5rem">🔔 POWIADOMIENIA DISCORD</div>
          <div style="font-size:.78rem;color:var(--muted);margin-bottom:.75rem">Wyślij DM do wszystkich memberów serwera z informacją o tym evencie.</div>
          <button onclick="openNotifyModal('${id}')" class="btn btn-ghost" style="width:100%;justify-content:center;gap:.5rem">
            📨 Wyślij powiadomienie o evencie
          </button>
        </div>` : ''}`;
  }

  else if(tab === 'matches') {
    const matchCards = evMatches.length ? evMatches.map((m,i) => `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem 1.25rem;margin-bottom:.75rem;cursor:pointer"
        onclick="openEventMatchDetail('${id}',${i})">
        <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem">
          <div>
            <div style="font-weight:700;font-size:1rem">${m.team1?.name||'—'}</div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:${m.team1?.score>m.team2?.score?'var(--accent)':'var(--text)'}">${m.team1?.score??'—'}</div>
          </div>
          <div style="text-align:center">
            <div style="color:var(--muted);font-size:.75rem">${m.date||''}</div>
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;margin:.3rem auto;font-size:.75rem;font-weight:800;color:var(--muted)">VS</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;font-size:1rem">${m.team2?.name||'—'}</div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:${m.team2?.score>m.team1?.score?'var(--accent)':'var(--text)'}">${m.team2?.score??'—'}</div>
          </div>
        </div>
        ${isAdmin ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-top:.5rem" onclick="event.stopPropagation()">
          <label style="display:flex;align-items:center;gap:.35rem;cursor:pointer;font-size:.75rem;color:var(--muted);user-select:none" title="Zaznacz do połączenia">
            <input type="checkbox" id="ev-merge-cb-${id}-${i}" value="${i}"
              onchange="evMergeToggle('${id}',${i},this.checked)"
              style="width:14px;height:14px;accent-color:var(--accent);cursor:pointer">
            Zaznacz
          </label>
          <div style="display:flex;gap:.5rem">
            <button onclick="openEditEventMatch('${id}',${i})"
              style="background:transparent;border:none;color:var(--muted);font-size:.75rem;cursor:pointer">✏️ Edytuj</button>
            <button onclick="deleteEventMatch('${id}',${i})"
              style="background:transparent;border:none;color:var(--muted);font-size:.75rem;cursor:pointer">🗑 Usuń</button>
          </div>
        </div>
        <        <div id="ev-match-edit-${id}-${i}" style="display:none;margin-top:.6rem;padding-top:.6rem;border-top:1px solid var(--border)" onclick="event.stopPropagation()">
          <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem">
            <input id="em-t1n-${id}-${i}" value="${(m.team1?.name||'').replace(/"/g,'&quot;')}" style="flex:1 1 110px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.9rem;font-weight:700">
            <input id="em-t1s-${id}-${i}" type="number" value="${m.team1?.score??''}" style="width:56px;background:var(--bg);border:1px solid var(--border);color:var(--accent);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.9rem;font-weight:900;text-align:center">
            <span style="color:var(--muted);font-weight:700">—</span>
            <input id="em-t2s-${id}-${i}" type="number" value="${m.team2?.score??''}" style="width:56px;background:var(--bg);border:1px solid var(--border);color:var(--accent);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.9rem;font-weight:900;text-align:center">
            <input id="em-t2n-${id}-${i}" value="${(m.team2?.name||'').replace(/"/g,'&quot;')}" style="flex:1 1 110px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.9rem;font-weight:700">
          </div>
          ${(()=>{
            const EV_STATS=['pts','reb','ast','stl','blk','to','fol','fgm','fga','tpm','tpa','ftm','fta'];
            const EV_LABELS=['PTS','REB','AST','STL','BLK','TO','PF','FGM','FGA','3PM','3PA','FTM','FTA'];
            const mkRows=(team,tid)=>(team?.players||[]).map((p,pi)=>`
              <tr>
                <td style="padding:.2rem .3rem"><input type="text" value="${(p.name||''). replace(/"/g,'&quot;')}" id="em-${id}-${i}-${tid}-${pi}-name" style="width:96px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.12rem .25rem;font-size:.76rem;font-family:inherit"></td>
                <td style="padding:.2rem .25rem"><select id="em-${id}-${i}-${tid}-${pi}-pos" style="background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .1rem;font-size:.72rem;font-family:inherit">${['PG','SG','SF','PF','C'].map(pos=>`<option${(p.pos||'')=== pos?' selected':''}>${pos}</option>`).join('')}</select></td>
                <td style="padding:.2rem .25rem"><select id="em-${id}-${i}-${tid}-${pi}-grade" style="background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .1rem;font-size:.72rem;font-family:inherit">${['A+','A','A-','B+','B','B-','C+','C','C-','D'].map(g=>`<option${p.grade===g?' selected':''}>${g}</option>`).join('')}</select></td>
                ${EV_STATS.map(s=>`<td style="padding:.18rem .2rem"><input type="number" min="0" max="99" value="${p[s]||0}" id="em-${id}-${i}-${tid}-${pi}-${s}" style="width:36px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .15rem;font-size:.76rem;text-align:center;font-family:inherit"></td>`).join('')}
              </tr>`).join('');
            const mkTable=(team,tid)=>(team?.players||[]).length?`
              <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:1px;margin:.5rem 0 .25rem;color:var(--accent)">${team.name}</div>
              <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:.5rem">
                <table style="border-collapse:collapse;font-size:.76rem;white-space:nowrap">
                  <thead><tr>
                    <th style="text-align:left;padding:.2rem .3rem;color:var(--muted);font-weight:600">Gracz</th>
                    <th style="padding:.2rem .25rem;color:var(--muted);font-weight:600">Poz</th>
                    <th style="padding:.2rem .25rem;color:var(--muted);font-weight:600">GRD</th>
                    ${EV_LABELS.map(l=>`<th style="padding:.18rem .2rem;color:var(--muted);font-weight:600">${l}</th>`).join('')}
                  </tr></thead>
                  <tbody>${mkRows(team,tid)}</tbody>
                </table>
              </div>`:''
            return mkTable(m.team1,'t1')+mkTable(m.team2,'t2');
          })()}
          <div style="display:flex;gap:.5rem;margin-top:.5rem">
            <button onclick="saveEditEventMatch('${id}',${i})" class="btn btn-primary" style="font-size:.8rem;padding:.35rem .8rem">💾 Zapisz</button>
            <button onclick="document.getElementById('ev-match-edit-${id}-${i}').style.display='none'" class="btn btn-ghost" style="font-size:.8rem;padding:.35rem .8rem">Anuluj</button>
          </div>
        </div>` : ''}
      </div>`).join('')
    : '<div style="color:var(--muted);text-align:center;padding:2rem">Brak meczów — dodaj pierwszy screen poniżej</div>';

    tabContent = `
      ${isAdmin && evMatches.length ? `<div id="ev-merge-bar-${id}" style="display:none;position:sticky;top:0;z-index:10;background:var(--surface);border:1px solid var(--accent);border-radius:8px;padding:.6rem 1rem;margin-bottom:.75rem;display:none;align-items:center;justify-content:space-between;gap:.75rem">
        <span style="font-size:.85rem;font-weight:700;color:var(--accent)" id="ev-merge-info-${id}">Zaznacz dokładnie 2 mecze</span>
        <button onclick="mergeEventMatches('${id}')" class="btn btn-primary" style="font-size:.82rem;padding:.35rem .9rem" id="ev-merge-btn-${id}" disabled>🔗 Połącz mecze</button>
      </div>` : ''}
      <div style="margin-bottom:1rem">${matchCards}</div>
      ${isAdmin && evMatches.length ? `
        <div id="ev-name-fix-${id}" style="margin-bottom:.75rem"></div>
        <button onclick="openEvNameFix('${id}')" class="btn btn-ghost" style="font-size:.8rem;margin-bottom:1rem">🔗 Dopasuj nazwy graczy do rankingu</button>` : ''}
      ${isAdmin ? `
        <div style="border-top:1px solid var(--border);padding-top:1rem">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;margin-bottom:.75rem">📸 DODAJ MECZ ZE SCREENA</div>
          <div style="border:2px dashed var(--border);border-radius:10px;padding:1.5rem;text-align:center;cursor:pointer;position:relative;transition:border-color .2s"
            id="ev-upload-zone" ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
            ondragleave="this.style.borderColor='var(--border)'" ondrop="evDropFile(event,'${id}')">
            <input type="file" accept="image/*" multiple style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%"
              onchange="evFileSelected(event,'${id}')">
            <div style="font-size:2rem;margin-bottom:.5rem">📸</div>
            <div style="font-weight:600;font-size:.9rem">Wrzuć screenshot lub kliknij</div>
            <div style="color:var(--muted);font-size:.8rem;margin-top:.25rem">PNG, JPG — ekran Game Stats z NBA 2K</div>
          </div>
          <div id="ev-parse-status-${id}" style="display:none;margin-top:.75rem;padding:.75rem;border-radius:8px;font-size:.85rem"></div>
          <div id="ev-parse-preview-${id}" style="display:none;margin-top:.75rem"></div>
        </div>` : ''}`;
  }

  else if(tab === 'stats') {
    tabContent = renderEventStats(ev, sortCol, sortDir);
  }

  else if(tab === 'bracket') {
    const mvpBadge = (ev.matches||[]).length ? renderEventMVPBadge(ev) : '';
    tabContent = mvpBadge + renderEventBracket(ev);
  }

  else if(tab === 'phases') {
    tabContent = renderEventPhases(ev);
  }

  document.getElementById('event-detail-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:.25rem">${ev.title}</div>
    <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem">
      <span style="font-size:.85rem;color:var(--muted)">${type.label}</span>
      ${ev.date ? `<span style="font-size:.85rem;color:var(--muted)">📅 ${formatDate(ev.date)}</span>` : ''}
      <span style="font-weight:700;color:${status.color};font-size:.85rem">${status.label}</span>
    </div>
    <div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:1.25rem;overflow-x:auto">${tabBar}</div>
    ${tabContent}`;
}
function renderEventStats(ev, sortCol, sortDir) {
  sortCol = sortCol || 'pts';
  sortDir = (sortDir === undefined) ? -1 : sortDir;
  const evMatches = ev.matches || [];
  if(!evMatches.length) return '<div style="color:var(--muted);text-align:center;padding:2rem 1rem">Brak meczów — dodaj screeny w zakładce Mecze</div>';

  // Build player map
  const playerMap = {};
  const teamWins = {}, teamGames = {};
  evMatches.forEach(m => {
    const winner = (m.team1?.score||0) > (m.team2?.score||0) ? m.team1?.name : m.team2?.name;
    [m.team1, m.team2].forEach(team => {
      if(!team) return;
      teamGames[team.name] = (teamGames[team.name]||0) + 1;
      if(team.name === winner) teamWins[team.name] = (teamWins[team.name]||0) + 1;
      (team.players||[]).forEach((p, idx) => {
        const POSITIONS = ['PG','SG','SF','PF','C'];
        const pos = p.pos || POSITIONS[idx] || 'PG';
        const key = p.name + '|' + team.name;
        if(!playerMap[key]) playerMap[key] = {name:p.name,team:team.name,pos,posCounts:{},gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gradeSum:0};
        const s = playerMap[key];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.tpm+=p.tpm||0; s.tpa+=p.tpa||0;
        s.ftm+=p.ftm||0; s.fta+=p.fta||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
      if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      });
    });
  });

  let players = Object.values(playerMap).map(p => ({
    ...p,
    fgpct: p.fga>0 ? p.fgm/p.fga : 0,
    tppct: p.tpa>0 ? p.tpm/p.tpa : 0,
    ftpct: p.fta>0 ? p.ftm/p.fta : 0,
    avggrade: p.gp>0 ? p.gradeSum/p.gp : 0,
    cs: calcCompositeScore(p),
    per: calcPER(p),
  }));

  // Sort
  const strCols = ['name','team','pos'];
  players.sort((a,b) => {
    let va = strCols.includes(sortCol) ? (a[sortCol]||'').toLowerCase() : (['fgpct','tppct','ftpct','gp','avggrade','cs','per'].includes(sortCol) ? a[sortCol] : a[sortCol]/Math.max(a.gp,1));
    let vb = strCols.includes(sortCol) ? (b[sortCol]||'').toLowerCase() : (['fgpct','tppct','ftpct','gp','avggrade','cs','per'].includes(sortCol) ? b[sortCol] : b[sortCol]/Math.max(b.gp,1));
    if(va < vb) return -1 * sortDir;
    if(va > vb) return 1 * sortDir;
    return 0;
  });

  // Standings
  const teamStandings = Object.keys(teamGames).map(name => ({
    name, w: teamWins[name]||0, l: teamGames[name]-(teamWins[name]||0), gp: teamGames[name]
  })).sort((a,b) => b.w-a.w || a.l-b.l);

  const standingsHtml = teamStandings.length > 1 ? `
    <div style="margin-bottom:1.5rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;letter-spacing:1px;margin-bottom:.5rem">🏆 TABELA</div>
      <table style="width:100%;border-collapse:collapse;font-size:.85rem">
        <thead><tr style="background:var(--surface2)">
          <th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px">#</th>
          <th style="text-align:left;padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px">DRUŻYNA</th>
          <th style="padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px;text-align:center">M</th>
          <th style="padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px;text-align:center">W</th>
          <th style="padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px;text-align:center">L</th>
          <th style="padding:.5rem .75rem;color:var(--muted);font-size:.75rem;letter-spacing:1px;text-align:center">W%</th>
        </tr></thead>
        <tbody>${teamStandings.map((t,i) => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:.5rem .75rem;font-weight:700;color:${i===0?'var(--accent)':i===1?'#ccc':i===2?'#cd7f32':'var(--muted)'}">${i+1}</td>
            <td style="padding:.5rem .75rem;font-weight:600">${t.name}</td>
            <td style="padding:.5rem .75rem;text-align:center">${t.gp}</td>
            <td style="padding:.5rem .75rem;text-align:center;color:var(--win);font-weight:700">${t.w}</td>
            <td style="padding:.5rem .75rem;text-align:center;color:var(--loss)">${t.l}</td>
            <td style="padding:.5rem .75rem;text-align:center;color:var(--muted)">${t.gp>0?Math.round(t.w/t.gp*100):0}%</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  // Sort header helper
  const evId = ev.id;
  const th = (col, label, style='') => {
    const active = col === sortCol;
    const nextDir = active ? sortDir * -1 : -1;
    const icon = active ? (sortDir === -1 ? ' ▼' : ' ▲') : '';
    return `<th style="cursor:pointer;user-select:none;${active?'color:var(--accent);':style}" onclick="renderEventDetailTab('${evId}','stats','${col}',${nextDir})">${label}${icon}</th>`;
  };

  const rows = players.map(p => {
    const avg = v => p.gp>0 ? (v/p.gp).toFixed(1) : '0.0';
    const fgPct = p.fga>0 ? Math.round(p.fgm/p.fga*100) : 0;
    const tpPct = p.tpa>0 ? Math.round(p.tpm/p.tpa*100) : 0;
    const ftPct = p.fta>0 ? Math.round(p.ftm/p.fta*100) : 0;
    const avgGrade = numToGrade(p.avggrade);
    const hl = 'color:var(--accent);font-weight:700';
    return `<tr style="cursor:pointer;border-bottom:1px solid var(--border)" onclick="openEventPlayerModal('${evId}','${p.name}','${p.team}')">
      <td style="padding:.6rem .75rem;font-weight:600;${sortCol==='name'?hl:''}">${p.name}</td>
      <td style="padding:.6rem .5rem;color:var(--muted);font-size:.82rem;${sortCol==='team'?hl:''}">${p.team}</td>
      <td style="padding:.6rem .5rem;text-align:center;color:var(--accent);font-weight:700;font-size:.8rem">${p.pos||''}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='gp'?hl:''}">${p.gp}</td>
      <td style="padding:.6rem .5rem;text-align:center"><span class="grade grade-${avgGrade.replace('+','p').replace('-','m')}">${avgGrade}</span></td>
      <td style="padding:.6rem .5rem;text-align:center;color:var(--accent);font-weight:700;${sortCol==='cs'?hl:''}">${p.cs.toFixed(1)}</td>
      <td style="padding:.6rem .5rem;text-align:center;color:#3498db;font-weight:700;${sortCol==='per'?hl:''}">${p.per.toFixed(1)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='pts'?hl:''}">${avg(p.pts)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='reb'?hl:''}">${avg(p.reb)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='ast'?hl:''}">${avg(p.ast)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='stl'?hl:''}">${avg(p.stl)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='blk'?hl:''}">${avg(p.blk)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='to'?hl:''}">${avg(p.to)}</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='fgpct'?hl:''}">${fgPct}%</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='tppct'?hl:''}">${tpPct}%</td>
      <td style="padding:.6rem .5rem;text-align:center;${sortCol==='ftpct'?hl:''}">${ftPct}%</td>
    </tr>`;
  }).join('');

  return `
    ${standingsHtml}
    <div class="card" style="padding:0;margin-bottom:0">
      <div class="stats-table-wrap">
        <table>
          <thead><tr style="background:var(--surface2)">
            ${th('name','Zawodnik','text-align:left;padding-left:.75rem')}
            ${th('team','Drużyna','text-align:left')}
            <th style="color:var(--muted);font-size:.8rem;letter-spacing:1px">POZ</th>
            ${th('gp','GP')}
            ${th('avggrade','GRD')}
            ${th('cs','CS','color:var(--accent)')}
            ${th('per','PER','color:#3498db')}
            ${th('pts','PTS')}
            ${th('reb','REB')}
            ${th('ast','AST')}
            ${th('stl','STL')}
            ${th('blk','BLK')}
            ${th('to','TO')}
            ${th('fgpct','FG%')}
            ${th('tppct','3P%')}
            ${th('ftpct','FT%')}
          </tr></thead>
          <tbody>${rows || '<tr><td colspan="16" style="text-align:center;padding:2rem;color:var(--muted)">Brak danych</td></tr>'}</tbody>
        </table>
      </div>
    </div>`;
}
function openEventPlayerModal(eventId, playerName, teamName) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const evMatches = ev.matches || [];
  const games = [];
  evMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      if(team?.name !== teamName) return;
      const p = (team.players||[]).find(x => x.name === playerName);
      if(!p) return;
      const opp = team === m.team1 ? m.team2 : m.team1;
      games.push({ date: m.date, opp: opp?.name||'?',
        pts:p.pts||0, reb:p.reb||0, ast:p.ast||0, stl:p.stl||0, blk:p.blk||0,
        to:p.to||0, fgm:p.fgm||0, fga:p.fga||0, tpm:p.tpm||0, tpa:p.tpa||0,
        ftm:p.ftm||0, fta:p.fta||0, grade:p.grade||'B', pos:p.pos||'',
      });
    });
  });
  if(!games.length) { showToast('Brak danych gracza', 'info'); return; }
  const gp = games.length;
  const sum = k => games.reduce((s,g) => s+(g[k]||0), 0);
  const avg = k => (sum(k)/gp).toFixed(1);
  const fgPct = sum('fga')>0 ? Math.round(sum('fgm')/sum('fga')*100) : 0;
  const tpPct = sum('tpa')>0 ? Math.round(sum('tpm')/sum('tpa')*100) : 0;
  const ftPct = sum('fta')>0 ? Math.round(sum('ftm')/sum('fta')*100) : 0;
  const avgGradeNum = games.reduce((s,g)=>s+gradeToNum(g.grade||'B'),0)/gp;
  const avgGrade = numToGrade(avgGradeNum);

  const modal = document.getElementById('modal-content');
  modal.innerHTML = `
    <div style="margin-bottom:1.25rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px">${playerName}</div>
      <div style="color:var(--muted);font-size:.85rem">${teamName} · ${games[0]?.pos||''} · ${gp} meczów · <span class="grade grade-${avgGrade.replace('+','p').replace('-','m')}">${avgGrade}</span></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.5rem;margin-bottom:1.25rem">
      ${[['PTS',avg('pts')],['REB',avg('reb')],['AST',avg('ast')],['STL',avg('stl')],['BLK',avg('blk')],['TO',avg('to')],['FG%',fgPct+'%'],['3P%',tpPct+'%'],['FT%',ftPct+'%']].map(([l,v])=>`
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.6rem;text-align:center">
          <div style="font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">${l}</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent)">${v}</div>
        </div>`).join('')}
    </div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;margin-bottom:.5rem">📋 MECZE</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:.82rem;min-width:480px">
        <thead><tr style="background:var(--surface2)">
          <th style="text-align:left;padding:.4rem .6rem;color:var(--muted);font-size:.72rem">DATA</th>
          <th style="text-align:left;padding:.4rem .6rem;color:var(--muted);font-size:.72rem">VS</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">GRD</th>
          <th style="padding:.4rem .4rem;color:var(--accent);font-size:.72rem;font-weight:800">PTS</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">REB</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">AST</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">STL</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">BLK</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">TO</th>
          <th style="padding:.4rem .4rem;color:var(--muted);font-size:.72rem">FG</th>
        </tr></thead>
        <tbody>${games.map(g => {
          const gr = g.grade||'B';
          return `<tr style="border-bottom:1px solid var(--border)">
            <td style="padding:.4rem .6rem;color:var(--muted);font-size:.78rem">${g.date||'—'}</td>
            <td style="padding:.4rem .6rem;font-weight:600;font-size:.82rem">${g.opp}</td>
            <td style="padding:.4rem .4rem;text-align:center"><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></td>
            <td style="padding:.4rem .4rem;text-align:center;font-weight:700;color:var(--accent)">${g.pts}</td>
            <td style="padding:.4rem .4rem;text-align:center">${g.reb}</td>
            <td style="padding:.4rem .4rem;text-align:center">${g.ast}</td>
            <td style="padding:.4rem .4rem;text-align:center">${g.stl}</td>
            <td style="padding:.4rem .4rem;text-align:center">${g.blk}</td>
            <td style="padding:.4rem .4rem;text-align:center">${g.to}</td>
            <td style="padding:.4rem .4rem;text-align:center;font-size:.78rem">${g.fgm}/${g.fga}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
  document.getElementById('match-modal').classList.add('open');
}
function evFileSelected(e, eventId) {
  const files = Array.from(e.target.files);
  if(files.length) { _evParseQueue = files; _evParseQueueIdx = 0; evProcessNextInQueue(eventId); }
}
function evDropFile(e, eventId) {
  e.preventDefault();
  document.getElementById('ev-upload-zone').style.borderColor = 'var(--border)';
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if(files.length) { _evParseQueue = files; _evParseQueueIdx = 0; evProcessNextInQueue(eventId); }
}
function evProcessNextInQueue(eventId) {
  if(_evParseQueueIdx >= _evParseQueue.length) return;
  evLoadFile(_evParseQueue[_evParseQueueIdx], eventId);
}
function evLoadFile(file, eventId) {
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target.result;
    _evParseMime = file.type || 'image/png';
    _evParseBase64 = dataUrl.split(',')[1];
    _evParseDataUrl = dataUrl;
    const zone = document.getElementById('ev-upload-zone');
    if(zone) {
      zone.style.backgroundImage = `url(${dataUrl})`;
      zone.style.backgroundSize = 'contain';
      zone.style.backgroundRepeat = 'no-repeat';
      zone.style.backgroundPosition = 'center';
      zone.style.minHeight = '160px';
      const inner = zone.querySelector('div');
      if(inner) inner.style.opacity = '0';
    }
    evParseScreenshot(eventId);
  };
  reader.readAsDataURL(file);
}
async function evParseScreenshot(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !_evParseBase64) return;
  const statusEl = document.getElementById('ev-parse-status-' + eventId);
  const previewEl = document.getElementById('ev-parse-preview-' + eventId);
  if(!statusEl) return;

  statusEl.style.display = 'block';
  statusEl.style.background = 'rgba(79,195,247,.1)';
  statusEl.style.border = '1px solid rgba(79,195,247,.3)';
  statusEl.style.color = '#4fc3f7';
  statusEl.textContent = '🤖 Analizuję screenshot...';
  if(previewEl) previewEl.style.display = 'none';

  // Build known players hint from event players
  const knownPlayers = (ev.players||[]).map(p => p.name).filter(Boolean);
  const knownHint = knownPlayers.length ? `\n\nGRACZE W TYM EVENCIE (użyj tych nazw):\n${knownPlayers.join(', ')}` : '';

  const knownTeams = Object.keys(teams||{}).length ? Object.keys(teams).join(', ') : 'Aliens Katowice, Katowice PL, Big Brain Basketball, Illegal Esports V2, Polish Boars, Polish Snickers, White Market, Sternritters, The Outlawz';
  const prompt = `Analizuj screenshot z gry NBA 2K — ekran Game Stats.
NAZWY DRUŻYN: Dopasuj logotyp do poniższej listy (użyj DOKŁADNIE tej nazwy):
${knownTeams}
UWAGA na podobne logotypy: "Aliens Katowice" ma ZIELONY kolor i zielonego aliena. "Katowice PL" ma CZERWONY kolor i czerwonego/białego aliena. To dwie RÓŻNE drużyny — rozróżniaj po kolorze!
Jeśli w nagłówku tabeli widzisz nick gracza zamiast nazwy — ZIGNORUJ, użyj nazwy z logotypu.${knownHint ? '\n\nGRACZE W TYM EVENCIE (użyj tych nazw):\n' + knownPlayers.join(', ') : ''}

Wyodrębnij WSZYSTKIE dane i zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy):
{
  "team1": {"name":"PEŁNA NAZWA DRUŻYNY","score":67,"quarters":[18,17,16,16],"players":[{"name":"Nick","pos":"PG","grade":"B+","pts":24,"reb":0,"ast":9,"stl":0,"blk":0,"fouls":0,"to":3,"fgm":7,"fga":20,"tpm":2,"tpa":6,"ftm":4,"fta":4}]},
  "team2": {"name":"PEŁNA NAZWA DRUŻYNY","score":87,"quarters":[27,16,20,24],"players":[...]}
}
KRYTYCZNE — JAK LICZYĆ GRACZY W KAŻDEJ DRUŻYNIE:
Każda sekcja drużyny wygląda tak na ekranie:
  [WIERSZ NAGŁÓWKA: nick_kapitana | GRD | PTS | REB | AST | ...]  ← IGNORUJ — to nie jest gracz!
  [gracz 1 → PG]
  [gracz 2 → SG]
  [gracz 3 → SF]
  [gracz 4 → PF]
  [gracz 5 → C]
  [WIERSZ TOTAL]  ← IGNORUJ
Każda drużyna ma DOKŁADNIE 5 graczy.
POZYCJE: 1=PG, 2=SG, 3=SF, 4=PF, 5=C (licząc od góry, pomijając wiersz nagłówka z kapitanem).
KOLEJNOŚĆ KOLUMN na ekranie Game Stats (od lewej do prawej):
GRADE | PTS | REB | AST | STL | BLK | FOULS | TO | FGM/FGA | 3PM/3PA | FTM/FTA
WAŻNE — rozróżnienie BLK / FOULS / TO:
- BLK (bloki) = 6. kolumna. Zazwyczaj 0-2.
- FOULS (faule) = 7. kolumna, nagłówek na ekranie brzmi "FOULS". → zapisz jako "fouls". Zazwyczaj 0-5.
- TO (straty) = 8. kolumna. → zapisz jako "to". Zazwyczaj 0-4.
- NIE zamieniaj kolejności — FOULS jest PRZED TO na ekranie.
Użyj dokładnych liczb z ekranu. Jeśli coś nieczytelne, wstaw 0.`;

  try {
    const data = await callAI(MODEL_SCREENSHOT(), 8192, [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: _evParseMime, data: _evParseBase64 } },
        { type: 'text', text: prompt }
      ]
    }]);
    if(data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const text = data.content.map(c => c.text||'').join('');
    console.log('[evParse] raw AI response:', text.slice(0,500));
    const firstBrace = text.indexOf('{');
    const lastBrace  = text.lastIndexOf('}');
    if(firstBrace === -1 || lastBrace <= firstBrace)
      throw new Error('AI nie zwróciło JSON. Odpowiedź: ' + text.slice(0,300));
    let jsonStr = text.slice(firstBrace, lastBrace + 1);

    const tryParse = s => { try { return JSON.parse(s); } catch(e) { return null; } };

    // ── Robust JSON cleanup (shared logic with parseScreenshot) ──────────────
    const robustClean = s => s
      .replace(/\ufeff/g, '')
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Fix numbers with comma as thousands separator: 1,234 → 1234 (only when between digits)
      .replace(/(\d),(?=\d{3}(?:[^\d]|$))/g, '$1')
      // Trailing commas before ] or }
      .replace(/,\s*([\]}])/g, '$1')
      // Missing comma between objects/arrays: } { → }, {
      .replace(/}\s*\{/g, '},{')
      .replace(/]\s*\[/g, '],[')
      // Python/JS literals
      .replace(/\bNone\b/g, 'null')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      // Ellipsis placeholders inside arrays
      .replace(/\.\.\.\s*(?=[,\]])/g, '');

    // Escape literal newlines/tabs inside JSON string values
    const escapeInsideStrings = s => {
      let out = '', inStr = false, esc = false;
      for(const ch of s) {
        if(esc)       { out += ch; esc = false; continue; }
        if(ch==='\\') { out += ch; esc = true;  continue; }
        if(ch==='"')  { inStr = !inStr; out += ch; continue; }
        if(inStr && (ch==='\n'||ch==='\r'||ch==='\t')) { out += ' '; continue; }
        out += ch;
      }
      return out;
    };

    // Attempt to auto-close a truncated JSON (e.g. cut off mid-array by token limit)
    const autoClose = s => {
      let depth = 0, inStr = false, esc = false;
      for(const ch of s) {
        if(esc)       { esc = false; continue; }
        if(ch==='\\') { esc = true; continue; }
        if(ch==='"')  { inStr = !inStr; continue; }
        if(!inStr) { if(ch==='{') depth++; else if(ch==='}') depth--; }
      }
      // Remove any trailing incomplete property (e.g. "key": <nothing>)
      let fixed = s.replace(/,?\s*"[^"]*"\s*:\s*$/, '');
      // Remove trailing comma before we close
      fixed = fixed.replace(/,\s*$/, '');
      // Close open braces/brackets
      let open = 0, opStr = false, opEsc = false;
      const stack = [];
      for(const ch of fixed) {
        if(opEsc)      { opEsc = false; continue; }
        if(ch==='\\')  { opEsc = true; continue; }
        if(ch==='"')   { opStr = !opStr; continue; }
        if(!opStr) {
          if(ch==='{') stack.push('}');
          else if(ch==='[') stack.push(']');
          else if(ch==='}' || ch===']') stack.pop();
        }
      }
      return fixed + stack.reverse().join('');
    };

    const cleaned = robustClean(jsonStr);
    const cleanedEsc = escapeInsideStrings(cleaned);

    // 6 attempts: increasingly aggressive
    let parsed = tryParse(cleaned)
      ?? tryParse(cleanedEsc)
      ?? tryParse(cleanedEsc.replace(/[\r\n\t]+/g, ' '))
      ?? tryParse(robustClean(autoClose(jsonStr)))
      ?? tryParse(escapeInsideStrings(robustClean(autoClose(jsonStr))))
      ?? tryParse(escapeInsideStrings(robustClean(autoClose(jsonStr))).replace(/[\r\n\t]+/g, ' '));

    if(!parsed) {
      let parseErr = '';
      try { JSON.parse(cleanedEsc); } catch(e) { parseErr = e.message; }
      console.error('[evParse] all attempts failed. Error:', parseErr, '\nJSON:', jsonStr.slice(0, 800));
      throw new Error('Błąd parsowania JSON: ' + parseErr + '\n\nFragment JSON:\n' + jsonStr.slice(0, 300));
    }

    // Normalize field names (fouls → fol, etc.)
    const normalizePlayers = players => (players||[]).map(p => {
      if(p.fouls !== undefined && p.fol === undefined) { p.fol = p.fouls; delete p.fouls; }
      ['pts','reb','ast','stl','blk','to','fol','fgm','fga','tpm','tpa','ftm','fta'].forEach(k => {
        if(p[k] === undefined) p[k] = 0;
      });
      return p;
    });
    if(parsed.team1?.players) parsed.team1.players = normalizePlayers(parsed.team1.players);
    if(parsed.team2?.players) parsed.team2.players = normalizePlayers(parsed.team2.players);

    _evParsePending = { ...parsed, date: new Date().toISOString().slice(0,10) };

    statusEl.style.background = 'rgba(46,204,113,.1)';
    statusEl.style.border = '1px solid rgba(46,204,113,.3)';
    statusEl.style.color = 'var(--win)';
    statusEl.textContent = `✅ ${parsed.team1.name} ${parsed.team1.score} — ${parsed.team2.score} ${parsed.team2.name}`;

    if(previewEl) {
      previewEl.style.display = 'block';
      const queueTotal = _evParseQueue.length;
      const queueCurrent = _evParseQueueIdx + 1;
      const progressHtml = queueTotal > 1
        ? `<div style="font-size:.75rem;color:var(--muted);margin-bottom:.5rem">📋 Screen ${queueCurrent} z ${queueTotal}</div>`
        : '';
      const inpStyle = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-family:inherit;font-size:.9rem;font-weight:700;min-width:0';
      const scoreStyle = inpStyle + ';width:56px;text-align:center;color:var(--accent)';
      previewEl.innerHTML = `
        <div style="background:var(--surface2);border-radius:8px;padding:.75rem 1rem">
          ${progressHtml}
          ${_evParseDataUrl ? `<img src="${_evParseDataUrl}" style="width:100%;max-height:140px;object-fit:contain;border-radius:6px;margin-bottom:.6rem;display:block">` : ''}
          <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem">
            <input id="ev-t1name-${eventId}" value="${parsed.team1.name.replace(/"/g,'&quot;')}" style="${inpStyle};flex:1 1 120px">
            <input id="ev-t1score-${eventId}" type="number" value="${parsed.team1.score}" style="${scoreStyle}">
            <span style="color:var(--muted);font-weight:700">—</span>
            <input id="ev-t2score-${eventId}" type="number" value="${parsed.team2.score}" style="${scoreStyle}">
            <input id="ev-t2name-${eventId}" value="${parsed.team2.name.replace(/"/g,'&quot;')}" style="${inpStyle};flex:1 1 120px">
          </div>
          <div style="display:flex;gap:.5rem">
            <button onclick="evSaveMatch('${eventId}')" class="btn btn-primary" style="font-size:.85rem;padding:.5rem 1rem">💾 Zapisz${queueTotal > 1 ? ' i następny' : ''}</button>
            ${queueTotal > 1 ? `<button onclick="evSkipMatch('${eventId}')" class="btn btn-ghost" style="font-size:.85rem;padding:.5rem 1rem">⏭ Pomiń</button>` : ''}
            <button onclick="_evParseQueue=[];_evParsePending=null;document.getElementById('ev-parse-preview-${eventId}').style.display='none'" class="btn btn-ghost" style="font-size:.85rem;padding:.5rem 1rem">Anuluj</button>
          </div>
        </div>`;
    }
  } catch(err) {
    statusEl.style.background = 'rgba(232,69,60,.1)';
    statusEl.style.border = '1px solid rgba(232,69,60,.3)';
    statusEl.style.color = 'var(--loss)';
    const msgParts = err.message.split('\n\nFragment JSON:\n');
    if(msgParts.length > 1) {
      statusEl.innerHTML = '<span>\u274c ' + msgParts[0].replace(/</g,'&lt;') + '</span>'
        + '<pre style="margin:.5rem 0 0;font-size:.7rem;white-space:pre-wrap;word-break:break-all;background:rgba(0,0,0,.3);padding:.4rem;border-radius:4px;color:#ccc;max-height:120px;overflow:auto">' + msgParts[1].replace(/</g,'&lt;') + '</pre>';
    } else {
      statusEl.textContent = '\u274c ' + err.message;
    }
  }
}
async function evSaveMatch(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !_evParsePending) return;
  // Apply editable field values
  const t1name  = document.getElementById('ev-t1name-' + eventId);
  const t1score = document.getElementById('ev-t1score-' + eventId);
  const t2name  = document.getElementById('ev-t2name-' + eventId);
  const t2score = document.getElementById('ev-t2score-' + eventId);
  if(t1name)  _evParsePending.team1.name  = t1name.value.trim() || _evParsePending.team1.name;
  if(t1score) _evParsePending.team1.score = parseInt(t1score.value) || _evParsePending.team1.score;
  if(t2name)  _evParsePending.team2.name  = t2name.value.trim() || _evParsePending.team2.name;
  if(t2score) _evParsePending.team2.score = parseInt(t2score.value) || _evParsePending.team2.score;
  if(!ev.matches) ev.matches = [];
  if(ev.phases && ev.phases.length && ev.currentPhase !== undefined) {
    _evParsePending.phase = ev.currentPhase;
  }
  ev.matches.push(_evParsePending);
  _evParsePending = null;
  _evParseBase64 = null;
  _evParseDataUrl = null;
  await saveData();
  showToast('✅ Mecz zapisany!', 'success');
  _evParseQueueIdx++;
  if(_evParseQueueIdx < _evParseQueue.length) {
    renderEventDetailTab(eventId, 'matches');
    // małe opóźnienie żeby tab się przerenderował zanim zaczniemy kolejny
    setTimeout(() => evProcessNextInQueue(eventId), 200);
  } else {
    _evParseQueue = [];
    renderEventDetailTab(eventId, 'matches');
  }
}
function evSkipMatch(eventId) {
  _evParsePending = null;
  _evParseBase64 = null;
  _evParseDataUrl = null;
  _evParseQueueIdx++;
  if(_evParseQueueIdx < _evParseQueue.length) {
    renderEventDetailTab(eventId, 'matches');
    setTimeout(() => evProcessNextInQueue(eventId), 200);
  } else {
    _evParseQueue = [];
    renderEventDetailTab(eventId, 'matches');
  }
}
// { eventId: Set of matchIdx }

function evMergeToggle(eventId, matchIdx, checked) {
  if(!_evMergeSelected[eventId]) _evMergeSelected[eventId] = new Set();
  const sel = _evMergeSelected[eventId];
  if(checked) sel.add(matchIdx); else sel.delete(matchIdx);

  const bar = document.getElementById('ev-merge-bar-' + eventId);
  const info = document.getElementById('ev-merge-info-' + eventId);
  const btn  = document.getElementById('ev-merge-btn-' + eventId);
  if(!bar) return;

  if(sel.size === 0) {
    bar.style.display = 'none';
  } else {
    bar.style.display = 'flex';
    if(sel.size === 1) {
      if(info) info.textContent = 'Zaznacz jeszcze 1 mecz do połączenia';
      if(btn)  btn.disabled = true;
    } else if(sel.size === 2) {
      if(info) info.textContent = '2 mecze zaznaczone — gotowe do połączenia';
      if(btn)  btn.disabled = false;
    } else {
      if(info) info.textContent = `Zaznaczono ${sel.size} meczów — maksimum 2`;
      if(btn)  btn.disabled = true;
    }
  }
}
async function mergeEventMatches(eventId) {
  const sel = _evMergeSelected[eventId];
  if(!sel || sel.size !== 2) { showToast('❌ Zaznacz dokładnie 2 mecze', 'error'); return; }
  const ev = events.find(e => e.id === eventId);
  if(!ev || !ev.matches) return;

  const [idxA, idxB] = [...sel].sort((a,b)=>a-b);
  const mA = ev.matches[idxA];
  const mB = ev.matches[idxB];
  if(!mA || !mB) return;

  // Validate same teams (case-insensitive)
  const norm = s => (s||'').trim().toLowerCase();
  const sameTeams =
    (norm(mA.team1?.name) === norm(mB.team1?.name) && norm(mA.team2?.name) === norm(mB.team2?.name)) ||
    (norm(mA.team1?.name) === norm(mB.team2?.name) && norm(mA.team2?.name) === norm(mB.team1?.name));

  if(!sameTeams) {
    showToast('❌ Mecze mają różne drużyny — nie można połączyć', 'error');
    return;
  }

  // Determine if mB teams are swapped relative to mA
  const swapped = norm(mA.team1?.name) === norm(mB.team2?.name);
  const bT1 = swapped ? mB.team2 : mB.team1;
  const bT2 = swapped ? mB.team1 : mB.team2;

  // Merge scores
  const merged = JSON.parse(JSON.stringify(mA));
  merged.team1.score = (mA.team1?.score||0) + (bT1?.score||0);
  merged.team2.score = (mA.team2?.score||0) + (bT2?.score||0);

  // Merge quarters
  const mergeQuarters = (qA, qB) => {
    const len = Math.max((qA||[]).length, (qB||[]).length);
    return Array.from({length: len}, (_,i) => (qA?.[i]||0) + (qB?.[i]||0));
  };
  merged.team1.quarters = mergeQuarters(mA.team1?.quarters, bT1?.quarters);
  merged.team2.quarters = mergeQuarters(mA.team2?.quarters, bT2?.quarters);

  // Merge player stats
  const MERGE_STATS = ['pts','reb','ast','stl','blk','to','fol','fgm','fga','tpm','tpa','ftm','fta'];
  const mergePlayers = (playersA, playersB) => {
    const result = JSON.parse(JSON.stringify(playersA||[]));
    (playersB||[]).forEach(pb => {
      const existing = result.find(pa => norm(pa.name) === norm(pb.name));
      if(existing) {
        MERGE_STATS.forEach(s => { existing[s] = (existing[s]||0) + (pb[s]||0); });
        // Keep better grade (use the one from mA, unless mB has one and mA doesn't)
        if(!existing.grade && pb.grade) existing.grade = pb.grade;
      } else {
        // Player only in B — add them
        result.push(JSON.parse(JSON.stringify(pb)));
      }
    });
    return result;
  };

  merged.team1.players = mergePlayers(mA.team1?.players, bT1?.players);
  merged.team2.players = mergePlayers(mA.team2?.players, bT2?.players);
  merged._mergedFrom = [idxA, idxB];

  // Replace first match with merged, remove second
  ev.matches[idxA] = merged;
  ev.matches.splice(idxB, 1);

  // Reset selection
  _evMergeSelected[eventId] = new Set();

  await saveData();
  renderEventDetailTab(eventId, 'matches');
  showToast('✅ Mecze połączone! Statystyki zsumowane.', 'success');
}
async function deleteEventMatch(eventId, matchIdx) {
  if(!confirm('Usunąć ten mecz?')) return;
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  ev.matches.splice(matchIdx, 1);
  await saveData();
  renderEventDetailTab(eventId, 'matches');
  showToast('🗑 Mecz usunięty', 'info');
}
function openEditEventMatch(eventId, matchIdx) {
  const el = document.getElementById(`ev-match-edit-${eventId}-${matchIdx}`);
  if(!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
async function saveEditEventMatch(eventId, matchIdx) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const m = (ev.matches||[])[matchIdx];
  if(!m) return;
  const t1n = document.getElementById(`em-t1n-${eventId}-${matchIdx}`);
  const t1s = document.getElementById(`em-t1s-${eventId}-${matchIdx}`);
  const t2n = document.getElementById(`em-t2n-${eventId}-${matchIdx}`);
  const t2s = document.getElementById(`em-t2s-${eventId}-${matchIdx}`);
  if(t1n) m.team1.name  = t1n.value.trim() || m.team1.name;
  if(t1s) m.team1.score = parseInt(t1s.value) || m.team1.score;
  if(t2n) m.team2.name  = t2n.value.trim() || m.team2.name;
  if(t2s) m.team2.score = parseInt(t2s.value) || m.team2.score;

  // Save player stats
  const EV_STATS = ['pts','reb','ast','stl','blk','to','fol','fgm','fga','tpm','tpa','ftm','fta'];
  const saveTeamPlayers = (team, tid) => {
    (team?.players||[]).forEach((p, pi) => {
      const nameEl = document.getElementById(`em-${eventId}-${matchIdx}-${tid}-${pi}-name`);
      const posEl  = document.getElementById(`em-${eventId}-${matchIdx}-${tid}-${pi}-pos`);
      const grdEl  = document.getElementById(`em-${eventId}-${matchIdx}-${tid}-${pi}-grade`);
      if(nameEl) p.name  = nameEl.value.trim() || p.name;
      if(posEl)  p.pos   = posEl.value;
      if(grdEl)  p.grade = grdEl.value;
      EV_STATS.forEach(s => {
        const el = document.getElementById(`em-${eventId}-${matchIdx}-${tid}-${pi}-${s}`);
        if(el) p[s] = parseInt(el.value) || 0;
      });
    });
  };
  saveTeamPlayers(m.team1, 't1');
  saveTeamPlayers(m.team2, 't2');

  await saveData();
  renderEventDetailTab(eventId, 'matches');
  showToast('✅ Mecz zaktualizowany!', 'success');
}
// [{evName, idx}] — używane przez applyEvNameFix

function openEvNameFix(eventId) {
  const el = document.getElementById('ev-name-fix-' + eventId);
  if(!el) return;
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;

  const leagueNames = [...new Set(matches.flatMap(m =>
    [...(m.team1?.players||[]),...(m.team2?.players||[])].map(p=>p.name)
  ).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const leagueSet = new Set(leagueNames);
  const leagueLower = new Map();
  leagueNames.forEach(n => leagueLower.set(n.toLowerCase(), n));

  const evNames = [...new Set((ev.matches||[]).flatMap(m =>
    [...(m.team1?.players||[]),...(m.team2?.players||[])].map(p=>p.name)
  ).filter(Boolean))];

  // Group ev names by lowercase to detect case-variant duplicates within event
  const evLowerGroups = new Map();
  evNames.forEach(n => {
    const lower = n.toLowerCase();
    if(!evLowerGroups.has(lower)) evLowerGroups.set(lower, []);
    evLowerGroups.get(lower).push(n);
  });

  const fixSet = new Set();
  _evNameFixList = [];

  evNames.forEach(evName => {
    if(fixSet.has(evName)) return;
    const lower = evName.toLowerCase();
    const group = evLowerGroups.get(lower);
    const leagueCanonical = leagueLower.get(lower);

    // Exact match in league and no case-dup in event -> OK
    if(leagueSet.has(evName) && group.length === 1) return;

    // Case-duplicate within event (same player, two capitalizations)
    if(group.length > 1) {
      const bestForm = group.find(v => v !== v.toUpperCase()) || leagueCanonical || group[0];
      group.forEach(v => {
        if(!fixSet.has(v)) {
          fixSet.add(v);
          _evNameFixList.push({ evName: v, suggestion: bestForm, score: 1.0, isCaseDup: true });
        }
      });
      return;
    }

    // Not in league exactly
    if(!leagueSet.has(evName)) {
      fixSet.add(evName);
      if(leagueCanonical) {
        _evNameFixList.push({ evName, suggestion: leagueCanonical, score: 0.99 });
      } else {
        // Try fuzzy match vs league names
        let best = null, bestScore = 0;
        for(const ln of leagueNames) {
          const s = _dsFuzzyScore(evName, ln);
          if(s > bestScore) { bestScore = s; best = ln; }
        }
        // Also try fuzzy match vs OTHER ev names (catches OCR variants of same non-league player)
        let bestEv = null, bestEvScore = 0;
        for(const other of evNames) {
          if(other === evName) continue;
          const s = _dsFuzzyScore(evName, other);
          if(s > bestEvScore) { bestEvScore = s; bestEv = other; }
        }
        // Pick whichever match is better; use lower threshold (0.3) for same-event names
        const suggestion = (bestScore >= 0.4 && bestScore >= bestEvScore) ? best
          : (bestEvScore >= 0.3) ? bestEv
          : (bestScore >= 0.4) ? best : null;
        const score = suggestion === bestEv ? bestEvScore : bestScore;
        _evNameFixList.push({ evName, suggestion, score, isEvMatch: suggestion === bestEv });
      }
    }
  });

  if(!_evNameFixList.length) {
    el.innerHTML = '<div style="color:var(--win);font-size:.85rem;padding:.4rem .75rem;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.2);border-radius:6px">✅ Wszystkie nazwy graczy są zgodne z rankingiem</div>';
    return;
  }

  // ev names that are NOT mismatches (for "other ev names" optgroup in selects)
  const cleanEvNames = evNames.filter(n => !_evNameFixList.find(f => f.evName === n));

  el.innerHTML = `
    <div style="background:rgba(245,197,24,.05);border:1px solid rgba(245,197,24,.25);border-radius:8px;padding:.75rem 1rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.9rem;letter-spacing:.5px;margin-bottom:.3rem">
        🔗 DOPASUJ NAZWY GRACZY — ${_evNameFixList.length} niezgodności
      </div>
      <div style="font-size:.75rem;color:var(--muted);margin-bottom:.75rem">
        Nazwy z screenów po lewej → wybierz prawidłową nazwę z listy po prawej.<br>
        Gracze spoza ligi: wybierz inną nazwę z eventu lub „pominą" żeby zachować jak jest.
      </div>
      ${_evNameFixList.map((s,i) => {
        const hint = s.isCaseDup
          ? ' <span style="font-size:.7rem;color:var(--accent)">⚠️ dup.pisowni</span>'
          : s.isEvMatch
            ? ' <span style="font-size:.7rem;color:var(--muted)">nie w lidze</span>'
            : ' <span style="font-size:.7rem;color:var(--muted)">nie w lidze</span>';
        const evOptsHtml = (cleanEvNames.length + _evNameFixList.filter((_,j)=>j!==i).length)
          ? `<optgroup label="— z eventu —">${
              [..._evNameFixList.filter((_,j)=>j!==i).map(f=>f.evName), ...cleanEvNames]
                .map(n => `<option value="${n.replace(/"/g,'&quot;')}" ${n===s.suggestion?'selected':''}>${n}</option>`).join('')
            }</optgroup>` : '';
        return `
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;flex-wrap:wrap">
          <span style="font-size:.85rem;font-weight:700;color:var(--loss);min-width:120px">${s.evName}${hint}</span>
          <span style="color:var(--muted);font-size:.8rem">→</span>
          <select id="evfix-${eventId}-${i}" style="flex:1;min-width:140px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.25rem .4rem;font-size:.82rem">
            <option value="">— pominą —</option>
            <optgroup label="— z ligi —">${leagueNames.map(ln => `<option value="${ln.replace(/"/g,'&quot;')}" ${ln===s.suggestion?'selected':''}>${ln}${ln===s.suggestion&&s.score<1?' (podobne: '+Math.round(s.score*100)+'%)':''}</option>`).join('')}</optgroup>
            ${evOptsHtml}
          </select>
          <button onclick="applySingleEvFix('${eventId}',${i})" class="btn btn-primary" style="font-size:.78rem;padding:.25rem .6rem">✓</button>
        </div>`;
      }).join('')}
      <button onclick="applyAllEvFixes('${eventId}')" class="btn btn-primary" style="font-size:.82rem;margin-top:.5rem;padding:.35rem .9rem">✅ Zastosuj wszystkie zaznaczone</button>
    </div>`;
}
async function applySingleEvFix(eventId, idx) {
  const sel = document.getElementById(`evfix-${eventId}-${idx}`);
  const newName = sel?.value;
  const oldName = _evNameFixList[idx]?.evName;
  if(!newName || !oldName) return;
  await _applyEvPlayerRename(eventId, oldName, newName);
}
async function applyAllEvFixes(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  let count = 0;
  for(let i = 0; i < _evNameFixList.length; i++) {
    const sel = document.getElementById(`evfix-${eventId}-${i}`);
    const newName = sel?.value;
    const oldName = _evNameFixList[i]?.evName;
    if(!newName || !oldName || newName === oldName) continue;
    (ev.matches||[]).forEach(m => {
      [m.team1, m.team2].forEach(team => {
        (team?.players||[]).forEach(p => { if(p.name === oldName) { p.name = newName; count++; } });
      });
    });
  }
  if(count) {
    await saveData();
    renderEventDetailTab(eventId, 'matches');
    showToast(`✅ Zmieniono ${count} nazw graczy`, 'success');
  }
}
async function _applyEvPlayerRename(eventId, oldName, newName) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !oldName || !newName || oldName === newName) return;
  let count = 0;
  (ev.matches||[]).forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team?.players||[]).forEach(p => { if(p.name === oldName) { p.name = newName; count++; } });
    });
  });
  if(count) {
    await saveData();
    renderEventDetailTab(eventId, 'matches');
    showToast(`✅ "${oldName}" → "${newName}" (${count}×)`, 'success');
  }
}
function openEventMatchDetail(eventId, matchIdx) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const m = (ev.matches||[])[matchIdx];
  if(!m) return;
  const w1 = m.team1?.score > m.team2?.score;
  const modal = document.getElementById('modal-content');
  modal.innerHTML = `
    <div class="modal-score-row">
      <div>
        <div class="modal-team">${m.team1?.name||'—'}</div>
        <div class="modal-score-big" style="${!w1?'color:var(--text)':''}">${m.team1?.score??'—'}</div>
        <div class="quarters">${(m.team1?.quarters||[]).map((s,i)=>'<div class="q-box">Q'+(i+1)+': '+s+'</div>').join('')}</div>
      </div>
      <div style="text-align:center">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:.85rem;letter-spacing:2px;color:var(--muted)">FINAL</div>
        <div style="font-size:1.5rem;margin:.5rem 0">🏀</div>
        <div style="font-size:.8rem;color:var(--muted)">${m.date||''}</div>
      </div>
      <div style="text-align:right">
        <div class="modal-team">${m.team2?.name||'—'}</div>
        <div class="modal-score-big" style="${w1?'color:var(--text)':''}">${m.team2?.score??'—'}</div>
        <div class="quarters" style="justify-content:flex-end">${(m.team2?.quarters||[]).map((s,i)=>'<div class="q-box">Q'+(i+1)+': '+s+'</div>').join('')}</div>
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab(this,'ev-tab-t1')">${m.team1?.name||'Team 1'}</button>
      <button class="tab-btn" onclick="switchTab(this,'ev-tab-t2')">${m.team2?.name||'Team 2'}</button>
    </div>
    <div id="ev-tab-t1" class="tab-content active">${buildPlayerTable(m.team1?.players||[], m.team1?.name||'')}</div>
    <div id="ev-tab-t2" class="tab-content">${buildPlayerTable(m.team2?.players||[], m.team2?.name||'')}</div>`;
  document.getElementById('match-modal').classList.add('open');
}
// data i godzina eventu po angielsku (godzina z pola „time” albo z daty)
function _notifyDateStr(ev) {
  if(!ev?.date) return '—'; const d = new Date(String(ev.date).slice(0, 10) + 'T12:00:00'), t = ev.time || (/T(\d{2}:\d{2})/.exec(String(ev.date)) || [])[1] || '';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (t ? ', ' + t + ' (CET)' : '');
}
// domyślna wiadomość DM o evencie — po angielsku (serwer jest wspólny dla lig PL i EU)
function _notifyDefaultMsg(ev) {
  const dateStr = _notifyDateStr(ev);
  return `🏀 **${ev.title}**\n\n📅 Date: **${dateStr}**\n${ev.description ? '📝 ' + ev.description + '\n' : ''}\nSign-ups are open — join us!\n🔗 ${location.origin}/#event/${ev.id}`;
}
function openNotifyModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  document.getElementById('notify-event-id').value = eventId;
  document.getElementById('notify-custom-msg').value = '';
  updateNotifyPreview();
  document.getElementById('notify-draft-modal').classList.add('open');
}
function updateNotifyPreview() {
  const eventId = document.getElementById('notify-event-id').value;
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const custom = document.getElementById('notify-custom-msg').value.trim();
  const defaultMsg = _notifyDefaultMsg(ev);
  document.getElementById('notify-preview').textContent = custom || defaultMsg;
}
async function sendDraftNotification() {
  const eventId = document.getElementById('notify-event-id').value;
  const ev = events.find(e => e.id === eventId);
  if(!ev || !workerUrl) return;
  const custom = document.getElementById('notify-custom-msg').value.trim();
  const defaultMsg = _notifyDefaultMsg(ev), dateStr = _notifyDateStr(ev);
  const message = custom || defaultMsg;

  document.getElementById('notify-draft-modal').classList.remove('open');
  showToast('⏳ Wysyłanie powiadomień...', 'info');

  try {
    const res = await fetch(workerUrl.replace(/\/+$/, '') + '/notify-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': _adminToken() },
      body: JSON.stringify({ eventId, title: ev.title, date: dateStr, message })
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.error || res.status);
    showToast(`✅ Powiadomienia wysłane (${data.sent ?? '?'} DM)`, 'success');
  } catch(e) {
    showToast('❌ Błąd wysyłania: ' + e.message, 'error');
  }
}
async function addPlayerManually(eventId) {
  const nameEl = document.getElementById('manual-player-name');
  const name = nameEl?.value?.trim();
  if(!name) { showToast('❌ Wpisz nick gracza', 'error'); return; }
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  if(ev.maxPlayers && (ev.players||[]).length >= ev.maxPlayers) {
    showToast('❌ Osiągnięto limit graczy', 'error'); return;
  }
  if(!ev.players) ev.players = [];
  const positions = _manualPrimaryPos
    ? [_manualPrimaryPos, ..._manualSecondaryPos].filter((v,i,a)=>a.indexOf(v)===i)
    : [];
  // Unique ID with random suffix to avoid collisions on rapid adds
  ev.players.push({
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
    name,
    discordTag: '',
    avatar: '',
    positions,
    primaryPos: _manualPrimaryPos || '',
    speaksEnglish: _manualEnglish,
  });
  // Reset state and input BEFORE async save
  if(nameEl) nameEl.value = '';
  _manualPrimaryPos = null;
  _manualSecondaryPos = new Set();
  _manualEnglish = false;
  await saveData();
  renderEventsDashboard();
  renderEvents();
  openEventDetail(eventId);
  showToast('✅ Gracz dodany', 'success');
  setTimeout(() => { document.getElementById('manual-player-name')?.focus(); }, 80);
}
async function removePlayerFromEvent(eventId, playerId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  ev.players = (ev.players||[]).filter(p => p.id !== playerId);
  await saveData();
  renderEventsDashboard();
  renderEvents();
  openEventDetail(eventId);
  // Re-focus manual input if visible
  setTimeout(() => { document.getElementById('manual-player-name')?.focus(); }, 80);
}
async function backfillSignupOvr(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !(ev.players||[]).length) {
    showToast('Brak zapisanych graczy w tym evencie', 'info'); return;
  }

  // Compute OVR map as it was BEFORE this event
  const ovrBefore = _computeChainedOvrMap(eventId);

  // Fallback: full enriched ranking for players with no prior event history
  const enriched = _dsComputeOvr(_dsLeagueRanking());

  let updated = 0;
  const ingameNames = _dsIngameNames();

  ev.players = (ev.players || []).map(p => {
    if(p.signupOvr != null) return p; // already set — don't overwrite

    // Try to find player's ingame name via aliases
    const resolved = _dsFindIngameName(p, ingameNames, {});
    const ingame   = resolved?.name || p.name;

    // 1st choice: chained OVR before this event
    let ovr = ovrBefore[ingame];

    // 2nd choice: current league OVR (fallback for players with no prior event history)
    if(ovr == null) {
      const ep = enriched.find(x => x.ingameName === ingame || x.name === ingame
        || x.ingameName === p.name || x.name === p.name);
      ovr = ep?.ovr ?? null;
    }

    if(ovr != null) {
      updated++;
      return { ...p, signupOvr: ovr };
    }
    return p;
  });

  if(!updated) {
    showToast('Nie znaleziono danych OVR dla żadnego gracza', 'info'); return;
  }

  await saveData();
  renderEvents();
  showToast(`✅ Uzupełniono signupOvr dla ${updated} graczy w ${ev.title}`, 'success');
}
async function signupToEvent(eventId) {
  if(!discordUser) { loginWithDiscord(eventId); return; }
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  if((ev.waitlist||[]).find(p => p.id === discordUser.id)) { showToast('Jesteś już na liście rezerwowej', 'info'); return; }
  window._evSignupWaitlist = !!(ev.maxPlayers && (ev.players||[]).length >= ev.maxPlayers);
  if(window._evSignupWaitlist && !confirm(currentLang === 'en' ? 'The event is full. Join the waitlist? You will get in automatically when a spot opens.' : 'Brak wolnych miejsc. Zapisać Cię na listę rezerwową? Wejdziesz automatycznie, gdy zwolni się miejsce.')) return;
  if((ev.players||[]).find(p => p.id === discordUser.id)) {
    showToast('ℹ️ Jesteś już zapisany', 'info'); return;
  }
  // For draft events — show position picker first
  if(ev.type === 'draft') {
    openPositionPickerModal(eventId);
    return;
  }
  await _doEventSignup(eventId, {});
}
function openPositionPickerModal(eventId) {
  const modal = document.getElementById('position-picker-modal');
  document.getElementById('position-picker-eventid').value = eventId;
  // Reset all state
  _primaryPos = null;
  _secondaryPos = new Set();
  _speaksEnglish = false;
  ['PG','SG','SF','PF','C'].forEach(pos => {
    const cb = document.getElementById('pos-cb-' + pos);
    if(cb) cb.checked = false;
    const lbl = document.getElementById('pos-lbl-' + pos);
    if(lbl) { lbl.style.borderColor = 'var(--border)'; lbl.style.background = 'var(--surface2)'; lbl.style.opacity = '1'; }
    const mainLbl = document.getElementById('pp-main-' + pos);
    if(mainLbl) { mainLbl.style.borderColor = 'var(--border)'; mainLbl.style.background = 'var(--surface2)'; mainLbl.style.color = 'var(--text)'; }
  });
  // Reset english
  const engLbl = document.getElementById('pp-eng-label');
  const engChk = document.getElementById('pp-eng-check');
  if(engLbl) { engLbl.style.borderColor = 'var(--border)'; engLbl.style.background = 'var(--surface2)'; }
  if(engChk) { engChk.style.background = 'transparent'; engChk.style.borderColor = 'var(--border)'; engChk.innerHTML = ''; }
  openPositionPickerWithLang();
  modal.classList.add('open');
}
async function _doEventSignup(eventId, extra) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !discordUser || !_ensureSession()) return false;
  const _rank = _dsLeagueRanking(), _enr = _dsComputeOvr(_rank);
  const _me = _enr.find(x => x.ingameName === discordUser.name || x.name === discordUser.name);
  const body = { eventId, signupOvr: _me?.ovr ?? null, discordTag: discordUser.discordTag || null, waitlist: !!window._evSignupWaitlist, ...extra };
  let r = await _api('/event-signup', 'POST', body, { session: true });
  if(r.status === 409 && r.full) {
    if(!confirm(currentLang === 'en' ? 'The last spot was just taken. Join the waitlist?' : 'Ostatnie miejsce właśnie się zajęło. Zapisać Cię na listę rezerwową?')) return false;
    r = await _api('/event-signup', 'POST', { ...body, waitlist: true }, { session: true });
  }
  if(!r.ok) { showToast('❌ Błąd zapisu: ' + (r.error || r.status), 'error'); return false; }
  ev.players = ev.players || []; ev.waitlist = ev.waitlist || [];
  if(r.waitlist) ev.waitlist.push(r.player); else ev.players.push(r.player);
  document.getElementById('position-picker-modal')?.classList.remove('open');
  openEventDetail(eventId);
  renderEvents();
  if(r.waitlist) showToast(`⏳ Jesteś na liście rezerwowej (#${r.position}) — damy znać, gdy zwolni się miejsce`, 'info');
  else showSignupWelcome(eventId, r.player);
  return true;
}
async function confirmSignupWithPositions() {
  const eventId = document.getElementById('position-picker-eventid').value;
  if(!_primaryPos) { showToast(currentLang === 'en' ? '❌ Select your primary position' : '❌ Wybierz główną pozycję', 'error'); return; }
  const positions = [_primaryPos, ..._secondaryPos].filter((v, i, a) => a.indexOf(v) === i);
  await _doEventSignup(eventId, { positions, primaryPos: _primaryPos, speaksEnglish: _speaksEnglish });
}
function showSignupWelcome(eventId, playerObj) {
  const enriched = _dsComputeOvr([playerObj], {});
  const ep = enriched[0];
  const ovr = ep?.ovr || null;

  // Delta from most recent completed event
  const eventsWithMatches = events.filter(e=>(e.matches||[]).length>0).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
  const latestEv = eventsWithMatches[eventsWithMatches.length-1] || null;
  let delta = null;
  let playedLastEvent = false;
  if(latestEv && ep?.ingameName) {
    const postMap = _computeChainedOvrMap();
    const post = postMap[ep.ingameName];
    if(post !== undefined) {
      const preMap = _computeChainedOvrMap(latestEv.id);
      let pre = preMap[ep.ingameName];
      if(pre === undefined) {
        // Player debut in latestEv — get their pre-event baseline from ranking
        const ranks = _dsLeagueRanking();
        const histPosCount={};
        matches.forEach(m=>{[m.team1,m.team2].forEach(team=>{(team?.players||[]).forEach(p=>{
          if(!p.name||!p.pos)return;
          if(!histPosCount[p.name])histPosCount[p.name]={};
          histPosCount[p.name][p.pos]=(histPosCount[p.name][p.pos]||0)+1;
        });});});
        const domPos=histPosCount[ep.ingameName]
          ? Object.entries(histPosCount[ep.ingameName]).sort((a,b)=>b[1]-a[1])[0][0] : null;
        const entries=ranks.filter(r=>r.name===ep.ingameName);
        const best=(domPos&&entries.find(e=>e.pos===domPos))||entries[0];
        if(best) pre = best.ovr;
      }
      // Check player appeared in latestEv matches
      playedLastEvent = (latestEv.matches||[]).some(m=>
        [...(m.team1?.players||[]),...(m.team2?.players||[])].some(p=>p.name===ep.ingameName)
      );
      if(pre !== undefined) delta = post - pre;
    }
  }

  const MSGS_NEW      = [
    'Witaj w lidze! Czas pokazać co masz w sobie. 🌟',
    'Każda legenda zaczynała od pierwszego meczu. To jest właśnie Twój. 🏆',
    'Nowa twarz, nowe możliwości. Zrób wrażenie! 👀',
    'Statystyki nie kłamią — a Twoje jeszcze nie istnieją. Czas to zmienić. 📋',
    'Historia ligowa: strona pusta. Zaraz to naprawisz. ✍️',
    'Pierwszy mecz zawsze boli. Drugi już mniej. Powodzenia! 😬',
    'Ktoś musi być najnowszym — dziś to Ty. Nie zawiedź. 🆕',
    'Liga czeka. Ty zapisany. Teraz już tylko parkiet. 🏀',
  ];
  const MSGS_DEBUT    = [
    'Debiut zaliczony. Teraz już wiesz o co chodzi — czas to wykorzystać. 💡',
    'Pierwszy event był tylko rozgrzewką. Na tym pokażesz prawdziwy poziom. 🔥',
    'Overall wyznaczony. Droga do 99 właśnie się zaczęła. 🗺️',
    'Próbka to nie ocena. Na tym evencie piszesz historię od nowa. ✍️',
    'Etykieta nałożona. Teraz pytanie — czy ona kłamie? 🎯',
    'Widziałem Twój ostatni event. Liga też widziała. Pora coś z tym zrobić. 😏',
    'Startowa wartość ustalona. Jedyna droga — w górę. Prawda? 📈',
    'Baza jest. Reszta to praca. No to do roboty. 🛠️',
  ];
  const MSGS_BIG_UP   = [
    'BOOM! Rakieta startuje. Czy ktoś zawiadomił NASA? 🚀',
    'Chyba ktoś grał w nocy i coś mu kliknęło. Naprawdę nieźle. 😎',
    'Inni też trenują — ale Ty też, i WIDAĆ. Tak trzymaj. 💪',
    'To się mówi forma! Zimna woda, gorące liczby. 🔥',
    'Skoro tak idziesz w górę, to strzelam że niedługo będziesz GM-em. Spokojnie. 😂',
    'Taki skok overalla to się widuje raz na kilka eventów. Zapamiętają Cię. 👑',
    'Ktoś odblokował tryb boga. Następny event zweryfikuje czy to trend, czy fluk. 🎲',
    'Liga notuje. Rywale patrzą. Nie zwalniaj teraz. 🏆',
  ];
  const MSGS_SMALL_UP = [
    'Plus na koncie. Z takim tempem za rok będziesz bogiem. 📈',
    'Progres mały, ale prawdziwy. Szacunek za robotę. 👊',
    'Krok do przodu. Nie zatrzymuj się, kolejny event czeka. 🏀',
    'Rośnie legenda. Powoli, ale pewnie. 👑',
    'Nie spektakularnie, ale do przodu. Każdy punkt się liczy. 🔢',
    'Mały plus, ale jednak plus. Syzyf by się uśmiechnął. 🪨',
    'Droga do 99 krok po kroku. Jesteś na niej. 🗺️',
    'Nie rewolucja, ale ewolucja. I o to chodzi. 🧬',
  ];
  const MSGS_SAME     = [
    'Zero zmian. Świat się kręci, Ty stoisz. Może czas przyspieszyć? ⏩',
    'Stabilność to cnota — ale 99 nie przyjdzie samo. Czas zaatakować. 🎯',
    'Forma trzyma. Teraz przełóż ją na parkiet i uderz mocniej. 💥',
    'Ani w górę, ani w dół. Klasyczny pat. Czas go przełamać. 🎲',
    'Tyle samo co ostatnio. Liga czeka na coś więcej. 🥱',
    'Bez zmian. Dobrze czy źle? Zależy co z tym zrobisz na evencie. 🤷',
    'Plateau. Wszyscy przez to przechodzą. Nieliczni je przebijają. 🧱',
    'Overall zamrożony. Odmrozi się tylko na parkiecie. ❄️',
  ];
  const MSGS_SMALL_DOWN = [
    'Malutki dołek, takie rzeczy się zdarzają. Odbijesz na tym evencie. 🔄',
    'Cofnąłeś się krok, żeby skoczyć dwa. Klasyk. 🏋',
    'Kilka złych meczów to nie koniec kariery. Wróć mocniejszy. 💎',
    'Statystyki trochę w dół, ale mecze wygrasz głową. 🧠',
    'Minus jest. Ale jeszcze nie alarm. Czas działać. ⚠️',
    'Forma faluje — to normalne. Ważne żeby fala wróciła. 🌊',
    'Trochę w dół, ale nie tragedia. Jeden dobry event i wracasz. 🔁',
    'Zdarza się najlepszym. Kluczowe co zrobisz na tym evencie. 🔑',
  ];
  const MSGS_BIG_DOWN = [
    'Ekhm. Spory dół. Ale Syzyf też nie rezygnował — i Ty nie rezygnuj. 🪨',
    'Karma? Pech? Forma? Jedno z trzech. Może wszystkie. Odbuduj się. 🛠️',
    'No to były ciężkie mecze. Nie ma co płakać — trzeba grać. 😤',
    'Tyle punktów w dół... Może warto spać wcześniej przed eventem? 😅',
    'Naprawdę? Aż tyle? No dobra, grunt że się zapisałeś. Odrabiaj straty. 📉',
    'Taki spadek to sygnał. Liga wysyła wiadomość. Czas jej odpowiedzieć. 📩',
    'Wszyscy mają gorszy period. Twój właśnie dobiegł końca — teraz odbijaš. 🏹',
    'Statystyki mówią "nie". Ty na evencie powiesz "owszem". 😤',
  ];

  let msgs, deltaHtml = '';
  if(ovr === null || !ep?.ingameName) {
    msgs = MSGS_NEW;
  } else if(delta === null && !playedLastEvent) {
    msgs = MSGS_NEW;
  } else if(delta === null) {
    msgs = MSGS_DEBUT;
  } else if(delta >= 4)  { msgs = MSGS_BIG_UP;    deltaHtml = `<div style="color:#4ade80;font-size:1.05rem;font-weight:800;margin-bottom:.15rem;letter-spacing:1px">&#9650;&#9650; +${delta} po ostatnim evencie</div>`; }
  else if(delta > 0)     { msgs = MSGS_SMALL_UP;  deltaHtml = `<div style="color:#4ade80;font-size:.95rem;font-weight:700;margin-bottom:.15rem">&#9650; +${delta} po ostatnim evencie</div>`; }
  else if(delta === 0)   { msgs = MSGS_SAME;       deltaHtml = `<div style="color:var(--muted);font-size:.9rem;margin-bottom:.15rem">&#9472; bez zmian po ostatnim evencie</div>`; }
  else if(delta >= -3)   { msgs = MSGS_SMALL_DOWN; deltaHtml = `<div style="color:#f87171;font-size:.95rem;font-weight:700;margin-bottom:.15rem">&#9660; ${delta} po ostatnim evencie</div>`; }
  else                   { msgs = MSGS_BIG_DOWN;   deltaHtml = `<div style="color:#f87171;font-size:1.05rem;font-weight:800;margin-bottom:.15rem;letter-spacing:1px">&#9660;&#9660; ${delta} po ostatnim evencie</div>`; }

  const msg = msgs[Math.floor(Math.random()*msgs.length)];
  const ovrHtml = ovr ? `
    <div style="margin:1rem 0 .5rem">
      <div style="font-size:.75rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.35rem">TWÓJ OBECNY OVERALL</div>
      <div style="display:inline-block;background:${_dsOvrColor(ovr)};color:rgba(0,0,0,.8);border-radius:12px;padding:.35rem 1.25rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.8rem;letter-spacing:2px">${ovr}</div>
      ${deltaHtml}
    </div>` : '';

  const sisyphusOvr = ovr || 75;
  // Ball position along hill (280x170 canvas, hill from (0,108) to (280,42))
  const _bx = Math.round(58 + (sisyphusOvr - 40) / 59 * 168);
  const _by = Math.round(108 - _bx * 66 / 280 - 16);
  const sisyphusImg = `<svg viewBox="0 0 280 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px;margin:0 auto .5rem;display:block;border-radius:10px">
  <defs>
    <linearGradient id="swSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#020408"/><stop offset="65%" stop-color="#09152a"/><stop offset="100%" stop-color="#0e2040"/></linearGradient>
    <linearGradient id="swHill" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0c1806"/><stop offset="100%" stop-color="#162808"/></linearGradient>
    <radialGradient id="swBall" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#f8b050"/><stop offset="45%" stop-color="#d86010"/><stop offset="100%" stop-color="#8c2800"/></radialGradient>
    <radialGradient id="swMoonH" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff8c0" stop-opacity=".28"/><stop offset="100%" stop-color="#fff8c0" stop-opacity="0"/></radialGradient>
    <filter id="swGl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="swSg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="280" height="170" fill="url(#swSky)" rx="10"/>
  <ellipse cx="140" cy="38" rx="95" ry="20" fill="#1a2068" opacity=".09" transform="rotate(-15,140,38)"/>
  <g fill="#ffffff">
    <circle cx="11" cy="7" r=".8" opacity=".9"/><circle cx="27" cy="15" r="1.1" opacity=".7"/><circle cx="46" cy="5" r=".7" opacity=".8"/><circle cx="66" cy="13" r=".9" opacity=".65"/>
    <circle cx="84" cy="4" r="1.2" opacity=".9"/><circle cx="99" cy="21" r=".7" opacity=".7"/><circle cx="117" cy="7" r=".6" opacity=".8"/><circle cx="132" cy="25" r="1.0" opacity=".6"/>
    <circle cx="157" cy="10" r=".8" opacity=".7"/><circle cx="171" cy="3" r="1.3" opacity=".9"/><circle cx="191" cy="17" r=".7" opacity=".75"/><circle cx="211" cy="8" r=".9" opacity=".65"/>
    <circle cx="245" cy="14" r=".8" opacity=".8"/><circle cx="267" cy="5" r="1.1" opacity=".7"/><circle cx="276" cy="22" r=".7" opacity=".6"/>
    <circle cx="35" cy="31" r=".6" opacity=".55"/><circle cx="57" cy="38" r=".7" opacity=".6"/><circle cx="107" cy="30" r=".6" opacity=".5"/>
    <circle cx="147" cy="34" r=".8" opacity=".5"/><circle cx="201" cy="27" r=".6" opacity=".6"/><circle cx="257" cy="33" r=".7" opacity=".5"/>
    <circle cx="21" cy="46" r=".5" opacity=".45"/><circle cx="77" cy="43" r=".6" opacity=".5"/><circle cx="232" cy="39" r=".6" opacity=".45"/>
  </g>
  <g fill="#f8e878" opacity=".92">
    <circle cx="22" cy="18" r="1.5"/><circle cx="91" cy="11" r="1.3"/><circle cx="179" cy="8" r="1.6"/><circle cx="241" cy="23" r="1.4"/><circle cx="53" cy="22" r="1.1"/>
  </g>
  <circle cx="246" cy="27" r="30" fill="url(#swMoonH)"/>
  <circle cx="246" cy="27" r="14" fill="#f5e898" opacity=".88"/>
  <circle cx="253" cy="23" r="12" fill="#0b1523"/>
  <circle cx="240" cy="33" r="2.8" fill="#d5cf88" opacity=".32"/>
  <circle cx="250" cy="39" r="1.6" fill="#d5cf88" opacity=".22"/>
  <circle cx="244" cy="24" r="1.2" fill="#d5cf88" opacity=".2"/>
  <polygon points="0,170 0,108 280,42 280,170" fill="url(#swHill)"/>
  <line x1="0" y1="108" x2="280" y2="42" stroke="#1e3a0e" stroke-width="1.5"/>
  <path d="M16,163 L28,148 L36,158 Z" fill="#0a1506" opacity=".7"/>
  <path d="M52,149 L62,136 L70,144 Z" fill="#0a1506" opacity=".6"/>
  <path d="M190,105 L198,93 L207,102 Z" fill="#0a1506" opacity=".6"/>
  <path d="M228,88 L235,78 L242,86 Z" fill="#0a1506" opacity=".5"/>
  <g stroke="#2d5010" stroke-width="1.4" fill="none" stroke-linecap="round">
    <path d="M36,143 C36,135 34,132 34,129"/><path d="M39,143 C40,135 42,132 44,129"/>
    <path d="M163,111 C163,103 161,100 161,97"/><path d="M166,111 C167,103 169,100 171,97"/>
    <path d="M241,74 C241,66 239,63 239,60"/><path d="M244,74 C245,66 247,63 249,60"/>
  </g>
  <line x1="266" y1="44" x2="266" y2="12" stroke="#a07818" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="274" cy="22" r="13" fill="#f5c518" opacity=".18" filter="url(#swSg)"/>
  <path d="M266,12 L286,18 L266,24 Z" fill="#f5c518" filter="url(#swGl)"/>
  <text x="268" y="22.5" font-size="5.8" font-weight="900" font-family="Arial Black,sans-serif" fill="#1a0e00">99</text>
  <ellipse cx="${_bx+4}" cy="${_by+18}" rx="14" ry="5" fill="#000" opacity=".38" transform="rotate(-13,${_bx+4},${_by+18})"/>
  <circle cx="${_bx}" cy="${_by}" r="16" fill="url(#swBall)"/>
  <path d="M${_bx-16},${_by} Q${_bx},${_by-9} ${_bx+16},${_by}" stroke="#7a2200" stroke-width="1.4" fill="none"/>
  <path d="M${_bx-16},${_by} Q${_bx},${_by+9} ${_bx+16},${_by}" stroke="#7a2200" stroke-width="1.4" fill="none"/>
  <line x1="${_bx}" y1="${_by-16}" x2="${_bx}" y2="${_by+16}" stroke="#7a2200" stroke-width="1.4"/>
  <path d="M${_bx-8},${_by-14} Q${_bx-17},${_by} ${_bx-8},${_by+14}" stroke="#7a2200" stroke-width="1.0" fill="none"/>
  <path d="M${_bx+8},${_by-14} Q${_bx+17},${_by} ${_bx+8},${_by+14}" stroke="#7a2200" stroke-width="1.0" fill="none"/>
  <ellipse cx="${_bx-5}" cy="${_by-5}" rx="5.5" ry="4" fill="#ffcc80" opacity=".42" transform="rotate(-20,${_bx-5},${_by-5})"/>
  <rect x="${_bx+19}" y="${_by-11}" width="28" height="18" rx="5" fill="#f5c518"/>
  <text x="${_bx+33}" y="${_by+3}" font-size="11" font-weight="900" font-family="Arial Black,sans-serif" fill="#1a0e00" text-anchor="middle">${sisyphusOvr}</text>
  <ellipse cx="${_bx-27}" cy="${_by+24}" rx="10" ry="6.5" fill="#1a2848" transform="rotate(-13,${_bx-27},${_by+24})"/>
  <path d="M${_bx-36},${_by+6} C${_bx-32},${_by+11} ${_bx-27},${_by+17} ${_bx-23},${_by+26} C${_bx-18},${_by+26} ${_bx-17},${_by+20} ${_bx-21},${_by+14} C${_bx-25},${_by+9} ${_bx-28},${_by+4} ${_bx-36},${_by+6} Z" fill="#1a2848"/>
  <path d="M${_bx-34},${_by+10} C${_bx-29},${_by+4} ${_bx-22},${_by+1} ${_bx-17},${_by-2} C${_bx-14},${_by-5} ${_bx-14},${_by-8} ${_bx-18},${_by-7} C${_bx-23},${_by-4} ${_bx-30},${_by+2} ${_bx-35},${_by+7} Z" fill="#1a2848"/>
  <path d="M${_bx-17},${_by-2} C${_bx-11},${_by-5} ${_bx-6},${_by-6} ${_bx-2},${_by-4} C${_bx},${_by-2} ${_bx},${_by+1} ${_bx-3},${_by+2} C${_bx-8},${_by+1} ${_bx-13},${_by-1} ${_bx-18},${_by+1} Z" fill="#1a2848"/>
  <path d="M${_bx-32},${_by+14} C${_bx-25},${_by+9} ${_bx-18},${_by+6} ${_bx-13},${_by+5} C${_bx-10},${_by+4} ${_bx-10},${_by+8} ${_bx-13},${_by+9} C${_bx-19},${_by+10} ${_bx-26},${_by+12} ${_bx-33},${_by+16} Z" fill="#1a2848"/>
  <path d="M${_bx-23},${_by+26} C${_bx-19},${_by+35} ${_bx-13},${_by+43} ${_bx-9},${_by+54} C${_bx-6},${_by+57} ${_bx-2},${_by+57} ${_bx-3},${_by+54} C${_bx-7},${_by+45} ${_bx-14},${_by+37} ${_bx-18},${_by+28} Z" fill="#1a2848"/>
  <path d="M${_bx-32},${_by+24} C${_bx-38},${_by+32} ${_bx-46},${_by+39} ${_bx-52},${_by+48} C${_bx-49},${_by+52} ${_bx-45},${_by+52} ${_bx-44},${_by+49} C${_bx-38},${_by+41} ${_bx-31},${_by+34} ${_bx-26},${_by+26} Z" fill="#1a2848"/>
  <circle cx="${_bx-38}" cy="${_by+1}" r="9" fill="#1a2848"/>
  <ellipse cx="${_bx-38}" cy="${_by-6}" rx="6.5" ry="3.5" fill="#1a2848"/>
  <path d="M${_bx-45},${_by+6} C${_bx-42},${_by+3} ${_bx-40},${_by+1} ${_bx-38},${_by+2} C${_bx-36},${_by+1} ${_bx-34},${_by+4} ${_bx-33},${_by+8} C${_bx-35},${_by+9} ${_bx-38},${_by+11} ${_bx-43},${_by+9} Z" fill="#242e50"/>
  <ellipse cx="${_bx-50}" cy="${_by-10}" rx="2.4" ry="4" fill="#5090ff" opacity=".62" transform="rotate(-30,${_bx-50},${_by-10})"/>
  <ellipse cx="${_bx-56}" cy="${_by+1}" rx="1.7" ry="3" fill="#5090ff" opacity=".48" transform="rotate(-40,${_bx-56},${_by+1})"/>
  <ellipse cx="${_bx-46}" cy="${_by-17}" rx="1.4" ry="2.3" fill="#5090ff" opacity=".38" transform="rotate(-20,${_bx-46},${_by-17})"/>
  <g stroke="#3050a0" stroke-width="1.0" opacity=".52" stroke-linecap="round">
    <line x1="${_bx-59}" y1="${_by-5}" x2="${_bx-66}" y2="${_by-10}"/>
    <line x1="${_bx-58}" y1="${_by+2}" x2="${_bx-66}" y2="${_by+1}"/>
    <line x1="${_bx-58}" y1="${_by+9}" x2="${_bx-65}" y2="${_by+13}"/>
  </g>
  <text x="140" y="163" font-size="7.5" font-weight="700" font-family="Arial,sans-serif" fill="#f5c518" opacity=".38" text-anchor="middle" letter-spacing="3">ROAD TO 99</text>
</svg>`;

  document.getElementById('signup-welcome-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:2px;margin-bottom:.5rem">ZAPISANO NA DRAFT! ✅</div>
    <div style="color:var(--muted);font-size:.88rem;margin-bottom:.75rem">Hej <b style="color:var(--text)">${playerObj.name}</b>, jesteś na liście.</div>
    ${sisyphusImg}
    ${ovrHtml}
    <div style="background:var(--surface2);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:.75rem 1rem;font-size:.85rem;line-height:1.55;color:var(--muted);text-align:left;margin-top:.75rem">${msg}</div>
    <button onclick="document.getElementById('signup-welcome-modal').classList.remove('open')" class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1.25rem">Let's go 🏀</button>`;
  document.getElementById('signup-welcome-modal').classList.add('open');
}
function selectManualPos(pos) {
  _manualPrimaryPos = pos;
  ['PG','SG','SF','PF','C'].forEach(p => {
    const el = document.getElementById('manual-pos-' + p);
    if(el) el.style.border = p === pos ? '2px solid var(--accent)' : '2px solid var(--border)';
  });
}
function toggleManualSecPos(pos) {
  if(_manualSecondaryPos.has(pos)) {
    _manualSecondaryPos.delete(pos);
  } else {
    _manualSecondaryPos.add(pos);
  }
  const el = document.getElementById('manual-secpos-' + pos);
  if(el) el.style.border = _manualSecondaryPos.has(pos) ? '2px solid var(--accent)' : '2px solid var(--border)';
}
function toggleManualEnglish() {
  _manualEnglish = !_manualEnglish;
  const toggle = document.getElementById('manual-eng-toggle');
  const check = document.getElementById('manual-eng-check');
  if(toggle) toggle.style.border = _manualEnglish ? '2px solid var(--accent)' : '2px solid var(--border)';
  if(check) check.innerHTML = _manualEnglish ? '<svg width="12" height="12" viewBox="0 0 12 12"><polyline points="1,6 4,9 11,2" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg>' : '';
}
function selectPrimaryPos(pos) {
  _primaryPos = pos;
  ['PG','SG','SF','PF','C'].forEach(p => {
    const lbl = document.getElementById('pp-main-' + p);
    if(!lbl) return;
    const active = p === pos;
    lbl.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
    lbl.style.background  = active ? 'rgba(245,197,24,.15)' : 'var(--surface2)';
    lbl.style.color = active ? 'var(--accent)' : 'var(--text)';
  });
  // Auto-uncheck from secondary if selected as primary
  _secondaryPos.delete(pos);
  updateSecondaryVisuals();
}
function toggleSecondaryPos(pos) {
  if(pos === _primaryPos) return; // can't secondary = primary
  if(_secondaryPos.has(pos)) _secondaryPos.delete(pos);
  else _secondaryPos.add(pos);
  updateSecondaryVisuals();
}
function updateSecondaryVisuals() {
  ['PG','SG','SF','PF','C'].forEach(p => {
    const lbl = document.getElementById('pos-lbl-' + p);
    if(!lbl) return;
    const active = _secondaryPos.has(p);
    const isPrimary = p === _primaryPos;
    lbl.style.borderColor = active ? '#60a5fa' : 'var(--border)';
    lbl.style.background  = active ? 'rgba(96,165,250,.12)' : 'var(--surface2)';
    lbl.style.opacity = isPrimary ? '0.35' : '1';
  });
}
function toggleEnglish() {
  _speaksEnglish = !_speaksEnglish;
  const lbl = document.getElementById('pp-eng-label');
  const chk = document.getElementById('pp-eng-check');
  if(lbl) { lbl.style.borderColor = _speaksEnglish ? '#4ade80' : 'var(--border)'; lbl.style.background = _speaksEnglish ? 'rgba(74,222,128,.08)' : 'var(--surface2)'; }
  if(chk) { chk.style.background = _speaksEnglish ? '#4ade80' : 'transparent'; chk.style.borderColor = _speaksEnglish ? '#4ade80' : 'var(--border)'; chk.innerHTML = _speaksEnglish ? '<svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''; }
}
function openPositionPickerWithLang() {
  // Update modal labels based on currentLang
  const isEn = currentLang === 'en';
  const el = id => document.getElementById(id);
  if(el('pp-title'))          el('pp-title').textContent        = isEn ? '🎮 SIGN UP FOR DRAFT' : '🎮 ZAPISZ SIĘ NA DRAFT';
  if(el('pp-primary-label'))  el('pp-primary-label').textContent = isEn ? 'Primary position' : 'Główna pozycja';
  if(el('pp-secondary-label'))el('pp-secondary-label').textContent = isEn ? 'Secondary positions (optional)' : 'Dodatkowe pozycje (opcjonalnie)';
  if(el('pp-eng-title'))      el('pp-eng-title').textContent    = isEn ? 'I communicate in English' : 'Komunikuję się po angielsku';
  if(el('pp-eng-sub'))        el('pp-eng-sub').textContent      = isEn ? 'English is my primary language' : 'I communicate in English';
  if(el('pp-confirm-btn'))    el('pp-confirm-btn').textContent  = isEn ? '✅ Sign up' : '✅ Zapisz się';
  if(el('pp-cancel-btn'))     el('pp-cancel-btn').textContent   = isEn ? 'Cancel' : 'Anuluj';
}
// Keep old function name for compatibility
function togglePosLabel(pos) { toggleSecondaryPos(pos); }
async function cancelSignup(eventId) {
  if(!discordUser || !_ensureSession()) return;
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const r = await _api('/event-signup', 'DELETE', { eventId }, { session: true });
  if(!r.ok) { showToast('❌ Błąd: ' + (r.error || r.status), 'error'); return; }
  ev.players = (ev.players || []).filter(p => p.id !== discordUser.id);
  ev.waitlist = (ev.waitlist || []).filter(p => p.id !== discordUser.id);
  if(r.promoted) { const w = (ev.waitlist || []).find(p => p.id === r.promoted); if(w) { ev.waitlist = ev.waitlist.filter(p => p.id !== r.promoted); ev.players.push(w); } }
  openEventDetail(eventId);
  renderEvents();
  showToast('👋 Wypisano z eventu', 'info');
}
function logoutDiscord() {
  if(localStorage.getItem('nba2k_admin_via_discord') === '1') { localStorage.removeItem('nba2k_admin_via_discord'); try { logout(); } catch(e) {} }
  if(localStorage.getItem('nba2k_events_via_discord') === '1') { localStorage.removeItem('nba2k_events_via_discord'); try { logoutEvents(); } catch(e) {} }
  discordUser = null;
  myVotes = {};
  localStorage.removeItem('nba2k_discord_user');
  updateAuthUI();
  renderEvents();
  try { renderTeamRegistrations(); renderSchedule(); updateMyPanelBadge(); if(document.getElementById('view-mypanel')?.classList.contains('active')) renderMyPanelView(); } catch(e) {}
  showToast('👋 Wylogowano z Discorda', 'info');
}
function loginWithDiscord(returnEventId) {
  if(!workerUrl) { showToast('❌ Brak Worker URL w konfiguracji', 'error'); return; }
  // Save the event we want to return to after login
  if(returnEventId) localStorage.setItem('nba2k_pending_signup_event', returnEventId);
  const returnUrl = window.location.href.split('?')[0].split('#')[0];
  window.location.href = workerUrl.replace(/\/$/, '') + '/discord-login?return=' + encodeURIComponent(returnUrl);
}
// ═══ DRAFT SYSTEM ════════════════════════════════════════════

function openManualCaptainsModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !ev.players?.length) { showToast('❌ Brak graczy', 'error'); return; }
  const n = ev.numTeams || 2;
  const teamNames = (ev.teams||[]).map(t => t.name).concat(['Drużyna A','Drużyna B','Drużyna C','Drużyna D','Drużyna E','Drużyna F','Drużyna G','Drużyna H']);

  const rows = Array.from({length: n}, (_, i) => {
    const currentCaptainId = (ev.teams||[])[i]?.captain?.id || '';
    const currentName = teamNames[i] || ('Drużyna ' + (i+1));
    const options = ev.players.map(p =>
      `<option value="${p.id}" ${p.id === currentCaptainId ? 'selected' : ''}>${p.name}${p.discordTag && p.discordTag !== p.name ? ' ('+p.discordTag+')' : ''}</option>`
    ).join('');
    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;align-items:center;padding:.75rem;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
        <div>
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.3rem">Nazwa drużyny</div>
          <input type="text" id="mc-teamname-${i}" value="${currentName}"
            style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.9rem">
        </div>
        <div>
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;color:var(--muted);text-transform:uppercase;margin-bottom:.3rem">Kapitan</div>
          <select id="mc-captain-${i}"
            style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.9rem">
            <option value="">— wybierz kapitana —</option>
            ${options}
          </select>
        </div>
      </div>`;
  }).join('');

  document.getElementById('manual-captains-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:.25rem">🎯 WYBIERZ KAPITANÓW</div>
    <div style="color:var(--muted);font-size:.85rem;margin-bottom:1.25rem">Przypisz kapitana do każdej drużyny i opcjonalnie zmień jej nazwę.</div>
    <div style="display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.25rem" id="mc-teams-list">
      ${rows}
    </div>
    <div style="display:flex;gap:.75rem;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="confirmManualCaptains('${eventId}',${n})">✅ Zatwierdź kapitanów</button>
      <button class="btn btn-ghost" onclick="document.getElementById('manual-captains-modal').classList.remove('open')">Anuluj</button>
    </div>`;
  document.getElementById('manual-captains-modal').classList.add('open');
}
async function confirmManualCaptains(eventId, n) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;

  const teams = [];
  const usedIds = new Set();
  for(let i = 0; i < n; i++) {
    const name = document.getElementById('mc-teamname-'+i)?.value?.trim() || ('Drużyna ' + (i+1));
    const captainId = document.getElementById('mc-captain-'+i)?.value;
    if(!captainId) { showToast('❌ Wybierz kapitana dla każdej drużyny', 'error'); return; }
    if(usedIds.has(captainId)) { showToast('❌ Ten sam gracz nie może być kapitanem dwóch drużyn', 'error'); return; }
    usedIds.add(captainId);
    const captain = ev.players.find(p => p.id === captainId);
    if(!captain) { showToast('❌ Nie znaleziono gracza', 'error'); return; }
    teams.push({ name, captain, players: [captain] });
  }

  ev.teams = teams;
  const captainIds = new Set(teams.map(t => t.captain.id));
  const method = ev.draftMethod || 'snake';

  if(method === 'random') {
    const remaining = ev.players.filter(p => !captainIds.has(p.id)).sort(() => Math.random() - 0.5);
    remaining.forEach((p, i) => ev.teams[i % n].players.push(p));
    ev.draftPool = [];
    ev.status = 'active';
    await saveData();
    document.getElementById('manual-captains-modal').classList.remove('open');
    renderEvents();
    openEventDetail(eventId);
    showToast('🎲 Drużyny przydzielone!', 'success');
    return;
  }

  if(method === 'balanced') {
    const remaining = ev.players.filter(p => !captainIds.has(p.id));
    const scored = remaining.map(p => {
      const pm = matches.filter(m => [...(m.team1.players||[]),...(m.team2.players||[])].some(x => x.name === p.name));
      if(!pm.length) return { p, score: 0 };
      const stats = pm.reduce((acc, m) => {
        const pl = [...(m.team1.players||[]),...(m.team2.players||[])].find(x => x.name === p.name);
        if(pl) { acc.pts += pl.pts||0; acc.reb += pl.reb||0; acc.ast += pl.ast||0; acc.stl += pl.stl||0; acc.blk += pl.blk||0; acc.gp++; }
        return acc;
      }, {pts:0,reb:0,ast:0,stl:0,blk:0,gp:0});
      const gp = stats.gp || 1;
      return { p, score: (stats.pts/gp)*0.4+(stats.reb/gp)*0.2+(stats.ast/gp)*0.2+(stats.stl/gp)*0.1+(stats.blk/gp)*0.1 };
    }).sort((a,b) => b.score - a.score);
    const assignOrder = buildDraftOrder('snake', n, scored.length);
    scored.forEach(({p}, i) => ev.teams[assignOrder[i]].players.push(p));
    ev.draftPool = [];
    ev.status = 'active';
    await saveData();
    document.getElementById('manual-captains-modal').classList.remove('open');
    renderEvents();
    openEventDetail(eventId);
    showToast('⚖️ Drużyny zbalansowane!', 'success');
    return;
  }

  ev.draftPool = ev.players.filter(p => !captainIds.has(p.id));
  ev.draftTurn = 0;
  ev.draftOrder = buildDraftOrder(method, n, ev.draftPool.length);
  ev.status = 'closed';
  await saveData();
  document.getElementById('manual-captains-modal').classList.remove('open');
  renderEvents();
  showToast('✅ Kapitanowie przypisani!', 'success');
  // If opened from start-draft-modal, reopen it
  if(window._returnToStartDraftAfterCaptains) {
    const _eid = window._returnToStartDraftAfterCaptains;
    window._returnToStartDraftAfterCaptains = null;
    setTimeout(() => startDraft(_eid), 200);
  } else {
    openEventDetail(eventId);
  }
}
async function assignCaptains(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !ev.players?.length) { showToast('❌ Brak graczy', 'error'); return; }
  const n = ev.numTeams || 2;
  if(ev.players.length < n) { showToast('❌ Za mało graczy na ' + n + ' drużyny', 'error'); return; }

  // Apply captain lottery filter before shuffling
  let _captPool = [...ev.players];
  const _fType = window._captFilterType || 'all';
  if(_fType === 'pos') {
    const _fPos = window._captFilterPos || '';
    if(_fPos) _captPool = _captPool.filter(p => p.primaryPos === _fPos || (p.positions||[]).includes(_fPos));
    if(_captPool.length < n) _captPool = [...ev.players]; // fallback if filter leaves too few
  } else if(_fType === 'ovr') {
    const _ovrMin = +(window._captOvrMin || 0);
    const _ovrMax = +(window._captOvrMax || 99);
    const _enriched = _dsComputeOvr(ev.players, {});
    const _ovrById = {};
    _enriched.forEach(p => { _ovrById[p.id] = p.ovr || 0; });
    _captPool = _captPool.filter(p => {
      const o = _ovrById[p.id] || 0;
      return (!_ovrMin || o >= _ovrMin) && (!_ovrMax || o <= _ovrMax);
    });
    if(_captPool.length < n) _captPool = [...ev.players]; // fallback
  }
  // Shuffle and pick captains
  const shuffled = _captPool.sort(() => Math.random() - 0.5);
  const teamNames = ['Drużyna A','Drużyna B','Drużyna C','Drużyna D','Drużyna E','Drużyna F','Drużyna G','Drużyna H'];
  ev.teams = Array.from({length: n}, (_, i) => ({
    name: teamNames[i] || 'Drużyna ' + (i+1),
    captain: shuffled[i],
    players: [shuffled[i]], // captain is first player
  }));
  // Remove captains from available pool
  const captainIds = new Set(ev.teams.map(t => t.captain.id));
  const method = ev.draftMethod || 'snake';

  if(method === 'random') {
    // Assign remaining players randomly to teams
    const remaining = ev.players.filter(p => !captainIds.has(p.id)).sort(() => Math.random() - 0.5);
    remaining.forEach((p, i) => ev.teams[i % n].players.push(p));
    ev.draftPool = [];
    ev.status = 'active';
    await saveData();
    renderEvents();
    openEventDetail(eventId);
    showToast('🎲 Drużyny losowo przydzielone!', 'success');
    return;
  }

  if(method === 'balanced') {
    // Sort players by composite score from league stats
    const remaining = ev.players.filter(p => !captainIds.has(p.id));
    const scored = remaining.map(p => {
      const pm = matches.filter(m =>
        [...(m.team1.players||[]),...(m.team2.players||[])].some(x => x.name === p.name)
      );
      if(!pm.length) return { p, score: 0 };
      const stats = pm.reduce((acc, m) => {
        const pl = [...(m.team1.players||[]),...(m.team2.players||[])].find(x => x.name === p.name);
        if(pl) { acc.pts += pl.pts||0; acc.reb += pl.reb||0; acc.ast += pl.ast||0;
                 acc.stl += pl.stl||0; acc.blk += pl.blk||0; acc.gp++; }
        return acc;
      }, {pts:0,reb:0,ast:0,stl:0,blk:0,gp:0});
      const gp = stats.gp || 1;
      const score = (stats.pts/gp)*0.4 + (stats.reb/gp)*0.2 + (stats.ast/gp)*0.2 +
                    (stats.stl/gp)*0.1 + (stats.blk/gp)*0.1;
      return { p, score };
    }).sort((a,b) => b.score - a.score);

    // Serpentine assignment by score: best→team0, 2nd→team1, 3rd→team2, 4th→team2, 5th→team1...
    const assignOrder = buildDraftOrder('snake', n, scored.length);
    scored.forEach(({p}, i) => ev.teams[assignOrder[i]].players.push(p));
    ev.draftPool = [];
    ev.status = 'active';
    await saveData();
    renderEvents();
    openEventDetail(eventId);
    showToast('⚖️ Drużyny zbalansowane na podstawie statystyk!', 'success');
    return;
  }

  ev.draftPool = ev.players.filter(p => !captainIds.has(p.id));
  ev.draftTurn = 0;
  ev.draftOrder = buildDraftOrder(method, n, ev.draftPool.length);
  ev.status = 'closed';
  await saveData();
  renderEvents();
  showToast('🎲 Kapitanowie wylosowani!', 'success');
  // If called inline from refreshStartDraftModal, just refresh — don't close
  // (reassignCaptainsFromModal calls this then refreshes the modal itself)
  if(!window._suppressEventDetailAfterAssign) {
    openEventDetail(eventId);
  }
  window._suppressEventDetailAfterAssign = false;
}
function startDraft(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  if(!ev.teams?.length) { showToast('❌ Najpierw wylosuj kapitanów', 'error'); return; }

  // Show method selection modal
  document.getElementById('start-draft-eventid').value = eventId;
  // Pre-select existing values if set
  const sel = document.getElementById('start-draft-method');
  if(sel && ev.draftMethod) sel.value = ev.draftMethod;
  const numSel = document.getElementById('start-draft-numteams');
  if(numSel && ev.numTeams) numSel.value = ev.numTeams;
  const perSel = document.getElementById('start-draft-perteam');
  if(perSel && ev.perTeam) perSel.value = ev.perTeam;
  // Refresh dynamic content (GM status + captains)
  refreshStartDraftModal(eventId);
  document.getElementById('start-draft-modal').classList.add('open');
}
async function reassignCaptainsFromModal(eventId, manual) {
  // Save numTeams from modal FIRST so assignCaptains uses the right number
  const numTeams = +(document.getElementById('start-draft-numteams')?.value || 4);
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  ev.numTeams = numTeams;
  if(manual) {
    // Close draft modal, open manual modal, then reopen draft modal after
    document.getElementById('start-draft-modal').classList.remove('open');
    window._returnToStartDraftAfterCaptains = eventId;
    openManualCaptainsModal(eventId);
  } else {
    window._suppressEventDetailAfterAssign = true;
    await assignCaptains(eventId);
    // Refresh the modal content without closing it
    refreshStartDraftModal(eventId);
  }
}
function refreshStartDraftModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const gmOnline = ev.gmOnline || [];
  const teams = ev.teams || [];
  const onlineCount = teams.filter(t => gmOnline.includes(t.captain?.id)).length;
  const allOnline = teams.length > 0 && onlineCount >= teams.length;

  // GM status block
  // Pool info
  const numTeamsVal = +(document.getElementById('start-draft-numteams')?.value || 4);
  const perTeamVal  = +(document.getElementById('start-draft-perteam')?.value || 5);
  const evPlayers = ev.players?.length || 0;
  const needed  = numTeamsVal * perTeamVal;
  const maxPicks = numTeamsVal * (perTeamVal - 1);
  const excluded = Math.max(0, evPlayers - needed);
  const poolInfo = document.getElementById('start-draft-pool-info');
  if(poolInfo) {
    poolInfo.innerHTML = `Zapisanych: <b style="color:var(--text)">${evPlayers}</b> · Potrzeba: <b style="color:var(--text)">${needed}</b> · Nie wybierze się: <b style="color:${excluded > 0 ? 'var(--loss)' : 'var(--win)'}">${excluded}</b>`;
  }

  const gmBlock = document.getElementById('start-draft-gm-status');
  if(gmBlock) {
    gmBlock.innerHTML = teams.length ? `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
        <span style="font-size:.8rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">Status GM</span>
        <span style="font-weight:700;font-size:.85rem;color:${allOnline ? '#4ade80' : 'var(--accent)'}">
          ${onlineCount}/${teams.length} online
        </span>
      </div>
      <div style="display:flex;flex-direction:column;gap:.25rem">
        ${teams.map(t => {
          const isOnline = gmOnline.includes(t.captain?.id);
          return '<div style="display:flex;align-items:center;gap:.5rem;font-size:.82rem">'
            + '<span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + (isOnline ? '#4ade80' : '#374151') + ';border:1.5px solid ' + (isOnline ? '#4ade80' : '#6b7280') + ';box-shadow:' + (isOnline ? '0 0 6px #4ade80' : 'none') + '"></span>'
            + '<span style="flex:1">' + t.name + '</span>'
            + '<span style="color:' + (isOnline ? '#4ade80' : '#6b7280') + '">' + (isOnline ? '● online' : '○ offline') + '</span>'
            + '</div>';
        }).join('')}
      </div>` : '<div style="color:var(--muted);font-size:.82rem">Brak drużyn</div>';
  }

  // Captains block
  const captBlock = document.getElementById('start-draft-captains');
  if(captBlock) {
    // Current pick order (custom or default = team order)
    const pickOrder = ev._pickOrder || teams.map((_, i) => i);
    const orderedTeams = pickOrder.map(i => teams[i]).filter(Boolean);

    captBlock.innerHTML = teams.length ? `
      <div style="margin-bottom:.4rem;font-size:.82rem;color:var(--muted)">Aktualni kapitanowie:</div>
      ${teams.map(t => '<div style="font-size:.82rem;padding:.15rem 0">★ <b>' + (t.captain?.name || '—') + '</b> → ' + t.name + '</div>').join('')}
      <div style="background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:6px;padding:.5rem;margin-top:.5rem;margin-bottom:.25rem">
        <div style="font-size:.7rem;color:var(--muted);font-weight:700;letter-spacing:.07em;margin-bottom:.35rem">FILTR LOSOWANIA</div>
        <select id="capt-filter-type" onchange="(function(){const t=this.value;document.getElementById('capt-f-pos').style.display=t==='pos'?'flex':'none';document.getElementById('capt-f-ovr').style.display=t==='ovr'?'flex':'none';window._captFilterType=t}).call(this)" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.3rem;font-size:.78rem;margin-bottom:.35rem;font-family:inherit">
          <option value="all" ${(window._captFilterType||'all')==='all'?'selected':''}>Wszyscy gracze</option>
          <option value="pos" ${(window._captFilterType||'all')==='pos'?'selected':''}>Po pozycji (primaryPos)</option>
          <option value="ovr" ${(window._captFilterType||'all')==='ovr'?'selected':''}>Po OVR (przedział)</option>
        </select>
        <div id="capt-f-pos" style="display:${(window._captFilterType||'all')==='pos'?'flex':'none'};gap:.25rem;flex-wrap:wrap;margin-bottom:.3rem">
          ${['PG','SG','SF','PF','C'].map(pos => `<button onclick="window._captFilterPos='${pos}';document.querySelectorAll('.capt-pos-b').forEach(b=>{b.style.background='';b.style.color='var(--muted)'});this.style.background='var(--accent)';this.style.color='#000'" class="capt-pos-b" style="background:${(window._captFilterPos||'')==='${pos}'?'var(--accent)':'var(--surface2)'};color:${(window._captFilterPos||'')==='${pos}'?'#000':'var(--muted)'};border:1px solid var(--border);border-radius:4px;padding:.2rem .5rem;cursor:pointer;font-size:.78rem;font-weight:700;font-family:inherit">${pos}</button>`).join('')}
        </div>
        <div id="capt-f-ovr" style="display:${(window._captFilterType||'all')==='ovr'?'flex':'none'};gap:.35rem;align-items:center">
          <span style="font-size:.75rem;color:var(--muted)">OVR:</span>
          <input id="capt-ovr-min" type="number" min="40" max="99" value="${window._captOvrMin||''}" oninput="window._captOvrMin=this.value" placeholder="min" style="width:52px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.2rem .35rem;font-size:.78rem;text-align:center">
          <span style="font-size:.75rem;color:var(--muted)">–</span>
          <input id="capt-ovr-max" type="number" min="40" max="99" value="${window._captOvrMax||''}" oninput="window._captOvrMax=this.value" placeholder="max" style="width:52px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.2rem .35rem;font-size:.78rem;text-align:center">
        </div>
      </div>
      <div style="display:flex;gap:.5rem;margin-top:.4rem">
        <button onclick="reassignCaptainsFromModal('${eventId}', false)" 
          style="flex:1;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.4rem;cursor:pointer;font-family:inherit;font-size:.78rem">
          🎲 Losuj ponownie
        </button>
        <button onclick="reassignCaptainsFromModal('${eventId}', true)"
          style="flex:1;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.4rem;cursor:pointer;font-family:inherit;font-size:.78rem">
          ✏️ Zmień ręcznie
        </button>
      </div>
      <div style="margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
          <div style="font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Kolejność pickowania</div>
          <button onclick="shufflePickOrder('${eventId}')"
            style="background:rgba(245,197,24,.15);border:1px solid rgba(245,197,24,.4);color:var(--accent);border-radius:5px;padding:.2rem .65rem;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit">
            🎲 Losuj kolejność
          </button>
        </div>
        <div id="pick-order-list" style="display:flex;flex-direction:column;gap:.25rem">
          ${orderedTeams.map((t, i) => `<div style="display:flex;align-items:center;gap:.5rem;font-size:.82rem;padding:.3rem .5rem;background:var(--surface2);border-radius:5px">
            <span style="font-weight:900;color:var(--accent);min-width:1.2rem">${i + 1}.</span>
            <span style="flex:1">${t.name}</span>
            <span style="color:var(--muted);font-size:.75rem">kpt: ${t.captain?.name || '—'}</span>
          </div>`).join('')}
        </div>
      </div>
      <button onclick="openCaptainNotifModal('${eventId}')"
        style="width:100%;margin-top:.5rem;background:rgba(114,137,218,.12);border:1px solid #7289da;color:#7289da;border-radius:6px;padding:.45rem;cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:.4rem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
        Powiadom kapitanów na Discord
      </button>` : '';
  }
}
function shufflePickOrder(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !(ev.teams||[]).length) return;
  const n = ev.teams.length;
  // Fisher-Yates shuffle of indices
  const order = Array.from({length: n}, (_, i) => i);
  for(let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  ev._pickOrder = order;
  refreshStartDraftModal(eventId);
  showToast('🎲 Kolejność wylosowana!', 'success');
}
async function confirmStartDraft() {
  const eventId  = document.getElementById('start-draft-eventid').value;
  const method   = document.getElementById('start-draft-method').value || 'snake';
  const numTeams  = +(document.getElementById('start-draft-numteams')?.value || 4);
  const perTeam   = +(document.getElementById('start-draft-perteam')?.value || 5);
  const timerSecs = +(document.getElementById('start-draft-timer')?.value || 120);
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;

  // Apply custom pick order if set — reorder ev.teams accordingly
  if(ev._pickOrder && ev._pickOrder.length === ev.teams.length) {
    ev.teams = ev._pickOrder.map(i => ev.teams[i]);
    delete ev._pickOrder;
  }

  ev.numTeams = numTeams;

  // Recalculate draftPool/Order with chosen method (captains already set)
  const captainIds = new Set((ev.teams||[]).map(t => t.captain?.id).filter(Boolean));
  // n = actual number of teams (may differ from numTeams selector if captains were assigned differently)
  const n = ev.teams.length || numTeams;

  // Compute OVR for all players upfront so it's persisted to KV and visible in draft-watch.html
  const _draftEnriched = _dsComputeOvr(ev.players||[], {});
  const _draftOvrMap = {};
  _draftEnriched.forEach(ep => { _draftOvrMap[ep.id] = ep.ovr; });
  const _applyOvr = p => (p && _draftOvrMap[p.id]) ? {...p, ovr: _draftOvrMap[p.id]} : p;
  ev.teams.forEach(t => { if(t.captain) t.captain = _applyOvr(t.captain); });

  if(method === 'random') {
    const maxPicks = n * (perTeam - 1);
    const remaining = (ev.players||[]).filter(p => !captainIds.has(p.id)).map(_applyOvr).sort(() => Math.random() - 0.5).slice(0, maxPicks);
    ev.perTeam = perTeam;
    remaining.forEach((p, i) => ev.teams[i % n].players.push(p));
    ev.draftPool = [];
    ev.draftMethod = method;
    ev.status = 'active';
    await saveData();
    document.getElementById('start-draft-modal').classList.remove('open');
    renderEvents();
    openEventDetail(eventId);
    showToast('🎲 Gracze losowo przydzieleni!', 'success');
    return;
  }

  if(method === 'balanced') {
    const remaining = (ev.players||[]).filter(p => !captainIds.has(p.id)).map(_applyOvr);
    const scored = remaining.map(p => {
      const pm = matches.filter(m => [...(m.team1.players||[]),...(m.team2.players||[])].some(x => x.name === p.name));
      if(!pm.length) return { p, score: 0 };
      const stats = pm.reduce((acc, m) => {
        const pl = [...(m.team1.players||[]),...(m.team2.players||[])].find(x => x.name === p.name);
        if(pl) { acc.pts+=pl.pts||0; acc.reb+=pl.reb||0; acc.ast+=pl.ast||0; acc.stl+=pl.stl||0; acc.blk+=pl.blk||0; acc.gp++; }
        return acc;
      }, {pts:0,reb:0,ast:0,stl:0,blk:0,gp:0});
      const gp = stats.gp||1;
      return { p, score: (stats.pts/gp)*.4+(stats.reb/gp)*.2+(stats.ast/gp)*.2+(stats.stl/gp)*.1+(stats.blk/gp)*.1 };
    }).sort((a,b) => b.score-a.score);
    const maxPicks = n * (perTeam - 1);
    const limitedScored = scored.slice(0, maxPicks);
    const assignOrder = buildDraftOrder('snake', n, limitedScored.length);
    ev.perTeam = perTeam;
    // Reset teams to only captains first
    ev.teams.forEach(t => { t.players = [t.captain]; });
    limitedScored.forEach(({p}, i) => ev.teams[assignOrder[i]].players.push(p));
    ev.draftPool = [];
    ev.draftMethod = method;
    ev.status = 'active';
    await saveData();
    document.getElementById('start-draft-modal').classList.remove('open');
    renderEvents();
    openEventDetail(eventId);
    showToast('⚖️ Drużyny zbalansowane!', 'success');
    return;
  }

  // Snake or Linear — start interactive draft
  ev.teams.forEach(t => { t.players = [t.captain]; }); // reset to captains only
  ev.perTeam = perTeam;
  const maxPicks = n * (perTeam - 1); // captains already in teams, so perTeam-1 picks per team
  const allPool = (ev.players||[]).filter(p => !captainIds.has(p.id)).map(_applyOvr);
  ev.draftPool = allPool.slice(0, maxPicks); // limit pool to exactly what's needed
  ev.draftPoolExcluded = allPool.slice(maxPicks); // track who didn't make the draft
  ev.draftTurn = 0;
  ev.draftOrder = buildDraftOrder(method, n, ev.draftPool.length);
  ev.draftMethod = method;
  ev.timerSecs = timerSecs;
  ev.timerEnd = null;
  ev.draftPaused = true;
  ev.status = 'draft';
  await saveData();
  await _evdInit(ev);
  document.getElementById('start-draft-modal').classList.remove('open');
  renderEvents();
  openDraftView(eventId);
}
function updateDraftMethodDesc() {
  const descs = {
    snake:    'Kapitanowie wybierają graczy po kolei, odwracając kolejność co rundę (A→B→C→D→D→C→B→A). Najbardziej sprawiedliwa metoda.',
    linear:   'Kapitanowie wybierają w stałej kolejności (A→B→C→D→A→B→C→D...). Prosta, ale faworyzuje pierwsze drużyny.',
    random:   'Gracze są losowo przydzielani do drużyn. Brak interaktywnego wyboru — draft kończy się od razu.',
    balanced: 'Gracze przydzielani automatycznie wg statystyk z ligi — najlepsi rozłożeni równomiernie między drużyny.',
  };
  const sel = document.getElementById('start-draft-method');
  const desc = document.getElementById('draft-method-desc');
  if(sel && desc) desc.textContent = descs[sel.value] || '';
}
function stopDraftPolling() {
  if(_draftPollInterval) { clearInterval(_draftPollInterval); _draftPollInterval = null; }
}
function startDraftTimer(endsAt, eventId) {
  if(_draftTimerInterval) clearInterval(_draftTimerInterval);
  _draftTimerEventId = eventId || _draftTimerEventId;
  _draftTimerFired = false;
  const el = document.getElementById('draft-timer-display');
  if(!endsAt) return;

  const initialLeft = Math.round((new Date(endsAt) - Date.now()) / 1000);
  // If already expired on load, just show 00:00, don't autopick
  if(initialLeft <= 0) {
    if(el) { el.textContent = '00:00'; el.style.color = '#f87171'; }
    return;  // _draftTimerFired stays false — no autopick on reload
  }

  _draftTimerInterval = setInterval(() => {
    const rawLeft = (new Date(endsAt) - Date.now()) / 1000;
    const left = Math.max(0, Math.round(rawLeft));
    const mm = String(Math.floor(left/60)).padStart(2,'0');
    const ss = String(left%60).padStart(2,'0');
    if(el) {
      el.textContent = mm + ':' + ss;
      el.style.color = left <= 10 ? '#f87171' : left <= 30 ? '#fb923c' : '#f5c518';
    }
    // Trigger autopick exactly once when timer hits 0
    if(rawLeft <= 0 && !_draftTimerFired) {
      _draftTimerFired = true;
      clearInterval(_draftTimerInterval);
      // Only admin triggers autopick to avoid race condition
      if(false && _draftTimerEventId && _isEventsAdminSync()) { // auto-pick wykonuje Worker po upływie czasu
        const ev = events.find(e => e.id === _draftTimerEventId);
        if(ev && ev.status === 'draft' && ev.draftPool?.length && !ev.draftPaused) {
          console.log('[Timer] Auto-pick triggered for', ev.draftPool[0].name);
          draftPickPlayer(_draftTimerEventId, ev.draftPool[0].id);
        }
      }
    }
  }, 500);
}
function startDraftPolling(eventId) {
  stopDraftPolling();
  if(!workerUrl) return;
  _draftPollInterval = setInterval(async () => {
    const overlay = document.getElementById('draft-overlay');
    if(!overlay || overlay.style.display === 'none') { stopDraftPolling(); return; }
    if(document.visibilityState !== 'visible') return;
    const st = await _evdFetch(eventId);
    const ev = events.find(e => e.id === eventId);
    if(!st || !ev) return;
    if(_evdApply(ev, st) || st.v !== ev._evdVrendered) { ev._evdVrendered = st.v; _evdRefreshViews(eventId); }
  }, 3000);
}
function openDraftView(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  document.getElementById('event-detail-modal').classList.remove('open');

  // Use a full-screen overlay for draft
  let overlay = document.getElementById('draft-overlay');
  if(!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'draft-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;overflow-y:auto;padding:1rem';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'block';
  renderDraftView(eventId);
  startDraftPolling(eventId);
  const _ev = events.find(e=>e.id===eventId);
  if(_ev?.timerEnd && !_ev?.draftPaused) startDraftTimer(_ev.timerEnd, eventId);
  _evdFetch(eventId).then(st => { const ev = events.find(e => e.id === eventId); if(st && ev) { _evdApply(ev, st); _evdRefreshViews(eventId); } });
}
function renderDraftView(eventId) {
  const ev = events.find(e => e.id === eventId);
  const overlay = document.getElementById('draft-overlay');
  if(!ev || !overlay) return;

  // Build OVR lookup by player id for pool and picked players
  const _allDraftPlayers = [
    ...(ev.draftPool||[]),
    ...(ev.teams||[]).flatMap(t => t.players||[])
  ];
  const _draftOvrEnriched = _dsComputeOvr(_allDraftPlayers, {});
  const _draftOvrById = {};
  _draftOvrEnriched.forEach(p => { _draftOvrById[p.id] = p.ovr; });
  const _getOvr = (p) => _draftOvrById[p.id] ?? p.ovr;

  const pool = (ev.draftPool || []).map(p => ({...p, ovr: _getOvr(p)}));
  const order = ev.draftOrder || [];
  const turn = ev.draftTurn || 0;
  const notStarted = ev.status === 'closed' && order.length === 0;
  const isDone = !notStarted && (ev.status !== 'draft' || (order.length > 0 && turn >= order.length));
  const currentTeamIdx = (isDone || notStarted) ? -1 : order[turn];
  const currentTeam = (isDone || notStarted) ? null : (ev.teams[currentTeamIdx] || null);
  if(!isDone && !notStarted && !currentTeam) { console.warn('[Draft] currentTeamIdx', currentTeamIdx, 'out of range, teams:', ev.teams.length); }
  const isMyTurn = currentTeam && discordUser && currentTeam.captain?.id === discordUser.id;
  const isAdmin = _isEventsAdminSync();
  const isPaused = !!(ev.draftPaused && ev.status === 'draft');
  const lastPick = ev.lastPick || null;
  const perTeam = order.length ? (order.length / (ev.teams.length || 1)) | 0 : 0;

  function dvFlag() {
    return '<span style="display:inline-flex;align-items:center;vertical-align:middle;margin-left:2px"><svg width="20" height="13" viewBox="0 0 60 30" style="border-radius:2px;border:1px solid rgba(0,0,0,.2)" xmlns="http://www.w3.org/2000/svg"><clipPath id="dvuf"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#dvuf)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg></span>';
  }

  let topContentHtml = '';
  if(notStarted) {
    topContentHtml = `<div style="text-align:center;padding:2.5rem 2rem;background:#10131a;border:2px solid rgba(245,197,24,.3);border-radius:8px;margin-bottom:20px">
      <div style="font-size:2.5rem;margin-bottom:.5rem">⏳</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:#6b7080;letter-spacing:2px">OCZEKIWANIE NA START</div>
      <div style="color:#6b7080;margin-top:.5rem;font-size:.9rem">Kapitanowie zostali przypisani. Admin zaraz uruchomi draft.</div>
    </div>`;
  } else if(isDone) {
    topContentHtml = `<div style="text-align:center;padding:3rem 2rem;background:#10131a;border:2px solid #f5c518;border-radius:8px;margin-bottom:20px">
      <div style="font-size:2.5rem;margin-bottom:.5rem">🏆</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:2.5rem;font-weight:900;color:#f5c518;letter-spacing:2px">DRAFT ZAKOŃCZONY!</div>
      <div style="color:#6b7080;margin-top:.5rem;font-size:.9rem">Wszystkie drafty zostały wykonane</div>
      ${isAdmin ? `<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin-top:1rem">
        <button onclick="draftGrade('${eventId}')" class="btn btn-ghost">🤖 ${ev.draftGrades?.length ? 'Oceń ponownie' : 'Oceny draftu (AI)'}</button>
        <button onclick="finishDraft('${eventId}')" class="btn btn-primary">✅ Zatwierdź drużyny</button></div>` : ''}
      ${_draftGradesHtml(ev, true)}
    </div>`;
  } else if(isPaused) {
    topContentHtml = `<div style="text-align:center;padding:2.5rem 2rem;background:#10131a;border:2px solid rgba(245,197,24,.3);border-radius:8px;margin-bottom:20px">
      <div style="font-size:2.5rem;margin-bottom:.5rem">⏸️</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:#f5c518;letter-spacing:2px">DRAFT WSTRZYMANY</div>
      <div style="color:#6b7080;margin-top:.5rem;font-size:.9rem">Admin wstrzymał draft — pick #${turn + 1} z ${order.length}</div>
      ${isAdmin ? `<button onclick="draftPlay('${eventId}')" style="margin-top:1rem;background:#4ade80;border:none;color:#000;padding:.5rem 1.5rem;border-radius:8px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.95rem">&#9654; Uruchom draft</button>` : '<div style="color:#6b7080;font-size:.85rem;margin-top:.5rem">Poczekaj na admina...</div>'}
    </div>`;
  } else if(currentTeam) {
    const logoHtml = currentTeam.logoB64 ? `<img src="${currentTeam.logoB64}" style="width:100%;height:100%;object-fit:cover">` : (currentTeam.name||'?')[0];
    const round = Math.floor(turn / ev.teams.length) + 1;
    topContentHtml = `<div class="dv-otc" style="background:linear-gradient(135deg,#10131a,#161922);border:2px solid #f5c518;border-radius:8px;padding:16px 24px;display:flex;align-items:center;gap:20px;margin-bottom:20px;box-shadow:0 0 24px rgba(245,197,24,.08);flex-wrap:wrap">
      <div style="width:56px;height:56px;border-radius:50%;background:#1d2130;border:2px solid rgba(245,197,24,.3);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:22px;color:#f5c518;flex-shrink:0;overflow:hidden">${logoHtml}</div>
      <div>
        <div style="font-size:10px;color:#6b7080;text-transform:uppercase;letter-spacing:.12em">On the Clock</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:900;color:#f5c518;line-height:1">${currentTeam.name || '—'}</div>
        <div style="font-size:13px;color:#6b7080;margin-top:2px">Runda ${round} · Pick #${turn + 1} z ${order.length}</div>
        ${isMyTurn ? '<div style="font-size:.8rem;color:#4ade80;font-weight:700;margin-top:4px">👆 Twoja kolej! Kliknij gracza aby wybrać.</div>' : ''}
        ${isAdmin && !isMyTurn ? `<button onclick="adminPickFor('${eventId}')" style="margin-top:.4rem;background:transparent;border:1px solid #6b7080;color:#6b7080;border-radius:6px;padding:.2rem .6rem;font-size:.75rem;cursor:pointer;font-family:inherit">👑 Wybierz za kapitana</button>` : ''}
      </div>
      ${lastPick ? `<div style="background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.25);border-radius:8px;padding:8px 14px;font-size:13px;min-width:160px">
        <div style="font-size:10px;color:#6b7080;text-transform:uppercase;letter-spacing:.1em">Ostatni pick</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900;color:#4ade80">${lastPick.playerName || '—'}</div>
        <div style="font-size:11px;color:#6b7080;margin-top:2px">${lastPick.teamName || ''} · Pick #${lastPick.pickNum || ''}</div>
      </div>` : ''}
      ${ev.timerSecs ? `<div style="margin-left:auto;text-align:center">
        <div style="font-size:10px;color:#6b7080;text-transform:uppercase;letter-spacing:.1em">Czas</div>
        <div id="draft-timer-display" style="font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;color:#f5c518;line-height:1;min-width:100px;text-align:center">${isPaused ? '⏸️' : '—'}</div>
      </div>` : ''}
    </div>`;
  }

  // Historia picków: kolejność z draftOrder + gracze drużyn w kolejności dobierania
  const _pickLog = [];
  { const seen = {}; for(let k = 0; k < Math.min(turn, order.length); k++) { const ti = order[k], t = ev.teams[ti]; if(!t) continue;
      const picks = (t.players || []).filter(p => p.id !== t.captain?.id); const n = seen[ti] = (seen[ti] || 0); const pl = picks[n]; seen[ti] = n + 1;
      if(pl) _pickLog.push({ num: k + 1, team: t.name, name: pl.name, pos: pl.primaryPos || (pl.positions || [])[0] || '' }); } }
  const tickerHtml = _pickLog.length ? `<div class="dv-ticker">
    ${_pickLog.slice().reverse().map((x, i) => `<span class="dv-tk${i === 0 ? ' dv-tk-new' : ''}"><b>#${x.num}</b> ${_h(x.team)} → <span style="color:#e8eaf0;font-weight:800">${_h(x.name)}</span>${x.pos ? ` <span style="color:#f5c518;font-size:10px;font-weight:800">${x.pos}</span>` : ''}</span>`).join('')}
  </div>` : '';

  const canPick = !isDone && (isMyTurn || isAdmin);
  const _dp = window._dvPool = window._dvPool || { q: '', pos: '', sort: 'ovr' };
  let _lg = {}; try { _mpAgg(() => true, 'season').forEach(r => { _lg[_normNick(r.name)] = r; }); } catch(e) {}
  const _lgOf = p => _lg[_normNick(p.name)] || null;
  const _posOf = p => [p.primaryPos, ...(p.positions || [])].filter(Boolean);
  const poolShown = pool.filter(p => (!_dp.q || String(p.name).toLowerCase().includes(_dp.q.toLowerCase())) && (!_dp.pos || _posOf(p).includes(_dp.pos)))
    .sort((a, b) => _dp.sort === 'name' ? String(a.name).localeCompare(String(b.name)) : _dp.sort === 'ppg' ? ((_lgOf(b)?.ppg || 0) - (_lgOf(a)?.ppg || 0)) : ((b.ovr || 0) - (a.ovr || 0)));
  const _chip = (v, l) => `<button onclick="_dvPool.pos='${v}';renderDraftView('${eventId}')" class="dv-chip${_dp.pos === v ? ' on' : ''}">${l}</button>`;
  const poolHtml = `<div class="dv-pool">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;margin-bottom:.5rem;color:#e8eaf0">👥 DOSTĘPNI (${poolShown.length}${poolShown.length !== pool.length ? ' z ' + pool.length : ''})</div>
    <div style="display:flex;gap:.35rem;margin-bottom:.4rem">
      <input id="dv-q" value="${_h(_dp.q)}" placeholder="🔎 Szukaj gracza…" oninput="_dvPool.q=this.value;_dvPool.focus=true;clearTimeout(window._dvqT);window._dvqT=setTimeout(()=>renderDraftView('${eventId}'),200)" style="flex:1;min-width:0;background:#161922;border:1px solid rgba(245,197,24,.2);color:#e8eaf0;border-radius:6px;padding:.35rem .5rem;font-size:.8rem;font-family:inherit">
      <select onchange="_dvPool.sort=this.value;renderDraftView('${eventId}')" style="background:#161922;border:1px solid rgba(245,197,24,.2);color:#e8eaf0;border-radius:6px;padding:.3rem;font-size:.76rem;width:auto">
        <option value="ovr" ${_dp.sort === 'ovr' ? 'selected' : ''}>OVR</option><option value="ppg" ${_dp.sort === 'ppg' ? 'selected' : ''}>Punkty</option><option value="name" ${_dp.sort === 'name' ? 'selected' : ''}>A–Z</option>
      </select>
    </div>
    <div style="display:flex;gap:.25rem;flex-wrap:wrap;margin-bottom:.5rem">${_chip('', 'Wszyscy')}${['PG', 'SG', 'SF', 'PF', 'C'].map(x => _chip(x, x)).join('')}</div>
    <div style="display:flex;flex-direction:column;gap:.35rem;max-height:calc(100vh - 280px);overflow-y:auto">
      ${poolShown.map(p => `<div style="display:flex;align-items:center;gap:.5rem;background:#10131a;border-radius:8px;padding:.5rem .75rem;border:1px solid rgba(245,197,24,.1);${canPick ? 'cursor:pointer;transition:border-color .15s' : ''}"
        ${canPick ? `onclick="draftPickPlayer('${eventId}','${p.id}')" onmouseover="this.style.borderColor='#f5c518'" onmouseout="this.style.borderColor='rgba(245,197,24,.1)'"` : ''}>
        ${p.avatar ? `<img src="${p.avatar}" style="width:28px;height:28px;border-radius:50%">` : '<div style="width:28px;height:28px;border-radius:50%;background:#1d2130;display:flex;align-items:center;justify-content:center;font-size:14px">👤</div>'}
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:.9rem;color:#e8eaf0;display:flex;align-items:center;gap:.3rem">${p.name}${p.speaksEnglish ? dvFlag() : ''}</div>
          <div style="font-size:.7rem;margin-top:.1rem;display:flex;align-items:center;gap:.25rem">
            ${p.primaryPos ? `<span style="font-weight:900;color:#f5c518;background:rgba(245,197,24,.15);border-radius:4px;padding:.1rem .35rem">${p.primaryPos}</span>${p.positions?.filter(x=>x!==p.primaryPos).length ? '<span style="color:#6b7080;font-size:.68rem">' + p.positions.filter(x=>x!==p.primaryPos).join('·') + '</span>' : ''}` : p.positions?.length ? `<span style="color:#f5c518">${p.positions.join(' · ')}</span>` : ''}
            ${_lgOf(p) ? `<span style="color:#8a93a8;font-size:.66rem">· 📊 ${(Math.round(_lgOf(p).ppg * 10) / 10).toFixed(1)} pkt / ${_lgOf(p).gp} m.</span>` : ''}
          </div>
        </div>
        ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.8);border-radius:4px;padding:.1rem .35rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.8rem;flex-shrink:0">${p.ovr}</span>` : ''}
        ${canPick ? '<span style="color:#f5c518;font-size:.8rem;flex-shrink:0;font-weight:700">+ Pick</span>' : ''}
      </div>`).join('')}
      ${pool.length === 0 && !isDone ? '<div style="color:#6b7080;font-size:.85rem;padding:.5rem">Wszyscy gracze wybrani</div>' : poolShown.length === 0 ? '<div style="color:#6b7080;font-size:.85rem;padding:.5rem">Nikt nie pasuje do filtra</div>' : ''}
    </div>
  </div>`;

  const cols = Math.min(ev.teams.length, 4);
  const boardHtml = `<div class="dv-boardwrap">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;margin-bottom:.5rem;color:#e8eaf0">🏀 DRAFT BOARD</div>
    <div class="dv-board" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">
      ${(ev.teams||[]).map((t, ti) => {
        const isOtc = !isDone && ti === currentTeamIdx;
        const teamPicks = (t.players||[]).filter(p => p.id !== t.captain?.id).map(p => ({...p, ovr: _getOvr(p)}));
        const captainOvr = t.captain ? _getOvr(t.captain) : null;
        const logoHtml = t.logoB64 ? `<img src="${t.logoB64}" style="width:100%;height:100%;object-fit:cover">` : (t.name||'?')[0];
        const onlineStatus = (ev.gmOnline||[]).includes(t.captain?.id);
        return `<div style="background:#10131a;border:1px solid ${isOtc ? '#f5c518' : 'rgba(245,197,24,.15)'};border-radius:8px;overflow:hidden;${isOtc ? 'box-shadow:0 0 16px rgba(245,197,24,.2)' : ''}">
          <div style="background:#161922;padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(245,197,24,.15)">
            <div style="width:36px;height:36px;border-radius:50%;background:#1d2130;border:1.5px solid rgba(245,197,24,.2);display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:14px;color:#f5c518;flex-shrink:0;overflow:hidden">${logoHtml}</div>
            <div style="flex:1;min-width:0">
              <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8eaf0">${t.name}</div>
              ${isOtc ? '<div style="font-size:10px;font-weight:900;letter-spacing:1px;color:#f5c518">⏰ WYBIERA TERAZ</div>' : ''}
              <div style="font-size:11px;color:#6b7080;display:flex;align-items:center;gap:4px">
                <span style="width:6px;height:6px;border-radius:50%;background:${onlineStatus ? '#4ade80' : '#374151'};${onlineStatus ? 'box-shadow:0 0 6px #4ade80' : ''};display:inline-block;flex-shrink:0"></span>
                ${t.captain?.name || '—'}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid rgba(245,197,24,.08);min-height:38px">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:11px;padding:2px 6px;border-radius:4px;min-width:32px;text-align:center;background:rgba(245,197,24,.15);color:#f5c518">★</span>
            <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f5c518">${t.captain?.name || '—'}</div>
            ${captainOvr ? `<span style="background:${_dsOvrColor(captainOvr)};color:rgba(0,0,0,.8);border-radius:4px;padding:.1rem .3rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:10px">${captainOvr}</span>` : ''}
            <span style="font-size:11px;color:#f5c518;flex-shrink:0">kpt</span>
          </div>
          ${teamPicks.map((p, i) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.04);min-height:38px">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:11px;padding:2px 6px;border-radius:4px;min-width:32px;text-align:center;background:rgba(255,255,255,.06);color:#6b7080">${i+1}</span>
            <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8eaf0">${p.name}</div>
            ${p.positions?.length ? `<span style="font-size:10px;color:#f5c518;font-weight:700;flex-shrink:0">${p.positions.join('·')}</span>` : ''}
            ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.8);border-radius:4px;padding:.1rem .3rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:10px;flex-shrink:0">${p.ovr}</span>` : ''}
          </div>`).join('')}
          ${Array.from({length: Math.max(0, perTeam - teamPicks.length)}, () => `<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,.04);min-height:38px;opacity:.4">
            <span style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:11px;padding:2px 6px;border-radius:4px;min-width:32px;text-align:center;background:rgba(255,255,255,.04);color:#6b7080">—</span>
            <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;flex:1;color:#6b7080">—</div>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  const _gmOnlineNow = ev.gmOnline || [];
  const captainStatusHtml = isAdmin && (ev.teams||[]).length ? `
    <div style="background:#10131a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 16px;margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:.4rem">
        <div style="font-size:.68rem;font-weight:700;letter-spacing:2px;color:#6b7080;text-transform:uppercase">STATUS KAPITANÓW <span style="font-weight:400;letter-spacing:0">· odśwież aby zaktualizować</span></div>
        <div style="display:flex;gap:.4rem">
          <button onclick="dvPollCaptains(this,'${eventId}')" style="background:#1a1e2a;border:1px solid rgba(255,255,255,.12);color:#e8eaf0;border-radius:6px;padding:.25rem .7rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.76rem;cursor:pointer;letter-spacing:.5px">🔄 Odśwież</button>
          <button onclick="openCaptainNotifModal('${eventId}')" style="background:#1a1e2a;border:1px solid rgba(245,197,24,.35);color:#f5c518;border-radius:6px;padding:.25rem .7rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.76rem;cursor:pointer;letter-spacing:.5px">📣 Powiadom</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.4rem">
        ${(ev.teams||[]).map((t,i)=>{
          const isOn=_gmOnlineNow.includes(t.captain?.id);
          const ava=t.captain?.avatar?`<img src="${t.captain.avatar}" style="width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(255,255,255,.12);flex-shrink:0">`:'<div style="width:26px;height:26px;border-radius:50%;background:#1d2130;display:flex;align-items:center;justify-content:center;font-size:.65rem;flex-shrink:0">👤</div>';
          return `<div style="display:flex;align-items:center;gap:.5rem;padding:.45rem .65rem;background:#161922;border:1px solid rgba(255,255,255,.06);border-radius:6px">
            ${ava}
            <div style="flex:1;min-width:0">
              <div style="font-size:.8rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.captain?.name||'—'}</div>
              <div style="font-size:.66rem;color:#6b7080;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.name}</div>
            </div>
            <div style="display:flex;align-items:center;gap:.25rem;flex-shrink:0">
              <div id="dv-dot-${i}" style="width:7px;height:7px;border-radius:50%;background:${isOn?'#4ade80':'#4b5563'};box-shadow:${isOn?'0 0 5px #4ade80':'none'}"></div>
              <span id="dv-dotlbl-${i}" style="font-size:.66rem;color:${isOn?'#4ade80':'#6b7080'}">${isOn?'Online':'Offline'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  overlay.style.cssText = 'position:fixed;inset:0;background:#0a0c10;z-index:9999;overflow-y:auto;padding:0';
  overlay.innerHTML = `
    <style>
      .dv-ticker{display:flex;gap:.4rem;overflow-x:auto;padding:6px 2px 8px;margin:0 0 16px;scrollbar-width:thin}
      .dv-tk{flex-shrink:0;background:#10131a;border:1px solid rgba(245,197,24,.15);border-radius:999px;padding:4px 10px;font-size:12px;color:#8a93a8;white-space:nowrap}
      .dv-tk b{color:#f5c518;font-family:'Barlow Condensed',sans-serif}
      .dv-tk-new{border-color:#4ade80;background:rgba(74,222,128,.1);animation:dvnew 1.2s ease}
      @keyframes dvnew{0%{transform:scale(.8);opacity:0}100%{transform:scale(1);opacity:1}}
      .dv-chip{background:transparent;border:1px solid rgba(245,197,24,.2);color:#c9ced8;border-radius:999px;padding:.12rem .55rem;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit}
      .dv-chip.on{background:rgba(245,197,24,.15);border-color:#f5c518;color:#f5c518}
      .dv-main{display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:start}
      .dv-board{display:grid;gap:10px}
      .dv-tabs{display:none}
      .dv-bar{background:#10131a;border-bottom:2px solid #f5c518;padding:12px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:100;flex-wrap:wrap;padding-top:calc(12px + env(safe-area-inset-top,0px))}
      .dv-btns{margin-left:auto;display:flex;gap:.5rem;align-items:center}
      @media (max-width:820px){
        .dv-bar{padding:10px 12px;gap:8px;padding-top:calc(10px + env(safe-area-inset-top,0px))}
        .dv-bar .dv-title{font-size:16px!important;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .dv-btns{margin-left:0;width:100%;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px}
        .dv-btns button{flex-shrink:0;white-space:nowrap;font-size:.74rem!important;padding:.35rem .6rem!important}
        .dv-wrap{padding:12px!important}
        .dv-otc{padding:12px 14px!important;gap:12px!important;flex-wrap:wrap}
        .dv-otc #draft-timer-display{font-size:36px!important}
        .dv-tabs{display:flex;gap:.35rem;margin-bottom:12px;position:sticky;top:var(--dv-top,92px);z-index:50;background:#0a0c10;padding:4px 0}
        .dv-tabs button{flex:1;background:#10131a;border:1px solid rgba(245,197,24,.2);color:#8a93a8;border-radius:8px;padding:.5rem;font-weight:800;font-family:inherit;cursor:pointer}
        .dv-tabs button.on{background:#f5c518;color:#000;border-color:#f5c518}
        .dv-main{grid-template-columns:1fr}
        .dv-main.t-pool .dv-boardwrap,.dv-main.t-board .dv-pool{display:none}
        .dv-board{grid-template-columns:1fr!important}
        .dv-pool > div:last-child{max-height:none!important}
      }
    </style>
    <div class="dv-bar">
      <div style="width:8px;height:8px;border-radius:50%;background:${isDone||notStarted||isPaused?'#6b7080':'#4ade80'};${isDone||notStarted||isPaused?'':'animation:hpulse 1.5s infinite'};flex-shrink:0"></div>
      <div class="dv-title" style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:900;color:#f5c518;letter-spacing:.05em">🎯 DRAFT — ${ev.title}</div>
      <div style="font-size:12px;color:#6b7080;text-transform:uppercase;letter-spacing:.1em">${isDone ? 'ZAKOŃCZONY' : notStarted ? 'OCZEKIWANIE' : isPaused ? 'WSTRZYMANY' : 'LIVE'}</div>
      ${!isDone && (ev.teams||[]).length ? `<span style="font-size:.75rem;color:#6b7080">GM: <b style="color:${(ev.gmOnline||[]).length>=(ev.teams||[]).length?'#4ade80':'#f5c518'}">${(ev.gmOnline||[]).length}/${(ev.teams||[]).length}</b> online</span>` : ''}
      <div class="dv-btns">
        <button onclick="copyDraftWatchLink('${eventId}')" style="background:#10131a;border:1px solid rgba(245,197,24,.3);color:#6b7080;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem">🔗 Link</button>
        ${isAdmin ? `<button onclick="copyDraftOverlayLink('${eventId}')" style="background:#10131a;border:1px solid rgba(167,139,250,.35);color:#a78bfa;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem" title="Kopiuj link do overlaya Twitch/OBS">📺 Overlay</button>` : ''}
        ${isAdmin ? `<button onclick="copyGmLink('${eventId}')" style="background:#10131a;border:1px solid rgba(245,197,24,.3);color:#f5c518;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem" title="Kopiuj link GM z tokenem dla kapitanów">🎮 Link GM</button>` : ''}
        ${discordUser && (ev.teams||[]).some(t => t.captain?.id === discordUser.id) ? `<button onclick="openGMPanel('${eventId}')" style="background:#f5c518;border:none;color:#000;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700">🎮 Panel GM</button>` : ''}
        ${isAdmin && !isDone && !notStarted ? `<button onclick="${isPaused ? 'draftPlay' : 'draftPause'}('${eventId}')" style="background:${isPaused ? '#4ade80' : 'rgba(245,197,24,.15)'};border:1px solid ${isPaused ? '#4ade80' : 'rgba(245,197,24,.4)'};color:${isPaused ? '#000' : '#f5c518'};border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700">${isPaused ? '&#9654; Start' : '&#9646;&#9646; Pauza'}</button>` : ''}
        ${isAdmin && !isDone && !notStarted && turn > 0 ? `<button onclick="draftUndoPick('${eventId}')" style="background:#10131a;border:1px solid rgba(248,113,113,.4);color:#f87171;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit;font-size:.8rem" title="Cofnij ostatni pick">&#8617; Cofnij</button>` : ''}
        <button onclick="stopDraftPolling();document.getElementById('draft-overlay').style.display='none';openEventDetail('${eventId}')" style="background:#10131a;border:1px solid rgba(255,255,255,.1);color:#6b7080;border-radius:6px;padding:.4rem .8rem;cursor:pointer;font-family:inherit">&#x2715; Zamknij</button>
      </div>
    </div>
    <div class="dv-wrap" style="max-width:1400px;margin:0 auto;padding:20px;color:#e8eaf0;font-family:'Barlow',sans-serif">
      ${topContentHtml}
      ${window._evdLastErr ? `<div style="background:rgba(220,38,38,.12);border:1px solid rgba(220,38,38,.5);border-radius:8px;padding:8px 12px;margin:-6px 0 14px;font-size:13px;color:#fca5a5">❌ Ostatni pick się nie udał (${window._evdLastErr.at}): <b>${_h(window._evdLastErr.msg)}</b> <a href="#" onclick="window._evdLastErr=null;renderDraftView('${eventId}');return false" style="color:#fca5a5;margin-left:6px">✕</a></div>` : ''}
    ${isAdmin ? `<details style="margin:-6px 0 14px;font-size:12px;color:#8a93a8"><summary style="cursor:pointer">🩺 Diagnostyka draftu</summary>
      <div style="background:#10131a;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;margin-top:6px;line-height:1.7">
        Tura serwera: <b style="color:#e8eaf0">${(ev.draftTurn || 0) + 1} / ${order.length}</b> · wybiera: <b style="color:#e8eaf0">${_h(ev.teams?.[order[ev.draftTurn || 0]]?.name || '—')}</b> (kapitan ID ${_h(ev.teams?.[order[ev.draftTurn || 0]]?.captain?.id || '—')})<br>
        Pauza: <b style="color:#e8eaf0">${ev.draftPaused ? 'tak' : 'nie'}</b> · timer: <b style="color:#e8eaf0">${ev.timerEnd ? new Date(ev.timerEnd).toLocaleTimeString('pl-PL') : '—'}</b> · w puli: <b style="color:#e8eaf0">${(ev.draftPool || []).length}</b> · wersja stanu: ${ev._evdV ?? '—'}<br>
        Ty: ${discordUser ? `${_h(discordUser.name)} (${_h(discordUser.id)})` : 'niezalogowany przez Discord'} · rola: <b style="color:#e8eaf0">${_isLoggedInSync() ? 'admin' : _isEventsAdminSync() ? 'event manager' : 'gracz'}</b>
        <div style="margin-top:4px"><button onclick="_evdFetch('${eventId}').then(st=>{const e=events.find(x=>x.id==='${eventId}'); if(st&&e){_evdApply(e,st);} renderDraftView('${eventId}'); showToast(st?'🔄 Stan pobrany z serwera':'⚠️ Brak stanu draftu na serwerze', st?'success':'error');})" class="btn btn-ghost" style="font-size:11px;padding:2px 8px">🔄 Pobierz stan z serwera</button></div>
      </div></details>` : ''}
    ${tickerHtml}
      ${(isDone || notStarted)
        ? boardHtml
        : `<div class="dv-tabs"><button class="${(window._dvTab || 'pool') === 'pool' ? 'on' : ''}" onclick="window._dvTab='pool';renderDraftView('${eventId}')">👥 Dostępni (${pool.length})</button><button class="${window._dvTab === 'board' ? 'on' : ''}" onclick="window._dvTab='board';renderDraftView('${eventId}')">🏀 Tablica</button></div>
           <div class="dv-main t-${window._dvTab || 'pool'}">${poolHtml}${boardHtml}</div>`}
      ${captainStatusHtml}
    </div>`;
  if(window._dvPool?.focus) { window._dvPool.focus = false; const q = document.getElementById('dv-q'); if(q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } } // tylko po wpisaniu, nie przy odświeżaniu
  const bar = overlay.querySelector('.dv-bar'); if(bar) overlay.style.setProperty('--dv-top', bar.offsetHeight + 'px');
}
function _evdApply(ev, st) {
  try { _dnOnEvd(ev, st); } catch(e) {}
  if(!ev || !st) return false;
  const before = JSON.stringify([ev.draftTurn, ev.draftPaused, ev.timerEnd, (ev.gmOnline || []).join()]);
  _EVD_FIELDS.forEach(k => { if(st[k] !== undefined) ev[k] = st[k]; });
  ev._evdV = st.v;
  return before !== JSON.stringify([ev.draftTurn, ev.draftPaused, ev.timerEnd, (ev.gmOnline || []).join()]);
}
function _evdState(ev) {
  let ovr = {}; try { _dsComputeOvr([...(ev.draftPool || []), ...(ev.teams || []).flatMap(t => t.players || [])], {}).forEach(p => { ovr[p.id] = p.ovr; }); } catch(e) {}
  return { teams: ev.teams || [], draftPool: (ev.draftPool || []).map(p => ({ ...p, ovr: ovr[p.id] ?? p.ovr })), draftOrder: ev.draftOrder || [],
    draftTurn: ev.draftTurn || 0, draftPaused: ev.draftPaused !== false, timerSecs: ev.timerSecs || 0, lastPick: ev.lastPick || null, forbid: ev.forbid || {} };
}
async function _evdInit(ev) {
  const r = await _api('/ev-draft/admin', 'POST', { eventId: ev.id, action: 'init', state: _evdState(ev) }, { admin: true });
  if(r.ok) _evdApply(ev, r.state); else showToast('❌ Draft: ' + (r.error || 'błąd startu'), 'error');
  return r.ok;
}
async function _evdAdmin(eventId, action) {
  const ev = events.find(e => e.id === eventId); if(!ev) return null;
  let r = await _api('/ev-draft/admin', 'POST', { eventId, action }, { admin: true });
  if(!r.ok && /nie jest uruchomiony/.test(r.error || '') && action !== 'clear') { if(await _evdInit(ev)) r = await _api('/ev-draft/admin', 'POST', { eventId, action }, { admin: true }); } // draft sprzed aktualizacji
  if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return null; }
  if(r.state) _evdApply(ev, r.state);
  return r;
}
async function _evdFetch(eventId) {
  try { const r = await _api('/ev-draft?id=' + encodeURIComponent(eventId), 'GET', null, { session: !!discordUser?.session }); return r.ok ? r.state : null; } catch(e) { return null; }
}
// wspólne odświeżanie widoku draftu i panelu GM po zmianie stanu
function _evdRefreshViews(eventId) {
  const ev = events.find(e => e.id === eventId); if(!ev) return;
  const ov = document.getElementById('draft-overlay');
  if(ov && ov.style.display !== 'none') renderDraftView(eventId);
  if(document.getElementById('gm-panel-modal')?.classList.contains('open') && window._gmPanelEventId === eventId) renderGMPanel(eventId);
  if(ev.timerEnd && !ev.draftPaused) { startDraftTimer(ev.timerEnd, eventId); if(typeof startGMTimer === 'function') startGMTimer(ev.timerEnd, eventId); }
  else if(_draftTimerInterval) clearInterval(_draftTimerInterval);
}
async function draftPickPlayer(eventId, playerId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const isAdmin = _isEventsAdminSync();
  if(!discordUser?.session && !isAdmin) { showToast('Zaloguj się przez Discord, żeby wybierać graczy', 'info'); loginWithDiscord(eventId); return; }
  const send = () => _api('/ev-draft/pick', 'POST', { eventId, playerId, expectTurn: ev.draftTurn || 0 }, { session: !!discordUser?.session, admin: isAdmin });
  let r = await send();
  if(!r.ok && /nie jest uruchomiony/.test(r.error || '') && isAdmin) { if(await _evdInit(ev)) r = await send(); } // draft rozpoczęty przed aktualizacją
  if(r.state) _evdApply(ev, r.state);
  window._evdLastErr = r.ok ? null : { msg: r.error || ('HTTP ' + r.status), at: new Date().toLocaleTimeString('pl-PL'), status: r.status };
  if(!r.ok) showToast('❌ ' + (r.error || 'Nie udało się wybrać'), 'error');
  else if(ev.lastPick) showToast(`✅ ${ev.lastPick.teamName} wybiera ${ev.lastPick.playerName}`, 'success');
  _evdRefreshViews(eventId);
  renderEvents();
}
async function adminPickFor(eventId) {
  // admin wybiera za kapitana: najlepszy dostępny (OVR + brakująca pozycja) — liczy Worker
  await draftPickPlayer(eventId, 'best');
}
function _showGMAuthPrompt(eventId, message) {
  const msg = message || 'Potrzebujesz hasła draftu aby pickować. Poproś admina o link GM lub wpisz hasło poniżej.';
  document.getElementById('gm-auth-overlay')?.remove();
  const div = document.createElement('div');
  div.id = 'gm-auth-overlay';
  div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:20000;display:flex;align-items:center;justify-content:center;padding:1rem';
  div.innerHTML = `<div style="background:#0f1117;border:1.5px solid rgba(245,197,24,.5);border-radius:14px;padding:1.5rem 1.75rem;max-width:400px;width:100%;box-shadow:0 0 40px rgba(245,197,24,.12)">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:#f5c518;margin-bottom:.5rem">🔐 Hasło draftu</div>
    <div style="font-size:.83rem;color:#9ca3af;margin-bottom:1.1rem;line-height:1.5">${msg}</div>
    <input type="password" id="gm-auth-pwd-input" placeholder="Wpisz hasło draftu..." autocomplete="current-password"
      style="width:100%;box-sizing:border-box;background:#161922;border:1px solid rgba(245,197,24,.35);color:#e8eaf0;border-radius:8px;padding:.6rem .85rem;font-size:1rem;font-family:inherit;margin-bottom:.75rem;outline:none"
      onkeydown="if(event.key==='Enter')_submitGMAuth('${eventId}')">
    <div style="display:flex;gap:.5rem">
      <button id="gm-auth-submit-btn" onclick="_submitGMAuth('${eventId}')" style="flex:1;background:#f5c518;border:none;color:#000;border-radius:8px;padding:.65rem;font-weight:900;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;letter-spacing:.5px">ZATWIERDŹ</button>
      <button onclick="document.getElementById('gm-auth-overlay').remove()" style="background:#1a1e2a;border:1px solid rgba(255,255,255,.12);color:#6b7080;border-radius:8px;padding:.65rem 1rem;cursor:pointer;font-family:inherit;font-size:.9rem">Anuluj</button>
    </div>
    <div id="gm-auth-error" style="color:#f87171;font-size:.8rem;margin-top:.55rem;display:none"></div>
  </div>`;
  document.body.appendChild(div);
  setTimeout(() => div.querySelector('input')?.focus(), 60);
}
async function _submitGMAuth(eventId) {
  const val = document.getElementById('gm-auth-pwd-input')?.value?.trim();
  if(!val) return;
  const errEl = document.getElementById('gm-auth-error');
  const btn = document.getElementById('gm-auth-submit-btn');
  if(btn) { btn.textContent = '⏳ Sprawdzam...'; btn.disabled = true; }
  try {
    const res = await fetch(workerUrl.replace(/\/$/,'') + '/auth', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ token: val, site: 'events' })
    });
    const data = await res.json();
    if(data.ok) {
      localStorage.setItem('nba2k_events_token_hash', val);
      localStorage.setItem('nba2k_events_auth', 'ok');
      document.getElementById('gm-auth-overlay')?.remove();
      await _openGMPanelCore(eventId);
    } else {
      if(errEl) { errEl.textContent = '❌ Nieprawidłowe hasło. Spróbuj ponownie.'; errEl.style.display = 'block'; }
      if(btn) { btn.textContent = 'ZATWIERDŹ'; btn.disabled = false; }
    }
  } catch(e) {
    if(errEl) { errEl.textContent = '❌ Błąd połączenia. Sprawdź internet.'; errEl.style.display = 'block'; }
    if(btn) { btn.textContent = 'ZATWIERDŹ'; btn.disabled = false; }
  }
}
async function _gmSetDraftPwd(eventId) {
  await _showGMAuthPrompt(eventId, null);
}
async function pingGmPresence(teamId) { /* obecność liczy Worker z odpytywania /ev-draft (bez zapisów do bazy) */ }
async function fetchGmPresence() {
  if(!workerUrl) return {};
  try {
    const r = await fetch(workerUrl.replace(/\/$/,'') + '/gm-presence', { cache: 'no-store' });
    if(r.ok) return await r.json();
  } catch(e) {}
  return {};
}
async function dvPollCaptains(btn, eventId) {
  if(btn) { btn.textContent='⏳'; btn.disabled=true; }
  const ev = events.find(e=>e.id===eventId);
  if(!ev) { if(btn){btn.textContent='🔄 Odśwież';btn.disabled=false;} return; }
  try {
    const presence = await fetchGmPresence();
    const now = Date.now();
    if(!ev.gmOnline) ev.gmOnline = [];
    (ev.teams||[]).forEach((t,i)=>{
      const captId = t.captain?.id;
      const p = presence[captId] || null;
      const isOn = !!(p && (now - p.ts) < 30000);
      if(isOn && !ev.gmOnline.includes(captId)) ev.gmOnline.push(captId);
      else if(!isOn) ev.gmOnline = ev.gmOnline.filter(id => id !== captId);
      const dot = document.getElementById('dv-dot-'+i);
      const lbl = document.getElementById('dv-dotlbl-'+i);
      if(dot){ dot.style.background=isOn?'#4ade80':'#4b5563'; dot.style.boxShadow=isOn?'0 0 5px #4ade80':'none'; }
      if(lbl){ lbl.textContent=isOn?'Online':'Offline'; lbl.style.color=isOn?'#4ade80':'#6b7080'; }
    });
  } catch(e) {}
  if(btn) { btn.textContent='🔄 Odśwież'; btn.disabled=false; }
}
async function draftUndoPick(eventId) {
  const r = await _evdAdmin(eventId, 'undo');
  if(r) { _evdRefreshViews(eventId); showToast('↩ Cofnięto ostatni pick', 'info'); }
}
async function draftPlay(eventId) {
  if(await _evdAdmin(eventId, 'play')) _evdRefreshViews(eventId);
}
async function draftPause(eventId) {
  if(await _evdAdmin(eventId, 'pause')) { if(_draftTimerInterval) clearInterval(_draftTimerInterval); _evdRefreshViews(eventId); }
}
async function openGMPanel(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !discordUser) return;
  const myTeam = (ev.teams||[]).find(t => t.captain?.id === discordUser.id);
  if(!myTeam) { showToast('❌ Nie jesteś kapitanem w tym drafcie', 'error'); return; }
  if(!['open','closed','draft','active'].includes(ev.status)) { showToast('❌ Draft jeszcze nie jest gotowy', 'error'); return; }
  await _openGMPanelCore(eventId);
}
async function _openGMPanelCore(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !discordUser) return;
  const myTeam = (ev.teams||[]).find(t => t.captain?.id === discordUser.id);
  // Auto-apply events token from event data so captains can pick without entering a password
  if(false && ev.eventsToken) { // wyłączone: token nie może pochodzić z publicznych danych
    localStorage.setItem('nba2k_events_token_hash', ev.eventsToken);
    localStorage.setItem('nba2k_events_auth', 'ok');
  }
  // Ping presence immediately — no token needed
  pingGmPresence(myTeam?.id || discordUser.id);
  window._gmPanelEventId = eventId;
  renderGMPanel(eventId);
  document.getElementById('gm-panel-modal').classList.add('open');
  startGMPolling(eventId);
  _evdFetch(eventId).then(st => { if(st) { _evdApply(ev, st); renderGMPanel(eventId); if(ev.timerEnd && !ev.draftPaused) startGMTimer(ev.timerEnd, eventId); } });
}
function closeGMPanel(eventId) {
  document.getElementById('gm-panel-modal').classList.remove('open');
  clearInterval(_gmPollInterval);
  const modalEl = document.querySelector('#gm-panel-modal .modal');
  if(modalEl) { modalEl.style.background = ''; modalEl.style.border = ''; modalEl.style.color = ''; }
  // Presence expires naturally after 30s — no token-dependent save needed
}
function renderGMPanel(eventId) {
  const ev = events.find(e => e.id === eventId);
  if(!ev || !discordUser) return;
  const myTeam = (ev.teams||[]).find(t => t.captain?.id === discordUser.id);
  if(!myTeam) return;

  const modalEl = document.querySelector('#gm-panel-modal .modal');
  if(modalEl) { modalEl.style.background = '#0f1117'; modalEl.style.border = '1.5px solid rgba(245,197,24,.3)'; modalEl.style.color = '#e8eaf0'; }
  const closeBtn = document.getElementById('gm-panel-close-btn');
  if(closeBtn) closeBtn.style.color = '#6b7080';

  // State
  const _posF      = window._gmPosFilter || 'ALL';
  const _srchQ     = (window._gmSearchQuery||'').toLowerCase().trim();
  const _sortCol   = window._gmSortCol || 'ovr';
  const _sortDir   = window._gmSortDir || 'desc';
  const _view      = window._gmView || 'pool';
  const _confirmId = window._gmConfirmPickId || null;
  const _watchList = JSON.parse(localStorage.getItem('nba2k_gm_watch_' + eventId) || '[]');
  const _watchSet  = new Set(_watchList);
  const _pickQueue = JSON.parse(localStorage.getItem('nba2k_gm_queue_' + eventId) || '[]');

  // Enrich pool
  const _gmAllForEnrich = [...(ev.draftPool||[]), ...(ev.teams||[]).flatMap(t=>t.players||[])];
  const _gmStatsMap = {};
  _dsComputeOvr(_gmAllForEnrich, {}).forEach(p => { _gmStatsMap[p.id] = p; });
  const _eGM = p => p ? {...p, ..._gmStatsMap[p.id]} : p;

  // Sort
  const allPool = (ev.draftPool||[]).map(_eGM).sort((a, b) => {
    let av = _sortCol === 'name' ? (a.name||'').toLowerCase() : (a[_sortCol] ?? (_sortDir==='desc' ? -Infinity : Infinity));
    let bv = _sortCol === 'name' ? (b.name||'').toLowerCase() : (b[_sortCol] ?? (_sortDir==='desc' ? -Infinity : Infinity));
    if(av == null) av = _sortDir==='desc' ? -Infinity : Infinity;
    if(bv == null) bv = _sortDir==='desc' ? -Infinity : Infinity;
    return _sortDir === 'desc' ? (bv > av ? 1 : bv < av ? -1 : 0) : (av > bv ? 1 : av < bv ? -1 : 0);
  });

  // Filter
  const filteredPool = allPool.filter(p => {
    const okPos  = _posF==='ALL' || p.primaryPos===_posF || (p.positions||[]).includes(_posF);
    const okSrch = !_srchQ || p.name.toLowerCase().includes(_srchQ);
    return okPos && okSrch;
  });

  // View-specific list
  let viewPool;
  if(_view === 'watch') {
    viewPool = filteredPool.filter(p => _watchSet.has(p.id));
  } else if(_view === 'queue') {
    viewPool = _pickQueue.map(id => allPool.find(p => p.id === id)).filter(Boolean);
  } else {
    viewPool = filteredPool;
  }

  // Draft state
  const order          = ev.draftOrder || [];
  const turn           = ev.draftTurn || 0;
  const isDraftActive  = ev.status === 'draft';
  const isDone         = !isDraftActive || turn >= order.length;
  const currentTeamIdx = isDone ? -1 : order[turn];
  const isMyTurn       = isDraftActive && !isDone && ev.teams[currentTeamIdx]?.captain?.id === discordUser.id;
  const timerLeft      = ev.timerEnd ? Math.max(0, Math.round((new Date(ev.timerEnd) - Date.now()) / 1000)) : null;
  const myPicks        = (myTeam.players || []).filter(p => p.id !== myTeam.captain?.id);
  const perTeam        = Math.round(order.length / ev.teams.length);

  const firstQueuedId  = _pickQueue.find(id => allPool.find(p => p.id === id));

  function gmFlag() {
    return '<span style="display:inline-flex;align-items:center;vertical-align:middle;margin-left:2px"><svg width="20" height="13" viewBox="0 0 60 30" style="border-radius:2px;border:1px solid rgba(0,0,0,.2)" xmlns="http://www.w3.org/2000/svg"><clipPath id="gmuf"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" clip-path="url(#gmuf)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></svg></span>';
  }

  // Status card
  let statusCard = '';
  if(ev.draftPaused && isDraftActive) {
    statusCard = `<div style="background:#161922;border:1px solid rgba(245,197,24,.3);border-radius:10px;padding:1rem;margin-bottom:1rem;text-align:center">
      <div style="font-size:1.5rem;margin-bottom:.4rem">⏸️</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;color:#f5c518">Draft wstrzymany</div>
      <div style="font-size:.82rem;color:#6b7080;margin-top:.3rem">Admin wstrzymał draft. Poczekaj na wznowienie.</div>
    </div>`;
  } else if(ev.status === 'closed') {
    statusCard = `<div style="background:#161922;border:1px solid rgba(245,197,24,.2);border-radius:10px;padding:1rem;margin-bottom:1rem;text-align:center">
      <div style="font-size:1.5rem;margin-bottom:.4rem">⏳</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;color:#6b7080">Oczekiwanie na start draftu</div>
      <div style="font-size:.82rem;color:#6b7080;margin-top:.3rem">Admin zaraz uruchomi draft. Jesteś zalogowany — admin to widzi.</div>
    </div>`;
  } else if(isMyTurn) {
    const hasPickAuth = !!(localStorage.getItem('nba2k_admin_token_hash') || localStorage.getItem('nba2k_events_token_hash'));
    statusCard = `<div style="background:rgba(245,197,24,.08);border:2px solid #f5c518;border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem;text-align:center">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem;color:#f5c518">⏰ TWOJA KOLEJ! Pick ${turn + 1} z ${order.length}</div>
      ${timerLeft !== null ? `<div id="gm-timer-display" style="font-family:'Barlow Condensed',sans-serif;font-size:2.5rem;font-weight:900;color:${timerLeft <= 15 ? '#f87171' : timerLeft <= 30 ? '#fb923c' : '#f5c518'}">${String(Math.floor(timerLeft/60)).padStart(2,'0')}:${String(timerLeft%60).padStart(2,'0')}</div>` : ''}
      ${!hasPickAuth ? `<div style="margin-top:.6rem"><button onclick="_showGMAuthPrompt('${eventId}',null)" style="background:#f5c518;border:none;color:#000;border-radius:8px;padding:.45rem 1.2rem;font-weight:900;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:.95rem;letter-spacing:.5px">🔐 Podaj hasło aby pickować</button></div>` : ''}
    </div>`;
  } else {
    statusCard = `<div style="background:#161922;border:1px solid rgba(245,197,24,.15);border-radius:10px;padding:.7rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">
      <div style="color:#6b7080;font-size:.9rem">${isDone ? '🏆 Draft zakończony' : `Teraz wybiera: <b style="color:#e8eaf0">${ev.teams[currentTeamIdx]?.name || '—'}</b> · Pick ${turn + 1}/${order.length}`}</div>
      ${timerLeft !== null && !isDone ? `<div id="gm-timer-display" style="font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:${timerLeft <= 10 ? '#f87171' : timerLeft <= 30 ? '#fb923c' : '#e8eaf0'}">${String(Math.floor(timerLeft/60)).padStart(2,'0')}:${String(timerLeft%60).padStart(2,'0')}</div>` : ''}
    </div>`;
  }

  // Pick confirmation card
  const confirmPlayer = _confirmId ? allPool.find(p => p.id === _confirmId) : null;
  const confirmCard = confirmPlayer ? `
    <div style="background:rgba(245,197,24,.1);border:2px solid #f5c518;border-radius:10px;padding:.8rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
      <div style="flex:1;min-width:0">
        <div style="font-size:.68rem;color:#f5c518;font-weight:700;letter-spacing:.5px;margin-bottom:.2rem">POTWIERDZENIE PICKA</div>
        <div style="font-size:1rem;font-weight:900;color:#e8eaf0">${confirmPlayer.name}${confirmPlayer.speaksEnglish ? gmFlag() : ''}</div>
        <div style="font-size:.78rem;color:#6b7080">${confirmPlayer.primaryPos || (confirmPlayer.positions||[]).join('·') || '—'} · OVR ${confirmPlayer.ovr || '—'} · ${confirmPlayer.ppg||'—'} PPG / ${confirmPlayer.rpg||'—'} RPG / ${confirmPlayer.apg||'—'} APG</div>
        <div style="font-size:.75rem;color:#6b7080;margin-top:.1rem">${confirmPlayer.fgpct!=null?'FG '+confirmPlayer.fgpct+'%':'—'} · ${confirmPlayer.tppct!=null?'3PT '+confirmPlayer.tppct+'%':'—'} · ${confirmPlayer.spg!=null&&confirmPlayer.gp?confirmPlayer.spg+' SPG':'—'} · ${confirmPlayer.bpg!=null&&confirmPlayer.gp?confirmPlayer.bpg+' BPG':'—'}</div>
      </div>
      <div style="display:flex;gap:.5rem;flex-shrink:0">
        <button onclick="window._gmConfirmPickId=null;draftPickPlayer('${eventId}','${confirmPlayer.id}')" style="background:#f5c518;border:none;color:#000;border-radius:8px;padding:.5rem 1.1rem;font-weight:900;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:.9rem">✓ Potwierdź</button>
        <button onclick="window._gmConfirmPickId=null;renderGMPanel('${eventId}')" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);color:#e8eaf0;border-radius:8px;padding:.5rem .9rem;font-weight:700;cursor:pointer;font-size:.9rem">✗ Anuluj</button>
      </div>
    </div>` : '';

  // View tabs
  const watchCount = allPool.filter(p => _watchSet.has(p.id)).length;
  const queueCount = _pickQueue.filter(id => allPool.find(p => p.id === id)).length;
  const viewTabs = [
    {v:'pool',  label:`DOSTĘPNI (${filteredPool.length})`},
    {v:'watch', label:`OBSERWOWANI (${watchCount})`},
    {v:'queue', label:`KOLEJKA (${queueCount})`},
  ].map(({v, label}) => {
    const active = _view === v;
    return `<button onclick="window._gmView='${v}';renderGMPanel('${eventId}')" style="background:${active?'#f5c518':'rgba(245,197,24,.1)'};color:${active?'#000':'#f5c518'};border:none;border-radius:6px;padding:.28rem .65rem;cursor:pointer;font-size:.72rem;font-weight:700;font-family:inherit">${label}</button>`;
  }).join('');

  // Sort header helper — returns <th> HTML
  function sTh(col, label, align) {
    const active  = _sortCol === col;
    const newDir  = active && _sortDir === 'desc' ? 'asc' : 'desc';
    const arrow   = active ? (_sortDir === 'desc' ? ' ▼' : ' ▲') : '';
    const ta      = align || 'center';
    return `<th onclick="window._gmSortCol='${col}';window._gmSortDir='${newDir}';renderGMPanel('${eventId}')" style="text-align:${ta};padding:.35rem .3rem;color:${active?'#f5c518':'#6b7080'};font-size:.7rem;font-weight:700;cursor:pointer;user-select:none;white-space:nowrap">${label}${arrow}</th>`;
  }

  // Table rows
  const tableRows = viewPool.map(p => {
    const isConfirm   = p.id === _confirmId;
    const isWatched   = _watchSet.has(p.id);
    const queuePos    = _pickQueue.indexOf(p.id);
    const inQueue     = queuePos !== -1;
    const isNextQueue = isMyTurn && p.id === firstQueuedId;

    let bgBase = isConfirm ? 'rgba(245,197,24,.08)' : (isNextQueue ? 'rgba(245,197,24,.04)' : '');
    const trStyle = `border-bottom:1px solid rgba(255,255,255,.04);${bgBase?'background:'+bgBase+';':''}`;

    let clickAttr = '';
    if(isMyTurn) {
      if(isConfirm) {
        clickAttr = `onclick="window._gmConfirmPickId=null;renderGMPanel('${eventId}')" style="${trStyle}cursor:pointer" onmouseover="this.style.background='rgba(245,197,24,.12)'" onmouseout="this.style.background='${bgBase}'"`;
      } else {
        clickAttr = `onclick="window._gmConfirmPickId='${p.id}';renderGMPanel('${eventId}')" style="${trStyle}cursor:pointer" onmouseover="this.style.background='rgba(245,197,24,.06)'" onmouseout="this.style.background='${bgBase}'"`;
      }
    } else {
      clickAttr = `style="${trStyle}opacity:.75"`;
    }

    return `<tr ${clickAttr}>
      <td style="padding:.4rem .4rem;display:flex;align-items:center;gap:.4rem;min-width:0">
        ${p.avatar ? `<img src="${p.avatar}" style="width:22px;height:22px;border-radius:50%;flex-shrink:0">` : '<div style="width:22px;height:22px;border-radius:50%;background:#1d2130;flex-shrink:0"></div>'}
        <span style="font-weight:600;font-size:.83rem;color:${isConfirm?'#f5c518':'#e8eaf0'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}${p.speaksEnglish ? gmFlag() : ''}</span>
        ${isNextQueue ? '<span style="flex-shrink:0;font-size:.62rem;color:#f5c518;background:rgba(245,197,24,.15);border-radius:3px;padding:.05rem .2rem;margin-left:.2rem">NEXT</span>' : ''}
      </td>
      <td style="text-align:center;padding:.4rem .3rem">
        ${(() => {
          const allPos = p.positions?.length ? p.positions : (p.primaryPos ? [p.primaryPos] : (p.pos ? [p.pos] : []));
          const primary = p.primaryPos || (allPos[0] || '');
          if (!allPos.length) return '<span style="color:#6b7080">—</span>';
          return allPos.map(pos => {
            const isPri = pos === primary;
            return `<span style="font-weight:${isPri?900:700};color:${isPri?'#f5c518':'rgba(245,197,24,.45)'};background:${isPri?'rgba(245,197,24,.15)':'rgba(245,197,24,.05)'};border-radius:3px;padding:.1rem .28rem;font-size:${isPri?'.72':'.65'}rem;display:inline-block;margin:0 .5px;line-height:1.5">${pos}</span>`;
          }).join('');
        })()}
      </td>
      <td style="text-align:center;padding:.4rem .3rem;color:#6b7080;font-size:.8rem">${p.gp||'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;color:#e8eaf0;font-weight:700;font-size:.8rem">${p.ppg||'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;color:#e8eaf0;font-size:.8rem">${p.rpg||'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;color:#e8eaf0;font-size:.8rem">${p.apg||'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;color:#a78bfa;font-size:.78rem">${p.gp&&p.spg!=null?p.spg:'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;color:#60a5fa;font-size:.78rem">${p.gp&&p.bpg!=null?p.bpg:'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;font-size:.78rem;font-weight:600;color:${p.fgpct!=null?(p.fgpct>=50?'#4ade80':p.fgpct>=40?'#e8eaf0':'#f87171'):'#6b7080'}">${p.fgpct!=null?p.fgpct+'%':'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem;font-size:.78rem;font-weight:600;color:${p.tppct!=null?(p.tppct>=40?'#4ade80':p.tppct>=33?'#e8eaf0':'#f87171'):'#6b7080'}">${p.tppct!=null?p.tppct+'%':'—'}</td>
      <td style="text-align:center;padding:.4rem .3rem">
        ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.82);border-radius:4px;padding:.12rem .4rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.82rem;display:inline-block">${p.ovr}</span>` : '<span style="color:#6b7080">—</span>'}
      </td>
      <td style="text-align:center;padding:.35rem .2rem" onclick="event.stopPropagation();_gmToggleWatch('${eventId}','${p.id}')">
        <span style="cursor:pointer;font-size:.9rem;opacity:${isWatched?1:.3};user-select:none" title="${isWatched?'Usuń z obserwowanych':'Obserwuj'}">${isWatched?'★':'☆'}</span>
      </td>
      <td style="text-align:center;padding:.35rem .2rem" onclick="event.stopPropagation();_gmToggleQueue('${eventId}','${p.id}')">
        <span style="cursor:pointer;font-size:.75rem;font-weight:900;color:${inQueue?'#f5c518':'#6b7080'};background:${inQueue?'rgba(245,197,24,.15)':'rgba(255,255,255,.05)'};border-radius:3px;padding:.1rem .3rem;user-select:none" title="${inQueue?'Usuń z kolejki (poz. '+(queuePos+1)+')':'Dodaj do kolejki'}">${inQueue ? queuePos+1 : '+'}</span>
      </td>
      ${isMyTurn ? `<td style="text-align:center;padding:.35rem .2rem"><span style="color:${isConfirm?'#f87171':'#f5c518'};font-size:.72rem;font-weight:700;white-space:nowrap">${isConfirm?'✗ anuluj':'+ Pick'}</span></td>` : ''}
    </tr>`;
  }).join('');

  // Pick queue right panel
  const queueItems = _pickQueue.map((id, i) => {
    const p = allPool.find(pl => pl.id === id);
    if(!p) return '';
    return `<div style="display:flex;align-items:center;gap:.35rem;background:#161922;border:1px solid rgba(245,197,24,.15);border-radius:6px;padding:.32rem .55rem;margin-bottom:.18rem">
      <span style="font-size:.68rem;color:#6b7080;min-width:1rem;flex-shrink:0">${i+1}</span>
      <div style="flex:1;min-width:0;font-size:.78rem;color:#e8eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
      ${p.primaryPos ? `<span style="font-size:.66rem;color:#f5c518;flex-shrink:0">${p.primaryPos}</span>` : ''}
      ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.82);border-radius:3px;padding:.03rem .22rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.7rem;flex-shrink:0">${p.ovr}</span>` : ''}
      <span onclick="_gmMoveQueue('${eventId}','${id}',-1)" style="cursor:pointer;color:#6b7080;font-size:.75rem;padding:0 .1rem;flex-shrink:0;user-select:none" title="W górę">▲</span>
      <span onclick="_gmMoveQueue('${eventId}','${id}',1)" style="cursor:pointer;color:#6b7080;font-size:.75rem;padding:0 .1rem;flex-shrink:0;user-select:none" title="W dół">▼</span>
      <span onclick="_gmToggleQueue('${eventId}','${id}')" style="cursor:pointer;color:#f87171;font-size:.8rem;flex-shrink:0;user-select:none" title="Usuń">✕</span>
    </div>`;
  }).filter(Boolean).join('');

  document.getElementById('gm-panel-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.9rem;flex-wrap:wrap">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:2px;color:#f5c518">🎮 PANEL GM — ${myTeam.name}</div>
        <div style="font-size:.78rem;color:#6b7080">Kapitan: ${myTeam.captain?.name}</div>
      </div>
    </div>
    ${statusCard}
    ${confirmCard}
    <div style="display:grid;grid-template-columns:1fr 300px;gap:1.1rem;align-items:start">
      <!-- LEFT: Players table -->
      <div>
        <div style="display:flex;align-items:center;gap:.3rem;margin-bottom:.45rem;flex-wrap:wrap">
          <div style="display:flex;gap:.2rem;flex-shrink:0">${viewTabs}</div>
          <div style="display:flex;gap:.2rem;flex-shrink:0;margin-left:.25rem">
            ${['ALL','PG','SG','SF','PF','C'].map(pos => {
              const active = _posF === pos;
              return `<button onclick="window._gmPosFilter='${pos}';renderGMPanel('${eventId}')" style="background:${active?'rgba(245,197,24,.28)':'rgba(245,197,24,.06)'};color:${active?'#f5c518':'#6b7080'};border:1px solid ${active?'rgba(245,197,24,.45)':'transparent'};border-radius:4px;padding:.2rem .38rem;cursor:pointer;font-size:.7rem;font-weight:700;font-family:inherit">${pos}</button>`;
            }).join('')}
          </div>
          <input type="text" placeholder="Szukaj..." value="${_srchQ}"
            oninput="window._gmSearchQuery=this.value;renderGMPanel('${eventId}')"
            style="margin-left:auto;background:#161922;border:1px solid rgba(245,197,24,.2);color:#e8eaf0;border-radius:6px;padding:.22rem .5rem;font-size:.78rem;width:112px;font-family:inherit">
        </div>
        <div style="overflow-x:auto;overflow-y:auto;max-height:500px">
          <table style="width:100%;border-collapse:collapse;min-width:720px">
            <thead style="position:sticky;top:0;background:#0f1117;z-index:1">
              <tr style="border-bottom:1px solid rgba(245,197,24,.2)">
                ${sTh('name','GRACZ','left')}
                <th style="text-align:center;padding:.35rem .3rem;color:#6b7080;font-size:.7rem;font-weight:700">POS</th>
                ${sTh('gp','GP')}
                ${sTh('ppg','PPG')}
                ${sTh('rpg','RPG')}
                ${sTh('apg','APG')}
                ${sTh('spg','SPG')}
                ${sTh('bpg','BPG')}
                ${sTh('fgpct','FG%')}
                ${sTh('tppct','3PT%')}
                ${sTh('ovr','OVR')}
                <th style="text-align:center;padding:.35rem .2rem;color:#6b7080;font-size:.68rem;width:20px" title="Obserwuj">★</th>
                <th style="text-align:center;padding:.35rem .2rem;color:#6b7080;font-size:.68rem;width:20px" title="Kolejka">Q</th>
                ${isMyTurn ? '<th style="width:48px"></th>' : ''}
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          ${viewPool.length===0 ? `<div style="color:#6b7080;text-align:center;padding:1.5rem;font-size:.85rem">${_view==='watch'?'Brak obserwowanych graczy':_view==='queue'?'Kolejka jest pusta':'Brak graczy dla wybranego filtra'}</div>` : ''}
        </div>
      </div>
      <!-- RIGHT: Queue + My team + All teams -->
      <div>
        ${queueItems ? `<div style="margin-bottom:.9rem">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1px;margin-bottom:.35rem;color:#6b7080">KOLEJKA PICKÓW (${queueCount})</div>
          ${queueItems}
        </div>` : ''}
        <!-- My team -->
        <div style="margin-bottom:.9rem">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1px;margin-bottom:.35rem;color:#6b7080">MÓJ SKŁAD (${myPicks.length+1}/${perTeam+1})</div>
          <div style="display:flex;align-items:center;gap:.45rem;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.35);border-radius:8px;padding:.4rem .65rem;margin-bottom:.18rem">
            <span style="font-size:.68rem;font-weight:900;color:#f5c518;min-width:1.7rem">KPT</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:.83rem;font-weight:700;color:#f5c518;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${myTeam.captain?.name}</div>
              ${(_eGM(myTeam.captain||{})).primaryPos ? `<span style="font-size:.68rem;color:rgba(245,197,24,.6)">${(_eGM(myTeam.captain||{})).primaryPos}</span>` : ''}
            </div>
            ${(_eGM(myTeam.captain||{})).ovr ? `<span style="background:${_dsOvrColor((_eGM(myTeam.captain||{})).ovr)};color:rgba(0,0,0,.82);border-radius:4px;padding:.1rem .32rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.8rem;flex-shrink:0">${(_eGM(myTeam.captain||{})).ovr}</span>` : (myTeam.captain?.ovr ? `<span style="background:${_dsOvrColor(myTeam.captain.ovr)};color:rgba(0,0,0,.82);border-radius:4px;padding:.1rem .32rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.8rem;flex-shrink:0">${myTeam.captain.ovr}</span>` : '')}
          </div>
          ${myPicks.map((p,i) => `<div style="display:flex;align-items:center;gap:.45rem;background:#161922;border:1px solid rgba(245,197,24,.1);border-radius:8px;padding:.4rem .65rem;margin-bottom:.18rem">
            <span style="font-size:.68rem;color:#6b7080;min-width:1.7rem">#${i+1}</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:.8rem;font-weight:600;color:#e8eaf0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
              ${p.primaryPos ? `<span style="font-size:.68rem;color:#f5c518">${p.primaryPos}</span>` : (p.positions?.length ? `<span style="font-size:.68rem;color:#6b7080">${p.positions.join('·')}</span>` : '')}
            </div>
            ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.82);border-radius:4px;padding:.1rem .32rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.8rem;flex-shrink:0">${p.ovr}</span>` : ''}
          </div>`).join('')}
          ${Array.from({length:Math.max(0,perTeam-myPicks.length)},()=>'<div style="background:#161922;border:1px dashed rgba(245,197,24,.1);border-radius:8px;padding:.4rem .65rem;margin-bottom:.18rem;opacity:.4"><div style="font-size:.75rem;color:#6b7080">— wolny slot</div></div>').join('')}
        </div>
        <!-- All teams -->
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1px;margin-bottom:.35rem;color:#6b7080">WSZYSTKIE DRUŻYNY</div>
          ${(ev.teams||[]).map(t => {
            const isMe = t.captain?.id === discordUser?.id;
            const tAll = [t.captain, ...(t.players||[]).filter(p=>p.id!==t.captain?.id)].filter(Boolean);
            return `<div style="background:#161922;border-radius:8px;padding:.45rem .65rem;border:1px solid ${isMe?'rgba(245,197,24,.5)':'rgba(245,197,24,.1)'};margin-bottom:.22rem">
              <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.8rem;margin-bottom:.22rem;color:${isMe?'#f5c518':'#e8eaf0'}">${t.name}${isMe?' ★':''}</div>
              ${tAll.map((p,i) => `<div style="display:flex;align-items:center;gap:.3rem;padding:.12rem 0;${i>0?'border-top:1px solid rgba(255,255,255,.04)':''}">
                <span style="font-size:.66rem;min-width:1.4rem;color:${i===0?'#f5c518':'#6b7080'}">${i===0?'★':'#'+i}</span>
                <span style="flex:1;font-size:.76rem;color:${i===0?'#f5c518':'#e8eaf0'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</span>
                ${(p.primaryPos||p.positions?.length) ? `<span style="font-size:.66rem;color:#6b7080;flex-shrink:0">${p.primaryPos||p.positions[0]}</span>` : ''}
                ${p.ovr ? `<span style="background:${_dsOvrColor(p.ovr)};color:rgba(0,0,0,.82);border-radius:3px;padding:.03rem .22rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.7rem;flex-shrink:0">${p.ovr}</span>` : ''}
              </div>`).join('')}
              ${Array.from({length:Math.max(0,perTeam+1-tAll.length)},()=>'<div style="font-size:.68rem;color:#6b7080;opacity:.32;padding:.12rem 0">— slot</div>').join('')}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    `;

  if(ev.timerEnd && isDraftActive && !isDone) startGMTimer(ev.timerEnd, eventId);
}
function _gmToggleWatch(eventId, playerId) {
  const key  = 'nba2k_gm_watch_' + eventId;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const idx  = list.indexOf(playerId);
  if(idx === -1) list.push(playerId); else list.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(list));
  renderGMPanel(eventId);
}
function _gmToggleQueue(eventId, playerId) {
  const key  = 'nba2k_gm_queue_' + eventId;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const idx  = list.indexOf(playerId);
  if(idx === -1) list.push(playerId); else list.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(list));
  renderGMPanel(eventId);
}
function _gmMoveQueue(eventId, playerId, dir) {
  const key    = 'nba2k_gm_queue_' + eventId;
  const list   = JSON.parse(localStorage.getItem(key) || '[]');
  const idx    = list.indexOf(playerId);
  if(idx === -1) return;
  const newIdx = idx + dir;
  if(newIdx < 0 || newIdx >= list.length) return;
  [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
  localStorage.setItem(key, JSON.stringify(list));
  renderGMPanel(eventId);
}
function startGMTimer(endsAt, eventId) {
  clearInterval(_gmTimerInterval);
  _gmTimerInterval = setInterval(() => {
    const el = document.getElementById('gm-timer-display');
    if(!el) { clearInterval(_gmTimerInterval); return; }
    const left = Math.max(0, Math.round((new Date(endsAt) - Date.now()) / 1000));
    const mm = String(Math.floor(left/60)).padStart(2,'0');
    const ss = String(left%60).padStart(2,'0');
    el.textContent = mm + ':' + ss;
    el.style.color = left <= 10 ? '#f87171' : left <= 30 ? '#fb923c' : '#f5c518';
    if(left === 0) {
      clearInterval(_gmTimerInterval);
      // Immediately fetch fresh state so panel doesn't stay on stale 'isMyTurn'
      if(workerUrl) {
        fetch(workerUrl.replace(/\/$/, '') + '/data')
          .then(r => r.json())
          .then(fresh => {
            const fEvs = fresh.record?.events || fresh.events || [];
            const fEv = fEvs.find(e => e.id === eventId);
            if(fEv) {
              const fi = events.findIndex(e => e.id === eventId);
              if(fi !== -1) events[fi] = fEv;
              renderGMPanel(eventId);
              if(fEv.timerEnd && fEv.status === 'draft' && !fEv.draftPaused) startGMTimer(fEv.timerEnd, eventId);
            }
          }).catch(() => {});
      }
    }
  }, 500);
}
function startGMPolling(eventId) {
  clearInterval(_gmPollInterval);
  if(!workerUrl) return;
  _gmPollInterval = setInterval(async () => {
    const modal = document.getElementById('gm-panel-modal');
    if(!modal?.classList.contains('open')) { clearInterval(_gmPollInterval); return; }
    if(document.visibilityState !== 'visible') return;
    const st = await _evdFetch(eventId);
    const ev = events.find(e => e.id === eventId);
    if(!st || !ev) return;
    const myTurnBefore = _gmIsMyTurn(ev);
    if(_evdApply(ev, st) || st.v !== ev._evdVgm) {
      ev._evdVgm = st.v;
      renderGMPanel(eventId);
      if(ev.timerEnd && !ev.draftPaused) startGMTimer(ev.timerEnd, eventId);
      if(!myTurnBefore && _gmIsMyTurn(ev)) _gmTurnAlert(ev);
    }
  }, 2000);
}
function _gmIsMyTurn(ev) {
  const t = (ev.draftOrder || [])[ev.draftTurn || 0];
  return t != null && !!discordUser && ev.teams?.[t]?.captain?.id === discordUser.id && !ev.draftPaused;
}
// „Twoja kolej” — dźwięk + wibracja
function _gmTurnAlert(ev) {
  try { navigator.vibrate?.([200, 100, 200]); } catch(e) {}
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.setValueAtTime(.15, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .6); o.start(); o.stop(a.currentTime + .6); } catch(e) {}
  showToast('🎯 Twoja kolej — wybierz gracza!', 'success');
}
