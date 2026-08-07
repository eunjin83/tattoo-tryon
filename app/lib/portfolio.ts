import fs from "fs";
import path from "path";
import { PortfolioItem } from "../components/Portfolio";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_\s]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function categoryFromFilename(filename: string) {
  const name = filename.toLowerCase();

  if (name.includes("skull")) return "Skulls";

  const animals = [
    "cat",
    "cow",
    "crow",
    "bird",
    "lion",
    "snake",
    "dragonfly",
    "unicorn",
    "raven",
    "wolf",
    "tiger",
    "eagle",
    "dragon",
    "butterfly",
  ];

  if (animals.some((k) => name.includes(k))) return "Animals";

  return "Black & Grey";
}

export function getPortfolioItems(): PortfolioItem[] {
  const dir = path.join(process.cwd(), "public", "portfolio");

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXTENSIONS.test(f))
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
    .map((filename, index) => ({
      id: index + 1,
      image: `/portfolio/${encodeURIComponent(filename)}`,
      title: titleFromFilename(filename),
      description: "",
      category: categoryFromFilename(filename),
    }));
}