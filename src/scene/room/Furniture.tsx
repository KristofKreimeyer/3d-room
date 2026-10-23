import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { seeded, whiteboardTexture, woodTexture } from '../textures'
import { DESK, ROOM, SHELF, WHITEBOARD } from './layout'

const half = ROOM.size / 2

// Whiteboard an der linken Wand, führt in Schritt 3 zu den Skills.
export function Whiteboard() {
  const board = useMemo(() => whiteboardTexture(), [])
  const w = 1.7
  const h = 1.02
  return (
    <group name="whiteboard" position={[-half + 0.03, WHITEBOARD.y, WHITEBOARD.z]} rotation-y={Math.PI / 2}>
      <RoundedBox args={[w + 0.05, h + 0.05, 0.03]} radius={0.01} castShadow>
        <meshStandardMaterial color="#b9bcc1" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <mesh position-z={0.016}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={board} roughness={0.3} />
      </mesh>
      {/* Ablage mit Markern */}
      <mesh position={[0, -h / 2 - 0.03, 0.04]} castShadow>
        <boxGeometry args={[w * 0.6, 0.02, 0.06]} />
        <meshStandardMaterial color="#b9bcc1" metalness={0.6} roughness={0.35} />
      </mesh>
      {['#2b5fa8', '#c0392b', '#222'].map((c, i) => (
        <mesh key={c} position={[-0.2 + i * 0.1, -h / 2 - 0.01, 0.045]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.009, 0.009, 0.12, 8]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

// Großes Regal an der Vorderwand, führt in Schritt 3 zu „Über mich".
// Drei Spalten, fünf Fächer hoch; jedes Fach bekommt per Zufall Bücher, Kisten oder Deko.
const { width: W, height: H, depth: D } = SHELF
const t = 0.03
const cols = 3
const rowY = [0.02, 0.46, 0.9, 1.34, 1.78]
const colW = (W - t) / cols

export function Shelf() {
  const wood = useMemo(() => woodTexture({ base: [168, 116, 74], planks: 1, seed: 8 }), [])
  const items = useMemo(() => {
    const rand = seeded(21)
    const colors = ['#8c3b2e', '#2f4858', '#d9a441', '#5b7553', '#c8b8a2', '#6b4e71', '#a65e2e', '#33302d']
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
            const h = 0.22 + rand() * 0.15
            books.push({ x: x + w / 2, y: y + h / 2, w, h, c: colors[Math.floor(rand() * colors.length)] })
            x += w + 0.004
          }
          if (end < x0 + colW - 0.1) vases.push({ x: x0 + colW - 0.15, y, c: '#e3d5c3' })
        } else if (kind < 0.85 || r === 0) {
          const c1 = ['#d8c3a5', '#7d8f87', '#b5654a'][Math.floor(rand() * 3)]
          boxes.push({ x: x0 + colW * 0.3, y, c: c1 }, { x: x0 + colW * 0.72, y, c: c1 })
        } else {
          vases.push({ x: x0 + colW / 2, y, c: ['#e3d5c3', '#4f7d8c', '#c9a35a'][Math.floor(rand() * 3)] })
        }
      })
    }
    return { books, boxes, vases }
  }, [])
  const board = <meshStandardMaterial map={wood} roughness={0.6} />
  return (
    <group name="shelf" position={[SHELF.x, 0, half - D / 2 - 0.01]} rotation-y={Math.PI}>
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
        <meshStandardMaterial color="#d8cbb9" />
      </mesh>
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
          <meshStandardMaterial color={v.c} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function Chair() {
  const fabric = <meshStandardMaterial color="#45525a" roughness={0.9} />
  const dark = <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
  return (
    <group position={[DESK.x + 0.85, 0, DESK.z + 0.05]} rotation-y={Math.PI / 2 - 0.35}>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position-y={0.48} castShadow>
        {fabric}
      </RoundedBox>
      <RoundedBox args={[0.48, 0.6, 0.07]} radius={0.03} position={[0, 0.85, 0.24]} rotation-x={-0.1} castShadow>
        {fabric}
      </RoundedBox>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 12]} />
        {dark}
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation-y={a}>
            <mesh position={[0.15, 0.07, 0]} castShadow>
              <boxGeometry args={[0.3, 0.03, 0.04]} />
              {dark}
            </mesh>
            <mesh position={[0.29, 0.03, 0]}>
              <sphereGeometry args={[0.03, 10, 8]} />
              {dark}
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function FloorLamp() {
  return (
    <group position={[-half + 0.35, 0, -half + 0.35]}>
      <mesh position-y={0.015} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.03, 24]} />
        <meshStandardMaterial color="#2b2b2e" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position-y={0.8} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 1.6, 8]} />
        <meshStandardMaterial color="#2b2b2e" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position-y={1.62}>
        <cylinderGeometry args={[0.16, 0.22, 0.3, 32, 1, true]} />
        <meshStandardMaterial color="#f3e2c7" emissive="#ffb066" emissiveIntensity={0.9} side={2} roughness={0.9} />
      </mesh>
      <pointLight position-y={1.55} intensity={4} distance={5} decay={1.6} color="#ffad5c" />
    </group>
  )
}

export function BigPlant() {
  const leaves = useMemo(() => {
    const rand = seeded(42)
    return Array.from({ length: 16 }, () => ({
      a: rand() * Math.PI * 2,
      tilt: 0.3 + rand() * 0.7,
      len: 0.35 + rand() * 0.3,
      y: 0.55 + rand() * 0.6,
    }))
  }, [])
  return (
    <group position={[ROOM.door.x + ROOM.door.w / 2 + 1.1, 0, -half + 0.45]} scale={0.85}>
      <mesh position-y={0.2} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.4, 24]} />
        <meshStandardMaterial color="#c9b49a" roughness={0.9} />
      </mesh>
      <mesh position-y={0.7} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 1, 6]} />
        <meshStandardMaterial color="#5d4a32" />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position-y={l.y} rotation={[0, l.a, l.tilt]}>
          <mesh position-y={l.len / 2} scale={[0.09, l.len / 2, 0.02]} castShadow>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={i % 3 ? '#4f7f45' : '#3f6b3a'} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
