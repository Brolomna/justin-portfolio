import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pause,
  Play,
} from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { scenes } from '@/data/scenes';
import { usePresentation } from '@/hooks/usePresentation';
import SceneVisual from '@/components/presentation/SceneVisual';

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
        } else if (e.key === ' ') {
          e.preventDefault();
          p.togglePlay();
        }
      }}
      onMouseEnter={() => p.setInteracting(true)}
      onMouseLeave={() => p.setInteracting(false)}
      onFocusCapture={() => p.setInteracting(true)}
      onBlurCapture={() => p.setInteracting(false)}
      className={`relative overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-20 outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
        p.playing ? '' : 'pp-paused'
      }`}
    >
      {/* static backdrop band */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-mist/70 via-porcelain to-porcelain" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-coolgray" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Text panel — always synchronized with the active scene */}
          <div className="max-w-xl">
            <div key={`k-${scene.id}`} className="pp-text">
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

            <div key={`t-${scene.id}`} className="pp-text" style={{ animationDelay: '0.06s' }}>
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

            {/* Controls */}
            <div className="mt-9">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={p.prev}
                  aria-label="Previous scene"
                  className="rounded-full border border-coolgray bg-white p-2 text-ink-mute transition-colors hover:text-ink hover:border-ink/30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={p.togglePlay}
                  aria-label={p.playing ? 'Pause the presentation' : 'Play the presentation'}
                  aria-pressed={p.playing}
                  className="rounded-full border border-coolgray bg-white p-2 text-ink-mute transition-colors hover:text-ink hover:border-ink/30"
                >
                  {p.playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  type="button"
                  onClick={p.next}
                  aria-label="Next scene"
                  className="rounded-full border border-coolgray bg-white p-2 text-ink-mute transition-colors hover:text-ink hover:border-ink/30"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="ml-2 flex items-center gap-1.5" role="tablist" aria-label="Scenes">
                  {scenes.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Scene ${i + 1}: ${s.kicker}`}
                      onClick={() => p.goTo(i)}
                      className="group relative flex h-6 items-center px-0.5"
                    >
                      <span
                        className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                          i === index ? 'w-10 bg-coolgray' : 'w-3.5 bg-coolgray group-hover:bg-ink-faint'
                        }`}
                      >
                        {i === index && p.autoActive && (
                          <span
                            key={`bar-${index}`}
                            className="absolute inset-y-0 left-0 bg-ink"
                            style={{ animation: `pp-progress ${scene.duration}s linear forwards` }}
                          />
                        )}
                        {i === index && !p.autoActive && (
                          <span className="absolute inset-y-0 left-0 w-1/3 bg-ink" />
                        )}
                        {i < index && <span className="absolute inset-0 bg-ink/50" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 hidden sm:flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                <span>{scene.nav}</span>
                <span aria-hidden="true">·</span>
                <span>{p.reducedMotion ? 'manual mode (reduced motion)' : p.playing ? 'auto-playing' : 'paused'}</span>
              </div>
            </div>
          </div>

          {/* Visual panel */}
          <div
            className="relative h-[19rem] sm:h-[24rem] lg:h-[26rem] overflow-hidden rounded-3xl border border-coolgray bg-white shadow-card"
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
