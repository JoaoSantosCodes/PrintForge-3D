'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, DollarSign, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FinanceViewProps {
  jobs: any[];
  settings: any;
}

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export default function FinanceView({ jobs, settings }: FinanceViewProps) {
  const [subTab, setSubTab] = useState<'dre' | 'cashflow' | 'fixed-costs'>('dre');

  // Load fixed expenses from localStorage or seed defaults
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('printforge_fixed_expenses');
      if (stored) return JSON.parse(stored);
    }
    return [
      { id: '1', name: 'Aluguel do Espaço', amount: 350.00, category: 'rent' },
      { id: '2', name: 'Internet Banda Larga', amount: 100.00, category: 'internet' },
      { id: '3', name: 'Licença OrcaSlicer/CAD', amount: 50.00, category: 'software' },
      { id: '4', name: 'Guia Mensal MEI', amount: 72.00, category: 'tax' },
      { id: '5', name: 'Baseline Pro-labore', amount: 800.00, category: 'salary' },
    ];
  });

  // Save fixed expenses to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('printforge_fixed_expenses', JSON.stringify(fixedExpenses));
    }
  }, [fixedExpenses]);

  // Form states for new fixed expense
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(0);
  const [newCategory, setNewCategory] = useState('rent');

  const handleAddFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newAmount <= 0) return;
    const item: FixedExpense = {
      id: 'fe-' + Math.random().toString(36).substr(2, 9),
      name: newName,
      amount: newAmount,
      category: newCategory
    };
    setFixedExpenses([...fixedExpenses, item]);
    setNewName('');
    setNewAmount(0);
  };

  const handleDeleteFixedExpense = (id: string) => {
    setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
  };

  // 1. DRE Calculations
  const successfulJobs = jobs.filter(j => !j.failed);
  
  // Receita Bruta
  const revenueBruta = successfulJobs.reduce((acc, j) => acc + (j.finalPrice * j.qty), 0);
  
  // Deduções (Impostos + Comissões + Taxas Fixas de Marketplace)
  const deductions = successfulJobs.reduce((acc, j) => {
    const taxValue = (j.taxPercent / 100) * j.finalPrice;
    const commissionValue = (j.marketplaceFeePercent / 100) * j.finalPrice + j.marketplaceFixedFee;
    return acc + ((taxValue + commissionValue) * j.qty);
  }, 0);

  // Receita Líquida
  const revenueLiquida = revenueBruta - deductions;

  // Custos Variáveis de Produção
  const costMaterial = successfulJobs.reduce((acc, j) => acc + (j.materialCost * j.qty), 0);
  const costEnergy = successfulJobs.reduce((acc, j) => acc + (j.energyCost * j.qty), 0);
  const costPackaging = successfulJobs.reduce((acc, j) => acc + (j.packagingCost * j.qty), 0);
  const costExtras = successfulJobs.reduce((acc, j) => acc + (j.extraCostsAmount * j.qty), 0);
  const costPainting = successfulJobs.reduce((acc, j) => {
    const paintMins = j.paintingTimeMins || 0;
    const labor = (paintMins / 60) * (j.paintingLaborRate || 0);
    const paints = j.paintCost || 0;
    const airbrush = j.airbrushCost || 0;
    return acc + ((labor + paints + airbrush) * j.qty);
  }, 0);

  const totalVariableCosts = costMaterial + costEnergy + costPackaging + costExtras + costPainting;

  // Margem de Contribuição
  const contributionMargin = revenueLiquida - totalVariableCosts;

  // Custos Fixos (Overhead Mensal) + Depreciação de Máquina (Retenção técnica de caixa)
  const monthlyFixedOverhead = fixedExpenses.reduce((acc, e) => acc + e.amount, 0);
  const machineDepreciation = successfulJobs.reduce((acc, j) => acc + (j.depreciationCost * j.qty), 0);
  const totalFixedCosts = monthlyFixedOverhead + machineDepreciation;

  // Lucro Líquido
  const netProfit = contributionMargin - totalFixedCosts;
  const netMarginPercent = revenueBruta > 0 ? (netProfit / revenueBruta) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Sub-tabs header */}
      <div className="flex border-b border-border/80 gap-6 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('dre')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'dre' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          DRE Simplificado
        </button>
        <button
          onClick={() => setSubTab('cashflow')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'cashflow' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setSubTab('fixed-costs')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'fixed-costs' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Custos Fixos Mensais
        </button>
      </div>

      {/* Render sub-view */}
      {subTab === 'dre' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-outfit font-bold text-base text-gradient-accent-text">DRE - Demonstração do Resultado do Exercício</h3>
              <p className="text-xs text-muted-foreground">Visão financeira consolidada baseada nos trabalhos concluídos no histórico.</p>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              <div className="flex justify-between py-2.5 font-bold text-foreground">
                <span>(+) RECEITA BRUTA OPERACIONAL</span>
                <span>{formatCurrency(revenueBruta)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-muted-foreground">
                <span className="pl-4">(-) Deduções de Venda (Impostos & Marketplace)</span>
                <span>{formatCurrency(deductions)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-foreground bg-muted/10 px-2 rounded">
                <span>(=) RECEITA LÍQUIDA</span>
                <span>{formatCurrency(revenueLiquida)}</span>
              </div>
              
              <div className="py-2 space-y-1.5 pl-4 text-muted-foreground">
                <p className="text-[10px] uppercase font-bold text-foreground/80 mt-1">Detalhamento de Custos Variáveis</p>
                <div className="flex justify-between pl-2"><span>- Matéria-Prima (Filamento)</span> <span>{formatCurrency(costMaterial)}</span></div>
                <div className="flex justify-between pl-2"><span>- Energia das Impressoras</span> <span>{formatCurrency(costEnergy)}</span></div>
                <div className="flex justify-between pl-2"><span>- Pós-Processamento e Tintas</span> <span>{formatCurrency(costPainting)}</span></div>
                <div className="flex justify-between pl-2"><span>- Embalagens de Envios</span> <span>{formatCurrency(costPackaging)}</span></div>
                <div className="flex justify-between pl-2"><span>- Ferragens & Adicionais</span> <span>{formatCurrency(costExtras)}</span></div>
              </div>

              <div className="flex justify-between py-2.5 text-muted-foreground font-semibold">
                <span className="pl-4">(-) TOTAL CUSTOS VARIÁVEIS</span>
                <span>{formatCurrency(totalVariableCosts)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-foreground bg-muted/10 px-2 rounded">
                <span>(=) MARGEM DE CONTRIBUIÇÃO</span>
                <span>{formatCurrency(contributionMargin)}</span>
              </div>

              <div className="py-2 space-y-1.5 pl-4 text-muted-foreground">
                <p className="text-[10px] uppercase font-bold text-foreground/80 mt-1">Detalhamento de Custos Fixos</p>
                <div className="flex justify-between pl-2"><span>- Custos Fixos Mensais (Overhead)</span> <span>{formatCurrency(monthlyFixedOverhead)}</span></div>
                <div className="flex justify-between pl-2"><span>- Depreciação de Máquina (Retenção Técnica)</span> <span>{formatCurrency(machineDepreciation)}</span></div>
              </div>

              <div className="flex justify-between py-2.5 text-muted-foreground font-semibold">
                <span className="pl-4">(-) TOTAL CUSTOS FIXOS</span>
                <span>{formatCurrency(totalFixedCosts)}</span>
              </div>
              <div className="flex justify-between py-3 font-extrabold text-white bg-violet-600/10 border-t border-violet-500/20 px-2 rounded mt-2 text-sm">
                <span>(=) RESULTADO LÍQUIDO DO PERÍODO</span>
                <span className={netProfit >= 0 ? "text-emerald-400" : "text-destructive"}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Margem Líquida Geral:</span>
                <span className={`font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {netMarginPercent.toFixed(1)}%
                </span>
              </div>
              <div className="bg-muted/10 border border-border/40 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Retenção de Depreciação (Fundo Caixa Máquinas):</span>
                <span className="font-bold text-cyan-400">{formatCurrency(machineDepreciation)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-outfit font-bold text-base text-gradient-accent-text">Fluxo de Caixa</h3>
                <p className="text-xs text-muted-foreground">Histórico cronológico de entradas de vendas e saídas de despesas do ateliê.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Saldo Operacional</span>
                <span className={`font-outfit font-bold text-lg ${revenueBruta - totalVariableCosts - monthlyFixedOverhead >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                  {formatCurrency(revenueBruta - totalVariableCosts - monthlyFixedOverhead)}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {/* Fixed expenses as outflows */}
              {fixedExpenses.map((exp) => (
                <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground">Custo Fixo Recorrente • Mensal</p>
                  </div>
                  <span className="font-bold text-destructive">-{formatCurrency(exp.amount)}</span>
                </div>
              ))}

              {/* Jobs as inflows */}
              {jobs.map((job) => {
                const totalCost = job.totalCost * job.qty;
                const revenue = job.failed ? 0 : job.finalPrice * job.qty;
                return (
                  <div key={job.id} className="flex justify-between items-center p-3 rounded-xl bg-card border border-border text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-white">{job.name} {job.qty > 1 && `(${job.qty}x)`}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')} • {job.failed ? 'Falha' : 'Sucesso'}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      {revenue > 0 && <p className="font-bold text-emerald-400">+{formatCurrency(revenue)}</p>}
                      <p className="text-[10px] text-muted-foreground">Custo Prod: -{formatCurrency(totalCost)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'fixed-costs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
            <div>
              <h3 className="font-outfit font-bold text-base text-gradient-accent-text">Cadastro de Custos Fixos</h3>
              <p className="text-xs text-muted-foreground">Custos recorrentes que mantêm o seu ateliê aberto, independentemente do volume impresso.</p>
            </div>

            <div className="divide-y divide-border/60">
              {fixedExpenses.map((exp) => (
                <div key={exp.id} className="flex justify-between items-center py-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">{exp.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">Categoria: {exp.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatCurrency(exp.amount)}</span>
                    <button 
                      onClick={() => handleDeleteFixedExpense(exp.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-xs font-bold bg-muted/10 p-3 rounded-xl">
              <span>Soma dos Custos Fixos Mensais:</span>
              <span className="text-sm text-gradient-accent-text">{formatCurrency(monthlyFixedOverhead)}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit">
            <h3 className="font-outfit font-bold text-sm">Adicionar Custo Fixo</h3>
            <form onSubmit={handleAddFixedExpense} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Descrição / Nome</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Assinatura Fusion 360"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Valor Mensal (R$)</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="0"
                  value={newAmount || ''}
                  onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none text-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Categoria</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="rent">Aluguel / Espaço</option>
                  <option value="internet">Internet / Energia Geral</option>
                  <option value="software">Software / Licenças</option>
                  <option value="tax">Impostos / MEI</option>
                  <option value="salary">Pro-labore / Salários</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Custo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
