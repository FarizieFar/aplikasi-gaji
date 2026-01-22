
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Trash2, History, TrendingUp, Clock, FileText, Loader2, Printer, Files, Plus, X, Save, Calculator, ArrowRight, Wallet, Pencil, ArrowLeft, ChevronRight, CheckCircle2, Search, Filter, ChevronLeft, ArrowUpDown, Building2, MapPin, LayoutGrid, List } from 'lucide-react';
import { formatCurrency, WorkRecord, calculateDurationInHours, UserProfile, DEFAULT_PROFILE } from '../utils/timeUtils';
import { SalarySlip } from './SalarySlip';

interface AttendanceRecapProps {
  records: WorkRecord[];
  onDelete: (id: string) => void;
  onSaveRecord: (record: WorkRecord) => void;
  onUpdateRecord: (record: WorkRecord) => void;
  userProfile?: UserProfile; 
  onRotateEmployeeId?: () => void;
}

interface MonthlySlipData {
  startDate: string;
  endDate: string;
  totalDays: number;
  totalHours: number;
  totalWage: number;
  avgRate: string;
}

const ITEMS_PER_PAGE = 7;

export const AttendanceRecap: React.FC<AttendanceRecapProps> = ({ records, onDelete, onSaveRecord, onUpdateRecord, userProfile = DEFAULT_PROFILE, onRotateEmployeeId }) => {
  // Input Form State
  const [showInputForm, setShowInputForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [inputMode, setInputMode] = useState<'manual' | 'auto'>('auto'); 
  
  // View Mode State (List or Calendar)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Shared Input
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Auto Mode Inputs
  const [inputStartTime, setInputStartTime] = useState('08:00');
  const [inputEndTime, setInputEndTime] = useState('17:00');
  const [inputRate, setInputRate] = useState(userProfile.defaultRate);

  // Manual/Derived Inputs
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputTotalWage, setInputTotalWage] = useState('0');

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default oldest first

  // Export State
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [generatingSlipId, setGeneratingSlipId] = useState<string | null>(null);
  const [isGeneratingMonthlySlip, setIsGeneratingMonthlySlip] = useState(false);
  
  // State for rendering hidden slips
  const [tempSlipRecord, setTempSlipRecord] = useState<WorkRecord | null>(null);
  const [tempMonthlyData, setTempMonthlyData] = useState<MonthlySlipData | null>(null);

  // Update inputRate when userProfile changes
  useEffect(() => {
    if (!editingId) {
        setInputRate(userProfile.defaultRate);
    }
  }, [userProfile.defaultRate, editingId]);

  // Effect: Auto-calculate when in 'auto' OR 'manual' mode
  useEffect(() => {
    const rateVal = parseFloat(inputRate.replace(/[^0-9.]/g, '')) || 0;

    if (inputMode === 'auto') {
      const duration = calculateDurationInHours(inputStartTime, inputEndTime);
      
      const h = Math.floor(duration);
      const m = Math.round((duration - h) * 60);
      
      setInputHours(h.toString());
      setInputMinutes(m.toString());

      const total = duration * rateVal;
      setInputTotalWage(Math.floor(total).toString());
    } else {
      // Manual Mode Calculation
      const h = parseFloat(inputHours) || 0;
      const m = parseFloat(inputMinutes) || 0;
      
      const durationDecimal = h + (m / 60);
      const total = durationDecimal * rateVal;
      
      // Update total wage automatically based on inputs
      setInputTotalWage(Math.floor(total).toString());
    }
  }, [inputStartTime, inputEndTime, inputRate, inputMode, inputHours, inputMinutes]);

  // --- FILTERING & SORTING LOGIC ---
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // 1. Filter by Date Range
    if (filterStartDate) {
        result = result.filter(r => r.date >= filterStartDate);
    }
    if (filterEndDate) {
        // Add time to end date to include the full day
        const endDateTime = new Date(filterEndDate);
        endDateTime.setHours(23, 59, 59, 999);
        result = result.filter(r => new Date(r.date) <= endDateTime);
    }

    // 2. Filter by Search Query (Date string or Wage amount)
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(r => {
            const dateStr = new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toLowerCase();
            const wageStr = r.totalWage.toString();
            return dateStr.includes(query) || wageStr.includes(query);
        });
    }

    // 3. Sort
    result.sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [records, filterStartDate, filterEndDate, searchQuery, sortOrder]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredAndSortedRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredAndSortedRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedRecords, currentPage]);

  // Reset page when filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [filterStartDate, filterEndDate, searchQuery]);


  // Calculate totals (Global, not just filtered page)
  const grandTotalWage = records.reduce((acc, curr) => acc + curr.totalWage, 0);
  const grandTotalHours = records.reduce((acc, curr) => acc + curr.totalHoursDecimal, 0);

  // Helper to format hour decimal
  const formatDecimalToHM = (decimal: number) => {
    const h = Math.floor(decimal);
    const m = Math.round((decimal - h) * 60);
    return `${h} Jam ${m > 0 ? `${m} Mnt` : ''}`;
  };

  const handleEditClick = (rec: WorkRecord) => {
    setEditingId(rec.id);
    setShowInputForm(true);
    setInputDate(rec.date.split('T')[0]);

    if (rec.mode === 'range') {
        setInputMode('auto');
        setInputStartTime(rec.startTime || '08:00');
        setInputEndTime(rec.endTime || '17:00');
        setInputRate(rec.rate.toString());
    } else {
        setInputMode('manual');
        setInputHours(rec.hoursInput || '0');
        setInputMinutes(rec.minutesInput || '0');
        setInputRate(rec.rate ? rec.rate.toString() : userProfile.defaultRate);
        setInputTotalWage(rec.totalWage.toString());
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click on Calendar Day to add new record or edit existing
  const handleCalendarDayClick = (day: number) => {
      const year = calendarDate.getFullYear();
      const month = calendarDate.getMonth();
      // Format as YYYY-MM-DD manually to avoid timezone shift issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Check if records exist for this day
      const existing = records.find(r => r.date.startsWith(dateStr));
      
      if (existing) {
          handleEditClick(existing);
      } else {
          setEditingId(null);
          setInputDate(dateStr);
          setShowInputForm(true);
          handleCancelInput(false); // Reset form but keep date
          setInputDate(dateStr); // Re-set date after reset
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelInput = (shouldResetDate = true) => {
    setShowInputForm(false);
    setEditingId(null);
    if (shouldResetDate) setInputDate(new Date().toISOString().split('T')[0]);
    setInputStartTime('08:00');
    setInputEndTime('17:00');
    setInputRate(userProfile.defaultRate);
    setInputHours('0');
    setInputMinutes('0');
    setInputTotalWage('0');
    setInputMode('auto');
  };

  const handleManualSubmit = () => {
    const hoursVal = parseFloat(inputHours) || 0;
    const minutesVal = parseFloat(inputMinutes) || 0;
    const totalWageVal = parseFloat(inputTotalWage.replace(/[^0-9.]/g, '')) || 0;
    const rateVal = parseFloat(inputRate.replace(/[^0-9.]/g, '')) || 0;

    const totalHoursDecimal = hoursVal + (minutesVal / 60);

    if (totalHoursDecimal <= 0) {
      alert("Durasi kerja harus lebih dari 0.");
      return;
    }

    const finalRate = rateVal;

    const recordPayload: WorkRecord = {
      id: editingId ? editingId : Date.now().toString(), 
      date: new Date(inputDate).toISOString(),
      mode: inputMode === 'auto' ? 'range' : 'duration', 
      startTime: inputMode === 'auto' ? inputStartTime : undefined,
      endTime: inputMode === 'auto' ? inputEndTime : undefined,
      breakMinutes: '0',
      hoursInput: hoursVal.toString(),
      minutesInput: minutesVal.toString(),
      totalHoursDecimal: totalHoursDecimal,
      rate: finalRate,
      totalWage: totalWageVal
    };

    if (editingId) {
        onUpdateRecord(recordPayload);
        setToast({ show: true, message: 'Data absensi berhasil diperbarui!' });
    } else {
        onSaveRecord(recordPayload);
        setToast({ show: true, message: 'Data absensi baru berhasil disimpan!' });
    }

    setTimeout(() => {
        setToast({ show: false, message: '' });
    }, 4000);

    handleCancelInput(); 
  };

  // --- CALENDAR LOGIC ---
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const days = [];
    
    // Empty cells for days before start of month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-slate-50/30 border border-slate-100/50 rounded-xl"></div>);
    }
    
    // Day cells
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        // Find records for this day (summing up if multiple)
        const dayRecords = records.filter(r => r.date.startsWith(dateStr));
        const dayTotalHours = dayRecords.reduce((acc, r) => acc + r.totalHoursDecimal, 0);
        const dayTotalWage = dayRecords.reduce((acc, r) => acc + r.totalWage, 0);
        const hasData = dayRecords.length > 0;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();

        days.push(
            <div 
                key={i} 
                onClick={() => handleCalendarDayClick(i)}
                className={`
                    relative h-24 sm:h-32 rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer group
                    ${hasData ? 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'}
                    ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                `}
            >
                <div className="flex justify-between items-start">
                    <span className={`
                        text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                        ${hasData ? 'bg-indigo-600 text-white' : 'text-slate-400'}
                        ${isToday && !hasData ? 'bg-indigo-500 text-white' : ''}
                    `}>
                        {i}
                    </span>
                    {hasData && (
                        <div className="p-1 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                    )}
                </div>

                {hasData && (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{dayTotalHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
                            <Wallet className="w-3 h-3" />
                            <span className="text-[10px] font-bold truncate">
                                {dayTotalWage >= 1000 ? (dayTotalWage/1000).toFixed(0) + 'k' : dayTotalWage}
                            </span>
                        </div>
                    </div>
                )}
                
                {!hasData && (
                    <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-6 h-6 text-slate-300" />
                    </div>
                )}
            </div>
        );
    }

    return days;
  };

  const changeMonth = (offset: number) => {
      setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };


  const handleExportRecap = async () => {
    if (filteredAndSortedRecords.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    
    setIsGeneratingRecap(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for hidden render

    // @ts-ignore
    const html2pdf = window.html2pdf;
    // TARGET THE HIDDEN ELEMENT, NOT THE SCREEN VIEW
    const element = document.getElementById('hidden-recap-print');
    
    if (element && html2pdf) {
      const opt = {
        margin: 0, // Zero margin to control everything via CSS padding
        filename: `Laporan-Absensi-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      try {
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("PDF Generation failed", error);
        alert("Gagal membuat PDF Laporan.");
      }
    }
    setIsGeneratingRecap(false);
  };

  const handleExportMonthlySlip = async () => {
    if (records.length === 0) {
      alert("Tidak ada data untuk membuat slip bulanan.");
      return;
    }

    setIsGeneratingMonthlySlip(true);

    const filtered = filteredAndSortedRecords; // Use filtered context
    if (filtered.length === 0) return;

    const startDate = new Date(filtered[0].date); // Earliest date is first now
    const endDate = new Date(filtered[filtered.length - 1].date); // Latest date is last now
    
    const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    // Calc totals for filtered context
    const totalWageContext = filtered.reduce((acc, c) => acc + c.totalWage, 0);
    const totalHoursContext = filtered.reduce((acc, c) => acc + c.totalHoursDecimal, 0);
    const effectiveRate = totalWageContext / (totalHoursContext || 1);

    setTempMonthlyData({
      startDate: fmtDate(startDate),
      endDate: fmtDate(endDate),
      totalDays: filtered.length,
      totalHours: totalHoursContext,
      totalWage: totalWageContext,
      avgRate: Math.round(effectiveRate).toString()
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = document.getElementById('hidden-monthly-slip-print');

    if (element && html2pdf) {
      const opt = {
        margin: 0,
        filename: `Slip-Gaji-Periode-${new Date().toISOString().split('T')[0]}.pdf`,
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
        console.error("Monthly Slip PDF failed", error);
        alert("Gagal membuat Slip Bulanan.");
      }
    }

    setIsGeneratingMonthlySlip(false);
    setTempMonthlyData(null);
  };

  const handleExportSlip = async (rec: WorkRecord) => {
    setGeneratingSlipId(rec.id);
    setTempSlipRecord(rec);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    // @ts-ignore
    const html2pdf = window.html2pdf;
    const element = document.getElementById('hidden-salary-slip-print');
    
    if (element && html2pdf) {
      const opt = {
        margin: 0,
        filename: `Slip-Gaji-${new Date(rec.date).toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      try {
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("Slip PDF failed", error);
      }
    }
    
    setGeneratingSlipId(null);
    setTempSlipRecord(null);
  };

  // --- TOAST NOTIFICATION COMPONENT ---
  const ToastAlert = () => (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-100 pl-2 pr-6 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-800">Berhasil!</h4>
                <p className="text-xs font-medium text-emerald-600">{toast.message}</p>
            </div>
            <button 
                onClick={() => setToast({ show: false, message: '' })}
                className="ml-2 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    </div>
  );

  // --- VIEW: FORM INPUT ---
  if (showInputForm) {
    return (
      <div className="w-full pb-12 animate-in fade-in slide-in-from-right-4 duration-300">
         <ToastAlert />
         {/* Navigation Header */}
         <button 
            onClick={() => handleCancelInput(true)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 group font-bold text-sm"
         >
            <div className="p-2 bg-white rounded-full shadow-sm border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50">
               <ArrowLeft className="w-4 h-4" />
            </div>
            Kembali ke Daftar
         </button>

         <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 max-w-5xl mx-auto">
            {/* Form Header */}
            <div className="bg-slate-50/80 border-b border-slate-100 p-6 sm:p-8">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${editingId ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
                      {editingId ? <Pencil className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        {editingId ? 'Edit Data Absensi' : 'Input Absensi Baru'}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">Lengkapi detail di bawah ini</p>
                  </div>
               </div>
               
               {/* Mode Switcher */}
               <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mt-6 max-w-md">
                   <button
                      onClick={() => setInputMode('auto')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        inputMode === 'auto' ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-400 hover:text-slate-600'
                      }`}
                   >
                      <Clock className="w-4 h-4" /> Hitung Otomatis
                   </button>
                   <button
                      onClick={() => setInputMode('manual')}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        inputMode === 'manual' ? 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-200' : 'text-slate-400 hover:text-slate-600'
                      }`}
                   >
                      <Calculator className="w-4 h-4" /> Input Manual
                   </button>
               </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Kerja</label>
                      <input 
                        type="date" 
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                      />
                  </div>
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tarif per Jam</label>
                      <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                          <input 
                              type="number" 
                              value={inputRate}
                              onChange={(e) => setInputRate(e.target.value)}
                              className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-10 pr-4 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                          />
                      </div>
                  </div>
               </div>
               <div className="border-t border-slate-100 my-4"></div>
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-7 space-y-6">
                      {inputMode === 'auto' ? (
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Masuk</label>
                                <input 
                                    type="time" 
                                    value={inputStartTime}
                                    onChange={(e) => setInputStartTime(e.target.value)}
                                    className="w-full text-center bg-indigo-50/30 border-indigo-100 rounded-2xl p-4 font-black text-xl text-indigo-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jam Pulang</label>
                                <input 
                                    type="time" 
                                    value={inputEndTime}
                                    onChange={(e) => setInputEndTime(e.target.value)}
                                    className="w-full text-center bg-indigo-50/30 border-indigo-100 rounded-2xl p-4 font-black text-xl text-indigo-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                                />
                             </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jam</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={inputHours}
                                        onChange={(e) => setInputHours(e.target.value)}
                                        className="w-full text-center bg-amber-50/30 border-amber-100 rounded-2xl p-4 font-black text-xl text-amber-900 focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 pointer-events-none">JAM</span>
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Menit</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={inputMinutes}
                                        onChange={(e) => setInputMinutes(e.target.value)}
                                        className="w-full text-center bg-amber-50/30 border-amber-100 rounded-2xl p-4 font-black text-xl text-amber-900 focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 pointer-events-none">MNT</span>
                                </div>
                             </div>
                          </div>
                      )}
                  </div>
                  <div className="md:col-span-5">
                      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden h-full flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                          <div className="relative z-10">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ringkasan Kalkulasi</p>
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-slate-300">Durasi</span>
                                  <span className="font-mono font-bold text-xl">{inputHours}j {inputMinutes}m</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                                  <span className="text-sm text-slate-300">Rate</span>
                                  <span className="font-mono text-slate-300">{formatCurrency(parseFloat(inputRate)||0).replace(',00','')}</span>
                              </div>
                              <div className="space-y-1">
                                  <span className="text-xs text-indigo-300 font-bold uppercase">Total Estimasi</span>
                                  <div className="text-4xl font-black tracking-tight text-white">
                                      {formatCurrency(parseFloat(inputTotalWage)||0).replace(',00','')}
                                  </div>
                              </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/10">
                              <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Override Total (Optional)</label>
                              <input 
                                  type="number"
                                  value={inputTotalWage}
                                  onChange={(e) => setInputTotalWage(e.target.value)}
                                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:bg-white/20 outline-none transition-all"
                              />
                          </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Footer Action */}
            <div className="bg-slate-50 p-6 sm:p-8 flex items-center justify-end gap-4 border-t border-slate-100">
               <button 
                  onClick={() => handleCancelInput(true)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all border border-transparent hover:border-slate-200"
               >
                  Batalkan
               </button>
               <button 
                  onClick={handleManualSubmit}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all transform active:scale-95 flex items-center gap-2 ${
                      editingId ? 'bg-amber-500 shadow-amber-200 hover:bg-amber-600' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'
                  }`}
               >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Simpan Perubahan' : 'Simpan Data Baru'}
               </button>
            </div>
         </div>
      </div>
    );
  }

  // --- VIEW: LIST / CALENDAR (DEFAULT) ---
  return (
    <div className="w-full space-y-6 pb-12">
      <ToastAlert />
      
      {/* Container for Main Content */}
      <div className="space-y-6">
        
        {/* Header Statistics Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-indigo-100 border border-white relative overflow-hidden">
           {/* ... Header content ... */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-800">Rekap Absensi</h2>
                   <p className="text-sm text-slate-500">Ringkasan kinerja bulan ini</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {/* View Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Tampilan Daftar"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('calendar')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Tampilan Kalender"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>

                <button 
                  onClick={() => {
                      setEditingId(null);
                      setShowInputForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 border border-transparent transition-all flex items-center justify-center gap-2 active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Data Baru
                </button>
              </div>
           </div>

           {/* Stats Summary */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                 <div className="flex items-center gap-2 mb-2 text-indigo-100 text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" /> Total Pendapatan
                 </div>
                 <div className="text-4xl font-black tracking-tight">
                    {formatCurrency(grandTotalWage).replace(',00', '')}
                 </div>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-6 text-slate-800 shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Total Jam Kerja
                 </div>
                 <div className="text-4xl font-black tracking-tight text-slate-700">
                    {formatDecimalToHM(grandTotalHours)}
                 </div>
              </div>
           </div>
        </div>
        
        {/* --- SEARCH & FILTER TOOLBAR (List Mode Only) --- */}
        {viewMode === 'list' && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center px-3 text-slate-400">
                        <Filter className="w-4 h-4" />
                    </div>
                    <input 
                        type="date" 
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="bg-white border-0 text-xs font-bold text-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-200 shadow-sm"
                        placeholder="Mulai"
                    />
                    <span className="text-slate-300 text-xs font-bold">-</span>
                    <input 
                        type="date" 
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="bg-white border-0 text-xs font-bold text-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-200 shadow-sm"
                        placeholder="Sampai"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari tanggal atau nominal..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-300 transition-colors h-full"
                        />
                    </div>
                    <button 
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center"
                        title="Urutkan Tanggal"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Main Header (Toolbar) */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                    {viewMode === 'list' ? 'Riwayat Harian' : 'Kalender Kerja'}
                </span>
             </div>
             
             {/* Calendar Navigation */}
             {viewMode === 'calendar' && (
                 <div className="flex items-center gap-4">
                     <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                     <span className="text-sm font-bold text-slate-800">
                         {calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                     </span>
                     <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                 </div>
             )}

             <div className="flex gap-2">
                {records.length > 0 && (
                  <>
                     <button 
                        onClick={handleExportMonthlySlip}
                        disabled={isGeneratingMonthlySlip}
                        className="px-3 py-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-bold shadow-sm hover:bg-indigo-50 flex items-center gap-1.5 disabled:opacity-50"
                        title="Slip Gaji Bulanan"
                      >
                        {isGeneratingMonthlySlip ? <Loader2 className="w-3 h-3 animate-spin" /> : <Files className="w-3 h-3" />}
                        <span className="hidden sm:inline">Slip Periode</span>
                      </button>
                      
                      <button 
                        onClick={handleExportRecap}
                        disabled={isGeneratingRecap}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold shadow-sm hover:bg-indigo-100 flex items-center gap-1.5 disabled:opacity-50"
                        title="Ekspor Laporan PDF"
                      >
                        {isGeneratingRecap ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
                        <span className="hidden sm:inline">Laporan PDF</span>
                      </button>
                   </>
                )}
             </div>
          </div>

          {/* --- CONTENT BODY --- */}
          {viewMode === 'calendar' ? (
              // CALENDAR VIEW
              <div className="p-4 sm:p-6">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 mb-2">
                      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                          <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
                              {d}
                          </div>
                      ))}
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                      {renderCalendar()}
                  </div>
              </div>
          ) : (
            // LIST VIEW
            <>
              {paginatedRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-semibold text-slate-600">
                      {records.length === 0 ? "Belum ada data absensi." : "Tidak ada data yang cocok dengan filter."}
                  </p>
                  {records.length === 0 && (
                    <div className="mt-4">
                      <button 
                        onClick={() => {
                            setShowInputForm(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        Input Data Sekarang
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-4 w-12 text-center">No</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Jam Kerja</th>
                        <th className="px-6 py-4 text-center">Durasi</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRecords.map((rec, index) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-center font-bold text-slate-300">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            <div className="flex flex-col">
                              <span>{new Date(rec.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(rec.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {rec.mode === 'range' ? (
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded w-fit">{rec.startTime} - {rec.endTime}</span>
                                <span className="text-[10px] text-slate-400 mt-1">Break: {rec.breakMinutes}m</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded font-bold uppercase tracking-wide w-fit mb-1">
                                      Manual
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {rec.hoursInput}j {rec.minutesInput}m
                                  </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-slate-700">{formatDecimalToHM(rec.totalHoursDecimal)}</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono text-base">
                            {formatCurrency(rec.totalWage).replace(',00', '')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleEditClick(rec)}
                                className="p-2 rounded-lg transition-all text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                                title="Edit Data"
                              >
                                  <Pencil className="w-4 h-4" />
                              </button>

                              <button 
                                onClick={() => handleExportSlip(rec)}
                                disabled={generatingSlipId === rec.id}
                                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Download Slip Gaji PDF"
                              >
                                {generatingSlipId === rec.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => onDelete(rec.id)}
                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- HIDDEN PRINT AREAS --- */}
      
      {/* 0. NEW ATTENDANCE RECAP REPORT (Matches Salary Slip Style) */}
      <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
        <div id="hidden-recap-print" className="w-[210mm] min-h-[297mm] bg-white text-slate-800 relative mx-auto font-sans leading-normal box-border">
            
            {/* Decorative Sidebar */}
            <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-b from-slate-800 via-indigo-900 to-slate-900 print:h-full"></div>

            <div className="p-12 pl-16">
                {/* Header */}
                <div className="flex justify-between items-start mb-10 border-b pb-6 border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 size={28} strokeWidth={1.5} />
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
                    <h2 className="text-3xl font-black text-slate-200 tracking-tighter uppercase mb-1">Recap Report</h2>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider mb-1">
                            Attendance Summary
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                           {filterStartDate && filterEndDate 
                              ? `${new Date(filterStartDate).toLocaleDateString('id-ID')} - ${new Date(filterEndDate).toLocaleDateString('id-ID')}`
                              : 'All Time Records'}
                        </span>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Workdays</div>
                      <div className="text-2xl font-black text-slate-800">{filteredAndSortedRecords.length} <span className="text-xs font-bold text-slate-400">Days</span></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hours</div>
                      <div className="text-2xl font-black text-slate-800">{filteredAndSortedRecords.reduce((acc, c) => acc + c.totalHoursDecimal, 0).toFixed(1)} <span className="text-xs font-bold text-slate-400">Hrs</span></div>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-5 shadow-lg text-white">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Payout</div>
                      <div className="text-2xl font-black text-emerald-400">
                         {formatCurrency(filteredAndSortedRecords.reduce((acc, c) => acc + c.totalWage, 0)).replace(',00', '')}
                      </div>
                  </div>
                </div>

                {/* Main Table */}
                <div className="mb-10">
                   <table className="w-full text-xs text-left border-collapse table-fixed">
                      <thead>
                         <tr className="bg-slate-900 text-white uppercase tracking-wider text-[10px]">
                            <th className="p-4 rounded-tl-lg font-bold w-12 text-center">No</th>
                            <th className="p-4 font-bold w-32">Date</th>
                            <th className="p-4 font-bold w-32">Time Log</th>
                            <th className="p-4 font-bold text-center w-20">Dur.</th>
                            <th className="p-4 font-bold text-right w-24">Rate</th>
                            <th className="p-4 rounded-tr-lg font-bold text-right w-32">Total</th>
                         </tr>
                      </thead>
                      <tbody className="text-slate-600">
                         {filteredAndSortedRecords.map((rec, idx) => (
                            <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors break-inside-avoid odd:bg-white even:bg-slate-50/50">
                               <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                               <td className="p-4 font-bold text-slate-700">
                                  {new Date(rec.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                               </td>
                               <td className="p-4">
                                  {rec.mode === 'range' ? (
                                      <div>
                                          <span className="font-mono font-semibold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">{rec.startTime} - {rec.endTime}</span>
                                          {parseFloat(rec.breakMinutes) > 0 && <span className="ml-2 text-[9px] text-slate-400 font-medium">(-{rec.breakMinutes}m)</span>}
                                      </div>
                                  ) : (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wide">Manual</span>
                                  )}
                               </td>
                               <td className="p-4 text-center font-bold text-slate-700">
                                  {rec.totalHoursDecimal.toFixed(1)}h
                               </td>
                               <td className="p-4 text-right font-mono text-slate-500">
                                  {formatCurrency(rec.rate).replace(',00', '').replace('Rp', '')}
                               </td>
                               <td className="p-4 text-right font-black text-slate-800 font-mono text-sm">
                                  {formatCurrency(rec.totalWage).replace(',00', '')}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-auto break-inside-avoid border-t border-slate-100 pt-8">
                   <div className="text-[9px] text-slate-400 font-medium">
                      <p className="mb-1 font-bold text-slate-500 uppercase tracking-widest">System Generated</p>
                      <p>Date: {new Date().toLocaleString('id-ID')}</p>
                      <p>ID: {Date.now().toString(36).toUpperCase()}</p>
                   </div>
                   <div className="text-center w-56">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-16">Approved By</p>
                      <div className="border-b border-slate-300 pb-2">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{userProfile.companyName}</p>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">HR & Finance Department</p>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* 1. Daily Slip Print Area */}
      {tempSlipRecord && (
         <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
            <div className="w-[210mm] bg-white" id="hidden-salary-slip-print">
               <SalarySlip 
                  type="daily"
                  mode={tempSlipRecord.mode}
                  startTime={tempSlipRecord.startTime || '00:00'}
                  endTime={tempSlipRecord.endTime || '00:00'}
                  hours={tempSlipRecord.hoursInput || '0'}
                  minutes={tempSlipRecord.minutesInput || '0'}
                  breakMinutes={tempSlipRecord.breakMinutes}
                  totalHoursDecimal={tempSlipRecord.totalHoursDecimal}
                  rate={tempSlipRecord.rate.toString()}
                  totalWage={tempSlipRecord.totalWage}
                  isSigned={true} 
                  userProfile={userProfile}
               />
            </div>
         </div>
      )}

      {/* 2. Monthly Slip Print Area */}
      {tempMonthlyData && (
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
          <div className="w-[210mm] bg-white" id="hidden-monthly-slip-print">
            <SalarySlip 
              type="monthly"
              mode="duration" // irrelevant for monthly but required by type
              startTime={tempMonthlyData.startDate}
              endTime={tempMonthlyData.endDate}
              hours="0" 
              minutes="0" 
              breakMinutes="0"
              totalHoursDecimal={tempMonthlyData.totalHours}
              rate={tempMonthlyData.avgRate}
              totalWage={tempMonthlyData.totalWage}
              totalDays={tempMonthlyData.totalDays}
              isSigned={true}
              userProfile={userProfile}
            />
          </div>
        </div>
      )}
    </div>
  );
};