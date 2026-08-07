"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          ZKINK
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/portfolio" className="site-nav-link">
            Portfolio
          </Link>

          <Link href="/try-on" className="site-nav-link">
            Tattoo Try-On
          </Link>

          <Link href="/booking" className="site-nav-link">
            Booking
          </Link>

          <Link href="/#contact" className="site-nav-link">
            Contact
          </Link>
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

        .site-nav {
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

        @media (max-width: 700px) {
          .site-header-inner {
            min-height: auto;
            padding: 14px 16px 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .site-logo {
            font-size: 24px;
          }

          .site-nav {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            align-items: center;
          }

          .site-nav-link {
            min-width: 0;
            text-align: center;
            font-size: 12px;
            line-height: 1.25;
            white-space: nowrap;
          }
        }

        @media (max-width: 390px) {
          .site-header-inner {
            padding-left: 12px;
            padding-right: 12px;
          }

          .site-nav {
            gap: 4px;
          }

          .site-nav-link {
            font-size: 11px;
          }
        }
      `}</style>
    </header>
  );
}
