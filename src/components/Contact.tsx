import { ArrowUpRight, Github, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';

export default function Contact() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { contact } = portfolio;
  return (
    <section id="contact" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          ref={ref}
          className={`reveal relative overflow-hidden rounded-3xl glass-strong glow-border px-7 py-14 sm:px-14 sm:py-16 text-center shadow-glow ${
            visible ? 'is-visible' : ''
          }`}
        >
          <div className="absolute inset-0 -z-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-violet-600/20 blur-[100px]" />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-violet-500/15 blur-[100px]" />
          </div>

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Let's work together
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
              Have a project in mind?
            </h2>
            <p className="mt-5 text-lg text-stone-400 max-w-xl mx-auto text-pretty">
              Tell me what you're building. I'll help you ship it fast — with
              AI-assisted development and testing.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-full transition-all bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-glow"
              >
                <Mail size={18} />
                Email
                <ArrowUpRight
                  size={16}
                  className="text-violet-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-stone-100 rounded-full glass hover:bg-white/10 transition-all"
              >
                <Github size={18} />
                GitHub
                <ArrowUpRight
                  size={16}
                  className="text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
