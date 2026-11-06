const interests = [
  'python · automation',
  'artificial intelligence',
  'linux · systems',
  'cybersecurity',
  'web development',
  'teaching',
];

const chips = [
  { label: 'python', pos: 'left-[4%] top-[12%]', delay: '0s' },
  { label: 'linux', pos: 'right-[5%] top-[20%]', delay: '1.2s' },
  { label: 'ai apps', pos: 'left-[8%] bottom-[17%]', delay: '2.3s' },
  { label: 'security', pos: 'right-[7%] bottom-[9%]', delay: '0.7s' },
];

export default function IdentityVisual() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6">
      {/* free-floating interest chips spread around the open space */}
      {chips.map((c) => (
        <span
          key={c.label}
          aria-hidden="true"
          className={`sc-float absolute ${c.pos} rounded-full border border-coolgray bg-white/90 px-2.5 py-1 font-mono text-[10px] text-ink-mute shadow-sm`}
          style={{ animationDelay: c.delay }}
        >
          {c.label}
        </span>
      ))}

      {/* monogram centerpiece with rotating rings */}
      <div className="relative h-40 w-40 sm:h-52 sm:w-52">
        <svg aria-hidden="true" className="sc-id-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#24364B" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="2 8" />
        </svg>
        <svg aria-hidden="true" className="sc-id-ring-rev absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#24364B" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="1 16" />
          <circle cx="100" cy="4" r="3.5" fill="#24364B" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-ink font-display text-5xl sm:text-6xl font-extrabold text-porcelain shadow-card-lg">
            J
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden">
        <p className="sc-id-name font-display text-3xl sm:text-4xl font-extrabold text-ink">
          JUSTIN
        </p>
      </div>

      {/* rotating interests ticker */}
      <div className="mt-3 h-7 overflow-hidden" aria-hidden="true">
        <ul className="sc-id-ticker text-center font-mono text-xs sm:text-sm leading-7 text-ink-mute">
          {[...interests, interests[0]].map((w, i) => (
            <li key={`${w}-${i}`} className="h-7">
              {w}
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only">
        Interests: python and automation, artificial intelligence, linux and
        systems, cybersecurity, web development, teaching.
      </p>
    </div>
  );
}
