import { useMemo } from 'react'
import { collageTexture, skyTexture, woodTexture } from '../textures'
import { COLLAGE, HALF_D, HALF_W, ROOM } from './layout'

const WALL = '#f3f0ea'
const TRIM = '#e4ddd2'
const FRAME = '#4a3326'

const { width, depth, height, wall: T, door } = ROOM

// Boden, Wände, Balkontür, Vorhänge und Fotocollage: alles, was fest zum Raum gehört.
export function Structure() {
  const floor = useMemo(
    () => woodTexture({ base: [196, 166, 128], planks: 8, seed: 1, repeat: [1.2, 2.5] }),
    [],
  )
  const collage = useMemo(() => collageTexture(), [])

  return (
    <group>
      {/* Heller Eichen-Laminatboden, Dielen laufen zur Balkontür */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[depth, width]} />
        <meshStandardMaterial map={floor} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.1 - 0.001, -T / 2]} receiveShadow>
        <boxGeometry args={[width + 2 * T, 0.2, depth + T]} />
        <meshStandardMaterial color="#6b5440" roughness={0.9} />
      </mesh>

      {/* Linke und rechte Wand */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (HALF_W + T / 2), height / 2, -T / 2]} castShadow receiveShadow>
          <boxGeometry args={[T, height, depth + T]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
      <BackWall />

      {/* Sockelleisten */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (HALF_W - 0.01), 0.04, 0]}>
          <boxGeometry args={[0.02, 0.08, depth]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      ))}

      <BalconyDoor />
      <Curtains />
      <Balcony />

      {/* Fotocollage im hellen Holzrahmen */}
      <group position={[-HALF_W + 0.02, COLLAGE.y, COLLAGE.z]} rotation-y={Math.PI / 2}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.0, 0.03]} />
          <meshStandardMaterial color="#c49a6c" roughness={0.6} />
        </mesh>
        <mesh position-z={0.016}>
          <planeGeometry args={[0.72, 0.92]} />
          <meshStandardMaterial map={collage} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

function BackWall() {
  const left = door.x - door.w / 2
  const right = door.x + door.w / 2
  // Drei Rechtecke um die Türöffnung herum (links, rechts, Sturz).
  const pieces: [number, number, number, number][] = [
    [(-HALF_W - T + left) / 2, height / 2, left + HALF_W + T, height],
    [(right + HALF_W + T) / 2, height / 2, HALF_W + T - right, height],
    [door.x, (door.h + height) / 2, door.w + 0.2, height - door.h],
  ]
  return (
    <group position-z={-HALF_D - T / 2}>
      {pieces.map(([px, py, pw, ph], i) => (
        <mesh key={i} position={[px, py, 0]} castShadow receiveShadow>
          <boxGeometry args={[pw, ph, T]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

// Zweiflügelige Balkontür mit Oberlicht und dunklem Holzrahmen.
function BalconyDoor() {
  const { w, h, leafH } = door
  const t = 0.07
  const leafW = w / 2
  const frame = <meshStandardMaterial color={FRAME} roughness={0.55} />
  const leafBars: [number, number, number, number][] = [
    [0, leafH - t / 2, leafW, t],
    [0, t, leafW, 2 * t],
    [-leafW / 2 + t / 2, leafH / 2, t, leafH],
    [leafW / 2 - t / 2, leafH / 2, t, leafH],
  ]
  return (
    <group position={[door.x, 0, -HALF_D - T / 2]}>
      {/* Zarge und Kämpfer unter dem Oberlicht */}
      {(
        [
          [-w / 2 - t / 2, h / 2, t, h],
          [w / 2 + t / 2, h / 2, t, h],
          [0, h + t / 2, w + 2 * t, t],
          [0, leafH + 0.04, w, 0.08],
        ] as [number, number, number, number][]
      ).map(([bx, by, bw, bh], i) => (
        <mesh key={i} position={[bx, by, 0]} castShadow>
          <boxGeometry args={[bw, bh, 0.1]} />
          {frame}
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position-x={(side * leafW) / 2}>
          {leafBars.map(([bx, by, bw, bh], i) => (
            <mesh key={i} position={[bx, by, 0]} castShadow>
              <boxGeometry args={[bw, bh, 0.08]} />
              {frame}
            </mesh>
          ))}
          <mesh position={[-side * (leafW / 2 - 0.1), 1.05, 0.06]} castShadow>
            <boxGeometry args={[0.025, 0.14, 0.03]} />
            <meshStandardMaterial color="#c9c9c9" metalness={0.6} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Glas: leicht spiegelnd, fast durchsichtig */}
      <mesh position={[0, h / 2, -0.01]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#d8ecf5" transparent opacity={0.1} roughness={0.05} />
      </mesh>
    </group>
  )
}

// Cremefarbene Vorhänge links und rechts der Tür, Falten aus versetzten Bahnen.
function Curtains() {
  const z = -HALF_D + 0.12
  const rodY = height - 0.12
  return (
    <group>
      <mesh position={[door.x, rodY, z]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, door.w + 1.4, 8]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[door.x + side * (door.w / 2 + 0.28), rodY - 1.32, z]}>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[(i - 2.5) * 0.085, 0, i % 2 ? 0.035 : 0]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 2.64, 0.015]} />
              <meshStandardMaterial color="#f1e8d6" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Was man durch die Balkontür sieht: Balkonboden, Lochblech-Brüstung, Bäume.
function Balcony() {
  const sky = useMemo(() => skyTexture(), [])
  const z = -HALF_D - T
  return (
    <group>
      <mesh position={[door.x, -0.02, z - 0.7]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[4, 1.4]} />
        <meshStandardMaterial color="#9c968c" roughness={0.9} />
      </mesh>
      <mesh position={[door.x, 0.5, z - 1.35]}>
        <boxGeometry args={[4, 1, 0.03]} />
        <meshStandardMaterial color="#8d8f92" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Oberkante bleibt unter der Wandhöhe, damit der Himmel nicht über die Wand ragt */}
      <mesh position={[door.x, 1.35, z - 2.4]}>
        <planeGeometry args={[6, 3.1]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
    </group>
  )
}
