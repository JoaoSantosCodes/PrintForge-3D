'use client';

import React, { useState } from 'react';
import { Product, Filament } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShoppingBag, 
  Scale, 
  Clock, 
  Layers, 
  Save, 
  X,
  Play
} from 'lucide-react';
import { formatCurrency, formatMinutes } from '@/lib/utils';
import { TabType } from '../LayoutShell';

interface ProductsViewProps {
  products: Product[];
  filaments: Filament[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
  onSellProduct: (product: Product) => void;
}

export default function ProductsView({
  products,
  filaments,
  onSave,
  onDelete,
  onSellProduct
}: ProductsViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const handleNewProduct = () => {
    setEditingProduct({
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      name: '',
      weightG: 120,
      printTimeMins: 540,
      defaultFilamentId: filaments[0]?.id || '',
      suggestedPrice: 38.00,
      description: ''
    });
    setIsEditing(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditing(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name) {
      onSave(editingProduct as Product);
      setIsEditing(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Produtos Rápidos</h1>
          <p className="text-muted-foreground text-sm">Cadastre peças com pesos e tempos conhecidos para gerar orçamentos em 1 clique.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        )}
      </div>

      {isEditing && editingProduct && (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl mx-auto shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-5">
            <h3 className="font-outfit font-bold text-lg text-gradient-accent-text">
              {editingProduct.createdAt ? 'Editar Produto Salvo' : 'Novo Produto para Catálogo'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Nome do Produto *</label>
                <input 
                  type="text" 
                  required
                  value={editingProduct.name || ''} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Ex: Miniatura Dragão Articulado"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Peso Médio Estimado (Gramas) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={editingProduct.weightG ?? 120} 
                  onChange={e => setEditingProduct({...editingProduct, weightG: parseInt(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Tempo Estimado (Minutos) *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={editingProduct.printTimeMins ?? 540} 
                  onChange={e => setEditingProduct({...editingProduct, printTimeMins: parseInt(e.target.value) || 0})}
                  placeholder="Ex: 540 (para 9 horas)"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Filamento Recomendado</label>
                <select 
                  value={editingProduct.defaultFilamentId || ''} 
                  onChange={e => setEditingProduct({...editingProduct, defaultFilamentId: e.target.value})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Nenhum</option>
                  {filaments.map(f => <option key={f.id} value={f.id}>{f.brand} - {f.type} ({f.colorName})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Preço de Venda Padrão (R$) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={editingProduct.suggestedPrice ?? 38.00} 
                  onChange={e => setEditingProduct({...editingProduct, suggestedPrice: parseFloat(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Descrição do Item</label>
                <textarea 
                  value={editingProduct.description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  placeholder="Ex: Miniatura articulada clássica com 120g de peso. Ótima saída para feiras de artesanato."
                  rows={3}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => {
          const filament = filaments.find(f => f.id === product.defaultFilamentId);

          return (
            <div 
              key={product.id} 
              className="bg-card border border-border hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <h3 className="font-outfit font-bold text-base leading-tight group-hover:text-violet-400 transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Preço base pré-precificado</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3.5 border-y border-border/60 my-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Peso Médio</p>
                      <p className="font-semibold text-foreground">{product.weightG}g</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Tempo Médio</p>
                      <p className="font-semibold text-foreground">{formatMinutes(product.printTimeMins)}</p>
                    </div>
                  </div>
                </div>

                {filament && (
                  <div className="flex items-center gap-2 mb-3 text-xs bg-muted/20 border border-border/40 rounded-lg px-2.5 py-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/10" 
                      style={{ backgroundColor: filament.colorHex }}
                    ></span>
                    <span className="text-muted-foreground text-[10.5px]">
                      Recomendado: <strong className="text-foreground">{filament.brand} ({filament.type})</strong>
                    </span>
                  </div>
                )}

                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic mb-2 bg-muted/10 p-2 rounded-lg">
                    "{product.description}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/40 mt-3">
                <span className="text-sm font-extrabold text-white">{formatCurrency(product.suggestedPrice)}</span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onSellProduct(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600 hover:text-white rounded-lg text-xs font-semibold text-violet-400 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Vender
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir produto ${product.name}?`)) {
                        onDelete(product.id);
                      }
                    }}
                    className="p-1.5 border border-transparent hover:border-destructive/30 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
