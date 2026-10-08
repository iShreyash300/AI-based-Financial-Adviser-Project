# Architecture — AI-Based Financial Adviser System

## 1. High-Level Architecture

The system follows a **3-tier architecture** with a separate AI/analytics layer:

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION TIER                       │
│          React SPA (Create React App)  — localhost:3000      │
│  Routes · Lazy Components · MUI · Chart.js · Axios + JWT    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       APPLICATION TIER                       │
│      Express.js API — Render (Node.js)                       │
│  JWT Middleware · Controllers · Business Logic · PDF Export  │
└──────────────┬──────────────────────────┬───────────────────┘
               │ pg (SQL)                 │ (future integration)
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────┐
│      DATA TIER        │    │         AI / ML TIER            │
│  PostgreSQL on Neon   │◄───│  Python Pipeline                │
│  10 relational tables │    │  pandas · SQLAlchemy · sklearn  │
└──────────────────────┘    │  budget_advice · investment_tip  │
                             │  expense_reduction · risk_alert  │
                             └─────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Technology
- **React 19** with Create React App (react-scripts 5)
- **React Router DOM v7** — declarative client-side routing
- **MUI v9** — component system with `sx` prop styling
- **Chart.js / react-chartjs-2** — Line, Bar, Pie visualizations
- **Axios** — HTTP client with manual JWT header injection

### Architectural Pattern
```
App.js (BrowserRouter + Suspense)
    ├── Public Routes (no auth)
    │   ├── /            → homePage.jsx
    │   ├── /login       → loginPage.jsx
    │   ├── /signup      → signupPage.jsx
    │   └── /forgetPassword → forgetPassword.jsx
    │
    └── Protected Routes (ProtectedRoute.jsx guard)
        ├── /dashboard           → deshboardPage.jsx
        ├── /expenses            → expenses.jsx
        ├── /revenues            → revenue.jsx
        ├── /budget              → budget.jsx  ⚠️ (unprotected)
        ├── /predictions         → predictions.jsx
        ├── /goals               → goals.jsx
        ├── /reports             → financialReport.jsx
        ├── /profile             → profilePage.jsx
        └── /investments/*
            ├── /investments             → moneyInvestments.jsx
            ├── /investments/stocks      → stockRecommendationsPage.jsx
            ├── /investments/gold        → goldAnalysisPage.jsx
            ├── /investments/fd          → fdComparisonPage.jsx
            ├── /investments/portfolio   → myPortfolioPage.jsx
            └── /investments/recommendations → aiRecommendationsPage.jsx
```

### Component Hierarchy
```
Layout (Navbar + Sidebar)
    └── Page Component
            ├── useEffect → axios.get(API_URL, { headers: { Authorization: token } })
            ├── useState  → loading, data, error
            └── Render    → MUI Cards + Chart.js charts
```

### State Management
- **No global state store** (no Redux/Zustand)
- Each page manages its own local `useState`
- JWT token read from `localStorage.getItem("token")` on every request
- Auth state: token presence check in `ProtectedRoute.jsx`

### API Integration Pattern
Every page constructs requests inline:
```js
const token = localStorage.getItem("token");
axios.get("https://ai-based-financial-adviser-project-v1.onrender.com/api/<endpoint>", {
  headers: { Authorization: token }
});
```

> ⚠️ No centralized API client — Render base URL is hardcoded in 13 files.

---

## 3. Backend Architecture

### Technology
- **Node.js** runtime
- **Express.js** — REST framework
- **pg** — PostgreSQL client (connection pool)
- **jsonwebtoken** — JWT sign + verify
- **bcryptjs** — password hashing (saltRounds = 10)
- **pdfkit** — PDF report generation

