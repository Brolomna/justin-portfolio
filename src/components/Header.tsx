import { useEffect, useState } from 'react';
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
      <nav className="glass-strong rounded-full pl-5 pr-2 py-2 flex items-center gap-1 shadow-glow-sm w-full max-w-md sm:max-w-lg">
        <a
          href="#top"
          className="font-display text-base font-bold tracking-tight text-white mr-1"
        >
          Justin<span className="text-violet-400">.</span>
        </a>

        <div className="hidden sm:flex items-center gap-0.5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm font-medium text-stone-300 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="hidden sm:inline-flex ml-auto px-4 py-1.5 text-sm font-semibold text-white bg-violet-600/90 rounded-full hover:bg-violet-500 transition-colors"
        >
          Get in touch
        </a>

        <button
          className="sm:hidden ml-auto p-2 text-stone-200"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="sm:hidden absolute top-20 inset-x-4 glass-strong rounded-2xl p-3 space-y-1 shadow-glow">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-stone-200 rounded-xl hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-white bg-violet-600/90 rounded-xl text-center mt-1"
          >
            Get in touch
          </a>
        </div>
      )}
    </div>
  );
}
