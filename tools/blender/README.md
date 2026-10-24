# Blender-Pipeline für den Raum

Der Raum auf der Seite ist ein in Blender gebackenes Modell (`public/room/`). Es entsteht aus der Szene in
`src/scene/room/` (Three.js). Wer den Raum ändert, baut das Modell mit den Schritten unten neu.
Blender-Fenster oder -Installation sind nicht nötig, das Python-Modul `bpy` reicht.

## Voraussetzungen

```sh
python3 -m venv .venv-blender && .venv-blender/bin/pip install bpy   # Blender 5.x als Python-Modul
npm install && npx playwright install chromium                      # nur für den Export aus dem Browser
```

## Schritte

1. **Szene exportieren.** `npm run dev`, dann `node tools/blender/export-scene.mjs blender-out`. Das Skript öffnet `?szene=prozedural`. Diese Ansicht
   zeigt die Szene aus Code und stellt sie als `window.__scene` bereit. `tools/blender/export-scene.mjs` (Playwright) schreibt sie mit dem `GLTFExporter` als
   `room_raw.glb`; die beiden Himmelsbilder (`sky_night.png`, `sky_day.png`) kommen aus `skyTexture()`.
2. **Backen.** `python tools/blender/bake.py -- room_raw.glb out 256`
   - Gruppen (`shell`, `desk`, `shelf`, `chair`, ...) werden zu je einem Mesh vereint und UV-entfaltet.
   - Lampen, Leisten und Bildschirme werden zu Lichtquellen; Nacht: Pendelleuchte und Schreibtischlampe, Tag: Sonne durch die Balkontür.
   - Ausgabe: `room.glb` (nur Geometrie und UVs) sowie `<gruppe>_night.jpg` und `<gruppe>_day.jpg`.
3. **Entrauschen.** `python tools/blender/denoise.py -- out`
4. **Einbinden.** `out/*` nach `public/room/` kopieren.

`preview.py` rendert ein Vorschaubild aus der Startansicht (nützlich zum Abstimmen von Lichtstärken in `common.py`).
