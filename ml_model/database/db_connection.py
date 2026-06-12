import sys
from sqlalchemy import create_engine
import pandas as pd


# -------------------------
# === Database Connection ===
# -------------------------

DATABASE_URL = "postgresql://neondb_owner:npg_wpNc8tA3aWov@ep-polished-haze-aolhlk96-pooler.c-2.ap-southeast-1.aws.neon.tech/financial_advisor?sslmode=require&channel_binding=require"

# DATABASE_URL = "postgresql://postgres:THIS_IS_DEFINITELY_WRONG_123456@localhost:5432/financial_advisor"

try:
    engine = create_engine(DATABASE_URL)
except Exception as e:
    print(f"[ERROR] Failed to create database engine: {e}")
    sys.exit(1)


# -------------------------
# === Database Functions ===
# -------------------------
# -- test connection

def test_connection():
    try:
        with engine.connect():
            print("✅ Database Connected Successfully")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        sys.exit(1)


# -- fetch data

def fetch_data(query):
    try:
        return pd.read_sql(query, engine)
    except Exception as e:
        print(f"[ERROR] Failed to fetch data: {e}")
        return None


# -------------------------
# === Test Database ===
# -------------------------

test_connection()

tables = [
    "users",
    "departments",
    "expense_categories",
    "expenses",
    "revenue",
    "budgets"
]

print("\n=== TABLE SHAPES ===")

for table in tables:
    df = fetch_data(f"SELECT * FROM {table};")

    if df is not None:
        print(f"{table:<20} {df.shape}")
    else:
        print(f"{table:<20} FAILED")