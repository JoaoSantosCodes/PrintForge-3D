-- 0. Clean Existing Tables
DROP TABLE IF EXISTS audit_logs, settings, revenues, expenses, paint_jobs, print_jobs, jobs, orders, product_parts, products, addresses, customers, materials, filament_movements, filaments, printer_maintenance, printers, users, companies CASCADE;

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'starter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Matches Supabase Auth User ID
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Printers Table
CREATE TABLE IF NOT EXISTS printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  nozzle_size_mm DOUBLE PRECISION DEFAULT 0.4 NOT NULL,
  firmware_version TEXT,
  consumption_watts DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  lifespan_hours INTEGER NOT NULL,
  hours_worked DOUBLE PRECISION DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Printer Maintenance Table
CREATE TABLE IF NOT EXISTS printer_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  printer_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  cost DOUBLE PRECISION DEFAULT 0 NOT NULL,
  description TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Filaments Table
CREATE TABLE IF NOT EXISTS filaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  weight_init_g DOUBLE PRECISION NOT NULL,
  weight_current_g DOUBLE PRECISION NOT NULL,
  length_remaining_m DOUBLE PRECISION,
  price DOUBLE PRECISION NOT NULL,
  humidity_percent DOUBLE PRECISION,
  storage_location TEXT,
  batch_code TEXT,
  supplier_name TEXT,
  date_opened TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Filament Movements Table
CREATE TABLE IF NOT EXISTS filament_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filament_id UUID NOT NULL REFERENCES filaments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "in" (purchase/adjustment), "out" (print job), "correction" (manual weighing)
  amount_g DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Materials Table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- "hardware", "consumable", "packaging"
  qty_init INTEGER NOT NULL,
  qty_current INTEGER NOT NULL,
  unit_cost DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  type TEXT DEFAULT 'shipping' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Product Parts Table
CREATE TABLE IF NOT EXISTS product_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_g DOUBLE PRECISION NOT NULL,
  print_time_mins INTEGER NOT NULL,
  layer_height_mm DOUBLE PRECISION,
  infill_percent INTEGER,
  filament_brand TEXT,
  filament_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'received' NOT NULL, -- "received", "slicing", "queued", "printing", "post-process", "ready", "delivered"
  total_price DOUBLE PRECISION NOT NULL,
  final_price DOUBLE PRECISION NOT NULL,
  discount_amount DOUBLE PRECISION DEFAULT 0 NOT NULL,
  marketplace_type TEXT DEFAULT 'none' NOT NULL,
  marketplace_fee_percent DOUBLE PRECISION DEFAULT 0 NOT NULL,
  marketplace_fixed_fee DOUBLE PRECISION DEFAULT 0 NOT NULL,
  tax_percent DOUBLE PRECISION DEFAULT 0 NOT NULL,
  shipping_cost DOUBLE PRECISION DEFAULT 0 NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Create Print Jobs Table
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  printer_id UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  filament_id UUID NOT NULL REFERENCES filaments(id) ON DELETE CASCADE,
  weight_g DOUBLE PRECISION NOT NULL,
  print_time_mins INTEGER NOT NULL,
  qty INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'queued' NOT NULL, -- "queued", "printing", "finished", "failed"
  failed BOOLEAN DEFAULT false NOT NULL,
  failed_reason TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Create Paint Jobs Table
CREATE TABLE IF NOT EXISTS paint_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  print_job_id UUID NOT NULL REFERENCES print_jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' NOT NULL, -- "pending", "in-progress", "completed"
  labor_time_mins INTEGER DEFAULT 0 NOT NULL,
  labor_rate_hour DOUBLE PRECISION DEFAULT 20.0 NOT NULL,
  paint_cost DOUBLE PRECISION DEFAULT 0 NOT NULL,
  use_airbrush BOOLEAN DEFAULT false NOT NULL,
  airbrush_rate_hour DOUBLE PRECISION DEFAULT 2.5 NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- "rent", "internet", "power", "software", "raw-material", "marketing", "tax", "other"
  amount DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  type TEXT DEFAULT 'variable' NOT NULL, -- "fixed", "variable"
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Create Revenues Table
CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- "sales", "consulting", "freight", "other"
  amount DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Create System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default-settings',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  electricity_kwh_rate DOUBLE PRECISION DEFAULT 0.95 NOT NULL,
  default_tax_percent DOUBLE PRECISION DEFAULT 0 NOT NULL,
  default_markup_percent DOUBLE PRECISION DEFAULT 30 NOT NULL,
  default_marketplace_fee_percent DOUBLE PRECISION DEFAULT 0 NOT NULL,
  default_marketplace_fixed_fee DOUBLE PRECISION DEFAULT 0 NOT NULL,
  default_packaging_box_cost DOUBLE PRECISION DEFAULT 2.0 NOT NULL,
  default_packaging_tape_cost DOUBLE PRECISION DEFAULT 0.4 NOT NULL,
  default_packaging_bubble_wrap_cost DOUBLE PRECISION DEFAULT 0.8 NOT NULL,
  default_painting_labor_rate DOUBLE PRECISION DEFAULT 20.0 NOT NULL,
  default_airbrush_hourly_rate DOUBLE PRECISION DEFAULT 2.5 NOT NULL,
  default_whatsapp_template TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_printers_company ON printers(company_id);
CREATE INDEX IF NOT EXISTS idx_filaments_company ON filaments(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_company ON print_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_revenues_company ON revenues(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
