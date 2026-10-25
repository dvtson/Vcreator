import React, { useState } from 'react';
import { ExternalLink, Check, AlertCircle } from 'lucide-react';

interface HyperlinkControlProps {
  label?: string;
  url: string;
  buttonText?: string;
  onUrlChange: (url: string) => void;
  onButtonTextChange?: (text: string) => void;
  placeholderUrl?: string;
  className?: string;
}

export const HyperlinkControl: React.FC<HyperlinkControlProps> = ({
  label = 'Đường dẫn liên kết (URL)',
  url,
  buttonText,
  onUrlChange,
  onButtonTextChange,
  placeholderUrl = 'https://...',
  className = '',
}) => {
  const [touched, setTouched] = useState(false);

  const isValidUrl = (testUrl: string) => {
    if (!testUrl) return true; // empty is handled by required prop if needed
    try {
      const parsed = new URL(testUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const valid = isValidUrl(url);

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        {url && (
          <a
            href={valid ? url : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!valid) {
                e.preventDefault();
                alert('Vui lòng nhập đường dẫn hợp lệ trước khi mở thử.');
              }
            }}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
              valid
                ? 'text-vrb-blue hover:text-vrb-blue-dark hover:bg-blue-50'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Mở thử liên kết
          </a>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setTouched(true);
              onUrlChange(e.target.value);
            }}
            onBlur={() => setTouched(true)}
            placeholder={placeholderUrl}
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none transition-all ${
              touched && !valid && url
                ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-200'
                : 'border-slate-300 focus:border-vrb-blue focus:ring-2 focus:ring-blue-100'
            }`}
          />
          {touched && valid && url && (
            <span className="absolute right-3 top-2.5 text-emerald-600">
              <Check className="w-4 h-4" />
            </span>
          )}
        </div>

        {onButtonTextChange !== undefined && (
          <input
            type="text"
            value={buttonText || ''}
            onChange={(e) => onButtonTextChange(e.target.value)}
            placeholder="Nhãn nút (Ví dụ: Xem video)"
            className="sm:w-44 text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-vrb-blue focus:ring-2 focus:ring-blue-100"
          />
        )}
      </div>

      {touched && !valid && url && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Liên kết không hợp lệ. Chỉ chấp nhận các đường dẫn bắt đầu bằng http:// hoặc https://</span>
        </div>
      )}
    </div>
  );
};
