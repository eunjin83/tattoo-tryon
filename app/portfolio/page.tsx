import type { Metadata } from "next";
import Portfolio from "../components/Portfolio";
import { getPortfolioItems } from "../lib/portfolio";

export const metadata: Metadata = {
  title: "Tattoo Portfolio",
  description:
    "Explore custom black and grey, realism, fine line, and tattoo projects by ZKINK, a San Francisco tattoo artist.",
};

export default function PortfolioPage() {
  return (
    <Portfolio portfolioItems={getPortfolioItems()} />
  );
}