const tokens = ['the', 'quick', 'fox', 'runs', 'fast', 'now'];

export default function AIVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-3 sm:p-4">
      <div className="flex w-full max-w-md items-stretch gap-1.5 sm:gap-2">
        {/* input */}
        <div className="sc-ai-stage min-w-0 flex-1 rounded-xl border border-coolgray bg-porcelain p-2.5" style={{ animationDelay: '0s' }}>
          <p className="font-mono text-[8px] uppercase tracking-wider text-ink-faint">input</p>
          <div className="mt-2 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink/15" />
            <div className="h-1.5 w-4/5 rounded bg-ink/15" />
            <div className="h-1.5 w-3/5 rounded bg-ink/15" />
          </div>
          <p className="mt-2 truncate font-mono text-[8px] text-ink-mute">"summarise these notes"</p>
        </div>

        <span aria-hidden="true" className="self-center text-ink-faint">→</span>

        {/* tokens */}
        <div className="sc-ai-stage min-w-0 flex-1 rounded-xl border border-coolgray bg-porcelain p-2.5" style={{ animationDelay: '0.9s' }}>
          <p className="font-mono text-[8px] uppercase tracking-wider text-ink-faint">tokens</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {tokens.map((t, i) => (
              <span
                key={t}
                className="sc-ai-token rounded bg-mist px-1.5 py-0.5 font-mono text-[8px] text-ink-soft"
                style={{ animationDelay: `${1 + i * 0.22}s` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <span aria-hidden="true" className="self-center text-ink-faint">→</span>

        {/* model */}
        <div className="sc-ai-stage relative min-w-0 flex-1 overflow-hidden rounded-xl bg-ink p-2.5" style={{ animationDelay: '1.9s' }}>
          <p className="font-mono text-[8px] uppercase tracking-wider text-porcelain/50">model</p>
          <div className="mt-2 space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                <div
                  className="sc-ai-bar h-full rounded bg-porcelain/60"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.35}s` }}
                />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent sc-ai-sweep" />
          <p className="mt-2 font-mono text-[8px] text-porcelain/50">inference…</p>
        </div>

        <span aria-hidden="true" className="self-center text-ink-faint">→</span>

        {/* structured output */}
        <div className="sc-ai-stage min-w-0 flex-1 rounded-xl border border-ink/25 bg-white p-2.5" style={{ animationDelay: '4.3s' }}>
          <p className="font-mono text-[8px] uppercase tracking-wider text-ink-faint">output</p>
          <div className="mt-2 space-y-1.5 font-mono text-[8px]">
            <p className="text-ink-mute">{'{'}</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="ml-2 h-1.5 overflow-hidden rounded bg-ink/20">
                <div className="sc-ai-line h-full rounded bg-ink/60" style={{ animationDelay: `${4.6 + i * 0.5}s` }} />
              </div>
            ))}
            <p className="text-ink-mute">{'}'}</p>
          </div>
          <p className="mt-1.5 font-mono text-[8px] text-ink-mute">structured json</p>
        </div>
      </div>
    </div>
  );
}
