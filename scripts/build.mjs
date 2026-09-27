/**
 * Builds the deployable site.
 *
 *   1. client bundle      -> dist/
 *   2. server bundle      -> dist-ssr/
 *   3. render the app to HTML and inline it into dist/index.html
 *
 * The page is static content, so shipping the markup means a visitor sees the
 * page immediately instead of waiting for the JS bundle to download, parse and
 * run. Vue hydrates that markup on load and takes over the interactive parts
 * (menu, tabs, copy buttons), so behaviour is unchanged.
 *
 * Usage: node scripts/build.mjs   (or: npm run build)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')
const PLACEHOLDER = '<div id="app"></div>'

/* 1 + 2 — client, then server bundle of the same components. */

await build({ root })

await build({
  root,
  build: {
    ssr: 'scripts/ssr-entry.js',
    outDir: ssrDir,
    emptyOutDir: true,
  },
})

/* 3 — render and inline. */

const { render } = await import(
  pathToFileURL(path.join(ssrDir, 'ssr-entry.js')).href
)

const markup = await render()

const indexFile = path.join(dist, 'index.html')
const doc = fs.readFileSync(indexFile, 'utf8')

if (!doc.includes(PLACEHOLDER)) {
  throw new Error(`dist/index.html has no ${PLACEHOLDER} to fill`)
}

if (!markup.trim()) {
  throw new Error('server render produced no markup')
}

fs.writeFileSync(
  indexFile,
  doc.replace(PLACEHOLDER, `<div id="app">${markup}</div>`),
)

const { size } = fs.statSync(indexFile)
console.log(
  `\nprerendered ${markup.length} bytes of markup into dist/index.html (${size} bytes total)`,
)
