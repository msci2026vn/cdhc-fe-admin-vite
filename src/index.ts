import { drizzle } from 'drizzle-orm/postgres-js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import postgres from 'postgres';
import { createExtendedAuthDatabaseAdapter } from '@/db/auth-adapter';
import { createAdminRoutes } from '@/modules/admin';
import { createAdminV2Routes } from '@/modules/admin-v2';
import {
  type AuthVariables,
  adminMiddleware,
  approvedMiddleware,
  authMiddleware,
  createAuthRoutes,
  createPasskeyRoutes,
} from '@/modules/auth';
import { createLegacyRoutes } from '@/modules/legacy';
import { createAdminNewsRoutes, createPublicNewsRoutes } from '@/modules/news';
import { createPointsRoutes } from '@/modules/points';
import { weatherRoutes, startWeatherCron } from '@/modules/weather';
import { ensureLegacyData, getLegacyStats } from '@/scripts/ensure-legacy-data';

// ═══ FARMVERSE MODULES ═══
import { farmModule } from '@/modules/farm';
import { iotRoutes } from '@/modules/iot';
import { nftRoutes, initNftModule } from '@/modules/nft';
import { blockchainRoutes, initBlockchainModule } from '@/modules/blockchain';
import { redis } from '@/db/redis';

const client = postgres(Bun.env.DATABASE_URL!);
const db = drizzle(client);

const extendedAuthAdapter = createExtendedAuthDatabaseAdapter(db);

type Env = { Variables: AuthVariables };
const app = new Hono<Env>();

app.use('*', logger());

// Security Headers with CSP and Permissions-Policy
// NOTE: COOP và COEP disabled để cho phép Google OAuth popup
app.use(
  '*',
  secureHeaders({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: [
        "'self'",
        'https://api.cdhc.vn',
        'https://sta.cdhc.vn',
        'https://accounts.google.com',
        'https://oauth2.googleapis.com',
      ],
      frameSrc: ['https://accounts.google.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      accelerometer: [],
      gyroscope: [],
      magnetometer: [],
    },
  }),
);

const PRODUCTION_ORIGIN_PATTERN = /^https:\/\/.*\.cdhc\.vn$/;
const ROOT_DOMAIN = 'https://cdhc.vn';
const LOCAL_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) {
        return null;
      }
      if (LOCAL_ORIGINS.includes(origin)) {
        return origin;
      }
      if (origin === ROOT_DOMAIN) {
        return origin;
      }
      if (PRODUCTION_ORIGIN_PATTERN.test(origin)) {
        return origin;
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Set-Cookie'],
    maxAge: 86400,
  }),
);

app.get('/health', (c) =>
  c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  }),
);
app.get('/', (c) =>
  c.json({ name: 'CDHC API', version: '2.0.0', description: 'Con Duong Huu Co Backend API' }),
);

app.get('/api/legacy/stats', authMiddleware(), adminMiddleware(), async (c) => {
  try {
    const stats = await getLegacyStats();
    return c.json({ success: true, data: stats });
  } catch (_error) {
    return c.json({ success: false, error: 'Failed to get legacy stats' }, 500);
  }
});

// Mount routes
app.route('/api/auth', createAuthRoutes(extendedAuthAdapter));
app.route('/api/auth/passkey', createPasskeyRoutes(extendedAuthAdapter));
app.route('/api/admin', createAdminRoutes(extendedAuthAdapter));
app.route('/api/admin-v2', createAdminV2Routes());
app.route('/api/admin/news', createAdminNewsRoutes());
app.route('/api/news', createPublicNewsRoutes());
app.route('/api/legacy', createLegacyRoutes());
app.route('/api/points', createPointsRoutes(db));
app.route('/api/weather', weatherRoutes);

// ═══ FARMVERSE ROUTES ═══
// Farm module includes /farm, /iot, /blockchain sub-routes
app.route('/api', farmModule);

// Standalone IoT routes (alternative to farm's iot routes)
app.route('/api/iot', iotRoutes);

// NFT + Points routes
app.route('/api/nft', nftRoutes);

// Blockchain anchoring routes (standalone)
app.route('/api/blockchain', blockchainRoutes);

app.use('/api/protected/*', authMiddleware());
app.use('/api/protected/*', approvedMiddleware());
app.get('/api/protected/profile', (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, status: user.status },
  });
});

app.notFound((c) =>
  c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, 404),
);

app.onError((_err, c) => {
  return c.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    500,
  );
});

async function startServer() {
  const _pid = process.pid;
  await ensureLegacyData();

  const port = Number(Bun.env.PORT) || 3000;
  const _server = Bun.serve({
    port,
    hostname: '0.0.0.0',
    reusePort: true,
    fetch: app.fetch,
  });

  // Start weather cron job
  startWeatherCron();

  // ═══ INITIALIZE FARMVERSE MODULES ═══
  // Initialize NFT module with Redis instance
  try {
    initNftModule(redis, { skipEnvValidation: false });
  } catch (error) {
    console.error('[NFT] Failed to initialize:', error);
  }

  // Initialize and start Blockchain cron
  try {
    initBlockchainModule({ skipCron: false, skipEnvValidation: false });
  } catch (error) {
    console.error('[Blockchain] Failed to initialize:', error);
  }

  console.log('[FARMVERSE] All modules initialized');
}

startServer().catch((_err) => {
  process.exit(1);
});
