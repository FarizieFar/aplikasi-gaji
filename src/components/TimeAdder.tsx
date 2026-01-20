import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { toTotalSeconds, fromTotalSeconds, TimeParts } from '../utils/timeUtils';

export const TimeAdder: React.FC = () => {
  const [rows, setRows] = useState<TimeParts[]>([{ hours: 0, minutes: 0, seconds: 0 }]);
  const [total, setTotal] = useState<TimeParts>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const totalSecs = rows.reduce((acc, row) => {
      return acc + toTotalSeconds(row.hours || 0, row.minutes || 0, row.seconds || 0);
    }, 0);
    setTotal(fromTotalSeconds(totalSecs));
  }, [rows]);

  const addRow = () => {
    setRows([...rows, { hours: 0, minutes: 0, seconds: 0 }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows.length ? newRows : [{ hours: 0, minutes: 0, seconds: 0 }]);
  };

  const updateRow = (index: number, field: keyof TimeParts, value: string) => {
    const val = parseInt(value) || 0;
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: val };
    setRows(newRows);
  };

  const reset = () => {
    setRows([{ hours: 0, minutes: 0, seconds: 0 }]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Result Card */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-1 shadow-lg shadow-violet-200">
        <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6 text-center text-white border border-white/20">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wide mb-3 uppercase">Total Waktu</span>
          <div className="flex items-center justify-center gap-2 text-5xl sm:text-6xl font-black tracking-tight mb-2 font-mono">
            <span>{String(total.hours).padStart(2, '0')}</span>
            <span className="text-violet-200/50 text-4xl">:</span>
            <span>{String(total.minutes).padStart(2, '0')}</span>
            <span className="text-violet-200/50 text-4xl">:</span>
            <span>{String(total.seconds).padStart(2, '0')}</span>
          </div>
          <p className="text-violet-100 text-sm font-medium opacity-90">
            {total.hours} Jam, {total.minutes} Menit, {total.seconds} Detik
          </p>
        </div>
      </div>

      {/* Input List */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-white transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-500" />
            Daftar Waktu
          </h2>
          <button onClick={reset} className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="space-y-4">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Jam</div>
            <div className="col-span-3">Menit</div>
            <div className="col-span-3">Detik</div>
            <div className="col-span-3"></div>
          </div>
          
          {rows.map((row, index) => (
            <div key={index} className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-violet-100 rounded-2xl p-3 sm:p-2 transition-all duration-200 hover:shadow-md">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Labels for Mobile */}
                <div className="sm:col-span-3">
                  <label className="block sm:hidden text-xs font-bold text-slate-400 mb-1 ml-1">Jam</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.hours || ''}
                    onChange={(e) => updateRow(index, 'hours', e.target.value)}
                    className="w-full bg-white text-slate-800 font-semibold p-3 sm:py-2 rounded-xl border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 transition-all text-center"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block sm:hidden text-xs font-bold text-slate-400 mb-1 ml-1">Menit</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.minutes || ''}
                    onChange={(e) => updateRow(index, 'minutes', e.target.value)}
                    className="w-full bg-white text-slate-800 font-semibold p-3 sm:py-2 rounded-xl border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 transition-all text-center"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block sm:hidden text-xs font-bold text-slate-400 mb-1 ml-1">Detik</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.seconds || ''}
                    onChange={(e) => updateRow(index, 'seconds', e.target.value)}
                    className="w-full bg-white text-slate-800 font-semibold p-3 sm:py-2 rounded-xl border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 transition-all text-center"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addRow} 
          className="mt-6 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 group"
        >
          <div className="bg-slate-200 text-slate-500 group-hover:bg-violet-600 group-hover:text-white rounded-full p-1 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          Tambah Baris Waktu
        </button>
      </div>
    </div>
  );
};