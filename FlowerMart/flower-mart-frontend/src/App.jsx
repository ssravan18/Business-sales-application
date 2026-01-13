import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Flower, Menu, TableProperties, Users} from 'lucide-react';
import DailyEntry from './Pages/DailyEntry';
import Ledger from './Pages/Ledger';
import BalanceSheet from './Pages/BalanceSheet';
import VendorLedger from './Pages/VendorLedger';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group
        ${isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
        }`}
    >
      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </Link>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        
        {/* Sidebar (No Changes) */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
           {/* ... Sidebar content ... */}
           {/* (Copy your existing Sidebar code here) */}
             <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  <Flower className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 text-lg leading-none">Sri Lakshmi</h1>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flower Mart</span>
                </div>
              </div>

              <nav className="flex-1 py-6 space-y-1">
                <SidebarItem to="/" icon={LayoutDashboard} label="Daily Entry" />
                <SidebarItem to="/ledger" icon={BookOpen} label="Customer Ledger" />
                <SidebarItem to="/vendors" icon={Users} label="Vendor Ledger" />
                <SidebarItem to="/balance-sheet" icon={TableProperties} label="Balance Sheet" />
              </nav>

              <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-slate-500">Sravan Build v1.2</p>
                </div>
              </div>
        </aside>

        {/* MAIN CONTENT - FIXED LAYOUT */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
            <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
            <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              A
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          {/* CHANGED: Removed 'max-w-5xl mx-auto'. Added 'w-full h-full'. */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
            <div className="w-full h-full flex flex-col"> 
              <Routes>
                <Route path="/" element={<DailyEntry />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/vendors" element={<VendorLedger />} />
                <Route path="/balance-sheet" element={<BalanceSheet />} />
              </Routes>
            </div>
          </div>
          <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-center text-sm text-slate-500 flex-shrink-0">
            &copy; 2024 Sri Lakshmi Flower Mart. All rights reserved.  
            &nbsp; Developed by - <b> Sravan</b>.
          </footer>
        </main>
        
      </div>
    </Router>
  );
};

export default App;