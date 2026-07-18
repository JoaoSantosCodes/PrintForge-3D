'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Lock, UserPlus, LogIn, Database, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onSkipAuth: () => void;
}

export default function LoginScreen({ onLoginSuccess, onSkipAuth }: LoginScreenProps) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.session) {
          // Logged in immediately
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          onLoginSuccess(data.session.user);
        } else {
          setSuccessMsg('Cadastro realizado! Por favor, verifique sua caixa de e-mail para confirmação.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      console.error('Auth error: ', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao processar a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-card/40 backdrop-blur-md border border-border/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        {/* Glow Line Top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>

        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-violet-500/10 text-violet-400 rounded-2xl border border-violet-500/20 mb-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-violet-400 fill-none stroke-current stroke-2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-outfit font-extrabold tracking-tight text-white">
            PrintForge <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">3D</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            A calculadora de custos e painel inteligente de impressão 3D
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {errorMsg && (
            <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl items-start animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl items-start">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">E-mail *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none text-white focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">Senha *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none text-white focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-accent hover:opacity-95 text-white font-bold text-sm shadow-xl hover:shadow-violet-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Criar Minha Conta
              </>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        {/* Toggles and Skip Options */}
        <div className="space-y-3 pt-2">
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
            >
              {isSignUp ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Cadastre-se gratuitamente'}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-[10px] text-muted-foreground uppercase font-bold">Ou</span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          <button
            onClick={onSkipAuth}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground font-semibold text-xs transition-all active:scale-[0.98]"
          >
            <Database className="w-4 h-4" />
            Continuar sem cadastro (Modo Local / Offline)
          </button>
        </div>
      </div>
    </div>
  );
}
