import React, { useState } from 'react';
import { X, Download, QrCode as QrIcon } from 'lucide-react';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('https://script.google.com/');
  const [size, setSize] = useState(200);

  if (!isOpen) return null;

  // We use a reliable public API for the image source to keep implementation light and functional
  // without heavy peer dependencies like `qrcode.react` which might cause install issues in this environment.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=svg`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'attendance-qr.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error("Download failed", e);
      alert("Could not download automatically. You can right-click the image to save.");
    }
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
              <QrIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">QR Code Generator</h2>
              <p className="text-xs text-slate-500">Create a link for students to scan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target URL</label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              {url ? (
                <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-300 text-sm">
                  Enter URL to generate
                </div>
              )}
            </div>

            <button 
              onClick={handleDownload}
              disabled={!url}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;