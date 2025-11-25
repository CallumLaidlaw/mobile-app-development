// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@vite-pwa/nuxt',
    '@nuxt/icon',
    'nuxt-vuefire'
  ],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3000
  },
  components: [{
    path: '~/components',
    pathPrefix: false
  }],
  pwa: {
    manifest: {
      name: "PortionPro",
      short_name: "PortionPro",
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
  },
  vuefire: {
    config: {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId,
      measurementId: process.env.messasurementId
    },
    auth: {
      enabled: true,
      sessionCookie: true
    }
  },
  app: {
    baseURL: './',
  },
  ssr: false
})