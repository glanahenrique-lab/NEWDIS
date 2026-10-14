import React, { useState } from 'react';
import { useOrbita } from '../context/OrbitaContext';
import { X, Sparkles, LogIn } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginWithGoogle } = useOrbita();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 flex flex-col animate-fade-in relative text-center">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand */}
        <div className="mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full rounded-2xl bg-[#0e1017] flex items-center justify-center text-2xl">
              🪐
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white">Entrar no Orb.co</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Faça login com seu Gmail para acessar sua conta exclusiva no Orb.co.
          </p>
        </div>

        {/* Google / Gmail Login Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-white/20 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loadingGoogle ? 'Autenticando...' : 'Entrar com Gmail'}</span>
          </button>

          <p className="text-[11px] text-slate-500 leading-tight">
            Seu espaço começará totalmente zerado e privado, pronto para você convidar seus amigos.
          </p>
        </div>
      </div>
    </div>
  );
};
