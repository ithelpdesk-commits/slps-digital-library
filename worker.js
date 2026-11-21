// Cloudflare Worker for the Ravi Renewables Travel Desk page.
// It keeps the RailRadar API key on the server and returns trains between two places.
// Setup: add a Secret named RAILRADAR_KEY in the Worker settings, then deploy this file.
// Call: https://<your-worker>.workers.dev/?from=Ghaziabad&to=Pune&date=2026-12-01

const ALLOWED_ORIGIN = 'https://ithelpdesk-commits.github.io';
const API = 'https://api.railradar.in/v1';

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Vary': 'Origin'
    }, extra || {})
  });
}

async function api(path, env) {
  const r = await fetch(API + path, { headers: { Authorization: 'Bearer ' + env.RAILRADAR_KEY } });
  let body = null;
  try { body = await r.json(); } catch (e) { /* not JSON */ }
  return { status: r.status, body: body };
}

// Turn what the traveller typed (a city, a station name or a code) into a station.
async function findStation(text, env) {
  const r = await api('/lookup/search/stations?limit=5&q=' + encodeURIComponent(text), env);
  if (r.status !== 200 || !r.body || !r.body.success) return { error: r.status };
  const list = r.body.data || [];
  const pick = list.find(function (s) { return s.isActive; }) || list[0];
  return pick ? { code: pick.code, name: pick.name } : { error: 404 };
}

function clean(v) {
  v = (v || '').trim();
  return /^[A-Za-z .'-]{2,40}$/.test(v) ? v : '';
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET') return json({ ok: false, error: 'Use GET.' }, 405);
    if (!env.RAILRADAR_KEY) return json({ ok: false, error: 'The RAILRADAR_KEY secret is not set on this Worker.' }, 500);

    const u = new URL(request.url);
    const from = clean(u.searchParams.get('from'));
    const to = clean(u.searchParams.get('to'));
    const date = u.searchParams.get('date') || '';
    if (!from || !to) return json({ ok: false, error: 'Send from and to, for example ?from=Ghaziabad&to=Pune' }, 400);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ ok: false, error: 'Date must look like 2026-12-01.' }, 400);

    // Same search within 6 hours is answered from cache, to save the monthly API quota.
    const cacheKey = new Request(u.origin + '/?from=' + encodeURIComponent(from.toLowerCase()) +
      '&to=' + encodeURIComponent(to.toLowerCase()) + '&date=' + date);
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    const found = await Promise.all([findStation(from, env), findStation(to, env)]);
    const f = found[0], t = found[1];
    if (f.error === 429 || t.error === 429) return json({ ok: false, error: 'The monthly train search limit is used up.' }, 429);
    if (f.error === 401 || f.error === 403) return json({ ok: false, error: 'RailRadar rejected the API key.' }, 502);
    if (f.error) return json({ ok: false, error: 'Could not find a station for "' + from + '".' }, 404);
    if (t.error) return json({ ok: false, error: 'Could not find a station for "' + to + '".' }, 404);

    const r = await api('/trains/between/' + f.code + '/' + t.code + '?byCity=true' + (date ? '&date=' + date : ''), env);
    if (r.status === 429) return json({ ok: false, error: 'The monthly train search limit is used up.' }, 429);
    if (r.status !== 200 || !r.body || !r.body.success) {
      return json({ ok: false, error: 'RailRadar could not answer this search (status ' + r.status + ').' }, 502);
    }

    const trains = (r.body.data.trains || []).map(function (x) {
      return {
        no: x.train.number,
        name: x.train.name,
        type: x.train.type,
        from: x.from.name,
        to: x.to.name,
        dep: x.from.departure,
        arr: x.to.arrival,
        dur: x.duration,
        days: x.train.runDays || []
      };
    });

    const res = json({ ok: true, from: f, to: t, trains: trains }, 200, { 'Cache-Control': 'public, max-age=21600' });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  }
};
