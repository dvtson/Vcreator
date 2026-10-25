import { lookup } from 'node:dns/promises';
import { verifyIdToken, PROJECT_ID } from './firebase-rest.mjs';
import { SUPER_UID } from './accounts.mjs';
import { previewImage } from './preview-core.mjs';

// Local-only adapter: uses the signed-in user's token, never a service-account key.
export function previewDevPlugin(env, { fetcher = fetch, verify = verifyIdToken, preview = previewImage } = {}) {
  return { name: 'vrb-local-video-cover', configureServer(server) {
    server.middlewares.use('/api/previewImage', async (req, res) => {
      res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
      const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
      if (req.method !== 'POST') return send(405, { error: { message: 'Chỉ nhận yêu cầu POST.' } });
      const origin = req.headers.origin;
      if (origin && !['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin)) return send(403, { error: { message: 'Địa chỉ không được phép.' } });
      try {
        const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
        if (!token || !env.VITE_FIREBASE_API_KEY) throw Error('unauthenticated');
        const caller = await verify(token, PROJECT_ID, fetcher);
        const response = await fetcher('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(env.VITE_FIREBASE_API_KEY), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }), signal: AbortSignal.timeout(8_000),
        });
        const account = (await response.json()).users?.[0];
        if (!response.ok || !account || account.localId !== caller.sub || account.disabled || caller.auth_time < Number(account.validSince || 0)) throw Error('unauthenticated');
        if (caller.sub !== SUPER_UID) {
          const membership = await fetcher(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admin_users/${encodeURIComponent(caller.sub)}`, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(8_000) });
          const fields = (await membership.json()).fields;
          if (!membership.ok || fields?.enabled?.booleanValue !== true || fields?.role?.stringValue !== 'admin' || fields?.email?.stringValue !== caller.email) throw Error('permission-denied');
        }
        let length = 0; const chunks = [];
        for await (const chunk of req) { length += chunk.length; if (length > 6000) throw Error('invalid-body'); chunks.push(chunk); }
        const data = JSON.parse(Buffer.concat(chunks).toString()).data;
        const result = await preview(data.url, { resolve: lookup, fetcher });
        return send(200, { result });
      } catch (error) {
        if (['unauthenticated', 'permission-denied'].includes(error.message)) return send(403, { error: { message: 'Hãy đăng nhập tài khoản quản trị để lấy ảnh.' } });
        return send(200, { result: { warning: 'Chưa lấy được ảnh bìa của video này. Kiểm tra link đầy đủ và chế độ công khai, sau đó thử lại.' } });
      }
    });
  } };
}
