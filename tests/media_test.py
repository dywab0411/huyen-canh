from pathlib import Path
import tempfile,sys
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from validate_attachment import sanitize
with tempfile.TemporaryDirectory() as folder:
 root=Path(folder);source=root/'input.jpg';out=root/'out.jpg'
 im=Image.new('RGB',(50,50),'pink');exif=Image.Exif();exif[270]='fictional-private-metadata';im.save(source,exif=exif)
 sanitize(source,out,'image/jpeg')
 with Image.open(out) as result:assert not result.getexif() and result.size==(50,50)
 source.write_bytes(b'MZ fake executable')
 try:sanitize(source,out,'image/jpeg');raise AssertionError('executable accepted')
 except (OSError,ValueError):pass
 source.write_text('<script>alert(1)</script>',encoding='utf8')
 try:sanitize(source,out,'text/plain');raise AssertionError('script accepted')
 except ValueError:pass
 source.write_bytes(b'%PDF-1.7')
 try:sanitize(source,out,'application/pdf');raise AssertionError('PDF released without scanner')
 except (ValueError,ImportError):pass
print('4 local media checks passed: image decoded/re-encoded, EXIF stripped, disguised executable/text script rejected, PDF fail-closed without scanner.')
