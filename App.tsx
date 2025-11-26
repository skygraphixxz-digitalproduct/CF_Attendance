import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-700 ease-in-out bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
      <Routes>
        <Route path="/" element={<StudentForm />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster 
        position="top-center" 
        toastOptions={{
          // Default styles for all toasts
          className: '!bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-white !shadow-xl !rounded-xl border border-slate-200 dark:border-slate-700',
          duration: 4000,
          style: {
            padding: '16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          // Specific customization for success/error
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid #10b981',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
            style: {
              borderLeft: '4px solid #ef4444',
            }
          },
        }} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;