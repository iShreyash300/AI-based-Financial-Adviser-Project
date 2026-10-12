import sys
from sqlalchemy import create_engine, text
import pandas as pd


# -------------------------
# === Database Connection ===
# -------------------------

DATABASE_URL = "postgresql://neondb_owner:npg_wpNc8tA3aWov@ep-polished-haze-aolhlk96-pooler.c-2.ap-southeast-1.aws.neon.tech/financial-adviser-v2?sslmode=require&channel_binding=require"

try:
    engine = create_engine(DATABASE_URL)
except Exception as e:
    print(f"[ERROR] Failed to create database engine: {e}")
    sys.exit(1)


# -------------------------
# === Database Functions ===
# -------------------------

def test_connection():
    try:
        with engine.connect():
            print("✅ Database Connected Successfully")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        sys.exit(1)


def fetch_data(query, params=None):
    try:
        with engine.connect() as connection:
            return pd.read_sql(
                text(query),
                connection,
                params=params
            )
    except Exception as e:
        print(f"[ERROR] Failed to fetch data: {e}")
        raise


def execute_query(query, params=None):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text(query),
                params or {}
            )
            connection.commit()
            return result
    except Exception as e:
        print(f"[ERROR] Failed to execute query: {e}")
        raise


# -------------------------
# === Test Database ===
# -------------------------

test_connection()