import pandas as pd
from sqlalchemy import create_engine

# قراءة CSV
df = pd.read_csv("support2.csv", encoding="latin1")

print("Data loaded:", df.shape)

# connection SQL Server
engine = create_engine(
    "mssql+pyodbc://HIND\\SQLEXPRESS/mednova_db?driver=ODBC+Driver+17+for+SQL+Server"
)

# إدخال data
df.to_sql("patients", engine, if_exists="replace", index=False)

print("✅ Data inserted successfully!")