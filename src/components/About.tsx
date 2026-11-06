import { GraduationCap, MessageSquareText } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';
import profilePhoto from '@/assets/profile.jpg';

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="about" className="relative py-20 sm:py-28 scroll-mt-16 bg-mist/50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'is-visible' : ''}`}
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
            About
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Hi, I'm Justin
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:gap-16 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <div className="relative max-w-xs">
              <img
                src={profilePhoto}
                alt="Portrait of Justin"
                className="relative w-full aspect-[4/5] object-cover rounded-3xl border border-coolgray shadow-card-lg"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="text-lg leading-relaxed text-ink-soft text-pretty">
              {portfolio.about.paragraph}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-coolgray bg-white p-5 shadow-card">
                <div className="flex items-center gap-2.5 text-ink">
                  <GraduationCap size={20} />
                  <span className="font-semibold text-sm">Teaching background</span>
                </div>
                <p className="mt-2 text-sm text-ink-mute leading-relaxed">
                  Computer instructor, then English teacher — which means clear
                  explanations and patient collaboration.
                </p>
              </div>
              <div className="rounded-2xl border border-coolgray bg-white p-5 shadow-card">
                <div className="flex items-center gap-2.5 text-ink">
                  <MessageSquareText size={20} />
                  <span className="font-semibold text-sm">Easy to work with</span>
                </div>
                <p className="mt-2 text-sm text-ink-mute leading-relaxed">
                  Plain-language communication throughout the project — no jargon,
                  no surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
