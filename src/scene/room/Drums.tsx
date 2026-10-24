import { DRUMS } from './layout'
import { NEON } from './neon'

const SHELL = '#1e1e21'
const CHROME = '#6b7286'
const BRASS = '#2a2d38'

// Schlagzeug zwischen Regal und Balkontür. Lokal sitzt der Drummer bei +z und blickt zur Raummitte (-z).
export function Drums() {
  return (
    <group name="drums" position={[DRUMS.x, 0, DRUMS.z]} rotation-y={Math.PI / 2 + 0.4} scale={0.85}>
      {/* Drum-Teppich */}
      <mesh position={[0, 0.008, 0.15]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[1.8, 1.6]} />
        <meshStandardMaterial color="#07080b" roughness={1} />
      </mesh>

      {/* Bassdrum, liegt auf der Seite */}
      <group position={[0, 0.28, -0.1]} rotation-x={Math.PI / 2}>
        <Drum radius={0.28} depth={0.42} />
      </group>
      <mesh position={[0, 0.28, -0.315]} rotation-y={Math.PI}>
        <circleGeometry args={[0.14, 32]} />
        <meshStandardMaterial color="#e9e2d6" roughness={0.6} />
      </mesh>

      {/* Hängetoms auf der Bassdrum */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.16, 0.74, -0.05]} rotation-x={0.35}>
          <Drum radius={0.13} depth={0.15} />
        </group>
      ))}

      {/* Snare auf Ständer */}
      <group position={[-0.36, 0, 0.25]}>
        <Stand height={0.52} />
        <group position-y={0.6}>
          <Drum radius={0.18} depth={0.14} color="#d9d5cf" />
        </group>
      </group>

      {/* Standtom auf drei Beinen */}
      <group position={[0.42, 0, 0.28]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * 2.1) * 0.21, 0.2, Math.sin(i * 2.1) * 0.21]}>
            <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
            <meshStandardMaterial color={CHROME} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        <group position-y={0.4}>
          <Drum radius={0.2} depth={0.34} />
        </group>
      </group>

      {/* Hi-Hat */}
      <group position={[-0.68, 0, 0.18]}>
        <Stand height={0.92} />
        <Cymbal y={0.9} radius={0.18} />
        <Cymbal y={0.94} radius={0.18} />
      </group>

      {/* Crash und Ride */}
      <group position={[-0.5, 0, -0.32]}>
        <Stand height={1.32} />
        <Cymbal y={1.34} radius={0.23} tilt={0.25} />
      </group>
      <group position={[0.68, 0, -0.18]}>
        <Stand height={1.12} />
        <Cymbal y={1.14} radius={0.27} tilt={-0.2} />
      </group>

      {/* Hocker */}
      <group position={[0, 0, 0.68]}>
        <Stand height={0.48} />
        <mesh position-y={0.5} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.08, 24]} />
          <meshStandardMaterial color="#1e1e20" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// Kessel mit Fell oben und unten, Achse entlang y.
function Drum({ radius, depth, color = SHELL }: { radius: number; depth: number; color?: string }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, depth, 32, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} side={2} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position-y={(s * depth) / 2}>
          <mesh>
            <cylinderGeometry args={[radius * 0.98, radius * 0.98, 0.006, 32]} />
            <meshStandardMaterial color="#3b3b3f" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Stand({ height }: { height: number }) {
  return (
    <group>
      <mesh position-y={height / 2}>
        <cylinderGeometry args={[0.01, 0.012, height, 8]} />
        <meshStandardMaterial color={CHROME} metalness={0.5} roughness={0.3} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i * 2.1) * 0.1, 0.05, Math.sin(i * 2.1) * 0.1]}
          rotation={[0, -i * 2.1, 0.9]}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.24, 6]} />
          <meshStandardMaterial color={CHROME} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Cymbal({ y, radius, tilt = 0 }: { y: number; radius: number; tilt?: number }) {
  return (
    <mesh position-y={y} rotation-x={tilt} castShadow>
      <cylinderGeometry args={[radius, radius, 0.006, 40]} />
      <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} emissive={NEON.magenta} emissiveIntensity={0.25} />
    </mesh>
  )
}
