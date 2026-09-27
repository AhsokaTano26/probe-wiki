import { createSSRApp } from 'vue'
import './styles/main.css'
import App from './App.vue'

/* The build inlines server-rendered markup into index.html, so this hydrates
   the existing DOM rather than rebuilding it. scripts/build.mjs does the
   prerendering; in dev the container is empty and Vue mounts normally. */
createSSRApp(App).mount('#app')
