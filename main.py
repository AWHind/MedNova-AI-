"""
MedNova AI — FastAPI Backend Complet
Semaine 7 — Tous les endpoints opérationnels
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from typing import List, Optional
import joblib
import shap
import numpy as np
import pandas as pd
import io
import os
import json
import mlflow
from datetime import datetime

# ─────────────────────────────────────────────
# 🟢 APP INIT
# ─────────────────────────────────────────────
app = FastAPI(
    title="MedNova AI API",
    description="Plateforme d'aide à la décision médicale — SUPPORT2 Dataset",
    version="1.0.0"
)

# CORS — autorise le frontend React (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# 🔗 SQL SERVER CONNECTION
# ─────────────────────────────────────────────
engine = create_engine(
    "mssql+pyodbc://@HIND\\SQLEXPRESS/mednova_db"
    "?trusted_connection=yes"
    "&driver=ODBC+Driver+17+for+SQL+Server",
    pool_pre_ping=True,        # re-teste la connexion avant chaque requête
    pool_recycle=3600,         # recycle les connexions toutes les heures
)

# ─────────────────────────────────────────────
# 🧠 CHARGEMENT DES MODÈLES ML
# ─────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def load_model(name: str):
    path = os.path.join(MODELS_DIR, f"{name}.pkl")
    if os.path.exists(path):
        return joblib.load(path)
    return None

# Chargement au démarrage
models = {
    "xgboost":          load_model("xgboost_model"),
    "lightgbm":         load_model("lightgbm_model"),
    "gradient_boosting": load_model("gb_model"),
    "random_forest":    load_model("rf_model"),
    "logistic":         load_model("lr_model"),
}
scaler       = load_model("scaler")          # StandardScaler
encoder      = load_model("label_encoder")   # LabelEncoder dzgroup
best_model   = models.get("xgboost") or next((m for m in models.values() if m), None)

# Features dans le bon ordre (identique au training)
FEATURE_COLS = [
    "age", "sex_encoded", "num_co", "avtisst", "wblc", "hrt",
    "resp", "temp", "meanbp", "crea", "sod", "ph",
    "glucose", "bun", "urine", "adlp", "adls", "edu",
    "dzgroup_encoded", "income_encoded",
]

# ─────────────────────────────────────────────
# 📦 SCHEMAS PYDANTIC
# ─────────────────────────────────────────────
class PatientData(BaseModel):
    age:        int     = Field(..., gt=0,   lt=120, example=65)
    sex:        str     = Field(...,                  example="male")
    dzgroup:    str     = Field(...,                  example="ARF/MOSF w/Sepsis")
    num_co:     int     = Field(0,  ge=0,   le=15,   example=2)
    edu:        float   = Field(12, ge=0,   le=20,   example=12)
    income:     str     = Field("under $11k",         example="under $11k")
    avtisst:    float   = Field(...,                  example=50.0)
    wblc:       float   = Field(...,                  example=8.5)
    hrt:        float   = Field(...,                  example=90.0)
    resp:       float   = Field(...,                  example=20.0)
    temp:       float   = Field(...,                  example=37.2)
    meanbp:     float   = Field(...,                  example=85.0)
    crea:       float   = Field(...,                  example=1.2)
    sod:        float   = Field(...,                  example=138.0)
    ph:         float   = Field(...,                  example=7.38)
    glucose:    float   = Field(...,                  example=110.0)
    bun:        float   = Field(...,                  example=18.0)
    urine:      float   = Field(...,                  example=1200.0)
    adlp:       float   = Field(4,                    example=4.0)
    adls:       float   = Field(4,                    example=4.0)

class WhatIfRequest(BaseModel):
    base_patient: PatientData
    modifications: dict  # ex: {"age": 70, "meanbp": 70}

# ─────────────────────────────────────────────
# 🔧 HELPERS
# ─────────────────────────────────────────────
SEX_MAP    = {"male": 1, "female": 0}
INCOME_MAP = {"under $11k": 0, "$11-$25k": 1, "$25-$50k": 2, ">$50k": 3}

def encode_patient(data: PatientData) -> np.ndarray:
    """Encode + scale un patient pour prédiction."""
    dzgroup_enc = 0
    if encoder:
        try:
            dzgroup_enc = int(encoder.transform([data.dzgroup])[0])
        except Exception:
            dzgroup_enc = 0

    row = [
        data.age,
        SEX_MAP.get(data.sex.lower(), 0),
        data.num_co,
        data.avtisst,
        data.wblc,
        data.hrt,
        data.resp,
        data.temp,
        data.meanbp,
        data.crea,
        data.sod,
        data.ph,
        data.glucose,
        data.bun,
        data.urine,
        data.adlp,
        data.adls,
        data.edu,
        dzgroup_enc,
        INCOME_MAP.get(data.income, 0),
    ]
    X = np.array([row], dtype=float)
    if scaler:
        X = scaler.transform(X)
    return X


def save_prediction_to_db(data: PatientData, risk_score: float, prediction: str, model_name: str):
    """Insère la prédiction dans dbo.predictions."""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO dbo.predictions
                    (age, sex, dzgroup, num_co, meanbp, avtisst, risk_score, risk, model_used, created_at)
                VALUES
                    (:age, :sex, :dzgroup, :num_co, :meanbp, :avtisst, :risk_score, :risk, :model, :ts)
            """), {
                "age":        data.age,
                "sex":        data.sex,
                "dzgroup":    data.dzgroup,
                "num_co":     data.num_co,
                "meanbp":     data.meanbp,
                "avtisst":    data.avtisst,
                "risk_score": round(float(risk_score), 4),
                "risk":       prediction,
                "model":      model_name,
                "ts":         datetime.now(),
            })
            conn.commit()
    except Exception as e:
        print(f"[DB WARNING] Could not save prediction: {e}")


