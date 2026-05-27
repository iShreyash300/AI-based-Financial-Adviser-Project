-- =========================================
-- DATABASE SCHEMA
-- AI-Based Business Financial Advisor
-- PostgreSQL
-- =========================================



-- =========================================
-- 1. USERS TABLE
-- =========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 2. DEPARTMENTS TABLE
-- =========================================

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    department_name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 3. EXPENSE CATEGORIES TABLE
-- =========================================

CREATE TABLE expense_categories (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    category_name VARCHAR(255) NOT NULL,

    category_type VARCHAR(50) CHECK (
        category_type IN (
            'fixed',
            'variable',
            'operational',
            'salary',
            'emergency'
        )
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, category_name)
);



-- =========================================
-- 4. EXPENSES TABLE
-- =========================================

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    department_id INT REFERENCES departments(id)
    ON DELETE SET NULL,

    category_id INT REFERENCES expense_categories(id)
    ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    amount DECIMAL(12,2) NOT NULL CHECK (
        amount >= 0
    ),

    payment_method VARCHAR(50) CHECK (
        payment_method IN (
            'cash',
            'upi',
            'bank_transfer',
            'credit_card',
            'debit_card'
        )
    ),

    transaction_type VARCHAR(20) CHECK (
        transaction_type IN (
            'essential',
            'non_essential'
        )
    ),

    expense_date DATE NOT NULL,

    is_recurring BOOLEAN DEFAULT FALSE,

    recurring_frequency VARCHAR(50) CHECK (
        recurring_frequency IN (
            'daily',
            'weekly',
            'monthly',
            'yearly'
        )
    ),

    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 5. REVENUE TABLE
-- =========================================

CREATE TABLE revenue (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    department_id INT REFERENCES departments(id)
    ON DELETE SET NULL,

    source VARCHAR(255),

    description TEXT,

    amount DECIMAL(12,2) NOT NULL CHECK (
        amount >= 0
    ),

    revenue_date DATE NOT NULL,

    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 6. BUDGETS TABLE
-- =========================================

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    department_id INT REFERENCES departments(id)
    ON DELETE SET NULL,

    budget_month INT NOT NULL CHECK (
        budget_month BETWEEN 1 AND 12
    ),

    budget_year INT NOT NULL,

    amount DECIMAL(12,2) NOT NULL CHECK (
        amount >= 0
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(
        user_id,
        department_id,
        budget_month,
        budget_year
    )
);



-- =========================================
-- 7. FINANCIAL HEALTH SCORES TABLE
-- =========================================

CREATE TABLE financial_health_scores (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    score DECIMAL(5,2) CHECK (
        score BETWEEN 0 AND 100
    ),

    profitability_score DECIMAL(5,2) CHECK (
        profitability_score BETWEEN 0 AND 100
    ),

    expense_ratio_score DECIMAL(5,2) CHECK (
        expense_ratio_score BETWEEN 0 AND 100
    ),

    revenue_growth_score DECIMAL(5,2) CHECK (
        revenue_growth_score BETWEEN 0 AND 100
    ),

    budget_efficiency_score DECIMAL(5,2) CHECK (
        budget_efficiency_score BETWEEN 0 AND 100
    ),

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 8. PREDICTIONS TABLE
-- =========================================

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    prediction_type VARCHAR(50) CHECK (
        prediction_type IN (
            'expense',
            'revenue',
            'profit',
            'cashflow'
        )
    ),

    predicted_value DECIMAL(12,2) NOT NULL,

    confidence_score DECIMAL(5,2) CHECK (
        confidence_score BETWEEN 0 AND 100
    ),

    prediction_month INT CHECK (
        prediction_month BETWEEN 1 AND 12
    ),

    prediction_year INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 9. ALERTS TABLE
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
            'prediction_warning'
        )
    ),

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 10. GOALS TABLE
-- =========================================

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    goal_title VARCHAR(255) NOT NULL,

    target_amount DECIMAL(12,2) NOT NULL CHECK (
        target_amount >= 0
    ),

    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (
        current_amount >= 0
    ),

    deadline DATE,

    status VARCHAR(50) DEFAULT 'active' CHECK (
        status IN (
            'active',
            'completed',
            'failed'
        )
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- 11. AI RECOMMENDATIONS TABLE
-- =========================================

CREATE TABLE ai_recommendations (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    recommendation_type VARCHAR(50) CHECK (
        recommendation_type IN (
            'expense_reduction',
            'budget_advice',
            'investment_tip',
            'saving_suggestion',
            'risk_alert'
        )
    ),

    message TEXT NOT NULL,

    priority VARCHAR(20) CHECK (
        priority IN (
            'low',
            'medium',
            'high'
        )
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- =========================================
-- PERFORMANCE INDEXES
-- =========================================

CREATE INDEX idx_expenses_user
ON expenses(user_id);

CREATE INDEX idx_expenses_date
ON expenses(expense_date);

CREATE INDEX idx_expenses_user_date
ON expenses(user_id, expense_date);

CREATE INDEX idx_revenue_user
ON revenue(user_id);

CREATE INDEX idx_revenue_date
ON revenue(revenue_date);

CREATE INDEX idx_revenue_user_date
ON revenue(user_id, revenue_date);

CREATE INDEX idx_alerts_user
ON alerts(user_id);

CREATE INDEX idx_predictions_user
ON predictions(user_id);

CREATE INDEX idx_goals_user
ON goals(user_id);