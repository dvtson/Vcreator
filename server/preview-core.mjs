import { Buffer } from 'node:buffer';
function isIP(ip) { if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) && ip.split('.').every(part => Number(part) <= 255)) return 4; if (/^[0-9a-f:]+$/i.test(ip) && ip.includes(':')) return 6; return 0; }
const providers = ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'www.tiktok.com', 'facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
export function providerUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !providers.includes(url.hostname) || url.href.length > 2000) throw Error('unsupported-url');
  if (url.hostname.endsWith('tiktok.com') && url.pathname.includes('/@/')) throw Error('missing-account');
  return url;
}
export function publicIp(ip) {
  if (isIP(ip) === 4) {
    const [a,b] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 100 && b >= 64 && b <= 127) || a === 198);
  }
  // Fail closed for mapped/encoded IPv4 and non-global IPv6 ranges.
  return isIP(ip) === 6 && /^[23]/i.test(ip) && !ip.toLowerCase().startsWith('2001:db8:');
}
const cdn = ['tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokcdn-eu.com', 'byteoversea.com', 'ibytedtos.com', 'muscdn.com', 'fbcdn.net', 'fbsbx.com', 'ytimg.com'];
export async function safeFetch(value, { image = false, signal, resolve, fetcher = fetch } = {}) {
  let url = new URL(value);
  for (let hop = 0; hop <= 4; hop++) {
    const allowed = image ? cdn.some(host => url.hostname === host || url.hostname.endsWith('.' + host)) : providers.includes(url.hostname);
    if (!allowed || url.protocol !== 'https:' || url.username || url.password || url.port) throw Error('unsupported-url');
    if (typeof resolve !== 'function') throw Error('resolver-not-configured');
    const addresses = await resolve(url.hostname, { all: true });
    if (!addresses.length || addresses.some(item => !publicIp(item.address))) throw Error('unsupported-url');
    const response = await fetcher(url, { redirect: 'manual', signal, headers: { Accept: image ? 'image/jpeg,image/png,image/webp' : 'text/html,application/json', 'User-Agent': 'VRBCreatorPreview/1.0' } });
    if ([301,302,303,307,308].includes(response.status)) { await response.body?.cancel(); url = new URL(response.headers.get('location') || '', url); continue; }
    if (!response.ok) { await response.body?.cancel(); throw Error('provider-unavailable'); }
    return { response, url };
  }
  throw Error('too-many-redirects');
}
export async function boundedBytes(response, max) {
  if (Number(response.headers.get('content-length')) > max) { await response.body?.cancel(); throw Error('too-large'); }
  const reader = response.body.getReader(); let size = 0; const chunks = [];
  try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > max) throw Error('too-large'); chunks.push(Buffer.from(part.value)); } }
  finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks);
}
function unescape(value) { return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))); }
export function metadataImage(html) {
  // Parse only meta attributes; never execute or render provider HTML.
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), unescape(match[2] ?? match[3])]));
    if (['og:image', 'og:image:secure_url', 'twitter:image'].includes(attributes.property || attributes.name) && attributes.content) return attributes.content;
  }
  return null;
}
export function tiktokCover(html, videoId) {
  for (const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__', 'SIGI_STATE']) {
    const tag = html.match(new RegExp('<script[^>]*id=["\x27]' + id + '["\x27][^>]*>([\\s\\S]*?)</script>', 'i'));
    if (!tag) continue;
    try {
      const data = JSON.parse(tag[1]);
      const detail = data?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;
      const item = (detail && (!videoId || String(detail.id) === videoId) ? detail : null) || (videoId ? data?.ItemModule?.[videoId] : Object.values(data?.ItemModule || {})[0]);
      const cover = item?.video?.cover || item?.video?.originCover || item?.imagePost?.images?.[0]?.imageURL?.urlList?.[0];
      if (typeof cover === 'string') return cover;
    } catch { /* A provider page may be unavailable rather than a video page. */ }
  }
  return null;
}
export function imageType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP') return 'image/webp';
  throw Error('unsupported-image');
}
export async function previewImage(value, { resolve, fetcher = fetch, maxPageBytes = 2_000_000, maxImageBytes = 2 * 1024 * 1024 } = {}) {
  const original = providerUrl(value); const signal = AbortSignal.timeout(18_000); let image;
  if (original.hostname.includes('youtu')) {
    const id = original.hostname === 'youtu.be' ? original.pathname.slice(1) : original.searchParams.get('v') || original.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1];
    if (!/^[\w-]{11}$/.test(id || '')) throw Error('unsupported-url');
    image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } else {
    const tiktok = original.hostname.endsWith('tiktok.com');
    let canonical = original;
    // Prefer video-specific structured data over generic share images/avatars.
    try {
      const page = await safeFetch(original.href, { signal, resolve, fetcher });
      canonical = page.url;
      if (/\/login|\/checkpoint|\/consent/.test(canonical.pathname)) throw Error('provider-unavailable');
      const html = (await boundedBytes(page.response, maxPageBytes)).toString();
      if (tiktok) {
        const videoId = canonical.pathname.match(/\/video\/(\d+)/)?.[1];
        if (videoId) image = tiktokCover(html, videoId);
      }
      else if (/<meta\b[^>]*(?:og:video|video\.other|video\.movie)/i.test(html)) image = metadataImage(html);
    } catch { if (signal.aborted) throw Error('provider-unavailable'); }
    if (!image && tiktok) {
      const videoId = canonical.pathname.match(/\/video\/(\d+)/)?.[1];
      if (!videoId) throw Error('no-preview');
      const data = await safeFetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(canonical.href), { signal, resolve, fetcher });
      const json = JSON.parse((await boundedBytes(data.response, 1_000_000)).toString());
      if (json.type === 'video' && (!json.embed_product_id || String(json.embed_product_id) === videoId)) image = json.thumbnail_url;
    }
  }
  if (!image) throw Error('no-preview');
  const result = await safeFetch(image, { image: true, signal, resolve, fetcher });
  const bytes = await boundedBytes(result.response, maxImageBytes);
  const type = imageType(bytes);
  // Persist original image bytes, not short-lived provider CDN links.
  return { image: `data:${type};base64,${bytes.toString('base64')}` };
}
