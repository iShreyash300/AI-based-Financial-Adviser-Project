import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StockRecommendationsPage from "./stockRecommendationsPage";
import api from "../../../services/api";

jest.mock("../../../services/api");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

const mock12Stocks = Array.from({ length: 12 }, (_, i) => ({
  symbol: `SYM${i + 1}.NS`,
  name: `Test Equity ${i + 1}`,
  price: 1000 + i * 50,
  change: "+15.00",
  percentChange: "+1.20%",
  isPositive: true,
  risk: "Moderate",
  sector: "Technology",
  yearReturn: "+10.0%",
  marketCap: "Rs.5.00 Lakh Cr",
  peRatio: "22.5",
}));

describe("StockRecommendationsPage See More / Show Less Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders initial view with exactly 6 real stock cards and See More button", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          stocks: mock12Stocks,
          marketStatus: "OPEN",
          marketMessage: "Market Open",
          dataDelayNotice: "Delayed ~15m",
        },
      },
    });

    render(<StockRecommendationsPage />);

    // Wait for stocks to load
    await waitFor(() => {
      expect(screen.getByText("Test Equity 1")).toBeInTheDocument();
    });

    // Exactly 6 cards should be visible initially
    expect(screen.getByText("Test Equity 1")).toBeInTheDocument();
    expect(screen.getByText("Test Equity 6")).toBeInTheDocument();
    expect(screen.queryByText("Test Equity 7")).not.toBeInTheDocument();

    // See More button should be visible with remainder count
    const seeMoreBtn = screen.getByRole("button", { name: /See More/i });
    expect(seeMoreBtn).toBeInTheDocument();
    expect(seeMoreBtn).toHaveTextContent("See More (6 More Stocks)");
  });

  test("clicking See More reveals all 12 stocks and toggles to Show Less", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          stocks: mock12Stocks,
          marketStatus: "CLOSED",
          marketMessage: "Market Closed",
        },
      },
    });

    render(<StockRecommendationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Equity 1")).toBeInTheDocument();
    });

    const seeMoreBtn = screen.getByRole("button", { name: /See More/i });
    fireEvent.click(seeMoreBtn);

    // All 12 stocks should now be displayed
    expect(screen.getByText("Test Equity 7")).toBeInTheDocument();
    expect(screen.getByText("Test Equity 12")).toBeInTheDocument();

    // Button should now show "Show Less"
    const showLessBtn = screen.getByRole("button", { name: /Show Less/i });
    expect(showLessBtn).toBeInTheDocument();

    // Clicking Show Less returns to 6 stocks
    fireEvent.click(showLessBtn);
    expect(screen.getByText("Test Equity 6")).toBeInTheDocument();
    expect(screen.queryByText("Test Equity 7")).not.toBeInTheDocument();
  });

  test("displays error alert and does not display mock data on API failure", async () => {
    api.get.mockRejectedValueOnce(new Error("Network connection error"));

    render(<StockRecommendationsPage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to connect to live stock market feed/i)).toBeInTheDocument();
    // Verify no cards or mock cards rendered
    expect(screen.queryByText("Test Equity 1")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /See More/i })).not.toBeInTheDocument();
  });
});
