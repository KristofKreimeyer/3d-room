// Maße des Raums in Metern. Ursprung ist die Raummitte auf dem Boden.
// Der Raum hat drei Wände, die vierte (bei x = +size/2) ist zum Betrachter hin aufgeschnitten:
// - linke Wand (x = -size/2): Whiteboard und Schreibtisch
// - Rückwand (z = -size/2): zweiflügelige Balkontür
// - Vorderwand (z = +size/2): großes Regal und Schlagzeug
export const ROOM = {
  size: 6,
  height: 3,
  // Wand- und Bodenstärke, die Schnittkanten bleiben wie bei einem Diorama sichtbar.
  wall: 0.15,
  door: { x: -0.4, w: 1.6, h: 2.3 },
}

const half = ROOM.size / 2

export const DESK = { x: -half + 0.42, z: 0.75, width: 2, depth: 0.8, height: 0.75 }

export const WHITEBOARD = { z: -1.55, y: 1.55 }

export const SHELF = { x: -1.55, width: 2.4, height: 2.2, depth: 0.38 }

export const DRUMS = { x: 0.8, z: half - 0.95 }
