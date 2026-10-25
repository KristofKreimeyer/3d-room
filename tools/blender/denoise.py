"""Entrauscht die gebackenen JPGs mit Open Image Denoise (Compositor).

Aufruf: python denoise.py -- <ordner>
"""
import glob
import os
import sys

import bpy

folder = sys.argv[sys.argv.index('--') + 1]
for path in sorted(glob.glob(os.path.join(folder, '*_night.jpg')) + glob.glob(os.path.join(folder, '*_day.jpg'))):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    img = bpy.data.images.load(path)
    w, h = img.size
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, 100
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 92
    sc.view_settings.view_transform = 'Standard'
    sc.render.compositor_device = 'CPU'
    tree = bpy.data.node_groups.new('dn', 'CompositorNodeTree')
    sc.compositing_node_group = tree
    n_img = tree.nodes.new('CompositorNodeImage')
    n_img.image = img
    n_dn = tree.nodes.new('CompositorNodeDenoise')
    n_out = tree.nodes.new('NodeGroupOutput')
    tree.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
    tree.links.new(n_img.outputs['Image'], n_dn.inputs['Image'])
    tree.links.new(n_dn.outputs['Image'], n_out.inputs['Image'])
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('entrauscht', path, flush=True)
