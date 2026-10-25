"""Trusted Windows operator utility. No credentials in arguments; no PII logs.
Usage: python scripts/validate_attachment.py ATTACHMENT_UUID
Required environment: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_ACCESS_TOKEN.
Private files stay in a temporary folder and are removed on exit.
"""
import os,sys,json,uuid,tempfile,pathlib,urllib.request,urllib.parse,hashlib,subprocess,base64,warnings
from PIL import Image
import imageio_ffmpeg
Image.MAX_IMAGE_PIXELS=16_000_000
warnings.simplefilter("error",Image.DecompressionBombWarning)
LIMITS={'image/jpeg':5*1024**2,'image/png':5*1024**2,'image/webp':5*1024**2,'video/mp4':20*1024**2,'audio/mpeg':10*1024**2,'application/pdf':10*1024**2,'text/plain':1024**2}
def sanitize(source,target,mime):
 if mime.startswith('image/'):
  with Image.open(source) as im:
   im.load();im.convert('RGB').save(target,format={'image/jpeg':'JPEG','image/png':'PNG','image/webp':'WEBP'}[mime])
 elif mime in ('video/mp4','audio/mpeg'):
  exe=imageio_ffmpeg.get_ffmpeg_exe()
  common=[exe,'-y','-v','error','-i',str(source),'-map_metadata','-1','-sn','-dn']
  if mime=='video/mp4':
   frames=imageio_ffmpeg.read_frames(str(source));meta=next(frames);frames.close()
   if not 30<=meta['duration']<=60:raise ValueError('MP4 phải dài 30–60 giây')
   args=['-map','0:v:0','-map','0:a?','-vf','scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart','-f','mp4']
  else:args=['-map','0:a:0','-c:a','libmp3lame','-f','mp3']
  subprocess.run(common+args+[str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=180)
 elif mime=='text/plain':
  text=source.read_text(encoding='utf8')
  if any(x in text for x in ['<','>','\x00']):raise ValueError('text rejected')
  target.write_text(text,encoding='utf8')
 elif mime=='application/pdf':
  scanner=os.environ.get('CLAMSCAN_PATH')
  if not scanner:raise ValueError('PDF vẫn quarantine: chưa cấu hình scanner')
  subprocess.run([scanner,'--no-summary',str(source)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=120)
  from pypdf import PdfReader,PdfWriter
  r=PdfReader(source,strict=True)
  if r.is_encrypted or len(r.pages)>100:raise ValueError('PDF rejected')
  w=PdfWriter()
  for page in r.pages:
   for key in ['/AA','/Annots','/OpenAction','/Metadata']:page.pop(key,None)
   w.add_page(page)
  w.add_metadata({});w.write(target)
  subprocess.run([scanner,'--no-summary',str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=120)
 else:raise ValueError('unsupported')
def main():
 library='--library' in sys.argv;attachment=str(uuid.UUID(sys.argv[2] if library else sys.argv[1]));origin=os.environ['SUPABASE_URL'].rstrip('/');service=os.environ['SUPABASE_SERVICE_ROLE_KEY'];jwt=os.environ['ADMIN_ACCESS_TOKEN']
 if not origin.startswith('https://'):raise ValueError('HTTPS required')
 def request(path,method='GET',data=None,mime='application/json',user=False):
  body=None if data is None else data if isinstance(data,bytes) else json.dumps(data).encode()
  req=urllib.request.Request(origin+path,data=body,method=method,headers={'apikey':service,'Authorization':'Bearer '+(jwt if user else service),'Content-Type':mime})
  with urllib.request.urlopen(req,timeout=60) as res:return res.read()
 user=json.loads(request('/auth/v1/user',user=True));actor=user['id'];claims=json.loads(base64.urlsafe_b64decode(jwt.split('.')[1]+'==='))
 if claims.get('aal')!='aal2':raise ValueError('MFA AAL2 required')
 members=json.loads(request('/rest/v1/admin_members?select=role&active=eq.true&user_id=eq.'+actor))
 if not members or (library and members[0]['role']!='owner'):raise ValueError('admin required')
 a=json.loads(request('/rest/v1/'+('library_assets' if library else 'attachments')+'?select=*&id=eq.'+attachment))[0]
 if a['release_state']!='quarantine' or a['mime'] not in LIMITS:raise ValueError('not quarantined')
 with tempfile.TemporaryDirectory(prefix='hc-validator-') as folder:
  source=pathlib.Path(folder)/'input';target=pathlib.Path(folder)/'sanitized'
  raw=request('/storage/v1/object/authenticated/'+a['bucket']+'/'+urllib.parse.quote(a['storage_key'],safe='/'))
  if len(raw)>LIMITS[a['mime']]:raise ValueError('oversize')
  source.write_bytes(raw);sanitize(source,target,a['mime']);clean=target.read_bytes()
  if len(clean)>LIMITS[a['mime']]:raise ValueError('sanitized oversize')
  checksum=hashlib.sha256(clean).hexdigest();newkey=(a['id'] if library else a['order_id'])+'/'+str(uuid.uuid4())
  request('/storage/v1/object/'+a['bucket']+'/'+newkey,'POST',clean,a['mime'])
  request('/rest/v1/rpc/'+('release_library_asset' if library else 'release_attachment'),'POST',{'p_actor':actor,('p_asset' if library else 'p_attachment'):attachment,'p_key':newkey,'p_checksum':checksum,'p_size':len(clean)})
  request('/storage/v1/object/'+a['bucket'],'DELETE',{'prefixes':[a['storage_key']]})
 print('Attachment validated and released:',attachment)
if __name__=='__main__':
 try:main()
 except Exception:print('Validation/release failed. Keep attachment quarantined; inspect locally without logging PII.',file=sys.stderr);sys.exit(1)
