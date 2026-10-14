export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface ConnectedAccounts {
  spotify?: string;
  instagram?: string;
  github?: string;
  twitch?: string;
  youtube?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  tag?: string;
  email: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  status: UserStatus;
  customStatus?: string;
  ping: number; // latency in ms
  isSpeaking?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  isSharingScreen?: boolean;
  isCameraOn?: boolean;
  connectedAccounts?: ConnectedAccounts;
  badges?: string[];
  createdAt?: string;
  role?: 'owner' | 'admin' | 'moderator' | 'member';
}

export type ServerTheme = 'nebula' | 'cyber' | 'aurora' | 'solar' | 'rose' | 'graphite' | 'custom';
export type AppTheme = 'nebula' | 'cyber' | 'aurora' | 'solar' | 'rose' | 'graphite' | 'light' | 'custom';

export interface ThemeSettings {
  theme: AppTheme;
  accentColor: string;
  bgColor?: string;
}

export interface RolePermissions {
  sendMessages: boolean;
  speakInVoice: boolean;
  shareScreen: boolean;
  useSoundboard: boolean;
  manageChannels: boolean;
  muteMembers: boolean;
  administrator: boolean;
}

export interface ServerRole {
  id: string;
  name: string;
  color: string;
  permissions: RolePermissions;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
  topic?: string;
  activeUsers?: string[];
  userLimit?: number; // 0 or undefined = unlimited
}

export interface ChatMessage {
  id: string;
  channelId: string;
  serverId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  attachmentUrl?: string;
  timestamp: string;
  reactions?: Record<string, number>;
}

export interface DirectMessage {
  id: string;
  friendId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  attachmentUrl?: string;
  timestamp: string;
}

export interface Friend {
  id: string;
  name: string;
  tag: string;
  avatarUrl: string;
  status: UserStatus;
  customStatus?: string;
  bio?: string;
  ping?: number;
}

export interface SoundItem {
  id: string;
  serverId: string;
  title: string;
  emoji: string;
  category: string;
  audioUrl?: string;
  soundKey?: string;
  volume: number;
  isCustom?: boolean;
  addedBy?: string;
}

export interface ServerData {
  id: string;
  name: string;
  iconUrl: string;
  bannerUrl?: string;
  description: string;
  ownerId: string;
  theme: ServerTheme;
  accentColor: string;
  channels: Channel[];
  roles: ServerRole[];
  soundboard: SoundItem[];
  members: UserProfile[];
}

export interface LiveCaption {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface WatchPartySession {
  isActive: boolean;
  driveUrl: string;
  embedUrl: string;
  directVideoUrl?: string;
  title: string;
  hostName: string;
  hostId: string;
  isPlaying: boolean;
  currentTime: number;
  duration?: number;
}

export interface ScreenShareStream {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  appName?: string;
  category?: 'coding' | 'gaming' | 'design' | 'browser' | 'general';
  mediaStream?: MediaStream | null;
  mockType?: 'code' | 'game' | 'design';
  isLocal: boolean;
  fps?: number;
}

export type ScreenLayoutMode = 'single' | 'split' | 'grid' | 'cinema';
