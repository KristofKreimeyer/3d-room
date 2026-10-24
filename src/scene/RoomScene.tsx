import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Desk } from './room/Desk'
import { Drums } from './room/Drums'
import { Chair, Shelf, Whiteboard } from './room/Furniture'
import { Structure } from './room/Structure'

function Lights() {
  return (
    <>
      <hemisphereLight args={['#fff1e0', '#8a6a4f', 1.1]} />
      {/* Abendsonne, die durch die Balkontür fällt */}
      <directionalLight
        position={[1.4, 3.6, -7]}
        intensity={1.6}
        color="#ffcf9a"
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
      {/* Weiche Aufhellung von vorn, damit keine Ecke absäuft */}
      <directionalLight position={[1, 3.5, 6]} intensity={0.8} color="#ffe2c4" />
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
        <color attach="background" args={['#2a211b']} />
        <Lights />
        <Structure />
        <Desk />
        <Whiteboard />
        <Shelf />
        <Drums />
        <Chair />
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
