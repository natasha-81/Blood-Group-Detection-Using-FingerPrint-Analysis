"""
Flask API for the blood-group-from-fingerprint demo.

Endpoints:
  GET  /api/health   -> service + model status
  POST /api/predict   -> multipart/form-data { image: <file> } -> prediction JSON
"""
import logging
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

from config import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB
from inference import BloodGroupPredictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("blood-group-api")

app = Flask(__name__)
CORS(app)  # tighten allowed origins in production, see README
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_SIZE_MB * 1024 * 1024

predictor = None
model_load_error = None
try:
    predictor = BloodGroupPredictor()
    logger.info("Models loaded successfully on %s", predictor.device)
except Exception as exc:  # noqa: BLE001 - surface at /api/health instead of crashing import
    model_load_error = str(exc)
    logger.error("Failed to load models: %s", exc)


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok" if predictor is not None else "models_not_loaded",
        "error": model_load_error,
    })


@app.post("/api/predict")
def predict():
    if predictor is None:
        return jsonify({"error": f"Models not loaded: {model_load_error}"}), 503

    if "image" not in request.files:
        return jsonify({"error": "No file uploaded. Send multipart/form-data with key 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    if not _allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {sorted(ALLOWED_EXTENSIONS)}"}), 400

    filename = secure_filename(file.filename)
    try:
        image_bytes = file.read()
        result = predictor.predict(image_bytes)
        result["filename"] = filename
        return jsonify(result)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed for %s", filename)
        return jsonify({"error": str(exc)}), 500


@app.errorhandler(RequestEntityTooLarge)
def handle_large_file(_exc):
    return jsonify({"error": f"File too large. Max size is {MAX_UPLOAD_SIZE_MB}MB."}), 413


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
