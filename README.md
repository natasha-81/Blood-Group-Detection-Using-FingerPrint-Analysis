# HemaType — Blood Group Prediction from Fingerprint Ridge Texture

A research/portfolio project that predicts ABO/Rh blood group (8 classes: A+, A-, B+,
B-, AB+, AB-, O+, O-) from a fingerprint image, using a **late-fusion ensemble** of
hand-crafted texture features and a CNN.

**97.94% accuracy** on a held-out test split (1,600 images), beating every individual
model in the ensemble (best single model: SVM at 96.81%).

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
        154-dim feature vector                  │
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
| Logistic Regression   | 85.50% |
| CNN (ResNet18)         | 92.25% |
| Random Forest          | 94.62% |
| XGBoost                | 95.69% |
| SVM (RBF kernel)       | 96.81% |
| **Late fusion (all 5)** | **97.94%** |

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

## Running locally

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# copy your trained model files into backend/models/ first — see backend/models/README.md
python app.py   # http://localhost:5000
```

Check it's up: `curl http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, proxies /api to localhost:5000
```

## Deploying

**Backend → Render (or Railway/Fly.io):**
1. Push this repo to GitHub (see below).
2. On Render: New → Web Service → connect the repo → it will pick up `render.yaml`
   automatically (Docker runtime, builds from `backend/Dockerfile`).
3. Note the deployed URL, e.g. `https://hematype-backend.onrender.com`.

**Frontend → Vercel:**
1. New Project → import the repo → set **root directory** to `frontend`.
2. Add env var `VITE_API_BASE_URL` = your Render backend URL from step above.
3. Deploy. Vercel picks up `frontend/vercel.json` for build settings automatically.

## API

`POST /api/predict` — multipart form, field `image` (PNG/JPG/BMP/TIF, ≤8MB)

```json
{
  "prediction": "B+",
  "confidence": 98.42,
  "class_probabilities": { "A+": 0.4, "A-": 0.1, "...": "..." },
  "per_model": {
    "cnn": { "prediction": "B+", "confidence": 94.1 },
    "svm": { "prediction": "B+", "confidence": 99.0 },
    "...": "..."
  }
}
```

`GET /api/health` — `{ "status": "ok" }` once model artifacts are loaded.

## Pushing this to GitHub

```bash
cd blood-group-fingerprint
git init
git add .
git commit -m "Initial commit: blood group fingerprint classifier + web demo"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Model binaries under `backend/models/` are gitignored by default — see
`backend/models/README.md` for how to include them (plain `git add -f` works fine
since they're under GitHub's 100MB limit; use Git LFS only if you retrain into
something larger).

## Disclaimer

This is a research/portfolio project, not a validated diagnostic or forensic tool.
Predictions should not be used for medical decisions.

## License

MIT — see [LICENSE](LICENSE).
