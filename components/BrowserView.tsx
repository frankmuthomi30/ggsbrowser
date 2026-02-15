
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
    'Scanning for threats...',
    'Verifying certificates...',
    'Optimizing experience...',
    'Almost there...',
    'Finalizing...',
    'Working on it...',
    'Being smart enough...',
    'Securing your connection...',
    'Loading relevant content...',
    'Preparing your safe space...',
    'Filtering harmful data...',
    'Engaging AI protocols...',
    'Just a few seconds more...',
    'Decoding the web safely...',
    'Miest is on it...'
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
      // Shuffle logic with array copy
      const shuffled = [...loadingMessages].sort(() => Math.random() - 0.5);
      let i = 0;
      setLoadingMessage(shuffled[0]);
      
      interval = window.setInterval(() => {
        i = (i + 1) % shuffled.length; // Loop infinitely securely
        setLoadingMessage(shuffled[i]);
      }, 800);
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000] overflow-hidden font-sans w-screen h-screen">
          
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c] via-[#120b18] to-[#040810] animate-gradient-xy opacity-90"></div>
          
          {/* Dynamic Light Beams */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
             <div className="absolute -top-1/4 left-1/3 w-px h-[150%] bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-beam-slow rotate-12 origin-top"></div>
             <div className="absolute -top-1/4 right-1/3 w-px h-[150%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-beam-slower rotate-[-12deg] origin-top delay-700"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
             
             {/* Central Logo Construction */}
             <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Ring 1 - Dashed */}
                <div className="absolute inset-0 rounded-full border border-dashed border-pink-500/20 animate-[spin_10s_linear_infinite]"></div>
                {/* Ring 2 - Solid Thin */}
                <div className="absolute inset-6 rounded-full border border-blue-500/30 animate-[spin_6s_linear_infinite_reverse]"></div>
                {/* Ring 3 - Glowing Core */}
                <div className="absolute inset-12 rounded-full border-2 border-white/5 animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.05)]"></div>
                
                {/* Ethereal Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-600/10 to-cyan-600/10 blur-3xl animate-pulse"></div>
                
                {/* Icon Reveal */}
                <div className="relative z-20 animate-[scale-in_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 flex items-center justify-center scale-75" style={{ animationDelay: '0.2s' }}>
                   <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] group">
                      <svg className="w-20 h-20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                   </div>
                </div>
             </div>

             {/* Text Reveal */}
             <div className="overflow-hidden mb-8 text-center relative z-20 mix-blend-screen">
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-cyan-200 animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] translate-y-full opacity-0 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ animationDelay: '0.5s' }}>
                   MIEST
                </h1>
                <div className="h-px w-0 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto animate-[width-expand_1s_ease-out_1s_forwards]"></div>
             </div>
             
             {/* Dynamic Loader & Status */}
             <div className="flex flex-col items-center gap-6 animate-[fade-in_1s_ease-out_1.5s_forwards] opacity-0 w-full max-w-xs relative z-20">
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                   <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-pink-500 via-white to-cyan-500 blur-[2px] animate-[loading-bar_2s_ease-in-out_infinite]"></div>
                </div>
                <div className="flex justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                   <span>System Initializing...</span>
                   <span className="text-emerald-400 animate-pulse">READY</span>
                </div>
             </div>
             
             {/* Footer Credits */}
             <div className="absolute bottom-10 animate-[fade-in_1s_ease-out_2.5s_forwards] opacity-0 text-center w-full">
                <p className="text-[10px] text-slate-500 font-bold tracking-[0.3em] uppercase mb-2">Architected By</p>
                <div className="flex justify-center gap-4 text-xs font-black text-slate-300 tracking-[0.2em]">
                   <span className="hover:text-pink-400 transition-colors cursor-default drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">MITCHELL</span>
                   <span className="text-slate-600">x</span>
                   <span className="hover:text-cyan-400 transition-colors cursor-default drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">ESTHER</span>
                </div>
             </div>
          </div>

          <style>{`
            @keyframes width-expand {
              0% { width: 0; }
              100% { width: 100%; max-width: 200px; }
            }
            @keyframes gradient-xy {
              0% { background-size: 100% 100%; }
              50% { background-size: 120% 120%; }
              100% { background-size: 100% 100%; }
            }
            @keyframes beam-slow {
              0% { transform: translateY(-30%); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(30%); opacity: 0; }
            }
            @keyframes beam-slower {
              0% { transform: translateY(-30%); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: translateY(30%); opacity: 0; }
            }
            .animate-beam-slow { animation: beam-slow 4s infinite linear; }
            .animate-beam-slower { animation: beam-slower 6s infinite linear; }
            
            @keyframes slide-up {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
             
            /* Redefine loading-bar to avoid conflict */
            @keyframes loading-bar {
              0% { left: -50%; }
              100% { left: 150%; }
            }

            @keyframes scale-in {
              0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
              100% { transform: scale(1); opacity: 1; filter: blur(0); }
            }
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            /* Keep existing animations required for other parts if any, but override for Splash */
            @keyframes merge {
               0% { letter-spacing: 0.5em; opacity: 0; }
               100% { letter-spacing: 0; opacity: 1; }
            }
            @keyframes fade-out {
               to { opacity: 0; }
            }
            
            /* NEW HOME PAGE ANIMATIONS (Preserved) */
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
          <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300 backdrop-blur-md ${isDarkMode ? 'bg-black/90' : 'bg-white/95'} w-screen h-screen`}>
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-cyan-500/10 animate-pulse"></div>

            {/* Central Loader Construction */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
               {/* 1. Outer Rotating Ring (Slow) */}
               <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 animate-[spin_10s_linear_infinite]"></div>
               
               {/* 2. Middle Rotating Ring (Fast, Reverse) */}
               <div className="absolute inset-4 rounded-full border-t-2 border-pink-500 dark:border-pink-400 animate-[spin_1.5s_linear_infinite]"></div>
               
               {/* 3. Inner Pulsing Core */}
               <div className="absolute inset-10 rounded-full bg-cyan-500/20 backdrop-blur-sm animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  <svg className="w-6 h-6 text-cyan-500 animate-[bounce_2s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               
               {/* 4. Scanning Beam Line */}
               <div className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite]">
                  <div className="w-full h-1/2 bg-gradient-to-t from-transparent via-transparent to-pink-500/10 border-t border-pink-500/50 blur-[1px]"></div>
               </div>
            </div>

            {/* Animated Text Status */}
            <div className="text-center relative z-10 space-y-2">
               <h3 className={`text-2xl font-black tracking-tighter uppercase animate-pulse ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Analyzing Content
               </h3>
               <div className="flex items-center gap-2 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce delay-300"></span>
               </div>
               <p className={`text-[10px] font-bold uppercase tracking-[0.3em] opacity-70 transition-all duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                 {loadingMessage}
               </p>
            </div>
          </div>
        )}

        {errorState ? (
          <div className="flex-1 flex items-center justify-center min-h-full p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className={`max-w-3xl w-full p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-[#0f1014] border border-white/5' : 'bg-white border border-slate-100'}`}>
               
               {/* Gentle Background Decor */}
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"></div>
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

               <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Friendly Icon */}
                  <div className="mb-8 relative">
                     <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full"></div>
                     <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-3xl shadow-lg border border-white/20 dark:border-white/5 relative transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-16 h-16 text-pink-500 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                  </div>
                  
                  <h3 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     Whoops! Let's Detour.
                  </h3>
                  
                  <div className={`text-lg leading-relaxed max-w-xl mx-auto mb-10 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                     <p className="mb-4">{errorState.msg || "That search went down a path we don't explore here."}</p>
                     <p className="text-sm opacity-70">Miest suggests trying something more creative or academic instead.</p>
                  </div>

                  {/* Helpful Diversion Suggestions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10">
                     <button onClick={() => handleNavigation('Space Exploration', 'visit')} className={`p-4 rounded-2xl text-left transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <span className="block text-xs font-bold text-cyan-500 uppercase tracking-wider mb-1">Science Information</span>
                        <span className={`block font-bold group-hover:translate-x-1 transition-transform ${textPrimary}`}>Explore Space 🚀</span>
                     </button>
                     <button onClick={() => handleNavigation('Learn Coding', 'visit')} className={`p-4 rounded-2xl text-left transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <span className="block text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">New Skills</span>
                        <span className={`block font-bold group-hover:translate-x-1 transition-transform ${textPrimary}`}>Learn to Code 💻</span>
                     </button>
                     <button onClick={() => handleNavigation('Famous Artists', 'visit')} className={`p-4 rounded-2xl text-left transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <span className="block text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">Creativity</span>
                        <span className={`block font-bold group-hover:translate-x-1 transition-transform ${textPrimary}`}>Famous Artists 🎨</span>
                     </button>
                     <button onClick={() => handleNavigation('Mental Health', 'visit')} className={`p-4 rounded-2xl text-left transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}>
                        <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Wellbeing</span>
                        <span className={`block font-bold group-hover:translate-x-1 transition-transform ${textPrimary}`}>Mental Wellness 🌿</span>
                     </button>
                  </div>

                  <button 
                     onClick={() => { setErrorState(null); setSearchQuery(''); }} 
                     className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                     Start Fresh
                  </button>
               </div>
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
                    backgroundImage: 'url("https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=2670")',
                    filter: isDarkMode ? 'brightness(0.4) saturate(1.2)' : 'brightness(0.9)'
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
                             <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                                {currentAssessment?.sophistication === 'ACADEMIC' ? "Miest Guide • Executive Summary" : "Miest Guide • The Simple Version"}
                             </span>
                          </div>
                          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Concept Breakdown</h3>
                          <div className={`leading-relaxed font-medium relative z-10 space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                             {(() => {
                                const rawText = currentAssessment.guideSummary.replace(/^.*(: The Simple Version|: Smart Summary)\s*/, '');
                                if (rawText.includes('1. ')) {
                                    // Detect numbered list and format
                                    return rawText.split(/(\d+\.\s+)/).filter(Boolean).reduce((acc: any[], part, idx, arr) => {
                                        if (/^\d+\.\s+/.test(part)) {
                                            // Combine number with next text block
                                            if (arr[idx+1]) {
                                               acc.push(
                                                  <div key={idx} className="flex gap-3 text-sm md:text-base items-start">
                                                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-xs mt-0.5 border border-pink-200">{part.trim().replace('.','')}</span>
                                                     <span>{arr[idx+1]}</span>
                                                  </div>
                                               );
                                            }
                                        } else if (idx === 0 && !/^\d+\.\s+/.test(arr[0])) {
                                            // Introduction text before list
                                            acc.push(<p key={idx} className="mb-2">{part}</p>);
                                        }
                                        return acc;
                                    }, []);
                                } else {
                                    // Regular Paragraphs
                                    return rawText.split('\n').filter(p => p.trim()).map((p, i) => (
                                        <p key={i} className="mb-2">{p}</p>
                                    ));
                                }
                             })()}
                          </div>
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
                         <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-wider truncate uppercase">
                               {result.url} › {result.source}
                            </span>
                            {(result.url.includes('.edu') || result.url.includes('.org') || result.url.includes('.gov')) && (
                               <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                                 isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                               }`}>
                                 Verified Source
                               </span>
                            )}
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

                         {/* Sub-Links (Clickable Expansion using Miest Search) */}
                         {result.subLinks && result.subLinks.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                               {result.subLinks.map((sub, s) => (
                                  <button 
                                     key={s} 
                                     onClick={() => handleNavigation(`${sub.title} related to ${currentContent}`, 'search')}
                                     className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                                  >
                                     <span className="opacity-50">↳</span> {sub.title}
                                  </button>
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
