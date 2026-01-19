import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, AlertTriangle } from 'lucide-react';
import { UserProfile, WorkRecord, formatCurrency, toTotalSeconds, fromTotalSeconds } from '../utils/timeUtils';

interface LiveTrackerProps {
  userProfile: UserProfile;
  onSaveRecord: (record: WorkRecord) => void;
}

const STORAGE_KEY_SESSION = 'timemaster_live_session';

export const LiveTracker: React.FC<LiveTrackerProps> = ({ userProfile, onSaveRecord }) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentWage, setCurrentWage] = useState(0);

  // Load active session from storage
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      setStartTime(sessionData.start);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any;

    if (startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diffSeconds = Math.floor((now - startTime) / 1000);
        setElapsed(diffSeconds);

        // Calculate real-time wage
        const hoursDecimal = diffSeconds / 3600;
        const rate = parseFloat(userProfile.defaultRate) || 0;
        setCurrentWage(hoursDecimal * rate);
      }, 1000);
    } else {
      setElapsed(0);
      setCurrentWage(0);
    }

    return () => clearInterval(interval);
  }, [startTime, userProfile.defaultRate]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ start: now }));
  };

  const handleStop = () => {
    if (!startTime) return;

    if (window.confirm("Selesaikan sesi kerja sekarang?")) {
      const endTimeMs = Date.now();
      const startTimeMs = startTime;
      
      const startObj = new Date(startTimeMs);
      const endObj = new Date(endTimeMs);

      const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const totalHoursDecimal = (endTimeMs - startTimeMs) / (1000 * 60 * 60);
      const rateVal = parseFloat(userProfile.defaultRate) || 0;
      const totalWageVal = totalHoursDecimal * rateVal;

      const newRecord: WorkRecord = {
        id: Date.now().toString(),
        date: startObj.toISOString(),
        mode: 'range',
        startTime: formatTime(startObj),
        endTime: formatTime(endObj),
        breakMinutes: '0',
        hoursInput: '0',
        minutesInput: '0',
        totalHoursDecimal: totalHoursDecimal,
        rate: rateVal,
        totalWage: totalWageVal
      };

      onSaveRecord(newRecord);

      // Reset
      setStartTime(null);
      setElapsed(0);
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  };

  const timeParts = fromTotalSeconds(elapsed);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className={`rounded-[2.5rem] p-8 sm:p-12 transition-all duration-500 shadow-2xl relative overflow-hidden border-4 ${startTime ? 'bg-slate-900 border-indigo-500 shadow-indigo-500/20' : 'bg-white border-white shadow-slate-200'}`}>
        
        {/* Animated Background Blob for Active State */}
        {startTime && (
           <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
           </>
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
            
            <div className={`mb-6 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${startTime ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/50 animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
               {startTime ? '• Tracking Active •' : 'Ready to work'}
            </div>

            {/* Timer Display */}
            <div className={`font-mono font-black text-6xl sm:text-7xl mb-2 tracking-tighter ${startTime ? 'text-white' : 'text-slate-800'}`}>
                <span>{String(timeParts.hours).padStart(2, '0')}</span>
                <span className={`mx-1 ${startTime ? 'text-slate-600' : 'text-slate-200'}`}>:</span>
                <span>{String(timeParts.minutes).padStart(2, '0')}</span>
                <span className={`mx-1 ${startTime ? 'text-slate-600' : 'text-slate-200'}`}>:</span>
                <span>{String(timeParts.seconds).padStart(2, '0')}</span>
            </div>
            
            <div className={`text-sm font-bold uppercase tracking-widest mb-10 ${startTime ? 'text-slate-400' : 'text-slate-300'}`}>
                Durasi Kerja
            </div>

            {/* Earnings Display (Live) */}
            {startTime && (
                <div className="mb-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10">
                    <div className="text-xs text-indigo-300 font-bold uppercase mb-1">Estimasi Pendapatan</div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {formatCurrency(currentWage).replace(',00', '')}
                    </div>
                </div>
            )}

            {/* Controls */}
            {!startTime ? (
                <button 
                    onClick={handleStart}
                    className="group relative w-24 h-24 flex items-center justify-center bg-indigo-600 rounded-full shadow-xl shadow-indigo-300 hover:scale-110 hover:bg-indigo-500 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:animate-ping"></div>
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                </button>
            ) : (
                <button 
                    onClick={handleStop}
                    className="w-24 h-24 flex items-center justify-center bg-rose-500 rounded-full shadow-xl shadow-rose-900/20 hover:scale-110 hover:bg-rose-400 transition-all duration-300 ring-4 ring-rose-900/20"
                >
                    <Square className="w-8 h-8 text-white fill-current" />
                </button>
            )}
            
            <p className={`mt-8 text-xs font-medium max-w-xs ${startTime ? 'text-slate-400' : 'text-slate-400'}`}>
                {startTime 
                    ? `Dimulai pada ${new Date(startTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}. Jangan lupa matikan timer sebelum menutup tab.` 
                    : "Tekan tombol Play untuk mulai menghitung jam kerja Anda secara real-time."}
            </p>

            {startTime && (
                <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-500 bg-amber-900/20 px-3 py-1 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Data disimpan otomatis di browser
                </div>
            )}
        </div>
      </div>
    </div>
  );
};