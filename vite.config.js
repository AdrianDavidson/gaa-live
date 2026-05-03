import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // In dev, /api/fixtures is not served by Vite — call TheSportsDB directly
  // via the VITE_USE_DIRECT_API flag set in .env.development
  server: {
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'GAA Live',
        short_name: 'GAA Live',
        description: 'Live GAA scores, fixtures, results and free streams',
        theme_color: '#006633',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/(feeds\.rte\.ie|hoganstand\.com|www\.bbc\.co\.uk\/sport\/rss)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rss-cache',
              expiration: { maxAgeSeconds: 600 },
            },
          },
        ],
      },
    }),
  ],
})
