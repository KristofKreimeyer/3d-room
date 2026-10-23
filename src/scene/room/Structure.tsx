import { useMemo } from 'react'
import { artTexture, skyTexture, woodTexture } from '../textures'
import { DESK, ROOM } from './layout'

const WALL = '#ece3d6'
const TRIM = '#d9cbb8'
const FRAME = '#f5f1ea'

const { size, height, wall: T } = ROOM
const half = size / 2

// Boden, Wände, Balkontür, Teppich und Bilder: alles, was fest zum Raum gehört.
export function Structure() {
  const floor = useMemo(
    () => woodTexture({ base: [150, 116, 88], planks: 8, seed: 1, repeat: [1.5, 3.5] }),
    [],
  )
  const art = useMemo(() => [artTexture(5), artTexture(9)], [])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={floor} roughness={0.75} />
      </mesh>
      <mesh position={[-T / 2, -0.1 - 0.001, 0]} receiveShadow>
        <boxGeometry args={[size + T, 0.2, size + 2 * T]} />
        <meshStandardMaterial color="#5a3d29" roughness={0.9} />
      </mesh>

      {/* Linke Wand */}
      <mesh position={[-half - T / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T, height, size + 2 * T]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* Rückwand mit Balkontür */}
      <BackWall />
      {/* Vorderwand */}
      <mesh position={[-T / 2, height / 2, half + T / 2]} castShadow receiveShadow>
        <boxGeometry args={[size + T, height, T]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {/* Sockelleisten */}
      <mesh position={[-half + 0.01, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.1, size]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[0, 0.05, half - 0.01]}>
        <boxGeometry args={[size, 0.1, 0.02]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>

      <BalconyDoor />
      <Balcony />

      {/* Teppich */}
      <mesh position={[0.1, 0.006, -0.1]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial color="#b8a48c" roughness={1} />
      </mesh>
      <mesh position={[0.1, 0.007, -0.1]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.3, 1.9]} />
        <meshStandardMaterial color="#d8c8b2" roughness={1} />
      </mesh>

      {/* Bilder über dem Schreibtisch */}
      {art.map((tex, i) => (
        <group
          key={i}
          position={[-half + 0.03, 2.05 - i * 0.12, DESK.z - 0.4 + i * 0.75]}
          rotation-y={Math.PI / 2}
        >
          <mesh castShadow>
            <boxGeometry args={[0.5 + i * 0.1, 0.62 + i * 0.1, 0.03]} />
            <meshStandardMaterial color="#2d241d" />
          </mesh>
          <mesh position-z={0.016}>
            <planeGeometry args={[0.42 + i * 0.1, 0.54 + i * 0.1]} />
            <meshStandardMaterial map={tex} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function BackWall() {
  const { x, w, h } = ROOM.door
  const left = x - w / 2
  const right = x + w / 2
  // Drei Rechtecke um die Türöffnung herum (links, rechts, Sturz).
  const pieces: [number, number, number, number][] = [
    [(-half - T + left) / 2, height / 2, left + half + T, height],
    [(right + half) / 2, height / 2, half - right, height],
    [x, (h + height) / 2, w + 0.2, height - h],
  ]
  return (
    <group position-z={-half - T / 2}>
      {pieces.map(([px, py, pw, ph], i) => (
        <mesh key={i} position={[px, py, 0]} castShadow receiveShadow>
          <boxGeometry args={[pw, ph, T]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// Zweiflügelige Balkontür: Zarge, zwei Flügel mit Sprosse und Griffen.
function BalconyDoor() {
  const { x, w, h } = ROOM.door
  const t = 0.07
  const leafW = w / 2
  const bars = (lw: number): [number, number, number, number][] => [
    [0, h - t / 2, lw, t],
    [0, t, lw, 2 * t],
    [-lw / 2 + t / 2, h / 2, t, h],
    [lw / 2 - t / 2, h / 2, t, h],
    [0, 0.85, lw, 0.05],
  ]
  return (
    <group position={[x, 0, -half - T / 2]}>
      {[-1, 1].map((side) => (
        <group key={side} position-x={(side * leafW) / 2}>
          {bars(leafW).map(([bx, by, bw, bh], i) => (
            <mesh key={i} position={[bx, by, 0]} castShadow>
              <boxGeometry args={[bw, bh, 0.08]} />
              <meshStandardMaterial color={FRAME} />
            </mesh>
          ))}
          {/* Glas: leicht spiegelnd, fast durchsichtig */}
          <mesh position={[0, h / 2, 0]}>
            <planeGeometry args={[leafW - 2 * t, h - 3 * t]} />
            <meshStandardMaterial color="#cfe3f0" transparent opacity={0.12} roughness={0.05} />
          </mesh>
          <mesh position={[-side * (leafW / 2 - 0.12), 1.05, 0.06]} castShadow>
            <boxGeometry args={[0.025, 0.14, 0.03]} />
            <meshStandardMaterial color="#c9c9c9" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Schwelle */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[w + 0.1, 0.03, T + 0.04]} />
        <meshStandardMaterial color="#cfc6b8" />
      </mesh>
    </group>
  )
}

// Was man durch die Balkontür sieht: Boden, Geländer und Abendhimmel.
function Balcony() {
  const sky = useMemo(() => skyTexture(), [])
  const z = -half - T
  return (
    <group>
      {/* Der Blick fällt schräg durch die Tür, deshalb reicht der Balkon weit nach links */}
      <mesh position={[ROOM.door.x - 1.6, -0.02, z - 0.7]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.4, 1.4]} />
        <meshStandardMaterial color="#9c968c" roughness={0.9} />
      </mesh>
      <group position={[ROOM.door.x - 1.6, 0, z - 1.35]}>
        <mesh position-y={1}>
          <boxGeometry args={[6.4, 0.04, 0.05]} />
          <meshStandardMaterial color="#3a3a3c" metalness={0.5} roughness={0.5} />
        </mesh>
        {Array.from({ length: 33 }, (_, i) => (
          <mesh key={i} position={[-3.2 + i * 0.2, 0.5, 0]}>
            <boxGeometry args={[0.02, 1, 0.02]} />
            <meshStandardMaterial color="#3a3a3c" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Oberkante bleibt unter der Wandhöhe, damit der Himmel nicht über die Wand ragt */}
      <mesh position={[ROOM.door.x - 3, 1.25, z - 2.6]}>
        <planeGeometry args={[12, 2.9]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
    </group>
  )
}
