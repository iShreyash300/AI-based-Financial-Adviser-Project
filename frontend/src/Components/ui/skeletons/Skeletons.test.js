import React from "react";
import { render } from "@testing-library/react";
import {
  KpiCardSkeleton,
  ChartCardSkeleton,
  FinancialHealthScoreCardSkeleton,
} from "./index";
import CustomCard from "../CustomCard";

describe("Unified Skeleton UI Suite", () => {
  test("renders KpiCardSkeleton properly", () => {
    const { container } = render(<KpiCardSkeleton />);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  test("renders ChartCardSkeleton with bar, line, and pie types", () => {
    const { container: barContainer } = render(
      <ChartCardSkeleton title="Test Bar Chart" type="bar" />
    );
    expect(barContainer.querySelector(".MuiSkeleton-root")).toBeInTheDocument();

    const { container: lineContainer } = render(
      <ChartCardSkeleton title="Test Line Chart" type="line" />
    );
    expect(lineContainer.querySelector(".MuiSkeleton-root")).toBeInTheDocument();

    const { container: pieContainer } = render(
      <ChartCardSkeleton title="Test Pie Chart" type="pie" />
    );
    expect(pieContainer.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  test("renders FinancialHealthScoreCardSkeleton properly", () => {
    const { container } = render(<FinancialHealthScoreCardSkeleton />);
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });

  test("renders CustomCard with loading skeleton properly", () => {
    const { container } = render(
      <CustomCard title="Revenue" amount="10,000" loading={true} />
    );
    expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
  });
});
