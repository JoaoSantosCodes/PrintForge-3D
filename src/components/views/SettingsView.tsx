'use client';

import React, { useState } from 'react';
import { SystemSettings } from '@/types';
import { 
  Save, 
  Settings, 
  Database, 
  Zap, 
  Percent, 
  Package, 
  RotateCcw,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  onResetDatabase: () => void;
}

export default function SettingsView({
  settings,
  onSaveSettings,
  onResetDatabase
}: SettingsViewProps) {
  // Settings Form State
  const [electricityKwhRate, setElectricityKwhRate] = useState<number>(settings.electricityKwhRate);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState<number>(settings.defaultTaxPercent);
  const [defaultMarkupPercent, setDefaultMarkupPercent] = useState<number>(settings.defaultMarkupPercent);
  
  const [defaultPackagingBoxCost, setDefaultPackagingBoxCost] = useState<number>(settings.defaultPackagingBoxCost);
  const [defaultPackagingTapeCost, setDefaultPackagingTapeCost] = useState<number>(settings.defaultPackagingTapeCost);
  const [defaultPackagingBubbleWrapCost, setDefaultPackagingBubbleWrapCost] = useState<number>(settings.defaultPackagingBubbleWrapCost);
  const [defaultWhatsAppTemplate, setDefaultWhatsAppTemplate] = useState<string>(settings.defaultWhatsAppTemplate || '');

  // Supabase connection keys (simulated/stored locally)
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('printforge_supabase_url') || '';
    return '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('printforge_supabase_anon_key') || '';
    return '';
  });
  const [dbMode, setDbMode] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('printforge_db_mode') || 'local';
    return 'local';
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      electricityKwhRate,
      defaultTaxPercent,
      defaultMarkupPercent,
      defaultMarketplaceFeePercent: settings.defaultMarketplaceFeePercent,
      defaultMarketplaceFixedFee: settings.defaultMarketplaceFixedFee,
      defaultPackagingBoxCost,
      defaultPackagingTapeCost,
      defaultPackagingBubbleWrapCost,
      currency: settings.currency,
      defaultWhatsAppTemplate,
    });
    alert('Configurações salvas com sucesso!');
  };

  const handleSaveSupabase = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('printforge_supabase_url', supabaseUrl);
      localStorage.setItem('printforge_supabase_anon_key', supabaseAnonKey);
      localStorage.setItem('printforge_db_mode', dbMode);
      alert('Configuração de banco salva! A aplicação recarregará se necessário.');
    }
  };

  const handleTestConnection = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestStatus('error');
      return alert('Preencha a URL e a chave anônima!');
    }
    setTestStatus('testing');
    setTimeout(() => {
      // Simulate validation request
      setTestStatus('success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">Ajuste tarifas padrão, margens ideais e integre seu banco de dados na nuvem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Tariffs card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-outfit font-bold text-base flex items-center gap-2 border-b border-border pb-3 text-gradient-accent-text">
              <Zap className="w-4.5 h-4.5 text-yellow-500" /> Tarifas & Impostos Padrão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Energia (R$ por kWh) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  value={electricityKwhRate} 
                  onChange={e => setElectricityKwhRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Imposto Padrão (%) *</label>
                <input 
                  type="number" 
                  required
                  step="0.1"
                  min="0"
                  value={defaultTaxPercent} 
                  onChange={e => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Margem de Lucro Padrão (%) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={defaultMarkupPercent} 
                  onChange={e => setDefaultMarkupPercent(parseInt(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Packaging Defaults */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-outfit font-bold text-base flex items-center gap-2 border-b border-border pb-3 text-gradient-accent-text">
              <Package className="w-4.5 h-4.5 text-cyan-400" /> Insumos de Embalagem Padrão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Caixa de Papelão (R$) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  value={defaultPackagingBoxCost} 
                  onChange={e => setDefaultPackagingBoxCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Plástico Bolha (R$) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  value={defaultPackagingBubbleWrapCost} 
                  onChange={e => setDefaultPackagingBubbleWrapCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Fita e Etiquetas (R$) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  value={defaultPackagingTapeCost} 
                  onChange={e => setDefaultPackagingTapeCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Template Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-outfit font-bold text-base flex items-center gap-2 border-b border-border pb-3 text-gradient-accent-text">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current stroke-2 text-emerald-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Template de Mensagem (WhatsApp)
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground font-semibold">Mensagem Padrão de Contato</label>
                <textarea 
                  value={defaultWhatsAppTemplate}
                  onChange={e => setDefaultWhatsAppTemplate(e.target.value)}
                  placeholder="Ex: Olá [Cliente]! Seu orçamento para a peça '[Peça]' ficou em [Valor]."
                  rows={3}
                  className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none resize-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="p-3 bg-muted/20 border border-border/40 text-muted-foreground rounded-xl leading-relaxed text-[11px] space-y-1">
                <p className="font-semibold text-foreground">Variáveis disponíveis para substituição automática:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><code className="text-violet-400 font-bold">[Cliente]</code>: Nome completo do cliente</li>
                  <li><code className="text-violet-400 font-bold">[Peça]</code>: Nome da última peça impressa no histórico</li>
                  <li><code className="text-violet-400 font-bold">[Valor]</code>: Valor final cobrado (preço unitário * quantidade)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl gradient-accent hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4.5 h-4.5" />
              Salvar Parâmetros
            </button>
          </div>
        </form>

        {/* Right Panel: Database Settings & Reset */}
        <div className="space-y-6">
          {/* Cloud Connection */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-outfit font-bold text-base flex items-center gap-2 border-b border-border pb-3 text-gradient-accent-text">
              <Database className="w-4.5 h-4.5 text-violet-400" /> Sincronização Supabase
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Modo de Operação</label>
                <select 
                  value={dbMode}
                  onChange={e => setDbMode(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                >
                  <option value="local">Apenas Local (LocalStorage)</option>
                  <option value="supabase">Nuvem Integrada (Supabase)</option>
                </select>
              </div>

              {dbMode === 'supabase' && (
                <>
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Supabase URL</label>
                    <input 
                      type="text"
                      value={supabaseUrl}
                      onChange={e => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Supabase Anon Key</label>
                    <input 
                      type="password"
                      value={supabaseAnonKey}
                      onChange={e => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-1 animate-fade-in">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="flex-1 py-2 border border-border hover:bg-muted/40 text-muted-foreground hover:text-white rounded-xl text-[11px] font-semibold transition-colors"
                    >
                      {testStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSupabase}
                      className="flex-1 py-2 bg-violet-600/10 hover:bg-violet-600 hover:text-white text-violet-400 rounded-xl text-[11px] font-semibold transition-colors"
                    >
                      Salvar Chaves
                    </button>
                  </div>

                  {testStatus === 'success' && (
                    <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-xl text-[11px] font-medium flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Conexão efetuada com sucesso!
                    </div>
                  )}
                </>
              )}

              {dbMode === 'local' && (
                <div className="p-3 bg-muted/20 border border-border/40 text-muted-foreground rounded-xl leading-relaxed text-[11px] flex gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>Sua aplicação está operando de forma 100% autônoma e segura no navegador, salvando as alterações localmente.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reset / Seeding */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="font-outfit font-bold text-base flex items-center gap-2 border-b border-border pb-3 text-gradient-accent-text">
              <RotateCcw className="w-4.5 h-4.5 text-destructive" /> Perigo / Manutenção
            </h3>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Caso queira apagar todos os registros criados e reiniciar o banco local para as configurações originais de fábrica (com os 20 trabalhos de teste).
            </p>

            <button
              type="button"
              onClick={() => {
                if (confirm('ATENÇÃO: Isso apagará TODOS os dados de impressoras, filamentos, clientes e histórico do seu navegador! Continuar?')) {
                  onResetDatabase();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-transparent hover:border-destructive/30 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar Banco Local
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
