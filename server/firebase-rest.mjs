export const PROJECT_ID = 'vrb-creator';
const encoder = new TextEncoder();
const base64url = value => btoa(String.fromCharCode(...encoder.encode(JSON.stringify(value)))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const bytes = value => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
let accessCache; let jwkCache;

export async function googleAccessToken(env, fetcher = fetch) {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON || env.FIREBASE_PROJECT_ID !== PROJECT_ID) throw Error('not-configured');
  const now = Math.floor(Date.now() / 1000);
  if (accessCache?.secret === env.GOOGLE_SERVICE_ACCOUNT_JSON && accessCache.expires > now + 60) return accessCache.token;
  let service;
  try { service = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON); } catch { throw Error('not-configured'); }
  if (service.project_id !== PROJECT_ID || !service.client_email?.endsWith('@' + PROJECT_ID + '.iam.gserviceaccount.com') || !service.private_key) throw Error('not-configured');
  const header = base64url({ alg: 'RS256', typ: 'JWT' });
  const payload = base64url({ iss: service.client_email, scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const keyBytes = bytes(service.private_key.replace(/-----[^-]+-----|\s/g, ''));
  const key = await crypto.subtle.importKey('pkcs8', keyBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(header + '.' + payload)));
  const encodedSignature = btoa(String.fromCharCode(...signature)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const response = await fetcher('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: header + '.' + payload + '.' + encodedSignature }), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw Error('service-unavailable');
  const data = await response.json(); if (!data.access_token) throw Error('service-unavailable');
  accessCache = { secret: env.GOOGLE_SERVICE_ACCOUNT_JSON, token: data.access_token, expires: now + Math.min(Number(data.expires_in) || 3600, 3600) };
  return data.access_token;
}

export async function verifyIdToken(token, project = PROJECT_ID, fetcher = fetch) {
  if (project !== PROJECT_ID || typeof token !== 'string' || token.length > 10_000) throw Error('unauthenticated');
  const pieces = token.split('.'); if (pieces.length !== 3) throw Error('unauthenticated');
  let header, payload;
  try { header = JSON.parse(new TextDecoder().decode(bytes(pieces[0]))); payload = JSON.parse(new TextDecoder().decode(bytes(pieces[1]))); } catch { throw Error('unauthenticated'); }
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || payload.aud !== project || payload.iss !== 'https://securetoken.google.com/' + project || typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128 || !Number.isFinite(payload.exp) || payload.exp <= now || !Number.isFinite(payload.iat) || payload.iat > now + 60 || !Number.isFinite(payload.auth_time) || payload.auth_time > now + 60) throw Error('unauthenticated');
  const unknownKey = jwkCache && !jwkCache.keys.some(value => value.kid === header.kid);
  if (!jwkCache || jwkCache.expires < now || (unknownKey && jwkCache.refreshedAt < now - 60)) {
    const response = await fetcher('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw Error('service-unavailable');
    const data = await response.json(); jwkCache = { keys: data.keys || [], expires: now + 3600, refreshedAt: now };
  }
  let jwk = jwkCache.keys.find(value => value.kid === header.kid);
  if (!jwk) {
    // Allow key rotation, while throttling refetches for attacker-supplied kids.
    throw Error('unauthenticated');
  }
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes(pieces[2]), encoder.encode(pieces[0] + '.' + pieces[1]))) throw Error('unauthenticated');
  return payload;
}

function encode(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  throw Error('invalid-argument');
}
function decode(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, 'booleanValue' in value ? value.booleanValue : 'integerValue' in value ? Number(value.integerValue) : 'doubleValue' in value ? value.doubleValue : 'timestampValue' in value ? value.timestampValue : value.stringValue ?? null]));
}

export function googleServices(env, fetcher = fetch) {
  async function request(url, options = {}, missing = false) {
    const token = await googleAccessToken(env, fetcher);
    const response = await fetcher(url, { ...options, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000) });
    if (missing && response.status === 404) return null;
    if (!response.ok) {
      let reason = ''; try { reason = (await response.json()).error?.message || ''; } catch {}
      if (/EMAIL_EXISTS/.test(reason)) throw Object.assign(Error('already-exists'), { code: 'auth/email-already-exists' });
      if (/USER_NOT_FOUND/.test(reason)) throw Error('not-found');
      // Never expose provider error bodies, request bodies or credentials.
      throw Error('service-unavailable');
    }
    return response.status === 204 ? {} : response.json();
  }
  const authUrl = 'https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT_ID;
  const post = (suffix, body) => request(authUrl + suffix, { method: 'POST', body: JSON.stringify(body) });
  const auth = {
    createUser: value => post('/accounts', { localId: value.uid, email: value.email, password: value.password, disabled: value.disabled, emailVerified: false }),
    updateUser: (uid, values) => post('/accounts:update', { localId: uid, ...(typeof values.disabled === 'boolean' ? { disableUser: values.disabled } : {}) }),
    deleteUser: uid => post('/accounts:delete', { localId: uid }),
    revokeRefreshTokens: uid => post('/accounts:update', { localId: uid, validSince: Math.floor(Date.now() / 1000) }),
    async lookup(uid) { const data = await post('/accounts:lookup', { localId: [uid] }); return data.users?.[0] || null; },
  };
  const base = 'https://firestore.googleapis.com/v1/projects/' + PROJECT_ID + '/databases/(default)/documents/admin_users';
  const db = { collection(name) {
    if (name !== 'admin_users') throw Error('invalid-argument');
    return {
      doc(uid) {
        if (typeof uid !== 'string' || !uid || uid.includes('/') || uid.length > 128) throw Error('invalid-argument');
        const url = base + '/' + encodeURIComponent(uid);
        const write = (values, merge, exists) => {
          const params = new URLSearchParams(); if (merge) for (const key of Object.keys(values)) params.append('updateMask.fieldPaths', key);
          if (exists) params.set('currentDocument.exists', 'true');
          return request(url + '?' + params, { method: 'PATCH', body: JSON.stringify({ fields: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, encode(value)])) }) });
        };
        return {
          async get() { const data = await request(url, {}, true); return { data: () => data ? decode(data.fields) : undefined }; },
          set: (values, options) => write(values, options?.merge, false),
          update: values => write(values, true, true),
          delete: () => request(url, { method: 'DELETE' }, true),
        };
      },
      async get() {
        let next = ''; const docs = [];
        for (let page = 0; page < 20; page++) {
          const params = new URLSearchParams({ pageSize: '1000', ...(next ? { pageToken: next } : {}) });
          const data = await request(base + '?' + params);
          docs.push(...(data.documents || []).map(value => ({ id: decodeURIComponent(value.name.split('/').at(-1)), data: () => decode(value.fields) })));
          next = data.nextPageToken; if (!next) return { docs };
        }
        throw Error('resource-exhausted');
      },
    };
  } };
  return { auth, db };
}
