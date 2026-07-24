const RIDGE_PATHS = [
  "M60 12c-18 0-32 14-32 32v16c0 20-12 28-12 44 0 20 18 36 44 36",
  "M60 20c-14 0-24 11-24 24v18c0 16-10 24-10 38 0 14 12 26 30 26",
  "M60 28c-10 0-16 8-16 16v22c0 12-8 18-8 30 0 10 8 18 20 18",
  "M60 4c-24 0-42 18-42 42v14c0 24-16 34-16 54 0 26 22 46 56 46",
  "M60 36c-6 0-8 5-8 10v26c0 8-6 12-6 22 0 6 6 12 12 12",
];

export default function FingerprintScan({ state = "idle", progress = 0 }) {
  // state: idle | scanning | done
  return (
    <svg viewBox="0 0 120 140" width="72" height="84" className={`fp-svg fp-${state}`}>
      {RIDGE_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="fp-ridge"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {state === "scanning" && (
        <rect x="0" y={140 * (1 - progress)} width="120" height="3" className="fp-beam" />
      )}
    </svg>
  );
}
