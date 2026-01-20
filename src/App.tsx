import React, { useState, useEffect } from 'react';
import { Clock, Timer, Zap, CalendarDays, Wallet, LogOut, UserCircle, Settings as SettingsIcon, PlayCircle, LayoutDashboard, Moon, Sun, Globe } from 'lucide-react';
import { TimeAdder } from './components/TimeAdder';
import { DurationCalculator } from './components/DurationCalculator';
import { WageCalculator } from './components/WageCalculator';
import { AttendanceRecap } from './components/AttendanceRecap';
import { LoginScreen } from './components/LoginScreen';
import { Settings } from './components/Settings';
import { LiveTracker } from './components/LiveTracker';
import { Dashboard } from './components/Dashboard';
import { WorkRecord, UserProfile, DEFAULT_PROFILE, generateEmployeeId } from './utils/timeUtils';
import { AlertDialog, AlertType } from './components/ui/AlertDialog';
import { useThemeLanguage } from './contexts/ThemeLanguageContext';

enum Tab {
  DASHBOARD = 'dashboard',
  RECAP = 'recap',
  LIVE = 'live',
  SALARY = 'salary',
  ADDER = 'adder',
  DURATION = 'duration',
  SETTINGS = 'settings'
}

const STORAGE_KEY_RECORDS = 'timemaster_records';
const STORAGE_KEY_USER = 'timemaster_user';
const STORAGE_KEY_PROFILE = 'timemaster_profile';

const App: React.FC = () => {
  // Context for Theme & Lang
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();

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
        t('logout_confirm_title'),
        t('logout_confirm_desc'),
        () => {
            setIsAuthenticated(false);
            setCurrentUser('');
            localStorage.removeItem(STORAGE_KEY_USER);
        },
        t('logout_btn')
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
    } else if (activeTab === Tab.LIVE) {
        showAlert(
            'success',
            'Sesi Selesai!',
            'Waktu kerja berhasil direkam. Anda dapat melihat detailnya di halaman Rekap.',
            () => setActiveTab(Tab.RECAP),
            'OK'
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
    { id: Tab.DASHBOARD, label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: Tab.RECAP, label: t('nav_recap'), icon: CalendarDays },
    { id: Tab.LIVE, label: t('nav_live'), icon: PlayCircle },
    { id: Tab.SALARY, label: t('nav_salary'), icon: Wallet },
    { id: Tab.ADDER, label: t('nav_adder'), icon: Clock },
    { id: Tab.DURATION, label: t('nav_duration'), icon: Timer },
    { id: Tab.SETTINGS, label: t('nav_settings'), icon: SettingsIcon },
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
      case Tab.SETTINGS:
        return <Settings currentProfile={userProfile} onSave={handleSaveProfile} onImportData={handleImportData} currentRecords={records} />;
      case Tab.LIVE:
        return <LiveTracker userProfile={userProfile} onSaveRecord={handleSaveRecord} />;
      default:
        return <Dashboard records={records} />;
    }
  };

  // If not authenticated, show Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-100 to-transparent dark:from-indigo-950/30 -z-10 transition-colors duration-300"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-fuchsia-200 dark:bg-fuchsia-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

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

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 pt-2 gap-4">
            <div className="text-center md:text-left flex items-center gap-4">
                <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-violet-100 dark:shadow-none transition-colors">
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white p-2 rounded-xl">
                    <Zap className="w-6 h-6" fill="currentColor" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-none">
                        Time<span className="text-violet-600 dark:text-violet-400">Master</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">Professional Utility</p>
                </div>
            </div>

            <div className="flex gap-3 items-center">
              
              {/* Theme & Language Toggles */}
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1 rounded-full border border-white/50 dark:border-slate-700 shadow-sm">
                 <button 
                   onClick={toggleTheme}
                   className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                   title="Toggle Theme"
                 >
                   {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                 </button>
                 <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                 <button 
                   onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                   title="Switch Language"
                 >
                   <Globe className="w-3 h-3" />
                   {language.toUpperCase()}
                 </button>
              </div>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1.5 rounded-full border border-white/50 dark:border-slate-700 shadow-sm">
                  <div className="pl-3 pr-2 flex flex-col items-end hidden sm:flex">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('logged_in_as')}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{userProfile.employeeName.split(' ')[0] || currentUser}</span>
                  </div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 overflow-hidden">
                      <UserCircle className="w-full h-full text-slate-400 dark:text-slate-500" />
                  </div>
                  <button 
                      onClick={handleLogoutRequest}
                      className="h-8 w-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full flex items-center justify-center transition-all"
                      title="Keluar"
                  >
                      <LogOut className="w-4 h-4" />
                  </button>
              </div>
            </div>
        </div>

        {/* Navigation Pills (Sticky & Scrollable) */}
        <div className="sticky top-0 z-30 pt-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#F8FAFC]/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-transparent transition-colors duration-300">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex items-center overflow-x-auto no-scrollbar gap-1 md:justify-center md:max-w-fit md:mx-auto">
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
                    relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex-shrink-0
                    ${isActive 
                      ? 'bg-slate-800 dark:bg-violet-600 text-white shadow-md shadow-slate-300 dark:shadow-violet-900/20 ring-1 ring-slate-900/5 scale-[1.02]' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-300 dark:text-violet-200' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  
                  {/* Notification Badge for Recap */}
                  {tab.id === Tab.RECAP && records.length > 0 && (
                     <span className="absolute top-2 right-2 flex h-2 w-2">
                        {isActive ? (
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-slate-800"></span>
                        ) : (
                             <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                             </>
                        )}
                     </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <main className="flex-1 w-full pb-12">
          <div className="transition-all duration-300 ease-in-out">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-slate-200/60 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} {userProfile.companyName || 'TimeMaster'}. {t('footer_text')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;