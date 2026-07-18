'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Printer as PrinterIcon,
  Users,
  Settings as SettingsIcon,
  Upload,
  DollarSign,
  TrendingUp,
  Package,
  Wrench,
  Percent,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  X,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Printer, Filament, PrintProfile, Customer, PrintJob, ExtraItem, SystemSettings, Product } from '@/types';
import { formatCurrency, formatMinutes, getFilamentLength } from '@/lib/utils';
import { parse3DFile } from '@/lib/parser';
import STLViewer from '@/components/STLViewer';

interface NewPrintViewProps {
  printers: Printer[];
  filaments: Filament[];
  profiles: PrintProfile[];
  customers: Customer[];
  settings: SystemSettings;
  prefilledProduct?: Product | null;
  onSaveJob: (job: PrintJob) => void;
  onAddCustomer: (customer: Customer) => void;
  onAddFilament: (filament: Filament) => void;
  onClearPrefilledProduct?: () => void;
}

export default function NewPrintView({
  printers,
  filaments,
  profiles,
  customers,
  settings,
  prefilledProduct,
  onSaveJob,
  onAddCustomer,
  onAddFilament,
  onClearPrefilledProduct
}: NewPrintViewProps) {
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFileInfo, setParsedFileInfo] = useState<string | null>(null);
  const [stlFile, setStlFile] = useState<File | null>(null);

  // Form State
  const [jobName, setJobName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [selectedFilamentId, setSelectedFilamentId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  
  const [weightG, setWeightG] = useState<number>(0);
  const [printHours, setPrintHours] = useState<number>(0);
  const [printMins, setPrintMins] = useState<number>(0);
  const [rawTimeInput, setRawTimeInput] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // Painting and finishing post-processing
  const [hasPainting, setHasPainting] = useState(false);
  const [paintingHours, setPaintingHours] = useState(0);
  const [paintingMins, setPaintingMins] = useState(0);
  const [paintingLaborRate, setPaintingLaborRate] = useState(settings.defaultPaintingLaborRate || 20.00);
  const [paintCost, setPaintCost] = useState(0);
  const [useAirbrush, setUseAirbrush] = useState(false);
  const [airbrushHourlyRate, setAirbrushHourlyRate] = useState(settings.defaultAirbrushHourlyRate || 2.50);
  const [failed, setFailed] = useState<boolean>(false);
  const [failedReason, setFailedReason] = useState<string>('');
  const [observations, setObservations] = useState('');

  // Packaging Presets
  const [packagingType, setPackagingType] = useState<'none' | 'saco' | 'caixa' | 'custom'>('caixa');
  const [boxCost, setBoxCost] = useState<number>(settings.defaultPackagingBoxCost);
  const [tapeCost, setTapeCost] = useState<number>(settings.defaultPackagingTapeCost);
  const [bubbleWrapCost, setBubbleWrapCost] = useState<number>(settings.defaultPackagingBubbleWrapCost);

  // Extra Hardware/Items
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraQty, setNewExtraQty] = useState<number>(1);
  const [newExtraUnitCost, setNewExtraUnitCost] = useState<number>(0);

  // Fees, Taxes, Profit
  const [marketplaceType, setMarketplaceType] = useState<'none' | 'ml' | 'shopee' | 'elo7' | 'custom'>('none');
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(settings.defaultMarketplaceFeePercent);
  const [marketplaceFixedFee, setMarketplaceFixedFee] = useState<number>(settings.defaultMarketplaceFixedFee);
  const [taxPercent, setTaxPercent] = useState<number>(settings.defaultTaxPercent);
  const [markupPercent, setMarkupPercent] = useState<number>(settings.defaultMarkupPercent);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [finalOverridePrice, setFinalOverridePrice] = useState<number>(0);
  const [useOverride, setUseOverride] = useState<boolean>(false);

  // Modals/Quick creates
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Listen to prefilled catalog product trigger
  useEffect(() => {
    if (prefilledProduct) {
      setJobName(prefilledProduct.name);
      setWeightG(prefilledProduct.weightG);
      const hrs = Math.floor(prefilledProduct.printTimeMins / 60);
      const mns = prefilledProduct.printTimeMins % 60;
      setPrintHours(hrs);
      setPrintMins(mns);
      if (prefilledProduct.defaultFilamentId) {
        setSelectedFilamentId(prefilledProduct.defaultFilamentId);
      }
      if (prefilledProduct.suggestedPrice) {
        setFinalOverridePrice(prefilledProduct.suggestedPrice);
        setUseOverride(true);
      }
      
      if (onClearPrefilledProduct) {
        onClearPrefilledProduct();
      }
    }
  }, [prefilledProduct, onClearPrefilledProduct]);

  // Pre-fill fields on first mount/prop updates
  useEffect(() => {
    if (printers.length > 0 && !selectedPrinterId) {
      setSelectedPrinterId(printers[0].id);
    }
    if (filaments.length > 0 && !selectedFilamentId) {
      setSelectedFilamentId(filaments[0].id);
    }
  }, [printers, filaments, selectedPrinterId, selectedFilamentId]);

  // Update painting defaults if settings change
  useEffect(() => {
    if (settings) {
      if (settings.defaultPaintingLaborRate !== undefined) {
        setPaintingLaborRate(settings.defaultPaintingLaborRate);
      }
      if (settings.defaultAirbrushHourlyRate !== undefined) {
        setAirbrushHourlyRate(settings.defaultAirbrushHourlyRate);
      }
    }
  }, [settings]);

  const handleRawTimeChange = (val: string) => {
    setRawTimeInput(val);
    if (!val) return;
    
    let hours = 0;
    let mins = 0;
    
    if (val.includes(':')) {
      const parts = val.split(':');
      hours = parseInt(parts[0]) || 0;
      mins = parseInt(parts[1]) || 0;
    } else {
      const hMatch = val.match(/(\d+)\s*h/i);
      const mMatch = val.match(/(\d+)\s*m/i);
      
      if (hMatch || mMatch) {
        hours = hMatch ? parseInt(hMatch[1]) : 0;
        mins = mMatch ? parseInt(mMatch[1]) : 0;
      } else {
        const pureMins = parseInt(val);
        if (!isNaN(pureMins)) {
          hours = Math.floor(pureMins / 60);
          mins = pureMins % 60;
        }
      }
    }
    
    setPrintHours(hours);
    setPrintMins(Math.min(59, mins));
  };

  // Adjust parameters when profile is selected
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId);
    if (!profileId) return;

    const prof = profiles.find(p => p.id === profileId);
    if (prof) {
      if (prof.printerId) setSelectedPrinterId(prof.printerId);
      if (prof.defaultFilamentId) setSelectedFilamentId(prof.defaultFilamentId);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setParsedFileInfo(null);
    setStlFile(null);
    try {
      const stats = await parse3DFile(file);
      setJobName(stats.name);
      setWeightG(stats.weightG);
      
      const hrs = Math.floor(stats.timeMins / 60);
      const mns = stats.timeMins % 60;
      setPrintHours(hrs);
      setPrintMins(mns);

      setParsedFileInfo(
        `Detectado: ${stats.slicer || 'Arquivo 3D'} • Peso: ${stats.weightG}g • Tempo: ${formatMinutes(stats.timeMins)}`
      );

      if (file.name.toLowerCase().endsWith('.stl')) {
        setStlFile(file);
      }

      // Trigger standard success confetti for fun file upload
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  // Add extra items
  const handleAddExtraItem = () => {
    if (!newExtraName) return;
    const item: ExtraItem = {
      id: 'ext-' + Math.random().toString(36).substr(2, 9),
      name: newExtraName,
      qty: newExtraQty,
      unitCost: newExtraUnitCost
    };
    setExtraItems([...extraItems, item]);
    setNewExtraName('');
    setNewExtraQty(1);
    setNewExtraUnitCost(0);
  };

  const handleRemoveExtraItem = (id: string) => {
    setExtraItems(extraItems.filter(item => item.id !== id));
  };

  // Presets mapping
  useEffect(() => {
    if (packagingType === 'none') {
      setBoxCost(0);
      setTapeCost(0);
      setBubbleWrapCost(0);
    } else if (packagingType === 'saco') {
      setBoxCost(0);
      setTapeCost(0.20);
      setBubbleWrapCost(0.50);
    } else if (packagingType === 'caixa') {
      setBoxCost(settings.defaultPackagingBoxCost);
      setTapeCost(settings.defaultPackagingTapeCost);
      setBubbleWrapCost(settings.defaultPackagingBubbleWrapCost);
    }
  }, [packagingType, settings]);

  useEffect(() => {
    if (marketplaceType === 'none') {
      setMarketplaceFeePercent(0);
      setMarketplaceFixedFee(0);
    } else if (marketplaceType === 'ml') {
      setMarketplaceFeePercent(12);
      setMarketplaceFixedFee(6.00);
    } else if (marketplaceType === 'shopee') {
      setMarketplaceFeePercent(18);
      setMarketplaceFixedFee(3.00);
    } else if (marketplaceType === 'elo7') {
      setMarketplaceFeePercent(12);
      setMarketplaceFixedFee(0);
    }
  }, [marketplaceType]);

  // Quick Customer Create
  const handleQuickCustomerCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    
    const newCust: Customer = {
      id: 'cust-' + Math.random().toString(36).substr(2, 9),
      name: newCustName,
      phone: newCustPhone || 'Sem telefone',
      instagram: '',
      address: '',
      notes: 'Cadastrado rapidamente pela calculadora.',
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCust);
    setCustomerId(newCust.id);
    setQuickCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  // calculations definitions
  const totalMins = printHours * 60 + printMins;
  const printer = printers.find(p => p.id === selectedPrinterId);
  const filament = filaments.find(f => f.id === selectedFilamentId);

  // 1. Material
  const materialCost = filament ? (filament.price / filament.weightG) * weightG : 0;
  
  // 2. Energia
  const energyKwh = printer ? (printer.consumptionWatts / 1000) * (totalMins / 60) : 0;
  const energyCost = energyKwh * settings.electricityKwhRate;
  
  // 3. Depreciação
  const depreciationCost = printer ? (printer.price / printer.lifespanHours) * (totalMins / 60) : 0;
  
  // 4. Manutenção
  const maintenanceCost = printer ? (printer.annualMaintenanceCost / 2000) * (totalMins / 60) : 0;
  
  // 5. Embalagem
  const packagingCost = boxCost + tapeCost + bubbleWrapCost;
  
  // 6. Extras
  const extraCostsAmount = extraItems.reduce((acc, item) => acc + (item.qty * item.unitCost), 0);

  // 7. Pintura e Acabamento
  const paintingMinsTotal = paintingHours * 60 + paintingMins;
  const paintingTimeHours = paintingMinsTotal / 60;
  const paintingLaborCost = hasPainting ? paintingTimeHours * paintingLaborRate : 0;
  const paintConsumableCost = hasPainting ? paintCost : 0;
  const airbrushCost = (hasPainting && useAirbrush) ? paintingTimeHours * airbrushHourlyRate : 0;
  const totalPaintingCost = paintingLaborCost + paintConsumableCost + airbrushCost;

  // Total Production Cost per unit (including painting finishing)
  const productionCostPerUnit = materialCost + energyCost + depreciationCost + maintenanceCost + packagingCost + extraCostsAmount + totalPaintingCost;
  const totalProductionCost = productionCostPerUnit * quantity;

  // Pricing suggested formula
  // Base Price with profit markup
  const priceWithMarkup = productionCostPerUnit * (1 + markupPercent / 100);

  // Incorporate marketplace fees and taxes on the gross sales price
  // Formule: Suggested = (MarkupPrice + Shipping + FixedFee) / (1 - (Commission% + Tax%) / 100)
  const deductionsPercent = (marketplaceFeePercent + taxPercent) / 100;
  const rawSuggestedPrice = deductionsPercent < 1 
    ? (priceWithMarkup + shippingCost + marketplaceFixedFee) / (1 - deductionsPercent)
    : priceWithMarkup + shippingCost + marketplaceFixedFee;

  const suggestedPrice = Math.max(0, Number(rawSuggestedPrice.toFixed(2)));

  // Final Price selection
  const finalPrice = failed ? 0 : useOverride ? finalOverridePrice : suggestedPrice;

  // Net Profit
  // Profit = (FinalPrice - Shipping - TaxesAmount - CommissionAmount - ProductionCost)
  const taxesAmount = finalPrice * (taxPercent / 100);
  const commissionAmount = finalPrice > 0 ? (finalPrice * (marketplaceFeePercent / 100) + marketplaceFixedFee) : 0;
  
  // Total cost including shipping, commissions, and taxes
  const totalCost = totalProductionCost + shippingCost + taxesAmount + commissionAmount;
  
  // Net profit (revenue - total cost)
  const netProfit = failed 
    ? -totalProductionCost // If failed, net profit is negative production cost (loss)
    : (finalPrice * quantity) - totalCost;

  const handleSaveJobSubmit = () => {
    if (!jobName) return alert('Por favor, informe o nome do trabalho!');
    if (!selectedPrinterId) return alert('Selecione uma impressora!');
    if (!selectedFilamentId) return alert('Selecione um filamento!');

    const job: PrintJob = {
      id: 'job-' + Math.random().toString(36).substr(2, 9),
      name: jobName,
      customerId: customerId || 'c1', // Fallback to João Carlos if not selected
      printerId: selectedPrinterId,
      filamentId: selectedFilamentId,
      weightG,
      printTimeMins: totalMins,
      qty: quantity,
      failed,
      failedReason: failed ? failedReason || 'Falha não especificada' : undefined,
      observations,
      materialCost,
      energyCost,
      depreciationCost,
      maintenanceCost,
      packagingCost,
      extraCostsAmount,
      extraItems,
      shippingCost,

      // Painting
      paintingTimeMins: hasPainting ? paintingMinsTotal : 0,
      paintingLaborRate: hasPainting ? paintingLaborRate : 0,
      paintCost: hasPainting ? paintCost : 0,
      useAirbrush: hasPainting ? useAirbrush : false,
      airbrushCost: hasPainting ? airbrushCost : 0,

      marketplaceFeePercent,
      marketplaceFixedFee,
      taxPercent,
      markupPercent,
      totalCost: productionCostPerUnit, // cost per unit
      suggestedPrice,
      finalPrice: finalPrice / quantity, // price per unit
      netProfit: netProfit / quantity, // profit per unit
      createdAt: new Date().toISOString()
    };

    onSaveJob(job);

    // Confetti!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Reset Form partially
    setJobName('');
    setWeightG(0);
    setPrintHours(0);
    setPrintMins(0);
    setRawTimeInput('');
    setExtraItems([]);
    setFailed(false);
    setFailedReason('');
    setObservations('');
    setParsedFileInfo(null);
    setStlFile(null);
    setHasPainting(false);
    setPaintingHours(0);
    setPaintingMins(0);
    setPaintCost(0);
    setUseAirbrush(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-outfit font-extrabold tracking-tight">Calculadora Inteligente</h1>
        <p className="text-muted-foreground text-sm">Calcule com precisão cirúrgica e precifique seu trabalho automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STL/G-Code Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card/50 hover:bg-card hover:border-violet-500/30'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".stl,.gcode,.gcode.gz,.3mf"
              className="hidden" 
            />
            {isParsing ? (
              <div className="flex flex-col items-center gap-2.5 py-2">
                <div className="w-8 h-8 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <p className="text-xs font-semibold text-violet-400">Analisando fatiamento...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="p-3 bg-violet-500/10 text-violet-400 rounded-full">
                  <Upload className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Importar Fatiamento (STL / G-code / 3MF)</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Arraste seu arquivo fatiado ou clique para buscar</p>
                </div>
              </div>
            )}
            {parsedFileInfo && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {parsedFileInfo}
              </div>
            )}
          </div>

          {stlFile && (
            <div className="animate-fade-in">
              <STLViewer file={stlFile} />
            </div>
          )}

          {/* Collapsible Steps Cards */}
          <div className="space-y-4">
            {/* Step 1: Basic Info */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="font-outfit font-bold text-sm">Dados do Pedido</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Nome do Trabalho / Peça *</label>
                  <input 
                    type="text" 
                    required
                    value={jobName}
                    onChange={e => setJobName(e.target.value)}
                    placeholder="Ex: Miniatura Dragão Articulado"
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Cliente</label>
                    <button
                      type="button"
                      onClick={() => setQuickCustomerOpen(true)}
                      className="text-[9px] font-bold text-primary hover:text-violet-400 flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Criar
                    </button>
                  </div>
                  <select 
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Selecione um cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Printer Parameters */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="font-outfit font-bold text-sm">Impressão e Insumos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Perfil de Fatiamento (Atalho)</label>
                  <select 
                    value={selectedProfileId}
                    onChange={e => handleProfileChange(e.target.value)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Nenhum perfil pré-definido</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Impressora 3D *</label>
                  <select 
                    value={selectedPrinterId}
                    onChange={e => setSelectedPrinterId(e.target.value)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Selecione...</option>
                    {printers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Filamento Utilizado *</label>
                  <select 
                    value={selectedFilamentId}
                    onChange={e => setSelectedFilamentId(e.target.value)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Selecione...</option>
                    {filaments.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.brand} - {f.type} ({f.colorName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Peso Utilizado (Gramas) *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={weightG || ''}
                      onChange={e => setWeightG(parseFloat(e.target.value) || 0)}
                      className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-3.5 pr-8 py-2 text-xs focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-muted-foreground">g</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Tempo de Impressão *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Horas"
                        value={printHours || ''}
                        onChange={e => setPrintHours(parseInt(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-3 pr-6 py-2 text-xs focus:outline-none"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">h</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        max="59"
                        placeholder="Min"
                        value={printMins || ''}
                        onChange={e => setPrintMins(parseInt(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-3 pr-7 py-2 text-xs focus:outline-none"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">min</span>
                    </div>
                    <div className="relative mt-1.5">
                      <input 
                        type="text" 
                        placeholder="Ou cole tempo (ex: 2h 15m, 8:30)" 
                        value={rawTimeInput}
                        onChange={e => handleRawTimeChange(e.target.value)}
                        className="w-full bg-muted/20 border border-border/60 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Quantidade de Peças *</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Packaging and extras */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="font-outfit font-bold text-sm">Embalagem e Insumos Extras</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Embalagem Utilizada</label>
                  <select 
                    value={packagingType}
                    onChange={e => setPackagingType(e.target.value as any)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="saco">Saco Simples + Plástico Bolha</option>
                    <option value="caixa">Caixa Premium Completa</option>
                    <option value="custom">Valores Customizados</option>
                  </select>
                </div>

                {packagingType === 'custom' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Custo Caixa (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={boxCost}
                        onChange={e => setBoxCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Plástico Bolha (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={bubbleWrapCost}
                        onChange={e => setBubbleWrapCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Fita/Etiqueta (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={tapeCost}
                        onChange={e => setTapeCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {packagingType !== 'custom' && packagingType !== 'none' && (
                  <div className="md:col-span-3 bg-muted/20 border border-border/40 rounded-xl p-3 text-xs text-muted-foreground flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Pacote: {packagingType === 'caixa' ? 'Caixa Premium' : 'Saco Simples'}</p>
                      <p className="text-[10px] mt-0.5">Caixa, fita e plástico bolha aplicados.</p>
                    </div>
                    <span className="font-bold text-foreground">{formatCurrency(packagingCost)}</span>
                  </div>
                )}
              </div>

              {/* Hardware items */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Insumos Adicionais (Parafusos, ímãs, molas, etc.)</span>
                </div>

                <div className="flex flex-wrap md:flex-nowrap gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Ex: Ímã de Neodímio 8mm"
                    value={newExtraName}
                    onChange={e => setNewExtraName(e.target.value)}
                    className="flex-1 bg-muted/30 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Qtd"
                    min="1"
                    value={newExtraQty || ''}
                    onChange={e => setNewExtraQty(parseInt(e.target.value) || 1)}
                    className="w-20 bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="R$ Unitário"
                    step="0.01"
                    min="0"
                    value={newExtraUnitCost || ''}
                    onChange={e => setNewExtraUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs text-center focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExtraItem}
                    className="px-3.5 py-2 bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {extraItems.length > 0 && (
                  <div className="divide-y divide-border/60 bg-muted/10 rounded-xl overflow-hidden mt-2">
                    {extraItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">Quantidade: {item.qty}x • Unitário: {formatCurrency(item.unitCost)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-foreground">{formatCurrency(item.qty * item.unitCost)}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveExtraItem(item.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Painting & Post-Processing (Opcional) */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-bold text-xs flex items-center justify-center">4</span>
                  <h3 className="font-outfit font-bold text-sm">Pós-Processamento e Pintura (Opcional)</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input 
                    type="checkbox"
                    checked={hasPainting}
                    onChange={e => setHasPainting(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-muted-foreground">Adicionar Pintura/Acabamento</span>
                </label>
              </div>

              {hasPainting && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Tempo de Pintura *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Horas"
                          value={paintingHours || ''}
                          onChange={e => setPaintingHours(parseInt(e.target.value) || 0)}
                          className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-3 pr-6 py-2 text-xs focus:outline-none text-white font-bold"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">h</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0"
                          max="59"
                          placeholder="Min"
                          value={paintingMins || ''}
                          onChange={e => setPaintingMins(parseInt(e.target.value) || 0)}
                          className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-3 pr-7 py-2 text-xs focus:outline-none text-white font-bold"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">min</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Custo Mão de Obra (R$/h)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[10px] text-muted-foreground">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={paintingLaborRate || ''}
                        onChange={e => setPaintingLaborRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Tintas e Insumos (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-[10px] text-muted-foreground">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={paintCost || ''}
                        onChange={e => setPaintCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end pb-1.5 pl-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input 
                        type="checkbox"
                        checked={useAirbrush}
                        onChange={e => setUseAirbrush(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-semibold text-foreground">Utilizou Aerógrafo</span>
                        <p className="text-[9px] text-muted-foreground">Taxa uso: {formatCurrency(airbrushHourlyRate)}/h</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Marketplace, Profit, Taxes */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <span className="w-5 h-5 rounded bg-violet-500/15 text-violet-400 font-bold text-xs flex items-center justify-center">5</span>
                <h3 className="font-outfit font-bold text-sm">Taxas, Impostos e Lucratividade</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Canal de Venda</label>
                  <select 
                    value={marketplaceType}
                    onChange={e => setMarketplaceType(e.target.value as any)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">Balcão / Direto (Sem taxas)</option>
                    <option value="ml">Mercado Livre (Ex: 12% + R$6)</option>
                    <option value="shopee">Shopee (Ex: 18% + R$3)</option>
                    <option value="elo7">Elo7 (Ex: 12%)</option>
                    <option value="custom">Taxa Customizada</option>
                  </select>
                </div>

                {marketplaceType === 'custom' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Comissão (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={marketplaceFeePercent}
                        onChange={e => setMarketplaceFeePercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground">Taxa Fixa (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={marketplaceFixedFee}
                        onChange={e => setMarketplaceFixedFee(parseFloat(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {marketplaceType !== 'custom' && marketplaceType !== 'none' && (
                  <div className="bg-muted/15 border border-border/40 rounded-xl p-2.5 text-xs text-muted-foreground flex items-center justify-between col-span-2">
                    <div>
                      <p className="font-semibold text-foreground">Comissão de Canal</p>
                      <p className="text-[10px]">{marketplaceFeePercent}% comissão + {formatCurrency(marketplaceFixedFee)} fixo</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Imposto (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={taxPercent}
                    onChange={e => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Frete / Envio (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={shippingCost}
                    onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Margem de Lucro Desejada</label>
                    <span className="text-xs font-bold text-primary">{markupPercent}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="300" 
                    step="5"
                    value={markupPercent} 
                    onChange={e => setMarkupPercent(parseInt(e.target.value) || 30)}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>

              {/* Failed print parameters */}
              <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={failed} 
                    onChange={e => setFailed(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-opacity-25"
                  />
                  <span>Esta impressão falhou?</span>
                </label>

                {failed && (
                  <input 
                    type="text" 
                    value={failedReason}
                    onChange={e => setFailedReason(e.target.value)}
                    placeholder="Motivo (ex: warp na mesa, bico entupido)"
                    className="flex-1 bg-muted/30 border border-border focus:border-primary rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Calculator Breakdown */}
        <div className="lg:col-span-1 sticky top-20 space-y-6">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
            {/* Design card details */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
            
            <h3 className="font-outfit font-extrabold text-base md:text-lg border-b border-border pb-3 mb-4 flex justify-between items-center text-gradient-accent-text">
              Resumo do Cálculo
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-normal">Sugerido</span>
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground flex items-center gap-1.5 pt-0.5"><Layers className="w-3.5 h-3.5 text-violet-400" /> Material:</span>
                <div className="text-right">
                  <span className="font-semibold block text-foreground">{formatCurrency(materialCost)}</span>
                  {filament && weightG > 0 && (
                    <span className="text-[10px] text-muted-foreground block mt-0.5">~{getFilamentLength(weightG, filament.type)}m de fio</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-yellow-500" /> Energia:</span>
                <span className="font-semibold">{formatCurrency(energyCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><PrinterIcon className="w-3.5 h-3.5 text-cyan-400" /> Depreciação:</span>
                <span className="font-semibold">{formatCurrency(depreciationCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-amber-500" /> Manutenção:</span>
                <span className="font-semibold">{formatCurrency(maintenanceCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-zinc-400" /> Embalagem:</span>
                <span className="font-semibold">{formatCurrency(packagingCost)}</span>
              </div>
              {totalPaintingCost > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground flex items-center gap-1.5 pt-0.5"><Palette className="w-3.5 h-3.5 text-emerald-400" /> Acabamento:</span>
                  <div className="text-right">
                    <span className="font-semibold block text-foreground">{formatCurrency(totalPaintingCost)}</span>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Mão de Obra + Tintas {useAirbrush && '+ Aerógrafo'}</p>
                  </div>
                </div>
              )}
              {extraCostsAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary" /> Extras:</span>
                  <span className="font-semibold">{formatCurrency(extraCostsAmount)}</span>
                </div>
              )}
              {shippingCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Frete / Envio:</span>
                  <span className="font-semibold">{formatCurrency(shippingCost)}</span>
                </div>
              )}

              <div className="border-t border-border/80 pt-3 flex justify-between items-center text-sm font-bold">
                <span>Custo de Produção (x{quantity}):</span>
                <span className="text-white">{formatCurrency(totalProductionCost)}</span>
              </div>

              {/* Deductions breakdown */}
              {(marketplaceFeePercent > 0 || taxPercent > 0) && (
                <div className="bg-muted/10 border border-border/40 rounded-xl p-3 space-y-2 text-[11px] text-muted-foreground mt-3">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-cyan-400" /> Impostos e Taxas Retidas
                  </p>
                  <div className="flex justify-between">
                    <span>Impostos ({taxPercent}%):</span>
                    <span>{formatCurrency(taxesAmount)}</span>
                  </div>
                  {marketplaceFeePercent > 0 && (
                    <div className="flex justify-between">
                      <span>Canal ({marketplaceFeePercent}% + {formatCurrency(marketplaceFixedFee)}):</span>
                      <span>{formatCurrency(commissionAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Margin Simulations */}
              <div className="bg-muted/10 border border-border/40 rounded-xl p-3 space-y-2 text-[11px] text-muted-foreground mt-3">
                <p className="font-semibold text-foreground flex items-center gap-1">📈 Simulação de Margens (Unidade)</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Markup 30%:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        deductionsPercent < 1 
                          ? (productionCostPerUnit * 1.30 + shippingCost + marketplaceFixedFee) / (1 - deductionsPercent)
                          : productionCostPerUnit * 1.30 + shippingCost + marketplaceFixedFee
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup 50% (Sugerido):</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        deductionsPercent < 1 
                          ? (productionCostPerUnit * 1.50 + shippingCost + marketplaceFixedFee) / (1 - deductionsPercent)
                          : productionCostPerUnit * 1.50 + shippingCost + marketplaceFixedFee
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup 100% (Dobra de valor):</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        deductionsPercent < 1 
                          ? (productionCostPerUnit * 2.00 + shippingCost + marketplaceFixedFee) / (1 - deductionsPercent)
                          : productionCostPerUnit * 2.00 + shippingCost + marketplaceFixedFee
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup 150% (SaaS/Série):</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(
                        deductionsPercent < 1 
                          ? (productionCostPerUnit * 2.50 + shippingCost + marketplaceFixedFee) / (1 - deductionsPercent)
                          : productionCostPerUnit * 2.50 + shippingCost + marketplaceFixedFee
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Price vs Custom Price Override */}
              <div className="border-t border-border/80 pt-4 mt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-1">
                  <span>Preço Sugerido (Unidade):</span>
                  <span>{formatCurrency(suggestedPrice)}</span>
                </div>

                <div className="flex items-center gap-2 mb-3 mt-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useOverride} 
                      onChange={e => setUseOverride(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Definir preço de venda manual</span>
                  </label>
                </div>

                {useOverride && (
                  <div className="relative mb-4 animate-fade-in">
                    <span className="absolute left-3.5 top-2 text-xs font-bold text-muted-foreground">R$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={finalOverridePrice || ''}
                      onChange={e => setFinalOverridePrice(parseFloat(e.target.value) || 0)}
                      placeholder="Preço final unitário"
                      className="w-full bg-muted/40 border border-primary/40 focus:border-primary rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-white"
                    />
                  </div>
                )}

                {/* Final sale display */}
                <div className="bg-gradient-to-br from-violet-600/10 to-cyan-500/10 border border-violet-500/20 rounded-2xl p-4 text-center space-y-1 mt-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Preço de Venda Sugerido</p>
                  <h2 className="text-3xl font-outfit font-extrabold text-white tracking-tight">
                    {failed ? formatCurrency(0) : formatCurrency(finalPrice * quantity)}
                  </h2>
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Lucro Líquido: {formatCurrency(netProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={handleSaveJobSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl gradient-accent hover:opacity-95 text-white font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Impressão no Histórico
              </button>
            </div>
          </div>
          
          <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground flex items-center gap-1"><Info className="w-3.5 h-3.5 text-violet-400" /> Dica de Custos</p>
            <p className="leading-relaxed">A tarifa de energia, taxas de marketplace e markup padrão podem ser customizados permanentemente na aba de <strong>Configurações</strong>.</p>
          </div>
        </div>
      </div>

      {/* Quick Customer Modal */}
      {quickCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
              <h3 className="font-outfit font-bold text-sm text-gradient-accent-text">Adicionar Cliente</h3>
              <button onClick={() => setQuickCustomerOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickCustomerCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="Ex: Clara Mendes"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Telefone/WhatsApp</label>
                <input 
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="Ex: 11988887777"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl gradient-accent text-white text-xs font-bold shadow-md"
              >
                Criar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
