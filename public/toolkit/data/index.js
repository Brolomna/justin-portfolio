// Toolkit curriculum index: assembles the per-module files into the global CURRICULUM
// the engine reads. Load after all per-module files, before progress.js and engine.js.
const CURRICULUM = ['recon','web','identity','network','vuln','linux','privacy','automation']
  .map(function(k){ return window.TOOLKIT_DATA[k]; });
