import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  X, 
  Sparkles, 
  Film, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useOrbita } from '../context/OrbitaContext';

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

export const WatchPartyPlayer: React.FC = () => {
  const { watchParty, stopWatchParty, toggleWatchPartyPlay, currentUser } = useOrbita();
  const [isPlaying, setIsPlaying] = useState(watchParty?.isPlaying ?? true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [showControls, setShowControls] = useState(true);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (watchParty) {
      setIsPlaying(watchParty.isPlaying);
    }
  }, [watchParty?.isPlaying]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration || 180);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [watchParty?.directVideoUrl]);

  // Sync play/pause with HTML5 video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(e => console.warn('Autoplay prevented:', e));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    toggleWatchPartyPlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  const triggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `react_${Date.now()}_${Math.random()}`,
      emoji,
      left: 15 + Math.random() * 70, // percentage between 15% and 85%
    };
    setReactions(prev => [...prev.slice(-12), newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  if (!watchParty || !watchParty.isActive) return null;

  const isGoogleDriveEmbed = watchParty.embedUrl.includes('drive.google.com');

  return (
    <div 
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full rounded-2xl bg-black border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between group select-none"
    >
      {/* Ambient cinema glow background */}
      <div className="absolute inset-0 bg-radial from-indigo-900/10 via-black to-black pointer-events-none"></div>

      {/* Floating Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {reactions.map(r => (
          <div
            key={r.id}
            style={{ left: `${r.left}%` }}
            className="absolute bottom-16 text-3xl animate-bounce transition-all opacity-90 drop-shadow-md"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <div className={`relative z-20 px-4 py-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Film className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight truncate max-w-[280px] sm:max-w-md">
                {watchParty.title || 'Sessão CineOrbita'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                🍿 WatchParty Ao Vivo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Transmitido por: <strong className="text-slate-200">{watchParty.hostName}</strong></span>
              <span>•</span>
              <span className="text-emerald-400">Todos na chamada sincronizados</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Drive link helper */}
          {isGoogleDriveEmbed && (
            <a
              href={watchParty.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs transition-colors"
              title="Abrir arquivo original no Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abrir no Drive</span>
            </a>
          )}

          {/* Close / End Session */}
          <button
            onClick={stopWatchParty}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 transition-colors cursor-pointer"
            title="Encerrar Sessão Cinema"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Video Frame */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {isGoogleDriveEmbed ? (
          /* Google Drive Embed Preview Player */
          <div className="w-full h-full relative flex items-center justify-center">
            <iframe
              src={watchParty.embedUrl}
              title={watchParty.title}
              className="w-full h-full border-0 rounded-lg"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          /* HTML5 Video Player for Direct URLs & Demos */
          <video
            ref={videoRef}
            src={watchParty.directVideoUrl || watchParty.embedUrl}
            playsInline
            className="w-full h-full object-contain max-h-[82vh]"
            onClick={handlePlayPause}
          />
        )}
      </div>

      {/* Bottom Floating Controls Bar */}
      <div className={`relative z-20 px-4 py-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress Bar (Scrubber) for HTML5 video */}
        {!isGoogleDriveEmbed && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
              {formatTime(duration)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isGoogleDriveEmbed && (
              <>
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Voltar 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Avançar 10s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded appearance-none accent-cyan-400 cursor-pointer"
                  />
                </div>
              </>
            )}

            {isGoogleDriveEmbed && (
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Player Google Drive integrado na chamada</span>
              </div>
            )}
          </div>

          {/* Quick Real-Time Emojis / Reactions */}
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Reagir:</span>
            {['🍿', '🔥', '👏', '😱', '❤️', '🚀'].map(emoji => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-white/10 transition-transform hover:scale-125 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Fullscreen Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tela Cheia"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
