import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  X, 
  Plus, 
  LogIn, 
  Compass, 
  Sparkles, 
  Check, 
  Search, 
  ArrowRight, 
  Users, 
  Volume2, 
  Hash, 
  ShieldCheck,
  Globe,
  Radio,
  Gamepad2,
  Code2,
  Headphones,
  Coffee
} from 'lucide-react';
import { ServerData } from '../types';
import { PUBLIC_COMMUNITY_SERVERS } from '../data/mockData';

const SERVER_EMOJI_PRESETS = ['🪐', '🚀', '🎮', '💻', '🎧', '⚡', '🎨', '🔮', '☕', '🌟', '👾', '🔥'];

export const ServerModal: React.FC = () => {
  const { 
    serverModalOpen, 
    setServerModalOpen, 
    serverModalTab, 
    setServerModalTab,
    createNewServer,
    joinServer,
    servers,
    showToast
  } = useOrbita();

  // Create form state
  const [serverName, setServerName] = useState('');
  const [serverEmoji, setServerEmoji] = useState('🪐');
  const [serverDescription, setServerDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Join form state
  const [inviteInput, setInviteInput] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!serverModalOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverName.trim()) return;
    setIsSubmitting(true);
    try {
      await createNewServer(serverName, serverEmoji, serverDescription);
      showToast(`Servidor "${serverName}" criado com sucesso!`, 'success');
      setServerName('');
      setServerDescription('');
      setServerEmoji('🪐');
      setServerModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setIsSubmitting(true);
    setJoinFeedback(null);
    try {
      const res = await joinServer(inviteInput);
      setJoinFeedback(res);
      if (res.success) {
        showToast(res.message, 'success');
        setInviteInput('');
        setTimeout(() => {
          setServerModalOpen(false);
          setJoinFeedback(null);
        }, 1200);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickJoinCommunity = async (communityServer: ServerData) => {
    const res = await joinServer(communityServer.id);
    if (res.success) {
      showToast(res.message, 'success');
      setServerModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              🪐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Servidores no Orb.co
              </h2>
              <p className="text-xs text-slate-400">
                Crie seu espaço, entre via link ou descubra comunidades
              </p>
            </div>
          </div>
          <button
            onClick={() => setServerModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] my-4 shrink-0">
          <button
            onClick={() => {
              setServerModalTab('create');
              setJoinFeedback(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serverModalTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Servidor</span>
          </button>

          <button
            onClick={() => {
              setServerModalTab('join');
              setJoinFeedback(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serverModalTab === 'join'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar com Link</span>
          </button>

          <button
            onClick={() => {
              setServerModalTab('discover');
              setJoinFeedback(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              serverModalTab === 'discover'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explorar</span>
          </button>
        </div>

        {/* Tab 1: Criar Servidor */}
        {serverModalTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ícone do Servidor
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVER_EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setServerEmoji(emoji)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                      serverEmoji === emoji 
                        ? 'bg-indigo-600/30 border-2 border-indigo-400 scale-105 shadow-md' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome do Servidor *
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Ex: Galáxia Gamer, Chill & Code..."
                className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição do Espaço (Opcional)
              </label>
              <textarea
                value={serverDescription}
                onChange={(e) => setServerDescription(e.target.value)}
                placeholder="Para que serve este servidor? Ex: Conversas diárias, projetos e lives de jogos."
                rows={2}
                className="w-full glass-input px-3.5 py-2 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setServerModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!serverName.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-40 cursor-pointer"
              >
                <span>Criar Espaço</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Entrar em um Servidor */}
        {serverModalTab === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Como entrar em um servidor?</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Cole o link de convite recebido de um amigo (ex: <span className="font-mono text-cyan-300">https://...#convite=srv_123</span>) ou digite diretamente o código do servidor.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link de Convite ou Código do Servidor
              </label>
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Ex: srv_orb_central ou https://...#convite=srv_123"
                className="w-full glass-input px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
                autoFocus
              />
            </div>

            {joinFeedback && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in ${
                joinFeedback.success 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {joinFeedback.success ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <X className="w-4 h-4 shrink-0" />}
                <span>{joinFeedback.message}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setServerModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!inviteInput.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-40 cursor-pointer"
              >
                <span>Entrar no Servidor</span>
                <LogIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Explorar Comunidades */}
        {serverModalTab === 'discover' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            <p className="text-xs text-slate-400">
              Escolha uma comunidade pública aberta para entrar com um único clique:
            </p>

            <div className="space-y-2.5">
              {PUBLIC_COMMUNITY_SERVERS.map((comServer) => {
                const alreadyJoined = servers.some(s => s.id === comServer.id);
                return (
                  <div
                    key={comServer.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {comServer.iconUrl}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-white">
                          <span className="truncate">{comServer.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                            Público
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {comServer.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickJoinCommunity(comServer)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        alreadyJoined 
                          ? 'bg-white/10 text-slate-300 hover:bg-white/20' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      {alreadyJoined ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Acessar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Entrar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
