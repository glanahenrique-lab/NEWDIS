import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Maximize2, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Sparkles,
  Radio,
  Film
} from 'lucide-react';

export const WanderingPlanetWidget: React.FC = () => {
  const { 
    inVoiceCall, 
    isViewingVoiceRoom, 
    returnToVoiceRoom, 
    voiceCallTitle,
    currentUser,
    isMuted,
    toggleMute,
    disconnectVoice,
    isSpeaking,
    isScreenSharing,
    simulatedVoiceParticipants,
    watchParty
  } = useOrbita();

  const [isHovered, setIsHovered] = useState(false);

  // Only display when in a voice call AND currently navigating text channels or outside the voice room!
  if (!inVoiceCall || isViewingVoiceRoom) {
    return null;
  }

  const activeParticipantsCount = simulatedVoiceParticipants.length + 1;

  return (
    <aside 
      aria-label="Chamada de voz em andamento"
      className="fixed bottom-6 right-6 z-40 select-none animate-fade-in pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        {/* Subtle Cosmic Halo Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-cyan-500/20 to-purple-500/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 animate-pulse"></div>

        {/* Floating Planet Card */}
        <div className="relative rounded-2xl glass-panel p-3 border border-white/15 shadow-2xl backdrop-blur-xl flex items-center gap-3 wandering-planet-glow">
          {/* Wandering Planet & Orbit Icon - Clicking returns to call */}
          <div 
            onClick={returnToVoiceRoom}
            className="relative w-12 h-12 flex items-center justify-center cursor-pointer shrink-0"
            title="Clique para voltar para a tela da chamada de voz"
          >
            {/* Spinning Mini Orbit Ring */}
            <div className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 animate-orbit-slow ${
              isMuted ? 'border-slate-500/30' : 'border-cyan-400/50'
            }`}></div>

            {/* Orbiting Satellite Dot */}
            <div className="absolute inset-0 animate-orbit-slow">
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-sm ${
                isMuted ? 'bg-slate-400' : 'bg-cyan-400 shadow-cyan-400/80'
              }`}></span>
            </div>

            {/* Center Planet (Avatar) */}
            <div className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              isMuted 
                ? 'border-slate-500 opacity-75 grayscale' 
                : isSpeaking 
                ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 shadow-[0_0_15px_#22d3ee]' 
                : 'border-white/30 hover:border-cyan-400'
            }`}>
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Screen share or CineOrbita mini badge */}
            {watchParty?.isActive ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-600 border border-white/20 flex items-center justify-center text-[8px] text-white shadow-md animate-pulse" title="Sessão CineOrbita ativa">
                <Film className="w-2.5 h-2.5" />
              </span>
            ) : isScreenSharing ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 border border-white/20 flex items-center justify-center text-[8px] text-white shadow-md">
                <Monitor className="w-2.5 h-2.5" />
              </span>
            ) : null}
          </div>

          {/* Info & Call status (click to return) */}
          <div 
            onClick={returnToVoiceRoom}
            className="cursor-pointer pr-1 min-w-[120px] max-w-[170px]"
            title="Clique para voltar para a chamada"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isMuted ? 'bg-slate-400' : 'bg-emerald-400 animate-ping'
              }`}></span>
              <span className="truncate">{voiceCallTitle || 'Voz Geral'}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
              <span className="text-emerald-400">● {activeParticipantsCount} na chamada</span>
              <span>•</span>
              <span className="text-cyan-400/90 hover:underline flex items-center gap-0.5 font-sans">
                Voltar <Maximize2 className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* Quick Floating Action Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10 shrink-0">
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Desmutar microfone' : 'Mutar microfone'}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Return to Call Maximize Button */}
            <button
              onClick={returnToVoiceRoom}
              className="p-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all cursor-pointer"
              title="Expandir para tela cheia de voz"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Disconnect Button */}
            <button
              onClick={disconnectVoice}
              className="p-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white transition-all cursor-pointer"
              title="Desconectar da chamada"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
