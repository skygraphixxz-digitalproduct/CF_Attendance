import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Student } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

interface ChartsProps {
  students: Student[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-xl rounded-lg">
        <p className="font-semibold text-slate-700 dark:text-slate-200">{label || payload[0].name}</p>
        <p className="text-blue-600 dark:text-blue-400 font-bold">{`Count: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Charts: React.FC<ChartsProps> = ({ students }) => {
  
  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => counts[s.department] = (counts[s.department] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => counts[s.gender] = (counts[s.gender] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bar Chart - Switched to Vertical Layout to handle long labels */}
      <div className="w-full min-w-0">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Attendance by Department</h4>
        {/* Dedicated container with explicit height ensures ResponsiveContainer works correctly */}
        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <BarChart 
              layout="vertical"
              data={deptData} 
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="w-full min-w-0">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Gender Distribution</h4>
        {/* Dedicated container with explicit height ensures ResponsiveContainer works correctly */}
        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;