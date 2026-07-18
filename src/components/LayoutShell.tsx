'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  History, 
  Palette, 
  Printer, 
  Sliders, 
  Users, 
  ShoppingBag, 
  Settings, 
  Menu, 
  X, 
  Database, 
  LogOut,
  User,
  Plus,
  AlertTriangle,
  Layers,
  Package,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 
  | 'dashboard' 
  | 'production' 
  | 'inventory' 
  | 'printers' 
  | 'crm' 
  | 'products' 
  | 'finance' 
  | 'settings';

interface LayoutShellProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export default function LayoutShell({
  children,
  activeTab,
  setActiveTab,
  userEmail = 'maker@printforge.com',
  onLogout
}: LayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [dbMode, setDbMode] = useState('local');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    setDbMode(localStorage.getItem('printforge_db_mode') || 'local');

    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  interface MenuItem {
    readonly id: TabType;
    readonly label: string;
    readonly icon: React.ComponentType<any>;
    readonly highlight?: boolean;
  }

  const menuItems: readonly MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Produção', icon: Layers, highlight: true },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'printers', label: 'Impressoras', icon: Printer },
    { id: 'crm', label: 'Clientes (CRM)', icon: Users },
    { id: 'products', label: 'Produtos', icon: ShoppingBag },
    { id: 'finance', label: 'Financeiro', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Items visible on the main mobile bottom bar (max 4 + 'more')
  const mobileMainItems = menuItems.filter(item => 
    ['dashboard', 'production', 'inventory', 'finance'].includes(item.id)
  );

  const mobileExtraItems = menuItems.filter(item => 
    !['dashboard', 'production', 'inventory', 'finance'].includes(item.id)
  );

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isOnline && (
        <div className="w-full bg-amber-500 text-black py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 z-50 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          Você está operando offline. As alterações serão salvas localmente e sincronizadas quando restabelecido.
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-effect border-b border-border flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-between p-1.5 shadow-md shadow-violet-500/25">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-current stroke-2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="font-outfit font-bold text-lg md:text-xl tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              PrintForge <span className="font-light">3D</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          {!isOnline ? (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Modo Offline (Local)
            </div>
          ) : dbMode === 'supabase' ? (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></span>
              Nuvem Sincronizada
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Modo Local (Navegador)
            </div>
          )}

          {/* User info */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium text-violet-400">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold max-w-[120px] truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Maker Master</p>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card/40 flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group text-left",
                    isActive 
                      ? "text-white bg-violet-600/15 border-l-2 border-violet-500 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-violet-400" : "text-muted-foreground"
                  )} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Navigation Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border flex justify-around items-center h-16 px-2 shadow-lg">
        {mobileMainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive ? "bg-primary/10 text-primary scale-110" : ""
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMoreMenuOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground",
            moreMenuOpen ? "text-primary" : ""
          )}
        >
          <div className="p-1.5 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span>Mais</span>
        </button>
      </div>

      {/* More Menu Drawer - Mobile */}
      {moreMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl max-h-[80vh] overflow-y-auto p-4 pb-12 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-outfit font-bold text-base text-gradient-accent-text">
                Ferramentas & Cadastros
              </span>
              <button 
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 bg-muted rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 py-2">
              {mobileExtraItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all text-left",
                      isActive
                        ? "border-primary bg-primary/10 text-white font-semibold"
                        : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>PrintForge 3D v1.0</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Dados locais salvos
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
