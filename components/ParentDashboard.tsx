import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell 
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

  const containerClass = settings.theme === 'glass-dark' ? 'bg-slate-800/40 border-slate-700 text-white' : 'bg-white/80 border-slate-200';
  const textClass = settings.theme === 'glass-dark' ? 'text-white' : 'text-slate-900';

  const handlePhoneUpdate = () => {
    onUpdateSettings({ ...settings, phoneNumber: phoneInput });
  };

  const getSophisticationBadge = (level?: SophisticationLevel) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ml-2";
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
        ${currentRisk === RiskLevel.HIGH && latestActivity?.status === 'blocked' ? 'bg-red-50 border-red-600 animate-shake' : 
          currentRisk === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-400' : 'bg-emerald-50 border-emerald-400'}`}>
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-2xl shadow-lg 
             ${currentRisk === RiskLevel.HIGH ? 'bg-red-600 text-white' : 
               currentRisk === RiskLevel.MEDIUM ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           </div>
           <div>
              <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 
                ${currentRisk === RiskLevel.HIGH ? 'text-red-600' : 
                  currentRisk === RiskLevel.MEDIUM ? 'text-amber-600' : 'text-emerald-600'}`}>
                {latestActivity?.status === 'blocked' ? 'HIGH RISK STOPPED' : `Smart Shield: Active`}
              </h2>
              <p className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {latestActivity 
                  ? `Last Scan: "${latestActivity.content}"` 
                  : 'Gatura Smart System is Active'}
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
        <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'analytics' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Activity Overview</button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'history' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Full Log</button>
        <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>System Config</button>
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
                 <div className="h-40 w-full">
                   <div style={{ width: '100%', height: '100%' }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={[0, 3]} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="risk" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                        </AreaChart>
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
                    <div key={activity.id} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${activity.status === 'blocked' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           {/* Sophistication Icon */}
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                              activity.sophistication === 'ACADEMIC' ? 'bg-purple-100' :
                              activity.sophistication === 'ADOLESCENT' ? 'bg-blue-100' : 'bg-emerald-100'
                           }`}>
                              {activity.sophistication === 'ACADEMIC' ? '🎓' : 
                               activity.sophistication === 'ADOLESCENT' ? '🎵' : '🎲'}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                {new Date(activity.timestamp).toLocaleTimeString()}
                                <span className={getSophisticationBadge(activity.sophistication)}>
                                  {activity.sophistication === 'ACADEMIC' ? 'Advanced' : activity.sophistication === 'ELEMENTARY' ? 'Simple' : 'Standard'}
                                </span>
                              </p>
                              <h4 className={`text-lg font-black leading-tight ${textClass}`}>"{activity.content}"</h4>
                           </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${activity.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                           {activity.riskLevel}
                        </span>
                      </div>
                      
                      {/* AI Reason */}
                      <div className="ml-11 mt-2 p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-500 italic">
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
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="py-4">Time</th>
                    <th className="py-4">Topic</th>
                    <th className="py-4">Level</th>
                    <th className="py-4">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activities.slice().reverse().map(act => (
                    <tr key={act.id} className="hover:bg-slate-50/50">
                      <td className="py-4 text-xs font-bold text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</td>
                      <td className="py-4 font-bold text-slate-800">{act.content}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                           act.sophistication === 'ACADEMIC' ? 'bg-purple-100 text-purple-600' :
                           act.sophistication === 'ADOLESCENT' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
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
              <h3 className="text-xl font-bold mb-6">System Configuration</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                 <h4 className="font-bold text-slate-700 mb-2">Emergency Contact</h4>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 border-slate-200 rounded-lg text-sm"
                      placeholder="+1 234 567 890"
                    />
                    <button onClick={handlePhoneUpdate} className="px-4 bg-pink-600 text-white rounded-lg text-xs font-bold uppercase">Save</button>
                    <button onClick={onTriggerTestAlert} className="px-4 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase">Test</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