### Module Structure
```
server.js
    ├── app.use(cors())
    ├── app.use(express.json())
    ├── connectDB()               ← initializes pg pool
    └── Mounts routers:
        /api/auth        → authRoutes.js        → authController.js
        /api/expenses    → expenseRoutes.js     → expenseController.js
        /api/revenues    → revenueRoutes.js     → revenueController.js
        /api/budgets     → budgetRoutes.js      → budgetController.js
        /api/financial-health → financialHealthRoutes.js → financialHealthController.js
        /api/predictions → predictionRoutes.js  → predictionController.js
        /api/reports     → reportRoutes.js      → reportsController.js
        /api/goals       → goalsRoutes.js       → goalsController.js
        /api/growth-plan → growthPlanRoutes.js  → growthPlanController.js
```

### Request Lifecycle
```
HTTP Request
    → Express Router
    → authMiddleware.js (verifies JWT → sets req.user.id)
    → Controller function
        → pool.query(SQL, [req.user.id, ...params])
        → Process results
        → res.json({ success, data, message })
```

### Key Controllers

| Controller | Responsibility |
|---|---|
| `authController` | Signup (bcrypt hash), Login (bcrypt compare + JWT sign), Profile CRUD |
| `expenseController` | Expense CRUD; auto-creates category if new |
| `revenueController` | Revenue CRUD with department linking |
| `budgetController` | Monthly budget CRUD; computes actual-vs-budget utilization |
| `financialHealthController` | 5-dimension score: profitability, expense ratio, revenue growth, budget efficiency, cash flow stability |
| `predictionController` | Linear regression on last 6 months → forecasts expense/revenue/cashflow + confidence % |
| `reportsController` | Aggregates summary KPIs + chart data series; supports 4 date filter modes |
| `goalsController` | Goal CRUD + progress estimation from revenue/expense trajectory |
| `growthPlanController` | Analyzes surplus → generates prioritized growth recommendations |

### Date Filter System (reportsController)
```
?filter=this_month       → current calendar month
?filter=last_3_months    → rolling 3 months (DEFAULT for dashboard)
?filter=last_6_months    → rolling 6 months
?filter=last_12_months   → rolling 12 months
?filter=custom&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
```

---

## 4. Database Architecture

### Engine
PostgreSQL 15 — hosted on Neon (serverless, connection pooling via `pg`)

### Entity-Relationship Overview
```
users (1)
  ├──< departments (N)
  │       ├──< expenses (N) >── expense_categories
  │       ├──< revenue (N)
  │       └──< budgets (N)
  ├──< goals (N)
  ├──< predictions (N)
  ├──< financial_health_scores (N)
  ├──< ai_recommendations (N)
  └──< alerts (N)
```

### Core Tables

**users**
```sql
id, full_name, owner_name, email, password_hash,
business_type, created_at
```

**expenses**
```sql
id, user_id, department_id, category_id, amount,
description, payment_method, frequency, date, created_at
```

**revenue**
```sql
id, user_id, department_id, source, amount, date, created_at
```

**budgets**
```sql
id, user_id, department_id, amount, month, year,
UNIQUE(user_id, department_id, month, year)
```

**financial_health_scores**
```sql
id, user_id, score, status, profitability_score,
expense_ratio_score, revenue_growth_score,
budget_efficiency_score, cash_flow_score, computed_at
```

**predictions**
```sql
id, user_id, prediction_type, predicted_amount,
confidence_score, target_month, created_at
```

**goals**
```sql
id, user_id, title, target_amount, current_amount,
deadline, status, created_at
```

**ai_recommendations**
```sql
id, user_id, category, recommendation, priority,
created_at
```

### Query Pattern
All controllers use parameterized queries:
```js
const { rows } = await pool.query(
  `SELECT * FROM expenses WHERE user_id = $1 AND date >= $2`,
  [req.user.id, startDate]
);
```

---

## 5. AI & ML Architecture

### Current Implementation (Node.js backend)
The backend implements rule-based + statistical AI:

```
financialHealthController → 5 weighted sub-scores → overall score (0–100)
    Profitability Score    (30% weight) → (revenue - expenses) / revenue
    Expense Ratio Score    (20% weight) → expenses / revenue < thresholds
    Revenue Growth Score   (20% weight) → MoM growth rate from last 6 months
    Budget Efficiency      (15% weight) → actual vs planned budget %
    Cash Flow Stability    (15% weight) → variance in net cash flow

predictionController → Linear Regression (manual implementation)
    1. Fetch last 6 months of actual data
    2. Assign x = [1, 2, 3, 4, 5, 6]
    3. Compute slope and intercept
    4. Predict month 7
    5. Compute confidence based on R²

growthPlanController → Rule-based recommendations
    1. Compute surplus = revenue - expenses
    2. Classify financial health band
    3. Map to recommendation templates
    4. Return prioritized action list
```

