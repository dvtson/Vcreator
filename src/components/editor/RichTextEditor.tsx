import { sanitizeHTML } from '../../services/sanitizeHTML';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  Eye,
  Edit3,
  Trash2,
  Undo,
  Redo,
  RemoveFormatting
} from 'lucide-react';
import { SafeHTML } from '../common/SafeHTML';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Nhập nội dung văn bản định dạng...',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromPropRef = useRef(false);

  // Sync prop value into contentEditable when in visual mode
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        isUpdatingFromPropRef.current = true;
        editorRef.current.innerHTML = sanitizeHTML(value || '');
        isUpdatingFromPropRef.current = false;
      }
    }
  }, [value, activeTab]);

  const handleInput = () => {
    if (editorRef.current && !isUpdatingFromPropRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    if (activeTab !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, command === 'insertHTML' ? sanitizeHTML(val || '') : val);
    handleInput();
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    if (!/^(https?:\/\/)?[^\s<>"']+$/i.test(linkUrl.trim())) return;
    const safeText = document.createElement('span'); safeText.textContent = linkText;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    if (linkText) {
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${safeText.innerHTML}</a>`;
      exec('insertHTML', html);
    } else {
      exec('createLink', url);
    }
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleInsertTable = () => {
    let html = '<table border="1" style="width:100%; border-collapse: collapse; margin: 12px 0;"><thead><tr>';
    for (let c = 0; c < tableCols; c++) {
      html += `<th style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;">Tiêu đề ${c + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < tableRows; r++) {
      html += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        html += '<td style="border: 1px solid #cbd5e1; padding: 8px;">Dữ liệu</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    exec('insertHTML', html);
    setShowTableModal(false);
  };

  const handleInsertImage = () => {
    if (!/^https?:\/\/[^\s<>"']+$/i.test(imageUrl)) return;
    const html = `<img src="${imageUrl}" alt="Hình ảnh minh họa" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" /><p><br></p>`;
    exec('insertHTML', html);
    setShowImageModal(false);
    setImageUrl('');
  };

  return (
    <div className={`border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-2 gap-2">
        {label && <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">{label}</span>}

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'visual' ? 'bg-white text-vrb-blue shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Soạn trực quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-white text-vrb-blue shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Xem trước
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-white text-vrb-blue shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Mã HTML
          </button>
        </div>
      </div>

      {/* Toolbar (Only for Visual Tab) */}
      {activeTab === 'visual' && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-1.5 text-slate-700">
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h1>')}
            title="Tiêu đề 1"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h2>')}
            title="Tiêu đề 2"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<h3>')}
            title="Tiêu đề 3"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<p>')}
            title="Đoạn văn bình thường"
            className="px-2 py-1 text-xs font-semibold hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            Văn bản
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            type="button"
            onClick={() => exec('bold')}
            title="In đậm (Ctrl+B)"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('italic')}
            title="In nghiêng (Ctrl+I)"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('underline')}
            title="Gạch chân (Ctrl+U)"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Underline className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Danh sách gạch đầu dòng"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="Danh sách đánh số"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', '<blockquote>')}
            title="Trích dẫn"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            title="Chèn liên kết"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            title="Chèn bảng biểu"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="Chèn hình ảnh"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            type="button"
            onClick={() => exec('removeFormat')}
            title="Xóa định dạng"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => exec('undo')}
            title="Hoàn tác"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 ml-auto"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            title="Làm lại"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 p-4 min-h-[280px] max-h-[500px] overflow-y-auto">
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="rich-text-content outline-none min-h-[240px] focus:ring-0"
            data-placeholder={placeholder}
          />
        )}

        {activeTab === 'code' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full min-h-[240px] font-mono text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 outline-none focus:border-vrb-blue resize-none"
            placeholder="Dán mã HTML vào đây..."
          />
        )}

        {activeTab === 'preview' && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <SafeHTML html={value || '<p class="text-slate-400 italic">Chưa có nội dung để xem trước...</p>'} />
          </div>
        )}
      </div>

      {/* Modal Chèn Link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-vrb-blue" /> Chèn liên kết
            </h4>
            <input
              type="text"
              placeholder="Chữ hiển thị (tùy chọn)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-vrb-blue"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-vrb-blue"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-3 py-1.5 text-xs bg-vrb-blue text-white font-medium rounded-lg hover:bg-vrb-blue-dark"
              >
                Chèn link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chèn Bảng */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-5 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-vrb-blue" /> Chèn bảng biểu
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Số dòng dữ liệu</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-vrb-blue"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Số cột</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-vrb-blue"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-3 py-1.5 text-xs bg-vrb-blue text-white font-medium rounded-lg hover:bg-vrb-blue-dark"
              >
                Tạo bảng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chèn Ảnh */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-vrb-blue" /> Chèn hình ảnh vào bài
            </h4>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-vrb-blue"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-3 py-1.5 text-xs bg-vrb-blue text-white font-medium rounded-lg hover:bg-vrb-blue-dark"
              >
                Chèn ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
