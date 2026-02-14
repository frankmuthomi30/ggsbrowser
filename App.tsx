
import React, { useState, useRef, useEffect } from 'react';
import BrowserView from './components/BrowserView';
import ParentDashboard from './components/ParentDashboard';
import { Activity, ViewMode, AlertSettings, RiskLevel, AlertLog, AppTheme } from './types';
import { db, logActivity, logAlert } from './services/firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('browser');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'alert' } | null>(null);
  
  const PARENT_PIN = "1234";

  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    minRiskLevel: RiskLevel.MEDIUM,
    soundEnabled: true,
    smsEnabled: true,
    phoneNumber: '+1 555-0199',
    theme: 'standard'
  });
  
  const clickTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Apply theme to body
  useEffect(() => {
    document.body.className = `theme-${alertSettings.theme} text-slate-900 transition-colors duration-500`;
  }, [alertSettings.theme]);

  // Firebase Listeners
  useEffect(() => {
    const activitiesQuery = query(ref(db, 'gatura/activities'), limitToLast(50));
    const unsubscribeActivities = onValue(activitiesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setActivities(Object.values(data));
      }
    });

    const alertsQuery = query(ref(db, 'gatura/alerts'), limitToLast(50));
    const unsubscribeAlerts = onValue(alertsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAlertLogs(Object.values(data));
      }
    });

    return () => {
      unsubscribeActivities();
      unsubscribeAlerts();
    };
  }, []);

  const showNotification = (message: string, type: 'info' | 'alert' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const playAlertSound = (risk: RiskLevel) => {
    if (!alertSettings.soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = risk === RiskLevel.HIGH ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(risk === RiskLevel.HIGH ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  const handleNewActivity = (activity: Activity) => {
    // Log to Firebase instead of local state directly (the listener will update the UI)
    logActivity(activity);

    const riskMap = { [RiskLevel.LOW]: 0, [RiskLevel.MEDIUM]: 1, [RiskLevel.HIGH]: 2 };
    const threshold = riskMap[alertSettings.minRiskLevel];
    const currentRisk = riskMap[activity.riskLevel];

    if (currentRisk >= threshold) {
      playAlertSound(activity.riskLevel);
      
      const internalAlert: AlertLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: `Miest Internal Alert: ${activity.riskLevel} risk detected.`,
        method: 'APP',
        riskLevel: activity.riskLevel
      };
      
      // Log alert to Firebase
      logAlert(internalAlert);

      if (alertSettings.smsEnabled) {
        const msg = `Miest intercepted ${activity.riskLevel} threat: "${activity.content}". Dispatching alert to ${alertSettings.phoneNumber}.`;
        
        const smsAlert: AlertLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          message: msg,
          method: 'SMS',
          riskLevel: activity.riskLevel
        };
        logAlert(smsAlert);
        
        // Removed visual notification from user side as per request.
        // Alerts are now silently processed and logged for the parent view only.
      }
      // setAlertLogs is handled by the useEffect listener now
    }
  };

  const handleClearSession = () => {
    // Privacy-First: Wipe session "identity" but keep logs for safety
    // In a real implementation this would clear cookies/local storage logic related to user profiling
    setActivities([]);
    setViewMode('browser');
    showNotification("Session Identity Wiped", 'info');
  };

  const triggerTestAlert = () => {
    const testLog: AlertLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message: `Miest System Test: This is a simulated SMS alert sent from Miest Safe Browse.`,
      method: 'SMS',
      riskLevel: RiskLevel.HIGH
    };
    logAlert(testLog);
    playAlertSound(RiskLevel.HIGH);
    // This is explicitly triggered in the Admin section, so showing feedback here is appropriate.
    showNotification(`Test SMS Sent to ${alertSettings.phoneNumber}`, 'info');
  };

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
    if (newCount >= 5) {
      if (viewMode === 'browser') {
        setViewMode('parent');
        setIsAuthenticated(false);
      } else {
        setViewMode('browser');
      }
      setClickCount(0);
    } else {
      clickTimeoutRef.current = window.setTimeout(() => setClickCount(0), 2000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === PARENT_PIN) {
      setIsAuthenticated(true);
      setLoginError(false);
      setPinInput('');
    } else {
      setLoginError(true);
      setPinInput('');
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode('browser');
  };

  const handleUpdateTheme = (theme: AppTheme) => {
    setAlertSettings(prev => ({ ...prev, theme }));
  };

  const navClass = alertSettings.theme === 'glass-dark' 
    ? 'bg-slate-900/80 backdrop-blur border-b border-slate-700 text-white' 
    : 'bg-white/80 backdrop-blur border-b border-slate-200';

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-all duration-500 ${alertSettings.theme === 'glass-dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Visual Notification Banner */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4 animate-in slide-in-from-top-12 duration-300">
          <div className={`${notification.type === 'alert' ? 'bg-red-600' : 'bg-slate-900'} text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-lg`}>
            <div className={`p-2 rounded-full ${notification.type === 'alert' ? 'bg-white text-red-600 animate-pulse' : 'bg-pink-500 text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-black uppercase tracking-widest">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <nav className={`${navClass} px-6 py-4 sticky top-0 z-[100] transition-all`}>
        <div className={`${viewMode === 'browser' ? 'w-full px-2' : 'max-w-7xl mx-auto'} flex justify-between items-center transition-all duration-500`}>
          <div className="flex items-center gap-3 cursor-pointer select-none active:opacity-70 transition-opacity" onClick={handleLogoClick}>
            <div className={`${viewMode === 'browser' ? (alertSettings.theme === 'glass-dark' ? 'bg-pink-600' : 'bg-slate-800') : 'bg-pink-600'} p-2 rounded-lg shadow-sm transition-colors`}>
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight ${alertSettings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900'}`}>Miest Safe Browse</span>
              {viewMode === 'parent' && (
                <>
                  <span className="ml-1 text-xs font-bold text-pink-500 uppercase">Safe Browse</span>
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">Monitor</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {viewMode === 'parent' && (
              <div className="flex gap-2">
                <button 
                  onClick={handleClearSession}
                  className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition shadow-sm active:scale-95"
                >
                  Wipe Integrity
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Exit Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={`flex-1 w-full ${viewMode === 'browser' ? 'p-0' : 'max-w-7xl mx-auto p-6'} transition-all duration-500`}>
        {viewMode === 'browser' ? (
          <div className="h-[calc(100vh-108px)] animate-in fade-in duration-500">
             <BrowserView onActivity={handleNewActivity} theme={alertSettings.theme} onUpdateTheme={handleUpdateTheme} />
          </div>
        ) : !isAuthenticated ? (
          <div className="flex items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
            <div className={`p-12 rounded-[3rem] shadow-2xl border-2 transition-all duration-300 w-full max-w-md text-center 
              ${alertSettings.theme === 'glass-dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-100'}
              ${loginError ? 'border-red-500 animate-shake' : ''}
            `}>
               <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-600">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               </div>
               <h2 className={`text-3xl font-black mb-2 ${alertSettings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900'}`}>Parental Access</h2>
               <p className={`text-sm font-bold uppercase tracking-widest mb-8 ${alertSettings.theme === 'glass-dark' ? 'text-slate-400' : 'text-slate-500'}`}>System Shield Encrypted</p>
               
               <form onSubmit={handleLogin} className="space-y-6">
                 <div>
                   <label className={`block text-left text-[10px] font-black uppercase mb-2 ml-4 ${alertSettings.theme === 'glass-dark' ? 'text-slate-400' : 'text-slate-400'}`}>Enter Parental PIN</label>
                   <input 
                    type="password" 
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className={`w-full text-center text-4xl tracking-[1em] py-6 border-2 rounded-3xl focus:border-pink-500 focus:ring-0 transition-all font-black
                       ${alertSettings.theme === 'glass-dark' ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-700' : 'bg-slate-50 border-slate-100 text-slate-900'}
                    `}
                    autoFocus
                   />
                 </div>
                 <button 
                  type="submit"
                  className="w-full py-5 bg-pink-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-100 hover:bg-pink-700 active:scale-95 transition-all"
                 >
                   Verify Identity
                 </button>
               </form>
               
               <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase">Hint: Try 1234 for demo access</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ParentDashboard 
              activities={activities} 
              alertLogs={alertLogs}
              settings={alertSettings}
              onUpdateSettings={setAlertSettings}
              onTriggerTestAlert={triggerTestAlert}
              onReturnToBrowser={() => setViewMode('browser')}
            />
          </div>
        )}
      </main>

      <footer className={`${alertSettings.theme === 'glass-dark' ? 'bg-slate-900/50 text-slate-400 border-slate-700' : 'bg-white/50 text-slate-400 border-slate-200'} border-t py-3 px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest transition-all`}>
        <div className="flex gap-6">
          {viewMode === 'parent' && isAuthenticated ? (
            <>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> System: Protected</span>
              <span className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${alertSettings.smsEnabled ? 'bg-pink-500' : 'bg-slate-300'}`}></div> SMS Alerts: {alertSettings.smsEnabled ? 'Live' : 'Off'}</span>
            </>
          ) : (
             <span className="flex items-center gap-1 text-slate-300">Miest v2.4 • Secure Connection</span>
          )}
        </div>
        <div>&copy; {new Date().getFullYear()} Miest Safe Browse</div>
      </footer>
    </div>
  );
};

export default App;
