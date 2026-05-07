/**
 * KW5 Elite + NBA 2K Liga — Cloudflare Worker
 *
 * Secrets:
 *   ANTHROPIC_API_KEY, ADMIN_TOKEN, ADMIN_TOKEN_KW5, ADMIN_TOKEN_NBA
 *   ADMIN_TOKEN_EVENTS — for events manager (separate role)
 *   GEMINI_API_KEY, DISCORD_BOT_TOKEN
 *   DISCORD_RESULTS_CHANNEL_ID — (optional) channel for result embeds
 *   JSONBIN_MASTER_KEY, JSONBIN_BIN_ID
 *   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI
 *   APP_URL, DISCORD_WEBHOOK_SECRET
 *   DISCORD_WEBHOOK_NBA — webhook URL for Discord notifications
 *   BOT_URL — Railway bot URL (e.g. https://nba2k-discord-bot.up.railway.app)
 *
 * KV Bindings: SCREENSHOTS_KV, DATA_KV
 */

const ALLOWED_ORIGINS = [
  'https://chemik81.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

function isValidAdmin(token, env) {
  if (!token) return false;
  if (env.ADMIN_TOKEN        && token === env.ADMIN_TOKEN)        return true;
  if (env.ADMIN_TOKEN_KW5    && token === env.ADMIN_TOKEN_KW5)    return true;
  if (env.ADMIN_TOKEN_NBA    && token === env.ADMIN_TOKEN_NBA)    return true;
  if (env.ADMIN_TOKEN_S1     && token === env.ADMIN_TOKEN_S1)     return true;
  if (env.ADMIN_TOKEN_EVENTS && token === env.ADMIN_TOKEN_EVENTS) return true;
  const KW5_KNOWN_HASHES = [
    'f95c8af9aaae2aabac477eb1421c3ad7c899832169fca025590570c0c796a542',
  ];
  if (KW5_KNOWN_HASHES.includes(token)) return true;
  return false;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return corsResponse(null, 204, request);

    const url    = new URL(request.url);
    const path   = url.pathname;
    const action = url.searchParams.get('action');

    if (path === '/discord-webhook' && request.method === 'POST') {
      return handleDiscordWebhook(request, env, ctx);
    }
    if (path === '/nba-analyze' && request.method === 'POST') {
      return handleNbaAnalyze(request, env);
    }
    if (path === '/kw5-webhook' && request.method === 'POST') {
      return handleKw5Webhook(request, env, ctx);
    }
    if (path === '/kw5-analyze' && request.method === 'POST') {
      return handleKw5Analyze(request, env);
    }
    if (path === '/discord-event' && request.method === 'POST') {
      return handleDiscordEvent(request, env);
    }
    if (path === '/discord-login' && request.method === 'GET') {
      const returnTo = url.searchParams.get('return') || '';
      const params = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        redirect_uri: env.DISCORD_REDIRECT_URI || 'https://kw5-elite-proxy.igor-bernakiewicz.workers.dev/discord-callback',
        response_type: 'code', scope: 'identify',
        state: returnTo,
      });
      return new Response(null, { status: 302, headers: { 'Location': 'https://discord.com/api/oauth2/authorize?' + params.toString() } });
    }
    if (path === '/discord-callback' && request.method === 'GET') {
      const code = url.searchParams.get('code');
      const returnTo = url.searchParams.get('state') || '';
      const appUrl = returnTo || env.APP_URL || 'https://chemik81.github.io/nba2k-liga/';

      const redirectWithError = (msg) => {
        const dest = appUrl.split('?')[0].split('#')[0];
        return new Response(null, { status: 302, headers: { 'Location': `${dest}?oauth_error=${encodeURIComponent(msg)}` } });
      };

      if (!code) {
        return redirectWithError('Brak kodu — jeśli logujesz się przez aplikację Discord na telefonie, skopiuj link i otwórz w Chrome lub Safari');
      }
      try {
        const redirectUri = env.DISCORD_REDIRECT_URI || 'https://kw5-elite-proxy.igor-bernakiewicz.workers.dev/discord-callback';
        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          const discordErr = tokenData.error_description || tokenData.error || 'No access token';
          const hint = (discordErr.includes('invalid_grant') || discordErr.includes('access token'))
            ? ' — otwórz stronę w Chrome lub Safari zamiast przez Discord'
            : '';
          return redirectWithError(discordErr + hint);
        }
        const user = await (await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + tokenData.access_token } })).json();
        const userData = { id: user.id, name: user.global_name || user.username, username: user.username, avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null, discordTag: user.username };
        let baseUrl = appUrl;
        const hashIdx = baseUrl.indexOf('#');
        const hashPart = hashIdx !== -1 ? baseUrl.slice(hashIdx + 1) : '';
        if (hashIdx !== -1) baseUrl = baseUrl.slice(0, hashIdx);
        const redirectHash = hashPart ? `&draft_view=${encodeURIComponent(hashPart)}` : '';
        const userJson = JSON.stringify(userData);
        const userEncoded = btoa(unescape(encodeURIComponent(userJson)));
        const destUrl = `${baseUrl}?discord_user=${userEncoded}${redirectHash}`;
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta http-equiv="refresh" content="0;url=${destUrl}">
<title>Logowanie...</title></head><body>
<script>
try {
  localStorage.setItem('nba2k_discord_user', ${JSON.stringify(userJson)});
  localStorage.setItem('nba2k_discord_pending', '1');
} catch(e) {}
window.location.replace(${JSON.stringify(destUrl)});
<\/script>
<p>Przekierowywanie... <a href="${destUrl}">Kliknij tutaj</a></p>
</body></html>`;
        return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Cache-Control': 'no-store' } });
      } catch(e) { return redirectWithError('Błąd serwera: ' + e.message); }
    }

    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return corsResponse(JSON.stringify({ error: 'Forbidden' }), 403, request);

    if (path === '/auth' && request.method === 'POST') {
      try {
        const { token, site } = await request.json();
        let valid = false;
        if (site === 'kw5' && (token === env.ADMIN_TOKEN_KW5 || token === env.ADMIN_TOKEN)) valid = true;
        if (site === 'nba' && token === env.ADMIN_TOKEN_NBA) valid = true;
        if (site === 's1'  && (token === env.ADMIN_TOKEN_S1 || token === env.ADMIN_TOKEN)) valid = true;
        if (site === 'events' && env.ADMIN_TOKEN_EVENTS && token === env.ADMIN_TOKEN_EVENTS) valid = true;
        return corsResponse(JSON.stringify({ ok: valid }), valid ? 200 : 401, request);
      } catch(e) { return corsResponse(JSON.stringify({ ok: false }), 500, request); }
    }
    if (path === '/data' && request.method === 'GET')  return getLeagueData(env, request);
    if (path === '/config' && request.method === 'GET') return getConfig(env, request);
    if (path === '/config' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return putConfig(request, env, request);
    }
    if (path === '/event-signup' && request.method === 'POST') return handleEventSignup(request, env);
    if (path === '/event-signup' && request.method === 'DELETE') return handleEventUnsignup(request, env);
    if (path === '/data' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return putLeagueData(request, env, request);
    }
    if (path === '/pending-screenshots' && request.method === 'GET') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return getPendingScreenshots(env, request);
    }
    if (path.startsWith('/pending-screenshots/') && request.method === 'DELETE') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return deleteScreenshot(path.replace('/pending-screenshots/', ''), env, request);
    }
    if (path === '/anthropic' && request.method === 'POST') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return handleAnthropic(request, env);
    }
    if (path === '/gemini' && request.method === 'POST') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return handleGemini(request, env);
    }
    if (path === '/draft-data' && request.method === 'GET') return getDraftData(env, request);
    if (path === '/draft-data' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return putDraftData(request, env);
    }
    if (path === '/draft-pick' && request.method === 'POST') {
      return handleDraftPick(request, env);
    }
    if (path === '/draft-notify' && request.method === 'POST') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return handleDraftNotify(request, env);
    }
    if (path === '/gm-presence' && request.method === 'GET') return getGmPresence(env, request);
    if (path === '/gm-presence' && request.method === 'POST') return postGmPresence(request, env);

    // ═══ DISCORD NOTIFY — proxy webhook URL from secret ══════════
    if (path === '/discord-notify' && request.method === 'POST') {
      if (!env.DISCORD_WEBHOOK_NBA) return corsResponse(JSON.stringify({ error: 'DISCORD_WEBHOOK_NBA not configured' }), 501, request);
      try {
        const body = await request.json();
        const r = await fetch(env.DISCORD_WEBHOOK_NBA, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        return corsResponse(r.ok ? JSON.stringify({ ok: true }) : JSON.stringify({ error: 'Discord returned ' + r.status }), r.ok ? 200 : r.status, request);
      } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
    }

    // ═══ NOTIFY EVENT — proxy DM request to Railway bot ══════════
    if (path === '/notify-event' && request.method === 'POST') {
      return handleNotifyEvent(request, env);
    }

    if (path === '/chemistry-state' && request.method === 'GET') {
      try {
        const raw = await env.DATA_KV.get('kw5_chemistry_state');
        return corsResponse(raw || JSON.stringify({ pg: null, min: 2, visible: false }), 200, request);
      } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
    }
    if (path === '/chemistry-state' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      try {
        const body = await request.json();
        await env.DATA_KV.put('kw5_chemistry_state', JSON.stringify(body));
        return corsResponse(JSON.stringify({ ok: true }), 200, request);
      } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
    }
    if (path === '/kw5-data' && request.method === 'GET') return getKw5Data(env, request);
    if (path === '/kw5-data' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return putKw5Data(request, env);
    }

    // ═══ SEASON 1 ════════════════════════════════════════════
    if (path === '/season1-data' && request.method === 'GET') return getSeason1Data(env, request);
    if (path === '/season1-data' && request.method === 'PUT') {
      if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
      return putSeason1Data(request, env);
    }

    if (request.method !== 'POST') return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405, request);
    if (!isValidAdmin(request.headers.get('X-Admin-Token'), env)) return corsResponse(JSON.stringify({ error: 'Unauthorized' }), 401, request);
    if (action === 'db-load') {
      try { const res = await fetch(`https://api.jsonbin.io/v3/b/${env.JSONBIN_BIN_ID}/latest`, { headers: { 'X-Master-Key': env.JSONBIN_MASTER_KEY } }); return corsResponse(JSON.stringify(await res.json()), res.status, request); }
      catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
    }
    if (action === 'db-save') {
      try { const body = await request.json(); const res = await fetch(`https://api.jsonbin.io/v3/b/${env.JSONBIN_BIN_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': env.JSONBIN_MASTER_KEY }, body: JSON.stringify(body) }); return corsResponse(JSON.stringify(await res.json()), res.status, request); }
      catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
    }
    return handleAnthropic(request, env);
  }
};

// ═══ KV DATA ═════════════════════════════════════════════════
const DATA_KEY         = 'nba2k_league_data';
const KW5_DATA_KEY     = 'kw5_data';
const SEASON1_DATA_KEY = 'kw5_season1_data';

async function getLeagueData(env, request) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const raw = await env.DATA_KV.get(DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ record: { matches:[], aliases:{}, seasons:[], currentSeasonId:null, schedule:[], teams:{}, rounds:[], pendingScreenshots:[], events:[] } }), 200, request);
    return corsResponse(raw, 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function putLeagueData(request, env, req) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, req);
    const body = await request.text();
    JSON.parse(body);
    await env.DATA_KV.put(DATA_KEY, body);
    return corsResponse(JSON.stringify({ ok: true }), 200, req);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, req); }
}

// ═══ KW5 KV DATA ═════════════════════════════════════════════
async function getKw5Data(env, request) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const raw = await env.DATA_KV.get(KW5_DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ record: { matches:[], roster:[], corrections:{} } }), 200, request);
    return corsResponse(raw, 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function putKw5Data(request, env) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const body = await request.text();
    JSON.parse(body);
    await env.DATA_KV.put(KW5_DATA_KEY, body);
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ KW5 SEASON 1 DATA ═══════════════════════════════════════
async function getSeason1Data(env, request) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const raw = await env.DATA_KV.get(SEASON1_DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ teams:[], matches:[], stats:[], awards:{}, playoff:[] }), 200, request);
    return corsResponse(raw, 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function putSeason1Data(request, env) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const body = await request.text();
    JSON.parse(body);
    await env.DATA_KV.put(SEASON1_DATA_KEY, body);
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ NBA ANALYZE — synchronous Gemini call for bot ═══════════
async function handleNbaAnalyze(request, env) {
  try {
    const secret = env.DISCORD_WEBHOOK_SECRET || '';
    if (secret && request.headers.get('X-Webhook-Secret') !== secret)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const body = await request.json();
    const { imageBase64, mimeType } = body;
    if (!imageBase64) return new Response(JSON.stringify({ error: 'Missing imageBase64' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    if (!env.GEMINI_API_KEY)
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    let matchData, lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        matchData = await analyzeWithGemini(imageBase64, mimeType || 'image/png', env);
        if (matchData) break;
        throw new Error('Gemini returned no data');
      } catch(e) {
        lastErr = e;
        console.log(`[NBA] Gemini attempt ${attempt} failed: ${e.message}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!matchData) throw lastErr || new Error('Gemini returned no data');

    return new Response(JSON.stringify({ ok: true, matchData }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch(e) {
    console.error('nba-analyze error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ═══ DISCORD WEBHOOK — auto-process screenshot ════════════════
async function handleDiscordWebhook(request, env, ctx) {
  try {
    const secret = env.DISCORD_WEBHOOK_SECRET || '';
    if (secret && request.headers.get('X-Webhook-Secret') !== secret)
      return new Response('Unauthorized', { status: 401 });

    const body = await request.json();
    const attachments = extractAttachments(body);
    if (!attachments.length) return new Response('OK', { status: 200 });

    for (const att of attachments) {
      if (att.discordMsgId) await discordReact(att.channelId, att.discordMsgId, '⏳', env);
    }

    ctx.waitUntil(processAttachmentsSequentially(attachments, env));
    return new Response('OK', { status: 200 });

  } catch(e) {
    console.error('Webhook error:', e);
    return new Response('OK', { status: 200 });
  }
}

function extractAttachments(body) {
  const attachments = [];

  if (body.imageBase64 || body.matchData) {
    attachments.push({
      imageBase64:  body.imageBase64,
      mimeType:     body.mimeType || 'image/png',
      filename:     body.filename || 'screenshot.png',
      messageId:    body.messageId || String(Date.now()),
      channelId:    body.channelId || '',
      author:       body.author || 'Nieznany',
      authorId:     body.authorId || '',
      timestamp:    body.timestamp || new Date().toISOString(),
      discordMsgId: body.messageId || '',
      silent:       body.silent || false,
      matchData:    body.matchData || null,
    });
  } else if (body.url || body.proxyUrl) {
    attachments.push({
      url:          body.url,
      proxyUrl:     body.proxyUrl || body.url,
      filename:     body.filename || 'screenshot.png',
      mimeType:     'image/png',
      messageId:    body.messageId || String(Date.now()),
      channelId:    body.channelId || '',
      author:       body.author || 'Nieznany',
      authorId:     body.authorId || '',
      timestamp:    body.timestamp || new Date().toISOString(),
      discordMsgId: body.messageId || '',
      silent:       body.silent || false,
      matchData:    body.matchData || null,
    });
  } else {
    const images = (body.attachments || []).filter(a =>
      a.content_type?.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif)$/i.test(a.filename || '')
    );
    for (const att of images) {
      attachments.push({
        url:          att.url,
        proxyUrl:     att.proxy_url || att.url,
        filename:     att.filename || 'screenshot.png',
        mimeType:     att.content_type || 'image/png',
        messageId:    body.id || String(Date.now()),
        channelId:    body.channel_id || '',
        author:       body.author?.username || 'Nieznany',
        authorId:     body.author?.id || '',
        timestamp:    body.timestamp || new Date().toISOString(),
        discordMsgId: body.id || '',
      });
    }
  }

  return attachments;
}

async function processAttachmentsSequentially(attachments, env) {
  for (let i = 0; i < attachments.length; i++) {
    await processOneScreenshot(attachments[i], env);
    if (i < attachments.length - 1) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

async function processOneScreenshot(att, env) {
  const { url, proxyUrl, filename, mimeType, messageId, channelId, author, authorId, timestamp, discordMsgId } = att;

  const entryId = messageId + '_' + Date.now();
  const displayUrl = url || proxyUrl || '';
  const entry = { id: entryId, url: displayUrl, proxyUrl: displayUrl, filename, author, authorId, channelId, timestamp, processed: false, addedAt: new Date().toISOString() };
  if (env.SCREENSHOTS_KV) {
    await env.SCREENSHOTS_KV.put('screenshot:' + entryId, JSON.stringify(entry), { expirationTtl: 604800 });
  }

  const matchData = att.matchData;
  if (!matchData) {
    console.log('No matchData in payload — skipping save');
    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await discordReact(channelId, discordMsgId, '❌', env);
    }
    return;
  }

  try {
    const raw    = await env.DATA_KV.get(DATA_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const record = parsed.record || parsed;
    if (!record.matches) record.matches = [];

    const newMatch = {
      id: Date.now(),
      date: timestamp?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      autoProcessed: true,
      discordAuthor: author,
      ...matchData,
    };

    try {
      const recap = await generateRecapInWorker(newMatch, env);
      if (recap) newMatch.recap = recap;
    } catch(e) {
      console.error('Auto-recap failed:', e.message);
    }

    record.matches.unshift(newMatch);
    await env.DATA_KV.put(DATA_KEY, JSON.stringify({ record }));

    entry.processed = true;
    if (env.SCREENSHOTS_KV) {
      await env.SCREENSHOTS_KV.put('screenshot:' + entryId, JSON.stringify(entry), { expirationTtl: 604800 });
    }

    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await new Promise(r => setTimeout(r, 500));
      await discordReact(channelId, discordMsgId, '✅', env);
    }

    const resultsChannel = env.DISCORD_RESULTS_CHANNEL_ID || channelId;
    const w1      = matchData.team1?.score > matchData.team2?.score;
    const winner  = w1 ? matchData.team1?.name : matchData.team2?.name;
    const score1  = matchData.team1?.score ?? '?';
    const score2  = matchData.team2?.score ?? '?';
    const team1   = matchData.team1?.name || 'Drużyna 1';
    const team2   = matchData.team2?.name || 'Drużyna 2';
    const appUrl  = env.APP_URL || 'https://chemik81.github.io/nba2k-liga/';

    await discordMessage(resultsChannel, env,
      `✅ **Mecz zapisany automatycznie!**\n` +
      `🏀 **${team1} ${score1} — ${score2} ${team2}**\n` +
      `🏆 Zwycięzca: **${winner}** | 📊 Screen od: **${author}**\n` +
      `📈 Statystyki: ${appUrl}`
    );

  } catch(e) {
    console.error('Auto-process error:', e.message);
    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await new Promise(r => setTimeout(r, 500));
      await discordReact(channelId, discordMsgId, '❌', env);
    }
    await discordMessage(channelId, env,
      `❌ Nie udało się przetworzyć screena od **${author}** (${filename}). Admin może przetworzyć ręcznie w panelu.`
    );
  }
}

// ═══ AUTO-RECAP ═══════════════════════════════════════════════
async function generateRecapInWorker(match, env) {
  if (!env.ANTHROPIC_API_KEY) return null;

  const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

  const fmtPlayers = (team) => (team.players || []).map((p, idx) => {
    const pos   = p.pos || POSITIONS[idx] || '?';
    const fgPct = (p.fga || 0) > 0 ? Math.round((p.fgm || 0) / (p.fga || 0) * 100) : 0;
    return `${p.name}[${pos}](${p.grade || 'B'}): ${p.pts || 0}pkt ${p.reb || 0}zb ${p.ast || 0}as ` +
           `${p.stl || 0}prz ${p.blk || 0}blk TO:${p.to || 0} FG:${p.fgm || 0}/${p.fga || 0}(${fgPct}%)`;
  }).join('\n');

  const quarters = (t) => (t.quarters || []).map((s, i) => `Q${i + 1}:${s}`).join(' ');

  const prompt =
    `Napisz recap meczu NBA 2K26 po polsku — około 150 słów. ` +
    `Pisz prostym, codziennym językiem, jakbyś opowiadał znajomym co się wydarzyło. ` +
    `Bez kwiecistego stylu, bez rozbudowanych zdań. Krótko i konkretnie. ` +
    `Wspomnij: kto wygrał i jak wyglądał mecz, kto był MVP z krótkim uzasadnieniem. ` +
    `ZASADA SniperKPL: TYLKO gdy gra drużyna Polish Snickers — naprzemiennie "SniperKPL" lub "Saper". ` +
    `Jeden akapit, bez nagłówków i list.\n\n` +
    `MECZ: ${match.team1.name} ${match.team1.score} - ${match.team2.score} ${match.team2.name}\n` +
    `Data: ${match.date || ''}\n` +
    `Kwarty ${match.team1.name}: ${quarters(match.team1)}\n` +
    `Kwarty ${match.team2.name}: ${quarters(match.team2)}\n\n` +
    `STATYSTYKI ${match.team1.name}:\n${fmtPlayers(match.team1)}\n\n` +
    `STATYSTYKI ${match.team2.name}:\n${fmtPlayers(match.team2)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('Haiku recap error ' + res.status + ': ' + (err.error?.message || 'unknown'));
  }

  const data = await res.json();
  return data.content?.[0]?.text?.trim() || null;
}

// ═══ GEMINI ANALYSIS ══════════════════════════════════════════
async function analyzeWithGemini(base64, mimeType, env) {
  let knownTeams = ['Aliens Katowice', 'Katowice PL', 'Big Brain Basketball', 'Illegal Esports V2', 'Polish Boars', 'Polish Snickers', 'White Market', 'Sternritters', 'The Outlawz'];
  try {
    const raw = await env.DATA_KV.get(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const record = parsed.record || parsed;
      const teamKeys = Object.keys(record.teams || {});
      if (teamKeys.length > 0) knownTeams = teamKeys;
      if (record.matches) {
        record.matches.forEach(m => {
          if (m.team1?.name && !knownTeams.includes(m.team1.name)) knownTeams.push(m.team1.name);
          if (m.team2?.name && !knownTeams.includes(m.team2.name)) knownTeams.push(m.team2.name);
        });
      }
    }
  } catch(e) {}

  const prompt =
    `Analizuj screenshot z gry NBA 2K — ekran Game Stats.\n` +
    `Zwróć WYŁĄCZNIE poprawny JSON (bez markdown, bez komentarzy):\n` +
    `{"team1":{"name":"NAZWA","score":67,"quarters":[15,20,17,15],"players":[{"name":"Nick","pos":"PG","grade":"B+","pts":24,"reb":5,"ast":9,"stl":1,"blk":0,"fouls":2,"to":3,"fgm":7,"fga":20,"tpm":2,"tpa":6,"ftm":4,"fta":4}]},"team2":{"name":"NAZWA","score":78,"quarters":[17,15,19,27],"players":[...]}}\n\n` +
    `POZYCJE (kolejność od góry): 1=PG 2=SG 3=SF 4=PF 5=C\n\n` +
    `KOLUMNY W TABELI (kolejność): GRD | PTS | REB | AST | STL | BLK | FOULS | TO | FGM/FGA | 3PM/3PA | FTM/FTA\n` +
    `WAŻNE: Kolumna 7 to FOULS (faule), kolumna 8 to TO (straty). NIE mylić.\n\n` +
    `NAZWY DRUŻYN: Dopasuj logotyp do listy: ${knownTeams.join(', ')}. ` +
    `"Aliens Katowice" = ZIELONY kolor/alien. "Katowice PL" = CZERWONY kolor/alien. To RÓŻNE drużyny! ` +
    `KRYTYCZNE — STRUKTURA EKRANU: Nad każdą tabelą jest wiersz z nagłówkiem YOU / YOUR MATCHUP / TEAM OWNER. W tym wierszu stoi nick kapitana drużyny. Ten nick NIE jest graczem — to tylko etykieta. Pod nim jest wiersz z nazwami kolumn (GRD, PTS...). Dopiero pod nim zaczynają się prawdziwi gracze. Każda drużyna ma ZAWSZE DOKŁADNIE 5 graczy — to są 5 wierszy bezpośrednio nad wierszem TOTAL. Policz od TOTAL do góry: wiersz 1 nad TOTAL = gracz 5, wiersz 2 = gracz 4, itd. NIGDY nie wstawiaj kapitana z nagłówka jako gracza.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mimeType, data: base64 } },
        { text: prompt }
      ]}],
      generationConfig: { maxOutputTokens: 8192 }
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('Gemini ' + res.status + ': ' + (err.error?.message || 'unknown'));
  }

  const data = await res.json();
  const text  = (data.candidates?.[0]?.content?.parts || []).map(p=>p.text||'').join('');
  const first = text.indexOf('{');
  const last  = text.lastIndexOf('}');
  if (first === -1 || last === -1) return null;

  let json = text.slice(first, last + 1).replace(/,(\s*[}\]])/g, '$1');
  const parsed = JSON.parse(json);

  const fixPlayers = (players, score) => {
    if (!players || players.length === 0) return players;
    const sumPts = (arr) => arr.reduce((s, p) => s + (p.pts || 0), 0);
    if (sumPts(players) === score) return players;
    const withoutFirst = players.slice(1);
    if (withoutFirst.length > 0 && sumPts(withoutFirst) === score) return withoutFirst;
    const withoutLast = players.slice(0, -1);
    if (withoutLast.length > 0 && sumPts(withoutLast) === score) return withoutLast;
    return players;
  };

  if (parsed && parsed.team1) parsed.team1.players = fixPlayers(parsed.team1.players, parsed.team1.score);
  if (parsed && parsed.team2) parsed.team2.players = fixPlayers(parsed.team2.players, parsed.team2.score);

  return parsed;
}

