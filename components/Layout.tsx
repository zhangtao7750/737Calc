
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Tools', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { path: '/history', label: 'Logs', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { path: '/settings', label: 'Sync', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    )}
  ];

  return (
    <div className="min-h-screen flex flex-row bg-[#F2F2F7] selection:bg-blue-100">
      
      {/* iPad Sidebar (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/70 backdrop-blur-3xl border-r border-black/5 p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-[#007AFF] shadow-lg shadow-blue-200 flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter">AeroCalc</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">EFB PRO · V2.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                (item.path === '/' ? (location.pathname === '/' || location.pathname === '/vref') : location.pathname.startsWith(item.path))
                ? 'bg-[#007AFF] text-white shadow-xl shadow-blue-100 scale-105'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-black/5">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-500">AC</div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-900">Captain Admin</p>
              <p className="text-[10px] text-gray-400 font-medium">B737 NG/MAX Fleet</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative">
        
        {/* Status Bar Spacer (iPhone style) */}
        <div className="h-10 flex lg:hidden items-center justify-between px-8 pt-2 sticky top-0 bg-[#F2F2F7]/80 backdrop-blur-md z-50">
          <span className="text-xs font-bold text-black">9:41</span>
          <div className="flex gap-1.5 items-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
              <div className="w-5 h-2.5 rounded-sm border border-black/20 relative">
                  <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-0.5 h-1 bg-black/20 rounded-full"></div>
                  <div className="absolute inset-[1px] bg-black rounded-sm"></div>
              </div>
          </div>
        </div>

        {/* Dynamic Header */}
        <header className="bg-white/80 backdrop-blur-2xl border-b border-black/5 px-6 lg:px-12 py-6 flex items-center justify-between sticky top-0 lg:top-0 z-40">
          <div className="flex items-center gap-4">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="text-[#007AFF] bg-blue-50 p-2 rounded-xl active:scale-90 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="font-black text-2xl lg:text-3xl text-gray-900 tracking-tighter">
              {title}
            </h1>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Database</p>
              <p className="text-xs font-bold text-green-500 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ONLINE
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 space-y-12 no-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* iPhone Bottom Tab Bar (Hidden on iPad) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 flex justify-center pointer-events-none">
          <nav className="bg-white/90 backdrop-blur-3xl border border-black/5 h-20 w-full max-w-md rounded-[2.5rem] flex justify-around items-center px-4 shadow-2xl pointer-events-auto">
            {navItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  (item.path === '/' ? (location.pathname === '/' || location.pathname === '/vref') : location.pathname.startsWith(item.path))
                  ? 'text-[#007AFF] scale-110' : 'text-gray-400'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Home Indicator (iPhone only) */}
        <div className="lg:hidden h-1.5 bg-black/10 w-36 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-50"></div>
      </div>
    </div>
  );
};

export default Layout;
