import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, User, Building, Hash, KeyRound, Loader2, Calendar, Mail, Clock } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student } from '../types';
import { DEPARTMENTS, INITIAL_STUDENTS, DEFAULT_GAS_URL } from '../constants';
import { extractStudentData } from '../services/geminiService';
import toast from 'react-hot-toast';
import LoginModal from './LoginModal';

const StudentForm: React.FC = () => {
  const [students, setStudents] = useLocalStorage<Student[]>('attenSync_data', INITIAL_STUDENTS);
  const [storedGasUrl] = useLocalStorage<string>('attenSync_gasUrl', DEFAULT_GAS_URL);
  
  // Ensure we use the default if the stored value is somehow empty or missing
  const gasUrl = storedGasUrl || DEFAULT_GAS_URL;
  
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    id: '',
    department: '',
    gender: 'Male',
    age: '',
    dob: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const toastId = toast.loading('AI analyzing ID card...');

    try {
      const extractedData = await extractStudentData(file);
      
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        // Ensure department maps to one of our constants if closely matched, otherwise keep extracted
        department: DEPARTMENTS.find(d => d.includes(extractedData.department || '')) || extractedData.department || ''
      }));
      toast.success('Details extracted successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to extract data. Please fill manually.', { id: toastId });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id || !formData.department || !formData.email || !formData.dob || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newStudent: Student = {
      id: formData.id,
      name: formData.name,
      department: formData.department,
      gender: (formData.gender as 'Male' | 'Female' | 'Other') || 'Other',
      age: formData.age,
      dob: formData.dob,
      email: formData.email,
      timestamp: new Date().toISOString()
    };

    // Save locally
    setStudents(prev => [newStudent, ...prev]);

    // Send to Google Apps Script if URL is configured
    if (gasUrl) {
      const payload = {
        studentId: newStudent.id,
        name: newStudent.name,
        gender: newStudent.gender,
        age: newStudent.age,
        dob: newStudent.dob,
        department: newStudent.department,
        email: newStudent.email
      };

      const toastId = toast.loading('Syncing with Google Sheet...');
      
      // Use no-cors mode to avoid CORS errors with Google Apps Script
      // Note: We won't get a readable response, but the data will send.
      fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain', // Important: text/plain prevents preflight OPTIONS request
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        toast.success('Attendance marked & synced!', { id: toastId });
      })
      .catch(err => {
        console.error("Sync error:", err);
        // Even if fetch fails (network), we saved locally
        toast.success('Attendance marked (Local only)', { id: toastId });
      });
    } else {
      toast.success('Attendance marked locally!');
    }

    setFormData({ name: '', id: '', department: '', gender: 'Male', age: '', dob: '', email: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass rounded-2xl shadow-xl p-8 relative overflow-hidden my-8">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AttenSync</h1>
          <p className="text-slate-500 mt-2">Mark your daily attendance instantly.</p>
        </header>

        {/* AI Upload Section */}
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`mb-6 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-400 group ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          {isProcessing ? (
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-1" />
          ) : (
            <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <p className="text-sm font-medium text-slate-700">
            {isProcessing ? 'Analyzing ID Card...' : 'Auto-fill with ID Card'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Student ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="id"
                  placeholder="S12345"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Age</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="age"
                  placeholder="20"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all text-sm"
                >
                  <option value="" disabled>Select</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Gender</label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle className="w-5 h-5" />
            Submit Attendance
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <button 
            onClick={() => setShowLogin(true)}
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <KeyRound className="w-3 h-3" />
            Admin Access
          </button>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default StudentForm;