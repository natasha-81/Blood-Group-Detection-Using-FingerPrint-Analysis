import { useEffect, useRef, useState } from "react";
import UploadPanel from "./components/UploadPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import StepTracker from "./components/StepTracker.jsx";
import FingerprintScan from "./components/FingerprintScan.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const PIPELINE_LENGTH = 5; // upload, preprocess, features, ensemble, result

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [stage, setStage] = useState(0); // live pipeline stage while a request is in flight
  const stageTimer = useRef(null);

  useEffect(() => () => clearInterval(stageTimer.current), []);

  const handleFile = (f) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setActiveId(null);
    setStage(0);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setActiveId(null);
    setStage(0);
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStage(1);

    clearInterval(stageTimer.current);
    stageTimer.current = setInterval(() => {
      setStage((s) => (s < PIPELINE_LENGTH - 2 ? s + 1 : s));
    }, 550);

    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`${API_BASE}/api/predict`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed.");
      setResult(data);
      setStage(PIPELINE_LENGTH - 1);

      const entry = { id: crypto.randomUUID(), previewUrl, result: data };
      setHistory((h) => [entry, ...h].slice(0, 12));
      setActiveId(entry.id);
    } catch (err) {
      setError(err.message);
      setStage(0);
    } finally {
      clearInterval(stageTimer.current);
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry) => {
    setResult(entry.result);
    setPreviewUrl(entry.previewUrl);
    setError(null);
    setActiveId(entry.id);
    setFile(null);
    setStage(PIPELINE_LENGTH - 1);
  };

  const scanState = loading ? "scanning" : result ? "done" : "idle";

  return (
    <div className="app">
      <div className="mesh-bg">
        <span /><span /><span /><span />
      </div>

      <header className="header">
        <div className="brand">
          <span className="dot" />
          Sanguine
          <span className="brand-sub">/ dermatoglyphic assay</span>
        </div>
        <div className="header-meta">
          <span className="status-chip">MODEL v1.0.0 · ONLINE</span>
          <br />
          <a href="https://github.com" target="_blank" rel="noreferrer">source on GitHub ↗</a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">Research demo — not a diagnostic device</div>
        <div className="hero-grid">
          <div>
            <h1>
              Predicting <span>blood group</span> from fingerprint ridge texture.
            </h1>
            <p>
              CLAHE-enhanced fingerprints are analysed with GLCM, multi-block LBP and Gabor
              texture features, then fused with a ResNet18 CNN across five classifiers to
              call one of eight ABO/Rh blood groups.
            </p>
            <div className="metric-row">
              <div className="metric">
                <div className="val accent">97.2%</div>
                <div className="label">Late-fusion accuracy</div>
              </div>
              <div className="metric">
                <div className="val">8</div>
                <div className="label">Blood groups</div>
              </div>
              <div className="metric">
                <div className="val">5</div>
                <div className="label">Models in ensemble</div>
              </div>
              <div className="metric">
                <div className="val">1,600</div>
                <div className="label">Held-out test images</div>
              </div>
            </div>
          </div>

          <div className="hero-signature">
            <span className="hero-signature-ring r1" />
            <span className="hero-signature-ring r2" />
            <div className="hero-signature-card">
              <FingerprintScan state={scanState} size={92} />
            </div>
          </div>
        </div>
      </section>

      <StepTracker activeIndex={stage} doneIndex={result ? PIPELINE_LENGTH - 1 : -1} />

      <main className="main">
        <UploadPanel
          file={file}
          previewUrl={previewUrl}
          onFile={handleFile}
          onClear={handleClear}
          onPredict={handlePredict}
          loading={loading}
        />
        <ResultsPanel result={result} error={error} loading={loading} />
      </main>

      <div className="history-wrap">
        <HistoryPanel history={history} activeId={activeId} onSelect={handleSelectHistory} />
      </div>

      <div className="disclaimer">
        <p>
          Sanguine is a research / portfolio project demonstrating a multi-model fusion
          pipeline (SVM, Random Forest, Logistic Regression, XGBoost, ResNet18) trained
          on hand-crafted texture features and CNN embeddings from fingerprint images.
          Reported accuracy reflects a held-out test split from the training dataset —
          this is not a validated clinical or forensic blood-typing method and should
          not be used for medical decisions.
        </p>
      </div>
    </div>
  );
}
