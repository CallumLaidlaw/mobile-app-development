// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/content', '@vite-pwa/nuxt', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3000
  },
  plugins: ['~/plugins/firebase.ts'],
  pwa: {
    manifest: {
      name: "Recipe App",
      short_name: "Recipes",
      description: "A simple app helping to browse and manage recipes",
      icons: [
        {
          src: '/icons/cookbook-64x64.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: '/icons/cookbook-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/cookbook-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/cookbook-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})