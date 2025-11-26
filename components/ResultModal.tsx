import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Present' | 'Absent' | null;
  message: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, status, message }) => {
  if (!isOpen) return null;

  const isPresent = status === 'Present';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative transform transition-all scale-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isPresent ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isPresent ? (
              <CheckCircle className="w-10 h-10" />
            ) : (
              <XCircle className="w-10 h-10" />
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-2 ${isPresent ? 'text-green-700' : 'text-red-700'}`}>
            {isPresent ? 'Marked Present!' : 'Marked Absent'}
          </h2>
          
          <p className="text-slate-600 mb-6">
            {message}
          </p>

          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-transform active:scale-95 ${isPresent ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;