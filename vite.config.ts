import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * DEV SERVER SUPPORT FOR api/ FUNCTIONS
 *
 * In production Vercel runs everything in api/ as a serverless function, so the
 * browser can call /api/gemini. Vite's dev server serves only the frontend and
 * knows nothing about that folder, so without this plugin `npm run dev` would
 * 404 on /api/gemini and the AI analysis would fail locally.
 *
 * This loads the same handler Vercel runs and bridges Node's req/res to the Web
 * Request/Response objects it expects. Dev only — `apply: 'serve'` keeps it out
 * of the production build entirely.
 */
const devApiFunctions = () => ({
  name: 'dev-api-functions',
  apply: 'serve' as const,
  configureServer(server: any) {
    server.middlewares.use('/api/gemini', async (req: any, res: any) => {
      const send = (status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      };
      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);

        const request = new Request('http://localhost/api/gemini', {
          method: req.method,
          headers: req.headers,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        });

        const mod = await server.ssrLoadModule('/api/gemini.ts');
        const response: Response = await mod.default(request);

        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        server.config.logger.error(`[dev-api] /api/gemini failed: ${error}`);
        send(500, { error: 'Local API function failed. See the terminal for details.' });
      }
    });
  },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // The api/ handler reads process.env at request time. Vite loads .env into
    // its own `env` object but not into process.env, so bridge it for dev.
    if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    }
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
      },
      plugins: [react(), devApiFunctions()],
      // NOTE: every `process.env.X` read anywhere in the frontend must be listed
      // here. Vite substitutes only the exact expressions named below; any other
      // `process.env.X` compiles to `undefined` in the bundle with no warning.
      //
      // GEMINI_API_KEY is deliberately absent: anything listed here is inlined
      // into the client bundle as a readable string. The key is used only by the
      // api/gemini.ts Vercel Function, which reads it from the server environment.
      define: {
        'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL),
        'process.env.REACT_APP_ECG_SERVICE_URL': JSON.stringify(env.REACT_APP_ECG_SERVICE_URL),
        'process.env.REACT_APP_GOOGLE_TTS_API_KEY': JSON.stringify(env.REACT_APP_GOOGLE_TTS_API_KEY),
        'process.env.REACT_APP_GOOGLE_CLOUD_API_KEY': JSON.stringify(env.REACT_APP_GOOGLE_CLOUD_API_KEY),
        'process.env.REACT_APP_FIREBASE_API_KEY': JSON.stringify(env.REACT_APP_FIREBASE_API_KEY),
        'process.env.REACT_APP_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.REACT_APP_FIREBASE_AUTH_DOMAIN),
        'process.env.REACT_APP_FIREBASE_PROJECT_ID': JSON.stringify(env.REACT_APP_FIREBASE_PROJECT_ID),
        'process.env.REACT_APP_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.REACT_APP_FIREBASE_STORAGE_BUCKET),
        'process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.REACT_APP_FIREBASE_APP_ID': JSON.stringify(env.REACT_APP_FIREBASE_APP_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
