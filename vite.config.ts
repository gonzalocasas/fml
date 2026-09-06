import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fml/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.includes('/recipes/generated/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'recipe-images-v1',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        }],
      },
      manifest: {
        name: 'Family Meal League',
        short_name: 'FML',
        description: 'Swipe together. Decide dinner.',
        theme_color: '#f3efe6',
        background_color: '#f3efe6',
        display: 'standalone',
        start_url: '/fml/'
      }
    })
  ]
})
