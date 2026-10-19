"""Fetch the external character assets into ignored .runtime; never republish the meshes.
Sources and author terms are recorded in sources.md. Uses the creator's ordinary free download.
"""
from pathlib import Path
import subprocess,json,re,zipfile,html
ROOT=Path(__file__).resolve().parent
RUNTIME=ROOT/'.runtime';RUNTIME.mkdir(exist_ok=True)
def curl(url,*args):return subprocess.check_output(['curl','-fLsS','--retry','2',*args,url])
link='https://raw.githubusercontent.com/yaphi1/botw-link-demo-yb/50cd44b6a63814d2fcaf36a09c32a5dba8dda646/public/3d_assets/link.glb'
if not (RUNTIME/'link.glb').exists():
 print('Downloading Link…');(RUNTIME/'link.glb').write_bytes(curl(link))
if not (RUNTIME/'zelda-project/Mesh/zeldaSkelNoProps_V001_008.fbx').exists():
 print('Downloading Zelda from Stoff…')
 page='https://thestoff.itch.io/game-ready-zelda';text=curl(page).decode();token=html.unescape(re.search(r'name="csrf_token" value="([^"]+)"',text).group(1));upload=re.search(r'data-upload_id="(\d+)"',text).group(1)
 reply=json.loads(curl(page+'/file/'+upload,'-X','POST','--data-urlencode','csrf_token='+token))
 archive=RUNTIME/'zelda-project.zip';archive.write_bytes(curl(reply['url']));dest=RUNTIME/'zelda-project';dest.mkdir(exist_ok=True)
 with zipfile.ZipFile(archive) as z:
  for entry in z.infolist():
   output=(dest/entry.filename).resolve()
   if not output.is_relative_to(dest.resolve()):raise ValueError('Unsafe ZIP path')
   z.extract(entry,dest)
print('Character assets ready. External meshes remain in ignored .runtime/.')
