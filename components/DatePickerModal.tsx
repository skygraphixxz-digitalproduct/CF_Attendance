import React, { useState, useEffect } from 'react';
import { X, Check, Calendar } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onSelect, initialDate }) => {
  const currentYear = new Date().getFullYear();
  
  // Helper to parse YYYY-MM-DD
  const parseDate = (d: string) => {
    if (!d) return { y: 2005, m: 0, d: 1 }; // Default to ~20 years ago
    const [yStr, mStr, dStr] = d.split('-');
    const date = new Date(parseInt(yStr), parseInt(mStr) - 1, parseInt(dStr));
    if (isNaN(date.getTime())) return { y: 2005, m: 0, d: 1 };
    return { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() };
  };

  const [selYear, setSelYear] = useState(2005);
  const [selMonth, setSelMonth] = useState(0);
  const [selDay, setSelDay] = useState(1);

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const { y, m, d } = parseDate(initialDate);
      setSelYear(y);
      setSelMonth(m);
      setSelDay(d);
    }
  }, [isOpen, initialDate]);

  // Generate Data Arrays
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i); // Current year down to 80 years ago
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate days in selected month/year
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const maxDays = getDaysInMonth(selYear, selMonth);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Auto-adjust day if it exceeds the new month's max days
  useEffect(() => {
    if (selDay > maxDays) setSelDay(maxDays);
  }, [selMonth, selYear, maxDays, selDay]);

  const handleConfirm = () => {
    const mStr = (selMonth + 1).toString().padStart(2, '0');
    const dStr = selDay.toString().padStart(2, '0');
    const isoDate = `${selYear}-${mStr}-${dStr}`;
    onSelect(isoDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Select Date of Birth</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div className="grid grid-cols-1 gap-4">
            {/* Month */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Month</label>
              <select 
                value={selMonth}
                onChange={(e) => setSelMonth(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-lg font-medium appearance-none"
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Day */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Day</label>
                <select 
                  value={selDay}
                  onChange={(e) => setSelDay(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-lg font-medium appearance-none"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Year</label>
                <select 
                  value={selYear}
                  onChange={(e) => setSelYear(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-lg font-medium appearance-none"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm Date
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;