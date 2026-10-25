import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { submitEntry, submissionsOpen } from '../../services/submissionService';
import { validateSubmission } from '../../services/submissionModel';

export function SubmissionPage() {
  const [form, setForm] = useState({ fullName: '', phone: '', branch: '', originalUrl: '' });
  const [open, setOpen] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [error, setError] = useState(''); const [receipt, setReceipt] = useState('');
  const id = useRef(crypto.randomUUID());
  const load = () => { setError(''); setOpen(null); void submissionsOpen().then(setOpen).catch(() => setError('Không kiểm tra được tình trạng tiếp nhận. Vui lòng thử lại.')); };
  useEffect(load, []);
  return <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
    <h1 className="text-3xl font-bold text-vrb-blue">Gửi bài dự thi</h1>
    <p className="text-slate-600">Điền họ tên, số điện thoại, đơn vị và đường dẫn bài đăng. Không cần tải video hoặc ảnh lên website. Bài gửi chỉ Ban tổ chức xem được, chưa tự xuất hiện trên trang Nội dung nổi bật.</p>
    {receipt ? <section role="status" className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-3"><h2 className="text-lg font-bold">Đã nhận bài dự thi</h2><p>Mã tiếp nhận: <strong className="break-all">{receipt}</strong>. Bạn có thể lưu lại mã này để liên hệ Ban tổ chức.</p><Link to="/" className="text-vrb-blue underline">Về trang chủ</Link></section> : <>
      {error && <div role="alert" className="bg-amber-50 rounded-xl p-4">{error} {open === null && <button className="underline" onClick={load}>Thử lại</button>}</div>}
      {open === null && !error && <p role="status">Đang kiểm tra tiếp nhận…</p>}
      {open === false && <p role="status" className="bg-slate-100 p-5 rounded-xl">Ban tổ chức chưa mở hoặc đã tạm dừng nhận bài. Vui lòng quay lại sau.</p>}
      {open && <form className="bg-white border rounded-2xl p-6" onSubmit={async event => {
        event.preventDefault(); if (lock.current) return;
        setError('');
        try { validateSubmission(form); } catch (reason) { setError((reason as Error).message); return; }
        lock.current = true; setBusy(true);
        try { setReceipt(await submitEntry(form, id.current)); }
        catch { setError('Chưa xác nhận được bài gửi thành công. Nội dung bạn điền vẫn được giữ. Nếu đã thử gửi trước đó, hãy liên hệ Ban tổ chức kèm mã ' + id.current + ' để kiểm tra trước khi gửi lại.'); }
        finally { lock.current = false; setBusy(false); }
      }}><fieldset disabled={busy} className="space-y-5 min-w-0">
        <label className="block font-semibold">Họ và tên *<input required minLength={2} maxLength={120} autoComplete="name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="block w-full border rounded-xl p-3 mt-2 font-normal" /></label>
        <label className="block font-semibold">Số điện thoại *<input required type="tel" maxLength={24} autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="block w-full border rounded-xl p-3 mt-2 font-normal" /></label>
        <label className="block font-semibold">Đơn vị / Chi nhánh *<input required minLength={2} maxLength={160} autoComplete="organization" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="block w-full border rounded-xl p-3 mt-2 font-normal" /></label>
        <label className="block font-semibold">Đường dẫn bài dự thi *<input required type="url" maxLength={2000} placeholder="https://…" value={form.originalUrl} onChange={e => setForm({ ...form, originalUrl: e.target.value })} className="block w-full border rounded-xl p-3 mt-2 font-normal" /></label>
        <p className="text-sm text-slate-500">Thông tin được dùng để tiếp nhận và quản lý bài dự thi. Hãy kiểm tra bài đăng đã ở chế độ công khai để Ban tổ chức xem được.</p>
        <button type="submit" disabled={busy} className="bg-vrb-red text-white font-bold rounded-xl px-5 py-3 disabled:opacity-50">{busy ? 'Đang gửi…' : 'Gửi bài dự thi'}</button>
      </fieldset></form>}
    </>}
  </div>;
}