// ═══ KW5 ANALYZE — synchronous Gemini call for bot ═══════════
async function handleKw5Analyze(request, env) {
  try {
    const secret = env.DISCORD_WEBHOOK_SECRET || '';
    if (secret && request.headers.get('X-Webhook-Secret') !== secret)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const body = await request.json();
    const { imageBase64, mimeType, roster, corrections } = body;
    if (!imageBase64) return new Response(JSON.stringify({ error: 'Missing imageBase64' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    if (!env.GEMINI_API_KEY)
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    let matchData, lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        matchData = await analyzeKw5WithGemini(imageBase64, mimeType || 'image/png', env);
        if (matchData) break;
        throw new Error('Gemini returned no data');
      } catch(e) {
        lastErr = e;
        console.log(`[KW5] Gemini attempt ${attempt} failed: ${e.message}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
      }
    }
    if (!matchData) throw lastErr || new Error('Gemini returned no data');

    let knownRoster = roster || [];
    let knownCorrections = corrections || {};
    if (!knownRoster.length) {
      try {
        const raw = await env.DATA_KV.get(KW5_DATA_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const record = parsed.record || parsed;
          knownRoster = record.roster || [];
          knownCorrections = record.corrections || {};
        }
      } catch(e) {}
    }
    if (matchData.team1?.players) matchData.team1.players = autoCorrectPlayers(matchData.team1.players, knownRoster, knownCorrections);
    if (matchData.team2?.players) matchData.team2.players = autoCorrectPlayers(matchData.team2.players, knownRoster, knownCorrections);

    return new Response(JSON.stringify({ ok: true, matchData }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch(e) {
    console.error('kw5-analyze error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// ═══ KW5 WEBHOOK ══════════════════════════════════════════════
async function handleKw5Webhook(request, env, ctx) {
  try {
    const secret = env.DISCORD_WEBHOOK_SECRET || '';
    if (secret && request.headers.get('X-Webhook-Secret') !== secret)
      return new Response('Unauthorized', { status: 401 });

    const body = await request.json();
    const attachments = extractAttachments(body);
    if (!attachments.length) return new Response('OK', { status: 200 });

    for (const att of attachments) {
      if (att.discordMsgId) await discordReact(att.channelId, att.discordMsgId, '⏳', env);
    }

    ctx.waitUntil(processKw5AttachmentsSequentially(attachments, env));
    return new Response('OK', { status: 200 });

  } catch(e) {
    console.error('KW5 Webhook error:', e);
    return new Response('OK', { status: 200 });
  }
}

async function processKw5AttachmentsSequentially(attachments, env) {
  for (let i = 0; i < attachments.length; i++) {
    await processKw5Screenshot(attachments[i], env);
    if (i < attachments.length - 1) await new Promise(r => setTimeout(r, 4000));
  }
}

// ═══ AUTO-CORRECT PLAYER NAMES ═══════════════════════════════
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, (_, i) => Array.from({length: n + 1}, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}

function autoCorrectPlayers(players, roster, corrections) {
  if (!players || !players.length) return players;
  return players.map(p => {
    const name = p.name;
    if (!name) return p;

    if (corrections && corrections[name]) {
      console.log(`[AutoCorrect] correction: "${name}" → "${corrections[name]}"`);
      return { ...p, name: corrections[name] };
    }

    if (roster && roster.includes(name)) return p;

    if (roster && roster.length) {
      let bestName = null, bestDist = Infinity;
      for (const r of roster) {
        const dist = levenshtein(name.toLowerCase(), r.toLowerCase());
        if (dist < bestDist) { bestDist = dist; bestName = r; }
      }
      if (bestDist <= 2 && bestName) {
        console.log(`[AutoCorrect] fuzzy: "${name}" → "${bestName}" (dist=${bestDist})`);
        return { ...p, name: bestName };
      }
    }

    return p;
  });
}

async function processKw5Screenshot(att, env) {
  const { filename, channelId, author, authorId, timestamp, discordMsgId } = att;

  const entryId = att.messageId + '_' + Date.now();
  const displayUrl = att.url || att.proxyUrl || '';
  const entry = { id: entryId, url: displayUrl, proxyUrl: displayUrl, filename, author, authorId, channelId, timestamp, processed: false, addedAt: new Date().toISOString() };
  if (env.SCREENSHOTS_KV) {
    await env.SCREENSHOTS_KV.put('kw5screenshot:' + entryId, JSON.stringify(entry), { expirationTtl: 604800 });
  }

  const matchData = att.matchData;
  if (!matchData) {
    console.log('No matchData in payload — skipping save');
    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await discordReact(channelId, discordMsgId, '❌', env);
    }
    return;
  }

  try {
    const raw    = await env.DATA_KV.get(KW5_DATA_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const record = parsed.record || parsed;
    if (!record.matches) record.matches = [];

    const newMatch = {
      id: Date.now(),
      date: timestamp?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      autoProcessed: true,
      discordAuthor: author,
      ...matchData,
    };

    record.matches.unshift(newMatch);
    await env.DATA_KV.put(KW5_DATA_KEY, JSON.stringify({ record }));

    entry.processed = true;
    if (env.SCREENSHOTS_KV) {
      await env.SCREENSHOTS_KV.put('kw5screenshot:' + entryId, JSON.stringify(entry), { expirationTtl: 604800 });
    }

    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await new Promise(r => setTimeout(r, 500));
      await discordReact(channelId, discordMsgId, '✅', env);
    }

  } catch(e) {
    console.error('KW5 save error:', e.message);
    if (discordMsgId) {
      await discordRemoveReact(channelId, discordMsgId, '⏳', env);
      await new Promise(r => setTimeout(r, 500));
      await discordReact(channelId, discordMsgId, '❌', env);
    }
  }
}

async function analyzeKw5WithGemini(base64, mimeType, env) {
  let knownTeams = [];
  try {
    const raw = await env.DATA_KV.get(KW5_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const record = parsed.record || parsed;
      const teamKeys = Object.keys(record.teams || {});
      if (teamKeys.length > 0) knownTeams = teamKeys;
      if (record.matches) {
        record.matches.forEach(m => {
          if (m.team1?.name && !knownTeams.includes(m.team1.name)) knownTeams.push(m.team1.name);
          if (m.team2?.name && !knownTeams.includes(m.team2.name)) knownTeams.push(m.team2.name);
        });
      }
    }
  } catch(e) {}

  const teamsHint = knownTeams.length ? `Known teams: ${knownTeams.join(', ')}. ` : '';

  const prompt =
    `Analyze this NBA 2K Game Stats screenshot.\n` +
    `Return ONLY valid JSON (no markdown, no comments):\n` +
    `{"team1":{"name":"TEAM NAME","score":67,"quarters":[15,20,17,15],"players":[{"name":"Nick","pos":"PG","grade":"B+","pts":24,"reb":5,"ast":9,"stl":1,"blk":0,"fouls":2,"to":3,"fgm":7,"fga":20,"tpm":2,"tpa":6,"ftm":4,"fta":4}]},"team2":{"name":"TEAM NAME","score":78,"quarters":[17,15,19,27],"players":[...]}}\n\n` +
    `POSITIONS (top to bottom): 1=PG 2=SG 3=SF 4=PF 5=C\n\n` +
    `COLUMN ORDER (left to right): GRD | PTS | REB | AST | STL | BLK | FOULS | TO | FGM/FGA | 3PM/3PA | FTM/FTA\n` +
    `IMPORTANT: Column 7 = FOULS, Column 8 = TO. Do NOT swap them.\n\n` +
    `${teamsHint}` +
    `CRITICAL — SCREEN STRUCTURE: Above each team table is a header row showing YOU / YOUR MATCHUP / TEAM OWNER with the captain\'s username. This captain is NOT a player — ignore this row. Each team has EXACTLY 5 players — the 5 rows directly above the TOTAL row. Count from TOTAL upward: row 1 above TOTAL = player 5 (C), row 2 = player 4 (PF), etc. NEVER include the captain from the header as a player.`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [
        { inline_data: { mime_type: mimeType, data: base64 } },
        { text: prompt }
      ]}],
      generationConfig: { maxOutputTokens: 8192 }
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error('Gemini KW5 ' + res.status + ': ' + (err.error?.message || 'unknown'));
  }

  const data  = await res.json();
  const text  = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  const first = text.indexOf('{');
  const last  = text.lastIndexOf('}');
  if (first === -1 || last === -1) return null;

  const json   = text.slice(first, last + 1).replace(/,(\s*[}\]])/g, '$1');
  const parsed = JSON.parse(json);

  const fixPlayers = (players, score) => {
    if (!players || players.length === 0) return players;
    const sumPts = arr => arr.reduce((s, p) => s + (p.pts || 0), 0);
    if (sumPts(players) === score) return players;
    const withoutFirst = players.slice(1);
    if (withoutFirst.length > 0 && sumPts(withoutFirst) === score) return withoutFirst;
    const withoutLast = players.slice(0, -1);
    if (withoutLast.length > 0 && sumPts(withoutLast) === score) return withoutLast;
    return players;
  };

  if (parsed?.team1) parsed.team1.players = fixPlayers(parsed.team1.players, parsed.team1.score);
  if (parsed?.team2) parsed.team2.players = fixPlayers(parsed.team2.players, parsed.team2.score);

  return parsed;
}

