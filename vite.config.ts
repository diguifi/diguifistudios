import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_APP_BASE_PATH ?? '/';

  return {
    base: basePath,
    plugins: [react()],
    server: {
      port: 5174,
      open: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        reporter: ['text', 'html']
      }
    }
  };
});
