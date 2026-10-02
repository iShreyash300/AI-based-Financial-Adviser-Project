-- =========================================
-- AI FINANCIAL ADVISOR SCHEMA (CLEAN FINAL)
-- =========================================



-- =========================================
-- UPDATED TIMESTAMP TRIGGER SYSTEM
-- =========================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- =========================================
-- 1. USERS TABLE
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

);

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 3. DEPARTMENTS
-- =========================================

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,

    department_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,

);

-- DEFAULT FINAI DEPARTMENTS

INSERT INTO departments (department_name, description)
VALUES
    ('Sales',
     'Activities directly involved in selling products or services and generating revenue'),

    ('Marketing',
     'Activities focused on customer acquisition, promotion, branding, and business growth'),

    ('Operations',
     'Core activities required to produce, deliver, and manage the business products or services'),

    ('Human Resources',
     'Activities related to employees, recruitment, salaries, training, and workforce management'),

    ('Customer Support',
     'Activities focused on assisting customers, resolving issues, and providing post-sale service'),

    ('Finance',
     'Activities related to accounting, budgeting, financial management, and financial control');

CREATE TRIGGER trg_departments_updated
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 4. EXPENSE CATEGORIES
-- =========================================

CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,

    category_name VARCHAR(255) UNIQUE NOT NULL,

    department_id INT NOT NULL
        REFERENCES departments(id)
        ON DELETE RESTRICT,

    category_type VARCHAR(50) CHECK (
        category_type IN (
            'fixed',
            'variable',
            'operational',
            'salary',
            'emergency'
        )
    ),

    keywords TEXT,
    priority_weight INT DEFAULT 1,
);

-- KEYWORD SEARCH INDEX

CREATE INDEX idx_expense_categories_keywords
ON expense_categories USING GIN (
    to_tsvector('english', COALESCE(keywords, ''))
);

-- DEFAULT FINAI EXPENSE CATEGORIES

INSERT INTO expense_categories
(category_name, department_id, category_type, keywords, priority_weight)
VALUES

-- SALES

(
    'Sales Promotion',
    (SELECT id FROM departments WHERE department_name = 'Sales'),
    'variable',
    'sales promotion discount offer coupon sales incentive dealer promotion customer offer product promotion',
    3
),


-- MARKETING

(
    'Marketing & Promotion',
    (SELECT id FROM departments WHERE department_name = 'Marketing'),
    'variable',
    'marketing advertising ads advertisement campaign branding promotion google meta facebook instagram youtube social media content event sponsorship digital marketing seo',
    5
),

-- OPERATIONS

(
    'Raw Materials',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'variable',
    'raw material raw materials manufacturing materials production components parts ingredients supplies procurement input material',
    5
),

(
    'Inventory',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'variable',
    'inventory stock goods merchandise products purchase procurement warehouse replenishment stock purchase',
    4
),

(
    'Food Supply',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'variable',
    'food supply food ingredients vegetables fruits dairy grocery cooking material kitchen supplies raw food food procurement',
    4
),

(
    'Logistics',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'variable',
    'logistics transportation transport freight shipping delivery courier dispatch cargo trucking delivery charges transportation charges',
    4
),

(
    'Rent',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'fixed',
    'rent lease rental warehouse office shop store factory building premises property monthly rent',
    5
),

(
    'Maintenance',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'fixed',
    'maintenance repair servicing service upkeep equipment repair machine repair vehicle repair replacement parts',
    4
),

(
    'Software Tools',
    (SELECT id FROM departments WHERE department_name = 'Operations'),
    'operational',
    'software software tools saas license subscription application app platform technology developer tools productivity software',
    3
),

-- HUMAN RESOURCES

(
    'Salary',
    (SELECT id FROM departments WHERE department_name = 'Human Resources'),
    'salary',
    'salary salaries payroll wages employee staff compensation monthly salary workforce personnel payroll payment',
    5
),

(
    'Employee Training',
    (SELECT id FROM departments WHERE department_name = 'Human Resources'),
    'variable',
    'employee training training development workshop certification course learning seminar skill development employee education',
    3
),

-- CUSTOMER SUPPORT

(
    'Customer Service',
    (SELECT id FROM departments WHERE department_name = 'Customer Support'),
    'operational',
    'customer service customer care support helpdesk assistance complaint resolution customer assistance after sales service helpline',
    4
),

