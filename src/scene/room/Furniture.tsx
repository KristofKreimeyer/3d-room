import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { seeded, whiteboardTexture } from '../textures'
import { useSpin } from '../use-spin'
import { ModeLight } from './ModeLight'
import { Led } from './Led'
import { DESK, HALF_W, LOW_SHELF, SHELF, WHITEBOARD } from './layout'
import { DARK, NEON } from './neon'

// Whiteboard an der linken Wand, führt in Schritt 3 zu den Skills.
export function Whiteboard() {
  const board = useMemo(() => whiteboardTexture(), [])
  const { w, h } = WHITEBOARD
  return (
    <group name="whiteboard" position={[-HALF_W + 0.03, WHITEBOARD.y, WHITEBOARD.z]} rotation-y={Math.PI / 2}>
      <RoundedBox args={[w + 0.05, h + 0.05, 0.03]} radius={0.01} castShadow>
        <meshStandardMaterial color={DARK.black} metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <Led size={[w + 0.09, h + 0.09, 0.004]} position={[0, 0, -0.018]} color={NEON.cyan} />
      <mesh position-z={0.016}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
      {/* Ablage mit Markern */}
      <mesh position={[0, -h / 2 - 0.03, 0.04]} castShadow>
        <boxGeometry args={[w * 0.6, 0.02, 0.06]} />
        <meshStandardMaterial color={DARK.metal} metalness={0.6} roughness={0.35} />
      </mesh>
      {['#2b5fa8', '#c0392b', '#222'].map((c, i) => (
        <mesh key={c} position={[-0.12 + i * 0.1, -h / 2 - 0.01, 0.045]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.009, 0.009, 0.12, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

// Großes Regal an der rechten Wand, führt in Schritt 3 zu „Über mich".
// Zwei Spalten, fünf Fächer hoch; jedes Fach bekommt per Zufall Bücher, Kisten oder Deko.
const { width: W, height: H, depth: D } = SHELF
const t = 0.03
const cols = 2
const rowY = [0.02, 0.42, 0.82, 1.22, 1.62]
const colW = (W - t) / cols

export function Shelf() {
  const items = useMemo(() => {
    const rand = seeded(21)
    const colors = ['#1a2540', '#2b1a40', '#12323a', '#3a1a38', '#222633', '#0f2a3a', '#33263f', '#191c28']
    const books: { x: number; y: number; w: number; h: number; c: string }[] = []
    const boxes: { x: number; y: number; c: string }[] = []
    const vases: { x: number; y: number; c: string }[] = []
    for (let c = 0; c < cols; c++) {
      const x0 = -W / 2 + t + c * colW
      rowY.forEach((y0, r) => {
        const y = y0 + t / 2
        const kind = rand()
        if (kind < 0.62) {
          let x = x0 + 0.02
          const end = x0 + colW - 0.04 - (rand() > 0.5 ? 0.25 : 0)
          while (x < end) {
            const w = 0.025 + rand() * 0.035
            const h = 0.22 + rand() * 0.12
            books.push({ x: x + w / 2, y: y + h / 2, w, h, c: colors[Math.floor(rand() * colors.length)] })
            x += w + 0.004
          }
          if (end < x0 + colW - 0.1) vases.push({ x: x0 + colW - 0.15, y, c: '#2a2d38' })
        } else if (kind < 0.85 || r === 0) {
          const c1 = ['#1b1e28', '#232733', '#151821'][Math.floor(rand() * 3)]
          boxes.push({ x: x0 + colW * 0.3, y, c: c1 }, { x: x0 + colW * 0.72, y, c: c1 })
        } else {
          vases.push({ x: x0 + colW / 2, y, c: ['#2a2d38', '#19e6ff', '#ff2bd6'][Math.floor(rand() * 3)] })
        }
      })
    }
    return { books, boxes, vases }
  }, [])
  const board = <meshStandardMaterial color={DARK.metal} metalness={0.7} roughness={0.35} />
  return (
    <group name="shelf" position={[HALF_W - D / 2 - 0.01, 0, SHELF.z]} rotation-y={-Math.PI / 2}>
      <HangingPlant />
      {Array.from({ length: cols + 1 }, (_, i) => (
        <mesh key={i} position={[-W / 2 + t / 2 + i * colW, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, H, D]} />
          {board}
        </mesh>
      ))}
      {[...rowY, H - t / 2].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, t, D]} />
          {board}
        </mesh>
      ))}
      <mesh position={[0, H / 2, -D / 2 + 0.005]} receiveShadow>
        <boxGeometry args={[W, H, 0.01]} />
        <meshStandardMaterial color={DARK.black} />
      </mesh>
      {rowY.slice(1).map((y, i) => (
        <Led key={y} size={[W - 2 * t, 0.01, 0.01]} position={[0, y - 0.01, D / 2 - 0.02]} color={i % 2 ? NEON.magenta : NEON.cyan} />
      ))}
      <ModeLight night={1.0} day={0.2} position={[0, H / 2, D / 2 + 0.3]} distance={2.4} color={NEON.violet} />
      {items.books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0.03]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.24]} />
          <meshStandardMaterial color={b.c} roughness={0.8} />
        </mesh>
      ))}
      {items.boxes.map((b, i) => (
        <RoundedBox key={i} args={[colW * 0.4, 0.3, 0.3]} radius={0.01} position={[b.x, b.y + 0.15, 0.02]} castShadow>
          <meshStandardMaterial color={b.c} roughness={0.9} />
        </RoundedBox>
      ))}
      {items.vases.map((v, i) => (
        <mesh key={i} position={[v.x, v.y + 0.1, 0.03]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.2, 20]} />
          {v.c === '#2a2d38' ? (
            <meshStandardMaterial color={v.c} roughness={0.4} metalness={0.5} />
          ) : (
            <meshBasicMaterial color={v.c} toneMapped={false} />
          )}
        </mesh>
      ))}
    </group>
  )
}

