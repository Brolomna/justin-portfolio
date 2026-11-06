import { ArrowRight, Mail, Code2, Terminal, Globe } from 'lucide-react';
import { portfolio } from '@/data/portfolio';

export default function Hero() {
  const { hero } = portfolio;
  const headlineWords = hero.headline.split(' ');
  const lastWord = headlineWords.pop();
  const headlineStart = headlineWords.join(' ');

  return (
    <section id="top" className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      {/* Glow blooms */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-10 -left-32 w-[34rem] h-[34rem] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute top-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-violet-500/15 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: text */}
          <div className="max-w-xl">
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-sm font-medium text-stone-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Available for freelance work
            </div>

            <h1
              className="animate-fade-up mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance"
              style={{ animationDelay: '0.05s' }}
            >
              {headlineStart}{' '}
              <span className="gradient-text">{lastWord}</span>
            </h1>

            <p
              className="animate-fade-up mt-6 text-lg text-stone-400 leading-relaxed max-w-xl text-pretty"
              style={{ animationDelay: '0.12s' }}
            >
              {hero.subline}
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '0.2s' }}
            >
              <a
                href={hero.primaryCta.target}
                className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-full transition-all shadow-glow hover:shadow-glow-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400"
              >
                {hero.primaryCta.label}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={hero.secondaryCta.target}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-stone-100 rounded-full glass hover:bg-white/10 transition-all"
              >
                <Mail size={18} className="text-violet-400" />
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>

          {/* Right: cutout portrait + floating panels + orbital ring */}
          <div className="relative flex justify-center lg:justify-end min-h-[23rem] sm:min-h-[31rem]">
            {/* Orbital ring behind portrait */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] hidden sm:block pointer-events-none">
              <div className="absolute inset-0 rounded-full border border-violet-500/15 animate-spin-slow" />
              <div className="absolute inset-8 rounded-full border border-violet-400/10" />
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-glow-sm" />
              </div>
            </div>

            {/* Soft radial glow behind Justin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[26rem] sm:h-[26rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45)_0%,rgba(124,58,237,0.18)_40%,transparent_72%)] blur-xl animate-pulse-glow" />

            {/* Transparent portrait rises from the scene */}
            <div className="relative z-10 flex items-end justify-center w-full">
              <img
                src="justin-cutout.png"
                alt="Portrait of Justin"
                className="relative w-[17rem] sm:w-[24rem] lg:w-[27rem] max-w-none -mb-8 sm:-mb-14 drop-shadow-[0_0_28px_rgba(139,92,246,0.28)]"
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to bottom, black 72%, rgba(0,0,0,0.55) 88%, transparent 99%)',
                  maskImage:
                    'linear-gradient(to bottom, black 72%, rgba(0,0,0,0.55) 88%, transparent 99%)',
                }}
              />
            </div>

            {/* Floating glass panels overlap the portrait */}
            <div className="hidden sm:flex absolute top-12 left-0 lg:left-4 animate-float-slow z-20">
              <div className="glass rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-glow-sm">
                <Code2 size={18} className="text-violet-400" />
                <span className="text-xs font-medium text-stone-200">TypeScript</span>
              </div>
            </div>
            <div className="hidden sm:flex absolute bottom-24 right-0 lg:right-0 animate-float-med z-20" style={{ animationDelay: '1s' }}>
              <div className="glass rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-glow-sm">
                <Terminal size={18} className="text-violet-400" />
                <span className="text-xs font-medium text-stone-200">$ deploy</span>
              </div>
            </div>
            <div className="hidden sm:flex absolute bottom-4 left-10 lg:left-16 animate-float-fast z-20" style={{ animationDelay: '2s' }}>
              <div className="glass rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-glow-sm">
                <Globe size={18} className="text-violet-400" />
                <span className="text-xs font-medium text-stone-200">Web</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
