import React, { useEffect, useState } from 'react';
import { Code, Figma, Gamepad2, Laptop, Monitor } from 'lucide-react';

interface SimulatedScreenCanvasProps {
  mockType?: 'code' | 'game' | 'design';
  title?: string;
  userName: string;
}

export const SimulatedScreenCanvas: React.FC<SimulatedScreenCanvasProps> = ({
  mockType = 'code',
  title,
  userName,
}) => {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  if (mockType === 'design') {
    return (
      <div className="w-full h-full bg-[#1e1e1e] flex flex-col font-sans select-none overflow-hidden relative">
        {/* Figma Topbar */}
        <div className="h-8 bg-[#2c2c2c] border-b border-[#3c3c3c] flex items-center justify-between px-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Figma className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-white">Orb.co Design System 2026.fig</span>
            <span className="text-[10px] text-slate-400">• Editando por {userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">100%</span>
            <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">Compartilhar</span>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 bg-[#141416] p-4 flex items-center justify-center relative overflow-hidden">
          {/* Grid dots */}
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* Figma Artboard */}
          <div className="w-[85%] max-w-[480px] bg-[#0b0c10] rounded-xl border border-indigo-500/30 p-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Orb.co Voice Constellation
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Frame 402
              </span>
            </div>

            <div className="py-6 flex items-center justify-center">
              <div className="relative w-36 h-36 rounded-full border border-indigo-500/40 flex items-center justify-center animate-spin-slow">
                <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-cyan-300 font-bold text-xs shadow-[0_0_20px_#6366f1]">
                  Orbita
                </div>
                <div className="absolute top-1 left-2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                <div className="absolute bottom-2 right-4 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
              </div>
            </div>

            {/* Live remote cursor */}
            <div 
              style={{
                transform: `translate(${Math.sin(ticker) * 40}px, ${Math.cos(ticker) * 20}px)`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="absolute top-1/2 left-1/3 flex items-center gap-1 pointer-events-none"
            >
              <svg className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow" viewBox="0 0 24 24">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-[9px] font-bold text-white shadow">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mockType === 'game') {
    return (
      <div className="w-full h-full bg-[#05060b] flex flex-col font-mono select-none overflow-hidden relative">
        {/* Game overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-white">
          <Gamepad2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-300">CYBER RACER 2088</span>
          <span className="text-slate-400">• 144 FPS • 4K</span>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0e0728] via-[#160b33] to-[#040112]">
          {/* Synthwave Sun & Grid */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-t from-pink-500 via-rose-500 to-amber-400 shadow-[0_0_50px_#f43f5e] relative"></div>

          {/* Perspective 3D Grid floor */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(to_bottom,transparent,rgba(217,70,239,0.3)),repeating-linear-gradient(to_right,#e879f9_0_1px,transparent_1px_40px)] [transform:perspective(250px)_rotateX(60deg)]"></div>

          {/* Vehicle */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-20 h-10 bg-indigo-900 border-2 border-cyan-400 rounded-t-xl shadow-[0_0_30px_#22d3ee] flex items-center justify-center text-[10px] text-cyan-300 font-bold">
              SPEED: {240 + (ticker % 4) * 8} KM/H
            </div>
            <div className="w-28 h-2 bg-pink-500 blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Coding in VS Code
  return (
    <div className="w-full h-full bg-[#181a1f] flex flex-col font-mono select-none overflow-hidden text-slate-300">
      {/* VS Code titlebar */}
      <div className="h-7 bg-[#21252b] border-b border-[#181a1f] flex items-center justify-between px-3 text-[11px]">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200 font-semibold">src/server/voice-webrtc.ts</span>
          <span className="text-slate-500 text-[10px]">— Orb.co Core</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400 font-bold">● TypeScript 5.4</span>
          <span className="text-slate-400">LF • UTF-8</span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-4 overflow-hidden text-xs leading-relaxed space-y-1 bg-[#1e2227]">
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">1</span>
          <span><span className="text-purple-400">import</span> &#123; <span className="text-yellow-300">OrbitaMesh</span>, <span className="text-yellow-300">PeerConnection</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@orbita/engine'</span>;</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">2</span>
          <span><span className="text-purple-400">export async function</span> <span className="text-blue-400">broadcastMultiStream</span>(peers: <span className="text-yellow-300">Peer</span>[]) &#123;</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">3</span>
          <span className="pl-4 text-slate-400">// Transmissão de múltiplas telas sincronizadas em 60fps</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">4</span>
          <span className="pl-4"><span className="text-purple-400">const</span> mesh = <span className="text-purple-400">new</span> <span className="text-yellow-300">OrbitaMesh</span>(&#123; mode: <span className="text-emerald-300">'ultra-low-latency'</span> &#125;);</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">5</span>
          <span className="pl-4"><span className="text-blue-400">await</span> mesh.<span className="text-blue-400">synchronizeOrbit</span>(peers);</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">6</span>
          <span className="pl-4"><span className="text-purple-400">return</span> &#123; status: <span className="text-emerald-300">'streaming'</span>, fps: <span className="text-orange-400">60</span> &#125;;</span>
        </div>
        <div className="flex gap-4">
          <span className="text-slate-600 select-none w-6 text-right">7</span>
          <span>&#125;</span>
        </div>

        {/* Live typing cursor */}
        <div className="flex gap-4 pt-2">
          <span className="text-slate-600 select-none w-6 text-right">8</span>
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <span>$ orbita-server --status: connected ({ticker * 12} packets/s)</span>
            <span className="w-1.5 h-3.5 bg-cyan-400 animate-pulse"></span>
          </span>
        </div>
      </div>
    </div>
  );
};
