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

// Abendhimmel für das Fenster.
export function skyTexture() {
  const [c, ctx] = canvas(256, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#7fa6d6')
  g.addColorStop(0.6, '#f3c58f')
  g.addColorStop(1, '#f19a6b')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  // Silhouette von Bäumen
  const rand = seeded(11)
  ctx.fillStyle = 'rgba(70,60,70,0.55)'
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.arc(i * 32 + rand() * 10, 250, 30 + rand() * 25, 0, Math.PI * 2)
    ctx.fill()
  }
  return toTexture(c)
}

// Abstrakte Bilder für die Rahmen.
export function artTexture(seed: number) {
  const rand = seeded(seed)
  const [c, ctx] = canvas(256, 320)
  ctx.fillStyle = '#f4ece1'
  ctx.fillRect(0, 0, 256, 320)
  const palette = ['#d98b5f', '#2f4858', '#86a397', '#e9c46a', '#a45a52']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)]
    ctx.globalAlpha = 0.9
    if (rand() > 0.5) {
      ctx.beginPath()
      ctx.arc(40 + rand() * 176, 40 + rand() * 240, 25 + rand() * 50, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(rand() * 180, rand() * 240, 40 + rand() * 80, 30 + rand() * 90)
    }
  }
  ctx.globalAlpha = 1
  return toTexture(c)
}
