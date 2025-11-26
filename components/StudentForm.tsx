import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, User, Building, Hash, KeyRound, Loader2, Calendar, Mail, Clock, MapPin } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student } from '../types';
import { DEPARTMENTS, INITIAL_STUDENTS, DEFAULT_GAS_URL, TARGET_LOCATION } from '../constants';
import { extractStudentData } from '../services/geminiService';
import toast from 'react-hot-toast';
import LoginModal from './LoginModal';
import ResultModal from './ResultModal';
import DatePickerModal from './DatePickerModal';
import LocationPermissionModal from './LocationPermissionModal';
import ThemeToggle from './ThemeToggle';

// Note: To run this code, you need to ensure the following are defined:
// 1. types.ts (defining Student)
// 2. constants.ts (defining DEPARTMENTS, INITIAL_STUDENTS, DEFAULT_GAS_URL, TARGET_LOCATION)
// 3. hooks/useLocalStorage.ts
// 4. services/geminiService.ts (defining extractStudentData)
// 5. Components: LoginModal, ResultModal, DatePickerModal, LocationPermissionModal

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  
  const [resultModal, setResultModal] = useState<{ isOpen: boolean; status: 'Present' | 'Absent' | null; message: string }>({
    isOpen: false,
    status: null,
    message: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Haversine Formula for distance
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Distance in meters
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // Helper: Title Case Name
  const formatName = (name: string) => {
    // Capitalize first letter of each word, rest lowercase
    return name.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  // Helper: Calculate Age
  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      setFormData(prev => ({ ...prev, [name]: formatName(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ 
      ...prev, 
      dob: date, 
      age: calculateAge(date) 
    }));
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
        // Format name if extracted
        name: extractedData.name ? formatName(extractedData.name) : prev.name,
        // Ensure department maps to one of our constants if closely matched, otherwise keep extracted
        department: DEPARTMENTS.find(d => d.includes(extractedData.department || '')) || extractedData.department || '',
        // Calculate age if DOB is extracted
        age: extractedData.dob ? calculateAge(extractedData.dob) : prev.age
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

  const handleVerifyLocation = () => {
    setIsVerifyingLocation(true);
    if (!navigator.geolocation) {
       toast.error("Geolocation not supported by this browser.");
       setIsVerifyingLocation(false);
       setShowLocationModal(false);
       return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = getDistanceFromLatLonInMeters(
          position.coords.latitude,
          position.coords.longitude,
          TARGET_LOCATION.lat,
          TARGET_LOCATION.lng
        );
        
        setIsVerifyingLocation(false);
        setShowLocationModal(false);
        
        if (distance <= TARGET_LOCATION.radiusMeters) {
            toast.success("Location Verified! You are in the correct area.");
        } else {
            toast.error(`You are detected ${Math.round(distance)}m away. Please move closer to the event.`);
        }
      },
      (error) => {
        setIsVerifyingLocation(false);
        console.error(error);
        toast.error("Location access denied or failed. Please check browser settings.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id || !formData.department || !formData.email || !formData.dob || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Verifying location and submitting...');

    // Location Check
    let attendanceStatus: 'Present' | 'Absent' = 'Absent';
    let statusMessage = '';

    try {
      await new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const distance = getDistanceFromLatLonInMeters(
              position.coords.latitude,
              position.coords.longitude,
              TARGET_LOCATION.lat,
              TARGET_LOCATION.lng
            );

            if (distance <= TARGET_LOCATION.radiusMeters) {
              attendanceStatus = 'Present';
              statusMessage = `Thank you for attending the Club Fair! Enjoy the event.`;
            } else {
              attendanceStatus = 'Absent';
              statusMessage = `You are detected outside the event area (${Math.round(distance)}m away). Attendance marked as Absent.`;
            }
            resolve();
          },
          (error) => {
            console.error("Location error:", error);
            attendanceStatus = 'Absent';
            statusMessage = 'Location access is required to be marked Present. Access denied or failed.';
            resolve(); // Resolve anyway to proceed with saving as Absent
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });
    } catch (err) {
      console.error(err);
      attendanceStatus = 'Absent';
      statusMessage = 'Could not verify location.';
    }

    const newStudent: Student = {
      id: formData.id!,
      name: formData.name!,
      department: formData.department!,
      gender: (formData.gender as 'Male' | 'Female' | 'Other') || 'Other',
      age: formData.age!,
      dob: formData.dob!,
      email: formData.email!,
      timestamp: new Date().toISOString(),
      attendanceStatus: attendanceStatus
    };

    // Save locally
    setStudents(prev => [newStudent, ...prev]);

    // Send to Google Apps Script
    if (gasUrl) {
      const payload = {
        studentId: newStudent.id,
        name: newStudent.name,
        gender: newStudent.gender,
        age: newStudent.age,
        dob: newStudent.dob,
        department: newStudent.department,
        email: newStudent.email ? newStudent.email.trim() : '',
        status: newStudent.attendanceStatus
      };
      
      console.log("Sending payload to GAS:", payload);

      fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        toast.dismiss(toastId);
      })
      .catch(err => {
        console.error("Sync error:", err);
        toast.dismiss(toastId);
      });
    } else {
      toast.dismiss(toastId);
    }

    setIsSubmitting(false);
    
    // Show Result Modal
    setResultModal({
      isOpen: true,
      status: attendanceStatus,
      message: statusMessage
    });

    setFormData({ name: '', id: '', department: '', gender: 'Male', age: '', dob: '', email: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Theme Toggle Positioned Bottom Right (Floating) */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in hover:scale-110 transition-transform duration-300">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg glass rounded-2xl shadow-xl p-5 sm:p-8 relative overflow-hidden my-8 transition-colors duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Club Fair Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">Mark your daily attendance instantly.</p>
        </header>

        {/* AI Upload Section */}
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`mb-6 border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-600 group ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
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
            <div className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
            {isProcessing ? 'Analyzing ID Card...' : 'Auto-fill with ID Card'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student ID & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Student ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="id"
                  placeholder="S12345"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Date of Birth & Age (Responsive Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Date of Birth</label>
              <div 
                className="relative cursor-pointer group"
                onClick={() => setShowDateModal(true)}
              >
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <div className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group-hover:border-blue-400 transition-all text-sm min-h-[38px] flex items-center min-w-0">
                  {formData.dob ? (
                     <span className="text-slate-800 dark:text-white">
                       {new Date(formData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                     </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Select Date</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Age</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="age"
                  placeholder="20"
                  value={formData.age}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none transition-all text-sm cursor-not-allowed text-slate-600 dark:text-slate-300"
              />
              </div>
            </div>
          </div>

          {/* Department & Gender (Responsive Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all text-sm"
                >
                  <option value="" disabled className="dark:bg-slate-800">Select</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="dark:bg-slate-800">{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Gender</label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all text-sm"
                >
                  <option value="Male" className="dark:bg-slate-800">Male</option>
                  <option value="Female" className="dark:bg-slate-800">Female</option>
                  <option value="Other" className="dark:bg-slate-800">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Location Requirement Notice */}
          <div className="bg-blue-50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3 shadow-sm">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed font-medium">
                Location verification required. Please allow access to mark attendance.
              </p>
              <button 
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline mt-1.5 transition-colors"
              >
                Check Location Access
              </button>
            </div>
          </div>

          {/* Submit Button (Enhanced for touch target) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {isSubmitting ? 'Verifying...' : 'Submit Attendance'}
          </button>
        </form>

        {/* Footer and Admin Access */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button 
            onClick={() => setShowLogin(true)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1 mx-auto transition-colors mb-4"
          >
            <KeyRound className="w-3 h-3" />
            Admin Access
          </button>
          
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2025 JM Arcayna. All Rights Reserved.
          </p>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      
      <ResultModal 
        isOpen={resultModal.isOpen} 
        onClose={() => setResultModal(prev => ({ ...prev, isOpen: false }))} 
        status={resultModal.status} 
        message={resultModal.message}
      />

      <DatePickerModal 
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelect={handleDateSelect}
        initialDate={formData.dob || ''}
      />
      
      <LocationPermissionModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestLocation={handleVerifyLocation}
        isLoading={isVerifyingLocation}
      />
    </div>
  );
};

export default StudentForm;