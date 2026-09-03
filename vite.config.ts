import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/fml/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
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
