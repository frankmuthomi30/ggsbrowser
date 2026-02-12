
import React, { useState, useEffect } from 'react';
import { analyzeContent } from '../services/geminiService';
import { Activity, RiskLevel, RiskAssessment, AppTheme, SophisticationLevel } from '../types';

interface BrowserViewProps {
  onActivity: (activity: Activity) => void;
  theme: AppTheme;
  onUpdateTheme: (theme: AppTheme) => void;
}

const BrowserView: React.FC<BrowserViewProps> = ({ onActivity, theme, onUpdateTheme }) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [searchQuery, setSearchQuery] = useState('');
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
    'Analyzing intent...',
    'Checking cognitive complexity...',
    'Curating safe paths...',
    'Finalizing view...'
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
    { type: 'weather', title: 'Local Weather', icon: '⛅', value: '24°C', detail: 'Sunny in Nairobi' },
    { type: 'stocks', title: 'Markets', icon: '📈', value: 'S&P 500', detail: '+1.2% Today' },
    { type: 'news', title: 'Top Story', icon: '📰', value: 'Mars Mission', detail: 'New rover lands' },
    { type: 'sports', title: 'Premier League', icon: '⚽', value: 'Arsenal vs MC', detail: 'Live: 1 - 1' }
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
          msg: "The content you are trying to access has been filtered by Gatura Girls for your safety."
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
      
      {/* BACKGROUND IMAGE - Only on Home Page */}
      {!currentContent && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=3540")',
            filter: isDarkMode ? 'brightness(0.3)' : 'brightness(0.7)'
          }}
        />
      )}

      {/* Browser Nav Bar */}
      <div className={`relative z-20 p-3 flex items-center gap-4 border-b transition-all ${headerBg} ${headerBorder}`}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className={`${textSecondary} hover:text-pink-500 transition`} onClick={() => setCurrentContent(null)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <div className="flex items-center gap-1">
            <button className={`${textSecondary} p-1 hover:bg-slate-100 rounded`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
            <button className={`${textSecondary} p-1 hover:bg-slate-100 rounded`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-3 px-4 py-1.5 rounded-full border-2 transition-all duration-500 ${getSophisticationColor(currentAssessment?.sophistication)} ${isDarkMode ? 'bg-[#2a2a2a] border-[#444]' : 'bg-[#f1f3f4] border-transparent focus-within:bg-white focus-within:shadow-md focus-within:border-slate-300'}`}>
             <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
             <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigation(url, 'visit')}
                className={`bg-transparent border-none focus:ring-0 text-sm w-full font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
             />
          </div>
        </div>

        <button 
          onClick={cycleTheme}
          className={`p-2 rounded-lg border border-transparent transition-all hover:bg-slate-100 ${textPrimary}`}
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
          /* HOME PAGE / NEW TAB (Edge Style) */
          <div className="flex-1 flex flex-col items-center pt-24 pb-12 px-6">
            <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="bg-pink-600 p-4 rounded-3xl shadow-2xl mb-6 pulse-glow">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">Gatura Girls</h2>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mt-2 drop-shadow-md">Professional Safe Browse</p>
            </div>
            
            <div className="w-full max-w-xl relative mb-12">
              <input 
                type="text" 
                placeholder="Search securely..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigation(searchQuery, 'search')}
                className="w-full pl-6 pr-20 py-4 rounded-full border border-white/20 bg-white/20 backdrop-blur-3xl text-white placeholder-white/80 focus:bg-white/40 focus:ring-4 focus:ring-white/10 transition-all text-lg shadow-2xl outline-none"
              />
              <button 
                onClick={() => handleNavigation(searchQuery, 'search')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-4 sm:grid-cols-8 gap-4 mb-16 px-4">
               {quickLinks.map((link, idx) => (
                 <button 
                  key={idx}
                  onClick={() => link.url !== 'add' && handleNavigation(link.url, 'visit')}
                  className="group flex flex-col items-center gap-2 transition-all hover:scale-105"
                 >
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl shadow-lg transition-all group-hover:bg-white/30">
                       {link.icon}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/90 group-hover:text-white drop-shadow-md text-center truncate w-full">{link.name}</span>
                 </button>
               ))}
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-3 px-4">
               {newsTiles.map((tile, idx) => (
                 <div 
                   key={idx}
                   className="p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                 >
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-[8px] font-black text-pink-400 uppercase tracking-widest">{tile.title}</span>
                       <span className="text-base">{tile.icon}</span>
                    </div>
                    <p className="text-lg font-black text-white">{tile.value}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase mt-0.5">{tile.detail}</p>
                 </div>
               ))}
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
                <p className={`text-xs ${textSecondary} mb-8 font-medium`}>About 2,400 results for "{currentContent}" • Gatura Secure Search</p>

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
                             <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Gatura Guide • Explain Like I'm...</span>
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
                            Gatura Intelligence • {currentAssessment?.sophistication || 'Standard'} Mode
                         </span>
                      </div>
                      <h4 className={`text-xl font-black cursor-pointer transition-colors mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentContent && currentContent.charAt(0).toUpperCase() + currentContent.slice(1)}: AI Safety Analysis
                      </h4>
                      <p className={`text-sm leading-relaxed max-w-2xl font-medium ${isDarkMode ? 'text-[#bdc1c6]' : 'text-slate-600'}`}>
                        {currentAssessment?.reason || "Content verified by Gatura Safety Protocols."}
                      </p>
                   </div>

                   {/* Other Standard Results */}
                   {[1, 2, 3, 4].map(i => (
                      <div key={i} className="group pl-4">
                         <div className="flex flex-col gap-0.5 mb-1">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">https://secure-node-{i}.gatura.girls › info › browse</span>
                         </div>
                         <h4 className={`text-xl font-bold cursor-pointer transition-colors mb-1 ${isDarkMode ? 'text-[#8ab4f8] group-hover:underline' : 'text-[#1a0dab] group-hover:underline'}`}>
                           More regarding "{currentContent}"
                         </h4>
                         <p className={`text-sm leading-relaxed max-w-2xl ${isDarkMode ? 'text-[#bdc1c6]' : 'text-slate-600'}`}>
                           Explore more verified educational resources and safe content related to your search. Gatura Girls ensures all destination links remain within safe browsing parameters.
                         </p>
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
