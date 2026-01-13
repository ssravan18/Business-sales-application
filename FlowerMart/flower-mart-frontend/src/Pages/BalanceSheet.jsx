import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Search, ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../api';

const BalanceSheet = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); 

  useEffect(() => {
    API.get('/balance-sheet')
      .then(res => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // --- 1. FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      // Normalize dates to Midnight for accurate "Day" comparison
      const tDate = new Date(t.date).setHours(0, 0, 0, 0);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
      
      if (start && tDate < start) return false;
      if (end && tDate > end) return false;
      if (searchTerm && !t.party_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterType !== 'ALL' && t.type !== filterType) return false;

      return true;
    });
  }, [transactions, startDate, endDate, searchTerm, filterType]);

  // --- 2. CALCULATE TOTALS ---
  const totals = useMemo(() => {
    let credit = 0; // Payments Received
    let debit = 0;  // Sales Made

    filteredData.forEach(t => {
      const amt = parseFloat(t.total_amount);
      if (t.type === 'SALE') debit += amt;
      if (t.type === 'PAYMENT') credit += amt;
    });

    // Balance = Total Sales - Total Collected
    return { credit, debit, balance: debit - credit };
  }, [filteredData]);

  // --- 3. PDF GENERATOR ---
  const downloadSheet = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sri Lakshmi Flower Mart - Customer Balance Sheet", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableRows = filteredData.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.party_name,
      t.type,
      t.type === 'SALE' ? `${t.flower_name} (${t.quantity}${t.unit})` : 'Cash Received',
      t.type === 'SALE' ? t.total_amount : '-',
      t.type === 'PAYMENT' ? t.total_amount : '-',
    ]);

    tableRows.push(['', '', 'TOTALS', '', totals.debit.toFixed(2), totals.credit.toFixed(2)]);

    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Customer', 'Type', 'Details', 'Debit (Sales)', 'Credit (Paid)']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(200, 0, 0);
    doc.text(`Total Outstanding Market Balance: Rs. ${totals.balance.toFixed(2)}`, 14, finalY);

    doc.save('Customer_Balance_Sheet.pdf');
  };

  return (
    <div className="fade-in-up pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Balance Sheet</h1>
          <p className="text-slate-500 text-sm">Sales (Debit) vs Payments Received (Credit)</p>
        </div>
        <button onClick={downloadSheet} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 shadow-lg font-medium transition-transform active:scale-95">
          <Download size={18} /> Download Report
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">From Date</label>
          <input type="date" className="pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">To Date</label>
          <input type="date" className="pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="min-w-[150px]">
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Transaction Type</label>
           <select className="w-full pl-3 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">Show All</option>
                <option value="SALE">Sales (Debit)</option>
                <option value="PAYMENT">Payments (Credit)</option>
           </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Search Customer</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
            <input type="text" placeholder="Filter by name..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <button onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); setFilterType('ALL'); }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500">Clear</button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right text-emerald-600">Debit (Sales)</th>
                <th className="p-4 text-right text-indigo-600">Credit (Paid)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading data...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-slate-700">{t.party_name}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded text-[10px] font-bold tracking-wide border 
                        ${t.type === 'SALE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                        {t.type === 'SALE' ? <ArrowUpCircle size={12}/> : <Banknote size={12}/>}
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {t.type === 'SALE' ? (
                        <span>{t.flower_name} <span className="text-slate-400 text-xs">({t.quantity}{t.unit} @ {t.rate_per_unit})</span></span>
                      ) : (
                        <span className="italic text-slate-500">Cash Received</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-700">
                      {t.type === 'SALE' ? `₹${t.total_amount}` : '-'}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-indigo-700">
                      {t.type === 'PAYMENT' ? `₹${t.total_amount}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">No records found.</td></tr>
              )}
            </tbody>
            
            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300">
              <tr>
                <td colSpan="4" className="p-4 text-right uppercase tracking-wider text-xs text-slate-500">Totals</td>
                <td className="p-4 text-right text-emerald-700 text-lg">₹ {totals.debit.toFixed(2)}</td>
                <td className="p-4 text-right text-indigo-700 text-lg">₹ {totals.credit.toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-800 text-white">
                <td colSpan="4" className="p-4 text-right uppercase tracking-wider text-xs opacity-70">Total Market Outstanding</td>
                <td colSpan="2" className="p-4 text-right text-xl text-red-400">
                   ₹ {totals.balance.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;