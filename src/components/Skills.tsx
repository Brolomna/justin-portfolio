import {
  Code2,
  Component,
  FileCode2,
  GitBranch,
  Globe,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Sparkles,
  Code2,
  Component,
  FileCode2,
  Terminal,
  GitBranch,
};

function SkillChip({ name, icon, index }: { name: string; icon: string; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Icon = iconMap[icon] ?? Sparkles;
  return (
    <div
      ref={ref}
      className={`reveal group inline-flex items-center gap-2.5 rounded-full glass px-5 py-3 hover:border-violet-400/30 transition-all duration-300 ${
        visible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <Icon size={18} className="text-violet-400 group-hover:text-violet-300 transition-colors" />
      <span className="text-sm font-medium text-stone-200">{name}</span>
    </div>
  );
}

export default function Skills() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="skills" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div ref={ref} className={`reveal max-w-2xl ${visible ? 'is-visible' : ''}`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Capabilities
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Skills & tools
          </h2>
          <p className="mt-4 text-lg text-stone-400">
            From front-end interfaces to back-end automation, here's what I use
            to bring products to life.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          {portfolio.skills.map((s, i) => (
            <SkillChip key={s.name} name={s.name} icon={s.icon} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
