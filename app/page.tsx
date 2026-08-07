import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";

import { getPortfolioItems } from "./lib/portfolio";

export default function Home() {
  const portfolioItems = getPortfolioItems().slice(0, 3);

  return (
    <>
      <Hero />
      <Portfolio portfolioItems={portfolioItems} />
      <Contact />
    </>
  );
}