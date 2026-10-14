import React, { useState, useRef, useEffect } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  X, 
  User, 
  Shield, 
  Link as LinkIcon, 
  Palette, 
  Upload, 
  Check, 
  LogOut,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Pipette
} from 'lucide-react';
import { UserStatus, AppTheme } from '../types';

export const ProfileModal: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    profileModalOpen, 
    setProfileModalOpen, 
    logout, 
    appTheme,
    setAppTheme,
    customAccentColor,
    setCustomAccentColor,
    customBgColor,
    setCustomBgColor,
    themeMode, 
    toggleTheme
  } = useOrbita();

  const [activeTab, setActiveTab] = useState<'perfil' | 'privacidade' | 'conexoes' | 'aparencia'>('perfil');

  // Form local state for live dynamic updates
  const [nick, setNick] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [status, setStatus] = useState<UserStatus>(currentUser.status || 'online');
  const [customStatus, setCustomStatus] = useState(currentUser.customStatus || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl);
  const [spotifyHandle, setSpotifyHandle] = useState(currentUser.connectedAccounts?.spotify || '');
  const [instagramHandle, setInstagramHandle] = useState(currentUser.connectedAccounts?.instagram || '');
  const [githubHandle, setGithubHandle] = useState(currentUser.connectedAccounts?.github || '');
  const [twitchHandle, setTwitchHandle] = useState(currentUser.connectedAccounts?.twitch || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever modal opens or currentUser updates
  useEffect(() => {
    if (profileModalOpen) {
      setNick(currentUser.name);
      setBio(currentUser.bio || '');
      setStatus(currentUser.status || 'online');
      setCustomStatus(currentUser.customStatus || '');
      setAvatarUrl(currentUser.avatarUrl);
      setBannerUrl(currentUser.bannerUrl);
      setSpotifyHandle(currentUser.connectedAccounts?.spotify || '');
      setInstagramHandle(currentUser.connectedAccounts?.instagram || '');
      setGithubHandle(currentUser.connectedAccounts?.github || '');
      setTwitchHandle(currentUser.connectedAccounts?.twitch || '');
    }
  }, [profileModalOpen, currentUser]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!profileModalOpen) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBannerUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const accounts: Record<string, string> = {};
    if (spotifyHandle && spotifyHandle.trim()) accounts.spotify = spotifyHandle.trim();
    if (instagramHandle && instagramHandle.trim()) accounts.instagram = instagramHandle.trim();
    if (githubHandle && githubHandle.trim()) accounts.github = githubHandle.trim();
    if (twitchHandle && twitchHandle.trim()) accounts.twitch = twitchHandle.trim();

    updateUserProfile({
      name: nick.trim() || 'Usuário',
      bio: bio.trim(),
      status,
      customStatus: customStatus.trim(),
      avatarUrl,
      bannerUrl,
      connectedAccounts: accounts,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const presetBanners = [
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=300&fit=crop',
  ];

  const appThemesList: { id: AppTheme; name: string; color: string; desc: string }[] = [
    { id: 'nebula', name: 'Nebulosa Cósmica', color: '#6366f1', desc: 'Violeta e Índigo interestelar com reflexos espaciais' },
    { id: 'cyber', name: 'Andrômeda Cyber', color: '#06b6d4', desc: 'Ciano neon, elétrico e futurista com alto contraste' },
    { id: 'aurora', name: 'Aurora Boreal', color: '#10b981', desc: 'Esmeralda e menta boreal viva' },
    { id: 'solar', name: 'Supernova Solar', color: '#f59e0b', desc: 'Dourado e âmbar ardente de alta energia' },
    { id: 'rose', name: 'Quartzo Rosa', color: '#f43f5e', desc: 'Magenta e tons de rubi cósmico' },
    { id: 'graphite', name: 'Grafite Profundo', color: '#64748b', desc: 'Minimalismo escuro OLED com foco no conteúdo' },
    { id: 'light', name: 'Modo Claro Estelar', color: '#4f46e5', desc: 'Visual diurno límpido, elegante e suave' },
    { id: 'custom', name: 'Personalizado', color: customAccentColor || '#a855f7', desc: 'Defina suas próprias cores com o seletor livre' },
  ];

  const presetAccentColors = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', 
    '#a855f7', '#3b82f6', '#ec4899', '#14b8a6', '#eab308'
  ];

  const bgTones = [
    { label: 'Cósmico Profundo', color: '#0b0c10' },
    { label: 'Preto Absoluto OLED', color: '#050507' },
    { label: 'Azul Meia-Noite', color: '#070b18' },
    { label: 'Grafite Neutro', color: '#13141a' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Configurações de Usuário</span>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Layout: Left Menu | Center Edit Form | Right Dynamic Preview */}
        <div className="flex-1 grid grid-cols-12 gap-6 pt-6 overflow-hidden min-h-0">
          {/* MENU (ESQUERDA) */}
          <div className="col-span-12 md:col-span-3 space-y-1 shrink-0 border-r border-white/5 pr-3 overflow-y-auto">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'perfil' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={() => setActiveTab('aparencia')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'aparencia' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Aparência & Cores</span>
            </button>

            <button
              onClick={() => setActiveTab('conexoes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'conexoes' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Conexões</span>
            </button>

            <button
              onClick={() => setActiveTab('privacidade')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'privacidade' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacidade</span>
            </button>

            {/* Logout Button & Account Info */}
            <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
              {currentUser.email && (
                <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Conta Autenticada</span>
                  <span className="text-slate-300 font-medium truncate block">{currentUser.email}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar Conta</span>
              </button>
            </div>
          </div>

          {/* EDIT FORM (CENTRO) */}
          <div className="col-span-12 md:col-span-5 overflow-y-auto pr-2 space-y-4">
            {activeTab === 'perfil' && (
              <>
                {/* Banner Upload & Presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Banner de Perfil
                  </label>
                  <div className="relative h-24 rounded-2xl overflow-hidden border border-white/10 group mb-2">
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold transition-opacity"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Trocar Imagem do Banner</span>
                    </button>
                  </div>
                  <input 
                    ref={bannerInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleBannerFile} 
                    className="hidden" 
                  />

                  {/* Preset Banners */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Modelos cósmicos:</span>
                    {presetBanners.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBannerUrl(url)}
                        className="w-8 h-5 rounded-md overflow-hidden border border-white/20 hover:border-cyan-400 transition-colors"
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Foto de Perfil (Avatar)
                  </label>
                  <div className="flex items-center gap-3">
                    <input 
                      ref={avatarInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarFile} 
                      className="hidden" 
                    />
                    <div 
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500/60 cursor-pointer relative group shrink-0"
                    >
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                    >
                      Carregar Foto
                    </button>
                  </div>
                </div>

                {/* Nickname & Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome de Usuário (Nick)
                  </label>
                  <input 
                    type="text" 
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Seu nick no Orb.co"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Personalizado
                  </label>
                  <input 
                    type="text" 
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="ex: Jogando no Orb.co 🪐"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Biografia
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Conte um pouco sobre você aos seus amigos..."
                  />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estado de Presença
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setStatus('online')}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        status === 'online' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        status === 'idle' ? 'bg-amber-500/15 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Ausente
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('dnd')}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        status === 'dnd' ? 'bg-rose-500/15 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Não Perturbe
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('offline')}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        status === 'offline' ? 'bg-slate-500/15 border-slate-500 text-slate-300' : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Invisível
                    </button>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Alterações Salvas com Sucesso!</span>
                      </>
                    ) : (
                      <span>Salvar Perfil</span>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* APARÊNCIA & CORES (Rich theme & color customization) */}
            {activeTab === 'aparencia' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Temas do Orb.co</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Personalize o visual e a paleta de cores de todo o site.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {appThemesList.map(th => {
                      const isSelected = appTheme === th.id;
                      return (
                        <div
                          key={th.id}
                          onClick={() => {
                            setAppTheme(th.id);
                            setCustomAccentColor(th.color);
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? 'border-indigo-500 bg-white/10 shadow-lg' 
                              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: th.color }}
                              ></span>
                              <span className="font-bold text-xs text-white">{th.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{th.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personalização Avançada de Cores */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Cor de Destaque Personalizada
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Selecione ou digite qualquer cor HEX para realçar botões, órbitas e anéis.
                  </p>

                  {/* Preset Swatches */}
                  <div className="flex items-center flex-wrap gap-2">
                    {presetAccentColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setCustomAccentColor(color);
                          setAppTheme('custom');
                        }}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                          customAccentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        title={color}
                      />
                    ))}

                    {/* Color Input */}
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer text-xs text-slate-300">
                      <Pipette className="w-3.5 h-3.5 text-cyan-400" />
                      <span>HEX</span>
                      <input 
                        type="color" 
                        value={customAccentColor}
                        onChange={(e) => {
                          setCustomAccentColor(e.target.value);
                          setAppTheme('custom');
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </label>
                  </div>
                </div>

                {/* Tom de Fundo */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Tom de Fundo do Site
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {bgTones.map(tone => (
                      <button
                        key={tone.color}
                        type="button"
                        onClick={() => {
                          setCustomBgColor(tone.color);
                          setAppTheme('custom');
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                          customBgColor === tone.color ? 'border-indigo-500 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: tone.color }}
                        ></span>
                        <span className="truncate">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONEXÕES */}
            {activeTab === 'conexoes' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Conexões de Contas</h3>
                <p className="text-xs text-slate-400">
                  Ligue suas redes sociais para exibir no seu perfil para seus amigos.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Spotify</label>
                    <input 
                      type="text" 
                      value={spotifyHandle}
                      onChange={(e) => setSpotifyHandle(e.target.value)}
                      placeholder="ex: ouvindo synthwave cosmic"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Instagram</label>
                    <input 
                      type="text" 
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="ex: @seu.nick"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">GitHub</label>
                    <input 
                      type="text" 
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      placeholder="ex: github.com/seu-perfil"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Twitch</label>
                    <input 
                      type="text" 
                      value={twitchHandle}
                      onChange={(e) => setTwitchHandle(e.target.value)}
                      placeholder="ex: twitch.tv/seu-canal"
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  {savedSuccess ? 'Salvo!' : 'Salvar Conexões'}
                </button>
              </div>
            )}

            {/* PRIVACIDADE */}
            {activeTab === 'privacidade' && (
              <div className="space-y-4 text-xs text-slate-400">
                <h3 className="text-sm font-bold text-white">Configurações de Privacidade</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <input type="checkbox" defaultChecked className="accent-indigo-500" />
                    <span>Permitir mensagens diretas de membros do servidor</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <input type="checkbox" defaultChecked className="accent-indigo-500" />
                    <span>Exibir status de presença para amigos</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* PRÉ-VISUALIZAÇÃO DINÂMICA (DIREITA) */}
          <div className="col-span-12 md:col-span-4 shrink-0 flex flex-col justify-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pré-visualização Dinâmica
            </span>

            {/* Dynamic Card */}
            <div className="rounded-3xl overflow-hidden bg-[#151724] border border-white/10 shadow-2xl transition-all">
              {/* Banner */}
              <div className="h-28 w-full relative">
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151724] to-transparent"></div>
              </div>

              {/* Avatar & Status dot */}
              <div className="px-5 pb-5 relative">
                <div className="-mt-12 mb-3 relative inline-block">
                  <div className="w-20 h-20 rounded-full border-4 border-[#151724] overflow-hidden shadow-xl">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#151724] ${
                    status === 'online' ? 'bg-emerald-400' :
                    status === 'idle' ? 'bg-amber-400' :
                    status === 'dnd' ? 'bg-rose-500' : 'bg-slate-500'
                  }`}></span>
                </div>

                {/* Nick & Tag */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-extrabold text-white">
                    {nick || 'Usuário'}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    #0001
                  </span>
                </div>

                {/* Custom status */}
                {customStatus && (
                  <div className="text-[11px] text-cyan-400 font-medium mb-2">
                    {customStatus}
                  </div>
                )}

                {/* Bio */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {bio || 'Nenhuma biografia adicionada ainda.'}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-300">
                    👑 Dono
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                    🪐 Orb.co
                  </span>
                </div>

                {/* Connected Platforms */}
                {(spotifyHandle || instagramHandle || githubHandle || twitchHandle) && (
                  <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block text-[10px] uppercase">Contas Conectadas</span>
                    {spotifyHandle && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span>🎵</span>
                        <span className="truncate">{spotifyHandle}</span>
                      </div>
                    )}
                    {instagramHandle && (
                      <div className="flex items-center gap-1.5 text-pink-400">
                        <span>📸</span>
                        <span className="truncate">{instagramHandle}</span>
                      </div>
                    )}
                    {githubHandle && (
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span>💻</span>
                        <span className="truncate">{githubHandle}</span>
                      </div>
                    )}
                    {twitchHandle && (
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <span>🎮</span>
                        <span className="truncate">{twitchHandle}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
