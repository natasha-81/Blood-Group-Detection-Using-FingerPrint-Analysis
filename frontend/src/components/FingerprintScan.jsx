const RIDGE_PATHS = [
  "M60 12c-18 0-32 14-32 32v16c0 20-12 28-12 44 0 20 18 36 44 36",
  "M60 20c-14 0-24 11-24 24v18c0 16-10 24-10 38 0 14 12 26 30 26",
  "M60 28c-10 0-16 8-16 16v22c0 12-8 18-8 30 0 10 8 18 20 18",
  "M60 4c-24 0-42 18-42 42v14c0 24-16 34-16 54 0 26 22 46 56 46",
  "M60 36c-6 0-8 5-8 10v26c0 8-6 12-6 22 0 6 6 12 12 12",
];

/**
 * Signature visual: fingerprint ridges that, once a prediction lands ("done"),
 * cross-fade into a DNA double-helix — the shared thread between dermatoglyphic
 * texture and the genetic basis of blood type.
 */
export default function FingerprintScan({ state = "idle", size = 72 }) {
  const height = size * (140 / 120);
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={height}
      className={`fp-svg fp-${state}`}
      aria-hidden="true"
    >
      <g style={{ opacity: state === "done" ? 0 : 1, transition: "opacity 0.5s ease" }}>
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
          <rect x="0" y="4" width="120" height="3" className="fp-beam" />
        )}
      </g>

      <g style={{ opacity: state === "done" ? 1 : 0, transition: "opacity 0.5s ease 0.15s" }}>
        <path
          d="M40 8 C40 30, 80 30, 80 52 C80 74, 40 74, 40 96 C40 118, 80 118, 80 132"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="helix-path"
        />
        <path
          d="M80 8 C80 30, 40 30, 40 52 C40 74, 80 74, 80 96 C80 118, 40 118, 40 132"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="helix-path"
          style={{ animationDelay: "0.1s" }}
        />
        {[18, 40, 62, 84, 106, 128].map((y, i) => (
          <line
            key={y}
            x1={i % 2 === 0 ? 44 : 76}
            y1={y}
            x2={i % 2 === 0 ? 76 : 44}
            y2={y}
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </g>
    </svg>
  );
}
