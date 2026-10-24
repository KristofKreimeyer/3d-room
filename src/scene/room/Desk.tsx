import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import type { Texture } from 'three'
import { phoneTexture, screenTexture } from '../textures'
import { Interactive } from '../Interactive'
import { ModeLight } from './ModeLight'
import { Led } from './Led'
import { DESK } from './layout'
import { DARK, NEON } from './neon'

const METAL = DARK.metal

// Schreibtisch mit allem, was darauf steht. Monitor und Smartphone tragen Namen,
// damit sie in Schritt 3 klickbar werden.
export function Desk() {
  const { x, z, width, depth, height } = DESK
  const top = height + 0.02

  return (
    <group position={[x, 0, z]} rotation-y={Math.PI / 2}>
      <RoundedBox args={[width, 0.04, depth]} radius={0.015} position-y={height} castShadow receiveShadow>
        <meshStandardMaterial color="#8a6140" roughness={0.55} metalness={0.05} />
      </RoundedBox>
      {/* LED-Streifen: Unterseite der Platte (Underglow) und Vorderkante */}
      <Led size={[width - 0.1, 0.012, 0.012]} position={[0, height - 0.03, depth / 2 - 0.04]} color={NEON.magenta} />
      <Led size={[width - 0.1, 0.012, 0.012]} position={[0, height - 0.03, -depth / 2 + 0.04]} color={NEON.cyan} />
      <Led size={[width, 0.012, 0.01]} position={[0, height + 0.021, depth / 2 - 0.006]} color={NEON.cyan} />
      <ModeLight night={1.4} day={0.2} position={[0, height - 0.2, 0.2]} distance={2.2} color={NEON.magenta} />
      {/* Kufengestell aus Metall */}
      {[-1, 1].map((side) => (
        <group key={side} position-x={side * (width / 2 - 0.12)}>
          <mesh position={[0, height / 2, 0]} castShadow>
            <boxGeometry args={[0.04, height, 0.04]} />
            <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.05, 0.04, depth - 0.1]} />
            <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      <group position-y={top}>
        <Interactive id="projekte">
          <Monitor />
        </Interactive>
        {/* Tastatur und Maus */}
        <RoundedBox args={[0.44, 0.02, 0.14]} radius={0.006} position={[0, 0.01, 0.15]} castShadow>
          <meshStandardMaterial color="#15171d" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.06, 0.025, 0.1]} radius={0.012} position={[0.33, 0.012, 0.16]} castShadow>
          <meshStandardMaterial color="#15171d" roughness={0.4} />
        </RoundedBox>
        <Led size={[0.42, 0.003, 0.01]} position={[0, 0.021, 0.1]} color={NEON.violet} />
        {/* Schreibunterlage */}
        <mesh position={[0.05, 0.001, 0.13]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.9, 0.4]} />
          <meshStandardMaterial color="#0a0b10" roughness={1} />
        </mesh>
        <Interactive id="kontakt">
          <Phone />
        </Interactive>
        <Mug />
        <DeskLamp />
        {/* Notizbuch und Stift */}
        <RoundedBox args={[0.17, 0.018, 0.23]} radius={0.004} position={[-0.6, 0.009, 0.12]} rotation-y={0.25} castShadow>
          <meshStandardMaterial color="#1b2030" roughness={0.8} />
        </RoundedBox>
        <mesh position={[-0.5, 0.025, 0.14]} rotation={[0, 0.9, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
          <meshStandardMaterial color="#19e6ff" metalness={0.5} roughness={0.3} />
        </mesh>
        <Printer />
      </group>
      {/* PC unter dem Tisch */}
      <RoundedBox args={[0.2, 0.46, 0.45]} radius={0.015} position={[-0.45, 0.23, -0.1]} castShadow>
        <meshStandardMaterial color="#10131c" roughness={0.4} metalness={0.4} />
      </RoundedBox>
      <Led size={[0.012, 0.36, 0.006]} position={[-0.4, 0.23, 0.127]} color={NEON.cyan} />
      <Led size={[0.012, 0.36, 0.006]} position={[-0.5, 0.23, 0.127]} color={NEON.magenta} />
    </group>
  )
}

