import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const sourceDir = path.resolve('public/recipes')
const outputDir = path.join(sourceDir, 'generated')
await mkdir(outputDir, { recursive: true })

const sources = (await readdir(sourceDir, { withFileTypes: true }))
  .filter(entry => entry.isFile() && /\.(?:jpe?g|png)$/i.test(entry.name))
  .map(entry => entry.name)

const variants = [
  { suffix: 'thumb', width: 192, quality: 68 },
  { suffix: 'card', width: 480, quality: 74 },
  { suffix: 'detail', width: 960, quality: 80 },
]

await Promise.all(sources.map(async filename => {
  const input = path.join(sourceDir, filename)
  const stem = filename.replace(/\.[^.]+$/, '')
  await Promise.all([
    ...variants.map(({ suffix, width, quality }) => sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: false })
      .webp({ quality, effort: 5 })
      .toFile(path.join(outputDir, `${stem}-${suffix}.webp`))),
    sharp(input)
      .rotate()
      .resize({ width: 24 })
      .blur(1)
      .webp({ quality: 35, effort: 5 })
      .toFile(path.join(outputDir, `${stem}-placeholder.webp`)),
  ])
}))

console.log(`Generated ${sources.length * 4} optimized images from ${sources.length} source files.`)
