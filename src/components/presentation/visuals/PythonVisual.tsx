export default function PythonVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-3">
      <svg viewBox="0 0 400 260" className="h-full w-full max-w-lg" role="img" aria-label="Animated automation workflow: input, parse, validate, transform, output">
        {/* wires */}
        <path
          d="M 90 52 L 240 52 L 240 122 L 170 122 L 170 192 L 88 192"
          fill="none"
          stroke="#8CA0B3"
          strokeWidth="1.5"
          className="sc-py-wire"
        />
        <path
          d="M 292 52 H 326 V 16 H 164 V 28"
          fill="none"
          stroke="#C7D3DF"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <text x="330" y="20" fontSize="8" fill="#8CA0B3" className="font-mono">retry</text>

        {/* moving data packets */}
        <circle r="4.5" fill="#24364B" className="sc-py-packet" />
        <circle r="4.5" fill="#24364B" className="sc-py-packet" style={{ animationDelay: '1.5s' }} />
        <circle r="4.5" fill="#35506B" className="sc-py-packet" style={{ animationDelay: '3s' }} />

        {/* nodes */}
        <g className="sc-py-node">
          <rect x="16" y="30" width="72" height="44" rx="8" fill="#FFFFFF" stroke="#24364B" strokeOpacity="0.3" strokeWidth="1.5" />
          <text x="52" y="49" textAnchor="middle" fontSize="10" fontWeight="600" fill="#24364B" className="font-mono">input</text>
          <text x="52" y="63" textAnchor="middle" fontSize="7.5" fill="#8CA0B3" className="font-mono">raw notes</text>
        </g>
        <g className="sc-py-node" style={{ animationDelay: '0.6s' }}>
          <rect x="120" y="30" width="72" height="44" rx="8" fill="#FFFFFF" stroke="#24364B" strokeOpacity="0.3" strokeWidth="1.5" />
          <text x="156" y="49" textAnchor="middle" fontSize="10" fontWeight="600" fill="#24364B" className="font-mono">parse</text>
          <text x="156" y="63" textAnchor="middle" fontSize="7.5" fill="#8CA0B3" className="font-mono">split · clean</text>
        </g>
        <g className="sc-py-node" style={{ animationDelay: '1.2s' }}>
          <polygon points="240,26 292,52 240,78 188,52" fill="#EAF2FB" stroke="#24364B" strokeOpacity="0.45" strokeWidth="1.5" />
          <text x="240" y="56" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#24364B" className="font-mono">valid?</text>
        </g>
        <g className="sc-py-node" style={{ animationDelay: '1.8s' }}>
          <rect x="128" y="170" width="84" height="44" rx="8" fill="#FFFFFF" stroke="#24364B" strokeOpacity="0.3" strokeWidth="1.5" />
          <text x="170" y="189" textAnchor="middle" fontSize="10" fontWeight="600" fill="#24364B" className="font-mono">transform</text>
          <text x="170" y="203" textAnchor="middle" fontSize="7.5" fill="#8CA0B3" className="font-mono">structure</text>
        </g>
        <g className="sc-py-node" style={{ animationDelay: '2.4s' }}>
          <rect x="16" y="170" width="72" height="44" rx="8" fill="#24364B" />
          <text x="52" y="189" textAnchor="middle" fontSize="10" fontWeight="600" fill="#F8FAFC" className="font-mono">output</text>
          <text x="52" y="203" textAnchor="middle" fontSize="7.5" fill="#A9BCCF" className="font-mono">summary.json</text>
        </g>

        <text x="16" y="244" fontSize="9" fill="#5A7186" className="font-mono">
          ▸ python tasks.py --demo <tspan className="sc-cursor">▌</tspan>
        </text>
      </svg>
    </div>
  );
}
