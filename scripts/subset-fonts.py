from pathlib import Path
from fontTools import subset
root=Path(__file__).resolve().parents[1]/'public/assets/fonts'
unicodes=list(range(0,0x250))+list(range(0x300,0x370))+list(range(0x1E00,0x1F00))+list(range(0x2000,0x2070))+list(range(0x20A0,0x20D0))+list(range(0x2190,0x2200))
for filename,family in [('be-vietnam-pro','HC Sans'),('noto-serif','HC Serif')]:
 options=subset.Options();options.flavor='woff2';options.layout_features=['*']
 font=subset.load_font(str(root/(filename+'.ttf')),options)
 sub=subset.Subsetter(options=options);sub.populate(unicodes=unicodes);sub.subset(font)
 for record in font['name'].names:
  if record.nameID in (1,4,6):record.string=(family.replace(' ','') if record.nameID==6 else family).encode(record.getEncoding(),errors='replace')
 subset.save_font(font,str(root/(filename+'.woff2')),options)
 print(filename,(root/(filename+'.woff2')).stat().st_size)
