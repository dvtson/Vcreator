import { Component, ErrorInfo, ReactNode } from 'react';
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error,info:ErrorInfo){console.error('Lỗi hiển thị ứng dụng',error,info);}
 render(){
  if(this.state.failed)return <div role="alert" className="min-h-screen flex flex-col items-center justify-center p-8 gap-4 text-center"><h1 className="text-xl font-bold">Không thể hiển thị trang lúc này</h1><p>Dữ liệu đã lưu vẫn được giữ. Vui lòng tải lại trang để thử lại.</p><button className="bg-vrb-blue text-white rounded-xl px-5 py-3" onClick={()=>window.location.reload()}>Tải lại trang</button><a href="/" className="text-vrb-blue underline">Về trang chủ</a></div>;
  return this.props.children;
 }
}
