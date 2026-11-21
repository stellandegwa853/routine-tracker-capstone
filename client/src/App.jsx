import React, { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import { supabase } from './supabaseClient';
import { fetchProfile, signOut } from './services/authService';

const pageForProfile = (profile) => (profile.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard');

export default function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [currentUser, setCurrentUser] = useState(null);

  // Restore an existing Supabase session on page load, and react when it ends.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;
        const profile = authUser ? await fetchProfile(authUser.id) : null;
        if (!active) return;

        if (profile && profile.accountStatus === 'Active') {
          setCurrentUser(profile);
          setCurrentPage(pageForProfile(profile));
        } else {
          if (authUser) await signOut();
          setCurrentPage('landing');
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        if (active) setCurrentPage('landing');
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) {
        setCurrentUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthenticated = (profile) => {
    setCurrentUser(profile);
    setCurrentPage(pageForProfile(profile));
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentPage('login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {currentPage === 'loading' && (
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
          Loading...
        </div>
      )}

      {currentPage === 'landing' && (
        <LandingPage
          onLogin={() => setCurrentPage('login')}
          onGetStarted={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage
          onNavigateToRegister={() => setCurrentPage('register')}
          onNavigateToLanding={() => setCurrentPage('landing')}
          onLoginSuccess={handleAuthenticated}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={handleAuthenticated}
        />
      )}

      {currentPage === 'dashboard' && currentUser && (
        <DashboardPage studentUser={currentUser} onLogout={handleLogout} />
      )}

      {currentPage === 'admin-dashboard' && currentUser && (
        <AdminDashboardPage adminUser={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}
