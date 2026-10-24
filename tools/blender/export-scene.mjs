// Exportiert die Szene aus Code (?szene=prozedural) als room_raw.glb plus Himmelsbilder.
// Aufruf: npm run dev (anderes Terminal), dann node tools/blender/export-scene.mjs <ausgabeordner>
import { chromium } from 'playwright'
import fs from 'fs'
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: {width:1000,height:700} })
p.on('console',m=>m.type()==='error'&&console.log('E',m.text()))
await p.goto('http://localhost:5173/3d-room/?szene=prozedural'); await p.waitForFunction(()=>window.__scene, null, {timeout:60000}); await p.waitForTimeout(2000)
const b64 = await p.evaluate(async () => {
  const { GLTFExporter } = await import('/3d-room/node_modules/three/examples/jsm/exporters/GLTFExporter.js')
  const scene = window.__scene
  const ex = new GLTFExporter()
  const buf = await ex.parseAsync(scene, { binary: true, onlyVisible: true, maxTextureSize: 1024 })
  const u8 = new Uint8Array(buf); let s=''; for (let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s)
})
const out = process.argv[2] ?? 'blender-out'
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(`${out}/room_raw.glb`, Buffer.from(b64,'base64'))
console.log('bytes', fs.statSync(`${out}/room_raw.glb`).size)
const skies = await p.evaluate(async () => {
  const t = await import('/3d-room/src/scene/textures.ts')
  return { night: t.skyTexture(false).image.toDataURL('image/png'), day: t.skyTexture(true).image.toDataURL('image/png') }
})
for (const k of ['night','day']) fs.writeFileSync(`${out}/sky_${k}.png`, Buffer.from(skies[k].split(',')[1],'base64'))
await b.close()
