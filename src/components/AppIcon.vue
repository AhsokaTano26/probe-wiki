<script setup>
import { computed } from 'vue'
import { icons } from '@/data/icons'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  /* Marks the icon as decorative, for icons that sit next to a text label. */
  hidden: {
    type: Boolean,
    default: false,
  },
})

const icon = computed(() => icons[props.name] ?? null)
</script>

<template>
  <svg
    v-if="icon"
    v-bind="icon.attrs"
    :aria-hidden="hidden ? 'true' : null"
    v-html="icon.body"
  />
</template>
