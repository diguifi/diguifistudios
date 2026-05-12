import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_APP_BASE_PATH ?? '/';

  return {
    base: basePath,
    plugins: [
      react(),
      {
        name: 'hash-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url ?? '/';
            if (!url.includes('#') && !url.startsWith('/@') && !url.includes('.')) {
              res.writeHead(302, { Location: '/#' + url });
              res.end();
              return;
            }
            next();
          });
        },
      },
    ],
    server: {
      port: 5174,
      open: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/app/router.tsx',
          'src/**/*.d.ts',
          'src/test/**',
          'src/data/**',
          'src/features/auth/types.ts',
          'src/features/home/types.ts',
          'src/features/orders/types.ts',
          'src/features/store/types.ts'
        ],
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90
        }
      }
    }
  };
});
