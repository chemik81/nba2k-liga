/*@v:af4a9d7b1a*/
// Central Anthropic call — uses Worker if configured, else direct key
async function callAnthropic(model, max_tokens, messages) {
  if(workerUrl) {
    // Via Cloudflare Worker — API key never touches browser
    // Get stored token hash — computed during login
    let adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
    // Fallback: if no hash stored yet, compute from known salt+password combo
    // This handles case where user was logged in before Worker was configured
    if(!adminToken && localStorage.getItem('nba2k_auth') === 'ok') {
      // Try to recompute from old stored pw_hash
      adminToken = localStorage.getItem('nba2k_pw_hash') || 'c8b583e26e557d2231acf77e064362620471401652ec527b7be7bfdd3a4c06e8';
      localStorage.setItem('nba2k_admin_token_hash', adminToken);
    }
    const res = await fetch(workerUrl.replace(/\/$/, '') + '/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken,
      },
      body: JSON.stringify({ model, max_tokens, messages })
    });
    if(!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error('Worker error ' + res.status + ': ' + (err.error || 'Unknown'));
    }
    return await res.json();
  } else if(anthropicKey) {
    // Direct — legacy mode
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model, max_tokens, messages })
    });
    return await res.json();
  } else {
    throw new Error('Brak konfiguracji AI — podaj Worker URL w ⚙ Baza');
  }
}
function setScreenshotModel(model) {
  aiModel = model;
  localStorage.setItem('nba2k_ai_model', model);
  const isGemini = model.includes('gemini');
  const isHaiku  = model.includes('haiku');
  const geminiBtn = document.getElementById('ss-model-gemini');
  const sonnetBtn = document.getElementById('ss-model-sonnet');
  const haikuBtn  = document.getElementById('ss-model-haiku');
  const costEl    = document.getElementById('ss-model-cost');
  const setBtn = (btn, active) => {
    if(!btn) return;
    btn.style.border = active ? '2px solid var(--accent)' : '1px solid var(--border)';
    btn.style.background = active ? 'rgba(245,197,24,.12)' : 'transparent';
    btn.style.color = active ? 'var(--accent)' : 'var(--muted)';
  };
  setBtn(geminiBtn, isGemini);
  setBtn(sonnetBtn, !isGemini && !isHaiku);
  setBtn(haikuBtn, isHaiku);
  if(costEl) costEl.textContent = isGemini ? '🆓 darmowy' : isHaiku ? '~$0.005' : '~$0.018';
  // Also sync setup modal radio if open
  const radio = document.querySelector('input[name="ai-model"][value="' + model + '"]');
  if(radio) {
    radio.checked = true;
    document.querySelectorAll('input[name="ai-model"]').forEach(x => {
      const lbl = x.closest('label');
      if(lbl) {
        lbl.style.borderColor = x.checked ? 'var(--accent)' : 'var(--border)';
        lbl.style.background  = x.checked ? 'rgba(245,197,24,.06)' : '';
      }
    });
  }
}
function addAlias() {
  const wrong = document.getElementById('alias-wrong').value.trim();
  const correct = document.getElementById('alias-correct').value.trim();
  if(!wrong || !correct) return;
  aliases[wrong] = correct;
  saveAliases();
  document.getElementById('alias-wrong').value = '';
  document.getElementById('alias-correct').value = '';
  renderAliases();
}
function removeAlias(wrong) {
  delete aliases[wrong];
  saveAliases();
  renderAliases();
}
function applyAliasesToAllMatches() {
  const changed = fixAllMatchesWithAliases();
  const el = document.getElementById('fix-result');
  if(changed > 0) {
    el.textContent = '✅ Poprawiono ' + changed + ' nazw!';
    renderStats();
  } else {
    el.textContent = 'Brak zmian do wprowadzenia.';
  }
  setTimeout(() => { if(el) el.textContent = ''; }, 3000);
}
function renderAliases() {
  const container = document.getElementById('aliases-list');
  if(!container) return;
  const entries = Object.entries(aliases);
  if(!entries.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;padding:1rem 0">Brak zdefiniowanych korekt.</p>';
    return;
  }
  container.innerHTML = `<table style="width:100%;border-collapse:collapse">
    <thead><tr>
      <th style="text-align:left;padding:0.6rem 0.75rem;font-size:0.75rem;letter-spacing:1px;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)">Błędna nazwa</th>
      <th style="text-align:left;padding:0.6rem 0.75rem;font-size:0.75rem;letter-spacing:1px;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)">Poprawna nazwa</th>
      <th style="border-bottom:1px solid var(--border)"></th>
    </tr></thead>
    <tbody>${entries.map(([w,c]) => `
      <tr>
        <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border);color:var(--loss)">${w}</td>
        <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border);color:var(--win);font-weight:600">${c}</td>
        <td style="padding:0.6rem 0.75rem;border-bottom:1px solid var(--border);text-align:right">
          <button onclick="removeAlias('${w}')" style="background:none;border:1px solid var(--border);color:var(--muted);border-radius:4px;padding:0.2rem 0.5rem;cursor:pointer;font-size:0.8rem" onmouseover="this.style.borderColor='var(--loss)';this.style.color='var(--loss)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">${t('delete_btn')}</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}
