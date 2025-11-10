import os
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

# ------------------------
# FastAPI SETUP
# ------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origins in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Pydantic Schemas
# ------------------------
class Trainset(BaseModel):
    id: str
    name: str
    fitness_status: str
    job_cards_open: int
    branding_hours: int
    mileage_km: int
    cleaning_status: str
    stabling_position: int
    status: str

class OptimizationRequest(BaseModel):
    target_ready: int = 15
    target_standby: int = 5
    target_maintenance: int = 5

class OptimizationResponse(BaseModel):
    ready: List[str]
    standby: List[str]
    maintenance: List[str]

# ------------------------
# Data and Model Setup
# ------------------------
CSV_FILE = "train_nightly_inductions.csv"
if not os.path.exists(CSV_FILE):
    np.random.seed(42)
    n = 25
    df = pd.DataFrame({
        "id": [f"Rake-{i+1:02d}" for i in range(n)],
        "name": [f"Rake-{i+1:02d}" for i in range(n)],
        "fitness_status": np.random.choice(["Valid", "Expiring", "Expired"], n),
        "job_cards_open": np.random.randint(0, 5, n),
        "branding_hours": np.random.randint(0, 300, n),
        "mileage_km": np.random.randint(10000, 300000, n),
        "cleaning_status": np.random.choice(["Complete", "Pending", "In Progress"], n),
        "stabling_position": np.random.randint(1, 26, n),
        "status": np.random.choice(["Ready", "Standby", "Maintenance"], n)
    })
    df.to_csv(CSV_FILE, index=False)
else:
    df = pd.read_csv(CSV_FILE)
    # Ensure fitness_status column exists
    if "fitness_status" not in df.columns and "fitness" in df.columns:
        df["fitness_status"] = df["fitness"]

# Prepare data for ML model
def build_model():
    # Use features available in the dataset
    feature_cols = ["job_cards_open", "branding_hours", "mileage_km", "stabling_position"]
    X = df[feature_cols]
    y = df["status"]
    # Encode target labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    model = lgb.LGBMClassifier(
        objective="multiclass",
        num_class=len(le.classes_),
        learning_rate=0.1,
        n_estimators=200,
        max_depth=-1,
        min_data_in_leaf=2,
        random_state=42
    )
    model.fit(
        X_train,
        y_train,
        eval_set=[(X_test, y_test)],
        eval_metric="multi_logloss",
        callbacks=[lgb.early_stopping(stopping_rounds=30, verbose=False)]
    )
    return model, le, feature_cols

model, label_encoder, feature_cols = build_model()

# ------------------------
# FastAPI Endpoints
# ------------------------
@app.get("/")
def root():
    return {"message": "Kochi Metro Induction Dashboard backend running!"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/trainsets", response_model=List[Trainset])
def get_trainsets():
    return df.to_dict(orient="records")

@app.post("/optimize", response_model=OptimizationResponse)
def optimize_fleet(request: OptimizationRequest):
    X_model = df[feature_cols].copy()
    proba = model.predict_proba(X_model)
    classes = label_encoder.classes_
    # Find index for "Ready", "Standby", "Maintenance" mapped to your label classes
    # Assuming mapping: Ready=0, Standby=1, Maintenance=2, else adjust accordingly
    # Here we assume the model classes correspond to status in label_encoder

    # Calculate probabilities for "Ready" (or equivalent) class
    # For demo, assign based on highest probability class prediction to match frontend statuses
    pred_labels = label_encoder.inverse_transform(np.argmax(proba, axis=1))
    df_copy = df.copy()
    df_copy["pred_status"] = pred_labels
    # Rank trains by probability of their predicted class
    # For simplicity, sort by probability for "Ready" class (adjust if needed)
    ready_idx = np.where(classes == "Ready")[0][0] if "Ready" in classes else 0
    df_copy["prob_ready"] = proba[:, ready_idx]
    sorted_df = df_copy.sort_values(by="prob_ready", ascending=False)

    ready_list = sorted_df.head(request.target_ready)["id"].tolist()
    standby_list = sorted_df.iloc[request.target_ready:request.target_ready+request.target_standby]["id"].tolist()
    maintenance_list = sorted_df.iloc[request.target_ready+request.target_standby:
                                      request.target_ready+request.target_standby+request.target_maintenance]["id"].tolist()

    return {
        "ready": ready_list,
        "standby": standby_list,
        "maintenance": maintenance_list
    }
