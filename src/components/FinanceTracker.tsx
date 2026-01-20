import React, { useState, useEffect } from 'react';
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, Trash2, Plus, Wallet, TrendingUp, TrendingDown, Printer, Loader2, Pencil, CheckCircle2, X, Building2, MapPin } from 'lucide-react';
import { FinanceRecord, formatCurrency, UserProfile, DEFAULT_PROFILE } from '../utils/timeUtils';
import { AlertDialog, AlertType } from './ui/AlertDialog';

const STORAGE_KEY_FINANCE = 'timemaster_finance';

interface FinanceTrackerProps {
  userProfile?: UserProfile;
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ userProfile = DEFAULT_PROFILE }) => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  
  // Form State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bensin');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Categories preset
  const incomeCategories = ['Gaji', 'Bonus', 'Tunjangan', 'Tabungan Masuk', 'Lainnya'];
  const expenseCategories = ['Bensin', 'Makan', 'Transportasi', 'Belanja', 'Tagihan', 'Tabungan Keluar', 'Lainnya'];

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FINANCE);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load finance records", e);
      }
    }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FINANCE, JSON.stringify(records));
  }, [records]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setCategory(expenseCategories[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const amountVal = parseFloat(amount);
    
    if (editingId) {
      // Update Mode
      setRecords(prev => prev.map(r => r.id === editingId ? {
        ...r,
        date: new Date(date).toISOString(),
        type,
        category,
        amount: amountVal,
        note
      } : r));
      showToast('Transaksi berhasil diperbarui!');
    } else {
      // Add Mode
      const newRecord: FinanceRecord = {
        id: Date.now().toString(),
        date: new Date(date).toISOString(),
        type,
        category,
        amount: amountVal,
        note
      };
      setRecords(prev => [newRecord, ...prev]);
      showToast('Transaksi baru berhasil disimpan!');
    }
    
    resetForm();
  };

  const handleEdit = (rec: FinanceRecord) => {
    setEditingId(rec.id);
    setType(rec.type);
    setCategory(rec.category);
    setAmount(rec.amount.toString());
    setNote(rec.note);
    setDate(new Date(rec.date).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRequest = (id: string) => {
    setAlertConfig({
      isOpen: true,
      title: 'Hapus Transaksi?',
      description: 'Data transaksi ini akan dihapus secara permanen. Lanjutkan?',
      onConfirm: () => {
        setRecords(prev => prev.filter(r => r.id !== id));
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        showToast('Transaksi telah dihapus.');
      }
    });
  };

  const handleExportPDF = async () => {
    if (records.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Render wait

    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = document.getElementById('hidden-finance-report');
    
    if (element && html2pdf) {
      const opt = {
        margin: 0,
        filename: `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      try {
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF Fail", error);
      }
    }
    setIsGenerating(false);
  };

  // Calculations
  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 pl-2 pr-6 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-emerald-600">{toast.message}</p>
          </div>
      </div>

      <AlertDialog 
         isOpen={alertConfig.isOpen}
         type="danger"
         title={alertConfig.title}
         description={alertConfig.description}
         onConfirm={alertConfig.onConfirm}
         onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
         confirmLabel="Ya, Hapus"
      />

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-indigo-300" />
                </div>
                <span className="font-bold text-slate-300 tracking-wide uppercase text-xs">Total Saldo Tabungan</span>
            </div>
            <button 
                onClick={handleExportPDF}
                disabled={isGenerating}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                Export PDF
            </button>
          </div>

          <div className="text-5xl font-black tracking-tight mb-8">
            {formatCurrency(balance).replace(',00', '')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1 text-emerald-400">
                <ArrowUpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Pemasukan</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(totalIncome).replace(',00', '')}
              </div>
            </div>
            <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1 text-rose-400">
                <ArrowDownCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Pengeluaran</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrency(totalExpense).replace(',00', '')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 ${editingId ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="font-bold text-slate-800">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
           </div>
           {editingId && (
               <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                   <X className="w-4 h-4" /> Batal
               </button>
           )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(incomeCategories[0]); }}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'income' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Pemasukan
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(expenseCategories[0]); }}
              className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                type === 'expense' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Pengeluaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
               <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(type === 'income' ? incomeCategories : expenseCategories).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nominal (Rp)</label>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Catatan (Opsional)</label>
             <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Beli bensin full tank"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
          </div>

          <button 
            type="submit"
            className={`w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
          >
            {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
           <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Riwayat Transaksi</span>
           </div>
           <span className="text-xs font-bold text-slate-400">{records.length} Item</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-medium">Belum ada catatan keuangan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Waktu</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4 text-right">Nominal</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                        <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-600 w-40">
                                <div className="flex flex-col">
                                    <span>{new Date(record.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: '2-digit'})}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg mt-0.5 ${record.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {record.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-700 block">{record.category}</span>
                                        {record.note && <span className="text-xs text-slate-400">{record.note}</span>}
                                    </div>
                                </div>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold font-mono text-base ${record.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {record.type === 'income' ? '+' : '-'} {formatCurrency(record.amount).replace(',00', '')}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(record)}
                                        className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRequest(record.id)}
                                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Hidden PDF Report */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
        <div id="hidden-finance-report" className="w-[210mm] min-h-[297mm] bg-white text-slate-800 p-12 relative mx-auto font-sans leading-normal box-border">
             <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900"></div>
             
             {/* Header */}
             <div className="flex justify-between items-start mb-10 border-b pb-6 border-slate-100 pl-4">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{userProfile.companyName}</h1>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium uppercase tracking-wide">
                        <MapPin className="w-3 h-3" />
                        {userProfile.companyAddress}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-black text-slate-300 tracking-tighter uppercase mb-1">Financial Report</h2>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Generated on {new Date().toLocaleDateString('id-ID')}</span>
                  </div>
             </div>

             {/* Summary */}
             <div className="grid grid-cols-3 gap-4 mb-8 pl-4">
                 <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                     <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Income</span>
                     <div className="text-xl font-black text-slate-800">{formatCurrency(totalIncome).replace(',00','')}</div>
                 </div>
                 <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                     <span className="text-[10px] font-bold text-rose-600 uppercase">Total Expense</span>
                     <div className="text-xl font-black text-slate-800">{formatCurrency(totalExpense).replace(',00','')}</div>
                 </div>
                 <div className="p-4 bg-slate-900 text-white rounded-lg">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Net Balance</span>
                     <div className="text-xl font-black text-white">{formatCurrency(balance).replace(',00','')}</div>
                 </div>
             </div>

             {/* Table */}
             <div className="pl-4">
                 <table className="w-full text-xs text-left border-collapse">
                     <thead>
                         <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                             <th className="p-3 font-bold border-b border-slate-200">Date</th>
                             <th className="p-3 font-bold border-b border-slate-200">Category</th>
                             <th className="p-3 font-bold border-b border-slate-200 text-right">Amount</th>
                         </tr>
                     </thead>
                     <tbody className="text-slate-600">
                         {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
                             <tr key={r.id} className="border-b border-slate-50">
                                 <td className="p-3 font-bold">{new Date(r.date).toLocaleDateString('id-ID')}</td>
                                 <td className="p-3">
                                     <span className="font-bold block text-slate-800">{r.category}</span>
                                     <span className="text-[10px] text-slate-400">{r.note}</span>
                                 </td>
                                 <td className={`p-3 text-right font-mono font-bold ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                     {r.type === 'income' ? '+' : '-'} {formatCurrency(r.amount).replace(',00','')}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
      </div>
    </div>
  );
};