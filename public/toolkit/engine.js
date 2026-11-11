// ===== SKILL TREE ENGINE =====
// Part of the independent Toolkit module: rendering, progression, filters, global search,
// details panel, owner mode, zoom/pan, routing. Reads CURRICULUM (toolkit/data/*.js) and
// ToolkitProgress (toolkit/progress.js). Never stores status in the curriculum.
(function(){
'use strict';
const TP = window.ToolkitProgress;
const CONFIG = TP.CONFIG, STATUS_LABEL = TP.STATUS_LABEL, repo = TP.repo, state = TP.state;
// ===== SKILL TREE SYSTEM =====
// Data-driven, one reusable renderer for all 8 modules.
// Curriculum lives in CURRICULUM (generated data above); user progress lives ONLY in localStorage.

const MODULES = CURRICULUM;
const SKILLS = {}, BRANCHES = {}, MODULE_BY_ID = {};
MODULES.forEach(m=>{ MODULE_BY_ID[m.id]=m; m.skills.forEach(s=>SKILLS[s.id]=s); m.branches.forEach(b=>BRANCHES[b.id]=b); });



// ---- progression engine: status is DERIVED, never stored in curriculum ----
let statusCache = {};
function computeStatuses(){
  statusCache = {};
  const visit = (id, stack) => {
    if (statusCache[id]) return statusCache[id];
    if (stack.includes(id)) { statusCache[id] = 'locked'; return 'locked'; } // circular guard
    const p = repo.skill(id);
    if (p && p.status === 'verified') return statusCache[id] = 'verified';
    const s = SKILLS[id];
    const preMet = s.pre.every(pr => SKILLS[pr] ? visit(pr, stack.concat(id)) === 'verified' : true);
    if (!preMet) return statusCache[id] = 'locked';
    if (p && p.status === 'in_progress') return statusCache[id] = 'in_progress';
    return statusCache[id] = 'available';
  };
  Object.keys(SKILLS).forEach(id => visit(id, []));
}
const statusOf = id => statusCache[id] || 'locked';
const moduleStats = m => {
  const st = { total:m.skills.length, verified:0, in_progress:0, available:0, locked:0, xp:0 };
  m.skills.forEach(s => { const k = statusOf(s.id); st[k]++; if (k==='verified') st.xp += s.xp; });
  st.pct = st.total ? Math.round(st.verified/st.total*100) : 0;
  st.level = levelFor(st.xp);
  return st;
};
function levelFor(xp){
  let l = 0;
  CONFIG.levelThresholds.forEach((t,i)=>{ if (xp >= t) l = i; });
  return l;
}
const branchStats = m => m.branches.map(b => {
  const st = { total:b.skills.length, verified:0, in_progress:0, available:0 };
  b.skills.forEach(id => { const k = statusOf(id); if (k in st) st[k]++; });
  return Object.assign({ id:b.id, name:b.name, letter:b.letter }, st);
});
const totalStats = () => {
  const st = { total:0, verified:0, in_progress:0, available:0, locked:0, xp:0 };
  MODULES.forEach(m => { const ms = moduleStats(m); Object.keys(st).forEach(k => st[k]+= (k==='xp'? ms.xp : ms[k])); });
  st.level = levelFor(st.xp);
  return st;
};

// ---- actions (owner mode; XP is derived from verified skills so it can only be earned once) ----
function startSkill(id){ repo.patch(id, { status:'in_progress', startedAt: (repo.skill(id)||{}).startedAt || new Date().toISOString() }); refresh(); }
function verifySkill(id){ repo.patch(id, { status:'verified', percent:100, verifiedAt: new Date().toISOString() }); refresh(); }
function unverifySkill(id){ repo.patch(id, { status:'in_progress', percent: (repo.skill(id)||{}).percent ?? 50, verifiedAt: undefined }); refresh(); }
function resetSkill(id){ repo.reset(id); refresh(); }
function setPercent(id, v){ repo.patch(id, { percent: Math.max(0, Math.min(100, v|0)) }); }
function saveNotes(id, notes){ repo.patch(id, { notes }); }
function addEvidence(id, title, url){
  const p = repo.skill(id) || { evidence:[] };
  const ev = (p.evidence || []).concat([{ title, url, addedAt: new Date().toISOString() }]);
  repo.patch(id, { evidence: ev });
}
function removeEvidence(id, idx){
  const p = repo.skill(id); if (!p) return;
  const ev = (p.evidence||[]).slice(); ev.splice(idx,1);
  repo.patch(id, { evidence: ev });
}

// ---- shared DOM refs ----
const $ = id => document.getElementById(id);
const headingEl=$('toolkitHeading'), loadoutEl=$('loadout'), loadNoteEl=$('loadoutNote'),
      takeoverEl=$('skilltree'), stageEl=$('stStage'), worldEl=$('stWorld'), svgEl=$('stSvg'),
      nodesEl=$('stNodes'), tipEl=$('stTip'), panelEl=$('stPanel'), filtersEl=$('stFilters'),
      headEl=$('stHead'), titleEl=$('treeTitle'), noteEl=$('stTreeNote');
const mq = window.matchMedia('(max-width:760px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// status -> shape: verified/in_progress/available = hexagon; locked = cracked diamond
let currentModule = null, selectedId = null;
let branchFilter = null, statusFilter = null, diffFilter = null;

// ---- ToolkitOverview + ModuleCard ----
function renderOverview(){
  const ts = totalStats();
  loadNoteEl.innerHTML = `Overall: <b>${ts.verified}/${ts.total}</b> verified · <b>${ts.in_progress}</b> in progress · <b>${ts.xp} XP</b> · LVL ${ts.level} — tools are attachments, skills are earned. Practice happens on my own systems, authorized targets, or intentionally vulnerable labs only.`;
  loadoutEl.innerHTML = MODULES.map(m => {
    const st = moduleStats(m);
    const tools = m.tools.slice(0,4).map(t=>`<span>${esc(t)}</span>`).join('') + (m.tools.length>4?`<span class="more">+${m.tools.length-4}</span>`:'');
    return `<button class="loadout-slot" data-module="${m.id}" type="button" aria-label="Open ${esc(m.name)} skill tree">
      <span class="lo-top"><span class="lo-icon">${m.glyph}</span><span class="lo-name">${esc(m.name)}<small>${m.num} / ${m.short}</small></span><span class="lo-lvl">LVL ${st.level}</span></span>
      <span class="lo-xp"><i style="width:${st.pct}%"></i></span>
      <span class="lo-xp-label"><span>${st.verified}/${st.total} VERIFIED</span><span>${st.xp} XP</span></span>
      <span class="lo-desc">${esc(m.desc)}</span>
      <span class="lo-mods"><b>ATTACHMENTS</b>${tools}</span>
      <span class="lo-tree">▸ OPEN SKILL TREE (${st.available} AVAILABLE)</span>
    </button>`;
  }).join('');
  loadoutEl.querySelectorAll('.loadout-slot').forEach(b=> b.addEventListener('click',()=> navigate(b.dataset.module)));
}

// ---- SkillTreeCanvas: SVG wires behind HTML node buttons ----
let view = { k:1, tx:0, ty:0 };
let curLayout = null;
function layoutFor(m){
  const wide = !mq.matches;
  const W = wide ? m.layout.w : 390;
  let pos = {}, H;
  if (wide) {
    H = m.layout.h;
    m.skills.forEach(s => pos[s.id] = [s.x*W, s.y*H]);
  } else {
    // mobile: vertical winding 3-column layout
    const xs=[62,195,328], per=3, y0=215, dy=104;
    H = y0 + (m.skills.length-1)*dy/per*1 + 0; // placeholder, computed below
    let i=0; H = 0;
    m.skills.forEach(s => {
      const row=Math.floor(i/per);
      pos[s.id]=[xs[i%per], y0+row*dy];
      H = Math.max(H, y0+row*dy);
      i++;
    });
    H += 100;
  }
  return { W, H, pos, root:[W/2, wide?H/2:78] };
}
function wireD(x1,y1,x2,y2,key){
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const px=-dy/len, py=dx/len;
  let h=0; for (const c of key) h=(h*31+c.charCodeAt(0))>>>0;
  const b=Math.min(len*0.22,72)*(h%2?-1:1);
  return `M ${x1} ${y1} C ${(x1+dx*.3+px*b).toFixed(1)} ${(y1+dy*.3+py*b).toFixed(1)}, ${(x1+dx*.7-px*b).toFixed(1)} ${(y1+dy*.7-py*b).toFixed(1)}, ${x2} ${y2}`;
}
function iconSvg(id){
  const key = id.indexOf('__root.')===0 ? (window.TOOLKIT_ROOT_ICONS||{})[id.slice(7)] : (window.TOOLKIT_ICONS||{})[id];
  const paths = (window.TOOLKIT_ICON_PATHS||{})[key] || '';
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
function statusClass(id){ return statusOf(id).replace('_','-'); }

function renderModule(){
  const m = currentModule; if (!m) return;
  computeStatuses();
  const { W, H, pos, root } = layoutFor(m);
  const fit = stageEl.clientWidth / W;
  curLayout = { W, H, fit };
  worldEl.style.width = W+'px'; worldEl.style.height = H+'px';
  worldEl.style.transformOrigin = '0 0';
  view = { k:fit, tx:0, ty:0 };
  applyView();
  stageEl.style.height = (H*fit)+'px';
  // stars + wires (SVG, behind nodes)
  let seed = m.num.charCodeAt(1)*13+7; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  let inner = '';
  for(let i=0;i<(mq.matches?50:90);i++){const x=rnd()*W,y=rnd()*H,r=.6+rnd()*1.3;inner+=`<circle class="star${rnd()>.85?' tw':''}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`;}
  m.skills.forEach(s=>{
    s.pre.forEach(pr=>{
      if (!pos[pr]) return; // cross-module prerequisite: shown in panel, no wire
      const t = statusOf(s.id);
      const cls = t==='verified'?'lit':t==='in_progress'?'prog':t==='available'?'avail':'';
      const [x1,y1]=pos[pr], [x2,y2]=pos[s.id];
      inner+=`<path class="wire ${cls}" data-pre="${pr}" data-skill="${s.id}" d="${wireD(x1,y1,x2,y2,s.id)}"/>`;
    });
    if (s.pre.length===0){
      // visual link from the module root to each branch entry (not a prerequisite - entries stay available)
      const t = statusOf(s.id);
      const cls = t==='verified'?'lit':t==='in_progress'?'prog':'avail';
      const [x1,y1]=root, [x2,y2]=pos[s.id];
      inner+=`<path class="wire rootwire ${cls}" data-pre="__root" data-skill="${s.id}" d="${wireD(x1,y1,x2,y2,'root'+s.id)}"/>`;
    }
  });
  svgEl.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svgEl.innerHTML = inner;
  // root node
  const ms = moduleStats(m);
  let nodesHtml = `<button class="st-node rootn" data-id="__root" style="left:${root[0]}px;top:${root[1]}px" type="button" aria-label="${esc(m.short)} module root">
    <span class="hex"><span class="hex-in">${iconSvg('__root.'+m.id)}</span></span><span class="nm">${esc(m.short)}</span><span class="num">${ms.verified}/${ms.total} VERIFIED</span></button>`;
  m.skills.forEach((s,i)=>{
    const [x,y]=pos[s.id];
    const t = statusOf(s.id);
    nodesHtml += `<button class="st-node ${statusClass(s.id)}" data-id="${s.id}" style="left:${x}px;top:${y}px" type="button"
      aria-label="${esc(s.name)}: ${STATUS_LABEL[t]}" aria-describedby="stTip">
      <span class="hex"><span class="hex-in">${iconSvg(s.id)}</span></span><span class="nm">${esc(shortName(s.name))}</span><span class="num">#${String(s.n||i+1).padStart(2,'0')}</span></button>`;
  });
  nodesEl.innerHTML = nodesHtml;
  nodesEl.querySelectorAll('.st-node').forEach(el=>{
    const id = el.dataset.id;
    if (id==='__root') return;
    el.addEventListener('mouseenter',()=>{ if(!mq.matches) showTip(id); });
    el.addEventListener('mouseleave',hideTip);
    el.addEventListener('click',e=>{ e.stopPropagation(); selectSkill(id===selectedId?null:id); });
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();selectSkill(id);} });
  });
  renderFilters();
  applyFilters();
  if (selectedId && SKILLS[selectedId] && SKILLS[selectedId].module===m.id) highlightPath(selectedId);
}
function shortName(n){
  if (n.length<=17) return n;
  const w = n.split(' ');
  let out = w[0];
  for (let i=1; i<w.length && (out+' '+w[i]).length<=17; i++) out += ' '+w[i];
  if (out.endsWith('&') && w.length>2) out += ' '+w[2];
  return out;
}
function esc(s){ return String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// selection + prerequisite path highlight
function ancestors(id, acc){
  acc = acc || new Set();
  (SKILLS[id].pre||[]).forEach(pr=>{ if(SKILLS[pr] && SKILLS[pr].module===SKILLS[id].module && !acc.has(pr)){ acc.add(pr); ancestors(pr, acc); } });
  return acc;
}
function highlightPath(id){
  const anc = id ? ancestors(id) : new Set();
  nodesEl.querySelectorAll('.st-node').forEach(el=>{
    el.classList.toggle('selected', el.dataset.id===id);
    el.classList.toggle('path', !!id && anc.has(el.dataset.id));
    el.classList.toggle('dimmed', !!id && el.dataset.id!==id && !anc.has(el.dataset.id) && el.dataset.id!=='__root');
  });
  svgEl.querySelectorAll('.wire').forEach(w=>{
    w.classList.toggle('sel', !!id && w.dataset.skill===id || (!!id && anc.has(w.dataset.skill)));
  });
}
function selectSkill(id){
  selectedId = id;
  highlightPath(id);
  hideTip();
  if (id) renderPanel(id); else panelEl.hidden = true;
}

// zoom / pan
function applyView(){ worldEl.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.k})`; }
function zoomAt(f, cx, cy){
  const zmin = curLayout ? curLayout.fit*CONFIG.zoomMin : CONFIG.zoomMin;
  const zmax = curLayout ? curLayout.fit*CONFIG.zoomMax*2 : CONFIG.zoomMax;
  const k2 = Math.max(zmin, Math.min(zmax, view.k*f));
  const r = k2/view.k;
  view.tx = cx - (cx-view.tx)*r; view.ty = cy - (cy-view.ty)*r; view.k = k2;
  applyView();
}
function resetZoom(){ if (curLayout) view = {k:curLayout.fit,tx:0,ty:0}; else view = {k:1,tx:0,ty:0}; applyView(); }
function stagePoint(e){ const r=stageEl.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; }

// ---- filters: branch chips + status chips + difficulty chips ----
function renderFilters(){
  const m = currentModule;
  const bs = branchStats(m);
  let h = `<div class="f-row" role="group" aria-label="Branch filter">
    <button class="chip${branchFilter?'':' on'}" data-f="branch" data-v="" type="button">ALL BRANCHES</button>` +
    bs.map(b=>`<button class="chip${branchFilter===b.id?' on':''}" data-f="branch" data-v="${b.id}" type="button">${b.letter} · ${esc(b.name)} <i>${b.verified+b.in_progress}/${b.total}</i></button>`).join('') + '</div>';
  h += `<div class="f-row" role="group" aria-label="Status filter">
    <button class="chip${statusFilter?'':' on'}" data-f="status" data-v="" type="button">ALL STATES</button>` +
    ['verified','in_progress','available','locked'].map(s=>`<button class="chip s-${s.replace('_','-')}${statusFilter===s?' on':''}" data-f="status" data-v="${s}" type="button">${STATUS_LABEL[s]}</button>`).join('') + '</div>';
  h += `<div class="f-row" role="group" aria-label="Difficulty filter">
    <button class="chip${diffFilter?'':' on'}" data-f="diff" data-v="" type="button">ALL LEVELS</button>` +
    ['foundation','intermediate','advanced','project'].map((d,i)=>`<button class="chip${diffFilter===d?' on':''}" data-f="diff" data-v="${d}" type="button">${'▮'.repeat(i+1)} ${d.toUpperCase()}</button>`).join('') + '</div>';
  filtersEl.innerHTML = h;
  filtersEl.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>{
    const f=c.dataset.f, v=c.dataset.v||null;
    if(f==='branch') branchFilter = branchFilter===v?null:v;
    if(f==='status') statusFilter = statusFilter===v?null:v;
    if(f==='diff')   diffFilter   = diffFilter===v?null:v;
    renderFilters(); applyFilters();
  }));
}
function applyFilters(){
  const m = currentModule; if(!m) return;
  const any = branchFilter||statusFilter||diffFilter;
  const match = s => (!branchFilter || s.branch===branchFilter)
    && (!statusFilter || statusOf(s.id)===statusFilter)
    && (!diffFilter || s.difficulty===diffFilter);
  nodesEl.querySelectorAll('.st-node').forEach(el=>{
    const s = SKILLS[el.dataset.id];
    el.classList.toggle('faded', !!any && el.dataset.id!=='__root' && s && !match(s));
  });
  svgEl.querySelectorAll('.wire').forEach(w=>{
    const s = SKILLS[w.dataset.skill];
    w.classList.toggle('faded', !!any && s && !match(s));
  });
}

// ---- hover tooltip (compact) ----
function showTip(id){
  const s = SKILLS[id]; if(!s) return;
  const t = statusOf(id);
  tipEl.innerHTML = `<span class="tb">${esc(BRANCHES[s.branch].name)} · ${s.difficulty.toUpperCase()} · ${s.xp} XP</span><h4>${esc(s.name)}</h4><p>${esc(s.desc)}</p><span class="ts ${t.replace('_','-')}">${STATUS_LABEL[t]}</span>`;
  const el = nodesEl.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (!el) return;
  const scale = view.k;
  let x = parseFloat(el.style.left)*scale + view.tx + 46, y = parseFloat(el.style.top)*scale + view.ty - 30;
  if (x + 250 > stageEl.clientWidth) x = parseFloat(el.style.left)*scale + view.tx - 280;
  if (x < 4) x = 4;
  if (y < 4) y = parseFloat(el.style.top)*scale + view.ty + 52;
  tipEl.style.left = x+'px'; tipEl.style.top = y+'px'; tipEl.style.display='block';
}
function hideTip(){ tipEl.style.display='none'; }

// ---- SkillDetailsPanel (desktop side panel / mobile bottom sheet) ----
function cmdRow(c){
  const v = typeof c==='string'? c : c.value;
  const p = typeof c==='object'&&c.purpose ? `<span class="cmd-p">${esc(c.purpose)}</span>` : '';
  return `<span class="cmd"><code>${esc(v)}</code><button class="copy" data-copy="${esc(v)}" type="button" aria-label="Copy ${esc(v)}">COPY</button>${p}</span>`;
}
function renderPanel(id){
  const s = SKILLS[id]; if(!s) return;
  const m = MODULE_BY_ID[s.module], b = BRANCHES[s.branch];
  const t = statusOf(id), p = repo.skill(id) || {};
  const owner = state.ownerMode;
  const preNames = s.pre.map(pr=> SKILLS[pr]
    ? `<button class="pre" data-goto="${pr}" type="button">${SKILLS[pr].module!==s.module?'⤴ ':''}${esc(SKILLS[pr].name)}<i class="st-${statusOf(pr).replace('_','-')}"></i></button>`
    : '').join('');
  let h = `<button class="p-close" id="pClose" type="button" aria-label="Close details">✕</button>
   <span class="tb">${m.num} / ${esc(m.short)} · BRANCH ${b.letter} · ${esc(b.name)}</span>
   <h3>${esc(s.name)}</h3>
   <div class="p-meta"><span class="ts ${t.replace('_','-')}">${STATUS_LABEL[t]}</span><span class="diff">${'▮'.repeat({foundation:1,intermediate:2,advanced:3,project:4}[s.difficulty])} ${s.difficulty.toUpperCase()}</span><span class="xp">+${s.xp} XP</span></div>
   <p class="p-desc">${esc(s.desc)}</p>`;
  if (s.tools.length) h += `<div class="p-sec"><b>TOOLS</b><div class="p-tags">${s.tools.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>`;
  if (s.commands.length) h += `<div class="p-sec"><b>COMMANDS</b><div class="p-cmds">${s.commands.map(cmdRow).join('')}</div></div>`;
  if (s.pre.length) h += `<div class="p-sec"><b>PREREQUISITES</b><div class="p-pres">${preNames}</div></div>`;
  if (s.obj&&s.obj.length) h += `<div class="p-sec"><b>LEARNING OBJECTIVES</b><ul>${s.obj.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>`;
  if (s.exercise) h += `<div class="p-sec"><b>PRACTICAL EXERCISE</b><p>${esc(s.exercise)}</p></div>`;
  if (s.unlock&&s.unlock.length) h += `<div class="p-sec"><b>UNLOCK REQUIREMENTS</b><ul>${s.unlock.map(o=>`<li>${esc(o)}</li>`).join('')}</ul></div>`;
  if (s.evidenceNote) h += `<div class="p-sec"><b>EVIDENCE</b><p>${esc(s.evidenceNote)}</p></div>`;
  const ev = p.evidence||[];
  if (ev.length) h += `<div class="p-sec"><b>SAVED EVIDENCE</b>${ev.map((e,i)=>`<div class="ev"><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.title||e.url)} ↗</a>${owner?`<button class="ev-del" data-evdel="${i}" type="button">✕</button>`:''}</div>`).join('')}</div>`;
  if (p.notes) h += `<div class="p-sec"><b>NOTES</b><p class="p-notes">${esc(p.notes)}</p></div>`;
  if (owner) {
    h += `<div class="p-sec p-owner"><b>OWNER MODE (this browser only)</b><div class="p-actions">`;
    if (t==='available'||t==='locked') h += `<button class="act" data-act="start" type="button" ${t==='locked'?'disabled title="Prerequisites not verified yet"':''}>START LEARNING</button>`;
    if (t==='in_progress') h += `<button class="act go" data-act="verify" type="button">MARK VERIFIED</button><button class="act" data-act="unstart" type="button">PAUSE</button>`;
    if (t==='verified') h += `<button class="act" data-act="unverify" type="button">UNMARK VERIFIED</button>`;
    if (p.status||ev.length||p.notes) h += `<button class="act danger" data-act="reset" type="button">RESET</button>`;
    h += `</div>`;
    if (t==='in_progress') h += `<label class="p-lab">PROGRESS <span id="pPctVal">${p.percent||0}%</span><input type="range" id="pPct" min="0" max="100" value="${p.percent||0}"></label>`;
    h += `<label class="p-lab">NOTES<textarea id="pNotes" rows="3" placeholder="What I practised, what clicked...">${esc(p.notes||'')}</textarea></label>`;
    h += `<label class="p-lab">ADD EVIDENCE LINK<input id="pEvT" type="text" placeholder="Title (e.g. Nmap lab report)"><input id="pEvU" type="url" placeholder="https://github.com/..."><button class="act" data-act="addev" type="button">ADD EVIDENCE</button></label>`;
    h += `</div>`;
  }
  panelEl.innerHTML = h;
  panelEl.hidden = false;
  bindPanel(id);
}
function bindPanel(id){
  $('pClose').addEventListener('click',()=>selectSkill(null));
  panelEl.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{
    const txt=b.dataset.copy;
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{b.textContent='COPIED';setTimeout(()=>b.textContent='COPY',1200);}).catch(()=>{b.textContent='SELECT+CTRL+C';});
  }));
  panelEl.querySelectorAll('.pre').forEach(b=>b.addEventListener('click',()=>{
    const t=b.dataset.goto;
    if (SKILLS[t].module!==currentModule.id) { navigate(SKILLS[t].module, t); } else selectSkill(t);
  }));
  panelEl.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{
    const a=b.dataset.act;
    if(a==='start') startSkill(id);
    if(a==='verify'){ if(window.confirm('Mark "'+SKILLS[id].name+'" as VERIFIED? Only do this when you can demonstrate it with evidence.')) verifySkill(id); }
    if(a==='unstart') repo.patch(id,{status:null}), refresh();
    if(a==='unverify') unverifySkill(id);
    if(a==='reset'){ if(window.confirm('Reset all saved progress, notes and evidence for "'+SKILLS[id].name+'"?')) resetSkill(id); }
    if(a==='addev'){
      const ti=$('pEvT').value.trim(), u=$('pEvU').value.trim();
      if(!/^https:\/\/[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(u)){ $('pEvU').setCustomValidity('Use a full https:// URL'); $('pEvU').reportValidity(); return; }
      addEvidence(id, ti||u, u);
    }
  }));
  const pct=$('pPct'); if(pct) pct.addEventListener('change',()=>{ setPercent(id,+pct.value); $('pPctVal').textContent=pct.value+'%'; });
  const nt=$('pNotes'); if(nt) nt.addEventListener('change',()=>{ saveNotes(id,nt.value); });
  panelEl.querySelectorAll('.ev-del').forEach(b=>b.addEventListener('click',()=>{ removeEvidence(id,+b.dataset.evdel); refresh(); }));
}

// ---- global search across ALL modules (names, labels, descriptions, tools, commands, objectives) ----
const searchInput = $('stSearchInput'), searchResults = $('stSearchResults');
function searchAll(q){
  q = q.trim().toLowerCase(); if (q.length<2) return [];
  const hits = [];
  MODULES.forEach(m=>m.skills.forEach(s=>{
    const fields = [s.name, s.label, s.desc, (s.tools||[]).join(' '), (s.commands||[]).join(' '), ((s.obj||[]).join(' '))].join(' ').toLowerCase();
    if (fields.includes(q)) {
      let why = 'name';
      if (s.label.toLowerCase()===q || s.name.toLowerCase().includes(q)) why='name';
      else if ((s.commands||[]).join(' ').toLowerCase().includes(q)) why='command';
      else if ((s.tools||[]).join(' ').toLowerCase().includes(q)) why='tool';
      else if (s.desc.toLowerCase().includes(q)) why='description';
      else why='objective';
      hits.push({ s, m, why });
    }
  }));
  return hits;
}
function renderSearch(q){
  const hits = searchAll(q);
  if (!q || q.trim().length<2){ searchResults.hidden = true; return; }
  searchResults.hidden = false;
  searchResults.innerHTML = hits.length
    ? `<div class="sr-count">${hits.length} skill${hits.length===1?'':'s'} across ${new Set(hits.map(h=>h.m.id)).size} module${new Set(hits.map(h=>h.m.id)).size===1?'':'s'}</div>` +
      hits.slice(0,14).map(h=>`<button class="sr" data-m="${h.m.id}" data-s="${h.s.id}" type="button">
        <b>${esc(h.s.name)}</b><span>${h.m.num} ${esc(h.m.short)} · ${esc(BRANCHES[h.s.branch].name)} · matched ${h.why}</span></button>`).join('')
      + (hits.length>14?`<div class="sr-count">+${hits.length-14} more - refine the search</div>`:'')
    : `<div class="sr-count">No skills match "${esc(q)}".</div>`;
  searchResults.querySelectorAll('.sr').forEach(b=>b.addEventListener('click',()=>{
    searchResults.hidden = true; searchInput.value='';
    navigate(b.dataset.m, b.dataset.s);
  }));
}
searchInput.addEventListener('input',()=>renderSearch(searchInput.value));
searchInput.addEventListener('keydown',e=>{ if(e.key==='Escape'){ searchResults.hidden=true; } });
document.addEventListener('click',e=>{ if(!e.target.closest('.st-search')) searchResults.hidden=true; });

// ---- module navigation: hash routes #/toolkit and #/toolkit/<slug> ----
function navigate(moduleId, selectId){
  location.hash = '#/toolkit/' + moduleId + (selectId ? '?select=' + encodeURIComponent(selectId) : '');
}
function closeModule(){
  if (currentModule) { location.hash = '#/toolkit'; }
}
function applyRoute(){
  const h = location.hash;
  const mMatch = h.match(/^#\/toolkit\/([a-z]+)(?:\?select=([^&]+))?/);
  if (mMatch && MODULE_BY_ID[mMatch[1]]) {
    openModule(MODULE_BY_ID[mMatch[1]], mMatch[2] ? decodeURIComponent(mMatch[2]) : null);
  } else {
    showOverview();
  }
}
function showOverview(){
  currentModule = null; selectedId = null;
  takeoverEl.hidden = true;
  headingEl.style.display=''; loadoutEl.style.display=''; loadNoteEl.style.display='';
  renderOverview();
}
function openModule(m, selectId){
  currentModule = m; selectedId = null;
  branchFilter = statusFilter = diffFilter = null;
  headingEl.style.display='none'; loadoutEl.style.display='none'; loadNoteEl.style.display='none';
  takeoverEl.hidden = false;
  const ms = moduleStats(m);
  headEl.innerHTML = `
    <button class="st-back" id="treeBack" type="button">◀ LOADOUT</button>
    <span class="st-chip"><span class="st-chip-ic">${m.glyph}</span><span><b>${esc(m.name)}</b><small>${m.num} / ${esc(m.short)}</small></span></span>
    <span class="st-lvl">LVL ${ms.level} · ${ms.xp} XP · ${ms.verified}/${ms.total} VERIFIED</span>
    <button class="st-owner" id="ownerToggle" type="button" aria-pressed="${state.ownerMode}">OWNER MODE: ${state.ownerMode?'ON':'OFF'}</button>`;
  titleEl.innerHTML = esc(m.short) + ' <span>SKILL TREE</span>';
  noteEl.textContent = 'Green = demonstrated with evidence · cyan = learning · grey = locked. ' + (state.ownerMode ? 'Owner mode ON: changes save only in this browser.' : 'Read-only for visitors.');
  $('treeBack').addEventListener('click',closeModule);
  $('ownerToggle').addEventListener('click',()=>{
    state.ownerMode = !state.ownerMode; repo.save(); openModule(m, selectedId);
  });
  resetZoom();
  renderModule();
  if (selectId && SKILLS[selectId] && SKILLS[selectId].module===m.id) selectSkill(selectId);
  document.getElementById('skills').scrollIntoView({behavior: reduceMotion.matches?'auto':'smooth', block:'start'});
}
function refresh(){
  computeStatuses();
  if (currentModule) {
    const keep = selectedId;
    const ms = moduleStats(currentModule);
    const lvl = headEl.querySelector('.st-lvl'); if (lvl) lvl.textContent = `LVL ${ms.level} · ${ms.xp} XP · ${ms.verified}/${ms.total} VERIFIED`;
    renderModule();
    if (keep && SKILLS[keep]) { selectSkill(keep); }
  } else renderOverview();
}

// ---- zoom/pan events on stage ----
(function(){
  let drag = null;
  stageEl.addEventListener('wheel', e=>{
    if (!currentModule) return;
    e.preventDefault();
    if (e.ctrlKey) {
      // touchpad pinch (browsers report it as ctrl+wheel): zoom around the cursor
      const [cx,cy] = stagePoint(e);
      zoomAt(e.deltaY<0?1.12:0.89, cx, cy);
    } else {
      // two-finger scroll: pan the tree
      view.tx -= e.deltaX; view.ty -= e.deltaY; applyView();
    }
  }, {passive:false});
  stageEl.addEventListener('pointerdown', e=>{
    if (e.target.closest('.st-node') || e.target.closest('.st-panel') || e.target.closest('.st-zoom')) return;
    drag = { x:e.clientX, y:e.clientY, tx:view.tx, ty:view.ty };
    stageEl.setPointerCapture(e.pointerId);
  });
  stageEl.addEventListener('pointermove', e=>{
    if (!drag) return;
    view.tx = drag.tx + (e.clientX-drag.x); view.ty = drag.ty + (e.clientY-drag.y);
    applyView();
  });
  stageEl.addEventListener('pointerup', ()=>{ drag=null; });
  let pinch = null;
  stageEl.addEventListener('touchstart', e=>{
    if (e.touches.length===2){ const [a,b]=e.touches; pinch = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }
  }, {passive:true});
  stageEl.addEventListener('touchmove', e=>{
    if (e.touches.length===2 && pinch){
      const [a,b]=e.touches; const d = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
      const r = stageEl.getBoundingClientRect();
      zoomAt(d/pinch, (a.clientX+b.clientX)/2-r.left, (a.clientY+b.clientY)/2-r.top);
      pinch = d; e.preventDefault();
    }
  }, {passive:false});
  stageEl.addEventListener('touchend', ()=>{ pinch=null; });
  document.querySelectorAll('.st-zoom button').forEach(b=>b.addEventListener('click',()=>{
    const r = stageEl.getBoundingClientRect();
    if (b.dataset.z==='in') zoomAt(1.25, r.width/2, r.height/2);
    if (b.dataset.z==='out') zoomAt(0.8, r.width/2, r.height/2);
    if (b.dataset.z==='reset') resetZoom();
  }));
})();

// ---- global keys, breakpoint, routing ----
document.addEventListener('keydown',e=>{
  if (e.key==='Escape'){
    if (!searchResults.hidden) { searchResults.hidden = true; return; }
    if (selectedId) { selectSkill(null); return; }
    if (currentModule) closeModule();
  }
});
if (mq.addEventListener) mq.addEventListener('change',()=>{ if(currentModule){ resetZoom(); renderModule(); } });
window.addEventListener('hashchange', applyRoute);

// screenshot / deep-link hooks: ?tree=<module>&select=<skill.id>&owner=1&search=<q>
const qp = new URLSearchParams(location.search);
if (qp.get('owner')==='1' && !state.ownerMode){ state.ownerMode = true; repo.save(); }
if (qp.get('tree')) location.hash = '#/toolkit/' + qp.get('tree') + (qp.get('select') ? '?select='+encodeURIComponent(qp.get('select')) : '');

// ---- init ----
computeStatuses();
applyRoute();
if (qp.get('search')){ searchInput.value = qp.get('search'); renderSearch(qp.get('search')); }
})();
