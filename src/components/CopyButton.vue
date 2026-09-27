<script setup>
import { onBeforeUnmount, ref } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
})

const copied = ref(false)
let timer = null

function flash() {
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 1500)
}

function fallbackCopy(value) {
  const textarea = document.createElement('textarea')

  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)

  textarea.select()

  document.execCommand('copy')

  document.body.removeChild(textarea)
}

async function copy() {
  const value = props.text.trim()

  try {
    await navigator.clipboard.writeText(value)
  } catch {
    fallbackCopy(value)
  }

  flash()
}

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<template>
  <button class="copy-button" type="button" @click="copy">
    <template v-if="copied">已复制</template>
    <template v-else>
      <AppIcon name="copy" />
      复制
    </template>
  </button>
</template>
