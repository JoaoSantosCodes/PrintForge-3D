'use client';

import React, { useState } from 'react';
import { Filament } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Tag, 
  Coins, 
  Scale, 
  BarChart, 
  Save, 
  X,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { formatCurrency, getFilamentLength } from '@/lib/utils';

interface FilamentsViewProps {
  filaments: Filament[];
  onSave: (filament: Filament) => void;
  onDelete: (id: string) => void;
}

export default function FilamentsView({
  filaments,
  onSave,
  onDelete
}: FilamentsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Partial<Filament> | null>(null);

  const handleNewFilament = () => {
    setEditingFilament({
      id: 'fil-' + Math.random().toString(36).substr(2, 9),
      brand: '',
      type: 'PLA',
      colorName: '',
      colorHex: '#8b5cf6',
      weightG: 1000,
      price: 95.00,
      currentStockG: 1000
    });
    setIsEditing(true);
  };

  const handleEditFilament = (filament: Filament) => {
    setEditingFilament({ ...filament });
    setIsEditing(true);
  };

  const handleSaveFilament = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFilament && editingFilament.brand && editingFilament.colorName) {
      onSave(editingFilament as Filament);
      setIsEditing(false);
      setEditingFilament(null);
    }
  };

  // Adjust stock weight quickly
  const handleQuickStockAdjust = (filament: Filament, amountG: number) => {
    const newStock = Math.max(0, Math.min(filament.weightG, filament.currentStockG + amountG));
    onSave({
      ...filament,
      currentStockG: newStock
    });
  };

  const filamentTypes = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Resina', 'Outro'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Filamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie seu estoque de bobinas, cores e custo por grama de insumo.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewFilament}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Filamento
          </button>
        )}
      </div>

      {isEditing && editingFilament && (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl mx-auto shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-5">
            <h3 className="font-outfit font-bold text-lg text-gradient-accent-text">
              {editingFilament.createdAt ? 'Editar Filamento' : 'Novo Filamento'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveFilament} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Marca *</label>
                <input 
                  type="text" 
                  required
                  value={editingFilament.brand || ''} 
                  onChange={e => setEditingFilament({...editingFilament, brand: e.target.value})}
                  placeholder="Ex: 3D Fila"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Tipo de Material</label>
                <select 
                  value={editingFilament.type || 'PLA'} 
                  onChange={e => setEditingFilament({...editingFilament, type: e.target.value})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {filamentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nome da Cor *</label>
                <input 
                  type="text" 
                  required
                  value={editingFilament.colorName || ''} 
                  onChange={e => setEditingFilament({...editingFilament, colorName: e.target.value})}
                  placeholder="Ex: Preto Premium"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-xs font-semibold text-muted-foreground mb-1.5">Cor para Pré-visualização</label>
                <div className="flex gap-2.5 items-center">
                  <input 
                    type="color" 
                    value={editingFilament.colorHex || '#8b5cf6'} 
                    onChange={e => setEditingFilament({...editingFilament, colorHex: e.target.value})}
                    className="w-10 h-9 p-0 bg-transparent border-0 cursor-pointer rounded-lg"
                  />
                  <input 
                    type="text"
                    value={editingFilament.colorHex || ''}
                    onChange={e => setEditingFilament({...editingFilament, colorHex: e.target.value})}
                    placeholder="#ffffff"
                    className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Peso Líquido do Rolo (Gramas) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={editingFilament.weightG ?? 1000} 
                  onChange={e => setEditingFilament({...editingFilament, weightG: parseInt(e.target.value) || 1000})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Preço Total do Rolo (R$) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={editingFilament.price ?? 95.00} 
                  onChange={e => setEditingFilament({...editingFilament, price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Estoque Atual Restante (Gramas)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max={editingFilament.weightG || 1000}
                  value={editingFilament.currentStockG ?? 1000} 
                  onChange={e => setEditingFilament({...editingFilament, currentStockG: parseInt(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
                Salvar Filamento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filaments.map((filament) => {
          const pricePerGram = filament.price / filament.weightG;
          const totalMeters = getFilamentLength(filament.weightG, filament.type);
          const pricePerMeter = totalMeters > 0 ? filament.price / totalMeters : 0;
          const stockPercent = Math.round((filament.currentStockG / filament.weightG) * 100);
          const isLow = stockPercent < 20;
          const stockMeters = getFilamentLength(filament.currentStockG, filament.type);

          return (
            <div 
              key={filament.id} 
              className="bg-card border border-border hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-7 h-7 rounded-full border border-white/20 shadow-inner flex-shrink-0" 
                      style={{ backgroundColor: filament.colorHex }}
                    ></span>
                    <div>
                      <h3 className="font-outfit font-bold text-base leading-tight group-hover:text-violet-400 transition-colors">
                        {filament.brand} - {filament.type}
                      </h3>
                      <p className="text-xs text-muted-foreground">{filament.colorName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground tracking-wide uppercase">
                    {filament.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-4 border-y border-border/60 my-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Preço p/ Grama</p>
                      <p className="font-semibold text-foreground">{formatCurrency(pricePerGram)} <span className="text-[9px] text-muted-foreground">(g)</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-violet-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Preço p/ Metro</p>
                      <p className="font-semibold text-foreground">{formatCurrency(pricePerMeter)} <span className="text-[9px] text-muted-foreground">(m)</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Peso / Comprimento</p>
                      <p className="font-semibold text-foreground">{filament.weightG}g <span className="text-[10px] text-muted-foreground">(~{totalMeters}m)</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Preço Pago</p>
                      <p className="font-semibold text-foreground">{formatCurrency(filament.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Stock tracker */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-muted-foreground">Estoque Restante:</span>
                    <span className={isLow ? 'text-destructive font-bold' : 'text-muted-foreground font-semibold'}>
                      {filament.currentStockG}g / {filament.weightG}g (~{stockMeters}m)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-destructive' : stockPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${stockPercent}%` }}
                    ></div>
                  </div>
                  
                  {/* Quick Adjust buttons */}
                  <div className="flex gap-2 items-center justify-between text-[11px] pt-1">
                    <span className="text-muted-foreground">Ajuste rápido:</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleQuickStockAdjust(filament, -50)}
                        className="p-1 hover:text-white hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Remover 50g"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleQuickStockAdjust(filament, -10)}
                        className="p-1 hover:text-white hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Remover 10g"
                      >
                        -10g
                      </button>
                      <button 
                        onClick={() => handleQuickStockAdjust(filament, 10)}
                        className="p-1 hover:text-white hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Adicionar 10g"
                      >
                        +10g
                      </button>
                      <button 
                        onClick={() => handleQuickStockAdjust(filament, 50)}
                        className="p-1 hover:text-white hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="Adicionar 50g"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border/40 mt-3">
                <button
                  onClick={() => handleEditFilament(filament)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir filamento ${filament.brand} ${filament.type}?`)) {
                      onDelete(filament.id);
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