### Python ML Pipeline (standalone)
```
ml_model/
├── training/
│   ├── train_expense_model.py    # Trains sklearn model on expense history
│   └── train_revenue_model.py    # Trains sklearn model on revenue history
├── utils/
│   ├── build_financial_metrics.py
│   ├── profit_prediction.py
│   └── recommendation_engine.py
└── recommendations/
    ├── budget_advice.py
    ├── expense_reduction.py
    ├── investment_tip.py          # Maps surplus → investment type
    ├── risk_alert.py
    └── saving_suggestion.py
```

> The Python pipeline connects directly to PostgreSQL via SQLAlchemy. It is not yet called by the Express API — outputs need to be stored in `ai_recommendations` table for the frontend to consume via `/api/growth-plan/recommendations`.

---

## 6. Security Architecture

| Layer | Mechanism |
|---|---|
| Password storage | bcryptjs hash (saltRounds=10) |
| Authentication | JWT signed with `JWT_SECRET` env var |
| Authorization | `authMiddleware.js` on every protected route |
| Transport | HTTPS (Render TLS) |
| CORS | `app.use(cors())` — open (⚠️ should be restricted to frontend domain in production) |
| Secret management | dotenv + Render env vars (never committed) |

---

## 7. Deployment Architecture

```
Developer Machine
    │
    ├── git push → GitHub
    │
    ├── Render (backend auto-deploy)
    │   ├── Build: npm install
    │   ├── Start: node server.js
    │   ├── Env: DATABASE_URL, JWT_SECRET, PORT
    │   └── URL: https://ai-based-financial-adviser-project-v1.onrender.com
    │
    └── Static Host (frontend)
        ├── Build: npm run build → /build
        └── Serve: static files (Netlify / Render Static / S3)

Database: Neon PostgreSQL (serverless, always-on)
```

---

## 8. Data Flow — End to End

### Example: Dashboard Load
```
1. User logs in → JWT stored in localStorage
2. Browser navigates to /dashboard
3. ProtectedRoute checks localStorage["token"] → pass
4. deshboardPage.jsx mounts → useEffect fires
5. Two parallel axios calls:
   GET /api/reports/summary?filter=last_3_months  { Authorization: <jwt> }
   GET /api/reports/charts?filter=last_3_months   { Authorization: <jwt> }
6. authMiddleware verifies JWT → req.user.id = X
7. reportsController runs aggregation SQL queries for user X and date range
8. Returns { success: true, data: { totalRevenue, totalExpenses, ... } }
9. Frontend sets state → KPI cards render with real numbers
10. Charts receive labels + datasets → Chart.js renders
```

### Example: Add Expense
```
1. User fills expense form → clicks Save
2. POST /api/expenses { amount, category, date, ... }  { Authorization: <jwt> }
3. authMiddleware → req.user.id = X
4. expenseController:
   a. Resolve category_id (INSERT if new category)
   b. INSERT INTO expenses (user_id, ...) VALUES ($1, ...)
   c. Return inserted row
5. Frontend appends new expense to list → no full reload needed
```

---

## 9. Performance Considerations

| Area | Current State | Recommendation |
|---|---|---|
| API client | 13 files with hardcoded URLs | Centralize in `src/api/client.js` |
| Auth | localStorage token | httpOnly cookie for production |
| Queries | Raw SQL per request | Add query result caching (Redis) for health score |
| CORS | Open (`*`) | Restrict to frontend domain |
| Frontend bundle | 144.92 kB gzip | Already optimized via CRA code-splitting |
| Backend cold start | Render free tier cold start (~30s) | Upgrade to paid tier or use keep-alive ping |

---

*Last updated: 2026-10-02*
