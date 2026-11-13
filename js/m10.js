/*@v:8c0d81398d*/
function _draftTeamsInfo(ev) {
  let ovr = {}; try { _dsComputeOvr((ev.teams || []).flatMap(t => t.players || []), {}).forEach(p => { ovr[p.id] = p.ovr; }); } catch(e) {}
  let lg = {}; try { _mpAgg(() => true, 'season').forEach(r => { lg[_normNick(r.name)] = r; }); } catch(e) {}
  return (ev.teams || []).map(t => {
    const ps = (t.players || []).map(p => ({ name: p.name, pos: p.primaryPos || (p.positions || [])[0] || '', all: (p.positions || []).join('/'), ovr: ovr[p.id] ?? p.ovr ?? null,
      cap: p.id === t.captain?.id, ppg: lg[_normNick(p.name)] ? Math.round(lg[_normNick(p.name)].ppg * 10) / 10 : null }));
    const ovrs = ps.map(p => p.ovr).filter(v => v != null);
    const covered = new Set(ps.flatMap(p => [p.pos, ...String(p.all).split('/')]).filter(Boolean));
    return { team: t.name, players: ps, avgOvr: ovrs.length ? Math.round(ovrs.reduce((s, v) => s + v, 0) / ovrs.length) : null, missing: ['PG', 'SG', 'SF', 'PF', 'C'].filter(x => !covered.has(x)) };
  });
}
// ocena bez AI (zapas): średni OVR na tle reszty + kara za brakujące pozycje
function _gradesFallback(info) {
  const avgs = info.map(t => t.avgOvr || 0), mx = Math.max(...avgs), mn = Math.min(...avgs);
  const scale = ['F', 'D', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
  return info.map(t => {
    let sc = mx === mn ? 7 : 3 + ((t.avgOvr || 0) - mn) / (mx - mn) * 7;
    sc -= t.missing.length * 1.2;
    const g = scale[Math.max(0, Math.min(10, Math.round(sc)))];
    return { team: t.team, grade: g, comment: t.missing.length ? `Solidny skład, ale brakuje: ${t.missing.join(', ')}.` : 'Zbalansowany skład na każdej pozycji.' };
  });
}
async function draftGrade(eventId, silent) {
  const ev = events.find(e => e.id === eventId); if(!ev) return null;
  const info = _draftTeamsInfo(ev);
  if(!silent) showToast('🤖 AI ocenia draft…', 'info');
  let grades = null;
  try {
    const prompt = `Jesteś ekspertem NBA 2K oceniającym draft w turnieju „${ev.title || 'event'}”. Oceń każdą drużynę od A+ do F (skala szkolna jak po drafcie NBA): siła (OVR, średnie punkty z ligi), balans pozycji (PG, SG, SF, PF, C), czy kapitan dobrze uzupełnił skład.
Dla każdej drużyny napisz krótki, zabawny komentarz po polsku (maks. 140 znaków), bez obrażania graczy. Oceny mają się różnić — nie dawaj wszystkim tego samego.
Zwróć WYŁĄCZNIE JSON: [{"team":"nazwa","grade":"B+","comment":"…"}]

DRUŻYNY:
${info.map(t => `${t.team} (średni OVR ${t.avgOvr ?? '?'}${t.missing.length ? ', brak pozycji: ' + t.missing.join(', ') : ''}): ` + t.players.map(p => `${p.name}${p.cap ? ' (kpt)' : ''} ${p.all || p.pos || '?'} OVR ${p.ovr ?? '?'}${p.ppg != null ? ' ' + p.ppg + ' pkt/m' : ''}`).join('; ')).join('\n')}`;
    const r = await _api('/gemini', 'POST', { model: 'gemini-2.5-flash', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }, { admin: true });
    const txt = (r?.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
    const arr = JSON.parse(txt.slice(txt.indexOf('['), txt.lastIndexOf(']') + 1));
    if(Array.isArray(arr) && arr.length) grades = info.map(t => { const g = arr.find(x => String(x.team).toLowerCase() === String(t.team).toLowerCase()) || {};
      return { team: t.team, grade: /^[A-DF][+-]?$/.test(String(g.grade || '').trim()) ? String(g.grade).trim() : null, comment: String(g.comment || '').slice(0, 180) }; });
  } catch(e) { console.warn('draftGrade AI', e); }
  if(!grades || grades.some(g => !g.grade)) { const fb = _gradesFallback(info); grades = info.map((t, i) => grades?.[i]?.grade ? grades[i] : fb[i]); }
  ev.draftGrades = grades.map((g, i) => ({ ...g, avgOvr: info[i].avgOvr }));
  await saveData(true);
  if(!silent) { showToast('🤖 Oceny draftu gotowe', 'success'); const ov = document.getElementById('draft-overlay'); if(ov && ov.style.display !== 'none') renderDraftView(eventId); }
  return ev.draftGrades;
}
// grafika: kolumny drużyn z oceną, składem i komentarzem
async function _draftGradesImage(ev) {
  const info = _draftTeamsInfo(ev), grades = ev.draftGrades || [];
  const n = info.length, cols = Math.min(n, 4), rows = Math.ceil(n / cols);
  const maxP = Math.max(...info.map(t => t.players.length), 5);
  const colW = 360, gap = 20, pad = 40, headH = 130, cardH = 170 + maxP * 34;
  const W = pad * 2 + cols * colW + (cols - 1) * gap, H = headH + rows * (cardH + gap) + 60;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
  const font = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#0b0e14'); bg.addColorStop(1, '#1a1206'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#f5c518'; g.font = `900 30px ${font}`; g.fillText('🤖 OCENY DRAFTU', pad, 55);
  g.fillStyle = '#fff'; g.font = `900 46px ${font}`; g.fillText(String(ev.title || 'Event').toUpperCase().slice(0, 40), pad, 105);
  const fit = (txt, w, f) => { g.font = f; let s = String(txt); while(s.length > 1 && g.measureText(s).width > w) s = s.slice(0, -1); return s === String(txt) ? s : s.slice(0, -1) + '…'; };
  const wrap = (txt, w, f, maxL) => { g.font = f; const out = []; let line = ''; String(txt || '').split(' ').forEach(word => { const t = line ? line + ' ' + word : word; if(g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; }); if(line) out.push(line); return out.slice(0, maxL); };
  info.forEach((t, i) => {
    const x = pad + (i % cols) * (colW + gap), y = headH + Math.floor(i / cols) * (cardH + gap);
    const gr = grades.find(q => q.team === t.team) || {};
    g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.roundRect ? g.roundRect(x, y, colW, cardH, 18) : g.rect(x, y, colW, cardH); g.fill();
    g.fillStyle = _GRADE_COL(gr.grade || 'C'); g.font = `900 64px ${font}`; g.textAlign = 'right'; g.fillText(gr.grade || '—', x + colW - 18, y + 70); g.textAlign = 'left';
    g.fillStyle = '#fff'; g.font = `900 30px ${font}`; g.fillText(fit(t.team, colW - 120, `900 30px ${font}`), x + 18, y + 45);
    g.fillStyle = '#8a93a8'; g.font = `700 20px ${font}`; g.fillText(t.avgOvr ? `Średni OVR ${t.avgOvr}` : '', x + 18, y + 72);
    t.players.forEach((p, k) => {
      const py = y + 112 + k * 34;
      g.fillStyle = '#f5c518'; g.font = `800 18px ${font}`; g.fillText(p.pos || '', x + 18, py);
      g.fillStyle = p.cap ? '#f5c518' : '#e8eaf0'; g.font = `700 22px ${font}`; g.fillText(fit((p.cap ? '★ ' : '') + p.name, colW - 120, `700 22px ${font}`), x + 60, py);
      if(p.ovr != null) { g.fillStyle = '#8a93a8'; g.font = `800 20px ${font}`; g.textAlign = 'right'; g.fillText(String(p.ovr), x + colW - 18, py); g.textAlign = 'left'; }
    });
    g.fillStyle = '#c9ced8'; g.font = `italic 600 19px ${font}`;
    wrap(gr.comment, colW - 36, `italic 600 19px ${font}`, 3).forEach((l, k) => g.fillText(l, x + 18, y + 112 + maxP * 34 + 14 + k * 23));
  });
  g.fillStyle = 'rgba(255,255,255,.4)'; g.font = `700 20px ${font}`; g.fillText((location.host || 'chemikleagues.com') + ' · eventy', pad, H - 22);
  return c.toDataURL('image/png');
}
async function postDraftGrades(eventId) {
  const ev = events.find(e => e.id === eventId); if(!ev) return false;
  if(!ev.draftGrades?.length) await draftGrade(eventId, true);
  const img = await _draftGradesImage(ev);
  const ok = await _discordPost('main', { route: 'eventDone', content: `🏆 **Draft zakończony — ${ev.title || ''}**\n` + (ev.draftGrades || []).map(g => `**${g.team}**: ${g.grade} — ${g.comment}`).join('\n') + '\n\n🎮 Róbcie screeny z wynikami meczów. Powodzenia!' }, img, 'oceny-draftu.png');
  return ok;
}
async function finishDraft(eventId) {
  const _gmEv = events.find(e => e.id === eventId);
  if(_gmEv?.type === 'gmdraft') {
    const fresh = await _evdFetch(eventId); if(fresh) _evdApply(_gmEv, fresh);
    if(!confirm(_g('Zatwierdzić składy GM-ów i rozpocząć sezon Ligi GM?', 'Confirm GM rosters and start the GM League season?'))) return;
    if(!_gmState) await _gmLoad();
    const rosters = _gmSnakeSalaries(_gmEv, _gmState);
    if(await _gmSaveRosters(rosters)) { _gmEv.status = 'finished'; await saveData(true); _api('/ev-draft/admin', 'POST', { eventId, action: 'clear' }, { admin: true }).catch(() => {}); document.getElementById('draft-overlay').style.display = 'none'; showView('gm'); }
    return;
  }
  const ev = events.find(e => e.id === eventId);
  if(!ev) return;
  const fresh = await _evdFetch(eventId); if(fresh) _evdApply(ev, fresh);
  delete ev.gmOnline;
  ev.status = 'active';
  ev.draftPool = [];
  if(!(await saveData())) return;
  _api('/ev-draft/admin', 'POST', { eventId, action: 'clear' }, { admin: true }).catch(() => {});
  // oceny draftu (AI) + grafika drużyn na Discord; gdy się nie uda — zwykły komunikat tekstowy
  if(!(await postDraftGrades(eventId).catch(() => false))) sendEventWebhook('🏆 Draft zakończony!',
    '**' + (ev.title||'') + '**\n' +
    (ev.teams||[]).map(t => {
      const capName = t.captain?.name || '—';
      const picked = (t.players||[]).filter(p => p.id !== t.captain?.id).map(p => p.name).join(', ');
      return `**${t.name}** (kpt: ${capName})${picked ? ': ' + picked : ''}`;
    }).join('\n') +
    '\n\n🎮 Róbcie screeny z wynikami meczów. Powodzenia dla wszystkich!',
    0x2ecc71);
  stopDraftPolling();
  document.getElementById('draft-overlay').style.display = 'none';
  renderEvents();
  openEventDetail(eventId);
  showToast('🏆 Draft zakończony! Drużyny gotowe.', 'success');
}
function copyGmLink(eventId) {
  const wu = localStorage.getItem('nba2k_worker_url') || workerUrl || '';
  const base = `${location.origin}${location.pathname}`;
  if(!wu) { showToast('❌ Brak Worker URL — skonfiguruj go w ustawieniach', 'error'); return; }
  // Token is embedded in event data — no ev_tok needed in the URL
  const url = `${base}?w=${encodeURIComponent(wu)}&event=${eventId}#gm`;
  navigator.clipboard?.writeText(url)
    .then(() => showToast('✅ Link GM skopiowany! Wyślij go kapitanom.', 'success'))
    .catch(() => { prompt('Skopiuj link GM:', url); });
}
function copyDraftWatchLink(eventId) {
  const base = window.location.href.split('?')[0].split('#')[0];
  const baseDir = base.substring(0, base.lastIndexOf('/') + 1);
  const link = baseDir + 'draft-watch.html?w=' + encodeURIComponent(workerUrl.replace(/\/$/, '')) + '&event=' + eventId;
  navigator.clipboard.writeText(link).then(() => {
    showToast('🔗 Link skopiowany do schowka!', 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = link; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast('🔗 Link skopiowany!', 'success');
  });
}
function copyDraftOverlayLink(eventId) {
  const wu = localStorage.getItem('nba2k_worker_url') || workerUrl || '';
  if(!wu) { showToast('❌ Brak Worker URL — skonfiguruj go w ustawieniach', 'error'); return; }
  const base    = window.location.href.split('?')[0].split('#')[0];
  const baseDir = base.substring(0, base.lastIndexOf('/') + 1);
  const link    = baseDir + 'draft-overlay.html?w=' + encodeURIComponent(wu.replace(/\/$/, '')) + '&event=' + eventId;
  navigator.clipboard?.writeText(link)
    .then(() => showToast('📺 Link do overlaya skopiowany! Wklej jako Browser Source w OBS.', 'success'))
    .catch(() => { prompt('Skopiuj link do overlaya Twitch/OBS:', link); });
}
function getSeasonMVP(seasonId) {
  const agg = getAggregatedStats(seasonId);
  if(!agg.length) return null;
  const ranked = agg.filter(p=>p.gp>=1).map(p=>({...p, score: calcCompositeScore(p)})).sort((a,b)=>b.score-a.score);
  return ranked[0] || null;
}
function renderSeasonMVPBlock(seasonId) {
  const mvp = getSeasonMVP(seasonId);
  if(!mvp) return '';
  const gr = numToGrade(mvp.gradeSum/mvp.gp);
  const avg = (v) => mvp.gp>0?(v/mvp.gp).toFixed(1):'0.0';
  return `<div style="margin-top:.75rem;padding:.75rem;background:rgba(245,197,24,0.06);border:1px solid rgba(245,197,24,0.3);border-radius:8px">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--accent);margin-bottom:.4rem">🏆 MVP Sezonu</div>
    <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
      <div>
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.2rem;cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px" onclick="document.getElementById('season-modal').classList.remove('open');setTimeout(()=>openPlayerModal('${mvp.name}','${mvp.team}'),200)">${mvp.name}</span>
        <span style="color:var(--muted);font-size:.8rem;margin-left:.4rem">${mvp.team}</span>
      </div>
      <span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span>
      <span style="font-size:.8rem;color:var(--muted)">${avg(mvp.pts)} PTS · ${avg(mvp.reb)} REB · ${avg(mvp.ast)} AST · ${mvp.gp} GP</span>
    </div>
  </div>`;
}
function openTop10Modal(seasonId, seasonName) {
  _top10SeasonId = seasonId;
  _top10SeasonName = seasonName;
  renderTop10Tab('composite');
  document.getElementById('top10-modal').classList.add('open');
}
function renderTop10Tab(tab) {
  const agg = getAggregatedStats(_top10SeasonId);
  const medals = ['🥇','🥈','🥉'];

  const makeRows = (ranked, extraCol, extraVal) => ranked.map((p,i) => {
    const gr = numToGrade(p.gradeSum/p.gp);
    const avg = v => (v/p.gp).toFixed(1);
    const rank = i<3 ? medals[i] : `<span style="font-weight:900;color:var(--muted)">${i+1}</span>`;
    const esc = s => s.replace(/'/g,"\'");
    return `<tr style="cursor:pointer" onclick="document.getElementById('top10-modal').classList.remove('open');setTimeout(()=>openPlayerModal('${esc(p.name)}','${esc(p.team)}'),200)">
      <td style="text-align:center;font-size:1.1rem">${rank}</td>
      <td style="font-weight:700">${p.name}</td>
      <td style="color:var(--muted);font-size:.85rem">${p.pos||''}</td>
      <td style="color:var(--muted);font-size:.85rem">${p.team}</td>
      <td><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></td>
      <td style="color:var(--accent);font-weight:700">${avg(p.pts)}</td>
      <td>${avg(p.reb)}</td><td>${avg(p.ast)}</td><td>${avg(p.stl)}</td><td>${avg(p.blk)}</td>
      <td style="color:var(--accent2);font-weight:700">${extraVal(p)}</td>
      <td style="font-size:.8rem;color:var(--muted)">${p.gp}</td>
    </tr>`;
  }).join('');

  const isComposite = tab === 'composite';
  const isBrick = tab === 'brick';

  // Shared round switcher state (null = cały sezon)
  const activeRounds = rounds.length
    ? [...rounds].sort((a,b)=>a.from.localeCompare(b.from))
    : [getDefaultRound()];
  if(window._top10RoundIdx === undefined) window._top10RoundIdx = null; // null = cały sezon

  // For CS/PER: filter by round if selected
  let csperMatches = matches;
  if(!isBrick && window._top10RoundIdx !== null) {
    const r = activeRounds[Math.min(window._top10RoundIdx, activeRounds.length-1)];
    csperMatches = matches.filter(m => {
      const inSeason = !_top10SeasonId || m.seasonId === _top10SeasonId;
      const inRound = m.date >= r.from && m.date <= r.to;
      return inSeason && inRound;
    });
  }

  // Build agg for CS/PER from filtered matches
  const getFilteredAgg = () => {
    if(window._top10RoundIdx === null) return agg; // use full season agg
    const pm = {};
    csperMatches.forEach(m => {
      [m.team1,m.team2].forEach(t => {
        (t.players||[]).forEach(p => {
          const k = p.name+'|'+t.name;
          if(!pm[k]) pm[k]={name:p.name,team:t.name,pos:p.pos||'',gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gradeSum:0};
          const s=pm[k];
          s.gp++;s.pts+=p.pts||0;s.reb+=p.reb||0;s.ast+=p.ast||0;s.stl+=p.stl||0;s.blk+=p.blk||0;s.to+=p.to||0;
          s.fgm+=p.fgm||0;s.fga+=p.fga||0;s.tpm+=p.tpm||0;s.tpa+=p.tpa||0;s.ftm+=p.ftm||0;s.fta+=p.fta||0;
          s.gradeSum+=gradeToNum(p.grade||'B');
        });
      });
    });
    return Object.values(pm);
  };

  const filteredAgg = isBrick ? agg : getFilteredAgg();

  const ranked = isComposite
    ? filteredAgg.filter(p=>p.gp>=1).map(p=>({...p, _s: calcCompositeScore(p)})).sort((a,b)=>b._s-a._s).slice(0,10)
    : filteredAgg.filter(p=>p.gp>=1).map(p=>({...p, _s: calcPER(p)})).sort((a,b)=>b._s-a._s).slice(0,10);

  const tabBtn = (isActive, lbl, tid) => `<button style="padding:.5rem 1.25rem;border:none;border-bottom:2px solid ${isActive?'var(--accent)':'transparent'};background:none;color:${isActive?'var(--accent)':'var(--muted)'};font-weight:${isActive?'700':'400'};cursor:pointer;font-family:inherit;font-size:.9rem" onclick="renderTop10Tab('${tid}')">${lbl}</button>`;
  const header = `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:.75rem">🏆 TOP 10 — ${_top10SeasonName||'Wszystkie sezony'}</div>
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap">
      <span style="font-size:.75rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase">Sezon:</span>
      <select onchange="_top10SeasonId=this.value||null;_top10SeasonName=this.options[this.selectedIndex].text;renderTop10Tab('${tab}')"
        style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.2rem .5rem;font-size:.8rem;font-family:inherit">
        <option value="" ${!_top10SeasonId?'selected':''}>Wszystkie sezony</option>
        ${seasons.map(s=>`<option value="${s.id}" ${_top10SeasonId===s.id?'selected':''}>${s.name}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:1rem">${tabBtn(tab==='composite','Composite Score','composite')}${tabBtn(tab==='per','PER (Hollinger)','per')}${tabBtn(tab==='brick','🧱 Brick of the Round','brick')}</div>`;

  // Round switcher for CS/PER tabs
  if(!isBrick) {
    const csperRoundSwitcher = [
      `<button onclick="window._top10RoundIdx=null;renderTop10Tab('${tab}')" style="padding:.2rem .6rem;border-radius:6px;border:1px solid ${window._top10RoundIdx===null?'var(--accent)':'var(--border)'};background:${window._top10RoundIdx===null?'rgba(245,197,24,.15)':'transparent'};color:${window._top10RoundIdx===null?'var(--accent)':'var(--muted)'};font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:${window._top10RoundIdx===null?'700':'400'}">Cały sezon</button>`,
      ...activeRounds.map((r,i) =>
        `<button onclick="window._top10RoundIdx=${i};renderTop10Tab('${tab}')" style="padding:.2rem .6rem;border-radius:6px;border:1px solid ${i===window._top10RoundIdx?'var(--accent)':'var(--border)'};background:${i===window._top10RoundIdx?'rgba(245,197,24,.15)':'transparent'};color:${i===window._top10RoundIdx?'var(--accent)':'var(--muted)'};font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:${i===window._top10RoundIdx?'700':'400'}">${r.label}</button>`
      )
    ].join('');
    const rLabel = window._top10RoundIdx === null ? 'Cały sezon' : activeRounds[Math.min(window._top10RoundIdx, activeRounds.length-1)]?.label || '';
    document.getElementById('top10-modal-content').innerHTML = header
      + `<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.75rem">${csperRoundSwitcher}</div>`
      + `<div style="font-size:.75rem;color:var(--muted);margin-bottom:.75rem">${isComposite?'Composite Score':'PER (Hollinger)'} w <strong>${rLabel}</strong>${window._top10RoundIdx!==null?' — min. 1 mecz w kolejce':''}</div>`
      + `<div class="stats-table-wrap"><table><thead><tr><th></th><th style="text-align:left">Zawodnik</th><th>POZ</th><th>Drużyna</th><th>GRD</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th style="color:var(--accent2);font-weight:700">${isComposite?'CS':'PER'}</th><th>GP</th></tr></thead><tbody>`
      + makeRows(ranked, isComposite?'CS':'PER', p => isComposite ? calcCompositeScore(p).toFixed(1) : calcPER(p).toFixed(1))
      + `</tbody></table></div>`;
    return;
  }

  if(isBrick) {
    // Brick round selector — persisted in window var
    if(window._brickRoundIdx === undefined) window._brickRoundIdx = activeRounds.length - 1;
    const brickAllSeason = window._brickRoundIdx === null;
    if(!brickAllSeason) window._brickRoundIdx = Math.min(window._brickRoundIdx, activeRounds.length - 1);
    let brickRound = brickAllSeason ? null : activeRounds[window._brickRoundIdx];

    const roundMatches = matches.filter(m => {
      const inSeason = !_top10SeasonId || m.seasonId === _top10SeasonId;
      if(brickAllSeason) return inSeason;
      const inRound  = m.date >= brickRound.from && m.date <= brickRound.to;
      return inSeason && inRound;
    });

    // Each team plays 2 games per round → minGP = 2
    const minGP = 2;

    // Aggregate FG for round
    const players = {};
    roundMatches.forEach(m => {
      [m.team1, m.team2].forEach(t => {
        (t.players||[]).forEach(p => {
          if(!players[p.name]) players[p.name] = { name:p.name, team:t.name, pos:p.pos||'', gp:0, fgm:0, fga:0, tpm:0, tpa:0, pts:0, gradeSum:0 };
          const pl = players[p.name];
          pl.gp++; pl.fgm+=p.fgm||0; pl.fga+=p.fga||0;
          pl.tpm+=p.tpm||0; pl.tpa+=p.tpa||0;
          pl.pts+=p.pts||0; pl.gradeSum+=gradeToNum(p.grade||'B');
        });
      });
    });

    // Filter min GP and sort by FG% ascending (worst first)
    const bricks = Object.values(players)
      .filter(p => p.gp >= minGP && p.fga > 0)
      .map(p => ({
        ...p,
        fgPct: Math.round(p.fgm / p.fga * 100),
        tpPct: p.tpa > 0 ? Math.round(p.tpm / p.tpa * 100) : null,
        missedPerGame: ((p.fga - p.fgm) / p.gp).toFixed(1),
        avgPts: (p.pts / p.gp).toFixed(1),
        avgGrd: numToGrade(p.gradeSum / p.gp),
      }))
      .sort((a,b) => a.fgPct - b.fgPct)
      .slice(0, 10);

    const brickEmojis = ['🧱','😬','💀','😵','🪣','🫠','😤','🥴','😐','🤌'];

    const brickRows = bricks.map((p,i) => {
      const esc = s => s.replace(/'/g,"\'");
      const gr = p.avgGrd;
      const badness = i === 0 ? 'background:rgba(255,80,80,.07);' : '';
      return `<tr style="cursor:pointer;${badness}" onclick="document.getElementById('top10-modal').classList.remove('open');setTimeout(()=>openPlayerModal('${esc(p.name)}','${esc(p.team)}'),200)">
        <td style="text-align:center;font-size:1.2rem">${brickEmojis[i]||i+1}</td>
        <td style="font-weight:700">${p.name}</td>
        <td style="color:var(--muted);font-size:.85rem">${p.pos}</td>
        <td style="color:var(--muted);font-size:.85rem">${p.team}</td>
        <td><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></td>
        <td style="font-weight:900;font-size:1.1rem;color:var(--loss)">${p.fgPct}%</td>
        <td style="color:var(--muted)">${p.fgm}/${p.fga}</td>
        <td style="color:var(--loss)">${p.missedPerGame}</td>
        <td style="color:${p.tpPct!==null&&p.tpPct<30?'var(--loss)':'var(--muted)'}">${p.tpPct!==null?p.tpPct+'%':'-'}</td>
        <td style="color:var(--accent)">${p.avgPts}</td>
        <td style="font-size:.8rem;color:var(--muted)">${p.gp}/${roundMatches.length}</td>
      </tr>`;
    }).join('');

    const brickAllBtn = `<button onclick="window._brickRoundIdx=null;renderTop10Tab('brick')" style="padding:.25rem .6rem;border-radius:6px;border:1px solid ${brickAllSeason?'var(--accent)':'var(--border)'};background:${brickAllSeason?'rgba(245,197,24,.15)':'transparent'};color:${brickAllSeason?'var(--accent)':'var(--muted)'};font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:${brickAllSeason?'700':'400'}">Cały sezon</button>`;
    const roundSwitcher = brickAllBtn + activeRounds.map((r,i) =>
      `<button onclick="window._brickRoundIdx=${i};renderTop10Tab('brick')" style="padding:.25rem .6rem;border-radius:6px;border:1px solid ${i===window._brickRoundIdx?'var(--accent)':'var(--border)'};background:${i===window._brickRoundIdx?'rgba(245,197,24,.15)':'transparent'};color:${i===window._brickRoundIdx?'var(--accent)':'var(--muted)'};font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:${i===window._brickRoundIdx?'700':'400'}">${r.label}</button>`
    ).join('');

    document.getElementById('top10-modal-content').innerHTML = header +
      `<div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem">${roundSwitcher}</div>
      <div style="font-size:.75rem;color:var(--muted);margin-bottom:.5rem">🧱 Najgorszy %FG ${brickAllSeason ? 'w całym sezonie' : 'w <strong>' + brickRound.label + '</strong>'} &mdash; min. <strong>${minGP} mecze</strong> &mdash; ${roundMatches.length} meczów</div>
      <div class="stats-table-wrap"><table>
        <thead><tr>
          <th>#</th>
          <th style="text-align:left">Zawodnik</th>
          <th>Poz</th>
          <th style="text-align:left">Drużyna</th>
          <th>GRD</th>
          <th style="color:var(--loss)">FG%</th>
          <th style="color:var(--muted)">FGM/A</th>
          <th style="color:var(--loss)">Pudła/GP</th>
          <th>3P%</th>
          <th>PPG</th>
          <th style="color:var(--muted)">GP</th>
        </tr></thead>
        <tbody>${bricks.length ? brickRows : '<tr><td colspan="11" style="text-align:center;padding:2rem;color:var(--muted)">Za mało danych (min. '+minGP+' mecze w kolejce)</td></tr>'}</tbody>
      </table></div>`;
    return;
  }

  if(isComposite) {
    document.getElementById('top10-modal-content').innerHTML = header +
      `<div style="font-size:.75rem;color:var(--muted);margin-bottom:1rem">Composite: PTS (25%) + STL (20%) + BLK (18%) + REB (15%) + AST (12%) + ocena (10%)</div>
      <div class="stats-table-wrap"><table>
        <thead><tr><th>#</th><th style="text-align:left">Zawodnik</th><th>Poz</th><th style="text-align:left">Drużyna</th>
        <th>GRD</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>Score</th><th>GP</th></tr></thead>
        <tbody>${makeRows(ranked, 'Score', p=>p._s.toFixed(1))}</tbody>
      </table></div>`;
  } else {
    const perRows = ranked.map((p,i) => {
      const gr = numToGrade(p.gradeSum/p.gp);
      const avg = v => (v/p.gp).toFixed(1);
      const rank = i<3 ? ['🥇','🥈','🥉'][i] : `<span style="font-weight:900;color:var(--muted)">${i+1}</span>`;
      const esc = s => s.replace(/'/g,"\'");
      const mFG = (p.fga-p.fgm)/p.gp; const mFT = (p.fta-p.ftm)/p.gp;
      const fgp = p.fga>0?Math.round(p.fgm/p.fga*100)+'%':'-';
      const tpp = p.tpa>0?Math.round(p.tpm/p.tpa*100)+'%':'-';
      return `<tr style="cursor:pointer" onclick="document.getElementById('top10-modal').classList.remove('open');setTimeout(()=>openPlayerModal('${esc(p.name)}','${esc(p.team)}'),200)">
        <td style="text-align:center;font-size:1.1rem">${rank}</td>
        <td style="font-weight:700">${p.name}</td>
        <td style="color:var(--muted);font-size:.85rem">${p.pos||''}</td>
        <td style="color:var(--muted);font-size:.85rem">${p.team}</td>
        <td><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></td>
        <td style="color:var(--accent);font-weight:700">${avg(p.pts)}</td>
        <td style="color:var(--loss)">${mFG.toFixed(1)}</td>
        <td style="color:var(--loss)">${mFT.toFixed(1)}</td>
        <td style="color:var(--loss)">${avg(p.to)}</td>
        <td>${fgp}</td><td>${tpp}</td>
        <td style="color:var(--accent2);font-weight:700">${p._s.toFixed(1)}</td>
        <td style="font-size:.8rem;color:var(--muted)">${p.gp}</td>
      </tr>`;
    }).join('');
    document.getElementById('top10-modal-content').innerHTML = header +
      `<div style="font-size:.75rem;color:var(--muted);margin-bottom:1rem">PER = (PTS + REB + AST + STL + BLK &minus; pud&#322;a FG &minus; pud&#322;a FT &minus; TO) &divide; GP &mdash; im wy&#380;szy tym lepiej</div>
      <div class="stats-table-wrap"><table>
        <thead><tr><th>#</th><th style="text-align:left">Zawodnik</th><th>Poz</th><th style="text-align:left">Drużyna</th>
        <th>GRD</th><th>PTS</th><th style="color:var(--loss)">-FG</th><th style="color:var(--loss)">-FT</th><th style="color:var(--loss)">TO</th>
        <th>FG%</th><th>3P%</th><th>PER</th><th>GP</th></tr></thead>
        <tbody>${perRows}</tbody>
      </table></div>`;
  }
}
// Get aggregated playoff stats for all players
function getPlayoffStats(po) {
  if (!po) return [];
  const pm = getPlayoffMatches(po);
  const playerMap = {};

  pm.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team?.players || []).forEach(p => {
        const key = p.name + '|' + team.name;
        if (!playerMap[key]) playerMap[key] = {
          name: p.name, team: team.name, pos: p.pos||'', posCounts:{},
          gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, to:0,
          fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0, gradeSum:0
        };
        const s = playerMap[key];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0;
        s.tpm+=p.tpm||0; s.tpa+=p.tpa||0;
        s.ftm+=p.ftm||0; s.fta+=p.fta||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
        if(p.pos){ if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
      });
    });
  });

  return Object.values(playerMap).map(p => {
    if(p.posCounts && Object.keys(p.posCounts).length)
      p.pos = Object.entries(p.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
    return p;
  });
}
// Open playoff stats modal

function closeTeamModal(){document.getElementById('team-modal').classList.remove('open');}
function openComparatorModal() { return openCardCompare(); }
function _openComparatorModalOld() {
  const agg=getAggregatedStats();
  const players=[...new Set(agg.map(p=>p.name))].sort();
  document.getElementById('comparator-modal-content').innerHTML=
    '<div style="font-family:\'Barlow Condensed\',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:1.25rem">&#x26A1; POR\u00d3WNAJ ZAWODNIK\u00d3W</div>'
    +'<div style="display:flex;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap">'
    +'<div style="flex:1;min-width:180px"><div style="font-size:.75rem;color:var(--muted);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:1px">Zawodnik 1</div>'
    +'<select id="cmp1" onchange="renderCmp()" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.5rem;border-radius:6px;font-family:inherit"><option value="">Wybierz...</option>'
    +players.map(p=>`<option>${p}</option>`).join('')+'</select></div>'
    +'<div style="display:flex;align-items:flex-end;padding-bottom:.5rem;font-size:1.5rem;color:var(--muted)">vs</div>'
    +'<div style="flex:1;min-width:180px"><div style="font-size:.75rem;color:var(--muted);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:1px">Zawodnik 2</div>'
    +'<select id="cmp2" onchange="renderCmp()" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:.5rem;border-radius:6px;font-family:inherit"><option value="">Wybierz...</option>'
    +players.map(p=>`<option>${p}</option>`).join('')+'</select></div></div>'
    +'<div id="cmp-result"></div>';
  document.getElementById('comparator-modal').classList.add('open');
}
function renderCmp() {
  const n1=document.getElementById('cmp1').value,n2=document.getElementById('cmp2').value;
  const el=document.getElementById('cmp-result');
  if(!n1||!n2||n1===n2){el.innerHTML='';return;}
  const agg=getAggregatedStats();
  const p1=agg.find(p=>p.name===n1),p2=agg.find(p=>p.name===n2);
  if(!p1||!p2){el.innerHTML='';return;}
  const av=(p,k)=>p.gp>0?(p[k]/p.gp).toFixed(1):'0.0';
  const pct=(m,a)=>a>0?Math.round(m/a*100):0;
  const stats=[
    {l:'GRD',v1:numToGrade(p1.gp>0?p1.gradeSum/p1.gp:0),v2:numToGrade(p2.gp>0?p2.gradeSum/p2.gp:0),n1:p1.gp>0?p1.gradeSum/p1.gp:0,n2:p2.gp>0?p2.gradeSum/p2.gp:0,hb:true,gr:true},
    {l:'PTS',v1:av(p1,'pts'),v2:av(p2,'pts'),n1:p1.pts/Math.max(p1.gp,1),n2:p2.pts/Math.max(p2.gp,1),hb:true},
    {l:'REB',v1:av(p1,'reb'),v2:av(p2,'reb'),n1:p1.reb/Math.max(p1.gp,1),n2:p2.reb/Math.max(p2.gp,1),hb:true},
    {l:'AST',v1:av(p1,'ast'),v2:av(p2,'ast'),n1:p1.ast/Math.max(p1.gp,1),n2:p2.ast/Math.max(p2.gp,1),hb:true},
    {l:'STL',v1:av(p1,'stl'),v2:av(p2,'stl'),n1:p1.stl/Math.max(p1.gp,1),n2:p2.stl/Math.max(p2.gp,1),hb:true},
    {l:'BLK',v1:av(p1,'blk'),v2:av(p2,'blk'),n1:p1.blk/Math.max(p1.gp,1),n2:p2.blk/Math.max(p2.gp,1),hb:true},
    {l:'TO',v1:av(p1,'to'),v2:av(p2,'to'),n1:p1.to/Math.max(p1.gp,1),n2:p2.to/Math.max(p2.gp,1),hb:false},
    {l:'FG%',v1:pct(p1.fgm,p1.fga)+'%',v2:pct(p2.fgm,p2.fga)+'%',n1:p1.fga>0?p1.fgm/p1.fga:0,n2:p2.fga>0?p2.fgm/p2.fga:0,hb:true},
    {l:'3P%',v1:pct(p1.tpm,p1.tpa)+'%',v2:pct(p2.tpm,p2.tpa)+'%',n1:p1.tpa>0?p1.tpm/p1.tpa:0,n2:p2.tpa>0?p2.tpm/p2.tpa:0,hb:true},
    {l:'FT%',v1:pct(p1.ftm,p1.fta)+'%',v2:pct(p2.ftm,p2.fta)+'%',n1:p1.fta>0?p1.ftm/p1.fta:0,n2:p2.fta>0?p2.ftm/p2.fta:0,hb:true},
    {l:'CS',v1:calcCompositeScore(p1).toFixed(1),v2:calcCompositeScore(p2).toFixed(1),n1:calcCompositeScore(p1),n2:calcCompositeScore(p2),hb:true},
    {l:'PER',v1:calcPER(p1).toFixed(1),v2:calcPER(p2).toFixed(1),n1:calcPER(p1),n2:calcPER(p2),hb:true},
  ];
  const rows=stats.map(s=>{
    const b1=s.hb?s.n1>s.n2:s.n1<s.n2,b2=s.hb?s.n2>s.n1:s.n2<s.n1;
    const fmt=(v,gr)=>gr?`<span class="grade grade-${String(v).replace('+','p').replace('-','m')}">${v}</span>`:v;
    return `<div class="cmprow"><div class="cmpval ${b1?'cmpbetter':b2?'cmpworse':''}">${fmt(s.v1,s.gr)}</div><div class="cmplbl">${s.l}</div><div class="cmpval ${b2?'cmpbetter':b1?'cmpworse':''}">${fmt(s.v2,s.gr)}</div></div>`;
  }).join('');
  const radarHtml = _cmpRadar(p1, p2, n1, n2, agg);
  el.innerHTML=`<div style="display:flex;gap:1rem;margin-bottom:.75rem"><div style="flex:1;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent)">${n1}</div><div style="font-size:.85rem;color:var(--muted)">${p1.team} &middot; ${p1.gp} GP</div></div><div style="width:55px"></div><div style="flex:1;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;color:var(--accent2)">${n2}</div><div style="font-size:.85rem;color:var(--muted)">${p2.team} &middot; ${p2.gp} GP</div></div></div>${radarHtml}${rows}`;
}
function _cmpRadar(p1, p2, n1, n2, agg) {
  const axes = [
    {l:'PPG', f:p=>p.gp>0?p.pts/p.gp:0},
    {l:'RPG', f:p=>p.gp>0?p.reb/p.gp:0},
    {l:'APG', f:p=>p.gp>0?p.ast/p.gp:0},
    {l:'SPG', f:p=>p.gp>0?p.stl/p.gp:0},
    {l:'BPG', f:p=>p.gp>0?p.blk/p.gp:0},
    {l:'FG%', f:p=>p.fga>0?p.fgm/p.fga:0},
  ];
  const maxes = axes.map(a=>Math.max(...agg.map(p=>a.f(p)),0.001));
  const norm = (p,i) => Math.min(axes[i].f(p)/maxes[i],1);
  const v1 = axes.map((_,i)=>norm(p1,i));
  const v2 = axes.map((_,i)=>norm(p2,i));
  const cx=120,cy=108,R=72,N=6;
  const ax = i => i*2*Math.PI/N - Math.PI/2;
  const pt = (r,i) => [+(cx+r*Math.cos(ax(i))).toFixed(1), +(cy+r*Math.sin(ax(i))).toFixed(1)];
  const poly = vs => vs.map((_,i)=>pt(R*vs[i],i).join(',')).join(' ');
  const c1='#f5c518', c2='#e74c3c';
  const rings=[.25,.5,.75,1].map(f=>{
    const pts=axes.map((_,i)=>pt(R*f,i));
    return `<path d="M${pts.map(p=>p.join(',')).join('L')}Z" fill="none" stroke="#fff" stroke-opacity="${f===1?.2:.09}" stroke-width="${f===1?1.2:.7}"/>`;
  }).join('');
  const axLines=axes.map((_,i)=>{const[x,y]=pt(R,i);return`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`;}).join('');
  const lblOff=14;
  const labels=axes.map((a,i)=>{
    const[x,y]=pt(R+lblOff,i);
    const va=Math.abs(Math.sin(ax(i)))<0.3?'middle':Math.sin(ax(i))<0?'auto':'hanging';
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="${va}" font-size="9.5" font-weight="700" fill="#99a0b0" font-family="Arial,sans-serif" letter-spacing=".5">${a.l}</text>`;
  }).join('');
  const dots=(vs,c)=>vs.map((_,i)=>{const[x,y]=pt(R*vs[i],i);return`<circle cx="${x}" cy="${y}" r="3.2" fill="${c}" stroke="#111" stroke-width=".8"/>`;}).join('');
  return `<svg viewBox="0 0 240 228" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px;margin:0 auto .75rem;display:block">
    ${rings}${axLines}
    <polygon points="${poly(v2)}" fill="${c2}" fill-opacity=".18" stroke="${c2}" stroke-width="1.8" stroke-opacity=".88" stroke-linejoin="round"/>
    <polygon points="${poly(v1)}" fill="${c1}" fill-opacity=".18" stroke="${c1}" stroke-width="1.8" stroke-opacity=".88" stroke-linejoin="round"/>
    ${dots(v2,c2)}${dots(v1,c1)}
    ${labels}
    <g font-size="9" font-family="Arial,sans-serif">
      <circle cx="12" cy="216" r="5" fill="${c1}"/><text x="21" y="220" fill="${c1}" font-weight="700">${n1}</text>
      <circle cx="12" cy="226" r="5" fill="${c2}"/><text x="21" y="230" fill="${c2}" font-weight="700">${n2}</text>
    </g>
  </svg>`;
}
// ═══════════════════════════════════════════════════════════════
// SEASON MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function openSeasonModal() {
  renderSeasonModal();
  document.getElementById('season-modal').classList.add('open');
}
function renderSeasonModal() {
  // Show merge warning at top if duplicates exist
  setTimeout(() => {
    const sm = document.getElementById('season-modal-content');
    if(!sm) return;
    const mergeHtml = renderMergeSeasons();
    if(mergeHtml) {
      const existing = sm.innerHTML;
      sm.innerHTML = mergeHtml + existing;
    }
  }, 50);
  const active = seasons.find(s => s.id === currentSeasonId);
  const html = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:1.25rem">🏆 ZARZĄDZANIE SEZONAMI</div>
    ${active ? `<div style="background:rgba(245,197,24,0.08);border:1px solid var(--accent);border-radius:8px;padding:.75rem 1rem;margin-bottom:1.25rem;font-size:.9rem">
      <span style="color:var(--muted)">Aktywny sezon:</span> <strong style="color:var(--accent)">${active.name}</strong>
      <span style="color:var(--muted);font-size:.8rem;margin-left:.5rem">${matches.filter(m=>m.seasonId===active.id).length} meczów</span>
      <button onclick="endCurrentSeason()" class="season-modal-btn danger" style="margin-left:1rem">⏹ Zakończ sezon</button>
    </div>` : `<div style="background:rgba(46,204,113,0.08);border:1px solid var(--win);border-radius:8px;padding:.75rem 1rem;margin-bottom:1.25rem;font-size:.9rem;color:var(--muted)">
      Brak aktywnego sezonu — mecze bez przypisania. <button onclick="promptNewSeason()" class="season-modal-btn" style="margin-left:.5rem;border-color:var(--win);color:var(--win)">+ Nowy sezon</button>
    </div>`}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
      <div style="font-weight:700;font-size:.9rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Historia sezonów</div>
      ${!active ? `<button onclick="promptNewSeason()" class="btn btn-primary" style="font-size:.8rem;padding:.4rem .9rem">+ Nowy sezon</button>` : ''}
    </div>
    ${seasons.length === 0 ? `<div style="color:var(--muted);font-size:.9rem;padding:1rem 0">Brak sezonów. Utwórz pierwszy sezon!</div>` :
      seasons.slice().reverse().map(s => {
        const mc = matches.filter(m=>m.seasonId===s.id).length;
        const isAct = s.id === currentSeasonId;
        return `<div class="season-item ${isAct?'active-season':''}">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
              <span style="font-weight:700;font-size:1rem">${s.name}</span>
              ${isAct ? '<span class="season-badge">AKTYWNY</span>' : ''}
              <button onclick="openTop10Modal('${s.id}','${s.name}')" class="season-modal-btn" style="font-size:.7rem;padding:.2rem .5rem">🏆 Top 10</button>
            </div>
            <div style="font-size:.8rem;color:var(--muted);margin-top:2px">${s.startDate||''} ${s.endDate?' → '+s.endDate:''} · ${mc} ${t('games_count')}</div>
            ${renderSeasonMVPBlock(s.id)}
          </div>
          <div style="display:flex;gap:.5rem;margin-left:.75rem;flex-shrink:0">
            ${!isAct ? `<button onclick="activateSeason('${s.id}')" class="season-modal-btn">▶ Aktywuj</button>` : ''}
            <button onclick="renameSeason('${s.id}')" class="season-modal-btn" title="Zmień nazwę (np. dopisz edycję: „Sezon 2, NBA2K26”)">✏️</button>
            <button onclick="deleteSeason('${s.id}')" class="season-modal-btn danger">✕</button>
          </div>
        </div>`;
      }).join('')
    }`;
  document.getElementById('season-modal-content').innerHTML = html;
}
async function renameSeason(id) {
  const se = seasons.find(x => x.id === id); if(!se) return;
  const name = prompt('Nowa nazwa sezonu (edycję gry dopisz po przecinku, np. „Sezon 2, NBA2K26”):', se.name);
  if(!name || !name.trim() || name.trim() === se.name) return;
  se.name = name.trim();
  if(await saveData()) { showToast('✏️ Zmieniono nazwę sezonu', 'success'); try { openSeasonModal?.(); } catch(e) {} try { populateTeamFilter(); renderStats(); } catch(e) {} }
}
function promptNewSeason() {
  const name = prompt('Nazwa sezonu (np. Sezon 2, Wiosna 2025):');
  if(!name || !name.trim()) return;
  createSeason(name.trim());
}
function createSeason(name) {
  const id = 'season_' + Date.now();
  const today = new Date().toISOString().split('T')[0];
  // End previous active season
  if(currentSeasonId) {
    const prev = seasons.find(s => s.id === currentSeasonId);
    if(prev && !prev.endDate) prev.endDate = today;
  }
  seasons.push({ id, name, startDate: today, endDate: null });
  currentSeasonId = id;
  saveData().then(() => {
    showToast('✅ Sezon "' + name + '" ' + t('season_created') + '!', 'success');
    updateSeasonBadge();
    renderSeasonModal();
    renderDashboard();
  });
}
function activateSeason(id) {
  const today = new Date().toISOString().split('T')[0];
  if(currentSeasonId && currentSeasonId !== id) {
    const prev = seasons.find(s => s.id === currentSeasonId);
    if(prev && !prev.endDate) prev.endDate = today;
  }
  currentSeasonId = id;
  const s = seasons.find(s => s.id === id);
  if(s) s.endDate = null;
  saveData().then(() => {
    showToast('✅ Aktywowano sezon: ' + (s ? s.name : ''), 'success');
    updateSeasonBadge();
    renderSeasonModal();
    renderDashboard();
  });
}
function endCurrentSeason() {
  if(!currentSeasonId) return;
  const s = seasons.find(x => x.id === currentSeasonId);
  if(!confirm('Zakończyć sezon "' + (s ? s.name : '') + '"?')) return;
  const today = new Date().toISOString().split('T')[0];
  if(s) s.endDate = today;
  currentSeasonId = null;
  saveData().then(() => {
    showToast('⏹ Sezon zakończony', 'info');
    updateSeasonBadge();
    renderSeasonModal();
    renderDashboard();
  });
}
function mergeSeasons(keepId, removeId) {
  const removeSeason = seasons.find(s => s.id === removeId);
  const keepSeason = seasons.find(s => s.id === keepId);
  if(!removeSeason || !keepSeason) { showToast('❌ Nie znaleziono sezonów', 'error'); return; }
  if(!confirm(`Połączyć "${removeSeason.name}" → "${keepSeason.name}"?\nWszystkie mecze z "${removeSeason.name}" ' + t('season_reassign') + '"${keepSeason.name}", a duplikat zostanie usunięty.`)) return;
  let moved = 0;
  matches.forEach(m => { if(m.seasonId === removeId) { m.seasonId = keepId; moved++; } });
  seasons = seasons.filter(s => s.id !== removeId);
  if(currentSeasonId === removeId) currentSeasonId = keepId;
  saveData().then(() => {
    showToast(`✅ Scalono! Przepisano ${moved} meczów.`, 'success');
    renderSeasonModal();
    renderDashboard();
    renderMatches();
  });
}
function renderMergeSeasons() {
  // Find duplicate season names
  const nameMap = {};
  seasons.forEach(s => {
    if(!nameMap[s.name]) nameMap[s.name] = [];
    nameMap[s.name].push(s);
  });
  const dupes = Object.values(nameMap).filter(arr => arr.length > 1);
  if(!dupes.length) return '';
  return dupes.map(arr => {
    const mc = arr.map(s => matches.filter(m => m.seasonId === s.id).length);
    return `<div style="background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.3);border-radius:8px;padding:.75rem 1rem;margin-bottom:.75rem">
      <div style="font-size:.85rem;font-weight:700;color:var(--loss);margin-bottom:.5rem">⚠️ Duplikat: "${arr[0].name}"</div>
      ${arr.map((s,i) => `<div style="font-size:.8rem;color:var(--muted)">${s.id} · ${mc[i]} ${t('games_count')}</div>`).join('')}
      <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
        ${arr.map((keep,ki) => arr.filter((_,ri)=>ri!==ki).map(remove =>
          `<button onclick="mergeSeasons('${keep.id}','${remove.id}')" style="font-size:.75rem;background:var(--accent);color:#000;border:none;border-radius:6px;padding:.3rem .75rem;cursor:pointer;font-family:inherit">
            Zachowaj "${keep.id}" (${mc[ki]} meczów), usuń duplikat
          </button>`
        ).join('')).join('')}
      </div>
    </div>`;
  }).join('');
}
function deleteSeason(id) {
  const s = seasons.find(x => x.id === id);
  const mc = matches.filter(m => m.seasonId === id).length;
  const msg = mc > 0
    ? `Usunąć sezon "${s?.name}"? ${mc} meczów straci przypisanie do sezonu (mecze NIE zostaną usunięte).`
    : `Usunąć sezon "${s?.name}"?`;
  if(!confirm(msg)) return;
  seasons = seasons.filter(x => x.id !== id);
  if(currentSeasonId === id) currentSeasonId = null;
  saveData().then(() => {
    showToast('🗑 Sezon usunięty', 'info');
    updateSeasonBadge();
    renderSeasonModal();
    renderDashboard();
  });
}
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('nba2k_theme', isLight ? 'light' : 'dark');
  document.getElementById('theme-btn').textContent = isLight ? '🌙' : '☀️';
}
function openPlayerCard(playerName, teamName) {
  const agg = getAggregatedStats();
  const p = agg.find(x=>x.name===playerName);
  if(!p) { showToast('Brak danych zawodnika', 'error'); return; }
  const gr = numToGrade(p.gradeSum/p.gp);
  const avg = v => (v/p.gp).toFixed(1);
  const fgp = p.fga>0?Math.round(p.fgm/p.fga*100):0;
  const tpp = p.tpa>0?Math.round(p.tpm/p.tpa*100):0;
  const ftp = p.fta>0?Math.round(p.ftm/p.fta*100):0;
  const sn = (seasons.find(s=>s.id===currentSeasonId)||{name:'–'}).name;
  document.getElementById('pcard-modal-content').innerHTML = `
    <div class="pcard-wrap">
      <div class="pcard-pos">${p.pos||'NBA 2K26 LIGA'}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div class="pcard-name">${playerName}</div>
          <div class="pcard-team">${teamName}</div>
        </div>
        <span class="grade grade-${gr.replace('+','p').replace('-','m')}" style="font-size:2rem;padding:.4rem .7rem">${gr}</span>
      </div>
      <div style="display:flex;gap:.6rem;margin-bottom:.6rem;justify-content:center">
        <div style="background:rgba(245,197,24,.15);border:1px solid rgba(245,197,24,.4);border-radius:8px;padding:.35rem .9rem;text-align:center;flex:1">
          <div style="font-size:1.4rem;font-weight:900;color:var(--accent)">${calcCompositeScore(p).toFixed(1)}</div>
          <div style="font-size:.6rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px">Composite</div>
        </div>
        <div style="background:rgba(52,152,219,.15);border:1px solid rgba(52,152,219,.4);border-radius:8px;padding:.35rem .9rem;text-align:center;flex:1">
          <div style="font-size:1.4rem;font-weight:900;color:#3498db">${calcPER(p).toFixed(1)}</div>
          <div style="font-size:.6rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px">PER</div>
        </div>
      </div>
      <div class="pcard-stats">
        ${[['PTS',avg(p.pts)],['REB',avg(p.reb)],['AST',avg(p.ast)],['STL',avg(p.stl)],['BLK',avg(p.blk)],['TO',avg(p.to)],['FG%',fgp+'%'],['3P%',tpp+'%'],['FT%',ftp+'%']].map(([l,v])=>`<div class="pcard-stat"><div class="pcard-sv">${v}</div><div class="pcard-sl">${l}</div></div>`).join('')}
      </div>
      <div class="pcard-gp">${p.gp} GP &middot; ${sn}</div>
    </div>
    <div style="margin-top:.75rem;text-align:center;color:rgba(255,255,255,.5);font-size:.75rem">
      Zrob zrzut ekranu aby udostepnic karte zawodnika
    </div>
    <div style="display:flex;justify-content:center;margin-top:.5rem">
      <button onclick="document.getElementById('pcard-modal').classList.remove('open')" class="btn btn-ghost" style="font-size:.85rem">Zamknij</button>
    </div>`;
  document.getElementById('pcard-modal').classList.add('open');
}
function openRivalryModal() {
  const pairs = {};
  matches.forEach(m => {
    const key = [m.team1.name, m.team2.name].sort().join('|||');
    if(!pairs[key]) { const t=[m.team1.name,m.team2.name].sort(); pairs[key]={t1:t[0],t2:t[1],count:0,wins:{}}; }
    pairs[key].count++;
    const w=m.team1.score>m.team2.score?m.team1.name:m.team2.name;
    pairs[key].wins[w]=(pairs[key].wins[w]||0)+1;
  });
  const sorted=Object.values(pairs).sort((a,b)=>b.count-a.count);
  if(!sorted.length){
    document.getElementById('rivalry-modal-content').innerHTML='<div style="color:var(--muted);padding:2rem;text-align:center">Brak danych</div>';
    document.getElementById('rivalry-modal').classList.add('open');
    return;
  }
  const mx=sorted[0].count;
  const rows=sorted.map(p=>{
    const w1=p.wins[p.t1]||0,w2=p.wins[p.t2]||0,pct=Math.round(p.count/mx*100);
    return `<div class="rivalry-pair">
      <div class="rivalry-teams"><span style="color:var(--accent);font-weight:700">${p.t1}</span> <span style="color:var(--muted);font-size:.85rem">${w1}–${w2}</span> <span style="color:var(--accent2);font-weight:700">${p.t2}</span></div>
      <div class="rivalry-bar"><div class="rivalry-fill" style="width:${pct}%"></div></div>
      <div class="rivalry-count">${p.count}x</div>
    </div>`;
  }).join('');
  document.getElementById('rivalry-modal-content').innerHTML=`
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;margin-bottom:1.25rem">&#x2694;&#xfe0f; GRAF RYWALIZACJI</div>
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:1rem">Pary posortowane wg liczby meczow · wynik to bilans W–L</div>
    <div>${rows}</div>`;
  document.getElementById('rivalry-modal').classList.add('open');
}
function editMatch(id) {
  const m = matches.find(x => Number(x.id) === Number(id));
  if(!m) return;
  editingMatchId = Number(id);
  pendingMatch = JSON.parse(JSON.stringify(m));
  document.getElementById('match-modal').classList.remove('open');

  setTimeout(() => {
    showView('add-match');
    document.getElementById('match-date').value = m.date||'';
    document.getElementById('match-note').value = m.note||'';
    // Clear only the preview content, keep save button
    const pr2 = document.getElementById('parsed-result');
    if(pr2) pr2.style.display = 'block';
    const pmp = document.getElementById('parsed-match-preview');
    if(pmp) pmp.innerHTML = '';
    // Hide the "Sprawdź i Zapisz" title in edit mode
    const checkTitle = pr2?.querySelector('[data-i18n="check_save"]');
    if(checkTitle) checkTitle.style.display = 'none';
    setStatus('info', '✏️ Tryb edycji — popraw dane i kliknij Zapisz zmiany.');
    const btn = document.querySelector('[onclick="saveMatch()"]');
    if(btn) btn.innerHTML = '💾 Zapisz zmiany';

    // ── Inject editable stats table ──────────────────────────────────────
    const pr = document.getElementById('parsed-result');
    if(!pr) return;

    const STATS = ['pts','reb','ast','stl','blk','to','fol','fgm','fga','tpm','tpa','ftm','fta'];
    const LABELS = ['PTS','REB','AST','STL','BLK','TO','PF','FGM','FGA','3PM','3PA','FTM','FTA'];

    const buildTeamRows = (team, teamIdx) =>
      (team.players||[]).map((p, pi) => `
        <tr>
          <td style="padding:.3rem .5rem">
            <input type="text" value="${p.name}"
              onchange="editMatchPlayer(${teamIdx},${pi},'name',this.value)"
              style="width:110px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.15rem .3rem;font-size:.8rem;font-family:inherit">
          </td>
          <td style="padding:.3rem .3rem">
            <select onchange="editMatchPlayer(${teamIdx},${pi},'pos',this.value)"
              style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .2rem;font-size:.75rem;font-family:inherit">
              ${['PG','SG','SF','PF','C'].map(pos =>
                `<option${(p.pos||'')=== pos?' selected':''}>${pos}</option>`).join('')}
            </select>
          </td>
          <td style="padding:.3rem .3rem">
            <select onchange="editMatchGrade(${teamIdx},${pi},this.value)"
              style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .3rem;font-size:.8rem;font-family:inherit">
              ${['A+','A','A-','B+','B','B-','C+','C','C-','D'].map(g =>
                `<option${p.grade===g?' selected':''}>${g}</option>`).join('')}
            </select>
          </td>
          ${STATS.map((s,si) => `
            <td style="padding:.2rem .3rem">
              <input type="number" min="0" max="99" value="${p[s]||0}"
                onchange="editMatchStat(${teamIdx},${pi},'${s}',+this.value)"
                style="width:42px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.1rem .3rem;font-size:.8rem;text-align:center;font-family:inherit">
            </td>`).join('')}
        </tr>`).join('');

    const tableHtml = (team, teamIdx) => `
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:1px;margin:.75rem 0 .25rem;color:var(--accent)">${team.name} — ${team.score} pkt</div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:.8rem">
          <thead><tr>
            <th style="text-align:left;padding:.3rem .5rem;color:var(--muted)">Gracz</th>
            <th style="padding:.3rem .3rem;color:var(--muted)">Poz</th>
            <th style="padding:.3rem .3rem;color:var(--muted)">GRD</th>
            ${LABELS.map(l => `<th style="padding:.2rem .3rem;color:var(--muted)">${l}</th>`).join('')}
          </tr></thead>
          <tbody>${buildTeamRows(team, teamIdx)}</tbody>
        </table>
      </div>`;

    // Remove any existing edit panel first
    const oldPanel = document.getElementById('edit-stats-panel');
    if(oldPanel) oldPanel.remove();

    // Add editable table before the existing preview tabs
    const editPanel = document.createElement('div');
    editPanel.id = 'edit-stats-panel';
    editPanel.style.cssText = 'background:var(--surface2);border:1px solid var(--accent);border-radius:10px;padding:1rem;margin-bottom:1rem';
    editPanel.innerHTML = `
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;margin-bottom:.5rem">
        ✏️ Edycja statystyk
      </div>
      ${tableHtml(pendingMatch.team1, 1)}
      ${tableHtml(pendingMatch.team2, 2)}`;

    // Score + team name editing
    editPanel.innerHTML += `
      <div style="display:flex;gap:1rem;margin-top:.75rem;flex-wrap:wrap">
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Data meczu</label>
          <input type="date" value="${pendingMatch.date||''}"
            onchange="pendingMatch.date=this.value;document.getElementById('match-date').value=this.value"
            style="background:var(--surface2);border:1px solid var(--accent);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.85rem;font-family:inherit;display:block;margin-top:.25rem">
        </div>
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Kolejka</label>
          <select onchange="pendingMatch.roundId=this.value||undefined"
            style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.85rem;font-family:inherit;display:block;margin-top:.25rem">
            <option value="">— brak kolejki —</option>
            ${(rounds||[]).map(r => `<option value="${r.id}" ${pendingMatch.roundId==r.id?'selected':''}>${r.label} (${r.from} – ${r.to})</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Drużyna 1</label>
          <input type="text" value="${pendingMatch.team1.name}"
            onchange="pendingMatch.team1.name=this.value;document.querySelectorAll('.edit-team1-name').forEach(el=>el.textContent=this.value)"
            style="width:160px;background:var(--surface2);border:1px solid var(--accent);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.85rem;font-family:inherit;display:block;margin-top:.25rem">
        </div>
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Wynik D1</label>
          <input type="number" value="${pendingMatch.team1.score}" min="0" max="200"
            onchange="pendingMatch.team1.score=+this.value"
            style="width:70px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.9rem;font-family:inherit;display:block;margin-top:.25rem">
        </div>
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Drużyna 2</label>
          <input type="text" value="${pendingMatch.team2.name}"
            onchange="pendingMatch.team2.name=this.value;document.querySelectorAll('.edit-team2-name').forEach(el=>el.textContent=this.value)"
            style="width:160px;background:var(--surface2);border:1px solid var(--accent);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.85rem;font-family:inherit;display:block;margin-top:.25rem">
        </div>
        <div>
          <label style="font-size:.75rem;color:var(--muted)">Wynik D2</label>
          <input type="number" value="${pendingMatch.team2.score}" min="0" max="200"
            onchange="pendingMatch.team2.score=+this.value"
            style="width:70px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .5rem;font-size:.9rem;font-family:inherit;display:block;margin-top:.25rem">
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;margin-top:1rem;padding:.5rem .75rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:6px">
          <input type="checkbox" id="edit-walkover-chk" ${pendingMatch.walkover?'checked':''}
            onchange="pendingMatch.walkover=this.checked"
            style="width:16px;height:16px;cursor:pointer;accent-color:#ef4444">
          <label for="edit-walkover-chk" style="font-size:.85rem;font-weight:700;color:#ef4444;cursor:pointer;user-select:none">
            Walkover (W/O) &mdash; odznacz aby zmienic na normalny mecz
          </label>
        </div>
      </div>`;

    pr.insertBefore(editPanel, pr.firstChild);
  }, 200);
}
function editMatchPlayer(teamIdx, playerIdx, field, value) {
  if(!pendingMatch) return;
  const team = teamIdx === 1 ? pendingMatch.team1 : pendingMatch.team2;
  if(team.players && team.players[playerIdx]) {
    team.players[playerIdx][field] = value;
  }
}
function editMatchStat(teamIdx, playerIdx, stat, value) {
  if(!pendingMatch) return;
  const team = teamIdx === 1 ? pendingMatch.team1 : pendingMatch.team2;
  if(team.players && team.players[playerIdx]) {
    team.players[playerIdx][stat] = value;
  }
}
function editMatchGrade(teamIdx, playerIdx, grade) {
  if(!pendingMatch) return;
  const team = teamIdx === 1 ? pendingMatch.team1 : pendingMatch.team2;
  if(team.players && team.players[playerIdx]) {
    team.players[playerIdx].grade = grade;
  }
}
function savePlayerPositionFromSelect(sel) {
  const playerName = sel.dataset.player;
  const teamName = sel.dataset.team;
  savePlayerPosition(playerName, teamName, sel.value);
}
function savePlayerPosition(playerName, teamName, newPos) {
  if(newPos === undefined) {
    const sel = document.getElementById('pos-select-' + CSS.escape(playerName));
    if(!sel) return;
    newPos = sel.value;
  }
  // Update position in all matches
  let changed = 0;
  matches.forEach(m => {
    [m.team1, m.team2].forEach(t => {
      (t.players||[]).forEach(p => {
        if(p.name === playerName) { p.pos = newPos; changed++; }
      });
    });
  });
  if(changed > 0) {
    saveData().then(() => {
      showToast('✅ Pozycja zaktualizowana: ' + (newPos||'brak'), 'success');
      document.querySelectorAll('.pos-label').forEach(l => { if(l.dataset.player===playerName) l.textContent = newPos||'—'; });
    });
  } else {
    showToast('❌ Nie znaleziono gracza w meczach', 'error');
    console.log('savePlayerPosition: no matches found for', playerName);
  }
}
function setRecapModel(model) {
  recapModel = model;
  localStorage.setItem('nba2k_recap_model', model);
  ['gemini','sonnet','haiku'].forEach(function(id) {
    var btn = document.getElementById('recap-model-' + id);
    if(!btn) return;
    var active = (id === 'gemini' && model.includes('gemini')) ||
                 (id === 'sonnet' && model.includes('sonnet')) ||
                 (id === 'haiku'  && model.includes('haiku'));
    btn.style.border = active ? '2px solid var(--accent)' : '1px solid var(--border)';
    btn.style.background = active ? 'rgba(245,197,24,.12)' : 'transparent';
    btn.style.color = active ? 'var(--accent)' : 'var(--muted)';
  });
}
async function shareMatch(matchId) { generateMatchCard(matchId, true); }
function generateMatchCard(matchId, useShare) {
  var m = matches.find(function(x){ return Number(x.id) === Number(matchId); });
  if(!m) return;
  var roundLabel = '';
  if(rounds && rounds.length) {
    var r = rounds.find(function(r){ return m.date >= r.from && m.date <= r.to; });
    if(r) roundLabel = r.label;
  }
  var LOGO_SIZE = 48, W = 860, PAD = 32;
  var canvas = document.createElement('canvas');
  canvas.width = W;
  var ctx = canvas.getContext('2d');
  function measureHeight() {
    var y = PAD;
    if(roundLabel) y += 26;
    y += 70; y += 52; y += 28; y += 20; y += 28;
    var p1 = (m.team1.players||[]).length, p2 = (m.team2.players||[]).length;
    y += (p1 + p2 + 1) * 30; y += 20;
    if(m.recap) {
      ctx.font = '14px Arial';
      var paras = m.recap.split(/\n\n+/);
      var lines = 0;
      paras.forEach(function(para) {
        var words = para.replace(/\n/g,' ').split(' '), line='';
        words.forEach(function(w){ if(!w)return; var t=line?line+' '+w:w; if(ctx.measureText(t).width>W-PAD*2-8){lines++;line=w;}else{line=t;} });
        lines++;
      });
      y += 36 + lines*22 + (paras.length-1)*12 + 20;
    }
    y += PAD; return y;
  }
  canvas.height = measureHeight();
  ctx = canvas.getContext('2d');
  var bg = ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#0d1117'); bg.addColorStop(1,'#161b28');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,canvas.height);
  ctx.fillStyle='#f5c518'; ctx.fillRect(0,0,W,4);
  var y=PAD+4, w1=m.team1.score>m.team2.score;
  ctx.textBaseline='top';
  if(roundLabel) {
    ctx.font='bold 11px Arial'; ctx.fillStyle='#f5c518';
    var rlw=ctx.measureText(roundLabel.toUpperCase()).width;
    ctx.fillStyle='rgba(245,197,24,0.12)'; ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect((W-rlw-20)/2,y,rlw+20,18,4); else ctx.rect((W-rlw-20)/2,y,rlw+20,18);
    ctx.fill(); ctx.font='bold 11px Arial'; ctx.fillStyle='#f5c518';
    ctx.textAlign='center'; ctx.fillText(roundLabel.toUpperCase(),W/2,y+4); ctx.textAlign='left'; y+=26;
  }
  function drawLogo(teamName,cx,cy,size) {
    var tObj=(typeof teams!=='undefined')?teams[teamName]:null;
    if(tObj&&tObj.logo){var img=new Image();img.src=tObj.logo;ctx.save();ctx.beginPath();ctx.arc(cx,cy,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,cx-size/2,cy-size/2,size,size);ctx.restore();}
    else{var colors=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c','#e91e63'],hash=0;
    for(var ci=0;ci<teamName.length;ci++)hash=teamName.charCodeAt(ci)+((hash<<5)-hash);
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,size/2,0,Math.PI*2);ctx.fillStyle=colors[Math.abs(hash)%colors.length];ctx.fill();
    ctx.font='bold '+Math.round(size*.38)+'px Arial';ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.textAlign='center';
    var ws=teamName.trim().split(/\s+/);ctx.fillText(ws.length>=2?(ws[0][0]+ws[ws.length-1][0]).toUpperCase():teamName.slice(0,2).toUpperCase(),cx,cy);
    ctx.restore();ctx.textBaseline='top';ctx.textAlign='left';}
  }
  var logoY=y+LOGO_SIZE/2;
  drawLogo(m.team1.name,PAD+LOGO_SIZE/2,logoY,LOGO_SIZE);
  ctx.font='bold 22px Arial';ctx.fillStyle=w1?'#f5c518':'#e8eaf0';ctx.textBaseline='middle';
  ctx.fillText(m.team1.name.toUpperCase(),PAD+LOGO_SIZE+10,logoY);
  ctx.font='bold 22px Arial';ctx.fillStyle=!w1?'#f5c518':'#e8eaf0';
  var t2w=ctx.measureText(m.team2.name.toUpperCase()).width;
  ctx.fillText(m.team2.name.toUpperCase(),W-PAD-LOGO_SIZE-10-t2w,logoY);
  drawLogo(m.team2.name,W-PAD-LOGO_SIZE/2,logoY,LOGO_SIZE);
  y+=LOGO_SIZE+10; ctx.textBaseline='top';
  ctx.font='bold 48px Arial';
  var sc1=String(m.team1.score),sc2=String(m.team2.score),dash='  —  ';
  var scW=ctx.measureText(sc1+dash+sc2).width,scX=(W-scW)/2;
  ctx.fillStyle=w1?'#f5c518':'#e8eaf0';ctx.fillText(sc1,scX,y);
  ctx.fillStyle='#6b7494';ctx.fillText(dash,scX+ctx.measureText(sc1).width,y);
  ctx.fillStyle=!w1?'#f5c518':'#e8eaf0';ctx.fillText(sc2,scX+ctx.measureText(sc1+dash).width,y);
  y+=52;
  ctx.font='13px Arial';ctx.fillStyle='#6b7494';
  var dateStr=m.date||'';
  function qStr(team){return (team.quarters||[]).map(function(s,i){return 'Q'+(i+1)+':'+s;}).join('  ');}
  ctx.fillText(qStr(m.team1),PAD,y);
  var dw=ctx.measureText(dateStr).width;ctx.fillText(dateStr,(W-dw)/2,y);
  var q2=qStr(m.team2);ctx.fillText(q2,W-PAD-ctx.measureText(q2).width,y);
  y+=28;
  ctx.strokeStyle='#252b3a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();y+=16;
  var cols=[{key:'name',label:'ZAWODNIK',w:150,align:'left'},{key:'pos',label:'POZ',w:40,align:'center'},{key:'grade',label:'GRD',w:44,align:'center'},{key:'pts',label:'PTS',w:44,align:'center'},{key:'reb',label:'REB',w:44,align:'center'},{key:'ast',label:'AST',w:44,align:'center'},{key:'stl',label:'STL',w:38,align:'center'},{key:'blk',label:'BLK',w:38,align:'center'},{key:'to',label:'TO',w:38,align:'center'},{key:'fg',label:'FG%',w:62,align:'center'},{key:'3p',label:'3P%',w:62,align:'center'}];
  var colX=[PAD];for(var ci=1;ci<cols.length;ci++)colX.push(colX[ci-1]+cols[ci-1].w);
  function drawTeamRows(players,teamName) {
    ctx.fillStyle='#1a1f2b';ctx.fillRect(PAD,y,W-PAD*2,26);
    ctx.font='bold 13px Arial';ctx.fillStyle='#f5c518';ctx.textBaseline='middle';ctx.fillText(teamName.toUpperCase(),PAD+8,y+13);y+=26;
    ctx.font='bold 11px Arial';ctx.fillStyle='#6b7494';
    cols.forEach(function(col,ci){if(col.align==='left')ctx.fillText(col.label,colX[ci]+2,y+14);else{var tw=ctx.measureText(col.label).width;ctx.fillText(col.label,colX[ci]+(col.w-tw)/2,y+14);}});
    y+=28;
    players.forEach(function(p,pi){
      ctx.fillStyle=pi%2===0?'rgba(255,255,255,0.02)':'transparent';ctx.fillRect(PAD,y,W-PAD*2,28);
      function fgpct(made,att){return att>0?Math.round(made/att*100)+'%':'-';}
      var vals={name:p.name,pos:p.pos||'?',grade:p.grade||'B',pts:String(p.pts||0),reb:String(p.reb||0),ast:String(p.ast||0),stl:String(p.stl||0),blk:String(p.blk||0),to:String(p.to||0),fg:fgpct(p.fgm||0,p.fga||0),'3p':fgpct(p.tpm||0,p.tpa||0)};
      ctx.textBaseline='middle';
      cols.forEach(function(col,ci){
        var val=vals[col.key]||'-';
        if(col.key==='grade'){ctx.font='bold 12px Arial';ctx.fillStyle=val.startsWith('A')?'#f5c518':val.startsWith('B')?'#4fc3f7':'#ff8a65';}
        else if(col.key==='name'){ctx.font='bold 13px Arial';ctx.fillStyle='#e8eaf0';}
        else if(col.key==='pts'){ctx.font='bold 13px Arial';ctx.fillStyle='#f5c518';}
        else{ctx.font='12px Arial';ctx.fillStyle='#a0a8b8';}
        if(col.align==='left')ctx.fillText(val,colX[ci]+4,y+14);
        else{var tw=ctx.measureText(val).width;ctx.fillText(val,colX[ci]+(col.w-tw)/2,y+14);}
      });
      y+=28;
    });
  }
  drawTeamRows(m.team1.players||[],m.team1.name);y+=6;drawTeamRows(m.team2.players||[],m.team2.name);
  if(m.recap){
    y+=16;ctx.strokeStyle='#252b3a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();y+=16;
    ctx.font='bold 13px Arial';ctx.fillStyle='#f5c518';ctx.textBaseline='top';ctx.fillText('📝 RECAP MECZU',PAD,y);y+=24;
    ctx.font='14px Arial';ctx.fillStyle='#c8ccd8';
    var paras=m.recap.split(/\n\n+/),lineH=22,paraGap=12;
    paras.forEach(function(para,pi){
      var words=para.replace(/\n/g,' ').split(' '),line='';
      words.forEach(function(w){if(!w)return;var t=line?line+' '+w:w;if(ctx.measureText(t).width>W-PAD*2-8){ctx.fillText(line,PAD,y);y+=lineH;line=w;}else{line=t;}});
      if(line){ctx.fillText(line,PAD,y);y+=lineH;}
      if(pi<paras.length-1)y+=paraGap;
    });
  }
  ctx.fillStyle='#f5c518';ctx.fillRect(0,canvas.height-3,W,3);
  var filename=(m.team1.name+'_vs_'+m.team2.name+'_'+(m.date||'')+'.png').replace(/\s+/g,'_');
  canvas.toBlob(function(blob){
    var file=new File([blob],filename,{type:'image/png'});
    if(useShare&&navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
      navigator.share({files:[file],title:m.team1.name+' '+m.team1.score+' - '+m.team2.score+' '+m.team2.name}).catch(function(e){if(e.name!=='AbortError')showToast('❌ Nie udało się udostępnić','error');});
    } else {
      var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);showToast('✅ Obrazek pobrany!','success');
    }
  },'image/png');
}
function sharePlayerCard(playerName, teamName) {
  var allGames=[];
  matches.forEach(function(m){[m.team1,m.team2].forEach(function(t){if(t.name!==teamName)return;(t.players||[]).forEach(function(p){if(p.name===playerName)allGames.push(Object.assign({},p,{date:m.date}));});});});
  if(!allGames.length)return;
  var gp=allGames.length;
  function sum(k){return allGames.reduce(function(s,g){return s+(g[k]||0);},0);}
  function avg(k){return gp>0?(sum(k)/gp).toFixed(1):'0.0';}
  var fgPct=sum('fga')>0?Math.round(sum('fgm')/sum('fga')*100)+'%':'0%';
  var tpPct=sum('tpa')>0?Math.round(sum('tpm')/sum('tpa')*100)+'%':'0%';
  var ftPct=sum('fta')>0?Math.round(sum('ftm')/sum('fta')*100)+'%':'0%';
  var _p={gp:gp,pts:sum('pts'),reb:sum('reb'),ast:sum('ast'),stl:sum('stl'),blk:sum('blk'),to:sum('to'),fgm:sum('fgm'),fga:sum('fga'),tpm:sum('tpm'),tpa:sum('tpa'),ftm:sum('ftm'),fta:sum('fta'),gradeSum:allGames.reduce(function(s,g){return s+gradeToNum(g.grade||'B');},0)};
  var cs=calcCompositeScore(_p).toFixed(1),per=calcPER(_p).toFixed(1),avgGrade=numToGrade(_p.gradeSum/gp);
  var W=600,PAD=28,canvas=document.createElement('canvas');canvas.width=W;canvas.height=420;
  var ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,0,420);
  bg.addColorStop(0,'#0d1117');bg.addColorStop(1,'#161b28');ctx.fillStyle=bg;ctx.fillRect(0,0,W,420);
  ctx.fillStyle='#f5c518';ctx.fillRect(0,0,W,4);
  var y=PAD+4,LOGO=48;
  var tObj=(typeof teams!=='undefined')?teams[teamName]:null;
  if(tObj&&tObj.logo){var img=new Image();img.src=tObj.logo;ctx.save();ctx.beginPath();ctx.arc(PAD+LOGO/2,y+LOGO/2,LOGO/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,PAD,y,LOGO,LOGO);ctx.restore();}
  else{var hash=0;for(var ci=0;ci<teamName.length;ci++)hash=teamName.charCodeAt(ci)+((hash<<5)-hash);var cols=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'];ctx.save();ctx.beginPath();ctx.arc(PAD+LOGO/2,y+LOGO/2,LOGO/2,0,Math.PI*2);ctx.fillStyle=cols[Math.abs(hash)%cols.length];ctx.fill();ctx.font='bold 16px Arial';ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.textAlign='center';var ws=teamName.trim().split(/\s+/);ctx.fillText(ws.length>=2?(ws[0][0]+ws[ws.length-1][0]).toUpperCase():teamName.slice(0,2).toUpperCase(),PAD+LOGO/2,y+LOGO/2);ctx.restore();}
  ctx.textBaseline='top';ctx.textAlign='left';
  ctx.font='bold 28px Arial';ctx.fillStyle='#f5c518';ctx.fillText(playerName.toUpperCase(),PAD+LOGO+14,y+4);
  ctx.font='13px Arial';ctx.fillStyle='#6b7494';ctx.fillText(teamName+' · '+(allGames[0]&&allGames[0].pos||'—')+' · '+gp+' meczów',PAD+LOGO+14,y+38);
  y+=LOGO+18;
  var gc={'A+':'#f5c518','A':'#f5c518','A-':'#e0b800','B+':'#4fc3f7','B':'#4fc3f7','B-':'#29b6f6','C+':'#ff8a65','C':'#ff7043','C-':'#f4511e'};
  var gcol=gc[avgGrade]||'#f5c518';
  ctx.fillStyle=gcol+'22';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(PAD,y,64,36,6);else ctx.rect(PAD,y,64,36);ctx.fill();
  ctx.font='bold 22px Arial';ctx.fillStyle=gcol;ctx.textAlign='center';ctx.fillText(avgGrade,PAD+32,y+7);ctx.textAlign='left';
  ctx.font='bold 12px Arial';ctx.fillStyle='#6b7494';ctx.fillText('CS',PAD+80,y+4);
  ctx.font='bold 24px Arial';ctx.fillStyle='#f5c518';ctx.fillText(cs,PAD+80,y+18);
  ctx.font='bold 12px Arial';ctx.fillStyle='#6b7494';ctx.fillText('PER',PAD+155,y+4);
  ctx.font='bold 24px Arial';ctx.fillStyle='#3498db';ctx.fillText(per,PAD+155,y+18);
  y+=50;ctx.strokeStyle='#252b3a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();y+=14;
  var stats=[{l:'PTS',v:avg('pts')},{l:'REB',v:avg('reb')},{l:'AST',v:avg('ast')},{l:'STL',v:avg('stl')},{l:'BLK',v:avg('blk')},{l:'TO',v:avg('to')},{l:'FG%',v:fgPct},{l:'3P%',v:tpPct},{l:'FT%',v:ftPct},{l:'GP',v:String(gp)}];
  var cellW=(W-PAD*2)/5,cellH=62;
  stats.forEach(function(st,idx){var col=idx%5,row=Math.floor(idx/5),cx=PAD+col*cellW,cy=y+row*cellH;ctx.fillStyle='rgba(255,255,255,0.03)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(cx+2,cy+2,cellW-4,cellH-4,6);else ctx.rect(cx+2,cy+2,cellW-4,cellH-4);ctx.fill();ctx.font='bold 10px Arial';ctx.fillStyle='#6b7494';ctx.textAlign='center';ctx.fillText(st.l,cx+cellW/2,cy+9);ctx.font='bold 21px Arial';ctx.fillStyle='#f5c518';ctx.fillText(st.v,cx+cellW/2,cy+24);ctx.textAlign='left';});
  y+=2*cellH+14;ctx.strokeStyle='#252b3a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();y+=12;
  ctx.font='bold 11px Arial';ctx.fillStyle='#6b7494';ctx.fillText('OSTATNIE MECZE',PAD,y);y+=18;
  var recent=[].concat(allGames).sort(function(a,b){return new Date(b.date)-new Date(a.date);}).slice(0,7);
  recent.forEach(function(g,i){var gx=PAD+i*34,gy=y,gr=g.grade||'B',grc=gc[gr]||'#f5c518';ctx.fillStyle=grc+'33';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(gx,gy,28,28,4);else ctx.rect(gx,gy,28,28);ctx.fill();ctx.font='bold 11px Arial';ctx.fillStyle=grc;ctx.textAlign='center';ctx.fillText(gr,gx+14,gy+9);ctx.font='10px Arial';ctx.fillStyle='#6b7494';ctx.fillText(g.pts||0,gx+14,gy+20);ctx.textAlign='left';});
  ctx.fillStyle='#f5c518';ctx.fillRect(0,417,W,3);
  var fname=playerName.replace(/\s+/g,'_')+'_card.png';
  canvas.toBlob(function(blob){var file=new File([blob],fname,{type:'image/png'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:playerName+' — Karta gracza'}).catch(function(e){if(e.name!=='AbortError')showToast('❌ Błąd','error');});}else{var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=fname;a.click();URL.revokeObjectURL(url);showToast('✅ Karta pobrana!','success');};},'image/png');
}
function shareStandings() {
  var stats={};
  matches.forEach(function(m){
    var isWO=m.walkover===true;
    var w1=m.team1.score>m.team2.score;
    [[m.team1,m.team2,w1],[m.team2,m.team1,!w1]].forEach(function(pair){
      var my=pair[0],op=pair[1],won=pair[2];
      if(!stats[my.name])stats[my.name]={w:0,l:0,wo:0,pf:0,pa:0};
      var s=stats[my.name];
      if(won)s.w++;else{s.l++;if(isWO)s.wo++;}
      if(!isWO){s.pf+=my.score;s.pa+=op.score;}
    });
  });
  var sorted=Object.keys(stats).map(function(n){var s=stats[n],gp=s.w+s.l,pts=s.w*2+(s.l-s.wo)*1;return{name:n,w:s.w,l:s.l,gp:gp,pts:pts,ppg:gp>0?(s.pf/gp).toFixed(1):'0.0',opp:gp>0?(s.pa/gp).toFixed(1):'0.0'};}).sort(function(a,b){return b.pts-a.pts||b.w-a.w;});
  var W=660,ROW=36,PAD=24,HEAD=80,canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=HEAD+sorted.length*ROW+PAD;
  var ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#0d1117');bg.addColorStop(1,'#161b28');ctx.fillStyle=bg;ctx.fillRect(0,0,W,canvas.height);
  ctx.fillStyle='#f5c518';ctx.fillRect(0,0,W,4);
  var y=PAD+4;
  ctx.font='bold 24px Arial';ctx.fillStyle='#f5c518';ctx.textBaseline='top';ctx.fillText('TABELA LIGOWA',PAD,y);y+=34;
  ctx.font='12px Arial';ctx.fillStyle='#6b7494';
  var sn=seasons.find(function(s){return s.id===currentSeasonId;});
  ctx.fillText('Sezon: '+(sn?sn.name:'Wszystkie'),PAD,y);y+=24;
  var cols=[{l:'#',w:32},{l:'DRUŻYNA',w:210},{l:'M',w:36},{l:'W',w:36},{l:'L',w:36},{l:'PTS',w:44},{l:'PPG',w:52},{l:'OPP',w:52}];
  var xs=[PAD];cols.forEach(function(c,i){if(i>0)xs.push(xs[i-1]+cols[i-1].w);});
  ctx.fillStyle='rgba(245,197,24,0.08)';ctx.fillRect(0,y,W,26);
  ctx.font='bold 10px Arial';ctx.fillStyle='#6b7494';ctx.textBaseline='middle';
  cols.forEach(function(c,i){ctx.textAlign=i>1?'center':'left';ctx.fillText(c.l,i>1?xs[i]+cols[i].w/2:xs[i],y+13);});y+=26;
  sorted.forEach(function(t,idx){
    ctx.fillStyle=idx%2===0?'rgba(255,255,255,0.02)':'transparent';ctx.fillRect(0,y,W,ROW);
    ctx.textBaseline='middle';
    ctx.textAlign='center';ctx.font='13px Arial';ctx.fillStyle='#6b7494';
    ctx.fillText(idx<3?['🥇','🥈','🥉'][idx]:String(idx+1),xs[0]+cols[0].w/2,y+ROW/2);
    ctx.textAlign='left';ctx.font='bold 13px Arial';ctx.fillStyle='#e8eaf0';ctx.fillText(t.name,xs[1],y+ROW/2);
    [[String(t.gp),'#a0a8b8'],[String(t.w),'#2ecc71'],[String(t.l),'#e74c3c'],[String(t.pts),'#f5c518'],[t.ppg,'#a0a8b8'],[t.opp,'#a0a8b8']].forEach(function(pair,i){ctx.textAlign='center';ctx.font=i===3?'bold 13px Arial':'12px Arial';ctx.fillStyle=pair[1];ctx.fillText(pair[0],xs[i+2]+cols[i+2].w/2,y+ROW/2);});
    y+=ROW;
  });
  ctx.fillStyle='#f5c518';ctx.fillRect(0,canvas.height-3,W,3);
  canvas.toBlob(function(blob){var file=new File([blob],'tabela.png',{type:'image/png'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'Tabela ligowa'}).catch(function(e){if(e.name!=='AbortError')showToast('❌ Błąd','error');});}else{var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='tabela.png';a.click();URL.revokeObjectURL(url);showToast('✅ Tabela pobrana!','success');};},'image/png');
}
function shareTeamCard(tn) {
  var w=0,l=0,pf=0,pa=0;
  matches.forEach(function(m){if(m.team1.name===tn){w+=m.team1.score>m.team2.score?1:0;l+=m.team1.score<m.team2.score?1:0;pf+=m.team1.score;pa+=m.team2.score;}if(m.team2.name===tn){w+=m.team2.score>m.team1.score?1:0;l+=m.team2.score<m.team1.score?1:0;pf+=m.team2.score;pa+=m.team1.score;}});
  var gp=w+l,pm={};
  matches.forEach(function(m){[m.team1,m.team2].forEach(function(t){if(t.name!==tn)return;(t.players||[]).forEach(function(p){if(!pm[p.name])pm[p.name]={name:p.name,gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gs:0};var s=pm[p.name];s.gp++;s.pts+=p.pts||0;s.reb+=p.reb||0;s.ast+=p.ast||0;s.stl+=p.stl||0;s.blk+=p.blk||0;s.to+=p.to||0;s.fgm+=p.fgm||0;s.fga+=p.fga||0;s.tpm+=p.tpm||0;s.tpa+=p.tpa||0;s.ftm+=p.ftm||0;s.fta+=p.fta||0;s.gs+=gradeToNum(p.grade||'B');});});});
  var pl=Object.values(pm).map(function(p){var pf2={name:p.name,team:tn,pos:p.pos||'',gp:p.gp,pts:p.pts,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,to:p.to,fgm:p.fgm,fga:p.fga,tpm:p.tpm,tpa:p.tpa,ftm:p.ftm,fta:p.fta,gradeSum:p.gs};return Object.assign(p,{_cs:calcCompositeScore(pf2)});}).sort(function(a,b){return b._cs-a._cs;});
  var W=660,ROW=32,PAD=24,HEAD=110,canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=HEAD+pl.length*ROW+PAD;
  var ctx=canvas.getContext('2d'),bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#0d1117');bg.addColorStop(1,'#161b28');ctx.fillStyle=bg;ctx.fillRect(0,0,W,canvas.height);
  ctx.fillStyle='#f5c518';ctx.fillRect(0,0,W,4);
  var y=PAD+4,LOGO=52;
  var tObj=(typeof teams!=='undefined')?teams[tn]:null;
  if(tObj&&tObj.logo){var img=new Image();img.src=tObj.logo;ctx.save();ctx.beginPath();ctx.arc(PAD+LOGO/2,y+LOGO/2,LOGO/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,PAD,y,LOGO,LOGO);ctx.restore();}
  else{var hash=0;for(var ci=0;ci<tn.length;ci++)hash=tn.charCodeAt(ci)+((hash<<5)-hash);var colors=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'];ctx.save();ctx.beginPath();ctx.arc(PAD+LOGO/2,y+LOGO/2,LOGO/2,0,Math.PI*2);ctx.fillStyle=colors[Math.abs(hash)%colors.length];ctx.fill();ctx.font='bold 18px Arial';ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.textAlign='center';var ws=tn.trim().split(/\s+/);ctx.fillText(ws.length>=2?(ws[0][0]+ws[ws.length-1][0]).toUpperCase():tn.slice(0,2).toUpperCase(),PAD+LOGO/2,y+LOGO/2);ctx.restore();}
  ctx.textBaseline='top';ctx.textAlign='left';ctx.font='bold 26px Arial';ctx.fillStyle='#f5c518';ctx.fillText(tn.toUpperCase(),PAD+LOGO+14,y+6);
  ctx.font='13px Arial';ctx.fillStyle='#6b7494';ctx.fillText(String(w)+'W  '+String(l)+'L    PPG: '+(gp>0?(pf/gp).toFixed(1):'0.0')+'  OPP: '+(gp>0?(pa/gp).toFixed(1):'0.0'),PAD+LOGO+14,y+38);
  y+=LOGO+18;
  var cols=[{l:'ZAWODNIK',w:155},{l:'GP',w:34},{l:'GRD',w:46},{l:'CS',w:50},{l:'PTS',w:50},{l:'REB',w:42},{l:'AST',w:42},{l:'STL',w:42},{l:'BLK',w:42},{l:'FG%',w:50}];
  var xs=[PAD];cols.forEach(function(c,i){if(i>0)xs.push(xs[i-1]+cols[i-1].w);});
  ctx.fillStyle='rgba(245,197,24,0.08)';ctx.fillRect(0,y,W,24);
  ctx.font='bold 10px Arial';ctx.fillStyle='#6b7494';ctx.textBaseline='middle';
  cols.forEach(function(c,i){ctx.textAlign=i>0?'center':'left';ctx.fillText(c.l,i>0?xs[i]+cols[i].w/2:xs[i],y+12);});y+=24;
  var gc={'A+':'#f5c518','A':'#f5c518','A-':'#e0b800','B+':'#4fc3f7','B':'#4fc3f7','B-':'#29b6f6','C+':'#ff8a65','C':'#ff7043','C-':'#f4511e'};
  pl.forEach(function(p,idx){
    ctx.fillStyle=idx%2===0?'rgba(255,255,255,0.02)':'transparent';ctx.fillRect(0,y,W,ROW);
    var a=function(v){return p.gp>0?(v/p.gp).toFixed(1):'0.0';},ag=numToGrade(p.gp>0?p.gs/p.gp:0),fgp=p.fga>0?Math.round(p.fgm/p.fga*100)+'%':'-';
    ctx.textBaseline='middle';ctx.textAlign='left';ctx.font='bold 12px Arial';ctx.fillStyle='#e8eaf0';ctx.fillText(p.name,xs[0],y+ROW/2);
    [[String(p.gp),'#a0a8b8',false],[ag,gc[ag]||'#f5c518',true],[p._cs.toFixed(1),'#f5c518',true],[a(p.pts),'#f5c518',true],[a(p.reb),'#a0a8b8',false],[a(p.ast),'#a0a8b8',false],[a(p.stl),'#a0a8b8',false],[a(p.blk),'#a0a8b8',false],[fgp,'#a0a8b8',false]].forEach(function(triple,i){ctx.textAlign='center';ctx.font=triple[2]?'bold 12px Arial':'11px Arial';ctx.fillStyle=triple[1];ctx.fillText(triple[0],xs[i+1]+cols[i+1].w/2,y+ROW/2);});
    y+=ROW;
  });
  ctx.fillStyle='#f5c518';ctx.fillRect(0,canvas.height-3,W,3);
  var fname=tn.replace(/\s+/g,'_')+'_team.png';
  canvas.toBlob(function(blob){var file=new File([blob],fname,{type:'image/png'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:tn+' — karta drużyny'}).catch(function(e){if(e.name!=='AbortError')showToast('❌ Błąd','error');});}else{var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=fname;a.click();URL.revokeObjectURL(url);showToast('✅ Karta drużyny pobrana!','success');};},'image/png');
}
async function generateRecap(id) {
  if(!_isLoggedInSync()) { showToast('❌ Tylko admin może generować recapy', 'error'); return; }
  const m = matches.find(x => Number(x.id) === Number(id));
  if(!m) return;
  const recapDiv = document.getElementById('match-recap-' + id);

  if(!hasAI()) {
    if(recapDiv) showToast('❌ Brak konfiguracji AI — podaj Worker URL w ⚙ Baza', 'error');
    return;
  }

  if(recapDiv) recapDiv.innerHTML = '<div style="padding:1rem;color:var(--muted);font-size:.9rem">'+t('generating_recap')+'</div>';

  const w1 = m.team1.score > m.team2.score;
  const winner = w1 ? m.team1.name : m.team2.name;
  const loser  = w1 ? m.team2.name : m.team1.name;
  const diff   = Math.abs(m.team1.score - m.team2.score);

  const formatPlayers = (team) => (team.players||[]).map(p =>
    `${p.name} [${p.pos||'?'}] (${p.grade}): ${p.pts}pkt ${p.reb}zb ${p.ast}as ${p.stl}prz ${p.blk}blk ${p.to}st FG:${p.fgm}/${p.fga} 3P:${p.tpm}/${p.tpa}`
  ).join('\n');

  const quarters = (t) => (t.quarters||[]).map((s,i)=>`Q${i+1}:${s}`).join(' ');

  // Build matchup duels: attacker[pos] is guarded by opponent[guardPos]
  // PG is guarded by SF, SG by SG, SF by PG, PF by C, C by PF
  const GUARD_MAP = { PF:'PG', SG:'SG', PG:'SF', C:'PF', SF:'C' }; // PG kryje PF, SG kryje SG, SF kryje PG, PF kryje C, C kryje SF
  const getByPos = (team, pos) => (team.players||[]).find(p => p.pos === pos);
  // Special exceptions: chemik81pl (SF) always guards C instead of PG
  const PLAYER_EXCEPTIONS = {
    'chemik81pl': { guardPos: 'C', overridesPos: 'SF' }
  };

  const duelLines = [];

  // Helper: build one duel line
  const makeDuel = (def, defPosLabel, atk, atkPos) => {
    const fgPct = atk.fga>0 ? Math.round(atk.fgm/atk.fga*100)+'%' : 'brak rzutów';
    return `POJEDYNEK: ${def.name}[${defPosLabel}] KRYJE ${atk.name}[${atkPos}] — atakujący: ${atk.pts}pkt FG:${atk.fgm||0}/${atk.fga||0}(${fgPct}) TO:${atk.to||0} ocena:${atk.grade} | obrońca: ${def.stl||0}prz ${def.blk||0}blk ocena:${def.grade}`;
  };

  // Track which positions have been handled by exceptions
  const handledDefenders = new Set(); // 'team1_SF', 'team2_SF' etc.
  const handledAttackers = new Set(); // 'team1_C', 'team2_C' etc.

  // Apply player exceptions first
  for(const [playerName, exc] of Object.entries(PLAYER_EXCEPTIONS)) {
    for(const team of [m.team1, m.team2]) {
      const defPlayer = (team.players||[]).find(p => p.name === playerName && p.pos === exc.overridesPos);
      if(!defPlayer) continue;
      const oppTeam = team === m.team1 ? m.team2 : m.team1;
      const atkPlayer = getByPos(oppTeam, exc.guardPos);
      if(!atkPlayer) continue;
      // Add exception duel
      duelLines.push(makeDuel(defPlayer, exc.overridesPos+'*', atkPlayer, exc.guardPos));
      // Mark as handled
      const teamKey = team === m.team1 ? 'team1' : 'team2';
      const oppKey  = team === m.team1 ? 'team2' : 'team1';
      handledDefenders.add(teamKey + '_' + exc.overridesPos);
      handledAttackers.add(oppKey + '_' + exc.guardPos);
    }
  }

  // Standard GUARD_MAP for remaining positions
  for(const [atkPos, grdPos] of Object.entries(GUARD_MAP)) {
    // team1 attacker guarded by team2 defender
    if(!handledAttackers.has('team1_' + atkPos) && !handledDefenders.has('team2_' + grdPos)) {
      const atk1 = getByPos(m.team1, atkPos);
      const def1 = getByPos(m.team2, grdPos);
      if(atk1 && def1) duelLines.push(makeDuel(def1, grdPos, atk1, atkPos));
    }
    // team2 attacker guarded by team1 defender
    if(!handledAttackers.has('team2_' + atkPos) && !handledDefenders.has('team1_' + grdPos)) {
      const atk2 = getByPos(m.team2, atkPos);
      const def2 = getByPos(m.team1, grdPos);
      if(atk2 && def2) duelLines.push(makeDuel(def2, grdPos, atk2, atkPos));
    }
  }
  const duelsText = duelLines.length ? '\nBEZPOŚREDNIE POJEDYNKI (kto atakuje, kto broni):\n' + duelLines.join('\n') : '';

  // Flag players with 0 shot attempts
  const zeroShotsNote = (team) => (team.players||[])
    .filter(p => (p.fga||0) === 0 && (p.fta||0) === 0)
    .map(p => p.name).join(', ');
  const zs1 = zeroShotsNote(m.team1);
  const zs2 = zeroShotsNote(m.team2);
  const zeroShotsText = [zs1 && `${m.team1.name}: ${zs1}`, zs2 && `${m.team2.name}: ${zs2}`].filter(Boolean).join('; ');

  const prompt = `Napisz recap meczu ${_editionOf(m.seasonId) || 'NBA 2K'} po polsku — około 150 słów. Nie określaj, kiedy był mecz (bez „wczoraj”, „dziś”). Pisz prostym, codziennym językiem jakbyś opowiadał znajomym. Bez kwiecistego stylu. Opisz: jak wyglądał mecz i przebieg kluczowych kwart, kto był MVP z uzasadnieniem, jeden ciekawy moment lub pojedynek. Jeden akapit, bez nagłówków i list.

WAŻNE ZASADY:
- Jeśli gracz miał FGA=0 i FTA=0: napisz że nie otrzymał ani jednej piłki od kolegów i zadaj refleksyjne pytanie czy gdyby go częściej szukali wynik mógłby być inny. NIE pisz "dramat" ani "słaby".
- Jeśli gracz miał FGA>0 ale 0 punktów (np. 0/2): nie pisz że "nie był szukany" — dostał szanse ale nie wykorzystał. Napisz że miał trudny wieczór w ataku lub nie trafił gdy miał okazje.
- Jeśli gracz miał MAŁO prób rzutów (np. 2-3 FGA) ale WYSOKĄ skuteczność (np. 2/3 = 67%), NIE pisz że ktoś go "zneutralizował" — po prostu rzadko dostawał piłkę, ale gdy dostał, był skuteczny.
- "Zneutralizowany", "zatrzymany", "ograniczony", "dobra defensywa na nim" — stosuj WYŁĄCZNIE gdy gracz miał 5 lub więcej prób rzutów (FGA>=5) I skuteczność poniżej 40%. W każdym innym przypadku NIE pisz że obrońca dobrze zagrał na danym graczu. Przykłady: 2/3 (67%) = mało prób, dobra skuteczność — NIE zatrzymany. 3/8 (38%) = dużo prób, zła skuteczność = zatrzymany. 0/2 (0%) = mało prób, nie trafił gdy miał szansę — nie pisz "zatrzymany", pisz "nie wykorzystał okazji".
- Oceniaj defensywę przez pryzmat punktów zdobytych przez rywala którego bronił — ile pozwolił zdobyć i przy jakiej skuteczności. Jeśli rywal zdobył dużo punktów przy wysokiej skuteczności (np. 19pkt przy 82%), to obrońca zawiódł defensywnie — napisz "zawiódł w defensywie" lub "pozwolił rywali dominować", NIE "zdominował go defensywnie" (bo to brzmi jakby obrońca był dobry).
- NIE dodawaj wzmianki o słabej defensywie jako "choć X zawiódł" po pochwale — jeśli ktoś zawiódł defensywnie, napisz to osobno i wprost.
- KLUCZOWE: Jeśli drużyna wygrała mecz wyraźnie (różnica 15+ punktów), NIE krytykuj defensywy jej zawodników — wynik mówi sam za siebie. Skup się na tym co zrobili dobrze. Krytykę defensywną stosuj głównie wobec zawodników PRZEGRANEJ drużyny.
- Jeśli drużyna wygrała wysoką różnicą (10+ punktów), NIE krytykuj defensywy jej graczy nawet jeśli rywal zdobył dużo punktów — wysoka wygrana oznacza że defensywa jako całość była wystarczająca. Krytykuj defensywę tylko przy porażce lub bardzo wyrównanym meczu (różnica <6 punktów).
- Jeśli kilku graczy miało mało prób rzutów (1-3 FGA), NIE wyróżniaj jednego z nich jako "niewidzianego przez kolegów" — to dotyczy całej grupy graczy z małą liczbą prób. Komentarz o braku piłek stosuj tylko gdy gracz miał FGA=0.
- Jeśli gracz oddał dużo rzutów (10+) i trafił poniżej 50%, to był to kiepski wieczór ofensywny — forsował rzuty i nie był skuteczny mimo dużego zaufania zespołu. Np. 11/20 (55%) przy 20 próbach to przeciętny występ ofensywny, nie dobry.
- Dużo punktów przy złej skuteczności (poniżej 45%) i wielu stratach (3+) to NIE jest dobry mecz ofensywny — zaznacz to.
- Gracze z 0 FGA w tym meczu: \${zeroShotsText || 'brak'}.
- SPECJALNE ZASADY DLA KONKRETNYCH GRACZY:
  * chemik81pl: gdy jego ocena to B lub wyższa (B, B+, A-, A, A+), zawsze napisz o nim z lekką pochwałą i uznaniem — podkreśl jego wkład, nawet jeśli statystyki nie są spektakularne. Traktuj go jak gracza który "cicho robi robotę". WYJĄTEK DEFENSYWNY: chemik81pl mimo że gra na pozycji SF, zawsze kryje C przeciwnej drużyny (nie PG jak wynikałoby ze standardowych zasad krycia). Stosuj tę regułę zawsze — oceniaj jego defensywę względem punktów i skuteczności rywala grającego na C.
  * SniperKPL: TYLKO gdy w tym meczu gra drużyna Polish Snickers — możesz pisać o nim naprzemiennie jako "SniperKPL" lub "Saper", używając przydomka "Saper" mniej więcej co drugi raz. Jeśli Polish Snickers NIE gra w tym meczu, zawsze używaj tylko "SniperKPL".

ZASADY KRYCIA W TEJ LIDZE: PG kryje PF rywala, SG kryje SG rywala, SF kryje PG rywala, PF kryje C rywala, C kryje SF rywala.
W DANYCH PONIŻEJ: format "X KRYJE Y" oznacza że X jest obrońcą a Y atakującym. Np. "LeTbartko[SF] KRYJE RudiGay[PG]" = LeTbartko broni przed RudiGay'em. NIE odwracaj tej relacji.
KONTEKST: PG i C rywala grają razem pick'n'roll — SF i PF często zamieniają się przy ich kryciu na ułamki sekund, więc obaj SF i PF współodpowiadają za zatrzymanie PG i C.
UWAGA: Pozycje mogą nie odzwierciedlać faktycznej roli. Stosuj zdrowy rozsądek — PG to rozgrywający (dużo asyst, mało zbiórek), C/PF to gracze podkoszowi (dużo zbiórek). NIE opisuj PG jako gracza "strefy podkoszowej" ani "podkoszowego" — to pozycja obwodowa.

MECZ: ${m.team1.name} ${m.team1.score} - ${m.team2.score} ${m.team2.name}
Data: ${m.date || 'brak'}
${m.note ? 'Notatka: ' + m.note : ''}
Kwarty ${m.team1.name}: ${quarters(m.team1)}
Kwarty ${m.team2.name}: ${quarters(m.team2)}

STATYSTYKI ${m.team1.name} [pozycja]:
${formatPlayers(m.team1)}

STATYSTYKI ${m.team2.name} [pozycja]:
${formatPlayers(m.team2)}${duelsText}`;

  try {
    const data = await callAI(recapModel || MODEL_CHEAP(), 1024, [{ role: 'user', content: prompt }]);
    if(data.error) throw new Error(data.error?.message || 'API error');
    const recap = data.content?.[0]?.text || '';
    // Save recap to match
    const idx = matches.findIndex(x => Number(x.id) === Number(id));
    if(idx !== -1) { matches[idx].recap = recap; saveData(); }
    if(recapDiv) recapDiv.innerHTML = renderRecapBlock(recap, id);
  } catch(e) {
    if(recapDiv) recapDiv.innerHTML = `<div style="color:var(--loss);font-size:.85rem;padding:.75rem">❌ Błąd generowania: ${e.message}</div>`;
    throw e;
  }
}
function calcDefScore(p) {
  // Defensive score: STL (high weight) + BLK + defensive grade proxy
  // We don't have pts-allowed per matchup so we use: STL*3 + BLK*2 + low TO bonus
  const gp = Math.max(p.gp, 1);
  const stlPG = (p.stl||0) / gp;
  const blkPG = (p.blk||0) / gp;
  const toPG  = (p.to||0)  / gp;
  const gradeFactor = (p.gradeSum / gp) / 13; // 0..1
  // maturity factor same as composite
  const maturity = gp / (gp + 5);
  const base = stlPG * 40 + blkPG * 25 + gradeFactor * 20 - toPG * 5;
  return Math.max(0, base * maturity);
}
function buildDefFive(roundMatches) {
  const totalGames = roundMatches.length;
  const minGP = Math.min(3, Math.max(1, Math.ceil(totalGames / 6)));
  const POSITIONS = ['PG','SG','SF','PF','C'];
  const playerMap = {};
  roundMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players||[]).forEach((p,idx) => {
        const pos = p.pos || POSITIONS[idx] || 'PG';
        const key = p.name + '|' + pos;
        if(!playerMap[key]) playerMap[key] = {name:p.name,team:team.name,pos,posCounts:{},gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gradeSum:0};
        const s = playerMap[key];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
        if(p.pos) { if(!s.posCounts) s.posCounts={}; s.posCounts[p.pos]=(s.posCounts[p.pos]||0)+1; }
        if(p.pos) s.posCounts[p.pos] = (s.posCounts[p.pos]||0)+1;
      });
    });
  });
  // Set primary position = most frequent
  Object.values(playerMap).forEach(pl => {
    if(Object.keys(pl.posCounts||{}).length) pl.pos = Object.entries(pl.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
  });
  const players = Object.values(playerMap)
    .filter(p => p.gp >= minGP)
    .map(p => ({...p, avgGrade: p.gradeSum/p.gp, score: calcDefScore(p)}));
  const best = {};
  POSITIONS.forEach(pos => {
    const c = players.filter(p => p.pos === pos);
    if(c.length) best[pos] = c.sort((a,b) => b.score-a.score)[0];
  });
  return { best, POSITIONS, minGP };
}
function renderFiveGrid(best, POSITIONS, minGP, mode) {
  // mode: 'off' = offensive (composite), 'def' = defensive
  return POSITIONS.map(pos => {
    const p = best[pos];
    if(!p) return '<div class="tow-card"><div class="tow-pos">'+pos+'</div><div style="color:var(--muted);font-size:.75rem">Brak<br>(min.'+minGP+')</div></div>';
    const gr = numToGrade(p.avgGrade);
    const esc = s => s.replace(/'/g,"\'");
    const stl=(p.stl/p.gp).toFixed(1), blk=(p.blk/p.gp).toFixed(1);
    const pts=(p.pts/p.gp).toFixed(1), reb=(p.reb/p.gp).toFixed(1), ast=(p.ast/p.gp).toFixed(1);
    const statsLine = mode==='def'
      ? stl+' STL · '+blk+' BLK · '+reb+' REB'
      : pts+' PTS · '+reb+' REB · '+ast+' AST';
    const scoreVal = mode==='def' ? calcDefScore(p).toFixed(1) : calcCompositeScore(p).toFixed(1);
    const scoreLabel = mode==='def' ? 'DEF' : 'CS';
    const scoreColor = mode==='def' ? '#2ecc71' : 'var(--accent)';
    return '<div class="tow-card" onclick="openPlayerModal(\'' + esc(p.name) + '\',\'' + esc(p.team) + '\')">'
      +'<div class="tow-pos">'+pos+'</div>'
      +'<div class="tow-name">'+p.name+'</div>'
      +'<div class="tow-team">'+p.team+'</div>'
      +'<div style="display:flex;gap:.35rem;justify-content:center;align-items:center;margin:.2rem 0">'
        +'<span class="grade grade-'+gr.replace('+','p').replace('-','m')+'">'+gr+'</span>'
        +'<span style="font-size:.7rem;font-weight:700;color:'+scoreColor+';background:rgba(0,0,0,.2);padding:.1rem .35rem;border-radius:4px">'+scoreLabel+' '+scoreVal+'</span>'
      +'</div>'
      +'<div class="tow-stats">'+statsLine+'</div>'
      +'<div style="font-size:.65rem;color:var(--muted)">'+p.gp+' mecz'+(p.gp===1?'':'e/ów')+'</div>'
      +'</div>';
  }).join('');
}
function renderSecondFive(roundMatches, minGP) {
  // 2nd five: same composite but exclude players already in first five
  const POSITIONS = ['PG','SG','SF','PF','C'];
  const playerMap = {};
  roundMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players||[]).forEach((p,idx) => {
        const pos = p.pos || POSITIONS[idx] || 'PG';
        const key = p.name + '|' + pos;
        if(!playerMap[key]) playerMap[key] = {name:p.name,team:team.name,pos,posCounts:{},gp:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gradeSum:0};
        const s = playerMap[key];
        s.gp++; s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
        s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
        s.fgm+=p.fgm||0; s.fga+=p.fga||0;
        s.gradeSum+=gradeToNum(p.grade||'B');
        if(p.pos) s.posCounts[p.pos] = (s.posCounts[p.pos]||0)+1;
      });
    });
  });
  // Set primary position = most frequent
  Object.values(playerMap).forEach(pl => {
    if(Object.keys(pl.posCounts||{}).length) pl.pos = Object.entries(pl.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
  });
  const players = Object.values(playerMap)
    .filter(p => p.gp >= minGP)
    .map(p => ({...p, avgGrade: p.gradeSum/p.gp, score: calcCompositeScore(p)}));

  // First pick best per position (1st five)
  const first = {};
  POSITIONS.forEach(pos => {
    const c = players.filter(p => p.pos===pos).sort((a,b)=>b.score-a.score);
    if(c.length) first[pos] = c[0];
  });
  // Second five: next best per position
  const second = {};
  POSITIONS.forEach(pos => {
    const c = players.filter(p => p.pos===pos && p!==first[pos]).sort((a,b)=>b.score-a.score);
    if(c.length) second[pos] = c[0];
  });
  return { best: second, POSITIONS, minGP };
}
function openRoundsDetailModal() {
  const today = new Date().toISOString().slice(0,10);
  const activeRounds = (rounds && rounds.length
    ? rounds
    : [getDefaultRound()]
  ).filter(r => r.from <= today).sort((a,b)=>a.from.localeCompare(b.from));

  if(!activeRounds.length) { showToast('Brak kolejek','info'); return; }

  _rdActiveRound = activeRounds.length - 1; // default: latest round

  // Render tabs
  const tabs = activeRounds.map((r,i) =>
    '<button id="rd-tab-'+i+'" onclick="rdSelectRound('+i+')" style="padding:.4rem 1rem;border:none;border-bottom:2px solid '+(i===_rdActiveRound?'var(--accent)':'transparent')+';background:none;color:'+(i===_rdActiveRound?'var(--accent)':'var(--muted)')+';font-weight:'+(i===_rdActiveRound?'700':'400')+';cursor:pointer;font-family:inherit;font-size:.85rem;transition:all .2s">'+r.label+'</button>'
  ).join('');
  document.getElementById('rounds-detail-tabs').innerHTML = tabs;
  window._rdRounds = activeRounds;
  rdRenderContent(_rdActiveRound);
  document.getElementById('rounds-detail-modal').classList.add('open');
}
function rdSelectRound(idx) {
  _rdActiveRound = idx;
  const tabs = document.querySelectorAll('[id^="rd-tab-"]');
  tabs.forEach((t,i) => {
    t.style.borderBottomColor = i===idx ? 'var(--accent)' : 'transparent';
    t.style.color = i===idx ? 'var(--accent)' : 'var(--muted)';
    t.style.fontWeight = i===idx ? '700' : '400';
  });
  rdRenderContent(idx);
}
function rdRenderContent(idx) {
  const round = window._rdRounds[idx];
  const roundMatches = matches.filter(m => m.date >= round.from && m.date <= round.to);
  const el = document.getElementById('rounds-detail-content');

  if(!roundMatches.length) {
    el.innerHTML = '<div style="color:var(--muted);padding:1rem">'+t('no_matches_round')+'</div>';
    return;
  }

  const totalGames = roundMatches.length;
  const minGP = Math.min(3, Math.max(1, Math.ceil(totalGames / 6)));

  // 1st five (offensive)
  const { best: best1, POSITIONS } = buildRoundFive(roundMatches);
  const grid1 = renderFiveGrid(best1, POSITIONS, minGP, 'off');

  // 2nd five
  const { best: best2 } = renderSecondFive(roundMatches, minGP);
  const grid2 = renderFiveGrid(best2, POSITIONS, minGP, 'off');

  // Defensive five
  const { best: bestD } = buildDefFive(roundMatches);
  const gridD = renderFiveGrid(bestD, POSITIONS, minGP, 'def');

  const section = (icon, title, subtitle, grid) =>
    '<div style="margin-bottom:1.75rem">'
    +'<div style="display:flex;align-items:baseline;gap:.6rem;margin-bottom:.75rem">'
    +'<div style="font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:1.15rem;letter-spacing:1px;text-transform:uppercase">'+icon+' '+title+'</div>'
    +'<div style="font-size:.75rem;color:var(--muted)">'+subtitle+'</div>'
    +'</div>'
    +'<div class="tow-grid">'+grid+'</div>'
    +'</div>';

  el.innerHTML =
    section('🥇',t('first_five_lbl'),'Composite Score — atakująca',grid1)
    + '<hr style="border:none;border-top:1px solid var(--border);margin-bottom:1.75rem">'
    + section('🥈',t('second_five_lbl'),'Composite Score',grid2)
    + '<hr style="border:none;border-top:1px solid var(--border);margin-bottom:1.75rem">'
    + section('🛡️','Defensywna Piątka','STL × 40 + BLK × 25 + GRD × 20 − TO × 5',gridD);
}
// ═══════════════════════════════════════════════════════════════
// DISCORD WEBHOOK — match notifications
// ═══════════════════════════════════════════════════════════════
async function sendMatchWebhook(match) {
  if(!workerUrl && !discordWebhookUrl) return;
  try {
    const w = match.team1.score > match.team2.score ? match.team1.name : match.team2.name;
    const embed = {
      title: '🏀 Nowy mecz zapisany!',
      color: 0xf5c518,
      fields: [
        { name: match.team1.name, value: '**' + match.team1.score + '**', inline: true },
        { name: 'vs', value: '—', inline: true },
        { name: match.team2.name, value: '**' + match.team2.score + '**', inline: true },
        { name: '🏆 Zwycięzca', value: w, inline: true },
        { name: '📅 Data', value: match.date || '—', inline: true },
      ],
      footer: { text: 'NBA 2K Liga' },
      timestamp: new Date().toISOString(),
    };
    if(match.note) embed.fields.push({ name: '📝 Notatka', value: match.note, inline: false });
    const allPlayers = [...(match.team1.players||[]), ...(match.team2.players||[])];
    const topPts = [...allPlayers].sort((a,b)=>(b.pts||0)-(a.pts||0))[0];
    if(topPts) embed.fields.push({ name: '⭐ Najlepszy strzelec', value: topPts.name + ' — ' + topPts.pts + ' PTS', inline: true });
    await _discordNotify({ embeds: [embed] });
  } catch(e) { console.warn('Webhook error:', e); }
}
// ═══ 📣 KANAŁY POWIADOMIEŃ (rodzaj → ID kanału Discord; wysyła bot ligi) ═══
async function openRoutesModal() {
  setTimeout(async () => { try { const r = await _api('/daily-invite', 'POST', {}, { admin: true }); if(r.ok) { const h = document.getElementById('di-hour'), on = document.getElementById('di-on'); if(h) h.value = r.hour ?? 10; if(on) on.checked = !r.off; } } catch(e) {} }, 450);
  setTimeout(() => { try { _evoStatus(); } catch(e) {} }, 500);
  setTimeout(() => { try { onbLoad(); } catch(e) {} }, 400);
  const m = _fxModal('routes-modal', 720), box = m.querySelector('.modal');
  box.innerHTML = _fxHead('routes-modal', '📣 Kanały powiadomień') + '<div style="color:var(--muted)">⏳ Wczytuję…</div>';
  m.classList.add('open');
  const r = await _api('/routes', 'GET', null, { admin: true });
  if(!r.ok) { box.innerHTML = _fxHead('routes-modal', '📣 Kanały powiadomień') + `<div style="color:var(--loss)">❌ ${_h(r.error)}</div>`; return; }
  const groups = { results: '🏀 WYNIKI', streams: '🔴 TRANSMISJE', teams: '🧢 DRUŻYNY', fa: '🆓 WOLNI AGENCI I TRANSFERY', schedule: '📅 TERMINARZ I SEZON', main: '🎪 EVENTY' };
  const rows = Object.entries(r.routes);
  box.innerHTML = _fxHead('routes-modal', '📣 Kanały powiadomień') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem;line-height:1.5">Wpisz <b>ID kanału</b> (Discord: prawy klik na kanał → Kopiuj ID kanału), <b>off</b> żeby wyłączyć, albo zostaw puste — wtedy jak dotąd (webhook). Bot ligi sam zakłada w każdym kanale webhook z nazwą i logo ligi — potrzebuje tam uprawnień <b>Wyświetlanie kanału</b> i <b>Zarządzanie webhookami</b>. Bez tego wiadomość pójdzie jako bot.</div>
    ${Object.entries(groups).map(([g, label]) => `<div style="font-size:.68rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.7rem 0 .3rem">${label}</div>
      ${rows.filter(([, v]) => v.base === g).map(([k, v]) => `<div style="display:grid;grid-template-columns:1fr 210px auto;gap:.4rem;align-items:center;margin-bottom:.3rem">
        <span style="font-size:.8rem">${_h(v.label)}</span>
        <input data-route="${k}" value="${_h(v.value || '')}" placeholder="jak dotąd (webhook)" style="${_MODAL_INP};font-size:.76rem;padding:.25rem .4rem;font-family:monospace">
        <button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem" onclick="routeTest('${k}')">🧪 Test</button></div>`).join('')}`).join('')}
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>😀 Emoji drużyn</b> — bot wgrywa herby zatwierdzonych drużyn i logo ligi jako emoji serwera (np. <code>:boars:</code>) i dodaje je do wiadomości. Wymaga uprawnienia bota <b>Zarządzanie wyrażeniami</b>. Raport przyjdzie Ci w DM.
      <div style="display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap">${Object.keys(window._emojiMap || {}).length ? `<span style="color:var(--muted)">Teraz: ${Object.keys(window._emojiMap).length} emoji</span>` : ''}
        <button class="btn btn-primary" style="font-size:.72rem" onclick="teamEmojis(false)">😀 Dodaj brakujące</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="teamEmojis(true)">🔄 Odśwież wszystkie (po zmianie herbów)</button></div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>🎖 Role drużyn</b> — bot tworzy dla każdej drużyny rolę z jej kolorem i herbem (ikona roli) i nadaje ją graczom ze składu. Po zatwierdzonych wymianach i zmianach składów aktualizuje się sama. Wymaga uprawnienia bota <b>Zarządzanie rolami</b>, a rola bota musi być wyżej na liście ról niż role drużyn. Raport przyjdzie Ci w DM.
      <div style="display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap">${Object.keys(window._teamRoles || {}).length ? `<span style="color:var(--muted)">Teraz: ${Object.keys(window._teamRoles).length} ról</span>` : ''}
        <button class="btn btn-primary" style="font-size:.72rem" onclick="teamRolesSync()">🎖 Synchronizuj role drużyn</button></div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>⚔️ ${_g('Zapowiedzi VERSUS', 'VERSUS previews')}</b> — ${_g('ok. doba przed każdym meczem z datą i godziną bot publikuje grafikę PL + EN: radar umiejętności obu drużyn, kluczowe pojedynki, forma (kanał „Zapowiedź meczu VERSUS”).', 'about a day before every scheduled match the bot posts a PL + EN graphic: both teams\u2019 skill radar, key matchups and form (“VERSUS” channel).')}
      <div style="display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap"><label style="display:flex;align-items:center;gap:.3rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0"><input type="checkbox" id="vs-auto" checked onchange="_api('/versus/settings','POST',{versusAuto:this.checked},{admin:true}).then(r=>showToast(r.ok?(r.versusAuto?'⚔️ ON':'⚔️ OFF'):'❌','success'))" style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('automatycznie', 'automatic')}</label>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/versus/test','POST',{},{admin:true,session:true}).then(r=>showToast(r.ok?('📨 '+r.match):'❌ '+r.error, r.ok?'success':'error'))">🧪 ${_g('Najbliższy mecz → do mnie (DM)', 'Next match → my DMs')}</button></div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>☀️ Codzienne zaproszenie</b> — codziennie o wybranej godzinie bot publikuje „Dziś w lidze” (zagadka i paczka odnawiają się o północy; wpis tylko o nich przypomina): nowa zagadka 2Kordle, paczka kart (i karty limitowane), dzisiejsze mecze do wytypowania, Karnet tygodnia, a w poniedziałki „Walka o playoff” — wszystko z linkami na stronę. Kanał: „Codzienne zaproszenie na stronę” na liście powyżej. Zajawki o rzadkich i limitowanych kartach: „Kolekcja kart: rzadkie i limitowane karty”.
      <div style="display:flex;gap:.4rem;margin-top:.4rem;flex-wrap:wrap"><label style="display:flex;align-items:center;gap:.3rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0"><input type="checkbox" id="di-on" checked onchange="_api('/daily-invite','POST',{off:!this.checked},{admin:true}).then(r=>showToast(r.ok?(r.off?'☀️ OFF':'☀️ ON'):'❌','success'))" style="width:auto;margin:0;accent-color:var(--accent)"> automatycznie</label>
        <label style="display:flex;align-items:center;gap:.3rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0">godzina <select id="di-hour" onchange="_api('/daily-invite','POST',{hour:+this.value},{admin:true}).then(r=>showToast(r.ok?'☀️ '+String(r.hour).padStart(2,'0')+':00':'❌','success'))" style="width:auto;padding:.1rem .3rem;font-size:.74rem;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:5px">${[...Array(24).keys()].map(h => `<option value="${h}">${String(h).padStart(2, '0')}:00</option>`).join('')}</select></label>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/daily-invite','POST',{send:true},{admin:true}).then(r=>showToast(r.ok?'☀️ Wysłano':'❌ '+(r.error||''), r.ok?'success':'error'))">☀️ Wyślij teraz</button></div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>🎉 ${_g('Awanse kart', 'Card upgrades')}</b> — ${_g('codziennie ok. 9:00 bot sprawdza, czyja karta awansowała (np. srebro → złoto) albo kto zdobył nową odznakę, i ogłasza to z kartą + DM do gracza. Kanał: pozycja „Awanse kart graczy” na liście powyżej (domyślnie kanał osiągnięć). Śledzone są karty graczy z min. 3 meczami w sezonie; pierwsze sprawdzenie tylko zapisuje stan kart.', 'every morning (~9:00) the bot checks whose card got upgraded (e.g. silver → gold) or who earned a new badge, and announces it with the card + DM to the player. Channel: the “Card upgrades” entry in the list above (the achievements channel by default). Cards of players with 3+ games this season are tracked; the first check only saves the current state.')}
      <div style="margin-top:.4rem;display:flex;gap:.6rem;align-items:center;flex-wrap:wrap"><button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/card-evo/run','POST',{},{admin:true}).then(r=>{showToast(r.ok?_g('🎉 Sprawdzam awanse…','🎉 Checking upgrades…'):'❌ '+r.error, r.ok?'success':'error'); setTimeout(_evoStatus, 8000);})">🎉 ${_g('Sprawdź awanse teraz', 'Check upgrades now')}</button><span id="evo-status" style="font-size:.72rem;color:var(--muted)"></span></div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;font-size:.78rem">
      <b>👋 Powitanie nowych osób</b> — bot pyta nową osobę o <b>język</b> (🇵🇱/🇬🇧) i <b>ligę</b>: <b>Polska Ekstraklasa</b> → zgłoszenie na kanale adminów (rangę nadajecie ręcznie), <b>Chemik League</b> → ranga automatycznie. Potem „Chcę grać / Chcę kibicować”.
      <div id="onb-cfg" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.4rem;margin-top:.45rem"></div>
      <button class="btn btn-ghost" style="font-size:.72rem;margin-top:.35rem" onclick="onbSave()">💾 Zapisz ustawienia powitania</button>
      <div style="margin-top:.4rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/onboard/test','POST',{},{admin:true,session:true}).then(r=>showToast(r.ok?'📨 Powitanie wysłane Ci w DM':'❌ '+r.error, r.ok?'success':'error'))">📨 Wyślij mi powitanie (test)</button></div>
    </div>
    <div id="routes-status" style="font-size:.8rem;min-height:1.1em;margin:.6rem 0"></div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-primary" onclick="routesSave()">💾 Zapisz</button></div>`;
}
async function _evoStatus() {
  const el = document.getElementById('evo-status'); if(!el) return;
  const r = await _api('/card-evo/status', 'POST', {}, { admin: true });
  if(!r.ok) { el.textContent = ''; return; }
  el.textContent = r.at ? `${_g('Ostatnie sprawdzenie', 'Last check')}: ${new Date(r.at).toLocaleString(currentLang === 'en' ? 'en-GB' : 'pl-PL')} · ${_g('śledzonych kart', 'tracked cards')}: ${r.players}` : _g('Jeszcze nie sprawdzano — pierwsze sprawdzenie zapisze stan kart (bez ogłoszeń)', 'Not checked yet — the first check saves the card state (no announcements)');
  if(!r.channel) el.textContent += ' · ⚠️ ' + _g('brak kanału', 'no channel set');
}
async function onbLoad() {
  const el = document.getElementById('onb-cfg'); if(!el) return;
  const r = await _api('/onboard/settings', 'POST', {}, { admin: true }), o = r.onboard || { roles: {} };
  const f = (id, lbl, v) => `<div><label style="${_MODAL_LBL}">${lbl}</label><input id="${id}" value="${_h(v || '')}" placeholder="ID" style="${_MODAL_INP};font-size:.76rem"></div>`;
  el.innerHTML = f('onb-ch', 'Kanał adminów (ID)', o.adminChannel) + f('onb-pl', 'Ranga 🇵🇱 Polski (ID)', o.roles?.pl) + f('onb-en', 'Ranga 🇬🇧 English (ID)', o.roles?.en) + f('onb-ch2', 'Ranga Chemik League (ID)', o.roles?.chemik);
}
async function onbSave() {
  const v = id => document.getElementById(id)?.value.trim();
  const r = await _api('/onboard/settings', 'POST', { save: true, adminChannel: v('onb-ch'), rolePl: v('onb-pl'), roleEn: v('onb-en'), roleChemik: v('onb-ch2') }, { admin: true });
  showToast(r.ok ? '💾 Zapisano ustawienia powitania' : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
async function teamRolesSync() {
  const st = document.getElementById('routes-status');
  const r = await _api('/team-roles', 'POST', {}, { admin: true, session: !!discordUser?.session });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? '✅ Bot synchronizuje role — za chwilę raport w DM (jeśli jesteś zalogowany przez Discord).' : '❌ ' + (r.error || 'Błąd');
}
async function teamEmojis(force) {
  const st = document.getElementById('routes-status');
  if(force && !confirm('Podmienić emoji drużyn na aktualne herby? (Emoji dodane przez bota zostaną wgrane od nowa.)')) return;
  const r = await _api('/team-emojis', 'POST', { force }, { admin: true, session: !!discordUser?.session });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? '✅ Bot wgrywa emoji — za chwilę raport w DM (jeśli jesteś zalogowany przez Discord).' : '❌ ' + (r.error || 'Błąd');
}
async function routesSave() {
  const routes = {}; document.querySelectorAll('#routes-modal [data-route]').forEach(i => { routes[i.dataset.route] = i.value.trim(); });
  const bad = Object.entries(routes).filter(([, v]) => v && v !== 'off' && !/^\d{15,21}$/.test(v));
  const st = document.getElementById('routes-status');
  if(bad.length) { st.style.color = 'var(--loss)'; st.textContent = '❌ Niepoprawne ID: ' + bad.map(x => x[1]).join(', '); return; }
  const r = await _api('/routes', 'POST', { routes }, { admin: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)'; st.textContent = r.ok ? '✅ Zapisano' : '❌ ' + r.error;
}
async function routeTest(k) {
  const st = document.getElementById('routes-status'); st.style.color = 'var(--muted)'; st.textContent = '⏳ Wysyłam test… (najpierw zapisz zmiany)';
  const r = await _api('/routes', 'POST', { test: k }, { admin: true });
  st.style.color = r.ok ? (r.via === 'bot' ? '#f59e0b' : 'var(--win)') : 'var(--loss)';
  st.textContent = r.ok ? (r.via === 'bot' ? '⚠️ ' : '✅ ') + (r.note || 'Test wysłany — sprawdź kanał na Discordzie') : '❌ ' + (r.error || 'Błąd');
}
async function sendEventWebhook(title, description, color) {
  if(!workerUrl && !discordWebhookUrl) return;
  try {
    await _discordNotify({ route: 'eventDone', embeds: [{ title, description, color: color||0xf5c518, footer: { text: 'NBA 2K Liga' }, timestamp: new Date().toISOString() }] });
  } catch(e) { console.warn('Webhook error:', e); }
}
// Jednolity punkt wysyłki do Discorda.
// Jeśli skonfigurowany Worker — proxy przez /discord-notify (sekret po stronie Workera).
// Fallback: bezpośredni fetch na discordWebhookUrl jeśli wklejony ręcznie.
async function _discordNotify(payload) {
  if (workerUrl) {
    try {
      const adminToken = _adminToken();
      const r = await fetch(workerUrl.replace(/\/$/, '') + '/discord-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
        body: JSON.stringify(payload)
      });
      if (r.ok || r.status === 204) return true;
      // Worker returned error — log status for debugging
      console.warn('Worker /discord-notify returned', r.status, await r.text().catch(()=>''));
    } catch(e) { console.warn('Worker discord-notify error:', e); }
  }
  if (!discordWebhookUrl) return false;
  try {
    const r2 = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r2.ok || r2.status === 204;
  } catch(e) { console.warn('Direct webhook error:', e); return false; }
}
