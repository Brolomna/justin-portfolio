import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';

const fileNames: Record<string, string> = {
  'AI Workflow Assistant': 'tasks.py',
  'Data Extractor': 'extract.py',
  'Chill Corner Bot': 'bot.py',
};

const codeHues = [
  ['bg-ink/60', 'bg-sky-700/50', 'bg-ink/30'],
  ['bg-ink/40', 'bg-emerald-700/50', 'bg-ink/60'],
  ['bg-ink/60', 'bg-amber-600/50', 'bg-ink/30'],
];

function CodeThumb({ title, seed }: { title: string; seed: number }) {
  const hues = codeHues[seed % codeHues.length];
  return (
    <div className="h-20 w-full border-b border-coolgray bg-porcelain px-2.5 pt-2.5 font-mono sm:h-24">
      <p className="text-[8px] text-ink-faint">{fileNames[title]}</p>
      <div className="mt-2 space-y-1.5">
        <div className={`h-1 w-4/5 rounded ${hues[0]}`} />
        <div className={`ml-2 h-1 w-3/5 rounded ${hues[1]}`} />
        <div className={`ml-2 h-1 w-2/3 rounded ${hues[2]}`} />
      </div>
    </div>
  );
}

export default function ProjectsVisual() {
  return (
    <div className="grid h-full w-full grid-cols-2 content-center gap-2.5 bg-white p-3.5 sm:gap-3 sm:p-5">
      {portfolio.projects.map((p, i) => (
        <a
          key={p.title}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${p.title} on GitHub`}
          className="sc-pj-card group relative overflow-hidden rounded-xl border border-coolgray bg-white"
          style={{ animationDelay: `${i * 3.5}s` }}
        >
          {p.title === 'Moonfall' ? (
            <div className="relative h-20 w-full overflow-hidden border-b border-coolgray sm:h-24">
              <img
                src="moonfall-splash.webp"
                alt="Moonfall game artwork"
                className="h-full w-full object-cover object-[center_42%]"
                loading="lazy"
              />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/90 px-1.5 py-0.5 font-mono text-[7px] font-semibold uppercase tracking-wide text-porcelain">
                flagship
              </span>
            </div>
          ) : (
            <CodeThumb title={p.title} seed={i} />
          )}
          <div className="flex items-center justify-between gap-1 px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold leading-tight text-ink">{p.title}</p>
              <p className="mt-0.5 truncate font-mono text-[8px] text-ink-mute">{p.tags[0]}</p>
            </div>
            <ArrowUpRight
              size={12}
              className="shrink-0 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </a>
      ))}
    </div>
  );
}
