import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/env';

export function createApp(): Express {
  const app = express();

  // CORS Configuration - dynamically accept incoming origin (Cloud Run, dev iframe, localhost)
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsers & Cookie parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Mount API routes
  app.use('/api', apiRoutes);

  // Error Handler
  app.use(errorHandler);

  return app;
}
