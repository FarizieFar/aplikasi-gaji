
import React, { useState, useEffect } from 'react';
import { Clock, Timer, Zap, CalendarDays, Wallet, LogOut, UserCircle, Settings as SettingsIcon, LayoutDashboard, Coins, Briefcase, ClipboardList, ShoppingBag, Menu } from 'lucide-react';
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
import { UserAccount, getUserStorageKey } from './utils/auth';

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

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // App State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const sessionStr = localStorage.getItem('timemaster_active_session');
    if (sessionStr) {
      try {
        const user = JSON.parse(sessionStr);
        setCurrentUser(user);
      } catch (e) {
        localStorage.removeItem('timemaster_active_session');
      }
    }
  }, []);

  // 2. Load records and profile SPECIFIC TO USER
  useEffect(() => {
    if (currentUser) {
      // Keys are now like: tm_user_abc123_records
      const keyRecords = getUserStorageKey(currentUser.id, 'records');
      const keyProfile = getUserStorageKey(currentUser.id, 'profile');

      const savedRecords = localStorage.getItem(keyRecords);
      if (savedRecords) {
        try {
          setRecords(JSON.parse(savedRecords));
        } catch (e) {
          console.error("Failed to parse records", e);
          setRecords([]);
        }
      } else {
          setRecords([]); // Reset if new user
      }

      const savedProfile = localStorage.getItem(keyProfile);
      if (savedProfile) {
        try {
            setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
            console.error("Failed to parse profile", e);
        }
      } else {
        // Init default profile for new user but customize name
        setUserProfile({
            ...DEFAULT_PROFILE,
            employeeName: currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1),
            employeeId: generateEmployeeId()
        });
      }
    }
  }, [currentUser]);

  // 3. Save records to USER SPECIFIC STORAGE
  useEffect(() => {
    if (currentUser) {
      const keyRecords = getUserStorageKey(currentUser.id, 'records');
      localStorage.setItem(keyRecords, JSON.stringify(records));
    }
  }, [records, currentUser]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('timemaster_active_session', JSON.stringify(user));
  };

  const handleLogoutRequest = () => {
    showAlert(
        'danger',
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar? Data Anda tersimpan aman di akun ini.',
        () => {
            setCurrentUser(null);
            localStorage.removeItem('timemaster_active_session');
            setRecords([]); // Clear memory
            setUserProfile(DEFAULT_PROFILE); // Reset profile in memory
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
        'Tindakan ini tidak dapat dibatalkan.',
        () => {
             setRecords(prev => prev.filter(r => r.id !== id));
        },
        'Ya, Hapus'
    );
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    if (currentUser) {
        const keyProfile = getUserStorageKey(currentUser.id, 'profile');
        localStorage.setItem(keyProfile, JSON.stringify(profile));
    }
  };

  // Logic to rotate employee ID
  const handleRotateEmployeeId = () => {
    const newId = generateEmployeeId();
    const updatedProfile = { ...userProfile, employeeId: newId };
    handleSaveProfile(updatedProfile);
    console.log("Employee ID Rotated to:", newId);
  };

  const handleImportData = (data: { profile: UserProfile, records: WorkRecord[] }) => {
     setUserProfile(data.profile);
     setRecords(data.records);
     if (currentUser) {
        const keyProfile = getUserStorageKey(currentUser.id, 'profile');
        const keyRecords = getUserStorageKey(currentUser.id, 'records');
        localStorage.setItem(keyProfile, JSON.stringify(data.profile));
        localStorage.setItem(keyRecords, JSON.stringify(data.records));
     }
     showAlert('success', 'Restore Berhasil', 'Data berhasil dipulihkan.', () => {}, 'OK');
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
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-sans flex flex-col">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[80px]"></div>
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

      {/* --- FULL WIDTH STICKY HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
              
              {/* Logo Section */}
              <div className="flex items-center gap-3 min-w-fit">
                  <div className="relative">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                          <Zap className="w-5 h-5 text-yellow-400" fill="currentColor" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="hidden sm:block">
                      <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                          TimeMaster
                      </h1>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">Ent</span>
                         <span className="text-xs text-slate-400 font-medium">Workspace</span>
                      </div>
                  </div>
              </div>

              {/* Desktop Navigation (Center) */}
              <nav className="hidden xl:flex items-center justify-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/60">
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
                                  relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300
                                  ${isActive 
                                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 scale-[1.02]' 
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}
                              `}
                          >
                              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                              <span>{tab.label}</span>
                              {tab.id === Tab.RECAP && records.length > 0 && (
                                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                              )}
                          </button>
                      );
                  })}
              </nav>

              {/* Right Side: Profile & Mobile Menu */}
              <div className="flex items-center gap-3 min-w-fit justify-end">
                  
                  {/* User Profile Pill */}
                  <div className="hidden md:flex items-center gap-3 bg-white pl-1 pr-4 py-1 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default">
                      <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
                          <span className="font-bold text-xs">{userProfile.employeeName.charAt(0)}</span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 leading-tight">{userProfile.employeeName}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{userProfile.employeeRole || 'User'}</span>
                      </div>
                  </div>

                  <button 
                      onClick={handleLogoutRequest}
                      className="h-10 w-10 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-full flex items-center justify-center transition-all shadow-sm"
                      title="Keluar"
                  >
                      <LogOut className="w-4 h-4" />
                  </button>

                  {/* Mobile Menu Toggle */}
                  <button 
                    className="xl:hidden h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Menu className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
              <div className="xl:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-2 p-4">
                      {tabs.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                              <button
                                  key={tab.id}
                                  onClick={() => {
                                      setActiveTab(tab.id);
                                      setMobileMenuOpen(false);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className={`
                                      flex flex-col items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all
                                      ${isActive ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'bg-slate-50 text-slate-500'}
                                  `}
                              >
                                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                  {tab.label}
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}
      </header>

      {/* --- MAIN FLUID CONTAINER --- */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-500 ease-out">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-auto">
         <div className="max-w-[1920px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} <span className="text-slate-600 font-bold">{userProfile.companyName || 'TimeMaster Corp'}</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Support</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