# ─────────────────────────────────────────────
# 🟢 ROUTES
# ─────────────────────────────────────────────

@app.get("/", tags=["General"])
def home():
    return {
        "message": "MedNova AI API is running 🚀",
        "version": "1.0.0",
        "endpoints": [
            "/predict/complication",
            "/predict/treatment",
            "/explain/shap",
            "/cluster/data",
            "/dashboard/kpis",
            "/models/runs",
            "/admin/predictions",
            "/admin/export",
            "/admin/logs",
        ]
    }


# ─── PREDICT COMPLICATION ─────────────────────
@app.post("/predict/complication", tags=["Prediction"])
def predict_complication(data: PatientData):
    """
    Prédit le risque de complication (décès 30j OU réadmission).
    Utilise XGBoost par défaut (meilleur AUC).
    """
    if best_model is None:
        # Fallback logique simple si modèles non chargés
        score = min(0.95, max(0.05,
            0.30
            + (data.age - 60) * 0.004
            + (85 - data.meanbp) * 0.003
            + (data.avtisst - 50) * 0.003
            + (data.crea - 1.2) * 0.08
        ))
        prediction = "high" if score > 0.5 else "low"
        save_prediction_to_db(data, score, prediction, "fallback")
        return {
            "risk_score":  round(score, 4),
            "prediction":  prediction,
            "model":       "fallback (modèle non chargé)",
            "confidence":  round(max(score, 1 - score), 3),
        }

    X = encode_patient(data)
    risk_score  = float(best_model.predict_proba(X)[0][1])
    prediction  = "high" if risk_score > 0.5 else "low"
    confidence  = float(max(best_model.predict_proba(X)[0]))

    save_prediction_to_db(data, risk_score, prediction, "xgboost")

    return {
        "risk_score":  round(risk_score, 4),
        "prediction":  prediction,
        "model":       "XGBoost",
        "confidence":  round(confidence, 3),
    }


