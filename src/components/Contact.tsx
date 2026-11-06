import { ArrowUpRight, Github, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';

export default function Contact() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { contact } = portfolio;
  return (
    <section id="contact" className="relative py-20 sm:py-28 scroll-mt-16 bg-porcelain">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          ref={ref}
          className={`reveal relative overflow-hidden rounded-3xl border border-coolgray bg-white px-7 py-14 sm:px-14 sm:py-16 text-center shadow-card-lg ${
            visible ? 'is-visible' : ''
          }`}
        >
          <div className="relative">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
              Let's work together
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink text-balance">
              Have a project in mind?
            </h2>
            <p className="mt-5 text-lg text-ink-mute max-w-xl mx-auto text-pretty">
              Tell me what you're building. I'll help you ship it fast — with
              AI-assisted development and testing.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-porcelain rounded-full bg-ink hover:bg-ink-soft transition-colors"
              >
                <Mail size={18} />
                Email
                <ArrowUpRight
                  size={16}
                  className="text-porcelain/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-ink rounded-full border border-ink/20 bg-white hover:border-ink/40 transition-colors"
              >
                <Github size={18} />
                GitHub
                <ArrowUpRight
                  size={16}
                  className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
