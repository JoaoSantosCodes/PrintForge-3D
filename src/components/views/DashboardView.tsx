'use client';

import React from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Layers, 
  Printer as PrinterIcon,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Settings
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Printer, Filament, PrintJob } from '@/types';
import { formatCurrency, formatMinutes, cn } from '@/lib/utils';
import { TabType } from '../LayoutShell';

interface DashboardViewProps {
  jobs: PrintJob[];
  printers: Printer[];
  filaments: Filament[];
  setActiveTab: (tab: TabType) => void;
}

export default function DashboardView({
  jobs,
  printers,
  filaments,
  setActiveTab
}: DashboardViewProps) {
  // Calculations
  const totalJobsCount = jobs.length;
  const successfulJobs = jobs.filter(j => !j.failed);
  const failedJobsCount = jobs.filter(j => j.failed).length;
  
  const totalRevenue = successfulJobs.reduce((acc, j) => acc + (j.finalPrice * j.qty), 0);
  const totalCosts = jobs.reduce((acc, j) => acc + (j.totalCost * j.qty), 0);
  const totalProfit = totalRevenue - totalCosts;

  // Let's format chart data: Group jobs by date (last 30 days)
  const getChartData = () => {
    const dataMap: { [dateStr: string]: { receita: number; custos: number; lucro: number } } = {};
    const now = new Date();
    
    // Initialize last 7 days or weeks
    // We will group by week or last 10 dates to fit on small screens easily
    // Let's group by days for the last 15 days
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap[label] = { receita: 0, custos: 0, lucro: 0 };
    }

    jobs.forEach(job => {
      const date = new Date(job.createdAt);
      const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dataMap[label] !== undefined) {
        if (!job.failed) {
          dataMap[label].receita += job.finalPrice * job.qty;
          dataMap[label].lucro += job.netProfit * job.qty;
        } else {
          // If failed, we only add cost (which makes profit negative)
          dataMap[label].lucro += job.netProfit * job.qty; // netProfit is negative cost
        }
        dataMap[label].custos += job.totalCost * job.qty;
      }
    });

    return Object.keys(dataMap).map(key => ({
      name: key,
      Receita: Number(dataMap[key].receita.toFixed(2)),
      Custos: Number(dataMap[key].custos.toFixed(2)),
      Lucro: Number(dataMap[key].lucro.toFixed(2)),
    }));
  };

  const chartData = getChartData();
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">
            Painel Geral
          </h1>
          <p className="text-muted-foreground text-sm">
            Bem-vindo ao seu ateliê de impressão 3D. Veja suas estatísticas consolidadas.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('new-print')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-lg shadow-violet-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Calcular Custo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prints */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl group-hover:bg-violet-600/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impressões</span>
            <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-outfit font-bold">{totalJobsCount}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="text-emerald-400 font-semibold">{successfulJobs.length} Ok</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-destructive font-semibold">{failedJobsCount} Falhas</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-xl group-hover:bg-cyan-600/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receita</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-outfit font-bold">{formatCurrency(totalRevenue)}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Faturamento total</span>
            </div>
          </div>
        </div>

        {/* Total Costs */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-500/30 transition-all duration-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-zinc-600/5 rounded-full blur-xl group-hover:bg-zinc-600/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custos</span>
            <span className="p-2 rounded-lg bg-muted text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-outfit font-bold">{formatCurrency(totalCosts)}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
              <span>Energia, materiais e extras</span>
            </div>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl group-hover:bg-emerald-600/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lucro Líquido</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-3xl font-outfit font-bold text-emerald-400">{formatCurrency(totalProfit)}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-semibold">
              <span>Média de {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}% de margem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Card */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-outfit font-bold text-base md:text-lg">Desempenho Financeiro</h3>
              <p className="text-xs text-muted-foreground">Evolução de custos, receitas e lucros líquidos nos últimos 15 dias</p>
            </div>
            <div className="flex gap-2 text-xs font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> Lucro</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Receita</span>
            </div>
          </div>

          <div className="h-64 md:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Receita" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="Lucro" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorLucro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions & Stock alerts */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-outfit font-bold text-base">Atalhos Rápidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab('filaments')}
                className="flex flex-col items-center gap-2 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-violet-500/20 rounded-xl transition-all text-center"
              >
                <span className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold">Novo Filamento</span>
              </button>

              <button 
                onClick={() => setActiveTab('printers')}
                className="flex flex-col items-center gap-2 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-cyan-500/20 rounded-xl transition-all text-center"
              >
                <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <PrinterIcon className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold">Nova Impressora</span>
              </button>

              <button 
                onClick={() => setActiveTab('customers')}
                className="flex flex-col items-center gap-2 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-emerald-500/20 rounded-xl transition-all text-center"
              >
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Users className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold">Novo Cliente</span>
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className="flex flex-col items-center gap-2 p-3 bg-muted/40 hover:bg-muted border border-border hover:border-zinc-500/20 rounded-xl transition-all text-center"
              >
                <span className="p-2 bg-zinc-500/10 text-zinc-400 rounded-lg">
                  <Settings className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold">Ajustar Tarifas</span>
              </button>
            </div>
          </div>

          {/* Filament Stock Status */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-outfit font-bold text-base">Status de Bobinas</h3>
            <div className="space-y-3">
              {filaments.slice(0, 3).map((fil) => {
                const percent = Math.min(100, Math.round((fil.currentStockG / fil.weightG) * 100));
                const isLow = percent < 20;
                return (
                  <div key={fil.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: fil.colorHex }}></span>
                        <span className="font-semibold">{fil.brand} - {fil.type}</span>
                        <span className="text-[10px] text-muted-foreground">({fil.colorName})</span>
                      </div>
                      <span className={isLow ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                        {fil.currentStockG}g ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          isLow ? "bg-destructive" : percent < 50 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent prints table/list */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-outfit font-bold text-base md:text-lg">Últimos Trabalhos</h3>
            <p className="text-xs text-muted-foreground">Últimos orçamentos e impressões registradas</p>
          </div>
          <button 
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-primary hover:text-violet-400 transition-colors"
          >
            Ver Histórico Completo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-3 font-medium">Nome / Trabalho</th>
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium hidden md:table-cell">Parâmetros</th>
                <th className="pb-3 font-medium text-right">Custo</th>
                <th className="pb-3 font-medium text-right">Venda</th>
                <th className="pb-3 font-medium text-right">Lucro</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/10 group">
                  <td className="py-3.5">
                    <p className="font-semibold text-foreground group-hover:text-violet-400 transition-colors">{job.name}</p>
                    <p className="text-[10px] text-muted-foreground">Qtd: {job.qty}x</p>
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3.5 hidden md:table-cell">
                    <div className="text-[11px] text-muted-foreground">
                      <span>{job.weightG}g</span> • <span>{formatMinutes(job.printTimeMins)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-medium text-muted-foreground">
                    {formatCurrency(job.totalCost * job.qty)}
                  </td>
                  <td className="py-3.5 text-right font-semibold text-foreground">
                    {formatCurrency(job.finalPrice * job.qty)}
                  </td>
                  <td className={cn(
                    "py-3.5 text-right font-bold",
                    job.netProfit >= 0 ? "text-emerald-400" : "text-destructive"
                  )}>
                    {formatCurrency(job.netProfit * job.qty)}
                  </td>
                  <td className="py-3.5">
                    <div className="flex justify-center">
                      {job.failed ? (
                        <span 
                          className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold text-[10px] flex items-center gap-1"
                          title={job.failedReason}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Falhou
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sucesso
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
