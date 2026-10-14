import React, { useState, useRef } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  X, 
  Volume2, 
  Plus, 
  Upload, 
  Play, 
  Trash2
} from 'lucide-react';
import { SoundItem } from '../types';

const GLOBAL_PRESET_SOUNDS: SoundItem[] = [
  { id: 'snd_airhorn', serverId: 'global', title: 'Buzina MLG', emoji: '📢', category: 'Efeitos', soundKey: 'airhorn', volume: 0.8 },
  { id: 'snd_bruh', serverId: 'global', title: 'Bruh Moment', emoji: '🗿', category: 'Memes', soundKey: 'bruh', volume: 0.9 },
  { id: 'snd_quack', serverId: 'global', title: 'Pato Quack', emoji: '🦆', category: 'Engraçado', soundKey: 'quack', volume: 0.7 },
  { id: 'snd_applause', serverId: 'global', title: 'Aplausos GG', emoji: '👏', category: 'Reação', soundKey: 'gg_applause', volume: 0.75 },
  { id: 'snd_level', serverId: 'global', title: 'Subiu de Nível', emoji: '⭐', category: 'Jogos', soundKey: 'level_up', volume: 0.8 },
  { id: 'snd_tada', serverId: 'global', title: 'Ta-da Fanfarra', emoji: '🎉', category: 'Celebração', soundKey: 'ta-da', volume: 0.8 },
  { id: 'snd_drum', serverId: 'global', title: 'Rolo de Tambor', emoji: '🥁', category: 'Suspense', soundKey: 'drum_roll', volume: 0.85 },
  { id: 'snd_oof', serverId: 'global', title: 'Oof', emoji: '💥', category: 'Memes', soundKey: 'oof', volume: 0.9 },
  { id: 'snd_laser', serverId: 'global', title: 'Laser Sci-Fi', emoji: '🔫', category: 'Efeitos', soundKey: 'laser', volume: 0.65 },
];

export const Soundboard: React.FC = () => {
  const { 
    currentServer, 
    soundboardModalOpen, 
    setSoundboardModalOpen, 
    playSound, 
    addSoundItem, 
    updateSoundVolume, 
    deleteSoundItem 
  } = useOrbita();

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎵');
  const [newAudioUrl, setNewAudioUrl] = useState<string | null>(null);
  const [newVolume, setNewVolume] = useState<number>(0.8);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!soundboardModalOpen) return null;

  const categories = ['todos', 'Memes', 'Efeitos', 'Jogos', 'Reação'];

  const soundList = currentServer?.soundboard && currentServer.soundboard.length > 0 
    ? currentServer.soundboard 
    : GLOBAL_PRESET_SOUNDS;

  const filteredSounds = activeCategory === 'todos' 
    ? soundList 
    : soundList.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewAudioUrl(url);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveCustomSound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAudioUrl) return;

    addSoundItem({
      serverId: currentServer?.id || 'default',
      title: newTitle.trim(),
      emoji: newEmoji || '🔊',
      category: 'Personalizado',
      audioUrl: newAudioUrl,
      volume: newVolume,
      isCustom: true,
    });

    setNewTitle('');
    setNewEmoji('🎵');
    setNewAudioUrl(null);
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col max-h-[85vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Soundboard Orb.co
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {soundList.length} sons
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dispare efeitos sonoros curtos em tempo real durante chamadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentServer && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Áudio</span>
              </button>
            )}
            <button
              onClick={() => setSoundboardModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-white/15 text-white border border-white/20' 
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sound Items Grid */}
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSounds.map(sound => (
            <div 
              key={sound.id}
              className="glass-panel rounded-2xl p-3 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <button
                onClick={() => playSound(sound)}
                className="flex items-center gap-3 w-full text-left cursor-pointer group-hover:scale-[1.02] transition-transform"
                title={`Disparar ${sound.title}`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-cyan-500/20 text-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                  {sound.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {sound.title}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {sound.category}
                  </span>
                </div>
                <Play className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2 text-slate-400">
                <Volume2 className="w-3 h-3 text-slate-500 shrink-0" />
                <input 
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={sound.volume}
                  onChange={(e) => updateSoundVolume(sound.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[9px] font-mono text-slate-500 shrink-0">
                  {Math.round(sound.volume * 100)}%
                </span>
                {sound.isCustom && (
                  <button
                    onClick={() => deleteSoundItem(sound.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Custom Sound */}
        {showAddModal && currentServer && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md rounded-2xl p-5 border border-white/10 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-1">Upload de Áudio</h3>
              <p className="text-xs text-slate-400 mb-4">
                Envie um arquivo de áudio para o soundboard do servidor.
              </p>

              <form onSubmit={handleSaveCustomSound} className="space-y-4">
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAudioFileUpload}
                    accept="audio/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-white/20 hover:border-cyan-400/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all cursor-pointer bg-white/5"
                  >
                    <Upload className="w-6 h-6 text-cyan-400" />
                    <span className="text-xs font-semibold">
                      {newAudioUrl ? 'Arquivo pronto ✓' : 'Clique para selecionar áudio'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Emoji</label>
                    <input 
                      type="text" 
                      value={newEmoji}
                      onChange={(e) => setNewEmoji(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-xl text-center text-sm text-white"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Título</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || !newAudioUrl}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
                  >
                    Salvar Áudio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
