import React, { useState, useEffect } from 'react';
import { ArrowRight, Timer, Moon, Sun } from 'lucide-react';

export const DurationCalculator: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [duration, setDuration] = useState<{ h: number, m: number }>({ h: 8, m: 0 });
  const [isNextDay, setIsNextDay] = useState(false);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;

    let nextDay = false;
    if (endTotal < startTotal) {
      endTotal += 24 * 60;
      nextDay = true;
    }

    const diff = endTotal - startTotal;
    const h = Math.floor(diff / 60);
    const m = diff % 60;

    setDuration({ h, m });
    setIsNextDay(nextDay);
  }, [startTime, endTime]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-white transition-colors">
        <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Hitung Durasi</h2>
              <p className="text-sm text-slate-500 font-medium">Selisih antara dua waktu</p>
            </div>
          </div>

          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-[50%] top-4 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Start Input */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Waktu Mulai
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-3xl font-bold text-slate-800 bg-transparent border-0 border-b-2 border-slate-200 focus:border-violet-500 px-0 py-2 transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* End Input */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Waktu Selesai
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-3xl font-bold text-slate-800 bg-transparent border-0 border-b-2 border-slate-200 focus:border-violet-500 px-0 py-2 transition-colors cursor-pointer"
                  />
                  {isNextDay && (
                    <span className="absolute top-2 right-0 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                      +1 HARI
                    </span>
                  )}
                </div>
              </div>
            </div>

             {/* Arrow for Mobile */}
             <div className="flex md:hidden justify-center -my-4 relative z-20">
                <div className="bg-slate-100 p-2 rounded-full border-4 border-white text-slate-400">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
             </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">TOTAL DURASI</h3>
          
          <div className="flex items-baseline justify-center gap-1 sm:gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-6xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {duration.h}
              </span>
              <span className="text-sm font-bold text-slate-500 uppercase mt-2">Jam</span>
            </div>
            <span className="text-4xl sm:text-6xl font-thin text-slate-700 mx-2">:</span>
            <div className="flex flex-col">
              <span className="text-6xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {duration.m}
              </span>
              <span className="text-sm font-bold text-slate-500 uppercase mt-2">Menit</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-slate-400 text-sm font-medium border border-slate-700/50">
             <span>Desimal:</span>
             <span className="text-white font-bold">{(duration.h + duration.m / 60).toFixed(2)} jam</span>
          </div>
        </div>
      </div>
    </div>
  );
};