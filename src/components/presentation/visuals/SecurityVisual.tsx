export default function SecurityVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center p-1 sm:p-2">
      <svg viewBox="0 0 400 260" className="h-full w-full max-w-xl" role="img" aria-label="Network traffic inspected at a security boundary; a suspicious packet is blocked">
        {/* boundary */}
        <line x1="176" y1="24" x2="176" y2="236" stroke="#8CA0B3" strokeWidth="1" strokeDasharray="4 6" opacity="0.7" />
        <text x="176" y="16" textAnchor="middle" fontSize="8" fill="#8CA0B3" className="font-mono">security boundary</text>

        {/* main wire */}
        <line x1="62" y1="130" x2="316" y2="130" stroke="#C7D3DF" strokeWidth="1.5" />

        {/* internet node */}
        <g>
          <circle cx="48" cy="130" r="22" fill="#EAF2FB" stroke="#24364B" strokeOpacity="0.35" strokeWidth="1.5" />
          <ellipse cx="48" cy="130" rx="9" ry="22" fill="none" stroke="#24364B" strokeOpacity="0.35" strokeWidth="1" />
          <line x1="26" y1="130" x2="70" y2="130" stroke="#24364B" strokeOpacity="0.35" strokeWidth="1" />
          <text x="48" y="168" textAnchor="middle" fontSize="8.5" fill="#5A7186" className="font-mono">internet</text>
        </g>

        {/* firewall / inspection point */}
        <g>
          <rect x="190" y="88" width="22" height="84" rx="3" fill="#FFFFFF" stroke="#24364B" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="190" y1="109" x2="212" y2="109" stroke="#24364B" strokeOpacity="0.25" />
          <line x1="190" y1="130" x2="212" y2="130" stroke="#24364B" strokeOpacity="0.25" />
          <line x1="190" y1="151" x2="212" y2="151" stroke="#24364B" strokeOpacity="0.25" />
          <rect x="184" y="126" width="34" height="3" rx="1.5" fill="#24364B" opacity="0.8" className="sc-sec-scan" />
          <text x="201" y="188" textAnchor="middle" fontSize="8.5" fill="#5A7186" className="font-mono">inspection</text>
        </g>

        {/* blocked flag */}
        <g className="sc-sec-flag">
          <rect x="142" y="46" width="118" height="18" rx="9" fill="#FEF2F2" stroke="#DC2626" strokeOpacity="0.5" />
          <text x="201" y="58" textAnchor="middle" fontSize="8" fontWeight="600" fill="#DC2626" className="font-mono">blocked: suspicious packet</text>
        </g>

        {/* protected server */}
        <g>
          <circle cx="318" cy="130" r="30" fill="none" stroke="#059669" strokeOpacity="0.5" strokeWidth="1.5" className="sc-sec-ping" />
          <rect x="296" y="104" width="44" height="56" rx="6" fill="#FFFFFF" stroke="#24364B" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="302" y1="118" x2="334" y2="118" stroke="#24364B" strokeOpacity="0.3" />
          <line x1="302" y1="132" x2="334" y2="132" stroke="#24364B" strokeOpacity="0.3" />
          <line x1="302" y1="146" x2="334" y2="146" stroke="#24364B" strokeOpacity="0.3" />
          <circle cx="306" cy="111" r="1.6" fill="#059669" />
          <circle cx="306" cy="125" r="1.6" fill="#059669" />
          <circle cx="306" cy="139" r="1.6" fill="#059669" />
          {/* shield */}
          <path d="M 350 84 l 12 5 v 9 c 0 8 -5 13 -12 16 c -7 -3 -12 -8 -12 -16 v -9 z" fill="#EAF2FB" stroke="#24364B" strokeOpacity="0.5" strokeWidth="1.5" />
          <path d="M 345 95 l 4 4 l 7 -8" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="318" y="176" textAnchor="middle" fontSize="8.5" fill="#5A7186" className="font-mono">protected system</text>
        </g>

        {/* traffic */}
        <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="#24364B" className="sc-sec-packet" />
        <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="#24364B" className="sc-sec-packet" style={{ animationDelay: '1.4s' }} />
        <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="#35506B" className="sc-sec-packet" style={{ animationDelay: '2.8s' }} />
        <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#DC2626" className="sc-sec-packet-bad" />

        <text x="16" y="246" fontSize="9" fill="#8CA0B3" className="font-mono">ingress filter · packet inspection</text>
      </svg>
    </div>
  );
}
