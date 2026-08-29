import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

async function start() {
  await connectDB();
  const app = createApp();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`SmartCare Backend Server running on http://0.0.0.0:${config.port}`);
    console.log(`API endpoints available at http://0.0.0.0:${config.port}/api`);
  });
}

start().catch(err => {
  console.error('Fatal backend startup error:', err);
  process.exit(1);
});
