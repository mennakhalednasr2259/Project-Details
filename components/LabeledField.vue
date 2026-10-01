<template>
  <div class="rms-labeled-field" :class="{ 'rms-labeled-field--inline': inline }">
    <label v-if="label" class="rms-labeled-field__label">{{ label }}</label>
    <div class="rms-labeled-field__control">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LabeledField',
  props: {
    label: {
      type: String,
      default: '',
    },
    inline: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
