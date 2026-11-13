/*@v:8c0d81398d*/
async function toggleChallenges() {
  if(!confirm(window._challengesOff ? 'Włączyć wyzwania miesiąca dla wszystkich?' : 'Wyłączyć wyzwania miesiąca dla wszystkich?')) return;
  window._challengesOff = !window._challengesOff;
  if(await saveData(true)) { renderMyPanelView(); showToast(window._challengesOff ? 'Wyzwania wyłączone' : '🏅 Wyzwania włączone', 'success'); }
}
function _wgData(week) {
  const sid = currentSeasonId || null;
  const fx = schedule.filter(s => s.generated && !s.makeup && (s.seasonId || null) === sid && +s.week === +week);
  const all = _withAllMatches(() => matches.slice());
  const byId = new Map(all.map(m => [String(m.id), m]));
  const gsOf = p => (+p.pts || 0) + 0.4 * (+p.fgm || 0) - 0.7 * (+p.fga || 0) - 0.4 * ((+p.fta || 0) - (+p.ftm || 0)) + 0.4 * (+p.reb || 0) + 0.7 * (+p.ast || 0) + (+p.stl || 0) + (+p.blk || 0) - (+p.to || 0);
  const agg = list => { const by = {}; list.forEach(({ p, team }) => { const k = _normNick(p.name); if(!k) return;
      const a = by[k] = by[k] || { name: p.name, team, gp: 0, gs: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0 };
      a.gp++; a.gs += gsOf(p); ['pts', 'reb', 'ast', 'stl', 'blk', 'to', 'fgm', 'fga', 'tpm', 'tpa'].forEach(f => { a[f] += +p[f] || 0; }); });
    return Object.values(by).map(a => ({ ...a, avgGs: a.gs / a.gp })).sort((x, y) => y.avgGs - x.avgGs); };
  const weekPerf = [], weekGames = [];
  const series = fx.map(s => {
    const ms = (s.matchIds || []).map(id => byId.get(String(id))).filter(Boolean);
    let w1 = 0, w2 = 0; const scores = [], perf = [];
    ms.forEach(m => {
      const sw = m.team1.name === s.team2; const a = sw ? m.team2 : m.team1, b = sw ? m.team1 : m.team2;
      +a.score > +b.score ? w1++ : w2++; scores.push(m.walkover ? 'w/o' : `${a.score}:${b.score}`); if (!m.walkover) weekGames.push(m); // walkower: do wyniku serii, nie do statystyk tygodnia
      [[a, b], [b, a]].forEach(([t, o]) => (t.players || []).forEach(p => { perf.push({ p, team: t.name }); weekPerf.push({ p, team: t.name, opp: o.name, won: +t.score > +o.score, gs: gsOf(p) }); }));
    });
    const msPlayed = ms.filter(m => !m.walkover), tot = msPlayed.reduce((n, m) => n + (+m.team1.score) + (+m.team2.score), 0);
    const players = agg(perf);
    return { t1: s.team1, t2: s.team2, w1, w2, games: ms.length, scores, avgTeam: msPlayed.length ? tot / msPlayed.length / 2 : null, mvp: players[0] || null, top: players.slice(1, 4), walkover: !!s.walkover };
  });
  // ciekawostki z całego tygodnia
  const wk = agg(weekPerf.map(x => ({ p: x.p, team: x.team })));
  const best = [...weekPerf].sort((a, b) => b.gs - a.gs)[0];
  const tens = p => ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => (+p[k] || 0) >= 10).length;
  const td = weekPerf.filter(x => tens(x.p) >= 3), dd = weekPerf.filter(x => tens(x.p) === 2);
  const sniper = wk.filter(a => a.fga >= 10).sort((a, b) => b.fgm / b.fga - a.fgm / a.fga)[0];
  const brick = (() => { const by = {}; weekGames.forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { const k = String(p.name).toLowerCase(), a = by[k] = by[k] || { name: p.name, team: t.name, fgm: 0, fga: 0, gp: 0 }; a.fgm += +p.fgm || 0; a.fga += +p.fga || 0; a.gp++; }))); return Object.values(by).filter(a => a.fga / a.gp >= 8).sort((a, b) => a.fgm / a.fga - b.fgm / b.fga || (b.fga - b.fgm) - (a.fga - a.fgm))[0]; })(); // cegła tygodnia = najgorszy % z gry w całej kolejce (min. średnio 8 rzutów na mecz — 1 i 2 mecze liczą się tak samo)
  const margins = weekGames.map(m => ({ m, d: Math.abs(m.team1.score - m.team2.score) }));
  const blow = [...margins].sort((a, b) => b.d - a.d)[0], close = [...margins].sort((a, b) => a.d - b.d)[0];
  const totPts = weekGames.reduce((n, m) => n + (+m.team1.score) + (+m.team2.score), 0);
  const lead = f => [...wk].sort((a, b) => b[f] / b.gp - a[f] / a.gp)[0];
  const seasonName = _seasonName(sid) || '';
  return { week: +week, season: _wgLang === 'en' ? seasonName.replace(/^Sezon/i, 'Season') : seasonName, series, games: weekGames.length,
    facts: { best, td, dd, sniper, brick, blow, close, totPts, avgTeam: weekGames.length ? totPts / weekGames.length / 2 : 0, avgGame: weekGames.length ? totPts / weekGames.length : 0, lead: { pts: lead('pts'), reb: lead('reb'), ast: lead('ast') } } };
}
async function _wgBackground(g, W, H) {
  if(_wgBgMode === 'custom') {
    const src = localStorage.getItem('nba2k_wg_bg'), img = src ? await _ssLoadImg(src) : null;
    if(img) {
      const sc = Math.max(W / img.width, H / img.height), iw = img.width * sc, ih = img.height * sc;
      g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      const ov = g.createLinearGradient(0, 0, 0, H); ov.addColorStop(0, 'rgba(0,0,0,.25)'); ov.addColorStop(.3, 'rgba(0,0,0,.45)'); ov.addColorStop(1, 'rgba(0,0,0,.55)');
      g.fillStyle = ov; g.fillRect(0, 0, W, H);
      return;
    }
  }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // baza
  const base = g.createLinearGradient(0, 0, 0, H); base.addColorStop(0, '#070b18'); base.addColorStop(.6, '#05070d'); base.addColorStop(1, '#020305');
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  // światła trybun (bokeh)
  for(let k = 0; k < 220; k++) { const x = rnd() * W, y = rnd() * H * .55, r = 1 + rnd() * 3.5, left = x < W / 2;
    g.fillStyle = `rgba(${left ? '120,170,255' : '255,140,140'},${.05 + rnd() * .22})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.save(); g.globalCompositeOperation = 'lighter';
  // reflektory (snopy)
  const beam = (x, y, ang, len, wid, col) => { g.save(); g.translate(x, y); g.rotate(ang);
    const gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, col.replace('A', '.55')); gr.addColorStop(1, col.replace('A', '0'));
    g.fillStyle = gr; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(wid, len); g.lineTo(-wid, len); g.closePath(); g.fill(); g.restore(); };
  beam(120, -20, -0.35, 900, 180, 'rgba(40,110,255,A)'); beam(330, -20, -0.05, 800, 120, 'rgba(60,140,255,A)');
  beam(W - 120, -20, 0.35, 900, 180, 'rgba(255,40,50,A)'); beam(W - 330, -20, 0.05, 800, 120, 'rgba(255,70,70,A)');
  // neonowe poświaty
  const glow = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  glow(80, 160, 520, 'rgba(30,90,255,.55)'); glow(W - 80, 160, 520, 'rgba(255,30,40,.55)');
  glow(W / 2, H * .62, 520, 'rgba(255,255,255,.06)');
  g.restore();
  // parkiet w perspektywie z odbiciami neonów
  const fy = H * .66;
  const fl = g.createLinearGradient(0, fy, 0, H); fl.addColorStop(0, '#1a1210'); fl.addColorStop(1, '#0b0706'); g.fillStyle = fl; g.fillRect(0, fy, W, H - fy);
  g.save(); g.globalCompositeOperation = 'lighter';
  glow(220, fy + 70, 380, 'rgba(40,110,255,.30)'); glow(W - 220, fy + 70, 380, 'rgba(255,40,50,.30)');
  g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2;
  for(let k = -14; k <= 14; k++) { g.beginPath(); g.moveTo(W / 2 + k * 30, fy); g.lineTo(W / 2 + k * 160, H); g.stroke(); } // deski
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 3;
  g.beginPath(); g.ellipse(W / 2, fy + 120, 420, 70, 0, Math.PI, 0, true); g.stroke(); // łuk za 3
  g.beginPath(); g.moveTo(W / 2 - 150, fy + 4); g.lineTo(W / 2 - 230, H); g.moveTo(W / 2 + 150, fy + 4); g.lineTo(W / 2 + 230, H); g.stroke(); // trumna
  g.beginPath(); g.ellipse(W / 2, fy + 130, 120, 26, 0, 0, Math.PI * 2); g.stroke();
  g.restore();
  // obręcze: tablica + obręcz + siatka
  const hoop = (x, y, col, flip) => {
    g.save(); g.shadowColor = col; g.shadowBlur = 30; g.strokeStyle = col; g.lineWidth = 5;
    g.strokeRect(x - 95, y - 70, 190, 120); g.lineWidth = 3; g.strokeRect(x - 34, y - 25, 68, 50);
    g.lineWidth = 6; g.strokeStyle = '#ff8a2a'; g.shadowColor = '#ff8a2a'; g.beginPath(); g.ellipse(x, y + 62, 46, 11, 0, 0, Math.PI * 2); g.stroke();
    g.shadowBlur = 8; g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 1.6;
    for(let k = 0; k <= 8; k++) { const a = -46 + k * 11.5; g.beginPath(); g.moveTo(x + a, y + 64); g.quadraticCurveTo(x + a * .7, y + 100, x + a * .45, y + 130); g.stroke(); }
    for(let r = 0; r < 4; r++) { g.beginPath(); g.ellipse(x, y + 76 + r * 17, 46 - r * 6, 6, 0, 0, Math.PI); g.stroke(); }
    g.restore();
  };
  hoop(170, 70, '#3b82f6'); hoop(W - 170, 70, '#ef4444');
  // piłka (prawy górny róg)
  const bx = W - 70, by = 40, br = 120;
  g.save(); g.shadowColor = 'rgba(255,90,40,.8)'; g.shadowBlur = 50;
  const bg = g.createRadialGradient(bx - 40, by - 40, 10, bx, by, br); bg.addColorStop(0, '#ff9a4a'); bg.addColorStop(.6, '#e2541c'); bg.addColorStop(1, '#7a2306');
  g.fillStyle = bg; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.clip(); g.strokeStyle = 'rgba(30,10,5,.85)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(bx - br, by); g.lineTo(bx + br, by); g.stroke(); g.beginPath(); g.moveTo(bx, by - br); g.lineTo(bx, by + br); g.stroke();
  g.beginPath(); g.arc(bx - br * 1.15, by, br * .95, -0.9, 0.9); g.stroke(); g.beginPath(); g.arc(bx + br * 1.15, by, br * .95, Math.PI - 0.9, Math.PI + 0.9); g.stroke();
  g.restore();
  // mgiełka i iskry
  g.save(); g.globalAlpha = .08; for(let k = 0; k < 6; k++) glow(rnd() * W, H * (.25 + rnd() * .4), 240 + rnd() * 200, 'rgba(200,210,255,1)'); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 2;
  for(let k = 0; k < 40; k++) { const left = k % 2 === 0, x = left ? rnd() * 380 : W - rnd() * 380, y = 120 + rnd() * 500, l = 8 + rnd() * 22;
    g.strokeStyle = left ? `rgba(120,180,255,${.3 + rnd() * .5})` : `rgba(255,120,120,${.3 + rnd() * .5})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (left ? l : -l) * .4, y - l); g.stroke(); }
  g.restore();
  // winieta
  const vg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
async function _wgHeader(g, W, title, sub, season) {
  const F = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  g.font = `900 92px ${F}`; const tw = g.measureText(title).width; g.font = `900 44px ${F}`; const sw = g.measureText(sub).width;
  const x0 = W / 2 - 220 - (tw + 28 + sw) / 2;
  g.save(); g.translate(x0, 98); g.transform(1, 0, -0.18, 1, 0, 0); g.textAlign = 'left';
  const grd = g.createLinearGradient(0, -70, 0, 10); grd.addColorStop(0, '#ffffff'); grd.addColorStop(1, '#b9c1cf');
  g.font = `900 92px ${F}`; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText(title, 0, 0); g.fillStyle = grd; g.fillText(title, 0, 0);
  g.font = `900 44px ${F}`; g.fillStyle = '#f5c518'; g.fillText(sub, tw + 28, -6);
  g.restore();
  const logo = /^https?:/.test(location.protocol) ? await _ssLoadImg('icons/icon-192.png') : null; // z dysku (file://) obrazek zablokowałby zapis grafiki
  if(logo) g.drawImage(logo, W - 330, 30, 80, 80);
  g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.9)'; g.font = `800 22px ${F}`; g.fillText('2K PRO-AM', W - 342, 62); g.fillStyle = '#f5c518'; g.fillText('EKSTRAKLASA', W - 342, 88);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 18px ${F}`; g.fillText(season, W - 342, 110); g.textAlign = 'left';
}
function _wgRound(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
function _wgFit(g, s, max, size, weight = 800) { const F = "'Barlow Condensed', 'Arial Narrow', sans-serif"; g.font = `${weight} ${size}px ${F}`; while(g.measureText(s).width > max && size > 11) { size--; g.font = `${weight} ${size}px ${F}`; } return size; }
async function _wgLogo(g, name, cx, cy, r) {
  const img = await _ssLoadImg(_ssLogoSrc(name));
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.closePath();
  if(img) { g.clip(); g.drawImage(img, cx - r, cy - r, r * 2, r * 2); }
  else { g.fillStyle = teamColor(name); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `900 ${Math.round(r * .8)}px 'Barlow Condensed', sans-serif`; g.fillText(teamInitials(name), cx, cy + r * .28); }
  g.restore();
}
async function _wgSeriesImage(d, page, pages) {
  const W = 1600, H = 900, F = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  try { await document.fonts?.ready; } catch(e) {}
  await _wgBackground(g, W, H);
  await _wgHeader(g, W, `WEEK ${d.week}`, pages > 1 ? `${_wgT('WYNIKI', 'RESULTS')} ${page}/${pages}` : _wgT('PODSUMOWANIE', 'RESULTS SUMMARY'), d.season);
  const list = d.series.slice((page - 1) * 4, page * 4);
  const cols = list.length === 1 ? 1 : 2, gap = 22, top = 150, cw = cols === 1 ? 900 : (W - 3 * gap) / 2, ch = list.length > 2 ? (H - top - 2 * gap - 20) / 2 : 560;
  const stat = (x, v, l, col, y) => { g.textAlign = 'center'; g.fillStyle = col || '#fff'; g.font = `800 22px ${F}`; g.fillText(v, x, y); g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `700 12px ${F}`; g.fillText(l, x, y + 15); };
  for(let i = 0; i < list.length; i++) {
    const s = list[i], acc = WG_ACCENTS[((page - 1) * 4 + i) % WG_ACCENTS.length];
    const x = cols === 1 ? (W - cw) / 2 : gap + (i % 2) * (cw + gap), y = top + Math.floor(i / 2) * (ch + gap);
    g.save(); g.shadowColor = acc; g.shadowBlur = 24; _wgRound(g, x, y, cw, ch, 18); g.fillStyle = 'rgba(8,11,19,.8)'; g.fill(); g.restore();
    _wgRound(g, x, y, cw, ch, 18); g.lineWidth = 2.5; g.strokeStyle = acc; g.stroke();
    const tint = g.createLinearGradient(x, y, x, y + 130); tint.addColorStop(0, acc + '33'); tint.addColorStop(1, 'rgba(0,0,0,0)'); _wgRound(g, x, y, cw, 130, 18); g.fillStyle = tint; g.fill();
    // drużyny i wynik
    await _wgLogo(g, s.t1, x + 92, y + 58, 44); await _wgLogo(g, s.t2, x + cw - 92, y + 58, 44);
    g.textAlign = 'center'; g.fillStyle = '#fff';
    g.font = `800 ${_wgFit(g, s.t1.toUpperCase(), 200, 20)}px ${F}`; g.fillText(s.t1.toUpperCase(), x + 92, y + 122);
    g.font = `800 ${_wgFit(g, s.t2.toUpperCase(), 200, 20)}px ${F}`; g.fillText(s.t2.toUpperCase(), x + cw - 92, y + 122);
    g.save(); g.shadowColor = acc; g.shadowBlur = 18; g.font = `900 78px ${F}`; g.fillStyle = '#fff'; g.fillText(s.games ? `${s.w1} : ${s.w2}` : (s.walkover ? 'WO' : '—'), x + cw / 2, y + 78); g.restore();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `700 16px ${F}`;
    g.fillText(s.games ? `${s.games} ${_wgGames(s.games)} · ${s.scores.join(' · ')}` : _wgT('NIE ROZEGRANO', 'NOT PLAYED'), x + cw / 2, y + 104);
    if(s.avgTeam) { g.fillStyle = acc; g.font = `800 15px ${F}`; g.fillText(_wgT(`ŚR. ${_wgNum(s.avgTeam)} PKT DRUŻYNY NA MECZ`, `AVG ${_wgNum(s.avgTeam)} PTS PER TEAM PER GAME`), x + cw / 2, y + 124); }
    if(!s.mvp) continue;
    // MVP serii
    const statCols = [['pts', 'PTS'], ['reb', _wgT('ZB', 'REB')], ['ast', _wgT('AS', 'AST')], ['stl', _wgT('PRZ', 'STL')], ['blk', _wgT('BL', 'BLK')]];
    const sx = x + cw - 372, sw = 62;
    const row = (p, yy, big) => { statCols.forEach(([f, l], k) => stat(sx + k * sw, _wgNum(p[f] / p.gp), l, big && k === 0 ? '#f5c518' : '#fff', yy)); stat(sx + 5 * sw, _wgPct(p.fgm, p.fga), 'FG%', '#fff', yy); };
    const my = y + 140;
    _wgRound(g, x + 14, my, cw - 28, 54, 12); g.fillStyle = 'rgba(245,197,24,.08)'; g.fill(); g.strokeStyle = '#f5c518'; g.lineWidth = 1.5; g.stroke();
    g.textAlign = 'left'; g.font = `900 20px ${F}`; g.fillStyle = '#f5c518'; g.fillText(_wgT('👑 MVP SERII', '👑 SERIES MVP'), x + 26, my + 34);
    const nx = x + 26 + g.measureText(_wgT('👑 MVP SERII', '👑 SERIES MVP')).width + 18;
    g.fillStyle = '#fff'; g.font = `800 ${_wgFit(g, s.mvp.name, sx - nx - 34, 22)}px ${F}`; g.fillText(s.mvp.name, nx, my + 26);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `700 ${_wgFit(g, `${s.mvp.team.toUpperCase()} · ${s.mvp.gp} ${_wgGames(s.mvp.gp)}`, sx - nx - 34, 13, 700)}px ${F}`; g.fillText(`${s.mvp.team.toUpperCase()} · ${s.mvp.gp} ${_wgGames(s.mvp.gp)}`, nx, my + 44);
    row(s.mvp, my + 30, true);
    // wyróżnieni
    const ty = my + 66;
    g.fillStyle = acc; g.font = `900 14px ${F}`; g.textAlign = 'left'; g.fillText(_wgT('WYRÓŻNIENI', 'STANDOUTS'), x + 28, ty + 12);
    const wx = x + 28 + g.measureText(_wgT('WYRÓŻNIENI', 'STANDOUTS')).width + 10;
    g.fillStyle = 'rgba(255,255,255,.4)'; g.font = `700 12px ${F}`; g.fillText(_wgT('· ŚREDNIO NA MECZ', '· PER GAME'), wx, ty + 12);
    const rowH = Math.min(40, (y + ch - ty - 24) / 3);
    s.top.forEach((p, k) => {
      const yy = ty + 22 + k * rowH;
      _wgRound(g, x + 14, yy, cw - 28, rowH - 6, 10); g.fillStyle = 'rgba(255,255,255,.045)'; g.fill();
      g.beginPath(); g.arc(x + 38, yy + (rowH - 6) / 2, 13, 0, Math.PI * 2); g.fillStyle = ['#e5e7eb', '#cd7f32', '#94a3b8'][k]; g.fill();
      g.fillStyle = '#111'; g.textAlign = 'center'; g.font = `900 15px ${F}`; g.fillText(String(k + 2), x + 38, yy + (rowH - 6) / 2 + 5);
      g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = `800 ${_wgFit(g, p.name, sx - (x + 64) - 34, 18)}px ${F}`; g.fillText(p.name, x + 62, yy + 16);
      g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `700 12px ${F}`; g.fillText(p.team.toUpperCase(), x + 62, yy + 30);
      row(p, yy + 19, false);
    });
  }
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `700 16px ${F}`; g.fillText(_wgT('Pełne statystyki: ', 'Full stats: ') + (location.host || 'chemikleagues.com').replace(/^www\./, ''), W / 2, H - 10);
  return c.toDataURL('image/png');
}
async function _wgFactsImage(d) {
  const W = 1600, H = 900, F = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  try { await document.fonts?.ready; } catch(e) {}
  await _wgBackground(g, W, H);
  await _wgHeader(g, W, `WEEK ${d.week}`, _wgT('CIEKAWOSTKI', 'FUN FACTS'), d.season);
  const f = d.facts, L = f.lead;
  const line = p => p ? _wgT(`${+p.pts || 0} pkt · ${+p.reb || 0} zb. · ${+p.ast || 0} as.${p.fga ? ` · ${+p.fgm || 0}/${p.fga} z gry` : ''}`, `${+p.pts || 0} pts · ${+p.reb || 0} reb · ${+p.ast || 0} ast${p.fga ? ` · ${p.fgm}/${p.fga} FG` : ''}`) : '';
  const wfirst = x => { if(!x) return ''; const [a, b] = +x.m.team1.score >= +x.m.team2.score ? [x.m.team1, x.m.team2] : [x.m.team2, x.m.team1]; return `${a.name} ${a.score}:${b.score}\n${b.name}`; };
  const fg = (a, b2) => _wgT(`${a}/${b2} z gry`, `${a}/${b2} FG`);
  const tiles = [
    ['🔥', _wgT('WYSTĘP TYGODNIA', 'PERFORMANCE OF THE WEEK'), f.best?.p.name, f.best ? `${line(f.best.p)}\nvs ${f.best.opp}` : '', '#f97316'],
    ['📊', _wgT('ŚREDNIO W MECZU', 'AVERAGE PER GAME'), f.avgGame ? `${_wgNum(f.avgGame)} ${_wgT('pkt', 'pts')}` : '—', _wgT(`${_wgNum(f.avgTeam)} pkt na drużynę\nłącznie ${f.totPts} pkt w ${d.games} ${_plPL(d.games, 'meczu', 'meczach', 'meczach')}`, `${_wgNum(f.avgTeam)} pts per team\n${f.totPts} pts in ${d.games} ${d.games === 1 ? 'game' : 'games'}`), '#3b82f6'],
    ['🎯', _wgT('SNAJPER TYGODNIA', 'SHARPSHOOTER'), f.sniper?.name || '—', f.sniper ? `${fg(f.sniper.fgm, f.sniper.fga)} (${_wgPct(f.sniper.fgm, f.sniper.fga)})\n${f.sniper.team}` : _wgT('min. 10 rzutów', 'min. 10 shots'), '#22c55e'],
    ['🔺', 'TRIPLE / DOUBLE-DOUBLE', `${f.td.length} / ${f.dd.length}`, (f.td.length ? 'TD: ' + [...new Set(f.td.map(x => x.p.name))].join(', ') + '\n' : '') + (f.dd.length ? 'DD: ' + [...new Set(f.dd.map(x => x.p.name))].slice(0, 3).join(', ') + (f.dd.length > 3 ? '…' : '') : ''), '#a855f7'],
    ['💥', _wgT('NAJWYŻSZA WYGRANA', 'BIGGEST WIN'), f.blow ? `+${f.blow.d}` : '—', wfirst(f.blow), '#ef4444'],
    ['😬', _wgT('NAJBLIŻSZY MECZ', 'CLOSEST GAME'), f.close ? `+${f.close.d}` : '—', wfirst(f.close), '#06b6d4'],
    ['🧱', _wgT('CEGŁA TYGODNIA', 'BRICK OF THE WEEK'), f.brick?.name || '—', f.brick ? `${fg(f.brick.fgm, f.brick.fga)} (${_wgPct(f.brick.fgm, f.brick.fga)})\n${_wgT('obręcz prosi o urlop', 'the rim needs a vacation')}` : _wgT('min. 12 rzutów', 'min. 12 shots'), '#fb923c'],
    ['👑', _wgT('LIDERZY (ŚR./MECZ)', 'LEADERS (PER GAME)'), '', [L.pts && `${_wgT('PKT', 'PTS')}: ${L.pts.name} ${_wgNum(L.pts.pts / L.pts.gp)}`, L.reb && `${_wgT('ZB', 'REB')}: ${L.reb.name} ${_wgNum(L.reb.reb / L.reb.gp)}`, L.ast && `${_wgT('AS', 'AST')}: ${L.ast.name} ${_wgNum(L.ast.ast / L.ast.gp)}`].filter(Boolean).join('\n'), '#f5c518']
  ];
  const gap = 22, top = 160, tw = (W - 5 * gap) / 4, th = (H - top - 3 * gap - 20) / 2;
  tiles.forEach(([ic, title, big, desc, acc], i) => {
    const x = gap + (i % 4) * (tw + gap), y = top + Math.floor(i / 4) * (th + gap);
    g.save(); g.shadowColor = acc; g.shadowBlur = 20; _wgRound(g, x, y, tw, th, 18); g.fillStyle = 'rgba(8,11,19,.8)'; g.fill(); g.restore();
    _wgRound(g, x, y, tw, th, 18); g.lineWidth = 2; g.strokeStyle = acc; g.stroke();
    g.textAlign = 'left'; g.font = `400 40px ${F}`; g.fillStyle = '#fff'; g.fillText(ic, x + 22, y + 58);
    g.fillStyle = acc; g.font = `900 ${_wgFit(g, title, tw - 100, 22, 900)}px ${F}`; g.fillText(title, x + 78, y + 50);
    const lines = String(desc || '').split('\n').filter(Boolean), lh = big ? 32 : 40, bigH = big ? 74 : 0;
    const blockH = bigH + lines.length * lh, cy = y + 80 + (th - 80 - blockH) / 2;
    if(big) { g.fillStyle = '#fff'; g.font = `900 ${_wgFit(g, big, tw - 44, 70, 900)}px ${F}`; g.fillText(big, x + 22, cy + 58); }
    lines.forEach((ln, k) => { const fs = big ? 24 : 30; g.fillStyle = big ? 'rgba(255,255,255,.75)' : '#fff'; g.font = `700 ${_wgFit(g, ln, tw - 44, fs, 700)}px ${F}`; g.fillText(ln, x + 22, cy + bigH + 24 + k * lh); });
  });
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `700 16px ${F}`; g.fillText(_wgT('🎧 Podcast i pełne statystyki: ', '🎧 Podcast & full stats: ') + (location.host || 'chemikleagues.com').replace(/^www\./, ''), W / 2, H - 10);
  return c.toDataURL('image/png');
}
function _wgTweet(d, noTags) {
  const short = n => n.replace(/^Polish /i, '').replace(/ Esports$/i, '').replace(/ BC$/i, '');
  const regsX = typeof teamRegistrations !== 'undefined' ? teamRegistrations : (typeof regs !== 'undefined' ? regs : []);
  const tag = n => { const h = noTags ? null : regsX.find(r => r.status === 'approved' && String(r.teamName).toLowerCase() === String(n).toLowerCase() && r.xHandle && r.xHandle !== '-')?.xHandle; return h ? '@' + h : short(n); };
  const res = d.series.filter(s => s.games).map(s => `${tag(s.t1)} ${s.w1}:${s.w2} ${tag(s.t2)}`).join(' · ');
  const b = d.facts.best;
  const avgLine = _wgT(`\n📊 Średnio ${_wgNum(d.facts.avgGame)} pkt w meczu`, `\n📊 ${_wgNum(d.facts.avgGame)} pts per game on average`);
  let t = _wgT(`🏀 Week ${d.week} — podsumowanie #2KEkstraklasa\n\n${res}\n\n🔥 Występ tygodnia: ${b ? `${b.p.name} (${+b.p.pts || 0} pkt, ${+b.p.reb || 0} zb., ${+b.p.ast || 0} as.)` : '—'}${avgLine}\n\n#NBA2K27 #ProAm`,
    `🏀 Week ${d.week} results #2KEkstraklasa\n\n${res}\n\n🔥 Performance of the week: ${b ? `${b.p.name} (${+b.p.pts || 0} pts, ${+b.p.reb || 0} reb, ${+b.p.ast || 0} ast)` : '—'}${avgLine}\n\n#NBA2K27 #ProAm`);
  if(t.length > 280) t = t.replace(avgLine, '');
  if(t.length > 280 && !noTags) return _wgTweet(d, true); // za długo z @profilami → wersja z nazwami
  return t.slice(0, 280);
}
async function openWeekGraphics() {
  const sid = currentSeasonId || null;
  const weeks = [...new Set(schedule.filter(x => x.generated && (x.seasonId || null) === sid && x.week).map(x => +x.week))].sort((a, b) => a - b);
  const m = _fxModal('wg-modal', 900), box = m.querySelector('.modal');
  box.innerHTML = _fxHead('wg-modal', '🖼 Podsumowanie kolejki') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">Grafiki 1600×900 (16:9 — tak Twitter pokazuje obrazki w podglądzie): wyniki serii z MVP i wyróżnionymi (średnie na mecz) oraz ciekawostki tygodnia. Plus gotowy tekst tweeta.</div>
    <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.8rem"><select id="wg-week" style="${_MODAL_INP};width:auto">${weeks.map(w => `<option value="${w}">Week ${w}</option>`).join('')}</select>
      <select id="wg-lang" style="${_MODAL_INP};width:auto" data-notr><option value="pl">🇵🇱 Polski</option><option value="en">🇬🇧 English</option></select>
      <select id="wg-bg" style="${_MODAL_INP};width:auto" onchange="wgBgMode(this.value)"><option value="arena" ${_wgBgMode !== 'custom' ? 'selected' : ''}>🏟 Tło: Arena</option><option value="custom" ${_wgBgMode === 'custom' ? 'selected' : ''}>🖼 Tło: własne</option></select>
      <label class="btn btn-ghost" style="font-size:.72rem;margin:0;cursor:pointer;${_wgBgMode === 'custom' ? '' : 'display:none'}" id="wg-bg-up">⬆ ${localStorage.getItem('nba2k_wg_bg') ? 'Zmień tło' : 'Wgraj tło'}<input type="file" accept="image/*" style="display:none" onchange="wgBgUpload(this.files[0])"></label>
      <button class="btn btn-primary" onclick="weekGraphicsGen()">🖼 Generuj</button>
      <button class="btn btn-ghost" onclick="shareLink('w', document.getElementById('wg-week').value, 'Week ' + document.getElementById('wg-week').value)" title="Link z podglądem grafiki — do wklejenia na X / Discord">🔗 Link</button></div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .75rem;margin-bottom:.8rem;font-size:.76rem">
      <b>🤖 Przez bota (PL + EN naraz, tło Arena)</b> — 4 grafiki i teksty tweetów w jednej wiadomości:
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem">
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="weekGraphicsBot(true)">🧪 Do mnie (DM)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="weekGraphicsBot(false)">📣 Na kanał podsumowania tygodnia</button>
        <button class="btn btn-ghost" style="font-size:.72rem" title="Ponowna publikacja samej Piątki tygodnia — bez wyników, ciekawostek i bez nowych kart limitowanych" onclick="weekGraphicsBot(true, true)">🏀 Tylko Piątka → do mnie (DM)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" title="Ponowna publikacja samej Piątki tygodnia — bez wyników, ciekawostek i bez nowych kart limitowanych" onclick="weekGraphicsBot(false, true)">🏀 Tylko Piątka → na kanał</button>
      </div><div id="wg-bot-status" style="margin-top:.3rem;min-height:1em"></div>
    </div>
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .75rem;margin-bottom:.8rem;font-size:.76rem">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><b>🐦 X (Twitter)</b><span id="wg-x-acc" style="color:var(--muted)">⏳ sprawdzam ustawienia…</span></div>
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.45rem">
        <label style="display:flex;align-items:center;gap:.35rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0;cursor:pointer"><input type="checkbox" id="wg-x-auto" onchange="xSettingsSave()" style="width:auto;margin:0;accent-color:var(--accent)"> publikuj automatycznie po podcaście</label>
        <select id="wg-x-lang" onchange="xSettingsSave()" style="${_MODAL_INP};width:auto;font-size:.74rem;padding:.2rem .4rem" data-notr><option value="both">🇵🇱 + 🇬🇧 (EN jako odpowiedź)</option><option value="pl">🇵🇱 tylko polski</option><option value="en">🇬🇧 tylko angielski</option></select>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.45rem">
        <select id="wg-x-mode" onchange="xSettingsSave()" style="${_MODAL_INP};width:auto;font-size:.74rem;padding:.2rem .4rem"><option value="direct">${_g('⚡ Publikuj od razu', '⚡ Post immediately')}</option><option value="review">${_g('👀 Przez kolejkę akceptacji', '👀 Via the review queue')}</option></select>
        <input id="wg-x-eds" placeholder="${_g('Redaktorzy X — Discord ID po przecinku', 'X editors — Discord IDs, comma-separated')}" onchange="xSettingsSave()" style="${_MODAL_INP};flex:1;min-width:220px;font-size:.74rem;padding:.25rem .45rem">
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="openXQueue()">🐦 ${_g('Kolejka', 'Queue')}</button>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.45rem">
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="xCheck()">🔌 Sprawdź połączenie</button>
        <button class="btn btn-primary" style="font-size:.72rem" onclick="xPublishNow()">🐦 Opublikuj tę kolejkę na X teraz</button>
      </div>
      <div id="wg-x-status" style="margin-top:.3rem;min-height:1em"></div>
    </div>
    <div id="wg-out"></div>`;
  _api('/x-settings', 'POST', {}, { admin: true }).then(r => { if(!r.ok) return; const a = document.getElementById('wg-x-auto'), l = document.getElementById('wg-x-lang'), acc = document.getElementById('wg-x-acc');
    if(a) a.checked = !!r.settings?.auto; if(l) l.value = r.settings?.lang || 'both';
    const md = document.getElementById('wg-x-mode'), ed = document.getElementById('wg-x-eds'); if(md) md.value = r.settings?.mode || 'direct'; if(ed) ed.value = (r.settings?.editors || []).join(', '); if(acc) acc.textContent = 'kliknij „Sprawdź połączenie”, żeby zobaczyć konto'; });
  m.classList.add('open');
}
async function weekGraphicsGen() {
  const week = +document.getElementById('wg-week').value, out = document.getElementById('wg-out');
  out.innerHTML = '<div style="color:var(--muted)">⏳ Rysuję…</div>';
  _wgLang = document.getElementById('wg-lang')?.value === 'en' ? 'en' : 'pl';
  const d = _wgData(week);
  if(!d.series.length) { out.innerHTML = '<div style="color:var(--loss)">Brak meczów w tej kolejce</div>'; return; }
  const pages = Math.max(1, Math.ceil(d.series.length / 4)), imgs = [];
  for(let p = 1; p <= pages; p++) imgs.push({ name: `week-${week}-${_wgT('wyniki', 'results')}${pages > 1 ? '-' + p : ''}.png`, url: await _wgSeriesImage(d, p, pages) });
  imgs.push({ name: `week-${week}-${_wgT('ciekawostki', 'fun-facts')}.png`, url: await _wgFactsImage(d) });
  window._wgImgs = imgs; window._wgText = _wgTweet(d);
  out.innerHTML = imgs.map((im, i) => `<div style="margin-bottom:.8rem"><img src="${im.url}" style="width:100%;border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;gap:.4rem;margin-top:.35rem"><a class="btn btn-ghost" style="font-size:.72rem;text-decoration:none" href="${im.url}" download="${im.name}">⬇ Pobierz PNG</a>
      <button class="btn btn-ghost" style="font-size:.72rem" onclick="weekGraphicDiscord(${i})">📣 Wyślij na Discord</button></div></div>`).join('') + `
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.4rem 0 .3rem">🐦 TEKST TWEETA (${window._wgText.length}/280)</div>
    <textarea id="wg-tweet" rows="7" style="${_MODAL_INP};font-size:.82rem;line-height:1.45">${_h(window._wgText)}</textarea>
    <div style="display:flex;gap:.4rem;margin-top:.4rem"><button class="btn btn-primary" style="font-size:.74rem" onclick="navigator.clipboard?.writeText(document.getElementById('wg-tweet').value).then(()=>showToast('📋 Skopiowano tekst','success'))">📋 Kopiuj tekst</button>
      <a class="btn btn-ghost" style="font-size:.74rem;text-decoration:none" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(window._wgText)}">🐦 Otwórz na Twitterze</a></div>
    <div style="font-size:.68rem;color:var(--muted);margin-top:.3rem">Twitter nie pozwala dołączyć obrazków przez link — pobierz PNG i przeciągnij je do okna tweeta (do 4 obrazków).</div>`;
}
async function xSettingsSave() {
  const auto = document.getElementById('wg-x-auto').checked, lang = document.getElementById('wg-x-lang').value;
  const mode = document.getElementById('wg-x-mode')?.value || 'direct', editors = (document.getElementById('wg-x-eds')?.value || '').split(/[,\s]+/).map(x => x.trim()).filter(Boolean);
  const r = await _api('/x-settings', 'POST', { auto, lang, mode, editors }, { admin: true });
  showToast(r.ok ? (auto ? '🐦 Automatyczna publikacja na X włączona' : 'Zapisano ustawienia X') : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
async function xCheck() {
  const st = document.getElementById('wg-x-status'), acc = document.getElementById('wg-x-acc');
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Łączę się z X…';
  const r = await _api('/x-settings', 'POST', { test: true }, { admin: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? `✅ Połączono — bot publikuje jako @${r.username}` : '❌ ' + (r.error || 'Brak połączenia');
  if(r.ok && acc) acc.innerHTML = `konto: <a href="https://x.com/${_h(r.username)}" target="_blank" rel="noopener" style="color:var(--accent)">@${_h(r.username)}</a>`;
}
async function xPublishNow() {
  const week = +document.getElementById('wg-week').value, lang = document.getElementById('wg-x-lang').value, st = document.getElementById('wg-x-status');
  if(!confirm(`Opublikować grafiki Week ${week} na X (${lang === 'both' ? 'PL + EN' : lang.toUpperCase()})? Tweeta nie da się cofnąć z tego miejsca.`)) return;
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Bot publikuje na X…';
  const r = await _api('/week-graphics', 'POST', { week, x: true, lang, discord: false, seasonId: currentSeasonId || null }, { admin: true, session: !!discordUser?.session });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? '✅ Zlecone — za kilka sekund tweet będzie na koncie (link przyjdzie Ci w DM).' : '❌ ' + (r.error || 'Błąd');
}
async function weekGraphicsBot(test, onlyTow) {
  const week = +document.getElementById('wg-week').value, st = document.getElementById('wg-bot-status');
  if(test && !_ensureSession()) return;
  if(!test && !confirm(onlyTow ? `Opublikować ponownie Piątkę tygodnia Week ${week} (PL + EN) na kanale podsumowania tygodnia? Bez wyników, ciekawostek i bez nowych kart limitowanych.` : `Wysłać grafiki Week ${week} (PL + EN) na kanał Discord?`)) return;
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Zlecam botowi…';
  const r = await _api('/week-graphics', 'POST', { week, test, seasonId: currentSeasonId || null, ...(onlyTow ? { onlyTow: true } : {}) }, { admin: true, session: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? `✅ Bot rysuje grafiki Week ${week} — za kilka sekund ${test ? 'przyjdą w DM' : 'pojawią się na kanale'}.` : '❌ ' + (r.error || 'Błąd');
}
function wgBgMode(v) {
  _wgBgMode = v === 'custom' ? 'custom' : 'arena'; localStorage.setItem('nba2k_wg_bgmode', _wgBgMode);
  const up = document.getElementById('wg-bg-up'); if(up) up.style.display = _wgBgMode === 'custom' ? '' : 'none';
  if(_wgBgMode === 'custom' && !localStorage.getItem('nba2k_wg_bg')) showToast('Wgraj grafikę tła (najlepiej 16:9, np. 1600×900)', 'info');
}
// własne tło: dopasowane do 1600×900 i zapisane jako JPEG (mieści się w pamięci przeglądarki)
async function wgBgUpload(file) {
  if(!file) return;
  const img = await _ssLoadImg(URL.createObjectURL(file)); if(!img) { showToast('Nie udało się wczytać obrazka', 'error'); return; }
  const c = document.createElement('canvas'); c.width = 1600; c.height = 900; const g = c.getContext('2d');
  const sc = Math.max(1600 / img.width, 900 / img.height); g.drawImage(img, (1600 - img.width * sc) / 2, (900 - img.height * sc) / 2, img.width * sc, img.height * sc);
  try { localStorage.setItem('nba2k_wg_bg', c.toDataURL('image/jpeg', 0.86)); } catch(e) { showToast('Obrazek jest za duży — spróbuj mniejszego pliku', 'error'); return; }
  showToast('🖼 Tło zapisane', 'success');
  const up = document.getElementById('wg-bg-up'); if(up) up.firstChild.textContent = '⬆ Zmień tło';
  if(window._wgImgs) weekGraphicsGen();
}
async function weekGraphicDiscord(i) {
  const im = window._wgImgs?.[i]; if(!im) return;
  if(!confirm('Wysłać tę grafikę na kanał Discord (podsumowanie tygodnia)?')) return;
  const ok = await _discordPost('schedule', { route: 'weekSummary', content: i === window._wgImgs.length - 1 ? '📊 **Ciekawostki tygodnia**' : '🏀 **Podsumowanie kolejki**' }, im.url, im.name);
  showToast(ok ? '📣 Wysłano na Discord' : '❌ Discord nie przyjął grafiki', ok ? 'success' : 'error');
}
async function _pcImage(d, lang, withAvatar) {
  const W = 1080, H = 1350, F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'"; // emoji na końcu — cyfry zawsze ze zwykłej czcionki
  const T = (pl, en) => lang === 'en' ? en : pl, num = v => { const r = Math.round(v * 10) / 10; const s = Number.isInteger(r) ? String(r) : r.toFixed(1); return lang === 'en' ? s : s.replace('.', ','); };
  const c = __mkCanvas(W, H), g = c.getContext('2d'), [tPl, tEn, c1, c2] = d.tier, tc = teamColor(d.team);
  // tło: kolor drużyny + poświata poziomu
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#05070d'); bg.addColorStop(.5, tc + '55'); bg.addColorStop(1, '#05070d'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  glow(W / 2, 430, 620, c1 + '55'); glow(W, 0, 500, tc + '66');
  g.save(); g.globalAlpha = .07; g.strokeStyle = '#fff'; g.lineWidth = 2; for(let x = -H; x < W; x += 40) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.stroke(); } g.restore();
  // ramka karty
  const fr = g.createLinearGradient(0, 0, W, H); fr.addColorStop(0, c1); fr.addColorStop(.5, c2); fr.addColorStop(1, c1);
  g.lineWidth = 14; g.strokeStyle = fr; g.beginPath(); g.roundRect(30, 30, W - 60, H - 60, 46); g.stroke();
  g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.roundRect(52, 52, W - 104, H - 104, 34); g.stroke();
  // ocena i pozycja (lewy górny róg)
  g.textAlign = 'center'; g.fillStyle = c2; g.font = `900 170px ${F}`; g.fillText(String(d.rating), 190, 230);
  g.fillStyle = '#fff'; g.font = `900 60px ${F}`; g.fillText(d.pos, 190, 300);
  g.fillStyle = c1; g.font = `800 34px ${F}`; g.fillText(T('OCENA', 'RATING'), 190, 345);
  // herb drużyny (prawy górny róg)
  const logo = await _ssLoadImg(_ssLogoSrc(d.team));
  g.save(); g.beginPath(); g.arc(W - 200, 200, 120, 0, Math.PI * 2); g.closePath(); g.lineWidth = 8; g.strokeStyle = c1; g.stroke(); g.clip();
  if(logo) g.drawImage(logo, W - 320, 80, 240, 240); else { g.fillStyle = tc; g.fill(); g.fillStyle = '#fff'; g.font = `900 100px ${F}`; g.fillText(teamInitials(d.team), W - 200, 236); }
  g.restore();
  // avatar z Discorda (opcjonalnie) — na środku, w ramce w kolorze poziomu
  if(withAvatar && d.avatar) {
    const av = await _ssLoadImg(d.avatar);
    if(av) {
      g.save(); g.shadowColor = c1; g.shadowBlur = 30; g.beginPath(); g.arc(W / 2, 205, 128, 0, Math.PI * 2); g.fillStyle = fr; g.fill(); g.restore();
      g.save(); g.beginPath(); g.arc(W / 2, 205, 118, 0, Math.PI * 2); g.clip(); g.drawImage(av, W / 2 - 118, 87, 236, 236); g.restore();
    }
  }
  // poziom karty
  g.save(); g.fillStyle = c1; g.beginPath(); g.roundRect(W / 2 - 160, 380, 320, 56, 28); g.fill(); g.fillStyle = '#0b0e14'; g.font = `900 34px ${F}`; g.fillText('⭐ ' + (lang === 'en' ? tEn : tPl), W / 2, 420); g.restore();
  // nick
  const fit = (s, max, size) => { g.font = `900 ${size}px ${F}`; while(g.measureText(s).width > max && size > 40) { size -= 4; g.font = `900 ${size}px ${F}`; } return size; };
  g.save(); g.shadowColor = c1; g.shadowBlur = 30; g.fillStyle = '#fff'; g.font = `900 ${fit(d.name.toUpperCase(), W - 160, 140)}px ${F}`; g.fillText(d.name.toUpperCase(), W / 2, 565); g.restore();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.font = `800 40px ${F}`; g.fillText(`${d.team.toUpperCase()} · ${d.gp} ${T(d.gp === 1 ? 'MECZ' : d.gp % 10 >= 2 && d.gp % 10 <= 4 && (d.gp % 100 < 12 || d.gp % 100 > 14) ? 'MECZE' : 'MECZÓW', d.gp === 1 ? 'GAME' : 'GAMES')} · ${d.w}-${d.gp - d.w}`, W / 2, 620);
  const sk = d.sk;
  if(sk) { g.fillStyle = c1; g.font = `800 36px ${F}`; g.fillText(`🧬 ${(lang === 'en' ? sk.arch.en : sk.arch.pl).toUpperCase()}${sk.form ? `   ${sk.form.icon} ${(lang === 'en' ? sk.form.en : sk.form.pl).toUpperCase()}` : ''}`, W / 2, 672); }
  // statystyki 4×2 (średnio na mecz + skuteczność)
  const st = [[num(d.ppg), 'PTS'], [num(d.rpg), T('ZB', 'REB')], [num(d.apg), T('AS', 'AST')], [num(d.spg), T('PRZ', 'STL')],
    [num(d.bpg), T('BL', 'BLK')], [num(d.tpg || 0), T('STR', 'TOV')], [d.fg == null ? '—' : Math.round(d.fg * 100) + '%', 'FG%'], [d.tp == null ? '—' : Math.round(d.tp * 100) + '%', '3P%']];
  st.forEach(([v, l], i) => { const x = 180 + (i % 4) * 240, y = 790 + Math.floor(i / 4) * 150;
    g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.roundRect(x - 108, y - 78, 216, 128, 20); g.fill();
    g.fillStyle = '#fff'; g.font = `900 ${v.length > 4 ? 56 : 66}px ${F}`; g.fillText(v, x, y); g.fillStyle = c1; g.font = `800 28px ${F}`; g.fillText(l, x, y + 36); });
  // 📊 oceny umiejętności A+…F (względem ligi)
  if(sk) {
    const n = _PC_SK.length, tw = (W - 120 - (n - 1) * 10) / n;
    _PC_SK.forEach(([kk, ic, pl, en], i) => { const x = 60 + i * (tw + 10), a = sk.attrs[kk];
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(x, 1015, tw, 118, 16); g.fill(); g.strokeStyle = _PC_GCOL(a.g) + '88'; g.lineWidth = 2; g.stroke();
      const lb = `${ic} ${lang === 'en' ? en : pl}`; let ls = 22; g.font = `800 ${ls}px ${F}`; while(g.measureText(lb).width > tw - 12 && ls > 12) { ls--; g.font = `800 ${ls}px ${F}`; }
      g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(lb, x + tw / 2, 1047);
      g.fillStyle = _PC_GCOL(a.g); g.font = `900 58px ${F}`; g.fillText(a.g, x + tw / 2, 1110); });
  }
  // 🏅 odznaki (3 najmocniejsze)
  const LV = ['', '🥉', '🥈', '🥇', '💎'];
  const chips = sk && sk.badges.length ? sk.badges.slice(0, 3).map(b => `${LV[b.l]} ${b.icon} ${(lang === 'en' ? b.en : b.pl).toUpperCase()}`) : [`🔥 ${T('REKORD', 'HIGH')} ${d.high} PTS`, d.td ? `🔺 ${d.td} TRIPLE-DOUBLE` : null, d.dd ? `💪 ${d.dd} DOUBLE-DOUBLE` : null].filter(Boolean);
  g.font = `800 30px ${F}`; let cw = chips.map(t => g.measureText(t).width + 44), tot = cw.reduce((a, b) => a + b, 0) + (chips.length - 1) * 14;
  if(tot > W - 100) { g.font = `800 24px ${F}`; cw = chips.map(t => g.measureText(t).width + 36); tot = cw.reduce((a, b) => a + b, 0) + (chips.length - 1) * 12; }
  let cx = W / 2 - tot / 2;
  chips.forEach((t, i) => { g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.roundRect(cx, 1160, cw[i], 56, 28); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(t, cx + cw[i] / 2 - (cw[i] - (tot > W - 100 ? 36 : 44)) / 2, 1198); g.textAlign = 'center'; cx += cw[i] + 14; });
  g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 26px ${F}`; g.fillText(`${T('Najlepszy mecz', 'Best game')}: ${d.best.line} vs ${d.best.vs}`, W / 2, 1243);
  const scopeTxt = d.scope.includes('|') ? d.scope.split('|')[lang === 'en' ? 1 : 0] : d.scope;
  const foot = `${scopeTxt.toUpperCase()} · 2K PRO-AM EKSTRAKLASA · ${SITE_HOST.toUpperCase()}`;
  let fs = 30; g.font = `800 ${fs}px ${F}`; while(g.measureText(foot).width > W - 150 && fs > 18) { fs--; g.font = `800 ${fs}px ${F}`; }
  g.fillStyle = c1; g.fillText(foot, W / 2, 1275);
  return await __encode(c);
}
// PCARD>>


// 🔗 link do udostępnienia z podglądem (gracz / drużyna / kolejka) — Worker serwuje opis i grafikę dla Discorda, X, Messengera
function _shareUrl(kind, key, lang) { return (localStorage.getItem('nba2k_share_base') || workerUrl || '').replace(/\/+$/, '') + `/s/${kind}/${encodeURIComponent(key)}${lang === 'en' ? '?l=en' : ''}`; }
async function shareLink(kind, key, label) {
  const url = _shareUrl(kind, key);
  try { if(navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { await navigator.share({ title: label || '2K Pro-Am Ekstraklasa', url }); return; } } catch(e) {}
  try { await navigator.clipboard.writeText(url); showToast('🔗 Skopiowano link — po wklejeniu na Discordzie czy X pokaże się podgląd z grafiką', 'success'); } catch(e) { prompt('Skopiuj link:', url); }
}
async function openPlayerCardImg(name) {
  if(!_pcData(name, 'career')) { showToast('Brak meczów tego gracza', 'info'); return; }
  const m = _fxModal('pcard-modal', 520), box = m.querySelector('.modal');
  box.innerHTML = _fxHead('pcard-modal', '🃏 Karta gracza') + `
    <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.6rem"><select id="pc-scope" style="${_MODAL_INP};width:auto" onchange="pcRender('${_h(name).replace(/'/g, "\\'")}')"><option value="season">📅 Bieżący sezon</option><option value="edition">🎮 Edycja (${_h(_editionOf(currentSeasonId))})</option><option value="career">🏆 Kariera</option></select>
      <label id="pc-av-wrap" style="display:flex;align-items:center;gap:.3rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0;cursor:pointer"><input type="checkbox" id="pc-av" checked onchange="pcRender(this.dataset.n)" data-n="${_h(name)}" style="width:auto;margin:0;accent-color:var(--accent)"> 🖼 Avatar z Discorda</label><select id="pc-lang" style="${_MODAL_INP};width:auto" onchange="pcRender('${_h(name).replace(/'/g, "\\'")}')" data-notr><option value="pl">🇵🇱 Polski</option><option value="en">🇬🇧 English</option></select></div>
    <div id="pc-out" style="text-align:center;color:var(--muted)">⏳ Rysuję…</div>`;
  m.classList.add('open');
  pcRender(name);
}
async function pcRender(name) {
  try { await document.fonts?.ready; } catch(e) {}
  const lang = document.getElementById('pc-lang')?.value || 'pl', scope = document.getElementById('pc-scope')?.value || 'season', d = _pcData(name, scope);
  if(!d) { document.getElementById('pc-out').innerHTML = `<div style="padding:1.5rem 0;color:var(--muted)">Brak meczów w tym zakresie — wybierz ${scope === 'season' ? 'Edycję albo Karierę' : 'Karierę'}.</div>`; return; }
  const avWrap = document.getElementById('pc-av-wrap'); if(avWrap) avWrap.style.display = d.avatar ? '' : 'none';
  const wantAv = !!d.avatar && document.getElementById('pc-av')?.checked !== false;
  let url;
  try { url = await _pcImage(d, lang, wantAv); } catch(e) { url = await _pcImage(d, lang, false); } // obrazek bez zgody CORS → karta bez avatara
  window._pcLast = { url, name: d.name, lang };
  const holoP = { GALAKTYKA: 1, DIAMENT: .75 }[d.tier?.[0]] || 0; // holo tylko dla rzadkich kart: galaktyka i diament (oraz limitowane)
  if(holoP) setTimeout(() => _holoBind(document.getElementById('pc-out')), 0);
  document.getElementById('pc-out').innerHTML = `<div style="max-width:420px;margin:0 auto">${holoP ? _holoHtml(url, d.name, holoP) : `<img src="${url}" alt="${_h(d.name)}" style="width:100%;border-radius:14px;display:block">`}</div>
    <div style="display:flex;gap:.4rem;justify-content:center;margin-top:.6rem;flex-wrap:wrap">
      <a class="btn btn-primary" style="font-size:.74rem;text-decoration:none" href="${url}" download="karta-${_normNick(d.name)}-${lang}.png">⬇ Pobierz</a>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="openCardCompare(this.dataset.n,'')" data-n="${_h(d.name)}">⚖️ ${_g('Porównaj', 'Compare')}</button>
      ${_isLoggedInSync() ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="pcToDiscord()">📣 Wyślij na Discord</button>` : ''}
    </div>
    <div style="font-size:.68rem;color:var(--muted);margin-top:.4rem">Poziom karty zależy od oceny formy: 🥉 brąz · 🥈 srebro · 🥇 złoto · 💎 diament · 🌌 galaktyka. Na Discordzie: <code>/karta ${_h(d.name)}</code></div>`;
}
async function pcToDiscord() {
  const c = window._pcLast; if(!c) return;
  const ok = await _discordPost('schedule', { route: 'achievement', content: `🃏 **Karta gracza: ${c.name}**` }, c.url, `karta-${_normNick(c.name)}.png`);
  showToast(ok ? '📣 Wysłano na Discord' : '❌ Discord nie przyjął grafiki', ok ? 'success' : 'error');
}
async function _tradesLoad() { const r = await _api('/trades', 'GET', null, {}); if(r.ok) _tradesState = { window: r.window || {}, trades: r.trades || [] }; return _tradesState; }
async function openTrades() {
  const m = _fxModal('trades-modal', 720); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('trades-modal', '🔁 Okno transferowe') + '<div style="color:var(--muted)">⏳</div>';
  await _tradesLoad(); renderTrades();
}
function renderTrades() {
  const box = document.querySelector('#trades-modal .modal'); if(!box) return;
  const { window: w, trades } = _tradesState, me = _myCapReg(), admin = _isLoggedInSync();
  const stLbl = { pending: ['⏳ czeka na odpowiedź', 'var(--muted)'], accepted: ['🤝 przyjęta — czeka na admina', '#f59e0b'], approved: ['✅ zatwierdzona', 'var(--win)'], rejected: ['❌ odrzucona', 'var(--loss)'], declined: ['❌ odrzucona przez admina', 'var(--loss)'], cancelled: ['↩ anulowana', 'var(--muted)'] };
  const card = t => { const [lb, col] = stLbl[t.status] || [t.status, 'var(--muted)'];
    const btns = [];
    if(t.status === 'pending' && me && me.teamName === t.toTeam) btns.push(`<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="tradeAct('respond','${t.id}',true)">🤝 Akceptuję</button><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem;color:var(--loss)" onclick="tradeAct('respond','${t.id}',false)">❌ Odrzucam</button>`);
    if(t.status === 'pending' && t.by?.id === discordUser?.id) btns.push(`<button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="tradeAct('cancel','${t.id}')">↩ Anuluj</button>`);
    if(t.status === 'accepted' && admin) btns.push(`<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="tradeAct('decide','${t.id}',true)">✅ Zatwierdź wymianę</button><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem;color:var(--loss)" onclick="tradeAct('decide','${t.id}',false)">❌ Odrzuć</button>`);
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.6rem .8rem">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.6rem;align-items:center">
        <div><div style="font-weight:800">${_emoHtml(t.fromTeam)}${_h(t.fromTeam)}</div><div style="font-size:.78rem;color:var(--muted)">oddaje: <b style="color:var(--text)">${t.give.map(_h).join(', ')}</b></div></div>
        <div style="font-size:1.4rem">⇄</div>
        <div style="text-align:right"><div style="font-weight:800">${_h(t.toTeam)}</div><div style="font-size:.78rem;color:var(--muted)">oddaje: <b style="color:var(--text)">${t.get.map(_h).join(', ')}</b></div></div>
      </div>
      ${t.note ? `<div style="font-size:.76rem;margin-top:.35rem">💬 ${_h(t.note)}</div>` : ''}
      <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap;align-items:center;margin-top:.4rem"><span style="font-size:.72rem;color:${col};font-weight:700">${lb}</span><span style="font-size:.68rem;color:var(--muted)">${new Date(t.createdAt).toLocaleDateString('pl-PL')} · ${_h(t.by?.name || '')}</span></div>
      ${btns.length ? `<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.45rem">${btns.join('')}</div>` : ''}
    </div>`; };
  const regsNow = teamRegistrations.filter(r => r.status === 'approved' && (!r.seasonId || r.seasonId === (currentSeasonId || r.seasonId)));
  const mine = me ? trades.filter(t => t.fromTeam === me.teamName || t.toTeam === me.teamName) : [];
  const toAdmin = admin ? trades.filter(t => t.status === 'accepted') : [];
  const recent = trades.filter(t => t.status === 'approved').slice(0, 8);
  box.innerHTML = _fxHead('trades-modal', '🔁 Okno transferowe') + `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;background:${w.active ? 'rgba(34,197,94,.1)' : 'var(--surface2)'};border:1px solid ${w.active ? 'rgba(34,197,94,.4)' : 'var(--border)'};border-radius:10px;padding:.55rem .8rem;margin-bottom:.8rem">
      <b>${w.active ? `🟢 Okno otwarte${w.until ? ' do ' + _h(w.until) : ''}` : '🔒 Okno zamknięte'}</b>
      ${admin ? `<span style="display:flex;gap:.35rem;align-items:center;flex-wrap:wrap"><input type="date" id="tw-until" value="${_h(w.until || '')}" style="${_MODAL_INP};width:auto;font-size:.74rem;padding:.2rem .35rem">
        <button class="btn ${w.active ? 'btn-ghost' : 'btn-primary'}" style="font-size:.7rem" onclick="tradeWindow(${!w.active})">${w.active ? '🔒 Zamknij' : '🟢 Otwórz'} okno</button></span>` : ''}
    </div>
    ${toAdmin.length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f59e0b;margin-bottom:.35rem">🛡 DO ZATWIERDZENIA (${toAdmin.length})</div><div style="display:flex;flex-direction:column;gap:.45rem;margin-bottom:.9rem">${toAdmin.map(card).join('')}</div>` : ''}
    ${me && w.active ? `<details ${mine.some(t => t.status === 'pending') ? '' : 'open'} style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.6rem .8rem;margin-bottom:.9rem">
      <summary style="cursor:pointer;font-weight:800">➕ Nowa propozycja wymiany (${_h(me.teamName)})</summary>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-top:.6rem">
        <div><div style="font-size:.72rem;color:var(--muted);margin-bottom:.3rem">Oddajesz (1–3):</div>${(me.players || []).map(p => `<label style="display:flex;gap:.35rem;align-items:center;font-size:.8rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .2rem;cursor:pointer"><input type="checkbox" class="tw-give" value="${_h(p.gamertag)}" style="width:auto;margin:0;accent-color:var(--accent)"> ${_h(p.gamertag)}</label>`).join('')}</div>
        <div><select id="tw-team" onchange="renderTradeTargets()" style="${_MODAL_INP};font-size:.78rem;margin-bottom:.35rem">${regsNow.filter(r => r.id !== me.id).map(r => `<option value="${_h(r.teamName)}">${_h(r.teamName)}</option>`).join('')}</select><div id="tw-get"></div></div>
      </div>
      <input id="tw-note" maxlength="200" placeholder="Wiadomość do kapitana (opcjonalnie)" style="${_MODAL_INP};font-size:.8rem;margin-top:.5rem">
      <button class="btn btn-primary" style="margin-top:.5rem;font-size:.76rem" onclick="tradePropose()">🔁 Wyślij propozycję</button>
    </details>` : me ? '' : `<div style="font-size:.78rem;color:var(--muted);margin-bottom:.8rem">Wymiany proponują kapitanowie drużyn (zaloguj się przez Discord).</div>`}
    ${mine.length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">MOJA DRUŻYNA</div><div style="display:flex;flex-direction:column;gap:.45rem;margin-bottom:.9rem">${mine.slice(0, 10).map(card).join('')}</div>` : ''}
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">✅ OSTATNIE WYMIANY</div>
    <div style="display:flex;flex-direction:column;gap:.45rem">${recent.map(card).join('') || '<div style="font-size:.8rem;color:var(--muted)">Jeszcze nie było wymian.</div>'}</div>`;
  renderTradeTargets();
}
function _emoHtml(team) { return ''; }
function renderTradeTargets() {
  const sel = document.getElementById('tw-team'), out = document.getElementById('tw-get'); if(!sel || !out) return;
  const r = teamRegistrations.find(x => x.status === 'approved' && x.teamName === sel.value);
  out.innerHTML = `<div style="font-size:.72rem;color:var(--muted);margin-bottom:.3rem">Chcesz w zamian (1–3):</div>` + (r?.players || []).map(p => `<label style="display:flex;gap:.35rem;align-items:center;font-size:.8rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .2rem;cursor:pointer"><input type="checkbox" class="tw-get" value="${_h(p.gamertag)}" style="width:auto;margin:0;accent-color:var(--accent)"> ${_h(p.gamertag)}</label>`).join('');
}
async function tradePropose() {
  const give = [...document.querySelectorAll('.tw-give:checked')].map(x => x.value), get = [...document.querySelectorAll('.tw-get:checked')].map(x => x.value);
  if(!give.length || !get.length || give.length > 3 || get.length > 3) { showToast('Wybierz 1–3 graczy z każdej strony', 'info'); return; }
  const toTeam = document.getElementById('tw-team').value;
  if(!confirm(`Wysłać propozycję: oddajesz ${give.join(', ')} za ${get.join(', ')} (${toTeam})?`)) return;
  const r = await _api('/trades', 'POST', { toTeam, give, get, note: document.getElementById('tw-note').value.trim() }, { session: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  showToast('🔁 Propozycja wysłana — kapitan dostał wiadomość na Discordzie', 'success'); await _tradesLoad(); renderTrades();
}
async function tradeAct(kind, id, yes) {
  const msg = { respond: yes ? 'Przyjąć tę wymianę? Potem zatwierdzi ją admin.' : 'Odrzucić tę propozycję?', cancel: 'Anulować propozycję?', decide: yes ? 'Zatwierdzić wymianę? Gracze od razu zmienią drużyny, a transfery zostaną ogłoszone.' : 'Odrzucić wymianę?' }[kind];
  if(!confirm(msg)) return;
  showToast(kind === 'decide' ? (yes ? '⏳ Zatwierdzam wymianę…' : '⏳ Odrzucam…') : '⏳ Zapisuję…', 'info');
  document.querySelectorAll(`[onclick*="tradeAct("][onclick*="${id}"]`).forEach(b => { b.disabled = true; });
  const r = await _api('/trades/' + kind, 'POST', { id, accept: yes, approve: yes }, kind === 'decide' ? { admin: true } : { session: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); document.querySelectorAll(`[onclick*="tradeAct("][onclick*="${id}"]`).forEach(b => { b.disabled = false; }); return; }
  if(kind === 'decide' && yes) { showToast('✅ Wymiana zatwierdzona — składy zmienione, ogłoszenie transferów idzie na Discord', 'success'); await loadData(); } else showToast('Zapisano', 'success');
  await _tradesLoad(); renderTrades();
}
async function tradeWindow(open) {
  const until = document.getElementById('tw-until')?.value || null, announce = confirm(open ? 'Ogłosić otwarcie okna transferowego na Discordzie?' : 'Ogłosić zamknięcie okna na Discordzie?');
  const r = await _api('/trades/window', 'POST', { open, until, announce }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  _tradesState.window = r.window; renderTrades();
}
// ═══ 🎖 GALA SEZONU — plansza zwycięzców (1600×900) i specjalny odcinek podcastu ═══
function _galaFacts(a) {
  const { team5 } = (typeof _galaCandidates === 'function' ? _galaCandidates() : { team5: [] });
  const po = typeof getActivePlayoff === 'function' ? getActivePlayoff() : null;
  return { sezon: _seasonName(a.seasonId || currentSeasonId) || '', tytul: a.title,
    zwyciezcy: (a.categories || []).filter(c => a.winners?.[c.key]).map(c => ({ kategoria: `${c.emoji || '🏅'} ${c.title}`, zwyciezca: a.winners[c.key].label, druzyna: a.winners[c.key].team || '', glosy: a.winners[c.key].votes })),
    druzyna_sezonu: (team5 || []).map(x => `${x.name} (${x.team})`), mistrz: po?.champion || po?.winner || null };
}
async function _galaImage(a) {
  const W = 1600, H = 900, F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'";
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  try { await document.fonts?.ready; } catch(e) {}
  _wgLang = 'pl'; await _wgBackground(g, W, H);
  const f = _galaFacts(a);
  await _wgHeader(g, W, 'GALA', 'SEZONU', f.sezon);
  const list = f.zwyciezcy.slice(0, 8), cols = 4, gap = 22, top = 160, hasTeam = f.druzyna_sezonu.length;
  const tw = (W - (cols + 1) * gap) / cols, th = (H - top - (hasTeam ? 120 : 30) - gap * Math.ceil(list.length / cols)) / Math.max(1, Math.ceil(list.length / cols));
  list.forEach((w, i) => {
    const x = gap + (i % cols) * (tw + gap), y = top + Math.floor(i / cols) * (th + gap);
    g.save(); g.shadowColor = '#f5c518'; g.shadowBlur = 22; _wgRound(g, x, y, tw, th, 18); g.fillStyle = 'rgba(8,11,19,.82)'; g.fill(); g.restore();
    _wgRound(g, x, y, tw, th, 18); g.lineWidth = 2; g.strokeStyle = '#f5c518'; g.stroke();
    g.textAlign = 'center'; g.fillStyle = '#f5c518'; g.font = `900 ${_wgFit(g, w.kategoria.toUpperCase(), tw - 30, 26, 900)}px ${F}`; g.fillText(w.kategoria.toUpperCase(), x + tw / 2, y + 48);
    g.fillStyle = '#fff'; g.font = `900 ${_wgFit(g, w.zwyciezca, tw - 30, 60, 900)}px ${F}`; g.fillText(w.zwyciezca, x + tw / 2, y + th / 2 + 18);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `700 22px ${F}`; g.fillText([w.druzyna, `${w.glosy} ${_plVotes(w.glosy)}`].filter(Boolean).join(' · '), x + tw / 2, y + th - 26);
  });
  if(hasTeam) {
    const y = H - 112; _wgRound(g, gap, y, W - 2 * gap, 82, 16); g.fillStyle = 'rgba(245,197,24,.1)'; g.fill(); g.strokeStyle = '#f5c518'; g.lineWidth = 1.5; g.stroke();
    g.textAlign = 'left'; g.fillStyle = '#f5c518'; g.font = `900 26px ${F}`; g.fillText('🏀 DRUŻYNA SEZONU', gap + 24, y + 50);
    const lx = gap + 24 + g.measureText('🏀 DRUŻYNA SEZONU').width + 30;
    g.fillStyle = '#fff'; g.font = `800 ${_wgFit(g, f.druzyna_sezonu.join('  ·  '), W - gap - 24 - lx, 26)}px ${F}`; g.fillText(f.druzyna_sezonu.join('  ·  '), lx, y + 50);
  }
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `700 16px ${F}`; g.fillText((location.host || 'chemikleagues.com').replace(/^www\./, ''), W / 2, H - 10);
  return c.toDataURL('image/png');
}
function _lastGala() { return [...(awardsList || [])].filter(a => a.type === 'season' && a.status === 'closed' && a.winners).sort((x, y) => String(y.closedAt || y.createdAt || '').localeCompare(String(x.closedAt || x.createdAt || '')))[0] || null; }
async function galaBoard(post) {
  const a = _lastGala(); if(!a) { showToast('Brak zakończonego głosowania Gali', 'info'); return; }
  const url = await _galaImage(a);
  if(post) { const ok = await _scheduleDiscordSendR('awardsWinners', { content: `🎖 **${a.title} — zwycięzcy**` }, url); showToast(ok ? '📣 Plansza Gali na Discordzie' : '❌ Discord nie przyjął grafiki', ok ? 'success' : 'error'); }
  else { const l = document.createElement('a'); l.href = url; l.download = 'gala-sezonu.png'; l.click(); }
}
async function galaPodcast(test) {
  const a = _lastGala(), st = document.getElementById('gala-status');
  if(!a) { st.style.color = 'var(--loss)'; st.textContent = 'Najpierw zakończ głosowanie Gali sezonu (Nagrody → Gala).'; return; }
  if(test && !_ensureSession()) return;
  if(!test && !confirm('Opublikować specjalny odcinek Gali na Discordzie i w zakładce 🎧 Podcast?')) return;
  _podReadForm();
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Zlecam nagranie…';
  const r = await _api('/podcast/gala', 'POST', { facts: _galaFacts(a), test, seasonId: currentSeasonId || null, name1: _pod.n1, name2: _pod.n2, voice1: _pod.v1, voice2: _pod.v2 }, { admin: true, session: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)'; st.textContent = r.ok ? `✅ Bot nagrywa odcinek Gali — za 2–4 min ${test ? 'przyjdzie w DM' : 'pojawi się na kanale'}.` : '❌ ' + (r.error || 'Błąd');
}
// ═══ 🩺 STAN SYSTEMU ═══
// 📋 AUTOMATY: co poszło, a co trzeba wywołać ręcznie
async function renderJobsBox() {
  const el = document.getElementById('jobs-box'); if(!el) return;
  const r = await _api('/jobs', 'GET', null, { admin: true }); if(!r.ok) { el.innerHTML = ''; return; }
  const L = { podcast: '🎙️ Podcast', grafiki: '🖼 Grafiki tygodnia', x: '🐦 Wpis na X', zaproszenie: '☀️ Zaproszenie', transfer: '🔁 Ogłoszenie transferu', nagrody: '🏅 Zwycięzcy nagród' };
  // najnowszy stan każdego automatu w każdej kolejce
  const seen = new Set(), rows = (r.jobs || []).filter(j => { const k = j.job + ':' + (j.week ?? ''); if(seen.has(k)) return false; seen.add(k); return true; }).slice(0, 14);
  const fix = j => j.ok === false && (j.job === 'transfer' || j.job === 'nagrody') ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.1rem .45rem" onclick="_fxClose('health-modal');openRoutesModal()">📣 Kanały</button>` : j.ok === false ? (j.job === 'podcast' ? `<button class="btn btn-ghost" style="font-size:.66rem;padding:.1rem .45rem" onclick="_fxClose('health-modal');openPodcastStudio()">🎙️ Nagraj ręcznie</button>` : `<button class="btn btn-ghost" style="font-size:.66rem;padding:.1rem .45rem" onclick="_fxClose('health-modal');openWeekGraphics()">🖼 Wyślij ręcznie</button>`) : '';
  const bad = rows.filter(j => j.ok === false).length;
  el.innerHTML = `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">📋 AUTOMATY ${bad ? `<span style="color:var(--loss)">· ${bad} do ręcznego wywołania</span>` : ''}</div>
    ${rows.length ? rows.map(j => `<div style="display:grid;grid-template-columns:24px 1fr auto;gap:.4rem;align-items:center;font-size:.76rem;padding:.3rem 0;border-bottom:1px solid var(--border)">
      <span>${j.ok === true ? '✅' : j.ok === false ? '❌' : '⏳'}</span>
      <span><b>${L[j.job] || _h(j.job)}</b>${j.week ? ` · Week ${j.week}` : ''} <span style="color:var(--muted)">· ${new Date(j.at).toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>${j.error || j.note ? `<br><span style="color:${j.ok === false ? 'var(--loss)' : 'var(--muted)'}">${_h(j.error || j.note)}</span>` : ''}</span>
      ${fix(j)}</div>`).join('') : '<div style="font-size:.76rem;color:var(--muted)">Brak wpisów — pojawią się po najbliższym podsumowaniu kolejki.</div>'}`;
}
async function openHealth() {
  const m = _fxModal('health-modal', 620), box = m.querySelector('.modal'); m.classList.add('open');
  box.innerHTML = _fxHead('health-modal', '🩺 Stan systemu') + '<div style="color:var(--muted)">⏳ Sprawdzam…</div>';
  const r = await _api('/health', 'GET', null, { admin: true });
  if(!r.ok) { box.innerHTML = _fxHead('health-modal', '🩺 Stan systemu') + `<div style="color:var(--loss)">❌ ${_h(r.error)}</div>`; return; }
  const ago = iso => iso ? _agoPL(iso) + ' temu' : '—';
  const row = (ok, label, val) => `<div style="display:grid;grid-template-columns:24px 1fr auto;gap:.5rem;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.82rem"><span>${ok === null ? '⚪' : ok ? '🟢' : '🔴'}</span><span>${label}</span><span style="color:var(--muted);text-align:right">${val}</span></div>`;
  const cronAge = r.lastCron ? (Date.now() - Date.parse(r.lastCron)) / 36e5 : 99;
  box.innerHTML = _fxHead('health-modal', '🩺 Stan systemu') + `
    ${row(r.bot.ok && r.bot.ready, 'Bot na Railway', r.bot.ok ? (r.bot.ready ? `online · ${r.bot.uptimeMin ?? '?'} min od startu · ${r.bot.mem ?? '?'} MB` : 'uruchomiony, ale nie zalogowany do Discorda') : _h(r.bot.error || 'brak odpowiedzi'))}
    ${row(cronAge < 2, 'Automaty Workera (cron)', ago(r.lastCron))}
    ${row(r.pendingResults < 3, 'Wyniki czekające na potwierdzenie', `${r.pendingResults}${r.oldestPending ? ' · najstarszy ' + ago(r.oldestPending) : ''}`)}
    ${row(!r.openViolations, 'Regulamin — sprawy do decyzji', r.openViolations)}
    ${row(!r.faConflicts, _g('Wolni agenci wciąż w składach drużyn', 'Free agents still on team rosters'), r.faConflicts ? `${r.faConflicts} · <a href="#" onclick="openFaConflicts();return false" style="color:var(--accent)">${_g('rozwiąż', 'resolve')}</a>` : '0')}
    ${row(null, 'Ostatni odcinek podcastu', r.lastEpisode ? `${_h(r.lastEpisode.title)} · ${ago(r.lastEpisode.at)}` : '—')}
    ${row(null, 'Automaty: podcast / X', `${r.podcastAuto ? 'podcast ✓' : 'podcast ✗'} · ${r.xAuto ? 'X ✓' : 'X ✗'}`)}
    ${row(r.admins > 0, 'Alerty DM do adminów', r.admins ? `${r.admins} ${_plPL(r.admins, 'osoba', 'osoby', 'osób')}` : 'brak ADMIN_DISCORD_IDS')}
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.8rem 0 .3rem">🔐 SEKRETY WORKERA</div>
    <div style="display:flex;flex-wrap:wrap;gap:.3rem">${Object.entries(r.secrets).map(([k, v]) => `<span style="font-size:.68rem;padding:.12rem .45rem;border-radius:999px;background:${v ? 'rgba(34,197,94,.15)' : 'rgba(220,38,38,.12)'};color:${v ? 'var(--win)' : 'var(--loss)'}">${v ? '✓' : '✗'} ${k}</span>`).join('')}</div>
    ${(r.bot.errors || []).length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.8rem 0 .3rem">⚠️ OSTATNIE BŁĘDY BOTA</div>${r.bot.errors.slice(0, 8).map(e => `<div style="font-size:.74rem;padding:.25rem 0;border-bottom:1px solid var(--border)"><b>${_h(e.area)}</b> <span style="color:var(--muted)">· ${ago(e.at)}</span><br>${_h(e.msg)}</div>`).join('')}` : '<div style="font-size:.76rem;color:var(--win);margin-top:.7rem">✅ Brak błędów bota od ostatniego startu</div>'}
    <div id="jobs-box" style="margin-top:.9rem"></div>
    <div style="display:flex;gap:.4rem;margin-top:.8rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="openHealth()">🔄 Odśwież</button><button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/health/test','POST',{},{admin:true}).then(r=>showToast(r.ok?'📨 Wysłano test alertu ('+r.admins+')':'❌ '+r.error, r.ok?'success':'error'))">📨 Test alertu DM</button></div>
    <div style="font-size:.68rem;color:var(--muted);margin-top:.5rem">Alerty DM przychodzą same: gdy bot przestanie odpowiadać (i gdy wróci), gdy nie uda się podcast, grafiki lub zapowiedź, oraz gdy regulamin wykryje mecz po terminie.</div>`;
  setTimeout(() => { try { renderJobsBox(); } catch(e) {} }, 0);
}
// ═══ 🧹 KONFLIKTY: wolny agent wciąż w składzie drużyny ═══
async function openFaConflicts() {
  const m = _fxModal('facon-modal', 620), box = m.querySelector('.modal'); m.classList.add('open');
  box.innerHTML = _fxHead('facon-modal', '🧹 ' + _g('Wolni agenci w składach', 'Free agents on rosters')) + '<div style="color:var(--muted)">⏳</div>';
  const r = await _api('/free-agent/conflicts', 'POST', {}, { admin: true });
  _faConDraw(r.ok ? r.conflicts : null, r.error);
}
function _faConDraw(list, err) {
  const box = document.querySelector('#facon-modal .modal'); if(!box) return;
  box.innerHTML = _fxHead('facon-modal', '🧹 ' + _g('Wolni agenci w składach', 'Free agents on rosters')) + `<div data-notr>
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.6rem">${_g('Gracze z aktywnym zgłoszeniem do wolnych agentów, którzy wciąż są w składzie drużyny (np. zapisali się przed zmianą zasad). Wybierz, co ma się stać:', 'Players with an active free-agent listing who are still on a team roster (e.g. signed up before the rule change). Choose what happens:')}</div>
    ${err ? `<div style="color:var(--loss)">❌ ${_h(err)}</div>` : (list || []).map(c => `<div style="background:var(--surface2);border-radius:10px;padding:.55rem .75rem;margin-bottom:.45rem">
      <div><b>${_h(c.gamertag)}</b> <span style="color:var(--muted);font-size:.78rem">(${_h(c.name)}) · ${_h(c.team)}${c.captain ? ' · 🧢 ' + _g('kapitan', 'captain') : ''} · FA ${_g('od', 'since')} ${new Date(c.since).toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'pl-PL')}</span></div>
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.4rem">
        ${c.captain ? `<span style="font-size:.74rem;color:#f59e0b">${_g('Najpierw zmień kapitana drużyny.', 'Change the team captain first.')}</span>` : `<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="faConResolve('${c.faId}','${c.regId}','leave')">👋 ${_g('Usuń z drużyny (transfer → wolni agenci)', 'Remove from team (transfer → free agents)')}</button>`}
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="faConResolve('${c.faId}','${c.regId}','withdraw')">↩ ${_g('Zostaje w drużynie — wycofaj zgłoszenie FA', 'Stays on the team — withdraw the FA listing')}</button>
      </div></div>`).join('') || `<div style="font-size:.82rem;color:var(--win)">✅ ${_g('Brak konfliktów', 'No conflicts')}</div>`}</div>`;
}
async function faConResolve(faId, regId, action) {
  if(!confirm(action === 'leave' ? _g('Usunąć gracza z drużyny? Transfer pojawi się na kanale, a kapitan dostanie DM.', 'Remove the player from the team? The transfer will be posted and the captain gets a DM.') : _g('Wycofać zgłoszenie do wolnych agentów?', 'Withdraw the free-agent listing?'))) return;
  const r = await _api('/free-agent/conflicts', 'POST', { faId, regId, action }, { admin: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  showToast(_g('✅ Załatwione', '✅ Done'), 'success'); _faConDraw(r.conflicts); loadData().catch(() => {});
}
async function openRules() {
  const m = _fxModal('rules-modal', 680), box = m.querySelector('.modal'); m.classList.add('open');
  box.innerHTML = _fxHead('rules-modal', '📜 Regulamin terminów') + '<div style="color:var(--muted)">⏳</div>';
  const r = await _api('/rules', 'POST', {}, { admin: true }); if(!r.ok) { box.innerHTML += `<div style="color:var(--loss)">❌ ${_h(r.error)}</div>`; return; }
  const c = r.config, open = (r.violations || []).filter(v => v.status === 'open'), done = (r.violations || []).filter(v => v.status !== 'open').slice(0, 8);
  const sel = (id, v) => `<select id="${id}" style="${_MODAL_INP};width:auto;font-size:.78rem">${_DAYS.slice(1).map((d, i) => `<option value="${i + 1}" ${+v === i + 1 ? 'selected' : ''}>${d}</option>`).join('')}</select>`;
  box.innerHTML = _fxHead('rules-modal', '📜 Regulamin terminów') + `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.65rem .8rem;margin-bottom:.9rem;font-size:.8rem;line-height:1.9">
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:700;text-transform:none;letter-spacing:0;color:var(--text);margin:0;cursor:pointer"><input type="checkbox" id="rl-on" ${c.enabled ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> Regulamin włączony</label>
      Mecz kolejki trzeba <b>umówić</b> do: ${sel('rl-sched', c.schedDay)} &nbsp;·&nbsp; <b>rozegrać</b> do: ${sel('rl-play', c.playDay)} (godz. 23:59)
      <div style="color:var(--muted);font-size:.72rem;line-height:1.5">Dzień przed terminem kapitanowie obu drużyn dostają przypomnienie w DM. Po terminie mecz trafia tutaj z propozycją decyzji, a Ty dostajesz alert — decyzja zawsze należy do Ciebie.</div>
      <button class="btn btn-primary" style="font-size:.72rem;margin-top:.3rem" onclick="rulesSave()">💾 Zapisz</button>
    </div>
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:${open.length ? '#f59e0b' : 'var(--muted)'};margin-bottom:.35rem">⚖️ DO DECYZJI (${open.length})</div>
    ${open.map(v => { const s = schedule.find(x => String(x.id) === String(v.scheduleId)); return `<div style="background:var(--surface2);border:1px solid rgba(245,158,11,.45);border-radius:10px;padding:.6rem .8rem;margin-bottom:.45rem">
      <div style="font-weight:800">W${v.week} · ${_emo(v.team1)}${_h(v.team1)} vs ${_emo(v.team2)}${_h(v.team2)}</div>
      <div style="font-size:.76rem;color:var(--muted)">Mecz <b style="color:#f59e0b">${_h(v.kind)}</b> po terminie · wykryto ${_agoPL(v.at)} temu${s?.date ? ' · termin meczu: ' + _ssFmt(s.date) : ''}</div>
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.45rem">
        ${s ? `<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="ssWalkover('${s.id}');rulesResolve('${v.id}','walkower')">🏳 Walkower…</button>
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="rulesExtend('${v.id}','${s.id}',3)">⏳ Przedłuż o 3 dni</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="rulesResolve('${v.id}','załatwione')">✓ Załatwione / pomiń</button>
      </div></div>`; }).join('') || '<div style="font-size:.8rem;color:var(--muted);margin-bottom:.6rem">Brak spraw — wszystkie mecze idą zgodnie z terminami 👍</div>'}
    ${done.length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.7rem 0 .3rem">HISTORIA</div>${done.map(v => `<div style="font-size:.74rem;color:var(--muted);padding:.2rem 0">W${v.week} ${_h(v.team1)} vs ${_h(v.team2)} · ${_h(v.kind)} → <b>${_h(v.resolution || 'załatwione')}</b></div>`).join('')}` : ''}`;
}
async function rulesSave() {
  const r = await _api('/rules', 'POST', { config: { enabled: document.getElementById('rl-on').checked, schedDay: +document.getElementById('rl-sched').value, playDay: +document.getElementById('rl-play').value } }, { admin: true });
  showToast(r.ok ? '💾 Zapisano regulamin' : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
async function rulesResolve(id, resolution) { const r = await _api('/rules/resolve', 'POST', { id, resolution }, { admin: true }); if(r.ok) { if(document.getElementById('rules-modal')?.classList.contains('open')) openRules(); } else showToast('❌ ' + r.error, 'error'); }
async function rulesExtend(vid, sid, days) {
  const s = schedule.find(x => String(x.id) === String(sid)); if(!s) return;
  const d = new Date(); d.setDate(d.getDate() + days); s.ruleUntil = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  if(!(await saveData())) return;
  await rulesResolve(vid, `przedłużono do ${s.ruleUntil}`);
  showToast(`⏳ Termin przedłużony do ${s.ruleUntil}`, 'success');
}
async function _fansLoad() { if(_fansCache && Date.now() - _fansCache.at < 5 * 60e3) return _fansCache; const r = await _api('/fans', 'GET', null, {}); if(r.ok && Array.isArray(r.fans) && Array.isArray(r.levels)) _fansCache = { ...r, at: Date.now() }; return _fansCache; }
async function passMount() {
  const slot = document.querySelector('#fans-view .pass-slot'); if(!slot || !discordUser?.session) return;
  if(!_pass) { const r = await _api('/pass', 'GET', null, { session: true }); if(r.off) { slot.innerHTML = ''; return; } if(!r.ok || !Array.isArray(r.tiers)) return; _pass = r; }
  const P = _pass, en = currentLang === 'en', next = P.tiers.find(t => P.xp < t.xp), prev = [...P.tiers].reverse().find(t => P.xp >= t.xp), lvl = prev?.tier || 0;
  const pct = next ? Math.round((P.xp - (prev?.xp || 0)) / (next.xp - (prev?.xp || 0)) * 100) : 100, ico = r => r === 'final' ? '🏆' : r === 'premium' ? '💎' : r === 'pack' ? '🎁' : '·';
  const ready = P.tiers.filter(t => t.reward && P.xp >= t.xp && !P.claimed.includes(t.tier)).length;
  slot.innerHTML = `<div class="card" id="pass-sec" style="padding:.85rem 1rem;margin-bottom:1rem;border:2px solid var(--accent);background:linear-gradient(135deg,rgba(245,197,24,.12),rgba(59,130,246,.06))" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><b style="font-size:1rem">🎟️ ${_g('Przepustka sezonowa', 'Season pass')}</b><span style="font-size:.8rem">${_g('Poziom', 'Level')} <b style="font-size:1.05rem;color:var(--accent)">${lvl}</b>/20 · <b>${P.xp}</b> XP${ready ? ` · <span style="color:var(--win);font-weight:800">${ready} ${_g('do odebrania', 'to claim')} 🎁</span>` : ''}</span></div>
    <div style="height:8px;background:var(--surface);border-radius:4px;margin:.5rem 0 .2rem;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--accent)"></div></div>
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:.55rem">${next ? _g(`Do poziomu ${next.tier}: ${next.xp - P.xp} XP`, `To level ${next.tier}: ${next.xp - P.xp} XP`) : _g('Przepustka ukończona! 🏆', 'Season pass complete! 🏆')} · ${_g('XP zdobywasz w typerze, Fantasy, Korcie, 2Kordle, kolekcji kart i za codzienną serię.', 'Earn XP in pick’em, Fantasy, Kort, 2Kordle, the card collection and your daily streak.')}</div>
    <div style="display:flex;gap:.3rem;overflow-x:auto;padding-bottom:.3rem">${P.tiers.map(t => { const got = P.xp >= t.xp, cl = P.claimed.includes(t.tier), can = t.reward && got && !cl;
      return `<div style="flex:0 0 58px;text-align:center;border-radius:9px;padding:.35rem .15rem;border:1px solid ${can ? 'var(--win)' : got ? 'rgba(245,197,24,.6)' : 'var(--border)'};background:${can ? 'rgba(34,197,94,.15)' : got ? 'rgba(245,197,24,.08)' : 'var(--surface2)'};opacity:${got ? 1 : .55}">
        <div style="font-size:.6rem;color:var(--muted)">${t.tier}</div><div style="font-size:1.15rem;line-height:1.3">${cl ? '✅' : ico(t.reward)}</div><div style="font-size:.55rem;color:var(--muted)">${t.xp} XP</div>
        ${can ? `<button class="btn btn-primary" style="font-size:.55rem;padding:.1rem .25rem;margin-top:.15rem" onclick="passClaim(${t.tier})">${_g('Odbierz', 'Claim')}</button>` : ''}</div>`; }).join('')}</div>
    ${_isLoggedInSync() ? `<div style="text-align:right;margin-top:.3rem"><a href="#" style="font-size:.7rem;color:var(--loss)" onclick="passAdminToggle().then(()=>{_pass=null;passMount();});return false">⚙️ ${_g('wyłącz przepustkę (admin)', 'turn off the pass (admin)')}</a></div>` : ''}
    <div style="font-size:.66rem;color:var(--muted);margin-top:.35rem">🎁 ${_g('paczka co 2 poziomy', 'pack every 2 levels')} · 💎 ${_g('premium na 5, 10, 15', 'premium at 5, 10, 15')} · 🏆 ${_g('poziom 20: premium + unikalna karta „Przepustka”', 'level 20: premium + a one-of-a-kind “Season Pass” card')}</div></div>`;
}
async function openPackEconomy(save) {
  const body = save ? { packEco: { weeklyCap: document.getElementById('eco-cap').value, draft: document.getElementById('eco-draft').value, kort3: document.getElementById('eco-k3').value } } : null;
  const r = await _api('/cards/economy', save ? 'POST' : 'GET', body, { admin: true }); if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; } window._ecoRep = r; if(save) showToast('✅ Ustawienia zapisane', 'success');
  const m = _fxModal('eco-modal', 720); m.classList.add('open'); const e = r.eco || {}, pa = n => r.active7 ? (n / r.active7).toFixed(1) : '0';
  m.querySelector('.modal').innerHTML = _fxHead('eco-modal', `📊 Ekonomia paczek — liga ${r.league}`) + `<div data-notr>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.4rem;margin-bottom:.7rem">${[[r.collectors, 'kolekcjonerów'], [r.active7, 'aktywnych (7 dni)'], [pa(r.daily.d7) + ' + ' + pa(r.tot7), 'paczek / aktywny / tydzień<br>(dzienne + dodatkowe)'], [r.median + '%', 'mediana kolekcji'], [r.pool, 'kart w puli']].map(([v, l]) => `<div style="background:var(--surface2);border-radius:10px;padding:.45rem;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem">${v}</div><div style="font-size:.62rem;color:var(--muted)">${l}</div></div>`).join('')}</div>
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">ŹRÓDŁA PACZEK (zwykłe / 💎 premium)</div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.8rem"><tr style="color:var(--muted);font-size:.7rem"><th style="text-align:left">Źródło</th><th>7 dni</th><th>30 dni</th></tr>
      <tr style="border-top:1px solid var(--border)"><td>📅 Paczki dzienne (otwarte)</td><td style="text-align:center">${r.daily.d7}</td><td style="text-align:center">${r.daily.d30}</td></tr>
      ${r.rows.map(x => `<tr style="border-top:1px solid var(--border)"><td>${_h(x.src)}</td><td style="text-align:center">${x.b7}${x.p7 ? ` / 💎${x.p7}` : ''}</td><td style="text-align:center">${x.b30}${x.p30 ? ` / 💎${x.p30}` : ''}</td></tr>`).join('')}
      ${r.capped.d30 ? `<tr style="border-top:1px solid var(--border);color:var(--muted)"><td>Zamienione na XP (limit)</td><td style="text-align:center">${r.capped.d7}</td><td style="text-align:center">${r.capped.d30}</td></tr>` : ''}</table></div>
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.8rem 0 .3rem">POSTĘP KOLEKCJI</div><div style="font-size:.8rem">${r.bucket.map(b => `<span style="margin-right:.7rem">${b.range}: <b>${b.n}</b></span>`).join('')}</div>
    <div style="font-size:.74rem;color:var(--muted);margin-top:.3rem">Top: ${r.top.slice(0, 5).map(x => `${_h(x.name)} ${x.own}/${r.pool} (${x.opened} paczek)`).join(' · ')}</div>
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.9rem 0 .3rem">USTAWIENIA (tylko ta liga)</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.5rem">
      <label style="${_MODAL_LBL}">Limit paczek z aktywności / tydzień<input id="eco-cap" type="number" min="0" max="50" placeholder="brak limitu" value="${e.weeklyCap ?? ''}" style="${_MODAL_INP};margin-top:.2rem"><span style="font-size:.64rem;color:var(--muted);text-transform:none;letter-spacing:0">Kort, wyzwania, Karnet, seria, Moja piątka. Ponad limit: 25 XP za paczkę.</span></label>
      <label style="${_MODAL_LBL}">Nagrody draftu Kortu<select id="eco-draft" style="${_MODAL_INP};margin-top:.2rem"><option value="default" ${e.draft !== 'lean' ? 'selected' : ''}>Standardowe (🎁 od 2 wygranych)</option><option value="lean" ${e.draft === 'lean' ? 'selected' : ''}>Oszczędne (🎁 od 5, 💎 za 7)</option></select></label>
      <label style="${_MODAL_LBL}">Kort: 3 dni z wygraną w tygodniu<select id="eco-k3" style="${_MODAL_INP};margin-top:.2rem"><option value="pack" ${e.kort3 !== 'xp' ? 'selected' : ''}>🎁 Paczka</option><option value="xp" ${e.kort3 === 'xp' ? 'selected' : ''}>+30 XP</option></select></label></div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.8rem;flex-wrap:wrap"><button class="btn btn-ghost" onclick="navigator.clipboard?.writeText(window._ecoRep.text).then(()=>showToast('📋 Raport skopiowany — wklej go Claude','success'))">📋 Kopiuj raport</button><button class="btn btn-primary" onclick="openPackEconomy(true)">💾 Zapisz ustawienia</button></div></div>`;
}
async function passAdminToggle() {
  const cur = await _api('/pass/admin', 'POST', {}, { admin: true }); if(!cur.ok) { showToast('❌ ' + (cur.error || 'Błąd'), 'error'); return; }
  if(!confirm(cur.off ? 'Przepustka jest WYŁĄCZONA. Włączyć ją kibicom?' : 'Przepustka jest WŁĄCZONA. Wyłączyć? Sekcja zniknie kibicom i nie będzie można odbierać nagród (odebrane zostają).')) return;
  const r = await _api('/pass/admin', 'POST', { off: !cur.off }, { admin: true }); _pass = null;
  showToast(r.ok ? (r.off ? '🎟️ Przepustka wyłączona' : '🎟️ Przepustka włączona') : '❌ ' + (r.error || 'Błąd'), r.ok ? 'success' : 'error');
}
async function passClaim(tier) {
  const r = await _api('/pass/claim', 'POST', { tier }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  if(Array.isArray(r.tiers)) _pass = r; _cards = null; showToast(r.got === 'final' ? _g('🏆 Przepustka ukończona! 💎 i unikalna karta są Twoje', '🏆 Pass complete! 💎 and a one-of-a-kind card are yours') : r.got === 'premium' ? _g('💎 Paczka premium odebrana!', '💎 Premium pack claimed!') : _g('🎁 Paczka odebrana!', '🎁 Pack claimed!'), 'success'); passMount();
}
async function renderFansView() {
  setTimeout(() => { try { const v = document.getElementById('fans-view'); if(v && discordUser && !v.querySelector('.karnet-slot')) { v.insertAdjacentHTML('afterbegin', '<div class="karnet-slot"></div>'); karnetMount(); } if(v && discordUser && !v.querySelector('.pass-slot')) { v.insertAdjacentHTML('afterbegin', '<div class="pass-slot"></div>'); passMount(); } } catch(e) {} }, 900);
  const el = document.getElementById('fans-view'); if(!el) return;
  el.innerHTML = '<div class="section-title">🏅 Liga kibiców</div><div style="color:var(--muted)">⏳</div>';
  const d = await _fansLoad(); if(!d) { el.innerHTML = '<div class="section-title">🏅 Liga kibiców</div><div style="color:var(--loss)">Nie udało się wczytać rankingu</div>'; return; }
  const me = discordUser ? d.fans.find(f => f.id === discordUser.id) : null, myPos = me ? d.fans.indexOf(me) + 1 : null;
  const SRC = { typer: '🎯 Typer', fantasy: '🏆 Fantasy', typy: '🔮 Typy sezonu', drabinka: '🏆 Drabinka', '2kordle': '🧩 2Kordle', karty: '🃏 Kolekcja', karnet: '🎟️ Karnet', seria: '🔥 Seria' };
  el.innerHTML = `<div class="section-title">🏅 Liga kibiców</div>
    ${_fansMeHtml(me, myPos, d)}
    <div class="card" style="padding:.7rem .9rem;margin-bottom:1rem;font-size:.78rem;line-height:1.7">
      <b>Jak zdobywać punkty kibica (XP)?</b><br>🎯 trafiony typ meczu <b>+10</b> · 🏆 fantasy: <b>połowa</b> punktów sezonu · 🔮 trafione typy przedsezonowe <b>+30–75</b> · 🏆 drabinka play-off <b>+5</b> za punkt · 🧩 odgadnięte 2Kordle <b>+5–15</b> (im szybciej, tym więcej)
      <div style="color:var(--muted);margin-top:.2rem">Poziomy: ${d.levels.map(([t, n]) => `${n} (${t})`).join(' → ')}. Od poziomu „Rotacja” dostajesz rolę na Discordzie.</div>
    </div>
    ${_isLoggedInSync() ? `<div style="text-align:right;margin-bottom:.5rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="closeFanSeason()">🏆 Zamknij sezon kibiców (podium → odznaki)</button></div>` : ''}
    <div class="card" style="padding:.5rem .9rem">${d.fans.slice(0, 50).map((f, i) => `<div onclick="openFanProfile('${f.id}')" style="cursor:pointer;display:grid;grid-template-columns:30px 26px 1fr auto;gap:.55rem;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);${f.id === discordUser?.id ? 'font-weight:800' : ''}">
      <b style="color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(f.avatar, 24)}
      <div style="min-width:0"><div>${_h(f.name)} <span style="font-size:.7rem;color:var(--accent);font-weight:700">${_h(f.level.name)}</span></div><div style="font-size:.66rem;color:var(--muted)">${Object.entries(f.src).map(([k, v]) => `${SRC[k] || k} ${v}`).join(' · ')}</div></div>
      <b style="font-family:'Barlow Condensed',sans-serif;font-size:1.05rem">${f.xp} XP</b></div>`).join('') || '<div style="color:var(--muted);padding:1rem 0">Ranking ruszy po pierwszych typach i zabawach.</div>'}</div>`;
}
function _gmNavSync() { const el = document.getElementById('nav-gm'); if(el) el.style.display = _gmVisible() ? '' : 'none'; }
async function _gmLoad() { if(window._gmDemo) { _gmState = window._gmDemo.state; return _gmState; } const r = await _api('/gm?season=' + encodeURIComponent(currentSeasonId || '_'), 'GET', null, {}); if(r.ok) _gmState = r; return _gmState; }
async function renderGmView() {
  const el = document.getElementById('gm-view'); if(!el) return;
  el.innerHTML = `<div class="section-title">🏆 ${_g('Liga GM', 'GM League')}</div><div style="color:var(--muted)">⏳</div>`;
  const st = await _gmLoad(); if(!st) { el.innerHTML += `<div style="color:var(--loss)">${_g('Nie udało się wczytać', 'Failed to load')}</div>`; return; }
  if(st.config.dynasty && !st.rosters) await _gmPrevLoad();
  const c = st.config, gms = st.gms || [], admin = _isLoggedInSync(), me = _gmMeId() ? gms.find(g => g.id === _gmMeId()) : null;
  const pool = _gmPool(), maxByPool = Math.floor(pool.length / c.roster), fa = Math.max(0, pool.length - Math.min(c.maxGm, maxByPool) * c.roster);
  const stLbl = { setup: _g('🛠 przygotowanie', '🛠 setup'), signups: _g('📝 zapisy GM-ów', '📝 GM sign-ups'), draft: _g('🎯 draft', '🎯 draft'), season: _g('🏀 sezon trwa', '🏀 season in progress'), done: _g('🏁 zakończony', '🏁 finished') }[c.status];
  el.innerHTML = `<div class="section-title">🏆 ${_g('Liga GM', 'GM League')} <span style="font-size:.9rem;color:var(--muted)">${_h(_seasonName(currentSeasonId) || '')}</span></div>
  ${st.demo ? `<div class="card" style="padding:.7rem .9rem;margin-bottom:1rem;border:2px solid var(--accent);display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap" data-notr><div style="font-size:.84rem">🎮 <b>DEMO</b> — ${_g('Twoja drużyna z draftu demo kontra boty. Punkty liczą się z prawdziwych meczów ligi w tym sezonie. Nic nie jest zapisywane.', 'Your demo draft team vs bots. Points come from real league games this season. Nothing is saved.')}</div><button class="btn btn-ghost" style="font-size:.74rem" onclick="gmDemoExit()">✕ ${_g('Zakończ demo', 'Exit demo')}</button></div>` : ''}
  <div data-notr>
    <div class="card" style="padding:.9rem 1rem;margin-bottom:1rem;line-height:1.6;font-size:.84rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap"><b style="font-size:1rem">${st.rosters ? _g('Zasady Ligi GM', 'GM League rules') : _g('Zostań GM-em sezonu', 'Become a GM this season')}</b><span style="color:var(--accent);font-weight:700">${stLbl}</span></div>
      <div style="color:var(--muted);margin-top:.3rem">${_g(
        `Każdy GM buduje drużynę z zawodników naszej ligi — w drafcie ${c.draftMode === 'auction' ? 'aukcyjnym (budżet ' + c.budget + ' monet)' : 'snake (po kolei)'}. Skład: ${c.roster} zawodników, liczy się ${c.starters} najlepszych występów z tygodnia. Punkty pochodzą z prawdziwych meczów ligi (jak w fantasy). ${c.tableMode === 'h2h' ? 'Co tydzień pojedynek z innym GM-em — kto zdobędzie więcej punktów, wygrywa.' : 'Liczy się suma punktów z całego sezonu.'} Skład zmienisz tylko wymianą z innym GM-em albo przez rynek wolnych agentów — w granicach salary cap (${c.cap ?? c.budget}).${c.noSelf ? ' GM nie może mieć w składzie siebie.' : ''}`,
        `Each GM builds a team from our league's players — in ${c.draftMode === 'auction' ? 'an auction draft (budget ' + c.budget + ' coins)' : 'a snake draft'}. Roster: ${c.roster} players, the best ${c.starters} performances of the week count. Points come from real league games (fantasy scoring). ${c.tableMode === 'h2h' ? 'Every week you face another GM — more points wins.' : 'The season-long point total counts.'} You can only change your roster by trading with another GM or via the free-agent market — within the salary cap (${c.cap ?? c.budget}).${c.noSelf ? ' A GM can\'t have themselves on the roster.' : ''}`)}</div>
    </div>
    ${c.status === 'signups' ? (_gmMeId() ? `<div class="card" style="padding:.9rem 1rem;margin-bottom:1rem">
      <b>${me ? _g('✅ Jesteś zapisany jako GM', '✅ You are signed up as a GM') : _g('📝 Zapisz się jako GM', '📝 Sign up as a GM')}</b>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
        <div><label style="${_MODAL_LBL}">${_g('Nazwa Twojej drużyny GM', 'Your GM team name')}</label><input id="gm-team" maxlength="40" value="${_h(me?.teamName || '')}" style="${_MODAL_INP}"></div>
        <div><label style="${_MODAL_LBL}">${_g('Twój nick w lidze (jeśli grasz)', 'Your league nick (if you play)')}</label><input id="gm-player" maxlength="40" list="gm-nicks" value="${_h(me ? me.player || '' : _myGamertag())}" style="${_MODAL_INP}"><datalist id="gm-nicks">${pool.map(p => `<option value="${_h(p.name)}">`).join('')}</datalist></div>
      </div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:.3rem">${_g('Nick jest potrzebny, żeby system nie pozwolił Ci wybrać siebie w drafcie.', 'Your nick lets the system keep you from drafting yourself.')}</div>
      <div style="display:flex;gap:.4rem;margin-top:.5rem"><button class="btn btn-primary" onclick="gmSignup()">${me ? _g('💾 Zapisz zmiany', '💾 Save changes') : _g('📝 Zapisz się', '📝 Sign up')}</button>${me ? `<button class="btn btn-ghost" onclick="gmLeave()">${_g('Wypisz się', 'Leave')}</button>` : ''}</div>
    </div>` : `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;font-size:.84rem">${_g('Zaloguj się przez Discord, żeby zapisać się jako GM.', 'Log in with Discord to sign up as a GM.')}</div>`) : ''}
    ${st.rosters ? '' : `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">👔 ${_g('GM-OWIE', 'GMS')} (${gms.length}/${c.maxGm})</div>
      ${gms.map((g, i) => `<div style="display:grid;grid-template-columns:26px 26px 1fr auto;gap:.5rem;align-items:center;padding:.35rem 0;border-bottom:1px solid var(--border)">
        <b style="color:var(--muted)">${i + 1}</b>${_avatarHtml(g.avatar, 24)}<div><b>${_h(g.teamName)}</b> <span style="font-size:.74rem;color:var(--muted)">· ${_h(g.name)}${g.player ? ' · ' + _g('gra jako', 'plays as') + ' ' + _h(g.player) : ''}</span></div>
        ${admin ? `<a href="#" onclick="gmRemove('${g.id}');return false" style="font-size:.72rem;color:var(--loss)">${_g('usuń', 'remove')}</a>` : ''}</div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Jeszcze nikt się nie zapisał.', 'Nobody has signed up yet.')}</div>`}
    </div>`}
    ${_gmDynastyHtml(st)}
    ${_gmDraftHtml(st, admin)}
    ${admin ? _gmAdminHtml(c, pool, maxByPool, fa) : ''}
  </div>`;
}
function _gmDraftHtml(st, admin) {
  const c = st.config, evId = 'gmd_' + String(currentSeasonId || 'x').replace(/\W/g, ''), ev = events.find(e => e.id === evId), me = discordUser ? (st.gms || []).find(g => g.id === discordUser.id) : null;
  if(st.rosters) return _gmSeasonHtml(st) + _gmMarketHtml(st) + `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem"><button class="btn btn-ghost" style="float:right;font-size:.7rem;padding:.15rem .5rem" onclick="openGmDraftReport()">📋 ${_g('Raport po drafcie', 'Post-draft report')}</button><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📋 ${_g('SKŁADY GM-ÓW', 'GM ROSTERS')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.5rem">${(st.gms || []).map(g => `<div style="background:var(--surface2);border-radius:10px;padding:.5rem .65rem;cursor:pointer${g.id === discordUser?.id ? ';border:1px solid var(--accent)' : ''}" onclick="openGmTeam('${g.id}')"><b>${_h(g.teamName)}</b> <span style="font-size:.7rem;color:var(--muted)">${_h(g.name)}</span>
      ${_isLoggedInSync() ? `<a href="#" onclick="event.stopPropagation();openGmRosterEdit('${g.id}');return false" style="float:right;font-size:.72rem">✏️</a>` : ''}
      <div style="font-size:.68rem;color:${_gmPay(st, g.id) > _gmCap(st) ? 'var(--loss)' : 'var(--muted)'};margin:.1rem 0 .25rem">💵 ${_gmPay(st, g.id)} / ${_gmCap(st)}${st.market?.dead?.[g.id] ? ` (${_g('martwe', 'dead')} ${st.market.dead[g.id]})` : ''}</div>
      ${(st.rosters[g.id] || []).map(p => `<div style="font-size:.78rem;display:flex;justify-content:space-between"><span>${_h(p.name)}</span><span style="color:var(--muted)">${_h(p.team || '')}${p.price ? ' · 💵' + p.price : ''}</span></div>`).join('')}</div>`).join('')}</div></div>`;
  const live = c.draftMode === 'snake' ? !!ev : true;
  return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">${c.draftMode === 'auction' ? '💰 ' + _g('AUKCJA', 'AUCTION') : '🐍 ' + _g('DRAFT SNAKE', 'SNAKE DRAFT')}</div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap">
      ${c.draftMode === 'auction' ? `<button class="btn btn-ghost" onclick="openGmAuction()">👀 ${_g('Otwórz pokój aukcji', 'Open the auction room')}</button>${admin ? `<button class="btn btn-primary" onclick="gmCreateAuction()">💰 ${_g('Utwórz aukcję z zapisanych GM-ów', 'Create the auction from signed-up GMs')}</button>` : ''}`
        : `${ev ? `<button class="btn btn-ghost" onclick="openDraftView('${evId}')">👀 ${_g('Otwórz Draft Room', 'Open the Draft Room')}</button>${me ? `<button class="btn btn-primary" onclick="openGMPanel('${evId}')">🎮 ${_g('Mój panel draftu', 'My draft panel')}</button>` : ''}` : ''}${admin ? `<button class="btn btn-primary" onclick="gmCreateSnake()">🎯 ${_g('Utwórz draft z zapisanych GM-ów', 'Create the draft from signed-up GMs')}</button>` : ''}`}
    </div>
    <div style="font-size:.72rem;color:var(--muted);margin-top:.4rem">${c.draftMode === 'auction' ? _g('GM-owie licytują się na żywo — zaloguj się przez Discord, żeby licytować.', 'GMs bid live — log in with Discord to bid.') : _g('Kolejność losowa, w każdej rundzie odwrotna (snake). Pick przez Discord, timer i auto-pick jak w drafcie eventów.', 'Random order, reversed every round (snake). Picks via Discord, timer and auto-pick like event drafts.')}</div>
  </div>`;
}
function _gmAdminHtml(c, pool, maxByPool, fa) {
  const opt = (v, cur, label) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${label}</option>`;
  const num = (id, v, lo, hi) => `<input id="${id}" type="number" min="${lo}" max="${hi}" value="${v}" style="${_MODAL_INP};font-size:.8rem" oninput="gmCalc()">`;
  return `<div class="card" style="padding:.8rem 1rem;border-color:var(--accent)">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin-bottom:.5rem">⚙ ${_g('ADMIN — USTAWIENIA LIGI GM', 'ADMIN — GM LEAGUE SETTINGS')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem">
      <div><label style="${_MODAL_LBL}">${_g('Liczba GM-ów', 'Number of GMs')}</label>${num('gmc-max', c.maxGm, 2, 30)}</div>
      <div><label style="${_MODAL_LBL}">${_g('Skład (zawodników)', 'Roster size')}</label>${num('gmc-roster', c.roster, 3, 10)}</div>
      <div><label style="${_MODAL_LBL}">${_g('Liczy się najlepszych', 'Best performances counted')}</label>${num('gmc-starters', c.starters, 1, 10)}</div>
      <div><label style="${_MODAL_LBL}">${_g('Draft', 'Draft')}</label><select id="gmc-draft" style="${_MODAL_INP};font-size:.8rem">${opt('auction', c.draftMode, _g('💰 Aukcja', '💰 Auction'))}${opt('snake', c.draftMode, _g('🐍 Snake (po kolei)', '🐍 Snake'))}</select></div>
      <div><label style="${_MODAL_LBL}">${_g('Budżet aukcji', 'Auction budget')}</label>${num('gmc-budget', c.budget, 50, 1000)}</div>
      <div><label style="${_MODAL_LBL}">💵 Salary cap</label>${num('gmc-cap', c.cap ?? c.budget ?? 200, 50, 2000)}</div>
      <div><label style="${_MODAL_LBL}">🏆 ${_g('Play-offy (drużyn)', 'Playoffs (teams)')}</label><select id="gmc-po" style="${_MODAL_INP};font-size:.8rem">${[0, 2, 4, 6, 8].map(v => opt(v, c.playoffTeams ?? 4, v ? 'top ' + v : _g('bez play-offów', 'no playoffs'))).join('')}</select></div>
      <div><label style="${_MODAL_LBL}">${_g('Play-offy od kolejki (Week)', 'Playoffs from week')}</label>${num('gmc-pos', c.playoffStart || 0, 0, 60)}</div>
      <div><label style="${_MODAL_LBL}">${_g('Tabela', 'Standings')}</label><select id="gmc-table" style="${_MODAL_INP};font-size:.8rem">${opt('h2h', c.tableMode, _g('⚔️ Pojedynki tygodniowe', '⚔️ Weekly head-to-head'))}${opt('total', c.tableMode, _g('📈 Suma sezonu', '📈 Season total'))}</select></div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:.5rem;font-size:.8rem">
      <label style="display:flex;align-items:center;gap:.35rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0"><input type="checkbox" id="gmc-noself" ${c.noSelf ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('GM nie może mieć siebie w składzie', 'A GM can\'t own themselves')}</label>
      <label style="display:flex;align-items:center;gap:.35rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0" title="${_g('Zwolniony zawodnik obciąża cap połową pensji do końca sezonu', 'A dropped player counts half his salary against the cap for the rest of the season')}"><input type="checkbox" id="gmc-dead" ${c.deadMoney ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('Martwe pieniądze (½ pensji zwolnionego)', 'Dead money (½ of a dropped salary)')}</label>
      <label style="display:flex;align-items:center;gap:.35rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0"><input type="checkbox" id="gmc-dyn" ${c.dynasty ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('Dynastia — zatrzymanie', 'Dynasty — keep')} <input id="gmc-keep" type="number" min="0" max="3" value="${c.keepers}" style="${_MODAL_INP};width:52px;font-size:.78rem;padding:.15rem .3rem"> ${_g('zawodników na kolejny sezon, podwyżka', 'players for next season, raise')} <input id="gmc-raise" type="number" min="0" max="100" value="${c.keeperRaise ?? 10}" style="${_MODAL_INP};width:56px;font-size:.78rem;padding:.15rem .3rem">%</label>
    </div>
    ${_gmRatingsHtml(c)}
    <div id="gmc-calc" style="font-size:.78rem;margin-top:.6rem;padding:.5rem .7rem;border-radius:8px;background:var(--surface2)"></div>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem">
      <button class="btn btn-primary" style="font-size:.76rem" onclick="gmSaveConfig()">💾 ${_g('Zapisz ustawienia', 'Save settings')}</button>
      ${c.signupsOpen ? `<button class="btn btn-ghost" style="font-size:.76rem" onclick="gmSaveConfig({signupsOpen:false})">🔒 ${_g('Zamknij zapisy', 'Close sign-ups')}</button>` : `<button class="btn btn-ghost" style="font-size:.76rem" onclick="gmSaveConfig({signupsOpen:true,status:'signups'},true)">📝 ${_g('Otwórz zapisy (+ ogłoś na Discordzie)', 'Open sign-ups (+ announce on Discord)')}</button>`}
    </div>
  </div>`;
}
async function gmSaveConfig(extra = {}, announce) {
  const v = id => document.getElementById(id);
  const config = { maxGm: +v('gmc-max').value, roster: +v('gmc-roster').value, starters: +v('gmc-starters').value, draftMode: v('gmc-draft').value, budget: +v('gmc-budget').value,
    tableMode: v('gmc-table').value, cap: +v('gmc-cap').value, playoffTeams: +v('gmc-po').value, playoffStart: +v('gmc-pos').value, deadMoney: v('gmc-dead').checked, keeperRaise: +v('gmc-raise').value, ratings: Object.fromEntries([...document.querySelectorAll('.gmc-rt')].map(i => [i.dataset.k, +i.value])), noSelf: v('gmc-noself').checked, dynasty: v('gmc-dyn').checked, keepers: +v('gmc-keep').value, ...extra };
  const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', config, announce: !!announce }, { admin: true });
  showToast(r.ok ? _g('💾 Zapisano', '💾 Saved') : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) renderGmView();
}
async function gmSignup() {
  if(!_ensureSession()) return;
  const r = await _api('/gm/signup', 'POST', { seasonId: currentSeasonId || '_', teamName: document.getElementById('gm-team').value.trim(), player: document.getElementById('gm-player').value.trim() }, { session: true });
  showToast(r.ok ? _g('✅ Zapisano jako GM', '✅ Signed up as a GM') : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) renderGmView();
}
async function gmLeave() { if(!confirm(_g('Wypisać się z Ligi GM?', 'Leave the GM League?'))) return; const r = await _api('/gm/signup', 'DELETE', { seasonId: currentSeasonId || '_' }, { session: true }); if(r.ok) renderGmView(); else showToast('❌ ' + r.error, 'error'); }
async function gmRemove(id) { if(!confirm(_g('Usunąć tego GM-a?', 'Remove this GM?'))) return; const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', removeGm: id }, { admin: true }); if(r.ok) renderGmView(); }
// ═══ 🏆 LIGA GM — draft snake (silnik Draft Roomu) i 💰 aukcja ═══
function _gmPoolFull() {
  const sid = currentSeasonId || null, pos = {};
  _withAllMatches(() => matches.filter(m => !m.walkover)).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => { if(p.pos) { const k = _normNick(p.name); pos[k] = pos[k] || {}; pos[k][p.pos] = (pos[k][p.pos] || 0) + 1; } })));
  return _gmPool().map(p => { const k = _normNick(p.name), pp = Object.entries(pos[k] || {}).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const d = _pcData(p.name, 'edition') || _pcData(p.name, 'career'), rt = _gmState?.config?.ratings?.[k];
    return { id: k, name: p.name, team: p.team, isNew: !d, primaryPos: pp[0] || '', positions: pp.slice(0, 2), pos: pp[0] || '', ovr: rt ?? d?.rating ?? 70 }; });
}
async function gmCreateSnake() {
  const st = _gmState, c = st.config, gms = st.gms || [];
  if(gms.length < 2) { showToast(_g('Potrzeba min. 2 GM-ów', 'At least 2 GMs needed'), 'info'); return; }
  const id = 'gmd_' + String(currentSeasonId || 'x').replace(/\W/g, '');
  if(events.some(e => e.id === id) && !confirm(_g('Draft Ligi GM już istnieje — utworzyć od nowa?', 'A GM League draft already exists — recreate it?'))) { openDraftView(id); return; }
  const ks = c.dynasty ? _gmKeepersSplit(st) : {}, keptIds = new Set(Object.values(ks).flatMap(k => k.ok.map(p => p.id)));
  const pool = _gmPoolFull().filter(p => !keptIds.has(p.id)), kept = gms.map(g => ks[g.id]?.ok || []), lost = gms.map(g => (ks[g.id]?.lost || []).length);
  const order0 = gms.map((_, i) => i).sort(() => Math.random() - .5).sort((a, b) => lost[b] - lost[a]), order = [], need = gms.map((_, i) => c.roster - kept[i].length);
  for(let r = 0; r < c.roster; r++) order.push(...(r % 2 ? [...order0].reverse() : order0).filter(i => need[i] > r));
  const forbid = {}; gms.forEach((g, i) => { if(c.noSelf && g.player) forbid[i] = [_normNick(g.player)]; });
  const ev = { id, type: 'gmdraft', gmSeason: currentSeasonId || '_', title: _g('Draft Ligi GM', 'GM League draft') + ' — ' + (_seasonName(currentSeasonId) || ''), status: 'draft', date: _today(), players: [],
    teams: gms.map((g, i) => ({ name: g.teamName, captain: { id: g.id, name: g.name }, players: kept[i].map(p => ({ ...p, keeper: true })) })), keepersCount: kept.map(k => k.length), draftPool: pool, draftOrder: order, draftTurn: 0, draftPaused: true, timerSecs: 90, timerEnd: null, forbid };
  events = events.filter(e => e.id !== id); events.push(ev);
  if(!(await saveData())) return;
  await _evdInit(ev);
  await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', config: { status: 'draft', signupsOpen: false } }, { admin: true });
  showToast(_g('🎯 Draft utworzony — kliknij ▶ Start, gdy GM-owie będą gotowi', '🎯 Draft created — press ▶ Start when the GMs are ready'), 'success');
  openDraftView(id);
}
async function _gmSaveRosters(rosters) {
  const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', rosters, config: { status: 'season', signupsOpen: false } }, { admin: true });
  if(r.ok) { showToast(_g('✅ Składy GM-ów zapisane — sezon Ligi GM wystartował', '✅ GM rosters saved — the GM League season has started'), 'success'); if(document.getElementById('view-gm')?.classList.contains('active')) renderGmView(); }
  else showToast('❌ ' + r.error, 'error');
  return r.ok;
}
async function _gmaFetch() { const r = await _api('/gm/auction?season=' + encodeURIComponent(currentSeasonId || '_'), 'GET', null, {}); if(r.ok) { _gma = r.state; _gmaOffset = (r.serverNow || Date.now()) - Date.now(); try { _dnOnAuction(_gma); } catch(e) {} } return _gma; }
async function gmCreateAuction() {
  const st = _gmState, c = st.config, gms = st.gms || [];
  if(gms.length < 2) { showToast(_g('Potrzeba min. 2 GM-ów', 'At least 2 GMs needed'), 'info'); return; }
  const cur = await _gmaFetch();
  if(cur && !confirm(_g('Aukcja już istnieje — utworzyć od nowa (wszystkie licytacje znikną)?', 'An auction already exists — recreate it (all bids will be lost)?'))) { openGmAuction(); return; }
  const state = { roster: c.roster, budget: c.budget, bidSecs: 20, extendSecs: 12, nomSecs: 45,
    gms: gms.map(g => { const k = c.dynasty ? (_gmKeepersSplit(st)[g.id] || { ok: [], lost: [] }) : { ok: [], lost: [] };
      return { id: g.id, name: g.name, teamName: g.teamName, self: c.noSelf && g.player ? _normNick(g.player) : null, keepers: k.ok.map(p => ({ id: p.id, name: p.name, team: p.team, pos: p.pos, ovr: p.ovr, price: p.price })), bonus: k.lost.length * Math.round(0.1 * _gmCap(st)) }; }),
    pool: _gmPoolFull().filter(p => !(c.dynasty && Object.values(_gmKeepersSplit(st)).some(k => k.ok.some(x => x.id === p.id)))).map(p => ({ id: p.id, name: p.name, team: p.team, pos: p.pos, ovr: p.ovr, isNew: p.isNew })) };
  const r = await _api('/gm/auction/admin', 'POST', { seasonId: currentSeasonId || '_', action: 'init', state }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', config: { status: 'draft', signupsOpen: false } }, { admin: true });
  _gma = r.state; openGmAuction();
}
function openGmAuction() {
  let ov = document.getElementById('gma-overlay');
  if(!ov) { ov = document.createElement('div'); ov.id = 'gma-overlay'; ov.style.cssText = 'position:fixed;inset:0;z-index:9000;background:#07090f;overflow-y:auto;color:#e8eaf0'; document.body.appendChild(ov); }
  ov.style.display = 'block';
  const loop = async () => { if(ov.style.display === 'none') return; await _gmaFetch(); renderGmAuction(); };
  loop(); clearInterval(_gmaPoll); _gmaPoll = setInterval(() => { if(document.visibilityState === 'visible') loop(); }, 1500);
  clearInterval(_gmaTick); _gmaTick = setInterval(_gmaCountdown, 250);
}
function closeGmAuction() { const ov = document.getElementById('gma-overlay'); if(ov) ov.style.display = 'none'; clearInterval(_gmaPoll); clearInterval(_gmaTick); if(document.getElementById('view-gm')?.classList.contains('active')) renderGmView(); }
function _gmaCountdown() {
  const s = _gma, el = document.getElementById('gma-count'), bar = document.getElementById('gma-bar'); if(!s || !el) return;
  const now = Date.now() + _gmaOffset, end = s.current ? s.current.endsAt : s.nomDeadline;
  if(s.status !== 'live' || !end) { el.textContent = s.status === 'paused' ? '⏸' : ''; if(bar) bar.style.width = '0%'; return; }
  const left = Math.max(0, (end - now) / 1000), tot = s.current ? s.bidSecs : s.nomSecs;
  el.textContent = left.toFixed(left < 10 ? 1 : 0) + ' s'; el.style.color = left < 5 ? '#ef4444' : '#f5c518';
  if(bar) bar.style.width = Math.min(100, left / tot * 100) + '%';
}
function renderGmAuction() {
  const ov = document.getElementById('gma-overlay'), s = _gma; if(!ov) return;
  const admin = _isLoggedInSync(), me = s && discordUser ? s.gms.find(g => g.id === discordUser.id) : null;
  if(!s) { ov.innerHTML = `<div style="padding:2rem;text-align:center">${_g('Aukcja nie jest utworzona.', 'The auction has not been created.')} <button class="btn btn-ghost" onclick="closeGmAuction()">✕</button></div>`; return; }
  const nom = s.gms[s.nomIdx], cur = s.current, pl = cur ? s.pool.find(p => p.id === cur.playerId) : null, lead = cur ? s.gms.find(g => g.id === cur.bidder) : null;
  const myTurnNom = me && !cur && nom?.id === me.id && s.status === 'live', myMax = me ? _gmaMax(s, me) : 0;
  const turnKey = myTurnNom ? s.nomIdx + ':' + s.history.length : null;
  if(turnKey && window._gmaTurnKey !== turnKey) { try { _gmTurnAlert(); } catch(e) { try { navigator.vibrate?.([200, 100, 200]); } catch(_) {} } }
  window._gmaTurnKey = turnKey;
  const canBid = me && cur && s.status === 'live' && cur.bidder !== me.id && me.self !== cur.playerId && myMax > cur.bid;
  const stTxt = { live: _g('🔴 NA ŻYWO', '🔴 LIVE'), paused: _g('⏸ PAUZA', '⏸ PAUSED'), done: _g('🏁 ZAKOŃCZONA', '🏁 FINISHED') }[s.status];
  const q = (document.getElementById('gma-q')?.value || '').toLowerCase();
  ov.innerHTML = `<div data-notr style="max-width:1200px;margin:0 auto;padding:1rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;letter-spacing:1px">💰 ${_g('AUKCJA LIGI GM', 'GM LEAGUE AUCTION')} <span style="font-size:.9rem;color:${s.status === 'live' ? '#ef4444' : '#8a93a8'}">${stTxt}</span></div>
      <div style="display:flex;gap:.35rem;flex-wrap:wrap">
        ${admin ? `${s.status !== 'live' && s.status !== 'done' ? `<button class="btn btn-primary" style="font-size:.74rem" onclick="gmaAdmin('play')">▶ Start</button>` : ''}${s.status === 'live' ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="gmaAdmin('pause')">⏸ ${_g('Pauza', 'Pause')}</button>` : ''}
          <button class="btn btn-ghost" style="font-size:.74rem" onclick="gmaAdmin('skip')" title="${_g('Pomiń GM-a, który teraz zgłasza', 'Skip the GM who is nominating')}">⏭</button>
          <button class="btn btn-ghost" style="font-size:.74rem" onclick="gmaAdmin('undo')" title="${_g('Cofnij ostatnią sprzedaż', 'Undo last sale')}">↩</button>
          <button class="btn btn-ghost" style="font-size:.74rem" onclick="gmaFinish()">✅ ${_g('Zatwierdź składy', 'Confirm rosters')}</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.74rem" title="${_g('Animacja odkrycia karty przy każdej sprzedaży', 'Card reveal animation on every sale')}" onclick="localStorage.setItem('nba2k_dn', _dnOn() ? '0' : '1'); renderGmAuction()">🎬 ${_dnOn() ? 'ON' : 'OFF'}</button>
        <button class="btn btn-ghost" style="font-size:.74rem" onclick="closeGmAuction()">✕</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:minmax(280px,1fr) minmax(280px,1.2fr);gap:1rem">
      <div>
        <div style="background:#10131a;border:2px solid ${cur ? '#f5c518' : 'rgba(255,255,255,.1)'};border-radius:16px;padding:1rem;text-align:center">
          ${cur && pl ? `<div style="font-size:.8rem;color:#8a93a8">${_g('NA AUKCJI', 'ON THE BLOCK')}</div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.2rem">${_h(pl.name)}</div>
            <div style="font-size:.85rem;color:#8a93a8">${[pl.pos, pl.team, _g('ocena', 'rating') + ' ' + pl.ovr].filter(Boolean).map(_h).join(' · ')}</div>
            ${_gmaLotSkills(pl.name)}
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:3.4rem;color:#f5c518;line-height:1.1;margin-top:.4rem">${cur.bid}</div>
            <div style="font-size:.9rem">${_g('prowadzi', 'leading')}: <b>${_h(lead?.teamName || '—')}</b></div>`
            : `<div style="font-size:.9rem;color:#8a93a8;padding:.6rem 0">${s.status === 'done' ? _g('Wszystkie składy są pełne 🎉', 'All rosters are full 🎉') : nom ? _g('Zgłasza teraz', 'Nominating now') + `: <b style="color:#e8eaf0">${_h(nom.teamName)}</b>` : ''}</div>`}
          <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;margin:.6rem 0 .3rem"><div id="gma-bar" style="height:100%;width:0;background:#f5c518;transition:width .25s linear"></div></div>
          <div id="gma-count" style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem"></div>
          ${me ? `<div style="margin-top:.6rem;font-size:.78rem;color:#8a93a8">${_g('Twój budżet', 'Your budget')}: <b style="color:#e8eaf0">${me.left}</b> · ${_g('maks. oferta', 'max bid')}: <b style="color:#e8eaf0">${myMax}</b> · ${_g('wolne miejsca', 'open spots')}: ${_gmaSlots(s, me)}</div>` : ''}
          ${canBid ? `<div style="display:flex;gap:.35rem;justify-content:center;flex-wrap:wrap;margin-top:.6rem">${[1, 5, 10].filter(d => cur.bid + d <= myMax).map(d => `<button class="btn btn-primary" onclick="gmaBid(${cur.bid + d})">+${d} → ${cur.bid + d}</button>`).join('')}
            <input id="gma-amt" type="number" min="${cur.bid + 1}" max="${myMax}" placeholder="${cur.bid + 1}" style="width:80px;padding:.4rem;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#0b0e14;color:#fff"><button class="btn btn-ghost" onclick="gmaBid(+document.getElementById('gma-amt').value)">${_g('Licytuj', 'Bid')}</button></div>` : ''}
          ${me && cur && cur.bidder === me.id ? `<div style="margin-top:.5rem;color:#22c55e;font-weight:800">✅ ${_g('Prowadzisz!', 'You are leading!')}</div>` : ''}
        </div>
        ${myTurnNom ? `<div style="background:#10131a;border:2px solid #22c55e;border-radius:16px;padding:.8rem;margin-top:.8rem">
          <div style="font-weight:800;margin-bottom:.4rem">🎯 ${_g('Twoja kolej — zgłoś zawodnika', 'Your turn — nominate a player')}</div>
          <div style="display:flex;gap:.4rem;margin-bottom:.4rem"><input id="gma-q" placeholder="${_g('Szukaj…', 'Search…')}" value="${_h(q)}" oninput="renderGmAuction()" style="flex:1;padding:.4rem;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#0b0e14;color:#fff">
            <input id="gma-start" type="number" min="1" max="${myMax}" value="1" title="${_g('Cena wywoławcza', 'Starting bid')}" style="width:70px;padding:.4rem;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:#0b0e14;color:#fff"></div>
          <div style="margin-bottom:.35rem">${_pcSkSortSel('gma-sk', "window._gmSkSort=this.value;renderGmAuction()")}</div>
          <div style="max-height:260px;overflow-y:auto">${_pcSkSort(s.pool.filter(p => p.id !== me.self && (!q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))), window._gmSkSort).slice(0, 40).map(p => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid rgba(255,255,255,.06)"><span><b>${_h(p.name)}</b>${p.isNew ? ' 🆕' : ''} <span style="font-size:.74rem;color:#8a93a8">${[p.pos, p.team, p.ovr].filter(Boolean).map(_h).join(' · ')}</span> <span style="font-size:.72rem">${_pcMini(p.name)}</span></span><button class="btn btn-primary" style="font-size:.7rem;padding:.15rem .5rem" onclick="gmaNominate('${_h(p.id)}')">${_g('Zgłoś', 'Nominate')}</button></div>`).join('')}</div>
        </div>` : ''}
        <div style="margin-top:.8rem;font-size:.76rem;color:#8a93a8;max-height:180px;overflow-y:auto">${s.history.slice(0, 15).map(h => `<div>✅ <b style="color:#e8eaf0">${_h(h.player)}</b> → ${_h(h.gm)} · ${h.price}</div>`).join('')}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.6rem;align-content:start">
        ${s.gms.map((g, i) => `<div style="background:#10131a;border:1px solid ${i === s.nomIdx && !cur && s.status === 'live' ? '#22c55e' : g.id === cur?.bidder ? '#f5c518' : 'rgba(255,255,255,.08)'};border-radius:12px;padding:.6rem .7rem">
          <div style="display:flex;justify-content:space-between;gap:.4rem"><b>${_h(g.teamName)}</b><span style="color:#f5c518;font-weight:800">${g.left}</span></div>
          <div style="font-size:.7rem;color:#8a93a8;margin-bottom:.3rem">${_h(g.name)} · ${_g('max', 'max')} ${_gmaMax(s, g)} · ${g.players.length}/${s.roster}</div>
          ${g.players.map(p => `<div style="font-size:.76rem;display:flex;justify-content:space-between"><span>${_h(p.name)} <span style="color:#8a93a8">${_h(p.pos || '')}</span></span><span style="color:#8a93a8">${p.price}</span></div>`).join('')}
        </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:1rem;font-size:.72rem;color:#8a93a8">${_g(`Zasady: GM-owie zgłaszają zawodników po kolei (${s.nomSecs} s na zgłoszenie, inaczej system zgłosi najlepszego dostępnego). Licytacja trwa ${s.bidSecs} s, każda oferta przedłuża ją do min. ${s.extendSecs} s. Na każde wolne miejsce w składzie musi zostać min. 1 moneta.`, `Rules: GMs nominate players in turn (${s.nomSecs} s per nomination, otherwise the system nominates the best available). Bidding lasts ${s.bidSecs} s, each bid extends it to at least ${s.extendSecs} s. You must keep at least 1 coin per open roster spot.`)}</div>
  </div>`;
  _gmaCountdown();
  const qi = document.getElementById('gma-q'); if(qi && q) { qi.focus(); qi.setSelectionRange(q.length, q.length); }
}
// karta licytowanego zawodnika: archetyp, forma, 7 ocen i odznaki
function _gmaLotSkills(name) {
  const r = _pcSkFor(name); if(!r) return '';
  const sk = r.d.sk, LV = ['', '🥉', '🥈', '🥇', '💎'];
  return `<div style="font-size:.85rem;margin-top:.3rem">🧬 <b>${_h(currentLang === 'en' ? sk.arch.en : sk.arch.pl)}</b>${sk.form ? ` · ${sk.form.icon} ${_h(currentLang === 'en' ? sk.form.en : sk.form.pl)}` : ''}</div>
    <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:.25rem;margin:.45rem 0 .2rem">${_PC_SK.map(([k, ic, pl, en]) => `<div style="background:rgba(255,255,255,.05);border:1px solid ${_PC_GCOL(sk.attrs[k].g)}55;border-radius:8px;padding:.2rem 0"><div style="font-size:.6rem;color:#8a93a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ic} ${currentLang === 'en' ? en : pl}</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;color:${_PC_GCOL(sk.attrs[k].g)}">${sk.attrs[k].g}</div></div>`).join('')}</div>
    ${sk.badges.length ? `<div style="font-size:.72rem;color:#c8cdd8">${sk.badges.slice(0, 4).map(b => `${LV[b.l]} ${b.icon} ${_h(currentLang === 'en' ? b.en : b.pl)}`).join(' · ')}</div>` : ''}`;
}
async function gmaNominate(playerId) {
  const bid = Math.max(1, +document.getElementById('gma-start')?.value || 1);
  const r = await _api('/gm/auction/nominate', 'POST', { seasonId: currentSeasonId || '_', playerId, bid }, { session: true });
  if(r.state) _gma = r.state; if(!r.ok) showToast('❌ ' + _tr(r.error), 'error'); renderGmAuction();
}
async function gmaBid(amount) {
  if(!amount) return;
  const r = await _api('/gm/auction/bid', 'POST', { seasonId: currentSeasonId || '_', amount, expectV: _gma?.v }, { session: true });
  if(r.state) _gma = r.state; if(!r.ok) showToast('❌ ' + _tr(r.error), 'error'); renderGmAuction();
}
async function gmaAdmin(action) {
  if(action === 'undo' && !confirm(_g('Cofnąć ostatnią sprzedaż?', 'Undo the last sale?'))) return;
  const r = await _api('/gm/auction/admin', 'POST', { seasonId: currentSeasonId || '_', action }, { admin: true });
  if(r.state) _gma = r.state; if(!r.ok) showToast('❌ ' + r.error, 'error'); renderGmAuction();
}
async function gmaFinish() {
  const s = _gma; if(!s) return;
  const open = s.gms.filter(g => _gmaSlots(s, g) > 0).length;
  if(!confirm(open ? _g(`${open} GM-ów nie ma pełnego składu. Zatwierdzić mimo to?`, `${open} GMs don't have a full roster. Confirm anyway?`) : _g('Zatwierdzić składy i rozpocząć sezon Ligi GM?', 'Confirm the rosters and start the GM League season?'))) return;
  const rosters = Object.fromEntries(s.gms.map(g => [g.id, g.players.map(p => ({ name: p.name, team: p.team, price: p.price }))]));
  if(await _gmSaveRosters(rosters)) closeGmAuction();
}
function _gmFp(p, won) { // ta sama formuła co fantasy ligi
  const v = k => +p[k] || 0;
  let fp = v('pts') + v('reb') * 1.2 + v('ast') * 1.5 + v('stl') * 3 + v('blk') * 3 - v('to') + (won ? 2 : 0);
  const tens = ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => v(k) >= 10).length;
  fp += tens >= 3 ? 5 : tens >= 2 ? 3 : 0; fp += _GM_GRADE[String(p.grade || '').toUpperCase()] ?? 0;
  return Math.round(fp * 10) / 10;
}
function _gmSeason(st) {
  const c = st.config, sid = currentSeasonId || null, gms = st.gms || [], R = st.rosters || {};
  const from = st.draftedAt ? st.draftedAt.slice(0, 10) : '';
  const weeks = [...new Map(schedule.filter(s => s.generated && (s.seasonId || null) === sid && s.weekStart).map(s => [+s.week, s.weekStart])).entries()].sort((a, b) => a[0] - b[0])
    .filter(([, ws]) => !from || _ssAddDays(ws, 7) > from).map(([w, ws]) => ({ week: w, start: ws, end: _ssAddDays(ws, 7) }));
  const today = _today(), all = _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid));
  const fpByWeek = {}; // week → nick → { fp, games }
  weeks.forEach(w => { const o = fpByWeek[w.week] = {}; all.filter(m => String(m.date) >= w.start && String(m.date) < w.end).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, op]) => (t.players || []).forEach(p => {
    const k = _normNick(p.name), x = o[k] = o[k] || { fp: 0, games: 0 }; x.fp = Math.round((x.fp + _gmFp(p, +t.score > +op.score)) * 10) / 10; x.games++; }))); });
  const score = (gid, week) => {
    const Rw = _gmRosterAt(st, weeks.find(x => x.week === week)?.start || '9999');
    const list = (Rw[gid] || []).map(p => ({ name: p.name, team: p.team, ...(fpByWeek[week]?.[_normNick(p.name)] || { fp: 0, games: 0 }) })).sort((a, b) => b.fp - a.fp);
    list.forEach((p, i) => { p.counted = i < c.starters && p.games > 0; });
    return { total: Math.round(list.filter(p => p.counted).reduce((s, p) => s + p.fp, 0) * 10) / 10, list };
  };
  // terminarz pojedynków: każdy z każdym (metoda koła), powtarzany cyklicznie
  const ids = gms.map(g => g.id), n = ids.length, arr = n % 2 ? [...ids, null] : [...ids], rounds = [];
  for(let r = 0; r < arr.length - 1; r++) { const pairs = []; for(let i = 0; i < arr.length / 2; i++) pairs.push([arr[i], arr[arr.length - 1 - i]]); rounds.push(pairs); arr.splice(1, 0, arr.pop()); }
  const table = Object.fromEntries(gms.map(g => [g.id, { id: g.id, team: g.teamName, gm: g.name, w: 0, l: 0, t: 0, pf: 0, pa: 0 }]));
  const poN = c.tableMode === 'h2h' ? (+c.playoffTeams || 0) : 0, poStart = +c.playoffStart || 0, isPO = w => poN >= 2 && poStart > 0 && w.week >= poStart;
  let regIdx = 0;
  const weekData = weeks.map(w => {
    const live = today >= w.start && today < w.end, done = today >= w.end;
    const sc = Object.fromEntries(gms.map(g => [g.id, score(g.id, w.week)]));
    if(isPO(w)) return { ...w, live, done, sc, pairs: [], playoff: true };
    const k = regIdx++;
    const pairs = c.tableMode === 'h2h' && rounds.length ? rounds[k % rounds.length].map(([a, b]) => ({ a, b, sa: a ? sc[a].total : null, sb: b ? sc[b].total : null })) : [];
    if(done || live) {
      gms.forEach(g => { table[g.id].pf = Math.round((table[g.id].pf + sc[g.id].total) * 10) / 10; });
      if(done) pairs.forEach(p => { if(!p.a || !p.b) return; table[p.a].pa += p.sb; table[p.b].pa += p.sa; if(p.sa > p.sb) { table[p.a].w++; table[p.b].l++; } else if(p.sb > p.sa) { table[p.b].w++; table[p.a].l++; } else { table[p.a].t++; table[p.b].t++; } });
    }
    return { ...w, live, done, sc, pairs };
  });
  const standings = Object.values(table).sort((x, y) => c.tableMode === 'h2h' ? (y.w + y.t / 2) - (x.w + x.t / 2) || y.pf - x.pf : y.pf - x.pf);
  // play-offy: najlepsi z sezonu zasadniczego; rundy = kolejne tygodnie; remis wygrywa wyżej rozstawiony; przy 6 drużynach 1. i 2. mają wolny los
  let playoffs = null;
  if(poN >= 2 && poStart > 0 && standings.length >= poN) {
    const poWeeks = weekData.filter(w => w.playoff), rounds2 = []; let alive = standings.slice(0, poN).map((r, i) => ({ id: r.id, seed: i + 1 })), byes = [], champion = null;
    if(poN === 6) { byes = alive.slice(0, 2); alive = alive.slice(2); }
    for(let r = 0; r < 4; r++) {
      const W = poWeeks[r], srt = [...alive].sort((a, b) => a.seed - b.seed), pairs = [];
      for(let i = 0; i < srt.length / 2; i++) { const a = srt[i], b = srt[srt.length - 1 - i], sa = W ? W.sc[a.id]?.total ?? 0 : null, sb = W ? W.sc[b.id]?.total ?? 0 : null;
        pairs.push({ a: a.id, b: b.id, seedA: a.seed, seedB: b.seed, sa, sb, live: !!W?.live, win: W?.done ? ((sa > sb || (sa === sb && a.seed < b.seed)) ? a : b) : null }); }
      rounds2.push({ week: W?.week ?? null, pairs, byes: byes.map(x => x.id) });
      if(W) W.pairs = pairs.map(p => ({ a: p.a, b: p.b, sa: p.sa, sb: p.sb }));
      if(pairs.some(p => !p.win)) break;
      alive = pairs.map(p => p.win).concat(byes); byes = [];
      if(alive.length === 1) { champion = alive[0].id; break; }
    }
    playoffs = { teams: poN, start: poStart, rounds: rounds2, champion };
  }
  return { weeks: weekData, standings, playoffs };
}
function _gmSeasonHtml(st) {
  const c = st.config, S = _gmSeason(st), gm = Object.fromEntries((st.gms || []).map(g => [g.id, g]));
  if(!S.weeks.length) return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;font-size:.84rem">${_g('Punktacja ruszy razem z pierwszą kolejką ligi po drafcie.', 'Scoring starts with the first league round after the draft.')}</div>`;
  const cur = S.weeks.find(w => w.live) || [...S.weeks].reverse().find(w => w.done) || S.weeks[0];
  const selW = +(window._gmWeekSel || cur.week), W = S.weeks.find(w => w.week === selW) || cur;
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const tName = id => id ? `<a href="#" onclick="openGmTeam('${id}');return false" style="color:inherit;font-weight:800">${_h(gm[id]?.teamName || '?')}</a>` : `<span style="color:var(--muted)">${_g('pauza', 'bye')}</span>`;
  return _gmPlayoffsHtml(st, S, gm) + `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem">
    ${_isLoggedInSync() ? `<button class="btn btn-ghost" style="float:right;font-size:.7rem;padding:.15rem .5rem" onclick="openGmWeekGraphic()">🖼 ${_g('Grafika tygodnia', 'Weekly graphic')}</button>` : ''}
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📊 ${_g('TABELA LIGI GM', 'GM LEAGUE STANDINGS')} · ${c.tableMode === 'h2h' ? _g('pojedynki tygodniowe', 'weekly head-to-head') : _g('suma punktów', 'points total')}</div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.82rem"><thead><tr style="color:var(--muted);font-size:.68rem"><th style="text-align:left">#</th><th style="text-align:left">${_g('Drużyna', 'Team')}</th>${c.tableMode === 'h2h' ? `<th>W</th><th>L</th><th>${_g('R', 'T')}</th>` : ''}<th style="text-align:right">${_g('Pkt', 'PF')}</th>${c.tableMode === 'h2h' ? `<th style="text-align:right">${_g('Str.', 'PA')}</th>` : ''}</tr></thead>
    <tbody>${S.standings.map((r, i) => `<tr style="border-top:${i && i === (+c.playoffTeams || 0) && c.tableMode === 'h2h' && c.playoffStart ? '2px dashed var(--accent)' : '1px solid var(--border)'}${r.id === _gmMeId() ? ';background:rgba(245,197,24,.08)' : ''}"><td style="padding:.35rem .2rem;text-align:left;color:${i < 3 ? 'var(--accent)' : 'var(--muted)'};font-weight:800">${i + 1}</td><td style="text-align:left">${tName(r.id)} <span style="font-size:.7rem;color:var(--muted)">${_h(r.gm)}</span></td>${c.tableMode === 'h2h' ? `<td>${r.w}</td><td>${r.l}</td><td>${r.t}</td>` : ''}<td style="text-align:right;font-weight:800">${f1(r.pf)}</td>${c.tableMode === 'h2h' ? `<td style="text-align:right;color:var(--muted)">${f1(r.pa)}</td>` : ''}</tr>`).join('')}</tbody></table></div>
  </div>
  <div class="card" style="padding:.7rem 1rem;margin-bottom:1rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">${c.tableMode === 'h2h' ? '⚔️ ' + _g('POJEDYNKI', 'MATCHUPS') : '📈 ' + _g('WYNIKI TYGODNIA', 'WEEKLY SCORES')}</div>
      <select onchange="window._gmWeekSel=this.value;renderGmView()" style="${_MODAL_INP};width:auto;font-size:.78rem;padding:.2rem .4rem">${S.weeks.map(w => `<option value="${w.week}" ${w.week === W.week ? 'selected' : ''}>Week ${w.week}${w.live ? ' · ' + _g('trwa', 'live') : w.done ? '' : ' · ' + _g('przed nami', 'upcoming')}</option>`).join('')}</select>
    </div>
    ${c.tableMode === 'h2h' ? W.pairs.map(p => { const wa = W.done && p.sa > p.sb, wb = W.done && p.sb > p.sa;
      return `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;padding:.5rem .6rem;margin-bottom:.35rem;background:var(--surface2);border-radius:10px">
        <div>${tName(p.a)}</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;text-align:center;white-space:nowrap"><span style="color:${wa ? 'var(--win)' : 'inherit'}">${p.sa == null ? '—' : f1(p.sa)}</span> : <span style="color:${wb ? 'var(--win)' : 'inherit'}">${p.sb == null ? '—' : f1(p.sb)}</span></div>
        <div style="text-align:right">${tName(p.b)}</div></div>`; }).join('')
      : Object.entries(W.sc).sort((a, b) => b[1].total - a[1].total).map(([id, s], i) => `<div style="display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid var(--border)"><span><b style="color:var(--muted)">${i + 1}.</b> ${tName(id)}</span><b>${f1(s.total)}</b></div>`).join('')}
    <div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g(`Liczy się ${c.starters} najlepszych występów z ${c.roster} zawodników w tygodniu (punkty fantasy z prawdziwych meczów ligi).${W.live ? ' Tydzień trwa — wyniki aktualizują się po każdym meczu.' : ''}`, `The best ${c.starters} of ${c.roster} players' weekly performances count (fantasy points from real league games).${W.live ? ' The week is live — scores update after every game.' : ''}`)}</div>
  </div>`;
}
function _gmPlayoffsHtml(st, S, gm) {
  const P = S.playoffs; if(!P) return '';
  const f1 = v => v == null ? '—' : (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ','), nm = id => _h(gm[id]?.teamName || '?');
  const rName = (i, n) => { const left = n - i; return left === 1 ? _g('Finał', 'Final') : left === 2 ? _g('Półfinały', 'Semifinals') : left === 3 ? _g('Ćwierćfinały', 'Quarterfinals') : _g('Runda', 'Round') + ' ' + (i + 1); };
  const nRounds = P.teams === 8 ? 3 : P.teams === 6 ? 3 : P.teams === 4 ? 2 : 1, champ = P.champion;
  return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;border-color:var(--accent)">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin-bottom:.5rem">🏆 ${_g('PLAY-OFFY', 'PLAYOFFS')} · top ${P.teams} · ${_g('od', 'from')} Week ${P.start}</div>
    ${champ ? `<div style="text-align:center;padding:.6rem;margin-bottom:.6rem;border-radius:12px;background:rgba(245,197,24,.12)"><div style="font-size:.8rem;color:var(--muted)">${_g('MISTRZ LIGI GM', 'GM LEAGUE CHAMPION')}</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.8rem;color:var(--accent)">👑 ${nm(champ)}</div><div style="font-size:.8rem">GM: ${_h(gm[champ]?.name || '')}</div>
      ${_isLoggedInSync() && !st.champion ? `<button class="btn btn-primary" style="font-size:.74rem;margin-top:.4rem" onclick="gmAnnounceChampion('${champ}')">📣 ${_g('Ogłoś mistrza na Discordzie', 'Announce the champion on Discord')}</button>` : ''}</div>` : ''}
    <div style="display:grid;grid-template-columns:repeat(${nRounds},minmax(170px,1fr));gap:.6rem;overflow-x:auto">
      ${Array.from({ length: nRounds }, (_, i) => { const R = P.rounds[i]; return `<div><div style="font-size:.7rem;color:var(--muted);font-weight:800;margin-bottom:.3rem">${rName(i, nRounds)}${R?.week ? ' · W' + R.week : ''}</div>
        ${R ? R.pairs.map(p => `<div style="background:var(--surface2);border-radius:8px;padding:.35rem .5rem;margin-bottom:.35rem;font-size:.78rem">
          <div style="display:flex;justify-content:space-between;${p.win?.id === p.a ? 'color:var(--win);font-weight:800' : ''}"><span>${p.seedA}. ${nm(p.a)}</span><span>${f1(p.sa)}</span></div>
          <div style="display:flex;justify-content:space-between;${p.win?.id === p.b ? 'color:var(--win);font-weight:800' : ''}"><span>${p.seedB}. ${nm(p.b)}</span><span>${f1(p.sb)}</span></div></div>`).join('') + (R.byes.length ? `<div style="font-size:.7rem;color:var(--muted)">${_g('wolny los', 'bye')}: ${R.byes.map(nm).join(', ')}</div>` : '')
          : `<div style="font-size:.74rem;color:var(--muted)">${_g('czeka na poprzednią rundę', 'waiting for the previous round')}</div>`}</div>`; }).join('')}
    </div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g('Każda runda to jeden tydzień ligi; przy remisie awansuje wyżej rozstawiony.', 'Each round is one league week; ties go to the higher seed.')}</div>
  </div>`;
}
function openGmRosterEdit(gid) {
  const st = _gmState, g = (st.gms || []).find(x => x.id === gid); if(!g) return;
  const m = _fxModal('gmre-modal', 600), R = (st.rosters?.[gid] || []).map(p => ({ ...p }));
  window._gmRe = { gid, R };
  const draw = () => { m.querySelector('.modal').innerHTML = _fxHead('gmre-modal', '✏️ ' + _h(g.teamName)) + `<div data-notr>
    ${window._gmRe.R.map((p, i) => `<div style="display:grid;grid-template-columns:1fr 80px auto;gap:.4rem;align-items:center;margin-bottom:.3rem"><b style="font-size:.84rem">${_h(p.name)} <span style="font-size:.72rem;color:var(--muted);font-weight:400">${_h(p.team || '')}</span></b>
      <input type="number" min="0" value="${p.price || 0}" onchange="window._gmRe.R[${i}].price=+this.value" style="${_MODAL_INP};font-size:.8rem;padding:.2rem .35rem" title="${_g('Pensja', 'Salary')}">
      <button class="btn btn-ghost" style="font-size:.7rem;padding:.15rem .45rem;color:var(--loss)" onclick="window._gmRe.R.splice(${i},1);window._gmReDraw()">✕</button></div>`).join('')}
    <div style="display:flex;gap:.4rem;margin:.5rem 0"><input id="gmre-add" list="gmre-list" placeholder="${_g('Dodaj zawodnika…', 'Add a player…')}" style="${_MODAL_INP};font-size:.8rem"><datalist id="gmre-list">${_gmPool().map(p => `<option value="${_h(p.name)}">`).join('')}</datalist>
      <input id="gmre-price" type="number" min="0" value="1" style="${_MODAL_INP};width:80px;font-size:.8rem"><button class="btn btn-ghost" style="font-size:.74rem" onclick="gmReAdd()">➕</button></div>
    <label style="display:flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:.3rem 0"><input type="checkbox" id="gmre-retro" style="width:auto;margin:0"> ${_g('Korekta wstecz (zmienia też wyniki minionych tygodni — np. poprawka pomyłki)', 'Retroactive fix (also changes past weeks — e.g. correcting a mistake)')}</label>
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:.5rem">${_g('Bez zaznaczenia zmiana obowiązuje od najbliższego poniedziałku.', 'Unchecked, the change applies from next Monday.')}</div>
    <button class="btn btn-primary" onclick="gmReSave()">💾 ${_g('Zapisz skład', 'Save roster')}</button>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.6rem;font-size:.78rem"><b>🔄 ${_g('Zmiana GM-a (rezygnacja)', 'Change GM (resignation)')}</b>
      <div style="display:flex;gap:.4rem;margin-top:.3rem;flex-wrap:wrap"><input id="gmre-nid" placeholder="${_g('Discord ID nowego GM-a', 'New GM\'s Discord ID')}" style="${_MODAL_INP};font-size:.78rem;flex:1"><input id="gmre-nname" placeholder="${_g('Nazwa', 'Name')}" style="${_MODAL_INP};font-size:.78rem;width:130px">
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="gmReTransfer()">🔄 ${_g('Przekaż drużynę', 'Hand over the team')}</button></div></div></div>`; };
  window._gmReDraw = draw; draw(); m.classList.add('open');
}
function gmReAdd() { const n = document.getElementById('gmre-add').value.trim(); if(!n) return; const p = _gmPool().find(x => x.name === n); window._gmRe.R.push({ name: n, team: p?.team || '', price: +document.getElementById('gmre-price').value || 1 }); window._gmReDraw(); }
async function gmReSave() {
  const { gid, R } = window._gmRe, retro = document.getElementById('gmre-retro').checked;
  if(!confirm(retro ? _g('Zapisać korektę wstecz? Zmienią się wyniki minionych tygodni.', 'Save a retroactive fix? Past weeks\' scores will change.') : _g('Zapisać skład? Obowiązuje od poniedziałku.', 'Save the roster? It applies from Monday.'))) return;
  const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', setRoster: { gmId: gid, players: R, retro } }, { admin: true });
  showToast(r.ok ? _g('💾 Zapisano skład', '💾 Roster saved') : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) { _fxClose('gmre-modal'); renderGmView(); }
}
async function gmReTransfer() {
  const toId = document.getElementById('gmre-nid').value.trim(), name = document.getElementById('gmre-nname').value.trim();
  if(!/^\d{15,21}$/.test(toId)) { showToast(_g('Podaj poprawne Discord ID', 'Enter a valid Discord ID'), 'info'); return; }
  if(!confirm(_g('Przekazać drużynę nowemu GM-owi? Skład, pensje i historia zostają.', 'Hand the team to the new GM? Roster, salaries and history stay.'))) return;
  const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', transferGm: { fromId: window._gmRe.gid, toId, name } }, { admin: true });
  showToast(r.ok ? _g('🔄 Drużyna przekazana', '🔄 Team handed over') : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) { _fxClose('gmre-modal'); renderGmView(); }
}
async function gmAnnounceChampion(id) {
  const st = _gmState, g = (st.gms || []).find(x => x.id === id); if(!g || !confirm(_g(`Ogłosić ${g.teamName} mistrzem Ligi GM?`, `Announce ${g.teamName} as GM League champion?`))) return;
  const r = await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', champion: { gmId: id, teamName: g.teamName, gm: g.name } }, { admin: true });
  const ok = r.ok && await _discordPost('schedule', { route: 'weekSummary', content: `👑 **Mistrz Ligi GM / GM League champion: ${g.teamName}** (GM: ${g.name})\n${_seasonName(currentSeasonId) || ''} 🏆` });
  showToast(ok ? _g('👑 Ogłoszono mistrza', '👑 Champion announced') : '❌', ok ? 'success' : 'error'); renderGmView();
}
function openGmTeam(id) {
  const st = _gmState; if(!st) return;
  const g = (st.gms || []).find(x => x.id === id), S = _gmSeason(st), c = st.config;
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const totals = {}; S.weeks.filter(w => w.done || w.live).forEach(w => w.sc[id]?.list.forEach(p => { const t = totals[p.name] = totals[p.name] || { name: p.name, team: p.team, fp: 0, counted: 0, games: 0 }; t.fp += p.fp; t.games += p.games; if(p.counted) t.counted += p.fp; }));
  const roster = (st.rosters?.[id] || []).map(p => totals[p.name] || { name: p.name, team: p.team, fp: 0, counted: 0, games: 0 }).sort((a, b) => b.fp - a.fp);
  const m = _fxModal('gmteam-modal', 640);
  m.querySelector('.modal').innerHTML = _fxHead('gmteam-modal', `🏆 ${_h(g?.teamName || '')}`) + `<div data-notr>
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.6rem">GM: <b style="color:var(--text)">${_h(g?.name || '')}</b>${g?.player ? ` · ${_g('gra jako', 'plays as')} ${_h(g.player)}` : ''}</div>
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">📋 ${_g('SKŁAD', 'ROSTER')}</div>
    ${roster.map(p => `<div style="display:grid;grid-template-columns:1fr auto auto;gap:.6rem;padding:.35rem 0;border-bottom:1px solid var(--border);font-size:.82rem"><span><b>${_h(p.name)}</b> <span style="font-size:.72rem;color:var(--muted)">${_h(p.team || '')}</span></span><span style="color:var(--muted)">${p.games} ${_g('m.', 'g')}</span><b title="${_g('policzone do wyniku', 'counted towards score')}: ${f1(p.counted)}">${f1(p.fp)}</b></div>`).join('')}
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.8rem 0 .3rem">📅 ${_g('TYDZIEŃ PO TYGODNIU', 'WEEK BY WEEK')}</div>
    ${S.weeks.filter(w => w.done || w.live).map(w => { const p = w.pairs.find(x => x.a === id || x.b === id), mine = w.sc[id]?.total ?? 0, opp = p ? (p.a === id ? p.b : p.a) : null, os = opp ? w.sc[opp].total : null;
      const res = c.tableMode === 'h2h' && opp && w.done ? (mine > os ? `<b style="color:var(--win)">W</b>` : mine < os ? `<b style="color:var(--loss)">L</b>` : `<b>${_g('R', 'T')}</b>`) : '';
      return `<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--border);font-size:.8rem"><span>Week ${w.week}${w.live ? ' · ' + _g('trwa', 'live') : ''}${opp ? ` · vs ${_h((st.gms || []).find(x => x.id === opp)?.teamName || '')}` : ''}</span><span>${res} <b>${f1(mine)}</b>${os != null ? ` : ${f1(os)}` : ''}</span></div>`; }).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Jeszcze brak rozegranych tygodni.', 'No weeks played yet.')}</div>`}
  </div>`;
  m.classList.add('open');
}
function _gmRosterAt(st, date) { const h = (st.rosterHist || []).filter(x => x.from <= date).pop(); return h ? h.rosters : (st.rosters || {}); }
function _gmSeasonFp() { const sid = currentSeasonId || null, o = {}; _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid)).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, op]) => (t.players || []).forEach(p => { const k = _normNick(p.name); o[k] = Math.round(((o[k] || 0) + _gmFp(p, +t.score > +op.score)) * 10) / 10; }))); return o; }
function _gmMarketHtml(st) {
  const c = st.config, mk = st.market || { faab: {}, trades: [], log: [] }, me = _gmMeId() ? (st.gms || []).find(g => g.id === _gmMeId()) : null, admin = _isLoggedInSync();
  const gm = Object.fromEntries((st.gms || []).map(g => [g.id, g])), tab = window._gmMkTab || 'trades', f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const fp = _gmSeasonFp(), taken = new Set(Object.values(st.rosters || {}).flat().map(p => _normNick(p.name)));
  const tabBtn = (id, label) => `<button class="btn ${tab === id ? 'btn-primary' : 'btn-ghost'}" style="font-size:.74rem" onclick="window._gmMkTab='${id}';renderGmView()">${label}</button>`;
  const stLbl = t => ({ pending: _g('⏳ czeka na odpowiedź', '⏳ awaiting reply'), veto: _g('🕐 24 h na sprzeciw GM-ów', '🕐 24 h veto window'), approved: _g('✅ zatwierdzona', '✅ approved'), rejected: _g('❌ odrzucona przez admina', '❌ rejected by admin'), declined: _g('❌ odrzucona', '❌ declined'), vetoed: _g('🚫 zablokowana sprzeciwem', '🚫 vetoed'), cancelled: _g('↩ anulowana', '↩ cancelled') }[t.status] || t.status);
  const tradeCard = t => { const left = t.status === 'veto' ? Math.max(0, Math.ceil((Date.parse(t.acceptedAt) + 24 * 36e5 - Date.now()) / 36e5)) : 0, btn = [];
    if(me && t.status === 'pending' && t.to === me.id) btn.push(`<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="gmMk('respond',{id:'${t.id}',accept:true})">🤝 ${_g('Akceptuję', 'Accept')}</button><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="gmMk('respond',{id:'${t.id}',accept:false})">❌ ${_g('Odrzucam', 'Decline')}</button>`);
    if(me && t.status === 'pending' && t.from === me.id) btn.push(`<button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="gmMk('cancel',{id:'${t.id}'})">↩ ${_g('Anuluj', 'Cancel')}</button>`);
    if(me && t.status === 'veto' && ![t.from, t.to].includes(me.id) && !(t.vetoes || []).includes(me.id) && left > 0) btn.push(`<button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem;color:var(--loss)" onclick="gmMk('veto',{id:'${t.id}'})">🚫 ${_g('Sprzeciw', 'Veto')}</button>`);
    if(admin && t.status === 'veto') btn.push(`<button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .6rem" onclick="gmMkDecide('${t.id}',true,${left > 0})">✅ ${_g('Zatwierdź', 'Approve')}</button><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .6rem" onclick="gmMkDecide('${t.id}',false,false)">❌ ${_g('Odrzuć', 'Reject')}</button>`);
    return `<div style="background:var(--surface2);border-radius:10px;padding:.55rem .75rem;margin-bottom:.4rem">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:.5rem;align-items:center;font-size:.82rem"><div><b>${_h(gm[t.from]?.teamName || '?')}</b><div style="color:var(--muted);font-size:.74rem">${_g('oddaje', 'gives')}: ${t.give.map(_h).join(', ') || '—'}</div></div><div>⇄</div><div style="text-align:right"><b>${_h(gm[t.to]?.teamName || '?')}</b><div style="color:var(--muted);font-size:.74rem">${_g('oddaje', 'gives')}: ${t.get.map(_h).join(', ') || '—'}</div></div></div>
      ${t.note ? `<div style="font-size:.74rem;margin-top:.25rem">💬 ${_h(t.note)}</div>` : ''}
      ${['pending', 'veto'].includes(t.status) ? `<details style="margin-top:.3rem"><summary style="cursor:pointer;font-size:.72rem;color:var(--accent)">🔍 ${_g('Analiza wymiany', 'Trade analysis')}</summary>${_gmTradeAnalysisHtml(st, t.from, t.to, t.give, t.get)}</details>` : ''}
      <div style="font-size:.72rem;margin-top:.3rem;color:var(--muted)">${stLbl(t)}${t.status === 'veto' ? ` · ${left > 0 ? _g(`zostało ok. ${left} h`, `about ${left} h left`) : _g('czeka na admina', 'waiting for admin')} · ${_g('sprzeciwy', 'vetoes')}: ${(t.vetoes || []).length}` : ''}</div>
      ${btn.length ? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.35rem">${btn.join('')}</div>` : ''}</div>`; };
  let body = '';
  if(tab === 'trades') {
    const active = mk.trades.filter(t => ['pending', 'veto'].includes(t.status)), done = mk.trades.filter(t => !['pending', 'veto'].includes(t.status)).slice(0, 6);
    const others = (st.gms || []).filter(g => g.id !== me?.id), tgt = window._gmMkTo || others[0]?.id;
    body = `${me ? `<details style="background:var(--surface2);border-radius:10px;padding:.55rem .75rem;margin-bottom:.6rem"><summary style="cursor:pointer;font-weight:800">➕ ${_g('Zaproponuj wymianę', 'Propose a trade')}</summary>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-top:.5rem;font-size:.8rem">
        <div><div style="color:var(--muted);margin-bottom:.25rem">${_g('Oddajesz', 'You give')}:</div>${(st.rosters[me.id] || []).map(p => `<label style="display:flex;gap:.3rem;align-items:center;font-size:.8rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .15rem"><input type="checkbox" class="gmt-give" value="${_h(p.name)}" onchange="gmTradeAnalyze('${tgt}')" style="width:auto;margin:0"> ${_h(p.name)}</label>`).join('')}</div>
        <div><select onchange="window._gmMkTo=this.value;renderGmView()" style="${_MODAL_INP};font-size:.78rem;margin-bottom:.3rem">${others.map(g => `<option value="${g.id}" ${g.id === tgt ? 'selected' : ''}>${_h(g.teamName)}</option>`).join('')}</select>
          ${(st.rosters[tgt] || []).map(p => `<label style="display:flex;gap:.3rem;align-items:center;font-size:.8rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .15rem"><input type="checkbox" class="gmt-get" value="${_h(p.name)}" onchange="gmTradeAnalyze('${tgt}')" style="width:auto;margin:0"> ${_h(p.name)}</label>`).join('')}</div>
      </div>
      <div id="gmt-an"></div>
      <input id="gmt-note" maxlength="200" placeholder="${_g('Wiadomość (opcjonalnie)', 'Message (optional)')}" style="${_MODAL_INP};font-size:.8rem;margin-top:.4rem">
      <button class="btn btn-primary" style="font-size:.74rem;margin-top:.4rem" onclick="gmMkPropose('${tgt}')">🔁 ${_g('Wyślij propozycję', 'Send proposal')}</button></details>` : ''}
      ${active.map(tradeCard).join('') || `<div style="font-size:.8rem;color:var(--muted);margin-bottom:.4rem">${_g('Brak aktywnych wymian.', 'No active trades.')}</div>`}
      ${done.length ? `<div style="font-size:.7rem;color:var(--muted);margin:.5rem 0 .3rem">${_g('OSTATNIE', 'RECENT')}</div>${done.map(tradeCard).join('')}` : ''}`;
  } else {
    const fa = _gmPoolFull().filter(p => !taken.has(p.id) && !(c.noSelf && me && _normNick(me.player || '') === p.id)).map(p => ({ ...p, sfp: fp[p.id] || 0 })).sort((a, b) => b.sfp - a.sfp);
    const full = me && (st.rosters[me.id] || []).length >= c.roster;
    body = `${me ? `<div style="font-size:.8rem;margin-bottom:.5rem">💵 ${_g('Miejsce pod salary cap', 'Cap space')}: <b>${_gmCap(st) - _gmPay(st, me.id)}</b> <span style="color:var(--muted)">(${_gmPay(st, me.id)} / ${_gmCap(st)})</span>${_gmMyBids?.length ? ` · ${_g('Twoje oferty', 'Your bids')}: ${_gmMyBids.filter(b => b.status === 'open').map(b => `<b>${_h(b.player)}</b> ${b.amount}${b.drop ? ` (−${_h(b.drop)})` : ''} <a href="#" onclick="gmMk('bid',{cancel:'${b.id}'});return false" style="color:var(--loss)">✕</a>`).join(' · ') || '—'}` : ''}</div>` : ''}
      <div style="margin-bottom:.35rem">${_pcSkSortSel('gmfa-sk', "window._gmSkSort=this.value;renderGmView()")}</div>
      <div style="max-height:360px;overflow-y:auto">${_pcSkSort(fa, window._gmSkSort).slice(0, 60).map(p => `<div style="display:grid;grid-template-columns:1fr auto auto;gap:.5rem;align-items:center;padding:.35rem 0;border-bottom:1px solid var(--border);font-size:.8rem">
        <span><b>${_h(p.name)}</b>${p.isNew ? ' 🆕' : ''} <span style="font-size:.72rem;color:var(--muted)">${_h(p.pos || '')} · ${_h(p.team)}</span> <span style="font-size:.72rem">${_pcMini(p.name)}</span></span><span style="color:var(--muted)">${f1(p.sfp)} ${_g('pkt', 'pts')}</span>
        ${me ? `<span style="display:flex;gap:.25rem;align-items:center"><input id="fab-${p.id}" type="number" min="1" value="1" title="${_g('Pensja', 'Salary')}" style="width:56px;padding:.15rem .3rem;font-size:.76rem;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text)">${full ? `<select id="fad-${p.id}" style="font-size:.72rem;max-width:110px;padding:.15rem;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text)"><option value="">${_g('zwolnij…', 'drop…')}</option>${(st.rosters[me.id] || []).map(r => `<option value="${_h(r.name)}">${_h(r.name)}</option>`).join('')}</select>` : ''}<button class="btn btn-primary" style="font-size:.7rem;padding:.15rem .5rem" onclick="gmMkBid('${p.id}')">${_g('Oferta', 'Bid')}</button></span>` : '<span></span>'}</div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Brak wolnych agentów.', 'No free agents.')}</div>`}</div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g('Oferta = pensja zawodnika i musi zmieścić się pod salary cap (zwolnienie zawodnika uwalnia jego pensję). Oferty są ukryte; rozstrzygnięcie co poniedziałek ok. 10:00 — wygrywa najwyższa, przy remisie słabszy w tabeli. Zmiany obowiązują od poniedziałku.', 'A bid is the player\'s salary and must fit under the salary cap (dropping a player frees his salary). Bids are blind; they resolve every Monday around 10:00 — the highest wins, ties go to the lower-ranked team. Changes apply from Monday.')}${mk.lastRun ? ' · ' + _g('ostatnio', 'last run') + ': ' + new Date(mk.lastRun).toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'pl-PL') : ''}</div>
      ${admin ? `<button class="btn btn-ghost" style="font-size:.72rem;margin-top:.4rem" onclick="gmMkProcess()">⚖️ ${_g('Rozstrzygnij oferty teraz', 'Resolve bids now')} (${mk.bidCount || 0})</button>` : ''}`;
  }
  return `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.5rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🔁 ${_g('RYNEK', 'MARKET')}</div><div style="display:flex;gap:.3rem">${tabBtn('trades', '🔁 ' + _g('Wymiany', 'Trades'))}${tabBtn('fa', '🆓 ' + _g('Wolni agenci', 'Free agents'))}</div></div>
    ${body}
    ${mk.log?.length ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.6rem;border-top:1px solid var(--border);padding-top:.4rem">${mk.log.slice(0, 5).map(l => l.kind === 'fa' ? `🆓 ${_h(l.gm)}: +${_h(l.player)}${l.drop ? ` / −${_h(l.drop)}` : ''} (${l.amount})` : `🔁 ${_h(l.text)}`).join('<br>')}</div>` : ''}
  </div>`;
}
async function gmMk(action, body) {
  if(!_ensureSession()) return;
  if(action === 'veto' && !confirm(_g('Zgłosić sprzeciw wobec tej wymiany?', 'Veto this trade?'))) return;
  const r = await _api('/gm/market/' + action, 'POST', { seasonId: currentSeasonId || '_', ...body }, { session: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  showToast(_g('Zapisano', 'Saved'), 'success'); await _gmMyBidsLoad(); renderGmView();
}
async function gmMkPropose(to) {
  const give = [...document.querySelectorAll('.gmt-give:checked')].map(x => x.value), get = [...document.querySelectorAll('.gmt-get:checked')].map(x => x.value);
  await gmMk('trade', { to, give, get, note: document.getElementById('gmt-note').value.trim() });
}
async function gmMkBid(pid) {
  const p = _gmPoolFull().find(x => x.id === pid); if(!p) return;
  await gmMk('bid', { player: p.name, team: p.team, amount: +document.getElementById('fab-' + pid).value || 0, drop: document.getElementById('fad-' + pid)?.value || '' });
}
async function gmMkDecide(id, approve, early) {
  if(!confirm(approve ? (early ? _g('24 h na sprzeciw jeszcze trwa. Zatwierdzić mimo to?', 'The 24 h veto window is still open. Approve anyway?') : _g('Zatwierdzić wymianę? Obowiązuje od poniedziałku.', 'Approve the trade? It applies from Monday.')) : _g('Odrzucić wymianę?', 'Reject the trade?'))) return;
  const r = await _api('/gm/market/admin', 'POST', { seasonId: currentSeasonId || '_', action: 'decide', id, approve, force: early }, { admin: true });
  if(!r.ok) showToast('❌ ' + _tr(r.error), 'error'); renderGmView();
}
async function gmMkProcess() {
  if(!confirm(_g('Rozstrzygnąć teraz wszystkie oferty na wolnych agentów?', 'Resolve all free-agent bids now?'))) return;
  const S = _gmSeason(_gmState), r = await _api('/gm/market/admin', 'POST', { seasonId: currentSeasonId || '_', action: 'process', standOrder: S.standings.map(x => x.id) }, { admin: true });
  showToast(r.ok ? _g(`⚖️ Rozstrzygnięto ofert: ${r.processed}`, `⚖️ Bids resolved: ${r.processed}`) : '❌ ' + r.error, r.ok ? 'success' : 'error'); renderGmView();
}
async function _gmMyBidsLoad() { if(!discordUser?.session || !_gmState?.rosters) return; const r = await _api('/gm/market/bids', 'POST', { seasonId: currentSeasonId || '_' }, { session: true }); _gmMyBids = r.ok ? r.bids : null; }
// 🆕 nowi gracze — ocena wyjściowa (ręczna albo średnia)
function _gmIsNew(name) { return !_pcData(name, 'edition') && !_pcData(name, 'career'); }
function _gmRatingsHtml(c) {
  const nw = _gmPool().filter(p => _gmIsNew(p.name)); if(!nw.length) return '';
  return `<div style="margin-top:.6rem;font-size:.78rem"><b>🆕 ${_g('Nowi gracze bez statystyk', 'New players without stats')} (${nw.length})</b> — ${_g('ocena wyjściowa (podpowiedź w drafcie i kolejność auto-picka; domyślnie 70):', 'starting rating (draft hint and auto-pick order; default 70):')}
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.3rem">${nw.map(p => `<label style="display:flex;align-items:center;gap:.25rem;font-size:.74rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0;background:var(--surface2);border-radius:8px;padding:.15rem .4rem">${_h(p.name)} <input class="gmc-rt" data-k="${_normNick(p.name)}" type="number" min="40" max="99" value="${c.ratings?.[_normNick(p.name)] ?? 70}" style="width:48px;padding:.1rem .25rem;font-size:.74rem;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text)"></label>`).join('')}</div></div>`;
}
// 🖼 GRAFIKA TYGODNIA LIGI GM (1600×900, PL/EN) + podsumowanie dla podcastu
function _gmWeekLines(st, W) {
  const gm = Object.fromEntries((st.gms || []).map(g => [g.id, g])), top = id => W.sc[id]?.list.find(p => p.counted);
  if(st.config.tableMode === 'h2h') return W.pairs.filter(p => p.a && p.b).map(p => `${gm[p.a].teamName} ${p.sa} : ${p.sb} ${gm[p.b].teamName}` + (top(p.a) || top(p.b) ? ` (MVP: ${[top(p.a), top(p.b)].filter(Boolean).sort((x, y) => y.fp - x.fp)[0].name})` : ''));
  return Object.entries(W.sc).sort((a, b) => b[1].total - a[1].total).map(([id, s], i) => `${i + 1}. ${gm[id].teamName} ${s.total}`);
}
async function _gmWeekImage(st, W, lang) {
  const prevLang = _wgLang, prevTr = window._trOff; _wgLang = lang; window._trOff = true; // wersja PL zostaje po polsku także w angielskim widoku strony
  try {
  const Wd = 1600, H = 900, c = document.createElement('canvas'); c.width = Wd; c.height = H; const g = c.getContext('2d'), F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'";
  try { await document.fonts?.ready; } catch(e) {}
  await _wgBackground(g, Wd, H); await _wgHeader(g, Wd, lang === 'en' ? 'GM LEAGUE' : 'LIGA GM', 'WEEK ' + W.week, lang === 'en' ? _tr(_seasonName(currentSeasonId) || '') : (_seasonName(currentSeasonId) || ''));
  const gm = Object.fromEntries((st.gms || []).map(x => [x.id, x])), T = (pl, en) => lang === 'en' ? en : pl, n1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', lang === 'en' ? '.' : ',');
  const S = _gmSeason(st), rows = st.config.tableMode === 'h2h' ? W.pairs.filter(p => p.a && p.b) : [];
  const L = 40, colW = 1040, top0 = 170;
  if(rows.length) {
    const rh = Math.min(110, (H - top0 - 40) / rows.length - 12);
    rows.forEach((p, i) => { const y = top0 + i * (rh + 12), wa = p.sa > p.sb, wb = p.sb > p.sa;
      _wgRound(g, L, y, colW, rh, 16); g.fillStyle = 'rgba(8,11,19,.82)'; g.fill(); g.strokeStyle = 'rgba(245,197,24,.45)'; g.lineWidth = 1.5; g.stroke();
      const best = id => W.sc[id]?.list.find(x => x.counted);
      g.textAlign = 'left'; g.fillStyle = wa ? '#22c55e' : '#fff'; g.font = `900 ${_wgFit(g, gm[p.a].teamName, 360, 40)}px ${F}`; g.fillText(gm[p.a].teamName, L + 24, y + rh / 2 + 4);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 20px ${F}`; g.fillText(best(p.a) ? `⭐ ${best(p.a).name} ${n1(best(p.a).fp)}` : '', L + 24, y + rh / 2 + 30);
      g.textAlign = 'right'; g.fillStyle = wb ? '#22c55e' : '#fff'; g.font = `900 ${_wgFit(g, gm[p.b].teamName, 360, 40)}px ${F}`; g.fillText(gm[p.b].teamName, L + colW - 24, y + rh / 2 + 4);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 20px ${F}`; g.fillText(best(p.b) ? `${n1(best(p.b).fp)} ${best(p.b).name} ⭐` : '', L + colW - 24, y + rh / 2 + 30);
      g.textAlign = 'center'; g.fillStyle = '#f5c518'; g.font = `900 52px ${F}`; g.fillText(`${n1(p.sa)} : ${n1(p.sb)}`, L + colW / 2, y + rh / 2 + 18); });
  } else {
    Object.entries(W.sc).sort((a, b) => b[1].total - a[1].total).slice(0, 8).forEach(([id, s], i) => { const y = top0 + i * 82;
      _wgRound(g, L, y, colW, 70, 14); g.fillStyle = 'rgba(8,11,19,.82)'; g.fill();
      g.textAlign = 'left'; g.fillStyle = i < 3 ? '#f5c518' : '#fff'; g.font = `900 40px ${F}`; g.fillText(`${i + 1}. ${gm[id].teamName}`, L + 24, y + 48);
      g.textAlign = 'right'; g.fillText(n1(s.total), L + colW - 24, y + 48); });
  }
  const X = L + colW + 30, Wt = Wd - X - L;
  _wgRound(g, X, top0, Wt, H - top0 - 40, 16); g.fillStyle = 'rgba(8,11,19,.85)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.stroke();
  g.textAlign = 'left'; g.fillStyle = '#f5c518'; g.font = `900 28px ${F}`; g.fillText(T('TABELA', 'STANDINGS'), X + 20, top0 + 44);
  S.standings.slice(0, 12).forEach((r, i) => { const y = top0 + 90 + i * 46; g.fillStyle = i < 3 ? '#f5c518' : 'rgba(255,255,255,.55)'; g.font = `900 24px ${F}`; g.textAlign = 'left'; g.fillText(String(i + 1), X + 20, y);
    g.fillStyle = '#fff'; g.font = `800 ${_wgFit(g, r.team, Wt - 170, 24)}px ${F}`; g.fillText(r.team, X + 52, y);
    g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.8)'; g.font = `800 22px ${F}`; g.fillText(st.config.tableMode === 'h2h' ? `${r.w}-${r.l}` : n1(r.pf), X + Wt - 20, y); });
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `700 16px ${F}`; g.fillText((location.host || 'chemikleagues.com').replace(/^www\./, ''), Wd / 2, H - 12);
  return c.toDataURL('image/png');
  } finally { _wgLang = prevLang; window._trOff = prevTr; }
}
async function openGmWeekGraphic() {
  const st = _gmState, S = _gmSeason(st), weeks = S.weeks.filter(w => w.done || w.live); if(!weeks.length) { showToast(_g('Brak rozegranych tygodni', 'No weeks played yet'), 'info'); return; }
  const m = _fxModal('gmwg-modal', 900); m.classList.add('open');
  const W = weeks.find(w => w.week === +(window._gmWgWeek || 0)) || [...weeks].reverse().find(w => w.done) || weeks[weeks.length - 1];
  m.querySelector('.modal').innerHTML = _fxHead('gmwg-modal', '🖼 ' + _g('Grafika tygodnia Ligi GM', 'GM League weekly graphic')) + `<div data-notr>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.6rem"><select onchange="window._gmWgWeek=this.value;openGmWeekGraphic()" style="${_MODAL_INP};width:auto">${weeks.map(w => `<option value="${w.week}" ${w.week === W.week ? 'selected' : ''}>Week ${w.week}${w.live ? ' · ' + _g('trwa', 'live') : ''}</option>`).join('')}</select>
      <button class="btn btn-primary" onclick="gmWgSend(${W.week})">📣 ${_g('Wyślij PL + EN na Discord (i do podcastu)', 'Send PL + EN to Discord (and to the podcast)')}</button></div>
    <div id="gmwg-out" style="display:grid;gap:.6rem">⏳</div></div>`;
  const out = []; for(const l of ['pl', 'en']) out.push(`<div><img src="${await _gmWeekImage(st, W, l)}" style="width:100%;border-radius:10px"><a class="btn btn-ghost" style="font-size:.72rem;margin-top:.3rem;text-decoration:none" download="liga-gm-week-${W.week}-${l}.png" href="${await _gmWeekImage(st, W, l)}">⬇ ${l.toUpperCase()}</a></div>`);
  document.getElementById('gmwg-out').innerHTML = out.join('');
}
async function gmWgSend(week) {
  const st = _gmState, S = _gmSeason(st), W = S.weeks.find(w => w.week === +week); if(!W) return;
  if(!confirm(_g(`Wysłać grafiki Ligi GM (Week ${week}) na Discord?`, `Send the GM League graphics (Week ${week}) to Discord?`))) return;
  const lines = _gmWeekLines(st, W), lead = S.standings[0];
  await _api('/gm/admin', 'POST', { seasonId: currentSeasonId || '_', weekSummary: { week: W.week, lines: [...lines, lead ? `Lider: ${lead.team} (${st.config.tableMode === 'h2h' ? lead.w + '-' + lead.l : lead.pf})` : ''].filter(Boolean) } }, { admin: true });
  let ok = true;
  for(const l of ['pl', 'en']) ok = (await _discordPost('schedule', { route: 'weekSummary', content: l === 'pl' ? `🏆 **Liga GM — Week ${W.week}**\n${lines.join('\n')}` : `🏆 **GM League — Week ${W.week}** 🇬🇧` }, await _gmWeekImage(st, W, l), `liga-gm-week-${W.week}-${l}.png`)) && ok;
  showToast(ok ? _g('📣 Wysłano — wyniki trafią też do podcastu tygodnia', '📣 Sent — results will also go into the weekly podcast') : _g('❌ Discord nie przyjął grafiki', '❌ Discord rejected the graphic'), ok ? 'success' : 'error');
}
function _gmPrevSeasonId() { const i = (seasons || []).findIndex(x => x.id === currentSeasonId); return i > 0 ? seasons[i - 1].id : null; }
async function _gmPrevLoad() { const p = _gmPrevSeasonId(); if(!p) { _gmPrev = null; return null; } const r = await _api('/gm?season=' + encodeURIComponent(p), 'GET', null, {}); _gmPrev = r.ok && r.rosters ? r : null; return _gmPrev; }
// zatrzymani z podziałem: ważni (zawodnik zapisany w nowym sezonie) i przepadli (rekompensata)
function _gmKeepersSplit(st) {
  const pool = new Map(_gmPoolFull().map(p => [p.id, p])), out = {};
  Object.entries(st.keepers || {}).forEach(([gid, list]) => { out[gid] = { ok: [], lost: [] }; (list || []).forEach(k => { const p = pool.get(_normNick(k.name)); (p ? out[gid].ok : out[gid].lost).push(p ? { ...p, price: k.price, prevPrice: k.prevPrice } : k); }); });
  return out;
}
function _gmDynastyHtml(st) {
  const c = st.config; if(!c.dynasty || !['setup', 'signups'].includes(c.status)) return '';
  const me = _gmMeId() ? (st.gms || []).find(g => g.id === _gmMeId()) : null, prevR = _gmPrev?.rosters?.[_gmMeId()] || null;
  const pool = new Set(_gmPool().map(p => _normNick(p.name))), mine = (st.keepers || {})[_gmMeId()] || [], split = _gmKeepersSplit(st), raise = 1 + (c.keeperRaise ?? 10) / 100;
  const gm = Object.fromEntries((st.gms || []).map(g => [g.id, g]));
  return `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin-bottom:.4rem">👑 ${_g('DYNASTIA — ZATRZYMANI ZAWODNICY', 'DYNASTY — KEEPERS')}</div>
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.5rem">${_g(`Każdy GM z poprzedniego sezonu może zatrzymać do ${c.keepers} ${_plPL(c.keepers, 'zawodnika', 'zawodników', 'zawodników')} ze swojego składu, z pensją wyższą o ${c.keeperRaise ?? 10}%. Gdy zatrzymany zawodnik nie zapisze się do ligi, miejsce przepada, a GM dostaje rekompensatę (w aukcji dodatkowy budżet, w snake wcześniejszy wybór).`, `Every GM from last season can keep up to ${c.keepers} ${c.keepers === 1 ? 'player' : 'players'} from their roster, with a salary raised by ${c.keeperRaise ?? 10}%. If a kept player doesn't sign up for the league, the spot is lost and the GM gets compensation (extra auction budget or an earlier snake pick).`)}</div>
    ${me && prevR ? `<div style="background:var(--surface2);border-radius:10px;padding:.55rem .75rem;margin-bottom:.6rem">
      <b>${_g('Twój skład z poprzedniego sezonu', 'Your roster from last season')}</b>
      ${prevR.map(p => { const on = mine.some(k => _normNick(k.name) === _normNick(p.name)), here = pool.has(_normNick(p.name));
        return `<label style="display:flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:.25rem 0"><input type="checkbox" class="gmk" value="${_h(p.name)}" ${on ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> <b>${_h(p.name)}</b> <span style="color:var(--muted);font-size:.74rem">💵 ${+p.price || 1} → ${Math.max(1, Math.round((+p.price || 1) * raise))}</span> ${here ? `<span style="color:var(--win);font-size:.72rem">✓ ${_g('gra w tym sezonie', 'plays this season')}</span>` : `<span style="color:#f59e0b;font-size:.72rem">⚠ ${_g('jeszcze niezapisany', 'not signed up yet')}</span>`}</label>`; }).join('')}
      <button class="btn btn-primary" style="font-size:.74rem;margin-top:.3rem" onclick="gmKeepSave(${c.keepers})">💾 ${_g('Zapisz zatrzymanych', 'Save keepers')}</button></div>` : (me ? `<div style="font-size:.78rem;color:var(--muted);margin-bottom:.5rem">${_g('Nie masz składu z poprzedniego sezonu — wejdziesz do draftu bez zatrzymanych.', 'You have no roster from last season — you’ll enter the draft without keepers.')}</div>` : '')}
    ${Object.keys(split).length ? `<div style="font-size:.78rem">${Object.entries(split).map(([gid, s]) => `<div style="padding:.25rem 0;border-bottom:1px solid var(--border)"><b>${_h(gm[gid]?.teamName || '?')}</b>: ${s.ok.map(p => `👑 ${_h(p.name)} (💵${p.price})`).join(', ') || '—'}${s.lost.length ? ` <span style="color:#f59e0b">· ${_g('przepada', 'lost')}: ${s.lost.map(p => _h(p.name)).join(', ')} → ${_g('rekompensata', 'compensation')}</span>` : ''}</div>`).join('')}</div>` : ''}
  </div>`;
}
async function gmKeepSave(max) {
  if(!_ensureSession()) return;
  const keep = [...document.querySelectorAll('.gmk:checked')].map(x => x.value);
  if(keep.length > max) { showToast(_g(`Możesz zatrzymać maks. ${max}`, `You can keep at most ${max}`), 'info'); return; }
  const r = await _api('/gm/keepers', 'POST', { seasonId: currentSeasonId || '_', prevSeasonId: _gmPrevSeasonId(), keep }, { session: true });
  showToast(r.ok ? _g('👑 Zapisano zatrzymanych', '👑 Keepers saved') : '❌ ' + _tr(r.error), r.ok ? 'success' : 'error'); if(r.ok) renderGmView();
}
// ═══ 🎧 DJ — mini-odtwarzacz SoundCloud (gra dalej przy zmianie zakładek) + ustawienia admina ═══
function _djSrc(url) { return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%23f5c518&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false'; }
function _scApi() { return window.SC?.Widget ? Promise.resolve() : (window._scApiP = window._scApiP || new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://w.soundcloud.com/player/api.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); })); }
function djPlay(url) {
  if(!url) return; try { localStorage.setItem('nba2k_dj_src', url); } catch(e) {}
  const fr = document.getElementById('dj-frame'); if(!fr) return;
  fr.innerHTML = `<iframe id="dj-iframe" width="100%" height="${/soundcloud\.com\/[^/]+\/?$/.test(url) ? 300 : 120}" scrolling="no" frameborder="no" allow="autoplay" src="${_djSrc(url)}"></iframe>`;
  const fab = document.getElementById('dj-fab');
  _scApi().then(() => { const w = SC.Widget(document.getElementById('dj-iframe'));
    w.bind(SC.Widget.Events.READY, () => w.play()); // start także przy liście setów (od pierwszego)
    w.bind(SC.Widget.Events.PLAY, () => { if(fab) { fab.style.borderColor = 'var(--win)'; fab.textContent = '🎶'; } });
    w.bind(SC.Widget.Events.PAUSE, () => { if(fab) { fab.style.borderColor = 'var(--accent)'; fab.textContent = '🎧'; } });
  }).catch(() => {});
}
function djClose() { document.getElementById('dj-panel')?.remove(); const b = document.getElementById('dj-fab'); if(b) { b.style.borderColor = 'var(--accent)'; b.textContent = '🎧'; } }
async function openDjSettings() {
  const r = await _api('/dj-settings', 'POST', {}, { admin: true }); if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  const d = r.dj || {}, m = _fxModal('dj-modal', 600);
  m.querySelector('.modal').innerHTML = _fxHead('dj-modal', '🎧 DJ / SoundCloud') + `<div data-notr style="font-size:.8rem">
    <label style="display:flex;align-items:center;gap:.4rem;font-weight:700;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .6rem"><input type="checkbox" id="dj-on" ${d.enabled ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('Pokaż odtwarzacz 🎧 na stronie', 'Show the 🎧 player on the website')}</label>
    <label style="${_MODAL_LBL}">${_g('Nazwa DJ-a', 'DJ name')}</label><input id="dj-name" value="${_h(d.name || '')}" style="${_MODAL_INP}">
    <label style="${_MODAL_LBL}">${_g('Profil SoundCloud', 'SoundCloud profile')}</label><input id="dj-profile" value="${_h(d.profile || '')}" placeholder="https://soundcloud.com/twoj-profil" style="${_MODAL_INP}">
    <label style="${_MODAL_LBL}">${_g('Wyróżnione sety (link w każdej linii, opcjonalnie)', 'Featured sets (one link per line, optional)')}</label><textarea id="dj-sets" rows="3" style="${_MODAL_INP};font-size:.78rem">${_h((d.sets || []).join('\n'))}</textarea>
    <label style="${_MODAL_LBL}">${_g('Kanał RSS (do ogłaszania nowych setów)', 'RSS feed (to announce new sets)')}</label><input id="dj-rss" value="${_h(d.rss || '')}" placeholder="https://feeds.soundcloud.com/users/soundcloud:users:…/sounds.rss" style="${_MODAL_INP}">
    <div style="font-size:.7rem;color:var(--muted);margin:.2rem 0 .5rem">${_g('Gdzie go znaleźć: SoundCloud → Settings → Content → „RSS feed” (skopiuj adres).', 'Where to find it: SoundCloud → Settings → Content → “RSS feed” (copy the address).')}</div>
    <label style="display:flex;align-items:center;gap:.4rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 .6rem"><input type="checkbox" id="dj-ann" ${d.announce ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> ${_g('Ogłaszaj nowe sety na Discordzie (kanał „Nowy set DJ” w 📣 Kanałach powiadomień; bot sprawdza co godzinę)', 'Announce new sets on Discord (“New DJ set” channel in 📣 Notification channels; checked hourly)')}</label>
    <div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-primary" onclick="djSave()">💾 ${_g('Zapisz', 'Save')}</button><button class="btn btn-ghost" onclick="djTest()">🔎 ${_g('Sprawdź RSS', 'Check RSS')}</button></div>
    <div id="dj-st" style="margin-top:.5rem;min-height:1em"></div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g('Na Discordzie działa też komenda /set — pokazuje najnowszy set.', 'On Discord, the /set command shows the latest set.')}</div></div>`;
  m.classList.add('open');
}
function _djForm() { const v = id => document.getElementById(id); return { save: true, enabled: v('dj-on').checked, name: v('dj-name').value.trim(), profile: v('dj-profile').value.trim(), rss: v('dj-rss').value.trim(), sets: v('dj-sets').value.split('\n').map(x => x.trim()).filter(Boolean), announce: v('dj-ann').checked }; }
async function djSave() { const r = await _api('/dj-settings', 'POST', _djForm(), { admin: true }); showToast(r.ok ? _g('💾 Zapisano — odśwież stronę, żeby zobaczyć odtwarzacz', '💾 Saved — reload to see the player') : '❌ ' + r.error, r.ok ? 'success' : 'error'); }
async function djTest() { const st = document.getElementById('dj-st'); st.textContent = '⏳'; const r = await _api('/dj-settings', 'POST', { ..._djForm(), test: true }, { admin: true });
  st.innerHTML = r.latest ? `✅ ${_g('Najnowszy set', 'Latest set')}: <b>${_h(r.latest.title)}</b>` : `<span style="color:var(--loss)">❌ ${_h(r.error || 'Błąd')}</span>`; }
function _isXEditor() { return _isLoggedInSync() || (discordUser && (window._xEditors || []).includes(discordUser.id)); }
// 📋 RĘCZNA PUBLIKACJA NA X (bez API i kredytów): kopiuj tekst, pobierz / udostępnij grafiki, otwórz X, oznacz jako opublikowane
function _xqParts(id) { const d = _xq.find(x => x.id === id); return d ? d.parts.map((p, pi) => ({ lang: p.lang, text: document.getElementById(`xq-t-${id}-${pi}`)?.value ?? p.text, images: [...document.querySelectorAll(`.xq-i-${id}-${pi}:checked`)].map(x => +x.value) })) : []; }
async function _xqFiles(id, ns) { const out = []; for(const n of ns) { const r = await fetch(_xqImgUrl(id, n)); const b = await r.blob(); out.push(new File([b], `chemik-${id}-${n}.jpg`, { type: 'image/jpeg' })); } return out; }
function xqManual(id) {
  const d = _xq.find(x => x.id === id); if(!d) return; const parts = _xqParts(id); window._xqm = { id, parts };
  const canShare = !!(navigator.canShare && navigator.share), m = _fxModal('xqm-modal', 620); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('xqm-modal', '📋 ' + _g('Publikacja ręczna na X', 'Manual posting to X')) + `<div data-notr style="font-size:.84rem">
    <div style="color:var(--muted);margin-bottom:.7rem">${_g('Bez API i bez kredytów — publikujesz ze swojego konta X. ', 'No API, no credits — you post from your own X account. ')}${canShare ? _g('Na telefonie najszybciej: <b>📤 Udostępnij</b> → aplikacja X (tekst i grafiki naraz).', 'On a phone the quickest way: <b>📤 Share</b> → the X app (text and graphics together).') : _g('Pobierz grafiki, otwórz X (tekst wklei się sam) i dołącz grafiki.', 'Download the graphics, open X (the text is pre-filled) and attach the graphics.')}</div>
    ${parts.map((p, pi) => `<div class="card" style="padding:.65rem .8rem;margin-bottom:.6rem">
      <div style="font-weight:800;margin-bottom:.3rem">${pi + 1}. ${pi === 0 ? _g('Wpis', 'Post') : _g('Odpowiedź do wpisu (w tym samym wątku)', 'Reply to the post (same thread)')} ${p.lang === 'en' ? '🇬🇧' : '🇵🇱'} <span style="font-weight:400;color:var(--muted);font-size:.74rem">· ${p.images.length} ${_g('graf.', 'img')}</span></div>
      <div style="white-space:pre-wrap;font-size:.78rem;background:var(--surface2);border-radius:8px;padding:.45rem .55rem;max-height:120px;overflow:auto">${_h(p.text)}</div>
      ${pi > 0 ? `<div style="font-size:.72rem;color:var(--muted);margin-top:.3rem">${_g('Najpierw opublikuj wpis 1 i wklej jego link w polu na dole — wtedy „Otwórz X” otworzy odpowiedź pod nim (ten sam wątek).', 'Post #1 first and paste its link in the field below — then “Open X” opens a reply under it (same thread).')}</div>` : ''}
      <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.45rem">
        ${canShare ? `<button class="btn btn-primary" style="font-size:.74rem" onclick="xqmShare(${pi})">📤 ${_g('Udostępnij', 'Share')}</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.74rem" onclick="xqmCopy(${pi})">📋 ${_g('Kopiuj tekst', 'Copy text')}</button>
        ${p.images.length ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="xqmDownload(${pi})">⬇️ ${_g('Pobierz grafiki', 'Download graphics')} (${p.images.length})</button>` : ''}
        <button class="btn btn-ghost" style="font-size:.74rem" onclick="xqmOpen(${pi})">↗ ${pi === 0 ? _g('Otwórz X', 'Open X') : _g('Otwórz X (odpowiedź)', 'Open X (reply)')}</button>
      </div></div>`).join('')}
    <div style="border-top:1px solid var(--border);padding-top:.6rem;margin-top:.2rem">
      <div style="font-size:.78rem;margin-bottom:.3rem">${_g('Po publikacji wklej link do wpisu (opcjonalnie — wtedy wpis pojawi się też na Discordzie):', 'After posting paste the post link (optional — then it’s also announced on Discord):')}</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap"><input id="xqm-link" placeholder="https://x.com/…/status/…" style="${_MODAL_INP};flex:1;min-width:220px;margin:0">
        <button class="btn btn-primary" onclick="xqmDone()">✅ ${_g('Oznacz jako opublikowane', 'Mark as posted')}</button></div></div></div>`;
}
function xqmOpen(pi) { // ↗ X z gotowym tekstem; część 2+ jako odpowiedź pod wpisem 1 (gdy wklejono jego link)
  const p = _xqm.parts[pi], id = pi > 0 ? (/\/status\/(\d+)/.exec(document.getElementById('xqm-link')?.value || '') || [])[1] : null;
  if(pi > 0 && !id) showToast(_g('Wklej najpierw link wpisu 1 na dole — wtedy X otworzy odpowiedź w wątku. Otwieram jako nowy wpis.', 'Paste the link of post #1 below first — then X opens a reply in the thread. Opening as a new post.'), 'info');
  window.open('https://x.com/intent/post?text=' + encodeURIComponent(p.text) + (id ? '&in_reply_to=' + id : ''), '_blank');
}
async function xqmCopy(pi) { try { await navigator.clipboard.writeText(_xqm.parts[pi].text); showToast(_g('📋 Skopiowano tekst', '📋 Text copied'), 'success'); } catch(e) { prompt(_g('Skopiuj tekst:', 'Copy the text:'), _xqm.parts[pi].text); } }
async function xqmDownload(pi) {
  const p = _xqm.parts[pi];
  try { const files = await _xqFiles(_xqm.id, p.images); files.forEach((f, i) => setTimeout(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, i * 350)); showToast(_g(`⬇️ Pobieram ${files.length} grafiki`, `⬇️ Downloading ${files.length} graphics`), 'success'); }
  catch(e) { p.images.forEach(n => window.open(_xqImgUrl(_xqm.id, n), '_blank')); }
}
async function xqmShare(pi) {
  const p = _xqm.parts[pi];
  try { const files = await _xqFiles(_xqm.id, p.images), data = { text: p.text, ...(files.length && navigator.canShare({ files }) ? { files } : {}) };
    try { await navigator.clipboard.writeText(p.text); } catch(e) {} // część aplikacji pomija tekst przy udostępnianiu plików — wtedy wystarczy wkleić
    await navigator.share(data); } catch(e) { if(e?.name !== 'AbortError') showToast(_g('Udostępnianie niedostępne — użyj „Pobierz grafiki” i „Kopiuj tekst”', 'Sharing unavailable — use “Download graphics” and “Copy text”'), 'info'); }
}
async function xqmDone() {
  const link = document.getElementById('xqm-link').value.trim();
  if(link && !/^https:\/\/(x|twitter)\.com\/\w+\/status\/\d+/.test(link)) { showToast(_g('To nie wygląda na link do wpisu na X', 'That doesn’t look like an X post link'), 'info'); return; }
  const r = await _api('/x-drafts/manual', 'POST', { id: _xqm.id, parts: _xqm.parts, link }, { admin: _isLoggedInSync(), session: !!discordUser?.session });
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _fxClose('xqm-modal'); showToast(link ? _g('✅ Oznaczono i ogłoszono na Discordzie', '✅ Marked and announced on Discord') : _g('✅ Oznaczono jako opublikowane', '✅ Marked as posted'), 'success'); openXQueue();
}
async function openXQueue() {
  if(!_isXEditor()) { showToast(_g('Brak dostępu do kolejki X', 'No access to the X queue'), 'info'); return; }
  const m = _fxModal('xq-modal', 760); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('xq-modal', '🐦 ' + _g('Kolejka X', 'X queue')) + '<div style="color:var(--muted)">⏳</div>';
  const r = await _api('/x-drafts', 'GET', null, { admin: _isLoggedInSync(), session: !!discordUser?.session });
  if(!r.ok) { m.querySelector('.modal').innerHTML += `<div style="color:var(--loss)">❌ ${_h(_tr(r.error))}</div>`; return; }
  _xq = r.drafts || []; _xqDraw();
}
function _xqDraw() {
  const box = document.querySelector('#xq-modal .modal'); if(!box) return;
  const pend = _xq.filter(d => d.status === 'pending'), done = _xq.filter(d => d.status !== 'pending').slice(0, 10);
  const img = (d, n) => `${workerUrl.replace(/\/+$/, '')}/x-drafts/img/${d.id}/${n}.jpg`;
  box.innerHTML = _fxHead('xq-modal', '🐦 ' + _g('Kolejka X', 'X queue')) + `<div data-notr>
    ${_xEditorsHtml()}
    ${pend.map(d => `<div style="background:var(--surface2);border:1px solid var(--accent);border-radius:12px;padding:.7rem .85rem;margin-bottom:.8rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;flex-wrap:wrap"><b>${_h(d.title)}</b><span style="font-size:.72rem;color:var(--muted)">${new Date(d.createdAt).toLocaleString(currentLang === 'en' ? 'en-GB' : 'pl-PL')}${d.editedBy ? ' · ✏️ ' + _h(d.editedBy) : ''}</span></div>
      ${d.parts.map((p, pi) => `<div style="margin-top:.6rem">
        <div style="font-size:.72rem;font-weight:800;color:var(--muted);margin-bottom:.25rem">${pi === 0 ? '🐦 ' + _g('Wpis', 'Post') : '↪ ' + _g('Odpowiedź w wątku', 'Thread reply')} · ${p.lang === 'en' ? '🇬🇧' : '🇵🇱'}</div>
        <textarea id="xq-t-${d.id}-${pi}" rows="5" oninput="_xqCount('${d.id}',${pi})" style="${_MODAL_INP};font-size:.82rem;line-height:1.45">${_h(p.text)}</textarea>
        <div id="xq-c-${d.id}-${pi}" style="font-size:.7rem;text-align:right;color:var(--muted)">${_xLen(p.text)}/280</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.25rem">${d.images.map(im => `<label style="position:relative;cursor:pointer;margin:0"><input type="checkbox" class="xq-i-${d.id}-${pi}" value="${im.n}" ${p.images.includes(im.n) ? 'checked' : ''} style="position:absolute;top:6px;left:6px;width:auto;margin:0;z-index:1;accent-color:var(--accent)"><img src="${img(d, im.n)}" title="${_h(im.name)}" style="width:150px;border-radius:8px;display:block"></label>`).join('')}</div>
      </div>`).join('')}
      <div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${_g('Zaznacz grafiki do wpisu (maks. 4). Emoji liczą się jak 2 znaki.', 'Tick the graphics for the post (max 4). Emoji count as 2 characters.')}</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem">
        <button class="btn btn-primary" onclick="xqAct('${d.id}','publish')">🐦 ${_g('Opublikuj na X (API)', 'Post to X (API)')}</button>
        <button class="btn btn-primary" style="background:#1d9bf0;border-color:#1d9bf0" onclick="xqManual('${d.id}')">📋 ${_g('Publikuj ręcznie', 'Post manually')}</button>
        <button class="btn btn-ghost" onclick="xqAct('${d.id}','update')">💾 ${_g('Zapisz poprawki', 'Save edits')}</button>
        <button class="btn btn-ghost" style="color:var(--loss)" onclick="xqAct('${d.id}','reject')">🗑 ${_g('Odrzuć', 'Reject')}</button>
      </div></div>`).join('') || `<div style="font-size:.84rem;color:var(--muted);margin-bottom:.8rem">${_g('Nic nie czeka na publikację 👍', 'Nothing waiting to be posted 👍')}</div>`}
    ${done.length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin:.5rem 0 .3rem">${_g('HISTORIA', 'HISTORY')}</div>${done.map(d => `<div style="font-size:.78rem;padding:.3rem 0;border-bottom:1px solid var(--border)">${d.status === 'published' ? (d.manual ? '✅📋' : '✅') : '🗑'} <b>${_h(d.title)}</b> <span style="color:var(--muted)">· ${_h(d.by || '')}</span>${(d.links || []).map((l, i) => ` · <a href="${_h(l)}" target="_blank" rel="noopener" style="color:var(--accent)">${_g('wpis', 'post')} ${i + 1} ↗</a>`).join('')}</div>`).join('')}` : ''}
  </div>`;
}
// 👥 redaktorzy X (admin): lista z nazwami, dodawanie z listy znanych osób albo po Discord ID
function _xKnownUsers() {
  const m = new Map();
  (playersList || []).forEach(p => p.id && m.set(p.id, p.name || p.gamertag));
  (teamRegistrations || []).forEach(r => r.captain?.id && !m.has(r.captain.id) && m.set(r.captain.id, r.captain.name));
  (freeAgents || []).forEach(f => f.discordId && !m.has(f.discordId) && m.set(f.discordId, f.name));
  return m;
}
function _xEditorsHtml() {
  if(!_isLoggedInSync()) return '';
  const known = _xKnownUsers(), eds = window._xEditors || [];
  return `<div style="background:var(--surface2);border-radius:12px;padding:.6rem .8rem;margin-bottom:.8rem">
    <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">👥 ${_g('REDAKTORZY X — kto może sprawdzać i publikować', 'X EDITORS — who can review and post')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.45rem">${eds.map(id => `<span style="display:inline-flex;align-items:center;gap:.3rem;background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:.2rem .55rem;font-size:.78rem">✍️ ${_h(known.get(id) || id)}<a href="#" onclick="xEditorsSet((window._xEditors||[]).filter(x=>x!=='${id}'));return false" style="color:var(--loss);text-decoration:none">✕</a></span>`).join('') || `<span style="font-size:.78rem;color:var(--muted)">${_g('Brak redaktorów — kolejkę widzą tylko admini.', 'No editors — only admins see the queue.')}</span>`}</div>
    <div style="display:flex;gap:.35rem;flex-wrap:wrap"><input id="xed-add" list="xed-list" placeholder="${_g('Wpisz nick albo Discord ID…', 'Type a nick or Discord ID…')}" style="${_MODAL_INP};flex:1;min-width:220px;font-size:.78rem;padding:.3rem .5rem">
      <datalist id="xed-list">${[...known].filter(([id]) => !eds.includes(id)).map(([id, n]) => `<option value="${_h(n)} · ${id}">`).join('')}</datalist>
      <button class="btn btn-primary" style="font-size:.74rem" onclick="xEditorAdd()">➕ ${_g('Dodaj redaktora', 'Add editor')}</button></div>
    <div style="font-size:.68rem;color:var(--muted);margin-top:.3rem">${_g('Redaktor dostaje DM o każdym nowym wpisie i widzi kolejkę w swoim Moim panelu. Discord ID: prawy klik na osobę → Kopiuj ID użytkownika.', 'Editors get a DM about every new post and see the queue in My panel. Discord ID: right-click a user → Copy User ID.')}</div>
  </div>`;
}
async function xEditorsSet(list) {
  const r = await _api('/x-settings', 'POST', { editors: list }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  window._xEditors = r.settings?.editors || list; _xqDraw(); showToast(_g('👥 Zapisano redaktorów', '👥 Editors saved'), 'success');
}
function xEditorAdd() {
  const v = document.getElementById('xed-add').value.trim(), id = (v.match(/(\d{15,21})\s*$/) || [])[1] || [..._xKnownUsers()].find(([, n]) => (n || '').toLowerCase() === v.toLowerCase())?.[0];
  if(!id) { showToast(_g('Wybierz osobę z listy albo wpisz Discord ID', 'Pick someone from the list or enter a Discord ID'), 'info'); return; }
  xEditorsSet([...new Set([...(window._xEditors || []), id])]);
}
function _xqCount(id, pi) { const t = document.getElementById(`xq-t-${id}-${pi}`).value, n = _xLen(t), el = document.getElementById(`xq-c-${id}-${pi}`); el.textContent = n + '/280'; el.style.color = n > 280 ? 'var(--loss)' : 'var(--muted)'; }
async function xqAct(id, action) {
  const d = _xq.find(x => x.id === id); if(!d) return;
  const parts = d.parts.map((p, pi) => ({ lang: p.lang, text: document.getElementById(`xq-t-${id}-${pi}`).value, images: [...document.querySelectorAll(`.xq-i-${id}-${pi}:checked`)].map(x => +x.value) }));
  if(parts.some(p => p.images.length > 4)) { showToast(_g('Maks. 4 grafiki na wpis', 'Max 4 graphics per post'), 'info'); return; }
  if(action === 'publish' && parts.some(p => _xLen(p.text) > 280)) { showToast(_g('Tekst przekracza 280 znaków', 'Text exceeds 280 characters'), 'error'); return; }
  if(action === 'publish' && !confirm(_g('Opublikować na X? Tego nie da się cofnąć ze strony.', 'Post to X? This can\u2019t be undone from the website.'))) return;
  if(action === 'reject' && !confirm(_g('Odrzucić ten wpis?', 'Reject this post?'))) return;
  showToast('⏳', 'info');
  const r = await _api('/x-drafts/' + action, 'POST', { id, parts }, { admin: _isLoggedInSync(), session: !!discordUser?.session });
  if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  const i = _xq.findIndex(x => x.id === id); _xq[i] = r.draft; _xqDraw();
  showToast(action === 'publish' ? _g('🐦 Opublikowano na X', '🐦 Posted to X') : action === 'reject' ? _g('🗑 Odrzucono', '🗑 Rejected') : _g('💾 Zapisano', '💾 Saved'), 'success');
}
function _pcMini(name) { const r = _pcSkFor(name); if(!r) return ''; const a = r.d.sk.attrs; return _PC_SK.map(([k, ic]) => [k, ic]).sort((p, q) => a[q[0]].p - a[p[0]].p).slice(0, 3).map(([k, ic]) => `${ic}<b style="color:${_PC_GCOL(a[k].g)}">${a[k].g}</b>`).join(' '); }
function _pcSkSortSel(id, onchange) { return `<select id="${id}" onchange="${onchange}" style="font-size:.72rem;padding:.15rem .3rem;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text)"><option value="">${_g('sortuj: ocena', 'sort: rating')}</option>${_PC_SK.map(([k, ic, pl, en]) => `<option value="${k}" ${window._gmSkSort === k ? 'selected' : ''}>${ic} ${currentLang === 'en' ? en : pl}</option>`).join('')}</select>`; }
function _pcSkSort(list, key) { if(!key) return list; return [...list].sort((a, b) => (_pcSkFor(b.name)?.d.sk.attrs[key].p ?? -1) - (_pcSkFor(a.name)?.d.sk.attrs[key].p ?? -1)); }
function _dnOn() { return localStorage.getItem('nba2k_dn') !== '0'; }
function _dnSound() { try { const a = new (window.AudioContext || window.webkitAudioContext)(), t = a.currentTime; [523, 659, 784, 1047].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; o.type = 'triangle'; g.gain.setValueAtTime(.0001, t + i * .12); g.gain.exponentialRampToValueAtTime(.25, t + i * .12 + .02); g.gain.exponentialRampToValueAtTime(.0001, t + i * .12 + .35); o.connect(g).connect(a.destination); o.start(t + i * .12); o.stop(t + i * .12 + .4); }); } catch(e) {} }
function _dnReveal(item) { if(!_dnOn() && !window._dnObs) return; _dnQ.push(item); if(!_dnBusy) _dnNext(); }
async function _dnNext() {
  const it = _dnQ.shift(); if(!it) { _dnBusy = false; return; } _dnBusy = true;
  let img = ''; try { const d = _pcData(it.name, 'season') || _pcData(it.name, 'edition') || _pcData(it.name, 'career'); if(d) img = await _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true); } catch(e) {}
  const ov = document.createElement('div'); ov.className = 'dn-ov';
  ov.innerHTML = `<div class="dn-top">${it.kind === 'sold' ? _g('💰 SPRZEDANY!', '💰 SOLD!') : `🎯 PICK #${it.n || ''}`}</div>
    ${img ? `<img class="dn-card" src="${img}">` : `<div class="dn-card dn-txt">${_h(it.name)}</div>`}
    <div class="dn-bot"><b>${_h(it.teamName || '')}</b>${it.price ? ` · 💵 ${it.price}` : ''}</div>`;
  document.body.appendChild(ov); _dnSound();
  setTimeout(() => ov.classList.add('dn-out'), 5200); setTimeout(() => { ov.remove(); _dnNext(); }, 5800);
}
function _dnOnEvd(ev, st) { // draft snake Ligi GM — nowy pick
  if(!ev || ev.type !== 'gmdraft' || !st?.lastPick) return;
  const key = ev.id + ':' + st.lastPick.pickNum; if(window._dnLastPick === undefined) { window._dnLastPick = key; return; }
  if(window._dnLastPick === key) return; window._dnLastPick = key;
  _dnReveal({ kind: 'pick', name: st.lastPick.playerName, teamName: st.lastPick.teamName, n: (st.lastPick.pickNum || 0) + 1 });
}
function _dnOnAuction(s) { // aukcja — nowa sprzedaż
  const n = s?.history?.length ?? 0; if(window._dnSold === undefined) { window._dnSold = n; return; }
  if(n > window._dnSold && s.history[0]) _dnReveal({ kind: 'sold', name: s.history[0].player, teamName: s.history[0].gm, price: s.history[0].price, n });
  window._dnSold = n;
}
// overlay do OBS: chemikleagues.com/#draft-night — przezroczyste tło, tylko odkrycia kart i pasek ostatnich picków
async function startDraftNightOverlay() {
  window._dnObs = true; document.body.classList.add('dn-obs');
  const bar = document.createElement('div'); bar.id = 'dn-ticker'; document.body.appendChild(bar);
  const evId = 'gmd_' + String(currentSeasonId || 'x').replace(/\W/g, '');
  const tick = async () => {
    try {
      const a = await _api('/gm/auction?season=' + encodeURIComponent(currentSeasonId || '_'), 'GET', null, {});
      if(a.ok && a.state) { _dnOnAuction(a.state); bar.innerHTML = a.state.history.slice(0, 6).map(h => `<span>💰 ${_h(h.player)} → ${_h(h.gm)} · ${h.price}</span>`).join(''); }
      else { const st = await _evdFetch(evId); if(st) { _dnOnEvd({ id: evId, type: 'gmdraft' }, st); const ev = events.find(e => e.id === evId); bar.innerHTML = st.lastPick ? `<span>🎯 #${(st.lastPick.pickNum || 0) + 1} ${_h(st.lastPick.playerName)} → ${_h(st.lastPick.teamName)}</span>` : ''; } }
    } catch(e) {}
  };
  tick(); setInterval(tick, 2000);
}
// ═══ 📋 RAPORT PO DRAFCIE — radary umiejętności, oceny drużyn, wyróżnienia ═══
function _gmTeamProfile(names) {
  const acc = Object.fromEntries(_PC_SK.map(([k]) => [k, []])), rat = [];
  names.forEach(n => { const r = _pcSkFor(n); if(!r) return; _PC_SK.forEach(([k]) => acc[k].push(r.d.sk.attrs[k].p)); rat.push(r.d.rating); });
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0, attrs = Object.fromEntries(Object.entries(acc).map(([k, a]) => [k, avg(a)]));
  const vals = Object.values(attrs), mean = avg(vals), sd = Math.sqrt(avg(vals.map(v => (v - mean) ** 2)));
  return { attrs, mean, sd, rating: avg(rat) };
}
function _radarSvg(attrs, size = 130, cmp) {
  const c = size / 2, R = size / 2 - 18, n = _PC_SK.length, pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v]; };
  const poly = (o, col, op) => `<polygon points="${_PC_SK.map(([k], i) => pt(i, Math.max(.05, o[k] || 0)).join(',')).join(' ')}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="1.5"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${[.25, .5, .75, 1].map(r => `<polygon points="${_PC_SK.map((_, i) => pt(i, r).join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,.12)"/>`).join('')}
    ${cmp ? poly(cmp, '#8a93a8', .15) : ''}${poly(attrs, '#f5c518', .3)}${_PC_SK.map(([, ic], i) => { const [x, y] = pt(i, 1.17); return `<text x="${x}" y="${y + 4}" font-size="11" text-anchor="middle">${ic}</text>`; }).join('')}</svg>`;
}
function _gmDraftReportData(st) {
  const gms = st.gms || [], R = st.rosters || {}, teams = gms.map(g => ({ g, list: R[g.id] || [], prof: _gmTeamProfile((R[g.id] || []).map(p => p.name)) }));
  const srt = [...teams].sort((a, b) => b.prof.mean - a.prof.mean); teams.forEach(t => { const rk = 1 - srt.indexOf(t) / Math.max(1, teams.length - 1); t.grade = _PC_GR.find(([th]) => rk * .9 + .05 >= th)[1]; t.pay = t.list.reduce((s, p) => s + (+p.price || 0), 0); });
  const priced = teams.flatMap(t => t.list.filter(p => +p.price > 0).map(p => ({ ...p, gm: t.g.teamName, r: _pcSkFor(p.name)?.d.rating || 60 })));
  const best = [...priced].sort((a, b) => b.r / b.price - a.r / a.price)[0], over = [...priced].filter(p => p.price >= 10).sort((a, b) => a.r / a.price - b.r / b.price)[0];
  const bal = [...teams].sort((a, b) => a.prof.sd - b.prof.sd)[0];
  return { teams, best, over, bal };
}
function openGmDraftReport() {
  const st = _gmState; if(!st?.rosters) return; const D = _gmDraftReportData(st);
  const m = _fxModal('gmrep-modal', 900); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('gmrep-modal', '📋 ' + _g('Raport po drafcie', 'Post-draft report')) + `<div data-notr>
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.7rem;font-size:.82rem">
      ${D.best ? `<span style="background:var(--surface2);border-radius:999px;padding:.25rem .65rem">💎 ${_g('Najlepszy zakup', 'Best value')}: <b>${_h(D.best.name)}</b> (${_h(D.best.gm)}, 💵${D.best.price})</span>` : ''}
      ${D.over ? `<span style="background:var(--surface2);border-radius:999px;padding:.25rem .65rem">💸 ${_g('Przepłacony', 'Overpaid')}: <b>${_h(D.over.name)}</b> (${_h(D.over.gm)}, 💵${D.over.price})</span>` : ''}
      ${D.bal ? `<span style="background:var(--surface2);border-radius:999px;padding:.25rem .65rem">⚖️ ${_g('Najbardziej zbalansowany', 'Most balanced')}: <b>${_h(D.bal.g.teamName)}</b></span>` : ''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.6rem">${D.teams.map(t => `<div style="background:var(--surface2);border-radius:12px;padding:.6rem .75rem">
      <div style="display:flex;justify-content:space-between;align-items:center"><b>${_h(t.g.teamName)}</b><b style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;color:${_PC_GCOL(t.grade)}">${t.grade}</b></div>
      <div style="font-size:.72rem;color:var(--muted)">${_h(t.g.name)} · 💵 ${t.pay}/${_gmCap(st)}</div>
      <div style="display:flex;gap:.5rem;align-items:center">${_radarSvg(t.prof.attrs, 120)}<div style="font-size:.74rem">${t.list.map(p => `<div>${_h(p.name)} <span style="color:var(--muted)">${p.price ? '💵' + p.price : ''}</span></div>`).join('')}</div></div></div>`).join('')}</div>
    ${_isLoggedInSync() ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.8rem"><button class="btn btn-primary" onclick="gmReportSend('discord')">📣 ${_g('Grafika na Discord', 'Graphic to Discord')}</button><button class="btn btn-ghost" onclick="gmReportSend('x')">🐦 ${_g('Do kolejki X', 'To the X queue')}</button><button class="btn btn-ghost" onclick="gmReportSend('png')">⬇ PNG</button></div>` : ''}
  </div>`;
}
async function _gmReportImage(lang) {
  const st = _gmState, D = _gmDraftReportData(st), prevTr = window._trOff, prevL = _wgLang; window._trOff = true; _wgLang = lang;
  try {
    const W = 1600, H = 900, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'", T = (pl, en) => lang === 'en' ? en : pl;
    try { await document.fonts?.ready; } catch(e) {}
    await _wgBackground(g, W, H); await _wgHeader(g, W, T('RAPORT', 'DRAFT'), T('PO DRAFCIE', 'REPORT'), T('Liga GM', 'GM League') + ' · ' + (lang === 'en' ? _tr(_seasonName(currentSeasonId) || '') : (_seasonName(currentSeasonId) || '')));
    const n = D.teams.length, cols = Math.min(4, Math.max(2, Math.ceil(n / 2))), rows = Math.ceil(n / cols), gap = 18, tw = (W - (cols + 1) * gap) / cols, th = Math.min(300, (H - 175 - 70 - rows * gap) / rows);
    D.teams.forEach((t, i) => { const x = gap + (i % cols) * (tw + gap), y = 165 + Math.floor(i / cols) * (th + gap);
      _wgRound(g, x, y, tw, th, 16); g.fillStyle = 'rgba(8,11,19,.85)'; g.fill(); g.strokeStyle = _PC_GCOL(t.grade) + '99'; g.lineWidth = 2; g.stroke();
      g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = `900 ${_wgFit(g, t.g.teamName, tw - 110, 32)}px ${F}`; g.fillText(t.g.teamName, x + 16, y + 40);
      g.textAlign = 'right'; g.fillStyle = _PC_GCOL(t.grade); g.font = `900 52px ${F}`; g.fillText(t.grade, x + tw - 16, y + 50);
      g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 18px ${F}`; g.fillText(`${t.g.name} · 💵 ${t.pay}/${_gmCap(st)}`, x + 16, y + 64);
      // radar
      const cx = x + 95, cy = y + th / 2 + 30, Rr = Math.min(70, th / 2 - 50), nn = _PC_SK.length, pt = (k, v) => { const a = -Math.PI / 2 + k * 2 * Math.PI / nn; return [cx + Math.cos(a) * Rr * v, cy + Math.sin(a) * Rr * v]; };
      [.5, 1].forEach(r => { g.beginPath(); _PC_SK.forEach((_, k) => { const [px, py] = pt(k, r); k ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.stroke(); });
      g.beginPath(); _PC_SK.forEach(([kk], k) => { const [px, py] = pt(k, Math.max(.05, t.prof.attrs[kk])); k ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fillStyle = 'rgba(245,197,24,.3)'; g.fill(); g.strokeStyle = '#f5c518'; g.lineWidth = 2; g.stroke();
      g.font = `14px ${F}`; g.textAlign = 'center'; _PC_SK.forEach(([, ic], k) => { const [px, py] = pt(k, 1.22); g.fillText(ic, px, py + 5); });
      g.textAlign = 'left'; g.font = `700 ${Math.min(19, (th - 90) / Math.max(1, t.list.length) - 3)}px ${F}`; t.list.forEach((p, k) => { g.fillStyle = '#fff'; g.fillText(p.name, x + 190, y + 98 + k * Math.min(24, (th - 90) / Math.max(1, t.list.length))); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText(p.price ? '💵' + p.price : '', x + tw - 70, y + 98 + k * Math.min(24, (th - 90) / Math.max(1, t.list.length))); }); });
    const aw = [D.best && `💎 ${T('Najlepszy zakup', 'Best value')}: ${D.best.name} (${D.best.price})`, D.over && `💸 ${T('Przepłacony', 'Overpaid')}: ${D.over.name} (${D.over.price})`, D.bal && `⚖️ ${T('Najbardziej zbalansowany', 'Most balanced')}: ${D.bal.g.teamName}`].filter(Boolean).join('     ');
    g.textAlign = 'center'; g.fillStyle = '#f5c518'; g.font = `800 ${_wgFit(g, aw, W - 80, 26)}px ${F}`; g.fillText(aw, W / 2, H - 30);
    return c.toDataURL('image/jpeg', .9);
  } finally { window._trOff = prevTr; _wgLang = prevL; }
}
async function gmReportSend(where) {
  showToast('⏳', 'info'); const pl = await _gmReportImage('pl'), en = await _gmReportImage('en');
  if(where === 'png') { [['pl', pl], ['en', en]].forEach(([l, u]) => { const a = document.createElement('a'); a.href = u; a.download = `raport-draft-${l}.jpg`; a.click(); }); return; }
  if(where === 'discord') { const ok = await _discordPost('schedule', { route: 'gmDraft', content: _g('📋 **Raport po drafcie Ligi GM / Post-draft report**', '📋 **GM League post-draft report**') }, pl, 'raport-draft-pl.jpg'); showToast(ok ? '📣 OK' : '❌', ok ? 'success' : 'error'); return; }
  const r = await _api('/x-drafts/create', 'POST', { title: 'Raport po drafcie Ligi GM', images: [{ name: 'raport-pl.jpg', lang: 'pl', data: pl.split(',')[1] }, { name: 'raport-en.jpg', lang: 'en', data: en.split(',')[1] }],
    parts: [{ lang: 'pl', text: '📋 Raport po drafcie Ligi GM — kto zbudował najmocniejszy skład? #2KEkstraklasa' }, { lang: 'en', text: '📋 GM League post-draft report — who built the strongest roster?' }] }, { admin: true });
  showToast(r.ok ? _g('🐦 Dodano do kolejki X', '🐦 Added to the X queue') : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
// ═══ 🔍 ANALIZATOR WYMIAN — przed/po: radar, pensje, przewidywane punkty, uczciwość ═══
function _gmWeeklyVal() { // średnie punkty fantasy na tydzień (≈ 2 mecze) z bieżącego sezonu
  const sid = currentSeasonId || null, o = {}; _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid)).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, op]) => (t.players || []).forEach(p => { const k = _normNick(p.name), x = o[k] = o[k] || { fp: 0, g: 0 }; x.fp += _gmFp(p, +t.score > +op.score); x.g++; })));
  return k => o[k] ? o[k].fp / o[k].g * 2 : 0;
}
function _gmTradeAnalysisHtml(st, fromId, toId, give, get) {
  if(!give.length && !get.length) return '';
  const R = st.rosters || {}, A0 = (R[fromId] || []).map(p => p.name), B0 = (R[toId] || []).map(p => p.name), nk = _normNick;
  const A1 = A0.filter(n => !give.some(x => nk(x) === nk(n))).concat(get), B1 = B0.filter(n => !get.some(x => nk(x) === nk(n))).concat(give);
  const wv = _gmWeeklyVal(), proj = list => list.map(n => wv(nk(n))).sort((a, b) => b - a).slice(0, st.config.starters).reduce((s, v) => s + v, 0);
  const sal = (gid, list) => list.reduce((s, n) => s + (+[...(R[fromId] || []), ...(R[toId] || [])].find(p => nk(p.name) === nk(n))?.price || 0), 0) + (st.market?.dead?.[gid] || 0);
  const gv = give.reduce((s, n) => s + wv(nk(n)), 0), tv = get.reduce((s, n) => s + wv(nk(n)), 0), diff = (tv - gv) / Math.max(1, Math.max(tv, gv)), cap = _gmCap(st), f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  const nameOf = id => (st.gms || []).find(g => g.id === id)?.teamName || '?';
  const fair = Math.abs(diff) < .12 ? ['⚖️ ' + _g('Uczciwa wymiana', 'Fair trade'), 'var(--win)'] : diff > 0 ? [`📈 ${_g('Korzystna dla', 'Favours')} ${_h(nameOf(fromId))}`, '#f59e0b'] : [`📈 ${_g('Korzystna dla', 'Favours')} ${_h(nameOf(toId))}`, '#f59e0b'];
  const side = (id, l0, l1) => { const p0 = _gmTeamProfile(l0), p1 = _gmTeamProfile(l1), s1 = sal(id, l1), j0 = proj(l0), j1 = proj(l1);
    return `<div style="background:var(--surface);border-radius:10px;padding:.45rem .55rem"><b style="font-size:.8rem">${_h(nameOf(id))}</b><div style="display:flex;gap:.4rem;align-items:center">${_radarSvg(p1.attrs, 110, p0.attrs)}
      <div style="font-size:.74rem;line-height:1.6">📈 ${_g('pkt/tydz.', 'pts/wk')}: ${f1(j0)} → <b style="color:${j1 >= j0 ? 'var(--win)' : 'var(--loss)'}">${f1(j1)}</b><br>💵 ${s1}/${cap}${s1 > cap ? ` <b style="color:var(--loss)">${_g('ponad cap!', 'over cap!')}</b>` : ''}</div></div></div>`; };
  return `<div style="margin-top:.5rem"><div style="font-size:.72rem;font-weight:800;color:${fair[1]};margin-bottom:.3rem">🔍 ${fair[0]}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">${side(fromId, A0, A1)}${side(toId, B0, B1)}</div>
    <div style="font-size:.66rem;color:var(--muted);margin-top:.25rem">${_g('Szary = przed, żółty = po wymianie. Punkty: przewidywana suma najlepszych występów na tydzień (średnie z sezonu).', 'Grey = before, yellow = after. Points: projected weekly total of the best performances (season averages).')}</div></div>`;
}
function gmTradeAnalyze(to) {
  const el = document.getElementById('gmt-an'); if(!el || !discordUser) return;
  el.innerHTML = _gmTradeAnalysisHtml(_gmState, discordUser.id, to, [...document.querySelectorAll('.gmt-give:checked')].map(x => x.value), [...document.querySelectorAll('.gmt-get:checked')].map(x => x.value));
}
async function renderCardsView() {
  const el = document.getElementById('cards-view'); if(!el) return;
  el.innerHTML = `<div class="section-title">🃏 ${_g('Kolekcja kart', 'Card collection')}</div><div style="color:var(--muted)">⏳</div>`;
  const board = await _api('/cards/board', 'GET', null, {});
  if(discordUser?.session) { const r = await _api('/cards/me', 'GET', null, { session: true }); _cards = r.ok ? r : null; _setRewardToast(r.setRewards); _teamEventsToast(r.teamEvents); }
  const me = _cards, pool = me?.pool || [], own = me?.cards || {}, uniq = Object.keys(own).length, dups = Object.values(own).reduce((s, c) => s + Math.max(0, c.n - 1), 0);
  const _cf = x => _normNick(String(x || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')), byTeam = {}, _seenT = {}; // ten sam gracz w drużynie — raz
  pool.forEach(c => { const sk = (_seenT[c.team] = _seenT[c.team] || new Set()), key = _cf(c.name); if(sk.has(key)) return; sk.add(key); (byTeam[c.team] = byTeam[c.team] || []).push(c); });
  el.innerHTML = `<div class="section-title">🃏 ${_g('Kolekcja kart', 'Card collection')}</div><div data-notr>
    <div class="card" style="padding:.9rem 1rem;margin-bottom:1rem;text-align:center">
      ${!discordUser ? `<div style="font-size:.86rem">${_g('Zaloguj się przez Discord, żeby otwierać paczki i zbierać karty.', 'Log in with Discord to open packs and collect cards.')}</div>` : `
      <div style="font-size:.86rem;margin-bottom:.5rem">${_g('Codziennie darmowa paczka z 3 kartami graczy ligi. Rzadkość = poziom karty gracza z bieżącego sezonu: 🥉 brąz · 🥈 srebro · 🥇 złoto · 💎 diament · 🌌 galaktyka — im lepiej ktoś gra, tym rzadsza jego karta.', 'A free pack of 3 league player cards every day. Rarity = the player\u2019s card tier this season: 🥉 bronze · 🥈 silver · 🥇 gold · 💎 diamond · 🌌 galaxy — the better someone plays, the rarer their card.')}</div>
      <button class="btn btn-primary" style="font-size:1rem;padding:.6rem 1.4rem" ${me?.canOpen ? '' : 'disabled'} onclick="cardsOpen()">🎁 ${me?.canOpen ? _g('Otwórz paczkę', 'Open a pack') + (me.bonus ? ` (+${me.bonus})` : '') : _g('Dzisiejsza paczka otwarta', 'Today\u2019s pack opened')}</button>
      ${me?.premium ? `<button class="btn" style="font-size:.95rem;padding:.55rem 1.2rem;margin-left:.4rem;background:linear-gradient(135deg,#7c3aed,#22d3ee);color:#fff;border:none" onclick="cardsOpen(true)">💎 ${_g('Paczka premium', 'Premium pack')} (${me.premium})</button>` : ''}
      ${me && !me.canOpen ? `<div style="font-size:.84rem;margin-top:.45rem">⏳ ${_cdHtml('Nowa paczka za', 'Next pack in')}</div>` : ''}
      <div style="font-size:.78rem;margin-top:.45rem">♻️ ${_g('Bonus: <b>5 duplikatów = 1 dodatkowa paczka</b> (3 karty)', 'Bonus: <b>5 duplicates = 1 extra pack</b> (3 cards)')} · ${_g('masz', 'you have')} <b>${Math.min(dups, 5)}/5</b>${dups >= 5 ? ` — <a href="#" onclick="cardsRecycle();return false" style="color:var(--accent);font-weight:800">${_g('wymień teraz', 'trade them now')}</a>` : ''}</div>
      <div style="font-size:.76rem;color:var(--muted);margin-top:.5rem">${_g(`Masz ${uniq} z ${pool.length} kart · duplikaty: ${dups}`, `You have ${uniq} of ${pool.length} cards · duplicates: ${dups}`)} · <a href="#" onclick="openMyPackHistory();return false" style="color:var(--accent)">📜 ${_g('Historia paczek', 'Pack history')}</a>${_coachOwned().length ? `<div style="margin-top:.35rem">🧑‍🏫 ${_g('Karty trenerskie', 'Coach cards')}: ${_coachOwned().map(x => `<span title="${_h(_coachDesc(x.t))}" style="background:rgba(168,85,247,.18);border:1px solid #a855f7;border-radius:6px;padding:.05rem .4rem;margin-right:.25rem;color:var(--text)">${_coachName(x.t)} ×${x.n}</span>`).join('')} <span style="font-size:.7rem">(${_g('do użycia w Korcie', 'use them in Kort')})</span></div>` : ''}</div>`}
      <div id="cards-pack" style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:.8rem"></div>
    </div>
    ${discordUser ? `<div class="streak-slot" style="margin-bottom:.8rem">${streakChip()}</div>` : ''}
    <div id="ut-slot"></div>
    ${discordUser ? challengesHtml(me) : ''}
    ${discordUser && me ? `<div style="text-align:right;margin:-.4rem 0 .8rem"><button class="btn btn-ghost" style="font-size:.74rem" onclick="showcasePick()">🏆 ${_g('Ustaw gablotę na profilu', 'Set your profile showcase')}</button></div>` : ''}
    ${limitedSetsHtml(me)}
    ${tradesSectionHtml(me)}${limitedSectionHtml(me)}
    ${discordUser ? `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">📚 ${_g('MOJA KOLEKCJA — ZESTAWY DRUŻYN', 'MY COLLECTION — TEAM SETS')}</div>
      ${(() => { const T = Object.entries(byTeam).filter(([, l]) => l.length >= 3), n = T.filter(([, l]) => l.every(c => own[c.k])).length, all = T.length;
        return all ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.5rem .7rem;margin-bottom:.7rem">
          <div style="display:flex;justify-content:space-between;font-size:.8rem"><b>${_g('Drużyny skompletowane', 'Teams completed')}</b><b>${n}/${all}</b></div>
          <div style="height:6px;background:var(--surface);border-radius:3px;margin:.35rem 0;overflow:hidden"><div style="height:100%;width:${Math.round(n / all * 100)}%;background:${n === all ? 'var(--win)' : 'var(--accent)'}"></div></div>
          <div style="font-size:.7rem;color:var(--muted)">${_g('Komplet drużyny = 🎁 paczka · 5 drużyn = 💎 paczka premium · cała liga = 💎 + unikalna karta „🏆 Mistrz Kolekcjoner”', 'Complete a team = 🎁 pack · 5 teams = 💎 premium pack · the whole league = 💎 + a one-of-a-kind “🏆 Master Collector” card')}</div></div>` : ''; })()}
      ${Object.entries(byTeam).sort((a, b) => a[0].localeCompare(b[0])).map(([team, list]) => { const got = list.filter(c => own[c.k]).length, done = got === list.length;
        return `<div style="margin-bottom:.6rem"><div style="font-size:.8rem;margin-bottom:.25rem">${done ? '✅' : '🧩'} <b>${_h(team)}</b> <span style="color:var(--muted)">${got}/${list.length}</span>${me?.teamDone?.[team] ? ` <span style="font-size:.68rem;color:var(--win)">· 🎁 ${_g('nagroda odebrana', 'reward claimed')}</span>` : ''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:.35rem">${list.map(c => { const o = own[c.k]; return `<div onclick="${o ? `openPlayerCardImg('${_h(c.name).replace(/'/g, "\\'")}')` : `openCardHolders('${c.k.replace(/'/g, '')}','${_h(c.name).replace(/'/g, "\\'")}')`}" title="${o ? _h(c.name) : _g('Kto ma tę kartę? Zaproponuj wymianę', 'Who has this card? Offer a trade')}" style="width:84px;height:110px;border-radius:10px;border:2px solid ${o ? _TIER_COL[c.tier] : 'var(--border)'};background:${o ? `linear-gradient(160deg, ${_TIER_COL[c.tier]}33, var(--surface2))` : 'var(--surface2)'};display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:.2rem;cursor:pointer;opacity:${o ? 1 : .5};position:relative">${o ? '' : `<span style="position:absolute;bottom:4px;left:0;right:0;font-size:.58rem;color:var(--accent)">🔍 ${_g('kto ma?', 'who has?')}</span>`}
            <div style="font-size:.7rem;color:${o ? _TIER_COL[c.tier] : 'inherit'}">${o ? _TIER_LBL[c.tier][0].split(' ')[0] : '❔'}</div><div style="font-size:.68rem;font-weight:800;word-break:break-word">${o ? _h(c.name) + (c.rookie ? ' 🆕' : '') : '???'}</div>${o && o.n > 1 ? `<span style="position:absolute;top:3px;right:5px;font-size:.62rem;background:var(--accent);color:#000;border-radius:999px;padding:0 .3rem">×${o.n}</span><span onclick="event.stopPropagation();const s=document.getElementById('cg-card');if(s){s.value=this.dataset.n;s.scrollIntoView({behavior:'smooth',block:'center'});}" data-n="${_h(c.name)}" title="${_g('Podaruj duplikat', 'Gift a duplicate')}" style="position:absolute;bottom:3px;right:5px;font-size:.85rem;cursor:pointer">🎁</span>` : ''}</div>`; }).join('')}</div></div>`; }).join('') || `<div style="font-size:.82rem;color:var(--muted)">${_g('Pula kart pojawi się po pierwszych meczach sezonu.', 'The card pool appears after the first games of the season.')}</div>`}
      ${dups ? `<div style="font-size:.78rem;margin-top:.8rem;padding:.6rem .75rem;border:1px dashed var(--accent);border-radius:10px"><b>🎁 ${_g('Podaruj kartę', 'Gift a card')}</b> <span style="color:var(--muted)">— ${_g('podarować można duplikat (karta z ×2 i więcej); odbiorca musi mieć otwartą choć jedną paczkę', 'you can gift a duplicate (a card marked ×2 or more); the recipient must have opened at least one pack')}</span><div style="margin-top:.4rem">${_g('Karta', 'Card')}: <select id="cg-card" style="font-size:.76rem">${Object.entries(own).filter(([, c]) => c.n > 1).map(([k, c]) => `<option value="${_h(c.name)}" data-k="${_h(k)}">${c.lim ? '🌟 ' : ''}${_h(c.name)}${c.lim ? ' (' + _h(c.label || '') + ')' : ''} ×${c.n}</option>`).join('')}</select> → <select id="cg-to" style="font-size:.76rem">${(board.board || []).filter(b => b.id !== discordUser.id).map(b => `<option value="${b.id}">${_h(b.name)}</option>`).join('')}</select> <button class="btn btn-primary" style="font-size:.72rem" onclick="cardsGift()">🎁 ${_g('Podaruj', 'Gift')}</button></div></div>` : (discordUser && uniq ? `<div style="font-size:.74rem;color:var(--muted);margin-top:.6rem">🎁 ${_g('Karty można podarować innym kolekcjonerom, gdy masz duplikat (×2) — pojawi się wtedy tu opcja „Podaruj kartę”.', 'You can gift cards to other collectors once you have a duplicate (×2) — a “Gift a card” option will appear here.')}</div>` : '')}
    </div>` : ''}
    <div class="card" style="padding:.6rem 1rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🏆 ${_g('KOLEKCJONERZY', 'COLLECTORS')}</div>
      ${board.stats ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.4rem;margin-bottom:.6rem">${[[board.stats.collectors, _g('kolekcjonerów', 'collectors')], [board.stats.today, _g('otworzyło paczkę dziś', 'opened a pack today')], [board.stats.week, _g('aktywnych w 7 dni', 'active in 7 days')], [board.stats.packs, _g('otwartych paczek', 'packs opened')]].map(([n, l]) => `<div style="background:var(--surface2);border-radius:8px;padding:.45rem .6rem"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;line-height:1">${n}</div><div style="font-size:.7rem;color:var(--muted)">${l}</div></div>`).join('')}</div>` : ''}
      <div style="max-height:420px;overflow-y:auto">${(board.board || []).map((b, i) => `<div onclick="openFanProfile('${b.id}')" title="${_g('Profil kibica', 'Fan profile')}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.3rem 0;border-bottom:1px solid var(--border);font-size:.82rem"><span style="display:flex;align-items:center;gap:.45rem;min-width:0"><span style="width:26px;text-align:center;flex-shrink:0">${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'}</span>${_avatarHtml(b.avatar, 22)}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(b.name)}</span></span><span style="display:flex;gap:.6rem;align-items:baseline"><span style="font-size:.7rem;color:var(--muted)">${b.packs ? b.packs + ' ' + _g(_plPL(b.packs, 'paczka', 'paczki', 'paczek'), b.packs === 1 ? 'pack' : 'packs') : ''}</span>${b.lim ? `<span style="font-size:.72rem;color:#f5c518" title="${_g('karty limitowane', 'limited cards')}">🌟 ${b.lim}</span>` : ''}<b title="${_g('karty graczy z obecnych składów', 'player cards from current rosters')}">${Math.min(b.unique, board.poolSize)}/${board.poolSize}</b></span></div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Jeszcze nikt nie otworzył paczki.', 'No packs opened yet.')}</div>`}</div>
      <div style="font-size:.68rem;color:var(--muted);margin-top:.3rem">${_g('Każda unikalna karta = +2 XP w Lidze kibiców.', 'Each unique card = +2 XP in the Fan league.')}</div></div>
  </div>`;
  utHtml().then(h => { const el = document.getElementById('ut-slot'); if(el) el.innerHTML = h; }).catch(() => {});
}
function _teamEventsToast(ev) { (ev || []).forEach((e, i) => setTimeout(() => showToast(e.type === 'team' ? _g(`📚 Komplet drużyny ${e.team}! 🎁 +1 paczka`, `📚 Team ${e.team} completed! 🎁 +1 pack`) : e.type === 'five' ? _g('🏅 5 skompletowanych drużyn! 💎 paczka premium', '🏅 5 teams completed! 💎 premium pack') : _g('🏆 Cała liga skompletowana! 💎 i karta „Mistrz Kolekcjoner”', '🏆 Whole league completed! 💎 and the “Master Collector” card'), 'success'), 600 + i * 1600)); }
async function cardsOpen(premium) {
  const r = await _api('/cards/open', 'POST', premium ? { premium: true } : {}, { session: true });
  if(r?.teamEvents?.length) setTimeout(() => _teamEventsToast(r.teamEvents), 2200);
  if(r?.coach && KORT_COACH[r.coach]) setTimeout(() => showToast(`🧑‍🏫 ${_g('Bonus w paczce: karta trenerska', 'Pack bonus: coach card')} — ${_coachName(r.coach)}!`, 'success'), 2600); if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  setTimeout(() => _setRewardToast(r.setRewards), 3500);
  const box = document.getElementById('cards-pack'); box.innerHTML = r.pack.map((c, i) => `<div id="cp-${i}" style="width:180px;height:225px;perspective:800px"><div style="width:100%;height:100%;border-radius:12px;background:linear-gradient(135deg,#1a1f2e,#0b0e14);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:2.5rem;animation:cpShake .6s ${i * .15}s">🃏</div></div>`).join('');
  _dnSound();
  for(let i = 0; i < r.pack.length; i++) { await new Promise(res => setTimeout(res, 700)); const c = r.pack[i], d = _pcData(c.name, 'season') || _pcData(c.name, 'career'); let img = ''; try { if(c.tier === 'limited') img = await _pcLimitedImage(c.name, c.label, _limScope(c), c.theme, c.variant, c.persona) || ''; else if(d) img = await _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true); else img = await _rookieCardImage(c.name, c.team); } catch(e) {}
    document.getElementById('cp-' + i).innerHTML = `<div style="animation:cpFlip .6s;text-align:center">${img ? `<img src="${img}" style="width:180px;border-radius:12px;box-shadow:0 0 24px ${_TIER_COL[c.tier]}">` : `<div style="height:225px;border:2px solid ${_TIER_COL[c.tier]};border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800">${_h(c.name)}</div>`}
      <div style="font-size:.76rem;margin-top:.25rem">${c.tier === 'limited' ? `<b style="color:#f5c518">🌟 ${_h(c.label || '')}</b>` : _TIER_LBL[c.tier][currentLang === 'en' ? 1 : 0]}${c.isNew ? ` · <b style="color:var(--win)">${_g('NOWA!', 'NEW!')}</b>` : ''}</div></div>`; }
  window._cardsCanOpen = !!r.canOpen; try { updateMyPanelBadge(); } catch(e) {} setTimeout(() => streakLoad().catch(() => {}), 1500);
  setTimeout(() => renderCardsView(), 3500);
}
// wybór 5 duplikatów do wymiany na paczkę
function cardsRecycle() {
  const own = _cards?.cards || {}, dup = Object.entries(own).filter(([, c]) => c.n > 1).sort((a, b) => b[1].n - a[1].n || a[1].name.localeCompare(b[1].name)); let need = 5; _rcy = {};
  dup.forEach(([k, c]) => { const t = Math.min(c.n - 1, need); if(t > 0) { _rcy[k] = t; need -= t; } }); // propozycja jak dotąd: z kart, których masz najwięcej
  _rcyDraw();
}
function _rcyStep(k, d) { const c = _cards?.cards?.[k]; if(!c) return; const tot = Object.values(_rcy).reduce((s, n) => s + n, 0), cur = _rcy[k] || 0, nx = cur + d; if(nx < 0 || nx > c.n - 1 || (d > 0 && tot >= 5)) return; _rcy[k] = nx; _rcyDraw(); }
function _rcyDraw() {
  const own = _cards?.cards || {}, dup = Object.entries(own).filter(([, c]) => c.n > 1).sort((a, b) => (_rcy[b[0]] || 0) - (_rcy[a[0]] || 0) || b[1].n - a[1].n || a[1].name.localeCompare(b[1].name)), tot = Object.values(_rcy).reduce((s, n) => s + n, 0);
  const m = _fxModal('recycle-modal', 560); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('recycle-modal', '♻️ ' + _g('Wymień 5 duplikatów na paczkę', 'Trade 5 duplicates for a pack')) + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.5rem">${_g('Wybierz, które duplikaty oddajesz — z każdej karty zostaje Ci co najmniej 1 egzemplarz.', 'Choose which duplicates to give — you always keep at least 1 copy of each card.')}</div>
    <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem"><b style="font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;color:${tot === 5 ? 'var(--win)' : 'var(--accent)'}">${tot}/5</b><span style="font-size:.76rem;color:var(--muted)">${_g('wybranych', 'selected')}</span>
      <button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .45rem;margin-left:auto" onclick="_rcy={};_rcyDraw()">${_g('wyczyść', 'clear')}</button></div>
    <div style="max-height:50vh;overflow:auto">${dup.map(([k, c]) => { const n = _rcy[k] || 0; return `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem .2rem;border-bottom:1px solid var(--border);${n ? 'background:rgba(34,197,94,.08)' : ''}">
      <span style="flex:1;font-size:.82rem;cursor:pointer" onclick="openPlayerCardImg('${_h(c.name).replace(/'/g, "\\'")}')"><b>${_h(c.name)}</b> <span style="color:var(--muted);font-size:.7rem">${_h(c.team || '')}${c.tier === 'limited' ? ' · 🌟' : ''} · ${_g('masz', 'you have')} ×${c.n}</span></span>
      <button class="btn btn-ghost" style="font-size:.8rem;padding:.05rem .5rem" ${n ? '' : 'disabled'} onclick="_rcyStep('${k.replace(/'/g, '')}',-1)">−</button><b style="width:18px;text-align:center">${n}</b><button class="btn btn-ghost" style="font-size:.8rem;padding:.05rem .5rem" ${n < c.n - 1 && tot < 5 ? '' : 'disabled'} onclick="_rcyStep('${k.replace(/'/g, '')}',1)">+</button></div>`; }).join('') || `<div style="color:var(--muted);font-size:.84rem">${_g('Nie masz duplikatów.', 'You have no duplicates.')}</div>`}</div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.7rem"><button class="btn btn-ghost" onclick="_fxClose('recycle-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" ${tot === 5 ? '' : 'disabled'} onclick="_rcyGo()">♻️ ${_g('Wymień na paczkę', 'Trade for a pack')}</button></div></div>`;
}
async function _rcyGo() { const r = await _api('/cards/recycle', 'POST', { pick: _rcy }, { session: true }); if(r.ok) { _cards = { ..._cards, ...r }; _fxClose('recycle-modal'); } showToast(r.ok ? _g('🎁 Masz dodatkową paczkę!', '🎁 You got a bonus pack!') : '❌ ' + _tr(r.error), r.ok ? 'success' : 'error'); renderCardsView(); }
async function cardsGift() { const card = document.getElementById('cg-card').value, to = document.getElementById('cg-to').value; if(!confirm(_g(`Podarować kartę ${card}?`, `Gift the ${card} card?`))) return;
  const key = Object.entries(_cards?.cards || {}).find(([k, c]) => c.name === card && c.n > 1 && k.startsWith('lim:') && document.getElementById('cg-card').selectedOptions[0]?.dataset.k === k)?.[0];
  const r = await _api('/cards/gift', 'POST', { card, to, key: document.getElementById('cg-card').selectedOptions[0]?.dataset.k || key }, { session: true }); showToast(r.ok ? _g('🎁 Wysłano!', '🎁 Sent!') : '❌ ' + _tr(r.error), r.ok ? 'success' : 'error'); renderCardsView(); }
// ═══ 💡 SKRZYNKA SUGESTII ═══
function openSuggest() {
  if(!discordUser) { showToast(_g('Zaloguj się przez Discord, żeby wysłać sugestię', 'Log in with Discord to send a suggestion'), 'info'); return; }
  const m = _fxModal('suggest-modal', 520);
  m.querySelector('.modal').innerHTML = _fxHead('suggest-modal', '💡 ' + _g('Zgłoś sugestię', 'Send a suggestion')) + `<div data-notr>
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.7rem">${_g('Masz pomysł na usprawnienie strony, ligi albo Discorda? Napisz — trafi prosto do adminów.', 'Got an idea to improve the website, the league or Discord? Tell us — it goes straight to the admins.')}</div>
    <label style="${_MODAL_LBL}">${_g('Czego dotyczy?', 'What is it about?')}</label>
    <select id="sg-cat" style="${_MODAL_INP};margin-bottom:.6rem">${[['Strona', 'Website'], ['Liga', 'League'], ['Discord', 'Discord'], ['Fantasy / zabawy', 'Fantasy / games'], ['Inne', 'Other']].map(([pl, en]) => `<option value="${pl}">${_g(pl, en)}</option>`).join('')}</select>
    <label style="${_MODAL_LBL}">${_g('Twój pomysł', 'Your idea')}</label>
    <textarea id="sg-text" rows="6" maxlength="1500" placeholder="${_g('Np. przydałby się widok…', 'E.g. it would be great to have…')}" style="${_MODAL_INP};font-size:.85rem"></textarea>
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.7rem"><button class="btn btn-ghost" onclick="_fxClose('suggest-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" onclick="suggestSend()">💡 ${_g('Wyślij', 'Send')}</button></div></div>`;
  m.classList.add('open');
}
async function suggestSend() {
  const r = await _api('/suggest', 'POST', { category: document.getElementById('sg-cat').value, text: document.getElementById('sg-text').value }, { session: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  _fxClose('suggest-modal'); showToast(_g('💡 Dzięki! Sugestia trafiła do adminów', '💡 Thanks! Your suggestion went to the admins'), 'success');
}
async function openSuggestions() {
  const m = _fxModal('suggestions-modal', 720); m.classList.add('open');
  const draw = list => { m.querySelector('.modal').innerHTML = _fxHead('suggestions-modal', '💡 ' + _g('Sugestie', 'Suggestions')) + `<div data-notr>${(list || []).map(s => `<div style="background:var(--surface2);border-radius:10px;padding:.55rem .75rem;margin-bottom:.45rem;${s.done ? 'opacity:.55' : ''}">
      <div style="display:flex;justify-content:space-between;gap:.5rem;font-size:.74rem;color:var(--muted)"><span><b style="color:var(--text)">${_h(s.by?.name || '')}</b> · ${_h(s.category)} · ${new Date(s.at).toLocaleString(currentLang === 'en' ? 'en-GB' : 'pl-PL')}</span>
        <label style="display:flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0;cursor:pointer"><input type="checkbox" ${s.done ? 'checked' : ''} onchange="_api('/suggest','POST',{id:'${s.id}',done:this.checked},{admin:true}).then(r=>r.ok&&openSuggestions())" style="width:auto;margin:0"> ${_g('załatwione', 'done')}</label></div>
      <div style="font-size:.86rem;margin-top:.3rem;white-space:pre-wrap">${_h(s.text)}</div></div>`).join('') || `<div style="color:var(--muted)">${_g('Brak sugestii.', 'No suggestions yet.')}</div>`}</div>`; };
  const r = await _api('/suggest', 'GET', null, { admin: true }); draw(r.ok ? r.list : []);
}
async function karnetClaim(id) {
  const r = await _api('/karnet/claim', 'POST', { quest: id }, { session: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; }
  _karnet = r; showToast(id === 'all' ? _g('🎁 Dodatkowa paczka kart czeka w Kolekcji! +' + r.gained + ' XP', '🎁 An extra card pack is waiting in your Collection! +' + r.gained + ' XP') : `+${r.gained} XP 🎟️`, 'success');
  if(id === 'all') window._cardsCanOpen = true;
  document.querySelectorAll('.karnet-slot').forEach(el => el.innerHTML = karnetHtml(_karnet)); try { updateMyPanelBadge(); } catch(e) {}
}
async function karnetMount() { const k = await karnetLoad(); document.querySelectorAll('.karnet-slot').forEach(el => el.innerHTML = karnetHtml(k)); try { updateMyPanelBadge(); } catch(e) {} }
// 🎃 HALLOWEEN — pajęczyny, pająk, nietoperze, dynie, duszek, ociekające krople; układ zależny od wariantu
function _limHalloween(g, W, H, v, F) {
  let s = (v + 7) * 7919; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const emo = (e, x, y, size, rot = 0, a = 1) => { g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.font = `${Math.round(size)}px ${F}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 0, 0); g.restore(); };
  const vg = g.createRadialGradient(W / 2, H / 2, H * .22, W / 2, H / 2, H * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(46,0,60,.6)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const glow = g.createLinearGradient(0, H - 330, 0, H); glow.addColorStop(0, 'rgba(255,122,0,0)'); glow.addColorStop(1, 'rgba(255,122,0,.28)'); g.fillStyle = glow; g.fillRect(0, H - 330, W, 330);
  const web = (cx, cy, dx, dy, r) => { g.save(); g.strokeStyle = 'rgba(235,235,245,.5)'; g.lineWidth = 2.2; const n = 6;
    for(let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * Math.cos(a) * r, cy + dy * Math.sin(a) * r); g.stroke(); }
    for(let k = 1; k <= 5; k++) { const rr = r * k / 5; g.beginPath(); for(let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2, x = cx + dx * Math.cos(a) * rr, y = cy + dy * Math.sin(a) * rr;
      if(i === 0) g.moveTo(x, y); else { const pa = ((i - .5) / n) * Math.PI / 2; g.quadraticCurveTo(cx + dx * Math.cos(pa) * rr * .84, cy + dy * Math.sin(pa) * rr * .84, x, y); } } g.stroke(); }
    g.restore(); };
  web(26, 26, 1, 1, 175 + (v % 3) * 15); web(W - 26, 26, -1, 1, 175 + ((v + 1) % 3) * 15); if(v % 2) web(26, H - 26, 1, -1, 140); else web(W - 26, H - 26, -1, -1, 140);
  const sx = v % 2 ? 170 : W - 170, sy = 240 + rnd() * 140; g.strokeStyle = 'rgba(235,235,245,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, 30); g.lineTo(sx, sy - 24); g.stroke(); emo('🕷️', sx, sy, 58);
  for(let i = 0; i < 4 + v % 3; i++) emo('🦇', 190 + rnd() * (W - 380), 60 + rnd() * 130, 48 + rnd() * 34, (rnd() - .5) * .7, .95);
  emo('🎃', 92, H - 200, 96, -.15); emo('🎃', W - 92, H - 200, 80, .18);
  emo(['👻', '💀', '🍬', '🕯️', '🧙'][v % 5], v % 2 ? W - 66 : 66, H * .5 + (rnd() - .5) * 120, 64, (rnd() - .5) * .4, .88);
  if(v % 3 === 1) emo('🌕', W / 2 + (rnd() - .5) * 260, 64, 54, 0, .9);
  g.fillStyle = '#ff7a00'; // ociekające krople na górnej ramce
  for(let i = 0; i < 10; i++) { const x = 70 + i * (W - 140) / 9 + (rnd() - .5) * 30, len = 18 + rnd() * 58, w = 12 + rnd() * 10;
    g.beginPath(); g.moveTo(x - w / 2, 20); g.lineTo(x + w / 2, 20); g.lineTo(x + w / 2, 20 + len); g.arc(x, 20 + len, w / 2, 0, Math.PI); g.closePath(); g.fill(); }
}
// 🏛 REKORD — czarno-złota karta: podwójna złota ramka, wstęga „REKORD LIGI”, korona i iskry
function _limRecord(g, W, H, v, F, label) {
  let s = (v + 3) * 6151; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const vg = g.createRadialGradient(W / 2, H * .45, H * .2, W / 2, H / 2, H * .8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,216,77,.75)'; g.lineWidth = 3; g.strokeRect(46, 46, W - 92, H - 92); // wewnętrzna złota linia
  const isBreaker = /BREAK/i.test(label || ''), txt = isBreaker ? '🔥 RECORD BREAKER' : '🏛 REKORD LIGI';
  g.font = `900 34px ${F}`; const tw = g.measureText(txt).width + 70, x = (W - tw) / 2, y = 30;
  const rib = g.createLinearGradient(x, 0, x + tw, 0); rib.addColorStop(0, '#7a5a00'); rib.addColorStop(.5, '#ffd84d'); rib.addColorStop(1, '#7a5a00');
  g.fillStyle = rib; g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x + tw + 24, y); g.lineTo(x + tw, y + 30); g.lineTo(x + tw + 24, y + 60); g.lineTo(x - 24, y + 60); g.lineTo(x, y + 30); g.closePath(); g.fill();
  g.fillStyle = '#1a1200'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, y + 31);
  g.font = `64px ${F}`; g.fillText('👑', W / 2, y + 110);
  for(let i = 0; i < 14; i++) { const ang = rnd() * Math.PI * 2, r = .3 + rnd() * .25, sx = W / 2 + Math.cos(ang) * W * r, sy = H / 2 + Math.sin(ang) * H * r * .8; // złote iskry przy krawędziach
    if(sx > 90 && sx < W - 90 && sy > 140 && sy < H - 200) continue; g.fillStyle = `rgba(255,${200 + Math.floor(rnd() * 55)},${80 + Math.floor(rnd() * 80)},${.6 + rnd() * .4})`; g.font = `${18 + Math.floor(rnd() * 22)}px ${F}`; g.fillText('✦', sx, sy); }
}
function _limPaint(g, W, H, label, theme, variant, F) {
  const T = _LIM_THEMES[theme] || _LIM_THEMES.gold, v = +variant || 0;
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  if(T.tint) { const tg = g.createLinearGradient(0, 0, W, H); tg.addColorStop(0, T.tint[0]); tg.addColorStop(1, T.tint[1]); g.fillStyle = tg; g.fillRect(0, 0, W, H); }
  const fr = g.createLinearGradient(0, 0, W, H); T.stops.forEach((c, i) => fr.addColorStop(i / (T.stops.length - 1), c));
  g.lineWidth = 26; g.strokeStyle = fr; rr(13, 13, W - 26, H - 26, 54); g.stroke();
  const sh = g.createLinearGradient(0, 0, W, H); sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,240,180,.16)'); sh.addColorStop(.65, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
  if(theme === 'halloween') _limHalloween(g, W, H, v, F);
  else if(theme === 'record') _limRecord(g, W, H, v, F, label);
  else if(T.deco.length) { // dekoracje w narożnikach — inny zestaw i układ dla każdego wariantu
    const set = T.deco[v % T.deco.length], spots = [[70, 300], [W - 70, 300], [70, H - 300], [W - 70, H - 300], [W / 2, 60]].slice(v % 2, (v % 2) + 4);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    spots.forEach(([x, y], i) => { g.save(); g.translate(x, y); g.rotate(((i + v) % 3 - 1) * .25); g.font = `${64 + ((i + v) % 3) * 14}px ${F}`; g.globalAlpha = .9; g.fillText(set[i % set.length], 0, 0); g.restore(); });
  }
  { const sg = g.createLinearGradient(0, H - 150, 0, H); sg.addColorStop(0, 'rgba(10,8,3,0)'); sg.addColorStop(.35, 'rgba(10,8,3,.94)'); sg.addColorStop(1, 'rgba(10,8,3,.98)'); g.fillStyle = sg; g.save(); rr(26, H - 150, W - 52, 124, 40); g.clip(); g.fillRect(0, H - 150, W, 150); g.restore(); }
  const icon = theme === 'record' && /BREAK/i.test(label || '') ? '🔥' : { halloween: '🎃', xmas: '🎄', fire: '🔥', record: '🏛' }[theme] || '🌟', txt = icon + ' ' + String(label || 'EDYCJA LIMITOWANA').toUpperCase(); g.font = `900 36px ${F}`;
  const tw = Math.min(W - 120, g.measureText(txt).width + 80), bx = (W - tw) / 2, by = H - 112;
  rr(bx, by, tw, 70, 35); g.fillStyle = T.banner; g.fill(); g.lineWidth = 4; g.strokeStyle = T.stops[1]; g.stroke();
  g.fillStyle = T.text; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 36; while(g.measureText(txt).width > tw - 44 && fs > 18) { fs--; g.font = `900 ${fs}px ${F}`; } g.fillText(txt, W / 2, by + 37);
}
// karta osoby spoza ligi (bez statystyk): imię, podpis, opcjonalny obrazek
function _limPersonaPaint(g, W, H, name, sub, img, theme, F) {
  const T = _LIM_THEMES[theme] || _LIM_THEMES.gold, bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1b1530'); bg.addColorStop(1, '#07060c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  if(img) { g.save(); g.beginPath(); g.arc(W / 2, 420, 230, 0, Math.PI * 2); g.closePath(); g.clip(); const s = Math.max(460 / img.width, 460 / img.height); g.drawImage(img, W / 2 - img.width * s / 2, 420 - img.height * s / 2, img.width * s, img.height * s); g.restore();
    g.lineWidth = 10; g.strokeStyle = T.stops[1]; g.beginPath(); g.arc(W / 2, 420, 232, 0, Math.PI * 2); g.stroke(); }
  else { g.font = `900 260px ${F}`; g.fillStyle = T.stops[1]; g.fillText('★', W / 2, 520); }
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `800 34px ${F}`; g.fillText('KARTA SPECJALNA', W / 2, 760);
  let fs = 130; g.font = `900 ${fs}px ${F}`; while(g.measureText(String(name).toUpperCase()).width > W - 140 && fs > 50) { fs -= 4; g.font = `900 ${fs}px ${F}`; }
  g.fillStyle = '#fff'; g.fillText(String(name).toUpperCase(), W / 2, 900);
  if(sub) { g.font = `800 46px ${F}`; g.fillStyle = T.text; g.fillText(String(sub).toUpperCase(), W / 2, 980); }
  g.font = `700 26px ${F}`; g.fillStyle = 'rgba(255,255,255,.5)'; g.fillText('2K PRO-AM EKSTRAKLASA · CHEMIKLEAGUES.COM', W / 2, 1180);
}
async function _pcLimitedImage(name, label, scope, theme, variant, persona) { return _limRender({ name, label, scope, theme: theme || 'gold', variant: variant || 0, persona: persona || null }); }
async function openLimitedCard(name, label, scope, theme, variant, persona) {
  if(typeof persona === 'string') { try { persona = persona ? JSON.parse(persona) : null; } catch(e) { persona = null; } }
  const m = _fxModal('limcard-modal', 460); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('limcard-modal', '🌟 ' + _h(label || '')) + '<div style="color:var(--muted)">⏳</div>';
  let url = null; try { url = await _pcLimitedImage(name, label, scope, theme, +variant || 0, persona); } catch(e) {}
  setTimeout(() => _holoBind(m), 0);
  m.querySelector('.modal').innerHTML = _fxHead('limcard-modal', '🌟 ' + _h(label || '')) + (url ? `${_holoHtml(url, name, 1)}
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.6rem;gap:.5rem"><span style="font-size:.7rem;color:var(--muted)">✨ ${_g('Porusz kursorem albo przechyl telefon', 'Move the cursor or tilt your phone')}</span><a class="btn btn-primary" style="font-size:.74rem;text-decoration:none" href="${url}" download="karta-limitowana-${_normNick(name)}.png">⬇ ${_g('Pobierz', 'Download')}</a></div>` : `<div style="color:var(--muted)">${_g('Karta będzie dostępna po pierwszym meczu gracza w sezonie.', 'The card will be available after the player\u2019s first game this season.')}</div>`);
}
function _holoBind(root) {
  (root || document).querySelectorAll('.holo:not([data-b])').forEach(el => {
    el.dataset.b = '1'; const p = +el.dataset.p || .5;
    const set = (x, y) => { el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%'); el.style.setProperty('--rx', ((.5 - y) * 22 * p) + 'deg'); el.style.setProperty('--ry', ((x - .5) * 26 * p) + 'deg'); el.style.setProperty('--o', .35 + .65 * p); };
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.style.setProperty('--o', 0); });
    if(window.DeviceOrientationEvent && matchMedia('(pointer: coarse)').matches) { // telefon: przechylenie urządzenia
      const h = e => { if(!el.isConnected) { window.removeEventListener('deviceorientation', h); return; } if(e.gamma == null) return; set(Math.max(0, Math.min(1, .5 + e.gamma / 50)), Math.max(0, Math.min(1, .5 + (e.beta - 45) / 50))); };
      window.addEventListener('deviceorientation', h);
    }
  });
}
function _mcAvatar(name, size) {
  const d = _pcData(name, 'season') || _pcData(name, 'career'), url = d?.avatar;
  if(url) return `<img src="${_h(url)}" alt="" loading="lazy" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.35);display:block;margin:0 auto">`;
  const ini = String(name || '?').replace(/[^A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, '').slice(0, 2).toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);font-weight:900;font-size:${Math.round(size * .36)}px">${_h(ini)}</div>`;
}
function _miniCard({ name, team, tier, rating, lim, label, size = 'm', body = '', sel = false, count = 0 }) {
  const t = lim ? 'limited' : (tier || 'bronze'), col = lim ? '#f5c518' : (_TIER_COL[t] || 'var(--border)'), bg = _MC_BG[t] || _MC_BG.bronze;
  const S = { s: { av: 30, lg: 14, fs: '.6rem', rt: '1rem', pad: '.25rem' }, m: { av: 46, lg: 20, fs: '.74rem', rt: '1.35rem', pad: '.4rem' }, l: { av: 56, lg: 22, fs: '.8rem', rt: '1.5rem', pad: '.45rem' } }[size];
  return `<div style="position:relative;border-radius:12px;padding:${S.pad};text-align:center;color:#fff;background:linear-gradient(160deg,${bg[0]},${bg[1]});border:2px solid ${sel ? 'var(--accent)' : col};box-shadow:${sel ? '0 0 0 2px var(--accent),' : ''}0 4px 14px rgba(0,0,0,.35);overflow:hidden">
    ${t === 'galaxy' || lim ? `<div style="position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.12) 45%,transparent 60%);pointer-events:none"></div>` : ''}
    <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative">
      <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:${S.rt};line-height:1;color:${col}">${rating ?? ''}</div>
      <div style="opacity:.95">${team ? teamLogo(team, S.lg, '.5rem') : ''}</div></div>
    <div style="margin:${size === 's' ? '0' : '-.2rem'} 0 .2rem">${_mcAvatar(name, S.av)}</div>
    <div style="font-weight:800;font-size:${S.fs};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${lim ? '🌟 ' : ''}${_h(name)}</div>
    ${size !== 's' ? `<div style="font-size:.58rem;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(team || '')}${count > 1 ? ' · ×' + count : ''}</div>` : ''}
    ${label && size !== 's' ? `<div style="font-size:.55rem;color:#f5c518;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_h(label)}</div>` : ''}
    ${body}</div>`;
}
function openCardPicker({ title, hint, max, exact, filter, preselect, onDone, extra, footer }) {
  const _f0 = filter; filter = c => !c?.coach && c?.tier !== 'coach' && (!_f0 || _f0(c)); // karty trenerskie nie są graczami
  const tierNow = (k, c) => k.startsWith('lim:') ? 'limited' : ((_cards?.pool || []).find(p => p.k === k)?.tier || c.tier); // aktualny poziom karty gracza
  const own = Object.entries(_cards?.cards || {}).map(([k, c]) => [k, { ...c, tier: tierNow(k, c) }]).filter(([, c]) => c.n > 0 && (!filter || filter(c)));
  const sel = new Set((preselect || []).filter(k => own.some(([kk]) => kk === k)));
  const m = _fxModal('cpick-modal', 760); m.classList.add('open');
  const draw = () => {
    m.querySelector('.modal').innerHTML = _fxHead('cpick-modal', title) + `<div data-notr>
      ${hint ? `<div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">${hint}</div>` : ''}
      <div class="cp-bar"><span class="cp-count${sel.size === max ? ' full' : ''}">${sel.size}/${max}</span><div class="cp-chips">${[...sel].map((k, i) => { const c = (own.find(([kk]) => kk === k) || [])[1] || {}; return `<span class="cp-chip"><b>${i + 1}</b> ${_h(c.name || '')}<button onclick="_cpToggle('${k.replace(/'/g, '')}')" title="${_g('Usuń', 'Remove')}">✕</button></span>`; }).join('') || `<span style="font-size:.74rem;color:var(--muted)">${_g('Kliknij karty, aby je wybrać', 'Tap cards to select them')}</span>`}</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));gap:.6rem;max-height:52vh;overflow-y:auto;padding:.45rem .25rem .25rem">${own.sort((a, b) => (TIER_ORDER[b[1].tier] ?? 0) - (TIER_ORDER[a[1].tier] ?? 0) || a[1].name.localeCompare(b[1].name)).map(([k, c]) => `
        <button onclick="_cpToggle('${k.replace(/'/g, '')}')" class="cp-tile${sel.has(k) ? ' on' : sel.size >= max ? ' dim' : ''}" style="padding:0;border:none;background:none;cursor:pointer;font-family:inherit;text-align:center">${sel.has(k) ? `<span class="cp-num">${[...sel].indexOf(k) + 1}</span>` : ''}${_miniCard({ name: c.name, team: c.team, tier: c.tier, lim: c.tier === 'limited', label: c.label, count: c.n, sel: false,
          rating: (_cardScope(k) && _pcData(c.name, _cardScope(k))?.rating) ?? (_cards?.pool || []).find(p => p.k === k)?.rating ?? _pcData(c.name, 'season')?.rating, body: extra ? extra(k, c) : '' })}</button>`).join('') || `<div style="color:var(--muted);font-size:.82rem">${_g('Brak pasujących kart.', 'No matching cards.')}</div>`}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.7rem;gap:.5rem"><span style="font-size:.8rem">${_g('Wybrano', 'Selected')}: <b>${sel.size}</b> / ${max}${footer ? ' · ' + footer([...sel]) : ''}</span>
        <button class="btn btn-primary" ${exact && sel.size !== max ? 'disabled' : ''} onclick="_cpDone()">✓ ${_g('Zatwierdź', 'Confirm')}</button></div></div>`;
  };
  window._cpToggle = k => { if(sel.has(k)) sel.delete(k); else if(sel.size < max) sel.add(k); else showToast(_g(`Maksymalnie ${max}`, `Max ${max}`), 'info'); draw(); };
  window._cpDone = () => { _fxClose('cpick-modal'); onDone([...sel]); };
  draw();
}
function craftOpen(mode) { if(!_ensureSession()) return; _cr = { mode, need: mode === 'pick' ? 12 : 10, sel: {}, target: null, q: '' }; _crDraw(); }
function _crTarget(k) { _cr.target = k; const t = (_cards?.pool || []).find(p => p.k === k); _cr.need = _PICK_COST[t?.tier] || 12; let tot = 0; for(const kk of Object.keys(_cr.sel)) { const n = Math.min(_cr.sel[kk], Math.max(0, _cr.need - tot)); _cr.sel[kk] = n; tot += n; } _crDraw(); }
function _crStep(k, d) { const c = _cards?.cards?.[k]; if(!c) return; const tot = Object.values(_cr.sel).reduce((s, n) => s + n, 0), nx = (_cr.sel[k] || 0) + d; if(nx < 0 || nx > c.n - 1 || (d > 0 && tot >= _cr.need)) return; _cr.sel[k] = nx; _crDraw(); }
function _crDraw() {
  const P = _poolBy(), own = _cards?.cards || {}, en = currentLang === 'en', up = _cr.mode === 'upgrade';
  const dup = Object.entries(own).filter(([k, c]) => c.n > 1 && !k.startsWith('lim:') && !k.startsWith('coach:') && (!up || ['bronze', 'silver'].includes(P[k]?.tier || c.tier))).sort((a, b) => b[1].n - a[1].n);
  const tot = Object.values(_cr.sel).reduce((s, n) => s + n, 0), miss = (_cards?.pool || []).filter(p => !(own[p.k]?.n > 0) && (!_cr.q || _normNick(p.name).includes(_normNick(_cr.q)) || _normNick(p.team).includes(_normNick(_cr.q)))).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const m = _fxModal('craft-modal', 600); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('craft-modal', up ? '⚒️ ' + _g('Ulepszenie', 'Upgrade') : '🎯 ' + _g('Wybrana karta', 'Pick a card')) + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.5rem">${up ? _g('Oddaj 10 duplikatów brązowych lub srebrnych i wylosuj kartę: 🟡 złota 75% · 💠 diamentowa 20% · 🌌 galaktyka 5%. Do 3 razy w tygodniu.', 'Hand in 10 bronze or silver duplicates and draw a card: 🟡 gold 75% · 💠 diamond 20% · 🌌 galaxy 5%. Up to 3 times a week.') : _g('Wybierz brakującą kartę i oddaj za nią duplikaty — im lepsza karta, tym więcej: 🟤 brąz 12 · ⚪ srebro 15 · 🟡 złoto 20 · 💠 diament 25 · 🌌 galaktyka 30. Do 2 razy w tygodniu.', 'Pick a card you’re missing and hand in duplicates — the better the card, the more it costs: 🟤 bronze 12 · ⚪ silver 15 · 🟡 gold 20 · 💠 diamond 25 · 🌌 galaxy 30. Up to 2 times a week.')} ${_g('Z każdej karty zostaje Ci co najmniej 1 egzemplarz.', 'You always keep at least 1 copy of each card.')}</div>
    ${up ? '' : `<label style="${_MODAL_LBL}">1. ${_g('Którą kartę chcesz?', 'Which card do you want?')}</label><input value="${_h(_cr.q)}" placeholder="${_g('Szukaj gracza lub drużyny…', 'Search player or team…')}" oninput="_cr.q=this.value;_crDraw();this.focus();this.setSelectionRange(this.value.length,this.value.length)" style="${_MODAL_INP};margin-bottom:.35rem">
      <div style="display:flex;flex-wrap:wrap;gap:.3rem;max-height:22vh;overflow:auto;margin-bottom:.7rem">${miss.slice(0, 60).map(p => `<button onclick="_crTarget('${p.k}')" style="font-family:inherit;font-size:.74rem;padding:.25rem .55rem;border-radius:999px;cursor:pointer;border:1px solid ${_cr.target === p.k ? '#22c55e' : 'var(--border)'};background:${_cr.target === p.k ? 'rgba(34,197,94,.2)' : 'var(--surface2)'};color:var(--text)">${_cr.target === p.k ? '✓ ' : ''}${_TIER_ICO[p.tier] || ''} ${_h(p.name)} <span style="color:var(--muted)">${_h(p.team || '')} · ${p.rating || ''} · ${_PICK_COST[p.tier] || 12}×</span></button>`).join('') || `<span style="font-size:.78rem;color:var(--muted)">${_g('Masz wszystkie karty z puli! 🏆', 'You have every card in the pool! 🏆')}</span>`}</div>
      <label style="${_MODAL_LBL}">2. ${_g('Duplikaty do oddania', 'Duplicates to hand in')}</label>`}
    <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem"><b style="font-family:'Barlow Condensed',sans-serif;font-size:1.35rem;color:${tot === _cr.need ? 'var(--win)' : 'var(--accent)'}">${tot}/${_cr.need}</b><button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem;margin-left:auto" onclick="_cr.sel={};_crDraw()">${_g('wyczyść', 'clear')}</button></div>
    <div style="max-height:34vh;overflow:auto">${dup.map(([k, c]) => { const n = _cr.sel[k] || 0; return `<div style="display:flex;align-items:center;gap:.5rem;padding:.3rem .2rem;border-bottom:1px solid var(--border);${n ? 'background:rgba(34,197,94,.08)' : ''}"><span style="flex:1;font-size:.8rem"><b>${_h(c.name)}</b> <span style="color:var(--muted);font-size:.7rem">${_h(c.team || '')} · ×${c.n}</span></span>
      <button class="btn btn-ghost" style="padding:.05rem .5rem" ${n ? '' : 'disabled'} onclick="_crStep('${k}',-1)">−</button><b style="width:18px;text-align:center">${n}</b><button class="btn btn-ghost" style="padding:.05rem .5rem" ${n < c.n - 1 && tot < _cr.need ? '' : 'disabled'} onclick="_crStep('${k}',1)">+</button></div>`; }).join('') || `<div style="font-size:.82rem;color:var(--muted)">${up ? _g('Nie masz duplikatów brązowych ani srebrnych.', 'No bronze or silver duplicates.') : _g('Nie masz duplikatów.', 'No duplicates.')}</div>`}</div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.7rem"><button class="btn btn-ghost" onclick="_fxClose('craft-modal')">${_g('Anuluj', 'Cancel')}</button><button class="btn btn-primary" ${tot === _cr.need && (up || _cr.target) ? '' : 'disabled'} onclick="_crGo()">${up ? '⚒️ ' + _g('Ulepsz', 'Upgrade') : '🎯 ' + _g('Odbierz kartę', 'Get the card')}</button></div></div>`;
}
async function _crGo() { const r = await _api('/cards/craft', 'POST', { mode: _cr.mode, give: _cr.sel, target: _cr.target }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _cards = { ..._cards, ...r }; _fxClose('craft-modal'); showToast(`${_cr.mode === 'pick' ? '🎯' : '⚒️'} ${_g('Nowa karta', 'New card')}: ${r.got.name} (${r.got.tier})`, 'success'); _teamEventsToast?.(r.teamEvents); renderCardsView(); setTimeout(() => openPlayerCardImg(r.got.name), 600); }
function challengesHtml(me) {
  const L = me?.challenges || []; if(!L.length && !discordUser) return '';
  const wkend = (() => { const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Warsaw' })).getDay(); return d === 5 || d === 6 || d === 0; })();
  const rw = r => r.kind === 'premium' ? `💎 ${_g('paczka premium', 'premium pack')}` : r.kind === 'coach' ? `🧑‍🏫 ${_g('karta trenerska do Kortu', 'Kort coach card')}` : r.kind === 'coach+pack' ? `🧑‍🏫 ${_g('karta trenerska', 'coach card')} + 🎁 ${_g('paczka', 'pack')}` : r.kind === 'xp' ? `⭐ +${r.n} XP` : `🎁 ${r.n} ${_g(_plPL(r.n, 'paczka', 'paczki', 'paczek'), r.n === 1 ? 'pack' : 'packs')}`;
  return `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🏅 ${_g('WYZWANIA TYGODNIA', 'WEEKLY CHALLENGES')}</div>
    <div style="font-size:.74rem;color:var(--muted);margin-bottom:.5rem">${_g('Oddaj karty spełniające warunek i odbierz nagrodę. Najlepiej oddawaj duplikaty. Nowe wyzwania co poniedziałek, a w weekend dodatkowe.', 'Hand in cards that meet the condition and get a reward — duplicates are best. New challenges every Monday, plus a weekend one.')}</div>
    ${L.map(c => { const lock = c.weekend && !wkend; return `<div style="display:flex;align-items:center;gap:.6rem;padding:.5rem 0;border-top:1px solid var(--border);${lock ? 'opacity:.55' : ''}">
      <span style="font-size:1.3rem;width:30px;text-align:center">${c.icon}</span>
      <div style="flex:1"><div style="font-weight:700;font-size:.86rem">${_h(currentLang === 'en' ? c.en : c.pl)}${c.hard ? ` <span style="font-size:.62rem;background:#f5c518;color:#111;border-radius:5px;padding:0 .3rem">${_g('TRUDNE', 'HARD')}</span>` : ''}</div><div style="font-size:.74rem;color:var(--muted)">${_g('Nagroda', 'Reward')}: ${rw(c.reward)}</div></div>
      ${c.done ? `<span style="color:var(--win);font-size:.78rem;font-weight:700">✅ ${_g('Ukończone', 'Done')}</span>` : lock ? `<span style="font-size:.72rem;color:var(--muted)">${_g('od piątku', 'from Friday')}</span>` : `<button class="btn btn-primary" style="font-size:.72rem" onclick="challengePick('${c.id}')">${_g('Wybierz karty', 'Pick cards')}</button>`}</div>`; }).join('')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem;margin-top:.6rem;padding-top:.6rem;border-top:1px dashed var(--border)">
      <button class="btn btn-ghost" style="font-size:.74rem;padding:.45rem;text-align:left;line-height:1.3" onclick="craftOpen('upgrade')">⚒️ <b>${_g('Ulepszenie', 'Upgrade')}</b><br><span style="font-size:.66rem;color:var(--muted);text-transform:none;letter-spacing:0">${_g('10 duplikatów brąz/srebro → złota+', '10 bronze/silver dupes → gold+')}</span></button>
      <button class="btn btn-ghost" style="font-size:.74rem;padding:.45rem;text-align:left;line-height:1.3" onclick="craftOpen('pick')">🎯 <b>${_g('Wybrana karta', 'Pick a card')}</b><br><span style="font-size:.66rem;color:var(--muted);text-transform:none;letter-spacing:0">${_g('12–30 duplikatów → brakująca karta', '12–30 dupes → a card you’re missing')}</span></button></div></div>`;
}
function challengePick(id) {
  const c = _cards?.challenges?.find(x => x.id === id); if(!c) return;
  const r = c.rule || {}, PB = Object.fromEntries((_cards?.pool || []).map(p => [_normNick(p.name), p])), pi = x => PB[_normNick(x.name)] || {};
  const filt = r.minTier ? x => (TIER_ORDER[x.tier] ?? 0) >= TIER_ORDER[r.minTier] : r.team ? x => String(x.team).toLowerCase() === String(r.team).toLowerCase()
    : r.teamsEach ? x => Object.keys(r.teamsEach).map(t => t.toLowerCase()).includes(String(x.team).toLowerCase()) : r.names ? x => r.names.map(_normNick).includes(_normNick(x.name))
    : r.rookie ? x => !!pi(x).rookie : r.positions ? x => !!pi(x).pos : null;
  openCardPicker({ title: c.icon + ' ' + _h(currentLang === 'en' ? c.en : c.pl), max: c.need, exact: true, filter: filt,
    hint: _g('Wybrane karty zostaną oddane (z duplikatów zabierany jest jeden egzemplarz).', 'The selected cards will be handed in (one copy is taken from duplicates).'),
    onDone: async keys => { if(!confirm(_g('Oddać wybrane karty i odebrać nagrodę?', 'Hand in the selected cards and claim the reward?'))) return;
      const res = await _api('/cards/challenge', 'POST', { id, cards: keys }, { session: true });
      if(!res.ok) { showToast('❌ ' + _tr(res.error), 'error'); return; }
      showToast(res.reward.kind === 'premium' ? _g('💎 Masz paczkę premium!', '💎 You got a premium pack!') : res.reward.kind === 'xp' ? `⭐ +${res.reward.n} XP` : res.reward.kind === 'coach' ? _g('🧑‍🏫 Nowa karta trenerska do Kortu!', '🧑‍🏫 New Kort coach card!') : res.reward.kind === 'coach+pack' ? _g('🧑‍🏫 Karta trenerska + 🎁 paczka!', '🧑‍🏫 Coach card + 🎁 pack!') : _g(`🎁 +${res.reward.n} paczka!`, `🎁 +${res.reward.n} pack!`), 'success'); renderCardsView(); } });
}
async function utHtml() {
  const r = await _api('/ut', 'GET', null, discordUser?.session ? { session: true } : {}); if(!r.ok) return ''; _ut = r;
  const mine = r.mine, ends = new Date(r.ends + 'T23:59:00').toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'pl-PL', { weekday: 'long' });
  const f1 = v => (Math.round(v * 10) / 10).toString().replace('.', currentLang === 'en' ? '.' : ',');
  return `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;flex-wrap:wrap"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏀 ${_g('MOJA PIĄTKA', 'MY FIVE')}</div><span style="font-size:.72rem;color:var(--muted)">${_g('koniec', 'ends')}: ${ends}</span></div>
    <div style="font-size:.74rem;color:var(--muted);margin:.3rem 0 .6rem">${_g('Ułóż piątkę z kart, które masz. Punkty liczą się z prawdziwych meczów rozegranych po ustawieniu składu (punkty, zbiórki ×1,2, asysty ×1,5, przechwyty i bloki ×3, straty −1, wygrana +2). Karta limitowana: +20%. Podium tygodnia dostaje paczki w poniedziałek.', 'Build a five from cards you own. Points come from real games played after you set the lineup (points, rebounds ×1.2, assists ×1.5, steals & blocks ×3, turnovers −1, win +2). Limited card: +20%. The weekly podium gets packs on Monday.')}</div>
    ${discordUser ? `<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.4rem">${[0, 1, 2, 3, 4].map(i => { const s = mine?.slots?.[i];
      return s ? `<div style="background:var(--surface2);border:2px solid ${_TIER_COL[s.tier] || 'var(--border)'};border-radius:10px;padding:.45rem .3rem;text-align:center"><div style="font-weight:800;font-size:.78rem;word-break:break-word">${_h(s.name)}${s.limited ? ' 🌟' : ''}</div><div style="font-size:.64rem;color:var(--muted)">${_h(s.team || '')}</div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.25rem;color:var(--accent)">${f1(s.pts)}</div><div style="font-size:.6rem;color:var(--muted)">${s.gp} ${_g(_plPL(s.gp, 'mecz', 'mecze', 'meczów'), s.gp === 1 ? 'game' : 'games')}</div></div>`
        : `<div style="background:var(--surface2);border:2px dashed var(--border);border-radius:10px;min-height:86px;display:flex;align-items:center;justify-content:center;color:var(--muted)">?</div>`; }).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.55rem;gap:.5rem;flex-wrap:wrap"><span style="font-size:.86rem">${_g('Razem', 'Total')}: <b style="color:var(--accent)">${f1(mine?.total || 0)}</b> ${_g('pkt', 'pts')}${mine ? ` · #${r.board.findIndex(x => x.id === mine.id) + 1}` : ''}</span>
      <button class="btn btn-primary" style="font-size:.74rem" onclick="utPick()">🏀 ${mine ? _g('Zmień piątkę', 'Change lineup') : _g('Ustaw piątkę', 'Set lineup')}</button></div>
    ${mine ? `<div style="font-size:.68rem;color:var(--muted);margin-top:.25rem">${_g('Zmieniony gracz zaczyna zbierać punkty od nowa — od meczów po zmianie.', 'A swapped-in player starts scoring from games after the change.')}</div>` : ''}` : `<div style="font-size:.82rem">${_g('Zaloguj się przez Discord, żeby zagrać.', 'Log in with Discord to play.')}</div>`}
    ${r.board.length ? `<div style="margin-top:.7rem;font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">${_g('RANKING TYGODNIA', 'WEEKLY RANKING')}</div>${r.board.slice(0, 10).map((x, i) => `<div onclick="openFanProfile('${x.id}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid var(--border);font-size:.82rem"><span style="display:flex;align-items:center;gap:.45rem"><span style="width:24px;text-align:center">${['🥇', '🥈', '🥉'][i] || (i + 1) + '.'}</span>${_avatarHtml(x.avatar, 20)} ${_h(x.name)}</span><b>${f1(x.total)}</b></div>`).join('')}` : ''}
  </div>`;
}
function utPick() {
  openCardPicker({ title: '🏀 ' + _g('Moja piątka', 'My five'), max: 5, exact: true, preselect: (_ut?.mine?.slots || []).map(s => s.key),
    hint: _g('Wybierz 5 kart różnych graczy. Karta limitowana 🌟 daje +20% punktów.', 'Pick 5 cards of different players. A limited card 🌟 gives +20% points.'),
    onDone: async keys => { const r = await _api('/ut/lineup', 'POST', { cards: keys }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; } showToast(_g('🏀 Piątka ustawiona!', '🏀 Lineup set!'), 'success'); renderCardsView(); } });
}
// ═══ 🏆 GABLOTA ═══
function showcasePick() {
  openCardPicker({ title: '🏆 ' + _g('Gablota na profilu', 'Profile showcase'), max: 3, preselect: _cards?.showcase || [],
    hint: _g('Wybierz do 3 kart, które wszyscy zobaczą na Twoim profilu kibica.', 'Pick up to 3 cards everyone will see on your fan profile.'),
    onDone: async keys => { const r = await _api('/cards/showcase', 'POST', { cards: keys }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error), 'error'); return; } _cards.showcase = r.showcase; showToast(_g('🏆 Gablota zapisana', '🏆 Showcase saved'), 'success'); } });
}
async function showcaseRender(el, list) {
  if(!el || !list?.length) return;
  for(const c of list) {
    let url = null; try { url = c.tier === 'limited' ? await _pcLimitedImage(c.name, c.label, _limScope(c), c.theme, c.variant, c.persona) : await (async () => { const d = _pcData(c.name, 'season') || _pcData(c.name, 'career'); return d ? _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true) : null; })(); } catch(e) {}
    const slot = document.createElement('div'); slot.style.cssText = 'flex:1 1 160px;max-width:200px';
    slot.innerHTML = url ? (['limited', 'galaxy', 'diamond'].includes(c.tier) ? _holoHtml(url, c.name, c.tier === 'diamond' ? .75 : 1) : `<img src="${url}" alt="${_h(c.name)}" style="width:100%;border-radius:12px;display:block">`) : `<div style="padding:1rem;border:1px dashed var(--border);border-radius:12px;text-align:center;font-size:.8rem">${_h(c.name)}</div>`;
    el.appendChild(slot);
  }
  _holoBind(el);
}
function _limTile(c, own) {
  const o = own?.['lim:' + c.id], left = c.active ? Math.max(0, Math.ceil((Date.parse(c.until) - Date.now()) / 864e5)) : 0;
  return `<div title="${_h(c.label)}" onclick="${o ? `openLimitedCard(this.dataset.n, this.dataset.l, this.dataset.s, this.dataset.t, this.dataset.v, this.dataset.p)` : ''}" data-n="${_h(c.name)}" data-l="${_h(c.label)}" data-s="${_h(_limScope(c) || '')}" data-t="${_h(c.theme || 'gold')}" data-v="${+c.variant || 0}" data-p="${c.persona ? _h(JSON.stringify(c.persona)) : ''}" style="width:150px;min-height:175px;border-radius:12px;padding:.5rem;text-align:center;position:relative;cursor:${o ? 'pointer' : 'default'};
    background:${o ? 'linear-gradient(135deg,#3a2a00,#1a1405 40%,#4a3a10 60%,#1a1405)' : 'var(--surface2)'};border:2px solid ${o ? '#f5c518' : 'var(--border)'};box-shadow:${o ? '0 0 18px rgba(245,197,24,.45)' : 'none'};opacity:${o ? 1 : .55}">
    <div style="font-size:.6rem;font-weight:900;letter-spacing:1px;color:#f5c518">🌟 ${currentLang === 'en' ? 'LIMITED' : 'LIMITOWANA'}</div>
    <div style="font-size:1.6rem;margin:.3rem 0">${o ? '🏅' : '❔'}</div>
    <div style="font-weight:900;font-size:.85rem;word-break:break-word">${_h(c.name)}</div><div style="font-size:.66rem;color:var(--muted)">${_h(c.team || '')}</div>
    <div style="font-size:.64rem;font-weight:800;color:#f5c518;margin-top:.3rem">${_h(c.label)}</div>${c.line ? `<div style="font-size:.62rem;color:var(--muted)">${_h(c.line)}</div>` : ''}
    <div style="font-size:.62rem;margin-top:.3rem;color:var(--muted)">${currentLang === 'en' ? `owned by ${c.owners}` : `ma ją ${c.owners} ${_plPL(c.owners, 'osoba', 'osoby', 'osób')}`}${c.active ? ` · ⏳ ${left} ${currentLang === 'en' ? 'd left' : (left === 1 ? 'dzień' : 'dni')}` : ''}</div>
    ${o && o.n > 1 ? `<span style="position:absolute;top:4px;right:6px;font-size:.62rem;background:#f5c518;color:#000;border-radius:999px;padding:0 .3rem">×${o.n}</span>` : ''}</div>`;
}
function _setRewardToast(list) { (list || []).map(n => currentLang === 'en' ? String(n).replace('Karty limitowane', 'Limited cards') : n).forEach(n => showToast(_g(`🏆 Komplet zestawu „${n}” — dostajesz 💎 paczkę premium!`, `🏆 Set “${n}” complete — you get a 💎 premium pack!`), 'success')); }
// 🏆 zestawy kart limitowanych: tydzień (Piątka + MVP) i okazje; komplet = 💎 paczka premium
function limitedSetsHtml(me) {
  const all = me?.sets || [], ended = all.filter(x => !x.active && !x.done && x.owned > 0), S = all.filter(x => x.active || x.done).sort((a, b) => (a.done - b.done) || (b.active - a.active)); // zakończone bez żadnej karty — ukryte
  if(!S.length && !ended.length) return '';
  const name = x => x.key.startsWith('wk:') ? _g('Karty limitowane', 'Limited cards') + ' · Week ' + x.key.split(':')[2] : x.name;
  const tile = x => { const pct = Math.round(x.owned / x.total * 100);
    return `<div style="background:var(--surface2);border:1px solid ${x.done ? 'var(--win)' : 'var(--border)'};border-radius:10px;padding:.5rem .65rem;${!x.active && !x.done ? 'opacity:.6' : ''}">
        <div style="display:flex;justify-content:space-between;gap:.4rem;font-size:.8rem"><b>${_h(name(x))}</b><span>${x.owned}/${x.total}</span></div>
        <div style="height:6px;background:var(--surface);border-radius:3px;margin:.35rem 0;overflow:hidden"><div style="height:100%;width:${pct}%;background:${x.done ? 'var(--win)' : '#f5c518'}"></div></div>
        <div style="font-size:.7rem;color:var(--muted)">${x.done ? '✅ ' + _g('Skompletowany — nagroda odebrana', 'Complete — reward claimed') : !x.final ? '⏳ ' + _g('Zestaw uzupełni karta MVP tygodnia', 'The MVP of the week card will complete this set') : x.active ? _g('Brakuje', 'Missing') + ': ' + x.cards.filter(c => !c.owned).map(c => _h(c.name)).join(', ') : '⌛ ' + _g('Zakończony — karty nie wypadają już z paczek', 'Ended — these cards no longer drop from packs')}</div></div>`; };
  return `<div style="margin-bottom:.8rem">${S.length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f5c518;margin-bottom:.35rem">🏆 ${_g('ZESTAWY — KOMPLET = 💎 PACZKA PREMIUM', 'SETS — COMPLETE = 💎 PREMIUM PACK')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.45rem">${S.map(tile).join('')}</div>` : ''}
    ${ended.length ? `<details style="margin-top:.5rem"><summary style="cursor:pointer;font-size:.74rem;color:var(--muted)">⌛ ${_g('Zakończone zestawy', 'Ended sets')} (${ended.length}) — ${_g('nie da się ich już skompletować', 'can no longer be completed')}</summary>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.45rem;margin-top:.4rem">${ended.map(tile).join('')}</div></details>` : ''}
    <div style="font-size:.66rem;color:var(--muted);margin-top:.3rem">${_g('Gdy skompletujesz zestaw, jego karty przestają Ci wypadać z paczek. Duplikaty przed kompletem możesz oddać w wyzwaniach albo podarować.', 'Once you complete a set, its cards stop dropping for you. Duplicates before that can go to challenges or gifts.')}</div></div>`;
}
function tradesSectionHtml(me) {
  if(!discordUser) return ''; const T = me?.trades || [], my = discordUser.id, en = currentLang === 'en';
  const inc = T.filter(t => t.to === my && t.status === 'open'), out = T.filter(t => t.from === my && t.status === 'open'), done = T.filter(t => t.status !== 'open').slice(-5).reverse();
  const names = L => L.map(c => `<b>${_h(c.name)}</b>`).join(', '), ago = a => new Date(a).toLocaleDateString(en ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'short' });
  const ST = { accepted: ['✅', _g('przyjęta', 'accepted')], rejected: ['❌', _g('odrzucona', 'rejected')], canceled: ['↩', _g('anulowana', 'canceled')], expired: ['⌛', _g('wygasła', 'expired')] };
  return `<div class="card" id="trades-sec" style="padding:.75rem 1rem;margin-bottom:1rem" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🔁 ${_g('WYMIANY KART', 'CARD TRADES')}${inc.length ? ` <span style="background:#ef4444;color:#fff;border-radius:999px;padding:0 .4rem;font-size:.62rem">${inc.length}</span>` : ''}</div>
      ${out.length ? `<span style="font-size:.7rem;color:var(--muted)">⏳ ${_g('Masz otwartą propozycję (limit 1)', 'You have an open offer (limit 1)')}</span>` : `<button class="btn btn-primary" style="font-size:.72rem;padding:.25rem .6rem" onclick="openTradeComposer({})">➕ ${_g('Nowa wymiana', 'New trade')}</button>`}</div>
    ${inc.map(t => `<div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.4);border-radius:10px;padding:.5rem .65rem;margin-bottom:.4rem;font-size:.8rem">
      📥 <b>${_h(t.fromName)}</b> ${_g('proponuje', 'offers')}: ${names(t.give)} ⇄ ${_g('za Twoje', 'for your')} ${t.want.map(c => `<b>${_h(c.name)}</b>${(me?.cards?.[c.k]?.n || 0) <= 1 ? ` <span style="color:#ef4444;font-size:.7rem">⚠ ${_g('jedyna', 'last copy')}</span>` : ''}`).join(', ')}${t.note ? `<div style="color:var(--muted);font-size:.74rem;margin-top:.2rem">💬 „${_h(t.note)}”</div>` : ''}
      <div style="display:flex;gap:.35rem;margin-top:.4rem"><button class="btn btn-primary" style="font-size:.72rem;padding:.2rem .6rem" onclick="tradeRespond('${t.id}',true)">✅ ${_g('Akceptuj', 'Accept')}</button><button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .6rem" onclick="tradeRespond('${t.id}',false)">✕ ${_g('Odrzuć', 'Reject')}</button><span style="margin-left:auto;font-size:.68rem;color:var(--muted)">${ago(t.at)}</span></div></div>`).join('')}
    ${out.map(t => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.45rem .65rem;margin-bottom:.4rem;font-size:.78rem;display:flex;gap:.5rem;align-items:center">
      <span style="flex:1">📤 ${_g('Do', 'To')} <b>${_h(t.toName)}</b>: ${names(t.give)} ⇄ ${names(t.want)} <span style="color:var(--muted);font-size:.7rem">· ${_g('czeka na odpowiedź', 'waiting for a reply')}</span></span><button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .45rem" onclick="tradeCancel('${t.id}')">${_g('Anuluj', 'Cancel')}</button></div>`).join('')}
    ${!inc.length && !out.length ? `<div style="font-size:.78rem;color:var(--muted)">${_g('Brakuje Ci karty do kompletu? Kliknij brakującą kartę (🔍) w zestawach drużyn albo zaproponuj wymianę dowolnemu kolekcjonerowi.', 'Missing a card for a set? Tap a missing card (🔍) in the team sets or offer a trade to any collector.')}</div>` : ''}
    ${done.length ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.4rem">${done.map(t => `${ST[t.status]?.[0] || ''} ${_h(t.from === my ? t.toName : t.fromName)}: ${t.give.map(c => _h(c.name)).join(', ')} ⇄ ${t.want.map(c => _h(c.name)).join(', ')} (${ST[t.status]?.[1] || t.status})`).join('<br>')}</div>` : ''}</div>`;
}
async function _tradeAfter(r, msg) { if(!r?.ok) { showToast('❌ ' + _tr(r?.error || ''), 'error'); if(r?.cards) { _cards = { ..._cards, ...r }; renderCardsView(); } return false; } _cards = { ..._cards, ...r }; showToast(msg, 'success'); renderCardsView(); return true; }
async function tradeRespond(id, accept) { const t = (_cards?.trades || []).find(x => x.id === id);
  if(accept) { const last = (t?.want || []).filter(c => (_cards?.cards?.[c.k]?.n || 0) <= 1), L = A => (A || []).map(c => c.name + (c.tier ? ' (' + c.tier + ')' : '')).join(', ');
    const msg = _g(`Przyjąć wymianę od ${t?.fromName || ''}?\n\n✅ Dostajesz: ${L(t?.give)}\n➡️ Oddajesz: ${L(t?.want)}`, `Accept the trade from ${t?.fromName || ''}?\n\n✅ You get: ${L(t?.give)}\n➡️ You give: ${L(t?.want)}`)
      + (last.length ? _g(`\n\n⚠ To Twój jedyny egzemplarz: ${last.map(c => c.name).join(', ')} — zniknie z kolekcji (i z kompletu drużyny).`, `\n\n⚠ This is your only copy of: ${last.map(c => c.name).join(', ')} — it will leave your collection (and your team set).`) : '')
      + _g('\n\nKarty zostaną od razu zamienione.', '\n\nCards are swapped immediately.');
    if(!confirm(msg)) return; } const r = await _api('/cards/trade/respond', 'POST', { id, accept }, { session: true }); _tradeAfter(r, accept ? _g('🔁 Wymiana przyjęta — karty są w kolekcji!', '🔁 Trade accepted — the cards are in your collection!') : _g('Propozycja odrzucona', 'Offer rejected')); }
async function tradeCancel(id) { const r = await _api('/cards/trade/cancel', 'POST', { id }, { session: true }); _tradeAfter(r, _g('Propozycja anulowana', 'Offer canceled')); }
async function openCardHolders(k, name) { // 🔍 kto ma tę kartę
  if(!_ensureSession()) return; const m = _fxModal('holders-modal', 480); m.classList.add('open'); m.querySelector('.modal').innerHTML = _fxHead('holders-modal', '🔍 ' + _h(name)) + '⏳';
  const r = await _api('/cards/holders', 'POST', { key: k }, { session: true }); const L = r.holders || [];
  m.querySelector('.modal').innerHTML = _fxHead('holders-modal', `🔍 ${_g('Kto ma kartę', 'Who has')} ${_h(name)}`) + `<div data-notr>${L.length ? L.map(h => `<div style="display:flex;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--border)">${h.avatar ? `<img src="${_h(h.avatar)}" style="width:28px;height:28px;border-radius:50%">` : '👤'}<b style="flex:1">${_h(h.name)}</b>${h.n > 1 ? `<span style="font-size:.7rem;color:var(--win)">×${h.n} ${_g('(duplikat)', '(duplicate)')}</span>` : `<span style="font-size:.7rem;color:var(--muted)">×1</span>`}
      <button class="btn btn-primary" style="font-size:.7rem;padding:.2rem .5rem" onclick="_fxClose('holders-modal');openTradeComposer({to:'${h.id}',toName:'${_h(h.name).replace(/'/g, "\\'")}',want:['${k.replace(/'/g, '')}']})">🔁 ${_g('Zaproponuj', 'Offer')}</button></div>`).join('') : `<div style="color:var(--muted);font-size:.84rem">${_g('Nikt jeszcze nie ma tej karty.', 'Nobody has this card yet.')}</div>`}</div>`;
}
async function openTradeComposer({ to, toName, want }) { if(!_ensureSession()) return;
  const myOpen = (_cards?.trades || []).find(t => t.from === discordUser?.id && t.status === 'open'); // 🔁 limit: 1 otwarta propozycja
  if(myOpen) { if(confirm(_g(`Możesz mieć tylko 1 otwartą propozycję wymiany.\n\nTwoja propozycja dla ${myOpen.toName}: dajesz ${myOpen.give.map(c => c.name).join(', ')} ⇄ chcesz ${myOpen.want.map(c => c.name).join(', ')}.\n\nAnulować ją, żeby złożyć nową?`, `You can only have 1 open trade offer.\n\nYour offer to ${myOpen.toName}: you give ${myOpen.give.map(c => c.name).join(', ')} ⇄ you want ${myOpen.want.map(c => c.name).join(', ')}.\n\nCancel it to make a new one?`))) { await tradeCancel(myOpen.id); } else return; } _trd = { to: to || null, toName: toName || '', want: new Set(want || []), give: [], their: null, q: '' }; if(_trd.to) await _trdLoad(); _trdDraw(); }
async function _trdLoad() { const r = await _api('/cards/of', 'POST', { id: _trd.to }, { session: true }); _trd.their = r.ok ? r.cards : []; }
async function _trdPick(id, name) { _trd.to = id; _trd.toName = name; _trd.want = new Set(); _trdDraw(); await _trdLoad(); _trdDraw(); }
async function _trdDraw() {
  const m = _fxModal('trade-modal', 720); m.classList.add('open'); const en = currentLang === 'en', mine = _cards?.cards || {};
  let body;
  if(!_trd.to) { const b = window._trdBoard || (window._trdBoard = await _api('/cards/board', 'GET', null, {}).catch(() => ({}))); const L = (b.board || []).filter(x => x.id !== discordUser.id && (!_trd.q || _normNick(x.name).includes(_normNick(_trd.q)))).slice(0, 40);
    body = `<div style="font-weight:700;margin-bottom:.4rem">1. ${_g('Z kim chcesz się wymienić?', 'Who do you want to trade with?')}</div><input value="${_h(_trd.q)}" placeholder="${_g('Szukaj kolekcjonera…', 'Search collector…')}" oninput="_trd.q=this.value;_trdDraw();this.focus()" style="${_MODAL_INP};margin-bottom:.4rem">
      <div style="max-height:50vh;overflow:auto">${L.map(x => `<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem 0;border-bottom:1px solid var(--border)">${x.avatar ? `<img src="${_h(x.avatar)}" style="width:26px;height:26px;border-radius:50%">` : '👤'}<b style="flex:1">${_h(x.name)}</b><span style="font-size:.7rem;color:var(--muted)">${x.unique} ${_g('kart', 'cards')}</span><button class="btn btn-ghost" style="font-size:.7rem;padding:.15rem .5rem" onclick="_trdPick('${x.id}','${_h(x.name).replace(/'/g, "\\'")}')">${_g('Wybierz', 'Choose')}</button></div>`).join('')}</div>`; }
  else { const their = (_trd.their || []).filter(c => !String(c.k).startsWith('lim:') && c.tier !== 'limited').map(c => ({ ...c, missing: !(mine[c.k]?.n > 0) })).sort((a, b) => (b.missing - a.missing) || (b.n - a.n) || a.name.localeCompare(b.name));
    const giveNames = _trd.give.map(k => mine[k]?.name || k);
    body = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem"><div>${_g('Wymiana z', 'Trade with')} <b>${_h(_trd.toName)}</b></div><button class="btn btn-ghost" style="font-size:.68rem;padding:.15rem .45rem" onclick="_trd.to=null;_trdDraw()">${_g('zmień', 'change')}</button></div>
      <div style="font-weight:700;margin-bottom:.3rem">2. ${_g('Chcę od niego/niej', 'I want')} <span style="font-weight:400;color:var(--muted);font-size:.74rem">(${_trd.want.size}/5 · ${_g('🆕 = brakuje Ci', '🆕 = you’re missing it')})</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem;max-height:30vh;overflow:auto;margin-bottom:.7rem">${their === null ? '⏳' : their.map(c => { const on = _trd.want.has(c.k); return `<button onclick="_trd.want.has('${c.k}')?_trd.want.delete('${c.k}'):(_trd.want.size<5&&_trd.want.add('${c.k}'));_trdDraw()" style="font-family:inherit;font-size:.74rem;padding:.25rem .5rem;border-radius:999px;cursor:pointer;border:1px solid ${on ? '#22c55e' : 'var(--border)'};background:${on ? 'rgba(34,197,94,.2)' : 'var(--surface2)'};color:var(--text)">${on ? '✓ ' : ''}${c.missing ? '🆕 ' : ''}${_h(c.name)}${c.tier === 'limited' ? ' 🌟' : ''}${c.n > 1 ? ` <span style="color:var(--muted)">×${c.n}</span>` : ''}</button>`; }).join('') || `<span style="color:var(--muted);font-size:.8rem">${_g('Brak kart', 'No cards')}</span>`}</div>
      <div style="font-weight:700;margin-bottom:.3rem">3. ${_g('Daję', 'I give')} <span style="font-weight:400;color:var(--muted);font-size:.74rem">(${_trd.give.length}/5)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:.3rem;align-items:center;margin-bottom:.7rem">${_trd.give.map(k => { const one = (mine[k]?.n || 0) <= 1; return `<span style="font-size:.74rem;padding:.2rem .5rem;border-radius:999px;background:${one ? 'rgba(239,68,68,.15)' : 'rgba(245,197,24,.15)'};border:1px solid ${one ? 'rgba(239,68,68,.6)' : 'rgba(245,197,24,.5)'}" title="${one ? _g('Masz tylko jeden egzemplarz — po wymianie zniknie z kolekcji', 'You only have one copy — it will leave your collection') : ''}">${_h(mine[k]?.name || k)}${one ? ` <b style="color:#ef4444">⚠ ${_g('jedyna', 'last copy')}</b>` : ` <span style="color:var(--muted)">×${mine[k].n}</span>`}</span>`; }).join('')}
        <button class="btn btn-ghost" style="font-size:.72rem;padding:.2rem .55rem" onclick="openCardPicker({ title: '${_g('Karty, które dajesz', 'Cards you give')}', hint: '${_g('Najlepiej duplikaty — oddana karta znika z Twojej kolekcji. Karty limitowane nie biorą udziału w wymianach.', 'Duplicates are best — a traded card leaves your collection. Limited cards can’t be traded.')}', max: 5, preselect: _trd.give, filter: c => c.tier !== 'limited' && !c.lim, onDone: k => { _trd.give = k; _trdDraw(); } })">${_trd.give.length ? _g('zmień', 'change') : '➕ ' + _g('wybierz karty', 'choose cards')}</button></div>
      <input id="trd-note" maxlength="140" placeholder="${_g('Wiadomość (opcjonalnie), np. „brakuje mi tej karty do kompletu”', 'Message (optional), e.g. “I need it for a set”')}" style="${_MODAL_INP};margin-bottom:.6rem">
      <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary" ${_trd.want.size && _trd.give.length ? '' : 'disabled'} onclick="tradeSend()">📤 ${_g('Wyślij propozycję', 'Send offer')}</button></div>`; }
  m.querySelector('.modal').innerHTML = _fxHead('trade-modal', '🔁 ' + _g('Nowa wymiana', 'New trade')) + `<div data-notr>${body}</div>`;
}
function _lastCopyOk(keys) { // ostrzeżenie: oddajesz jedyny egzemplarz karty
  const mine = _cards?.cards || {}, last = keys.filter(k => (mine[k]?.n || 0) <= 1).map(k => mine[k]?.name || k);
  return !last.length || confirm(_g(`⚠ Oddajesz jedyny egzemplarz: ${last.join(', ')}.\nStracisz ${last.length > 1 ? 'te karty' : 'tę kartę'} z kolekcji (i z kompletu drużyny). Na pewno?`, `⚠ You are giving away your last copy of: ${last.join(', ')}.\n${last.length > 1 ? 'These cards' : 'This card'} will leave your collection (and your team set). Are you sure?`));
}
async function tradeSend() {
  if(!_lastCopyOk(_trd.give)) return; const r = await _api('/cards/trade/offer', 'POST', { to: _trd.to, give: _trd.give, want: [..._trd.want], note: document.getElementById('trd-note')?.value || '' }, { session: true }); if(await _tradeAfter(r, _g('📤 Propozycja wysłana — dostanie DM', '📤 Offer sent — they’ll get a DM'))) _fxClose('trade-modal'); }
function limitedSectionHtml(me) {
  const L = me?.limited || []; if(!L.length) return '';
  const act = L.filter(c => c.active), past = L.filter(c => !c.active && me.cards?.['lim:' + c.id]);
  return `<div class="card" style="padding:.7rem 1rem;margin-bottom:1rem;border:1px solid rgba(245,197,24,.5)"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:#f5c518;margin-bottom:.4rem">🌟 ${_g('KARTY LIMITOWANE', 'LIMITED CARDS')}</div>
    <div style="font-size:.76rem;color:var(--muted);margin-bottom:.5rem">${_g('Specjalne edycje (MVP tygodnia, Piątka tygodnia i inne) — do zdobycia w paczkach tylko przez kilka dni. Potem znikają na zawsze. Każda limitowana = +10 XP w Lidze kibiców.', 'Special editions (MVP of the week, Team of the Week and more) — only in packs for a few days, then gone for good. Each limited card = +10 XP in the Fan league.')}</div>
    ${act.length ? `<div style="font-size:.74rem;font-weight:800;margin:.3rem 0">⏳ ${_g('Teraz w paczkach', 'In packs now')}</div><div style="display:flex;gap:.5rem;flex-wrap:wrap">${act.map(c => _limTile(c, me.cards)).join('')}</div>` : ''}
    ${past.length ? `<div style="font-size:.74rem;font-weight:800;margin:.7rem 0 .3rem">📚 ${_g('Mój album', 'My album')}</div><div style="display:flex;gap:.5rem;flex-wrap:wrap">${past.map(c => _limTile(c, me.cards)).join('')}</div>` : ''}</div>`;
}
// 🆕 karta debiutanta — gracz bez meczu w sezonie (bez statystyk)
async function _rookieCardImage(name, team) {
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#3a2414'); bg.addColorStop(1, '#120a05'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.lineWidth = 18; g.strokeStyle = '#d08b4f'; g.strokeRect(18, 18, W - 36, H - 36);
  g.textAlign = 'center'; g.fillStyle = '#f3c9a3'; g.font = `900 120px ${F}`; g.fillText('🆕', W / 2, 360);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `800 40px ${F}`; g.fillText(currentLang === 'en' ? 'ROOKIE' : 'DEBIUTANT', W / 2, 520);
  let fs = 130; g.font = `900 ${fs}px ${F}`; while(g.measureText(String(name).toUpperCase()).width > W - 140 && fs > 50) { fs -= 4; g.font = `900 ${fs}px ${F}`; }
  g.fillStyle = '#fff'; g.fillText(String(name).toUpperCase(), W / 2, 700);
  if(team) { g.font = `800 50px ${F}`; g.fillStyle = '#f3c9a3'; g.fillText(String(team).toUpperCase(), W / 2, 790); }
  g.font = `700 36px ${F}`; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(currentLang === 'en' ? 'First game still ahead' : 'Pierwszy mecz w sezonie przed nim', W / 2, 920);
  g.font = `700 26px ${F}`; g.fillStyle = 'rgba(255,255,255,.4)'; g.fillText('2K PRO-AM EKSTRAKLASA · CHEMIKLEAGUES.COM', W / 2, H - 70);
  return cv.toDataURL('image/png');
}
async function _limRender(c) { // c: {name,label,theme,variant,persona:{sub,img},scope}
  const F = "'Barlow Condensed', 'Arial Narrow', sans-serif, 'Noto Color Emoji'";
  let baseUrl = null;
  if(!c.persona) { const d = (c.scope && _pcData(c.name, c.scope)) || _pcData(c.name, 'season') || _pcData(c.name, 'edition') || _pcData(c.name, 'career'); if(d) baseUrl = await _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true); }
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const load = src => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  if(baseUrl) g.drawImage(await load(baseUrl), 0, 0, W, H);
  else { let img = null; if(c.persona?.img) { try { img = await load(c.persona.img); } catch(e) {} } _limPersonaPaint(g, W, H, c.name, c.persona?.sub || '', img, c.theme, F); }
  _limPaint(g, W, H, c.label, c.theme, c.variant, F);
  try { return cv.toDataURL('image/png'); } catch(e) { return null; } // obrazek z innej domeny bez CORS — bez podglądu
}
async function openLimitedAdmin() {
  const m = _fxModal('lim-modal', 860); m.classList.add('open');
  const players = [...new Set(_withAllMatches(() => matches.flatMap(x => [x.team1, x.team2]).flatMap(t => (t.players || []).map(p => p.name + '|' + t.name))))];
  const st = await _api('/daily-invite', 'POST', {}, { admin: true }), L = (await _api('/cards/limited', 'POST', { list: true }, { admin: true })).list || [];
  const now = Date.now(), until = new Date(Date.now() + 7 * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16), sel = (id, opts, v) => `<select id="${id}" style="${_MODAL_INP}">${opts.map(([k, l]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  m.querySelector('.modal').innerHTML = _fxHead('lim-modal', '🌟 Karty limitowane') + `<div data-notr style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:1rem">
    <div>
      <div style="font-size:.76rem;color:var(--muted);margin-bottom:.6rem">Automatycznie: Piątka tygodnia i MVP tygodnia. Tu wydajesz kartę ręcznie — za rekord, okazję albo dla kogoś spoza ligi.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem"><div><label style="${_MODAL_LBL}">Rodzaj</label>${sel('lim-k', _LIM_KINDS, 'special')}</div><div><label style="${_MODAL_LBL}">Motyw</label>${sel('lim-t', _LIM_THEME_LBL, 'gold')}</div></div>
      <label style="${_MODAL_LBL};margin-top:.5rem">Zawodnik / osoba</label><input id="lim-p" list="lim-pl" style="${_MODAL_INP}"><datalist id="lim-pl">${players.map(x => `<option value="${_h(x.split('|')[0])}">${_h(x.split('|')[1])}</option>`).join('')}</datalist>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.78rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:.45rem 0"><input type="checkbox" id="lim-per" style="width:auto;margin:0" onchange="document.getElementById('lim-perbox').style.display=this.checked?'grid':'none'"> Osoba spoza ligi (karta bez statystyk)</label>
      <div id="lim-perbox" style="display:none;grid-template-columns:1fr 1fr;gap:.5rem"><div><label style="${_MODAL_LBL}">Podpis</label><input id="lim-sub" placeholder="np. Organizator ligi" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Obrazek (URL, opcj.)</label><input id="lim-img" placeholder="https://cdn.discordapp.com/…" style="${_MODAL_INP}"></div></div>
      <label style="${_MODAL_LBL};margin-top:.5rem">Napis na karcie</label><input id="lim-l" placeholder="np. REKORD LIGI · 52 PTS" maxlength="60" style="${_MODAL_INP}">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-top:.5rem"><div><label style="${_MODAL_LBL}">W paczkach do</label><input id="lim-u" type="datetime-local" value="${until}" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Szansa w paczce %</label><input id="lim-c" type="number" min="1" max="90" placeholder="${Math.round((st.limitedChance ?? .1) * 100)} (domyślna)" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Wariant dekoracji</label><input id="lim-v" type="number" min="0" max="9" value="0" style="${_MODAL_INP}"></div></div>
      <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.7rem"><button class="btn btn-ghost" onclick="limPreview()">👁 Podgląd</button><button class="btn btn-primary" onclick="limitedCreate()">🌟 Wydaj i ogłoś</button></div>
      <div style="border-top:1px solid var(--border);margin-top:.9rem;padding-top:.7rem">
        <b style="font-size:.84rem">🎉 Kreator okazji — karty z cegieł tygodnia</b>
        <div style="font-size:.74rem;color:var(--muted);margin:.2rem 0 .45rem">Każda karta dostaje inny wariant dekoracji. Najlepiej z wyższą szansą — okazja szybko mija.</div>
        <div style="display:grid;grid-template-columns:1.3fr .7fr 1.3fr .7fr;gap:.4rem;align-items:end"><div><label style="${_MODAL_LBL}">Motyw</label>${sel('ev-t', _LIM_THEME_LBL, 'halloween')}</div><div><label style="${_MODAL_LBL}">Ile kart</label><input id="ev-n" type="number" min="1" max="12" value="4" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Do</label><input id="ev-u" type="datetime-local" value="${until}" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Szansa %</label><input id="ev-c" type="number" value="30" min="1" max="90" style="${_MODAL_INP}"></div></div>
        <label style="${_MODAL_LBL};margin-top:.45rem">Z których kolejek</label>
        <div id="ev-weeks" style="display:flex;flex-wrap:wrap;gap:.35rem">${(() => { const W = _eventWeeks(); return W.length ? W.map((w, i) => `<label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;font-weight:600;text-transform:none;letter-spacing:0;color:var(--text);background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.25rem .55rem;cursor:pointer"><input type="checkbox" value="${w}" ${i >= W.length - 2 ? 'checked' : ''} style="width:auto;margin:0;accent-color:var(--accent)"> Week ${w}</label>`).join('') : '<span style="font-size:.76rem;color:var(--muted)">Brak rozegranych kolejek w tym sezonie.</span>'; })()}</div>
        <div style="font-size:.7rem;color:var(--muted);margin-top:.25rem">Kolejność: 1. miejsca z cegieł każdej zaznaczonej kolejki, potem 2. miejsca itd. (np. 4 karty z Week 1 i 2 → #1 i #2 z obu).</div>
        <label style="${_MODAL_LBL};margin-top:.4rem">Napis</label><input id="ev-l" value="CEGŁA · HALLOWEEN" style="${_MODAL_INP}">
        <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-ghost" onclick="eventPreview()">👁 Podgląd kart</button><button class="btn btn-primary" onclick="eventCreate()">🎉 Wydaj wszystkie</button></div>
      </div>
      <div style="border-top:1px solid var(--border);margin-top:.9rem;padding-top:.7rem">
        <b style="font-size:.84rem">🏛 Kolekcja rekordów ligi</b>
        <div style="font-size:.74rem;color:var(--muted);margin:.2rem 0 .45rem">Karty rekordzistów ze statystykami z <b>meczu rekordowego</b>. Nowe rekordy (🔥 Record Breakers) Worker wydaje sam, zaraz po pobiciu.</div>
        <div style="display:grid;grid-template-columns:1.2fr 1.3fr .7fr;gap:.4rem;align-items:end"><div><label style="${_MODAL_LBL}">Zakres</label><select id="rc-s" onchange="recList()" style="${_MODAL_INP}"><option value="all">Cała historia ligi</option><option value="season">Bieżący sezon</option></select></div><div><label style="${_MODAL_LBL}">Do</label><input id="rc-u" type="datetime-local" value="${until}" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">Szansa %</label><input id="rc-c" type="number" value="20" min="1" max="90" style="${_MODAL_INP}"></div></div>
        <div id="rc-list" style="margin:.45rem 0"></div>
        <div style="display:flex;gap:.5rem;justify-content:flex-end"><button class="btn btn-ghost" onclick="recPreview()">👁 Podgląd kart</button><button class="btn btn-primary" onclick="recCreate()">🏛 Wydaj kolekcję</button></div>
      </div>
      <div style="border-top:1px solid var(--border);margin-top:.9rem;padding-top:.6rem;font-size:.8rem">Domyślna szansa na kartę limitowaną w paczce: <input id="lim-gc" type="number" min="0" max="100" value="${Math.round((st.limitedChance ?? .1) * 100)}" style="${_MODAL_INP};width:70px;display:inline-block"> % <button class="btn btn-ghost" style="font-size:.72rem" onclick="_api('/cards/limited','POST',{chance:(+document.getElementById('lim-gc').value||0)/100},{admin:true}).then(r=>showToast(r.ok?'💾 Zapisano':'❌','success'))">💾</button></div>
      ${L.length ? `<div style="margin-top:.7rem;font-size:.78rem"><b>Karty (aktywne i z ostatnich 30 dni):</b>${L.slice().reverse().map(c => { const act = Date.parse(c.until) > now; return `<div style="display:flex;justify-content:space-between;gap:.5rem;padding:.25rem 0;border-bottom:1px solid var(--border)"><span>${act ? '🟢' : '⚪'} ${_h(c.name)} — ${_h(c.label)} <span style="color:var(--muted)">${c.theme && c.theme !== 'gold' ? '· ' + c.theme : ''}${c.chance != null ? ' · ' + Math.round(c.chance * 100) + '%' : ''}</span></span><span>${act ? `<a href="#" onclick="_api('/cards/limited','POST',{announce:'${c.id}'},{admin:true}).then(r=>showToast(r.ok?(r.how==='bot'?'📣 Ogłoszono z obrazkiem karty':'📣 Ogłoszono (sam tekst — bot nie narysował karty)'):'❌ '+(r.error||'Błąd'),r.ok?'success':'error'));return false" style="color:var(--accent)">📣 ogłoś</a> · <a href="#" onclick="_api('/cards/limited','POST',{end:'${c.id}'},{admin:true}).then(()=>openLimitedAdmin());return false" style="color:#f59e0b">zakończ</a> · ` : ''}<a href="#" onclick="if(confirm('Usunąć kartę? Zdobyte egzemplarze zostaną w kolekcjach.')) _api('/cards/limited','POST',{remove:'${c.id}'},{admin:true}).then(()=>openLimitedAdmin());return false" style="color:var(--loss)">usuń</a></span></div>`; }).join('')}</div>` : ''}
    </div>
    <div><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">PODGLĄD</div><div id="lim-prev" style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:flex-start;color:var(--muted);font-size:.8rem">Kliknij „👁 Podgląd”.</div></div>
  </div>`;
  setTimeout(recList, 0);
}
function _limForm() {
  const v = id => document.getElementById(id)?.value?.trim() || '', per = document.getElementById('lim-per')?.checked;
  const name = v('lim-p'), team = per ? '' : (_withAllMatches(() => matches.flatMap(x => [x.team1, x.team2]).find(t => (t.players || []).some(p => _normNick(p.name) === _normNick(name)))?.name) || '');
  return { name, team, label: v('lim-l'), kind: v('lim-k') || 'special', theme: v('lim-t') || 'gold', variant: +v('lim-v') || 0, line: '', until: v('lim-u') ? new Date(v('lim-u')).toISOString() : null, chance: v('lim-c') ? Math.min(90, +v('lim-c')) / 100 : null, persona: per ? { sub: v('lim-sub'), img: v('lim-img') || null } : null };
}
async function limPreview() {
  const f = _limForm(); if(!f.name || !f.label) { showToast('Podaj osobę i napis', 'info'); return; }
  const box = document.getElementById('lim-prev'); box.innerHTML = '⏳';
  if(!f.persona && !_pcData(f.name, 'season') && !_pcData(f.name, 'career')) { box.innerHTML = 'Ta osoba nie ma statystyk — zaznacz „Osoba spoza ligi”.'; return; }
  const url = await _limRender(f); box.innerHTML = url ? `<div style="width:100%">${_holoHtml(url, f.name, 1)}</div>` : 'Nie udało się narysować (obrazek z innej strony blokuje podgląd — na Discordzie i tak się pojawi).'; _holoBind(box);
}
async function limitedCreate() {
  const f = _limForm(); if(!f.name || !f.label) { showToast('Podaj osobę i napis', 'info'); return; }
  if(!f.persona && !_pcData(f.name, 'season') && !_pcData(f.name, 'career')) { showToast('Ta osoba nie ma statystyk — zaznacz „Osoba spoza ligi”', 'info'); return; }
  const r = await _api('/cards/limited', 'POST', f, { admin: true });
  showToast(r.ok && r.created?.length ? '🌟 Karta wydana — ogłoszenie z kartą idzie na Discord' : r.ok ? 'Taka karta jest już aktywna' : '❌ ' + r.error, r.ok ? 'success' : 'error');
  if(r.ok) openLimitedAdmin();
}
function _weekBrickRank(w) {
  const sid = currentSeasonId || null, ids = new Set((schedule || []).filter(x => x.generated && !x.makeup && (x.seasonId || null) === sid && +x.week === +w).flatMap(x => (x.matchIds || (x.matchId ? [x.matchId] : [])).map(String)));
  const by = {}; _withAllMatches(() => matches.filter(m => !m.walkover && ids.has(String(m.id)))).forEach(m => [m.team1, m.team2].forEach(t => (t.players || []).forEach(p => {
    const k = _normNick(p.name); if(!k) return; const a = by[k] = by[k] || { name: p.name, team: t.name, fgm: 0, fga: 0, gp: 0 }; a.fgm += +p.fgm || 0; a.fga += +p.fga || 0; a.gp++; })));
  return Object.values(by).filter(a => a.gp && a.fga / a.gp >= 8).sort((a, b) => a.fgm / a.fga - b.fgm / b.fga || (b.fga - b.fgm) - (a.fga - a.fgm)).map(a => ({ ...a, week: +w }));
}
function _leagueRecordList(scope) {
  const sid = currentSeasonId || null, all = _withAllMatches(() => matches.filter(m => !m.walkover && (scope !== 'season' || (m.seasonId || null) === sid))).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return _REC_CATS.map(([k, unit, pl]) => { let best = null;
    all.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => (t.players || []).forEach(p => { const v = +p[k] || 0; if(v > 0 && (!best || v > best.val)) best = { cat: k, unit, pl, val: v, name: p.name, team: t.name, opp: o.name, matchId: m.id, date: m.date }; })));
    return best; }).filter(Boolean);
}
function _recForm() { const v = id => document.getElementById(id)?.value?.trim() || ''; return { scope: v('rc-s') || 'all', until: v('rc-u') ? new Date(v('rc-u')).toISOString() : null, chance: Math.min(90, +v('rc-c') || 20) / 100, picked: new Set([...document.querySelectorAll('#rc-list input:checked')].map(x => x.value)) }; }
function recList() {
  const f = _recForm(), L = _leagueRecordList(f.scope), box = document.getElementById('rc-list'); if(!box) return;
  box.innerHTML = L.map(r => `<label style="display:flex;gap:.4rem;align-items:center;font-size:.78rem;font-weight:600;text-transform:none;letter-spacing:0;color:var(--text);padding:.2rem 0"><input type="checkbox" value="${r.cat}" checked style="width:auto;margin:0;accent-color:var(--accent)"> <b>${r.val} ${r.unit}</b> — ${_h(r.name)} <span style="color:var(--muted)">(${_h(r.team)} vs ${_h(r.opp)}, ${_ssFmt(r.date)})</span></label>`).join('') || '<span style="color:var(--muted);font-size:.78rem">Brak meczów.</span>';
}
async function recPreview() {
  const f = _recForm(), L = _leagueRecordList(f.scope).filter(r => f.picked.has(r.cat)), box = document.getElementById('lim-prev'); if(!L.length) { box.innerHTML = 'Zaznacz rekordy.'; return; }
  box.innerHTML = '⏳'; const urls = []; for(const [i, r] of L.entries()) urls.push(await _limRender({ name: r.name, label: `REKORD LIGI · ${r.val} ${r.unit}`, theme: 'record', variant: i, scope: 'match:' + r.matchId }));
  box.innerHTML = urls.map((u, i) => u ? `<div style="flex:1 1 140px;max-width:48%"><div style="font-size:.7rem;margin-bottom:.15rem">${_h(L[i].name)} · ${L[i].val} ${L[i].unit}</div>${_holoHtml(u, L[i].name, 1)}</div>` : '').join(''); _holoBind(box);
}
async function recCreate() {
  const f = _recForm(), L = _leagueRecordList(f.scope).filter(r => f.picked.has(r.cat)); if(!L.length) { showToast('Zaznacz rekordy', 'info'); return; }
  if(!confirm(`Wydać ${L.length} kart(y) „Rekord ligi” (${L.map(r => r.name + ' ' + r.val + ' ' + r.unit).join(', ')})?`)) return;
  const setKey = 'rec:holders:' + Date.now().toString(36);
  const r = await _api('/cards/limited', 'POST', { cards: L.map((x, i) => ({ name: x.name, team: x.team, label: `REKORD LIGI · ${x.val} ${x.unit}`, kind: 'record', theme: 'record', variant: i, until: f.until, chance: f.chance, matchId: x.matchId, set: setKey, setName: '🏛 Rekordziści ligi' })) }, { admin: true });
  showToast(r.ok ? `🏛 Wydano ${r.created?.length || 0} kart rekordów` : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) openLimitedAdmin();
}
function _eventWeeks() { const sid = currentSeasonId || null; return [...new Set((schedule || []).filter(x => x.generated && (x.seasonId || null) === sid && x.week && (x.matchIds || []).length).map(x => +x.week))].sort((a, b) => a - b); }
// karty z zaznaczonych kolejek: najpierw 1. miejsca każdej kolejki, potem 2. miejsca itd.
function _eventBricks(count, weeks) {
  const ranks = weeks.map(w => _weekBrickRank(w)), out = [], seen = new Set();
  for(let r = 0; out.length < count && ranks.some(l => l.length > r); r++) for(const l of ranks) { if(out.length >= count) break; const b = l[r]; if(b && !seen.has(_normNick(b.name))) { seen.add(_normNick(b.name)); out.push({ ...b, place: r + 1 }); } }
  return out;
}
function _eventForm() { const v = id => document.getElementById(id)?.value?.trim() || ''; return { weeks: [...document.querySelectorAll('#ev-weeks input:checked')].map(x => +x.value), theme: v('ev-t') || 'halloween', n: Math.max(1, Math.min(12, +v('ev-n') || 4)), until: v('ev-u') ? new Date(v('ev-u')).toISOString() : null, chance: Math.min(90, +v('ev-c') || 30) / 100, label: v('ev-l') || 'CEGŁA' }; }
async function eventPreview() {
  const f = _eventForm(), box = document.getElementById('lim-prev');
  if(!f.weeks.length) { box.innerHTML = 'Zaznacz co najmniej jedną kolejkę.'; return; }
  const list = _eventBricks(f.n, f.weeks);
  if(!list.length) { box.innerHTML = 'Brak cegieł w zaznaczonych kolejkach (min. średnio 8 rzutów na mecz).'; return; }
  box.innerHTML = '⏳';
  const urls = []; for(const [i, b] of list.entries()) urls.push(await _limRender({ name: b.name, label: f.label, theme: f.theme, variant: i, scope: `week:${currentSeasonId || ''}:${b.week}` }));
  box.innerHTML = urls.map((u, i) => u ? `<div style="flex:1 1 140px;max-width:48%"><div style="font-size:.7rem;margin-bottom:.15rem">${_h(list[i].name)} · Week ${list[i].week} · #${list[i].place} (${list[i].fgm}/${list[i].fga})</div>${_holoHtml(u, list[i].name, 1)}</div>` : '').join(''); _holoBind(box);
}
async function eventCreate() {
  const f = _eventForm(); if(!f.weeks.length) { showToast('Zaznacz co najmniej jedną kolejkę', 'info'); return; }
  const list = _eventBricks(f.n, f.weeks); if(!list.length) { showToast('Brak cegieł w zaznaczonych kolejkach', 'info'); return; }
  if(list.length < f.n) showToast(`W zaznaczonych kolejkach jest tylko ${list.length} cegieł`, 'info');
  if(!confirm(`Wydać ${list.length} kart(y) „${f.label}” (${list.map(b => b.name).join(', ')})? Każda dostanie ogłoszenie na Discordzie.`)) return;
  const setKey = 'ev:' + Date.now().toString(36), setName = ({ halloween: '🎃 ', xmas: '🎄 ', fire: '🔥 ' }[f.theme] || '🌟 ') + f.label;
  const r = await _api('/cards/limited', 'POST', { cards: list.map((b, i) => ({ name: b.name, team: b.team, label: f.label, kind: 'event', theme: f.theme, variant: i, until: f.until, chance: f.chance, week: b.week, seasonId: currentSeasonId || null, set: setKey, setName })) }, { admin: true });
  showToast(r.ok ? `🎉 Wydano ${r.created?.length || 0} kart` : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) openLimitedAdmin();
}
// 🎁 paczki od admina
// 🧩 historia wyzwań (admin): kto ukończył, co oddał, jaką nagrodę dostał
async function openChallengeLog() {
  const m = _fxModal('chlog-modal', 820); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('chlog-modal', '🧩 Wyzwania — historia') + '<div style="color:var(--muted)">⏳</div>';
  const r = await _api('/cards/challenge-log', 'POST', {}, { admin: true });
  if(!r.ok) { m.querySelector('.modal').innerHTML = _fxHead('chlog-modal', '🧩 Wyzwania — historia') + `<div style="color:var(--loss)">❌ ${_h(r.error || '')}</div>`; return; }
  const rw = x => x?.kind === 'premium' ? `💎 ${x.n} premium` : `🎁 ${x?.n || 0} ${_plPL(x?.n || 0, 'paczka', 'paczki', 'paczek')}`;
  const chName = id => (r.challenges.find(c => c.id === id) || {}).pl || id;
  m.querySelector('.modal').innerHTML = _fxHead('chlog-modal', '🧩 Wyzwania — historia') + `<div data-notr style="font-size:.8rem">
    <div style="font-weight:800;margin-bottom:.3rem">Wyzwania tygodnia (od ${_ssFmt(r.week)})</div>
    ${r.challenges.map(c => `<div style="padding:.2rem 0">${c.icon} ${_h(c.pl)} → ${rw(c.reward)}</div>`).join('') || '<div style="color:var(--muted)">—</div>'}
    <div style="font-weight:800;margin:.8rem 0 .3rem">Ukończyli w tym tygodniu (${r.done.length})</div>
    ${r.done.map(d => `<div style="display:flex;justify-content:space-between;gap:.5rem;padding:.25rem 0;border-bottom:1px solid var(--border)"><span><b>${_h(d.name)}</b> — ${d.ids.map(i => _h(chName(i))).join(', ')}</span><span style="color:var(--muted);white-space:nowrap">teraz: 🎁 ${d.bonus} · 💎 ${d.premium}</span></div>`).join('') || '<div style="color:var(--muted)">Nikt jeszcze.</div>'}
    <div style="font-weight:800;margin:.8rem 0 .3rem">Dziennik (najnowsze)</div>
    ${r.log.map(e => `<div style="padding:.3rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;gap:.5rem"><span><b>${_h(e.name)}</b> · ${_h(e.label)}</span><span style="color:var(--muted);white-space:nowrap">${new Date(e.at).toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div style="color:var(--muted);font-size:.74rem">Oddał: ${(e.cards || []).map(_h).join(', ')} · nagroda: ${rw(e.reward)} · po przyznaniu: 🎁 ${e.after?.bonus ?? '?'} · 💎 ${e.after?.premium ?? '?'}</div></div>`).join('') || '<div style="color:var(--muted)">Dziennik zbiera wpisy od tej aktualizacji.</div>'}
    <div style="font-size:.72rem;color:var(--muted);margin-top:.6rem">Jeśli ktoś zgłasza brak nagrody: sprawdź, czy jest na liście i ile ma teraz paczek („teraz: 🎁 …”). Paczki z wyzwania dodają się do licznika dodatkowych paczek — otwiera się je przyciskiem „Otwórz paczkę (+N)”. Brakujące możesz dać przez <a href="#" onclick="_fxClose('chlog-modal');openGrantPacks();return false" style="color:var(--accent)">🎁 Daj paczki</a>, a co ktoś dostał i otworzył sprawdzisz w <a href="#" onclick="_fxClose('chlog-modal');openPackAdmin();return false" style="color:var(--accent)">📦 Historii paczek</a>.</div></div>`;
}
function _packHistHtml(packIn, packLog) {
  const en = currentLang === 'en', dt = a => new Date(a).toLocaleString(en ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }), k = x => (_PK[x] || ['📦', x, x]);
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.8rem;font-size:.8rem" data-notr>
    <div><b>📥 ${_g('Otrzymane', 'Received')}</b>${(packIn || []).map(x => `<div style="display:flex;justify-content:space-between;gap:.4rem;padding:.25rem 0;border-bottom:1px solid var(--border)"><span>${k(x.kind)[0]} ×${x.n} <span style="color:var(--muted)">· ${_h(x.src || '')}</span></span><span style="color:var(--muted);white-space:nowrap">${dt(x.at)}</span></div>`).join('') || `<div style="color:var(--muted);margin-top:.3rem">—</div>`}</div>
    <div><b>📤 ${_g('Otwarte', 'Opened')}</b>${(packLog || []).map(x => `<div style="padding:.25rem 0;border-bottom:1px solid var(--border)"><div style="display:flex;justify-content:space-between;gap:.4rem"><span>${k(x.kind)[0]} ${en ? k(x.kind)[2] : k(x.kind)[1]}</span><span style="color:var(--muted);white-space:nowrap">${dt(x.at)}</span></div><div style="color:var(--muted);font-size:.74rem">${(x.cards || []).map(c => `${c.t === 'limited' ? '🌟' : c.t === 'galaxy' ? '🌌' : c.t === 'diamond' ? '💎' : ''}${_h(c.n)}`).join(', ')}</div></div>`).join('') || `<div style="color:var(--muted);margin-top:.3rem">—</div>`}</div></div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.6rem">${_g('Historia zbierana od tej aktualizacji, ostatnie 60 wpisów.', 'History collected since this update, last 60 entries.')}</div>`;
}
function openMyPackHistory() { const m = _fxModal('mypacks-modal', 720); m.classList.add('open'); m.querySelector('.modal').innerHTML = _fxHead('mypacks-modal', '📜 ' + _g('Historia paczek', 'Pack history')) + _packHistHtml(_cards?.packIn, _cards?.packLog); }
function openPackAdmin() {
  const m = _fxModal('packadm-modal', 820); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('packadm-modal', '📦 Historia paczek') + `<div style="display:flex;gap:.4rem;margin-bottom:.7rem"><input id="pk-q" placeholder="Nick albo Discord ID" style="${_MODAL_INP};margin:0" onkeydown="if(event.key==='Enter')packAdminSearch()"><button class="btn btn-primary" onclick="packAdminSearch()">🔎 Szukaj</button></div><div id="pk-res"></div>`;
}
async function packAdminSearch() {
  const q = document.getElementById('pk-q').value.trim(), box = document.getElementById('pk-res'); if(!q) return; box.innerHTML = '⏳';
  const r = await _api('/kort/packs?q=' + encodeURIComponent(q), 'GET', null, { admin: true }); if(!r.ok) { box.innerHTML = '❌ ' + _h(r.error || ''); return; }
  box.innerHTML = r.users.map(u => `<details class="card" style="padding:.6rem .8rem;margin-bottom:.5rem" ${r.users.length === 1 ? 'open' : ''}><summary style="cursor:pointer"><b>${_h(u.name)}</b> <span style="color:var(--muted);font-size:.78rem">· otwarte ${u.opened} · teraz do otwarcia: 🎁 ${u.bonus} · 💎 ${u.premium}</span></summary><div style="margin-top:.5rem">${_packHistHtml(u.packIn, u.packLog)}</div></details>`).join('') || '<div style="color:var(--muted)">Nie znaleziono.</div>';
}
function openGrantPacks() {
  const m = _fxModal('grant-modal', 520); m.classList.add('open');
  const known = new Map(); (playersList || []).forEach(p => p.id && known.set(p.id, p.name || p.gamertag)); (teamRegistrations || []).forEach(r => r.captain?.id && !known.has(r.captain.id) && known.set(r.captain.id, r.captain.name)); (freeAgents || []).forEach(f => f.discordId && !known.has(f.discordId) && known.set(f.discordId, f.name));
  m.querySelector('.modal').innerHTML = _fxHead('grant-modal', '🎁 Daj paczki') + `<div data-notr>
    <label style="${_MODAL_LBL}">Komu</label><input id="gr-to" list="gr-list" placeholder="Nick albo Discord ID" style="${_MODAL_INP}"><datalist id="gr-list">${[...known].map(([id, n]) => `<option value="${_h(n)} · ${id}">`).join('')}</datalist>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem"><div><label style="${_MODAL_LBL}">🎁 Zwykłe paczki</label><input id="gr-p" type="number" min="0" max="10" value="1" style="${_MODAL_INP}"></div><div><label style="${_MODAL_LBL}">💎 Paczki premium</label><input id="gr-x" type="number" min="0" max="10" value="0" style="${_MODAL_INP}"></div></div>
    <label style="${_MODAL_LBL};margin-top:.5rem">Za co (pojawi się w ogłoszeniu)</label><input id="gr-r" placeholder="np. boost serwera Nitro 💜" maxlength="140" style="${_MODAL_INP}">
    <div style="display:flex;justify-content:flex-end;margin-top:.7rem"><button class="btn btn-primary" onclick="grantPacks()">🎁 Daj i ogłoś</button></div></div>`;
}
async function grantPacks() {
  const raw = document.getElementById('gr-to').value.trim(), id = (raw.match(/(\d{15,21})\s*$/) || [])[1];
  if(!id) { showToast('Wybierz osobę z listy albo wpisz Discord ID', 'info'); return; }
  const packs = Math.max(0, +document.getElementById('gr-p').value || 0), premium = Math.max(0, +document.getElementById('gr-x').value || 0);
  if(!packs && !premium) { showToast('Podaj liczbę paczek', 'info'); return; }
  const r = await _api('/cards/grant', 'POST', { to: id, name: raw.replace(/\s*·\s*\d+$/, ''), packs, premium, reason: document.getElementById('gr-r').value.trim() }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  _fxClose('grant-modal'); showToast(`🎁 ${r.user}: przyznano — DM i ogłoszenie poszły`, 'success');
}
// ═══ 👤 PROFIL KIBICA (z osiągnięciami) ═══
async function openFanProfile(id) {
  const m = _fxModal('fanprof-modal', 640); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('fanprof-modal', '👤 ' + _g('Profil kibica', 'Fan profile')) + '<div style="color:var(--muted)">⏳</div>';
  const r = await _api('/fan/' + encodeURIComponent(id), 'GET', null, {});
  if(!r.ok) { m.querySelector('.modal').innerHTML = _fxHead('fanprof-modal', '👤 ' + _g('Profil kibica', 'Fan profile')) + `<div style="color:var(--loss)">❌ ${_h(_tr(r.error || ''))}</div>`; return; }
  const p = r.profile, en = currentLang === 'en', TIER = ['', '🥉', '🥈', '🥇'];
  const SRC = { typer: '🎯 Typer', fantasy: '🏆 Fantasy', typy: '🔮 ' + _g('Typy sezonu', 'Preseason picks'), drabinka: '🏆 ' + _g('Drabinka', 'Bracket'), '2kordle': '🧩 2Kordle', karty: '🃏 ' + _g('Kolekcja', 'Collection'), karnet: '🎟️ ' + _g('Karnet', 'Pass'), seria: '🔥 ' + _g('Seria', 'Streak') };
  const team = typeof p.team === 'string' ? p.team : p.team?.name || null;
  m.querySelector('.modal').innerHTML = _fxHead('fanprof-modal', '👤 ' + _g('Profil kibica', 'Fan profile')) + `<div data-notr>
    <div style="display:flex;gap:.9rem;align-items:center;margin-bottom:.8rem">${_avatarHtml(p.avatar, 64)}
      <div style="flex:1"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.6rem;line-height:1">${_h(p.name)}</div>
        <div style="font-size:.82rem;margin-top:.2rem">🏅 <b>${_h(p.level?.name || '')}</b> · ${p.xp} XP${p.rank ? ` · #${p.rank} ${_g('w Lidze kibiców', 'in the Fan league')}` : ''}</div>
        <div style="font-size:.78rem;color:var(--muted);margin-top:.15rem">🔥 ${p.streak} ${_g('dni z rzędu', 'days in a row')} (${_g('rekord', 'best')} ${p.bestStreak}) · 🃏 ${p.cards} ${_g('kart', 'cards')}${team ? ` · 📣 ${_h(team)}` : ''}</div></div>
      <button class="btn btn-ghost" style="font-size:.72rem" onclick="navigator.clipboard?.writeText(location.origin+location.pathname+'#kibic/${p.id}').then(()=>showToast('🔗 ${_g('Skopiowano link do profilu', 'Profile link copied')}','success'))">🔗 Link</button></div>
    ${(p.showcase || []).length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">🏆 ${_g('GABLOTA', 'SHOWCASE')}</div><div id="fp-showcase" style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.8rem"></div>` : ''}
    ${(p.seasonBadges || []).length ? `<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.7rem">${p.seasonBadges.map(b => `<span style="background:linear-gradient(135deg,#3a2a00,#1a1405);border:1px solid #f5c518;border-radius:999px;padding:.25rem .7rem;font-size:.78rem">${['', '🥇', '🥈', '🥉'][b.place]} ${_g('Kibic sezonu', 'Fan of the season')} · ${_h(b.season)}</span>`).join('')}</div>` : ''}
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">🏅 ${_g('OSIĄGNIĘCIA', 'ACHIEVEMENTS')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:.4rem;margin-bottom:.8rem">${p.achievements.map(a => `<div style="background:var(--surface2);border-radius:10px;padding:.45rem .6rem;opacity:${a.lvl ? 1 : .55};border:1px solid ${a.lvl === 3 ? '#f5c518' : 'transparent'}">
      <div style="font-size:.8rem"><b>${a.icon} ${_h(en ? a.en : a.pl)}</b></div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:.15rem">${TIER[a.lvl] || '⬜'} ${a.have}${a.next ? ' / ' + a.next : ' ✓'}</div></div>`).join('')}</div>
    ${(p.limited || []).length ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f5c518;margin-bottom:.3rem">🌟 ${_g('KARTY LIMITOWANE', 'LIMITED CARDS')}</div><div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.7rem">${p.limited.map(c => `<span style="border:1px solid #f5c518;border-radius:8px;padding:.2rem .5rem;font-size:.74rem">${_h(c.name)} · <span style="color:#f5c518">${_h(c.label)}</span></span>`).join('')}</div>` : ''}
    ${Object.keys(p.src || {}).length ? `<div style="font-size:.72rem;color:var(--muted)">XP ${_g('w tym sezonie', 'this season')}: ${Object.entries(p.src).map(([k, v]) => `${SRC[k] || k} ${v}`).join(' · ')}</div>` : ''}
  </div>`;
  showcaseRender(document.getElementById('fp-showcase'), p.showcase);
}
async function closeFanSeason() {
  if(!confirm('Zamknąć sezon kibiców? Najlepsza trójka Ligi kibiców dostanie stałą odznakę „Kibic sezonu” na profilu i DM z gratulacjami. Punkty w nowym sezonie liczą się od daty startu nowego sezonu ligi.')) return;
  const r = await _api('/fan-season/close', 'POST', {}, { admin: true });
  showToast(r.ok ? `🏆 ${r.season.top.map(t => t.place + '. ' + t.name).join(' · ')}` : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
async function rivalryRename(a, b) {
  const name = prompt('Nazwa rywalizacji (np. „Derby Śląska”); puste = bez nazwy:', _rivName(a, b) || ''); if(name === null) return;
  const r = await _api('/rivalry-name', 'POST', { key: _rivKey(a, b), name: name.trim() }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  window._rivalryNames = r.rivalryNames; openRivalry(a, b); try { renderClassics(); } catch(e) {}
}
async function openDiscordInvite() {
  const m = _fxModal('dinv-modal', 520); m.classList.add('open');
  const cur = window._discordInviteUrl;
  m.querySelector('.modal').innerHTML = _fxHead('dinv-modal', '🔗 Zaproszenie na Discord') + `<div data-notr style="font-size:.82rem">
    <div style="margin-bottom:.7rem">Ten link jest używany w całej stronie (przycisk Discord, formularz wolnego agenta, menu Więcej). Obecny: ${cur ? `<a href="${_h(cur)}" target="_blank" rel="noopener" style="color:var(--accent)">${_h(cur)}</a>` : '<b style="color:var(--loss)">nieustawiony — działa stary link, który wygasł</b>'}</div>
    <button class="btn btn-primary" onclick="dinvSave({create:true, channel:document.getElementById('dinv-ch').value.trim()})">🤖 Utwórz stałe zaproszenie botem</button>
    <div style="display:flex;gap:.4rem;align-items:center;margin:.45rem 0 .9rem"><input id="dinv-ch" placeholder="ID kanału (opcjonalnie — domyślnie kanał zasad/powitalny)" style="${_MODAL_INP};font-size:.76rem"></div>
    <label style="${_MODAL_LBL}">…albo wklej własny link</label>
    <div style="display:flex;gap:.4rem"><input id="dinv-link" placeholder="https://discord.gg/…" style="${_MODAL_INP}"><button class="btn btn-ghost" onclick="dinvSave({link:document.getElementById('dinv-link').value})">💾</button></div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.5rem">Zaproszenie utworzone przez bota nie wygasa i nie ma limitu użyć. Zwykłe linki z Discorda wygasają domyślnie po 7 dniach — wtedy kod może trafić do innego serwera.</div></div>`;
}
async function dinvSave(body) {
  const r = await _api('/discord-invite', 'POST', body, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  window._discordInviteUrl = r.link; document.querySelectorAll('a[href*="discord.gg/"]').forEach(a => { a.href = r.link; });
  showToast('🔗 Zapisano: ' + r.link, 'success'); openDiscordInvite();
}
function openAdminHub(focus) {
  const m = _fxModal('admin-hub', 900); m.classList.add('open');
  const G = _adminGroups();
  m.querySelector('.modal').innerHTML = _fxHead('admin-hub', '🛠 ' + _g('Panel admina', 'Admin panel')) + `<div data-notr style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.7rem">${G.map(g => `
    <section id="ah-${g.id}" style="background:var(--surface2);border:1px solid ${g.id === focus ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:.7rem .75rem">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:1.2px;color:${g.id === focus ? 'var(--accent)' : 'var(--muted)'};margin-bottom:.4rem;text-transform:uppercase">${g.icon} ${_h(g.title)}</div>
      ${g.items.map(([ic, label, act, n]) => `<button onclick="_fxClose('admin-hub');${_h(act)}" style="display:flex;align-items:center;gap:.6rem;width:100%;min-height:40px;padding:0 .6rem;border:none;border-radius:8px;background:transparent;color:var(--text);font-family:inherit;font-size:.86rem;text-align:left;cursor:pointer" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='transparent'">
        <span style="width:20px;text-align:center">${ic}</span><span style="flex:1">${_h(label)}</span>${n ? `<span style="min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#f59e0b;color:#111;font-size:.7rem;font-weight:800;display:inline-flex;align-items:center;justify-content:center">${n}</span>` : ''}</button>`).join('')}
    </section>`).join('')}</div>`;
  if(focus) setTimeout(() => document.getElementById('ah-' + focus)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50);
}
function _sideSync(v) { const key = v === 'join' ? 'join:' + (typeof _regTab !== 'undefined' ? _regTab : 'teams') : v; document.querySelectorAll('#side-nav .sn-item[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === key)); }
function _gmMeId() { return window._gmDemo?.meId || discordUser?.id || null; }
function _gmdPool() { // zawodnicy ligi + średnie punkty fantasy w tym sezonie
  const sid = currentSeasonId || null, by = new Map(), key = n => _normNick(n);
  _gmPool().forEach(p => by.set(key(p.name), { name: p.name, team: p.team, fp: 0, gp: 0 }));
  _withAllMatches(() => matches.filter(m => !m.walkover && (m.seasonId || null) === sid)).forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => (t.players || []).forEach(p => {
    const k = key(p.name); if(!k) return; const x = by.get(k) || { name: p.name, team: t.name, fp: 0, gp: 0 }; x.fp += _gmFp(p, (+t.score || 0) > (+o.score || 0)); x.gp++; by.set(k, x); })));
  return [...by.values()].map(x => ({ ...x, avg: x.gp ? Math.round(x.fp / x.gp * 10) / 10 : 0 })).sort((a, b) => b.avg - a.avg);
}
async function gmDemoStart(mode) {
  if(!mode) { gmDemoChoose(); return; }
  const gw = document.getElementById('gmd-wrap'); if(gw) delete gw.dataset.choosing;
  const real = await _api('/gm?season=' + encodeURIComponent(currentSeasonId || '_'), 'GET', null, {}).catch(() => ({}));
  const cfg = { roster: 6, starters: 5, tableMode: 'h2h', budget: 200, cap: 200, ...(real?.config || {}) }, pool = _gmdPool(), N = 1 + _GMD_BOTS.length;
  const R = Math.max(3, Math.min(cfg.roster || 6, Math.floor(pool.length / N)));
  if(pool.length < N * 3) { showToast(_g('Za mało zawodników w sezonie, żeby uruchomić demo', 'Not enough players this season to run the demo'), 'info'); return; }
  const meId = discordUser?.id || 'demo_me', meName = discordUser?.name || _g('Ty', 'You');
  const gms = [{ id: meId, name: meName, me: true }, ..._GMD_BOTS.map((n, i) => ({ id: 'bot' + i, name: n }))].sort(() => Math.random() - .5);
  const order = []; for(let r = 0; r < R; r++) (r % 2 ? [...gms].reverse() : gms).forEach(g => order.push(g.id));
  _gmd = { mode, cfg: { ...cfg, roster: R }, pool, gms, meId, order, pick: 0, rosters: Object.fromEntries(gms.map(g => [g.id, []])), q: '', left: 30 };
  if(mode === 'auction') { const B = +cfg.budget || 200, top = pool.slice(0, N * R), tot = top.reduce((s, p) => s + p.avg, 0) || 1; _gmd.budget = Object.fromEntries(gms.map(g => [g.id, B])); _gmd.nomIdx = -1; _gmd.order = Array(N * R).fill(null);
    _gmd.val = Object.fromEntries(gms.map(g => [g.id, Object.fromEntries(pool.map(p => [_normNick(p.name), Math.max(1, Math.round(B * N * (p.avg / tot) * (0.8 + Math.random() * 0.4)))]))])); // wycena botów
    _gmdDraw(); document.getElementById('gmd-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); _gdaAdvance(); return; }
  _gmdDraw(); document.getElementById('gmd-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); _gmdNext();
}
function _gmdTaken() { return new Set(Object.values(_gmd.rosters).flat().map(p => _normNick(p.name))); }
function _gmdAvail() { const t = _gmdTaken(); return _gmd.pool.filter(p => !t.has(_normNick(p.name))); }
function _gmdNext() {
  clearInterval(_gmd.tick); if(_gmd.pick >= _gmd.order.length) { _gmdDraw(); return; }
  const who = _gmd.order[_gmd.pick];
  if(who === _gmd.meId) { _gmd.left = 30; _gmd.tick = setInterval(() => { if(!_gmd) return; _gmd.left--; const t = document.getElementById('gmd-timer'); if(t) t.textContent = _gmd.left + 's'; if(_gmd.left <= 0) gmDemoPick(_gmdAvail()[0].name, true); }, 1000); _gmdDraw(); return; }
  _gmdDraw(); setTimeout(() => { if(!_gmd) return; const a = _gmdAvail(), top = a.slice(0, 4), p = top[Math.floor(Math.pow(Math.random(), 2) * top.length)]; _gmd.rosters[who].push(p); _gmd.last = { who, p }; _gmd.pick++; _gmdNext(); }, 900 + Math.random() * 700);
}
function gmDemoPick(name, auto) {
  if(!_gmd || _gmd.order[_gmd.pick] !== _gmd.meId) return; const p = _gmdAvail().find(x => x.name === name); if(!p) return;
  clearInterval(_gmd.tick); _gmd.rosters[_gmd.meId].push(p); _gmd.last = { who: _gmd.meId, p }; _gmd.pick++; if(auto) showToast(_g(`⏱ Czas minął — wybrano za Ciebie: ${p.name}`, `⏱ Time's up — picked for you: ${p.name}`), 'info'); _gmdNext();
}
function gmDemoExit() { if(_gmd) clearInterval(_gmd.tick); _gmd = null; const gw = document.getElementById('gmd-wrap'); if(gw) delete gw.dataset.choosing; window._gmDemo = null; _gmState = null; showView('fplus'); setTimeout(renderFantasyPlus, 60); }
function _gmdDraw() {
  const el = document.getElementById('gmd-wrap'); if(!el || !_gmd) return; const en = currentLang === 'en', d = _gmd, N = d.gms.length, done = d.mode === 'auction' ? !_gdaN(d) : d.pick >= d.order.length;
  const who = d.gms.find(g => g.id === d.order[d.pick]), myTurn = !done && who?.id === d.meId, round = Math.floor(d.pick / N) + 1;
  const sum = id => Math.round(d.rosters[id].reduce((s, p) => s + p.avg, 0) * 10) / 10;
  const avail = _gmdAvail().filter(p => !d.q || _normNick(p.name).includes(_normNick(d.q)) || _normNick(p.team || '').includes(_normNick(d.q))).slice(0, 40);
  const A = d.mode === 'auction' ? _gdaHtml() : null;
  const head = A ? A.head : done ? `<div style="font-size:1.05rem;font-weight:800">✅ ${_g('Draft zakończony!', 'Draft complete!')}</div>`
    : `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><div><b>${_g('Runda', 'Round')} ${round}/${d.cfg.roster}</b> · ${_g('wybór', 'pick')} ${d.pick + 1}/${d.order.length}</div>
      <div style="font-weight:800;${myTurn ? 'color:var(--win)' : 'color:var(--muted)'}">${myTurn ? `👉 ${_g('Twój ruch!', 'Your pick!')} ⏱ <span id="gmd-timer">${d.left}s</span>` : `⏳ ${_g('Wybiera', 'On the clock')}: ${_h(who.name)}…`}</div></div>
      ${d.last ? `<div style="font-size:.76rem;color:var(--muted);margin-top:.25rem">${_g('Ostatni wybór', 'Last pick')}: <b>${_h(d.gms.find(g => g.id === d.last.who).name)}</b> → ${_h(d.last.p.name)} (${d.last.p.avg} FP)</div>` : ''}`;
  const myRank = [...d.gms].sort((a, b) => sum(b.id) - sum(a.id)).findIndex(g => g.id === d.meId) + 1;
  el.innerHTML = `<div class="card" style="padding:.9rem 1rem;border:2px solid var(--accent)" data-notr>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.6rem"><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--accent)">🎮 DEMO · ${d.mode === 'auction' ? _g('LICYTACJA LIGI GM', 'GM LEAGUE AUCTION') : _g('DRAFT LIGI GM (SNAKE)', 'GM LEAGUE DRAFT (SNAKE)')}</div><button class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem" onclick="gmDemoExit()">✕ ${_g('Zakończ demo', 'Exit demo')}</button></div>
    <div style="background:var(--surface2);border-radius:10px;padding:.6rem .75rem;margin-bottom:.7rem">${head}</div>
    ${done ? `<div style="font-size:.85rem;margin-bottom:.7rem">${_g(`Twoja drużyna ma <b>${sum(d.meId)} FP</b> średnio na mecz — <b>${myRank}. miejsce</b> z ${N} po drafcie. Teraz zobacz, jak wyglądałby sezon na prawdziwych meczach ligi.`, `Your team averages <b>${sum(d.meId)} FP</b> per game — <b>#${myRank}</b> of ${N} after the draft. Now see how the season would look on real league games.`)}</div>
      <button class="btn btn-primary" onclick="gmDemoSeason()">🏀 ${_g('Zobacz sezon demo', 'See the demo season')}</button>` : ''}
    <div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:.8rem;margin-top:.8rem" class="gmd-grid">
      <div>${A ? A.list : done ? '' : `<input placeholder="${_g('Szukaj gracza lub drużyny…', 'Search player or team…')}" value="${_h(d.q)}" oninput="_gmd.q=this.value;_gmdDraw();this.focus();this.setSelectionRange(this.value.length,this.value.length)" style="${_MODAL_INP};margin:0 0 .4rem">
        ${_gmdListHtml(avail, p => `<button class="btn ${myTurn ? 'btn-primary' : 'btn-ghost'}" ${myTurn ? '' : 'disabled'} style="font-size:.66rem;padding:.2rem .35rem" onclick="gmDemoPick('${_h(p.name).replace(/'/g, "\\'")}')">${_g('Wybierz', 'Pick')}</button>`)}`}</div>
      <div style="${done ? 'grid-column:1 / -1;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.5rem' : ''}">${d.gms.map(g => `<div style="background:var(--surface2);border:1px solid ${g.id === d.meId ? 'var(--accent)' : 'var(--border)'};border-radius:10px;padding:.45rem .6rem;margin-bottom:.45rem">
        <div style="display:flex;justify-content:space-between;font-size:.8rem"><b>${g.id === d.meId ? '⭐ ' : ''}${_h(g.name)}</b><span style="color:var(--muted)">${sum(g.id)} FP${d.mode === 'auction' ? ` · 💰 ${d.budget[g.id]}` : ''}</span></div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:.2rem">${d.rosters[g.id].map(p => _h(p.name) + (d.mode === 'auction' ? ` (${p.price})` : '')).join(' · ') || '—'}${d.mode === 'auction' ? ` <span style="opacity:.7">· ${d.rosters[g.id].length}/${d.cfg.roster}</span>` : ''}</div></div>`).join('')}</div></div></div>`;
}
// 💰 DEMO: licytacja (aukcja) — wystawianie po kolei, zegar 10 s, boty wyceniają po średniej FP
function gmDemoChoose() {
  const el = document.getElementById('gmd-wrap'); if(!el) return; el.dataset.choosing = '1';
  el.innerHTML = `<div class="card" style="padding:1rem 1.1rem;border:2px solid var(--accent)" data-notr><div style="font-weight:800;margin-bottom:.6rem">🎮 ${_g('Wybierz rodzaj draftu', 'Choose the draft type')}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem">
      <button class="card" style="padding:.8rem;text-align:left;cursor:pointer;border:1px solid var(--border);font-family:inherit;color:var(--text)" onclick="gmDemoStart('snake')"><div style="font-size:1rem;font-weight:800">🐍 Snake</div><div style="font-size:.78rem;color:var(--muted);margin-top:.25rem">${_g('Wybieracie po kolei, kolejność odwraca się co rundę. Szybko i prosto.', 'Pick in turns, the order reverses every round. Quick and simple.')}</div></button>
      <button class="card" style="padding:.8rem;text-align:left;cursor:pointer;border:1px solid var(--border);font-family:inherit;color:var(--text)" onclick="gmDemoStart('auction')"><div style="font-size:1rem;font-weight:800">💰 ${_g('Licytacja', 'Auction')}</div><div style="font-size:.78rem;color:var(--muted);margin-top:.25rem">${_g('Każdy ma budżet i licytuje zawodników. Gwiazda czy głęboki skład — Twój wybór.', 'Everyone has a budget and bids on players. A star or a deep roster — your call.')}</div></button></div>
    <div style="text-align:right;margin-top:.6rem"><button class="btn btn-ghost" style="font-size:.72rem" onclick="gmDemoExit()">✕ ${_g('Anuluj', 'Cancel')}</button></div></div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function _gdaN(d) { return Object.values(d.rosters).filter(L => L.length < d.cfg.roster).length; }
function _gdaMax(d, id) { const left = d.cfg.roster - d.rosters[id].length; return left <= 0 ? 0 : d.budget[id] - (left - 1); }
// zostaw po 1 monecie na każde wolne miejsce
function _gdaNextNom(d) { const ids = d.gms.map(g => g.id); for(let k = 0; k < ids.length; k++) { d.nomIdx = (d.nomIdx + 1) % ids.length; if(d.rosters[ids[d.nomIdx]].length < d.cfg.roster) return ids[d.nomIdx]; } return null; }
function _gdaStartLot(p, by) { const d = _gmd; d.lot = { p, price: 1, leader: by, left: 10 }; _gdaLoop(); _gmdDraw(); }
function _gdaLoop() {
  const d = _gmd; clearInterval(d.tick);
  d.tick = setInterval(() => { if(!_gmd || !d.lot) return clearInterval(d.tick); d.lot.left--;
    // boty: przebijają, gdy cena < wyceny (najwyżej jeden na sekundę)
    if(d.lot.left > 0 && Math.random() < .55) { const cands = d.gms.filter(g => g.id !== d.meId && g.id !== d.lot.leader && _gdaMax(d, g.id) > d.lot.price && (d.val[g.id][_normNick(d.lot.p.name)] || 0) > d.lot.price);
      if(cands.length) { const g = cands[Math.floor(Math.random() * cands.length)], step = Math.random() < .25 ? 3 : 1; d.lot.price = Math.min(_gdaMax(d, g.id), d.lot.price + step); d.lot.leader = g.id; d.lot.left = Math.max(d.lot.left, 6); } }
    if(d.lot.left <= 0) { const { p, price, leader } = d.lot; d.rosters[leader].push({ ...p, price }); d.budget[leader] -= price; d.last = { who: leader, p: { ...p, price } }; d.lot = null; clearInterval(d.tick); _gdaAdvance(); return; }
    _gmdDraw(); }, d.fast ? 60 : 1000);
}
function _gdaAdvance() {
  const d = _gmd; d.pick = Object.values(d.rosters).reduce((s, L) => s + L.length, 0);
  if(!_gdaN(d)) { _gmdDraw(); return; }
  const who = _gdaNextNom(d); d.nominator = who;
  if(who === d.meId) { _gmdDraw(); return; }
  _gmdDraw(); setTimeout(() => { if(!_gmd || d.lot) return; const a = _gmdAvail(), top = a.slice(0, 8), p = top[Math.floor(Math.random() * top.length)]; _gdaStartLot(p, who); }, d.fast ? 40 : 1100);
}
function gmDemoNominate(name) { const d = _gmd; if(!d || d.lot || d.nominator !== d.meId) return; const p = _gmdAvail().find(x => x.name === name); if(p) _gdaStartLot(p, d.meId); }
function gmDemoBid(step) { const d = _gmd; if(!d?.lot || d.lot.leader === d.meId) return; const max = _gdaMax(d, d.meId), price = d.lot.price + step; if(price > max) { showToast(_g(`Maks. oferta: ${max} (zostaw po 1 monecie na każde wolne miejsce)`, `Max bid: ${max} (keep 1 coin per open roster spot)`), 'info'); return; } d.lot.price = price; d.lot.leader = d.meId; d.lot.left = Math.max(d.lot.left, 6); _gmdDraw(); }
function _gdaHtml() {
  const d = _gmd, done = !_gdaN(d), me = d.meId, name = id => d.gms.find(g => g.id === id)?.name || '';
  let head;
  if(done) head = `<div style="font-size:1.05rem;font-weight:800">✅ ${_g('Licytacja zakończona!', 'Auction complete!')}</div>`;
  else if(d.lot) { const lead = d.lot.leader === me, max = _gdaMax(d, me), full = d.rosters[me].length >= d.cfg.roster;
    _gmdLotImg(d.lot.p.name); const im = d.img?.[d.lot.p.name];
    head = `<div style="display:flex;justify-content:space-between;align-items:center;gap:.6rem;flex-wrap:wrap">${im ? `<img src="${im}" onclick="openPlayerCardImg('${_h(d.lot.p.name).replace(/'/g, "\\'")}')" title="${_g('Otwórz kartę', 'Open card')}" style="width:96px;border-radius:8px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45)">` : `<div style="width:96px;height:120px;border-radius:8px;background:var(--surface);display:flex;align-items:center;justify-content:center;color:var(--muted)">🃏</div>`}<div style="flex:1;min-width:160px"><div style="font-size:.72rem;color:var(--muted)">${_g('Na licytacji', 'On the block')}</div><div style="font-size:1.15rem;font-weight:900">${_h(d.lot.p.name)} <span style="font-size:.78rem;font-weight:400;color:var(--muted)">${_h(d.lot.p.team || '')} · ${d.lot.p.avg} FP/${_g('mecz', 'game')}</span></div></div>
      <div style="text-align:right"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.9rem;line-height:1;color:${lead ? 'var(--win)' : 'var(--text)'}">💰 ${d.lot.price}</div><div style="font-size:.74rem">${lead ? '✅ ' + _g('Prowadzisz!', 'You lead!') : _g('Prowadzi', 'Leading') + ': ' + _h(name(d.lot.leader))} · ⏱ <b>${d.lot.left}s</b></div></div></div>
      <div style="display:flex;gap:.4rem;margin-top:.55rem;flex-wrap:wrap;align-items:center">${full ? `<span style="font-size:.76rem;color:var(--muted)">${_g('Twój skład jest pełny', 'Your roster is full')}</span>` : [1, 5, 10].map(s => `<button class="btn ${lead ? 'btn-ghost' : 'btn-primary'}" ${lead || d.lot.price + s > max ? 'disabled' : ''} onclick="gmDemoBid(${s})">+${s} → ${d.lot.price + s}</button>`).join('')}
        <span style="font-size:.72rem;color:var(--muted);margin-left:auto">${_g('Twój budżet', 'Your budget')}: <b>${d.budget[me]}</b> · ${_g('maks. oferta', 'max bid')}: <b>${max}</b></span></div>`; }
  else head = d.nominator === me ? `<div style="font-weight:800;color:var(--win)">👉 ${_g('Twoja kolej — wystaw zawodnika na licytację', 'Your turn — put a player up for auction')}</div>` : `<div style="color:var(--muted)">⏳ ${_g('Wystawia', 'Nominating')}: ${_h(name(d.nominator))}…</div>`;
  const avail = _gmdAvail().filter(p => !d.q || _normNick(p.name).includes(_normNick(d.q)) || _normNick(p.team || '').includes(_normNick(d.q))).slice(0, 40), canNom = !d.lot && d.nominator === me && !done;
  return { head, list: done ? '' : `<input placeholder="${_g('Szukaj gracza lub drużyny…', 'Search player or team…')}" value="${_h(d.q)}" oninput="_gmd.q=this.value;_gmdDraw();this.focus();this.setSelectionRange(this.value.length,this.value.length)" style="${_MODAL_INP};margin:0 0 .4rem">
      ${_gmdListHtml(avail, p => `<button class="btn ${canNom ? 'btn-primary' : 'btn-ghost'}" ${canNom ? '' : 'disabled'} style="font-size:.66rem;padding:.2rem .35rem" onclick="gmDemoNominate('${_h(p.name).replace(/'/g, "\\'")}')">${_g('Wystaw', 'Nominate')}</button>`)}` };
}
function _gmdInfo(p) { if(!p._d) { const d = _pcData(p.name, 'season') || {}; p._d = { ppg: d.ppg || 0, rpg: d.rpg || 0, apg: d.apg || 0, spg: d.spg || 0, bpg: d.bpg || 0, fg: d.fg || 0, attrs: d.sk?.attrs || {}, rating: d.rating || 0 }; } return p._d; }
function gmdSort(k) { const d = _gmd; if(!d) return; d.dir = d.sort === k ? -d.dir : -1; d.sort = k; _gmdDraw(); }
function _gmdListHtml(list, btn) {
  const d = _gmd, en = currentLang === 'en', view = d.view || 'fp';
  const cols = view === 'stats' ? [['ppg', 'PTS'], ['rpg', en ? 'REB' : 'ZB'], ['apg', en ? 'AST' : 'AS'], ['spg', en ? 'STL' : 'PRZ'], ['bpg', en ? 'BLK' : 'BL'], ['fg', 'FG%']]
    : view === 'attr' ? _GMD_ATTR.map(([k, pl, e]) => ['a_' + k, en ? e : pl]) : [['avg', 'FP/' + (en ? 'g' : 'm')], ['gp', en ? 'GP' : 'M'], ['rating', 'OVR']];
  const val = (p, k) => { const i = _gmdInfo(p); return k === 'avg' ? p.avg : k === 'gp' ? p.gp : k === 'rating' ? i.rating : k.startsWith('a_') ? (i.attrs[k.slice(2)]?.p ?? -1) : (i[k] || 0); };
  const L = d.sort ? list.slice().sort((a, b) => (val(b, d.sort) - val(a, d.sort)) * (d.dir === 1 ? -1 : 1)) : list;
  const gcol = `1fr repeat(${cols.length}, ${view === 'attr' ? '34px' : '46px'}) 78px`, arrow = k => d.sort === k ? (d.dir === 1 ? ' ▲' : ' ▼') : '';
  const cell = (p, k) => { const i = _gmdInfo(p); if(k.startsWith('a_')) { const a = i.attrs[k.slice(2)]; return `<b style="color:${_gmdGradeCol(a?.g || 'F')}">${a?.g || '—'}</b>`; }
    if(k === 'fg') return `${Math.round((i.fg || 0) * 100)}%`; if(k === 'avg') return `<b>${p.avg}</b>`; if(k === 'gp') return p.gp; if(k === 'rating') return i.rating || '—'; return (Math.round((i[k] || 0) * 10) / 10); };
  const tab = (v, l) => `<button class="btn ${view === v ? 'btn-primary' : 'btn-ghost'}" style="font-size:.66rem;padding:.15rem .45rem" onclick="_gmd.view='${v}';_gmd.sort=null;_gmdDraw()">${l}</button>`;
  return `<div style="display:flex;gap:.3rem;margin-bottom:.35rem;flex-wrap:wrap">${tab('fp', '⭐ FP')}${tab('stats', '📊 ' + _g('Statystyki', 'Stats'))}${tab('attr', '🔤 ' + _g('Atrybuty', 'Attributes'))}</div>
    <div style="font-size:.64rem;color:var(--muted);display:grid;grid-template-columns:${gcol};gap:.25rem;padding:0 .2rem .2rem;text-align:center"><span style="text-align:left">${_g('Zawodnik', 'Player')} · <span style="opacity:.7">${_g('klik = karta', 'tap = card')}</span></span>${cols.map(([k, l]) => `<span style="cursor:pointer;user-select:none" onclick="gmdSort('${k}')">${l}${arrow(k)}</span>`).join('')}<span></span></div>
    <div style="max-height:420px;overflow:auto">${L.map(p => `<div style="display:grid;grid-template-columns:${gcol};gap:.25rem;align-items:center;padding:.3rem .2rem;border-bottom:1px solid var(--border);font-size:.78rem;text-align:center">
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;cursor:pointer" onclick="openPlayerCardImg('${_h(p.name).replace(/'/g, "\\'")}')"><b style="text-decoration:underline dotted">${_h(p.name)}</b> <span style="color:var(--muted);font-size:.68rem">${_h(p.team || '')}</span></span>
      ${cols.map(([k]) => `<span>${cell(p, k)}</span>`).join('')}${btn(p)}</div>`).join('')}</div>`;
}
async function _gmdLotImg(name) { // karta licytowanego zawodnika (raz na nazwisko)
  const d = _gmd; if(!d) return; d.img = d.img || {}; if(d.img[name] !== undefined) return; d.img[name] = null;
  try { const pd = _pcData(name, 'season'); d.img[name] = pd ? await _pcImage(pd, currentLang === 'en' ? 'en' : 'pl', true) : ''; } catch(e) { d.img[name] = ''; } if(_gmd?.lot?.p.name === name) _gmdDraw();
}
function gmDemoSeason() { // sezon demo: prawdziwe ekrany Ligi GM na danych z draftu demo
  const d = _gmd; if(!d) return; clearInterval(d.tick);
  if(d.mode === 'auction') d.cfg.draftMode = 'auction';
  const sid = currentSeasonId || null, ws = schedule.filter(s => s.generated && (s.seasonId || null) === sid && s.weekStart).map(s => s.weekStart).sort()[0];
  const cfg = { ...d.cfg, status: 'season', maxGm: d.gms.length, dynasty: false }, total = d.order.length, cap = cfg.cap ?? cfg.budget ?? 200;
  const sal = (() => { try { return _gmRookieScale(total, cap, cfg.roster); } catch(e) { return i => Math.max(1, Math.round(cap / cfg.roster * (1.6 - i / total))); } })(), pickNo = {};
  d.order.forEach((id, i) => { (pickNo[id] = pickNo[id] || []).push(i); });
  const teamNames = { bot0: 'Kobe’s Mamba', bot1: 'Shaq Attack', bot2: 'Splash Bros', bot3: 'King’s Court', bot4: 'Dirk Diggler' };
  const st = { ok: true, demo: true, seasonId: sid, config: cfg, gms: d.gms.map(g => ({ id: g.id, name: g.name, teamName: g.me ? _g('Twoja drużyna', 'Your team') : (teamNames[g.id] || g.name), avatar: g.me ? discordUser?.avatar || null : null, at: new Date().toISOString() })),
    keepers: {}, champion: null, weekSummaries: null, rosters: Object.fromEntries(Object.entries(d.rosters).map(([id, L]) => [id, L.map((p, k) => ({ name: p.name, team: p.team, price: d.mode === 'auction' ? p.price : sal(pickNo[id][k]) }))])), draftedAt: ws ? ws + 'T00:00:00Z' : null, rosterHist: null, market: { fa: [], bids: [], trades: [], log: [] } };
  window._gmDemo = { meId: d.meId, state: st }; _gmState = st; showView('gm');
}
function _fplusPoll(r) {
  const box = document.getElementById('fplus-poll'); if(!box) return;
  const opts = [['yes', '✅ ' + _g('Tak, gram!', 'Yes, I\u2019m in!')], ['maybe', '🤔 ' + _g('Może — zależy od wpisowego', 'Maybe — depends on the fee')], ['no', '❌ ' + _g('Nie, dziękuję', 'No, thanks')]];
  const tot = r?.total || 0, mine = r?.mine || null;
  box.innerHTML = `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.5rem">🗳️ ${_g('ANKIETA — CZY ZAGRASZ W FANTASY+ Z WPISOWYM?', 'POLL — WOULD YOU PLAY FANTASY+ WITH AN ENTRY FEE?')}</div>
    ${opts.map(([k, l]) => { const n = r?.counts?.[k] || 0, pct = tot ? Math.round(n / tot * 100) : 0; return `<button onclick="fplusVote('${k}')" style="display:block;width:100%;text-align:left;position:relative;overflow:hidden;margin-bottom:.4rem;padding:.55rem .75rem;border-radius:10px;border:2px solid ${mine === k ? 'var(--accent)' : 'var(--border)'};background:var(--surface2);color:var(--text);font-family:inherit;font-size:.86rem;cursor:pointer">
      <span style="position:absolute;inset:0;width:${mine ? pct : 0}%;background:rgba(245,197,24,.14)"></span><span style="position:relative;display:flex;justify-content:space-between;gap:.5rem"><span>${l}${mine === k ? ' · ' + _g('Twój głos', 'your vote') : ''}</span>${mine ? `<b>${pct}% (${n})</b>` : ''}</span></button>`; }).join('')}
    <div style="font-size:.72rem;color:var(--muted)">${mine ? _g(`Głosów: ${tot}. Możesz zmienić zdanie, klikając inną odpowiedź.`, `${tot} votes. You can change your answer.`) : discordUser ? _g('Wyniki zobaczysz po oddaniu głosu.', 'You\u2019ll see results after voting.') : _g('Zaloguj się przez Discord, żeby zagłosować.', 'Log in with Discord to vote.')}</div>
    ${_isLoggedInSync() ? `<div style="margin-top:.6rem;border-top:1px solid var(--border);padding-top:.5rem"><button class="btn btn-ghost" style="font-size:.74rem" onclick="fplusVoters()">👁 Kto głosował (admin)</button><div id="fplus-voters"></div></div>` : ''}`;
}
async function fplusVoters() {
  const box = document.getElementById('fplus-voters'); if(!box) return; box.innerHTML = '<div style="font-size:.78rem;color:var(--muted);margin-top:.4rem">⏳</div>';
  const r = await _api('/poll?id=fantasyplus&detail=1', 'GET', null, { admin: true }); if(!r.ok || !r.voters) { box.innerHTML = '<div style="color:var(--loss);font-size:.78rem">❌ ' + _h(r.error || 'Brak dostępu') + '</div>'; return; }
  const L = { yes: '✅ Tak', maybe: '🤔 Może', no: '❌ Nie' };
  box.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.6rem;margin-top:.5rem">${['yes', 'maybe', 'no'].map(k => { const list = r.voters.filter(v => v.vote === k);
    return `<div style="background:var(--surface2);border-radius:10px;padding:.5rem .65rem"><div style="font-weight:800;font-size:.82rem;margin-bottom:.3rem">${L[k]} <span style="color:var(--muted);font-weight:600">(${list.length})</span></div>${list.map(v => `<div style="display:flex;justify-content:space-between;gap:.4rem;font-size:.76rem;padding:.15rem 0;border-bottom:1px solid var(--border)"><span>${_h(v.name || v.id)}</span><span style="color:var(--muted)">${v.at ? new Date(v.at).toLocaleString('pl-PL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span></div>`).join('') || '<div style="font-size:.74rem;color:var(--muted)">—</div>'}</div>`; }).join('')}</div>`;
}
async function fplusVote(v) {
  if(!discordUser?.session) { showToast(_g('Zaloguj się przez Discord, żeby zagłosować', 'Log in with Discord to vote'), 'info'); return; }
  const r = await _api('/poll', 'POST', { id: 'fantasyplus', vote: v }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _fplusPoll(r); showToast(_g('🗳️ Dzięki za głos!', '🗳️ Thanks for voting!'), 'success');
}
// drafty: zakładka bieżącego draftu (drabinka / wyniki)
function _evCurrent() { const L = (events || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))); return L.find(e => !['finished', 'closed', 'archived'].includes(e.status)) || L[0] || null; }
function openCurrentDraft(tab) { const ev = _evCurrent(); if(!ev) { showView('events'); showToast(_g('Brak draftów', 'No drafts yet'), 'info'); return; } showView('events'); setTimeout(() => openEventDetail(ev.id, tab), 150); }
// link do zapisu drużyny (/register): zalogowany → od razu formularz; niezalogowany → logowanie Discord i powrót do formularza
function _openRegisterLink() {
  goJoin('teams');
  if(registrationsClosed) { showToast(_g('🔒 Zapisy drużyn są teraz zamknięte', '🔒 Team sign-ups are closed right now'), 'info'); return; }
  if(discordUser) { setTimeout(openTeamRegModal, 250); return; }
  const m = _fxModal('reglogin-modal', 440); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('reglogin-modal', '🧢 ' + _g('Zgłoś drużynę', 'Register your team')) + `<div data-notr style="text-align:center">
    <div style="font-size:.88rem;line-height:1.55;margin-bottom:.9rem">${_g('Drużynę zgłasza <b>kapitan</b>. Zaloguj się przez Discord — po zalogowaniu wrócisz prosto do formularza.', 'Teams are registered by the <b>captain</b>. Log in with Discord — you\u2019ll come straight back to the form.')}</div>
    <button class="btn btn-primary" style="width:100%" onclick="try{history.replaceState(null,'','/register')}catch(e){};loginWithDiscord()">💬 ${_g('Zaloguj przez Discord', 'Log in with Discord')}</button>
    <div style="font-size:.74rem;color:var(--muted);margin-top:.7rem">${_g('Przed zapisem przeczytaj', 'Before registering, read the')} <a href="#" onclick="_fxClose('reglogin-modal');showView('rules');return false" style="color:var(--accent)">${_g('regulamin', 'rules')}</a>.</div></div>`;
}
// link do formularza wolnego agenta (/fa): zalogowany → od razu formularz; niezalogowany → logowanie Discord i powrót do formularza
function _openFaLink() {
  goJoin('fa');
  if(discordUser) { setTimeout(openFreeAgentModal, 250); return; }
  const m = _fxModal('falogin-modal', 440); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('falogin-modal', '🆓 ' + _g('Zgłoś się jako wolny agent', 'Sign up as a free agent')) + `<div data-notr style="text-align:center">
    <div style="font-size:.88rem;line-height:1.55;margin-bottom:.9rem">${_g('Szukasz drużyny? Zaloguj się przez Discord — po zalogowaniu wrócisz prosto do formularza, a kapitanowie zobaczą Cię na liście wolnych agentów.', 'Looking for a team? Log in with Discord — you’ll come straight back to the form and captains will see you on the free agents list.')}</div>
    <button class="btn btn-primary" style="width:100%" onclick="try{history.replaceState(null,'','/fa')}catch(e){};loginWithDiscord()">💬 ${_g('Zaloguj przez Discord', 'Log in with Discord')}</button></div>`;
}
function goJoin(tab) { setRegTab(tab); showView('join'); }
// 🏛 GALERIA SŁAW — mistrzowie, laureaci Gali sezonu i najczęściej nagradzani w każdym sezonie
function hallOfFameHtml() {
  const en = currentLang === 'en', S = (seasons || []).slice().sort((a, b) => String(b.startDate || b.createdAt || b.id).localeCompare(String(a.startDate || a.createdAt || a.id)));
  const blocks = S.map(se => {
    const po = (playoffs || []).find(p => (p.seasonId || null) === se.id && p.champion), fr = po ? ((po.rounds || []).filter(r => !/3/.test(r.name || '')).pop()?.pairs?.[0]) : null, runner = fr && po ? (fr.team1 === po.champion ? fr.team2 : fr.team1) : null;
    const gala = (awardsList || []).filter(a => a.type === 'season' && (a.seasonId || null) === se.id && a.status === 'closed' && a.winners);
    const wk = {}; (awardsList || []).filter(a => (a.type || 'week') === 'week' && (a.seasonId || null) === se.id && a.status === 'closed' && a.winners).forEach(a => a.categories.forEach(c => { const w = a.winners[c.key]; if(!w || !/mvp|def/i.test(c.key)) return; const k = w.label + '|' + (w.team || ''); const x = wk[k] = wk[k] || { name: w.label, team: w.team, mvp: 0, def: 0 }; x[/mvp/i.test(c.key) ? 'mvp' : 'def']++; }));
    const top = Object.values(wk).sort((a, b) => (b.mvp * 2 + b.def) - (a.mvp * 2 + a.def)).slice(0, 3);
    if(!po && !gala.length && !top.length) return '';
    return `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:.7rem .85rem;margin-bottom:.6rem">
      <div style="font-weight:800;margin-bottom:.45rem">${_h(se.name || se.id)}</div>
      ${po ? `<div style="display:flex;align-items:center;gap:.55rem;margin-bottom:.45rem">${teamLogo(po.champion, 40, '.9rem')}<div><div style="font-size:.68rem;color:#f5c518;font-weight:800;letter-spacing:1px">🏆 ${_g('MISTRZ', 'CHAMPION')}</div><b style="font-size:1rem">${_h(po.champion)}</b>${runner ? `<span style="font-size:.74rem;color:var(--muted)"> · ${_g('finał z', 'beat')} ${_h(runner)}</span>` : ''}</div></div>` : ''}
      ${gala.map(a => `<div style="font-size:.7rem;color:var(--muted);font-weight:800;letter-spacing:1px;margin:.35rem 0 .2rem">🎖 ${_h(a.title || _g('GALA SEZONU', 'SEASON GALA'))}</div><div style="display:flex;flex-wrap:wrap;gap:.35rem">${a.categories.filter(c => a.winners[c.key]).map(c => `<span style="font-size:.76rem;background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.4);border-radius:999px;padding:.15rem .55rem">${c.emoji || '🏅'} ${_h(c.title)}: <b>${_h(a.winners[c.key].label)}</b></span>`).join('')}</div>`).join('')}
      ${top.length ? `<div style="font-size:.7rem;color:var(--muted);font-weight:800;letter-spacing:1px;margin:.45rem 0 .2rem">⭐ ${_g('NAJCZĘŚCIEJ NAGRADZANI', 'MOST WEEKLY AWARDS')}</div><div style="font-size:.8rem">${top.map(x => `<span style="margin-right:.8rem"><b>${_h(x.name)}</b> <span style="color:var(--muted)">${x.mvp ? `${x.mvp}× MVP` : ''}${x.mvp && x.def ? ' · ' : ''}${x.def ? `${x.def}× ${_g('Obrońca', 'Defender')}` : ''}</span></span>`).join('')}</div>` : ''}</div>`; }).filter(Boolean);
  return `<div class="card" id="hof-sec" style="padding:.85rem 1rem;margin-bottom:1rem;border:1px solid rgba(245,197,24,.5)" data-notr><div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:#f5c518;margin-bottom:.55rem">🏛 ${_g('GALERIA SŁAW', 'HALL OF FAME')}</div>
    ${blocks.join('') || `<div style="font-size:.82rem;color:var(--muted)">${_g('Pierwsi mistrzowie i laureaci Gali sezonu pojawią się tu po zakończeniu sezonu.', 'The first champions and Season Gala winners will appear here after the season ends.')}</div>`}</div>`;
}
async function renderAwardsView() {
  const host = document.getElementById('awards-view-wrap'); if(!host) return;
  const sid = currentSeasonId || null, open = (awardsList || []).filter(a => a.status === 'open' && (!sid || !a.seasonId || a.seasonId === sid));
  const closed = (awardsList || []).filter(a => a.status === 'closed' && a.winners && (!sid || !a.seasonId || a.seasonId === sid)).sort((a, b) => (+b.week || 0) - (+a.week || 0) || String(b.closedAt).localeCompare(String(a.closedAt)));
  const dashHtml = document.getElementById('awards-dashboard-wrap')?.innerHTML || '';
  const a = closed.find(x => x.id === _awArchId) || closed[0];
  host.innerHTML = `${hallOfFameHtml()}${open.length && dashHtml ? `<div style="margin-bottom:1.2rem">${dashHtml}</div>` : `<div class="card" style="padding:.8rem 1rem;margin-bottom:1rem;color:var(--muted);font-size:.86rem">${_g('Teraz nie ma otwartego głosowania. Nowe rusza po każdej kolejce.', 'No voting open right now — a new one starts after every round.')}</div>`}
    ${closed.length ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem"><div class="section-title" style="font-size:1.25rem;margin:0">🏅 ${_g('Zwycięzcy', 'Winners')}</div>
      <select onchange="_awArchId=this.value;renderAwardsView()" style="font-size:.82rem;padding:.3rem .5rem;border-radius:8px;border:1px solid var(--border);background:var(--surface2);color:var(--text)">${closed.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${_h(_awTitle(x.title))}</option>`).join('')}</select></div>
      <div data-notr style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.7rem">${a.categories.filter(c => a.winners[c.key]).map(c => { const w = a.winners[c.key], card = /^(mvp|def|potm)/.test(c.key);
        const link = c.key === 'game' && /^m/.test(String(w.id)) ? `<button class="btn btn-ghost" style="font-size:.72rem;margin-top:.4rem" onclick="openMatch('${String(w.id).slice(1)}')">🏀 ${_g('Zobacz mecz', 'View game')}</button>`
          : c.key === 'clip' ? (() => { const cl = (clipsList || []).find(x => 'c' + x.id === String(w.id)); return cl?.url ? `<a class="btn btn-ghost" style="font-size:.72rem;margin-top:.4rem;text-decoration:none" href="${_h(cl.url)}" target="_blank" rel="noopener">🎬 ${_g('Zobacz akcję', 'Watch')}</a>` : ''; })() : '';
        return `<div class="card" style="padding:.7rem .8rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--accent)">${c.emoji || '🏅'} ${_h(_awCat(c)).toUpperCase()}</div>
          <div style="font-weight:800;font-size:1rem;margin-top:.2rem">${_h(w.label)}</div><div style="font-size:.74rem;color:var(--muted)">${w.team ? _h(w.team) + ' · ' : ''}${w.votes} ${_g(_plPL(w.votes, 'głos', 'głosy', 'głosów'), w.votes === 1 ? 'vote' : 'votes')}</div>
          ${card ? `<div id="awc-${c.key}" style="margin-top:.5rem;aspect-ratio:4/5;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--muted)">⏳</div>` : ''}${link}</div>`; }).join('')}</div>` : ''}`;
  if(!a) return;
  const scope = a.week ? `week:${a.seasonId || sid || ''}:${a.week}` : null;
  for(const k of Object.keys(a.winners || {}).filter(k => /^(mvp|def|potm)/.test(k))) { const w = a.winners[k], box = document.getElementById('awc-' + k); if(!w || !box) continue;
    try { const url = /^(mvp|potm)/.test(k) ? await _pcLimitedImage(w.label, /^potm/.test(k) ? String((a.categories || []).find(c => c.key === k)?.title || '').toUpperCase() : `MVP · ${String(a.title || '').toUpperCase()}`, scope, 'gold', 0, null) : await (async () => { const d = (scope && _pcData(w.label, scope)) || _pcData(w.label, 'season'); return d ? _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true) : null; })();
      box.innerHTML = url ? (/^(mvp|potm)/.test(k) ? _holoHtml(url, w.label, 1) : `<img src="${url}" alt="${_h(w.label)}" style="width:100%;border-radius:12px;display:block">`) : _h(w.label); if(k === 'mvp') _holoBind(box); } catch(e) { box.textContent = w.label; } }
}
// ➕ DOPISANIE DRUŻYNY W TRAKCIE SEZONU — gra z drużyną pauzującą w każdej kolejce; kolejki już rozpoczęte = mecze zaległe z terminem
function _addTeamPlan(team, groupId, deadline) {
  const sid = currentSeasonId || null, items = schedule.filter(s => s.generated && (s.seasonId || null) === sid && !s.makeup || (s.generated && (s.seasonId || null) === sid && s.makeup));
  const reg = items.filter(s => !s.makeup), gid = groupId ?? (reg[0]?.groupId ?? null);
  const inGroup = reg.filter(s => (s.groupId ?? null) === gid), teams = [...new Set(inGroup.flatMap(s => [s.team1, s.team2]))].filter(t => t !== team);
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const weeks = [...new Set(inGroup.map(s => +s.week))].sort((a, b) => a - b), out = [];
  for(const w of weeks) {
    const wk = inGroup.filter(s => +s.week === w), playing = new Set(wk.flatMap(s => [s.team1, s.team2]));
    if(playing.has(team) || items.some(s => +s.week === w && [s.team1, s.team2].includes(team))) continue; // już ma mecz w tej kolejce
    const bye = teams.filter(t => !playing.has(t)), ws = wk[0].weekStart, makeup = ws <= today;
    out.push({ week: w, weekStart: ws, bye, makeup, round: wk[0].round, bestOf: wk[0].bestOf, defaultTime: wk[0].defaultTime || '', groupId: gid, deadline: makeup ? deadline : null });
  }
  return out;
}
function openAddTeamToSchedule() {
  const sid = currentSeasonId || null, inSched = new Set(schedule.filter(s => s.generated && (s.seasonId || null) === sid).flatMap(s => [s.team1, s.team2]));
  const cand = (teamRegistrations || []).filter(r => r.status === 'approved' && (!r.seasonId || r.seasonId === sid)).map(r => r.teamName).filter(t => !inSched.has(t));
  const groups = [...new Set(schedule.filter(s => s.generated && (s.seasonId || null) === sid).map(s => s.groupId ?? null))];
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), cur = schedule.filter(s => s.generated && (s.seasonId || null) === sid && s.weekStart && s.weekStart <= today).map(s => s.weekStart).sort().pop();
  const dl = cur ? _ssAddDays(cur, 13) : _ssAddDays(today, 7); // koniec następnej kolejki
  const m = _fxModal('addteam-modal', 640); m.classList.add('open');
  m.querySelector('.modal').innerHTML = _fxHead('addteam-modal', '➕ Dopisz drużynę do terminarza') + `<div data-notr>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">Obecny terminarz zostaje bez zmian. Nowa drużyna gra w każdej kolejce z drużyną, która pauzuje. Kolejki już rozpoczęte dostają <b>zaległe mecze z terminem</b> — nie blokują podsumowań swoich kolejek i nie liczą się do Piątki tygodnia.</div>
    <label style="${_MODAL_LBL}">Drużyna</label><input id="at-team" list="at-list" value="${_h(cand[0] || '')}" style="${_MODAL_INP}"><datalist id="at-list">${cand.map(t => `<option value="${_h(t)}">`).join('')}</datalist>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
      ${groups.length > 1 ? `<div><label style="${_MODAL_LBL}">Grupa</label><select id="at-group" style="${_MODAL_INP}">${groups.map(g => `<option value="${_h(g ?? '')}">${_h(g ?? '—')}</option>`).join('')}</select></div>` : ''}
      <div><label style="${_MODAL_LBL}">Termin zaległych meczów</label><input id="at-dl" type="date" value="${dl}" style="${_MODAL_INP}"></div></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.6rem"><button class="btn btn-ghost" onclick="addTeamPreview()">👁 Podgląd</button></div>
    <div id="at-prev" style="margin-top:.5rem"></div></div>`;
  if(cand[0]) addTeamPreview();
}
function _atForm() { const g = document.getElementById('at-group'); return { team: document.getElementById('at-team').value.trim(), groupId: g ? (g.value === '' ? null : (isNaN(+g.value) ? g.value : +g.value)) : undefined, dl: document.getElementById('at-dl').value }; }
function addTeamPreview() {
  const f = _atForm(), box = document.getElementById('at-prev'); if(!f.team) { box.innerHTML = ''; return; }
  const plan = _addTeamPlan(f.team, f.groupId, f.dl);
  if(!plan.length) { box.innerHTML = '<div style="color:var(--muted);font-size:.8rem">Brak kolejek do uzupełnienia (drużyna już ma mecze albo nikt nie pauzuje).</div>'; return; }
  const bad = plan.filter(p => p.bye.length !== 1);
  box.innerHTML = `<div style="font-size:.8rem">${plan.map(p => `<div style="display:flex;justify-content:space-between;gap:.5rem;padding:.3rem 0;border-bottom:1px solid var(--border)"><span><b>Week ${p.week}</b> · ${p.bye.length === 1 ? `${_h(p.bye[0])} vs <b>${_h(f.team)}</b>` : `<span style="color:var(--loss)">${p.bye.length ? 'pauzuje kilka drużyn: ' + p.bye.map(_h).join(', ') : 'nikt nie pauzuje'} — pominę</span>`}</span><span style="color:${p.makeup ? '#f59e0b' : 'var(--muted)'}">${p.makeup ? '⏰ zaległy · do ' + _ssFmt(f.dl) : 'w swojej kolejce'}</span></div>`).join('')}</div>
    ${bad.length ? `<div style="font-size:.74rem;color:var(--loss);margin-top:.4rem">Kolejki z niejednoznaczną pauzą zostaną pominięte — dodasz je ręcznie.</div>` : ''}
    <div style="display:flex;justify-content:flex-end;margin-top:.6rem"><button class="btn btn-primary" onclick="addTeamApply()">➕ Dodaj ${(n => n + ' ' + _plPL(n, 'mecz', 'mecze', 'meczów'))(plan.filter(p => p.bye.length === 1).length)} do terminarza</button></div>`;
}
async function addTeamApply() {
  const f = _atForm(), plan = _addTeamPlan(f.team, f.groupId, f.dl).filter(p => p.bye.length === 1); if(!plan.length) return;
  if(!confirm(`Dodać ${plan.length} meczów ${f.team} do terminarza? Obecne mecze zostaną bez zmian.`)) return;
  let id = Math.max(Date.now(), ...schedule.map(s => +s.id || 0)) + 1;
  plan.forEach((p, i) => schedule.push({ id: id + i, generated: true, seasonId: currentSeasonId || null, week: p.week, round: p.round, weekStart: p.weekStart, groupId: p.groupId, bestOf: p.bestOf,
    team1: p.bye[0], team2: f.team, date: '', time: '', defaultTime: p.defaultTime, streamUrl: '', played: false, prediction: null, matchId: null, matchIds: [],
    ...(p.makeup ? { makeup: true, ruleUntil: f.dl } : {}) }));
  await saveData(); _fxClose('addteam-modal'); try { renderSchedule(); renderSeasonSchedule(); } catch(e) {}
  showToast(`➕ Dodano ${plan.length} meczów ${f.team}${plan.some(p => p.makeup) ? ' (w tym zaległe do ' + _ssFmt(f.dl) + ')' : ''}`, 'success');
}
function payRemindDetails(s, team, en) { s = s || {}; const fee = s.fee || '25€', m0 = s.payMethod || (s.skrillEmail ? 'skrill' : s.revolutUrl ? 'revolut' : ''), m = m0 === 'skrill' && s.skrillEmail ? 'skrill' : m0 === 'revolut' && s.revolutUrl ? 'revolut' : s.skrillEmail ? 'skrill' : s.revolutUrl ? 'revolut' : '';
  const tail = en ? `\n• Amount: **${fee}**\n• Payment description: **${team}**` : `\n• Kwota: **${fee}**\n• Opis przelewu: **${team}**`;
  if (m === 'skrill') return (en ? `💜 **Skrill** — choose "Send money" and enter:\n• Skrill email: **${s.skrillEmail}**` : `💜 **Skrill** — wybierz „Wyślij” (Send money) i wpisz:\n• E-mail Skrill: **${s.skrillEmail}**`) + (s.skrillId ? `\n• Customer ID: **${s.skrillId}**` : '') + tail;
  if (m === 'revolut') return (en ? `💳 **Revolut** — pay here: ${s.revolutUrl}` : `💳 **Revolut** — zapłać tutaj: ${s.revolutUrl}`) + tail;
  return en ? `💶 Amount: **${fee}** — payment details are on the league website.` : `💶 Kwota: **${fee}** — dane do płatności są na stronie ligi.`; }
function payRemindRender(tpl, v) { let L = String(tpl || '').replace(/\r/g, '').split('\n'); if (!v.deadline) L = L.filter(l => !l.includes('{deadline}'));
  return L.join('\n').replace(/\{team\}/g, v.team || '').replace(/\{captain\}/g, v.captain || '').replace(/\{fee\}/g, v.fee || '').replace(/\{deadline\}/g, v.deadline || '').replace(/\{payment\}/g, v.payment || '').replace(/\{link\}/g, v.link || '').replace(/\n{3,}/g, '\n\n').trim(); }
function payRemindDefault(en) { return en
  ? `👋 Hi {captain}!\n\nA quick reminder from EU Chemik League: the entry fee for **{team}** ({fee}) has not been paid yet.\n⏰ Please pay by **{deadline}** to keep your spot in the league.\n\n{payment}\n\n🧾 After paying, upload your payment proof here: {link}\n🛡️ These are the same details you see on the official website — always check them there before you pay.`
  : `👋 Cześć {captain}!\n\nPrzypomnienie z ligi: wpisowe drużyny **{team}** ({fee}) nie zostało jeszcze opłacone.\n⏰ Termin płatności: **{deadline}** — po tym terminie miejsce w lidze może przepaść.\n\n{payment}\n\n🧾 Po opłaceniu wgraj potwierdzenie przelewu tutaj: {link}\n🛡️ To te same dane, które widzisz na oficjalnej stronie — przed płatnością zawsze sprawdź je tam.`; }
function _prAgo(iso) { if(!iso) return ''; const d = Math.floor((Date.now() - Date.parse(iso)) / 864e5); return d <= 0 ? _g('dziś', 'today') : d === 1 ? _g('wczoraj', 'yesterday') : _g(`${d} dni temu`, `${d} days ago`); }
async function openPayRemind() {
  if(!_isLoggedInSync()) return; const en = EU_MODE, s = _signup();
  const r = await _api('/team-payment/remind', 'POST', { load: true }, { admin: true }).catch(() => ({}));
  const T = _prTeams(); _pr = { sel: new Set(T.filter(x => x.payment?.status !== 'sent').map(x => x.id)), deadline: r.deadline || s.payDeadline || '', tpl: r.template || payRemindDefault(en), saveDeadline: true, lastAt: r.lastAt || null, previewId: null, results: null, auto: !!r.auto, autoSent: r.autoSent || {} };
  _prDraw();
}
function _prVars(reg) { const s = _signup(), en = EU_MODE; return { team: reg?.teamName || 'Team', captain: reg?.captain?.name || 'Captain', fee: s.fee || '25€', deadline: payRemindDeadlineTxt(_pr.deadline, en), payment: payRemindDetails(s, reg?.teamName || 'Team', en), link: String((EU_MODE ? EU_SITE : MAIN_SITE) || location.origin).replace(/\/+$/, '') + '/pay' }; }
function _prMd(t) { return _h(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g, '<span style="color:#00a8fc">$1</span>').replace(/\n/g, '<br>'); }
function _prDraw() {
  const m = _fxModal('pr-modal', 860); m.classList.add('open'); const T = _prTeams(), en = EU_MODE, s = _signup(), pv = T.find(x => x.id === _pr.previewId) || T.find(x => _pr.sel.has(x.id)) || T[0];
  const sentN = T.filter(x => _pr.sel.has(x.id)).length, noPay = !s.skrillEmail && !s.revolutUrl;
  if(_pr.results) { const R = _pr.results;
    m.querySelector('.modal').innerHTML = _fxHead('pr-modal', '📣 ' + _g('Przypomnienie wysłane', 'Reminder sent')) + `<div data-notr>
      <div style="font-size:.95rem;margin-bottom:.6rem">✅ ${_g('Wysłano', 'Sent')}: <b>${R.filter(x => x.ok).length}</b> / ${R.length}</div>
      ${R.map(x => `<div style="display:flex;gap:.5rem;font-size:.82rem;padding:.25rem 0;border-top:1px solid var(--border)"><span>${x.ok ? '✅' : '⚠️'}</span><b style="min-width:140px">${_h(x.team)}</b><span style="color:var(--muted)">${_h(x.captain)}${x.ok ? '' : ' — ' + (x.why === 'dm' ? _g('kapitan ma zablokowane wiadomości prywatne od bota — napisz do niego ręcznie', 'captain blocks DMs from the bot — message them manually') : x.why === 'nocaptain' ? _g('brak konta Discord kapitana', 'no captain Discord account') : _g('już opłacone', 'already paid'))}</span></div>`).join('')}
      <div style="display:flex;justify-content:flex-end;margin-top:.8rem"><button class="btn btn-primary" onclick="_fxClose('pr-modal')">OK</button></div></div>`; return; }
  m.querySelector('.modal').innerHTML = _fxHead('pr-modal', '📣 ' + _g('Przypomnienie o wpisowym', 'Entry fee reminder')) + `<div data-notr>
    ${noPay ? `<div style="background:rgba(239,68,68,.12);border:1px solid #ef4444;border-radius:9px;padding:.5rem .7rem;font-size:.8rem;margin-bottom:.6rem">⚠️ ${_g('Brak danych do płatności w ustawieniach zapisów (Skrill albo Revolut) — wiadomość nie będzie ich zawierać.', 'No payment details in sign-up settings (Skrill or Revolut) — the message will not include them.')}</div>` : ''}
    <div style="display:grid;grid-template-columns:minmax(240px,1fr) minmax(300px,1.4fr);gap:1rem">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem"><b style="font-size:.84rem">🧢 ${_g('Nieopłacone drużyny', 'Unpaid teams')} (${T.length})</b>
          <span style="display:flex;gap:.25rem"><button class="btn btn-ghost" style="font-size:.62rem;padding:.1rem .4rem" onclick="_pr.sel=new Set(_prTeams().map(x=>x.id));_prDraw()">${_g('wszystkie', 'all')}</button><button class="btn btn-ghost" style="font-size:.62rem;padding:.1rem .4rem" onclick="_pr.sel=new Set();_prDraw()">${_g('żadna', 'none')}</button></span></div>
        <div style="max-height:46vh;overflow:auto;border:1px solid var(--border);border-radius:9px">${T.map(x => `<label style="display:flex;gap:.5rem;align-items:flex-start;padding:.4rem .55rem;border-bottom:1px solid var(--border);cursor:pointer;text-transform:none;letter-spacing:0;${_pr.previewId === x.id ? 'background:rgba(245,197,24,.08)' : ''}">
            <input type="checkbox" style="width:auto;margin-top:.15rem" ${_pr.sel.has(x.id) ? 'checked' : ''} onchange="this.checked?_pr.sel.add('${x.id}'):_pr.sel.delete('${x.id}');_prDraw()">
            <span style="flex:1;font-size:.8rem"><b>${_h(x.teamName)}</b> ${_payBadge(x) || _payBadge({ payment: { status: 'unpaid' } })}<br><span style="color:var(--muted);font-size:.72rem">${_h(x.captain?.name || '—')}${x.payment?.remindedAt ? ` · 📣 ${_prAgo(x.payment.remindedAt)}${x.payment.reminders > 1 ? ` (${x.payment.reminders}×)` : ''}` : ''}${x.payment?.status === 'sent' ? ' · ' + _g('wysłał potwierdzenie — sprawdź w Płatnościach', 'proof sent — check Payments') : ''}</span></span>
            <a href="#" style="font-size:.68rem;color:var(--accent)" onclick="event.preventDefault();_pr.previewId='${x.id}';_prDraw()">${_g('podgląd', 'preview')}</a></label>`).join('') || `<div style="padding:.8rem;font-size:.82rem;color:var(--muted)">✅ ${_g('Wszystkie drużyny opłacone!', 'All teams have paid!')}</div>`}</div>
        <label style="${_MODAL_LBL};margin-top:.7rem">⏰ ${_g('Termin płatności', 'Payment deadline')}</label>
        <input type="date" value="${_h(_pr.deadline)}" min="${new Date().toISOString().slice(0, 10)}" onchange="_pr.deadline=this.value;_prDraw()" style="${_MODAL_INP}">
        <label style="display:flex;gap:.4rem;align-items:center;margin-top:.4rem;font-size:.74rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" style="width:auto" ${_pr.saveDeadline ? 'checked' : ''} onchange="_pr.saveDeadline=this.checked"> ${_g('pokaż ten termin też w oknie płatności na stronie', 'also show this deadline in the payment window on the site')}</label>
        <div style="margin-top:.7rem;padding:.55rem .65rem;border:1px solid var(--border);border-radius:9px;background:var(--surface2)">
          <label style="display:flex;gap:.4rem;align-items:flex-start;font-size:.78rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" style="width:auto;margin-top:.15rem" ${_pr.auto ? 'checked' : ''} onchange="_pr.auto=this.checked;payRemindAuto()"> <span>⏰ <b>${_g('Automatycznie: 48 h i 24 h przed terminem', 'Automatic: 48 h and 24 h before the deadline')}</b><br><span style="font-size:.7rem;color:var(--muted)">${_g('Wysyła tę treść do drużyn bez płatności i bez wysłanego potwierdzenia.', 'Sends this message to teams with no payment and no proof sent.')}</span></span></label>
          ${Object.keys(_pr.autoSent || {}).filter(k => k.startsWith((_pr.deadline || '') + '|')).length ? `<div style="font-size:.68rem;color:var(--win);margin-top:.3rem">✅ ${_g('wysłano automatycznie', 'sent automatically')}: ${Object.keys(_pr.autoSent).filter(k => k.startsWith(_pr.deadline + '|')).map(k => k.split('|')[1] + ' h').join(', ')}</div>` : ''}</div>
        ${_pr.lastAt ? `<div style="font-size:.7rem;color:var(--muted);margin-top:.5rem">${_g('Ostatnie przypomnienie', 'Last reminder')}: ${_prAgo(_pr.lastAt)}</div>` : ''}
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center"><label style="${_MODAL_LBL}">✍️ ${_g('Treść wiadomości', 'Message')}</label><a href="#" style="font-size:.68rem;color:var(--muted)" onclick="event.preventDefault();if(confirm('${_g('Przywrócić domyślną treść?', 'Restore the default message?')}')){_pr.tpl=payRemindDefault(EU_MODE);_prDraw()}">${_g('przywróć domyślną', 'restore default')}</a></div>
        <textarea id="pr-tpl" rows="11" maxlength="3000" style="${_MODAL_INP};font-size:.8rem;line-height:1.45" oninput="_pr.tpl=this.value;_prPreview()">${_h(_pr.tpl)}</textarea>
        <div style="display:flex;flex-wrap:wrap;gap:.25rem;margin:.35rem 0 .6rem">${[['{captain}', _g('kapitan', 'captain')], ['{team}', _g('drużyna', 'team')], ['{fee}', _g('kwota', 'amount')], ['{deadline}', _g('termin', 'deadline')], ['{payment}', _g('dane do płatności', 'payment details')], ['{link}', _g('link do płatności', 'payment link')]].map(([k, l]) => `<button class="btn btn-ghost" style="font-size:.62rem;padding:.1rem .4rem;text-transform:none;letter-spacing:0" title="${_g('wstaw', 'insert')}" onclick="_prIns('${k}')"><code>${k}</code> ${l}</button>`).join('')}</div>
        <div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.3rem">👁 ${_g('PODGLĄD', 'PREVIEW')} — ${_h(pv?.teamName || '')}</div>
        <div id="pr-preview" style="background:#313338;color:#dbdee1;border-radius:10px;padding:.7rem .85rem;font-size:.82rem;line-height:1.5;max-height:34vh;overflow:auto;font-family:'gg sans','Segoe UI',sans-serif"></div>
        <div style="font-size:.68rem;color:var(--muted);margin-top:.3rem">${_g('Wiadomość wyśle bot ligi w prywatnej wiadomości do kapitana, dokładnie w tej treści (bez tłumaczenia). Linie z {deadline} znikają, jeśli nie ustawisz terminu.', 'The league bot sends this as a DM to each captain, exactly as written (no translation). Lines with {deadline} are removed if no deadline is set.')}</div>
      </div></div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.9rem"><button class="btn btn-ghost" onclick="_fxClose('pr-modal')">${_g('Anuluj', 'Cancel')}</button>
      <button class="btn btn-primary" ${sentN ? '' : 'disabled'} onclick="payRemindSend()">📣 ${_g(`Wyślij do ${sentN} ${_plPL(sentN, 'kapitana', 'kapitanów', 'kapitanów')}`, `Send to ${sentN} captain${sentN === 1 ? '' : 's'}`)}</button></div></div>`;
  _prPreview();
}
function _prPreview() { const el = document.getElementById('pr-preview'); if(!el) return; const T = _prTeams(), pv = T.find(x => x.id === _pr.previewId) || T.find(x => _pr.sel.has(x.id)) || T[0];
  el.innerHTML = `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.35rem"><span style="width:28px;height:28px;border-radius:50%;background:#f5c518;display:inline-flex;align-items:center;justify-content:center;font-size:.9rem">🏀</span><b style="color:#fff">${EU_MODE ? 'EU Chemik League' : '2K Pro-Am Ekstraklasa'}</b><span style="background:#5865f2;color:#fff;border-radius:3px;font-size:.58rem;padding:0 .25rem;font-weight:700">BOT</span></div>` + _prMd(payRemindRender(_pr.tpl, _prVars(pv))); }
function _prIns(k) { const ta = document.getElementById('pr-tpl'); if(!ta) return; const a = ta.selectionStart ?? ta.value.length, b = ta.selectionEnd ?? a; ta.value = ta.value.slice(0, a) + k + ta.value.slice(b); _pr.tpl = ta.value; ta.focus(); ta.setSelectionRange(a + k.length, a + k.length); _prPreview(); }
async function payRemindAuto() { if(_pr.auto && !_pr.deadline) { showToast('⚠ ' + _g('Ustaw termin płatności — bez niego automat nie zadziała', 'Set a payment deadline — the automation needs it'), 'info'); }
  const r = await _api('/team-payment/remind', 'POST', { saveAuto: true, auto: _pr.auto, message: _pr.tpl, deadline: _pr.deadline, saveDeadline: !!_pr.deadline }, { admin: true });
  if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; } if(r.signup) window._signupInfo = r.signup; showToast(_pr.auto ? '⏰ ' + _g('Automatyczne przypomnienia włączone (z obecną treścią)', 'Automatic reminders on (with the current message)') : _g('Automatyczne przypomnienia wyłączone', 'Automatic reminders off'), 'success'); }
async function payRemindSend() {
  const ids = _prTeams().filter(x => _pr.sel.has(x.id)).map(x => x.id); if(!ids.length) return;
  if(_pr.tpl.includes('{deadline}') && !_pr.deadline && !confirm(_g('Nie ustawiono terminu płatności — linie z {deadline} zostaną pominięte. Wysłać mimo to?', 'No payment deadline set — lines with {deadline} will be left out. Send anyway?'))) return;
  if(!confirm(_g(`Wysłać przypomnienie do ${ids.length} ${_plPL(ids.length, 'kapitana', 'kapitanów', 'kapitanów')}?`, `Send the reminder to ${ids.length} captain${ids.length === 1 ? '' : 's'}?`))) return;
  showToast('📣 ' + _g('Wysyłanie…', 'Sending…'), 'info');
  const r = await _api('/team-payment/remind', 'POST', { ids, message: _pr.tpl, deadline: _pr.deadline, saveDeadline: _pr.saveDeadline }, { admin: true });
  if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; }
  (r.registrations || []).forEach(x => { const i = teamRegistrations.findIndex(y => y.id === x.id); if(i >= 0) teamRegistrations[i] = x; }); if(r.signup) window._signupInfo = r.signup;
  _pr.results = r.results; _prDraw(); showToast(`📣 ${_g('Wysłano', 'Sent')}: ${r.sent}/${r.results.length}`, r.sent ? 'success' : 'error');
}
function openMyPayment() { // link /pay z wiadomości: okno płatności drużyny zalogowanego kapitana
  const go = () => { if(!discordUser) { showToast(_g('🔑 Zaloguj się przez Discord, aby otworzyć płatność drużyny', '🔑 Log in with Discord to open your team payment'), 'info'); try { goToTeamRegistrations(); } catch(e) {} return; }
    const sid = currentSeasonId || null, my = String(discordUser.id), r = (teamRegistrations || []).find(x => String(x.captain?.id) === my && x.status !== 'rejected' && (!sid || !x.seasonId || x.seasonId === sid));
    if(r) openTeamPayment(r.id); else { try { goToTeamRegistrations(); } catch(e) {} } };
  let n = 0; const t = setInterval(() => { if((teamRegistrations || []).length || ++n > 30) { clearInterval(t); go(); } }, 300);
}
function _qrLoad() { return window.QRCode ? Promise.resolve() : (window._qrP = window._qrP || new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); })); }
function _skrillBoxHtml(s, team) {
  const row = (label, val) => `<div style="display:flex;align-items:center;gap:.4rem;justify-content:space-between;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.35rem .55rem;margin-top:.3rem"><span style="font-size:.74rem;color:var(--muted)">${label}</span><b style="font-size:.86rem;word-break:break-all">${_h(val)}</b><button class="btn btn-ghost" style="font-size:.66rem;padding:.15rem .4rem" onclick="navigator.clipboard?.writeText('${_h(val).replace(/'/g, "\\'")}').then(()=>showToast('📋 ' + _g('Skopiowano', 'Copied'),'success'))">📋</button></div>`;
  return `<div style="margin-top:.6rem"><div style="font-weight:800;font-size:.86rem">💜 ${_g('Zapłać przez Skrill', 'Pay with Skrill')}</div>
    <div style="font-size:.76rem;color:var(--muted);margin:.2rem 0 .1rem;line-height:1.5">${_g('W aplikacji lub na stronie Skrill wybierz <b>Wyślij</b> (Send money), wpisz adres e-mail poniżej, kwotę i nazwę drużyny w opisie.', 'In the Skrill app or website choose <b>Send money</b>, enter the email below, the amount and your team name in the description.')}</div>
    ${row(_g('E-mail Skrill', 'Skrill email'), s.skrillEmail)}${s.skrillId ? row('Customer ID', s.skrillId) : ''}${team ? row(_g('Opis przelewu', 'Payment description'), team) : ''}
    <a class="btn btn-primary" href="https://www.skrill.com/" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;margin-top:.5rem">💜 ${_g('Otwórz Skrill', 'Open Skrill')}</a></div>`;
}
async function openTeamPayment(regId) {
  const r = teamRegistrations.find(x => x.id === regId); if(!r) return; const s = _signup();
  const m = _fxModal('pay-modal', 640); m.classList.add('open');
  const st = r.payment?.status || 'unpaid';
  m.querySelector('.modal').innerHTML = _fxHead('pay-modal', '💶 ' + _g('Wpisowe', 'Entry fee') + ' · ' + _h(r.teamName)) + `<div data-notr>
    <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:.8rem">
      <div style="flex:1;min-width:220px"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.2rem;color:var(--accent);line-height:1">${_h(s.fee || '25€')}</div><div style="font-size:.84rem;color:var(--muted)">${_g('za drużynę', 'per team')} · ${_g('status', 'status')}: ${_payBadge(r) || _payBadge({ payment: { status: 'unpaid' } })}</div>${st !== 'paid' && s.payDeadline ? `<div style="font-size:.84rem;margin-top:.3rem">⏰ ${_g('Termin płatności', 'Payment deadline')}: <b style="color:${s.payDeadline < new Date().toISOString().slice(0, 10) ? '#ef4444' : 'var(--accent)'}">${_h(payRemindDeadlineTxt(s.payDeadline, currentLang === 'en'))}</b></div>` : ''}
        ${_payMethod(s) === 'skrill' ? (st !== 'paid' ? _skrillBoxHtml(s, r.teamName) : '') : s.revolutUrl ? `<a class="btn btn-primary" href="${_h(s.revolutUrl)}" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;margin-top:.6rem">💳 ${_g('Zapłać przez Revolut', 'Pay with Revolut')}</a>` : `<div style="font-size:.8rem;color:var(--muted);margin-top:.5rem">${_g('Dane do płatności pojawią się wkrótce.', 'Payment details will be added soon.')}</div>`}</div>
      ${_payMethod(s) === 'revolut' ? `<div style="text-align:center"><div id="pay-qr" style="background:#fff;padding:8px;border-radius:10px;display:inline-block"></div><div style="font-size:.7rem;color:var(--muted);margin-top:.2rem">${_g('Zeskanuj telefonem', 'Scan with your phone')}</div></div>` : ''}</div>
    ${st !== 'paid' ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.55rem .7rem;margin-bottom:.7rem;font-size:.8rem;line-height:1.5">
      ✍️ ${_g(`W tytule przelewu wpisz <b>nazwę drużyny: ${_h(r.teamName)}</b>`, `In the payment description write your <b>team name: ${_h(r.teamName)}</b>`)}<br>
      🛡️ ${_g('Wpisowe płacisz <b>tylko</b> według danych na tej stronie. Admini <b>nigdy</b> nie wysyłają innych danych ani linków do płatności w prywatnych wiadomościach — to oszustwo.', 'Pay the entry fee <b>only</b> using the details on this website. Admins <b>never</b> send other payment details or links in DMs — that is a scam.')}</div>` : ''}
    ${st === 'paid' ? `<div style="font-size:.86rem;color:var(--win)">✅ ${_g('Opłata potwierdzona — dzięki!', 'Payment confirmed — thank you!')}</div>` : `
    <div style="font-weight:800;font-size:.86rem;margin-bottom:.3rem">🧾 ${_g('Potwierdzenie przelewu', 'Payment proof')}</div>
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.45rem">${_g('Po przelewie dodaj tu zrzut ekranu potwierdzenia', 'After paying, upload a screenshot of the transfer here')}${s.dmAccount ? _g(` — albo wyślij go w prywatnej wiadomości na Discordzie do <b>${_h(s.dmAccount)}</b>.`, ` — or send it in a DM on Discord to <b>${_h(s.dmAccount)}</b>.`) : '.'}</div>
    <input type="file" accept="image/*" id="pay-file" style="font-size:.8rem">
    <div style="display:flex;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-primary" onclick="uploadPayment('${r.id}')">📤 ${_g('Wyślij potwierdzenie', 'Send proof')}</button></div>
    ${st === 'sent' ? `<div style="font-size:.78rem;color:#f59e0b;margin-top:.4rem">🧾 ${_g('Potwierdzenie wysłane — czeka na sprawdzenie przez admina.', 'Proof sent — waiting for an admin to check it.')}</div>` : ''}`}
    ${_captainGuideHtml()}</div>`;
  if(_payMethod(s) === 'revolut') { try { await _qrLoad(); new QRCode(document.getElementById('pay-qr'), { text: s.revolutUrl, width: 132, height: 132 }); } catch(e) {} }
}
async function uploadPayment(regId) {
  const f = document.getElementById('pay-file')?.files?.[0]; if(!f) { showToast(_g('Wybierz zrzut ekranu', 'Choose a screenshot'), 'info'); return; }
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); });
  const sc = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  showToast('⏳ ' + _g('Wysyłam…', 'Sending…'), 'info');
  const r = await _api('/team-payment', 'POST', { regId, image: c.toDataURL('image/jpeg', .82) }, { session: true });
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  const i = teamRegistrations.findIndex(x => x.id === regId); if(i >= 0) teamRegistrations[i] = r.registration;
  showToast('✅ ' + _g('Potwierdzenie wysłane — admin je sprawdzi', 'Proof sent — an admin will check it'), 'success'); openTeamPayment(regId); try { renderTeamRegistrations(); renderEuDash(); } catch(e) {}
}
// admin: płatności drużyn
async function openPayments() {
  const m = _fxModal('payadm-modal', 760); m.classList.add('open'); const sid = currentSeasonId || null;
  const L = teamRegistrations.filter(r => r.status !== 'rejected' && (!sid || !r.seasonId || r.seasonId === sid));
  const unpaidN = _prTeams().length;
  m.querySelector('.modal').innerHTML = _fxHead('payadm-modal', '💳 Płatności drużyn') + `<div data-notr style="font-size:.82rem">${unpaidN ? `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.5rem .7rem;margin-bottom:.6rem"><span>💶 Nieopłacone: <b>${unpaidN}</b>${_signup().payDeadline ? ` · termin: <b>${_h(payRemindDeadlineTxt(_signup().payDeadline, false))}</b>` : ''}</span><button class="btn btn-primary" style="font-size:.72rem" onclick="_fxClose('payadm-modal');openPayRemind()">📣 Przypomnij kapitanom</button></div>` : ''}${L.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--border)">
      <span><b>${_h(r.teamName)}</b> <span style="color:var(--muted)">· ${_h(r.captain?.name || '')}</span> ${_levelBadge(r)} ${_payBadge(r) || _payBadge({ payment: { status: 'unpaid' } })}${r.payment?.remindedAt && r.payment?.status !== 'paid' ? ` <span style="color:var(--muted);font-size:.7rem">📣 ${_prAgo(r.payment.remindedAt)}</span>` : ''}</span>
      <span style="display:flex;gap:.3rem">${r.payment?.status === 'sent' || r.payment?.status === 'paid' ? `<button class="btn btn-ghost" style="font-size:.7rem" onclick="payProof('${r.id}')">🧾 Zrzut</button>` : ''}
        ${r.payment?.status !== 'paid' ? `<button class="btn btn-primary" style="font-size:.7rem" onclick="payConfirm('${r.id}',true)">✅ Opłacone</button>` : `<button class="btn btn-ghost" style="font-size:.7rem" onclick="payConfirm('${r.id}',false)">↩ Cofnij</button>`}</span></div>`).join('') || '<div style="color:var(--muted)">Brak zgłoszeń.</div>'}
    <div id="pay-proof" style="margin-top:.7rem"></div></div>`;
}
async function payProof(regId) { const box = document.getElementById('pay-proof'); if(!box) return; const t = teamRegistrations.find(x => x.id === regId);
  box.innerHTML = '⏳'; const r = await _api('/team-payment/img/' + regId, 'GET', null, { admin: true });
  box.innerHTML = r.ok ? `<div style="font-weight:800;font-size:.84rem;margin-bottom:.35rem">🧾 Przelew · ${_h(t?.teamName || '')}</div><a href="${r.image}" target="_blank" rel="noopener"><img src="${r.image}" style="max-width:100%;max-height:70vh;border-radius:10px;border:1px solid var(--border);display:block"></a>
    ${t?.payment?.status !== 'paid' ? `<div style="display:flex;justify-content:flex-end;margin-top:.5rem"><button class="btn btn-primary" onclick="payConfirm('${regId}',true)">✅ Oznacz jako opłacone</button></div>` : ''}` : '❌ ' + _h(r.error || '');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
async function payConfirm(regId, paid) { const r = await _api('/team-payment/confirm', 'POST', { regId, paid }, { admin: true }); if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; } const i = teamRegistrations.findIndex(x => x.id === regId); if(i >= 0) teamRegistrations[i] = r.registration; showToast(paid ? '✅ Oznaczono jako opłacone (DM do kapitana)' : '↩ Cofnięto', 'success'); openPayments(); try { renderTeamRegistrations(); renderEuDash(); } catch(e) {} }
// admin: ustawienia zapisów
function openSignupSettings() {
  const s = _signup(), m = _fxModal('signup-modal', 720); m.classList.add('open');
  const inp = (id, label, v, ph = '') => `<label style="${_MODAL_LBL};margin-top:.5rem">${label}</label><input id="${id}" value="${_h(v || '')}" placeholder="${_h(ph)}" style="${_MODAL_INP}">`;
  m.querySelector('.modal').innerHTML = _fxHead('signup-modal', '💶 Zapisy: wpisowe i regulamin') + `<div data-notr>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">${inp('su-fee', 'Wpisowe (tekst)', s.fee, '25€')}${inp('su-dm', 'Konto Discord do DM', s.dmAccount, 'ChemikLeague')}</div>
    <div style="margin-bottom:.6rem"><label style="${_MODAL_LBL}">Metoda płatności wpisowego</label><select id="su-pm" style="${_MODAL_INP}"><option value="skrill" ${(s.payMethod || (s.skrillEmail ? 'skrill' : 'revolut')) === 'skrill' ? 'selected' : ''}>💜 Skrill (przelew na e-mail)</option><option value="revolut" ${(s.payMethod || (s.skrillEmail ? 'skrill' : 'revolut')) === 'revolut' ? 'selected' : ''}>💳 Revolut (link)</option></select></div>
    ${inp('su-skr', 'E-mail konta Skrill (do wpłat)', s.skrillEmail, 'payments@…')}
    ${inp('su-skid', 'Skrill Customer ID (opcjonalnie)', s.skrillId, '123456789')}
    ${inp('su-rev', 'Link do płatności (Revolut)', s.revolutUrl, 'https://revolut.me/…')}
    ${inp('su-rurl', 'Link do pełnego regulaminu (opcjonalnie)', s.rulesUrl, 'https://docs.google.com/…')}
    <label style="${_MODAL_LBL};margin-top:.5rem">Treść regulaminu (zakładka Rules; # na początku linii = nagłówek)</label><textarea id="su-rtxt" rows="9" style="${_MODAL_INP};font-family:inherit">${_h(s.rulesText || '')}</textarea>
    <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.6rem"><b style="font-size:.84rem">🇪🇺 Baner EU na stronie głównej</b>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.8rem;text-transform:none;letter-spacing:0;color:var(--text);margin:.4rem 0"><input type="checkbox" id="su-eub" ${s.euBanner === false ? '' : 'checked'} style="width:auto;margin:0"> Pokazuj baner „EU CHEMIK LEAGUE — SIGN UPS ARE OPEN”</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">${inp('su-euu', 'Adres strony EU', s.euUrl || EU_SITE)}${inp('su-eut', 'Podpis na banerze (opcj.)', s.euText, 'NBA 2K Pro-Am · 25€ per team')}</div></div>
    <div style="display:flex;justify-content:flex-end;margin-top:.8rem"><button class="btn btn-primary" onclick="signupSave()">💾 Zapisz</button></div></div>`;
}
async function signupSave() {
  const v = id => document.getElementById(id).value;
  const r = await _api('/signup-settings', 'POST', { fee: v('su-fee'), dmAccount: v('su-dm'), revolutUrl: v('su-rev'), skrillEmail: v('su-skr'), skrillId: v('su-skid'), payMethod: v('su-pm'), rulesUrl: v('su-rurl'), rulesText: v('su-rtxt'), euBanner: document.getElementById('su-eub').checked, euUrl: v('su-euu'), euText: v('su-eut') }, { admin: true });
  if(!r.ok) { showToast('❌ ' + r.error, 'error'); return; }
  window._signupInfo = r.signup; _fxClose('signup-modal'); showToast('💾 Zapisano', 'success'); try { renderEuBillboard(); renderSideNav(); renderRules(); } catch(e) {}
}
function kortCfg(mod) { const m = KORT_MODS[mod]?.cfg || {}; return { ...KORT_CFG, ...m, tier: { ...KORT_CFG.tier, ...(m.tier || {}) }, form: { ...KORT_CFG.form, ...(m.form || {}) }, badge: { ...KORT_CFG.badge, ...(m.badge || {}) } }; }
function kortCard(src, i, CFG) { // src: {name, team, tier:'galaxy'|…, lim, form:'hot'|'cold'|'', attrs:{shoot,three,inside,play,ball,def,reb}(0..1), badges:[{key,l}]}
  const a = src.attrs || {}, v = x => +(x ?? .5), C = CFG || KORT_CFG, raw = {
    atk: Math.max(v(a.shoot), v(a.three), v(a.inside)), roz: (v(a.play) + v(a.ball)) / 2, obr: Math.max(v(a.def), v(a.reb)) };
  const bonus = (C.tier[src.tier] || 0) + (src.lim ? C.limited : 0) + (C.form[src.form] || 0);
  const pw = {}; KORT_ROWS.forEach(r => pw[r] = Math.max(1, Math.round(C.base + C.scale * raw[r] + bonus)));
  return { id: 'c' + i + '_' + (src.name || ''), name: src.name, team: src.team, tier: src.tier, lim: !!src.lim, form: src.form || '',
    pw, badges: (src.badges || []).map(b => ({ key: b.key, b: b.l >= 3 ? 2 : 1 })), mod: 0, immune: !!src.lim || (src.badges || []).some(b => b.key === 'iron') };
}
function kortCoach(st, side, row) {
  const me = st.p[side], t = me.coach; if(st.over || st.turn !== side || me.passed || !t || me.coachUsed || st.q > (st.cfg?.coachRounds || 2)) return false; // tylko w 1. i 2. rundzie
  const opp = 1 - side, ev = [];
  if(t === 'timeout') { if(st.q !== 2 || !me.hand.length) return false; const pw = x => Math.max(...KORT_ROWS.map(r => x.pw[r]));
    let got = null; if(me.deck.length) got = me.deck.shift(); else { const D = me.discard || []; if(!D.length) return false; got = D.reduce((b, x) => pw(x) > pw(b) ? x : b, D[0]); D.splice(D.indexOf(got), 1); got.mod = 0; }
    const w = me.hand.reduce((b, x) => pw(x) < pw(b) ? x : b, me.hand[0]); if(pw(got) <= pw(w)) { if(me.deck.length || !me.discard?.includes(got)) { if(!(me.discard || []).includes(got)) me.deck.unshift(got); else me.discard.push(got); } return false; } // tylko gdy dobrana karta jest lepsza
    me.hand.push(got); me.hand.splice(me.hand.indexOf(w), 1); (me.discard = me.discard || []).push(w); ev.push(`${got.name} ↔ ${w.name}`); }
  else { if(!KORT_ROWS.includes(row)) return false;
    const pts = st.q === 1 ? 2 : 1; // 1. runda: 2 pkt, 2. runda: 1 pkt
    if(t === 'press') { if(!st.p[opp].board[row].length) return false; const a = st.p[opp].adj = st.p[opp].adj || {}; a[row] = (a[row] || 0) - pts; ev.push('−' + pts); }
    if(t === 'hot') { if(!me.board[row].length) return false; const a = me.adj = me.adj || {}; a[row] = (a[row] || 0) + pts; ev.push('+' + pts); } }
  me.coachUsed = true; st.log.push({ side, coach: t, row: row || null, ev }); return true; // darmowa akcja — gracz gra dalej w tej samej turze
}
function kortNew(deckA, deckB, seed, mod, coachA, coachB) {
  const C = kortCfg(mod);
  const rnd = kortRng(seed), shuffle = L => { const a = L.slice(); for(let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const side = (deck, k) => { const d = shuffle(deck.map((c, i) => kortCard(c, k * 100 + i, C))); return { hand: d.slice(0, C.hand), deck: d.slice(C.hand), board: { atk: [], roz: [], obr: [] }, passed: false, wins: 0, qScores: [] }; };
  const first = rnd() < .5 ? 0 : 1, P = [side(deckA, 0), side(deckB, 1)];
  for(let k = 0; k < C.firstBonus && P[first].deck.length; k++) P[first].hand.push(P[first].deck.shift()); // zaczynający dostaje dodatkową kartę (jak „moneta”)
  const tactics = [0, 1, 2].map(() => { const r = KORT_ROWS[Math.floor(rnd() * 3)]; return C.forceTactic || r; }); // taktyka każdej rundy: rząd liczony podwójnie
  if(KORT_COACH[coachA]) P[0].coach = coachA; if(KORT_COACH[coachB]) P[1].coach = coachB;
  return { p: P, q: 1, turn: first, first, tactics, log: [], over: false, result: null, seed, mod: mod || null, cfg: C };
}
function kortValue(st, side, row, c) { // aktualna siła karty na planszy
  const C = st.cfg || KORT_CFG, me = st.p[side], all = KORT_ROWS.flatMap(r => me.board[r]);
  let v = c.pw[row] + c.mod;
  const B = (k, on = true) => on ? Math.round(_bv(c, k) * C.badge[k]) : 0;
  if(row === 'atk') v += B('sniper') + B('scorer', me.board.atk.length > 1);
  if(row === 'obr') v += B('glass');
  if(row === 'roz') v += B('dime', me.board.roz.length > 1);
  if(_bv(c, 'dd') >= 2) v += Math.round(C.badge.dd); // double-double: +1 dla złotych i diamentowych
  v += B('winner', st.q === 3); // zwycięzca: mocniejszy w decydującej 3. kwarcie
  if(_bv(c, 'iron') && st.q === 3) v += Math.round(C.badge.iron); // żelazny: +1 w 3. kwarcie
  if(all.some(o => o !== c && o.team && o.team === c.team)) v += C.chem;
  return Math.max(0, Math.round(v));
}
function kortRowSum(st, side, r) { const sum = st.p[side].board[r].reduce((t, c) => t + kortValue(st, side, r, c), 0), adj = st.p[side].adj?.[r] || 0; // adj: karty trenerskie (stałe punkty, bez mnożnika)
  return Math.max(0, (st.tactics && st.tactics[st.q - 1] === r ? Math.round(sum * (st.cfg || KORT_CFG).tacticMult) : sum) + adj); }
function kortTotal(st, side) { return KORT_ROWS.reduce((s, r) => s + kortRowSum(st, side, r), 0); }
function _kortStrongest(st, side, rowFilter) { let best = null; KORT_ROWS.filter(r => !rowFilter || r === rowFilter).forEach(r => st.p[side].board[r].forEach(c => { if(c.immune) return; const v = kortValue(st, side, r, c); if(!best || v > best.v) best = { c, v, r }; })); return best; }
function kortPlay(st, side, cardId, row) {
  if(st.over || st.turn !== side || st.p[side].passed) return false;
  const me = st.p[side], i = me.hand.findIndex(c => c.id === cardId); if(i < 0 || !KORT_ROWS.includes(row)) return false;
  const c = me.hand.splice(i, 1)[0]; me.board[row].push(c); const opp = 1 - side, ev = [];
  if(_bv(c, 'thief') && row === 'roz') { const t = _kortStrongest(st, opp, 'roz'), d = Math.max(1, Math.round((st.cfg || KORT_CFG).badge.thief)); if(t) { t.c.mod -= d; ev.push(`🦊 ${t.c.name} −${d}`); } } // złodziej: w Rozegraniu przechwytuje — osłabia najsilniejszego rozgrywającego rywala
  if(_bv(c, 'rim') && row === 'obr') { const t = _kortStrongest(st, opp), d = Math.max(1, Math.round(_bv(c, 'rim') * (st.cfg || KORT_CFG).badge.rim)); if(t) { t.c.mod -= d; ev.push(`🚫 ${t.c.name} −${d}`); } }
  st.log.push({ side, card: c.name, row, ev });
  _kortNextTurn(st, side); return true;
}
function kortPass(st, side) { if(st.over || st.turn !== side) return false; st.p[side].passed = true; st.log.push({ side, pass: true }); _kortNextTurn(st, side); return true; }
function _kortNextTurn(st, side) {
  const o = 1 - side;
  [0, 1].forEach(s => { if(!st.p[s].hand.length) st.p[s].passed = true; });
  if(st.p[0].passed && st.p[1].passed) return _kortEndQuarter(st);
  st.turn = st.p[o].passed ? side : o;
}
function _kortEndQuarter(st) {
  const a = kortTotal(st, 0), b = kortTotal(st, 1); st.p[0].qScores.push(a); st.p[1].qScores.push(b);
  st.contrib = st.contrib || [{}, {}]; // punkty każdej karty (MVP meczu)
  [0, 1].forEach(sd => KORT_ROWS.forEach(r => st.p[sd].board[r].forEach(c => { const v = kortValue(st, sd, r, c) * (st.tactics && st.tactics[st.q - 1] === r ? (st.cfg || KORT_CFG).tacticMult : 1); st.contrib[sd][c.name] = (st.contrib[sd][c.name] || 0) + v; })));
  if(a >= b) st.p[0].wins++; if(b >= a) st.p[1].wins++;
  st.log.push({ quarter: st.q, score: [a, b] });
  const w0 = st.p[0].wins, w1 = st.p[1].wins;
  if(w0 >= 2 || w1 >= 2 || st.q >= 3) { st.over = true; st.result = w0 > w1 ? 0 : w1 > w0 ? 1 : 'draw'; return; }
  const loser = a < b ? 0 : b < a ? 1 : st.turn;
  st.q++; st.p.forEach(p => { p.discard = (p.discard || []).concat(KORT_ROWS.flatMap(r => p.board[r])); p.adj = {}; p.board = { atk: [], roz: [], obr: [] }; p.passed = false; for(let k = 0; k < (st.cfg || KORT_CFG).drawAfter && p.deck.length; k++) p.hand.push(p.deck.shift()); if(!p.hand.length) p.passed = true; });
  st.turn = loser; if(st.p[st.turn].passed) st.turn = 1 - st.turn;
  if(st.p[0].passed && st.p[1].passed) _kortEndQuarter(st);
}
function _kortClone(st) { return JSON.parse(JSON.stringify(st)); }
function kortBotMove(st, side) { // prosta, „ludzka” sztuczna inteligencja trenera
  const me = st.p[side], opp = st.p[1 - side], my = kortTotal(st, side), th = kortTotal(st, 1 - side);
  const decisive = me.wins === 1 || st.q === 3, oppDecisive = opp.wins === 1;
  const coachOk = me.coach && !me.coachUsed;
  if(!me.hand.length && !coachOk) return { pass: true };
  const moves = []; me.hand.forEach(c => KORT_ROWS.forEach(r => { const s = _kortClone(st); s.turn = side; s.p[side].passed = false; kortPlay(s, side, c.id, r); const save = st.q < 3 && c.badges.some(b => b.key === 'winner' || b.key === 'iron') ? 2.5 : 0; // karty na 3. kwartę bot zostawia na później
    moves.push({ id: c.id, row: r, gain: kortTotal(s, side) - kortTotal(s, 1 - side) - (my - th) - save, raw: Math.max(...KORT_ROWS.map(x => c.pw[x])) }); }));
  if(me.coach && !me.coachUsed) { const t = me.coach; // karta trenerska: używana, gdy daje realny zysk (wcześniej zachowywana na później)
    if(t === 'timeout') { const s2 = _kortClone(st); s2.turn = side; s2.p[side].passed = false; if(kortCoach(s2, side, null)) return { coach: true, row: null }; } // tylko gdy zamiana się powiedzie
    else KORT_ROWS.forEach(r => { const s2 = _kortClone(st); s2.turn = side; s2.p[side].passed = false; if(kortCoach(s2, side, r)) { const g = kortTotal(s2, side) - kortTotal(s2, 1 - side) - (my - th); if(g >= 1 && (st.q === 2 || decisive || g >= 2)) moves.push({ coach: true, row: r, gain: 100 + g, raw: 0 }); } }); } // wyczucie: 2. pkt w 1. rundzie albo 2. runda / decydujący moment // darmowa akcja: jeśli warto — najpierw ona
  moves.sort((a, b) => b.gain - a.gain || a.raw - b.raw);
  if(!me.hand.length) return moves[0] || { pass: true };
  if(opp.passed) {
    if(my > th) return { pass: true };
    const win = moves.filter(m => my - th + m.gain > 0).sort((a, b) => a.raw - b.raw || b.gain - a.gain)[0];
    if(win) return win;
    if(!decisive && th - my > 6) { const played0 = KORT_ROWS.reduce((n, r) => n + me.board[r].length, 0); if(played0 === 0 && me.hand.length > 2) return moves.slice().sort((a, b) => a.raw - b.raw)[0]; return { pass: true }; } // nie do odrobienia — gra jedną tanią kartę i oszczędza resztę
    return moves[0];
  }
  // ile rywal może jeszcze dołożyć (jego najsilniejsze karty w ręce, ile ich zagra)
  const oppTop = opp.hand.map(c => Math.max(...KORT_ROWS.map(r => c.pw[r]))).sort((a, b) => b - a), canAdd = n => oppTop.slice(0, n).reduce((s, x) => s + x, 0);
  const played = KORT_ROWS.reduce((n, r) => n + me.board[r].length, 0);
  if(!decisive && my - th > canAdd(2) + 2) return { pass: true }; // prowadzi tak, że rywal nie dogoni dwiema kartami — oszczędza resztę
  if(!decisive && !oppDecisive && st.q === 1 && played >= 1 && th - my > (me.hand.length > 2 ? 12 : 8) && me.hand.length <= opp.hand.length) return { pass: true }; // kwarta stracona — oddaje ją, ale nie bez walki
  return moves[0];
}
async function _kortTourHtml() {
  const r = await _api('/kort/tour', 'GET', null, { admin: _isLoggedInSync() }).catch(() => null); if(!r?.ok) return ''; _ktour = r;
  const t = r.cur, last = r.last, me = discordUser?.id, en = currentLang === 'en', admin = _isLoggedInSync();
  const nm = id => _h(t?.players.find(p => p.id === id)?.name || '—'), when = iso => new Date(iso).toLocaleString(en ? 'en-GB' : 'pl-PL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  if(!t) { const recent = last && Date.now() - Date.parse(last.doneAt) < 4 * 864e5;
    return (recent ? `<div class="card" style="padding:.6rem .9rem;margin-bottom:.8rem;border:1px solid rgba(245,197,24,.5);font-size:.84rem" data-notr>🏆 <b>${_h(last.name)}</b> — ${_g('mistrz', 'champion')}: <b>${_h(last.players.find(p => p.id === last.champion)?.name || '')}</b></div>` : '')
      + (admin ? `<div style="margin-bottom:.8rem"><button class="btn btn-ghost" style="font-size:.74rem" onclick="kortTourCreateOpen()">🏆 ${_g('Nowy turniej Kortu', 'New Kort tournament')}</button></div>` : ''); }
  const mine = t.players.some(p => p.id === me), box = inner => `<div class="card" id="ktour-sec" style="padding:.85rem 1rem;margin-bottom:.9rem;border:2px solid var(--accent);background:linear-gradient(135deg,rgba(245,197,24,.12),rgba(239,68,68,.05))" data-notr>${inner}</div>`;
  if(t.status === 'signup') return box(`<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><div><b style="font-size:1rem">🏆 ${_h(t.name)}</b><div style="font-size:.8rem;color:var(--muted)">🗓 ${when(t.startAt)} · ${t.players.length}/${t.size} ${_g('zapisanych', 'signed up')} · ${_g('mecze na żywo, 20 min na rundę', 'live matches, 20 min per round')}</div></div>
    ${!discordUser ? `<button class="btn btn-primary" onclick="loginWithDiscord()">${_g('Zaloguj się, by się zapisać', 'Log in to sign up')}</button>` : mine ? `<button class="btn btn-ghost" onclick="kortTourAct('leave')">✕ ${_g('Wypisz się', 'Leave')}</button>` : t.players.length >= t.size ? `<span style="font-size:.8rem;color:var(--muted)">${_g('Brak miejsc', 'Full')}</span>` : `<button class="btn btn-primary" onclick="kortTourAct('join')">✍️ ${_g('Zapisz się', 'Sign up')}</button>`}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.5rem">${t.players.map(p => `<span style="font-size:.74rem;background:var(--surface2);border:1px solid ${p.id === me ? 'var(--accent)' : 'var(--border)'};border-radius:999px;padding:.12rem .5rem">${_h(p.name)}</span>`).join('') || `<span style="font-size:.76rem;color:var(--muted)">${_g('Bądź pierwszy!', 'Be the first!')}</span>`}</div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:.45rem">🏆 ${_g('Zwycięzca: 💎 paczka premium + karta „Mistrz turnieju Kortu” · finalista: 🎁 paczka. Graj swoją talią Kortu.', 'Winner: 💎 premium pack + “Kort Champion” card · runner-up: 🎁 pack. You play with your Kort deck.')}</div>
    ${admin ? `<div style="text-align:right;margin-top:.3rem"><a href="#" style="font-size:.7rem;color:var(--loss)" onclick="if(confirm('Odwołać turniej?')) _api('/kort/tour/cancel','POST',{},{admin:true}).then(()=>renderKort());return false">${_g('odwołaj', 'cancel')}</a></div>` : ''}`);
  const R = t.rounds || [], cur = R[R.length - 1] || [], left = Math.max(0, Math.round((r.roundMs - (Date.now() - (t.roundAt || 0))) / 60000));
  const my = cur.find(m => !m.w && (m.a === me || m.b === me)), out = mine && !cur.some(m => m.a === me || m.b === me);
  const rname = n => n === 2 ? _g('Finał', 'Final') : n === 4 ? _g('Półfinały', 'Semifinals') : n === 8 ? _g('Ćwierćfinały', 'Quarterfinals') : `1/${n / 2}`;
  return box(`<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><b style="font-size:1rem">🏆 ${_h(t.name)} · <span style="color:#ef4444">● LIVE</span></b><span style="font-size:.78rem;color:var(--muted)">${rname(cur.length * 2)} · ${_g('zostało', 'left')} ~${left} min</span></div>
    ${my ? `<div style="margin:.55rem 0;padding:.55rem .7rem;border-radius:10px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.5);display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap"><span>⚔️ ${_g('Twój mecz', 'Your match')}: <b>${nm(my.a)}</b> vs <b>${nm(my.b)}</b></span><button class="btn btn-primary" onclick="kortTourPlay()">▶ ${_g('Graj mecz turniejowy', 'Play your tournament match')}</button></div>` : out ? `<div style="font-size:.8rem;color:var(--muted);margin:.4rem 0">${_g('Odpadłeś z turnieju — kibicuj dalej!', 'You’re out — keep watching!')}</div>` : ''}
    <div style="display:flex;gap:.6rem;overflow-x:auto;margin-top:.4rem">${R.map((rd, ri) => `<div style="min-width:170px"><div style="font-size:.66rem;color:var(--muted);font-weight:800;letter-spacing:1px;margin-bottom:.25rem">${rname(rd.length * 2).toUpperCase()}</div>${rd.map(m => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.3rem .45rem;margin-bottom:.3rem;font-size:.74rem">
      ${[m.a, m.b].map(id => `<div style="display:flex;justify-content:space-between;${m.w && m.w === id ? 'font-weight:800;color:var(--win)' : m.w ? 'opacity:.5' : ''}"><span>${id ? nm(id) : '—'}</span>${m.w === id ? '✓' : ''}</div>`).join('')}${m.score ? `<div style="font-size:.62rem;color:var(--muted)">${m.score}${m.wo ? ' · walkower' : ''}</div>` : m.wo ? `<div style="font-size:.62rem;color:var(--muted)">walkower</div>` : ''}</div>`).join('')}</div>`).join('')}</div>`);
}
async function kortTourAct(a) { if(!_ensureSession()) return; const r = await _api('/kort/tour/' + a, 'POST', {}, { session: true }); if(!r.ok) showToast('❌ ' + _tr(r.error || ''), 'error'); else showToast(a === 'join' ? _g('✍️ Zapisano! Przypomnimy na Discordzie godzinę przed startem.', '✍️ Signed up! We’ll remind you on Discord an hour before.') : _g('Wypisano', 'Left the tournament'), 'success'); renderKort(); }
async function kortTourPlay() {
  const r = await _api('/kort/tour/play', 'POST', { deck: _kortMyDeck() }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _kortTab = 'live';
  if(r.role === 'host') { _kortLiveCode = r.code; showToast(_g('⏳ Czekasz na przeciwnika — dostał wiadomość na Discordzie', '⏳ Waiting for your opponent — they got a Discord DM'), 'info'); renderKort(); return; }
  if(r.role === 'join') { renderKort(); await kortLiveJoin(r.code); return; }
  const x = await _api('/kort/live/' + r.code, 'GET', null, { session: true }); if(x.ok) { renderKort(); kortLiveStart(x); }
}
function kortTourCreateOpen() {
  const m = _fxModal('ktour-modal', 460); m.classList.add('open'); const d = new Date(Date.now() + 2 * 864e5); d.setHours(20, 0, 0, 0); const loc = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  m.querySelector('.modal').innerHTML = _fxHead('ktour-modal', '🏆 Nowy turniej Kortu') + `<div data-notr>
    <label style="${_MODAL_LBL}">Nazwa</label><input id="kt-name" value="Puchar Kortu" maxlength="60" style="${_MODAL_INP};margin-bottom:.5rem">
    <label style="${_MODAL_LBL}">Start (dzień i godzina)</label><input id="kt-start" type="datetime-local" value="${loc}" style="${_MODAL_INP};margin-bottom:.5rem">
    <label style="${_MODAL_LBL}">Liczba miejsc</label><select id="kt-size" style="${_MODAL_INP};margin-bottom:.6rem"><option>4</option><option selected>8</option><option>16</option><option>32</option></select>
    <div style="font-size:.74rem;color:var(--muted);margin-bottom:.7rem">Zapisy ruszają od razu (ogłoszenie na kanale Kortu), przypomnienie idzie godzinę przed startem. O godzinie startu serwer układa drabinkę według ELO; każda runda trwa 20 minut, a nieobecni przegrywają walkowerem.</div>
    <div style="display:flex;justify-content:flex-end;gap:.5rem"><button class="btn btn-ghost" onclick="_fxClose('ktour-modal')">Anuluj</button><button class="btn btn-primary" onclick="kortTourCreate()">🏆 Utwórz i ogłoś</button></div></div>`;
}
async function kortTourCreate() {
  const r = await _api('/kort/tour/create', 'POST', { name: document.getElementById('kt-name').value, startAt: new Date(document.getElementById('kt-start').value).toISOString(), size: +document.getElementById('kt-size').value }, { admin: true });
  if(!r.ok) { showToast('❌ ' + (r.error || 'Błąd'), 'error'); return; } _fxClose('ktour-modal'); showToast('🏆 Turniej utworzony — zapisy ogłoszone na Discordzie', 'success'); renderKort();
}
function _kortPickInfo(k, c) {
  const src = _kortSrc(c.name, { lim: k.startsWith('lim:'), label: c.label, scope: _cardScope(k) }); if(!src) return `<div style="font-size:.6rem;color:var(--muted)">${_g('brak statystyk', 'no stats')}</div>`;
  const kc = kortCard(src, 0), best = Math.max(...KORT_ROWS.map(r => kc.pw[r]));
  return `<div style="display:flex;justify-content:center;gap:.2rem;margin:.25rem 0 .1rem;font-size:.64rem">${KORT_ROWS.map(r => `<span style="background:rgba(0,0,0,.35);border-radius:4px;padding:.05rem .22rem;${kc.pw[r] === best ? 'color:#ffd84d;font-weight:800' : ''}">${_KR[r][0]}${kc.pw[r]}</span>`).join('')}</div>
    ${kc.badges.length ? `<div style="font-size:.7rem;line-height:1" title="${kc.badges.map(b => b.key).join(', ')}">${kc.badges.map(b => (_KB[b.key] || '') + (b.b > 1 ? '⁺' : '')).join(' ')}</div>` : ''}`;
}
function _kortOwnDeck() { // talia z samych własnych kart (bez wypożyczonych) — do rankingu
  const saved = (() => { try { return JSON.parse(localStorage.getItem('kort_deck') || '[]'); } catch(e) { return []; } })().filter(k => _cards?.cards?.[k]?.n > 0);
  return saved.length === 8 ? saved : null;
}
async function _kortSaveDeckServer(keys) { if(!discordUser?.session || keys.length !== 8) return; const r = await _api('/kort/deck', 'POST', { keys }, { session: true }).catch(() => ({})); if(r.ok) showToast(_g('🏆 Talia zapisana też do rankingu — inni mogą z nią grać', '🏆 Deck saved for ranked — others can play against it'), 'success'); }
async function _kortRankedHtml() {
  _kortLadder = await _api('/kort/ladder', 'GET', null, discordUser?.session ? { session: true } : {}).catch(() => null);
  const me = _kortLadder?.me, own = _kortOwnDeck();
  const box = (inner, st = '') => `<div class="card" style="padding:.9rem 1rem;${st}">${inner}</div>`;
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.8rem;margin-bottom:1rem" data-notr>
    ${box(`<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏆 ${_g('MECZE Z KIBICAMI', 'PLAY OTHER FANS')}</div>
      <div style="font-size:.84rem;line-height:1.5;margin:.35rem 0 .6rem">${_g('Grasz przeciwko <b>talii innego kibica</b> — jego kartami gra komputer. Wygrane podnoszą Twój ranking (ELO) i dywizję. Maks. 5 meczów dziennie, każdy rywal raz dziennie.', 'You play against <b>another fan’s deck</b> — the computer plays their cards. Wins raise your rating (ELO) and division. Max. 5 matches a day, each opponent once a day.')}</div>
      ${!discordUser ? `<div style="font-size:.8rem;color:var(--muted)">${_g('Zaloguj się, żeby grać w rankingu.', 'Log in to play ranked.')}</div>`
        : !own ? `<div style="font-size:.8rem;margin-bottom:.4rem">${_g('Do rankingu potrzebujesz talii z <b>8 własnych kart</b> różnych graczy.', 'Ranked needs a deck of <b>8 of your own cards</b> (different players).')}</div><button class="btn btn-primary" onclick="kortDeckPick()">🃏 ${_g('Ułóż talię', 'Build deck')}</button>`
        : !me?.hasDeck ? `<button class="btn btn-primary" onclick="_kortSaveDeckServer(_kortOwnDeck()).then(renderKort)">📤 ${_g('Zapisz talię do rankingu', 'Save deck for ranked')}</button>`
        : `<div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;line-height:1">${me.elo}</div><div style="font-size:.8rem">${_kDiv(me.div)}<br><span style="color:var(--muted)">${me.rk.w}-${me.rk.l}${me.rk.d ? '-' + me.rk.d : ''} · ${_g('miejsce', 'rank')} ${me.rank || '—'} · ${_g('dziś', 'today')} ${me.today}/${_kortLadder.limit}</span></div></div>
          <div style="margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn btn-primary" ${me.today >= _kortLadder.limit ? 'disabled' : ''} onclick="kortFindOpp()">🔎 ${_g('Szukaj rywala', 'Find opponent')}</button><button class="btn btn-ghost" onclick="kortDeckPick()">🃏 ${_g('Zmień talię', 'Change deck')}</button></div>
          <div id="kort-opp"></div>`}`)}
    ${box(`<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🏅 ${_g('DYWIZJE I NAGRODY TYGODNIA', 'DIVISIONS & WEEKLY REWARDS')}</div>
      <div style="font-size:.78rem;line-height:1.7">${_kDiv('galaxy')} 1550+ → 💎 ${_g('paczka premium', 'premium pack')}<br>${_kDiv('diamond')} 1400+ → 🎁🎁 ${_g('2 paczki', '2 packs')}<br>${_kDiv('gold')} 1250+ → 🎁 ${_g('paczka', 'pack')}<br>${_kDiv('silver')} 1100+ · ${_kDiv('bronze')} ${_g('start', 'start')} 1000</div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:.3rem">${_g('Nagrody w poniedziałek dla graczy z min. 3 meczami rankingowymi w tygodniu.', 'Rewards every Monday for players with at least 3 ranked matches that week.')}</div>`)}
  </div>
  <div class="card" style="padding:.8rem 1rem" data-notr><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">📊 ${_g('RANKING', 'LADDER')}</div>
    ${(_kortLadder?.ladder || []).map((x, i) => `<div style="display:grid;grid-template-columns:28px 24px 1fr auto auto;gap:.5rem;align-items:center;padding:.28rem 0;border-bottom:1px solid var(--border);font-size:.82rem${x.id === discordUser?.id ? ';font-weight:800' : ''}"><b style="color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(x.avatar, 22)}<span>${_h(x.name)}</span><span>${_kDiv(x.div)}</span><b>${x.elo}</b></div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">${_g('Jeszcze nikt nie grał w rankingu — bądź pierwszy!', 'Nobody has played ranked yet — be the first!')}</div>`}</div>`;
}
async function kortFindOpp() {
  const box = document.getElementById('kort-opp'); if(box) box.innerHTML = '<div style="font-size:.8rem;color:var(--muted);margin-top:.5rem">⏳</div>';
  const r = await _api('/kort/opp', 'GET', null, { session: true }); if(!r.ok) { if(box) box.innerHTML = `<div style="font-size:.8rem;color:var(--muted);margin-top:.5rem">${_h(_tr(r.error || ''))}</div>`; return; }
  _kortOppPick = r.opp; const o = r.opp;
  if(box) box.innerHTML = `<div style="margin-top:.7rem;padding:.6rem .7rem;border:1px solid var(--border);border-radius:10px;background:var(--surface2)">
    <div style="display:flex;gap:.5rem;align-items:center">${_avatarHtml(o.avatar, 34)}<div><b>${_h(o.name)}</b><div style="font-size:.74rem">${_kDiv(o.div)} · ${o.elo} · ${o.rk.w}-${o.rk.l}</div></div></div>
    <div style="display:flex;flex-wrap:wrap;gap:.25rem;margin:.45rem 0">${o.deck.names.map((n, i) => `<span style="font-size:.68rem;background:var(--surface);border:1px solid ${o.deck.lim?.[i] ? '#f5c518' : 'var(--border)'};border-radius:5px;padding:.08rem .35rem">${o.deck.lim?.[i] ? '🌟 ' : ''}${_h(n)}</span>`).join('')}</div>
    <button class="btn btn-primary" onclick="kortStart('ranked')">⚔️ ${_g('Graj', 'Play')}</button> <button class="btn btn-ghost" onclick="kortFindOpp()">🔄 ${_g('Inny rywal', 'Another opponent')}</button></div>`;
}
function _kortBossDeck() { const L = _kortLeague().slice().sort((a, b) => b.rating - a.rating); return L.slice(0, 8); }
async function _kortBossHtml() {
  _kortBossInfo = await _api('/kort/boss', 'GET', null, discordUser?.session ? { session: true } : {}).catch(() => null);
  const deck = _kortBossDeck(), avg = Math.round(deck.reduce((s, c) => s + c.rating, 0) / Math.max(1, deck.length)), bi = _kortBossInfo || {};
  return `<div class="card" style="padding:1rem 1.1rem;background:linear-gradient(135deg,rgba(124,58,237,.25),rgba(245,197,24,.1))" data-notr>
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f5c518">👑 ${_g('BOSS TYGODNIA', 'WEEKLY BOSS')}</div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.8rem;line-height:1.1;margin:.2rem 0">${_g('Dream Team ligi', 'League Dream Team')}</div>
    <div style="font-size:.82rem;color:var(--muted)">${_g('8 najlepszych graczy sezonu · średnia', 'The season’s 8 best players · average')} <b style="color:var(--text)">${avg}</b> · ${_g('bez dopasowania siły — to ma być wyzwanie!', 'no strength matching — it’s meant to be hard!')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:.25rem;margin:.6rem 0">${deck.map(c => `<span style="font-size:.7rem;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:.1rem .4rem">${_h(c.name)} <b>${c.rating}</b></span>`).join('')}</div>
    <div style="font-size:.82rem;margin-bottom:.6rem">🎁 ${_g('Pierwsza wygrana w tygodniu: <b>💎 paczka premium</b> i ogłoszenie na Discordzie · 1 próba dziennie', 'First win of the week: <b>💎 premium pack</b> and a Discord shout-out · 1 attempt a day')}</div>
    ${!discordUser ? `<div style="font-size:.8rem;color:var(--muted)">${_g('Zaloguj się, żeby zmierzyć się z bossem.', 'Log in to face the boss.')}</div>` : bi.won ? `<div style="color:var(--win);font-weight:800">✅ ${_g('Boss pokonany w tym tygodniu!', 'Boss beaten this week!')}</div>` : bi.triedToday ? `<div style="color:var(--muted)">${_g('Dzisiejsza próba wykorzystana — wróć jutro.', 'Today’s attempt used — come back tomorrow.')}</div>` : `<button class="btn btn-primary" onclick="kortStart('boss')">👑 ${_g('Zmierz się z bossem', 'Face the boss')}</button>`}
    ${(bi.winners || []).length ? `<div style="font-size:.74rem;color:var(--muted);margin-top:.6rem">🏆 ${_g('Pokonali w tym tygodniu', 'Beaten this week by')}: ${bi.winners.map(_h).join(', ')}</div>` : ''}</div>`;
}
// 📸 grafika wyniku do udostępnienia
async function _kortShareImage() {
  const st = _kort.st, en = currentLang === 'en', r = st.result === 0 ? 'win' : st.result === 1 ? 'loss' : 'draw', W = 1200, H = 675;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), F = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1a1208'); bg.addColorStop(1, '#3a2410'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  for(let x = 0; x < W; x += 60) { g.fillStyle = x % 120 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.08)'; g.fillRect(x, 0, 60, H); } // parkiet
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.strokeRect(30, 30, W - 60, H - 60); g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(W / 2, H / 2, 90, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#f5c518'; g.font = `900 34px ${F}`; g.textBaseline = 'top'; g.fillText('🃏 KORT · ' + (_kort.mode === 'boss' ? (en ? 'WEEKLY BOSS' : 'BOSS TYGODNIA') : _kort.mode === 'ranked' ? (en ? 'RANKED' : 'RANKING') : _kort.mode === 'live' ? (en ? 'LIVE MATCH' : 'MECZ NA ŻYWO') : (en ? 'MATCH OF THE DAY' : 'MECZ DNIA')), 70, 60);
  g.fillStyle = '#fff'; g.font = `800 40px ${F}`; g.fillText(`${discordUser?.name || (en ? 'Me' : 'Ja')}  vs  ${_kort.opp.name}`, 70, 115);
  const big = `${r === 'win' ? (en ? 'WIN' : 'WYGRANA') : r === 'loss' ? (en ? 'LOSS' : 'PORAŻKA') : (en ? 'DRAW' : 'REMIS')} ${st.p[0].wins}:${st.p[1].wins}`, maxW = W - 560 * .8 - 70 - 110; // miejsce obok karty MVP
  let fs = 130; g.font = `900 ${fs}px ${F}`; while(g.measureText(big).width > maxW && fs > 60) { fs -= 4; g.font = `900 ${fs}px ${F}`; }
  g.fillStyle = r === 'win' ? '#4ade80' : r === 'loss' ? '#f87171' : '#ffd84d'; g.fillText(big, 70, 180 + (130 - fs) / 2);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `700 36px ${F}`; g.fillText((en ? 'Rounds: ' : 'Rundy: ') + st.p[0].qScores.map((x, i) => x + ':' + st.p[1].qScores[i]).join('   '), 70, 340);
  const mvp = Object.entries(st.contrib?.[0] || {}).sort((a, b) => b[1] - a[1])[0];
  if(mvp) { g.fillStyle = '#f5c518'; g.font = `900 34px ${F}`; g.fillText('⭐ MVP: ' + mvp[0] + ` · ${mvp[1]} ${en ? 'pts' : 'pkt'}`, 70, 410);
    try { const d = _pcData(mvp[0], 'season'); const url = d ? await _pcImage(d, en ? 'en' : 'pl', true) : null; if(url) { const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); const ch = 560, cw = ch * im.width / im.height; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.drawImage(im, W - cw - 70, (H - ch) / 2, cw, ch); g.restore(); } } catch(e) {} }
  g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `700 26px ${F}`; g.fillText('chemikleagues.com · ' + (en ? 'Minigames → Kort' : 'Minigry → Kort'), 70, H - 95);
  return c.toDataURL('image/jpeg', .86);
}
async function kortShare() {
  const m = _fxModal('kshare-modal', 700); m.classList.add('open'); m.querySelector('.modal').innerHTML = _fxHead('kshare-modal', '📸 ' + _g('Udostępnij wynik', 'Share result')) + '⏳';
  const img = await _kortShareImage(), st = _kort.st, r = st.result === 0 ? _g('Wygrana', 'Won') : st.result === 1 ? _g('Porażka', 'Lost') : _g('Remis', 'Draw');
  const text = `${r} ${st.p[0].wins}:${st.p[1].wins} vs ${_kort.opp.name}`; window._kShareImg = img; window._kShareText = text;
  m.querySelector('.modal').innerHTML = _fxHead('kshare-modal', '📸 ' + _g('Udostępnij wynik', 'Share result')) + `<img src="${img}" style="width:100%;border-radius:10px;display:block;margin-bottom:.7rem">
    <div style="display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">${discordUser?.session ? `<button class="btn btn-primary" onclick="kortShareSend(this)">💬 ${_g('Wyślij na Discord', 'Post to Discord')}</button>` : ''}
    <a class="btn btn-ghost" href="${img}" download="kort.jpg" style="text-decoration:none">⬇ ${_g('Pobierz', 'Download')}</a></div>`;
}
async function kortShareSend(btn) { btn.disabled = true; const r = await _api('/kort/share', 'POST', { image: window._kShareImg, text: window._kShareText }, { session: true }); showToast(r.ok ? _g('💬 Wynik wysłany na Discord!', '💬 Posted to Discord!') : '❌ ' + _tr(r.error || ''), r.ok ? 'success' : 'error'); if(r.ok) _fxClose('kshare-modal'); else btn.disabled = false; }
// 💡 podpowiedzi (domyślnie przez pierwsze 3 mecze)
function _kortTip() {
  const st = _kort.st, en = currentLang === 'en'; if(!_kort.tips || st.over || _kort.mode === 'live') return null;
  if(st.turn !== 0 || st.p[0].passed) return st.p[1].passed ? null : _g('🤖 Teraz ruch bota — zobacz, gdzie kładzie kartę.', '🤖 The bot’s move — watch where it plays.');
  const m = kortBotMove(st, 0), tac = st.tactics[st.q - 1], my = kortTotal(st, 0), th = kortTotal(st, 1), first = st.log.filter(l => l.side === 0).length === 0;
  let t = first ? _g('Wygrywa ten, kto pierwszy wygra <b>2 rundy</b>. W rundzie na zmianę dokładacie karty — liczy się suma. ', 'First to win <b>2 rounds</b> wins. You take turns adding cards — the total counts. ') : '';
  if(m.pass) { t += st.p[1].passed ? _g(`Prowadzisz ${my}:${th}, a bot spasował — <b>spasuj</b>, runda jest Twoja i oszczędzasz karty.`, `You lead ${my}:${th} and the bot passed — <b>pass</b>: the round is yours and you save cards.`) : _g(`Prowadzisz wyraźnie (${my}:${th}) — <b>spasuj</b> i zachowaj karty na kolejne rundy.`, `You’re well ahead (${my}:${th}) — <b>pass</b> and keep cards for later rounds.`); return { t, pass: true }; }
  if(m.coach) return { t: t + _g(`Użyj karty trenerskiej <b>${_coachName(st.p[0].coach)}</b>${m.row ? ' na rzędzie <b>' + _KR[m.row][0] + ' ' + _KR[m.row][1] + '</b>' : ''} — to darmowa akcja, potem grasz dalej.`, `Use your coach card <b>${_coachName(st.p[0].coach)}</b>${m.row ? ' on <b>' + _KR[m.row][0] + ' ' + _KR[m.row][2] + '</b>' : ''} — it’s a free action, then keep playing.`) };
  const c = st.p[0].hand.find(x => x.id === m.id), why = m.row === tac ? _g('ten rząd liczy się <b>×2</b> w tej rundzie', 'this row counts <b>×2</b> this round') : c?.badges?.length ? _g('jego odznaka działa w tym rzędzie', 'its badge works in this row') : _g('to jego najmocniejszy rząd', 'it’s its strongest row');
  t += st.p[1].passed ? _g(`Bot spasował (${th}) — wystarczy go przebić. `, `The bot passed (${th}) — you just need to beat it. `) : '';
  t += _g(`Połóż <b>${_h(c?.name || '')}</b> w rzędzie <b>${_KR[m.row][0]} ${_KR[m.row][1]}</b> — ${why}.`, `Play <b>${_h(c?.name || '')}</b> in <b>${_KR[m.row][0]} ${_KR[m.row][2]}</b> — ${why}.`);
  return { t, id: m.id, row: m.row };
}
function _kortComment(l, i) {
  const en = currentLang === 'en', who = l.side ? '🤖' : '🧑', pick = L => L[(i + (l.card || '').length) % L.length];
  if(l.quarter) { const [a, b] = l.score; return a > b ? (en ? `🏁 Round ${l.quarter} is yours ${a}:${b}!` : `🏁 Runda ${l.quarter} dla Ciebie ${a}:${b}!`) : a < b ? (en ? `🏁 The bot takes round ${l.quarter} ${a}:${b}` : `🏁 Runda ${l.quarter} dla bota ${a}:${b}`) : (en ? `🏁 Round ${l.quarter} tied ${a}:${b}` : `🏁 Runda ${l.quarter} na remis ${a}:${b}`); }
  if(l.coach) return `${who} 🧑‍🏫 <b>${_coachName(l.coach)}</b>${l.row ? ' → ' + _KR[l.row][0] : ''} ${(l.ev || []).map(_h).join(' ')}`;
  if(l.pass) return `${who} ${pick(en ? ['passes — saving cards', 'calls a timeout and passes', 'sits back and passes'] : ['pasuje — oszczędza karty', 'bierze czas i pasuje', 'cofa się i pasuje'])}`;
  const n = `<b>${_h(l.card)}</b>`, row = { atk: en ? [`${n} drains a three!`, `${n} attacks the rim!`, `${n} with a tough fadeaway!`] : [`${n} trafia za trzy!`, `${n} wjeżdża pod kosz!`, `${n} rzuca z odchylenia — jest!`],
    roz: en ? [`${n} finds the open man`, `${n} runs the pick and roll`, `${n} controls the tempo`] : [`${n} znajduje wolnego kolegę`, `${n} rozgrywa pick and roll`, `${n} dyktuje tempo`],
    obr: en ? [`${n} locks down the paint`, `${n} grabs the board`, `${n} pressures full court`] : [`${n} zamyka strefę podkoszową`, `${n} zbiera piłkę z tablicy`, `${n} naciska na całym boisku`] }[l.row];
  const ev = (l.ev || []).map(e => e.startsWith('🦊') ? (en ? ` 🦊 Steal! ${_h(e.slice(2))}` : ` 🦊 Przechwyt! ${_h(e.slice(2))}`) : e.startsWith('🚫') ? (en ? ` 🚫 Rejected! ${_h(e.slice(2))}` : ` 🚫 Czapa! ${_h(e.slice(2))}`) : ' ' + _h(e)).join('');
  return `${who} ${pick(row)}${ev}`;
}
function _kSfx(type) {
  if(localStorage.getItem('kort_sound') === '0') return;
  try { _kAudio = _kAudio || new (window.AudioContext || window.webkitAudioContext)(); const A = _kAudio, t = A.currentTime;
    const tone = (f, d, at = 0, vol = .08, wave = 'triangle') => { const o = A.createOscillator(), g = A.createGain(); o.type = wave; o.frequency.setValueAtTime(f, t + at); g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(.0001, t + at + d); o.connect(g).connect(A.destination); o.start(t + at); o.stop(t + at + d + .02); };
    const swish = (vol = .06) => { const len = A.sampleRate * .16, buf = A.createBuffer(1, len, A.sampleRate), d = buf.getChannelData(0); for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); f.type = 'bandpass'; f.frequency.value = 1800; g.gain.value = vol; s.buffer = buf; s.connect(f).connect(g).connect(A.destination); s.start(); };
    ({ play: () => swish(.07), opp: () => swish(.035), pass: () => tone(320, .09, 0, .05, 'square'), round: () => [523, 659, 784].forEach((f, i) => tone(f, .22, i * .09)), roundLost: () => [392, 330].forEach((f, i) => tone(f, .25, i * .12, .06)),
      win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .35, i * .12, .09)), loss: () => [330, 294, 247].forEach((f, i) => tone(f, .35, i * .16, .07, 'sine')) }[type] || (() => {}))();
  } catch(e) {}
}
// zdarzenia po każdym ruchu: dźwięk, baner wygranej rundy, koniec meczu
function _kortFx() {
  const st = _kort.st, qs = st.log.filter(l => l.quarter);
  if(qs.length > (_kort.seenQ || 0)) { const l = qs[qs.length - 1]; _kort.seenQ = qs.length; const [a, b] = l.score, en = currentLang === 'en';
    if(!st.over) _kSfx(a >= b ? 'round' : 'roundLost');
    _kort.banner = { txt: a > b ? (en ? `ROUND ${l.quarter} — YOURS!` : `RUNDA ${l.quarter} DLA CIEBIE!`) : a < b ? (en ? `ROUND ${l.quarter} — BOT` : `RUNDA ${l.quarter} DLA BOTA`) : (en ? `ROUND ${l.quarter} — TIE` : `RUNDA ${l.quarter} — REMIS`), sub: `${a}:${b}`, good: a >= b, at: Date.now() }; setTimeout(() => { if(_kort) _kortDraw(); }, 1800); }
  if(st.over && !_kort.endFx) { _kort.endFx = true; _kSfx(st.result === 0 ? 'win' : st.result === 1 ? 'loss' : 'round'); }
}
// 📈 moje statystyki
async function _kortStatsHtml() {
  if(!discordUser?.session) return `<div class="card" style="padding:1rem;color:var(--muted)">${_g('Zaloguj się, żeby zobaczyć swoje statystyki.', 'Log in to see your stats.')}</div>`;
  const r = await _api('/kort/me', 'GET', null, { session: true }).catch(() => ({}));
  if(!r.ok || !r.total?.g) return `<div class="card" style="padding:1rem;color:var(--muted)">${_g('Rozegraj pierwszy mecz — tu pojawi się Twoja historia i najlepsze karty.', 'Play your first match — your history and best cards will show up here.')}</div>`;
  const en = currentLang === 'en', M = { daily: ['⚔️', 'Mecz dnia', 'Daily'], ranked: ['🏆', 'Ranking', 'Ranked'], boss: ['👑', 'Boss', 'Boss'] }, tile = (v, l) => `<div class="card" style="padding:.6rem .7rem;text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.7rem;line-height:1">${v}</div><div style="font-size:.7rem;color:var(--muted)">${l}</div></div>`;
  const rc = x => x >= 60 ? 'var(--win)' : x <= 40 ? 'var(--loss)' : 'var(--text)';
  return `<div data-notr>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.6rem;margin-bottom:1rem">${tile(r.total.g, _g('meczów', 'matches'))}${tile(r.total.wr + '%', _g('wygranych', 'win rate'))}${Object.entries(r.modes).map(([k, x]) => tile(`${x.w}-${x.l}${x.d ? '-' + x.d : ''}`, M[k]?.[0] + ' ' + (M[k]?.[en ? 2 : 1] || k))).join('')}${tile(r.elo, 'ELO · ' + _kDiv(r.div))}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.8rem;margin-bottom:1rem">
      <div class="card" style="padding:.8rem .9rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">⭐ ${_g('NAJLEPSZE KARTY', 'BEST CARDS')}</div>
        <div style="display:grid;grid-template-columns:1fr 44px 50px 48px 40px;gap:.3rem;font-size:.66rem;color:var(--muted);padding-bottom:.2rem;border-bottom:1px solid var(--border)"><span></span><span>${_g('mecze', 'games')}</span><span>${_g('wygr.', 'win %')}</span><span>${_g('pkt/m', 'pts/g')}</span><span>MVP</span></div>
        ${r.cards.map(c => `<div style="display:grid;grid-template-columns:1fr 44px 50px 48px 40px;gap:.3rem;font-size:.8rem;padding:.22rem 0;border-bottom:1px solid var(--border)"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(c.k)}</b><span>${c.g}</span><span style="color:${rc(c.wr)}">${c.wr}%</span><span>${c.pts}</span><span>${c.mvp ? '⭐' + c.mvp : ''}</span></div>`).join('')}</div>
      <div class="card" style="padding:.8rem .9rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🏅 ${_g('ODZNAKI W TWOJEJ TALII', 'BADGES IN YOUR DECK')}</div>
        ${r.badges.map(x => `<div style="display:flex;justify-content:space-between;font-size:.8rem;padding:.22rem 0;border-bottom:1px solid var(--border)"><span>${_KB[x.k] || ''} ${_kbName(x.k)}</span><span><span style="color:var(--muted)">${x.g} ${_g('m.', 'g.')}</span> · <b style="color:${rc(x.wr)}">${x.wr}%</b></span></div>`).join('') || `<div style="font-size:.8rem;color:var(--muted)">—</div>`}</div></div>
    <div class="card" style="padding:.8rem .9rem"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.4rem">🕑 ${_g('OSTATNIE MECZE', 'RECENT MATCHES')}</div>
      ${r.hist.map(h => `<div style="display:grid;grid-template-columns:70px 22px 1fr auto;gap:.45rem;align-items:center;font-size:.8rem;padding:.25rem 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-size:.72rem">${new Date(h.at).toLocaleDateString(en ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'numeric' })}</span><span>${M[h.mode]?.[0] || ''}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">vs ${_h(h.opp || '')}${h.mvp ? ` <span style="color:var(--muted)">· ⭐ ${_h(h.mvp)}</span>` : ''}</span><b style="color:${h.res === 'win' ? 'var(--win)' : h.res === 'loss' ? 'var(--loss)' : 'var(--accent)'}">${h.res === 'win' ? (en ? 'W' : 'W') : h.res === 'loss' ? (en ? 'L' : 'P') : (en ? 'D' : 'R')} ${_h(h.score || '')}</b></div>`).join('')}</div></div>`;
}
// 🛠 admin: balans Kortu na prawdziwych meczach
// 🔁 admin: przeliczenie ELO z historii meczów rankingowych (podgląd → zastosuj)
async function openEloRecalc(apply) {
  const m = _fxModal('elorc-modal', 640); m.classList.add('open'); const head = _fxHead('elorc-modal', '🔁 Kort — przelicz ELO z historii');
  m.querySelector('.modal').innerHTML = head + '⏳ Liczę…';
  if(apply && !confirm('Zapisać przeliczone ELO i bilanse wszystkim graczom rankingowym?')) { apply = false; }
  const r = await _api('/kort/elo-recalc', apply ? 'POST' : 'GET', apply ? {} : null, { admin: true }); if(!r.ok) { m.querySelector('.modal').innerHTML = head + '❌ ' + _h(r.error || ''); return; }
  const ch = r.rows.filter(x => x.diff), sgn = d => (d > 0 ? '+' : '') + d;
  m.querySelector('.modal').innerHTML = head + `<div data-notr style="font-size:.82rem">
    <div style="color:var(--muted);margin-bottom:.6rem">${r.applied ? '✅ <b style="color:var(--win)">Zapisano.</b> ' : ''}Serwer odtworzył ELO od zera (1000) z <b style="color:var(--text)">${r.games}</b> meczów rankingowych zapisanych w historii graczy, w kolejności rozegrania — tym samym wzorem co w grze, dla obu stron każdego meczu. Usuwa skutki błędu zapisu (utracone punkty i fałszywe „porzucone mecze”).</div>
    ${ch.length ? `<div style="display:grid;grid-template-columns:1fr 70px 70px 64px 70px;gap:.3rem;font-size:.7rem;color:var(--muted);padding-bottom:.2rem;border-bottom:1px solid var(--border)"><span>Gracz</span><span>Teraz</span><span>Po przeliczeniu</span><span>Zmiana</span><span>Bilans</span></div>
      ${r.rows.map(x => `<div style="display:grid;grid-template-columns:1fr 70px 70px 64px 70px;gap:.3rem;padding:.25rem 0;border-bottom:1px solid var(--border);${x.diff ? '' : 'opacity:.55'}"><b>${_h(x.name)}</b><span>${r.applied ? '—' : x.now}</span><span><b>${x.calc}</b></span><span style="color:${x.diff > 0 ? 'var(--win)' : x.diff < 0 ? 'var(--loss)' : 'var(--muted)'}">${x.diff ? sgn(x.diff) : '0'}</span><span>${x.rkCalc.w}-${x.rkCalc.l}${x.rkCalc.d ? '-' + x.rkCalc.d : ''}</span></div>`).join('')}`
      : `<div style="color:var(--win)">✅ Wszystkie ELO zgadzają się z historią meczów — nic do poprawy.</div>`}
    ${!r.applied && ch.length ? `<div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.8rem"><button class="btn btn-ghost" onclick="_fxClose('elorc-modal')">Anuluj</button><button class="btn btn-primary" onclick="openEloRecalc(true)">✅ Zastosuj (${ch.length} graczy)</button></div>` : ''}</div>`;
}
async function openKortBalance() {
  const m = _fxModal('kbal-modal', 820); m.classList.add('open'); m.querySelector('.modal').innerHTML = _fxHead('kbal-modal', '🃏 Kort — balans') + '⏳';
  const r = await _api('/kort/balance', 'GET', null, { admin: true }); if(!r.ok) { m.querySelector('.modal').innerHTML = _fxHead('kbal-modal', '🃏 Kort — balans') + '❌ ' + _h(r.error || ''); return; }
  const flag = x => x.g >= 20 && (x.wr >= 65 || x.wr <= 35) ? `<b style="color:${x.wr >= 65 ? 'var(--loss)' : '#60a5fa'}">${x.wr >= 65 ? '⚠ za mocne?' : '⚠ za słabe?'}</b>` : '';
  const row = (l, x, extra = '') => `<div style="display:grid;grid-template-columns:1fr 60px 60px ${extra ? '60px ' : ''}110px;gap:.4rem;font-size:.8rem;padding:.22rem 0;border-bottom:1px solid var(--border)"><span>${l}</span><span>${x.g}</span><b>${x.wr}%</b>${extra}<span>${flag(x)}</span></div>`;
  const fw = r.first.g ? Math.round(r.first.w / r.first.g * 100) : null;
  m.querySelector('.modal').innerHTML = _fxHead('kbal-modal', '🃏 Kort — balans') + `<div data-notr style="font-size:.8rem">
    <div style="color:var(--muted);margin-bottom:.6rem">Wszystkie rozegrane mecze: <b style="color:var(--text)">${r.games}</b> · ${Object.entries(r.modes).map(([k, x]) => `${({ daily: '⚔️ mecz dnia', ranked: '🏆 ranking', boss: '👑 boss' })[k] || k}: ${x.g} (${Math.round(x.w / x.g * 100)}% wygranych graczy)`).join(' · ')}${fw !== null ? ` · zaczynający wygrywa <b style="color:var(--text)">${fw}%</b>` : ''}</div>
    <div style="font-size:.74rem;color:var(--muted);margin-bottom:.7rem">Procent wygranych graczy, w których talii była dana odznaka lub karta. W meczu dnia rywal jest dopasowany do siły, więc ~50% to dobry balans. Oznaczenia ⚠ pojawiają się od 20 meczów.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:.9rem">
      <div><b>🏅 Odznaki</b><div style="display:grid;grid-template-columns:1fr 60px 60px 110px;gap:.4rem;font-size:.66rem;color:var(--muted);margin-top:.3rem"><span></span><span>mecze</span><span>wygr.</span><span></span></div>${r.badges.map(x => row(`${_KB[x.k] || ''} ${_kbName(x.k)}`, x)).join('') || '—'}</div>
      <div><b>🃏 Karty (najczęściej grane)</b><div style="display:grid;grid-template-columns:1fr 60px 60px 60px 110px;gap:.4rem;font-size:.66rem;color:var(--muted);margin-top:.3rem"><span></span><span>mecze</span><span>wygr.</span><span>pkt/m</span><span></span></div>${r.cards.slice(0, 30).map(x => row(_h(x.k), x, `<span>${x.pts}</span>`)).join('') || '—'}</div>
    </div></div>`;
}
// ═══ 🎨 KORT — grafika: boisko w barwach rywala, rewersy i dobieranie, przeciąganie kart, ekran zwycięstwa, „żywe” karty ═══
function _kortCourt() { // motyw boiska: drużyna (jej kolor i logo), boss (złoto-czarny), ranking (kolor dywizji rywala)
  const o = _kort.opp || {};
  if(_kort.mode === 'boss') return { tint: 'rgba(245,197,24,.16)', wood: ['#2a2216', '#33291a', '#241d12'], line: '#f5c518', center: '<span style="font-size:1.6rem">👑</span>' };
  if(o.team) { const c = teamColor(o.team); return { tint: c + '38', wood: null, line: c, center: teamLogo(o.team, 46, '.8rem') }; }
  if(_kort.mode === 'ranked' && o.div) { const c = (_KDIV[o.div] || _KDIV.bronze)[3]; return { tint: c + '2e', wood: null, line: c, center: '<span style="font-size:1.4rem">' + (_KDIV[o.div] || _KDIV.bronze)[0] + '</span>' }; }
  return { tint: null, wood: null, line: 'rgba(255,255,255,.85)', center: '🏀' };
}
function _kortFxFor(side) { // po zagraniu: błysk karty z działającą odznaką, „trafienie” osłabionej karty rywala
  const l = _kort.st.log[_kort.st.log.length - 1]; if(!l || l.pass || l.quarter) return;
  const c = KORT_ROWS.flatMap(r => _kort.st.p[side].board[r]).find(x => x.name === l.card && x.id === _kort.lastId) || _kort.st.p[side].board[l.row].slice(-1)[0];
  const act = (c?.badges || []).filter(b => _KBROW[b.key] === l.row || _KBROW[b.key] === '*' || (_KBROW[b.key] === 'q3' && _kort.st.q === 3));
  _kort.fx = { glowId: act.length ? c.id : null, pop: act.map(b => _KB[b.key]).join(''), hit: (l.ev || []).map(e => e.slice(2).replace(/\s−\d+$/, '').trim()), hitSide: 1 - side, n: _kort.st.log.length };
}
function _kortCelebrate(box) { // konfetti na wygraną
  if(!box || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['#f5c518', '#4ade80', '#38bdf8', '#f472b6', '#a855f7', '#fb923c'];
  box = document.body; document.querySelector('body > .kc-confetti')?.remove(); // osobna warstwa — przerysowanie planszy jej nie kasuje
  box.insertAdjacentHTML('beforeend', `<div class="kc-confetti">${[...Array(70)].map(() => `<i style="left:${Math.random() * 100}%;background:${cols[Math.floor(Math.random() * cols.length)]};animation-delay:${(Math.random() * .6).toFixed(2)}s;animation-duration:${(1.8 + Math.random() * 1.4).toFixed(2)}s;transform:rotate(${Math.floor(Math.random() * 360)}deg)"></i>`).join('')}</div>`);
  setTimeout(() => document.querySelector('body > .kc-confetti')?.remove(), 3600);
}
async function _kortMvpCard() { // karta MVP meczu na ekranie końcowym (holo)
  const box = document.getElementById('k-mvp'); if(!box) return; const mvp = Object.entries(_kort.st.contrib?.[0] || {}).sort((a, b) => b[1] - a[1])[0]; if(!mvp) { box.remove(); return; }
  const d = _pcData(mvp[0], 'season'); if(!d) return;
  try { const url = await _pcImage(d, currentLang === 'en' ? 'en' : 'pl', true); if(!url || !document.getElementById('k-mvp')) return;
    box.innerHTML = `<div style="font-size:.72rem;font-weight:800;letter-spacing:1px;color:#f5c518;margin-bottom:.35rem">⭐ MVP ${currentLang === 'en' ? 'OF THE MATCH' : 'MECZU'} · ${mvp[1]} ${currentLang === 'en' ? 'pts' : 'pkt'}</div><div style="max-width:230px;margin:0 auto">${_holoHtml(url, mvp[0], 1)}</div>`; _holoBind(box); } catch(e) {}
}
// ✋ przeciąganie karty z ławki na rząd (mysz i dotyk)
function _kortBindDrag(root) {
  const st = _kort.st; if(st.over || st.turn !== 0 || st.p[0].passed || _kortBusy) return;
  root.querySelectorAll('[data-kid]').forEach(w => w.addEventListener('pointerdown', e => {
    if(e.target.closest('button') || e.button > 0) return;
    const id = w.dataset.kid, card = st.p[0].hand.find(c => c.id === id); if(!card) return;
    const touch = e.pointerType === 'touch', sx = e.clientX, sy = e.clientY;
    if(!touch) e.preventDefault();
    const r0 = w.getBoundingClientRect(), dx = e.clientX - r0.left, dy = e.clientY - r0.top;
    let ghost = null, lane = null;
    const startDrag = () => { ghost = w.cloneNode(true); ghost.classList.add('kc-ghost'); Object.assign(ghost.style, { position: 'fixed', left: r0.left + 'px', top: r0.top + 'px', width: r0.width + 'px', zIndex: 9999, pointerEvents: 'none' }); document.body.appendChild(ghost); w.style.opacity = '.35'; };
    if(!touch) startDrag();
    const gain = row => { const s = JSON.parse(JSON.stringify(st)); s.turn = 0; kortPlay(s, 0, id, row); return kortTotal(s, 0) - kortTotal(st, 0); };
    const move = ev => {
      if(!ghost) { const mx = ev.clientX - sx, my = ev.clientY - sy; if(Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my)) return up(true); if(my < -10 && Math.abs(my) > Math.abs(mx)) startDrag(); else return; } // dotyk: w bok = przewijanie, w górę = przeciąganie
      ev.preventDefault?.(); ghost.style.left = (ev.clientX - dx) + 'px'; ghost.style.top = (ev.clientY - dy) + 'px';
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.kc-lane[data-side="0"]');
      if(el !== lane) { root.querySelectorAll('.kc-drop').forEach(x => { x.classList.remove('kc-drop'); x.removeAttribute('data-gain'); }); lane = el; if(lane) { lane.classList.add('kc-drop'); lane.setAttribute('data-gain', '+' + gain(lane.dataset.row)); } } };
    const onCancel = () => up(true);
    const up = (cancel) => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', onCancel); ghost?.remove(); w.style.opacity = '';
      root.querySelectorAll('.kc-drop').forEach(x => x.classList.remove('kc-drop')); if(lane && ghost && cancel !== true) kortHumanPlay(id, lane.dataset.row); };
    window.addEventListener('pointermove', move, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', onCancel);
  }));
}
function _kortLiveStop() { clearInterval(_kortLivePoll); _kortLivePoll = null; }
async function _kortLiveHtml() {
  _kortLiveStop();
  const en = currentLang === 'en', box = inner => `<div class="card" style="padding:1rem 1.1rem" data-notr>${inner}</div>`;
  if(!_kortLiveCode) return box(`<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🤝 ${_g('MECZ Z KOLEGĄ NA ŻYWO', 'LIVE MATCH WITH A FRIEND')}</div>
    <div style="font-size:.86rem;line-height:1.55;margin:.4rem 0 .7rem">${_g('Rzuć wyzwanie, wyślij link koledze na Discordzie i grajcie razem, tura po turze. Na ruch masz 75 sekund. Mecz towarzyski — bez nagród, ale trafia do Twoich statystyk.', 'Send a challenge link to a friend on Discord and play together, turn by turn. You have 75 seconds per move. Friendly match — no rewards, but it counts in your stats.')}</div>
    ${discordUser?.session ? `<button class="btn btn-primary" onclick="kortLiveNew()">⚔️ ${_g('Rzuć wyzwanie', 'Create a challenge')}</button>` : `<button class="btn btn-primary" onclick="loginWithDiscord()">💬 ${_g('Zaloguj się, żeby grać', 'Log in to play')}</button>`}`);
  const r = await _api('/kort/live/' + _kortLiveCode, 'GET', null, discordUser?.session ? { session: true } : {}).catch(() => ({}));
  if(!r.ok) { const c = _kortLiveCode; _kortLiveCode = null; return box(`<div style="color:var(--muted)">❌ ${_h(_tr(r.error || ''))} (${_h(c)})</div><button class="btn btn-ghost" style="margin-top:.5rem" onclick="renderKort()">↩ ${_g('Wróć', 'Back')}</button>`); }
  if(r.state === 'live' || r.state === 'over') { if(r.side !== null && r.st) { setTimeout(() => kortLiveStart(r), 50); return box(`⏳ ${_g('Wczytuję mecz…', 'Loading the match…')}`); } return box(`<div style="color:var(--muted)">${_g('Ten mecz już trwa między innymi graczami.', 'This match is already being played by others.')}</div>`); }
  const m = KORT_MODS[r.mod], link = `${location.origin}/duel-${r.code}`;
  if(r.side === 0) { _kortLivePoll = setInterval(async () => { const x = await _api('/kort/live/' + r.code, 'GET', null, { session: true }).catch(() => ({})); if(x.ok && x.state === 'live') { _kortLiveStop(); kortLiveStart(x); } }, 2000);
    return box(`<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">⏳ ${_g('CZEKAM NA RYWALA', 'WAITING FOR AN OPPONENT')}</div>
      <div style="font-size:.86rem;margin:.4rem 0">${_g('Wyślij ten link koledze — mecz zacznie się, gdy przyjmie wyzwanie:', 'Send this link to a friend — the match starts when they accept:')}</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center"><code style="background:var(--surface2);padding:.35rem .6rem;border-radius:8px;font-size:.86rem">${_h(link)}</code>
        <button class="btn btn-primary" onclick="navigator.clipboard?.writeText('${_h(link)}').then(()=>showToast('🔗 ${_g('Link skopiowany', 'Link copied')}','success'))">🔗 ${_g('Kopiuj link', 'Copy link')}</button>
        <button class="btn btn-ghost" onclick="kortLiveCancel('${r.code}')">✕ ${_g('Anuluj', 'Cancel')}</button></div>
      ${m ? `<div style="font-size:.76rem;color:var(--muted);margin-top:.5rem">🎲 ${m.icon} ${(en ? m.en : m.pl).join(' — ')}</div>` : ''}`); }
  return box(`<div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">⚔️ ${_g('WYZWANIE', 'CHALLENGE')}</div>
    <div style="display:flex;gap:.6rem;align-items:center;margin:.5rem 0">${_avatarHtml(r.host.avatar, 40)}<div><b style="font-size:1.05rem">${_h(r.host.name)}</b><div style="font-size:.8rem;color:var(--muted)">${_g('wyzywa Cię na mecz w Korcie!', 'challenges you to a Kort match!')}</div></div></div>
    <div style="display:flex;flex-wrap:wrap;gap:.25rem;margin-bottom:.6rem">${(r.hostDeck || []).map(n => `<span style="font-size:.7rem;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:.08rem .35rem">${_h(n)}</span>`).join('')}</div>
    ${m ? `<div style="font-size:.78rem;margin-bottom:.6rem">🎲 ${m.icon} ${(en ? m.en : m.pl).join(' — ')}</div>` : ''}
    ${discordUser?.session ? `<button class="btn btn-primary" onclick="kortLiveJoin('${r.code}')">⚔️ ${_g('Przyjmij wyzwanie', 'Accept the challenge')}</button>` : `<button class="btn btn-primary" onclick="try{history.replaceState(null,'','/duel-${r.code}')}catch(e){};loginWithDiscord()">💬 ${_g('Zaloguj się, żeby przyjąć', 'Log in to accept')}</button>`}`);
}
async function kortLiveNew() {
  const deck = _kortMyDeck(); const r = await _api('/kort/live/new', 'POST', { deck }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _kortLiveCode = r.code; renderKort();
}
async function kortLiveCancel(code) { await _api('/kort/live/cancel', 'POST', { code }, { session: true }).catch(() => {}); _kortLiveCode = null; renderKort(); }
async function kortLiveJoin(code) {
  const r = await _api('/kort/live/join', 'POST', { code, deck: _kortMyDeck() }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  const x = await _api('/kort/live/' + code, 'GET', null, { session: true }); if(x.ok) kortLiveStart(x);
}
function kortLiveStart(r) {
  const opp = r.side === 0 ? r.guest : r.host;
  _kort = { mode: 'live', live: { code: r.code, side: r.side, turnLeft: r.turnLeft, at: Date.now() }, st: r.st, opp: { name: opp?.name || '?', icon: '🤝' }, claimed: true, logged: true, tips: false, deckNames: [], badgeCounts: {} };
  _kortDraw(); document.getElementById('kort-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  _kortLiveStop(); _kortLivePoll = setInterval(_kortLiveTick, 1500);
}
async function _kortLiveTick() {
  if(!_kort || _kort.mode !== 'live' || !document.getElementById('kort-board')) { _kortLiveStop(); return; }
  const x = await _api('/kort/live/' + _kort.live.code, 'GET', null, { session: true }).catch(() => ({})); if(!x.ok || !x.st) return;
  const changed = x.st.log.length !== _kort.st.log.length || x.st.over !== _kort.st.over;
  _kort.live.turnLeft = x.turnLeft; _kort.live.at = Date.now();
  if(changed) { const before = _kort.st.log.length; _kort.st = x.st; const l = x.st.log[x.st.log.length - 1];
    if(l && l.side === 1 && x.st.log.length > before) { if(l.pass) _kSfx('pass'); else { _kort.lastId = KORT_ROWS.flatMap(r => _kort.st.p[1].board[r]).slice(-1)[0]?.id; _kortFxFor(1); _kSfx('opp'); } } }
  if(x.abandoned && !_kort.abandonNote) { _kort.abandonNote = true; showToast(_g('⏱ Mecz zakończony — brak ruchów przez 10 minut', '⏱ Match ended — no moves for 10 minutes'), 'info'); }
  _kortDraw(); if(x.st.over) _kortLiveStop();
}
async function _kortLiveMove(action, id, row) {
  if(_kort._sending) return; _kort._sending = true;
  const r = await _api('/kort/live/move', 'POST', { code: _kort.live.code, action, id, row }, { session: true }).catch(() => ({})); _kort._sending = false;
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  _kort.st = r.st; _kort.live.turnLeft = r.turnLeft; _kort.live.at = Date.now();
  if(action === 'pass') _kSfx('pass'); else { _kort.lastId = id; _kortFxFor(0); _kSfx('play'); } _kortDraw();
}
// ═══ 🃏 KORT — mecze liczone na serwerze (ranking, boss, draft) + 🎴 DRAFT ═══
async function kortStartServer(mode, extra = {}) {
  if(!discordUser?.session) { showToast(_g('Zaloguj się przez Discord', 'Log in with Discord'), 'info'); return; }
  if(_kort?._starting) return; window._kortStarting = true;
  const keys = (() => { try { return JSON.parse(localStorage.getItem('kort_deck') || '[]'); } catch(e) { return []; } })();
  const r = await _api('/kort/match/start', 'POST', { mode, keys, coach: _coachSel(), ...extra }, { session: true }).catch(() => ({})); window._kortStarting = false;
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  const opp = mode === 'ranked' ? { id: _kortOppPick?.id, name: r.oppName, icon: '🏆', div: _kortOppPick?.div } : mode === 'boss' ? { name: _g('Dream Team ligi', 'League Dream Team'), icon: '👑' } : { name: r.oppName, icon: '🎴' };
  const bc = {}; r.my.forEach(c => (c.badges || []).forEach(b => bc[b.key] = (bc[b.key] || 0) + 1));
  const games = +localStorage.getItem('kort_games') || 0;
  _kort = { serverId: r.id, moves: [], deckNames: r.my.map(c => c.name), badgeCounts: bc, deckSrc: r.my, st: kortNew(r.my, r.opp, r.seed, r.mod, r.myCoach || null, r.oppCoach || null), opp, mode, claimed: false, tips: localStorage.getItem('kort_tips') ? localStorage.getItem('kort_tips') === '1' : games < 3 };
  if(mode === 'draft' && _kortTab === 'draft') await renderKort(); // panel draftu: bez przycisku „Graj” w trakcie meczu
  _kortDraw(); document.getElementById('kort-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); _kortBot();
}
function _kortDraftEndHtml() { // po meczu draftu: aktualny bilans i od razu następny mecz
  const d = _kort.draftRun || null, en = currentLang === 'en';
  if(!d) return `<div style="font-size:.8rem;color:var(--muted);margin:.5rem 0">⏳ ${en ? 'Saving the result…' : 'Zapisuję wynik…'}</div>`;
  if(d.done) return `<div class="card" style="padding:.6rem .8rem;margin:.6rem auto;max-width:420px"><b>🏁 ${en ? 'Draft over' : 'Koniec draftu'}: ${d.w}–${d.l}</b>${_kortRewardTxt(d.reward)}</div>`;
  return `<div style="margin:.6rem 0 .2rem;font-size:.86rem">🎴 Draft: <b>${d.w}–${d.l}</b> <span style="color:var(--muted)">(${en ? 'ends at 3 losses or 7 wins' : 'koniec przy 3 porażkach albo 7 wygranych'})</span></div>
    <button class="btn btn-primary" style="margin-top:.4rem" onclick="kortStartServer('draft')">⚔️ ${en ? 'Next match' : 'Następny mecz'} #${d.games + 1}</button> `;
}
async function _kortServerEnd() { // wynik liczy serwer, odtwarzając mecz z ruchów gracza
  const r = await _api('/kort/match/end', 'POST', { id: _kort.serverId, moves: _kort.moves }, { session: true }).catch(() => ({}));
  if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; }
  if(_kort.mode === 'ranked') showToast(`🏆 ${r.delta >= 0 ? '+' : ''}${r.delta} ELO → ${r.elo}${r.promoted ? ' · ' + _g('awans', 'promoted') + ': ' + r.promoted : ''}`, 'success');
  if(_kort.mode === 'boss' && r.reward) showToast(_g('👑 Boss pokonany! 💎 Paczka premium jest Twoja', '👑 Boss beaten! The 💎 premium pack is yours'), 'success');
  if(_kort.mode === 'draft' && r.run) { _kortDraftRun = r.run; _kort.draftRun = r.run; setTimeout(_kortDraw, 50); if(r.run.done) showToast(_g(`🎴 Koniec draftu: ${r.run.w}-${r.run.l}`, `🎴 Draft over: ${r.run.w}-${r.run.l}`) + _kortRewardTxt(r.run.reward), 'success'); }
}
async function _kortDraftHtml() {
  if(!discordUser?.session) return `<div class="card" style="padding:1rem;color:var(--muted)">${_g('Zaloguj się, żeby zagrać w drafcie.', 'Log in to play the draft.')}</div>`;
  _kortDraftInfo = await _api('/kort/draft', 'GET', null, { session: true }).catch(() => ({})); const d = _kortDraftRun = _kortDraftInfo.run, en = currentLang === 'en';
  const rewards = `<div style="font-size:.78rem;line-height:1.7">${(_kortDraftInfo.lean ? [[0, '+10 XP'], [3, '+20 XP'], [5, '🎁 ' + _g('paczka', 'pack')], [7, '💎 ' + _g('paczka premium', 'premium pack')]] : [[0, '+10 XP'], [2, '🎁 ' + _g('paczka', 'pack')], [4, '🎁🎁 ' + _g('2 paczki', '2 packs')], [6, '💎 ' + _g('paczka premium', 'premium pack')], [7, '💎 + 🎁']]).map(([t, l]) => `<div>${t}+ ${_g('wygranych', 'wins')} → <b>${l}</b></div>`).join('')}</div>`;
  const intro = `<div class="card" style="padding:.9rem 1rem;background:linear-gradient(135deg,rgba(56,189,248,.15),rgba(168,85,247,.1))"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#38bdf8">🎴 DRAFT</div>
    <div style="font-size:.85rem;line-height:1.55;margin:.3rem 0 .6rem">${_g('Wybierasz 8 kart — za każdym razem <b>1 z 3</b> losowych graczy ligi. Potem grasz serię meczów z rywalami o podobnej sile, <b>aż do 3 porażek albo 7 wygranych</b>. Twoja kolekcja nie ma znaczenia — liczy się wybór i taktyka. Jeden draft dziennie.', 'Pick 8 cards — each time <b>1 of 3</b> random league players. Then play a series against similar-strength opponents <b>until 3 losses or 7 wins</b>. Your collection doesn’t matter — picks and tactics do. One draft a day.')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;align-items:start">${rewards}<div style="font-size:.74rem;color:var(--muted)">🏆 ${_g('Najlepsi w tym tygodniu', 'Best this week')}:<br>${(_kortDraftInfo.best || []).map((x, i) => `${i + 1}. ${_h(x.name)} — <b style="color:var(--text)">${x.w}</b>`).join('<br>') || '—'}</div></div>`;
  if(!d || d.done) return `${intro}${d?.done ? `<div style="margin-top:.6rem;font-size:.84rem">${_g('Ostatni draft', 'Last draft')}: <b>${d.w}-${d.l}</b>${_kortRewardTxt(d.reward)}</div>` : ''}
    <div style="margin-top:.7rem">${_kortDraftInfo.canNew ? `<button class="btn btn-primary" onclick="kortDraftNew()">🎴 ${_g('Rozpocznij draft', 'Start a draft')}</button>` : `<span style="font-size:.8rem;color:var(--muted)">${_g('Kolejny draft jutro.', 'Next draft tomorrow.')}</span>`}</div></div>`;
  if(d.deck.length < 8) { const opts = d.options || [];
    return `${intro}</div><div class="card" style="padding:.9rem 1rem;margin-top:.8rem"><div style="font-weight:800;margin-bottom:.5rem">${_g('Wybór', 'Pick')} ${d.deck.length + 1}/8 — ${_g('wybierz jednego', 'choose one')}</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,150px));gap:.7rem;justify-content:center">${opts.map((n, i) => { const src = _kortSrc(n), info = src ? _kortPickInfo('x', { name: n }) : ''; return `<button onclick="kortDraftPick(${i})" style="padding:0;border:none;background:none;cursor:pointer;font-family:inherit">${_miniCard({ name: n, team: src?.team, tier: src?.tier, rating: src?.rating, body: info })}</button>`; }).join('')}</div>
      ${d.deck.length ? `<div style="font-size:.76rem;color:var(--muted);margin-top:.7rem">${_g('Twoja talia', 'Your deck')}: ${d.deck.map(_h).join(', ')}</div>` : ''}</div>`; }
  if(_kort?.mode === 'draft' && !_kort.dismissed) return `${intro}</div><div class="card" style="padding:.7rem 1rem;margin-top:.8rem;font-size:.84rem;color:var(--muted)">🎴 ${_g('Mecz draftu jest poniżej — po jego zakończeniu zobaczysz bilans i przycisk następnego meczu.', 'Your draft match is below — when it ends you’ll see the record and the next-match button.')}</div>`;
  return `${intro}</div><div class="card" style="padding:.9rem 1rem;margin-top:.8rem;display:flex;justify-content:space-between;align-items:center;gap:.8rem;flex-wrap:wrap">
    <div><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.8rem;line-height:1">${d.w} – ${d.l}</div><div style="font-size:.74rem;color:var(--muted)">${_g('wygrane – porażki (koniec przy 3 porażkach albo 7 wygranych)', 'wins – losses (ends at 3 losses or 7 wins)')}</div>
      <div style="font-size:.74rem;margin-top:.3rem">${d.deck.map(_h).join(' · ')}</div></div>
    <button class="btn btn-primary" onclick="kortStartServer('draft')">⚔️ ${_g('Graj mecz', 'Play match')} #${d.games + 1}</button></div>`;
}
async function kortDraftNew() { const r = await _api('/kort/draft/new', 'POST', {}, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; } renderKort(); }
async function kortDraftPick(i) { const r = await _api('/kort/draft/pick', 'POST', { i }, { session: true }); if(!r.ok) { showToast('❌ ' + _tr(r.error || ''), 'error'); return; } renderKort(); }
async function _kortCoachSync() { const keys = _kortOwnDeck(); if(keys && discordUser?.session) await _api('/kort/deck', 'POST', { keys, coach: _coachSel() }, { session: true }).catch(() => {}); }
// ranking: karta trenerska w talii na serwerze
function _coachBenchHtml(st) { // kafelek karty trenerskiej na ławce (darmowa akcja)
  const me = st.p[0], t = me.coach; if(!t) return '';
  const c = KORT_COACH[t], en = currentLang === 'en', can = !st.over && st.turn === 0 && !me.passed && !_kortBusy && !me.coachUsed && st.q <= 2;
  const btn = (row, label) => { const ok = can && (() => { const s2 = JSON.parse(JSON.stringify(st)); return kortCoach(s2, 0, row); })(); return `<button ${ok ? '' : 'disabled'} onclick="kortHumanCoach(${row ? `'${row}'` : 'null'})" style="flex:1;padding:.2rem .3rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#fff;font-family:inherit;font-size:.72rem;cursor:${ok ? 'pointer' : 'default'};opacity:${ok ? 1 : .45}">${label}</button>`; };
  return `<div style="width:126px;flex-shrink:0;border-radius:12px;padding:.45rem;background:linear-gradient(160deg,#4c1d95,#1e1b4b);border:2px solid ${me.coachUsed ? '#555' : '#a855f7'};color:#fff;text-align:center;${me.coachUsed ? 'opacity:.5' : ''}" class="kc-handcard">
    <div style="font-size:.6rem;letter-spacing:1px;font-weight:800;color:#d8b4fe">🧑‍🏫 ${en ? 'COACH' : 'TRENER'}</div><div style="font-size:1.6rem;line-height:1.2">${c.icon}</div><div style="font-weight:800;font-size:.74rem">${en ? c.en : c.pl}</div>
    <div style="font-size:.58rem;opacity:.8;margin:.2rem 0 .35rem;min-height:2.2em">${en ? c.den : c.dpl}</div>
    ${me.coachUsed ? `<div style="font-size:.7rem">✓ ${en ? 'used' : 'użyta'}</div>` : c.row ? `<div style="display:flex;gap:.2rem">${KORT_ROWS.map(r => btn(r, _KR[r][0])).join('')}</div>` : btn(null, en ? 'Use' : 'Użyj')}</div>`;
}
function kortHumanCoach(row) { if(!_kort || _kortBusy) return; if(kortCoach(_kort.st, 0, row || null)) { if(_kort.moves) _kort.moves.push({ t: 'c', row: row || null }); _kort.coachUsed = true; _kSfx('round'); _kortDraw(); } }
async function _kortQuestsHtml() {
  if(!discordUser?.session) return '';
  if(!_kortQuests) _kortQuests = await _api('/kort/quests', 'GET', null, { session: true }).catch(() => null);
  const q = _kortQuests; if(!q?.daily) return ''; const en = currentLang === 'en';
  const row = (x, rew) => `<div style="display:grid;grid-template-columns:1fr auto;gap:.5rem;align-items:center;padding:.3rem 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.8rem;${x.done ? 'text-decoration:line-through;color:var(--muted)' : ''}">${x.done ? '✅' : '🎯'} ${_h(en ? x.en : x.pl)}</div>
      <div style="height:5px;background:var(--surface2);border-radius:3px;margin-top:.2rem;overflow:hidden"><div style="height:100%;width:${Math.round(x.p / x.n * 100)}%;background:${x.done ? 'var(--win)' : 'var(--accent)'}"></div></div></div><span style="font-size:.74rem;white-space:nowrap">${x.p}/${x.n} · <b>${rew}</b></span></div>`;
  return `<div class="card" style="padding:.7rem .9rem;margin-bottom:.8rem" data-notr><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.2rem">🎯 ${_g('WYZWANIA KORTU', 'KORT QUESTS')}</div>
    ${q.daily.map(x => row(x, '+' + x.xp + ' XP')).join('')}<div style="font-size:.66rem;color:var(--muted);margin:.35rem 0 .1rem">${_g('Tygodniowe', 'Weekly')}</div>${row(q.weekly, '🎁')}</div>`;
}
function _kortLogExtras() { // dane do wyzwań: 3 z jednej drużyny, runda wygrana samą Obroną, zagrane 🦊/🚫, karta trenerska
  const st = _kort.st, src = (_kort.deckSrc || []), teams = {}; src.forEach(c => { if(c.team) teams[c.team] = (teams[c.team] || 0) + 1; });
  let rows = new Set(), defRound = false, steals = 0;
  st.log.forEach(l => { if(l.quarter) { if(l.score[0] > l.score[1] && rows.size === 1 && rows.has('obr')) defRound = true; rows = new Set(); return; }
    if(l.side === 0 && l.card) { rows.add(l.row); const c = src.find(x => x.name === l.card); if(c && (c.badges || []).some(b => b.key === 'thief' || b.key === 'rim')) steals++; } });
  return { team3: Object.values(teams).some(n => n >= 3), defRound, steals, coachUsed: !!st.p[0].coachUsed };
}
function kortDeckPick() {
  openCardPicker({ title: '🃏 ' + _g('Talia do Kortu (8 kart)', 'Kort deck (8 cards)'), max: 8, exact: true, extra: _kortPickInfo,
    footer: keys => { const r = keys.map(k => (_cardScope(k) && _pcData(_cards?.cards?.[k]?.name, _cardScope(k))?.rating) ?? (_cards?.pool || []).find(p => p.k === k)?.rating ?? _pcData(_cards?.cards?.[k]?.name, 'season')?.rating).filter(Boolean); return r.length ? _g('średnia', 'avg') + ' <b>' + Math.round(r.reduce((a, b) => a + b, 0) / r.length) + '</b>' : ''; }, preselect: (() => { try { return JSON.parse(localStorage.getItem('kort_deck') || '[]'); } catch(e) { return []; } })(),
    hint: _g('Wybierz 8 kart różnych graczy. Patrz na umiejętności (atak, rozegranie, obrona) i odznaki.', 'Pick 8 cards of different players. Mind their skills (attack, playmaking, defense) and badges.'),
    onDone: keys => { const names = new Set(); const ok = keys.filter(k => { const n = _normNick(_cards?.cards?.[k]?.name || ''); if(names.has(n)) return false; names.add(n); return true; }); localStorage.setItem('kort_deck', JSON.stringify(ok)); showToast(_g('🃏 Talia zapisana', '🃏 Deck saved'), 'success'); if(ok.length === 8) _kortSaveDeckServer(ok); renderKort(); } });
}
function kortStart(mode = 'daily') {
  if(mode === 'ranked') return kortStartServer('ranked', { opp: _kortOppPick?.id });
  if(mode === 'boss' || mode === 'draft') return kortStartServer(mode);
  const own = _kortOwnDeck(), deck = mode === 'ranked' && own ? own.map(k => _kortSrc(_cards.cards[k].name, { lim: k.startsWith('lim:'), label: _cards.cards[k].label })).filter(Boolean) : _kortMyDeck();
  let opp;
  if(mode === 'ranked') { const o = _kortOppPick; if(!o) return; opp = { id: o.id, name: o.name, icon: '🏆', div: o.div, deck: o.deck.names.map((n, i) => _kortSrc(n, { lim: !!o.deck.lim?.[i], label: o.deck.lim?.[i] || null })).filter(Boolean) };
    if(opp.deck.length < 8) { showToast(_g('Talia rywala zawiera graczy bez statystyk w tym sezonie — wybierz innego', 'The opponent’s deck has players without stats this season — pick another'), 'info'); return; } }
  else if(mode === 'boss') opp = { name: _g('Dream Team ligi', 'League Dream Team'), icon: '👑', deck: _kortBossDeck() };
  else opp = _kortOpponent(deck);
  const games = +localStorage.getItem('kort_games') || 0, seed = _kortDayHash((opp.day || new Date().toISOString().slice(0, 10)) + (discordUser?.id || 'guest') + mode + (opp.id || '')) + (mode === 'daily' && _kortInfo?.me?.today ? Date.now() % 100000 : 0);
  const bc = {}; deck.forEach(c => (c.badges || []).forEach(b => bc[b.key] = (bc[b.key] || 0) + 1));
  _kort = { deckNames: deck.map(c => c.name), badgeCounts: bc, deckSrc: deck, st: kortNew(deck, opp.deck, seed, _kortModToday(), mode === 'daily' ? _coachSel() : null, null), opp, mode, claimed: false, tips: localStorage.getItem('kort_tips') ? localStorage.getItem('kort_tips') === '1' : games < 3 };
  _kortDraw(); document.getElementById('kort-board')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); _kortBot();
}
function _kortCardHtml(st, side, c, row, onBoard) {
  const badges = c.badges.map(b => (_KB[b.key] || '') + (b.b > 1 ? '⁺' : '')).join(''), rt = _pcData(c.name, 'season')?.rating;
  if(onBoard) { const val = kortValue(st, side, row, c);
    const fx = _kort.fx && _kort.fx.n === st.log.length ? _kort.fx : null, glow = fx?.glowId === c.id, hit = fx && side === fx.hitSide && fx.hit.includes(c.name);
    return `<div title="${_h(c.name)}" style="width:70px;position:relative" class="${glow ? 'kc-glow' : ''}${hit ? ' kc-hit' : ''}">${glow && fx.pop ? `<span class="kc-badgepop">${fx.pop}</span>` : ''}${_miniCard({ name: c.name, team: c.team, tier: c.tier, lim: c.lim, size: 's', rating: rt,
      body: `<div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.3rem;line-height:1;color:${c.mod < 0 ? '#fca5a5' : '#fff'}">${val}</div><div style="font-size:.55rem;line-height:1">${badges}</div>` })}</div>`; }
  const myTurn = st.turn === 0 && !st.over && !st.p[0].passed && !_kortBusy, tac = st.tactics[st.q - 1];
  const hint = myTurn ? _kort?._tip : null;
  const drawn = _kort.seenHand && !_kort.seenHand.has(c.id);
  return `<div data-kid="${c.id}" style="width:126px;flex-shrink:0;touch-action:pan-x pinch-zoom;cursor:${myTurn ? 'grab' : 'default'}" class="kc-handcard${hint?.id === c.id ? ' kc-hint' : ''}${drawn ? ' kc-drawn' : ''}">${_miniCard({ name: c.name, team: c.team, tier: c.tier, lim: c.lim, size: 'm', rating: rt,
    body: `<div style="font-size:.66rem;margin:.1rem 0 .2rem;min-height:.85rem">${badges}${c.form === 'hot' ? ' 🔥' : c.form === 'cold' ? ' ❄️' : ''}</div>
      <div style="display:flex;flex-direction:column;gap:.2rem">${KORT_ROWS.map(r => `<button ${myTurn ? '' : 'disabled'} class="${hint?.id === c.id && hint.row === r ? 'kc-hint-btn' : ''}" onclick="kortHumanPlay('${c.id}','${r}')" style="display:flex;justify-content:space-between;align-items:center;padding:.15rem .4rem;border-radius:6px;border:1px solid ${r === tac ? '#ffd84d' : 'rgba(255,255,255,.18)'};background:${r === tac ? 'rgba(245,197,24,.22)' : 'rgba(0,0,0,.3)'};color:#fff;font-family:inherit;font-size:.72rem;cursor:${myTurn ? 'pointer' : 'default'};opacity:${myTurn ? 1 : .55}"><span>${_KR[r][0]}</span><b>${c.pw[r]}${r === tac ? ' ×2' : ''}</b></button>`).join('')}</div>` })}</div>`;
}
function _kortDraw() {
  const el = document.getElementById('kort-board'); if(!el || !_kort) return; const st = _kort.st, en = currentLang === 'en', tac = st.tactics[st.q - 1];
  _kort._tip = _kortBusy ? null : _kortTip(); // raz na rysowanie (sugerowany ruch liczy silnik bota)
  const tint = { atk: 'rgba(239,68,68,.20)', roz: 'rgba(59,130,246,.20)', obr: 'rgba(34,197,94,.20)' };
  const lane = (side, r) => `<div class="kc-lane${r === tac ? ' kc-tac' : ''}" data-side="${side}" data-row="${r}" style="background:${tint[r]}">
      <div class="kc-lbl">${_KR[r][0]} ${en ? _KR[r][2] : _KR[r][1]}${r === tac ? '<br><b>×2</b>' : ''}</div>
      <div class="kc-cards">${st.p[side].board[r].map(c => `<div class="${c.id === _kort.lastId ? 'kc-pop' : ''}">${_kortCardHtml(st, side, c, r, true)}</div>`).join('')}</div>
      <div class="kc-sum">${kortRowSum(st, side, r)}</div></div>`;
  const dots = n => '<span class="kc-dot on"></span>'.repeat(n) + '<span class="kc-dot"></span>'.repeat(Math.max(0, 2 - n));
  _kortFx();
  const last = st.log.slice(-2).map((l, i, a) => `<div class="${i === a.length - 1 && st.log.length !== _kort.lastLogN ? 'kc-com' : ''}" style="${i === a.length - 1 ? '' : 'opacity:.55;font-size:.72rem'}">${_kortComment(l, st.log.length - a.length + i)}</div>`).join(''); _kort.lastLogN = st.log.length;
  const bn = _kort.banner && Date.now() - _kort.banner.at < 1700 ? _kort.banner : null;
  const t0 = kortTotal(st, 0), t1 = kortTotal(st, 1);
  el.innerHTML = `<div data-notr class="kc-wrap">
    <div class="kc-board-top">
      <div class="kc-team"><div class="kc-tname">🧑 ${en ? 'YOU' : 'TY'}</div><div class="kc-dots">${dots(st.p[0].wins)}</div></div>
      <div class="kc-led"><div class="kc-led-n" style="color:${t0 >= t1 ? '#4ade80' : '#ffd84d'}">${String(t0).padStart(2, '0')}</div>
        <div class="kc-led-mid"><div>${en ? 'ROUND' : 'RUNDA'} ${st.q}/3</div><div class="kc-led-tac">${en ? _KT[tac][1] : _KT[tac][0]} · ${_KR[tac][0]}×${(st.cfg || KORT_CFG).tacticMult}</div>${st.mod && KORT_MODS[st.mod] ? `<div class="kc-led-tac" style="color:#93c5fd">${KORT_MODS[st.mod].icon} ${(en ? KORT_MODS[st.mod].en : KORT_MODS[st.mod].pl)[0]}</div>` : ''}</div>
        <div class="kc-led-n" style="color:${t1 > t0 ? '#f87171' : '#ffd84d'}">${String(t1).padStart(2, '0')}</div></div>
      <div class="kc-team kc-right"><div class="kc-tname">${_kort.mode === 'live' ? '🤝' : '🤖'} ${_h(_kort.opp.name)}</div><div class="kc-dots">${dots(st.p[1].wins)}<button onclick="localStorage.setItem('kort_sound',localStorage.getItem('kort_sound')==='0'?'1':'0');_kortDraw()" title="${en ? 'Sound' : 'Dźwięk'}" style="margin-left:.4rem;background:none;border:none;cursor:pointer;font-size:.9rem">${localStorage.getItem('kort_sound') === '0' ? '🔇' : '🔊'}</button></div></div>
    </div>
    <div class="kc-opp-info"><div class="kc-opp-hand">${st.p[1].hand.map(() => _kortBack(26)).join('')}</div><span>${_h(_kort.opp.icon)} ${st.p[1].hand.length} ${en ? 'in hand' : 'w ręce'} · 🂠 ${st.p[1].deck.length} ${en ? 'in deck' : 'w talii'}${st.p[1].passed ? ` · <span class="kc-passed">${en ? 'PASSED' : 'SPASOWAŁ'}</span>` : ''}${st.p[1].coach ? ` · 🧑‍🏫 ${_coachName(st.p[1].coach)}${st.p[1].coachUsed ? ' ✓' : ''}` : ''}</span></div>
    <div class="kc-court" style="${(() => { const c = _kortCourt(); return `border-color:${c.line};${c.tint ? `background:linear-gradient(${c.tint},${c.tint}),linear-gradient(rgba(20,10,0,.28),rgba(20,10,0,.28)),repeating-linear-gradient(90deg,${(c.wood || ['#b8743f', '#c3804a', '#ad6c3a'])[0]} 0 44px,${(c.wood || ['#b8743f', '#c3804a', '#ad6c3a'])[1]} 44px 88px,${(c.wood || ['#b8743f', '#c3804a', '#ad6c3a'])[2]} 88px 132px)` : ''}`; })()}">
      ${bn ? `<div class="kc-banner ${bn.good ? 'good' : 'bad'}"><div>${bn.txt}</div><small>${bn.sub}</small></div>` : ''}
      <div class="kc-half">${['obr', 'roz', 'atk'].map(r => lane(1, r)).join('')}</div>
      <div class="kc-mid" style="--kc-line:${_kortCourt().line}"><div class="kc-circle" style="border-color:${_kortCourt().line}">${_kortCourt().center}</div></div>
      <div class="kc-half">${['atk', 'roz', 'obr'].map(r => lane(0, r)).join('')}</div>
    </div>
    <div class="kc-log">${last || '&nbsp;'}</div>
    ${!st.over ? (() => { const tip = _kort._tip; return `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin:.1rem 0 .45rem">${tip ? `<div class="kc-tip">💡 ${tip.t || tip}</div>` : '<span></span>'}<button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .45rem;white-space:nowrap" onclick="_kort.tips=!_kort.tips;localStorage.setItem('kort_tips',_kort.tips?'1':'0');_kortDraw()">💡 ${_kort.tips ? (en ? 'Hide tips' : 'Ukryj podpowiedzi') : (en ? 'Show tips' : 'Podpowiedzi')}</button></div>`; })() : ''}
    ${st.over ? _kortEndHtml() : `<div class="kc-bench">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.4rem">
        <span style="font-size:.82rem">${_kortBack(20)} <span style="color:var(--muted);font-size:.72rem;margin-right:.4rem">${st.p[0].deck.length}</span>${_kort.mode === 'live' && _kort.live?.turnLeft != null ? `<b class="kc-timer" style="margin-right:.4rem">⏱ ${Math.max(0, Math.ceil((_kort.live.turnLeft - (Date.now() - _kort.live.at)) / 1000))}s</b>` : ''}${st.turn === 0 && !st.p[0].passed ? '👉 ' + (en ? 'Your turn — drag a card onto a row or tap a row button' : 'Twoja tura — przeciągnij kartę na rząd albo kliknij przycisk rzędu') : st.p[0].passed ? (_kort.mode === 'live' ? (en ? 'You passed — your opponent is playing…' : 'Spasowałeś — gra rywal…') : (en ? 'You passed — the bot is playing…' : 'Spasowałeś — gra bot…')) : _kort.mode === 'live' ? '⏳ ' + (en ? `${_h(_kort.opp.name)} is thinking…` : `${_h(_kort.opp.name)} myśli…`) : '🤖 ' + (en ? 'Bot is thinking…' : 'Bot myśli…')}</span>
        <button class="btn btn-ghost" ${st.turn === 0 && !st.p[0].passed && !_kortBusy ? '' : 'disabled'} onclick="kortHumanPass()">✋ ${en ? 'Pass' : 'Pasuj'}</button></div>
      <div class="kc-handrow" style="display:flex;gap:.5rem;overflow-x:auto;padding-bottom:.3rem">${_coachBenchHtml(st)}${st.p[0].hand.map(c => _kortCardHtml(st, 0, c, null, false)).join('')}</div></div>`}
  </div>`;
  _kort.seenHand = new Set(st.p[0].hand.map(c => c.id)); _kortBindDrag(el);
  if(st.over && !_kort.endShown) { _kort.endShown = true; _kortMvpCard(); if(st.result === 0) _kortCelebrate(el.querySelector('.kc-wrap')); } else if(st.over) _kortMvpCard();
}
function _kortEndHtml() {
  const st = _kort.st, en = currentLang === 'en', r = st.result === 0 ? 'win' : st.result === 1 ? 'loss' : 'draw';
  const score = st.p[0].wins + ':' + st.p[1].wins, qs = st.p[0].qScores.map((x, i) => x + ':' + st.p[1].qScores[i]).join(', ');
  if(!_kort.logged) { _kort.logged = true; const kk0 = _kort; kk0.logX = _kortLogExtras(); if(discordUser?.session) setTimeout(() => Promise.resolve(kk0.modePromise).catch(() => {}).finally(() => _api('/kort/log', 'POST', { mode: kk0.mode, result: r, score, opp: kk0.opp.name, deck: kk0.deckNames, contrib: st.contrib?.[0] || {}, badges: kk0.badgeCounts, first: st.first === 0, ...kk0.logX }, { session: true }).then(x => { if(x?.questView) _kortQuests = x.questView; (x?.quests || []).forEach((q, i) => setTimeout(() => showToast(`🎯 ${_g('Wyzwanie ukończone', 'Quest complete')}: ${currentLang === 'en' ? q.en : q.pl} · ${q.xp ? '+' + q.xp + ' XP' : '🎁 ' + _g('paczka', 'pack')}`, 'success'), 1200 + i * 1500)); }).catch(() => {})), 0); } // zapis historii dopiero po rozliczeniu meczu (bez nadpisywania ELO/paczek)
  if(!_kort.claimed && _kort.mode !== 'daily') { _kort.claimed = true; localStorage.setItem('kort_games', String((+localStorage.getItem('kort_games') || 0) + 1));
    if(_kort.serverId) _kort.modePromise = _kortServerEnd(); }
  if(!_kort.claimed) { _kort.claimed = true; localStorage.setItem('kort_games', String((+localStorage.getItem('kort_games') || 0) + 1)); if(discordUser?.session) _kort.modePromise = _api('/kort', 'POST', { result: r, opp: _kort.opp.name, score }, { session: true }).then(x => { if(!x?.ok) return;
      if(_kortInfo?.me && x.me) Object.assign(_kortInfo.me, x.me); const k = (x.me?.weekWins || 0) % 3, kk = _kort, set = (t, c) => { kk.reward = { t, c: c || 'var(--muted)' }; const box = document.getElementById('k-reward'); if(box && _kort === kk) { box.innerHTML = t; box.style.color = kk.reward.c; } };
      const packTxt = x.pack ? _g(' · 🎁 paczka za 3 dni z wygraną!', ' · 🎁 a pack for 3 winning days!') : x.weekWin ? _g(` · do paczki ${k}/3`, ` · towards a pack ${k}/3`) : '';
      if(!x.already) { const t = `⭐ +${x.xp} XP ${_g('za pierwszy mecz dnia', 'for the first match of the day')}${packTxt}`; set(t, 'var(--win)'); showToast(t, 'success'); }
      else if(x.weekWin) { const t = `🏆 ${_g('Pierwsza wygrana dnia — liczy się do paczki', 'First win of the day — counts towards a pack')}${x.pack ? _g(': 🎁 paczka za 3 dni z wygraną!', ': 🎁 a pack for 3 winning days!') : ` ${k}/3`}`; set(t, 'var(--win)'); showToast(t, 'success'); }
      else set(`🏋️ ${_g('Mecz treningowy — XP za dziś już odebrane', 'Practice match — today’s XP already claimed')}${x.me?.winToday ? _g(', dzień z wygraną zaliczony do paczki', ', winning day already counted for the pack') : _g(' · wygraj mecz, by zaliczyć dzień do paczki', ' · win a match to count today towards a pack')}`);
      if(x.pack) window._cardsCanOpen = true; }).catch(() => {}); }
  return `<div style="text-align:center;padding:.7rem 0"><div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2.2rem;color:${r === 'win' ? 'var(--win)' : r === 'loss' ? 'var(--loss)' : 'var(--accent)'}">${r === 'win' ? (en ? 'VICTORY' : 'WYGRANA') : r === 'loss' ? (en ? 'DEFEAT' : 'PORAŻKA') : (en ? 'DRAW' : 'REMIS')} ${score}</div>
    <div style="font-size:.8rem;color:var(--muted)">${en ? 'Rounds' : 'Rundy'}: ${qs}</div>
    ${_kort.mode === 'daily' && discordUser ? `<div id="k-reward" style="font-size:.82rem;margin-top:.45rem;color:${_kort.reward?.c || 'var(--muted)'}">${_kort.reward?.t || '⏳'}</div>` : ''}
    <div id="k-mvp" style="margin:.8rem auto 0;min-height:60px"></div>
    <button class="btn btn-primary" style="margin-top:.6rem" onclick="kortShare()">📸 ${en ? 'Share result' : 'Udostępnij wynik'}</button> ${_kort.mode === 'draft' ? _kortDraftEndHtml() : ''}<button class="btn btn-ghost" style="margin-top:.6rem" onclick="_kort.dismissed=true;renderKort()">↩ ${en ? 'Back' : 'Wróć'}</button>${_kort.mode === 'daily' ? ` <button class="btn btn-ghost" style="margin-top:.6rem" onclick="kortStart()">🔁 ${en ? 'Rematch (no reward)' : 'Rewanż (bez nagrody)'}</button>` : ''}</div>`;
}
function kortHumanPlay(id, row) { if(!_kort || _kortBusy) return; if(_kort.mode === 'live') { if(_kort.st.turn === 0 && !_kort.st.p[0].passed) _kortLiveMove('play', id, row); return; } if(kortPlay(_kort.st, 0, id, row)) { if(_kort.moves) _kort.moves.push({ t: 'p', id, row }); _kort.lastId = id; _kortFxFor(0); _kSfx('play'); _kortDraw(); _kortBot(); } }
function kortHumanPass() { if(!_kort || _kortBusy) return; if(_kort.mode === 'live') { if(_kort.st.turn === 0) _kortLiveMove('pass'); return; } if(kortPass(_kort.st, 0)) { if(_kort.moves) _kort.moves.push({ t: 'x' }); _kSfx('pass'); _kortDraw(); _kortBot(); } }
function _kortBot() {
  if(_kort?.mode === 'live') { _kortDraw(); return; }
  const st = _kort?.st; if(!st || st.over || st.turn !== 1) { _kortDraw(); return; }
  _kortBusy = true; _kortDraw();
  setTimeout(() => { const m = kortBotMove(st, 1); if(m.pass) { kortPass(st, 1); _kSfx('pass'); } else if(m.coach) { if(!kortCoach(st, 1, m.row)) kortPass(st, 1); _kSfx('round'); } else { kortPlay(st, 1, m.id, m.row); _kort.lastId = m.id; _kortFxFor(1); _kSfx('opp'); } _kortBusy = false; _kortDraw(); if(st.turn === 1 && !st.over) _kortBot(); }, 650);
}
function goToTeamRegistrations() { showView('join'); renderTeamRegistrations(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function closeTeamRegModal() {
  const modal = document.getElementById('team-reg-modal');
  if(modal) modal.style.display = 'none';
}
function openTeamRegModal() {
  if(registrationsClosed) { showToast('🔒 Zapisy drużyn są zamknięte', 'info'); return; }
  const modal = document.getElementById('team-reg-modal');
  if(!modal) { console.error('Brak #team-reg-modal'); return; }
  modal.style.display = 'flex';

  // Populate season selector
  const sel = document.getElementById('team-reg-season');
  if(sel) {
    sel.innerHTML = '<option value="">— wybierz sezon —</option>'
      + seasons.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if(currentSeasonId) sel.value = currentSeasonId;
  }

  if(!discordUser || !discordUser.session) {
    document.getElementById('team-reg-login-wall').style.display = 'block';
    document.getElementById('team-reg-form-wrap').style.display = 'none';
    return;
  }
  document.getElementById('team-reg-login-wall').style.display = 'none';
  document.getElementById('team-reg-form-wrap').style.display = 'block';

  // Captain info
  const av = document.getElementById('team-reg-captain-avatar');
  if(av && discordUser.avatar) { av.src = discordUser.avatar; av.style.display = 'block'; }
  const cn = document.getElementById('team-reg-captain-name');
  if(cn) cn.textContent = discordUser.name + (discordUser.discordTag ? ' (' + discordUser.discordTag + ')' : '');

  // Reset form
  document.getElementById('team-reg-name').value = '';
  { const nm = document.getElementById('team-reg-name'); if(nm && !document.getElementById('team-reg-x')) { const x = document.createElement('input'); x.id = 'team-reg-x'; x.maxLength = 60; x.placeholder = _g('Profil X drużyny (np. @NazwaDrużyny)', 'Team X profile (e.g. @YourTeam)'); x.style.cssText = nm.style.cssText || 'width:100%'; x.className = nm.className; x.style.marginTop = '.45rem'; nm.insertAdjacentElement('afterend', x); } const x = document.getElementById('team-reg-x'); if(x) x.value = ''; }
  { const x = document.getElementById('team-reg-x'); if(EU_MODE && x && !document.getElementById('team-reg-level')) { const sel = document.createElement('select'); sel.id = 'team-reg-level'; sel.className = x.className; sel.style.cssText = x.style.cssText; sel.style.marginTop = '.45rem';
      sel.innerHTML = '<option value="">📶 Declare your level *</option>' + TEAM_LEVELS.map(l => `<option value="${l}">${l}</option>`).join(''); x.insertAdjacentElement('afterend', sel); }
    const lv = document.getElementById('team-reg-level'); if(lv) { lv.value = ''; lv.style.borderColor = ''; } }
  { const rw = document.getElementById('team-reg-rules-wrap'); const sp = rw?.querySelector('span'); if(sp && (EU_MODE || _rulesExist())) sp.innerHTML = _g('Przeczytałem i akceptuję', 'I have read and accept the') + ` <a href="#rules" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:var(--accent)">${_g('regulamin ligi', 'league rules')}</a> <span style="color:var(--loss)">*</span>`; }
  const rules = document.getElementById('team-reg-rules');
  if(rules) rules.checked = false;
  const rulesWrap = document.getElementById('team-reg-rules-wrap');
  if(rulesWrap) rulesWrap.style.borderColor = 'var(--border)';
  _teamRegLogo = null;
  const prev = document.getElementById('team-reg-logo-preview');
  if(prev) { prev.innerHTML = '<div style="text-align:center;line-height:1.15;pointer-events:none"><div style="font-size:1.45rem">🏀</div><div style="font-size:.56rem;font-weight:800;letter-spacing:.4px;color:var(--accent);text-transform:uppercase">' + _g('+ Dodaj logo', '+ Add logo') + '</div></div>'; prev.style.borderColor = 'var(--accent)'; } // wyraźne „dodaj logo”
  document.getElementById('team-reg-players').innerHTML = '';
  teamRegUpdateCount();

  // Add 5 empty player rows by default
  for(let i=0;i<5;i++) teamRegAddPlayer();
}
async function teamRegLogoChange(input) { // logo w formularzu: zmniejszane automatycznie (jak przy zmianie logo drużyny)
  const file = input.files[0]; if(!file) return;
  if(!/^image\//.test(file.type)) { showToast(_g('❌ Wybierz obrazek (PNG, JPG, WEBP, GIF)', '❌ Choose an image (PNG, JPG, WEBP, GIF)'), 'error'); return; }
  try { _teamRegLogo = await _resizeLogo(file); } catch(e) { showToast('❌ ' + _g('Nie udało się wczytać obrazka', 'Could not read the image'), 'error'); return; }
  const prev = document.getElementById('team-reg-logo-preview');
  if(prev) prev.innerHTML = `<div style="position:relative;width:100%;height:100%"><img src="${_teamRegLogo}" style="width:100%;height:100%;object-fit:cover;border-radius:6px"><div style="position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);color:#fff;font-size:.52rem;font-weight:800;text-align:center;padding:.1rem 0;text-transform:uppercase">${_g('zmień', 'change')}</div></div>`;
}
function teamRegAddPlayer() {
  const container = document.getElementById('team-reg-players');
  const rows = container.querySelectorAll('.team-reg-player-row');
  if(rows.length >= 10) { showToast('Maksymalnie 10 zawodników', 'info'); return; }
  const idx = rows.length;
  const div = document.createElement('div');
  div.className = 'team-reg-player-row';
  div.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 80px 104px 26px;gap:.4rem;align-items:center;background:var(--surface2);border-radius:7px;padding:.45rem .6rem';
  div.innerHTML = `
    <input type="text" placeholder="Gamertag (PSN/Xbox)" maxlength="32"
      style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.35rem .55rem;font-family:inherit;font-size:.83rem;width:100%;box-sizing:border-box"
      oninput="teamRegUpdateCount()">
    <input type="text" class="treg-x" placeholder="${_g('X / Twitter (opcj.)', 'X / Twitter (optional)')}" maxlength="60"
      style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.35rem .55rem;font-family:inherit;font-size:.8rem;width:100%;box-sizing:border-box">
    <select style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.3rem .3rem;font-family:inherit;font-size:.78rem">
      <option value="psn">PSN</option>
      <option value="xbox">Xbox</option>
    </select>
    <select style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:5px;padding:.3rem .3rem;font-family:inherit;font-size:.78rem" title="Doświadczenie w NBA 2K">
      <option value="">Doświadczenie</option>
      <option value="beginner">${_g('🌱 Początkujący', '🌱 Beginner')}</option>
      <option value="intermediate">${_g('⚡ Średniozaawansowany', '⚡ Intermediate')}</option>
      <option value="advanced">${_g('🔥 Zaawansowany', '🔥 Advanced')}</option>
      <option value="pro">${_g('👑 Pro / Weteran', '👑 Pro / Veteran')}</option>
    </select>
    <button onclick="this.closest('.team-reg-player-row').remove();teamRegUpdateCount()"
      style="background:transparent;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:0;line-height:1" title="Usuń">×</button>
  `;
  container.appendChild(div);
  teamRegUpdateCount();
}
function teamRegUpdateCount() {
  const rows = document.querySelectorAll('.team-reg-player-row');
  const filled = [...rows].filter(r => r.querySelector('input')?.value?.trim()).length;
  const cnt = document.getElementById('team-reg-count');
  if(cnt) cnt.textContent = `${filled}/${rows.length} (min 5)`;
  const addBtn = document.getElementById('team-reg-add-btn');
  if(addBtn) addBtn.disabled = rows.length >= 10;
}
// poziom FA: PL (początkujący…) albo EU (Tryhard D1…)

async function submitTeamRegistration() {
  if(!discordUser) { showToast('❌ Zaloguj się przez Discord', 'error'); return; }

  const teamName = document.getElementById('team-reg-name')?.value?.trim();
  if(!teamName) { showToast('❌ Podaj nazwę drużyny', 'error'); return; }

  const seasonId = document.getElementById('team-reg-season')?.value || null;

  const rows = document.querySelectorAll('.team-reg-player-row');
  const players = [...rows].map(r => ({
    gamertag: r.querySelector('input')?.value?.trim() || '',
    platform: r.querySelectorAll('select')[0]?.value || 'psn',
    experience: r.querySelectorAll('select')[1]?.value || '',
    x: r.querySelector('.treg-x')?.value?.trim() || ''
  })).filter(p => p.gamertag);

  if(players.length < 5) { showToast('❌ ' + _g('Minimum 5 zawodników', 'At least 5 players'), 'error'); return; }
  const level = document.getElementById('team-reg-level')?.value || '';
  if(EU_MODE && !level) { const lv = document.getElementById('team-reg-level'); if(lv) { lv.style.borderColor = 'var(--loss)'; lv.scrollIntoView({ behavior: 'smooth', block: 'center' }); } showToast('❌ Declare your team level', 'error'); return; }

  if(!document.getElementById('team-reg-rules')?.checked) {
    const w = document.getElementById('team-reg-rules-wrap');
    if(w) { w.style.borderColor = 'var(--loss)'; w.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    showToast('❌ Zaakceptuj regulamin', 'error');
    return;
  }

  // Check for duplicate team name in this season
  const dup = teamRegistrations.find(r =>
    r.teamName.toLowerCase() === teamName.toLowerCase() &&
    (!seasonId || r.seasonId === seasonId) &&
    r.status !== 'rejected'
  );
  if(dup) { showToast('❌ Drużyna o tej nazwie już jest zgłoszona', 'error'); return; }
  if(!_ensureSession()) return;

  const res = await _api('/team-registration', 'POST',
    { seasonId: seasonId || null, teamName, logo: _teamRegLogo || null, players, rulesAccepted: true, xHandle: document.getElementById('team-reg-x')?.value?.trim() || '', level: level || null },
    { session: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  const reg = res.registration;
  teamRegistrations.push(reg);

  document.getElementById('team-reg-modal').style.display = 'none';
  showToast('✅ ' + _g('Drużyna zgłoszona! Czeka na weryfikację.', 'Team registered! Waiting for verification.'), 'success');
  renderTeamRegistrations(); try { renderEuDash(); } catch(e) {}
  const su = _signup(); if(EU_MODE || su.revolutUrl || su.skrillEmail || su.fee) setTimeout(() => openTeamPayment(reg.id), 400); // następny krok: wpisowe
}
async function teamRegSetStatus(id, status) {
  if(!_isLoggedInSync()) { showToast('❌ Tylko admin', 'error'); return; }
  const reg = teamRegistrations.find(r => r.id === id);
  if(!reg) return;

  let reason = '';
  if(status === 'rejected') {
    reason = prompt(`Powód odrzucenia drużyny "${reg.teamName}" (opcjonalnie):`, '');
    if(reason === null) return; // anulowano
    reason = reason.trim();
  } else if(status === 'approved') {
    if(!confirm(`Zatwierdzić drużynę "${reg.teamName}"?`)) return;
  }

  const res = await _api('/team-registration', 'PATCH', { id, status, rejectReason: reason }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  Object.keys(reg).forEach(k => delete reg[k]);
  Object.assign(reg, res.registration);
  renderTeamRegistrations();

  if(status === 'pending') { showToast('↩ Przywrócono do oczekujących', 'info'); return; }
  if(status === 'rejected') { showToast('❌ Zgłoszenie odrzucone', 'info'); return; }

  const sent = await teamRegAnnounce(reg, status, reason);
  showToast(
    (status === 'approved' ? '✅ Zatwierdzona' : '❌ Odrzucona') + (sent ? ' · wysłano na Discord' : ' · ⚠ Discord nie odpowiedział'),
    sent ? 'success' : 'info'
  );
}
// 📣 ogłoszenie drużyny na Discordzie (przy zatwierdzaniu i z przycisku admina); liga EU — po angielsku
async function teamRegAnnounce(reg, status, reason = '') {
  const seasonName = reg.seasonId ? (seasons.find(s => s.id === reg.seasonId)?.name || reg.seasonId) : '—';
  const approvedCount = teamRegistrations.filter(r => r.status === 'approved' && (r.seasonId || null) === (reg.seasonId || null)).length;
  const playerLines = (reg.players||[]).map((p,i) =>
    `${i+1}. **${p.gamertag}** [${(p.platform||'psn').toUpperCase()}]${p.experience && !EU_MODE ? ' · ' + (_expLabels[p.experience]||'') : ''}${p.x ? ` · [𝕏 @${p.x}](https://x.com/${p.x})` : ''}`
  ).join('\n') || '—';
  const captainId = reg.captain?.id && /^\d+$/.test(String(reg.captain.id)) ? String(reg.captain.id) : null;

  let funLine = '';
  if(status === 'approved') {
    const fl = await Promise.race([
      _api('/fun-line', 'POST', { kind: 'team', data: { teamName: reg.teamName, seasonName, players: (reg.players || []).map(p => ({ gamertag: p.gamertag, level: (_expLabels[p.experience] || '').replace(/^\S+\s/, '') })) } }, { admin: true }),
      new Promise(r => setTimeout(() => r({}), 15000))
    ]);
    funLine = fl?.line || '';
  }

  if(status === 'pending') status = 'approved', reg = { ...reg, _pending: true };
  const embed = status === 'approved' ? {
    title: reg._pending ? (EU_MODE ? `🆕 New team registered: ${reg.teamName}` : `🆕 Nowe zgłoszenie: ${reg.teamName}`) : EU_MODE ? `✅ ${reg.teamName} joins the EU Chemik League!` : `✅ ${reg.teamName} dołącza do ligi NBA 2K27!`,
    description: [funLine ? `*${funLine}*` : '', `**${EU_MODE ? 'Roster' : 'Skład'} (${reg.players?.length||0})**\n${playerLines}`].filter(Boolean).join('\n\n').slice(0, 4000),
    color: 0x16a34a,
    fields: [
      { name: EU_MODE ? 'Season' : 'Sezon', value: seasonName, inline: true },
      { name: EU_MODE ? 'Captain' : 'Kapitan', value: captainId ? `<@${captainId}>` : (reg.captain?.name || '?'), inline: true },
      ...(reg._pending ? [] : [{ name: EU_MODE ? 'Approved teams' : 'Zatwierdzone drużyny', value: String(approvedCount), inline: true }]),
      ...(EU_MODE && reg.level ? [{ name: 'Level', value: String(reg.level), inline: true }] : []),
      ...(reg.xHandle ? [{ name: 'X', value: `https://x.com/${reg.xHandle}`, inline: true }] : []),
    ],
    footer: { text: EU_MODE ? 'EU Chemik League · NBA 2K Pro-Am' : 'NBA 2K Pro-Am Ekstraklasa' },
    timestamp: new Date().toISOString()
  } : {
    title: EU_MODE ? `❌ Application rejected — ${reg.teamName}` : `❌ Zgłoszenie odrzucone — ${reg.teamName}`,
    description: reason ? `**${EU_MODE ? 'Reason' : 'Powód'}:** ${reason}` : undefined,
    color: 0xdc2626,
    fields: [ { name: EU_MODE ? 'Captain' : 'Kapitan', value: captainId ? `<@${captainId}>` : (reg.captain?.name || '?'), inline: true } ],
    footer: { text: EU_MODE ? 'EU Chemik League · NBA 2K Pro-Am' : 'NBA 2K Pro-Am Ekstraklasa' },
    timestamp: new Date().toISOString()
  };

  const payload = { embeds: [embed] };
  if(captainId) {
    payload.content = `<@${captainId}>`;
    payload.allowed_mentions = { users: [captainId] };
  }
  let sent = false;
  payload.route = reg._pending ? 'teamNew' : status === 'approved' ? 'teamApproved' : 'teamRejected';
  try { sent = await _teamRegDiscordSend(payload, reg.logo); } catch(e) { console.warn('Discord notify failed', e); }
  return sent;
}
async function teamRegAnnounceBtn(id) {
  const reg = teamRegistrations.find(r => r.id === id); if(!reg) return;
  if(!confirm(`Wysłać ogłoszenie drużyny „${reg.teamName}” na Discord (${reg.status === 'approved' ? 'kanał: Zatwierdzenie drużyny' : 'kanał: Nowe zgłoszenie drużyny'})?`)) return;
  const ok = await teamRegAnnounce(reg, reg.status === 'approved' ? 'approved' : 'pending');
  showToast(ok ? '📣 Wysłano na Discord' : '⚠ Discord nie odpowiedział — sprawdź kanał w 📣 Kanałach powiadomień', ok ? 'success' : 'info');
}
async function teamRegDelete(id) {
  if(!confirm('Usunąć zgłoszenie?')) return;
  const res = await _api('/team-registration', 'DELETE', { id }, { admin: true });
  if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
  teamRegistrations = teamRegistrations.filter(r => r.id !== id);
  renderTeamRegistrations();
  showToast('🗑 Usunięto zgłoszenie', 'info');
}
function renderDiscordQueue() {
  const el = document.getElementById('discord-queue-panel');
  if(!el || !_isLoggedInSync()) return;

  if(!pendingScreenshots.length) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  el.innerHTML = `
    <div style="background:rgba(88,101,242,.08);border:1px solid rgba(88,101,242,.3);border-radius:12px;padding:1rem 1.25rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.1rem;letter-spacing:1px;color:#5865f2">
          <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg"
            style="width:18px;height:18px;vertical-align:middle;margin-right:.4rem" onerror="this.style.display='none'">
          KOLEJKA DISCORD (${pendingScreenshots.length})
        </div>
        <button onclick="refreshDiscordQueue()" style="background:rgba(88,101,242,.15);border:1px solid rgba(88,101,242,.3);color:#5865f2;border-radius:6px;padding:.25rem .7rem;font-size:.75rem;cursor:pointer;font-family:inherit">
          🔄 Odśwież
        </button>
      </div>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${pendingScreenshots.map((s,i) => `
          <div style="display:flex;align-items:center;gap:.75rem;background:var(--surface2);border-radius:8px;padding:.6rem .75rem;flex-wrap:wrap">
            <img src="${s.url}" style="width:80px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;flex-shrink:0"
              onclick="window.open('${s.url}','_blank')" title="Kliknij aby powiększyć">
            <div style="flex:1;min-width:120px">
              <div style="font-size:.8rem;font-weight:700">${s.author || 'Nieznany'}</div>
              <div style="font-size:.72rem;color:var(--muted)">${s.channelName||'#screeny'} · ${formatDate(s.timestamp?.slice(0,10)||'')}</div>
              ${s.processed ? '<div style="font-size:.72rem;color:var(--win)">✅ Przetworzony</div>' : ''}
            </div>
            <div style="display:flex;gap:.4rem;flex-shrink:0">
              ${!s.processed ? `
                <button onclick="loadDiscordScreenshot(${i})"
                  style="background:var(--accent);color:#000;border:none;border-radius:6px;padding:.3rem .75rem;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit">
                  📥 Załaduj
                </button>` : ''}
              <button onclick="dismissDiscordScreenshot(${i})"
                style="background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:.3rem .6rem;font-size:.8rem;cursor:pointer;font-family:inherit">
                ✕
              </button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}
async function loadDiscordScreenshot(idx) {
  const s = pendingScreenshots[idx];
  if(!s) return;

  showToast('⏳ Pobieranie screenshota z Discord...', 'info');
  try {
    // Fetch image through a CORS proxy since Discord CDN blocks direct fetch
    // Use allorigins.win as free CORS proxy
    // Use Discord proxy_url (doesn't expire) if available, else direct url
    const imageUrl = s.proxyUrl || s.url;
    // Try direct first (works if CORS allows), fallback to allorigins proxy
    let res;
    try {
      res = await fetch(imageUrl);
      if(!res.ok) throw new Error('Direct fetch failed');
    } catch {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
      res = await fetch(proxyUrl);
    }
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      screenshotBase64 = dataUrl.split(',')[1];
      screenshotMimeType = blob.type || 'image/png';

      // Show preview
      const zone = document.getElementById('upload-zone');
      if(zone) {
        zone.innerHTML = `
          <img src="${dataUrl}"
            style="max-width:100%;max-height:500px;border-radius:8px;cursor:zoom-in;display:block;margin:0 auto"
            onclick="this.style.maxHeight=this.style.maxHeight==='none'?'500px':'none';this.style.cursor=this.style.maxHeight==='none'?'zoom-out':'zoom-in'"
            title="Kliknij aby powiększyć/zmniejszyć">
          <p style="color:var(--win);margin-top:.5rem;font-size:.85rem">✅ Screenshot z Discord załadowany &mdash; <span style="color:var(--muted)">kliknij obrazek aby powiększyć</span></p>`;
      }
      document.getElementById('parse-btn').disabled = false;

      // Mark as loaded (scroll to analyze button)
      document.getElementById('parse-btn').scrollIntoView({ behavior:'smooth', block:'center' });
      showToast('✅ Screenshot załadowany — kliknij Analizuj!', 'success');

      // Store reference to this discord screenshot for date extraction
      window._currentDiscordScreenshot = pendingScreenshots[idx];
      window._discordScreenshotWasUsed = true;
      // Set match date from discord message timestamp
      const discordDate = pendingScreenshots[idx].timestamp?.slice(0,10);
      if(discordDate) {
        const dateInput = document.getElementById('match-date');
        if(dateInput) dateInput.value = discordDate;
      }
      // Mark as processed in queue
      pendingScreenshots[idx].processed = true;
      renderDiscordQueue();
    };
    reader.readAsDataURL(blob);
  } catch(e) {
    // Fallback: open in new tab and ask user to save + upload manually
    showToast('⚠️ Nie można pobrać automatycznie — otwieram w nowej karcie', 'info');
    window.open(s.url, '_blank');
  }
}
async function dismissDiscordScreenshot(idx) {
  const item = pendingScreenshots[idx];
  if(!item) return;
  if(workerUrl) {
    try {
      const adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
      await fetch(workerUrl.replace(/\/$/, '') + '/pending-screenshots/' + item.id, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken }
      });
    } catch(e) { console.warn('Delete failed:', e); }
  } else {
    pendingScreenshots.splice(idx, 1);
    await saveData();
  }
  pendingScreenshots.splice(idx, 1);
  renderDiscordQueue();
}
async function refreshDiscordQueue() {
  if(workerUrl) {
    await loadDiscordQueueFromWorker();
  } else {
    await loadData();
  }
  renderDiscordQueue();
  showToast('🔄 Kolejka odświeżona', 'info');
}
async function loadDiscordQueueFromWorker() {
  if(!workerUrl) return;
  try {
    const adminToken = localStorage.getItem('nba2k_admin_token_hash') || '';
    const res = await fetch(workerUrl.replace(/\/$/, '') + '/pending-screenshots', {
      headers: { 'X-Admin-Token': adminToken }
    });
    if(!res.ok) return;
    const data = await res.json();
    pendingScreenshots = data.screenshots || [];
  } catch(e) {
    console.warn('Could not load Discord queue:', e);
  }
}
