
import React, { useState, useEffect } from 'react';
import { Clock, Timer, Zap, CalendarDays, Wallet, LogOut, UserCircle, Settings as SettingsIcon, LayoutDashboard, Coins, Briefcase, ClipboardList, ShoppingBag } from 'lucide-react';
import { TimeAdder } from './components/TimeAdder';
import { DurationCalculator } from './components/DurationCalculator';
import { WageCalculator } from './components/WageCalculator';
import { AttendanceRecap } from './components/AttendanceRecap';
import { LoginScreen } from './components/LoginScreen';
import { Settings } from './components/Settings';
import { FinanceTracker } from './components/FinanceTracker';
import { Dashboard } from './components/Dashboard';
import { DailyJournal } from './components/DailyJournal';
import { WishlistManager } from './components/WishlistManager';
import { WorkRecord, UserProfile, DEFAULT_PROFILE, generateEmployeeId } from './utils/timeUtils';
import { AlertDialog, AlertType } from './components/ui/AlertDialog';

enum Tab {
  DASHBOARD = 'dashboard',
  RECAP = 'recap',
  JOURNAL = 'journal',
  FINANCE = 'finance',
  WISHLIST = 'wishlist',
  SALARY = 'salary',
  ADDER = 'adder',
  DURATION = 'duration',
  SETTINGS = 'settings'
}

