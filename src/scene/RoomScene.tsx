import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Desk } from './room/Desk'
import { BigPlant, Bookshelf, Chair, FloorLamp, Whiteboard } from './room/Furniture'
import { Structure } from './room/Structure'

function Lights() {
  return (
    <>
      <hemisphereLight args={['#ffe9d2', '#6b4a33', 0.55]} />
      {/* Abendsonne, die durchs Fenster fällt */}
      <directionalLight
        position={[-3.2, 3.6, -6]}
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
      <directionalLight position={[4, 3, 4]} intensity={0.35} color="#ffe2c4" />
    </>
  )
}

// Auf schmalen Hochformat-Bildschirmen weiter weg und mit größerem Blickwinkel starten,
// damit Schreibtisch und Whiteboard trotzdem im Bild sind.
function initialCamera() {
  const portrait = window.innerWidth / window.innerHeight < 0.8
  return portrait
    ? { position: [5.6, 3.4, 5.4] as const, fov: 58 }
    : { position: [4.3, 2.7, 3.9] as const, fov: 42 }
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
        <Bookshelf />
        <Chair />
        <FloorLamp />
        <BigPlant />
        <OrbitControls
          target={[-0.4, 1.05, -1.2]}
          enablePan={false}
          enableDamping
          minDistance={2.5}
          maxDistance={8.5}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI / 2.05}
          minAzimuthAngle={0.05}
          maxAzimuthAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
      <p className="scene__hint">
        Ziehen zum Umsehen, scrollen zum Zoomen. Klickbare Objekte folgen im nächsten Schritt.
      </p>
    </div>
  )
}
