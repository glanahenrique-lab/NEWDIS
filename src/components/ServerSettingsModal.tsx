import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  X, 
  Palette, 
  ShieldCheck, 
  Check, 
  LogOut,
  Trash2,
  Sliders
} from 'lucide-react';
import { ServerTheme, ServerRole } from '../types';

export const ServerSettingsModal: React.FC = () => {
  const { 
    currentServer, 
    serverSettingsOpen, 
    setServerSettingsOpen, 
    updateServerTheme, 
    updateServerRoles,
    leaveServer,
    deleteServer,
    currentUser
  } = useOrbita();

  const [activeTab, setActiveTab] = useState<'tema' | 'permissoes'>('tema');

  if (!serverSettingsOpen || !currentServer) return null;

  const roles = currentServer.roles || [];
  const defaultRole: ServerRole = roles[0] || {
    id: 'role_default',
    name: 'Membro',
    color: '#818cf8',
    permissions: {
      sendMessages: true,
      speakInVoice: true,
      shareScreen: true,
      useSoundboard: true,
      manageChannels: false,
      muteMembers: false,
      administrator: false,
    }
  };

  const themes: { id: ServerTheme; name: string; color: string; desc: string }[] = [
    { id: 'nebula', name: 'Nebulosa Cósmica', color: '#818cf8', desc: 'Gradientes violetas e azuis profundos' },
    { id: 'cyber', name: 'Andrômeda Cyber', color: '#06b6d4', desc: 'Ciano neon e contraste futurista' },
    { id: 'aurora', name: 'Aurora Boreal', color: '#10b981', desc: 'Esmeralda espacial e tons vivos de verde' },
    { id: 'solar', name: 'Supernova Solar', color: '#f59e0b', desc: 'Âmbar ardente e dourado cósmico' },
    { id: 'rose', name: 'Quartzo Rosa', color: '#f43f5e', desc: 'Tons de magenta e quartzo estelar' },
    { id: 'graphite', name: 'Grafite Profundo', color: '#64748b', desc: 'Minimalismo escuro com foco em texto' },
    { id: 'custom', name: 'Personalizado', color: currentServer.accentColor || '#818cf8', desc: 'Cor personalizada definida para este servidor' },
  ];

  const isOwner = currentServer.ownerId === currentUser.id;

  const handleLeaveOrDelete = () => {
    if (isOwner) {
      deleteServer(currentServer.id);
    } else {
      leaveServer(currentServer.id);
    }
    setServerSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col max-h-[85vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Configurações do Servidor:</span>
              <span className="text-cyan-400">{currentServer.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalize o tema e o sistema de cargos e permissões do servidor.
            </p>
          </div>
          <button
            onClick={() => setServerSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tema')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tema' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Tema e Cores</span>
            </button>

            <button
              onClick={() => setActiveTab('permissoes')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'permissoes' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Cargos e Permissões</span>
            </button>
          </div>

          {/* Sair do Servidor button */}
          <button
            onClick={handleLeaveOrDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sair ou apagar servidor"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isOwner ? 'Excluir Servidor' : 'Sair do Servidor'}</span>
          </button>
        </div>

        {/* Tab 1: Server Themes */}
        {activeTab === 'tema' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map(th => {
                const isCurrent = currentServer.theme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => updateServerTheme(th.id, th.color)}
                    className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent 
                        ? 'border-indigo-500 bg-white/10 shadow-lg' 
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.color }}
                        ></span>
                        <span className="font-bold text-sm text-white">{th.name}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{th.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Accent Color for Server */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Cor de Destaque do Servidor</span>
                <span className="text-[11px] text-slate-400">Personalize a cor temática aplicada ao navegar neste servidor</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={currentServer.accentColor || '#818cf8'} 
                  onChange={(e) => updateServerTheme('custom', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{currentServer.accentColor || '#818cf8'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Roles & Permissions */}
        {activeTab === 'permissoes' && (
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 text-xs">
            <span className="font-bold text-white text-sm block mb-2">
              Configurações de Permissões
            </span>

            <div className="space-y-2">
              {[
                { label: 'Enviar Mensagens', desc: 'Permite conversar nos canais de texto deste servidor' },
                { label: 'Falar na Chamada de Voz', desc: 'Permite falar no canal de voz' },
                { label: 'Compartilhar Tela', desc: 'Permite transmitir vídeos ou jogos' },
                { label: 'Disparar Soundboard', desc: 'Permite tocar efeitos sonoros' },
                { label: 'Gerenciar Canais', desc: 'Permite criar novos canais de texto e voz' },
              ].map(({ label, desc }, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{label}</div>
                    <div className="text-[10px] text-slate-400">{desc}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
