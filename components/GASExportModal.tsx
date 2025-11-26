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
  // Check if postData exists and is valid
  if (!e || !e.postData || !e.postData.contents) {
    return ContentService.createTextOutput("Error: Invalid request data.").setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var currentTime = new Date();
    
    // Get the spreadsheet's timezone for accurate date formatting
    var timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
    var formattedDate = Utilities.formatDate(currentTime, timezone, "MMMM dd, yyyy 'at' hh:mm a");

    // --- 1. Save to Sheet ---
    sheet.appendRow([
      currentTime,
      data.studentId,
      data.name,
      data.gender,
      data.age,
      data.dob,
      data.department,
      data.email,
      data.status // Saves 'Present' or 'Absent'
    ]);

    // --- 2. Send Email Notifications (Based on Status) ---
    if (data.email) {
      var subject = "";
      var body = "";
      
      // Base styles for the email container
      var emailContainerStyle = "font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);";
      var contentPaddingStyle = "padding: 20px 25px;";
      
      if (data.status === 'Present') {
        subject = "✅ Attendance Confirmed: Club Fair 2025";
        var headerColor = "#4CAF50"; // Green
        var accentColor = "#e8f5e9"; // Light Green
        
        body = "<div style='" + emailContainerStyle + "'>" +
                 // Header
                 "<div style='background-color: " + headerColor + "; color: white; padding: 15px 20px; text-align: center;'>" +
                   "<h1 style='margin: 0; font-size: 24px;'>Club Fair Attendance Confirmed</h1>" +
                 "</div>" +
                 // Body Content
                 "<div style='" + contentPaddingStyle + "'>" +
                   "<h2 style='color: #333; margin-top: 0;'>Hello " + data.name + ",</h2>" +
                   "<p style='color: #555; line-height: 1.6;'>Your attendance for the Club Fair has been successfully recorded. Thank you for joining us!</p>" +
                   // Status Box
                   "<div style='text-align: center; margin: 30px 0; padding: 15px; background-color: " + accentColor + "; border: 2px solid " + headerColor + "; border-radius: 6px;'>" +
                     "<p style='margin: 0; font-size: 20px; font-weight: bold; color: " + headerColor + ";'>STATUS: PRESENT</p>" +
                   "</div>" +
                   "<p style='color: #777;'><strong>Check-in Time:</strong> " + formattedDate + "</p>" +
                   "<br><p style='color: #555;'>Enjoy the event!</p>" +
                 "</div>" +
                 // Footer
                 "<div style='background-color: #f4f4f4; padding: 15px 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;'>" +
                   "<p style='margin: 0;'>Best regards,<br>Club Fair Organizing Team</p>" +
                 "</div>" +
               "</div>";
               
      } else if (data.status === 'Absent') {
        subject = "⚠️ Attendance Alert: Check-in Not Successful";
        var headerColor = "#F44336"; // Red
        var accentColor = "#ffebee"; // Light Red
        
        body = "<div style='" + emailContainerStyle + "'>" +
                 // Header
                 "<div style='background-color: " + headerColor + "; color: white; padding: 15px 20px; text-align: center;'>" +
                   "<h1 style='margin: 0; font-size: 24px;'>Club Fair Attendance Alert</h1>" +
                 "</div>" +
                 // Body Content
                 "<div style='" + contentPaddingStyle + "'>" +
                   "<h2 style='color: #333; margin-top: 0;'>Hello " + data.name + ",</h2>" +
                   "<p style='color: #555; line-height: 1.6;'>There was an issue with your check-in attempt.</p>" +
                   // Status Box
                   "<div style='text-align: center; margin: 30px 0; padding: 15px; background-color: " + accentColor + "; border: 2px solid " + headerColor + "; border-radius: 6px;'>" +
                     "<p style='margin: 0; font-size: 20px; font-weight: bold; color: " + headerColor + ";'>STATUS: ABSENT</p>" +
                   "</div>" +
                   "<p style='color: #777;'><strong>Time of Attempt:</strong> " + formattedDate + "</p>" +
                   "<p style='color: #555; line-height: 1.6; margin-top: 20px;'><strong>Please ensure you are at the designated location for a successful check-in</strong> or contact the organizing team for assistance.</p>" +
                 "</div>" +
                 // Footer
                 "<div style='background-color: #f4f4f4; padding: 15px 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;'>" +
                   "<p style='margin: 0;'>Best regards,<br>Club Fair Organizing Team</p>" +
                 "</div>" +
               "</div>";
      }
      
      if (subject && body) {
        // MailApp.sendEmail requires a recipient, subject, and body
        MailApp.sendEmail({
          to: data.email,
          subject: subject,
          htmlBody: body
        });
        Logger.log("Email sent successfully to: " + data.email + " with status: " + data.status);
      } else {
        Logger.log("Email not sent: Status was neither 'Present' nor 'Absent'.");
      }
      
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    Logger.log("An error occurred during processing: " + error.toString());
    // Return an error message to the client
    return ContentService.createTextOutput("Error: Failed to process request: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
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
              <p className="text-xs text-slate-500">Copy this code to your Google Script project to enable data saving and emails.</p>
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
            <br/>
            Note: Updates include handling for both <strong>Present</strong> and <strong>Absent</strong> emails.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GASExportModal;