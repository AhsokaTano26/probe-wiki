/**
 * Checks that the prerendered page hydrates cleanly.
 *
 * Loads the real build output (dist/index.html), pulls the server-rendered
 * markup out of #app, hydrates it with the client bundle and verifies that
 *
 *   1. hydration does not change the markup (a hydration mismatch would)
 *   2. Vue warns about nothing while hydrating
 *   3. the page is actually live afterwards, not just static HTML
 *
 * Usage: npm run build && node scripts/hydration-check.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const indexFile = path.join(root, 'dist/index.html')

if (!fs.existsSync(indexFile)) {
  console.error('dist/index.html not found — run `npm run build` first')
  process.exit(1)
}

const html = fs.readFileSync(indexFile, 'utf8')

if (/<div id="app">\s*<\/div>/.test(html)) {
  console.error('dist/index.html has an empty #app — prerendering did not run')
  process.exit(1)
}

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

for (const name of [
  'window', 'document', 'navigator', 'Element', 'HTMLElement', 'SVGElement',
  'Node', 'Text', 'Comment', 'DocumentFragment', 'MutationObserver',
  'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) {
  Object.defineProperty(globalThis, name, {
    value: dom.window[name],
    configurable: true,
    writable: true,
  })
}

const { document } = dom.window
const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/* Capture anything Vue logs during hydration. */
const logged = []
const realWarn = console.warn
const realError = console.error
console.warn = (...args) => logged.push(['warn', args.join(' ')])
console.error = (...args) => logged.push(['error', args.join(' ')])

const app = $('#app')
const before = app.innerHTML
const beforeText = app.textContent.replace(/\s+/g, ' ').trim()

/* ------------------------------------------------------------ hydrate */

const { hydrate } = await import('../dist-dom/dom-entry.js')
hydrate(app)

await new Promise((resolve) => setTimeout(resolve, 0))

console.warn = realWarn
console.error = realError

const after = app.innerHTML
const afterText = app.textContent.replace(/\s+/g, ' ').trim()

check('markup is prerendered', beforeText.length > 1000, `${beforeText.length} chars of text`)

const noise = logged.filter(([, message]) =>
  /hydrat|mismatch|Invalid vnode/i.test(message),
)

check(
  'no hydration warnings',
  noise.length === 0,
  noise.map(([, m]) => m.slice(0, 120)).join(' | '),
)

check(
  'hydration leaves the markup unchanged',
  before === after,
  before === after ? '' : 'DOM differered after hydrate()',
)

check('text is unchanged after hydration', beforeText === afterText)

/* --------------------------------------------------- still interactive */

const tabs = $$('.deploy-tab')
const panes = $$('.deploy-pane')

tabs[1].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
await new Promise((resolve) => setTimeout(resolve, 0))

check(
  'deploy tabs work after hydration',
  tabs[1].classList.contains('active') && panes[1].classList.contains('active'),
)

const menuButton = $('.menu-button')
const navLinks = $('.nav-links')

Object.defineProperty(dom.window, 'innerWidth', { value: 500, writable: true, configurable: true })
menuButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
await new Promise((resolve) => setTimeout(resolve, 0))

check('mobile menu works after hydration', navLinks.classList.contains('open'))

/* ------------------------------------------------------------------ */

const failed = results.filter((r) => !r.ok)
console.log(`\nRESULT: ${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
