// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ["@unocss/nuxt", "@vueuse/nuxt"],
  ssr: false,
  css: [
    '@unocss/reset/tailwind.css',
  ],
})