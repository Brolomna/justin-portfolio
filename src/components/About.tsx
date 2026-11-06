import { GraduationCap, MessageSquareText } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';
import profilePhoto from '@/assets/profile.jpg';

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="about" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          ref={ref}
          className={`reveal ${visible ? 'is-visible' : ''}`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            About
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Hi, I'm Justin
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:gap-16 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <div className="relative max-w-xs">
              <div className="absolute -inset-3 rounded-[2rem] bg-violet-600/20 blur-2xl" />
              <img
                src={profilePhoto}
                alt="Portrait of Justin"
                className="relative w-full aspect-[4/5] object-cover rounded-3xl ring-1 ring-violet-400/25 shadow-glow"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="text-lg leading-relaxed text-stone-300 text-pretty">
              {portfolio.about.paragraph}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl glass p-5">
                <div className="flex items-center gap-2.5 text-violet-300">
                  <GraduationCap size={20} />
                  <span className="font-semibold text-sm">Teaching background</span>
                </div>
                <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                  Computer instructor, then English teacher — which means clear
                  explanations and patient collaboration.
                </p>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="flex items-center gap-2.5 text-violet-300">
                  <MessageSquareText size={20} />
                  <span className="font-semibold text-sm">Easy to work with</span>
                </div>
                <p className="mt-2 text-sm text-stone-400 leading-relaxed">
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
