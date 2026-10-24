import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { sections } from '../content'

// Platzhalter-Szene für Schritt 1: einfache Formen an den Positionen der späteren Objekte.
// In Schritt 2 wird daraus das eigentliche Arbeitszimmer, in Schritt 3 kommen Klicks und Kamerafahrten.

const WOOD = '#a0704a'
const WALL = '#efe6da'
const FLOOR = '#c9a27a'

function Room() {
  return (
    <group>
      {/* Boden und zwei Wände */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={FLOOR} />
      </mesh>
      <mesh position={[0, 2, -4]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-4, 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={WALL} />
      </mesh>

      {/* Schreibtisch */}
      <mesh position={[0, 0.75, -3.1]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 1]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {[-1.1, 1.1].map((x) => (
        <mesh key={x} position={[x, 0.37, -3.1]} castShadow>
          <boxGeometry args={[0.08, 0.74, 0.9]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      ))}

      {/* Monitor -> Projekte */}
      <mesh position={[0, 1.2, -3.35]} castShadow>
        <boxGeometry args={[1.1, 0.65, 0.05]} />
        <meshStandardMaterial color="#1d1f24" emissive="#3a5a8c" emissiveIntensity={0.35} />
      </mesh>

      {/* Smartphone -> Kontakt */}
      <mesh position={[0.8, 0.8, -2.85]} rotation-x={-Math.PI / 2} castShadow>
        <boxGeometry args={[0.08, 0.16, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Whiteboard -> Skills */}
      <mesh position={[-3.95, 1.8, -1]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[2, 1.2, 0.04]} />
        <meshStandardMaterial color="#fbfbf8" />
      </mesh>

      {/* Bücherregal -> Über mich */}
      <mesh position={[-3.6, 1, 2]} castShadow>
        <boxGeometry args={[0.6, 2, 1.4]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>

      {/* Stehlampe als warme Lichtquelle */}
      <pointLight position={[1.8, 1.9, -2.4]} intensity={6} color="#ffb46b" distance={6} castShadow />
    </group>
  )
}

export default function RoomScene() {
  return (
    <div className="scene">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [4.5, 3.2, 4.5], fov: 45 }}>
        <color attach="background" args={['#2a211b']} />
        <ambientLight intensity={0.5} color="#ffe8d0" />
        <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
        <Room />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} blur={2.5} scale={8} />
        <OrbitControls
          target={[-0.5, 1, -1.5]}
          enablePan={false}
          minDistance={3}
          maxDistance={9}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-0.2}
          maxAzimuthAngle={Math.PI / 2}
        />
      </Canvas>
      <p className="scene__hint">
        Hier entsteht das 3D-Arbeitszimmer. Später führen{' '}
        {sections.map((s) => s.object).join(', ')} zu den Inhalten.
      </p>
    </div>
  )
}
