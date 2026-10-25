import sys, bpy
sys.path.insert(0, '/home/claude/3d-room/tools/blender')
from common import *

mode = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'night'
reset('/tmp/claude-0/blender/room_raw.glb')
if mode == 'night':
    convert_materials(dict(sky=3.0, screen=1.5, led=3, bulb_pendant=1100, bulb_desk=120))
    set_world((0.5, 0.45, 0.6), 0.25)
else:
    convert_materials(dict(sky=2.5, screen=1.0, led=1.5, bulb_pendant=60, bulb_desk=20))
    set_world((0.7, 0.8, 1.0), 0.9)
    add_sun((1.4, 7, 3.6), (1.0, 0.93, 0.8), 6, 2)
setup_cycles(48, 1000, 640)
# Kamera wie die Startansicht der Seite (Three.js [0.8,2.3,4.3] → Blender [0.8,-4.3,2.3])
add_camera((0.8, -4.3, 2.3), (0, 1.0, 1.1), 58)
bpy.context.scene.render.filepath = f'/tmp/claude-0/blender/preview_{mode}.png'
bpy.ops.render.render(write_still=True)
