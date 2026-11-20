import re, json, base64
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent.parent
text=(ROOT/'星海图鉴_4.0_引力轨道_武器重构_双端适配.html').read_text(encoding='utf-8')
match=re.search(r'window\.COSMIC_ASSETS\s*=\s*',text)
if not match:raise SystemExit('No JSON texture map found')
assets,_=json.JSONDecoder().raw_decode(text[match.end():].lstrip())
print('Texture keys:',[(key,len(value)) for key,value in assets.items()])
selected={key:value for key,value in assets.items() if key in ['earth_blue_marble.jpg','moon_regolith.jpg','jupiter.jpg','saturn.jpg','mars.jpg']}
source_dir=ROOT/'.work'/'source-textures-20261120'
source_dir.mkdir(exist_ok=False)
(source_dir/'selected.json').write_text(json.dumps(selected,separators=(',',':')),encoding='utf-8')
(ROOT/'.work'/'book-textures.json').write_text(json.dumps(selected,separators=(',',':')),encoding='utf-8')
print('Selected texture payload bytes:',sum(len(v) for v in selected.values()))
