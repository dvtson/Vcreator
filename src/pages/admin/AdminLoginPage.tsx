import { useAuth } from '../../hooks/useAuth';
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { login } from '../../services/authService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requested = (location.state as { from?: string } | null)?.from;
  const from = requested?.startsWith('/admin') && requested !== '/admin/login' ? requested : '/admin';

  const authState = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if(isSubmitting || !authState.ready) return;
    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Thông tin đăng nhập không hợp lệ');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6">
          <img src="/assets/vrb-logo.png" alt="VRB" className="h-12 w-auto object-contain" />
        </Link>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quản trị VRB CREATOR
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600">
          Cổng quản lý thông tin chương trình và nội dung thi đua
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {(error || authState.error) && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error || authState.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-bold text-slate-700 mb-1.5">Email quản trị</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-username" type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email quản trị" autoComplete="username" autoCapitalize="none"
                  className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-vrb-blue focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700">Mật khẩu</label>

              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-password" type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu" autoComplete="current-password"
                  className="w-full text-sm pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-vrb-blue focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit" disabled={isSubmitting || !authState.ready}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-vrb-blue hover:bg-vrb-blue-dark shadow-md transition-all hover:scale-101 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{!authState.ready ? 'Đang kiểm tra phiên…' : isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập Quản trị'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trở về Website Người xem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
