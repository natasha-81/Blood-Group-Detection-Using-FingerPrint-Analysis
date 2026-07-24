import { useState } from "react";
import UploadPanel from "./components/UploadPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const handleFile = (f) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setActiveId(null);
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setActiveId(null);
  };

  const handlePredict = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed.");

      setResult(data);

      const entry = {
        id: crypto.randomUUID(),
        previewUrl,
        result: data,
      };

      setHistory((h) => [entry, ...h].slice(0, 12));
      setActiveId(entry.id);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (entry) => {
    setResult(entry.result);
    setPreviewUrl(entry.previewUrl);
    setError(null);
    setActiveId(entry.id);
    setFile(null);
  };

  return (
    <div className="app">
      <div className="ridge-bg" />

      <header className="header">
        <div className="brand">
          <span className="dot" />
          HemaType
          <span className="brand-sub">/ dermatoglyphic assay</span>
        </div>

        <div className="header-meta">
          <span className="status-chip">MODEL v1.0.0 · ONLINE</span>
          <br />
          <a href="https://github.com" target="_blank" rel="noreferrer">
            source on GitHub ↗
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          Research demo — not a diagnostic device
        </div>

        <h1>
          Predicting <span>blood group</span> from fingerprint ridge texture.
        </h1>

        <p>
          AI-powered fingerprint analysis using hybrid ML + CNN models.
        </p>
      </section>

     <main className="main">
  <div className="container">
    <div className="left-panel">
      <UploadPanel
        file={file}
        previewUrl={previewUrl}
        onFile={handleFile}
        onClear={handleClear}
        onPredict={handlePredict}
        loading={loading}
      />
    </div>

    <div className="right-panel">
      <ResultsPanel
        result={result}
        error={error}
        loading={loading}
      />
    </div>
  </div>
</main>

      <div className="history-wrap">
        <HistoryPanel
          history={history}
          activeId={activeId}
          onSelect={handleSelectHistory}
        />
      </div>
    </div>
  );
}