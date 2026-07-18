-- 0. Clean Existing Tables (Uncomment if you want a complete database reset)
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS filaments CASCADE;
DROP TABLE IF EXISTS printers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 1. Create Printers Table
CREATE TABLE IF NOT EXISTS printers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  consumption_watts DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  lifespan_hours INTEGER NOT NULL,
  annual_maintenance_cost DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Filaments Table
CREATE TABLE IF NOT EXISTS filaments (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  weight_g DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  current_stock_g DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Print Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  printer_id TEXT NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  default_filament_id TEXT REFERENCES filaments(id) ON DELETE SET NULL,
  layer_height_mm DOUBLE PRECISION,
  infill_percent INTEGER,
  speed_mms DOUBLE PRECISION,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Products Catalog Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  weight_g DOUBLE PRECISION NOT NULL,
  print_time_mins INTEGER NOT NULL,
  default_filament_id TEXT,
  suggested_price DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Print Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  printer_id TEXT NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  filament_id TEXT NOT NULL REFERENCES filaments(id) ON DELETE CASCADE,
  weight_g DOUBLE PRECISION NOT NULL,
  print_time_mins INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  failed BOOLEAN DEFAULT false NOT NULL,
  failed_reason TEXT,
  observations TEXT,
  packaging_type TEXT NOT NULL DEFAULT 'caixa',
  shipping_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  painting_time_mins INTEGER,
  painting_labor_rate DOUBLE PRECISION,
  paint_cost DOUBLE PRECISION,
  use_airbrush BOOLEAN,
  airbrush_cost DOUBLE PRECISION,
  marketplace_fee_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  marketplace_fixed_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  tax_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  markup_percent DOUBLE PRECISION NOT NULL DEFAULT 30,
  total_cost DOUBLE PRECISION NOT NULL,
  suggested_price DOUBLE PRECISION NOT NULL,
  final_price DOUBLE PRECISION NOT NULL,
  net_profit DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default-settings',
  electricity_kwh_rate DOUBLE PRECISION NOT NULL DEFAULT 0.95,
  default_tax_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  default_markup_percent DOUBLE PRECISION NOT NULL DEFAULT 30,
  default_marketplace_fee_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  default_marketplace_fixed_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  default_packaging_box_cost DOUBLE PRECISION NOT NULL DEFAULT 2.0,
  default_packaging_tape_cost DOUBLE PRECISION NOT NULL DEFAULT 0.4,
  default_packaging_bubble_wrap_cost DOUBLE PRECISION NOT NULL DEFAULT 0.8,
  currency TEXT DEFAULT 'BRL' NOT NULL,
  default_whatsapp_template TEXT,
  default_painting_labor_rate DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  default_airbrush_hourly_rate DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Seed Default Settings
INSERT INTO settings (id, electricity_kwh_rate, default_tax_percent, default_markup_percent, default_marketplace_fee_percent, default_marketplace_fixed_fee, default_packaging_box_cost, default_packaging_tape_cost, default_packaging_bubble_wrap_cost, currency, default_whatsapp_template, default_painting_labor_rate, default_airbrush_hourly_rate)
VALUES ('default-settings', 0.95, 0, 30, 0, 0, 2.0, 0.4, 0.8, 'BRL', 'Olá [Cliente]! Seu orçamento para a peça "[Peça]" ficou em [Valor]. Qualquer dúvida estou à disposição!', 20.0, 2.5)
ON CONFLICT (id) DO NOTHING;
