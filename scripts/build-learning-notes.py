#!/usr/bin/env python3
"""Build the review-first note listing and per-note HTML. Standard library only."""
import json
import re
from pathlib import Path
from html import escape
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'learning-notes'
NOTES = json.loads((OUT / 'notes.json').read_text())

def e(value):
    return escape(str(value), quote=True)

def date_label(value):
    return date.fromisoformat(value).strftime('%b %d, %Y').replace(' 0', ' ')

def section_id(heading):
    return re.sub(r'[^a-z0-9]+', '-', heading.lower()).strip('-')

def header(title, description, article=False):
    base = './' if article else './learning-notes/'
    home = '../' if article else './'
    listing = '../learning-notes-preview.html' if article else './learning-notes-preview.html'
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#050a10"><meta name="description" content="{e(description)}"><link rel="icon" href="data:,"><title>{e(title)} | Justin's Learning Notes</title><link rel="stylesheet" href="{base}styles.css"><script src="{base}notes.js" defer></script></head>
<body><a class="skip" href="#main">Skip to content</a><div class="preview-bar"><b>DESIGN PREVIEW</b> Separate from the main site. Content and layout are open for review.</div><div class="shell"><header class="nav"><a class="brand" href="{home}"><span>J</span>Justin</a><nav class="nav-links" aria-label="Main navigation"><a href="{home}">Portfolio</a><a class="current" href="{listing}">Learning notes</a><a class="back-link" href="{home}#learning">Back to Learning ↗</a></nav></header>'''

def footer(article=False):
    listing = '../learning-notes-preview.html' if article else './learning-notes-preview.html'
    return f'''<footer><span>JUSTIN / LEARNING IN PUBLIC</span><a href="{listing}">Keep learning. Keep notes. ↗</a></footer></div><div id="toast" class="toast" role="status" aria-live="polite" hidden></div></body></html>'''

def tags(note):
    return '<div class="tags">' + ''.join(f'<span class="tag">{e(tag)}</span>' for tag in note['tags']) + '</div>'

def block_html(block):
    kind = block['type']
    if kind == 'p': return '<p>' + e(block['text']) + '</p>'
    if kind == 'list': return '<ul>' + ''.join('<li>' + e(text) + '</li>' for text in block['items']) + '</ul>'
    if kind == 'callout': return '<aside class="callout"><strong>' + e(block['label']) + '</strong>' + e(block['text']) + '</aside>'
    if kind == 'code': return '<div class="code-block"><div class="code-head"><span>' + e(block['language']) + '</span><button class="copy-code" type="button" aria-label="Copy ' + e(block['language'].lower()) + '">Copy</button></div><pre><code>' + e(block['text']) + '</code></pre></div>'
    if kind == 'link':
        assert block['href'].startswith('../malachkit/'), 'Review any new destination before adding it.'
        return '<p><a class="inline-link" href="' + e(block['href']) + '">' + e(block['label']) + '</a></p>'
    raise ValueError('Unknown block type: ' + kind)

seen = set()
for note in NOTES:
    slug = note['slug']
    assert re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*', slug) and slug not in seen
    seen.add(slug)
    content = header(note['title'], note['summary'], True)
    content += '<main id="main"><div class="breadcrumb"><a href="../learning-notes-preview.html">← All notes</a><span>/</span><span>' + e(note['category']) + '</span></div><header class="article-hero"><p class="eyebrow">' + e(note['type'].upper()) + '</p><h1>' + e(note['title']) + '</h1><p class="intro">' + e(note['summary']) + '</p>' + tags(note) + '<div class="article-meta"><span>By Justin</span><span>Note added ' + e(date_label(note['date'])) + '</span><span>' + e(note['readTime']) + ' read</span></div></header><div class="article-layout"><article class="article-content"><aside class="basis"><strong>WHAT THIS NOTE IS BASED ON</strong>' + e(note['basis']) + '</aside>'
    for section in note['sections']:
        content += '<section id="' + section_id(section['heading']) + '"><h2>' + e(section['heading']) + '</h2>' + ''.join(block_html(block) for block in section['blocks']) + '</section>'
    content += '<section class="sources" id="sources"><h2>Sources &amp; further reading</h2><ul>' + ''.join('<li><a href="' + e(source['url']) + '" target="_blank" rel="noopener noreferrer">' + e(source['label']) + ' ↗</a></li>' for source in note['sources']) + '</ul><p>Reference notes are a way to organize learning, not a claim of expertise or a completed platform lab.</p></section></article><aside class="toc" aria-label="On this page"><p>IN THIS NOTE</p><nav>' + ''.join('<a href="#' + section_id(section['heading']) + '">' + e(section['heading']) + '</a>' for section in note['sections']) + '<a href="#sources">Sources &amp; further reading</a></nav></aside></div><div class="reading-footer"><a href="../learning-notes-preview.html">← Back to all learning notes</a><a href="../#skills">Explore my Loadout ↗</a></div></main>' + footer(True)
    (OUT / f'{slug}.html').write_text(content)

categories = ['All', 'Linux', 'Build notes', 'Security basics', 'CTF', 'Hack The Box', 'TryHackMe']
listing = header('Learning in practice', 'Reference notes, real milestones, and room for honest lab write-ups. A preview of Justin\'s learning notebook.')
listing += '''<main id="main"><section class="hero"><p class="eyebrow">// LEARN BY DOING · WRITE TO UNDERSTAND</p><h1>NOTES FROM<br><span>THE WORKBENCH.</span></h1><p class="intro">Short references, real milestones, and the things worth coming back to. A place to connect what I'm learning with what I'm building, without pretending to know it all.</p><div class="hero-meta"><span>03 STARTER NOTES</span><span>REFERENCE NOTES + COURSE MILESTONE</span><span>NO ACTIVE-MACHINE SOLUTIONS</span></div></section><div class="filter-area"><span class="filter-label">BROWSE THE NOTEBOOK</span><div class="filters" role="group" aria-label="Filter learning notes">'''
for category in categories:
    count = len(NOTES) if category == 'All' else sum(note['category'] == category for note in NOTES)
    listing += f'<button class="filter" type="button" data-filter="{e(category)}" aria-pressed="{"true" if category == "All" else "false"}">{e(category)}<span>{count}</span></button>'
