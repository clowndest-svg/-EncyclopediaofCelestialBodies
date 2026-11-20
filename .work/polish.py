"""UI polish layer: unified icons + final stylesheet injected last in <head>."""
from pathlib import Path

ICONS = {
    'video': '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'reset': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'mute': '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
    'sound': '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    'book': '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    'flask': '<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    'sparkle': '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
}

def icon(name, extra=''):
    cls = 'ico' + (' ' + extra if extra else '')
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>'

def apply(s, root, work):
    def replace(old, new):
        nonlocal s
        assert s.count(old) == 1, ('polish target not unique', old[:80], s.count(old))
        s = s.replace(old, new, 1)
    replace('<span id="audio-icon">🔇</span>', '<span id="audio-icon" hidden>🔇</span>' + icon('mute', 'ico-audio-off') + icon('sound', 'ico-audio-on'))
    replace('<span>🎥</span>', icon('video'))
    replace('<span>📷</span>', icon('camera'))
    replace('<span>👁️</span>', icon('eye'))
    replace('<span>↺</span>', icon('reset'))
    replace('<span>📖</span>', icon('book'))
    replace('<span>🧪</span>', icon('flask'))
    replace('<span aria-hidden="true">✧</span> 天体百科', icon('sparkle') + '<span>天体百科</span>')
    css = (work / 'polish.css').read_text(encoding='utf-8')
    replace('</head>', '<style id="ui-polish">\n' + css + '\n</style>\n</head>')
    return s