// ═══ DISCORD HELPERS ══════════════════════════════════════════
async function discordReact(channelId, messageId, emoji, env) {
  if (!env.DISCORD_BOT_TOKEN || !channelId || !messageId) {
    console.log('discordReact skipped — missing:', !env.DISCORD_BOT_TOKEN ? 'token' : !channelId ? 'channelId' : 'messageId');
    return;
  }
  const encoded = encodeURIComponent(emoji);
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${encoded}/@me`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bot ' + env.DISCORD_BOT_TOKEN, 'Content-Length': '0' }
  }).catch(e => ({ ok: false, status: 'fetch error: ' + e.message }));
  if (res && !res.ok) {
    const txt = await res.text?.().catch(() => '') || '';
    console.log('discordReact failed:', res.status, txt.slice(0, 200));
  } else {
    console.log('discordReact OK:', emoji, 'msg:', messageId);
  }
}

async function discordRemoveReact(channelId, messageId, emoji, env) {
  if (!env.DISCORD_BOT_TOKEN || !channelId || !messageId) return;
  const encoded = encodeURIComponent(emoji);
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${encoded}/@me`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bot ' + env.DISCORD_BOT_TOKEN }
  }).catch(() => {});
}

async function discordMessage(channelId, env, content) {
  if (!env.DISCORD_BOT_TOKEN || !channelId) return;
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': 'Bot ' + env.DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  }).catch(() => {});
}

