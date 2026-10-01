<template>
  <v-app>
    <div class="locale-switch-row">
      <button
        type="button"
        class="theme-switch"
        :aria-label="themeActionLabel"
        :title="themeActionLabel"
        @click="toggleTheme"
      >
        <span class="mdi" :class="darkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night'" aria-hidden="true"></span>
        {{ themeActionLabel }}
      </button>
      <button
        type="button"
        class="locale-switch"
        :aria-label="locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
        :title="locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'"
        @click="toggleLocale"
      >{{ locale === 'ar' ? 'English' : 'العربية' }}</button>
    </div>
    <Nuxt />
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return { darkMode: false }
  },
  computed: {
    locale() {
      return this.$i18n.locale
    },
    themeActionLabel() {
      if (this.locale === 'ar') return this.darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'
      return this.darkMode ? 'Light mode' : 'Dark mode'
    },
  },
  mounted() {
    this.$vuetify.rtl = this.locale === 'ar'
    this.applyTheme(window.localStorage.getItem('project-details-theme') === 'dark')
  },
  methods: {
    applyTheme(isDark) {
      this.darkMode = Boolean(isDark)
      document.documentElement.classList.toggle('theme-dark', this.darkMode)
      document.documentElement.dataset.theme = this.darkMode ? 'dark' : 'light'
      this.$vuetify.theme.dark = this.darkMode
    },
    toggleTheme() {
      this.applyTheme(!this.darkMode)
      window.localStorage.setItem('project-details-theme', this.darkMode ? 'dark' : 'light')
    },
    toggleLocale() {
      const nextLocale = this.locale === 'ar' ? 'en' : 'ar'
      this.$i18n.setLocale(nextLocale)
      this.$vuetify.rtl = nextLocale === 'ar'
    },
  },
}
</script>
