// Mock data for FinAI Investment Module

export const summaryData = {
  availableToInvest: 75000,
  availableNote: "From current surplus",
  totalInvested: 50000,
  investedNote: "Across all investments",
  currentValue: 53200,
  valueChange: "+6.40% from invested",
  profitLoss: 3200,
  profitChange: "+6.40% overall returns",
};

export const aiAdvisorData = {
  riskProfile: "Moderate",
  investmentPeriod: "3 Years",
  availableAmount: 75000,
  portfolioAllocation: [
    { label: "Stock Market", percentage: 50, amount: 37500, color: "#7B61FF", risk: "Moderate - High" },
    { label: "Gold", percentage: 20, amount: 15000, color: "#FFB800", risk: "Low - Moderate" },
    { label: "Bank FD", percentage: 30, amount: 22500, color: "#00C853", risk: "Low Risk" },
  ],
  explanations: {
    stockMarket: "Equities provide strong inflation-beating long term growth suited for your 3-year horizon.",
    gold: "Gold acts as a safe-haven hedge against market volatility and currency fluctuations.",
    bankFd: "Fixed deposits provide guaranteed capital safety and stable interest payouts.",
  }
};

export const stocksData = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2987.50, change: "+1.85%", isPositive: true, risk: "Medium Risk", sector: "Conglomerate", yearReturn: "+24.5%", marketCap: "Rs.20.2 Lakh Cr", peRatio: "26.4" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", price: 1643.20, change: "+1.32%", isPositive: true, risk: "Medium Risk", sector: "Banking", yearReturn: "+18.2%", marketCap: "Rs.12.5 Lakh Cr", peRatio: "19.8" },
  { symbol: "TCS.NS", name: "TCS", price: 4156.30, change: "+2.10%", isPositive: true, risk: "Medium Risk", sector: "IT Services", yearReturn: "+21.0%", marketCap: "Rs.15.1 Lakh Cr", peRatio: "31.2" },
  { symbol: "INFY.NS", name: "Infosys", price: 1820.00, change: "+0.95%", isPositive: true, risk: "Low - Medium Risk", sector: "IT Services", yearReturn: "+15.8%", marketCap: "Rs.7.5 Lakh Cr", peRatio: "24.6" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1210.50, change: "+1.65%", isPositive: true, risk: "Medium Risk", sector: "Banking", yearReturn: "+22.4%", marketCap: "Rs.8.4 Lakh Cr", peRatio: "17.9" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", price: 985.00, change: "+3.10%", isPositive: true, risk: "High Risk", sector: "Automotive", yearReturn: "+45.2%", marketCap: "Rs.3.6 Lakh Cr", peRatio: "15.3" },
];

export const goldData = {
  currentPrice: 7154,
  change: "+0.56%",
  isPositive: true,
  risk: "Low - Moderate",
  recommendedOption: "Gold ETF / SGB",
  suggestedInvestment: "Rs.15,000 - Rs.20,000",
  allocation: "20% - 25%",
  historicalPrices: [
    { month: "Oct", price: 6450 }, { month: "Nov", price: 6620 }, { month: "Dec", price: 6800 },
    { month: "Jan", price: 6950 }, { month: "Feb", price: 7080 }, { month: "Mar", price: 7154 },
  ],
  options: [
    { name: "Sovereign Gold Bonds (SGB)", returnRate: "2.50% p.a. + Gold Appreciation", taxBenefit: "Tax-free capital gains on maturity (8 Yrs)", minInvestment: "Rs.7,154 (1 Gram)", riskLevel: "Lowest", tag: "Recommended for Long Term" },
    { name: "Gold ETFs (Nippon / SBI Gold BeES)", returnRate: "Tracks Live Physical Gold Price", taxBenefit: "High Liquidity, Trade like stocks", minInvestment: "Rs.100", riskLevel: "Low", tag: "Best for Liquidity" },
    { name: "TATA Gold ETF (TGB)", returnRate: "Tracks Live Physical Gold Price", taxBenefit: "High Liquidity, Trade like stocks", minInvestment: "Rs.100", riskLevel: "Low", tag: "Best for Liquidity" },
    { name: "Digital Gold (Augmont / MMTC-PAMP)", returnRate: "100% 24K Pure Gold", taxBenefit: "Instant Buy/Sell 24/7", minInvestment: "Rs.10", riskLevel: "Low - Moderate", tag: "Easy Micro Investment" },
  ]
};

