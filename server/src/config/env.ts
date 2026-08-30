import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcare',
  jwtSecret: process.env.JWT_SECRET || 'smartcare_secure_jwt_production_secret_key_892348923749823',
  jwtExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};
