export interface Printer {
  id: string;
  name: string;
  model: string;
  consumptionWatts: number;
  price: number;
  lifespanHours: number;
  annualMaintenanceCost: number;
  status: 'active' | 'printing' | 'maintenance' | 'inactive';
  createdAt: string;
}

export interface Filament {
  id: string;
  brand: string;
  type: 'PLA' | 'PETG' | 'ABS' | 'ASA' | 'TPU' | 'Resina' | string;
  colorName: string;
  colorHex: string;
  weightG: number;
  price: number;
  currentStockG: number;
  createdAt: string;
}

export interface PrintProfile {
  id: string;
  name: string;
  printerId: string;
  defaultFilamentId?: string;
  layerHeightMm?: number;
  infillPercent?: number;
  speedMms?: number;
  description?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  weightG: number;
  printTimeMins: number;
  defaultFilamentId?: string;
  suggestedPrice: number;
  description?: string;
  createdAt: string;
}

export interface ExtraItem {
  id: string;
  name: string;
  qty: number;
  unitCost: number;
}

export interface PrintJob {
  id: string;
  name: string;
  customerId: string;
  printerId: string;
  filamentId: string;
  weightG: number;
  printTimeMins: number;
  qty: number;
  failed: boolean;
  failedReason?: string;
  observations?: string;
  
  // Detailed costs
  materialCost: number;
  energyCost: number;
  depreciationCost: number;
  maintenanceCost: number;
  packagingCost: number;
  extraCostsAmount: number;
  extraItems: ExtraItem[];
  shippingCost: number;
  
  // Painting and finishing post-processing
  paintingTimeMins?: number;
  paintingLaborRate?: number;
  paintCost?: number;
  useAirbrush?: boolean;
  airbrushCost?: number;
  
  // Fees and settings used
  marketplaceFeePercent: number;
  marketplaceFixedFee: number;
  taxPercent: number;
  markupPercent: number; // profit margin
  
  // Totals
  totalCost: number;
  suggestedPrice: number;
  finalPrice: number;
  netProfit: number;
  
  createdAt: string;
}

export interface SystemSettings {
  electricityKwhRate: number; // R$ per kWh
  defaultTaxPercent: number;
  defaultMarkupPercent: number;
  defaultMarketplaceFeePercent: number;
  defaultMarketplaceFixedFee: number;
  defaultPackagingBoxCost: number;
  defaultPackagingTapeCost: number;
  defaultPackagingBubbleWrapCost: number;
  currency: string;
  defaultWhatsAppTemplate?: string;
  defaultPaintingLaborRate?: number;
  defaultAirbrushHourlyRate?: number;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  useLocalStorage: boolean;
}
