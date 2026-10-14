import React, { useState, useEffect, useRef } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Volume2, 
  PhoneOff, 
  Radio, 
  Maximize2, 
  Minimize2, 
  UserPlus, 
  MessageSquare, 
  Settings, 
  Film, 
  Eye, 
  Columns, 
  RotateCcw, 
  ShieldAlert, 
  Send, 
  Check, 
  X,
  Subtitles,
  Headphones,
  LogOut,
  EyeOff
} from 'lucide-react';
import { UserProfile, ScreenShareStream, ScreenLayoutMode } from '../types';
import { SimulatedScreenCanvas } from './SimulatedScreenCanvas';
import { WatchPartyPlayer } from './WatchPartyPlayer';
import { WatchPartyModal } from './WatchPartyModal';
import { UserContextMenu } from './UserContextMenu';

interface DepartedItem {
  id: string;
  name: string;
  avatarUrl: string;
  isLocal: boolean;
  userObj: UserProfile;
}

export const VoiceRoomView: React.FC = () => {
  const { 
    currentUser, 
    voiceChannel, 
    voiceCallTitle, 
    disconnectVoice, 
    isMuted, 
    toggleMute, 
    isDeafened, 
    toggleDeafen, 
    isScreenSharing, 
    toggleScreenShare, 
    isCameraOn, 
    toggleCamera, 
    screenShareStream, 
    simulatedVoiceParticipants, 
    setInviteModalOpen, 
    setSoundboardModalOpen, 
    watchParty, 
    watchPartyModalOpen, 
    setWatchPartyModalOpen, 
    screenLayoutMode, 
    setScreenLayoutMode, 
    activeMainScreenId, 
    setActiveMainScreenId, 
    simulatedScreenSharers, 
    toggleSimulatedScreenShare, 
    messages, 
    sendMessage, 
    userVolumes, 
    localMutedUsers, 
    toggleLocalMuteUser, 
    serverMutedUsers, 
    serverDeafenedUsers,
    isSpeaking,
    isTranscriptionActive,
    toggleTranscription,
    liveCaptions
  } = useOrbita();

  // State for toggling side voice chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sideChatMessage, setSideChatMessage] = useState('');

  // Explicit state: Whether the user is actively viewing the screen share
  // "ta faltando um botão pra sair da tela de compartilhamento de alguem"
  const [isViewingScreen, setIsViewingScreen] = useState(true);

  // Local drift state: user muted & deafened
  const [isLocalDriftedAway, setIsLocalDriftedAway] = useState(false);

  // Selected participant for quick preview card
  const [selectedUserPreview, setSelectedUserPreview] = useState<UserProfile | null>(null);

  // Maximize / Cinema Mode for videos & screens
  const [cinemaMode, setCinemaMode] = useState(false);

  // Context Menu State (Right-click on user)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: UserProfile;
  } | null>(null);

  const handleUserContextMenu = (e: React.MouseEvent, targetUser: UserProfile) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUserPreview(targetUser);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user: targetUser
    });
  };

  // Mute & Deafen state for simulated participants in the room
  const [mutedParticipants, setMutedParticipants] = useState<Record<string, boolean>>({});
  const [deafenedParticipants, setDeafenedParticipants] = useState<Record<string, boolean>>({});

  // Animation tracking for departure and arrival
  const [animatingReturn, setAnimatingReturn] = useState<Record<string, boolean>>({});

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const sideChatEndRef = useRef<HTMLDivElement>(null);

  // Hook up native screen stream if active
  useEffect(() => {
    if (localVideoRef.current && screenShareStream) {
      localVideoRef.current.srcObject = screenShareStream;
      localVideoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [screenShareStream, isScreenSharing]);

  // If local user starts sharing, ensure screen viewing is active
  useEffect(() => {
    if (isScreenSharing) {
      setIsViewingScreen(true);
    }
  }, [isScreenSharing]);

  // Auto scroll voice chat
  useEffect(() => {
    if (isChatOpen) {
      sideChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Build active screen share streams list
  const activeStreams: ScreenShareStream[] = [];

  // 1. Local user screen share
  if (isScreenSharing) {
    activeStreams.push({
      id: currentUser.id,
      userId: currentUser.id,
      userName: `${currentUser.name} (Você)`,
      userAvatar: currentUser.avatarUrl,
      title: 'Sua Tela (Transmissão Nativa)',
      appName: 'Orb.co Desktop',
      category: 'general',
      isLocal: true,
      mediaStream: screenShareStream,
      fps: 60,
    });
  }

  // 2. Simulated participants screen shares (Clara, Lucas, Arthur)
  simulatedVoiceParticipants.forEach(p => {
    if (simulatedScreenSharers[p.id]) {
      let mockType: 'code' | 'game' | 'design' = 'code';
      let title = `Tela de ${p.name}`;
      let appName = 'App';

      if (p.id.includes('clara')) {
        mockType = 'design';
        title = 'Figma — Design System Orb.co';
        appName = 'Figma';
      } else if (p.id.includes('lucas')) {
        mockType = 'code';
        title = 'VS Code — WebRTC Mesh Core';
        appName = 'VS Code';
      } else if (p.id.includes('arthur')) {
        mockType = 'game';
        title = 'Gameplay ao Vivo (Cyberpunk)';
        appName = 'Steam';
      }

      activeStreams.push({
        id: p.id,
        userId: p.id,
        userName: p.name,
        userAvatar: p.avatarUrl,
        title,
        appName,
        category: mockType === 'game' ? 'gaming' : mockType === 'design' ? 'design' : 'coding',
        isLocal: false,
        mockType,
        fps: 60,
      });
    }
  });

  const hasActiveScreens = activeStreams.length > 0;
  const isWatchPartyActive = !!watchParty?.isActive;

  // Whether video/screen sharing is actively shown on screen
  const isShowingScreenViewer = (hasActiveScreens && isViewingScreen) || isWatchPartyActive;

  // Selected focal screen
  let currentMainScreen = activeStreams.find(s => s.id === activeMainScreenId);
  if (!currentMainScreen && activeStreams.length > 0) {
    currentMainScreen = activeStreams[0];
  }

  // Send message in side voice chat
  const handleSendSideChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideChatMessage.trim()) return;
    sendMessage(sideChatMessage);
    setSideChatMessage('');
  };

  // Toggle local mute + deafen (drift to dock)
  const toggleLocalMuteAndDeafen = () => {
    if (!isLocalDriftedAway) {
      if (!isMuted) toggleMute();
      if (!isDeafened) toggleDeafen();
      setIsLocalDriftedAway(true);
    } else {
      if (isMuted) toggleMute();
      if (isDeafened) toggleDeafen();
      setIsLocalDriftedAway(false);
      setAnimatingReturn(prev => ({ ...prev, [currentUser.id]: true }));
      setTimeout(() => {
        setAnimatingReturn(prev => ({ ...prev, [currentUser.id]: false }));
      }, 700);
    }
  };

  const toggleParticipantMute = (id: string) => {
    setMutedParticipants(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleParticipantDeafenAndMute = (id: string) => {
    const isCurrentlyDeparted = !!mutedParticipants[id] && !!deafenedParticipants[id];
    if (!isCurrentlyDeparted) {
      setMutedParticipants(prev => ({ ...prev, [id]: true }));
      setDeafenedParticipants(prev => ({ ...prev, [id]: true }));
    } else {
      setMutedParticipants(prev => ({ ...prev, [id]: false }));
      setDeafenedParticipants(prev => ({ ...prev, [id]: false }));
      setAnimatingReturn(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setAnimatingReturn(prev => ({ ...prev, [id]: false }));
      }, 700);
    }
  };

  const departedList: DepartedItem[] = [];
  if (isLocalDriftedAway) {
    departedList.push({
      id: currentUser.id,
      name: `${currentUser.name} (Você)`,
      avatarUrl: currentUser.avatarUrl,
      isLocal: true,
      userObj: currentUser,
    });
  }

  simulatedVoiceParticipants.forEach(p => {
    const isMutedBoth = (!!mutedParticipants[p.id] && !!deafenedParticipants[p.id]) || !!serverDeafenedUsers[p.id];
    if (isMutedBoth) {
      departedList.push({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        isLocal: false,
        userObj: p,
      });
    }
  });

  const maxVisibleDeparted = 5;
  const visibleDeparted = departedList.slice(0, maxVisibleDeparted);
  const extraDepartedCount = departedList.length - maxVisibleDeparted;

  const restoreDeparted = (item: DepartedItem) => {
    if (item.isLocal) {
      toggleLocalMuteAndDeafen();
    } else {
      toggleParticipantDeafenAndMute(item.id);
    }
  };

  const handleOrbitUserClick = (user: UserProfile) => {
    setSelectedUserPreview(user);
    if (user.id === currentUser.id) {
      if (isScreenSharing) {
        setActiveMainScreenId(currentUser.id);
        setIsViewingScreen(true);
      }
    } else if (simulatedScreenSharers[user.id]) {
      setActiveMainScreenId(user.id);
      setIsViewingScreen(true);
      if (screenLayoutMode === 'cinema') {
        setScreenLayoutMode('single');
      }
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full bg-theme-main text-slate-100 overflow-hidden select-none relative transition-colors ${cinemaMode ? 'p-1' : 'p-3 sm:p-4'}`}>
      
      {/* =========================================================================
          TOP HEADER: Clean, minimal, informative toolbar (Matching Image 5 & 6)
          ========================================================================= */}
      <div className="h-10 mb-2 px-1 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            <span className="font-bold text-white truncate text-sm">
              {voiceCallTitle || voiceChannel?.name || 'Voz Geral'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {simulatedVoiceParticipants.length + 1} conectado{simulatedVoiceParticipants.length > 0 ? 's' : ''}
          </span>

          {/* If screens are active but user closed screen viewer, show clickable pill to return */}
          {hasActiveScreens && !isViewingScreen && (
            <button
              onClick={() => setIsViewingScreen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all cursor-pointer shadow-sm animate-pulse"
              title="Clique para voltar a assistir a tela"
            >
              <Monitor className="w-3 h-3 text-cyan-400" />
              <span>{currentMainScreen?.userName} transmitindo • Assistir Tela ↗</span>
            </button>
          )}

          {hasActiveScreens && isViewingScreen && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-medium flex items-center gap-1 border border-cyan-500/20">
              <Monitor className="w-3 h-3" />
              <span>{activeStreams.length} tela{activeStreams.length > 1 ? 's' : ''} ativa{activeStreams.length > 1 ? 's' : ''}</span>
            </span>
          )}

          {isWatchPartyActive && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-medium flex items-center gap-1 border border-indigo-500/30">
              <Film className="w-3 h-3 text-cyan-400" />
              <span>CineOrbita Ativo</span>
            </span>
          )}

          {isLocalDriftedAway && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
              Afastado da órbita
            </span>
          )}
        </div>

        {/* Action icons in top bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasActiveScreens && isViewingScreen && !isWatchPartyActive && (
            <div className="flex items-center gap-0.5 bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setScreenLayoutMode('single')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  screenLayoutMode === 'single'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Foco (Uma tela principal)"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden md:inline">Foco</span>
              </button>

              <button
                onClick={() => setScreenLayoutMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  screenLayoutMode === 'split'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo Dividir Telas (Ver todas lado a lado)"
              >
                <Columns className="w-3 h-3" />
                <span className="hidden md:inline">Dividir</span>
              </button>
            </div>
          )}

          {/* Cinema mode toggle */}
          {isShowingScreenViewer && (
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={cinemaMode ? 'Restaurar layout' : 'Modo Foco Máximo'}
            >
              {cinemaMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MAIN RESPONSIVE CONTENT LAYOUT (Modular Bubble Cards)
          ========================================================================= */}
      <div className="flex-1 grid grid-cols-12 gap-3 sm:gap-4 min-h-0 overflow-hidden relative pb-16">

        {/* -----------------------------------------------------------------------
            PANEL 1: ORBIT MODULE (CONSTELLATION CARD - Matching Image 5 & 6)
            ----------------------------------------------------------------------- */}
        {!cinemaMode && (
          <div className={`rounded-3xl bubble-card p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-2xl overflow-hidden relative transition-all duration-300 ${
            !isShowingScreenViewer
              ? (!isChatOpen ? 'col-span-12' : 'col-span-12 lg:col-span-8 xl:col-span-9')
              : (!isChatOpen ? 'col-span-12 lg:col-span-4 xl:col-span-3' : 'col-span-12 lg:col-span-3 xl:col-span-3')
          }`}>
            {/* Top Orbit Header */}
            <div className="flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wider uppercase">
                  {isShowingScreenViewer ? 'Órbitas' : 'Voz & Constelação'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono">
                  {simulatedVoiceParticipants.length + 1}
                </span>
              </div>

              {isShowingScreenViewer && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Botão direito: opções
                </span>
              )}
            </div>

            {/* Orbit Constellation Stage: Adaptively scaled */}
            <div className={`relative w-full mx-auto my-auto flex items-center justify-center select-none ${
              !isShowingScreenViewer ? 'max-w-[450px] aspect-square py-4' : 'max-w-[280px] aspect-square py-2'
            }`}>
              {/* Outer Orbit Ring */}
              <div className={`absolute inset-0 rounded-full border pointer-events-none transition-colors duration-500 ${
                isMuted ? 'border-slate-700/40' : 'border-white/[0.08]'
              }`}></div>

              {/* Middle Orbit Ring */}
              <div className={`absolute rounded-full border pointer-events-none transition-colors duration-500 ${
                !isShowingScreenViewer ? 'inset-12' : 'inset-8'
              } ${isMuted ? 'border-slate-700/40' : 'border-white/[0.07]'}`}></div>

              {/* Inner Orbit Ring */}
              <div className={`absolute rounded-full border pointer-events-none transition-colors duration-500 ${
                !isShowingScreenViewer ? 'inset-24' : 'inset-16'
              } ${isMuted ? 'border-slate-700/40' : 'border-white/[0.06]'}`}></div>

              {/* CENTER AVATAR: Current User */}
              <div 
                onClick={() => handleOrbitUserClick(currentUser)}
                onContextMenu={(e) => handleUserContextMenu(e, currentUser)}
                className={`relative z-20 group cursor-pointer transition-all duration-500 ${
                  isLocalDriftedAway 
                    ? 'planet-anim-exit' 
                    : animatingReturn[currentUser.id] 
                    ? 'planet-anim-enter' 
                    : ''
                }`}
                title={isLocalDriftedAway ? 'Afastado da órbita' : `${currentUser.name} (Você) — Botão direito para opções`}
              >
                <div className={`rounded-full p-1 transition-all duration-300 relative ${
                  !isShowingScreenViewer ? 'w-22 h-22 sm:w-26 sm:h-26' : 'w-16 h-16'
                } ${
                  isLocalDriftedAway 
                    ? 'border-2 border-slate-600 opacity-60 grayscale' 
                    : isMuted 
                    ? 'border-2 border-slate-600 opacity-70 grayscale' 
                    : isSpeaking 
                    ? 'ring-3 ring-emerald-400 ring-offset-3 ring-offset-[#0e1017] shadow-[0_0_16px_rgba(52,211,153,0.4)]' 
                    : 'border-2 border-white/20 hover:border-white/50'
                }`}>
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />

                  {/* Screen share badge */}
                  {isScreenSharing && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 border border-white/20 flex items-center justify-center text-white shadow-md" title="Você está compartilhando tela">
                      <Monitor className="w-3 h-3" />
                    </div>
                  )}

                  {/* Mic Muted badge */}
                  {isMuted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 border border-white/20 flex items-center justify-center text-white shadow-md" title="Microfone mutado">
                      <MicOff className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-white bg-black/70 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md shadow-md">
                  {currentUser.name}
                </div>
              </div>

              {/* SATELLITE PARTICIPANTS ON THE ORBIT RINGS */}
              {simulatedVoiceParticipants.map((p, idx) => {
                const isPartDeparted = (!!mutedParticipants[p.id] && !!deafenedParticipants[p.id]) || !!serverDeafenedUsers[p.id];
                const isPartMuted = !!mutedParticipants[p.id] || !!localMutedUsers[p.id] || !!serverMutedUsers[p.id];
                const isPartScreenSharing = !!simulatedScreenSharers[p.id];

                const angles = [30, 150, 260, 320, 90];
                const angle = angles[idx % angles.length];
                const rad = (angle * Math.PI) / 180;
                
                const radius = !isShowingScreenViewer ? 145 : 95;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <div
                    key={p.id}
                    onClick={() => handleOrbitUserClick(p)}
                    onContextMenu={(e) => handleUserContextMenu(e, p)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute z-20 group cursor-pointer transition-all duration-500 ${
                      isPartDeparted 
                        ? 'planet-anim-exit' 
                        : animatingReturn[p.id] 
                        ? 'planet-anim-enter' 
                        : ''
                    }`}
                    title={`${p.name} • Botão direito para opções`}
                  >
                    <div className={`rounded-full p-0.5 transition-all duration-300 relative ${
                      !isShowingScreenViewer ? 'w-15 h-15 sm:w-18 sm:h-18' : 'w-12 h-12'
                    } ${
                      isPartDeparted 
                        ? 'border border-slate-600 opacity-60 grayscale' 
                        : isPartMuted 
                        ? 'border border-slate-600 opacity-70 grayscale' 
                        : p.isSpeaking 
                        ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#0e1017] shadow-[0_0_14px_rgba(52,211,153,0.4)]' 
                        : 'border border-white/20 hover:border-white/50'
                    }`}>
                      <img 
                        src={p.avatarUrl} 
                        alt={p.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />

                      {/* Screen share badge */}
                      {isPartScreenSharing && (
                        <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-cyan-600 border border-white/20 flex items-center justify-center text-white shadow-md animate-pulse" title="Transmitindo tela (Clique para assistir)">
                          <Monitor className="w-2.5 h-2.5" />
                        </div>
                      )}

                      {/* Muted badge */}
                      {isPartMuted && (
                        <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 border border-white/20 flex items-center justify-center text-white shadow-md" title="Mutado">
                          <MicOff className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-200 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Preview of selected participant if clicked */}
            {selectedUserPreview && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md z-20 shrink-0 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={selectedUserPreview.avatarUrl} 
                      alt={selectedUserPreview.name} 
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate text-xs">{selectedUserPreview.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{selectedUserPreview.bio || 'Participante'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {simulatedScreenSharers[selectedUserPreview.id] && (
                      <button
                        onClick={() => {
                          setActiveMainScreenId(selectedUserPreview.id);
                          setIsViewingScreen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Ver Tela ↗
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUserPreview(null)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PANEL 2: SCREEN VIEWER / WATCHPARTY PLAYER
            Features the EXPLICIT "Sair da Tela" button requested by the user:
            "ta faltando um botão pra sair da tela de compartilhamento de alguem"
            ----------------------------------------------------------------------- */}
        {isShowingScreenViewer && (
          <div className={`rounded-3xl flex flex-col justify-between relative shadow-2xl overflow-hidden bg-black border border-white/[0.08] animate-scale-in ${
            cinemaMode 
              ? 'col-span-12' 
              : (!isChatOpen 
                ? 'col-span-12 lg:col-span-8 xl:col-span-9' 
                : 'col-span-12 lg:col-span-6 xl:col-span-6')
          }`}>
            {isWatchPartyActive ? (
              /* WatchParty Google Drive Player */
              <WatchPartyPlayer />
            ) : (
              /* Screen Sharing Viewer */
              <>
                {/* Header of Active Screen with EXPLICIT "Sair da Tela" button */}
                <div className="h-11 px-4 bg-black/80 border-b border-white/[0.08] flex items-center justify-between text-xs text-slate-300 shrink-0 z-10 backdrop-blur-md">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-white truncate text-sm">
                      {currentMainScreen?.title || 'Transmissão de Tela'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 text-xs truncate">
                      {currentMainScreen?.userName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 hidden sm:inline">
                      {currentMainScreen?.fps || 60} FPS
                    </span>

                    {/* =========================================================================
                        THE EXPLICIT "SAIR DA TELA" / FECHAR COMPARTILHAMENTO BUTTON
                        ========================================================================= */}
                    <button
                      onClick={() => setIsViewingScreen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-200 hover:text-rose-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer shadow-sm group"
                      title="Sair da tela de compartilhamento e voltar para a órbita"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                      <span>Sair da Tela</span>
                    </button>

                    {/* If it's local user sharing, provide "Parar Transmissão" */}
                    {currentMainScreen?.isLocal && (
                      <button
                        onClick={toggleScreenShare}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                        title="Parar de transmitir sua tela"
                      >
                        <MonitorOff className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Parar Transmissão</span>
                      </button>
                    )}

                    <button
                      onClick={() => setCinemaMode(!cinemaMode)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                      title={cinemaMode ? 'Restaurar layout' : 'Tela Cheia'}
                    >
                      {cinemaMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Viewport: Split or Single Screen */}
                <div className="flex-1 w-full h-full relative overflow-hidden bg-[#050609] p-2 sm:p-3 flex items-center justify-center">
                  {screenLayoutMode === 'split' ? (
                    /* SPLIT SCREEN / GRID VIEW */
                    <div className={`w-full h-full grid gap-2.5 ${
                      activeStreams.length <= 2 
                        ? 'grid-cols-1 md:grid-cols-2' 
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                      {activeStreams.map((stream) => (
                        <div 
                          key={stream.id}
                          className={`rounded-2xl overflow-hidden border flex flex-col bg-[#0b0d14] relative shadow-lg transition-all ${
                            currentMainScreen?.id === stream.id 
                              ? 'border-indigo-500/70 ring-1 ring-indigo-500/50' 
                              : 'border-white/[0.08] hover:border-white/20'
                          }`}
                        >
                          <div className="h-8 px-3 bg-black/70 border-b border-white/[0.08] flex items-center justify-between text-xs text-slate-300 shrink-0">
                            <div className="flex items-center gap-2 truncate">
                              <img src={stream.userAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                              <span className="font-bold text-white truncate text-[11px]">{stream.userName}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400 text-[10px] truncate">{stream.appName}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setActiveMainScreenId(stream.id);
                                  setScreenLayoutMode('single');
                                }}
                                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                                title="Focar nesta tela"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setIsViewingScreen(false)}
                                className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 cursor-pointer"
                                title="Sair da tela de compartilhamento"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
                            {stream.isLocal ? (
                              <video 
                                ref={localVideoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <SimulatedScreenCanvas 
                                mockType={stream.mockType} 
                                title={stream.title} 
                                userName={stream.userName} 
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* SINGLE FOCAL SCREEN MODE */
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden bg-black rounded-2xl">
                        {currentMainScreen?.isLocal ? (
                          <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-contain max-h-[74vh]"
                          />
                        ) : (
                          <SimulatedScreenCanvas 
                            mockType={currentMainScreen?.mockType} 
                            title={currentMainScreen?.title} 
                            userName={currentMainScreen?.userName || 'Participante'} 
                          />
                        )}
                      </div>

                      {/* Carousel bar to switch main screen if multiple */}
                      {activeStreams.length > 1 && (
                        <div className="w-full pt-2 flex items-center gap-2 overflow-x-auto pb-1 select-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                            Telas:
                          </span>
                          {activeStreams.map((stream) => {
                            const isSelected = stream.id === currentMainScreen?.id;
                            return (
                              <button
                                key={stream.id}
                                onClick={() => setActiveMainScreenId(stream.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all shrink-0 cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-xs'
                                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-400 hover:text-white'
                                }`}
                              >
                                <img src={stream.userAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                                <span className="text-[11px] font-semibold text-slate-200">{stream.userName}</span>
                                {isSelected && <Check className="w-3 h-3 text-cyan-400 ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            PANEL 3: VOICE ROOM CHAT (Matching Image 5 & 6)
            ----------------------------------------------------------------------- */}
        {!cinemaMode && isChatOpen && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-3xl bubble-card p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-2xl min-h-[300px] animate-scale-in">
            {/* Chat Header with Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-tight">Chat da Chamada</span>
                {messages.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-slate-200 font-mono font-bold">
                    {messages.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-colors"
                title="Esconder chat da chamada"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs select-text">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma mensagem na chamada ainda. Digite abaixo para conversar!
                </div>
              ) : (
                messages.slice(-18).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2.5">
                    <img 
                      src={msg.userAvatar} 
                      alt={msg.userName} 
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/10" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-200 text-xs truncate">{msg.userName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed break-words bg-white/[0.03] p-2 rounded-xl border border-white/[0.04]">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={sideChatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSideChat} className="pt-3 border-t border-white/[0.08] flex items-center gap-2">
              <input 
                type="text" 
                value={sideChatMessage}
                onChange={(e) => setSideChatMessage(e.target.value)}
                placeholder="Enviar mensagem na chamada..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <button
                type="submit"
                disabled={!sideChatMessage.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 cursor-pointer transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Departed Planets Dock */}
        {departedList.length > 0 && (
          <aside 
            aria-label="Planetas afastados da órbita"
            className="absolute bottom-16 right-3 z-30 bg-[#0d0f17]/95 border border-white/15 rounded-3xl p-2.5 shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col items-end gap-1.5 max-w-[240px]"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>Afastados da Órbita ({departedList.length})</span>
            </div>

            <div className="flex items-center -space-x-2.5 hover:-space-x-0.5 transition-all duration-300 p-0.5">
              {visibleDeparted.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => restoreDeparted(item)}
                  onContextMenu={(e) => handleUserContextMenu(e, item.userObj)}
                  style={{ zIndex: 10 + idx }}
                  className="relative group cursor-pointer transition-transform hover:scale-105 hover:z-30"
                  title={`${item.name} • Clique para retornar à órbita`}
                >
                  <div className="w-9 h-9 rounded-full border-2 border-[#0d0f17] group-hover:border-cyan-400 shadow-md overflow-hidden bg-slate-800">
                    <img 
                      src={item.avatarUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                </div>
              ))}

              {extraDepartedCount > 0 && (
                <div 
                  style={{ zIndex: 20 }}
                  className="w-9 h-9 rounded-full border-2 border-[#0d0f17] bg-slate-800 text-cyan-300 flex items-center justify-center text-[10px] font-bold shadow-md"
                  title={`Mais ${extraDepartedCount} planeta(s)`}
                >
                  +{extraDepartedCount}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          PERMANENT UNIFIED FLOATING BOTTOM DOCK BAR (Matching Image 5 & 6)
          ========================================================================= */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-auto">
        <div className="px-4 py-2.5 rounded-2xl bg-[#0c0e18]/95 border border-white/15 backdrop-blur-2xl flex items-center gap-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
          {/* 1. Microfone */}
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:bg-rose-500/35' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-rose-300" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* 2. Fones / Silenciar & Afastar */}
          <button
            onClick={toggleLocalMuteAndDeafen}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isLocalDriftedAway 
                ? 'bg-amber-500/25 border border-amber-500/40 text-amber-300' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isLocalDriftedAway ? 'Trazer planeta de volta à órbita' : 'Silenciar e afastar da órbita'}
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* 3. Câmera */}
          <button
            onClick={toggleCamera}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isCameraOn 
                ? 'bg-cyan-500/25 border border-cyan-500/40 text-cyan-300' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isCameraOn ? 'Desativar Câmera' : 'Ativar Câmera'}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
          </button>

          {/* 4. Compartilhar / Assistir Tela */}
          <button
            onClick={() => {
              if (hasActiveScreens && !isViewingScreen) {
                setIsViewingScreen(true);
              } else {
                toggleScreenShare();
              }
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isScreenSharing 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30' 
                : hasActiveScreens && isViewingScreen
                ? 'bg-cyan-500/25 border border-cyan-500/40 text-cyan-300'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={
              isScreenSharing 
                ? 'Parar Compartilhamento de Tela' 
                : hasActiveScreens && !isViewingScreen
                ? 'Assistir Tela Compartilhada'
                : 'Compartilhar Sua Tela'
            }
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Quick exit screen button if watching screen */}
          {hasActiveScreens && isViewingScreen && (
            <button
              onClick={() => setIsViewingScreen(false)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-all cursor-pointer flex items-center justify-center"
              title="Sair da tela de compartilhamento (voltar para a órbita)"
            >
              <EyeOff className="w-4 h-4 text-rose-300" />
            </button>
          )}

          <div className="w-[1px] h-6 bg-white/15 mx-0.5"></div>

          {/* 5. Sessão Cinema (Google Drive WatchParty) */}
          <button
            onClick={() => setWatchPartyModalOpen(true)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isWatchPartyActive 
                ? 'bg-cyan-500/25 border border-cyan-500/40 text-cyan-300' 
                : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
            }`}
            title="Sessão Cinema / CineOrbita (Vídeos e Filmes do Google Drive)"
          >
            <Film className="w-4 h-4 text-cyan-400" />
          </button>

          {/* 6. Chat de Voz */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
              isChatOpen 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white'
            }`}
            title={isChatOpen ? 'Esconder Chat de Voz' : 'Abrir Chat de Voz'}
          >
            <MessageSquare className="w-4 h-4" />
            {messages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </button>

          {/* 7. Convidar Amigos */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white transition-all cursor-pointer"
            title="Convidar amigo para a chamada"
          >
            <UserPlus className="w-4 h-4" />
          </button>

          {/* 8. Soundboard */}
          <button
            onClick={() => setSoundboardModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Efeitos Sonoros (Soundboard)"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* 9. Legendas ao vivo */}
          <button
            onClick={toggleTranscription}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isTranscriptionActive 
                ? 'bg-indigo-500/25 border border-indigo-500/40 text-indigo-300' 
                : 'bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white'
            }`}
            title="Legendas ao vivo da chamada"
          >
            <Subtitles className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-white/15 mx-0.5"></div>

          {/* 10. Desconectar da Chamada */}
          <button
            onClick={disconnectVoice}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md shadow-rose-600/30 hover:scale-105 active:scale-95"
            title="Desconectar / Sair da Chamada"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <UserContextMenu
          user={contextMenu.user}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          isLocallyMuted={
            contextMenu.user.id === currentUser.id
              ? isMuted
              : (!!mutedParticipants[contextMenu.user.id] || !!localMutedUsers[contextMenu.user.id])
          }
          onToggleLocalMute={() => {
            if (contextMenu.user.id === currentUser.id) {
              toggleMute();
            } else {
              toggleParticipantMute(contextMenu.user.id);
              toggleLocalMuteUser(contextMenu.user.id);
            }
          }}
          isDriftedAway={
            contextMenu.user.id === currentUser.id
              ? isLocalDriftedAway
              : ((!!mutedParticipants[contextMenu.user.id] && !!deafenedParticipants[contextMenu.user.id]) || !!serverDeafenedUsers[contextMenu.user.id])
          }
          onToggleDriftAway={() => {
            if (contextMenu.user.id === currentUser.id) {
              toggleLocalMuteAndDeafen();
            } else {
              toggleParticipantDeafenAndMute(contextMenu.user.id);
            }
          }}
          onFocusScreen={() => {
            setActiveMainScreenId(contextMenu.user.id);
            setIsViewingScreen(true);
            if (screenLayoutMode === 'cinema') {
              setScreenLayoutMode('single');
            }
          }}
        />
      )}

      {/* WatchParty Modal (Google Drive Link) */}
      <WatchPartyModal 
        isOpen={watchPartyModalOpen} 
        onClose={() => setWatchPartyModalOpen(false)} 
      />
    </div>
  );
};
