import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateNewAccount } from '../../services/adminRoles';
import { changeManagedAccount, createManagedAccount, listManagedAccounts } from '../../services/adminApi';
import type { ManagedAccount } from '../../services/adminApi';

function AccountRow({ row, busy, update }: { row: ManagedAccount; busy: boolean; update: (row: ManagedAccount) => void }) {
  const [role, setRole] = useState(row.role); const [enabled, setEnabled] = useState(row.enabled);
  return <tr className="border-t"><td className="p-4 break-all">{row.email}</td><td className="p-4"><select aria-label={'Quyền của ' + row.email} disabled={busy} value={role} onChange={e => setRole(e.target.value as typeof role)} className="border rounded-lg p-2"><option value="admin">Admin</option><option value="reviewer">Người xem bài dự thi</option></select></td><td className="p-4"><label className="flex gap-2 items-center"><input disabled={busy} type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />Cho phép đăng nhập</label></td><td className="p-4"><button disabled={busy || (role === row.role && enabled === row.enabled)} onClick={() => update({ ...row, role, enabled })} className="border rounded-lg px-3 py-2 disabled:opacity-40">Lưu quyền</button></td></tr>;
}
export function AdminAccountsPage() {
  const { user } = useAuth(); const [rows, setRows] = useState<ManagedAccount[]>([]);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'reviewer' });
  const [busy, setBusy] = useState(false); const lock = useRef(false); const requestId = useRef(crypto.randomUUID());
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const load = async () => { if (lock.current) return; lock.current = true; setBusy(true); setError(''); try { setRows(await listManagedAccounts()); } catch { setError('Chưa tải được danh sách tài khoản. Dịch vụ quản lý tài khoản có thể chưa được triển khai; hãy kiểm tra kết nối và cấu hình máy chủ.'); } finally { lock.current = false; setBusy(false); } };
  useEffect(() => { if (user?.role === 'super_admin') void load(); }, [user?.role]);
  if (user?.role !== 'super_admin') return <p role="alert">Chỉ Super admin được quản lý tài khoản.</p>;
  return <div className="max-w-5xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">Tài khoản & Phân quyền</h1>
    <p className="bg-blue-50 rounded-xl p-4">Super admin: <strong>{user.username}</strong>. Chỉ tài khoản này được tạo và phân quyền. Tài khoản mới đăng nhập bằng email/mật khẩu, không cần mã xác thực email.</p>
    <div className="text-sm text-slate-600 space-y-1"><p><strong>Admin:</strong> quản lý nội dung website và bài dự thi, không quản lý tài khoản.</p><p><strong>Người xem bài dự thi:</strong> chỉ xem, tìm kiếm và xuất danh sách bài gửi.</p></div>
    {error && <p role="alert" className="bg-amber-50 rounded-xl p-4">{error}</p>}{message && <p role="status" className="bg-green-50 rounded-xl p-4">{message}</p>}
    <form className="bg-white border rounded-2xl p-5" onSubmit={async e => {
      e.preventDefault(); if (lock.current) return; setError(''); setMessage('');
      try { validateNewAccount(form); } catch (reason) { setError((reason as Error).message); return; }
      lock.current = true; setBusy(true);
      try {
        const row = await createManagedAccount({ ...form, requestId: requestId.current });
        setRows(previous => [row, ...previous.filter(item => item.uid !== row.uid)]); setMessage('Đã tạo tài khoản ' + row.email + '. Bạn vẫn đăng nhập bằng tài khoản Super admin.');
        setForm({ email: '', password: '', confirmPassword: '', role: 'reviewer' }); requestId.current = crypto.randomUUID();
      } catch (reason) {
        const code = (reason as { code?: string }).code;
        setError(code === 'admin/already-exists' ? 'Email này đã có tài khoản. Chưa thay đổi mật khẩu hoặc quyền của tài khoản đó.' : 'Chưa xác nhận tạo tài khoản thành công. Bạn có thể tải lại danh sách để kiểm tra, rồi thử lại.');
      } finally { lock.current = false; setBusy(false); }
    }}><fieldset disabled={busy} className="grid sm:grid-cols-2 gap-5 min-w-0">
      <label className="font-semibold">Địa chỉ email<input required type="email" maxLength={254} autoComplete="off" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); requestId.current = crypto.randomUUID(); }} className="block w-full mt-2 border rounded-xl p-3 font-normal" /></label>
      <label className="font-semibold">Quyền<select value={form.role} onChange={e => { setForm({ ...form, role: e.target.value }); requestId.current = crypto.randomUUID(); }} className="block w-full mt-2 border rounded-xl p-3 font-normal"><option value="reviewer">Người xem bài dự thi</option><option value="admin">Admin</option></select></label>
      <label className="font-semibold">Mật khẩu<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); requestId.current = crypto.randomUUID(); }} className="block w-full mt-2 border rounded-xl p-3 font-normal" /></label>
      <label className="font-semibold">Xác nhận mật khẩu<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.confirmPassword} onChange={e => { setForm({ ...form, confirmPassword: e.target.value }); requestId.current = crypto.randomUUID(); }} className="block w-full mt-2 border rounded-xl p-3 font-normal" /></label>
      <p className="text-sm text-slate-500 sm:col-span-2">Mật khẩu từ 8 đến 128 ký tự. Mật khẩu chỉ dùng khi tạo tài khoản, không hiển thị trong danh sách hoặc xuất ra file.</p>
      <button type="submit" disabled={busy} className="justify-self-start bg-vrb-blue text-white rounded-xl px-5 py-3 disabled:opacity-50">{busy ? 'Đang xử lý…' : 'Lưu tài khoản mới'}</button>
    </fieldset></form>
    <button disabled={busy} onClick={() => void load()} className="border rounded-xl px-4 py-2">Tải lại danh sách tài khoản</button>
    <div className="bg-white border rounded-2xl overflow-x-auto"><table className="w-full min-w-[740px] text-sm text-left"><thead className="bg-slate-100"><tr>{['Email', 'Quyền', 'Trạng thái', 'Thao tác'].map(text => <th key={text} className="p-4">{text}</th>)}</tr></thead><tbody>
      {rows.map(row => <AccountRow key={row.uid + row.role + row.enabled} row={row} busy={busy} update={async next => {
        if (lock.current) return; lock.current = true; setBusy(true); setError(''); setMessage('');
        try { const result = await changeManagedAccount(next.uid, next.role, next.enabled); setRows(previous => previous.map(item => item.uid === result.uid ? result : item)); setMessage('Đã cập nhật quyền tài khoản. Người dùng cần đăng nhập lại.'); }
        catch { setError('Chưa xác nhận cập nhật quyền thành công. Tải lại danh sách để kiểm tra trước khi thử lại.'); }
        finally { lock.current = false; setBusy(false); }
      }} />)}
      {!rows.length && <tr><td colSpan={4} className="p-5 text-slate-500">Chưa tải được tài khoản được cấp quyền hoặc chưa có tài khoản bổ sung.</td></tr>}
    </tbody></table></div>
  </div>;
}
