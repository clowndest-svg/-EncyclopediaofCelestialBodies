from pathlib import Path
import zipfile
ROOT=Path(__file__).resolve().parent.parent
files=[ROOT/name for name in ['cosmic_atlas_3_0.html','cosmic_atlas_3_0.original.html','encyclopedia-catalog.js','package.json','package-lock.json','.env.example','.gitignore','百科使用说明.md','启动星海百科.cmd','启动手机访问.cmd']]
files+=list((ROOT/'server').glob('*.mjs'))+list((ROOT/'server/scripts').glob('*.mjs'))+list((ROOT/'server/scripts').glob('*.py'))+list((ROOT/'server/tests').glob('*.mjs'))
files+=list((ROOT/'server/data').glob('*.json'))+list((ROOT/'server/data').glob('*.md'))
source_names=['assemble.py','continuation.py','continuation.css','dynamics.js','scenes.js','ui.js','motion.js','lab.js','flight.js','interface.css','interface.html','dynamics-panel.html','motion-panel.txt','lab-filters.txt','lab-controls.txt','tailwind.css','offline-imports.json','encyclopedia-build.py','encyclopedia.html.txt','encyclopedia.css','encyclopedia-viewer.js','encyclopedia.js','book-mobile-layout.css','book-textures.json']
files += [ROOT/'.work'/name for name in source_names]
files=list(dict.fromkeys(files));missing=[str(p) for p in files if not p.exists()]
if missing:raise SystemExit('Missing required files: '+str(missing))
output=ROOT/'星海图鉴_天体百科完整项目.zip'
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for file in files:archive.write(file,'星海图鉴_天体百科/'+file.relative_to(ROOT).as_posix())
with zipfile.ZipFile(output) as archive:
    assert not any(name.endswith('.env') or 'node_modules/' in name or '.sqlite' in name for name in archive.namelist())
    assert archive.testzip() is None
print('Project archive:',output.name,'files:',len(files),'bytes:',output.stat().st_size)
