import React, { useState, useMemo } from 'react';
import { Download, Search, CheckCircle, XCircle, FileText, Trash2 } from 'lucide-react';
import { Student } from '../types';
import { DEPARTMENTS } from '../constants';

interface DataTableProps {
  students: Student[];
  onDelete: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ students, onDelete }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get list of tabs including 'All'
  const tabs = ['All', ...DEPARTMENTS];

  // Filter students based on active tab and search term
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter by Department
      const matchesDept = activeTab === 'All' || student.department === activeTab;
      
      // Filter by Search (ID or Name)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        student.id.toLowerCase().includes(searchLower) || 
        student.name.toLowerCase().includes(searchLower);

      return matchesDept && matchesSearch;
    });
  }, [students, activeTab, searchTerm]);

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Department', 'Gender', 'Age', 'DOB', 'Email', 'Status', 'Timestamp'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.department}"`,
      s.gender,
      s.age,
      s.dob,
      s.email,
      s.attendanceStatus,
      s.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Toolbar: Search & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
        
        <button 
          onClick={downloadCSV}
          disabled={filteredStudents.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export {activeTab} CSV
        </button>
      </div>
      
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 mb-3 opacity-20" />
                      <p>No records found for {activeTab}</p>
                      {searchTerm && <p className="text-xs mt-1">Try adjusting your search</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={`${student.id}-${student.timestamp}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white font-mono">{student.id}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${student.department === 'BSIT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          student.department === 'BSHM' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          student.department === 'BSTM' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' :
                          student.department === 'BSBA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                        {student.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border
                        ${student.attendanceStatus === 'Present' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}>
                        {student.attendanceStatus === 'Present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {student.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(student.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete(student.id)}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
           <span>Showing {filteredStudents.length} records</span>
           <span>Exporting will download {filteredStudents.length} rows</span>
        </div>
      </div>
    </div>
  );
};

export default DataTable;