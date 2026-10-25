import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAdminApi } from '../server/admin-http.mjs';
import { verifyIdToken, googleAccessToken, googleServices, PROJECT_ID } from '../server/firebase-rest.mjs';
import { SUPER_UID } from '../server/accounts.mjs';

const now = Math.floor(Date.now() / 1000);
const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' }, true, ['sign','verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'isolated-fixture' };
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
async function token(changes = {}, header = {}) {
  const input = b64({ alg: 'RS256', kid: jwk.kid, ...header }) + '.' + b64({ sub: SUPER_UID, email: 'sondvt@vrbank.com.vn', aud: PROJECT_ID, iss: 'https://securetoken.google.com/' + PROJECT_ID, exp: now + 3600, iat: now, auth_time: now, ...changes });
  return input + '.' + Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(input))).toString('base64url');
}
let publicRequests = 0;
const keyFetch = async url => { assert.ok(String(url).startsWith('https://www.googleapis.com/service_accounts/v1/jwk/')); publicRequests++; return Response.json({ keys: [jwk] }); };
const signed = await token(); assert.equal((await verifyIdToken(signed, PROJECT_ID, keyFetch)).sub, SUPER_UID);
for (const changes of [{ exp: now - 1 }, { aud: 'other-project' }, { iss: 'https://evil.test' }, { sub: '' }, { auth_time: now + 500 }]) await assert.rejects(verifyIdToken(await token(changes), PROJECT_ID, keyFetch));
await assert.rejects(verifyIdToken(await token({}, { alg: 'none' }), PROJECT_ID, keyFetch));
await assert.rejects(verifyIdToken(signed.slice(0,-8) + 'AAAAAAAA', PROJECT_ID, keyFetch));
await assert.rejects(verifyIdToken(await token({}, { kid: 'unknown' }), PROJECT_ID, keyFetch)); assert.equal(publicRequests, 1);

const privateKey = Buffer.from(await crypto.subtle.exportKey('pkcs8', pair.privateKey)).toString('base64');
const service = { project_id: PROJECT_ID, client_email: 'worker-fixture@vrb-creator.iam.gserviceaccount.com', private_key: '-----BEGIN PRIVATE KEY-----\n' + privateKey + '\n-----END PRIVATE KEY-----\n' };
const env = { FIREBASE_PROJECT_ID: PROJECT_ID, GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify(service), ALLOWED_ORIGINS: 'http://localhost:5173' };
let oauthRequests = 0; const calls = [];
const googleFetch = async (url, options) => {
  if (String(url) === 'https://oauth2.googleapis.com/token') {
    oauthRequests++; const assertion = new URLSearchParams(options.body).get('assertion').split('.');
    assert.equal(JSON.parse(Buffer.from(assertion[1], 'base64url')).aud, 'https://oauth2.googleapis.com/token');
    assert.equal(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pair.publicKey, Buffer.from(assertion[2], 'base64url'), new TextEncoder().encode(assertion[0] + '.' + assertion[1])), true);
    return Response.json({ access_token: 'fixture-access-token', expires_in: 3600 });
  }
  assert.equal(options.headers.Authorization, 'Bearer fixture-access-token');
  calls.push({ url: String(url), method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : undefined });
  if (String(url).includes('identitytoolkit')) return Response.json({ localId: 'staff_test', users: [{ localId: SUPER_UID, disabled: false, validSince: '0' }] });
  if (String(url).includes('/documents/admin_users')) {
    if (!options.method) return Response.json({ fields: { role: { stringValue: 'admin' }, enabled: { booleanValue: true } } });
    return Response.json({});
  }
  throw Error('Unexpected external request');
};
assert.equal(await googleAccessToken(env, googleFetch), 'fixture-access-token');
assert.equal(await googleAccessToken(env, googleFetch), 'fixture-access-token'); assert.equal(oauthRequests, 1);
const rest = googleServices(env, googleFetch);
await rest.auth.createUser({ uid: 'staff_test', email: 'staff@example.test', password: 'fixture-password', disabled: true });
assert.equal(calls.at(-1).body.disabled, true); assert.equal(calls.at(-1).body.localId, 'staff_test');
await rest.auth.updateUser('staff_test', { disabled: true }); assert.equal(calls.at(-1).body.disableUser, true);
await rest.auth.revokeRefreshTokens('staff_test'); assert.equal(typeof calls.at(-1).body.validSince, 'number');
const ref = rest.db.collection('admin_users').doc('staff_test'); await ref.update({ enabled: false }); assert.ok(calls.at(-1).url.includes('currentDocument.exists=true')); assert.deepEqual(calls.at(-1).body.fields.enabled, { booleanValue: false });
assert.deepEqual((await ref.get()).data(), { role: 'admin', enabled: true });
assert.throws(() => rest.db.collection('other_collection'));

