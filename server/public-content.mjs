const BASE = 'https://firestore.googleapis.com/v1/projects/vrb-creator/databases/(default)/documents';
const STORES = ['program_info', 'challenges', 'awards', 'featured_individuals', 'featured_contents', 'faqs', 'leaderboards'];
const MEDIA = ['logoUrl', 'bannerUrl', 'avatarUrl', 'thumbnailUrl'];
function decode(value) {
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decode(item)]));
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('integerValue' in value) return Number(value.integerValue);
  for (const key of ['stringValue', 'booleanValue', 'doubleValue', 'timestampValue']) if (key in value) return value[key];
  return null;
}
const fields = value => decode({ mapValue: { fields: value.fields } });
export function createPublicContent({ fetcher = fetch, now = Date.now } = {}) {
  const cache = new Map();
  async function request(path) {
    // Intentionally anonymous: Firebase Rules also enforce public-only access.
    const response = await fetcher(BASE + path, { signal: AbortSignal.timeout(8_000) });
    if (response.status === 404) return null;
    if (!response.ok) throw Error('public-unavailable');
    return response.json();
  }
  async function state() {
    const data = await request('/site/state');
    const value = data && fields(data);
    if (!value || !/^[\w-]+$/.test(value.activeGeneration)) throw Error('public-unavailable');
    return value;
  }
  async function record(document, path) {
    const manifest = fields(document);
    if (!Number.isInteger(manifest.partCount) || manifest.partCount < 0 || manifest.partCount > 300 || typeof manifest.revision !== 'string') throw Error('invalid-content');
    let value = manifest.inline;
    if (!value) {
      const parts = [];
      for (let start = 0; start < manifest.partCount; start += 6) {
        parts.push(...await Promise.all(Array.from({ length: Math.min(6, manifest.partCount - start) }, async (_, offset) => {
          const index = start + offset;
          const document = await request(path + '/parts/' + encodeURIComponent(manifest.revision + '_' + index));
          const part = document && fields(document);
          if (!part || part.revision !== manifest.revision || part.index !== index || typeof part.text !== 'string') throw Error('invalid-content');
          return part.text;
        })));
      }
      value = JSON.parse(parts.join(''));
    }
    if (!value || value.id !== decodeURIComponent(path.split('/').at(-1))) throw Error('invalid-content');
    return { value, revision: manifest.revision };
  }
  async function listing(store) {
    const previous = cache.get(store);
    if (previous && now() - previous.at < 15_000) return previous.promise;
    const promise = (async () => {
      const current = await state();
      const base = '/datasets/' + current.activeGeneration + '/publicStores/' + store + '/records';
      const data = await request(base + '?pageSize=1000');
      if (data?.nextPageToken) throw Error('public-too-large');
      const rows = await Promise.all((data?.documents || []).map(document => record(document, base + '/' + encodeURIComponent(decodeURIComponent(document.name.split('/').at(-1))))));
      return rows.filter(({ value }) => !('status' in value) || value.status === 'published');
    })();
    cache.set(store, { promise, at: now() });
    promise.catch(() => { if (cache.get(store)?.promise === promise) cache.delete(store); });
    return promise;
  }
  return async request => {
    const url = new URL(request.url); const store = url.searchParams.get('store');
    const noCache = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (request.method !== 'GET' || !STORES.includes(store)) return Response.json({ error: 'not-found' }, { status: 404, headers: noCache });
    try {
      const rows = await listing(store);
      const id = url.searchParams.get('id');
      const headers = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Vercel-CDN-Cache-Control': 'public, s-maxage=15', 'X-Content-Type-Options': 'nosniff' };
      if (id) {
        const field = url.searchParams.get('field');
        const entry = rows.find(row => row.value.id === id && row.revision === url.searchParams.get('rev'));
        if (!entry || !MEDIA.includes(field)) return Response.json({ error: 'not-found' }, { status: 404, headers: noCache });
        const match = entry.value[field]?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/);
        if (!match) throw Error('invalid-image');
        return new Response(Buffer.from(match[2], 'base64'), { headers: { ...headers, 'Content-Type': match[1] } });
      }
      const values = rows.map(({ value, revision }) => {
        const slim = { ...value };
        for (const field of MEDIA) if (typeof slim[field] === 'string' && slim[field].startsWith('data:image/')) {
          slim[field] = '/api/publicContent?' + new URLSearchParams({ store, id: value.id, field, rev: revision });
        }
        return slim;
      });
      return Response.json({ rows: values }, { headers });
    } catch {
      return Response.json({ error: 'public-unavailable' }, { status: 503, headers: noCache });
    }
  };
}
