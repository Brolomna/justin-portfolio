import type { ReactNode } from 'react';
import { ArrowUpRight, Github, Star } from 'lucide-react';
import { portfolio, type Project } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';

type CodeLine = { indent?: number; content: ReactNode };

const codeLines: Record<string, CodeLine[]> = {
  'AI Workflow Assistant': [
    { content: <><span className="text-ink/80">def</span> <span className="text-sky-700">run_task</span><span className="text-ink-mute">(client, task, text, demo=</span><span className="text-amber-700">False</span><span className="text-ink-mute">):</span></> },
    { indent: 1, content: <><span className="text-ink/80">if</span> <span className="text-ink-mute">task not in </span><span className="text-sky-700">TASKS</span><span className="text-ink-mute">:</span></> },
    { indent: 2, content: <><span className="text-ink/80">raise</span> <span className="text-amber-700">ValueError</span><span className="text-ink-mute">(</span><span className="text-emerald-700">&quot;Unsupported task: &quot;</span> <span className="text-ink-mute">+ task)</span></> },
    { indent: 1, content: <><span className="text-ink/80">if</span> <span className="text-ink-mute">demo:</span></> },
    { indent: 2, content: <><span className="text-ink/80">return</span> <span className="text-sky-700">run_demo</span><span className="text-ink-mute">(task, text)</span></> },
  ],
  'Data Extractor': [
    { content: <><span className="text-ink/80">def</span> <span className="text-sky-700">find_records</span><span className="text-ink-mute">(value: Any) -&gt; Iterable[dict[str, Any]]:</span></> },
    { indent: 1, content: <><span className="text-ink/80">if</span> <span className="text-ink-mute">isinstance(value, </span><span className="text-amber-700">dict</span><span className="text-ink-mute">):</span></> },
    { indent: 2, content: <><span className="text-ink/80">if</span> <span className="text-ink-mute">all(field in value </span><span className="text-ink/80">for</span><span className="text-ink-mute"> field in </span><span className="text-sky-700">FIELDS</span><span className="text-ink-mute">):</span></> },
    { indent: 3, content: <><span className="text-ink/80">yield</span> <span className="text-ink-mute">value</span></> },
    { indent: 2, content: <><span className="text-ink/80">for</span> <span className="text-ink-mute">child in value.values():</span></> },
    { indent: 3, content: <><span className="text-ink/80">yield from</span> <span className="text-sky-700">find_records</span><span className="text-ink-mute">(child)</span></> },
  ],
  'Chill Corner Bot': [
    { content: <><span className="text-ink/80">async def</span> <span className="text-sky-700">on_member_join</span><span className="text-ink-mute">(self, member):</span></> },
    { indent: 1, content: <><span className="text-ink-mute">self.new_members.append(member)</span></> },
    { content: <>&nbsp;</> },
    { content: <><span className="text-ink/80">async def</span> <span className="text-sky-700">join_wait</span><span className="text-ink-mute">(self):</span></> },
    { indent: 1, content: <><span className="text-ink-mute">await</span> <span className="text-ink-mute">self.bot.wait_until_ready()</span></> },
  ],
};

function CodeEditor({ project }: { project: Project }) {
  const lines = codeLines[project.title] ?? [];
  const fileName = project.title === 'AI Workflow Assistant'
    ? 'tasks.py'
    : project.title === 'Data Extractor'
      ? 'details_extractor.py'
      : 'raids.py';

  return (
    <div className="relative h-40 overflow-hidden bg-porcelain px-4 pt-3.5 font-mono text-[10px] leading-[1.55] sm:h-44 sm:text-[11px] border-b border-coolgray">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
        <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
        <span className="ml-2 rounded-t bg-coolgray px-2 py-0.5 text-[8px] text-ink-mute">{fileName}</span>
      </div>
      <div className="space-y-0.5 opacity-90">
        {lines.map((line, index) => (
          <div key={`${fileName}-${index}`} className="whitespace-nowrap">
            <span className="mr-2 inline-block w-3 text-right text-ink-faint">{index + 1}</span>
            <span style={{ paddingLeft: `${(line.indent ?? 0) * 12}px` }}>{line.content}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-porcelain via-transparent to-transparent" />
    </div>
  );
}

function MoonfallThumbnail() {
  return (
    <div className="group/thumb relative h-52 overflow-hidden bg-mist border-b border-coolgray sm:h-64">
      <img
        src="moonfall-splash.webp"
        alt="Moonfall game artwork"
        className="absolute inset-0 h-full w-full object-cover object-[center_42%] transition-opacity duration-500 group-hover/thumb:opacity-0"
        loading="lazy"
      />
      <img
        src="moonfall-end-wolves.webp"
        alt="Moonfall wolves artwork"
        className="absolute inset-0 h-full w-full object-cover object-[center_45%] opacity-0 transition-opacity duration-500 group-hover/thumb:opacity-100"
        loading="lazy"
      />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ink/90 text-porcelain text-xs font-semibold">
        <Star size={12} className="fill-porcelain" />
        Flagship
      </span>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal group relative flex flex-col rounded-2xl border border-coolgray bg-white overflow-hidden shadow-card hover:shadow-card-lg hover:border-ink/25 transition-all duration-300 ${
        visible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {project.title === 'Moonfall' ? <MoonfallThumbnail /> : <CodeEditor project={project} />}

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-ink">{project.title}</h3>
            <p className="mt-1 text-sm font-medium text-ink-mute">{project.tagline}</p>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="shrink-0 p-2 rounded-lg text-ink-mute hover:text-ink hover:bg-mist transition-colors"
          >
            <Github size={20} />
          </a>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-mute flex-1">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-md bg-mist border border-coolgray text-ink-soft text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-soft group/link"
        >
          View repository
          <ArrowUpRight size={15} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

export default function Projects() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="projects" className="relative py-20 sm:py-28 scroll-mt-16 bg-porcelain">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div ref={ref} className={`reveal max-w-2xl ${visible ? 'is-visible' : ''}`}>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">Selected work</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">Projects I've shipped</h2>
          <p className="mt-4 text-lg text-ink-mute">
            A mix of web apps, automation tools and community software — built fast and built well with AI-assisted workflows.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {portfolio.projects.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
