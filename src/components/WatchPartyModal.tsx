import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Play, 
  Link as LinkIcon, 
  Sparkles, 
  AlertCircle,
  Clapperboard,
  HardDrive
} from 'lucide-react';
import { useOrbita } from '../context/OrbitaContext';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({ isOpen, onClose }) => {
  const { startWatchParty } = useOrbita();
  const [driveUrl, setDriveUrl] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.trim()) {
      setError('Por favor, insira o link do Google Drive ou vídeo.');
      return;
    }

    startWatchParty(driveUrl.trim(), movieTitle.trim() || undefined);
    onClose();
    setDriveUrl('');
    setMovieTitle('');
    setError(null);
  };

  const handleSelectPreset = (url: string, title: string) => {
    startWatchParty(url, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0e1017] border border-white/15 p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>CineOrbita WatchParty</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  Sincronizado
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Assista a filmes e vídeos do Google Drive juntos na chamada, sem precisar compartilhar tela!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleStart} className="space-y-4 z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Link do Google Drive (ou Vídeo Direto)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Dica: No Google Drive, deixe o arquivo como "Qualquer pessoa com o link pode ver"</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clapperboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nome do Filme / Título (Opcional)</span>
            </label>
            <input
              type="text"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              placeholder="Ex: Interestelar (2014) - Sessão Cósmica"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Sessão Cinema</span>
            </button>
          </div>
        </form>

        {/* Quick presets for immediate testing */}
        <div className="pt-3 border-t border-white/10 z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Testar Imediatamente (Filmes de Demonstração):</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPreset(
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                'Tears of Steel (Sci-Fi Cosmos 4K)'
              )}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-2.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">Tears of Steel 4K</p>
                <p className="text-[10px] text-slate-400 truncate">Ficção Científica Espacial</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset(
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'Big Buck Bunny (Animação HD)'
              )}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center gap-2.5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">Big Buck Bunny HD</p>
                <p className="text-[10px] text-slate-400 truncate">Animação e Comédia</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