listing += '</div></div><div class="notes-grid">'
for index, note in enumerate(NOTES, 1):
    listing += '<article class="note-card" data-note-category="' + e(note['category']) + '"><a href="./learning-notes/' + note['slug'] + '.html"><div class="note-cover" aria-hidden="true"><small>NOTE / ' + str(index).zfill(2) + '</small><span>' + e(note['symbol']) + '</span></div><div class="note-body"><p class="note-type">' + e(note['type'].upper()) + ' / ' + e(note['category'].upper()) + '</p><h2>' + e(note['title']) + '</h2><p class="note-summary">' + e(note['summary']) + '</p>' + tags(note) + '<div class="note-footer"><span>' + e(note['readTime']) + ' read</span><b>Read note ↗</b></div></div></a></article>'
listing += '''</div><div class="empty" id="empty-state" hidden><h2>No <span id="empty-category"></span> notes published yet.</h2><p>Space is ready for a real lab note. No room or machine completion is claimed here.</p><p>For Hack The Box, no active-machine solutions will be published.</p></div><p class="result-count" id="note-count" role="status" aria-live="polite">3 notes shown</p><aside class="honesty-panel"><div><p class="eyebrow">// KEEP THE RECORD HONEST</p><h2>Real notes beat invented progress.</h2><p>These starter pages use covered Loadout topics, the completed Cisco introduction, and the working MalachKit project. They're references and a milestone, not made-up lab stories.</p></div><ul><li>CTF, Hack The Box, and TryHackMe write-ups need the actual task, observations, and lessons before there is a story to publish.</li><li>No active HTB machine solutions. A platform-specific note must respect the platform's current sharing rules.</li><li>The notebook can grow one note at a time. A topic being listed here is not a claim that every part of it is mastered.</li></ul></aside></main>'''
listing = listing.replace('03 STARTER NOTES', str(len(NOTES)).zfill(2) + ' STARTER NOTES').replace('3 notes shown', str(len(NOTES)) + ' notes shown')
listing += footer()
(ROOT / 'public' / 'learning-notes-preview.html').write_text(listing)
print('Built preview listing and', len(NOTES), 'note pages.')
