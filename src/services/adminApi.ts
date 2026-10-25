import { auth } from './firebase';
import { requireAdmin, requireSuperAdmin } from './authService';
import { validateNewAccount } from './adminRoles';
export interface ManagedAccount { uid: string; email: string; role: 'admin' | 'reviewer'; enabled: boolean; createdAt: string; }
export async function adminCall<T>(name: string, data: unknown): Promise<T> {
  const configured = import.meta.env.VITE_ADMIN_API_URL?.trim() || window.location.origin;
  const base = new URL(configured);
  const local = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(base.hostname);
  if ((!local && base.protocol !== 'https:') || base.username || base.password || base.search || base.hash || !['', '/'].includes(base.pathname)) throw new Error('Địa chỉ máy chủ quản trị không hợp lệ.');
  if (!auth?.currentUser) throw new Error('Cần đăng nhập lại tài khoản quản trị.');
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(new URL('/api/' + name, base), {
    method: 'POST', redirect: 'error', credentials: 'omit', cache: 'no-store',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }), signal: AbortSignal.timeout(30_000),
  });
  const body = await response.json();
  if (!response.ok || body.error) throw Object.assign(new Error(body.error?.message || 'Không kết nối được máy chủ quản trị.'), { code: 'admin/' + (body.error?.code || 'service-unavailable') });
  if (!Object.hasOwn(body, 'result')) throw new Error('Phản hồi máy chủ không hợp lệ.');
  return body.result as T;
}
export async function createManagedAccount(input: { email: string; password: string; confirmPassword: string; role: string; requestId: string }) {
  requireSuperAdmin();
  return adminCall<ManagedAccount>('createAdminAccount', { ...validateNewAccount(input), requestId: input.requestId });
}
export async function listManagedAccounts() { requireSuperAdmin(); return adminCall<ManagedAccount[]>('listAdminAccounts', {}); }
export async function changeManagedAccount(uid: string, role: 'admin' | 'reviewer', enabled: boolean) {
  requireSuperAdmin(); return adminCall<ManagedAccount>('changeAdminAccount', { uid, role, enabled });
}
export async function automaticThumbnail(url: string): Promise<{ image?: string; warning?: string }> {
  requireAdmin();
  try { return await adminCall('previewImage', { url }); }
  catch { return { warning: 'Chưa lấy được ảnh bìa video. Kiểm tra dịch vụ lấy ảnh hoặc thử lại nếu nền tảng đang chặn truy cập.' }; }
}
