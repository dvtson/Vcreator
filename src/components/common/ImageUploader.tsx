import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  value: string;
  altText?: string;
  onChange: (dataUrl: string, altText?: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Ảnh đại diện / Banner',
  value,
  altText = '',
  onChange,
  maxSizeMB = 2,
  className = '',
}) => {
  const [alt, setAlt] = useState(altText);
  const [error, setError] = useState<string | null>(null);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackPlaceholder = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#e2e8f0"/><text x="320" y="180" text-anchor="middle" fill="#475569" font-size="22">Không tải được ảnh</text></svg>');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Định dạng tệp không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
      return;
    }

    // Validate size (default 2MB)
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Dung lượng tệp vượt quá ${maxSizeMB} MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Vui lòng chọn ảnh nhỏ hơn.`);
      return;
    }

    // Read as Base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange(base64, alt || file.name);
    };
    reader.onerror = () => {
      setError('Không thể đọc tệp ảnh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setError('Vui lòng nhập đường dẫn ảnh hợp lệ.');
      return;
    }
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('/')) {
      setError('Đường dẫn ảnh phải bắt đầu bằng http://, https:// hoặc /');
      return;
    }
    setError(null);
    onChange(urlInput.trim(), alt);
    setUrlInput('');
    setIsUrlMode(false);
  };

  const handleRemove = () => {
    onChange('', '');
    setAlt('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="text-xs text-vrb-blue hover:text-vrb-blue-dark flex items-center gap-1 font-medium"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            {isUrlMode ? 'Tải từ máy' : 'Nhập URL trực tiếp'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-vrb-blue focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 bg-vrb-blue text-white text-xs font-medium rounded-lg hover:bg-vrb-blue-dark transition-colors"
          >
            Áp dụng
          </button>
        </div>
      ) : null}

      {value ? (
        <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 group">
          <div className="relative h-44 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
            <img
              src={value}
              alt={alt || 'Ảnh xem trước'}
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              onError={(e) => {
                const element = e.currentTarget;
                if (element.src !== fallbackPlaceholder) element.src = fallbackPlaceholder;
              }}
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Thay ảnh
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Gỡ ảnh
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Mô tả ảnh:</span>
            <input
              type="text"
              value={alt}
              onChange={(e) => {
                setAlt(e.target.value);
                onChange(value, e.target.value);
              }}
              placeholder="Nhập mô tả hình ảnh (alt text)..."
              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md outline-none focus:border-vrb-blue bg-white"
            />
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-vrb-blue rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-vrb-blue flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Nhấn để tải ảnh lên từ thiết bị
          </p>
          <p className="text-xs text-slate-500">
            Hỗ trợ định dạng JPG, PNG, WebP (Tối đa {maxSizeMB} MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
