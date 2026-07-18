'use client';

import React, { useState } from 'react';
import { PrintProfile, Printer, Filament } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sliders, 
  Layers, 
  Zap, 
  FileText,
  Save, 
  X,
  Printer as PrinterIcon
} from 'lucide-react';

interface ProfilesViewProps {
  profiles: PrintProfile[];
  printers: Printer[];
  filaments: Filament[];
  onSave: (profile: PrintProfile) => void;
  onDelete: (id: string) => void;
}

export default function ProfilesView({
  profiles,
  printers,
  filaments,
  onSave,
  onDelete
}: ProfilesViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<PrintProfile> | null>(null);

  const handleNewProfile = () => {
    setEditingProfile({
      id: 'prof-' + Math.random().toString(36).substr(2, 9),
      name: '',
      printerId: printers[0]?.id || '',
      defaultFilamentId: filaments[0]?.id || '',
      layerHeightMm: 0.20,
      infillPercent: 15,
      speedMms: 80,
      description: ''
    });
    setIsEditing(true);
  };

  const handleEditProfile = (profile: PrintProfile) => {
    setEditingProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile && editingProfile.name && editingProfile.printerId) {
      onSave(editingProfile as PrintProfile);
      setIsEditing(false);
      setEditingProfile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Perfis de Impressão</h1>
          <p className="text-muted-foreground text-sm">Configure perfis de fatiamento rápidos para agilizar seus orçamentos.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewProfile}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-md active:scale-95 transition-all"
            disabled={printers.length === 0}
          >
            <Plus className="w-4 h-4" />
            Novo Perfil
          </button>
        )}
      </div>

      {printers.length === 0 && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex flex-col gap-2 max-w-lg">
          <p className="font-semibold flex items-center gap-2">⚠️ Nenhuma impressora cadastrada!</p>
          <p className="text-xs">Você precisa cadastrar pelo menos uma impressora para criar perfis de fatiamento associados.</p>
        </div>
      )}

      {isEditing && editingProfile && (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl mx-auto shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-5">
            <h3 className="font-outfit font-bold text-lg text-gradient-accent-text">
              {editingProfile.createdAt ? 'Editar Perfil de Fatiamento' : 'Novo Perfil de Fatiamento'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Nome do Perfil *</label>
                <input 
                  type="text" 
                  required
                  value={editingProfile.name || ''} 
                  onChange={e => setEditingProfile({...editingProfile, name: e.target.value})}
                  placeholder="Ex: Perfil Qualidade PLA"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Impressora Associada *</label>
                <select 
                  value={editingProfile.printerId || ''} 
                  onChange={e => setEditingProfile({...editingProfile, printerId: e.target.value})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {printers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Filamento Padrão (Opcional)</label>
                <select 
                  value={editingProfile.defaultFilamentId || ''} 
                  onChange={e => setEditingProfile({...editingProfile, defaultFilamentId: e.target.value})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Nenhum</option>
                  {filaments.map(f => <option key={f.id} value={f.id}>{f.brand} - {f.type} ({f.colorName})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Altura de Camada (mm)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.05"
                  max="1.0"
                  value={editingProfile.layerHeightMm ?? 0.20} 
                  onChange={e => setEditingProfile({...editingProfile, layerHeightMm: parseFloat(e.target.value) || 0.20})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Preenchimento (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={editingProfile.infillPercent ?? 15} 
                  onChange={e => setEditingProfile({...editingProfile, infillPercent: parseInt(e.target.value) || 0})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Velocidade de Impressão (mm/s)</label>
                <input 
                  type="number" 
                  min="10"
                  max="500"
                  value={editingProfile.speedMms ?? 80} 
                  onChange={e => setEditingProfile({...editingProfile, speedMms: parseInt(e.target.value) || 80})}
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Notas / Descrição do Perfil</label>
                <textarea 
                  value={editingProfile.description || ''} 
                  onChange={e => setEditingProfile({...editingProfile, description: e.target.value})}
                  placeholder="Ex: Utilizar com bico de 0.4mm. Boa estabilidade dimensional."
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
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profiles List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {profiles.map((profile) => {
          const printer = printers.find(p => p.id === profile.printerId);
          const filament = filaments.find(f => f.id === profile.defaultFilamentId);

          return (
            <div 
              key={profile.id} 
              className="bg-card border border-border hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Sliders className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <h3 className="font-outfit font-bold text-base leading-tight group-hover:text-violet-400 transition-colors">
                        {profile.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <PrinterIcon className="w-3 h-3" /> {printer?.name || 'Impressora Excluída'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 my-4 text-xs">
                  <div className="text-center p-1.5 bg-muted/40 rounded-lg">
                    <p className="text-[9px] uppercase font-semibold text-muted-foreground">Camada</p>
                    <p className="font-bold text-foreground mt-0.5">{profile.layerHeightMm}mm</p>
                  </div>

                  <div className="text-center p-1.5 bg-muted/40 rounded-lg">
                    <p className="text-[9px] uppercase font-semibold text-muted-foreground">Infill</p>
                    <p className="font-bold text-foreground mt-0.5">{profile.infillPercent}%</p>
                  </div>

                  <div className="text-center p-1.5 bg-muted/40 rounded-lg">
                    <p className="text-[9px] uppercase font-semibold text-muted-foreground">Velocidade</p>
                    <p className="font-bold text-foreground mt-0.5">{profile.speedMms}m/s</p>
                  </div>
                </div>

                {filament && (
                  <div className="flex items-center gap-2 mb-3 text-xs bg-muted/20 border border-border/40 rounded-lg px-2.5 py-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/10" 
                      style={{ backgroundColor: filament.colorHex }}
                    ></span>
                    <span className="text-muted-foreground text-[11px]">
                      Filamento padrão: <strong className="text-foreground">{filament.brand} ({filament.type})</strong>
                    </span>
                  </div>
                )}

                {profile.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic mb-2 bg-muted/10 p-2 rounded-lg">
                    "{profile.description}"
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border/40 mt-3">
                <button
                  onClick={() => handleEditProfile(profile)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir perfil ${profile.name}?`)) {
                      onDelete(profile.id);
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
