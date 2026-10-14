import { ServerData, UserProfile, ChatMessage, Friend } from '../types';

export const DEFAULT_CLEAN_USER: UserProfile = {
  id: 'user_main',
  accountId: '1001',
  name: 'Você',
  tag: 'voce#1001',
  email: 'usuario@orb.co',
  bio: 'Novo usuário no Orb.co. Crie um servidor ou adicione amigos!',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
  bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
  status: 'online',
  customStatus: 'Disponível no Orb.co 🪐',
  ping: 18,
  isSpeaking: false,
  badges: ['👑 Dono', '⭐ Orb.co'],
  role: 'owner',
};

// Initial Server for instant interaction
export const INITIAL_SERVERS: ServerData[] = [
  {
    id: 'srv_orb_central',
    name: 'Orb.co Central',
    iconUrl: '🪐',
    description: 'Espaço cósmico do Orb.co! Transmissões, bate-papo e salas de voz.',
    ownerId: 'system_orb',
    theme: 'nebula',
    accentColor: '#818cf8',
    roles: [
      {
        id: 'role_admin',
        name: 'Guardião',
        color: '#f59e0b',
        permissions: {
          sendMessages: true,
          speakInVoice: true,
          shareScreen: true,
          useSoundboard: true,
          manageChannels: true,
          muteMembers: true,
          administrator: true,
        }
      },
      {
        id: 'role_member',
        name: 'Explorador',
        color: '#10b981',
        permissions: {
          sendMessages: true,
          speakInVoice: true,
          shareScreen: true,
          useSoundboard: true,
          manageChannels: false,
          muteMembers: false,
          administrator: false,
        }
      }
    ],
    channels: [
      { id: 'chan_central_geral', serverId: 'srv_orb_central', name: 'geral', type: 'text', topic: 'Canal de texto aberto para todos' },
      { id: 'chan_central_dev', serverId: 'srv_orb_central', name: 'projetos-e-ideias', type: 'text', topic: 'Compartilhe o que você está criando' },
      { id: 'chan_central_voz', serverId: 'srv_orb_central', name: 'Voz Geral', type: 'voice' },
      { id: 'chan_central_cine', serverId: 'srv_orb_central', name: 'Cine & Músicas 🍿', type: 'voice' },
    ],
    soundboard: [
      { id: 'snd_airhorn_c', serverId: 'srv_orb_central', title: 'Buzina MLG', emoji: '📢', category: 'Efeitos', soundKey: 'airhorn', volume: 0.8 },
      { id: 'snd_applause_c', serverId: 'srv_orb_central', title: 'Aplausos', emoji: '👏', category: 'Reação', soundKey: 'gg_applause', volume: 0.8 },
      { id: 'snd_bruh_c', serverId: 'srv_orb_central', title: 'Bruh', emoji: '🗿', category: 'Meme', soundKey: 'bruh', volume: 0.8 },
    ],
    members: [
      {
        id: 'user_clara',
        name: 'Clara Mendes',
        email: 'clara@orb.co',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=300&fit=crop',
        bio: 'Designer UI/UX 🎨',
        status: 'online',
        ping: 18,
        role: 'member',
      },
      {
        id: 'user_lucas',
        name: 'Lucas Rocha',
        email: 'lucas@orb.co',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
        bio: 'Dev Fullstack 💻',
        status: 'online',
        ping: 22,
        role: 'member',
      }
    ],
  }
];

