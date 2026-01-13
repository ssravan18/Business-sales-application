import React, { useState, useEffect } from 'react';
import { Search, User, Download, Calendar, PlusCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const VendorLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => { API.get('/vendors').then(res => setCustomers(res.data)); }, []);

  const loadCustomerData = async (id) => {
    try {
      const balRes = await API.get(`/vendor-balance/${id}`);
      setBalanceData(balRes.data);
      const histRes = await API.get(`/vendor-history/${id}`);
      setHistory(histRes.data);
    } catch(err) { console.error(err); }
  };

  const handleSelect = (v) => {
    setSelectedCustomer(v);
    loadCustomerData(v.id);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payments', {
        party_type: 'VENDOR',
        party_id: selectedCustomer.id,
        amount: parseFloat(payAmount),
        transaction_type: 'DEBIT', // Vendor giving money (Credit to us)
        method: 'CASH',
        date: payDate
      });
      setIsPayModalOpen(false);
      setPayAmount('');
      setToastMsg('Payment Recorded!');
      setTimeout(() => setToastMsg(''), 3000);
      loadCustomerData(selectedCustomer.id); // Refresh Balance
    } catch (err) { alert("Failed"); }
  };

  const generatePDF = () => {
    /* (Use the same PDF code from previous version) */
    const doc = new jsPDF();
    doc.text(`Bill To: ${selectedCustomer.name}`, 14, 20);
    // ... (Keep your PDF logic here)
    doc.save(`Bill_${selectedCustomer.name}.pdf`);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 fade-in-up">
      <Toast message={toastMsg} />

      {/* PAYMENT MODAL */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Record Payment Received">
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm">
            Recording money received from <strong>{selectedCustomer?.name}</strong>. This will reduce their pending balance.
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Date</label>
            <input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} className="w-full border p-3 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Amount (₹)</label>
            <input type="number" value={payAmount} onChange={e=>setPayAmount(e.target.value)} className="w-full border p-3 rounded-lg font-bold text-lg" placeholder="0.00" required/>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700">Save Payment</button>
        </form>
      </Modal>

      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50"><input type="text" placeholder="Search customers..." className="w-full p-2 border rounded-lg" onChange={e => setSearchTerm(e.target.value)}/></div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} onClick={() => handleSelect(c)} className={`p-4 border-b cursor-pointer hover:bg-slate-50 ${selectedCustomer?.id === c.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}>
              <h4 className="font-semibold text-slate-800">{c.name}</h4>
              <p className="text-xs text-slate-400">{c.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: LEDGER */}
      <div className="flex-1">
        {selectedCustomer && balanceData ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-6 border-b flex justify-between items-start bg-slate-50/50">
              <div><h2 className="text-3xl font-bold">{selectedCustomer.name}</h2><p className="text-sm text-slate-500">ID: #{selectedCustomer.id}</p></div>
              <div className="flex gap-2">
                 <button onClick={() => setIsPayModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-emerald-700"><PlusCircle size={18}/> Record Payment</button>
                 <button onClick={generatePDF} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-slate-800"><Download size={18}/> PDF</button>
              </div>
            </div>
            {/* STATS */}
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border"><p className="text-xs font-bold uppercase text-slate-500">Total Purchased</p><p className="text-xl font-bold">₹ {balanceData.total_purchased}</p></div>
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100"><p className="text-xs font-bold uppercase text-emerald-600">Total Paid Back</p><p className="text-xl font-bold text-emerald-700">₹ {balanceData.total_paid}</p></div>
              <div className="p-5 rounded-xl bg-red-50 border border-red-100"><p className="text-xs font-bold uppercase text-red-600">Pending Balance</p><p className="text-2xl font-extrabold text-red-700">₹ {balanceData.current_outstanding_balance}</p></div>
            </div>
            {/* TABLE */}
            <div className="flex-1 overflow-auto px-6 pb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium"><tr><th className="p-3">Date</th><th className="p-3">Item</th><th className="p-3">Qty</th><th className="p-3">Rate</th><th className="p-3 text-right">Total</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((row, i) => (
                      <tr key={i}><td className="p-3 text-slate-500">{new Date(row.date).toLocaleDateString()}</td><td className="p-3 font-medium">{row.flower_name}</td><td className="p-3">{row.quantity} {row.unit}</td><td className="p-3">₹{row.rate_per_unit}</td><td className="p-3 text-right font-bold">₹{row.total_amount}</td></tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        ) : <div className="h-full flex items-center justify-center text-slate-400">Select a customer</div>}
      </div>
    </div>
  );
};
export default VendorLedger;