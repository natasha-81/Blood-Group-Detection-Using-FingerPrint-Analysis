# Blood Group Prediction from Fingerprint Ridge Texture
**🔗 Live demo:** https://blood-group-detection-using-finger.vercel.app

A research/portfolio project that predicts ABO/Rh blood group (8 classes: A+, A-, B+,
B-, AB+, AB-, O+, O-) from a fingerprint image, using a **late-fusion ensemble** of
hand-crafted texture features and a CNN.

**97.2% accuracy** on a held-out test split (1,600 images), beating every individual
model in the ensemble.

```
                    ┌─────────────────────┐
                    │  Fingerprint image  │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                             ▼
      CLAHE-enhanced grayscale          RGB tensor (128x128)
                 │                             │
    ┌────────────┼────────────┐                │
    ▼            ▼            ▼                ▼
  GLCM      Multi-block    Gabor           ResNet18
 (texture)   LBP (ridges)  (orientation)   (transfer learning)
    └────────────┴────────────┘                │
                 │                              │
        176-dim feature vector                  │
                 │                              │
   ┌──────┬──────┼──────┬──────┐                │
   ▼      ▼      ▼      ▼      ▼                │
  SVM     RF     LR    XGB   (scaled)            │
   └──────┴──────┴──────┴──────┴─────────────────┘
                      │
              Weighted late fusion
           (weights = per-model val accuracy)
                      │
                      ▼
            Predicted blood group + confidence
```

## Results

| Model                | Test accuracy |
|-----------------------|:---:|
| Logistic Regression   | 86.0% |
| CNN (ResNet18)         | 97.2% |
| Random Forest          | 94.3% |
| XGBoost                | 95.4% |
| SVM (RBF kernel)       | 96.2% |
| **Late fusion (all 5)** | **97.2%** |

Trained on 8,000 fingerprint images (1,000 per class) with a stratified 80/20
train/test split. Full classification reports, confusion matrices, and Grad-CAM
visualisations of what the CNN attends to are in the training notebook.

## Repo structure

```
.
├── notebooks/
│   └── blood_group_fingerprint_training.ipynb   # full training pipeline (Colab)
├── backend/                                      # Flask inference API
│   ├── app.py            # /api/predict, /api/health
│   ├── inference.py      # model loading + late-fusion logic
│   ├── features.py       # CLAHE + GLCM/LBP/Gabor feature extraction (ported from notebook)
│   ├── config.py         # class labels, fusion weights, paths
│   ├── models/            # trained artifacts go here (gitignored, see models/README.md)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                                     # React (Vite) demo UI
│   └── src/
├── render.yaml            # backend deploy config (Render)
└── frontend/vercel.json   # frontend deploy config (Vercel)
```

## Tech stack

- **Feature engineering:** OpenCV (CLAHE), scikit-image (GLCM, multi-block LBP, Gabor filters)
- **Classical ML:** scikit-learn (SVM, Random Forest, Logistic Regression), XGBoost
- **Deep learning:** PyTorch, ResNet18 (transfer learning), Grad-CAM for explainability
- **Backend:** Flask + Gunicorn, Dockerized
- **Frontend:** React 18 + Vite, plain CSS (no framework)

## Disclaimer

This is a research/portfolio project, not a validated diagnostic or forensic tool.
Predictions should not be used for medical decisions.

## License

MIT — see [LICENSE](LICENSE).
