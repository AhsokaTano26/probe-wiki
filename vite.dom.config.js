import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/**
 * Client-side build of the mount entry, used by scripts/interaction-check.mjs
 * to drive the real app inside jsdom.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist-dom',
    minify: false,
    lib: {
      entry: 'scripts/dom-entry.js',
      formats: ['es'],
      fileName: () => 'dom-entry.js',
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
})
