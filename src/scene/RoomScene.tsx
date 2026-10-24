import { OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Canvas } from '@react-three/fiber'
import { Desk } from './room/Desk'
import { Drums } from './room/Drums'
import { Chair, LowShelves, Shelf, Whiteboard } from './room/Furniture'
import { NEON } from './room/neon'
import { Structure } from './room/Structure'

// Nachtlicht: wenig Grundhelligkeit, dazu farbiges Licht von Stadt und LEDs.
function Lights() {
  return (
    <>
      <hemisphereLight args={['#7a82e0', '#3a2a60', 2.6]} />
      {/* Neonlicht der Stadt, das durch die Balkontür fällt */}
      <directionalLight
        position={[1.4, 3.6, -7]}
        intensity={1.1}
        color="#ff5ae0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-far={14}
      />
      {/* Kühle Aufhellung von vorn, damit keine Ecke absäuft */}
      <directionalLight position={[1, 3.5, 6]} intensity={1.5} color="#b4c2ff" />
      <pointLight position={[-1.2, 1.4, 0]} intensity={1.2} distance={4.5} decay={1.6} color={NEON.cyan} />
      <pointLight position={[1.2, 1.4, 0.5]} intensity={1.2} distance={4.5} decay={1.6} color={NEON.magenta} />
    </>
  )
}

// Die Kamera steht in der Zimmertür (offene Seite bei +z) und schaut Richtung Balkon.
// Auf schmalen Hochformat-Bildschirmen startet sie weiter weg und mit größerem Blickwinkel.
function initialCamera() {
  const portrait = window.innerWidth / window.innerHeight < 0.8
  return portrait
    ? { position: [0.3, 2.2, 5.6] as const, fov: 66 }
    : { position: [0.8, 2.3, 4.3] as const, fov: 58 }
}

export default function RoomScene() {
  const camera = initialCamera()
  return (
    <div className="scene">
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [...camera.position], fov: camera.fov }}
        aria-label="3D-Ansicht des Arbeitszimmers"
      >
        <color attach="background" args={['#05060a']} />
        <Lights />
        <Structure />
        <Desk />
        <Whiteboard />
        <Shelf />
        <LowShelves />
        <Drums />
        <Chair />
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.9} luminanceSmoothing={0.15} />
        </EffectComposer>
        <OrbitControls
          target={[0, 1.1, -1]}
          enablePan={false}
          enableDamping
          minDistance={2}
          maxDistance={9}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI / 2.05}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
        />
      </Canvas>
      <p className="scene__hint">
        Ziehen zum Umsehen, scrollen zum Zoomen. Klickbare Objekte folgen im nächsten Schritt.
      </p>
    </div>
  )
}