// Logotypy wgrane jako obrazki z dysku (data:) → osobne pliki w Workerze, żeby baza była lekka
async function _externalizeLogos() {
  if(!workerUrl || typeof teams === 'undefined') return;
  for(const [name, t] of Object.entries(teams)) {
    if(t && typeof t.logo === 'string' && t.logo.startsWith('data:image')) {
      try {
        const res = await _api('/logo-upload', 'POST', { dataUrl: t.logo }, { admin: true });
        if(res.ok && res.url) t.logo = res.url;
      } catch(e) {}
    }
  }
}
async function _saveEvents(force) {
  const json = JSON.stringify((events || []).filter(e => !e._peer)); // 🌍 wspólne drafty z PL nie trafiają do bazy EU
  if(!force && json === _eventsSavedJson) return true;
  try {
    const real = list => (list || []).filter(e => !String(e.id).startsWith('test_ev_')).map(e => e.id);
    const before = real(_eventsSavedJson ? JSON.parse(_eventsSavedJson) : []).filter(id => !(events || []).some(e => e.id === id && e._peer)), now = new Set(real((events || []).filter(e => !e._peer)));
    const lost = before.filter(id => !now.has(id));
    if(lost.length >= 2 && !window._evAllowShrink && !confirm(`Uwaga: zapis usunąłby ${lost.length} eventów naraz. To zamierzone? (Anuluj = nic nie zapisuj)`)) return false;
  } catch(e) {}
  window._evAllowShrink = false;
  try {
    const res = await fetch(workerUrl.replace(/\/+$/, '') + '/events', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': _adminToken(), 'X-Events-Meta': _eventsMetaHeader() }, body: json });
    if(!res.ok) { showToast('❌ Nie zapisano eventów (' + res.status + ')', 'error'); return false; }
    _eventsSavedJson = json; return true;
  } catch(e) { showToast('❌ Błąd sieci przy zapisie eventów', 'error'); return false; }
}
function _isFullAdmin() { return !!localStorage.getItem('nba2k_admin_token_hash'); }
// event manager logowany kontem Discord (lista ID w sekrecie Workera EVENTS_DISCORD_IDS)
async function _eventsViaDiscord() {
  const r = await _api('/events-login', 'POST', {}, { session: true });
  window._evLoginErr = r.ok ? null : (r.error || 'HTTP ' + r.status);
  if(!r.ok) { showToast('🎪 Event manager: ' + window._evLoginErr, 'error'); return; }
  if(r.role !== 'events' || !r.token) return;
  localStorage.setItem('nba2k_events_token_hash', r.token);
  localStorage.setItem('nba2k_events_auth', 'ok');
  localStorage.setItem('nba2k_events_via_discord', '1');
  if(typeof updateEventsAuthUI === 'function') updateEventsAuthUI();
  if(typeof renderEvents === 'function') renderEvents();
  showToast('🎪 Zalogowano jako Event manager (Discord)', 'success');
  _loadEventsStore();
}
async function saveData(silent = false) {
  if(!jbKey && !workerUrl) { showToast(t('err_no_master_key'), 'error'); return; }
  // eventy mają własny zapis; event manager (bez uprawnień admina ligi) zapisuje tylko je
  if(workerUrl && (_eventsStore || !_isFullAdmin()) && _isEventsAdminSync()) {
    const evOk = await _saveEvents();
    if(!_isFullAdmin()) { if(evOk && !silent) showToast('✅ Zapisano', 'success'); return evOk; }
    if(!evOk) return false;
  }
  try {
    if(workerUrl && _isLoggedInSync()) await _externalizeLogos();
    // ── Compact player data ───────────────────────────────────────────────
    const PK = { pts:'p', reb:'r', ast:'a', stl:'s', blk:'b', to:'t',
                 fgm:'fm', fga:'fa', tpm:'tm', tpa:'ta', ftm:'xm', fta:'xa',
                 fol:'f', pos:'po', grade:'g', name:'n' };
    const packPlayer = p => {
      const c = {};
      if(p.name)  c.n  = p.name;
      if(p.grade) c.g  = p.grade;
      if(p.pos)   c.po = p.pos;
      ['pts','reb','ast','stl','blk','to','fgm','fga','tpm','tpa','ftm','fta','fol']
        .forEach(k => { if(p[k]) c[PK[k]] = p[k]; });
      return c;
    };
    const packTeam = t => ({
      name: t.name, score: t.score,
      ...(t.quarters?.length ? { q: t.quarters.join(',') } : {}),
      players: (t.players||[]).map(packPlayer)
    });
    const compactMatches = matches.map(m => {
      const cm = { id: m.id, date: m.date, seasonId: m.seasonId,
                   team1: packTeam(m.team1), team2: packTeam(m.team2) };
      if(m.note)     cm.note     = m.note;
      if(m.walkover) cm.walkover = m.walkover;
      if(m.roundId)  cm.roundId  = m.roundId;
      if(m.recap)    cm.recap    = m.recap;
      if(m.nameFixes?.length) cm.nameFixes = m.nameFixes;
      if(m.qualityFlags?.length) cm.qualityFlags = m.qualityFlags;
      if(m.qualityOk) cm.qualityOk = true;
      return cm;
    });
    const compactSchedule = (schedule||[]).map(s => {
      const cs = { ...s }; if(cs.prediction) delete cs.prediction; return cs;
    });
    // Teams saved with logos to KV — available to all users
    const record = { matches: compactMatches, aliases, seasons,
      currentSeasonId, schedule: compactSchedule, teams,
      rounds, pendingScreenshots, ...(_eventsStore ? {} : { events }), playoffs, discordPsnMap, challengesOff: !!window._challengesOff,
      ovrMethod, ovrOverrides, registrationsClosed,
      powerRankings, penalties, rosterLockDate, teamAliasMap,
      discordGuildId: discordRoleCfg.guildId, discordMemberRoleId: discordRoleCfg.member, discordCaptainRoleId: discordRoleCfg.captain,
      _savedAt: Date.now() };
    const payload = JSON.stringify({ record });
    const sizeKB = (new Blob([payload]).size / 1024).toFixed(1);
    console.log('Payload size:', sizeKB, 'KB');

    // ── Save to Cloudflare KV via Worker (primary) ────────────────────────
    if(workerUrl) {
      const adminToken = localStorage.getItem('nba2k_admin_token_hash') || localStorage.getItem('nba2k_events_token_hash') || '';
      const _put = () => fetch(workerUrl.replace(/\/$/, '') + '/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken, 'X-Fast-Save': '1', 'X-Loaded-At': _dataLoadedAt || '', ...(window._noMetaHeader ? {} : { 'X-Events-Meta': _eventsMetaHeader() }) },
        body: payload
      });
      let res;
      try { res = await _put(); }
      catch(e) { if(window._noMetaHeader) throw e; window._noMetaHeader = true; res = await _put(); } // starszy Worker bez obsługi nagłówka spisu eventów
      if(!res.ok) {
        const err = await res.json().catch(()=>({}));
        if(!silent) showToast('❌ Błąd zapisu (Worker): ' + (err.error||res.status), 'error');
        return false;
      }
      _pushDerived();
      window._dataLoadedAt = Date.now();
      // Worker przeniósł logotypy do osobnych obrazków — podmień lokalnie, żeby kolejne zapisy były lekkie
      try {
        const info = await res.json();
        if(info && info.logos && typeof teams !== 'undefined') Object.entries(info.logos).forEach(([n, u]) => { if(teams[n]) teams[n].logo = u; });
      } catch(e) {}
      return true;
    }

    // ── Fallback: JSONBin (legacy) ────────────────────────────────────────
    if(!jbKey) { showToast(t('err_no_master_key'), 'error'); return false; }
    const sizeKBnum = parseFloat(sizeKB);
    if(sizeKBnum > 150) {
      showToast(t('err_data_too_large')+' ('+sizeKB+'KB)', 'error'); return false;
    }
    if(sizeKBnum > 90) {
      showToast('⚠️ Dane zajmują '+sizeKB+'KB — rozważ migrację na Cloudflare KV', 'info');
    }
    const res = await fetch(`https://api.jsonbin.io/v3/b/${jbBin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': jbKey },
      body: JSON.stringify({ ...JSON.parse(payload).record })
    });
    if(!res.ok) {
      const err = await res.json().catch(()=>({}));
      showToast(`❌ Błąd zapisu (${res.status}): ${err.message||'nieznany błąd'}`, 'error');
      return false;
    }
    return true;
  } catch(e) { console.error('Save error:', e); return false; }
}
// Fix all player names in all saved matches using current aliases
function fixAllMatchesWithAliases() {
  let changed = 0;
  matches = matches.map(m => {
    [m.team1, m.team2].forEach(team => {
      if(team.players) team.players = team.players.map(p => {
        const fixed = applyAlias(p.name);
        if(fixed !== p.name) { changed++; p.name = fixed; }
        return p;
      });
    });
    return m;
  });
  if(changed > 0) {
    saveData();
    console.log('Fixed', changed, 'player names');
  }
  return changed;
}
function saveAliases() {
  localStorage.setItem('nba2k_aliases', JSON.stringify(aliases));
  saveData();
}
// Apply aliases to all players in a match
function applyAliasesToMatch(match) {
  const normalizePlayer = p => {
    const n = {...p, name: applyAlias(p.name)};
    // Normalize fouls field: AI returns 'fouls', app uses 'fol'
    if(n.fouls !== undefined && n.fol === undefined) { n.fol = n.fouls; }
    return n;
  };
  if(match.team1?.players) match.team1.players = match.team1.players.map(normalizePlayer);
  if(match.team2?.players) match.team2.players = match.team2.players.map(normalizePlayer);
  return match;
}
function _modalUrl(path) { if(_urlOn()) setTimeout(() => { try { history.replaceState(history.state, '', path); } catch(e) {} }, 0); }
function _doShowView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
  document.querySelectorAll('nav button').forEach(b => {
    const m = (b.getAttribute('onclick') || '').match(/showView\('([\w-]+)'\)/);
    b.classList.toggle('active', !!m && m[1] === id);
  });
  if(id==='mypanel') renderMyPanelView();
  if(id==='fantasy') renderFantasy();
  if(id==='teams') renderTeamsView();
  if(id==='multistream') renderMultistream();
  if(id==='podcast') renderPodcastView();
  if(id==='kordle') renderKordle();
  if(id==='fans') renderFansView();
  if(id==='cards') renderCardsView();
  if(id==='gm') { renderGmView().then(async () => { setTimeout(gmCalc, 50); await _gmMyBidsLoad(); if(_gmMyBids) renderGmView(); }); }
  try { _bnSync(id); } catch(e) {}
  if(id==='dashboard') renderDashboard();
  if(id==='matches') renderMatches();
  if(id==='stats') { renderStats(); populateTeamFilter(); }
  if(id==='aliases') { renderAliases(); renderTeamAliases(); renderTeamsSection(); renderRoundsList(); }
  updateAuthUI();
}
// ═══════════════════════════════════════════════════════════════
// FILE HANDLING
// ═══════════════════════════════════════════════════════════════
function handleFileSelect(input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    screenshotBase64 = dataUrl.split(',')[1];
    // Auto-detect media type from data URL
    const mimeMatch = dataUrl.match(/data:([^;]+);/);
    screenshotMimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    console.log('Detected mime type:', screenshotMimeType);
    const preview = document.getElementById('screenshot-preview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('parse-btn').disabled = false;
    setStatus('info', t('uploading_file'));
  };
  reader.readAsDataURL(file);
}
// ═══════════════════════════════════════════════════════════════
// AI PARSING
// ═══════════════════════════════════════════════════════════════
async function parseScreenshot() {
  if(!_isLoggedInSync()) { showToast('❌ Tylko admin może analizować screenshoty', 'error'); return; }
  if(!screenshotBase64) return;
  if(!hasAI()) {
    setStatus('error', 'Brak konfiguracji AI — podaj Worker URL w ⚙ Baza');
    return;
  }
  const btn = document.getElementById('parse-btn');
  const btnText = document.getElementById('parse-btn-text');
  btn.disabled = true;
  btnText.innerHTML = t('ai_spinner');
  setStatus('info', t('ai_analyzing'));

  // Build known players list from existing matches + aliases for better OCR
  const knownPlayers = [...new Set(
    matches.flatMap(m => [...(m.team1.players||[]), ...(m.team2.players||[])].map(p => p.name))
  )].filter(Boolean).sort();
  const aliasValues = Object.values(aliases).filter(Boolean);
  const allKnown = [...new Set([...knownPlayers, ...aliasValues])].sort();
  const knownPlayersHint = allKnown.length
    ? `\n\nZNANI GRACZE W LIDZE (użyj tych nazw gdy pasują fonetycznie/wizualnie do tego co widzisz na screenie):\n${allKnown.join(', ')}`
    : '';

  const prompt = `Analizuj ten screenshot z gry NBA 2K z ekranu "Game Stats".

BARDZO WAŻNE - NAZWY GRACZY: Nicki graczy na screenie mogą być zniekształcone przez OCR (podobne litery: 0/O, 1/I/l, rn/m, vv/w, ci/d). 
Porównaj każdą rozpoznaną nazwę z listą znanych graczy i wybierz najbliższe dopasowanie jeśli różnica to 1-2 znaki.
Nie zmieniaj nazwy jeśli jesteś pewny że jest poprawna lub nie ma bliskiego dopasowania na liście.${knownPlayersHint}

KOLUMNY W TABELI (kolejność): GRD | PTS | REB | AST | STL | BLK | FOULS | TO | FGM/FGA | 3PM/3PA | FTM/FTA
KRYTYCZNE: Kolumna 7 = FOULS (nagłówek na ekranie to "FOULS") → zapisz jako "fouls". Kolumna 8 = TO (straty) → zapisz jako "to". NIE mylić!

NAZWY DRUŻYN: Dopasuj logotyp do poniższej listy (użyj DOKŁADNIE tej nazwy):
${Object.keys(teams||{}).length ? Object.keys(teams).join(', ') : 'Aliens Katowice, Katowice PL, Big Brain Basketball, Illegal Esports V2, Polish Boars, Polish Snickers, White Market, Sternritters, The Outlawz'}
UWAGA na podobne logotypy: "Aliens Katowice" ma ZIELONY kolor i zielonego aliena. "Katowice PL" ma CZERWONY kolor i czerwonego/białego aliena. To dwie RÓŻNE drużyny — rozróżniaj po kolorze!
Jeśli w nagłówku tabeli widzisz nick gracza zamiast nazwy (np. "xXxxxxxZZZZ") — ZIGNORUJ, użyj nazwy z logotypu lub "Drużyna 1"/"Drużyna 2".

Wyodrębnij WSZYSTKIE dane i zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy):
{
  "team1": {
    "name": "PEŁNA NAZWA DRUŻYNY (nie nick gracza)",
    "score": 67,
    "quarters": [18, 17, 16, 16],
    "players": [
      {"name": "NickGracza", "pos": "PG", "grade": "B+", "pts": 24, "reb": 0, "ast": 9, "stl": 0, "blk": 0, "fouls": 0, "to": 3, "fgm": 7, "fga": 20, "tpm": 6, "tpa": 16, "ftm": 4, "fta": 4}
    ]
  },
  "team2": {
    "name": "PEŁNA NAZWA DRUŻYNY (nie nick gracza)",
    "score": 87,
    "quarters": [27, 16, 20, 24],
    "players": [{"name": "NickGracza", "grade": "A+", "pts": 40, "reb": 0, "ast": 11, "stl": 0, "blk": 0, "fouls": 0, "to": 2, "fgm": 15, "fga": 20, "tpm": 10, "tpa": 15, "ftm": 0, "fta": 0}]
  }
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

Nick kapitana widoczny w wierszu nagłówka NIE jest graczem — nie wstawiaj go do tablicy players.
Każda drużyna ma DOKŁADNIE 5 graczy — 5 wierszy nad TOTAL.
Licz od dołu: wiersz tuż nad TOTAL = gracz 5 (C), następny = gracz 4 (PF), itd.

POZYCJE: 1=PG, 2=SG, 3=SF, 4=PF, 5=C (licząc od góry, pomijając wiersz nagłówka z kapitanem).

KOLEJNOŚĆ KOLUMN na ekranie Game Stats (od lewej do prawej):
GRADE | PTS | REB | AST | STL | BLK | FOULS | TO | FGM/FGA | 3PM/3PA | FTM/FTA

WAŻNE — rozróżnienie BLK / FOULS / TO:
- BLK (bloki) = 6. kolumna. Zazwyczaj 0-2.
- FOULS (faule) = 7. kolumna, nagłówek na ekranie brzmi "FOULS". → zapisz jako "fouls". Zazwyczaj 0-5.
- TO (straty) = 8. kolumna. → zapisz jako "to". Zazwyczaj 0-4.
- NIE zamieniaj kolejności — FOULS jest PRZED TO na ekranie.
- Gdy TO=0 nie zamieniaj z FOULS — zapisz "to":0.
- Liczby w tych kolumnach są małe (0-6). Jeśli widzisz dużą liczbę w miejscu BLK/FOULS/TO — to błąd, wstaw 0.

Użyj dokładnych liczb z ekranu. Jeśli coś nieczytelne, wstaw 0.`

  try {
    const data = await callAI(MODEL_SCREENSHOT(), 8192, [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: screenshotMimeType, data: screenshotBase64 } },
        { type: 'text', text: prompt }
      ]
    }]);
    console.log('API response:', JSON.stringify(data));

    // Check for API errors
    if(data.error) throw new Error('API Error: ' + data.error.message);
    if(!data.content || !data.content.length) throw new Error(t('api_empty_response'));

    const text = data.content.map(c => c.text||'').join('');
    console.log('Raw text:', text);
    setStatus('info', t('api_parsing'));

    // Robust JSON extraction
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if(firstBrace === -1 || lastBrace === -1) {
      throw new Error(t('api_no_json') + text.substring(0, 200));
    }
    let jsonStr = text.slice(firstBrace, lastBrace + 1);
    // Remove control chars that break JSON
    jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    // Fix common AI JSON mistakes:
    // 1. Trailing commas before } or ]
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
    // 2. Single quotes → double quotes (only outside existing strings)
    // 3. Remove JS comments // and /* */
    jsonStr = jsonStr.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // 4. Python-style None/True/False
    jsonStr = jsonStr.replace(/\bNone\b/g,'null').replace(/\bTrue\b/g,'true').replace(/\bFalse\b/g,'false');
    // 5. Ellipsis or placeholder [...] inside arrays - remove player placeholders
    jsonStr = jsonStr.replace(/\.\.\.\s*(?=[,\]])/g, '');
    console.log('Cleaned JSON (first 600):', jsonStr.substring(0, 600));
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch(e) {
      // Show context around error position
      const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
      console.error('JSON error at pos', pos, ':', jsonStr.substring(Math.max(0,pos-40), pos+40));
      // Try one more fix: escape unescaped quotes inside string values
      const fixedJson = jsonStr.replace(/"([^"]*)"\s*:/g, function(m) { return m; })
                               .replace(/([^\\])"/g, function(m,p1) { return p1 + '\"'; })
      // That's too aggressive — just rethrow with context
      throw new Error('JSON parse error near: ...' + jsonStr.substring(Math.max(0,pos-30), pos+30) + '...');
    }

    let rawMatch = {
      id: Date.now(),
      date: document.getElementById('match-date').value || new Date().toISOString().split('T')[0],
      note: document.getElementById('match-note').value,
      ...parsed
    };
    pendingMatch = applyAliasesToMatch(rawMatch);

    renderParsedPreview(pendingMatch);
    document.getElementById('parsed-result').style.display = 'block';
    setStatus('success', `✅ Odczytano statystyki! Drużyna ${parsed.team1.name} ${parsed.team1.score} - ${parsed.team2.score} ${parsed.team2.name}. Sprawdź dane poniżej.`);
  } catch(err) {
    console.error('Full error:', err);
    setStatus('error', '❌ ' + err.message);
  }

  btn.disabled = false;
  btnText.innerHTML = '🤖 Analizuj Ponownie';
}
// ═══════════════════════════════════════════════════════════════
// RENDER PARSED PREVIEW
// ═══════════════════════════════════════════════════════════════
function renderParsedPreview(match) {
  const container = document.getElementById('parsed-match-preview');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem">
      ${renderTeamTable(match.team1, 1)}
      ${renderTeamTable(match.team2, 2)}
    </div>`;
}
function renderTeamTable(team, idx) {
  const inpStyle = 'width:32px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:3px;padding:.1rem .1rem;font-size:.72rem;text-align:center;font-family:inherit';
  const inpStyleW = 'width:44px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:3px;padding:.1rem .1rem;font-size:.72rem;text-align:center;font-family:inherit';

  const rows = team.players.map((p, pi) => `
    <tr>
      <td style="padding:.25rem .4rem">
        <input type="text" value="${p.name}" style="width:90px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:3px;padding:.1rem .2rem;font-size:.72rem;font-family:inherit"
          oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].name=this.value">
      </td>
      <td style="padding:.25rem .3rem">
        <select style="background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .2rem;font-size:.75rem;font-family:inherit"
          onchange="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].pos=this.value">
          ${['PG','SG','SF','PF','C'].map(pos=>`<option${(p.pos||'')=== pos?' selected':''}>${pos}</option>`).join('')}
        </select>
      </td>
      <td style="padding:.25rem .3rem">
        <select style="background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .2rem;font-size:.75rem;font-family:inherit"
          onchange="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].grade=this.value">
          ${['A+','A','A-','B+','B','B-','C+','C','C-','D'].map(g=>`<option${(p.grade||'B')===g?' selected':''}>${g}</option>`).join('')}
        </select>
      </td>
      ${[['pts',p.pts],['reb',p.reb],['ast',p.ast],['stl',p.stl],['blk',p.blk],['to',p.to],['fol',p.fol]].map(([k,v])=>`
        <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${v||0}" style="${inpStyle}"
          oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].${k}=+this.value"></td>`).join('')}
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.fgm||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].fgm=+this.value"></td>
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.fga||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].fga=+this.value"></td>
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.tpm||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].tpm=+this.value"></td>
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.tpa||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].tpa=+this.value"></td>
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.ftm||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].ftm=+this.value"></td>
      <td style="padding:.25rem .2rem"><input type="number" min="0" max="99" value="${p.fta||0}" style="${inpStyle}"
        oninput="pendingMatch.${idx===1?'team1':'team2'}.players[${pi}].fta=+this.value"></td>
    </tr>`).join('');

  const q = team.quarters || [];
  return `
    <div>
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;flex-wrap:wrap">
        <input type="text" value="${team.name}"
          style="font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:1px;text-transform:uppercase;background:var(--surface2);border:1px solid var(--accent);border-radius:6px;color:var(--text);padding:.3rem .6rem;outline:none"
          oninput="pendingMatch.${idx===1?'team1':'team2'}.name=this.value">
        <input type="number" value="${team.score}" min="0" max="200"
          style="width:60px;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;background:var(--surface2);border:1px solid var(--accent);border-radius:6px;color:var(--accent);padding:.3rem .5rem;text-align:center;outline:none"
          oninput="pendingMatch.${idx===1?'team1':'team2'}.score=+this.value">
      </div>
      <div class="quarters" style="margin-bottom:.75rem">
        ${q.map((s,i)=>`<div class="q-box" style="cursor:pointer" title="kliknij aby edytować">Q${i+1}:
          <input type="number" value="${s}" min="0" max="99"
            style="width:32px;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--text);font-size:.8rem;text-align:center;font-family:inherit;padding:0"
            oninput="pendingMatch.${idx===1?'team1':'team2'}.quarters[${i}]=+this.value">
        </div>`).join('')}
      </div>
      <div style="overflow-x:auto">
        <table>
          <thead><tr>
            <th style="text-align:left;font-size:.75rem">Gracz</th>
            <th style="font-size:.75rem">Poz</th>
            <th style="font-size:.75rem">GRD</th>
            <th style="font-size:.65rem">PTS</th><th style="font-size:.65rem">REB</th>
            <th style="font-size:.65rem">AST</th><th style="font-size:.65rem">STL</th>
            <th style="font-size:.65rem">BLK</th><th style="font-size:.65rem">TO</th>
            <th style="font-size:.65rem">PF</th>
            <th style="font-size:.65rem">FGM</th><th style="font-size:.65rem">FGA</th>
            <th style="font-size:.65rem">3PM</th><th style="font-size:.65rem">3PA</th>
            <th style="font-size:.65rem">FTM</th><th style="font-size:.65rem">FTA</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}
