/*@v:8c0d81398d*/
// ═══════════════════════════════════════════════════════════════
// PLAYOFF SYSTEM
// ═══════════════════════════════════════════════════════════════

function openPlayoffModal() {
  const el = document.getElementById('playoff-modal');
  if (!el) return;
  renderPlayoffModal();
  el.classList.add('open');
}
function getPlayoffForSeason(seasonId) {
  if(!playoffs.length) return null;
  // Try exact match first
  const exact = playoffs.find(p => p.seasonId === seasonId);
  if(exact) return exact;
  // If no exact match, return the most recent playoff (last one added)
  // This handles cases where playoff was created with null/different seasonId
  return playoffs[playoffs.length - 1];
}
function getCurrentSeasonStandings() {
  // Build standings for current season or all
  const ts = {};
  const filteredMatches = currentSeasonId
    ? matches.filter(m => m.seasonId === currentSeasonId)
    : matches;
  filteredMatches.forEach(m => {
    [m.team1, m.team2].forEach(t => { if (!ts[t.name]) ts[t.name] = {w:0,l:0,wo:0}; });
    const isWO = m.walkover === true;
    const w1 = m.team1.score > m.team2.score;
    ts[m.team1.name].w += w1?1:0; ts[m.team1.name].l += w1?0:1;
    ts[m.team2.name].w += w1?0:1; ts[m.team2.name].l += w1?1:0;
    if (isWO) { if(!w1) ts[m.team1.name].wo+=1; else ts[m.team2.name].wo+=1; }
  });
  return Object.entries(ts)
    .map(([name,s]) => ({ name, w:s.w, l:s.l, pts: s.w*2+(s.l-s.wo)*1 }))
    .sort((a,b) => b.pts-a.pts || b.w-a.w);
}
function renderPlayoffModal() {
  const seasonId = currentSeasonId;
  const season = seasons.find(s => s.id === seasonId);
  const existing = getPlayoffForSeason(seasonId);
  const standings = getCurrentSeasonStandings();

  const el = document.getElementById('playoff-modal-content');

  if (existing) {
    // Show existing playoff manager
    el.innerHTML = renderPlayoffManager(existing, standings);
    return;
  }

  // Show setup form
  const teamOpts = standings.map((t,i) =>
    `<option value="${t.name}">${i+1}. ${t.name} (${t.pts} pkt)</option>`
  ).join('');

  el.innerHTML = `
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px;margin-bottom:1.5rem">
      🏆 USTAWIENIA PLAYOFF
    </div>
    <div style="color:var(--muted);font-size:.85rem;margin-bottom:1.5rem">
      Sezon: <strong style="color:var(--text)">${season ? season.name : 'Bieżący'}</strong>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem">
      <div>
        <label style="font-size:.75rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:.4rem">Liczba drużyn w playoff</label>
        <select id="po-teams-count" onchange="updatePlayoffTeamList()"
          style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .75rem;font-family:inherit;font-size:.9rem">
          ${[4,6,8].map(n => `<option value="${n}" ${n===8?'selected':''}>${n} drużyn</option>`).join('')}
          <option value="custom">Własna liczba...</option>
        </select>
        <input type="number" id="po-teams-custom" min="2" max="16" value="8"
          style="width:100%;margin-top:.4rem;display:none;background:var(--surface2);border:1px solid var(--accent);color:var(--text);border-radius:6px;padding:.5rem .75rem;font-family:inherit;font-size:.9rem"
          placeholder="Wpisz liczbę drużyn" onchange="updatePlayoffTeamList()">
      </div>
      <div>
        <label style="font-size:.75rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:.4rem">Data startu playoff</label>
        <input type="date" id="po-start-date" value="${new Date().toISOString().slice(0,10)}"
          style="width:100%;background:var(--surface2);border:1px solid var(--accent);color:var(--text);border-radius:6px;padding:.5rem .75rem;font-family:inherit;font-size:.9rem">
      </div>
      <div>
        <label style="font-size:.75rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:.4rem">Format serii</label>
        <select id="po-format"
          style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .75rem;font-family:inherit;font-size:.9rem">
          <option value="bo3">Best of 3 (2 wygrane)</option>
          <option value="bo5" selected>Best of 5 (3 wygrane)</option>
          <option value="bo7">Best of 7 (4 wygrane)</option>
          <option value="bo1">Jeden mecz</option>
        </select>
      </div>
    </div>

    <div style="margin-bottom:1.25rem">
      <label style="font-size:.75rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;display:block;margin-bottom:.4rem">Kolejność drużyn (przeciągnij aby zmienić)</label>
      <div id="po-team-list" style="display:flex;flex-direction:column;gap:.35rem"></div>
    </div>

    <button onclick="startPlayoff()"
      style="width:100%;background:var(--accent);color:#000;border:none;border-radius:8px;padding:.75rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;cursor:pointer;transition:opacity .2s"
      onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
      🚀 ROZPOCZNIJ PLAYOFF
    </button>`;

  // Init team list
  window._poStandings = standings;
  updatePlayoffTeamList();

  // Handle custom select
  document.getElementById('po-teams-count').addEventListener('change', function() {
    document.getElementById('po-teams-custom').style.display = this.value === 'custom' ? 'block' : 'none';
  });
}
function updatePlayoffTeamList() {
  const sel = document.getElementById('po-teams-count');
  const customEl = document.getElementById('po-teams-custom');
  let n = sel.value === 'custom' ? parseInt(customEl.value) || 8 : parseInt(sel.value);
  n = Math.min(n, (window._poStandings || []).length);
  const teams = (window._poStandings || []).slice(0, n);
  const list = document.getElementById('po-team-list');
  if (!list) return;
  list.innerHTML = teams.map((t,i) => `
    <div style="display:flex;align-items:center;gap:.75rem;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:.5rem .75rem">
      <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;color:var(--accent);font-size:1.1rem;min-width:1.5rem">${i+1}</span>
      <span style="flex:1;font-weight:700">${t.name}</span>
      <span style="font-size:.75rem;color:var(--muted)">${t.pts} pkt · ${t.w}W ${t.l}L</span>
    </div>`).join('');
}
function startPlayoff() {
  const sel = document.getElementById('po-teams-count');
  const customEl = document.getElementById('po-teams-custom');
  let n = sel.value === 'custom' ? parseInt(customEl.value) || 8 : parseInt(sel.value);
  const format = document.getElementById('po-format').value;
  const teams = (window._poStandings || []).slice(0, n).map(t => t.name);

  if (teams.length < 2) { showToast('Za mało drużyn!', 'error'); return; }

  // Build bracket — classic seeding: 1vs(n), 2vs(n-1), etc.
  const pairs = [];
  const half = Math.floor(teams.length / 2);
  for (let i = 0; i < half; i++) {
    pairs.push({ seed1: i, seed2: teams.length - 1 - i, team1: teams[i], team2: teams[teams.length - 1 - i], w1: 0, w2: 0 });
  }

  const poStartDate = document.getElementById('po-start-date')?.value || new Date().toISOString().slice(0,10);
  const po = {
    id: Date.now(),
    seasonId: currentSeasonId,
    format,
    teams,
    startDate: poStartDate,
    createdAt: new Date().toISOString(),
    rounds: [{ name: getRoundName(teams.length), pairs, done: false }],
    champion: null,
  };

  playoffs.push(po);
  saveData();
  showToast('✅ Playoff rozpoczęty!', 'success');
  renderPlayoffModal();
  renderPlayoffDashboard();
}
function getRoundName(n) {
  if (n >= 16) return 'Eliminacje';
  if (n >= 8)  return 'Ćwierćfinały';
  if (n >= 4)  return 'Półfinały';
  return 'Finał';
}
function renderPlayoffManager(po, standings) {
  const winsNeeded = getWinsNeeded(po.format);

  // Auto-sync pair wins from actual match results
  if(po.startDate) {
    po.rounds.forEach(round => {
      round.pairs.forEach(pair => {
        const series = getSeriesResults(po, pair.team1, pair.team2);
        pair.w1 = series.w1;
        pair.w2 = series.w2;
      });
    });
  }

  const formatLabel = { bo1:'Bo1', bo3:'Bo3', bo5:'Bo5', bo7:'Bo7' }[po.format] || po.format;

  // Pre-calculate if playoff can be finished (for top button)
  const lastRound = po.rounds[po.rounds.length - 1];
  const allDone = lastRound.pairs.every(p => p.w1 >= winsNeeded || p.w2 >= winsNeeded);
  const isFinishable = _isLoggedInSync() && !po.champion && allDone && lastRound.pairs.length === 1;
  let topFinishBtn = '';
  if(isFinishable) {
    const finPair = lastRound.pairs[0];
    const champ = finPair.w1 >= winsNeeded ? finPair.team1 : finPair.team2;
    const thirdRound = po.rounds.find(r => r.thirdPlace);
    const thirdDone = !thirdRound || thirdRound.pairs.every(p => p.w1 >= winsNeeded || p.w2 >= winsNeeded);
    if(thirdDone) {
      const thirdPair = thirdRound?.pairs[0];
      const third = thirdPair ? (thirdPair.w1 >= winsNeeded ? thirdPair.team1 : thirdPair.team2) : null;
      topFinishBtn = `<button onclick="poSetChampion('${po.id}','${champ}')" style="width:100%;background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border:none;border-radius:8px;padding:.75rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;cursor:pointer;margin-bottom:1.25rem;box-shadow:0 4px 16px rgba(197,150,30,0.4)">
        🥇 ZAKOŃCZ PLAYOFF — MISTRZ: ${champ}${third ? ' · 🥉 3. miejsce: '+third : ''}
      </button>`;
    }
  }

  let html = `
    ${topFinishBtn}
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:2px">🏆 PLAYOFF</div>
        <div style="color:var(--muted);font-size:.8rem">Format: ${formatLabel} · ${po.teams.length} drużyn${po.startDate?' · start: '+po.startDate:''}</div>
      </div>
      ${po.champion ? `<div style="background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border-radius:8px;padding:.5rem 1.25rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem">🥇 MISTRZ: ${po.champion}</div>` : ''}
${_isLoggedInSync() && !po.champion ? `<button onclick="deletePlayoff('${po.id}')" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;border-radius:6px;padding:.3rem .75rem;font-size:.8rem;cursor:pointer;font-family:inherit">🗑 Usuń playoff</button>` : ''}
    </div>`;

  po.rounds.forEach((round, ri) => {
    html += `<div style="margin-bottom:1.5rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1rem;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.75rem;border-bottom:1px solid var(--border);padding-bottom:.4rem">${round.name}</div>
      <div style="display:flex;flex-direction:column;gap:.6rem">`;

    round.pairs.forEach((pair, pi) => {
      const done = pair.w1 >= winsNeeded || pair.w2 >= winsNeeded;
      const winner = pair.w1 >= winsNeeded ? pair.team1 : pair.w2 >= winsNeeded ? pair.team2 : null;
      const isAdmin = _isLoggedInSync();

      html += `<div style="background:var(--surface2);border:1px solid ${done?'rgba(245,197,24,.3)':'var(--border)'};border-radius:8px;padding:.75rem 1rem">
        <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <div style="flex:1;min-width:120px">
            <div style="display:flex;align-items:center;gap:.5rem">
              ${teamLogo(pair.team1,20,'.55rem')}
              <span style="font-weight:${pair.w1>pair.w2?'900':'600'};color:${winner===pair.team1?'var(--accent)':'var(--text)'}">${pair.team1}</span>
              ${winner===pair.team1?'<span style="font-size:.7rem;background:var(--accent);color:#000;border-radius:3px;padding:.05rem .3rem;font-weight:900">WYGRYWA</span>':''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;flex-shrink:0">
            ${isAdmin && !done ? `
              <button onclick="poAddWin('${po.id}',${ri},${pi},1)" style="background:rgba(245,197,24,.15);border:1px solid rgba(245,197,24,.4);color:var(--accent);border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">+</button>` : ''}
            <span style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;color:${pair.w1>pair.w2?'var(--win)':pair.w2>pair.w1?'var(--loss)':'var(--text)'}">${pair.w1}</span>
            <span style="color:var(--muted);font-size:.9rem">—</span>
            <span style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;color:${pair.w2>pair.w1?'var(--win)':pair.w1>pair.w2?'var(--loss)':'var(--text)'}">${pair.w2}</span>
            ${isAdmin && !done ? `
              <button onclick="poAddWin('${po.id}',${ri},${pi},2)" style="background:rgba(245,197,24,.15);border:1px solid rgba(245,197,24,.4);color:var(--accent);border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">+</button>` : ''}
            ${isAdmin && (pair.w1>0||pair.w2>0) && !done ? `
              <button onclick="poSubWin('${po.id}',${ri},${pi})" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444;border-radius:4px;width:22px;height:22px;cursor:pointer;font-size:.75rem">↩</button>` : ''}
          </div>
          <div style="flex:1;min-width:120px;text-align:right">
            <div style="display:flex;align-items:center;gap:.5rem;justify-content:flex-end">
              ${winner===pair.team2?'<span style="font-size:.7rem;background:var(--accent);color:#000;border-radius:3px;padding:.05rem .3rem;font-weight:900">WYGRYWA</span>':''}
              <span style="font-weight:${pair.w2>pair.w1?'900':'600'};color:${winner===pair.team2?'var(--accent)':'var(--text)'}">${pair.team2}</span>
              ${teamLogo(pair.team2,20,'.55rem')}
            </div>
          </div>
        </div>
        ${done ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.35rem;text-align:center">${pair.w1} — ${pair.w2} · ${winner} wygrywa serię</div>` : `<div style="font-size:.7rem;color:var(--muted);margin-top:.35rem;text-align:center">Do ${winsNeeded} wygranych</div>`}
        <div id="po-preview-${ri}-${pi}" style="margin-top:.6rem;border-top:1px solid var(--border);padding-top:.6rem">
          ${pair.preview
            ? `<div style="font-size:.82rem;line-height:1.7;color:var(--text)">${pair.preview.replace(/\n/g,'<br>')}</div>
               <button onclick="generatePairPreview('${po.id}',${ri},${pi})" style="margin-top:.5rem;background:none;border:1px solid var(--border);color:var(--muted);border-radius:5px;padding:.2rem .6rem;font-size:.72rem;cursor:pointer;font-family:inherit">🔄 Odśwież zapowiedź</button>`
            : `<button onclick="generatePairPreview('${po.id}',${ri},${pi})" style="background:rgba(245,197,36,.1);border:1px solid rgba(245,197,36,.3);color:var(--accent);border-radius:5px;padding:.3rem .8rem;font-size:.8rem;font-weight:700;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px">📣 Generuj zapowiedź</button>`
          }
        </div>
      </div>`;
    });

    html += '</div></div>';
  });

  // Button to advance to next round if current round is done
  if (_isLoggedInSync() && !po.champion) {
    const lastRound = po.rounds[po.rounds.length - 1];
    const allDone = lastRound.pairs.every(p => p.w1 >= winsNeeded || p.w2 >= winsNeeded);
    if (allDone && lastRound.pairs.length > 1 && !lastRound.thirdPlace) {
      html += `<button onclick="poAdvanceRound('${po.id}')" style="width:100%;background:var(--accent);color:#000;border:none;border-radius:8px;padding:.65rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;letter-spacing:1px;cursor:pointer;margin-top:.5rem">
        ➡ NASTĘPNA RUNDA
      </button>`;
    } else if (allDone && lastRound.pairs.length === 1 && !lastRound.thirdPlace) {
      // Final done — check if 3rd place round also done
      const finPair = lastRound.pairs[0];
      const champ = finPair.w1 >= winsNeeded ? finPair.team1 : finPair.team2;
      const thirdRound = po.rounds.find(r => r.thirdPlace);
      const thirdDone = !thirdRound || thirdRound.pairs.every(p => p.w1 >= winsNeeded || p.w2 >= winsNeeded);
      if (thirdDone) {
        const thirdPair = thirdRound?.pairs[0];
        const third = thirdPair ? (thirdPair.w1 >= winsNeeded ? thirdPair.team1 : thirdPair.team2) : null;
        html += `<button onclick="poSetChampion('${po.id}','${champ}')" style="width:100%;background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border:none;border-radius:8px;padding:.65rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;cursor:pointer;margin-top:.5rem">
          🥇 ZAKOŃCZ PLAYOFF — MISTRZ: ${champ}${third ? ' · 🥉 3. miejsce: '+third : ''}
        </button>`;
      } else {
        html += `<div style="text-align:center;color:var(--muted);font-size:.8rem;margin-top:.5rem;padding:.5rem">⏳ Poczekaj na rozstrzygnięcie meczu o 3. miejsce</div>`;
      }
    }
  }

  return html;
}
function poAddWin(poId, roundIdx, pairIdx, team) {
  const po = playoffs.find(p => String(p.id) === String(poId));
  if (!po) return;
  const pair = po.rounds[roundIdx].pairs[pairIdx];
  const wn = getWinsNeeded(po.format);
  if (pair.w1 >= wn || pair.w2 >= wn) return; // already decided
  if (team === 1) pair.w1++; else pair.w2++;
  saveData();
  renderPlayoffModal();
  renderPlayoffDashboard();
}
function poSubWin(poId, roundIdx, pairIdx) {
  const po = playoffs.find(p => String(p.id) === String(poId));
  if (!po) return;
  const pair = po.rounds[roundIdx].pairs[pairIdx];
  // Remove last win — figure out which team had more recent win
  if (pair.w2 > 0 && pair.w2 >= pair.w1) pair.w2--;
  else if (pair.w1 > 0) pair.w1--;
  saveData();
  renderPlayoffModal();
  renderPlayoffDashboard();
}
function poAdvanceRound(poId) {
  const po = playoffs.find(p => String(p.id) === String(poId));
  if (!po) return;
  const lastRound = po.rounds[po.rounds.length - 1];
  const wn = getWinsNeeded(po.format);
  const winners = lastRound.pairs.map(p => p.w1 >= wn ? p.team1 : p.team2);
  const losers  = lastRound.pairs.map(p => p.w1 >= wn ? p.team2 : p.team1);

  // If advancing from a round with exactly 2 pairs (semi-finals) — add 3rd place match
  if (lastRound.pairs.length === 2) {
    // Final
    const finalPairs = [{ team1: winners[0], team2: winners[1], w1: 0, w2: 0 }];
    po.rounds.push({ name: 'Finał', pairs: finalPairs, done: false });
    // 3rd place
    const thirdPairs = [{ team1: losers[0], team2: losers[1], w1: 0, w2: 0, thirdPlace: true }];
    po.rounds.push({ name: 'Mecz o 3. miejsce', pairs: thirdPairs, done: false, thirdPlace: true });
    saveData();
    showToast('Finał i mecz o 3. miejsce rozpoczęte!', 'success');
  } else {
    // Standard advancement
    const newPairs = [];
    for (let i = 0; i < winners.length / 2; i++) {
      newPairs.push({ team1: winners[i], team2: winners[winners.length - 1 - i], w1: 0, w2: 0 });
    }
    const nextName = getRoundName(winners.length);
    po.rounds.push({ name: nextName, pairs: newPairs, done: false });
    saveData();
    showToast('Następna runda rozpoczęta!', 'success');
  }
  renderPlayoffModal();
  renderPlayoffDashboard();
}
function poSetChampion(poId, champ) {
  const po = playoffs.find(p => String(p.id) === String(poId));
  if (!po) return;
  po.champion = champ;
  saveData();
  showToast('🥇 ' + champ + ' mistrzem sezonu!', 'success');
  renderPlayoffModal();
  renderPlayoffDashboard();
}
function isExcludedFromPreview(teamName, playerName) {
  const excluded = PREVIEW_EXCLUDED_PLAYERS[teamName] || [];
  return excluded.includes(playerName);
}
function getPlayerStatsForPreview(teamName, topN = 5) {
  const filteredMatches = currentSeasonId
    ? matches.filter(m => m.seasonId === currentSeasonId)
    : matches;

  const playerMap = {}; // name -> accumulated stats

  filteredMatches.forEach(m => {
    const side = m.team1.name === teamName ? m.team1 : m.team2.name === teamName ? m.team2 : null;
    if (!side || !side.players) return;
    side.players.forEach(p => {
      if (!p.name) return;
      if (isExcludedFromPreview(teamName, p.name)) return;
      if (!playerMap[p.name]) playerMap[p.name] = { gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, grade:'B' };
      const s = playerMap[p.name];
      s.gp++;
      s.pts  += (p.pts  || 0);
      s.reb  += (p.reb  || 0);
      s.ast  += (p.ast  || 0);
      s.stl  += (p.stl  || 0);
      s.blk  += (p.blk  || 0);
      s.grade = p.grade || s.grade;
    });
  });

  return Object.entries(playerMap)
    .map(([name, s]) => ({
      name,
      gp: s.gp,
      ppg: s.gp ? (s.pts / s.gp).toFixed(1) : '0.0',
      rpg: s.gp ? (s.reb / s.gp).toFixed(1) : '0.0',
      apg: s.gp ? (s.ast / s.gp).toFixed(1) : '0.0',
      spg: s.gp ? (s.stl / s.gp).toFixed(1) : '0.0',
      grade: s.grade
    }))
    .sort((a, b) => parseFloat(b.ppg) - parseFloat(a.ppg))
    .slice(0, topN);
}
function getH2HPlayerStatsForPreview(team1, team2) {
  const filteredMatches = currentSeasonId
    ? matches.filter(m => m.seasonId === currentSeasonId)
    : matches;

  const h2hMatches = filteredMatches.filter(m =>
    (m.team1.name === team1 && m.team2.name === team2) ||
    (m.team1.name === team2 && m.team2.name === team1)
  );

  // Accumulate per-player stats across all H2H matches
  const map1 = {}, map2 = {};
  h2hMatches.forEach(m => {
    const s1 = m.team1.name === team1 ? m.team1 : m.team2;
    const s2 = m.team1.name === team2 ? m.team1 : m.team2;
    [{ side: s1, map: map1, team: team1 }, { side: s2, map: map2, team: team2 }].forEach(({ side, map, team }) => {
      if (!side.players) return;
      side.players.forEach(p => {
        if (!p.name) return;
        if (isExcludedFromPreview(team, p.name)) return;
        if (!map[p.name]) map[p.name] = { gp:0, pts:0, reb:0, ast:0, stl:0, blk:0, fgm:0, fga:0, pos:'', grade:'B' };
        const s = map[p.name];
        s.gp++; s.pts+=(p.pts||0); s.reb+=(p.reb||0); s.ast+=(p.ast||0);
        s.stl+=(p.stl||0); s.blk+=(p.blk||0); s.fgm+=(p.fgm||0); s.fga+=(p.fga||0);
        if (p.pos)   s.pos   = p.pos;
        if (p.grade) s.grade = p.grade;
      });
    });
  });

  const toArr = (map) => Object.entries(map)
    .map(([name, s]) => ({
      name, pos: s.pos, grade: s.grade, gp: s.gp,
      ppg:  s.gp ? s.pts/s.gp  : 0,
      rpg:  s.gp ? s.reb/s.gp  : 0,
      apg:  s.gp ? s.ast/s.gp  : 0,
      spg:  s.gp ? s.stl/s.gp  : 0,
      bpg:  s.gp ? s.blk/s.gp  : 0,
      fgPct: s.fga > 0 ? Math.round(s.fgm/s.fga*100) : null
    }))
    .sort((a, b) => b.ppg - a.ppg);

  const arr1 = toArr(map1);
  const arr2 = toArr(map2);

  // Use the same GUARD_MAP as the recap system
  // PG jest kryty przez SF, SG przez SG, SF przez PG, PF przez C, C przez PF
  const GUARD_MAP = { PF:'PG', SG:'SG', PG:'SF', C:'PF', SF:'C' };
  const PLAYER_EXCEPTIONS = {
    'chemik81pl': { guardPos: 'C', overridesPos: 'SF' }
  };

  const getByPos = (arr, pos) => arr.find(p => p.pos === pos);

  const duelLines = [];
  const handledDef1 = new Set(), handledDef2 = new Set();
  const handledAtk1 = new Set(), handledAtk2 = new Set();

  // Apply player exceptions first
  for (const [playerName, exc] of Object.entries(PLAYER_EXCEPTIONS)) {
    const defInArr1 = arr1.find(p => p.name === playerName && p.pos === exc.overridesPos);
    if (defInArr1) {
      const atk = getByPos(arr2, exc.guardPos);
      if (atk) {
        duelLines.push(`[${exc.overridesPos}*→${exc.guardPos}] ${defInArr1.name} (${defInArr1.grade}) KRYJE ${atk.name} (${atk.grade}) — ${atk.name}: śr. ${atk.ppg.toFixed(1)}pkt/${atk.rpg.toFixed(1)}zb/${atk.apg.toFixed(1)}as | ${defInArr1.name}: śr. ${defInArr1.ppg.toFixed(1)}pkt`);
        handledDef1.add(exc.overridesPos); handledAtk2.add(exc.guardPos);
      }
    }
    const defInArr2 = arr2.find(p => p.name === playerName && p.pos === exc.overridesPos);
    if (defInArr2) {
      const atk = getByPos(arr1, exc.guardPos);
      if (atk) {
        duelLines.push(`[${exc.overridesPos}*→${exc.guardPos}] ${defInArr2.name} (${defInArr2.grade}) KRYJE ${atk.name} (${atk.grade}) — ${atk.name}: śr. ${atk.ppg.toFixed(1)}pkt/${atk.rpg.toFixed(1)}zb/${atk.apg.toFixed(1)}as | ${defInArr2.name}: śr. ${defInArr2.ppg.toFixed(1)}pkt`);
        handledDef2.add(exc.overridesPos); handledAtk1.add(exc.guardPos);
      }
    }
  }

  // Standard matchups
  for (const [atkPos, defPos] of Object.entries(GUARD_MAP)) {
    if (!handledAtk1.has(atkPos) && !handledDef2.has(defPos)) {
      const atk = getByPos(arr1, atkPos);
      const def = getByPos(arr2, defPos);
      if (atk && def) {
        const fgStr = atk.fgPct !== null ? ` FG:${atk.fgPct}%` : '';
        duelLines.push(`[${defPos}→${atkPos}] ${def.name} (${def.grade}) KRYJE ${atk.name} (${atk.grade}) — ${atk.name}: śr. ${atk.ppg.toFixed(1)}pkt${fgStr} | ${def.name}: śr. ${def.spg.toFixed(1)}prz ${def.bpg.toFixed(1)}blk`);
      }
    }
    if (!handledAtk2.has(atkPos) && !handledDef1.has(defPos)) {
      const atk = getByPos(arr2, atkPos);
      const def = getByPos(arr1, defPos);
      if (atk && def) {
        const fgStr = atk.fgPct !== null ? ` FG:${atk.fgPct}%` : '';
        duelLines.push(`[${defPos}→${atkPos}] ${def.name} (${def.grade}) KRYJE ${atk.name} (${atk.grade}) — ${atk.name}: śr. ${atk.ppg.toFixed(1)}pkt${fgStr} | ${def.name}: śr. ${def.spg.toFixed(1)}prz ${def.bpg.toFixed(1)}blk`);
      }
    }
  }

  const fmtTop = (arr, n) => arr.slice(0, n)
    .map(p => `${p.name}${p.pos ? ' ('+p.pos+')' : ''} ${p.grade}: śr. ${p.ppg.toFixed(1)}pkt/${p.rpg.toFixed(1)}zb/${p.apg.toFixed(1)}as`)
    .join(', ');

  return {
    games: h2hMatches.length,
    team1Players: fmtTop(arr1, 3),
    team2Players: fmtTop(arr2, 3),
    duels: duelLines
  };
}
function getTeamStatsForPreview(teamName) {
  const filteredMatches = currentSeasonId
    ? matches.filter(m => m.seasonId === currentSeasonId)
    : matches;
  let w = 0, l = 0, pf = 0, pa = 0;
  const teamMatches = filteredMatches.filter(m =>
    m.team1.name === teamName || m.team2.name === teamName
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  teamMatches.forEach(m => {
    const isT1 = m.team1.name === teamName;
    const myScore = isT1 ? m.team1.score : m.team2.score;
    const oppScore = isT1 ? m.team2.score : m.team1.score;
    const won = myScore > oppScore;
    if (won) w++; else l++;
    pf += myScore;
    pa += oppScore;
  });

  const last5 = teamMatches.slice(-5).map(m => {
    const isT1 = m.team1.name === teamName;
    return (isT1 ? m.team1.score : m.team2.score) > (isT1 ? m.team2.score : m.team1.score) ? 'W' : 'L';
  });

  const allResults = teamMatches.map(m => {
    const isT1 = m.team1.name === teamName;
    return (isT1 ? m.team1.score : m.team2.score) > (isT1 ? m.team2.score : m.team1.score);
  });
  let streakCount = 0, streakType = '-';
  if (allResults.length) {
    const lastResult = allResults[allResults.length - 1];
    for (let i = allResults.length - 1; i >= 0; i--) {
      if (allResults[i] === lastResult) streakCount++;
      else break;
    }
    streakType = (lastResult ? 'W' : 'L') + streakCount;
  }

  const gp = w + l;
  return {
    w, l, gp,
    ppg: gp > 0 ? (pf / gp).toFixed(1) : '0.0',
    opp: gp > 0 ? (pa / gp).toFixed(1) : '0.0',
    winPct: gp > 0 ? (w / gp * 100).toFixed(1) : '0.0',
    last5: last5.join(''),
    streak: streakType
  };
}
function getH2HForPreview(team1, team2) {
  const filteredMatches = currentSeasonId
    ? matches.filter(m => m.seasonId === currentSeasonId)
    : matches;
  const h2h = filteredMatches.filter(m =>
    (m.team1.name === team1 && m.team2.name === team2) ||
    (m.team1.name === team2 && m.team2.name === team1)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  let w1 = 0, w2 = 0;
  const games = h2h.slice(0, 5).map(m => {
    const isT1 = m.team1.name === team1;
    const s1 = isT1 ? m.team1.score : m.team2.score;
    const s2 = isT1 ? m.team2.score : m.team1.score;
    if (s1 > s2) w1++; else w2++;
    return `${m.date || ''}: ${team1} ${s1}-${s2} ${team2} (${s1 > s2 ? team1 : team2} wygrywa)`;
  });

  return { w1, w2, games, total: h2h.length };
}
async function generatePairPreview(poId, roundIdx, pairIdx) {
  const po = playoffs.find(p => String(p.id) === String(poId));
  if (!po) return;
  const round = po.rounds[roundIdx];
  const pair = round.pairs[pairIdx];
  const formatLabel = { bo1:'Bo1', bo3:'Bo3', bo5:'Bo5', bo7:'Bo7' }[po.format] || po.format;

  const previewId = `po-preview-${roundIdx}-${pairIdx}`;
  const container = document.getElementById(previewId);
  if (container) {
    container.innerHTML = '<span style="color:var(--muted);font-size:.8rem;font-style:italic">⏳ Generuję zapowiedź…</span>';
  }

  try {
    const s1 = getTeamStatsForPreview(pair.team1);
    const s2 = getTeamStatsForPreview(pair.team2);
    const h2h = getH2HForPreview(pair.team1, pair.team2);

    const p1players = getPlayerStatsForPreview(pair.team1);
    const p2players = getPlayerStatsForPreview(pair.team2);
    const h2hPlayers = getH2HPlayerStatsForPreview(pair.team1, pair.team2);

    const fmtPlayers = (arr) => arr.map(p =>
      `${p.name} (${p.grade}): ${p.ppg}pts/${p.rpg}reb/${p.apg}ast w ${p.gp}G`
    ).join(', ');

    const statsBlock = `STATYSTYKI DRUŻYNOWE:
${pair.team1}: ${s1.w}W-${s1.l}L | Win%: ${s1.winPct}% | PPG: ${s1.ppg} | OPP PPG: ${s1.opp} | Forma (ost.5): ${s1.last5 || 'brak'} | Passa: ${s1.streak}
${pair.team2}: ${s2.w}W-${s2.l}L | Win%: ${s2.winPct}% | PPG: ${s2.ppg} | OPP PPG: ${s2.opp} | Forma (ost.5): ${s2.last5 || 'brak'} | Passa: ${s2.streak}

TOP ZAWODNICY ${pair.team1}:
${p1players.length ? fmtPlayers(p1players) : 'brak danych'}

TOP ZAWODNICY ${pair.team2}:
${p2players.length ? fmtPlayers(p2players) : 'brak danych'}

H2H (sezon): ${h2h.total} meczy | ${pair.team1}: ${h2h.w1} | ${pair.team2}: ${h2h.w2}${h2h.games.length ? '\nOstatnie wyniki: ' + h2h.games.join(' | ') : ''}${h2hPlayers.games > 0 ? `\nTop scorerzy H2H — ${pair.team1}: ${h2hPlayers.team1Players || 'brak'}; ${pair.team2}: ${h2hPlayers.team2Players || 'brak'}` : ''}${h2hPlayers.duels && h2hPlayers.duels.length ? `\nPOJEDYNKI NA POZYCJACH (H2H):\n${h2hPlayers.duels.join('\n')}` : ''}`;

    // Call 1 (Haiku): szczegółowa analiza statystyczna
    const resp1 = await callAI('gemini-2.5-flash', 900, [{
      role: 'user',
      content: `Jesteś ekspertem analitycznym polskiej ligi NBA 2K. Na podstawie danych napisz rzetelny raport analityczny (160-200 słów) przed serią playoff ${formatLabel} (${round.name}): ${pair.team1} vs ${pair.team2}.

Uwzględnij OBOWIĄZKOWO:
- porównanie bilansów W-L, Win%, PPG i OPP PPG
- formę ostatnich 5 meczów i aktualną passę obu drużyn
- historię bezpośrednich spotkań H2H z wynikami
- kluczowych zawodników (liderzy punktowi ze średnio punkty/zbiórki/asysty)
- bezpośrednie pojedynki zawodników w H2H jeśli dostępne
- wskazanie faworyta z konkretnym uzasadnieniem

Pisz analitycznie, posługuj się konkretnymi liczbami i nazwiskami. Bez wstępu. POLSKI.

${statsBlock}`
    }]);
    const analiza = resp1?.content?.[0]?.text || resp1?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!analiza) throw new Error('Brak odpowiedzi (analiza)');

    // Call 2 (Haiku): emocjonalna zapowiedź TV
    const resp2 = await callAI('gemini-2.5-flash', 900, [{
      role: 'user',
      content: `Jesteś komentatorem sportowym polskiej ligi NBA 2K w telewizji. Na podstawie analizy napisz pełną, emocjonującą zapowiedź (200-240 słów) serii playoff ${formatLabel} (${round.name}): ${pair.team1} vs ${pair.team2}.

Struktura:
1. Wstęp budujący napięcie — poczucie wielkiego wydarzenia (2-3 zdania)
2. Charakterystyka faworyta — wymień z imienia lidera i jego liczby (3-4 zdania)
3. Zagrożenie ze strony outsidera — kto może zaskoczyć, wymień kluczowego gracza (2-3 zdania)
4. Zapowiedź kluczowego pojedynku zawodników jeśli dane pozwalają (2 zdania)
5. Wyraźna prognoza z uzasadnieniem (2 zdania)

Wymień konkretnych zawodników z ich statystykami. Ton: dynamiczny, TV prime time. Bez tytułu. POLSKI.

Analiza eksperta:
${analiza}`
    }]);
    const narracja = resp2?.content?.[0]?.text || resp2?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!narracja) throw new Error('Brak odpowiedzi (narracja)');

    pair.preview = analiza.trim() + '\n\n—\n\n' + narracja.trim();
    await saveData();
    showToast('✅ Zapowiedź zapisana!', 'success');

  } catch(e) {
    pair.preview = '❌ Błąd: ' + e.message;
    showToast('Błąd: ' + e.message, 'error');
  }

  renderPlayoffModal();
}
// Legacy bulk function - kept for compatibility but no longer called
async function generatePlayoffPreviews() {
  showToast('Użyj przycisków przy każdej parze!', 'info');
}
function deletePlayoff(poId) {
  if (!confirm('Usuń playoff? Tej operacji nie można cofnąć.')) return;
  playoffs = playoffs.filter(p => String(p.id) !== String(poId));
  saveData();
  showToast('Playoff usunięty', 'info');
  renderPlayoffModal();
  renderPlayoffDashboard();
}
// ═══════════════════════════════════════════════════════════════
// PLAYOFF STATS & SERIES TRACKING
// ═══════════════════════════════════════════════════════════════

// Get all matches that belong to a playoff (after startDate)


// Open the playoff stats modal
function openPlayoffStats() {
  const po = playoffs.length ? playoffs[playoffs.length - 1] : null;
  if (!po) { showToast('Brak aktywnych playoffów', 'info'); return; }

  const el = document.getElementById('playoff-modal');
  if (!el) return;
  document.getElementById('playoff-modal-content').innerHTML = renderPlayoffStatsContent(po);
  el.classList.add('open');
}
function renderPlayoffStatsContent(po) {
  const poMatches = getPlayoffMatches(po);
  const wn = getWinsNeeded(po.format);
  const formatLabel = { bo1:'Bo1', bo3:'Bo3', bo5:'Bo5', bo7:'Bo7' }[po.format] || po.format;

  // ── Build player stats from playoff matches ──────────────────
  const playerMap = {};
  poMatches.forEach(m => {
    [m.team1, m.team2].forEach(team => {
      (team.players || []).forEach(p => {
        const key = p.name + '|||' + team.name;
        if (!playerMap[key]) playerMap[key] = {
          name: p.name, team: team.name, pos: p.pos || '', posCounts: {},
          gp: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0,
          fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, gradeSum: 0
        };
        const s = playerMap[key];
        s.gp++; s.pts += p.pts||0; s.reb += p.reb||0; s.ast += p.ast||0;
        s.stl += p.stl||0; s.blk += p.blk||0; s.to += p.to||0;
        s.fgm += p.fgm||0; s.fga += p.fga||0; s.tpm += p.tpm||0;
        s.tpa += p.tpa||0; s.ftm += p.ftm||0; s.fta += p.fta||0;
        s.gradeSum += gradeToNum(p.grade||'B');
        if (p.pos) { s.posCounts[p.pos] = (s.posCounts[p.pos]||0) + 1; }
      });
    });
  });

  // Set primary pos = most frequent
  Object.values(playerMap).forEach(pl => {
    if (Object.keys(pl.posCounts||{}).length)
      pl.pos = Object.entries(pl.posCounts).sort((a,b)=>b[1]-a[1])[0][0];
  });

  const players = Object.values(playerMap).filter(p => p.gp > 0)
    .map(p => ({
      ...p,
      avgGrade: p.gradeSum / p.gp,
      cs: calcCompositeScore(p),
      per: calcPER(p),
      fgpct: p.fga > 0 ? Math.round(p.fgm/p.fga*100) : 0,
    }))
    .sort((a,b) => {
      const col = window._poStatsSortCol || 'pts';
      const dir = window._poStatsSortDir || -1;
      const av = k => a[k] / (a.gp||1);
      const bv = k => b[k] / (b.gp||1);
      let va, vb;
      if (col === 'name')     { va = a.name; vb = b.name; }
      else if (col === 'team'){ va = a.team; vb = b.team; }
      else if (col === 'pos') { va = a.pos;  vb = b.pos;  }
      else if (col === 'grd') { va = a.avgGrade; vb = b.avgGrade; }
      else if (col === 'cs')  { va = a.cs;   vb = b.cs;   }
      else if (col === 'per') { va = a.per;  vb = b.per;  }
      else if (col === 'fg')  { va = a.fgpct; vb = b.fgpct; }
      else if (col === 'gp')  { va = a.gp;  vb = b.gp;   }
      else { va = av(col); vb = bv(col); }
      if (typeof va === 'string') return dir * va.localeCompare(vb);
      return dir * ((va||0) - (vb||0));
    });

  // ── Series results ───────────────────────────────────────────
  const allPairs = po.rounds.flatMap(r => r.pairs.map(pair => ({...pair, roundName: r.name})));

  const seriesHtml = allPairs.map(pair => {
    const res = getSeriesResults(po, pair.team1, pair.team2);
    const done = res.w1 >= wn || res.w2 >= wn;
    const winner = res.w1 >= wn ? pair.team1 : res.w2 >= wn ? pair.team2 : null;

    const gameScores = res.games.map((g, gi) => `
      <span style="font-size:.72rem;color:${g.win1?'var(--win)':'var(--loss)'};font-weight:700;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:.1rem .4rem;cursor:pointer"
        onclick="closePlayoffModal();setTimeout(()=>openMatch(${g.matchId}),200)"
        title="Kliknij aby zobaczyć mecz">
        G${gi+1}: ${g.s1}–${g.s2}
      </span>`).join('');

    return `
      <div style="background:var(--surface2);border:1px solid ${done?'rgba(245,197,24,.3)':'var(--border)'};border-radius:8px;padding:.75rem 1rem;margin-bottom:.5rem">
        <div style="font-size:.65rem;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:.5rem">${pair.roundName}</div>
        <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
          <div style="flex:1;min-width:100px">
            <span style="font-weight:${res.w1>=res.w2?'900':'600'};color:${winner===pair.team1?'var(--accent)':'var(--text)'}">${pair.team1}</span>
          </div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.5rem;font-weight:900;color:${res.w1>res.w2?'var(--win)':res.w2>res.w1?'var(--loss)':'var(--text)'}">
            ${res.w1} – ${res.w2}
          </div>
          <div style="flex:1;min-width:100px;text-align:right">
            <span style="font-weight:${res.w2>=res.w1?'900':'600'};color:${winner===pair.team2?'var(--accent)':'var(--text)'}">${pair.team2}</span>
          </div>
        </div>
        ${res.games.length ? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.5rem">${gameScores}</div>` : `<div style="font-size:.7rem;color:var(--muted);margin-top:.35rem">Brak meczów</div>`}
        ${winner ? `<div style="font-size:.7rem;color:var(--accent);font-weight:700;margin-top:.35rem">🏆 ${winner} wygrywa serię ${res.w1}–${res.w2}</div>` : ''}
      </div>`;
  }).join('');

  // ── Player stats table ───────────────────────────────────────
  const medals = ['🥇','🥈','🥉'];
  const statRows = players.map((p, i) => {
    const gr = numToGrade(p.avgGrade);
    const avg = k => (p[k]/p.gp).toFixed(1);
    const esc = s => s.replace(/'/g,"\'");
    const rank = i < 3 ? medals[i] : `<span style="font-weight:700;color:var(--muted)">${i+1}</span>`;
    return `<tr style="cursor:pointer" onclick="closePlayoffModal();setTimeout(()=>openPlayerModal('${esc(p.name)}','${esc(p.team)}'),200)">
      <td style="text-align:center">${rank}</td>
      <td style="font-weight:700">${p.name}</td>
      <td style="color:var(--muted);font-size:.8rem">${p.pos||'—'}</td>
      <td style="color:var(--muted);font-size:.8rem">${p.team}</td>
      <td><span class="grade grade-${gr.replace('+','p').replace('-','m')}">${gr}</span></td>
      <td style="color:var(--accent);font-weight:700">${avg('pts')}</td>
      <td>${avg('reb')}</td>
      <td>${avg('ast')}</td>
      <td>${avg('stl')}</td>
      <td>${avg('blk')}</td>
      <td>${avg('to')}</td>
      <td style="font-size:.8rem">${p.fgpct}%</td>
      <td style="color:var(--accent2);font-weight:700">${p.cs.toFixed(1)}</td>
      <td style="color:#3498db;font-weight:700">${p.per.toFixed(1)}</td>
      <td style="color:var(--muted);font-size:.8rem">${p.gp}</td>
    </tr>`;
  }).join('');

  // ── Tab switcher ─────────────────────────────────────────────
  const activeTab = window._poStatsTab || 'series';
  const tabBtn = (id, lbl) => `<button onclick="window._poStatsTab='${id}';document.getElementById('playoff-modal-content').innerHTML=renderPlayoffStatsContent(playoffs[playoffs.length-1])"
    style="padding:.5rem 1.25rem;border:none;border-bottom:2px solid ${activeTab===id?'var(--accent)':'transparent'};background:none;color:${activeTab===id?'var(--accent)':'var(--muted)'};font-weight:${activeTab===id?'700':'400'};cursor:pointer;font-family:inherit;font-size:.9rem">${lbl}</button>`;

  const _poSortCols = [['name','Zawodnik',1,'text-align:left'],['pos','POZ',-1,''],['team','Drużyna',1,'text-align:left'],['grd','GRD',-1,''],['pts','PTS',-1,''],['reb','REB',-1,''],['ast','AST',-1,''],['stl','STL',-1,''],['blk','BLK',-1,''],['to','TO',1,''],['fg','FG%',-1,''],['cs','CS',-1,'color:var(--accent2)'],['per','PER',-1,'color:#3498db'],['gp','GP',-1,'']];
  const _poSortHeaders = _poSortCols.map(function(c) {
    var col=c[0],lbl=c[1],defDir=c[2],style=c[3];
    var active=(window._poStatsSortCol||'pts')===col;
    var dir=active?(window._poStatsSortDir||defDir):defDir;
    var arrow=active?(dir===-1?' ▼':' ▲'):'';
    var thStyle='cursor:pointer;user-select:none;white-space:nowrap;'+(style?style+';':'')+(active?'color:var(--accent)':'');
    var onclick="window._poStatsSortCol='"+col+"';window._poStatsSortDir="+(active?(-dir):dir)+";document.getElementById('playoff-modal-content').innerHTML=renderPlayoffStatsContent(playoffs[playoffs.length-1])";
    return '<th style="'+thStyle+'" onclick="'+onclick+'">'+lbl+arrow+'</th>';
  }).join('');

  const content = activeTab === 'series'
    ? '<div style="margin-top:1rem">'+(seriesHtml || '<p style="color:var(--muted)">Brak meczów playoff</p>')+'</div>'
    : '<div style="margin-top:1rem;font-size:.75rem;color:var(--muted);margin-bottom:.5rem">Kliknij na gracza aby zobaczyć pełną kartę. '+poMatches.length+' meczów playoff.</div>'
      +'<div class="stats-table-wrap"><table>'
      +'<thead><tr><th></th>'+_poSortHeaders+'</tr></thead>'
      +'<tbody>'+(statRows || '<tr><td colspan="15" style="text-align:center;color:var(--muted);padding:2rem">Brak danych</td></tr>')+'</tbody>'
      +'</table></div>';

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px">🏆 PLAYOFF ${formatLabel}</div>
        <div style="color:var(--muted);font-size:.8rem">${poMatches.length} meczów · start ${po.startDate || '—'}</div>
      </div>
      ${po.champion ? `<div style="background:linear-gradient(135deg,var(--accent),#b8882a);color:#000;border-radius:8px;padding:.4rem 1rem;font-family:'Barlow Condensed',sans-serif;font-weight:900">🥇 MISTRZ: ${po.champion}</div>` : ''}
    </div>
    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:1rem">
      ${tabBtn('series','📋 Serie')}
      ${tabBtn('stats','📊 Statystyki')}
    </div>
    ${content}`;
}
function closePlayoffModal() {
  document.getElementById('playoff-modal')?.classList.remove('open');
}
function openPsnMapModal() {
  document.getElementById('psn-map-modal').classList.add('open');
  renderPsnMapModal();
}
function renderPsnMapModal(previewMethod) {
  const el = document.getElementById('psn-map-content');
  if (!el) return;
  const method = previewMethod || ovrMethod;
  const isAdmin = _isEventsAdminSync();
  const ingameNames = _dsIngameNames();

  // Zbierz wszystkich unikalnych graczy z eventów
  const seen = new Map(); // discordKey → player
  events.forEach(ev => {
    (ev.players||[]).forEach(p => {
      const key = p.discordTag || p.name;
      if (!seen.has(key)) seen.set(key, p);
    });
  });
  const allPlayers = [...seen.values()];

  // Oblicz OVR dla podglądu
  const enriched = _dsComputeOvr(allPlayers, {}, method);
  const enrichedMap = Object.fromEntries(enriched.map(p => [p.id, p]));

  const rows = allPlayers.map(p => {
    const ep = enrichedMap[p.id] || p;
    const key = p.discordTag || p.name;
    const currentPsn = discordPsnMap[key] || discordPsnMap[p.name] || ep.ingameName || '';
    const method_icon = ep.matchMethod==='manual' ? '🟢' : ep.matchMethod==='exact'||ep.matchMethod==='alias' ? '🟢' : ep.matchMethod==='fuzzy' ? '🟡' : '🔴';
    const oc = _dsOvrColor(ep.ovr);
    const opts = `<option value="">— brak —</option>` +
      ingameNames.map(n => `<option value="${n}" ${(discordPsnMap[key]||discordPsnMap[p.name]||ep.ingameName)===n?'selected':''}>${n}</option>`).join('');
    return `<tr style="border-bottom:1px solid rgba(255,255,255,.05)">
      <td style="padding:.45rem .5rem">
        <div style="display:flex;align-items:center;gap:.4rem">
          ${p.avatar?`<img src="${p.avatar}" style="width:22px;height:22px;border-radius:50%">`:`<div style="width:22px;height:22px;border-radius:50%;background:var(--surface2);font-size:.7rem;display:flex;align-items:center;justify-content:center">👤</div>`}
          <span style="font-weight:600;font-size:.85rem">${p.name}</span>
          ${p.discordTag&&p.discordTag!==p.name?`<span style="font-size:.72rem;color:var(--muted)">(${p.discordTag})</span>`:''}
        </div>
      </td>
      <td style="padding:.45rem .5rem">
        <div style="display:flex;align-items:center;gap:.35rem">
          <span title="${ep.matchMethod||'brak'}">${method_icon}</span>
          <select onchange="_psnMapSet('${key}','${p.name}',this.value)" style="font-size:.78rem;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.2rem .4rem;max-width:130px;font-family:inherit">${opts}</select>
        </div>
      </td>
      <td style="padding:.45rem .5rem;text-align:center">
        <span style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:.1rem .35rem;font-size:.72rem;font-weight:700">${ep.pos||'—'}</span>
      </td>
      <td style="padding:.45rem .5rem;font-size:.8rem;color:var(--muted);text-align:center">${ep.gp||0}</td>
      <td style="padding:.45rem .5rem;font-size:.8rem;text-align:center">${ep.ppg||0}</td>
      <td style="padding:.45rem .5rem;font-size:.8rem;text-align:center">${ep.rpg||0}</td>
      <td style="padding:.45rem .5rem;font-size:.8rem;text-align:center">${ep.apg||0}</td>
      <td style="padding:.45rem .5rem;font-size:.8rem;text-align:center">${ep.spg||0}</td>
      <td style="padding:.45rem .5rem;font-size:.8rem;text-align:center">${ep.bpg||0}</td>
      <td style="padding:.45rem .5rem;text-align:center">
        ${isAdmin && ep.ingameName ? `
          <div style="display:flex;align-items:center;gap:.2rem;justify-content:center">
            <input type="number" min="40" max="99" value="${ep.ovr}"
              style="width:44px;background:${ep.ovrOverridden?'rgba(245,197,24,.15)':'var(--surface2)'};border:1px solid ${ep.ovrOverridden?'var(--accent)':'var(--border)'};color:${oc};border-radius:4px;padding:.1rem .25rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem;text-align:center"
              onchange="_psnOvrSet('${ep.ingameName}',this.value)" onblur="_psnOvrSet('${ep.ingameName}',this.value)">
            ${ep.ovrOverridden?`<span title="Ręczny override — kliknij ✕ aby przywrócić" onclick="_psnOvrClear('${ep.ingameName}')" style="cursor:pointer;color:var(--accent);font-size:.7rem;line-height:1" >✕</span>`:''}
          </div>` : `<span style="background:${oc};color:rgba(0,0,0,.75);border-radius:4px;padding:.1rem .45rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem">${ep.ovr}</span>`}
      </td>
    </tr>`;
  }).join('');

  const ranking = _dsLeagueRanking(method);
  const rankRows = ranking.map((p,i) => {
    const oc=_dsOvrColor(p.ovr);
    return `<tr style="border-bottom:1px solid rgba(255,255,255,.05)${p.ovrOverridden?';background:rgba(245,197,24,.04)':''}">
      <td style="padding:.35rem .5rem;text-align:center;font-size:.75rem;color:var(--muted);font-weight:700">${i+1}</td>
      <td style="padding:.35rem .5rem;font-weight:600;font-size:.85rem;white-space:nowrap">${p.name}${p.ovrOverridden?'<span style="font-size:.6rem;color:var(--accent);margin-left:.3rem;vertical-align:middle" title="Ręczny OVR">M</span>':''}</td>
      <td style="padding:.35rem .5rem;text-align:center"><span style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:.1rem .3rem;font-size:.68rem;font-weight:700">${p.pos}</span></td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem;color:var(--muted)">${p.gp}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem">${p.ppg}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem">${p.rpg}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem">${p.apg}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem">${p.spg}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem">${p.bpg}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem;color:#3498db;font-weight:700">${p.per}</td>
      <td style="padding:.35rem .4rem;text-align:center;font-size:.78rem;color:var(--accent);font-weight:700">${p.cs}</td>
      <td style="padding:.35rem .4rem;text-align:center">
        ${isAdmin ? `
          <div style="display:flex;align-items:center;gap:.2rem;justify-content:center">
            <input type="number" min="40" max="99" value="${p.ovr}"
              style="width:44px;background:${p.ovrOverridden?'rgba(245,197,24,.15)':'var(--surface2)'};border:1px solid ${p.ovrOverridden?'var(--accent)':'var(--border)'};color:${oc};border-radius:4px;padding:.1rem .25rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;text-align:center"
              onchange="_psnOvrSet('${p.name}',this.value)" onblur="_psnOvrSet('${p.name}',this.value)">
            ${p.ovrOverridden?`<span title="Przywróć auto" onclick="_psnOvrClear('${p.name}')" style="cursor:pointer;color:var(--accent);font-size:.7rem">✕</span>`:''}
          </div>` :
          `<span style="background:${oc};color:rgba(0,0,0,.75);border-radius:4px;padding:.1rem .45rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem">${p.ovr}</span>`}
      </td>
    </tr>`;
  }).join('');

  const methodLabel = {classic:'Classic',positional:'Pozycyjny',kw5:'KW5',top98:'TOP 98'}[method]||method;

  el.innerHTML = `
  <!-- ══ LEWA KOLUMNA: Discord→PSN ══ -->
  <div style="width:420px;min-width:340px;display:flex;flex-direction:column;border-right:1px solid var(--border);background:var(--surface)">

    <!-- nagłówek lewej kolumny (sticky) -->
    <div style="padding:1.25rem 1.5rem 1rem;border-bottom:1px solid var(--border);flex-shrink:0">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px;color:var(--accent);margin-bottom:.15rem">🔗 POWIĄZANIA DISCORD → PSN</div>
      <div style="color:var(--muted);font-size:.78rem;margin-bottom:1rem">Przypisz nick PSN do każdego gracza Discord.</div>

      <div style="margin-bottom:.9rem">
        <div style="font-size:.65rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.45rem">METODA OVR</div>
        <div style="display:flex;flex-direction:column;gap:.3rem">
          ${[['classic','Classic','jednolite wagi, z ocenami'],['kw5','KW5 (oryginał)','bez ocen, czysto statystyczny'],['positional','Pozycyjny','wagi dostosowane do roli'],['top98','TOP 98','najlepszy na pozycji = 98']].map(([val,label,desc])=>`
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;padding:.3rem .5rem;border-radius:6px;transition:background .15s" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='transparent'">
            <input type="radio" name="ovr-method" value="${val}" ${method===val?'checked':''} onchange="_psnMethodChange('${val}')" style="accent-color:var(--accent);flex-shrink:0">
            <span style="font-size:.82rem"><b>${label}</b> <span style="color:var(--muted);font-weight:400">— ${desc}</span></span>
          </label>`).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
        <div style="font-size:.68rem;color:var(--muted)">GRACZE <b>${allPlayers.length}</b> · 🟢 pewne · 🟡 fuzzy · 🔴 brak</div>
        <div style="display:flex;gap:.4rem">
          <button onclick="_psnAutoAll()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .75rem;font-size:.75rem;cursor:pointer;font-family:inherit">🤖 Auto-dopasuj</button>
          <button onclick="_psnSave()" style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.3rem .9rem;font-size:.75rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;cursor:pointer">💾 Zapisz</button>
        </div>
      </div>
    </div>

    <!-- scrollowalna tabela Discord→PSN -->
    <div style="overflow-y:auto;flex:1">
      <table style="width:100%;border-collapse:collapse">
        <thead style="position:sticky;top:0;background:var(--surface2);z-index:1">
          <tr>${['DISCORD','PSN','POS','GP','PPG','RPG','APG','STL','BLK','OVR'].map(h=>`<th style="padding:.4rem .5rem;text-align:${h==='DISCORD'||h==='PSN'?'left':'center'};font-size:.65rem;letter-spacing:1px;color:var(--muted);white-space:nowrap">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>

  <!-- ══ PRAWA KOLUMNA: Ranking ligi ══ -->
  <div style="flex:1;display:flex;flex-direction:column;min-width:0;background:var(--bg)">

    <!-- nagłówek prawej kolumny (sticky) -->
    <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;gap:1rem">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;letter-spacing:2px">📊 RANKING WSZYSTKICH GRACZY LIGI</div>
        <div style="font-size:.75rem;color:var(--muted);margin-top:.1rem">Metoda: <b style="color:var(--accent)">${methodLabel}</b> · ${ranking.length} zawodników z historii meczów · <span style="color:var(--accent)">ligowe + playoff</span></div>
      </div>
    </div>

    <!-- scrollowalna tabela rankingu -->
    <div style="overflow-y:auto;flex:1">
      <table style="width:100%;border-collapse:collapse">
        <thead style="position:sticky;top:0;background:var(--surface2);z-index:1">
          <tr>${['#','GRACZ (PSN)','POS','GP','PPG','RPG','APG','STL','BLK','PER','CS','OVR'].map(h=>`<th style="padding:.4rem .5rem;text-align:${h==='GRACZ (PSN)'?'left':'center'};font-size:.65rem;letter-spacing:1px;color:var(--muted);white-space:nowrap">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rankRows.length ? rankRows : '<tr><td colspan="12" style="padding:2rem;text-align:center;color:var(--muted)">Brak danych z meczów.</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}
function _psnMapSet(key, fallbackKey, value) {
  if (value) {
    discordPsnMap[key] = value;
    if (fallbackKey && fallbackKey !== key) discordPsnMap[fallbackKey] = value;
  } else {
    delete discordPsnMap[key];
    if (fallbackKey && fallbackKey !== key) delete discordPsnMap[fallbackKey];
  }
}
function _psnMethodChange(method) {
  renderPsnMapModal(method); // tylko podgląd, nie zapisuje jeszcze
}
function _psnAutoAll() {
  const ingameNames = _dsIngameNames();
  const seen = new Map();
  events.forEach(ev => {
    (ev.players||[]).forEach(p => {
      const key = p.discordTag || p.name;
      if (!seen.has(key)) seen.set(key, p);
    });
  });
  seen.forEach((p, key) => {
    if (!discordPsnMap[key]) {
      const res = _dsFindIngameName(p, ingameNames, {});
      if (res && res.method !== 'none') discordPsnMap[key] = res.name;
    }
  });
  renderPsnMapModal();
  showToast('🤖 Auto-dopasowanie gotowe — sprawdź i zapisz', 'info');
}
function _psnOvrSet(psnName, rawVal) {
  const v = parseInt(rawVal, 10);
  if (!psnName || isNaN(v)) return;
  ovrOverrides[psnName] = Math.max(40, Math.min(99, v));
}
function _psnOvrClear(psnName) {
  delete ovrOverrides[psnName];
  renderPsnMapModal();
}
async function _psnSave() {
  // Zapamiętaj metodę OVR
  const selected = document.querySelector('input[name="ovr-method"]:checked');
  if (selected) {
    ovrMethod = selected.value;
    localStorage.setItem('nba2k_ovr_method', ovrMethod);
  }
  await saveData();
  showToast('✅ Powiązania, metoda OVR i ręczne overrides zapisane!', 'success');
  renderPsnMapModal();
}
function _evToggleOvr(evId) {
  _evOvr[evId] = !_evOvr[evId];
  openEventDetail(evId, 'info');
}
// Ręczna zmiana powiązania Discord→PSN dla gracza w wizardzie
function _dsSetName(playerId, ingameName) {
  _ds.nameMap[playerId] = ingameName || undefined;
  if (!ingameName) delete _ds.nameMap[playerId];
  _dsBuildPlayerPool();
  _dsRender();
}
function openDraftSetup(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  _ds.eventId = eventId;
  _ds.step = 1;
  _ds.numTeams = ev.numTeams || 4;
  _ds.perTeam = ev.perTeam || 5;
  _ds.timerSecs = ev.timerSecs || 120;
  _ds.format = ev.draftMethod || 'snake';
  _ds.teams = (ev.teams && ev.teams.length)
    ? ev.teams.map(t => ({ name: t.name, captainId: t.captain?.id || '' }))
    : Array.from({length: _ds.numTeams}, (_, i) => ({ name: 'Drużyna ' + String.fromCharCode(65+i), captainId: '' }));
  _ds.playerPool = [];
  _ds.order = [];
  if (_ds._pollId) { clearInterval(_ds._pollId); _ds._pollId = null; }
  document.getElementById('draft-setup-modal').classList.add('open');
  _dsRender();
}
function _dsClose() {
  document.getElementById('draft-setup-modal').classList.remove('open');
  if (_ds._pollId) { clearInterval(_ds._pollId); _ds._pollId = null; }
}
function _dsGradeScore(g) {
  return {'A+':100,'A':90,'A-':80,'B+':70,'B':60,'B-':50,'C+':40,'C':30,'C-':20,'D':10}[g] || 50;
}
function _dsBuildPlayerPool() {
  const ev = events.find(e=>e.id===_ds.eventId);
  if (!ev) return;
  const captainIds = new Set(_ds.teams.map(t=>t.captainId).filter(Boolean));
  const enriched = _dsComputeOvr(ev.players||[], _ds.nameMap||{});
  _ds.playerPool = enriched.map(p=>({...p,isCaptain:captainIds.has(p.id),excluded:false}));
}
function _dsBuildOrder() {
  if (!_ds.order.length)
    _ds.order = Array.from({length:_ds.numTeams},(_,i)=>i);
}
// ── nawigacja ────────────────────────────────────────────────

async function _dsNext() {
  if (_ds.step === 1) {
    _ds.numTeams = +document.getElementById('ds-numteams').value;
    _ds.perTeam  = +document.getElementById('ds-perteam').value;
    _ds.timerSecs= +document.getElementById('ds-timer').value || 120;
    _ds.format   = document.getElementById('ds-format').value;
    while (_ds.teams.length < _ds.numTeams)
      _ds.teams.push({name:'Drużyna '+String.fromCharCode(65+_ds.teams.length), captainId:''});
    _ds.teams = _ds.teams.slice(0, _ds.numTeams);
    const ev1 = events.find(e => e.id === _ds.eventId);
    if (ev1) { ev1.numTeams=_ds.numTeams; ev1.perTeam=_ds.perTeam; ev1.timerSecs=_ds.timerSecs; ev1.draftMethod=_ds.format; saveData(true); }
  } else if (_ds.step === 2) {
    for (let i=0;i<_ds.numTeams;i++) {
      const nm = document.getElementById('ds-tname-'+i)?.value?.trim();
      const cid= document.getElementById('ds-capt-'+i)?.value;
      if (nm) _ds.teams[i].name = nm;
      if (cid !== undefined) _ds.teams[i].captainId = cid;
    }
    if (_ds.teams.some(t=>!t.captainId)) { showToast('❌ Wybierz kapitana dla każdej drużyny','error'); return; }
    if (new Set(_ds.teams.map(t=>t.captainId)).size !== _ds.numTeams) { showToast('❌ Każdy kapitan może być tylko w jednej drużynie','error'); return; }
    _dsBuildPlayerPool();
  } else if (_ds.step === 3) {
    _dsReadExclusions();
    _ds.order = [];
    _dsBuildOrder();
  } else if (_ds.step === 4) {
    _dsReadOrder();
  }
  _ds.step++;
  if (_ds.step===5) _dsStartPoll();
  _dsRender();
}
function _dsBack() {
  if (_ds._pollId) { clearInterval(_ds._pollId); _ds._pollId = null; }
  _ds.step--;
  _dsRender();
}
function _dsStep(n) {
  if (_ds.step > n) { _ds.step = n; _dsRender(); }
}
function _dsReadExclusions() {
  _ds.playerPool.forEach((p,i) => {
    const cb = document.getElementById('ds-pcb-'+i);
    if (cb) p.excluded = !cb.checked;
  });
}
function _dsReadOrder() {
  const items = document.querySelectorAll('#ds-order-list .ds-oi');
  if (items.length) _ds.order = Array.from(items).map(el=>+el.dataset.idx);
}
// ── główny render ─────────────────────────────────────────────

function _dsRender() {
  const el = document.getElementById('draft-setup-content');
  if (!el) return;
  const ev = events.find(e=>e.id===_ds.eventId);
  if (!ev) return;
  const labels = ['1. CONFIG','2. TEAMS','3. PLAYERS','4. ORDER','5. LAUNCH'];
  const tabs = labels.map((s,i)=>{
    const active=_ds.step===i+1, done=_ds.step>i+1;
    return `<div onclick="${done?`_dsStep(${i+1})`:'void 0'}" style="flex:1;text-align:center;padding:.65rem .25rem;
      font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.78rem;letter-spacing:1px;
      cursor:${done?'pointer':'default'};white-space:nowrap;
      border-bottom:3px solid ${active?'var(--accent)':done?'rgba(245,197,24,.4)':'transparent'};
      color:${active?'var(--accent)':done?'rgba(245,197,24,.65)':'var(--muted)'}">${s}</div>`;
  }).join('');
  let body='';
  if (_ds.step===1) body=_dsS1(ev);
  else if (_ds.step===2) body=_dsS2(ev);
  else if (_ds.step===3) body=_dsS3(ev);
  else if (_ds.step===4) body=_dsS4();
  else if (_ds.step===5) body=_dsS5(ev);
  el.innerHTML=`
    <div style="margin-bottom:1.25rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.9rem;letter-spacing:3px;color:var(--accent)">DRAFT SETUP</div>
      <div style="color:var(--muted);font-size:.82rem">Skonfiguruj draft przed uruchomieniem.</div>
    </div>
    <div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:1.5rem">${tabs}</div>
    ${body}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--border)">
      ${_ds.step>1?`<button class="btn btn-ghost" onclick="_dsBack()">← Wstecz</button>`:`<span></span>`}
      ${_ds.step<5
        ?`<button class="btn btn-primary" onclick="_dsNext()">Dalej →</button>`
        :`<button onclick="_dsLaunch()" style="background:var(--accent);border:none;color:#000;border-radius:8px;padding:.75rem 2.5rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;cursor:pointer">🚀 LAUNCH DRAFT</button>`
      }
    </div>`;
  if (_ds.step===4) _dsInitDnD();
}
// ── krok 1: CONFIG ────────────────────────────────────────────

function _dsS1(ev) {
  const tOpts=[30,45,60,90,120,180,300].map(s=>`<option value="${s}" ${_ds.timerSecs===s?'selected':''}>${s}s</option>`).join('');
  const nOpts=Array.from({length:11},(_,i)=>i+2).map(n=>`<option value="${n}" ${_ds.numTeams===n?'selected':''}>${n} drużyny</option>`).join('');
  const pOpts=[3,4,5,6,7,8,9,10].map(n=>`<option value="${n}" ${_ds.perTeam===n?'selected':''}>${n} zawodników</option>`).join('');
  const sel = (id,opts) => `<select id="${id}" style="width:100%;margin-top:.3rem;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem .75rem;font-family:inherit;font-size:.9rem">${opts}</select>`;
  const lbl = txt => `<div style="font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted)">${txt}</div>`;
  return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1.25rem">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div>${lbl('Liczba drużyn')}${sel('ds-numteams',nOpts)}</div>
      <div>${lbl('Zawodników w drużynie')}${sel('ds-perteam',pOpts)}</div>
      <div>${lbl('Czas na pick')}${sel('ds-timer',tOpts)}</div>
      <div>${lbl('Format draftu')}
        <select id="ds-format" style="width:100%;margin-top:.3rem;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.6rem .75rem;font-family:inherit;font-size:.9rem">
          <option value="snake" ${_ds.format==='snake'?'selected':''}>🐍 Snake (zalecane)</option>
          <option value="linear" ${_ds.format==='linear'?'selected':''}>➡️ Linear</option>
        </select>
      </div>
    </div>
    <div style="margin-top:1rem;padding:.75rem;background:var(--bg);border-radius:8px;font-size:.82rem;color:var(--muted)">
      📋 <b>${ev.title}</b> &nbsp;·&nbsp; 👥 Zapisanych: ${ev.players?.length||0} graczy
    </div>
  </div>`;
}
// ── krok 2: TEAMS ─────────────────────────────────────────────

function _dsS2(ev) {
  const players = ev.players||[];
  const rows = _ds.teams.map((t,i)=>{
    const cap = players.find(p => p.id === t.captainId);
    const opts=players.map(p=>`<option value="${p.id}" ${p.id===t.captainId?'selected':''}>${p.name}${p.discordTag&&p.discordTag!==p.name?' ('+p.discordTag+')':''}</option>`).join('');
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem;background:rgba(245,197,24,.07);border-bottom:1px solid var(--border)">
        <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.9rem;letter-spacing:1px">${t.name}</span>
        ${cap?`<span style="font-size:.75rem;color:var(--accent)">🏆 kpt: ${cap.name}</span>`:`<span style="font-size:.75rem;color:var(--muted)">— brak kapitana —</span>`}
      </div>
      <div style="padding:.85rem 1rem;display:grid;grid-template-columns:1fr 1fr;gap:.75rem;align-items:end">
        <div>
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem">Nazwa drużyny</div>
          <input id="ds-tname-${i}" type="text" value="${t.name}" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.9rem;box-sizing:border-box">
        </div>
        <div>
          <div style="font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:.3rem">Kapitan</div>
          <select id="ds-capt-${i}" onchange="_dsS2Update()" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.5rem .7rem;font-family:inherit;font-size:.9rem">
            <option value="">— wybierz —</option>${opts}
          </select>
        </div>
      </div>
    </div>`;
  }).join('');
  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div style="color:var(--muted);font-size:.85rem">Wybierz kapitana każdej drużyny lub wylosuj automatycznie.</div>
    <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap">
      <select onchange="_ds.captainFilter.type=this.value;_dsRender()" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.35rem .6rem;font-size:.8rem;font-family:inherit">
        <option value="all" ${_ds.captainFilter.type==='all'?'selected':''}>Wszyscy</option>
        <option value="pos" ${_ds.captainFilter.type==='pos'?'selected':''}>Pozycja</option>
        <option value="ovr" ${_ds.captainFilter.type==='ovr'?'selected':''}>OVR</option>
      </select>
      ${_ds.captainFilter.type==='pos'?`<select onchange="_ds.captainFilter.pos=this.value" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.35rem .6rem;font-size:.8rem;font-family:inherit"><option value="">—poz—</option>${['PG','SG','SF','PF','C'].map(p=>'<option value="'+p+'" '+((_ds.captainFilter.pos===p)?'selected':'')+'>'+p+'</option>').join('')}</select>`:''}
      ${_ds.captainFilter.type==='ovr'?`<input type="number" placeholder="min" value="${_ds.captainFilter.ovrMin}" oninput="_ds.captainFilter.ovrMin=this.value" style="width:54px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.35rem .4rem;font-size:.8rem;text-align:center"><span style="color:var(--muted);font-size:.8rem">–</span><input type="number" placeholder="max" value="${_ds.captainFilter.ovrMax}" oninput="_ds.captainFilter.ovrMax=this.value" style="width:54px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.35rem .4rem;font-size:.8rem;text-align:center">`:''}
      <button onclick="_dsRandCaptains()" style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.45rem 1.1rem;font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;cursor:pointer;letter-spacing:.5px">🎲 Losuj kapitanów</button>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:.6rem">${rows}</div>`;
}
function _dsS2Update() {
  // Read all current team name + captain values into _ds, then re-render
  for(let i=0;i<_ds.numTeams;i++){
    const nm=document.getElementById('ds-tname-'+i)?.value?.trim();
    const cid=document.getElementById('ds-capt-'+i)?.value||'';
    if(nm) _ds.teams[i].name=nm;
    _ds.teams[i].captainId=cid;
  }
  _dsRender();
}
function _dsRandCaptains() {
  const ev = events.find(e=>e.id===_ds.eventId);
  if (!ev?.players?.length) return;
  let pool = [...ev.players];
  const f = _ds.captainFilter;
  if(f.type==='pos' && f.pos) {
    const filtered = pool.filter(p => p.primaryPos===f.pos || (p.positions||[]).includes(f.pos));
    if(filtered.length >= _ds.teams.length) pool = filtered;
  } else if(f.type==='ovr') {
    const min = +f.ovrMin||0, max = +f.ovrMax||99;
    const enriched = _dsComputeOvr(pool, _ds.nameMap);
    const ovrById = {};
    enriched.forEach(p => { ovrById[p.id] = p.ovr||0; });
    const filtered = pool.filter(p => { const o=ovrById[p.id]||0; return (!min||o>=min)&&(!max||o<=max); });
    if(filtered.length >= _ds.teams.length) pool = filtered;
  }
  const shuffled = pool.sort(()=>Math.random()-.5);
  const used = new Set();
  _ds.teams.forEach((t,i)=>{
    const cap = shuffled.find(p=>!used.has(p.id));
    if (cap) { t.captainId=cap.id; used.add(cap.id); }
  });
  _dsRender();
}
// ── krok 3: PLAYERS ───────────────────────────────────────────

function _dsS3(ev) {
  const posFilters=['ALL','PG','SG','SF','PF','C'];
  const filterBtns=posFilters.map(p=>`<button onclick="_dsFPos('${p}')" id="ds-fp-${p}" style="padding:.28rem .65rem;border-radius:20px;font-size:.78rem;font-weight:700;cursor:pointer;border:1px solid var(--border);background:${p==='ALL'?'var(--accent)':'var(--surface2)'};color:${p==='ALL'?'#000':'var(--text)'};font-family:'Barlow Condensed',sans-serif">${p}</button>`).join('');
  const ingameNames = _dsIngameNames();
  const rows=_ds.playerPool.map((p,i)=>{
    const oc=_dsOvrColor(p.ovr);
    const capBadge=p.isCaptain?`<span style="font-size:.6rem;background:var(--accent);color:#000;border-radius:3px;padding:.05rem .3rem;margin-left:.3rem;font-weight:900;vertical-align:middle">C</span>`:'';
    // Wskaźnik dopasowania PSN
    const mDot = p.matchMethod==='exact'||p.matchMethod==='alias'||p.matchMethod==='manual'
      ? `<span title="Dopasowano: ${p.ingameName}" style="color:#2ecc71;font-size:.8rem">●</span>`
      : p.matchMethod==='fuzzy'
        ? `<span title="Fuzzy: ${p.ingameName}" style="color:#f39c12;font-size:.8rem">●</span>`
        : `<span title="Brak dopasowania PSN" style="color:#e74c3c;font-size:.8rem">●</span>`;
    const psnOpts = `<option value="">— brak —</option>`
      + ingameNames.map(n=>`<option value="${n}" ${n===p.ingameName?'selected':''}>${n}</option>`).join('');
    return `<tr id="ds-pr-${i}" data-pos="${p.pos||'SF'}" style="border-bottom:1px solid rgba(255,255,255,.05);opacity:${p.excluded?.35:1}">
      <td style="padding:.4rem .5rem"><input type="checkbox" id="ds-pcb-${i}" ${p.excluded?'':'checked'} ${p.isCaptain?'disabled title="Kapitan zawsze w drużynie"':''} onchange="_dsTgl(${i})" style="accent-color:var(--accent)"></td>
      <td style="padding:.4rem .5rem;color:var(--muted);font-size:.78rem">${i+1}</td>
      <td style="padding:.4rem .5rem;font-weight:700;font-size:.85rem">${p.name}${capBadge}</td>
      <td style="padding:.4rem .3rem;min-width:130px">
        <div style="display:flex;align-items:center;gap:.3rem">
          ${mDot}
          <select onchange="_dsSetName('${p.id}',this.value)" style="font-size:.7rem;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:.15rem .3rem;max-width:110px;font-family:inherit">${psnOpts}</select>
        </div>
      </td>
      <td style="padding:.4rem .5rem;text-align:center"><span style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:.08rem .4rem;font-size:.72rem;font-weight:700">${p.pos||'SF'}</span></td>
      <td style="padding:.4rem .5rem;font-size:.82rem;color:var(--muted);text-align:center">${p.gp}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;text-align:center">${p.ppg}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;text-align:center">${p.rpg}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;text-align:center">${p.apg}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;text-align:center">${p.spg}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;text-align:center">${p.bpg}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;color:var(--muted);text-align:center">${p.per}</td>
      <td style="padding:.4rem .5rem;font-size:.82rem;color:var(--muted);text-align:center">${p.cs}</td>
      <td style="padding:.4rem .5rem;text-align:center"><span style="background:${oc};color:rgba(0,0,0,.75);border-radius:4px;padding:.12rem .45rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.88rem">${p.ovr}</span></td>
    </tr>`;
  }).join('');
  const active=_ds.playerPool.filter(p=>!p.excluded).length;
  const needed=_ds.numTeams*_ds.perTeam;
  return `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted)">PULA ZAWODNIKÓW</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">
      <button onclick="_dsSelAll(true)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .65rem;font-size:.75rem;cursor:pointer;font-family:inherit">Zaznacz wszystkich</button>
      <button onclick="_dsSelAll(false)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .65rem;font-size:.75rem;cursor:pointer;font-family:inherit">Odznacz wszystkich</button>
      <button onclick="_dsExclLow()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.3rem .65rem;font-size:.75rem;cursor:pointer;font-family:inherit">Wyklucz &lt;2 GP</button>
      <button onclick="_dsSavePool()" style="background:var(--accent);border:none;color:#000;border-radius:6px;padding:.3rem .65rem;font-size:.75rem;cursor:pointer;font-family:inherit;font-weight:700">💾 Zapisz</button>
    </div>
  </div>
  <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.6rem">
    ${filterBtns}
    <input id="ds-psrch" type="text" placeholder="Szukaj..." oninput="_dsSrch(this.value)" style="margin-left:.25rem;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:20px;padding:.28rem .85rem;font-family:inherit;font-size:.78rem;width:120px">
  </div>
  <div style="font-size:.75rem;color:var(--muted);margin-bottom:.6rem">
    ✅ ${active} / ${_ds.playerPool.length} zawodników &nbsp;·&nbsp; Potrzeba picków: ${needed}
    ${active<needed?`<span style="color:var(--loss)"> ⚠️ Za mało graczy!</span>`:''}
  </div>
  <div style="overflow:auto;max-height:360px;border:1px solid var(--border);border-radius:8px">
    <table style="width:100%;border-collapse:collapse;font-size:.85rem">
      <thead style="position:sticky;top:0;background:var(--surface2)">
        <tr>${['','#','GRACZ','PSN','POS','GP','PPG','RPG','APG','STL','BLK','PER','CS','OVR'].map(h=>`<th style="padding:.4rem .5rem;text-align:${h===''||h==='GRACZ'||h==='PSN'?'left':'center'};font-size:.68rem;letter-spacing:1px;color:var(--muted)">${h}</th>`).join('')}</tr>
      </thead>
      <tbody id="ds-pb">${rows}</tbody>
    </table>
  </div>`;
}
function _dsTgl(i) {
  if (_ds.playerPool[i]?.isCaptain) return;
  const cb=document.getElementById('ds-pcb-'+i);
  if (cb) { _ds.playerPool[i].excluded=!cb.checked; document.getElementById('ds-pr-'+i).style.opacity=cb.checked?'1':'.35'; }
}
function _dsSelAll(v) {
  _ds.playerPool.forEach((p,i)=>{
    if (p.isCaptain) return;
    p.excluded=!v;
    const cb=document.getElementById('ds-pcb-'+i); if(cb)cb.checked=v;
    const row=document.getElementById('ds-pr-'+i); if(row)row.style.opacity=v?'1':'.35';
  });
}
function _dsExclLow() {
  _ds.playerPool.forEach((p,i)=>{
    if (p.isCaptain||p.gp>=2) return;
    p.excluded=true;
    const cb=document.getElementById('ds-pcb-'+i); if(cb)cb.checked=false;
    const row=document.getElementById('ds-pr-'+i); if(row)row.style.opacity='.35';
  });
}
async function _dsSavePool() {
  const ev = events.find(e => e.id === _ds.eventId);
  if(!ev) return;
  // Save current draft pool (non-excluded, non-captain players) to the event
  ev.draftPool = _ds.playerPool.filter(p => !p.isCaptain && !p.excluded);
  // Also persist any manual PSN name overrides
  _ds.playerPool.forEach(p => {
    if(p.ingameName) {
      const ep = (ev.players||[]).find(x => x.id === p.id);
      if(ep) ep._psnOverride = p.ingameName;
    }
  });
  const ok = await saveData(true);
  if(ok !== false) showToast('✅ Pula graczy zapisana!', 'success');
}
function _dsFPos(pos) {
  document.querySelectorAll('[id^="ds-fp-"]').forEach(b=>{
    const p=b.id.replace('ds-fp-','');
    b.style.background=p===pos?'var(--accent)':'var(--surface2)';
    b.style.color=p===pos?'#000':'var(--text)';
  });
  document.querySelectorAll('#ds-pb tr').forEach(row=>{
    row.style.display=(pos==='ALL'||row.dataset.pos===pos)?'':'none';
  });
}
function _dsSrch(q) {
  const lq=q.toLowerCase();
  document.querySelectorAll('#ds-pb tr').forEach(row=>{
    const name=row.querySelector('td:nth-child(3)')?.textContent?.toLowerCase()||'';
    row.style.display=name.includes(lq)?'':'none';
  });
}
// ── krok 4: ORDER ─────────────────────────────────────────────

function _dsOrderHTML() {
  return _ds.order.map((ti,pos)=>{
    const t=_ds.teams[ti];
    const cap=_ds.playerPool.find(p=>p.id===t?.captainId);
    return `<div class="ds-oi" data-idx="${ti}" draggable="true" style="display:flex;align-items:center;gap:.75rem;padding:.6rem 1rem;background:var(--surface2);border:1px solid var(--border);border-radius:8px;cursor:grab;user-select:none;margin-bottom:.4rem">
      <span style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1rem;color:var(--accent);min-width:2rem">#${pos+1}</span>
      <span style="font-weight:700;font-size:.93rem;flex:1">${t?.name||'—'}${cap?`<span style="font-weight:400;font-size:.78rem;color:var(--muted);margin-left:.5rem">★ ${cap.name}</span>`:''}</span>
      <span style="color:var(--muted);font-size:1rem">⠿</span>
    </div>`;
  }).join('');
}
function _dsS4() {
  _dsBuildOrder();
  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;flex-wrap:wrap;gap:.5rem">
    <div>
      <div style="font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted)">KOLEJNOŚĆ DRAFTU — RUNDA 1</div>
      <div style="color:var(--muted);font-size:.82rem;margin-top:.2rem">Przeciągnij aby zmienić kolejność lub wylosuj.</div>
    </div>
    <button onclick="_dsRandOrder()" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.4rem .9rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.82rem;cursor:pointer">🎲 Losuj kolejność</button>
  </div>
  <div id="ds-order-list">${_dsOrderHTML()}</div>`;
}
function _dsRandOrder() {
  for (let i=_ds.order.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [_ds.order[i],_ds.order[j]]=[_ds.order[j],_ds.order[i]];
  }
  const list=document.getElementById('ds-order-list');
  if (list) { list.innerHTML=_dsOrderHTML(); _dsInitDnD(); }
}
function _dsInitDnD() {
  const list=document.getElementById('ds-order-list');
  if (!list) return;
  let drag=null;
  list.querySelectorAll('.ds-oi').forEach(el=>{
    el.addEventListener('dragstart',()=>{ drag=el; el.style.opacity='.4'; });
    el.addEventListener('dragend',()=>{ el.style.opacity='1'; });
    el.addEventListener('dragover',e=>e.preventDefault());
    el.addEventListener('drop',e=>{
      e.preventDefault();
      if (!drag||drag===el) return;
      const items=[...list.querySelectorAll('.ds-oi')];
      const si=items.indexOf(drag), di=items.indexOf(el);
      list.insertBefore(drag, si<di ? el.nextSibling : el);
      const v=_ds.order.splice(si,1)[0];
      _ds.order.splice(di,0,v);
      list.querySelectorAll('.ds-oi').forEach((item,pos)=>{
        item.querySelector('span:first-child').textContent='#'+(pos+1);
      });
    });
  });
}
// ── krok 5: LAUNCH ────────────────────────────────────────────

