import { Printer, Filament, PrintProfile, Customer, Product, PrintJob, SystemSettings } from '../types';

const KEYS = {
  PRINTERS: 'printforge_printers',
  FILAMENTS: 'printforge_filaments',
  PROFILES: 'printforge_profiles',
  CUSTOMERS: 'printforge_customers',
  PRODUCTS: 'printforge_products',
  JOBS: 'printforge_jobs',
  SETTINGS: 'printforge_settings',
};

const DEFAULT_SETTINGS: SystemSettings = {
  electricityKwhRate: 0.95,
  defaultTaxPercent: 0, // MEI can be set, default 0
  defaultMarkupPercent: 30,
  defaultMarketplaceFeePercent: 0,
  defaultMarketplaceFixedFee: 0,
  defaultPackagingBoxCost: 2.00,
  defaultPackagingTapeCost: 0.40,
  defaultPackagingBubbleWrapCost: 0.80,
  currency: 'BRL',
  defaultWhatsAppTemplate: 'Olá [Cliente]! Seu orçamento para a peça "[Peça]" ficou em [Valor]. Qualquer dúvida estou à disposição!',
  defaultPaintingLaborRate: 20.00,
  defaultAirbrushHourlyRate: 2.50,
};

// Seed Data
const MOCK_PRINTERS: Printer[] = [
  {
    id: 'p1',
    name: 'Ender 3 V3',
    model: 'Creality',
    consumptionWatts: 220,
    price: 2200,
    lifespanHours: 10000,
    annualMaintenanceCost: 350,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    name: 'Bambu Lab P1S',
    model: 'Bambu Lab',
    consumptionWatts: 350,
    price: 5800,
    lifespanHours: 15000,
    annualMaintenanceCost: 600,
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_FILAMENTS: Filament[] = [
  {
    id: 'f1',
    brand: '3D Fila',
    type: 'PLA',
    colorName: 'Preto Premium',
    colorHex: '#18181b',
    weightG: 1000,
    price: 95.00,
    currentStockG: 850,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f2',
    brand: 'eSun',
    type: 'PETG',
    colorName: 'Azul Translúcido',
    colorHex: '#2563eb',
    weightG: 1000,
    price: 110.00,
    currentStockG: 600,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f3',
    brand: 'Sliceland',
    type: 'Flex TPU',
    colorName: 'Vermelho',
    colorHex: '#dc2626',
    weightG: 500,
    price: 160.00,
    currentStockG: 450,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_PROFILES: PrintProfile[] = [
  {
    id: 'prof1',
    name: 'Perfil Qualidade (0.16mm)',
    printerId: 'p1',
    defaultFilamentId: 'f1',
    layerHeightMm: 0.16,
    infillPercent: 15,
    speedMms: 60,
    description: 'Excelente acabamento e precisão.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prof2',
    name: 'Perfil Rápido (0.28mm)',
    printerId: 'p1',
    defaultFilamentId: 'f1',
    layerHeightMm: 0.28,
    infillPercent: 10,
    speedMms: 100,
    description: 'Prototipagem rápida e peças funcionais.',
    createdAt: new Date().toISOString(),
  }
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'João Carlos',
    phone: '5511999999999',
    instagram: 'joaocarlos_3d',
    address: 'Rua das Flores, 123 - Jardins, São Paulo - SP',
    notes: 'Gosta de miniaturas decorativas. Sempre pede em PLA preto.',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Ana Paula',
    phone: '5521988888888',
    instagram: 'ana_maker',
    address: 'Av. Atlântica, 456 - Copacabana, Rio de Janeiro - RJ',
    notes: 'Empresa de brindes. Pedidos recorrentes de suportes.',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Miniatura Dragão Articulado',
    weightG: 120,
    printTimeMins: 540, // 9 horas
    defaultFilamentId: 'f1',
    suggestedPrice: 38.00,
    description: 'Dragão impresso articulado sem suportes.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod2',
    name: 'Suporte de Headset',
    weightG: 180,
    printTimeMins: 720, // 12 horas
    defaultFilamentId: 'f2',
    suggestedPrice: 65.00,
    description: 'Suporte minimalista para headset gamer.',
    createdAt: new Date().toISOString(),
  }
];

// 20 Mock jobs distributed to sum up to:
// Revenue: 600
// Cost: 180
// Profit: 420
// Count: 20
const getMockJobs = (): PrintJob[] => {
  const jobs: PrintJob[] = [];
  const now = new Date();
  
  // Helper to generate dates spanning the last 30 days
  const getDateDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(now.getDate() - days);
    // Randomize time of day
    d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
    return d.toISOString();
  };

  // 10 Chaveiros: Cost R$4.50, Price R$15.00, Profit R$10.50 each
  for (let i = 0; i < 10; i++) {
    jobs.push({
      id: `j-chaveiro-${i}`,
      name: `Chaveiro Flexível ${i + 1}`,
      customerId: 'c1',
      printerId: 'p1',
      filamentId: 'f3',
      weightG: 15,
      printTimeMins: 45,
      qty: 1,
      failed: false,
      observations: 'Brinde rápido.',
      materialCost: 2.40,
      energyCost: 0.15,
      depreciationCost: 0.15,
      maintenanceCost: 0.10,
      packagingCost: 1.00,
      extraCostsAmount: 0.70,
      extraItems: [],
      shippingCost: 0,
      marketplaceFeePercent: 0,
      marketplaceFixedFee: 0,
      taxPercent: 0,
      markupPercent: 233, // High markup for cheap items
      totalCost: 4.50,
      suggestedPrice: 15.00,
      finalPrice: 15.00,
      netProfit: 10.50,
      createdAt: getDateDaysAgo(25 - i * 2), // Spread over 25 days
    });
  }

  // 4 Dragões: Cost R$18.00, Price R$60.00, Profit R$42.00 each
  for (let i = 0; i < 4; i++) {
    jobs.push({
      id: `j-dragao-${i}`,
      name: `Dragão Articulado ${i + 1}`,
      customerId: 'c1',
      printerId: 'p1',
      filamentId: 'f1',
      weightG: 120,
      printTimeMins: 540, // 9h
      qty: 1,
      failed: false,
      observations: 'Cliente quer na cor preta.',
      materialCost: 11.40,
      energyCost: 1.88,
      depreciationCost: 2.25,
      maintenanceCost: 0.47,
      packagingCost: 2.00,
      extraCostsAmount: 0,
      extraItems: [],
      shippingCost: 0,
      marketplaceFeePercent: 0,
      marketplaceFixedFee: 0,
      taxPercent: 0,
      markupPercent: 233,
      totalCost: 18.00,
      suggestedPrice: 60.00,
      finalPrice: 60.00,
      netProfit: 42.00,
      createdAt: getDateDaysAgo(22 - i * 5),
    });
  }

  // 2 Suportes Headset: Cost R$27.00, Price R$90.00, Profit R$63.00 each
  for (let i = 0; i < 2; i++) {
    jobs.push({
      id: `j-headset-${i}`,
      name: `Suporte Headset ${i + 1}`,
      customerId: 'c2',
      printerId: 'p2',
      filamentId: 'f2',
      weightG: 180,
      printTimeMins: 720, // 12h
      qty: 1,
      failed: false,
      observations: 'Impresso na Bambu Lab P1S.',
      materialCost: 19.80,
      energyCost: 3.99,
      depreciationCost: 4.64,
      maintenanceCost: 0.57,
      packagingCost: -2.00, // Custom packaging adjustments
      extraCostsAmount: 0,
      extraItems: [],
      shippingCost: 0,
      marketplaceFeePercent: 0,
      marketplaceFixedFee: 0,
      taxPercent: 0,
      markupPercent: 233,
      totalCost: 27.00,
      suggestedPrice: 90.00,
      finalPrice: 90.00,
      netProfit: 63.00,
      createdAt: getDateDaysAgo(15 - i * 8),
    });
  }

  // 4 Suportes de Cabo: Cost R$2.25, Price R$7.50, Profit R$5.25 each
  for (let i = 0; i < 4; i++) {
    jobs.push({
      id: `j-cabo-${i}`,
      name: `Organizador de Cabos ${i + 1}`,
      customerId: 'c2',
      printerId: 'p1',
      filamentId: 'f1',
      weightG: 10,
      printTimeMins: 30,
      qty: 1,
      failed: i === 3, // Simulate one failure (the last one) but with costs
      failedReason: i === 3 ? 'Problema de adesão à mesa' : undefined,
      observations: 'Lote pequeno de organizadores.',
      materialCost: 0.95,
      energyCost: 0.10,
      depreciationCost: 0.12,
      maintenanceCost: 0.08,
      packagingCost: 0.50,
      extraCostsAmount: 0.50,
      extraItems: [],
      shippingCost: 0,
      marketplaceFeePercent: 0,
      marketplaceFixedFee: 0,
      taxPercent: 0,
      markupPercent: 233,
      totalCost: 2.25,
      suggestedPrice: 7.50,
      finalPrice: i === 3 ? 0 : 7.50, // No revenue if failed
      netProfit: i === 3 ? -2.25 : 5.25, // Negative profit if failed
      createdAt: getDateDaysAgo(2),
    });
  }

  // Adjust last item price slightly to make sure the sums match exactly R$600 price, R$180 cost, R$420 profit
  // Current values calculation:
  // Chaveiros: 10 * 15 = 150 price, 10 * 4.5 = 45 cost, 10 * 10.5 = 105 profit
  // Dragões: 4 * 60 = 240 price, 4 * 18 = 72 cost, 4 * 42 = 168 profit
  // Headsets: 2 * 90 = 180 price, 2 * 27 = 54 cost, 2 * 63 = 126 profit
  // Cabos: 3 successful: 3 * 7.50 = 22.50 price, 3 * 2.25 = 6.75 cost, 3 * 5.25 = 15.75 profit
  //        1 failed: 0 price, 2.25 cost, -2.25 profit
  //        Total cabos: 22.50 price, 9.00 cost, 13.50 profit
  // Sum of all:
  // Price = 150 + 240 + 180 + 22.50 = 592.50
  // Cost = 45 + 72 + 54 + 9 = 180
  // Profit = 105 + 168 + 126 + 13.50 = 412.50
  // To hit EXACTLY 600 Price, 180 Cost, 420 Profit:
  // We need to add 7.50 to price, 0 to cost, and 7.50 to profit.
  // Let's change the cabos price slightly so it matches perfectly.
  // We can set successful cabos price to R$10.00 each instead of R$7.50.
  // Then 3 successful cabos = R$30.00 price, R$6.75 cost, R$23.25 profit.
  // Failed cabo = R$0 price, R$2.25 cost, -2.25 profit.
  // Total cabos = R$30 price, R$9 cost, R$21 profit.
  // Total overall:
  // Price = 150 + 240 + 180 + 30 = 600.
  // Cost = 45 + 72 + 54 + 9 = 180.
  // Profit = 105 + 168 + 126 + 21 = 420.
  // Count = 10 + 4 + 2 + 4 = 20.
  // Perfect! Let's update the successful cabos in code.
  
  jobs.forEach(job => {
    if (job.id.startsWith('j-cabo-') && !job.failed) {
      job.finalPrice = 10.00;
      job.suggestedPrice = 10.00;
      job.netProfit = 10.00 - job.totalCost;
    }
  });

  return jobs;
};

// Generic local storage helpers
const getLocal = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error('Error parsing key ' + key, e);
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initial seeding checks
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setLocal(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(KEYS.PRINTERS)) {
    setLocal(KEYS.PRINTERS, MOCK_PRINTERS);
  }
  if (!localStorage.getItem(KEYS.FILAMENTS)) {
    setLocal(KEYS.FILAMENTS, MOCK_FILAMENTS);
  }
  if (!localStorage.getItem(KEYS.PROFILES)) {
    setLocal(KEYS.PROFILES, MOCK_PROFILES);
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    setLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    setLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
  }
  if (!localStorage.getItem(KEYS.JOBS)) {
    setLocal(KEYS.JOBS, getMockJobs());
  }
};

export const StorageManager = {
  // Settings
  getSettings(): SystemSettings {
    initializeStorage();
    return getLocal(KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    setLocal(KEYS.SETTINGS, settings);
  },

  // Printers
  getPrinters(): Printer[] {
    initializeStorage();
    return getLocal(KEYS.PRINTERS, []);
  },
  savePrinter(printer: Printer): Printer[] {
    const list = this.getPrinters();
    const idx = list.findIndex(p => p.id === printer.id);
    if (idx >= 0) {
      list[idx] = { ...printer };
    } else {
      list.push({ ...printer, createdAt: new Date().toISOString() });
    }
    setLocal(KEYS.PRINTERS, list);
    return list;
  },
  deletePrinter(id: string): Printer[] {
    const list = this.getPrinters().filter(p => p.id !== id);
    setLocal(KEYS.PRINTERS, list);
    return list;
  },

  // Filaments
  getFilaments(): Filament[] {
    initializeStorage();
    return getLocal(KEYS.FILAMENTS, []);
  },
  saveFilament(filament: Filament): Filament[] {
    const list = this.getFilaments();
    const idx = list.findIndex(f => f.id === filament.id);
    if (idx >= 0) {
      list[idx] = { ...filament };
    } else {
      list.push({ ...filament, createdAt: new Date().toISOString() });
    }
    setLocal(KEYS.FILAMENTS, list);
    return list;
  },
  deleteFilament(id: string): Filament[] {
    const list = this.getFilaments().filter(f => f.id !== id);
    setLocal(KEYS.FILAMENTS, list);
    return list;
  },

  // Profiles
  getProfiles(): PrintProfile[] {
    initializeStorage();
    return getLocal(KEYS.PROFILES, []);
  },
  saveProfile(profile: PrintProfile): PrintProfile[] {
    const list = this.getProfiles();
    const idx = list.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = { ...profile };
    } else {
      list.push({ ...profile, createdAt: new Date().toISOString() });
    }
    setLocal(KEYS.PROFILES, list);
    return list;
  },
  deleteProfile(id: string): PrintProfile[] {
    const list = this.getProfiles().filter(p => p.id !== id);
    setLocal(KEYS.PROFILES, list);
    return list;
  },

  // Customers
  getCustomers(): Customer[] {
    initializeStorage();
    return getLocal(KEYS.CUSTOMERS, []);
  },
  saveCustomer(customer: Customer): Customer[] {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      list[idx] = { ...customer };
    } else {
      list.push({ ...customer, createdAt: new Date().toISOString() });
    }
    setLocal(KEYS.CUSTOMERS, list);
    return list;
  },
  deleteCustomer(id: string): Customer[] {
    const list = this.getCustomers().filter(c => c.id !== id);
    setLocal(KEYS.CUSTOMERS, list);
    return list;
  },

  // Products
  getProducts(): Product[] {
    initializeStorage();
    return getLocal(KEYS.PRODUCTS, []);
  },
  saveProduct(product: Product): Product[] {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = { ...product };
    } else {
      list.push({ ...product, createdAt: new Date().toISOString() });
    }
    setLocal(KEYS.PRODUCTS, list);
    return list;
  },
  deleteProduct(id: string): Product[] {
    const list = this.getProducts().filter(p => p.id !== id);
    setLocal(KEYS.PRODUCTS, list);
    return list;
  },

  // Print Jobs
  getPrintJobs(): PrintJob[] {
    initializeStorage();
    return getLocal(KEYS.JOBS, []);
  },
  savePrintJob(job: PrintJob): PrintJob[] {
    const list = this.getPrintJobs();
    const idx = list.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      list[idx] = { ...job };
    } else {
      list.push({ ...job, createdAt: job.createdAt || new Date().toISOString() });
      
      // Update stock of filament consumed if it's a new job and not failed
      if (!job.failed) {
        this.consumeFilamentStock(job.filamentId, job.weightG * job.qty);
      }
    }
    setLocal(KEYS.JOBS, list);
    return list;
  },
  deletePrintJob(id: string): PrintJob[] {
    const list = this.getPrintJobs().filter(j => j.id !== id);
    setLocal(KEYS.JOBS, list);
    return list;
  },

  consumeFilamentStock(filamentId: string, amountG: number): void {
    const filaments = this.getFilaments();
    const idx = filaments.findIndex(f => f.id === filamentId);
    if (idx >= 0) {
      filaments[idx].currentStockG = Math.max(0, filaments[idx].currentStockG - amountG);
      setLocal(KEYS.FILAMENTS, filaments);
    }
  }
};
