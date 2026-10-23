import { useMemo } from 'react'
import { artTexture, skyTexture, woodTexture } from '../textures'
import { ROOM } from './layout'

const WALL = '#ece3d6'
const TRIM = '#d9cbb8'
// Wand- und Bodenstärke. Der Raum ist wie ein aufgeschnittenes Diorama gebaut,
// die Schnittkanten bleiben sichtbar.
const T = 0.15

// Boden, Wände, Fenster, Teppich und Bilder: alles, was fest zum Raum gehört.
export function Structure() {
  const floor = useMemo(
    () => woodTexture({ base: [150, 116, 88], planks: 8, seed: 1, repeat: [1.5, 3.5] }),
    [],
  )
  const sky = useMemo(() => skyTexture(), [])
  const art = useMemo(() => [artTexture(5), artTexture(9)], [])
  const { size, height } = ROOM
  const half = size / 2

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={floor} roughness={0.75} />
      </mesh>
      <mesh position={[-T / 2, -0.1 - 0.001, -T / 2]} receiveShadow>
        <boxGeometry args={[size + T, 0.2, size + T]} />
        <meshStandardMaterial color="#5a3d29" roughness={0.9} />
      </mesh>

      {/* Rückwand mit Fensteröffnung, aus vier Teilen zusammengesetzt */}
      <BackWall />

      {/* Linke Wand */}
      <mesh position={[-half - T / 2, height / 2, -T / 2]} castShadow receiveShadow>
        <boxGeometry args={[T, height, size + T]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {/* Sockelleisten */}
      <mesh position={[0, 0.05, -half + 0.01]}>
        <boxGeometry args={[size, 0.1, 0.02]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
      <mesh position={[-half + 0.01, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.1, size]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>

      {/* Fenster: Himmel, Rahmen und Fensterbank */}
      <group position={[ROOM.window.x, ROOM.window.y, -half]}>
        <mesh position-z={-T + 0.02}>
          <planeGeometry args={[ROOM.window.w, ROOM.window.h]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        <WindowFrame />
      </group>

      {/* Teppich */}
      <mesh position={[0.2, 0.006, -0.6]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.8, 2]} />
        <meshStandardMaterial color="#b8a48c" roughness={1} />
      </mesh>
      <mesh position={[0.2, 0.007, -0.6]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.5, 1.7]} />
        <meshStandardMaterial color="#d8c8b2" roughness={1} />
      </mesh>

      {/* Bilder über dem Schreibtisch */}
      {art.map((tex, i) => (
        <group key={i} position={[0.15 + i * 0.75, 2.05 - i * 0.12, -half + 0.03]}>
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
  const { size, height, window: w } = ROOM
  const half = size / 2
  const left = w.x - w.w / 2
  const right = w.x + w.w / 2
  const bottom = w.y - w.h / 2
  const top = w.y + w.h / 2
  // Vier Rechtecke um die Fensteröffnung herum.
  const pieces: [number, number, number, number][] = [
    [(-half - T + left) / 2, height / 2, left + half + T, height],
    [(right + half) / 2, height / 2, half - right, height],
    [w.x, bottom / 2, w.w + 0.2, bottom],
    [w.x, (top + height) / 2, w.w + 0.2, height - top],
  ]
  return (
    <group position-z={-half - T / 2}>
      {pieces.map(([x, y, pw, ph], i) => (
        <mesh key={i} position={[x, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[pw, ph, T]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function WindowFrame() {
  const { w, h } = ROOM.window
  const t = 0.06
  const color = '#f5f1ea'
  const bars: [number, number, number, number][] = [
    [0, h / 2, w + t, t],
    [0, -h / 2, w + t, t],
    [-w / 2, 0, t, h],
    [w / 2, 0, t, h],
    [0, 0, 0.035, h],
    [0, 0.15, w, 0.035],
  ]
  return (
    <group>
      {bars.map(([x, y, bw, bh], i) => (
        <mesh key={i} position={[x, y, 0]} castShadow>
          <boxGeometry args={[bw, bh, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, -h / 2 - 0.03, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.25, 0.04, 0.22]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}
