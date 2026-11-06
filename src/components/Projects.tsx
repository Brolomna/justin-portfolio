import type { ReactNode } from 'react';
import { ArrowUpRight, Github, Star } from 'lucide-react';
import { portfolio, type Project } from '@/data/portfolio';
import { useReveal } from '@/hooks/useReveal';

type CodeLine = { indent?: number; content: ReactNode };

const codeLines: Record<string, CodeLine[]> = {
  'AI Workflow Assistant': [
    { content: <><span className="text-violet-300">def</span> <span className="text-sky-300">run_task</span><span className="text-stone-300">(client, task, text, demo=</span><span className="text-amber-300">False</span><span className="text-stone-300">):</span></> },
    { indent: 1, content: <><span className="text-violet-300">if</span> <span className="text-stone-300">task not in </span><span className="text-sky-300">TASKS</span><span className="text-stone-300">:</span></> },
    { indent: 2, content: <><span className="text-violet-300">raise</span> <span className="text-amber-300">ValueError</span><span className="text-stone-300">(</span><span className="text-emerald-300">&quot;Unsupported task: &quot;</span> <span className="text-stone-300">+ task)</span></> },
    { indent: 1, content: <><span className="text-violet-300">if</span> <span className="text-stone-300">demo:</span></> },
    { indent: 2, content: <><span className="text-violet-300">return</span> <span className="text-sky-300">run_demo</span><span className="text-stone-300">(task, text)</span></> },
  ],
  'Data Extractor': [
    { content: <><span className="text-violet-300">def</span> <span className="text-sky-300">find_records</span><span className="text-stone-300">(value: Any) -&gt; Iterable[dict[str, Any]]:</span></> },
    { indent: 1, content: <><span className="text-violet-300">if</span> <span className="text-stone-300">isinstance(value, </span><span className="text-amber-300">dict</span><span className="text-stone-300">):</span></> },
    { indent: 2, content: <><span className="text-violet-300">if</span> <span className="text-stone-300">all(field in value </span><span className="text-violet-300">for</span><span className="text-stone-300"> field in </span><span className="text-sky-300">FIELDS</span><span className="text-stone-300">):</span></> },
    { indent: 3, content: <><span className="text-violet-300">yield</span> <span className="text-stone-300">value</span></> },
    { indent: 2, content: <><span className="text-violet-300">for</span> <span className="text-stone-300">child in value.values():</span></> },
    { indent: 3, content: <><span className="text-violet-300">yield from</span> <span className="text-sky-300">find_records</span><span className="text-stone-300">(child)</span></> },
  ],
  'Chill Corner Bot': [
    { content: <><span className="text-violet-300">async def</span> <span className="text-sky-300">on_member_join</span><span className="text-stone-300">(self, member):</span></> },
    { indent: 1, content: <><span className="text-stone-300">self.new_members.append(member)</span></> },
    { content: <>&nbsp;</> },
    { content: <><span className="text-violet-300">async def</span> <span className="text-sky-300">join_wait</span><span className="text-stone-300">(self):</span></> },
    { indent: 1, content: <><span className="text-violet-300">await</span> <span className="text-stone-300">self.bot.wait_until_ready()</span></> },
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
    <div className="relative h-32 overflow-hidden bg-[#120b20] px-4 pt-3 font-mono text-[9px] leading-[1.45] sm:text-[10px]">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 rounded-t bg-white/10 px-2 py-0.5 text-[8px] text-stone-300">{fileName}</span>
      </div>
      <div className="space-y-0.5 opacity-90">
        {lines.map((line, index) => (
          <div key={`${fileName}-${index}`} className="whitespace-nowrap">
            <span className="mr-2 inline-block w-3 text-right text-stone-600">{index + 1}</span>
            <span style={{ paddingLeft: `${(line.indent ?? 0) * 12}px` }}>{line.content}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0716] via-transparent to-transparent" />
    </div>
  );
}

function MoonfallThumbnail() {
  return (
    <div className="group/thumb relative h-32 overflow-hidden bg-[#10102b]">
      <img
        src="moonfall-splash.webp"
        alt="Moonfall game artwork"
        className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 group-hover/thumb:opacity-0"
      />
      <img
        src="moonfall-end-wolves.webp"
        alt="Moonfall wolves artwork"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover/thumb:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0716] via-transparent to-transparent" />
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/90 text-white text-xs font-semibold backdrop-blur">
        <Star size={12} className="fill-white" />
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
      className={`reveal group relative flex flex-col rounded-2xl glass overflow-hidden hover:border-violet-400/30 transition-all duration-300 ${
        visible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {project.title === 'Moonfall' ? <MoonfallThumbnail /> : <CodeEditor project={project} />}

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{project.title}</h3>
            <p className="mt-1 text-sm font-medium text-violet-400">{project.tagline}</p>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="shrink-0 p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Github size={20} />
          </a>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-stone-400 flex-1">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-stone-300 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200 group/link"
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
    <section id="projects" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div ref={ref} className={`reveal max-w-2xl ${visible ? 'is-visible' : ''}`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Selected work</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Projects I've shipped</h2>
          <p className="mt-4 text-lg text-stone-400">
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