// ═══ SCREENSHOTS QUEUE ════════════════════════════════════════
async function getPendingScreenshots(env, request) {
  try {
    if (!env.SCREENSHOTS_KV) return corsResponse(JSON.stringify({ screenshots: [] }), 200, request);
    const list = await env.SCREENSHOTS_KV.list({ prefix: 'screenshot:' });
    const items = await Promise.all(list.keys.map(async k => {
      const v = await env.SCREENSHOTS_KV.get(k.name);
      return v ? JSON.parse(v) : null;
    }));
    return corsResponse(JSON.stringify({
      screenshots: items.filter(Boolean).sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function deleteScreenshot(id, env, request) {
  try {
    if (env.SCREENSHOTS_KV) await env.SCREENSHOTS_KV.delete('screenshot:' + id);
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ AI PROXIES ═══════════════════════════════════════════════
async function handleAnthropic(request, env) {
  try {
    const body = await request.json();
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      body.model || 'claude-haiku-4-5-20251001',
        max_tokens: body.max_tokens || 4000,
        messages:   body.messages
      }),
    });
    const anthropicData = await res.json();
    console.log('Anthropic stop_reason:', anthropicData.stop_reason, 'usage:', JSON.stringify(anthropicData.usage));
    return corsResponse(JSON.stringify(anthropicData), res.status, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function handleGemini(request, env) {
  try {
    if (!env.GEMINI_API_KEY) return corsResponse(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), 500, request);
    const body = await request.json();
    const parts = [];
    const msg = body.messages[body.messages.length - 1];
    if (Array.isArray(msg.content)) {
      for (const c of msg.content) {
        if (c.type === 'image') parts.push({ inline_data: { mime_type: c.source.media_type, data: c.source.data } });
        else if (c.type === 'text') parts.push({ text: c.text });
      }
    } else {
      parts.push({ text: msg.content });
    }
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${body.model || 'gemini-2.5-flash'}:generateContent?key=${env.GEMINI_API_KEY}`;
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: body.max_tokens || 65536 }
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return corsResponse(JSON.stringify({ error: err.error?.message || 'Gemini error ' + res.status }), res.status, request);
    }
    const data = await res.json();
    const parts2 = data.candidates?.[0]?.content?.parts || [];
    const fullText = parts2.map(p => p.text || '').join('');
    return corsResponse(JSON.stringify({
      content: [{ type: 'text', text: fullText }]
    }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ DISCORD EVENT ════════════════════════════════════════════
async function handleDiscordEvent(request, env) {
  const sig = request.headers.get('X-Signature-Ed25519');
  const ts  = request.headers.get('X-Signature-Timestamp');
  const txt = await request.text();
  if (!await verifyDiscordSignature(env.DISCORD_PUBLIC_KEY || '', sig || '', ts || '', txt)) return new Response('Invalid signature', { status: 401 });
  const body = JSON.parse(txt);
  if (body.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers: { 'Content-Type': 'application/json' } });
  return new Response('OK', { status: 200 });
}

async function verifyDiscordSignature(pub, sig, ts, body) {
  try {
    const key = await crypto.subtle.importKey('raw', hexToUint8Array(pub), { name: 'Ed25519' }, false, ['verify']);
    return await crypto.subtle.verify('Ed25519', key, hexToUint8Array(sig), new TextEncoder().encode(ts + body));
  } catch { return false; }
}

function hexToUint8Array(hex) {
  const b = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) b[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return b;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ═══ DRAFT PICK — public endpoint for GMs ════════════════════
async function handleDraftPick(request, env) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const body = await request.json();
    const { teamId, playerId, discordUserId } = body;
    if (!teamId || !playerId) return corsResponse(JSON.stringify({ error: 'Missing teamId or playerId' }), 400, request);

    const raw = await env.DATA_KV.get('kw5_draft_data');
    if (!raw) return corsResponse(JSON.stringify({ error: 'No draft data' }), 404, request);
    const ds = JSON.parse(raw).record || JSON.parse(raw);

    if (ds.status !== 'live') return corsResponse(JSON.stringify({ error: 'Draft not live' }), 400, request);

    const team = (ds.teams || []).find(t => t.id === teamId);
    if (!team) return corsResponse(JSON.stringify({ error: 'Team not found' }), 404, request);
    if (discordUserId && team.gmDiscordId && team.gmDiscordId !== discordUserId) {
      return corsResponse(JSON.stringify({ error: 'Not your team' }), 403, request);
    }

    const picked = new Set((ds.picks || []).map(p => p.playerId));
    if (picked.has(playerId)) return corsResponse(JSON.stringify({ error: 'Player already picked' }), 400, request);

    const totalRounds = ds.config.perTeam;
    const seq = [];
    for (let r = 0; r < totalRounds; r++) {
      let rOrder = ds.config.format === 'snake'
        ? (r % 2 === 0 ? [...ds.order] : [...ds.order].reverse())
        : [...ds.order];
      rOrder.forEach(tid => seq.push({ teamId: tid, round: r + 1 }));
    }
    const idx = ds.currentPickNum || 0;
    if (idx >= seq.length) return corsResponse(JSON.stringify({ error: 'Draft complete' }), 400, request);
    if (seq[idx].teamId !== teamId) return corsResponse(JSON.stringify({ error: 'Not your turn' }), 400, request);

    ds.picks = ds.picks || [];
    ds.picks.push({
      pickNum: idx + 1,
      round: seq[idx].round,
      teamId, playerId,
      auto: false,
      ts: new Date().toISOString()
    });
    ds.currentPickNum = idx + 1;
    const isDone = (idx + 1) >= seq.length;
    ds.status = isDone ? 'done' : 'live';
    ds.timerEnd = isDone ? null : new Date(Date.now() + (ds.config.timerSecs || 120) * 1000).toISOString();

    await env.DATA_KV.put('kw5_draft_data', JSON.stringify({ record: ds }));
    return corsResponse(JSON.stringify({ ok: true, pickNum: idx + 1, isDone }), 200, request);
  } catch(e) {
    return corsResponse(JSON.stringify({ error: e.message }), 500, request);
  }
}

// ═══ DRAFT NOTIFY — DM to GM ════════════════════════════════
async function handleDraftNotify(request, env) {
  try {
    const { discordUserId, message } = await request.json();
    if (!discordUserId || !message) return corsResponse(JSON.stringify({ error: 'Missing params' }), 400, request);
    if (!env.DISCORD_BOT_TOKEN) return corsResponse(JSON.stringify({ error: 'No bot token' }), 500, request);

    const dmRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
      method: 'POST',
      headers: { 'Authorization': 'Bot ' + env.DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: discordUserId })
    });
    if (!dmRes.ok) return corsResponse(JSON.stringify({ error: 'Cannot open DM' }), 500, request);
    const dm = await dmRes.json();

    await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
      method: 'POST',
      headers: { 'Authorization': 'Bot ' + env.DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });

    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) {
    return corsResponse(JSON.stringify({ error: e.message }), 500, request);
  }
}

// ═══ NOTIFY EVENT — proxy DM request to Railway bot ══════════
async function handleNotifyEvent(request, env) {
  try {
    const body = await request.json();
    const { message } = body;
    if (!message) return corsResponse(JSON.stringify({ error: 'Missing message' }), 400, request);
    if (!env.BOT_URL) return corsResponse(JSON.stringify({ error: 'BOT_URL not configured' }), 501, request);

    const headers = { 'Content-Type': 'application/json' };
    if (env.DISCORD_WEBHOOK_SECRET) headers['X-Webhook-Secret'] = env.DISCORD_WEBHOOK_SECRET;

    const res = await fetch(env.BOT_URL.replace(/\/+$/, '') + '/notify-draft', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return corsResponse(JSON.stringify({ error: data.error || 'Bot returned ' + res.status }), res.status, request);
    return corsResponse(JSON.stringify({ ok: true, sent: data.sent }), 200, request);
  } catch(e) {
    return corsResponse(JSON.stringify({ error: e.message }), 500, request);
  }
}

// ═══ DRAFT DATA ══════════════════════════════════════════════
const DRAFT_DATA_KEY = 'kw5_draft_data';

async function getDraftData(env, request) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const raw = await env.DATA_KV.get(DRAFT_DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ record: { status:'idle', picks:[], currentPickNum:0 } }), 200, request);
    return corsResponse(raw, 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function putDraftData(request, env) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const body = await request.text();
    JSON.parse(body);
    await env.DATA_KV.put(DRAFT_DATA_KEY, body);
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ EVENT SIGNUP (public — no admin token needed) ══════════════
async function handleEventSignup(request, env) {
  try {
    const body = await request.json();
    const { eventId, player } = body;
    if (!eventId || !player?.id || !player?.name) return corsResponse(JSON.stringify({ error: 'Missing fields' }), 400, request);
    const raw = await env.DATA_KV.get(DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ error: 'No data' }), 404, request);
    const parsed = JSON.parse(raw);
    const record = parsed.record || parsed;
    const ev = (record.events || []).find(e => e.id === eventId);
    if (!ev) return corsResponse(JSON.stringify({ error: 'Event not found' }), 404, request);
    if (ev.status !== 'open') return corsResponse(JSON.stringify({ error: 'Event not open' }), 400, request);
    if (ev.maxPlayers && (ev.players || []).length >= ev.maxPlayers) return corsResponse(JSON.stringify({ error: 'Full' }), 400, request);
    if ((ev.players || []).find(p => p.id === player.id)) return corsResponse(JSON.stringify({ error: 'Already signed up' }), 400, request);
    if (!ev.players) ev.players = [];
    ev.players.push(player);
    await env.DATA_KV.put(DATA_KEY, JSON.stringify({ record }));
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function handleEventUnsignup(request, env) {
  try {
    const body = await request.json();
    const { eventId, playerId } = body;
    if (!eventId || !playerId) return corsResponse(JSON.stringify({ error: 'Missing fields' }), 400, request);
    const raw = await env.DATA_KV.get(DATA_KEY);
    if (!raw) return corsResponse(JSON.stringify({ error: 'No data' }), 404, request);
    const parsed = JSON.parse(raw);
    const record = parsed.record || parsed;
    const ev = (record.events || []).find(e => e.id === eventId);
    if (!ev) return corsResponse(JSON.stringify({ error: 'Event not found' }), 404, request);
    ev.players = (ev.players || []).filter(p => p.id !== playerId);
    await env.DATA_KV.put(DATA_KEY, JSON.stringify({ record }));
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ CONFIG (webhook URL etc.) ════════════════════════════════
async function getConfig(env, request) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const raw = await env.DATA_KV.get('nba2k_config');
    if (!raw) return corsResponse(JSON.stringify({ discordWebhookUrl: '' }), 200, request);
    return corsResponse(raw, 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

async function putConfig(request, env) {
  try {
    if (!env.DATA_KV) return corsResponse(JSON.stringify({ error: 'DATA_KV not configured' }), 500, request);
    const body = await request.json();
    const allowed = ['discordWebhookUrl'];
    const safe = {};
    allowed.forEach(k => { if (body[k] !== undefined) safe[k] = body[k]; });
    await env.DATA_KV.put('nba2k_config', JSON.stringify(safe));
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ GM PRESENCE ═════════════════════════════════════════════
async function getGmPresence(env, request) {
  try {
    const raw = await env.DATA_KV.get('kw5_gm_presence');
    return corsResponse(raw || '{}', 200, request);
  } catch(e) { return corsResponse('{}', 200, request); }
}

async function postGmPresence(request, env) {
  try {
    const body = await request.json();
    const { teamId, discordId, name, ts } = body;
    if (!teamId) return corsResponse(JSON.stringify({ error: 'Missing teamId' }), 400, request);
    const raw = await env.DATA_KV.get('kw5_gm_presence');
    const presence = raw ? JSON.parse(raw) : {};
    presence[teamId] = { discordId, name, ts: ts || Date.now() };
    await env.DATA_KV.put('kw5_gm_presence', JSON.stringify(presence), { expirationTtl: 300 });
    return corsResponse(JSON.stringify({ ok: true }), 200, request);
  } catch(e) { return corsResponse(JSON.stringify({ error: e.message }), 500, request); }
}

// ═══ CORS ═════════════════════════════════════════════════════
function corsResponse(body, status, request) {
  const origin = request?.headers?.get('Origin') || '*';
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    }
  });
}
