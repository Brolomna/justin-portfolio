// The narrator: plays pre-recorded clips (audio/<key>.mp3, made by
// scripts/build-voice.py with the Kokoro "af_nicole" voice). On by default; the
// learner's on/off choice is remembered in this browser only.

const STORE = 'ta-voice';

/** Clip name for a mission line, e.g. exploring-pwd, exploring-pwd-done, vault-brief. */
export function voiceKey(mission, part, suffix = '') {
  return [mission.id, part, suffix].filter(Boolean).join('-');
}

export function createVoice({ base, version = '1', onChange } = {}) {
  let enabled = true;
  try { enabled = localStorage.getItem(STORE) !== 'off'; } catch { /* storage blocked: stay on */ }
  const audio = typeof Audio !== 'undefined' ? new Audio() : null;
  if (audio) audio.preload = 'auto';
  let current = null;

  function play(key) {
    if (!audio || !key) return;
    current = key;
    if (!enabled) return;
    audio.pause();
    audio.src = `${base}/${key}.mp3?v=${version}`;
    audio.currentTime = 0;
    // Browsers block sound until the visitor has clicked or typed; ignore that quietly.
    audio.play().catch(() => {});
  }

  function stop() { audio?.pause(); }

  function setEnabled(on) {
    enabled = on;
    try { localStorage.setItem(STORE, on ? 'on' : 'off'); } catch { /* ignore */ }
    if (!on) stop();
    onChange?.(on);
  }

  return {
    play,
    stop,
    /** Play the current line again (used when the voice is switched back on). */
    replay: () => play(current),
    toggle: () => { setEnabled(!enabled); if (enabled) play(current); return enabled; },
    get enabled() { return enabled; },
  };
}
