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

// Bildschirm: dunkler Editor mit Neon-Syntax und einer Projekt-Vorschau.
export function screenTexture() {
  const rand = seeded(7)
  const [c, ctx] = canvas(512, 300)
  ctx.fillStyle = '#080a12'
  ctx.fillRect(0, 0, 512, 300)
  ctx.fillStyle = '#10131f'
  ctx.fillRect(0, 0, 512, 22)
  ;['#ff2bd6', '#19e6ff', '#8a4dff'].forEach((col, i) => {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(14 + i * 16, 11, 4, 0, Math.PI * 2)
    ctx.fill()
  })
  const colors = ['#ff2bd6', '#19e6ff', '#8a4dff', '#ffb03b', '#8fa3c4']
  for (let i = 0; i < 16; i++) {
    let x = 20 + (i % 5 === 0 ? 0 : 18 * (1 + Math.floor(rand() * 2)))
    const y = 38 + i * 15.5
    const parts = 1 + Math.floor(rand() * 4)
    for (let p = 0; p < parts; p++) {
      const w = 20 + rand() * 60
      ctx.fillStyle = colors[Math.floor(rand() * colors.length)]
      ctx.globalAlpha = 0.9
      ctx.fillRect(x, y, w, 6)
      x += w + 8
    }
  }
  ctx.globalAlpha = 1
  // Vorschau-Fenster rechts
  ctx.fillStyle = '#0e1220'
  ctx.fillRect(320, 40, 172, 240)
  ctx.strokeStyle = '#19e6ff'
  ctx.lineWidth = 2
  ctx.strokeRect(320, 40, 172, 240)
  ctx.fillStyle = '#19e6ff'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText('Projekte', 336, 72)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#ff2bd6', '#8a4dff', '#ffb03b'][i]
    ctx.globalAlpha = 0.85
    ctx.fillRect(336, 90 + i * 60, 140, 48)
  }
  ctx.globalAlpha = 1
  return toTexture(c)
}

// Smartphone-Sperrbildschirm im Neon-Verlauf.
export function phoneTexture() {
  const [c, ctx] = canvas(128, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#ff2bd6')
  g.addColorStop(1, '#19113a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 256)
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = 'bold 34px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('23:42', 64, 70)
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillText('Kontakt', 64, 92)
  return toTexture(c)
}

// Glas-Board: dunkel, mit Neonschrift, Mindmap und leuchtenden Notizen.
export function whiteboardTexture() {
  const rand = seeded(3)
  const [c, ctx] = canvas(768, 460)
  ctx.fillStyle = '#0b0d14'
  ctx.fillRect(0, 0, 768, 460)
  ctx.shadowBlur = 12
  ctx.shadowColor = '#19e6ff'
  ctx.font = 'bold 54px "Segoe Print", "Comic Sans MS", cursive'
  ctx.fillStyle = '#19e6ff'
  ctx.fillText('Skills', 40, 80)
  ctx.strokeStyle = '#19e6ff'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(40, 96)
  ctx.quadraticCurveTo(140, 104, 220, 94)
  ctx.stroke()
  // Mindmap-Skizze
  ctx.strokeStyle = '#ff2bd6'
  ctx.shadowColor = '#ff2bd6'
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
  // Leuchtende Notizen
  const notes = ['#ffb03b', '#ff2bd6', '#19e6ff', '#8a4dff', '#19e6ff', '#ffb03b']
  notes.forEach((col, i) => {
    const x = 460 + (i % 3) * 95
    const y = 70 + Math.floor(i / 3) * 110 + rand() * 12
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rand() - 0.5) * 0.15)
    ctx.shadowColor = col
    ctx.fillStyle = col
    ctx.globalAlpha = 0.85
    ctx.fillRect(0, 0, 80, 80)
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    for (let l = 0; l < 3; l++) ctx.fillRect(10, 18 + l * 18, 30 + rand() * 30, 4)
    ctx.restore()
  })
  return toTexture(c)
}

