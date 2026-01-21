import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, Trash2, Calendar, Target, 
  Briefcase, User, CheckCircle2, 
  Sparkles, Pencil, X, Flag, LayoutList, Clock, 
  Info, PartyPopper, AlarmClock, ChevronDown
} from 'lucide-react';
import { JournalTask } from '../utils/timeUtils';

const STORAGE_KEY_JOURNAL = 'timemaster_journal';

export const DailyJournal: React.FC = () => {
  const [tasks, setTasks] = useState<JournalTask[]>([]);
  
  // Form State
  const [newTask, setNewTask] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
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
    // Set default time to current time rounded to nearest 30 mins
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    now.setMinutes(0);
    setScheduledTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
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
    if (!newTask.trim() || !scheduledTime) return;

    if (editingId) {
        // Update Existing
        setTasks(prev => prev.map(t => 
            t.id === editingId 
            ? { ...t, text: newTask, category: category, scheduledTime: scheduledTime } 
            : t
        ));
        showToast('Rencana berhasil diperbarui', 'info');
        setEditingId(null);
    } else {
        // Create New
        const task: JournalTask = {
          id: Date.now().toString(),
          text: newTask,
          completed: false,
          category,
          scheduledTime,
          createdAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, task]);
        showToast('Rencana ditambahkan ke jadwal', 'success');
    }

    setNewTask('');
    // Reset time to +1 hour from last input or keep current logic
  };

  const handleEditClick = (task: JournalTask) => {
      setEditingId(task.id);
      setNewTask(task.text);
      setCategory(task.category);
      setScheduledTime(task.scheduledTime || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewTask('');
      setCategory('work');
      const now = new Date();
      setScheduledTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
        const newTasks = prev.map(t => {
            if (t.id === id) {
                const isCompleting = !t.completed;
                if (isCompleting) {
                    const messages = ["Hebat! Tepat waktu.", "Produktif sekali!", "Terus berkarya!", "Good job!"];
                    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                    showToast(randomMsg, 'success');
                }
                return { ...t, completed: !t.completed };
            }
            return t;
        });
        return newTasks;
    });
  };

  const deleteTask = (id: string) => {
    if (window.confirm("Hapus rencana ini?")) {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (editingId === id) handleCancelEdit();
        showToast('Rencana dihapus', 'delete');
    }
  };

  const clearCompleted = () => {
    if (window.confirm("Hapus semua tugas yang sudah selesai?")) {
      setTasks(prev => prev.filter(t => !t.completed));
      showToast('List dibersihkan', 'delete');
    }
  };

  // Sort Tasks Chronologically
  const sortedTasks = [...tasks].sort((a, b) => {
     // Sort by completion (unchecked first), then by scheduled time
     if (a.completed === b.completed) {
         return (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
     }
     return a.completed ? 1 : -1;
  });

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
                        "Rencanakan harimu, kuasai waktumu." <br/>
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
        <div className={`rounded-[2.5rem] p-1 transition-all duration-500 ${editingId ? 'bg-gradient-to-r from-amber-200 to-orange-200 shadow-xl shadow-amber-100/50 transform scale-[1.01]' : 'bg-gradient-to-r from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50'}`}>
            <div className="bg-white rounded-[2.3rem] p-6 sm:p-8 relative overflow-hidden">
                
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                        {editingId ? (
                             <div className="flex items-center gap-2 text-amber-600">
                                <div className="p-2 bg-amber-100 rounded-lg"><Pencil className="w-5 h-5" /></div>
                                <span>Edit Rencana</span>
                             </div>
                        ) : (
                             <div className="flex items-center gap-2 text-indigo-600">
                                <div className="p-2 bg-indigo-100 rounded-lg"><Sparkles className="w-5 h-5" /></div>
                                <span>Rencana Baru</span>
                             </div>
                        )}
                    </h3>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
                            <X className="w-3.5 h-3.5" /> Batal
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Text Input */}
                    <div className="relative group">
                        <textarea
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Apa yang ingin kamu selesaikan?"
                            className="w-full min-h-[100px] bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-5 text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:ring-0 focus:bg-white transition-all resize-none shadow-inner"
                        />
                    </div>

                    {/* Metadata Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Time Picker */}
                        <div className="bg-slate-50 rounded-2xl p-2 flex items-center gap-3 border border-transparent focus-within:border-indigo-200 focus-within:bg-white transition-all">
                             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 border border-slate-100 ml-1">
                                <AlarmClock className="w-5 h-5" />
                             </div>
                             <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Jam Pelaksanaan</label>
                                <input 
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    required
                                    className="w-full bg-transparent font-bold text-slate-700 text-sm focus:outline-none"
                                />
                             </div>
                        </div>

                        {/* Category Picker */}
                        <div className="bg-slate-50 rounded-2xl p-2 relative group border border-transparent hover:border-slate-200 transition-all">
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <ChevronDown className="w-4 h-4" />
                             </div>
                             <label className="absolute top-2.5 left-14 text-[9px] font-bold text-slate-400 uppercase tracking-wide z-10 pointer-events-none">Kategori</label>
                             <div className="flex items-center h-full">
                                 <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-white border border-transparent ml-1 z-10 transition-colors ${
                                     category === 'urgent' ? 'bg-rose-500' : category === 'personal' ? 'bg-emerald-500' : 'bg-indigo-500'
                                 }`}>
                                     {category === 'urgent' ? <Flag className="w-5 h-5" /> : category === 'personal' ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                                 </div>
                                 <select 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                 >
                                    <option value="work">Pekerjaan</option>
                                    <option value="personal">Pribadi</option>
                                    <option value="urgent">Penting / Mendesak</option>
                                 </select>
                                 <div className="pl-3 pt-4 font-bold text-sm text-slate-700 capitalize">{category === 'work' ? 'Pekerjaan' : category === 'personal' ? 'Pribadi' : 'Penting'}</div>
                             </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={!newTask.trim() || !scheduledTime}
                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${
                            editingId 
                            ? 'bg-amber-500 shadow-amber-200 hover:bg-amber-600' 
                            : 'bg-slate-900 shadow-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        {editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {editingId ? 'Simpan Perubahan' : 'Jadwalkan Aktivitas'}
                    </button>
                </form>
            </div>
        </div>

        {/* --- TASKS LIST (STRUCTURED TIMELINE) --- */}
        <div className="space-y-6">
            <div className="flex justify-between items-end px-2 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <LayoutList className="w-5 h-5 text-slate-400" />
                    Jadwal Kegiatan ({totalTasks})
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
                    <h3 className="text-xl font-bold text-slate-700 mb-1">Jadwal Kosong</h3>
                    <p className="text-slate-400 text-sm max-w-xs text-center">
                        Isi harimu dengan kegiatan produktif. Tentukan waktu dan mulai langkah pertama!
                    </p>
                </div>
            ) : (
                <div className="relative pl-4 sm:pl-8">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 sm:left-8 top-4 bottom-4 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>

                    <div className="space-y-6">
                        {sortedTasks.map((task, index) => {
                             const style = getCategoryStyle(task.category);
                             return (
                                <div key={task.id} className="relative pl-8 sm:pl-10 group">
                                    
                                    {/* Timeline Node (Scheduled Time) */}
                                    <div 
                                        className={`absolute left-[-28px] sm:left-[-32px] top-4 w-16 sm:w-20 text-right pr-4 z-10 flex flex-col items-end transition-opacity ${
                                            task.completed ? 'opacity-40' : 'opacity-100'
                                        }`}
                                    >
                                        <span className="font-black text-sm text-slate-700 font-mono bg-[#F0F4F8] px-1">{task.scheduledTime}</span>
                                    </div>
                                    
                                    {/* Connection Dot */}
                                    <div className={`absolute left-[5px] sm:left-[29px] top-[22px] w-3 h-3 rounded-full border-2 border-[#F0F4F8] z-20 ${task.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>

                                    {/* Task Card */}
                                    <div 
                                        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out group ${
                                            task.completed 
                                            ? 'bg-slate-50 border-slate-100 opacity-60 grayscale-[0.8]' 
                                            : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-200 hover:-translate-y-1'
                                        }`}
                                    >
                                        {/* Colored Accent Bar on Left */}
                                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${style.accent}`}></div>

                                        <div className="p-5 pl-7 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                                            
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                                                {/* Meta Info */}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1.5 ${style.bg} ${style.text} border ${style.border}`}>
                                                        {style.icon}
                                                        {task.category === 'urgent' ? 'Penting' : (task.category === 'work' ? 'Kerja' : 'Pribadi')}
                                                    </span>
                                                    {task.completed && (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Selesai
                                                        </span>
                                                    )}
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
                                                {/* Checkbox Trigger for Desktop hover convenience */}
                                                <button 
                                                    onClick={() => toggleTask(task.id)}
                                                    className={`p-2 rounded-lg transition-all ${task.completed ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                    title={task.completed ? "Batalkan Selesai" : "Tandai Selesai"}
                                                >
                                                    <Check className="w-4 h-4" />
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