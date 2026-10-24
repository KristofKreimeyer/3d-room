import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import type { Texture } from 'three'
import { phoneTexture, screenTexture, woodTexture } from '../textures'
import { DESK } from './layout'

const METAL = '#2b2b2e'

// Schreibtisch mit allem, was darauf steht. Monitor und Smartphone tragen Namen,
// damit sie in Schritt 3 klickbar werden.
export function Desk() {
  const wood = useMemo(
    () => woodTexture({ base: [214, 184, 140], planks: 1, seed: 4 }),
    [],
  )
  const { x, z, width, depth, height } = DESK
  const top = height + 0.02

  return (
    <group position={[x, 0, z]} rotation-y={Math.PI / 2}>
      <RoundedBox args={[width, 0.04, depth]} radius={0.015} position-y={height} castShadow receiveShadow>
        <meshStandardMaterial map={wood} roughness={0.55} />
      </RoundedBox>
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
        <Monitor />
        {/* Tastatur und Maus */}
        <RoundedBox args={[0.44, 0.02, 0.14]} radius={0.006} position={[0, 0.01, 0.15]} castShadow>
          <meshStandardMaterial color="#e8e4dd" roughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.06, 0.025, 0.1]} radius={0.012} position={[0.33, 0.012, 0.16]} castShadow>
          <meshStandardMaterial color="#e8e4dd" roughness={0.5} />
        </RoundedBox>
        {/* Schreibunterlage */}
        <mesh position={[0.05, 0.001, 0.13]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.9, 0.4]} />
          <meshStandardMaterial color="#5b4a3d" roughness={1} />
        </mesh>
        <Phone />
        <Mug />
        <DeskLamp />
        {/* Notizbuch und Stift */}
        <RoundedBox args={[0.17, 0.018, 0.23]} radius={0.004} position={[-0.6, 0.009, 0.12]} rotation-y={0.25} castShadow>
          <meshStandardMaterial color="#3e5c6e" roughness={0.8} />
        </RoundedBox>
        <mesh position={[-0.5, 0.025, 0.14]} rotation={[0, 0.9, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
          <meshStandardMaterial color="#c5a15a" metalness={0.5} roughness={0.3} />
        </mesh>
        <Printer />
      </group>
      {/* PC unter dem Tisch */}
      <RoundedBox args={[0.2, 0.46, 0.45]} radius={0.015} position={[-0.45, 0.23, -0.1]} castShadow>
        <meshStandardMaterial color="#1f2a4a" roughness={0.5} />
      </RoundedBox>
    </group>
  )
}

// Drei Bildschirme an einer Monitorstange: zwei nebeneinander, einer darüber.
function Monitor() {
  const screen = useMemo(() => screenTexture(), [])
  const pole = <meshStandardMaterial color="#2b2b2e" metalness={0.5} roughness={0.4} />
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
      <pointLight position={[0, 0.4, 0.35]} intensity={0.6} distance={1.3} color="#9fc2ff" />
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
      <RoundedBox args={[0.56, 0.34, 0.03]} radius={0.01} castShadow>
        <meshStandardMaterial color="#1c1c1f" roughness={0.4} />
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
        <meshStandardMaterial color="#2a2a2c" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.17, 0.171]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#5d6670" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.17, 0.12]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#e86b2f" roughness={0.5} />
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
        <meshStandardMaterial color="#d36b4b" roughness={0.45} />
      </mesh>
      <mesh position={[0.045, 0.05, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#d36b4b" roughness={0.45} />
      </mesh>
      <mesh position-y={0.092} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.035, 20]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
    </group>
  )
}

function DeskLamp() {
  const brass = <meshStandardMaterial color="#b88a4a" metalness={0.8} roughness={0.3} />
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
        <meshStandardMaterial color="#2f4a3a" side={2} roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 0.38, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      <pointLight position={[0.25, 0.32, 0]} intensity={0.9} distance={1.8} decay={2} color="#ffb366" />
    </group>
  )
}
