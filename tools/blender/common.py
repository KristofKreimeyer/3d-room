"""Gemeinsame Blender-Funktionen: GLB-Export der Three.js-Szene einlesen, Materialien und Licht aufbauen.

Läuft mit dem Python-Modul `bpy` (pip install bpy), kein Blender-Fenster nötig.
Koordinaten: Three.js (x, y, z) entspricht Blender (x, -z, y); der glTF-Import erledigt das.
"""
import math
import bpy

GROUPS = ('monitor', 'smartphone', 'whiteboard', 'drums', 'chair', 'shelf', 'lowshelves', 'desk', 'shell')
LIGHT_ROLE = {'bulb_pendant': 1, 'bulb_desk': 1}


def reset(glb):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)


def group_of(obj):
    """Nächster benannter Vorfahr aus GROUPS (innerster gewinnt, z. B. monitor vor desk)."""
    o = obj
    while o:
        base = o.name.split('.')[0]
        if base in GROUPS:
            return base
        o = o.parent
    return None


def mesh_objects():
    return [o for o in bpy.data.objects if o.type == 'MESH']


def is_unlit(mat):
    return any(n.bl_idname == 'ShaderNodeLightPath' for n in mat.node_tree.nodes)


def unlit_info(mat):
    img = None
    color = (1, 1, 1, 1)
    for n in mat.node_tree.nodes:
        if n.bl_idname == 'ShaderNodeTexImage':
            img = n.image
        if n.bl_idname == 'ShaderNodeEmission':
            color = tuple(n.inputs['Color'].default_value)
    return img, color


def make_emission(mat, strength):
    nt = mat.node_tree
    img, color = unlit_info(mat)
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = strength
    if img:
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        nt.links.new(tex.outputs['Color'], em.inputs['Color'])
    else:
        em.inputs['Color'].default_value = color
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])


def make_diffuse_from_unlit(mat, roughness=0.65):
    nt = mat.node_tree
    img, color = unlit_info(mat)
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = roughness
    if img:
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = color
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])


def is_floor(mat):
    """Der Boden ist das einzige Material mit der dunklen Holzfarbe #6a4a35 (linear etwa 0.144, 0.069, 0.036)."""
    bsdf = next((n for n in mat.node_tree.nodes if n.bl_idname == 'ShaderNodeBsdfPrincipled'), None)
    if not bsdf or bsdf.inputs['Base Color'].is_linked:
        return False
    r, g, b = bsdf.inputs['Base Color'].default_value[:3]
    return abs(r - 0.144) < 0.01 and abs(g - 0.069) < 0.01 and abs(b - 0.036) < 0.01


def make_floor(mat):
    """Dunkle Fliesen mit hellen Fugen und leichtem Glanz, wie im Vorbild-Screenshot."""
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.bl_idname == 'ShaderNodeBsdfPrincipled')
    coord = nt.nodes.new('ShaderNodeNewGeometry')
    brick = nt.nodes.new('ShaderNodeTexBrick')
    brick.offset = 0.5
    brick.inputs['Scale'].default_value = 1.0
    brick.inputs['Color1'].default_value = (0.062, 0.030, 0.017, 1)
    brick.inputs['Color2'].default_value = (0.048, 0.022, 0.012, 1)
    brick.inputs['Mortar'].default_value = (0.20, 0.13, 0.085, 1)
    brick.inputs['Mortar Size'].default_value = 0.012
    brick.inputs['Mortar Smooth'].default_value = 0.1
    brick.inputs['Bias'].default_value = 0.0
    brick.inputs['Brick Width'].default_value = 0.9
    brick.inputs['Row Height'].default_value = 0.6
    nt.links.new(coord.outputs['Position'], brick.inputs['Vector'])
    nt.links.new(brick.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.28
    bsdf.inputs['Metallic'].default_value = 0.0


def add_bevel(mat, radius=0.008):
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.bl_idname == 'ShaderNodeBsdfPrincipled'), None)
    if not bsdf:
        return
    bev = nt.nodes.new('ShaderNodeBevel')
    bev.inputs['Radius'].default_value = radius
    bev.samples = 4
    nt.links.new(bev.outputs['Normal'], bsdf.inputs['Normal'])


