'use client';

import React, { useState } from 'react';
import { Customer, PrintJob, SystemSettings } from '@/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  User, 
  Phone, 
  MessageSquare, 
  MapPin, 
  FileText, 
  ShoppingBag,
  Save, 
  X,
  Copy,
  Check
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CustomersViewProps {
  customers: Customer[];
  jobs: PrintJob[];
  settings?: SystemSettings;
  onSave: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export default function CustomersView({
  customers,
  jobs,
  settings,
  onSave,
  onDelete
}: CustomersViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleNewCustomer = () => {
    setEditingCustomer({
      id: 'cust-' + Math.random().toString(36).substr(2, 9),
      name: '',
      phone: '',
      instagram: '',
      address: '',
      notes: ''
    });
    setIsEditing(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setIsEditing(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer && editingCustomer.name) {
      onSave(editingCustomer as Customer);
      setIsEditing(false);
      setEditingCustomer(null);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanPhone = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Clientes (CRM)</h1>
          <p className="text-muted-foreground text-sm">Gerencie sua lista de contatos, orçamentos fechados e LTV por cliente.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleNewCustomer}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent hover:opacity-90 text-white font-medium text-sm shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        )}
      </div>

      {isEditing && editingCustomer && (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 max-w-2xl mx-auto shadow-md animate-fade-in">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-5">
            <h3 className="font-outfit font-bold text-lg text-gradient-accent-text">
              {editingCustomer.createdAt ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveCustomer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={editingCustomer.name || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  placeholder="Ex: João Carlos Silva"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Telefone / WhatsApp (Apenas Números) *</label>
                <input 
                  type="text" 
                  required
                  value={editingCustomer.phone || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  placeholder="Ex: 11999999999 (inclua DDD)"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Instagram (Sem @)</label>
                <input 
                  type="text" 
                  value={editingCustomer.instagram || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, instagram: e.target.value})}
                  placeholder="Ex: joao3d_decor"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Endereço de Entrega</label>
                <input 
                  type="text" 
                  value={editingCustomer.address || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  placeholder="Rua, número, complemento, bairro, cidade e CEP"
                  className="w-full bg-muted/50 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Notas / Observações do Cliente</label>
                <textarea 
                  value={editingCustomer.notes || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, notes: e.target.value})}
                  placeholder="Ex: Prefere entregas por motoboy. Sempre fecha encomendas de Action Figures."
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
                Salvar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.map((customer) => {
          // Find stats for this customer
          const customerJobs = jobs.filter(j => j.customerId === customer.id);
          const totalOrders = customerJobs.length;
          const successfulJobs = customerJobs.filter(j => !j.failed);
          const revenue = successfulJobs.reduce((acc, j) => acc + (j.finalPrice * j.qty), 0);
          
          const cleanPhone = getCleanPhone(customer.phone);
          
          // Find last job to prefill template placeholders
          const lastJob = customerJobs[customerJobs.length - 1];
          const lastJobName = lastJob ? lastJob.name : 'sua encomenda';
          const lastJobPrice = lastJob ? formatCurrency(lastJob.finalPrice * lastJob.qty) : 'a combinar';
          
          // Default template
          const rawTemplate = settings?.defaultWhatsAppTemplate || 'Olá [Cliente]! Seu orçamento para a peça "[Peça]" ficou em [Valor]. Qualquer dúvida estou à disposição!';
          
          const parsedMessage = rawTemplate
            .replace('[Cliente]', customer.name)
            .replace('[Peça]', lastJobName)
            .replace('[Valor]', lastJobPrice);
            
          const waLink = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodeURIComponent(parsedMessage)}`;

          return (
            <div 
              key={customer.id} 
              className="bg-card border border-border hover:border-violet-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h3 className="font-outfit font-bold text-base leading-tight group-hover:text-violet-400 transition-colors">
                        {customer.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">Cadastrado há {Math.round((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                    </div>
                  </div>
                </div>

                {/* Customer Metrics */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/20 border border-border/40 rounded-xl my-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                    <div>
                      <p className="text-[9px] uppercase font-semibold text-muted-foreground">Total Pedidos</p>
                      <p className="font-bold text-foreground">{totalOrders} <span className="font-normal text-muted-foreground">({successfulJobs.length} Ok)</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <div>
                      <p className="text-[9px] uppercase font-semibold text-muted-foreground">Total Gasto (LTV)</p>
                      <p className="font-bold text-emerald-400">{formatCurrency(revenue)}</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Links */}
                <div className="space-y-2 text-xs py-2">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </span>
                    <a 
                      href={waLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </a>
                  </div>

                  {customer.instagram && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        @{customer.instagram}
                      </span>
                      <a 
                        href={`https://instagram.com/${customer.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 font-semibold text-[10px] transition-colors"
                      >
                        Abrir Perfil
                      </a>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start justify-between gap-2 border-t border-border/40 pt-2 text-muted-foreground">
                      <span className="flex items-start gap-1.5 flex-1 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {customer.address}
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(customer.address, customer.id)}
                        className="p-1 hover:text-white rounded hover:bg-muted"
                        title="Copiar Endereço"
                      >
                        {copiedId === customer.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {customer.notes && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 italic mt-2 bg-muted/10 p-2 rounded-lg">
                    "{customer.notes}"
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-border/40 mt-3">
                <button
                  onClick={() => handleEditCustomer(customer)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir cliente ${customer.name}?`)) {
                      onDelete(customer.id);
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
