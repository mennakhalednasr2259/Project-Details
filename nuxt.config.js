export default {
  ssr: false,
  target: 'static',
  components: true,
  head: {
    title: 'PROJECT DETAILS',
    htmlAttrs: { lang: 'ar', dir: 'rtl' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#315C56' },
    ],
  },
  css: [
    'vuetify/dist/vuetify.min.css',
    '@mdi/font/css/materialdesignicons.min.css',
    'quill/dist/quill.snow.css',
    '~/assets/css/main.scss',
  ],
  plugins: [{ src: '~/plugins/training.client.js', mode: 'client' }],
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    rtl: true,
    defaultAssets: { font: false, icons: 'mdi' },
    theme: {
      themes: {
        light: {
          primary: '#315C56', secondary: '#17202A', accent: '#4A7A73',
          error: '#B54747', info: '#426B8A', success: '#36785B',
          warning: '#B7791F', background: '#F7F8FA', surface: '#FFFFFF',
        },
        dark: {
          primary: '#5E938B', secondary: '#232B30', accent: '#70A59D',
          error: '#D16A6A', info: '#6A92B0', success: '#5A9A78',
          warning: '#D4A04A', background: '#12171A', surface: '#1B2226',
        },
      },
    },
  },
  build: {
    transpile: ['vuedraggable'],
  },
}
