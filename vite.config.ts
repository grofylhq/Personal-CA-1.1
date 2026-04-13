import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      'process.env.SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY),
    },
    server: {
      proxy: {
        '/api/openrouter': {
          target: 'https://openrouter.ai/api/v1/chat/completions',
          changeOrigin: true,
          rewrite: () => '',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.OPENROUTER_API_KEY;
              if (key) {
                proxyReq.setHeader('Authorization', `Bearer ${key}`);
              }
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('HTTP-Referer', 'https://personal-ca.local');
              proxyReq.setHeader('X-OpenRouter-Title', 'Personal CA');
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ai': ['@google/genai', 'openai', '@anthropic-ai/sdk'],
            'vendor-charts': ['recharts'],
          },
        },
      },
    },
  };
});
