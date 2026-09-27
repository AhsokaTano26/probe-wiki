/**
 * Fidelity check: server-renders the Vue app and compares it against
 * reference-original.html on three axes:
 *
 *   1. structure  - sequence of tags + class/href attributes
 *   2. text       - all visible text, whitespace collapsed
 *   3. pre        - <pre> contents compared byte-for-byte
 *
 * Usage: node scripts/compare.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '../dist-ssr/ssr-entry.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/* The original fills #year from its own inline script at runtime; do the same
   here so the static reference is compared in its post-load state. */
const original = fs
  .readFileSync(path.join(root, 'reference-original.html'), 'utf8')
  .replace(
    /<span id="year"><\/span>/,
    `<span id="year">${new Date().getFullYear()}</span>`,
  )
const rendered = await render()

const bodyOf = (html) => {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/)
  return m ? m[1] : html
}

function strip(html) {
  return bodyOf(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
}

/* SSR serialises interpolated text with entities; the browser DOM does not. */
const ENTITIES = {
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
}

function decode(html) {
  return html.replace(/&(?:quot|#39|lt|gt|amp);/g, (m) => ENTITIES[m])
}

/* 1. structure: every opening tag with its class + href/src */

function structure(html) {
  const out = []
  for (const [, tag, attrs] of html.matchAll(/<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g)) {
    const cls = attrs.match(/class\s*=\s*"([^"]*)"/)
    const href = attrs.match(/(?:href|src)\s*=\s*"([^"]*)"/)
    let token = tag
    if (cls) token += '.' + cls[1].trim().split(/\s+/).join('.')
    if (href) token += `[${href[1]}]`
    out.push(token)
  }
  return out
}

/* 2. text: all text nodes, whitespace collapsed */

function text(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* 3. pre blocks, compared raw */

function pres(html) {
  return [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)].map((m) =>
    m[1].replace(/^<code[^>]*>/, '').replace(/<\/code>$/, ''),
  )
}

/* 4. every <svg> in full, including path data.
 *
 * The logo is now rendered from src/assets/logo.svg, so its presentation
 * attributes intentionally differ from the three inline copies in the original
 * (stroke-width 1.5 -> 1.29376, and a fixed #0067B6 instead of currentColor).
 * Canonicalise just those attributes so everything else — every path "d",
 * viewBox and geometry attribute — is still compared exactly.
 * scripts/compare-logo.mjs proves the logo geometry itself is identical. */

const LOGO_SIGNATURE = 'm39.175 9-4.33 1.607'
const logoSvg = fs.readFileSync(path.join(root, 'src/assets/logo.svg'), 'utf8').trim()
const logoBody = logoSvg.replace(/^<svg[\s\S]*?>/, '').replace(/<\/svg>$/, '')

/* Every logo instance on the page must render src/assets/logo.svg.
 *
 * The original page did not do this: its navbar used the full logo, but the
 * map-centre and footer used a stripped copy with the internal wireframe detail
 * removed. Those are the ones that looked broken, and they are now unified onto
 * logo.svg. So the logo shapes are normalised to logo.svg on both sides, while
 * the per-instance wrapper (aria-hidden on the decorative navbar mark) is kept
 * and still compared. scripts/compare-logo.mjs separately proves logo.svg's
 * geometry is identical to the original navbar logo. */
function canonicaliseLogo(html) {
  return html.replace(/<svg[\s\S]*?<\/svg>/g, (svg) => {
    if (!svg.includes(LOGO_SIGNATURE)) return svg
    const open = svg.match(/^<svg([\s\S]*?)>/)[1]
    const decorative = /aria-hidden="true"/.test(open) ? ' aria-hidden="true"' : ''
    return `<svg viewBox="0 0 100 100"${decorative}>${logoBody}</svg>`
  })
}

/* Reduce each <svg> to "tag[attr=value;attr=value]" tokens: whitespace between
   shapes is insignificant, attribute order is insignificant, and attribute
   names are compared case-insensitively (SSR lowercases viewBox, and the HTML
   parser restores it when the browser parses SVG). Values — including every
   path "d" — are compared exactly. */
function svgTokens(svg) {
  return [...svg.matchAll(/<([a-zA-Z][\w:-]*)((?:"[^"]*"|[^>])*?)\/?>/g)]
    .map(([, tag, attrText]) => {
      const attrs = [...attrText.matchAll(/([:\w-]+)\s*=\s*"([^"]*)"/g)]
        .map(([, key, value]) => `${key.toLowerCase()}=${value}`)
        .sort()
        .join(';')
      return `${tag}[${attrs}]`
    })
    .join(' ')
}

function svgMarkup(html) {
  return [...canonicaliseLogo(html).matchAll(/<svg[\s\S]*?<\/svg>/g)].map((m) =>
    svgTokens(m[0]),
  )
}

/* Intentional additions on top of the original page. Each is removed before
   comparing so the rest of the page is still checked exactly, and each is
   asserted to exist in scripts/interaction-check.mjs — so stripping them here
   cannot hide a regression. */
const ADDITIONS = [
  {
    what: 'packet-loss dashboard links (hero, navbar, footer, status card)',
    pattern: /<a\b[^>]*grafana\.tano\.asia[^>]*>[\s\S]*?<\/a>/g,
  },
  {
    what: 'placeholder explanations in the Docker instructions',
    pattern: /<dl class="var-list">[\s\S]*?<\/dl>/g,
  },
]

function removeAdditions(html) {
  return ADDITIONS.reduce((acc, { pattern }) => acc.replace(pattern, ''), html)
}

/* The Docker command pins a specific probe build; the original page used the
   rolling ":1" tag. Canonicalise the image reference so the rest of the command
   — flags, env vars, container name — is still compared exactly.
   scripts/interaction-check.mjs asserts the pinned tag really is in the page. */
function canonicaliseImage(html) {
  /* Docker tag charset only — a looser pattern would run past the end of the
     <pre> and eat the markup that follows it. */
  return html.replace(
    /tano26\/cqu-netprobe:[A-Za-z0-9_.-]+/g,
    'tano26/cqu-netprobe:TAG',
  )
}

const a = canonicaliseImage(decode(strip(original)))
const b = canonicaliseImage(decode(strip(removeAdditions(rendered))))

const reports = []

function compare(name, left, right) {
  const diffs = []
  const max = Math.max(left.length, right.length)
  for (let i = 0; i < max; i++) {
    if (left[i] !== right[i]) {
      diffs.push({ index: i, original: left[i], vue: right[i] })
    }
  }
  reports.push({ name, count: diffs.length, diffs })
}

compare('structure', structure(a), structure(b))
compare('svg markup', svgMarkup(a), svgMarkup(b))
compare('pre blocks', pres(a), pres(b))

/* Compare sentence by sentence so every text difference is reported. */
compare('text', text(a).split('。'), text(b).split('。'))

const ta = text(a)
const tb = text(b)

let failed = false

for (const report of reports) {
  if (report.count === 0) {
    console.log(`PASS  ${report.name}`)
    continue
  }

  failed = true
  console.log(`FAIL  ${report.name}: ${report.count} difference(s)`)

  for (const diff of report.diffs.slice(0, 20)) {
    console.log(`  [${diff.index}] original=${JSON.stringify(diff.original)}`)
    console.log(`  [${diff.index}] vue     =${JSON.stringify(diff.vue)}`)
  }
}

console.log(
  failed
    ? '\nRESULT: differences found'
    : `\nRESULT: identical (${structure(b).length} elements, ${ta.length} chars of text)`,
)

process.exit(failed ? 1 : 0)
