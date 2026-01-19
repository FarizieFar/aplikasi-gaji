import React from 'react';
import { formatCurrency, UserProfile, DEFAULT_PROFILE } from '../utils/timeUtils';
import { Building2, Calendar, User, CreditCard, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface SalarySlipProps {
  type?: 'daily' | 'monthly';
  mode: 'duration' | 'range';
  startTime: string; 
  endTime: string;
  hours: string;
  minutes: string;
  breakMinutes: string;
  totalHoursDecimal: number;
  rate: string;
  totalWage: number;
  isSigned?: boolean;
  id?: string;
  totalDays?: number;
  userProfile?: UserProfile;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({
  type = 'daily',
  mode,
  startTime,
  endTime,
  totalHoursDecimal,
  rate,
  totalWage,
  isSigned = false,
  id = "salary-slip-content",
  totalDays = 1,
  userProfile = DEFAULT_PROFILE
}) => {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Random invoice number based on date
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  const refNumber = `PAY/${currentDate.getFullYear()}/${type === 'monthly' ? 'M' : 'D'}-${randomSuffix}`;
  
  const f = (n: number) => formatCurrency(n).replace(',00', '');

  return (
    <div id={id} className="w-[210mm] bg-white text-slate-800 relative mx-auto font-sans leading-normal box-border overflow-hidden">
      
      {/* Decorative Sidebar */}
      <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600"></div>

      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-[-15deg]">
          <span className="text-[120px] font-black uppercase tracking-widest text-slate-900">Paid</span>
      </div>

      <div className="p-12 pl-16 h-full flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{userProfile.companyName}</h1>
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium uppercase tracking-wide">
                 <MapPin className="w-3 h-3" />
                 {userProfile.companyAddress}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-200 tracking-tighter uppercase mb-2">Payslip</h2>
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    {type === 'monthly' ? 'Monthly Period' : 'Daily Period'}
                </span>
                <span className="text-xs font-mono text-slate-400 font-medium">#{refNumber}</span>
            </div>
          </div>
        </div>

        {/* --- INFO CARDS --- */}
        <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Employee Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500 rounded-bl-full opacity-5"></div>
                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <User className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Employee Details</span>
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800">{userProfile.employeeName}</p>
                    <p className="text-xs text-slate-500 font-medium">{userProfile.employeeRole}</p>
                    <p className="text-[10px] font-mono text-slate-400 pt-2">ID: {userProfile.employeeId}</p>
                </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500 rounded-bl-full opacity-5"></div>
                <div className="flex items-center gap-2 mb-4 text-fuchsia-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Period Details</span>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2 border-dashed">
                        <span className="text-xs text-slate-500">Issued Date</span>
                        <span className="text-xs font-bold text-slate-700">{dateStr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Working Time</span>
                        <span className="text-xs font-bold text-slate-700 text-right">
                             {type === 'monthly' 
                                ? `${startTime} - ${endTime}` 
                                : (mode === 'range' ? `${startTime} - ${endTime}` : 'Manual Input')
                             }
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- EARNINGS TABLE --- */}
        <div className="mb-10 flex-1">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="py-4 pl-6 text-left text-[10px] font-bold uppercase tracking-widest">Description</th>
                    <th className="py-4 text-center text-[10px] font-bold uppercase tracking-widest">Hours / Qty</th>
                    <th className="py-4 text-right text-[10px] font-bold uppercase tracking-widest">Rate</th>
                    <th className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 pl-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 block text-sm">
                                    {type === 'monthly' ? 'Base Salary' : 'Standard Wages'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                {type === 'monthly' ? `Calculated based on ${totalDays} working days` : 'Based on tracked effective hours'}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="py-5 text-center font-mono text-slate-600 font-medium bg-slate-50/30">
                        {totalHoursDecimal.toFixed(2)}
                    </td>
                    <td className="py-5 text-right font-mono text-slate-600 px-4">
                        {f(parseFloat(rate) || 0)}
                    </td>
                    <td className="py-5 pr-6 text-right font-bold text-slate-900 font-mono text-base">
                        {f(totalWage)}
                    </td>
                  </tr>
                  
                  {/* Empty rows filler for visual balance */}
                  <tr>
                      <td className="py-4 pl-6 text-xs text-slate-400 font-medium">Allowances / Bonus</td>
                      <td className="py-4 text-center text-xs text-slate-300">-</td>
                      <td className="py-4 text-right text-xs text-slate-300 px-4">-</td>
                      <td className="py-4 pr-6 text-right text-xs text-slate-400 font-mono">0</td>
                  </tr>
                  <tr>
                      <td className="py-4 pl-6 text-xs text-slate-400 font-medium">Deductions</td>
                      <td className="py-4 text-center text-xs text-slate-300">-</td>
                      <td className="py-4 text-right text-xs text-slate-300 px-4">-</td>
                      <td className="py-4 pr-6 text-right text-xs text-slate-400 font-mono">0</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>

        {/* --- TOTAL & FOOTER SECTION --- */}
        <div className="flex items-end justify-between mt-auto">
            
            {/* Signature Area */}
            <div className="w-1/3">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Authorized By</p>
               <div className="h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300 relative flex items-center justify-center overflow-hidden">
                    {isSigned ? (
                       <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                            <div className="border-4 border-indigo-900/20 w-20 h-20 rounded-full absolute flex items-center justify-center">
                                <ShieldCheck className="w-10 h-10 text-indigo-900 opacity-20" />
                            </div>
                            <span className="font-black text-indigo-900 text-lg opacity-80 rotate-[-5deg] font-serif italic relative z-10">Approved</span>
                            <span className="text-[8px] font-mono text-indigo-900/50 mt-1 uppercase tracking-tight">{dateStr}</span>
                       </div>
                    ) : (
                       <span className="text-[9px] text-slate-300 italic">Digital Signature</span>
                    )}
               </div>
               <p className="text-[10px] font-bold text-slate-800 mt-2">{userProfile.companyName}</p>
               <p className="text-[9px] text-slate-400">Finance Department</p>
            </div>

            {/* Total Block */}
            <div className="w-1/2">
                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                    
                    <div className="relative z-10 flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Net Pay</span>
                        <div className="text-4xl font-black tracking-tight mb-2">
                             <span className="text-base text-slate-400 font-medium mr-2">IDR</span>
                             {f(totalWage)}
                        </div>
                        <div className="h-px w-full bg-white/10 mb-3"></div>
                        <p className="text-[9px] text-slate-400 text-right leading-tight max-w-[200px]">
                            *This payment includes all allowances and deductions applicable for the current period.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-medium">
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> finance@{userProfile.companyName.toLowerCase().replace(/\s/g, '')}.com</span>
                <span>•</span>
                <span>Generated by TimeMaster App</span>
            </div>
            <span>CONFIDENTIAL DOCUMENT</span>
        </div>

      </div>
    </div>
  );
};