/**
 * Audits the SVG assets:
 *   1. every <svg> in reference-original.html must map to exactly one icon
 *   2. every icon must be used by the original
 *   3. every path "d" attribute must be syntactically valid
 *
 * Usage: node scripts/audit-svgs.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { icons } from '../src/data/icons.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/* Normalise whitespace, including the space the original leaves before ">". */
const norm = (s) => s.replace(/\s+/g, ' ').replace(/\s+>/g, '>').trim()

const html = fs.readFileSync(path.join(root, 'reference-original.html'), 'utf8')
const svgs = [...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((m) => m[0])
const unique = [...new Set(svgs.map(norm))]

console.log(`original: ${svgs.length} svg elements, ${unique.length} unique after normalising\n`)

/* ---------------------------------------------------- icon <-> svg matching */

const serialize = (icon) => {
  const attrs = Object.entries(icon.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
  return norm(`<svg ${attrs}> ${icon.body} </svg>`)
}

/* Instances of the project logo now come from src/assets/logo.svg, so they are
   matched separately from the page icons. */
const LOGO_SIGNATURE = 'm39.175 9-4.33 1.607'
const logoInstances = unique.filter((svg) => svg.includes(LOGO_SIGNATURE))
const pageSvgs = unique.filter((svg) => !svg.includes(LOGO_SIGNATURE))

console.log(
  `logo instances in the original: ${logoInstances.length} ` +
    '(sourced from src/assets/logo.svg)',
)

const byMarkup = new Map()
for (const [name, icon] of Object.entries(icons)) {
  byMarkup.set(serialize(icon), name)
}

const matched = new Set()
let unmatched = 0

for (const svg of pageSvgs) {
  const name = byMarkup.get(svg)
  if (!name) {
    unmatched++
    console.log(`UNMATCHED original svg: ${svg.slice(0, 120)}...`)
  } else if (matched.has(name)) {
    console.log(`DUPLICATE mapping: ${name} matches two distinct originals`)
  } else {
    matched.add(name)
  }
}

const unused = Object.keys(icons).filter(
  (name) => name !== 'logo' && !matched.has(name),
)

if (unused.length) {
  console.log(`\nUNUSED icons: ${unused.join(', ')}`)
}

if (!unmatched && !unused.length) {
  console.log(
    `OK  all ${pageSvgs.length} page icons map one-to-one, plus the shared logo`,
  )
}

/* ------------------------------------------------- icon name references
 *
 * A typo in <AppIcon name="..."> renders nothing and raises no error, so check
 * both directions: every referenced name exists, and every icon is used. */

const componentDir = path.join(root, 'src/components')
const sources = fs
  .readdirSync(componentDir)
  .filter((file) => file.endsWith('.vue'))
  .map((file) => [file, fs.readFileSync(path.join(componentDir, file), 'utf8')])

const referenced = new Map()
const addRef = (name, file) => {
  if (!referenced.has(name)) referenced.set(name, new Set())
  referenced.get(name).add(file)
}

for (const [file, source] of sources) {
  /* Static usages: name="logo" (not :name="...", which is a binding). */
  for (const [, name] of source.matchAll(/(?<!:)\bname="([a-zA-Z][\w-]*)"/g)) {
    addRef(name, file)
  }
  /* Names supplied through the icon lists in each component's data. */
  for (const [, name] of source.matchAll(/\bicon:\s*'([a-zA-Z][\w-]*)'/g)) {
    addRef(name, file)
  }
}

const unknown = [...referenced.keys()].filter((name) => !(name in icons))
const unusedIcons = Object.keys(icons).filter((name) => !referenced.has(name))

if (unknown.length) {
  console.log('\nUNKNOWN icon names referenced by components:')
  for (const name of unknown) {
    console.log(`  ${name}  (in ${[...referenced.get(name)].join(', ')})`)
  }
} else {
  console.log(
    `\nOK  all ${referenced.size} referenced icon names exist in src/data/icons.js`,
  )
}

if (unusedIcons.length) {
  console.log(`\nUNUSED icons: ${unusedIcons.join(', ')}`)
} else {
  console.log('OK  every icon is referenced by a component')
}

/* --------------------------------------------------------- path validation */

const ARGS = {
  M: 2, m: 2, L: 2, l: 2, H: 1, h: 1, V: 1, v: 1, C: 6, c: 6,
  S: 4, s: 4, Q: 4, q: 4, T: 2, t: 2, A: 7, a: 7, Z: 0, z: 0,
}

const TOKEN = /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g

function validatePath(d) {
  const errors = []

  const leftover = d.replace(
    /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?|[\s,]/g,
    '',
  )
  if (leftover) {
    errors.push(`unparseable characters ${JSON.stringify(leftover.slice(0, 40))}`)
  }

  const tokens = d.match(TOKEN) || []
  let i = 0
  let cmd = null

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      cmd = tokens[i]
      i++
      if (!(cmd in ARGS)) {
        errors.push(`unknown command ${cmd}`)
        break
      }
      if (ARGS[cmd] === 0) continue
    } else if (cmd === null) {
      errors.push('number before any command')
      break
    }

    let count = 0
    while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
      i++
      count++
    }

    const need = ARGS[cmd]
    if (need === 0) {
      errors.push(`${cmd} takes no arguments but got ${count}`)
    } else if (count === 0 || count % need !== 0) {
      errors.push(`${cmd} got ${count} arguments (needs a multiple of ${need})`)
    }

    if (cmd === 'M') cmd = 'L'
    else if (cmd === 'm') cmd = 'l'
  }

  return errors
}

function checkFile(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const paths = [...source.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1])

  console.log(`\n${file}: ${paths.length} path elements`)

  let bad = 0
  paths.forEach((d, index) => {
    const errors = validatePath(d)
    if (errors.length) {
      bad++
      console.log(`  path[${index}] INVALID: ${errors.join('; ')}`)
      console.log(`     ${d.slice(0, 90)}`)
    }
  })

  if (!bad) console.log('  all paths parse cleanly')
  return bad
}

let badPaths = 0
for (const d of unique) {
  for (const [, dAttr] of d.matchAll(/\sd="([^"]+)"/g)) {
    const errors = validatePath(dAttr)
    if (errors.length) {
      badPaths++
      console.log(`\nINVALID path in original html: ${errors.join('; ')}`)
      console.log(`  ${dAttr.slice(0, 90)}`)
    }
  }
}

badPaths += checkFile('src/assets/logo.svg')

const problems =
  unmatched + unused.length + badPaths + unknown.length + unusedIcons.length

console.log(
  `\nRESULT: ${unmatched + unused.length === 0 ? 'icon mapping clean' : 'icon mapping problems'}, ` +
    `${unknown.length + unusedIcons.length === 0 ? 'all references valid' : 'reference problems'}, ` +
    `${badPaths === 0 ? 'all paths valid' : badPaths + ' invalid path(s)'}`,
)
process.exit(problems === 0 ? 0 : 1)