function clearForm() {
  window._currentDiscordScreenshot = null;
  const ep = document.getElementById('edit-stats-panel'); if(ep) ep.remove();
  const checkTitle = document.querySelector('[data-i18n="check_save"]');
  if(checkTitle) checkTitle.style.display = '';
  screenshotBase64 = null;
  const _g = id => document.getElementById(id);
  if(_g('screenshot-input'))  _g('screenshot-input').value = '';
  if(_g('screenshot-preview')) _g('screenshot-preview').style.display = 'none';
  if(_g('match-note'))        _g('match-note').value = '';
  if(_g('parse-btn'))         _g('parse-btn').disabled = true;
  if(_g('parse-btn-text'))    _g('parse-btn-text').textContent = '🤖 Analizuj Screenshot';
  if(_g('parsed-result'))     _g('parsed-result').style.display = 'none';
  const uploadZone = _g('upload-zone');
  if(uploadZone) uploadZone.innerHTML = '<input type="file" accept="image/*" id="screenshot-input" onchange="handleFileSelect(this)"><div class="upload-icon">📸</div><h3>Wgraj Screenshot z Meczu</h3><p>Kliknij lub przeciągnij plik · PNG, JPG, WebP</p>';
  setStatus('', '');
}
function renderMatches() {
  updateMatchFilters();
  const container = document.getElementById('matches-list');
  const ft=document.getElementById('mft')?.value||'',fp=document.getElementById('mfp')?.value||'',fs=document.getElementById('mfs')?.value||'',fpo=document.getElementById('mfpo')?.value||'';
  // Helper: is match a playoff match?
  const po = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poM = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _poMPairs = new Set(
    (_poM ? _poM.rounds : []).flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|')))
  );
  const _poMCutoff = _poM ? (_poM.startDate || (_poM.createdAt || '').slice(0,10) || '0000-00-00') : null;
  const isPlayoffMatch = m => _isAnyPlayoffMatch(m);
  const _raw=matches.filter(m=>{
    if(fs&&m.seasonId!==fs)return false;
    if(ft&&m.team1.name!==ft&&m.team2.name!==ft)return false;
    if(fp&&![...(m.team1.players||[]),...(m.team2.players||[])].some(p=>p.name===fp))return false;
    if(fpo==='playoff'&&!isPlayoffMatch(m))return false;
    if(fpo==='regular'&&isPlayoffMatch(m))return false;
    return true;
  });
  const list=[..._raw].sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(!list.length) {
    container.innerHTML = '<div class="empty"><div class="icon">📋</div><h3>'+t('no_matches')+'</h3><p>'+(ft||fp?t('no_data'):t('add_match_hint'))+'</p></div>';
    return;
  }
  container.innerHTML = list.map(m => {
    const w1 = m.team1.score > m.team2.score;
    return `<div class="match-card" onclick="openMatch(${m.id})" style="position:relative">
      <div class="team-side">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem">${teamLogo(m.team1.name,36,'.85rem')}<div class="team-name">${m.team1.name}</div></div>
        <div class="team-score ${w1?'winner':''}">${m.team1.score}</div>
        <div class="quarters" style="margin-top:0.25rem">${(m.team1.quarters||[]).map((s,i)=>`<div class="q-box">Q${i+1}:${s}</div>`).join('')}</div>
      </div>
      <div class="match-meta">
        <div style="display:flex;align-items:center;justify-content:center;gap:.4rem">
          <div class="match-date">${formatDate(m.date)}</div>
          <button onclick="event.stopPropagation();openMatchPoster(${m.id})" title="Plakat meczu" style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;padding:2px;font-size:.9rem">🖼</button>
          <button onclick="event.stopPropagation();shareMatch(${m.id})" title="Udostępnij" style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--muted);cursor:pointer;padding:2px;border-radius:4px;transition:color .2s" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--muted)'">&#x1F4E4;</button>
        </div>
        ${isPlayoffMatch(m) ? '<div style="font-size:.6rem;font-weight:900;letter-spacing:1px;background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border-radius:4px;padding:.1rem .4rem;margin-bottom:.2rem">🏆 PLAYOFF</div>' : ''}
        <div class="vs-badge">VS</div>
        ${m.note && !/^game\s*\d+$/i.test(m.note.trim()) ? `<div style="font-size:0.75rem;color:var(--muted);max-width:80px;text-align:center">${m.note}</div>` : ''}
        ${m.seasonId ? `<div style="font-size:0.65rem;color:var(--accent);font-weight:700;margin-top:2px">${(seasons.find(s=>s.id===m.seasonId)||{}).name||''}</div>` : ''}
        ${(()=>{ const r=(rounds||[]).find(r=>m.date>=r.from&&m.date<=r.to); return r?`<div style="font-size:0.6rem;color:var(--muted);font-weight:600;margin-top:1px">${r.label}</div>`:''; })()}
      </div>
      <div class="team-side right">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.25rem;justify-content:flex-end"><div class="team-name">${m.team2.name}</div>${teamLogo(m.team2.name,36,'.85rem')}</div>
        <div class="team-score ${!w1?'winner':''}">${m.team2.score}</div>
        <div class="quarters" style="margin-top:0.25rem;justify-content:flex-end">${(m.team2.quarters||[]).map((s,i)=>`<div class="q-box">Q${i+1}:${s}</div>`).join('')}</div>
      </div>
      ${_isLoggedInSync() ? `<button onclick="event.stopPropagation(); deleteMatch(${m.id})" title="Usuń mecz" style="position:absolute;top:0.75rem;right:0.75rem;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;width:30px;height:30px;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s" onmouseover="this.style.borderColor='var(--loss)';this.style.color='var(--loss)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">🗑</button>` : ''}
    </div>`;
  }).join('');
}
// ═══════════════════════════════════════════════════════════════
// MATCH MODAL
// ═══════════════════════════════════════════════════════════════
function openMatch(id) {
  const m = matches.find(x => Number(x.id) === Number(id));
  if(!m) return;
  const modal = document.getElementById('modal-content');
  const w1 = m.team1.score > m.team2.score;
  modal.innerHTML = `${m.merged ? `<div style="font-size:.78rem;background:rgba(245,197,24,.12);border:1px solid rgba(245,197,24,.4);border-radius:8px;padding:.35rem .6rem;margin-bottom:.6rem">🔌 ${_g('Mecz dogrywany po rozłączeniu — połączono 2 zrzuty (wynik i statystyki zsumowane)', 'Match finished after a disconnect — 2 screenshots merged (score and stats combined)')}</div>` : ''}
    <div class="modal-score-row">
      <div>
        <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem">${teamLogo(m.team1.name,44,'1rem')}<div class="modal-team">${m.team1.name}</div></div>
        <div class="modal-score-big" style="${!w1?'color:var(--text)':''}">${m.team1.score}</div>
        <div class="quarters">${(m.team1.quarters||[]).map((s,i)=>`<div class="q-box">Q${i+1}: ${s}</div>`).join('')}</div>
      </div>
      <div style="text-align:center">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Final</div>
        <div style="font-size:1.5rem;margin:0.5rem 0">🏀</div>
        <div style="display:flex;align-items:center;gap:.5rem;justify-content:center">
          <div style="font-size:0.8rem;color:var(--muted)">${formatDate(m.date)}</div>
          <button onclick="shareMatch(${m.id})" title="Udostępnij" style="display:inline-flex;align-items:center;justify-content:center;background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;width:28px;height:28px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">&#x1F4E4;</button>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:1rem;flex-wrap:wrap">
        ${_isLoggedInSync() ? `<div style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;margin-top:.25rem">
          <button class="btn btn-ghost" style="font-size:0.75rem;padding:0.4rem 0.75rem" onclick="generateRecap(${id})">📝 Recap</button>
          <button id="recap-model-gemini" onclick="setRecapModel('gemini-2.5-flash')" style="${recapModel === 'gemini-2.5-flash' ? 'padding:.2rem .5rem;border:2px solid var(--accent);background:rgba(245,197,24,.12);color:var(--accent);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px' : 'padding:.2rem .5rem;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px'}">🆓 Gemini</button>
          <button id="recap-model-haiku" onclick="setRecapModel('claude-haiku-4-5-20251001')" style="${recapModel === 'claude-haiku-4-5-20251001' ? 'padding:.2rem .5rem;border:2px solid var(--accent);background:rgba(245,197,24,.12);color:var(--accent);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px' : 'padding:.2rem .5rem;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px'}">Haiku</button>
          <button id="recap-model-sonnet" onclick="setRecapModel('claude-sonnet-4-20250514')" style="${recapModel === 'claude-sonnet-4-20250514' ? 'padding:.2rem .5rem;border:2px solid var(--accent);background:rgba(245,197,24,.12);color:var(--accent);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px' : 'padding:.2rem .5rem;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;border-radius:6px'}">Sonnet</button>
        </div>` : ''}
        ${_isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:0.75rem;padding:0.4rem 0.75rem" onclick="editMatch(${id})">&#x270f;&#xfe0f; Edytuj</button>${m.merged ? `<button class="btn btn-ghost" style="font-size:0.75rem;padding:0.4rem 0.75rem" onclick="unmergeMatch('${id}')">↩ Rozdziel</button>` : `<button class="btn btn-ghost" style="font-size:0.75rem;padding:0.4rem 0.75rem" title="Mecz przerwany (rozłączenie) — połącz dwa zrzuty w jeden mecz" onclick="openMergeMatch('${id}')">🔗 Połącz</button>`}<button class="btn btn-danger" style="font-size:0.75rem;padding:0.4rem 0.75rem" onclick="deleteMatch(${id})">🗑 Usuń</button>` : ''}
      </div>
      </div>
      <div style="text-align:right">
        <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem;justify-content:flex-end"><div class="modal-team">${m.team2.name}</div>${teamLogo(m.team2.name,44,'1rem')}</div>
        <div class="modal-score-big" style="${w1?'color:var(--text)':''}">${m.team2.score}</div>
        <div class="quarters" style="justify-content:flex-end">${(m.team2.quarters||[]).map((s,i)=>`<div class="q-box">Q${i+1}: ${s}</div>`).join('')}</div>
      </div>
    </div>
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab(this,'tab-t1')" style="display:flex;align-items:center;gap:.4rem">${teamLogo(m.team1.name,22,'.6rem')} ${m.team1.name}</button>
      <button class="tab-btn" onclick="switchTab(this,'tab-t2')" style="display:flex;align-items:center;gap:.4rem">${teamLogo(m.team2.name,22,'.6rem')} ${m.team2.name}</button>
    </div>
    <div id="tab-t1" class="tab-content active">${buildPlayerTable(m.team1.players, m.team1.name)}</div>
    <div id="tab-t2" class="tab-content">${buildPlayerTable(m.team2.players, m.team2.name)}</div>
    <div id="match-recap-${id}" style="margin-top:1.25rem">${m.recap ? renderRecapBlock(m.recap, m.id) : ''}</div>
    ${_isLoggedInSync() && !m.qualityOk && [...new Set([...(m.qualityFlags || []), ..._qualityCheck(m)])].length ? `<div style="font-size:.74rem;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.5);border-radius:8px;padding:.45rem .6rem;margin-top:.7rem;line-height:1.5">
      <b>🛡 Do sprawdzenia:</b><br>${[...new Set([...(m.qualityFlags || []), ..._qualityCheck(m)])].map(f => '⚠️ ' + _h(f)).join('<br>')}
      <div style="margin-top:.35rem"><button class="btn btn-primary" style="font-size:.68rem;padding:.12rem .5rem" onclick="qualityOk(${JSON.stringify(m.id)}).then(()=>openMatch(${JSON.stringify(m.id)}))">✓ Sprawdzony — wszystko OK</button></div></div>` : ''}
    ${(m.nameFixes || []).length && _isLoggedInSync() ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.6rem">🔤 Nicki dopasowane do składów: ${m.nameFixes.map(f => `${_h(f.from)} → <b>${_h(f.to)}</b>`).join(' · ')}</div>` : ''}
    <div style="text-align:center;margin-top:.8rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="openRivalry(this.dataset.a, this.dataset.b)" data-a="${_h(m.team1.name)}" data-b="${_h(m.team2.name)}">⚔️ Historia starć ${_h(m.team1.name)} vs ${_h(m.team2.name)}</button></div>
    ${_reactBar('m' + m.id)}`;
  document.getElementById('match-modal').classList.add('open');
  // H2H
  setTimeout(()=>{
    const t1=m.team1.name,t2=m.team2.name;
    const h2h=matches.filter(x=>(x.team1.name===t1&&x.team2.name===t2)||(x.team1.name===t2&&x.team2.name===t1));
    if(h2h.length<2) return;
    let w1c=0,w2c=0;
    h2h.forEach(x=>{const s1=x.team1.name===t1?x.team1.score:x.team2.score,s2=x.team1.name===t1?x.team2.score:x.team1.score;if(s1>s2)w1c++;else w2c++;});
    const tot=w1c+w2c,p1=Math.round(w1c/tot*100);
    const mc=document.getElementById('modal-content');
    if(!mc||mc.querySelector('.h2hbar')) return;
    const dv=document.createElement('div');
    dv.style.cssText='margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border)';
    dv.innerHTML=`<div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem">Head to Head (${h2h.length} spotkań)</div><div style="display:flex;justify-content:space-between;margin-bottom:.25rem"><span style="font-weight:700;color:var(--accent)">${t1} <span style="font-size:1.5rem">${w1c}</span></span><span style="font-weight:700;color:var(--accent2)"><span style="font-size:1.5rem">${w2c}</span> ${t2}</span></div><div class="h2hbar"><div class="h2hl" style="width:${p1}%"></div><div class="h2hr" style="width:${100-p1}%"></div></div>`;
    mc.appendChild(dv);
  },80);
}
function switchTab(btn, tabId) {
  btn.closest('.modal').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.closest('.modal').querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}
