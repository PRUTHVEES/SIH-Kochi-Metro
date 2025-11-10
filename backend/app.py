import os
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import shap
import matplotlib.pyplot as plt

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# ------------------------
# --- FastAPI SETUP ---
# ------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # In production, restrict this!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# --- ML TRAINING LOGIC (run once at startup) ---
# ------------------------
CSV_FILE = "train_nightly_inductions.csv"
if not os.path.exists(CSV_FILE):
    np.random.seed(42)
    n = 500
    df = pd.DataFrame({
        "mileage_km": np.random.randint(10000, 300000, n),
        "days_since_last_maintenance": np.random.randint(1, 365, n),
        "cert_validity_days": np.random.randint(0, 365, n),
        "stabling_distance_km": np.random.uniform(0.5, 100.0, n).round(2),
        "position_score": np.random.randint(1, 10, n),
        "train_age_years": np.random.randint(1, 30, n),
        "route_type": np.random.choice(["Mainline", "Branch", "Suburban"], n)
    })
    conditions = [
        (df["cert_validity_days"] < 30) | (df["days_since_last_maintenance"] > 300),
        (df["mileage_km"] > 250000) | (df["train_age_years"] > 25),
        (df["stabling_distance_km"] < 20) & (df["position_score"] > 5)
    ]
    choices = ["Reject", "Defer", "Assign"]
    df["Decision"] = np.select(conditions, choices, default="Assign")
    df.to_csv(CSV_FILE, index=False)
    print("✅ Synthetic CSV created:", CSV_FILE)

df = pd.read_csv(CSV_FILE)
X = df.drop(columns=["Decision"])
y = df["Decision"]

cat_cols = [c for c in X.columns if X[c].dtype == "object"]
for c in cat_cols:
    X[c] = LabelEncoder().fit_transform(X[c])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = lgb.LGBMClassifier(
    objective="multiclass",
    num_class=len(y.unique()),
    learning_rate=0.1,
    n_estimators=200,
    max_depth=-1,
    min_data_in_leaf=1,
    min_data_in_bin=1,
    random_state=42
)

model.fit(
    X_train,
    y_train,
    eval_set=[(X_test, y_test)],
    eval_metric="multi_logloss",
    callbacks=[lgb.early_stopping(stopping_rounds=30), lgb.log_evaluation(50)]
)

probs = model.predict_proba(X_test)
class_labels = model.classes_
assign_index = list(class_labels).index("Assign")

df_scores = X_test.copy()
df_scores["prob_assign"] = probs[:, assign_index]
df_scores["predicted_class"] = model.predict(X_test)
df_ranked = df_scores.sort_values(by="prob_assign", ascending=False)
df_ranked.reset_index(drop=True, inplace=True)

# Make sure to store index for easy JSON serialization
df_ranked['index'] = df_ranked.index

# ------------------------
# --- FastAPI ENDPOINTS ---
# ------------------------

@app.get("/")
def root():
    return {"message": "Kochi Metro AI Dashboard API is running"}

@app.get("/ranked_trains")
def ranked_trains(topk: int = 10):
    # Return top k ranked trains as JSON
    return df_ranked.head(topk).to_dict(orient="records")

@app.get("/feature_importance")
def feature_importance():
    importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
    return importances.to_dict()

@app.get("/classification_report")
def clf_report():
    preds = model.predict(X_test)
    report = classification_report(y_test, preds, zero_division=0, output_dict=True)
    return report

# Plot endpoints (optional, for debugging/analytics)
@app.get("/plot/feature_importance")
def plot_feature_importance():
    import matplotlib.pyplot as plt
    import io, base64
    importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=True)
    fig, ax = plt.subplots(figsize=(8,5))
    importances.plot(kind='barh', ax=ax)
    ax.set_title("LightGBM Feature Importance")
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return {"image_base64": encoded}
