
import React, { useState, useRef, useEffect } from 'react';
import BrowserView from './components/BrowserView';
import ParentDashboard from './components/ParentDashboard';
import { Activity, ViewMode, AlertSettings, RiskLevel, AlertLog, AppTheme } from './types';

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

  // Splash Screen States
  const [splashStage, setSplashStage] = useState<'initial' | 'loading' | 'ready' | 'exit'>('initial');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing Gatura...');

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

  // Splash Screen Lifecycle
  useEffect(() => {
    const t1 = setTimeout(() => setSplashStage('loading'), 1200);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setSplashStage('ready');
      }
      setLoadingProgress(progress);
      
      if (progress < 30) setLoadingStatus('Securing connection...');
      else if (progress < 60) setLoadingStatus('Loading AI Safety protocols...');
      else if (progress < 90) setLoadingStatus('Verifying Gatura Shield...');
      else setLoadingStatus('Ready to browse.');
    }, 200);

    const t2 = setTimeout(() => {
      if (progress >= 100) setSplashStage('exit');
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
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
    setActivities(prev => [...prev, activity]);
    const riskMap = { [RiskLevel.LOW]: 0, [RiskLevel.MEDIUM]: 1, [RiskLevel.HIGH]: 2 };
    const threshold = riskMap[alertSettings.minRiskLevel];
    const currentRisk = riskMap[activity.riskLevel];

    if (currentRisk >= threshold) {
      playAlertSound(activity.riskLevel);
      const newLogs: AlertLog[] = [];
      newLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message: `Gatura Internal Alert: ${activity.riskLevel} risk detected.`,
        method: 'APP',
        riskLevel: activity.riskLevel
      });

      if (alertSettings.smsEnabled) {
        const msg = `Gatura intercepted ${activity.riskLevel} threat: "${activity.content}". Dispatching alert to ${alertSettings.phoneNumber}.`;
        newLogs.push({
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          message: msg,
          method: 'SMS',
          riskLevel: activity.riskLevel
        });
        
        // Removed visual notification from user side as per request.
        // Alerts are now silently processed and logged for the parent view only.
      }
      setAlertLogs(prev => [...prev, ...newLogs]);
    }
  };

  const triggerTestAlert = () => {
    const testLog: AlertLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message: `Gatura System Test: This is a simulated SMS alert sent from Gatura Girls Safe Browse.`,
      method: 'SMS',
      riskLevel: RiskLevel.HIGH
    };
    setAlertLogs(prev => [...prev, testLog]);
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
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-all duration-500`}>
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

      {/* SPLASH SCREEN OVERLAY */}
      {splashStage !== 'exit' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className={`absolute inset-y-0 left-0 w-1/2 bg-white z-[201] transition-transform duration-1000 ease-in-out ${splashStage === 'ready' ? 'translate-x-[-100%]' : ''}`} />
          <div className={`absolute inset-y-0 right-0 w-1/2 bg-white z-[201] transition-transform duration-1000 ease-in-out ${splashStage === 'ready' ? 'translate-x-[100%]' : ''}`} />
          
          <div className={`relative z-[202] flex flex-col items-center transition-all duration-700 ${splashStage === 'ready' ? 'scale-150 opacity-0 blur-xl' : 'scale-100 opacity-100'}`}>
            <div className={`bg-pink-600 p-8 rounded-[2.5rem] shadow-2xl mb-8 animate-spring-up pulse-glow`}>
               <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
            </div>
            <div className="text-center overflow-hidden">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 animate-text-focus">Gatura Girls</h1>
              <p className="text-lg font-bold text-pink-500 uppercase tracking-[0.4em] shimmer-text mb-8">Safe Browse</p>
            </div>

            <div className={`w-64 transition-all duration-500 ${splashStage === 'initial' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                <div 
                  className="h-full bg-pink-500 transition-all duration-300 ease-out" 
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">
                {loadingStatus}
              </p>
            </div>
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
              <span className={`text-xl font-black tracking-tight ${alertSettings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900'}`}>Gatura Girls</span>
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
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Exit Admin
              </button>
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
            <div className={`bg-white p-12 rounded-[3rem] shadow-2xl border-2 transition-all duration-300 w-full max-w-md text-center ${loginError ? 'border-red-500 animate-shake' : 'border-slate-100'}`}>
               <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-600">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-2">Parental Access</h2>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8">System Shield Encrypted</p>
               
               <form onSubmit={handleLogin} className="space-y-6">
                 <div>
                   <label className="block text-left text-[10px] font-black uppercase text-slate-400 mb-2 ml-4">Enter Parental PIN</label>
                   <input 
                    type="password" 
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-4xl tracking-[1em] py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-pink-500 focus:ring-0 transition-all font-black"
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
             <span className="flex items-center gap-1 text-slate-300">Gatura v1.0 • Secure Connection</span>
          )}
        </div>
        <div>&copy; {new Date().getFullYear()} Gatura Girls</div>
      </footer>
    </div>
  );
};

export default App;
