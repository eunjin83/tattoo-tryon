"use client";

import { useEffect, useMemo, useState } from "react";

type PortfolioItem = {
  id: number;
  image: string;
  title: string;
  description: string;
  category: string;
};

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    image: "/portfolio/spartan-and-samurai.JPG",
    title: "Spartan and Samurai",
    description: "Black and grey tattoo combining Spartan and Samurai imagery.",
    category: "Black & Grey",
  },
  {
    id: 2,
    image: "/portfolio/raven-skull.jpeg",
    title: "Raven and Skull",
    description: "Black and grey raven and skull tattoo composition.",
    category: "Skulls",
  },
  {
    id: 3,
    image: "/portfolio/cow-realism.jpeg",
    title: "Cow Realism",
    description: "Detailed black and grey animal realism tattoo.",
    category: "Animals",
  },
  {
    id: 4,
    image: "/portfolio/chess-knight.JPG",
    title: "Chess Knight",
    description: "Realistic black and grey tattoo of an ornate chess knight.",
    category: "Black & Grey",
  },
  {
    id: 5,
    image: "/portfolio/broken-heart.JPG",
    title: "Broken Heart",
    description: "Black and grey broken heart tattoo.",
    category: "Black & Grey",
  },
  {
    id: 6,
    image: "/portfolio/cat-snake.JPG",
    title: "Cat and Snake",
    description: "Black and grey tattoo featuring a cat and snake.",
    category: "Animals",
  },
  {
    id: 7,
    image: "/portfolio/chrome-chain.JPG",
    title: "Chrome Chain",
    description: "Chrome-effect chain tattoo with realistic metallic detail.",
    category: "Realism",
  },
  {
    id: 8,
    image: "/portfolio/crow-skull.JPG",
    title: "Crow and Skull",
    description: "Black and grey crow and skull tattoo composition.",
    category: "Skulls",
  },
  {
    id: 9,
    image: "/portfolio/cupid-bow.JPG",
    title: "Cupid Bow",
    description: "Black and grey Cupid bow tattoo.",
    category: "Black & Grey",
  },
  {
    id: 10,
    image: "/portfolio/dragonfly.JPG",
    title: "Dragonfly",
    description: "Detailed black and grey dragonfly tattoo.",
    category: "Animals",
  },
  {
    id: 11,
    image: "/portfolio/eye.JPG",
    title: "Eye",
    description: "Realistic black and grey eye tattoo.",
    category: "Realism",
  },
  {
    id: 12,
    image: "/portfolio/hand-mini.JPG",
    title: "Mini Hand Tattoos",
    description: "Collection of detailed miniature hand tattoos.",
    category: "Black & Grey",
  },
  {
    id: 13,
    image: "/portfolio/hand-skeleton-rose.JPG",
    title: "Skeleton Hand and Rose",
    description: "Black and grey skeleton hand and rose tattoo.",
    category: "Black & Grey",
  },
  {
    id: 14,
    image: "/portfolio/lion.JPG",
    title: "Lion",
    description: "Detailed black and grey lion realism tattoo.",
    category: "Animals",
  },
  {
    id: 15,
    image: "/portfolio/nail.JPG",
    title: "Nail",
    description: "Black and grey nail tattoo with realistic detail.",
    category: "Realism",
  },
  {
    id: 16,
    image: "/portfolio/playingcards.JPG",
    title: "Playing Cards",
    description: "Black and grey playing cards tattoo.",
    category: "Black & Grey",
  },
  {
    id: 17,
    image: "/portfolio/scale prince 01.jpg",
    title: "Scale Prince",
    description: "Detailed black and grey tattoo composition.",
    category: "Black & Grey",
  },
  {
    id: 18,
    image: "/portfolio/skull-bird.JPG",
    title: "Skull and Bird",
    description: "Black and grey skull and bird tattoo composition.",
    category: "Skulls",
  },
  {
    id: 19,
    image: "/portfolio/skull-broken-wineglass.JPG",
    title: "Skull and Broken Wineglass",
    description: "Black and grey skull and broken wineglass tattoo.",
    category: "Skulls",
  },
  {
    id: 20,
    image: "/portfolio/skull.jpeg",
    title: "Skull",
    description: "Realistic black and grey skull tattoo.",
    category: "Skulls",
  },
  {
    id: 21,
    image: "/portfolio/snake-skull.JPG",
    title: "Snake and Skull",
    description: "Black and grey snake and skull tattoo composition.",
    category: "Skulls",
  },
  {
    id: 22,
    image: "/portfolio/unicorn.JPG",
    title: "Unicorn",
    description: "Detailed black and grey unicorn tattoo.",
    category: "Animals",
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(portfolioItems.map((item) => item.category)))],
    []
  );

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return portfolioItems;
    return portfolioItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null;

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        setZoomed(false);
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => {
          if (current === null) return null;
          return (current + 1) % filteredItems.length;
        });
        setZoomed(false);
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => {
          if (current === null) return null;
          return (current - 1 + filteredItems.length) % filteredItems.length;
        });
        setZoomed(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, filteredItems.length]);

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return (current - 1 + filteredItems.length) % filteredItems.length;
    });
    setZoomed(false);
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return (current + 1) % filteredItems.length;
    });
    setZoomed(false);
  };

  return (
    <section className="portfolio-page">
      <style>{`
        .portfolio-page {
          width: 100%;
          min-height: 100vh;
          padding: 76px 24px 110px;
          box-sizing: border-box;
          background: #080808;
          color: #ffffff;
        }

        .portfolio-inner {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }

        .portfolio-header {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .portfolio-kicker {
          margin: 0 0 14px;
          color: #888888;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .portfolio-title {
          margin: 0;
          font-size: clamp(46px, 7vw, 82px);
          line-height: 0.95;
          font-weight: 500;
          letter-spacing: -0.05em;
        }

        .portfolio-intro {
          margin: 24px auto 0;
          max-width: 640px;
          color: #a8a8a8;
          font-size: 17px;
          line-height: 1.7;
        }

        .portfolio-filters {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 40px;
        }

        .portfolio-filter {
          min-height: 46px;
          padding: 10px 19px;
          border: 1px solid #3a3a3a;
          border-radius: 999px;
          background: #111111;
          color: #d0d0d0;
          font-size: 14px;
          cursor: pointer;
          transition: all 160ms ease;
        }

        .portfolio-filter:hover {
          border-color: #777777;
          color: #ffffff;
        }

        .portfolio-filter[data-active="true"] {
          border-color: #ffffff;
          background: #ffffff;
          color: #111111;
        }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .portfolio-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #292929;
          border-radius: 16px;
          background: #111111;
          cursor: pointer;
          transition:
            transform 180ms ease,
            border-color 180ms ease;
        }

        .portfolio-card:hover {
          transform: translateY(-3px);
          border-color: #555555;
        }

        .portfolio-image-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #151515;
        }

        .portfolio-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 260ms ease;
        }

        .portfolio-card:hover .portfolio-image {
          transform: scale(1.025);
        }

        .portfolio-copy {
          padding: 18px 18px 20px;
        }

        .portfolio-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .portfolio-item-title {
          margin: 0;
          color: #ffffff;
          font-size: 17px;
          font-weight: 600;
        }

        .portfolio-category {
          color: #777777;
          font-size: 12px;
          white-space: nowrap;
        }

        .portfolio-description {
          margin: 9px 0 0;
          color: #929292;
          font-size: 14px;
          line-height: 1.55;
        }

        .portfolio-empty {
          padding: 80px 20px;
          border: 1px solid #292929;
          border-radius: 16px;
          color: #888888;
          text-align: center;
        }

        .portfolio-modal {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.94);
          backdrop-filter: blur(12px);
        }

        .portfolio-modal-content {
          position: relative;
          width: min(100%, 1120px);
          max-height: calc(100vh - 48px);
          display: grid;
          grid-template-rows: minmax(0, 1fr) auto;
          overflow: hidden;
          border: 1px solid #333333;
          border-radius: 18px;
          background: #101010;
        }

        .portfolio-modal-stage {
          position: relative;
          min-height: 420px;
          overflow: auto;
          display: grid;
          place-items: center;
          background: #050505;
        }

        .portfolio-modal-image {
          display: block;
          max-width: 100%;
          max-height: 76vh;
          object-fit: contain;
          cursor: zoom-in;
          transition: transform 180ms ease;
          transform-origin: center;
        }

        .portfolio-modal-image[data-zoomed="true"] {
          max-width: none;
          max-height: none;
          width: auto;
          height: auto;
          transform: scale(1.8);
          cursor: zoom-out;
        }

        .portfolio-modal-copy {
          padding: 20px 22px 24px;
          border-top: 1px solid #252525;
        }

        .portfolio-modal-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .portfolio-modal-title {
          margin: 0;
          font-size: 22px;
        }

        .portfolio-modal-category {
          color: #777777;
          font-size: 13px;
        }

        .portfolio-modal-description {
          margin: 10px 0 0;
          color: #a0a0a0;
          line-height: 1.6;
        }

        .portfolio-close,
        .portfolio-nav {
          position: absolute;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 999px;
          background: rgba(0,0,0,0.66);
          color: #ffffff;
          cursor: pointer;
          backdrop-filter: blur(8px);
        }

        .portfolio-close {
          top: 14px;
          right: 14px;
          width: 42px;
          height: 42px;
          font-size: 22px;
        }

        .portfolio-nav {
          top: 50%;
          width: 48px;
          height: 48px;
          transform: translateY(-50%);
          font-size: 26px;
        }

        .portfolio-nav-prev {
          left: 14px;
        }

        .portfolio-nav-next {
          right: 14px;
        }

        @media (max-width: 900px) {
          .portfolio-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .portfolio-page {
            padding: 54px 16px 80px;
          }

          .portfolio-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-image-wrap {
            aspect-ratio: 5 / 4;
          }

          .portfolio-modal {
            padding: 10px;
          }

          .portfolio-modal-content {
            max-height: calc(100vh - 20px);
          }

          .portfolio-modal-stage {
            min-height: 300px;
          }

          .portfolio-nav {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>

      <div className="portfolio-inner">
        <header className="portfolio-header">
          <p className="portfolio-kicker">Selected work</p>
          <h1 className="portfolio-title">Portfolio</h1>
          <p className="portfolio-intro">
            A selection of custom tattoo projects by ZKINK. Click any image
            to view it in a larger format.
          </p>
        </header>

        <div className="portfolio-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="portfolio-filter"
              data-active={activeCategory === category}
              onClick={() => {
                setActiveCategory(category);
                setSelectedIndex(null);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredItems.length > 0 ? (
          <div className="portfolio-grid">
            {filteredItems.map((item, index) => (
              <article
                key={item.id}
                className="portfolio-card"
                onClick={() => setSelectedIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedIndex(index);
                  }
                }}
              >
                <div className="portfolio-image-wrap">
                  <img
                  className="portfolio-image"
                  src={item.image}
                  alt={`${item.title} - Black and Grey Tattoo by San Francisco Tattoo Artist ZKINK`}
                  loading="lazy"
                 />
                </div>

                <div className="portfolio-copy">
                  <div className="portfolio-meta">
                    <h2 className="portfolio-item-title">{item.title}</h2>
                    <span className="portfolio-category">{item.category}</span>
                  </div>

                  <p className="portfolio-description">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="portfolio-empty">
            No portfolio items are available in this category yet.
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="portfolio-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() => {
            setSelectedIndex(null);
            setZoomed(false);
          }}
        >
          <div
            className="portfolio-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="portfolio-modal-stage">
              <button
                type="button"
                className="portfolio-close"
                onClick={() => {
                  setSelectedIndex(null);
                  setZoomed(false);
                }}
                aria-label="Close image"
              >
                ×
              </button>

              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    className="portfolio-nav portfolio-nav-prev"
                    onClick={showPrevious}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="portfolio-nav portfolio-nav-next"
                    onClick={showNext}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}

              <img
                className="portfolio-modal-image"
                data-zoomed={zoomed}
                src={selectedItem.image}
                alt={`${selectedItem.title} - Black and Grey Tattoo by San Francisco Tattoo Artist ZKINK`}
                onClick={() => setZoomed((current) => !current)}
              />
            </div>

            <div className="portfolio-modal-copy">
              <div className="portfolio-modal-title-row">
                <h2 className="portfolio-modal-title">{selectedItem.title}</h2>
                <span className="portfolio-modal-category">
                  {selectedItem.category}
                </span>
              </div>

              <p className="portfolio-modal-description">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
