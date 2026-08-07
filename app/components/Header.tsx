"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" onClick={closeMenu}>
          ZKINK
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/portfolio" className="site-nav-link">Portfolio</Link>
          <Link href="/try-on" className="site-nav-link">Tattoo Try-On</Link>
          <Link href="/booking" className="site-nav-link">Booking</Link>
          <Link href="/#contact" className="site-nav-link">Contact</Link>
        </nav>

        <button
          type="button"
          className="menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-line" />
          <span className="menu-line" />
          <span className="menu-line" />
        </button>
      </div>

      <div className="mobile-menu" data-open={menuOpen}>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/portfolio" onClick={closeMenu}>Portfolio</Link>
          <Link href="/try-on" onClick={closeMenu}>Tattoo Try-On</Link>
          <Link href="/booking" onClick={closeMenu}>Booking</Link>
          <Link href="/#contact" onClick={closeMenu}>Contact</Link>
        </nav>
      </div>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: #050505;
          border-bottom: 1px solid #222222;
        }

        .site-header-inner {
          max-width: 1440px;
          min-height: 84px;
          margin: 0 auto;
          padding: 0 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-sizing: border-box;
        }

        .site-logo {
          color: #ffffff;
          text-decoration: none;
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          flex-shrink: 0;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .site-nav-link {
          color: #ffffff;
          text-decoration: none;
          font-size: 17px;
          white-space: nowrap;
        }

        .menu-button {
          display: none;
          width: 44px;
          height: 44px;
          padding: 10px;
          border: 0;
          background: transparent;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .menu-line {
          display: block;
          width: 23px;
          height: 2px;
          border-radius: 999px;
          background: #ffffff;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 700px) {
          .site-header-inner {
            min-height: 64px;
            padding: 0 18px;
          }

          .site-logo {
            font-size: 24px;
          }

          .desktop-nav {
            display: none;
          }

          .menu-button {
            display: flex;
          }

          .mobile-menu {
            display: grid;
            grid-template-rows: 0fr;
            overflow: hidden;
            border-top: 1px solid transparent;
            transition:
              grid-template-rows 180ms ease,
              border-color 180ms ease;
          }

          .mobile-menu[data-open="true"] {
            grid-template-rows: 1fr;
            border-top-color: #222222;
          }

          .mobile-nav {
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 0 18px;
          }

          .mobile-menu[data-open="true"] .mobile-nav {
            padding-top: 10px;
            padding-bottom: 14px;
          }

          .mobile-nav a {
            display: block;
            padding: 14px 2px;
            border-bottom: 1px solid #1d1d1d;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
          }

          .mobile-nav a:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </header>
  );
}
