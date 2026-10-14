import React, { useState, useRef, useEffect } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Bell, 
  Volume2, 
  UserPlus, 
  Sun, 
  Moon, 
  Sliders,
  Users,
  Palette,
  Check,
  Radio,
  Maximize2
} from 'lucide-react';
import { AppTheme } from '../types';

export const TopNavbar: React.FC = () => {
  const { 
    currentUser, 
    currentServer, 
    navigationMode,
    setNavigationMode,
    selectFriend,
    themeMode, 
    toggleTheme,
    appTheme,
    setAppTheme,
    customAccentColor,
    setCustomAccentColor,
    isLeftSidebarCollapsed,
    toggleLeftSidebar,
    setProfileModalOpen,
    setServerSettingsOpen,
    setInviteModalOpen,
    setSoundboardModalOpen,
    inVoiceCall,
    isViewingVoiceRoom,
    returnToVoiceRoom,
    voiceCallTitle,
    watchParty
  } = useOrbita();

  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clicking the logo brings the user to the Amigos hub, NEVER logs out!
  const handleLogoClick = () => {
    setNavigationMode('friends');
    selectFriend(null);
  };

  const themeOptions: { id: AppTheme; name: string; color: string }[] = [
    { id: 'nebula', name: 'Nebulosa', color: '#6366f1' },
    { id: 'cyber', name: 'Cyber Neon', color: '#06b6d4' },
    { id: 'aurora', name: 'Aurora', color: '#10b981' },
    { id: 'solar', name: 'Solar', color: '#f59e0b' },
    { id: 'rose', name: 'Quartzo Rosa', color: '#f43f5e' },
    { id: 'graphite', name: 'Grafite', color: '#64748b' },
    { id: 'light', name: 'Modo Claro', color: '#4f46e5' },
  ];

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-theme bg-theme-sidebar/95 backdrop-blur-xl flex items-center justify-between shrink-0 z-20 select-none">
      {/* Left: Orb.co Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer"
          title="Ir para o Início / Amigos"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#0d0f17] flex items-center justify-center">
              <span className="text-sm">🪐</span>
            </div>
          </div>
          <span className="font-bold text-base tracking-tight text-white hidden sm:inline-block">
            Orb.co
          </span>
        </button>

        <span className="text-slate-600 hidden sm:inline-block">/</span>

        {/* Current Location Badge */}
        {navigationMode === 'server' && currentServer ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
            <span>{currentServer.iconUrl || '🪐'}</span>
            <span className="truncate max-w-[140px] font-semibold">{currentServer.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Users className="w-3.5 h-3.5" />
            <span>Amigos</span>
          </div>
        )}
      </div>

      {/* Center: In Voice Call Pill (Click to Return) when viewing chat! */}
      {inVoiceCall && !isViewingVoiceRoom && (
        <button
          onClick={returnToVoiceRoom}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer animate-pulse ${
            watchParty?.isActive 
              ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-cyan-500/20' 
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-emerald-500/10 hover:bg-emerald-500/25'
          }`}
          title="Clique para voltar para a tela de voz e transmissões"
        >
          <span className={`w-2 h-2 rounded-full ${watchParty?.isActive ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
          <span className="truncate max-w-[180px] sm:max-w-[240px]">
            {watchParty?.isActive ? `🍿 CineOrbita: ${watchParty.title}` : voiceCallTitle || 'Chamada de Voz'}
          </span>
          <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
            Voltar <Maximize2 className="w-2.5 h-2.5" />
          </span>
        </button>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Soundboard Button */}
        <button 
          onClick={() => setSoundboardModalOpen(true)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
          title="Soundboard integrado"
        >
          <Volume2 className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Server settings button (only if in server) */}
        {navigationMode === 'server' && currentServer && (
          <button 
            onClick={() => setServerSettingsOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Configurações do Servidor"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Invite Friends Button */}
        {navigationMode === 'server' && currentServer && (
          <button 
            onClick={() => setInviteModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-all cursor-pointer"
            title="Convidar amigos"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Convidar</span>
          </button>
        )}

        {/* Quick Theme & Color Palette Switcher */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer flex items-center gap-1"
            title="Personalizar Cores e Temas do Site"
          >
            <Palette className="w-4 h-4 text-indigo-400" />
          </button>

          {paletteMenuOpen && (
            <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl p-3 glass-panel border border-white/15 shadow-2xl backdrop-blur-2xl animate-fade-in space-y-2">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Temas & Cores do Site
              </div>
              <div className="space-y-1">
                {themeOptions.map(th => {
                  const isCurrent = appTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        setAppTheme(th.id);
                        setCustomAccentColor(th.color);
                        setPaletteMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        isCurrent ? 'bg-white/15 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: th.color }}
                        ></span>
                        <span>{th.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setPaletteMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full text-center text-[11px] text-cyan-400 hover:underline py-1"
                >
                  Personalizar cores livres →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light <-> Dark) */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={themeMode === 'dark' ? 'Alternar modo claro' : 'Alternar modo escuro'}
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications */}
        <button 
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer relative"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Trigger */}
        <button 
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
          title="Editar perfil e opções de conta"
        >
          <div className="relative">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-full object-cover border border-white/20 group-hover:border-cyan-400 transition-colors" 
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0e1017]"></span>
          </div>
          <span className="text-xs font-medium text-slate-200 hidden md:inline-block max-w-[90px] truncate">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
};
