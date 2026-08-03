"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        background: "#050505",
        borderBottom: "1px solid #222222",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          minHeight: "84px",
          margin: "0 auto",
          padding: "0 44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          ZKINK
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "34px",
          }}
        >
          <Link href="/portfolio" style={linkStyle}>
            Portfolio
          </Link>

          <Link href="/try-on" style={linkStyle}>
            Tattoo Try-On
          </Link>

          <Link href="/booking" style={linkStyle}>
            Booking
          </Link>

          <Link href="/#contact" style={linkStyle}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "17px",
  whiteSpace: "nowrap" as const,
};