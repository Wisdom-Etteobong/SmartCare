import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/src/app';
import { connectDB } from './server/src/config/db';

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartCare Server is active at http://0.0.0.0:${PORT}`);
  });

  // Connect to DB asynchronously so it doesn't block server listening
  connectDB().catch(err => {
    console.warn('DB connect background message:', err?.message || err);
  });
}

startServer().catch(err => {
  console.error('Failed to start SmartCare fullstack server:', err);
});
