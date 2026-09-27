/**
 * Drives the real Vue app inside jsdom and checks the interactive behaviour
 * that the original page implemented with inline JavaScript, plus the parts
 * this build adds: the dashboards, the shared logo and the Docker guidance.
 *
 * Usage: npm run build:dom && node scripts/interaction-check.mjs
 */

import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

for (const name of [
  'window',
  'document',
  'navigator',
  'Element',
  'HTMLElement',
  'SVGElement',
  'Node',
  'Text',
  'Comment',
  'DocumentFragment',
  'MutationObserver',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  Object.defineProperty(globalThis, name, {
    value: dom.window[name],
    configurable: true,
    writable: true,
  })
}

const { mount } = await import('../dist-dom/dom-entry.js')
const { dockerCode, linuxCode, configCode, windowsCode } = await import('../src/data/code.js')

const { document } = dom.window
const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/* Vue patches the DOM on the next microtask, so let it settle before asserting. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

/* Click helper: jsdom's .click() dispatches a bubbling click event. */
const click = async (el) => {
  el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  await settle()
}

mount($('#app'))

/* ---------------------------------------------------------------- render */

check('app mounts', $('#app').children.length > 0)
check('footer year', $('.footer-links span span')?.textContent === String(new Date().getFullYear()))
check(
  'no vue template syntax left in text',
  !document.body.textContent.includes('{{'),
)

/* ------------------------------------------- docker placeholder guidance */

const varList = $('.var-list')

check(
  'docker section explains both placeholders',
  varList !== null && varList.querySelectorAll('dt').length === 2,
)

check(
  'placeholder explanations name the right variables',
  varList?.textContent.includes('GATEWAY_URL') &&
    varList?.textContent.includes('YOUR_GATEWAY_TOKEN'),
)

check(
  'explanations say what each value is for',
  varList?.textContent.includes('Gateway 的接入地址') &&
    varList?.textContent.includes('Gateway 用它识别和认证'),
)

/* The image reference is the probe (cqu-netprobe), pinned to a commit — not
   the gateway image, and not a rolling tag. */
const dockerCommand = $('.deploy-pane pre code')?.textContent ?? ''

check(
  'docker command uses the pinned probe image',
  dockerCommand.includes('tano26/cqu-netprobe:sha-438bd5530c76'),
  dockerCommand.split('\n').pop()?.trim(),
)

check(
  'docker command does not use the gateway image',
  !dockerCommand.includes('cqu-netprobe-gateway'),
)

/* ------------------------------------------------- packet-loss dashboard */

const GRAFANA =
  'http://grafana.tano.asia/public-dashboards/86d7f554f8704d99961fc05a4c481f44'

const grafanaLinks = $$(`a[href="${GRAFANA}"]`)

check(
  'packet-loss board linked from hero, navbar, footer and status card',
  grafanaLinks.length === 4,
  `found ${grafanaLinks.length}`,
)

check(
  'packet-loss links open in a new tab safely',
  grafanaLinks.every(
    (a) =>
      a.getAttribute('target') === '_blank' &&
      (a.getAttribute('rel') ?? '').includes('noopener'),
  ),
)

check(
  'status card offers both dashboards',
  $$('.status-action .button').length === 2,
  `found ${$$('.status-action .button').length} buttons`,
)

check(
  'navbar label is 丢包检测',
  grafanaLinks.some((a) => a.classList.contains('nav-link') && a.textContent.trim() === '丢包检测'),
)

check(
  'status card label is 丢包状态检测',
  grafanaLinks.some((a) => a.classList.contains('button') && a.textContent.trim() === '丢包状态检测'),
)

check(
  'hero offers both dashboards next to each other',
  $$('.hero-actions .button').length === 3 &&
    $('.hero-actions').textContent.includes('查看网络状态') &&
    $('.hero-actions').textContent.includes('丢包检测'),
  `hero has ${$$('.hero-actions .button').length} buttons`,
)

/* ------------------------------------------------------------ logo */

/* The original page rendered a stripped logo (no internal wireframe detail) in
   the map centre and footer. Every instance must now be the full logo.svg. */
const DETAIL = 'm10.826 6.693'

const logoSlots = [
  ['navbar', '.brand-logo svg'],
  ['map centre', '.map-center svg'],
  ['footer', '.footer-brand svg'],
]

for (const [where, selector] of logoSlots) {
  const svg = $(selector)
  const path = svg?.querySelector('path')?.getAttribute('d') ?? ''
  check(`${where} logo is the full logo.svg`, path.includes(DETAIL))
}

check(
  'navbar logo is marked decorative',
  $('.brand-logo svg')?.getAttribute('aria-hidden') === 'true',
)

check(
  'all logo instances render identical shapes',
  new Set(
    logoSlots.map(([, sel]) =>
      [...$(sel).querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|'),
    ),
  ).size === 1,
)

/* ------------------------------------------------------------ deploy tabs */

const tabs = $$('.deploy-tab')
const panes = $$('.deploy-pane')

check('two deploy tabs', tabs.length === 2, `found ${tabs.length}`)
check(
  'docker active by default',
  tabs[0].classList.contains('active') &&
    panes[0].classList.contains('active') &&
    !panes[1].classList.contains('active'),
)

await click(tabs[1])

check(
  'clicking 二进制文件 swaps panes',
  tabs[1].classList.contains('active') &&
    !tabs[0].classList.contains('active') &&
    panes[1].classList.contains('active') &&
    !panes[0].classList.contains('active'),
  `tabs=${tabs.map((t) => t.className).join(' | ')}`,
)

await click(tabs[0])

check(
  'clicking Docker swaps back',
  tabs[0].classList.contains('active') && panes[0].classList.contains('active'),
)

/* ---------------------------------------------------------- copy buttons */

/* Every button must copy the code block it sits next to. What the commands
   actually say is covered by check:fidelity, which compares each <pre> against
   the original page. */
const preTexts = $$('.deploy-pane pre code').map((el) => el.textContent.trim())

const buttons = $$('.copy-button')
check('four copy buttons', buttons.length === 4, `found ${buttons.length}`)

let copied = null
Object.defineProperty(dom.window.navigator, 'clipboard', {
  value: { writeText: async (text) => { copied = text } },
  configurable: true,
})

for (const [index, button] of buttons.entries()) {
  copied = null
  await click(button)

  check(
    `copy button ${index + 1} copies its own code block`,
    copied === preTexts[index],
    copied === preTexts[index] ? '' : `got ${JSON.stringify(copied)?.slice(0, 60)}`,
  )
}

check(
  'copy button shows 已复制 without the icon',
  buttons[0].textContent.trim() === '已复制' && buttons[0].querySelector('svg') === null,
  JSON.stringify(buttons[0].textContent),
)

await new Promise((resolve) => setTimeout(resolve, 1600))

check(
  'copy button restores after 1.5s',
  buttons[0].textContent.includes('复制') && buttons[0].querySelector('svg') !== null,
)

/* ----------------------------------------------------- fallback copy path */

let execCalled = false
Object.defineProperty(dom.window.navigator, 'clipboard', {
  value: { writeText: async () => { throw new Error('denied') } },
  configurable: true,
})
document.execCommand = () => { execCalled = true; return true }

copied = null
await click(buttons[1])

check('falls back to execCommand when clipboard is denied', execCalled)
check('fallback still reports success', buttons[1].textContent.trim() === '已复制')

/* --------------------------------------------------------- mobile nav */

Object.defineProperty(dom.window, 'innerWidth', { value: 500, writable: true, configurable: true })

const menuButton = $('.menu-button')
const navLinks = $('.nav-links')

check('menu closed initially', !navLinks.classList.contains('open'))
check('aria-expanded false initially', menuButton.getAttribute('aria-expanded') === 'false')

await click(menuButton)

check(
  'menu opens on button click',
  navLinks.classList.contains('open') && menuButton.getAttribute('aria-expanded') === 'true',
)

await click(navLinks.querySelector('.nav-link'))

check(
  'menu closes after clicking a link',
  !navLinks.classList.contains('open') && menuButton.getAttribute('aria-expanded') === 'false',
)

await click(menuButton)
await click(document.body)

check(
  'menu closes on outside click',
  !navLinks.classList.contains('open') && menuButton.getAttribute('aria-expanded') === 'false',
)

await click(menuButton)

Object.defineProperty(dom.window, 'innerWidth', { value: 1200, writable: true, configurable: true })
await click(document.body)

check(
  'outside click ignored on desktop',
  navLinks.classList.contains('open'),
)

/* ----------------------------------------------------------------- done */

const failed = results.filter((r) => !r.ok)
console.log(
  `\nRESULT: ${results.length - failed.length}/${results.length} checks passed`,
)
process.exit(failed.length ? 1 : 0)
