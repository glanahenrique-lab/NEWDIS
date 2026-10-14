import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  UserProfile, 
  ServerData, 
  Channel, 
  ChatMessage, 
  SoundItem, 
  ServerTheme, 
  ServerRole, 
  LiveCaption,
  Friend,
  DirectMessage,
  FriendRequest,
  ServerInviteAttachment,
  AppTheme,
  WatchPartySession,
  ScreenShareStream,
  ScreenLayoutMode
} from '../types';
import { DEFAULT_CLEAN_USER, INITIAL_SERVERS, INITIAL_CHAT_MESSAGES, INITIAL_FRIENDS, PUBLIC_COMMUNITY_SERVERS } from '../data/mockData';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fbSignOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocFromServer,
  collection,
  getDocs,
  updateDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from '../firebase';
import { soundEngine } from '../utils/audio';

export function generateAccountId(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const STORAGE_KEYS = {
  USER: 'orbita_user_profile_v3',
  SERVERS: 'orbita_servers_v3',
  FRIENDS: 'orbita_friends_v3',
  DMS: 'orbita_dms_v3',
  MESSAGES: 'orbita_messages_v3',
  THEME: 'orbita_app_theme_v3',
  ACCENT: 'orbita_accent_color_v3',
  BG_COLOR: 'orbita_bg_color_v3',
  ACCOUNTS: 'orbita_registered_accounts_v4',
  FRIEND_REQUESTS: 'orbita_friend_requests_v4',
};

// Automatic one-time cleanup to satisfy: "Exclua todas as contas registradas"
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem('orbita_accounts_purged_flag_v4')) {
      localStorage.removeItem('orbita_registered_accounts_v1');
      localStorage.removeItem('orbita_registered_accounts_v2');
      localStorage.removeItem('orbita_registered_accounts_v3');
      localStorage.removeItem('orbita_registered_accounts_v4');
      localStorage.removeItem('orbita_user_profile_v1');
      localStorage.removeItem('orbita_user_profile_v2');
      localStorage.removeItem('orbita_accounts_v1');
      localStorage.setItem('orbita_accounts_purged_flag_v4', 'true');
    }
  } catch (err) {
    console.warn('Storage init cleanup warning:', err);
  }
}

interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  profile: UserProfile;
}

async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`orb_salt_${password}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  return btoa(`orb_${password}`);
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

export function cleanFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestorePayload) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestorePayload(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export function parseGoogleDriveUrl(url: string): { 
  fileId: string | null; 
  embedUrl: string; 
  directVideoUrl?: string; 
  title: string;
} {
  const cleanUrl = url.trim();
  const driveRegex = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/i;
  const driveMatch = cleanUrl.match(driveRegex);
  
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      directVideoUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      title: 'Filme Google Drive (CineOrbita)',
    };
  }
  
  const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      fileId: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&enablejsapi=1`,
      title: 'Transmissão Cinema (YouTube Sync)',
    };
  }

  return {
    fileId: null,
    embedUrl: cleanUrl,
    directVideoUrl: cleanUrl,
    title: 'Filme Personalizado (Sessão Cinema)',
  };
}

interface OrbitaContextType {
  currentUser: UserProfile;
  activeView: 'landing' | 'app';
  navigationMode: 'friends' | 'server';
  servers: ServerData[];
  currentServer: ServerData | null;
  currentChannel: Channel | null;
  messages: ChatMessage[];
  friends: Friend[];
  activeFriendId: string | null;
  activeFriend: Friend | null;
  directMessages: Record<string, DirectMessage[]>;
  currentDirectMessages: DirectMessage[];

  // Voice & Video Call State
  inVoiceCall: boolean;
  isViewingVoiceRoom: boolean;
  voiceChannel: Channel | null;
  voiceCallTitle: string;
  isMuted: boolean;
  isDeafened: boolean;
  isScreenSharing: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
  screenShareStream: MediaStream | null;
  simulatedVoiceParticipants: UserProfile[];

  // WatchParty / Cinema Session (Google Drive & Video sync without sharing screen)
  watchParty: WatchPartySession | null;
  watchPartyModalOpen: boolean;
  setWatchPartyModalOpen: (open: boolean) => void;
  startWatchParty: (driveUrl: string, title?: string) => void;
  stopWatchParty: () => void;
  toggleWatchPartyPlay: () => void;
  setWatchPartyTime: (time: number) => void;

  // Multi-Screen Sharing & Split Screen
  screenLayoutMode: ScreenLayoutMode;
  setScreenLayoutMode: (mode: ScreenLayoutMode) => void;
  activeMainScreenId: string | null;
  setActiveMainScreenId: (id: string | null) => void;
  simulatedScreenSharers: Record<string, boolean>;
  toggleSimulatedScreenShare: (participantId: string) => void;

  // Layout, Themes & Colors
  themeMode: 'dark' | 'light';
  appTheme: AppTheme;
  customAccentColor: string;
  customBgColor: string;
  isLeftSidebarCollapsed: boolean;
  isRightSidebarCollapsed: boolean;
  liveCaptions: LiveCaption[];
  isTranscriptionActive: boolean;

  // Modals
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  serverSettingsOpen: boolean;
  setServerSettingsOpen: (open: boolean) => void;
  inviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  soundboardModalOpen: boolean;
  setSoundboardModalOpen: (open: boolean) => void;

  // Server & Channel Modals
  serverModalOpen: boolean;
  serverModalTab: 'create' | 'join' | 'discover';
  openServerModal: (tab?: 'create' | 'join' | 'discover') => void;
  setServerModalOpen: (open: boolean) => void;
  setServerModalTab: (tab: 'create' | 'join' | 'discover') => void;

  // Participant Moderation & Context Menu Actions
  userVolumes: Record<string, number>;
  setUserVolume: (userId: string, volume: number) => void;
  localMutedUsers: Record<string, boolean>;
  toggleLocalMuteUser: (userId: string) => void;
  serverMutedUsers: Record<string, boolean>;
  toggleServerMuteUser: (userId: string) => void;
  serverDeafenedUsers: Record<string, boolean>;
  toggleServerDeafenUser: (userId: string) => void;
  kickVoiceParticipant: (userId: string) => void;
  kickServerMember: (serverId: string, userId: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  toggleAdminMode: () => void;
  
  // Navigation & View Actions
  setActiveView: (view: 'landing' | 'app') => void;
  setNavigationMode: (mode: 'friends' | 'server') => void;
  setCurrentServerId: (id: string | null) => void;
  setCurrentChannelId: (id: string | null) => void;
  selectFriend: (friendId: string | null) => void;
  toggleTheme: () => void;
  setAppTheme: (theme: AppTheme) => void;
  setCustomAccentColor: (color: string) => void;
  setCustomBgColor: (color: string) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleTranscription: () => void;
  
  // Chat Actions
  sendMessage: (content: string, attachmentUrl?: string) => void;
  sendDirectMessage: (content: string, attachmentUrl?: string) => void;
  
  // Friend & Friend Request Actions
  friendRequests: FriendRequest[];
  incomingFriendRequests: FriendRequest[];
  outgoingFriendRequests: FriendRequest[];
  pendingRequestsCount: number;
  registeredAccountsList: UserProfile[];
  sendFriendRequest: (tagOrIdOrEmail: string) => Promise<{ success: boolean; message: string }>;
  addFriend: (tagOrIdOrEmail: string) => Promise<{ success: boolean; message: string }>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => void;
  callFriend: (friend: Friend) => void;
  inviteFriendToCurrentCall: (friend: Friend) => void;
  sendServerInviteToFriend: (friendId: string, serverId: string) => void;
  
  // Voice & Video Actions
  connectVoice: (channel?: Channel) => void;
  startPrivateCall: (friend: Friend) => void;
  returnToVoiceRoom: () => void;
  disconnectVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleCamera: () => void;
  
  // Soundboard Actions
  playSound: (sound: SoundItem) => void;
  addSoundItem: (item: Omit<SoundItem, 'id'>) => void;
  updateSoundVolume: (id: string, volume: number) => void;
  deleteSoundItem: (id: string) => void;
  
  // Server Management Actions
  createNewServer: (name: string, iconUrl?: string, description?: string) => Promise<void>;
  joinServer: (codeOrId: string) => Promise<{ success: boolean; message: string; server?: ServerData }>;
  leaveServer: (serverId: string) => void;
  deleteServer: (serverId: string) => void;
  createNewChannel: (name: string, type: 'text' | 'voice', topic?: string, userLimit?: number) => void;
  updateServerTheme: (theme: ServerTheme, accentColor: string) => void;
  updateServerRoles: (roles: ServerRole[]) => void;

  // Toast Notification
  toastMessage: { text: string; type?: 'info' | 'success' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  
  // Auth & Profile
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAllRegisteredAccounts: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const OrbitaContext = createContext<OrbitaContextType | null>(null);

export const OrbitaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<'landing' | 'app'>('landing');
  const [navigationMode, setNavigationMode] = useState<'friends' | 'server'>('friends');

  // User & Auth: persistent
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => 
    loadStorage<UserProfile>(STORAGE_KEYS.USER, DEFAULT_CLEAN_USER)
  );

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [soundboardModalOpen, setSoundboardModalOpen] = useState(false);

  // Server Creation / Joining / Discovery Modal
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [serverModalTab, setServerModalTab] = useState<'create' | 'join' | 'discover'>('create');

  const openServerModal = useCallback((tab: 'create' | 'join' | 'discover' = 'create') => {
    setServerModalTab(tab);
    setServerModalOpen(true);
  }, []);

  // Global Toast Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  }, []);

  // Themes & Custom Colors: persistent
  const [appTheme, setAppThemeState] = useState<AppTheme>(() =>
    loadStorage<AppTheme>(STORAGE_KEYS.THEME, 'nebula')
  );
  const [customAccentColor, setCustomAccentColorState] = useState<string>(() =>
    loadStorage<string>(STORAGE_KEYS.ACCENT, '#6366f1')
  );
  const [customBgColor, setCustomBgColorState] = useState<string>(() =>
    loadStorage<string>(STORAGE_KEYS.BG_COLOR, '#0b0c10')
  );
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  // Servers: starts clean or loaded from persistent storage
  const [servers, setServers] = useState<ServerData[]>(() =>
    loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, INITIAL_SERVERS)
  );
  const [currentServerId, setCurrentServerIdState] = useState<string | null>(null);
  const [currentChannelId, setCurrentChannelIdState] = useState<string | null>(null);

