import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zkinktattoo.com"),

  title: {
    default: "ZKINK | San Francisco Tattoo Artist",
    template: "%s | ZKINK",
  },

  description:
    "Professional San Francisco tattoo artist specializing in Black & Grey realism, fine line tattoos, custom sleeves, and realistic Tattoo Try-On previews.",

  keywords: [
    "San Francisco Tattoo Artist",
    "Black and Grey Tattoo San Francisco",
    "Tattoo Try On",
    "Fine Line Tattoo",
    "Realism Tattoo",
    "Custom Tattoo",
    "Tattoo Sleeve",
    "Bay Area Tattoo",
    "California Tattoo",
    "ZKINK",
    "ZK Tattoo",
    "Tattoo Artist San Francisco",
  ],

  authors: [
    {
      name: "ZKINK",
    },
  ],

  creator: "ZKINK",

  publisher: "ZKINK",

  alternates: {
    canonical: "https://zkinktattoo.com",
  },

  openGraph: {
    title: "ZKINK | San Francisco Tattoo Artist",
    description:
      "Black & Grey realism, fine line tattoos, custom tattoo design, and Tattoo Try-On.",
    url: "https://zkinktattoo.com",
    siteName: "ZKINK",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZKINK Tattoo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ZKINK | San Francisco Tattoo Artist",
    description:
      "Black & Grey realism, custom tattoo design and Tattoo Try-On.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "Tattoo",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "TattooParlor",
  "@id": "https://zkinktattoo.com/#tattoo-parlor",
  name: "ZKINK",
  url: "https://zkinktattoo.com",
  image: "https://zkinktattoo.com/og-image.jpg",
  description:
    "Professional San Francisco tattoo artist specializing in Black & Grey realism, fine line tattoos, custom tattoo designs, and Tattoo Try-On.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    addressCountry: "US",
  },
  areaServed: {
    "@type": "City",
    name: "San Francisco",
  },
  sameAs: [
    "https://www.instagram.com/zk.ink?igsh=NTc4MTIwNjQ2YQ==",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Tattoo Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Black and Grey Tattoo",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Fine Line Tattoo",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Realism Tattoo",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Tattoo Design",
        },
      },
    ],
  },
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://zkinktattoo.com/booking",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-31F2E7VC0G"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', 'G-31F2E7VC0G');
          `}
        </Script>

        <Header />
        {children}
      </body>
    </html>
  );
}
