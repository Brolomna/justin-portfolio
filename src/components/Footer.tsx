import { Github, Mail } from 'lucide-react';
import { portfolio } from '@/data/portfolio';

export default function Footer() {
  const { contact } = portfolio;
  return (
    <footer className="relative border-t border-coolgray bg-porcelain">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <a
          href="#top"
          className="font-display text-lg font-extrabold tracking-tight text-ink"
        >
          Justin<span className="text-ink-faint">.</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-ink-mute rounded-lg hover:text-ink hover:bg-mist transition-colors"
          >
            <Mail size={16} />
            Email
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-ink-mute rounded-lg hover:text-ink hover:bg-mist transition-colors"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>

        <p className="text-sm text-ink-faint">
          © {new Date().getFullYear()} Justin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