// Blick vom Balkon: Nachtstadt mit Hochhäusern, Neonreklamen und leuchtenden Fenstern.
export function skyTexture(day = false) {
  if (day) return daySkyTexture()
  const rand = seeded(11)
  const [c, ctx] = canvas(512, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#0a0620')
  g.addColorStop(0.55, '#3a0f5c')
  g.addColorStop(1, '#ff2bd6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)
  const lights = ['#19e6ff', '#ff2bd6', '#ffb03b', '#e8f3ff']
  // Zwei Reihen Hochhäuser: hinten heller, vorn dunkel
  for (const [row, shade, minH, maxH] of [
    [0, '#1a1034', 70, 150],
    [1, '#080612', 40, 110],
  ] as const) {
    let x = -10
    while (x < 520) {
      const w = 22 + rand() * 38
      const h = minH + rand() * (maxH - minH)
      ctx.fillStyle = shade
      ctx.fillRect(x, 256 - h, w, h)
      for (let wy = 256 - h + 6; wy < 250; wy += 9) {
        for (let wx = x + 4; wx < x + w - 5; wx += 8) {
          if (rand() > 0.62) {
            ctx.fillStyle = lights[Math.floor(rand() * lights.length)]
            ctx.globalAlpha = row === 0 ? 0.55 : 0.9
            ctx.fillRect(wx, wy, 3, 4)
          }
        }
      }
      ctx.globalAlpha = 1
      x += w + 2 + rand() * 6
    }
  }
  return toTexture(c)
}

// Tageshimmel: helle Stadt mit wenigen beleuchteten Fenstern.
function daySkyTexture() {
  const rand = seeded(11)
  const [c, ctx] = canvas(512, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#6fb4f0')
  g.addColorStop(0.7, '#cfe8fa')
  g.addColorStop(1, '#ffe9c9')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 256)
  for (const [shade, minH, maxH] of [
    ['#a9b6cc', 70, 150],
    ['#7b88a3', 40, 110],
  ] as const) {
    let x = -10
    while (x < 520) {
      const w = 22 + rand() * 38
      const h = minH + rand() * (maxH - minH)
      ctx.fillStyle = shade
      ctx.fillRect(x, 256 - h, w, h)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      for (let wy = 256 - h + 6; wy < 250; wy += 9) {
        for (let wx = x + 4; wx < x + w - 5; wx += 8) {
          if (rand() > 0.7) ctx.fillRect(wx, wy, 3, 4)
        }
      }
      x += w + 2 + rand() * 6
    }
  }
  return toTexture(c)
}

// Neon-Poster, bewusst abstrakt. Variante 0: Gitter-Sonne, Variante 1: Stadt-Skyline mit Glitch-Streifen.
export function collageTexture(variant: 0 | 1 = 0) {
  const rand = seeded(17)
  const [c, ctx] = canvas(288, 368)
  ctx.fillStyle = '#0b0d14'
  ctx.fillRect(0, 0, 288, 368)
  if (variant === 0) {
    const g = ctx.createLinearGradient(0, 40, 0, 220)
    g.addColorStop(0, '#ffb03b')
    g.addColorStop(1, '#ff2bd6')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(144, 150, 90, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0b0d14'
    for (let i = 0; i < 7; i++) ctx.fillRect(40, 150 + i * 14, 208, 2 + i)
    ctx.strokeStyle = '#19e6ff'
    ctx.lineWidth = 2
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath()
      ctx.moveTo(144, 250)
      ctx.lineTo(i * 36, 368)
      ctx.stroke()
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 262 + i * i * 6)
      ctx.lineTo(288, 262 + i * i * 6)
      ctx.stroke()
    }
    return toTexture(c)
  }
  // Skyline in Cyan und Violett vor magentafarbenem Mond
  ctx.fillStyle = '#ff2bd6'
  ctx.beginPath()
  ctx.arc(200, 90, 44, 0, Math.PI * 2)
  ctx.fill()
  const cols = ['#19e6ff', '#8a4dff', '#19e6ff']
  let x = 12
  while (x < 276) {
    const w = 18 + rand() * 26
    const h = 80 + rand() * 170
    ctx.fillStyle = '#10131f'
    ctx.fillRect(x, 330 - h, w, h)
    ctx.strokeStyle = cols[Math.floor(rand() * cols.length)]
    ctx.lineWidth = 2
    ctx.strokeRect(x, 330 - h, w, h)
    x += w + 4
  }
  ctx.fillStyle = '#19e6ff'
  for (let i = 0; i < 6; i++) ctx.fillRect(rand() * 200, 20 + rand() * 280, 40 + rand() * 60, 3)
  ctx.fillStyle = '#ff2bd6'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText('NEO / 2077', 70, 355)
  return toTexture(c)
}
