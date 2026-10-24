// Maße des Raums in Metern, nach Kristofs Fotos. Ursprung ist die Raummitte auf dem Boden.
// Schmaler, langer Raum; die Seite zur Zimmertür (z = +depth/2) ist zum Betrachter hin aufgeschnitten:
// - linke Wand (x = -width/2): Schreibtisch, Whiteboard, Fotocollage
// - Stirnwand (z = -depth/2): zweiflügelige Balkontür mit Oberlicht
// - rechte Wand (x = +width/2): großes Regal mit Hängepflanze und Schlagzeug
export const ROOM = {
  width: 3.2,
  depth: 5,
  height: 3,
  // Wand- und Bodenstärke, die Schnittkanten bleiben wie bei einem Diorama sichtbar.
  wall: 0.15,
  door: { x: 0.1, w: 1.3, h: 2.75, leafH: 2.2 },
}

export const HALF_W = ROOM.width / 2
export const HALF_D = ROOM.depth / 2

export const DESK = { x: -HALF_W + 0.42, z: -1.35, width: 1.8, depth: 0.8, height: 0.75 }

export const WHITEBOARD = { z: -2.0, y: 1.85, w: 1.0, h: 0.8 }

export const COLLAGE = { z: 0.35, y: 1.85 }

export const SHELF = { z: -0.15, width: 1.5, height: 2.0, depth: 0.38 }

export const DRUMS = { x: 0.75, z: -1.75 }
