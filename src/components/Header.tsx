import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Work', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
      <nav className="w-full max-w-md sm:max-w-lg rounded-full border border-coolgray bg-white/90 py-2 pl-5 pr-2 flex items-center gap-1 shadow-card backdrop-blur">
        <a
          href="#top"
          className="font-display text-base font-extrabold tracking-tight text-ink mr-1"
        >
          Justin<span className="text-ink-faint">.</span>
        </a>

        <div className="hidden sm:flex items-center gap-0.5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-ink-mute rounded-full hover:text-ink hover:bg-mist transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="hidden sm:inline-flex ml-auto px-4 py-1.5 text-sm font-semibold text-porcelain bg-ink rounded-full hover:bg-ink-soft transition-colors"
        >
          Get in touch
        </a>

        <button
          className="sm:hidden ml-auto p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="sm:hidden absolute top-[4.5rem] inset-x-4 rounded-2xl border border-coolgray bg-white p-3 space-y-1 shadow-card-lg">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-ink rounded-xl hover:bg-mist"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-porcelain bg-ink rounded-xl text-center mt-1"
          >
            Get in touch
          </a>
        </div>
      )}
    </div>
  );
}
