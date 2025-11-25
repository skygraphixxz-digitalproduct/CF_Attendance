import React, { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, AlertCircle } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_GAS_URL } from '../constants';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [savedUrl, setSavedUrl] = useLocalStorage<string>('attenSync_gasUrl', DEFAULT_GAS_URL);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(savedUrl || DEFAULT_GAS_URL);
    }
  }, [isOpen, savedUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (url && !url.startsWith('http')) {
      toast.error('Please enter a valid URL (starting with http/https)');
      return;
    }
    setSavedUrl(url);
    toast.success('Target URL saved successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Connection Settings</h2>
              <p className="text-xs text-slate-500">Configure Google Sheet integration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Paste your <strong>Google Apps Script Web App URL</strong> below. 
                Data submitted by students will be automatically sent to this URL.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target URL</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                placeholder="https://script.google.com/macros/s/..."
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;