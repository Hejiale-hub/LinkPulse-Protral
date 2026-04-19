<template>
  <svg
    class="colored-iconfont"
    :class="sizeClass"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
  >
    <use :href="fragment" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Sprite symbol id without `#` (from iconfont.js), e.g. icon-icon-sousuo */
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const fragment = computed(() => `#${props.name}`)
const sizeClass = computed(() => `colored-iconfont--${props.size}`)
</script>

<style scoped>
.colored-iconfont {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  /* Keep symbol path fills; do not use currentColor */
}

.colored-iconfont--sm {
  width: 0.95em;
  height: 0.95em;
}

.colored-iconfont--md {
  width: 1.65em;
  height: 1.65em;
}

.colored-iconfont--lg {
  width: 2.48em;
  height: 2.48em;
}
</style>
