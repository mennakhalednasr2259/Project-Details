<template>
  <header class="app-page-header">
    <div class="app-page-header__copy">
      <div v-if="breadcrumb" class="app-page-header__crumb">{{ breadcrumb }}</div>
      <h1 v-if="title" class="app-page-header__title">{{ title }}</h1>
      <p v-if="description" class="app-page-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="app-page-header__actions">
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    breadcrumb: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.app-page-header__crumb {
  font-size: 12px;
  line-height: 18px;
  color: $text-muted;
  margin-bottom: 8px;
}
</style>
