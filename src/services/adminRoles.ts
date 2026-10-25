export type AdminRole = 'super_admin' | 'admin' | 'reviewer';
export const roleLabels: Record<AdminRole, string> = { super_admin: 'Super admin', admin: 'Admin', reviewer: 'Người xem bài dự thi' };
export function canManageContentRole(role?: AdminRole) { return role === 'super_admin' || role === 'admin'; }
export function validateNewAccount(input: { email: string; password: string; confirmPassword: string; role: string }) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Địa chỉ email không hợp lệ.');
  if (input.password.length < 8 || input.password.length > 128) throw new Error('Mật khẩu cần từ 8 đến 128 ký tự.');
  if (input.password !== input.confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
  if (!['admin', 'reviewer'].includes(input.role)) throw new Error('Quyền tài khoản không hợp lệ.');
  return { email, password: input.password, role: input.role as 'admin' | 'reviewer' };
}
