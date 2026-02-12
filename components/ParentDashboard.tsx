
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, RiskLevel, AlertSettings, AlertLog, AppTheme } from '../types';

interface ParentDashboardProps {
  activities: Activity[];
  alertLogs: AlertLog[];
  settings: AlertSettings;
  onUpdateSettings: (settings: AlertSettings) => void;
  onTriggerTestAlert: () => void;
  onReturnToBrowser: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ 
  activities, 
  alertLogs, 
  settings, 
  onUpdateSettings,
  onTriggerTestAlert,
  onReturnToBrowser
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'settings'>('analytics');
  const [phoneInput, setPhoneInput] = useState(settings.phoneNumber);

  const latestActivity = activities[activities.length - 1];
  const currentRisk = latestActivity?.riskLevel || RiskLevel.LOW;

  const getRiskBadge = (level: RiskLevel) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2";
    switch (level) {
      case RiskLevel.LOW: return `${base} bg-emerald-50 text-emerald-600 border-emerald-100`;
      case RiskLevel.MEDIUM: return `${base} bg-amber-50 text-amber-600 border-amber-100`;
      case RiskLevel.HIGH: return `${base} bg-red-50 text-red-600 border-red-200 animate-pulse`;
      default: return `${base} bg-slate-50 text-slate-400 border-slate-100`;
    }
  };

  const riskData = [
    { name: 'Safe', value: activities.filter(a => a.riskLevel === RiskLevel.LOW).length, color: '#10b981' }, 
    { name: 'Caution', value: activities.filter(a => a.riskLevel === RiskLevel.MEDIUM).length, color: '#f59e0b' }, 
    { name: 'Danger', value: activities.filter(a => a.riskLevel === RiskLevel.HIGH).length, color: '#ef4444' }, 
  ].filter(d => d.value > 0);

  const containerClass = settings.theme === 'glass-dark' ? 'bg-slate-800/40 border-slate-700 text-white' : 'bg-white/80 border-slate-200';
  const textClass = settings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900';

  const handlePhoneUpdate = () => {
    onUpdateSettings({ ...settings, phoneNumber: phoneInput });
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header Intercept Banner */}
      <div className={`p-6 rounded-3xl border-4 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6
        ${currentRisk === RiskLevel.HIGH && latestActivity?.status === 'blocked' ? 'bg-red-50 border-red-600 animate-shake' : 
          currentRisk === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-400' : 'bg-emerald-50 border-emerald-400'}`}>
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-2xl shadow-lg 
             ${currentRisk === RiskLevel.HIGH ? 'bg-red-600 text-white' : 
               currentRisk === RiskLevel.MEDIUM ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
           </div>
           <div>
              <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 
                ${currentRisk === RiskLevel.HIGH ? 'text-red-600' : 
                  currentRisk === RiskLevel.MEDIUM ? 'text-amber-600' : 'text-emerald-600'}`}>
                {latestActivity?.status === 'blocked' ? 'CRITICAL BLOCKED SEARCH' : `Shield Status: ${currentRisk} Risk`}
              </h2>
              <p className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {latestActivity 
                  ? `Intercepted: "${latestActivity.content}"` 
                  : 'Gatura Shield is Online & Active'}
              </p>
           </div>
        </div>

        <button 
          onClick={onReturnToBrowser}
          className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-pink-500 hover:text-pink-600 transition shadow-sm"
        >
          Return to Browser
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white/20 backdrop-blur p-1 rounded-2xl shadow-sm border border-slate-200 w-fit mx-auto sm:mx-0">
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'analytics' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Overview</button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'history' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Security Logs</button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Shield Settings</button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Left Column: Stats & Chart */}
            <div className="space-y-6">
              <div className={`${containerClass} p-8 rounded-3xl border shadow-sm flex flex-col items-center justify-center`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Risk Distribution</p>
                <div className="h-48 w-full">
                  {activities.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase italic">No activity yet</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`${containerClass} p-6 rounded-2xl border shadow-sm text-center`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">Total Hits</p>
                  <p className="text-3xl font-black">{activities.length}</p>
                </div>
                <div className={`${containerClass} p-6 rounded-2xl border shadow-sm text-center`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-red-500 mb-1">Blocks</p>
                  <p className="text-3xl font-black text-red-600">{activities.filter(a => a.status === 'blocked').length}</p>
                </div>
              </div>
            </div>

            {/* Right Column: DETAILED RECENT INTERCEPTS (Highly Visible) */}
            <div className={`lg:col-span-2 ${containerClass} p-8 rounded-3xl border shadow-sm flex flex-col`}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black tracking-tight">Real-time Intercept Feed</h3>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Live Monitor</span>
                 </div>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2">
                {activities.length > 0 ? (
                  activities.slice().reverse().map(activity => (
                    <div key={activity.id} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${activity.status === 'blocked' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${activity.status === 'blocked' ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                            {activity.type === 'search' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                              {new Date(activity.timestamp).toLocaleTimeString()} • {activity.type}
                            </p>
                            <h4 className={`text-lg font-black leading-tight ${textClass}`}>"{activity.content}"</h4>
                          </div>
                        </div>
                        <span className={getRiskBadge(activity.riskLevel)}>{activity.riskLevel}</span>
                      </div>
                      <div className={`mt-3 p-3 rounded-xl border ${activity.status === 'blocked' ? 'bg-white border-red-200' : 'bg-white border-slate-200'}`}>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Gatura AI Reasoning:</p>
                        <p className="text-sm text-slate-600 italic leading-relaxed">{activity.reason}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="text-sm font-bold uppercase tracking-widest">No activity data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${containerClass} p-8 rounded-3xl border shadow-sm animate-in slide-in-from-bottom-4 duration-500 overflow-hidden`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Full Security Logs</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit-ready Browsing Database</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Time</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Content</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Risk</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activities.slice().reverse().map(activity => (
                    <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className={`text-xs font-bold ${textClass}`}>{new Date(activity.timestamp).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className={`text-sm font-black ${textClass} truncate max-w-xs`}>{activity.content}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={getRiskBadge(activity.riskLevel)}>{activity.riskLevel}</span>
                      </td>
                      <td className="px-8 py-6">
                         {activity.status === 'blocked' ? 
                           <span className="text-[10px] font-black text-red-500 uppercase">Blocked</span> : 
                           <span className="text-[10px] font-black text-emerald-500 uppercase">Allowed</span>
                         }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={`${containerClass} p-8 rounded-3xl border shadow-sm space-y-12 animate-in fade-in duration-500`}>
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                   Visual Appearance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {(['standard', 'glass-light', 'glass-dark'] as AppTheme[]).map(t => (
                    <button 
                      key={t} 
                      onClick={() => onUpdateSettings({ ...settings, theme: t })}
                      className={`relative overflow-hidden h-24 rounded-2xl border-2 transition-all group ${settings.theme === t ? 'border-pink-500 ring-4 ring-pink-100 shadow-xl' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className={`absolute inset-0 theme-${t} pointer-events-none`}></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${t === 'glass-dark' ? 'text-white' : 'text-slate-900'}`}>{t.replace('-', ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Sensitivity Protocol</h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH].map(level => (
                    <button key={level} onClick={() => onUpdateSettings({ ...settings, minRiskLevel: level })} 
                      className={`py-4 rounded-2xl font-black border-4 transition-all duration-300 text-sm tracking-widest ${settings.minRiskLevel === level 
                        ? (level === RiskLevel.LOW ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 
                           level === RiskLevel.MEDIUM ? 'border-amber-500 bg-amber-50 text-amber-700' : 
                           'border-red-600 bg-red-50 text-red-700 animate-heartbeat') 
                        : 'border-slate-100 text-slate-400'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-6">
                 <div className="flex justify-between items-center">
                   <div>
                     <h4 className="font-black text-slate-900">SMS Alerts</h4>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Direct notifications to your mobile</p>
                   </div>
                   <button 
                    onClick={() => onUpdateSettings({ ...settings, smsEnabled: !settings.smsEnabled })}
                    className={`w-14 h-8 rounded-full transition-colors relative ${settings.smsEnabled ? 'bg-pink-600' : 'bg-slate-200'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.smsEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>

                 {settings.smsEnabled && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                     <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Guardian Phone Number</label>
                     <div className="flex gap-2">
                        <input 
                          type="tel" 
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+1 555-0000"
                          className={`flex-1 px-4 py-3 rounded-xl border-2 focus:border-pink-500 focus:ring-0 transition-all font-bold ${textClass} ${settings.theme === 'glass-dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}
                        />
                        <button 
                          onClick={handlePhoneUpdate}
                          className="px-6 py-3 bg-pink-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-pink-700 transition"
                        >
                          Save
                        </button>
                     </div>
                   </div>
                 )}
              </div>

              <button 
                onClick={onTriggerTestAlert}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl"
              >
                Trigger System Test SMS to {settings.phoneNumber}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
