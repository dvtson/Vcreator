import { collection, doc, documentId, getDocFromServer, getDocsFromServer, limit, orderBy, query, runTransaction, serverTimestamp, setDoc, startAfter } from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { cloudEnabled, cloudWritesEnabled } from './firebase';
import { getCurrentUser, requireAdmin, requireSubmissionReader } from './authService';
import { validateSubmission } from './submissionModel';
import type { Submission, SubmissionInput } from './submissionModel';
export type SubmissionCursor = QueryDocumentSnapshot<DocumentData>;
async function database() {
  if (!cloudEnabled) throw new Error('Cần hoàn tất chuyển dữ liệu sang Cloud trước khi sử dụng danh sách bài gửi.');
  const { db } = await import('./firestoreClient');
  if (!db) throw new Error('Chưa cấu hình kết nối Firebase.');
  return db;
}
export async function submissionsOpen(): Promise<boolean> {
  if (!cloudEnabled) return false;
  const snapshot = await getDocFromServer(doc(await database(), 'submission_settings', 'public'));
  return snapshot.data()?.enabled === true;
}
export async function setSubmissionsOpen(enabled: boolean) {
  requireAdmin();
  if (!cloudWritesEnabled) throw new Error('Chưa cho phép ghi Cloud.');
  await setDoc(doc(await database(), 'submission_settings', 'public'), { enabled });
}
export async function submitEntry(input: SubmissionInput, id: string): Promise<string> {
  const clean = validateSubmission(input);
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Mã bài gửi không hợp lệ. Hãy tải lại trang.');
  const write = setDoc(doc(await database(), 'submissions', id), { ...clean, submittedAt: serverTimestamp() });
  // A timed-out write may still reach the server later; retain its ID on retry.
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([write, new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Chưa nhận được xác nhận từ máy chủ.')), 20_000);
    })]);
  } finally { clearTimeout(timeout); }
  return id;
}
export async function listSubmissions(cursor?: SubmissionCursor, size = 50) {
  requireSubmissionReader();
  const constraints = [orderBy('submittedAt', 'desc'), orderBy(documentId(), 'desc'), ...(cursor ? [startAfter(cursor)] : []), limit(size + 1)];
  const snapshot = await getDocsFromServer(query(collection(await database(), 'submissions'), ...constraints));
  const docs = snapshot.docs.slice(0, size);
  const rows: Submission[] = docs.map(item => {
    const value = item.data();
    return { id: item.id, fullName: value.fullName, phone: value.phone ?? '', branch: value.branch, originalUrl: value.originalUrl, submittedAt: value.submittedAt.toDate().toISOString(), updatedAt: value.updatedAt?.toDate().toISOString() };
  });
  return { rows, cursor: docs.at(-1), hasMore: snapshot.size > size };
}
export async function changeSubmission(row: Submission, remove = false) {
  requireAdmin();
  if (!cloudWritesEnabled) throw new Error('Chưa cho phép ghi Cloud.');
  if (!/^[a-f0-9-]{36}$/.test(row.id)) throw new Error('Mã bài gửi không hợp lệ.');
  const clean = remove ? null : validateSubmission(row);
  const reference = doc(await database(), 'submissions', row.id);
  await runTransaction(await database(), async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Bài gửi đã bị xóa. Hãy tải lại danh sách.');
    const current = snapshot.data();
    const revision = (current.updatedAt ?? current.submittedAt).toDate().toISOString();
    if (revision !== (row.updatedAt ?? row.submittedAt)) throw new Error('Bài gửi vừa được người khác chỉnh sửa. Hãy tải lại danh sách.');
    if (remove) transaction.delete(reference);
    else transaction.update(reference, { ...clean, updatedAt: serverTimestamp(), updatedBy: getCurrentUser()!.uid });
  });
  if (remove) return;
  const fresh = await getDocFromServer(reference);
  const value = fresh.data();
  if (!value) throw new Error('Bài gửi đã thay đổi. Hãy tải lại danh sách.');
  return { ...row, ...clean!, updatedAt: value.updatedAt.toDate().toISOString() };
}
export async function exportAllSubmissions(): Promise<Submission[]> {
  requireSubmissionReader();
  const rows: Submission[] = []; let cursor: SubmissionCursor | undefined;
  do {
    const page = await listSubmissions(cursor, 500); rows.push(...page.rows);
    if (!page.hasMore) return rows;
    cursor = page.cursor;
  } while (cursor);
  return rows;
}
