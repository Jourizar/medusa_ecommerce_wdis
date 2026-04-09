import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
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
  title: {
    default: "URBN — Premium Streetwear & Urban Fashion",
    template: "%s | URBN",
  },
  description:
    "Premium streetwear and urban fashion. Bold designs, limited drops. Shop the latest collection.",
  keywords: ["streetwear", "urban fashion", "premium clothing", "limited drops"],
  authors: [{ name: "URBN" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "URBN",
    title: "URBN — Premium Streetwear & Urban Fashion",
    description: "Bold designs, limited drops. Shop the latest collection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "URBN — Premium Streetwear & Urban Fashion",
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        <ConvexClientProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