// Zwei niedrige Regale neben dem Schreibtisch, offen, mit LED-Kante und Deko.
export function LowShelves() {
  const { width: lw, height: lh, depth: ld } = LOW_SHELF
  const frame = <meshStandardMaterial color={DARK.metal} metalness={0.7} roughness={0.35} />
  const items = useMemo(() => {
    const rand = seeded(33)
    return LOW_SHELF.zs.map(() =>
      [0, 1].map(() => ({
        kind: rand() < 0.5 ? 'cube' : 'books',
        color: [NEON.cyan, NEON.magenta, NEON.violet][Math.floor(rand() * 3)],
      })),
    )
  }, [])
  return (
    <group>
      {LOW_SHELF.zs.map((z, i) => (
        <group key={z} name={`low-shelf-${i}`} position={[-HALF_W + ld / 2 + 0.01, 0, z]} rotation-y={Math.PI / 2}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (lw / 2 - 0.015), lh / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.03, lh, ld]} />
              {frame}
            </mesh>
          ))}
          {[0.02, lh / 2, lh - 0.015].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[lw, 0.03, ld]} />
              {frame}
            </mesh>
          ))}
          <mesh position={[0, lh / 2, -ld / 2 + 0.005]} receiveShadow>
            <boxGeometry args={[lw, lh, 0.01]} />
            <meshStandardMaterial color={DARK.black} />
          </mesh>
          {/* LED-Kante unter der Oberseite und unter dem Mittelbrett */}
          <Led size={[lw - 0.06, 0.01, 0.01]} position={[0, lh - 0.04, ld / 2 - 0.02]} color={i ? NEON.cyan : NEON.magenta} />
          <Led size={[lw - 0.06, 0.01, 0.01]} position={[0, lh / 2 - 0.03, ld / 2 - 0.02]} color={i ? NEON.magenta : NEON.cyan} />
          {/* Deko: je Fach ein leuchtender Würfel oder ein Stapel Bücher */}
          {[0.035, lh / 2 + 0.015].map((y, row) => {
            const item = items[i][row]
            return item.kind === 'cube' ? (
              <mesh key={row} position={[0.15, y + 0.07, 0]} castShadow>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <meshBasicMaterial color={item.color} toneMapped={false} />
              </mesh>
            ) : (
              <group key={row} position={[0.1, y, 0]}>
                {[0, 1, 2].map((b) => (
                  <mesh key={b} position={[0, 0.02 + b * 0.04, 0]} rotation-y={b * 0.2} castShadow>
                    <boxGeometry args={[0.22, 0.035, 0.16]} />
                    <meshStandardMaterial color={['#1a2540', '#2b1a40', '#12323a'][b]} roughness={0.8} />
                  </mesh>
                ))}
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

// Schwarzer Mesh-Bürostuhl mit hoher Lehne, Kopfstütze und Armlehnen.
function ChairModel() {
  const mesh = <meshStandardMaterial color="#14151a" roughness={0.8} />
  const dark = <meshStandardMaterial color="#1c1f28" roughness={0.4} metalness={0.5} />
  return (
    <group>
      <RoundedBox args={[0.52, 0.09, 0.5]} radius={0.035} position-y={0.5} castShadow>
        {mesh}
      </RoundedBox>
      <RoundedBox args={[0.46, 0.72, 0.05]} radius={0.02} position={[0, 0.95, 0.26]} rotation-x={-0.12} castShadow>
        {mesh}
      </RoundedBox>
      <RoundedBox args={[0.3, 0.16, 0.06]} radius={0.03} position={[0, 1.42, 0.33]} rotation-x={-0.12} castShadow>
        {mesh}
      </RoundedBox>
      {[-1, 1].map((s) => (
        <group key={s} position-x={s * 0.28}>
          <mesh position={[0, 0.62, 0.05]} castShadow>
            <boxGeometry args={[0.03, 0.22, 0.03]} />
            {dark}
          </mesh>
          <RoundedBox args={[0.06, 0.03, 0.26]} radius={0.01} position={[0, 0.74, 0]} castShadow>
            {dark}
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 12]} />
        {dark}
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * Math.PI * 2}>
          <mesh position={[0.17, 0.07, 0]} castShadow>
            <boxGeometry args={[0.34, 0.03, 0.04]} />
            {dark}
          </mesh>
          <mesh position={[0.33, 0.03, 0]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            {dark}
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Chair() {
  const { ref, handlers } = useSpin()
  return (
    <group position={[DESK.x + 0.85, 0, DESK.z + 0.25]} rotation-y={Math.PI / 2 - 0.5}>
      <group ref={ref} {...handlers}>
        <ChairModel />
      </group>
    </group>
  )
}

// Efeutute oben auf dem Regal, deren Ranken vorn herunterhängen.
function HangingPlant() {
  const leaves = useMemo(() => {
    const rand = seeded(42)
    const list: { p: [number, number, number]; r: [number, number, number]; s: number }[] = []
    // Busch auf dem Topf
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2
      const rr = rand() * 0.26
      list.push({
        p: [0.35 + Math.cos(a) * rr, H + 0.26 + rand() * 0.2, Math.sin(a) * rr * 0.6],
        r: [rand() * 3, rand() * 3, rand() * 3],
        s: 0.035 + rand() * 0.02,
      })
    }
    // Ranken vor dem Regal
    for (let v = 0; v < 6; v++) {
      const x = 0.1 + v * 0.11 + rand() * 0.05
      const len = 0.5 + rand() * 1.1
      for (let y = 0; y < len; y += 0.09) {
        list.push({
          p: [x + Math.sin(y * 5 + v) * 0.04, H + 0.1 - y, D / 2 + 0.04 + rand() * 0.03],
          r: [rand() * 3, rand() * 3, rand() * 3],
          s: 0.035 + rand() * 0.02,
        })
      }
    }
    return list
  }, [])
  return (
    <group>
      <mesh position={[0.35, H + 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.22, 20]} />
        <meshStandardMaterial color="#1b1e28" roughness={0.6} metalness={0.3} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} rotation={l.r} scale={[l.s, l.s * 0.25, l.s * 1.3]} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 3 ? '#2f8f5a' : '#3fd07a'} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
