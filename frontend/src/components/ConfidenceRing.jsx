export default function ConfidenceRing({ value = 0, size = 92, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 100) / 100);

  return (
    <div className="confidence-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--signal-teal)" />
            <stop offset="100%" stopColor="var(--helix-blue)" />
          </linearGradient>
        </defs>
        <circle className="confidence-ring-track" cx={size / 2} cy={size / 2} r={radius} />
        <circle
          className="confidence-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="confidence-ring-value">{value.toFixed(0)}%</span>
    </div>
  );
}