  // Friends & DMs: starts clean or loaded from persistent storage
  const [friends, setFriends] = useState<Friend[]>(() =>
    loadStorage<Friend[]>(STORAGE_KEYS.FRIENDS, INITIAL_FRIENDS)
  );
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>(() =>
    loadStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.DMS, {})
  );

  // Friend Requests: persistent real account friend requests
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() =>
    loadStorage<FriendRequest[]>(STORAGE_KEYS.FRIEND_REQUESTS, [])
  );

  const incomingFriendRequests = useMemo(() => {
    return friendRequests.filter(r => 
      r.status === 'pending' && (
        r.receiverId === currentUser.id ||
        (r.receiverAccountId && currentUser.accountId && r.receiverAccountId === currentUser.accountId) ||
        (r.receiverEmail && currentUser.email && r.receiverEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
    );
  }, [friendRequests, currentUser]);

  const outgoingFriendRequests = useMemo(() => {
    return friendRequests.filter(r => r.status === 'pending' && r.senderId === currentUser.id);
  }, [friendRequests, currentUser]);

  const pendingRequestsCount = incomingFriendRequests.length;

  const [registeredAccountsList, setRegisteredAccountsList] = useState<UserProfile[]>(() => {
    const accs = loadStorage<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    return accs.map(a => a.profile);
  });

  // Listen for storage events (multi-tab / account switching in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.FRIEND_REQUESTS && e.newValue) {
        try {
          setFriendRequests(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.FRIENDS && e.newValue) {
        try {
          setFriends(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.DMS && e.newValue) {
        try {
          setDirectMessages(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.ACCOUNTS && e.newValue) {
        try {
          const accs = JSON.parse(e.newValue) as RegisteredAccount[];
          setRegisteredAccountsList(accs.map(a => a.profile));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen to Firestore friend_requests collection in real-time
  useEffect(() => {
    try {
      const q = collection(db, 'friend_requests');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const remoteRequests: FriendRequest[] = [];
        snapshot.forEach((docSnap) => {
          remoteRequests.push({ id: docSnap.id, ...docSnap.data() } as FriendRequest);
        });
        if (remoteRequests.length > 0) {
          setFriendRequests(prev => {
            const map = new Map<string, FriendRequest>();
            prev.forEach(r => map.set(r.id, r));
            remoteRequests.forEach(r => map.set(r.id, r));
            const merged = Array.from(map.values());
            saveStorage(STORAGE_KEYS.FRIEND_REQUESTS, merged);
            return merged;
          });
        }
      }, () => {});
      return () => unsubscribe();
    } catch {}
  }, []);

  // Messages: starts clean or loaded from persistent storage
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_CHAT_MESSAGES)
  );

  // Voice & Video Call State
  const [inVoiceCall, setInVoiceCall] = useState<boolean>(false);
  const [isViewingVoiceRoom, setIsViewingVoiceRoom] = useState<boolean>(false);
  const [voiceChannel, setVoiceChannel] = useState<Channel | null>(null);
  const [voiceCallTitle, setVoiceCallTitle] = useState<string>('Chamada de Voz');
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [simulatedVoiceParticipants, setSimulatedVoiceParticipants] = useState<UserProfile[]>([]);

  // WatchParty / Cinema Session (Google Drive & Video sync without sharing screen)
  const [watchParty, setWatchParty] = useState<WatchPartySession | null>(null);
  const [watchPartyModalOpen, setWatchPartyModalOpen] = useState(false);

  // Multi-Screen Sharing & Split Screen
  const [screenLayoutMode, setScreenLayoutMode] = useState<ScreenLayoutMode>('single');
  const [activeMainScreenId, setActiveMainScreenId] = useState<string | null>(null);
  const [simulatedScreenSharers, setSimulatedScreenSharers] = useState<Record<string, boolean>>({
    'voice_user_clara': true,
    'voice_user_lucas': true,
  });

  // Live Transcription & Captions
  const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState<LiveCaption[]>([]);

  // User moderation & per-user settings (volumes, local mute, server mute, server deafen, admin mode)
  const [userVolumes, setUserVolumes] = useState<Record<string, number>>({});
  const [localMutedUsers, setLocalMutedUsers] = useState<Record<string, boolean>>({});
  const [serverMutedUsers, setServerMutedUsers] = useState<Record<string, boolean>>({});
  const [serverDeafenedUsers, setServerDeafenedUsers] = useState<Record<string, boolean>>({});
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true); // Enabled by default so user can test admin options immediately

  // Ref to avoid wiping existing servers in Firestore during initial load
  const isInitialFirestoreSyncDone = useRef(false);

  // Resolution helpers
  const currentServer = servers.find(s => s.id === currentServerId) || null;
  const currentChannel = currentServer?.channels.find(c => c.id === currentChannelId) || currentServer?.channels[0] || null;
  const activeFriend = friends.find(f => f.id === activeFriendId) || null;
  const currentDirectMessages = activeFriendId ? (directMessages[activeFriendId] || []) : [];

  // Synchronize CSS Variables & Theme Classes to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'theme-nebula', 
      'theme-cyber', 
      'theme-aurora', 
      'theme-solar', 
      'theme-rose', 
      'theme-graphite', 
      'theme-light'
    );

    if (appTheme === 'light') {
      root.classList.add('theme-light');
      setThemeMode('light');
      // Clear custom color overrides for standard light mode
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-sidebar');
      root.style.removeProperty('--theme-surface');
      root.style.removeProperty('--theme-card');
      root.style.removeProperty('--theme-border');
      root.style.removeProperty('--theme-accent');
      root.style.removeProperty('--theme-accent-glow');
    } else if (appTheme === 'custom' || customAccentColor) {
      // Calculate full immersion palette for custom colors (e.g. green, orange, cyan, etc.)
      const hex = (appTheme === 'custom' ? customAccentColor : '') || currentServer?.accentColor || customAccentColor;
      if (hex && hex.startsWith('#')) {
        const clean = hex.replace('#', '');
        let r = 99, g = 102, b = 241;
        if (clean.length === 6) {
          r = parseInt(clean.substring(0, 2), 16) || 99;
          g = parseInt(clean.substring(2, 4), 16) || 102;
          b = parseInt(clean.substring(4, 6), 16) || 241;
        } else if (clean.length === 3) {
          r = parseInt(clean[0] + clean[0], 16) || 99;
          g = parseInt(clean[1] + clean[1], 16) || 102;
          b = parseInt(clean[2] + clean[2], 16) || 241;
        }

        // Full-site immersion: deep tinted backgrounds with clear readability
        const bgR = Math.max(3, Math.min(22, Math.round(r * 0.05)));
        const bgG = Math.max(4, Math.min(26, Math.round(g * 0.09)));
        const bgB = Math.max(4, Math.min(24, Math.round(b * 0.07)));

        const sbR = Math.max(2, Math.min(18, Math.round(r * 0.035)));
        const sbG = Math.max(2, Math.min(20, Math.round(g * 0.065)));
        const sbB = Math.max(2, Math.min(18, Math.round(b * 0.05)));

        const sfR = Math.max(5, Math.min(32, Math.round(r * 0.08)));
        const sfG = Math.max(7, Math.min(38, Math.round(g * 0.14)));
        const sfB = Math.max(6, Math.min(34, Math.round(b * 0.11)));

        const cdR = Math.max(8, Math.min(42, Math.round(r * 0.12)));
        const cdG = Math.max(10, Math.min(50, Math.round(g * 0.20)));
        const cdB = Math.max(9, Math.min(44, Math.round(b * 0.15)));

        root.style.setProperty('--theme-bg', `rgb(${bgR}, ${bgG}, ${bgB})`);
        root.style.setProperty('--theme-sidebar', `rgb(${sbR}, ${sbG}, ${sbB})`);
        root.style.setProperty('--theme-surface', `rgb(${sfR}, ${sfG}, ${sfB})`);
        root.style.setProperty('--theme-card', `rgb(${cdR}, ${cdG}, ${cdB})`);
        root.style.setProperty('--theme-border', `rgba(${r}, ${g}, ${b}, 0.22)`);
        root.style.setProperty('--theme-accent', hex);
        root.style.setProperty('--theme-accent-glow', `rgba(${r}, ${g}, ${b}, 0.35)`);
        root.style.setProperty('--theme-text', '#ffffff');
        root.style.setProperty('--theme-text-muted', '#cbd5e1');
        setThemeMode('dark');
      } else {
        root.classList.add(`theme-${appTheme}`);
        setThemeMode('dark');
      }
    } else {
      root.classList.add(`theme-${appTheme}`);
      setThemeMode('dark');
      root.style.removeProperty('--theme-bg');
      root.style.removeProperty('--theme-sidebar');
      root.style.removeProperty('--theme-surface');
      root.style.removeProperty('--theme-card');
      root.style.removeProperty('--theme-border');
      root.style.removeProperty('--theme-accent');
      root.style.removeProperty('--theme-accent-glow');
    }

    if (customBgColor && appTheme === 'custom') {
      root.style.setProperty('--theme-bg', customBgColor);
    }
  }, [appTheme, customAccentColor, customBgColor, currentServer]);

  // Persist servers to local storage whenever they change
  useEffect(() => {
    saveStorage(STORAGE_KEYS.SERVERS, servers);
    // If logged in and initial Firestore load is finished, sync to Firestore
    if (isInitialFirestoreSyncDone.current && auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { servers: cleanFirestorePayload(servers) }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
      });
    }
  }, [servers]);

  // Persist friends to storage
  useEffect(() => {
    saveStorage(STORAGE_KEYS.FRIENDS, friends);
  }, [friends]);

  // Persist DMs to storage
  useEffect(() => {
    saveStorage(STORAGE_KEYS.DMS, directMessages);
  }, [directMessages]);

  // Persist chat messages to storage
  useEffect(() => {
    saveStorage(STORAGE_KEYS.MESSAGES, messages);
  }, [messages]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          onSnapshot(userRef, async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const userProfile: UserProfile = {
                id: fbUser.uid,
                name: data.name || fbUser.displayName || 'Usuário Orb',
                tag: data.tag || `${(data.name || fbUser.displayName || 'usuario').toLowerCase().replace(/\s+/g, '')}#${fbUser.uid.substring(0, 4)}`,
                email: fbUser.email || '',
                avatarUrl: data.avatarUrl || fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
                bio: data.bio !== undefined ? data.bio : 'Membro do Orb.co.',
                status: data.status || 'online',
                customStatus: data.customStatus || '',
                ping: 18,
                badges: data.badges || ['👑 Dono', '⭐ Orb.co'],
                role: data.role || 'owner',
                connectedAccounts: data.connectedAccounts || {},
              };

              setCurrentUser(userProfile);
              saveStorage(STORAGE_KEYS.USER, userProfile);

              // Restore saved servers from Firestore if available
              if (Array.isArray(data.servers) && data.servers.length > 0) {
                setServers(data.servers);
                saveStorage(STORAGE_KEYS.SERVERS, data.servers);
              } else {
                // If user document doesn't have servers yet in Firestore, check if they created any locally
                const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, []);
                if (localServers.length > 0) {
                  setServers(localServers);
                  setDoc(userRef, { servers: cleanFirestorePayload(localServers) }, { merge: true }).catch(() => {});
                }
              }

              // Restore theme settings if present
              if (data.theme) {
                setAppThemeState(data.theme);
                saveStorage(STORAGE_KEYS.THEME, data.theme);
              }
              if (data.accentColor) {
                setCustomAccentColorState(data.accentColor);
                saveStorage(STORAGE_KEYS.ACCENT, data.accentColor);
              }

              isInitialFirestoreSyncDone.current = true;
            } else {
              // Doc doesn't exist yet: initialize user doc and save any existing servers to Firestore!
              const initialProfile: UserProfile = {
                id: fbUser.uid,
                name: fbUser.displayName || 'Usuário Orb',
                tag: `${(fbUser.displayName || 'usuario').toLowerCase().replace(/\s+/g, '')}#${fbUser.uid.substring(0, 4)}`,
                email: fbUser.email || '',
                bio: 'Membro do Orb.co.',
                avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
                bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
                status: 'online',
                ping: 18,
                badges: ['👑 Dono', '⭐ Orb.co'],
                role: 'owner',
              };
              const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, []);
              await setDoc(userRef, {
                ...cleanFirestorePayload(initialProfile),
                servers: cleanFirestorePayload(localServers)
              }, { merge: true }).catch(err => {
                handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
              });
              setCurrentUser(initialProfile);
              saveStorage(STORAGE_KEYS.USER, initialProfile);
              isInitialFirestoreSyncDone.current = true;
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
            isInitialFirestoreSyncDone.current = true;
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
          isInitialFirestoreSyncDone.current = true;
        }
      } else {
        isInitialFirestoreSyncDone.current = true;
      }
    });

    return () => unsubscribe();
  }, []);

  // Set Theme
  const setAppTheme = useCallback((theme: AppTheme) => {
    setAppThemeState(theme);
    saveStorage(STORAGE_KEYS.THEME, theme);
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), { theme }, { merge: true }).catch(() => {});
    }
  }, []);

  // Set Custom Accent Color
  const setCustomAccentColor = useCallback((color: string) => {
    setCustomAccentColorState(color);
    saveStorage(STORAGE_KEYS.ACCENT, color);
    if (auth.currentUser) {
      setDoc(doc(db, 'users', auth.currentUser.uid), { accentColor: color }, { merge: true }).catch(() => {});
    }
  }, []);

  // Set Custom Background Color
  const setCustomBgColor = useCallback((color: string) => {
    setCustomBgColorState(color);
    saveStorage(STORAGE_KEYS.BG_COLOR, color);
  }, []);

  // Theme Toggle: dark <-> light
  const toggleTheme = useCallback(() => {
    setAppThemeState(prev => {
      const next: AppTheme = prev === 'light' ? 'nebula' : 'light';
      saveStorage(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  // Sidebar Toggles
  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarCollapsed(prev => !prev);
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setIsRightSidebarCollapsed(prev => !prev);
  }, []);

  // Transcription Toggle
  const toggleTranscription = useCallback(() => {
    setIsTranscriptionActive(prev => !prev);
  }, []);

  // Navigation handlers
  const setCurrentServerId = useCallback((id: string | null) => {
    setCurrentServerIdState(id);
    if (id) {
      setNavigationMode('server');
      const targetServer = servers.find(s => s.id === id);
      if (targetServer && targetServer.channels.length > 0) {
        setCurrentChannelIdState(targetServer.channels[0].id);
      }
    } else {
      setNavigationMode('friends');
    }
  }, [servers]);

  // When clicking on a channel: switch current channel and if in voice call, show text chat!
  const setCurrentChannelId = useCallback((id: string | null) => {
    setCurrentChannelIdState(id);
    // If in a voice call and choosing a text channel, switch away from voice room to text chat!
    if (inVoiceCall && id) {
      setIsViewingVoiceRoom(false);
    }
  }, [inVoiceCall]);

  const selectFriend = useCallback((friendId: string | null) => {
    setActiveFriendId(friendId);
    setNavigationMode('friends');
    if (inVoiceCall) {
      setIsViewingVoiceRoom(false);
    }
  }, [inVoiceCall]);

  // Send Friend Request to a REAL registered account (Zero bots!)
  const sendFriendRequest = useCallback(async (query: string): Promise<{ success: boolean; message: string }> => {
    const clean = query.trim();
    if (!clean) return { success: false, message: 'Digite o ID (#), Tag, Nick ou E-mail da conta.' };

    const normalized = clean.toLowerCase();
    const rawId = clean.startsWith('#') ? clean.substring(1) : clean;

    // 1. Prevent adding yourself
    const myId = currentUser.accountId || currentUser.tag?.split('#')[1] || '';
    const myTag = (currentUser.tag || '').toLowerCase();
    const myEmail = (currentUser.email || '').toLowerCase();
    const myName = currentUser.name.toLowerCase();

    if (
      (rawId && rawId === myId) ||
      clean === currentUser.id ||
      normalized === myTag ||
      (myEmail && normalized === myEmail) ||
      normalized === myName
    ) {
      return { success: false, message: 'Você não pode enviar solicitação de amizade para si mesmo!' };
    }

    // 2. Check if already in friends list
    const existingFriend = friends.find(f => 
      f.id === clean ||
      (f.accountId && f.accountId === rawId) ||
      f.tag.toLowerCase() === normalized ||
      (f.email && f.email.toLowerCase() === normalized) ||
      f.name.toLowerCase() === normalized
    );

    if (existingFriend) {
      return { success: false, message: `${existingFriend.name} já é seu amigo(a)!` };
    }

    // 3. Search in registered accounts (STORAGE_KEYS.ACCOUNTS and Firestore users collection)
    const registeredAccounts = loadStorage<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    let targetAccount = registeredAccounts.find(a => 
      (a.profile.accountId && a.profile.accountId === rawId) ||
      (a.profile.tag && a.profile.tag.toLowerCase() === normalized) ||
      a.email.toLowerCase() === normalized ||
      a.name.toLowerCase() === normalized ||
      a.id === clean
    );

    // If not in local accounts, try Firestore users collection
    if (!targetAccount) {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        for (const userDoc of usersSnapshot.docs) {
          const udata = userDoc.data();
          const uAccountId = udata.accountId || '';
          const uTag = (udata.tag || '').toLowerCase();
          const uEmail = (udata.email || '').toLowerCase();
          const uName = (udata.name || '').toLowerCase();
          if (
            (rawId && uAccountId === rawId) ||
            userDoc.id === clean ||
            uTag === normalized ||
            (uEmail && uEmail === normalized) ||
            uName === normalized
          ) {
            const foundProfile: UserProfile = {
              id: userDoc.id,
              accountId: uAccountId,
              name: udata.name || 'Usuário Orb',
              tag: udata.tag || `${udata.name || 'usuario'}#${uAccountId}`,
              email: udata.email || '',
              avatarUrl: udata.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
              bannerUrl: udata.bannerUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
              status: udata.status || 'online',
              customStatus: udata.customStatus || 'Disponível no Orb.co 🪐',
              bio: udata.bio || 'Membro do Orb.co',
              ping: udata.ping || 18,
            };

            targetAccount = {
              id: userDoc.id,
              email: udata.email || '',
              passwordHash: '',
              name: udata.name || 'Usuário Orb',
              createdAt: new Date().toISOString(),
              profile: foundProfile
            };
            // Cache found account locally
            const updatedAccs: RegisteredAccount[] = [...registeredAccounts, targetAccount];
            saveStorage(STORAGE_KEYS.ACCOUNTS, updatedAccs);
            setRegisteredAccountsList(updatedAccs.map(acc => acc.profile));
            break;
          }
        }
      } catch (err) {
        console.warn('Firestore user search note:', err);
      }
    }

    // ZERO BOTS: If no real registered account exists, fail with clear message!
    if (!targetAccount) {
      return { 
        success: false, 
        message: 'Nenhuma conta encontrada com este ID, Tag ou E-mail. Só é possível adicionar pessoas que tenham uma conta registrada no Orb.co.' 
      };
    }

    const targetProf = targetAccount.profile;
    const targetAccountId = targetProf.accountId || generateAccountId();
    const targetTag = targetProf.tag || `${targetProf.name}#${targetAccountId}`;

    // 4. Check if request already pending
    const alreadySent = friendRequests.find(r => 
      r.status === 'pending' && 
      r.senderId === currentUser.id && 
      (r.receiverId === targetProf.id || r.receiverAccountId === targetAccountId)
    );
    if (alreadySent) {
      return { success: false, message: `Você já enviou uma solicitação para ${targetProf.name}. Aguarde ele(a) confirmar!` };
    }

    const alreadyReceived = friendRequests.find(r => 
      r.status === 'pending' && 
      (r.senderId === targetProf.id || r.senderAccountId === targetAccountId) &&
      (r.receiverId === currentUser.id || r.receiverAccountId === currentUser.accountId)
    );
    if (alreadyReceived) {
      return { success: false, message: `${targetProf.name} já te enviou uma solicitação! Vá na aba Pendentes para aceitar.` };
    }

    // 5. Create pending FriendRequest
    const newRequest: FriendRequest = {
      id: `fr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderTag: currentUser.tag || `${currentUser.name}#${currentUser.accountId || '1001'}`,
      senderAccountId: currentUser.accountId || '1001',
      senderEmail: currentUser.email || '',
      senderAvatar: currentUser.avatarUrl,
      receiverId: targetProf.id,
      receiverName: targetProf.name,
      receiverTag: targetTag,
      receiverAccountId: targetAccountId,
      receiverEmail: targetAccount.email || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setFriendRequests(prev => {
      const updated = [newRequest, ...prev.filter(r => r.id !== newRequest.id)];
      saveStorage(STORAGE_KEYS.FRIEND_REQUESTS, updated);
      return updated;
    });

    // Sync to Firestore
    setDoc(doc(db, 'friend_requests', newRequest.id), cleanFirestorePayload(newRequest)).catch(() => {});

    soundEngine.playBuiltinSound('friend_add', 0.6);
    showToast(`Solicitação de amizade enviada para ${targetProf.name}! Aguardando confirmação.`, 'success');
    return { success: true, message: `Solicitação de amizade enviada para ${targetProf.name} (ID: #${targetAccountId})! Aguardando confirmação.` };
  }, [currentUser, friends, friendRequests, showToast]);

  // Alias addFriend to sendFriendRequest
  const addFriend = sendFriendRequest;

  // Accept / Confirm Friend Request
  const acceptFriendRequest = useCallback(async (requestId: string) => {
    const req = friendRequests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Update request status to accepted
    const updatedRequests = friendRequests.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r);
    setFriendRequests(updatedRequests);
    saveStorage(STORAGE_KEYS.FRIEND_REQUESTS, updatedRequests);
    setDoc(doc(db, 'friend_requests', requestId), { status: 'accepted' }, { merge: true }).catch(() => {});

    // 2. Add sender as friend for the receiver (current user)
    const newFriendForMe: Friend = {
      id: req.senderId,
      accountId: req.senderAccountId,
      name: req.senderName,
      tag: req.senderTag,
      email: req.senderEmail,
      avatarUrl: req.senderAvatar,
      status: 'online',
      customStatus: 'Amigo confirmado no Orb.co 🪐',
      bio: `Membro do Orb.co (${req.senderTag})`,
      ping: 18,
      isConfirmed: true,
    };

    setFriends(prev => {
      const updated = [newFriendForMe, ...prev.filter(f => f.id !== newFriendForMe.id)];
      saveStorage(STORAGE_KEYS.FRIENDS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { friends: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });

    // 3. Reciprocal: Add current user as friend for the sender in Firestore if possible
    try {
      const senderRef = doc(db, 'users', req.senderId);
      const senderSnap = await getDocFromServer(senderRef).catch(() => null);
      if (senderSnap && senderSnap.exists()) {
        const senderData = senderSnap.data();
        const existingFriends = senderData.friends || [];
        const meAsFriend: Friend = {
          id: currentUser.id,
          accountId: currentUser.accountId || '1001',
          name: currentUser.name,
          tag: currentUser.tag || `${currentUser.name}#${currentUser.accountId || '1001'}`,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          status: 'online',
          customStatus: 'Amigo confirmado no Orb.co 🪐',
          bio: `Membro do Orb.co (${currentUser.tag})`,
          ping: 18,
          isConfirmed: true,
        };
        const updatedSenderFriends = [meAsFriend, ...existingFriends.filter((f: Friend) => f.id !== meAsFriend.id)];
        await setDoc(senderRef, { friends: cleanFirestorePayload(updatedSenderFriends) }, { merge: true }).catch(() => {});
      }
    } catch {}

    soundEngine.playBuiltinSound('call_connect', 0.7);
    showToast(`Solicitação de @${req.senderName} aceita! Agora vocês podem conversar e enviar convites de servidor.`, 'success');
  }, [friendRequests, currentUser, showToast]);

  // Decline / Recusar Friend Request
  const declineFriendRequest = useCallback(async (requestId: string) => {
    const updatedRequests = friendRequests.filter(r => r.id !== requestId);
    setFriendRequests(updatedRequests);
    saveStorage(STORAGE_KEYS.FRIEND_REQUESTS, updatedRequests);
    deleteDoc(doc(db, 'friend_requests', requestId)).catch(() => {});
    showToast('Solicitação de amizade recusada.', 'info');
  }, [friendRequests, showToast]);

  // Cancel Outgoing Friend Request
  const cancelFriendRequest = useCallback(async (requestId: string) => {
    const updatedRequests = friendRequests.filter(r => r.id !== requestId);
    setFriendRequests(updatedRequests);
    saveStorage(STORAGE_KEYS.FRIEND_REQUESTS, updatedRequests);
    deleteDoc(doc(db, 'friend_requests', requestId)).catch(() => {});
    showToast('Solicitação de amizade cancelada.', 'info');
  }, [friendRequests, showToast]);

  // Send Server Invite to Friend in DM
  const sendServerInviteToFriend = useCallback((friendId: string, serverId: string) => {
    const targetServer = servers.find(s => s.id === serverId);
    if (!targetServer) {
      showToast('Servidor não encontrado.', 'error');
      return;
    }

    const targetFriend = friends.find(f => f.id === friendId);
    if (!targetFriend) {
      showToast('Amigo não encontrado.', 'error');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const inviteDM: DirectMessage = {
      id: `dm_invite_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      friendId: friendId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: `Convite para participar do servidor **${targetServer.name}**!`,
      serverInvite: {
        serverId: targetServer.id,
        serverName: targetServer.name,
        serverIcon: targetServer.iconUrl || '🪐',
        serverDescription: targetServer.description || 'Entre no servidor e participe dos canais de texto e voz!',
      },
      timestamp: timeStr,
    };

    setDirectMessages(prev => {
      const updated = {
        ...prev,
        [friendId]: [...(prev[friendId] || []), inviteDM]
      };
      saveStorage(STORAGE_KEYS.DMS, updated);
      return updated;
    });

    soundEngine.playBuiltinSound('friend_add', 0.6);
    showToast(`Convite do servidor "${targetServer.name}" enviado para @${targetFriend.name}!`, 'success');
  }, [servers, friends, currentUser, showToast]);

  const removeFriend = useCallback((friendId: string) => {
    setFriends(prev => {
      const updated = prev.filter(f => f.id !== friendId);
      saveStorage(STORAGE_KEYS.FRIENDS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { friends: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });
    if (activeFriendId === friendId) {
      setActiveFriendId(null);
    }
  }, [activeFriendId]);

  // Call Friend Directly (Single button call without link)
  const callFriend = useCallback((friend: Friend) => {
    soundEngine.playBuiltinSound('call_ring', 0.7);

    if (inVoiceCall) {
      // Already in call: pull friend into current call
      setSimulatedVoiceParticipants(prev => {
        if (prev.some(p => p.id === friend.id)) return prev;
        return [
          ...prev,
          {
            id: friend.id,
            name: friend.name,
            email: `${friend.name.toLowerCase()}@orb.co`,
            avatarUrl: friend.avatarUrl,
            bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
            bio: friend.bio || '',
            status: 'online',
            ping: friend.ping || 20,
            isSharingScreen: false,
            role: 'member',
          }
        ];
      });
      setTimeout(() => {
        soundEngine.playBuiltinSound('call_connect', 0.7);
      }, 700);
      showToast(`Chamando ${friend.name}... Entrou na chamada!`, 'success');
    } else {
      // Start 1-on-1 private voice call
      setInVoiceCall(true);
      setIsViewingVoiceRoom(true);
      setVoiceChannel(null);
      setVoiceCallTitle(`Chamada com ${friend.name}`);
      setSimulatedVoiceParticipants([{
        id: friend.id,
        name: friend.name,
        email: `${friend.name.toLowerCase()}@orb.co`,
        avatarUrl: friend.avatarUrl,
        bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
        bio: friend.bio || '',
        status: 'online',
        ping: friend.ping || 20,
        isSharingScreen: true,
        role: 'member',
      }]);
      setActiveMainScreenId(friend.id);

      setTimeout(() => {
        soundEngine.playBuiltinSound('call_connect', 0.7);
      }, 700);

      soundEngine.startVoiceMonitoring((speaking) => {
        setIsSpeaking(speaking && !isMuted);
      });

      showToast(`Chamando ${friend.name}... Conectado!`, 'success');
    }
  }, [inVoiceCall, isMuted, showToast]);

  // Invite Friend into Current Voice Room
  const inviteFriendToCurrentCall = useCallback((friend: Friend) => {
    soundEngine.playBuiltinSound('call_ring', 0.6);
    setTimeout(() => {
      setSimulatedVoiceParticipants(prev => {
        if (prev.some(p => p.id === friend.id)) return prev;
        return [
          ...prev,
          {
            id: friend.id,
            name: friend.name,
            email: `${friend.name.toLowerCase()}@orb.co`,
            avatarUrl: friend.avatarUrl,
            bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
            bio: friend.bio || '',
            status: 'online',
            ping: friend.ping || 20,
            isSharingScreen: false,
            role: 'member',
          }
        ];
      });
      soundEngine.playBuiltinSound('call_connect', 0.7);
      showToast(`${friend.name} entrou na chamada!`, 'success');
    }, 700);
  }, [showToast]);

  // WatchParty Actions
  const startWatchParty = useCallback((url: string, title?: string) => {
    const parsed = parseGoogleDriveUrl(url);
    const session: WatchPartySession = {
      isActive: true,
      driveUrl: url,
      embedUrl: parsed.embedUrl,
      directVideoUrl: parsed.directVideoUrl,
      title: title || parsed.title,
      hostName: currentUser.name,
      hostId: currentUser.id,
      isPlaying: true,
      currentTime: 0,
      duration: 180,
    };
    setWatchParty(session);
    setScreenLayoutMode('cinema');
  }, [currentUser]);

  const stopWatchParty = useCallback(() => {
    setWatchParty(null);
    setScreenLayoutMode('single');
  }, []);

  const toggleWatchPartyPlay = useCallback(() => {
    setWatchParty(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  }, []);

  const setWatchPartyTime = useCallback((time: number) => {
    setWatchParty(prev => prev ? { ...prev, currentTime: time } : null);
  }, []);

  const toggleSimulatedScreenShare = useCallback((participantId: string) => {
    setSimulatedScreenSharers(prev => ({
      ...prev,
      [participantId]: !prev[participantId],
    }));
  }, []);

  // Connect to Server Voice Channel
  const connectVoice = useCallback((channel?: Channel) => {
    const targetChannel = channel || currentServer?.channels.find(c => c.type === 'voice') || null;
    setInVoiceCall(true);
    setIsViewingVoiceRoom(true);
    setVoiceChannel(targetChannel);
    setVoiceCallTitle(targetChannel ? `Voz: ${targetChannel.name}` : 'Voz Geral');

    // Default companions in voice channel so user can test orbits, screen shares, and split screen immediately
    const defaultParticipants: UserProfile[] = [
      {
        id: 'voice_user_clara',
        name: 'Clara Mendes',
        email: 'clara@orb.co',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&h=300&fit=crop',
        bio: 'Designer UI/UX 🎨 • Amante do espaço',
        status: 'online',
        ping: 22,
        isSpeaking: false,
        isSharingScreen: true,
        role: 'member',
      },
      {
        id: 'voice_user_lucas',
        name: 'Lucas Rocha',
        email: 'lucas@orb.co',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=300&fit=crop',
        bio: 'Desenvolvedor Fullstack 💻 • Ouvindo Synthwave',
        status: 'online',
        ping: 18,
        isSpeaking: false,
        isSharingScreen: true,
        role: 'member',
      },
      {
        id: 'voice_user_arthur',
        name: 'Arthur Silva',
        email: 'arthur@orb.co',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=300&fit=crop',
        bio: 'Gamer & Streamer 🎮',
        status: 'online',
        ping: 26,
        isSpeaking: false,
        isSharingScreen: false,
        role: 'member',
      }
    ];
    setSimulatedVoiceParticipants(defaultParticipants);
    setActiveMainScreenId('voice_user_clara');

    soundEngine.startVoiceMonitoring((speaking) => {
      setIsSpeaking(speaking && !isMuted);
    });
  }, [currentServer, isMuted]);

  // Start Private 1-on-1 Call with Friend
  const startPrivateCall = useCallback((friend: Friend) => {
    setInVoiceCall(true);
    setIsViewingVoiceRoom(true);
    setVoiceChannel(null);
    setVoiceCallTitle(`Chamada com ${friend.name}`);
    setSimulatedVoiceParticipants([{
      id: friend.id,
      name: friend.name,
      email: `${friend.name.toLowerCase()}@orb.co`,
      avatarUrl: friend.avatarUrl,
      bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
      bio: friend.bio || '',
      status: 'online',
      ping: friend.ping || 20,
      isSharingScreen: true,
      role: 'member',
    }]);
    setActiveMainScreenId(friend.id);

    soundEngine.startVoiceMonitoring((speaking) => {
      setIsSpeaking(speaking && !isMuted);
    });
  }, [isMuted]);

  // Return to Voice Room View (from wandering planet widget or sidebar button)
  const returnToVoiceRoom = useCallback(() => {
    if (inVoiceCall) {
      setIsViewingVoiceRoom(true);
    }
  }, [inVoiceCall]);

  // Disconnect Voice Call
  const disconnectVoice = useCallback(() => {
    setInVoiceCall(false);
    setIsViewingVoiceRoom(false);
    setVoiceChannel(null);
    setIsSpeaking(false);
    setWatchParty(null);
    setScreenLayoutMode('single');
    soundEngine.stopVoiceMonitoring();
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(t => t.stop());
      setScreenShareStream(null);
    }
    setIsScreenSharing(false);
    setIsCameraOn(false);
  }, [screenShareStream]);

  // Voice Toggles
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) setIsSpeaking(false);
      return next;
    });
  }, []);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOn(prev => !prev);
  }, []);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenShareStream) {
        screenShareStream.getTracks().forEach(t => t.stop());
        setScreenShareStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          setScreenShareStream(stream);
          setIsScreenSharing(true);
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenShareStream(null);
          };
        } else {
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn('Screen share cancelled:', err);
        setIsScreenSharing(true);
      }
    }
  }, [isScreenSharing, screenShareStream]);

  // Moderation & Per-User Actions
  const setUserVolume = useCallback((userId: string, volume: number) => {
    setUserVolumes(prev => ({ ...prev, [userId]: volume }));
  }, []);

  const toggleLocalMuteUser = useCallback((userId: string) => {
    setLocalMutedUsers(prev => {
      const next = !prev[userId];
      soundEngine.playBuiltinSound(next ? 'mute_on' : 'mute_off', 0.4);
      return { ...prev, [userId]: next };
    });
  }, []);

  const toggleServerMuteUser = useCallback((userId: string) => {
    setServerMutedUsers(prev => {
      const next = !prev[userId];
      soundEngine.playBuiltinSound(next ? 'mute_on' : 'mute_off', 0.5);
      return { ...prev, [userId]: next };
    });
  }, []);

  const toggleServerDeafenUser = useCallback((userId: string) => {
    setServerDeafenedUsers(prev => {
      const next = !prev[userId];
      soundEngine.playBuiltinSound(next ? 'mute_on' : 'mute_off', 0.5);
      return { ...prev, [userId]: next };
    });
  }, []);

  const kickVoiceParticipant = useCallback((userId: string) => {
    soundEngine.playBuiltinSound('kick', 0.7);
    setSimulatedVoiceParticipants(prev => prev.filter(p => p.id !== userId));
    setSimulatedScreenSharers(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    setActiveMainScreenId(prev => prev === userId ? null : prev);
  }, []);

  const kickServerMember = useCallback((serverId: string, userId: string) => {
    kickVoiceParticipant(userId);
    setServers(prev => prev.map(s => {
      if (s.id !== serverId) return s;
      return {
        ...s,
        members: (s.members || []).filter(m => m.id !== userId)
      };
    }));
  }, [kickVoiceParticipant]);

  const toggleAdminMode = useCallback(() => {
    setIsAdminMode(prev => !prev);
  }, []);

  // Send message in server channel
  const sendMessage = useCallback((content: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) return;
    if (!currentChannelId || !currentServerId) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId: currentChannelId,
      serverId: currentServerId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      content,
      attachmentUrl,
      timestamp: timeStr,
    };

    setMessages(prev => {
      const updated = [...prev, newMsg];
      saveStorage(STORAGE_KEYS.MESSAGES, updated);
      return updated;
    });

    if (inVoiceCall && isTranscriptionActive) {
      setLiveCaptions(prev => [
        ...prev,
        {
          id: `cap_${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          text: content,
          timestamp: timeStr,
        }
      ]);
    }
  }, [currentChannelId, currentServerId, currentUser, inVoiceCall, isTranscriptionActive]);

  // Send Direct Message to active friend
  const sendDirectMessage = useCallback((content: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) return;
    if (!activeFriendId) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newDM: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      friendId: activeFriendId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content,
      attachmentUrl,
      timestamp: timeStr,
    };

    setDirectMessages(prev => {
      const updated = {
        ...prev,
        [activeFriendId]: [...(prev[activeFriendId] || []), newDM]
      };
      saveStorage(STORAGE_KEYS.DMS, updated);
      return updated;
    });

    soundEngine.playBuiltinSound('message_send', 0.4);
  }, [activeFriendId, currentUser]);

  // Soundboard
  const playSound = useCallback((sound: SoundItem) => {
    if (sound.isCustom && sound.audioUrl) {
      soundEngine.playCustomAudio(sound.audioUrl, sound.volume);
    } else if (sound.soundKey) {
      soundEngine.playBuiltinSound(sound.soundKey, sound.volume);
    }
    soundEngine.triggerConfetti();
  }, []);

  const addSoundItem = useCallback((item: Omit<SoundItem, 'id'>) => {
    if (!currentServerId) return;
    const newItem: SoundItem = {
      ...item,
      id: `snd_${Date.now()}`,
    };
    setServers(prev => {
      const updated = prev.map(srv => {
        if (srv.id === currentServerId) {
          return { ...srv, soundboard: [...srv.soundboard, newItem] };
        }
        return srv;
      });
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      return updated;
    });
  }, [currentServerId]);

  const updateSoundVolume = useCallback((id: string, volume: number) => {
    if (!currentServerId) return;
    setServers(prev => {
      const updated = prev.map(srv => {
        if (srv.id === currentServerId) {
          return { ...srv, soundboard: srv.soundboard.map(s => s.id === id ? { ...s, volume } : s) };
        }
        return srv;
      });
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      return updated;
    });
  }, [currentServerId]);

  const deleteSoundItem = useCallback((id: string) => {
    if (!currentServerId) return;
    setServers(prev => {
      const updated = prev.map(srv => {
        if (srv.id === currentServerId) {
          return { ...srv, soundboard: srv.soundboard.filter(s => s.id !== id) };
        }
        return srv;
      });
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      return updated;
    });
  }, [currentServerId]);

  // Create New Server - fully persisted to Firestore!
  const createNewServer = useCallback(async (name: string, iconUrl?: string, description?: string) => {
    const newId = `srv_${Date.now()}`;
    const effectiveOwnerId = auth.currentUser?.uid || currentUser.id;
    const newServer: ServerData = {
      id: newId,
      name: name.trim(),
      iconUrl: iconUrl || '🪐',
      description: description || 'Servidor criado no Orb.co.',
      ownerId: effectiveOwnerId,
      theme: 'nebula',
      accentColor: '#818cf8',
      roles: [
        {
          id: 'role_owner',
          name: 'Dono',
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
          name: 'Membro',
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
        { id: `chan_${newId}_geral`, serverId: newId, name: 'geral', type: 'text', topic: 'Canal de texto inicial' },
        { id: `chan_${newId}_voz`, serverId: newId, name: 'Voz Geral', type: 'voice' },
      ],
      soundboard: [
        { id: `snd_airhorn_${newId}`, serverId: newId, title: 'Buzina MLG', emoji: '📢', category: 'Efeitos', soundKey: 'airhorn', volume: 0.8 },
        { id: `snd_applause_${newId}`, serverId: newId, title: 'Aplausos', emoji: '👏', category: 'Reação', soundKey: 'gg_applause', volume: 0.8 },
      ],
      members: [currentUser],
    };

    setServers(prev => {
      const updated = [...prev, newServer];
      saveStorage(STORAGE_KEYS.SERVERS, updated);

      // Persist to user's Firestore document
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
        });

        // Also write to Firestore /servers collection
        const serverDocRef = doc(db, 'servers', newId);
        setDoc(serverDocRef, cleanFirestorePayload({
          id: newId,
          name: newServer.name,
          iconUrl: newServer.iconUrl,
          ownerId: auth.currentUser.uid,
          themeColor: newServer.accentColor,
          description: newServer.description,
          createdAt: new Date().toISOString()
        }), { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `servers/${newId}`);
        });
      }

      return updated;
    });

    setCurrentServerIdState(newId);
    setCurrentChannelIdState(`chan_${newId}_geral`);
    setNavigationMode('server');
    soundEngine.playBuiltinSound('server_join', 0.6);
  }, [currentUser]);

  // Join Server by Invite Code, Link, or ID
  const joinServer = useCallback(async (codeOrId: string): Promise<{ success: boolean; message: string; server?: ServerData }> => {
    let clean = (codeOrId || '').trim();
    if (!clean) return { success: false, message: 'Digite um código ou link de convite válido.' };

    // Parse full URL or query params or hash
    if (clean.includes('convite=')) {
      clean = clean.split('convite=')[1].split('&')[0];
    } else if (clean.includes('invite=')) {
      clean = clean.split('invite=')[1].split('&')[0];
    } else if (clean.includes('/')) {
      clean = clean.split('/').pop() || clean;
    }
    clean = decodeURIComponent(clean).replace(/^#/, '').trim();

    // 1. Check if user is already a member of this server
    const alreadyJoined = servers.find(s => s.id === clean || s.name.toLowerCase() === clean.toLowerCase());
    if (alreadyJoined) {
      setCurrentServerIdState(alreadyJoined.id);
      if (alreadyJoined.channels.length > 0) {
        setCurrentChannelIdState(alreadyJoined.channels[0].id);
      }
      setNavigationMode('server');
      setActiveView('app');
      soundEngine.playBuiltinSound('server_join', 0.6);
      return { success: true, message: `Você já está no servidor ${alreadyJoined.name}!`, server: alreadyJoined };
    }

    // 2. Check public community servers
    const communityFound = PUBLIC_COMMUNITY_SERVERS.find(
      s => s.id === clean || s.id.replace('srv_', '') === clean.replace('srv_', '') || s.name.toLowerCase().includes(clean.toLowerCase())
    );

    let targetServer: ServerData | null = null;
    if (communityFound) {
      targetServer = {
        ...communityFound,
        members: [...communityFound.members, currentUser]
      };
    } else {
      // 3. Try fetching from Firestore /servers collection
      try {
        const sDoc = await getDocFromServer(doc(db, 'servers', clean));
        if (sDoc.exists()) {
          const sData = sDoc.data();
          targetServer = {
            id: clean,
            name: sData.name || 'Servidor Orb',
            iconUrl: sData.iconUrl || '🪐',
            description: sData.description || 'Servidor acessado via link no Orb.co',
            ownerId: sData.ownerId || 'admin',
            theme: sData.theme || 'nebula',
            accentColor: sData.themeColor || '#818cf8',
            roles: [
              {
                id: 'role_member',
                name: 'Membro',
                color: '#10b981',
                permissions: { sendMessages: true, speakInVoice: true, shareScreen: true, useSoundboard: true, manageChannels: false, muteMembers: false, administrator: false }
              }
            ],
            channels: [
              { id: `chan_${clean}_geral`, serverId: clean, name: 'geral', type: 'text', topic: 'Canal de texto' },
              { id: `chan_${clean}_voz`, serverId: clean, name: 'Voz Geral', type: 'voice' },
            ],
            soundboard: [],
            members: [currentUser],
          };
        }
      } catch {
        // Continue to fallback
      }
    }

    // 4. Fallback: virtual server instance for custom link code
    if (!targetServer) {
      const formattedName = clean.startsWith('srv_') ? `Servidor #${clean.substring(4, 9)}` : clean.charAt(0).toUpperCase() + clean.slice(1);
      targetServer = {
        id: clean.startsWith('srv_') ? clean : `srv_${clean}`,
        name: formattedName,
        iconUrl: '🪐',
        description: 'Servidor acessado via link de convite.',
        ownerId: 'community',
        theme: 'nebula',
        accentColor: '#818cf8',
        roles: [],
        channels: [
          { id: `chan_${clean}_geral`, serverId: clean, name: 'geral', type: 'text', topic: 'Canal de texto' },
          { id: `chan_${clean}_voz`, serverId: clean, name: 'Voz Geral', type: 'voice' },
        ],
        soundboard: [],
        members: [currentUser],
      };
    }

    // Add server to user's servers list
    setServers(prev => {
      const updated = [...prev, targetServer!];
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });

    setCurrentServerIdState(targetServer.id);
    if (targetServer.channels.length > 0) {
      setCurrentChannelIdState(targetServer.channels[0].id);
    }
    setNavigationMode('server');
    setActiveView('app');
    soundEngine.playBuiltinSound('server_join', 0.6);
    return { success: true, message: `Você entrou no servidor ${targetServer.name}!`, server: targetServer };
  }, [servers, currentUser]);

  // Listen for and automatically process URL invite links (#convite=..., ?convite=..., ?invite=...)
  useEffect(() => {
    const handleUrlInvite = async () => {
      try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        let inviteCode: string | null = null;
        let callInvite: string | null = null;

        if (hash.includes('convite=')) {
          inviteCode = hash.split('convite=')[1]?.split('&')[0];
        } else if (hash.includes('invite=')) {
          inviteCode = hash.split('invite=')[1]?.split('&')[0];
        } else if (hash.includes('chamada=')) {
          callInvite = hash.split('chamada=')[1]?.split('&')[0];
        } else if (hash.includes('call=')) {
          callInvite = hash.split('call=')[1]?.split('&')[0];
        }

        const params = new URLSearchParams(search);
        if (!inviteCode) {
          inviteCode = params.get('convite') || params.get('invite') || params.get('server');
        }
        if (!callInvite) {
          callInvite = params.get('chamada') || params.get('call') || params.get('room');
        }

        if (inviteCode) {
          const res = await joinServer(inviteCode);
          if (res.success) {
            showToast(`🎉 ${res.message}`, 'success');
          }
        } else if (callInvite) {
          connectVoice();
          showToast('📞 Conectado à chamada de voz via link!', 'info');
        }
      } catch (err) {
        console.warn('Error reading invite link:', err);
      }
    };

    handleUrlInvite();
    window.addEventListener('hashchange', handleUrlInvite);
    return () => window.removeEventListener('hashchange', handleUrlInvite);
  }, [joinServer, connectVoice, showToast]);

  // Leave Server
  const leaveServer = useCallback((serverId: string) => {
    setServers(prev => {
      const updated = prev.filter(s => s.id !== serverId);
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      return updated;
    });
    if (currentServerId === serverId) {
      setCurrentServerIdState(null);
      setCurrentChannelIdState(null);
      setNavigationMode('friends');
    }
  }, [currentServerId]);

  // Delete Server (if owner)
  const deleteServer = useCallback((serverId: string) => {
    setServers(prev => {
      const updated = prev.filter(s => s.id !== serverId);
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
        deleteDoc(doc(db, 'servers', serverId)).catch(() => {});
      }
      return updated;
    });
    if (currentServerId === serverId) {
      setCurrentServerIdState(null);
      setCurrentChannelIdState(null);
      setNavigationMode('friends');
    }
  }, [currentServerId]);

  // Create New Channel
  const createNewChannel = useCallback((name: string, type: 'text' | 'voice', topic?: string, userLimit?: number) => {
    if (!currentServerId) return;
    const safeName = name.trim().toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: `chan_${Date.now()}`,
      serverId: currentServerId,
      name: safeName,
      type,
      topic: topic || `${type === 'text' ? 'Canal de texto' : 'Canal de voz'} #${safeName}`,
      userLimit: type === 'voice' && userLimit && userLimit > 0 ? userLimit : undefined,
    };

    setServers(prev => {
      const updated = prev.map(srv => {
        if (srv.id === currentServerId) {
          return { ...srv, channels: [...srv.channels, newChan] };
        }
        return srv;
      });
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });

    if (type === 'text') {
      setCurrentChannelIdState(newChan.id);
    }
  }, [currentServerId]);

  // Server Theme / Roles
  const updateServerTheme = useCallback((theme: ServerTheme, accentColor: string) => {
    if (!currentServerId) return;
    setServers(prev => {
      const updated = prev.map(srv => srv.id === currentServerId ? { ...srv, theme, accentColor } : srv);
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });
  }, [currentServerId]);

  const updateServerRoles = useCallback((roles: ServerRole[]) => {
    if (!currentServerId) return;
    setServers(prev => {
      const updated = prev.map(srv => srv.id === currentServerId ? { ...srv, roles } : srv);
      saveStorage(STORAGE_KEYS.SERVERS, updated);
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, { servers: cleanFirestorePayload(updated) }, { merge: true }).catch(() => {});
      }
      return updated;
    });
  }, [currentServerId]);

  // Helper to sync user state & servers after any auth success
  const syncUserAfterAuth = useCallback(async (fbUser: FirebaseUser, fallbackName?: string) => {
    // Check if user already has servers and profile saved in Firestore
    const userRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDocFromServer(userRef).catch(() => null);

    let targetServers: ServerData[] = [];
    let userProfile: UserProfile;

    if (userDocSnap && userDocSnap.exists()) {
      const data = userDocSnap.data();
      const accountId = data.accountId || generateAccountId();
      const userName = data.name || fbUser.displayName || fallbackName || 'Usuário Orb';
      userProfile = {
        id: fbUser.uid,
        accountId: accountId,
        name: userName,
        tag: data.tag || `${userName.toLowerCase().replace(/\s+/g, '')}#${accountId}`,
        email: fbUser.email || '',
        avatarUrl: data.avatarUrl || fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
        bio: data.bio !== undefined ? data.bio : 'Membro do Orb.co.',
        status: data.status || 'online',
        customStatus: data.customStatus || '',
        ping: 18,
        badges: data.badges || ['👑 Dono', '⭐ Orb.co'],
        role: data.role || 'owner',
        connectedAccounts: data.connectedAccounts || {},
      };

      if (Array.isArray(data.servers) && data.servers.length > 0) {
        targetServers = data.servers;
      } else {
        const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, []);
        targetServers = localServers;
      }

      if (data.theme) {
        setAppThemeState(data.theme);
        saveStorage(STORAGE_KEYS.THEME, data.theme);
      }
      if (data.accentColor) {
        setCustomAccentColorState(data.accentColor);
        saveStorage(STORAGE_KEYS.ACCENT, data.accentColor);
      }
    } else {
      const displayName = fallbackName || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Usuário Orb');
      const accountId = generateAccountId();
      userProfile = {
        id: fbUser.uid,
        accountId: accountId,
        name: displayName,
        tag: `${displayName.toLowerCase().replace(/\s+/g, '')}#${accountId}`,
        email: fbUser.email || '',
        bio: 'Membro do Orb.co.',
        avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
        bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
        status: 'online',
        ping: 18,
        badges: ['👑 Dono', '⭐ Orb.co'],
        role: 'owner',
      };
      const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, []);
      targetServers = localServers;
    }

    setCurrentUser(userProfile);
    saveStorage(STORAGE_KEYS.USER, userProfile);

    // Save user profile and servers to their Firestore account
    await setDoc(userRef, {
      ...cleanFirestorePayload(userProfile),
      servers: cleanFirestorePayload(targetServers)
    }, { merge: true }).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
    });

    // Also ensure any servers owned by user are registered in /servers collection
    for (const srv of targetServers) {
      const srvDoc = doc(db, 'servers', srv.id);
      setDoc(srvDoc, cleanFirestorePayload({
        id: srv.id,
        name: srv.name,
        iconUrl: srv.iconUrl,
        ownerId: fbUser.uid,
        themeColor: srv.accentColor,
        description: srv.description || '',
        createdAt: new Date().toISOString()
      }), { merge: true }).catch(() => {});
    }

    setServers(targetServers);
    saveStorage(STORAGE_KEYS.SERVERS, targetServers);

    if (targetServers.length > 0) {
      setCurrentServerIdState(targetServers[0].id);
      setNavigationMode('server');
    } else {
      setCurrentServerIdState(null);
      setNavigationMode('friends');
    }

    isInitialFirestoreSyncDone.current = true;
    setAuthModalOpen(false);
    setActiveView('app');
  }, []);

  // Auth: Email & Password Login
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim();
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await syncUserAfterAuth(result.user);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('auth/operation-not-allowed')) {
        throw err;
      }
    }

    // Fallback: Check local registered accounts registry
    const accounts = loadStorage<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    const normalizedEmail = cleanEmail.toLowerCase();
    const found = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!found) {
      throw new Error('auth/user-not-found');
    }

    const hash = await hashPassword(password);
    if (found.passwordHash !== hash) {
      throw new Error('auth/wrong-password');
    }

    // Successfully verified! Log in user
    setCurrentUser(found.profile);
    saveStorage(STORAGE_KEYS.USER, found.profile);

    const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, INITIAL_SERVERS);
    setServers(localServers);
    if (localServers.length > 0) {
      setCurrentServerIdState(localServers[0].id);
      setNavigationMode('server');
    } else {
      setCurrentServerIdState(null);
      setNavigationMode('friends');
    }

    setAuthModalOpen(false);
    setActiveView('app');
  }, [syncUserAfterAuth]);

  // Auth: Email & Password Registration
  const registerWithEmail = useCallback(async (email: string, password: string, name?: string) => {
    const cleanEmail = email.trim();
    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (name && name.trim()) {
        await updateProfile(result.user, { displayName: name.trim() }).catch(() => {});
      }
      await syncUserAfterAuth(result.user, name?.trim());
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('auth/operation-not-allowed')) {
        throw err;
      }
    }

    // Fallback: Register in local accounts registry
    const accounts = loadStorage<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
    const normalizedEmail = cleanEmail.toLowerCase();
    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error('auth/email-already-in-use');
    }

    const localUid = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const displayName = name?.trim() || cleanEmail.split('@')[0];
    const hash = await hashPassword(password);
    const accountId = generateAccountId();

    const humanAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces'
    ];
    const pickedAvatar = humanAvatars[Math.floor(Math.random() * humanAvatars.length)];

    const newProf: UserProfile = {
      id: localUid,
      accountId: accountId,
      name: displayName,
      tag: `${displayName.toLowerCase().replace(/\s+/g, '')}#${accountId}`,
      email: cleanEmail,
      bio: 'Membro do Orb.co.',
      avatarUrl: pickedAvatar,
      bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
      status: 'online',
      ping: 18,
      badges: ['👑 Dono', '⭐ Orb.co'],
      role: 'owner',
    };

    accounts.push({
      id: localUid,
      email: cleanEmail,
      passwordHash: hash,
      name: displayName,
      createdAt: new Date().toISOString(),
      profile: newProf,
    });

    saveStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    setRegisteredAccountsList(accounts.map(a => a.profile));
    setCurrentUser(newProf);
    saveStorage(STORAGE_KEYS.USER, newProf);

    const localServers = loadStorage<ServerData[]>(STORAGE_KEYS.SERVERS, INITIAL_SERVERS);
    setServers(localServers);
    if (localServers.length > 0) {
      setCurrentServerIdState(localServers[0].id);
      setNavigationMode('server');
    } else {
      setCurrentServerIdState(null);
      setNavigationMode('friends');
    }

    setAuthModalOpen(false);
    setActiveView('app');
  }, [syncUserAfterAuth]);

  // Auth: Password Reset Email
  const resetPassword = useCallback(async (email: string) => {
    const cleanEmail = email.trim();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        const accounts = loadStorage<RegisteredAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
        const found = accounts.find(a => a.email.toLowerCase() === cleanEmail.toLowerCase());
        if (!found) {
          throw new Error('auth/user-not-found');
        }
        return;
      }
      throw err;
    }
  }, []);

  // Auth: Google Sign-In with Gmail
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserAfterAuth(result.user);
    } catch (err) {
      console.error('Google Sign In failed:', err);
      throw err;
    }
  }, [syncUserAfterAuth]);

  // Auth: Logout
  const logout = useCallback(async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignored
    }
    setCurrentUser(DEFAULT_CLEAN_USER);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SERVERS);
    localStorage.removeItem(STORAGE_KEYS.FRIENDS);
    localStorage.removeItem(STORAGE_KEYS.DMS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    setServers([]);
    setFriends([]);
    setDirectMessages({});
    setMessages([]);
    setProfileModalOpen(false);
    setActiveView('landing');
  }, []);

  // Auth: Delete all registered accounts (Full purge requested by user)
  const deleteAllRegisteredAccounts = useCallback(async () => {
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await deleteDoc(doc(db, 'users', uid)).catch(() => {});
        await fbSignOut(auth).catch(() => {});
      }
    } catch (err) {
      console.warn('Error deleting user account from auth/db:', err);
    }

    try {
      localStorage.removeItem('orbita_registered_accounts_v1');
      localStorage.removeItem('orbita_registered_accounts_v2');
      localStorage.removeItem('orbita_registered_accounts_v3');
      localStorage.removeItem('orbita_registered_accounts_v4');
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.FRIEND_REQUESTS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SERVERS);
      localStorage.removeItem(STORAGE_KEYS.FRIENDS);
      localStorage.removeItem(STORAGE_KEYS.DMS);
      localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }

    const freshAccountId = generateAccountId();
    const cleanUser: UserProfile = {
      ...DEFAULT_CLEAN_USER,
      accountId: freshAccountId,
      tag: `voce#${freshAccountId}`,
    };

    setCurrentUser(cleanUser);
    setFriends(INITIAL_FRIENDS);
    setFriendRequests([]);
    setRegisteredAccountsList([]);
    setDirectMessages({});
    setMessages(INITIAL_CHAT_MESSAGES);
    setServers(INITIAL_SERVERS);
    setActiveFriendId(null);
    setCurrentServerIdState('srv_orb_central');
    setCurrentChannelIdState('chan_central_geral');
    setNavigationMode('friends');
    setAuthModalOpen(false);
    setProfileModalOpen(false);

    showToast('Todas as contas registradas foram excluídas com sucesso!', 'success');
  }, [showToast]);

  // Profile Update: synchronously updates local state, localStorage, and Firestore!
  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated: UserProfile = { 
        ...prev, 
        ...updates,
        connectedAccounts: {
          ...(prev.connectedAccounts || {}),
          ...(updates.connectedAccounts || {})
        }
      };

      // Save locally immediately
      saveStorage(STORAGE_KEYS.USER, updated);

      // Save to Firebase Firestore if logged in
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const payload = cleanFirestorePayload(updated);
        setDoc(userRef, payload, { merge: true }).catch(e => {
          handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
        });
      }
      return updated;
    });
  }, []);

  return (
    <OrbitaContext.Provider value={{
      currentUser,
      activeView,
      navigationMode,
      servers,
      currentServer,
      currentChannel,
      messages,
      friends,
      activeFriendId,
      activeFriend,
      directMessages,
      currentDirectMessages,

      inVoiceCall,
      isViewingVoiceRoom,
      voiceChannel,
      voiceCallTitle,
      isMuted,
      isDeafened,
      isScreenSharing,
      isCameraOn,
      isSpeaking,
      screenShareStream,
      simulatedVoiceParticipants,

      // WatchParty
      watchParty,
      watchPartyModalOpen,
      setWatchPartyModalOpen,
      startWatchParty,
      stopWatchParty,
      toggleWatchPartyPlay,
      setWatchPartyTime,

      // Multi-screen & split
      screenLayoutMode,
      setScreenLayoutMode,
      activeMainScreenId,
      setActiveMainScreenId,
      simulatedScreenSharers,
      toggleSimulatedScreenShare,

      // Moderation & Per-User settings
      userVolumes,
      setUserVolume,
      localMutedUsers,
      toggleLocalMuteUser,
      serverMutedUsers,
      toggleServerMuteUser,
      serverDeafenedUsers,
      toggleServerDeafenUser,
      kickVoiceParticipant,
      kickServerMember,
      isAdminMode,
      setIsAdminMode,
      toggleAdminMode,

      themeMode,
      appTheme,
      customAccentColor,
      customBgColor,
      isLeftSidebarCollapsed,
      isRightSidebarCollapsed,
      liveCaptions,
      isTranscriptionActive,

      authModalOpen,
      profileModalOpen,
      serverSettingsOpen,
      inviteModalOpen,
      soundboardModalOpen,
      serverModalOpen,
      serverModalTab,
      openServerModal,
      setServerModalOpen,
      setServerModalTab,

      setActiveView,
      setNavigationMode,
      setCurrentServerId,
      setCurrentChannelId,
      selectFriend,
      toggleTheme,
      setAppTheme,
      setCustomAccentColor,
      setCustomBgColor,
      toggleLeftSidebar,
      toggleRightSidebar,
      authModalMode,
      setAuthModalMode,
      openAuthModal,
      setAuthModalOpen,
      setProfileModalOpen,
      setServerSettingsOpen,
      setInviteModalOpen,
      setSoundboardModalOpen,
      toggleTranscription,

      sendMessage,
      sendDirectMessage,
      friendRequests,
      incomingFriendRequests,
      outgoingFriendRequests,
      pendingRequestsCount,
      registeredAccountsList,
      sendFriendRequest,
      addFriend,
      acceptFriendRequest,
      declineFriendRequest,
      cancelFriendRequest,
      sendServerInviteToFriend,
      removeFriend,
      callFriend,
      inviteFriendToCurrentCall,

      connectVoice,
      startPrivateCall,
      returnToVoiceRoom,
      disconnectVoice,
      toggleMute,
      toggleDeafen,
      toggleScreenShare,
      toggleCamera,

      playSound,
      addSoundItem,
      updateSoundVolume,
      deleteSoundItem,

      createNewServer,
      joinServer,
      leaveServer,
      deleteServer,
      createNewChannel,
      updateServerTheme,
      updateServerRoles,

      toastMessage,
      showToast,

      loginWithEmail,
      registerWithEmail,
      resetPassword,
      loginWithGoogle,
      logout,
      deleteAllRegisteredAccounts,
      updateUserProfile,
    }}>
      {children}
    </OrbitaContext.Provider>
  );
};

export const useOrbita = () => {
  const context = useContext(OrbitaContext);
  if (!context) {
    throw new Error('useOrbita must be used within an OrbitaProvider');
  }
  return context;
};
