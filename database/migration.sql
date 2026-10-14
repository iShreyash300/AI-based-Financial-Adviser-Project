-- added user preference for investment column

ALTER TABLE user_market_preferences
ADD COLUMN wants_to_invest BOOLEAN NOT NULL DEFAULT FALSE;