const STEPS = [
  { key: "upload", label: "Upload specimen" },
  { key: "preprocess", label: "CLAHE enhance" },
  { key: "features", label: "Extract GLCM · LBP · Gabor" },
  { key: "ensemble", label: "5-model ensemble vote" },
  { key: "result", label: "Fused result" },
];

/**
 * Visual pipeline tracker. `activeIndex` is the currently in-progress stage
 * (advances on a timer while a request is in flight); `doneIndex` marks stages
 * that are fully complete once a result has actually returned.
 */
export default function StepTracker({ activeIndex, doneIndex }) {
  return (
    <div className="step-tracker">
      <div className="step-track">
        {STEPS.map((s, i) => {
          const isDone = doneIndex >= i;
          const isActive = !isDone && activeIndex === i;
          return (
            <div key={s.key} className={`step-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
              <span className="step-dot" />
              <span className="step-label">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