(
    'Customer Refunds',
    (SELECT id FROM departments WHERE department_name = 'Customer Support'),
    'variable',
    'refund refunds customer refund return reimbursement money back product return replacement compensation',
    4
),

-- FINANCE

(
    'Bank Charges',
    (SELECT id FROM departments WHERE department_name = 'Finance'),
    'operational',
    'bank charges banking fee transaction fee payment gateway bank fee processing fee transfer fee merchant charges',
    4
),

(
    'Taxes',
    (SELECT id FROM departments WHERE department_name = 'Finance'),
    'fixed',
    'tax taxes gst income tax corporate tax sales tax tax payment tax filing tds customs duty government tax',
    5
),

(
    'Professional Fees',
    (SELECT id FROM departments WHERE department_name = 'Finance'),
    'operational',
    'professional fees consultant consulting legal lawyer advocate attorney advisory services professional service consulting fee',
    3
);



-- =========================================
-- 5. EXPENSES
-- =========================================

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES expense_categories(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),

    payment_method VARCHAR(50) CHECK (
        payment_method IN ('cash','upi','bank_transfer','credit_card','debit_card')
    ),

    expense_date DATE NOT NULL,

    recurring_frequency VARCHAR(50) CHECK (
        recurring_frequency IN ('one_time','daily','weekly','monthly','yearly')
    ),

);

CREATE TRIGGER trg_expenses_updated
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 6. REVENUE
-- =========================================

CREATE TABLE revenue (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,

    source VARCHAR(255),
    description TEXT,

    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    revenue_date DATE NOT NULL,
);

CREATE TRIGGER trg_revenue_updated
BEFORE UPDATE ON revenue
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 7. BUDGETS
-- =========================================

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,

    budget_month INT NOT NULL CHECK (budget_month BETWEEN 1 AND 12),
    budget_year INT NOT NULL,

    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),

    UNIQUE(user_id, department_id, budget_month, budget_year)
);

CREATE TRIGGER trg_budgets_updated
BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 8. FINANCIAL HEALTH SCORES
-- =========================================

CREATE TABLE financial_health_scores (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    score DECIMAL(5,2) CHECK (score BETWEEN 0 AND 100),
    profitability_score DECIMAL(5,2) CHECK (profitability_score BETWEEN 0 AND 100),
    expense_ratio_score DECIMAL(5,2) CHECK (expense_ratio_score BETWEEN 0 AND 100),
    revenue_growth_score DECIMAL(5,2) CHECK (revenue_growth_score BETWEEN 0 AND 100),
    budget_efficiency_score DECIMAL(5,2) CHECK (budget_efficiency_score BETWEEN 0 AND 100),

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 9. PREDICTIONS
-- =========================================

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    prediction_type VARCHAR(50) CHECK (
        prediction_type IN ('expense','revenue','profit','cashflow')
    ),

    predicted_value DECIMAL(12,2) NOT NULL,
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),

    prediction_month INT CHECK (prediction_month BETWEEN 1 AND 12),
    prediction_year INT,
);



-- =========================================
-- 10. ALERTS
-- =========================================

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    alert_type VARCHAR(50) CHECK (
        alert_type IN (
            'budget_exceeded',
            'low_cashflow',
            'high_expense',
            'goal_reminder',
            'prediction_warning',
            'market_trend_alert'
        )
    ),

    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
);



-- =========================================
-- 11. GOALS
-- =========================================

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    goal_title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount >= 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    category VARCHAR(100) DEFAULT 'General',

    -- status is computed dynamically based on progress; no CHECK constraint intentionally
    status VARCHAR(50) DEFAULT 'active',

);

CREATE TRIGGER trg_goals_updated
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION update_timestamp();



-- =========================================
-- 12. AI RECOMMENDATIONS
-- =========================================

CREATE TABLE ai_recommendations (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    recommendation_type VARCHAR(50) CHECK (
        recommendation_type IN (
            'expense_reduction',
            'budget_advice',
            'investment_tip',
            'investment_opportunity',
            'saving_suggestion',
            'risk_alert'
        )
    ),

    message TEXT NOT NULL,

    priority VARCHAR(20) CHECK (
        priority IN ('low','medium','high')
    ),
);



