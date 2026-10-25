import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { saveProgramInfo } from '../../services/storageService';
import { siteTextCatalog } from '../../services/siteTextCatalog';
const pageLabels:Record<string,string> = { Badge:'Nhãn trạng thái', AboutPage:'Giới thiệu',AwardsPage:'Giải thưởng',ChallengeDetailPage:'Chi tiết thử thách',ChallengesPage:'Danh sách thử thách',CollectiveLeaderboardPage:'Xếp hạng tập thể',CommunityPage:'Cộng đồng',ContentDetailPage:'Chi tiết bài viết',FeaturedContentPage:'Nội dung nổi bật',GuidePage:'Hướng dẫn',HomePage:'Trang chủ',NotFoundPage:'Trang không tồn tại',PersonalLeaderboardPage:'Xếp hạng cá nhân',RulesPage:'Thể lệ',TermsPage:'Điều khoản',Header:'Đầu trang và menu',Footer:'Chân trang',ChallengeCard:'Thẻ thử thách',FeaturedVideoCard:'Thẻ video',IndividualCard:'Thẻ vinh danh' };
export function AdminSiteTextPage() {
  const { programInfo } = useData();
  const [values, setValues] = useState<Record<string,string>>({ ...programInfo.siteText });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pages = [...new Set(siteTextCatalog.map(item => item.page))];
  const save = async () => {
    setBusy(true); setMessage('');
    try { await saveProgramInfo({ ...programInfo, siteText: values }); setMessage('Đã lưu. Mở website để xem nội dung mới.'); }
    catch(error) { setMessage(error instanceof Error ? error.message : 'Không thể lưu nội dung'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5 max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold">Nội dung giao diện</h1>
    <p className="text-sm text-slate-600">Chỉnh tiêu đề, mô tả, nhãn và hướng dẫn trên các trang. Thử thách, bài viết, giải thưởng và thể lệ được sửa ở các mục quản lý tương ứng. Để trống ô vẫn được lưu; bấm Khôi phục để dùng câu mặc định.</p>
    <div className="site-text-tools grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:sticky sm:top-0 bg-slate-100/95 backdrop-blur-sm py-3 z-10">
      <input aria-label="Tìm nội dung" placeholder="Tìm nội dung…" value={search} onChange={e=>setSearch(e.target.value)} className="border rounded-lg p-2.5 w-full min-w-0" />
      <select aria-label="Chọn trang" value={page} onChange={e=>setPage(e.target.value)} className="border rounded-lg p-2.5 w-full min-w-0 sm:max-w-[16rem]"><option value="">Tất cả trang</option>{pages.map(p=><option key={p} value={p}>{pageLabels[p]??p}</option>)}</select>
      <button disabled={busy} onClick={save} className="bg-vrb-blue text-white rounded-lg px-4 py-2.5 min-h-11 disabled:opacity-50">{busy?'Đang lưu…':'Lưu thay đổi'}</button>
    </div>
    {message && <p role="status" className="bg-white rounded-xl p-4">{message}</p>}
    {siteTextCatalog.filter(item=>(!page || item.page===page) && `${item.text} ${values[item.id]??''}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).map(item=><div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 space-y-3 border border-slate-200">
      <label htmlFor={item.id} className="text-xs text-slate-500">{pageLabels[item.page]??item.page}</label>
      <textarea id={item.id} rows={2} value={values[item.id]??item.text} onChange={e=>setValues({...values,[item.id]:e.target.value})} className="w-full border rounded-lg p-3 text-sm leading-relaxed min-h-24 resize-y" />
      <button className="text-xs text-vrb-blue" onClick={()=>{const next={...values};delete next[item.id];setValues(next);}}>Khôi phục câu mặc định</button>
    </div>)}
  </div>;
}