function closeModal() {
  document.getElementById('match-modal').classList.remove('open');
}
function _numToGrade(n) { const L = ['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']; return L[Math.max(0, Math.min(12, Math.round(n) - 1))]; }
function _mergeTeams(ta, tb) { // ta: część 1, tb: część 2 (ta sama drużyna)
  const out = { ...ta, score: (+ta.score || 0) + (+tb.score || 0), players: (ta.players || []).map(p => ({ ...p })) };
  (tb.players || []).forEach(q => { const p = out.players.find(x => _normNick(x.name) === _normNick(q.name));
    if(!p) { out.players.push({ ...q }); return; }
    const w1 = (+p.pts || 0) + (+p.reb || 0) + (+p.ast || 0) + 1, w2 = (+q.pts || 0) + (+q.reb || 0) + (+q.ast || 0) + 1;
    const g1 = gradeToNum(p.grade), g2 = gradeToNum(q.grade); if(g1 && g2) p.grade = _numToGrade((g1 * w1 + g2 * w2) / (w1 + w2)); else if(!g1 && g2) p.grade = q.grade;
    _MSUM.forEach(k => p[k] = (+p[k] || 0) + (+q[k] || 0)); });
  return out;
}
function openMergeMatch(id) {
  const A = matches.find(m => String(m.id) === String(id)); if(!A) return;
  const teams = [A.team1.name, A.team2.name].map(_normNick).sort().join('|'), dA = Date.parse(A.date) || 0;
  const C = matches.filter(m => m !== A && !m.walkover && !m.merged && [m.team1.name, m.team2.name].map(_normNick).sort().join('|') === teams && (m.seasonId || null) === (A.seasonId || null) && Math.abs((Date.parse(m.date) || 0) - dA) <= 7 * 864e5);
  const md = _fxModal('merge-modal', 600); md.classList.add('open');
  md.querySelector('.modal').innerHTML = _fxHead('merge-modal', '🔗 Połącz mecze (dogrywka po rozłączeniu)') + `<div data-notr>
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.7rem">Gdy mecz został przerwany (rozłączenie) i drużyny dograły resztę, są dwa zrzuty jednego meczu. Połączenie sumuje wynik i statystyki każdego gracza (ocena — średnia ważona), a drugi zapis znika z meczów i z terminarza. Można to potem cofnąć.</div>
    <div style="font-size:.84rem;margin-bottom:.4rem"><b>Ten mecz:</b> ${_h(A.team1.name)} ${A.team1.score}:${A.team2.score} ${_h(A.team2.name)} · ${_h(A.date || '')}</div>
    ${C.length ? `<div style="font-size:.8rem;font-weight:700;margin:.6rem 0 .3rem">Druga część (te same drużyny, ±7 dni):</div>${C.map(m => { const same = _normNick(m.team1.name) === _normNick(A.team1.name), s1 = same ? m.team1.score : m.team2.score, s2 = same ? m.team2.score : m.team1.score;
      return `<label style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.4rem .5rem;border:1px solid var(--border);border-radius:8px;margin-bottom:.3rem;cursor:pointer;font-size:.82rem;text-transform:none;letter-spacing:0;color:var(--text)"><span><input type="radio" name="mrg" value="${m.id}" style="width:auto;margin:0 .4rem 0 0">${_h(A.team1.name)} ${s1}:${s2} ${_h(A.team2.name)} · ${_h(m.date || '')}</span><span style="color:var(--muted)">→ razem <b style="color:var(--text)">${(+A.team1.score || 0) + (+s1 || 0)}:${(+A.team2.score || 0) + (+s2 || 0)}</b></span></label>`; }).join('')}
      <div style="display:flex;justify-content:flex-end;margin-top:.6rem"><button class="btn btn-primary" onclick="mergeMatchesConfirm('${A.id}')">🔗 Połącz w jeden mecz</button></div>`
      : `<div style="font-size:.82rem;color:var(--muted);margin-top:.5rem">Brak innych meczów tych samych drużyn z ±7 dni.</div>`}</div>`;
}
async function mergeMatchesConfirm(aId) {
  const bId = document.querySelector('input[name="mrg"]:checked')?.value; if(!bId) { showToast('Wybierz drugą część meczu', 'info'); return; }
  const A0 = matches.find(m => String(m.id) === String(aId)), B0 = matches.find(m => String(m.id) === String(bId)); if(!A0 || !B0) return;
  const [P1, P2] = [A0, B0].sort((x, y) => String(x.date).localeCompare(String(y.date)) || (+x.id - +y.id)); // część 1 = wcześniejsza
  const same = _normNick(P2.team1.name) === _normNick(P1.team1.name), t1 = same ? P2.team1 : P2.team2, t2 = same ? P2.team2 : P2.team1;
  if(!confirm(`Połączyć w jeden mecz?\n${P1.team1.name} ${(+P1.team1.score || 0) + (+t1.score || 0)}:${(+P1.team2.score || 0) + (+t2.score || 0)} ${P1.team2.name}`)) return;
  const M = { ...P1, team1: _mergeTeams(P1.team1, t1), team2: _mergeTeams(P1.team2, t2), merged: { parts: 2, at: new Date().toISOString(), partA: JSON.parse(JSON.stringify(P1)), partB: JSON.parse(JSON.stringify(P2)) } };
  matches = matches.filter(m => String(m.id) !== String(P2.id)).map(m => String(m.id) === String(P1.id) ? M : m);
  (schedule || []).forEach(s => { const ids = (s.matchIds || []).map(String); if(ids.includes(String(P2.id))) { s.matchIds = (s.matchIds || []).filter(x => String(x) !== String(P2.id)); if(!s.matchIds.map(String).includes(String(P1.id))) s.matchIds.push(P1.id); } if(String(s.matchId) === String(P2.id)) s.matchId = P1.id; });
  await saveData(); _fxClose('merge-modal'); try { closeModal(); } catch(e) {} try { renderMatches(); renderDashboard(); renderSchedule(); } catch(e) {}
  showToast(`🔗 Połączono: ${M.team1.name} ${M.team1.score}:${M.team2.score} ${M.team2.name}`, 'success');
}
async function unmergeMatch(id) {
  const M = matches.find(m => String(m.id) === String(id)); if(!M?.merged?.partA) return;
  if(!confirm('Rozdzielić z powrotem na dwa osobne mecze?')) return;
  const A = M.merged.partA, B = M.merged.partB; matches = matches.map(m => String(m.id) === String(id) ? A : m); if(!matches.some(m => String(m.id) === String(B.id))) matches.push(B);
  (schedule || []).forEach(s => { if((s.matchIds || []).map(String).includes(String(A.id)) && !(s.matchIds || []).map(String).includes(String(B.id))) s.matchIds.push(B.id); });
  await saveData(); try { closeModal(); renderMatches(); renderDashboard(); renderSchedule(); } catch(e) {} showToast('↩ Rozdzielono na dwa mecze', 'success');
}
function deleteMatch(id) {
  pendingDeleteId = Number(id);
  document.getElementById('delete-modal').classList.add('open');
}
function confirmDelete() {
  if(pendingDeleteId === null) return;
  matches = matches.filter(m => Number(m.id) !== pendingDeleteId);
  saveData().then(() => showToast(t('match_deleted'), 'info'));
  pendingDeleteId = null;
  closeConfirm();
  closeModal();
  renderMatches();
  renderDashboard();
}
function closeConfirm() {
  document.getElementById('delete-modal').classList.remove('open');
}
// -1 = desc, 1 = asc

