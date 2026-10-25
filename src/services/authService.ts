import { browserSessionPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { adminEmail, adminUid, auth } from './firebase';
import { canManageContentRole } from './adminRoles';
import type { AdminRole } from './adminRoles';
import { getMemberProfile } from './adminMembership';

export interface AdminUser { username: string; uid: string; loginTime: string; role: AdminRole; }
export interface AuthState { ready: boolean; user: AdminUser | null; error: string; }
let state: AuthState = { ready: false, user: null, error: '' };
const listeners = new Set<() => void>();
function publish(next: AuthState) { state = next; listeners.forEach(listener => listener()); }
function allowed(user: User | null): boolean {
  return Boolean(user && adminUid && user.uid === adminUid && user.email?.toLowerCase() === adminEmail);
}
async function asAdmin(user: User | null): Promise<AdminUser | null> {
  if (!user) return null;
  let role: AdminRole;
  if (allowed(user)) role = 'super_admin';
  else {
    let profile;
    try { profile = await getMemberProfile(user.uid); } catch { return null; }
    if (!profile?.enabled || !['admin', 'reviewer'].includes(profile.role || '') || profile.email !== user.email?.toLowerCase()) return null;
    role = profile.role as AdminRole;
  }
  return { username: user.email!, uid: user.uid, loginTime: user.metadata.lastSignInTime || '', role };
}
let revision = 0;
async function restore(user: User | null) {
  const token = ++revision;
  try { const resolved = await asAdmin(user); if (token === revision) publish({ ready: true, user: resolved, error: '' }); }
  catch { if (token === revision) publish({ ready: true, user: null, error: '' }); }
}
function message(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  if (code === 'auth/network-request-failed') return 'Không kết nối được dịch vụ đăng nhập. Vui lòng kiểm tra mạng và thử lại.';
  if (code === 'auth/too-many-requests') return 'Đã thử đăng nhập quá nhiều lần. Vui lòng đợi rồi thử lại.';
  if (code === 'auth/unauthorized-domain') return 'Địa chỉ website chưa được cho phép đăng nhập trong Firebase.';
  if (code === 'auth/operation-not-allowed') return 'Đăng nhập Email/Password chưa được bật trên Firebase.';
  return 'Email hoặc mật khẩu không chính xác, hoặc tài khoản chưa được cấp quyền quản trị.';
}
export const authReady: Promise<void> = (async () => {
  if (!auth || !adminUid || !adminEmail) { publish({ ready: true, user: null, error: 'Chưa cấu hình đầy đủ tài khoản quản trị Firebase.' }); return; }
  try {
    await setPersistence(auth, browserSessionPersistence);
    await auth.authStateReady();
    await restore(auth.currentUser);
    onAuthStateChanged(auth, user => { void restore(user); }, () => publish({ ready: true, user: null, error: 'Không xác minh được phiên đăng nhập. Vui lòng đăng nhập lại.' }));
    if (typeof window !== 'undefined') window.addEventListener('focus', () => { void restore(auth?.currentUser || null); });
  } catch { publish({ ready: true, user: null, error: 'Không khởi tạo được phiên đăng nhập. Kiểm tra quyền lưu trữ của trình duyệt.' }); }
})();
export function subscribeAuth(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getAuthState() { return state; }
export function isAuthenticated(): boolean { return state.ready && !!auth?.currentUser && state.user?.uid === auth.currentUser.uid; }
export function getCurrentUser(): AdminUser | null { return isAuthenticated() ? state.user : null; }
export function canManageContent(): boolean { return isAuthenticated() && canManageContentRole(state.user?.role); }
export function requireAdmin(): void { if (!canManageContent()) throw new Error('Bạn cần quyền quản trị nội dung để thực hiện thao tác này.'); }
export function requireSuperAdmin(): void { if (!isAuthenticated() || state.user?.role !== 'super_admin') throw new Error('Chỉ Super admin được quản lý tài khoản.'); }
export function requireSubmissionReader(): void { if (!isAuthenticated()) throw new Error('Bạn cần đăng nhập tài khoản được cấp quyền xem bài dự thi.'); }
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  await authReady;
  if (!auth || state.error) return { success: false, error: state.error || 'Chưa cấu hình Firebase.' };
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const resolved = await asAdmin(result.user);
    if (!resolved) { await signOut(auth); publish({ ready: true, user: null, error: '' }); return { success: false, error: 'Tài khoản này không có quyền quản trị.' }; }
    ++revision; publish({ ready: true, user: resolved, error: '' }); return { success: true };
  } catch (error) { return { success: false, error: message(error) }; }
}
export async function logout(): Promise<void> {
  await authReady;
  if (auth) await signOut(auth);
  ++revision;
  publish({ ready: true, user: null, error: '' });
}
