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
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
        <p className="font-semibold text-slate-700">{label || payload[0].name}</p>
        <p className="text-blue-600 font-bold">{`Count: ${payload[0].value}`}</p>
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
      {/* Bar Chart */}
      <div className="h-72">
        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Attendance by Department</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deptData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="h-72">
        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Gender Distribution</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {genderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;