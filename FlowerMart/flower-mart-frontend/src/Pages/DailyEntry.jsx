import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Check, DollarSign, Package, Users, ChevronDown, Plus } from 'lucide-react';
import API from '../api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DailyEntry = () => {
  const [mode, setMode] = useState('SALE');
  const [flowers, setFlowers] = useState([]);
  const [parties, setParties] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyLoc, setNewPartyLoc] = useState('');

  const [formData, setFormData] = useState({
    partyId: '', flowerId: '', quantity: '', unit: 'kgs', rate: ''
  });

  const units = ['kgs', 'bunch', 'box', 'packs', 'load'];

  useEffect(() => { loadData(); }, [mode]);

  const loadData = async () => {
    try {
      const flowerRes = await API.get('/flowers');
      setFlowers(flowerRes.data);
      const endpoint = mode === 'SALE' ? '/customers' : '/vendors';
      const partyRes = await API.get(endpoint);
      setParties(partyRes.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddParty = async (e) => {
    e.preventDefault();
    try {
      await API.post('/add-party', {
        type: mode === 'SALE' ? 'CUSTOMER' : 'VENDOR',
        name: newPartyName,
        location: newPartyLoc
      });
      setIsModalOpen(false);
      setNewPartyName('');
      setNewPartyLoc('');
      showToast(`${mode === 'SALE' ? 'Customer' : 'Vendor'} Added Successfully!`);
      loadData(); // Reload list
    } catch (err) { alert("Failed to add"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      [mode === 'SALE' ? 'customer_id' : 'vendor_id']: formData.partyId,
      flower_id: formData.flowerId,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      rate_per_unit: parseFloat(formData.rate)
    };
    try {
      await API.post(mode === 'SALE' ? '/sales' : '/purchases', payload);
      showToast("Transaction Saved Successfully!");
      setFormData({ ...formData, quantity: '', rate: '' });
    } catch (err) { alert("Error saving data"); }
  };

  const isSale = mode === 'SALE';

  return (
    <div className="fade-in-up h-full flex flex-col">
      <Toast message={toastMsg} />

      {/* ADD PARTY MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add New ${isSale ? 'Customer' : 'Vendor'}`}>
        <form onSubmit={handleAddParty} className="space-y-6">

          {/* Description Text */}
          <div className="p-4 bg-indigo-50 text-indigo-800 rounded-lg text-sm border border-indigo-100 flex items-start gap-3">
            <div className="mt-1">ℹ️</div>
            <p>
              You are adding a new <strong>{isSale ? 'Customer' : 'Vendor'}</strong> to your database.
              They will appear in the dropdown list immediately.
            </p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              value={newPartyName}
              onChange={e => setNewPartyName(e.target.value)}
              required
              placeholder={isSale ? "e.g. Raju Bhai" : "e.g. Rose Supplier Delhi"}
            />
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              Location / Shop Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              value={newPartyLoc}
              onChange={e => setNewPartyLoc(e.target.value)}
              placeholder="e.g. Uppal Market"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={20} strokeWidth={3} />
              Save & Add to List
            </button>
          </div>

        </form>
      </Modal>

      <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200 mb-6 w-full max-w-2xl mx-auto">
        <button onClick={() => setMode('PURCHASE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${!isSale ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
          <ArrowDownCircle size={18} /> INWARD (Buy)
        </button>
        <button onClick={() => setMode('SALE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${isSale ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>
          <ArrowUpCircle size={18} /> OUTWARD (Sell)
        </button>
      </div>

      {/* MAIN FORM CARD - CHANGED TO FULL SIZE */}
      {/* Removed 'max-w-3xl'. Added 'flex-1' to stretch vertically. */}
      <div className={`bg-white rounded-2xl shadow-xl border border-slate-100 w-full flex-1 flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex-shrink-0 ${isSale ? 'bg-emerald-50/50' : 'bg-blue-50/50'}`}>
           <h2 className="text-2xl font-bold text-slate-800">{isSale ? 'New Customer Sale' : 'New Vendor Purchase'}</h2>
           <p className="text-slate-500">Fill in the details below to record a new transaction</p>
        </div>

        {/* Form Body - Spaced out nicely */}
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-bold text-slate-500 uppercase flex gap-2 items-center"><Users size={16}/> {isSale ? 'Customer' : 'Vendor'}</label>
                 <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Add New</button>
               </div>
               <select name="partyId" value={formData.partyId} onChange={e => setFormData({...formData, partyId: e.target.value})} className="w-full h-14 px-4 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-lg" required>
                 <option value="">-- Select Person --</option>
                 {parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.location})</option>)}
               </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-500 uppercase mb-2 flex gap-2 items-center"><Package size={16}/> Flower Type</label>
              <select name="flowerId" value={formData.flowerId} onChange={e => setFormData({...formData, flowerId: e.target.value})} className="w-full h-14 px-4 border border-slate-300 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-lg" required>
                <option value="">-- Select Flower --</option>
                {flowers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div>
               <label className="text-sm font-bold text-slate-500 uppercase mb-2">Quantity</label>
               <div className="flex shadow-sm rounded-xl">
                  <input type="number" step="0.1" className="w-full h-14 px-4 border border-slate-300 rounded-l-xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required placeholder="0.0" />
                  <select className="h-14 border-y border-r border-slate-300 rounded-r-xl px-5 bg-slate-100 font-bold text-slate-600" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
               </div>
            </div>

            <div>
               <label className="text-sm font-bold text-slate-500 uppercase mb-2 flex gap-2 items-center"><DollarSign size={16}/> Rate per Unit</label>
               <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">₹</span>
                  <input type="number" step="0.1" className="w-full h-14 pl-10 pr-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-lg" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} required placeholder="0.00" />
               </div>
            </div>
          </div>

          {/* TOTAL BAR - Full Width at Bottom */}
          <div className="col-span-1 md:col-span-2 mt-4">
             <div className="bg-slate-900 rounded-2xl p-6 flex justify-between items-center text-white shadow-lg">
                <div>
                   <p className="text-xs font-bold uppercase text-slate-400 mb-1">Total Transaction Value</p>
                   <p className="text-lg opacity-80">{formData.quantity || 0} {formData.unit} × ₹{formData.rate || 0}</p>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                   ₹ {((parseFloat(formData.quantity)||0) * (parseFloat(formData.rate)||0)).toFixed(2)}
                </div>
             </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="col-span-1 md:col-span-2">
            <button type="submit" className={`w-full h-16 rounded-2xl font-bold text-xl text-white shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.99] ${isSale ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Check size={28} strokeWidth={3} /> {isSale ? 'CONFIRM & SAVE ENTRY' : 'CONFIRM & SAVE ENTRY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DailyEntry;