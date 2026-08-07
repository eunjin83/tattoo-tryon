"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  {
    src: "/hero/1.JPG",
    alt: "Featured black and grey tattoo artwork",
    position: "center",
  },
  {
    src: "/hero/2.JPG",
    alt: "Featured realistic skull tattoo",
    position: "center",
  },
  {
    src: "/hero/3.JPG",
    alt: "Featured animal realism tattoo",
    position: "center",
  },
];

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="zk-hero">
      <style>{`
        .zk-hero {
          position: relative;
          width: 100%;
          min-height: calc(100svh - 72px);
          overflow: hidden;
          display: grid;
          place-items: center;
          background: #050505;
          color: #ffffff;
          isolation: isolate;
        }

        .zk-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transform: scale(1.035);
          transition:
            opacity 1200ms ease,
            transform 6500ms ease;
          z-index: -4;
        }

        .zk-hero-image[data-active="true"] {
          opacity: 1;
          transform: scale(1.09);
        }

        .zk-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.36) 0%,
              rgba(0, 0, 0, 0.48) 50%,
              rgba(0, 0, 0, 0.78) 100%
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.46) 0%,
              rgba(0, 0, 0, 0.12) 50%,
              rgba(0, 0, 0, 0.46) 100%
            );
        }

        .zk-hero-content {
          width: min(920px, calc(100% - 40px));
          margin: 0 auto;
          padding: 92px 0 110px;
          text-align: center;
        }

        .zk-hero-kicker {
          margin: 0 0 16px;
          font-size: 12px;
          line-height: 1;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .zk-hero-title {
          margin: 0;
          font-size: clamp(52px, 10vw, 112px);
          line-height: 0.92;
          letter-spacing: -0.055em;
          font-weight: 650;
          text-shadow: 0 8px 30px rgba(0, 0, 0, 0.34);
        }

        .zk-hero-subtitle {
          max-width: 680px;
          margin: 26px auto 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.65;
          text-shadow: 0 3px 16px rgba(0, 0, 0, 0.6);
        }

        .zk-hero-actions {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 38px;
        }

        .zk-hero-button {
          min-width: 178px;
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 13px 25px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition:
            transform 180ms ease,
            background 180ms ease,
            border-color 180ms ease;
        }

        .zk-hero-button:hover {
          transform: translateY(-2px);
        }

        .zk-hero-button-primary {
          background: #ffffff;
          color: #111111;
          border: 1px solid #ffffff;
        }

        .zk-hero-button-primary:hover {
          background: #e8e8e8;
          border-color: #e8e8e8;
        }

        .zk-hero-button-secondary {
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.55);
          background: rgba(8, 8, 8, 0.34);
          backdrop-filter: blur(8px);
        }

        .zk-hero-button-secondary:hover {
          border-color: #ffffff;
          background: rgba(8, 8, 8, 0.52);
        }

        .zk-hero-pagination {
          position: absolute;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .zk-hero-dot {
          width: 28px;
          height: 3px;
          border: 0;
          border-radius: 999px;
          padding: 0;
          background: rgba(255, 255, 255, 0.32);
          cursor: pointer;
          transition:
            background 200ms ease,
            width 200ms ease;
        }

        .zk-hero-dot[data-active="true"] {
          width: 44px;
          background: #ffffff;
        }

        @media (max-width: 720px) {
          .zk-hero {
            min-height: calc(100svh - 116px);
          }

          .zk-hero-content {
            padding: 76px 0 96px;
          }

          .zk-hero-title {
            font-size: clamp(48px, 18vw, 78px);
          }

          .zk-hero-subtitle {
            margin-top: 20px;
          }

          .zk-hero-actions {
            width: 100%;
            margin-top: 30px;
          }

          .zk-hero-button {
            width: min(100%, 330px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .zk-hero-image,
          .zk-hero-button,
          .zk-hero-dot {
            transition: none;
          }

          .zk-hero-image[data-active="true"] {
            transform: scale(1);
          }
        }
      `}</style>

      {heroImages.map((image, index) => (
        <img
          key={image.src}
          className="zk-hero-image"
          data-active={index === activeImage}
          src={image.src}
          alt={index === activeImage ? image.alt : ""}
          aria-hidden={index !== activeImage}
          style={{ objectPosition: image.position }}
        />
      ))}

      <div className="zk-hero-overlay" />

      <div className="zk-hero-content">
        <p className="zk-hero-kicker">San Francisco Tattoo Artist</p>

        <h1 className="zk-hero-title">ZKINK</h1>

        <p className="zk-hero-subtitle">
          Explore selected tattoo work and book your next custom tattoo with ZKINK.
        </p>

        <div className="zk-hero-actions">
          <Link
            href="/booking"
            className="zk-hero-button zk-hero-button-primary"
          >
            Book Appointment
          </Link>

          <Link
            href="/portfolio"
            className="zk-hero-button zk-hero-button-secondary"
          >
            View Portfolio
          </Link>
        </div>
      </div>

      <div className="zk-hero-pagination" aria-label="Featured images">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            className="zk-hero-dot"
            data-active={index === activeImage}
            aria-label={`Show featured image ${index + 1}`}
            aria-pressed={index === activeImage}
            onClick={() => setActiveImage(index)}
          />
        ))}
      </div>
    </section>
  );
}
