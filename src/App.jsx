import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import EmergencyModal from './components/EmergencyModal';
import ProductDetailModal from './components/ProductDetailModal';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import SearchResultsPage from './pages/SearchResultsPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successOrderId, setSuccessOrderId] = useState('');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const { currentUser } = useAuth();

  // Sync hash routing so user can use browser back/forward or direct URLs
  useEffect(() => {
    const handleHashChange = () => {
      const fullHash = window.location.hash.replace('#', '');
      const [path, queryString] = fullHash.split('?');
      const cleanPath = (path || '').toLowerCase();

      // Check order success route #checkout/success/:id or #order-success/:id
      if (cleanPath.startsWith('checkout/success/') || cleanPath.startsWith('order-success/')) {
        const parts = fullHash.split('/');
        const orderId = parts.length > 2 ? parts[2] : parts[1];
        if (orderId) {
          setSuccessOrderId(orderId);
          setCurrentPage('order-success');
          return;
        }
      }

      if (cleanPath === 'checkout/success' || cleanPath === 'order-success') {
        const params = new URLSearchParams(queryString || '');
        const orderId = params.get('orderId') || params.get('id') || '';
        if (orderId) {
          setSuccessOrderId(orderId);
          setCurrentPage('order-success');
          return;
        }
      }

      // Check product detail route #product/prod-id
      if (cleanPath.startsWith('product/')) {
        const prodId = fullHash.split('/')[1];
        if (prodId) {
          fetch(`/api/products/${encodeURIComponent(prodId)}`)
            .then(r => r.json())
            .then(data => {
              if (data.success && data.product) {
                setSelectedProduct(data.product);
              }
            })
            .catch(() => {});
        }
        return;
      }

      if (cleanPath === 'search') {
        const params = new URLSearchParams(queryString || '');
        const q = params.get('q') || '';
        setSearchQuery(q);
        setCurrentPage('search');
        return;
      }

      if (['home', 'services', 'about', 'team', 'contact', 'dashboard', 'login', 'checkout', 'search', 'order-success'].includes(cleanPath)) {
        setCurrentPage(cleanPath);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (pageId, queryParam = '') => {
    setCurrentPage(pageId);
    if (pageId === 'home') {
      window.location.hash = '';
    } else if (pageId === 'search') {
      window.location.hash = queryParam ? `#search?q=${encodeURIComponent(queryParam)}` : '#search';
    } else if (pageId === 'order-success' || pageId === 'checkout/success') {
      window.location.hash = queryParam ? `#checkout/success/${encodeURIComponent(queryParam)}` : '#order-success';
    } else {
      window.location.hash = `#${pageId}`;
    }
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
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        onSearch={(query) => {
          setSearchQuery(query);
          navigateTo('search', query);
        }}
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

        {currentPage === 'search' && (
          <SearchResultsPage 
            searchQuery={searchQuery}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            setCurrentPage={navigateTo}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage 
            setCurrentPage={navigateTo}
            openEmergencyModal={() => setEmergencyModalOpen(true)}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage 
            onOrderSuccess={(order) => {
              const id = order?.id || order?.orderId;
              if (id) {
                setSuccessOrderId(id);
                navigateTo('order-success', id);
              } else {
                navigateTo('dashboard');
              }
            }}
            onBackToStore={() => navigateTo('services')}
          />
        )}

        {currentPage === 'order-success' && (
          <OrderSuccessPage 
            orderId={successOrderId}
            setCurrentPage={navigateTo}
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

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onNavigateCheckout={() => navigateTo('checkout')}
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
