import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { Activity, RiskLevel, AlertSettings, AlertLog, AppTheme, SophisticationLevel } from '../types';

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
  settings, 
  onUpdateSettings,
  onTriggerTestAlert,
  onReturnToBrowser
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'settings'>('analytics');
  const [phoneInput, setPhoneInput] = useState(settings.phoneNumber);

  const latestActivity = activities[activities.length - 1];
  const currentRisk = latestActivity?.riskLevel || RiskLevel.LOW;

  // Chart Data: Map risk levels to numbers
  const chartData = activities.slice(-20).map((act, i) => ({
    name: i.toString(),
    risk: act.riskLevel === 'HIGH' ? 3 : act.riskLevel === 'MEDIUM' ? 2 : 1,
    time: new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const riskData = [
    { name: 'Safe', value: activities.filter(a => a.riskLevel === RiskLevel.LOW).length, color: '#10b981' }, 
    { name: 'Caution', value: activities.filter(a => a.riskLevel === RiskLevel.MEDIUM).length, color: '#f59e0b' }, 
    { name: 'Danger', value: activities.filter(a => a.riskLevel === RiskLevel.HIGH).length, color: '#ef4444' }, 
  ].filter(d => d.value > 0);

  // Time-based Usage Analysis
  const usageData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i-12}p` : `${i}a`,
    count: 0,
    riskScore: 0
  }));

  activities.forEach(act => {
    const hour = new Date(act.timestamp).getHours();
    usageData[hour].count += 1;
    // Add weight for risky activities at late hours
    if (act.riskLevel === RiskLevel.HIGH) usageData[hour].riskScore += 3;
    else if (act.riskLevel === RiskLevel.MEDIUM) usageData[hour].riskScore += 1;
  });

  const containerClass = settings.theme === 'glass-dark' ? 'bg-slate-800/40 border-slate-700 text-white' : 'bg-white/80 border-slate-200';
  const textClass = settings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900';
  const subTextClass = settings.theme === 'glass-dark' ? 'text-slate-400' : 'text-slate-500';
  const isDark = settings.theme === 'glass-dark';

  const handlePhoneUpdate = () => {
    onUpdateSettings({ ...settings, phoneNumber: phoneInput });
  };

  const getSophisticationBadge = (level?: SophisticationLevel) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ml-2";
    if (isDark) {
      switch (level) {
        case SophisticationLevel.ACADEMIC: return `${base} bg-purple-900/40 text-purple-300`;
        case SophisticationLevel.ADOLESCENT: return `${base} bg-blue-900/40 text-blue-300`;
        default: return `${base} bg-emerald-900/40 text-emerald-300`;
      }
    }
    switch (level) {
      case SophisticationLevel.ACADEMIC: return `${base} bg-purple-100 text-purple-600`;
      case SophisticationLevel.ADOLESCENT: return `${base} bg-blue-100 text-blue-600`;
      default: return `${base} bg-emerald-100 text-emerald-600`;
    }
  };

  return (
    <div className="space-y-6 relative pb-12">
      {/* Header Stat Banner */}
      <div className={`p-6 rounded-3xl border-4 transition-all duration-500 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6
        ${
          currentRisk === RiskLevel.HIGH && latestActivity?.status === 'blocked' 
            ? (isDark ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-600 animate-shake')
            : currentRisk === RiskLevel.MEDIUM 
              ? (isDark ? 'bg-amber-900/20 border-amber-500/50' : 'bg-amber-50 border-amber-400')
              : (isDark ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-400')
        }
      `}>
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-2xl shadow-lg 
             ${currentRisk === RiskLevel.HIGH ? 'bg-red-600 text-white' : 
               currentRisk === RiskLevel.MEDIUM ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           </div>
           <div>
              <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 
                ${currentRisk === RiskLevel.HIGH ? 'text-red-400' : 
                  currentRisk === RiskLevel.MEDIUM ? 'text-amber-400' : 'text-emerald-400'}`}>
                {latestActivity?.status === 'blocked' ? 'HIGH RISK STOPPED' : `Smart Shield: Active`}
              </h2>
              <p className={`text-2xl font-black tracking-tight leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {latestActivity 
                  ? `Last Scan: "${latestActivity.content}"` 
                  : 'Miest Smart System is Active'}
              </p>
           </div>
        </div>

        <button 
          onClick={onReturnToBrowser}
          className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-sm border-2
            ${isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-400' 
              : 'bg-white border-slate-200 text-slate-800 hover:border-pink-500 hover:text-pink-600'
            }`}
        >
          Return to Browser
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex backdrop-blur p-1 rounded-2xl shadow-sm border w-fit mx-auto sm:mx-0 transition-colors
        ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'}`}>
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'analytics' ? 'bg-pink-600 text-white shadow-md' : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')}`}>Activity Overview</button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'history' ? 'bg-pink-600 text-white shadow-md' : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')}`}>Full Log</button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-pink-600 text-white shadow-md' : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100')}`}>System Config</button>
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
                  {/* Fixed Height Container for Recharts */}
                  <div style={{ width: '100%', height: '100%' }}>
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
                      <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase italic">No data yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Area Chart: Intent Flow */}
              <div className={`${containerClass} p-6 rounded-3xl border shadow-sm`}>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Activity Changes</p>
                 <div className="h-40 w-full mb-4">
                   <div style={{ width: '100%', height: '100%' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={[0, 3]} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="risk" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                        </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* New Time-Based Usage Bar Chart */}
                 <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Peak Hours</p>
                       <div className="flex gap-2">
                          <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Safe</div>
                          <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Warn</div>
                          <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Risk</div>
                       </div>
                    </div>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={usageData.filter(d => d.count > 0 || d.hour % 4 === 0)}>
                           <XAxis 
                              dataKey="label" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              stroke={settings.theme === 'glass-dark' ? '#94a3b8' : '#64748b'} 
                           />
                           <Tooltip 
                             cursor={{fill: settings.theme === 'glass-dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                             contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                backgroundColor: settings.theme === 'glass-dark' ? '#1e293b' : '#fff',
                                color: settings.theme === 'glass-dark' ? '#fff' : '#0f172a'
                             }}
                             labelStyle={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}
                           />
                           <Bar 
                             dataKey="count" 
                             fill="#3b82f6" 
                             radius={[4, 4, 0, 0]} 
                             barSize={12}
                           >
                             {
                               usageData.map((entry, index) => (
                                 <Cell 
                                   key={`cell-${index}`} 
                                   fill={entry.riskScore > 3 ? '#ef4444' : entry.riskScore > 0 ? '#f59e0b' : '#10b981'} 
                                 />
                               ))
                             }
                           </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right Column: Live Sophistication Feed */}
            <div className={`lg:col-span-2 ${containerClass} p-8 rounded-3xl border shadow-sm flex flex-col`}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black tracking-tight">Live Activity</h3>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase text-slate-400">AI Active</span>
                 </div>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {activities.length > 0 ? (
                  activities.slice().reverse().map(activity => (
                    <div key={activity.id} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] 
                      ${activity.status === 'blocked' 
                        ? (isDark ? 'bg-red-900/10 border-red-500/20' : 'bg-red-50/50 border-red-100') 
                        : (isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50/50 border-slate-100')
                      }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           {/* Sophistication Icon */}
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                              activity.sophistication === 'ACADEMIC' ? (isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-600') :
                              activity.sophistication === 'ADOLESCENT' ? (isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600') : 
                              (isDark ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-600')
                           }`}>
                              {activity.sophistication === 'ACADEMIC' ? '🎓' : 
                               activity.sophistication === 'ADOLESCENT' ? '🎵' : '🎲'}
                           </div>
                           <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${subTextClass}`}>
                                {new Date(activity.timestamp).toLocaleTimeString()}
                                <span className={getSophisticationBadge(activity.sophistication)}>
                                  {activity.sophistication === 'ACADEMIC' ? 'Advanced' : activity.sophistication === 'ELEMENTARY' ? 'Simple' : 'Standard'}
                                </span>
                              </p>
                              <h4 className={`text-lg font-black leading-tight ${textClass}`}>"{activity.content}"</h4>
                           </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded 
                          ${activity.riskLevel === 'HIGH' 
                            ? (isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-600') 
                            : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                          }`}>
                           {activity.riskLevel}
                        </span>
                      </div>
                      
                      {/* AI Reason */}
                      <div className={`ml-11 mt-2 p-3 rounded-xl border text-xs italic
                        ${isDark ? 'bg-slate-800/50 border-slate-600 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}>
                         "{activity.reason}"
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <p className="text-sm font-bold uppercase tracking-widest">Waiting for activity...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`${containerClass} p-8 rounded-3xl border shadow-sm`}>
            {/* Same as before but can add sophistication column if needed */}
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase text-slate-400 tracking-widest ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <th className="py-4">Time</th>
                    <th className="py-4">Topic</th>
                    <th className="py-4">Level</th>
                    <th className="py-4">Outcome</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-50'}`}>
                  {activities.slice().reverse().map(act => (
                    <tr key={act.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/20' : 'hover:bg-slate-50/50'}`}>
                      <td className={`py-4 text-xs font-bold ${subTextClass}`}>{new Date(act.timestamp).toLocaleTimeString()}</td>
                      <td className={`py-4 font-bold ${textClass}`}>{act.content}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                           act.sophistication === 'ACADEMIC' ? (isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-600') :
                           act.sophistication === 'ADOLESCENT' ? (isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-600') : 
                           (isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-600')
                        }`}>{act.sophistication === 'ACADEMIC' ? 'Advanced' : act.sophistication === 'ELEMENTARY' ? 'Simple' : 'Standard'}</span>
                      </td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black uppercase ${act.status === 'blocked' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
           <div className={`${containerClass} p-8 rounded-3xl border shadow-sm`}>
              <h3 className={`text-xl font-bold mb-6 ${textClass}`}>System Configuration</h3>
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                 <h4 className={`font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Emergency Contact</h4>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className={`flex-1 rounded-lg text-sm border p-2 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="+1 234 567 890"
                    />
                    <button onClick={handlePhoneUpdate} className="px-4 bg-pink-600 text-white rounded-lg text-xs font-bold uppercase transition hover:bg-pink-700">Save</button>
                    <button onClick={onTriggerTestAlert} className={`px-4 text-white rounded-lg text-xs font-bold uppercase transition ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-900'}`}>Test</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
