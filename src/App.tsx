import React from 'react';
import { OrbitaProvider, useOrbita } from './context/OrbitaContext';
import { LandingPage } from './components/LandingPage';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { FriendsView } from './components/FriendsView';
import { VoiceRoomView } from './components/VoiceRoomView';
import { WanderingPlanetWidget } from './components/WanderingPlanetWidget';
import { Soundboard } from './components/Soundboard';
import { ProfileModal } from './components/ProfileModal';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { InviteModal } from './components/InviteModal';
import { ServerModal } from './components/ServerModal';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastNotification: React.FC = () => {
  const { toastMessage } = useOrbita();
  if (!toastMessage) return null;

  const type = toastMessage.type || 'info';
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-950/80',
    error: 'border-rose-500/30 bg-rose-950/80',
    warning: 'border-amber-500/30 bg-amber-950/80',
    info: 'border-cyan-500/30 bg-cyan-950/80',
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-auto px-4 py-3 rounded-2xl glass-panel border shadow-2xl backdrop-blur-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold text-white animate-fade-in pointer-events-none">
      {icons[type]}
      <span className="truncate">{toastMessage.text}</span>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { 
    activeView, 
    inVoiceCall, 
    isViewingVoiceRoom, 
    navigationMode, 
    currentServer 
  } = useOrbita();

  if (activeView === 'landing') {
    return (
      <>
        <LandingPage />
        <AuthModal />
        <ServerModal />
        <InviteModal />
        <ToastNotification />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-theme-main text-theme-main font-sans antialiased">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Workspace: Left Sidebar + Center Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Modular Sidebar */}
        <Sidebar />

        {/* Center / Right Content:
            - If in voice call and viewing voice room: Voice Room View (Constellation + screen share)
            - If choosing text channel while in voice: Chat View + Wandering Planet floats!
            - If in friends mode: Friends View (Hub & Private DMs)
            - If in server mode: Server Channel Chat View
        */}
        <main className="flex-1 flex overflow-hidden relative">
          {inVoiceCall && isViewingVoiceRoom ? (
            <VoiceRoomView />
          ) : navigationMode === 'friends' || !currentServer ? (
            <FriendsView />
          ) : (
            <ChatView />
          )}
        </main>
      </div>

      {/* Wandering Planet widget when navigating text channels while in voice call */}
      <WanderingPlanetWidget />

      {/* Global Modals */}
      <Soundboard />
      <ProfileModal />
      <ServerSettingsModal />
      <InviteModal />
      <ServerModal />
      <AuthModal />

      {/* Floating Toast Notification */}
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <OrbitaProvider>
      <MainAppContent />
    </OrbitaProvider>
  );
}
