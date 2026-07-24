export default function HistoryPanel({ history, activeId, onSelect }) {
  if (history.length === 0) return null;

  return (
    <div className="history-panel">
      <div className="panel-title">
        <span>Session log</span>
        <span>{history.length} scan{history.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="history-list">
        {history.map((h) => (
          <button
            key={h.id}
            className={`history-item ${h.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(h)}
          >
            <img src={h.previewUrl} alt="" />
            <div className="history-meta">
              <span className="history-group">{h.result.prediction}</span>
              <span className="history-conf">{h.result.confidence.toFixed(1)}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
