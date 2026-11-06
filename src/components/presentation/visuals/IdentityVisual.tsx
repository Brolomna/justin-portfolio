const interests = [
  'python · automation',
  'artificial intelligence',
  'linux · systems',
  'cybersecurity',
  'web development',
  'teaching',
];

export default function IdentityVisual() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white to-mist/70 px-6">
      {/* monogram centerpiece with rotating rings */}
      <div className="relative h-36 w-36 sm:h-44 sm:w-44">
        <svg aria-hidden="true" className="sc-id-ring absolute inset-0 h-full w-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#24364B" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="2 8" />
        </svg>
        <svg aria-hidden="true" className="sc-id-ring-rev absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="none" stroke="#24364B" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="1 16" />
          <circle cx="100" cy="4" r="3.5" fill="#24364B" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-ink font-display text-4xl sm:text-5xl font-extrabold text-porcelain shadow-card-lg">
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