const users = new Map(), profiles = new Map(); let lookups = 0; let disabled = false; let validSince = 0;
const services = () => ({
  auth: {
    async lookup() { lookups++; return { disabled, validSince }; },
    async createUser(user) { users.set(user.uid, user); }, async updateUser(uid, values) { Object.assign(users.get(uid), values); }, async deleteUser(uid) { users.delete(uid); }, async revokeRefreshTokens() {},
  },
  db: { collection() { return { doc(uid) { return { async get() { return { data: () => profiles.get(uid) }; }, async set(value, options) { profiles.set(uid, options?.merge ? { ...profiles.get(uid), ...value } : value); }, async update(value) { Object.assign(profiles.get(uid), value); }, async delete() { profiles.delete(uid); } }; }, async get() { return { docs: [...profiles].map(([id, value]) => ({ id, data: () => value })) }; } }; } },
});
const worker = createAdminApi({ verifier: async value => ({ sub: value, email: 'staff@example.test', auth_time: now }), services, preview: async () => ({ image: 'data:image/jpeg;base64,fixture' }) });
const request = (name, uid, data = {}, origin = 'http://localhost:5173') => new Request('https://worker.example.test/api/' + name, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...(uid ? { Authorization: 'Bearer ' + uid } : {}) }, body: JSON.stringify({ data }) });
assert.equal((await worker.fetch(request('createAdminAccount', null), env)).status, 401); assert.equal(lookups, 0);
assert.equal((await worker.fetch(request('createAdminAccount', SUPER_UID, {}, 'https://evil.test'), env)).status, 403); assert.equal(lookups, 0);
assert.equal((await worker.fetch(request('createAdminAccount', 'reviewer'), env)).status, 403); assert.equal(users.size, 0);
disabled = true; assert.equal((await worker.fetch(request('createAdminAccount', SUPER_UID), env)).status, 401); disabled = false;
validSince = now + 1; assert.equal((await worker.fetch(request('listAdminAccounts', SUPER_UID), env)).status, 401); validSince = 0;
const input = { email: 'staff@example.test', password: 'fixture-password', role: 'reviewer', requestId: '12345678-1234-1234-1234-123456789abc' };
const created = await worker.fetch(request('createAdminAccount', SUPER_UID, input), env); assert.equal(created.status, 200); assert.equal(users.size, 1); assert.ok(!JSON.stringify([...profiles]).includes('fixture-password'));
const response = await worker.fetch(request('listAdminAccounts', SUPER_UID), env); assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'http://localhost:5173'); assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.equal((await response.json()).result.length, 1);
assert.equal((await worker.fetch(request('previewImage', 'reviewer', { url: 'https://example.test' }), env)).status, 403);
profiles.set('content-admin', { enabled: true, role: 'admin', email: 'staff@example.test' }); assert.equal((await worker.fetch(request('previewImage', 'content-admin', { url: 'https://www.youtube.com/watch?v=abcdefghijk' }), env)).status, 200);
assert.equal((await worker.fetch(request('listAdminAccounts', SUPER_UID), { ...env, GOOGLE_SERVICE_ACCOUNT_JSON: '' })).status, 503);
assert.equal((await worker.fetch(request('createAdminAccount', SUPER_UID, { ...input, email: 'x'.repeat(7000) }), env)).status, 400);
fs.mkdirSync('artifacts/api-check', { recursive: true }); fs.writeFileSync('artifacts/api-check/report.json', JSON.stringify({ passed: true, mode: 'Local Vercel-compatible API handler and REST mocks; ephemeral test RSA keys; no live credentials or Firebase writes', checks: ['Firebase JWT signature/audience/issuer/expiry checks', 'Service account JWT signature and OAuth caching', 'Create disabled vs update disableUser REST fields', 'Firestore patch masks and typed fields', 'Origin/anonymous/role/disabled/revoked authorization', 'Root-only account creation', 'No passwords in profiles', 'Oversized body and missing configuration fail closed'] }, null, 2));
console.log('Admin API authentication, Google REST adapters and account routes passed.');