-- =========================================
-- PERFORMANCE INDEXES
-- =========================================

CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

CREATE INDEX idx_revenue_user ON revenue(user_id);
CREATE INDEX idx_revenue_date ON revenue(revenue_date);
CREATE INDEX idx_revenue_user_date ON revenue(user_id, revenue_date);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);

-- =========================================================
-- MARKET ANALYSIS EXPANSION
-- =========================================================

-- =========================================================
-- 13. USER MARKET PREFERENCES
-- Optional personalized market preferences for users
-- =========================================================

CREATE TABLE user_market_preferences (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    preferred_instruments JSONB,
    preferred_sectors JSONB,

    risk_profile VARCHAR(30),

);

-- =========================================================
-- 14. MARKET DATA
-- =========================================================

CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,

    instrument_name VARCHAR(150) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    instrument_type VARCHAR(50) NOT NULL,
    exchange VARCHAR(50),

    timestamp TIMESTAMP NOT NULL,

    open DECIMAL(18,4),
    high DECIMAL(18,4),
    low DECIMAL(18,4),
    close DECIMAL(18,4),

    previous_close DECIMAL(18,4),
    change DECIMAL(18,4),
    change_percent DECIMAL(10,4),

    volume DECIMAL(20,4),

    source VARCHAR(100),
);

-- =========================================================
-- 15. BANK DATA
-- =========================================================

CREATE TABLE bank_data (
    id SERIAL PRIMARY KEY,

    bank_name VARCHAR(150),
    symbol VARCHAR(50),

    data_type VARCHAR(100) NOT NULL,
    value DECIMAL(18,6),
    unit VARCHAR(50),

    timestamp TIMESTAMP NOT NULL,

    source VARCHAR(100),

);

-- =========================================================
-- 16. GOLD & SILVER DATA
-- =========================================================

CREATE TABLE gold_silver_data (
    id SERIAL PRIMARY KEY,

    metal VARCHAR(20) NOT NULL,

    timestamp TIMESTAMP NOT NULL,

    open DECIMAL(18,4),
    high DECIMAL(18,4),
    low DECIMAL(18,4),
    close DECIMAL(18,4),

    previous_close DECIMAL(18,4),
    change DECIMAL(18,4),
    change_percent DECIMAL(10,4),

    unit VARCHAR(50),

    source VARCHAR(100),

);


-- =========================================================
-- 17. PROCESSED MARKET DATA
-- =========================================================

CREATE TABLE processed_market_data (
    id SERIAL PRIMARY KEY,

    instrument_name VARCHAR(150) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    instrument_type VARCHAR(50) NOT NULL,

    timestamp TIMESTAMP NOT NULL,

    current_value DECIMAL(18,4),

    daily_change DECIMAL(18,4),
    daily_change_percent DECIMAL(10,4),

    day_high DECIMAL(18,4),
    day_low DECIMAL(18,4),

    week_52_high DECIMAL(18,4),
    week_52_low DECIMAL(18,4),

    moving_average_20 DECIMAL(18,4),
    moving_average_50 DECIMAL(18,4),
    moving_average_200 DECIMAL(18,4),

    rsi DECIMAL(10,4),
    volatility DECIMAL(10,4),

    trend VARCHAR(50),
    market_strength DECIMAL(10,4),

    bank_indicator_value DECIMAL(18,6),

    gold_price DECIMAL(18,4),
    silver_price DECIMAL(18,4),

    additional_metrics JSONB,

);

-- =========================================================
-- 18. MARKET SUMMARY
-- Frontend-facing processed market information
-- =========================================================

CREATE TABLE market_summary (
    id SERIAL PRIMARY KEY,

    instrument_name VARCHAR(150) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    instrument_type VARCHAR(50) NOT NULL,

    current_value DECIMAL(18,4),

    change DECIMAL(18,4),
    change_percent DECIMAL(10,4),

    day_high DECIMAL(18,4),
    day_low DECIMAL(18,4),

    week_52_high DECIMAL(18,4),
    week_52_low DECIMAL(18,4),

    trend VARCHAR(50),
    volatility DECIMAL(10,4),

    market_status VARCHAR(50),

    summary_timestamp TIMESTAMP NOT NULL,

);