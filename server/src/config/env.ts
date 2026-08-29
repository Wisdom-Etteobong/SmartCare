import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://wisdomoffiong688_db_user:5GqnVTEronVPleDF@cluster0.9h8mjin.mongodb.net/?appName=Cluster0',
  jwtSecret: process.env.JWT_SECRET || 'smartcare_secure_jwt_production_secret_key_892348923749823',
  jwtExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};
