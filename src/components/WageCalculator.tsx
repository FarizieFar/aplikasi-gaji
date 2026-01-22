
import React, { useState, useEffect } from 'react';
import { Wallet, Download, Loader2, Eye, EyeOff, PenTool, Clock, Coffee, Coins, ArrowRight, Save, X } from 'lucide-react';
import { formatCurrency, calculateDurationInHours, WorkRecord, UserProfile, DEFAULT_PROFILE } from '../utils/timeUtils';
import { SalarySlip } from './SalarySlip';

interface WageCalculatorProps {
  onSaveRecord: (record: WorkRecord) => void;
  onCancel?: () => void;
  userProfile?: UserProfile; 
  onRotateEmployeeId?: () => void; // New Prop
}

export const WageCalculator: React.FC<WageCalculatorProps> = ({ onSaveRecord, onCancel, userProfile = DEFAULT_PROFILE, onRotateEmployeeId }) => {
  const [mode, setMode] = useState<'duration' | 'range'>('range');
  
  // Range Mode State
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [breakMinutes, setBreakMinutes] = useState<string>('60'); 
  
  // Duration Mode State
  const [hours, setHours] = useState<string>('8');
  const [minutes, setMinutes] = useState<string>('0');
  
  // Shared State
  const [rate, setRate] = useState<string>(userProfile.defaultRate);
  const [totalWage, setTotalWage] = useState<number>(0);
  const [totalHoursDecimal, setTotalHoursDecimal] = useState<number>(0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isSigned, setIsSigned] = useState(false);

  // Update rate if profile changes
  useEffect(() => {
    setRate(userProfile.defaultRate);
  }, [userProfile.defaultRate]);

  const handleModeChange = (newMode: 'duration' | 'range') => {
    if (newMode === 'duration' && mode === 'range') {
      const rawDuration = calculateDurationInHours(startTime, endTime);
      const breakDed = (parseFloat(breakMinutes) || 0) / 60;
      const effectiveHours = Math.max(0, rawDuration - breakDed);
      const h = Math.floor(effectiveHours);
      const m = Math.round((effectiveHours - h) * 60);
      setHours(h.toString());
      setMinutes(m.toString());
    }
    setMode(newMode);
  };

  useEffect(() => {
    let calculatedHours = 0;
    if (mode === 'range') {
      const rawDuration = calculateDurationInHours(startTime, endTime);
      const breakDed = (parseFloat(breakMinutes) || 0) / 60;
      calculatedHours = Math.max(0, rawDuration - breakDed);
    } else {
      calculatedHours = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;
    }
    setTotalHoursDecimal(calculatedHours);
    const rateVal = parseFloat(rate.replace(/[^0-9.]/g, '')) || 0;
    setTotalWage(calculatedHours * rateVal);
  }, [mode, startTime, endTime, breakMinutes, hours, minutes, rate]);

  const handleSaveClick = () => {
    if (totalHoursDecimal <= 0) {
      alert("Durasi kerja harus lebih dari 0 untuk disimpan.");
      return;
    }

    const newRecord: WorkRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mode,
      startTime: mode === 'range' ? startTime : undefined,
      endTime: mode === 'range' ? endTime : undefined,
      breakMinutes,
      hoursInput: mode === 'duration' ? hours : undefined,
      minutesInput: mode === 'duration' ? minutes : undefined,
      totalHoursDecimal,
      rate: parseFloat(rate) || 0,
      totalWage
    };

    onSaveRecord(newRecord);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const wasPreviewHidden = !showPreview;
    if (wasPreviewHidden) setShowPreview(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = document.getElementById('salary-slip-export');
    
    if (element && html2pdf) {
      const opt = {
        margin: 0,
        filename: `Slip-Gaji-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      try {
        await html2pdf().set(opt).from(element).save();
        
        // --- ROTATE ID TRIGGER ---
        if (onRotateEmployeeId) {
            onRotateEmployeeId();
        }

      } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Gagal membuat PDF.");
      }
    }
    setIsGenerating(false);
  };

  // Helper to format hour decimal to HH:MM string for display
  const formatDecimalToHM = (decimal: number) => {
    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    return `${h} Jam ${m > 0 ? `${m} Mnt` : ''}`;
  };

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* --- SECTION 1: INPUT CARD --- */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 relative max-w-5xl mx-auto">
        {onCancel && (
            <button 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                title="Batal / Kembali"
            >
                <X className="w-5 h-5" />
            </button>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Parameter Gaji</h2>
          </div>
          
          <div className="bg-slate-100 p-1 rounded-lg flex w-full sm:w-auto">
            <button
              onClick={() => handleModeChange('range')}
              className={`flex-1 sm:flex-none py-1.5 px-4 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === 'range' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Jam Kerja
            </button>
            <button
              onClick={() => handleModeChange('duration')}
              className={`flex-1 sm:flex-none py-1.5 px-4 rounded-md text-xs font-bold transition-all duration-200 ${
                mode === 'duration' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Input Manual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Time Inputs (Span 8 cols) */}
          <div className="md:col-span-8 space-y-4">
             {mode === 'range' ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mulai</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Selesai</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Istirahat (Mnt)</label>
                    <input
                      type="number"
                      min="0"
                      value={breakMinutes}
                      onChange={(e) => setBreakMinutes(e.target.value)}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jam</label>
                     <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Menit</label>
                     <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full bg-slate-50 border-slate-200 rounded-xl p-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-violet-500 transition-all text-sm" />
                  </div>
                </div>
             )}
          </div>

          {/* Rate Input (Span 4 cols) */}
          <div className="md:col-span-4 space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tarif per Jam</label>
             <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                <input
                  type="number"
                  step="500"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold text-lg text-slate-800 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                />
             </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: RESULT DASHBOARD (Colored & Friendly) --- */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-emerald-900/10 border border-emerald-100 overflow-hidden max-w-5xl mx-auto">
         {/* Top: Main Result with Color */}
         <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 pb-6 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-emerald-50 text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/20">
               Estimasi Hari Ini
            </span>
            <div className="flex items-center justify-center text-5xl sm:text-7xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
               <span className="text-2xl sm:text-3xl text-emerald-200 font-bold mr-2 self-start mt-2 sm:mt-4">Rp</span>
               {formatCurrency(totalWage).replace('Rp', '').replace(',00', '')}
            </div>
            
            {/* Visual Formula */}
            <div className="inline-flex items-center gap-2 text-sm text-emerald-100 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 mt-2">
               <span className="font-semibold">{totalHoursDecimal.toFixed(2)} Jam</span>
               <ArrowRight className="w-3 h-3 text-emerald-200" />
               <span className="font-semibold">{formatCurrency(parseFloat(rate)||0).replace(',00','')} /jam</span>
            </div>
         </div>

         {/* Middle: Details Grid */}
         <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
            <div className="p-4 sm:p-6 text-center group hover:bg-slate-50 transition-colors">
               <div className="flex justify-center mb-2 text-emerald-500"><Clock className="w-5 h-5" /></div>
               <div className="text-xs text-slate-400 font-bold uppercase">Durasi</div>
               <div className="text-lg font-bold text-slate-700">{formatDecimalToHM(totalHoursDecimal)}</div>
            </div>
            <div className="p-4 sm:p-6 text-center group hover:bg-slate-50 transition-colors">
               <div className="flex justify-center mb-2 text-amber-500"><Coffee className="w-5 h-5" /></div>
               <div className="text-xs text-slate-400 font-bold uppercase">Istirahat</div>
               <div className="text-lg font-bold text-slate-700">{mode === 'range' ? breakMinutes : '0'} <span className="text-xs font-medium text-slate-400">Mnt</span></div>
            </div>
            <div className="p-4 sm:p-6 text-center group hover:bg-slate-50 transition-colors">
               <div className="flex justify-center mb-2 text-blue-500"><Coins className="w-5 h-5" /></div>
               <div className="text-xs text-slate-400 font-bold uppercase">Rate</div>
               <div className="text-lg font-bold text-slate-700 truncate px-2">{parseInt(rate) >= 1000 ? parseInt(rate)/1000 + 'k' : rate}</div>
            </div>
         </div>

         {/* Bottom: Actions */}
         <div className="p-4 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-center items-center">
             <button 
               onClick={handleSaveClick}
               className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 transform active:scale-95"
             >
               <Save className="w-4 h-4" />
               Simpan ke Rekap
             </button>

             {onCancel && (
               <button 
                  onClick={onCancel}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
               >
                  <X className="w-4 h-4" />
                  Batal
               </button>
             )}

             <button 
               onClick={() => setShowPreview(!showPreview)}
               className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
             >
               {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               {showPreview ? 'Tutup Preview' : 'Preview Slip'}
             </button>

             <button 
               onClick={handleDownloadPDF}
               disabled={isGenerating}
               className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none transform active:scale-95"
             >
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               PDF
             </button>
         </div>
      </div>

      {/* --- PREVIEW SECTION --- */}
      {showPreview && (
        <div className="bg-slate-200/50 p-6 rounded-[2rem] border border-slate-200 overflow-hidden max-w-5xl mx-auto">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                 <Eye className="w-4 h-4" /> Document Preview
              </h3>
              
              <div className="flex gap-3 items-center">
                <button 
                   onClick={() => setIsSigned(!isSigned)}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                      isSigned ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                   }`}
                 >
                   <PenTool className="w-3 h-3" />
                   {isSigned ? 'Tertanda' : 'Tanda Tangan'}
                 </button>
                 <span className="text-[10px] font-mono bg-white px-2 py-1.5 rounded text-slate-400 border border-slate-200">A4 Portrait</span>
              </div>
           </div>
           
           <div className="overflow-x-auto pb-2 custom-scrollbar">
             <div className="min-w-fit mx-auto shadow-2xl rounded-sm ring-1 ring-slate-900/5">
                <SalarySlip 
                  id="salary-slip-export"
                  type="daily"
                  mode={mode}
                  startTime={startTime}
                  endTime={endTime}
                  hours={hours}
                  minutes={minutes}
                  breakMinutes={breakMinutes}
                  totalHoursDecimal={totalHoursDecimal}
                  rate={rate}
                  totalWage={totalWage}
                  isSigned={isSigned}
                  userProfile={userProfile}
                />
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
