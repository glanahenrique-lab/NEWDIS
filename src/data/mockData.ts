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
    members: []
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

// Initial Chat Messages (Zero bots)
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

// Friends List: Zero bots. Only real accounts added by users.
export const INITIAL_FRIENDS: Friend[] = [];
