'use client';

import React, { useState } from 'react';
import { Printer, PrintJob } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Cpu, 
  Clock, 
  Zap, 
  Wrench, 
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PrintersViewProps {
  printers: Printer[];
  jobs?: PrintJob[];
  onSave: (printer: Printer) => void;
  onDelete: (id: string) => void;
}

export default function PrintersView({
  printers,
  jobs = [],
  onSave,
  onDelete
}: PrintersViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Partial<Printer> | null>(null);

  const handleNewPrinter = () => {
    setEditingPrinter({
      id: 'print-' + Math.random().toString(36).substr(2, 9),
      name: '',
      model: '',
      consumptionWatts: 220,
      price: 2200,
      lifespanHours: 10000,
      annualMaintenanceCost: 350,
      status: 'active'
    });
    setIsEditing(true);
  };

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter({ ...printer });
    setIsEditing(true);
  };

  const handleSavePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrinter && editingPrinter.name && editingPrinter.model) {
      onSave(editingPrinter as Printer);
      setIsEditing(false);
      setEditingPrinter(null);
    }
  };

  const getStatusBadge = (status: Printer['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disponível</span>;
      case 'printing':
        return <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold text-[10px] flex items-center gap-1 animate-pulse"><Play className="w-3 h-3" /> Imprimindo</span>;
      case 'maintenance':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[10px] flex items-center gap-1"><Wrench className="w-3 h-3" /> Manutenção</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-muted-foreground font-semibold text-[10px] flex items-center gap-1"><X className="w-3 h-3" /> Inativa</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Impressoras</h1>
          <p className="text-muted-foreground text-sm">Gerencie seu parque de impressoras 3D e seus custos operacionais.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewPrinter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Impressora
          </button>
        )}
      </div>

      {isEditing && editingPrinter && (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl mx-auto shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-5">
            <h3 className="font-outfit font-bold text-lg text-gradient-accent-text">
              {editingPrinter.createdAt ? 'Editar Impressora' : 'Nova Impressora'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSavePrinter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nome da Impressora *</label>
                <input 
                  type="text" 
                  required
                  value={editingPrinter.name || ''} 
                  onChange={e => setEditingPrinter({...editingPrinter, name: e.target.value})}
                  placeholder="Ex: Ender 3 V3"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Fabricante / Modelo *</label>
                <input 
                  type="text" 
                  required
                  value={editingPrinter.model || ''} 
                  onChange={e => setEditingPrinter({...editingPrinter, model: e.target.value})}
                  placeholder="Ex: Creality"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Consumo Médio (Watts) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={editingPrinter.consumptionWatts ?? 220} 
                  onChange={e => setEditingPrinter({...editingPrinter, consumptionWatts: parseInt(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Valor de Compra (R$) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={editingPrinter.price ?? 2200} 
                  onChange={e => setEditingPrinter({...editingPrinter, price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Vida Útil Estimada (Horas) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={editingPrinter.lifespanHours ?? 10000} 
                  onChange={e => setEditingPrinter({...editingPrinter, lifespanHours: parseInt(e.target.value) || 10000})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Manutenção Anual Estimada (R$) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={editingPrinter.annualMaintenanceCost ?? 350} 
                  onChange={e => setEditingPrinter({...editingPrinter, annualMaintenanceCost: parseFloat(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Status Operacional</label>
                <select 
                  value={editingPrinter.status || 'active'} 
                  onChange={e => setEditingPrinter({...editingPrinter, status: e.target.value as Printer['status']})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">Disponível</option>
                  <option value="printing">Imprimindo</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="inactive">Inativa</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl gradient-accent hover:opacity-90 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Impressora
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {printers.map((printer) => {
          const depPerHour = printer.price / printer.lifespanHours;
          // Annual maintenance per hour: assume an printer runs 2000 hours a year (standard estimation)
          const maintPerHour = printer.annualMaintenanceCost / 2000;
          
          // Compute worked hours from jobs
          const printerJobs = jobs.filter(j => j.printerId === printer.id && !j.failed);
          const totalMinutes = printerJobs.reduce((sum, j) => sum + (j.printTimeMins * j.qty), 0);
          const workedHours = Math.round((totalMinutes / 60) * 10) / 10;
          const wearPercent = Math.min(100, Math.round((workedHours / printer.lifespanHours) * 100));
          const recoveredDep = workedHours * depPerHour;
          
          return (
            <div 
              key={printer.id} 
              className="bg-card border border-border hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                      <Cpu className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <h3 className="font-outfit font-bold text-base leading-tight group-hover:text-violet-400 transition-colors">
                        {printer.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{printer.model}</p>
                    </div>
                  </div>
                  {getStatusBadge(printer.status)}
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-4 border-y border-border/60 my-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Consumo</p>
                      <p className="font-semibold text-foreground">{printer.consumptionWatts}W</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Vida Útil</p>
                      <p className="font-semibold text-foreground">{printer.lifespanHours}h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Depreciação</p>
                      <p className="font-semibold text-foreground">{formatCurrency(depPerHour)}/h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wrench className="w-3.5 h-3.5 text-primary" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Manutenção</p>
                      <p className="font-semibold text-foreground">{formatCurrency(maintPerHour)}/h</p>
                    </div>
                  </div>
                </div>

                {/* Wear & Amortization details */}
                <div className="space-y-2.5 my-3.5 border-t border-border/40 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Uso Acumulado:</span>
                    <span className="font-semibold text-foreground">{workedHours}h trabalhadas</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Investimento Amortizado:</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(recoveredDep)} / {formatCurrency(printer.price)}</span>
                  </div>
                  
                  {/* Wear progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground font-semibold uppercase">Desgaste da Máquina</span>
                      <span className={wearPercent > 80 ? 'text-destructive font-bold' : wearPercent > 50 ? 'text-amber-500 font-bold' : 'text-muted-foreground font-bold'}>
                        {wearPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${wearPercent > 80 ? 'bg-destructive' : wearPercent > 50 ? 'bg-amber-500' : 'bg-violet-500'}`}
                        style={{ width: `${wearPercent || 1}%` }}
                      ></div>
                    </div>
                    {wearPercent > 80 && (
                      <p className="text-[9px] text-destructive font-semibold flex items-center gap-1 mt-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> Manutenção recomendada imediatamente!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => handleEditPrinter(printer)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir impressora ${printer.name}? Isso não apagará o histórico.`)) {
                      onDelete(printer.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 border border-transparent hover:border-destructive/30 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