export const bankFdData = [
  { bankName: "HDFC Bank", logoText: "HDFC", color: "#004B8D", tenure: "2 Years", rate: "7.10%", maturityOn1L: 114710, ratesByTenure: { "1 Year": "6.60%", "2 Years": "7.10%", "3 Years": "7.00%", "5 Years": "7.00%" }, rating: "AAA Rated", isRecommended: true },
  { bankName: "ICICI Bank", logoText: "ICICI", color: "#F37021", tenure: "2 Years", rate: "7.05%", maturityOn1L: 114160, ratesByTenure: { "1 Year": "6.70%", "2 Years": "7.05%", "3 Years": "7.00%", "5 Years": "6.90%" }, rating: "AAA Rated" },
  { bankName: "SBI Bank", logoText: "SBI", color: "#280071", tenure: "2 Years", rate: "6.95%", maturityOn1L: 112970, ratesByTenure: { "1 Year": "6.80%", "2 Years": "6.95%", "3 Years": "6.75%", "5 Years": "6.50%" }, rating: "Government Backed (AAA)" },
  { bankName: "Axis Bank", logoText: "AXIS", color: "#971237", tenure: "2 Years", rate: "7.20%", maturityOn1L: 114920, ratesByTenure: { "1 Year": "6.70%", "2 Years": "7.20%", "3 Years": "7.10%", "5 Years": "7.00%" }, rating: "AAA Rated" },
  { bankName: "Kotak Mahindra Bank", logoText: "KOTAK", color: "#ED1C24", tenure: "2 Years", rate: "7.15%", maturityOn1L: 114815, ratesByTenure: { "1 Year": "6.50%", "2 Years": "7.15%", "3 Years": "7.00%", "5 Years": "6.85%" }, rating: "AAA Rated" },
];

export const myPortfolioData = [
  { id: 1, name: "Reliance Industries", type: "Stock Market", investedAmount: 25000, currentValue: 27200, profitLoss: 2200, returnPercent: "+8.80%", isPositive: true, date: "2026-01-15" },
  { id: 2, name: "Sovereign Gold Bond (SGB 2026)", type: "Gold", investedAmount: 15000, currentValue: 15600, profitLoss: 600, returnPercent: "+4.00%", isPositive: true, date: "2026-02-01" },
  { id: 3, name: "HDFC Fixed Deposit", type: "Bank FD", investedAmount: 10000, currentValue: 10400, profitLoss: 400, returnPercent: "+4.00%", isPositive: true, date: "2025-11-10" },
];

export const simulatorRates = {
  stockMarket: 0.125,
  gold: 0.068,
  bankFd: 0.070,
};

// ─── Investment Allocation Page Mock Data ────────────────────────────────────
// Replace individual keys with real API responses in Phase 2.

export const allocationSummary = {
  totalInvested: 125000,
  totalInvestedNote: "Across all investments",
  currentValue: 138750,
  currentValueChange: 10.95,
  totalProfit: 13750,
  totalProfitPercent: 10.95,
  todayChange: 250,
  todayChangePercent: 0.18,
  riskProfile: "Moderate",
  riskNote: "Based on current financial data",
  availableToInvest: 75000,
  availableNote: "From current surplus",
};

export const investmentAllocation = [
  { assetClass: "Stock Market", allocation: 40, investedAmount: 50000, currentValue: 57500, returnPercentage: 15.0, profit: 7500, color: "#6366F1" },
  { assetClass: "Gold", allocation: 20, investedAmount: 25000, currentValue: 27000, returnPercentage: 8.0, profit: 2000, color: "#F59E0B" },
  { assetClass: "Bank FD", allocation: 40, investedAmount: 50000, currentValue: 54250, returnPercentage: 8.5, profit: 4250, color: "#10B981" },
];

export const performanceHistory = [
  { month: "Mar 2026", portfolioValue: 120000, investedAmount: 118000 },
  { month: "Apr 2026", portfolioValue: 119000, investedAmount: 119000 },
  { month: "May 2026", portfolioValue: 123500, investedAmount: 120000 },
  { month: "Jun 2026", portfolioValue: 128000, investedAmount: 122000 },
  { month: "Jul 2026", portfolioValue: 132500, investedAmount: 124000 },
  { month: "Aug 2026", portfolioValue: 138750, investedAmount: 125000 },
];

export const monthlyReturns = {
  thisMonth: { value: 250, percent: 0.18, isPositive: true },
  bestMonth: { label: "Jul 2026", value: 4200, percent: 3.35, isPositive: true },
  worstMonth: { label: "Apr 2026", value: -1150, percent: -0.92, isPositive: false },
};

export const recentInvestments = [
  { id: 1, assetClass: "Stock Market", instrument: "Reliance Industries", investedAmount: 20000, purchaseDate: "10 Aug 2026", currentValue: 22800, profitLoss: 2800, isPositive: true },
  { id: 2, assetClass: "Gold", instrument: "Gold ETF", investedAmount: 25000, purchaseDate: "05 Aug 2026", currentValue: 27000, profitLoss: 2000, isPositive: true },
  { id: 3, assetClass: "Bank FD", instrument: "HDFC Bank FD", investedAmount: 50000, purchaseDate: "01 Aug 2026", currentValue: 50420, profitLoss: 420, isPositive: true },
  { id: 4, assetClass: "Stock Market", instrument: "TCS", investedAmount: 30000, purchaseDate: "28 Jul 2026", currentValue: 34700, profitLoss: 4700, isPositive: true },
];
