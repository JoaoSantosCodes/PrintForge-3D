'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  ShoppingBag,
  Award,
  Calendar,
  BarChart as BarIcon,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { PrintJob, Printer, Filament } from '@/types';
import { formatCurrency, formatMinutes } from '@/lib/utils';

interface ReportsViewProps {
  jobs: PrintJob[];
  printers: Printer[];
  filaments: Filament[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function ReportsView({
  jobs,
  printers,
  filaments
}: ReportsViewProps) {
  const successfulJobs = jobs.filter(j => !j.failed);

  // 1. KPIs Calculations
  const totalRevenue = successfulJobs.reduce((acc, j) => acc + (j.finalPrice * j.qty), 0);
  const totalCosts = jobs.reduce((acc, j) => acc + (j.totalCost * j.qty), 0);
  const netProfit = totalRevenue - totalCosts;
  
  const totalHours = Math.round(jobs.reduce((acc, j) => acc + (j.printTimeMins * j.qty), 0) / 60);

  // Find most used filament type
  const filamentConsumption: { [key: string]: number } = {};
  jobs.forEach(job => {
    const fil = filaments.find(f => f.id === job.filamentId);
    const type = fil ? fil.type : 'Outros';
    filamentConsumption[type] = (filamentConsumption[type] || 0) + (job.weightG * job.qty);
  });

  let topFilamentType = 'Nenhum';
  let maxFilGrams = 0;
  Object.keys(filamentConsumption).forEach(type => {
    if (filamentConsumption[type] > maxFilGrams) {
      maxFilGrams = filamentConsumption[type];
      topFilamentType = type;
    }
  });

  // Find best selling product name
  const productSales: { [key: string]: number } = {};
  successfulJobs.forEach(job => {
    productSales[job.name] = (productSales[job.name] || 0) + job.qty;
  });

  let topProductName = 'Nenhum';
  let maxProductQty = 0;
  Object.keys(productSales).forEach(name => {
    if (productSales[name] > maxProductQty) {
      maxProductQty = productSales[name];
      topProductName = name;
    }
  });

  // 2. Charts Data formatting
  // A. Monthly Bar Chart
  const getMonthlyBarData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    // Group by month
    const dataMap = months.map((m, idx) => ({
      name: m,
      Receita: 0,
      Despesas: 0,
      Lucro: 0,
      monthIndex: idx
    }));

    jobs.forEach(job => {
      const date = new Date(job.createdAt);
      if (date.getFullYear() === currentYear) {
        const mIdx = date.getMonth();
        if (!job.failed) {
          dataMap[mIdx].Receita += job.finalPrice * job.qty;
          dataMap[mIdx].Lucro += job.netProfit * job.qty;
        } else {
          dataMap[mIdx].Lucro += job.netProfit * job.qty;
        }
        dataMap[mIdx].Despesas += job.totalCost * job.qty;
      }
    });

    // Strip decimals
    return dataMap.map(d => ({
      name: d.name,
      Receita: Number(d.Receita.toFixed(2)),
      Despesas: Number(d.Despesas.toFixed(2)),
      Lucro: Number(d.Lucro.toFixed(2))
    }));
  };

  const monthlyBarData = getMonthlyBarData();

  // B. Filament type Pie Chart data
  const filamentPieData = Object.keys(filamentConsumption).map(type => ({
    name: type,
    value: Math.round(filamentConsumption[type])
  }));

  // C. Printer Utilization (Hours printed)
  const printerBarData = printers.map(p => {
    const pJobs = jobs.filter(j => j.printerId === p.id);
    const hrs = Math.round(pJobs.reduce((acc, j) => acc + (j.printTimeMins * j.qty), 0) / 60);
    return {
      name: p.name,
      Horas: hrs
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Relatórios & Insights</h1>
          <p className="text-muted-foreground text-sm">Visualize o desempenho geral do seu negócio de impressão 3D.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          Ano Base: {new Date().getFullYear()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-violet-500/25 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Receita Bruta</span>
            <span className="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-outfit font-bold">{formatCurrency(totalRevenue)}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ano corrido</p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/25 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Despesas Totais</span>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-outfit font-bold text-destructive">{formatCurrency(totalCosts)}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Filamento, energia e extras</p>
          </div>
        </div>

        {/* Hours Printed */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/25 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Horas Impressas</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-outfit font-bold">{totalHours}h</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Tempo em funcionamento</p>
          </div>
        </div>

        {/* Best seller */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-500/25 transition-all">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Mais Vendido</span>
            <span className="p-1.5 bg-muted text-muted-foreground rounded-lg"><Award className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm md:text-base font-outfit font-bold truncate" title={topProductName}>{topProductName}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Vendido {maxProductQty}x</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Expenses BarChart */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-outfit font-bold text-base">Faturamento Anual</h3>
              <p className="text-xs text-muted-foreground">Comparativo de faturamento e despesas por mês</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span> Receita</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Despesas</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '8px' }}
                  labelStyle={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Bar dataKey="Receita" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filament Type Distribution PieChart */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
          <div>
            <h3 className="font-outfit font-bold text-base">Consumo de Filamento</h3>
            <p className="text-xs text-muted-foreground">Distribuição de consumo em gramas por tipo de material</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {filamentPieData.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados suficientes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filamentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {filamentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}g`, 'Consumo']}
                    contentStyle={{ backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '8px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Printer Utilization BarChart */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 lg:col-span-3 space-y-4">
          <div>
            <h3 className="font-outfit font-bold text-base">Utilização das Impressoras</h3>
            <p className="text-xs text-muted-foreground">Total de horas impressas acumuladas por máquina</p>
          </div>
          <div className="h-56 w-full">
            {printerBarData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center">Nenhuma impressora registrada</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={printerBarData} layout="vertical" margin={{ top: 5, right: 5, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [`${value}h`, 'Tempo de Uso']}
                    contentStyle={{ backgroundColor: '#121214', border: '1px solid #27272a', borderRadius: '8px' }}
                  />
                  <Bar dataKey="Horas" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
