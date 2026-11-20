from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urljoin
import base64, json, re
ROOT=Path(__file__).resolve().parent
VENDOR=ROOT/'vendor-20261120'
VENDOR.mkdir(exist_ok=False)
BASE='https://unpkg.com/three@0.160.0/'
queue=['build/three.module.min.js']+['examples/jsm/'+p for p in ['controls/OrbitControls.js','postprocessing/EffectComposer.js','postprocessing/RenderPass.js','postprocessing/UnrealBloomPass.js','postprocessing/OutputPass.js']]
modules={}
imports=re.compile(r"\bfrom\s*(['\"])([^'\"]+)\1")
while queue:
    path=queue.pop(0)
    if path in modules:continue
    with urlopen(Request(BASE+path,headers={'User-Agent':'CosmicAtlasBuilder/1.0'}),timeout=40) as r: text=r.read().decode('utf-8')
    modules[path]=text
    (VENDOR/path.replace('/','_')).write_text(text,encoding='utf-8')
    for m in imports.finditer(text):
        spec=m[2]
        if spec.startswith('.'):
            dep=urljoin(BASE+path,spec).removeprefix(BASE)
            assert dep.startswith('examples/jsm/'),dep
            queue.append(dep)
        elif spec!='three':raise ValueError('Unexpected import '+spec)
    print('Downloaded',path,len(text))
def specifier(path):return 'three' if path.startswith('build/') else 'three/addons/'+path.removeprefix('examples/jsm/')
result={}
for path,text in modules.items():
    def rewrite(m):
        spec=m[2]
        if spec.startswith('.'):spec=specifier(urljoin(BASE+path,spec).removeprefix(BASE))
        return 'from '+m[1]+spec+m[1]
    text=imports.sub(rewrite,text)
    result[specifier(path)]='data:text/javascript;base64,'+base64.b64encode(text.encode()).decode()
(ROOT/'offline-imports.json').write_text(json.dumps({'imports':result},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Bundled',len(result),'modules for offline use')
