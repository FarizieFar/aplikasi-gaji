import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Building2, Briefcase, MapPin, BadgeCheck, RotateCcw, Download, Upload, AlertCircle, Database, Lock, RefreshCw, Hash } from 'lucide-react';
import { UserProfile, DEFAULT_PROFILE, WorkRecord, generateEmployeeId } from '../utils/timeUtils';
import { AlertDialog, AlertType } from './ui/AlertDialog';

interface SettingsProps {
  currentProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onImportData: (data: { profile: UserProfile, records: WorkRecord[] }) => void;
  currentRecords: WorkRecord[];
}

export const Settings: React.FC<SettingsProps> = ({ currentProfile, onSave, onImportData, currentRecords }) => {
  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Alert State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const showAlert = (type: AlertType, title: string, description: string, onConfirm: () => void) => {
      setAlertConfig({ isOpen: true, type, title, description, onConfirm });
  };

  const closeAlert = () => {
      setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    // Initialize ID if empty or default
    if (!currentProfile.employeeId || currentProfile.employeeId === 'TM-001') {
        setFormData(prev => ({ ...prev, employeeId: generateEmployeeId() }));
    } else {
        setFormData(currentProfile);
    }
  }, [currentProfile]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleRegenerateId = () => {
      const newId = generateEmployeeId();
      handleChange('employeeId', newId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetRequest = () => {
    showAlert(
        'warning',
        'Reset Pengaturan?',
        'Tindakan ini akan mengembalikan profil ke pengaturan awal. Data absensi tidak akan dihapus.',
        () => {
            setFormData(DEFAULT_PROFILE);
            onSave(DEFAULT_PROFILE);
            closeAlert();
        }
    );
  };

  const handleExportBackup = () => {
    const backupData = {
      profile: formData,
      records: currentRecords,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `timemaster_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Simple validation
        if (parsedData.profile && Array.isArray(parsedData.records)) {
          const backupDate = new Date(parsedData.exportDate).toLocaleDateString();
          
          showAlert(
              'danger',
              'Timpa Data?',
              `Backup tanggal ${backupDate} ditemukan. Melanjutkan proses ini akan MENIMPA seluruh data Anda saat ini secara permanen.`,
              () => {
                  onImportData({
                    profile: parsedData.profile,
                    records: parsedData.records
                  });
                  closeAlert();
              }
          );
        } else {
          alert("Format file backup tidak valid.");
        }
      } catch (error) {
        console.error(error);
        alert("Gagal membaca file backup.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <AlertDialog 
         isOpen={alertConfig.isOpen}
         type={alertConfig.type}
         title={alertConfig.title}
         description={alertConfig.description}
         onConfirm={alertConfig.onConfirm}
         onCancel={closeAlert}
      />

      <div className="flex items-center justify-between mb-2">
         <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h2>
            <p className="text-slate-500 text-sm">Kelola profil dan preferensi aplikasi</p>
         </div>
         <button 
            onClick={handleResetRequest}
            className="text-xs text-slate-400 hover:text-red-500 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
         >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
         </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Karyawan Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Identitas Personal</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={formData.employeeName}
                        onChange={(e) => handleChange('employeeName', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                        placeholder="Nama Karyawan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Jabatan / Role</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formData.employeeRole}
                          onChange={(e) => handleChange('employeeRole', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                          placeholder="Contoh: Staff Admin"
                        />
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      ID Karyawan (Sistem)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                        type="text"
                        value={formData.employeeId}
                        readOnly
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 font-mono text-sm font-bold text-slate-600 shadow-sm cursor-not-allowed select-all"
                        />
                    </div>
                    <button
                        type="button" 
                        onClick={handleRegenerateId}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-lg shadow-sm transition-all active:scale-95"
                        title="Generate ID Baru"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                      ID ini unik dan digenerate otomatis. Klik tombol refresh untuk membuat ID baru jika diperlukan.
                  </p>
                </div>
              </div>
            </div>

            {/* Perusahaan Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Entitas Perusahaan</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Nama Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    placeholder="PT. Nama Perusahaan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Alamat Kantor</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.companyAddress}
                      onChange={(e) => handleChange('companyAddress', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                      placeholder="Kota, Negara"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Default Rate / Jam</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">Rp</span>
                            <input
                                type="number"
                                required
                                value={formData.defaultRate}
                                onChange={(e) => handleChange('defaultRate', e.target.value)}
                                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl pl-9 pr-3 py-2.5 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Target Bulanan</label>
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-xs">Rp</span>
                            <input
                                type="number"
                                value={formData.monthlyTarget || ''}
                                onChange={(e) => handleChange('monthlyTarget', e.target.value)}
                                className="w-full bg-orange-50/50 border border-orange-100 rounded-xl pl-9 pr-3 py-2.5 font-bold text-orange-700 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <button
                type="submit"
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all transform active:scale-[0.98] duration-200 ${
                    isSaved 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-slate-900 text-white shadow-slate-300 hover:bg-slate-800'
                }`}
            >
                {isSaved ? <BadgeCheck className="w-5 h-5 animate-bounce" /> : <Save className="w-5 h-5" />}
                {isSaved ? 'Berhasil Disimpan' : 'Simpan Perubahan'}
            </button>
        </div>

        {/* Right Column: Backup/Restore */}
        <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden h-full">
               {/* Background Decor */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                          <Database className="w-5 h-5 text-indigo-300" />
                      </div>
                      <h3 className="font-bold">Data Management</h3>
                  </div>

                  <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                      Aplikasi ini berjalan tanpa server (offline-first). Seluruh data tersimpan di browser Anda. Lakukan backup berkala agar data tidak hilang saat clear cache.
                  </p>

                  <div className="space-y-4 mt-auto">
                      <button 
                          onClick={handleExportBackup}
                          type="button"
                          className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-indigo-100 font-bold text-xs flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
                      >
                          <Download className="w-4 h-4" /> Download JSON Backup
                      </button>

                      <div className="relative">
                           <input 
                              type="file" 
                              accept=".json" 
                              ref={fileInputRef}
                              onChange={handleImportBackup}
                              className="hidden" 
                           />
                           <button 
                              onClick={() => fileInputRef.current?.click()}
                              type="button"
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/50"
                           >
                               <Upload className="w-4 h-4" /> Restore from File
                           </button>
                      </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500">
                          Restore data akan menimpa seluruh data yang ada saat ini. Pastikan file backup valid.
                      </p>
                  </div>
               </div>
            </div>
        </div>
      </form>
    </div>
  );
};