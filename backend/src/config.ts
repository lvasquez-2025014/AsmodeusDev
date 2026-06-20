export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://ludwingivanvasqueznavas_db_user:hVyc9ZTzbazjMq9i@cluster0.bswryim.mongodb.net/pagina?appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'pagina_secret_key_change_in_production',
  jwtExpiresIn: 604800,
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'AIzaSyC-QHW3Pa0k7WrLCza1unDWWTqao_uGYlg',
};
