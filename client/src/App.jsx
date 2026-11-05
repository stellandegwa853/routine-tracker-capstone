import React, { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [currentStudent, setCurrentStudent] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Authenticate user by role
  const handleLoginSuccess = (userProfile) => {
    // If the email belongs to an administrator, route to the Admin Console
    if (userProfile.email.toLowerCase().includes('admin')) {
      setAdminUser({
        name: 'Dr. Academic Affairs / Counseling Director',
        email: userProfile.email,
        role: 'ADMIN'
      });
      setCurrentPage('admin-dashboard');
    } else {
      // Standard student user
      setCurrentStudent(userProfile);
      setCurrentPage('dashboard');
    }
  };

  const handleRegisterSuccess = (newUser) => {
    setCurrentStudent(newUser);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Landing View */}
      {currentPage === 'landing' && (
        <LandingPage
          onLogin={() => setCurrentPage('login')}
          onGetStarted={() => setCurrentPage('register')}
        />
      )}

      {/* 2. Login View */}
      {currentPage === 'login' && (
        <LoginPage
          onNavigateToRegister={() => setCurrentPage('register')}
          onNavigateToLanding={() => setCurrentPage('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 3. Register View */}
      {currentPage === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {/* 4. Student Wellness Dashboard */}
      {currentPage === 'dashboard' && (
        <DashboardPage
          studentUser={currentStudent}
          onLogout={() => {
            setCurrentStudent(null);
            setCurrentPage('login');
          }}
        />
      )}

      {/* 5. System Administrator Console (Meeting 3) */}
      {currentPage === 'admin-dashboard' && (
        <AdminDashboardPage
          adminUser={adminUser}
          onLogout={() => {
            setAdminUser(null);
            setCurrentPage('login');
          }}
        />
      )}
    </div>
  );
}