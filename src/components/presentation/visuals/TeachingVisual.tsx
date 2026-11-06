import { Check } from 'lucide-react';

const steps = [
  'Look at every item, one at a time',
  'Keep the ones that match',
  'Repeat the same check inside each group',
];

export default function TeachingVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2.5 bg-white p-4 sm:gap-4 sm:p-6">
      {/* the concept */}
      <div className="w-[42%] rounded-xl border border-coolgray bg-porcelain p-3">
        <p className="font-mono text-[8px] uppercase tracking-wider text-ink-faint">the concept</p>
        <pre className="mt-2 overflow-hidden font-mono text-[8.5px] leading-[1.5] text-ink/75 sm:text-[10px]">
{`def find(v):
  if match(v):
    yield v
  for c in v.values():
    yield from find(c)`}
        </pre>
        <p className="mt-2 font-mono text-[8px] text-ink-faint">recursion — as written</p>
      </div>

      {/* transfer */}
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <div className="sc-tc-beam h-0.5 w-4 rounded bg-ink/40 sm:w-6" />
        <div className="relative flex h-11 w-11 items-center justify-center">
          <svg aria-hidden="true" className="sc-tc-ring absolute inset-0 h-full w-full" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="none" stroke="#24364B" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 6" />
          </svg>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink font-mono text-[9px] font-semibold text-porcelain">
            →
          </span>
        </div>
        <div className="sc-tc-beam h-0.5 w-4 rounded bg-ink/40 sm:w-6" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* the lesson */}
      <div className="flex-1 rounded-xl border border-ink/20 bg-white p-3">
        <p className="font-mono text-[8px] uppercase tracking-wider text-ink-faint">the lesson</p>
        <ol className="mt-2 space-y-2">
          {steps.map((s, i) => (
            <li key={s} className="sc-tc-step flex items-start gap-1.5" style={{ animationDelay: `${0.8 + i * 1.4}s` }}>
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-mist">
                <Check size={9} className="text-ink" strokeWidth={3} />
              </span>
              <span className="text-[9.5px] font-medium leading-snug text-ink sm:text-[11px]">{s}</span>
            </li>
          ))}
        </ol>
        <p className="sc-tc-step mt-2.5 font-mono text-[8px] text-ink-mute" style={{ animationDelay: '5.4s' }}>
          recursion — in plain words
        </p>
      </div>
    </div>
  );
}
