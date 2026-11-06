import { ArrowRight, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { scenes } from '@/data/scenes';
import type { SceneId } from '@/data/scenes';
import { usePresentation } from '@/hooks/usePresentation';
import SceneVisual from '@/components/presentation/SceneVisual';

const textFx: Record<SceneId, string> = {
  identity: 'pp-text',
  python: 'pp-text-slide',
  ai: 'pp-text-blur',
  linux: 'pp-text-type',
  security: 'pp-text-wipe',
  webdev: 'pp-text-assemble',
  projects: 'pp-text-pop',
  teaching: 'pp-text-steps',
  closing: 'pp-text-expand',
};

export default function Presentation() {
  const p = usePresentation(scenes);
  const { scene, index, count } = p;
  const { hero } = portfolio;
  const TitleTag = scene.id === 'identity' ? 'h1' : 'h2';

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Introductory presentation about Justin"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          p.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          p.next();
        }
      }}
      className="relative overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-20 outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    >
      {/* static backdrop band */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-mist/70 via-porcelain to-porcelain" />
      <div className="absolute inset-x-0 top-0 h-px bg-coolgray" />

      {/* continuous background animation — one persistent layer, never remounts
          between scenes, so it runs constantly across all nine scenes */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sc-bg-blob-a absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#BED7F7] blur-3xl" />
        <div className="sc-bg-blob-b absolute -right-28 top-1/3 h-[22rem] w-[22rem] rounded-full bg-[#D5CDF0] blur-3xl" />
        <div className="sc-bg-blob-c absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#C3E0F4] blur-3xl" />
        <span className="sc-bg-dot absolute left-[12%] top-[22%] h-1.5 w-1.5 rounded-full bg-ink/25" />
        <span className="sc-bg-dot absolute right-[16%] top-[16%] h-2 w-2 rounded-full bg-ink/20" style={{ animationDelay: '2.2s' }} />
        <span className="sc-bg-dot absolute left-[38%] bottom-[14%] h-1.5 w-1.5 rounded-full bg-ink/25" style={{ animationDelay: '4.1s' }} />
        <span className="sc-bg-dot absolute right-[30%] bottom-[26%] h-1 w-1 rounded-full bg-ink/30" style={{ animationDelay: '1.3s' }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.15fr] lg:gap-12">
          {/* Text panel — always synchronized with the active scene */}
          <div className="min-w-0 max-w-xl">
            <div key={`k-${scene.id}`} className={textFx[scene.id]}>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-coolgray bg-white px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wide text-ink-mute">
                <span className="text-ink">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="text-ink-faint">
                  / {String(count).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="h-3 w-px bg-coolgray" />
                <span className="uppercase">{scene.kicker}</span>
              </p>
            </div>

            <div key={`t-${scene.id}`} className={textFx[scene.id]} style={{ animationDelay: '0.06s' }}>
              <TitleTag className="mt-5 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.12] tracking-tight text-ink text-balance">
                {scene.title}
              </TitleTag>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-ink-mute text-pretty">
                {scene.body}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={hero.primaryCta.target}
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm sm:text-base font-semibold text-porcelain transition-colors hover:bg-ink-soft"
              >
                {hero.primaryCta.label}
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <a
                href={hero.secondaryCta.target}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-6 py-3 text-sm sm:text-base font-semibold text-ink transition-colors hover:border-ink/40"
              >
                <Mail size={17} />
                {hero.secondaryCta.label}
              </a>
            </div>
          </div>

          {/* Visual panel */}
          <div
            className="relative h-[19rem] w-full min-w-0 sm:h-[25rem] lg:h-[28rem]"
          >
            <div key={scene.id} className="pp-scene h-full w-full">
              <SceneVisual id={scene.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
