import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

mkdirSync('./public/icons', { recursive: true })

function generate(svgPath, outputPath, size) {
  const svg    = readFileSync(svgPath, 'utf8')
  const resvg  = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  const buffer = resvg.render().asPng()
  writeFileSync(outputPath, buffer)
  console.log(`✓ ${outputPath} (${size}x${size})`)
}

generate('./src/assets/icon.svg',          './public/icons/icon-192.png',          192)
generate('./src/assets/icon.svg',          './public/icons/icon-512.png',          512)
generate('./src/assets/icon-maskable.svg', './public/icons/icon-512-maskable.png', 512)
generate('./src/assets/icon.svg',          './public/favicon.png',                  64)

console.log('\nAll icons generated.')
