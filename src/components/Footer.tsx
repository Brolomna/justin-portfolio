import { Github, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';

export default function Footer() {
  const { contact } = portfolio;
  return (
    <footer className="relative border-t border-white/5">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          Justin<span className="text-violet-400">.</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-400 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            <Mail size={16} className="text-violet-400" />
            Email
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-400 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>

        <p className="text-sm text-stone-500">
          © {new Date().getFullYear()} Justin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
