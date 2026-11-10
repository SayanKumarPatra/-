import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { productsRouter } from './server/routes/products';
import { ordersRouter } from './server/routes/orders';
import { viewerRouter } from './server/routes/viewer';
import { adminRouter } from './server/routes/admin';
import { pdfService } from './server/pdfService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Initialize seed BCA Question Bank PDFs in private storage
  try {
    await pdfService.initializeSeedPdfs();
    console.log('Seed question bank PDFs initialized successfully in private storage.');
  } catch (err) {
    console.error('Error initializing seed question banks:', err);
  }

  // Mount API Routers
  app.use('/api', productsRouter);
  app.use('/api/checkout', ordersRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/viewer', viewerRouter);
  app.use('/api/admin', adminRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'BCA STUDY POINT',
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProd) {
    // Vite middleware for development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BCA STUDY POINT server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
