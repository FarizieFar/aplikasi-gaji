import React, { useState, useEffect } from 'react';
import { PiggyBank, ArrowUpCircle, ArrowDownCircle, Trash2, Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { FinanceRecord, formatCurrency } from '../utils/timeUtils';

const STORAGE_KEY_FINANCE = 'timemaster_finance';

export const FinanceTracker: React.FC = () => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bensin');
  const [note, setNote] = useState('');

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const newRecord: FinanceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      category,
      amount: parseFloat(amount),
      note
    };

    setRecords(prev => [newRecord, ...prev]);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan transaksi ini?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Calculations
  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-indigo-300" />
            </div>
            <span className="font-bold text-slate-300 tracking-wide uppercase text-xs">Total Saldo Tabungan</span>
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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
             <Plus className="w-5 h-5" />
           </div>
           <h3 className="font-bold text-slate-800">Tambah Transaksi</h3>
        </div>

        <form onSubmit={handleAdd} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Simpan Transaksi
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <PiggyBank className="w-5 h-5 text-slate-400" />
           <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Riwayat Transaksi</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
            <p className="text-slate-400 font-medium">Belum ada catatan keuangan.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
              <div key={record.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${record.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {record.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{record.category}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(record.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      {record.note && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{record.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`font-bold font-mono ${record.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {record.type === 'income' ? '+' : '-'} {formatCurrency(record.amount).replace(',00', '')}
                  </span>
                  <button 
                    onClick={() => handleDelete(record.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};