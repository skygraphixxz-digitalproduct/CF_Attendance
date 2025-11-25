import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Student } from '../types';

interface DataTableProps {
  students: Student[];
}

const DataTable: React.FC<DataTableProps> = ({ students }) => {
  
  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Department', 'Gender', 'Timestamp'];
    const rows = students.map(s => [
      s.id,
      `"${s.name}"`, // Quote name to handle commas
      `"${s.department}"`,
      s.gender,
      s.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <FileText className="w-8 h-8 mb-2 opacity-50" />
                    No attendance records found.
                  </div>
                </td>
              </tr>
            ) : (
              students.slice(0, 10).map((student) => (
                <tr key={`${student.id}-${student.timestamp}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{student.id}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(student.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-center text-slate-400">
        Showing most recent 10 records
      </div>
    </div>
  );
};

export default DataTable;