import sys
import yfinance as yf
import pandas as pd

from ml_model.database.db_connection import execute_query

try:
    from .market_service import initialize_market_service
except ImportError:
    from market_service import initialize_market_service


# =========================================================
# CONFIGURATION
# =========================================================

DEFAULT_PERIOD = "1y"
DEFAULT_INTERVAL = "1d"

# Indian stock indices available through Yahoo Finance.
INSTRUMENT_MAPPING = {
    "NIFTY 50": {
        "symbol": "^NSEI",
        "instrument_type": "stock_index",
        "exchange": "NSE"
    },
    "BSE SENSEX": {
        "symbol": "^BSESN",
        "instrument_type": "stock_index",
        "exchange": "BSE"
    },
    "NIFTY BANK": {
        "symbol": "^NSEBANK",
        "instrument_type": "stock_index",
        "exchange": "NSE"
    },
    "NIFTY 500": {
        "symbol": "^CRSLDX",
        "instrument_type": "stock_index",
        "exchange": "NSE"
    }
}

# Configure these only after verifying the provider's
# actual Indian commodity symbols and historical coverage.
COMMODITY_MAPPING = {}


# =========================================================
# RESOLVE INSTRUMENT
# =========================================================

def resolve_instrument(instrument_name):
    """
    Return metadata for a supported Indian instrument.
    """

    name = str(instrument_name).strip().upper()

    instrument = (
        INSTRUMENT_MAPPING.get(name)
        or COMMODITY_MAPPING.get(name)
    )

    if instrument is None:
        raise ValueError(
            f"No verified Indian-market mapping for "
            f"'{instrument_name}'. Configure a supported "
            f"Indian data-provider symbol first."
        )

    return instrument


# =========================================================
# FETCH HISTORICAL MARKET DATA
# =========================================================

def fetch_instrument_data(
    instrument_name,
    period=DEFAULT_PERIOD,
    interval=DEFAULT_INTERVAL
):
    """
    Fetch historical daily OHLCV data for one instrument.
    """

    instrument = resolve_instrument(instrument_name)

    symbol = instrument["symbol"]

    print(
        f"\nFetching {instrument_name} "
        f"({symbol})..."
    )

    history = yf.Ticker(symbol).history(
        period=period,
        interval=interval,
        auto_adjust=False
    )

    if history is None or history.empty:
        raise ValueError(
            f"No historical data returned for {instrument_name}."
        )

    history = history.sort_index()

    # Normalize timestamps for the database TIMESTAMP column.
    history.index = pd.to_datetime(history.index)

    if history.index.tz is not None:
        history.index = history.index.tz_localize(None)

    # Derive daily price changes from historical closing prices.
    history["Previous_Close"] = history["Close"].shift(1)

    history["Change"] = (
        history["Close"] - history["Previous_Close"]
    )

    history["Change_Percent"] = (
        history["Change"]
        / history["Previous_Close"]
        * 100
    )

    print(
        f"Fetched {len(history)} historical records "
        f"for {instrument_name}."
    )

    return {
        "instrument_name": instrument_name,
        "symbol": symbol,
        "instrument_type": instrument["instrument_type"],
        "exchange": instrument["exchange"],
        "data": history
    }


# =========================================================
# SAVE MARKET DATA
# =========================================================

