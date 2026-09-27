<script setup>
import CopyButton from './CopyButton.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="code-block">

    <div class="code-header">

      <span class="code-title">
        {{ title }}
      </span>

      <CopyButton :text="code" />

    </div>

    <pre><code>{{ code }}</code></pre>

  </div>
</template>
