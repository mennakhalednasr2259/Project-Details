<template>
  <div class="app-empty-state">
    <div class="app-empty-state__icon">
      <span :class="'mdi ' + icon"></span>
    </div>
    <div class="app-empty-state__title">{{ title }}</div>
    <p v-if="description" class="app-empty-state__desc">{{ description }}</p>
    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppEmptyState',
  props: {
    icon: {
      type: String,
      default: 'mdi-inbox-outline',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
}
</script>
