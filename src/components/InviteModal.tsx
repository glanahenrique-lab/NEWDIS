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
  MessageCircle
} from 'lucide-react';

export const InviteModal: React.FC = () => {
  const { currentServer, inviteModalOpen, setInviteModalOpen } = useOrbita();
  const [copied, setCopied] = useState(false);

  if (!inviteModalOpen) return null;

  const serverName = currentServer ? currentServer.name : 'Orb.co';
  const inviteLink = `${window.location.origin || 'https://orb.co'}#convite=${currentServer ? currentServer.id : 'orb'}`;
  const shareText = `Venha conversar comigo no ${serverName} no Orb.co! Voz ultraleve e compartilhamento de tela: ${inviteLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/10 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Convidar Amigos</h3>
              <p className="text-xs text-slate-400">{serverName}</p>
            </div>
          </div>
          <button
            onClick={() => setInviteModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Box */}
        <div className="py-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Link de Convite Direto
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={inviteLink}
              className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono text-cyan-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Seu link de convite nunca expira e permite acesso aos canais públicos.
          </p>
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
              className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={shareToTelegram}
              className="p-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span>Telegram</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={shareToTwitter}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <span className="font-bold text-sm">𝕏</span>
              <span>Twitter / X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
