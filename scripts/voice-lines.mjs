// Prints every narration line of Terminal Academy as JSON: { "<clip key>": "<text>" }.
// The clip keys here are the same ones ui/voice.js plays. Used by build-voice.py.
//   node scripts/voice-lines.mjs > /tmp/voice-lines.json
import { missions } from '../public/interactive-learning/js/lessons/missions.js';
import { voiceKey } from '../public/interactive-learning/js/ui/voice.js';

const lines = {};
for (const m of missions) {
  if (m.say) lines[voiceKey(m, 'brief')] = m.say;
  for (const s of m.steps || []) {
    lines[voiceKey(m, s.id)] = s.say;
    lines[voiceKey(m, s.id, 'done')] = s.sayDone;
  }
  if (m.finale?.say) lines[voiceKey(m, 'finale')] = m.finale.say;
  if (m.successSay) lines[voiceKey(m, 'success')] = m.successSay;
  (m.partSay || []).forEach((t, i) => { lines[voiceKey(m, `part${i + 1}`)] = t; });
}
for (const [k, v] of Object.entries(lines)) if (!v) throw new Error(`missing narration for ${k}`);
process.stdout.write(JSON.stringify(lines, null, 2));
