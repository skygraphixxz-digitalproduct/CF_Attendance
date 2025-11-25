import React, { useState } from 'react';
import { X, Copy, Check, FileCode } from 'lucide-react';
import { Student } from '../types';

interface GASExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GASExportModal: React.FC<GASExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState('');

  if (!isOpen) return null;

  const code = `
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.studentId,
    data.name,
    data.gender,
    data.age,
    data.dob,
    data.department,
    data.email
  ]);
  
  return ContentService.createTextOutput("Success");
}
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied('code');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Google Apps Script Code</h2>
              <p className="text-xs text-slate-500">Copy this code to your Google Script project</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="relative group">
            <div className="absolute right-2 top-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-white/90 shadow-sm border border-slate-200 rounded-lg hover:bg-white transition-all"
                title="Copy Code"
              >
                {copied === 'code' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
              {code}
            </pre>
          </div>
          <p className="mt-4 text-xs text-slate-500 text-center">
            Deploy this as a <strong>Web App</strong> with access set to <strong>"Anyone"</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GASExportModal;