"""Rebuild the texture-free mannequin and named golf actions from the untouched FBX inputs."""
import bpy, json, math, os
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.fps=30
bpy.ops.import_scene.fbx(filepath=str(ROOT/'assets-src/mannequin-tpose.fbx'))
rig=next(o for o in scene.objects if o.type=='ARMATURE')
rig.name='Golfer'
rig.animation_data_clear()
for b in rig.data.bones: b.name=b.name.replace('mixamorig1:', 'mixamorig:')
mesh=next(o for o in scene.objects if o.type=='MESH')
for v in mesh.vertex_groups:v.name=v.name.replace('mixamorig1:', 'mixamorig:')
for a in list(bpy.data.actions):bpy.data.actions.remove(a)
mat=bpy.data.materials.new('GolferMatte');mat.diffuse_color=(0.055,0.065,0.058,1);mat.use_nodes=True
bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=mat.diffuse_color;bsdf.inputs['Roughness'].default_value=.8
mesh.data.materials.clear();mesh.data.materials.append(mat)
for poly in mesh.data.polygons:poly.material_index=0;poly.use_smooth=True
clips={}
# Override selections for the triage contact sheet, without changing raw assets.
selections=json.loads(os.environ.get('GOLF_CLIPS','{"full":"golf-drive-2.fbx","chip":"golf-chip-2.fbx","putt":"golf-putt-3.fbx"}'))
for name,filename in selections.items():
 before=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(ROOT/'assets-src'/filename))
 source=next(o for o in set(bpy.data.objects)-before if o.type=='ARMATURE')
 action=source.animation_data.action;action.name=name;action.use_fake_user=True
 clips[name]=action
 for obj in set(bpy.data.objects)-before:bpy.data.objects.remove(obj,do_unlink=True)
rig.animation_data_create()
for name,action in clips.items():
 track=rig.animation_data.nla_tracks.new();track.name=name
 strip=track.strips.new(name,1,action)
 if action.slots:strip.action_slot=action.slots[0]
 strip.name=name
rig.animation_data.action=None
out=ROOT/'public/models';out.mkdir(exist_ok=True,parents=True)
# Three geometry styles share an attachment in the runtime; no textures ship.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);mesh.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets-src/golfer-raw.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_anim_slide_to_zero=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
report={'clips':{n:{'source':selections[n],'frames':list(a.frame_range),'duration':(a.frame_range[1]-a.frame_range[0])/30} for n,a in clips.items()},'triangles':sum(len(p.vertices)-2 for p in mesh.data.polygons),'rawBytes':(ROOT/'assets-src/golfer-raw.glb').stat().st_size}
(ROOT/'assets-src/model-report.json').write_text(json.dumps(report,indent=2))
print('MODEL REPORT',json.dumps(report))
# Render contact sheets / posters through the exact exported actions.
for track in rig.animation_data.nla_tracks:track.mute=True
scene.render.engine='CYCLES';scene.cycles.samples=12
scene.render.resolution_x=720;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG'
scene.world=bpy.data.worlds.new('World');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.7,.7,.7,1)
def point(obj, target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(-4,0,1.1));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=2.5;point(camera,(0,0,1));scene.camera=camera
for loc,power,size in [((2,-3,4),350,4),((-2,1,3),450,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;point(light,(0,0,1))
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=.008, depth=.8)
shaft=bpy.context.object;shaft.name='PosterClub'
clubmat=bpy.data.materials.new('Club');clubmat.diffuse_color=(.08,.2,.29,1);shaft.data.materials.append(clubmat)
bpy.ops.mesh.primitive_cube_add(size=1);head=bpy.context.object;head.name='PosterClubHead';head.scale=(.08,.04,.035);head.data.materials.append(clubmat)
for name,action in clips.items():
 rig.animation_data.action=action
 if action.slots:rig.animation_data.action_slot=action.slots[0]
 dest=out/'poster'/name;dest.mkdir(parents=True,exist_ok=True)
 start,end=action.frame_range
 for p,t in enumerate([0,.12,.24,.33,1] if name=="full" else [0,.12,.28,.4,1]):
  scene.frame_set(round(start+(end-start)*t))
  wrist=rig.pose.bones['mixamorig:RightHand'];finger=rig.pose.bones['mixamorig:RightHandMiddle1']
  grip=rig.matrix_world@wrist.head;direction=((rig.matrix_world@finger.head)-grip).normalized()
  shaft.location=grip+direction*.4;shaft.rotation_euler=direction.to_track_quat('Z','Y').to_euler();head.location=grip+direction*.8
  scene.render.filepath=str(dest/f'{p}.png');bpy.ops.render.render(write_still=True)
rig.animation_data.action=None
for track in rig.animation_data.nla_tracks:track.mute=False
for image in list(bpy.data.images):bpy.data.images.remove(image)
for material in list(bpy.data.materials):
 if material.users==0:bpy.data.materials.remove(material)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets-src/golfer.blend'),compress=True)
