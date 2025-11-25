import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student } from '../types';
import { INITIAL_STUDENTS } from '../constants';
import { LogOut, LayoutDashboard, Link as LinkIcon } from 'lucide-react';
import StatsCard from './StatsCard';
import Charts from './Charts';
import DataTable from './DataTable';
import SettingsModal from './SettingsModal';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [students] = useLocalStorage<Student[]>('attenSync_data', INITIAL_STUDENTS);
  const [showSettings, setShowSettings] = useState(false);

  const stats = useMemo(() => {
    const total = students.length;
    
    // Most frequent dept
    const deptCounts: Record<string, number> = {};
    students.forEach(s => deptCounts[s.department] = (deptCounts[s.department] || 0) + 1);
    const topDept = Object.entries(deptCounts).sort((a,b) => b[1] - a[1])[0];

    const lastEntry = students.length > 0 
      ? new Date(students[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : 'N/A';

    return { total, topDept: topDept ? topDept[0] : 'None', lastEntry };
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-30 px-6 py-4 flex justify-between items-center border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setShowSettings(true)}
             className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
             title="Configure Target URL"
          >
            <LinkIcon size={16} />
            <span className="hidden sm:inline">Target URL</span>
          </button>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Present" value={stats.total.toString()} trend="+12% from yesterday" type="primary" />
          <StatsCard title="Top Department" value={stats.topDept} trend="Consistent leader" type="secondary" />
          <StatsCard title="Latest Entry" value={stats.lastEntry} trend="Just now" type="neutral" />
        </div>

        {/* Charts Row */}
        <div className="glass rounded-xl p-6 shadow-sm border border-white/40">
           <Charts students={students} />
        </div>

        {/* Data Table Row */}
        <div className="glass rounded-xl p-6 shadow-sm border border-white/40">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Attendance</h3>
           <DataTable students={students} />
        </div>
      </main>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default AdminDashboard;