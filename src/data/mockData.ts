import { ServerData, UserProfile, ChatMessage, Friend } from '../types';

export const DEFAULT_CLEAN_USER: UserProfile = {
  id: 'user_main',
  name: 'Você',
  tag: 'voce#0001',
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

// Initial Servers (can be created by user)
export const INITIAL_SERVERS: ServerData[] = [];

// Initial Chat Messages
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

// Friends Matching the User's Reference Image (Image 1)
export const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'friend_marina',
    name: 'Marina',
    tag: 'marina#1042',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Viu a nova interface? 👀',
    bio: 'Designer UI/UX no Orb.co ✨',
    ping: 18,
  },
  {
    id: 'friend_theo',
    name: 'Theo',
    tag: 'theo#2914',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Bora call mais tarde?',
    bio: 'Desenvolvedor Frontend & Gamer 🎮',
    ping: 22,
  },
  {
    id: 'friend_luiza',
    name: 'Luiza',
    tag: 'luiza#5819',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    status: 'idle',
    customStatus: 'Diga oi!',
    bio: 'Ilustradora Cósmica 🪐',
    ping: 30,
  },
  {
    id: 'friend_caio',
    name: 'Caio',
    tag: 'caio#7721',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    status: 'offline',
    customStatus: 'Diga oi!',
    bio: 'Offline no momento',
    ping: 45,
  },
  {
    id: 'friend_bia',
    name: 'Bia',
    tag: 'bia#3390',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    status: 'online',
    customStatus: 'Diga oi!',
    bio: 'Ouvindo música no Orbit 🎧',
    ping: 24,
  },
];
