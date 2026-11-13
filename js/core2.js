/*@v:af4a9d7b1a*/


function openPlayoffModal(){return __lz(12,'openPlayoffModal',this,arguments)}

function getPlayoffForSeason(){return __lz(12,'getPlayoffForSeason',this,arguments)}

function getCurrentSeasonStandings(){return __lz(12,'getCurrentSeasonStandings',this,arguments)}

function renderPlayoffModal(){return __lz(12,'renderPlayoffModal',this,arguments)}

function updatePlayoffTeamList(){return __lz(12,'updatePlayoffTeamList',this,arguments)}

function startPlayoff(){return __lz(12,'startPlayoff',this,arguments)}

function getRoundName(){return __lz(12,'getRoundName',this,arguments)}


function renderPlayoffManager(){return __lz(12,'renderPlayoffManager',this,arguments)}

function poAddWin(){return __lz(12,'poAddWin',this,arguments)}

function poSubWin(){return __lz(12,'poSubWin',this,arguments)}

function poAdvanceRound(){return __lz(12,'poAdvanceRound',this,arguments)}

function poSetChampion(){return __lz(12,'poSetChampion',this,arguments)}

// Zawodnicy wykluczeni z zapowiedzi (np. nie grają już w teamie)
const PREVIEW_EXCLUDED_PLAYERS = {
  'Katowice PL': ['CICHY_x'],
};

function isExcludedFromPreview(){return __lz(12,'isExcludedFromPreview',this,arguments)}

function getPlayerStatsForPreview(){return __lz(12,'getPlayerStatsForPreview',this,arguments)}

function getH2HPlayerStatsForPreview(){return __lz(12,'getH2HPlayerStatsForPreview',this,arguments)}


function getTeamStatsForPreview(){return __lz(12,'getTeamStatsForPreview',this,arguments)}

function getH2HForPreview(){return __lz(12,'getH2HForPreview',this,arguments)}

function generatePairPreview(){return __lz(12,'generatePairPreview',this,arguments)}

function generatePlayoffPreviews(){return __lz(12,'generatePlayoffPreviews',this,arguments)}


function deletePlayoff(){return __lz(12,'deletePlayoff',this,arguments)}

