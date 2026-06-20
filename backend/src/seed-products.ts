import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { connectDatabase } from './services/database';
import { ProductModel } from './models/product.model';

const products = [
  {
    name: 'Panel VIP PC',
    description: 'Panel completo para Free Fire en PC con ESP, Aimbot, Radar y más',
    category: 'Free Fire PC',
    prices: [
      { duration: '1 Día', price: 1 },
      { duration: '7 Días', price: 5 },
      { duration: '14 Días', price: 10 },
      { duration: '30 Días', price: 20 },
      { duration: '90 Días', price: 30 },
      { duration: '365 Días', price: 40 },
    ],
    stock: 999,
    badge: 'HOT',
    badgeType: 'danger',
    icon: 'fas fa-desktop',
  },
  {
    name: 'Bypass APK',
    description: 'Bypass para detección APK en Free Fire',
    category: 'Free Fire Bypass',
    prices: [
      { duration: '1 Día', price: 1 },
      { duration: '7 Días', price: 4 },
      { duration: '14 Días', price: 9 },
      { duration: '30 Días', price: 12 },
    ],
    stock: 999,
    badge: 'VIP',
    badgeType: 'info',
    icon: 'fas fa-shield-alt',
  },
  {
    name: 'Panel Proxy Android',
    description: 'Panel proxy para cuentas principales Android',
    category: 'Free Fire Proxy',
    prices: [
      { duration: '1 Día', price: 2 },
      { duration: '3 Días', price: 5 },
      { duration: '7 Días', price: 11 },
      { duration: '30 Días', price: 25 },
    ],
    stock: 999,
    badge: 'ANDROID',
    badgeType: 'success',
    icon: 'fas fa-mobile-alt',
  },
  {
    name: 'Panel Proxy iOS',
    description: 'Panel proxy para cuentas principales iOS',
    category: 'Free Fire Proxy',
    prices: [
      { duration: '1 Día', price: 2 },
      { duration: '3 Días', price: 5 },
      { duration: '7 Días', price: 11 },
      { duration: '30 Días', price: 25 },
    ],
    stock: 999,
    badge: 'iOS',
    badgeType: 'purple',
    icon: 'fas fa-mobile-alt',
  },
  {
    name: 'Diamantes',
    description: 'Diamantes Free Fire baratos',
    category: 'Free Fire Diamantes',
    prices: [],
    stock: 0,
    badge: 'PRÓXIMAMENTE',
    badgeType: 'warning',
    icon: 'fas fa-gem',
  },
];

async function seed() {
  await connectDatabase();
  const count = await ProductModel.countDocuments();
  if (count > 0) {
    console.log(`[Seed] Ya existen ${count} productos, saltando`);
    process.exit(0);
    return;
  }
  await ProductModel.insertMany(products);
  console.log(`[Seed] ${products.length} productos creados`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
