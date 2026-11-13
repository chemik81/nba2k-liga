/*@v:8c0d81398d*/
function _wrPlayer(me) {
  const games = _mpAgg(() => true, _wr.scope).filter(r => _mpSame(r.name, me)).flatMap(r => r.games.map(g => ({ ...g, team: r.team, name: r.name })));
  if(!games.length) return null;
  games.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const n = games.length, sum = f => games.reduce((s, g) => s + g[f], 0);
  const opp = {}; games.forEach(g => { const o = opp[g.opp] = opp[g.opp] || { w: 0, l: 0 }; g.won ? o.w++ : o.l++; });
  const victim = Object.entries(opp).sort((a, b) => b[1].w - a[1].w)[0], nemesis = Object.entries(opp).sort((a, b) => b[1].l - a[1].l)[0];
  const tens = g => ['pts', 'reb', 'ast', 'stl', 'blk'].filter(k => g[k] >= 10).length;
  // miejsce w lidze wg PPG (min. 40% meczów lidera)
  const all = _mpAgg(() => true, _wr.scope).filter(r => r.gp), maxGp = Math.max(...all.map(r => r.gp));
  const ranked = all.filter(r => r.gp >= maxGp * 0.4).sort((a, b) => b.ppg - a.ppg);
  const rank = ranked.findIndex(r => _mpSame(r.name, me)) + 1;
  let ach = 0; try { ach = _achievements(_wr.scope === 'career' ? null : _editionOf(currentSeasonId)).filter(e => _mpSame(e.player, me)).length; } catch(e) {}
  let streak = 0, best = 0; games.forEach(g => { streak = g.won ? streak + 1 : 0; best = Math.max(best, streak); });
  return { name: games[games.length - 1].name, team: games[games.length - 1].team, n, w: games.filter(g => g.won).length, pts: sum('pts'), ppg: sum('pts') / n, rpg: sum('reb') / n, apg: sum('ast') / n,
    best: [...games].sort((a, b) => b.pts - a.pts)[0], dd: games.filter(g => tens(g) === 2).length, td: games.filter(g => tens(g) >= 3).length,
    victim, nemesis, rank, ranked: ranked.length, ach, streak: best, threes: sum('tpm') };
}
function _wrFan() {
  if(!discordUser) return null;
  const sid = currentSeasonId || null, ctx = { demo: false };
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === sid);
  let picks = 0, hits = 0, upsets = 0;
  items.forEach(s => {
    const k = String(s.id), mine = myVotes[k]; if(!mine) return;
    const r = _ssResult(ctx, s); if(!r?.done) return;
    picks++;
    const outcome = r.winnerSide || (r.draw ? 'draw' : null);
    if(outcome && mine === outcome) {
      hits++;
      const c = scheduleVoteCounts[k] || {}, tot = (c.team1 || 0) + (c.team2 || 0) + (c.draw || 0);
      if(tot >= 3 && (c[mine] || 0) / tot < 0.4) upsets++;
    }
  });
  const ov = typerData[_seasonKey(sid)]?.overall || [];
  const tRank = ov.findIndex(x => x.id === discordUser.id) + 1;
  const fx = fantasyData?.season?.find(x => x.id === discordUser.id);
  const fxRank = fantasyData?.season ? fantasyData.season.findIndex(x => x.id === discordUser.id) + 1 : 0;
  const bestWeek = fx ? Object.entries(fx.perWeek || {}).sort((a, b) => b[1] - a[1])[0] : null;
  const pred = myPredictions[sid] || null;
  return { picks, hits, upsets, acc: picks ? Math.round(hits / picks * 100) : 0, tRank, tTotal: ov.length, fxPts: fx?.pts || 0, fxRank, fxTotal: fantasyData?.season?.length || 0, bestWeek,
    pred, awards: Object.keys(myAwardVotes || {}).length, likes: (myClipLikes || []).length };
}
// 🎁 WRAPPED+: karty, Kort, 2Kordle, grafika do udostępnienia, ogłoszenie
async function _wrLoadExtra() {
  if(!discordUser?.session || _wr.loading) return; _wr.loading = true;
  const [cards, kort, kordle] = await Promise.all([_cards ? Promise.resolve(_cards) : _api('/cards/me', 'GET', null, { session: true }).catch(() => null), _api('/kort/me', 'GET', null, { session: true }).catch(() => null), _api('/kordle/board?month=all', 'GET', null, { session: true }).catch(() => null)]);
  if(cards?.ok && !_cards) _cards = cards;
  const C = cards?.ok ? (() => { const own = cards.cards || {}, ks = Object.keys(own).filter(k => (own[k]?.n || 0) > 0), poolK = new Set((cards.pool || []).map(p => p.k)), byTeam = {};
      (cards.pool || []).forEach(p => (byTeam[p.team] = byTeam[p.team] || []).push(p.k)); const teams = Object.entries(byTeam).filter(([, l]) => l.length >= 3);
      const lim = ks.filter(k => k.startsWith('lim:')).map(k => own[k]), gal = ks.filter(k => poolK.has(k) && (cards.pool.find(p => p.k === k)?.tier === 'galaxy')).map(k => own[k].name);
      return { opened: cards.opened || 0, pool: ks.filter(k => poolK.has(k)).length, poolTot: poolK.size, teams: teams.filter(([, l]) => l.every(k => own[k]?.n > 0)).length, teamsTot: teams.length, lim: lim.length, limTop: lim.find(c => /REKORD|RECORD|MISTRZ|MASTER/i.test(c.label || '')) || lim[0] || null, gal, coach: ks.filter(k => k.startsWith('coach:')).length, dup: ks.reduce((s, k) => s + Math.max(0, own[k].n - 1), 0), premium: (cards.packIn || []).filter(x => x.kind === 'premium').reduce((s, x) => s + x.n, 0) }; })() : null;
  const K = kort?.ok && kort.total?.g ? { g: kort.total.g, w: kort.total.w, wr: kort.total.wr, elo: kort.elo, div: kort.div, card: kort.cards?.[0] || null, mvp: (kort.cards || []).slice().sort((a, b) => b.mvp - a.mvp)[0] || null, badge: kort.badges?.[0] || null, modes: kort.modes || {} } : null;
  const list = kordle?.board || kordle?.list || [], kr = list.findIndex(x => String(x.id) === String(discordUser.id)) + 1;
  const Q = kordle?.ok && kordle.me?.played ? { ...kordle.me, rank: kr, of: list.length } : null;
  _wr.x = { C, K, Q }; _wr.loading = false;
  if(document.getElementById('wrapped-modal')?.classList.contains('open')) openWrapped();
}
function _wrExtraBody(tab, big, line) {
  const x = _wr.x || {}, f = v => (Math.round(v * 10) / 10).toFixed(1);
  if(tab === 'cards' && x.C) { const C = x.C; return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.7rem">${big(C.opened, 'PACZEK', C.premium ? `w tym 💎 ${C.premium}` : '')}${big(`${C.pool}/${C.poolTot}`, 'KART Z PULI', C.poolTot ? Math.round(C.pool / C.poolTot * 100) + '%' : '')}${big(`${C.teams}/${C.teamsTot}`, 'DRUŻYN', 'skompletowanych')}</div>
    ${C.lim ? line('🌟', `<b>${C.lim}</b> ${_plPL(C.lim, 'karta limitowana', 'karty limitowane', 'kart limitowanych')}${C.limTop ? ` — m.in. <b>${_h(C.limTop.name)}</b> · ${_h(C.limTop.label || '')}` : ''}`) : ''}
    ${C.gal.length ? line('🌌', `Karty Galaktyka: <b>${C.gal.slice(0, 4).map(_h).join(', ')}</b>${C.gal.length > 4 ? ` i ${C.gal.length - 4} więcej` : ''}`) : ''}
    ${C.coach ? line('🧑‍🏫', `<b>${C.coach}</b> ${_plPL(C.coach, 'karta trenerska', 'karty trenerskie', 'kart trenerskich')}`) : ''}
    ${C.dup ? line('♻️', `<b>${C.dup}</b> duplikatów do wymiany lub podarowania`) : ''}
    ${C.teams ? line('📚', `Skompletowane drużyny: <b>${C.teams}</b>${C.teams === C.teamsTot ? ' — <b>cała liga! 🏆</b>' : ''}`) : line('🧩', `Do pierwszego kompletu drużyny brakuje niewiele — zajrzyj do kolekcji.`)}`; }
  if(tab === 'kort' && x.K) { const K = x.K, M = { daily: '⚔️ mecz dnia', ranked: '🏆 ranking', boss: '👑 boss', draft: '🎴 draft', live: '🤝 z kolegą' };
    return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.7rem">${big(K.g, 'MECZÓW', `${K.w} wygranych`)}${big(K.wr + '%', 'SKUTECZNOŚĆ', '')}${big(K.elo, 'ELO', _kDiv ? _kDiv(K.div) : '')}</div>
    ${K.card ? line('⭐', `Najlepsza karta: <b>${_h(K.card.k)}</b> — ${K.card.pts} pkt na mecz${K.card.mvp ? `, ${K.card.mvp}× MVP meczu` : ''}`) : ''}
    ${K.mvp && K.mvp.mvp && K.mvp.k !== K.card?.k ? line('🏅', `Najczęściej MVP: <b>${_h(K.mvp.k)}</b> (${K.mvp.mvp}×)`) : ''}
    ${K.badge ? line(_KB?.[K.badge.k] || '🏅', `Ulubiona odznaka: <b>${_h(_kbName ? _kbName(K.badge.k) : K.badge.k)}</b> — ${K.badge.wr}% wygranych z nią w talii`) : ''}
    ${Object.keys(K.modes).length ? line('🎮', Object.entries(K.modes).map(([m, r]) => `${M[m] || m}: <b>${r.w}-${r.l}${r.d ? '-' + r.d : ''}</b>`).join(' · ')) : ''}`; }
  if(tab === 'kordle' && x.Q) { const Q = x.Q;
    return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.7rem">${big(`${Q.won}/${Q.played}`, 'ODGADNIĘTE', Q.played ? Math.round(Q.won / Q.played * 100) + '%' : '')}${big(Q.best, 'NAJLEPSZA SERIA', 'dni z rzędu')}${big(Q.rank ? '#' + Q.rank : '—', 'W RANKINGU', Q.rank ? `z ${Q.of}` : '')}</div>
    ${line('🔥', `Obecna seria: <b>${Q.streak}</b> ${_plPL(Q.streak, 'dzień', 'dni', 'dni')}`)}`; }
  return '';
}
// 📸 grafika Wrapped: najlepsze liczby ze wszystkich zakładek
async function wrappedShare() {
  const me = _myPlayerName ? _myPlayerName() : null, P = me ? _wrPlayer(me) : null, F = _wrFan(), x = _wr.x || {}, tiles = [];
  if(P) tiles.push([P.pts, 'PUNKTÓW', `${P.n} meczów · ${P.w}-${P.n - P.w}`], [(Math.round(P.ppg * 10) / 10).toFixed(1), 'PTS / MECZ', P.rank ? `#${P.rank} w lidze` : '']);
  if(F?.picks) tiles.push([F.acc + '%', 'TRAFNOŚĆ TYPÓW', `${F.hits}/${F.picks}`]);
  if(F?.fxRank) tiles.push([F.fxPts, 'PKT FANTASY', `#${F.fxRank}`]);
  if(x.C?.opened) tiles.push([x.C.opened, 'PACZEK', `${x.C.pool}/${x.C.poolTot} kart`]); if(x.C?.teams) tiles.push([x.C.teams, 'KOMPLETÓW DRUŻYN', '📚']);
  if(x.K) tiles.push([x.K.elo, 'ELO W KORCIE', `${x.K.wr}% wygranych`]); if(x.Q?.won) tiles.push([x.Q.won, 'WYGRANE 2KORDLE', `seria ${x.Q.best}`]);
  const T = tiles.slice(0, 6); if(!T.length) { showToast('Za mało danych do grafiki — zagraj, typuj albo otwórz paczkę!', 'info'); return; }
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 1080, 1350); bg.addColorStop(0, '#1a1205'); bg.addColorStop(.55, '#120f22'); bg.addColorStop(1, '#0b0d12'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = 'rgba(245,197,24,.12)'; g.beginPath(); g.arc(900, 160, 320, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f5c518'; g.font = '900 54px "Barlow Condensed", Arial'; g.fillText('🎁 MÓJ WRAPPED', 70, 130);
  g.fillStyle = '#fff'; g.font = '900 92px "Barlow Condensed", Arial'; g.fillText(String(discordUser?.name || me || 'Kibic').toUpperCase().slice(0, 18), 70, 240);
  g.fillStyle = '#9ca3af'; g.font = '600 34px Arial'; g.fillText((_seasonName(currentSeasonId) || 'Sezon') + (P?.team ? ' · ' + P.team : ''), 70, 295);
  const cols = 2, w = 450, h = 260, gap = 40;
  T.forEach((t, i) => { const X = 70 + (i % cols) * (w + gap), Y = 360 + Math.floor(i / cols) * (h + gap);
    g.fillStyle = 'rgba(255,255,255,.06)'; g.strokeStyle = 'rgba(245,197,24,.35)'; g.lineWidth = 3; g.beginPath(); g.roundRect ? g.roundRect(X, Y, w, h, 28) : g.rect(X, Y, w, h); g.fill(); g.stroke();
    g.fillStyle = '#fff'; g.font = '900 110px "Barlow Condensed", Arial'; g.textAlign = 'center'; g.fillText(String(t[0]), X + w / 2, Y + 130);
    g.fillStyle = '#f5c518'; g.font = '800 30px Arial'; g.fillText(t[1], X + w / 2, Y + 185); g.fillStyle = '#9ca3af'; g.font = '500 27px Arial'; g.fillText(t[2] || '', X + w / 2, Y + 225); g.textAlign = 'left'; });
  g.fillStyle = '#6b7280'; g.font = '600 30px Arial'; g.fillText((location.host || 'chemikleagues.com') + '/#wrapped', 70, 1300);
  const blob = await new Promise(r => c.toBlob(r, 'image/png')), file = new File([blob], 'wrapped.png', { type: 'image/png' });
  try { if(navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: '🎁 Mój Wrapped sezonu — ' + (location.host || 'chemikleagues.com') + '/#wrapped' }); return; } } catch(e) { if(e?.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wrapped.png'; document.body.appendChild(a); a.click(); a.remove(); showToast('📸 Grafika pobrana — wrzuć ją na Discorda albo X!', 'success');
}
async function announceWrapped() {
  if(!confirm('Wysłać ogłoszenie „Wasz Wrapped sezonu jest gotowy” na kanał „Codzienne zaproszenie”?')) return;
  const ok = await _teamRegDiscordSend({ route: 'dailyInvite', content: `🎁 **Wasz Wrapped sezonu jest gotowy!**\nMecze, typy, Fantasy, kolekcja kart, Kort i 2Kordle — wszystko w jednym podsumowaniu. Zobacz swój i pochwal się grafiką! 📸\n👉 ${location.origin}/#wrapped` });
  showToast(ok ? '📣 Wysłano na Discord' : '⚠ Discord nie odpowiedział — sprawdź kanał w 📣 Kanałach powiadomień', ok ? 'success' : 'info');
}
function openWrapped() {
  const me = _myPlayerName ? _myPlayerName() : null;
  const P = me ? _wrPlayer(me) : null, F = _wrFan();
  if(discordUser?.session && !_wr.x && !_wr.loading) _wrLoadExtra();
  if(!_wr.tab) _wr.tab = P ? 'player' : 'fan';
  const big = (v, l, sub) => `<div style="background:linear-gradient(160deg,rgba(245,197,24,.13),rgba(167,139,250,.10));border:1px solid var(--border);border-radius:12px;padding:.7rem .6rem;text-align:center">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.9rem;line-height:1">${v}</div><div style="font-size:.64rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-top:.2rem">${l}</div>${sub ? `<div style="font-size:.66rem;color:var(--muted)">${sub}</div>` : ''}</div>`;
  const line = (ico, html) => `<div style="display:flex;gap:.55rem;align-items:flex-start;font-size:.84rem;line-height:1.45;padding:.35rem 0;border-bottom:1px solid var(--border)"><span style="font-size:1.1rem">${ico}</span><span>${html}</span></div>`;
  const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
  const tabBtn = (id, l, ok) => ok ? `<button onclick="_wr.tab='${id}';openWrapped()" class="btn ${_wr.tab === id ? 'btn-primary' : 'btn-ghost'}" style="font-size:.74rem;padding:.25rem .7rem">${l}</button>` : '';
  const scope = (v, l) => `<button onclick="_wr.scope='${v}';openWrapped()" style="font-size:.68rem;padding:.12rem .5rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${_wr.scope === v ? 'var(--accent)' : 'var(--border)'};background:transparent;color:${_wr.scope === v ? 'var(--accent)' : 'var(--muted)'}">${l}</button>`;
  let body = '';
  if(['cards', 'kort', 'kordle'].includes(_wr.tab)) body = _wrExtraBody(_wr.tab, big, line) || '<div style="text-align:center;color:var(--muted);padding:1rem">⏳</div>';
  else if(_wr.tab === 'player' && P) body = `
    <div style="display:flex;gap:.25rem;margin-bottom:.7rem">${scope('season', 'Sezon')}${scope('edition', _editionOf(currentSeasonId) || 'Edycja')}${scope('career', 'Kariera')}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.7rem">${big(P.n, 'MECZE', `${P.w}-${P.n - P.w}`)}${big(P.pts, 'PUNKTÓW', f1(P.ppg) + ' na mecz')}${big(P.rank ? '#' + P.rank : '—', 'W LIDZE (PTS)', P.rank ? `z ${P.ranked}` : '')}</div>
    ${line('🔥', `Najlepszy mecz: <b>${P.best.pts} PTS</b> · ${P.best.reb} REB · ${P.best.ast} AST vs <b>${_h(P.best.opp)}</b> (${_ssFmt(P.best.date)})`)}
    ${line('📈', `Średnio <b>${f1(P.ppg)}</b> PTS · <b>${f1(P.rpg)}</b> REB · <b>${f1(P.apg)}</b> AST${P.threes ? ` · <b>${P.threes}</b> trójek` : ''}`)}
    ${P.td || P.dd ? line('🔺', `${P.td ? `<b>${P.td}</b> × triple-double` : ''}${P.td && P.dd ? ' · ' : ''}${P.dd ? `<b>${P.dd}</b> × double-double` : ''}`) : ''}
    ${P.victim && P.victim[1].w ? line('😈', `Ulubiona ofiara: <b>${_h(P.victim[0])}</b> — ${P.victim[1].w} ${_plPL(P.victim[1].w, 'wygrana', 'wygrane', 'wygranych')}`) : ''}
    ${P.nemesis && P.nemesis[1].l ? line('👹', `Największy rywal: <b>${_h(P.nemesis[0])}</b> — ${P.nemesis[1].l} ${_plPL(P.nemesis[1].l, 'porażka', 'porażki', 'porażek')}`) : ''}
    ${P.streak >= 2 ? line('⚡', `Najdłuższa seria: <b>${P.streak}</b> wygranych z rzędu`) : ''}
    ${P.ach ? line('🎖', `<b>${P.ach}</b> ${_plPL(P.ach, 'osiągnięcie', 'osiągnięcia', 'osiągnięć')}`) : ''}`;
  else if(F) body = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;margin-bottom:.7rem">${big(F.picks ? F.acc + '%' : '—', 'SKUTECZNOŚĆ TYPÓW', F.picks ? `${F.hits}/${F.picks}` : 'brak typów')}${big(F.tRank ? '#' + F.tRank : '—', 'W TYPERZE', F.tRank ? `z ${F.tTotal}` : '')}${big(F.fxRank ? F.fxPts : '—', 'PKT FANTASY', F.fxRank ? `#${F.fxRank} z ${F.fxTotal}` : 'bez składu')}</div>
    ${F.upsets ? line('😮', `Trafione niespodzianki: <b>${F.upsets}</b> — typowałeś, gdy większość myślała inaczej`) : ''}
    ${F.bestWeek ? line('🏀', `Najlepsza kolejka fantasy: <b>Week ${F.bestWeek[0]}</b> — ${F.bestWeek[1]} pkt`) : ''}
    ${F.pred?.champion ? line('🔮', `Twój typ na mistrza: <b>${_h(F.pred.champion)}</b>${F.pred.mvp ? ` · MVP: <b>${_h(F.pred.mvp)}</b>` : ''}`) : ''}
    ${F.awards ? line('🗳', `Głosowałeś w <b>${F.awards}</b> ${_plPL(F.awards, 'głosowaniu', 'głosowaniach', 'głosowaniach')} na nagrody`) : ''}
    ${F.likes ? line('❤️', `Polubione akcje: <b>${F.likes}</b>`) : ''}
    ${!F.picks && !F.fxRank && !F.awards ? line('👋', 'Jeszcze nic tu nie ma — typuj mecze, zbuduj skład w Fantasy i głosuj na nagrody, a Twój Wrapped się zapełni!') : ''}`;
  else body = `<div style="text-align:center;color:var(--muted);padding:1.5rem">Zaloguj się przez Discord, żeby zobaczyć swój Wrapped.</div>`;
  const m = _fxModal('wrapped-modal', 560);
  m.querySelector('.modal').innerHTML = _fxHead('wrapped-modal', `🎁 Wrapped — ${_h(_seasonName(currentSeasonId) || 'sezon')}`) + `
    <div style="display:flex;gap:.35rem;margin-bottom:.8rem;flex-wrap:wrap">${tabBtn('player', '🏀 Jako gracz', !!P)}${tabBtn('fan', '👀 Jako kibic', !!F)}${tabBtn('cards', '🃏 Karty', !!_wr.x?.C)}${tabBtn('kort', '🎮 Kort', !!_wr.x?.K)}${tabBtn('kordle', '🧩 2Kordle', !!_wr.x?.Q)}</div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;margin-bottom:.6rem">${_h(_wr.tab === 'player' && P ? P.name : discordUser?.name || '')}${_wr.tab === 'player' && P ? ` <span style="font-size:.9rem;color:var(--muted)">· ${_h(P.team)}</span>` : ''}</div>
    ${body}
    ${(P || F || _wr.x) ? `<div style="display:flex;gap:.4rem;justify-content:flex-end;margin-top:.8rem;flex-wrap:wrap">${P || F ? `<button class="btn btn-ghost" onclick="wrappedCard()">🪪 Pobierz kartę</button>` : ''}<button class="btn btn-primary" onclick="wrappedShare()">📸 Udostępnij podsumowanie</button></div>` : ''}
    ${discordUser?.session && !_wr.x ? `<div style="font-size:.7rem;color:var(--muted);text-align:center;margin-top:.5rem">⏳ Wczytuję karty, Kort i 2Kordle…</div>` : ''}`;
  m.classList.add('open');
}
async function wrappedCard() {
  const me = _myPlayerName ? _myPlayerName() : null;
  const P = _wr.tab === 'player' && me ? _wrPlayer(me) : null, F = _wr.tab === 'fan' ? _wrFan() : null;
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  try { if(document.fonts?.ready) await document.fonts.ready; } catch(e) {}
  const font = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const grad = g.createLinearGradient(0, 0, W, H); grad.addColorStop(0, '#1a0b2e'); grad.addColorStop(.55, '#3b0d1c'); grad.addColorStop(1, '#0d1117');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  g.globalAlpha = .12; g.fillStyle = '#f5c518'; g.beginPath(); g.arc(W - 120, 160, 260, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  g.textAlign = 'left'; g.fillStyle = '#f5c518'; g.font = `900 40px ${font}`; g.fillText('2K PRO-AM EKSTRAKLASA · WRAPPED', 70, 110);
  g.fillStyle = '#fff'; g.font = `900 92px ${font}`; g.fillText(String(P ? P.name : discordUser?.name || '').toUpperCase().slice(0, 18), 70, 220);
  g.fillStyle = 'rgba(255,255,255,.65)'; g.font = `700 40px ${font}`; g.fillText((P ? P.team + ' · ' : 'KIBIC · ') + (_seasonName(currentSeasonId) || ''), 70, 280);
  const tiles = P ? [[P.n, 'MECZE'], [P.pts, 'PUNKTÓW'], [(Math.round(P.ppg * 10) / 10).toFixed(1), 'PTS / MECZ'], [P.rank ? '#' + P.rank : '—', 'W LIDZE'], [P.best.pts, 'REKORD MECZU'], [P.ach, 'OSIĄGNIĘCIA']]
    : [[F.picks ? F.acc + '%' : '—', 'SKUTECZNOŚĆ'], [F.hits, 'TRAFIONE TYPY'], [F.upsets, 'NIESPODZIANKI'], [F.tRank ? '#' + F.tRank : '—', 'W TYPERZE'], [F.fxPts, 'PKT FANTASY'], [F.fxRank ? '#' + F.fxRank : '—', 'W FANTASY']];
  tiles.forEach(([v, l], i) => {
    const x = 70 + (i % 2) * 480, y = 360 + Math.floor(i / 2) * 250;
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.roundRect ? g.roundRect(x, y, 450, 220, 26) : g.rect(x, y, 450, 220); g.fill();
    g.fillStyle = '#f5c518'; g.font = `900 120px ${font}`; g.fillText(String(v), x + 34, y + 135);
    g.fillStyle = 'rgba(255,255,255,.75)'; g.font = `800 34px ${font}`; g.fillText(l, x + 36, y + 190);
  });
  g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `700 38px ${font}`;
  const foot = P ? (P.victim && P.victim[1].w ? `😈 Ulubiona ofiara: ${P.victim[0]}` : '') : (F.bestWeek ? `🏀 Najlepsza kolejka fantasy: Week ${F.bestWeek[0]} (${F.bestWeek[1]} pkt)` : '');
  if(foot) g.fillText(foot, 70, 1150);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `700 30px ${font}`; g.fillText(((location.host || 'pl.chemikleagues.com') + location.pathname.replace(/index\.html$/, '')).replace(/\/$/, ''), 70, 1270);
  const a = document.createElement('a'); a.download = 'wrapped.png'; a.href = c.toDataURL('image/png'); a.click();
  showToast('🪪 Karta pobrana — wrzuć ją na Discorda!', 'success');
}
// zamiana linku kanału/filmu na adres odtwarzacza do wbudowania (null = nie da się wbudować)
function _msEmbed(url, muted) {
  const host = location.hostname || 'localhost';
  const u = String(url || '');
  let m = u.match(/twitch\.tv\/(?!videos|clip)([\w]+)/i);
  if(m) return `https://player.twitch.tv/?channel=${m[1]}&parent=${host}&muted=${muted ? 'true' : 'false'}&autoplay=true`;
  m = u.match(/(?:youtube\.com\/(?:watch\?.*v=|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
  if(m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1`;
  m = u.match(/youtube\.com\/channel\/(UC[\w-]{20,})/i);
  if(m) return `https://www.youtube.com/embed/live_stream?channel=${m[1]}&autoplay=1&mute=${muted ? 1 : 0}`;
  m = u.match(/kick\.com\/([\w-]+)/i);
  if(m) return `https://player.kick.com/${m[1]}?muted=${muted ? 'true' : 'false'}&autoplay=true`;
  return null;
}
function _msPlatform(url) {
  const u = String(url || '').toLowerCase();
  return u.includes('twitch') ? 'Twitch' : u.includes('youtu') ? 'YouTube' : u.includes('kick.com') ? 'Kick' : u.includes('facebook') || u.includes('fb.') ? 'Facebook' : u.includes('tiktok') ? 'TikTok' : 'Link';
}
// dostępne transmisje: mecze na żywo → dzisiejsze → najbliższe (z linkami)
function _msSources(keepId) {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), in3 = new Date(Date.now() + 3 * 864e5).toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
  const items = schedule.filter(s => s.generated && (s.seasonId || null) === (currentSeasonId || null) && !s.played && !_ssResult({ demo: false }, s)?.done && (String(s.id) === String(keepId) || !_ssSubmittedAll(s))
    && (String(s.id) === String(keepId) || _isLive(s) || (s.date && s.date >= today && s.date <= in3)));
  // ten sam kanał drużyny przy kilku meczach dziś → „na żywo” tylko jej najwcześniejszy nierozegrany mecz
  const ord = x => (x.time || '99:99') + ':' + String(x.id).padStart(8, '0');
  const firstToday = team => items.filter(x => x.date === today && (x.team1 === team || x.team2 === team)).sort((a, b) => ord(a).localeCompare(ord(b)))[0];
  const out = [];
  items.forEach(s => ['team1', 'team2'].forEach(sd => {
    const url = _effStream(s, sd); if(!url) return;
    const isToday = s.date === today, lv0 = _chanLive(url), lv = lv0 && (_isLive(s) || (isToday && String(firstToday(s[sd])?.id) === String(s.id))) ? lv0 : null;
    const live = !!lv || _isLive(s);
    out.push({ id: `${s.id}:${sd}`, s, side: sd, team: s[sd], url, live, viewers: lv?.viewers ?? null, isToday, prio: lv ? 0 : live ? 0.5 : isToday ? 1 : 2 });
  }));
  out.sort((a, b) => a.prio - b.prio || String(a.s.date || '9').localeCompare(String(b.s.date || '9')) || String(a.s.time || '').localeCompare(String(b.s.time || '')));
  // jeden kanał = jedna pozycja (najważniejsza), chyba że to wskazany mecz
  const seen = new Set();
  return out.filter(x => { const k = String(x.url).toLowerCase(); if(seen.has(k) && String(x.s.id) !== String(keepId)) return false; seen.add(k); return true; });
}
function openMultistream(scheduleId) {
  _ms.keep = scheduleId || null;
  const src = _msSources(_ms.keep);
  if(scheduleId) _ms.sel = src.filter(x => String(x.s.id) === String(scheduleId)).map(x => x.id);
  if(!_ms.sel || !_ms.sel.length) {
    const live = src.filter(x => x.live);
    _ms.sel = (live.length ? live : src.filter(x => x.isToday)).slice(0, 4).map(x => x.id);
  }
  _ms.sel = _ms.sel.filter(id => src.some(x => x.id === id));
  if(!_ms.audio || !_ms.sel.includes(_ms.audio)) _ms.audio = _ms.sel[0] || null;
  showView('multistream');
}
function renderMultistream() {
  const el = document.getElementById('multistream-view'); if(!el) return;
  const src = _msSources(_ms.keep);
  if(!_ms.sel) { const live = src.filter(x => x.live); _ms.sel = (live.length ? live : src.filter(x => x.isToday)).slice(0, 4).map(x => x.id); }
  const chosen = _ms.sel.map(id => src.find(x => x.id === id)).filter(Boolean);
  if(!_ms.audio || !_ms.sel.includes(_ms.audio)) _ms.audio = _ms.sel[0] || null;
  const ctx = { demo: false };
  const tile = x => {
    const res = _ssResult(ctx, x.s), emb = _msEmbed(x.url, x.id !== _ms.audio);
    const score = res ? `${res.w1}:${res.w2}${res.games.length ? ` <span style="font-size:.66rem;color:var(--muted)">(${res.games.map(g => g.s1 + ':' + g.s2).join(', ')})</span>` : ''}` : 'vs';
    return `<div style="background:var(--surface);border:1px solid ${x.id === _ms.audio ? 'var(--accent)' : 'var(--border)'};border-radius:12px;overflow:hidden;display:flex;flex-direction:column">
      <div id="ms-h-${x.id}" style="display:flex;align-items:center;gap:.45rem;padding:.4rem .6rem;font-size:.8rem;flex-wrap:wrap">
        ${x.live ? `<span style="background:#dc2626;color:#fff;font-size:.6rem;font-weight:900;border-radius:4px;padding:.05rem .35rem">🔴 LIVE${x.viewers != null ? ' · ' + x.viewers + ' 👁' : ''}</span>` : ''}
        ${teamLogo(x.team, 20, '.5rem')}<b>${_h(x.team)}</b><span style="color:var(--muted);font-size:.72rem">· ${_msPlatform(x.url)}</span>
        <span style="flex:1"></span>
        <span style="font-size:.72rem;color:var(--muted)">${_h(x.s.team1)} <b style="color:var(--text)">${score}</b> ${_h(x.s.team2)}</span>
      </div>
      <div style="position:relative;width:100%;padding-top:56.25%;background:#000">
        ${emb ? `<iframe src="${emb}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>`
          : `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:#ddd;font-size:.8rem;text-align:center;padding:1rem">
              ${_msPlatform(x.url)} nie pozwala wbudować transmisji na stronie.<a href="${_h(x.url)}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size:.74rem;text-decoration:none">▶ Otwórz transmisję</a></div>`}
      </div>
      <div style="display:flex;gap:.35rem;padding:.35rem .5rem;justify-content:flex-end;flex-wrap:wrap">
        ${emb ? `<button class="btn ${x.id === _ms.audio ? 'btn-primary' : 'btn-ghost'}" style="font-size:.66rem;padding:.12rem .5rem" onclick="_ms.audio='${x.id}';renderMultistream()">${x.id === _ms.audio ? '🔊 Słuchasz' : '🔈 Słuchaj tego'}</button>` : ''}
        <a href="${_h(x.url)}" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .5rem;text-decoration:none">↗ Otwórz osobno</a>
        <button class="btn btn-ghost" style="font-size:.66rem;padding:.12rem .5rem" onclick="_ms.sel=_ms.sel.filter(i=>i!=='${x.id}');renderMultistream()">✕</button>
      </div>
    </div>`;
  };
  const chip = x => { const on = _ms.sel.includes(x.id);
    return `<button onclick="msToggle('${x.id}')" style="font-size:.72rem;padding:.2rem .55rem;border-radius:999px;cursor:pointer;font-family:inherit;border:1px solid ${on ? 'var(--accent)' : 'var(--border)'};background:${on ? 'rgba(245,197,24,.15)' : 'transparent'};color:var(--text)">
      ${x.live ? '🔴 ' : x.isToday ? '📅 ' : ''}${_h(x.team)} <span style="color:var(--muted)">· ${_h(x.side === 'team1' ? x.s.team2 : x.s.team1)}${x.s.date && !x.live ? ' · ' + _ssFmt(x.s.date) + (x.s.time ? ' ' + x.s.time : '') : ''}</span></button>`; };
  // te same odtwarzacze co ostatnio → podmieniamy tylko napisy (wynik, LIVE, widzowie, lista), odtwarzacze zostają nietknięte (stream się nie zatrzymuje)
  const frameKey = JSON.stringify([_ms.cols, chosen.map(x => x.id + '|' + _msEmbed(x.url, x.id !== _ms.audio))]);
  if(el.dataset.frameKey === frameKey && el.querySelector('#ms-chips')) {
    const tmp = document.createElement('div');
    chosen.forEach(x => { tmp.innerHTML = tile(x); const nh = tmp.querySelector('#ms-h-' + CSS.escape(x.id)), oh = el.querySelector('#ms-h-' + CSS.escape(x.id)); if(nh && oh && oh.innerHTML !== nh.innerHTML) oh.innerHTML = nh.innerHTML; });
    tmp.innerHTML = `<div id="ms-chips">${src.length ? src.slice(0, 16).map(chip).join('') : ''}</div>`; const oc = el.querySelector('#ms-chips'), lbl = oc.firstElementChild?.outerHTML || '';
    if(src.length) oc.innerHTML = lbl + tmp.firstElementChild.innerHTML;
    return;
  }
  el.dataset.frameKey = frameKey;
  el.innerHTML = `
    <div class="section-title">📺 Multistream</div>
    <div id="ms-chips" style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-bottom:.6rem">
      <span style="font-size:.74rem;color:var(--muted)">Wybierz do 4 transmisji:</span>
      ${src.length ? src.slice(0, 16).map(chip).join('') : '<span style="font-size:.8rem;color:var(--muted)">Brak transmisji — drużyny nie podały linków do streamów.</span>'}
    </div>
    <div style="display:flex;gap:.35rem;align-items:center;margin-bottom:.8rem;flex-wrap:wrap">
      <span style="font-size:.72rem;color:var(--muted)">Układ:</span>
      ${[1, 2].map(n => `<button class="btn ${_ms.cols === n ? 'btn-primary' : 'btn-ghost'}" style="font-size:.68rem;padding:.12rem .5rem" onclick="_ms.cols=${n};renderMultistream()">${n === 1 ? '▭ jeden pod drugim' : '▭▭ obok siebie'}</button>`).join('')}
      <button class="btn btn-ghost" style="font-size:.68rem;padding:.12rem .5rem" onclick="navigator.clipboard?.writeText(location.origin+location.pathname+'#multistream').then(()=>showToast('🔗 Link skopiowany','success'))">🔗 Kopiuj link</button>
    </div>
    ${chosen.length ? `<div style="display:grid;grid-template-columns:repeat(${_ms.cols === 1 ? 1 : 'auto-fit'},minmax(${_ms.cols === 1 ? '0' : '420px'},1fr));gap:.7rem">${chosen.map(tile).join('')}</div>`
      : `<div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">${src.length ? 'Kliknij transmisje powyżej, żeby je włączyć.' : 'Gdy drużyny dodadzą linki do streamów, zobaczysz je tutaj — najlepiej przed meczem 🔴'}</div>`}
    <div style="font-size:.68rem;color:var(--muted);margin-top:.6rem">Dźwięk gra tylko z jednej transmisji (🔊) — reszta jest wyciszona. Twitch, YouTube i Kick działają w okienkach; Facebook i TikTok otwierają się w nowej karcie.</div>`;
}
function msToggle(id) {
  _ms.sel = _ms.sel || [];
  if(_ms.sel.includes(id)) _ms.sel = _ms.sel.filter(x => x !== id);
  else { if(_ms.sel.length >= 4) { showToast('Maksymalnie 4 transmisje naraz', 'info'); return; } _ms.sel.push(id); }
  renderMultistream();
}
function _b64uToBytes(s) { const p = '='.repeat((4 - s.length % 4) % 4); const b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); }
async function _pushCheck() {
  if(!_pushState.supported) return;
  try { const reg = await navigator.serviceWorker.getRegistration(); _pushState.sub = reg ? await reg.pushManager.getSubscription() : null; } catch(e) {}
  _pushState.prefs = JSON.parse(localStorage.getItem('nba2k_push_prefs') || 'null') || { myMatch: true, fantasy: true, typer: true, live: false };
  _pushState.checked = true;
}
async function pushEnable() {
  try {
    const perm = await Notification.requestPermission();
    if(perm !== 'granted') { showToast('Powiadomienia nie zostały zezwolone', 'info'); return; }
    let reg = await navigator.serviceWorker.getRegistration();
    if(!reg) reg = await navigator.serviceWorker.register(location.protocol === 'file:' ? 'sw.js' : '/sw.js');
    await navigator.serviceWorker.ready;
    const k = await _api('/push/key', 'GET', null, {});
    if(!k.ok) { showToast('❌ ' + k.error, 'error'); return; }
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: _b64uToBytes(k.publicKey) });
    const res = await _api('/push/subscribe', 'POST', { subscription: sub.toJSON(), prefs: _pushState.prefs }, { session: true });
    if(!res.ok) { showToast('❌ ' + res.error, 'error'); return; }
    _pushState.sub = sub;
    renderMyPanelView();
    showToast('🔔 Powiadomienia włączone', 'success');
  } catch(e) { showToast('❌ Nie udało się włączyć powiadomień: ' + e.message, 'error'); }
}
async function pushPref(k, v) {
  _pushState.prefs[k] = v; localStorage.setItem('nba2k_push_prefs', JSON.stringify(_pushState.prefs));
  if(_pushState.sub) await _api('/push/subscribe', 'POST', { subscription: _pushState.sub.toJSON(), prefs: _pushState.prefs }, { session: true });
}
// wersja działającego service workera (stary nie wyświetla powiadomień)
async function _swVersion() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    try { await reg?.update(); } catch(e) {}
    const sw = navigator.serviceWorker.controller || reg?.active;
    if(!sw) return null;
    return await new Promise(res => { const ch = new MessageChannel(); const t = setTimeout(() => res(0), 1500); ch.port1.onmessage = e => { clearTimeout(t); res(e.data?.version || 0); }; sw.postMessage({ type: 'version' }, [ch.port2]); });
  } catch(e) { return null; }
}
async function pushTest() {
  const el = document.getElementById('push-diag');
  const line = (ok, txt) => `<div>${ok === true ? '✅' : ok === false ? '❌' : '⚠️'} ${txt}</div>`;
  if(el) el.innerHTML = '⏳ Sprawdzam…';
  const v = await _swVersion();
  const res = await _api('/push/test', 'POST', { endpoint: _pushState.sub?.endpoint }, {});
  const rows = [
    line(Notification.permission === 'granted', `Zgoda przeglądarki: <b>${Notification.permission}</b>`),
    line(v >= 3 ? true : false, v >= 3 ? 'Aplikacja (sw.js) w aktualnej wersji' : v === 0 ? 'Działa <b>stara wersja sw.js</b> bez obsługi powiadomień — wgraj nowy sw.js na GitHub, odśwież stronę (Ctrl+F5) i spróbuj ponownie' : 'Brak aktywnego service workera — odśwież stronę i spróbuj ponownie'),
    line(res.ok ? true : false, res.ok ? `Usługa push (${_h(res.service || '')}) przyjęła wiadomość` : _h(res.error || 'Błąd') + (res.pushText ? ` <span style="color:var(--muted)">${_h(res.pushText)}</span>` : ''))
  ];
  if(res.ok && v >= 3) rows.push(line(null, 'Jeśli powiadomienie nie pojawiło się w ciągu minuty: sprawdź tryb <b>Nie przeszkadzać / Wspomaganie koncentracji</b> w systemie oraz czy przeglądarka ma zgodę na powiadomienia w ustawieniach systemu.'));
  if(el) el.innerHTML = rows.join('');
  showToast(res.ok ? '🧪 Wysłano — zobacz wynik diagnostyki' : '❌ ' + (res.error || 'Błąd'), res.ok ? 'success' : 'error');
}
async function pushDisable() {
  try { await _api('/push/unsubscribe', 'POST', { endpoint: _pushState.sub?.endpoint }, {}); await _pushState.sub?.unsubscribe(); } catch(e) {}
  _pushState.sub = null; renderMyPanelView(); showToast('Powiadomienia wyłączone', 'info');
}
async function openBotCommands() {
  const m = _fxModal('bot-cmd-modal', 600);
  const ep = (workerUrl || '').replace(/\/+$/, '') + '/discord/interactions';
  const step = (n, t) => `<div style="display:flex;gap:.55rem;margin-bottom:.5rem;font-size:.8rem;line-height:1.5"><b style="background:var(--accent);color:rgba(0,0,0,.88);border-radius:50%;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:.7rem">${n}</b><span>${t}</span></div>`;
  m.querySelector('.modal').innerHTML = _fxHead('bot-cmd-modal', '🤖 Komendy bota na Discordzie') + `
    <div style="font-size:.8rem;color:var(--muted);margin-bottom:.8rem">Każdy na serwerze wpisze <b>/tabela</b>, <b>/terminarz</b>, <b>/gracz</b>, <b>/h2h</b>, <b>/typer</b> albo <b>/fantasy</b> i od razu dostanie odpowiedź z danymi ligi.</div>
    ${step(1, 'Discord Developer Portal → Twoja aplikacja (bot) → <b>General Information</b> → skopiuj <b>Public Key</b>.')}
    ${step(2, 'Cloudflare → Worker → Settings → Variables and Secrets → dodaj <b>DISCORD_PUBLIC_KEY</b> z tą wartością → Deploy.')}
    ${step(3, `W tym samym miejscu Developer Portalu wklej <b>Interactions Endpoint URL</b>:<br><code style="font-size:.74rem;background:var(--surface2);padding:.15rem .35rem;border-radius:4px;word-break:break-all">${_h(ep)}</code> <button class="btn btn-ghost" style="font-size:.66rem;padding:.08rem .4rem" onclick="navigator.clipboard?.writeText('${ep}').then(()=>showToast('Skopiowano','success'))">Kopiuj</button><br>Discord sprawdzi adres przy zapisie — musi przejść.`)}
    ${step(4, 'Kliknij poniżej <b>Zarejestruj komendy</b>. Na serwerze ligi (z ustawień 🎭 Role Discord) pojawią się od razu.')}
    <div id="bot-cmd-status" style="font-size:.8rem;min-height:1.1em;margin:.4rem 0"></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end"><button class="btn btn-ghost" onclick="_pushDerived().then(()=>showToast('🔄 Dane dla bota odświeżone','success'))">🔄 Odśwież dane bota</button><button class="btn btn-primary" onclick="registerBotCommands()">📝 Zarejestruj komendy</button></div>`;
  m.classList.add('open');
}
async function registerBotCommands() {
  const st = document.getElementById('bot-cmd-status');
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Rejestruję…';
  await _pushDerived();
  const r = await _api('/discord/register-commands', 'POST', {}, { admin: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.innerHTML = r.ok ? `✅ Komendy zarejestrowane (${r.scope === 'guild' ? 'na serwerze ligi — dostępne od razu' : 'globalnie — mogą pojawić się po kilku minutach'}).${r.publicKeySet ? '' : '<br>⚠️ Brakuje DISCORD_PUBLIC_KEY w Workerze — bez niego komendy nie odpowiedzą.'}` : '❌ ' + _h(r.error);
}
async function openRemindersStatus() {
  const m = _fxModal('rem-modal', 640), box = m.querySelector('.modal');
  box.innerHTML = _fxHead('rem-modal', '🩺 Przypomnienia i 🔴 NA ŻYWO') + '<div style="color:var(--muted)">⏳ Sprawdzam…</div>';
  m.classList.add('open');
  const r = await _api('/reminders/status', 'GET', null, { admin: true });
  if(!r.ok) { box.innerHTML = _fxHead('rem-modal', '🩺 Przypomnienia') + `<div style="color:var(--loss)">❌ ${_h(r.error)}</div>`; return; }
  const ago = r.lastCron ? Math.round((Date.now() - Date.parse(r.lastCron)) / 60000) : null;
  const t = iso => new Date(iso).toLocaleString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
  const ok = (v, y, n) => `<span style="color:${v ? 'var(--win)' : 'var(--muted)'}">${v ? '✅ ' + y : '— ' + n}</span>`;
  box.innerHTML = _fxHead('rem-modal', '🩺 Przypomnienia i 🔴 NA ŻYWO') + `
    <div style="font-size:.8rem;line-height:1.6;margin-bottom:.7rem">
      <div>${ago != null && ago < 90 ? '✅' : '⚠️'} Harmonogram Workera (Cron): ${ago != null ? `ostatnio <b>${ago} min temu</b>` : '<b>brak śladu uruchomienia</b> — sprawdź Cloudflare → Worker → Settings → Triggers (Cron: <code>*/15 * * * *</code>)'}</div>
      <div>${r.webhooks.schedule ? '✅' : '❌'} Kanał terminarza (⏰ Za godzinę) · ${r.webhooks.streams ? '✅ osobny 📺 kanał transmisji (tam idzie 🔴 NA ŻYWO)' : '🔴 NA ŻYWO idzie na kanał terminarza'}</div>
    </div>
    ${r.matches.length ? `<div style="display:flex;flex-direction:column;gap:.4rem">${r.matches.map(x => `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:.5rem .65rem;font-size:.78rem;line-height:1.55">
      <b>${_h(x.team1)} vs ${_h(x.team2)}</b> · ${t(x.start)}${x.hasTime ? '' : ' <span style="color:var(--loss)">(brak godziny — przyjęto 20:00)</span>'}${x.played ? ' · rozegrany' : ''}<br>
      📺 Linki: ${x.links.length ? x.links.map(l => `${_h(l.team)}`).join(', ') : '<b style="color:var(--loss)">brak — 🔴 NA ŻYWO nie zostanie wysłane</b>'}<br>
      ⏰ Za godzinę: ${ok(x.pre, 'wysłane', 'jeszcze nie')} · 🔴 Na żywo: ${ok(x.live && x.links.length, 'wysłane', x.live ? 'pominięte (brak linków)' : 'jeszcze nie')}
    </div>`).join('')}</div>` : '<div style="color:var(--muted);font-size:.8rem">Brak meczów z ustalonym terminem w ciągu ±36 h.</div>'}
    <div style="font-size:.7rem;color:var(--muted);margin-top:.7rem">⏰ wysyła się ok. 1 h przed meczem, 🔴 w oknie od 5 min przed do 30 min po starcie (harmonogram co 15 min).</div>`;
}
async function ssProposeSlots(k) {
  const s = _ssItem(k); if(!s) return;
  const slots = _ssFindSlots(s);
  if(!slots.length) return;
  const key = x => ({ 0: 'mon', 2: 'wed', 6: 'sun' })[x.dow] || x.date;
  const d = _ssDraft[k] = _ssDraft[k] || {};
  d.primary = key(slots[0]); d.primaryFrom = slots[0].from; d.primaryTo = slots[0].to;
  if(slots[1]) { d.backup = key(slots[1]); d.backupFrom = slots[1].from; d.backupTo = slots[1].to; }
  if(!slots[1]) { renderSeasonSchedule(); showToast('Wybierz jeszcze dzień zapasowy i zapisz', 'info'); return; }
  await ssSavePick(k);
}
function openQualityReview() {
  const list = _qualityList();
  const md = _fxModal('quality-modal', 680);
  md.querySelector('.modal').innerHTML = _fxHead('quality-modal', `🛡 Wyniki do sprawdzenia (${list.length})`) + (list.length ? `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">Mecze, w których coś się nie zgadza — zwykle błąd odczytu screena. Otwórz mecz, popraw w ✏️ Edytuj albo oznacz jako sprawdzony.</div>
    <div style="display:flex;flex-direction:column;gap:.45rem;max-height:65vh;overflow-y:auto">${list.map(x => `<div style="border:1px solid rgba(245,158,11,.5);border-radius:8px;padding:.5rem .65rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:center;flex-wrap:wrap">
        <b style="font-size:.85rem;cursor:pointer" onclick="_fxClose('quality-modal');openMatch(${JSON.stringify(x.m.id)})">${_ssFmt(x.m.date)} · ${_h(x.m.team1?.name)} ${x.m.team1?.score}:${x.m.team2?.score} ${_h(x.m.team2?.name)}</b>
        <span style="display:flex;gap:.3rem"><button class="btn btn-ghost" style="font-size:.68rem;padding:.12rem .5rem" onclick="_fxClose('quality-modal');openMatch(${JSON.stringify(x.m.id)})">Otwórz</button>
        <button class="btn btn-primary" style="font-size:.68rem;padding:.12rem .5rem" onclick="qualityOk(${JSON.stringify(x.m.id)})">✓ Sprawdzony</button></span>
      </div>
      <div style="font-size:.74rem;margin-top:.3rem;line-height:1.5">${x.flags.map(f => `⚠️ ${_h(f)}`).join('<br>')}</div>
    </div>`).join('')}</div>` : '<div style="text-align:center;color:var(--muted);padding:1.5rem">✅ Wszystkie wyniki wyglądają poprawnie.</div>');
  md.classList.add('open');
}
async function qualityOk(id) {
  const m = _withAllMatches(() => matches.find(x => String(x.id) === String(id)));
  if(!m) return;
  m.qualityOk = true;
  if(!(await saveData(true))) { m.qualityOk = false; return; }
  _audit('Wynik sprawdzony', `${m.team1?.name} ${m.team1?.score}:${m.team2?.score} ${m.team2?.name}`);
  openQualityReview(); renderDashboard();
}
function openPodcastStudio() {
  if(_pod.script === null) _pod.script = localStorage.getItem('nba2k_pod_script') || POD_SAMPLE;
  const vsel = (id, val) => `<select id="${id}" style="${_MODAL_INP};font-size:.78rem;padding:.3rem .4rem">${POD_VOICES.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const m = _fxModal('pod-modal', 760);
  const _wk = [...new Set(schedule.filter(x => x.generated && (x.seasonId || null) === (currentSeasonId || null) && x.week).map(x => +x.week))].sort((a, b) => a - b);
  const _wkDone = w => schedule.filter(x => x.generated && (x.seasonId || null) === (currentSeasonId || null) && +x.week === w).every(x => x.played || x.walkover || _ssResult({ demo: false }, x)?.done);
  m.querySelector('.modal').innerHTML = _fxHead('pod-modal', '🎙 Podcast ligi') + `
    <div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.4);border-radius:10px;padding:.65rem .8rem;margin-bottom:.9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#a78bfa;margin-bottom:.35rem">📅 PODCAST TYGODNIA — AUTOMATYCZNIE</div>
      <div style="font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:.5rem">Gdy wszystkie mecze kolejki mają wyniki, bot sam przygotuje odcinek (statystyki tygodnia, bohaterowie, „cegły”, tabela, fantasy, zapowiedź — maks. ok. 5 min) i opublikuje go na kanale „Podcast tygodnia” z 📣 Kanałów powiadomień.</div>
      <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
        <select id="pw-week" style="${_MODAL_INP};width:auto;font-size:.78rem;padding:.25rem .4rem">${_wk.map(w => `<option value="${w}">Week ${w}${_wkDone(w) ? ' ✓' : ' (niekompletna)'}</option>`).join('') || '<option value="">brak kolejek</option>'}</select>
        <button class="btn btn-primary" style="font-size:.72rem" onclick="podcastWeek(true)">🧪 Próbka do mnie (DM)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="podcastWeek(false)">📣 Opublikuj na kanale</button>
        <label style="display:flex;align-items:center;gap:.35rem;font-size:.74rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 0 auto;cursor:pointer"><input type="checkbox" id="pw-auto" checked onchange="podcastAutoToggle(this.checked)" style="width:auto;margin:0;accent-color:var(--accent)"> automatycznie po kolejce</label>
      </div>
      <div style="font-size:.68rem;color:var(--muted);margin-top:.35rem">🎙 Głosy i imiona prowadzących bierzemy z pól poniżej (Prowadzący 1 / 2) — zapamiętujemy je też dla automatycznych odcinków.</div>
      <div id="pw-status" style="font-size:.76rem;min-height:1em;margin-top:.4rem"></div>
    </div>
    ${(() => { const up = schedule.filter(x => x.generated && (x.seasonId || null) === (currentSeasonId || null) && !x.played && !(_ssResult({ demo: false }, x)?.done)).slice(0, 30);
      return `<div style="background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.4);border-radius:10px;padding:.65rem .8rem;margin-bottom:.9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:#f97316;margin-bottom:.35rem">🔥 AUDIOZAPOWIEDZI KLASYKÓW</div>
      <div style="font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:.5rem">Ok. 3 h przed meczem drużyn, które grały ze sobą min. 6 razy (🔥 Klasyk), bot nagrywa 30–45 s zapowiedź: historia starć, forma, gwiazdy pojedynków, typy prowadzących.</div>
      <div style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
        <select id="pv-match" style="${_MODAL_INP};width:auto;max-width:280px;font-size:.78rem;padding:.25rem .4rem">${up.map(x => `<option value="${x.id}">${_isClassic(x.team1, x.team2) ? '🔥 ' : ''}W${x.week}: ${_h(x.team1)} vs ${_h(x.team2)}${x.date ? ' · ' + _ssFmt(x.date) : ''}</option>`).join('') || '<option value="">brak nadchodzących meczów</option>'}</select>
        <button class="btn btn-primary" style="font-size:.72rem" onclick="matchPreview(true)">🧪 Próbka (DM)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="matchPreview(false)">📣 Opublikuj</button>
        <label style="display:flex;align-items:center;gap:.35rem;font-size:.74rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0 0 0 auto;cursor:pointer"><input type="checkbox" id="pv-auto" checked onchange="matchPreviewAuto(this.checked)" style="width:auto;margin:0;accent-color:var(--accent)"> automatycznie</label>
      </div>
      <div id="pv-status" style="font-size:.76rem;min-height:1em;margin-top:.4rem"></div>
    </div>`; })()}
    <div style="background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.4);border-radius:10px;padding:.65rem .8rem;margin-bottom:.9rem">
      <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--accent);margin-bottom:.35rem">🎖 GALA SEZONU — ODCINEK SPECJALNY</div>
      <div style="font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:.5rem">Ceremonia wręczenia nagród z ostatniego zakończonego głosowania Gali: zwycięzcy kategorii, drużyna sezonu, wspomnienia sezonu — z napięciem i humorem (ok. 6 min).</div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap">
        <button class="btn btn-primary" style="font-size:.72rem" onclick="galaPodcast(true)">🧪 Próbka (DM)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="galaPodcast(false)">📣 Opublikuj</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="galaBoard(false)">🖼 Plansza Gali (PNG)</button>
        <button class="btn btn-ghost" style="font-size:.72rem" onclick="galaBoard(true)">📣 Plansza na Discord</button>
      </div><div id="gala-status" style="font-size:.76rem;min-height:1em;margin-top:.4rem"></div>
    </div>
    <div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted);margin-bottom:.35rem">✍️ WŁASNY ODCINEK (w przeglądarce)</div>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.7rem">Scenariusz: każda linijka to <b>Imię: tekst</b>. Napisz go sam, wklej albo poproś AI o odcinek z prawdziwych danych ligi. Nagranie robią naturalne głosy Gemini (ok. 30–90 s czekania).</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.5rem;margin-bottom:.6rem">
      <div><label style="${_MODAL_LBL}">Prowadzący 1</label><input id="pod-n1" value="${_h(_pod.n1)}" style="${_MODAL_INP};font-size:.8rem;padding:.3rem .45rem"></div>
      <div><label style="${_MODAL_LBL}">Głos</label>${vsel('pod-v1', _pod.v1)}</div>
      <div><label style="${_MODAL_LBL}">Prowadzący 2</label><input id="pod-n2" value="${_h(_pod.n2)}" style="${_MODAL_INP};font-size:.8rem;padding:.3rem .45rem"></div>
      <div><label style="${_MODAL_LBL}">Głos</label>${vsel('pod-v2', _pod.v2)}</div>
    </div>
    <textarea id="pod-script" rows="12" style="${_MODAL_INP};font-size:.8rem;line-height:1.5;resize:vertical">${_h(_pod.script)}</textarea>
    <div style="display:flex;gap:.45rem;flex-wrap:wrap;margin:.6rem 0">
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="podWriteScript()">✍️ Napisz z danych ligi (AI)</button>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="document.getElementById('pod-script').value=POD_SAMPLE">↺ Przykładowy scenariusz</button>
      <span style="flex:1"></span>
      <button class="btn btn-primary" style="font-size:.78rem" onclick="podRecord()">🎙 Nagraj odcinek</button>
    </div>
    <div id="pod-status" style="font-size:.8rem;min-height:1.1em;margin-bottom:.4rem"></div>
    <div id="ai-models" style="font-size:.68rem;color:var(--muted);margin-bottom:.4rem"></div>
    <div id="pod-out">${_pod.url ? _podOutHtml() : ''}</div>`;
  m.classList.add('open');
  aiModelsInfo();
  _api('/podcast/week', 'POST', { status: true }, { admin: true }).then(r => { const c = document.getElementById('pw-auto'); if(c && r.ok) c.checked = r.auto;
    { const pa = document.getElementById('pv-auto'); if(pa && r.ok) pa.checked = r.previewAuto !== false; }
    if(r.ok && r.voices) { const set = (id, v) => { const el = document.getElementById(id); if(el && v) el.value = v; }; set('pod-n1', r.voices.name1); set('pod-n2', r.voices.name2); set('pod-v1', r.voices.voice1); set('pod-v2', r.voices.voice2); } if(r.ok && !r.bot) { const st = document.getElementById('pw-status'); if(st) { st.style.color = 'var(--loss)'; st.textContent = 'Worker nie ma BOT_URL — automatyczne odcinki nie zadziałają.'; } } });
}
// jakich modeli Gemini używa Worker (wybierane automatycznie z listy Google)
async function aiModelsInfo(refresh) {
  const el = document.getElementById('ai-models'); if(!el) return;
  const r = await _api('/ai/models' + (refresh ? '?refresh=1' : ''), 'GET', null, { admin: true });
  el.innerHTML = r.ok ? `🤖 Modele Gemini (wybierane automatycznie): tekst i screeny <b>${_h(r.text || '—')}</b> · głosy <b>${_h(r.tts || 'brak modelu TTS')}</b> · klucze: ${r.keys} <a href="#" onclick="aiModelsInfo(true);return false" style="color:var(--accent)">🔄 sprawdź ponownie</a>` : '';
}
async function podcastWeek(test) {
  const week = document.getElementById('pw-week')?.value, st = document.getElementById('pw-status');
  if(!week) return;
  if(test && !_ensureSession()) return;
  if(!test && !confirm(`Opublikować podcast Week ${week} na kanale Discord?`)) return;
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Zlecam nagranie…';
  _podReadForm();
  const r = await _api('/podcast/week', 'POST', { week: +week, test, seasonId: currentSeasonId || null, name1: _pod.n1, name2: _pod.n2, voice1: _pod.v1, voice2: _pod.v2 }, { admin: true, session: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? `✅ Bot nagrywa odcinek Week ${week} — za 1–3 min ${test ? 'przyjdzie w prywatnej wiadomości (z plikiem scenariusza)' : 'pojawi się na kanale'}.` : '❌ ' + (r.error || 'Błąd');
}
async function matchPreview(test) {
  const id = document.getElementById('pv-match')?.value, st = document.getElementById('pv-status');
  const s = schedule.find(x => String(x.id) === String(id)); if(!s) return;
  if(test && !_ensureSession()) return;
  if(!test && !confirm(`Opublikować zapowiedź ${s.team1} vs ${s.team2} na Discordzie?`)) return;
  _podReadForm();
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Zlecam nagranie…';
  const r = await _api('/podcast/preview', 'POST', { team1: s.team1, team2: s.team2, date: s.date || '', time: s.time || '', test, name1: _pod.n1, name2: _pod.n2, voice1: _pod.v1, voice2: _pod.v2 }, { admin: true, session: true });
  st.style.color = r.ok ? 'var(--win)' : 'var(--loss)';
  st.textContent = r.ok ? `✅ Bot nagrywa zapowiedź — za ok. 1 min ${test ? 'przyjdzie w DM' : 'pojawi się na kanale'}.` : '❌ ' + (r.error || 'Błąd');
}
async function matchPreviewAuto(on) {
  const r = await _api('/podcast/preview', 'POST', { auto: on }, { admin: true });
  showToast(r.ok ? (on ? '🔥 Automatyczne zapowiedzi włączone' : 'Automatyczne zapowiedzi wyłączone') : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
async function podcastAutoToggle(on) {
  const r = await _api('/podcast/week', 'POST', { auto: on }, { admin: true });
  showToast(r.ok ? (on ? '🎙 Automatyczne odcinki włączone' : 'Automatyczne odcinki wyłączone') : '❌ ' + r.error, r.ok ? 'success' : 'error');
}
function _podOutHtml() {
  return `<audio controls src="${_pod.url}" style="width:100%;margin:.3rem 0 .5rem"></audio>
    <div style="display:flex;gap:.45rem;flex-wrap:wrap">
      <button class="btn btn-primary" style="font-size:.74rem" onclick="podDownload()">⬇ Pobierz MP3</button>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="podToDiscord()">📣 Wyślij na Discord</button>
    </div>`;
}
function _podReadForm() {
  _pod.n1 = document.getElementById('pod-n1').value.trim() || 'Kuba';
  _pod.n2 = document.getElementById('pod-n2').value.trim() || 'Ola';
  _pod.v1 = document.getElementById('pod-v1').value; _pod.v2 = document.getElementById('pod-v2').value;
  _pod.script = document.getElementById('pod-script').value;
  localStorage.setItem('nba2k_pod_script', _pod.script);
}
function _podLines() {
  const n1 = _pod.n1.toLowerCase(), n2 = _pod.n2.toLowerCase();
  let last = 1;
  return _pod.script.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^([^:]{1,24}):\s*(.+)$/);
    if(m) { const who = m[1].trim().toLowerCase(); last = who === n2 ? 2 : who === n1 ? 1 : (last === 1 ? 2 : 1); return { h: last, t: m[2] }; }
    return { h: last, t: l };
  });
}
// dane z ostatnich 7 dni do scenariusza
function _podFacts() {
  const sid = currentSeasonId || null, today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }), from = _ssAddDays(today, -7);
  const ms = _withAllMatches(() => matches.filter(m => (m.seasonId || null) === sid && m.date >= from && !m.walkover));
  const res = ms.map(m => `${m.team1.name} ${m.team1.score}:${m.team2.score} ${m.team2.name}`);
  const perf = ms.flatMap(m => [m.team1, m.team2].flatMap(t => (t.players || []).map(p => ({ n: p.name, t: t.name, p: p.pts || 0, r: p.reb || 0, a: p.ast || 0 })))).sort((a, b) => (b.p + b.r + b.a) - (a.p + a.r + a.a)).slice(0, 5)
    .map(x => `${x.n} (${x.t}): ${x.p} PTS, ${x.r} REB, ${x.a} AST`);
  const table = (_seasonTable(sid) || []).slice(0, 6).map((x, i) => `${i + 1}. ${x.team} ${x.w}-${x.l}`);
  const pr = (powerRankings || []).filter(p => (p.seasonId || null) === sid).slice(-1)[0];
  const typ = (typerData[_seasonKey(sid)]?.overall || []).slice(0, 3).map(x => `${x.name} ${x.pts} pkt`);
  const fx = (fantasyData?.season || []).slice(0, 3).map(x => `${x.name} ${x.pts} pkt`);
  const next = schedule.filter(s => s.generated && (s.seasonId || null) === sid && !s.played && (!s.date || s.date >= today)).slice(0, 4).map(s => `${s.team1} vs ${s.team2}${s.date ? ' (' + s.date + ')' : ''}`);
  return [`Wyniki ostatniego tygodnia: ${res.join('; ') || 'brak'}`, `Najlepsze występy: ${perf.join('; ') || 'brak'}`, `Tabela: ${table.join(', ') || 'brak'}`,
    pr ? `Power Ranking: ${(pr.items || pr.ranking || []).slice(0, 5).map((x, i) => `${i + 1}. ${x.team || x.name || x}`).join(', ')}` : '',
    `Typer (prowadzący): ${typ.join(', ') || 'brak'}`, `Fantasy (prowadzący): ${fx.join(', ') || 'brak'}`, `Najbliższe mecze: ${next.join('; ') || 'brak'}`].filter(Boolean).join('\n');
}
async function podWriteScript() {
  _podReadForm();
  const st = document.getElementById('pod-status'); st.style.color = 'var(--muted)'; st.textContent = '⏳ AI pisze scenariusz…';
  const prompt = `Napisz scenariusz krótkiego podcastu (ok. 2–3 minuty czytania, 14–18 wypowiedzi) o polskiej lidze NBA 2K „2K Pro-Am Ekstraklasa”.
Prowadzą: ${_pod.n1} i ${_pod.n2} — luźno, z humorem, z emocjami, jak kumple komentujący mecze. Liczby zapisuj słownie (np. „sześćdziesiąt osiem do czterdziestu siedmiu”), nicki graczy zostaw w oryginalnej pisowni.
Bloki: powitanie, hit tygodnia, bohater tygodnia, krótko tabela/Power Ranking, typer i fantasy, zapowiedź najbliższych meczów z typami prowadzących, pożegnanie z adresem chemikleagues kropka com.
Używaj TYLKO faktów z danych poniżej — nic nie zmyślaj.
Format: każda linijka „${_pod.n1}: tekst” albo „${_pod.n2}: tekst”, bez nagłówków i komentarzy.

DANE:
${_podFacts()}`;
  const r = await _api('/gemini', 'POST', { model: 'gemini-2.5-flash', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }, { admin: true });
  const txt = r?.content?.[0]?.text || '';
  if(!txt.trim()) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + (r?.error || 'AI nie zwróciło scenariusza'); return; }
  document.getElementById('pod-script').value = txt.trim().replace(/^```\w*|```$/g, '').trim();
  _podReadForm();
  st.style.color = 'var(--win)'; st.textContent = '✅ Scenariusz gotowy — przeczytaj, popraw jeśli trzeba, i nagraj.';
}
function _pcmToWav(pcm, rate) {
  const buf = new ArrayBuffer(44 + pcm.length), v = new DataView(buf), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, pcm.length, true);
  new Uint8Array(buf, 44).set(pcm);
  return new Blob([buf], { type: 'audio/wav' });
}
async function podRecord() {
  _podReadForm();
  const lines = _podLines();
  const st = document.getElementById('pod-status');
  if(!lines.length) { st.style.color = 'var(--loss)'; st.textContent = 'Scenariusz jest pusty'; return; }
  st.style.color = 'var(--muted)'; st.textContent = `⏳ Nagrywam ${lines.length} wypowiedzi… (zwykle 30–90 s)`;
  try {
    const r = await fetch(workerUrl.replace(/\/+$/, '') + '/podcast/tts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Token': _adminToken() },
      body: JSON.stringify({ lines, name1: _pod.n1, name2: _pod.n2, voice1: _pod.v1, voice2: _pod.v2 }) });
    const j = await r.json();
    if(!r.ok) throw new Error(j.error || 'Błąd ' + r.status);
    const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData || p.inline_data);
    const inl = part?.inlineData || part?.inline_data;
    if(!inl?.data) throw new Error('Gemini nie zwróciło dźwięku');
    const rate = +(String(inl.mimeType || inl.mime_type || '').match(/rate=(\d+)/)?.[1] || 24000);
    const bin = atob(inl.data), pcm = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) pcm[i] = bin.charCodeAt(i);
    _pod.pcm = pcm; _pod.rate = rate; _pod.mp3 = null;
    if(_pod.url) URL.revokeObjectURL(_pod.url);
    _pod.url = URL.createObjectURL(_pcmToWav(pcm, rate));
    document.getElementById('pod-out').innerHTML = _podOutHtml();
    const mdl = r.headers.get('X-TTS-Model') || 'Gemini TTS';
    st.style.color = 'var(--win)'; st.textContent = `✅ Gotowe — ${Math.round(pcm.length / 2 / rate)} s nagrania (${mdl.split(' | ')[0]}${/free-key/.test(mdl) ? ', darmowy klucz 🆓' : /paid-key/.test(mdl) ? ', klucz płatny' : ''})`;
  } catch(e) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + e.message; }
}
async function _podMp3() {
  if(_pod.mp3) return _pod.mp3;
  if(!window.lamejs) await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'; s.onload = ok; s.onerror = () => bad(new Error('Nie udało się wczytać kodera MP3')); document.head.appendChild(s); });
  const samples = new Int16Array(_pod.pcm.buffer, _pod.pcm.byteOffset, Math.floor(_pod.pcm.length / 2));
  const enc = new lamejs.Mp3Encoder(1, _pod.rate, 64), out = [];
  for(let i = 0; i < samples.length; i += 1152) { const b = enc.encodeBuffer(samples.subarray(i, i + 1152)); if(b.length) out.push(b); }
  const end = enc.flush(); if(end.length) out.push(end);
  return (_pod.mp3 = new Blob(out, { type: 'audio/mpeg' }));
}
async function podDownload() {
  try { const b = await _podMp3(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ekstraklasa-weekly.mp3'; a.click(); }
  catch(e) { showToast('❌ ' + e.message, 'error'); }
}
async function podToDiscord() {
  if(!confirm('Wysłać odcinek na kanał terminarza na Discordzie?')) return;
  try {
    const b = await _podMp3();
    const dataUrl = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
    const ok = await _discordPost('schedule', { content: `🎙 **Ekstraklasa Weekly** — podcast ligi! Posłuchajcie podsumowania tygodnia 🏀` }, dataUrl, 'ekstraklasa-weekly.mp3');
    showToast(ok ? '📣 Odcinek wysłany na Discord' : '❌ Discord nie przyjął pliku', ok ? 'success' : 'error');
  } catch(e) { showToast('❌ ' + e.message, 'error'); }
}
// ═══ 🎧 PODCAST — publiczna zakładka z odcinkami ═══
// 🔗 link do odcinka podcastu: chemikleagues.com/#podcast/<id> (otwiera stronę na tym odcinku)
function podCopyLink(id) { const u = location.origin + '/podcast/' + encodeURIComponent(id); (navigator.clipboard?.writeText(u) || Promise.reject()).then(() => showToast(_g('🔗 Skopiowano link do odcinka', '🔗 Episode link copied'), 'success')).catch(() => prompt(_g('Link do odcinka:', 'Episode link:'), u)); }
function _podFocus() { const id = window._podFocusId; if(!id) return; window._podFocusId = null; const el = document.getElementById('pod-ep-' + id); if(!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '2px solid var(--accent)'; el.style.outlineOffset = '2px'; setTimeout(() => { el.style.outline = ''; }, 4000); }
async function renderPodcastView() {
  const el = document.getElementById('podcast-view'); if(!el) return;
  el.innerHTML = '<div class="section-title">🎧 Ekstraklasa Weekly</div><div style="color:var(--muted)">⏳ Wczytuję odcinki…</div>';
  const r = await _api('/podcast/episodes', 'GET', null, {});
  const eps = r.ok ? r.episodes || [] : [], links = r.links || {}, admin = _isLoggedInSync();
  const dur = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '';
  const btn = (href, label, bg) => href ? `<a href="${_h(href)}" target="_blank" rel="noopener" class="btn" style="text-decoration:none;background:${bg};color:#fff;border:none;font-size:.78rem">${label}</a>` : '';
  el.innerHTML = `<div class="section-title">🎧 Ekstraklasa Weekly</div>
    <div class="card" style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;padding:1rem;margin-bottom:1rem">
      <img src="icons/podcast-cover.png" alt="" style="width:120px;height:120px;border-radius:12px;object-fit:cover;flex-shrink:0">
      <div style="flex:1;min-width:220px">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem">Podcast ligi NBA 2K Pro-Am</div>
        <div style="font-size:.84rem;color:var(--muted);margin:.25rem 0 .6rem;line-height:1.5">Co tydzień po kolejce: wyniki, bohaterowie, „cegły tygodnia”, tabela i zapowiedzi — z humorem i rzetelnymi statystykami.</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">${btn(links.spotify, '🟢 Spotify', '#1db954')}${btn(links.apple, '🟣 Apple Podcasts', '#8e44ad')}
          ${r.rss ? `<button class="btn btn-ghost" style="font-size:.74rem" onclick="navigator.clipboard?.writeText('${_h(r.rss)}').then(()=>showToast('📋 Skopiowano adres RSS — wklej go w swojej aplikacji do podcastów','success'))">📡 RSS</button>` : ''}</div>
      </div>
    </div>
    ${admin ? `<details class="card" style="padding:.7rem .9rem;margin-bottom:1rem;font-size:.8rem"><summary style="cursor:pointer;color:var(--accent);font-weight:700">⚙ Admin: Spotify / Apple i kanał RSS</summary>
      <div style="margin:.5rem 0;line-height:1.6">Adres kanału RSS do zgłoszenia w <b>Spotify for Creators</b> (Add podcast → „I already have a podcast” → RSS) i <b>Apple Podcasts Connect</b>:<br><code style="font-size:.74rem;background:var(--surface2);padding:.15rem .35rem;border-radius:4px;word-break:break-all">${_h(r.rss || '')}</code></div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:.4rem;align-items:end">
        <div><label style="${_MODAL_LBL}">Link Spotify</label><input id="pod-sp" value="${_h(links.spotify || '')}" placeholder="https://open.spotify.com/show/…" style="${_MODAL_INP};font-size:.78rem"></div>
        <div><label style="${_MODAL_LBL}">Link Apple Podcasts</label><input id="pod-ap" value="${_h(links.apple || '')}" placeholder="https://podcasts.apple.com/…" style="${_MODAL_INP};font-size:.78rem"></div>
        <button class="btn btn-primary" style="font-size:.74rem" onclick="podSaveLinks()">💾 Zapisz</button>
      </div>
      <div style="border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem">
        <div style="font-weight:700;margin-bottom:.35rem">⬆ Dodaj odcinek z pliku</div>
        <div style="color:var(--muted);margin-bottom:.45rem">Np. odcinek opublikowany wcześniej tylko na Discordzie — pobierz MP3 z wiadomości i wgraj tutaj. Ta sama kolejka zastąpi poprzednią wersję.</div>
        <div style="display:grid;grid-template-columns:90px 1fr auto;gap:.4rem;align-items:end">
          <div><label style="${_MODAL_LBL}">Kolejka</label><input id="pod-up-week" type="number" min="1" value="1" style="${_MODAL_INP};font-size:.78rem"></div>
          <div><label style="${_MODAL_LBL}">Plik MP3</label><input id="pod-up-file" type="file" accept="audio/mpeg,.mp3" style="${_MODAL_INP};font-size:.74rem;padding:.25rem"></div>
          <button class="btn btn-primary" style="font-size:.74rem" onclick="podUploadFile()">⬆ Dodaj</button>
        </div>
        <div id="pod-up-status" style="font-size:.76rem;margin-top:.35rem"></div>
      </div></details>` : ''}
    ${eps.length ? `<div style="display:flex;flex-direction:column;gap:.6rem">${eps.map((e, i) => `<div class="card" id="pod-ep-${_h(e.id)}" style="padding:.75rem .9rem;margin:0">
        <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:baseline;flex-wrap:wrap">
          <div style="font-weight:800">${i === 0 ? '<span style="background:#dc2626;color:#fff;font-size:.6rem;font-weight:900;border-radius:4px;padding:.05rem .35rem;margin-right:.35rem">NOWY</span>' : ''}${_h(e.title)}</div>
          <div style="font-size:.72rem;color:var(--muted)">${new Date(e.at).toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}${e.duration ? ' · ' + dur(e.duration) : ''}
            <a href="#" onclick="podCopyLink('${_h(e.id)}');return false" style="color:var(--accent);margin-left:.4rem" title="${_g('Kopiuj link do odcinka', 'Copy episode link')}">🔗 Link</a>
            ${admin ? `<a href="#" onclick="podDeleteEp('${_h(e.id)}');return false" style="color:var(--loss);margin-left:.4rem">usuń</a>` : ''}</div>
        </div>
        <audio controls preload="none" src="${_h(e.url)}" style="width:100%;margin-top:.5rem"></audio>
        ${e.description ? `<div style="font-size:.76rem;color:var(--muted);margin-top:.35rem;white-space:pre-line;line-height:1.5" data-notr>${_h(e.description.split('\n').slice(0, 4).join('\n'))}</div>` : ''}
      </div>`).join('')}</div>`
      : `<div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">Pierwszy odcinek pojawi się po zakończeniu kolejki 🎙</div>`}`;
  setTimeout(_podFocus, 200);
}
async function podUploadFile() {
  const f = document.getElementById('pod-up-file')?.files?.[0], week = +document.getElementById('pod-up-week').value, st = document.getElementById('pod-up-status');
  if(!f || !week) { st.style.color = 'var(--loss)'; st.textContent = 'Wybierz plik MP3 i kolejkę'; return; }
  // długość nagrania z pliku (do opisu w RSS)
  let duration = null;
  try { const a = new Audio(URL.createObjectURL(f)); await new Promise(r => { a.onloadedmetadata = r; a.onerror = r; setTimeout(r, 4000); }); if(isFinite(a.duration)) duration = Math.round(a.duration); } catch(e) {}
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Wgrywam…';
  const meta = { week, season: currentSeasonId || null, title: `Ekstraklasa Weekly — Week ${week}`, description: `Podsumowanie ${week}. kolejki ${_seasonName(currentSeasonId) || ''}.\n${location.origin}`, duration };
  try {
    const res = await fetch(workerUrl.replace(/\/+$/, '') + '/podcast/upload', { method: 'POST', headers: { 'X-Admin-Token': _adminToken(), 'Content-Type': 'audio/mpeg', 'X-Meta': encodeURIComponent(JSON.stringify(meta)) }, body: f });
    const j = await res.json().catch(() => ({}));
    st.style.color = res.ok ? 'var(--win)' : 'var(--loss)'; st.textContent = res.ok ? '✅ Odcinek dodany' : '❌ ' + (j.error || 'HTTP ' + res.status);
    if(res.ok) setTimeout(renderPodcastView, 600);
  } catch(e) { st.style.color = 'var(--loss)'; st.textContent = '❌ Nie udało się połączyć z Workerem — sprawdź, czy wgrany jest najnowszy worker.js'; }
}
async function podSaveLinks() {
  const r = await _api('/podcast/week', 'POST', { links: { spotify: document.getElementById('pod-sp').value.trim(), apple: document.getElementById('pod-ap').value.trim() } }, { admin: true });
  showToast(r.ok ? '✅ Zapisano linki' : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) renderPodcastView();
}
async function podDeleteEp(id) {
  if(!confirm('Usunąć ten odcinek z kanału podcastu (Spotify / Apple też go stracą)?')) return;
  const r = await _api('/podcast/episode', 'DELETE', { id }, { admin: true });
  showToast(r.ok ? '🗑 Usunięto odcinek' : '❌ ' + r.error, r.ok ? 'success' : 'error'); if(r.ok) renderPodcastView();
}
// ═══════════════════════════════════════════════════════════════
// 🎬 SHORT TYGODNIA — pionowe wideo 1080×1920 nagrywane w przeglądarce (canvas + MediaRecorder)
// ═══════════════════════════════════════════════════════════════
function _shortFacts(week) {
  const sid = currentSeasonId || null;
  const fx = schedule.filter(s => s.generated && !s.makeup && (s.seasonId || null) === sid && +s.week === +week);
  const all = _withAllMatches(() => matches.slice());
  const byId = new Map(all.map(m => [String(m.id), m]));
  const games = [], results = [];
  fx.forEach(s => {
    const ms = (s.matchIds || []).map(id => byId.get(String(id))).filter(Boolean);
    let a = 0, b = 0; ms.forEach(m => { const sw = m.team1.name === s.team2; const x = sw ? +m.team2.score : +m.team1.score, y = sw ? +m.team1.score : +m.team2.score; x > y ? a++ : b++; games.push(m); });
    results.push({ t1: s.team1, t2: s.team2, score: ms.length ? `${a}:${b}${ms.some(m => m.walkover) ? ' (w/o)' : ''}` : '—' });
  });
  const P = {};
  games.forEach(m => [[m.team1, m.team2], [m.team2, m.team1]].forEach(([t, o]) => (t.players || []).forEach(p => {
    const k = _normNick(p.name); const a = P[k] = P[k] || { name: p.name, team: t.name, gp: 0, pts: 0, reb: 0, ast: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, to: 0 };
    a.gp++; ['pts', 'reb', 'ast', 'fgm', 'fga', 'tpm', 'tpa', 'to'].forEach(f => { a[f] += +p[f] || 0; });
  })));
  const ps = Object.values(P);
  const gs = a => a.pts + a.reb * 1.2 + a.ast * 1.5 - a.to - (a.fga - a.fgm) * 0.4;
  const hero = [...ps].sort((x, y) => gs(y) - gs(x))[0];
  const brick = ps.filter(a => a.gp && a.fga / a.gp >= 8).sort((x, y) => x.fgm / x.fga - y.fgm / y.fga || (y.fga - y.fgm) - (x.fga - x.fgm))[0]; // najgorszy % z gry w kolejce (min. średnio 8 rzutów na mecz)
  const ws = fx.map(f => f.weekStart).filter(Boolean).sort()[0], end = ws ? _ssAddDays(ws, 7) : '9999';
  const tb = {};
  all.filter(m => (m.seasonId || null) === sid && String(m.date) < end).forEach(m => { // walkower liczy się do bilansu, bez punktów
    const a = tb[m.team1.name] = tb[m.team1.name] || { w: 0, l: 0, d: 0 }, b = tb[m.team2.name] = tb[m.team2.name] || { w: 0, l: 0, d: 0 };
    const x = +m.team1.score, y = +m.team2.score; if(!m.walkover) { a.d += x - y; b.d += y - x; } x > y ? (a.w++, b.l++) : (b.w++, a.l++);
  });
  const table = Object.entries(tb).sort((x, y) => y[1].w - x[1].w || y[1].d - x[1].d).slice(0, 5).map(([t, x]) => ({ t, rec: `${x.w}-${x.l}` }));
  return { week, season: _seasonName(sid) || '', results, hero, brick, table, games: games.length };
}
function _topClipsOf(week) { const sid = currentSeasonId || null, ids = new Set(schedule.filter(s => (s.seasonId || null) === sid && +s.week === +week).map(s => String(s.id)));
  return (clipsList || []).filter(c => ids.has(String(c.scheduleId)) && /discord(app)?\.com\/channels\//.test(c.url || '')).sort((a, b) => _tcLikes(b) - _tcLikes(a) || String(a.at).localeCompare(String(b.at))).slice(0, 5); }
function openTopClipsMaker() {
  const sid = currentSeasonId || null, weeks = [...new Set(schedule.filter(s => (s.seasonId || null) === sid && s.week).map(s => +s.week))].sort((a, b) => b - a).filter(w => _topClipsOf(w).length);
  const m = _fxModal('topclips-modal', 640); m.classList.add('open');
  if(!weeks.length) { m.querySelector('.modal').innerHTML = _fxHead('topclips-modal', '🎬 Top akcje tygodnia') + '<div style="color:var(--muted);font-size:.85rem">Brak akcji z Discorda (wgranych plików albo linków do wiadomości) w kolejkach tego sezonu.</div>'; return; }
  const w = window._tcWeek && weeks.includes(window._tcWeek) ? window._tcWeek : weeks[0], L = _topClipsOf(w), canRec = typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
  m.querySelector('.modal').innerHTML = _fxHead('topclips-modal', '🎬 Top akcje tygodnia') + `<div data-notr>
    <div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.6rem"><select onchange="window._tcWeek=+this.value;openTopClipsMaker()" style="${_MODAL_INP};width:auto;margin:0">${weeks.map(x => `<option value="${x}" ${x === w ? 'selected' : ''}>Week ${x} (${_topClipsOf(x).length})</option>`).join('')}</select><span style="font-size:.76rem;color:var(--muted)">${_g('Kolejność: najwięcej ❤, nagranie od #' + L.length + ' do #1', 'Order: most ❤, recorded from #' + L.length + ' to #1')}</span></div>
    ${L.map((c, i) => `<div style="display:flex;gap:.5rem;align-items:center;font-size:.82rem;padding:.3rem 0;border-bottom:1px solid var(--border)"><b style="width:26px;color:var(--accent)">#${i + 1}</b><span style="flex:1">${_h(c.title || 'Akcja')} <span style="color:var(--muted);font-size:.72rem">· ${_h(c.by?.name || '')}${c.team ? ' (' + _h(c.team) + ')' : ''}</span></span><span>❤ ${_tcLikes(c)}</span></div>`).join('')}
    <div style="display:flex;gap:.8rem;align-items:flex-start;margin-top:.7rem;flex-wrap:wrap"><canvas id="tc-canvas" width="1080" height="1920" style="width:180px;height:320px;border-radius:10px;background:#000"></canvas>
      <div style="flex:1;min-width:200px"><div style="font-size:.76rem;color:var(--muted);margin-bottom:.5rem">${_g('Każda akcja do 12 s, przed nią plansza z miejscem, opisem, autorem i ❤. Dźwięk z klipów. Nagranie trwa tyle, ile film (ok. 1 min) — nie zamykaj karty.', 'Each highlight up to 12 s, preceded by a card with rank, title, author and ❤. Audio from the clips. Recording takes as long as the video (~1 min) — keep this tab open.')}</div>
        ${canRec ? `<button class="btn btn-primary" onclick="topClipsRecord(${w})">🔴 ${_g('Nagraj', 'Record')}</button>` : `<div style="color:var(--loss);font-size:.8rem">${_g('Ta przeglądarka nie nagrywa wideo — użyj Chrome lub Edge na komputerze.', 'This browser can’t record video — use Chrome or Edge on a computer.')}</div>`}
        <div id="tc-status" style="font-size:.78rem;margin-top:.5rem"></div><div id="tc-actions" style="display:flex;gap:.4rem;margin-top:.5rem;flex-wrap:wrap"></div></div></div></div>`;
}
async function topClipsRecord(week) {
  const L = _topClipsOf(week), c = document.getElementById('tc-canvas'), g = c.getContext('2d'), st = document.getElementById('tc-status'), W = 1080, H = 1920;
  let actx = null; try { actx = new AudioContext(); await actx.resume(); } catch(e) {}
  const dest = actx?.createMediaStreamDestination(), stream = c.captureStream(30); dest?.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  const types = ['video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'], type = types.find(x => MediaRecorder.isTypeSupported(x)) || '';
  const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 2_200_000 }), chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const stopped = new Promise(r => rec.onstop = r); rec.start(500);
  const bg = () => { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1a1205'); gr.addColorStop(1, '#0b0d12'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
  const text = (t, x, y, font, col, al = 'center') => { g.font = font; g.fillStyle = col; g.textAlign = al; g.fillText(t, x, y); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = async (ms, draw) => { const t0 = performance.now(); while(performance.now() - t0 < ms) { draw((performance.now() - t0) / ms); await new Promise(r => requestAnimationFrame(r)); } };
  await anim(1800, p => { bg(); text('🎬 TOP ' + L.length, W / 2, 820, '900 150px "Barlow Condensed", Arial', '#f5c518'); text(_g('AKCJI TYGODNIA', 'PLAYS OF THE WEEK'), W / 2, 960, '900 96px "Barlow Condensed", Arial', '#fff'); text('WEEK ' + week + ' · ' + (_seasonName(currentSeasonId) || ''), W / 2, 1060, '600 46px Arial', '#9ca3af'); });
  for(let i = L.length - 1; i >= 0; i--) {
    const cl = L[i], rank = i + 1; st.textContent = `⏳ ${_g('Nagrywam', 'Recording')} #${rank} — ${cl.title || ''}`;
    await anim(1700, p => { bg(); text('#' + rank, W / 2, 760, '900 300px "Barlow Condensed", Arial', '#f5c518'); text(String(cl.title || 'Akcja').slice(0, 30), W / 2, 960, '800 64px Arial', '#fff');
      text(`${cl.by?.name || ''}${cl.team ? ' · ' + cl.team : ''}`, W / 2, 1050, '600 44px Arial', '#9ca3af'); text('❤ ' + _tcLikes(cl), W / 2, 1150, '800 56px Arial', '#ef4444'); });
    const v = document.createElement('video'); v.crossOrigin = 'anonymous'; v.playsInline = true; v.preload = 'auto'; v.src = workerUrl.replace(/\/+$/, '') + '/clip-video?id=' + encodeURIComponent(cl.id);
    try { await new Promise((ok, no) => { v.oncanplay = ok; v.onerror = () => no(new Error('load')); setTimeout(() => no(new Error('timeout')), 20000); });
      if(actx) { const s = actx.createMediaElementSource(v); s.connect(dest); }
      await v.play(); const t0 = performance.now();
      while(!v.ended && performance.now() - t0 < 12000) { const vw = v.videoWidth || 16, vh = v.videoHeight || 9, sc = Math.max(W / vw, H / vh);
        g.filter = 'blur(28px) brightness(.45)'; g.drawImage(v, (W - vw * sc) / 2, (H - vh * sc) / 2, vw * sc, vh * sc); g.filter = 'none';
        const fs = Math.min(W / vw, H * .7 / vh), fw = vw * fs, fh = vh * fs; g.drawImage(v, (W - fw) / 2, (H - fh) / 2, fw, fh);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, H - 260, W, 260); text('#' + rank + '  ' + String(cl.title || '').slice(0, 26), 60, H - 160, '900 64px "Barlow Condensed", Arial', '#fff', 'left'); text(`${cl.by?.name || ''}${cl.team ? ' · ' + cl.team : ''}  ❤ ${_tcLikes(cl)}`, 60, H - 90, '600 40px Arial', '#f5c518', 'left');
        await new Promise(r => requestAnimationFrame(r)); }
      v.pause();
    } catch(e) { await anim(1200, () => { bg(); text(_g('Akcja niedostępna', 'Highlight unavailable'), W / 2, H / 2, '800 60px Arial', '#9ca3af'); }); }
  }
  await anim(1800, () => { bg(); text('❤ ' + _g('Głosuj na akcje', 'Vote for highlights'), W / 2, 900, '900 90px "Barlow Condensed", Arial', '#fff'); text((location.host || 'chemikleagues.com'), W / 2, 1010, '700 54px Arial', '#f5c518'); });
  rec.stop(); await stopped; const blob = new Blob(chunks, { type: type || 'video/webm' }), ext = /mp4/.test(type) ? 'mp4' : 'webm';
  window._tcBlob = { blob, ext, week, n: L.length };
  st.style.color = 'var(--win)'; st.textContent = `✅ ${_g('Gotowe', 'Done')} — ${(blob.size / 1048576).toFixed(1)} MB (${ext})`;
  document.getElementById('tc-actions').innerHTML = `<button class="btn btn-primary" onclick="topClipsSend()">📤 ${_g('Wyślij na kanał Shorta', 'Send to the Short channel')}</button><button class="btn btn-ghost" onclick="(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(_tcBlob.blob);a.download='top-akcje-week-'+_tcBlob.week+'.'+_tcBlob.ext;a.click();})()">⬇ ${_g('Pobierz', 'Download')}</button>`;
}
async function topClipsSend() {
  const b = window._tcBlob; if(!b || !confirm(`Wysłać Top akcje Week ${b.week} na kanał Discord?`)) return; const st = document.getElementById('tc-status'); st.style.color = 'var(--muted)'; st.textContent = '⏳ Wysyłam…';
  try { const res = await fetch(workerUrl.replace(/\/+$/, '') + '/short/upload', { method: 'POST', headers: { 'X-Admin-Token': _adminToken(), 'Content-Type': b.ext === 'mp4' ? 'video/mp4' : 'video/webm', 'X-Meta': encodeURIComponent(JSON.stringify({ week: b.week, kind: 'clips', n: b.n })) }, body: b.blob });
    const j = await res.json().catch(() => ({})); st.style.color = j.ok ? 'var(--win)' : 'var(--loss)'; st.textContent = j.ok ? '✅ Wysłano na Discord' : '❌ ' + (j.error || 'Błąd'); } catch(e) { st.style.color = 'var(--loss)'; st.textContent = '❌ ' + e.message; }
}
async function openShortMaker() {
  const sid = currentSeasonId || null;
  const weeks = [...new Set(schedule.filter(x => x.generated && (x.seasonId || null) === sid && x.week).map(x => +x.week))].sort((a, b) => a - b);
  const m = _fxModal('short-modal', 520), box = m.querySelector('.modal');
  const canRec = typeof MediaRecorder !== 'undefined' && !!HTMLCanvasElement.prototype.captureStream;
  box.innerHTML = _fxHead('short-modal', '🎬 Short tygodnia') + `
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:.6rem">Pionowe wideo 1080×1920 (~40 s) do TikToka, Reels i Shorts: tytuł, wyniki, bohater, cegła tygodnia, tabela. W tle początek odcinka podcastu z tej kolejki (jeśli jest). Nagrywa się w czasie rzeczywistym — nie zamykaj okna.</div>
    ${canRec ? '' : '<div style="color:var(--loss);font-size:.8rem;margin-bottom:.5rem">Ta przeglądarka nie potrafi nagrywać wideo — użyj Chrome albo Edge na komputerze.</div>'}
    <div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.6rem;flex-wrap:wrap">
      <select id="sh-week" style="${_MODAL_INP};width:auto">${weeks.map(w => `<option value="${w}">Week ${w}</option>`).join('')}</select>
      <label style="display:flex;align-items:center;gap:.3rem;font-size:.76rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text);margin:0"><input type="checkbox" id="sh-audio" checked style="width:auto;margin:0;accent-color:var(--accent)"> dźwięk z podcastu</label>
      <label class="btn btn-ghost" style="font-size:.7rem;padding:.2rem .5rem;margin:0;cursor:pointer" title="Np. muzyka w tle — ma pierwszeństwo przed podcastem">🎵 <span id="sh-file-name">własny plik audio</span><input type="file" id="sh-file" accept="audio/*" style="display:none" onchange="document.getElementById('sh-file-name').textContent=this.files[0]?.name?.slice(0,22)||'własny plik audio'"></label>
      <button class="btn btn-ghost" style="font-size:.74rem" onclick="shortPreview()">👁 Podgląd</button>
      <button class="btn btn-primary" style="font-size:.74rem" onclick="shortRecord()" ${canRec ? '' : 'disabled'}>⏺ Nagraj</button>
    </div>
    <div style="display:flex;justify-content:center"><canvas id="sh-canvas" width="1080" height="1920" style="width:270px;height:480px;border-radius:14px;background:#000;box-shadow:0 8px 30px rgba(0,0,0,.4)"></canvas></div>
    <div id="sh-status" style="font-size:.8rem;text-align:center;margin-top:.6rem;min-height:1.1em"></div>`;
  m.classList.add('open');
  const f = _shortFacts(+(weeks[weeks.length - 1] || 1));
  _shortDraw(document.getElementById('sh-canvas').getContext('2d'), f, 1.2);
}
// klatka w chwili t (s); sceny po kolei z animowanym wejściem
function _shortDraw(g, f, t) {
  const W = 1080, H = 1920, font = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const scenes = [['intro', 5], ['results', 8], ['hero', 8], ['brick', 7], ['table', 7], ['outro', 5]];
  const total = scenes.reduce((n, x) => n + x[1], 0);
  let acc = 0, sc = scenes[scenes.length - 1][0], len = scenes[scenes.length - 1][1], st = Math.max(0, t - (total - len)); // po końcu — pełna ostatnia plansza
  for(const [n, d] of scenes) { if(t < acc + d) { sc = n; st = t - acc; len = d; break; } acc += d; }
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  const inA = (delay = 0) => ease((st - delay) / 0.6);
  // tło
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1a0b2e'); bg.addColorStop(.55, '#3b0d1c'); bg.addColorStop(1, '#0b0e14');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .18; g.fillStyle = '#f5c518'; g.beginPath(); g.arc(W * .85 + Math.sin(t / 3) * 60, 380 + Math.cos(t / 4) * 40, 380, 0, Math.PI * 2); g.fill(); g.restore();
  g.textAlign = 'center';
  const txt = (s, y, size, color, weight = 900, a = 1, dy = 0) => { g.save(); g.globalAlpha = a; g.fillStyle = color; g.font = `${weight} ${size}px ${font}`; g.fillText(String(s), W / 2, y + dy); g.restore(); };
  const fit = (s, max, size, weight = 900) => { g.font = `${weight} ${size}px ${font}`; while(g.measureText(s).width > max && size > 30) { size -= 4; g.font = `${weight} ${size}px ${font}`; } return size; };
  // pasek postępu i nagłówek
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(80, 120, W - 160, 10); g.fillStyle = '#f5c518'; g.fillRect(80, 120, (W - 160) * Math.min(1, t / SHORT_LEN), 10);
  txt(`EKSTRAKLASA WEEKLY · WEEK ${f.week}`, 210, 46, 'rgba(255,255,255,.75)', 800);
  const a = inA(), d = (1 - a) * 80;
  if(sc === 'intro') {
    txt('🏀', 760, 220, '#fff', 900, a, d);
    txt('PODSUMOWANIE', 960, 120, '#f5c518', 900, a, d);
    txt(`${f.week}. KOLEJKI`, 1090, 120, '#fff', 900, inA(.2), (1 - inA(.2)) * 80);
    txt(f.season, 1190, 54, 'rgba(255,255,255,.7)', 700, inA(.4));
    txt(`${f.games} meczów · ${f.results.length} spotkań`, 1290, 54, 'rgba(255,255,255,.7)', 700, inA(.6));
  } else if(sc === 'results') {
    txt('WYNIKI KOLEJKI', 380, 96, '#f5c518', 900, a, d);
    f.results.slice(0, 8).forEach((r, i) => { const ai = inA(.25 + i * .25), y = 560 + i * 160;
      g.save(); g.globalAlpha = ai; g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.roundRect ? g.roundRect(80 + (1 - ai) * 200, y - 85, W - 160, 130, 24) : g.rect(80, y - 85, W - 160, 130); g.fill(); g.restore();
      g.save(); g.globalAlpha = ai; g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = `800 ${fit(r.t1, 330, 50, 800)}px ${font}`; g.fillText(r.t1, 120, y); g.textAlign = 'right'; g.font = `800 ${fit(r.t2, 330, 50, 800)}px ${font}`; g.fillText(r.t2, W - 120, y); g.textAlign = 'center'; g.fillStyle = '#f5c518'; g.font = `900 70px ${font}`; g.fillText(r.score, W / 2, y + 6); g.restore(); });
  } else if(sc === 'hero' && f.hero) {
    const h = f.hero;
    txt('⭐ BOHATER TYGODNIA', 400, 86, '#f5c518', 900, a, d);
    txt(h.name, 600, fit(h.name, W - 160, 130), '#fff', 900, inA(.2), (1 - inA(.2)) * 80);
    txt(`${h.team} · ${h.gp} ${h.gp === 1 ? 'mecz' : 'mecze'}`, 690, 54, 'rgba(255,255,255,.7)', 700, inA(.3));
    [[h.pts, 'PUNKTÓW'], [h.reb, 'ZBIÓREK'], [h.ast, 'ASYST']].forEach(([v, l], i) => { const ai = inA(.5 + i * .3), y = 960 + i * 300;
      const n = Math.round(v * Math.min(1, Math.max(0, (st - .5 - i * .3) / 1.2)));
      txt(n, y, 220, '#f5c518', 900, ai); txt(l, y + 80, 56, 'rgba(255,255,255,.8)', 800, ai); });
  } else if(sc === 'brick' && f.brick) {
    const b = f.brick, pct = Math.round(b.fgm / b.fga * 100);
    txt('🧱 CEGŁA TYGODNIA', 400, 90, '#fb923c', 900, a, d);
    txt(b.name, 620, fit(b.name, W - 160, 130), '#fff', 900, inA(.2), (1 - inA(.2)) * 80);
    txt(b.team, 710, 54, 'rgba(255,255,255,.7)', 700, inA(.3));
    txt(`${b.fgm}/${b.fga}`, 1020, 240, '#fb923c', 900, inA(.5)); txt('Z GRY', 1110, 60, 'rgba(255,255,255,.8)', 800, inA(.5));
    txt(`${pct}% skuteczności`, 1280, 70, '#fff', 800, inA(.8));
    txt('Obręcz prosi o urlop 🙏', 1450, 62, 'rgba(255,255,255,.75)', 700, inA(1.1));
  } else if(sc === 'table') {
    txt('📊 TABELA', 380, 96, '#f5c518', 900, a, d);
    f.table.forEach((r, i) => { const ai = inA(.2 + i * .25), y = 600 + i * 190;
      g.save(); g.globalAlpha = ai; g.textAlign = 'left'; g.fillStyle = i === 0 ? '#f5c518' : '#fff'; g.font = `900 80px ${font}`; g.fillText(`${i + 1}.`, 110, y);
      g.font = `800 ${fit(r.t, 600, 66, 800)}px ${font}`; g.fillText(r.t, 220, y); g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `900 72px ${font}`; g.fillText(r.rec, W - 110, y); g.restore(); });
  } else {
    txt('🎧', 760, 220, '#fff', 900, a, d);
    txt('CAŁY ODCINEK', 960, 110, '#f5c518', 900, a, d);
    txt('PODCASTU', 1080, 110, '#fff', 900, inA(.2));
    txt((location.host || 'chemikleagues.com').replace(/^www\./, '') + '/#podcast', 1220, 58, 'rgba(255,255,255,.85)', 800, inA(.4));
    txt('Obserwuj ligę 🏀', 1340, 58, 'rgba(255,255,255,.7)', 700, inA(.6));
  }
  g.textAlign = 'left';
}
function shortPreview() {
  const c = document.getElementById('sh-canvas'), g = c.getContext('2d'), f = _shortFacts(+document.getElementById('sh-week').value);
  cancelAnimationFrame(_shortAnim); const t0 = performance.now();
  const loop = () => { const t = (performance.now() - t0) / 1000; if(t > SHORT_LEN) return; _shortDraw(g, f, t); _shortAnim = requestAnimationFrame(loop); };
  loop();
}
async function shortToDiscord() {
  const sb = window._shortBlob; if(!sb) return;
  if(!confirm(`Wysłać Short Week ${sb.week} na kanał Discord?`)) return;
  const st = document.getElementById('sh-status'), note = document.createElement('div');
  note.style.cssText = 'font-size:.76rem;margin-top:.4rem;color:var(--muted)'; note.textContent = '⏳ Wysyłam na Discord…'; st.appendChild(note);
  try {
    const res = await fetch(workerUrl.replace(/\/+$/, '') + '/short/upload', { method: 'POST',
      headers: { 'X-Admin-Token': _adminToken(), 'Content-Type': sb.ext === 'mp4' ? 'video/mp4' : 'video/webm', 'X-Meta': encodeURIComponent(JSON.stringify({ week: sb.week })) }, body: sb.blob });
    const j = await res.json().catch(() => ({}));
    note.style.color = res.ok ? 'var(--win)' : 'var(--loss)'; note.textContent = res.ok ? '✅ Short wysłany na Discord' : '❌ ' + (j.error || 'HTTP ' + res.status);
  } catch(e) { note.style.color = 'var(--loss)'; note.textContent = '❌ Nie udało się połączyć z Workerem — sprawdź, czy wgrany jest najnowszy worker.js'; }
}
async function shortRecord() {
  const week = +document.getElementById('sh-week').value, st = document.getElementById('sh-status');
  const c = document.getElementById('sh-canvas'), g = c.getContext('2d'), f = _shortFacts(week);
  if(!f.results.length) { st.textContent = 'Brak meczów w tej kolejce'; return; }
  cancelAnimationFrame(_shortAnim);
  // moduł dźwięku uruchamiany od razu po kliknięciu — inaczej przeglądarka go wycisza (zasady autoodtwarzania)
  let actx = null; try { actx = new AudioContext(); await actx.resume(); } catch(e) {}
  st.style.color = 'var(--muted)'; st.textContent = '⏳ Przygotowuję…';
  const stream = c.captureStream(30);
  let audioNote = '🔇 bez dźwięku';
  const file = document.getElementById('sh-file')?.files?.[0];
  if(actx && (file || document.getElementById('sh-audio').checked)) {
    try {
      let buf = null;
      if(file) { buf = await file.arrayBuffer(); audioNote = '🎵 dźwięk: ' + file.name; }
      else {
        const r = await _api('/podcast/episodes', 'GET', null, {});
        const ep = (r.episodes || []).find(e => +e.week === week);
        if(ep) { buf = await (await fetch(ep.url)).arrayBuffer(); audioNote = `🎧 dźwięk: odcinek podcastu Week ${week}`; }
        else audioNote = `🔇 bez dźwięku — brak opublikowanego odcinka podcastu Week ${week} (opublikuj go w studiu 🎙 Podcast albo wybierz 🎵 własny plik)`;
      }
      if(buf) {
        const audio = await actx.decodeAudioData(buf);
        const src = actx.createBufferSource(); src.buffer = audio;
        const gain = actx.createGain(); gain.gain.setValueAtTime(1, actx.currentTime); gain.gain.setValueAtTime(1, actx.currentTime + SHORT_LEN - 2); gain.gain.linearRampToValueAtTime(0, actx.currentTime + SHORT_LEN);
        const dest = actx.createMediaStreamDestination(); src.connect(gain).connect(dest); src.start(); src.stop(actx.currentTime + SHORT_LEN);
        dest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
      }
    } catch(e) { console.warn('short audio', e); audioNote = '🔇 bez dźwięku — nie udało się wczytać pliku audio'; }
  }
  const types = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  const type = types.find(x => MediaRecorder.isTypeSupported(x)) || '';
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 1_700_000, audioBitsPerSecond: 96_000 }); // ~9 MB / 40 s — mieści się w limicie Discorda
  const chunks = []; rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
  const done = new Promise(res => { rec.onstop = res; });
  rec.start(500);
  const t0 = performance.now();
  await new Promise(res => { const loop = () => { const t = (performance.now() - t0) / 1000; _shortDraw(g, f, Math.min(t, SHORT_LEN)); st.textContent = `⏺ Nagrywam… ${Math.min(SHORT_LEN, Math.round(t))} / ${SHORT_LEN} s`; if(t < SHORT_LEN) _shortAnim = requestAnimationFrame(loop); else res(); }; loop(); });
  rec.stop(); await done; try { actx?.close(); } catch(e) {}
  const ext = /mp4/.test(type) ? 'mp4' : 'webm';
  const blob = new Blob(chunks, { type: type.split(';')[0] || 'video/webm' });
  const url = URL.createObjectURL(blob);
  st.style.color = 'var(--win)';
  window._shortBlob = { blob, ext, week };
  const tooBig = blob.size > 10 * 1024 * 1024;
  st.innerHTML = `<div style="font-size:.74rem;color:${/🔇/.test(audioNote) ? '#f59e0b' : 'var(--muted)'};margin-bottom:.3rem">${_h(audioNote)}</div>✅ Gotowe (${(blob.size / 1048576).toFixed(1)} MB, ${ext.toUpperCase()}) · <a href="${url}" download="ekstraklasa-short-week-${week}.${ext}" style="color:var(--accent);font-weight:800">⬇ Pobierz wideo</a>
    <div style="margin-top:.5rem"><button class="btn btn-primary" style="font-size:.74rem" onclick="shortToDiscord()" ${tooBig ? 'disabled title="Plik ponad 10 MB"' : ''}>📣 Wyślij na Discord</button>${tooBig ? '<div style="color:var(--loss);font-size:.72rem;margin-top:.25rem">Plik ma ponad 10 MB — Discord go nie przyjmie. Pobierz i wrzuć ręcznie.</div>' : ''}</div>${ext === 'webm' ? '<br><span style="color:var(--muted);font-size:.72rem">Przeglądarka zapisała WebM — TikTok i YouTube go przyjmą; na Instagram najlepiej nagrać w nowym Chrome/Edge (MP4).</span>' : ''}`;
}
function _kHash(s) { let h = 2166136261; for(const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function _kTarget(pool) { return pool.length ? pool[_kHash('2kordle:' + _kDay()) % pool.length] : null; }
function _kSave(s) { localStorage.setItem('nba2k_kordle', JSON.stringify(s)); }
function _kStats() { return JSON.parse(localStorage.getItem('nba2k_kordle_stats') || '{"played":0,"won":0,"streak":0,"best":0,"last":null}'); }
function _kCell(guess, target, field) {
  if(field === 'team') return guess.team === target.team ? ['🟩', guess.team] : ['🟥', guess.team];
  if(field === 'pos') return guess.pos === target.pos ? ['🟩', guess.pos] : (guess.pos === target.pos2 || guess.pos2 === target.pos) ? ['🟨', guess.pos] : ['🟥', guess.pos];
  const a = guess[field], b = target[field], tol = field === 'gp' ? 0 : 1;
  return Math.abs(a - b) <= tol ? ['🟩', a] : [a < b ? '⬆️' : '⬇️', a];
}
function renderKordle() {
  const el = document.getElementById('kordle-view'); if(!el) return;
  const pool = _kPool(), target = _kTarget(pool), st = _kState(), stats = (discordUser?.session && window._kMe) || _kStats(), n = _kNum(st.day);
  if(!target) { el.innerHTML = '<div class="section-title">🧩 2Kordle</div><div class="card" style="padding:1.5rem;text-align:center;color:var(--muted)">Zagadka ruszy, gdy w tej edycji zawodnicy rozegrają po kilka meczów.</div>'; return; }
  const won = st.guesses.some(g => g === target.k), over = won || st.guesses.length >= 6;
  const fields = [['team', 'DRUŻYNA'], ['pos', 'POZ'], ['ppg', 'PTS'], ['rpg', 'REB'], ['apg', 'AST'], ['gp', 'MECZE']];
  const rows = st.guesses.map(k => pool.find(p => p.k === k)).filter(Boolean).map(g => `<div style="display:grid;grid-template-columns:1.4fr repeat(6,1fr);gap:.3rem;margin-bottom:.3rem">
      <div style="background:${g.k === target.k ? 'rgba(74,222,128,.2)' : 'var(--surface2)'};border-radius:6px;padding:.4rem;font-weight:800;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(g.name)}</div>
      ${fields.map(([f]) => { const [ic, v] = _kCell(g, target, f); return `<div style="background:${ic === '🟩' ? 'rgba(74,222,128,.22)' : ic === '🟨' ? 'rgba(250,204,21,.22)' : 'var(--surface2)'};border-radius:6px;padding:.35rem .2rem;text-align:center;font-size:.72rem;line-height:1.2"><div style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_h(v)}</div><div>${ic}</div></div>`; }).join('')}
    </div>`).join('');
  el.innerHTML = `<div class="section-title">🧩 2Kordle <span style="font-size:.9rem;color:var(--muted)">#${n}</span></div>
    <div class="card" style="padding:.9rem 1rem;margin-bottom:.8rem">
      <div style="font-size:.82rem;color:var(--muted);line-height:1.5;margin-bottom:.6rem" data-notr>${currentLang === 'en'
        ? `Guess today's league player (${_h(_editionOf(currentSeasonId))}, min. 3 games) in 6 tries. 🟩 correct · 🟨 secondary position · ⬆️⬇️ the answer is higher/lower (per-game averages). A new puzzle every day at midnight.`
        : `Zgadnij dzisiejszego zawodnika ligi (${_h(_editionOf(currentSeasonId))}, min. 3 mecze) w 6 próbach. 🟩 trafione · 🟨 pozycja poboczna · ⬆️⬇️ wartość jest wyższa/niższa (statystyki średnio na mecz). Nowa zagadka codziennie o północy.`}</div>
      ${over ? '' : `<div style="display:flex;gap:.4rem;margin-bottom:.7rem"><input id="k-in" list="k-list" placeholder="${currentLang === 'en' ? `Type a player's nick… (${6 - st.guesses.length} tries left)` : `Wpisz nick zawodnika… (${6 - st.guesses.length} prób)`}" data-notr onkeydown="if(event.key==='Enter')kordleGuess()" style="${_MODAL_INP}">
        <datalist id="k-list">${pool.filter(p => !st.guesses.includes(p.k)).map(p => `<option value="${_h(p.name)}">`).join('')}</datalist>
        <button class="btn btn-primary" onclick="kordleGuess()">Zgadnij</button></div>`}
      <div style="display:grid;grid-template-columns:1.4fr repeat(6,1fr);gap:.3rem;margin-bottom:.3rem;font-size:.6rem;font-weight:800;letter-spacing:.5px;color:var(--muted);text-align:center"><div style="text-align:left">ZAWODNIK</div>${fields.map(f => `<div>${f[1]}</div>`).join('')}</div>
      ${rows || '<div style="font-size:.8rem;color:var(--muted);padding:.5rem 0">Pierwsza próba czeka 👀</div>'}
      ${over ? `<div style="text-align:center;margin-top:.8rem">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;color:${won ? 'var(--win)' : 'var(--loss)'}">${won ? `🎉 Brawo! ${st.guesses.length}/6` : '😵 Tym razem nie'}</div>
        <div style="font-size:.86rem;margin:.2rem 0 .6rem">Dzisiejszy zawodnik: <b>${_h(target.name)}</b> (${_h(target.team)}, ${target.pos}) — ${target.ppg} pkt · ${target.rpg} zb. · ${target.apg} as.</div>
        <div style="font-size:.84rem;margin-bottom:.6rem">⏳ ${_cdHtml('Nowa zagadka za', 'Next puzzle in')}</div>
        <button class="btn btn-primary" style="font-size:.76rem" onclick="kordleShare()">📋 Udostępnij wynik</button>
        <div id="k-stats" style="font-size:.74rem;color:var(--muted);margin-top:.5rem" data-notr>${currentLang === 'en' ? `Your streak: <b>${stats.streak}</b> · best streak: ${stats.best} · played: ${stats.played} · won: ${stats.won}` : `Twoja seria: <b>${stats.streak}</b> · rekord serii: ${stats.best} · rozegrane: ${stats.played} · wygrane: ${stats.won}`}</div></div>` : ''}
    </div>
    <div class="card" style="padding:.8rem 1rem" id="k-board"><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏆 RANKING MIESIĄCA</div><div style="color:var(--muted);font-size:.8rem;margin-top:.4rem">⏳</div></div>`;
  _kBoardLoad(window._kMonth || null);
}
// 🏆 ranking 2Kordle: wybór miesiąca / cały okres; statystyki zalogowanego z serwera
function _kBoardLoad(month) {
  window._kMonth = month || null;
  _api('/kordle/board' + (month ? '?month=' + month : ''), 'GET', null, discordUser?.session ? { session: true } : {}).then(r => {
    const b = document.getElementById('k-board'); if(!b || !r.ok) return;
    if(r.me) { window._kMe = r.me; const sl = document.getElementById('k-stats'); if(sl) sl.innerHTML = _kStatsLine(r.me); }
    const en = currentLang === 'en', mName = m => m === 'all' ? (en ? 'All time' : 'Cały okres') : new Date(m + '-15').toLocaleDateString(en ? 'en-GB' : 'pl-PL', { month: 'long', year: 'numeric' });
    const cur = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(0, 7), months = [...new Set([cur, ...(r.months || [])])];
    b.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap" data-notr><div style="font-size:.7rem;font-weight:800;letter-spacing:1px;color:var(--muted)">🏆 ${en ? 'RANKING' : 'RANKING'}</div>
        <select onchange="_kBoardLoad(this.value === '${cur}' ? null : this.value)" style="font-size:.74rem;padding:.15rem .35rem;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text)">${months.map(m => `<option value="${m}" ${(r.month || cur) === m ? 'selected' : ''}>${mName(m)}</option>`).join('')}<option value="all" ${r.month === 'all' ? 'selected' : ''}>${mName('all')}</option></select>
        <div style="font-size:.7rem;color:var(--muted)">${en ? `today: ${r.today.solved}/${r.today.players} solved` : `dziś: ${r.today.solved}/${r.today.players} odgadło`}</div></div>
      ${r.month === cur && +new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(8) <= 3 && months.length > 1 ? `<div style="font-size:.72rem;color:var(--muted);margin:.3rem 0" data-notr>🔄 ${en ? 'New month, new ranking — last month is in the menu above.' : 'Nowy miesiąc — ranking ruszył od nowa. Poprzedni miesiąc wybierzesz z listy wyżej.'}</div>` : ''}
      ${(r.board || []).slice(0, 15).map((x, i) => `<div style="display:grid;grid-template-columns:26px 24px 1fr auto auto;gap:.5rem;align-items:center;padding:.3rem 0;border-bottom:1px solid var(--border);font-size:.8rem${x.id === discordUser?.id ? ';font-weight:800' : ''}">
        <b style="color:${i < 3 ? 'var(--accent)' : 'var(--muted)'}">${['🥇', '🥈', '🥉'][i] || i + 1}</b>${_avatarHtml(x.avatar, 22)}<span>${_h(x.name)}</span><span>✅ ${x.solved}/${x.played}</span><span style="color:var(--muted)">⌀ ${x.avg ?? '—'}</span></div>`).join('') || `<div style="font-size:.8rem;color:var(--muted);margin-top:.4rem">${en ? 'Log in with Discord and play — logged-in results go to the ranking.' : 'Zaloguj się przez Discord i zagraj — wyniki zalogowanych trafiają do rankingu.'}</div>`}`;
  });
}
function _kStatsLine(s) { return currentLang === 'en' ? `Your streak: <b>${s.streak}</b> · best streak: ${s.best} · played: ${s.played} · won: ${s.won}` : `Twoja seria: <b>${s.streak}</b> · najlepsza seria: ${s.best} · rozegrane: ${s.played} · wygrane: ${s.won}`; }
function kordleGuess() {
  setTimeout(() => { try { updateMyPanelBadge(); streakLoad(); } catch(e) {} }, 1500); // licznik „Na dziś” i seria po próbie w 2Kordle
  const pool = _kPool(), target = _kTarget(pool), st = _kState();
  const v = (document.getElementById('k-in')?.value || '').trim();
  const g = pool.find(p => p.name.toLowerCase() === v.toLowerCase()) || pool.find(p => p.k === _normNick(v));
  if(!g) { showToast('Nie ma takiego zawodnika w puli — wybierz z podpowiedzi', 'info'); return; }
  if(st.guesses.includes(g.k)) { showToast('Ten zawodnik już był', 'info'); return; }
  st.guesses.push(g.k);
  const won = g.k === target.k, over = won || st.guesses.length >= 6;
  if(over && !st.done) {
    st.done = true;
    const s = _kStats(), yest = new Date(Date.parse(st.day + 'T12:00:00Z') - 864e5).toISOString().slice(0, 10);
    s.played++; if(won) { s.won++; s.streak = s.last === yest ? s.streak + 1 : 1; s.best = Math.max(s.best, s.streak); } else s.streak = 0;
    s.last = won ? st.day : s.last; localStorage.setItem('nba2k_kordle_stats', JSON.stringify(s));
    if(won) { const km = JSON.parse(localStorage.getItem('nba2k_kordle_month') || '{}'); km[st.day.slice(0, 7)] = (km[st.day.slice(0, 7)] || 0) + 1; localStorage.setItem('nba2k_kordle_month', JSON.stringify(km)); }
    if(discordUser?.session && !st.sent) { st.sent = true; _api('/kordle', 'POST', { day: st.day, tries: won ? st.guesses.length : 0 }, { session: true }); }
  }
  _kSave(st); renderKordle();
}
function kordleShare() {
  const pool = _kPool(), target = _kTarget(pool), st = _kState(), won = st.guesses.includes(target.k);
  const grid = st.guesses.map(k => pool.find(p => p.k === k)).filter(Boolean).map(g => ['team', 'pos', 'ppg', 'rpg', 'apg', 'gp'].map(f => _kCell(g, target, f)[0]).join('')).join('\n');
  const txt = `🧩 2Kordle #${_kNum(st.day)} ${won ? st.guesses.length : 'X'}/6\n${grid}\n${location.host || 'chemikleagues.com'}/#2kordle`;
  navigator.clipboard?.writeText(txt).then(() => showToast('📋 Skopiowano — wklej na Discordzie!', 'success'));
}
function openMvpRace() {
  const m = _fxModal('mvp-modal', 640);
  m.querySelector('.modal').innerHTML = _fxHead('mvp-modal', '🏆 Wyścig o MVP') + _mvpHtml(20, true);
  m.classList.add('open');
}
