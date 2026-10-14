import React, { useState, useRef, useEffect } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Phone, 
  Send, 
  ArrowLeft, 
  X, 
  Check, 
  Copy, 
  Compass, 
  Clock, 
  ShieldCheck, 
  Share2,
  Inbox,
  SendHorizontal
} from 'lucide-react';
import { Friend, UserProfile, ServerData } from '../types';
import { UserContextMenu } from './UserContextMenu';

// Colors for avatar letter initials
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
    sendFriendRequest, 
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    incomingFriendRequests,
    outgoingFriendRequests,
    pendingRequestsCount,
    registeredAccountsList,
    sendServerInviteToFriend,
    servers,
    joinServer,
    currentDirectMessages, 
    sendDirectMessage,
    callFriend,
    currentUser,
    showToast
  } = useOrbita();

  const [activeTab, setActiveTab] = useState<'online' | 'todos' | 'pendentes' | 'adicionar'>('online');
  const [friendInput, setFriendInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dmContent, setDmContent] = useState('');
  const [inviteModalFriend, setInviteModalFriend] = useState<Friend | null>(null);

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
      email: friend.email || `${friend.name.toLowerCase()}@orb.co`,
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

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await sendFriendRequest(friendInput.trim());
      setAddFeedback(res);
      if (res.success) {
        setFriendInput('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDM = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dmContent.trim()) return;
    sendDirectMessage(dmContent);
    setDmContent('');
  };

  const onlineFriends = friends.filter(f => f.status === 'online');
  const displayedFriends = activeTab === 'online' ? onlineFriends : friends;

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

  // 1. Direct Message Conversation View
  if (activeFriend) {
    return (
      <div className="flex-1 flex flex-col h-full bg-theme-main p-3 sm:p-4 overflow-hidden select-text transition-colors">
        <div className="flex-1 bubble-island rounded-3xl flex flex-col overflow-hidden border border-theme shadow-2xl">
          {/* DM Header */}
          <div className="h-16 px-6 border-b border-theme bg-theme-surface/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => selectFriend(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mr-1 shrink-0"
                title="Voltar para a lista de amigos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <img 
                  src={activeFriend.avatarUrl} 
                  alt={activeFriend.name} 
                  className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md" 
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0b0c13] ${getStatusDot(activeFriend.status)}`}></span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 font-bold text-sm text-white truncate">
                  <span>{activeFriend.name}</span>
                  <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/15 px-1.5 py-0.5 rounded-md shrink-0">
                    ID: #{activeFriend.accountId || activeFriend.tag.split('#')[1]}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono font-normal hidden sm:inline-block truncate">
                    ({activeFriend.tag})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                    <ShieldCheck className="w-3 h-3" /> Amigo Confirmado
                  </span>
                  {activeFriend.email && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400 font-mono text-[10px] truncate">{activeFriend.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Ligar & Convite de Servidor */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setInviteModalFriend(activeFriend)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                title={`Enviar convite de servidor para ${activeFriend.name}`}
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Convite de Servidor</span>
              </button>

              <button
                onClick={() => callFriend(activeFriend)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
                title={`Ligar diretamente para ${activeFriend.name}`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ligar Agora</span>
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
                  Amizade confirmada! Você pode trocar mensagens diretas e convidar {activeFriend.name} para os seus servidores.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setInviteModalFriend(activeFriend)}
                    className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-indigo-300" />
                    <span>Convidar para um Servidor</span>
                  </button>
                </div>
              </div>
            ) : (
              currentDirectMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <img src={msg.senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mb-1" />
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-br-xs' 
                        : 'bg-white/10 text-slate-100 rounded-bl-xs border border-white/10'
                    }`}>
                      <p>{msg.content}</p>

                      {/* Server Invite Attachment Card */}
                      {msg.serverInvite && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-black/40 border border-white/15 flex flex-col gap-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
                              {msg.serverInvite.serverIcon || '🪐'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{msg.serverInvite.serverName}</h4>
                              <p className="text-[10px] text-slate-300 line-clamp-1">{msg.serverInvite.serverDescription || 'Convite para servidor do Orb.co'}</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const res = await joinServer(msg.serverInvite!.serverId);
                              if (res.success) {
                                showToast(`Você entrou no servidor ${msg.serverInvite!.serverName}!`, 'success');
                              }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Entrar no Servidor</span>
                          </button>
                        </div>
                      )}

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

          {/* DM Input Bar with Server Invite Trigger */}
          <div className="p-4 bg-theme-surface/90 border-t border-theme shrink-0">
            <form onSubmit={handleSendDM} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInviteModalFriend(activeFriend)}
                className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-white/[0.08] transition-all cursor-pointer shadow-sm"
                title="Enviar convite de servidor para este amigo"
              >
                <Compass className="w-4 h-4" />
              </button>

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

        {/* Server Picker Modal for DM */}
        {inviteModalFriend && (
          <ServerInviteModal 
            friend={inviteModalFriend}
            servers={servers}
            onClose={() => setInviteModalFriend(null)}
            onSendInvite={(serverId) => {
              sendServerInviteToFriend(inviteModalFriend.id, serverId);
              setInviteModalFriend(null);
            }}
          />
        )}
      </div>
    );
  }

  // 2. Main Friends Hub Layout
  return (
    <div className="flex-1 flex flex-col h-full bg-theme-main p-4 sm:p-6 overflow-y-auto select-none transition-colors">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Your Own Identity Banner with Automatic ID, Tag and Email */}
        <div className="bubble-card rounded-2xl p-4 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-indigo-950/20 to-purple-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-11 h-11 rounded-2xl object-cover border border-cyan-400/40 shadow-md" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-theme"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white truncate">{currentUser.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  ID: #{currentUser.accountId || currentUser.tag?.split('#')[1] || '1001'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2 mt-0.5">
                <span className="font-mono text-slate-300">{currentUser.tag || `${currentUser.name}#${currentUser.accountId || '1001'}`}</span>
                <span>•</span>
                <span className="text-slate-400 truncate">{currentUser.email || 'usuario@orb.co'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                const tagToCopy = currentUser.tag || `${currentUser.name}#${currentUser.accountId || '1001'}`;
                navigator.clipboard.writeText(tagToCopy);
                showToast(`Tag ${tagToCopy} copiada! Compartilhe com amigos.`, 'success');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Copiar minha Tag (Nick#ID) para amigos me adicionarem"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Minha Tag</span>
            </button>
          </div>
        </div>

        {/* Top Header: Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-400" />
              <span>Amigos</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              Conecte-se com pessoas reais • Sem bots • Envie mensagens e convites de servidor após confirmação
            </p>
          </div>

          {/* Tabs: Online, Todos, Pendentes, Adicionar Amigo */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('online')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'online'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Online ({onlineFriends.length})
            </button>
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'todos'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('pendentes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'pendentes'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Pendentes</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('adicionar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'adicionar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Adicionar Amigo</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB: ADICIONAR AMIGO
            ========================================================================= */}
        {activeTab === 'adicionar' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bubble-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>Adicionar Amigo por Conta Real</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Digite o <strong>ID numérico automático</strong> (ex: #1042), a <strong>Tag completa</strong> (ex: nome#1042) ou o <strong>E-mail</strong> da pessoa. 
                  Ao enviar, a pessoa receberá uma <strong>solicitação de amizade para confirmar ou recusar</strong>. 
                  Apenas após a confirmação dela vocês poderão conversar e enviar convites de servidor.
                </p>
              </div>

              <form onSubmit={handleAddFriendSubmit} className="space-y-3">
                <div className="bubble-card rounded-2xl p-1.5 flex items-center gap-2 border border-white/10 shadow-lg focus-within:border-emerald-400/50 transition-all">
                  <input 
                    type="text" 
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="Digite o ID (ex: 1042), Tag (ex: rodrigo#1042) ou E-mail da conta..."
                    className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!friendInput.trim() || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? 'Verificando...' : 'Enviar Solicitação'}
                  </button>
                </div>

                {addFeedback && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
                    addFeedback.success 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {addFeedback.success ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                    <span>{addFeedback.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* List of Registered Accounts on the System for Discovery & Testing */}
            <div className="bubble-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Contas Registradas no Orb.co</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contas reais criadas na plataforma disponíveis para envio de solicitação.
                  </p>
                </div>
              </div>

              {registeredAccountsList.filter(acc => acc.id !== currentUser.id && acc.accountId !== currentUser.accountId).length === 0 ? (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-semibold">
                    Nenhuma outra conta cadastrada no momento.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Para testar a confirmação de solicitação: abra outra aba no navegador ou cadastre uma nova conta na tela de autenticação, e envie a solicitação para o seu ID (#{currentUser.accountId || '1001'}).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {registeredAccountsList
                    .filter(acc => acc.id !== currentUser.id && acc.accountId !== currentUser.accountId)
                    .map(account => {
                      const isAlreadyFriend = friends.some(f => f.id === account.id || (f.accountId && f.accountId === account.accountId));
                      const isPendingSent = outgoingFriendRequests.some(r => r.receiverId === account.id || r.receiverAccountId === account.accountId);
                      const isPendingReceived = incomingFriendRequests.some(r => r.senderId === account.id || r.senderAccountId === account.accountId);

                      return (
                        <div 
                          key={account.id}
                          className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={account.avatarUrl} 
                              alt={account.name} 
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" 
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white truncate">{account.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold shrink-0">
                                  #{account.accountId || account.tag?.split('#')[1]}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{account.tag}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isAlreadyFriend ? (
                              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Check className="w-3 h-3" /> Amigo
                              </span>
                            ) : isPendingSent ? (
                              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Clock className="w-3 h-3" /> Enviada
                              </span>
                            ) : isPendingReceived ? (
                              <button
                                onClick={() => setActiveTab('pendentes')}
                                className="text-[11px] text-cyan-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 cursor-pointer"
                              >
                                Responder
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  const query = account.accountId || account.tag || account.name;
                                  const res = await sendFriendRequest(query);
                                  setAddFeedback(res);
                                }}
                                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
                              >
                                Solicitar Amizade
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: SOLICITAÇÕES PENDENTES (CONFIRMAR OU RECUSAR)
            ========================================================================= */}
        {activeTab === 'pendentes' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Solicitações Recebidas */}
            <div className="bubble-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-emerald-400" />
                  <span>Solicitações de Amizade Recebidas ({incomingFriendRequests.length})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Confirme para liberar chat e convite de servidor
                </span>
              </div>

              {incomingFriendRequests.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold text-slate-300">Nenhuma solicitação de amizade recebida.</p>
                  <p className="text-[11px] text-slate-500">Quando alguém te adicionar pelo seu ID (#{currentUser.accountId}), a solicitação aparecerá aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingFriendRequests.map(req => (
                    <div 
                      key={req.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={req.senderAvatar} 
                          alt={req.senderName} 
                          className="w-12 h-12 rounded-2xl object-cover border border-emerald-400/30 shadow-md shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{req.senderName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                              ID: #{req.senderAccountId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{req.senderTag}</p>
                          <p className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1 font-medium">
                            <UserPlus className="w-3 h-3" /> Enviou solicitação de amizade para você
                          </p>
                        </div>
                      </div>

                      {/* Confirmar ou Recusar Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => acceptFriendRequest(req.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
                          title="Aceitar e confirmar amizade"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Confirmar Amizade</span>
                        </button>

                        <button
                          onClick={() => declineFriendRequest(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                          title="Recusar solicitação de amizade"
                        >
                          <X className="w-4 h-4" />
                          <span>Recusar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Solicitações Enviadas Aguardando Confirmação */}
            <div className="bubble-card rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SendHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Solicitações Enviadas ({outgoingFriendRequests.length})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Aguardando confirmação da outra pessoa
                </span>
              </div>

              {outgoingFriendRequests.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <p className="text-xs font-semibold text-slate-300">Nenhuma solicitação enviada pendente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outgoingFriendRequests.map(req => (
                    <div 
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{req.receiverName || 'Usuário'}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                            ID: #{req.receiverAccountId}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Aguardando a pessoa confirmar ou recusar...</span>
                        </p>
                      </div>

                      <button
                        onClick={() => cancelFriendRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs transition-all cursor-pointer"
                        title="Cancelar solicitação de amizade enviada"
                      >
                        Cancelar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: ONLINE OU TODOS OS AMIGOS
            ========================================================================= */}
        {(activeTab === 'online' || activeTab === 'todos') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {activeTab === 'online' ? `${onlineFriends.length} ONLINE AGORA` : `${friends.length} AMIGOS NO TOTAL`}
              </span>

              {friends.length > 0 && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Amizades confirmadas (Zero bots)
                </span>
              )}
            </div>

            {/* Bubble Grid of Confirmed Friends */}
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
                    className="bubble-card rounded-3xl p-5 flex flex-col items-center justify-center relative group text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20 select-none animate-scale-in"
                    title={`${friend.name} • Clique para conversar (Botão direito para opções)`}
                  >
                    {/* Large Circular Avatar */}
                    <div 
                      onClick={() => selectFriend(friend.id)}
                      className="relative mb-3 group-hover:scale-105 transition-transform duration-300"
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

                    {/* Friend Name & Automatic ID */}
                    <h3 
                      onClick={() => selectFriend(friend.id)}
                      className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight flex items-center gap-1.5 justify-center"
                    >
                      <span>{friend.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                        #{friend.accountId || friend.tag.split('#')[1]}
                      </span>
                    </h3>

                    {/* Tag & Email */}
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex flex-col items-center">
                      <span>{friend.tag}</span>
                      {friend.email && <span className="text-slate-500 text-[9px]">{friend.email}</span>}
                    </div>

                    {/* Status Text & Custom status */}
                    <p className="text-xs text-slate-400 mt-1">
                      {getStatusLabel(friend.status)}
                    </p>

                    {/* Action Buttons: Conversar, Ligar & Convite de Servidor */}
                    <div className="flex items-center gap-2 mt-4 w-full">
                      {/* Chat individual button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectFriend(friend.id);
                        }}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-slate-200 hover:text-white flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm border border-white/[0.08]"
                        title={`Conversar individualmente com ${friend.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Conversar</span>
                      </button>

                      {/* Server invite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInviteModalFriend(friend);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                        title={`Convidar ${friend.name} para um servidor`}
                      >
                        <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="hidden sm:inline">Servidor</span>
                      </button>

                      {/* Call direct button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          callFriend(friend);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 flex items-center justify-center gap-1 text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm border border-emerald-500/30"
                        title={`Ligar diretamente para ${friend.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayedFriends.length === 0 && (
              <div className="py-16 text-center bubble-card rounded-3xl p-8 border border-white/5 space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-sm text-slate-300 font-semibold">Nenhum amigo confirmado nesta lista.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Acesse a aba <strong>Adicionar Amigo</strong> para enviar solicitações a pessoas com contas cadastradas ou verifique a aba <strong>Pendentes</strong> para confirmar solicitações recebidas!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('adicionar')}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Adicionar Amigo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Server Picker Modal for Friends */}
      {inviteModalFriend && (
        <ServerInviteModal 
          friend={inviteModalFriend}
          servers={servers}
          onClose={() => setInviteModalFriend(null)}
          onSendInvite={(serverId) => {
            sendServerInviteToFriend(inviteModalFriend.id, serverId);
            setInviteModalFriend(null);
          }}
        />
      )}

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

// Sub-component: Server Invite Picker Modal
interface ServerInviteModalProps {
  friend: Friend;
  servers: ServerData[];
  onClose: () => void;
  onSendInvite: (serverId: string) => void;
}

const ServerInviteModal: React.FC<ServerInviteModalProps> = ({ friend, servers, onClose, onSendInvite }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bubble-card rounded-3xl p-6 border border-white/15 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Convidar para um Servidor</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Escolha um servidor para enviar o convite individual para <strong>@{friend.name}</strong>:
        </p>

        {servers.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/[0.03] text-center text-xs text-slate-400">
            Você não participa de nenhum servidor no momento. Crie ou entre em um servidor para poder convidar amigos!
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {servers.map(server => (
              <div 
                key={server.id}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-lg shrink-0">
                    {server.iconUrl || '🪐'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{server.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {server.channels?.length || 0} canais • {server.description || 'Servidor Orb.co'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSendInvite(server.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
                >
                  Convidar
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
