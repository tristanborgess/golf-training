import bpy, os, json
from pathlib import Path
root=str(Path(__file__).resolve().parent.parent)
report=[]
for file in sorted(os.listdir(root+'/assets-src')):
 if not file.endswith('.fbx'): continue
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.fbx(filepath=root+'/assets-src/'+file)
 meshes=[o for o in bpy.data.objects if o.type=='MESH']
 rigs=[o for o in bpy.data.objects if o.type=='ARMATURE']
 actions=[{'name':a.name,'frames':list(a.frame_range)} for a in bpy.data.actions]
 report.append({'file':file,'actions':actions,'meshes':[(o.name,len(o.data.polygons)) for o in meshes], 'bones':[b.name for b in rigs[0].data.bones] if rigs else []})
 print('TRIAGE',json.dumps(report[-1]))
open(root+'/assets-src/triage.json','w').write(json.dumps(report,indent=2))

import bpy,json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
result={}
for file in sorted((root/'assets-src').glob('golf-*.fbx')):
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(file));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');action=rig.animation_data.action;start,end=action.frame_range
 poses=[]
 for i in range(11):
  bpy.context.scene.frame_set(round(start+(end-start)*i/10));poses.append({b.name.split(':')[-1]:list(rig.matrix_world@b.head) for b in rig.pose.bones})
 result[file.name]=poses
(root/'assets-src/poses.json').write_text(json.dumps(result))
