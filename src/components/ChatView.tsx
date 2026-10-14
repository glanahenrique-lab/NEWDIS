import React, { useState, useRef, useEffect } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Hash, 
  Share2, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  Image, 
  Volume2, 
  PhoneCall, 
  Radio, 
  X,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { UserContextMenu } from './UserContextMenu';

export const ChatView: React.FC = () => {
  const { 
    currentChannel, 
    messages, 
    sendMessage, 
    currentUser, 
    connectVoice, 
    setInviteModalOpen,
    setSoundboardModalOpen
  } = useOrbita();

  const [inputContent, setInputContent] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: UserProfile;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUserContextMenu = (e: React.MouseEvent, user: UserProfile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user
    });
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() && !attachmentPreview) return;
    sendMessage(inputContent, attachmentPreview || undefined);
    setInputContent('');
    setAttachmentPreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const quickEmojis = ['🚀', '🪐', '✨', '🔥', '😂', '🎮', '🎧', '❤️', '👍', '👀'];

  if (!currentChannel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-theme-main transition-colors">
        <Hash className="w-12 h-12 text-slate-600 mb-2" />
        <h3 className="text-base font-bold text-slate-400">Nenhum canal selecionado</h3>
        <p className="text-xs text-slate-500 mt-1">Selecione um canal na barra lateral para começar a conversar.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-theme-main overflow-hidden select-text relative transition-colors">
      {/* Channel Header */}
      <div className="h-14 px-6 border-b border-theme bg-theme-surface/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-base text-white">{currentChannel.name}</span>
          {currentChannel.topic && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 text-xs text-slate-400 truncate max-w-md">
              <span>{currentChannel.topic}</span>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Voice Join */}
          <button
            onClick={() => connectVoice()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all cursor-pointer"
            title="Entrar na chamada de voz do servidor"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Entrar em Voz</span>
          </button>

          {/* Invite Share */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Compartilhar convite"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Soundboard quick trigger */}
          <button
            onClick={() => setSoundboardModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Abrir soundboard"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable Area (Matches Screenshot 3: Natural borderless messages) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Welcome message */}
        <div className="py-6 text-left border-b border-white/5 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Hash className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            #{currentChannel.name}
          </h2>
          <p className="text-xs text-slate-400">
            Este canal está zerado e pronto para uso no Orb.co. Envie a primeira mensagem ou convide amigos para conversar!
          </p>
        </div>

        {/* Message Items */}
        {messages.map((msg) => {
          const authorProfile: UserProfile = msg.userId === currentUser.id ? currentUser : {
            id: msg.userId,
            name: msg.userName,
            avatarUrl: msg.userAvatar,
            bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
            email: `${msg.userName.toLowerCase()}@orb.co`,
            bio: 'Membro do servidor',
            status: 'online',
            ping: 20,
            role: 'member'
          };

          return (
            <div 
              key={msg.id} 
              onContextMenu={(e) => handleUserContextMenu(e, authorProfile)}
              className="flex items-start gap-3.5 group hover:bg-white/[0.02] -mx-3 px-3 py-1.5 rounded-xl transition-colors cursor-context-menu"
            >
              {/* User Avatar */}
              <img 
                src={msg.userAvatar} 
                alt={msg.userName} 
                onClick={(e) => handleUserContextMenu(e, authorProfile)}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 mt-0.5 cursor-pointer hover:border-cyan-400 transition-colors" 
                title="Clique ou botão direito para opções"
              />

              {/* Message Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    onClick={(e) => handleUserContextMenu(e, authorProfile)}
                    className="font-bold text-sm text-slate-200 tracking-tight hover:underline cursor-pointer"
                  >
                    {msg.userName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Text content - borderless, smoothly blending into dark slate */}
                <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-wrap break-words">
                  {msg.content}
                </p>

                {/* Attachment Preview if any */}
                {msg.attachmentUrl && (
                  <div className="mt-2.5 max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <img 
                      src={msg.attachmentUrl} 
                      alt="Anexo enviado" 
                      className="w-full max-h-72 object-cover rounded-xl hover:scale-[1.01] transition-transform cursor-pointer" 
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Thumbnail above input */}
      {attachmentPreview && (
        <div className="px-6 py-2 bg-[#12141e]/90 border-t border-white/5 flex items-center gap-3">
          <div className="relative">
            <img 
              src={attachmentPreview} 
              alt="Prévia de anexo" 
              className="w-14 h-14 object-cover rounded-xl border border-indigo-500/40" 
            />
            <button
              onClick={() => setAttachmentPreview(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-400">Imagem pronta para envio</span>
        </div>
      )}

      {/* Bottom Floating Typing Bar (Matches Screenshot 3) */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-[#0b0c10] to-transparent shrink-0">
        <div className="relative max-w-4xl mx-auto">
          {/* Quick Emoji Bar when triggered */}
          {showEmojiPicker && (
            <div className="absolute -top-12 left-4 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl border border-white/15 animate-fade-in z-30">
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputContent(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Pill Container */}
          <form 
            onSubmit={handleSend}
            className="glass-input rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 shadow-xl focus-within:border-indigo-500/50 transition-all"
          >
            {/* File attachment trigger */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Anexar imagem"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <input 
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enviar mensagem em #${currentChannel.name}...`}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Emoji Trigger */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Inserir emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputContent.trim() && !attachmentPreview}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* User Context Menu (Right Click) */}
      {contextMenu && (
        <UserContextMenu
          user={contextMenu.user}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
