// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true
  },
  modules: [
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "@nuxt/content",
    "@nuxthq/studio",
    "@pinia/nuxt",
  ],
  experimental: {
    typedPages: true,
  },
  ssr: false,
  css: [
    '@unocss/reset/tailwind.css',
  ],
})