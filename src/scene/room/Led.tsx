// Leuchtstreifen: unbeleuchtet, wird vom Bloom-Effekt zum Glühen gebracht.
export function Led({
  size,
  position,
  color,
}: {
  size: [number, number, number]
  position: [number, number, number]
  color: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}