function sortByCol(col) {
  if(statsSortCol === col) {
    statsSortDir *= -1;
  } else {
    statsSortCol = col;
    statsSortDir = ['name','team'].includes(col) ? 1 : -1;
  }
  renderStats();
}
function renderStats() { return _withAllMatches(_renderStatsInner); }
// zawsze pełna lista meczów — zawężają ją filtry (edycja, sezon, kolejka…)
function _renderStatsInner() {
  const seasonFilter = document.getElementById('filter-season-stats')?.value || '';
  const roundFilterId = document.getElementById('filter-round-stats')?.value || '';
  const teamFilter = document.getElementById('filter-team')?.value || '';
  const posFilter = document.getElementById('filter-pos-stats')?.value || '';

  // Get matches filtered by round if selected
  const _po = playoffs.length ? playoffs[playoffs.length-1] : null;
  const _playoffPairSet = new Set(
    (_po ? _po.rounds : []).flatMap(r => r.pairs.map(p => [p.team1, p.team2].sort().join('|')))
  );
  const _poCutoff = _po ? (_po.startDate || (_po.createdAt || '').slice(0,10) || '0000-00-00') : null;
  const _isPlayoff = m => _isAnyPlayoffMatch(m);
  const playoffFilter = document.getElementById('filter-playoff-stats')?.value || '';

  let statsMatches = matches;
  if(roundFilterId) {
    const allRounds = rounds.length ? rounds : [getDefaultRound()];
    const selRound = allRounds.find(r => r.id == roundFilterId);
    if(selRound) statsMatches = matches.filter(m => m.date >= selRound.from && m.date <= selRound.to);
  }
  if(seasonFilter.startsWith('ed:')) { const ed = seasonFilter.slice(3); statsMatches = statsMatches.filter(m => _editionOf(m.seasonId) === ed); }
  else if(seasonFilter) statsMatches = statsMatches.filter(m => m.seasonId === seasonFilter);
  // Filter by playoff status
  if(playoffFilter === 'playoff') statsMatches = statsMatches.filter(m => _isPlayoff(m));
  else if(playoffFilter === 'regular') statsMatches = statsMatches.filter(m => !_isPlayoff(m));
  else if(!playoffFilter) statsMatches = statsMatches.filter(m => !_isPlayoff(m));
  // playoffFilter === 'all' -> no additional filter

  // Build aggregated stats from filtered matches
  const playerMap = {};
  statsMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players||[]).forEach(p => {
        const key = p.name + '|' + team.name;
        if(!playerMap[key]) playerMap[key] = { name:p.name, team:team.name, pos:p.pos||'', posCounts:{}, gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0 };
        const s = playerMap[key];
        s.gp++; s.pts+=(p.pts||0); s.reb+=(p.reb||0); s.ast+=(p.ast||0); s.stl+=(p.stl||0); s.blk+=(p.blk||0);
        s.to+=(p.to||0); s.fgm+=(p.fgm||0); s.fga+=(p.fga||0); s.tpm+=(p.tpm||0); s.tpa+=(p.tpa||0); s.ftm+=(p.ftm||0); s.fta+=(p.fta||0);
        s.gradeSum += gradeToNum(p.grade||'B');
        if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      });
    });
  });
  // Set primary position = most frequent
  Object.values(playerMap).forEach(pl => {
    if(pl.posCounts && Object.keys(pl.posCounts).length)
      pl.pos = Object.entries(pl.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
  });
  const allStats = Object.values(playerMap);

  let filtered = allStats;
  if(teamFilter) filtered = filtered.filter(p => p.team === teamFilter);
  if(posFilter) filtered = filtered.filter(p => p.pos === posFilter);

  // Compute pct fields for sorting
  filtered = filtered.map(p => ({
    ...p,
    fgpct: p.fga > 0 ? p.fgm/p.fga : 0,
    tppct: p.tpa > 0 ? p.tpm/p.tpa : 0,
    ftpct: p.fta > 0 ? p.ftm/p.fta : 0,
    avggrade: p.gp > 0 ? p.gradeSum/p.gp : 0,
    cs: calcCompositeScore(p),
    per: calcPER(p),
  }));

  const col = statsSortCol;
  filtered.sort((a, b) => {
    let va = ['name','team','pos'].includes(col) ? (a[col]||'').toLowerCase() : (a[col]/Math.max(a.gp,1));
    let vb = ['name','team','pos'].includes(col) ? (b[col]||'').toLowerCase() : (b[col]/Math.max(b.gp,1));
    // fgpct/tppct/ftpct already per-game values
    if(['fgpct','tppct','ftpct','gp','avggrade','cs','per'].includes(col)) { va = a[col]; vb = b[col]; }
    if(va < vb) return -1 * statsSortDir;
    if(va > vb) return 1 * statsSortDir;
    return 0;
  });

  // Update sort icons
  const cols = ['name','team','pos','gp','avggrade','cs','per','pts','reb','ast','stl','blk','to','fgpct','tppct','ftpct'];
  cols.forEach(c => {
    const el = document.getElementById('sort-icon-' + c);
    if(!el) return;
    if(c === col) el.textContent = statsSortDir === -1 ? ' ▼' : ' ▲';
    else el.textContent = '';
  });

  // Highlight active header
  document.querySelectorAll('#stats-thead th').forEach(th => {
    th.style.color = '';
  });
  const activeIdx = cols.indexOf(col);
  const ths = document.querySelectorAll('#stats-thead th');
  if(ths[activeIdx]) ths[activeIdx].style.color = 'var(--accent)';

  const tbody = document.getElementById('stats-body');
  if(!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="16" style="text-align:center;padding:2rem;color:var(--muted)">'+t('no_data')+'</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((p) => {
    const avg = v => p.gp > 0 ? (v/p.gp).toFixed(1) : '0.0';
    const fgPct = (p.fga||0) > 0 ? Math.round((p.fgm||0)/(p.fga||0)*100) : 0;
    const tpPct = (p.tpa||0) > 0 ? Math.round((p.tpm||0)/(p.tpa||0)*100) : 0;
    const ftPct = (p.fta||0) > 0 ? Math.round((p.ftm||0)/(p.fta||0)*100) : 0;
    const hl = 'color:var(--accent);font-weight:700';
    const avgGrade = p.gp > 0 ? numToGrade(p.gradeSum/p.gp) : '-';
    return `<tr style="cursor:pointer" onclick="openPlayerModal('${p.name}','${p.team}')">
      <td style="padding-left:1rem;font-weight:600;${col==='name'?hl:''}">${p.name}</td>
      <td style="color:var(--muted);${col==='team'?hl:''}">${p.team}</td>
      <td style="color:var(--accent);font-weight:700;font-size:.8rem;${col==='pos'?hl:''}">${p.pos||''}</td>
      <td style="${col==='gp'?hl:''}">${p.gp}</td>
      <td style="${col==='avggrade'?hl:''}"><span class="grade grade-${avgGrade.replace('+','p').replace('-','m')}">${avgGrade}</span></td>
      <td style="color:var(--accent);font-weight:700;${col==='cs'?hl:''}">${p.cs.toFixed(1)}</td>
      <td style="color:#3498db;font-weight:700;${col==='per'?hl:''}">${p.per.toFixed(1)}</td>
      <td style="${col==='pts'?hl:''}">${avg(p.pts)}</td>
      <td style="${col==='reb'?hl:''}">${avg(p.reb)}</td>
      <td style="${col==='ast'?hl:''}">${avg(p.ast)}</td>
      <td style="${col==='stl'?hl:''}">${avg(p.stl)}</td>
      <td style="${col==='blk'?hl:''}">${avg(p.blk)}</td>
      <td style="${col==='to'?hl:''}">${avg(p.to)}</td>
      <td style="${col==='fgpct'?hl:''}">${fgPct}%</td>
      <td style="${col==='tppct'?hl:''}">${tpPct}%</td>
      <td style="${col==='ftpct'?hl:''}">${ftPct}%</td>
    </tr>`;
  }).join('');
}
// ═══════════════════════════════════════════════════════════════
// PLAYER MODAL
// ═══════════════════════════════════════════════════════════════

function pmShowPos(pos) {
  const posStats = window._pmPosStats || {};
  const s = posStats[pos];
  if (!s) return;

  // Update button styles
  document.querySelectorAll('[id^="pm-pos-btn-"]').forEach(btn => {
    const isActive = btn.id === 'pm-pos-btn-' + pos;
    btn.style.borderColor  = isActive ? 'var(--accent)' : 'var(--border)';
    btn.style.background   = isActive ? 'rgba(245,197,24,.12)' : 'transparent';
    btn.style.color        = isActive ? 'var(--accent)' : 'var(--muted)';
  });

  const wrap = document.getElementById('pm-pos-stats');
  if (!wrap) return;

  const gradeHtml = `<span class="grade grade-${s.grd.replace('+','p').replace('-','m')}">${s.grd}</span>`;
  wrap.innerHTML = [
    ['GRD', gradeHtml], ['PTS', s.pts], ['REB', s.reb], ['AST', s.ast],
    ['STL', s.stl], ['BLK', s.blk], ['TO', s.to],
    ['FG%', s.fg], ['3P%', s.tp], ['FT%', s.ft]
  ].map(([l,v]) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:.5rem;text-align:center">
      <div style="font-size:.65rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:.2rem">${l}</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent)">${v}</div>
    </div>`).join('');
}
function openPlayerModal(playerName, teamName) {
  // Gather all game appearances for this player
  const games = [];
  matches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      if(team.name !== teamName) return;
      const p = (team.players||[]).find(x => x.name === playerName);
      if(!p) return;
      const opp = team === m.team1 ? m.team2 : m.team1;
      const _fgm=p.fgm||0,_fga=p.fga||0,_tpm=p.tpm||0,_tpa=p.tpa||0,_ftm=p.ftm||0,_fta=p.fta||0;
      games.push({ matchId: m.id, date: m.date, opp: opp.name,
        pts:p.pts||0, reb:p.reb||0, ast:p.ast||0, stl:p.stl||0, blk:p.blk||0,
        fol:p.fol||p.fouls||0, to:p.to||0,
        fgm:_fgm, fga:_fga, tpm:_tpm, tpa:_tpa, ftm:_ftm, fta:_fta,
        grade:p.grade||'B', pos:p.pos||'',
        fgpct:_fga>0?Math.round(_fgm/_fga*100):0,
        tppct:_tpa>0?Math.round(_tpm/_tpa*100):0,
        ftpct:_fta>0?Math.round(_ftm/_fta*100):0,
      });
    });
  });
  if(!games.length) return;

  const gp = games.length;
  const avg = key => (games.reduce((s,g) => s+(g[key]||0),0)/gp).toFixed(1);
  const avgGradeNum = games.reduce((s,g) => s+gradeToNum(g.grade),0)/gp;
  const avgGrade = numToGrade(avgGradeNum);
  const fgpct = games.reduce((s,g)=>s+(g.fgm||0),0);
  const fgatt = games.reduce((s,g)=>s+(g.fga||0),0);
  const tpMade = games.reduce((s,g)=>s+(g.tpm||0),0);
  const tpAtt = games.reduce((s,g)=>s+(g.tpa||0),0);
  const ftMade = games.reduce((s,g)=>s+(g.ftm||0),0);
  const ftAtt = games.reduce((s,g)=>s+(g.fta||0),0);

  const gameRows = [...games].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(g => `
    <tr>
      <td>${formatDate(g.date)}</td>
      <td style="color:var(--muted)">${g.opp}</td>
      <td><span style="font-size:.75rem;font-weight:700;color:var(--accent)">${g.pos||'—'}</span></td>
      <td><span class="grade grade-${(g.grade||'B').replace('+','p').replace('-','m')}">${g.grade||'B'}</span></td>
      <td>${g.pts||0}</td><td>${g.reb||0}</td><td>${g.ast||0}</td><td>${g.stl||0}</td><td>${g.blk||0}</td><td>${g.to||0}</td>
      <td>${g.fgm||0}/${g.fga||0}<span style="color:var(--muted);font-size:0.7rem"> ${g.fgpct||0}%</span></td>
      <td>${g.tpm||0}/${g.tpa||0}<span style="color:var(--muted);font-size:0.7rem"> ${g.tppct||0}%</span></td>
      <td>${g.ftm||0}/${g.fta||0}<span style="color:var(--muted);font-size:0.7rem"> ${g.ftpct||0}%</span></td>
    </tr>`).join('');

  // Primary position = most frequent
  const posCounts = {};
  games.forEach(g => { if(g.pos) posCounts[g.pos] = (posCounts[g.pos]||0)+1; });
  const primaryPos = Object.keys(posCounts).length
    ? Object.entries(posCounts).sort((a,b)=>b[1]-a[1])[0][0]
    : (games[0]?.pos || '—');
  // Fill missing positions with primaryPos (for old imported matches)
  if(primaryPos && primaryPos !== '—') {
    games.forEach(g => { if(!g.pos) g.pos = primaryPos; });
    // Recount including filled positions
    games.forEach(g => { if(g.pos) posCounts[g.pos] = (posCounts[g.pos]||0); });
  }
  const posBreakdown = Object.entries(posCounts).sort((a,b)=>b[1]-a[1])
    .map(([p,c])=>`${p} ${c}x`).join(' · ');

  // Per-position stats
  const positions = ['PG','SG','SF','PF','C'];
  const posStats = {};
  positions.forEach(pos => {
    const pg = games.filter(g => g.pos === pos);
    if (!pg.length) return;
    const n = pg.length;
    const sum = k => pg.reduce((s,g)=>s+(g[k]||0),0);
    const fgm=sum('fgm'),fga=sum('fga'),tpm=sum('tpm'),tpa=sum('tpa'),ftm=sum('ftm'),fta=sum('fta');
    const gradeAvg = numToGrade(pg.reduce((s,g)=>s+gradeToNum(g.grade||'B'),0)/n);
    posStats[pos] = {
      n, grd: gradeAvg,
      pts:(sum('pts')/n).toFixed(1), reb:(sum('reb')/n).toFixed(1),
      ast:(sum('ast')/n).toFixed(1), stl:(sum('stl')/n).toFixed(1),
      blk:(sum('blk')/n).toFixed(1), to:(sum('to')/n).toFixed(1),
      fg: fga>0?Math.round(fgm/fga*100)+'%':'—',
      tp: tpa>0?Math.round(tpm/tpa*100)+'%':'—',
      ft: fta>0?Math.round(ftm/fta*100)+'%':'—',
    };
  });
  const posStatsHtml = Object.keys(posStats).length > 1 ? `
    <div style="margin-bottom:1.5rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem">Statystyki per pozycja</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap">
        ${Object.entries(posStats).map(([pos,s],i)=>`
          <button onclick="pmShowPos('${pos}')" id="pm-pos-btn-${pos}"
            style="padding:.25rem .7rem;border-radius:6px;border:1px solid ${i===0?'var(--accent)':'var(--border)'};
            background:${i===0?'rgba(245,197,24,.12)':'transparent'};
            color:${i===0?'var(--accent)':'var(--muted)'};font-family:inherit;font-size:.8rem;font-weight:700;cursor:pointer">
            ${pos} <span style="font-weight:400;font-size:.75rem">(${s.n}g)</span>
          </button>`).join('')}
      </div>
      <div id="pm-pos-stats" style="margin-top:.75rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.5rem">
        ${(()=>{const s=Object.values(posStats)[0];return [['GRD',`<span class="grade grade-${s.grd.replace('+','p').replace('-','m')}">${s.grd}</span>`],['PTS',s.pts],['REB',s.reb],['AST',s.ast],['STL',s.stl],['BLK',s.blk],['TO',s.to],['FG%',s.fg],['3P%',s.tp],['FT%',s.ft]].map(([l,v])=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:.5rem;text-align:center"><div style="font-size:.65rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:.2rem">${l}</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent)">${v}</div></div>`).join('');})()}
      </div>
    </div>` : '';

  // Store posStats globally for pmShowPos
  window._pmPosStats = posStats;

  document.getElementById('player-modal-content').innerHTML = `
    <div style="margin-bottom:1.5rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;letter-spacing:2px;text-transform:uppercase">${playerName}</div>
      <div style="color:var(--muted);font-size:0.9rem;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
        ${teamLogo(teamName,24,'.65rem')}<span>${teamName}</span>
        <span style="color:var(--muted)">·</span>
        <span class="pos-label" data-player="${playerName.replace(/"/g,'&quot;')}" style="color:var(--accent);font-weight:700;min-width:1.5rem">${primaryPos}</span>
        ${Object.keys(posCounts).length > 1 ? `<span style="color:var(--muted);font-size:.75rem">(${posBreakdown})</span>` : ''}
        ${_isLoggedInSync() ? `<select data-player="${playerName.replace(/"/g,'&quot;')}" data-team="${teamName.replace(/"/g,'&quot;')}" onchange="savePlayerPositionFromSelect(this)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.15rem .35rem;font-size:.75rem;font-family:inherit;cursor:pointer">
          <option value="">— brak —</option>
          ${['PG','SG','SF','PF','C'].map(pos=>`<option value="${pos}" ${primaryPos === pos?'selected':''}>${pos}</option>`).join('')}
        </select>` : ''}
        <span style="color:var(--muted)">·</span>
        <span>${gp} meczy</span>
        <button onclick="openPlayerCardImg(this.dataset.n)" data-n="${_h(playerName)}" style="background:var(--accent);border:1px solid var(--accent);color:#0b0e14;font-weight:800;border-radius:6px;padding:.2rem .6rem;font-size:.75rem;cursor:pointer;font-family:inherit">🃏 Karta gracza</button>
        <button onclick="openPlayerH2H('${playerName}','${teamName}')" style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.2rem .6rem;font-size:.75rem;cursor:pointer;font-family:inherit">⚔️ H2H</button>
        <button onclick="shareLink('p', this.dataset.n, this.dataset.n)" data-n="${_h(playerName)}" title="Link z podglądem do wklejenia na Discord / X" style="background:var(--surface2);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.2rem .6rem;font-size:.75rem;cursor:pointer;font-family:inherit">🔗 Udostępnij</button>'
      </div>
    </div>

    ${posStatsHtml}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.75rem;margin-bottom:1.75rem">
      ${[
        ['GRD',`<span class="grade grade-${avgGrade.replace('+','p').replace('-','m')}">${avgGrade}</span>`],
        ['PTS',avg('pts')],['REB',avg('reb')],['AST',avg('ast')],
        ['STL',avg('stl')],['BLK',avg('blk')],['TO',avg('to')],
        ['FG%', fgatt>0?Math.round(fgpct/fgatt*100)+'%':'0%'],
        ['3P%', tpAtt>0?Math.round(tpMade/tpAtt*100)+'%':'0%'],
        ['FT%', ftAtt>0?Math.round(ftMade/ftAtt*100)+'%':'0%'],
      ].map(([label,val])=>`
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:0.75rem;text-align:center">
          <div style="font-size:0.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:0.35rem">${label}</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;color:var(--accent)">${val}</div>
        </div>`).join('')}
    </div>

    <div style="display:flex;gap:.75rem;margin-bottom:1.25rem">
      <div style="flex:1;background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.25);border-radius:10px;padding:.75rem;text-align:center">
        <div style="font-size:.65rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.25rem">Composite Score</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:var(--accent)">${(()=>{const _p={gp,pts:games.reduce((s,g)=>s+(g.pts||0),0),reb:games.reduce((s,g)=>s+(g.reb||0),0),ast:games.reduce((s,g)=>s+(g.ast||0),0),stl:games.reduce((s,g)=>s+(g.stl||0),0),blk:games.reduce((s,g)=>s+(g.blk||0),0),to:games.reduce((s,g)=>s+(g.to||0),0),fgm:games.reduce((s,g)=>s+(g.fgm||0),0),fga:games.reduce((s,g)=>s+(g.fga||0),0),gradeSum:games.reduce((s,g)=>s+gradeToNum(g.grade||'B'),0)};return calcCompositeScore(_p).toFixed(1);})()}</div>
        <div style="font-size:.7rem;color:var(--muted)">wyżej = lepiej</div>
      </div>
      <div style="flex:1;background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.25);border-radius:10px;padding:.75rem;text-align:center">
        <div style="font-size:.65rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.25rem">PER</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:#3498db">${(()=>{const _p={gp,pts:games.reduce((s,g)=>s+(g.pts||0),0),reb:games.reduce((s,g)=>s+(g.reb||0),0),ast:games.reduce((s,g)=>s+(g.ast||0),0),stl:games.reduce((s,g)=>s+(g.stl||0),0),blk:games.reduce((s,g)=>s+(g.blk||0),0),to:games.reduce((s,g)=>s+(g.to||0),0),fgm:games.reduce((s,g)=>s+(g.fgm||0),0),fga:games.reduce((s,g)=>s+(g.fga||0),0),ftm:games.reduce((s,g)=>s+(g.ftm||0),0),fta:games.reduce((s,g)=>s+(g.fta||0),0)};return calcPER(_p).toFixed(1);})()}</div>
        <div style="font-size:.7rem;color:var(--muted)">wyżej = lepiej</div>
      </div>
    </div>
    <div id="player-form-chart" style="margin-bottom:1.5rem;padding:1rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px"></div>
    <div id="player-top-games" style="margin-bottom:1.5rem"></div>
    <div id="player-season-comparison" style="margin-bottom:1.5rem"></div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;text-transform:uppercase;margin-bottom:0.75rem;color:var(--muted)">Historia meczów</div>
    <div class="stats-table-wrap">
      <table>
        <thead><tr>
          <th style="text-align:left">Data</th><th style="text-align:left">vs</th>
          <th>POZ</th><th>GRD</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>FG</th><th>3P</th><th>FT</th>
        </tr></thead>
        <tbody>${gameRows}</tbody>
      </table>
    </div>`;


  // Career best + hot streak
  const _bestPts=Math.max(...games.map(g=>g.pts||0));
  const _bestReb=Math.max(...games.map(g=>g.reb||0));
  const _bestAst=Math.max(...games.map(g=>g.ast||0));
  const _bestStl=Math.max(...games.map(g=>g.stl||0));
  const _bestBlk=Math.max(...games.map(g=>g.blk||0));
  const _hot=getHotPlayers();
  const _hotBanner=_hot.has(playerName)?'<div style="background:linear-gradient(90deg,#ff6b35,#ff9a00);color:#fff;padding:.5rem 1rem;border-radius:6px;margin-bottom:1rem;font-weight:700;font-size:.9rem">\uD83D\uDD25 HOT STREAK — A- lub lepsza w ostatnich 3 meczach!</div>':'';
  const _bestRow='<div class="cbrow"><div style="font-size:.75rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);width:100%">\uD83C\uDFC6 Rekordy kariery</div>'+[['PTS',_bestPts],['REB',_bestReb],['AST',_bestAst],['STL',_bestStl],['BLK',_bestBlk]].map(([k,v])=>'<div class="cbi"><div class="cbil">'+k+'</div><div class="cbiv">'+v+'</div></div>').join('')+'</div>';
  const _pmEl=document.getElementById('player-modal-content');
  _pmEl.innerHTML=_hotBanner+_pmEl.innerHTML;
  const _pmGrid=_pmEl.querySelector('[style*="display:grid"]');
  if(_pmGrid) _pmGrid.insertAdjacentHTML('beforebegin',_bestRow);
  try { if(_pmGrid) _pmGrid.insertAdjacentHTML('beforebegin', _pcSkillsHtml(playerName)); } catch(e) { console.warn('skills', e); }
  try { _pmEl.insertAdjacentHTML('beforeend', _advPlayerHtml(playerName)); } catch(e) { console.warn('adv', e); }
  document.getElementById('player-modal').classList.add('open');
  // Render form chart
  const _chartId = 'player-form-chart';
  const _chartGames = [...games].sort((a,b)=>new Date(a.date)-new Date(b.date));
  // Add vs opponent info
  _chartGames.forEach(g => {
    const m = matches.find(x => x.id === g.matchId);
    if(m) g.vs = m.team1.name === teamName ? m.team2.name : m.team1.name;
  });
  setTimeout(() => renderFormChart(_chartGames, _chartId), 50);
  setTimeout(() => renderTopGamesSection(games, playerName, teamName, 'player-top-games'), 50);
  setTimeout(() => renderSeasonComparisonSection(playerName, teamName, 'player-season-comparison'), 50);
}
// ═══════════════════════════════════════════════════════════════
// PLAYER FORM CHART
// ═══════════════════════════════════════════════════════════════
function renderFormChart(games, containerId) {
  const el = document.getElementById(containerId);
  if(!el || games.length < 2) {
    if(el) el.innerHTML = '<div style="color:var(--muted);font-size:.8rem;padding:.5rem">Minimum 2 mecze do wyświetlenia wykresu</div>';
    return;
  }

  // Sort chronologically
  const sorted = [...games].sort((a,b) => new Date(a.date)-new Date(b.date));
  const METRICS = [
    { key: 'pts', label: 'PTS', color: '#f5c518' },
    { key: 'ast', label: 'AST', color: '#3498db' },
    { key: 'reb', label: 'REB', color: '#2ecc71' },
    { key: 'fgPct', label: 'FG%', color: '#e74c3c', pct: true },
    { key: 'tpPct', label: '3P%', color: '#9b59b6', pct: true },
  ];

  // Compute values
  const data = sorted.map(g => ({
    label: formatDate(g.date) + (g.vs ? ' vs '+g.vs : ''),
    pts: g.pts||0,
    ast: g.ast||0,
    reb: g.reb||0,
    fgPct: g.fga>0 ? Math.round(g.fgm/g.fga*100) : 0,
    tpPct: g.tpa>0 ? Math.round(g.tpm/g.tpa*100) : 0,
    grade: g.grade||'B',
    gradeN: g.gradeN||0,
  }));

  const W = el.offsetWidth || 420;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 48, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = data.length;
  const xStep = n > 1 ? chartW / (n-1) : chartW;

  // Active metric state
  const stateKey = 'chart_metric_' + containerId;
  const activeMet = el._metric || 'pts';

  const met = METRICS.find(m => m.key === activeMet);
  const vals = data.map(d => d[met.key]);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const range = maxV - minV || 1;

  const px = i => PAD.left + i * xStep;
  const py = v => PAD.top + chartH - ((v - minV) / range * chartH);

  // Build SVG path
  const pathD = vals.map((v,i) => (i===0?'M':'L') + px(i).toFixed(1)+','+py(v).toFixed(1)).join(' ');
  const areaD = pathD + ' L'+px(n-1).toFixed(1)+','+(PAD.top+chartH)+' L'+PAD.left.toFixed(1)+','+(PAD.top+chartH)+' Z';

  // Y axis ticks
  const ticks = 4;
  const yTicks = Array.from({length:ticks+1},(_,i)=>minV + (range/ticks)*i);

  // Dots + tooltips
  const dots = vals.map((v,i) => {
    const gr = data[i].grade;
    const grColor = gr.startsWith('A')?'#f5c518':gr.startsWith('B')?'#3498db':gr.startsWith('C')?'#95a5a6':'#e74c3c';
    return `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="5" fill="${grColor}" stroke="${met.color}" stroke-width="2">
      <title>${data[i].label}\n${met.label}: ${v}${met.pct?'%':''}\nOcena: ${gr}</title>
    </circle>`;
  }).join('');

  // X labels (show max 6)
  const step = Math.ceil(n/6);
  const xLabels = data.map((d,i) => i%step===0||i===n-1 ? `<text x="${px(i).toFixed(1)}" y="${H-6}" text-anchor="middle" fill="var(--muted)" font-size="9">${d.label.split(' ')[0]}</text>` : '').join('');

  const yLabels = yTicks.map(v => `<text x="${PAD.left-4}" y="${py(v).toFixed(1)+4}" text-anchor="end" fill="var(--muted)" font-size="9">${Math.round(v)}${met.pct?'%':''}</text>`).join('');
  const gridLines = yTicks.map(v => `<line x1="${PAD.left}" y1="${py(v).toFixed(1)}" x2="${PAD.left+chartW}" y2="${py(v).toFixed(1)}" stroke="var(--border)" stroke-width="0.5"/>`).join('');

  // Metric buttons
  const btns = METRICS.map(m => `<button onclick="document.getElementById('player-form-chart')._metric='${m.key}';renderFormChart(window._chartGames_player_form_chart,'player-form-chart')" style="padding:.2rem .6rem;border:1px solid ${m.key===activeMet?m.color:'var(--border)'};background:${m.key===activeMet?m.color+'22':'transparent'};color:${m.key===activeMet?m.color:'var(--muted)'};border-radius:4px;font-size:.75rem;cursor:pointer;font-family:inherit;transition:all .2s">${m.label}</button>`).join('');

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted)">📈 Trend formy</div>
      <div style="display:flex;gap:.35rem">${btns}</div>
    </div>
    <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
      <defs>
        <linearGradient id="grad_${containerId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${met.color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${met.color}" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${gridLines}
      ${yLabels}
      ${xLabels}
      <path d="${areaD}" fill="url(#grad_${containerId})"/>
      <path d="${pathD}" fill="none" stroke="${met.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>`;

  // Store games reference for re-render on metric switch
  window['_chartGames_' + containerId.replace(/-/g,'_')] = games;
}
function triggerImport() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json';
  inp.onchange = async e => {
    const file = e.target.files[0];
    if(!file) return;
    const text = await file.text();
    try {
      _importBuffer = JSON.parse(text);
      showImportPreview(_importBuffer);
    } catch(err) {
      showToast(t('err_json_file') + err.message, 'error');
    }
  };
  inp.click();
}
function showImportPreview(data) {
  const allMatches = data.matches || [];
  const season = data.season;
  const modal = document.getElementById('import-modal');
  const content = document.getElementById('import-modal-content');

  const rows = allMatches.map((m, idx) => {
    const d = m.date ? new Date(m.date).toLocaleDateString('pl-PL',{day:'numeric',month:'short'}) : '?';
    const w = m.team1.score > m.team2.score ? m.team1.name : m.team2.name;
    return `<tr>
      <td style="padding:.4rem .6rem"><input type="checkbox" class="import-chk" data-idx="${idx}" checked style="cursor:pointer;width:16px;height:16px"></td>
      <td style="padding:.4rem .6rem;color:var(--muted);font-size:.8rem">${d}</td>
      <td style="padding:.4rem .6rem;font-weight:600">${m.team1.name}</td>
      <td style="padding:.4rem .6rem;text-align:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;color:var(--accent)">${m.team1.score} — ${m.team2.score}</td>
      <td style="padding:.4rem .6rem;font-weight:600">${m.team2.name}</td>
      <td style="padding:.4rem .6rem;font-size:.75rem;color:var(--muted)">${m.note||''}</td>
    </tr>`;
  }).join('');

  content.innerHTML = `
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surface);z-index:1">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:2px;margin-bottom:.25rem">📥 Wybierz mecze do importu</div>
      <div style="font-size:.8rem;color:var(--muted);margin-bottom:.75rem">Sezon: <strong style="color:var(--accent)">${season?.name||'?'}</strong> · ${allMatches.length} '+t('games_count')+'</div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button onclick="document.querySelectorAll('.import-chk').forEach(c=>c.checked=true)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.3rem .75rem;border-radius:6px;cursor:pointer;font-family:inherit;font-size:.8rem">✅ Zaznacz wszystkie</button>
        <button onclick="document.querySelectorAll('.import-chk').forEach(c=>c.checked=false)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.3rem .75rem;border-radius:6px;cursor:pointer;font-family:inherit;font-size:.8rem">☐ Odznacz wszystkie</button>
        <button onclick="confirmImport()" class="btn btn-primary" style="font-size:.85rem">📥 Importuj zaznaczone</button>
      </div>
    </div>
    <div style="padding:1rem 1.5rem">
      <div class="stats-table-wrap">
        <table style="width:100%">
          <thead><tr>
            <th style="width:30px"></th>
            <th style="text-align:left">Data</th>
            <th style="text-align:left" data-i18n="team1_lbl">Drużyna 1</th>
            <th>Wynik</th>
            <th style="text-align:left" data-i18n="team2_lbl">Drużyna 2</th>
            <th style="text-align:left">Notatka</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  modal.classList.add('open');
}
async function confirmImport() {
  const checked = [...document.querySelectorAll('.import-chk:checked')].map(c => Number(c.dataset.idx));
  if(!checked.length) { showToast(t('no_matches_selected'), 'info'); return; }

  const data = _importBuffer;
  const toImport = checked.map(i => data.matches[i]);
  const season = data.season;

  // Match season by name (not ID) to avoid duplicates
  let resolvedSeasonId = null;
  if(season) {
    const existing = seasons.find(s => s.name.trim().toLowerCase() === season.name.trim().toLowerCase());
    if(existing) {
      resolvedSeasonId = existing.id; // reuse existing season ID
    } else {
      seasons.push(season);
      resolvedSeasonId = season.id;
    }
  }

  const maxId = matches.length > 0 ? Math.max(...matches.map(m => Number(m.id))) : 0;
  let nextId = maxId + 1;
  toImport.forEach(m => {
    m.id = nextId++;
    if(resolvedSeasonId) m.seasonId = resolvedSeasonId; // assign correct season ID
  });

  matches = [...matches, ...toImport];

  if(!jbKey) {
    showToast(t('err_no_master_key_import'), 'error');
    return;
  }

  showToast(t('saving_db'), 'info');
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${jbBin}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': jbKey },
      body: JSON.stringify({ matches, aliases, seasons, currentSeasonId, schedule })
    });
    if(!res.ok) {
      const err = await res.json();
      showToast(t('err_save_status') + (err.message || res.status), 'error');
      return;
    }
    document.getElementById('import-modal').classList.remove('open');
    showToast(t('imported_ok')+' '+toImport.length+' '+t('matches_suffix'), 'success');
    renderDashboard();
    renderMatches();
  } catch(e) {
    showToast(t('err_connect') + e.message, 'error');
  }
}
async function saveWalkover() {
  const winner = document.getElementById('wo-winner')?.value.trim();
  const loser  = document.getElementById('wo-loser')?.value.trim();
  const date   = document.getElementById('wo-date')?.value;
  const note   = document.getElementById('wo-note')?.value.trim() || 'Walkower';
  if(!winner || !loser) { showToast(t('err_enter_teams'), 'error'); return; }
  if(winner === loser)  { showToast(t('err_teams_diff'), 'error'); return; }
  if(!date)             { showToast(t('err_pick_date'), 'error'); return; }

  const maxId = matches.length > 0 ? Math.max(...matches.map(m=>Number(m.id))) : 0;
  const newMatch = {
    id: maxId + 1,
    date,
    note: note + ' (W/O)',
    walkover: true,
    seasonId: currentSeasonId || null,
    team1: { name: winner, score: 20, players: [], quarters: [] },
    team2: { name: loser,  score: 0,  players: [], quarters: [] },
  };
  matches.push(newMatch);
  await saveData();
  showToast(`✅ Walkower zapisany: ${winner} 20:0 ${loser}`, 'success');
  document.getElementById('wo-winner').value = '';
  document.getElementById('wo-loser').value  = '';
  document.getElementById('wo-note').value   = '';
  renderDashboard();
  renderMatches();
}
// ═══════════════════════════════════════════════════════════════
// ROUNDS MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function addRound() {
  const label = document.getElementById('round-label')?.value.trim();
  const from  = document.getElementById('round-from')?.value;
  const to    = document.getElementById('round-to')?.value;
  if(!label||!from||!to) { showToast(t('err_fill_all'), 'error'); return; }
  if(from > to) { showToast(t('err_date_order'), 'error'); return; }
  rounds.push({ id: Date.now(), label, from, to });
  rounds.sort((a,b) => a.from.localeCompare(b.from));
  saveData().then(() => { showToast('✅ Kolejka dodana', 'success'); renderRoundsList(); renderTeamOfWeek(); });
  document.getElementById('round-label').value = '';
  document.getElementById('round-from').value = '';
  document.getElementById('round-to').value = '';
}
function deleteRound(id) {
  rounds = rounds.filter(r => r.id !== id);
  saveData().then(() => { showToast(t('round_deleted'), 'info'); renderRoundsList(); renderTeamOfWeek(); });
}
function renderRoundsList() {
  const section = document.getElementById('rounds-admin-section');
  if(section) section.style.display = _isLoggedInSync() ? 'block' : 'none';
  const el = document.getElementById('rounds-list');
  if(!el) return;
  const today = new Date().toISOString().slice(0,10);
  if(!rounds.length) { el.innerHTML = '<p style="color:var(--muted);font-size:.85rem">Brak zdefiniowanych kolejek.</p>'; return; }
  el.innerHTML = rounds.map(r => {
    const active = today >= r.from && today <= r.to;
    return `<div style="display:flex;align-items:center;gap:.75rem;padding:.5rem .75rem;background:var(--surface2);border:1px solid ${active?'var(--accent)':'var(--border)'};border-radius:8px;margin-bottom:.4rem">
      ${active ? '<span style="color:var(--accent);font-size:.75rem;font-weight:700">● AKTYWNA</span>' : ''}
      <span style="font-weight:700;flex:1">${r.label}</span>
      <span style="color:var(--muted);font-size:.8rem">${r.from} → ${r.to}</span>
      <button onclick="deleteRound(${r.id})" style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.2rem .5rem;font-size:.75rem;cursor:pointer">🗑</button>
    </div>`;
  }).join('');
}
// ═══════════════════════════════════════════════════════════════
// TEAM ALIASES
// ═══════════════════════════════════════════════════════════════
function saveTeamAliases() {
  localStorage.setItem('nba2k_team_aliases', JSON.stringify(teamAliases));
}
function addTeamAlias() {
  const wrong = document.getElementById('talias-wrong')?.value.trim();
  const correct = document.getElementById('talias-correct')?.value.trim();
  if(!wrong||!correct){showToast(t('err_fill_both'),'error');return;}
  if(wrong===correct){showToast(t('err_names_diff'),'error');return;}
  teamAliases[wrong]=correct; saveTeamAliases();
  document.getElementById('talias-wrong').value='';
  document.getElementById('talias-correct').value='';
  renderTeamAliases(); showToast('✅ Alias dodany','success');
}
function removeTeamAlias(wrong) {
  delete teamAliases[wrong]; saveTeamAliases(); renderTeamAliases();
}
function renderTeamAliases() {
  const container = document.getElementById('team-aliases-list');
  if(!container) return;
  const dl = document.getElementById('talias-teams-list');
  if(dl) {
    const all = [...new Set(matches.flatMap(m=>[m.team1.name,m.team2.name]))].sort();
    dl.innerHTML = all.map(tn=>`<option value="${tn}">`).join('');
  }
  const entries = Object.entries(teamAliases);
  if(!entries.length){container.innerHTML='<p style="color:var(--muted);font-size:.85rem;padding:.5rem 0">'+t('no_alias')+'</p>';return;}
  container.innerHTML=`<table style="width:100%;border-collapse:collapse"><thead><tr>
    <th style="text-align:left;padding:.5rem .75rem;font-size:.75rem;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)">Stara nazwa</th>
    <th style="text-align:left;padding:.5rem .75rem;font-size:.75rem;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)">→ Nowa nazwa</th>
    <th style="border-bottom:1px solid var(--border)"></th>
  </tr></thead><tbody>${entries.map(([w,c])=>`
    <tr>
      <td style="padding:.5rem .75rem;color:var(--loss)">${w}</td>
      <td style="padding:.5rem .75rem;color:var(--win);font-weight:600">${c}</td>
      <td style="padding:.5rem .75rem;text-align:right"><button onclick="removeTeamAlias('${w.replace(/'/g,"\'")}')" style="background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:1rem">✕</button></td>
    </tr>`).join('')}</tbody></table>`;
}
function applyTeamAliasesToAllMatches() {
  let changed=0;
  matches.forEach(m=>{
    if(teamAliases[m.team1.name]){m.team1.name=teamAliases[m.team1.name];changed++;}
    if(teamAliases[m.team2.name]){m.team2.name=teamAliases[m.team2.name];changed++;}
  });
  const el=document.getElementById('talias-result');
  if(changed>0){
    saveData();renderStats();renderMatches();renderDashboard();
    if(el){el.textContent=t('teams_updated');setTimeout(()=>el.textContent='',3000);}
  } else {
    if(el){el.textContent='Brak zmian.';setTimeout(()=>el.textContent='',3000);}
  }
}
function saveTeams() {
  window.teams = teams;
  saveData(); // persist to JSONBin so all users see logos
}
function renderTeamsSection() {
  const section = document.getElementById('teams-admin-section');
  if(!section) return;
  section.style.display = _isLoggedInSync() ? 'block' : 'none';
  renderTeamsList();
}
function renderTeamsList() {
  const el = document.getElementById('teams-list');
  if(!el) return;
  // Merge: teams from matches + manually added
  const matchTeams = [...new Set(matches.flatMap(m=>[m.team1.name,m.team2.name]))];
  const schedTeams = [...new Set(schedule.map(s=>[s.team1,s.team2]).flat().filter(Boolean))];
  const allTeams = [...new Set([...Object.keys(teams), ...matchTeams, ...schedTeams])].sort();

  if(!allTeams.length) { el.innerHTML='<div style="color:var(--muted);font-size:.85rem">'+t('no_teams')+'</div>'; return; }

  el.innerHTML = allTeams.map(name => {
    const t = teams[name] || {};
    const logoHtml = t.logo
      ? `<img src="${t.logo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid var(--border)">`
      : teamLogo(name, 40, '1rem');
    return `<div style="display:flex;align-items:center;gap:.75rem;padding:.6rem .75rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;margin-bottom:.5rem">
      ${logoHtml}
      <input type="text" value="${name}" data-orig="${name}"
        style="font-weight:700;flex:1;background:transparent;border:none;border-bottom:1px solid transparent;color:var(--text);font-family:inherit;font-size:.95rem;padding:.1rem .2rem;outline:none"
        onfocus="this.style.borderBottomColor='var(--accent)';this.style.background='var(--surface2)'"
        onblur="this.style.borderBottomColor='transparent';this.style.background='transparent';renameTeam(this.dataset.orig,this.value)"
        onkeydown="if(event.key==='Enter')this.blur()">
      <label style="cursor:pointer;background:var(--surface);border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.3rem .7rem;font-size:.75rem;font-family:inherit">
        📁 Logo
        <input type="file" accept="image/png,image/jpeg,image/webp" style="display:none" onchange="uploadTeamLogo('${name.replace(/'/g,"\'")}', this)">
      </label>
      ${t.logo ? `<button onclick="removeTeamLogo('${name.replace(/'/g,"\'")}'"  style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.3rem .6rem;font-size:.75rem;cursor:pointer">✕ Logo</button>` : ''}
      <button onclick="deleteTeam('${name.replace(/'/g,"\'")}')" style="background:transparent;border:1px solid var(--loss);color:var(--loss);border-radius:6px;padding:.3rem .6rem;font-size:.75rem;cursor:pointer" title="Śsyń drużynę">🗑</button>
    </div>`;
  }).join('');
}
function addTeamEntry() {
  const inp = document.getElementById('new-team-name');
  const name = inp?.value.trim();
  if(!name) { showToast(t('err_enter_team'), 'error'); return; }
  if(!teams[name]) teams[name] = {};
  saveTeams();
  inp.value = '';
  renderTeamsList();
  showToast(t('team_added')+' '+name, 'success');
}
function uploadTeamLogo(teamName, input) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      // Resize to max 200x200px PNG
      const MAX = 200;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/png');
      const kb = (compressed.length * 0.75 / 1024).toFixed(1);
      if(!teams[teamName]) teams[teamName] = {};
      teams[teamName].logo = compressed;
      saveTeams();
      const _reg = teamRegistrations.find(r => r.status !== 'rejected' && String(r.teamName).toLowerCase() === String(teamName).toLowerCase());
      if(_reg) _api('/team-logo', 'POST', { regId: _reg.id, dataUrl: compressed }, { admin: true }).then(res => { if(res.ok) { Object.assign(_reg, res.registration); renderTeamsList(); } });
      renderTeamsList();
      showToast(`✅ Logo wgrane (${kb}KB) dla: ${teamName}`, 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
function removeTeamLogo(teamName) {
  if(teams[teamName]) delete teams[teamName].logo;
  const _reg = teamRegistrations.find(r => r.logo && r.status !== 'rejected' && String(r.teamName).toLowerCase() === String(teamName).toLowerCase());
  if(_reg) _api('/team-logo', 'POST', { regId: _reg.id, remove: true }, { admin: true }).then(res => { if(res.ok) { delete _reg.logo; renderTeamsList(); } });

  saveTeams();
  renderTeamsList();
  showToast(t('logo_deleted'), 'info');
}
// teamLogo checks custom logo first, then falls back to initials
// NOTE: the original teamLogo function is defined earlier — we patch it here safely
function teamLogoInitials(name, size=40, fontSize='1rem') {
  const color = teamColor(name);
  const initials = teamInitials(name);
  return `<div style="width:${size}px;height:${size}px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${fontSize};color:#fff;flex-shrink:0;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,.4)">${initials}</div>`;
}
function openScheduleAdd(editId) {
  const existing = editId ? schedule.find(s=>s.id===editId) : null;
  const teams = [...new Set([...Object.keys(window.teams||{}), ...matches.flatMap(m=>[m.team1.name,m.team2.name])])].sort();
  const teamOpts = teams.map(tn=>`<option value="${tn}">${tn}</option>`).join('');
  const modal = document.getElementById('schedule-modal');
  document.getElementById('schedule-modal-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:1.25rem">${existing?'✏️ Edytuj mecz':'➕ Dodaj planowany mecz'}</div>
    <div style="display:flex;flex-direction:column;gap:.75rem">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center">
        <div>
          <input id="sch-t1" type="text" list="sch-teams-list" placeholder="Drużyna 1..." style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;box-sizing:border-box">
        </div>
        <span style="color:var(--muted);font-weight:700">VS</span>
        <div>
          <input id="sch-t2" type="text" list="sch-teams-list" placeholder="Drużyna 2..." style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;box-sizing:border-box">
        </div>
      </div>
      <datalist id="sch-teams-list">${[...new Set([...Object.keys(window.teams||{}), ...teams])].sort().map(tn=>`<option value="${tn}">`).join('')}</datalist>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
        <div><label style="font-size:.75rem;color:var(--muted);display:block;margin-bottom:.25rem">DATA</label>
          <input type="date" id="sch-date" value="${existing?.date||''}" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;box-sizing:border-box"></div>
        <div><label style="font-size:.75rem;color:var(--muted);display:block;margin-bottom:.25rem">GODZINA</label>
          <input type="time" id="sch-time" value="${existing?.time||''}" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;box-sizing:border-box"></div>
      </div>
      <div><label style="font-size:.75rem;color:var(--muted);display:block;margin-bottom:.25rem">LINK DO STREAMA (opcjonalnie)</label>
        <input type="url" id="sch-stream" placeholder="https://twitch.tv/..." value="${existing?.streamUrl||''}" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;box-sizing:border-box"></div>
      <div><label style="font-size:.75rem;color:var(--muted);display:block;margin-bottom:.25rem">SEZON</label>
        <select id="sch-season" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit">
          <option value="">Brak</option>
          ${seasons.map(s=>`<option value="${s.id}" ${existing?.seasonId===s.id?'selected':''}>${s.name}</option>`).join('')}
        </select></div>
      <button class="btn btn-primary" onclick="saveScheduleMatch(${editId||'null'})" style="width:100%;margin-top:.5rem">'+t('save_ok')+'</button>
    </div>`;
  if(existing) {
    setTimeout(()=>{
      const t1=document.getElementById('sch-t1'); if(t1) t1.value=existing.team1||'';
      const t2=document.getElementById('sch-t2'); if(t2) t2.value=existing.team2||'';
    },10);
  }
  modal.classList.add('open');
}
function openScheduleEdit(id) { openScheduleAdd(id); }
function saveScheduleMatch(editId) {
  const t1 = document.getElementById('sch-t1')?.value;
  const t2 = document.getElementById('sch-t2')?.value;
  const date = document.getElementById('sch-date')?.value;
  const time = document.getElementById('sch-time')?.value;
  const streamUrl = document.getElementById('sch-stream')?.value;
  const seasonId = document.getElementById('sch-season')?.value || null;
  if(!t1||!t2||t1===t2) { showToast(t('err_pick_two_teams'), 'error'); return; }
  if(!date) { showToast(t('err_pick_date2'), 'error'); return; }
  if(editId) {
    const idx = schedule.findIndex(s=>s.id===editId);
    if(idx!==-1) schedule[idx] = {...schedule[idx], team1:t1, team2:t2, date, time, streamUrl, seasonId};
  } else {
    schedule.push({ id: Date.now(), team1:t1, team2:t2, date, time, streamUrl, seasonId, played:false, prediction:null, matchId:null });
  }
  saveData().then(()=>{ showToast('✅ Zapisano!','success'); document.getElementById('schedule-modal').classList.remove('open'); renderSchedule(); });
}
function deleteScheduleMatch(id) {
  schedule = schedule.filter(s=>s.id!==id);
  saveData().then(()=>{ showToast(t('deleted_lbl'),'info'); renderSchedule(); });
}
function linkScheduleMatch(schedId) {
  const unlinked = matches.filter(m => !schedule.some(s=>s.matchId===m.id || (s.matchIds||[]).map(Number).includes(Number(m.id))));
  const opts = unlinked.map(m=>`<option value="${m.id}">${formatDate(m.date)}: ${m.team1.name} ${m.team1.score}-${m.team2.score} ${m.team2.name}</option>`).join('');
  if(!opts) { showToast(t('no_matches_to_merge'),'info'); return; }
  const modal = document.getElementById('schedule-modal');
  document.getElementById('schedule-modal-content').innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;letter-spacing:2px;margin-bottom:1rem">🔗 Połącz z meczem</div>
    <select id="link-match-sel" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.6rem;border-radius:6px;font-family:inherit;margin-bottom:1rem"><option value="">Wybierz mecz...</option>${opts}</select>
    <button class="btn btn-primary" style="width:100%" onclick="confirmLinkMatch(${schedId})">✅ Połącz</button>`;
  modal.classList.add('open');
}
function confirmLinkMatch(schedId) {
  const matchId = Number(document.getElementById('link-match-sel')?.value);
  if(!matchId) return;
  const idx = schedule.findIndex(s=>s.id===schedId);
  if(idx!==-1) { schedule[idx].matchId = matchId; schedule[idx].played = true; }
  saveData().then(()=>{ showToast('✅ Połączono!','success'); document.getElementById('schedule-modal').classList.remove('open'); renderSchedule(); });
}
async function predictScheduleMatch(schedId) {
  if(!_isLoggedInSync()) { showToast('❌ Tylko admin może generować predykcje', 'error'); return; }
  const s = schedule.find(x=>x.id===schedId);
  if(!s || !hasAI()) return;
  showToast(t('generating_prediction'),'info');
  const t1stats = getAggregatedStats().filter(p=>p.team===s.team1);
  const t2stats = getAggregatedStats().filter(p=>p.team===s.team2);
  const h2h = matches.filter(m=>(m.team1.name===s.team1&&m.team2.name===s.team2)||(m.team1.name===s.team2&&m.team2.name===s.team1));
  const fmtTeam = (players) => players.map(p=>`${p.name}[${p.pos||'?'}]: ${(p.pts/p.gp).toFixed(1)}pkt ${(p.ast/p.gp).toFixed(1)}as ${(p.reb/p.gp).toFixed(1)}zb GRD:${numToGrade(p.gradeSum/p.gp)}`).join(', ');
  const h2hText = h2h.length ? h2h.map(m=>`${m.team1.name} ${m.team1.score}-${m.team2.score} ${m.team2.name}`).join(', ') : 'Brak historii H2H';
  const prompt = `Jesteś analitykiem sportowym NBA 2K. Na podstawie statystyk przewidź wynik meczu. Odpowiedz po polsku w 2-3 zdaniach. Podaj przewidywany wynik i faworyta. Bądź konkretny.

${s.team1} vs ${s.team2}

Statystyki ${s.team1}: ${fmtTeam(t1stats)}
Statystyki ${s.team2}: ${fmtTeam(t2stats)}
H2H: ${h2hText}`;
  try {
    const data = await callAI(MODEL_CHEAP(), 200, [{role:'user',content:prompt}]);
    const pred = data.content?.[0]?.text||'';
    const idx = schedule.findIndex(x=>x.id===schedId);
    if(idx!==-1) schedule[idx].prediction = pred;
    saveData().then(()=>{ showToast('✅ Predykcja wygenerowana!','success'); renderSchedule(); });
  } catch(e) { showToast(t('err_connect')+e.message,'error'); }
}
