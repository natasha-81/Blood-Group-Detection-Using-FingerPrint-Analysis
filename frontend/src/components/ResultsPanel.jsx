import { useMemo } from "react";
import useCountUp from "../hooks/useCountUp.js";
import ModelChart from "./ModelChart.jsx";

function specimenId(seed) {
  const n = Math.abs(
    Array.from(seed || "x").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 999999, 7)
  );
  return `FP-${String(n).padStart(6, "0")}`;
}

export default function ResultsPanel({ result, error, loading }) {
  const animatedConfidence = useCountUp(result?.confidence);
  const timestamp = useMemo(() => new Date(), [result]);
  const id = useMemo(() => specimenId(result?.filename || result?.prediction), [result]);

  return (
    <div className="result-panel">
      <div className="panel-title">
        <span>Analysis output</span>
        {result && <span>5-MODEL ENSEMBLE</span>}
      </div>

      {!result && !error && (
        <div className="result-empty">
          {loading
            ? "Running CLAHE preprocessing, feature extraction\nand 5-model late fusion…"
            : "Upload a fingerprint and run a prediction\nto see the blood group readout here."}
        </div>
      )}

      {error && <div className="error-box">ERROR — {error}</div>}

      {result && (
        <>
          <div className="report-meta">
            <span>SAMPLE {id}</span>
            <span>{timestamp.toLocaleString()}</span>
          </div>

          <div className="result-headline">
            <div>
              <div className="result-label">Predicted blood group</div>
              <span className="result-group result-pop">{result.prediction}</span>
            </div>
            <div className="result-confidence-wrap">
              <div className="result-confidence">{animatedConfidence.toFixed(1)}%</div>
              <div className="result-confidence-label">fused confidence</div>
            </div>
          </div>

          <div className="bars">
            {Object.entries(result.class_probabilities)
              .sort((a, b) => b[1] - a[1])
              .map(([label, val], i) => (
                <div className="bar-row bar-row-anim" key={label} style={{ animationDelay: `${i * 0.04}s` }}>
                  <span>{label}</span>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${label === result.prediction ? "top" : ""}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <span className="bar-val">{val.toFixed(1)}%</span>
                </div>
              ))}
          </div>

          <div className="per-model">
            <div className="panel-title" style={{ background: "transparent" }}>
              <span>Per-model votes</span>
              <span>hover for detail</span>
            </div>
            <div className="panel-body" style={{ paddingTop: 8 }}>
              <ModelChart perModel={result.per_model} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
