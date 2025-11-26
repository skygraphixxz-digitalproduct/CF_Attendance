import React from 'react';
import { Users, Building2, Clock } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend: string;
  type: 'primary' | 'secondary' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, type }) => {
  const getIcon = () => {
    switch (title) {
      case 'Total Present': return <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'Top Department': return <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default: return <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getBg = () => {
    switch (type) {
      case 'primary': return 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30';
      case 'secondary': return 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30';
      default: return 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30';
    }
  };

  return (
    <div className={`p-6 rounded-xl border ${getBg()} shadow-sm transition-transform hover:scale-[1.02] bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
        </div>
        <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
          {getIcon()}
        </div>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{trend}</p>
    </div>
  );
};

export default StatsCard;