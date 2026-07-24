import { useRef, useState } from "react";
import FingerprintScan from "./FingerprintScan.jsx";

export default function UploadPanel({ file, previewUrl, onFile, onClear, onPredict, loading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <span>Specimen input</span>
        <span>{file ? file.name : "AWAITING FILE"}</span>
      </div>

      {!previewUrl ? (
        <label
          className={`dropzone ${dragOver ? "dragover" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="frame-corner fc-tl" />
          <span className="frame-corner fc-tr" />
          <span className="frame-corner fc-bl" />
          <span className="frame-corner fc-br" />
          <div className="fp-idle-icon">
            <FingerprintScan state="idle" />
          </div>
          <div className="cta">Drop a fingerprint image, or click to browse</div>
          <div className="hint">PNG · JPG · BMP · TIF — MAX 8MB</div>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.bmp,.tif,.tiff"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="preview-wrap">
          <img src={previewUrl} alt="fingerprint preview" />
          {loading && (
            <>
              <div className="scan-line" />
              <div className="fp-overlay">
                <FingerprintScan state="scanning" progress={0.6} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="actions">
        <button className="primary" onClick={onPredict} disabled={!file || loading}>
          {loading ? "Analysing…" : "Run prediction"}
        </button>
        <button onClick={onClear} disabled={!file || loading}>
          Clear
        </button>
      </div>
    </div>
  );
}
