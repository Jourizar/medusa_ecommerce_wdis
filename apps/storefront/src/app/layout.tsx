import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { SITE_NAME } from "@/lib/constants";
import { SITE_URL, absoluteUrl, jsonLd } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "WDIS — Premium Streetwear & Urban Fashion",
    template: "%s | WDIS",
  },
  description:
    "Premium streetwear and urban fashion. Bold designs, limited drops. Shop the latest collection.",
  keywords: ["streetwear", "urban fashion", "premium clothing", "limited drops"],
  authors: [{ name: "WDIS" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WDIS",
    url: "/",
    title: "WDIS — Premium Streetwear & Urban Fashion",
    description: "Bold designs, limited drops. Shop the latest collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WDIS — Premium Streetwear & Urban Fashion",
    description: "Bold designs, limited drops.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior: tells Next to suspend smooth scrolling during route
    // changes (so new pages start at the top instantly).
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-screen bg-cream text-black antialiased"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": absoluteUrl("/#organization"),
                name: SITE_NAME,
                url: SITE_URL,
                logo: absoluteUrl("/icon"),
              },
              {
                "@type": "WebSite",
                "@id": absoluteUrl("/#website"),
                name: SITE_NAME,
                url: SITE_URL,
                publisher: { "@id": absoluteUrl("/#organization") },
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${absoluteUrl("/products")}?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          })}
        />
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
