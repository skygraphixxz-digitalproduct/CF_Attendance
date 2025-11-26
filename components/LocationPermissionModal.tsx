import React from 'react';
import { MapPin, X, Navigation } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLocation: () => void;
  isLoading: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ isOpen, onClose, onRequestLocation, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative transition-colors duration-300 border border-slate-100 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 animate-bounce ring-4 ring-blue-50 dark:ring-blue-900/30">
            <MapPin className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Enable Location Access</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            To ensure fair attendance tracking, we need to verify that you are physically present at the <strong>Club Fair</strong> venue.
            <br/><br/>
            Please click the button below and select <strong className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">"Allow"</strong> when prompted by your browser.
          </p>

          <button 
            onClick={onRequestLocation}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent"
          >
            {isLoading ? (
               <span className="flex items-center gap-2">Checking...</span>
            ) : (
               <>
                 <Navigation className="w-4 h-4" />
                 Allow Location Access
               </>
            )}
          </button>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-5">
            Having trouble? Check your browser settings to ensure location is enabled for this site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;