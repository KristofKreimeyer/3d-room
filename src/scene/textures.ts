import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Alle Texturen werden zur Laufzeit auf kleine Canvas gezeichnet.
// Das spart Downloads und hält die Szene leicht.

export function seeded(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function toTexture(c: HTMLCanvasElement, repeat?: [number, number]) {
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  if (repeat) {
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.repeat.set(...repeat)
  }
  return tex
}

// Holzdielen bzw. Holzmaserung: Streifen mit leichter Farbvariation und feinen Linien.
export function woodTexture({
  base,
  planks,
  seed,
  repeat,
}: {
  base: [number, number, number]
  planks: number
  seed: number
  repeat?: [number, number]
}) {
  const rand = seeded(seed)
  const [c, ctx] = canvas(512, 512)
  const plankH = 512 / planks
  for (let i = 0; i < planks; i++) {
    const shade = 0.88 + rand() * 0.2
    const [r, g, b] = base.map((v) => Math.min(255, v * shade))
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(0, i * plankH, 512, plankH)
    // Maserung
    for (let j = 0; j < 14; j++) {
      ctx.strokeStyle = `rgba(60,35,15,${0.04 + rand() * 0.06})`
      ctx.lineWidth = 1 + rand() * 1.5
      const y = i * plankH + rand() * plankH
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(170, y + rand() * 6 - 3, 340, y + rand() * 6 - 3, 512, y + rand() * 4 - 2)
      ctx.stroke()
    }
    // Fuge zwischen den Dielen, versetzte Stöße
    ctx.fillStyle = 'rgba(40,22,10,0.35)'
    ctx.fillRect(0, i * plankH, 512, 1.5)
    if (planks > 1) ctx.fillRect(((i * 197) % 400) + 50, i * plankH, 1.5, plankH)
  }
  return toTexture(c, repeat)
}

// Bildschirm: Editor mit Code-Zeilen und einer Projektkachel-Vorschau.
export function screenTexture() {
  const rand = seeded(7)
  const [c, ctx] = canvas(512, 300)
  ctx.fillStyle = '#1b1e26'
  ctx.fillRect(0, 0, 512, 300)
  ctx.fillStyle = '#252a35'
  ctx.fillRect(0, 0, 512, 22)
  ;['#ff6159', '#ffbd2e', '#28c941'].forEach((col, i) => {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(14 + i * 16, 11, 5, 0, Math.PI * 2)
    ctx.fill()
  })
  const colors = ['#c678dd', '#61afef', '#98c379', '#e5c07b', '#abb2bf']
  for (let i = 0; i < 16; i++) {
    let x = 20 + (i % 5 === 0 ? 0 : 18 * (1 + Math.floor(rand() * 2)))
    const y = 38 + i * 15.5
    const parts = 1 + Math.floor(rand() * 4)
    for (let p = 0; p < parts; p++) {
      const w = 20 + rand() * 60
      ctx.fillStyle = colors[Math.floor(rand() * colors.length)]
      ctx.globalAlpha = 0.85
      ctx.fillRect(x, y, w, 6)
      x += w + 8
    }
  }
  ctx.globalAlpha = 1
  // Vorschau-Fenster rechts
  ctx.fillStyle = '#f6efe6'
  ctx.fillRect(320, 40, 172, 240)
  ctx.fillStyle = '#9a5b2c'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText('Projekte', 336, 72)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#e0a46e', '#8fb3a0', '#c9a6d6'][i]
    ctx.fillRect(336, 90 + i * 60, 140, 48)
  }
  return toTexture(c)
}

// Smartphone-Sperrbildschirm.
export function phoneTexture() {
  const [c, ctx] = canvas(128, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#f2a65a')
  g.addColorStop(1, '#6b3f7a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 256)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = 'bold 34px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('16:20', 64, 70)
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText('Kontakt', 64, 92)
  return toTexture(c)
}

// Whiteboard mit Überschrift, Haftnotizen und Marker-Skizzen.
export function whiteboardTexture() {
  const rand = seeded(3)
  const [c, ctx] = canvas(768, 460)
  ctx.fillStyle = '#fbfbf8'
  ctx.fillRect(0, 0, 768, 460)
  ctx.font = 'bold 54px "Segoe Print", "Comic Sans MS", cursive'
  ctx.fillStyle = '#2b5fa8'
  ctx.fillText('Skills', 40, 80)
  ctx.strokeStyle = '#2b5fa8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(40, 96)
  ctx.quadraticCurveTo(140, 104, 220, 94)
  ctx.stroke()
  // Mindmap-Skizze
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  const cx = 230
  const cy = 280
  ctx.beginPath()
  ctx.ellipse(cx, cy, 70, 40, 0, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * 72, cy + Math.sin(a) * 42)
    ctx.lineTo(cx + Math.cos(a) * 150, cy + Math.sin(a) * 110)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * 165, cy + Math.sin(a) * 120, 14, 0, Math.PI * 2)
    ctx.stroke()
  }
  // Haftnotizen
  const notes = ['#ffe680', '#ffb3c7', '#a8e6cf', '#ffd2a1', '#b5d8ff', '#ffe680']
  notes.forEach((col, i) => {
    const x = 460 + (i % 3) * 95
    const y = 70 + Math.floor(i / 3) * 110 + rand() * 12
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rand() - 0.5) * 0.15)
    ctx.fillStyle = col
    ctx.fillRect(0, 0, 80, 80)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    for (let l = 0; l < 3; l++) ctx.fillRect(10, 18 + l * 18, 30 + rand() * 30, 4)
    ctx.restore()
  })
  ctx.strokeStyle = '#c0392b'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(470, 330)
  ctx.lineTo(560, 380)
  ctx.lineTo(650, 340)
  ctx.lineTo(730, 400)
  ctx.stroke()
  return toTexture(c)
}

// Blick vom Balkon: warmer Nachmittagshimmel, Baumkronen und ein Dach in der Ferne.
export function skyTexture() {
  const rand = seeded(11)
  const [c, ctx] = canvas(512, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#a9c8e4')
  g.addColorStop(1, '#f6dfb8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)
  ctx.fillStyle = '#9b4f3c'
  ctx.fillRect(140, 190, 240, 70)
  const greens = ['#7fa54a', '#9cbc58', '#6a9140', '#b7cf6a', '#c9b84f']
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = greens[Math.floor(rand() * greens.length)]
    ctx.globalAlpha = 0.75
    const x = rand() * 512
    const y = 20 + rand() * 170 + (Math.abs(x - 256) < 120 ? 20 : -20)
    ctx.beginPath()
    ctx.arc(x, y, 12 + rand() * 26, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  return toTexture(c)
}

// Fotocollage: neun Bilder in Graustufen und warmen Tönen, bewusst abstrakt.
export function collageTexture() {
  const rand = seeded(5)
  const [c, ctx] = canvas(288, 368)
  ctx.fillStyle = '#f7f3ec'
  ctx.fillRect(0, 0, 288, 368)
  const tones = ['#5b5b5b', '#8a8a8a', '#b9a58f', '#7a6a5c', '#a7b3ba', '#c9b28f']
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      const x = 16 + col * 90 + rand() * 6
      const y = 16 + r * 116 + rand() * 6
      ctx.fillStyle = tones[Math.floor(rand() * tones.length)]
      ctx.fillRect(x, y, 76, 100)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath()
      ctx.arc(x + 38, y + 44, 18, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return toTexture(c)
}
