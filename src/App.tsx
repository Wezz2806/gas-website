import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Tab, AuthPage, Room } from './types';
import { Sprout, Loader2 } from 'lucide-react';

// Static imports — needed immediately on first render
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './components/auth/AuthLayout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import { authService } from './services/authService';

// Static layout imports — always visible inside a room
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Room List (Landing Page after login for students)
const RoomListView = lazy(() => import('./components/RoomListView'));

// Lazy imports — room-scoped views loaded on demand (code splitting)
const DashboardView = lazy(() => import('./components/DashboardView'));
const EcoPediaView = lazy(() => import('./components/EcoPediaView'));
const EcoLabView = lazy(() => import('./components/EcoLabView'));
const EcoCreationView = lazy(() => import('./components/EcoCreationView'));
const EcoChallengeView = lazy(() => import('./components/EcoChallengeView'));

// Lazy imports for Admin Panel
const AdminSidebar = lazy(() => import('./components/admin/AdminSidebar'));
const AdminDashboardView = lazy(() => import('./components/admin/AdminDashboardView'));
const AdminUsersView = lazy(() => import('./components/admin/AdminUsersView'));
const AdminRoomsView = lazy(() => import('./components/admin/AdminRoomsView'));
const AdminEcopediaView = lazy(() => import('./components/admin/AdminEcopediaView'));
const AdminEcolabView = lazy(() => import('./components/admin/AdminEcolabView'));
const AdminEcochallengeView = lazy(() => import('./components/admin/AdminEcochallengeView'));
const AdminEcocreationView = lazy(() => import('./components/admin/AdminEcocreationView'));

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

  // ── Room State Machine ────────────────────────────────────────────
  // null = show RoomList, Room object = inside that room
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  // Admin active tab
  const [adminTab, setAdminTab] = useState<string>('admin-dashboard');

  // Reset when user changes / logs in
  useEffect(() => {
    setCurrentRoom(null);
    setActiveTab('dashboard');
    setSearchQuery('');
    setSelectedBookId(null);
    if (user?.role === 'admin') {
      setAdminTab('admin-dashboard');
    }
  }, [user]);

  const handleSelectRoom = (room: Room) => {
    setCurrentRoom(room);
    setActiveTab('dashboard');
    setSearchQuery('');
    setSelectedBookId(null);
  };

  const handleBackToRooms = () => {
    setCurrentRoom(null);
    setActiveTab('dashboard');
    setSearchQuery('');
    setSelectedBookId(null);
  };

  // ── 1. Splash Screen ─────────────────────────────────────────────
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

  // ── 2. Auth pages if not logged in ───────────────────────────────
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

  // ── 3. Admin Layout ───────────────────────────────────────────────
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
        <Suspense fallback={<TabFallback />}>
          <AdminSidebar 
            activeTab={adminTab as any} 
            setActiveTab={(tab: any) => setAdminTab(tab)} 
          />
        </Suspense>

        <div id="main-container-viewport" className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
          <Header 
            activeTab={adminTab as any}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
            <Suspense fallback={<TabFallback />}>
              {adminTab === 'admin-dashboard' && (
                <AdminDashboardView setActiveTab={(tab: any) => setAdminTab(tab)} />
              )}
              {adminTab === 'admin-rooms' && (
                <AdminRoomsView />
              )}
              {adminTab === 'admin-users' && (
                <AdminUsersView />
              )}
              {adminTab === 'admin-ecopedia' && (
                <AdminEcopediaView />
              )}
              {adminTab === 'admin-ecolab' && (
                <AdminEcolabView />
              )}
              {adminTab === 'admin-ecochallenge' && (
                <AdminEcochallengeView />
              )}
              {adminTab === 'admin-ecocreation' && (
                <AdminEcocreationView />
              )}
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // ── 4. Student: Room List (landing page) ──────────────────────────
  if (!currentRoom) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-[#FFF7ED] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 opacity-60" />
        </div>
      }>
        <RoomListView onSelectRoom={handleSelectRoom} />
      </Suspense>
    );
  }

  // ── 5. Student: Inside a Room ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF7ED] flex font-sans antialiased text-gray-800">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setSelectedBookId(null);
        }}
        currentRoom={currentRoom}
        onBackToRooms={handleBackToRooms}
      />

      <div id="main-container-viewport" className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
        
        <Header 
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentRoom={currentRoom}
          onBackToRooms={handleBackToRooms}
        />

        <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
          <Suspense fallback={<TabFallback />}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                setActiveTab={(tab) => setActiveTab(tab as Tab)}
                currentRoom={currentRoom}
              />
            )}

            {activeTab === 'ecopedia' && (
              <EcoPediaView 
                searchQuery={searchQuery} 
                initialBookId={selectedBookId}
                onClearInitialBook={() => setSelectedBookId(null)}
                roomId={currentRoom.id}
              />
            )}

            {activeTab === 'ecolab' && (
              <EcoLabView 
                setActiveTab={(tab) => setActiveTab(tab as Tab)}
                onSelectBook={setSelectedBookId}
                roomId={currentRoom.id}
              />
            )}

            {activeTab === 'ecocreation' && (
              <EcoCreationView 
                searchQuery={searchQuery}
                roomId={currentRoom.id}
              />
            )}

            {activeTab === 'ecochallenge' && (
              <EcoChallengeView 
                roomId={currentRoom.id}
              />
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
