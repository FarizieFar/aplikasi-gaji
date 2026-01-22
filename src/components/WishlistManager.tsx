
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Trash2, Check, Star, 
  TrendingUp, Sparkles, AlertCircle, X, Tag,
  LayoutGrid, List as ListIcon, Heart, Trophy, Target,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import { WishlistItem, formatCurrency } from '../utils/timeUtils';

const STORAGE_KEY_WISHLIST = 'timemaster_wishlist';

export const WishlistManager: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  
  // View State (Month Navigation)
  const [viewDate, setViewDate] = useState(new Date());

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetMonth, setTargetMonth] = useState(''); // YYYY-MM
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load wishlist", e);
      }
    }
    // Set default target month for form to current view
    setTargetMonth(viewDate.toISOString().slice(0, 7));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(items));
  }, [items]);

  // Update targetMonth in form when view changes (convenience)
  useEffect(() => {
    if (!isFormOpen) {
        setTargetMonth(viewDate.toISOString().slice(0, 7));
    }
  }, [viewDate, isFormOpen]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setItemPrice(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice) return;

    const newItem: WishlistItem = {
      id: Date.now().toString(),
      itemName,
      price: parseFloat(itemPrice),
      priority,
      status: 'active',
      createdAt: new Date().toISOString(),
      targetMonth: targetMonth || new Date().toISOString().slice(0, 7)
    };

    setItems(prev => [newItem, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setItemName('');
    setItemPrice('');
    setPriority('medium');
    setTargetMonth(viewDate.toISOString().slice(0, 7));
    setIsFormOpen(false);
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Hapus item ini dari wishlist?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
      ? { ...item, status: item.status === 'active' ? 'purchased' : 'active' } 
      : item
    ));
  };

  // --- MONTH NAVIGATION LOGIC ---
  const currentMonthKey = viewDate.toISOString().slice(0, 7); // "YYYY-MM"
  
  const changeMonth = (offset: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setViewDate(newDate);
  };

  // --- FILTERING ---
  const filteredItems = useMemo(() => {
      return items.filter(i => {
          // If item has a specific target month, match it
          if (i.targetMonth) {
              return i.targetMonth === currentMonthKey;
          }
          // Legacy support: match createdAt month if targetMonth is missing
          return i.createdAt.startsWith(currentMonthKey);
      });
  }, [items, currentMonthKey]);

  // Calculations based on FILTERED items
  const activeItems = filteredItems.filter(i => i.status === 'active');
  const totalNeeded = activeItems.reduce((acc, curr) => acc + curr.price, 0);
  const purchasedItems = filteredItems.filter(i => i.status === 'purchased');
  const totalSpent = purchasedItems.reduce((acc, curr) => acc + curr.price, 0);

  // Sorting: Active first, then by priority (High -> Low), then Price
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    
    const priorityScore = { high: 3, medium: 2, low: 1 };
    if (priorityScore[a.priority] !== priorityScore[b.priority]) {
      return priorityScore[b.priority] - priorityScore[a.priority];
    }
    
    return b.price - a.price;
  });

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-500';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400';
    }
  };

  const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- MONTH NAVIGATOR --- */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-200 max-w-xl mx-auto">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-indigo-600"
          >
              <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Belanja</span>
              <span className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  {monthLabel}
              </span>
          </div>

          <button 
            onClick={() => changeMonth(1)}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-indigo-600"
          >
              <ChevronRight className="w-5 h-5" />
          </button>
      </div>

      {/* --- HEADER & STATS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Stats Card */}
          <div className="xl:col-span-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
              
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                              <Target className="w-5 h-5 text-indigo-100" /> 
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Kebutuhan {monthLabel}</span>
                      </div>
                      <h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-2">
                          {formatCurrency(totalNeeded).replace(',00', '')}
                      </h2>
                  </div>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1">Item Aktif</div>
                      <div className="text-2xl font-bold">{activeItems.length}</div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1">Sudah Dibeli</div>
                      <div className="text-2xl font-bold text-emerald-300 flex items-center gap-1">
                          {purchasedItems.length} <Check className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1">Total Terbeli</div>
                      <div className="text-lg sm:text-2xl font-bold truncate" title={formatCurrency(totalSpent)}>
                          {totalSpent > 1000000 ? (totalSpent/1000000).toFixed(1) + ' Jt' : (totalSpent/1000).toFixed(0) + ' Rb'}
                      </div>
                  </div>
              </div>
          </div>

          {/* Add New Button Card */}
          <button 
              onClick={() => setIsFormOpen(true)}
              className="xl:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col items-center justify-center gap-6 text-center cursor-pointer min-h-[240px]"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-fuchsia-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors z-10 shadow-inner">
                  <Plus className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div className="z-10">
                  <h3 className="text-2xl font-bold text-slate-800">Tambah Wishlist</h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium">Buat target belanja baru</p>
              </div>
          </button>
      </div>

      {/* --- FORM MODAL --- */}
      {isFormOpen && (
          <div className="relative z-20 animate-in fade-in slide-in-from-top-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-indigo-100 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                   
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           <ShoppingBag className="w-6 h-6 text-indigo-600" />
                           Item Baru: {monthLabel}
                       </h3>
                       <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                           <X className="w-5 h-5" />
                       </button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Nama Barang</label>
                                <input 
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Contoh: Laptop Baru, Sepatu Lari..."
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Harga Estimasi</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-indigo-500">Rp</span>
                                    <input 
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        placeholder="0"
                                        value={itemPrice ? new Intl.NumberFormat('id-ID').format(parseInt(itemPrice)) : ''}
                                        onChange={handlePriceChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Prioritas Kebutuhan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'high', label: 'Tinggi', icon: AlertCircle, color: 'bg-rose-50 border-rose-200 text-rose-600 ring-rose-500' },
                                        { id: 'medium', label: 'Sedang', icon: Star, color: 'bg-amber-50 border-amber-200 text-amber-600 ring-amber-500' },
                                        { id: 'low', label: 'Rendah', icon: Heart, color: 'bg-blue-50 border-blue-200 text-blue-600 ring-blue-500' }
                                    ].map((p) => {
                                        const isActive = priority === p.id;
                                        const Icon = p.icon;
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPriority(p.id as any)}
                                                className={`
                                                    relative flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all duration-300
                                                    ${isActive 
                                                        ? `${p.color} ring-2 ring-offset-2 shadow-sm` 
                                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}
                                                `}
                                            >
                                                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                                                <span className="text-xs font-bold">{p.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                             </div>

                             <div className="space-y-3">
                                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Target Bulan</label>
                                 <input 
                                     type="month"
                                     value={targetMonth}
                                     onChange={(e) => setTargetMonth(e.target.value)}
                                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all"
                                 />
                             </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={resetForm} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
                                Batal
                            </button>
                            <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> Simpan Target
                            </button>
                        </div>
                   </form>
              </div>
          </div>
      )}

      {/* --- LIST ITEMS --- */}
      <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
              <ListIcon className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Daftar Keinginan: {monthLabel}</h3>
              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-md">{filteredItems.length}</span>
          </div>

          {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-10 h-10 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Tidak ada target belanja.</h3>
                  <p className="text-slate-400 text-sm mt-2">
                      {items.length > 0 ? `Cek bulan lain, atau tambahkan item untuk ${monthLabel}.` : 'Mulai buat perencanaan keuanganmu sekarang.'}
                  </p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedItems.map((item) => {
                      const priorityStyle = getPriorityColor(item.priority);
                      const isPurchased = item.status === 'purchased';

                      return (
                          <div 
                              key={item.id} 
                              className={`
                                  relative bg-white rounded-[1.5rem] p-5 border transition-all duration-300 group flex flex-col justify-between min-h-[180px]
                                  ${isPurchased 
                                      ? 'border-slate-100 opacity-60 grayscale-[0.5]' 
                                      : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 hover:-translate-y-1'}
                              `}
                          >
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`
                                        text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border
                                        ${priorityStyle}
                                    `}>
                                        {item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low'}
                                    </span>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => toggleStatus(item.id)}
                                            className={`p-2 rounded-lg transition-colors ${isPurchased ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                            title={isPurchased ? "Batalkan" : "Tandai Terbeli"}
                                        >
                                            {isPurchased ? <X className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                                        </button>
                                        <button 
                                            onClick={() => deleteItem(item.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className={`font-bold text-lg mb-1 leading-snug ${isPurchased ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                    {item.itemName}
                                </h4>
                              </div>

                              <div className={`text-2xl font-black tracking-tight mt-4 ${isPurchased ? 'text-slate-400' : 'text-indigo-600'}`}>
                                  {formatCurrency(item.price).replace(',00', '')}
                              </div>

                              {isPurchased && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="bg-emerald-100/90 text-emerald-700 px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest border-2 border-emerald-500 rotate-[-10deg] shadow-lg">
                                          Purchased
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          )}
      </div>

    </div>
  );
};
