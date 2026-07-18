'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell, { TabType } from '@/components/LayoutShell';
import { StorageManager, initializeStorage } from '@/lib/storage';
import { Printer, Filament, PrintProfile, Customer, Product, PrintJob, SystemSettings } from '@/types';

// Views
import DashboardView from '@/components/views/DashboardView';
import NewPrintView from '@/components/views/NewPrintView';
import HistoryView from '@/components/views/HistoryView';
import FilamentsView from '@/components/views/FilamentsView';
import PrintersView from '@/components/views/PrintersView';
import ProfilesView from '@/components/views/ProfilesView';
import CustomersView from '@/components/views/CustomersView';
import ProductsView from '@/components/views/ProductsView';
import ReportsView from '@/components/views/ReportsView';
import SettingsView from '@/components/views/SettingsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // States
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [profiles, setProfiles] = useState<PrintProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    electricityKwhRate: 0.95,
    defaultTaxPercent: 0,
    defaultMarkupPercent: 30,
    defaultMarketplaceFeePercent: 0,
    defaultMarketplaceFixedFee: 0,
    defaultPackagingBoxCost: 2.00,
    defaultPackagingTapeCost: 0.40,
    defaultPackagingBubbleWrapCost: 0.80,
    currency: 'BRL',
  });

  // Catalog sell product prefill state
  const [prefilledProduct, setPrefilledProduct] = useState<Product | null>(null);

  // Load database on mount
  useEffect(() => {
    initializeStorage();
    loadAllData();
    
    // Register Service Worker for PWA offline support
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('PWA Service Worker registrado com sucesso:', reg.scope);
      }).catch((err) => {
        console.error('Falha ao registrar PWA Service Worker:', err);
      });
    }
    
    // Check URL search params for default tab (e.g. ?tab=new-print)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && [
        'dashboard', 'new-print', 'history', 'filaments', 
        'printers', 'profiles', 'customers', 'products', 
        'reports', 'settings'
      ].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
    
    setIsLoaded(true);
  }, []);

  const loadAllData = () => {
    setPrinters(StorageManager.getPrinters());
    setFilaments(StorageManager.getFilaments());
    setProfiles(StorageManager.getProfiles());
    setCustomers(StorageManager.getCustomers());
    setProducts(StorageManager.getProducts());
    setJobs(StorageManager.getPrintJobs());
    setSettings(StorageManager.getSettings());
  };

  // Sync tab updates to address bar without reloading
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Callback triggers
  const handleSavePrinter = (printer: Printer) => {
    const list = StorageManager.savePrinter(printer);
    setPrinters(list);
  };

  const handleDeletePrinter = (id: string) => {
    const list = StorageManager.deletePrinter(id);
    setPrinters(list);
  };

  const handleSaveFilament = (filament: Filament) => {
    const list = StorageManager.saveFilament(filament);
    setFilaments(list);
  };

  const handleDeleteFilament = (id: string) => {
    const list = StorageManager.deleteFilament(id);
    setFilaments(list);
  };

  const handleSaveProfile = (profile: PrintProfile) => {
    const list = StorageManager.saveProfile(profile);
    setProfiles(list);
  };

  const handleDeleteProfile = (id: string) => {
    const list = StorageManager.deleteProfile(id);
    setProfiles(list);
  };

  const handleSaveCustomer = (customer: Customer) => {
    const list = StorageManager.saveCustomer(customer);
    setCustomers(list);
  };

  const handleDeleteCustomer = (id: string) => {
    const list = StorageManager.deleteCustomer(id);
    setCustomers(list);
  };

  const handleSaveProduct = (product: Product) => {
    const list = StorageManager.saveProduct(product);
    setProducts(list);
  };

  const handleDeleteProduct = (id: string) => {
    const list = StorageManager.deleteProduct(id);
    setProducts(list);
  };

  const handleSaveJob = (job: PrintJob) => {
    const list = StorageManager.savePrintJob(job);
    setJobs(list);
    // Reload filaments because stock might have been consumed
    setFilaments(StorageManager.getFilaments());
  };

  const handleDeleteJob = (id: string) => {
    const list = StorageManager.deletePrintJob(id);
    setJobs(list);
  };

  const handleSaveSettings = (newSettings: SystemSettings) => {
    StorageManager.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleResetDatabase = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      initializeStorage();
      loadAllData();
      setActiveTab('dashboard');
      alert('Banco local reiniciado com sucesso!');
    }
  };

  // Sell product shortcut callback
  const handleSellProductShortcut = (product: Product) => {
    setPrefilledProduct(product);
    handleTabChange('new-print');
  };

  const handleClearPrefilledProduct = () => {
    setPrefilledProduct(null);
  };

  // Show a loading skeleton or blank screen until hydration finishes
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center p-2 shadow-md shadow-violet-500/25 animate-pulse">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-current stroke-2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
            Carregando Estúdio...
          </span>
        </div>
      </div>
    );
  }

  // Render proper sub-view based on tab state
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            jobs={jobs}
            printers={printers}
            filaments={filaments}
            setActiveTab={handleTabChange}
          />
        );
      case 'new-print':
        return (
          <NewPrintView 
            printers={printers}
            filaments={filaments}
            profiles={profiles}
            customers={customers}
            settings={settings}
            prefilledProduct={prefilledProduct}
            onSaveJob={handleSaveJob}
            onAddCustomer={handleSaveCustomer}
            onAddFilament={handleSaveFilament}
            onClearPrefilledProduct={handleClearPrefilledProduct}
          />
        );
      case 'history':
        return (
          <HistoryView 
            jobs={jobs}
            printers={printers}
            filaments={filaments}
            customers={customers}
            onDeleteJob={handleDeleteJob}
          />
        );
      case 'filaments':
        return (
          <FilamentsView 
            filaments={filaments}
            onSave={handleSaveFilament}
            onDelete={handleDeleteFilament}
          />
        );
      case 'printers':
        return (
          <PrintersView 
            printers={printers}
            jobs={jobs}
            onSave={handleSavePrinter}
            onDelete={handleDeletePrinter}
          />
        );
      case 'profiles':
        return (
          <ProfilesView 
            profiles={profiles}
            printers={printers}
            filaments={filaments}
            onSave={handleSaveProfile}
            onDelete={handleDeleteProfile}
          />
        );
      case 'customers':
        return (
          <CustomersView 
            customers={customers}
            jobs={jobs}
            settings={settings}
            onSave={handleSaveCustomer}
            onDelete={handleDeleteCustomer}
          />
        );
      case 'products':
        return (
          <ProductsView 
            products={products}
            filaments={filaments}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            onSellProduct={handleSellProductShortcut}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            jobs={jobs}
            printers={printers}
            filaments={filaments}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return (
          <DashboardView 
            jobs={jobs}
            printers={printers}
            filaments={filaments}
            setActiveTab={handleTabChange}
          />
        );
    }
  };

  return (
    <LayoutShell activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderActiveView()}
    </LayoutShell>
  );
}