def save_market_data(instrument_data):
    """
    Insert or update records in the existing market_data table.

    Uses symbol and timestamp to identify an existing record.
    """

    history = instrument_data["data"]

    metadata = {
        key: instrument_data[key]
        for key in (
            "instrument_name",
            "symbol",
            "instrument_type",
            "exchange"
        )
    }

    saved_count = 0

    for timestamp, row in history.iterrows():

        def get_value(column):
            value = row.get(column)

            if value is None or pd.isna(value):
                return None

            return float(value)

        params = {
            **metadata,
            "timestamp": pd.Timestamp(timestamp).to_pydatetime(),
            "open": get_value("Open"),
            "high": get_value("High"),
            "low": get_value("Low"),
            "close": get_value("Close"),
            "previous_close": get_value("Previous_Close"),
            "change": get_value("Change"),
            "change_percent": get_value("Change_Percent"),
            "volume": get_value("Volume"),
            "source": "Yahoo Finance"
        }

        # Update an existing observation.
        update_query = """
            UPDATE market_data
            SET
                instrument_name = :instrument_name,
                instrument_type = :instrument_type,
                exchange = :exchange,
                open = :open,
                high = :high,
                low = :low,
                close = :close,
                previous_close = :previous_close,
                change = :change,
                change_percent = :change_percent,
                volume = :volume,
                source = :source
            WHERE symbol = :symbol
              AND timestamp = :timestamp;
        """

        result = execute_query(update_query, params)

        if result.rowcount == 0:

            insert_query = """
                INSERT INTO market_data (
                    instrument_name,
                    symbol,
                    instrument_type,
                    exchange,
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                    previous_close,
                    change,
                    change_percent,
                    volume,
                    source
                )
                SELECT
                    :instrument_name,
                    :symbol,
                    :instrument_type,
                    :exchange,
                    :timestamp,
                    :open,
                    :high,
                    :low,
                    :close,
                    :previous_close,
                    :change,
                    :change_percent,
                    :volume,
                    :source
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM market_data
                    WHERE symbol = :symbol
                      AND timestamp = :timestamp
                );
            """

            execute_query(insert_query, params)

        saved_count += 1

    print(
        f"Saved {saved_count} records for "
        f"{metadata['instrument_name']}."
    )

    return saved_count


# =========================================================
# FETCH AND SAVE SELECTED INSTRUMENTS
# =========================================================

def fetch_market_data(
    user_id,
    period=DEFAULT_PERIOD,
    interval=DEFAULT_INTERVAL
):
    """
    Main entry point called by downstream modules.

    Initializes market_service, fetches the selected instruments,
    and saves their historical data.
    """

    try:
        service_result = initialize_market_service(user_id)

        if not service_result.get("success"):
            raise RuntimeError(
                "Market service initialization failed."
            )

        if not service_result.get("market_analysis_enabled"):
            return {
                "success": True,
                "market_analysis_enabled": False,
                "user_id": user_id,
                "instruments_processed": 0,
                "records_saved": 0,
                "results": [],
                "errors": []
            }

        instruments = service_result.get(
            "instruments_to_analyze",
            {}
        )

        results = []
        errors = []
        total_saved = 0

        for category, names in instruments.items():

            for name in names:

                try:
                    instrument_data = fetch_instrument_data(
                        name,
                        period=period,
                        interval=interval
                    )

                    saved_count = save_market_data(
                        instrument_data
                    )

                    total_saved += saved_count

                    results.append({
                        "instrument_name": name,
                        "symbol": instrument_data["symbol"],
                        "status": "success",
                        "records_saved": saved_count
                    })

                except Exception as error:
                    print(
                        f"[ERROR] {name}: {error}"
                    )

                    errors.append({
                        "instrument_name": name,
                        "error": str(error)
                    })

        return {
            "success": len(results) > 0,
            "market_analysis_enabled": True,
            "user_id": user_id,
            "instruments_processed": len(results),
            "records_saved": total_saved,
            "results": results,
            "errors": errors
        }

    except Exception as error:
        print(
            f"[ERROR] Market data fetching failed: {error}"
        )
        raise


# =========================================================
# MAIN EXECUTION
# =========================================================

if __name__ == "__main__":

    try:
        user_id = int(input("Enter user ID: "))

        result = fetch_market_data(user_id)

        print("\n========== DATA FETCHER RESULT ==========")

        for key, value in result.items():
            print(f"{key}: {value}")

        sys.exit(0 if result["success"] else 1)

    except KeyboardInterrupt:
        print("\nExecution cancelled.")
        sys.exit(0)

    except Exception as error:
        print(f"\nFATAL ERROR: {error}")
        sys.exit(1)