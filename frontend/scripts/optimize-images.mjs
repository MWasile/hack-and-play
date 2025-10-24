#!/usr/bin/env node
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, statSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = join(__dirname, '..')

const srcPng = join(root, 'src', 'assets', 'bg.png')
const outWebp = join(root, 'src', 'assets', 'bg.webp')
const outAvif = join(root, 'src', 'assets', 'bg.avif')

console.log('[optimize-images] root =', root)
console.log('[optimize-images] src =', srcPng)

if (!existsSync(srcPng)) {
  console.error('[optimize-images] Not found:', srcPng)
  process.exit(1)
}

async function run() {
  console.log('[optimize-images] Converting to WebP...')
  await sharp(srcPng).webp({ quality: 82 }).toFile(outWebp)
  console.log('[optimize-images] Converting to AVIF...')
  await sharp(srcPng).avif({ quality: 60 }).toFile(outAvif)

  const webpOk = existsSync(outWebp) && statSync(outWebp).size > 0
  const avifOk = existsSync(outAvif) && statSync(outAvif).size > 0
  if (webpOk && avifOk) {
    console.log('[optimize-images] Done:', outWebp, outAvif)
  } else {
    console.error('[optimize-images] Failed to produce outputs')
    process.exit(2)
  }
}

run().catch((e) => {
  console.error('[optimize-images] Error:', e)
  process.exit(1)
})

