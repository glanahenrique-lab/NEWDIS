import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Hash, 
  Volume2, 
  Plus, 
  Settings, 
  Mic, 
  MicOff, 
  Headphones, 
  Monitor,
  MonitorOff,
  PhoneOff,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Users,
  MessageSquare,
  UserPlus,
  LogOut,
  Sliders,
  Radio,
  Trash2,
  Maximize2,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Compass,
  Copy
} from 'lucide-react';
import { Channel, UserProfile } from '../types';
import { UserContextMenu } from './UserContextMenu';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    servers, 
    currentServer, 
    setCurrentServerId, 
    currentChannel, 
    setCurrentChannelId,
    navigationMode,
    setNavigationMode,
    friends,
    activeFriendId,
    selectFriend,
    inVoiceCall,
    isViewingVoiceRoom,
    returnToVoiceRoom,
    voiceChannel,
    voiceCallTitle,
    connectVoice,
    isMuted,
    toggleMute,
    isDeafened,
    toggleDeafen,
    isSpeaking,
    isScreenSharing,
    toggleScreenShare,
    disconnectVoice,
    simulatedVoiceParticipants,
    simulatedScreenSharers,
    isLeftSidebarCollapsed,
    toggleLeftSidebar,
    setProfileModalOpen,
    setServerSettingsOpen,
    createNewChannel,
    createNewServer,
    leaveServer,
    setInviteModalOpen,
    openServerModal,
    callFriend,
    showToast
  } = useOrbita();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: UserProfile;
  } | null>(null);

  const handleUserContextMenu = (e: React.MouseEvent, user: UserProfile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user
    });
  };

  const [newChannelModalOpen, setNewChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');
  const [hasChannelLimit, setHasChannelLimit] = useState(false);
  const [newChannelLimit, setNewChannelLimit] = useState<number>(10);

  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    createNewChannel(
      newChannelName, 
      newChannelType, 
      undefined, 
      newChannelType === 'voice' && hasChannelLimit ? newChannelLimit : undefined
    );
    setNewChannelName('');
    setHasChannelLimit(false);
    setNewChannelLimit(10);
    setNewChannelModalOpen(false);
  };

  const textChannels = currentServer?.channels.filter(c => c.type === 'text') || [];
  const voiceChannels = currentServer?.channels.filter(c => c.type === 'voice') || [];

  return (
    <aside className="flex h-full shrink-0 select-none z-30 transition-all duration-300">
      {/* 1. LEFT-MOST SERVER STRIP: AMIGOS (ICONE) OR SERVIDOR (ICONES) */}
      <div className="w-16 bg-theme-sidebar border-r border-theme flex flex-col items-center py-3 gap-2.5 shrink-0 transition-colors">
        {/* AMIGOS (ICONE): Switches to Friends view so views are cleanly separated */}
        <button
          onClick={() => {
            setNavigationMode('friends');
            setCurrentServerId(null);
          }}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            navigationMode === 'friends'
              ? 'bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title="Amigos e Conversas Diretas"
        >
          <Users className="w-5 h-5" />
          {navigationMode === 'friends' && (
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white"></span>
          )}
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-1"></div>

        {/* SERVERS ICONS */}
        <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none w-full flex flex-col items-center">
          {servers.map(server => {
            const isSelected = navigationMode === 'server' && currentServer?.id === server.id;
            return (
              <button
                key={server.id}
                onClick={() => {
                  setCurrentServerId(server.id);
                  setNavigationMode('server');
                }}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
                title={server.name}
              >
                {server.iconUrl || '🪐'}
                {isSelected && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white"></span>
                )}
              </button>
            );
          })}

          {/* Add / Create Server (+) button */}
          <button
            onClick={() => openServerModal('create')}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-dashed border-white/20 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all cursor-pointer"
            title="Criar ou Entrar em um Servidor (+)"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Explore Public Communities button */}
          <button
            onClick={() => openServerModal('discover')}
            className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 text-slate-400 hover:text-indigo-300 flex items-center justify-center transition-all cursor-pointer"
            title="Explorar Comunidades e Servidores Públicos"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        {/* Collapse / Expand Toggle for Channel & Friends Column */}
        <div className="mt-auto pt-2 border-t border-white/5 w-full flex justify-center">
          <button
            onClick={toggleLeftSidebar}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title={isLeftSidebarCollapsed ? "Expandir lista de canais e amigos" : "Esconder lista de canais e amigos"}
          >
            {isLeftSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-indigo-400" /> : <PanelLeftClose className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* 2. SECOND COLUMN: CHANNELS (if in server) OR FRIENDS/DMs (if in friends mode) */}
      {!isLeftSidebarCollapsed && (
        <div className="w-60 md:w-64 bg-theme-surface/95 border-r border-theme flex flex-col shrink-0 animate-fade-in transition-colors">
          {/* Header of Second Column with Hide Button */}
          {navigationMode === 'server' && currentServer ? (
            /* Server Header with Dropdown & Hide Sidebar button */
            <div className="relative border-b border-theme flex items-center justify-between">
              <button
                onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
                className="flex-1 h-12 px-4 flex items-center justify-between font-bold text-sm text-white hover:bg-white/5 transition-colors cursor-pointer min-w-0"
              >
                <span className="truncate">{currentServer.name}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${serverDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={toggleLeftSidebar}
                className="p-2 mr-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Esconder aba do servidor"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Server Options Dropdown */}
              {serverDropdownOpen && (
                <div className="absolute top-12 left-2 right-2 glass-panel rounded-2xl p-1.5 shadow-2xl border border-white/15 z-40 space-y-1 animate-fade-in">
                  <button
                    onClick={() => {
                      setInviteModalOpen(true);
                      setServerDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <span>Convidar Pessoas</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setServerSettingsOpen(true);
                      setServerDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <span>Configurações do Servidor</span>
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      openServerModal('join');
                      setServerDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                  >
                    <span>Entrar com Código / Link</span>
                    <Compass className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-[1px] bg-white/10 my-1"></div>

                  {/* Sair do Servidor button */}
                  <button
                    onClick={() => {
                      leaveServer(currentServer.id);
                      setServerDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Sair do Servidor</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Friends Tab Header with Hide Sidebar button */
            <div className="h-12 px-4 border-b border-theme flex items-center justify-between font-bold text-sm text-white">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Amigos & DMs</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => selectFriend(null)}
                  className="text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer"
                  title="Ver lista de amigos"
                >
                  Início
                </button>
                <button
                  onClick={toggleLeftSidebar}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Esconder lista de amigos"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Body of Second Column */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {navigationMode === 'server' && currentServer ? (
              /* SERVER CHANNELS VIEW */
              <>
                {/* Text Channels */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Canais de Texto</span>
                    <button 
                      onClick={() => {
                        setNewChannelType('text');
                        setNewChannelModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-white/5 hover:text-white cursor-pointer"
                      title="Criar canal de texto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {textChannels.map(channel => {
                      const isSelected = currentChannel?.id === channel.id && !isViewingVoiceRoom;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => setCurrentChannelId(channel.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                            isSelected 
                              ? 'bg-white/10 text-white font-semibold' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <Hash className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="truncate">{channel.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Voice Channels */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Canais de Voz</span>
                    <button 
                      onClick={() => {
                        setNewChannelType('voice');
                        setNewChannelModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-white/5 hover:text-white cursor-pointer"
                      title="Criar canal de voz com limite de pessoas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {voiceChannels.map(channel => {
                      const isActiveHere = inVoiceCall && voiceChannel?.id === channel.id;
                      const isViewingHere = isActiveHere && isViewingVoiceRoom;
                      const currentCount = isActiveHere ? (simulatedVoiceParticipants.length + 1) : 0;
                      const isFull = !!(channel.userLimit && currentCount >= channel.userLimit && !isActiveHere);

                      return (
                        <div key={channel.id} className="space-y-0.5">
                          {/* Channel Item Button */}
                          <button
                            onClick={() => {
                              if (isActiveHere) {
                                returnToVoiceRoom();
                              } else if (isFull) {
                                // Channel is at capacity
                                alert(`O canal "${channel.name}" atingiu o limite de ${channel.userLimit} pessoas.`);
                              } else {
                                connectVoice(channel);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                              isViewingHere 
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold shadow-md' 
                                : isActiveHere
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : isFull
                                ? 'opacity-60 text-slate-500 hover:bg-white/5'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Volume2 className={`w-4 h-4 shrink-0 ${isActiveHere ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
                              <span className="truncate">{channel.name}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* User limit indicator */}
                              {channel.userLimit && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 ${
                                  isFull ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-white/5 text-slate-400'
                                }`}>
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{currentCount}/{channel.userLimit}</span>
                                </span>
                              )}

                              {isActiveHere && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                                  {isViewingHere ? 'Vendo' : 'No ar ↗'}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* =========================================================================
                              PROFILES CONNECTED BELOW VOZ GERAL / ACTIVE VOICE CALL
                              "mostre abaixo do voz geral, icones dos perfis logados na chamada"
                              ========================================================================= */}
                          {isActiveHere && (
                            <div className="pl-4 pr-1 py-1 space-y-1 animate-fade-in border-l-2 border-emerald-500/40 ml-3.5 my-1">
                              {/* 1. Logged in current user (Você) */}
                              <div
                                onClick={returnToVoiceRoom}
                                onContextMenu={(e) => handleUserContextMenu(e, currentUser)}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                                title={`${currentUser.name} (Você) • Clique com botão direito para opções`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="relative shrink-0">
                                    <img 
                                      src={currentUser.avatarUrl} 
                                      alt={currentUser.name} 
                                      className={`w-5 h-5 rounded-full object-cover transition-all ${
                                        isSpeaking 
                                          ? 'ring-2 ring-emerald-400 border border-emerald-400 scale-105' 
                                          : 'border border-white/20'
                                      }`}
                                    />
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                                      isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                                    }`}></span>
                                  </div>
                                  <span className="text-xs text-slate-200 group-hover:text-white truncate font-medium">
                                    {currentUser.name} <span className="text-[10px] text-slate-400 font-normal">(Você)</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {isMuted && <span title="Mutado"><MicOff className="w-3 h-3 text-rose-400" /></span>}
                                  {isDeafened && <span title="Ensurdecido"><Headphones className="w-3 h-3 text-amber-400" /></span>}
                                  {isScreenSharing && <span title="Compartilhando tela"><Monitor className="w-3 h-3 text-cyan-400 animate-pulse" /></span>}
                                </div>
                              </div>

                              {/* 2. Other connected participants (Clara, Arthur, Lucas) */}
                              {simulatedVoiceParticipants.map(participant => (
                                <div
                                  key={participant.id}
                                  onClick={returnToVoiceRoom}
                                  onContextMenu={(e) => handleUserContextMenu(e, participant)}
                                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                                  title={`${participant.name} • Clique com botão direito para opções`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="relative shrink-0">
                                      <img 
                                        src={participant.avatarUrl} 
                                        alt={participant.name} 
                                        className="w-5 h-5 rounded-full object-cover border border-white/20"
                                      />
                                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    </div>
                                    <span className="text-xs text-slate-300 group-hover:text-white truncate">
                                      {participant.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {simulatedScreenSharers[participant.id] && (
                                      <span title="Compartilhando tela">
                                        <Monitor className="w-3 h-3 text-cyan-400 animate-pulse" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Server Members */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Membros — {currentServer.members.length}</span>
                    <button 
                      onClick={() => setInviteModalOpen(true)}
                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Convidar
                    </button>
                  </div>

                  <div className="space-y-1">
                    {currentServer.members.map(member => (
                      <div 
                        key={member.id}
                        onContextMenu={(e) => handleUserContextMenu(e, member)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-context-menu"
                        title="Clique com botão direito para opções de usuário"
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={member.avatarUrl} 
                            alt={member.name} 
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-theme"></span>
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-semibold text-slate-300 truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {member.customStatus || 'Online'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* FRIENDS & DIRECT MESSAGES LIST */
              <>
                {/* Direct Messages List */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Mensagens Diretas</span>
                    <button
                      onClick={() => {
                        setNavigationMode('friends');
                        selectFriend(null);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Adicionar amigo pelo nome ou tag"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar</span>
                    </button>
                  </div>

                  {friends.length === 0 ? (
                    <div className="px-2 py-4 text-center text-xs text-slate-500">
                      Nenhuma conversa direta ainda. Adicione amigos para começar!
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {friends.map(friend => {
                        const isSelected = activeFriendId === friend.id;
                        return (
                          <div
                            key={friend.id}
                            onClick={() => selectFriend(friend.id)}
                            className={`group w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                              isSelected 
                                ? 'bg-white/10 text-white font-semibold' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate min-w-0">
                              <div className="relative shrink-0">
                                <img 
                                  src={friend.avatarUrl} 
                                  alt={friend.name} 
                                  className="w-7 h-7 rounded-full object-cover" 
                                />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-theme ${
                                  friend.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                                }`}></span>
                              </div>
                              <div className="truncate flex-1">
                                <div className="truncate text-slate-200 group-hover:text-white font-semibold flex items-center gap-1.5">
                                  <span>{friend.name}</span>
                                  <span className="text-[10px] text-cyan-400 font-mono font-normal">#{friend.accountId || friend.tag.split('#')[1]}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">{friend.customStatus || friend.email || friend.tag}</div>
                              </div>
                            </div>

                            {/* Direct Call Phone Button right from Sidebar */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                callFriend(friend);
                              }}
                              className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                              title={`Ligar diretamente para ${friend.name} (Chamar agora)`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 3. VOICE CONNECTION CONTROLS: RIGHT ABOVE USER PROFILE */}
          {inVoiceCall && (
            <div className="p-2.5 mx-2 mb-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl shadow-xl animate-fade-in">
              {/* Voice status row */}
              <div 
                onClick={returnToVoiceRoom}
                className="flex items-center justify-between mb-2 cursor-pointer group"
                title="Clique para voltar para a tela de voz e compartilhamento"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                  <span className="truncate">{voiceCallTitle}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isViewingVoiceRoom && (
                    <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-0.5 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                      Ver <Maximize2 className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400/80">18ms</span>
                </div>
              </div>

              {/* 4 Voice Control Buttons right above profile */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-white/5">
                {/* Mute Mic */}
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isMuted ? 'bg-rose-500/25 text-rose-400 hover:bg-rose-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                  title={isMuted ? 'Desmutar' : 'Mutar microfone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Deafen */}
                <button
                  onClick={toggleDeafen}
                  className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isDeafened ? 'bg-rose-500/25 text-rose-400 hover:bg-rose-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                  title={isDeafened ? 'Desensurdecer' : 'Ensurdecer'}
                >
                  <Headphones className="w-4 h-4" />
                </button>

                {/* Share Screen */}
                <button
                  onClick={toggleScreenShare}
                  className={`p-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isScreenSharing ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                  title={isScreenSharing ? 'Parar tela' : 'Compartilhar tela'}
                >
                  {isScreenSharing ? <Monitor className="w-4 h-4 text-cyan-300" /> : <MonitorOff className="w-4 h-4" />}
                </button>

                {/* Disconnect red button */}
                <button
                  onClick={disconnectVoice}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-md shadow-rose-600/30 cursor-pointer"
                  title="Sair da chamada"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. USER PROFILE PANEL (BOTTOM OF SIDEBAR) */}
          <div 
            onContextMenu={(e) => handleUserContextMenu(e, currentUser)}
            className="p-2.5 border-t border-theme bg-theme-sidebar/90 flex items-center justify-between shrink-0 transition-colors"
          >
            <div 
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
              title="Abrir perfil (Botão direito para opções)"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-cyan-400 transition-colors"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-theme"></span>
              </div>

              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                  <span className="text-cyan-400 font-semibold">ID: #{currentUser.accountId || currentUser.tag?.split('#')[1] || '1001'}</span>
                  <span>•</span>
                  <span className="truncate">{currentUser.tag || 'Online'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Quick Copy Tag/ID button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const tagToCopy = currentUser.tag || `${currentUser.name}#${currentUser.accountId || '1001'}`;
                  navigator.clipboard.writeText(tagToCopy);
                  showToast(`Tag ${tagToCopy} copiada! Compartilhe para te adicionarem.`, 'success');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                title="Copiar meu ID e Tag para amigos me adicionarem"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Gear opens settings (where user can customize or log out) */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Configurações do Usuário"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Channel (Includes Option to Limit People) */}
      {newChannelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-white/10 animate-fade-in">
            <h3 className="text-base font-bold text-white mb-3">Criar Canal</h3>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tipo de Canal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChannelType('text')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      newChannelType === 'text' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" /> Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChannelType('voice')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      newChannelType === 'voice' ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Voz
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Canal</label>
                <input 
                  type="text"
                  placeholder={newChannelType === 'voice' ? 'ex: bate-papo-gamer' : 'ex: avisos'}
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* Option to limit people inside the call */}
              {newChannelType === 'voice' && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="limitToggle" className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Limitar Pessoas na Chamada</span>
                    </label>
                    <input 
                      type="checkbox"
                      id="limitToggle"
                      checked={hasChannelLimit}
                      onChange={(e) => setHasChannelLimit(e.target.checked)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {hasChannelLimit ? (
                    <div className="space-y-2.5 pt-1 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Máximo simultâneo:</span>
                        <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {newChannelLimit} pessoas
                        </span>
                      </div>

                      <input 
                        type="range"
                        min={1}
                        max={50}
                        value={newChannelLimit}
                        onChange={(e) => setNewChannelLimit(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />

                      {/* Quick preset chips */}
                      <div className="flex gap-1.5">
                        {[2, 5, 10, 25].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNewChannelLimit(num)}
                            className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                              newChannelLimit === num
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Apenas até {newChannelLimit} usuário{newChannelLimit > 1 ? 's' : ''} poderão entrar simultaneamente neste canal de voz.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Sem limite: qualquer membro poderá se conectar livremente.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewChannelModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Criar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* User Context Menu (Right Click) */}
      {contextMenu && (
        <UserContextMenu
          user={contextMenu.user}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </aside>
  );
};
