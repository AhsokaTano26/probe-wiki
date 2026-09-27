<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { githubRepo } from '@/data/links'
import { navLinks } from '@/data/nav'

const open = ref(false)
const navEl = ref(null)
const menuButtonEl = ref(null)

function close() {
  open.value = false
}

/* Close the menu when clicking outside of it on small screens. */
function onDocumentClick(event) {
  if (window.innerWidth > 900) {
    return
  }

  if (navEl.value?.contains(event.target)) {
    return
  }

  if (menuButtonEl.value?.contains(event.target)) {
    return
  }

  close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <header class="navbar">
    <div class="container nav-inner">

      <a class="brand" href="#top" aria-label="重庆大学蓝盟 CQU NetProbe">

        <div class="brand-logo">
          <AppIcon name="logo" hidden />
        </div>

        <div class="brand-text">
          <span class="brand-name">重庆大学蓝盟</span>
          <span class="brand-subtitle">CQU NetProbe</span>
        </div>

      </a>

      <nav
        ref="navEl"
        :class="open ? 'nav-links open' : 'nav-links'"
      >

        <a
          v-for="link in navLinks"
          :key="link.href"
          class="nav-link"
          :href="link.href"
          :target="link.external ? '_blank' : null"
          :rel="link.external ? 'noopener noreferrer' : null"
          @click="close"
        >
          {{ link.label }}
        </a>

        <a
          class="github-link"
          :href="githubRepo"
          target="_blank"
          rel="noopener noreferrer"
          @click="close"
        >
          <AppIcon name="github" />
          GitHub
        </a>

      </nav>

      <button
        ref="menuButtonEl"
        class="menu-button"
        type="button"
        aria-label="打开导航菜单"
        :aria-expanded="String(open)"
        @click="open = !open"
      >
        <AppIcon name="menu" />
      </button>

    </div>
  </header>
</template>
