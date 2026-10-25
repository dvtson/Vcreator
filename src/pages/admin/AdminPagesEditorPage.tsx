import { PDFAttachment } from '../../components/common/PDFAttachment';
import React, { useState, useEffect } from 'react';
import { Save, Eye, FileText, CheckCircle2, ShieldCheck, HelpCircle, BookOpen, Download } from 'lucide-react';
import { getPageDocument, savePageDocument } from '../../services/storageService';
import { PageDocument } from '../../types';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

type PageTabKey = 'the-le' | 'dieu-khoan' | 'huong-dan' | 'chuong-trinh';

export const AdminPagesEditorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageTabKey>('the-le');
  const [doc, setDoc] = useState<PageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Draft editing state
  const [editorContent, setEditorContent] = useState('');
  const [title, setTitle] = useState('');
  const [versionName, setVersionName] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const loadPage = async (key: PageTabKey) => {
    setLoading(true);
    try {
      const page = await getPageDocument(key);
      if (page) {
        setDoc(page);
        setTitle(page.draftMetadata?.title ?? page.title);
        setVersionName(page.draftMetadata?.versionName ?? page.versionName);
        setUpdatedDate(page.draftMetadata?.updatedDate ?? page.updatedDate);
        setPdfName(page.draftMetadata?.pdfAttachmentName ?? page.pdfAttachmentName ?? '');
        setPdfUrl(page.draftMetadata?.pdfAttachmentUrl ?? page.pdfAttachmentUrl ?? '');
        // If there is a draft content saved, load it into editor; otherwise load active content
        setEditorContent(page.draftContentHtml !== undefined ? page.draftContentHtml : page.contentHtml);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Lỗi khi tải nội dung trang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(activeTab);
  }, [activeTab]);

  // Action: Lưu nháp (chỉ lưu vào draftContentHtml, người xem chưa thấy)
  const handleSaveDraft = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const updated: PageDocument = {
        ...doc,
        draftMetadata: { title, versionName, updatedDate, pdfAttachmentName: pdfName, pdfAttachmentUrl: pdfUrl },
        draftContentHtml: editorContent,
      };
      await savePageDocument(updated);
      setDoc(updated);
      addToast('info', 'Đã lưu bản nháp! Người xem vẫn thấy bản công bố trước đó cho đến khi bạn bấm Công bố.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi xảy ra khi lưu bản nháp.');
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Công bố (đưa draftContentHtml thành contentHtml chính thức)
  const handlePublish = async () => {
    if (!doc) return;
    setIsSaving(true);
    try {
      const updated: PageDocument = {
        ...doc,
        title,
        versionName,
        updatedDate: new Date().toLocaleDateString('vi-VN'),
        pdfAttachmentName: pdfName,
        pdfAttachmentUrl: pdfUrl,
        draftMetadata: undefined,
        contentHtml: editorContent,
        draftContentHtml: undefined, // Cleared after publish
        isPublished: true,
      };
      await savePageDocument(updated);
      setDoc(updated);
      setUpdatedDate(updated.updatedDate);
      addToast('success', 'Đã công bố nội dung mới ra website người xem thành công!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi khi công bố nội dung.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { key: 'the-le', label: 'Thể lệ chương trình', icon: FileText, previewUrl: '/the-le' },
    { key: 'dieu-khoan', label: 'Điều khoản & Điều kiện', icon: ShieldCheck, previewUrl: '/dieu-khoan' },
    { key: 'huong-dan', label: 'Hướng dẫn tham gia', icon: HelpCircle, previewUrl: '/huong-dan' },
    { key: 'chuong-trinh', label: 'Giới thiệu chương trình', icon: BookOpen, previewUrl: '/chuong-trinh' },
  ];

  const currentTabObj = tabs.find((t) => t.key === activeTab)!;
  const hasDraftPending = doc?.draftContentHtml !== undefined && doc?.draftContentHtml !== doc?.contentHtml;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Biên Tập Thể Lệ & Quy Định
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chỉnh sửa văn bản thể lệ, điều khoản bảo mật và cẩm nang hướng dẫn với quy trình lưu nháp an toàn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={currentTabObj.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Xem trang công bố</span>
          </a>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
          >
            Lưu bản nháp
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublish}
            className="px-5 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Công bố bản mới'}</span>
          </button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as PageTabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-vrb-blue text-vrb-blue bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification if there is a pending draft */}
      {hasDraftPending && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <span>
            ⚠️ Bạn đang có một <strong>bản nháp chưa công bố</strong>. Người xem vẫn đang đọc phiên bản công bố trước đó cho tới khi bạn nhấn nút "Công bố bản mới".
          </span>
          <button
            type="button"
            onClick={handlePublish}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors flex-shrink-0"
          >
            Công bố ngay
          </button>
        </div>
      )}

      {/* Editor Body */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-vrb-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Đang tải trang...</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề trang</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phiên bản ban hành</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="v1.0"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày cập nhật hiển thị</label>
              <input
                type="text"
                value={updatedDate}
                onChange={(e) => setUpdatedDate(e.target.value)}
                placeholder="15/10/2026"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên file PDF đính kèm (nếu có)</label>
              <input
                type="text"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                placeholder="Quy_che_VRB_Creator.pdf"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-vrb-blue font-mono text-xs"
              />
            </div>
          </div>

          <PDFAttachment name={pdfName} url={pdfUrl} onChange={(name,url)=>{setPdfName(name);setPdfUrl(url);}} />

          {/* WYSIWYG Editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Nội dung văn bản định dạng (Tiêu đề, Đề mục, In đậm, Danh sách, Bảng biểu)
            </label>
            <RichTextEditor
              value={editorContent}
              onChange={(html) => setEditorContent(html)}
              placeholder="Nhập nội dung quy định chi tiết tại đây..."
            />
          </div>

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200"
            >
              Lưu bản nháp
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handlePublish}
              className="px-6 py-2.5 rounded-xl bg-vrb-red hover:bg-vrb-red-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang công bố...' : 'Công bố lên website'}</span>
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
