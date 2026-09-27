/**
 * Builds src/data/icons.js from two sources:
 *
 *   - src/assets/logo.svg          the project logo, used site-wide
 *   - reference-original.html      every other icon, taken verbatim
 *
 * The Vue components render these through <AppIcon>, so the SVG markup stays
 * byte-identical to the source instead of being retyped by hand.
 *
 * Usage: node scripts/extract-icons.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/* Shared opening of the logo outline path, used to recognise logo instances
   inside the original page so they can be replaced by logo.svg. */
const LOGO_SIGNATURE = 'm39.175 9-4.33 1.607'

function parse(svg) {
  const open = svg.match(/^<svg([\s\S]*?)>/)
  const attrs = {}
  for (const [, name, value] of open[1].matchAll(/([:\w-]+)\s*=\s*"([^"]*)"/g)) {
    attrs[name] = value
  }
  const body = svg
    .replace(/^<svg[\s\S]*?>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim()
  return { attrs, body }
}

/* ------------------------------------------------------------ page icons */

const html = fs.readFileSync(path.join(root, 'reference-original.html'), 'utf8')
const found = [...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((m) => m[0])

/* Dedupe on normalised markup: two icons that differ only in source
   whitespace (the original formats some of them differently) are one icon. */
const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s+>/g, '>').trim()

const unique = []
const seen = new Set()
for (const svg of found) {
  const key = norm(svg)
  if (!seen.has(key)) {
    seen.add(key)
    unique.push(svg.trim())
  }
}

/* Logos come from logo.svg instead. */
const pageSvgs = unique.filter((svg) => !svg.includes(LOGO_SIGNATURE))

/* Names in document order of first appearance, excluding the logo instances. */
const names = [
  'github',           // nav
  'menu',             // mobile menu button
  'arrowRightRound',  // hero primary button
  'chart',            // hero secondary button
  'checkCircle',      // hero meta
  'wifi',             // hero meta
  'window',           // hero meta
  'monitor',          // architecture node
  'chevron',          // flow arrow
  'server',           // architecture node
  'stats',            // architecture node
  'target',           // feature card
  'activity',         // feature card
  'globe',            // feature card
  'check',            // reason list
  'arrowRight',       // join panel + status card buttons
  'docker',           // deploy tab
  'download',         // deploy tab
  'copy',             // copy button
  'info',             // notice
  'warning',          // notice warning
  'downloadPlain',    // release button
  'list',             // detail card
  'measure',          // detail card
  'arrowRightLong',   // detail card
  'icmp',             // detail card
]

if (names.length !== pageSvgs.length) {
  throw new Error(
    `Expected ${pageSvgs.length} page icons, have ${names.length} names`,
  )
}

/* ---------------------------------------------------------------- output */

function entry(name, icon) {
  const attrLines = Object.entries(icon.attrs)
    .map(
      ([k, v]) =>
        `      ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${JSON.stringify(v)},`,
    )
    .join('\n')
  return `  ${name}: {\n    attrs: {\n${attrLines}\n    },\n    body: ${JSON.stringify(icon.body)},\n  },`
}

const logo = parse(
  fs.readFileSync(path.join(root, 'src/assets/logo.svg'), 'utf8').trim(),
)

const entries = [
  entry('logo', logo),
  ...pageSvgs.map((svg, index) => entry(names[index], parse(svg))),
]

const out = `/**
 * Icon markup, used by <AppIcon>.
 *
 *   logo  - from src/assets/logo.svg
 *   rest  - extracted verbatim from reference-original.html
 *
 * The logo entry is defined once and reused everywhere it appears on the page.
 * Regenerate with: node scripts/extract-icons.mjs
 */

export const icons = {
${entries.join('\n')}
}

export default icons
`

const target = path.join(root, 'src/data/icons.js')
fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, out)

console.log(
  `Wrote ${entries.length} icons (logo + ${pageSvgs.length} page icons) -> src/data/icons.js`,
)
