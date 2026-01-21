import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, Trash2, Calendar, Target, 
  Briefcase, User, AlertCircle, CheckCircle2, 
  Sparkles, Pencil, X, Flag, LayoutList, Clock, 
  ArrowRight, Info, PartyPopper
} from 'lucide-react';
import { JournalTask } from '../utils/timeUtils';

const STORAGE_KEY_JOURNAL = 'timemaster_journal';

export const DailyJournal: React.FC = () => {
  const [tasks, setTasks] = useState<JournalTask[]>([]);
  
  // Form State
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'urgent'>('work');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'delete' }>({ 
      show: false, message: '', type: 'info' 
  });

  // Load Tasks
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_JOURNAL);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
  }, []);

  // Save Tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(tasks));
  }, [tasks]);

  const showToast = (message: string, type: 'success' | 'info' | 'delete') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    if (editingId) {
        // Update Existing
        setTasks(prev => prev.map(t => 
            t.id === editingId 
            ? { ...t, text: newTask, category: category } 
            : t
        ));
        showToast('Aktivitas berhasil diperbarui', 'info');
        setEditingId(null);
    } else {
        // Create New (Append to Bottom)
        const task: JournalTask = {
          id: Date.now().toString(),
          text: newTask,
          completed: false,
          category,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, task]);
        showToast('Aktivitas baru ditambahkan ke timeline', 'success');
    }

    setNewTask('');
  };

  const handleEditClick = (task: JournalTask) => {
      setEditingId(task.id);
      setNewTask(task.text);
      setCategory(task.category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewTask('');
      setCategory('work');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
        const newTasks = prev.map(t => {
            if (t.id === id) {
                const isCompleting = !t.completed;
                // Motivational messages
                if (isCompleting) {
                    const messages = ["Hebat! Satu tugas selesai.", "Produktif sekali!", "Terus berkarya!", "Good job creator!"];
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                    showToast(randomMsg, 'success');
                } else {
                    showToast('Status tugas dikembalikan', 'info');
                }
                return { ...t, completed: !t.completed };
            }
            return t;
        });
        return newTasks;
    });
  };

  const deleteTask = (id: string) => {
    if (window.confirm("Hapus aktivitas ini?")) {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (editingId === id) handleCancelEdit();
        showToast('Aktivitas dihapus dari list', 'delete');
    }
  };

  const clearCompleted = () => {
    if (window.confirm("Hapus semua tugas yang sudah selesai?")) {
      setTasks(prev => prev.filter(t => !t.completed));
      showToast('List aktivitas dibersihkan', 'delete');
    }
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Date
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam';

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case 'work': return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', accent: 'bg-indigo-500', icon: <Briefcase className="w-3 h-3" /> };
      case 'personal': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-500', icon: <User className="w-3 h-3" /> };
      case 'urgent': return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', accent: 'bg-rose-500', icon: <Flag className="w-3 h-3" /> };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', accent: 'bg-slate-500', icon: <Target className="w-3 h-3" /> };
    }
  };

  // Toast Component
  const ToastNotification = () => (
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className={`
              px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[300px] justify-center
              ${toast.type === 'success' ? 'bg-white/95 border-emerald-200 text-emerald-800' : 
                toast.type === 'delete' ? 'bg-white/95 border-rose-200 text-rose-800' : 
                'bg-white/95 border-indigo-200 text-indigo-800'}
          `}>
              {toast.type === 'success' && <PartyPopper className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'delete' && <Trash2 className="w-5 h-5 text-rose-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
              <span className="font-bold text-sm">{toast.message}</span>
          </div>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        
        <ToastNotification />

        {/* --- HERO HEADER --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-fuchsia-100 to-transparent rounded-tr-full opacity-50"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold mb-3 border border-slate-200">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{today}</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-800 mb-2">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Creator!</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        "Setiap ceklis kecil adalah kemenangan besar." <br/>
                        <span className="text-sm opacity-80">Selesaikan <span className="font-bold text-slate-700">{totalTasks - completedTasks}</span> tugas tersisa hari ini.</span>
                    </p>
                </div>

                {/* Progress Circle Widget */}
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                    <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path 
                                className="text-indigo-600 transition-all duration-1000 ease-out" 
                                strokeDasharray={`${progress}, 100`} 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-black text-indigo-900">
                            {progress}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Harian</div>
                        <div className="text-lg font-bold text-slate-800">{completedTasks}/{totalTasks} Selesai</div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CREATIVE INPUT FORM --- */}
        <div className={`rounded-[2rem] p-1 transition-all duration-500 ${editingId ? 'bg-gradient-to-r from-amber-200 to-orange-200 shadow-lg shadow-orange-100 scale-[1.01]' : 'bg-gradient-to-r from-slate-100 to-slate-200'}`}>
            <div className="bg-white rounded-[1.8rem] p-6 sm:p-8 relative overflow-hidden">
                
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                        {editingId ? (
                             <><Pencil className="w-5 h-5 text-amber-500" /> Mode Edit Aktivitas</>
                        ) : (
                             <><Sparkles className="w-5 h-5 text-indigo-500" /> Tambah Aktivitas Baru</>
                        )}
                    </h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                            <X className="w-3.5 h-3.5" /> Batal Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <textarea
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Tulis target atau kegiatan Anda di sini..."
                            className="w-full min-h-[80px] bg-slate-50 border-0 rounded-2xl p-5 text-lg font-medium text-slate-700 placeholder:text-slate-300 focus:ring-0 focus:bg-indigo-50/30 transition-all resize-none shadow-inner"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 pointer-events-none group-focus-within:text-indigo-300">
                            {newTask.length} chars
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Category Selector */}
                        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 w-full md:w-auto overflow-x-auto">
                             {(['work', 'personal', 'urgent'] as const).map((c) => {
                                 const style = getCategoryStyle(c);
                                 const isSelected = category === c;
                                 return (
                                     <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCategory(c)}
                                        className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap ${
                                            isSelected
                                            ? `${style.bg} ${style.text} shadow-sm ring-1 ring-inset ${style.border}` 
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                        }`}
                                     >
                                         {style.icon}
                                         {c === 'urgent' ? 'Penting' : (c === 'work' ? 'Pekerjaan' : 'Pribadi')}
                                     </button>
                                 );
                             })}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={!newTask.trim()}
                            className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${
                                editingId 
                                ? 'bg-amber-500 shadow-amber-200 hover:bg-amber-600' 
                                : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'
                            }`}
                        >
                            {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingId ? 'Simpan Perubahan' : 'Tambahkan ke List'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* --- TASKS LIST (STRUCTURED TIMELINE) --- */}
        <div className="space-y-6">
            <div className="flex justify-between items-end px-2 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <LayoutList className="w-5 h-5 text-slate-400" />
                    Timeline Kegiatan ({totalTasks})
                </h3>
                {completedTasks > 0 && (
                    <button 
                        onClick={clearCompleted}
                        className="text-xs text-rose-500 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Bersihkan ({completedTasks})
                    </button>
                )}
            </div>

            {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Target className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-1">List Masih Kosong</h3>
                    <p className="text-slate-400 text-sm max-w-xs text-center">
                        Hari yang baru, kesempatan baru. Tambahkan target pertama Anda di atas!
                    </p>
                </div>
            ) : (
                <div className="relative pl-4 sm:pl-8">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 sm:left-8 top-4 bottom-4 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>

                    <div className="space-y-6">
                        {tasks.map((task, index) => {
                             const style = getCategoryStyle(task.category);
                             return (
                                <div key={task.id} className="relative pl-8 sm:pl-10 group">
                                    
                                    {/* Timeline Node (Number / Check) */}
                                    <button 
                                        onClick={() => toggleTask(task.id)}
                                        className={`absolute left-[-16px] top-4 w-9 h-9 rounded-full border-4 border-[#F0F4F8] z-10 flex items-center justify-center shadow-sm transition-all duration-300 transform group-hover:scale-110 ${
                                            task.completed 
                                            ? 'bg-emerald-500 text-white shadow-emerald-200 rotate-0' 
                                            : 'bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                                        }`}
                                    >
                                        {task.completed ? <Check className="w-4 h-4" strokeWidth={4} /> : <span className="text-xs font-bold">{index + 1}</span>}
                                    </button>

                                    {/* Task Card */}
                                    <div 
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out ${
                                            task.completed 
                                            ? 'bg-slate-50 border-slate-100 opacity-60 grayscale-[0.8]' 
                                            : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1'
                                        }`}
                                    >
                                        {/* Colored Accent Bar on Left */}
                                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${style.accent}`}></div>

                                        <div className="p-5 pl-7 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                                            
                                            <div className="flex-1 min-w-0">
                                                {/* Meta Info */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1.5 ${style.bg} ${style.text} border ${style.border}`}>
                                                        {style.icon}
                                                        {task.category === 'urgent' ? 'Penting' : (task.category === 'work' ? 'Kerja' : 'Pribadi')}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(task.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {/* Text Content */}
                                                <p className={`text-base font-medium leading-relaxed whitespace-pre-wrap transition-all duration-300 ${task.completed ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-700'}`}>
                                                    {task.text}
                                                </p>
                                            </div>

                                            {/* Action Buttons (Visible on Hover) */}
                                            <div className="flex items-center gap-2 self-end sm:self-start opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                                                <button 
                                                    onClick={() => handleEditClick(task)}
                                                    disabled={task.completed}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            )}
            
            {/* Bottom spacer for comfortable scrolling */}
            <div className="h-8"></div>
        </div>
    </div>
  );
};