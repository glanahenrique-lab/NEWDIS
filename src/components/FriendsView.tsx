import React, { useState, useRef, useEffect } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Phone, 
  PhoneCall, 
  Search, 
  Send, 
  ArrowLeft, 
  X, 
  Check,
  MoreVertical,
  Volume2
} from 'lucide-react';
import { Friend, UserProfile } from '../types';
import { UserContextMenu } from './UserContextMenu';

// Colors for avatar letter initials matching Image 1
const AVATAR_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  'Marina': { bg: 'bg-[#6366f1]/25', text: 'text-[#818cf8]', border: 'border-[#6366f1]/40' },
  'Theo': { bg: 'bg-[#84cc16]/25', text: 'text-[#a3e635]', border: 'border-[#84cc16]/40' },
  'Luiza': { bg: 'bg-[#06b6d4]/25', text: 'text-[#22d3ee]', border: 'border-[#06b6d4]/40' },
  'Caio': { bg: 'bg-[#f43f5e]/25', text: 'text-[#fb7185]', border: 'border-[#f43f5e]/40' },
  'Bia': { bg: 'bg-[#10b981]/25', text: 'text-[#34d399]', border: 'border-[#10b981]/40' },
};

export const FriendsView: React.FC = () => {
  const { 
    friends, 
    activeFriend, 
    selectFriend, 
    addFriend, 
    currentDirectMessages, 
    sendDirectMessage,
    startPrivateCall,
    currentUser
  } = useOrbita();

  const [activeFilter, setActiveFilter] = useState<'online' | 'todos'>('online');
  const [friendInput, setFriendInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [dmContent, setDmContent] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: UserProfile;
  } | null>(null);

  const dmEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll DM chat
  useEffect(() => {
    dmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentDirectMessages]);

  const handleFriendContextMenu = (e: React.MouseEvent, friend: Friend) => {
    e.preventDefault();
    e.stopPropagation();
    const userProfile: UserProfile = {
      id: friend.id,
      name: friend.name,
      tag: friend.tag,
      avatarUrl: friend.avatarUrl,
      email: `${friend.name.toLowerCase()}@orb.co`,
      bio: friend.bio || '',
      status: friend.status,
      ping: friend.ping || 20,
      bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
      role: 'member'
    };
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user: userProfile
    });
  };

  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    const res = addFriend(friendInput);
    setAddFeedback(res);
    if (res.success) {
      setFriendInput('');
      setTimeout(() => setAddFeedback(null), 3500);
    }
  };

  const handleSendDM = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dmContent.trim()) return;
    sendDirectMessage(dmContent);
    setDmContent('');
  };

  const onlineFriends = friends.filter(f => f.status === 'online');
  const displayedFriends = activeFilter === 'online' ? onlineFriends : friends;

  // Helper for status badge color
  const getStatusDot = (status: string) => {
    if (status === 'online') return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
    if (status === 'idle') return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    return 'bg-slate-500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'online') return 'Online';
    if (status === 'idle') return 'Ausente';
    return 'Offline';
  };

  // 1. If a friend is selected, render Direct Message Conversation
  if (activeFriend) {
    return (
      <div className="flex-1 flex flex-col h-full bg-theme-main p-3 sm:p-4 overflow-hidden select-text transition-colors">
        <div className="flex-1 bubble-island rounded-3xl flex flex-col overflow-hidden border border-theme shadow-2xl">
          {/* DM Header */}
          <div className="h-16 px-6 border-b border-theme bg-theme-surface/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => selectFriend(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1"
                title="Voltar para a lista de amigos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <img 
                  src={activeFriend.avatarUrl} 
                  alt={activeFriend.name} 
                  className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md" 
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0b0c13] ${getStatusDot(activeFriend.status)}`}></span>
              </div>

              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <span>{activeFriend.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono font-normal">
                    {activeFriend.tag}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeFriend.customStatus || getStatusLabel(activeFriend.status)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => startPrivateCall(activeFriend)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
                title="Iniciar chamada de voz"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ligar</span>
              </button>

              <button
                onClick={() => selectFriend(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar conversa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DM Message Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentDirectMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400 py-12">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-300 shadow-xl">
                  💬
                </div>
                <h3 className="text-base font-bold text-white">Início da conversa com {activeFriend.name}</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Este é o começo da sua troca de mensagens diretas e privadas no Orb.co.
                </p>
              </div>
            ) : (
              currentDirectMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <img src={msg.senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-1" />
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-xs' 
                        : 'bg-white/10 text-slate-100 rounded-bl-xs border border-white/10'
                    }`}>
                      <p>{msg.content}</p>
                      <span className={`text-[9px] block text-right mt-1 font-mono ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={dmEndRef} />
          </div>

          {/* DM Input Bar */}
          <div className="p-4 bg-theme-surface/90 border-t border-theme shrink-0">
            <form onSubmit={handleSendDM} className="flex items-center gap-2">
              <input 
                type="text" 
                value={dmContent}
                onChange={(e) => setDmContent(e.target.value)}
                placeholder={`Conversar com @${activeFriend.name}...`}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] px-4 py-2.5 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!dmContent.trim()}
                className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Friends Hub Layout (Directly matching Image 1 - image.png)
  return (
    <div className="flex-1 flex flex-col h-full bg-theme-main p-4 sm:p-6 overflow-y-auto select-none transition-colors">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Top Header: "Amigos", "Sua órbita" */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Amigos
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              Sua órbita
            </p>
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('online')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'online'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Online ({onlineFriends.length})
            </button>
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'todos'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({friends.length})
            </button>
          </div>
        </div>

        {/* Add Friend Input Bar (Exact match to Image 1) */}
        <form onSubmit={handleAddFriendSubmit} className="space-y-2">
          <div className="bubble-card rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-lg focus-within:border-cyan-400/50 transition-all">
            <input 
              type="text" 
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="Adicionar amigo pelo nome de usuário..."
              className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!friendInput.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-400/20 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Adicionar
            </button>
          </div>

          {addFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
              addFeedback.success 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {addFeedback.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              <span>{addFeedback.message}</span>
            </div>
          )}
        </form>

        {/* Section Counter: "3 ONLINE AGORA" */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {activeFilter === 'online' ? `${onlineFriends.length} ONLINE AGORA` : `${friends.length} AMIGOS NO TOTAL`}
          </span>
        </div>

        {/* =========================================================================
            THE BUBBLE GRID OF FRIENDS CARDS (Exact match to Image 1)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
          {displayedFriends.map((friend) => {
            const initial = friend.name.charAt(0).toUpperCase();
            const palette = AVATAR_PALETTES[friend.name] || {
              bg: 'bg-indigo-500/25',
              text: 'text-indigo-300',
              border: 'border-indigo-500/40'
            };

            return (
              <div
                key={friend.id}
                onContextMenu={(e) => handleFriendContextMenu(e, friend)}
                className="bubble-card rounded-3xl p-6 flex flex-col items-center justify-center relative group text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20 select-none animate-scale-in"
                title={`${friend.name} • Clique para conversar (Botão direito para opções)`}
              >
                {/* Large Circular Avatar with Initial Letter or Photo */}
                <div 
                  onClick={() => selectFriend(friend.id)}
                  className="relative mb-3.5 group-hover:scale-105 transition-transform duration-300"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold shadow-md border-2 transition-all ${palette.bg} ${palette.text} ${palette.border}`}>
                    {friend.avatarUrl ? (
                      <img 
                        src={friend.avatarUrl} 
                        alt={friend.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  {/* Online / Ausente Status Dot */}
                  <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-[var(--theme-card)] transition-colors ${getStatusDot(friend.status)}`}></span>
                </div>

                {/* Friend Name */}
                <h3 
                  onClick={() => selectFriend(friend.id)}
                  className="text-sm font-bold text-white group-hover:text-[var(--theme-accent)] transition-colors tracking-tight"
                >
                  {friend.name}
                </h3>

                {/* Status Text & Custom status */}
                <p className="text-xs text-slate-400 mt-0.5">
                  {getStatusLabel(friend.status)}
                </p>

                {/* Action Bubble Buttons (Message & Call) */}
                <div className="flex items-center gap-2.5 mt-5">
                  {/* Chat bubble button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectFriend(friend.id);
                    }}
                    className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-white/[0.08]"
                    title={`Abrir mensagem com ${friend.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  {/* Call bubble button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startPrivateCall(friend);
                    }}
                    className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-white/[0.08]"
                    title={`Ligar para ${friend.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {displayedFriends.length === 0 && (
          <div className="py-16 text-center bubble-card rounded-3xl p-8 border border-white/5 space-y-2">
            <p className="text-sm text-slate-300 font-semibold">Nenhum amigo encontrado nesta categoria</p>
            <p className="text-xs text-slate-500">Adicione amigos pelo nome ou tag acima para começar a interagir!</p>
          </div>
        )}
      </div>

      {/* User Context Menu */}
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
