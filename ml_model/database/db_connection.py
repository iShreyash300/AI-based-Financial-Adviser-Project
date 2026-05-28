from sqlalchemy import create_engine
import pandas as pd

# PostgreSQL Connection URL
DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/financial_advisor"

# Create Engine
engine = create_engine(DATABASE_URL)

# Test Connection
def test_connection():
    try:
        with engine.connect() as conn:
            print("Database Connected Successfully")
    except Exception as e:
        print("Connection Failed:", e)

# Fetch Query Data
def fetch_data(query):
    try:
        df = pd.read_sql(query, engine)
        return df
    except Exception as e:
        print("Error:", e)
        return None

# CALL FUNCTION
test_connection()