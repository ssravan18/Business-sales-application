import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop with blur
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      
      {/* Modal Box - Made wider (max-w-lg) and added better shadow */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 fade-in-up border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Content Area - Added more padding */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;