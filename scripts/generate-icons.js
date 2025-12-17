const sharp = require('sharp')
const fs = require('fs')

const svg192 = `
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#2563eb"/>
  <text x="96" y="130" font-size="100" text-anchor="middle" fill="white">🧊</text>
</svg>
`

const svg512 = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <text x="256" y="350" font-size="280" text-anchor="middle" fill="white">🧊</text>
</svg>
`

async function generate() {
  await sharp(Buffer.from(svg192))
    .png()
    .toFile('public/icon-192.png')
  
  await sharp(Buffer.from(svg512))
    .png()
    .toFile('public/icon-512.png')
  
  console.log('✅ Icônes générées : public/icon-192.png et public/icon-512.png')
}

generate().catch(console.error)

