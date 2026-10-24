"""Bäckt das Licht des Raums in Texturen und exportiert die Geometrie als GLB.

Aufruf (Python-Modul bpy, kein Blender-Fenster nötig):
    python bake.py -- <room_raw.glb> <ausgabeordner> [samples] [gruppen,kommagetrennt]

Eingabe ist der GLB-Export der Three.js-Szene (siehe tools/blender/README.md).
Ausgabe: room.glb (eine Mesh pro Gruppe, nur Geometrie und UVs) und <gruppe>_night.jpg / <gruppe>_day.jpg.
"""
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import (  # noqa: E402
    GROUPS, add_sun, apply_emission, clear_lights, convert_materials, group_of, mesh_objects,
    reset, set_sky_image, set_world, setup_cycles,
)

args = sys.argv[sys.argv.index('--') + 1:]
glb, out_dir = args[0], args[1]
samples = int(args[2]) if len(args) > 2 else 128
only = args[3].split(',') if len(args) > 3 else list(GROUPS)
sky_dir = os.path.dirname(glb)

# Texturgrößen je Gruppe
SIZES = {
    'shell': 2048, 'desk': 2048, 'shelf': 1024, 'lowshelves': 1024, 'drums': 1024,
    'chair': 512, 'monitor': 1024, 'smartphone': 256, 'whiteboard': 512,
}

NIGHT = dict(sky=3.0, screen=1.5, led=3, bulb_pendant=1100, bulb_desk=120)
DAY = dict(sky=2.5, screen=1.0, led=1.5, bulb_pendant=60, bulb_desk=20)

os.makedirs(out_dir, exist_ok=True)
reset(glb)
registry = convert_materials(NIGHT)
sky = {m: bpy.data.images.load(os.path.join(sky_dir, f'sky_{m}.png')) for m in ('night', 'day')}
set_sky_image(registry, sky['night'])

# Eltern lösen, Transformationen anwenden, pro Gruppe zu einem Mesh vereinen
bpy.ops.object.select_all(action='DESELECT')
meshes = mesh_objects()
by_group = {}
for o in meshes:
    by_group.setdefault(group_of(o), []).append(o)
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in [o for o in bpy.data.objects if o.type == 'EMPTY']:
    bpy.data.objects.remove(o)

joined = {}
for grp in GROUPS:
    objs = by_group.get(grp)
    if not objs:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = grp
    joined[grp] = obj
    print('gruppe', grp, len(objs), 'Teile', len(obj.data.polygons), 'Flächen')

# UV-Atlas pro Gruppe
for grp, obj in joined.items():
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    while len(obj.data.uv_layers) > 1:
        obj.data.uv_layers.remove(obj.data.uv_layers[-1])
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.004, area_weight=0.7)
    bpy.ops.uv.average_islands_scale()
    bpy.ops.uv.pack_islands(rotate=True, margin=0.004)
    bpy.ops.object.mode_set(mode='OBJECT')

# Zielbilder und Bake-Knoten in jedem Material
images = {}
bake_nodes = {}
for grp, obj in joined.items():
    size = SIZES[grp]
    for mode in ('night', 'day'):
        images[(grp, mode)] = bpy.data.images.new(f'{grp}_{mode}', size, size, alpha=False, float_buffer=True)
    nodes = []
    for slot in obj.material_slots:
        nt = slot.material.node_tree
        node = nt.nodes.new('ShaderNodeTexImage')
        node.image = images[(grp, 'night')]
        nt.nodes.active = node
        nodes.append(node)
    bake_nodes[grp] = nodes

setup_cycles(samples, 512, 512)
sc = bpy.context.scene
sc.cycles.use_denoising = False
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.01
sc.view_settings.exposure = 0.6
sc.render.image_settings.file_format = 'JPEG'
sc.render.image_settings.quality = 92


def bake_all(mode):
    for grp in only:
        obj = joined.get(grp)
        if not obj:
            continue
        for node in bake_nodes[grp]:
            node.image = images[(grp, mode)]
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.bake(type='COMBINED', margin=8, use_clear=True)
        path = os.path.join(out_dir, f'{grp}_{mode}.jpg')
        images[(grp, mode)].save_render(path, scene=sc)
        print('gebacken', grp, mode, path, flush=True)


# Nacht: warmes Abendlicht, Pendelleuchte und Schreibtischlampe an
apply_emission(registry, NIGHT)
set_world((0.5, 0.45, 0.6), 0.25)
bake_all('night')

# Tag: Sonne durch die Balkontür, Lampen gedimmt
clear_lights()
apply_emission(registry, DAY)
set_sky_image(registry, sky['day'])
set_world((0.7, 0.8, 1.0), 0.9)
add_sun((1.4, 7, 3.6), (1.0, 0.93, 0.8), 6, 2)
bake_all('day')

# Geometrie ohne Materialien exportieren (Texturen kommen aus den JPGs)
bpy.ops.object.select_all(action='DESELECT')
for obj in joined.values():
    obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(out_dir, 'room.glb'), export_format='GLB', use_selection=True,
    export_materials='NONE', export_normals=False, export_cameras=False, export_lights=False,
)
print('fertig')
