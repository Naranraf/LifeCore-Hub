import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'LyfeCore Hub',
        short_name: 'LyfeCore',
        description: 'All-in-one life management SaaS — Finance, Health, Productivity, and AI.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0c',
        theme_color: '#3b82f6',
        orientation: 'portrait-primary',
        categories: ['productivity', 'finance', 'health'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Allow larger bundles to be precached (default is 2MB)
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Network-first for navigation (SPA)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/__(\/.*)?$/],
        // Cache JS, CSS, and image assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Runtime caching for Firebase/API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ],
})
