// Toolkit mount: replaces <div id="toolkit-mount"></div> with the toolkit section markup.
// Load after the mount div and the data files, before progress.js and engine.js.
(function(){
  var m = document.getElementById('toolkit-mount');
  if (!m) return;
  m.outerHTML = `<section class="toolkit-section" id="skills">
  <div class="toolkit-heading" id="toolkitHeading">
    <div class="toolkit-kicker">// FIELD NOTES &amp; WORKBENCH</div>
    <h2>CHOOSE YOUR <span>LOADOUT</span></h2>
    <p>The honest map of what I'm learning in security: 8 modules, 107 skills. Green means demonstrated with evidence, cyan means learning, grey means not yet unlocked. Still early, one lab at a time.</p>
    <div class="st-search">
      <input id="stSearchInput" type="search" autocomplete="off" placeholder='Search all 107 skills - try "nmap", "grep", "burp"...' aria-label="Search skills across all modules">
      <div class="st-search-results" id="stSearchResults" hidden></div>
    </div>
  </div>
  <div class="loadout-grid" id="loadout"></div>
  <noscript><p class="loadout-note">The interactive skill tree needs JavaScript. The eight modules: Reconnaissance &amp; Enumeration, Web Application &amp; API Security, Identity &amp; Authentication Security, Network Analysis, Vulnerability Assessment, Linux &amp; Systems Administration, Privacy &amp; Secure Operations, Automation &amp; Security Engineering.</p></noscript>
  <p class="loadout-note" id="loadoutNote"></p>
  <div class="skilltree-takeover" id="skilltree" hidden>
    <div class="st-head" id="stHead"></div>
    <h2 class="st-title" id="treeTitle"></h2>
    <div class="st-filters" id="stFilters"></div>
    <div class="st-stage" id="stStage">
      <div class="st-world" id="stWorld">
        <svg id="stSvg" aria-hidden="true"></svg>
        <div id="stNodes"></div>
      </div>
      <div class="st-zoom" role="group" aria-label="Zoom controls">
        <button data-z="in" type="button" aria-label="Zoom in">+</button>
        <button data-z="out" type="button" aria-label="Zoom out">−</button>
        <button data-z="reset" type="button" aria-label="Reset zoom">⟲</button>
      </div>
      <div class="st-panel" id="stPanel" hidden></div>
      <div id="stTip" role="tooltip"></div>
    </div>
    <p class="st-note" id="stTreeNote"></p>
  </div>
</section>`;
})();
