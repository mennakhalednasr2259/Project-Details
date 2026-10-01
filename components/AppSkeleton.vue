<template>
  <div class="app-skeleton">
    <div v-if="type === 'page'" class="app-skeleton__page">
      <div class="app-skeleton__line app-skeleton__line--lg" />
      <div class="app-skeleton__line app-skeleton__line--sm" />
      <div class="app-skeleton__cards">
        <div v-for="n in 4" :key="'c-'+n" class="app-skeleton__card" />
      </div>
      <div class="app-skeleton__block" />
    </div>
    <div v-else-if="type === 'table'" class="app-skeleton__table">
      <div class="app-skeleton__line app-skeleton__line--row" v-for="n in rows" :key="'r-'+n" />
    </div>
    <div v-else class="app-skeleton__line" />
  </div>
</template>

<script>
export default {
  name: 'AppSkeleton',
  props: {
    type: {
      type: String,
      default: 'page',
    },
    rows: {
      type: Number,
      default: 6,
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/assets/css/variables.scss";
.app-skeleton {
  width: 100%;
}

.app-skeleton__page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-skeleton__line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, $surface-secondary 25%, var(--skeleton-mid) 50%, $surface-secondary 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;

  &--lg {
    width: 220px;
    height: 28px;
  }

  &--sm {
    width: 280px;
    height: 12px;
  }

  &--row {
    height: 44px;
  }
}

.app-skeleton__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.app-skeleton__card,
.app-skeleton__block {
  height: 96px;
  border-radius: 10px;
  border: 1px solid $border;
  background: linear-gradient(90deg, $surface-secondary 25%, var(--skeleton-mid) 50%, $surface-secondary 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

.app-skeleton__block {
  height: 220px;
}

.app-skeleton__table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
