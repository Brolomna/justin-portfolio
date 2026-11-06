export const portfolio = {
  name: 'Justin',
  role: 'Developer — Websites & apps built with AI',
  hero: {
    headline: 'Websites and apps, built faster with AI.',
    subline:
      'I help small businesses and startups ship quality sites and apps quickly using AI-assisted development and testing — clean, reliable products without the long wait.',
    primaryCta: { label: 'View work', target: '#projects' },
    secondaryCta: { label: 'Get in touch', target: 'mailto:anmolsiwa30@gmail.com' },
  },
  projects: [
    {
      title: 'Moonfall',
      tagline: 'Local-multiplayer werewolf web game',
      description:
        'A real-time werewolf game where players in the same room join by scanning a QR code. Built with TypeScript, React and Socket.IO, with a multilingual UI.',
      tags: ['TypeScript', 'React', 'Socket.IO', 'Multilingual'],
      url: 'https://github.com/Brolomna/Moonfall',
      flagship: true,
    },
    {
      title: 'AI Workflow Assistant',
      tagline: 'Notes → summaries, action items, classifications',
      description:
        'A Python CLI that turns plain-text notes into summaries, action items and classifications. Includes an offline demo mode and support for OpenAI-compatible APIs.',
      tags: ['Python', 'CLI', 'OpenAI', 'Automation'],
      url: 'https://github.com/Brolomna/ai-workflow-assistant',
      flagship: false,
    },
    {
      title: 'Data Extractor',
      tagline: 'Structured data from messy raw input',
      description:
        'Extracts, parses and exports structured information from messy raw input — turning unstructured text into clean, usable data.',
      tags: ['Python', 'Parsing', 'Data'],
      url: 'https://github.com/Brolomna/data_extractor',
      flagship: false,
    },
    {
      title: 'Chill Corner Bot',
      tagline: 'Community operations bot',
      description:
        'A community operations bot for the Chill Corner community, handling moderation and day-to-day tasks to keep the community running smoothly.',
      tags: ['Bot', 'Automation', 'Community'],
      url: 'https://github.com/Brolomna/Chill-Corner-Bot',
      flagship: false,
    },
  ],
  skills: [
    { name: 'Web development', icon: 'Globe' },
    { name: 'AI-assisted building & testing', icon: 'Sparkles' },
    { name: 'JavaScript / TypeScript', icon: 'Code2' },
    { name: 'React', icon: 'Component' },
    { name: 'Python automation', icon: 'FileCode2' },
    { name: 'Linux', icon: 'Terminal' },
    { name: 'Git & GitHub', icon: 'GitBranch' },
  ],
  about: {
    paragraph:
      'Justin uses AI tools to design, build and test websites and apps faster — without cutting corners on quality. His background as a computer instructor, and later an English teacher, makes him a clear communicator who is easy to work with. He turns ideas into shipped products, and explains the process in plain language along the way.',
  },
  contact: {
    email: 'anmolsiwa30@gmail.com',
    github: 'https://github.com/Brolomna',
  },
} as const;

export type Project = (typeof portfolio.projects)[number];
export type Skill = (typeof portfolio.skills)[number];
