import { ArrowUpRight, Github, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';

export default function ClosingVisual() {
  const { contact } = portfolio;
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* radar rings spreading through the open space */}
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="sc-cl-radar absolute left-1/2 top-1/2 -ml-36 -mt-36 h-72 w-72 rounded-full border border-ink/15"
            style={{ animationDelay: `${i * 1.2}s` }}
          />
        ))}
      </div>

      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {String(9).padStart(2, '0')} · closing
        </p>
        <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Let's build something useful.
        </p>
        <div className="sc-cl-underline mx-auto mt-2.5 h-[3px] w-40 rounded-full bg-ink sm:w-52" />

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={`mailto:${contact.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-porcelain transition-colors hover:bg-ink-soft"
          >
            <Mail size={15} />
            {contact.email}
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
          >
            <Github size={15} />
            GitHub
            <ArrowUpRight size={14} className="text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-ink-mute">
          <span className="sc-pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
          Available for remote work
        </p>
      </div>
    </div>
  );
}