// Drei Bildschirme an einer Monitorstange: zwei nebeneinander, einer darüber.
function Monitor() {
  const screen = useMemo(() => screenTexture(), [])
  const pole = <meshStandardMaterial color={DARK.metal} metalness={0.7} roughness={0.3} />
  return (
    <group name="monitor" position={[-0.05, 0, -0.25]}>
      <mesh position-y={0.42} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.84, 10]} />
        {pole}
      </mesh>
      <mesh position={[0, 0.3, 0.02]} castShadow>
        <boxGeometry args={[1.0, 0.04, 0.03]} />
        {pole}
      </mesh>
      <Screen tex={screen} position={[-0.29, 0.34, 0.06]} rotationY={0.12} />
      <Screen tex={screen} position={[0.29, 0.34, 0.06]} rotationY={-0.12} />
      <Screen tex={screen} position={[-0.2, 0.72, 0.04]} rotationY={0.05} />
      {/* Bildschirmlicht auf Tastatur und Tisch */}
      <pointLight position={[0, 0.4, 0.35]} intensity={0.6} distance={1.3} color={NEON.cyan} />
    </group>
  )
}

function Screen({
  tex,
  position,
  rotationY,
}: {
  tex: Texture
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Led size={[0.6, 0.38, 0.004]} position={[0, 0, -0.02]} color={NEON.magenta} />
      <RoundedBox args={[0.56, 0.34, 0.03]} radius={0.01} castShadow>
        <meshStandardMaterial color="#05060a" roughness={0.4} />
      </RoundedBox>
      <mesh position-z={0.016}>
        <planeGeometry args={[0.53, 0.31]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

// 3D-Drucker am Tischende unter dem Whiteboard.
function Printer() {
  return (
    <group position={[0.62, 0, -0.12]}>
      <RoundedBox args={[0.38, 0.3, 0.34]} radius={0.02} position-y={0.15} castShadow>
        <meshStandardMaterial color="#14161c" roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.17, 0.171]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#19e6ff" transparent opacity={0.25} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.17, 0.12]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshBasicMaterial color={NEON.magenta} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Phone() {
  const screen = useMemo(() => phoneTexture(), [])
  return (
    <group name="smartphone" position={[0.3, 0.006, 0.2]} rotation-y={-0.35}>
      <RoundedBox args={[0.075, 0.009, 0.155]} radius={0.004} castShadow>
        <meshStandardMaterial color="#1a1a1c" roughness={0.3} metalness={0.3} />
      </RoundedBox>
      <mesh position-y={0.0048} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.068, 0.145]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Mug() {
  return (
    <group position={[-0.5, 0, 0.0]}>
      <mesh position-y={0.05} castShadow>
        <cylinderGeometry args={[0.04, 0.036, 0.1, 20]} />
        <meshStandardMaterial color="#2a2d38" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#2a2d38" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position-y={0.092} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.035, 20]} />
        <meshBasicMaterial color={NEON.cyan} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DeskLamp() {
  const brass = <meshStandardMaterial color="#2a2d38" metalness={0.8} roughness={0.3} />
  return (
    <group position={[-0.8, 0, -0.2]} rotation-y={-0.6}>
      <mesh position-y={0.012} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.024, 24]} />
        {brass}
      </mesh>
      <mesh position-y={0.24} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.46, 8]} />
        {brass}
      </mesh>
      <mesh position={[0.12, 0.47, 0]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.25, 8]} />
        {brass}
      </mesh>
      {/* Schirm, nach unten geöffnet */}
      <mesh position={[0.25, 0.42, 0]} castShadow>
        <coneGeometry args={[0.1, 0.12, 24, 1, true]} />
        <meshStandardMaterial color="#e9dcc5" side={2} roughness={0.7} />
      </mesh>
      <mesh position={[0.25, 0.38, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color={NEON.amber} toneMapped={false} />
      </mesh>
      <ModeLight night={2.4} day={0.3} position={[0.25, 0.32, 0]} distance={2.6} color={NEON.amber} />
    </group>
  )
}
