import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages liefert die Seite unter /3d-room/ aus.
export default defineConfig({
  base: '/3d-room/',
  plugins: [react()],
  // three.js ist groß, wird aber nur für die 3D-Ansicht nachgeladen.
  build: { chunkSizeWarningLimit: 1000 },
})
