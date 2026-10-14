import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StockRecommendationCard from "./StockRecommendationCard";

const mockStock = {
  symbol: "RELIANCE.NS",
  name: "Reliance Industries Limited",
  price: 2950.5,
  change: "+35.20",
  percentChange: "+1.21%",
  isPositive: true,
  risk: "Moderate",
  sector: "Energy",
  yearReturn: "+22.4%",
  marketCap: "₹19.95 Lakh Cr",
  peRatio: "25.4",
};

describe("StockRecommendationCard Unit Tests", () => {
  test("renders company name, symbol, price, and key metrics correctly", () => {
    render(<StockRecommendationCard stock={mockStock} />);

    expect(screen.getByText("Reliance Industries Limited")).toBeInTheDocument();
    expect(screen.getByText("RELIANCE.NS")).toBeInTheDocument();
    expect(screen.getByText("+35.20 (+1.21%)")).toBeInTheDocument();
    expect(screen.getByText("+22.4%")).toBeInTheDocument();
    expect(screen.getByText("25.4")).toBeInTheDocument();
    expect(screen.getByText("₹19.95 Lakh Cr")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
  });

  test("triggers onViewDetails callback when View Details is clicked", () => {
    const handleViewDetails = jest.fn();
    render(<StockRecommendationCard stock={mockStock} onViewDetails={handleViewDetails} />);

    const detailsBtn = screen.getByRole("button", { name: /View Details/i });
    fireEvent.click(detailsBtn);

    expect(handleViewDetails).toHaveBeenCalledTimes(1);
    expect(handleViewDetails).toHaveBeenCalledWith(mockStock);
  });

  test("triggers onBuyStock callback when Buy Stock is clicked", () => {
    const handleBuy = jest.fn();
    render(<StockRecommendationCard stock={mockStock} onBuyStock={handleBuy} />);

    const buyBtn = screen.getByRole("button", { name: /Buy Stock/i });
    fireEvent.click(buyBtn);

    expect(handleBuy).toHaveBeenCalledTimes(1);
    expect(handleBuy).toHaveBeenCalledWith(mockStock);
  });

  test("toggles watchlist callback when bookmark button is clicked", () => {
    const handleToggleWatchlist = jest.fn();
    render(
      <StockRecommendationCard
        stock={mockStock}
        isWatchlisted={false}
        onToggleWatchlist={handleToggleWatchlist}
      />
    );

    const bookmarkBtn = screen.getByTitle("Add to Watchlist");
    fireEvent.click(bookmarkBtn);

    expect(handleToggleWatchlist).toHaveBeenCalledTimes(1);
    expect(handleToggleWatchlist).toHaveBeenCalledWith(mockStock);
  });
});