# ─── PREDICT TREATMENT ───────────────────────
@app.post("/predict/treatment", tags=["Prediction"])
def predict_treatment(data: PatientData):
    """
    Recommande le type de traitement selon le profil patient.
    """
    # Score de base
    if best_model:
        X = encode_patient(data)
        score = float(best_model.predict_proba(X)[0][1])
    else:
        score = 0.3 + (data.age - 60) * 0.004 + (data.crea - 1.2) * 0.08

    # Règles de recommandation
    if score > 0.75:
        treatment = "Soins intensifs (ICU)"
        priority  = "Urgent"
    elif score > 0.5:
        treatment = "Hospitalisation surveillée"
        priority  = "Élevée"
    elif score > 0.3:
        treatment = "Suivi ambulatoire renforcé"
        priority  = "Modérée"
    else:
        treatment = "Suivi standard"
        priority  = "Faible"

    return {
        "recommended_treatment": treatment,
        "priority":              priority,
        "risk_score":            round(score, 4),
        "rationale":             f"Score de risque {round(score*100, 1)}% — {data.dzgroup}",
    }


# ─── EXPLAIN SHAP ────────────────────────────
@app.post("/explain/shap", tags=["Explainability"])
def explain_shap(data: PatientData):
    """
    Retourne les valeurs SHAP pour expliquer la prédiction.
    """
    if best_model is None:
        # Valeurs SHAP simulées si modèle absent
        shap_dict = {
            "avtisst": 0.32,  "meanbp": -0.24, "age": 0.18,
            "crea":    0.15,  "wblc":    0.12, "temp": -0.09,
            "hrt":     0.08,  "num_co":  0.07, "ph":   -0.06,
            "glucose": 0.05,  "bun":     0.04, "sod":  -0.03,
        }
        return {
            "shap_values":   shap_dict,
            "base_value":    0.3,
            "prediction":    0.72,
            "top_feature":   "avtisst",
            "note":          "Valeurs simulées — modèle non chargé",
        }

    X = encode_patient(data)

    try:
        explainer  = shap.TreeExplainer(best_model)
        shap_vals  = explainer.shap_values(X)

        # Pour classification binaire, shap_values peut être une liste
        if isinstance(shap_vals, list):
            sv = shap_vals[1][0]   # classe 1 (high risk)
        else:
            sv = shap_vals[0]

        shap_dict = {
            col: round(float(v), 4)
            for col, v in zip(FEATURE_COLS, sv)
        }

        top_feature = max(shap_dict, key=lambda k: abs(shap_dict[k]))

        return {
            "shap_values": shap_dict,
            "base_value":  round(float(explainer.expected_value
                                       if not isinstance(explainer.expected_value, list)
                                       else explainer.expected_value[1]), 4),
            "prediction":  round(float(best_model.predict_proba(X)[0][1]), 4),
            "top_feature": top_feature,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP error: {str(e)}")


# ─── CLUSTER DATA ─────────────────────────────
@app.get("/cluster/data", tags=["Clustering"])
def get_cluster_data():
    """
    Retourne les patients avec leurs clusters K-Means depuis SQL Server.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT TOP 200
                    p.id, p.age, p.meanbp, p.avtisst, p.crea,
                    p.dzgroup, p.sex,
                    pr.risk as risk,
                    pr.risk_score,
                    COALESCE(p.cluster_id, ABS(CHECKSUM(p.id)) % 4) as cluster
                FROM dbo.patients p
                LEFT JOIN dbo.predictions pr ON p.id = pr.patient_id
                ORDER BY p.id
            """))
            rows = result.fetchall()

        return {
            "patients": [
                {
                    "id":         r[0],
                    "age":        r[1],
                    "meanbp":     float(r[2]) if r[2] else 0,
                    "avtisst":    float(r[3]) if r[3] else 0,
                    "crea":       float(r[4]) if r[4] else 1.0,
                    "dzgroup":    r[5] or "",
                    "sex":        r[6] or "unknown",
                    "risk":       r[7] or "low",
                    "risk_score": float(r[8]) if r[8] else 0.0,
                    "cluster":    int(r[9]) if r[9] is not None else 0,
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── DASHBOARD KPIs ───────────────────────────
@app.get("/dashboard/kpis", tags=["Dashboard"])
def get_kpis():
    """
    KPIs dynamiques pour le Dashboard BI (Page 3 React).
    """
    try:
        with engine.connect() as conn:
            row = conn.execute(text("""
                SELECT
                    COUNT(*)                                              AS total_patients,
                    AVG(CAST(age AS FLOAT))                              AS avg_age,
                    AVG(CAST(meanbp AS FLOAT))                           AS avg_bp,
                    AVG(CAST(risk_score AS FLOAT))                       AS avg_risk_score,
                    SUM(CASE WHEN risk = 'high' THEN 1 ELSE 0 END)       AS high_risk,
                    SUM(CASE WHEN risk = 'low'  THEN 1 ELSE 0 END)       AS low_risk,
                    AVG(CAST(CASE WHEN risk = 'high' THEN 1.0 ELSE 0.0 END AS FLOAT)) AS death_rate
                FROM dbo.predictions
            """)).fetchone()

        return {
            "total_patients": int(row[0]),
            "avg_age":        round(float(row[1] or 0), 2),
            "avg_bp":         round(float(row[2] or 0), 2),
            "avg_risk_score": round(float(row[3] or 0), 4),
            "high_risk":      int(row[4] or 0),
            "low_risk":       int(row[5] or 0),
            "death_rate":     round(float(row[6] or 0), 4),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── MODELS RUNS (MLflow) ─────────────────────
@app.get("/models/runs", tags=["Models"])
def get_model_runs():
    """
    Retourne l'historique des runs MLflow depuis dbo.model_runs.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT TOP 20
                    run_id, model_name, auc_roc, f1_score,
                    accuracy, precision_score, recall_score,
                    run_date, status, duration_seconds
                FROM dbo.model_runs
                ORDER BY run_date DESC
            """))
            rows = result.fetchall()

        return {
            "runs": [
                {
                    "run_id":    r[0],
                    "model":     r[1],
                    "auc":       round(float(r[2] or 0), 4),
                    "f1":        round(float(r[3] or 0), 4),
                    "accuracy":  round(float(r[4] or 0), 4),
                    "precision": round(float(r[5] or 0), 4),
                    "recall":    round(float(r[6] or 0), 4),
                    "run_date":  str(r[7]),
                    "status":    r[8] or "FINISHED",
                    "duration":  f"{int(r[9] or 0) // 60}m {int(r[9] or 0) % 60}s",
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ADMIN: HISTORIQUE PRÉDICTIONS ────────────
@app.get("/admin/predictions", tags=["Admin"])
def get_predictions_history(
    limit:  int = Query(50,  ge=1, le=500),
    offset: int = Query(0,   ge=0),
    risk:   Optional[str] = Query(None, description="high | low"),
    model:  Optional[str] = Query(None),
):
    """
    Historique complet des prédictions depuis SQL Server.
    Supporte pagination + filtres.
    """
    try:
        filters = []
        params  = {"limit": limit, "offset": offset}

        if risk in ("high", "low"):
            filters.append("risk = :risk")
            params["risk"] = risk
        if model:
            filters.append("model_used = :model")
            params["model"] = model

        where = ("WHERE " + " AND ".join(filters)) if filters else ""

        with engine.connect() as conn:
            result = conn.execute(text(f"""
                SELECT id, age, sex, dzgroup, meanbp, avtisst,
                       risk_score, risk, model_used, created_at
                FROM dbo.predictions
                {where}
                ORDER BY created_at DESC
                OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
            """), params)
            rows = result.fetchall()

            total = conn.execute(text(
                f"SELECT COUNT(*) FROM dbo.predictions {where}"), params
            ).scalar()

        return {
            "total":       int(total),
            "limit":       limit,
            "offset":      offset,
            "predictions": [
                {
                    "id":         r[0],
                    "age":        r[1],
                    "sex":        r[2],
                    "dzgroup":    r[3],
                    "meanbp":     float(r[4] or 0),
                    "avtisst":    float(r[5] or 0),
                    "risk_score": round(float(r[6] or 0), 4),
                    "prediction": r[7],
                    "model":      r[8],
                    "created_at": str(r[9]),
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ADMIN: DELETE ────────────────────────────
@app.delete("/admin/predictions/{pred_id}", tags=["Admin"])
def delete_prediction(pred_id: int):
    try:
        with engine.connect() as conn:
            conn.execute(
                text("DELETE FROM dbo.predictions WHERE id = :id"),
                {"id": pred_id}
            )
            conn.commit()
        return {"message": f"Prediction {pred_id} supprimée ✅"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ADMIN: EXPORT CSV / JSON ─────────────────
@app.get("/admin/export", tags=["Admin"])
def export_data(format: str = Query("csv", description="csv | json")):
    """
    Exporte toutes les prédictions en CSV ou JSON.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT id, age, sex, dzgroup, meanbp, avtisst, "
                "risk_score, risk, model_used, created_at "
                "FROM dbo.predictions ORDER BY created_at DESC"
            ))
            rows = result.fetchall()

        data = [
            {
                "id": r[0], "age": r[1], "sex": r[2], "dzgroup": r[3],
                "meanbp": float(r[4] or 0), "avtisst": float(r[5] or 0),
                "risk_score": round(float(r[6] or 0), 4),
                "risk": r[7], "model_used": r[8], "created_at": str(r[9]),
            }
            for r in rows
        ]

        if format == "json":
            content = json.dumps(data, ensure_ascii=False, indent=2)
            return StreamingResponse(
                io.StringIO(content),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=mednova_predictions.json"}
            )

        # CSV par défaut
        df  = pd.DataFrame(data)
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=mednova_predictions.csv"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ADMIN: LOGS ──────────────────────────────
@app.get("/admin/logs", tags=["Admin"])
def get_logs():
    """
    Retourne les derniers logs depuis dbo.kpi_history ou fichier log.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT TOP 50
                    log_date, log_level, message
                FROM dbo.api_logs
                ORDER BY log_date DESC
            """))
            rows = result.fetchall()

        return {
            "logs": [
                {
                    "ts":      str(r[0]),
                    "level":   r[1] or "INFO",
                    "message": r[2] or "",
                }
                for r in rows
            ]
        }
    except Exception:
        # Si table api_logs n'existe pas, retourne logs statiques
        return {
            "logs": [
                {"ts": str(datetime.now()), "level": "INFO",
                 "message": "MedNova API running — SQL logs not configured"},
                {"ts": str(datetime.now()), "level": "WARNING",
                 "message": "Table api_logs not found — using fallback"},
            ]
        }


# ─── WHAT-IF SIMULATOR ────────────────────────
@app.post("/simulate/whatif", tags=["Simulation"])
def simulate_whatif(req: WhatIfRequest):
    """
    Simule l'impact de modifications sur le score de risque.
    Compare le score original vs modifié.
    """
    # Score original
    X_orig = encode_patient(req.base_patient)
    if best_model:
        score_orig = float(best_model.predict_proba(X_orig)[0][1])
    else:
        score_orig = 0.5

    # Appliquer les modifications
    modified = req.base_patient.model_copy(update=req.modifications)
    X_mod = encode_patient(modified)
    if best_model:
        score_mod = float(best_model.predict_proba(X_mod)[0][1])
    else:
        score_mod = max(0.05, min(0.95, score_orig + sum(
            (v - getattr(req.base_patient, k, v)) * 0.01
            for k, v in req.modifications.items()
            if isinstance(v, (int, float))
        )))

    delta = score_mod - score_orig
    return {
        "original_score":  round(score_orig, 4),
        "modified_score":  round(score_mod, 4),
        "delta":           round(delta, 4),
        "delta_pct":       round(delta * 100, 2),
        "impact":          "augmente" if delta > 0.01 else "réduit" if delta < -0.01 else "stable",
        "modifications":   req.modifications,
    }