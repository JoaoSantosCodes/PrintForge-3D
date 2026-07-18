'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  FileText, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Calendar,
  X,
  AlertTriangle,
  CheckCircle2,
  Printer as PrinterIcon,
  Layers,
  User
} from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PrintJob, Printer, Filament, Customer } from '@/types';
import { formatCurrency, formatMinutes } from '@/lib/utils';

interface HistoryViewProps {
  jobs: PrintJob[];
  printers: Printer[];
  filaments: Filament[];
  customers: Customer[];
  onDeleteJob: (id: string) => void;
}

export default function HistoryView({
  jobs,
  printers,
  filaments,
  customers,
  onDeleteJob
}: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterPrinter, setFilterPrinter] = useState('');
  const [filterFilament, setFilterFilament] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const printer = printers.find(p => p.id === job.printerId);
    const filament = filaments.find(f => f.id === job.filamentId);
    const customer = customers.find(c => c.id === job.customerId);

    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = filterCustomer ? job.customerId === filterCustomer : true;
    const matchesPrinter = filterPrinter ? job.printerId === filterPrinter : true;
    const matchesFilament = filterFilament ? job.filamentId === filterFilament : true;
    
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'success' 
        ? !job.failed 
        : job.failed;

    return matchesSearch && matchesCustomer && matchesPrinter && matchesFilament && matchesStatus;
  });

  const handleToggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Export entire list to CSV
  const handleExportCSV = () => {
    if (filteredJobs.length === 0) return alert('Nenhum dado para exportar!');
    
    const headers = ['ID', 'Data', 'Trabalho', 'Cliente', 'Impressora', 'Filamento', 'Peso (g)', 'Tempo (min)', 'Qtd', 'Custo Total', 'Venda Total', 'Lucro', 'Status'];
    
    const rows = filteredJobs.map(job => {
      const printer = printers.find(p => p.id === job.printerId)?.name || 'Excluída';
      const filament = filaments.find(f => f.id === job.filamentId)?.brand || 'Excluído';
      const customer = customers.find(c => c.id === job.customerId)?.name || 'Geral';
      const date = new Date(job.createdAt).toLocaleDateString('pt-BR');
      
      return [
        job.id,
        date,
        job.name,
        customer,
        printer,
        filament,
        job.weightG,
        job.printTimeMins,
        job.qty,
        (job.totalCost * job.qty).toFixed(2),
        (job.finalPrice * job.qty).toFixed(2),
        (job.netProfit * job.qty).toFixed(2),
        job.failed ? 'Falhou' : 'Sucesso'
      ];
    });

    const csvContent = "\ufeff" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_impressoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate PDF Invoice for single Job
  const handleExportPDF = (job: PrintJob) => {
    const doc = new jsPDF();
    const printer = printers.find(p => p.id === job.printerId);
    const filament = filaments.find(f => f.id === job.filamentId);
    const customer = customers.find(c => c.id === job.customerId);

    // Styling
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('PrintForge 3D', 15, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Relatório Técnico de Orçamento', 15, 32);

    doc.setTextColor(100, 100, 100);
    doc.text(`ID do Pedido: ${job.id}`, 140, 20);
    doc.text(`Data: ${new Date(job.createdAt).toLocaleDateString('pt-BR')} ${new Date(job.createdAt).toLocaleTimeString('pt-BR')}`, 140, 28);

    // Customer & Job details
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('1. Informações Básicas', 15, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome do Trabalho: ${job.name}`, 15, 65);
    doc.text(`Cliente: ${customer?.name || 'Geral'}`, 15, 71);
    doc.text(`Telefone: ${customer?.phone || 'Não informado'}`, 15, 77);
    doc.text(`Endereço: ${customer?.address || 'Não informado'}`, 15, 83);

    doc.text(`Impressora: ${printer?.name || 'Não informada'} (${printer?.model || ''})`, 110, 65);
    doc.text(`Filamento: ${filament?.brand || 'Não informado'} - ${filament?.type || ''} (${filament?.colorName || ''})`, 110, 71);
    doc.text(`Especificações: ${job.weightG}g de material • ${formatMinutes(job.printTimeMins)} de fatiamento`, 110, 77);
    doc.text(`Status: ${job.failed ? 'FALHADO (' + job.failedReason + ')' : 'SUCESSO'}`, 110, 83);

    // Costs detail table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. Composição de Custos (Unidade)', 15, 100);

    const paintingMinsTotal = job.paintingTimeMins || 0;
    const paintingLaborCost = ((paintingMinsTotal / 60) * (job.paintingLaborRate || 0));
    const paintConsumableCost = job.paintCost || 0;
    const airbrushCost = job.airbrushCost || 0;
    const totalPaintingCost = paintingLaborCost + paintConsumableCost + airbrushCost;

    const costRows = [
      ['Material (Filamento)', `${job.weightG}g utilizado`, formatCurrency(job.materialCost)],
      ['Energia Elétrica', `${printer?.consumptionWatts}W consumidos`, formatCurrency(job.energyCost)],
      ['Depreciação de Máquina', `Vida útil de ${printer?.lifespanHours}h`, formatCurrency(job.depreciationCost)],
      ['Manutenção Preventiva', 'Escala de manutenção anual', formatCurrency(job.maintenanceCost)],
      ['Embalagem & Envio', 'Caixas e fitas protetoras', formatCurrency(job.packagingCost)],
      ['Hardware & Extras', `${job.extraItems.length} item(s) adicional(is)`, formatCurrency(job.extraCostsAmount)],
    ];

    if (totalPaintingCost > 0) {
      costRows.push(['Pós-Processamento / Pintura', `${paintingMinsTotal}min de acabamento`, formatCurrency(totalPaintingCost)]);
    }

    (doc as any).autoTable({
      startY: 105,
      head: [['Categoria', 'Parâmetro', 'Custo Calculado']],
      body: costRows,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] }, // Violet 500
      styles: { fontSize: 9 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Totals Box
    doc.setFillColor(244, 244, 245); // Zinc 100
    doc.rect(15, finalY, 180, 45, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Fechamento de Valores', 20, finalY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Custo de Fabricação Unitário: ${formatCurrency(job.totalCost)}`, 20, finalY + 18);
    doc.text(`Quantidade Solicitada: ${job.qty}x`, 20, finalY + 24);
    doc.text(`Margem de Markup aplicada: ${job.markupPercent}%`, 20, finalY + 30);
    doc.text(`Custos Extras Retidos (Impostos ${job.taxPercent}% + Taxa Canal ${job.marketplaceFeePercent}%):`, 20, finalY + 36);

    const finalSum = job.finalPrice * job.qty;
    const finalProfit = job.netProfit * job.qty;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL FINAL: ${formatCurrency(finalSum)}`, 110, finalY + 18);
    doc.setTextColor(16, 185, 129); // emerald 500
    doc.text(`LUCRO LÍQUIDO: ${formatCurrency(finalProfit)}`, 110, finalY + 28);

    // Save PDF
    doc.save(`PrintForge_Orcamento_${job.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground text-sm">Monitore e analise todos os trabalhos executados ou orçamentos passados.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-muted rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Planilha (CSV)
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-2.5 text-muted-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Buscar por nome ou cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Customer filter */}
          <select 
            value={filterCustomer}
            onChange={e => setFilterCustomer(e.target.value)}
            className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">Todos os Clientes</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Printer filter */}
          <select 
            value={filterPrinter}
            onChange={e => setFilterPrinter(e.target.value)}
            className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">Todas as Impressoras</option>
            {printers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Filament filter */}
          <select 
            value={filterFilament}
            onChange={e => setFilterFilament(e.target.value)}
            className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">Todos os Filamentos</option>
            {filaments.map(f => <option key={f.id} value={f.id}>{f.brand} - {f.type}</option>)}
          </select>

          {/* Status filter */}
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="success">Sucesso</option>
            <option value="failed">Falhas</option>
          </select>

          {(searchTerm || filterCustomer || filterPrinter || filterFilament || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCustomer('');
                setFilterPrinter('');
                setFilterFilament('');
                setFilterStatus('all');
              }}
              className="text-xs font-semibold text-destructive hover:text-red-400 p-1 flex items-center gap-0.5"
            >
              <X className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <History className="w-12 h-12 text-muted mx-auto mb-2" />
            <p className="font-semibold text-foreground">Nenhuma impressão encontrada</p>
            <p className="text-xs">Cadastre novos orçamentos ou ajuste os filtros da busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-muted-foreground font-semibold">
                  <th className="p-4 font-medium">Nome / Produto</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium hidden md:table-cell">Parâmetros</th>
                  <th className="p-4 font-medium text-right">Custo Total</th>
                  <th className="p-4 font-medium text-right">Venda Total</th>
                  <th className="p-4 font-medium text-right">Lucro</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 text-center font-medium w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredJobs.map((job) => {
                  const isExpanded = expandedJobId === job.id;
                  const customer = customers.find(c => c.id === job.customerId);
                  const printer = printers.find(p => p.id === job.printerId);
                  const filament = filaments.find(f => f.id === job.filamentId);
                  
                  return (
                    <React.Fragment key={job.id}>
                      <tr 
                        onClick={() => handleToggleExpand(job.id)}
                        className={`hover:bg-muted/10 cursor-pointer transition-colors ${isExpanded ? 'bg-muted/5' : ''}`}
                      >
                        <td className="p-4 font-semibold text-foreground">
                          {job.name}
                          <div className="text-[10px] text-muted-foreground font-normal md:hidden">
                            <span>{job.weightG}g</span> • <span>{formatMinutes(job.printTimeMins)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-violet-400" />
                            {customer?.name || 'Geral'}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground">{job.weightG}g <span className="font-normal text-muted-foreground">de material</span></p>
                            <p className="text-[11px]">{formatMinutes(job.printTimeMins)} de tempo</p>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-muted-foreground">
                          {formatCurrency(job.totalCost * job.qty)}
                        </td>
                        <td className="p-4 text-right font-semibold text-foreground">
                          {formatCurrency(job.finalPrice * job.qty)}
                        </td>
                        <td className={`p-4 text-right font-bold ${job.netProfit >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                          {formatCurrency(job.netProfit * job.qty)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            {job.failed ? (
                              <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold text-[10px] flex items-center gap-1">
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
                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleExpand(job.id)}
                              className="p-1 text-muted-foreground hover:text-foreground rounded"
                              title="Detalhes"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remover o registro do trabalho ${job.name}?`)) {
                                  onDeleteJob(job.id);
                                }
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Cost Breakdown */}
                      {isExpanded && (
                        <tr className="bg-card-foreground/5 animate-fade-in">
                          <td colSpan={8} className="p-5 border-t border-b border-border/80">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Left Panel: Slicer Metadados */}
                              <div className="space-y-3.5">
                                <h4 className="font-outfit font-bold text-xs uppercase text-muted-foreground tracking-wider border-b border-border/60 pb-1.5">Especificações Técnicas</h4>
                                <div className="space-y-2 text-xs text-muted-foreground">
                                  <div className="flex justify-between"><span className="flex items-center gap-1"><PrinterIcon className="w-3.5 h-3.5" /> Impressora:</span> <span className="font-semibold text-foreground">{printer?.name || 'Excluída'}</span></div>
                                  <div className="flex justify-between"><span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Filamento:</span> <span className="font-semibold text-foreground">{filament?.brand} {filament?.type} ({filament?.colorName})</span></div>
                                  <div className="flex justify-between"><span>Quantidade total:</span> <span className="font-semibold text-foreground">{job.qty}x peça(s)</span></div>
                                  <div className="flex justify-between"><span>Registrado em:</span> <span className="font-semibold text-foreground">{new Date(job.createdAt).toLocaleString('pt-BR')}</span></div>
                                  {job.observations && (
                                    <div className="mt-3 p-2.5 bg-muted/20 border border-border/40 rounded-xl">
                                      <p className="font-semibold text-foreground text-[10px]">Observações:</p>
                                      <p className="italic text-[10.5px] mt-0.5">"{job.observations}"</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Center Panel: Cost details breakdown */}
                              <div className="space-y-2 text-xs">
                                <h4 className="font-outfit font-bold text-xs uppercase text-muted-foreground tracking-wider border-b border-border/60 pb-1.5">Demonstração de Custos</h4>
                                <div className="space-y-1.5 text-muted-foreground">
                                  <div className="flex justify-between"><span>Material (Filamento):</span> <span className="font-semibold text-foreground">{formatCurrency(job.materialCost * job.qty)}</span></div>
                                  <div className="flex justify-between"><span>Consumo de Energia:</span> <span className="font-semibold text-foreground">{formatCurrency(job.energyCost * job.qty)}</span></div>
                                  <div className="flex justify-between"><span>Depreciação de Máquina:</span> <span className="font-semibold text-foreground">{formatCurrency(job.depreciationCost * job.qty)}</span></div>
                                  <div className="flex justify-between"><span>Manutenção Preventiva:</span> <span className="font-semibold text-foreground">{formatCurrency(job.maintenanceCost * job.qty)}</span></div>
                                  <div className="flex justify-between"><span>Embalagem protetora:</span> <span className="font-semibold text-foreground">{formatCurrency(job.packagingCost * job.qty)}</span></div>
                                  {((job.paintCost || 0) + (job.airbrushCost || 0) + (job.paintingTimeMins || 0) * (job.paintingLaborRate || 0)) > 0 && (
                                    <div className="flex justify-between">
                                      <span>Pós-processamento / Pintura:</span>
                                      <span className="font-semibold text-foreground">
                                        {formatCurrency(((job.paintCost || 0) + (job.airbrushCost || 0) + ((job.paintingTimeMins || 0) / 60) * (job.paintingLaborRate || 0)) * job.qty)}
                                      </span>
                                    </div>
                                  )}
                                  {job.extraCostsAmount > 0 && (
                                    <div className="flex justify-between"><span>Hardware & Insumos Extras:</span> <span className="font-semibold text-foreground">{formatCurrency(job.extraCostsAmount * job.qty)}</span></div>
                                  )}
                                  {job.shippingCost > 0 && (
                                    <div className="flex justify-between"><span>Frete / Logística:</span> <span className="font-semibold text-foreground">{formatCurrency(job.shippingCost)}</span></div>
                                  )}
                                  <div className="border-t border-border/40 pt-1.5 flex justify-between font-bold text-foreground">
                                    <span>Custo de Produção Total:</span>
                                    <span>{formatCurrency(job.totalCost * job.qty)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Panel: QR Code and Invoice buttons */}
                              <div className="bg-muted/10 border border-border/40 rounded-2xl p-4 flex flex-col justify-between items-center text-center gap-3">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Código de Rastreamento</p>
                                  <p className="text-[9px] text-muted-foreground mb-2">QR Code de orçamento rápido</p>
                                </div>
                                <QrCodeRenderer text={`printforge_job_v1:${job.id}`} />
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => handleExportPDF(job)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600/10 hover:bg-violet-600 hover:text-white text-violet-400 rounded-xl text-xs font-semibold transition-all"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    Gerar PDF
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Inner helper component for QR Code Rendering using standard HTML5 Canvas
function QrCodeRenderer({ text }: { text: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 100,
        margin: 1,
        color: {
          dark: '#ffffff',
          light: '#121214',
        }
      }, (err) => {
        if (err) console.error(err);
      });
    }
  }, [text]);

  return (
    <div className="p-2 bg-[#121214] border border-border rounded-xl">
      <canvas ref={canvasRef} className="rounded-lg w-24 h-24" />
    </div>
  );
}
