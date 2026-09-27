/**
 * Compares the shapes in logo.svg against the logo drawn inline in
 * reference-original.html by converting both to absolute point lists.
 *
 * Usage: node scripts/compare-logo.mjs
 */

import fs from 'node:fs'

const TOKEN = /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
const ARGS = {
  M: 2, m: 2, L: 2, l: 2, H: 1, h: 1, V: 1, v: 1, C: 6, c: 6,
  S: 4, s: 4, Q: 4, q: 4, T: 2, t: 2, A: 7, a: 7, Z: 0, z: 0,
}

/** Convert a path to absolute subpaths of points (curves recorded by endpoint). */
function toPoints(d) {
  const tokens = d.match(TOKEN) || []
  const subpaths = []
  let current = null
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let i = 0
  let cmd = null

  const push = (px, py) => {
    current.push([round(px), round(py)])
  }
  const round = (n) => Math.round(n * 1000) / 1000

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      cmd = tokens[i]
      i++
    } else if (cmd === null) {
      break
    }

    const upper = cmd.toUpperCase()
    const rel = cmd !== upper
    const need = ARGS[upper]

    if (upper === 'Z') {
      x = startX
      y = startY
      cmd = null
      continue
    }

    const args = []
    for (let k = 0; k < need && i < tokens.length; k++, i++) {
      args.push(parseFloat(tokens[i]))
    }
    if (args.length < need) break

    switch (upper) {
      case 'M':
        x = rel ? x + args[0] : args[0]
        y = rel ? y + args[1] : args[1]
        startX = x
        startY = y
        current = [[round(x), round(y)]]
        subpaths.push(current)
        cmd = rel ? 'l' : 'L'
        break
      case 'L':
        x = rel ? x + args[0] : args[0]
        y = rel ? y + args[1] : args[1]
        push(x, y)
        break
      case 'H':
        x = rel ? x + args[0] : args[0]
        push(x, y)
        break
      case 'V':
        y = rel ? y + args[0] : args[0]
        push(x, y)
        break
      case 'C':
        x = rel ? x + args[4] : args[4]
        y = rel ? y + args[5] : args[5]
        push(x, y)
        break
      case 'S':
      case 'Q':
        x = rel ? x + args[2] : args[2]
        y = rel ? y + args[3] : args[3]
        push(x, y)
        break
      case 'T':
        x = rel ? x + args[0] : args[0]
        y = rel ? y + args[1] : args[1]
        push(x, y)
        break
      case 'A':
        x = rel ? x + args[5] : args[5]
        y = rel ? y + args[6] : args[6]
        push(x, y)
        break
    }
  }

  return subpaths
}

const original = fs.readFileSync('reference-original.html', 'utf8')
const logo = fs.readFileSync('src/assets/logo.svg', 'utf8')

const pathsOf = (html) =>
  [...html.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1])

const logoPaths = pathsOf(logo)
const refPaths = pathsOf(original)

/* Each inline logo instance is an outline path followed by a solid base path.
   Use the first instance as the reference for logo.svg's two paths. */
const outline = logoPaths[0].slice(0, 20)
const first = refPaths.findIndex((d) => d.startsWith(outline))
const refLogo = refPaths.slice(first, first + logoPaths.length)

console.log(`logo.svg paths: ${logoPaths.length}`)
console.log(`reference paths starting with the logo outline: ${refLogo.length}\n`)

for (let p = 0; p < logoPaths.length; p++) {
  const mine = toPoints(logoPaths[p])
  const theirs = refLogo[p] ? toPoints(refLogo[p]) : null

  console.log(`--- path ${p} ---`)
  console.log(`  logo.svg  : ${mine.length} subpath(s), ${mine.flat().length} point(s)`)
  console.log(`  original  : ${theirs ? `${theirs.length} subpath(s), ${theirs.flat().length} point(s)` : 'MISSING'}`)

  if (!theirs) continue

  const a = JSON.stringify(mine)
  const b = JSON.stringify(theirs)

  if (a === b) {
    console.log('  MATCH: identical geometry')
    continue
  }

  console.log('  DIFFERENT geometry')
  const max = Math.max(mine.flat().length, theirs.flat().length)
  const flatA = mine.flat()
  const flatB = theirs.flat()
  for (let k = 0; k < max; k++) {
    const pa = flatA[k]
    const pb = flatB[k]
    if (JSON.stringify(pa) !== JSON.stringify(pb)) {
      console.log(`    point[${k}] logo.svg=${JSON.stringify(pa)} original=${JSON.stringify(pb)}`)
    }
  }
}
