import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

import { CategoryCard } from "@/components/ui/CategoryCard";
import { MasterCard } from "@/components/ui/MasterCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { CardSkeleton, ListSkeleton } from "@/components/ui/Skeleton";

describe("CategoryCard", () => {
  it("renders category name", () => {
    render(<CategoryCard id="1" title_uz="Santexnik" icon={null} is_featured={false} />);
    expect(screen.getByText("Santexnik")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(<CategoryCard id="2" title_uz="Elektrik" icon={null} is_featured={false} />);
    expect(screen.getByText("Elektrik")).toBeInTheDocument();
  });
});

describe("MasterCard", () => {
  const baseProps = {
    id: "1",
    user: { full_name: "Alisher Karimov", avatar: null },
    rating: 4.8,
    completed_jobs: 145,
    is_online: true,
    is_verified: true,
  };

  it("renders master name", () => {
    render(<MasterCard {...baseProps} />);
    expect(screen.getByText("Alisher Karimov")).toBeInTheDocument();
  });

  it("shows rating", () => {
    render(<MasterCard {...baseProps} />);
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("shows completed jobs", () => {
    render(<MasterCard {...baseProps} />);
    expect(screen.getByText("145 jobs done")).toBeInTheDocument();
  });
});

describe("SearchBar", () => {
  it("renders search input", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

describe("Skeleton components", () => {
  it("renders CardSkeleton", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders ListSkeleton with correct count", () => {
    const { container } = render(<ListSkeleton count={3} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });
});
