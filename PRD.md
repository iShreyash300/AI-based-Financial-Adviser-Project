# Product Requirements Document (PRD)
## AI-Based Financial Adviser System

**Version**: 1.0  
**Date**: 2026-10-02  
**Status**: In Development  

---

## 1. Product Vision

> **"Give every business owner the financial intelligence of a CFO — automatically."**

The AI-Based Financial Adviser is a decision-support system that continuously analyzes a business's financial data (revenue, expenses, profit, and cash flow), computes its financial health, and recommends how surplus funds can be intelligently deployed through investments or business growth to maximize income and ensure long-term sustainability.

---

## 2. Problem Statement

### The Problem
Small business owners and entrepreneurs typically lack:
- A real-time, unified view of their financial position
- Tools to identify where money is being wasted
- Guidance on what to do with surplus funds
- Forecasting capability to anticipate financial risk

### Current Pain Points
| Pain Point | Impact |
|---|---|
| No visibility into monthly burn rate vs income | Surprise cash shortfalls |
| No budget tracking | Overspending without awareness |
| No forecasting | Inability to plan ahead |
| No investment guidance | Idle surplus earning nothing |
| No health scoring | No way to benchmark financial condition |

---

## 3. Target Users

### Primary User
**Small Business Owner / Entrepreneur**
- Manages a business with 1–50 employees
- Tracks expenses and revenue manually (spreadsheets, receipts)
- Has limited financial expertise
- Wants to grow their business and make smart money decisions

### Secondary Users
- **Finance Managers** at small companies
- **Freelancers / Solopreneurs** tracking business income

### User Goals
1. Know exactly how much money is coming in vs going out
2. Understand if the business is financially healthy
3. Know what next month's finances will likely look like
4. Get told: "You have ₹X surplus — here's where to put it"
5. Track progress toward business financial goals

---

## 4. Key Features & Requirements

### 4.1 Authentication & User Management
| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | User signup with full name, owner name, email, password | Must Have |
| AUTH-2 | Secure login with JWT token returned | Must Have |
| AUTH-3 | Password hashed with bcrypt before storage | Must Have |
| AUTH-4 | View and edit user profile | Must Have |
| AUTH-5 | Password recovery flow | Should Have |
| AUTH-6 | Protected routes redirect to login if not authenticated | Must Have |

### 4.2 Expense Management
| ID | Requirement | Priority |
|---|---|---|
| EXP-1 | Add expense with amount, category, date, department, payment method | Must Have |
| EXP-2 | View list of all expenses with filtering | Must Have |
| EXP-3 | Delete expense | Must Have |
| EXP-4 | Auto-create new expense categories on first use | Should Have |
| EXP-5 | Support recurring expense frequency (one-time, monthly, etc.) | Could Have |

### 4.3 Revenue Management
| ID | Requirement | Priority |
|---|---|---|
| REV-1 | Add revenue entry with source, amount, date, department | Must Have |
| REV-2 | View, edit, and delete revenue entries | Must Have |
| REV-3 | Link revenue to business departments | Should Have |

### 4.4 Budget Management
| ID | Requirement | Priority |
|---|---|---|
| BUD-1 | Create monthly budget per department | Must Have |
| BUD-2 | View actual spend vs budget side by side | Must Have |
| BUD-3 | Prevent duplicate budget for same dept/month/year | Must Have |
| BUD-4 | Show budget utilization percentage | Must Have |

### 4.5 Dashboard
| ID | Requirement | Priority |
|---|---|---|
| DASH-1 | Total Revenue KPI card | Must Have |
| DASH-2 | Total Expenses KPI card | Must Have |
| DASH-3 | Net Profit / Net Loss KPI card | Must Have |
| DASH-4 | Budget Utilization KPI card | Must Have |
| DASH-5 | Revenue & Expense Trend line chart (monthly) | Must Have |
| DASH-6 | Revenue vs Expenses bar chart (monthly comparison) | Must Have |
| DASH-7 | Expense Category Breakdown pie chart | Must Have |
| DASH-8 | Top 6 Expense Categories bar chart | Must Have |
| DASH-9 | Financial Health Score card | Must Have |
| DASH-10 | Default filter: Last 3 Months (to show historical data) | Must Have |
| DASH-11 | Refresh button to reload all data | Should Have |

