import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { accountHandlers, SUPER_UID } from './accounts.mjs';
import { previewImage as resolvePreview } from './preview.mjs';
initializeApp();
const auth = getAuth(); const db = getFirestore(); const accounts = accountHandlers(auth, db);
const options = { region: 'asia-southeast1', maxInstances: 2, timeoutSeconds: 30, memory: '256MiB' };
async function verifiedUid(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Cần đăng nhập.');
  const header = request.rawRequest.headers.authorization || '';
  const token = await auth.verifyIdToken(header.replace(/^Bearer /i, ''), true);
  return token.uid;
}
function callable(handler) { return onCall(options, async request => {
  try { return await handler(await verifiedUid(request), request.data || {}); }
  catch (error) {
    if (error instanceof HttpsError) throw error;
    const code = ['permission-denied','invalid-argument','already-exists','not-found'].includes(error?.message) ? error.message : 'internal';
    // Never return or log request bodies or passwords.
    throw new HttpsError(code, code === 'already-exists' ? 'Email đã có tài khoản. Không thay đổi mật khẩu tài khoản đó.' : code === 'permission-denied' ? 'Bạn không có quyền thực hiện thao tác này.' : 'Không thực hiện được thao tác. Kiểm tra dữ liệu và thử lại.');
  }
}); }
export const createAdminAccount = callable((uid, data) => accounts.create(uid, data));
export const listAdminAccounts = callable(uid => accounts.list(uid));
export const changeAdminAccount = callable((uid, data) => accounts.change(uid, data));
export const previewImage = callable(async (uid, data) => {
  if (uid !== SUPER_UID) { const member = (await db.collection('admin_users').doc(uid).get()).data(); if (!member?.enabled || member.role !== 'admin') throw Error('permission-denied'); }
  try { return await resolvePreview(data.url); }
  catch { return { warning: 'Nền tảng chưa cung cấp ảnh xem trước truy cập được. Đã giữ ảnh hiện có; bạn có thể chọn ảnh thủ công.' }; }
});
