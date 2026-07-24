"""
Loads the trained classical models (SVM, RF, LR, XGBoost), the CNN
(ResNet18), and runs the same weighted late-fusion ensemble used in
STEP 8 of the training notebook.
"""
import io
import os

import joblib
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

from config import CLASSES, FUSION_WEIGHTS, MODEL_PATHS, NUM_CLASSES
from features import extract_all_features, preprocess_image

_val_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def _build_resnet18(num_classes=NUM_CLASSES):
    cnn = models.resnet18(weights=None)
    in_features = cnn.fc.in_features
    cnn.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes),
    )
    return cnn


class BloodGroupPredictor:
    """Loads all model artifacts once and exposes .predict(image_bytes)."""

    def __init__(self, models_dir_paths=MODEL_PATHS, device=None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        missing = [k for k, p in models_dir_paths.items() if not os.path.exists(p)]
        if missing:
            raise FileNotFoundError(
                f"Missing model artifact(s): {missing}. "
                f"Place the trained files in backend/models/ "
                f"(see backend/models/README.md)."
            )

        self.scaler = joblib.load(models_dir_paths["scaler"])
        self.svm = joblib.load(models_dir_paths["svm"])
        self.rf = joblib.load(models_dir_paths["rf"])
        self.lr = joblib.load(models_dir_paths["lr"])
        self.xgb = joblib.load(models_dir_paths["xgb"])

        self.cnn = _build_resnet18()
        state_dict = torch.load(models_dir_paths["cnn"], map_location=self.device)
        self.cnn.load_state_dict(state_dict)
        self.cnn.to(self.device)
        self.cnn.eval()

        self.weights = FUSION_WEIGHTS

    def predict(self, image_bytes: bytes) -> dict:
        # ---- classical ML branch (grayscale + hand-crafted features) ----
        arr = np.frombuffer(image_bytes, np.uint8)
        import cv2
        gray = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        if gray is None:
            raise ValueError("Could not decode image. Supported: PNG, JPG, BMP, TIF.")

        img_processed = preprocess_image(gray)
        features = extract_all_features(img_processed)
        features_scaled = self.scaler.transform([features])

        svm_probs = self.svm.predict_proba(features_scaled)[0]
        rf_probs = self.rf.predict_proba(features_scaled)[0]
        lr_probs = self.lr.predict_proba(features_scaled)[0]
        xgb_probs = self.xgb.predict_proba(features_scaled)[0]

        # ---- CNN branch (RGB tensor) ----
        img_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = _val_transform(img_pil).unsqueeze(0).to(self.device)
        with torch.no_grad():
            out = self.cnn(tensor)
            cnn_probs = torch.softmax(out, 1).cpu().numpy()[0]

        # ---- late fusion ----
        w = self.weights
        fused = (
            w["cnn"] * cnn_probs
            + w["svm"] * svm_probs
            + w["rf"] * rf_probs
            + w["lr"] * lr_probs
            + w["xgb"] * xgb_probs
        )
        pred_idx = int(fused.argmax())

        return {
            "prediction": CLASSES[pred_idx],
            "confidence": round(float(fused[pred_idx]) * 100, 2),
            "class_probabilities": {
                CLASSES[i]: round(float(fused[i]) * 100, 2) for i in range(len(CLASSES))
            },
            "per_model": {
                "cnn": self._top(cnn_probs),
                "svm": self._top(svm_probs),
                "random_forest": self._top(rf_probs),
                "logistic_regression": self._top(lr_probs),
                "xgboost": self._top(xgb_probs),
            },
        }

    @staticmethod
    def _top(probs):
        idx = int(np.argmax(probs))
        return {"prediction": CLASSES[idx], "confidence": round(float(probs[idx]) * 100, 2)}
