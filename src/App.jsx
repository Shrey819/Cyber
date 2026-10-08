import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import EmergencyModal from './components/EmergencyModal';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const { currentUser } = useAuth();

  // Sync hash routing so user can use browser back/forward or direct URLs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['home', 'services', 'about', 'team', 'contact', 'dashboard', 'login'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
    window.location.hash = pageId === 'home' ? '' : `#${pageId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Common Login Page
  if (currentPage === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={(user) => navigateTo('dashboard')}
        onExitToSite={() => navigateTo('home')}
      />
    );
  }

  // If on dashboard, render the dedicated high-tech full-screen portal shell
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
        <DashboardPage 
          onExitToSite={() => navigateTo('home')}
          openLoginModal={() => setLoginModalOpen(true)}
        />

        {/* Global Modals available within Dashboard as well */}
        <LoginModal 
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onLoginSuccess={(user) => navigateTo('dashboard')}
        />

        <EmergencyModal 
          isOpen={emergencyModalOpen}
          onClose={() => setEmergencyModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Global Marketing Navigation */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={navigateTo}
        openLoginModal={() => setLoginModalOpen(true)}
        openEmergencyModal={() => setEmergencyModalOpen(true)}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage 
            setCurrentPage={navigateTo}
            openLoginModal={() => setLoginModalOpen(true)}
            openEmergencyModal={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage 
            setCurrentPage={navigateTo}
            openEmergencyModal={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            setCurrentPage={navigateTo}
            openEmergencyModal={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'team' && (
          <TeamPage 
            setCurrentPage={navigateTo}
            openEmergencyModal={() => setEmergencyModalOpen(true)}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage 
            openEmergencyModal={() => setEmergencyModalOpen(true)}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer 
        setCurrentPage={navigateTo}
        openLoginModal={() => setLoginModalOpen(true)}
        openEmergencyModal={() => setEmergencyModalOpen(true)}
      />

      {/* Client Authentication Modal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => navigateTo('dashboard')}
      />

      {/* 24/7 Security Incident Response Dispatch Modal */}
      <EmergencyModal 
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
