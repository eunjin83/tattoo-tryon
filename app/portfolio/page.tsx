import fs from "fs";
import path from "path";
import Portfolio, { type PortfolioItem } from "../components/Portfolio";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_\s]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryFromFilename(filename: string) {
  const name = filename.toLowerCase();

  if (name.includes("skull")) return "Skulls";

  const animalKeywords = [
    "cat",
    "cow",
    "crow",
    "bird",
    "lion",
    "snake",
    "dragonfly",
    "unicorn",
    "raven",
    "bison",
    "wolf",
    "tiger",
    "eagle",
    "dragon",
    "butterfly",
  ];

  if (animalKeywords.some((keyword) => name.includes(keyword))) {
    return "Animals";
  }

  if (
    name.includes("chrome") ||
    name.includes("realism") ||
    name.includes("eye") ||
    name.includes("nail")
  ) {
    return "Realism";
  }

  return "Black & Grey";
}

function getPortfolioItems(): PortfolioItem[] {
  const portfolioDirectory = path.join(process.cwd(), "public", "portfolio");

  if (!fs.existsSync(portfolioDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(portfolioDirectory)
    .filter((filename) => IMAGE_EXTENSIONS.test(filename))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  return files.map((filename, index) => {
    const title = titleFromFilename(filename);
    const category = categoryFromFilename(filename);

    return {
      id: index + 1,
      image: `/portfolio/${encodeURIComponent(filename)}`,
      title,
      description: `${title} tattoo by ZKINK, San Francisco tattoo artist.`,
      category,
    };
  });
}

export default function PortfolioPage() {
  const portfolioItems = getPortfolioItems();

  return <Portfolio portfolioItems={portfolioItems} />;
}
