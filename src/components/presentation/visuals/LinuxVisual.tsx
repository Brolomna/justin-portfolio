const procs = [
  { name: 'moonfall-api', cpu: '42%', delay: '0s' },
  { name: 'postgres', cpu: '18%', delay: '0.8s' },
  { name: 'vite dev', cpu: '9%', delay: '1.6s' },
];

export default function LinuxVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md sm:max-w-lg">
        {/* free-floating session chips around the terminal */}
        <span
          aria-hidden="true"
          className="sc-float absolute -top-4 right-6 z-10 rounded-full border border-coolgray bg-white/90 px-2.5 py-1 font-mono text-[10px] text-ink-mute shadow-sm"
        >
          git: main
        </span>
        <span
          aria-hidden="true"
          className="sc-float absolute -bottom-4 left-6 z-10 rounded-full border border-coolgray bg-white/90 px-2.5 py-1 font-mono text-[10px] text-ink-mute shadow-sm"
          style={{ animationDelay: '1.4s' }}
        >
          tmux · 3 panes
        </span>

        <div className="w-full -rotate-1 overflow-hidden rounded-xl bg-ink font-mono text-[10px] leading-relaxed text-porcelain/85 shadow-card-lg sm:text-xs">
          {/* title bar */}
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-porcelain/25" />
            <span className="h-2 w-2 rounded-full bg-porcelain/25" />
            <span className="h-2 w-2 rounded-full bg-porcelain/25" />
            <span className="ml-2 text-[9px] text-porcelain/40">justin@dev: ~</span>
          </div>

          <div className="space-y-1.5 px-3.5 py-3">
            <p className="sc-lx-line" style={{ animationDelay: '0.2s' }}>
              <span className="text-emerald-300">$ </span>
              <span className="sc-lx-type" style={{ animationDelay: '0.4s' }}>systemctl status portfolio.service</span>
            </p>
            <p className="sc-lx-line text-emerald-300/90" style={{ animationDelay: '2.4s' }}>
              ● portfolio.service — active (running)
            </p>
            <p className="sc-lx-line" style={{ animationDelay: '3.4s' }}>
              <span className="text-emerald-300">$ </span>htop --sort-key=PERCENT_CPU
            </p>

            <div className="sc-lx-line space-y-1" style={{ animationDelay: '4s' }}>
              {procs.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="w-24 truncate text-porcelain/55">{p.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded bg-white/10">
                    <span className="sc-lx-proc block h-full rounded bg-sky-300/70" style={{ animationDelay: p.delay }} />
                  </span>
                  <span className="w-8 text-right text-porcelain/55">{p.cpu}</span>
                </div>
              ))}
            </div>

            <p className="sc-lx-line" style={{ animationDelay: '5.6s' }}>
              <span className="text-emerald-300">$ </span>tree -L 1 ~/projects
            </p>
            <div className="sc-lx-line text-porcelain/65" style={{ animationDelay: '6.2s' }}>
              <p>├── moonfall</p>
              <p>├── ai-workflow-assistant</p>
              <p>└── data_extractor</p>
            </div>

            <div className="sc-lx-line flex items-center gap-3 border-t border-white/10 pt-2 text-[9px] text-porcelain/45" style={{ animationDelay: '7.2s' }}>
              <span className="flex items-center gap-1.5">
                CPU
                <span className="inline-block h-1.5 w-14 overflow-hidden rounded bg-white/10">
                  <span className="sc-lx-cpu block h-full rounded bg-emerald-300/80" />
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                MEM
                <span className="inline-block h-1.5 w-14 overflow-hidden rounded bg-white/10">
                  <span className="sc-lx-mem block h-full rounded bg-amber-200/80" />
                </span>
              </span>
              <span>up 12d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
