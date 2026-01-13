import React from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in z-50">
      <CheckCircle size={24} />
      <span className="font-bold">{message}</span>
    </div>
  );
};
export default Toast;