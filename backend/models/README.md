# Model artifacts

This folder is intentionally empty in git (binaries are gitignored). Copy your
trained artifacts here before running the API locally or building the Docker
image:

```
backend/models/
├── svm_model.pkl
├── rf_model.pkl
├── logistic_model.pkl
├── xgb_model.pkl
├── scaler.pkl
└── best_cnn.pth
```

These are produced by `notebooks/blood_group_fingerprint_training.ipynb`
(STEP 6 saves the `.pkl` files, STEP 7 saves `best_cnn.pth`).

### Getting them into git / your deploy target

`best_cnn.pth` (ResNet18) is typically 40-45MB and the `.pkl` files are
usually a few MB each — under GitHub's 100MB hard limit, so a normal
`git add` works. If any file is close to or over 100MB:

- Use [Git LFS](https://git-lfs.com/): `git lfs track "*.pth" "*.pkl"` before
  committing, or
- Host the files externally (Hugging Face Hub, S3, a GitHub Release asset)
  and download them at container start instead of committing them.

For Render/Railway/Fly.io deploys, the simplest path is committing the files
directly (with Git LFS if needed) since it keeps the Dockerfile above dead
simple.
