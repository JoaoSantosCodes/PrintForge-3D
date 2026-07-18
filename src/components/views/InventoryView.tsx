'use client';

import React, { useState } from 'react';
import { Palette, Box, Package, HelpCircle } from 'lucide-react';
import FilamentsView from './FilamentsView';

interface InventoryViewProps {
  filaments: any[];
  onSaveFilament: (filament: any) => void;
  onDeleteFilament: (filamentId: string) => void;
}

export default function InventoryView(props: InventoryViewProps) {
  const [subTab, setSubTab] = useState<'filaments' | 'paints' | 'materials' | 'packaging'>('filaments');

  return (
    <div className="space-y-6">
      {/* Sub-tabs header */}
      <div className="flex border-b border-border/80 gap-6 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSubTab('filaments')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'filaments' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" />
          Bobinas & Resinas
        </button>
        <button
          onClick={() => setSubTab('paints')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'paints' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Box className="w-4 h-4" />
          Tintas & Primer
        </button>
        <button
          onClick={() => setSubTab('materials')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'materials' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Parafusos & Ímãs
        </button>
        <button
          onClick={() => setSubTab('packaging')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            subTab === 'packaging' 
              ? 'border-primary text-white' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4" />
          Embalagens
        </button>
      </div>

      {/* Render sub-view */}
      {subTab === 'filaments' && (
        <FilamentsView 
          filaments={props.filaments}
          onSave={props.onSaveFilament}
          onDelete={props.onDeleteFilament}
        />
      )}

      {subTab !== 'filaments' && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-xs space-y-2">
          <p className="font-semibold text-foreground text-sm">Módulo em Construção</p>
          <p>O controle inteligente com baixa física automática e movimentações históricas para este insumo está agendado.</p>
          <div className="mt-4 p-4 border border-dashed border-border/80 rounded-xl bg-muted/10 max-w-sm mx-auto">
            Em desenvolvimento na Sprint 5...
          </div>
        </div>
      )}
    </div>
  );
}
