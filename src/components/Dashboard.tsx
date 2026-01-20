import React from 'react';
import { WorkRecord, formatCurrency } from '../utils/timeUtils';
import { TrendingUp, Clock, Wallet, Activity, PieChart as PieIcon } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Belum ada data analitik</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Mulai masukkan data absensi atau gaji untuk melihat grafik performa Anda.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
           <div className="absolute right-[-20px] top-[-20px] bg-emerald-50 w-24 h-24 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                 <Wallet className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
              </div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                 {formatCurrency(totalWage).replace(',00', '')}
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Semua Waktu</span>
           </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
           <div className="absolute right-[-20px] top-[-20px] bg-blue-50 w-24 h-24 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                 <Clock className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Total Jam Kerja</span>
              </div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                 {totalHours.toFixed(1)} <span className="text-sm font-medium text-slate-400">Jam</span>
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{totalDays} Hari Kerja</span>
           </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
           <div className="absolute right-[-20px] top-[-20px] bg-amber-50 w-24 h-24 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                 <TrendingUp className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Rata-rata / Hari</span>
              </div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">
                 {formatCurrency(avgWage).replace(',00', '')}
              </div>
           </div>
           <div className="relative z-10 mt-auto">
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Produktivitas</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Income History */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Grafik Pendapatan
                    </h3>
                    <p className="text-xs text-slate-400">7 Entri Terakhir</p>
                </div>
             </div>
             
             {/* CSS Bar Chart */}
             <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-100 pb-2">
                {last7.map((item, index) => {
                    const heightPercent = (item.totalWage / maxWage) * 100;
                    const dayName = new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' });
                    const dateNum = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric' });
                    
                    return (
                        <div key={item.id} className="flex-1 flex flex-col items-center group">
                            <div className="w-full relative flex items-end justify-center h-full">
                                <div 
                                    className="w-full max-w-[40px] bg-indigo-500 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-indigo-600 relative"
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-bold shadow-lg">
                                        {formatCurrency(item.totalWage).replace(',00','')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-2 text-center leading-tight">
                                {dayName}<br/>
                                <span className="text-[9px] font-medium opacity-70">{dateNum}</span>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>

          {/* Secondary Chart: Productivity Pie */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col">
             <div className="mb-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-fuchsia-500" /> Proporsi Waktu
                 </h3>
                 <p className="text-xs text-slate-400">Kerja vs Istirahat</p>
             </div>

             <div className="flex-1 flex items-center justify-center relative">
                 {/* CSS Pie Chart using Conic Gradient */}
                 <div 
                    className="w-40 h-40 rounded-full shadow-inner relative flex items-center justify-center transition-all duration-1000"
                    style={{
                        background: `conic-gradient(#8b5cf6 0% ${workPercentage}%, #e2e8f0 ${workPercentage}% 100%)`
                    }}
                 >
                     <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-sm">
                         <span className="text-3xl font-black text-violet-600">{Math.round(workPercentage)}%</span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kerja</span>
                     </div>
                 </div>
             </div>

             <div className="mt-6 space-y-3">
                 <div className="flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                         <span className="font-medium text-slate-600">Kerja</span>
                     </div>
                     <span className="font-bold text-slate-800">{totalHours.toFixed(1)}h</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                         <span className="font-medium text-slate-600">Istirahat</span>
                     </div>
                     <span className="font-bold text-slate-800">{totalBreakHours.toFixed(1)}h</span>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};