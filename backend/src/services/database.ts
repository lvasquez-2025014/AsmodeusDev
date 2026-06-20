import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ludwingivanvasqueznavas_db_user:hVyc9ZTzbazjMq9i@cluster0.bswryim.mongodb.net/pagina?appName=Cluster0';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Conectado a MongoDB:', MONGO_URI);
  } catch (error) {
    console.error('[DB] Error de conexión:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[DB] Desconectado');
  });
}