const STORAGE_KEY_RECORDS = 'timemaster_records';
const STORAGE_KEY_USER = 'timemaster_user';
const STORAGE_KEY_PROFILE = 'timemaster_profile';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  
  // App State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Alert Dialog State
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (
    type: AlertType, 
    title: string, 
    description: string, 
    onConfirm: () => void,
    confirmLabel?: string
  ) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
      confirmLabel
    });
  };

  // 1. Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // 2. Load records and profile from storage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecords) {
        try {
          setRecords(JSON.parse(savedRecords));
        } catch (e) {
          console.error("Failed to parse records", e);
        }
      }

      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        try {
            setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
            console.error("Failed to parse profile", e);
        }
      }
    }
  }, [isAuthenticated]);

  // 3. Save records to storage whenever they change (if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    }
  }, [records, isAuthenticated]);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    localStorage.setItem(STORAGE_KEY_USER, username);
  };

  const handleLogoutRequest = () => {
    showAlert(
        'danger',
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar dari sesi ini? Data Anda tetap aman tersimpan.',
        () => {
            setIsAuthenticated(false);
            setCurrentUser('');
            localStorage.removeItem(STORAGE_KEY_USER);
        },
        'Ya, Keluar'
    );
  };

  const handleSaveRecord = (record: WorkRecord) => {
    setRecords(prev => [record, ...prev]);
    
    if (activeTab === Tab.SALARY) {
        showAlert(
            'success',
            'Data Tersimpan!',
            'Data gaji berhasil ditambahkan ke Rekap Absensi.',
            () => setActiveTab(Tab.RECAP),
            'Lihat Rekap'
        );
    }
  };

  const handleUpdateRecord = (updatedRecord: WorkRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    showAlert('success', 'Berhasil', 'Data absensi berhasil diperbarui.', () => {}, 'Tutup');
  };

  const handleDeleteRecord = (id: string) => {
    showAlert(
        'danger',
        'Hapus Data?',
        'Tindakan ini tidak dapat dibatalkan. Data absensi ini akan dihapus permanen dari penyimpanan browser.',
        () => {
             setRecords(prev => prev.filter(r => r.id !== id));
        },
        'Ya, Hapus'
    );
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  };

  // Logic to rotate employee ID
  const handleRotateEmployeeId = () => {
    const newId = generateEmployeeId();
    const updatedProfile = { ...userProfile, employeeId: newId };
    setUserProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
    console.log("Employee ID Rotated to:", newId);
  };

  const handleImportData = (data: { profile: UserProfile, records: WorkRecord[] }) => {
     setUserProfile(data.profile);
     setRecords(data.records);
     localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(data.profile));
     localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(data.records));
     showAlert('success', 'Restore Berhasil', 'Data profil dan riwayat absensi berhasil dipulihkan dari backup.', () => {}, 'OK');
  };

  const tabs = [
    { id: Tab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Tab.RECAP, label: 'Rekap', icon: CalendarDays },
    { id: Tab.JOURNAL, label: 'Aktivitas', icon: ClipboardList },
    { id: Tab.FINANCE, label: 'Keuangan', icon: Coins },
    { id: Tab.WISHLIST, label: 'Wishlist', icon: ShoppingBag },
    { id: Tab.SALARY, label: 'Gaji', icon: Wallet },
    { id: Tab.ADDER, label: 'Waktu', icon: Clock },
    { id: Tab.DURATION, label: 'Durasi', icon: Timer },
    { id: Tab.SETTINGS, label: 'Setting', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard records={records} />;
      case Tab.ADDER:
        return <TimeAdder />;
      case Tab.DURATION:
        return <DurationCalculator />;
      case Tab.SALARY:
        return (
            <WageCalculator 
                onSaveRecord={handleSaveRecord} 
                userProfile={userProfile} 
                onRotateEmployeeId={handleRotateEmployeeId} 
            />
        );
      case Tab.RECAP:
        return (
            <AttendanceRecap 
                records={records} 
                onDelete={handleDeleteRecord} 
                onSaveRecord={handleSaveRecord} 
                onUpdateRecord={handleUpdateRecord} 
                userProfile={userProfile}
                onRotateEmployeeId={handleRotateEmployeeId} 
            />
        );
      case Tab.JOURNAL:
        return <DailyJournal />;
      case Tab.WISHLIST:
        return <WishlistManager />;
      case Tab.SETTINGS:
        return <Settings currentProfile={userProfile} onSave={handleSaveProfile} onImportData={handleImportData} currentRecords={records} />;
      case Tab.FINANCE:
        return <FinanceTracker userProfile={userProfile} />;
      default:
        return <Dashboard records={records} />;
    }
  };

  // If not authenticated, show Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-x-hidden text-slate-800 font-sans">
      {/* Background Decor - More subtle and professional */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[80px]"></div>
      </div>

      {/* Global Alert Dialog */}
      <AlertDialog 
         isOpen={alertConfig.isOpen}
         type={alertConfig.type}
         title={alertConfig.title}
         description={alertConfig.description}
         onConfirm={alertConfig.onConfirm}
         onCancel={closeAlert}
         confirmLabel={alertConfig.confirmLabel}
      />

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pt-2 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl shadow-slate-200">
                        <Zap className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        TimeMaster
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">Pro</span>
                        <p className="text-slate-500 font-medium text-xs">Utility Suite</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 items-center w-full md:w-auto justify-end">
              {/* User Profile */}
              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
                      <span className="font-bold text-xs">{userProfile.employeeName.charAt(0)}</span>
                  </div>
                  <div className="flex flex-col hidden sm:flex">
                      <span className="text-xs font-bold text-slate-800 leading-tight">{userProfile.employeeName.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{userProfile.employeeRole || 'User'}</span>
                  </div>
              </div>
              
               <button 
                  onClick={handleLogoutRequest}
                  className="h-10 w-10 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-full flex items-center justify-center transition-all shadow-sm group"
                  title="Keluar"
              >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
        </div>

        {/* --- MODERN FLOATING NAVIGATION --- */}
        <div className="sticky top-4 z-40 mb-8 mx-auto max-w-full">
            <nav className="relative bg-white/70 backdrop-blur-2xl border border-white/50 p-1.5 rounded-[2rem] shadow-xl shadow-slate-200/40 ring-1 ring-white/60">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 px-1 snap-x [&::-webkit-scrollbar]:hidden">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`
                                    relative flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-[1.5rem] text-xs font-bold transition-all duration-300 snap-center
                                    ${isActive 
                                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30 scale-105 ring-2 ring-white ring-opacity-50' 
                                        : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'}
                                `}
                            >
                                <Icon 
                                    className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 rotate-0' : 'group-hover:scale-105'}`} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="tracking-wide whitespace-nowrap">{tab.label}</span>
                                
                                {tab.id === Tab.RECAP && records.length > 0 && (
                                    <span className={`absolute top-2 right-2 flex h-2 w-2 ${isActive ? 'bg-white' : 'bg-rose-500'} rounded-full animate-pulse`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-12">
          <div className="transition-all duration-500 ease-out">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-200/60 mt-auto">
          <p className="text-xs text-slate-400 font-medium">
             &copy; {new Date().getFullYear()} {userProfile.companyName || 'TimeMaster'}. Local-First Architecture.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
