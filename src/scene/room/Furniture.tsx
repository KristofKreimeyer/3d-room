import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { seeded, whiteboardTexture, woodTexture } from '../textures'
import { DESK, ROOM } from './layout'

const half = ROOM.size / 2

// Whiteboard an der linken Wand, führt in Schritt 3 zu den Skills.
export function Whiteboard() {
  const board = useMemo(() => whiteboardTexture(), [])
  const w = 1.7
  const h = 1.02
  return (
    <group name="whiteboard" position={[-half + 0.03, 1.55, -0.7]} rotation-y={Math.PI / 2}>
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

// Offenes Bücherregal an der linken Wand, führt in Schritt 3 zu „Über mich".
export function Bookshelf() {
  const wood = useMemo(() => woodTexture({ base: [168, 116, 74], planks: 1, seed: 8 }), [])
  const books = useMemo(() => {
    const rand = seeded(21)
    const colors = ['#8c3b2e', '#2f4858', '#d9a441', '#5b7553', '#c8b8a2', '#6b4e71', '#a65e2e', '#33302d']
    const list: { x: number; y: number; w: number; h: number; c: string; tilt: number }[] = []
    const shelfY = [0.06, 0.5, 0.94, 1.38]
    shelfY.forEach((y, row) => {
      let x = -0.42
      const end = row === 1 ? 0.05 : 0.42 // Platz für Deko im zweiten Fach
      while (x < end) {
        const w = 0.025 + rand() * 0.035
        const h = 0.22 + rand() * 0.13
        list.push({ x: x + w / 2, y: y + h / 2, w, h, c: colors[Math.floor(rand() * colors.length)], tilt: 0 })
        x += w + 0.004
        if (rand() > 0.9) x += 0.08
      }
    })
    return list
  }, [])
  const W = 0.95
  const H = 1.85
  const D = 0.32
  const t = 0.03
  const board = <meshStandardMaterial map={wood} roughness={0.6} />
  return (
    <group name="bookshelf" position={[-half + D / 2 + 0.01, 0, 1.55]} rotation-y={Math.PI / 2}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - t / 2), H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[t, H, D]} />
          {board}
        </mesh>
      ))}
      {[0.02, 0.48, 0.92, 1.36, H - t / 2].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, t, D]} />
          {board}
        </mesh>
      ))}
      <mesh position={[0, H / 2, -D / 2 + 0.005]} receiveShadow>
        <boxGeometry args={[W, H, 0.01]} />
        <meshStandardMaterial color="#d8cbb9" />
      </mesh>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0.02]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.2]} />
          <meshStandardMaterial color={b.c} roughness={0.8} />
        </mesh>
      ))}
      {/* Deko: Vase und kleiner Globus */}
      <mesh position={[0.25, 0.6, 0.02]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.2, 20]} />
        <meshStandardMaterial color="#e3d5c3" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, H + 0.1, 0]} castShadow>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color="#4f7d8c" roughness={0.6} />
      </mesh>
      <mesh position={[0.2, H + 0.01, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#b88a4a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function Chair() {
  const fabric = <meshStandardMaterial color="#45525a" roughness={0.9} />
  const dark = <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
  return (
    <group position={[DESK.x - 0.05, 0, DESK.z + 0.85]} rotation-y={-0.35}>
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
    <group position={[2.15, 0, -2.45]}>
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
    <group position={[-2.55, 0, -2.5]}>
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
