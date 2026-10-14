import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  Globe, 
  Sparkles,
  MessageCircle,
  Phone,
  PhoneCall,
  UserCheck,
  Users,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Friend } from '../types';

export const InviteModal: React.FC = () => {
  const { 
    currentServer, 
    inviteModalOpen, 
    setInviteModalOpen,
    friends,
    inVoiceCall,
    simulatedVoiceParticipants,
    callFriend,
    inviteFriendToCurrentCall,
    showToast
  } = useOrbita();

  const [copied, setCopied] = useState(false);
  const [callingState, setCallingState] = useState<Record<string, 'idle' | 'calling' | 'connected'>>({});
  const [activeTab, setActiveTab] = useState<'link' | 'friends'>('friends');

  if (!inviteModalOpen) return null;

  const serverName = currentServer ? currentServer.name : 'Orb.co';
  const serverId = currentServer ? currentServer.id : 'srv_orb_central';
  
  // Construct a robust invite link that includes the origin and pathname with #convite=
  const origin = window.location.origin || 'https://orb.co';
  const pathname = window.location.pathname || '/';
  const inviteLink = `${origin}${pathname}#convite=${serverId}`;
  const shareText = `Venha conversar comigo no ${serverName} no Orb.co! Voz ultraleve e compartilhamento de tela: ${inviteLink}`;

  const handleCopy = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteLink).then(() => {
          setCopied(true);
          showToast('Link de convite copiado com sucesso!', 'success');
          setTimeout(() => setCopied(false), 2200);
        }).catch(() => {
          fallbackCopy();
        });
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast('Link de convite copiado!', 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      showToast('Selecione e copie o link no campo de texto.', 'warning');
    }
  };

  const handleDirectCallFriend = (friend: Friend) => {
    setCallingState(prev => ({ ...prev, [friend.id]: 'calling' }));

    if (inVoiceCall) {
      inviteFriendToCurrentCall(friend);
    } else {
      callFriend(friend);
    }

    setTimeout(() => {
      setCallingState(prev => ({ ...prev, [friend.id]: 'connected' }));
    }, 1200);
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`Entre no ${serverName} no Orb.co!`)}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {inVoiceCall ? 'Chamar para a Sala de Voz' : 'Convidar para o Servidor'}
              </h3>
              <p className="text-xs text-slate-400">
                {serverName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setInviteModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Chamar Amigos vs Link de Convite */}
        <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] my-4 shrink-0">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Chamar da Lista de Amigos</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Link & Redes Sociais</span>
          </button>
        </div>

        {/* TAB 1: CHAMAR AMIGOS DIRETAMENTE */}
        {activeTab === 'friends' && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {inVoiceCall 
                  ? 'Clique em chamar para puxar um amigo instantaneamente para esta chamada!' 
                  : 'Chame qualquer amigo da sua lista para iniciar a conversa.'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {friends.map((friend) => {
                const isAlreadyInRoom = simulatedVoiceParticipants.some(p => p.id === friend.id);
                const status = callingState[friend.id] || (isAlreadyInRoom ? 'connected' : 'idle');

                return (
                  <div
                    key={friend.id}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img 
                          src={friend.avatarUrl} 
                          alt={friend.name} 
                          className="w-10 h-10 rounded-2xl object-cover border border-white/10" 
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d0f17] ${
                          friend.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                        }`}></span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                          <span>{friend.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {friend.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {friend.customStatus || (friend.status === 'online' ? 'Online' : 'Offline')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDirectCallFriend(friend)}
                      disabled={status === 'connected' || isAlreadyInRoom}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 shadow-md ${
                        status === 'connected' || isAlreadyInRoom
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : status === 'calling'
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {status === 'connected' || isAlreadyInRoom ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Na Chamada</span>
                        </>
                      ) : status === 'calling' ? (
                        <>
                          <Radio className="w-3.5 h-3.5 animate-spin" />
                          <span>Chamando...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5" />
                          <span>Chamar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LINK DE CONVITE & REDES */}
        {activeTab === 'link' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Link Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Link de Convite Direto (Funciona em qualquer navegador)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={inviteLink}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 glass-input px-3.5 py-2.5 rounded-2xl text-xs font-mono text-cyan-300 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Código do Servidor: <code className="text-cyan-300 font-mono font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{serverId}</code></span>
                <span className="text-emerald-400 font-medium">Nunca expira</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="pt-2 border-t border-white/5 space-y-2.5">
              <span className="text-xs font-semibold text-slate-300 block">
                Compartilhar em Redes Sociais
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={shareToTelegram}
                  className="p-3 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Send className="w-5 h-5 text-sky-400" />
                  <span>Telegram</span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={shareToTwitter}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span className="font-bold text-sm">𝕏</span>
                  <span>Twitter / X</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
