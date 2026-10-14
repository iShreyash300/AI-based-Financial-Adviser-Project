import sys

from ml_model.database.db_connection import fetch_data

# =========================================================
# DEFAULT MARKET INSTRUMENTS
# =========================================================

DEFAULT_INSTRUMENTS = {
    "stocks": [
        "NIFTY 50",
        "BSE SENSEX",
        "NIFTY BANK",
        "NIFTY 500"
    ],
    "commodities": [
        "Gold",
        "Silver"
    ]
}


# =========================================================
# GET USER PREFERENCES
# =========================================================

def get_user_preferences(user_id):
    """
    Retrieve existing market preferences for a user.
    Uses the existing database utility without modifying it.
    """

    try:
        query = """
            SELECT
                user_id,
                wants_to_invest,
                preferred_instruments,
                preferred_sectors,
                risk_profile
            FROM user_market_preferences
            WHERE user_id = :user_id;
        """

        result = fetch_data(
            query,
            {"user_id": user_id}
        )

        if result is None or result.empty:
            return None

        row = result.iloc[0]

        return {
            "user_id": row["user_id"],
            "wants_to_invest": row["wants_to_invest"],
            "preferred_instruments": row["preferred_instruments"],
            "preferred_sectors": row["preferred_sectors"],
            "risk_profile": row["risk_profile"]
        }

    except Exception as error:
        print(
            f"[ERROR] Failed to retrieve market preferences "
            f"for user_id {user_id}: {error}"
        )
        raise


# =========================================================
# SET DEFAULT INSTRUMENTS
# =========================================================

def set_default_instruments():
    """
    Return a copy of the default market instruments.
    """

    return {
        category: instruments.copy()
        for category, instruments in DEFAULT_INSTRUMENTS.items()
    }


# =========================================================
# CHECK SELECTED INSTRUMENTS
# =========================================================

def resolve_instruments(preferred_instruments):
    """
    Use the user's selected instruments if any exist.
    Otherwise, use the default instruments.

    An empty dictionary, empty lists, or None indicates
    that no instruments have been selected.
    """

    if not preferred_instruments:
        return set_default_instruments()

    if not isinstance(preferred_instruments, dict):
        raise ValueError(
            "Invalid preferred_instruments format. "
            "Expected a dictionary."
        )

    # Check whether at least one instrument was selected.
    has_selected_instruments = any(
        isinstance(instruments, list) and len(instruments) > 0
        for instruments in preferred_instruments.values()
    )

    if has_selected_instruments:
        return preferred_instruments

    return set_default_instruments()


# =========================================================
# INITIALIZE MARKET SERVICE
# =========================================================

def initialize_market_service(user_id):
    """
    Main entry point for market analysis.

    Workflow:
        1. Retrieve user preferences.
        2. Check whether the user wants to invest.
        3. Resolve preferred or default instruments.
        4. Return the configuration for downstream modules.

    Market data fetching and analysis are handled elsewhere.
    """

    try:
        if not isinstance(user_id, int) or isinstance(user_id, bool):
            raise ValueError("user_id must be an integer.")

        if user_id <= 0:
            raise ValueError("user_id must be positive.")

        print(
            f"\nInitializing market service for user_id: {user_id}"
        )

        # ---------------------------------------------
        # Step 1: Retrieve preferences
        # ---------------------------------------------

        preferences = get_user_preferences(user_id)

        if preferences is None:
            print("No preferences found. Using default instruments.")

            return {
            "success": True,
            "market_analysis_enabled": True,
            "user_id": user_id,
            "instruments_to_analyze": set_default_instruments(),
            "preferred_sectors": None,
            "risk_profile": None,
            "using_defaults": True,
            "message": "Using default market instruments."
            }

        # ---------------------------------------------
        # Step 2: Check investment preference
        # ---------------------------------------------

        if preferences["wants_to_invest"] is not True:
            print(
                "User has opted out of market analysis."
            )

            return {
                "success": True,
                "market_analysis_enabled": False,
                "message": (
                    "Market analysis skipped because "
                    "the user does not want to invest."
                ),
                "user_id": user_id,
                "preferences": preferences
            }

        # ---------------------------------------------
        # Step 3: Resolve instruments
        # ---------------------------------------------

        instruments = resolve_instruments(
            preferences["preferred_instruments"]
        )

        using_defaults = (
            not preferences["preferred_instruments"]
            or not any(
                isinstance(items, list) and len(items) > 0
                for items in preferences["preferred_instruments"].values()
            )
        )

        # ---------------------------------------------
        # Step 4: Prepare configuration
        # ---------------------------------------------

        if using_defaults:
            print("No instruments selected. Using default instruments.")
        else:
            print("Using user-selected instruments.")

        print(f"Resolved instruments: {instruments}")

        return {
            "success": True,
            "market_analysis_enabled": True,
            "user_id": user_id,
            "instruments_to_analyze": instruments,
            "preferred_sectors": preferences["preferred_sectors"],
            "risk_profile": preferences["risk_profile"],
            "using_defaults": using_defaults,
            "message": "Market service initialized successfully."
        }

    except Exception as error:
        print(
            f"ERROR: Market service initialization failed: {error}"
        )
        raise


# =========================================================
# MAIN EXECUTION
# =========================================================

if __name__ == "__main__":

    try:
        user_id = int(input("Enter user ID: "))

        result = initialize_market_service(user_id)

        print("\n========== MARKET SERVICE RESULT ==========")

        for key, value in result.items():
            print(f"{key}: {value}")

        if result.get("market_analysis_enabled"):
            print(
                "\nMarket service is ready for the next module."
            )
        else:
            print(
                "\nMarket analysis will not proceed."
            )

        sys.exit(0)

    except KeyboardInterrupt:
        print("\nExecution cancelled by user.")
        sys.exit(0)

    except Exception as error:
        print(f"\nFATAL ERROR: {error}")
        sys.exit(1)