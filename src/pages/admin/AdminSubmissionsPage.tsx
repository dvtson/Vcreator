import { useEffect, useRef, useState } from 'react';
import { cloudEnabled } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { changeSubmission, exportAllSubmissions, listSubmissions, setSubmissionsOpen, submissionsOpen } from '../../services/submissionService';
import type { SubmissionCursor } from '../../services/submissionService';
import type { Submission } from '../../services/submissionModel';
import { AdminEditorNavigation, useAdminEditorState } from '../../components/common/AdminEditorNavigation';
import { submissionDate } from '../../services/submissionModel';
import { downloadFile, toCSV } from '../../services/transferService';

export function AdminSubmissionsPage() {
  const { user } = useAuth();
  const [editing, setEditing, returnTo] = useAdminEditorState<Submission>();
  const [deleting, setDeleting] = useState<Submission | null>(null);
  const [rows, setRows] = useState<Submission[]>([]); const cursor = useRef<SubmissionCursor | undefined>(undefined);
  const [more, setMore] = useState(false); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [open, setOpen] = useState<boolean | null>(null); const [message, setMessage] = useState(''); const [search, setSearch] = useState('');
  const load = async (append = false) => {
    if (lock.current || !cloudEnabled) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const [page, enabled] = await Promise.all([listSubmissions(append ? cursor.current : undefined), submissionsOpen()]);
      setRows(previous => append ? [...new Map([...previous, ...page.rows].map(row => [row.id, row])).values()] : page.rows);
      cursor.current = page.cursor; setMore(page.hasMore); setOpen(enabled);
    } catch { setMessage('Không tải được danh sách. Kiểm tra kết nối và quyền Firestore rồi thử lại.'); }
    finally { lock.current = false; setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const exportRows = async (format: 'xlsx' | 'csv' | 'json') => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try {
      const all = await exportAllSubmissions();
      const values = all.map(row => ({ 'Mã tiếp nhận': row.id, 'Họ và tên': row.fullName, 'Số điện thoại': row.phone, 'Đơn vị': row.branch, 'Đường dẫn': row.originalUrl, 'Ngày giờ gửi (Việt Nam)': submissionDate(row.submittedAt), 'Thời gian UTC': row.submittedAt }));
      if (format === 'xlsx') {
        const { downloadExcel } = await import('../../services/excelExport');
        const headers = ['Mã tiếp nhận', 'Họ và tên', 'Số điện thoại', 'Đơn vị', 'Đường dẫn', 'Ngày giờ gửi (Việt Nam)', 'Thời gian UTC'];
        downloadExcel(headers, values.map(value => Object.values(value)), `vrb-bai-du-thi-${new Date().toISOString().slice(0,10)}.xlsx`);
      } else {
      const csv = format === 'csv';
      downloadFile(`vrb-bai-du-thi-${new Date().toISOString().slice(0,10)}.${csv ? 'csv' : 'json'}`, csv ? toCSV(values) : JSON.stringify(all, null, 2), csv ? 'text/csv;charset=utf-8' : 'application/json');
      }
      setMessage(`Đã xuất toàn bộ ${all.length} bài gửi, bao gồm các trang chưa tải và không phụ thuộc ô tìm kiếm.`);
    } catch { setMessage('Không thể xuất toàn bộ dữ liệu. Chưa tạo file thiếu; hãy kiểm tra mạng và thử lại.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const filtered = rows.filter(row => `${row.fullName} ${row.phone} ${row.branch} ${row.originalUrl} ${row.id}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
  return <div className="max-w-6xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">Bài dự thi đã gửi</h1>
    <p className="text-slate-600">Danh sách riêng của Ban tổ chức. Thời gian hiển thị theo giờ Việt Nam và do máy chủ ghi nhận. Các bài gửi không tự công bố ở Nội dung nổi bật.</p>
    <p className="text-sm text-slate-500">Bài dự thi được lưu riêng với nội dung website. Dùng Xuất Excel hoặc CSV/JSON ở đây để sao lưu danh sách người gửi.</p>
    <AdminEditorNavigation editing={!!editing} isNew={false} busy={busy} onClose={() => { setEditing(null); setMessage(''); }} returnTo={returnTo} />
    {editing ? <form className="bg-white border rounded-2xl p-6" onSubmit={async event => {
      event.preventDefault(); if (lock.current) return;
      lock.current = true; setBusy(true); setMessage('');
      try { const saved = await changeSubmission(editing); if (saved) setRows(previous => previous.map(row => row.id === saved.id ? saved : row)); setEditing(null); setMessage('Đã lưu thay đổi.'); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Không lưu được. Hãy thử lại.'); }
      finally { lock.current = false; setBusy(false); }
    }}><fieldset disabled={busy} className="space-y-4">
      <h2 className="text-xl font-bold">Chỉnh sửa bài gửi</h2>
      <p>Ngày gửi ban đầu: {submissionDate(editing.submittedAt)}</p>
      {([{ key: 'fullName', label: 'Họ và tên', type: 'text', max: 120 }, { key: 'phone', label: 'Số điện thoại', type: 'tel', max: 24 }, { key: 'branch', label: 'Đơn vị', type: 'text', max: 160 }, { key: 'originalUrl', label: 'Đường dẫn', type: 'url', max: 2000 }] as const).map(field => <label key={field.key} className="block">{field.label} *<input required type={field.type} maxLength={field.max} value={editing[field.key]} onChange={e => setEditing({ ...editing, [field.key]: e.target.value })} className="block w-full border rounded-xl p-3 mt-2" /></label>)}
      {message && <p role="alert">{message}</p>}
      <button type="submit" className="bg-vrb-blue text-white px-5 py-3 rounded-xl">{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
    </fieldset></form> : !cloudEnabled ? <p role="status" className="bg-amber-50 border border-amber-200 rounded-xl p-5">Chức năng đã sẵn sàng trong mã nguồn. Cần hoàn tất chuyển dữ liệu sang Cloud và cập nhật quyền Firestore trước khi mở nhận bài.</p> : <>
      <div className="bg-white border rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <strong>{open === null ? 'Chưa xác định trạng thái' : open ? 'Đang nhận bài' : 'Đang đóng nhận bài'}</strong>
        {user?.role !== 'reviewer' && <button disabled={busy || open === null} className="border rounded-lg px-3 py-2 disabled:opacity-50" onClick={async () => {
          if (open === null || lock.current || !window.confirm(open ? 'Tạm dừng nhận bài mới? Bài đã gửi vẫn được giữ.' : 'Mở form nhận bài từ người tham gia?')) return;
          lock.current = true; setBusy(true); setMessage('');
          try { await setSubmissionsOpen(!open); setOpen(!open); }
          catch { setMessage('Không đổi được trạng thái nhận bài. Kiểm tra quyền và thử lại.'); }
          finally { lock.current = false; setBusy(false); }
        }}>{open ? 'Tạm dừng nhận bài' : 'Mở nhận bài'}</button>}
        <a href="/gui-bai" target="_blank" rel="noopener noreferrer" className="text-vrb-blue underline">Xem form nộp bài ↗</a>
        <button disabled={busy} onClick={() => void load()} className="border rounded-lg px-3 py-2">Tải lại danh sách</button>
        <button disabled={busy} onClick={() => void exportRows('xlsx')} className="bg-vrb-blue text-white rounded-lg px-3 py-2">Xuất Excel (.xlsx)</button>
        <button disabled={busy} onClick={() => void exportRows('csv')} className="border rounded-lg px-3 py-2">Xuất toàn bộ CSV (Excel)</button>
        <button disabled={busy} onClick={() => void exportRows('json')} className="border rounded-lg px-3 py-2">Xuất toàn bộ JSON</button>
      </div>
      <label className="block">Tìm trong {rows.length} bài đã tải<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Họ tên, số điện thoại, đơn vị, link hoặc mã tiếp nhận" className="block w-full border rounded-xl p-3 mt-2" /></label>
      {message && <p role="status" className="bg-blue-50 rounded-xl p-4">{message}</p>}
      {busy && <p role="status">Đang xử lý…</p>}
      <div className="bg-white border rounded-2xl overflow-x-auto"><table className="w-full min-w-[760px] text-sm text-left"><thead className="bg-slate-100"><tr>{['Họ và tên', 'Số điện thoại', 'Đơn vị', 'Đường dẫn bài dự thi', 'Ngày giờ gửi', 'Thao tác'].map(text => <th key={text} className="p-4">{text}</th>)}</tr></thead><tbody>
        {filtered.map(row => <tr key={row.id} className="border-t"><td className="p-4 font-semibold">{row.fullName}<span className="block text-xs font-normal text-slate-500 break-all mt-1">{row.id}</span></td><td className="p-4 whitespace-nowrap">{row.phone || 'Chưa có'}</td><td className="p-4">{row.branch}</td><td className="p-4 max-w-xs"><a className="text-vrb-blue underline break-all" href={row.originalUrl} target="_blank" rel="noopener noreferrer">{row.originalUrl}</a></td><td className="p-4 whitespace-nowrap">{submissionDate(row.submittedAt)}</td><td className="p-4">{user?.role !== 'reviewer' && <div className="flex gap-3"><button disabled={busy} className="text-vrb-blue underline" onClick={() => { setMessage(''); setEditing({ ...row }); }}>Chỉnh sửa</button><button disabled={busy} className="text-red-600 underline" onClick={() => setDeleting(row)}>Xóa</button></div>}</td></tr>)}
        {!busy && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">{search ? 'Không có kết quả trong các bài đã tải.' : 'Chưa có bài gửi.'}</td></tr>}
      </tbody></table></div>
      {more && <button disabled={busy} onClick={() => void load(true)} className="bg-vrb-blue text-white rounded-xl px-5 py-3">Tải thêm bài gửi</button>}
    </>}
    {deleting && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-labelledby="delete-submission" className="bg-white rounded-2xl p-6 max-w-lg space-y-4"><h2 id="delete-submission" className="text-xl font-bold">Xóa bài gửi?</h2><p>{deleting.fullName} — {deleting.phone || 'Chưa có SĐT'} — {deleting.branch}</p><p className="break-all text-sm">{deleting.originalUrl}</p><p>Thao tác này không thể hoàn tác.</p><div className="flex gap-3"><button disabled={busy} className="border px-4 py-2 rounded-lg" onClick={() => setDeleting(null)}>Hủy</button><button disabled={busy} className="bg-red-600 text-white px-4 py-2 rounded-lg" onClick={async () => {
      if (lock.current) return; lock.current = true; setBusy(true); setMessage('');
      try { await changeSubmission(deleting, true); setRows(previous => previous.filter(row => row.id !== deleting.id)); setDeleting(null); setMessage('Đã xóa bài gửi.'); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Không xóa được.'); setDeleting(null); }
      finally { lock.current = false; setBusy(false); }
    }}>{busy ? 'Đang xóa…' : 'Xác nhận xóa'}</button></div></section></div>}
  </div>;
}