### 4.6 Financial Health Scoring
| ID | Requirement | Priority |
|---|---|---|
| FHS-1 | Compute overall score 0–100 | Must Have |
| FHS-2 | 5-dimension breakdown: Profitability, Expense Ratio, Revenue Growth, Budget Efficiency, Cash Flow Stability | Must Have |
| FHS-3 | Status label: Excellent / Good / Fair / Poor / Critical | Must Have |
| FHS-4 | Show total revenue, expenses, net profit context | Must Have |
| FHS-5 | Store historical health scores | Should Have |

### 4.7 Predictions / Forecasting
| ID | Requirement | Priority |
|---|---|---|
| PRED-1 | Forecast next month's expenses using linear regression | Must Have |
| PRED-2 | Forecast next month's revenue | Must Have |
| PRED-3 | Forecast net cash flow | Must Have |
| PRED-4 | Show confidence score for each prediction | Must Have |
| PRED-5 | Show comparison to current budget (if set) | Should Have |
| PRED-6 | Require minimum 3 months of data for predictions | Must Have |

### 4.8 Goals Tracking
| ID | Requirement | Priority |
|---|---|---|
| GOAL-1 | Create business financial goals with title, target amount, deadline | Must Have |
| GOAL-2 | Track progress toward each goal | Must Have |
| GOAL-3 | Status labels: On Track / At Risk / Completed | Must Have |
| GOAL-4 | Estimate completion based on revenue/expense trajectory | Should Have |
| GOAL-5 | Edit and delete goals | Must Have |

### 4.9 Financial Reports
| ID | Requirement | Priority |
|---|---|---|
| RPT-1 | Full financial report with summary + insights | Must Have |
| RPT-2 | Date range filter (this month / 3 / 6 / 12 months / custom) | Must Have |
| RPT-3 | Export report as PDF | Should Have |
| RPT-4 | AI-generated textual insights | Should Have |

### 4.10 Investment Recommendations (AI Module)
| ID | Requirement | Priority |
|---|---|---|
| INV-1 | Investments hub showing available surplus and options | Must Have |
| INV-2 | Stock recommendations based on financial position | Must Have |
| INV-3 | Gold investment analysis | Must Have |
| INV-4 | Fixed Deposit (FD) comparison tool | Must Have |
| INV-5 | Personal portfolio tracker | Must Have |
| INV-6 | AI-powered personalized investment recommendations | Must Have |
| INV-7 | Recommendations adapt to surplus amount (conservative/moderate/aggressive) | Should Have |

### 4.11 Growth Plan Recommendations
| ID | Requirement | Priority |
|---|---|---|
| GROW-1 | Analyze surplus money and generate growth actions | Must Have |
| GROW-2 | Prioritize recommendations by impact | Should Have |
| GROW-3 | Recommendations span: cost reduction, revenue growth, investment | Should Have |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Dashboard loads within 3s on first visit (Render cold-start excluded) |
| **Security** | JWT auth on all protected endpoints; bcrypt password hashing; HTTPS on production |
| **Scalability** | PostgreSQL connection pooling; stateless Express API |
| **Reliability** | API returns `{ success, data, message }` shape consistently |
| **Usability** | Mobile-responsive layout (MUI breakpoints); loading states on all async operations |
| **Browser Support** | Chrome, Firefox, Safari (latest 2 versions) |
| **Accessibility** | MUI components with aria labels; keyboard-navigable forms |

---

## 6. User Stories

### Epic 1: Financial Visibility
> As a business owner, I want to see my total revenue, expenses, and profit at a glance so I know the health of my business today.

- As a user, I can add an expense and see it reflected in my dashboard totals immediately
- As a user, I can add a revenue entry and see my net profit update
- As a user, I can filter my dashboard to show last 3 months, 6 months, or 12 months of data

### Epic 2: Risk Detection
> As a business owner, I want to know if I'm spending too much in any category so I can correct course before it's too late.

