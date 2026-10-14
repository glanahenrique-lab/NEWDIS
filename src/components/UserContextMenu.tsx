import React, { useEffect, useRef, useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Headphones, 
  PhoneOff, 
  UserMinus, 
  Copy, 
  Check, 
  MessageSquare, 
  User, 
  Clock, 
  Sliders, 
  Shield,
  Monitor,
  Phone,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../types';
import { useOrbita } from '../context/OrbitaContext';

export interface UserContextMenuProps {
  user: UserProfile;
  x: number;
  y: number;
  onClose: () => void;
  isLocallyMuted?: boolean;
  onToggleLocalMute?: () => void;
  isDriftedAway?: boolean;
  onToggleDriftAway?: () => void;
  onFocusScreen?: () => void;
}

export const UserContextMenu: React.FC<UserContextMenuProps> = ({
  user,
  x,
  y,
  onClose,
  isLocallyMuted: propIsLocallyMuted,
  onToggleLocalMute: propOnToggleLocalMute,
  onFocusScreen
}) => {
  const {
    currentUser,
    currentServer,
    userVolumes,
    setUserVolume,
    localMutedUsers,
    toggleLocalMuteUser,
    serverMutedUsers,
    toggleServerMuteUser,
    serverDeafenedUsers,
    toggleServerDeafenUser,
    kickVoiceParticipant,
    kickServerMember,
    isAdminMode,
    toggleAdminMode,
    isMuted,
    toggleMute,
    isDeafened,
    toggleDeafen,
    isScreenSharing,
    toggleScreenShare,
    setProfileModalOpen,
    selectFriend,
    setNavigationMode,
    callFriend,
    addFriend,
    friends
  } = useOrbita();

  const menuRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showTimeoutSubmenu, setShowTimeoutSubmenu] = useState(false);
  const [position, setPosition] = useState({ left: x, top: y });

  const isSelf = user.id === currentUser.id;

  // Determine if user has admin privileges
  const isServerOwner = currentServer?.ownerId === currentUser.id;
  const isUserAdminRole = currentUser.role === 'owner' || currentUser.role === 'admin';
  const effectiveIsAdmin = isServerOwner || isUserAdminRole || isAdminMode;

  const volume = userVolumes[user.id] ?? 100;
  const isLocallyMuted = propIsLocallyMuted !== undefined ? propIsLocallyMuted : !!localMutedUsers[user.id];
  const isServerMuted = !!serverMutedUsers[user.id];
  const isServerDeafened = !!serverDeafenedUsers[user.id];

  // Keep inside viewport bounds
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 10;

    let posX = x;
    let posY = y;

    if (posX + rect.width > window.innerWidth - padding) {
      posX = window.innerWidth - rect.width - padding;
    }
    if (posX < padding) {
      posX = padding;
    }

    if (posY + rect.height > window.innerHeight - padding) {
      posY = window.innerHeight - rect.height - padding;
    }
    if (posY < padding) {
      posY = padding;
    }

    setPosition({ left: posX, top: posY });
  }, [x, y]);

  // Click outside and escape handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => {
      setCopiedId(false);
      onClose();
    }, 800);
  };

  const handleToggleLocalMute = () => {
    if (propOnToggleLocalMute) {
      propOnToggleLocalMute();
    } else {
      toggleLocalMuteUser(user.id);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setUserVolume(user.id, newVol);
  };

  const handleKickVoice = () => {
    kickVoiceParticipant(user.id);
    onClose();
  };

  const handleKickServer = () => {
    if (currentServer) {
      kickServerMember(currentServer.id, user.id);
    } else {
      kickVoiceParticipant(user.id);
    }
    onClose();
  };

  const handleOpenDM = () => {
    selectFriend(user.id);
    setNavigationMode('friends');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
      className="fixed z-50 w-60 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in duration-100 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* User Header */}
      <div className="px-2 py-1.5 mb-1 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-6 h-6 rounded-full object-cover shrink-0" 
          />
          <div className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-white text-xs truncate block">
              {user.name}
            </span>
          </div>
        </div>

        {/* Quick Admin Toggle if testing */}
        <button
          onClick={toggleAdminMode}
          title={effectiveIsAdmin ? "Modo Administrador Ativo" : "Clique para ativar modo Admin"}
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
            effectiveIsAdmin 
              ? 'bg-indigo-600/30 text-indigo-300' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {effectiveIsAdmin ? 'ADM' : 'USER'}
        </button>
      </div>

      <div className="space-y-0.5">
        {/* =========================================================================
            IF SELF: OPTIONS FOR CURRENT USER
            ========================================================================= */}
        {isSelf ? (
          <>
            <button
              onClick={() => { toggleMute(); onClose(); }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isMuted ? 'Desmutar microfone' : 'Mutar microfone'}</span>
              </div>
              {isMuted && <span className="text-[10px] text-red-400">Mudo</span>}
            </button>

            <button
              onClick={() => { toggleDeafen(); onClose(); }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Headphones className={`w-3.5 h-3.5 ${isDeafened ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{isDeafened ? 'Desensurdecer' : 'Ensurdecer'}</span>
              </div>
              {isDeafened && <span className="text-[10px] text-red-400">Surdo</span>}
            </button>

            <button
              onClick={() => { toggleScreenShare(); onClose(); }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <span>{isScreenSharing ? 'Parar transmissão' : 'Compartilhar tela'}</span>
            </button>

            <div className="h-[1px] bg-white/[0.06] my-1" />

            <button
              onClick={() => { setProfileModalOpen(true); onClose(); }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Editar perfil</span>
            </button>
          </>
        ) : (
          /* =========================================================================
              IF OTHER USER: CLEAN, SIMPLE OPTIONS
              ========================================================================= */
          <>
            {/* User Volume Slider */}
            <div className="px-2 py-1 my-0.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Volume</span>
                <span className="font-mono text-slate-300">{volume}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="200"
                step="5"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-slate-200 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>

            {/* Mutar para mim */}
            <button
              onClick={handleToggleLocalMute}
              className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                isLocallyMuted 
                  ? 'bg-white/[0.06] text-white' 
                  : 'hover:bg-white/[0.08] text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLocallyMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Mutar para mim</span>
              </div>
              {isLocallyMuted && (
                <span className="text-[10px] text-slate-400">Ativado</span>
              )}
            </button>

            {/* Focus Screen if sharing */}
            {onFocusScreen && (
              <button
                onClick={() => { onFocusScreen(); onClose(); }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver transmissão</span>
              </button>
            )}

            {/* =====================================================================
                ADMIN COMMANDS (IF ADMIN)
                ===================================================================== */}
            {effectiveIsAdmin && (
              <>
                <div className="h-[1px] bg-white/[0.06] my-1" />
                <div className="px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Moderação
                </div>

                {/* Mutar no Servidor */}
                <button
                  onClick={() => toggleServerMuteUser(user.id)}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MicOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mutar para todos</span>
                  </div>
                  {isServerMuted && (
                    <span className="text-[10px] text-red-400">Mudo</span>
                  )}
                </button>

                {/* Ensurdecer no Servidor */}
                <button
                  onClick={() => toggleServerDeafenUser(user.id)}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ensurdecer para todos</span>
                  </div>
                  {isServerDeafened && (
                    <span className="text-[10px] text-red-400">Surdo</span>
                  )}
                </button>

                {/* Expulsar da Chamada */}
                <button
                  onClick={handleKickVoice}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Expulsar da chamada</span>
                </button>

                {/* Expulsar do Servidor */}
                <button
                  onClick={handleKickServer}
                  className="w-full px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Expulsar do servidor</span>
                </button>

                {/* Castigo Temporário */}
                <div className="relative">
                  <button
                    onClick={() => setShowTimeoutSubmenu(!showTimeoutSubmenu)}
                    className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Castigo temporário</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{showTimeoutSubmenu ? '▲' : '▶'}</span>
                  </button>

                  {showTimeoutSubmenu && (
                    <div className="ml-5 my-1 space-y-0.5 pl-2 border-l border-white/10">
                      {['60 segundos', '5 minutos', '10 minutos', '1 hora'].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => {
                            toggleServerMuteUser(user.id);
                            onClose();
                          }}
                          className="w-full px-2 py-1 rounded-md hover:bg-white/[0.08] text-[11px] text-slate-300 text-left cursor-pointer transition-colors"
                        >
                          {duration}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="h-[1px] bg-white/[0.06] my-1" />

            {/* Direct Message */}
            <button
              onClick={handleOpenDM}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Enviar mensagem direta</span>
            </button>

            {/* Direct Call User */}
            <button
              onClick={() => {
                callFriend({
                  id: user.id,
                  name: user.name,
                  tag: user.tag || `@${user.name.toLowerCase()}`,
                  avatarUrl: user.avatarUrl,
                  status: user.status || 'online',
                  customStatus: user.customStatus,
                  bio: user.bio,
                  ping: user.ping || 20
                });
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ligar para {user.name}</span>
            </button>

            {/* Add Friend if not already friend */}
            {!friends.some(f => f.id === user.id) && (
              <button
                onClick={() => {
                  addFriend(user.tag || user.name);
                  onClose();
                }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Adicionar aos amigos</span>
              </button>
            )}
          </>
        )}

        {/* Copy User ID */}
        <button
          onClick={handleCopyId}
          className="w-full px-2 py-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copiar ID</span>
          </div>
          {copiedId ? (
            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
              <Check className="w-3 h-3" /> Copiado
            </span>
          ) : (
            <span className="font-mono text-[9px] text-slate-600">{user.id.slice(0, 6)}</span>
          )}
        </button>
      </div>
    </div>
  );
};
