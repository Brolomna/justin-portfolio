export default function WebDevVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rotate-1">
        <div className="sc-wd-viewport mx-auto overflow-hidden rounded-xl border border-ink/15 bg-white shadow-card-lg">
          {/* browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-coolgray bg-porcelain px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-ink/15" />
            <span className="h-2 w-2 rounded-full bg-ink/15" />
            <span className="h-2 w-2 rounded-full bg-ink/15" />
            <span className="ml-2 flex-1 truncate rounded-full bg-coolgray px-2.5 py-0.5 font-mono text-[8px] text-ink-mute">
              localhost:5173
            </span>
          </div>

          {/* page under construction */}
          <div className="sc-wd-paint space-y-2 p-2.5">
            <div className="sc-wd-in flex items-center justify-between" style={{ animationDelay: '0.2s' }}>
              <span className="h-2.5 w-10 rounded bg-ink/80" />
              <span className="flex gap-1.5">
                <span className="h-1.5 w-6 rounded bg-ink/25" />
                <span className="h-1.5 w-6 rounded bg-ink/25" />
                <span className="h-1.5 w-6 rounded bg-ink/25" />
              </span>
            </div>

            <div className="sc-wd-in rounded-lg bg-mist px-3 py-2.5" style={{ animationDelay: '0.9s' }}>
              <div className="h-2 w-2/3 rounded bg-ink/70" />
              <div className="mt-1.5 h-1.5 w-1/2 rounded bg-ink/30" />
              <div className="mt-2 h-3.5 w-14 rounded-full bg-ink" />
            </div>

            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="sc-wd-card rounded-lg border border-coolgray p-2"
                  style={{ animationDelay: `${1.5 + i * 0.18}s, ${1.5 + i * 0.18}s` }}
                >
                  <div className="h-7 rounded bg-gradient-to-br from-mist to-coolgray" />
                  <div className="mt-1.5 h-1.5 w-3/4 rounded bg-ink/25" />
                  <div className="mt-1 h-1.5 w-1/2 rounded bg-ink/15" />
                </div>
              ))}
            </div>

            <div className="sc-wd-in h-4 rounded bg-coolgray" style={{ animationDelay: '2.1s' }} />
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[9px] text-ink-faint">
          components mount → styles apply → layout responds
        </p>
      </div>
    </div>
  );
}
