import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './services/database';
import { config } from './config';
import { ProductModel } from './models/product.model';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import productRoutes from './routes/product.routes';
import vendedorRoutes from './routes/vendedor.routes';
import clienteRoutes from './routes/cliente.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendedor', vendedorRoutes);
app.use('/api/cliente', clienteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function seedProducts() {
  const count = await ProductModel.countDocuments();
  if (count > 0) return;

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

  await ProductModel.insertMany(products);
  console.log('[Seed] 5 productos iniciales creados');
}

async function start() {
  await connectDatabase();
  await seedProducts();
  app.listen(config.port, () => {
    console.log(`[Server] Corriendo en http://localhost:${config.port}`);
  });
}

start();
