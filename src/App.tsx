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
import { AuthModal } from './components/AuthModal';

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
      <AuthModal />
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
