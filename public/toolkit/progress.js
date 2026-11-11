// ===== SKILL TREE PROGRESS REPOSITORY =====
// Part of the independent Toolkit module. Owns user progress persistence.
// localStorage v1 today; the repo object is the single seam a backend (sync/accounts)
// can implement later without touching the engine or the data files.
window.ToolkitProgress = (function(){
'use strict';
// ---- central progression config (XP rewards, level thresholds) ----
const CONFIG = {
  storageKey: 'justin.skilltree.progress.v1',
  levelThresholds: [0, 100, 250, 500, 900, 1400, 2000, 2700, 3500], // XP needed for LVL n (index)
  zoomMin: 0.5, zoomMax: 2.5
};
const STATUS_LABEL = {locked:'○ LOCKED', available:'◎ AVAILABLE', in_progress:'◐ IN PROGRESS', verified:'✓ VERIFIED'};

// ---- progress repository (localStorage v1; interface ready for a backend later) ----
// record per skill: { status: 'in_progress'|'verified'|null, percent, notes, evidence: [{title,url}], startedAt, verifiedAt }
const repo = {
  load(){
    try {
      const r = JSON.parse(localStorage.getItem(CONFIG.storageKey));
      if (r && r.v === 1 && r.skills && typeof r.skills === 'object' && !Array.isArray(r.skills)) return r;
    } catch(e){}
    return { v:1, ownerMode:false, skills:{} };
  },
  save(){ try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch(e){} },
  skill(id){ return state.skills[id] || null; },
  patch(id, patch){
    const cur = state.skills[id] || { status:null, percent:0, notes:'', evidence:[] };
    state.skills[id] = Object.assign(cur, patch);
    const p = state.skills[id];
    if (!p.status && !p.percent && !p.notes && !(p.evidence&&p.evidence.length)) delete state.skills[id];
    repo.save();
  },
  reset(id){ delete state.skills[id]; repo.save(); }
};
let state = repo.load();
return { CONFIG: CONFIG, STATUS_LABEL: STATUS_LABEL, repo: repo, get state(){ return state; } };
})();
