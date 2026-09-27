import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from '../src/App.vue'

export function render() {
  return renderToString(createSSRApp(App))
}
