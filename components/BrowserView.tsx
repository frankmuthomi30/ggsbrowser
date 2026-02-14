
import React, { useState, useEffect } from 'react';
import { analyzeContent } from '../services/geminiService';
import { Activity, RiskLevel, RiskAssessment, AppTheme, SophisticationLevel } from '../types';

interface BrowserViewProps {
  onActivity: (activity: Activity) => void;
  theme: AppTheme;
  onUpdateTheme: (theme: AppTheme) => void;
}

const BrowserView: React.FC<BrowserViewProps> = ({ onActivity, theme, onUpdateTheme }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [url, setUrl] = useState('https://www.google.com');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4500); 
    return () => clearTimeout(timer);
  }, []);

  const [loading, setLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(null);
  const [errorState, setErrorState] = useState<{title: string, msg: string} | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Working on it...');

  const isDarkMode = theme === 'glass-dark';
  const headerBg = isDarkMode ? 'bg-black/20 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md';
  const headerBorder = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const loadingMessages = [
    'Connecting to secure servers...',
    'Checking content safety...',
    'Analyzing reliability...',
    'Almost ready...'
  ];

  const quickLinks = [
    { name: 'Pinterest', icon: '📌', url: 'pinterest.com' },
    { name: 'Wikipedia', icon: '📖', url: 'wikipedia.org' },
    { name: 'YouTube', icon: '📺', url: 'youtube.com' },
    { name: 'Duolingo', icon: '🦉', url: 'duolingo.com' },
    { name: 'Canva', icon: '🎨', url: 'canva.com' },
    { name: 'BBC News', icon: '🌐', url: 'bbc.com' },
    { name: 'Roblox', icon: '🎮', url: 'roblox.com' },
    { name: 'Add', icon: '➕', url: 'add' },
  ];

  const newsTiles = [
    { type: 'weather', title: 'Local Weather', icon: '⛅', value: '24°C', detail: 'Clouds, Nairobi' },
    { type: 'stocks', title: 'Markets', icon: '📈', value: 'NSE 20 ▲ 0.5%', detail: 'Trending Up' },
    { type: 'news', title: 'Featured', icon: '📰', value: 'Nairobi Tech Week', detail: 'Innovation Hub' },
    { type: 'sport', title: 'Sports', icon: '⚽', value: 'Harambee Stars', detail: 'Match Day' }
  ];

  useEffect(() => {
    let interval: number;
    if (loading) {
      let i = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = window.setInterval(() => {
        i++;
        if (i < loadingMessages.length) {
          setLoadingMessage(loadingMessages[i]);
        }
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleNavigation = async (input: string, type: 'search' | 'visit') => {
    if (!input.trim()) return;
    setLoading(true);
    setErrorState(null);
    const assessment: RiskAssessment = await analyzeContent(input);
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: type,
      content: input,
      riskLevel: assessment.riskLevel,
      sophistication: assessment.sophistication,
      status: assessment.isSafe ? 'allowed' : 'blocked',
      reason: assessment.reason
    };
    onActivity(newActivity);
    setTimeout(() => {
      setLoading(false);
      if (!assessment.isSafe) {
        setErrorState({
          title: "Content Restricted",
          msg: "The content you are trying to access has been filtered by Miest Browser for your safety."
        });
        setCurrentContent(null);
        setCurrentAssessment(null);
      } else {
        setCurrentContent(input);
        setCurrentAssessment(assessment);
        if (type === 'visit') setUrl(input.startsWith('http') ? input : `https://${input}`);
      }
    }, 2500);
  };

  const cycleTheme = () => {
    const themes: AppTheme[] = ['standard', 'glass-light', 'glass-dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onUpdateTheme(themes[nextIndex]);
  };

  const getSophisticationColor = (level?: SophisticationLevel) => {
    switch (level) {
      case SophisticationLevel.ELEMENTARY: return 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
      case SophisticationLevel.ADOLESCENT: return 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]';
      case SophisticationLevel.ACADEMIC: return 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]';
      default: return 'border-transparent';
    }
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden relative transition-all duration-300 ${isDarkMode ? 'bg-[#121212]' : 'bg-white'}`}>
      
      {/* ----------------- SPLASH SCREEN ANIMATION ----------------- */}
      {showSplash && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden font-mono">
          
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          
          <div className="relative font-black text-4xl md:text-7xl tracking-widest flex flex-col items-center gap-6 z-10 w-full">
             
             {/* Tech Overlay Lines */}
             <div className="absolute -top-32 w-[1px] h-32 bg-gradient-to-b from-transparent via-pink-500 to-transparent animate-scan-vertical"></div>
             
             {/* Stage 1: The Creators (Tech Typing Style) */}
             <div className="animate-[fade-out_0.5s_3s_forwards] flex gap-4 md:gap-12 items-center">
               <div className="flex flex-col items-end">
                   <div className="h-[1px] w-12 bg-pink-500/50 mb-2"></div>
                   <span className="text-pink-500 font-sans tracking-[0.2em] font-bold text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">MITCHELL</span>
               </div>
               
               <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
               
               <div className="flex flex-col items-start">
                   <div className="h-[1px] w-12 bg-blue-500/50 mb-2"></div>
                   <span className="text-blue-500 font-sans tracking-[0.2em] font-bold text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">ESTHER</span>
               </div>
             </div>

             {/* Stage 2: The Fusion (Letters merging with Data Stream Effect) */}
             <div className="absolute top-0 flex items-center justify-center gap-0 opacity-0 animate-[fade-in_0.5s_0.5s_forwards,merge_2s_1.5s_forwards]">
                {/* MI */}
                <span className="text-pink-500 font-black drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10">MI</span>
                {/* EST */}
                <span className="text-blue-500 font-black drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10">EST</span>
             </div>

             {/* Stage 3: The Result (Holographic Reveal) */}
             <div className="absolute top-0 opacity-0 animate-[scale-in_0.5s_3.2s_forwards] flex flex-col items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 blur-3xl opacity-20 animate-pulse"></div>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-blue-300 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] z-20 font-black tracking-tight">
                   MIEST
                </span>
             </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-4 opacity-0 animate-[fade-in_1s_3.5s_forwards]">
             <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
             <div className="text-xs md:text-sm font-sans font-medium text-slate-400 tracking-[0.3em] uppercase">
                 Future of Safe Browsing
             </div>
          </div>

          <style>{`
            @keyframes merge {
              0% { letter-spacing: 0.8em; opacity: 0; filter: blur(12px); transform: scale(1.1); }
              20% { opacity: 1; filter: blur(0px); }
              50% { letter-spacing: 0.2em; }
              80% { letter-spacing: 0em; opacity: 1; transform: scale(1); filter: contrast(1.2); }
              100% { opacity: 0; transform: scale(1.5); filter: blur(20px); }
            }
            @keyframes scale-in {
              0% { transform: scale(0.9) translateY(10px); opacity: 0; filter: blur(5px); }
              100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
            }
            @keyframes fade-out {
              to { opacity: 0; filter: blur(4px); transform: scale(0.95); }
            }
            @keyframes scan-vertical {
              0% { top: -20%; opacity: 0; }
              50% { opacity: 1; }
              100% { top: 120%; opacity: 0; }
            }
            @keyframes glitch {
              0%, 100% { transform: translate(0); opacity: 1; }
              2% { transform: translate(-2px, 1px); opacity: 0.8; }
              4% { transform: translate(2px, -1px); opacity: 1; }
            }

            /* NEW HOME PAGE ANIMATIONS */
            .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.1); }
            }
            
            .animate-tilt { animation: tilt 10s infinite linear; }
            @keyframes tilt {
               0%, 50%, 100% { transform: rotate(0deg); }
               25% { transform: rotate(0.5deg); }
               75% { transform: rotate(-0.5deg); }
            }
            
            .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
            @keyframes fadeInUp {
               from { opacity: 0; transform: translateY(20px); }
               to { opacity: 1; transform: translateY(0); }
            }
            
            .delay-1000 { animation-delay: 1000ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
          `}</style>
        </div>
      )}

      {/* BACKGROUND IMAGE - Only on Home Page */}
      {!currentContent && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=3540")',
            filter: isDarkMode ? 'brightness(0.3) contrast(1.2)' : 'brightness(0.5) contrast(1.1)'
          }}
        />
      )}

      {/* Browser Nav Bar - Responsive Update */}
      <div className={`relative z-20 p-2 sm:p-3 flex items-center gap-2 sm:gap-4 border-b transition-all ${headerBg} ${headerBorder}`}>
        {/* Window Controls - Hidden on Mobile */}
        <div className="hidden sm:flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <button className={`${textSecondary} hover:text-pink-500 transition p-1`} onClick={() => setCurrentContent(null)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <button className={`${textSecondary} p-1 hover:bg-slate-100 rounded`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <button className={`${textSecondary} p-1 hover:bg-slate-100 rounded`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2 min-w-0">
          <div className={`flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full border-2 transition-all duration-500 ${getSophisticationColor(currentAssessment?.sophistication)} ${isDarkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-[#f1f3f4] border-transparent focus-within:bg-white focus-within:shadow-md focus-within:border-slate-300'}`}>
             <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
             <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigation(url, 'visit')}
                className={`bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
             />
          </div>
        </div>

        <button 
          onClick={cycleTheme}
          className={`p-2 rounded-lg border border-transparent transition-all hover:bg-slate-100 flex-shrink-0 ${textPrimary}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        </button>
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/90 dark:bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <p className={`text-sm font-black text-pink-500 uppercase tracking-widest`}>{loadingMessage}</p>
          </div>
        )}

        {errorState ? (
          <div className="flex-1 flex items-center justify-center min-h-full p-12">
            <div className="max-w-xl w-full p-10 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 shadow-2xl rounded-3xl text-center">
               <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-full text-red-600 dark:text-red-400 w-fit mx-auto mb-8">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <h3 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">{errorState.title}</h3>
               <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">{errorState.msg}</p>
               <button onClick={() => { setErrorState(null); setSearchQuery(''); }} className="px-8 py-3 bg-pink-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-pink-700 transition">Back to Home</button>
            </div>
          </div>
        ) : !currentContent && !loading ? (
          /* HOME PAGE / NEW TAB (Redesigned Eye-Catching Style) */
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
               {/* Background Image with Parallax-feel */}
               <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
                  style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                    filter: isDarkMode ? 'brightness(0.5) contrast(1.1) saturate(1.1)' : 'brightness(0.9) contrast(1.1) saturate(1.2)'
                  }}
               />
               {/* Overlay Gradients */}
               <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-black/60 via-transparent to-black/90' : 'from-black/30 via-transparent to-black/60'}`} />
               
               {/* Animated Orbs */}
               <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow"></div>
               <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center">
              
              {/* BRANDING: The Centerpiece */}
              <div className="mb-12 flex flex-col items-center animate-fade-in-up">
                 <div className="relative mb-6 group cursor-default">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-xl transition duration-500 animate-tilt"></div>
                    <div className="relative bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl ring-1 ring-white/20">
                       <svg className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                 </div>
                 
                 <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-2 select-none">
                    MIEST
                 </h1>
                 <p className="text-sm md:text-base font-medium text-white/80 tracking-[0.3em] uppercase backdrop-blur-sm px-4 py-1 rounded-full border border-white/10 bg-black/20">
                    The Safe Web Experience
                 </p>
              </div>
              
              {/* SEARCH: The Portal */}
              <div className="w-full max-w-2xl relative mb-16 z-20 group animate-fade-in-up delay-200">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-700 group-hover:duration-200"></div>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="Where do you want to go safely?" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNavigation(searchQuery, 'search')}
                      className={`w-full pl-8 pr-20 py-5 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-white placeholder-white/50 focus:bg-white/20 focus:outline-none transition-all text-lg shadow-2xl font-medium tracking-wide`}
                    />
                    <button 
                      onClick={() => handleNavigation(searchQuery, 'search')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white text-pink-600 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                  </div>
              </div>

              {/* QUICK ACCESS: The Dashboard */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6 mb-12 animate-fade-in-up delay-300 w-full max-w-4xl">
                 {quickLinks.map((link, idx) => (
                   <button 
                    key={idx}
                    onClick={() => link.url !== 'add' && handleNavigation(link.url, 'visit')}
                    className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-2"
                   >
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl shadow-lg transition-all group-hover:bg-white/20 group-hover:border-white/30 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] position-relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <span className="transform group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{link.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors text-center shadow-black/50 drop-shadow-md">{link.name}</span>
                   </button>
                 ))}
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end text-white/60 text-xs font-medium tracking-wider z-10">
               <div>
                  <span className="block text-white/90 font-bold mb-1">Miest Safe Browse v2.0</span>
                  <span>Protected by Gemini AI • Real-time Scans</span>
               </div>
               <div className="flex gap-4">
                  <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
               </div>
            </div>

          </div>
        ) : (
          /* SEARCH RESULTS PAGE (Browser Style) */
          <div className="min-h-full flex flex-col animate-in fade-in duration-500">
             {/* Sub-header for tabs (Visual only) */}
             <div className={`px-6 border-b transition-all ${headerBg} ${headerBorder}`}>
                <div className="max-w-5xl mx-auto flex gap-6">
                   {['All', 'Images', 'Videos', 'News', 'Maps'].map((tab, i) => (
                      <button key={tab} className={`py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${i === 0 ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                         {tab}
                      </button>
                   ))}
                </div>
             </div>

             <div className="max-w-5xl mx-auto w-full px-6 py-8">
                {/* Result Summary */}
                <p className={`text-xs ${textSecondary} mb-8 font-medium`}>About 2,400 results for "{currentContent}" • Miest Secure Search</p>

                {/* Main Results Column */}
                <div className="space-y-10 max-w-3xl">
                   
                   {/* GATURA GUIDE: Simplified Summary for Complex/Sensitive Topics */}
                   {currentAssessment?.guideSummary && (
                      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-xl">✨</span>
                             <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Miest Guide • Explain Like I'm...</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{currentContent}: The Simple Version</h3>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium relative z-10">
                             {currentAssessment.guideSummary}
                          </p>
                      </div>
                   )}

                   {/* Primary AI Result */}
                   <div className="group border-l-4 border-pink-500 pl-4 py-2 bg-pink-50/50 dark:bg-pink-900/10 rounded-r-xl">
                      <div className="flex flex-col gap-0.5 mb-1">
                         <span className="text-xs text-pink-600 dark:text-pink-400 font-bold tracking-wider uppercase">
                            Miest Smart System • {currentAssessment?.sophistication === 'ACADEMIC' ? 'Advanced' : currentAssessment?.sophistication === 'ELEMENTARY' ? 'Simple' : 'Standard'} Level
                         </span>
                      </div>
                      <h4 className={`text-xl font-black cursor-pointer transition-colors mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentContent && currentContent.charAt(0).toUpperCase() + currentContent.slice(1)}: Smart Summary
                      </h4>
                      <p className={`text-sm leading-relaxed max-w-2xl font-medium ${isDarkMode ? 'text-[#bdc1c6]' : 'text-slate-600'}`}>
                        {currentAssessment?.reason || "Content checked by Miest."}
                      </p>
                   </div>

                   {/* Other Standard Results */}
                   {(currentAssessment?.searchResults && currentAssessment.searchResults.length > 0 
                      ? currentAssessment.searchResults 
                      : [
                          { title: `More regarding "${currentContent}"`, url: `https://secure.miest.browser/browse`, snippet: "Explore more verified educational resources and safe content related to your search. Miest Browser ensures all destination links remain within safe browsing parameters.", source: "Miest Safe Search" },
                          { title: `Educational Resources: ${currentContent}`, url: `https://edu.miest.browser/topics`, snippet: "Find verified academic papers, articles, and learning materials suitable for your level.", source: "Miest Education" }
                        ]
                   ).map((result, i) => (
                      <div key={i} className="group pl-4 mb-10">
                         <div className="flex flex-col gap-0.5 mb-1">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-wider truncate uppercase">
                               {result.url} › {result.source}
                            </span>
                         </div>
                         <a href={result.url} target="_blank" rel="noopener noreferrer" className={`text-xl font-bold cursor-pointer transition-colors mb-2 block ${isDarkMode ? 'text-[#8ab4f8] hover:text-[#a8c7fa] hover:underline' : 'text-[#1a0dab] hover:text-[#1e13bd] hover:underline'}`}>
                           {result.title}
                         </a>
                         
                         {/* Enhanced Snippet (Vast Info) */}
                         <p className={`text-sm leading-7 max-w-3xl font-medium ${isDarkMode ? 'text-[#bdc1c6]' : 'text-slate-600'}`}>
                           {result.snippet}
                         </p>

                         {/* Key Points Expansion */}
                         {result.keyPoints && result.keyPoints.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-pink-500/20">
                               <ul className="list-disc text-sm space-y-1 text-slate-500 dark:text-slate-400 marker:text-pink-500">
                                  {result.keyPoints.map((point, k) => (
                                      <li key={k}>{point}</li>
                                  ))}
                               </ul>
                            </div>
                         )}

                         {/* Sub-Links (Clickable Expansion) */}
                         {result.subLinks && result.subLinks.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                               {result.subLinks.map((sub, s) => (
                                  <a key={s} href={sub.url} className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                                     <span className="opacity-50">↳</span> {sub.title}
                                  </a>
                               ))}
                            </div>
                         )}
                      </div>
                   ))}
                </div>

                {/* Pagination (Visual) */}
                <div className="mt-16 py-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4">
                   {[1, 2, 3, 4, 5].map(p => (
                      <button key={p} className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${p === 1 ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        {p}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserView;
