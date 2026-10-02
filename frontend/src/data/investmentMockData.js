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
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    price: 2987.50,
    change: "+1.85%",
    isPositive: true,
    risk: "Medium Risk",
    sector: "Conglomerate",
    yearReturn: "+24.5%",
    marketCap: "₹20.2 Lakh Cr",
    peRatio: "26.4",
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    price: 1643.20,
    change: "+1.32%",
    isPositive: true,
    risk: "Medium Risk",
    sector: "Banking",
    yearReturn: "+18.2%",
    marketCap: "₹12.5 Lakh Cr",
    peRatio: "19.8",
  },
  {
    symbol: "TCS.NS",
    name: "TCS",
    price: 4156.30,
    change: "+2.10%",
    isPositive: true,
    risk: "Medium Risk",
    sector: "IT Services",
    yearReturn: "+21.0%",
    marketCap: "₹15.1 Lakh Cr",
    peRatio: "31.2",
  },
  {
    symbol: "INFY.NS",
    name: "Infosys",
    price: 1820.00,
    change: "+0.95%",
    isPositive: true,
    risk: "Low - Medium Risk",
    sector: "IT Services",
    yearReturn: "+15.8%",
    marketCap: "₹7.5 Lakh Cr",
    peRatio: "24.6",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank",
    price: 1210.50,
    change: "+1.65%",
    isPositive: true,
    risk: "Medium Risk",
    sector: "Banking",
    yearReturn: "+22.4%",
    marketCap: "₹8.4 Lakh Cr",
    peRatio: "17.9",
  },
  {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors",
    price: 985.00,
    change: "+3.10%",
    isPositive: true,
    risk: "High Risk",
    sector: "Automotive",
    yearReturn: "+45.2%",
    marketCap: "₹3.6 Lakh Cr",
    peRatio: "15.3",
  },
];

export const goldData = {
  currentPrice: 7154, // per gram
  change: "+0.56%",
  isPositive: true,
  risk: "Low - Moderate",
  recommendedOption: "Gold ETF / SGB",
  suggestedInvestment: "₹15,000 – ₹20,000",
  allocation: "20% – 25%",
  historicalPrices: [
    { month: "Oct", price: 6450 },
    { month: "Nov", price: 6620 },
    { month: "Dec", price: 6800 },
    { month: "Jan", price: 6950 },
    { month: "Feb", price: 7080 },
    { month: "Mar", price: 7154 },
  ],
  options: [
    {
      name: "Sovereign Gold Bonds (SGB)",
      returnRate: "2.50% p.a. + Gold Appreciation",
      taxBenefit: "Tax-free capital gains on maturity (8 Yrs)",
      minInvestment: "₹7,154 (1 Gram)",
      riskLevel: "Lowest",
      tag: "Recommended for Long Term",
    },
    {
      name: "Gold ETFs (Nippon / SBI Gold BeES)",
      returnRate: "Tracks Live Physical Gold Price",
      taxBenefit: "High Liquidity, Trade like stocks",
      minInvestment: "₹100",
      riskLevel: "Low",
      tag: "Best for Liquidity",
    },
    {
      name: "TATA Gold ETF (TGB)",
      returnRate: "Tracks Live Physical Gold Price",
      taxBenefit: "High Liquidity, Trade like stocks",
      minInvestment: "₹100",
      riskLevel: "Low",
      tag: "Best for Liquidity",
    },
    {
      name: "Digital Gold (Augmont / MMTC-PAMP)",
      returnRate: "100% 24K Pure Gold",
      taxBenefit: "Instant Buy/Sell 24/7",
      minInvestment: "₹10",
      riskLevel: "Low - Moderate",
      tag: "Easy Micro Investment",
    }
  ]
};

export const bankFdData = [
  {
    bankName: "HDFC Bank",
    logoText: "HDFC",
    color: "#004B8D",
    tenure: "2 Years",
    rate: "7.10%",
    maturityOn1L: 114710,
    ratesByTenure: { "1 Year": "6.60%", "2 Years": "7.10%", "3 Years": "7.00%", "5 Years": "7.00%" },
    rating: "AAA Rated",
    isRecommended: true,
  },
  {
    bankName: "ICICI Bank",
    logoText: "ICICI",
    color: "#F37021",
    tenure: "2 Years",
    rate: "7.05%",
    maturityOn1L: 114160,
    ratesByTenure: { "1 Year": "6.70%", "2 Years": "7.05%", "3 Years": "7.00%", "5 Years": "6.90%" },
    rating: "AAA Rated",
  },
  {
    bankName: "SBI Bank",
    logoText: "SBI",
    color: "#280071",
    tenure: "2 Years",
    rate: "6.95%",
    maturityOn1L: 112970,
    ratesByTenure: { "1 Year": "6.80%", "2 Years": "6.95%", "3 Years": "6.75%", "5 Years": "6.50%" },
    rating: "Government Backed (AAA)",
  },
  {
    bankName: "Axis Bank",
    logoText: "AXIS",
    color: "#971237",
    tenure: "2 Years",
    rate: "7.20%",
    maturityOn1L: 114920,
    ratesByTenure: { "1 Year": "6.70%", "2 Years": "7.20%", "3 Years": "7.10%", "5 Years": "7.00%" },
    rating: "AAA Rated",
  },
  {
    bankName: "Kotak Mahindra Bank",
    logoText: "KOTAK",
    color: "#ED1C24",
    tenure: "2 Years",
    rate: "7.15%",
    maturityOn1L: 114815,
    ratesByTenure: { "1 Year": "6.50%", "2 Years": "7.15%", "3 Years": "7.00%", "5 Years": "6.85%" },
    rating: "AAA Rated",
  },
];

export const myPortfolioData = [
  {
    id: 1,
    name: "Reliance Industries",
    type: "Stock Market",
    investedAmount: 25000,
    currentValue: 27200,
    profitLoss: 2200,
    returnPercent: "+8.80%",
    isPositive: true,
    date: "2026-01-15",
  },
  {
    id: 2,
    name: "Sovereign Gold Bond (SGB 2026)",
    type: "Gold",
    investedAmount: 15000,
    currentValue: 15600,
    profitLoss: 600,
    returnPercent: "+4.00%",
    isPositive: true,
    date: "2026-02-01",
  },
  {
    id: 3,
    name: "HDFC Fixed Deposit",
    type: "Bank FD",
    investedAmount: 10000,
    currentValue: 10400,
    profitLoss: 400,
    returnPercent: "+4.00%",
    isPositive: true,
    date: "2025-11-10",
  },
];

export const simulatorRates = {
  stockMarket: 0.125, // 12.5%
  gold: 0.068,       // 6.8%
  bankFd: 0.070,     // 7.0%
};
