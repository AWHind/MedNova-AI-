from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from typing import List

# 🟢 API init
app = FastAPI(title="MedNova API", version="1.0")

# 🔗 SQL Server connection
engine = create_engine(
    "mssql+pyodbc://@HIND\\SQLEXPRESS/mednova_db?trusted_connection=yes&driver=ODBC+Driver+17+for+SQL+Server"
)

# 🧠 Data model (validation)
class PatientData(BaseModel):
    age: int = Field(..., gt=0, lt=120)


# 🟢 Home
@app.get("/")
def home():
    return {"message": "MedNova API is running 🚀"}


# 🟦 KPIs dynamic from SQL
@app.get("/dashboard/kpis")
def get_kpis():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 
                    COUNT(*) as total_patients,
                    AVG(age) as avg_age,
                    SUM(CASE WHEN risk = 'high' THEN 1 ELSE 0 END) as high_risk
                FROM dbo.predictions
            """))
            row = result.fetchone()

        return {
            "total_patients": row[0],
            "avg_age": float(row[1]) if row[1] else 0,
            "high_risk": row[2]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🟡 Prediction + save to SQL
@app.post("/predict/complication")
def predict(data: PatientData):
    try:
        age = data.age

        # simple ML logic (placeholder)
        risk = "high" if age > 60 else "low"

        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO dbo.predictions (age, risk)
                VALUES (:age, :risk)
            """), {"age": age, "risk": risk})
            conn.commit()

        return {
            "age": age,
            "risk": risk,
            "message": "Saved in database ✅"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🟣 Get all predictions
@app.get("/predictions", response_model=List[dict])
def get_predictions():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM dbo.predictions"))
            rows = result.fetchall()

        return [
            {"id": r[0], "age": r[1], "risk": r[2]}
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔴 Delete prediction
@app.delete("/predictions/{id}")
def delete_prediction(id: int):
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                DELETE FROM dbo.predictions WHERE id = :id
            """), {"id": id})
            conn.commit()

        return {"message": f"Prediction {id} deleted ✅"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🟠 Export data
@app.get("/export")
def export_data():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM dbo.predictions"))
            rows = result.fetchall()

        return [
            {"id": r[0], "age": r[1], "risk": r[2]}
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))