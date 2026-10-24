import { useMemo } from 'react'
import { collageTexture, skyTexture } from '../textures'
import { useMode } from '../theme-context'
import { HALF_D, HALF_W, LOW_SHELF, POSTER, ROOM } from './layout'
import { Led } from './Led'
import { DARK, NEON } from './neon'

const WALL = DARK.wall
const FRAME = DARK.metal

const { width, depth, height, wall: T, door } = ROOM

// Boden, Wände, Balkontür, Vorhänge und Fotocollage: alles, was fest zum Raum gehört.
export function Structure() {
  const posters = useMemo(() => [collageTexture(0), collageTexture(1)], [])

  return (
    <group>
      {/* Dunkler, glänzender Betonboden */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={DARK.floor} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.1 - 0.001, -T / 2]} receiveShadow>
        <boxGeometry args={[width + 2 * T, 0.2, depth + T]} />
        <meshStandardMaterial color={DARK.black} roughness={0.9} />
      </mesh>

      {/* Linke und rechte Wand */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (HALF_W + T / 2), height / 2, -T / 2]} castShadow receiveShadow>
          <boxGeometry args={[T, height, depth + T]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
      <BackWall />

      {/* LED-Streifen an der Sockelleiste und unter der Decke: links cyan, rechts magenta */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Led
            size={[0.02, 0.025, depth]}
            position={[side * (HALF_W - 0.012), 0.03, 0]}
            color={side < 0 ? NEON.cyan : NEON.magenta}
          />
          <Led
            size={[0.02, 0.025, depth]}
            position={[side * (HALF_W - 0.012), height - 0.04, 0]}
            color={side < 0 ? NEON.magenta : NEON.cyan}
          />
        </group>
      ))}
      {/* Senkrechte Lichtleiste links der Tür */}
      <Led size={[0.025, height - 0.4, 0.02]} position={[door.x - door.w / 2 - 0.2, height / 2, -HALF_D + 0.02]} color={NEON.violet} />

      <BalconyDoor />
      <Balcony />

      {/* Zwei Neon-Poster im schwarzen Rahmen, je über einem niedrigen Regal */}
      {posters.map((tex, i) => (
        <group
          key={i}
          position={[-HALF_W + 0.02, POSTER.y, LOW_SHELF.zs[i]]}
          rotation-y={Math.PI / 2}
        >
          <mesh castShadow>
            <boxGeometry args={[POSTER.w + 0.06, POSTER.h + 0.06, 0.03]} />
            <meshStandardMaterial color={DARK.black} roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position-z={0.016}>
            <planeGeometry args={[POSTER.w, POSTER.h]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      ))}
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
            <meshStandardMaterial color="#8c93a3" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <Led size={[w + 0.14, 0.02, 0.02]} position={[0, h + t + 0.01, 0.06]} color={NEON.cyan} />
      <Led size={[0.02, h, 0.02]} position={[-w / 2 - t - 0.01, h / 2, 0.06]} color={NEON.cyan} />
      <Led size={[0.02, h, 0.02]} position={[w / 2 + t + 0.01, h / 2, 0.06]} color={NEON.cyan} />
      {/* Glas: leicht spiegelnd, fast durchsichtig */}
      <mesh position={[0, h / 2, -0.01]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#9ad8ff" transparent opacity={0.08} roughness={0.05} />
      </mesh>
    </group>
  )
}

// Was man durch die Balkontür sieht: Balkonboden, Lochblech-Brüstung, Bäume.
function Balcony() {
  const skies = useMemo(() => ({ nacht: skyTexture(), tag: skyTexture(true) }), [])
  const sky = skies[useMode()]
  const z = -HALF_D - T
  return (
    <group>
      <mesh position={[door.x, -0.02, z - 0.7]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[4, 1.4]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.9} />
      </mesh>
      <mesh position={[door.x, 0.5, z - 1.35]}>
        <boxGeometry args={[4, 1, 0.03]} />
        <meshStandardMaterial color="#2a2d38" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Oberkante bleibt unter der Wandhöhe, damit der Himmel nicht über die Wand ragt */}
      <mesh position={[door.x, 1.35, z - 2.4]}>
        <planeGeometry args={[6, 3.1]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
    </group>
  )
}
