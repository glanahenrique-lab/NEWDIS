import React from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { 
  Monitor, 
  Volume2, 
  Share2, 
  Shield, 
  Sparkles, 
  Radio, 
  ArrowRight,
  Headphones,
  Sliders,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal } = useOrbita();

  return (
    <div className="relative min-h-screen bg-[#0b0c10] text-[#e2e8f0] overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Cosmic Background Glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[550px] w-[550px] rounded-full bg-indigo-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[130px]" />

      {/* Floating Glassmorphism Top Navigation */}
      <header className="fixed top-5 inset-x-0 z-50 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/40 border border-white/10 backdrop-blur-xl">
          {/* Logo Orb.co */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full rounded-full bg-[#0d0f17] flex items-center justify-center">
                <span className="text-sm">🪐</span>
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Orb.co
            </span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#seguranca" className="hover:text-white transition-colors">Segurança</a>
            <a href="#constelacao" className="hover:text-white transition-colors">Voz</a>
            <a href="#baixar" className="hover:text-white transition-colors">Baixar</a>
          </nav>

          {/* Right Actions: Login & Criar Conta */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => openAuthModal('login')}
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              Entrar
            </button>
            <button 
              onClick={() => openAuthModal('register')}
              className="text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-white/20 hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>Criar Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Orb.co • Arquitetura Modular e Leve</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.12]">
              Sua nova órbita de voz, vídeo e amizade.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg">
              Esqueça o visual de sempre. Conecte-se com seus amigos no Orb.co em um espaço modular, leve e totalmente personalizável.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button 
                onClick={() => openAuthModal('register')}
                className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold text-sm hover:opacity-95 transition-all duration-200 shadow-xl shadow-indigo-500/25 hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar Conta Grátis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => openAuthModal('login')}
                className="glass-panel px-6 py-3.5 rounded-2xl text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200 border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <span>Fazer Login</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="pt-4 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Baixa latência (pings &lt; 20ms)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Partilha opcional sob demanda
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Soundboard integrado
              </span>
            </div>
          </div>

          {/* Right Column: 3D Perspective Preview */}
          <div className="lg:col-span-7 relative">
            <div className="relative mx-auto max-w-2xl rounded-2xl p-2.5 sm:p-3 bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-2xl shadow-2xl shadow-indigo-950/50">
              <div className="rounded-xl overflow-hidden bg-[#11131c]/95 border border-white/5">
                {/* Mockup Header */}
                <div className="px-4 py-2.5 bg-[#0e1017]/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="ml-2 font-medium text-slate-300">🪐 Orb.co</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                      ● 18ms
                    </span>
                    <span className="text-[11px] text-slate-400">Orb.co HD</span>
                  </div>
                </div>

                {/* Mockup Body Grid */}
                <div className="p-4 grid grid-cols-12 gap-3 bg-[#0d0f17]/90 min-h-[320px]">
                  {/* Constellation Module */}
                  <div className="col-span-12 rounded-xl bg-[#141622]/80 border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden items-center">
                    <div className="w-full text-[11px] font-semibold text-slate-300 flex items-center justify-between mb-2">
                      <span>Voz Geral</span>
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    </div>

                    {/* Orbit rings in preview */}
                    <div className="relative w-44 h-44 my-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-indigo-500/20"></div>
                      <div className="absolute inset-6 rounded-full border border-cyan-500/25"></div>
                      
                      <div className="relative z-10 w-16 h-16 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_#22d3ee] p-1 bg-slate-900">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop" 
                          alt="Orb.co user" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      </div>
                    </div>

                    <div className="glass-pill px-4 py-1.5 rounded-full flex items-center gap-3 text-xs text-slate-300 mt-2">
                      <span>🎙️ Mic</span>
                      <span>📹 Cam</span>
                      <span>🖥️ Compartilhar Tela</span>
                      <span>🎵 Soundboard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mini Profile Card Preview */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 glass-panel rounded-2xl p-3 shadow-2xl border border-white/15 max-w-[260px] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                    alt="user" 
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400" 
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      Orb.co
                      <span className="text-[9px] px-1 rounded bg-indigo-500/20 text-indigo-300">PRO</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Espaço limpo, leve e sem poluição.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="recursos" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Orb.co: Foco, Leveza e Desempenho
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Criado para quem quer conversar e jogar sem distrações nem sobrecarga de recursos desnecessários.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Constelação de Voz</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Anéis orbitais com feedback neon quando alguém fala. Identificação visual imediata de quem está com a palavra.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Partilha sob Demanda</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              A tela de streaming só aparece quando alguém aciona o compartilhamento, mantendo o espaço sempre limpo.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Soundboard Customizado</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dispare efeitos engraçados em tempo real na chamada ou faça upload de áudios próprios com volume individual.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <span>🪐 Orb.co 2026</span>
          <span>•</span>
          <span>Sua nova órbita de voz e amizade</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => openAuthModal('login')} className="hover:text-white transition-colors cursor-pointer">
            Entrar
          </button>
          <span>•</span>
          <button onClick={() => openAuthModal('register')} className="hover:text-white transition-colors cursor-pointer">
            Criar Conta
          </button>
        </div>
      </footer>
    </div>
  );
};
