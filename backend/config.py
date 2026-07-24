"""
Central configuration for the blood-group-from-fingerprint inference service.
Values below (fusion weights, class order, image size) must match whatever
was used at training time in notebooks/blood_group_fingerprint_training.ipynb.
"""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CLASSES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
NUM_CLASSES = len(CLASSES)
IMG_SIZE = 128

# Which local feature descriptor to use alongside GLCM + Gabor.
# Must match FEATURE_TYPE used when the scaler/classical models were trained.
FEATURE_TYPE = "multiblock"

MODEL_PATHS = {
    "svm": os.path.join(MODELS_DIR, "svm_model.pkl"),
    "rf": os.path.join(MODELS_DIR, "rf_model.pkl"),
    "lr": os.path.join(MODELS_DIR, "logistic_model.pkl"),
    "xgb": os.path.join(MODELS_DIR, "xgb_model.pkl"),
    "scaler": os.path.join(MODELS_DIR, "scaler.pkl"),
    "cnn": os.path.join(MODELS_DIR, "best_cnn.pth"),
}

# Late-fusion weights computed from validation-set accuracy in the training
# notebook (auto-weighting step). Update these if you retrain the models.
FUSION_WEIGHTS = {
    "cnn": 0.20,
    "svm": 0.21,
    "rf": 0.20,
    "lr": 0.18,
    "xgb": 0.21,
}

MAX_UPLOAD_SIZE_MB = 8
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "tif", "tiff"}
