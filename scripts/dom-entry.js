import { createApp, createSSRApp } from 'vue'
import App from '../src/App.vue'

/** Mount into an empty container (what the dev server does). */
export function mount(el) {
  const app = createApp(App)
  app.mount(el)
  return app
}

/** Hydrate server-rendered markup (what the built page does). */
export function hydrate(el) {
  const app = createSSRApp(App)
  app.mount(el)
  return app
}
