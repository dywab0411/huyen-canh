"""Original fictional 36-second animated illustration. No customer data or network."""
from PIL import Image, ImageDraw, ImageFont
import math, subprocess, pathlib, wave, struct, json
import imageio_ffmpeg
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets'; OUT.mkdir(parents=True,exist_ok=True)
W,H,FPS,DURATION=1280,720,24,36
FONT=ImageFont.truetype(str(OUT/'fonts/be-vietnam-pro.ttf'),27)
TITLE=ImageFont.truetype(str(OUT/'fonts/noto-serif.ttf'),46)
captions=[('Giữa hồ sen và mây sớm, ta dừng lại một nhịp.',0,6),('Không cần biết trước tương lai để sống tử tế hôm nay.',6,12),('Lắng nghe một cảm xúc, giữ gìn một điều nhỏ.',12,18),('Một lời cảm ơn. Một khoảng nghỉ. Một khởi đầu.',18,24),('Bạn luôn là người viết câu chuyện của mình.',24,30),('Huyền Cảnh · Nội dung hư cấu dành cho giải trí.',30,36)]
def frame(t):
 im=Image.new('RGB',(W,H));d=ImageDraw.Draw(im)
 for y in range(H):
  q=y/H;d.line((0,y,W,y),fill=(int(224+q*19),int(216+q*15),int(239-q*17)))
 d.ellipse((790,70,1020,300),fill='#fff8df')
 for i in range(7):
  x=(i*240+t*7)%1600-200;y=290+math.sin(i)*50
  d.ellipse((x,y,x+300,y+40),fill='#ede8f2')
 d.rectangle((0,490,W,H),fill='#c5d7cc')
 for i in range(16):
  y=510+i*12;x=70+math.sin(t*.6+i)*30
  d.arc((x,y,x+1100,y+35),0,180,fill='#e7eee4',width=2)
 dy=math.sin(t*1.1)*5
 # Original anime-inspired Linh Su character, fictional, no reference image.
 d.ellipse((505,102+dy,695,337+dy),fill='#332e44')
 d.polygon([(545,290+dy),(450,541),(739,541),(657,290+dy)],fill='#a99ac0')
 d.polygon([(571,294+dy),(555,541),(639,541),(626,294+dy)],fill='#f6eee3')
 d.polygon([(548,304+dy),(418,415+dy),(444,439+dy),(586,344+dy)],fill='#d4c9e1')
 d.polygon([(641,309+dy),(769,373+dy),(799,357+dy),(784,396+dy),(630,349+dy)],fill='#c5b5d8')
 d.ellipse((552,152+dy,648,281+dy),fill='#f0cdbb')
 d.polygon([(548,190+dy),(550,133+dy),(604,123+dy),(660,176+dy),(614,159+dy),(585,194+dy)],fill='#332e44')
 d.line((570,219+dy,586,220+dy),fill='#4b3c51',width=3);d.line((615,220+dy,631,218+dy),fill='#4b3c51',width=3)
 d.arc((586,242+dy,616,252+dy),0,170,fill='#a56a80',width=2)
 d.polygon([(584,132+dy),(600,87+dy),(616,132+dy)],fill='#c6a267')
 for x,y,scale in [(220,555,1),(975,558,1.3),(1090,620,.7),(340,640,.8)]:
  for j in range(5):
   a=(j-2)*.34;px=x+math.sin(a)*45*scale;py=y-math.cos(a)*28*scale+math.sin(t+i)*2
   d.ellipse((px-18*scale,py-26*scale,px+18*scale,py+26*scale),fill='#d9a9bc',outline='#f7e6ee',width=2)
  d.ellipse((x-65*scale,y+15*scale,x+65*scale,y+29*scale),fill='#88aa97')
 for i in range(20):
  x=(i*103+math.sin(t*.4+i)*8)%W;y=40+(i*43)%400+math.sin(t+i)*8;r=2+(math.sin(t*.7+i)+1)
  d.ellipse((x-r,y-r,x+r,y+r),fill='#c6a968')
 d.text((60,45),'Huyền Cảnh',font=TITLE,fill='#4b3c64')
 text=next(s for s,a,b in captions if a<=t<b)
 d.rounded_rectangle((90,642,1190,700),radius=15,fill='#faf7f2')
 box=d.textbbox((0,0),text,font=FONT);d.text(((W-(box[2]-box[0]))/2,655),text,font=FONT,fill='#302741')
 return im
if __name__=='__main__':
 exe=imageio_ffmpeg.get_ffmpeg_exe();target=OUT/'ho-sen-demo.mp4'
 p=subprocess.Popen([exe,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
 for n in range(FPS*DURATION):p.stdin.write(frame(n/FPS).tobytes())
 p.stdin.close();assert p.wait()==0
 frame(10).save(OUT/'ho-sen-poster.png')
 with open(OUT/'ho-sen-demo.vtt','w',encoding='utf8') as f:
  f.write('WEBVTT\n\n')
  for s,a,b in captions:f.write(f'00:00:{a:02}.000 --> 00:00:{b:02}.000\n{s}\n\n')
 # Optional original ambient chord; audio never auto-plays in the website.
 with wave.open(str(OUT/'may-som.wav'),'w') as f:
  f.setparams((1,2,22050,0,'NONE','not compressed'))
  for i in range(22050*12):
   t=i/22050;env=math.sin(math.pi*t/12)**2
   value=sum(math.sin(2*math.pi*hz*t) for hz in [220,277.1826,329.6276])/3
   f.writeframesraw(struct.pack('<h',int(4500*env*value)))
 metadata=imageio_ffmpeg.read_frames(str(target));info=next(metadata);metadata.close()
 assert info['size']==(1280,720) and 30<=info['duration']<=60
 (OUT/'video-verification.json').write_text(json.dumps(info,indent=2),encoding='utf8')
 print(json.dumps({'file':str(target),'duration':info['duration'],'size':info['size'],'bytes':target.stat().st_size}))
