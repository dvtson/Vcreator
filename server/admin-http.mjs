import { accountHandlers, SUPER_UID } from './accounts.mjs';
import { previewImage } from './preview-core.mjs';
import { googleServices, verifyIdToken, PROJECT_ID } from './firebase-rest.mjs';
import { lookup } from 'node:dns/promises';

export function createAdminApi({ fetcher = fetch, verifier = verifyIdToken, services = googleServices, preview = previewImage, resolver = lookup } = {}) {
  return { async fetch(request, env) {
    const origin = request.headers.get('Origin'); const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const cors = { ...(origin && allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}), Vary: 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    const json = (value, status = 200) => Response.json(value, { status, headers: cors });
    if (origin && !allowed.includes(origin)) return json({ error: { code: 'permission-denied', message: 'Địa chỉ website chưa được cho phép.' } }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '600' } });
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') return json({ service: 'VRB Creator Admin API', configured: !!env.GOOGLE_SERVICE_ACCOUNT_JSON, project: PROJECT_ID });
    if (request.method !== 'POST' || !['/api/createAdminAccount','/api/listAdminAccounts','/api/changeAdminAccount','/api/previewImage'].includes(url.pathname)) return json({ error: { code: 'not-found', message: 'Không tìm thấy thao tác.' } }, 404);
    try {
      if (env.FIREBASE_PROJECT_ID !== PROJECT_ID || !env.GOOGLE_SERVICE_ACCOUNT_JSON) throw Error('not-configured');
      const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
      if (!token) throw Error('unauthenticated');
      const caller = await verifier(token, PROJECT_ID, fetcher);
      const { auth, db } = services(env, fetcher);
      const account = await auth.lookup(caller.sub);
      if (!account || account.disabled || !Number.isFinite(Number(account.validSince || 0)) || caller.auth_time < Number(account.validSince || 0)) throw Error('unauthenticated');
      // Read-only authorization precedes password-body parsing and privileged writes.
      if (url.pathname !== '/api/previewImage' && caller.sub !== SUPER_UID) throw Error('permission-denied');
      if (url.pathname === '/api/previewImage' && caller.sub !== SUPER_UID) {
        const profile = (await db.collection('admin_users').doc(caller.sub).get()).data();
        if (!profile?.enabled || profile.role !== 'admin' || profile.email !== caller.email) throw Error('permission-denied');
      }
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw Error('invalid-argument');
      const reader = request.body?.getReader(); let length = 0; const chunks = [];
      if (!reader) throw Error('invalid-argument');
      try { while (true) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > 6000) throw Error('invalid-argument'); chunks.push(part.value); } } finally { await reader.cancel().catch(() => {}); }
      const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let data; try { data = JSON.parse(new TextDecoder().decode(bytes)).data; } catch { throw Error('invalid-argument'); }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('invalid-argument');
      const handlers = accountHandlers(auth, db); let result;
      switch (url.pathname) {
        case '/api/createAdminAccount': result = await handlers.create(caller.sub, data); break;
        case '/api/listAdminAccounts': result = await handlers.list(caller.sub); break;
        case '/api/changeAdminAccount': result = await handlers.change(caller.sub, data); break;
        default:
          try { result = await preview(data.url, { resolve: (host, options) => resolver(host, options), fetcher, maxImageBytes: 2 * 1024 * 1024, maxPageBytes: 2_000_000 }); }
          catch { result = { warning: 'Chưa lấy được ảnh từ nền tảng hoặc ảnh vượt dung lượng hỗ trợ. Đã giữ ảnh hiện có.' }; }
      }
      return json({ result });
    } catch (error) {
      const codes = { unauthenticated: 401, 'permission-denied': 403, 'invalid-argument': 400, 'already-exists': 409, 'not-found': 404, 'resource-exhausted': 429, 'not-configured': 503 };
      const code = Object.hasOwn(codes, error?.message) ? error.message : 'service-unavailable';
      return json({ error: { code, message: code === 'not-configured' ? 'Dịch vụ quản trị chưa được cấu hình.' : code === 'already-exists' ? 'Email đã có tài khoản.' : 'Không thực hiện được thao tác. Kiểm tra quyền và kết nối rồi thử lại.' } }, codes[code] || 503);
    }
  } };
}
export default createAdminApi();
