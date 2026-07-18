import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      error: 'Supabase URL or Publishable Key is missing from env variables.'
    }, { status: 500 });
  }

  // Create standard Supabase Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Clean existing records (in order of dependencies)
    await supabase.from('jobs').delete().neq('id', '');
    await supabase.from('products').delete().neq('id', '');
    await supabase.from('customers').delete().neq('id', '');
    await supabase.from('profiles').delete().neq('id', '');
    await supabase.from('filaments').delete().neq('id', '');
    await supabase.from('printers').delete().neq('id', '');

    // 2. Mock Printers Data
    const printers = [
      {
        id: 'p1',
        name: 'Ender 3 V3',
        model: 'Creality',
        consumption_watts: 220,
        price: 2200,
        lifespan_hours: 10000,
        annual_maintenance_cost: 350,
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'p2',
        name: 'Bambu Lab P1S',
        model: 'Bambu Lab',
        consumption_watts: 350,
        price: 5800,
        lifespan_hours: 15000,
        annual_maintenance_cost: 600,
        status: 'active',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // 3. Mock Filaments Data
    const filaments = [
      {
        id: 'f1',
        brand: '3D Fila',
        type: 'PLA',
        color_name: 'Preto Premium',
        color_hex: '#18181b',
        weight_g: 1000,
        price: 95.00,
        current_stock_g: 850,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'f2',
        brand: 'eSun',
        type: 'PETG',
        color_name: 'Azul Translúcido',
        color_hex: '#2563eb',
        weight_g: 1000,
        price: 110.00,
        current_stock_g: 600,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'f3',
        brand: 'Sliceland',
        type: 'Flex TPU',
        color_name: 'Vermelho',
        color_hex: '#dc2626',
        weight_g: 500,
        price: 160.00,
        current_stock_g: 450,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // 4. Mock Print Profiles
    const profiles = [
      {
        id: 'prof1',
        name: 'Perfil Qualidade (0.16mm)',
        printer_id: 'p1',
        default_filament_id: 'f1',
        layer_height_mm: 0.16,
        infill_percent: 15,
        speed_mms: 60,
        description: 'Excelente acabamento e precisão.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'prof2',
        name: 'Perfil Rápido (0.28mm)',
        printer_id: 'p1',
        default_filament_id: 'f1',
        layer_height_mm: 0.28,
        infill_percent: 10,
        speed_mms: 100,
        description: 'Prototipagem rápida e peças funcionais.',
        created_at: new Date().toISOString(),
      }
    ];

    // 5. Mock Customers
    const customers = [
      {
        id: 'c1',
        name: 'João Carlos',
        phone: '5511999999999',
        instagram: 'joaocarlos_3d',
        address: 'Rua das Flores, 123 - Jardins, São Paulo - SP',
        notes: 'Gosta de miniaturas decorativas. Sempre pede em PLA preto.',
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'c2',
        name: 'Ana Paula',
        phone: '5521988888888',
        instagram: 'ana_maker',
        address: 'Av. Atlântica, 456 - Copacabana, Rio de Janeiro - RJ',
        notes: 'Empresa de brindes. Pedidos recorrentes de suportes.',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // 6. Mock Products Catalog
    const products = [
      {
        id: 'prod1',
        name: 'Miniatura Dragão Articulado',
        weight_g: 120,
        print_time_mins: 540,
        default_filament_id: 'f1',
        suggested_price: 38.00,
        description: 'Dragão impresso articulado sem suportes.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'prod2',
        name: 'Suporte de Headset',
        weight_g: 180,
        print_time_mins: 720,
        default_filament_id: 'f2',
        suggested_price: 65.00,
        description: 'Suporte minimalista para headset gamer.',
        created_at: new Date().toISOString(),
      }
    ];

    // Insert Base Tables
    await supabase.from('printers').insert(printers);
    await supabase.from('filaments').insert(filaments);
    await supabase.from('profiles').insert(profiles);
    await supabase.from('customers').insert(customers);
    await supabase.from('products').insert(products);

    // 7. Mock Jobs (summing up to precisely: Revenue R$600, Cost R$180, Profit R$420, Count 20)
    const jobs = [];
    const now = new Date();
    const getDateDaysAgo = (days: number) => {
      const d = new Date();
      d.setDate(now.getDate() - days);
      d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
      return d.toISOString();
    };

    // 10 Chaveiros: Cost R$4.50, Price R$15.00, Profit R$10.50 each
    for (let i = 0; i < 10; i++) {
      jobs.push({
        id: `j-chaveiro-${i}`,
        name: `Chaveiro Flexível ${i + 1}`,
        customer_id: 'c1',
        printer_id: 'p1',
        filament_id: 'f3',
        weight_g: 15,
        print_time_mins: 45,
        qty: 1,
        failed: false,
        observations: 'Brinde rápido.',
        packaging_type: 'none',
        shipping_cost: 0,
        marketplace_fee_percent: 0,
        marketplace_fixed_fee: 0,
        tax_percent: 0,
        markup_percent: 233,
        total_cost: 4.50,
        suggested_price: 15.00,
        final_price: 15.00,
        net_profit: 10.50,
        created_at: getDateDaysAgo(25 - i * 2),
      });
    }

    // 4 Dragões: Cost R$18.00, Price R$60.00, Profit R$42.00 each
    for (let i = 0; i < 4; i++) {
      jobs.push({
        id: `j-dragao-${i}`,
        name: `Dragão Articulado ${i + 1}`,
        customer_id: 'c1',
        printer_id: 'p1',
        filament_id: 'f1',
        weight_g: 120,
        print_time_mins: 540,
        qty: 1,
        failed: false,
        observations: 'Cliente quer na cor preta.',
        packaging_type: 'caixa',
        shipping_cost: 0,
        marketplace_fee_percent: 0,
        marketplace_fixed_fee: 0,
        tax_percent: 0,
        markup_percent: 233,
        total_cost: 18.00,
        suggested_price: 60.00,
        final_price: 60.00,
        net_profit: 42.00,
        created_at: getDateDaysAgo(22 - i * 5),
      });
    }

    // 6 Suportes: Cost R$23.00, Price R$35.00, Profit R$12.00 each
    for (let i = 0; i < 6; i++) {
      jobs.push({
        id: `j-suporte-${i}`,
        name: `Suporte Gamer ${i + 1}`,
        customer_id: 'c2',
        printer_id: 'p2',
        filament_id: 'f2',
        weight_g: 150,
        print_time_mins: 360,
        qty: 1,
        failed: false,
        observations: 'Empresa de eSports.',
        packaging_type: 'saco',
        shipping_cost: 0,
        marketplace_fee_percent: 0,
        marketplace_fixed_fee: 0,
        tax_percent: 0,
        markup_percent: 52,
        total_cost: 23.00,
        suggested_price: 35.00,
        final_price: 35.00,
        net_profit: 12.00,
        created_at: getDateDaysAgo(20 - i * 3),
      });
    }

    // Insert Jobs Table
    await supabase.from('jobs').insert(jobs);

    return NextResponse.json({
      status: 'success',
      message: 'Supabase database seeded successfully!',
      stats: {
        printers: printers.length,
        filaments: filaments.length,
        profiles: profiles.length,
        customers: customers.length,
        products: products.length,
        jobs: jobs.length,
      }
    });

  } catch (error: any) {
    console.error('Error seeding Supabase: ', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error occurred while seeding.'
    }, { status: 500 });
  }
}
