import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: false,
      devOptions: { enabled: false },
      injectManifest: {
        // Precache build assets and the offline page only. index.html is deliberately excluded
        // so a stale app shell is never served as if it were live.
        globPatterns: ['**/*.{js,css,woff2,svg,png,ico}', 'offline.html'],
        globIgnores: ['**/index.html'],
      },
      manifest: {
        name: 'Bhandara Khao',
        short_name: 'Bhandara Khao',
        description: 'Find bhandaras, free community meals and food seva events across India.',
        lang: 'en-IN',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf8f5',
        theme_color: '#c74c07',
        categories: ['food', 'lifestyle', 'social'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Find Bhandara', url: '/bhandaras' },
          { name: 'Post a Bhandara', url: '/bhandaras/create' },
        ],
      },
    }),
  ],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});