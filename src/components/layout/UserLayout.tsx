import { useData } from '../../context/DataContext';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const UserLayout: React.FC = () => {
  const {publicReady,loading,loadError,refreshData} = useData();
  return (
    <div className="public-shell min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-1 min-w-0">
        {loadError && <div role="alert" className="p-4 text-center space-y-2"><p>{loadError}</p><button onClick={()=>refreshData()} className="text-vrb-blue underline">Thử lại</button></div>}
        {publicReady || !loading ? <Outlet /> : <div role="status" className="p-12 text-center">Đang tải nội dung…</div>}
      </main>
      <Footer />
    </div>
  );
};