function renderPlayoffDashboard() {
  const wrap = document.getElementById('playoff-dashboard-wrap');
  if (!wrap) return;

  // Playoff bieżącego sezonu; poprzednie są w Historii mistrzów
  _migratePlayoffSeasons();
  const po = currentSeasonId && seasons.some(x => x.id === currentSeasonId)
    ? [...playoffs].reverse().find(p => p.seasonId === currentSeasonId) || null
    : (playoffs.length ? playoffs[playoffs.length - 1] : null);
  if (!po) {
    const last = [...playoffs].reverse().find(p => p.champion);
    if (!last) { wrap.innerHTML = ''; return; }
    const sn = seasons.find(x => x.id === last.seasonId)?.name || '';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;background:linear-gradient(135deg,rgba(139,105,20,.35),rgba(201,150,42,.2));border:1px solid rgba(245,197,24,.35);border-radius:12px;padding:.8rem 1.1rem;margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;gap:.7rem">
          <span style="font-size:1.6rem">🏆</span>
          <div>
            <div style="font-size:.66rem;font-weight:800;letter-spacing:2px;color:var(--muted);text-transform:uppercase">Obrońca tytułu${sn ? ' · ' + _h(sn) : ''}</div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.35rem;color:var(--accent);line-height:1.1">${_h(last.champion)}</div>
          </div>
        </div>
        <button onclick="openChampionsHistory()" class="btn btn-ghost" style="font-size:.78rem;padding:.35rem .8rem">📜 Historia mistrzów</button>
      </div>`;
    return;
  }

  // Auto-sync bracket from actual match results
  if (po.startDate) {
    const wn2 = getWinsNeeded(po.format);
    po.rounds.forEach(round => {
      round.pairs.forEach(pair => {
        const series = getSeriesResults(po, pair.team1, pair.team2);
        pair.w1 = series.w1;
        pair.w2 = series.w2;
      });
    });
  }

  const wn = getWinsNeeded(po.format);
  const formatLabel = { bo1:'Bo1', bo3:'Bo3', bo5:'Bo5', bo7:'Bo7' }[po.format] || po.format;

  let html = `
    <div style="margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;flex-wrap:wrap;gap:.5rem">
        <div class="section-title" style="margin-bottom:0">🏆 Playoff ${formatLabel}</div>
        <button onclick="openChampionsHistory()" class="btn btn-ghost" style="font-size:.75rem;padding:.3rem .8rem">📜 Historia</button>
        <button onclick="openPlayoffStats()" style="background:var(--surface2);border:1px solid var(--accent);color:var(--accent);border-radius:6px;padding:.3rem .9rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;letter-spacing:.5px">📊 Statystyki</button>
        ${po.champion ? `<div style="background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border-radius:6px;padding:.3rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.95rem">🥇 MISTRZ: ${po.champion}</div>` : ''}
      </div>
      ${po.champion ? (() => {
        // Calculate MVP: best PER player from champion team in playoff matches
        const poStart = po.startDate || '';
        const poMatches = matches.filter(m => m.date >= poStart && (m.team1.name === po.champion || m.team2.name === po.champion));
        const pStats = {};
        poMatches.forEach(m => {
          const side = m.team1.name === po.champion ? m.team1 : m.team2;
          (side.players||[]).forEach(p => {
            if(!pStats[p.name]) pStats[p.name] = {pts:0,reb:0,ast:0,stl:0,blk:0,tov:0,gp:0};
            pStats[p.name].pts += p.pts||0;
            pStats[p.name].reb += p.reb||0;
            pStats[p.name].ast += p.ast||0;
            pStats[p.name].stl += p.stl||0;
            pStats[p.name].blk += p.blk||0;
            pStats[p.name].tov += p.tov||0;
            pStats[p.name].gp++;
          });
        });
        const _per = s => { const g=s.gp||1; return (s.pts/g)+(s.reb/g)*1.2+(s.ast/g)*1.5+(s.stl/g)*2+(s.blk/g)*2-(s.tov/g)*1.5; };
        const mvp = Object.entries(pStats).sort((a,b) => _per(b[1])-_per(a[1]))[0];
        const mvpHtml = mvp ? `<div style="margin-top:.5rem;font-size:.9rem;opacity:.85">⭐ MVP Playoff: <b>${mvp[0]}</b> — ${(mvp[1].pts/mvp[1].gp).toFixed(1)} PTS / ${(mvp[1].reb/mvp[1].gp).toFixed(1)} REB / ${(mvp[1].ast/mvp[1].gp).toFixed(1)} AST · PER ${_per(mvp[1]).toFixed(1)}</div>` : '';
        return `<div style="background:linear-gradient(135deg,#8b6914,#c9962a,#8b6914);border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.25rem;text-align:center;box-shadow:0 4px 24px rgba(197,150,30,0.35)">
          <div style="font-size:2.5rem;margin-bottom:.25rem">🏆</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;letter-spacing:3px;text-transform:uppercase;color:rgba(0,0,0,0.6);margin-bottom:.2rem">MISTRZ SEZONU</div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;letter-spacing:2px;color:#000;line-height:1.1">${po.champion}</div>
          ${mvpHtml ? `<div style="color:rgba(0,0,0,0.7);margin-top:.5rem;font-size:.9rem">⭐ MVP Playoff: <b>${mvp[0]}</b> — ${(mvp[1].pts/mvp[1].gp).toFixed(1)} PTS / ${(mvp[1].reb/mvp[1].gp).toFixed(1)} REB / ${(mvp[1].ast/mvp[1].gp).toFixed(1)} AST na mecz</div>` : ''}
          <div style="color:rgba(0,0,0,0.5);font-size:.8rem;margin-top:.5rem">🎉 Gratulacje dla całej drużyny!</div>
        </div>`;
      })() : ''}
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem;overflow-x:auto">`;

  // Render bracket rounds side by side
  html += `<div style="display:flex;gap:1.5rem;min-width:max-content">`;

  po.rounds.forEach(round => {
    html += `<div style="display:flex;flex-direction:column;gap:.75rem;min-width:220px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);text-align:center;margin-bottom:.25rem">${round.name}</div>`;

    round.pairs.forEach(pair => {
      const done = pair.w1 >= wn || pair.w2 >= wn;
      const winner = pair.w1 >= wn ? pair.team1 : pair.w2 >= wn ? pair.team2 : null;
      const series = po.startDate ? getSeriesResults(po, pair.team1, pair.team2) : {games:[]};
      const gameScoresDash = series.games.map((g,gi) => {
        return `<span style="font-size:.63rem;padding:.1rem .3rem;border-radius:3px;background:${g.win1?'rgba(46,213,115,.15)':'rgba(255,71,87,.12)'};color:${g.win1?'var(--win)':'var(--loss)'}" onclick="openMatch(${g.matchId})" style="cursor:pointer" title="Kliknij aby zobaczyć mecz">G${gi+1}: ${g.s1}–${g.s2}</span>`;
      }).join(' ');
      html += `<div style="background:var(--bg);border:1px solid ${done?'rgba(245,197,24,.35)':'var(--border)'};border-radius:6px;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .65rem;border-bottom:1px solid var(--border);background:${winner===pair.team1?'rgba(245,197,24,.08)':'transparent'}">
          <span style="font-size:.82rem;font-weight:${winner===pair.team1?'900':'600'};color:${winner===pair.team1?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px">${pair.team1}</span>
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;color:${pair.w1>pair.w2?'var(--win)':pair.w2>pair.w1?'var(--loss)':'var(--text)'};min-width:1.2rem;text-align:center">${pair.w1}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .65rem;background:${winner===pair.team2?'rgba(245,197,24,.08)':'transparent'}">
          <span style="font-size:.82rem;font-weight:${winner===pair.team2?'900':'600'};color:${winner===pair.team2?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px">${pair.team2}</span>
          <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;color:${pair.w2>pair.w1?'var(--win)':pair.w1>pair.w2?'var(--loss)':'var(--text)'};min-width:1.2rem;text-align:center">${pair.w2}</span>
        </div>
        ${gameScoresDash ? `<div style="padding:.3rem .5rem;display:flex;gap:.2rem;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,.06)">${gameScoresDash}</div>` : ''}
      </div>`;
    });

    html += '</div>';
  });

  html += '</div></div>';

  html += '</div>';
  wrap.innerHTML = html;
}



function openPlayoffStats(){return __lz(12,'openPlayoffStats',this,arguments)}

function renderPlayoffStatsContent(){return __lz(12,'renderPlayoffStatsContent',this,arguments)}

function closePlayoffModal(){return __lz(12,'closePlayoffModal',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// PANEL POWIĄZAŃ DISCORD→PSN
// ═══════════════════════════════════════════════════════════════

function _dsLeagueRanking(method) {
  const m = method || ovrMethod;
  // Key by (name, pos) — each player×position is a separate entry; no-pos uses plain name key
  const statsMap = {};
  matches.forEach(match => {
    [...(match.team1.players||[]),...(match.team2.players||[])].forEach(pl => {
      if (!pl.name) return;
      const pos = pl.pos || null;
      const key = pos ? `${pl.name}\x00${pos}` : pl.name;
      if (!statsMap[key]) statsMap[key] = {name:pl.name,pos:pos||'—',pts:0,reb:0,ast:0,stl:0,blk:0,to:0,gs:0,gc:0,gp:0,fgm:0,fga:0,ftm:0,fta:0};
      const s = statsMap[key];
      s.pts+=pl.pts||0; s.reb+=pl.reb||0; s.ast+=pl.ast||0;
      s.stl+=pl.stl||0; s.blk+=pl.blk||0; s.to+=pl.to||0;
      s.fgm+=pl.fgm||0; s.fga+=pl.fga||0; s.ftm+=pl.ftm||0; s.fta+=pl.fta||0;
      s.gs+=gradeToNum(pl.grade||'B'); s.gc++; s.gp++;
    });
  });
  // Merge no-position entries ("-") into existing positional entries for the same player.
  // If a player has both "Name\x00PG" and "Name" (no-pos), fold the no-pos games into PG.
  // If a player has ONLY no-pos entries, keep them as-is (shows as "—").
  Object.keys(statsMap).forEach(key => {
    if (key.includes('\x00')) return; // already a positional key
    const noPos = statsMap[key];
    const posKeys = Object.keys(statsMap).filter(k => k.startsWith(noPos.name + '\x00'));
    if (!posKeys.length) return; // no positional entry — keep as-is
    // merge into the positional entry with most games
    const mainKey = posKeys.sort((a,b) => statsMap[b].gp - statsMap[a].gp)[0];
    const main = statsMap[mainKey];
    main.pts+=noPos.pts; main.reb+=noPos.reb; main.ast+=noPos.ast;
    main.stl+=noPos.stl; main.blk+=noPos.blk; main.to+=noPos.to;
    main.fgm+=noPos.fgm; main.fga+=noPos.fga; main.ftm+=noPos.ftm; main.fta+=noPos.fta;
    main.gs+=noPos.gs; main.gc+=noPos.gc; main.gp+=noPos.gp;
    delete statsMap[key];
  });
  const players = Object.values(statsMap).map(s => {
    const gp=s.gp, pos=s.pos, name=s.name;
    const ppg=+(s.pts/gp).toFixed(1),rpg=+(s.reb/gp).toFixed(1),apg=+(s.ast/gp).toFixed(1);
    const spg=+(s.stl/gp).toFixed(1),bpg=+(s.blk/gp).toFixed(1),tpg=+(s.to/gp).toFixed(1);
    const totObj = {gp, pts:s.pts, reb:s.reb, ast:s.ast, stl:s.stl, blk:s.blk, to:s.to,
                    fgm:s.fgm, fga:s.fga, ftm:s.ftm, fta:s.fta, gradeSum:s.gs};
    let per, cs;
    per = +calcPER(totObj).toFixed(1);
    if (m==='positional') {
      const w=_dsPosW[pos]||_dsPosW.SF;
      cs=+((Math.min(ppg/50,1)*100)*w.cs[0]+(Math.min(spg/3,1)*100)*w.cs[1]+
           (Math.min(bpg/3,1)*100)*w.cs[2]+(Math.min(rpg/20,1)*100)*w.cs[3]+
           (Math.min(apg/15,1)*100)*w.cs[4]+(s.gs/gp)*w.cs[5]).toFixed(1);
    } else if (m==='classic') {
      cs = +calcCompositeScore(totObj).toFixed(1);
    } else {
      const mat = gp / (gp + 5);
      cs = +(((Math.min(ppg/50,1)*100)*0.25+(Math.min(spg/4,1)*100)*0.20+
               (Math.min(bpg/3,1)*100)*0.18+(Math.min(rpg/20,1)*100)*0.15+
               (Math.min(apg/15,1)*100)*0.12) * mat).toFixed(1);
    }
    return {name,pos,gp,ppg,rpg,apg,spg,bpg,tpg,per,cs};
  });

  if (m === 'top98') {
    const byPos = {};
    players.forEach(p => { if (!byPos[p.pos]) byPos[p.pos]=[]; byPos[p.pos].push(p); });
    // Apply Bayesian shrinkage: fewer games → lower effective score so small samples don't dominate
    const comp = p => (p.per * 0.6 + p.cs * 0.4) * (0.5 + 0.5 * p.gp / (p.gp + 5));
    return players.map(p => {
      const grp = byPos[p.pos] || [p];
      const maxC = Math.max(...grp.map(comp), 0.01);
      const calcOvr = Math.max(40, Math.min(98, Math.round(40 + comp(p) / maxC * 58)));
      const ovr = ovrOverrides[p.name] ?? calcOvr;
      return {...p, ovr, ovrOverridden: ovrOverrides[p.name] !== undefined};
    }).sort((a,b) => b.ovr - a.ovr);
  }

  const pct=(sorted,val)=>sorted.length<=1?50:sorted.filter(v=>v<val).length/(sorted.length-1)*100;
  const sP=players.map(p=>p.per).sort((a,b)=>a-b);
  const sC=players.map(p=>p.cs).sort((a,b)=>a-b);
  const sG=players.map(p=>p.ppg).sort((a,b)=>a-b);
  return players.map(p=>{
    const gpBonus=Math.min(p.gp*2,10);
    const raw=pct(sP,p.per)*0.45+pct(sC,p.cs)*0.35+pct(sG,p.ppg)*0.15+gpBonus*0.05;
    const calcOvr=Math.max(40,Math.min(99,Math.round(raw*0.59+40)));
    const ovr = ovrOverrides[p.name] ?? calcOvr;
    return {...p, ovr, ovrOverridden: ovrOverrides[p.name] !== undefined};
  }).sort((a,b)=>b.ovr-a.ovr);
}

function openPsnMapModal(){return __lz(12,'openPsnMapModal',this,arguments)}

function renderPsnMapModal(){return __lz(12,'renderPsnMapModal',this,arguments)}

function _psnMapSet(){return __lz(12,'_psnMapSet',this,arguments)}

function _psnMethodChange(){return __lz(12,'_psnMethodChange',this,arguments)}

function _psnAutoAll(){return __lz(12,'_psnAutoAll',this,arguments)}

function _psnOvrSet(){return __lz(12,'_psnOvrSet',this,arguments)}

function _psnOvrClear(){return __lz(12,'_psnOvrClear',this,arguments)}

function _psnSave(){return __lz(12,'_psnSave',this,arguments)}

// ═══════════════════════════════════════════════════════════════
// DRAFT SETUP WIZARD — stan i narzędzia
// ═══════════════════════════════════════════════════════════════

// Toggle "Overall" w liście zapisanych graczy eventu
const _evOvr = {};
function _evToggleOvr(){return __lz(12,'_evToggleOvr',this,arguments)}

const _ds = {
  eventId: null,
  step: 1,
  numTeams: 4,
  perTeam: 5,
  timerSecs: 120,
  format: 'snake',
  teams: [],       // [{name, captainId}]
  playerPool: [],  // enriched with ovr, isCaptain, excluded
  order: [],       // indices into teams[] for draft order
  nameMap: {},     // { playerId: ingamePsnName } — ręczne powiązania Discord→PSN
  _pollId: null,
  captainFilter: { type: 'all', pos: '', ovrMin: '', ovrMax: '' }
};

function _dsSetName(){return __lz(12,'_dsSetName',this,arguments)}

function openDraftSetup(){return __lz(12,'openDraftSetup',this,arguments)}

function _dsClose(){return __lz(12,'_dsClose',this,arguments)}

function _dsGradeScore(){return __lz(12,'_dsGradeScore',this,arguments)}

function _dsOvrColor(ovr) {
  if (ovr >= 90) return '#f5c518';
  if (ovr >= 80) return '#2ecc71';
  if (ovr >= 70) return '#3498db';
  if (ovr >= 60) return '#e67e22';
  return '#95a5a6';
}

// Wagi PER i CS zależne od pozycji — bigmani nagradzani za REB/BLK, rozgrywający za AST/PTS
const _dsPosW = {
  PG: {per:[1.0,0.8,2.0,1.8,1.2], cs:[0.30,0.20,0.10,0.10,0.20,0.10]},
  SG: {per:[1.0,1.0,1.6,2.0,1.6], cs:[0.28,0.22,0.12,0.10,0.18,0.10]},
  SF: {per:[0.9,1.4,1.2,2.0,2.2], cs:[0.22,0.22,0.18,0.18,0.10,0.10]},
  PF: {per:[0.8,1.6,0.9,1.8,2.5], cs:[0.17,0.18,0.25,0.22,0.08,0.10]},
  C:  {per:[0.7,1.8,0.7,1.5,3.0], cs:[0.13,0.14,0.30,0.28,0.05,0.10]},
};
// per: [ppg,rpg,apg,spg,bpg]  cs: [pts,stl,blk,reb,ast,grade]

// ── fuzzy matching Discord → PSN ──────────────────────────────

function _dsFuzzyScore(a, b) {
  const cl = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const ca = cl(a), cb = cl(b);
  if (!ca || !cb) return 0;
  if (ca === cb) return 1.0;
  if (cb.startsWith(ca) || ca.startsWith(cb)) return 0.9;
  if (cb.includes(ca) || ca.includes(cb)) return 0.8;
  const bg = s => { const r=new Set(); for(let i=0;i<s.length-1;i++) r.add(s.slice(i,i+2)); return r; };
  const ba=bg(ca), bb=bg(cb);
  if (!ba.size||!bb.size) return 0;
  return (2*[...ba].filter(g=>bb.has(g)).length)/(ba.size+bb.size);
}

// Zwraca {name, method} dla gracza lub null.
// Kolejność: trwała mapa → ręczna mapa sesji → alias → dokładne → fuzzy
function _dsFindIngameName(player, ingameNames, nameMap={}) {
  // 1. Trwałe mapowanie (panel admina)
  const permaKey = player.discordTag || player.name;
  if (discordPsnMap[permaKey]) return {name:discordPsnMap[permaKey], method:'manual'};
  if (discordPsnMap[player.name]) return {name:discordPsnMap[player.name], method:'manual'};
  // 2. Mapa z sesji wizarda
  if (nameMap[player.id]) return {name:nameMap[player.id], method:'manual'};
  const candidates = [player.name, player.discordTag].filter(Boolean);
  for (const c of candidates) {
    const al = applyAlias(c);
    if (al !== c && ingameNames.includes(al)) return {name:al, method:'alias'};
    const ex = ingameNames.find(n=>n.toLowerCase()===c.toLowerCase());
    if (ex) return {name:ex, method:'exact'};
  }
  let best=null, bestS=0;
  for (const c of candidates) {
    for (const n of ingameNames) {
      const s=_dsFuzzyScore(c,n);
      if (s>bestS) { bestS=s; best=n; }
    }
  }
  if (bestS>=0.55) return {name:best, method:'fuzzy', score:bestS};
  return null;
}

// Zwraca wszystkie unikalne nazwy graczy z historii meczów
function _dsIngameNames() {
  return [...new Set(matches.flatMap(m=>
    [...(m.team1.players||[]),...(m.team2.players||[])].map(p=>p.name)
  ))].sort();
}

const _chainedOvrCache={};
function _computeChainedOvrMap(stopBeforeEvId=null) {
  const cacheKey='v3|'+matches.length+'|'+events.map(e=>`${e.id}:${(e.matches||[]).length}`).join(',')+'|'+(stopBeforeEvId||'');
  if(_chainedOvrCache[cacheKey]) return _chainedOvrCache[cacheKey];
  const eventsInOrder=events.filter(e=>(e.matches||[]).length>0).sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
  const ranking=_dsLeagueRanking();
  const histPosCount={};
  matches.forEach(m=>{[m.team1,m.team2].forEach(team=>{(team?.players||[]).forEach(p=>{
    if(!p.name||!p.pos) return;
    if(!histPosCount[p.name]) histPosCount[p.name]={};
    histPosCount[p.name][p.pos]=(histPosCount[p.name][p.pos]||0)+1;
  });});});
  const getHistPos=name=>{const pm=histPosCount[name];return pm?Object.entries(pm).sort((a,b)=>b[1]-a[1])[0][0]:null;};
  const allRankByName={};
  ranking.forEach(p=>{if(!allRankByName[p.name])allRankByName[p.name]=[];allRankByName[p.name].push(p);});
  const initialOvrByName={},initialStatsByName={};
  Object.entries(allRankByName).forEach(([name,entries])=>{
    const domPos=getHistPos(name);
    const best=(domPos&&entries.find(e=>e.pos===domPos))||entries[0];
    initialOvrByName[name]=best.ovr;
    initialStatsByName[name]={ppg:best.ppg,rpg:best.rpg,apg:best.apg,spg:best.spg,bpg:best.bpg};
  });
  const currentOvr={};
  const perf=(ppg,rpg,apg,spg,bpg)=>ppg*0.40+spg*0.20+bpg*0.18+rpg*0.15+apg*0.12;
  for(const ev of eventsInOrder){
    if(stopBeforeEvId&&ev.id===stopBeforeEvId) break;
    const statsMap={};
    (ev.matches||[]).forEach(m=>{
      const t1won=(m.team1?.score??0)>(m.team2?.score??0);
      [m.team1,m.team2].forEach((team,ti)=>{
        const won=ti===0?t1won:!t1won;
        (team?.players||[]).forEach(p=>{
          if(!p.name) return;
          if(!statsMap[p.name]) statsMap[p.name]={name:p.name,gp:0,wins:0,pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,gs:0,positions:[]};
          const s=statsMap[p.name];
          s.gp++; if(won) s.wins++;
          if(p.pos) s.positions.push(p.pos);
          s.pts+=p.pts||0; s.reb+=p.reb||0; s.ast+=p.ast||0;
          s.stl+=p.stl||0; s.blk+=p.blk||0; s.to+=p.to||0;
          s.fgm+=p.fgm||0; s.fga+=p.fga||0; s.gs+=gradeToNum(p.grade||'B');
        });
      });
    });
    const evAvgGradeNum=(()=>{const nums=Object.values(statsMap).map(s=>s.gs/s.gp).filter(n=>n>0);return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:9;})();
    const getEvPos=s=>{if(!s.positions.length)return null;const pm={};s.positions.forEach(p=>{pm[p]=(pm[p]||0)+1;});return Object.entries(pm).sort((a,b)=>b[1]-a[1])[0][0];};
    Object.values(statsMap).forEach(s=>{
      const gp=s.gp;
      const ppg=+(s.pts/gp).toFixed(1),rpg=+(s.reb/gp).toFixed(1),apg=+(s.ast/gp).toFixed(1);
      const spg=+(s.stl/gp).toFixed(1),bpg=+(s.blk/gp).toFixed(1);
      const evPos=getEvPos(s),histPos=getHistPos(s.name);
      const evPerf=perf(ppg,rpg,apg,spg,bpg);
      const wins=s.wins,winBonus=gp>0?(wins/gp-0.5)*10:0;
      const preOvr=currentOvr[s.name]??initialOvrByName[s.name]??40;
      const baseStats=initialStatsByName[s.name];
      const hasHistory=currentOvr[s.name]!==undefined||initialOvrByName[s.name]!==undefined;
      let delta;
      if(!hasHistory){delta=8;}
      else if(baseStats&&baseStats.ppg+baseStats.rpg+baseStats.apg+baseStats.spg+baseStats.bpg>0){
        const bp=perf(baseStats.ppg,baseStats.rpg,baseStats.apg,baseStats.spg,baseStats.bpg);
        delta=bp>0?Math.round(Math.max(-8,Math.min(8,(evPerf-bp)/bp*11+winBonus))):Math.round(Math.max(-8,Math.min(8,winBonus)));
      }else{delta=Math.round(Math.max(-8,Math.min(8,winBonus)));}
      let finalDelta = delta ?? 0;
      if(s.name === 'chemik81pl') {
        finalDelta = finalDelta < 0 ? Math.round(finalDelta/2) : Math.min(8, Math.round(finalDelta*2));
      }
      currentOvr[s.name] = Math.max(40, Math.min(99, preOvr + finalDelta));
    });
  }
  _chainedOvrCache[cacheKey]=currentOvr;
  return currentOvr;
}

function _dsComputeOvr(playerList, nameMap={}, useMethod=null) {
  const ingameNames = _dsIngameNames();
  const method = useMethod || ovrMethod;
  const enriched = playerList.map(p => {
    const resolved = _dsFindIngameName(p, ingameNames, nameMap);
    const iname = resolved?.name;
    // Pozycja: z meczów pod PSN-nickiem
    const posCounts = {};
    if (iname) {
      matches.forEach(m => {
        [...(m.team1.players||[]),...(m.team2.players||[])].forEach(pl => {
          if (pl.name === iname && pl.pos) posCounts[pl.pos]=(posCounts[pl.pos]||0)+1;
        });
      });
    }
    const pos = Object.keys(posCounts).length
      ? Object.keys(posCounts).sort((a,b)=>posCounts[b]-posCounts[a])[0]
      : (p.primaryPos||'SF');
    const posFromHistory = Object.keys(posCounts).length > 0;
    const pm = iname ? matches.filter(m=>
      [...(m.team1.players||[]),...(m.team2.players||[])].some(pl=>
        pl.name===iname && (posFromHistory ? pl.pos===pos : true)
      )
    ) : [];
    const gp = pm.length;
    if (!gp) return {...p, pos, ppg:0,rpg:0,apg:0,spg:0,bpg:0,tpg:0,gp:0,per:0,cs:0,ovr:40,
      fgpct:null,tppct:null, ingameName:iname||null, matchMethod:resolved?.method||'none'};
    const tot = pm.reduce((acc,m)=>{
      const pl=[...(m.team1.players||[]),...(m.team2.players||[])].find(x=>
        x.name===iname && (posFromHistory ? x.pos===pos : true)
      );
      if(pl){acc.pts+=pl.pts||0;acc.reb+=pl.reb||0;acc.ast+=pl.ast||0;
              acc.stl+=pl.stl||0;acc.blk+=pl.blk||0;acc.to+=pl.to||0;
              acc.fgm+=pl.fgm||0;acc.fga+=pl.fga||0;acc.tpm+=pl.tpm||0;acc.tpa+=pl.tpa||0;
              acc.ftm+=pl.ftm||0;acc.fta+=pl.fta||0;
              acc.gs+=gradeToNum(pl.grade||'B');acc.gc++;}
      return acc;
    },{pts:0,reb:0,ast:0,stl:0,blk:0,to:0,fgm:0,fga:0,tpm:0,tpa:0,ftm:0,fta:0,gs:0,gc:0});
    const ppg=+(tot.pts/gp).toFixed(1),rpg=+(tot.reb/gp).toFixed(1),apg=+(tot.ast/gp).toFixed(1);
    const spg=+(tot.stl/gp).toFixed(1),bpg=+(tot.blk/gp).toFixed(1),tpg=+(tot.to/gp).toFixed(1);
    const totObj = {gp, pts:tot.pts, reb:tot.reb, ast:tot.ast, stl:tot.stl, blk:tot.blk,
                    to:tot.to, fgm:tot.fgm, fga:tot.fga, ftm:tot.ftm, fta:tot.fta, gradeSum:tot.gs};
    let per, cs;
    per = +calcPER(totObj).toFixed(1);
    if (method === 'positional') {
      const w=_dsPosW[pos]||_dsPosW.SF;
      cs=+((Math.min(ppg/50,1)*100)*w.cs[0]+(Math.min(spg/3,1)*100)*w.cs[1]+
           (Math.min(bpg/3,1)*100)*w.cs[2]+(Math.min(rpg/20,1)*100)*w.cs[3]+
           (Math.min(apg/15,1)*100)*w.cs[4]+(tot.gs/gp)*w.cs[5]).toFixed(1);
    } else if (method === 'classic') {
      cs = +calcCompositeScore(totObj).toFixed(1);
    } else {
      // kw5 / top98 — jak calcCompositeScore ale bez grade, z maturity
      const mat = gp / (gp + 5);
      cs = +(((Math.min(ppg/50,1)*100)*0.25+(Math.min(spg/4,1)*100)*0.20+
               (Math.min(bpg/3,1)*100)*0.18+(Math.min(rpg/20,1)*100)*0.15+
               (Math.min(apg/15,1)*100)*0.12) * mat).toFixed(1);
    }
    const fgpct = tot.fga > 0 ? Math.round(tot.fgm / tot.fga * 100) : null;
    const tppct = tot.tpa > 0 ? Math.round(tot.tpm / tot.tpa * 100) : null;
    return {...p,pos,ppg,rpg,apg,spg,bpg,tpg,gp,per,cs,fgpct,tppct,ingameName:iname,matchMethod:resolved?.method};
  });

  // ── Skalowanie OVR ────────────────────────────────────────────
  // Build PSN→OVR lookup from the global ranking (sorted desc by OVR).
  // A player can appear multiple times (one row per position played).
  // We must take the FIRST occurrence per PSN name (= highest OVR),
  // NOT the last — otherwise the lower-OVR position overwrites the best one.
  const _buildGlobalByPsn = (ranking) => {
    const m = {};
    ranking.forEach(g => { if (!(g.name in m)) m[g.name] = g.ovr; });
    return m;
  };

  if (method === 'top98') {
    const globalByPsn = _buildGlobalByPsn(_dsLeagueRanking('top98'));
    const comp = p => (p.per * 0.6 + p.cs * 0.4) * (0.5 + 0.5 * p.gp / (p.gp + 5));
    const byPos = {};
    enriched.forEach(p => { if (!byPos[p.pos]) byPos[p.pos]=[]; byPos[p.pos].push(p); });
    const postOvrMap = _computeChainedOvrMap();
    return enriched.map(p => {
      if (p.ingameName && postOvrMap[p.ingameName] !== undefined)
        return {...p, ovr: postOvrMap[p.ingameName]};
      if (p.ingameName && globalByPsn[p.ingameName] !== undefined)
        return {...p, ovr: globalByPsn[p.ingameName]};
      // No match history — scale locally within position group
      const grp = byPos[p.pos] || [p];
      const maxC = Math.max(...grp.map(comp), 0.01);
      return {...p, ovr: Math.max(40, Math.min(98, Math.round(40 + comp(p) / maxC * 58)))};
    }).sort((a,b) => b.ovr - a.ovr);
  }

  // classic / positional / kw5
  const globalByPsnFb = _buildGlobalByPsn(_dsLeagueRanking(method));
  const postOvrMapFb = _computeChainedOvrMap();
  const pct=(sorted,val)=>sorted.length<=1?50:sorted.filter(v=>v<val).length/(sorted.length-1)*100;
  const sP=enriched.map(p=>p.per).sort((a,b)=>a-b);
  const sC=enriched.map(p=>p.cs).sort((a,b)=>a-b);
  const sG=enriched.map(p=>p.ppg).sort((a,b)=>a-b);
  return enriched.map(p=>{
    if (p.ingameName && postOvrMapFb[p.ingameName] !== undefined)
      return {...p, ovr: postOvrMapFb[p.ingameName]};
    if (p.ingameName && globalByPsnFb[p.ingameName] !== undefined)
      return {...p, ovr: globalByPsnFb[p.ingameName]};
    const gpBonus=Math.min(p.gp*2,10);
    const raw=pct(sP,p.per)*0.45+pct(sC,p.cs)*0.35+pct(sG,p.ppg)*0.15+gpBonus*0.05;
    return {...p,ovr:Math.max(40,Math.min(99,Math.round(raw*0.59+40)))};
  }).sort((a,b)=>b.ovr-a.ovr);
}

function _dsBuildPlayerPool(){return __lz(12,'_dsBuildPlayerPool',this,arguments)}

function _dsBuildOrder(){return __lz(12,'_dsBuildOrder',this,arguments)}

function _dsNext(){return __lz(12,'_dsNext',this,arguments)}

function _dsBack(){return __lz(12,'_dsBack',this,arguments)}

function _dsStep(){return __lz(12,'_dsStep',this,arguments)}

function _dsReadExclusions(){return __lz(12,'_dsReadExclusions',this,arguments)}

function _dsReadOrder(){return __lz(12,'_dsReadOrder',this,arguments)}

function _dsRender(){return __lz(12,'_dsRender',this,arguments)}

function _dsS1(){return __lz(12,'_dsS1',this,arguments)}

function _dsS2(){return __lz(12,'_dsS2',this,arguments)}

function _dsS2Update(){return __lz(12,'_dsS2Update',this,arguments)}

function _dsRandCaptains(){return __lz(12,'_dsRandCaptains',this,arguments)}

function _dsS3(){return __lz(12,'_dsS3',this,arguments)}

function _dsTgl(){return __lz(12,'_dsTgl',this,arguments)}
function _dsSelAll(){return __lz(12,'_dsSelAll',this,arguments)}
function _dsExclLow(){return __lz(12,'_dsExclLow',this,arguments)}
function _dsSavePool(){return __lz(12,'_dsSavePool',this,arguments)}
function _dsFPos(){return __lz(12,'_dsFPos',this,arguments)}
function _dsSrch(){return __lz(12,'_dsSrch',this,arguments)}

function _dsOrderHTML(){return __lz(12,'_dsOrderHTML',this,arguments)}

function _dsS4(){return __lz(12,'_dsS4',this,arguments)}

function _dsRandOrder(){return __lz(12,'_dsRandOrder',this,arguments)}

function _dsInitDnD(){return __lz(12,'_dsInitDnD',this,arguments)}

function _dsS5(){return __lz(12,'_dsS5',this,arguments)}

function _dsPollNow(){return __lz(12,'_dsPollNow',this,arguments)}

function _dsStartPoll(){return __lz(12,'_dsStartPoll',this,arguments)}

function _dsNotify(){return __lz(12,'_dsNotify',this,arguments)}

function _dsLaunch(){return __lz(12,'_dsLaunch',this,arguments)}



// Dashboard: tabela, liderzy, drużyna tygodnia itd. liczone tylko z meczów bieżącego sezonu
// Dziennik zmian: akcje admina wykonywane na stronie (wpis tylko, gdy akcja faktycznie się wykonała)
(function() {
  const wrap = (fn, describe) => {
    if(typeof window[fn] !== 'function' || window[fn]._audited) return;
    const orig = window[fn];
    window[fn] = function(...args) {
      let d = null;
      try { d = describe(...args); } catch(e) {}
      const out = orig.apply(this, args);
      Promise.resolve(out).then(() => { try { if(d && d.done()) _audit(d.action, d.details); } catch(e) {} }).catch(() => {});
      return out;
    };
    window[fn]._audited = true;
  };
  const sItem = k => { const s = _ssItem(k); return s ? `${s.team1} vs ${s.team2} (Week ${s.week})` : ''; };
  const allCount = () => _withAllMatches(() => matches.length);
  wrap('ssFinalize', (k, day) => ({ action: 'Zatwierdzono termin', details: `${sItem(k)}: ${day}`, done: () => !!_ssItem(k)?.date }));
  wrap('ssUnfinalize', k => ({ action: 'Cofnięto termin', details: sItem(k), done: () => !_ssItem(k)?.date }));
  wrap('ssConfirmLinkGames', k => { const before = JSON.stringify(_ssItem(k)?.matchIds || []); return { action: 'Przypięto wyniki', details: sItem(k), done: () => JSON.stringify(_ssItem(k)?.matchIds || []) !== before }; });
  wrap('ssConfirmFixture', () => { const n = schedule.length; return { action: 'Wygenerowano terminarz', details: `${_ssGen?.teams?.length || ''} drużyn, ${_ssGen?.format === 'groups' ? 'grupy' : 'jedna grupa'}`, done: () => !_ssGen?.demo && schedule.length !== n }; });
  wrap('toggleRegistrations', () => { const b = registrationsClosed; return { action: 'Zapisy drużyn', details: b ? 'otwarte' : 'zamknięte', done: () => registrationsClosed !== b }; });
  wrap('saveMatch', () => { const n = allCount(); const pm = typeof pendingMatch !== 'undefined' && pendingMatch ? pendingMatch : null;
    return { action: 'Dodano mecz', details: pm ? `${pm.team1?.name} ${pm.team1?.score}:${pm.team2?.score} ${pm.team2?.name}` : '', done: () => allCount() > n }; });
  wrap('saveWalkover', () => { const n = allCount(); return { action: 'Walkower', details: `${document.getElementById('wo-winner')?.value || ''} vs ${document.getElementById('wo-loser')?.value || ''}`, done: () => allCount() > n }; });
  wrap('deleteMatch', id => { const m = _withAllMatches(() => matches.find(x => String(x.id) === String(id)));
    return { action: 'Usunięto mecz', details: m ? `${m.team1.name} ${m.team1.score}:${m.team2.score} ${m.team2.name} (${m.date})` : String(id), done: () => !_withAllMatches(() => matches.some(x => String(x.id) === String(id))) }; });
})();

// Profile i rekordy: dodatkowe sekcje (odznaki, gablota, rywalizacje, pobite rekordy)
(function() {
  const inject = (fnName, elId, htmlFn, position) => {
    if(typeof window[fnName] !== 'function' || window[fnName]._extended) return;
    const orig = window[fnName];
    window[fnName] = function(...args) {
      const before = document.getElementById(elId)?.innerHTML;
      const out = orig.apply(this, args);
      try {
        const el = document.getElementById(elId);
        if(!el || el.innerHTML === before) return out; // modal nie został przerysowany (np. brak danych)
        const html = htmlFn(...args);
        if(el && html) {
          const box = document.createElement('div');
          box.innerHTML = html;
          if(position === 'afterFirst' && el.firstElementChild) el.firstElementChild.after(box);
          else el.prepend(box);
        }
      } catch(e) { console.warn(fnName + ' extras', e); }
      return out;
    };
    window[fnName]._extended = true;
  };
  inject('openPlayerModal', 'player-modal-content', name => `<div style="display:flex;justify-content:flex-end;margin-bottom:.5rem"><button class="btn btn-ghost" style="font-size:.74rem" onclick="openShareCard(this.dataset.p)" data-p="${_h(name)}">🪪 Karta do udostępnienia</button></div>` + _playerBadgesHtml(name), 'afterFirst');
  inject('openTeamModal', 'team-modal-content', tn => _teamExtrasHtml(tn), 'afterFirst');
  // Rekordy: liczone dla wybranej edycji gry (domyślnie bieżącej), z przełącznikiem edycji
  if(typeof window.openLeagueRecordsModal === 'function' && !window.openLeagueRecordsModal._extended) {
    const origRec = window.openLeagueRecordsModal;
    window.openLeagueRecordsModal = function() {
      const ed = _recordsEdition === undefined ? _currentEdition() : _recordsEdition;
      const list = _editionMatches(ed);
      const el = document.getElementById('league-records-content');
      if(!list.length) {
        if(el) el.innerHTML = _recordsEditionBar() + `<div style="text-align:center;color:var(--muted);padding:2rem">Brak meczów w edycji ${_h(ed || '')} — rekordy pojawią się po pierwszych meczach.</div>`;
        document.getElementById('league-records-modal')?.classList.add('open');
        return;
      }
      const all = matches;
      matches = list;
      try { origRec.apply(this, arguments); }
      finally { matches = all; }
      try { if(el) el.insertAdjacentHTML('afterbegin', _recordsEditionBar() + _recordsTimelineHtml()); } catch(e) { console.warn('records extras', e); }
    };
    window.openLeagueRecordsModal._extended = true;
  }
})();

['renderPlayoffDashboard', 'syncPlayoffBracket'].forEach(fn => {
  if(typeof window[fn] !== 'function' || window[fn]._allScoped) return;
  const orig = window[fn];
  window[fn] = function(...args) { return _withAllMatches(() => orig.apply(this, args)); };
  window[fn]._allScoped = true;
});
['renderStandings', 'renderLeaders', 'renderTop3', 'renderTeamOfWeek', 'renderRoundComparison', 'renderMilestoneBanner', 'renderTeamForm']
  .forEach(fn => {
    if(typeof window[fn] !== 'function' || window[fn]._seasonScoped) return;
    const orig = window[fn];
    window[fn] = function(...args) { return _withSeasonMatches(() => orig.apply(this, args)); };
    window[fn]._seasonScoped = true;
  });

// ═══ ◀ PRZYCISK „WSTECZ” (telefon / aplikacja): zamyka okna, potem wraca do poprzedniej zakładki ═══
(function () {
  const isOverlay = el => el && el.nodeType === 1 && (el.classList.contains('modal-overlay') || el.id === 'more-sheet' || el.id === 'gma-overlay');
  const stack = []; let popClosing = false; window._navIgnore = 0; window._navFromPop = false;
  const curView = () => (document.querySelector('.view.active')?.id || 'view-dashboard').replace(/^view-/, '');
  new MutationObserver(muts => muts.forEach(m => {
    const el = m.target; if(!isOverlay(el)) return;
    const open = el.classList.contains('open') || (el.id === 'gma-overlay' && el.style.display !== 'none' && el.isConnected && getComputedStyle(el).display !== 'none');
    const i = stack.indexOf(el);
    if(open && i < 0) { stack.push(el); if(window._navReady) history.pushState({ v: curView(), modal: el.id || 'modal' }, '', location.pathname + location.search + location.hash); }
    else if(!open && i >= 0) { stack.splice(i, 1); if(!popClosing && history.state?.modal) { window._navIgnore++; history.back(); } else if(_urlOn() && /^\/(mecz|match|event|draft)\//.test(location.pathname)) try { history.replaceState(history.state, '', _viewUrl(curView())); } catch(e) {} } // zamknięte przyciskiem ✕ — zdejmij wpis z historii
  })).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
  window.addEventListener('popstate', e => {
    if(window._navIgnore > 0) { window._navIgnore--; return; }
    const top = stack[stack.length - 1];
    if(top) { popClosing = true; try { if(top.id === 'gma-overlay' && typeof closeGmAuction === 'function') closeGmAuction(); else top.classList.remove('open'); } finally { popClosing = false; } stack.pop(); return; }
    const v = e.state?.v || 'dashboard';
    window._navFromPop = true; try { showView(v); } finally { window._navFromPop = false; }
  });
  setTimeout(() => { window._navReady = true; try { history.replaceState({ v: curView() }, '', _urlOn() && !stack.length && !location.hash ? _viewUrl(curView()) : location.pathname + location.search + location.hash); } catch(e) {} }, 3200);
})();


// 📎 pola wyboru pliku: własny przycisk w języku ligi zamiast tekstu przeglądarki („Wybierz plik” / „Choose file”)
(function fileInputsLocalize() {
  const fix = inp => { if(inp.dataset.fx || inp.closest('label') || getComputedStyle(inp).display === 'none' || inp.style.display === 'none' || inp.hidden) return; inp.dataset.fx = '1';
    const w = document.createElement('span'); w.className = 'fx-file'; inp.parentNode.insertBefore(w, inp); w.appendChild(inp); inp.style.display = 'none';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-ghost fx-file-btn'; b.textContent = '📎 ' + _g('Wybierz plik', 'Choose file'); b.onclick = () => inp.click();
    const n = document.createElement('span'); n.className = 'fx-file-name'; n.textContent = _g('Nie wybrano pliku', 'No file chosen');
    inp.addEventListener('change', () => { const f = inp.files || []; n.textContent = f.length ? (f.length > 1 ? `${f.length} ${_g('pliki', 'files')}` : f[0].name) : _g('Nie wybrano pliku', 'No file chosen'); });
    w.appendChild(b); w.appendChild(n); };
  const run = root => (root.querySelectorAll ? root.querySelectorAll('input[type=file]') : []).forEach(fix);
  const start = () => { run(document); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(nd => { if(nd.nodeType === 1) { if(nd.matches?.('input[type=file]')) fix(nd); run(nd); } }))).observe(document.body, { childList: true, subtree: true }); };
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
