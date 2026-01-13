import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Flower } from 'lucide-react'; // If you didn't install lucide, remove imports and use text

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Daily Entry', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Ledger & Bills', path: '/ledger', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <Flower className="text-pink-500 mr-2" />
          <h1 className="font-bold text-lg tracking-wide">SRI LAKSHMI</h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">v1.0.0 Support Build</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Flower Mart Manager</h2>
          <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
            A
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;