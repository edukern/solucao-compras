import { PNG } from 'pngjs'
import pngToIco from 'png-to-ico'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../resources')

function makeBoltPng(size) {
  const png = new PNG({ width: size, height: size })

  const bg   = { r: 26,  g: 26,  b: 46  } // #1a1a2e
  const bolt = { r: 255, g: 255, b: 255 } // white

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      png.data[idx]     = bg.r
      png.data[idx + 1] = bg.g
      png.data[idx + 2] = bg.b
      png.data[idx + 3] = 255
    }
  }

  // Bolt polygon (normalized from 64x64 viewBox, centered with 20% padding)
  // Original points: 36,14 24,36 31,36 28,50 40,28 33,28
  const pad = size * 0.18
  const scale = (size - pad * 2) / 64

  const points = [
    [36, 14], [24, 36], [31, 36],
    [28, 50], [40, 28], [33, 28]
  ].map(([px, py]) => [pad + px * scale, pad + py * scale])

  // Scanline fill
  const minY = Math.floor(Math.min(...points.map(p => p[1])))
  const maxY = Math.ceil(Math.max(...points.map(p => p[1])))
  const n = points.length

  for (let y = minY; y <= maxY; y++) {
    const xs = []
    for (let i = 0; i < n; i++) {
      const [x1, y1] = points[i]
      const [x2, y2] = points[(i + 1) % n]
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
      }
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i < xs.length - 1; i += 2) {
      for (let x = Math.floor(xs[i]); x <= Math.ceil(xs[i + 1]); x++) {
        if (x < 0 || x >= size || y < 0 || y >= size) continue
        const idx = (y * size + x) * 4
        png.data[idx]     = bolt.r
        png.data[idx + 1] = bolt.g
        png.data[idx + 2] = bolt.b
        png.data[idx + 3] = 255
      }
    }
  }

  return PNG.sync.write(png)
}

// Generate sizes for ICO (16, 32, 48, 256)
const sizes = [16, 32, 48, 256]
const pngBuffers = sizes.map(s => makeBoltPng(s))

// Save 256x256 PNG for electron-builder
writeFileSync(join(OUT, 'icon.png'), pngBuffers[3])
console.log('icon.png saved')

// Generate ICO with all sizes
const ico = await pngToIco(pngBuffers)
writeFileSync(join(OUT, 'icon.ico'), ico)
console.log('icon.ico saved')
