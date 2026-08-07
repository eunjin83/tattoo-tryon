import Portfolio from "../components/Portfolio";
import { getPortfolioItems } from "../lib/portfolio";

export default function PortfolioPage() {
  return (
    <Portfolio portfolioItems={getPortfolioItems()} />
  );
}