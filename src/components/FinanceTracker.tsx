import React, { useState, useEffect, useMemo } from 'react';
import { 
  PiggyBank, ArrowUpRight, ArrowDownLeft, Trash2, Plus, Wallet, 
  TrendingUp, TrendingDown, Printer, Loader2, Pencil, CheckCircle2, 
  X, Building2, MapPin, CreditCard, ShoppingBag, Utensils, Car, 
  Zap, AlertCircle, Banknote, Landmark, Filter, Search, Calendar, Tag, FileText, ChevronLeft, ChevronRight, Clock, RefreshCcw, ShieldCheck, PenTool
} from 'lucide-react';
import { FinanceRecord, formatCurrency, UserProfile, DEFAULT_PROFILE } from '../utils/timeUtils';
import { AlertDialog } from './ui/AlertDialog';

const STORAGE_KEY_FINANCE = 'timemaster_finance';
const ITEMS_PER_PAGE = 10;

interface FinanceTrackerProps {
  userProfile?: UserProfile;
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ userProfile = DEFAULT_PROFILE }) => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState(''); 
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false); // To toggle between Select and Input
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigned, setIsSigned] = useState(false); // New state for digital signature
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

  // Filter & Pagination State
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Categories preset
  const incomeCategories = ['Gaji', 'Bonus', 'Tunjangan', 'Tabungan Masuk', 'Investasi', 'Penjualan', 'Freelance'];
  const expenseCategories = ['Bensin', 'Makan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Sewa', 'Pulsa/Data', 'Darurat'];

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

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, records.length]);

  // Set default category on type change if empty or not custom
  useEffect(() => {
     if (!editingId && !isCustomCategory) {
        setCategory(type === 'income' ? incomeCategories[0] : expenseCategories[0]);
     }
  }, [type, editingId, isCustomCategory]);

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
    setIsCustomCategory(false);
    setCategory(expenseCategories[0]);
    setShowForm(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'CUSTOM_OPTION') {
          setIsCustomCategory(true);
          setCategory('');
      } else {
          setIsCustomCategory(false);
          setCategory(val);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    const amountVal = parseFloat(amount);
    
    // Add current time to date for sorting
    const dateTime = new Date(date);
    const now = new Date();
    dateTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? {
        ...r,
        date: dateTime.toISOString(),
        type,
        category,
        amount: amountVal,
        note
      } : r));
      showToast('Transaksi diperbarui!');
    } else {
      const newRecord: FinanceRecord = {
        id: Date.now().toString(),
        date: dateTime.toISOString(),
        type,
        category,
        amount: amountVal,
        note
      };
      setRecords(prev => [...prev, newRecord]); // Newest at the end (Ascending order in logic)
      showToast('Transaksi disimpan!');
    }
    
    resetForm();
  };

  const handleEdit = (rec: FinanceRecord) => {
    setEditingId(rec.id);
    setType(rec.type);
    
    // Check if category is in presets
    const presets = rec.type === 'income' ? incomeCategories : expenseCategories;
    if (presets.includes(rec.category)) {
        setIsCustomCategory(false);
        setCategory(rec.category);
    } else {
        setIsCustomCategory(true);
        setCategory(rec.category);
    }

    setAmount(rec.amount.toString());
    setNote(rec.note);
    setDate(new Date(rec.date).toISOString().split('T')[0]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRequest = (id: string) => {
    setAlertConfig({
      isOpen: true,
      title: 'Hapus Transaksi?',
      description: 'Data ini akan dihapus permanen.',
      onConfirm: () => {
        setRecords(prev => prev.filter(r => r.id !== id));
        setAlertConfig(prev => ({ ...prev, isOpen: false }));
        showToast('Data dihapus.');
      }
    });
  };

  const handleExportPDF = async () => {
    if (records.length === 0) {
      alert("Tidak ada data.");
      return;
    }
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = document.getElementById('hidden-finance-report');
    
    if (element && html2pdf) {
      const opt = {
        margin: 0, // Zero margin to ensure full bleed for sidebar
        filename: `Laporan-Keuangan-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
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

  // Helper: Get Icon based on category
  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes('bensin') || lower.includes('trans')) return <Car className="w-5 h-5" />;
    if (lower.includes('makan')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('belanja')) return <ShoppingBag className="w-5 h-5" />;
    if (lower.includes('tagihan') || lower.includes('listrik')) return <Zap className="w-5 h-5" />;
    if (lower.includes('gaji')) return <Wallet className="w-5 h-5" />;
    if (lower.includes('bank') || lower.includes('tabungan')) return <Landmark className="w-5 h-5" />;
    return <Banknote className="w-5 h-5" />;
  };

  // Calculations
  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Process Records: SORT ASCENDING (Oldest to Newest) based on user request "Riwayat terbaru ditaruh paling bawah/akhir"
  const sortedRecords = useMemo(() => {
    return records
        .filter(r => filterType === 'all' || r.type === filterType)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, filterType]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE);
  // Default show last page if user wants to see "newest" which are at bottom? 
  // Standard table pagination usually starts at page 1. User can navigate.
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Theme Config for Form
  const borderColor = type === 'income' ? 'focus:border-emerald-500' : 'focus:border-rose-500';
  const ringColor = type === 'income' ? 'focus:ring-emerald-200' : 'focus:ring-rose-200';
  const btnColor = type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
  const currentPresets = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="bg-slate-900 border border-slate-700 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-sm font-bold text-white">{toast.message}</p>
          </div>
      </div>

      <AlertDialog 
         isOpen={alertConfig.isOpen}
         type="danger"
         title={alertConfig.title}
         description={alertConfig.description}
         onConfirm={alertConfig.onConfirm}
         onCancel={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
         confirmLabel="Hapus"
      />

      {/* --- HERO SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7">
             <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between group">
                <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-[80px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                <div className="absolute bottom-[-20%] left-[-20%] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[60px] opacity-20"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                                {formatCurrency(balance).replace(',00', '')}
                            </h2>
                        </div>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                           <CreditCard className="w-6 h-6 text-indigo-300" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-emerald-500/20 rounded-full">
                                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Pemasukan</span>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(totalIncome).replace(',00', '')}</p>
                        </div>
                        <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/10 hover:bg-rose-500/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1 bg-rose-500/20 rounded-full">
                                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                                </div>
                                <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wide">Pengeluaran</span>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(totalExpense).replace(',00', '')}</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-4">
              <button 
                  onClick={() => { setShowForm(true); setType('expense'); setEditingId(null); setIsCustomCategory(false); setCategory(expenseCategories[0]); setAmount(''); }}
                  className="flex-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-200 transition-all group text-left relative overflow-hidden"
              >
                  <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-rose-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10 flex flex-col items-start gap-3">
                      <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                          <TrendingDown className="w-6 h-6" />
                      </div>
                      <div>
                          <span className="font-bold text-slate-800 block text-lg">Catat Pengeluaran</span>
                          <span className="text-xs text-slate-400">Input belanja, tagihan, dll</span>
                      </div>
                  </div>
              </button>

              <button 
                  onClick={() => { setShowForm(true); setType('income'); setEditingId(null); setIsCustomCategory(false); setCategory(incomeCategories[0]); setAmount(''); }}
                  className="flex-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all group text-left relative overflow-hidden"
              >
                   <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative z-10 flex flex-col items-start gap-3">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                          <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                          <span className="font-bold text-slate-800 block text-lg">Catat Pemasukan</span>
                          <span className="text-xs text-slate-400">Input gaji, bonus, dll</span>
                      </div>
                  </div>
              </button>
          </div>
      </div>

      {/* --- FORM SECTION --- */}
      {showForm && (
        <div className={`rounded-[2.5rem] p-8 shadow-2xl border relative animate-in fade-in slide-in-from-top-4 overflow-hidden transition-colors duration-500 ${type === 'income' ? 'bg-white border-emerald-100' : 'bg-white border-rose-100'}`}>
             <div className={`absolute top-0 left-0 w-full h-32 opacity-10 transition-colors duration-500 ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

             <button onClick={resetForm} className="absolute top-6 right-6 p-2 bg-white/50 backdrop-blur text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-10">
                 <X className="w-5 h-5" />
             </button>

             <div className="relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="bg-slate-100/80 backdrop-blur p-1 rounded-2xl inline-flex shadow-inner">
                        <button 
                            type="button"
                            onClick={() => { setType('expense'); setIsCustomCategory(false); setCategory(expenseCategories[0]); }}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <TrendingDown className="w-4 h-4" /> Pengeluaran
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setType('income'); setIsCustomCategory(false); setCategory(incomeCategories[0]); }}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <TrendingUp className="w-4 h-4" /> Pemasukan
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="text-center space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ${type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Nominal ({type === 'income' ? 'Masuk' : 'Keluar'})
                        </label>
                        <div className="relative max-w-lg mx-auto group">
                            <div className={`flex items-center justify-center border-b-2 transition-all duration-300 ${amount ? (type === 'income' ? 'border-emerald-500' : 'border-rose-500') : 'border-slate-200'}`}>
                                <span className={`text-4xl font-bold mr-2 ${amount ? (type === 'income' ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-300'}`}>Rp</span>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    autoFocus
                                    value={amount ? new Intl.NumberFormat('id-ID').format(parseInt(amount)) : ''}
                                    onChange={handleAmountChange}
                                    placeholder="0"
                                    className={`w-full py-4 bg-transparent text-5xl font-black text-center focus:outline-none placeholder:text-slate-200 transition-colors ${type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}
                                />
                                <span className={`text-3xl font-bold ml-2 self-center mb-1 ${amount ? 'text-slate-400' : 'text-slate-200'}`}>,00</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase ml-1">
                                <Calendar className="w-4 h-4" /> Tanggal
                            </label>
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-700 focus:ring-4 focus:outline-none transition-all ${borderColor} ${ringColor}`}
                            />
                        </div>

                        {/* Category Dropdown (With Custom Option) */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase ml-1">
                                <Tag className="w-4 h-4" /> Kategori
                            </label>
                            
                            {!isCustomCategory ? (
                                <select 
                                    value={category}
                                    onChange={handleCategorySelectChange}
                                    className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-700 focus:ring-4 focus:outline-none transition-all ${borderColor} ${ringColor}`}
                                >
                                    {currentPresets.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                    <option value="CUSTOM_OPTION" className="font-bold text-indigo-600">+ Lainnya (Tulis Baru...)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        autoFocus
                                        placeholder="Ketik nama kategori..."
                                        className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 font-bold text-slate-700 focus:ring-4 focus:outline-none transition-all ${borderColor} ${ringColor}`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setIsCustomCategory(false)}
                                        className="px-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                                        title="Kembali ke Daftar"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase ml-1">
                                <FileText className="w-4 h-4" /> Catatan (Opsional)
                            </label>
                            <input 
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Contoh: Makan siang tim, Bonus project X"
                                className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 font-medium text-slate-700 focus:ring-4 focus:outline-none transition-all ${borderColor} ${ringColor}`}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={resetForm} className="px-8 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
                            Batal
                        </button>
                        <button type="submit" className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${btnColor}`}>
                            {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* --- TABLE SECTION --- */}
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between sticky top-4 z-20 bg-[#F0F4F8]/90 backdrop-blur-sm py-2 rounded-xl gap-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-indigo-500" /> Riwayat Transaksi
              </h3>
              
              <div className="flex gap-2">
                 <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filterType === f ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f === 'all' ? 'Semua' : (f === 'income' ? 'Masuk' : 'Keluar')}
                        </button>
                    ))}
                 </div>
                 
                 <button 
                    onClick={() => setIsSigned(!isSigned)}
                    disabled={isGenerating}
                    className={`p-2 border rounded-xl transition-all flex items-center gap-1.5 ${
                        isSigned 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                    title={isSigned ? "Tanda Tangan Aktif" : "Aktifkan Tanda Tangan"}
                 >
                    {isSigned ? <ShieldCheck className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
                    <span className="text-[10px] font-bold uppercase hidden sm:inline">
                        {isSigned ? 'Tertanda' : 'Tanda Tangan'}
                    </span>
                 </button>

                 <button 
                    onClick={handleExportPDF}
                    disabled={isGenerating || records.length === 0}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50"
                 >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
                 </button>
              </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
             {paginatedRecords.length === 0 ? (
                  <div className="text-center py-20">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium">Tidak ada transaksi ditemukan.</p>
                  </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center">No</th>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Transaksi</th>
                                <th className="px-6 py-4 text-right">Nominal</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedRecords.map((rec, index) => (
                                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 text-center font-bold text-slate-300">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">
                                                {new Date(rec.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[11px] font-medium font-mono">
                                                    {new Date(rec.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                rec.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {getCategoryIcon(rec.category)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{rec.category}</p>
                                                {rec.note ? (
                                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{rec.note}</p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-300 italic mt-0.5">Tanpa catatan</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`font-mono font-bold text-sm tracking-tight ${rec.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {rec.type === 'income' ? '+' : '-'} {formatCurrency(rec.amount).replace(',00', '').replace('Rp', '')}
                                        </div>
                                        <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${rec.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {rec.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(rec)} 
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRequest(rec.id)} 
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  {totalPages > 1 && (
                      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                         <p className="text-xs text-slate-500 font-medium">
                             Halaman {currentPage} dari {totalPages}
                         </p>
                         <div className="flex gap-2">
                             <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                             >
                                 <ChevronLeft className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                             >
                                 <ChevronRight className="w-4 h-4" />
                             </button>
                         </div>
                      </div>
                  )}
                </>
             )}
          </div>
      </div>

      {/* Hidden PDF Report (Strictly Styled as Slip Gaji - Top Aligned) */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
        <div id="hidden-finance-report" className="w-[210mm] min-h-[297mm] bg-white text-slate-800 relative mx-auto font-sans leading-normal box-border">
             
             {/* Decorative Sidebar like Salary Slip */}
             <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-b from-slate-800 via-indigo-900 to-slate-900 print:h-full"></div>

             <div className="p-12 pl-16"> 
                 
                 {/* Header & Logo Section */}
                 <div className="flex justify-between items-start mb-10 border-b pb-6 border-slate-100">
                    <div className="flex items-center gap-5">
                         <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-800">
                             <Building2 size={32} strokeWidth={1.5} />
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
                        <h2 className="text-3xl font-black text-slate-200 tracking-tighter uppercase mb-1">Finance Report</h2>
                        <div className="flex flex-col items-end">
                             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider mb-1">
                                 Internal Statement
                             </span>
                             <span className="text-xs font-bold text-slate-500">
                                 {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                             </span>
                        </div>
                    </div>
                 </div>

                 {/* Ringkasan Saldo Cards */}
                 <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pemasukan</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">{formatCurrency(totalIncome).replace(',00', '')}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pengeluaran</div>
                        <div className="text-xl font-bold text-rose-600 font-mono">{formatCurrency(totalExpense).replace(',00', '')}</div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-5 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-bl-full"></div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Akhir</div>
                        <div className="text-2xl font-black text-white font-mono">{formatCurrency(balance).replace(',00', '')}</div>
                    </div>
                 </div>

                 {/* Tabel Transaksi */}
                 <div>
                     <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Rincian Transaksi
                     </h3>
                     
                     <div className="rounded-xl border border-slate-200 overflow-hidden">
                         <table className="w-full text-xs text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4 font-bold border-b border-slate-200 w-24">Tanggal</th>
                                    <th className="py-3 px-4 font-bold border-b border-slate-200">Keterangan / Kategori</th>
                                    <th className="py-3 px-4 font-bold border-b border-slate-200 text-right w-32">Debit (+)</th>
                                    <th className="py-3 px-4 font-bold border-b border-slate-200 text-right w-32">Kredit (-)</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {/* PDF SORT ORDER: Ascending (Oldest -> Newest) */}
                                {records.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((r) => (
                                    <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                        <td className="py-3 px-4 font-medium text-slate-500 align-top">
                                            {new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            <div className="font-bold text-slate-800">{r.category}</div>
                                            {r.note && <div className="text-slate-400 text-[10px] mt-0.5 italic">{r.note}</div>}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-emerald-700 align-top bg-emerald-50/20">
                                            {r.type === 'income' ? formatCurrency(r.amount).replace(',00','').replace('Rp','') : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-medium text-rose-700 align-top bg-rose-50/20">
                                            {r.type === 'expense' ? formatCurrency(r.amount).replace(',00','').replace('Rp','') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                 </div>
                 
                 {/* Footer like Salary Slip */}
                 <div className="flex justify-between items-end mt-12 border-t border-slate-100 pt-8 break-inside-avoid">
                     <div className="text-[9px] text-slate-400 font-medium">
                        <p className="mb-1 font-bold text-slate-500 uppercase tracking-widest">System Generated</p>
                        <p>Date: {new Date().toLocaleString('id-ID')}</p>
                        <p>Ref: FIN/{Date.now().toString(36).toUpperCase()}</p>
                     </div>
                     <div className="text-center w-48">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Approved By</p>
                        
                        <div className="h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300 relative flex items-center justify-center overflow-hidden mb-2">
                             {isSigned ? (
                                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                                     <div className="border-4 border-indigo-900/20 w-20 h-20 rounded-full absolute flex items-center justify-center">
                                         <ShieldCheck className="w-10 h-10 text-indigo-900 opacity-20" />
                                     </div>
                                     <span className="font-black text-indigo-900 text-lg opacity-80 rotate-[-5deg] font-serif italic relative z-10">APPROVED</span>
                                     <span className="text-[8px] font-mono text-indigo-900/50 mt-1 uppercase tracking-tight">{new Date().toLocaleDateString('id-ID')}</span>
                                </div>
                             ) : (
                                <span className="text-[9px] text-slate-300 italic">Signature / Stamp</span>
                             )}
                        </div>

                        <div className="border-b border-slate-300 pb-1">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{userProfile.companyName}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1">Finance Department</p>
                     </div>
                 </div>

             </div>
        </div>
      </div>
    </div>
  );
};