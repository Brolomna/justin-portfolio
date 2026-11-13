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
const STATUS_LABEL = {locked:'○ LOCKED', available:'◎ AVAILABLE', in_progress:'◐ IN PROGRESS', verified:'✓ SELF-MARKED'};

// ---- baked-in starting state (Justin's own list, 2026-11-11) ----
// Shown to every visitor. No notes or evidence links are invented here - these
// records carry status only. Any owner-mode edit in localStorage overrides the
// seed for that skill, so Justin can keep updating his own copy normally.
const SEED = {
  verified: ["recon.scope","recon.subdomain","recon.host","recon.port","recon.service","recon.directory","web.http","web.request","web.proxy","web.cookies","web.authentic","web.access","web.input","web.injection","web.security","identity.offline","identity.credentia","identity.ssh","network.tcpip","network.packet","network.wireshark","network.display","network.http","vuln.vulnerabi","vuln.metasploi","vuln.linux","vuln.postexplo","vuln.remediati","linux.linux","linux.fs","linux.file","linux.inspect","linux.find","linux.grep","linux.pipe","linux.rwx","linux.sudo","linux.tar","privacy.privacy","privacy.tor","privacy.tails","automation.git","automation.github"],
  in_progress: ["linux.owner","linux.users","linux.ps","linux.kill","linux.systemd","linux.apt","linux.repo","linux.disk","linux.mount","linux.iface","linux.ip","linux.route","linux.http","linux.fw","linux.ssh","linux.bash","linux.py","privacy.proxy","privacy.vpn","automation.python","automation.bash"]
};

// ---- progress repository (localStorage v1; interface ready for a backend later) ----
// record per skill: { status: 'in_progress'|'verified'|null, percent, notes, evidence: [{title,url}], startedAt, verifiedAt }
const repo = {
  load(){
    let r = null;
    try {
      const p = JSON.parse(localStorage.getItem(CONFIG.storageKey));
      if (p && p.v === 1 && p.skills && typeof p.skills === 'object' && !Array.isArray(p.skills)) r = p;
    } catch(e){}
    if (!r) r = { v:1, ownerMode:false, skills:{} };
    // merge the baked-in starting state under any stored owner edits
    SEED.verified.forEach(id => { if (!r.skills[id]) r.skills[id] = { status:'verified', percent:100, notes:'', evidence:[] }; });
    SEED.in_progress.forEach(id => { if (!r.skills[id]) r.skills[id] = { status:'in_progress', percent:50, notes:'', evidence:[] }; });
    return r;
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
