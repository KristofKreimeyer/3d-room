# 3D-Arbeitszimmer · Portfolio

Ein begehbares 3D-Arbeitszimmer als Portfolio. Besucher klicken Objekte im Raum an (Monitor, Whiteboard, Smartphone, Bücherregal) und landen bei Projekten, Skills, Kontakt und „Über mich“. Wer wenig Zeit hat, nutzt die Direktlinks oben oder die barrierefreie Schnellansicht.

## Entwicklung

```bash
npm install
npm run dev      # lokaler Server
npm run build    # Produktionsbuild nach dist/
npm run lint
```

## Aufbau

- `src/content.ts` – alle Texte und Links. Inhalte nur hier pflegen.
- `src/components/QuickView.tsx` – 2D-Schnellansicht (auch Fallback ohne WebGL).
- `src/components/TopBar.tsx` – feste Leiste mit Direktlinks und Umschalter 3D/Schnellansicht.
- `src/scene/RoomScene.tsx` – die 3D-Szene (React Three Fiber), wird erst bei Bedarf geladen.

Direktlinks: `…/3d-room/#projekte` oder `…/3d-room/?ansicht=liste` öffnen sofort die Schnellansicht.

## Deployment

Jeder Push auf `main` baut die Seite und veröffentlicht sie über GitHub Actions auf GitHub Pages
(Repository-Einstellungen → Pages → Source: „GitHub Actions“).
