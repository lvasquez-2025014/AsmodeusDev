import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './services/database';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
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
app.use('/api/vendedor', vendedorRoutes);
app.use('/api/cliente', clienteRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`[Server] Corriendo en http://localhost:${config.port}`);
  });
}

start();
