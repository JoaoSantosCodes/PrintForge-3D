'use client';

import React, { useState } from 'react';
import { Calculator, History, Layers, AlertTriangle } from 'lucide-react';
import NewPrintView from './NewPrintView';
import HistoryView from './HistoryView';

interface ProductionViewProps {
  printers: any[];
  filaments: any[];
  profiles: any[];
  customers: any[];
  jobs: any[];
  settings: any;
  prefilledProduct: any;
  onSaveJob: (job: any) => void;
  onAddCustomer: (customer: any) => void;
  onAddFilament: (filament: any) => void;
  onClearPrefilledProduct: () => void;
  onDeleteJob: (jobId: string) => void;
}

export default function ProductionView(props: ProductionViewProps) {
  const [subTab, setSubTab] = useState<'calculator' | 'kanban' | 'history' | 'failures'>('calculator');

  return (
    <div className="space-y-6">
      {/* Sub-tabs header */}
      <div className="flex border-b border-border/80 gap-6 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('calculator')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'calculator' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Calculadora
        </button>
        <button
          onClick={() => setSubTab('kanban')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'kanban' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          Quadro Kanban
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'history' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico
        </button>
        <button
          onClick={() => setSubTab('failures')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'failures' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Falhas
        </button>
      </div>

      {/* Render sub-view */}
      {subTab === 'calculator' && (
        <NewPrintView 
          printers={props.printers}
          filaments={props.filaments}
          profiles={props.profiles}
          customers={props.customers}
          settings={props.settings}
          prefilledProduct={props.prefilledProduct}
          onSaveJob={props.onSaveJob}
          onAddCustomer={props.onAddCustomer}
          onAddFilament={props.onAddFilament}
          onClearPrefilledProduct={props.onClearPrefilledProduct}
        />
      )}

      {subTab === 'kanban' && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-xs space-y-2">
          <p className="font-semibold text-foreground text-sm">Quadro Kanban de Produção</p>
          <p>Seus pedidos cadastrados serão distribuídos nas raias operacionais de fatiamento, impressão e acabamento aqui.</p>
          <div className="mt-4 p-4 border border-dashed border-border/80 rounded-xl bg-muted/10 max-w-sm mx-auto">
            Em desenvolvimento na Sprint 4...
          </div>
        </div>
      )}

      {subTab === 'history' && (
        <HistoryView 
          jobs={props.jobs}
          printers={props.printers}
          filaments={props.filaments}
          customers={props.customers}
          onDeleteJob={props.onDeleteJob}
        />
      )}

      {subTab === 'failures' && (
        <HistoryView 
          jobs={props.jobs.filter(j => j.failed)}
          printers={props.printers}
          filaments={props.filaments}
          customers={props.customers}
          onDeleteJob={props.onDeleteJob}
        />
      )}
    </div>
  );
}