// Catalogue of Public Community Servers to Discover and Join
export const PUBLIC_COMMUNITY_SERVERS: ServerData[] = [
  ...INITIAL_SERVERS,
  {
    id: 'srv_galaxia_gamer',
    name: 'Galáxia Gamer',
    iconUrl: '🎮',
    description: 'Servidor para quem joga de tudo! Lives, co-op e resenhas sem delay.',
    ownerId: 'system_gamer',
    theme: 'cyber',
    accentColor: '#06b6d4',
    roles: [
      {
        id: 'role_pro',
        name: 'Pro Player',
        color: '#22d3ee',
        permissions: { sendMessages: true, speakInVoice: true, shareScreen: true, useSoundboard: true, manageChannels: false, muteMembers: false, administrator: false }
      }
    ],
    channels: [
      { id: 'chan_gamer_geral', serverId: 'srv_galaxia_gamer', name: 'geral-jogos', type: 'text', topic: 'Conversas sobre lançamentos e partidas' },
      { id: 'chan_gamer_voz', serverId: 'srv_galaxia_gamer', name: 'Voz Squad #1', type: 'voice', userLimit: 5 },
      { id: 'chan_gamer_duo', serverId: 'srv_galaxia_gamer', name: 'Voz Duo #2', type: 'voice', userLimit: 2 },
    ],
    soundboard: [
      { id: 'snd_quack_g', serverId: 'srv_galaxia_gamer', title: 'Pato Quack', emoji: '🦆', category: 'Meme', soundKey: 'quack', volume: 0.7 },
      { id: 'snd_bruh_g', serverId: 'srv_galaxia_gamer', title: 'Bruh', emoji: '🗿', category: 'Meme', soundKey: 'bruh', volume: 0.8 },
    ],
    members: []
  },
  {
    id: 'srv_devs_universo',
    name: 'Devs do Universo',
    iconUrl: '💻',
    description: 'Comunidade de programação, TypeScript, UI/UX e desenvolvimento moderno.',
    ownerId: 'system_dev',
    theme: 'aurora',
    accentColor: '#10b981',
    roles: [
      {
        id: 'role_dev',
        name: 'Engenheiro',
        color: '#34d399',
        permissions: { sendMessages: true, speakInVoice: true, shareScreen: true, useSoundboard: true, manageChannels: false, muteMembers: false, administrator: false }
      }
    ],
    channels: [
      { id: 'chan_dev_geral', serverId: 'srv_devs_universo', name: 'codigo-e-cafe', type: 'text', topic: 'Dúvidas de código, React e arquitetura' },
      { id: 'chan_dev_voz', serverId: 'srv_devs_universo', name: 'Pair Programming', type: 'voice' },
    ],
    soundboard: [
      { id: 'snd_tada_d', serverId: 'srv_devs_universo', title: 'Ta-da!', emoji: '🎉', category: 'Efeitos', soundKey: 'tada', volume: 0.7 },
    ],
    members: []
  },
  {
    id: 'srv_lofi_lounge',
    name: 'Lofi & Chill Lounge',
    iconUrl: '🎧',
    description: 'Espaço calmo para estudar, trabalhar ouvindo música e bater papo leve.',
    ownerId: 'system_lofi',
    theme: 'rose',
    accentColor: '#f43f5e',
    roles: [],
    channels: [
      { id: 'chan_lofi_geral', serverId: 'srv_lofi_lounge', name: 'sala-de-estar', type: 'text', topic: 'Compartilhe músicas e vibes boas' },
      { id: 'chan_lofi_voz', serverId: 'srv_lofi_lounge', name: 'Estudo Silencioso ☕', type: 'voice' },
    ],
    soundboard: [],
    members: []
  }
];

// Initial Chat Messages
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome_1',
    channelId: 'chan_central_geral',
    serverId: 'srv_orb_central',
    userId: 'user_clara',
    userName: 'Clara Mendes',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Sejam bem-vindos ao Orb.co! Testem a chamada de voz em órbita e o compartilhamento simultâneo de tela 🪐✨',
    timestamp: '10:00'
  }
];

// Friends Matching the User's Reference Image (Image 1)
export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend_marina',
    accountId: '1042',
    name: 'Marina',
    tag: 'marina#1042',
    email: 'marina@orb.co',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Viu a nova interface? 👀',
    bio: 'Designer UI/UX no Orb.co ✨',
    ping: 18,
  },
  {
    id: 'friend_theo',
    accountId: '2914',
    name: 'Theo',
    tag: 'theo#2914',
    email: 'theo@orb.co',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Bora call mais tarde?',
    bio: 'Desenvolvedor Frontend & Gamer 🎮',
    ping: 22,
  },
  {
    id: 'friend_luiza',
    accountId: '5819',
    name: 'Luiza',
    tag: 'luiza#5819',
    email: 'luiza@orb.co',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    status: 'idle',
    customStatus: 'Diga oi!',
    bio: 'Ilustradora Cósmica 🪐',
    ping: 30,
  },
  {
    id: 'friend_caio',
    accountId: '7721',
    name: 'Caio',
    tag: 'caio#7721',
    email: 'caio@orb.co',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    status: 'offline',
    customStatus: 'Diga oi!',
    bio: 'Offline no momento',
    ping: 45,
  },
  {
    id: 'friend_bia',
    accountId: '3390',
    name: 'Bia',
    tag: 'bia#3390',
    email: 'bia@orb.co',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Diga oi!',
    bio: 'Ouvindo música no Orbit 🎧',
    ping: 24,
  },
];
