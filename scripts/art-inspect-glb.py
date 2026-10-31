"""Read-only GLB packaging check. Usage: python3 scripts/art-inspect-glb.py public/models/sailplane.glb"""
import hashlib,json,struct,sys
from pathlib import Path
p=Path(sys.argv[1]); b=p.read_bytes()
magic,version,total=struct.unpack_from('<III',b)
assert magic==0x46546c67 and version==2 and total==len(b),'Invalid GLB header'
n,kind=struct.unpack_from('<II',b,12)
assert kind==0x4e4f534a,'Missing GLB JSON'
j=json.loads(b[20:20+n]); root={
 'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),
 'generator':j.get('asset',{}).get('generator'),
 'meshes':len(j.get('meshes',[])),'nodes':len(j.get('nodes',[])),
 'skins':len(j.get('skins',[])),'animations':len(j.get('animations',[])),
 'images':len(j.get('images',[])),
 'externalUris':[x['uri'] for group in ('buffers','images') for x in j.get(group,[]) if 'uri'in x],
 'positionBounds':[{'min':j['accessors'][v['attributes']['POSITION']].get('min'),'max':j['accessors'][v['attributes']['POSITION']].get('max'),'vertices':j['accessors'][v['attributes']['POSITION']]['count']} for m in j.get('meshes',[]) for v in m['primitives']]
}
assert not root['externalUris'],'Model must load offline with embedded data'
print(json.dumps(root,indent=2))
