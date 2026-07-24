"""
Preprocessing and hand-crafted feature extraction.

Ported directly from notebooks/blood_group_fingerprint_training.ipynb (STEP 4 & 5)
so that inference uses the exact same pipeline as training. Do not change the
math here without retraining the classical models + scaler, since the feature
vector layout (GLCM -> local descriptor -> Gabor) is what they were fit on.
"""
import cv2
import numpy as np
from skimage.feature import local_binary_pattern, graycomatrix, graycoprops

from config import IMG_SIZE, FEATURE_TYPE


def preprocess_image(img_path_or_array, size=IMG_SIZE):
    """Load -> grayscale -> resize -> CLAHE -> normalise to [0,1] float32."""
    if isinstance(img_path_or_array, str):
        img = cv2.imread(img_path_or_array, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError(f"Cannot read image: {img_path_or_array}")
    else:
        img = img_path_or_array

    img = cv2.resize(img, (size, size))
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)
    return img.astype(np.float32) / 255.0


# ---------- GLCM ----------
def extract_glcm_features(img_float):
    img_uint8 = (img_float * 255).astype(np.uint8)
    glcm = graycomatrix(
        img_uint8, distances=[1, 2], angles=[0, np.pi / 4],
        levels=256, symmetric=True, normed=True,
    )
    feats = []
    for prop in ["contrast", "homogeneity"]:
        feats.extend(graycoprops(glcm, prop).flatten())
    return np.array(feats)


# ---------- Multi-block uniform LBP (default FEATURE_TYPE) ----------
def extract_multiblock_lbp(img_float, blocks=4):
    img = (img_float * 255).astype(np.uint8)
    h, w = img.shape
    bh, bw = h // blocks, w // blocks
    features = []
    for i in range(blocks):
        for j in range(blocks):
            block = img[i * bh:(i + 1) * bh, j * bw:(j + 1) * bw]
            lbp = local_binary_pattern(block, 8, 1, method="uniform")
            hist, _ = np.histogram(lbp.ravel(), bins=10, range=(0, 10))
            hist = hist.astype("float")
            hist /= (hist.sum() + 1e-6)
            features.extend(hist)
    return np.array(features)


# ---------- Gabor ----------
def extract_gabor_features(img_float):
    feats = []
    img = (img_float * 255).astype(np.float32)
    for theta in np.linspace(0, np.pi, 4, endpoint=False):
        kernel = cv2.getGaborKernel((21, 21), 2, theta, 10.0, 0.5, 0, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(img, cv2.CV_32F, kernel)
        feats.append(filtered.mean())
        feats.append(filtered.std())
    return np.array(feats)


def extract_all_features(img_float):
    """Concatenate GLCM + local descriptor (multiblock LBP) + Gabor."""
    glcm_feats = extract_glcm_features(img_float)
    gabor_feats = extract_gabor_features(img_float)

    if FEATURE_TYPE == "multiblock":
        local_feats = extract_multiblock_lbp(img_float)
    else:
        raise ValueError(
            f"FEATURE_TYPE={FEATURE_TYPE!r} has no extractor wired up in "
            "features.py — only 'multiblock' was ported from the notebook. "
            "Add the matching extractor if you trained with a different type."
        )

    return np.concatenate([glcm_feats, local_feats, gabor_feats])