function _dsS5(ev) {
  const needed=_ds.numTeams*_ds.perTeam;
  const active=_ds.playerPool.filter(p=>!p.excluded).length;
  const captainRows=_ds.teams.map((t,i)=>{
    const cap=(ev.players||[]).find(p=>p.id===t.captainId);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.6rem .85rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:.4rem">
      <div style="display:flex;align-items:center;gap:.65rem">
        ${cap?.avatar?`<img src="${cap.avatar}" style="width:30px;height:30px;border-radius:50%;border:2px solid var(--border)">`
          :`<div style="width:30px;height:30px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:.85rem">👤</div>`}
        <div>
          <div style="font-weight:700;font-size:.88rem">${t.name}</div>
          <div style="font-size:.72rem;color:var(--muted)">${cap?.name||'Brak kapitana'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:.4rem">
        <div id="ds-dot-${i}" style="width:9px;height:9px;border-radius:50%;background:#555"></div>
        <span id="ds-dotlbl-${i}" style="font-size:.72rem;color:var(--muted)">Offline</span>
      </div>
    </div>`;
  }).join('');
  const wu=localStorage.getItem('nba2k_worker_url')||'';
  const _evTokStored=localStorage.getItem('nba2k_events_token_hash')||'';
  const base=`${location.origin}${location.pathname}`;
  const boardUrl=wu?`${base}?w=${encodeURIComponent(wu)}&event=${ev.id}#board`:'';
  const gmUrl=wu&&_evTokStored?`${base}?w=${encodeURIComponent(wu)}&event=${ev.id}&ev_tok=${encodeURIComponent(_evTokStored)}#gm`:'';
  const copyBtn=(label,url)=>url
    ?`<div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.4rem">
        <span style="font-size:.75rem;color:var(--muted)">${label}:</span>
        <button onclick="navigator.clipboard.writeText('${url}');showToast('Skopiowano!','success')" style="background:var(--bg);border:1px solid var(--border);color:var(--accent);border-radius:6px;padding:.22rem .65rem;font-size:.75rem;cursor:pointer;font-family:inherit;white-space:nowrap">📋 Kopiuj</button>
      </div>`:'';
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.65rem">PODSUMOWANIE</div>
      <div style="font-size:.83rem;line-height:1.9">
        📋 <b>${ev.title}</b><br>
        👥 Drużyny: <b>${_ds.numTeams}</b> &nbsp;·&nbsp; Zawodników/drużynę: <b>${_ds.perTeam}</b><br>
        ⏱️ Timer: <b>${_ds.timerSecs}s</b> &nbsp;·&nbsp; Format: <b>${_ds.format}</b><br>
        🎮 Łącznie picków: <b>${needed}</b><br>
        🏀 Graczy w puli: <b>${active}</b>
      </div>
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:.65rem">LINKI</div>
      ${copyBtn('Tablica (Board)',boardUrl)}
      ${copyBtn('Panel GM',gmUrl)}
      ${!wu?`<div style="font-size:.75rem;color:var(--muted)">Skonfiguruj Worker URL w ustawieniach aby wygenerować linki.</div>`:''}
    </div>
  </div>
  <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.65rem;flex-wrap:wrap;gap:.5rem">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted)">STATUS KAPITANÓW <span style="font-weight:400">· auto-refresh 5s</span></div>
      <div style="display:flex;gap:.4rem">
        <button onclick="_dsPollNow(this)" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:.28rem .75rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;letter-spacing:.5px">🔄 Odśwież</button>
        <button onclick="_dsNotify('${ev.id}')" style="background:var(--surface2);border:1px solid var(--accent);color:var(--accent);border-radius:6px;padding:.28rem .85rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;letter-spacing:.5px">📣 Wyślij powiadomienia</button>
      </div>
    </div>
    ${captainRows}
  </div>`;
}
async function _dsPollNow(btn) {
  if (btn) { btn.textContent='⏳'; btn.disabled=true; }
  const ev=events.find(e=>e.id===_ds.eventId);
  if (!ev) { if(btn){btn.textContent='🔄 Odśwież';btn.disabled=false;} return; }
  try {
    const wu=localStorage.getItem('nba2k_worker_url');
    if (wu) {
      const r=await fetch(wu.replace(/\/$/,'')+'/data');
      if (r.ok) {
        const d=await r.json();
        const freshEv=(d.record?.events||[]).find(e=>e.id===_ds.eventId);
        if (freshEv) {
          // Merge gmOnline from KV into local events[] so saveData doesn't overwrite it
          const localEv=events.find(e=>e.id===_ds.eventId);
          if(localEv) {
            const merged=[...new Set([...(localEv.gmOnline||[]),...(freshEv.gmOnline||[])])];
            localEv.gmOnline=merged;
            freshEv.gmOnline=merged;
          }
          // Also check gmOnlineAt on players (captain ping fallback for non-admin captains)
          const pingIds=(freshEv.players||[]).filter(p=>p.gmOnlineAt&&Date.now()-p.gmOnlineAt<120000).map(p=>p.id);
          const gmOnline=[...new Set([...(freshEv.gmOnline||[]),...pingIds])];
          _ds.teams.forEach((t,i)=>{
            const on=gmOnline.includes(t.captainId);
            const dot=document.getElementById('ds-dot-'+i);
            const lbl=document.getElementById('ds-dotlbl-'+i);
            if (dot) { dot.style.background=on?'#2ecc71':'#555'; dot.style.boxShadow=on?'0 0 6px #2ecc71':'none'; }
            if (lbl) { lbl.textContent=on?'Online':'Offline'; lbl.style.color=on?'#2ecc71':'var(--muted)'; }
          });
        }
      }
    }
  } catch(e) {}
  if (btn) { btn.textContent='🔄 Odśwież'; btn.disabled=false; }
}
function _dsStartPoll() {
  if (_ds._pollId) clearInterval(_ds._pollId);
  _dsPollNow(); // immediate first check
  _ds._pollId = setInterval(()=>_dsPollNow(), 5000);
}
async function _dsNotify(eventId) {
  const ev=events.find(e=>e.id===eventId);
  if(!ev) return;
  // Save captain assignments to ev.teams so the notification modal can read them
  ev.teams = _ds.order.map(ti => {
    const t = _ds.teams[ti];
    const cap = (ev.players||[]).find(p => p.id === t.captainId);
    return {name: t.name, captain: cap, players: cap ? [cap] : []};
  });
  await saveData(true);
  openCaptainNotifModal(eventId);
}
async function _dsLaunch() {
  const ev=events.find(e=>e.id===_ds.eventId);
  if (!ev) return;
  ev.numTeams=_ds.numTeams;
  ev.perTeam=_ds.perTeam;
  ev.timerSecs=_ds.timerSecs;
  ev.draftMethod=_ds.format;
  // Drużyny w kolejności draftu
  ev.teams=_ds.order.map(ti=>{
    const t=_ds.teams[ti];
    const cap=(ev.players||[]).find(p=>p.id===t.captainId);
    return {name:t.name, captain:cap, players:cap?[cap]:[]};
  });
  // Pula graczy (bez kapitanów, bez wykluczonych)
  const capIds=new Set(ev.teams.map(t=>t.captain?.id).filter(Boolean));
  ev.draftPool=_ds.playerPool.filter(p=>!p.isCaptain&&!p.excluded);
  ev.draftTurn=0;
  ev.draftOrder=buildDraftOrder(_ds.format,_ds.numTeams,ev.draftPool.length);
  ev.status='draft';
  ev.draftPaused=true;
  ev.timerEnd=null;
  // Tokenów NIE zapisujemy w danych eventu (dane ligi są publiczne) — GM loguje się hasłem draftu
  delete ev.eventsToken;
  await saveData();
  await _evdInit(ev);
  if (_ds._pollId) { clearInterval(_ds._pollId); _ds._pollId=null; }
  document.getElementById('draft-setup-modal').classList.remove('open');
  renderEvents();
  showToast('✅ Draft załadowany — kliknij ▶ Start gdy GMowie są gotowi','success');
  const eid=_ds.eventId;
  setTimeout(()=>openDraftView(eid),150);
}