- As a user, I can see my expense category breakdown so I know where money goes
- As a user, I get a Financial Health Score so I know if my business is in danger
- As a user, I can set monthly budgets and see when I've exceeded them

### Epic 3: Predictive Intelligence
> As a business owner, I want to know what next month will look like financially so I can prepare.

- As a user, I can view a predicted expense amount for next month with a confidence percentage
- As a user, I can view a predicted revenue forecast for next month
- As a user, I see a warning if my predicted expenses will exceed my budget

### Epic 4: Surplus Deployment
> As a business owner, I want to know what to do with my extra money to make it grow.

- As a user, I can see investment options (stocks, gold, FDs) recommended for my surplus amount
- As a user, I can compare FD rates from different banks
- As a user, I get personalized AI recommendations based on my financial health score and surplus

### Epic 5: Growth Planning
> As a business owner, I want a roadmap of actions I can take to grow my revenue and business.

- As a user, I can set a revenue target goal and track my progress toward it
- As a user, I receive growth plan recommendations prioritized by impact
- As a user, I can track multiple goals simultaneously

---

## 7. Acceptance Criteria

### Dashboard (DASH)
- [ ] KPI cards show real numbers from last 3 months of data by default
- [ ] All 4 charts render without errors when data exists
- [ ] Empty state messages shown when no data for a date range
- [ ] Refresh button reloads all data from API
- [ ] Period label shows "Last 3 Months" by default

### Predictions (PRED)
- [ ] Expense prediction shows predicted amount and confidence %
- [ ] Revenue prediction shows predicted amount and confidence %
- [ ] Cash flow prediction shows net direction
- [ ] Shows "Insufficient data" message if fewer than 3 months of history

### Investments (INV)
- [ ] Investments hub displays surplus calculation
- [ ] Each investment sub-page loads without errors
- [ ] AI Recommendations page displays personalized advice
- [ ] Portfolio page allows tracking personal holdings

### Authentication (AUTH)
- [ ] Signup with valid data creates account and logs in
- [ ] Login with correct credentials returns JWT
- [ ] Protected routes redirect to /login without token
- [ ] Profile page shows and allows editing user details

---

## 8. Out of Scope (v1.0)

- Real-time stock price data integration (live market feeds)
- Bank account / UPI / GST API integration
- Multi-user / team accounts
- Mobile native app (iOS/Android)
- Multi-currency support
- Tax computation / GST filing
- Email notifications / alerts
- Webhook integrations

---

## 9. Future Roadmap

| Version | Feature |
|---|---|
| v1.1 | Centralized API client (remove hardcoded URLs); httpOnly cookie auth |
| v1.1 | Protect `/budget` route with ProtectedRoute |
| v1.2 | Integrate Python ML pipeline into Express API via child_process or microservice |
| v1.2 | Real-time investment data (stock prices, gold rates) via public APIs |
| v2.0 | Bank statement import (CSV/PDF parsing) |
| v2.0 | GST / tax module |
| v2.0 | WhatsApp / email alerts for budget overruns |
| v3.0 | Multi-tenant / team support |
| v3.0 | Native mobile app |

---

## 10. Metrics for Success

| Metric | Target |
|---|---|
| Dashboard load time | < 3 seconds |
| Prediction accuracy (MAPE) | < 20% on 3+ months of data |
| Financial Health Score coverage | All 5 dimensions computed |
| Investment recommendation relevance | Surplus-matched recommendation displayed |
| User can complete full financial setup | < 10 minutes from signup |

---

## 11. Dependencies & Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Render cold start delays API | High | Medium | Upgrade plan or add keep-alive ping |
| Neon PostgreSQL connection drop | Low | High | pg connection pool + retry logic |
| Insufficient historical data for predictions | Medium | High | Show clear "need 3+ months" message |
| Python ML pipeline not integrated | High | Medium | Node.js implements equivalent logic as fallback |
| JWT stored in localStorage (XSS risk) | Medium | High | Move to httpOnly cookie in v1.1 |

---

*This document represents the product requirements for v1.0 of the AI-Based Financial Adviser System.*  
*Last updated: 2026-10-02*