def convert_materials(emission):
    """Unlit-Materialien (LEDs, Lampen, Bildschirme, Himmel) werden zu Lichtquellen, Poster zu normalem Material."""
    done = set()
    registry = {}
    for obj in mesh_objects():
        grp = group_of(obj)
        for slot in obj.material_slots:
            mat = slot.material
            if not mat or mat.name in done:
                continue
            done.add(mat.name)
            if not is_unlit(mat):
                if is_floor(mat):
                    make_floor(mat)
                add_bevel(mat)
                continue
            img, color = unlit_info(mat)
            r, g, b = color[:3]
            if img is not None:
                if grp == 'shell' and obj.location.y > -2.4 and img.size[1] > 300:
                    make_diffuse_from_unlit(mat)  # Poster
                    add_bevel(mat, 0.002)
                    registry[mat.name] = 'poster'
                elif img.size[0] == 512 and img.size[1] == 256:
                    make_emission(mat, emission['sky'])
                    registry[mat.name] = 'sky'
                    obj.visible_shadow = False  # Sonne soll durch die Himmelsfläche in den Raum fallen
                else:
                    make_emission(mat, emission['screen'])
                    registry[mat.name] = 'screen'
            else:
                if r > 0.95 and g > 0.8 and b > 0.55 and abs(r - 1.0) < 0.02 and g > 0.85:
                    strength = emission['bulb_pendant']
                    kind = 'bulb_pendant'
                elif r > 0.95 and 0.4 < g < 0.5:
                    strength = emission['bulb_desk']
                    kind = 'bulb_desk'
                else:
                    strength = emission['led']
                    kind = 'led'
                if grp == 'drums':
                    strength = min(strength, 1.0)
                make_emission(mat, strength)
                registry[mat.name] = kind


    return registry


def apply_emission(registry, emission):
    for name, kind in registry.items():
        if kind not in emission:
            continue
        for n in bpy.data.materials[name].node_tree.nodes:
            if n.bl_idname == 'ShaderNodeEmission':
                n.inputs['Strength'].default_value = emission[kind]


def make_plain(mat):
    """Emission-Material mit Bild → einfaches Material mit Bild (für den glTF-Export)."""
    nt = mat.node_tree
    img = next((n.image for n in nt.nodes if n.bl_idname == 'ShaderNodeTexImage'), None)
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])


def set_sky_image(registry, image):
    for name, kind in registry.items():
        if kind == 'sky':
            for n in bpy.data.materials[name].node_tree.nodes:
                if n.bl_idname == 'ShaderNodeTexImage':
                    n.image = image


def clear_lights():
    for o in [o for o in bpy.data.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(o)


def setup_cycles(samples, res_x, res_y):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 4
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 2
    sc.cycles.sample_clamp_indirect = 10
    sc.render.resolution_x = res_x
    sc.render.resolution_y = res_y
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'


def set_world(color, strength):
    w = bpy.data.worlds.new('World')
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*color, 1)
    bg.inputs['Strength'].default_value = strength


def add_sun(direction_from, color, strength, angle_deg):
    bpy.ops.object.light_add(type='SUN', location=direction_from)
    s = bpy.context.object
    s.data.energy = strength
    s.data.color = color
    s.data.angle = math.radians(angle_deg)
    # zeigt zum Ursprung
    from mathutils import Vector
    d = Vector((0, 0, 1.2)) - s.location
    s.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return s


def add_camera(pos, target, fov_deg):
    from mathutils import Vector
    bpy.ops.object.camera_add(location=pos)
    cam = bpy.context.object
    cam.data.sensor_fit = 'VERTICAL'
    cam.data.angle = math.radians(fov_deg)
    cam.data.clip_start = 0.05
    d = Vector(target) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return cam
