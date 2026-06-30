import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Tab, AuthPage } from './types';
import { Sprout, Loader2 } from 'lucide-react';

// Static imports — needed immediately on first render
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './components/auth/AuthLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import { authService } from './services/authService';

// Static layout imports — always visible after login
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Lazy imports — loaded on demand per active tab (code splitting)
const DashboardView = lazy(() => import('./components/DashboardView'));
const EcoPediaView = lazy(() => import('./components/EcoPediaView'));
const EcoLabView = lazy(() => import('./components/EcoLabView'));
const EcoUpdateView = lazy(() => import('./components/EcoUpdateView'));
const EcoCreationView = lazy(() => import('./components/EcoCreationView'));
const EcoChallengeView = lazy(() => import('./components/EcoChallengeView'));
const EcoContactView = lazy(() => import('./components/EcoContactView'));
const SupportView = lazy(() => import('./components/SupportView'));



// Lazy imports for Admin Panel
const AdminSidebar = lazy(() => import('./components/admin/AdminSidebar'));
const AdminDashboardView = lazy(() => import('./components/admin/AdminDashboardView'));
const AdminUsersView = lazy(() => import('./components/admin/AdminUsersView'));
const AdminEcopediaView = lazy(() => import('./components/admin/AdminEcopediaView'));
const AdminEcoupdateView = lazy(() => import('./components/admin/AdminEcoupdateView'));
const AdminEcocontactView = lazy(() => import('./components/admin/AdminEcocontactView'));
const AdminEcolabView = lazy(() => import('./components/admin/AdminEcolabView'));
const AdminLkmDataView = lazy(() => import('./components/admin/AdminLkmDataView'));

// Shared fallback for lazy-loaded tabs
function TabFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-700 opacity-60" />
    </div>
  );
}

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    register
  } = useAuth();
  
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Set default tab based on user role when authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // 1. Splash Screen while loading session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF7ED] flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="bg-white/80 p-5 rounded-3xl border border-[#154212]/15 shadow-xl flex items-center justify-center mx-auto w-20 h-20">
            <Sprout className="w-10 h-10 text-[#154212] fill-current animate-bounce" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#154212]">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Menyelaraskan Sesi GAS Anda...</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Auth pages if not logged in
  if (!isAuthenticated) {
    return (
      <AuthLayout>
        {authPage === 'login' && (
          <LoginPage 
            onNavigate={setAuthPage} 
            onLogin={login} 
          />
        )}
        {authPage === 'register' && (
          <RegisterPage 
            onNavigate={setAuthPage} 
            onRegister={register} 
          />
        )}
        {authPage === 'forgot-password' && (
          <ForgotPasswordPage 
            onNavigate={setAuthPage} 
            onForgotPassword={async (email) => { await authService.forgotPassword(email); }} 
            onResetPassword={async (email, otp, newPass) => { await authService.resetPassword(email, otp, newPass); }} 
          />
        )}
      </AuthLayout>
    );
  }

  // 3. Admin Layout
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
        <Suspense fallback={<TabFallback />}>
          <AdminSidebar 
            activeTab={activeTab as any} 
            setActiveTab={setActiveTab} 
          />
        </Suspense>

        <div id="main-container-viewport" className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
          <Header 
            activeTab={activeTab as any}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
            <Suspense fallback={<TabFallback />}>
              {activeTab === 'admin-dashboard' && (
                <AdminDashboardView setActiveTab={setActiveTab} />
              )}

              {activeTab === 'admin-users' && (
                <AdminUsersView />
              )}

              {activeTab === 'admin-ecopedia' && (
                <AdminEcopediaView />
              )}

              {activeTab === 'admin-ecoupdate' && (
                <AdminEcoupdateView />
              )}

              {activeTab === 'admin-ecocontact' && (
                <AdminEcocontactView />
              )}

              {activeTab === 'admin-ecolab' && (
                <AdminEcolabView />
              )}

              {activeTab === 'admin-lkm-data' && (
                <AdminLkmDataView />
              )}
            </Suspense>
          </main>
        </div>
      </div>
    );
  }



  // 5. Main student dashboard (Default)
  return (
    <div className="min-h-screen bg-[#FFF7ED] flex font-sans antialiased text-gray-800">
      
      <Sidebar 
        activeTab={activeTab as Tab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setSelectedBookId(null);
        }} 
      />

      <div id="main-container-viewport" className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
        
        <Header 
          activeTab={activeTab as Tab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                setActiveTab={(tab) => setActiveTab(tab as string)} 
              />
            )}

            {activeTab === 'ecopedia' && (
              <EcoPediaView 
                searchQuery={searchQuery} 
                initialBookId={selectedBookId}
                onClearInitialBook={() => setSelectedBookId(null)}
              />
            )}

            {activeTab === 'ecolab' && (
              <EcoLabView 
                setActiveTab={(tab) => setActiveTab(tab as string)} 
                onSelectBook={setSelectedBookId}
              />
            )}

            {activeTab === 'ecoupdate' && (
              <EcoUpdateView 
                searchQuery={searchQuery} 
              />
            )}

            {activeTab === 'ecocreation' && (
              <EcoCreationView 
                searchQuery={searchQuery} 
              />
            )}

            {activeTab === 'ecochallenge' && (
              <EcoChallengeView />
            )}

            {activeTab === 'ecocontact' && (
              <EcoContactView />
            )}

            {activeTab === 'support' && (
              <SupportView />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
