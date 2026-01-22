
import React from 'react';
import { WorkRecord, formatCurrency } from '../utils/timeUtils';
import { TrendingUp, Clock, Wallet, Activity, PieChart as PieIcon, CalendarRange } from 'lucide-react';

interface DashboardProps {
  records: WorkRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {

  // 1. Calculate Summary Stats
  const totalWage = records.reduce((acc, curr) => acc + curr.totalWage, 0);
  const totalHours = records.reduce((acc, curr) => acc + curr.totalHoursDecimal, 0);
  const totalDays = records.length;
  const avgWage = totalDays > 0 ? totalWage / totalDays : 0;

  // 2. Prepare Data for Weekly Bar Chart (Last 7 entries)
  // Sort by date ascending
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const last7 = sortedRecords.slice(-7);
  
  const maxWage = Math.max(...last7.map(r => r.totalWage), 1); // Avoid div by zero

  // 3. Prepare Data for "Work vs Break" (Simplified Pie Concept)
  let totalBreakMinutes = 0;
  records.forEach(r => {
     if (r.mode === 'range') {
        totalBreakMinutes += parseFloat(r.breakMinutes) || 0;
     }
  });
  const totalBreakHours = totalBreakMinutes / 60;
  // Pie chart segments
  const totalTime = totalHours + totalBreakHours;
  const workPercentage = totalTime > 0 ? (totalHours / totalTime) * 100 : 100;

  if (records.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[2.5rem] shadow-sm border border-slate-200 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Activity className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Belum ada data analitik</h3>
            <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                Dashboard ini akan menampilkan grafik performa, total pendapatan, dan statistik jam kerja Anda setelah Anda mulai memasukkan data.
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 w-full">
      {/* --- Top Stats Cards (Full Width Grid) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
           <div className="absolute right-[-20px] top-[-20px] bg-emerald-50 w-32 h-32 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                 <div className="p-1.5 bg-emerald-100 rounded-lg"><Wallet className="w-4 h-4" /></div>
                 <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                 {formatCurrency(totalWage).replace(',00', '')}
              </div>
           </div>
           <div className="relative z-10 mt-auto flex items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Semua Waktu</span>
              <TrendingUp className="w-3 h-3 text-emerald-500" />
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
           <div className="absolute right-[-20px] top-[-20px] bg-blue-50 w-32 h-32 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                 <div className="p-1.5 bg-blue-100 rounded-lg"><Clock className="w-4 h-4" /></div>
                 <span className="text-xs font-bold uppercase tracking-wider">Total Jam Kerja</span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                 {totalHours.toFixed(1)} <span className="text-lg font-bold text-slate-400">Jam</span>
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{totalDays} Hari Kerja</span>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
           <div className="absolute right-[-20px] top-[-20px] bg-amber-50 w-32 h-32 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                 <div className="p-1.5 bg-amber-100 rounded-lg"><Activity className="w-4 h-4" /></div>
                 <span className="text-xs font-bold uppercase tracking-wider">Rata-rata / Hari</span>
              </div>
              <div className="text-3xl font-black text-slate-800 tracking-tight">
                 {formatCurrency(avgWage).replace(',00', '')}
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Produktivitas</span>
           </div>
        </div>
        
        {/* Card 4 (New) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
           <div className="absolute right-[-20px] top-[-20px] bg-indigo-50 w-32 h-32 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                 <div className="p-1.5 bg-indigo-100 rounded-lg"><CalendarRange className="w-4 h-4" /></div>
                 <span className="text-xs font-bold uppercase tracking-wider">Entri Terakhir</span>
              </div>
              <div className="text-xl font-bold text-slate-700 tracking-tight leading-tight">
                 {last7.length > 0 
                    ? new Date(last7[last7.length-1].date).toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'short'}) 
                    : '-'}
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Status Aktif</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Income History */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <Activity className="w-5 h-5 text-indigo-500" /> Grafik Pendapatan
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Visualisasi pendapatan 7 entri terakhir</p>
                </div>
             </div>
             
             {/* CSS Bar Chart */}
             <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-100 pb-2">
                {last7.map((item, index) => {
                    const heightPercent = (item.totalWage / maxWage) * 100;
                    const dayName = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });
                    const dateNum = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric' });
                    
                    return (
                        <div key={item.id} className="flex-1 flex flex-col items-center group h-full justify-end">
                            <div className="w-full relative flex items-end justify-center h-full">
                                <div 
                                    className="w-full max-w-[60px] bg-indigo-500 rounded-t-xl transition-all duration-500 ease-out group-hover:bg-indigo-600 relative group-hover:shadow-lg group-hover:shadow-indigo-200"
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 whitespace-nowrap z-10 pointer-events-none font-bold shadow-xl">
                                        {formatCurrency(item.totalWage).replace(',00','')}
                                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-3 text-center leading-tight">
                                {dayName}<br/>
                                <span className="text-[10px] font-medium opacity-70 text-slate-500">{dateNum}</span>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>

          {/* Secondary Chart: Productivity Pie */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 flex flex-col">
             <div className="mb-8">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <PieIcon className="w-5 h-5 text-fuchsia-500" /> Proporsi Waktu
                 </h3>
                 <p className="text-xs text-slate-400 font-medium">Rasio Kerja vs Istirahat</p>
             </div>

             <div className="flex-1 flex items-center justify-center relative">
                 {/* CSS Pie Chart using Conic Gradient */}
                 <div 
                    className="w-48 h-48 rounded-full shadow-inner relative flex items-center justify-center transition-all duration-1000 bg-slate-100"
                    style={{
                        background: `conic-gradient(#8b5cf6 0% ${workPercentage}%, #f1f5f9 ${workPercentage}% 100%)`
                    }}
                 >
                     <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-sm border border-slate-100">
                         <span className="text-4xl font-black text-violet-600 tracking-tight">{Math.round(workPercentage)}%</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Efisiensi</span>
                     </div>
                 </div>
             </div>

             <div className="mt-8 space-y-4">
                 <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm shadow-violet-300"></div>
                         <span className="font-bold text-slate-700">Waktu Kerja</span>
                     </div>
                     <span className="font-bold text-slate-800 font-mono">{totalHours.toFixed(1)}h</span>
                 </div>
                 <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                         <span className="font-bold text-slate-500">Istirahat</span>
                     </div>
                     <span className="font-bold text-slate-500 font-mono">{totalBreakHours.toFixed(1)}h</span>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
