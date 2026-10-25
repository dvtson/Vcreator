import assert from 'node:assert/strict';
import fs from 'node:fs';
import { accountHandlers, SUPER_UID } from '../functions/accounts.mjs';
import { providerUrl, publicIp, safeFetch, boundedBytes, metadataImage, imageType, tiktokCover } from '../functions/preview.mjs';
const users = new Map(), profiles = new Map(); let failUpdate = false;
const auth = {
  async createUser(value) { if ([...users.values()].some(row => row.email === value.email)) throw { code: 'auth/email-already-exists' }; users.set(value.uid, { ...value }); },
  async updateUser(uid, values) { Object.assign(users.get(uid), values); },
  async deleteUser(uid) { users.delete(uid); }, async revokeRefreshTokens() {},
};
const db = { collection() { return {
  doc(uid) { return { async get() { return { data: () => profiles.get(uid) }; }, async set(values, options) { profiles.set(uid, options?.merge ? { ...profiles.get(uid), ...values } : { ...values }); }, async update(values) { if (failUpdate) { failUpdate = false; throw Error('network'); } profiles.set(uid, { ...profiles.get(uid), ...values }); }, async delete() { profiles.delete(uid); } }; },
  async get() { return { docs: [...profiles].map(([id, value]) => ({ id, data: () => value })) }; },
}; } };
const service = accountHandlers(auth, db);
const input = { email: ' Staff@Example.test ', password: 'fixture-password', role: 'reviewer', requestId: '12345678-1234-1234-1234-123456789abc' };
await assert.rejects(service.create('not-root', input)); assert.equal(users.size, 0);
await assert.rejects(service.create(SUPER_UID, { ...input, role: 'super_admin' }));
const first = await service.create(SUPER_UID, input); assert.equal(first.email, 'staff@example.test'); assert.equal(first.role, 'reviewer'); assert.equal(first.enabled, true);
assert.equal((await service.create(SUPER_UID, input)).uid, first.uid); assert.equal(users.size, 1);
assert.ok(!JSON.stringify([...profiles]).includes('fixture-password')); assert.ok(!JSON.stringify(await service.list(SUPER_UID)).includes('password'));
await assert.rejects(service.list(first.uid)); await assert.rejects(service.change(first.uid, { uid: first.uid, role: 'admin', enabled: true }));
await assert.rejects(service.change(SUPER_UID, { uid: SUPER_UID, role: 'reviewer', enabled: false }));
await service.change(SUPER_UID, { uid: first.uid, role: 'admin', enabled: false }); assert.equal(users.get(first.uid).disabled, true); assert.equal(profiles.get(first.uid).enabled, false);
failUpdate = true;
await assert.rejects(service.create(SUPER_UID, { ...input, email: 'rollback@example.test', requestId: '22345678-1234-1234-1234-123456789abc' }));
assert.equal(users.size, 1); assert.equal(profiles.size, 1);
await assert.rejects(service.create(SUPER_UID, { ...input, requestId: '32345678-1234-1234-1234-123456789abc' })); assert.equal(users.size, 1);
for (const url of ['http://www.tiktok.com/a', 'https://www.tiktok.com.evil.test/a', 'https://localhost/a', 'https://user:pass@www.facebook.com/a', 'https://www.tiktok.com/@/video/123']) assert.throws(() => providerUrl(url));
for (const ip of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '172.16.0.1', '192.168.0.1', '100.64.0.1', '::1', '::ffff:127.0.0.1', 'fc00::1']) assert.equal(publicIp(ip), false);
assert.equal(publicIp('8.8.8.8'), true);
const resolve = async () => [{ address: '8.8.8.8' }];
await assert.rejects(safeFetch('https://www.tiktok.com/a', { resolve, fetcher: async () => new Response('', { status: 302, headers: { location: 'http://169.254.169.254/' } }) }));
await assert.rejects(safeFetch('https://www.tiktok.com/a', { resolve: async () => [{ address: '127.0.0.1' }], fetcher: () => { throw Error('must not fetch'); } }));
await assert.rejects(boundedBytes(new Response('too large'), 2));
assert.equal(metadataImage('<meta content="https://a.tiktokcdn.com/a?x=1&amp;y=2" property="og:image">'), 'https://a.tiktokcdn.com/a?x=1&y=2');
const tiktokHtml='<meta property="og:image" content="https://a.tiktokcdn.com/avatar.jpg"><script id="SIGI_STATE">'+JSON.stringify({ItemModule:{'111':{id:'111',video:{cover:'https://a.tiktokcdn.com/wrong.jpg'}},'222':{id:'222',video:{cover:'https://a.tiktokcdn.com/correct.jpg'}}}})+'</script>';
assert.equal(tiktokCover(tiktokHtml,'222'),'https://a.tiktokcdn.com/correct.jpg');assert.equal(tiktokCover(tiktokHtml,'333'),null);
assert.equal(imageType(Buffer.from([255,216,255,0])), 'image/jpeg'); assert.throws(() => imageType(Buffer.from('<svg></svg>')));
fs.mkdirSync('artifacts/admin-backend', { recursive: true });
fs.writeFileSync('artifacts/admin-backend/report.json', JSON.stringify({ passed: true, mode: 'Business handlers with SDK doubles; no actual Firebase writes or Rules emulator', checks: ['Root-only account operations', 'No super-admin escalation', 'No passwords in profile/list', 'Idempotent create', 'Duplicate email preserved', 'Failed create rollback', 'Disable and role changes', 'SSRF host/IP/redirect rejection', 'Image byte limits and magic type validation'] }, null, 2));
console.log('Account provisioning and thumbnail server checks passed.');
