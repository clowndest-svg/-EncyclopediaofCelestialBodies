from pathlib import Path

def apply(s,root,work):
    def replace(old,new):
        nonlocal s
        assert old in s,old[:120]
        s=s.replace(old,new,1)
    replace('<meta charset="UTF-8" />','<meta charset="UTF-8" />\n<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Crect width=%2240%22 height=%2240%22 rx=%2210%22 fill=%22%230b1728%22/%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%226%22 fill=%22%239ec8e2%22/%3E%3Cellipse cx=%2220%22 cy=%2220%22 rx=%2216%22 ry=%227%22 transform=%22rotate(-30 20 20)%22 fill=%22none%22 stroke=%22%239ec8e2%22/%3E%3C/svg%3E">')
    core=(root/'server/data/catalog-offline-core.json').read_text(encoding='utf-8').replace('<','\\u003c')
    textures=(work/'book-textures.json').read_text(encoding='utf-8')
    replace('  <!-- ==================== 核心 Three.js', (work/'encyclopedia.html.txt').read_text(encoding='utf-8')+'\n<script id="book-core-data" type="application/json">'+core+'</script>\n<script id="book-texture-data" type="application/json">'+textures+'</script>\n  <!-- ==================== 核心 Three.js')
    replace('  </style>','\n'+(work/'encyclopedia.css').read_text(encoding='utf-8')+'\n'+(work/'book-mobile-layout.css').read_text(encoding='utf-8')+'\n  </style>')
    content=(root/'server/catalog.mjs').read_text(encoding='utf-8')
    pure=content[content.index('export const KIND_NAMES'):content.index('async function jsonOr')]+content[content.index('export function normalizeQuery'):]
    pure=pure.replace('export ','')
    replace('    // 尺度分组容器',pure+'\n'+(work/'encyclopedia-viewer.js').read_text(encoding='utf-8')+'\n'+(work/'encyclopedia.js').read_text(encoding='utf-8')+'\n    // 尺度分组容器')
    replace('        bindUI();','        bindUI();\n        cosmicBook.bind();')
    replace('      const rawDt = Math.min(actualFrameDt, 0.05);','      if(cosmicBook.open){cosmicBook.frame(Math.min(actualFrameDt,.06));return;}\n      const rawDt = Math.min(actualFrameDt, 0.05);')
    replace('        animate();','        if(window.__atlas)window.__atlas.book=()=>({open:cosmicBook.open,mode:cosmicBook.mode,total:cosmicBook.stats.total,selected:cosmicBook.selected?.id,viewerReady:cosmicBook.viewer?.ready,viewerTime:cosmicBook.viewer?.time,queryTicket:cosmicBook.queryTicket});\n        animate();')
    return s
